# INTELLIGENCE Stage 2a root trace follow-up

本文 `80efc436460f869cf5aefe6507693a7f7578a20b` は、#2594の追加検収で確認された二つのtrace問題を限定修正した。既存監査 `l3-l10-intelligence-stage2a-review01-repair-2026-10-05-13e7413c.json` は変更せず、今回の記録からSHA-256 `f6f1f1294d242f200924fc4c9dc52cbbb945f9e87ac420df3e7d80663e43772d` を照合した。

- CASE-INT-066-05sの入力はunknown field欠落に限定した。unknownを根拠なく確定値へ置き換える変異をCASE-INT-066-03cとして分離し、AC-INT-066-03、BR/BV参照、NFR fixture censusへ接続した。期待oracleはunknown保持とLABOへのevidence/state根拠返却。
- CASE-INT-066-05k/lはschema/contract identityまたはversion自体が不明な場合INTELLIGENCEへ戻す。receipt後のversion/scope互換性が不明な条件はCASE-INT-066-08bで扱い、OSへ戻す。

固定L2-066:459–463、固定L11:134–138/285の3source spanを追補し、前回の34 source pinも全件再検算した。合計37 source pins、6文書268行pin。修正後のStage 2a functional CASE識別子は63件。

静的検証は `scfctl validate` 147/0、stale 0、residuals 0、`govcheck` `ok atoms=7622 requirements=57 files=58`、`git diff --check` pass。旧runtime/test/CI/Bunは実行していない。root検収と独立reviewは未了で、PO承認や実測を意味しない。C13/minor/unreviewed carryは未解消のまま保持する。pushなし。
