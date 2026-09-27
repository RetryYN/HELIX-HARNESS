# HELIX-OS 機構内要求監査

## 範囲と状態

- 基準は main / f47b1e08d872a432dd2e20d40437d48b2db41b60。対象は docs/helix-os/L1-planning/system-intent.md、docs/helix-os/L2-requirements/governance-requirements.md、docs/helix-os/L11-acceptance/governance-acceptance.md のHELIXOS-L2-001〜029。
- PO入力は docs/helix-os/sources/body-reinforcement-po-original-2026-09-27.md（SHA-256 cf45adb7212a35c496e420973be0933ec38d4c00175051811f6a9c0b2c06ac78）、docs/governance/decisions/body-reinforcement-po-decisions-2026-09-27.md、docs/helix-harness/sources/capability-reinforcement-po-original-2026-09-27.md と docs/governance/decisions/capability-reinforcement-po-decisions-2026-09-27.md。
- HELIX-OS L1は現行Concept差分を含むdraft candidate。L1本文も現行exact revisionの採択を生成しない（L1 14–17, 66–70）。L2/L11は候補・未実行の受入案であり、受入結果・要求採択・実装許可を生成しない（L2 642–645、L11 320–322, 428–430）。以下は静的照合であり実行成立の主張ではない。
- 旧sourceは現行L2のbasis表（L2 779–804）と、初回実行の旧RLO-FR-040/RLO-AC-030、元Workerへの差戻し条件、agent lifecycle資料を必要範囲で確認した。旧runtime/test/受入を実行せず、旧契約・固定provider/cycle数を現行要求として移植しない。

## PO条件からの監査観点

PO原文第1項は性能未評価と実行許可を分離し、許可された低リスク作業を限定Worker・予算・人の確認・検証条件で始め結果をBenchへ渡すよう求める。第2項は常時必須／操作時必須／選択source依存／参照のみを分け、安全依存を落とさず無関係な機構の完成待ちを除く。第3項は要求形成の質問選択・収束、第4項は能力別の正常・誤り・未見の内容判定、第5項は必要品質を前提とした総費用・時間・人介入の効果比較を求める（PO原文 第1–5項、L9–57）。

OSに直接関係するのは第1/2/4/5項。第3項はHARNESS-008/013とOSの判断source/receipt境界として照合する。OSは配置案・性能評価・HARNESS oracleを所有しない。能力単位の他機構候補をOS要求の分母へ混ぜない。

## 29 identityのL1→L2→L11照合

表のID欄001〜029はHELIXOS-L2-001〜029を指す。全体の親接続表はL2 38–51、既存要求と既存L11表はL2 54–66 / L11 21–34、追加identityはL2 619–877 / L11 311–477。

| ID | L1親とL2条件 | L11受入条件 | 静的照合 |
|---|---|---|---|
| 001 | L1-001/008。対象正本・採否revision・判断出所を管理 | authority/source revisionを追跡し、Issue/PRで変更しない | 015/019/023/025で補強、既存条件保持 |
| 002 | L1-002/007/008。要求から作業・検証・提供・運用の欠落/競合/staleを把握 | 複数projectをtrace、部分成功で未完を相殺しない | 016/021/024/025で補強 |
| 003 | L1-001。共通統制と製品方式を区別し影響伝播 | 影響範囲のみ再評価、共通統制の無断変更拒否 | 015/017/023に接続 |
| 004 | L1-003。許可・予算・依存・独立検証内でWorker委譲/再開 | exact assignment/evidence、二重実行・自己承認・scope逸脱拒否 | 018/019/023・027–029 |
| 005 | L1-006。観測→LABO評価/提案→OS登録→採否後ticket/再検証 | LABO独立評価とOS登録を分離、登録量を効果にしない | 022/024/025。研究・診断ownerをLABOから戻さない |
| 006 | L1-005。HARNESS構成版の対象導入・更新・復旧 | 選択サービス単位の配布/rollback、014と別判定 | 021/024/025で保持 |
| 007 | L1-004/008。共通形式の判断/操作/検証証拠を要求revisionから参照 | provenanceと欠落/重複/stale識別 | 019/023/024で補強 |
| 008 | L1-004。HARNESS義務に沿うCI組立・隔離運転・回収/再開 | 必要profile/oracleを実行し、review/受入/releaseへ昇格しない | 020/023/025。HARNESS義務・OS運転を分離 |
| 009 | L1-003。中断/交代後に制約・未完義務を保ち安全再開 | budget/期限/未完義務を保ち二重run/無許可復旧拒否 | 018/019/023/025・027–029 |
| 010 | L1-009。管理/推進/検収分離と直接調整 | 同ticket/causal IDで役割分離、HARNESS部品の規則的組立 | 017/018/020/023/025、1.0/4.0境界あり |
| 011 | L1-010。統合順/単位/検証計画を結果/base変更に応じ更新 | 実base/A+Bで同義務を確認し再計画、020と計画責務分離 | 016/017/020/023/025 |
| 012 | L1-011はLABO研究へ移管 | L11既存表もLABO候補へ誘導 | OS機能ではなく移管状態保持 |
| 013 | L1-012はLABO横断診断へ移管 | L11既存表もLABO候補へ誘導 | OS機能ではなく移管状態保持 |
| 014 | L1-005/007/008。HELIX自身のパック段階構成・更新/rollback | 狭い範囲でも仕事一周、安全依存・できないこと・rollbackを確認 | 構成体受入あり。021対象project配布と分離 |
| 015 | L1-001/008。authority source/revision/digestと原event/訂正を記録 | authorityを正本へ追跡、projection非依存、原event保持 | 001/003/007を補強 |
| 016 | L1-002/007/008。portfolio要求から差分/検証/提供をtrace | 複数projectの状態・stale・unit/connection/composite別受入 | 002/006/007/008/011/014の保持箇所明示 |
| 017 | L1-009/010。登録済入力とHARNESS工程契約からticket graph/workflow | 同入力再現、INT案適格性、HARNESS部品組立、戻し先 | 003/010/011と整合 |
| 018 | L1-003。ticket・Bench水準・INT案・SECURITY/INFRA資源に基づき割当/停止/回収 | exact binding、独立review、lease失効時の制約継承 | POのLABO→INT→OS三段を保持。性能未評価は027で分離 |
| 019 | L1-002/003/004/008。source-bound event/evidence/checkpointと再開情報 | crash/restart/重複/staleから再構成し制約保持 | 007/009/023の共通基盤 |
| 020 | L1-004。HARNESS義務からCI profileを作り隔離運転/回収 | exact head/oracle/environment/run、状態分類、review等への昇格拒否 | 所有境界を確認。実装有無は欠陥に数えない |
| 021 | L1-005/007。選択HARNESS構成をprojectへ配布・更新・復旧 | 選択サービスと安全依存のみ、artifact/rollback追跡 | 006補強、無断tag/publicationと全製品待ち拒否 |
| 022 | L1-006。観測/失敗とLABO提案を候補・判断・ticket・再検証へ流す | LABO評価とOS登録/振分けを別authorityとして記録 | 005/007/024補強 |
| 023 | L1-001/002/003/004/009/010。管理→推進→Worker→検収handoff | revision/digest/causal ID/scope/未完義務/evidenceを段階照合 | 001–011を接続、受信側受領まで要求 |
| 024 | L1-005/006/007。HARNESS提供/運用→LABO→OSの接続 | data-use/tenant境界と提供→観測→評価→候補→ticketを追跡 | 005/006/007/014補強 |
| 025 | L1-001〜010（011/012除外）。OS統合運転 | 複数projectでauthorityからLABO還流まで確認し1.0全体を別判定 | 015–024との境界整合 |
| 026 | L1-002/005/007/008。要求/候補pack/分担から段階構成案と不足を導く | 依存閉包・証拠・最小性を分離し、比較不足は未立証とする | 014の構成受入とは別、候補存在だけで成立しない |
| 027 | primary L1-003/009、LABO-011・INT-010は接続context。未評価時の限定初回実行とLABO受渡し | 6条件の適格性、authority/budget/人確認/oracleを固定。初回成功は未評価のまま | PO#1。旧RLO-FR-040/AC-030保持し現行ownerへ接続 |
| 028 | L1-003/009とINT-068。作業中consult案→OS認可assignment→response/return | 同一ticket/revision/scope receipt、responseなしは未成立 | PO#5。単体案作成と実相談を分離 |
| 029 | L1-003/004/009とINT-068。事前test/指示、必要時consult、元Worker実装/検証/再作業 | 相談なしの準備起点と相談ありの二経路、HARNESS契約/OS運転/独立reviewを確認 | PO#4/#5を具体化。028はconsult operation時のみ、LABO-060任意 |

## 具体照合結果

### 初回実行・支援loop・stage receipt

- PO第1項の性能未評価と操作許可の分離はOS-027で候補化（L2 824–846、L11 442–455）。旧RLO-FR-040（LEGACY-ASSET-50CA1C554747F12266D3、archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/resident-lane-orchestration-requirements.md:663–666、SHA 17bc83614d7f5f75b61831eb447a23ee706cb8a6d9e54477736e553ff956dcfd）はtask class別Bench evidence・未評価表示・score単独でscope/assignment authorityを変えない条件。旧RLO-AC-030（LEGACY-ASSET-437A6A68F9A9E0AE1B9E、archive/legacy-generation-2026-09-14/root/docs/test-design/helix/resident-lane-orchestration-acceptance.md:43、SHA 63ac3d0fbc36f014977998f9073846bfc01e5d352e07c1e10d408f0eab0ad707）も読み、推測値にしない条件を保持。PO#1を既存SECURITY要件の積へ限定し、一般risk classifierを新設しない。
- 027は開始前の要求/authority revision、task/scope、SECURITY条件、Worker/capability、INT案または同契約の人代行、LABO水準または未評価、budget/期限/stop、HARNESS oracle、人の確認を束縛。OS-018/019/023のattempt/evidence/handoffは実行後に生成しLABOへ渡す（L2 827–830, 833–846; L11 446–455）。HARNESS-L2-022のoracleは開始前の契約入力だが、OS-020を唯一の検証運転路とせず許容された人の分担も明示可能。
- 029は作業前test/指示準備からconsultなしの一周と、作業中consultを選ぶ一周を持つ。実相談時だけ028 receiptを依存に加え、事前準備/相談不要runにはresponse receiptを求めない（L2 868–877; L11 472–477）。固定回数でなく既存budget/期限/stopに従い、LABO-060は任意の効果測定材料（L2 875/877）。
- 旧resident-laneの元Worker差戻し意味（archive/.../resident-lane-orchestration-requirements.md:92–108, 345–357, 552、およびRLO-AC-013 878）を読み、現行owner/scopeへ戻す境界を保持。旧agent lifecycle資料はruntime設計資料に過ぎず、固定phase/provider/cycleの移植根拠にしない。

### OS受領とHARNESS検証/受入の責務

- HARNESS-L2-003/022は成果物状態Working→Provisional→Integrated→Verified→Accepted…を定義し、VerifiedはL10 system proof、AcceptedはL11利用者受入と記録。内容oracle成功だけでAcceptedを作らない（docs/helix-harness/L2-requirements/product-requirements.md:112,447–456; docs/helix-harness/L11-acceptance/product-acceptance.md:298–304）。
- OS-020は検収運転/result recovery、HARNESSは義務とstage判定契約という境界。029はHARNESS-L2-022契約/oracleを開始前に参照するが、execution/review receiptを開始条件にせず、発生後に照合する。pass receiptなしにVerified/Acceptedへ進めず、Acceptedには別途L11 user receiptを要する（OS L2 692–701, 868–875; OS L11 359–365, 472–477）。
- 明確なauthority矛盾は発見しなかった。実行記録をHARNESS artifact stateに誤って直接昇格する読み方を防ぐ補強候補は下記B。

## 指摘・補強候補（未採択。親照合用）

### A. 修正後HEADに対する独立reviewの明示

- 根拠: OS L2-029はoracle failのfindingを元Workerへ返し再作業・再検証するとする（L2 870–872）。L11相談あり例は独立reviewerがcurrent resultを確認する一方、相談なし例はreview→必要時修正/再検証を記すが、修正後同一HEADの独立review receiptをどの時点で再取得するかは文面上やや曖昧（L11 473–477）。
- 反例: reviewerがHEAD-Aを見てfinding。WorkerがHEAD-Bへ修正しoracle passだが、Bの差分/evidenceへの独立review receiptなしにVerified候補へ進む解釈が残る。
- 影響: HELIXOS-L2-029、必要なら018/020、HARNESS-L2-022。
- 強化候補: 修正後のcurrent HEAD/base/scope/resultへ再束縛し、作成Worker/支援者と独立したreviewerが再確認することをL11で明示。OSは証拠を運転記録へ結ぶだけで、HARNESS stateを代行しない。既存budget/stop内で動き、固定review回数を追加しない。
- 判定: 現行HARNESS契約で閉じる可能性があるので、明確な矛盾とは断定しない。L11から追えるか親が再確認できる明示不足候補。

### B. OS receiptとHARNESS artifact stateの語彙境界

- 根拠: OS-029はHARNESS-L2-022 stage contract、OS-020運転/result recoveryを分け、L11はVerified candidateとAccepted user receiptを区別する（OS L2 870–875; L11 474, 477）。state ownerはHARNESS-L2-003/022。
- 反例: OS run/result receiptをHARNESS artifactのVerified/Accepted stateそのものとして書き込み、OS受領とHARNESS判定/user acceptanceを一つに畳む実装。
- 影響: HELIXOS-L2-020/023/029、HARNESS-L2-003/022、OS L11 359–365/473–477。
- 強化候補: OS receiptは運転・受領記録、HARNESS-L2-022 stage verdict/user receiptは別owner・revision/scope付き参照とし、OSがVerified/Accepted stateを独自生成しないと明記する。
- 判定: 現行文面はHARNESS契約への照合とuser receiptを区別する。矛盾の実証ではなくowner書込みの明確化候補。

### C. 初回runからLABO consumerへ届くreceipt

- 根拠: OS-027は018/019/023の実行後記録を同scope/revisionでLABO観測へ渡す（L2 829–830, 833, 836–837; L11 448–455）。
- 反例: OS-023の送信記録だけで、LABOが観測受領/評価対象化したとOSが表示する。
- 影響: HELIXOS-L2-027/023/022、HELIXLABO-L2-054/055。
- 強化候補: source send receiptとLABO consumer receive receiptを別stageとして、受領欠落はsent/unreceivedに留める。L2-023の受信側受領条件をL11具体例でも示す。
- 判定: L2-023は受信側未完義務の受領証拠を要求するためL2では解消済み。027の「受渡し」語でstageの明示を強める案であり、採択欠陥とはしない。

## 旧source対照（保持と変更）

- 旧source basisと現行保持箇所: docs/helix-os/L2-requirements/governance-requirements.md:779–804。旧pillar requirements（LEGACY-ASSET-18F7940E7994634D39A1, SHA 7a73fa86acd8e5a7b755a9479f67c4d2af1579e533df101b1b3294eeceb0d8cc）のP0/P1/P2/P3/P4/P6/P7/P8/P9、execution ticket requirements（LEGACY-ASSET-3A15E5645D2D2A59DFF5, SHA f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b）のticket/attempt/retry/evidence、resident/three-lane sources（LEGACY-ASSET-2B0DE689AA572DE66181 / LEGACY-ASSET-A6926200F28B26300432）の委譲・handoff/role separationを読み合わせた。保持: authority trace、budget/未完義務/attempt継承、元Workerへのscope-bound差戻し、独立review。変更: 旧resident provider/lane、固定slot/cycle、runtime/db/CLIを移植せず現行OS/INTELLIGENCE/LABO/HARNESS/SECURITY/INFRA ownersへ分ける。
- 初回実行の旧sourceは上記RLO-FR-040/RLO-AC-030。保持は未評価表示と評価値から権限を作らないこと。PO第1項の初回割当・開始・安全条件・LABO受渡しを現行責務へ接続した点は変更/再導出である（body decision record「G9の旧資産対応」「R2167-01」）。旧受入を実行しない。
- 旧L6 agent lifecycle資料はruntime設計資料であり、現行要求への採択/無損失carry-forward根拠ではない。G19ではPO第5項と現行ownerを基に一周を再導出し、旧cycle limitやsmart/light固定routeを戻さない。

## 結論

HELIXOS-L2-001〜029の親L1・要求条件・L11受入候補を確認した。OS-020実装有無そのものは欠陥に数えていない。PO第1項の初回run、第2項の条件別依存、第5項の必要時だけの支援を含め、OS-027〜029では開始/実行/検収/受領の段階と責務は概ね分離され、具体的ブロッカーは確認しなかった。親がG18後のOS監査PRへ使う場合、Aの修正後HEAD独立reviewをL11で明示するか、BのHARNESS state owner文言を限定補強するかを再確認できる。これは監査メモであり、採択・実装許可・PO判断を生成しない。

## 親による検収と後続への引渡し

起草調査はGPT6 Luna high Worker、統合・検収はCodex execution、独立reviewはClaude review_merge。作成側照合を独立reviewとしない。要求ステージ整理の監査PRであり、要求本文・仮登録・authority状態は変更しない。

G18後のbase `858026b250a15d4fec020b21b315c250decf960b`で、対象OS文書のbytesは調査基準f47b1e08dと同じである。対象SHA-256は次のとおり。

- `docs/helix-os/L1-planning/system-intent.md`: `2bb62571308aa1fde0351ca7242e961ddd25b9c4722196c7bb255cf3ad1cfe0e`
- `docs/helix-os/L2-requirements/governance-requirements.md`: `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf`
- `docs/helix-os/L11-acceptance/governance-acceptance.md`: `026cfa386f99221ca1d43d238d4cf7f50e53c03c35193f8bcba09baff0578f07`

| 候補 | 親の判断 | 消化先 |
|---|---|---|
| A | 現行029の独立reviewとcurrent result束縛を保持し、修正後の再照合をL11で具体化する。旧RLO-INV-005のbase変更時receipt無効化（旧resident-lane-orchestration-requirements.md:351-353）、元Workerへの差戻し（:355-357）とも整合する。 | 後続消化PRのL11-029。HEAD-AへのreviewをHEAD-B修正に流用する反例を加える。固定回数・新しい承認は追加しない。 |
| B | 本文変更不要。L11-029冒頭がHARNESS契約とOS実行運転を区別し、正常例にAcceptedの利用者receipt、誤り例にCI greenだけのAccepted拒否がある。 | 既存条件を総合検証の責務境界表へ引用する。欠陥として数えない。 |
| C | 本文変更不要。L11-027の「失敗・未完義務」はLABO受領の欠落/不一致で成功を拒否し、「状態分離」もLABO観測受領を独立させる。 | 送信だけで受領とする反例は既存oracleで拒否できる。横断照合で受信側との一致を確認する。 |

### routing containerと仮登録の区別

上の29行は本文identityの監査集合であり、仮登録候補29件という意味ではない。既存001〜013は旧37件のrouting containerの一部で、014〜029の現用仮登録候補16件と管理状態が異なる。[対象別L2入口](../source-rebaseline/l2-source-register.md):7-10,30-49、[carry-forward状況](../../requirement-carry-forward-status.md):7-24、[仮登録契約](../../management-provisional-requirement-registration.md):85-87を参照する。001〜013には現行registerの個別proposalがなく、旧sourceはsource holdingで保全される。これは要求欠落・不採用・retireの宣言ではなく、個別source atomのsuccessor被覆の証明でもない。

旧source authority、target案のdraft、個別successor/atom被覆、仮登録の4状態を混ぜない。012/013のLABOへの移管も、旧sourceすべての被覆完了を意味しない。個別register除外理由とsource→routing containerのatom単位対応は未確認であり、後続の横断整理で対象を限定して管理状態と対応先を確認する。旧153要求や全4,020資産の再調査を開始条件にはしない。

本監査のmergeはAの受入補強やrouting対応の解消を意味しない。機構別の消化、横断整理、総合検証を経た後にPO確認PRを立て、対象revisionの判断を別途記録する。
