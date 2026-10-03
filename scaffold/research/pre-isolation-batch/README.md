# RDP-001 PREISOLATION 次候補 12 path / 58 hunk

status: scaffold_candidate_pending_semantic_equivalence_review
authority_effect: none
product_boundary: cross-product candidate reference only
diff_scope: selected_source_items_only

この候補束は、#1934の6 path／9 hunkとSCF-B-0007の6 path／24 hunkに重複しない
12 source pathのrevision差分を、baseline `6fabd12512a3659fff4a956692cdd61faeeb16ce`から
pre-isolation `2d4991042be55268bac30a8bbcdac45b3865030a`までのGit object／hunk単位で保持する。
全体差分は400 files／492 hunks、新束は12 files／58 hunks、先行束のreview済み範囲＋今回のcombined selected scopeは
24 files／91 hunks、未処理分母は376 files／401 hunksである。先行束のreview済み範囲と今回のselected範囲を分けて保持し、これらはhunk-levelの分母であり、
意味要求のatom数ではない。

対象は`PREISO-REV-000009..000014`と`PREISO-REV-000017..000022`。holding、asset、phaseの
snapshotは台帳と照合し、候補product owner／consumer、phase候補、legacy implementation status、
negative／counterevidenceを未確定状態のまま記録する。source categoryとhunk分類は別軸で、分類は
意味同値、要求採否、authority、実装、consumer closure、受入を生成しない。

58 hunkはすべて`compound_hunk_hold`に置き、semantic atom countは0とする。小さな変更箇所のうち
8 fragmentには、原文spanへ接地したreview-only subunit候補を記録したが、これはatom coverageではない。
残り50 fragmentはsubunit未分解のまま保留する。意味同値review、closure、authority昇格、旧runtime／
test／CI実行を行わない。

## 静的確認

```text
python3 scaffold/pre-isolation-batch/validate.py
python3 scaffold/pre-isolation-batch/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

validatorはholding／asset／phase、baseline／pre-isolation／archive Git object、全体／選定hunk、
exact spanとSHA-256、source category、candidate owner／phase／implementation、hunk分類、compound
hold、review-only subunit、negative集合をread-onlyに照合する。合格は意味同値、採否、実装、L2／L3／L10
freeze、authority、release、受入の証拠ではない。旧archiveのruntime／test／CI／hookは実行しない。
