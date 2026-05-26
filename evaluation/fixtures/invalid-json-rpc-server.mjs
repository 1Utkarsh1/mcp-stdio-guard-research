process.stdin.setEncoding('utf8');

let buffer = '';

process.stdin.on('data', (chunk) => {
  buffer += chunk;
  const lines = buffer.split(/\r?\n/);
  buffer = lines.pop() ?? '';

  for (const line of lines) {
    if (!line.trim()) continue;
    const message = JSON.parse(line);
    if (message.method !== 'initialize') continue;

    process.stdout.write(JSON.stringify({
      jsonrpc: '2.0',
      id: String(message.id),
      result: {
        protocolVersion: message.params.protocolVersion,
        capabilities: {},
        serverInfo: { name: 'research-invalid-id-server', version: '1.0.0' }
      }
    }) + '\n');
  }
});
