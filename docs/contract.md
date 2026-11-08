# Contract — semver-range-core

Pure ESM in `src/semver.mjs`, zero runtime dependencies, Node >= 22.
Strict numeric triples, no leading zeros. Build metadata parsed, ignored
in precedence. Prereleases participate as their release in ranges (pinned
by test); use an exact version to select one.

| Export | Result |
| --- | --- |
| `MAX_VERSIONS` (1000) | Hard bound on candidate lists. |
| `parse(version)` | Frozen `{major,minor,patch,pre,raw}`. Optional leading `v`. |
| `compare(a, b)` | -1/0/1 (build ignored, prerelease < release, numeric < alphanumeric). |
| `compileRange(range)` | Predicate over parsed versions. Space = AND. |
| `maxSatisfying(versions, range)` | Highest raw string, or `null`. |

Ranges: `1.2.3` exact · `1.2.x`/`1.x` partials · `*` · `^` (0-major aware:
`^0.2.3→<0.3.0`, `^0.0.3→=0.0.3`) · `~` (→`<minor+1`) · `> >= < <= =`.

Errors: `NOT_STRING` · `BAD_VERSION` · `BAD_RANGE` · `EMPTY_RANGE` ·
`NOT_ARRAY` · `TOO_MANY`.
