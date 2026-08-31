---
title: "Requirement JSON authority cutover単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: confirmed
created: 2026-07-30
updated: 2026-08-12
owner: QA / TL
plan: docs/plans/PLAN-L6-91-requirement-json-authority-cutover.md
pair_artifact: docs/design/helix/L6-function-design/requirement-json-authority-cutover.md
---

# Requirement JSON authority cutover単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-RAC-001 | authority packet exact set | canonical root、generated view、compatibility 4件の欠落／digest driftを拒否 | `tests/requirement-authority.test.ts` |
| U-RAC-002 | fail-close load | authority packet不在／parse不能を拒否 | `tests/requirement-authority.test.ts` |
| U-RAC-003 | canonical shard | 153/24/72/24、stable ID、record/root digest driftを拒否 | `tests/requirement-authority.test.ts` |
| U-RAC-004 | generated view | canonical JSON→Markdown→JSON parityとbyte一致。direct editを拒否 | `tests/requirement-authority.test.ts` |
| U-RAC-005 | DB cutover | v41、273 row、owner/oracle 0 orphan、旧shadow table 0 | `tests/requirement-authority.test.ts` |
| U-RAC-006 | legacy境界 | shadow再生成先とallowlist外legacy semantic readを拒否 | `tests/requirement-authority.test.ts` |
| U-RAC-008 | 合成pathのlegacy read | `join()`等でpathを組み立てたallowlist外legacy semantic readを拒否する。同一file内のconst束縛を解決し、未解決の接頭辞はsuffix一致で判定する。canonical JSON readとgenerated view readは誤検知しない | `tests/requirement-authority.test.ts` |
| U-RAC-009 | frozen material Git receipt | material commit object欠落、non-ancestor、manifest欠落、invalid JSON、root digest driftを個別findingで拒否し、ancestorかつmanifest digest一致だけを受理する | `tests/requirement-authority.test.ts` |

DB検証は既存schema registryとprojection writerを使い、別DB／別schema実装をテスト側へ作らない。
