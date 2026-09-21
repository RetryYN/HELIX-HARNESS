# RDP-001 PREISOLATION research-premise 次候補 60 path / 60 hunk

status: `scaffold_candidate_pending_semantic_equivalence_review`
candidate_kind: `research_premise`
authority_effect: `none`
diff_scope: `selected_source_items_only`

PR #1943で統合された24 path／91 hunk、PR #1946の20 path／21 hunk、候補選定時点では未統合だったPR #1949の40 path／40 hunkを既選定範囲として固定する。PR #1949はその後mainへ統合済みである。選定時は`unmerged_candidate`、rebaseline時は`integrated_in_latest_main`として、historical round1 ref `9d12b137...`、integration commit `e21962d...`、merged HEAD `747071f...`をlineageへ固定する。その合計84 path／152 hunkを除いた残余316 files／340 hunksから、source holdingの`PREISO-REV-000085..000144`の60 path／60 hunkを選定した。PR #1949候補のID／pathとはvalidatorで重複を検査する。

全体のGit差分分母は400 files／492 hunks。今回の選定後はcombined selected 144 files／212 hunks、残り256 files／280 hunksとなる。source holding自体は333 recordsであり、Git差分の400 filesとは別のdenominatorとして保持する。

今回の60 hunkはすべて`research_premise`のhunk fragment分類に留め、semantic atom countは0、compound hunk holdは60とする。8 fragmentには原文spanへ接地したreview-only subunit候補を記録するが、semantic atom coverageやresearch premiseの採否を確立しない。残り52 fragmentはsubunit未分解のまま保持する。

候補worktreeのcompletion baseは`59d344ea0cd8c26aed55bad0c674119e9be821ae`として記録する。mainの最新性はcandidate freshness gateにせず、後続のbase更新はレビュー対応側のtest mergeと`scfctl stale`で扱う。source holding、legacy asset、phase/product ledger、atomization contractの入力digestはmanifest／inventory／Bindingへ固定する。

asset／phase ledgerのcandidate product／phase、legacy implementation status、consumer closureはsnapshotとして保持する。owner、authority、successor、意味同値、採用、実装、consumer closure、acceptance、releaseは未確定である。旧archiveはGit objectのread-only参照だけに限定し、runtime／test／CI／hookは実行しない。

## 静的確認

```text
python3 scaffold/pre-isolation-research-next60/validate.py
python3 scaffold/pre-isolation-research-next60/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

validatorはholding、PR #1943／#1946／#1949選定ID、baseline／pre-isolation／archive Git object、全体／selected hunk、exact spanとSHA-256、asset／phase provenance、hunk分類、compound hold、review-only subunit、negative／counterevidenceをread-onlyに照合する。

合格はresearch premiseの意味同値、要求採否、authority、実装、consumer closure、受入、releaseの証拠ではない。
