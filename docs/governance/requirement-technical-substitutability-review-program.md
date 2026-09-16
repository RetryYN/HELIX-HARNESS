# 要求に含まれる旧技術の代替可能性review program

status: proposed_upstream_waiting
program_id: RDP-003
parent_program: RDP-001
owner: HELIX-OS management
authority_effect: none

## 目的

[全要求の要否・再配置review program](requirement-disposition-review-program.md)の子作業として、旧要求に含まれる
製品名、runtime、言語、DB、CI、GitHub、CLI、hook、Worker、schema、保存方式等が要求意味として不可欠か、
同じ利用結果を別方式で満たせるかを判断できるようにする。旧技術を採用しないことと、その技術が担っていた
要求・failure・回復・制約を不要にすることを分ける。

## 判断単位

技術名単位ではなく、source-qualified requirement identityと意味atomを入力にする。一つの要求に複数技術が
埋め込まれている場合は、観測可能な利用結果、内部制約、実装候補へ分解する。

| 判定候補 | 意味 |
|---|---|
| `technology_independent_requirement` | 要求意味は技術非依存で、技術選定をL3以降へ送れる |
| `required_external_constraint` | interoperability、配布先、規制、互換等により特定技術または標準が利用者契約として必要 |
| `replaceable_with_equivalence` | 別技術で正常系、failure、回復、制約、受入を同等以上に満たせる候補がある |
| `legacy_technology_prohibited` | 新世代境界に反する旧技術は再利用しないが、担っていた意味機能はsuccessorへ保持する |
| `research_required` | 選択肢、制約、運用cost、性能、移行riskの証拠が不足する |
| `poc_required` | 文書比較だけでは成立性や非機能条件を判定できず、隔離PoCが必要 |
| `unresolved` | 要求atom、consumer、環境、authorityの不足により判断不能 |

これらは候補状態であり、技術採用や要求変更を確定しない。

## 代替可能性の比較軸

各候補を少なくとも次で比較する。

- actor、利用場面、入力、出力、正常系の観測結果。
- 欠落、重複、競合、stale、部分成功、結果不明、停止、再開、rollback。
- durability、transaction、排他、idempotency、causality、replay、再構築可能性。
- 性能、容量、並列性、latency、可用性、移植性、運用・保守cost。
- security、secret／PII、permission、tenant、network、外部作用境界。
- consumer、data migration、schema evolution、version互換、段階切替、rollback。
- HARNESS利用者へ保証する契約か、HELIX-OS内部の変更可能な実現方式か。

「既存実装が動く」「旧CIがgreen」「同じAPI名」「移植が簡単」だけでは同値としない。逆に、旧実装をarchiveしたことや
技術が古いことだけで要求を不要にしない。

## 初期review対象

1. 旧`harness.db`／HELIX-DBを独立した固有systemとして残す必要性と、repo-owned authority＋交換可能なtransactional projection storeへの代替。
2. file／JSONLだけで成立する上流管理と、複数Workerのlease、queue、CAS、冪等再開に必要な永続・排他機能の境界。
3. Python semantic coreとtransactional boundaryの責務、および特定言語・runtimeをL2で拘束する必要性。
4. 旧CI／workflow／hook／CLI／AI promptの意味機能を、新世代上流から別実装へ再導出できるか。
5. GitHub固有操作と、local authorityから任意の外部協調surfaceへ投影する一般contractの境界。
6. HELIX-Web-OSのservice state／event storeとHELIX-OSの管理projectionを物理共有せず接続する方式。

## research／PoCへの接続

技術選定が必要なclusterは`research_premise`として選択肢、一次資料、version、確認時点、適用条件、反例を整理する。
成立性・性能・failure recoveryが文書だけで決まらない場合は、HARNESSのDiscovery／PoC triggerへ送り、production pathから
隔離した再現可能な証拠を得る。researchやPoCの成功から要求採用、設計freeze、実装開始を生成しない。

## Issue化と判断境界

- 本programのGitHub Issueは技術代替cluster、必要証拠、未決を共有するprojectionである。
- 独立した技術判断はlocal cluster recordを先に作り、一論点ずつ子Issueへ分ける。
- L2では利用者が必要とする結果と不変制約を確定し、変更可能な方式選択を先取りしない。
- 採用済み要求の技術拘束を外す、意味を変える、縮退する、retireする場合は対象revision付きの人間decisionを要求する。
- 選択後は承認要求からL3／L10へ降ろし、migration、rollback、consumer切替、read-afterを設計する。
- Issue close、PoC成功、benchmark一件、実装量、AI推薦から技術採用・要求変更を生成しない。

## 完了条件

- 技術を含む各対象要求について、保持する意味atomと変更可能な実装atomが区別される。
- 代替案ごとに正常系、negative case、非機能、consumer、移行、rollbackの被覆差が示される。
- 旧技術を採用しない場合も、その技術が担っていた全意味atomがsuccessorまたは人間decisionへ辿れる。
- 技術選択が対象productと適切な層へ帰属し、HARNESS製品契約とHELIX-OS内部実装を混在させない。
- 証拠不足は`research_required`／`poc_required`／`unresolved`として残り、要否整理を完了表示しない。

## 現在の停止条件

Concept v4.1と4対象L1は承認済みだが、対象別L2／L11は未採否である。意味機能と旧技術の候補比較は進めるが、
HELIX-DBを含む特定技術の採用・不採用やL3設計を決定しない。
現在は判断単位、比較軸、research／PoCへの接続、無損失条件を固定する。旧実装、旧DB、旧CI、runtimeは起動しない。
