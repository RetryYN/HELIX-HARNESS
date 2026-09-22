# HELIX-HARNESS FR先頭10 unitの旧実装状態を固定BASEから静的照合

## 変更内容

HELIX-HARNESSのFR先頭10 product unitについて、現行mainの既存FR evidence partitionと、固定BASE `94d99ebb4c55c2edb0575ac2dc100af0d5b93b90` のWave 1–50 edge・旧asset台帳・phase分類・decision/read-afterを照合する研究専用Scaffoldを追加した。

- 10 existing unit / 0 new unit
- 30 Wave edge / 22 unique old asset
- crosswalk行、既存current partition行、ledger/phase/history、旧source Git blob/OID/SHA/line anchorを固定
- Wave 1–17 raw span、Wave 18–50 CR/LF正規化spanのanchor規則をvalidatorで再検証
- 旧実装・縮退・障害・consumer closure・現行実装・受入・未実装を別fieldで保持し、直接unit証拠がないためunknownを維持
- candidate pool、representative asset、semantic edge、source存在をunit implementation proofへ昇格しない
- 旧archiveは静的Git object読取だけで、runtime/test/CI/workflow/hook/adapter/sourceは実行していない

既存218 unitの状態台帳へ追加計上せず、`authority_effect=none`、`new_build_allowed=false` のままにしている。正式な実装・縮退・未実装・受入・authorityの変更は含まない。

## 検証結果

```text
python3 -B scaffold/fr-harness-first10-evidence-0132/build.py
python3 -B scaffold/fr-harness-first10-evidence-0132/validate.py --bundle scaffold/fr-harness-first10-evidence-0132
python3 -B scaffold/fr-harness-first10-evidence-0132/selfcheck.py
python3 -B scaffold/tools/scfctl.py validate
python3 -B scaffold/tools/scfctl.py stale
python3 -B scaffold/tools/scfctl.py residuals
git diff --check
```

進捗参照先: #1813（closeは行わない）。

## 最新検証結果

`validate.py` は `PASS SCF-B-0132`（10 existing unit / 30 Wave edge / 22 unique old asset）。`selfcheck.py` は21負例（selection product scope、BASE/input/output digest、unit/edge/asset重複、ledger/phase/source改竄、status/authority昇格など）をすべてPASS。`scfctl validate` は `bindings=122 fail=0`、`stale=0`、`residuals=0`。`git diff --check` と `git diff origin/main...HEAD --check` もPASS。
