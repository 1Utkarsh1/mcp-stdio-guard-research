import { startFixtureServer } from './_mcp-fixture-lib.mjs';

startFixtureServer({
  name: 'research-invalid-tool-schema-server',
  tools: [
    {
      name: 'lookup',
      description: 'Lookup fixture.',
      inputSchema: {
        type: 'object',
        properties: {},
        required: ['query']
      }
    }
  ]
});
