#!/usr/bin/env python3
"""
PyTutor Agent - Orquestrador de Tutoria Socrática de Python para IA (3.10+)
Zero Caixa-Preta: Da Sintaxe Básica à Derivada, da Derivada ao Código Linha a Linha.
"""

from __future__ import annotations

import argparse
import datetime
import os
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

# Configuração de caminhos padrão
DEFAULT_OBSIDIAN_BASE = Path(r"D:\Obsidian")
DEFAULT_CHECKPOINTS_DIR = DEFAULT_OBSIDIAN_BASE / "IA e Aprendizado de Maquina" / "Checkpoints"
DEFAULT_PROJECT_NOTE = DEFAULT_OBSIDIAN_BASE / "IA e Aprendizado de Maquina" / "Projetos" / "PyTutor Agent" / "PyTutor Agent.md"

CHECKPOINT_START_DELIMITER = "<<<START_CHECKPOINT_FILE>>>"
CHECKPOINT_END_DELIMITER = "<<<END_CHECKPOINT_FILE>>>"


@dataclass
class CheckpointMeta:
    checkpoint_id: str
    numeric_id: int
    topico: str
    fase_curricular: str
    proximo_passo: str
    caminho_arquivo: Path
    conteudo_completo: str


class CheckpointManager:
    """Gerencia a leitura, descoberta e persistência de checkpoints do Obsidian."""

    def __init__(self, checkpoints_dir: Path = DEFAULT_CHECKPOINTS_DIR):
        self.checkpoints_dir = Path(checkpoints_dir)
        self.checkpoints_dir.mkdir(parents=True, exist_ok=True)

    def obter_ultimo_checkpoint(self) -> Optional[CheckpointMeta]:
        """Varre o diretório e localiza o checkpoint com maior numeração."""
        arquivos = sorted(self.checkpoints_dir.glob("*.md"))
        if not arquivos:
            return None

        checkpoints: list[tuple[int, Path]] = []
        padrao = re.compile(r"^(\d{3,})_(.+)\.md$")

        for arq in arquivos:
            match = padrao.match(arq.name)
            if match:
                checkpoints.append((int(match.group(1)), arq))

        if not checkpoints:
            return None

        checkpoints.sort(key=lambda x: x[0])
        maior_id, caminho_ultimo = checkpoints[-1]

        conteudo = caminho_ultimo.read_text(encoding="utf-8")
        
        # Parse básico do frontmatter e seções
        topico_match = re.search(r'topico:\s*["\']?([^"\']+)["\']?', conteudo)
        fase_match = re.search(r'fase_curricular:\s*["\']?([^"\']+)["\']?', conteudo)
        prox_match = re.search(r'\*\*Próximo Passo Desbloqueado:\*\*\s*([^\n\r]+)', conteudo)

        return CheckpointMeta(
            checkpoint_id=f"{maior_id:03d}",
            numeric_id=maior_id,
            topico=topico_match.group(1).strip() if topico_match else "Desconhecido",
            fase_curricular=fase_match.group(1).strip() if fase_match else "Fase 1",
            proximo_passo=prox_match.group(1).strip() if prox_match else "Conceito subsequente",
            caminho_arquivo=caminho_ultimo,
            conteudo_completo=conteudo,
        )

    def proximo_checkpoint_id(self) -> str:
        ultimo = self.obter_ultimo_checkpoint()
        if not ultimo:
            return "001"
        return f"{ultimo.numeric_id + 1:03d}"

    def salvar_checkpoint_do_bloco(self, bloco_texto: str) -> Optional[Path]:
        """
        Extrai o conteúdo emitido entre os delimitadores canônicos e grava no Obsidian.
        """
        if CHECKPOINT_START_DELIMITER not in bloco_texto or CHECKPOINT_END_DELIMITER not in bloco_texto:
            return None

        padrao = re.compile(
            re.escape(CHECKPOINT_START_DELIMITER)
            + r"\s*(?:TARGET_PATH:\s*([^\r\n]+))?\s*(.*?)"
            + re.escape(CHECKPOINT_END_DELIMITER),
            re.DOTALL,
        )
        match = padrao.search(bloco_texto)
        if not match:
            return None

        target_path_raw = match.group(1)
        conteudo_md = match.group(2).strip()

        if target_path_raw:
            destino = Path(target_path_raw.strip())
        else:
            # Fallback seguro
            cid = self.proximo_checkpoint_id()
            destino = self.checkpoints_dir / f"{cid}_checkpoint.md"

        destino.parent.mkdir(parents=True, exist_ok=True)
        destino.write_text(conteudo_md + "\n", encoding="utf-8")
        return destino


class PayloadBuilder:
    """Monta a tag XML <session_payload> rigorosamente padronizada."""

    def __init__(self, manager: CheckpointManager):
        self.manager = manager

    def construir(
        self,
        comando: str = "ESTUDO",
        codigo_aluno: str = "",
        terminal_output: str = "",
    ) -> str:
        ultimo = self.manager.obter_ultimo_checkpoint()
        data_atual = datetime.date.today().strftime("%Y-%m-%d")
        caminho_destino = str(self.manager.checkpoints_dir).replace("\\", "/")

        if ultimo:
            conteudo_ultimo = ultimo.conteudo_completo.strip()
        else:
            conteudo_ultimo = "NENHUM"

        return f"""<session_payload>
  <caminho_destino_md>{caminho_destino}</caminho_destino_md>
  <data_atual>{data_atual}</data_atual>
  <ultimo_checkpoint_md>
{conteudo_ultimo}
  </ultimo_checkpoint_md>
  <comando>{comando}</comando>
  <codigo_aluno>
{codigo_aluno}
  </codigo_aluno>
  <terminal_output>
{terminal_output}
  </terminal_output>
</session_payload>"""


def main():
    parser = argparse.ArgumentParser(description="PyTutor Agent - Harness CLI")
    parser.add_argument("--status", action="store_true", help="Mostra o status do currículo e último checkpoint.")
    parser.add_argument("--payload", action="store_true", help="Gera e imprime o <session_payload> atual.")
    parser.add_argument("--comando", default="ESTUDO", choices=["ESTUDO", "/checkpoint"], help="Comando enviado.")
    parser.add_argument("--codigo", default="", help="Código Python submetido pelo aluno.")
    parser.add_argument("--terminal", default="", help="Saída de stdout ou Traceback copiado do terminal.")
    args = parser.parse_args()

    manager = CheckpointManager()
    ultimo = manager.obter_ultimo_checkpoint()

    if args.status:
        print("=" * 60)
        print("🤖 PyTutor Agent - Status da Trilha de Aprendizado")
        print("=" * 60)
        if ultimo:
            print(f"Último Checkpoint Salvo: {ultimo.checkpoint_id} ({ultimo.caminho_arquivo.name})")
            print(f"Fase Curricular:        {ultimo.fase_curricular}")
            print(f"Tópico Dominado:        {ultimo.topico}")
            print(f"Próximo Passo:          {ultimo.proximo_passo}")
            print(f"Próximo Checkpoint ID:  {manager.proximo_checkpoint_id()}")
        else:
            print("Nenhum checkpoint encontrado.")
            print("Estado: BOOTSTRAPPING (Início na Fase 1.1)")
            print("Próximo Checkpoint ID: 001")
        print("=" * 60)
        return

    builder = PayloadBuilder(manager)
    payload = builder.construir(
        comando=args.comando,
        codigo_aluno=args.codigo,
        terminal_output=args.terminal,
    )

    if args.payload:
        print(payload)
        return

    # Execução interativa padrão
    print("=" * 60)
    print("🤖 PyTutor Agent - Sistema Operacional de Tutoria Socrática")
    print("=" * 60)
    print(f"Diretório Obsidian: {manager.checkpoints_dir}")
    if ultimo:
        print(f"Retomando de: Checkpoint {ultimo.checkpoint_id} - {ultimo.topico}")
        print(f"Próximo Tópico: {ultimo.proximo_passo}")
    else:
        print("Iniciando Fase 1.1: Variáveis, Memória e Mecânica de CPython")
    print("-" * 60)
    print("Payload gerado com sucesso para a sessão atual. Use --payload para inspecionar.")


if __name__ == "__main__":
    main()
