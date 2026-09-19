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
あわせて、下記「独立性についての選択」を判断する。

### lease 1: `merge_executor`

#### 対象にできるPR（すべて満たすPRだけ。一つでも満たさなければ対象外で、人間または人間が明示許可した主体がmergeする）

- repository `RetryYN/HELIX-HARNESS`、base branch `main`、open、draftでない。
- PR区分が`repository_foundation`である。区分は下記review依頼の本文に書かれ、依頼とともにpairへ束縛される。PR本文の区分欄が
  依頼時と変わっていれば対象外とする。reviewerは各依頼で、区分の当否をfindingとして判定する。
  `repository_foundation`以外の区分は、それぞれ固有のmerge admission条件（`requirement`の仮登録・人間decision record等）を持ち、
  executorはそれを検査しないため、対象外とする。
- 差分は、検査したmain HEADとexecutorがlocalで作ったmerge commitの間の`git diff --name-status -M`と`git diff -U0 --text --no-textconv --no-ext-diff`で求める
  （GitHubのfiles APIの件数上限に依存しない。renameは旧pathと新pathの両方を対象として扱う）。
- **authority面の機械的な除外**（どれか一つに当たれば対象外）:
  1. pathが許可集合の外にある。許可集合は`docs/governance/audits/`配下と、`docs/governance/`直下の`.md`・`.jsonl`だけである。
     `docs/concept/`、`docs/helix-*/`、`scaffold/`（検査toolとbindingを含む）、`AGENTS.md`、`CLAUDE.md`、`.github/`等は許可集合の外である。
  2. pathが除外集合にある。除外集合は、`docs/governance/github-upstream-operating-model.md`、`github-upstream-pr-packet.md`、
     `new-generation-start-here.md`、`authority-state-model.md`、`management-provisional-requirement-registration.md`、
     名前に`policy`、`contract`、`packet`、`decision`、`register`、`carry-forward`、`receipt`、`lease`のどれかを含むfile、
     `docs/governance/decisions/`・`candidates/`・`feature-tickets/`・`intake/`・`requirements-source/`・`crosswalks/`の各配下、
     本packetとその判断record、lease記録、lease監査記録、すべての`.gitattributes`（diffの表示を変えて行の検査を逃れられるため）である。
  3. 変更前のfile bytesのSHA-256が、`docs/governance/decisions/`配下のどれかのfile、またはどれかのScaffold Bindingの
     `upstream`に現れる（decision recordやbindingが束縛しているbytesを変えない）。
  4. 追加行または削除行（新規fileを含む）に、次のkeyが現れる。keyの判定は、大文字小文字、`_`と空白の違い、YAML・JSON・
     表（`| authority effect |`等）の書式を区別せずに行う: `authority_effect`、`authority_status`、`decision_status`、
     `decision_record`、`status`（frontmatterまたは文書先頭の状態行）、`human_disposition`、`disposition`、`ratified`、`approved`、
     `carry_status`、`successor`、`requirement_change_authority`。ただし新規fileに`authority_effect: none`を置く行だけは許す。
- **authority面の意味的な確認**: pairに束縛されたすべての応答commentが、`authority_surface_changed: no`（承認・採否・処分・
  carry-forward・承認済みbytesの意味を変えていない）を明示する。`yes`または欠落が一つでもあれば対象外。機械的な除外は
  網羅できないため、reviewerの判定を必須の第2段とする。

#### review証拠（運用モデルの既存のreview依頼手順を使う）

- 各reviewは、GitHub上流運用モデル「review、判断、merge admission」節の手順どおり、review開始前に**依頼comment**（review request
  identity、対象PR、base／content full SHA、依頼本文全文、payload SHA-256）と`review_request_delivery_receipt` commentをPRへ置き、
  review後に**応答comment**（request identity、pair、blocker／major／minorの件数、`authority_surface_changed`、応答全文）を置く。
  投稿の通路は下記規則の意味6による。
- executorはGitHub APIから三者を取得し、request identity、pair、payload SHA-256の一致、依頼→delivery receipt→応答の作成時刻の順、
  すべてのcommentが作成後に編集されていないこと（`updated_at`が`created_at`と一致）を確かめる。
- 分母は、そのpairに束縛された**すべての依頼**である。応答のない依頼、findingが1件以上の応答が一つでもあれば対象外。
  別pairに束縛された依頼と応答は数えない（baseまたはcontentが動いたら、以前のreviewはすべて無効）。
- pairに束縛された依頼は、少なくとも2つの異なるreviewer contextに対するものである。
- context: 作成側、各reviewer、executorはすべて異なるcontext（別agent instanceまたは別session）である。
- executorは、pairに束縛された**すべての**依頼・delivery receipt・応答commentのID、SHA-256、全文を、merge commit message（下記）に記録する。

#### 独立性についての選択（本判断に含める）

作成側、reviewer、executorは、同じGitHub accountと同じ実行環境から動く。context識別子は各主体の自己申告であり、
executorはそれが本当に別主体かを暗号的に検証できない。同一主体がcontext識別子だけ変えて依頼と応答を作れば、上記の
検査はすべて通る。これは技術的な限界であり、本packetの文言では解消できない。POは次のどちらかを選ぶ。

- `accept_bootstrap_risk`: bootstrap期間（期限まで）に限り、この限界を受容する。帰結は次のとおり。
  - 補償統制: review commentの全文、digest、IDをmerge commit messageに残す（改変耐性の限界は下記「記録」）。
  - 監査: POが依頼する外部監査（AI作業系列の外の主体）が、lease mergeの差分をauthority面の観点で読み直し、merge commit messageと
    `merge_result`の整合を確かめる。監査結果はlease監査記録としてrepoへ入れる（lease監査記録はlease対象外で、POがmergeする）。
  - **監査で見つけられないもの**: 両記録はどちらもAI側（作成側とexecutor）が作る。reviewer出力の偽造や、一つの主体が二つの
    context識別子を使ったことは、独立した証拠がないため、事後の監査でもほぼ検出できない。作成側による転記（下記）を許すため、
    なおさらである。監査が実際に担えるのは、authority面の変更の見逃しを差分から見つけることと、記録間の不整合を見つけることである。
    この選択は、偽造と独立性違反を事前にも事後にも止められないことを受け入れるものである。
  - 監査の遅れ: 最後のlease監査記録より後のlease mergeが10件に達したら、executorは次のmergeをしない（監査が入るまで停止）。
  - 停止: authority面の変更の見逃し、記録間の不整合、または何らかの経路で偽造や独立性違反が判明したら、leaseは`suspended`となり、人間判断まで再開しない。
  - 応答commentは、reviewer contextが自ら投稿できない場合（例: 読取り専用sandboxのreviewer）、作成側がreviewerの出力を
    全文そのまま転記してよい。同一accountでは本人投稿と転記に検証上の差がないためである。転記はcommentにその旨を明記する。
- `require_separate_identity`: 作成側、各reviewer、executorを、相互に別のGitHub identity（GitHub Appまたは別account）にする。
  帰結は次のとおり。
  - lease記録にidentity表（role → GitHub login）を置く。commentとpushの投稿者は次のとおりとし、executorはloginを照合する。
    依頼commentと`review_request_delivery_receipt`は、依頼を送る作成側のloginが投稿する（運用モデルの依頼送信・read-after・receipt
    appendの手順どおり）。応答commentは、依頼先として登録されたreviewerのloginが投稿する。mainへのpushと`merge_result`は
    executorのloginが行う。この対応に合わないcommentやpush（例: 作成側loginによる応答、reviewer loginによるpush）があれば対象外。
    作成側による応答の転記は、この選択では認めない。
  - 作成側、各reviewer、executorのidentityは、repositoryのadmin権限を持たない（保護設定を変えられるのはPOのidentityだけ）。
  - POのidentityその他admin権限を持つidentityの資格情報は、作成側・reviewer・executorのどのcontextからも取得・使用できない。
  - 上の2条件を満たす間に限り、保護設定を変えない限り改変できないというmerge記録の性質は、AI側のどのroleからも崩せない。
  - 各identityの資格情報は、他roleのcontextから読めない場所に置く（作成側の実行環境からreviewer・executorの資格情報に触れられない）。
  - 「用意できた」とは、identity表がmainのlease記録にあり、各roleの資格情報の分離、AI側identityがadminでないこと、admin資格情報がAI側contextから隔離されていることをPOが確認した時点を指す。それまでleaseを有効にしない。
  - executorのidentityがmainへ通常pushできるよう、branch protectionの設定を変える必要があれば、それはPOが行う（executorは変えない）。

#### merge前の検査（すべて満たす。一つでも欠けたらGitHubへ一切書き込まずに停止し、理由を報告する）

- 書込み直前に最新mainからlease記録を読み直し、有効（期限内、取消しなし、`suspended`でない、監査の遅れがない）である。
- PR head SHAとmain HEADを再取得し、review証拠のpairと一致する。
- GitHubのmergeableが真。auto-mergeが予約されていない。
- mainのbranch protection（force push禁止、削除禁止、`enforce_admins`有効）と、repositoryのrulesetの一覧とbypass対象を再取得し、
  lease記録に固定した基準値と一致する。一致しなければ停止する。
- `require_separate_identity`の場合、identity表の各loginのrepository権限を再取得し（例: collaborator permission APIで`admin`でない。
  GitHub Appならinstallation権限にadministrationを含まない）、adminであれば停止する。
- review済みcontent HEADとmain HEADから、executorがlocalでmerge commitを作る。`scaffold/`配下がmain HEADとmerge commitで
  bytes単位で同一であることを確かめる（許可集合の外のため、同一でなければ上記の除外に当たる）。そのうえでmerge commitのtreeで
  `scfctl`のvalidate／stale／residuals／selftestとgovcheckを実行し、すべて合格、`stale=0`。toolがmain HEADと同一であるため、
  PRが変えたtoolでPR自身を検査することにならない。

#### 書込み（compare-and-swap）

- 検査したmerge commitを、force pushでない通常のpushでmainへ送る。mainが検査後に1 commitでも動いていれば、GitHubは
  fast-forwardでないpushを拒否するため、検査していない状態のmainへは書き込まれない。push拒否は停止と報告であり、再試行は検査からやり直す。
- 本方式はmerge commit方式であり、GitHub上流運用モデルのmerge admission条件5（merge commit方式で統合し、第1親、第2親、
  content HEADの祖先性をread-afterする）を満たす。merge APIの使用を求める規定は同モデルの「PR #1797」節7だけにあり、lease対象PRには適用しない。
- squash、rebase、force push、auto-merge予約、branch protectionやrulesetの変更、content HEADの変更、branch削除、Issue close、
  release、deploy、外部公開は行わない。

#### 記録（receipt）

- merge commit messageに、lease ID、PR、pair、pairに束縛されたすべての依頼・delivery receipt・応答commentのID・SHA-256・全文、
  各検査の結果、executor contextを書く。mainのforce pushと削除はbranch protectionで禁止され、`enforce_admins`が有効で、
  executorは保護設定とrulesetの変更を禁止されている。したがってexecutorは、この記録の改変を禁止されている。
- **改変耐性の限界**: 2026-09-20時点で作業に使うGitHub accountはrepositoryの管理権限を持ち、保護設定を変えられる。
  `accept_bootstrap_risk`では同じaccountを使うため、そのaccountを使う主体（executorを含む）が保護設定を変えれば記録を書き換え得る。
  executorは下記のとおり保護設定の変化を検出して停止するが、変更そのものは防げない。`require_separate_identity`では、
  AI側のidentityからadmin権限を外すことを条件とするため（上記）、この限界はPOのidentityだけに残る。
- push後、対象PRへ`merge_result` comment（結果、merge commit SHA、親、read-after結果）を置く。merge以外に許すGitHub書込みは、
  この1 commentだけである。
- `merge_result`は次の`operation_change` PRで、repoの台帳へ全文とdigestごと取り込む。

#### merge後

- 第1親＝検査したmain HEAD、第2親＝review済みcontent HEAD、新mainで`scfctl stale=0`、branch protectionとrulesetが基準値から変わっていないこと、`require_separate_identity`の場合は各loginがadminでないことを確認する。
- GitHubがPRをmergedと表示するのは非同期である。push後10分以内にmergedにならなければ、失敗として扱う。
- 不一致・失敗（上記の親、stale、branch protection・ruleset、merged表示、`merge_result`の投稿のどれか）があれば、revertやforce pushで隠さない
  （運用モデル「PR #1797」節7と同じ扱い）。leaseは`suspended`になり、executorは人間が解除するまで次のmergeをしない。
  原因は作成側が監査文書のcorrective PRで扱う。
- 対応Issueのcloseはleaseの範囲外とする（下記規則の意味5）。

### lease 2: `projection_sync`

`projection_sync`は、**mainへ取り込まれ、独立reviewを経たIssue本文fileを、そのbytesのままIssue本文へ写す**操作に限る。
本文の作成・要約・修正はleaseの外であり、通常のPR（review、merge）で行う。`merge_executor`と同じ一つのexecutor commandの中で実行する。

| 項目 | 定義 |
|---|---|
| mapping | lease記録に、Issue番号 → repo内の本文file pathの対応表を置く。表にないIssue、表にないfileは対象外 |
| source | 対応fileの、mainにmerge済みのexact commitのbytes。未merge branch、会話、review所見から本文を作らない |
| 書込み前の照合 | 同じIssueの直前のreceiptがmainへ取り込まれていること（取り込まれるまで、同じIssueへ次の書込みをしない）。書込み直前にremote本文を取得し、そのSHA-256が、main上の直前のreceiptに記録された「写したsource commitとfile SHA-256」と一致する。一致しなければ、他者の編集または未記録の更新があるとみなし、書き込まずに停止する。直前のreceiptのsourceはmainにあるため、変更前本文は常にmainにbackup済みである |
| 書込み | 本文（`body`）だけ。state、label、title、assignee、milestoneの変更、close、commentの削除・編集はしない |
| read-after | remote本文のSHA-256が写したfileと一致、state・label不変。さらにIssueの編集履歴で、今回の書込みの直前の版が照合した版であることを確かめる |
| receipt | 既存の`RDPPROJ-*`形式に、lease ID、source commit、mapping行、書込み前後のremote本文SHA-256を加え、次のPRで投影記録へ取り込む |
| holder | roleを問わない（作成側を含む）。本文は既にreviewとmergeを経ており、写すだけのため |
| 人間を呼ぶ条件 | mappingの追加・変更、書込み前照合の不一致、read-afterの不一致 |

**残存risk**: GitHubのIssue更新APIには条件付き書込みがないため、書込み前の照合からPATCHまでの間に入った他者の編集を
上書きし得る。read-afterの編集履歴照合でこれを検出したら、leaseは`suspended`になり、上書きされた版は編集履歴から人間が復元を判断する。
予防ではなく検出で扱うこのriskを受容するかは、本判断に含まれる。

初回は、Issue #1813の現行本文（SHA-256 `9b47612d…`）をfileとしてmainへ取り込み、それを直前のreceiptとして記録することを前提とする。
それまで#1813は対象にしない。

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
   有効な`merge_executor` leaseを持ち、作成側・reviewerと異なるcontextの主体は、上記の条件を満たしたPRを、人間の追加確認なしでmergeしてよい。
2. 同モデル「review、判断、merge admission」冒頭の「許可されたGitHub Claude通路を用いる」「ローカルClaude CLIをfallbackにしない」:
   同節の依頼comment・delivery receipt・応答commentの手順を満たす独立review（別contextのClaude agent、別contextのcodex等が
   自ら応答commentを置くもの）を、lease対象PRのreview通路として認める。`accept_bootstrap_risk`を選んだ場合に限り、reviewerが
   自ら投稿できないとき、作成側がreviewer出力を全文そのまま転記した応答commentも認める（転記であることをcommentに明記する）。GitHub Claude通路は引き続き使える。
   旧CI、旧test、旧runtimeをfallbackにしない点は変えない。
3. 同モデルのmerge admission条件1（request、delivery receipt、responseの照合）は変えない。上記の独立reviewも同じ三者照合で満たす。
   条件4（merge通路の明示許可）は、lease対象PRでは有効な`merge_executor` leaseで満たす。
4. `operation_change`の必須入力「HELIX-OS要求」: 本Scaffoldの`operation_change` PRについては、承認済みHELIX-OS L1の
   `HELIXOS-L1-003`（許可・予算・依存・独立検証の範囲でWorkerへ委譲する）と`HELIXOS-L1-004`（CI・review・証拠収集の統制）、
   および本decisionで満たす。承認済みのHELIX-OS L2要求はまだない。
5. 同モデル「作成側とレビュー対応側の責務」の「merge admission成立後のmerge、post-merge read-after、対応Issueのcloseはレビュー対応側が行う」:
   lease対象PRでは、mergeとpost-merge read-afterをexecutorが行い、対応Issueのcloseは従来どおりclose通路を明示許可された主体が行う。
6. AGENTS.md 16行（GitHub等の各通路は明示許可が必要）: review依頼・delivery receipt・応答commentの投稿は、対象PRへの
   comment作成だけを行う一つの投稿commandに限る。POは実行環境にこのcommandとexecutor commandだけを許可する。
   GitHub APIへの直接書込み、他のPR・Issueへの書込み、comment編集・削除は許可しない。

## 本packetの承認で成立しないもの

- HELIX-OSまたはHARNESSの要求採択、対象別L2／L11への適用。
- lease記録、上記規則の文言改訂、executor commandの実装、Scaffold Bindingの登録、実行環境の許可設定。これらは後続PRと
  POの設定で行い、そのPRがmainへ入るまでleaseは存在しない。`require_separate_identity`を選んだ場合は、別identityの用意も要る。
- 本packetと判断recordのPR、後続`operation_change` PRのmerge。leaseでlease自身を有効化することはできないため、この2つの
  PRは既存規則のまま、POがGitHubで直接mergeする。

## 手順

1. 本PR: packetのreviewを0件にし、POが判断する。approveなら、判断recordを本PRへ追加して再reviewし、POがmergeする。
2. 後続の`operation_change` PR: lease記録（機械可読。mappingを含む）、executor command、`SCF-B-0003`（上流は本packetと判断record）、
   上記規則1〜6の文言、negative caseを置く。negative caseは少なくとも次について、GitHubへ書き込まないこと（またはsuspendedになること）を確かめる。
   lease失効・取消し・suspended、区分が`repository_foundation`でない、区分欄の変更、許可集合外または除外集合のpath、renameで除外pathへ触れる、
   authority系keyの追加行・削除行・表書式、decisionまたはbindingが束縛するbytesの変更、`authority_surface_changed`が`yes`または欠落、pair不一致、別pairの依頼、応答のない依頼、findingのある応答、reviewer 2 context未満、編集されたcomment、
   依頼より前の応答、作成側またはreviewerとexecutorの同一context、`scaffold/`配下の差分、branch protection・`enforce_admins`・rulesetとbypass対象の基準値からの変化（merge前とmerge後）、`.gitattributes`の変更、監査の遅れ（10件）、identity表のloginのadmin権限、stale≥1、mergeable偽、auto-merge予約、
   push拒否、merge後の親不一致、merged表示の時間切れ、`merge_result`失敗、projection_syncのmapping外・直前receiptの未取込み・書込み前照合不一致・編集履歴不一致、投稿commandによる対象PR以外への書込み。
   POがGitHubで直接mergeする。
3. POが実行環境にexecutor commandと投稿commandだけを許可する。以後、対象PRはexecutorがmergeする。
4. 正式なHELIX-OS委任authority要求をL2／L11へ降ろし、L3／L10から実装を導出して、`SCF-B-0003`を撤去する。

## 人間判断

- `approve`: 2つのlease定義、共通条件、後続PRで改める規則の意味1〜6、`projection_sync`の残存riskの受容を、正式要求が成立するまでの
  Scaffold上流decisionとして承認する。あわせて独立性について`accept_bootstrap_risk`か`require_separate_identity`のどちらかを選ぶ。
- `changes_requested`: 変更する項目（対象PR、許可集合、review証拠、書込み方式、期限、holder、規則の意味等）と理由を指定し、本packetを改訂する。
- `reject`: 現行どおり都度許可とする。

期限（2026-12-31）、merged表示の待ち時間（10分）、`projection_sync`のholder（roleを問わない）、`merge_executor`の対象区分と
許可集合・除外集合は、本packetの提案値であり、POが変更できる。

判断recordには、選択、独立性の選択、actor、判断時刻、本packetのcommit SHAとSHA-256を記録する。判断前は`authority_effect: none`を維持する。
