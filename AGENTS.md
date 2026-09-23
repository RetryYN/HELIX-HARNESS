# HELIX 新世代 AI 作業規則

## 必須入口

作業前に[新世代作業入口](docs/governance/new-generation-start-here.md)を読み、対象機構・共通部品と製品属性、authority状態、
現在の層、許可された操作、停止条件を確認する。

## 再構築の原則

本repositoryは旧HELIXの再構築であり、新構築ではない。旧HELIXの「inventory-first」規則
（既存を見ずにtop-downで起こさず、対象に旧HELIXを必ず含める。旧`CLAUDE.md`「旧 HELIX ソースリポジトリ」）を引き継ぐ。

- 規則、運用、工程、役割分担、承認手続き、要求、設計、仕組みを追加・変更・提案するときは、先に旧HELIX
  （`archive/legacy-generation-2026-09-14/`と[資産明細台帳](docs/governance/legacy-asset-disposition.jsonl)）の対応箇所を読み、それを起点にする。
  旧source、判断史、failure、consumerを確認し、参照したasset IDまたはpath・行を記録する。
- 旧HELIXに根拠のない規則、制約、許可・承認手続き、代替機構を推測で新設しない。
  同じ役割の仕組みがある場合は、[旧資産の完全一致再利用統制](docs/governance/legacy-asset-reuse-control.md)に従い、
  完全一致再利用、意味の再導出、置換のいずれかを明示する。
- 旧HELIXと異なる内容にするときは、旧source、保持する点、変更する点、変更理由を記録し、人の判断を経る。
  旧資産の不在、未完成、旧runtimeの存在だけを変更理由にしない。
- 対応する旧記述が見つからない場合は、検索範囲と結果を記録し、新規案であることを明示して人に提示する。
- 報告、review、指摘でも、旧HELIXとの対応を確認せずに現行の規則文言だけを根拠にしない。現行文言が旧HELIXと
  食い違い、差分の記録がない場合は、その食い違いを指摘する。
- 文書は同じファイルを更新する。版ごとの別ファイル、`_vN`などの版付きの名前、日付付きの複製を作らない。旧HELIXの駆動モデル（VERSION_UPは項目に`version_target`の印を付けて将来版へ保全し、ADD_FEATUREは既存の層の文書へ差分を追補する）に従い、版は項目に付ける印と文書内の改訂履歴で表す。過去の本文はgitの履歴で辿る。承認や判断の記録は、対象のcommitと本文のSHA-256で過去の本文を指す。
- 参照は読むことに限る。旧workflow、CLI、hook、adapter、source、test、CI、設定を実行せず、
  旧testや旧CIの合格を新世代の合格証拠やfallbackにしない。現行pathへ判断なしにcopyしない。

## 現在の境界

- 日本語で報告し、人間向け文書は日本語で書く。
- 製品は機構の一部である。HELIX-HARNESSとHELIX-Webは機構のうち外部提供する製品という属性も持ち、HELIX-OSとHELIX-Web-OSは製品ではない機構である。機構数や要求対象数を製品数と言い換えず、役割とauthority状態を対象ごとに示す。
- Concept → 対象別L1 → L2／L11 → L3／L10 → 下流pairの順を飛ばさない。
- GitHub、Issue、PR、CI、DB、memory、会話から要求意味・承認・完了を生成しない。
- 新世代CIは未構築である。旧CIを動かさない。
- 通常のGitHub作業は明示依頼を待たず、作成側がcommit・push・Draft PR作成・指摘修正を進め、修正後HEADの独立review結果を確認してReady化する。新世代CIは未構築のため旧CIを代用せず、静的検証と独立reviewを記録する。旧HELIXのGitHub自走運用の保持点と変更点は[GitHub上流運用モデル](docs/governance/github-upstream-operating-model.md)に記録する。
- 作成側は自分のPRをmergeしない。独立したreview側はexact HEADを読み、findingをPR commentへ記録する。未解消のblockerと現行merge admissionを確認した後、人間の追加approveなしで`gh pr merge --merge`により明示mergeし、read-afterする。GitHub native auto-mergeは使わない。reviewer名だけから旧CLI・旧hook・旧runtimeを起動せず、利用可能な新世代のreview通路を使う。
- 未承認、missing、unknown、conflict、staleでは下流実装へ進まない。仮の物は`scaffold/`名前空間に限り、Scaffold Bindingへ登録して置く。正式な物が入ったら`scfctl check-replacement`→`retire`で置換・撤去し、残留を残さない。
- secrets、PII、credentialsを書かない。通常のGitHub laneのpush・Draft PR・明示mergeに操作ごとの重複許可を求めない。release、tag、cutover、配布repo切替、およびそれ以外の不可逆な外部作用は対象と作用を明示した許可を要する。

## 編集と検証

対象ファイルを読んでから編集する。上流整理中の検証は文書revision、ID対応、参照、責務境界の静的確認に限定する。
既存CI、archive内test、archive内runtimeを完了証拠にしない。
