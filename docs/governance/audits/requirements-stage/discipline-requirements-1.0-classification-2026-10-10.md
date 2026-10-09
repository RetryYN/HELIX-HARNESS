# 開発規律（discipline）要求の分類 — 版未指定採択62件＋routing条件9件

- 読取基準：`origin/main` = `a25b8cf0328089f7b0aed8d14abffb284c2b677f`（`git show`のみ。repo変更・script実行なし）
- 略記：**H** = `docs/helix-harness/L2-requirements/product-requirements.md`、**O** = `docs/helix-os/L2-requirements/governance-requirements.md`、**B** = `docs/helix-brain/L2-requirements/brain-requirements.md`
- 判定基準（依頼どおり）：P1 DDD／P2 TDD・検証の結び付け／P3 正本source／P4 template／P5 証拠で閉じる・review／P6 上流backflow・最小変更（工程の仕組みに限る）。そのどれかを直接強制し、かつ欠けると2026-10-10に記録された失敗が起きるものを yes とする。
- 記録された失敗（`docs/governance/decisions/rollback-to-requirements-closure-po-decision-2026-10-10.md` 25–36行）：
  - **F1**：domainの用語から名前・構成を決めていない（DDD／TDDが守られていない）
  - **F2**：JSON正本・HELIX-JSONが守られていない
  - **F3**：設計・検証template seedが使われていない
  - **F4**：reviewが件数とSHA-256の一致だけでmergeしていた
  - **F5**：開発規律の要求が1.0の範囲から漏れていた
- 判定の扱い：主な機能がP1–P6に当たり、F1–F4のどれかに直接効くものを **yes** とした。主な機能は別（Reverse／legacy取込、記録・投影、CI運転、runtime）だが、F1–F4に効く拘束条項を含むものを **unsure** とした。どちらにも当たらないものを **no** とした。
- 注記：L2本文の状態欄には今も「未採択／`registered_proposal`」と書かれている節が多い。採択状態は判断記録と下記addendumから読み、本文の欄からは推定していない。本書は承認を生成しない。

## 0. 件数照合（addendum）

`docs/governance/audits/requirements-stage/implementation-order-addendum-2026-10-03.json`の`records`のうち、`version_class == "版未指定"`のものは**62件**だった（同ファイルのsummary `"版未指定": 62`とも一致）。依頼の62 IDと集合は**完全に一致**し、不足・余分はなかった。

- HELIXOS-L2-001の登録は`MPR-RC-HELIXOS-L2-001-001`で、source節は**O:515–532「要求正本を更新する管理条件」**である（行54の表行ではない）。判断行は`po-decision-2026-10-03-additions10.md#L33`の「HIL-NFR-32六条件に対応する受入追補」。
- addendumの`source_section_line_start`は、62件すべてでa25b8cf0の見出し行と一致した。
- 最新の登録revisionが001でないもの：058-002、067-002、068-002、072-003、077-002、078-003、080-002、081-002、083-002、084-002、087-002、OS101-002、OS118-002、OS119-002、OS122-002、OS125-002、OS128-003、OS129-002、OS130-002、OS131-002、OS132-003。

---

## 1. HELIX-HARNESS（版未指定採択 28件）

| ID | 題名 | 判定 | 該当 | 根拠（L2本文 file:line・引用） | 防ぐ失敗 |
|---|---|---|---|---|---|
| HARNESS-L2-048 | 役割型と対象による命名・安全なrename | **yes** | P1, P2 | H:1060「`Manager/Helper/Util/Data`等の責務不明名は根拠のある役割・consumer・期限付き例外が無ければfinding候補とする」／H:1061「test oracleはdomain object＋operation＋oracle IDへbindし、private実装名だけをoracle identityにしない」 | F1（helper/private/stage1名）。PO記録でも名指しで1.0漏れ（F5） |
| HARNESS-L2-050 | レイヤ台帳リファクタリング証跡 | **yes** | P1, P2, P6 | H:1101「ledger重複、責務混在、semantic/name collision、変更波及、孤立edgeを個別に確認し…externalize/commonize/objectize/semantic-rename/split/mergeの候補操作と根拠を記録する」／H:1103「必要な比較情報が欠ける間はbehavior-preservingと判定せず」／H:1105「要求または公開contractの意味変更は…Redesignへ戻す」 | F1（構造・命名の混在）、根拠のない構造変更 |
| HARNESS-L2-051 | 工程終了evidenceの対応 | **yes** | P5, P2 | H:1118「下位stageのpassや証拠の存在だけから上位stageの成立を推定しない」／H:1120「必要なpair/oracle/evidenceが欠ける場合はstageを未完またはunknownに保つ」 | F4（証拠の存在だけで完了扱い） |
| HARNESS-L2-052 | canonical commandの意味identityと再送判定 | no | — | H:1133「canonicalization commandのidentityは、呼出し側のcommand ID、操作scope、対象base revision、正規化した意味payloadのdigestを結んだもの」。command冪等性・conflict分類が主機能で、依頼の「event identity」除外類型に当たる | （F2に直接効かない） |
| HARNESS-L2-053 | 意味revisionとpath非依存asset identity | **yes** | P3, P1 | H:1141「path・名称の変更から独立したimmutable asset IDとrevision履歴を保持する。意味変更を新revisionとして記録し、rename、move、split、merge、supersedeに伴うidentity/location履歴、authority、acceptance oracle、typed edgeの欠落を識別」 | F1のrename時にoracle・traceを失うこと、F2（revision identity） |
| HARNESS-L2-055 | 隣接層の双方向trace gate | **yes** | P2, P6 | H:1167「上位義務が下位へ追跡され、下位で得た発見が上位へ戻る双方向の関係を照合し、scopeごとの未解決 descent と backflow を別に見える結果として提示」／H:1168「一方向だけ成立しても双方向の成立へ推定しない」 | F1（設計から降りない実装）、F4 |
| HARNESS-L2-056 | canonical V-pair gateとfeedback | **yes** | P2, P5 | H:1175「pairの片側設計義務または検証証拠がない、設計側と検証側のoracle identityが一致しない、もしくは必要なoracleの実行結果がない場合、該当pairを完了・green扱いにしない」 | F1（TDD）、F4 |
| HARNESS-L2-057 | closure gateの意味条件 | **yes** | P5 | H:1185「merge済みやCI greenだけからoracle合格やIssue closeを生成せず」／H:1183「PR、CI、独立audit、選択済みstyleへのmerge、oracle、子Issue状態は互いに別の入力・証拠として識別し、一つの状態から他を推測しない」 | F4 |
| HARNESS-L2-058 | PR findingの六分類とcurrent/successor判定 | **yes** | P5 | H:1196「`current_pr_fix`と`successor_issue`の区別には、severityでなく現行contractへの影響と責務境界を使う」／H:1197「`false_positive`には別verifierによる反証と独立reviewを要する…必要証拠が不足するfindingは確定分類せず`disposition_pending`のままにする」 | F4（findingの分類・処置なしのmerge） |
| HARNESS-L2-059 | Issue contractの意味fieldと必須存在 | unsure | P2（部分） | H:1207「`objective`、`acceptance oracle`、`development style`…`affected layers`…`digest`」の11 field／H:1208「個別field omissionを不成立とする」 | （下記の緊張を参照） |
| HARNESS-L2-060 | 工程入力revisionと段階証拠の対応 | **yes** | P5 | H:1216「結果は対象scopeと入力revisionが一致する場合に限って当該stageの証拠として解釈できる」／H:1217「stage証拠の存在だけで工程完了、pair-freeze、requirement approvalまたは下流実行を成立扱いしない」 | F4（revisionのずれた証拠で閉じること） |
| HARNESS-L2-062 | baseline debtと新規debt ratchet | unsure | P5（部分） | H:1233「new debtが比較で得られた場合、ratchet結果を成立/passとして返さない（fail-close）」／H:1234「閾値やdebt種別も追加しない」 | （下記の緊張を参照） |
| HARNESS-L2-063 | source-authority bindingとfreeze closure | **yes** | P3, P4, P2, P5 | H:1241「原sourceとauthorityを個々のatomへ結び…全typed edgeとacceptance oracleの閉包、change/stale receipt、template gapの独立review前active禁止」／H:1243「必須入力revisionの変化後は旧receiptを現revisionの有効証拠に使わない」／H:1244「自己review、作成側の自己承認…からの昇格は不成立」 | F2、F3、F4 |
| HARNESS-L2-065 | adapter operationの取消・lock failure結果 | no | — | H:1265「cancelled terminalとして返す時点で当該runに帰属する実行processの残存は0件」／H:1266「lock競合・timeout failure…partial transaction…を残さない」。adapterとruntimeの話 | — |
| HARNESS-L2-067 | 選択source scopeのatomic behavior分解 | no | （P5条項は付随） | H:1284「sourceに根拠があるbehaviorを一つずつ独立atomとして表し」。主機能はReverseの観測とatom化。stale childがある間はcoverage completeと表示しない条項はあるが付随的で、F1–F4の場面ではない | — |
| HARNESS-L2-068 | Design Refactorの独立変換計画と実施前rollback根拠 | **yes** | P1, P6, P2 | H:1302「semantic renameは名称の文字列類似だけで判断しない…意味が同じで名称だけが異なるものは同義名として統一候補にし、名称が同じでも意味が異なるものは別の概念として分離候補にする」／同行「最小の意味変更を計画し」／H:1310（HIL-NFR-24原文）「『将来使えそう』『綺麗になる』という推測や名称の文字列類似だけでrename、共通層、base class、汎用object…を増やさない」 | F1（helper・共通層の乱立） |
| HARNESS-L2-072 | 選択pairのstale revision・異snapshot・deferredを非green | **yes** | P5, P2 | H:1355「edge endpointがpairの対象revisionに対して古い／superseded semantic revisionを指す場合、そのpairを成立・currentとして扱わない」／H:1356「target revision…またはoracle identityが一致するだけではsnapshot同一性を代替しない」 | F4（識別子が一致するだけでgreen扱い） |
| HARNESS-L2-077 | source条件からdesign-obligation graphを閉じる | **yes** | P2, P4, P1, P5 | H:1321「source/directive→requirement atom→capability/service→domain object→API/data/state/…/test oracle/gateの双方向relation」／H:1330（HIL-NFR-26原文）「文書、template、見出し、入力欄の存在だけを設計完全性とみなさない…`TBD`、空欄、範囲表記、1行での複数義務消込を拒否する」／H:1323「1件でもあれば該当scopeのpair-freezeを拒否する」 | F1、F3（形だけのtemplate）、F4 |
| HARNESS-L2-078 | typed requirement definition・active-scope binding・変更receipt | **yes** | P2, P3, P4, P5 | H:1341「stable requirement ID、immutable revision、source atom…acceptance oracle…template applicability、design obligationの13 field群」／H:1343「coverage行数、ID連番、requirement文書の存在だけを要件定義の設計完全性としない」 | F4（件数だけ）、F3、F2 |
| HARNESS-L2-079 | 画面prototype artifactとwalkthrough反復の証拠 | no | （P6条項は付随） | H:1366「screen ID、主要操作、遷移、state fixture、仮データ境界を実行可能なprototype artifactへ結ぶ」。主機能はサービス①（L2.5の画面試作）。L2へのdelta反映（H:1367）は既存012のBackflowに委ねている | — |
| HARNESS-L2-080 | agent adapterをHARNESS registryから再生成 | **yes**（注記あり） | P3 | H:1377「既存のHARNESS registry内容からその対象adapterを再生成できる…registryを使わず、別runtimeのmemory/rule、手編集adapter、前回生成物だけから再生成した扱いにしない」／H:1378「agentの要求・ruleのsource of truthはHARNESS registry側に置き、runtime固有のagent memory/rule siloを正本として使わない」 | F2（正本から生成していない）。対象はagent adapterだが、主機能は「registryから生成物を作る」というP3の型そのものである |
| HARNESS-L2-081 | source coverageの全量性と判断trace | **yes** | P5 | H:1390「文書名だけ、代表fixture、検索結果0件、単一包括requirementだけを100%の根拠にしない」／H:1391「source由来の各判断を根拠となったsource path/entry locator、entry digest、抽出時点へ再現可能に結ぶ」 | F4（偽の完全性証拠） |
| HARNESS-L2-082 | 選択source scopeの全child receiptをstale化 | **yes** | P5 | H:1401「extractor revisionの変更、または選択source snapshot内のsource差分が生じたとき、その選択scopeに含まれる全child receiptをstaleとして扱う」／H:1403「そのscopeの新しい照合が終わるまで過去receiptを現在のcoverageへ算入しない」 | F4（staleな証拠の再利用）。範囲はsource coverageに限る |
| HARNESS-L2-083 | Domain Objectの不変条件と依存方向 | **yes** | P1 | H:1414「identity/invariant/lifecycle/authorityの意味根拠がないpayloadをEntity/Aggregateにしない…Value Objectを使う場合はimmutable…Query operationを使う場合はside-effectを持たせない…domainからAdapter境界へ依存する設計役割を使う場合はPortを介す」 | F1（七大原則③のDDD） |
| HARNESS-L2-084 | Requirement TranslatorとTemplate Improvement Loopの原文・確信度・ambiguity | **yes** | P4, P3 | H:1424「原文の主語はRequirement TranslatorとTemplate Improvement Loopの両方…原文の上書き、原文が見えない状態での確定を許さない」／H:1426「subagentは提案として…選択肢を示してよいが、その提案だけで元の要求identity・原文・意味・authority・terminal stateを変更してはならない」 | F3（templateの改善ループ）、F2（原文正本） |
| HARNESS-L2-085 | 重複contract/exampleのcontext cost・drift risk finding | unsure | P4周辺 | H:1450「contract/exampleが過剰に重複し…その重複関係をcontext costとdrift riskのfindingとして示す」／H:1452「重複だけを理由に削除・統合を命じない」 | （下記の緊張を参照） |
| HARNESS-L2-087 | ZIP docgen metadataからHELIX契約への変換 | no | — | H:1530「ZIPのagent metadata、spec ID、trace、impact…detector結果を入力にし、各fieldを個別にHELIX契約候補へ変換」。legacy取込の変換unit | — |
| HARNESS-L2-088 | 全source authorityから機能単位の採否記録まで閉じる | no | — | H:1506「現行HELIX、ZIP、前身repositoryのexact 2件をscopeに含める…各機能のdispositionをadopt、harden、redesign、rejectのいずれかで記録」。旧資産棚卸し（inventory-first）の比較機能で、P1–P6にもF1–F4にも直接当たらない | — |

## 2. HELIX-OS（版未指定採択 33件）

| ID | 題名 | 判定 | 該当 | 根拠（L2本文 file:line・引用） | 防ぐ失敗 |
|---|---|---|---|---|---|
| HELIXOS-L2-001（rev -001、O:515–532） | 要求正本を更新する管理条件（HIL-NFR-32六条件） | **yes** | P3, P5 | O:528「互換Markdown・旧shadow・Issue本文から現行JSONを再生成して最新要求を巻き戻さない」／O:526「生成view・DB・receiptの整合を確認できる。部分更新を現行正本として公開しない」／O:529「契約文書やCLI名の存在だけで更新可能と表示せず、正規経路の実行結果・before／after revision・receiptへ辿れる」 | F2（JSON正本）、F4 |
| HELIXOS-L2-053 | canonicalization artifact群の原子的確定と失敗隔離 | unsure | P3（部分） | O:1246「Markdown上のcanonical本文／asset revision、event ledger、trace、impact、stale propagation状態、projection、operation receipt」／O:1247「部分更新を成功canonicalとして提示しない」 | （下記の緊張を参照） |
| HELIXOS-L2-054 | Closure Gate証拠照合・close運転のHARNESS handoff | **yes** | P5 | O:1257「PR、CI、audit、merge、child Issueの状態を互いの代理証拠にしない。CIは新世代で未構築のため、必要なCI証拠がなければunknownとして運転を保留し、旧CIで補わない」／O:1258「HARNESS結果がない、証拠が欠落、またはscope/revisionが不一致ならcloseしない」 | F4（HARNESS-057のOS側の対） |
| HELIXOS-L2-055 | ready Issue claimと実装開始前の工程照合 | unsure | P2（部分） | O:1268「適用が確定した工程が未完了ならclaimを拒否する」／O:1270「適用工程が未完了ならclaimとtool起動を拒否する」 | （下記の緊張を参照） |
| HELIXOS-L2-101 | PR finding dispositionの証拠receiptと異議連結 | **yes** | P5 | O:1279「non-actionable四分類…によって元findingを削除・不可視化・終端化しない。append-only receiptとappeal/reopen参照を残す」／O:1280「false_positive receiptは別verifierの反証と独立reviewを結ぶ」 | F4 |
| HELIXOS-L2-102 | HARNESS Issue contractのdurable intake・projection・handoff | no | — | O:1290「11 fieldのfield identity、version、digestを対応付けてdurableに保持・参照」。取込と投影の運転 | — |
| HELIXOS-L2-103 | 工程stage eventと状態projectionの因果記録 | no | — | O:1299「stage eventを…append-onlyの証拠として保ち…current stateへ投影」。eventの記録で、除外類型に当たる | — |
| HELIXOS-L2-104 | 操作authority・実行隔離・品質受入の独立記録 | no | — | O:1309「品質oracleの成立からauthorityまたは隔離を推定しない」。主機能はSECURITY・Worker・HARNESSの結果を記録上で結ぶこと | — |
| HELIXOS-L2-105 | incident episodeの復旧証拠相関 | no | — | O:1319「回復確認結果…procedureの記録…rollback記録を関連付ける」。incident復旧で、除外類型 | — |
| HELIXOS-L2-106 | authority binding参照先の再帰検査 | unsure | P3（部分） | O:1330「target ownerが当該targetを失効・互換・履歴状態として示す場合、そのtargetへのcurrent edgeを有効なauthority参照として扱わない」 | （下記の緊張を参照） |
| HELIXOS-L2-107 | finding taxonomy/mappingのrevision-pinned handoff | no | — | O:1341「mappingに明記されたdestination referenceをfindingに結び付け、既存owner/workflowへhandoff」。findingの振り分け運転で、分類・処置の証拠条件は持たない | — |
| HELIXOS-L2-108 | artifactからconsumerへの逆向きgraph | no | — | O:1351「各artifactから宣言consumerを逆引きできること」。参照graphの投影 | — |
| HELIXOS-L2-109 | source-to-consumer provenance chain | unsure | P3（部分） | O:1361「source identity/revision/digest、generator identity/revision、generated artifact identity/revision/content digest、およびconsumer identity/revisionを関係付きで特定」／O:1363「選択されたsource-to-consumer relationの記録結合に限り…generatorの実行/検証…を定めない」 | （下記の緊張を参照） |
| HELIXOS-L2-110 | semantic epoch変更後のactive consumer digest pin差分 | unsure | P3, P5（部分） | O:1373「consumerが旧epochをcurrent decision inputとして読む関係が明示される場合…`SEMANTIC_EPOCH_DRIFT`の候補findingとして示す」 | （下記の緊張を参照） |
| HELIXOS-L2-111 | 三つの独立receiptのAND結合 | unsure | P5（部分） | O:1385「aggregateを`green`とするのは、上記三つの独立receiptがすべて明示的に`green`を返す場合だけ」／O:1384「Issue番号は旧source上の参照ラベルであり…exact mappingは未確認のため推定しない」 | （下記の緊張を参照） |
| HELIXOS-L2-113 | GitHub監査の決定的規則とsemantic findingの境界 | unsure | P5（部分） | O:1412「決定的規則の判定はNode gateが行い、semantic modelの結果で変更・置換しない。semantic findingだけを、対象scope/model revisionに対応する評価根拠が明示されたmodelへ委譲する」 | （下記の緊張を参照） |
| HELIXOS-L2-115 | 終端runへの遅着Worker結果を受理しない | no | — | O:1450「終端後に到着したresultは…canonicalなaccepted stateとしてcommitされず」。Worker運転 | — |
| HELIXOS-L2-117 | 選択event generation identityの個別検査 | no | — | O:1439「`event class`、`PR ID`、`HEAD`、`run ID`、`attempt`の一つずつの欠落または改変を個別fixtureにし」。event identityで、除外類型 | — |
| HELIXOS-L2-118 | 検証義務を保つrun置換・終端証拠 | no | （P5条項は付随） | O:1462「required verificationの削減、cancelled runの成功扱い…を高速化として認めない」。主機能はCI runの並走・置換の運転 | — |
| HELIXOS-L2-119 | Codex・Claude協働episodeの圧縮とcontinuity分離 | no | — | O:1474「進捗、再開位置、未完義務、停止理由は`HELIXOS-L2-019`のepisode continuationへ保持」。memoryとcontinuityの扱い | — |
| HELIXOS-L2-120 | Agent instance lifecycleのoutcomeと終端の分離 | no | — | O:1504「`registered→eligible→mustered→leased→running→checkpointed→completed/failed/cancelled→verified→released`」。agent lifecycleで、除外類型 | — |
| HELIXOS-L2-121 | HIL-BR-12 intakeとstyle接続 | no | — | O:1487「(1)HARNESSの選択済みdevelopment style、(2)…case-driven activation条件、(3)必要なspecialist capability、(4)…再接続する…工程位置を別々の意味として保持」。取込とassignment | — |
| HELIXOS-L2-122 | owner間副作用の冪等な引継ぎ | no | — | O:1514「二つ目のIssue、実装効果またはmemory昇格を作らない」。冪等性の運転 | — |
| HELIXOS-L2-123 | HIL-BR-14 source authority・atomic disposition・trace | no | — | O:1529「ZIP、前身repository exact 2件…current advertised `heads/tags/pull` ref authority」。旧資産棚卸し（HARNESS-088と同じ類型） | — |
| HELIXOS-L2-124 | 旧五機能の判定結果・failure code・provenance接続 | unsure | P5（部分） | O:1543「成功結果も…適用oracle・観測結果のprovenanceと結び、説明文だけを合格根拠にしない」／O:1542「『PR監査』『Issue Gate』『agent registry』『memory compaction』『ZIP detector』は五つの別々のsource role」 | （下記の緊張を参照） |
| HELIXOS-L2-125 | Worker結果境界のfail-close | no | — | O:1553「不正JSON、適用schemaとの不一致…Worker crash、timeout…の場合…成功・完成扱いされず」。Worker結果の回収 | — |
| HELIXOS-L2-126 | 失効後fencingとdurable checkpoint再開 | no | — | O:1562「agent leaseが失効した後は…tool call、artifact、completionをそれぞれ拒否」。lease・runtime | — |
| HELIXOS-L2-127 | 選択されたCI依存段間のreceipt lineage | unsure | P5（部分） | O:1595「同じgreen表示だけ、別commit/treeのgreen、または依存関係のないrun receiptは選択された後段の依存証拠にならない」 | （下記の緊張を参照） |
| HELIXOS-L2-128 | quarantine対象の変更時の失効 | no | — | O:1576「対象変更」でquarantine eligibilityを引き継がない条件。CI quarantineの運転 | — |
| HELIXOS-L2-129 | worker runtimeのquota/rate状態とlane退避 | no | — | O:1625「quota枯渇またはrate制限を報告したとき…queue holdまたは代替runtimeへのrouting proposal」。quotaで、除外類型 | — |
| HELIXOS-L2-130 | docgen source・採否・要求traceの管理projection | no | — | O:1643「明示されたZIP source identity/revision/digest…HARNESS-L2-087候補の変換contract」。legacy取込（087の対） | — |
| HELIXOS-L2-131 | Worker operationでのgenerated pack・agent authority境界 | no | （P5条項は付随） | O:1657「作成主体による自己検証、制限のないagent増殖…があるとき、影響するoperationの該当actionは進まず」。主機能はpackとagentの実行authorityで、agent・runtimeの類型。自己検証の禁止はreview規律に近いが、範囲はpack／agentを使うoperationに限る | — |
| HELIXOS-L2-132 | HELIXのBun恒久不使用と一回限りの移行完了の再現性 | no | — | O:1666「Bunを使用せず、新たな使用や再導入をしない」。toolchainの禁止で、除外類型 | — |

## 3. HELIX-BRAIN（版未指定採択 1件）

| ID | 題名 | 判定 | 該当 | 根拠 | 防ぐ失敗 |
|---|---|---|---|---|---|
| HELIXBRAIN-L2-031 | 役割型の再利用知識 | unsure | P1（知識の供給） | B:592「role term候補（Entity、ValueObject、Aggregate、DomainService、Policy…Repository）について、意味、役割の違い、適用条件、反例、根拠を再利用知識として表現する」／B:593「HARNESS側が対象への適用・命名decision・例外を判断する。BRAINは特定の命名表…test oracle対応、rename操作を所有しない」 | （下記の緊張を参照） |

## 4. Routing条件（HARNESS-L2-001〜009）

L2本文は表の1行（H:52–60）と「工程規則として保持する具体条件」表（H:98–121）にある。

| ID | 題名（要旨） | 判定 | 該当 | 根拠 | 防ぐ失敗 |
|---|---|---|---|---|---|
| HARNESS-L2-001 | L1–L12と正規V-pairで工程を構成する | **yes** | P2 | H:52「企画・要求・L2.5（Prototype・PoC）・要件・設計・実装・検証をL1–L12と正規V-pairで構成できる」「L2要求とL11受入、L3要件とL10総合検証を混同せず、各層の成果と対が分かる」／H:99「正規pairはL1↔L12、L2↔L11…L6↔L7」 | F1（TDD・対の欠落） |
| HARNESS-L2-002 | 開発方式の選択と合成 | unsure | P2（不変条件） | H:53「どの組み合わせでも、L1–L3と人の要件承認、V字の対、品質条件を落とさない」／H:102「方式の未選択と適用条件不成立のfail-close」 | （下記の緊張を参照） |
| HARNESS-L2-003 | 工程の開始・凍結・差戻し・再開・完了の条件 | **yes** | P5, P6, P2 | H:54「実行成功だけで工程完了にならない。成果物の状態を、前の状態の成立から推定しない」／H:108「L6↔L7でRed→Green→Refactorと双方向traceを閉じる」／H:111「右側が左側のauthorityを黙って書き換えない」／H:109「局所のRefactorは、public contract、要求、architectureの意味、stateの意味を変えない」 | F4、F1（TDD）、上流の黙った書き換え |
| HARNESS-L2-004 | 要求→設計→テストの対応と再検証範囲 | **yes** | P2, P6 | H:55「上下流traceとV-pairの欠落を識別し、変更した要求が検証から落ちない」／H:114「要求変更・public contract変更・設計trace欠落等の際は、影響する設計と対検証へ差し戻す」 | F1（TDDの結び付け） |
| HARNESS-L2-005 | 検証義務・証拠条件の導出とCI組立規則 | **yes** | P2, P5 | H:121「検証条件には対象要求revision、成果物、入力、oracle、expected failure、実結果、証拠の有効期限、差戻し先を含める…unknownをskipへ変換しない。CI成功・画面表示・文書登録だけを利用者受入や全工程完了の証拠にしない」 | F4 |
| HARNESS-L2-006 | 外部利用者がサービス単位で導入・利用する | no | — | H:57「外部利用者が、サービス①〜⑦の単位で提供範囲・版・必要依存・導入条件…を確認し、必要なサービスを選んで導入・利用できる」。製品の提供 | — |
| HARNESS-L2-007 | HELIX-HARNESS製品群Version 1の完成確認 | unsure | P5（部分） | H:58「HELIX自身のプロジェクトにも適用した結果と、Conceptの1.0土台7項目が全機構で共通に成立していること…を含めて…Version 1の完成を確認できる」「性質の異なる対象で要求から受入・運用評価までの成立証拠を確認」 | （下記の緊張を参照） |
| HARNESS-L2-008 | 要求エンジン（質問、1次・2次形成、Backflow、収束） | **yes** | P6, P3（部分） | H:59「L2.5のPrototype・PoCの結果をBackflowで還流して2次形成する…要求化漏れ・企画外追加・矛盾・重複・過剰解釈・対象違い・scope／non-goal逸脱・変更影響を提示」「意味導出の基盤は、HELIX-JSONの各JSONの間の意味をつなぐPythonコアとし…（HELIX-JSONの構築とPythonコアは改善要求として扱う）」 | F2（HELIX-JSON。ただし同じ行でJSON基盤は改善要求として扱うとしている）、上流への還流漏れ |
| HARNESS-L2-009 | versioned Design Templateから設計義務を導き、不足をBackflowする | **yes** | P4, P6 | H:60「versioned Design Templateから必要な設計義務を導き、templateが必要とする要求入力の不足を質問・要求候補としてBackflow ticketで上流へ戻せる」「初期seedを参照して設計の恣意性を抑え」／H:116「下の構造の設計を束ねただけで上の構造の設計義務を満たしたとしない」 | F3（template seedを使っていない）。PO記録で1.0漏れと名指し（F5） |

---

## 5. 集計

### 版未指定採択 62件
| 判定 | 件数 | 内訳 |
|---|---|---|
| yes | **22** | HARNESS 19、OS 3、BRAIN 0 |
| unsure | **13** | HARNESS 3、OS 9、BRAIN 1 |
| no | **27** | HARNESS 6、OS 21 |

### Routing条件 9件
yes **6**（001、003、004、005、008、009）／unsure **2**（002、007）／no **1**（006）

### yes一覧（62件中22件）
- **HARNESS（19）**：048、050、051、053、055、056、057、058、060、063、068、072、077、078、080、081、082、083、084
- **OS（3）**：HELIXOS-L2-001（rev -001、O:515–532）、054、101
- **Routing（6）**：HARNESS-L2-001、003、004、005、008、009

失敗ごとの直接の担い手：
- **F1（DDD・命名・TDDの結び付け）**：048、083、068、050、053、077、055、056、L2-001、L2-004
- **F2（JSON・正本）**：OS-001（rev -001）、063、078、080、084、L2-008（部分）
- **F3（template）**：L2-009、063、077、078、084
- **F4（件数・SHAだけのreview、証拠で閉じる）**：057、OS-054、058、OS-101、051、060、072、081、082、L2-003、L2-005

### unsure一覧と緊張点
| ID | 緊張 |
|---|---|
| HARNESS-L2-002 | 主機能は開発方式の選択と合成で、P1–P6のどれでもない。一方で「どの組み合わせでも…V字の対、品質条件を落とさない」（H:53）というP2の不変条件を持つ |
| HARNESS-L2-007 | Version 1完成の判定条件（製品範囲の判断）である。一方で「HELIX自身のプロジェクトにも適用した結果」と「成立証拠」（H:58）を完成の条件にしており、製品全体の水準でP5に当たる |
| HARNESS-L2-059 | 作業単位（Issue）の形式契約である。一方で`acceptance oracle`と`affected layers`の欠落を拒否する（H:1207–1208）ので、作業を検証へ結ぶP2の入口になる。ただしoracleの中身の妥当性は「定義しない」（H:1208） |
| HARNESS-L2-062 | new debtをfail-closeする品質のratchet（H:1233）。ただしdebtの分類・閾値を「追加しない」（H:1234）ため、命名違反などのF1をdebtとして捕まえるかは本文から決まらない |
| HARNESS-L2-085 | template portfolio（041／043／044）の重複をfindingとして示すので、P4に近い。ただしfindingを示すだけで、gateもtemplate利用の強制もない（H:1452「重複だけを理由に削除・統合を命じない」）。F3（template不使用）は防がない |
| HELIXOS-L2-053 | canonical更新の原子性と部分更新の非公開（P3に関係）を担う。一方で主機能は保存・transactionの運転である。さらに本文の対象が「Markdown上のcanonical本文」（O:1246）で、JSON正本・Markdown生成（2026-09-25 PO判断）を強制する条文ではない |
| HELIXOS-L2-055 | 未完の工程（Reverse／Redesign／pair-freeze）があれば実装の開始を拒否する（O:1268, 1270）。設計が先、実装が後というP2の強制に当たる。一方で、仕組みはWorkerのclaim・lease（除外類型のworker scheduling）である |
| HELIXOS-L2-106 | 失効・互換・履歴状態のtargetを現行authorityとして扱わない（O:1330）。旧shadowを正本扱いしないというP3に当たる。ただし判定はtarget ownerの提示に依存し、記録・検査に留まる |
| HELIXOS-L2-109 | source→generator→generated artifact→consumerのdigest chain（O:1361）で、P3の「registryから生成」の追跡に当たる。ただし「記録結合に限り…generatorの実行/検証…を定めない」（O:1363）ため、生成を強制しない |
| HELIXOS-L2-110 | 旧epochをcurrent decision inputとして読むconsumerをfindingにする（O:1373）。P3（revision identity）とP5（stale）に当たる。ただし範囲は文書census由来の検出に限られ、gateではない |
| HELIXOS-L2-111 | 「三つすべてgreenのときだけaggregate green」（O:1385）はP5の型である。ただし対象は旧DACの特定3 receipt（#825／#1370／Census）に限られ、現行identityとの対応は「未確認」（O:1384） |
| HELIXOS-L2-113 | 決定的規則とsemantic findingを分けるreviewの構造（O:1412）。F4（決定的な照合だけでmerge）に関係する。ただしsemantic reviewの実施や処置を必須化する条文はなく、責務境界の規定に留まる |
| HELIXOS-L2-124 | PR監査・Issue Gateの結果について「説明文だけを合格根拠にしない」（O:1543）のはP5である。ただし主機能は旧五機能の結果とprovenanceを記録上で結ぶことである |
| HELIXOS-L2-127 | 「同じgreen表示だけ、別commit/treeのgreen…は依存証拠にならない」（O:1595）はP5（staleな証拠の拒否）でF4に近い。一方で主機能はCI運転のreceipt lineageであり、新世代CIは未構築である |
| HELIXBRAIN-L2-031 | P1の語彙（ubiquitous language・glossary）を供給するが、強制はしない（B:593「HARNESS側が…命名decision…を判断する」）。強制側は048である。048の型語彙は旧sourceを起点にしており（H:1060）、031が無くても048は成り立つ |

## 6. 補足（事実のみ）
- PO記録（rollback decision 34行）が1.0漏れとして名指ししているのは**HARNESS-L2-048**と**HARNESS-L2-009**である。本分類では両方ともyesになった。
- no 27件のうち、P5に近い付随条項を持つもの（HARNESS-067、OS-118、OS-131）は表中に「付随」と明記した。境界を厳しめに引いた箇所なので、POの確認対象に加えられる。
- L11受入節は参照しなかった。判定はL2本文だけで決まった。
