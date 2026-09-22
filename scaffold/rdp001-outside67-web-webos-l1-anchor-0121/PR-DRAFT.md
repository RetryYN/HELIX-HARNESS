## Summary

outside67 Web／Web-OS未処理4 pathを固定holding／pre-isolation／archive bytesと現行L1へ静的照合し、Web 6＋Web-OS 5の11 row-sized anchor候補とREADME context 2件をresearch-only Scaffoldへ登録する。formal unit、phase、実装、縮退、failure、consumer、authorityは生成しない。

Refs #1813（進捗参照のみ）

## Validation

- `validate.py`: 4 source / 11 candidate / 2 context; fixed input digests and snapshot bytes
- `selfcheck.py`: 14 negative cases with expected error codes
- `scfctl validate`, `stale`, `residuals`, `git diff --check`
