# HELIX 新世代 AI 作業規則

## 必須入口

作業前に[新世代作業入口](docs/governance/new-generation-start-here.md)を読み、対象機構・共通部品と製品属性、authority状態、
現在の層、許可された操作、停止条件を確認する。

## 現在の境界

- 日本語で報告し、人間向け文書は日本語で書く。
- 製品は機構の一部である。HELIX-HARNESSとHELIX-Webは機構のうち外部提供する製品という属性も持ち、HELIX-OSとHELIX-Web-OSは製品ではない機構である。機構数や要求対象数を製品数と言い換えず、役割とauthority状態を対象ごとに示す。
- Concept → 対象別L1 → L2／L11 → L3／L10 → 下流pairの順を飛ばさない。
- GitHub、Issue、PR、CI、DB、memory、会話から要求意味・承認・完了を生成しない。
- `archive/legacy-generation-2026-09-14/`内の旧workflow、CLI、hook、adapter、source、test、設定を実行しない。
- 旧資産は意味、判断史、failure、consumerを調べるreferenceとしてだけ読み、新世代のbaseline、oracle、fallbackにしない。
- HELIXの機能を最適化、拡張、再編するときは、設計・実装の前に旧HELIXの対応資産を資産明細台帳から特定し、対応するsource、判断史、failure、consumerを必ず読む。調査したasset ID、保持する契約、変更が必要な差分を記録する。
- 旧HELIXに同じ役割の仕組みがある場合、独自の代替機構を新規開発しない。[旧資産の完全一致再利用統制](docs/governance/legacy-asset-reuse-control.md)に従い、完全一致再利用、意味の再導出、置換のいずれかを明示し、承認された差分だけを現行構造へ反映する。対応資産が無いと判断する場合も、検索範囲と結果を記録してから新規案へ進む。
- この参照義務は旧資産の実行、現行pathへの無判断なcopy、旧CI・旧testをoracleとして使うことを許可しない。
- 新世代CIは未構築である。旧CIを動かさない。
- 通常のGitHub作業は明示依頼を待たず、作成側がcommit・push・Draft PR作成・指摘修正を進め、修正後HEADの独立review結果を確認してReady化する。新世代CIは未構築のため旧CIを代用せず、静的検証と独立reviewを記録する。旧HELIXのGitHub自走運用の保持点と変更点は[GitHub上流運用モデル](docs/governance/github-upstream-operating-model.md)に記録する。
- 作成側は自分のPRをmergeしない。独立したreview側はexact HEADを読み、findingをPR commentへ記録する。未解消のblockerと現行merge admissionを確認した後、人間の追加approveなしで`gh pr merge --merge`により明示mergeし、read-afterする。GitHub native auto-mergeは使わない。reviewer名だけから旧CLI・旧hook・旧runtimeを起動せず、利用可能な新世代のreview通路を使う。
- 未承認、missing、unknown、conflict、staleでは下流実装へ進まない。仮の物は`scaffold/`名前空間に限り、Scaffold Bindingへ登録して置く。正式な物が入ったら`scfctl check-replacement`→`retire`で置換・撤去し、残留を残さない。
- secrets、PII、credentialsを書かない。通常のGitHub laneのpush・Draft PR・明示mergeに操作ごとの重複許可を求めない。release、tag、cutover、配布repo切替、およびそれ以外の不可逆な外部作用は対象と作用を明示した許可を要する。

## 編集と検証

対象ファイルを読んでから編集する。上流整理中の検証は文書revision、ID対応、参照、責務境界の静的確認に限定する。
既存CI、archive内test、archive内runtimeを完了証拠にしない。
