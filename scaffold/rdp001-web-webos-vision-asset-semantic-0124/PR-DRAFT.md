## Summary

Vision 35候補と代表legacy asset 12件をcandidate atom単位で静的照合し、420 pairを一致・反証・不足へpartitionするresearch-only Scaffoldを追加する。#2073の11 L1 anchorは承認decision effective approvedとraw metadata draftを分離したproduct scope candidate-onlyの入力（研究candidate authority none）とし、phase 0/35、asset semantic link 0/35を維持する。formal phase／product／implementation／degradation／authorityへの昇格は行わない。

- Vision candidate: 35（Web 13、Web-OS 14、product unresolved 8）
- asset matrix: 420（35×12）
- source digest provenance: match 35、mismatch 385（digest共有はsemantic linkではない）
- parent candidate-only asset relation: 210、candidate asset relationなし: 210
- history／failure／consumer／decision不足: 420/420
- L1 anchor input: 11（Web 6、Web-OS 5）
- product scope candidate-only: 27 records／148 product edges、formal L1 relation 0
- phase connection: 0/35、asset semantic link: 0/35
- negative cases: 18（期待error code照合。L1 authority、merge commit祖先性、blob固定境界を含む）

## Boundary

全35件はformal unresolvedのまま保持する。source span／shared digest／catalog relationはsemantic equivalence、実装成立、縮退、failure、consumer closureの証拠にしない。製品未解決8件はL1接続を作らず、asset matrixの総当たりpairは成立扱いしない。

## Verification

固定BASE `1cfe3895d861e0cd1533fde08688a9f81f557645`、#2073 main統合commit `cb5a45fea289d61b67cba100fd2406813021ef48`、L1 anchor blob `8d034128cc09a3b2c03abcfe31e89f8719ca170b`／digest `0c00dfa823ac0302e3ab496f9b5c264c18d8239a679ff99bb9c8515744bb64fe`、Vision source／parent bundles／12 asset source／L1承認decisionをdigest固定した。validator、selfcheck 18負例、`scfctl validate`、`scfctl stale`、`scfctl residuals`、`git diff --check`を実行する。

Refs #1813（進捗参照のみ）
