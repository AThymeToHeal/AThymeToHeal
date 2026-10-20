// Mission Control: push runtime secrets to the just-deployed Worker. Do not edit.
import { execFileSync } from 'node:child_process'

const names = (process.env.WLA_RUNTIME_SECRETS || '').split(',').map((s) => s.trim()).filter(Boolean)
const payload = {}
for (const n of names) if (process.env[n]) payload[n] = process.env[n]
if (!Object.keys(payload).length) {
  console.log('[wla] no runtime secrets to sync')
  process.exit(0)
}
execFileSync('npx', ['wrangler', 'secret', 'bulk'], { input: JSON.stringify(payload), stdio: ['pipe', 'inherit', 'inherit'] })
console.log(`[wla] synced ${Object.keys(payload).length} runtime secret(s): ${Object.keys(payload).join(", ")}`)
