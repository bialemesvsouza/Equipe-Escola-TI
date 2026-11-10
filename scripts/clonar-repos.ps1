# Clona (ou atualiza) os repositórios do MindLiner ao lado deste.
# Uso: .\scripts\clonar-repos.ps1   (a partir da pasta Equipe-Escola-TI)

$ErrorActionPreference = "Stop"
$raiz = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$pai  = Split-Path -Parent $raiz

$repos = @(
  @{ Nome = "BackEnd_ML";       Url = "https://github.com/bialemesvsouza/BackEnd_ML.git" },
  @{ Nome = "FrontEnd_ML";      Url = "https://github.com/bialemesvsouza/FrontEnd_ML.git" },
  @{ Nome = "MindLiner-Mobile"; Url = "https://github.com/IrinXD/MindLiner-Mobile.git" }
)

foreach ($r in $repos) {
  $destino = Join-Path $pai $r.Nome
  if (Test-Path (Join-Path $destino ".git")) {
    Write-Host "Atualizando $($r.Nome)..."
    git -C $destino pull --ff-only
  } else {
    Write-Host "Clonando $($r.Nome)..."
    git clone $r.Url $destino
  }
}

Write-Host "Pronto. Abra MindLiner.code-workspace no VS Code."
