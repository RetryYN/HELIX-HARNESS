# Wave22 旧要求 semantic review status（2026-09-21）

PR #1942 merge後の最新main `bc5aef4726ad979c10c34a43557025e77f1c25d6` へ独立worktreeをfast-forwardしてrebaselineしました。main merge parentsは `5fcdc80f23c0fb3e959293b9fbd751fa31eeb792` と `75cdab971129c9b25830860059c8c6fadaca38b2` です。Wave21 exact `418500321edbc8bc3c45f4d8d0d8c994de9f7597` とそのsource base `053943791ceda83366fca01d375308ba5f7deb28`、Wave1–21 prior batch、47 input digestをmetaへ固定しました。

BR31-OS、BR32-OS、BR33-HARNESSの3 unit、9 edge（要求3、design3、implementation_source3）を保持し、confirmed 3、unresolved 6、rejected 0です。累積は70 unit／207 edge、残り148 unitです。BR33-OSはWave4で既レビューのため重複追加せず、`配布surfaceの実切替は既存cutover承認境界に従う` の意味はWave4のBR33-OS-A01へ接続しました。Wave22ではHARNESS側のmarketplace package specification句を独立保持し、product splitとconnectorを未確定のまま残しています。

要求IR/raw接地、old asset catalog candidate count、phase-product pool、bounded search digest、selected exact old source、Wave1–21 lineage、ROW_FIELDS／META_FIELDS／inputs閉包を静的検証しています。全authorityは `none`、consumer closureは `pending`、旧実行は `not_run`、new buildは `false` です。source atomization、product routing、phase authority、successor、current implementation、missing acceptance receiptは保留です。

実施した検証は以下です。

- `python3 -m py_compile docs/governance/tools/verify_legacy_requirement_direct_semantic_review_wave22.py` — PASS
- `python3 docs/governance/tools/verify_legacy_requirement_direct_semantic_review_wave22.py` — `Wave22 static schema10 verification: PASS`
- `python3 scaffold/tools/scfctl.py validate` — PASS
- `git diff --check` — PASS
- ledger／decomposition／crosswalk／metaを一段で照合したdepth1 equivalent static check — PASS

Wave21から継承したliteral atom grounding、source span bounds、missing receipt role closure、stale anchor、mapping欠落、未選択excerpt、row admission claim、改竄atom、forged missing receiptのmeaningful negative gatesを通過しています。旧runtime、旧test、旧CIは実行していません。commit、push、PR、merge、Issue操作は行っていません。
