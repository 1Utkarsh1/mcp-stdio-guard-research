export function startFixtureServer(options = {}) {
  const state = {
    initialized: false
  };
  const tools = options.tools ?? [];
  const capabilities = options.capabilities ?? (tools.length ? { tools: {} } : {});
  let buffer = '';

  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => {
    buffer += chunk;
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.trim()) continue;
      let message;
      try {
        message = JSON.parse(line);
      } catch {
        if (options.onMalformedInput) {
          options.onMalformedInput(line, state);
        } else {
          writeFrame({
            jsonrpc: '2.0',
            id: null,
            error: { code: -32700, message: 'Parse error' }
          });
        }
        continue;
      }

      handleMessage(message, state, { ...options, capabilities, tools });
    }
  });
}

export function writeFrame(frame) {
  process.stdout.write(`${JSON.stringify(frame)}\n`);
}

export function initializeResult(message, options = {}) {
  return {
    protocolVersion: message.params?.protocolVersion ?? '2025-11-25',
    capabilities: options.capabilities ?? {},
    serverInfo: {
      name: options.name ?? 'research-fixture',
      version: options.version ?? '1.0.0'
    }
  };
}

function handleMessage(message, state, options) {
  if (options.onMessage?.(message, state) === true) return;

  if (message.method === 'initialize') {
    if (options.onInitialize?.(message, state) === true) return;
    writeFrame({
      jsonrpc: '2.0',
      id: message.id,
      result: initializeResult(message, options)
    });
    return;
  }

  if (message.method === 'notifications/initialized') {
    state.initialized = true;
    options.onInitialized?.(message, state);
    return;
  }

  if (message.method === 'tools/list') {
    if (options.onToolsList?.(message, state) === true) return;
    if (message.params !== undefined && !isObjectRecord(message.params)) {
      writeFrame({
        jsonrpc: '2.0',
        id: message.id,
        error: { code: -32602, message: 'Invalid params' }
      });
      return;
    }
    writeFrame({
      jsonrpc: '2.0',
      id: message.id,
      result: { tools: options.tools }
    });
    return;
  }

  if (message.method === 'resources/list') {
    if (options.onResourcesList?.(message, state) === true) return;
    writeFrame({
      jsonrpc: '2.0',
      id: message.id,
      result: { resources: [] }
    });
    return;
  }

  if (message.method === 'prompts/list') {
    if (options.onPromptsList?.(message, state) === true) return;
    writeFrame({
      jsonrpc: '2.0',
      id: message.id,
      result: { prompts: [] }
    });
    return;
  }

  if (Object.hasOwn(message, 'id')) {
    writeFrame({
      jsonrpc: '2.0',
      id: message.id,
      error: { code: -32601, message: 'Method not found' }
    });
  }
}

function isObjectRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
