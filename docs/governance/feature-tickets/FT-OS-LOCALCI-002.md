# FT-OS-LOCALCI-002

作業種別: 開発repository専用CIの実装と検証

作業内容: [Stage 1実装・CI解禁判断](../decisions/stage1-implementation-and-ci-unlock-po-decision-2026-10-09.md)の判断2と、正本の[local CI L4](../../helix-os/L4-basic-design/local-ci.md)・[L9](../../helix-os/L9-integration-verification/local-ci-integration-verification.md)・[L5](../../helix-os/L5-detail-design/local-ci-detail-design.md)・[L8](../../helix-os/L8-detail-verification/local-ci-detail-verification.md)・[L6](../../helix-os/L6-function-design/local-ci-function-design.md)・[L7](../../helix-os/L7-unit-test-design/local-ci-unit-test-design.md)に従い、仮設local CI driverと最小Actions照合を構築する。固定5検査、exact targetと外部receipt、明示manifest、親ACの未検証記録、local/provider別Git identity、隔離runtimeの準備とpreflightを実装し、L7の単変異oracleと実local 5検査で検証する。provider初回はidentity-only観測とし、正本設計どおり別途pinを固定してからlocal receiptを再生成し、選択済みDIFFのparityを照合する。作成側の独立review対応と、review側による明示merge・post-merge read-afterまで進める。
