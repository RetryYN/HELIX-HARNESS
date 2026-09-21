# RDP-001 PREISOLATION research-premise 次候補 20 path / 21 hunk

status: scaffold_candidate_pending_semantic_equivalence_review
candidate_kind: research_premise
authority_effect: none
diff_scope: selected_source_items_only

PR #1943で統合された既処理24 path／91 hunkを除いた残余376 files／401 hunksから、
次の20 source path（21 hunk）をresearch-premise候補として保持する。対象は
`PREISO-REV-000023..000025`と`PREISO-REV-000027..000043`である。baselineは
`6fabd12512a3659fff4a956692cdd61faeeb16ce`、pre-isolationは
`2d4991042be55268bac30a8bbcdac45b3865030a`、archiveは
`064280b5c1c5c98f949e6e3be5ef87cbe4a4b658`である。

全体差分は400 files／492 hunks。先行review済み範囲は24 files／91 hunks、今回のselected
candidateは20 files／21 hunks、combined selected scopeは44 files／112 hunks、今回選定後の
残りは356 files／380 hunksである。先行review済み範囲と今回candidateを同一の完了・採否へ
縮退させない。source category、candidate product／phase、legacy implementation status、
negative／counterevidenceは台帳snapshotとして保持する。

21 hunkはすべて`compound_hunk_hold`へ置き、semantic atom countは0とする。小さな変更箇所の
うち8 fragmentには原文spanへ接地したreview-only subunit候補を記録するが、atom coverageや
research採否を確立しない。残り13 fragmentはsubunit未分解のまま保留する。旧archiveはGit
objectのread-only参照に限り、runtime／test／CI／hookは実行しない。

## 静的確認

```text
python3 scaffold/pre-isolation-research/validate.py
python3 scaffold/pre-isolation-research/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

validatorはholding／asset／phase、baseline／pre-isolation／archive Git object、全体／選定hunk、
exact spanとSHA-256、source category、candidate product／phase、legacy implementation status、
hunk分類、compound hold、review-only subunit、negative／counterevidenceをread-onlyに照合する。
合格はresearch premiseの意味同値、要求採否、authority、実装、consumer closure、受入、releaseの
証拠ではない。
