# HELIX 新世代 AI 作業規則

## 必須入口

作業前に[新世代作業入口](docs/governance/new-generation-start-here.md)を読み、対象（製品・機構・共通部品）、authority状態、
現在の層、許可された操作、停止条件を確認する。

## 現在の境界

- 日本語で報告し、人間向け文書は日本語で書く。
- 製品と機構を別の区分として扱い、対象数を製品数と言い換えない。現行L1の4対象は、製品のHELIX-HARNESS・HELIX-Webと、管理・運転機構のHELIX-OS・HELIX-Web-OSである。再編案の「8機構＋2共通部品」は構成対象の数え方であり、8製品を意味しない。報告・要求配置では対象ごとの役割とauthority状態を明示する。
- Concept → 対象別L1 → L2／L11 → L3／L10 → 下流pairの順を飛ばさない。
- GitHub、Issue、PR、CI、DB、memory、会話から要求意味・承認・完了を生成しない。
- `archive/legacy-generation-2026-09-14/`内の旧workflow、CLI、hook、adapter、source、test、設定を実行しない。
- 旧資産は意味、判断史、failure、consumerを調べるreferenceとしてだけ読み、新世代のbaseline、oracle、fallbackにしない。
- HELIXの機能を最適化、拡張、再編するときは、設計・実装の前に旧HELIXの対応資産を資産明細台帳から特定し、対応するsource、判断史、failure、consumerを必ず読む。調査したasset ID、保持する契約、変更が必要な差分を記録する。
- 旧HELIXに同じ役割の仕組みがある場合、独自の代替機構を新規開発しない。[旧資産の完全一致再利用統制](docs/governance/legacy-asset-reuse-control.md)に従い、完全一致再利用、意味の再導出、置換のいずれかを明示し、承認された差分だけを現行構造へ反映する。対応資産が無いと判断する場合も、検索範囲と結果を記録してから新規案へ進む。
- この参照義務は旧資産の実行、現行pathへの無判断なcopy、旧CI・旧testをoracleとして使うことを許可しない。
- 新世代CIは未構築である。旧CIを動かさない。
- ユーザーがPR化・PR修正・review依頼を指示した場合、その遂行に必要なGitHubへのpushとCLI／API操作は指示の範囲に含まれる。操作手段ごとの重複確認を求めない。reviewer名だけでreview実行、merge、Issue close、公開の許可を生成しない。
- PR作成・修正側はreview依頼と指摘対応までを担い、merge、post-merge read-after、対応Issueのcloseを実行しない。exact HEADのreviewを完了し、merge／close通路を明示許可されたレビュー対応側が、merge admission確認後にmergeとcloseを行う。この責務割当は通路の明示許可を代替しない。
- 未承認、missing、unknown、conflict、staleでは下流実装へ進まない。仮の物は`scaffold/`名前空間に限り、Scaffold Bindingへ登録して置く。正式な物が入ったら`scfctl check-replacement`→`retire`で置換・撤去し、残留を残さない。
- secrets、PII、credentialsを書かない。不可逆操作、外部公開、release、deploymentは対象と作用を明示した許可を要する。

## 編集と検証

対象ファイルを読んでから編集する。上流整理中の検証は文書revision、ID対応、参照、責務境界の静的確認に限定する。
既存CI、archive内test、archive内runtimeを完了証拠にしない。
