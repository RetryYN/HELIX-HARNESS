# 要求段階の想定対応順序（候補案）

## 目的と状態

本案は、現行L2 candidate identityを削除・統合・採択せず、対応順だけを提案する。実際に順序付ける本体1.0候補は214件である。LABO-031/032/042は別個の条件付きWeb/WEB-OS source candidate 3件として保持し、該当source contractが採用された場合のみ接続stageで扱う。以前「237件」と数えた集合は、この214件に条件付き3件およびsource routing container 20件（HARNESS-L2-001〜009、HELIXOS-L2-001〜011）を加えた混合集合だった。routing containerは個別の後継candidateではないためstageへ配属しない。全272宣言の内訳と機械照合は付属JSONに示す。各候補の最終採否・L1/L2の意味・L3要件の具体値は本案で確定しない。候補の順序は実装許可、release、tag、cutoverを生成しない。L1/L2のPO判断後、必要な具体要件はHARNESSの工程に沿ってL3で導出し、根拠と検証方法を持たせる。数値、許容差、予算、形式、実現可能性はL3でAIが候補を導出できる。未知のまま実運用を成功と判定することはできない。上流意味が変わらない技術値の通常導出に個別承認gateは設けない。

提案する順序は「契約と証拠の土台 → 最小の初回作業slice →（選択可能な早期投資枝と残りの基礎unitを並行）→ 判断の基礎 → 残る選択接続 → 構成体と閉ループ」である。Stageは実装作業の依存に沿った優先群であり、一律に前段すべての完了を次段の着手・運用条件とするgateではない。Stage 2aの最小sliceで、初回の要求確認→作業→検証→記録を早期に成立させる。その後は広い基礎unit展開を待たず、必要な契約が揃った狭いscopeでWorker支援・テスト生成の早期投資枝（Stage 2c）を選べる。

## 根拠と保持／変更

| 旧資産 | 照合箇所（旧source） | 保持する条件と本案での扱い |
|---|---|---|
| LEGACY-ASSET-201EED9C5D6D2FF4D41B | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requests.md:23-67`、SHA-256 `bf47d434930bd701d368a49b725d49b00a5af2f385b6e1436b294f7b47796e20` | 独立に追跡できる機能単位、正確な対象範囲、変更から検証・証拠へのtrace、依存順に基づく作業を保持する。現行案では旧Slice/Bundle/channel機構をそのまま復活させず、8機構のL2候補を明示配属する。 |
| LEGACY-ASSET-B75E46DBE77592351574 | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requirements.md:31-85`、SHA-256 `eb1a7747afacd607217ee9e1905f87e629354a023102c1f32521ff8a9bc54a17` | ownerの明示、依存関係、unknownを成功扱いしないこと、安全依存閉包、unit証拠とcomposite証拠の区別を保持する。旧Sliceの成熟度やchannel gateは現行候補へ移植しない。 |
| LEGACY-ASSET-67ADFAB856D954B3C5D2 | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-acceptance.md:32-59`、SHA-256 `bf3a5293a919a5b293ed5ac2c2f86a85539abbe7959ed9d66ea764922e868cee` | dependency trace、unknown fail-close、安全閉包、組合せ固有の受入を保持する。各stageの終了は対応identityの受入範囲に限定し、後続stageの構成体成立を推定しない。 |
| LEGACY-ASSET-50CA1C554747F12266D3 | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/resident-lane-orchestration-requirements.md:663-666`（RLO-FR-040）、SHA-256 `17bc83614d7f5f75b61831eb447a23ee706cb8a6d9e54477736e553ff956dcfd` | 未評価は`provider_default_unbenchmarked`相当として明示し、Bench scoreだけでscope・branch・assignment・merge権限を変えない。初回成功のみで配置能力を評価済みにしない。 |
| LEGACY-ASSET-437A6A68F9A9E0AE1B9E | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/resident-lane-orchestration-acceptance.md:43`（RLO-AC-030）、SHA-256 `63ac3d0fbc36f014977998f9073846bfc01e5d352e07c1e10d408f0eab0ad707` | scoreと運用authorityを分ける。人の配置案も、OSのassignmentを代行しない。 |
| LEGACY-ASSET-28FB139B26CD61CC51EE | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/helix-bench-evaluation.md:76-147`、SHA-256 `a1a5fea1fb89434fb025a9c0541f5cacb10ac9be66e97e7e7964975d2469b116` | task、oracle、evidence、version、比較条件の同一性と費用根拠を保持する。固定provider/modelや恣意的score閾値は導入しない。 |
| LEGACY-ASSET-A952A3A175EB82A4781B | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/helix-bench-evaluation-acceptance.md:26-45`、SHA-256 `6b5a72da16fe56130350b6e8b8fc2606cb8c90015ff73f34ffb3b93625a0c185` | 独立oracle、同条件cohort比較、cost provenance、重大failureを平均で隠さない受入を保持する。 |

対応順の新しい根拠は、`docs/governance/sources/requirements-stage-po-handoff-original-2026-09-27.md:24-42`（SHA-256 `48c272949a6212f7f4d5013a248d0492d047c04a04cbbf693427df385f955f18`）（同sourceが元のlocal goal file 183–208行を保存）である。8機構ごとの監査・消化を行い、続いて横断監査・消化を行う。横断監査では、候補を落とさず責務・境界・依存を確認し、「L3 matters」として数値・許容差・budget・形式・version・実現可能性等を特定する。Web 1.xは要求段階の必須土台へ混ぜない。

## 提案する対応stage

範囲表記は両端を含む。各IDはここに一度だけ配属し、各stage内の順序は依存方向を示す候補であって固定日程ではない。

| Stage | 対象ID（正本候補） | 件数 | 安定性・自走性・早期投資の理由 |
|---|---|---:|---|
| 1. 共通契約・authority・source/evidenceの土台 | HARNESS-L2-010, 011, 023; HELIXBRAIN-L2-007, 008, 028; HELIXLABO-L2-001, 011; HELIXSECURITY-L2-001〜016, 020, 028; HELIXINFRASTRUCTURE-L2-001, 006; HELIXCONNECT-L2-001〜005 | 33 | **安定性:** identity/version/scope/authority、依存区分、選択CONNECT、証拠と復旧の境界を先に定める。**自走性:** まだ実行の完成を要求せず、後続の作業・検証・記録が同じ契約を参照できる。**早期投資:** 初期からsource、version、oracle、provenanceを残すことで後の比較・再現に証拠を蓄積する。SECURITY能力は該当操作の保護に使い、全SECURITY機構の常時実装を各operationへ課さない。 |
| 2a. 初回の要求確認→作業→検証→記録に必要な最小slice | HARNESS-L2-022; HELIXOS-L2-015〜020, 023, 027; HELIXINTELLIGENCE-L2-010, 066; HELIXLABO-L2-055〜057; HELIXINFRASTRUCTURE-L2-003〜005, 009〜010; HELIXCONNECT-L2-006 | 20 | **安定性:** authority/portfolioからticket・assignment・attempt・検証・receiptまでのOS依存を明示し、選択した安全なresource/Worker境界を接続する。**自走性:** 初回作業の要求確認・ticket/assignment・限定実行・HARNESS検証・OS記録・LABO観測を、評価済み水準なしで接続できる。**早期投資:** 最初の実結果と失敗/unknownを記録し、後続の配置判断に使える証拠を早期に蓄える。OS-027は既決candidate経路としてこのsliceに置く。これは実run許可ではない。 |
| 2c. 初回slice後に選べるWorker支援・テスト生成の早期投資枝 | HARNESS-L2-030〜032; HELIXINTELLIGENCE-L2-068; HELIXOS-L2-028〜029 | 6 | **安定性:** 030/068の単体候補生成は既存設計/oracle・要求/scopeへ結び、実行や実相談のreceiptを候補生成の前提にしない。031の縮小確認はfailure sourceが実際に選ばれた操作だけ、032は選択executorへの接続だけを扱う。OS-028相談接続とOS-029構成体は既存ticket・assignment・budget・HARNESS oracleの契約を使う。**自走性:** Stage 2aで初回pathが使える状態になった後、軽量Workerへの事前test/指示支援または詰まり時の相談を小さな対象scopeで試せる。支援proposal単体、相談connection、検証・独立reviewまでのcompositeは別々に受入する。**早期投資:** 早い時点で作業者支援とtest準備を使い、後続の作業コストを下げる可能性を確かめる。HARNESS-033の回帰成立traceは必要な段階結果を待つStage 5に残す。Stage 2b/3全件の完了はこの枝の前提ではない。 |
| 2b. 残りの基礎unitと独立能力 | HARNESS-L2-012〜020, 024; HELIXOS-L2-014; HELIXBRAIN-L2-001〜006, 009〜012, HELIXBRAIN-L2-INFRA-001〜017, HELIXBRAIN-L2-029; HELIXLABO-L2-002〜010, 012〜030, 034〜035, 058; HELIXINFRASTRUCTURE-L2-002, 007 | 72 | **安定性:** Stage 1契約を使い、unitごとのowner・版・scope・oracleを独立に作る。Stage 2cの選択早期投資枝と並行でき、完了gateではない。**自走性:** 実環境の選択に必要な追加CORE/OS/Worker/INFRA/知識単位を整えるが、無関係なunitを初回pathの全体gateにしない。**早期投資:** 初回証拠と並行して能力を広げ、選択されたoperationが必要とする資源だけを前倒しできる。 |
| 3. INTELLIGENCEの基本判断（人代行契約は2aで先行） | HELIXINTELLIGENCE-L2-001〜009, 011〜016, 018〜020, 067 | 19 | **安定性:** Stage 1/2aで定義した要求・source・評価証拠を入力範囲にし、通常のモデル計算と独立した期待oracleを分ける。**自走性:** INTELLIGENCEは候補・配置案を返し、assignmentはOSの責務のままOSへ戻す。**早期投資:** 初回pathの人代行schemaを先に使えるようにした上で、モデル判断能力を必要scopeから拡張する。 |
| 4. 選択した機構間接続と結果受渡し | HARNESS-L2-026〜029; HELIXOS-L2-021〜022, 024; HELIXBRAIN-L2-018〜023, 030; HELIXLABO-L2-036〜041, 052, 054; HELIXINTELLIGENCE-L2-017, 030〜041, 044〜045; HELIXSECURITY-L2-021〜024, 026; HELIXINFRASTRUCTURE-L2-008, 025 | 44 | **安定性:** unit契約に対する選択済みconnectionを、入力・版・scope・receiptまでつないで照合する。**自走性:** 選択した業務経路でOS ticket→Worker→HARNESS検証→OS受入、および結果→LABO evidenceを成立させる。CONNECTは転送・互換・追跡を扱い、業務判断やassignment authorityを持たない。**早期投資:** scope内の結果を必要なconsumerへ届ける。内部順はproducer/consumer契約に従い、例えばBRAIN-022/023の知識・connector契約を先に照合してからHARNESS-026を結ぶ。LABO-031/032/042はWebまたはWEB-OS source/authority contractが選択・採用された場合の条件付きidentityとして別区分で保持する。 |
| 5. 全体構成体と閉ループ効果観測 | HARNESS-L2-021, 025, 033; HELIXOS-L2-025〜026; HELIXBRAIN-L2-024〜025; HELIXLABO-L2-050, 059〜060; HELIXINTELLIGENCE-L2-060〜063, 069〜071; HELIXSECURITY-L2-027; HELIXINFRASTRUCTURE-L2-011; HELIXCONNECT-L2-007 | 20 | **安定性:** 明示した構成member集合と組合せoracleでcompositeを検収し、unit passを全体成立と見なさない。HARNESS-033では通常のcontract-derived test pathと、failure inputが選択された場合の縮小・回帰pathを分ける。後者だけが縮小前後の同一failure、修正前fail、修正後passの結果を要し、通常case生成/実行へincident reproductionを要求しない。**自走性:** 初回runtimeの前提ではなく、統合対象ごとに計画案→OS割当→operation-scoped authority→Worker→検証/review→evidence→LABO比較を構成体として照合する。**早期投資:** すでに生じた結果・再作業・人修正・比較証拠を使い、構成体の効果と評価境界を確認する。初回成功だけでは評価済みにしない。 |

## 配属漏れ・重複の照合

候補集合は、現行L2のidentity表と機構別要求stage監査表を基準にする。Web/WEB-OS source contractに依存しない本体1.0候補の配属は次のとおり。LABO-031/032/042は別区分の条件付き3 identityであり、下表の本体件数にもstage件数にも加算しない。

| 機構 | 候補件数 | 配属確認 |
|---|---:|---|
| HARNESS | 24 | 010/011/023 (3) + 022 (1) + 012–020/024 (10) + 030–032 (3) + 026–029 (4) + 021/025/033 (3) |
| HELIX-OS | 16 | 015–020/023/027 (8) + 014 (1) + 021–022/024 (3) + 028–029 (2) + 025–026 (2) |
| HELIX-BRAIN | 40 | 007/008/028 (3) + 001–006/009–012/INFRA-001–017/029 (28) + 018–023/030 (7) + 024–025 (2) |
| HELIX-LABO | 47 | 001/011 (2) + 055–057 (3) + 002–010/012–030/034–035/058 (31) + 036–041/052/054 (8) + 050/059–060 (3) |
| INTELLIGENCE | 44 | 010/066 (2) + 001–009/011–016/018–020/067 (19) + 068 (1) + 017/030–041/044–045 (15) + 060–063/069–071 (7) |
| SECURITY | 24 | 001–016/020/028 (18) + 021–024/026 (5) + 027 (1) |
| INFRASTRUCTURE | 12 | 001/006 (2) + 003–005/009–010 (5) + 002/007 (2) + 008/025 (2) + 011 (1) |
| CONNECT | 7 | 001–005 (5) + 006 (1) + 007 (1) |
| **本体1.0計** | **214** | **33 + 20 + 6 + 72 + 19 + 44 + 20 = 214。重複配属0、未配属0。** |
| LABO条件付きWeb/WEB-OS source | 3 | LABO-031/032/042。各identityはcandidateのまま保持し、該当source/authority contractが選択・採用された場合だけstage 4で個別成立を照合する。別配属で、本体1.0件数へ含めない。LABO-042はWEB-OS専用feedbackであり、Web/WEB-OS採択はLABO 1.0の前提ではない。 |

sourceの全宣言は272件（機構別L2見出し250件＋旧routing declaration 22件）で、基準revision `d308f4080da298172001ef97e9c4b5f66d32ed7d` の[機械照合用JSON](implementation-order-assignments-2026-09-27.json)に個別identity・分類・stage・L2 source SHAを記録する。内訳は、本体1.0候補214件、LABO条件付きWeb/WEB-OS source 3件、後続版hold 33件、routing declaration 22件。routing declarationのうちHARNESS-001〜009とHELIXOS-001〜011の20件は旧source atomのrouting containerでありstage candidateではない。JSONではcontainer自身の現行ID、未完のsource-atom successor mapping、stage未配属を個別表示する。HELIXOS-012/013は残るrouting 2件で、LABOへの責務移管記録を保持するが、source atom単位のsuccessor被覆完了は主張しない。過去の237件という分母は、本体214＋条件付き3＋上記routing container20の混合集合だった。全宣言272件はJSONの`records_all_272`、旧237集合は`legacy_237_denominator`で個別照合できる。旧IRの153要求を含むsource atom被覆は別のlegacy carry-forward ledgerで追跡される（`docs/governance/legacy-requirement-carry-forward-policy.md:9-30,88`、SHA-256はJSON source manifest）。candidate配属214件の網羅を旧要求meaningの全移管・被覆完了とは言い換えず、routing containerをsuccessorへ1:1対応させない。未完atomは`preserved_pending_rehome`/pendingのまま残す。BRAIN-026/027、INTELLIGENCE-021〜026/042〜043/064〜065、LABO-033/051/053、INFRASTRUCTURE-012〜024/026、SECURITY-017〜019/025等33件の後続版候補は廃止せず、1.0順序と1.0の常時依存から外してversion holdに残す。BRAIN一般系列013〜017等、現行に存在しない番号は補完しない。SECURITY-026は1.0 Guard境界だけを含み、1.x semantic capabilityを1.0へ持ち込まない。Concept `docs/concept/helix-concept.md:96` とInfrastructure L1 `docs/helix-infrastructure/L1-planning/infrastructure-intent.md:54,75,95`（両方のSHA-256はJSON source manifest）を照合した。INFRASTRUCTURE 1.0 minimum 18 itemは最低範囲であり、要求数の上限にはしない。現在の12 candidate identityだけでその目標達成・要求被覆を断定せず、残りの意味atomは正本のlayer/ownerに従いpendingまたは要件導出へ残す。

### Stage配属と実行・受入の境界

このstage表はL2候補の対応・統合着手順であり、stage全件の完了receiptを次stageやoperationの一律前提にしない。依存を次の三層で扱う。

| 種別 | 条件 |
|---|---|
| 候補の実装依存 | 対象候補が他identityのschema・pack・producer outputを実際に使う場合、その該当契約を先に具体化してfixtureで接続する。例：Stage 2aのOS-027初回pathはOS-017〜020/023、INT-010/066の入力契約、HARNESS-022 oracle、LABO-055〜057記録経路を使う。Stage 2cを選ぶ場合は、支援proposalにはINT-068とHARNESS-022/既存ticket scope、相談にはOS-028のoperation authorityとOS-020実行経路、支援loop compositeにはOS-029の段階receiptを結ぶ。テスト準備はHARNESS-030、failure縮小は許可済みfailure inputがある場合にHARNESS-031、実行を選択する場合にHARNESS-032とOS-020または利用者CIを使う。stage 2b全件、INT通常runtime全件、他のconnection全件は依存にしない。 |
| 選択operationの実運用受入 | 実際に選んだ対象要求・revisionに承認済みL3要件、OS ticket/assignment、該当操作で有効なauthority/制約、対象scopeの利用可能resource/source、HARNESS検証oracle、必要なactor/review/evidenceが揃うこと。欠落した必須要素はそのoperationを保留するが、他stageの無関係なcandidateを待つ条件にしない。 |
| 構成体受入 | Stage 5等のcompositeを成立と主張する場合は、その構成member、接続、組合せ固有oracleとreceiptを揃える。これは構成体claimの条件であり、限定された初回operationを開始する前提ではない。 |

Stage 2aの作業では契約schema、fixture、差戻しとreceiptの道筋を先に揃える。Stage 2a後の優先枝には次の二案がある。AはStage 2b/3の基本unitを先に広げ、契約面の厚みを優先する。B（推奨）はStage 2cから選択scopeに必要な支援/test単体を前倒しし、必要な接続・compositeだけを実結果とともに続ける。Bは可能な低コストWorkerへの支援が後続作業の費用を下げる可能性を早く確かめるが、対象scopeを限定し、他の未完unitを安全保証済みと扱わない。Aは基盤の広さを先に得るが初回の支援/生成効果観測が遅れる。どちらも個別identity採択や実operation authorityを生成せず、条件が揃う候補から並行実装できる。fixtureのpassを実運用の成功・許可と取り違えない。実システムが対象operationに必要なresourceやpermissionをまだ持たない場合はそのscopeの実行を保留し、他の適格なscopeやfixture経路を続ける。個別parameter承認やstage完了gateは追加しない。

### Stage 2a後に選べる早期支援・テスト枝（Stage 2c）

Stage 2aの限定初回pathを成立させた後、広いStage 2b/3 unit展開の完了を待たず、必要契約が揃った小さなscopeで先行投資を試せる候補をStage 2cへ配属する。これは常に全6 identityを実装・起動する意味ではなく、候補作業の優先を示す。

| 枝 | 候補順と入力 | 実行/接続条件と戻り | tradeoff |
|---|---|---|---|
| Worker支援 | `HELIXINTELLIGENCE-L2-068`が承認済み要求/設計revision、`HARNESS-L2-022`の既存oracle、元Workerのticket/scopeまたは着手予定assignmentを受け、作業前test/指示案または入力failureに限定した診断案を返す。 | proposal生成は`HELIXOS-L2-028`実相談や`HELIXOS-L2-029`composite receiptを要しない。OSが実相談を選ぶ場合だけ、既存OS assignment/budget/authorityを使う`HELIXOS-L2-028`と`HELIXOS-L2-020`をつなぎ、responseを元Workerへ戻す。loopを成立とするclaimは`HELIXOS-L2-029`が実修正・HARNESS検証・独立review等の発生順のreceiptを確認する。 | 支援を基本unit全体より早く狭いscopeで使い、低コストWorkerの後続作業費を下げる可能性を試す。候補作成/consult handoffのみでは修正成功・費用削減を主張できない。 |
| テスト生成 | `HARNESS-L2-030`が選択した対設計/API/state/oracleからtest candidateを作る。failure入力を持ち、その縮小操作を選択するときだけ`HARNESS-L2-031`が段階縮小candidateを生成する。 | `HARNESS-L2-030`は`HARNESS-L2-014/022`とsource scopeを使い、実行receiptを生成前提にしない。031の同一failure確認では各縮小後のresultが必要であり、`HARNESS-L2-032`はOS-020または利用者CIを選択したrunに接続する。結果なしなら縮小確認/回帰成立は未完のまま保持する。`HARNESS-L2-033`はStage 5に統合traceとして残す。通常のcontract-derived test生成/受渡し経路ではincident reproductionを要求せず、failure inputを選んだ回帰経路を成立と主張する場合だけ、縮小前後の同一failure→修正前fail→修正後passの段階receiptを判定する。 | 作業前test候補を早く用意できる。fixtureやcandidate数だけで品質・実行成功・回帰成立を主張せず、選択した検証実行の負担を明示する。 |

基本unitを広く先行する選択肢は、契約/能力の範囲を先に厚くできるが、支援とtest生成による効果観測が遅れる。Stage 2cの先行枝は、適用oracle・authority・scope・必要な入力契約が揃う範囲だけ進められ、Stage 2b/3全件の完了をgateにしない。どの枝を優先するかは要件段階開始時に示す実装順tradeoffであり、既決の初回作業や人代行をPOへ再確認しない。実際に支援相談・test execution・failure reductionを選ぶかはoperation scopeの選択条件であり、未選択機能は未観測とする。

### Stage 2aの具体的な初回scopeと必要ID

順序設計用の初回scope例は、OS-027 L11の正常oracleと同じく、明示許可済みの非secret・非HELIX-restricted入力を読み、隔離先に取り消し可能な小さな成果物を一つ生成する作業とする。credential、外部network、database migration、deployment/releaseを含めない。これはL2 candidate依存を照合するためのscope例で、特定taskの実行許可や新たなPO選択ではない。実際に選ぶoperationがこのscopeと異なるときは、必要なsource/security/resource契約をそのoperationのL3要件と受入へ追加する。

| 役割 | 必要identityと区分 | 初回scopeに対する処置 |
|---|---|---|
| 共通契約のみ先行 | HARNESS-L2-010/011/023（Stage 1）、HARNESS-L2-022（Stage 2a） | versioned pack/call/依存区分を適用し、初回runのpair/oracle、検証、差戻し先を定義する。これらのschema/規則のfixture成立だけで実行を主張しない。HARNESSのrouting container 001〜009に含まれる旧要求atomは別ledgerでpending rehomeを維持し、本表は被覆済みと推定しない。 |
| 人代行の入力契約 | HELIXINTELLIGENCE-L2-010/066（Stage 2a） | INT-010のproposal schema/version/scope/provenanceを参照し、人が初回案を同じschemaへ記入する。INT runtimeやその出力は必要ない。人案はproposalのままで、OS assignment/authorityにはならない。 |
| OS側で初回実行に必要な実装 | HELIXOS-L2-015/016/017/018/019/020/023/027（Stage 2a） | 015/016のauthority・portfolio記録が017のworkflow依存を満たす。017がticketを作り、018がassignment/attemptを制御、019が結果/未完義務を保存、020が実際に選んだHARNESS oracleの検証を運転し、023がhandoffを結ぶ。027はこれらの結果を構成体として照合する。CIが未構築ならCI passを偽らず、実在する承認済み検証方法の証拠を022契約で判定する。 |
| Resource/安全実装 | HELIXINFRASTRUCTURE-L2-001（Stage 1 identity）、003/004/005/009/010（Stage 2a）; HELIXSECURITY-L2-003/007/008（Stage 1 candidate、operation適用時に実装確認） | 003は選択resourceがcompute/storage容量を持つこと、004はrunの状態/incident観測、005は成果を戻せる具体手段、009はOS作業stateとruntime resourceの対応、010はWorker operationへのsecurity authority/制約の適用を確かめる。SECURITY-003のproject isolation、007のWorker制約、008の操作別authorityが実operationで効くことを確認する。Stage 1のcandidate群が一括稼働済みとは扱わない。 |
| 結果記録 | HELIXLABO-L2-055/056/057（Stage 2a）、HELIXCONNECT-L2-006（Stage 2a） | 作業前は水準unknown/未評価を明示でき、作業後は成功・失敗・拒否・unknownをprovenance付きで取り込み、選択した受領接続のreceiptを残す。採用oracleが当該task/scopeに適用され実結果を評価するまでは成功runを評価済みにしない。 |

**実運用上選択された場合に限る依存：** initial scopeが本文どおりno-credential/no-networkなら、SECURITY-L2-005/006の外部credential/egress機能を全体実装gateにしない。ただし実行環境が禁止境界を実際に強制し、既存の操作別authorityが有効であることは必要である。外部sourceを入力に選ぶ場合はSECURITY-L2-001/002のsource trust/instruction isolationを追加し、credentialを使うなら005、networkを使うなら006と該当INFRA runtime pathを追加する。通常CI、restore/bootstrap、scaling、他のWeb consumer等を選ばない初回scopeにはINFRA-002/006/007/008やLABO-031/032/042を必須化しない。database/deployment/remote worker等へscopeを広げるときは、INFRA-002/003/005/009/010、該当SECURITY connection、CONNECTを含めた実際の依存をL3で導出し、L11 oracleへ結ぶ。

実taskはまだ本順序案で選定しない。要件/assignment時に対象requirement revision、入力sourceとclassification、worktree/output pathとrollback先、Worker capability/version、oracleとreviewer、期限・budget・停止条件を確定する。これらは該当L3で元要求に結び付けて導出し、未設定値のまま実runの成立を主張しない。人が既存OS-027のrun確認を担う条件は保持するが、追加のPO選択や技術parameterごとの個別承認を新設しない。

## 依存区分と接続方向

| HARNESS-L2-023に沿う区分 | 順序案での具体的な扱い |
|---|---|
| 常時必須 | 選択したoperationの入力に適用されるidentity、version、scope、source provenance、owner契約、必須receipt、該当操作のauthority/safety制約とHARNESSが定める検証義務。候補全体を常時起動する意味ではない。unknown/missingの必須条件を成功にしない。 |
| 特定操作時のみ | 書込み、build/CI、外部egress、restore/recovery、特定データ処理など、そのoperationが選択されたときだけ必要な権限・契約・INFRA/Security能力。操作に不要な実行許可を互換確認等へ要求しない。 |
| 選択入力元に応じ | 選択したOS ticket、HARNESS requirement/oracle、BRAIN Pattern、LABO Bench evidence、または採用済み外部sourceの型付き接続だけを有効化する。未選択sourceは「未観測」であり、失敗または肯定結果と見なさない。 |
| 参照のみ | 旧source、未選択Pattern、Web 1.x、後続version候補は背景・互換検討の参照に限り、実行契約や必須dependencyへしない。旧runtime/test/CLIは起動しない。 |

接続向きの候補は次の通り。SECURITYは対象operationの実行境界へ制約・authorityを渡すが、他ownerの業務判断を引き取らない。BRAINは知識を供給し、HARNESSが設計義務との対応・設計合成を担う。INTELLIGENCEのplan/proposalはOSに渡り、OSがticket/assignmentを発行する。Worker出力はHARNESS oracleで検証され、OSが検収・進行を判断する。検証済み結果とそのscope/version/receiptはLABOへ渡り、LABOが評価を行う。CONNECT receiptは配送の証拠であって、要求合意、実行許可、評価済み状態を生成しない。

## 初回・人代行・評価済み境界

Bench履歴がない場合も、低リスクの最初の作業へ進める経路を候補間で閉じる。INTELLIGENCE-066の人提出配置案はINTELLIGENCE-010の契約に沿うproposalであり、実行入力のscope/version/receiptを持たせる。OSはこれを受けて自身のticket/assignmentを発行する。人提出案自体はassignment、承認、権限付与にならない。OS-027はOS自身の実行責務を保った初回支援経路であり、未評価を拒否理由にせず、authority、安全、必須契約入力がunknown/missingなら実行開始を保留する。実行開始時に過去のassignment結果を要求しない。結果後のOS内handoffとLABO-057の結果受渡し/receiptを開始条件と取り違えない。

LABO-055/056は結果と評価状態を区別し、oracle、対象範囲、適用版、判定根拠が存在して実際に適用されたときに限り評価済みとする。oracleまたは比較範囲が未提示なら、成功runがあっても未評価のまま記録する。通常のINTELLIGENCE→OS→Worker→HARNESS検証の経路は、人代行経路の後でも既存責務のまま有効である。

L11 fixtureによる確認と実運用開始条件も区別する。fixtureは合成ID・合成結果でschema、版、scope、owner、未評価保持、未選択source、失敗時戻し先を確認できる。fixture成功は実運用許可ではない。実運用では対象要求と承認済みL3要件、OS発行assignment、該当operationのauthority、対象scopeに合う実source/resource、選択budget/停止条件、適用可能なverification oracleが要る。具体値は元要求を満たす根拠・検証方法を伴ってL3で導出し、人が合意すべき上流意味が変わる場合のみ該当ownerへ戻す。

## 初回slice後の優先順の判断材料

初回pathはStage 2aで成立させる既決候補として保持し、ここで再選択肢にしない。その後の候補投資順として次の二案を比較する。

- 選択肢A: Stage 2b/3の基礎unitを先に広げ、各domainの能力・契約の幅を先に整える。運用を広げるときの依存見通しは得やすいが、低コストWorker支援やcase準備の効果を観測する時期が遅くなる。
- 選択肢B（推奨）: Stage 2a後、Stage 2cから適用oracle・scope・authorityが揃う小さなWorker支援/test生成枝を選び、Stage 2b/3と並行して進める。支援/生成単体から始め、相談・実行・compositeはその操作を選び必要なreceiptが発生した場合にだけ続ける。

Bは低コストWorkerが後続作業の総費用を下げる可能性を早く確認できるが、候補案やfixtureだけでその効果を確定しない。Aはdomain coverageを先行できる。どちらも候補の採否、実operation authority、stage全体の完了gateを生成しない。既決の人代行/初回経路をPOへ問い直さず、上流意味やscopeが変わる判断が必要なときだけ該当ownerへ戻す。実operationには承認済み要求、operation-specific authority、選択scopeのresource、適用oracleと停止条件が必要である。

## 未解決の判断点

1. 各L1/L2候補の採択、意味変更、version targetと受入scopeは、機構ごとの確認PRで人が判断する。順序案から採択を推定しない。
2. L3で導出する数値・許容差・budget・handoff形式/version・feasibilityは、元要求との根拠と検証方法を揃えて提示する。具体値がない試験結果は未評価/保留として残し、架空値で成功扱いしない。上流人判断を要する場合、候補値・推奨・影響を提示するが、すべてのparameterに個別approval gateを追加しない。
3. CONNECT/Web sourceのうち、実際に1.0対象で採用されるcontractとscopeは人のL1/L2判断に従う。未採用のWeb sourceを他候補の必須依存にはしない。
4. 段階内の具体的な着手順はdependency evidenceに基づき更新できる。前段の無関係な候補を理由に独立候補を待たせず、変更理由・影響・証拠を記録する。

この順序をPOが確認することは、個々の要件の承認や実装開始の許可とは別である。要求段階の完了は、8機構と横断の監査・消化、L1/L2判断、候補disposition、および必要事項のL3導出への引継ぎが揃った時点で判断する。
