#!/usr/bin/env node
/**
 * Development server wrapper script for Next.js
 * Filters out Vite-specific arguments like --host
 */

const { execSync, spawn } = require('child_process');

// Filter command line args - remove --host which is Vite-specific
const args = process.argv.slice(2).filter(arg => {
  if (arg === '--host') return false;
  if (arg.startsWith('--host=')) return false;
  return true;
});

// Build the command with Next.js compatible args
const nextArgs = ['next', 'dev', '--hostname', '0.0.0.0'];

// Add any remaining valid args
args.forEach(arg => {
  if (!nextArgs.includes(arg)) {
    nextArgs.push(arg);
  }
});

console.log('Starting dev server:', nextArgs.join(' '));

// Use exec to run directly
const child = spawn('npx', nextArgs, {
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

child.on('close', code => process.exit(code || 0));
child.on('error', err => {
  console.error('Error:', err);
  process.exit(1);
});
