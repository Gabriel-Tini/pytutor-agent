use serde::{Deserialize, Serialize};
use std::process::{Command, Stdio};
use std::sync::mpsc;
use std::thread;
use std::time::Duration;

#[derive(Debug, Serialize, Deserialize)]
pub struct ExecutionResult {
    pub stdout: String,
    pub stderr: String,
    pub exit_code: Option<i32>,
    pub timed_out: bool,
    pub error: Option<String>,
}

#[tauri::command]
fn execute_python_code(code: String) -> ExecutionResult {
    // Validador de comandos destrutivos no código do aluno (Regra de segurança)
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

    // Timeout estrito de 5 segundos
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![execute_python_code])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
