use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::process::{Command, Stdio};
use std::sync::mpsc;
use std::thread;
use std::time::Duration;

const DEFAULT_CHECKPOINTS_DIR: &str = r"D:\Obsidian\IA e Aprendizado de Maquina\Checkpoints";

#[derive(Debug, Serialize, Deserialize)]
pub struct ExecutionResult {
    pub stdout: String,
    pub stderr: String,
    pub exit_code: Option<i32>,
    pub timed_out: bool,
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ObsidianState {
    pub checkpoints_dir: String,
    pub ultimo_checkpoint_id: String,
    pub proximo_checkpoint_id: String,
    pub ultimo_checkpoint_md: String,
    pub proximo_passo: String,
    pub checkpoints_concluidos: Vec<String>,
}

#[tauri::command]
fn execute_python_code(code: String) -> ExecutionResult {
    let dangerous_patterns = [
        "os.system('rm", "os.system(\"rm",
        "shutil.rmtree",
        "format C:", "format c:",
        "subprocess.Popen(['rm'", "subprocess.Popen([\"rm\"",
    ];

    for pattern in dangerous_patterns {
        if code.contains(pattern) {
            return ExecutionResult {
                stdout: String::new(),
                stderr: format!("Bloqueio de Segurança: Chamada perigosa detectada ({})", pattern),
                exit_code: Some(1),
                timed_out: false,
                error: Some("Código bloqueado por segurança".into()),
            };
        }
    }

    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        let child = match Command::new("python")
            .arg("-c")
            .arg(&code)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
        {
            Ok(c) => c,
            Err(e) => {
                let _ = tx.send(Err(format!("Falha ao invocar executável python: {}", e)));
                return;
            }
        };

        match child.wait_with_output() {
            Ok(output) => {
                let stdout = String::from_utf8_lossy(&output.stdout).to_string();
                let stderr = String::from_utf8_lossy(&output.stderr).to_string();
                let exit_code = output.status.code();
                let _ = tx.send(Ok((stdout, stderr, exit_code)));
            }
            Err(e) => {
                let _ = tx.send(Err(format!("Erro ao aguardar processo: {}", e)));
            }
        }
    });

    match rx.recv_timeout(Duration::from_secs(5)) {
        Ok(Ok((stdout, stderr, exit_code))) => ExecutionResult {
            stdout,
            stderr,
            exit_code,
            timed_out: false,
            error: None,
        },
        Ok(Err(err_msg)) => ExecutionResult {
            stdout: String::new(),
            stderr: String::new(),
            exit_code: Some(1),
            timed_out: false,
            error: Some(err_msg),
        },
        Err(mpsc::RecvTimeoutError::Timeout) => ExecutionResult {
            stdout: String::new(),
            stderr: "TimeoutError: O código excedeu o tempo limite de execução (5.0s). Verifique loops infinitos.".into(),
            exit_code: Some(124),
            timed_out: true,
            error: Some("Timeout excedido".into()),
        },
        Err(mpsc::RecvTimeoutError::Disconnected) => ExecutionResult {
            stdout: String::new(),
            stderr: "Erro interno no canal de subprocesso.".into(),
            exit_code: Some(1),
            timed_out: false,
            error: Some("Canal desconectado".into()),
        },
    }
}

#[tauri::command]
fn get_obsidian_state() -> ObsidianState {
    let dir = PathBuf::from(DEFAULT_CHECKPOINTS_DIR);
    let _ = fs::create_dir_all(&dir);

    let mut arquivos_md: Vec<(u32, PathBuf, String)> = Vec::new();

    if let Ok(entries) = fs::read_dir(&dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.extension().and_then(|e| e.to_str()) == Some("md") {
                if let Some(stem) = path.file_stem().and_then(|s| s.to_str()) {
                    let parts: Vec<&str> = stem.splitn(2, '_').collect();
                    if let Ok(num) = parts[0].parse::<u32>() {
                        arquivos_md.push((num, path.clone(), stem.to_string()));
                    }
                }
            }
        }
    }

    arquivos_md.sort_by_key(|k| k.0);

    let checkpoints_concluidos: Vec<String> = arquivos_md.iter().map(|x| x.2.clone()).collect();

    if let Some((maior_num, ultimo_path, _)) = arquivos_md.last() {
        let conteudo = fs::read_to_string(ultimo_path).unwrap_or_else(|_| "NENHUM".to_string());
        let mut proximo_passo = "Próximo conceito atômico da trilha".to_string();

        for line in conteudo.lines() {
            if let Some(idx) = line.find("**Próximo Passo Desbloqueado:**") {
                let after = &line[idx + "**Próximo Passo Desbloqueado:**".len()..];
                proximo_passo = after.trim().to_string();
            }
        }

        ObsidianState {
            checkpoints_dir: DEFAULT_CHECKPOINTS_DIR.replace('\\', "/"),
            ultimo_checkpoint_id: format!("{:03}", maior_num),
            proximo_checkpoint_id: format!("{:03}", maior_num + 1),
            ultimo_checkpoint_md: conteudo,
            proximo_passo,
            checkpoints_concluidos,
        }
    } else {
        ObsidianState {
            checkpoints_dir: DEFAULT_CHECKPOINTS_DIR.replace('\\', "/"),
            ultimo_checkpoint_id: "000".to_string(),
            proximo_checkpoint_id: "001".to_string(),
            ultimo_checkpoint_md: "NENHUM".to_string(),
            proximo_passo: "Fase 1.1: Variáveis, Alocação de Memória em CPython e Ponteiros".to_string(),
            checkpoints_concluidos,
        }
    }
}

#[tauri::command]
fn save_checkpoint_block(raw_text: String) -> Result<String, String> {
    let start_tag = "<<<START_CHECKPOINT_FILE>>>";
    let end_tag = "<<<END_CHECKPOINT_FILE>>>";

    let start_idx = raw_text
        .find(start_tag)
        .ok_or_else(|| "Delimitador <<<START_CHECKPOINT_FILE>>> não encontrado".to_string())?;
    let end_idx = raw_text
        .find(end_tag)
        .ok_or_else(|| "Delimitador <<<END_CHECKPOINT_FILE>>> não encontrado".to_string())?;

    if end_idx <= start_idx {
        return Err("Delimitadores de checkpoint malformados".into());
    }

    let inner = raw_text[start_idx + start_tag.len()..end_idx].trim();
    let mut lines = inner.lines();

    let first_line = lines.next().unwrap_or("").trim();
    let (target_path, markdown_body) = if let Some(stripped) = first_line.strip_prefix("TARGET_PATH:") {
        let p = PathBuf::from(stripped.trim());
        let body: Vec<&str> = lines.collect();
        (p, body.join("\n").trim().to_string())
    } else {
        let state = get_obsidian_state();
        let fallback = PathBuf::from(DEFAULT_CHECKPOINTS_DIR)
            .join(format!("{}_checkpoint.md", state.proximo_checkpoint_id));
        (fallback, inner.to_string())
    };

    if let Some(parent) = target_path.parent() {
        fs::create_dir_all(parent).map_err(|e| format!("Erro ao criar diretório: {}", e))?;
    }

    fs::write(&target_path, format!("{}\n", markdown_body))
        .map_err(|e| format!("Erro ao salvar checkpoint no Obsidian: {}", e))?;

    Ok(target_path.to_string_lossy().to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            execute_python_code,
            get_obsidian_state,
            save_checkpoint_block
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
