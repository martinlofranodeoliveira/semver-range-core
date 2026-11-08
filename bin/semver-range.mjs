#!/usr/bin/env node
// Demo: fixed ranges against a fixed list. --assert exits non-zero on mismatch.
import { maxSatisfying } from '../src/semver.mjs';

const VERSIONS = ['1.2.3', '1.4.0', '1.4.1-beta', '2.0.0'];
const CASES = [
  ['^1.2.0', '1.4.1-beta'],
  ['~1.4.0', '1.4.1-beta'],
  ['>=1.0.0 <2.0.0', '1.4.1-beta'],
  ['2.x', '2.0.0'],
];

let failed = 0;
for (const [range, expected] of CASES) {
  const got = maxSatisfying(VERSIONS, range);
  const pass = got === expected;
  if (!pass) failed++;
  console.log(`${pass ? 'PASS' : 'FAIL'} ${range} -> ${got} (expected ${expected})`);
}
if (process.argv.includes('--assert') && failed > 0) process.exit(1);
if (failed > 0) process.exitCode = 1;
console.log(failed === 0 ? 'demo: all cases as expected' : `demo: ${failed} mismatch(es)`);
