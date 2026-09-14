# HELIX 新世代 AI 作業規則

## 必須入口

作業前に[新世代作業入口](docs/governance/new-generation-start-here.md)を読み、対象製品、authority状態、
現在の層、許可された操作、停止条件を確認する。

## 現在の境界

- 日本語で報告し、人間向け文書は日本語で書く。
- Concept → 対象別L1 → L2／L11 → L3／L10 → 下流pairの順を飛ばさない。
- GitHub、Issue、PR、CI、DB、memory、会話から要求意味・承認・完了を生成しない。
- `archive/legacy-generation-2026-09-14/`内の旧workflow、CLI、hook、adapter、source、test、設定を実行しない。
- 旧資産は意味、判断史、failure、consumerを調べるreferenceとしてだけ読み、新世代のbaseline、oracle、fallbackにしない。
- 新世代CIは未構築である。旧CIを動かさない。
- reviewer名や「reviewを通す」という依頼から実行通路を推定しない。GitHub、CLI、API、IDE、Workerの各通路は明示許可が必要である。
- 未承認、missing、unknown、conflict、staleでは下流実装へ進まない。
- secrets、PII、credentialsを書かない。不可逆操作、外部公開、release、deploymentは対象と作用を明示した許可を要する。

## 編集と検証

対象ファイルを読んでから編集する。上流整理中の検証は文書revision、ID対応、参照、責務境界の静的確認に限定する。
既存CI、archive内test、archive内runtimeを完了証拠にしない。
