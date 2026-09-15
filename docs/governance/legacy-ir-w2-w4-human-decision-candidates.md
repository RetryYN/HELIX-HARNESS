# W2〜W4 人間判断候補の意味分解

status: decision_not_requested_yet
scope: W2 8件／W3 5件／W4 2件
authority: [旧要求carry-forward台帳](legacy-requirement-carry-forward.jsonl)
routing: [IR対象routing queue](legacy-ir-target-routing-queue.jsonl)

## この文書が行わないこと

この15件は削除、縮退、統合、降格の候補ではない。原要求identity、原文、digest、要求された証拠を保持したまま、既存crosswalkが検出した責務・適用範囲・旧方式との衝突だけを後続PRの判断論点にする。まだ人間decisionを要求または適用せず、successorも割り当てない。

[W1の8件](legacy-ir-w1-human-decision-candidates.md)と合わせて、IR 153件中の判断候補23件を構成する。

## 判断候補

### HIL-FR-01

- wave: `W2-functional`
- 原文digest: `sha256:bf1e51a051e81e130843ed584640fcc1df69d9b5d84f22f22aa29c261b03c3b7`
- 原要求:

> `InfinityLoopEvent`を受理し、`intake→reverse→redesign?→pair-freeze→implementation→local-prejoin-ci→forward-join→internal-postjoin-ci→github-pr→external-ci→audit→merge/issue`を状態遷移する。各段は入力commit/tree digestと前段receiptへbindする。 | append-only event、現在state、parent/cause ID

- crosswalkが検出した整理箇所: OS・意味変更要 | 旧一律reverse遷移を現行の条件付き適用と照合。段階receiptはOS
- 後続PRで示す判断: 原要求の意味と証拠を保ったまま、旧owner・旧語彙・旧一律条件のどこをHELIX-OS責務へ合わせて改訂するか。
- 現在状態: `preserved_pending_rehome`、`meaning_change_applied: false`、successor未割当。

### HIL-FR-04

- wave: `W2-functional`
- 原文digest: `sha256:4d8c9fcc0db7c1e522c6e8b42f49521348381d44a6b9a53b01fb47c9f7e5d97b`
- 原要求:

> Universal Reverse Gateは全IssueのR0–R4を順序実行し、各phaseのobligation集合、input/output digest、stage固有schema、source coverage、R4 routing、双方向参照を検査する。R1を含むphase skipは認めず、該当契約なしも探索証拠付き結論として記録する。 | pass/fail receipt＋不足/空洞化code

- crosswalkが検出した整理箇所: OS・意味変更要 | 全Issue R0–R4必須はBR-04と矛盾。Reverse適用時の証拠条件と分離
- 後続PRで示す判断: 原要求の意味と証拠を保ったまま、旧owner・旧語彙・旧一律条件のどこをHELIX-OS責務へ合わせて改訂するか。
- 現在状態: `preserved_pending_rehome`、`meaning_change_applied: false`、successor未割当。

### HIL-FR-10

- wave: `W2-functional`
- 原文digest: `sha256:1fbb80b64b2182063ff3a301d80e56bace634c8b9e362d61d860c6cbc54bcd65`
- 原要求:

> Memory CompactorはIssue admission時の問題・判断要約とCodex completion時の永続知識を別event種別で圧縮し、promote/supersede/no-promotionを記録する。進捗/raw logはmemoryへ複製しない。 | issue-summary、compressed memoryまたはno-promotion receipt

- crosswalkが検出した整理箇所: OS・意味変更要 | 永続知識をmemoryへ昇格する旧条件はHMCの通知限定と衝突
- 後続PRで示す判断: 原要求の意味と証拠を保ったまま、旧owner・旧語彙・旧一律条件のどこをHELIX-OS責務へ合わせて改訂するか。
- 現在状態: `preserved_pending_rehome`、`meaning_change_applied: false`、successor未割当。

### HIL-FR-11

- wave: `W2-functional`
- 原文digest: `sha256:2e149ad2069ec8f3a8e5c8138b31bf34bbd5ad2c6830dd4c35c4d19536b9ead6`
- 原要求:

> Agent Registryはlayer、drive、task-kind、context pack、skills、blind、generates、forbidden paths、verification patternsをHARNESS正本として持つ。 | runtime中立agent contract

- crosswalkが検出した整理箇所: OS・意味変更要 | HARNESS正本agent registryをOSへ分離。旧drive軸も是正対象
- 後続PRで示す判断: 原要求の意味と証拠を保ったまま、旧owner・旧語彙・旧一律条件のどこをHELIX-OS責務へ合わせて改訂するか。
- 現在状態: `preserved_pending_rehome`、`meaning_change_applied: false`、successor未割当。

### HIL-FR-19

- wave: `W2-functional`
- 原文digest: `sha256:817dc126b7355e14109936f8f9c83edcd21fdc3d0afd9fad8a41508828306b35`
- 原要求:

> 画面対象のWalkthrough Loopはprototype版、ユーザー観測、発見要求deltaまたは`no_delta`、L1反映先、再作成判断を記録し、boundedに反復する。 | walkthrough receipt、requirements delta、iteration checkpoint

- crosswalkが検出した整理箇所: HARNESS／OS・意味変更要 | L1反映先の旧記述をL2要求へ是正し、企画影響時だけL1にも戻す
- 後続PRで示す判断: HARNESSが規定する工程・提供契約と、HELIX-OSが担う実行・管理へどのatomを分け、両者をどのconnection要求で結ぶか。
- 現在状態: `preserved_pending_rehome`、`meaning_change_applied: false`、successor未割当。

### HIL-FR-20

- wave: `W2-functional`
- 原文digest: `sha256:222133a9de644396f35972616f71b14d07b7f1c501c737366b9a56f8f5ff5643`
- 原要求:

> Screen Gateは画面対象ならartifact、walkthrough、要求反映、prototype agreementを検査し、画面非対象ならskip receiptのscope/digest/再entry条件を検査する。いずれも無い場合はL1 freezeとL3開始をfail-closeする。 | G2判定、agreementまたはskip receipt、不足code

- crosswalkが検出した整理箇所: HARNESS／OS・意味変更要 | L1 freeze／L3開始の旧境界をL2合意・L3凍結条件と照合
- 後続PRで示す判断: HARNESSが規定する工程・提供契約と、HELIX-OSが担う実行・管理へどのatomを分け、両者をどのconnection要求で結ぶか。
- 現在状態: `preserved_pending_rehome`、`meaning_change_applied: false`、successor未割当。

### HIL-FR-30

- wave: `W2-functional`
- 原文digest: `sha256:d4fa1ac2785a9989d6e783094a89324f908a0eb20ab53d3138f51677e4e2cd7c`
- 原要求:

> Finding Dispositionはcurrent contract違反、correctness/security/data loss、必須oracle/main/evidenceへの影響と責務境界を評価し、同じ責務・既存scope内で安全かつ局所的に閉じるfindingを`current_pr_fix`、独立責務・別設計・lifecycle・性能改善を`successor_issue`へ分類する。Finding Promotion Pipelineは`successor_issue`だけから重複判定、Issue contract、Universal Reverse、memory issue-summary、Codex queue itemを同一causality IDで原子的に生成する。`current_pr_fix`はwriterへ一括返却し、途中欠落はreadyにしない。 | typed disposition、writer return、Issue/Reverse/memory/queue join

- crosswalkが検出した整理箇所: OS・意味変更要 | finding処理と後続作業の原子生成。Universal Reverseとmemory要約の意味を最新候補と照合
- 後続PRで示す判断: 原要求の意味と証拠を保ったまま、旧owner・旧語彙・旧一律条件のどこをHELIX-OS責務へ合わせて改訂するか。
- 現在状態: `preserved_pending_rehome`、`meaning_change_applied: false`、successor未割当。

### HIL-FR-52

- wave: `W2-functional`
- 原文digest: `sha256:ef6f0368fe00cbc48d04ceec047b7d8fbfe6852cd0a570f098757631c9ccf24e`
- 原要求:

> Atomic Canonicalization TransactionはMarkdown、asset revision、event ledger、trace、impact、stale propagation、harness.db projection、receiptを単一operationで原子的に更新する。部分成功をCanonicalとして扱わず、command idempotencyとbase revision CASを強制する。 | canonicalization receipt、before/after revision、write count、rollback/conflict receipt

- crosswalkが検出した整理箇所: OS・意味変更要 | Markdown更新の一律記述と旧JSON／transaction境界をhistorical sourceとして照合し、新世代authorityを再定義
- 後続PRで示す判断: 原要求の意味と証拠を保ったまま、旧owner・旧語彙・旧一律条件のどこをHELIX-OS責務へ合わせて改訂するか。
- 現在状態: `preserved_pending_rehome`、`meaning_change_applied: false`、successor未割当。

### HIL-NFR-03

- wave: `W3-nonfunctional`
- 原文digest: `sha256:294163bef1e714afa828760f2d6ca8a77417abfa9b5a80eea30b0256c82b5057`
- 原要求:

> 全IssueのReverse処理量を省略しない。`none/not-required/exempt`とphase skipを禁止し、budget到達は未完obligationを免除せずcheckpoint＋未完了状態へ遷移する。

- crosswalkが検出した整理箇所: 意味変更要：全Issue Reverse必須はBR-04の条件付き適用と矛盾。予算到達時の未完義務保持はOS
- 後続PRで示す判断: 原要求の意味と証拠を保ったまま、旧owner・旧語彙・旧一律条件のどこをHELIX-OS責務へ合わせて改訂するか。
- 現在状態: `preserved_pending_rehome`、`meaning_change_applied: false`、successor未割当。

### HIL-NFR-10

- wave: `W3-nonfunctional`
- 原文digest: `sha256:da761c1a808418620dacdb8aa7a586ef28a33082df7ebed30b683218493bb093`
- 原要求:

> agent adapterを削除してもHARNESS registryから再生成でき、runtime固有agent memory/rule siloを正本にしない。

- crosswalkが検出した整理箇所: 意味変更要：agent registryのHARNESS所有をOSへ。adapter再生成・独自正本禁止を保持
- 後続PRで示す判断: 原要求の意味と証拠を保ったまま、旧owner・旧語彙・旧一律条件のどこをHELIX-OS責務へ合わせて改訂するか。
- 現在状態: `preserved_pending_rehome`、`meaning_change_applied: false`、successor未割当。

### HIL-NFR-21

- wave: `W3-nonfunctional`
- 原文digest: `sha256:91fa0cf1803312552c129591509e87b6b6cb98a2c5abe24b33a48001ee2d027c`
- 原要求:

> user directive/findingの原記録はappend-onlyで、AI dispositionは原記録を削除・不可視化・終端化しない。PO以外のcancel/supersedeと、独立reviewなしのfalse-positive/accepted-riskを拒否する。

- crosswalkが検出した整理箇所: OS・採用差分照合要：原記録保持とdisposition。取消・終端権限をAVS／RFAのscopeと照合
- 後続PRで示す判断: 原要求の意味と証拠を保ったまま、旧owner・旧語彙・旧一律条件のどこをHELIX-OS責務へ合わせて改訂するか。
- 現在状態: `preserved_pending_rehome`、`meaning_change_applied: false`、successor未割当。

### HIL-NFR-25

- wave: `W3-nonfunctional`
- 原文digest: `sha256:a8e7e11e262e12aa53009f37e6c288213c1175b2853491cb0f998ac122c09b8d`
- 原要求:

> Domain Objectはclass化自体を目的にせず、identity/invariant/lifecycle/authorityがないpayloadをEntity/Aggregateへ昇格しない。Value Objectはimmutable、Aggregate更新はroot境界内transaction、Queryはside-effectなし、Domain Eventは完了事実の過去形、domainはPortを介してAdapterへ依存する。`Manager/Helper/Util/Data`等の責務不明名を根拠なしで許さず、testはprivate実装名でなくdomain object＋operation＋oracle IDへbindする。

- crosswalkが検出した整理箇所: 適用範囲要確認：Domain Object設計規律。全consumerへの一律必須条件にせず、対象設計方式と根拠を照合
- 後続PRで示す判断: この制約を製品要求、HELIX-OS内部要求、L3以降の設計制約のどこへ置くか。要求意味を変更する場合は変更前後を別に提示する。
- 現在状態: `preserved_pending_rehome`、`meaning_change_applied: false`、successor未割当。

### HIL-NFR-30

- wave: `W3-nonfunctional`
- 原文digest: `sha256:71d55577d7a320844846b00f7c6c2a05f631ba15c8c9fea2bd5267a0839c9354`
- 原要求:

> 可逆かつ既定policy内のAuthoring変更では人間入力を要求せず、機械検証からCanonical化まで自動完走できる。確認待ちを安全策として乱発せず、真のauthority境界だけをescalateする。

- crosswalkが検出した整理箇所: HARNESS／OS・採用差分照合要：既定policy内authoringと自動正本化。RFA候補の発効と区別
- 後続PRで示す判断: HARNESSが規定する工程・提供契約と、HELIX-OSが担う実行・管理へどのatomを分け、両者をどのconnection要求で結ぶか。
- 現在状態: `preserved_pending_rehome`、`meaning_change_applied: false`、successor未割当。

### HIL-TR-02

- wave: `W4-technical-constraint`
- 原文digest: `sha256:290f35ed940fc065d587c05153f38deaae14d1757c950f442cb30ef1a1e297ec`
- 原要求:

> Pythonはproduct-data、document-engine、detector、analysis workerのdata/detection planeとして第一級化し、Node control planeとはversioned schema/event/CLI contractで接続する。

- crosswalkが検出した整理箇所: 意味照合要：Pythonをdata/detection planeだけに限定せずADR-010 semantic coreと整合
- 後続PRで示す判断: この制約を製品要求、HELIX-OS内部要求、L3以降の設計制約のどこへ置くか。要求意味を変更する場合は変更前後を別に提示する。
- 現在状態: `preserved_pending_rehome`、`meaning_change_applied: false`、successor未割当。

### HIL-TR-07

- wave: `W4-technical-constraint`
- 原文digest: `sha256:f30a529a80f752c4df4a05d93d25e0f28fd7a71659d9bcc2469f4d193832a113`
- 原要求:

> SQLite/harness.dbはcontrol planeのevent/projection backboneを維持し、Python分析用read modelとNode write authorityを分離する。write authority変更はL4で決定する。

- crosswalkが検出した整理箇所: 意味変更要：write authorityをL4で決定する旧条件はADR-010のNode transactional boundaryと衝突
- 後続PRで示す判断: この制約を製品要求、HELIX-OS内部要求、L3以降の設計制約のどこへ置くか。要求意味を変更する場合は変更前後を別に提示する。
- 現在状態: `preserved_pending_rehome`、`meaning_change_applied: false`、successor未割当。

## 後続PRの共通不合格条件

- 原文またはdigestを提示しない。
- 原要求末尾の証拠・出力条件を実現方式として切り捨て、要求atomから黙って除外する。
- 旧語彙の置換だけで意味差分、責務分割、connection、受入影響を示さない。
- 技術制約を全consumer製品へ一律伝播する。
- 人間decisionなしに意味変更、縮退、統合、retire、successor被覆済みを記録する。
- 複数の原要求identityを一つの要求PRで確定する。
