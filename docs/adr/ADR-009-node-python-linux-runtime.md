---
adr_id: ADR-009
title: "HELIX runtimeをNode.js control plane＋Python workerへ移行する"
status: accepted
date: 2026-07-15
deciders:
  - PO（Python＋TS/Node、脱Bun、Linux-primaryの方向を継続goalで明示決定）
  - HELIX TL（Node 24/npm/node:sqliteの技術選択）
supersedes:
  - ADR-001 runtime/build/distribution部分
  - ADR-007 SQLite driver選択部分
  - ADR-005 Bun固有のinstall/update/server例
related_plan: docs/plans/PLAN-L1-07-infinity-loop-platform-requirements.md
related_design:
  - docs/design/helix/L5-detail/node-runtime-cutover.md
  - docs/design/helix/L5-detail/python-worker-runtime.md
  - docs/design/helix/L5-detail/os-portability-supply-chain.md
runtime_surface_inventory: docs/governance/node-python-linux-runtime-surface-ledger.md
related_chat: [HC-CHAT-002, HC-CHAT-003, HC-CHAT-004]
related_design_slices: [HDS-HIL-12, HDS-HIL-13, HDS-HIL-14]
related_requirements:
  - HIL-BR-19
  - HIL-FR-27
  - HIL-FR-33
  - HIL-FR-34
  - HIL-TR-01
  - HIL-TR-02
  - HIL-TR-03
  - HIL-TR-04
  - HIL-TR-05
  - HIL-TR-06
  - HIL-TR-07
  - HIL-TR-08
  - HIL-TR-09
  - HIL-TR-10
  - HIL-TR-11
  - HIL-NFR-19
  - HIL-NFR-09
  - HIL-NFR-14
  - HR-FR-HIL-12
  - HR-FR-HIL-13
  - HR-FR-HIL-14
---

# ADR-009: Node.js制御面＋Python worker＋Linux-primary runtime

## 文脈

ADR-001はTypeScript strictとBunを一体で採用し、ADR-007はBun時の`bun:sqlite`を第一候補にした。
その後、POはHELIXを「Python＋TS/Node、脱Bun、Linux中心のmulti-OS」へ移行することを明示決定した。
現行runtimeは`package.json`、CLI shebang、SQLite adapter、CI、setup、distribution、doctor hard gateまでBunへ
結合しているため、個別置換では二重runtimeとsilent fallbackが残る。旧Python runtimeのportを再開するだけでも、
型付きgateと単一write authorityが崩れる。

2026-07-15時点でNode.js 24はLTS、Node.js 26はCurrentである。production applicationはLTSを使うという
Node.js公式方針に従い、cutover targetはNode.js 24 LTSとする。`node:sqlite`はNode.js 24.15.0で
release candidateでありstableではないため、driverの成熟度をcutover evidenceで独立に扱う。

- Node.jsリリース日程の正本: <https://nodejs.org/en/about/previous-releases>
- Node.js 24の`node:sqlite`仕様: <https://nodejs.org/download/release/latest-v24.x/docs/api/sqlite.html>
- npm clean install契約: <https://docs.npmjs.com/cli/commands/npm-ci/>

## 決定

### 1. runtime責務

- terminal cutover後のHELIX authoritative control plane targetは**TypeScript strict / Node.js 24 LTS**とする。
  terminal receipt前のactive execution authorityは既存Bun経路であり、target採択をactive切替と読み替えない。
- minimumは`>=24.15.0 <25`とする。Node exact version、`node:sqlite`のstability/API、組込SQLite version、
  compile optionsのいずれかが変われば、major/minor/patchを問わずtoolchain／DB receiptをstale化して再検証する。
- Pythonはversioned schemaで隔離された**proposal worker**として第一級採用する。許可capability classは
  `source_atomization`、`document_engine`、`detector`、`product_data`、`analysis`のclosed listとし、追加はRedesignを要求する。
- Python workerはproposal、diagnostic、artifact候補だけを返し、`harness.db`、state、gate、Issue、memory、
  release pointerへauthoritative writeしない。
- Node側がschema、lineage、digest、lease/fence、policyを再検証し、唯一のtransaction writerとしてcommitする。
- legacy Python command/runtimeのbulk portは引き続き禁止する。採用単位はbehavior atomとversioned contractである。
- Python version、interpreter provenance、package／lock形式、worker root／entrypoint、wheel／sdist policyは
  HDS-HIL-12/14でfreezeする。未決定または未分類dependencyが一つでもあればPython activationとterminal cutoverをblockする。

### 2. toolchain／配布

- package managerとlock正本はnpm＋`package-lock.json`とし、CI／clean environmentは`npm ci`を使う。
- source開発loaderとbundle toolはHDS-HIL-13のNode minimumで固定し、Bun loaderをfallbackとして残さない。
- canonical artifactはbundled ESM `dist/helix.mjs`とnpm package archiveとする。standalone executableは
  Node cutoverの必須条件にせず、必要なら別ADRで追加する。
- GitHub-pull、tag pin、配布専用repository、中央UI、GitHub backboneというADR-005の配布モデルは維持する。
  D1のBun package/install/update例とPhase BのBun HTTP server／`bun:sqlite` runtime選択はsupersedeする。

### 3. SQLite選択

- `harness.db`をrebuildable SQLite projection＋feedback機構とするADR-007のデータ決定は維持する。
- cutover後のactive writerはNode driver一つだけとし、`bun:sqlite`とのruntime分岐を撤去する。
- target driverは`node:sqlite`とする。ただしrelease-candidate期間はdriver capability／durability／migration／
  backup-recovery oracleをNode minimumで全実行し、未充足ならcutoverを停止する。黙って別driverへfallbackしない。
- 別driverが必要になった場合はlicense、native artifact、multi-OS、offline install、distributionを再評価するADRを要求する。

### 4. OS優先順位

- Linuxをfull canonical gateとする。install、build、CLI、hook、SQLite、Python worker、package、consumer、rollbackを
  clean Linuxで省略なく実行する。
- macOSとWindowsは同一contract／fixtureを使うcompatibility gateとし、OS別business logic、lockfile、schemaを作らない。
- `process.platform`、`/proc`、PowerShell、signal、atomic replace、file lockなどの差異は`OsAdapter`配下へ閉じ込める。
- thin POSIX／PowerShell entrypointは許すが、判定、fallback、state mutationを持たせない。

### 5. cutover強制力

- Node minimumとBun cutoverを別gateにする。Nodeで一部testが動くことを脱Bun完了へ読み替えない。
- active Bun dependency、loader、API、command、lock、CI、setup、distribution、rule/exampleを全surface inventoryで0にする。
- historical参照は到達不能性、理由、digest、review、再entry条件を持つallowlistだけ許可する。
- package、CI、runtime、distributionの切替はdry-run、known-good backup、rollback、monitoring evidenceを持つ
  reversible transactionとし、release publish／tag／配布先切替は既存action-binding approval境界を維持する。
- Node minimumはisolated DB copyだけへwriteし、current `.helix/harness.db`のwriter authorityを変更しない。
- forward activationには`plan/execute/commit/reconcileNodeCutover`、exclusive writer epoch、expected DB revision、
  authority pointer／hook／package／lock／CI／DB driverのfixed write set、action-binding approval、
  `CutoverActivationReceipt`を要求する。この契約がHDS-HIL-13へRedesignされるまでimplementation preflightをblockする。
- terminal receipt前は既存Bun経路をactive execution authorityかつknown-good rollback pointとして維持する。
  terminal receipt後はBun known-goodを固定commit／content-addressed artifact／DB backupとしてactive execution graph外に保存する。
  Node失敗時の自動fallbackは禁止し、trigger-bound approvalと互換receiptを持つ明示rollbackだけがBunを一時再activationできる。
  rollback後はNode cutover receiptをstale化し、全surface inventoryから再開する。
- cutover gate PASSはprovisionalとする。pre-terminalは既存Bun、post-terminalはreceiptが指すNode artifact、承認済みrollback時は
  Node receiptをstale化したBun一時再activation、という3相だけをcurrent runtime authorityとして許可する。

## 維持する決定

- TypeScript strict、zod単一正本、Vitest、clean rebuild、provider-independent coreを維持する。
- source系譜からはbehavior／設計概念を採取し、旧runtimeをbulk importしない。
- `.helix/harness.db`はprojectionであり、raw transcript、secret、credential、PIIを保存しない。
- Claude／Codex adapterは同じcore判定を呼び、実行側と監査側を分離する。
- HC-CHAT-024/025/026/030/032とHR-FR-HIL-09を維持し、ZIP、前身UT全ref、現行全tree、旧HELIXを
  entry→behavior atom→decision→requirement→design→assertion→gateへexact joinする。
  `infinity-loop-source-snapshot-manifest.md`、`infinity-loop-source-atomization-contract.md`、
  `infinity-loop-source-capability-ledger.md`、`legacy-helix-extension.md`をbinding sourceとし、
  runtime surface inventoryをsource capability inventoryの代用にしない。pending／orphan／unjustified rejectは0を要求する。
- HC-CHAT-001/005-041のscope、authority、gateを本ADRは縮小またはsupersedeしない。
- 新規npm/Python/native dependencyはdirect/transitive license、source identity、artifact digest、SBOMを事前分類し、
  `review_required`／`unclassified`／`prohibited`は人へescalateする。

## 影響

- ADR-001、ADR-007、ADR-005のBun固有決定はtarget authorityではない。ただしterminal receipt前の既存Bun実行経路は
  migration中のactive authorityとして維持し、terminal後だけinactive history／rollback pointへ移す。
- `runtime-portability`と`toolchain-pin`は一度に削除せず、Node minimum evidenceを追加してからBun強制を反転する。
- 実装順はHDS-HIL-13 Node minimum→HDS-HIL-14 adapter/supply-chain基盤→HDS-HIL-12 Python worker→
  HDS-HIL-14 Linux full＋multi-OS matrix→HDS-HIL-13 activation／terminal cutoverとする。
- AGENTS／CLAUDE、package、lock、CI、hook、setup、distribution、doctor、consumer templateを同じinventoryで追跡する。
- acceptedは設計方向の承認であり、cutover完了やimplementation verifiedを意味しない。

## 却下した案

### BunとNodeを恒久併用する

driver、loader、lock、CI、配布の二重authorityを残し、どちらで検証したかを曖昧にするため却下する。

### core全体をPythonへ移す

既存のTypeScript schema／gate／adapter資産を捨て、旧runtime portを再導入するため却下する。Pythonは
計算・解析workerへ限定し、Nodeのauthoritative writerと契約で分離する。

### Windows-firstを維持する

VPS／CI／sandbox／containerを含むcanonical運用がLinux中心であり、PowerShellやWindows pathをcoreへ
漏らし続けるため却下する。Windows compatibilityは維持するが正本full gateにはしない。

## 検証と移行順

1. 全runtime surfaceをcommit／tree／rule versionへbindしてinventory化する。
2. Node 24 LTS、npm lock、source execution、SQLite、targeted testのNode minimumをisolated環境でgreenにする。
3. `OsAdapter`とsupply-chain基盤を実装し、Python toolchain／worker contractをfreezeする。
4. Python workerをproposal-only contractで接続し、Node側のatomic commit／reconcileを検証する。
5. Pythonを含むLinux full workflowとmacOS／Windows compatibility matrixを閉じる。
6. active Bun finding 0、quarantine 0、fallback 0を確認し、provisional cutover receiptを発行する。
7. forward activation transaction、monitoring、terminal receipt後に旧Bun pathをinactive backupへ収束させる。
