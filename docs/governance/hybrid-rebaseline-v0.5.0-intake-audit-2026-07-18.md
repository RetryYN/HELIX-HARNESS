# REBASELINE v0.5.0 intake・追突監査（2026-07-18）

## 結論

`docs/migration/source-packages/hybrid-core-requirements-rebaseline-v0.5.0.zip`は全memberを展開・確認した。
source integrityはPASS、current HELIXへの無条件昇格はFAIL、差分sourceとしての追突採用はCONDITIONAL PASSである。

## source識別情報

- bytes: 339,140
- SHA-256: `a8c011502d2e9313ea9fbbad38aba45a00312dc5053468da832e3a9d8757a0e9`
- physical files: 202
- CHECKSUMS対象: 200
- checksum mismatch: 0

## 実行したpackage検証

- chat追跡閉包: 153 pair、欠落0
- chat来歴: CHAT 21、provenance 21、orphan 0
- Python capability写像: 29/29の全単射
- source鮮度fixture: freshはPASS、staleはFAIL
- UT参照突合: 5 ref、authority statusはBLOCKED
- 検出findingのresolved field検査: PASS
- evidence/finding roundtripとorphan rejection: PASS

`verify-full-ref-adoption-status.py`は`enumeration_log_present=False`でPASSしたため、全ref採用完了の証拠には使わない。

## v0.4.0との差分

| 集合 | v0.4.0 | v0.5.0 | 追加 | 変更 | 削除 |
|---|---:|---:|---:|---:|---:|
| requirement | 163 | 168 | 5 | 37 | 0 |
| acceptance criterion | 111 | 117 | 6 | 19 | 0 |
| trace edge | 286 | 333 | 47 | 0 | 0 |

## current authorityとの衝突

1. 現行project ruleはADR-009をtarget authorityとし、Python proposal-only／Node single writerを要求する。
2. v0.5.0はADR-010とD-016によりPython semantic coreを恒久正本とする。
3. ADR-010はcurrent worktreeでuntrackedであり、AGENTS/CLAUDE/Core Readsへauthority epochが波及していない。
4. よってADR-010由来部分は自動採用せず、別Redesignまでdeferする。
5. sandbox、closed capability、Node transaction writer、capsule digest、freshness SLAなど、ADR-009と両立する差分は採用する。

## 既知のpackage自己矛盾

- manifest version 0.5.0とvalidation summary version 0.4.0が不一致。
- check detail requirements 168とsummary requirements 163が不一致。
- Python authorityについてsemantic SSoTとproposal-onlyが混在。
- D-009とD-016がruntime authorityについて競合。
- full-ref validatorがenumeration log不在をPASSする。

これらはsource checksum PASSでは相殺しない。受入正本は
`docs/test-design/helix/hybrid-rebaseline-v0.5.0-collision-acceptance.md`とする。

## 判定

`V050-INTAKE|SOURCE_INTEGRITY=PASS_200_OF_200|PHYSICAL_FILES=202|REQ=168|AC=117|EDGE=333|DELTA_ADD=5/6/47|DELTA_MOD=37/19/0|PACKAGE_SELF_CONFLICT=5|CURRENT_AUTHORITY_PROMOTION=FAIL|DELTA_SOURCE_ADOPTION=CONDITIONAL_PASS|IMPLEMENTATION=0|ACTIVATION=0|FREEZE=0`
