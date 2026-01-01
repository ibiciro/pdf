#!/usr/bin/env node
const { spawn } = require('child_process');

// Get all arguments passed to this script
const inputArgs = process.argv.slice(2);
const finalArgs = ['-H', '0.0.0.0'];

// Parse port and other arguments
let i = 0;
while (i < inputArgs.length) {
  const arg = inputArgs[i];
  
  if (arg === '--port' || arg === '-p') {
    if (inputArgs[i + 1]) {
      finalArgs.push('-p', inputArgs[i + 1]);
      i += 2;
    } else {
      i++;
    }
  } else if (arg.startsWith('--port=')) {
    finalArgs.push('-p', arg.split('=')[1]);
    i++;
  } else if (arg === '--host' || arg.startsWith('--host=')) {
    // Skip --host arguments as we handle them with -H
    if (arg === '--host' && inputArgs[i + 1] && !inputArgs[i + 1].startsWith('-')) {
      i += 2;
    } else {
      i++;
    }
  } else {
    i++;
  }
}

console.log('Starting Next.js dev server...');

const child = spawn('next', ['dev', ...finalArgs], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env }
});

child.on('error', (err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});

child.on('close', (code) => {
  process.exit(code || 0);
});
