# RDP-001 PREISOLATION research-premise 次候補 40 path / 40 hunk

status: `scaffold_candidate_pending_semantic_equivalence_review`
candidate_kind: `research_premise`
authority_effect: `none`
diff_scope: `selected_source_items_only`

PR #1943で統合された24 path／91 hunkと、PR #1946の選定時未統合候補20 path／21 hunkを既選定範囲として固定する。最終rebaseline時点ではPR #1946がmainへ統合済みであり、そのintegration commitもprovenanceへ保持する。その合計44 path／112 hunkを除いた残余356 files／380 hunksから、source holdingの`PREISO-REV-000044..000059`および`PREISO-REV-000061..000084`の40 path／40 hunkを選定した。PR #1946候補のID／pathとはvalidatorで重複を検査する。

全体のGit差分分母は400 files／492 hunks。今回の選定後はcombined selected 84 files／152 hunks、残り316 files／340 hunksとなる。source holding自体は333 recordsであり、Git差分の400 filesとは別のdenominatorとして保持する。

今回の40 hunkはすべて`research_premise`のhunk fragment分類に留め、semantic atom countは0、compound hunk holdは40とする。8 fragmentには原文spanへ接地したreview-only subunit候補を記録するが、semantic atom coverageやresearch premiseの採否を確立しない。残り32 fragmentはsubunit未分解のまま保持する。

asset／phase ledgerのcandidate product／phase、legacy implementation status、consumer closureはsnapshotとして保持する。owner、authority、successor、意味同値、採用、実装、consumer closure、acceptance、releaseは未確定である。旧archiveはGit objectのread-only参照だけに限定し、runtime／test／CI／hookは実行しない。

## 静的確認

```text
python3 scaffold/pre-isolation-research-next40/validate.py
python3 scaffold/pre-isolation-research-next40/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

validatorはholding、PR #1943／PR #1946選定ID、baseline／pre-isolation／archive Git object、全体／selected hunk、exact spanとSHA-256、asset／phase provenance、hunk分類、compound hold、review-only subunit、negative／counterevidenceをread-onlyに照合する。

合格はresearch premiseの意味同値、要求採否、authority、実装、consumer closure、受入、releaseの証拠ではない。
