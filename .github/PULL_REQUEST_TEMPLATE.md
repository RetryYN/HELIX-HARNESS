## PRの目的

<!-- このPRで成立させる結果を日本語で書く -->

## PR区分

<!-- 必ず一つ記入する: repository_foundation / concept_revision / planning_revision / research_premise / discovery_evidence / requirement / design_verification / implementation / operation_change -->

未選択

## ローカル正本

- 対象product:
- 親Concept revision:
- 親Vision／L1企画revision:
- premise packetまたはresearch非適用判断:
- 要求IDまたはFeature Ticket ID:
- 正本path:
- 対象HEAD:

## 対象範囲

- このPRで変更するもの:
- このPRでは変更しないもの:
- 依存するPR／ticket:
- 後続へ渡すもの:

## 要求PRの場合

<!-- requirement以外では「非該当」と理由を書く -->

- 要求identity:
- kind: `unit` / `connection` / `composite`
- actor／目的:
- scope／non-goal:
- 制約・失敗・回復:
- 対になるL11:
- 使用した旧source asset IDと採否:
- 管理層の仮登録ID／record path:
- 要求候補semantic digest:
- source atom集合ref／digest:
- 無損失被覆receipt（`coverage_result: no_loss`）:
- 今回保持するatom／別の生存中仮登録へ残すatom／人間decision対象atom:
- 未計上atom（merge時は空）:
- 対象HEADでの仮登録read-after:

## 検証

- 実施した静的確認または新世代oracle:
- 未実行の確認と理由:
- GitHub Claude review comment:
- 最終review記録の対象HEAD（指摘0を確認したexact revision）:
- 上のHEADとmerge対象HEADが一致するか（一致しない場合はmergeしない。指摘反映後は最終HEADで再確認する）:
- 未解消Blocker／Major:
- `scaffold/`または正式実装に触れた場合、`scfctl validate`／`stale`／`residuals`／`selftest`の出力（差し替え忘れ防止）:

旧CI、旧test、旧runtimeの結果を新世代の合格根拠にしない。

## 判断とmerge条件

- 人間判断の対象revision／記録:
- 管理層の仮登録状態（`registered_proposal`、`authority_effect: none`）:
- 満たしたmerge条件:
- 未成立のもの:

PR merge、Issue close、check greenだけから要求承認、実装完了、受入、公開を生成しない。

## 旧要求carry-forward（該当時）

- 原要求ID:
- 原文digest:
- successor要求ID:
- 保持した意味atom:
- 未被覆atom（削除せずpending）:
- 意味変更／retireの人間decision（該当時のみ）:
