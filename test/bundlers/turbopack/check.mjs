import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';

const PORT = 3417;
const next = (...args) => spawnSync('./node_modules/.bin/next', args, { stdio: 'inherit' });

const waitForServer = async (url, attempts = 40) => {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return res;
    } catch {
      // server not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`server at ${url} did not become ready`);
};

const build = next('build', '--turbopack');
if (build.status !== 0) {
  throw new Error(`next build --turbopack exited ${build.status}`);
}

const server = spawn('./node_modules/.bin/next', ['start', '-p', String(PORT)], { stdio: 'inherit' });

try {
  const res = await waitForServer(`http://localhost:${PORT}/api/check`);
  const body = await res.json();
  assert.equal(body.hello, true);
  assert.equal(body.helo, false);
  assert.deepEqual(body.suggest, ['hello']);
  console.log('turbopack bundler smoke test OK');
} finally {
  server.kill();
}
