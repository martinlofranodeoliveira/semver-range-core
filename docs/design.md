# Design — semver-range-core

Parsing is one strict regex (no lenient coercion): `01.2.3` and `1.2`
fail instead of guessing. Precedence follows semver: numeric triples,
then prerelease identifiers (numeric < alphanumeric, shorter < longer),
release above all prereleases, build ignored.

Ranges compile to small predicate closures; `maxSatisfying` is a single
linear pass keeping the highest match. `~` locks minor, `^` locks the
leftmost non-zero — the two rules cover 0-major honestly instead of
pretending `^0.0.3` spans.

Oracle: hand-pinned calendars of caret/tilde/AND/partial/star plus
prerelease participation. No network, no registry: candidates are
caller-supplied.
