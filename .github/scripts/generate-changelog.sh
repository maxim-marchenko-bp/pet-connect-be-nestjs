#!/usr/bin/env bash
set -euo pipefail

: "${PR_NUMBER:?}"
: "${PR_TITLE:?}"
: "${PR_URL:?}"
: "${PR_AUTHOR:?}"
PR_BODY="${PR_BODY:-}"
PR_DIFF="${PR_DIFF:-}"

PROMPT_FILE="$(mktemp)"
trap 'rm -f "$PROMPT_FILE"' EXIT

cat > "$PROMPT_FILE" <<PROMPT
You write concise CHANGELOG.md entries for a NestJS backend project.
Given a merged pull request's title, description, and diff, output 1-3 short bullet points
(each starting with "- ") describing the user-facing or developer-facing changes, in plain past-tense English.
Do not include headings, PR links, author names, or any preamble/explanation - output only the bullet points.

PR Title: ${PR_TITLE}

PR Description:
${PR_BODY}

Diff:
${PR_DIFF:0:20000}
PROMPT

NOTES="$(claude -p "$(cat "$PROMPT_FILE")" --output-format text --permission-mode bypassPermissions --max-turns 5)"

if [ -z "$NOTES" ]; then
  NOTES="- ${PR_TITLE}"
fi

DATE="$(date -u +%Y-%m-%d)"
CHANGELOG="CHANGELOG.md"

if [ ! -f "$CHANGELOG" ]; then
  printf '# Changelog\n' > "$CHANGELOG"
fi

ENTRY_FILE="$(mktemp)"
trap 'rm -f "$PROMPT_FILE" "$ENTRY_FILE"' EXIT

{
  echo ""
  echo "## ${DATE}"
  echo ""
  echo "$NOTES"
  echo ""
  echo "_PR [#${PR_NUMBER}](${PR_URL}) by @${PR_AUTHOR}_"
} > "$ENTRY_FILE"

awk -v entryfile="$ENTRY_FILE" '
  NR==1 { print; while ((getline line < entryfile) > 0) print line; next }
  { print }
' "$CHANGELOG" > "$CHANGELOG.tmp"

mv "$CHANGELOG.tmp" "$CHANGELOG"
