/* Dev helper: screenshot a page of the running app as a given user.
 * Usage: node scripts/shot.mjs <path> <out.png> [email] [width]
 * e.g.   node scripts/shot.mjs /admin/courses /tmp/x.png mpu@efkt.com 1440
 */
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const [path = '/', out = 'shot.png', email = 'mpu@efkt.com', width = '1440'] = process.argv.slice(2);
const base = process.env.BASE_URL || 'http://localhost:3000';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: Number(width), height: 900 } });
if (email !== 'none') {
  const token = execSync(`npx tsx scripts/dev-session.ts ${email}`).toString().trim();
  await ctx.addCookies([{ name: 'efkt_session', value: token, url: base }]);
}
const p = await ctx.newPage();
p.on('pageerror', (e) => console.log('PAGE ERROR', e.message));
p.on('console', (m) => m.type() === 'error' && console.log('CONSOLE', m.text()));
const res = await p.goto(base + path, { waitUntil: 'networkidle' });
console.log('status', res?.status(), 'url', p.url());
await p.waitForTimeout(500);
await p.screenshot({ path: out, fullPage: true });
await b.close();
