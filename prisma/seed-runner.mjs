// Bridge: run the TypeScript seed via tsx using the WebSocket-compatible Neon driver
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))
const root = join(__dir, '..')

const proc = spawn(
  join(root, 'node_modules', '.bin', 'tsx'),
  [join(__dir, 'seed.ts')],
  {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' },
    shell: true,
  }
)

proc.on('exit', (code) => process.exit(code ?? 0))
