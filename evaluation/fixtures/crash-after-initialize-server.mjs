import { startFixtureServer } from './_mcp-fixture-lib.mjs';

startFixtureServer({
  name: 'research-crash-after-initialize-server',
  tools: [],
  onInitialized() {
    setTimeout(() => {
      throw new Error('intentional crash after initialized notification');
    }, 5);
  }
});
