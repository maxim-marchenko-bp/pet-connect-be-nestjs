#!/usr/bin/env bash
set -euo pipefail

: "${ENTRY_ID:?}"
: "${ENTRY_TITLE:?}"
: "${ENTRY_URL:?}"
: "${ENTRY_AUTHOR:?}"
ENTRY_KIND="${ENTRY_KIND:-pr}"
ENTRY_BODY="${ENTRY_BODY:-}"
ENTRY_DIFF="${ENTRY_DIFF:-}"

PROMPT_FILE="$(mktemp)"
trap 'rm -f "$PROMPT_FILE"' EXIT

cat > "$PROMPT_FILE" <<PROMPT
You write concise CHANGELOG.md entries for a NestJS backend project.
Given a merged pull request's title, description, and diff, output 1-3 short bullet points
(each starting with "- ") describing the user-facing or developer-facing changes, in plain past-tense English.
Do not include headings, PR links, author names, or any preamble/explanation - output only the bullet points.

PR Title: ${ENTRY_TITLE}

PR Description:
${ENTRY_BODY}

Diff:
${ENTRY_DIFF:0:20000}
PROMPT

NOTES="$(claude -p "$(cat "$PROMPT_FILE")" --output-format text --permission-mode bypassPermissions --max-turns 5)"

if [ -z "$NOTES" ]; then
  NOTES="- ${ENTRY_TITLE}"
fi

DATE="$(date -u +%Y-%m-%d)"
CHANGELOG="CHANGELOG.md"

if [ ! -f "$CHANGELOG" ]; then
  printf '# Changelog\n' > "$CHANGELOG"
fi

ENTRY_FILE="$(mktemp)"
trap 'rm -f "$PROMPT_FILE" "$ENTRY_FILE"' EXIT

if [ "$ENTRY_KIND" = "commit" ]; then
  FOOTER="_Commit [${ENTRY_ID:0:7}](${ENTRY_URL}) by @${ENTRY_AUTHOR}_"
else
  FOOTER="_PR [#${ENTRY_ID}](${ENTRY_URL}) by @${ENTRY_AUTHOR}_"
fi

{
  echo ""
  echo "## ${DATE}"
  echo ""
  echo "$NOTES"
  echo ""
  echo "$FOOTER"
} > "$ENTRY_FILE"

awk -v entryfile="$ENTRY_FILE" '
  NR==1 { print; while ((getline line < entryfile) > 0) print line; next }
  { print }
' "$CHANGELOG" > "$CHANGELOG.tmp"

mv "$CHANGELOG.tmp" "$CHANGELOG"
