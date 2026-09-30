# confirmed175 FR-L1-03/05/17/18/22 固定pair個別条件監査

- 基準revision: `c844e0c80739411eb11e4b6e74eb958ec216614f`
- 固定比較revision: `f6dad2a33e24f000b87d7f09b8d40288257e74cc`
- 対象: `FR-L1-03`, `FR-L1-05`, `FR-L1-17`, `FR-L1-18`, `FR-L1-22`（5件）
- source authority: `confirmed`; carry-forward: `preserved_pending_rehome`
- authority effect: `none`; 採択・successor・closure・実装/CI実行の主張なし

## sourceと旧consumer

旧sourceは[`archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md`:34,36,48,49,53]（基準tree bytes SHA-256 `a9c1064d359b0d9c7269a2253e416597de77fa91149c162f9a40467be3f1a008`）。`LEGACY-ASSET-6B6C5CB0E481BE01088B`はsource snapshot preservation、旧source authority `confirmed`、target `unresolved`、carry-forward `preserved_pending_rehome`。source row text/hash、asset/disposition row、identity ledgerの5行、source copy read-afterをJSONへ固定した。元のarchive file hashは基準commitから再計算し、保持snapshotのSHA `a9c1064d359b0d9c7269a2253e416597de77fa91149c162f9a40467be3f1a008`と照合した。

旧screen consumerは`archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/screen-requirements.md:139,210–219`（file SHA-256 `e5b6964567242a2440ded28ed99c1783f37a9326624c02283c7a975c3020063b`）。HM-07は`helix doctor`結果表示、V-model順序/entity coverage/hook/phase/carry結果、severityと件数、再実行・PM遷移を定めるUI consumerである。これはdetector実装、exact source-condition coverage、CI/branch-protection permissionの証拠ではない。screen表でFRとHM-07が関連付けられていても、HM-07自身の詳細な`対応`行はFR-L1-02/11/18であり、各FRの処理契約と同一視しない。

## 旧L4 consumerと既知の検出失敗

旧L4 function/dataも基準commitから直接pinした。function file SHA-256 `64874fd460f00d97cf195fd6c997164a09c333982a2fbc0f29af7e8877cafe35`、data file SHA-256 `b94e3ec801d6275af18976abdd88eaff44da23494ce654dbde9c3fa2ebaae1c6`。JSONには各参照行の原文・行hashを収録した。

- FR-L1-03: L4 §1.2は、宣言済pair linkの整合だけを見る既存traceが期待される下流artifactの不在に盲目だったと記録する。A-136ではimplementation着地済みでもL6 unit-test design不在を見逃した。後段案は上流FR＋obligation matrixから期待artifactを生成して不在をfail-closeする。これは旧L4の失敗/設計史であり、固定f6 pairの実装証拠ではない。旧dataは`artifact.trace ↔ plan.generates`、相互`pair_artifact`、AC↔AT、phase↔gate、および4 artifact/12 directed edgeのtrace_edgesを記す。FRの「4 artifact」の個別名称はsourceに列挙されないため補わない。
- FR-L1-05: 旧L4はFR-05を`helix gate`（execution mode別review-tier、deterministic static gate）へ結び、gate→trace→detectorの順を記録する。歴史的consumerであって現在のfixed mapping/実行証拠ではない。
- FR-L1-17: ここでpinした旧L4記述はPR branch protection admissionの厳密な契約ではない。FR-05 gateとの近接だけでFR-17の実装とはしない。
- FR-L1-18: 旧L4は`helix doctor`の横断集約＋routing、およびdoctor→typed routing→plan draftを記す。旧screen HM-07の表示責務とは別のconsumer経路だが、現在のdetector inventoryやplan起票authorityの証拠ではない。
- FR-L1-22: pinした旧L4 consumer行に5 FE detector軸の定義はない。近い一般的なdetector/DB記載から軸意味を推測しない。

## f6固定HARNESS pairと責務境界

HARNESS判断record `c7a6d39ceb853fe6c00ccc336ffa7bbbd6c7e87a0aaba172f43f490dd0a7fd23`に基づき、f6のHARNESS-L2/L11 001、004、005は採択済み固定bytesとして比較した。L2/L11ファイルSHA、各要求行と受入行、関連詳細行のhashはJSONにpinした。

- **001**は現行canonical L1–L12/V-pairとL2.5適用境界を保持する。
- **004**は要求から設計・テストへのtrace、変更時の再検証範囲を保持する。
- **005**はticket/change/layer/riskから検証義務・証拠・CI構成を導き、省いた検査を記録し合流先ticketで回収するHARNESS責務を保持する。CIの運転はOS側。

これらの固定pairは旧screenや旧実装を同じbyteで移したものではなく、四artifact tuple、旧check名、`helix doctor`の一括検出、旧branch×mode matrixとの意味差を各行で照合した。HARNESS-005を含む点だけでFR-L1-05の個別queue targetを作らない。

### FR-L1-03 — V字双方向trace

- Source（行34）: 設計PLANとテスト設計PLANを入力に、4 artifact pairの双方向traceを確認し、整合レポートと欠落検出を出す。
- Fixed mapping: queueはHARNESS-L2-001/004/005を関連targetとして列挙する。001はcanonical pair、004はtrace/revalidationに近接する。005は必要検証・evidenceの導出を支える。
- 保持と残差: 旧の4 artifact名・exact relation tuple、両方向の完全性、revision一致、欠落/重複/孤立時のreport schemaはfixed targetからは確認できない。PM-04がsourceの直接画面で、HM-07は補助表示参照にとどまる。
- 反例:片方向linkのみ、4 pair中1組欠落、行linkだけで成果物内容/revision不一致を見落とす場合を正常な整合として扱わない。旧L4のA-136例では、宣言linkは存在してもL6単体テスト設計artifactそのものが不在で、旧検査はこれを見逃した。
- 近接採択pair: HARNESS-034のmeasurement oracleはtrace-backed evidenceに使い得るが4 pair schemaではない。036の選択scope内test-perspective completeness/CI parityも、全V-pair trace graphを提供しない。HELIXOS-L2-033（採択MPR-RC-HELIXOS-L2-033-001）は選択engine/detectorのversion/config/scope登録と同一snapshot再実行証拠・provenanceを扱うが、4 pair構造や不在検出を定義しない。

### FR-L1-05 — 決定論的static gate

- Source（行36）: `gate-checks.yaml`に基づくAI不要のdeterministic static gate。工程・artifact・numeric qualityを入力、pass/failと`.helix/phase.yaml` evidenceを出力し、fail-close。拡張sourceは指定gateをruntime差で分岐させず単一ルールとする。
- Fixed mapping: queueの`fixed_target_refs`は**空**。近接比較としてHARNESS-L2-005（verification obligations/CI plan）とHELIXOS-L2-020（CI assembly/execution/results）を照合した。両者をこのFRのtarget/successorとはしない。
- 保持と残差: 005はticket/riskに応じた義務・省略記録・回収を扱い、OS-020は選択CIを運転する。old config schema、static resolution oracle、exact fail-close error class、branch protectionへのpermission interfaceはこれらだけでは閉じない。sourceの「数値品質」にthreshold valuesはない。
- 反例: 同一gate入力でruntimeにより判定が変わる、unknown/missing gate settingをpassとする、CI greenだけをgate evidenceにする、AI判断をstatic predicateの代わりにする。
- 近接採択pair: HARNESS-034は選択metricの計測・完成oracle、036は選択ticket scope内のgate parityで、general static gateのsource targetではない。HELIXOS-L2-033（採択MPR-RC-HELIXOS-L2-033-001）はselected engine/detector registryと同一snapshot再現証拠の記録であり、static gate predicate、runtime差禁止の意味、branch protection設定を定義しない。OS-020のexecution statusはHARNESS gate意味やPR permissionを生成しない。

### FR-L1-17 — CI/PR・branch protection

- Source（行48）: local gate evidence→CI evidence verification→branch protection PR allow/deny、branch×mode対応。extended sourceは単一Required Status `harness-check`と8内部check（`branch-kind-check`, `commitlint`, `plan-lint`, `vmodel-lint`, `regression-test`, `poc-no-merge-guard`, `hotfix-postmortem-required`, `scrum-reverse-lint`）を列挙し、branch typeごとに適用。setupはcommitlint/CODEOWNERS/branch protectionへ接続。
- Fixed mapping: queue targetはHARNESS-L2-005。005は変更に応じた検証選択、evidence、skip記録/回収を定め、OS-020は実行・結果状態を扱う。
- 保持と残差: fixed targetはticket/riskによるCI構成を保持するが、旧単一check名、8 checkの旧branch-type適用表、PR admissionとbranch protection更新のexact current contractはそのまま継承しない。OS実行結果はpermission/merge/acceptanceではない。
- 反例: local evidenceが異なるcommitのままCI結果へ流用、旧8 checkの欠落をskip記録なしにgreen化、CI successだけでbranch protection許可とする、OSがHARNESS oracleを足し引きする。
- 近接採択pair: 034は計測契約、036はprofile選択済みのlocal/CI parityであり、いずれもbranch×mode PR permission全体ではない。HELIXOS-L2-046（採択MPR-RC-HELIXOS-L2-046-001）は一つのselected work scopeでdispatch→run→Ready→merge admissionにおける既存authority、HEAD、scope、既存required verificationの連続性を照合し、変更時にstaleとして再確認する接続条件である。旧branch×mode matrix、branch protection required-check/settings、追加approval/check/skip機構は定義しない。OS-020は運転consumerに限定する。

### FR-L1-18 — cross-detectionとDoctor集約

- Source（行49）: dependency missing、contract missing、connection loss、regressionの横断検出。全detector resultを入力に、cross reportとmode-routing destinationを出す。HM-07は直接Doctor、PM-04もconsumer。
- Fixed mapping: queue targetはHARNESS-L2-004。trace欠落の識別・変更再検証を保持する。005のverification obligationは周辺の選択/証拠責務。
- 保持と残差: 004はcross-detectionの一部に近いが、全detector inventory/coverage、4 finding familyのaggregation、unknown/error handling、`helix doctor`一括CLI、finding別mode routing outputは固定pairにない。HM-07は表示、検出器そのものではない。
- 反例: 4 familyの一つが未実行なのに“all detectors”報告、revision/scope不一致のresult混合、missing resultを0 finding扱い、finding reportにroute destinationなし。
- 近接採択pair: HARNESS-036は選択verification profile/ticket scopeに限るtest perspective completenessと4 cross-detection観点の判定を持つ。034は計測oracleに限定。036の限定scopeはglobal Doctor集約へ拡張しない。

### FR-L1-22 — FE detector 5軸

- Source（行53）: `mock-promotion`, `design-token-drift`, `a11y-regression`, `visual-regression`, `state-transition-drift`の決定論的判定。inputsはL2 mock、design-token SSOT、screenshots、screen-transition definitions。outputはpass/fail+detailの`DetectorResult`とCI evidence。
- Fixed mapping: queue targetはHARNESS-L2-004/005。これらはtrace/revalidationとticket/risk verification profileの一般条件で、FE 5軸そのものではない。f6にはHARNESS-L2-036がなく、later adopted comparisonとは分離する。
- Later adopted limited effect: 57候補decisionがHARNESS-L2-036 exact revisionを採択（MPR `MPR-RC-HARNESS-L2-036-002`）。このpairは5軸、画面を持つticketの合意済みscreen scope、関連source inputs、軸ごとのdeterministic resultとCI evidenceを定める。適用記録・screen scope unknownなら未評価へ戻し、非画面に一律適用しない。近接pairであり、元FRへのformal successor/closureを付けない。
- HARNESS-L2-034はmetric identity, target/baseline/environment, tolerance, sampling, probe, evidence/oracleと測定不足時のcompletion拒否を採択revisionに定めるが、5 FE detectorを実装するpairではない。HELIXOS-L2-033（採択MPR-RC-HELIXOS-L2-033-001）は選択detectorの版付きregistryと同一snapshotの再現証拠を記録するが、5 FE軸の判定意味・実装またはHARNESS-L2-036のscreen scope oracleを提供しない。
- 残差/反例: 元FR全適用面と後発036選択scopeのsource traceは未割当。画面あり合意scopeで5軸の一つを省略、必要input欠落またはfailをpass、違うrevisionのsource混用、非画面に5軸を一律強制するケースを分けて照合する。sourceは5軸を数えるが数値score/aggregate thresholdを指定しない。

## 57+11後発decisionの全identity/status

57候補record（source revision `318ec4a04abb3c1cc17111b3d939f913facd5fd3`, file SHA-256 `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`）の全57 identityとstatusは42採択・11条件付き採択・4保留。別11候補record（source revision `5aa100319361b0cc86edd3c51815ec777d55410a`, file SHA-256 `6e10127a65a775b0a7554ccb359abdfc1221d17a2c48fb79321d59369df127c5`）はtableの10採択と、HARNESS-L2-049現revisionの未採択・訂正L11の再確認待ち1件。全68 identity/status、MPR、decision行SHAをJSONに収録し、existing full decision-screen auditとidentity集合/decision file SHAを突合した。重複identityがあればdecision別entryのまま保つ。

近接pair HARNESS-034/036の採択状態とdecision source revisionは57候補recordから読む。pairの意味的近接、PO採択、screen表示との一致はsource identityのsuccessor・adoption・closureを生成しない。


## 追加した後発OS近接採択pair

PR #2404のR2404-01に基づき、57候補decisionで採択されたOS-033をFR-L1-05/18/22、OS-046をFR-L1-17のsection-level近接比較へ追加した。L2/L11のraw file SHAとsection digestは指定のpair source revision `318ec4a04abb3c1cc17111b3d939f913facd5fd3`から再計算し、decision tableの採択行は現在の記録bytes/hash・行SHA・MPRと照合してJSONへ収録した。

- **HELIXOS-L2-033 / MPR-RC-HELIXOS-L2-033-001**: 選択scopeのengine/detector identity、owner、version/config、source/input snapshot、同一登録条件でのrerun、finding/artifact provenanceと再現比較を記録する。OSは機能ownerのengine機能やdetector verdict意味を定義しない。ゆえにFR-L1-05の静的gate意味、FR-L1-18の一括cross-detector Doctor/routing、FR-L1-22の5軸FE判定の置換ではない。
- **HELIXOS-L2-046 / MPR-RC-HELIXOS-L2-046-001**: 一つのselected work scopeでdispatch、execution、Ready、merge admissionにわたる既存authority、HEAD、scope、既存required verificationの連続性を照合し、遷移中の変化をstale/未完として再確認する。旧branch×mode適用表やbranch protection required-check/settingsを定義せず、新しいapproval/check/skip機構も作らない。

両者の後発採択状態は比較資料のdecision table上のstatusとして記録したもの。旧FRへのsuccessor割当、旧条件の意味採択、source identityのclosureは行わず、各条件の残差判定を変更しない。

## 制限

本監査は5 source identityのfixed-f6/document comparison。候補pairや表示consumerから未採択要求の意味を採用せず、full auditでの未割当状態を維持する。新世代CIは未構築であり、旧CI・runtime・test・hook・CLIは実行していない。
