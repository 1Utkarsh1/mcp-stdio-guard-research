import { startFixtureServer } from './_mcp-fixture-lib.mjs';

startFixtureServer({
  name: 'research-malformed-json-server',
  tools: [
    {
      name: 'echo',
      description: 'Echo input text.',
      inputSchema: { type: 'object' }
    }
  ],
  onToolsList() {
    process.stdout.write('{not json}\n');
    return true;
  }
});
