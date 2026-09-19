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

- PR #1882は、未解消finding 0件（Opus／Sol）、exact pair固定、merge結果の`scfctl stale=0`、govcheck合格まで機械的に確認できた。
  それでも最後のmergeは、POの都度許可に加えて実行環境の許可設定を必要とした。2026-09-20、レビュー対応側は2回、
  実行環境のpermission classifierに拒否されmergeできなかった（PR #1882の2026-09-20付merge admission記録comment 2件）。
- 2026-09-19、作成側がIssue #1813本文を操作authorityの確認なしに再投影した。その記録と、POの判断を記録する差分は
  **未mergeのPR #1881**（branch `fix/register-concept-row-and-1813-sync`、commit `cbb37151f7f81ee75fa96940cdbc674555bbfb64`、
  receipt `RDPPROJ-1813-20260919-005`）にあり、review前である。本packetはこの件を、authorityが実行前に確認されなかった実例としてだけ参照する。

どちらも、authorityを「その回の許可」としてしか表現していないことが原因である。意味・価値・scopeの判断は人間、
条件を満たしたかどうかの機械的な判定と実行はAI、という分担に対し、現在の運用は機械的な操作にまで人間の都度許可を要求している。

## 判断対象

次の2つのlease定義、共通条件、後続PRで改める規則の意味を、正式要求が成立するまでScaffoldの上流decisionとして使ってよいか。

### lease 1: `merge_executor`

**対象にできるPR**（すべて満たすPRだけ）

- repository `RetryYN/HELIX-HARNESS`、base branch `main`、open、draftでない。
- PR区分が`repository_foundation`、`research_premise`、`discovery_evidence`、`requirement`、`design_verification`、`implementation`、`operation_change`のどれか一つ。
  `concept_revision`と`planning_revision`は対象にしない。
- 差分が次のpathを一つも変更しない（追加・削除を含む）。これらは人間判断が効力を持つ面、またはleaseそのものを変える面である。
  - `docs/governance/decisions/`配下（decision recordはmainへの取込みで効力を持つため。例: `l2d-s0-approval-and-s1-01-defer-2026-09-19.md`の`authority_effect: effective_when_this_record_is_admitted_to_main`）
  - lease記録、executor command、`scaffold/bindings/SCF-B-0003.json`（後続PRで置くpath）
  - `AGENTS.md`、`CLAUDE.md`、`docs/governance/github-upstream-operating-model.md`、`.github/`配下
  - 本packetと、その判断record
- 差分のどのfileも、frontmatterの`authority_effect`を`none`以外の値へ変えない。

対象外のPRは、従来どおり人間（または人間が明示許可した主体）がmergeする。

**review証拠**（すべて満たす）

- 対象pair（base full SHA、content full SHA）に束縛された`review_receipt`が、少なくとも2つの独立したreviewer contextから、
  PRのcommentとして存在する。各receiptは、review request identity、reviewer（model名とcontext識別子）、対象pair、
  依頼本文のSHA-256、応答本文のSHA-256、blocker／major／minorの件数を持つ。依頼本文と応答本文はreceipt commentに全文を含め、
  executorがSHA-256を再計算して一致を確かめる。
- 「全reviewer」は、そのpairに束縛されたreceiptを持つreviewer contextの全体とする。別pairに束縛されたreceiptは数えない（base
  またはcontentが動いたら、以前のreceiptはすべて無効）。
- 全receiptでblocker／major／minorが0件。
- reviewer contextは作成側contextと異なる。executor contextは作成側contextと異なり、少なくとも一つのreviewer contextとも異なる。
- **残存risk**: 作成側、reviewer、executorは同じGitHub accountと同じ実行環境から動く。context識別子は各主体の自己申告であり、
  executorはそれが別主体であることを暗号的には検証できない。独立性はroleとcontextの分離と、receiptの全文・digestによる
  事後監査で担保する。このriskを受容するかは本判断に含まれる。

**merge前の検査**（すべて満たす。一つでも欠けたらGitHubへ一切書き込まずに停止し、理由を報告する）

- 書込み直前に最新mainからlease記録を読み直し、有効（期限内、取消しなし）である。
- PR head SHAとmain HEADを再取得し、review証拠のpairと一致する。
- GitHubのmergeableが真。auto-mergeが予約されていない。
- review済みcontent HEADとmain HEADから、executorがlocalでmerge commitを作る。そのtreeで`scfctl`のvalidate／stale／residuals／selftestと
  govcheckが合格し、`stale=0`。

**書込み（compare-and-swap）**

- 検査したmerge commitを、force pushでない通常のpushでmainへ送る。mainが検査後に1 commitでも動いていれば、GitHubは
  fast-forwardでないpushを拒否するため、検査していない状態のmainへは書き込まれない。push拒否は停止と報告であり、再試行は検査からやり直す。
- 本方式はmerge commit方式であり、GitHub上流運用モデルのmerge admission条件5（merge commit方式で統合し、第1親、第2親、
  content HEADの祖先性をread-afterする）を満たす。merge APIの使用を求める規定は同モデルの「PR #1797」節7だけにあり、lease対象PRには適用しない。
- squash、rebase、force push、auto-merge予約、branch protectionやrulesetの変更、content HEADの変更、branch削除、Issue close、
  release、deploy、外部公開は行わない。

**merge後**

- 第1親＝検査したmain HEAD、第2親＝review済みcontent HEAD、GitHub上でPRがmerged、新mainで`scfctl stale=0`を確認する。
- 不一致・失敗があれば、revertやforce pushで隠さない（運用モデル「PR #1797」節7と同じ扱い）。leaseは`suspended`になり、executorは
  人間が解除するまで次のmergeをしない。原因は作成側が監査文書のcorrective PRで扱う。
- 対応Issueのcloseはleaseの範囲外とし、従来どおり明示許可された主体が行う。

**receipt**

- executorは、書込みの前に対象PRへ`merge_intent` comment（lease ID、PR、pair、作るmerge commit SHA、各検査結果、executor context）を置き、
  書込み後に`merge_result` comment（結果、merge commit SHA、親、read-after結果）を置く。対象PRへのこの2 commentだけを、merge以外に
  許すGitHub書込みとする。
- `merge_result`を置けない場合、leaseは`suspended`になる。
- receiptは次の`operation_change` PRで、repoの台帳へ全文とdigestごと取り込む。

### lease 2: `projection_sync`

`projection_sync`は、**mainへ取り込まれ、独立reviewを経たIssue本文fileを、そのbytesのままIssue本文へ写す**操作に限る。
本文の作成・要約・修正はleaseの外であり、通常のPR（review、merge）で行う。

| 項目 | 定義 |
|---|---|
| mapping | lease記録に、Issue番号 → repo内の本文file pathの対応表を置く。表にないIssue、表にないfileは対象外 |
| source | 対応fileの、mainにmerge済みのexact commitのbytes。未merge branch、会話、review所見から本文を作らない |
| 書込み前の照合 | 書込み直前にremote本文を取得し、そのSHA-256が「直前に写した本文file（mainにある）」のSHA-256と一致する。一致しなければ、他者の編集または未記録の更新があるとみなし、書き込まずに停止する。これにより、変更前本文は常にmainにbackup済みである |
| 書込み | 本文（`body`）だけ。state、label、title、assignee、milestoneの変更、close、commentの削除・編集はしない |
| read-after | remote本文のSHA-256が写したfileと一致、state・label不変 |
| receipt | 既存の`RDPPROJ-*`形式に、lease ID、source commit、mapping行、書込み前後のremote本文SHA-256を加え、次のPRで投影記録へ取り込む |
| holder | roleを問わない（作成側を含む）。本文は既にreviewとmergeを経ており、写すだけのため |
| 人間を呼ぶ条件 | mappingの追加・変更、書込み前照合の不一致、read-afterの不一致 |

初回は、Issue #1813の現行本文（SHA-256 `9b47612d…`）をfileとしてmainへ取り込むことを前提とする。それまで#1813は対象にしない。

### 両leaseに共通する条件

- **期限**: `expires_at: 2026-12-31T23:59:59+09:00`、または本leaseを担うScaffold `SCF-B-0003`が`retire`された時点の、早い方。
  期限後は無効で、更新は人間判断とする。
- **取消しと即時停止**: POは次のどれでも止められ、executorは次の書込み前にそれを確かめる。
  1. 実行環境からexecutor commandへの許可を外す（外側の境界。その時点から実行できない）。
  2. executorを動かすsessionへ停止を指示する。
  3. lease記録の`revoked_at`と理由をmainへ入れる（恒久記録。1と2の後で入れてよい）。
- **置換先**: 正式なHELIX-OSの委任authority要求と、そのL3／L10から導出する実装。それが入ったら`SCF-B-0003`を
  `scfctl check-replacement` → `retire`で撤去する。
- **二重境界**: 実行環境（Claude Code）の許可は、lease検査を内側に持つ一つのexecutor commandにだけ与える。`gh pr merge`、
  `git push`、GitHub APIでの直接書込みそのものには許可を与えない。実行環境の許可が「この1コマンドだけ実行してよい」を、
  leaseが「そのcommandの中で何をしてよいか」を決める。
- **意味判断に使わない**: leaseは、要求の意味、approve／reject／split等の判断、scopeの変更、release／deploy／外部公開、
  不可逆・高影響な操作、admission条件を満たせない例外を許可しない。これらは従来どおり人間を呼ぶ。

### 後続PRで改める規則の意味（本判断に含める）

後続の`operation_change` PRは、次の意味だけを文言に落とす。意味をここで決め、後続PRは適用だけを行う。

1. AGENTS.md 17行とGitHub上流運用モデル「作成側とレビュー対応側の責務」: 作成・修正側はmergeしない、を維持する。
   有効な`merge_executor` leaseを持ち、作成側と異なるcontextの主体は、上記の条件を満たしたPRを、人間の追加確認なしでmergeしてよい。
2. 同モデル「review、判断、merge admission」冒頭の「許可されたGitHub Claude通路を用いる」「ローカルClaude CLIをfallbackにしない」:
   上記`review_receipt`を持つ独立review（別contextのClaude agent、別contextのcodex等）を、lease対象PRのreview通路として認める。
   GitHub Claude通路は引き続き使える。旧CI、旧test、旧runtimeをfallbackにしない点は変えない。
3. 同モデルのmerge admission条件1（request、delivery receipt、responseの照合）: lease対象PRでは、上記`review_receipt`の
   依頼・応答全文とdigestの照合で満たす。条件4（merge通路の明示許可）は、有効な`merge_executor` leaseで満たす。
4. `operation_change`の必須入力「HELIX-OS要求」: 本Scaffoldの`operation_change` PRについては、承認済みHELIX-OS L1の
   `HELIXOS-L1-003`（許可・予算・依存・独立検証の範囲でWorkerへ委譲する）と`HELIXOS-L1-004`（CI・review・証拠収集の統制）、
   および本decisionで満たす。承認済みのHELIX-OS L2要求はまだない。

## 本packetの承認で成立しないもの

- HELIX-OSまたはHARNESSの要求採択、対象別L2／L11への適用。
- lease記録、上記規則の文言改訂、executor commandの実装、Scaffold Bindingの登録、実行環境の許可設定。これらは後続PRと
  POの設定で行い、そのPRがmainへ入るまでleaseは存在しない。
- 本packetと判断recordのPR、後続`operation_change` PRのmerge。leaseでlease自身を有効化することはできないため、この2つの
  PRは既存規則のまま、POがGitHubで直接mergeする。

## 手順

1. 本PR: packetのreviewを0件にし、POが判断する。approveなら、判断recordを本PRへ追加して再reviewし、POがmergeする。
2. 後続の`operation_change` PR: lease記録（機械可読。mappingを含む）、executor command、`SCF-B-0003`（上流は本packetと判断record）、
   上記規則1〜4の文言、negative caseを置く。negative caseは少なくとも、lease失効・取消し・suspended、対象外PR区分、除外pathの変更、
   authority_effectの変更、pair不一致、別pairのreceipt、reviewer 2 context未満、未解消finding、reviewerと作成側の同一context、
   executorと作成側の同一context、stale≥1、mergeable偽、auto-merge予約、push拒否、merge後の親不一致、`merge_result`失敗、
   projection_syncのmapping外・書込み前照合不一致について、GitHubへ書き込まないこと（またはsuspendedになること）を確かめる。
   POがGitHubで直接mergeする。
3. POが実行環境にexecutor commandだけを許可する。以後、対象PRはexecutorがmergeする。
4. 正式なHELIX-OS委任authority要求をL2／L11へ降ろし、L3／L10から実装を導出して、`SCF-B-0003`を撤去する。

## 人間判断

- `approve`: 2つのlease定義、共通条件、後続PRで改める規則の意味1〜4、独立性の残存riskの受容を、正式要求が成立するまでの
  Scaffold上流decisionとして承認する。
- `changes_requested`: 変更する項目（対象PR、review証拠、書込み方式、期限、holder、規則の意味等）と理由を指定し、本packetを改訂する。
- `reject`: 現行どおり都度許可とする。

期限（2026-12-31）、`projection_sync`のholder（roleを問わない）、`merge_executor`の対象PR区分と除外pathは、本packetの提案値であり、POが変更できる。

判断recordには、選択、actor、判断時刻、本packetのcommit SHAとSHA-256を記録する。判断前は`authority_effect: none`を維持する。
