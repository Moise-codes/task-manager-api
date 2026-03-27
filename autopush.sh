#!/bin/bash

set -euo pipefail

REPO_PATH="${REPO_PATH:-$(pwd)}"
BRANCH="${BRANCH:-master}"
COMMITS_PER_DAY="${COMMITS_PER_DAY:-7}"
LOG_FILE="${LOG_FILE:-$HOME/.autopush.log}"
MIN_DELAY=60
MAX_DELAY=300

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
DIM='\033[2m'
RESET='\033[0m'
BOLD='\033[1m'

line()    { echo -e "${DIM}────────────────────────────────────────────────${RESET}"; }
success() { echo -e "${GREEN}  ✔  ${RESET}$1"; }
info()    { echo -e "${CYAN}  ℹ  ${RESET}$1"; }
warn()    { echo -e "${YELLOW}  ⚠  ${RESET}$1"; }
error()   { echo -e "${RED}  ✖  ${RESET}$1"; }
step()    { echo -e "${BLUE}  →  ${RESET}${BOLD}$1${RESET}"; }

MESSAGES=(
  "fix: resolve minor edge case in handler"
  "refactor: clean up unused variables"
  "docs: update inline code comments"
  "chore: routine maintenance and cleanup"
  "style: improve code formatting"
  "test: add missing test coverage"
  "perf: optimize repeated logic"
  "fix: handle null reference correctly"
  "docs: improve README section"
  "chore: remove deprecated methods"
  "refactor: simplify conditional blocks"
  "fix: correct typo in error message"
  "style: align with project style guide"
  "perf: reduce redundant operations"
  "test: update test fixtures and mocks"
  "chore: update gitignore entries"
  "fix: correct off-by-one error"
  "refactor: extract helper function"
  "docs: add usage examples"
  "chore: sync local config with remote"
  "fix: prevent duplicate processing"
  "refactor: rename for clarity"
  "test: cover edge cases in utils"
  "perf: cache repeated lookups"
  "docs: clarify setup instructions"
)

FILES=(
  "notes.md"
  "TODO.md"
  "CHANGELOG.md"
  "docs/updates.md"
  "logs/activity.log"
  "docs/notes.md"
  "tmp/session.log"
)

rand_between() {
  local min=$1
  local max=$2
  echo $(( RANDOM % (max - min + 1) + min ))
}

log() {
  local msg="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
  echo "$msg" >> "$LOG_FILE"
  echo -e "$1"
}

banner() {
  echo ""
  echo -e "${CYAN}${BOLD}"
  echo "  ╔═══════════════════════════════════╗"
  echo "  ║      AUTOPUSH  v2.0.0             ║"
  echo "  ║      Git Auto-Commit Tool         ║"
  echo "  ╚═══════════════════════════════════╝"
  echo -e "${RESET}"
}

preflight() {
  step "Running preflight checks..."

  if ! command -v git &>/dev/null; then
    error "Git is not installed. Please install git first."
    exit 1
  fi

  success "Git found: $(git --version)"

  if [[ ! -d "$REPO_PATH" ]]; then
    error "Repo path not found: $REPO_PATH"
    exit 1
  fi

  success "Repo path: $REPO_PATH"
  cd "$REPO_PATH"

  if ! git rev-parse --is-inside-work-tree &>/dev/null; then
    error "Not a git repository: $REPO_PATH"
    exit 1
  fi

  success "Valid git repository"

  if ! git remote get-url origin &>/dev/null; then
    error "No remote 'origin' configured."
    exit 1
  fi

  success "Remote origin: $(git remote get-url origin)"

  # Ensure directories exist
  mkdir -p docs logs tmp

  # Ensure all files exist
  for f in "${FILES[@]}"; do
    if [[ ! -f "$f" ]]; then
      mkdir -p "$(dirname "$f")"
      touch "$f"
    fi
  done

  success "File structure ready"
  echo ""
}

run_commits() {
  banner
  preflight

  line
  info "Starting auto-commit session"
  info "Repo   : $REPO_PATH"
  info "Branch : $BRANCH"
  info "Commits: $COMMITS_PER_DAY"
  info "Date   : $(date '+%Y-%m-%d')"
  line
  echo ""

  local success_count=0
  local fail_count=0

  for i in $(seq 1 "$COMMITS_PER_DAY"); do
    local msg="${MESSAGES[$RANDOM % ${#MESSAGES[@]}]}"
    local file="${FILES[$RANDOM % ${#FILES[@]}]}"
    local delay
    delay=$(rand_between "$MIN_DELAY" "$MAX_DELAY")

    echo -e "  ${WHITE}[${i}/${COMMITS_PER_DAY}]${RESET} ${BOLD}${msg}${RESET}"
    echo -e "        ${DIM}file: ${file}${RESET}"

    # Append unique content
    echo "<!-- session: $(date '+%Y-%m-%d %H:%M:%S') | commit $i | rand: $RANDOM -->" >> "$file"

    if git add "$file" && git commit -m "$msg" --quiet; then
      success "Committed successfully"
      log "COMMIT $i/$COMMITS_PER_DAY: $msg"
      ((success_count++))
    else
      warn "Commit $i failed or nothing to commit"
      log "FAILED $i/$COMMITS_PER_DAY: $msg"
      ((fail_count++))
    fi

    if [[ $i -lt $COMMITS_PER_DAY ]]; then
      echo -e "        ${DIM}waiting ${delay}s before next commit...${RESET}"
      sleep "$delay"
    fi

    echo ""
  done

  line
  step "Pushing to origin/$BRANCH..."

  if git push origin "$BRANCH" --quiet; then
    success "All commits pushed to origin/$BRANCH"
    log "PUSH: $success_count commits pushed to $BRANCH"
  else
    error "Push failed. Check credentials and remote URL."
    log "PUSH FAILED: check credentials"
    exit 1
  fi

  line
  echo ""
  echo -e "  ${GREEN}${BOLD}Session complete!${RESET}"
  echo -e "  ${WHITE}✔ Committed : ${success_count}${RESET}"
  [[ $fail_count -gt 0 ]] && echo -e "  ${YELLOW}⚠ Skipped   : ${fail_count}${RESET}"
  echo -e "  ${DIM}Log file   : ${LOG_FILE}${RESET}"
  echo ""
}

show_help() {
  banner
  echo -e "  ${WHITE}${BOLD}USAGE${RESET}"
  echo -e "    ./autopush.sh ${CYAN}[command]${RESET}"
  echo ""
  echo -e "  ${WHITE}${BOLD}COMMANDS${RESET}"
  echo -e "    ${CYAN}run${RESET}        Commit & push $COMMITS_PER_DAY times right now"
  echo -e "    ${CYAN}help${RESET}       Show this help screen"
  echo ""
  line
}

case "${1:-help}" in
  run) run_commits ;;
  help|*) show_help ;;
esac