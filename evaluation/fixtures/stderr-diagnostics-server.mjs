import { startFixtureServer } from './_mcp-fixture-lib.mjs';

process.stderr.write('server starting on stderr\n');

startFixtureServer({
  name: 'research-stderr-diagnostics-server',
  tools: []
});
