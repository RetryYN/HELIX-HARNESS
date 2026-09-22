# HELIX-OS FR先頭10 unitの旧実装状態を固定BASEから静的照合

## 変更内容

HELIX-OSのFR先頭10 product unitについて、現行mainの既存FR evidence partitionと、固定BASE `217e3a6e1c3e6ce25205d8330a96e0853c18f61b` のWave 1–50 edge・旧asset台帳・phase分類・decision/read-afterを照合する研究専用Scaffoldを追加した。

- 10 existing unit / 0 new unit
- 30 Wave edge / 23 unique old asset
- crosswalk行、既存current partition行、ledger/phase/history、旧source Git blob/OID/SHA/line anchorを固定
- Wave 1–17 raw span、Wave 18–50 CR/LF正規化spanのanchor規則をvalidatorで再検証
- 旧実装・縮退・障害・consumer closure・現行実装・受入・未実装を別fieldで保持し、直接unit証拠がないためunknownを維持
- candidate pool、representative asset、semantic edge、source存在をunit implementation proofへ昇格しない
- 旧archiveは静的Git object読取だけで、runtime/test/CI/workflow/hook/adapter/sourceは実行していない

既存218 unitの状態台帳へ追加計上せず、`authority_effect=none`、`new_build_allowed=false` のままにしている。正式な実装・縮退・未実装・受入・authorityの変更は含まない。

## 検証結果

```text
python3 -B scaffold/fr-os-first10-evidence-0129/build.py
python3 -B scaffold/fr-os-first10-evidence-0129/validate.py --bundle scaffold/fr-os-first10-evidence-0129
python3 -B scaffold/fr-os-first10-evidence-0129/selfcheck.py
python3 -B scaffold/tools/scfctl.py validate --root .
python3 -B scaffold/tools/scfctl.py stale --root .
python3 -B scaffold/tools/scfctl.py residuals --root .
git diff --check
```

進捗参照先: #1813（closeは行わない）。
