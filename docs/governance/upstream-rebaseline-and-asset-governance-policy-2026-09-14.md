# 上流再整備と既存資産統制方針

status: draft_policy
created: 2026-09-14
updated: 2026-09-14

## 目的

HELIXの変更管理をGitHub Issue／PRの追跡中心から、ローカルの上流authorityを起点とする管理へ改める。
HELIX-HARNESSとHELIX-OSの責務を分離し、既存資産を上流から再導出して、自動走行で安全に変更・検証・移行・退役できる状態へ整える。

本方針は既存資産の一括削除、runtime切替、Requirement IR更新、release、配布先切替を認可しない。
上流の意味と管理体制を固定し、後続の対象別改訂へ渡す。

## 統制対象

| 対象 | 責務 |
|---|---|
| HELIX-HARNESS | 外部提供する開発基盤。V-model、層、pair、工程、要求・設計・検証契約、進行・完了条件を所有する |
| HELIX-OS | HELIXプロジェクト群の管理・統制機構。authority、Worker、状態、ログ、CI、学習、改善、配布運転を所有する |
| 個別プロダクト | HARNESSを適用して開発し、HELIX-OSが管理する。固有の利用要求・設計・受入を自身の対象別authorityに持つ |

HARNESSとOSを同じ要求、同じ状態機械、同じ完了率へ畳み込まない。HARNESSが規定する条件をOSが適用し、
OSの運用結果をHARNESSまたは個別プロダクトの要求変更候補へ戻す。

## authorityとprojection

| 情報 | authority | projection／証拠 |
|---|---|---|
| Concept・企画・要求・要件 | repo-owned対象別文書、指定JSON、承認revision | README、generated view、DB read model、GitHub link |
| 設計・検証契約 | 対象別の正規layer文書とpair、承認revision | relation graph、coverage view、test report |
| 作業契約 | repo-owned PLAN／assignment contract | GitHub Issue、Projects、branch、PR |
| 実行事実 | event、commit/tree、CI／review／operation receipt | harness.db query projection、dashboard、GitHub表示 |
| 改善候補 | provenance付きproposal、finding、delta | Issue、backlog、通知 |

GitHubは作業・協調・CI・PR証拠のsurfaceである。Issueのopen／close、PR merge、label、Projects列、CI greenから、
要求の追加・削除・採否・合意・実装・受入・退役を生成しない。GitHubで受け取った変更はtyped intakeとして
ローカルauthority候補へ戻し、採否後にだけ下流へ伝播する。

## 上流変更の同期・レビュー境界

上流候補をGitHubへ保存すること、意味を独立reviewすること、人間が採否すること、下流CIで実装整合を検証することを
別operationとして扱う。

| Operation | 目的 | 入力 | 出力 | 禁止事項 |
|---|---|---|---|---|
| local candidate | 上流の意味を起草する | authority source、PO決定、監査差分 | repo-owned candidate revision | Issueや既存実装から意味を補完しない |
| remote sync | 同一revisionを耐久保存・共有する | exact commit/tree、branch | remote commit/tree locator | PR作成、CI起動、承認済み化を暗黙に伴わせない |
| upstream meaning review | 製品境界、要求意味、source completeness、非対象、下流影響を独立確認する | exact candidate revision、source inventory、review観点 | findingまたはreview receipt | 旧実装green、旧CI、PR admissionを意味妥当性のoracleにしない |
| human decision | Concept／L1／L2／L3の所定境界を採否する | exact revision、semantic diff、finding、未解決事項 | actor・scope・revision付きdecision | AI reviewやCIから人間approvalを生成しない |
| downstream verification | 承認上流から導出した設計・実装・projectionを検証する | approved upstream revision、pair、oracle | test／CI／review／operation evidence | 未承認候補をcurrent authorityとして検査しない |

`remote sync`はbranch pushだけで成立できる。上流候補の共有にPRが必須だと仮定しない。PR作成がrepositoryの既存CI、
merge admission、Issue closure、auto-mergeを起動する場合、U0–U4ではそのPRを作らない。上流意味reviewは、対象commitを
read-onlyで取得でき、reviewer identity、review対象revision、source set、finding、判定時刻を記録できる専用laneで行う。
専用laneが未整備なら`review_waiting`で停止し、旧PR／CI経路へfallbackしない。

Claude等の独立reviewerは上流意味reviewを担当できるが、CIを成功させるためのreceipt発行者として扱わない。
reviewerはConcept approval、L2合意、L3承認を代行せず、`pass`も人間decisionを進めない。修正後は新commitを別revisionとして
再reviewし、古いreceiptを新HEADへ流用しない。

PR／CIへ接続できるのは、少なくとも次が揃った後とする。

1. 対象上流revisionとauthority statusが確定している。
2. 変更から導出される下流対象、pair、oracle、expected failureが確定している。
3. 起動するworkflowがそのrevisionの検査目的に適合し、旧authorityへの復帰を要求しない。
4. mergeが進める状態と、進めない状態が明示されている。
5. auto-merge、Issue close、release、deployment等の外部作用が明示的に禁止または許可されている。

既存CIの再設計はU6のprojection切替対象である。U1のConcept候補を旧CIへ通すことで、CI設計の妥当性を証明しない。

## 上流から降ろし直す順序

```text
Concept／責務境界
  → 対象別L1企画
  → 対象別L2利用要求・prototype／非UI適用性・合意
  → 対象別L3要件・L10総合検証
  → L4／L9
  → L5／L8
  → L6／L7
  → L11利用者受入
  → L12運用評価
  → release／deployment／observation
```

上位の意味を変えた場合は、影響する下流を`stale`へし、旧下流のgreenで新上流の未接続を相殺しない。
L2を飛ばしてL1からL3へ接続せず、L2要求とL11受入、L3要件とL10総合検証を別pairとして閉じる。
実装が先に存在しても、上流から導出・採否・検証できるまでcurrent authorityへ昇格しない。

## 既存資産の管理単位

既存ファイル数やIssue数を要求分母にしない。各資産を意味単位へ分解し、次の台帳項目を持つ。

| 項目 | 必須内容 |
|---|---|
| `asset_id`／`revision` | path変更に耐えるidentityと版 |
| `asset_class` | Concept、Requirement、Design、Verification、Implementation、Test、Policy、Runtime、Evidence、Historical |
| `product_target` | HARNESS、HELIX-OS、HELIX-Web等のexact target |
| `authority_status` | canonical、approved_pending、draft、compatibility、historical、unknown |
| `source_provenance` | 原文、採取元、承認対象、digest、判断記録 |
| `upstream_ids`／`pair_ids` | 親Concept／要求と正規V-pair |
| `disposition` | reuse、amend、split、replace、retire、archive、reject、unresolved |
| `implementation_status` | 未設計、設計済み、実装済み、検証済み、運用確認済みを分離 |
| `migration_preconditions` | 新旧parity、consumer、rollback、証拠、承認境界 |

`unknown`を不要と解釈しない。古い名称、古いpath、Issue close、未参照、テスト成功、重複して見える文章だけで削除しない。
機能sourceはbehavior atomへ分解し、HARNESSの工程能力、OSの実行統制、個別製品機能のいずれかへ帰属させる。

## 変更管理

1. **Intake**: 人間指示、ローカル文書差分、運用観測、外部変化、GitHub eventを出典付き候補として受け取る。
2. **Classify**: 対象製品、authority、layer、責務owner、変更種別、影響範囲を確定する。
3. **Upstream decision**: Concept／L1／L2の意味変更と必要な人間判断を、対象revisionへ束縛する。
4. **Derive**: 正規pairに沿ってL3以降の設計・検証義務・実装sliceを生成または更新する。
5. **Execute**: HELIX-OSがWorker、branch、lease、budget、CI、review、証拠を管理して実行する。
6. **Verify**: HARNESSの条件に従い、対象revision、oracle、実結果、独立review、利用者受入、運用評価を分離して確認する。
7. **Admit**: CAS、semantic diff、impact、rollback、全projectionを同一transactionへ束縛してcanonical化する。
8. **Retire**: replacement、parity、consumer切替、rollback、read-afterを確認して旧資産を退役・archive・削除する。
9. **Learn**: 結果を出典付き改善候補へ戻す。観測やAI提案からauthorityを直接変更しない。

変更状態は`proposed → classified → upstream_decided → derived → implemented → verified → accepted → observed`を
別々に保持する。単一の`done`、Issue close、PR mergeで全状態を同時に進めない。

同期・reviewの補助状態は`local_draft → remote_synced → review_waiting → reviewed → human_decided`として別に保持する。
これは成果物のauthority statusを置き換えない。`remote_synced`や`reviewed`を`upstream_decided`へ自動変換しない。

## 自動走行の成立条件

HELIX-OSが自動走行できる資産は、最低限次を満たす。

- 対象製品、上位要求、責務owner、作業scope、許可範囲、停止条件が解決している。
- 対象revision、HEAD、branch、assignment、lease、budget、期限、依存が束縛されている。
- HARNESSが要求する設計・pair・oracle・証拠形式・差戻し先が決まっている。
- unknown、conflict、stale、未承認、未検証を明示し、推測でgreenや完了へ変換しない。
- 作成側と検証側を分け、同一成果の自己承認をしない。
- crash、担当交代、provider停止後もeventとauthorityから再構成できる。
- 外部作用、security、credential、PII、license、production、cutoverの承認境界を越えない。

既存資産がこの条件を満たさない場合は、HELIX-OSへ無理に実行させず、上流再導出またはmigration待ちとして止める。

## 旧資産削除の条件

大規模削除は最初の作業にしない。削除対象ごとに次を満たした後で行う。

1. behavior、要求、設計、検証、consumer、runtime参照を棚卸しした。
2. reuse／amend／split／replace／retire／archive／rejectの判断と根拠がある。
3. replacementへ上流ID、pair、acceptance、failure、rollbackが移管されている。
4. current consumerと実行経路がreplacementへ切り替わり、旧経路を再有効化しない。
5. dual-greenまたは明示されたparity差分、negative oracle、read-afterを確認した。
6. historical evidenceが必要ならarchiveへ隔離し、current startup／runtime／正本検索から外した。

未移管条件が一件でもあれば一括削除しない。削除件数やlegacy token減少は、意味移管と実行経路切替の証拠がある場合だけ前進とする。

## 現在の適用待ち

- Concept v4候補のHarness／Control Plane／DevOS identityを、HARNESS／HELIX-OS境界へ改訂する。
- 柱要求と要件v1.3を対象別L1／L2／L3へ分冊し、正規pairへ再接続する。
- Requirement IRの確認済み意味差分とauthority語彙差分を正規transactionで適用する。
- 既存資産台帳を上記schemaへ収束し、自動走行可能・再導出待ち・退役候補を区別する。
- 下流consumer、runtime、CI、DB projectionは上流freeze後に変更する。
- GitHub branchへのremote syncは行えるが、上流review専用laneが整うまで旧PR／旧CI admissionへ接続しない。

現在の対象別要求と監査は[HELIX L2要求の読取り入口](../design/helix/L2-requirements/README.md)から参照する。
[上流authority管理台帳](upstream-authority-register-2026-09-14.md)を、母集団・状態・正規入口・次の処置の管理面として使う。
[上流再整備の実行backlog](upstream-rebaseline-execution-backlog-2026-09-14.md)を、上流から再導出して旧資産退役まで進める作業契約の入口として使う。
