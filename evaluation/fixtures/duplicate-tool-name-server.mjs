import { startFixtureServer } from './_mcp-fixture-lib.mjs';

startFixtureServer({
  name: 'research-duplicate-tool-name-server',
  tools: [
    {
      name: 'echo',
      description: 'First echo tool.',
      inputSchema: { type: 'object' }
    },
    {
      name: 'echo',
      description: 'Duplicate echo tool.',
      inputSchema: { type: 'object' }
    }
  ]
});
