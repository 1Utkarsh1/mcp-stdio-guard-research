process.stdin.setEncoding('utf8');

let buffer = '';
let initialized = false;

process.stdin.on('data', (chunk) => {
  buffer += chunk;
  const lines = buffer.split(/\r?\n/);
  buffer = lines.pop() ?? '';

  for (const line of lines) {
    if (!line.trim()) continue;
    const message = JSON.parse(line);

    if (message.method === 'initialize') {
      writeFrame({
        jsonrpc: '2.0',
        id: message.id,
        result: {
          protocolVersion: message.params.protocolVersion,
          capabilities: { tools: {} },
          serverInfo: { name: 'research-clean-server', version: '1.0.0' }
        }
      });
      continue;
    }

    if (message.method === 'notifications/initialized') {
      initialized = true;
      continue;
    }

    if (message.method === 'tools/list' && initialized) {
      writeFrame({
        jsonrpc: '2.0',
        id: message.id,
        result: {
          tools: [
            {
              name: 'echo',
              description: 'Echo input text.',
              inputSchema: {
                type: 'object',
                properties: { text: { type: 'string' } },
                required: ['text']
              }
            }
          ]
        }
      });
    }
  }
});

function writeFrame(frame) {
  process.stdout.write(`${JSON.stringify(frame)}\n`);
}
