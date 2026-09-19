# Capability Lease bootstrap 人間判断packet

prepared_at: 2026-09-20
status: awaiting_human_decision
decision_unit: CAPLEASE-BOOT-01
authority_effect: none
base_repository_revision: `3469266e5f7a4b455f98ccd0f40923a40f5e4562`

## これは何か

HELIXの外部操作（PRのmerge、Issue本文の同期）を、人間が一回ずつ許可する形でしか扱えていない。本packetは、
正式な要求とその実装が成立するまでの間に限り、**範囲・条件・失効・取消しを持つ委任（Capability Lease）**を
Scaffoldとして使ってよいかを、exact revisionで人間判断に付す。

本packetの承認は、HELIX-OSまたはHARNESSの要求を採択したことにしない。要求としての正式化は、Concept → 対象別L1 →
L2／L11 → L3／L10の順で別に行う。本packetは、その正式化が済むまでの仮の上流decisionであり、Scaffold Binding
（[scaffold-binding候補](../../candidates/scaffold-binding-requirements.md)、`HDEC-L2D-S0-01`）が求める
「上流の要求またはdecisionとrevisionへの束縛」の束縛先になる。

## なぜ必要か

- 2026-09-20、PR #1882は独立review 0件、exact pair固定、merge結果の`scfctl stale=0`、govcheck合格まで機械的に確認できた。
  それでも最後のmergeだけが、POの都度許可と実行環境の許可設定を必要とした。レビュー対応側は2回、実行環境の
  permission classifierに拒否され、mergeできなかった。
- 2026-09-19、作成側がIssue #1813本文を操作authorityの確認なしに再投影した。POが2026-09-20に事後追認したが、
  実行時点のauthorityは未成立だった（[投影記録](github-requirement-review-program-projection-2026-09-15.md)の`RDPPROJ-1813-20260919-005`）。

どちらも、authorityを「その回の許可」としてしか表現していないことが原因である。意味・価値・scopeの判断は人間、
条件を満たしたかどうかの機械的な判定と実行はAI、という分担に対し、現在の運用は機械的な操作にまで人間の都度許可を要求している。

## 判断対象

次の2つのlease定義を、正式要求が成立するまでScaffoldの上流decisionとして使ってよいか。

### lease 1: `merge_executor`

| 項目 | 定義 |
|---|---|
| scope | repository `RetryYN/HELIX-HARNESS`、base branch `main`へのPR merge |
| allowed_methods | merge commitだけ |
| holder | レビュー対応role。PR作成・修正roleと別のcontext（別agent instanceまたは別session）で起動された主体 |
| principal account | 作成側と同じGitHub accountを許す。独立性はroleとcontextで判定する |
| requires（すべて満たす。一つでも欠けたらmergeしない） | lease有効（期限内、取消しなし）、対象がscope内、方式がallowed_methods内、executorのrole／contextが作成側と異なる、review記録が束縛するexact base／content pairが再取得したmain HEAD／PR head SHAと一致、review記録が作成側と独立したcontextのreviewerから出ている、そのpairのblocker／major／minorが全reviewerで0件、GitHubのmergeableが真、merge結果（`refs/pull/<N>/merge`で親一致を確認、不一致ならlocal試験merge）で`scfctl stale=0`とgovcheck合格、merge後に第1親＝merge前main HEAD・第2親＝content HEADを確認、新mainで`scfctl stale=0` |
| forbidden | force push、squash、rebase、未解消findingありのmerge、admin権限によるbranch protection回避、content HEADの変更、branch削除、Issue close、release、deploy、外部公開、repository設定の変更 |
| receipt | merge毎に、lease ID、PR、base／content／merge commit SHA、各検査の結果、executorのrole／context識別子を記録する |
| 人間を呼ぶ条件 | requiresのどれかを満たせないとき（executorはmergeせず停止して報告する）。requiresを緩める、scopeやforbiddenを変えるとき |

### lease 2: `projection_sync`

| 項目 | 定義 |
|---|---|
| scope | [上流authority管理台帳](../../upstream-authority-register-2026-09-14.md)に投影先として登録済みのGitHub Issueの本文だけ |
| source | mainにmerge済みのrepo文書のexact commitだけ。未merge branch、会話、review所見から本文を作らない |
| holder | roleを問わない（作成側を含む）。sourceがmain上の確定revisionに限られるため |
| requires | 変更前本文をbytesのままrepoへbackupする記録を作る、送信本文とremote本文の完全一致・state・label不変をread-afterする、投影記録へreceiptを追加する、Issue本文に`authority_effect: none`とsourceのexact revisionを書く |
| forbidden | state、label、title、assignee、milestoneの変更、Issueのclose、commentの削除・編集、Issue本文から要求の意味・採否・承認・完了を生成すること、登録されていないIssueやPRへの書込み |
| receipt | 既存の`RDPPROJ-*`形式に、lease IDとoperation authority欄を加える |
| 人間を呼ぶ条件 | 投影先の追加、sourceが未merge、backupまたはread-afterが取れないとき |

### 両leaseに共通する条件

- **期限**: `expires_at: 2026-12-31T23:59:59+09:00`、または下記の置換先が`retire`された時点の早い方。期限後は自動的に無効で、更新は人間判断とする。
- **取消し**: POはいつでも取り消せる。取消しは、lease記録の`revoked_at`と理由をmainへ入れた時点で効力を持つ。取り消されたleaseでexecutorは動かない。
- **置換先**: 正式なHELIX-OSの委任authority（capability lease）要求と、そのL3／L10から導出する実装。それが入ったら、Scaffoldは`scfctl check-replacement` → `retire`で撤去する。
- **二重境界**: 実行環境（Claude Code）の許可は、lease検査を内側に持つ一つのexecutor commandにだけ与える。`gh pr merge`やGitHub APIでの直接書込みそのものには許可を与えない。実行環境の許可が「この1コマンドだけ実行してよい」を、leaseが「そのcommandの中で何をしてよいか」を決める。
- **意味判断に使わない**: leaseは、要求の意味、approve／reject／split等の判断、scopeの変更、release／deploy／外部公開、不可逆・高影響な操作、admission条件を満たせない例外を許可しない。これらは従来どおり人間を呼ぶ。

## 本packetの承認で成立しないもの

- HELIX-OSまたはHARNESSの要求採択、対象別L2／L11への適用。
- lease記録、AGENTS.md・GitHub上流運用モデルの改訂、executor commandの実装、Scaffold Bindingの登録。これらは本decisionを
  上流とする後続の`operation_change` PRで行い、そのPRのreviewとmergeを経て初めて効力を持つ。
- 本packet自身と後続`operation_change` PRのmerge。leaseはそのPRがmainへ入るまで存在しないため、leaseを使ってlease自身を
  有効化することはできない。この2つのPRは既存規則のまま、POがGitHubで直接mergeする。
- 実行環境の許可設定。executor commandへの許可はPOが実行環境に設定する。

## 後続PRに求めること（本decisionが上流として拘束する範囲）

1. `operation_change`として、lease記録（機械可読）、executor command、Scaffold Binding `SCF-B-0003`（上流は本packetと判断record）、
   negative case、AGENTS.md 17行とGitHub上流運用モデル「作成側とレビュー対応側の責務」の改訂を入れる。
2. AGENTS.md等の改訂は「作成・修正側はmergeしない」を維持し、「有効なleaseを持つ独立主体は、merge admissionが成立したPRを
   人間の追加確認なしでmergeしてよい」を加える範囲に限る。
3. executor commandはfail-closedとし、上記requiresのどれか一つでも満たせない場合はGitHubへ書き込まない。
   少なくとも、lease失効・取消し、scope外、方式外、作成側と同じrole／context、pair不一致、未解消finding、stale≥1、
   mergeable偽、merge後の親不一致について、拒否することを確かめるnegative caseを置く。
4. merge admission条件1（review request・delivery receipt・review responseの三者照合）と、現在のローカル独立review記録
   （PR comment）との対応をexecutorがどう検査するかを、同PRで明記する。

## 人間判断

- `approve`: 2つのlease定義と共通条件を、正式要求が成立するまでのScaffold上流decisionとして承認する。後続`operation_change` PRの作成へ進む。
- `changes_requested`: 変更する項目（scope、holder、requires、forbidden、期限等）と理由を指定し、本packetを改訂する。
- `reject`: 現行どおり都度許可とする。

期限（2026-12-31）とprojection_syncのholder（roleを問わない）は、本packetの提案値であり、POが変更できる。

判断recordには、選択、actor、判断時刻、本packetのcommit SHAとSHA-256を記録する。判断前は`authority_effect: none`を維持する。
