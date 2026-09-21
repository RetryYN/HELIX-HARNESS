# RDP-001 — DELEGATED-DOC-002/013 と DOC-004/029 のatom候補

このdirectoryは、latest-mainのRDP source/reference holdingから、既mergedのDOC-003/028、DOC-008/017、DOC-006/015とsource document ID・reference edge IDが重ならない2つのL3↔L10 pairを束ねたscaffold候補である。

- DOC-002/013: GitHub原子的開発・CI・リファクタリング（L3要件 ↔ L10システムテスト）
- DOC-004/029: GitHub merge admission（L3要件 ↔ L10システムテスト）

source denominatorは4文書／344行／4 coverage span、semantic atomは53件、原IDは45件（L3=32、L10=13）、reference edgeは10件である。atom spanのunion外はDOC-002=14行、DOC-013=4行、DOC-004=12行、DOC-029=4行としてline listとdigestをsource blobごとに保持し、validatorが再計算してfail-closeする。各atomのexact source span、原ID、actor、authority条件、negative条件、HARNESS／HELIX-OSのowner候補、OS consumer候補、旧phase候補、legacy implementation unknown、consumer pendingは`inventory.json`に保持する。固定blobから再計算したAC定義とL10 T→AC参照の差分はDOC-002/013=GH-AC-043、DOC-004/029=GH-AC-021として未解決に残す。本文cross-document参照も意味・owner・authorityを推定しない。DOC-004本文の旧DOC-003相当path参照はholding edgeにないため、missing referenceとして明示する。

`authority_effect: none`、`meaning_change_applied: false`、successor空、人間decision null、採用なし、holding closure未実施を固定する。validator／selfcheck／scfctlの合格はatom化完了、採用、L3/L10 freeze、実装、consumer closure、acceptance、CI、releaseを意味しない。旧runtime・test・CI・hook、GitHub、Issue、DBは実行・更新しない。

```text
python3 scaffold/delegated-doc-002-013-004-029/validate.py
python3 scaffold/delegated-doc-002-013-004-029/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
```
