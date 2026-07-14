---
title: "HELIX L9 結合テスト設計 — 文書 agent metadata 契約"
layer: L9
artifact_type: test_design
status: draft
created: 2026-07-14
updated: 2026-07-14
owner: QA / TL
pair_artifact: docs/design/helix/
---

# HELIX L9 結合テスト設計 — 文書 agent metadata 契約

| IT-ID | 前提 | 操作 | 期待結果 | テスト参照 |
|---|---|---|---|---|
| IT-AGMETA-001 | canonical fixture と scope manifest | repo scan を実行 | stable report が対象集合と metadata closure を返す。未付与を偽 green にしない | `tests/document-agent-metadata-integration.test.ts` |
| IT-AGMETA-002 | 上流 ID の定義元移動または参照変異 fixture | CLI/doctor check を実行 | stale / missing `read_first` を non-zero finding として返す | `tests/document-agent-metadata-integration.test.ts` |
| IT-AGMETA-003 | fresh child process と clean fixture | CLI→FS adapter→pure analyzer→doctor を実行 | JSON schema が一致し、source write / DB mutation / spawn が 0 である | `tests/document-agent-metadata-integration.test.ts` |
| IT-AGMETA-004 | Phase B の明示 selection と write-port fixture | `helix design agent-metadata apply --select <canonical-path> --json` を実行 | scope内だけを更新し、before/after digest と rollback receipt を残す。scope外・digest drift・port拒否は書込み 0 | `tests/document-agent-metadata-integration.test.ts` |
| IT-AGMETA-005 | 複数 selection と publish fault fixture | CLI apply を実行 | atomic publish fault 時は既更新 source を逆順 rollback する。rollback失敗は non-zero / partial receipt で隠蔽しない。DB・spawn・release state は 0 | `tests/document-agent-metadata-integration.test.ts` |

doctor hard gate は manifest が明示する導入対象だけを検査する。範囲外を pass 件数へ混ぜず、対象拡大は
新しい reviewable L7 change で行う。
