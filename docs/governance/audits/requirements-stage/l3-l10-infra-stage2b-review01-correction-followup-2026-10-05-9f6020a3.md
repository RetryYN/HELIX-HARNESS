# INFRA Stage 2b #2587 review修正追補

root全文検収で見つかった参照残りを修正しました。本文commit `9f6020a321fc7130d5f565cb12a0ea13af5c0c68` の functional-requirements.md 130行で、007の「特定machine内への情報閉込め」対応caseを C01,C03 から C01,C08 に変更しています。C03は文書のみの入力、C08は消失machine内のみの情報入力です。

この追補の修正対象は上記crosswalk 1行だけです。固定sourceは先行訂正監査 `docs/governance/audits/requirements-stage/l3-l10-infra-stage2b-review01-correction-2026-10-05-9ed70d03.json` が保持する15 pinsから再計算し、全文/raw spanとも一致しました。Stage1 prefixは6/6一致し、現行6 canonical full SHA・サイズ・行数をJSONに記録しました。先行訂正監査はcommit `1b33d234b9bce51f7c0a66e7afe209fcffbf354f` 上で不変です。

push/PR/commentなし。これは作成側の補助修正記録であり、独立review・PO/L3承認を生成しません。旧runtime/test/CI/Bun不実行。
