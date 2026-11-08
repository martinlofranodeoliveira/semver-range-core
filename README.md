# semver-range-core

Strict semver parsing plus bounded range matching: exact, caret, tilde,
comparators and partials. Zero runtime dependencies, Node >= 22.

Part of the LOFRANO TECNOLOGIA open-source lab. MIT.

```js
import { maxSatisfying } from './src/semver.mjs';
maxSatisfying(['1.2.3', '1.9.0', '2.0.0'], '^1.2.3'); // '1.9.0'
```

```sh
npm test          # 7 tests, node:test, no dependencies
npm run demo
```

At most 1000 candidates; prereleases participate as their release.
MIT — see `LICENSE`. Full contract in `docs/contract.md`. [Versão em português](README.pt-BR.md).
