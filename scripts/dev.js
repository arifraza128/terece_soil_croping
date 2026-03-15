const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Starting Smart Terrace Farming System...\n');

function needsInstall(dir) {
  return !fs.existsSync(path.join(dir, 'node_modules'));
}

const root = path.join(__dirname, '..');
const server = path.join(root, 'server');
const client = path.join(root, 'client');

if (needsInstall(root)) {
  console.log('Installing root dependencies...');
  execSync('npm install', { cwd: root, stdio: 'inherit' });
}
if (needsInstall(server)) {
  console.log('Installing server dependencies...');
  execSync('npm install', { cwd: server, stdio: 'inherit' });
}
if (needsInstall(client)) {
  console.log('Installing client dependencies...');
  execSync('npm install', { cwd: client, stdio: 'inherit' });
}

const dbPath = path.join(root, 'data', 'farm.db');
if (!fs.existsSync(dbPath)) {
  console.log('Seeding demo data...');
  try {
    execSync('node db/seed.js', { cwd: server, stdio: 'inherit' });
  } catch (e) {
    console.log('Seed skipped (DB may already exist)');
  }
}

console.log('\nLaunching server and client...\n');

const serverProc = spawn('node', ['server.js'], {
  cwd: server,
  stdio: 'inherit',
  env: { ...process.env, PORT: '5000' }
});

const clientProc = spawn('npm', ['start'], {
  cwd: client,
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: '3000',
    BROWSER: 'none',
    REACT_APP_API_URL: ''
  },
  shell: true
});

serverProc.on('exit', code => {
  console.log(`Server exited with code ${code}`);
  clientProc.kill();
  process.exit(code);
});

clientProc.on('exit', code => {
  console.log(`Client exited with code ${code}`);
});

process.on('SIGINT', () => {
  serverProc.kill();
  clientProc.kill();
  process.exit(0);
});
