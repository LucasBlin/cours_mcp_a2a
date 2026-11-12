// Lance MCP Inspector sur un serveur du TP avec le chemin absolu de Node :
// sous Windows, Inspector ne retrouve pas « node » seul dans le PATH.
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const inspecteur = join(
  dirname(require.resolve('@modelcontextprotocol/inspector/package.json')),
  'clients/launcher/build/index.js'
);

const MODES = new Set(['--cli', '--tui']);
const [serveur = 'src/server.js', ...options] = process.argv.slice(2);
const modes = options.filter((option) => MODES.has(option));
const optionsInspector = options.filter((option) => !MODES.has(option));

const processus = spawn(
  process.execPath,
  [inspecteur, ...modes, process.execPath, serveur, ...optionsInspector],
  { stdio: 'inherit' }
);
processus.on('exit', (code) => process.exit(code ?? 1));
