const fs = require('fs');

const input = JSON.parse(fs.readFileSync(0, 'utf8'));

const CHECK_TOOLS = ["Read", "Write", "Edit"];

const toolName = input.tool_name;
const toolInput = input.tool_input ?? {};

if (CHECK_TOOLS.includes(toolName)) {
  const filePath = toolInput.file_path ?? '';

  if (filePath.includes('.env')) {
    console.error('Claude Code not allowed to read .env files');
    process.exit(2);
  }
}

process.exit(0);
