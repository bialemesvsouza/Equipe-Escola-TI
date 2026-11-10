#!/usr/bin/env bash
# Clona (ou atualiza) os repositórios do MindLiner ao lado deste.
# Uso: ./scripts/clonar-repos.sh   (a partir da pasta Equipe-Escola-TI)
set -euo pipefail

raiz="$(cd "$(dirname "$0")/.." && pwd)"
pai="$(dirname "$raiz")"

clonar() {
  local nome="$1" url="$2" destino="$pai/$1"
  if [ -d "$destino/.git" ]; then
    echo "Atualizando $nome..."
    git -C "$destino" pull --ff-only
  else
    echo "Clonando $nome..."
    git clone "$url" "$destino"
  fi
}

clonar BackEnd_ML       https://github.com/bialemesvsouza/BackEnd_ML.git
clonar FrontEnd_ML      https://github.com/bialemesvsouza/FrontEnd_ML.git
clonar MindLiner-Mobile https://github.com/IrinXD/MindLiner-Mobile.git

echo "Pronto. Abra MindLiner.code-workspace no VS Code."
