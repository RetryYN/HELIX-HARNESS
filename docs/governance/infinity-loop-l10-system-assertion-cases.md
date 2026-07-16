---
title: "HELIX L10 Infinity Loop atomic system assertion cases"
status: draft
created: 2026-07-16
updated: 2026-07-16
owner: QA / TL
schema: infinity-loop-l10-system-cases.v1
system_test_design: docs/test-design/helix/L10-infinity-loop-platform-system-test-design.md
assertions: docs/governance/infinity-loop-assertion-coverage-ledger.md
---

# HELIX L10 Infinity Loop atomic system assertion cases （日本語の契約見出し）

## §0 Contract

HST-HIL-034..041のfamily行を合格単位にせず、各familyをnormal 1件、対応requirement/HIA別negative 1件、
boundary 1件へ分解する。同じHIAが複数familyのcontextになる場合もcaseを別IDで保持し、primary requirement
coverageへ重複算入しない。family failureは集約verdict専用で、個別failure codeを隠さない。

## §1 Atomic cases（66/66設計）

| case ID | HST | requirement | HIA | kind | precondition | stimulus | observable | failure code | design status | execution status | （日本語の機械契約記述）
|---|---|---|---|---|---|---|---|---|---|---|
| HST-A-034-N01 | HST-HIL-034 | family | — | normal | current L2 agreement/no-UI、L3/L10、L4/L9、L5/L8、L6/L7 contractとslice digestがある | production Scrum sliceを正規順序で完走する | 6 pairとTDD順序の全receiptが同一sliceで閉じる | なし（正常系） | design-defined | not-implemented |
| HST-A-034-F01 | HST-HIL-034 | HIL-BR-13 | HIA-BR-013 | negative | 画面対象PLANと画面非対象PLANがある | L3要件freezeを要求する | L2 prototype agreementまたは有効なno-UI receiptが無ければ拒否 | `HIL_SCREEN_DECISION_MISSING` | design-defined | not-implemented |
| HST-A-034-F02 | HST-HIL-034 | HIL-BR-25 | HIA-BR-025 | negative | L1–L12 ledger、上下edge、正規6 V-pair fixtureがある | Layer Ledger Chainの工程完了を要求する | 全原子的obligationが上下・左右双方向へ閉じた場合だけ完了する | `HIL_LAYER_LEDGER_CHAIN_INCOMPLETE` | design-defined | not-implemented |
| HST-A-034-F03 | HST-HIL-034 | HIL-FR-01 | HIA-FR-001 | negative | current Issue contractと各段receipt fixtureがある | 全state transitionと順序飛越を実行する | 正順だけappendされ、各stateがdigestとcauseへbindする | `HIL_STATE_TRANSITION_INVALID` | design-defined | not-implemented |
| HST-A-034-F04 | HST-HIL-034 | HIL-FR-05 | HIA-FR-005 | negative | L1からL5の各layerへ影響するdesign findingがある | Redesign routingを実行する | affected layerと下流pairをstale化し、L1企画・scope変更はPOへescalateする | `HIL_REDESIGN_LAYER_INVALID` | design-defined | not-implemented |
| HST-A-034-F05 | HST-HIL-034 | HIL-FR-20 | HIA-FR-020 | negative | prototype route、no-UI route、evidence欠落routeがある | L3要件freezeを要求する | 有効なL2 agreementまたはskipだけを通し欠落routeを拒否する | `HIL_SCREEN_GATE_EVIDENCE_MISSING` | design-defined | not-implemented |
| HST-A-034-F06 | HST-HIL-034 | HIL-FR-31 | HIA-FR-031 | negative | L1またはL2へ影響するfindingがある | 実装claimとForward joinを要求する | pairとscreen evidenceをstale化し再freeze前の進行を拒否する | `HIL_REDESIGN_REENTRY_BYPASS` | design-defined | not-implemented |
| HST-A-034-F07 | HST-HIL-034 | HIL-FR-49 | HIA-FR-049 | negative | 正規V-pairのdesign、verification、oracle、snapshot欠落fixtureがある | Horizontal V-Pair Gateを実行する | 左右双方向・同一oracle/snapshot・実行済みのpairだけをgreenにする | `HIL_LAYER_VPAIR_INCOMPLETE` | design-defined | not-implemented |
| HST-A-034-B01 | HST-HIL-034 | family | — | boundary | current L2 agreement/no-UI、L3/L10、L4/L9、L5/L8、L6/L7 contractとslice digestがある | boundary条件を適用する | scope hash変更時に旧screen/pair receiptをstale化してL2へ再entryする | `HIL_SCREEN_SCOPE_STALE` | design-defined | not-implemented |
| HST-A-035-N01 | HST-HIL-035 | family | — | normal | 14 entry、全質問、typed schema、authority policyがある | Universal packageからinterviewとworkflow modelを再生成する | 全entry/question dispositionとtyped ref/provenanceが同一digestで閉じる | なし（正常系） | design-defined | not-implemented |
| HST-A-035-F01 | HST-HIL-035 | HIL-BR-26 | HIA-BR-026 | negative | workflow断片と欠落情報がある | interviewとnormalizationを実行する | state×trigger×condition→action→nextが根拠付きで閉じる | `HIL_WORKFLOW_MODEL_INCOMPLETE` | design-defined | not-implemented |
| HST-A-035-F02 | HST-HIL-035 | HIL-BR-27 | HIA-BR-027 | negative | 回答、保留、拒否、N/A fixtureがある | interview dispositionを保存する | 全質問がtyped dispositionとsource spanを持つ | `HIL_INTERVIEW_DISPOSITION_MISSING` | design-defined | not-implemented |
| HST-A-035-F03 | HST-HIL-035 | HIL-FR-51 | HIA-FR-051 | negative | 正常・schema矛盾・改変ZIPがある | package登録を行う | entry分類、digest、version、採否、hardening義務が完全なpackageだけ登録される | `HIL_UNIVERSAL_PACKAGE_INVALID` | design-defined | not-implemented |
| HST-A-035-F04 | HST-HIL-035 | HIL-FR-52 | HIA-FR-052 | negative | core質問とdrill-down条件がある | interview planを実行する | 質問分母と全dispositionが保存され重複質問が抑止される | `HIL_WORKFLOW_INTERVIEW_INCOMPLETE` | design-defined | not-implemented |
| HST-A-035-F05 | HST-HIL-035 | HIL-FR-53 | HIA-FR-053 | negative | 参照切れと曖昧遷移を含むworkflow入力がある | typed modelへ正規化する | stable IDと参照整合が成立し曖昧性がfindingになる | `HIL_WORKFLOW_NORMALIZATION_INVALID` | design-defined | not-implemented |
| HST-A-035-F06 | HST-HIL-035 | HIL-TR-12 | HIA-TR-012 | negative | Universal packageの正常・不正出力がある | strict adapterへ投入する | Node再検証済みproposalだけが正本候補になる | `HIL_UNIVERSAL_ADAPTER_AUTHORITY_BYPASS` | design-defined | not-implemented |
| HST-A-035-F07 | HST-HIL-035 | HIL-NFR-30 | HIA-NFR-030 | negative | raw entry/prompt/fixtureと同一入力の複数runがある | proposal authorityとprovenanceを判定する | raw実行authorityを拒否し、全派生結果がentry digest/transform version/input snapshotへ結ばれ同一digestで再現する | `HIL_UNIVERSAL_AUTHORITY_OR_PROVENANCE_INVALID` | design-defined | not-implemented |
| HST-A-035-F08 | HST-HIL-035 | HIL-NFR-32 | HIA-NFR-032 | negative | 未回答、推測回答、AI終端化がある | requirement freezeを要求する | PO/authority dispositionまでfreezeを拒否する | `HIL_INTERVIEW_UNRESOLVED_AT_FREEZE` | design-defined | not-implemented |
| HST-A-035-F09 | HST-HIL-035 | HIL-NFR-34 | HIA-NFR-034 | negative | Universal/package/LLMが自己承認する提案とjudgment-core競合がある | authority判定とcommitを要求する | judgment-coreを上位規律、Universalをproposal、Node gateをcommit authorityとしself-approvalを拒否する | `HIL_JUDGMENT_AUTHORITY_INVERTED` | design-defined | not-implemented |
| HST-A-035-B01 | HST-HIL-035 | family | — | boundary | 14 entry、全質問、typed schema、authority policyがある | boundary条件を適用する | 同package/version/input snapshot再送でdigest一致・副作用0になる | `HIL_UNIVERSAL_REPLAY_NONIDEMPOTENT` | design-defined | not-implemented |
| HST-A-036-N01 | HST-HIL-036 | family | — | normal | current workflow modelとderivation policyがある | completeness検査とrequirement/AC/test/8 surface導出を行う | 全atomic transitionが全derived edgeへexact joinする | なし（正常系） | design-defined | not-implemented |
| HST-A-036-F01 | HST-HIL-036 | HIL-BR-28 | HIA-BR-028 | negative | 分岐・loop・異常系を含むworkflowがある | 要求とoracleを導出する | 全transitionが要求・AC・testへ双方向到達する | `HIL_WORKFLOW_DERIVATION_ORPHAN` | design-defined | not-implemented |
| HST-A-036-F02 | HST-HIL-036 | HIL-FR-54 | HIA-FR-054 | negative | undefined state、欠落next、無限loop、terminal欠落がある | completeness gateを実行する | 各欠落を原子的failureで拒否する | `HIL_WORKFLOW_COMPLETENESS_FAILED` | design-defined | not-implemented |
| HST-A-036-F03 | HST-HIL-036 | HIL-FR-55 | HIA-FR-055 | negative | 完全なtransition集合がある | 要求・AC・test・surfaceを導出する | 各成果がsource transitionへexact joinする | `HIL_WORKFLOW_REQUIREMENT_TRACE_MISSING` | design-defined | not-implemented |
| HST-A-036-F04 | HST-HIL-036 | HIL-NFR-31 | HIA-NFR-031 | negative | file存在だけgreen、aggregate transition、branch/loop/terminal/derived edge欠落がある | atomic coverage分母を算出する | atomic childだけを分母にし、aggregate一括greenと欠落1件を拒否する | `HIL_WORKFLOW_ATOMIC_GAP` | design-defined | not-implemented |
| HST-A-036-F05 | HST-HIL-036 | HIL-NFR-32 | HIA-NFR-032 | negative | 未回答、推測回答、AI終端化がある | requirement freezeを要求する | PO/authority dispositionまでfreezeを拒否する | `HIL_INTERVIEW_UNRESOLVED_AT_FREEZE` | design-defined | not-implemented |
| HST-A-036-B01 | HST-HIL-036 | family | — | boundary | current workflow modelとderivation policyがある | boundary条件を適用する | 根拠/source span付きN/Aだけを明示控除しsilent skipを拒否する | `HIL_WORKFLOW_NA_DISPOSITION_INVALID` | design-defined | not-implemented |
| HST-A-037-N01 | HST-HIL-037 | family | — | normal | workflow、candidate、resource、authority policyがある | runtime orchestration planを生成してMusterへ渡す | route/schedule/allocation/retry/fallback/dead-letterが全terminalへ到達する | なし（正常系） | design-defined | not-implemented |
| HST-A-037-F01 | HST-HIL-037 | HIL-BR-29 | HIA-BR-029 | negative | routing、schedule、resource、fallback fixtureがある | orchestration planを生成する | 必須処理を省略せず全terminalへ到達可能になる | `HIL_ORCHESTRATION_PLAN_INCOMPLETE` | design-defined | not-implemented |
| HST-A-037-F02 | HST-HIL-037 | HIL-FR-56 | HIA-FR-056 | negative | route、resource、retry、fallback、dead-letter条件がある | runtime planを作る | 全条件がbounded planとterminal routeを持つ | `HIL_RUNTIME_ORCHESTRATION_ROUTE_MISSING` | design-defined | not-implemented |
| HST-A-037-F03 | HST-HIL-037 | HIL-NFR-33 | HIA-NFR-033 | negative | resource上限より多い必須処理がある | planを生成する | checkpoint/retryへ分割し必須処理をdropしない | `HIL_REQUIRED_PROCESSING_DROPPED` | design-defined | not-implemented |
| HST-A-037-F04 | HST-HIL-037 | HIL-NFR-34 | HIA-NFR-034 | negative | Universal/package/LLMが自己承認する提案とjudgment-core競合がある | authority判定とcommitを要求する | judgment-coreを上位規律、Universalをproposal、Node gateをcommit authorityとしself-approvalを拒否する | `HIL_JUDGMENT_AUTHORITY_INVERTED` | design-defined | not-implemented |
| HST-A-037-B01 | HST-HIL-037 | family | — | boundary | workflow、candidate、resource、authority policyがある | boundary条件を適用する | capacity=0でもwork/evidenceをdropせずcheckpoint＋queueへ送る | `HIL_ORCHESTRATION_ZERO_CAPACITY_DROP` | design-defined | not-implemented |
| HST-A-038-N01 | HST-HIL-038 | family | — | normal | registered serviceのroutine actionとcurrent profileがある | canonical intentをstanding authorizationへ照合する | exact minimum scopeだけ追加質問0でallowする | なし（正常系） | design-defined | not-implemented |
| HST-A-038-F01 | HST-HIL-038 | HIL-BR-30 | HIA-BR-030 | negative | project内外と許可済み外部serviceのintentがある | authorizationを判定する | scope内だけ自動許可しproject外を拒否する | `HIL_STANDING_AUTHORIZATION_SCOPE_VIOLATION` | design-defined | not-implemented |
| HST-A-038-F02 | HST-HIL-038 | HIL-FR-57 | HIA-FR-057 | negative | tool表現が異なる同一操作群とfield欠落fixtureがある | canonical intentへ正規化する | actor/objective/operation class/target identity/scope/expected mutation/risk/authority profile/expiry/causality IDの10 fieldが同じsemantic digestへ収束し、欠落を拒否する | `HIL_ACTION_INTENT_INVALID` | design-defined | not-implemented |
| HST-A-038-F03 | HST-HIL-038 | HIL-FR-58 | HIA-FR-058 | negative | repository/service、operation、target、mutation、credential reference、expiry/revocation、ownerの異なるprofileがある | registryへ登録・照会する | 全fieldをrevision化し、currentかつexact scope一致のprofileだけが返る | `HIL_STANDING_AUTHORIZATION_STALE` | design-defined | not-implemented |
| HST-A-038-F04 | HST-HIL-038 | HIL-NFR-35 | HIA-NFR-035 | negative | coveredなproject内・登録service通常操作とplatform物理promptがある | authorizationを照合する | HELIX追加質問0でallowし、platform promptをHELIX authority receiptとして偽装しない | `HIL_AUTHORIZED_ACTION_REPROMPTED` | design-defined | not-implemented |
| HST-A-038-F05 | HST-HIL-038 | HIL-NFR-36 | HIA-NFR-036 | negative | executable/shell/Python prefix、自由文包括許可、credential-only、exact target+operation profileがある | standing profileへ登録する | exact target+operationの最小権限profileだけを受理し過大許可を拒否する | `HIL_AUTHORIZATION_MINIMUM_SCOPE_VIOLATION` | design-defined | not-implemented |
| HST-A-038-B01 | HST-HIL-038 | family | — | boundary | registered serviceのroutine actionとcurrent profileがある | boundary条件を適用する | expiry/revocation/profile revision競合を新snapshotで再判定する | `HIL_AUTHORIZATION_PROFILE_RACE` | design-defined | not-implemented |
| HST-A-039-N01 | HST-HIL-039 | family | — | normal | allowed intent、platform capability、current gate receiptがある | broker経由でbounded actionを実行する | authorize/platform/execution/audit receiptが同intent digestでexactly onceになる | なし（正常系） | design-defined | not-implemented |
| HST-A-039-F01 | HST-HIL-039 | HIL-FR-59 | HIA-FR-059 | negative | standing profile、Scope、Issue/PLAN state、high-impact境界の組合せがある | authorization gateを実行する | 全gate一致の通常操作だけallowし、deny/challengeを実行queueへ流さない | `HIL_EXECUTION_AUTHORIZATION_DENIED` | design-defined | not-implemented |
| HST-A-039-F02 | HST-HIL-039 | HIL-FR-60 | HIA-FR-060 | negative | 許可済み・改変・重複・timeout intentがある | broker経由で実行する | 検証済みintentだけを一度実行しbounded receiptを残す | `HIL_BOUNDED_ACTION_EXECUTION_INVALID` | design-defined | not-implemented |
| HST-A-039-F03 | HST-HIL-039 | HIL-TR-13 | HIA-TR-013 | negative | OS/tool/platform別permission requestがある | broker adapterへ投影する | canonical intentとreceiptの意味がplatform間で一致する | `HIL_PERMISSION_BROKER_CONTRACT_DRIFT` | design-defined | not-implemented |
| HST-A-039-F04 | HST-HIL-039 | HIL-NFR-37 | HIA-NFR-037 | negative | target/repository/service/operation/risk/profile revision/expiry/revocationを一件ずつdriftさせる | authorization receiptを再利用する | 全driftをfail-closeし類似名・過去profileへfallbackしない | `HIL_AUTHORIZATION_REVOCATION_OR_DRIFT_IGNORED` | design-defined | not-implemented |
| HST-A-039-F05 | HST-HIL-039 | HIL-NFR-38 | HIA-NFR-038 | negative | release、本番、auth、PII等の高影響intentがある | standing authorizationを適用する | 上位gateを上書きせずaction-binding approvalを要求する | `HIL_AUTHORIZATION_GATE_OVERRIDE` | design-defined | not-implemented |
| HST-A-039-B01 | HST-HIL-039 | family | — | boundary | allowed intent、platform capability、current gate receiptがある | boundary条件を適用する | duplicate/retry/timeoutでもmutation 1件・terminal receipt 1件になる | `HIL_BOUNDED_EXECUTION_DUPLICATED` | design-defined | not-implemented |
| HST-A-040-N01 | HST-HIL-040 | family | — | normal | 162 requirementと全semantic edgeがcurrentである | Requirement Freeze Gateを実行する | 162/162 source/authority/oracle/template/obligation/pair/reviewがexact joinする | なし（正常系） | design-defined | not-implemented |
| HST-A-040-F01 | HST-HIL-040 | HIL-BR-22 | HIA-BR-022 | negative | requirement/service/domain objectとtemplate catalogがある | 設計義務graphを導出しfreezeを要求する | 原子的義務とsemantic dischargeが100%結ばれない限り拒否する | `HIL_DESIGN_OBLIGATION_INCOMPLETE` | design-defined | not-implemented |
| HST-A-040-F02 | HST-HIL-040 | HIL-BR-23 | HIA-BR-023 | negative | custodied inputと表現不能な設計義務がある | Requirement Translatorとtemplate改善loopを実行する | atom/challenge/gap Issueへ決定的に分岐し無監査templateをactive化しない | `HIL_REQUIREMENT_TRANSLATION_UNSAFE` | design-defined | not-implemented |
| HST-A-040-F03 | HST-HIL-040 | HIL-BR-24 | HIA-BR-024 | negative | 原文、atom、authority、acceptance、service、template、obligation fixtureがある | 要件定義revisionをactive化する | 全設計判断とtyped edgeが台帳化されたrevisionだけactiveになる | `HIL_REQUIREMENT_DEFINITION_INCOMPLETE` | design-defined | not-implemented |
| HST-A-040-F04 | HST-HIL-040 | HIL-FR-42 | HIA-FR-042 | negative | requirement/service/objectと各facet fixtureがある | obligation graphを導出・消込する | orphan、未消込、偽N/A、aggregate消込を個別failureにする | `HIL_DESIGN_OBLIGATION_INCOMPLETE` | design-defined | not-implemented |
| HST-A-040-F05 | HST-HIL-040 | HIL-FR-43 | HIA-FR-043 | negative | 原子的、複合、曖昧、authority欠落入力がある | requirement atomへ翻訳する | 原文を維持しatomまたはchallengeへ送り根拠のない確定をしない | `HIL_REQUIREMENT_ATOM_AGGREGATE_ONLY` | design-defined | not-implemented |
| HST-A-040-F06 | HST-HIL-040 | HIL-FR-45 | HIA-FR-045 | negative | valid/invalid revision、split、merge、rename、supersede、N/A fixtureがある | requirement changeを適用する | 全atom disposition、semantic digest、authority、downstream stale receipt欠落を拒否する | `HIL_REQUIREMENT_CHANGE_RECEIPT_MISSING` | design-defined | not-implemented |
| HST-A-040-F07 | HST-HIL-040 | HIL-NFR-26 | HIA-NFR-026 | negative | 見出し、TBD、空表、複合discharge、自由文N/Aがある | design coverageを判定する | semantic evidenceと原子的edgeがない全義務を未完了にする | `HIL_DESIGN_TEMPLATE_SECTION_HOLLOW` | design-defined | not-implemented |
| HST-A-040-F08 | HST-HIL-040 | HIL-NFR-28 | HIA-NFR-028 | negative | 連番とcoverage行だけがある要求、orphan、stale、ambiguity fixtureがある | requirement freezeを要求する | semantic設計edgeが完全でない要求をgreenにしない | `HIL_REQUIREMENT_LEDGER_SEMANTIC_GAP` | design-defined | not-implemented |
| HST-A-040-F09 | HST-HIL-040 | HIL-NFR-32 | HIA-NFR-032 | negative | 未回答、推測回答、AI終端化がある | requirement freezeを要求する | PO/authority dispositionまでfreezeを拒否する | `HIL_INTERVIEW_UNRESOLVED_AT_FREEZE` | design-defined | not-implemented |
| HST-A-040-B01 | HST-HIL-040 | family | — | boundary | 141 requirementと全semantic edgeがcurrentである | boundary条件を適用する | 根拠/source span/reviewer付きscope N/Aだけを明示控除する | `HIL_SEMANTIC_NA_INVALID` | design-defined | not-implemented |
| HST-A-041-N01 | HST-HIL-041 | family | — | normal | sealed current refs、CI/PLAN status、source snapshotsがある | UT/source atomizationとanti-corruption adoptionを実行する | 全ref/atom dispositionとHybrid translation receiptが閉じる | なし（正常系） | design-defined | not-implemented |
| HST-A-041-F01 | HST-HIL-041 | HIL-BR-14 | HIA-BR-014 | negative | ZIP、前身exact 2 repositoryのcurrent all-advertised ref authority、現行HELIXのsnapshotがある | source coverageを判定する | ref/content/edge分母またはatomic behavior未分類、trace孤児が一件でもあれば拒否 | `HIL_SOURCE_AGGREGATE_ONLY` | design-defined | not-implemented |
| HST-A-041-F02 | HST-HIL-041 | HIL-BR-20 | HIA-BR-020 | negative | 既知failureと新fingerprintを含むCI結果がある | quarantineを適用する | exact既知failureだけを隔離し、新failureと代替gate失敗はfailになる | `HIL_CI_QUARANTINE_INVALID` | design-defined | not-implemented |
| HST-A-041-F03 | HST-HIL-041 | HIL-FR-16 | HIA-FR-016 | negative | ZIP、前身exact 2 repositoryのA/B一致済みheads/tags/pull authority、現行HELIXの固定manifestがある | asset inventoryを実行する | receipt由来の全atomic capabilityに一件の採否と根拠がありpendingがゼロになる | `HIL_ASSET_DECISION_MISSING` | design-defined | not-implemented |
| HST-A-041-F04 | HST-HIL-041 | HIL-FR-22 | HIA-FR-022 | negative | pending、根拠なしreject、orphan、複合IDを含むledgerがある | coverage判定を実行する | 各不備を個別failureで検出しpair-freezeを拒否する | `HIL_SOURCE_ATOM_ORPHAN` | design-defined | not-implemented |
| HST-A-041-F05 | HST-HIL-041 | HIL-NFR-12 | HIA-NFR-012 | negative | 代表fixture、検索ゼロ、包括要件だけのcoverageがある | source coverageを評価する | atomic source span、digest、抽出時点が無いcovered判定を拒否する | `HIL_SOURCE_COMPLETENESS_UNPROVEN` | design-defined | not-implemented |
| HST-A-041-F06 | HST-HIL-041 | HIL-NFR-22 | HIA-NFR-022 | negative | aggregate親とatomic childを含むsource集合がある | coverage分母を算出しsourceを変更する | childだけを分母にし変更後は全child receiptをstale化する | `HIL_ATOMIC_COVERAGE_DENOMINATOR_INVALID` | design-defined | not-implemented |
| HST-A-041-B01 | HST-HIL-041 | family | — | boundary | sealed current refs、CI/PLAN status、source snapshotsがある | boundary条件を適用する | sealed後ref driftで全採用receiptをstale化し再freezeする | `HIL_SOURCE_AUTHORITY_STALE` | design-defined | not-implemented |
| HST-A-060-N01 | HST-HIL-060 | HIL-FR-80 | HIA-FR-080 | normal | cleanかつpush済みのcommit、current checkpoint、全artifact digest、CI/review receiptがある | annotated savepoint tagを作成しremote照合後、隔離した新branchへrestoreしてprojectionを再構築する | commit/tag/checkpoint/digest/authority/CIと復元結果が同一SHA・同一digestへbindする | なし（正常系） | design-defined | not-implemented |
| HST-A-060-F01 | HST-HIL-060 | HIL-FR-80 | HIA-FR-080 | negative | dirty/unpushed commit、lightweight/local-only tag、digestまたはcheckpoint不一致のfixtureがある | Repository Savepoint作成を要求する | remote immutable receiptを発行せず各不整合を拒否する | `HIL_REPOSITORY_SAVEPOINT_INVALID` | design-defined | not-implemented |
| HST-A-060-B01 | HST-HIL-060 | HIL-FR-80 | HIA-FR-080 | boundary | 既存savepoint tag、release tag、同名tag移動・再利用・削除fixtureがある | namespaceとimmutability境界を検証する | release namespaceをsavepointへ数えず、既存tagを動かさず新versionだけを許可する | `HIL_REPOSITORY_SAVEPOINT_INVALID` | design-defined | not-implemented |
| HST-A-061-N01 | HST-HIL-061 | HIL-FR-81 | HIA-FR-081 | normal | L1–L12 layer/pair gate receipt、remote annotated tag chain、工程表snapshotがある | Layer Freeze Tag Gateとprogress projectionを再構築する | 最長連続current tag chainだけがfreeze済み進捗となり全tagがgate SHAと一致する | なし（正常系） | design-defined | not-implemented |
| HST-A-061-F01 | HST-HIL-061 | HIL-FR-81 | HIA-FR-081 | negative | layer skip、非祖先、V-pair片肺、旧design SHA、tag移動、Sprint/release混同fixtureがある | layer freezeを要求する | 不正tagを進捗へ数えず該当層以降をfail-closeする | `HIL_LAYER_FREEZE_TAG_INVALID` | design-defined | not-implemented |
| HST-A-061-B01 | HST-HIL-061 | HIL-FR-81 | HIA-FR-081 | boundary | current layer tagとredesignでstale化したaffected layer以降のtagがある | version supersessionとprogress再投影を行う | 旧tagを保持したままstale/superseded化し、新versionの祖先鎖が閉じるまで完了率を回復しない | `HIL_LAYER_FREEZE_TAG_INVALID` | design-defined | not-implemented |
| HST-A-060-C01 | HST-HIL-060 | HIL-FR-80 | HIA-FR-080 | negative | 不正namespace | create | write 0 | `HIL_SAVEPOINT_NAMESPACE_INVALID` | design-defined | not-implemented |
| HST-A-060-C02 | HST-HIL-060 | HIL-FR-80 | HIA-FR-080 | negative | lightweight tag | verify | receipt 0 | `HIL_SAVEPOINT_TAG_NOT_ANNOTATED` | design-defined | not-implemented | （日本語の機械契約記述）
| HST-A-060-C03 | HST-HIL-060 | HIL-FR-80 | HIA-FR-080 | negative | remote OID mismatch | observe | matched 0 | `HIL_SAVEPOINT_REMOTE_REF_MISMATCH` | design-defined | not-implemented | （日本語の機械契約記述）
| HST-A-060-C04 | HST-HIL-060 | HIL-FR-80 | HIA-FR-080 | negative | ruleset/visibility/bypass expiry欠落 | verify authority | remote_verified 0 | `HIL_SAVEPOINT_RULESET_AUTHORITY_MISSING` | design-defined | not-implemented |
| HST-A-060-C05 | HST-HIL-060 | HIL-FR-80 | HIA-FR-080 | negative | roadmap/HEAD/index/artifact digest mismatch | bind | receipt 0 | `HIL_SAVEPOINT_BINDING_DIGEST_MISMATCH` | design-defined | not-implemented | （日本語の機械契約記述）
| HST-A-060-C06 | HST-HIL-060 | HIL-FR-80 | HIA-FR-080 | boundary | 同operation異payload | retry | prior receipt不変 | `HIL_SAVEPOINT_IDEMPOTENCY_CONFLICT` | design-defined | not-implemented |
| HST-A-060-C07 | HST-HIL-060 | HIL-FR-80 | HIA-FR-080 | boundary | concurrent expected-absent create | race | force 0 | `HIL_REMOTE_TAG_CONCURRENT_REF_RACE` | design-defined | not-implemented | （日本語の機械契約記述）
| HST-A-060-C08 | HST-HIL-060 | HIL-FR-80 | HIA-FR-080 | boundary | remote成功後DB crash／隔離外restore変更 | reconcile/restore | exact adoptまたはquarantine | `HIL_SAVEPOINT_RESTORE_MISMATCH` | design-defined | not-implemented |
| HST-A-061-C01 | HST-HIL-061 | HIL-FR-81 | HIA-FR-081 | negative | layer namespace不正 | create | tag 0 | `HIL_LAYER_TAG_NAMESPACE_INVALID` | design-defined | not-implemented |
| HST-A-061-C02 | HST-HIL-061 | HIL-FR-81 | HIA-FR-081 | negative | predecessor非祖先 | freeze | current 0 | `HIL_LAYER_TAG_ANCESTRY_INVALID` | design-defined | not-implemented |
| HST-A-061-C03 | HST-HIL-061 | HIL-FR-81 | HIA-FR-081 | negative | layer skip | freeze | progress加算0 | `HIL_LAYER_TAG_SKIP` | design-defined | not-implemented |
| HST-A-061-C04 | HST-HIL-061 | HIL-FR-81 | HIA-FR-081 | boundary | left pending_pair、right欠落/stale | pair close | pending維持 | `HIL_LAYER_TAG_VPAIR_ONE_SIDED` | design-defined | not-implemented |
| HST-A-061-C05 | HST-HIL-061 | HIL-FR-81 | HIA-FR-081 | negative | gate/roadmap denominator SHA mismatch | close | current 0 | `HIL_LAYER_TAG_GATE_SHA_MISMATCH` | design-defined | not-implemented | （日本語の機械契約記述）
| HST-A-061-C06 | HST-HIL-061 | HIL-FR-81 | HIA-FR-081 | boundary | refreeze旧version再利用 | supersede | tag移動0 | `HIL_LAYER_TAG_SUPERSESSION_INVALID` | design-defined | not-implemented |
| HST-A-061-C07 | HST-HIL-061 | HIL-FR-81 | HIA-FR-081 | boundary | live/in_progress/last_frozen/stale_from混同 | project | freeze加算0 | `HIL_LAYER_PROGRESS_PROJECTION_INVALID` | design-defined | not-implemented |
| HST-A-061-C08 | HST-HIL-061 | HIL-FR-81 | HIA-FR-081 | boundary | 同operation異payload pair close | retry | prior binding不変 | `HIL_LAYER_TAG_IDEMPOTENCY_CONFLICT` | design-defined | not-implemented |

## §2 Denominator

| HST | normal | requirement-negative | boundary | total | （日本語の機械契約記述）
|---|---:|---:|---:|---:|
| HST-HIL-034 | 1 | 7 | 1 | 9 |
| HST-HIL-035 | 1 | 9 | 1 | 11 |
| HST-HIL-036 | 1 | 5 | 1 | 7 |
| HST-HIL-037 | 1 | 4 | 1 | 6 |
| HST-HIL-038 | 1 | 5 | 1 | 7 |
| HST-HIL-039 | 1 | 5 | 1 | 7 |
| HST-HIL-040 | 1 | 9 | 1 | 11 |
| HST-HIL-041 | 1 | 6 | 1 | 8 |
| HST-HIL-060 | 1 | 1 | 1 | 3 |
| HST-HIL-061 | 1 | 1 | 1 | 3 |
| **total** | **10** | **52** | **10** | **72** |

設計分母は72/72だが実行分母は0/72である。fixture、command、exit code、output digest、DB query/artifact、
worker/verifier separationが揃うまでL10 passへ昇格しない。

## §3 PO7 atomic assertion（supporting、既存72分母へ非加算）

`HST-A-PO7`は`UniversalOptionReceiptV1` 6件、per-question answer receipt 22件、
`VModelAuthorityActivationEventV1`、disposition/queue projection、terminal receiptを一つのtransactionへ固定する。

| case | mutation/fault | expected | （日本語の機械契約記述）
|---|---|---|
| HST-A-PO7-C01 | group内0/2/unknown option | `HIL_PO7_MUTUAL_EXCLUSION_INVALID`、write 0 |
| HST-A-PO7-C02 | packet/source/actor authority/chat answer digest swap | `HIL_PO7_CUSTODY_INVALID`、write 0 | （日本語の機械契約記述）
| HST-A-PO7-C03 | B/C co-authority missing/scope/expiry invalid | `HIL_PO7_CO_AUTHORITY_INVALID`、write 0 | （日本語の機械契約記述）
| HST-A-PO7-C04 | 6→22展開の各append直後fault | rollback後6/22/event/projection/terminal増分0 |
| HST-A-PO7-C05 | same idempotency key＋same bytes / different bytes | same receipt / `HIL_PO7_IDEMPOTENCY_CONFLICT` | （日本語の機械契約記述）
| HST-A-PO7-C06 | expected activation epoch/event head CAS race | exactly one winner、loser増分0 |
| HST-A-PO7-C07 | active後packet/source/chat/authority drift | stale event＋freeze blocker reopenを同transaction commit |
| HST-A-PO7-C08 | revoke、新revision activation | append-only revoked/superseded、旧authority再利用0 |

本assertionはPO回答値を持たず、既存72 system assertion denominator、runtime実行、coverageへ算入しない。
