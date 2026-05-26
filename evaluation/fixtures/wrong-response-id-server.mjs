import { initializeResult, startFixtureServer, writeFrame } from './_mcp-fixture-lib.mjs';

startFixtureServer({
  name: 'research-wrong-response-id-server',
  onInitialize(message) {
    writeFrame({
      jsonrpc: '2.0',
      id: 99,
      result: initializeResult(message, {
        name: 'research-wrong-response-id-server',
        capabilities: {}
      })
    });
    return true;
  }
});
