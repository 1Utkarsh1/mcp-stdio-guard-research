import fs from 'node:fs';
import path from 'node:path';
import { initializeResult, startFixtureServer, writeFrame } from './_mcp-fixture-lib.mjs';

const stateFile = process.env.MCP_STDIO_GUARD_FIXTURE_STATE || '';
const runNumber = nextRunNumber(stateFile);
const evenRun = runNumber % 2 === 0;
const capabilities = evenRun ? { tools: {}, resources: {} } : { tools: {} };

startFixtureServer({
  name: 'research-capability-drift-server',
  capabilities,
  tools: toolsForRun(evenRun),
  onInitialize(message) {
    writeFrame({
      jsonrpc: '2.0',
      id: message.id,
      result: initializeResult(message, {
        name: 'research-capability-drift-server',
        capabilities
      })
    });
    return true;
  },
  onResourcesList(message) {
    writeFrame({
      jsonrpc: '2.0',
      id: message.id,
      result: { resources: evenRun ? [{ uri: 'memory://run-two' }] : [] }
    });
    return true;
  }
});

function nextRunNumber(file) {
  if (!file) return 1;
  let current = 0;
  try {
    current = Number.parseInt(fs.readFileSync(file, 'utf8'), 10) || 0;
  } catch {
    current = 0;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, String(current + 1));
  return current + 1;
}

function toolsForRun(isEvenRun) {
  return [
    {
      name: isEvenRun ? 'echo_v2' : 'echo',
      description: 'Tool name intentionally drifts across repeat runs.',
      inputSchema: { type: 'object' }
    }
  ];
}
