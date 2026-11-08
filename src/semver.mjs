// SPDX-License-Identifier: MIT
// Strict semver parsing plus bounded range matching: exact, caret, tilde,
// comparators, AND lists and x-partials. Build metadata ignored in
// precedence. No network, no I/O.

export const MAX_VERSIONS = 1000;

export class SemverError extends Error {
  constructor(code, detail = '') {
    super(detail ? `${code}: ${detail}` : code);
    this.name = 'SemverError';
    this.code = code;
  }
}

const NUM = '(0|[1-9]\\d*)';
const PRE = '(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?';
const BUILD = '(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?';
const FULL = new RegExp(`^v?${NUM}\\.${NUM}\\.${NUM}${PRE}${BUILD}$`);

/** Parse strict semver. Returns frozen {major,minor,patch,pre[],raw}. */
export function parse(version) {
  if (typeof version !== 'string') throw new SemverError('NOT_STRING');
  const m = FULL.exec(version.trim());
  if (!m) throw new SemverError('BAD_VERSION', version.slice(0, 32));
  const pre = m[4] === undefined ? null : m[4].split('.').map((id) => (/^\d+$/.test(id) ? Number(id) : id));
  return Object.freeze({
    major: Number(m[1]), minor: Number(m[2]), patch: Number(m[3]), pre, raw: version.trim(),
  });
}

/** -1 | 0 | 1 precedence (build ignored; prerelease < release). */
export function compare(a, b) {
  for (const k of ['major', 'minor', 'patch']) {
    if (a[k] !== b[k]) return a[k] < b[k] ? -1 : 1;
  }
  if (a.pre === null && b.pre === null) return 0;
  if (a.pre === null) return 1;
  if (b.pre === null) return -1;
  const n = Math.max(a.pre.length, b.pre.length);
  for (let i = 0; i < n; i++) {
    if (i >= a.pre.length) return -1;
    if (i >= b.pre.length) return 1;
    const x = a.pre[i];
    const y = b.pre[i];
    if (x === y) continue;
    const xn = typeof x === 'number';
    const yn = typeof y === 'number';
    if (xn && yn) return x < y ? -1 : 1;
    if (xn) return -1;
    if (yn) return 1;
    return x < y ? -1 : 1;
  }
  return 0;
}

function caretUpper(v) {
  if (v.major > 0) return { major: v.major + 1, minor: 0, patch: 0, pre: null };
  if (v.minor > 0) return { major: 0, minor: v.minor + 1, patch: 0, pre: null };
  return { major: 0, minor: 0, patch: v.patch + 1, pre: null };
}

function cmpParts(p) {
  return { major: p.major, minor: p.minor, patch: p.patch, pre: null };
}

/** Compile one comparator token into a predicate over parsed versions. */
function compileToken(token) {
  if (token === '*' || token === 'x' || token === 'X') return () => true;
  let m;
  if ((m = /^(>=|<=|>|<|=)?v?(\d+|[xX*])(?:\.(\d+|[xX*])(?:\.(\d+|[xX*]))?)?(.*)$/.exec(token)) && m[2] !== undefined) {
    const op = m[1] ?? '';
    const parts = [m[2], m[3], m[4]];
    if (parts.some((p) => p === undefined || /^[xX*]$/.test(p))) {
      // Partial: 1.x / 1.2.x — op must be empty or '='.
      if (op && op !== '=') throw new SemverError('BAD_RANGE', token);
      const nums = parts.map((p) => (p === undefined || /^[xX*]$/.test(p) ? null : Number(p)));
      return (v) => {
        if (nums[0] !== null && v.major !== nums[0]) return false;
        if (nums[1] !== null && (v.major !== nums[0] || v.minor !== nums[1])) return false;
        return true;
      };
    }
    if (m[5]) throw new SemverError('BAD_RANGE', token);
    const base = { major: Number(parts[0]), minor: Number(parts[1] ?? 0), patch: Number(parts[2] ?? 0), pre: null };
    const full = parts[1] !== undefined && parts[2] !== undefined;
    switch (op) {
      case '': case '=': return (v) => compare(cmpParts(v), base) === 0 && (full || true);
      case '>': return (v) => compare(cmpParts(v), base) > 0;
      case '>=': return (v) => compare(cmpParts(v), base) >= 0;
      case '<': return (v) => compare(cmpParts(v), base) < 0;
      case '<=': return (v) => compare(cmpParts(v), base) <= 0;
      default: throw new SemverError('BAD_RANGE', token);
    }
  }
  if ((m = /^(\^|~)v?(.+)$/.exec(token))) {
    const v = parse(m[2]);
    const lo = cmpParts(v);
    const hi = m[1] === '^' ? caretUpper(v) : { major: v.major, minor: v.minor + 1, patch: 0, pre: null };
    return (x) => compare(cmpParts(x), lo) >= 0 && compare(cmpParts(x), hi) < 0;
  }
  throw new SemverError('BAD_RANGE', token);
}

/** Compile a space-separated AND range into a predicate. */
export function compileRange(range) {
  if (typeof range !== 'string' || range.trim() === '') throw new SemverError('EMPTY_RANGE');
  const preds = range.trim().split(/\s+/).map(compileToken);
  return (v) => preds.every((p) => p(v));
}

/** Highest version (raw string) satisfying the range, or null. */
export function maxSatisfying(versions, range) {
  if (!Array.isArray(versions)) throw new SemverError('NOT_ARRAY');
  if (versions.length > MAX_VERSIONS) throw new SemverError('TOO_MANY');
  const test = compileRange(range);
  let best = null;
  for (const raw of versions) {
    const v = parse(raw);
    if (!test(v)) continue;
    if (!best || compare(v, best) > 0) best = v;
  }
  return best ? best.raw : null;
}
