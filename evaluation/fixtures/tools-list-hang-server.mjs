process.stdin.setEncoding('utf8');

let buffer = '';

process.stdin.on('data', (chunk) => {
  buffer += chunk;
  const lines = buffer.split(/\r?\n/);
  buffer = lines.pop() ?? '';

  for (const line of lines) {
    if (!line.trim()) continue;
    const message = JSON.parse(line);

    if (message.method === 'initialize') {
      process.stdout.write(JSON.stringify({
        jsonrpc: '2.0',
        id: message.id,
        result: {
          protocolVersion: message.params.protocolVersion,
          capabilities: { tools: {} },
          serverInfo: { name: 'research-tools-list-hang-server', version: '1.0.0' }
        }
      }) + '\n');
    }
  }
});

setInterval(() => {}, 1000);
