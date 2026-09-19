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

## 改訂の経緯

POは`fa143dde311e290dcd53526143a1189457ec6012`のbytes（SHA-256 `1a9c87e35e0815b301282f33be1fb0736ad3631377883649e2f0b15bb6a2011b`）を
approve（`accept_bootstrap_risk`）した（PR #1883の判断record、`e7faddd2`〜`40a43663`）。その後、同版には次の設計誤りが見つかった。

- `merge_executor`の対象を`repository_foundation`区分だけに限り、authority面に触れるPRを一律に対象外にしていた。そのため、
  人間が意味を判断済みのPR（#1881の`operation_change`、register行を持つ#1882等）も人間のmergeへ戻り、leaseの目的
  （人間の意味判断の後の機械的なmergeから人間を外す）を果たさなかった。「authority面の意味をAIだけで変えさせない」と
  「authority面を運ぶmergeをexecutorに触らせない」を混同していた。
- 対象外のPR、本PR、後続PR、lease監査記録を「POがmergeする」としていた。人間は意味を判断し、機械的なmergeはAIが行うという
  分担に反する。

本版は、旧HELIXのmerge統合の構造（人間は判断だけ、merge経路は一本、区分ごとの`approval_policy`、判定関数のjoin、HEAD固定のmerge、
read-after、人間判断はAIが記録）を継承して組み直した。executorの対象を区分固有のadmission profileの成立で決め、意味の変化は人間
decision recordへの束縛を必須とし、decision record自体も同じ経路で運び、人間のmergeを手順から除いた。bytesが変わったため、`fa143dde`へのapproveは本版へ継承しない。本版は改めて人間判断に付す。

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

### 旧HELIXから継承する構造

本leaseは新規に発明せず、旧HELIX（`archive/legacy-generation-2026-09-14/root/`。読むだけで実行しない）で運用していた
merge統合の構造を継承し、新世代の責務分離と未構築部分に合わせて変える。

| 旧HELIXの構造 | 典拠（archive root相対） | 本leaseでの扱い |
|---|---|---|
| 人間の直接関与はL0企画・L1要求・L2デザインモックと、L3の承認に限り、L4以降のPR・CI・merge・tagはAIが自動で行う（不可逆操作はescalate）。branch protectionは人間approveを要求しない | `CLAUDE.md:82-85`、`:195-197` | 継承。人間は判断だけを行い、mergeはexecutorが行う |
| mergeの経路は`helix github pr-merge-reviewed`一本。既定はdry-runで`--apply`時だけ書き込む。直接の`gh pr merge`・`gh pr close/reopen`はhookで拒否 | `src/cli.ts:15454-15891`、`src/runtime/git-command-guard.ts:46-54`（検出）、`src/runtime/git-command-guard-hook.ts:206-219`（拒否） | 継承。executor command一本とし、実行環境は直接のmerge・push・APIを許可しない |
| merge可否は一つの判定関数が、review済みHEAD、PR状態、required check、review receipt、未解消block receipt、reviewとauthorの独立性をjoinし、型付きの拒否理由を返す | `src/runtime/claude-pr-convergence.ts:1419-1454` | 継承。下記「admission判定」が同じ形の拒否理由を返す |
| mergeはreview済みHEADに固定する（`--match-head-commit`） | 同`:405-409` | 強めて継承。HEADに加え、検査したmain HEADにもcompare-and-swapで固定する（下記「書込み」） |
| 承認は具体actionへ束縛し、`approval_policy`（none／layer_gate／po_decision／po_intent／action_bound）でdrive routeごとに要否を決める。通常のPR・review・mergeを承認対象に広げない | `docs/governance/drive-route-catalog.md:66-80` | 軸を変えて継承。drive routeではなくPR区分ごとのadmission profileとして定義する（下記「変える点」） |
| 人間の判断は発話、記録はAIが型付きrecordとして作る。承認対象HEADを固定し、範囲外（merge、release、外部作用）へ広げない。人間actorの認証・署名検証は未実装で、後続sliceとされていた | `docs/governance/rlo-819-approval-packet-2026-08-20.md:7-14`、`src/schema/frontmatter.ts:233-254`（:238） | 継承し、未実装だった出所の認証を独立性の選択で扱う（下記`decision_record`） |
| merge後read-afterは、merged観測、merge commit一致、review済みHEADがmerge parentであること、tree一致を確かめ、満たさなければ`merged_unverified`とする | `src/runtime/github-cross-review-admission.ts:704-800` | 継承（下記「merge後」。新main HEADと検査・pushしたmerge commitのSHA・treeの一致を含む） |
| merge authorityはControl Plane／TLだけが持ち、worker・reviewerへ移らない。reviewerは作成者と別identity・別session・独立context | `docs/design/helix/L3-requirements/resident-lane-orchestration-requirements.md:199,215-229`、`management-integration-cell-requirements.md:62-72`、`github-merge-admission-requirements.md:21-24` | merge authorityは継承（executorだけが持つ）。reviewerの別identityは`require_separate_identity`で継承し、`accept_bootstrap_risk`では緩める（下記「変える点」） |

旧HELIXから変える点と理由:

- 旧ではread-onlyの監査AI（AI-B）がmerge判断と実行を兼ねた（`CLAUDE.md:198-205`）。新世代は作成・review・mergeを分け（AGENTS.md 17行）、
  executorは判断せず、reviewer応答と人間decisionをjoinするだけとする。
- 旧のrequired check（`harness-check`）とDB追従receiptは新世代で未構築である。当面は`scfctl`とgovcheckのmerge結果での合格と`stale=0`を
  代わりに要求し、新世代CIが成立したらprofileへ加える。
- 旧の`approval_policy`はdrive routeごとの具体actionに掛かっていた。新世代はPRの区分（運用モデルのPR class）を単位に作業を分けるため、
  承認要否の軸をPR区分へ移す。
- 旧はreviewerを作成者と別identityにすることを要求した（`github-merge-admission-requirements.md:21-24`）。本packetの
  `accept_bootstrap_risk`はこれを緩める選択であり、`require_separate_identity`がこれを継承する選択である（下記「独立性についての選択」）。
- 旧はすべてのreviewerについてruntime・modelが作成者と異なることを求めた。本leaseは、少なくとも1つのreviewerのruntimeとproviderが
  作成側と異なることを求め、残りは別contextでよいとする（同一modelの別contextを1つの独立reviewとして数える）。
- 旧はnative auto-mergeの有効・禁止が文書間で食い違った（`docs/governance/operations-rule-audit-2026-07-26.md:34`、
  `docs/governance/github-operation-rules.md:12-13`）。本leaseはauto-mergeを使わず、executor一本に限る。

### lease 1: `merge_executor`

#### 原則

- **意味判断と運搬の分離**: executorは意味判断（承認、採否、処分、carry-forward、operation authorityの付与、scopeの変更）を
  生成・変更しない。executorが判定するのは「区分固有のadmissionが成立しているか」であり、区分で対象を狭めない。PRに含まれる意味の
  変化は、すべて人間decision record（`docs/governance/decisions/`配下）のexact revisionに束縛されていなければならない。
- **人間はmergeしない**: 人間が行うのは、意味の判断と、実行環境の許可設定・取消し・leaseの停止と再開である。admissionを満たせない
  PRは、人間がmergeするのではなく、止まって人間の判断を求める。人間が判断したら、その判断をdecision recordにし、同じ経路で運ぶ。

#### 対象にできるPR（すべて満たすPRだけ。一つでも満たさなければmergeせず、拒否理由を報告する）

- repository `RetryYN/HELIX-HARNESS`、base branch `main`、open、draftでない。
- **PR区分とadmission profile**: PR区分は下記review依頼の本文に書かれ、依頼とともにpairへ束縛される。PR本文の区分欄が
  依頼時と変わっていれば拒否する。reviewerは各依頼で、区分の当否をfindingとして判定する。executorは区分ごとの
  admission profile（下記）が成立していることを確かめる。profileが未定義の区分は、profileが追加されるまでmergeしない（止まって
  人間を呼ぶ）。bootstrapで定義するprofileは`repository_foundation`、`operation_change`、`decision_record`の3つである。
  `planning_revision`、`requirement`、`design_verification`、`implementation`等のprofileは後から追加する（追加は本decisionの改訂として
  人間判断に付す）。
- 差分は、検査したmain HEADとexecutorがlocalで作ったmerge commitの間の`git diff --name-status -M`と`git diff -U0 --text --no-textconv --no-ext-diff`で求める
  （GitHubのfiles APIの件数上限に依存しない。renameは旧pathと新pathの両方を対象として扱う）。
- **authority面の検出と根拠照合**（検出は拒否の理由ではなく、根拠の照合を要求する引き金である）:
  1. 検出: 次のどれかに当たる差分を「authority面の差分」とする。
     - path: `docs/governance/decisions/`配下（`decision_record` profile以外では、どのrecordの追加・変更・削除も拒否する）、
       `AGENTS.md`、`CLAUDE.md`、`docs/concept/`、`docs/helix-*/`、`scaffold/`（下記の保護面を除く全体。binding、checkのcase、
       evidenceを含む）、`docs/governance/github-upstream-operating-model.md`、`github-upstream-pr-packet.md`、
       `new-generation-start-here.md`、`authority-state-model.md`、`management-provisional-requirement-registration.md`、
       名前に`policy`、`contract`、`packet`、`decision`、`register`、`carry-forward`、`receipt`、`lease`のどれかを含むfile、
       `docs/governance/`の`candidates/`・`feature-tickets/`・`intake/`・`requirements-source/`・`crosswalks/`の各配下。
     - 変更前のfile bytesのSHA-256が、`docs/governance/decisions/`配下のどれかのfile、またはどれかのScaffold Bindingの`upstream`に現れる。
     - 追加行または削除行（新規fileを含む）に、次のkeyまたは語が現れる。keyの判定は、大文字小文字、`_`と空白の違い、YAML・JSON・
       表（`| authority effect |`等）の書式を区別せずに行う: `authority_effect`、`authority_status`、`decision_status`、
       `decision_record`、`status`、`state`（frontmatter、JSONの状態欄、または文書先頭の状態行）、`human_disposition`、`disposition`、
       `ratified`、`approved`、`carry_status`、`successor`、`requirement_change_authority`、「承認」「追認」「採否」「却下」「処分」「有効」「無効」「失効」「取消」「停止」「再開」「完了」「置換」「撤去」「確定」「凍結」。
       語による検出は誤検出を含み得るが、誤検出は`authority_basis`を求めて止まる側に倒す（止まったPRは言い換えではなく根拠の提示で進める）。
       ただし新規fileに`authority_effect: none`を置く行だけは許す。語による検出は網羅できないため、下記3のreviewer判定を必須とする。
  2. 根拠の照合: authority面の差分を持つPRは、review依頼の本文に`authority_basis`（decision recordのID、path、SHA-256の一覧）を持つ。
     executorは、各recordのpathが`docs/governance/decisions/`配下であること、検査したmain HEADに同じSHA-256で存在すること
     （`decision_record` profileでは、同じPRが追加するrecordでもよい。下記）、本PRがそのrecordを変更・削除しないことを確かめる。
     どれかを満たさなければ拒否する。
  3. reviewerの判定: pairに束縛されたすべての応答commentが、`authority_basis_sufficient: yes`（差分による意味の変化が、すべて
     `authority_basis`のrecordが承認した範囲内にある）と`new_authority_created: no`（本PRが、`authority_basis`のrecordにない承認・採否・
     処分・authorityを生成していない）を明示する。authority面の差分が無いPRでも両方を明示する（その場合`authority_basis`は空でよい）。
     どちらかが不適合または欠落なら拒否する。recordは「承認したbytesのpath」と別に「承認が及ぶ範囲のpath集合」
     （`scope_paths`。承認から派生するregister・台帳等を含めてよい）を持てる。`authority_basis`のrecordが`scope_paths`を持つ場合、executorは
     authority面の差分のpathがその和集合に含まれることを機械的に確かめる。`scope_paths`を持たない既存recordを根拠にする場合、範囲の判定は
     reviewerだけに依存する（両選択に共通の残存risk。`accept_bootstrap_risk`ではreviewer判定の偽造で範囲外が通り得る）。
- **保護面**（executorが自分の条件、検査の入力、外部作用の起点を変えないため）: 本packet、lease記録、lease監査記録、executor command、
  投稿command、`scaffold/tools/`、`scaffold/governance/tools/`、検査toolの入力（`scaffold/checks/`、`scaffold/schema/`、
  `scaffold/governance/rules/`、`scaffold/governance/index.md`）、本leaseを担うScaffold Binding、
  `.github/`（workflowはmain上でGitHubの権限を持って動くため）、`.gitattributes`のうち`diff`、`filter`、`merge`、`export-ignore`、
  `export-subst`、`working-tree-encoding`、`ident`のどれかを設定する行（diffやcheckoutの内容を変え得るため。`text`、`whitespace`、`eol`だけを設定する行は
  保護面に含めない。`binary`は`-diff -merge`を含むmacroのため保護面に含める）。保護面を変えるPRは、`authority_basis`のdecision recordが、変更後のそのfileのSHA-256を
  exactに列挙して承認している場合だけ対象になる（人間が変更後のbytesそのものを判断したものだけを運ぶ）。renameは旧pathと新pathの両方で判定する。

#### admission profile（bootstrap）

旧HELIXの`approval_policy`を、PR区分ごとのadmission profileとして定める。どのprofileも、下記のreview証拠、merge前の検査、
根拠の照合をすべて満たすことを前提とし、そのうえで区分固有の条件を加える。

- `repository_foundation`（旧`none`／`layer_gate`相当）: 区分固有の追加入力はない。運用モデルのmerge admission条件と上記の根拠の照合で足りる。
- `operation_change`（旧`action_bound`相当）: 運用モデルが定める必須入力（HELIX-OS要求、操作authority、backup、rollback、read-after）を、
  review依頼の本文がそれぞれrepo内のpathとSHA-256で示し、executorはそれらがmerge commitに同じSHA-256で存在することを確かめる。
  操作authorityは`docs/governance/decisions/`配下の人間decision recordであり、`authority_basis`に含まれる。事後追認の場合、そのrecordは
  実行時点でauthorityが未成立だった事実を残していなければならない（追認を最初からの許可として扱わない）。
  すべての応答commentが`operation_admission: pass`を明示する。本profileが運ぶのは、実行済みの外部操作の記録と、merge自体が外部作用を
  持たない変更だけである。merge自体が外部作用を起こすもの（workflow、配布設定等）は保護面に当たり、変更後bytesを承認したrecordを要する。
- `decision_record`（旧`po_decision`相当）: 人間の判断をmainへ記録するPR。差分は、`docs/governance/decisions/`配下へのrecordの
  新規追加と、そのrecordが変更後のSHA-256をexactに列挙して承認した対象fileだけからなる（既存recordの変更・削除は含まない。訂正は
  新しいrecordで行う）。PRの差分は、record自身と、recordが列挙した対象fileの集合にexactに一致する。対象fileは判断の対象文書に限り、
  実行済み外部操作の記録（backup、rollback、read-after、receipt）は`operation_change`で運ぶ（recordの対象にreceipt・backup等の
  名前を含むfileがあれば拒否する）。recordは次を持つ: 判断の選択、対象のpath・変更後SHA-256、承認の範囲と範囲外、判断者のrole（PO）。
  recordを作るのはAI（作成側）であり、recordはPOの判断を受ける前の提案文である。executorは判断を生成しない。
  - **人間判断の出所（独立性の選択を問わず必須）**: 判断は、identity表の人間判断者（PO）のloginが**そのdecision_record PR**へ投稿し、
    作成後に編集されていないGitHub commentでなければならない。commentの本文は、機械可読な1行`decision: <選択> head: <full SHA>`を含む（選択はapprove等、SHAはrecordを
    含む現在のPR head）。同じPRに人間判断者のcommentが複数ある場合、この行を持つ最新のcommentだけを判断とし、それがreview済み
    content HEADについてのapproveでなければ拒否する。POはrecordの本文（範囲と範囲外を含む）を読んだうえで、そのheadを判断する。executorは、commentの作者login、
    `created_at`＝`updated_at`、commentが含むSHAがreview済みcontent HEADと一致すること、commentの選択がrecordの選択と一致することを
    APIで確かめる。recordはcommentのIDや原文を持たない（commentより前に書かれるため）。executorがcommentのID、作者、本文全文を
    merge commit messageへ記録する。head SHAへ束縛するため、commentはrecordの全文と対象bytesのすべてに束縛される。
    commentの後にheadが変われば、判断は無効になり、新しいheadで判断を受け直す。
  - 人間判断者のloginの資格情報は、作成側・reviewer・executorのどのcontextからも取得・使用できない（下記「AI側identityの分離」）。
    これにより、AI側contextは人間判断を捏造できない。session記録など、AI側が書ける出所は判断の出所として認めない。
  - reviewerは、recordの範囲がrecordの対象を超えないこと、対象の変更がrecordの範囲内であることを`transcription_faithful: yes`で明示する。

#### review証拠（運用モデルの既存のreview依頼手順を使う）

- 各reviewは、GitHub上流運用モデル「review、判断、merge admission」節の手順どおり、review開始前に**依頼comment**（review request
  identity、対象PR、base／content full SHA、依頼本文全文、payload SHA-256）と`review_request_delivery_receipt` commentをPRへ置き、
  review後に**応答comment**（request identity、pair、blocker／major／minorの件数、`authority_basis_sufficient`、`new_authority_created`、
  `operation_change`では`operation_admission`、`decision_record`では`transcription_faithful`、応答全文）を置く。
  投稿の通路は下記規則の意味6による。
- executorはGitHub APIから三者を取得し、request identity、pair、payload SHA-256の一致、依頼→delivery receipt→応答の作成時刻の順、
  すべてのcommentが作成後に編集されていないこと（`updated_at`が`created_at`と一致）を確かめる。
- 分母は、そのpairに束縛された**すべての依頼**である。応答のない依頼、findingが1件以上の応答が一つでもあれば拒否する。
  別pairに束縛された依頼と応答は数えない（baseまたはcontentが動いたら、以前のreviewはすべて無効）。
- pairに束縛された依頼は、少なくとも2つの異なるreviewer contextに対するものである。応答commentはreviewerのruntime、model、provider、
  sessionを持ち、少なくとも1つの応答はruntimeとproviderの両方が作成側と異なる（旧HELIXの`reviewPairFailure`、
  `claude-pr-convergence.ts:486-540`は全reviewerについてruntime・modelの独立を求めた。本leaseは少なくとも1つに緩める）。
- context: 作成側、各reviewer、executorはすべて異なるcontext（別agent instanceまたは別session）である。
- executorは、pairに束縛された**すべての**依頼・delivery receipt・応答commentのID、SHA-256、全文を、merge commit message（下記）に記録する。

#### admission判定

旧HELIXの判定関数と同じく、上記と下記「merge前の検査」の全条件を一つの判定でjoinし、満たさない条件ごとに型付きの拒否理由
（例: `profile_undefined`、`class_changed`、`authority_basis_missing`、`authority_basis_not_on_main`、`protected_surface_unapproved`、
`review_head_stale`、`review_incomplete`、`review_findings_open`、`transcription_unverified`、`operation_input_missing`、`stale_nonzero`、
`protection_baseline_changed`、`lease_inactive`）を返す。既定はdry-runで、判定だけを報告する。書き込みは`--apply`を付け、拒否理由が
0件のときに限る。

#### 停止・取消し・改訂の経路

leaseが有効な間は、上記のprofileすべてをexecutorが運ぶ。停止中・取消し後は、executorは`decision_record`だけを運ぶ。どの状態でも、
人間のmerge、adminの直接push、lease外のmerge通路を前提にしない（executor自身が機能しない場合は下記「非常経路」）。

- **状態の保存**: executorは`suspended`になったとき（原因は「merge前の検査」の冒頭に列挙したものだけ）、(1) executor専用の状態領域
  （作成側・reviewerのcontextから書けない場所。`accept_bootstrap_risk`では同じidentityと実行環境のため、この分離は保証されない）に
  停止理由と時刻を置き、(2) lease記録が指定する状態Issue（1件）へ`lease_state: suspended`と理由のcommentを置く。(2)は`suspended`に
  なるたびに書く（merge以外に許すGitHub書込みは、`merge_result`とこの状態commentの2種である）。executorは
  起動時に(1)と、lease記録にある直近の解除判断より後の(2)の両方を確かめ、どちらかがあれば停止状態として扱う。
- **停止中（期限切れ、`suspended`、監査の遅れ、取消し後）**: executorは`decision_record` profileだけを運ぶ。人間判断者のcommentで
  束縛されたrecordだけが通るため、停止中もAI側は状態を変えられない。運べる判断は次のとおり。
  1. 停止の解除、期限の更新、監査結果の受領（lease監査記録の追加を含む）。
  2. 保護設定・rulesetの基準値と、main更新主体照合の起点の付け直し（停止原因が保護設定の変更やexecutor以外のmain更新だった場合）。
     recordは新しい基準値と起点のSHAを列挙し、人間判断者がそれを判断する。この判断を運ぶmergeでは、旧基準値との一致と旧起点からの
     更新主体照合を行わず、recordが列挙した新しい値と一致することを確かめる。以後の照合（このmergeのmerge後を含む）は、付け直した
     起点と基準値を使う。
  3. 本packetの改訂、lease記録・executor command・検査tool等の保護面の修理、profileの追加、取消し後の再開または別方式への移行。
- **取消し**: 有効なleaseの取消しも、取消しを判断したrecordをexecutorが運ぶ（`revoked_at`を記録）。取消し後、executorは
  `decision_record`だけを運ぶ。取消しでrepositoryのmergeが止まることはない。
- review証拠とmerge前の検査は、上記2の付け直しの場合を除き、通常と同じ条件を満たす。
- **非常経路（executor自身が機能しない場合）**: executor command、GitHub APIの仕様変更、必要なreviewer runtimeの喪失等で
  `decision_record`の判定そのものが実行できない場合に限る。規則3、lease外merge通路の禁止、二重境界に対する唯一の例外である。
  - 主体: identity表の`recovery` role（作成側・reviewerと異なるcontextのruntime）。`require_separate_identity`では専用のloginと
    資格情報を持ち（実効role `write`、他roleのcontextから資格情報を読めない）、`accept_bootstrap_risk`ではAI側loginを使う。
  - 起動: POが実行環境で、`recovery` roleのruntimeに対象1 PRについて非常用command（`gh pr merge --merge --match-head-commit <head>`だけを
    行う）の実行を許可する。許可設定であり、mergeではない。人間はmergeしない。
  - 条件: `recovery`は`decision_record` profileの条件（PO commentのlogin・未編集・最新・head SHA一致、PR差分とrecordの一致、merge結果の検査）を
    自ら確かめる。review証拠は2 context以上を要するが、reviewer runtimeの喪失が原因の場合に限り、providerの違いの要件を外す。
    運べるのは、executorの修理・取消し・別方式への移行・review要件の改訂を判断したdecision_record PR 1件だけである。
  - 記録: GitHubのmerge APIによるため、activityの種類は`pr_merge`となり、executorのpushと区別される。executorは次の起動時にこれを
    executor以外のmain更新として検出し`suspended`とする。再開は、起点の付け直しを判断したrecordで行う（上記2）。

#### AI側identityの分離（独立性の選択を問わず必須）

人間判断者（PO）のGitHub identityと、AI側（作成側・reviewer・executor）のidentityを分ける。2026-09-20時点ではAI側がPOと同じ
accountで動いているため、このままでは人間判断のcommentとAIの投稿を区別できない。leaseの有効化の前に、AI側に別のGitHub identity
（GitHub Appまたは別account）を用意し、POのaccountの資格情報をAI側のどのcontextからも取得・使用できない場所へ移す。これを
POが確認するまでleaseは存在しない。lease記録にはidentity表（role → GitHub login。人間判断者（PO）と、AI側の各role（非常経路の`recovery`を含む））を独立性の選択を
問わず置く。あわせて、独立性の選択を問わず次を満たす: AI側identityの実効repository roleは組み込みの`write`
ちょうど（reviewer専用identityを分ける場合は`read`または`triage`）、GitHub Appならinstallation権限にadministrationとrepository rulesの
書込みを含まない、すべてのrulesetのbypass対象は空、admin権限を持つidentityの資格情報はAI側のどのcontextからも取得・使用できない。
これにより、AI側からは保護設定を変えることも迂回することもできない。

#### 独立性についての選択（本判断に含める）

人間判断者とAI側のidentityは上記のとおり必ず分ける。本節の選択は、AI側の作成側、reviewer、executorをさらに相互に分けるかである。
`accept_bootstrap_risk`では、AI側の作成側、reviewer、executorは、同じAI側GitHub identityと同じ実行環境から動く。context識別子は各主体の自己申告であり、
executorはそれが本当に別主体かを暗号的に検証できない。同一主体がcontext識別子だけ変えて依頼と応答を作れば、上記の
検査はすべて通る。これは技術的な限界であり、本packetの文言では解消できない。POは次のどちらかを選ぶ。

- `accept_bootstrap_risk`: bootstrap期間（期限まで）に限り、この限界を受容する。帰結は次のとおり。
  - 補償統制: review commentの全文、digest、IDをmerge commit messageに残す（改変耐性の限界は下記「記録」）。
  - 監査: POが依頼する外部監査（AI作業系列の外の主体）が、lease mergeの差分をauthority面の観点で読み直し、merge commit messageと
    `merge_result`の整合を確かめる。`decision_record`によるmergeを優先して読む。監査結果はlease監査記録としてrepoへ入れる。lease監査記録は、
    監査者の出力を出所付きで全文転記したものを、人間判断者が受領を判断したdecision recordとして運ぶ（上記「停止・取消し・改訂の経路」）。
  - **監査で見つけられないもの**: 両記録はどちらもAI側（作成側とexecutor）が作る。reviewer出力の偽造や、一つの主体が二つの
    context識別子を使ったことは、独立した証拠がないため、事後の監査でもほぼ検出できない。作成側による転記（下記）を許すため、
    なおさらである。監査が実際に担えるのは、authority面の変更の見逃しを差分から見つけることと、記録間の不整合を見つけることである。
    この選択は、review出力の偽造と独立性違反を事前にも事後にも止められないことを受け入れるものである。人間判断は人間判断者の
    identityで束縛されるため、この選択でも捏造できない。承認済みの意味の範囲外への変更は、reviewerの判定（`authority_basis_sufficient`、
    `new_authority_created`）が偽造された場合に通り得る。これが本選択の残存riskである。
  - 監査の遅れ: 最後のlease監査記録より後のlease mergeが10件に達したら、executorは次のmergeをしない（監査が入るまで停止）。
  - 停止: authority面の変更の見逃し、記録間の不整合、または何らかの経路で偽造や独立性違反が判明したら、leaseは`suspended`となり、人間判断まで再開しない。
  - 応答commentは、reviewer contextが自ら投稿できない場合（例: 読取り専用sandboxのreviewer）、作成側がreviewerの出力を
    全文そのまま転記してよい。同一accountでは本人投稿と転記に検証上の差がないためである。転記はcommentにその旨を明記する。
- `require_separate_identity`: 作成側、各reviewer、executorを、相互に別のGitHub identity（GitHub Appまたは別account）にする。
  帰結は次のとおり。
  - lease記録にidentity表（role → GitHub login。作成側、各reviewer、executor、人間判断者（PO）のloginを含む。人間判断者のloginは`decision_record`の出所の照合にだけ使い、mergeもpushもしない）を置く。commentとpushの投稿者は次のとおりとし、executorはloginを照合する。
    依頼commentと`review_request_delivery_receipt`は、依頼を送る作成側のloginが投稿する（運用モデルの依頼送信・read-after・receipt
    appendの手順どおり）。応答commentは、依頼先として登録されたreviewerのloginが投稿する。mainへのpushと`merge_result`は
    executorのloginが行う。この対応に合わないcommentやpush（例: 作成側loginによる応答、reviewer loginによるpush）があれば対象外。
    作成側による応答の転記は、この選択では認めない。
  - 作成側とexecutorのidentityの実効的なrepository roleは、組み込みの`write`ちょうどである（`admin`、`maintain`、
    custom roleのどれでもない。custom roleには非adminでもruleset編集権限を付けられるため）。各reviewerのidentityは、
    commentの投稿だけを行うため、組み込みの`read`または`triage`とし、mainへpushできない。GitHub Appを使う場合は、
    installation権限にadministrationとrepository rulesの書込みを含まない。
  - repositoryのすべてのrulesetのbypass対象は空である（actorの種別を問わず、どの主体もrulesetをbypassしない）。
  - 実効roleとbypass対象についての上の2条件により、AI側identityからは保護設定を変えることも迂回することもできない。
  - POのidentityその他admin権限を持つidentityの資格情報は、作成側・reviewer・executorのどのcontextからも取得・使用できない。
  - 実効role、bypass対象、admin資格情報の隔離の3条件を満たす間に限り、保護設定を変えない限り改変できないというmerge記録の性質は、AI側のどのroleからも崩せない。
    adminその他ruleset・保護設定を変更できる権限を持つAI以外の主体（POを含む）からは崩せる。
  - 各identityの資格情報は、他roleのcontextから読めない場所に置く（作成側の実行環境からreviewer・executorの資格情報に触れられない）。
  - 「用意できた」とは、identity表がmainのlease記録にあり、各roleの資格情報の分離、作成側とexecutorの実効roleが`write`ちょうど、reviewerの実効roleが`read`または`triage`であること、すべてのrulesetのbypass対象が空であること、admin資格情報がAI側contextから隔離されていることをPOが確認した時点を指す。それまでleaseを有効にしない。
  - executorのidentityがmainへ通常pushできるよう、branch protectionの設定を変える必要があれば、それはPOが行う（executorは変えない）。

#### merge前の検査（すべて満たす。一つでも欠けたらそのPRをmergeせず、拒否理由を報告する）

PR単位の不成立（head・pairの不一致、reviewの未完了・finding、mergeable偽、stale、push拒否等）は、そのPRの拒否であり、GitHubへ書き込まず、
leaseを止めない。activity APIの一時的な取得失敗（通信・rate limit）もPR単位の拒否とし、再試行する。leaseを`suspended`にするのは
次だけである: 保護設定・rulesetの基準値からの変化、AI側loginの実効roleの不一致、main更新主体の照合不一致、activity APIの恒久的な
取得不能（保持期間外、起点以前に達しない）・連鎖切れ、merge後の不一致、`projection_sync`のread-after・編集履歴の不一致、
偽造・独立性違反・authority面の見逃しの判明。監査の遅れは`suspended`とせず、
監査記録が入るまで`decision_record`以外を運ばない。


- 書込み直前に最新mainからlease記録を読み直し、有効（期限内、取消しなし、`suspended`でない、監査の遅れがない）である。有効でなければ、
  上記「停止・取消し・改訂の経路」のとおり`decision_record`だけを運ぶ。
- PR head SHAとmain HEADを再取得し、review証拠のpairと一致する。
- GitHubのmergeableが真。auto-mergeが予約されていない。
- mainのbranch protection（force push禁止、削除禁止、`enforce_admins`有効）と、repositoryのrulesetの一覧とbypass対象を再取得し、
  lease記録に固定した基準値と一致する。一致しなければ停止する。
- identity表のAI側の各loginの実効repository roleを再取得し（両選択に共通。`accept_bootstrap_risk`ではAI側loginは1つ）
  （例: collaborator permission APIの`role_name`が、作成側とexecutor（および`accept_bootstrap_risk`のAI側login）は`write`、別identityのreviewerは`read`または`triage`。GitHub Appなら
  installation権限にadministrationとrepository rulesの書込みを含まない）、それ以外であれば停止する。人間判断者の行はrole検査の対象外とする。
- すべてのrulesetのbypass対象が空であることを確かめ、空でなければ停止する（両選択に共通）。
- mainの更新主体を照合する（両選択に共通）。起点は、leaseを有効にした時点のmain HEAD（lease記録に固定する）と、
  それ以降の最後のlease mergeのうち新しい方である。起点以降の`refs/heads/main`の更新を、GitHubが認証済みのactorとともに記録する
  repository activity API（`GET /repos/{owner}/{repo}/activity`、`ref=refs/heads/main`）から取得し、各更新が、actorがexecutorのlogin（`accept_bootstrap_risk`ではAI側login）で、種類がpush、更新後のcommitがlease receiptをcommit messageに持つmerge commitであることを確かめる。
  leaseの有効後、mainを更新するのはexecutorだけである。
  それ以外（作成側やreviewerのloginによる更新、人間を含む他のactorの更新、force push等）があれば、review外の変更がmainへ入ったとみなし、書き込まずに停止し
  leaseを`suspended`にする。commit objectの`author`／`committer`は自己申告で偽れるため、主体の判定に使わない。
  取得の完全性は次で確かめる。activity APIの応答はpaginationされるため、Link headerのcursorをたどって起点以前の更新に達するまで
  全ページを取得する。取得した起点以降の更新を時系列に並べ、最初の更新の`before`が起点SHA、各更新の`after`が次の更新の`before`、
  最後の更新の`after`が取得時のmain HEADであることを確かめる（連鎖が一つでも切れていれば、取得漏れまたは記録外の更新とみなす）。
  全ページを取得できない、起点以前に達しない（保持期間外、取得失敗）、または連鎖が切れている場合は停止する。
  `accept_bootstrap_risk`でも、AI側loginとそれ以外（POのUI merge、admin push等）は区別できるため、同じ照合を行う。区別できないのは
  AI側の作成側・reviewer・executorの間だけであり、そこはexecutor command以外のpushを実行環境の許可で防ぐ。
- review済みcontent HEADとmain HEADから、executorがlocalでmerge commitを作る。merge commitのtreeで`scfctl`のvalidate／stale／residuals／selftestと
  govcheckを実行し、すべて合格、`stale=0`。検査toolとその入力（`scaffold/tools/`、`scaffold/governance/tools/`、`scaffold/checks/`、`scaffold/schema/`、
  `scaffold/governance/rules/`、`scaffold/governance/index.md`）がmain HEADと
  merge commitで異なる場合（保護面のため、変更後bytesを承認したrecordがあるときだけ起こる）は、merge commitのtreeの一時複製へ
  main HEADのtoolとcaseを重ねた検査も行い、両方の合格を要する。PRが変えたtoolだけでPR自身を検査しない。

#### 書込み（compare-and-swap）

- 検査したmerge commitを、force pushでない通常のpushでmainへ送る。mainが検査後に1 commitでも動いていれば、GitHubは
  fast-forwardでないpushを拒否するため、検査していない状態のmainへは書き込まれない。push拒否はPR単位の拒否であり、再試行は検査からやり直す。
- 本方式はmerge commit方式であり、GitHub上流運用モデルのmerge admission条件5（merge commit方式で統合し、第1親、第2親、
  content HEADの祖先性をread-afterする）を満たす。merge APIの使用を求める規定は同モデルの「PR #1797」節7だけにあり、lease対象PRには適用しない。
- squash、rebase、force push、auto-merge予約、branch protectionやrulesetの変更、content HEADの変更、branch削除、Issue close、
  release、deploy、外部公開は行わない。

#### 記録（receipt）

- merge commit messageに、lease ID、PR、pair、pairに束縛されたすべての依頼・delivery receipt・応答commentのID・SHA-256・全文、
  各検査の結果、executor contextを書く。mainのforce pushと削除はbranch protectionで禁止され、`enforce_admins`が有効で、
  executorは保護設定とrulesetの変更を禁止されている。したがってexecutorは、この記録の改変を禁止されている。
- **改変耐性の限界**: 2026-09-20時点で作業に使うGitHub accountはrepositoryの管理権限を持ち、保護設定を変えられる。leaseの有効化の前提
  （上記「AI側identityの分離」）により、AI側identityは`write`ちょうどで、admin資格情報から隔離される。したがって、保護設定を変えない限り
  改変できないというmerge記録の性質は、両選択ともAI側のどのcontextからも崩せない。POを含む、adminその他ruleset・保護設定を
  変更できる権限を持つ主体（人間、GitHub App等）には残る。executorは保護設定の変化を検出して停止する。
- push後、対象PRへ`merge_result` comment（結果、merge commit SHA、親、read-after結果）を置く。merge以外に許すGitHub書込みは、
  この`merge_result`と、停止時の状態comment（上記「停止・取消し・改訂の経路」）の2種だけである。
- `merge_result`は次の`operation_change` PRで、repoの台帳へ全文とdigestごと取り込む。

#### merge後

- 新main HEADが検査・pushしたmerge commitのSHAと一致し、そのtreeが検査したtreeと一致する（旧HELIXの`merge_commit_mismatch`・tree一致に相当）。
  第1親＝検査したmain HEAD、第2親＝review済みcontent HEAD、新mainで`scfctl stale=0`、branch protectionとrulesetが基準値から変わっていないこと、AI側の各loginの実効roleが上記の値で、すべてのrulesetのbypass対象が空であること、mainの更新主体の照合（上記。起点はmerge前の起点、終点は新main）が成り立つことを確認する。activity APIへの反映は非同期であるため、
  executor自身のpushが現れるまで最大10分待ち、それまでに現れなければ失敗として扱う。
- GitHubがPRをmergedと表示するのは非同期である。push後10分以内にmergedにならなければ、失敗として扱う。
- 不一致・失敗（上記の親、stale、branch protection・ruleset、作成側・reviewer・executorのloginの実効roleが上記の値でない、main更新主体の照合不一致、rulesetのbypass対象が空でない、merged表示、`merge_result`の投稿のどれか）があれば、revertやforce pushで隠さない
  （運用モデル「PR #1797」節7と同じ扱い）。leaseは`suspended`になり（保存先は「停止・取消し・改訂の経路」）、executorは停止の解除を記録したdecision recordが
  mainへ入るまで`decision_record`以外を運ばない。原因は作成側が監査文書に記録し、その記録は解除の判断recordとともに運ぶ。
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

- **停止の共通性**: `suspended`、期限切れ、取消しは両leaseに共通であり、停止中は`projection_sync`も書き込まない。
- **期限**: `expires_at: 2026-12-31T23:59:59+09:00`、または本leaseを担うScaffold `SCF-B-0004`が`retire`された時点の、早い方。
  期限後は無効で、更新は人間判断とし、その判断recordは`decision_record`として運ぶ。
- **取消しと即時停止**: POは次のどれでも止められ、executorは次の書込み前にそれを確かめる。
  1. 実行環境からexecutor commandへの許可を外す（外側の境界。その時点から実行できない）。
  2. executorを動かすsessionへ停止を指示する。
  3. lease記録の`revoked_at`と理由をmainへ入れる（恒久記録。取消しの判断recordを`decision_record`として運ぶ。1で許可を外した後に入れる
     場合は、この記録のためだけにexecutor commandの許可を一時的に戻す）。取消し後もexecutorは`decision_record`を運ぶ。
- **置換先**: 正式なHELIX-OSの委任authority要求と、そのL3／L10から導出する実装。それが入ったら`SCF-B-0004`を
  `scfctl check-replacement` → `retire`で撤去する。
- **二重境界**: 実行環境（Claude Code）の許可は、lease検査を内側に持つ一つのexecutor commandにだけ与える。`gh pr merge`、
  `git push`、GitHub APIでの直接書込みそのものには許可を与えない（例外は非常経路の`recovery` roleへの1 PR限りの許可だけ）。実行環境の許可が「この1コマンドだけ実行してよい」を、
  leaseが「そのcommandの中で何をしてよいか」を決める。
- **意味判断に使わない**: leaseは、要求の意味、approve／reject／split等の判断、scopeの変更、release／deploy／外部公開、
  不可逆・高影響な操作、admission条件を満たせない例外を許可しない。これらは従来どおり人間を呼ぶ。人間が行うのは判断と実行環境の許可設定であり、mergeは行わない。

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
   条件4（merge通路の明示許可）は、leaseの有効後はすべてのPRについて`merge_executor`（停止中・取消し後は`decision_record`だけ）で満たし、
   PR単位のmerge通路の許可を廃止する。例外は、lease有効前の本PRと後続`operation_change` PR（既存の条件4で満たす）と、
   executor機能不全時の非常経路（上記。`recovery` roleがPOの許可設定の下で`decision_record` 1件だけをmergeする）の2つだけである。
4. `operation_change`の必須入力「HELIX-OS要求」: 本Scaffoldの`operation_change` PRについては、承認済みHELIX-OS L1の
   `HELIXOS-L1-003`（許可・予算・依存・独立検証の範囲でWorkerへ委譲する）と`HELIXOS-L1-004`（CI・review・証拠収集の統制）、
   および本decisionで満たす。承認済みのHELIX-OS L2要求はまだない。
5. 同モデル「作成側とレビュー対応側の責務」の「merge admission成立後のmerge、post-merge read-after、対応Issueのcloseはレビュー対応側が行う」:
   lease対象PRでは、mergeとpost-merge read-afterをexecutorが行い、対応Issueのcloseは従来どおりclose通路を明示許可された主体が行う。
6. AGENTS.md 16行（GitHub等の各通路は明示許可が必要）: review依頼・delivery receipt・応答commentの投稿は、対象PRへの
   comment作成だけを行う一つの投稿commandに限る。POは実行環境にこのcommandとexecutor commandだけを許可する。
   GitHub APIへの直接書込み、他のPR・Issueへの書込み、comment編集・削除は許可しない。
7. 同モデル「作成側とレビュー対応側の責務」の`レビュー対応側`の定義（「merge／Issue close通路を明示許可された人またはruntime」）:
   merge、post-merge read-after、Issue closeを行う主体はruntime（作成側と異なるcontext）に限り、人を含めない。人間が担うのは
   意味の判断（approve／reject等）と、実行環境の許可設定・取消し・lease停止である。人間がPRをmergeすることを、通常の手順にも
   例外の手順にも置かない。AGENTS.md 17行・同モデルの他の記述に人間のmergeを前提とする文言があれば、同じPRで同じ意味へ揃える。
8. 同モデルのPR class表（「PR区分」）: `decision_record`（一つの人間判断の記録。入力は判断の選択、対象のexact revision、範囲。判断の出所は人間判断者loginのcomment。
   成立するのは記録された判断。成立しないのは判断の生成、対象外の承認）を追加する。`concept_revision`・`planning_revision`の
   「decision記録を同じPRへ束縛した場合だけ承認revision」は、record＋承認対象fileを一つのPRで運ぶ`decision_record` profileと同じ形であり、
   両区分のprofileを後から追加するときは、この形を使う。

## 既存の未merge PRへの当てはめ（lease有効後の見込み）

- #1882（`repository_foundation`、register 1 file）: path検出でauthority面の差分になる。`authority_basis`をmain上の
  `docs/governance/decisions/concept-v4.1-and-four-l1-approval-2026-09-17.md`とする。このrecordは`scope_paths`を持たないため、
  範囲の判定はreviewerに依存し、reviewerが範囲内と判定すれば対象になる。
- #1881（`operation_change`）: 現状は対象にならない。POの事後追認が`docs/governance/decisions/`配下のrecordでなく、audits配下の
  receiptの中にしかないためである。対象にするには、(1) 追認を、実行時点で操作authorityが未成立だった事実と、POの原文・出所・
  対象revision（#1813本文の3 SHA-256）を持つdecision recordにし、POがそのPRへ判断comment（選択とPR head SHA）を置いたうえで、
  `decision_record` profileでmainへ入れる。(2) #1881をその後のmainへ
  追従させ、`authority_basis`にそのrecordを挙げて再reviewする。#1881の`.gitattributes`は`-whitespace -text`だけを設定するため保護面に当たらない。
- 本PRと後続の`operation_change` PR: leaseで自身を有効化できないため、bootstrapとして既存規則でmergeする（下記）。

## 本packetの承認で成立しないもの

- HELIX-OSまたはHARNESSの要求採択、対象別L2／L11への適用。
- lease記録、上記規則の文言改訂、executor commandの実装、Scaffold Bindingの登録、実行環境の許可設定。これらは後続PRと
  POの設定で行い、そのPRがmainへ入るまでleaseは存在しない。`require_separate_identity`を選んだ場合は、別identityの用意も要る。
- 本packetと判断recordのPR、後続`operation_change` PRのmerge。leaseでlease自身を有効化することはできないため、この2つの
  PRだけは既存規則のまま、merge通路を明示許可されたレビュー対応側（作成側と異なるcontextのruntime）がmergeする（bootstrap）。
  POが行うのはその通路の実行環境の許可設定であり、mergeではない。leaseの有効後は、非常経路を除き、lease外のmerge通路を置かない。

## 手順

1. 本PR: packetのreviewを0件にし、POが判断する。approveなら、判断recordを本PRへ追加して再reviewし、既存規則でレビュー対応側がmergeする。
2. 後続の`operation_change` PR: lease記録（機械可読。mappingを含む）、executor command、`SCF-B-0004`（上流は本packetと判断record）、
   上記規則1〜8の文言、negative caseを置く。negative caseは少なくとも次について、GitHubへ書き込まないこと（またはsuspendedになること）を確かめる。
   dry-run（`--apply`なし）での書込み、`decision_record`の判断commentが人間判断者loginでない・編集済み・対象PR外・head SHAを含まない・review済みHEADと不一致・選択がrecordと不一致、判断comment後のhead変更、PR差分がrecord自身と対象集合に一致しない、recordの対象にreceipt・backup等を含む、session記録を出所とするrecord、
   PR単位の不成立でleaseを`suspended`にする、`suspended`原因以外での状態comment、authority面の差分pathがrecordの承認path集合の外、非常経路で`decision_record`以外を運ぶ、
   停止中・取消し後の`decision_record`以外の運搬、基準値・起点の付け直しを判断recordなしで行う、`suspended`の保存先の片方だけの消失、状態Issue以外への状態comment、
   新main HEADとpushしたmerge commitのSHA・treeの不一致、lease失効・取消し・suspended、profile未定義の区分、区分欄の変更、`operation_change`の必須入力（操作authority record、backup、rollback、read-after）の欠落・SHA-256不一致・`operation_admission`不適合、
   authority面の差分（path、authority系keyの追加行・削除行・表書式、decisionまたはbindingが束縛するbytesの変更）で`authority_basis`が無い・`docs/governance/decisions/`配下でない・mainに無い・SHA-256不一致、PRが`authority_basis`のrecordを変更、
   `authority_basis_sufficient`・`new_authority_created`の不適合または欠落、変更後bytesを承認するrecordのない保護面の差分、renameで保護面へ触れる、
   `.gitattributes`の`diff`・`filter`等の行、`.github/`の差分、`decision_record`で既存recordの変更・削除・承認外fileの同梱・`transcription_faithful`の不適合または欠落・判断行の書式不正・最新の判断commentがapprove以外、`scope_paths`外のauthority面の差分、
   非常経路での`decision_record`以外・複数PRの運搬・`recovery` role以外のmerge、非常mergeの後に`suspended`にならない、
   変更された検査toolとmain HEADの検査toolのどちらかでの不合格、pair不一致、別pairの依頼、応答のない依頼、findingのある応答、reviewer 2 context未満、編集されたcomment、
   依頼より前の応答、作成側またはreviewerとexecutorの同一context、branch protection・`enforce_admins`・rulesetとbypass対象の基準値からの変化（merge前とmerge後）、監査の遅れ（10件）、作成側・reviewer・executorのloginの実効roleが上記の値以外（admin、maintain、custom role、reviewerのwrite）、起点以降のmain更新にexecutorのlease merge push以外の更新がある（人間を含む）、activity APIで起点以降の更新を取得できない、2ページ目以降にだけ現れる更新、before／afterの連鎖切れ、force push（actorを問わない）、merge後10分以内にexecutorのpushがactivityへ現れない、authorだけexecutorに偽ったcommitの直接push、GitHub Appのadministrationまたはrepository rules書込み権限、rulesetのbypass対象が空でない、stale≥1、mergeable偽、auto-merge予約、
   push拒否、merge後の親不一致、merged表示の時間切れ、`merge_result`失敗、projection_syncのmapping外・直前receiptの未取込み・書込み前照合不一致・編集履歴不一致、投稿commandによる対象PR以外への書込み。
   leaseはまだ存在しないため、bootstrapとして既存規則でレビュー対応側がmergeする。
3. POが実行環境にexecutor commandと投稿commandだけを許可する。以後、すべてのPRはexecutorがadmission判定を経てmergeする。admissionを満たせないPRは止まり、人間の判断を
   decision recordにしてから同じ経路で運ぶ。
4. 正式なHELIX-OS委任authority要求をL2／L11へ降ろし、L3／L10から実装を導出して、`SCF-B-0004`を撤去する。

## 人間判断

- 前提: leaseの有効化には、AI側identityの分離（POのaccountとAI側のaccountを分け、POの資格情報をAI側から隔離する）が要る。以後、
  AIが判断の提案をdecision recordとしてPRに置き、POはPOのaccountからそのPRへcomment（`decision: <選択> head: <SHA>`）を置いて判断する。
  executorがcommentをmerge commit messageへ記録する。
- `approve`: 2つのlease定義（admission profile 3区分を含む）、共通条件、後続PRで改める規則の意味1〜8、`projection_sync`の残存riskの受容を、正式要求が成立するまでの
  Scaffold上流decisionとして承認する。あわせて独立性について`accept_bootstrap_risk`か`require_separate_identity`のどちらかを選ぶ。
- `changes_requested`: 変更する項目（対象PR、profile、authority面の検出対象、review証拠、書込み方式、期限、holder、規則の意味等）と理由を指定し、本packetを改訂する。
- `reject`: 現行どおり都度許可とする。

期限（2026-12-31）、merged表示の待ち時間（10分）、`projection_sync`のholder（roleを問わない）、`merge_executor`のbootstrap profile（3区分）と
authority面の検出対象・保護面は、本packetの提案値であり、POが変更できる。

判断recordには、選択、独立性の選択、actor、判断時刻、本packetのcommit SHAとSHA-256を記録する。判断前は`authority_effect: none`を維持する。
