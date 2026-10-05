# HARNESS Stage 2c 現行候補概要

- 本文revision: `94cc206b3c85537b4779d721bb7d43c0abd36da6`。作成側のfollow-up修正を含む候補で、独立review・PO承認は未完了です。
- 対象はHARNESS-L2-030/031/032のStage 2c候補。固定main `91660f403d203dff92a50ac7f5484db6ab13f96d` の6文書prefixを保持しています。

## Root follow-up修正

- 030-03: 生成物からrun、pass、acceptance、approvalをそれぞれ個別推論する変異をCASEで拒否。
- 030-02: 旧test例/過去logのみをexpected・permission・scopeの根拠とする変異、承認済requirement/security permission/適用oracleをreference-onlyへ落とす各変異を個別CASE化。
- 031-01: permission欠落、unsanitized protected field、bounded input逸脱、副作用再送をACに明記。対応するCASEには個別変異が既にある。

## 六文書SHA-256

- `docs/helix-harness/L3-requirements/functional-requirements.md` — `0507e96d15a2a5b9c617001ab5ea63c91bb201e768f73adbe215b53a7cc09d62`
- `docs/helix-harness/L3-requirements/business-requirements.md` — `ccb3f6ec5d7b3c51f629f8615977ef25319eae9426fc52d4dae0962fd3f41d5b`
- `docs/helix-harness/L3-requirements/nfr-grade.md` — `65c899c65f3f76c3d36d65ab750305e2460afc1e3d4c77067547c26a7b4aa2a9`
- `docs/helix-harness/L10-verification/functional-verification.md` — `5e3bbd8ca5371aa16d3f7433de0553c769340726c3cbb9e40603353a010304cf`
- `docs/helix-harness/L10-verification/business-verification.md` — `48d60b8752a8bc404cc7a3c0874f3322f93405fabaabe358067daa0945542acf`
- `docs/helix-harness/L10-verification/nfr-verification.md` — `b9e844b83dbbdbac8f79b1cbc4f7df5d9fc32cfbe06a963cd1777d8ccced4c60`

詳細なsource pins、全current line pins、Stage2c suffix pins、変更点は同stem JSON監査に記録しました。旧review01 audit/summaryとその本文revisionは変更していません。

静的確認: `scfctl validate` bindings=147/fail=0、`stale=0`、`residuals=0`、`govcheck` atoms=7622/requirements=57/files=58、`git diff --check` pass。旧runtime/test/CI/Bunは実行していません。

未完了: root最終検収、exact-head独立review、PO/L3承認。
