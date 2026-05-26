import { startFixtureServer } from './_mcp-fixture-lib.mjs';

process.stdout.write('server starting...\n');

startFixtureServer({
  name: 'research-startup-stdout-pollution-server',
  tools: []
});
