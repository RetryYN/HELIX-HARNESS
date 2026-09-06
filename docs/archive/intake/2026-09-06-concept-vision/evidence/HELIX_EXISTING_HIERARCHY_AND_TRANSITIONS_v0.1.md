# HELIX — 現存する階層・状態機械・受渡し境界の再構成 v0.1

調査日：2026-09-06  
固定source：`RetryYN/HELIX-HARNESS@84fe826449c1415bd60b42c81c2c0820bc79411b`  
種類：**現物読取りによるAS-IS調査。新しいアーキテクチャ仕様ではない。**

## 0. 結論

前の回答で示した `System → Lifecycle → Phase → Stage → Capability → Contract` と「7〜9層」は、HELIXから抽出した既存階層ではなかった。その案を本調査の分類軸には採用しない。

現存資料を掘ると、浅い一覧の下には既に、**要求の精緻化、設計Sliceの内部責務、独立したdomain object、各objectの状態機械、受渡しreceipt、APIの入出力型、原子assertion、遷移拒否条件**がある。ただし、それらは同じ種類の親子関係ではない。1本の巨大な包含木に変換すると、違うものをまた同階級へ置いてしまう。[S03][S04][S05][S08][S11][S12]

したがって今回は、実在名を保ったまま**15の局所構造を読取索引として整理**した。H01〜H15は本書の索引であって、HELIXの新しい15機能、新しいruntime enum、新しい工程ではない。

特に、前の説明を次のように修正する。

- `Release`の内部にはRLS-R-09で**R0〜R11のpromotion protocol**が既に定義されている。1個の「Release Gate」では浅すぎた。[S22]
- `Scrum Reverse`の内部にはSR0〜SR4だけでなく、**FeatureSlice／ReverseDerivation／ProvisionalVProjection／CanonicalVPublicationの別々の状態**がある。[S05]
- 「writer終了→独立検査→受入」という一列では、**独立review後にしか封印できないworker lifecycle terminal receipt**を表現できない。作業の終了と最終receiptの成立は別である。[S16][S17]
- `HDS-HIL-18`は、原子case、API、型、receipt、CAS条件まで深い。一方、本文は**runtime実装済みの主張を行わない**と明記している。深い設計があることと、動く統制があることは別である。[S11][S12]

## 1. 読み方と証拠の強さ

| 表記 | 読み取ったもの | ここからは断定しない |
|---|---|---|
| 要求 | main上の要件本文・registry・manifest | 全実装、全入口への強制、運用完了 |
| 設計・confirmed | confirmedと記された設計契約 | 予定symbolの実装、consumer接続 |
| 設計・draft | draft設計、宣言API、test設計 | 発効済みauthority、実行されたtest |
| code | 関数本体・型・実際の呼出し | 全caller、全環境、E2E、実測合格 |
| DTO／表示 | 実装された表示用型・projector | 表示された操作が実際に許可・実行されたこと |
| Issue要求 | Issueに記述された責務・契約 | main正本化、承認、runtime完成 |
| 過去観測 | この会話で先に取得した可変Issue/PR | 本監査時点の最新open/merge状態 |

`status: confirmed`や`authority: canonical`はsourceの宣言として記録する。全承認履歴・全digestを独立再計算して再認定したわけではない。今回HELIX本体のtest・CLI・provider実行は行っていない。

### 分けて復元した関係

| 関係 | 例 | 避ける誤解 |
|---|---|---|
| 包含 | interface → member → nested member | 型の深さを製品組織の深さにしない |
| 要求の細分化 | OPS-FR-001 → OPS-R-02 | 要件番号を実装componentと同一視しない |
| 導出・trace | requirement → capability → service → domain object | 全てが単純な所有親子とは限らない |
| 対向・検証 | L3 ↔ L10、API ↔ U/IT oracle | testは設計の「次に所属する子工程」ではない |
| 状態遷移 | observed → accepted | 前段完了と後段認可を同じflagにしない |
| 受渡し・呼出し | isolation run → output admission | compositionの存在を全入口強制としない |
| 所有・構成 | Moduleがpathを所有、BundleがModuleを選択 | Releaseを機能分類の木へ固定しない |

本文の樹形図は各source内部の構造を示す。矢印には導出、受渡し、状態遷移があるため、その種類を見出しで明示する。**導出線を辿った長さを「HELIXは何階層ある」という数字へ換算しない。**

---

## H01. Requirement IR：baselineとrefinementの内側

**実在する起点：** `requirements-ir/manifest.json`。baselineの4 shardとrefinement shardを扱う。宣言数はrequirements 153、system contracts 24、acceptance cases 72、system tests 24、refinements 6。これはmanifestの宣言であり、完成機能数ではない。[S03]

```text
requirements-ir/manifest.json
├─ baseline partitions
│  ├─ requirements
│  ├─ system_contracts
│  ├─ acceptance_cases
│  └─ system_tests
└─ refinement_contracts
   └─ 各refinement contract
      ├─ primary_system_contract_id
      ├─ related_system_contract_ids
      ├─ supporting clauses
      │  └─ clause → acceptance case の対応
      ├─ source L3 / L10 と各digest
      ├─ PLAN / downstream責務
      └─ PO delta receipt / material HEAD
```

上の後半はrefinement authority設計の契約である。`primary owner`と`related owner`、baselineとdelta、clauseとACを別々に保持する。単なる「要件一覧」より下に、**意味変更の単位と検証の単位、承認対象を一致させる構造**がある。[S04]

状態は設計上 `draft → specified → approved → frozen`。承認を埋め込む前のmaterial HEADと意味fieldのsubject digestにapprovalを束縛する。途中失敗ではrootを更新せず、既存baselineを維持する。source／owner／ACの変更はrevision増加と下流失効を伴う。[S04]

**実装との境界：** この設計はdraftで、末尾は`validateRequirementRefinement`という既存pure validatorの実在のみを記録する。manifest／view／DB全統合完了は主張していない。本調査でもその全経路を再認定しない。[S04]

## H02. Workflow分類：実在するparentと独立軸

registryは次を別軸として持つ。[S02]

```text
workflow-classification-registry.v1.json
├─ development_style
│  ├─ FULL_L1_L12_V
│  ├─ PRODUCTION_SCRUM
│  └─ V_DESIGN_SCRUM_IMPLEMENTATION
├─ case_driven_model
│  └─ DISCOVERY_POC
├─ workflow_model
│  └─ REVERSE / RECOVERY / INCIDENT / REFACTOR / RETROFIT 等
├─ subroute
├─ state_machine
├─ specialist_drive
├─ specialist_workflow
├─ specialist_capability
└─ execution_mode
```

実際の`parent_ids`を逆引きすると、次の関係がある。これは任意の再分類ではない。[S02]

```text
PRODUCTION_SCRUM または V_DESIGN_SCRUM_IMPLEMENTATION
   └─ 対応するsubroute：SCRUM_REVERSE
       └─ 対応するstate_machine：SCRUM_REVERSE_SR0_SR4

DISCOVERY_POC
   └─ 対応するstate_machine：DISCOVERY_POC_S0_S4
```

`action_stages`の`classify / plan / execute / verify / approve`や`execution_form`も定義されているが、これを製品ライフサイクル全体の5工程へ読み替えない。**分類軸、内部状態機械、操作の許可段階を区別する。**[S02]

### Scrum Reverseの中では4つの時計が動く

`SR0〜SR4`だけを並べると、まだ粗い。entity modelには次の独立状態がある。[S05]

```text
FeatureSlice
  draft → in_progress → review_pending → release_ready → released

ReverseDerivation
  pending → evidence_captured → contract_observed
          → v_layer_mapped → proposal_routed → pair_frozen → closed
              SR0               …                   SR4

ProvisionalVProjection
  draft → staged → superseded または discarded
  ※ publishedという状態を持たない

CanonicalVPublication
  none → published → stale → republished → stale …
```

FeatureSliceの`release_ready`は、ReverseDerivationの`pair_frozen`とCanonicalVPublicationのpublicationを参照して成立する。仮投影をcanonical publicationに昇格したことにしない。publicationがstaleならsliceも再検収が必要になる。[S05]

**source上の留保：** このentity文書自身のfrontmatterはdraftである。上位要件から参照されることと、詳細契約の承認・runtime移行が全て完了したことを同一視しない。

## H03. Vモデルの層と、層内部の義務・進捗

current要件が定義するpairは次である。これは文書カテゴリーの深さではなく、設計・検証の対応である。[S01]

| 設計側 | 対向する検証側 |
|---|---|
| L1 企画 | L12 運用テスト |
| L2 要求・画面プロト | L11 受入テスト |
| L3 要件定義 | L10 総合テスト |
| L4 基本設計 | L9 結合テスト |
| L5 詳細設計・先行テスト設計 | L8 単体テスト |
| L6 実装 | L7 テスト実装・TDD closure |

L0は層外のauthority anchor。本番releaseはL11とL12の間のmilestoneとして扱われる。以前の分類案の深さをL0／L1／L2と呼んだことは撤回する。既存工程番号と衝突するためである。[S01]

層内には、ledgerの義務row、上下隣接pair、左右V-pair、receiptという別の構造が設計されている。[S11][S12]

```text
LayerLedgerRegistry
└─ layer / version / template / entry-exit contract
   └─ obligation rows
      ├─ source span / authority / revision / semantic digest
      ├─ vertical pair edges：隣接層のderived-from / backprop
      └─ horizontal V-pair edges：設計 / oracle / snapshot / execution
```

さらに同じ設計Sliceの進捗にも5段の証拠がある。

```text
artifact_created
  → semantic_closed
    → independent_audited
      → pair_frozen
        → implementation_verified
```

ここは単なる5値statusではない。同じ固定分母を共有する**別receipt・別分子集合**であり、後段集合は前段集合の部分集合でなければならない。設計が存在する、意味が閉じる、監査済み、pair確定、実装検証済みを平均して100%にしない。[S11][S12]

## H04. 要求探索：candidate、event、prototype、compileは別物

`src/requirements/requirement-discovery.ts`には、実際のschemaとprojection reducerが存在する。[S06]

```text
RequirementDiscoveryProjection
├─ initiative_id / event_head
├─ candidates
│  └─ candidate_id / revision / statement / priority / state
│     actor_ids / task_ids / surface_ids / source_event_ids
├─ questions / answers
├─ prototype revisions / reactions
├─ unresolved
│  └─ kind / candidate_ids / owner / reentry_condition / blocking
├─ agreement
├─ compile_status
├─ coverage
└─ convergence
   ├─ checks
   └─ blocking_reasons
```

candidateの通常許可遷移は、`hypothesis → elicited → prototyped → observed → accepted → specified → frozen`。その他にrejected、deferred、challenged、superseded、staleがあり、許可遷移表はそれぞれ異なる。L2の新規candidate作成でfrozenを生成することは拒否する。[S06]

原文eventの連続sequence、previous digest、payload digest、event ID重複、initiative混在をreducerで検査する。split／mergeは元candidateをsupersededにし、別candidateを作る。**要求の木は単なる文章の章立てではなく、履歴と後継関係を持つ。**[S06]

### 実際に止まる場所

`candidate_accepted`と`candidate_rejected`はhuman actorを要求する。`l3_compile_requested`は現在agreementとの一致を要求し、`l3_compile_completed`はcompileがrequestedであることを要求する。[S06]

一方、`convergence.ready`はactor/task、正常・取消・失敗・timeout flow、priority候補のsurfaceまたはN/A、未解決のowner、implicit matrix、priority安定、人間合意などから別に計算される。[S06]

**重要：** 読んだreducerでは、`compile_status`更新と`convergence`算出は別処理である。convergenceの全チェックが、そのままcompileイベント受理を一元的に拒否することまでは、このファイルから断定できない。外側のadmission／callerを未確認のまま「要求Freeze Gate完成」としない。

## H05. 画面・Prototype：1個の合意Gateではない

Screen Applicabilityのpure evaluatorには、以下の型付き受渡しがある。各関数が実際の画面を生成するわけではなく、入力artifact・証跡・人間判断を検査して次のreceiptを返す。[S07]

```text
ScreenScopeSnapshotV1
  → evaluateScreenApplicability
    → ScreenDecisionV1
       ├─ not_applicable：NoUiReceiptV1を扱う別分岐
       └─ prototype_required
          → PrototypeTaskV1
            → validatePrototypeArtifact
              → PrototypeReadyReceiptV1
                → recordWalkthroughIteration
                  → WalkthroughReceiptV1[]
                    → evaluatePrototypeAgreement
                      → PrototypeAgreementV1
                        → validateRequirementsBackprop
                          → BackpropReceiptV1
```

| 内部境界 | 次へ渡すための条件 |
|---|---|
| scope判定 | L2、既知capability、分類・rule digest一致。混在scopeを一律UI扱いしない |
| prototype ready | executable/startup証跡、screen/interaction/state/data trace、必須state集合、manifest digest |
| walkthrough追加 | 同artifact revision、連続iteration、人間反応、delta/no_deltaとtargetの整合 |
| agreement | 最終iterationがno_delta、approvedな人間review、同artifact revision |
| backprop | delta有無に応じた要求revisionの連続性、agreementとのdigest束縛 |

本読取実装ではiteration上限は16。backpropのdelta有無はartifact revisionが1より大きいかで判定している。これらを抽象的な「人間反応の意味を全件理解するエンジン」と表現しない。[S07]

**分類上の位置：** 要求形成と設計の両方から利用されるが、別々のPrototypeエンジンを作る根拠にはしない。Human Convergence強化候補の要求と、既存pure evaluatorが証明する内容を分ける。

## H06. 要求翻訳から設計義務へ：既にもっと深い導出線がある

`HDS-HIL-17`のL5詳細設計は、次を明示している。[S08]

```text
custody済み原文
  → source atom：1 acceptance outcome または1 constraint
    → Requirement Translator
      ├─ 曖昧・矛盾・根拠不足 → challenge
      └─ 要求・設計候補
         → requirement
           → capability
             → service
               → domain object
                 → 各facetのdesign obligation
                    data / state / failure / security /
                    observability / lifecycle
                   → 適用template / section / instance
                     → test oracle / gate binding
                       → obligation discharge / pair-freeze候補
```

これは**導出graph**であって、serviceが常にcapabilityの所有子になるという一般的なDDD分類ではない。sourceは各要素の接続・逆方向trace・欠落検出を要求している。[S08]

例えば`HST-CASE-027-05`はdomain object接続不足、`027-26`はtest oracle不足、`027-27`はgate binding不足、`027-28`はaggregate-onlyを個別に拒否する。上位1件を「対応済み」にして末端義務を消し込むことを許さない。[S08]

templateの方にも、gap検出→Issue／Reverse、candidate→shadow→独立audit→promotionという別の改版経路がある。要求を作る仕事と、要求を表すtemplate自体を改善する仕事が、**同じ設計の中で別object・別write authority**として分かれている。[S08]

**状態：draft設計。** translator、ledger、promotion、CAS portの全runtime完成は本資料から主張しない。

## H07. Forward Infinity：主spineの内側に専門Sliceと再開機構がある

L4設計の主経路は以下である。redesign等の分岐と再入を持ち、単なる11工程ではない。[S09]

```text
intake → directive_captured → admitted
 → reverse_r0 → reverse_r1 → reverse_r2 → reverse_r3 → reverse_r4
 → [redesign / design_refactorの条件付き分岐]
 → pair_freeze → implementation_preflight → implementation_claimed → implemented
 → local_prejoin_ci → forward_join → internal_postjoin_ci
 → pr_open_or_updated → github_external_ci → claude_audit
    ├─ finding_promoted → child_issue → intake
    └─ audit_pass → memory_compacted → closure_ready → merged_closed
```

そのorchestrationを所有するL5設計`HDS-HIL-02`は、処理本体を全て抱えない。intake、Reverse内容採点、三段CI、PR監査、finding昇格、memory本文生成を、それぞれのownerへ委譲し、**同じcausalityへreceiptをjoinする役割**を持つ。[S10]

```text
HDS-HIL-02 / Forward Infinity orchestration
├─ ForwardRunStarter
├─ ForwardTransitionPolicy
├─ CausalityClosureValidator
├─ LoopBudgetMeter
├─ ForwardCheckpointWriter
├─ ForwardResumeGate
├─ ForwardClosureGate
└─ InfinityRunCommitter
```

### 予算上限は「失敗して終了」だけではない

5予算軸はiteration、elapsed_ms、input_tokens、output_tokens、cost_micros。外部side effect前に次step予測を確認し、上限ならdispatchせず未完obligation・next transition・lease fence・evidence集合をcheckpoint化する。[S10]

```text
通常spineの現在地
  → checkpointed
    → [current HEAD/policy/scope/fence/nonce/予算を再検査]
      → resumed
        → 保存済みresume_target_state
```

checkpointedからspineへ直接戻らない。2辺を同transactionで反映し、二重resume、別target、片辺だけの公開を拒否する。これは再開の内部プロトコルであり、「実行準備」という1箱では表せない。[S10]

**状態：draft設計。** ここに記述した全state machineが現在のruntimeでend-to-end作動しているとは認定しない。

## H08. 最下部まで確認した例：Layer Ledger Pair Gate

ここが「2〜3段浅い」という指摘を具体的に確認できた箇所である。[S11][S12]

```text
HR-FR-HIL-18                           要求参照
  ← HDS-HIL-18                        要求を実現する設計Slice
     ├─ layer_ledger_registry         層・template・revision
     ├─ layer_obligation_rows         原子的義務
     ├─ vertical_pair_edges           上下隣接・derived/backprop
     ├─ horizontal_vpair_edges        左右V-pair・oracle・execution
     ├─ design_progress_denominators  固定分母
     └─ design_stage_receipts         5stageの個別証拠

HDS-HIL-18
  → evaluateHorizontalVPair           宣言API
     ├─ design: PairSideV1
     ├─ verification: PairSideV1
     ├─ execution: ExecutionReceiptV1
     │  ├─ execution_id
     │  ├─ oracle_digest
     │  ├─ exit_code
     │  ├─ output_digest
     │  ├─ source_snapshot_digest
     │  └─ receipt_digest
     └─ Result<HorizontalPairReceiptV1, LayerGateFailureV1[]>

HST-CASE-032-11                        個別の原子assertion
  pre_state:      paired
  expected_state: paired               execution不足なら進ませない
  failure:       HIL_LAYER_VPAIR_EXECUTION_MISSING
  unit oracle:   U-LLPG-035
  IT oracle:     IT-LLPG-035
```

このように「quality → test」という箱分けの下に、**どのobjectを、どの入力で、どのstateから進めようとし、何が欠けたらどこに残すか**が既にある。[S11][S12]

進捗commitも単なるDB updateではない。固定分母、artifact、semantic、audit、freeze、implementationの6 storeをtransaction内で再読し、revision／head vectorをwrite直前に再検査する。event、projection、terminal receiptを一括commitし、失敗時はauthoritative countを増やさない。[S11][S12]

**ここで完成を誤認してはいけない。** L5末尾は「authority設計とfixtureを収束し、runtime assetの実装済み主張を行わない」と明記し、design-reality-bindingのassetsは空である。L6の`declare function`、52 primary case、15 API、固定test分母は、**設計・oracle契約の深さ**であって今回実行したtest数ではない。[S11][S12]

## H09. Worker：作業終了、出力受理、独立review、最終receiptを分離

### 9.1 Worker Common Contract内の責務分担

confirmedなwrapper設計では、wrapper起動をWCC-FR-02に限定し、descriptorは01、隔離は03/04、output receiptは05/06、scoreは07/08、contextは09へ委譲する。wrapperに全部を入れない。[S13]

### 9.2 実コードで確認した隔離後の受渡し

```text
broker内部で封印されたWorkerIsolationLaunch
  → runWorkerIsolationLaunch
     ├─ launch / resources / policy / output binding / execution binding照合
     ├─ sandboxArguments → spawn
     ├─ auditWorkerIsolationScope
     │    不正変更 → failureを返す
     ├─ process status確認
     │    非0 → WORKER_OUTPUT_PROCESS_FAILED
     ├─ admitWorkerOutput
     │    不正output → failureを返す
     └─ validated output
          + execution observation
          + WorkerIsolationRunReceiptCapability
```

この順番はbroker関数本体に存在する。stdoutを返しただけでは後段へ渡らず、scope、process結果、typed outputの境界がある。receiptはadmission／sandbox／diff／egress／output／observationのdigestを束縛する。[S14]

ただしこの実装の`diff_digest`はchanged path一覧から作られる。差分内容全byteの証明へ読み替えない。`egress_digest`もネットワーク通信の全実測台帳という意味ではない。またtracked catalogのbackends／runtimesは空である。**この関数があることを、通常導入環境で全workerが隔離済みと解釈しない。**[S14][S15]

### 9.3 独立reviewはworker lifecycle terminalより先に必要

```text
validated output + isolation run receipt
                  + sealed independent review
                    ↓
            createWorkerLifecycleReceipt
                    ↓
      accepted / rejected / quarantined の最終receipt
```

`createWorkerLifecycleReceipt`はsealed reviewがなければ`WORKER_LIFECYCLE_REVIEW_UNSEALED`を返す。proposal digest不一致、verdictとterminal不整合も拒否する。[S16]

同関数がreceipt内部に構成するchainは次である。

```text
requested → admitted → sandboxed → running
 → proposal_received → revalidated → accepted / rejected / quarantined
```

**これはこの関数が検証後に組み立てるreceipt chainである。** これを、全stepの実行時にdurable保存されるlive scheduler state machineだと断定しない。[S16]

### 9.4 その外側の親受入は別の設計

work graph設計はさらに、`graph_confirmed → delegation_requested → review_sealed → worker_terminal_sealed → acceptance_sealed`を定義する。worker最終receiptと、親が成果を引き取るacceptanceを分離する。[S17]

末尾の実在性束縛は既存worker receipt／review／execution originを示す一方、**work graph validator、委譲receipt issuer、parent acceptance evaluatorは新規設計**と明記する。従ってこの外側まで実装済みと一括扱いしない。[S17]

## H10. 品質・CI：義務分類、配置DAG、CI段階、結果を区別

実装された`CiVerificationPlan`は次の構造を持つ。[S18]

```text
CiVerificationPlan
├─ work_authority / candidate_head / base_head
├─ local_obligations
├─ boundary_obligations
├─ global_invariants
├─ deferred_obligations[]
│  └─ capability_id / target / candidate_head / receipt_status / receipt_digest
├─ execution_dag[]
│  └─ capability_id / depends_on_capability_ids
├─ full_fallback_reasons
├─ registry_digest / plan_digest
└─ findings / ok
```

ここでlocal、boundary、global、release-onlyは義務の分類であり、実行DAGの順序とは別である。deferは成功や削除ではなく、実行先とreceiptを伴う別状態である。関数内にはdependency closureと分類処理がある。compose後半・全runner呼出しは今回未検証とする。[S18]

一方、Infinity設計の三段CIは`local_prejoin → internal_postjoin → github_external`で、各段に別receipt、predecessor、SHA/tree/lineageを要求する。[S09]

```text
ci_chains
└─ ci_stage_runs
   ├─ ci_check_runs
   └─ ci_stage_receipts

別契約：required check set / quarantine rule / quarantine application
```

`accepted_with_quarantine`は`passed`と同値ではない。exact既知failure、期限、修復Issue、代替minimum gateを条件に次へ進めても、green件数には加えない。これが、**検証義務を省略せず実行待ちを整理する内部境界**である。[S09]

品質の合否・検証義務と、H09の隔離・外部作用・権限による安全は、別の判定として保持する。安全な実行結果でも品質不合格はあり得るし、test greenが許可範囲外操作を正当化するわけではない。この分離は新しい二重test engineを設ける指示ではない。

## H11. 実在する表示階層：既にproject／harnessが分かれている

`VisualizationContract`は次の二つの表示rootを実際に持つ。[S19]

```text
VisualizationContract
├─ project
│  ├─ current_location
│  ├─ layer_progress
│  ├─ design_test_pair
│  ├─ relation_graph
│  └─ runtime_evidence
└─ harness
   ├─ harness_growth
   └─ skill_agent_telemetry
```

さらにcurrent_locationの内部は、単なる現在工程名ではない。[S20]

```text
ProjectCurrentLocationView
└─ recovery_exit
   ├─ handoff_gate
   │  ├─ approval_status / scope_status
   │  ├─ actual / expected approval scope digest
   │  ├─ materialize_status
   │  └─ valid_for_apply / required_action
   ├─ reentry_forecast
   │  └─ next_phase_action / next_phase_type / next_gate / recompute_commands
   └─ automation_runway
      └─ phases[]
         ├─ sequence / action / phase_type / selected / status
         ├─ human_required
         ├─ evidence_probe_command
         ├─ evidence_materialize_command
         ├─ evidence_approval_draft_command
         ├─ evidence_apply_dry_run_command
         ├─ evidence_apply_execute_command
         ├─ evidence_handoff_artifacts
         │  ├─ probe_record_path
         │  ├─ approval_draft_path
         │  └─ write_policy
         ├─ target_tables / postcheck_commands
         └─ remaining_after_phase / next_gate / expected_transition
```

ここは**実在する型の包含階層**であり、私がPhase名を挿入して深く見せたものではない。ただしDTOには操作のpointerや判定表示を持たせられるため、この型だけで全操作controllerや権限制御の接続完了を認定しない。projectorも表示機構として区別する。[S19][S20][S21]

「開発」と「HELIX成長」という見方の原型は既に表示契約にある。一方、会話で決めた`HELIX全体統制 → 開発統制／成長統制`が、そのまま現在のruntime所有階層になっているとする証拠にはならない。

## H12. リリース：Module／Bundleの構成と12段promotion

confirmed要件の包含・所有関係は、機能の木と別である。[S22]

```text
Release Module
├─ 独立SemVer / source SHA / authority digest
├─ public / internal surface
├─ primary所有するrelease path集合
├─ required / optional / conflict dependency
└─ acceptance / security / migration / rollback / replacement

Bundle
├─ 独立SemVer / source lock
├─ Module ID + version + digest のexact set
├─ excluded capability
└─ 利用目的 / install / acceptance / compatibility / rollback profile
```

Functional Release Sliceは、別の要求追加でModule所有とBundle構成の間に、独立検証・昇格・rollback可能な単位を導入しようとしている。現在のModule／Bundleと同一概念ではなく、全runtime接続の完成も本調査では認定しない。[S32]

### 「Release」の中で既に定義されている受渡し

RLS-R-09は次を要求する。[S22]

```text
R0  inventory
 → R1  ownership compile
 → R2  shadow package
 → R3  bundle composition
 → R4  packet seal
 → R5  DevOS候補PR
 → R6  static検証
 → R7  trusted consumer検証
 → R8  独立検証
 → R9  RC
 → R10 canary
 → R11 stable / rollback
```

ここでR0〜R11は**Release promotion内の識別子**であり、Reverse R0〜R4と同一namespaceではない。VモデルにR工程を12個追加する意味でもない。

R6では未信頼artifactを実行する前にmanifest、hash、schema、供給元、秘密情報、実行ファイル、permission、path traversal、symlink／junction、衝突、archive bomb等を検査する。R7は同じartifactでclean consumerのinstall／setup／status／DB／doctor／upgrade／rollbackを検証する。両段を合体しない。[S22]

### 固定個数を再導入しない

読んだL3本文には初期11 Module候補・8 Bundle候補があり、RLS-R-13はOPSの4 Module候補・1 Bundle候補を別途追加する。一方、Slice追加要求は旧個数・名前・所属を固定条件にしないと述べる。**どちらも公開済み製品数へ換算しない。** 読みやすさのために作った18提供群も、このnative Release体系の代替ではない。[S22][S32]

## H13. 配備・運用保守：FRの下にR、その下にcontractと状態がある

この領域にはconfirmed要件と、承認を記録するconfirmed PLANがある。PLANは`completion_claim_allowed:false`でruntime／adapter／production applyをchildへ分離する。[S23][S24]

```text
Product Lifecycle Operations
├─ OPS-FR-001 lifecycle contract
│  ├─ OPS-R-01 EnvironmentContract
│  ├─ OPS-R-02 Deployment
│  │  ├─ DeploymentManifest
│  │  │  artifact / config / environment / migration / health / compatibility
│  │  ├─ DeploymentPlan
│  │  │  preflight / staging / apply order / approval /
│  │  │  stop condition / rollback / observation window
│  │  └─ DeploymentReceipt
│  │     actor / assignment / before-after / target / evidence / provider receipt
│  └─ OPS-R-03 RollbackPlan / RollbackReceipt
├─ OPS-FR-002 配備計画・promotion
│  ├─ OPS-R-04 provider中立planner
│  └─ OPS-R-05 staging → canary → bounded exposure → production
├─ OPS-FR-003 運用・incident
│  ├─ OPS-R-06 OperationPolicy / OperationalObservation
│  └─ OPS-R-07 IncidentRecord
├─ OPS-FR-004 保守
│  ├─ OPS-R-08 MaintenanceObligation
│  └─ OPS-R-09 構造原因の上位昇格
├─ OPS-FR-005 診断・修正箇所特定
│  ├─ OPS-R-10 ChangeDiagnosis
│  ├─ OPS-R-11 終端証拠
│  └─ OPS-R-13 BackflowDecision
└─ OPS-FR-006 Release責務・自己適用
   └─ OPS-R-12 Module / Bundle統合
```

上の入れ子は実際の要件見出しと定義されたcontractによる。番号順に並べ直すとOPS-R-13の所属まで変えてしまうため、原文の所属を保持する。[S23]

正常系の状態：

```text
RELEASED → DEPLOYMENT_PLANNED → PREFLIGHT_PASSED
 → STAGED → DEPLOYED → OBSERVING → HEALTHY
```

障害後は別の経路を取る。

```text
OBSERVING / HEALTHY
 → INCIDENT_OPEN → DIAGNOSING → CONTAINED / ROLLED_BACK
 → FIX_PLANNED → RE-RELEASED → REDEPLOYED
 → OBSERVING → INCIDENT_CLOSED
```

各遷移はactor、artifact、environment、approval、evidence、time、correlationへ束縛される。rollback成功はincident closeでも、恒久修正完了でもない。[S23]

診断後にも`system_change_class`、`capability_expansion_kind`、`workflow_route`、affected／return layerは別軸である。原因と証拠から最小の連続layer集合へ戻すので、「障害なら実装へ戻す」と固定しない。[S23]

**実装境界：** Issue #1161はschema／state machineのchild taskとして残されている。Issueがopenだからコードが皆無とは判定しないが、本調査ではこのOPS全体の実environment E2Eを確認していない。[S31]

## H14. 成長：UIL・Synthesis・Learningを同じ機構へ畳まない

### 14.1 Universal Improvement Loop内部

UILのconfirmed要件は、責務Sliceと状態機械を別々に定義する。[S25]

```text
UIL capability
├─ UIL-01 authority / source registry
├─ UIL-02 観測正規化 / baseline比較
├─ UIL-03 finding適格化 / dedupe / expiry
├─ UIL-04 意味影響 / candidate合成
├─ UIL-05 反実仮想 / 全体最適evaluator
├─ UIL-06 既存routeへのbackflow
├─ UIL-07 before-after / recipe / recurrence projection
└─ UIL-08 HELIX E2E dogfood
```

state machine：

```text
OBSERVED → NORMALIZED → BASELINE_COMPARED → FINDING_QUALIFIED
 → ROOT_AND_IMPACT_CLASSIFIED → IMPROVEMENT_CANDIDATE_PROPOSED
 → COUNTERFACTUAL_EVALUATED → ROUTED → CHANGE_VERIFIED
 → OUTCOME_MEASURED → RECIPE_CANDIDATE → RECURRENCE_MONITORED → TERMINAL
```

同じUILの観測baselineにも、さらに別lifecycleがある。

```text
current baseline → candidate observation → comparison / migration decision
 → canonical merge → post-main observation → new baseline promotion
```

`baseline / candidate / post_main`のgenerationは、HELIX全体のG1〜G5世代とは別である。detector／environment／物理bindingの比較条件が合わなければ、reobservationやbaseline_incomparableへ送る。候補がmergeされたことだけでは次baselineにならない。[S25]

また`candidate_scope_class`はlocal_issue／system_synthesis／requirement_portfolio_resynthesis、`system_change_class`と`capability_expansion_kind`と`workflow_route`から独立する。**局所改善をどの範囲の再編へ上げるかも、既に型付きの別判断である。**[S25]

runtime側には`UniversalImprovementNormalizedEventV1`があり、baseline、observed、predicted、confidence、counterevidenceを別fieldにする。しかし、読んだnormalizer型はUIL全体の13状態やbaseline generation全運転の証明ではない。[S26]

### 14.2 System Synthesisは独立したcapability family

```text
System Synthesis
├─ SYN-FR-001
│  ├─ stable semantic graph
│  ├─ deterministic partial synthesis
│  └─ project observation / rule promotion
├─ SYN-FR-002
│  ├─ REFACTORING workflow
│  ├─ replacement lifecycle
│  └─ V-pair / Scrum binding
├─ SYN-FR-003
│  └─ Impact CI composition / measurement
└─ SYN-FR-004
   └─ FUTURE：shadow whole-system planner / Development Model条件
```

内部の専門workflowは`RF0 inventory → RF1 eligibility → RF2 replacement design → RF3 atomic execution → RF4 parity/no-degradation → RF5 migration/retirement → RF6 read-after`。置換対象にはretain／coexist／superseding／deprecated／retiredという別の選択がある。[S27]

したがって、Synthesisを丸ごと成長の「改善」箱へ移動するのは粗い。設計、検証構成、通常製品のrefactor、経験の昇格にも使う。source上のfamilyと、用途別の閲覧分類を別にする。

### 14.3 Responsibility-centric Learning

この部分で直接読んだ根拠はIssue #1384の要求であり、全runtimeを確認した報告ではない。[S28]

```text
stable responsibility_id
├─ ResponsibilityLearningProfileV1
├─ CASE：CaseKnowledgeV1
├─ SCENE：SceneKnowledgeV1
├─ PATTERN：PatternKnowledgeV1
├─ LOG：OperationalExperienceV1
├─ VERIFY：VerificationAssessmentV1
├─ LearningRetrievalPacketV1
├─ KnowledgePromotionDecisionV1
├─ MechanizationCandidateV1
└─ ResponsibilityKnowledgeTransferProposalV1
```

入力種別、横断検証、検索packet、昇格判断、機械化候補、所有移管を同格の「記憶箱」にしない。要求上の昇格はproject-local knowledge → supported/verified → cross-project candidate → mechanization candidate → shadow → activeである。[S28]

`Gene`は今回の会話で検討した継承の比喩であり、上記の実在contract名をGeneへ勝手に置換しない。観測generation、知識version、Capability lifecycle、製品Release version、HELIX成長世代も別軸のまま保持する。

## H15. 退役の実装例：全体ライフサイクルではなく限定inventory

`src/design/requirement-intake-lifecycle.ts`は、既存adapterの扱いを次の3区分に分けて機械検査する。[S29]

```text
REQUIREMENT_INTAKE_LIFECYCLE
├─ permanent
│  ├─ L1_REQUIREMENT_ID_PATTERNS
│  └─ isRegistryNativeRequirementId
├─ replaceable
│  └─ loadRequirementCatalogSources
└─ retire
   ├─ loadScreenIntakeInputs
   ├─ ScreenLedgerRowV1
   ├─ canonicalizeScreenEntityId
   └─ ScreenTraceRowV1
```

判定は「消し忘れ」だけではない。permanent欠落、後継activation前のretire対象消失、activation後のretire対象残存を別々に扱う。replaceableは存否を強制しない。[S29]

ここでactivation probeは`src/design/canonical-design-ir-intake.ts`のfile存在確認である。そのため、この判定の成功だけを後継機構のconsumer E2Eやno-degradation成立に読み替えない。**実在する局所退役機構と、将来の全Capabilityを統治するLifecycle機構を分ける。**

---

## 2. 前の構想資料に対する訂正・未解決台帳

| ID | 確認結果 | 文書上の扱い |
|---|---|---|
| C01 | 任意のSystem/Lifecycle/Phase/Stageを積んだ7〜9層は現物抽出ではない | 既存階層の説明から撤回。新設構想としても本調査では採用しない |
| C02 | docs/design/helixには旧L6-function-designやL13/L14等のpathが残る | physical pathをcurrent L1–L12に直結させない。自動renameはしない [S01][S30] |
| C03 | HDSのdraft設計はcase/API/型まで深いがruntime未主張 | 深さと実装成熟度を別列にする [S11][S12] |
| C04 | layer ledger周辺には旧工程役割名（l8_integration_test_design、l6_function_design等）が残る一方、§0はcurrent 6pairを宣言 | 不整合の可能性を記録。新しいcanonical pairを勝手に発明して埋めない [S11][S12] |
| C05 | worker lifecycle terminal receiptにはsealed reviewが先に必要 | process完了、成果候補、review、最終receipt、親受入を分ける [S16][S17] |
| C06 | work graphの外側受入は設計と既存部品が混在 | 既存receiptを根拠に親acceptance全実装としない [S17] |
| C07 | Release内部のR0〜R11とReverse R0〜R4は別namespace | prefixだけを使った混合順序を作らない [S09][S22] |
| C08 | OPS-R-13はOPS-FR-005、OPS-R-12は006に所属 | 数値順sortで意味所属を変えない [S23] |
| C09 | Requirement Discoveryのconvergenceとcompile_statusは別処理 | 外側のcompile admission結線が未検証と明記する [S06] |
| C10 | DTOに次phase/gate/操作pointerがある | 表示階層の存在と実行可能性を分ける [S19][S20] |
| C11 | Sandbox codeは存在するがcatalogは空、通常全入口未確認 | 「全実行が標準隔離された」としない [S14][S15] |
| C12 | UIL観測generationとHELIX成長世代は別 | baseline/candidate/post_mainをG1〜G5へ混ぜない [S25] |
| C13 | 全体統制の会話構想と、HWGのportfolio要求は同じ範囲ではない | HWGが既存authorityを全吸収する実装として描かない [S33][S34] |
| C14 | 18群/46 Slice/10共通責務は過去の提供構想ID | 本調査の15索引、325参照node、native RLS/UIL/HDS等の件数と混算しない |

C04、C09等は確認したsource間・責務間の差分であり、再現testまで済ませた不具合認定ではない。意味正本との照合とcaller・migration経路の確認が残る。

## 3. 次の分類に使えるもの／まだ使えないもの

**使えるもの：** 本文の実在するfamily、contract、record、API、field、局所state、gate条件、前後のreceipt。これを、開発／成長／共通という閲覧目的へ索引付けすることはできる。ただし索引付けはowner移管ではない。

**まだ使えないもの：** 全機能が一意に属する完成版の巨大包含木、全入口強制済みという断定、全要求の完成率、全体世代の再認定。本調査の範囲ではそこまで証明していない。

既存構造を整理する際は、同じ単位ごとに次を持たせる。

```text
実在objectまたは責務名
  source / revision / owner
  内包するもの（fields、clauses、components等）
  参照・利用するもの（別ownerを含む）
  そのobject自身のstate machine
  入力の受渡し条件
  次へ出すreceiptとそのconsumer
  拒否・保留・stale・中断・再開条件
  実装読取範囲 / 未確認caller / 運用証明の有無
```

これは新しい一律runtime schemaではなく、**既存sourceを読むための監査記録形式**である。今後の正式な分類は、この実体を消さずに上位索引を作る。深く見せるためだけの中間カテゴリーを増やさない。

## 4. 調査範囲と限界

本版は、固定mainの主要正本・registry・設計・代表runtime・表示契約と、明示したIssueを読んで局所構造を再構成した。Git treeでディレクトリを辿ったが、repo全fileの全文読取、全Requirement IDから全実装・test・consumerへのexact join、全呼出しgraph、全Issueのnative親子関係の再取得は行っていない。

コード検索は空集合または不完全結果となったため、**検索に出ないことを未実装の根拠にはしていない。** 大きなtree／本文応答の切れた部分も、取得成功だけで既読に数えない。直接pathを指定して読んだ範囲をSOURCE_INDEX.jsonへ記録した。

未確認は、全callerからの到達、実backend・環境別E2E、replayの実行結果、独立consumer、source同士の全authority/digest整合などである。schema上の状態・sourceのtest ID・設計宣言を、実際に通ったtestや本番証拠へ変換しない。

GitHubのIssue・branch・code・label・承認は変更していない。旧v0.4資料は上書きせず、**構想と実態の別紙**としてこの監査を添える。

## 5. 同梱物

- 本書：native構造15索引と、各内部の遷移・受渡し境界。
- `EXISTING_STRUCTURES.json`：主要な参照node、関係種別、source、gateを保持する手動監査結果。本文全語・全呼出しの網羅ではなく、自動全repo抽出物でもない。
- `GATE_CATALOG.md`：35の停止・前進条件。実装／設計／DTOを分離。
- `SOURCE_INDEX.json`：固定source、読取範囲、可変Issueの留保。
- `validate.py`と`VALIDATION_REPORT.json`：納品物の参照・ID・リンク・JSON・hash整合の検査。HELIX本体testではない。

## 出典

以下のsourceリンクは上記固定SHAを基本とする。Issue／PRは可変であり、読取時点と再取得の有無をSOURCE_INDEX.jsonに記録した。

[S01]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/docs/governance/helix-harness-requirements_v1.3.md

[S02]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/docs/design/helix/L3-requirements/workflow-classification-registry.v1.json

[S03]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/requirements-ir/manifest.json

[S04]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/docs/design/helix/L4-basic-design/requirement-refinement-authority.md

[S05]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/docs/design/helix/L3-requirements/scrum-reverse-entity-model.md

[S06]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/src/requirements/requirement-discovery.ts

[S07]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/src/design/screen-applicability.ts

[S08]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/docs/design/helix/L5-detail/requirement-translation-obligation.md

[S09]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md

[S10]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/docs/design/helix/L5-detail/forward-infinity-orchestration.md

[S11]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/docs/design/helix/L5-detail/layer-ledger-pair-gate.md

[S12]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/docs/design/helix/L6-function-design/layer-ledger-pair-gate.md

[S13]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/docs/design/helix/L4-basic-design/worker-wrapper-admission.md

[S14]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/src/runtime/worker-isolation-broker.ts

[S15]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/config/worker-isolation-runtime-catalog.json

[S16]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/src/runtime/worker-lifecycle-receipt.ts

[S17]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/docs/design/helix/L4-basic-design/work-graph-receipt-acceptance.md

[S18]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/src/runtime/ci-verification-plan.ts

[S19]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/src/schema/visualization-view-contract.ts

[S20]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/src/schema/visualization-current-location-contract.ts

[S21]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/src/vmodel/visualization-tree-projector.ts

[S22]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/docs/design/helix/L3-requirements/release-module-bundle-composition-requirements.md

[S23]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/docs/design/helix/L3-requirements/product-lifecycle-operations-requirements.md

[S24]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/docs/plans/PLAN-L3-71-product-lifecycle-operations.md

[S25]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md

[S26]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/src/runtime/universal-improvement-observation-normalizer.ts

[S27]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/docs/design/helix/L3-requirements/system-synthesis-requirements.md

[S28]: https://github.com/RetryYN/HELIX-HARNESS/issues/1384

[S29]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/src/design/requirement-intake-lifecycle.ts

[S30]: https://api.github.com/repos/RetryYN/HELIX-HARNESS/git/trees/7537460c952f68a72bbfa82a553a12bbb2ed3fda

[S31]: https://github.com/RetryYN/HELIX-HARNESS/issues/1161

[S32]: https://github.com/RetryYN/HELIX-HARNESS/issues/1494

[S33]: https://github.com/RetryYN/HELIX-HARNESS/issues/1500

[S34]: https://github.com/RetryYN/HELIX-HARNESS/pull/1561

[S35]: https://api.github.com/repos/RetryYN/HELIX-HARNESS/branches/main
