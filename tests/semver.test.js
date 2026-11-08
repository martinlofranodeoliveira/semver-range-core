import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parse, compare, compileRange, maxSatisfying, SemverError } from '../src/semver.mjs';

describe('parse', () => {
  it('accepts strict versions, optional v and build', () => {
    assert.deepEqual({ ...parse('1.2.3') }.constructor, Object);
    assert.equal(parse('v2.0.0').major, 2);
    assert.deepEqual(parse('1.0.0+b1').pre, null);
    assert.deepEqual(parse('1.0.0-alpha.1').pre, ['alpha', 1]);
  });
  it('rejects leading zeros and partials', () => {
    assert.throws(() => parse('01.2.3'), (e) => e.code === 'BAD_VERSION');
    assert.throws(() => parse('1.2'), (e) => e.code === 'BAD_VERSION');
    assert.throws(() => parse('1.2.3-'), (e) => e.code === 'BAD_VERSION');
    assert.throws(() => parse(42), (e) => e.code === 'NOT_STRING');
  });
});

describe('compare', () => {
  it('orders releases and prereleases', () => {
    assert.equal(compare(parse('1.0.0-alpha'), parse('1.0.0')), -1);
    assert.equal(compare(parse('1.0.0-alpha.1'), parse('1.0.0-alpha.beta')), -1);
    assert.equal(compare(parse('2.0.0'), parse('10.0.0')), -1);
    assert.equal(compare(parse('1.0.0+b1'), parse('1.0.0+b2')), 0);
  });
});

describe('ranges', () => {
  const VS = ['1.2.3', '1.9.0', '2.0.0', '0.2.9', '0.3.0', '1.2.9', '1.3.0'];
  it('caret, tilde and AND lists', () => {
    assert.equal(maxSatisfying(VS, '^1.2.3'), '1.9.0');
    assert.equal(maxSatisfying(VS, '~1.2.3'), '1.2.9');
    assert.equal(maxSatisfying(VS, '>=1.2.0 <2.0.0'), '1.9.0');
    assert.equal(maxSatisfying(VS, '^0.2.0'), '0.2.9');
  });
  it('exact, partial and star', () => {
    assert.equal(maxSatisfying(VS, '1.2.3'), '1.2.3');
    assert.equal(maxSatisfying(VS, '1.2.x'), '1.2.9');
    assert.equal(maxSatisfying(VS, '*'), '2.0.0');
    assert.equal(maxSatisfying(VS, '>=9.0.0'), null);
  });
  it('prereleases participate as their release', () => {
    assert.equal(maxSatisfying(['1.2.3', '1.3.0-alpha'], '^1.2.3'), '1.3.0-alpha');
  });
  it('rejects bad ranges', () => {
    assert.throws(() => compileRange(''), (e) => e.code === 'EMPTY_RANGE');
    assert.throws(() => compileRange('foo'), (e) => e.code === 'BAD_RANGE');
    assert.throws(() => maxSatisfying(new Array(1001).fill('1.0.0'), '*'), (e) => e.code === 'TOO_MANY');
    assert.ok(new SemverError('X') instanceof Error);
  });
});
