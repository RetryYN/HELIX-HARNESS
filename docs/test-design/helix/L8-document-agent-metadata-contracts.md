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
| U-AGMETA-008 | apply selection | 空・重複・非canonical・scope外の selection を fail-close し、manifest対象の明示 selection だけを辞書順に受理する | `tests/document-agent-metadata-apply.test.ts` |
| U-AGMETA-009 | apply plan | report に finding がある場合、または対象文書の source snapshot が取得不能な場合、apply plan を生成しない | `tests/document-agent-metadata-apply.test.ts` |
| U-AGMETA-010 | rendering | top-level `document_agent` だけを決定論的に upsert し、その他の frontmatter / 本文 bytes を保持する。安全に frontmatter を追加できない文書は拒否する | `tests/document-agent-metadata-apply.test.ts` |
| U-AGMETA-011 | digest / write port | apply plan 作成後の digest drift、source root escape、rootからtargetまでの全ancestor symlink、port拒否では source write を 0 にする | `tests/document-agent-metadata-apply.test.ts` / `tests/document-agent-metadata-integration.test.ts` |
| U-AGMETA-012 | rollback | write dispatch前にchangeをrollback集合へ登録し、publish後throwした当該changeも逆順 rollbackする。rollback失敗はpartialかつambiguousなnon-green receiptを返す | `tests/document-agent-metadata-apply.test.ts` |
| IT-AGMETA-004 | CLI apply | 明示selection、digest一致、port拒否時write 0 | `tests/document-agent-metadata-integration.test.ts` |
| IT-AGMETA-005 | publish rollback | real write portをrename/fsync後にfault injectionし、throwした当該targetを含む逆順rollbackとpartial/ambiguous receipt | `tests/document-agent-metadata-integration.test.ts` |

すべての case は pure analyzer を直接呼び、filesystem や CLI の成功だけで契約充足を主張しない。
