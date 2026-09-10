# 開発投資段階指示書取込み単体テスト設計

親設計: `docs/governance/repository-structure.md`

| U-ID | 検証対象 | 反例と期待結果 | test citation |
| --- | --- | --- | --- |
| U-DIS-001 | 統合原稿bytes | 保全先の1 byteでも変えるとSHA-256不一致でRED | `tests/development-investment-stage-directives.test.ts` |
| U-DIS-002 | 72候補とP0〜P4割当 | INV見出しまたは全件対応表の欠落・重複・範囲外段階をRED | `tests/development-investment-stage-directives.test.ts` |
| U-DIS-003 | candidate境界とroot退役 | 非authority境界、hash、移管先、root不存在のいずれかが欠けるとRED | `tests/development-investment-stage-directives.test.ts` |

## 境界

- 入力候補の完全性と退役可能性だけを検証し、72候補の承認・採用・実装を主張しない。
- P0〜P4を障害severity、V-model layer、Release Waveへ読み替えない。
- root原稿削除前に、Git管理された候補入力のbytes同一性を検査する。
