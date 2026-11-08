# semver-range-core

Interpretação estrita de semver com faixas limitadas: exato, caret,
tilde, comparadores e parciais. Zero dependências, Node >= 22.

Parte do laboratório open source da LOFRANO TECNOLOGIA. MIT.

```js
import { maxSatisfying } from './src/semver.mjs';
maxSatisfying(['1.2.3', '1.9.0', '2.0.0'], '^1.2.3'); // '1.9.0'
```

```sh
npm test          # 7 testes, node:test, sem dependências
npm run demo
```

No máximo 1000 candidatos; pré-lançamentos participam como seu release.
MIT — veja `LICENSE`.
