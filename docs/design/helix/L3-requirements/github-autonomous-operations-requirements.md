---
title: "GitHub 自律運用 要件定義"
layer: L3
kind: add-design
status: draft
created: 2026-07-18
updated: 2026-07-22
owner: PO / TL
pair_artifact: docs/test-design/helix/github-autonomous-operations-acceptance.md
---

# GitHub 自律運用 要件定義

- 文書層: L3 要件定義
- status: confirmed（PO指示「要件をすべて見直して修正完遂する」2026-07-18）
- 対応上位: `helix-charter_v0.1.md` P0/P1/P3/P4/P6/P7/P9
- 参考資産: `unison-ai-product/UT-TDD_AGENT-HARNESS`（2026-07-18 全 refs・PR・Issue・Ruleset 観測）
- 適用原則: UT は詳細チーム版の参考実装であり、HELIX の権威ではない。採用時は個人開発の無人自走境界へ合わせて強化する。

## 1. 完了状態

HELIX は、L3 承認後の作業を Issue / PLAN / branch / commit / PR / CI / merge / tag / memory の連鎖として機械管理し、各成果を `harness.db` と GitHub の双方から逆引きできなければならない。GitHub 上の緑表示だけ、ローカルの成功だけ、AI の完了宣言だけでは完了にしない。

## 2. 運用オブジェクト

| オブジェクト | 正本責務 | 禁止 |
|---|---|---|
| Requirement / AC | 何を満たすか、どう判定するか | Issue 本文だけを要件正本にする |
| PLAN | route、layer、pair、生成物、検証責務 | PLAN のない実装着手 |
| Issue | 観測事実、外部差し込み、逸脱 episode | Issue から直接コードへ飛ぶ |
| Branch | 1 episode の隔離された変更線 | main 直 push、複数目的の混載 |
| PR | trace と evidence の審査・合流単位 | 必須 trace block の手書き偽装 |
| CI | 再現可能な機械検証 | AI judgement の代替、失敗の無視 |
| Tag | 承認済み layer/release checkpoint | CI 未完了 HEAD へのタグ |
| Memory / DB | 判断、失敗、改善、継続点の永続化 | chat/prose handover のみで引継ぐ |

## 3. 機能要件

### GH-FR-001 Issue受付ゲート

Issue は `origin_plan`、`origin_revision`、`observed_head`、`observed_state`、`evidence_path_or_digest`、`reason_code`、`drive_model`、`reentry_target`、`requirement_ids`、`acceptance_ids` を型付きで保持する。欠落時は自動走行へ admission しない。ユーザー差し込み Issue も同じ schema へ正規化し、正本を直接更新せず command candidate として扱う。

### GH-FR-002 Issue分類体系

最低限 `forward`、`reverse`、`scrum_reverse`、`redesign`、`design_refactor`、`performance_refactor`、`retrofit`、`recovery`、`incident`、`nfr_failure`、`measurement_finding`、`discovery`、`additive_change`、`security` を区別する。ReverseはForward合流前の先行タスク、Scrum ReverseはsliceをVモデル資産へ戻すcheckpoint、Redesignは確定設計変更、Design/Performance Refactorは外部契約を保つ構造/性能改善とする。分類不能・複数分類衝突は`full_v`へfail-closeする。

### GH-FR-003 無駄な機能拡張の遮断

Issue/PR の changed scope は requirement ID と AC ID の閉包内でなければならない。要求に無い新機能、便乗 refactor、名称変更、依存更新を検出した場合は別 Issue へ分離し、元 PR を block する。ただし correctness/security の即時修正は根拠と再合流先を記録した Recovery として扱う。

### GH-FR-004 経路選択

入口で次の route を機械決定し、途中で暗黙変更しない。

| 条件 | route |
|---|---|
| 本格システム、高リスク、複数境界、未知/衝突 | `FULL_L1_L12_V` |
| 段階リリース、小規模かつ既知境界 | `PRODUCTION_SCRUM`（旧`PRODUCTION_SCRUM_REDUCED_V`は入力互換のみ） |
| 非本番の仮説探索 | `DISCOVERY_POC` |

PoC は S0–S4 の決定後にのみ Forward/Reverse へ昇格する。Production Scrum は品質工程の省略ではなく、機能slice単位でL1〜L12縮約Vを反復し、release合流時に全right-arm evidenceを満たす。

### GH-FR-005 branchライフサイクル

branch は最新 main の確認済み SHA から作り、`feat/`、`fix/`、`refactor/`、`docs/`、`test/`、`chore/`、`reverse/`、`redesign/`、`recovery/`、`incident/` の型付き prefix と PLAN/Issue ID を持つ。1 branch = 1目的を原則とし、並行 runtime は他者 branch を書き換えない。merge 後は自動削除し、長期化 branch は stale finding を発生させる。

### GH-FR-006 commit完全性

commit は Conventional Commits、明示 path staging、secret/PII/license scan、生成物 provenance を必須とする。`git add .` / `git add -A`、force push、履歴破壊、理由のない generated file 混載を禁止する。secret scan は現在 tree だけでなく push 対象 commit の履歴 blob も検査する。

### GH-FR-007 PR追跡契約

PR は概要、PLAN/Issue、route、layer、Forward/Reverse pair、requirement/AC、変更 scope、非対象、test/evidence、risk、rollback、generated artifacts、AI runtime/role、review receipt を機械可読 block で持つ。block は CLI 生成し、validator が source ledger と照合する。通常 Forward は無理に Issue を要求しないが、Issue 起点 episode は `Closes #N` を必須とする。

### GH-FR-008 runtime間レビュー

作成 runtime と判断 runtime を分離する。Claude Code は依存・接続・外部/詳細設計・改善候補を監査し、Codex は凍結設計に基づく実行を担う。単一 runtime 時は独立 subagent receipt を代替証跡として残す。レビュー所見は severity、requirement/AC、evidence、disposition を持たなければ merge blocker にできない。

### GH-FR-009 CI集約ゲート

main の required check は安定名 `harness-check` の集約 gate とする。Linux canonical full verification と Windows compatibility smoke を最低限含み、対象 OS 方針に応じ macOS smoke を追加する。集約 job は `always()` で全 required leg の結論を評価し、cancelled/skipped/failure を成功扱いしない。PR は全 base branch で起動し、stacked PR を取りこぼさない。

### GH-FR-010 repository ruleset要件

main は PR-only、required `harness-check`、strict up-to-date、non-fast-forward 禁止、branch deletion 禁止、force push 禁止、bypass actor なしを要求する。人間 approval は solo 自己ブロックを避けるため必須にせず、代わりに独立review receiptを機械必須とする。authoring policy と GitHub 現物を read-only diff し、drift 時は fail-close する。

### GH-FR-011 CI自己修復

AI が作成した PR の CI が失敗した場合、同じ episode 内で failure log を取得し、原因分類、Issue/PLANへの記録、修正、局所検証、再 push を行う。無根拠 rerun、テスト削除、閾値緩和、required leg の除外で緑化してはならない。反復上限到達時は Recovery/Incident へ遷移する。

### GH-FR-012 merge・release境界

全 gate、review receipt、trace closure が揃えば auto-merge を設定できる。main merge 後にDB投影と記憶圧縮を行い、stale continuationを残さない。layer checkpoint tag はannotated `helix/L<n>/<plan>/<snapshot>`とし、commit/tree/ledger digest、gate receipt、DB revisionを持たせる。移動・削除せず、訂正時は新tagでsupersedeする。checkpoint tagは進捗証拠であってreleaseではない。release tagはSemVerとし、全layer closure、requirements digest、CI run、DB revision、action-binding approval receiptを要求する。

### GH-FR-013 Issueからmemoryへの学習

Issue、レビュー、CI失敗、再発、設計判断、chatで追加された要求を append-only event として記録し、`harness.db` へ冪等投影する。再発閾値を超えた知見は detector/gate、skill、template、設計正本の候補へ昇格し、採否と反証を残す。Issue 件数の蓄積自体を学習と見なさない。

### GH-FR-014 template自己改善

要求翻訳時に既存 template で表現できない必須項目を検出した場合、成果物へ自由記述で逃がさず `template_gap` Issue を作る。template/schema/test fixtureを先に Red→Green し、その後に対象要件を再生成する。

### GH-FR-015 画面適用性

L2 画面/プロト工程は毎回判定し、HARNESSのような非UI対象では `not_applicable`、理由、判定者、証拠、下流影響を台帳化する。暗黙スキップは禁止する。ビジュアル Design HARNESS は UI/UX のデザイン生成・検証責務であり、L8–L10 の一般検証基盤と混同しない。

### GH-FR-016 完了率の分母

要件完了率は、総 requirement、AC、必須 trace edge、pair、gate evidence、未解決 finding の分母を固定して算出する。分母不明、orphan、重複ID、件数報告不一致、`proposed` decision 残存があれば100%表示を禁止する。

### GH-FR-017 Issue closure契約

Issueは終端PRのmergeによってのみ通常closeする。Issue起点PRは`Closes #N`に加え、`Outcome`、current HEADへ
束縛した`Closure receipt`、全子Issueの`Child Issues` dispositionを持つ。`Outcome`は
`resolved / rejected / quarantined / superseded / cancelled`のexactly oneとする。

- `resolved`: acceptance oracle、review、CI、Forward/fullback、DB/memory収束を満たす。
- `rejected / quarantined`: Discovery S4、admission、または同等の終端decision receiptを成果物としてmergeする。
  実装採用されなかったことを未完了と同一視せず、証拠付き不採用を正当な終端とする。
- `superseded / cancelled`: AI単独判断を禁止し、snapshot-bound PO decision evidenceを必須とする。

PR作成、設計完了、CI green、proseの完了宣言だけではcloseしない。子Issueは`resolved / deferred / split /
superseded / cancelled`のいずれかへ明示し、単なるopen findingの退避で親を閉じない。closure receiptが欠落または
HEAD driftしたcloseはreopenまたはRecovery対象とする。Issue起点でない通常Forward PRには無理に`Closes`を要求しない。
`Closure receipt`はPLAN ID、current HEAD SHA、test/CI evidence、review evidenceを最低限含み、テンプレートplaceholderを
実証として受理しない。

### GH-FR-018 同一HEAD文脈レビューとDB追従

PRのmerge可否はCIだけで決めない。作成runtime/providerと異なる文脈レビューAIが、L0 authority、L2要求、L3要件とAC、
L4基本設計、Issue/PLAN、変更diff、trace、既存consumer、security・blast radiusを読み、要件適合と設計整合を判断する。
レビュー入力集合と判断結果はcurrent PR HEAD SHAへ束縛したtyped receiptとし、対象正本のpath/digest、reviewer runtime/model/provider、
finding/disposition、verdictを保持する。

同じレビュー工程でcurrent PR HEADから隔離再構築した`harness.db`を検査し、source HEAD、event head、projection digest、checkpoint digest、
schema revision、stale/orphan件数、rebuild一致結果をDB追従receiptへ記録する。DB未更新、event/projection片肺、checkpoint stale、
rebuild不一致、source HEAD不一致のいずれかがあれば文脈レビューPASSとmerge readinessを拒否する。push、CI self-heal、base更新、
正本digest変更のいずれかでHEADまたは入力集合が変わった場合、文脈レビューreceiptとDB追従receiptをともにstale化し、別AIレビューから再実行する。

本要件における「独立」はruntime/provider familyではなく、reviewer identityがauthor/fixer identityと異なり、別session、
独立context、独立判断を持ち、author/fixer自身がverdictを発行できないことを指す。runtime/model/providerはreceiptへ記録するが、
異なるfamilyを合格条件にしない。常にAI-A（作成・修正）とAI-B（監査・merge判断）の2実行主体を前提とし、役割交代はできるが
同一episode内の自己承認はできない。単一AI fallbackと`degraded_mode`を持たない。

### GH-FR-019 作成・監査・修正・クロスレビュー責務

作成AIは変更をPR化する前に内部CIを通す。監査AIはcurrent HEADの文脈レビューだけでなく、findingの修正・改善、
影響Lに応じた再検証、内部CIとGitHub Actionsの再実行までを同じepisodeで担う。監査AI自身が修正した差分は自己承認せず、
監査AIが修正した場合は、修正主体と異なるreview identityのHELIX subagentを起動して差分クロスレビューを行う。
修正pushで旧receiptをstale化し、クロスレビュー、内部CI、GitHub Actions、DB追従が同じ新HEADで全て合格した場合だけmergeする。

内部CIを主検査、GitHub ActionsをGitHub実行制限下の独立ダブルチェックとする。重要検査は要件・設計・Vペア・trace、
security/権限/secret、DB event/projection/checkpoint/schema、build/type/主要unit・integration、migration/rollback/互換性、
文脈レビューreceipt HEAD整合を含み、両環境で別receiptを発行して同一HEADと結果digestを照合する。

runtime/providerにかかわらず、修正AI本体とは別identity・別session・独立contextのsubagent reviewを必須にし、
session内lightweight自己確認への縮退は認めない。

### GH-FR-020 要件承認・動的監査・Recovery優先

要求とモックは相互遷移し、要件定義で不足を検出した場合は要求判断または画面・モック判断へ差し戻す。要求・モック・要件の
意味revisionはユーザー承認を必須とし、AI review、CI、doctorを承認の代替にしない。承認後にPRを作成し、作成側と異なるAIが
review、修正、クロスレビュー、CIを担ってmergeする。承認receiptをrevision、回答source、current HEADへ束縛する。
監査範囲は固定表へ埋め込まず、変更Lから上下隣接、対応Vペア、
traceで到達するconsumerをversion管理された影響graphから導出する。未知edge、cycle、未登録consumerがあれば範囲を狭めずfail-closeする。

`harness.db`とGitHub観測が不一致の場合、同一HEADのevent replayによるDB再構築とGitHub再観測を行い、なお不一致なら自動上書きせず
Recoveryへ遷移する。性能Recoveryは通常開発より最優先で解消する。main merge後Full verification失敗時は新規通常mergeを停止し、
primary mode=`recovery`、trigger=`regression_dev`の修正Issueを自動起票する。安全なbranch内で診断・修正PRを自走し、
関連branchへ復旧寄与度と依存順のpriorityを付けてmain復旧を最優先にする。blocker特定、修正PR、独立クロスレビュー、
doctor、GitHub Actions合格を同一修正HEADへ束縛し、Issueをclosure receipt付きでcloseしてから通常merge停止を解除する。

Recovery修正のクロスレビューもGH-FR-018/019と同じ別identity・別session・独立contextのsubagent
代替を認める。main復旧最優先の運用でも自己承認は禁止のままとする。

### GH-FR-021 staging・production GitHub運用境界

環境を最低限`vps_staging`と`cloud_production`へ分離し、同一artifact digestをstagingからproductionへpromotionする。
production providerは特定cloudへ固定せず、AWS/GCP/Azure等をadapterで差し替え、GitHub Deployments、Environments、Actionsを
editor非依存の共通操作・監査面とする。GitHub Actionsの`workflow_dispatch`とGitHub Environment承認画面を正式操作面、
HELIX CLIを同じworkflowの起動・監視を行う補助面とする。environment concurrencyは同時deploy一件へ制限する。
GitHub plan/repository visibilityでrequired reviewer、custom protection、environment secretが利用可能かsetup preflightし、
不足時は代替保護なしにproductionを開かない。production昇格はstaging検証合格後にだけ開始する。
branch、preview、backup、rollback、health check、monitoringで可逆性を作り、「不可逆」という分類だけで通常作業を一律停止しない。
VPS stagingは自動deploy・検証・rollback可能とする。cloud productionは対象artifact、環境、操作、window、backup、rollback、
monitoringを束縛したユーザー承認receipt後にGitHub Environment protectionを通して実行する。staging receiptなしのproduction、
別artifactのpromotion、承認scope外操作、環境secretの混用を拒否する。

VPS stagingはproductionと同一container image、設定schema、migration、health checkを使い、規模と冗長性だけ縮小する。
最初の実装・実環境検証対象はAWS reference adapterとし、provider非依存contractを他cloudへ再利用する。
AWS認証はGitHub OIDC短期credentialを使い、organization、repository、environment、branch/tagへtrustを限定する。
長期access keyとstaging/production role共有を禁止する。
AWS reference標準profileはECS Fargate＋AWS CDK TypeScriptとする。DBは要件が無ければ追加せず、relation/transaction/query要件と
product技術stackが求める場合だけ選び、reference fixtureはRDS PostgreSQLとする。production data・外部利用・認証/PII・高影響操作を
含む場合はproduction/non-production AWS accountを分離し、disposable PoCだけ同一account内分離を許可する。

DB migrationはexpand→deploy→contractと原則zero-downtimeを標準とする。stagingでは自由に反復できるが、productionの破壊的migrationは完全性を保ち、
backup、restore rehearsal、旧version互換期間、migration/rollback oracle、個別承認が揃うまで適用しない。health/monitoring起点の
production自動rollback実装は今回scope外とし、将来の運用ハーネスで設計する。停止が必要なmigrationは停止時間、影響範囲、
復旧条件を束縛した追加ユーザー承認を要求する。現段階ではrollback targetと手順の検証までを必須にし、ログ設計、
SLO/alert/incident/recovery、自動rollbackはUpdate Issue #91へ接続する。deployment監査ログは検索可能90日・改竄耐性archive 1年を
既定とし、保存前redactionとcorrelation IDを必須にする。

### GH-FR-022 アップデートIssueのlabel lifecycle

将来Update Issueはopenのまま残ることを正常状態とし、`update`、lifecycle、priority、areaのlabel集合とtraceで分類する。
`state:backlog`＋`priority:future`は現行freeze/implementationのactive blockerへ数えず、scope消失や異常放置とも扱わない。
active化時はpriorityと対象PLAN/requirementを更新し、完了時だけclosure receipt付きPRでcloseする。label欠落、相互矛盾state、
関連正本/Issue/PRへのtrace欠落、期限付きdeferの期限超過はreconcile findingとする。

## 4. 非機能要件

- GH-NFR-001 Fail-close: schema/authority/route/trace が不明なら最も強い V route で停止する。
- GH-NFR-002 Idempotency: hook、projection、reconcile、PR event再送は二重 Issue/commit/mergeを作らない。
- GH-NFR-003 Evidence durability: evidence は HEAD SHA、digest、timestamp、producer、schema versionを持つ。
- GH-NFR-004 Least privilege: workflow permissions は原則 `contents: read`。write権限は限定job/commandのみ。
- GH-NFR-005 Concurrency: non-main の旧runは取消可能、mainの証跡runは取消で消失させない。
- GH-NFR-006 Portability: Linuxをcanonical、Windows/macOSを互換面として同一Node artifactで検証する。
- GH-NFR-007 Auditability: GitHub API観測とauthoring policyの差分を保存し、UI設定だけを正本にしない。
- GH-NFR-008 Context economy: PR/Issueにはdigestとpointerを置き、全文memoryをpromptへ注入しない。
- GH-NFR-009 Important-check latency: 内部CIとGitHub Actionsはそれぞれ独立に重要検査をp95 60秒以内で完了することを目標とする。
- GH-NFR-010 Full-verification latency: Full verificationはp95 3分以内を目標とし、PR作成前、merge直前、main merge後に実行する。監査修正直後は変更L、上下影響、対応Vペアを対象とする影響検査を行う。
- GH-NFR-011 Performance recovery: correctness検査がgreenで性能予算だけを超過したPRは直ちにblockせず、実測HEAD、環境、cold/warm cache、区間計測、原因分類、改善前後p50/p95、検査範囲非縮退証拠を持つRecovery Issueを同episodeで起票し、修正・クロスレビュー・再検証まで追跡する。検査省略、閾値緩和、GitHub Actionsへの検査先送りを性能改善と認めない。
- GH-NFR-012 Evolvability: layer監査scopeはversion管理されたgraph traversal policyとして拡張し、L追加、pair変更、consumer追加を固定分岐の編集なしで反映できる。
- GH-NFR-013 Environment isolation: staging/productionのidentity、credentials、secret scope、deployment history、rollback targetを分離し、production credentialをstaging jobへ渡さない。
- GH-NFR-014 Provider portability: cloud固有APIはdeployment adapter内へ隔離し、要件・gate・receipt schemaをprovider非依存に保つ。

## 5. 受入基準

| AC | 合格条件 |
|---|---|
| GH-AC-001 | 各Issue Formの必須項目欠落fixtureがadmission失敗し、正常fixtureだけPLAN候補になる |
| GH-AC-002 | scope外ファイル/依存/機能を含むPR fixtureが`scope_expansion`でblockされる |
| GH-AC-003 | branch名、base SHA、寿命、ownership違反を機械検出できる |
| GH-AC-004 | PR trace blockをledgerから生成し、改竄・orphan ID・欠落pairを拒否する |
| GH-AC-005 | Linux/Windows required legのfailure/cancel/skip全fixtureでaggregateが失敗する |
| GH-AC-006 | authoring policyとGitHub Rulesetのrequired check/strict/force/deletion/bypass差分を検出する |
| GH-AC-007 | CI失敗から同一episodeの修正再push、またはRecovery遷移までをevent列で再生できる |
| GH-AC-008 | merge後、Issue close、PLAN/AC closure、DB revision、memory eventが同一HEADへ収束する |
| GH-AC-009 | tag receiptからlayer、version、HEAD、requirements digest、CI run、DB revisionを逆引きできる |
| GH-AC-010 | chat追加要求がledgerへ入り、対応 requirement/AC または明示reject decisionへ到達する |
| GH-AC-011 | UIなし案件のL2が証拠付き`not_applicable`となり、工程欠落扱いにならない |
| GH-AC-012 | requirement/AC/edge/pair/finding全分母が一致し、orphan 0かつ未解決 blocker 0でのみ100%になる |
| GH-AC-013 | `Closes #N`を持つPRはOutcome/closure receipt/子Issue dispositionの欠落でblockされ、rejected/quarantinedは終端decision receiptでcloseでき、superseded/cancelledはPO decision欠落でblockされる |
| GH-AC-014 | CIがgreenでも、author/fixerと別identity・別session・独立contextの文脈レビューがL0/L2/L3/L4、Issue/PLAN、diff、trace、consumer、security・blast radiusを読んだcurrent HEAD束縛receiptを持たなければmergeをblockする |
| GH-AC-015 | 文脈レビュー時の隔離DB再構築でsource HEAD、event head、projection、checkpoint、schema revisionが一致し、stale/orphan 0である場合だけDB追従receiptを発行し、pushまたはbase更新後は旧receiptでmergeできない |
| GH-AC-016 | 作成AIの内部CI合格後だけPR化でき、監査AIの修正後は別identity・別sessionのHELIX subagent差分レビュー、内部CI、GitHub Actions、DB追従が同じ新HEADで揃うまでmergeできない |
| GH-AC-017 | 重要検査が内部CIとGitHub Actionsで別環境・別receiptとして実行され、各p95 60秒以内、Full verificationがp95 3分以内として計測される |
| GH-AC-018 | correctness greenかつ性能予算超過時はmerge結果と性能Recoveryを分離し、必須計測証拠を持つRecovery Issueが起票され、検査範囲を縮退させず改善closureまで追跡される |
| GH-AC-019 | 要求・モック・要件の意味revisionは相互遷移と差し戻し履歴を持つ。証拠確認→AIによる齟齬先行修正→5問単位の認識合わせ→回答即時反映→未解決ゼロ監査→全体revision提示→最終合意の順を経て、current revisionへ束縛されたユーザー承認後だけPR化でき、別AI review後にmergeされる。承認だけを突然要求するpacketを拒否する |
| GH-AC-020 | changed Lから上下隣接・Vペア・trace consumerを動的導出し、未知edgeや未登録consumerを監査scopeから落とさない |
| GH-AC-021 | DB再構築とGitHub再観測後も不一致なら自動上書きせずRecoveryへ遷移し、性能Recoveryは通常開発より先に処理される |
| GH-AC-022 | main merge後Full verification失敗時は通常mergeを停止し、Recovery修正Issue、修正PR、独立review、doctor、GitHub Actions、Issue closureが同一修正HEADへ収束するまで解除しない |
| GH-AC-023 | VPS stagingとcloud productionが別GitHub Environment・secret scope・receiptを持ち、同一artifact digestだけpromotionされる |
| GH-AC-024 | production deployは対象操作へ束縛したユーザー承認、staging green、backup、rollback、health/monitoring証拠が揃う場合だけ実行される |
| GH-AC-025 | production DB migrationは原則zero-downtimeで、expand→deploy→contract、backup、restore rehearsal、互換期間、migration/rollback oracle、個別承認が完全な場合だけ適用され、停止時は停止時間・影響・復旧条件の追加承認を要求する |
| GH-AC-026 | GitHub `workflow_dispatch`/Environmentを正式操作面、HELIX CLIを補助面とし、AWS reference adapter上でproduction同一artifact/schema/migration/health contractのVPS staging検証後だけ昇格する |
| GH-AC-027 | GitHub plan機能preflight、environment単位concurrency、self-review禁止、AWS OIDC trust/role分離がgreenでなければproduction environmentを有効化しない |
| GH-AC-028 | 要件から逸脱理由がない場合はECS Fargate/CDK TypeScript、要件駆動DB選択、risk駆動account分離、90日検索＋1年監査archiveを標準profileとして決定し、選択質問で工程を停止しない |
| GH-AC-029 | open Update Issueが`update`＋lifecycle＋priority＋area＋traceを持てば正常backlogとして表示され、active blockerや異常openへ誤算入されない |

## 6. UT資産の取捨選択

| UT資産 | 判定 | HELIXでの扱い |
|---|---|---|
| Reverse/Redesign/Recovery/Incident/NFR Issue Forms | 採用・拡張 | requirement/AC、revision、security等を追加 |
| machine-readable PR trace | 採用 | Bun commandをNode CLIへ置換し、HELIX route/pairを追加 |
| Linux+Windows aggregate CI | 採用・強化 | strict、skip/cancel fail、macOS方針を追加 |
| repository policy authoring source + drift | 採用 | bypassなし、strict必須へ強化 |
| explicit staging / Conventional Commits / history secret scan | 採用 | 現行HELIX規則へ統合 |
| direct main push許容 | 不採用 | HELIXは常にPR-only |
| admin bypass | 不採用 | 自動走行の強制力を損なう |
| GitHub approval必須 | 不採用 | solo自己ブロック。review receiptで代替 |
| Bun前提command | 不採用 | target runtime authorityに従う |

## 7. 承認時の凍結条件

本書の確認は要件凍結であり、実装指示ではない。L4以降の設計・実装は別PLANでForward降下する。ADR-009/ADR-010の権威衝突とREBASELINE v0.5.0の未解決所見が収束するまで、runtime境界に関する実装preflightは開かない。
