# confirmed175 優先11〜20番の固定F6条件照合監査（2026-10-01）

- 基準revision: `50686b6762788574cb471967e8c24846d3dd56ae`。
- 選択根拠: live recount `08156a3b71ad97065cef34357dc37f6953b9a7f8`（本文SHA-256: `f406d89f20c5f78a4984097b03735cd6737569a4e49688e2534d58d2971b8adb`）の`unconfirmed_identity_condition_comparison`先頭63件中、11〜20番。先行監査 `88151cb25e384ada459941fd510d0a2c760ba358` の1〜10番は除外した。
- 比較先: 固定採択済みHELIX-HARNESS L2/L11 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2 SHA-256 `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a`、L11 SHA-256 `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4`。
- authority effectは`none`。全10件を`preserved_pending_rehome`とし、successor 0件、source atom closure 0件。採択・retire・意味変更・実装・受入・Step 5完了を主張しない。

## 範囲と限界

比較先はHELIX-HARNESSの固定L2/L11だけである。以下の一致・未一致・残差はこのpairとの比較結果を示す。HELIX-OS、LABO、INTELLIGENCE等のL2/L11を全探索していないため、所有者や正式配置先は推定しない。後続PO判断の候補statusは固定F6比較とは別に記録し、後続候補の採択／保留を旧identityのsuccessorまたはclosureに読み替えない。

旧source assetはbusiness rowsが`LEGACY-ASSET-9F48ADEEB477DCA54039`、functional rowsが`LEGACY-ASSET-6B6C5CB0E481BE01088B`。両assetの旧source authorityは`confirmed`、source snapshotはread-only保持、product targetは`unresolved`、carry-forwardは`preserved_pending_rehome`。

## identity別の条件比較

### D-08

- identity: `harness/L1-requirements/business-requirements.md::D-08`
- 旧source: `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md:203`。file SHA-256 `09ad9a27afe25bd730f57319865d1f342e6b31729da2dd27f22ecd6cb753ac61`、line SHA-256 `5995c913ddb84305c9045fd6bd2f32819b774704f40c20a7c5c0f87c5323fab6`。
- 原文: \| **D-08** \| gate override 件数/sprint \| PO による gate fail-close 例外行使件数 \| ≤ 2 件/sprint \| `.helix/audit/` / gate override log \|
- 条件atom: gate override 件数/sprint；POによるgate fail-close例外行使件数；threshold ≤ 2件/sprint；旧consumer `.helix/audit/` / gate override log。
- 固定F6の近接条件:
  - `HARNESS-L2-005` (L2:56,118–121; L11:25,47–48): 検証義務・oracle/evidence・expected failureと省略・回収の一般契約。override件数やsprint計測は定義しない。
  - `HARNESS-L2-022` (L2:447–461; L11:217): 段階別oracle/evidence/受入状態の一般契約。個別KPI式・thresholdなし。
- 残差:
  - 例外行使の定義、母集団、sprint境界、重複/取消、owner、measurement oracleが固定pairにない。
  - PO承認時のみ許容という旧例外条件と≤2件/sprintの保持・変更判断がない。
- 失敗／negative oracle: 固定L11にはgate override計測値や2件超過判定がない。旧consumer/thresholdを実行先・採択KPIへ変換しない。
- 比較結果: `identity_specific_kpi_unmatched`。successorなし、closureなし。

### D-09

- identity: `harness/L1-requirements/business-requirements.md::D-09`
- 旧source: `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md:204`。file SHA-256 `09ad9a27afe25bd730f57319865d1f342e6b31729da2dd27f22ecd6cb753ac61`、line SHA-256 `9cd4358f9d4b13991945ccb88c72cec3f2203b0cf443671cb595269664847557`。
- 原文: \| **D-09** \| continuation 再開成功率 \| next authority 実行成功件数 / continuation event 総件数 × 100 \| ≥ 95 % \| `harness.db` continuation projection / `helix status` \|
- 条件atom: continuation再開成功率；next authority実行成功件数 / continuation event総件数 × 100；threshold ≥ 95%；旧consumer `harness.db` continuation projection / `helix status`。
- 固定F6の近接条件:
  - `HARNESS-L2-003` (L2:54,98–111; L11:23,37–41): 工程の開始・凍結・差戻し・再開・完了と未検証進行拒否。再開業務のsuccess-rate metricではない。
  - `HARNESS-L2-005` (L2:56,118–121; L11:25,47–48): ticket/riskに応じた検証義務と証拠。continuation population/ratioは定義しない。
- 残差:
  - continuation event/next-authority successの同一性、分母、再試行・取消等の扱い、期間、source/ownerが未定義。
  - 旧threshold ≥95%を固定pairで評価するoracleがない。DB projection/CLIは旧consumer名であり、新runtimeや実行方式として採用しない。
- 失敗／negative oracle: 固定pairは個別再開失敗・成功率のthresholdを判定しない。unknown/not observedを成功またはゼロ件へ置き換えない。
- 比較結果: `identity_specific_kpi_unmatched`。successorなし、closureなし。

### UX-02

- identity: `harness/L1-requirements/business-requirements.md::UX-02`
- 旧source: `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md:56`。file SHA-256 `09ad9a27afe25bd730f57319865d1f342e6b31729da2dd27f22ecd6cb753ac61`、line SHA-256 `de4ade69721a60cd79706e3f08a67c25e7c200a8e1accc02b5b8f92e4ce644f6`。
- 原文: \| **UX-02** \| 工程表ダッシュボード (専用 UI) で PO と AI agent roster が進捗・詰まり・フェーズを把握できる (BR-06 の体験面) \| ダッシュボードヒアリング \|
- 条件atom: 工程表dashboard；専用UI；POとAI agent rosterが進捗・詰まり・phaseを把握；BR-06の体験面。
- 固定F6の近接条件:
  - `HARNESS-L2-003` (L2:54,106–107; L11:23,37,41): 画面・不確定要素に応じたPrototype適用と要求合意前freeze禁止。専用dashboardのproduct requirementではない。
  - `HARNESS-L2-006, 007` (L2:57–58; L11:26–27): サービス提供範囲・Version 1成立確認を扱う。PO/agent rosterの横断進捗UIではない。
- 残差:
  - 専用UI dashboard、工程表、進捗/詰まり/phaseの横断表示は固定pairにない。
  - 表示対象・freshness/realtime、stale data、interaction、dashboard固有の利用者oracleがない。
- 失敗／negative oracle: 固定L2/L11にはdashboard presence/freshness/roster oracleなし。L2.5 Prototype条件からdashboard機能採択を推定しない。
- 比較結果: `dashboard_condition_unmatched`。successorなし、closureなし。

### FR-L1-05

- identity: `harness/L1-requirements/functional-requirements.md::FR-L1-05`
- 旧source: `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md:36`。file SHA-256 `a9c1064d359b0d9c7269a2253e416597de77fa91149c162f9a40467be3f1a008`、line SHA-256 `4819bec0dd1da8aaa4f07260f6b3dcd43a58408b6f8e43d6693b89c1324ee6a1`。
- 原文: \| **FR-L1-05** \| 決定論的 static ゲート (fail-close、gate-checks.yaml、AI 不要) \| automation-gate-map \| 工程・成果物・数値品質 \| pass/fail 判定、ゲート証跡 (.helix/phase.yaml)。※ extended (既存 source capability W1/W2/W13 突合、2026-06-04): `helix gate <G>` は `helix status` の execution mode を参照し、判断ゲート (G0.5/G2/G4-G7/R4) では cross-agent / intra_runtime_subagent review 証跡を必須化する。gate / plan lint / vmodel lint / security guard の判定は runtime 差で分岐させず fail-close の単一ルールに寄せる \| P0 \| **PM-03 (直接)** / HM-07 \|
- 条件atom: 決定論的static gate；fail-close、gate-checks.yaml、AI不要；工程・成果物・数値品質入力；pass/failと`.helix/phase.yaml` evidence；extended source: runtime差で分岐しない単一判定。
- 固定F6の近接条件:
  - `HARNESS-L2-005` (L2:56,118–121; L11:25,47–48): ticket/change/layer/riskから義務・evidenceを選び、CI組立条件を定める。固定target mappingはなし。
  - `HARNESS-L2-022` (L2:447–461; L11:217): stage oracle/evidence/受入の一般契約。特定の静的gate判定条件を定めるものではない。
- 残差:
  - static predicate/config schema、unknown/missing config拒否、fail-close outcome schema、`.helix/phase.yaml`の扱いは固定HARNESS pairにない。
  - HARNESS-L2-005/022の一般義務だけでsource conditionまたは旧gate threshold/consumerのclosureはしない。
- 失敗／negative oracle: 同一入力で異なるruntime判定、unknown/missing configをpass、AI判断やCI greenだけをstatic predicate/evidenceとする負例を固定pair固有のoracleは定めない。
- 比較結果: `adjacent_partial_match_static_gate_unmatched`。successorなし、closureなし。
- 後続PO判断・候補status（固定F6比較とは分離）:
  - 2026-09-29 57候補 PO判断（PR/CI候補群）: `HARNESS-L2-034 adopted`。測定契約の近接。static gate predicate/fail-close configuration contractを置換しない。
  - 2026-09-29 57候補 PO判断: `HARNESS-L2-036 adopted`。選択screen scope内のW/test parity。general deterministic gate全体を採択しない。
  - 2026-09-29 57候補 PO判断: `HELIXOS-L2-033 adopted`。選択engine/detectorのversion/config/snapshot registry。HARNESS gate意味を所有しない。

### FR-L1-20

- identity: `harness/L1-requirements/functional-requirements.md::FR-L1-20`
- 旧source: `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md:51`。file SHA-256 `a9c1064d359b0d9c7269a2253e416597de77fa91149c162f9a40467be3f1a008`、line SHA-256 `508f583208a248beb17fc65a2241aa46754a774605fd101be1049a3dba0ac05c`。
- 原文: \| **FR-L1-20** \| 観測・計測層 (5 hook で AI 実行を全量ログ化、発火 / トラブル / 精度 / 予算のメトリクス集約) \| observability-metrics \| AI 実行イベント全種 \| invocation_log / action_logs / gate_runs / accuracy_score / budget_events、dashboard メトリクス。※ extended: スキル使用パラメータ + モデルパラメータ + トラブル計測 + トークン/利用コスト の 4 軸を計測対象に追加 (L3 で AC 詳細化、F7=b に従い L1 はスコープ宣言のみ) \| P1 \| HM-05 / HM-08 \|
- 条件atom: 5 hookでAI実行を全量ログ化；発火/トラブル/精度/予算のメトリクス集約；extended: skill/model parameters、trouble、token/usage costの4軸追加；invocation_log/action_logs/gate_runs/accuracy_score/budget_eventsとdashboard。
- 固定F6の近接条件:
  - `HARNESS-L2-005` (L2:56,118–121; L11:25,47–48): 選択された検証義務とevidence条件。全AI hook telemetryではない。
  - `HARNESS-L2-022` (L2:447–461; L11:217): 工程ごとのoracle・証拠・受入状態を定める。計測値やevent schemaを全量収集する契約ではない。
- 残差:
  - hook event inventory/coverage、4軸の定義とdenominator、missing data処置、HM-05 fields/frequency、accuracy/budget formula/oracleがfixed HARNESS pairにない。
  - FR-L1-20の旧UI/hook/specific backendを新方式として持ち込まない。
- 失敗／negative oracle: unknown/not_observedをsuccess/zeroへ置換するmetric oracleなし。固定pairは5 hook全件または4軸計測の欠落をfailする条件を定めない。
- 比較結果: `identity_specific_observability_unmatched`。successorなし、closureなし。
- 後続PO判断・候補status（固定F6比較とは分離）:
  - 2026-09-29 57候補 PO判断: `HARNESS-L2-034 adopted`。選択metricのmeasure/oracle。5-hook coverage/4-axis event aggregationは含意しない。
  - 2026-09-29 57候補 PO判断: `HELIXOS-L2-043 adopted`。worker delegation traceのapproval request/tool call/result provenance。全hook telemetryではない。

### FR-L1-21

- identity: `harness/L1-requirements/functional-requirements.md::FR-L1-21`
- 旧source: `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md:52`。file SHA-256 `a9c1064d359b0d9c7269a2253e416597de77fa91149c162f9a40467be3f1a008`、line SHA-256 `b54119ad033bcb2f01c1977710d76249ab80a2789422ed02afa3c54d6ac3799b`。
- 原文: \| **FR-L1-21** \| テスト観点 W 字ゲート (設計項目へのテスト観点抜け検出 + レベル間重複検出を static で fail-close) \| test-perspective-gate \| 設計 PLAN + テスト設計 PLAN、テストレベル定義 \| 観点抜け一覧、重複観点一覧、pass/fail \| P1 \| PM-04 \|
- 条件atom: test-perspective W gate；設計項目ごとのtest perspective漏れ検出；test level間重複検出；static fail-close；抜け一覧・重複一覧・pass/fail。
- 固定F6の近接条件:
  - `HARNESS-L2-004` (L2:55; L11:24): 要求→設計/test traceと変更時再検証範囲。W perspective completeness/duplicate detectionではない。
  - `HARNESS-L2-005` (L2:56,118–121; L11:25,47–48): ticket/risk selected verification obligation/evidence。固定pairはW-gate具体oracleを持たない。
- 残差:
  - 設計項目ごとのW観点対応、test level間の重複oracle、fail-close、finding schema、pass/failは固定pairに定義されていない。
  - 旧sourceの物理hook/CIは持ち込まない。一般的なtrace/evidenceだけではこのidentityを閉じない。
- 失敗／negative oracle: 固定pairにはFR-L1-21としてW観点欠落またはtest level間重複をfailにする条件がない。後続候補の採択をsource identityのsuccessor/closureとみなさない。
- 比較結果: `partial_trace_verification_match_w_gate_unmatched`。successorなし、closureなし。
- 後続PO判断・候補status（固定F6比較とは分離）:
  - 2026-09-29 57候補 PO判断: `HARNESS-L2-036 adopted`。後続PO判断では、選択screen scope内でW観点とtest perspectiveの対応を採択し、FR-L1-21/22およびNFR-06/13の関連行を含む。選択scopeに限る。固定F6比較および旧source identityのauthority状態は変更しない。

### FR-L1-23

- identity: `harness/L1-requirements/functional-requirements.md::FR-L1-23`
- 旧source: `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md:54`。file SHA-256 `a9c1064d359b0d9c7269a2253e416597de77fa91149c162f9a40467be3f1a008`、line SHA-256 `920a9745ec190e871ab29af8463a9ab9cb991c43fbe723740d5b2f10dbe38b71`。
- 原文: \| **FR-L1-23** \| `PRODUCTION_SCRUM`をFull Vと同格のdevelopment styleとして実行し、L3 freeze後の各価値sliceで正規L4/L5設計、L6/L7実装、対応right-arm evidenceを閉じる \| scrum-workflow \| sprint完成increment、選択済みstyle、slice境界 \| sliceごとの正規V-pair evidenceとsystem整合。Scrumを縮退VやPoC phaseとして扱わず、fullbackは既存asset導入時の別workflowに限定する \| P1 \| PM-02 \|
- 条件atom: PRODUCTION_SCRUM as development style at parity with Full V；after L3 freeze, each value slice has L4/L5 design and L6/L7 implementation plus right-arm evidence；system consistency；fullback limited to introduction of existing assets。
- 固定F6の近接条件:
  - `HARNESS-L2-002` (L2:53,100–103; L11:22,34–40): 4つの開発方式の選択・合成とScrumのslice/checkpoint条件を定めるが、sourceのFull Vとの同格性やfullback制限と同一ではない。2026-09-25のPO判断では旧Production Scrumの意味を改めている。
  - `HARNESS-L2-003` (L2:54,105–111; L11:23,37–41): freeze/backflow/reopenとSR0–SR4、release-ready条件を定めるが、source記載の条件一式とは同一ではない。
- 残差:
  - Full Vとの同格性、全value sliceのL4/L5→L6/L7 right-arm証拠、system受入を束ねた条件がない。
  - fullbackを既存assetの導入だけに限る条件は固定pairにない。
- 失敗／negative oracle: 固定pairはrelease-ready前のSR4欠落を拒否するが、FR-L1-23全atomのoracleではない。これをclosureと推定しない。
- 比較結果: `partial_scrum_process_match_full_condition_unmatched`。successorなし、closureなし。
- 後続PO判断・候補status（固定F6比較とは分離）:
  - 2026-09-29 57候補 PO判断: `HARNESS-L2-046 adopted`。後続PO判断は選択scope内のdispatch→run→Ready→merge連続性を採択した。これはclosure/admissionの範囲であり、Scrumの開発方式やslice意味を採択したものではない。

### FR-L1-35

- identity: `harness/L1-requirements/functional-requirements.md::FR-L1-35`
- 旧source: `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md:66`。file SHA-256 `a9c1064d359b0d9c7269a2253e416597de77fa91149c162f9a40467be3f1a008`、line SHA-256 `7bff35b2a785e51c8eeebeded9e93ac720efd2f9ca8315552e14d8d6ea66be90`。
- 原文: \| **FR-L1-35** \| 基盤整備状況の可視化 (実装済み / 設計済み・実装未 / 未設計の 3 区分で検証・テスト・検出基盤を一覧表示) \| infra-readiness \| 各機構の実装状況 \| 整備状況一覧 (区分付き) \| P2 \| HM-01 \|
- 条件atom: readiness inventory for verification/test/detection infrastructure；three states: implemented / designed-not-implemented / not-designed；all mechanisms as current source says。
- 固定F6の近接条件:
  - `HARNESS-L2-005, 007` (L2:56,58; L11:25–27): verification obligations and Version 1 multi-product completion. No three-state infrastructure readiness inventory.
- 残差:
  - 固定HARNESS pairは3つのreadiness state、inventory行/coverage、FR35固有oracleを定義しない。
  - 後続のHELIXOS-L2-045候補は、選択されたOS-L1-002適用scopeに限る3状態一覧条件を持つ。現時点での採択、正式なowner移管、旧source条件のclosureを意味しない。
- 失敗／negative oracle: 後続のHELIXOS-L2-045 L11候補は、選択scope内の基盤行の欠落または3区分の統合を不成立とし、source revisionがunknown/staleならunknownのままにする。ただしこれは保留中の候補oracleであり、固定F6の採択済み条件でも受入実行結果でもない。
- 比較結果: `fixed_pair_unmatched_later_os_candidate_held`。successorなし、closureなし。
- 後続PO判断・候補status（固定F6比較とは分離）:
  - 2026-09-29 57候補 PO判断 (docs/governance/decisions/po-decision-2026-09-29-57candidates.md:68): `HELIXOS-L2-045 / MPR-RC-HELIXOS-L2-045-001 held`。判断はOS L2 revision 89d79c76a7d46c4e1c76cf88046eac5a22dfcddcd96726c75cf82f0ddd80bdb2（section SHA-256 87b2bc8fc6a5285ae300dff95ea46d461e754207bb71c5e5fb2729b34bcf1968）とOS L11 revision 7547b0ada257c2cbc65771c8c83aaec58f4405e85e095f9bdfae4d1b56f2a0fd（section SHA-256 5e6841d94bc8b6896cce1b941ef218f6b4b8168bb2ae49dce3f0679203868084）を対象revisionとして固定する。scope、version_target、HARNESSからOSへownerを移すかの明示が保留解除条件である。 PO表行 `docs/governance/decisions/po-decision-2026-09-29-57candidates.md:68`、status `held`、MPR `MPR-RC-HELIXOS-L2-045-001`。L2 `89d79c76a7d46c4e1c76cf88046eac5a22dfcddcd96726c75cf82f0ddd80bdb2`／section SHA `87b2bc8fc6a5285ae300dff95ea46d461e754207bb71c5e5fb2729b34bcf1968`、L11 `7547b0ada257c2cbc65771c8c83aaec58f4405e85e095f9bdfae4d1b56f2a0fd`／section SHA `5e6841d94bc8b6896cce1b941ef218f6b4b8168bb2ae49dce3f0679203868084`
  - 2026-09-29 11候補 PO decision (docs/governance/decisions/po-decision-2026-09-29-11candidates.md:50): `HELIXOS-L2-045 hold conditions maintained`。削除または不採用の判断ではない。対象集合、version、ownerの曖昧さは未解消で、保留条件を維持する。 PO表行 `docs/governance/decisions/po-decision-2026-09-29-11candidates.md:50`、status `held_conditions_maintained`、MPR `MPR-RC-HELIXOS-L2-045-001`。L2 `89d79c76a7d46c4e1c76cf88046eac5a22dfcddcd96726c75cf82f0ddd80bdb2`／section SHA `87b2bc8fc6a5285ae300dff95ea46d461e754207bb71c5e5fb2729b34bcf1968`、L11 `7547b0ada257c2cbc65771c8c83aaec58f4405e85e095f9bdfae4d1b56f2a0fd`／section SHA `5e6841d94bc8b6896cce1b941ef218f6b4b8168bb2ae49dce3f0679203868084`

### FR-L1-37

- identity: `harness/L1-requirements/functional-requirements.md::FR-L1-37`
- 旧source: `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md:68`。file SHA-256 `a9c1064d359b0d9c7269a2253e416597de77fa91149c162f9a40467be3f1a008`、line SHA-256 `6457d029787992bbdc7359553c17900283a14ff470ecb85e4f2a42fd7fdce4bc`。
- 原文: \| **FR-L1-37** \| モデル/エフォート推挙システム (task × drive × L 別 model + reasoning effort 動的選定) \| PO directed (2026-05-28) \| task 分類結果 (FR-L1-39)、drive、L 層、budget 残量 \| 推奨 model ID、reasoning effort 値、選定根拠ログ。FR-L1-12 (L 単位注入) の model 粒度拡張。FR-L1-39 上流 input。※ extended (既存 source capability W3/W4 突合、2026-06-04): `helix task estimate` と `helix skill suggest` の出力を入力に、frontier-reviewer / worker / fast-checker の capability class と reasoning effort を選定する \| P1 \| HM-08 \|
- 条件atom: task × drive × layerおよび残budgetに基づくmodel/reasoning effort推奨；推奨model ID、effort値、理由log；拡張条件はtask estimate/skill suggestionとcapability class。
- 固定F6の近接条件:
  - `HARNESS-L2-002, 003, 005` (L2:53–56; L11:22–25,34–48): workflow/styleの選択、state、選択された検証を扱うが、推奨関数を定義しない。
- 残差:
  - task×drive×layer×budgetの入力対応、候補集合、effort語彙、score/rank関数、推奨理由logは固定HARNESS pairにない。
  - OS/LABO/INTELLIGENCEの責務境界からFR37のformal successorやmodel選定policyを作らない。
- 失敗／negative oracle: task/drive/layer/budgetがunknownの場合のFR37固有oracleは固定pairにない。他機構や後続候補statusからmodel推奨を推定しない。
- 比較結果: `identity_specific_model_effort_recommendation_unmatched`。successorなし、closureなし。
- 後続PO判断・候補status（固定F6比較とは分離）:
  - later 2026-09-29/30 PO candidate decisions: `HELIXOS-L2-051 条件付き採択 / MPR-RC-HELIXOS-L2-051-002`。task scopeごとのrole配置案であり、LABOのlevelとINTELLIGENCEの配置根拠を使う。model/effort推奨関数ではなく、FR-L1-37のsuccessorでもない。 PO表行 `docs/governance/decisions/po-decision-2026-09-29-57candidates.md:74`、status `conditional_adoption`。L2 `89d79c76a7d46c4e1c76cf88046eac5a22dfcddcd96726c75cf82f0ddd80bdb2`／section SHA `54fd39fbeb3786bc739560856afb14e3cf892b1bb717d98ceb1212df09fe7f2b`、L11 `7547b0ada257c2cbc65771c8c83aaec58f4405e85e095f9bdfae4d1b56f2a0fd`／section SHA `e01daa2fbf1ad7c2e9b6df54a9acdf022a3b821123d8904f8a171a4ede87b684`

### FR-L1-38

- identity: `harness/L1-requirements/functional-requirements.md::FR-L1-38`
- 旧source: `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md:69`。file SHA-256 `a9c1064d359b0d9c7269a2253e416597de77fa91149c162f9a40467be3f1a008`、line SHA-256 `76ca28f714bf37741a2ac6cdbbcae826fae07222afaedbc610ebcce0d3b922b0`。
- 原文: \| **FR-L1-38** \| model 評価システム (per-model success rate を model_runs + plan_registry から projection、opt-in) \| BR-21 / PLAN-L7-53 (2026-06-15 P2 carry から昇格) / PLAN-L7-57 / PLAN-L7-58 \| model_runs (run_id, runtime, model, role, drive, plan_id, started_at, completed_at, evidence_path)、plan_registry.status、.helix/config/model-opt-in.yaml (enabled:true で有効化)、runtime session telemetry \| model_evaluations projection (model PK、success_rate REAL 0.0-1.0、run_count INTEGER、success_count INTEGER、token/cost efficiency、evaluated_at TEXT)。opt-in 無効 = 0 行。cold-start = 0 行。未掲載 pricing は null のまま捏造しない \| P2 \| HM-08 \|
- 条件atom: model_runsとplan_registryからのmodel別success rate projection；success rate 0.0–1.0とrun/success件数；opt-in有効時に行を生成し、無効・未設定・cold-startは0行；pricing不明値はnullのまま保持。
- 固定F6の近接条件:
  - `HARNESS-L2-005, 022` (L2:56,336+; L11:25,22–25): 検証・証拠・oracle・stage受入の一般契約であり、per-model outcome projectionやopt-in時のrow条件ではない。
- 残差:
  - 固定HARNESS pairには、母集団、model identity、success分母/outcome source、opt-in/cold-start時の行数、pricing provenance、stale時の更新oracleがない。
  - 固定pairはmodel evaluationをHARNESSの責務として定義しない。
- 失敗／negative oracle: opt-in不在やcold-startをsuccess率0%にせず、unknown pricingを補わない。固定pairにはFR38固有のrow単位pass/fail oracleがない。
- 比較結果: `identity_specific_model_evaluation_unmatched`。successorなし、closureなし。
- 後続PO判断・候補status（固定F6比較とは分離）:
  - 2026-09-30 fixed-F6 follow-up audit; adjacent mechanisms only: `LABO-L2-055 / INTELLIGENCE-L2-011 近接pair evidence（F6以降のsource identity decisionではない）`。先行監査には評価・適用可能性・unknown処理に関連する記述があるが、別機構のpairである。FR-L1-38のmodel別projection、opt-in、分母、行数、pricing意味は定義しない。。詳細: `docs/governance/audits/requirements-stage/legacy-confirmed175-fr-l1-20-37-38-39-43-condition-audit-2026-09-30.json#FR-L1-38`

## FR-L1-35のheld候補の位置づけ

旧FR-L1-35の固定F6比較はHARNESS-L2-005/007の一般的な検証義務・Version 1確認に近接するが、3状態のreadiness inventoryは固定pairにない。後続の`HELIXOS-L2-045`／`MPR-RC-HELIXOS-L2-045-001`は、旧FR-L1-35の三分類一覧を選択されたOS-L1-002適用scopeへ限定する候補として別に存在する。2026-09-29 PO判断はこれを「保留」とし、対象集合、`version_target`、HARNESSからOSへの所有移動の有無を明記する解除条件を固定した。POは機能削除・不採用を決めていない。
候補本文の判断対象revisionはOS L2 `89d79c76a7d46c4e1c76cf88046eac5a22dfcddcd96726c75cf82f0ddd80bdb2`／section SHA `87b2bc8fc6a5285ae300dff95ea46d461e754207bb71c5e5fb2729b34bcf1968`、OS L11 `7547b0ada257c2cbc65771c8c83aaec58f4405e85e095f9bdfae4d1b56f2a0fd`／section SHA `5e6841d94bc8b6896cce1b941ef218f6b4b8168bb2ae49dce3f0679203868084`。後続11候補PO判断もhold条件を維持する。固定F6比較、held候補、候補のauthority状態、HARNESSからOSへのowner移動は別事項として残り、formal successorはない。

## 照合結果の要約

| identity | 固定F6との比較 | 後続decisionの限定効果 |
|---|---|---|
| `D-08` | `identity_specific_kpi_unmatched` | identity固有の後続decisionをこの範囲では確認せず |
| `D-09` | `identity_specific_kpi_unmatched` | identity固有の後続decisionをこの範囲では確認せず |
| `UX-02` | `dashboard_condition_unmatched` | identity固有の後続decisionをこの範囲では確認せず |
| `FR-L1-05` | `adjacent_partial_match_static_gate_unmatched` | HARNESS-L2-034 adopted: 測定契約の近接。static gate predicate/fail-close configuration contractを置換しない。; HARNESS-L2-036 adopted: 選択screen scope内のW/test parity。general deterministic gate全体を採択しない。; HELIXOS-L2-033 adopted: 選択engine/detectorのversion/config/snapshot registry。HARNESS gate意味を所有しない。 |
| `FR-L1-20` | `identity_specific_observability_unmatched` | HARNESS-L2-034 adopted: 選択metricのmeasure/oracle。5-hook coverage/4-axis event aggregationは含意しない。; HELIXOS-L2-043 adopted: worker delegation traceのapproval request/tool call/result provenance。全hook telemetryではない。 |
| `FR-L1-21` | `partial_trace_verification_match_w_gate_unmatched` | HARNESS-L2-036 adopted: 後続PO判断では、選択screen scope内でW観点とtest perspectiveの対応を採択し、FR-L1-21/22およびNFR-06/13の関連行を含む。選択scopeに限る。固定F6比較および旧source identityのauthority状態は変更しない。 |
| `FR-L1-23` | `partial_scrum_process_match_full_condition_unmatched` | HARNESS-L2-046 adopted: 後続PO判断は選択scope内のdispatch→run→Ready→merge連続性を採択した。これはclosure/admissionの範囲であり、Scrumの開発方式やslice意味を採択したものではない。 |
| `FR-L1-35` | `fixed_pair_unmatched_later_os_candidate_held` | HELIXOS-L2-045 / MPR-RC-HELIXOS-L2-045-001 held: 判断はOS L2 revision 89d79c76a7d46c4e1c76cf88046eac5a22dfcddcd96726c75cf82f0ddd80bdb2（section SHA-256 87b2bc8fc6a5285ae300dff95ea46d461e754207bb71c5e5fb2729b34bcf1968）とOS L11 revision 7547b0ada257c2cbc65771c8c83aaec58f4405e85e095f9bdfae4d1b56f2a0fd（section SHA-256 5e6841d94bc8b6896cce1b941ef218f6b4b8168bb2ae49dce3f0679203868084）を対象revisionとして固定する。scope、version_target、HARNESSからOSへownerを移すかの明示が保留解除条件である。; HELIXOS-L2-045 hold conditions maintained: 削除または不採用の判断ではない。対象集合、version、ownerの曖昧さは未解消で、保留条件を維持する。 |
| `FR-L1-37` | `identity_specific_model_effort_recommendation_unmatched` | HELIXOS-L2-051 条件付き採択 / MPR-RC-HELIXOS-L2-051-002: task scopeごとのrole配置案であり、LABOのlevelとINTELLIGENCEの配置根拠を使う。model/effort推奨関数ではなく、FR-L1-37のsuccessorでもない。 |
| `FR-L1-38` | `identity_specific_model_evaluation_unmatched` | LABO-L2-055 / INTELLIGENCE-L2-011 近接pair evidence（F6以降のsource identity decisionではない）: 先行監査には評価・適用可能性・unknown処理に関連する記述があるが、別機構のpairである。FR-L1-38のmodel別projection、opt-in、分母、行数、pricing意味は定義しない。 |

## 静的確認と非主張

確認対象は、live recount revisionと選択順、先行10件の除外、archive source path/line/file SHA/line SHA、固定F6 L2/L11 file SHA、identityと資産台帳のsource/carry state、後続decisionの候補status・対象revision・限定範囲である。旧workflow、CLI、hook、adapter、runtime、test、CIは起動していない。

JSONには10個のidentity record、旧原文行、line/file digest、固定pair scope、限定一致、残差、negative oracle、後続candidate contextを収録する。

後続PO decision files（基準treeで固定）:
- `docs/governance/decisions/po-decision-2026-09-29-57candidates.md` SHA-256 `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`
- `docs/governance/decisions/po-decision-2026-09-29-11candidates.md` SHA-256 `6e10127a65a775b0a7554ccb359abdfc1221d17a2c48fb79321d59369df127c5`
