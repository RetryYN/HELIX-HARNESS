## Summary

既存SCF-B-0096／0099でsource調査済みのoutside67 Web／Web-OS 4 pathへ追加L1接続を固定holding／pre-isolation／archive bytesと現行L1へ静的照合し、Web 6＋Web-OS 5の11 row-sized anchor候補とREADME context 2件をresearch-only Scaffoldへ登録する。PATH-007／009／010はSCF-B-0096、PATH-012はSCF-B-0099の先行研究IDをsource itemごとに保持する。formal unit、phase、実装、縮退、failure、consumer、authorityは生成しない。承認decisionでeffective approvedなWeb／Web-OS L1とraw本文metadata（draft／awaiting_parent_approval）を分離し、研究candidate authorityはnoneに保持する。

Refs #1813（進捗参照のみ）

## Validation

- `validate.py`: 4 source / 11 candidate / 2 context; fixed source/input digests and snapshot bytes, with overlap Binding IDs and selected path sets checked without whole-Binding digest pins
- `selfcheck.py`: 16 negative cases with expected error codes, including missing prior research overlap evidence
- `scfctl validate`: 116 bindings, 0 failures; `stale`, `residuals`, `git diff --check`
