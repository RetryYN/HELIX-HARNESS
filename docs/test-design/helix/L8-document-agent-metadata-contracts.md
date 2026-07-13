---
title: "HELIX L8 単体テスト設計 — 文書 agent metadata 契約"
layer: L8
artifact_type: test_design
sub_doc: unit-test-design
status: draft
created: 2026-07-14
updated: 2026-07-14
owner: QA / TL
pair_artifact: docs/design/helix/
---

# HELIX L8 単体テスト設計 — 文書 agent metadata 契約

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-AGMETA-001 | scope | archive / PLAN / `.claude/agents` を入力しても対象外として扱う | `tests/document-agent-metadata.test.ts` |
| U-AGMETA-002 | extraction | parser が正式入力とする frontmatter / fenced YAML の typed declaration だけを抽出し、本文 ID は pass 根拠にしない | `tests/document-agent-metadata.test.ts` |
| U-AGMETA-003 | derive | 入力順・NFC・same-document reference を変えても canonical な同一結果を返す | `tests/document-agent-metadata.test.ts` |
| U-AGMETA-004 | defines | actual が allowlist 外なら error、allowlist 内の未使用宣言は error にしない | `tests/document-agent-metadata.test.ts` |
| U-AGMETA-005 | read_first | 定義元欠落、unknown ID、missing/stale `read_first`、自己参照を error にする | `tests/document-agent-metadata.test.ts` |
| U-AGMETA-006 | done_when | required IDs / read-first / pair / gate の導出結果との差異を error にする | `tests/document-agent-metadata.test.ts` |
| U-AGMETA-007 | manifest / invalid graph | manifest 欠損・空集合・scope外 path、parse failure、duplicate ID、unknown metadata、循環参照を fail-close にする | `tests/document-agent-metadata.test.ts` |

すべての case は pure analyzer を直接呼び、filesystem や CLI の成功だけで契約充足を主張しない。
