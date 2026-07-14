---
title: "HELIX L5 詳細設計 — Universal Reverse／Redesign"
layer: L5
kind: add-design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: Codex / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-04
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
related_hst:
  - HST-HIL-002
  - HST-HIL-018
pair_artifact: docs/test-design/helix/L5-universal-reverse-redesign-integration-test-design.md
next_pair_freeze: L8
requirements:
  - HR-FR-HIL-04
  - HAC-HIL-04a
  - HAC-HIL-04b
  - HAC-HIL-04c
  - HIL-BR-04
  - HIL-BR-05
  - HIL-FR-04
  - HIL-FR-05
  - HIL-FR-08
  - HIL-FR-31
  - HIL-FR-35
  - HIL-NFR-03
  - HIL-NFR-20
source_capabilities:
  - HU-CAP-001
---

# HELIX L5 詳細設計 — Universal Reverse／Redesign

## §0 適用境界

本sliceは全Issueについて主駆動モデルとUniversal Reverseをpairにし、R0–R4の全obligationを実装前に
処理する。設計欠陥は意味差分を最初に導入するlayerのRedesignへ、state/data/schema/runtime移行は
Retrofitへ、L0影響はPO escalationへ送る。affected layerからのstale伝播とre-freezeがcurrentになるまで、
Forward claimと実装tool起動を禁止する。

primary system assertionは`HST-HIL-002`と`HST-HIL-018`である。`HST-HIL-004`と`HST-HIL-005`が扱う
PR delivery監査jobとfinding promotionはHDS-HIL-03へ後続移管し、本sliceのoracle、API、workload分母へ
含めない。本sliceはHDS-HIL-03が生成したdesign findingを入力にできるが、その配送・promotion自体の完了を
Universal Reverse receiptへ読み替えない。

## §0.1 pinned source来歴

| capability | pinned ref | source file／symbol／span | disposition | HELIXでの境界 |
|---|---|---|---|---|
| `HU-CAP-001` | `origin/main` commit `e506a67e9c243cc9781ff4a6d8d1870b072fd37b`, tree `2f0eda9a0ec69213a0a91ea9b1d3030d14f0c720` | `src/schema/route-filing.ts` `FILING_TARGET_BY_MODE` L34-L118、`routeFiling` L124-L157、file SHA-256 `b3ed0d755da06055955314665633b12893cd42ef1acf97cf27f6e7930a9c3086` | harden（強化） | `reverse`のR4再入pairと`retrofit`別routeを採用。unknown signalのForward fallback、Redesign不在は拒否 |
| `HU-CAP-001` | 同commit/tree | `src/lint/backfill-pairing.ts` `KIND_BACKFILL` L5-L19、`analyzeBackfill` L160-L248、file SHA-256 `b8ea7e33c71c66ad7fa09f61d1460f516a55c38e8a272d7a0eb2d2cac4657371` | redesign（再設計） | 双方向link検査を採用し、`conditional/none`と日付allowlistを全Issue必須契約へ置換 |
| `HU-CAP-001` | 同commit/tree | `docs/process/modes/reverse.md` §2–§5、file SHA-256 `6501ecaf4b1b6602a1f713ab078dfeb5f8257be2f15db1a86ec82f95e5df76c8` | harden（強化） | R0–R4意味、R3 PO検証、R4 pair再入を採用。type別R1 skipと先行L7例外を拒否 |
| `HU-CAP-001` | 同commit/tree | `skills/reverse-r0.md`～`skills/reverse-r4.md`、file SHA-256は順に`af299f5914ab5496e7d6af9e38539f93bab56638315f798ded0fd41e3e10e131`、`3b54f0f31fe9078bdd227fd130ef16c241dfb1fdc14e65b3dd939f1ac042ed98`、`1a670834b5c1906a4390d4e6d035c075de315e3aa28b8863851cf888d8f98283`、`144bf7cfdfeaeadcf871b25743e66e7079e17e60dba6c7dc3889feffbf00b7da`、`590c928e03fcc65d4169ba2ef66119d659c2dc20ab863a067b8a12215e5468fe` | reference-only（参照のみ） | phase観点のsource。自由記述skillの存在をsubstance receiptとみなさない |

現行`src/state-db/reverse-candidates.ts`と旧backfill lintはsource evidenceであり、Universal Reverse、
Redesign、stale/re-freezeの実装済み証拠ではない。

## §1 componentとauthority

| component | 責務 | authority | fail-close条件 |
|---|---|---|---|
| `ReverseObligationCompiler` | Issue、drive、scope、source manifestからR0–R4の原子的分母を生成 | obligation manifestだけ | phase欠落、range、sample、分母不明 |
| `ReversePhaseSubstanceGate` | stage固有schema、span、assertion、digest、coverageを検査 | phase receiptだけ | 空、placeholder、同文、同digest、source欠落 |
| `ReverseWorkloadLedger` | phase別total/completed/blockedとitem setを保存 | workload receiptだけ | 件数削減、例外値、budget免除 |
| `UniversalReversePairGate` | 主駆動モデルとR0–R4 receiptを同じIssue revisionへpair | Universal Reverse receiptだけ | pair欠落、別snapshot、R4前claim |
| `ChangeRouteClassifier` | Redesign、Retrofit、L0、DesignRefactor、Forwardを排他分類 | route proposalだけ | unknown Forward fallback、誤route |
| `RedesignRouter` | 最小affected layerを決め、完全な下流closureをstale化 | route eventだけ | 誤layer、過広root、pair漏れ |
| `ReentryFreezeCoordinator` | affected Lからpair、consumer、oracleを再検証 | re-freeze receiptだけ | stale残存、旧receipt、partial freeze |
| `ImplementationEntryInterlock` | current bundle後だけclaimをCAS | claim receiptだけ | claim-before-tool違反、boolean override |

Node authorityだけがimmutable artifact、event、projectionを検証・更新する。AIはobligation、finding、
route候補を提案できるが、phase pass、L0承認、stale解消、freeze、claimを直接writeしない。

## §2 R0–R4 substanceと処理量保存

| phase | 必須意味単位 | workload分母 | 拒否条件 |
|---|---|---|---|
| R0 | pinned snapshot、evidence map、file/test inventory、negative evidence | source entry、span、file、test、unreadable item | span 0、未読source、代表抽出 |
| R1 | API/DB/type/event/config/compatibilityの観測contract | R0から導出したcontract surface | skip、placeholder、探索なし結論 |
| R2 | as-is design/test、DAG、owner、state、impact、missing pair | node、edge、consumer、test/pair | 同文、孤立node、R0逆参照不能 |
| R3 | intent仮説、代替、反証、gap、authority、PO検証 | hypothesis、alternative、counterexample、decision | digest再利用、反証なし、PO receipt欠落 |
| R4 | gap register、route、affected layers、stale set、pair/backprop | gap、route、descendant、pair、consumer | obligation未被覆、route不在 |

全phase artifactはIssue revision、phase、obligation set、input/output/predecessor digest、source spans、
semantic assertions、workload total/completed/blockedを持つ。completed＋blockedはtotalと一致し、
blockedが一件でもあればpassしない。`none/not-required/exempt`、phase range一行、同文複製、
文字数だけのpassは禁止する。budget到達時も分母を減らさず`incomplete`へcheckpointし、completionとclaimを0にする。

## §3 Universal Reverseのpair

全Issueは主駆動モデルreceiptとUniversal Reverse receiptを同じIssue revision、scope、source snapshotへbindする。
R0からR4のpredecessor chain、phase別100% semantic coverage、R4 route、pair-freeze targetがcurrentな場合だけ
`reverse_r4 -> pair_freeze_ready`を許す。Reverseだけ、主駆動モデルだけ、別revisionのreceipt、range receiptは
`HIL_REVERSE_PAIR_MISSING`または具体的substance failureで拒否する。

## §4 route、minimality、L0 authorityの規則

| 変化 | route | affected L | 必須証拠 |
|---|---|---|---|
| requirement、public contract、設計責務、pair、oracleの意味変更 | `Redesign` | 意味差分を最初に導入するL1–L6 | before/after、consumer、pair、oracle |
| persisted state、data、schema、runtime/dependency移行 | `Retrofit` | 実装Lと影響設計L | migration、dry-run、backup、rollback、monitoring |
| charter、目的、自律境界、不可逆方針 | `escalate_l0` | L0 | current snapshotへbindしたPO decision |
| behavior不変の構造改善 | `DesignRefactor` | candidate L | 同値性、consumer、oracle、rollback |
| 設計・state差分なし | `forward_current` | なし | gap dispositionとcurrent pair |

route minimalityは意味差分を最初に導入する最小Lをrootとし、そのrootから必要なdescendant closureを漏れなく取る。
一段上への過広Redesignと一段下への過少Redesignをともに拒否する。state migrationとcontract変更が共存する場合は
Retrofitを主route、Redesignを同一causalityの先行subtaskとする。L0はPO decision前のdesign write、freeze、claimが0である。

## §5 L1/L2 staleとre-entry

L1変更はL1 design、L14 operational pair、全descendant、上下edge、consumer、oracleをstale化する。
L2変更はScreen Applicability、prototype/no-UI receipt、L3以降のdescendantと関連pairをstale化する。
L3–L6は該当V-pairと全下流をstale化する。stale eventはsource/target revision、cause、route、
previous/current digestを持つ。

re-entryはaffected LからForward順にdesign修正、上下backprop、V-pair更新、oracle実行、pair-freezeを行う。
同一snapshot lineageでstale 0になった後だけre-freeze receiptを発行する。旧freeze、旧CI、旧claim、
別branch greenは再利用しない。L0はPO承認済みcharter revisionが無い限りproposalで停止する。

## §6 claim-before-toolとIssue transition

ready、implement、merge、closeの各transitionはUniversal Reverse pair、正route、stale 0、re-freeze、
その他のIssue gate receiptをcurrent bundleとして要求する。HDS-HIL-04はReverse/Redesign receiptを供給し、
generic Issue Gateの統合はHDS-HIL-05へ接続する。Codex claim CASは実装tool起動より必ず先であり、
欠落時はtool call 0とblocked reasonを返す。queue row、PLAN file、AI claim、boolean overrideはreceiptではない。

## §7 harness.db射影

| table | 主key／必須field | 不変条件 |
|---|---|---|
| `reverse_runs` | Issue revision、drive、scope/source snapshot、R0–R4 digest | revisionごとcurrent最大1 |
| `reverse_phase_obligations` | run＋phase＋obligation、kind、source、status、digest | 各phase一件以上、range禁止 |
| `reverse_phase_artifacts` | run＋phase、schema/input/output/predecessor、span/assertion | R0→R4連続、同digest禁止 |
| `reverse_workload_receipts` | run＋phase、total/completed/blocked、item set | blocked>0でpass禁止 |
| `reverse_pair_receipts` | run、drive receipt、R0–R4、route、pair target | Issue revision/snapshot一致 |
| `change_route_decisions` | R4、classification、affected L、evidence、authority | route一意、L0はPO pending |
| `design_stale_edges` | route、source/target revision、edge kind、reason | descendant closure全件 |
| `reentry_freeze_receipts` | route、snapshot、design/pair/oracle/stale digest | stale 0、同一lineage |
| `implementation_entry_receipts` | Issue revision、Reverse/route/freeze/lease digest | tool callより先行 |

FKは全phase/artifact/workload/pair/route/stale/re-entry rowを同じ`reverse_run_id + issue_revision`へ拘束する。
`reverse_phase_artifacts`は`unique(run, phase)`、obligationは`unique(run, phase, obligation_id)`、routeは`unique(run)`、
stale edgeは`unique(route, source_revision, target_revision, edge_kind)`、re-freezeは`unique(route, snapshot)`とする。
workloadには`check(total >= 1)`、`check(completed >= 0)`、`check(blocked >= 0)`、`check(completed + blocked = total)`を置き、
blocked 0かつ全obligation semantic passでないpair/refreezeをDB境界でも拒否する。

## §7.1 Reverse／route／re-freezeの不可分commit

Node `UniversalReverseStore`はmanifest、R0–R4 artifact、workload、drive pair、route、Redesign causality、Retrofit migration evidence、
stale closure、re-entry、re-freezeを`UniversalReverseCommitBundleV1`へ束ねる。bundleはoperation/payload digest、
`expected_event_head`、`expected_projection_head`、expected run/route revision、全write set digestを持ち、一つのtransactionでcommitする。

同operation・同digestは既存receiptを返すno-op、同operation・異digest、stale head、FK/unique/check違反は全write 0である。
event、run、各phase/artifact/workload、pair、route、stale edge、re-entry、re-freezeの各append位置へfaultを注入した場合もpartial 0とする。
rebuildはevent chainからprojectionを決定論再生成し、reconcileはimmutable artifact/evidenceと同operation/headから未完commitを再開するだけで、
phase pass、route、stale解消、freezeを推測しない。

Redesign routeはfinding、before/after semantic digest、最小affected layer、parent Issue、Reverse run、stale closureを同じ
`redesign_causality_id`へbindする。Retrofit classifierはpersisted state/data/schema/runtime/dependency差分をtypedに列挙し、
対象snapshotへbindしたmigration plan、dry-run、backup、rollback rehearsal、monitoring/abort threshold receiptが全てcurrentになるまで
route commitとForward claimを拒否する。Redesignを伴うRetrofitは同一causalityの先行Redesign receiptを必須とする。

stale commitとre-freeze commitは別operationであり、re-freezeはstale set全件のsuperseding receipt、再実行oracle、updated pair、
same snapshot lineageを不可分にcommitする。stale appendまたはrefreeze appendの一件でも失敗した場合は旧current状態を維持し、
新しいclaim eligibilityを公開しない。

## §8 L8 exact trace対応表

| L5責務 | HAC | exact HST | L8 oracle | pre_state | expected_state | canonical failure |
|---|---|---|---|---|---|---|
| Universal Reverse正常 | `HAC-HIL-04a` | `HST-CASE-002-01` | `IT-URR-001` | `reverse_r4` | `pair_freeze_ready` | `なし（正常系）` |
| stage欠落 | `HAC-HIL-04b` | `HST-CASE-002-02` | `IT-URR-002` | `reverse_incomplete` | `reverse_incomplete` | `HIL_REVERSE_STAGE_MISSING` |
| L1 pair stale | `HAC-HIL-04c` | `HST-CASE-002-03` | `IT-URR-003` | `pair_current` | `pair_stale` | `HIL_REDESIGN_PAIR_STALE` |
| L2 screen stale | `HAC-HIL-04c` | `HST-CASE-002-04` | `IT-URR-004` | `screen_receipt_current` | `screen_receipt_stale` | `HIL_REDESIGN_SCREEN_STALE` |
| L0 PO escalation | `HAC-HIL-04c` | `HST-CASE-002-05` | `IT-URR-005` | `redesign_pending` | `po_escalation_required` | `HIL_REDESIGN_L0_APPROVAL_REQUIRED` |
| 主駆動pair必須 | `HAC-HIL-04a` | `HST-CASE-002-06` | `IT-URR-006` | `assertion_input_ready` | `assertion_pass` | `HIL_REVERSE_PAIR_MISSING` |
| Redesign必須 | `HAC-HIL-04c` | `HST-CASE-002-07` | `IT-URR-007` | `assertion_input_ready` | `assertion_pass` | `HIL_REDESIGN_ROUTE_MISSING` |
| gate bypass拒否 | `HAC-HIL-04a` | `HST-CASE-002-08` | `IT-URR-008` | `assertion_input_ready` | `assertion_pass` | `HIL_ISSUE_GATE_BYPASS` |
| affected L判定 | `HAC-HIL-04c` | `HST-CASE-002-09` | `IT-URR-009` | `assertion_input_ready` | `assertion_pass` | `HIL_REDESIGN_LAYER_INVALID` |
| claim-before-tool | `HAC-HIL-04a` | `HST-CASE-002-10` | `IT-URR-010` | `assertion_input_ready` | `assertion_pass` | `HIL_IMPLEMENTATION_NOT_READY` |
| L1/L2 re-entry | `HAC-HIL-04c` | `HST-CASE-002-11` | `IT-URR-011` | `assertion_input_ready` | `assertion_pass` | `HIL_REDESIGN_REENTRY_BYPASS` |
| substance正常 | `HAC-HIL-04a`, `HAC-HIL-04b` | `HST-CASE-018-01` | `IT-URR-012` | `reverse_r4` | `pair_freeze_ready` | `なし（正常系）` |
| R0 source span | `HAC-HIL-04b` | `HST-CASE-018-02` | `IT-URR-013` | `reverse_r0` | `reverse_r0` | `HIL_REVERSE_SUBSTANCE_SOURCE_MISSING` |
| R1 placeholder | `HAC-HIL-04b` | `HST-CASE-018-03` | `IT-URR-014` | `reverse_r1` | `reverse_r1` | `HIL_REVERSE_SUBSTANCE_PLACEHOLDER` |
| R2同文 | `HAC-HIL-04b` | `HST-CASE-018-04` | `IT-URR-015` | `reverse_r2` | `reverse_r2` | `HIL_REVERSE_SUBSTANCE_IDENTICAL` |
| R3 digest再利用 | `HAC-HIL-04b` | `HST-CASE-018-05` | `IT-URR-016` | `reverse_r3` | `reverse_r3` | `HIL_REVERSE_SUBSTANCE_DIGEST_REUSED` |
| R4 obligation | `HAC-HIL-04b` | `HST-CASE-018-06` | `IT-URR-017` | `reverse_r4` | `reverse_r4` | `HIL_REVERSE_OBLIGATION_MISSING` |
| budget checkpoint | `HAC-HIL-04b` | `HST-CASE-018-07` | `IT-URR-018` | `reverse_incomplete` | `reverse_incomplete` | `HIL_REVERSE_BUDGET_INCOMPLETE` |
| phase skip | `HAC-HIL-04b` | `HST-CASE-018-08` | `IT-URR-019` | `reverse_r0` | `reverse_r0` | `HIL_REVERSE_PHASE_SKIP` |
| hollow拒否 | `HAC-HIL-04b` | `HST-CASE-018-09` | `IT-URR-020` | `assertion_input_ready` | `assertion_pass` | `HIL_REVERSE_SUBSTANCE_HOLLOW` |
| waiver拒否 | `HAC-HIL-04b` | `HST-CASE-018-10` | `IT-URR-021` | `assertion_input_ready` | `assertion_pass` | `HIL_REVERSE_OBLIGATION_WAIVED` |
| semantic coverage | `HAC-HIL-04b` | `HST-CASE-018-11` | `IT-URR-022` | `assertion_input_ready` | `assertion_pass` | `HIL_REVERSE_SEMANTIC_COVERAGE_INCOMPLETE` |

## §9 freeze条件

L5/L8 pairは22/22 exact tuple、全R0–R4 workload、hollow/skip mutation、Universal Reverse pair、
Redesign/Retrofit/L0 route、L1/L2 stale closure、re-freeze前claim/tool 0、pinned source fixture、
別runtime reviewが揃うまでdraftとする。本書は設計のみであり、旧Reverse候補queryや文書の存在を
実装完了、実行green、freeze証拠にしない。
