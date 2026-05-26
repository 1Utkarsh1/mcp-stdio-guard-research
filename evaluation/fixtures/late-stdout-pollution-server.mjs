import { startFixtureServer, writeFrame } from './_mcp-fixture-lib.mjs';

startFixtureServer({
  name: 'research-late-stdout-pollution-server',
  tools: [
    {
      name: 'echo',
      description: 'Echo input text.',
      inputSchema: {
        type: 'object',
        properties: { text: { type: 'string' } }
      }
    }
  ],
  onToolsList(message) {
    writeFrame({
      jsonrpc: '2.0',
      id: message.id,
      result: { tools: [] }
    });
    process.stdout.write('late debug log after tools/list\n');
    return true;
  }
});
