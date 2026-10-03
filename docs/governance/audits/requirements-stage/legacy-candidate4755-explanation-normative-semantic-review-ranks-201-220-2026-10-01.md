# Candidate 4755 規範語マーカー ranks201–220 意味監査

対象は独立再構成したmarker queueのranks201–220である。#2353 row recordsに順序付き8 overlayを適用し、#2369の`scope.source_rows[].proposed_classification`も反映した。説明行2,965件、禁止・必須・条件marker hitは表header除外前258件。

既存screenはheadingに加えて実際のMarkdown表header行3件を除外して255件としている。該当する3行（258 queueのrank222 `001500`、223 `001514`、230 `001910`）は本レビュー範囲の後にあるため、ranks201–220のIDと順位は258/255の両queueで一致する。本記録はscreenを改変せず、full-pool countの差を保持する。末尾の`001672`、`001678`、`001685`は表データ行で各`場合のみ` hitとなり、258 queue ranks256–258、255 queue ranks253–255に含まれる。

旧archive原文と前後節、#2353 baseline physical bytes、source-line carry-forward ledger、asset disposition ledgerを行単位で照合した。全20件に現行source-family levelのinventory/crosswalk relationがある一方、現行pairへの行単位採択bindingは0件。旧資産は全件`historical/unresolved`、source rowsは全件`historical_candidate/draft_candidate/preserved_pending_atomization`。

## 順位と意味分類

|順位|旧source ID|意味分類|単独の要求条件|marker|現行比較・残差|
|---:|---|---|---|---|---|
|201|`LEGACY-CAND-LINE-004523`|受入判定条件（HWG-AC-07）|いいえ|prohibition:拒否|固定F6 OS/HARNESS L2/L11にHWG-AC-07の選定行対応は確認できない。旧sourceの意味条件として保持。 現行inventory/crosswalkにはsource-family levelの対応があるが、この行の個別crosswalk/adopted pair bindingはない。 残差: HWG source atomと現行owner・適用scope・oracleを特定する。採択やcoverageを推論しない。|
|202|`LEGACY-CAND-LINE-004526`|受入判定条件（HWG-AC-10）|いいえ|prohibition:拒否|固定F6 pairでselected HWG row crosswalkやHWG受入実施は確認できない。 現行inventory/crosswalkにはsource-family levelの対応があるが、この行の個別crosswalk/adopted pair bindingはない。 残差: 閾値・owner・policy適用境界・必要oracleを分けて追跡する。|
|203|`LEGACY-CAND-LINE-004574`|限定された旧runtime観測の説明|いいえ|prohibition:fail|固定F6 pairへの要求行対応なし。旧runtimeの動作や検査を実行せず、説明対象の真偽も主張しない。 現行inventory/crosswalkにはsource-family levelの対応があるが、この行の個別crosswalk/adopted pair bindingはない。 残差: 観測source・consumer・適用可能性が未接続である点を維持する。|
|204|`LEGACY-CAND-LINE-004651`|旧#1500 Portfolio候補を基にした再編指示|いいえ|prohibition:禁止|OS/HARNESS固定pairに旧Issue本文やselected rowとのbindingはない。PR/Issueは意味authorityを作らない。 現行inventory/crosswalkにはsource-family levelの対応があるが、この行の個別crosswalk/adopted pair bindingはない。 残差: 旧候補本文・Issue履歴・現行OS責務と照合し、row-specific crosswalkが未確認なまま保持する。|
|205|`LEGACY-CAND-LINE-004661`|旧JSON authority設定への参照とその主張|いいえ|prohibition:forbidden|現行OSのsource authority/canonical IR条件との近接性だけでは、旧設定rowの個別採択・再利用・完全な同義性にならない。 現行inventory/crosswalkにはsource-family levelの対応があるが、この行の個別crosswalk/adopted pair bindingはない。 残差: 現行owner・schema・accepted revisionへの対応と設定移管の有無を別に確かめる。|
|206|`LEGACY-CAND-LINE-004671`|旧pure semantic-intake receipt componentの参照説明|いいえ|prohibition:reject|候補部品の存在・pure API説明はOS/HARNESSの全体requirementや実装証拠でない。選定旧rowのbindingなし。 現行inventory/crosswalkにはsource-family levelの対応があるが、この行の個別crosswalk/adopted pair bindingはない。 残差: source authority、consumer、候補処置と現行ownerの関係を特定する。旧componentを実行・copyしない。|
|207|`LEGACY-CAND-LINE-003790`|GitHub公式文書へのreference-only markdown link|いいえ|mandatory:required, mandatory:required|現行GitHub運用の意味条件との行対応なし。旧URLのページ内容をこのsource lineの要求条件として読み替えない。 現行inventory/crosswalkにはsource-family levelの対応があるが、この行の個別crosswalk/adopted pair bindingはない。 残差: 要求marker false positiveとして保持。|
|208|`LEGACY-CAND-LINE-000050`|受入判定条件（AAFD-AC-001）|いいえ|mandatory:必須|AAFD familyは2026-09-25判断でINTELLIGENCE候補へ移った。移管はこのAC rowの採択やL11実行を意味しない。 現行inventory/crosswalkにはsource-family levelの対応があるが、この行の個別crosswalk/adopted pair bindingはない。 残差: AAFD-R-01との個別binding、owner受入範囲と採用revision後のoracle実行を確認する。|
|209|`LEGACY-CAND-LINE-000162`|AAFD-R-09の分岐条件|はい|mandatory:required|AAFDはINTELLIGENCE候補へ移管。fixed OS/HARNESS decisionsはこの旧row adoptionを示さず、後続の候補relationにもこのrowの個別bindingは未確認。 現行inventory/crosswalkにはsource-family levelの対応があるが、この行の個別crosswalk/adopted pair bindingはない。 残差: AAFD-R-09全体・条件と処置のscopeを復元し、個別successor/acceptanceを特定する。|
|210|`LEGACY-CAND-LINE-000415`|BBR-R-05の禁止repair条件の一部|はい|mandatory:必須|BBR familyはINTELLIGENCE候補に残る未採択候補。fixed-pair decisionから本行のauthorityや修復許可は生じない。 現行inventory/crosswalkにはsource-family levelの対応があるが、この行の個別crosswalk/adopted pair bindingはない。 残差: BBR-R-05全列挙と既存HARNESS/SECURITY/OS owner境界を個別に追跡する。|
|211|`LEGACY-CAND-LINE-000578`|将来Vision項目のfuture-only表行|いいえ|mandatory:必須|現行Conceptの製品境界とVision差分は比較可能だが、このold table rowに対するselected source-line bindingはない。 現行inventory/crosswalkにはsource-family levelの対応があるが、この行の個別crosswalk/adopted pair bindingはない。 残差: Vision source revisionと現行対象別L1/L2の意味差を保持し、製品数・対象範囲を拡大しない。|
|212|`LEGACY-CAND-LINE-000607`|Concept/Vision release crosswalkの1.0行|はい|mandatory:必須|提供構成source familyはOS/HARNESS L2へ運用管理条件と提供物条件に分けて保持。固定PO決定は指定候補集合のみ採用し、このsource rowの個別coverageを確定しない。 現行inventory/crosswalkにはsource-family levelの対応があるが、この行の個別crosswalk/adopted pair bindingはない。 残差: 対象別1.0範囲・consumer・受入条件とWeb dependencyを分けて追跡する。|
|213|`LEGACY-CAND-LINE-000662`|提供構成/growth-offの受入条件|はい|mandatory:必須|HARNESS-L2-006と対L11はgrowth-off利用・artifact provenanceを扱う。source-family relationあり。ただし旧PKG row個別のadopted pair bindingや受入実行は未成立。 現行inventory/crosswalkにはsource-family levelの対応があるが、この行の個別crosswalk/adopted pair bindingはない。 残差: 採用revision後にgrowth-off構成の対象機能・clean consumer・credential境界を検証する。|
|214|`LEGACY-CAND-LINE-000712`|Conversation Lifetime acceptanceの終了条件|はい|mandatory:mandatory|CLR source familyはOS L2-004/007/009とL11候補へ接続。採択revision後のL11は未実行で、旧line個別のbindingは未確立。 現行inventory/crosswalkにはsource-family levelの対応があるが、この行の個別crosswalk/adopted pair bindingはない。 残差: CLR acceptance source atomと現行受入条件・実施証拠の対応を確かめる。|
|215|`LEGACY-CAND-LINE-000767`|CLR-Rのpacket上限時の安全条件|はい|mandatory:必須|CLR familyはOS L2/L11 candidate sourceとして保持されるが、固定決定はこのselected source rowの採択・受入を生成しない。 現行inventory/crosswalkにはsource-family levelの対応があるが、この行の個別crosswalk/adopted pair bindingはない。 残差: CLR-Rの条件全体とOS/SECURITY/会話境界の適用範囲を確認する。|
|216|`LEGACY-CAND-LINE-001060`|Development investment候補取込文書の非authority disclaimer|いいえ|mandatory:必須|INV familyはOS/HARNESSで候補源として参照するが、このdisclaimer lineは要求成果ではなく個別pair bindingなし。 現行inventory/crosswalkにはsource-family levelの対応があるが、この行の個別crosswalk/adopted pair bindingはない。 残差: directive各source atomとauthority/status metadataを区別して保持する。|
|217|`LEGACY-CAND-LINE-001096`|HXT-AC-006 ticket responsibility分割oracle|はい|mandatory:required|Execution Ticket familyはOS L2のHXT-RQ/TYPE/FLOW/SYSおよびL11 acceptanceへ詳細化。family relationありだが、このlegacy AC rowのindividual acceptance bindingと実施は未確認。 現行inventory/crosswalkにはsource-family levelの対応があるが、この行の個別crosswalk/adopted pair bindingはない。 残差: split condition、primary ownershipとL11反例をrow-specificに確認する。|
|218|`LEGACY-CAND-LINE-001300`|HXT-FR-012/旧AC-001のevaluation treatment条件|はい|mandatory:必須|OS L2 HXT source family is held across ticket graph/experiment profile, but this row-specific treatment contract is not explicit in the fixed selected-pair binding reviewed. 現行inventory/crosswalkにはsource-family levelの対応があるが、この行の個別crosswalk/adopted pair bindingはない。 残差: evaluation profile/treatment applicability, authority scope, and comparison oracleを個別に対応づける。|
|219|`LEGACY-CAND-LINE-001301`|HXT-FR-015 regular-change/evaluation-profile条件|はい|mandatory:必須|OS L2 HXT family relation is present; fixed F6 HXT pair details do not show an exact row binding for these applicability states. 現行inventory/crosswalkにはsource-family levelの対応があるが、この行の個別crosswalk/adopted pair bindingはない。 残差: current verification profile、missing/not_applicable区別、適用対象をrow-level crosswalkで確認する。|
|220|`LEGACY-CAND-LINE-001321`|Execution Ticket source intakeの責務割当・測定・budget・authorityの複合条件|はい|mandatory:必須|Execution Ticket family is reflected in OS L2; line-specific owner assignment and experiment authorization details are not established by selected fixed OS candidates/decision. 現行inventory/crosswalkにはsource-family levelの対応があるが、この行の個別crosswalk/adopted pair bindingはない。 残差: 構成atomごとにOS/LABO/INTELLIGENCE/SECURITY/INFRA ownershipと上流authorityを分けて照合する。|
## source/asset ledger pins

- #2353全4,755 source row baseline: commit `97672630b7de70fd4433827730c390cbabd90a99`、JSON SHA-256 `2c025c878ce1b63d93531ee980b08c785ba9273d6db6f751cf3237ce31d6696c`。
- 順序付き分類入力: #2356、#2360、#2363、#2366、#2367、#2368、#2369、#2381。個別commit/path/content SHA-256はpaired JSONに保存した。#2369は000841/000857をconditionへ移し、000857のprohibition hitをqueueから外す。
- Candidate source-line ledger: `docs/governance/legacy-migration/candidate/legacy-candidate-source-line-carry-forward.jsonl`、commit `50686b6762788574cb471967e8c24846d3dd56ae`、SHA-256 `a5f6cebe42b019a4f0511a54f7409493bc007d6395ec449cb0af8e2fa792d781`。
- Asset disposition ledger: `docs/governance/legacy-asset-disposition.jsonl`、同commit、SHA-256 `cd73ac407937ad86c6be2c0b27d70863b1873fe39c2d6c0f89620e648dccad8c`。各source rowのledger line・entry SHAとasset line・entry SHAはpaired JSONに保持した。
- 現行比較はF6固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`のOS/HARNESS/INFRASTRUCTURE L2/L11を本文比較に使った。現在のsource-family inventory/crosswalkと対象別L2/L11も別revisionでpinした。候補family relationはselected rowの採択やclosureを意味しない。

## 解釈上の境界

- marker hitは語句の同定だけであり、義務・禁止の意味や現行採択を決めない。受入oracle、引用・観測、source context、要求断片を区別した。
- family-level crosswalkがある場合も、selected source rowの個別crosswalk、adopted pair binding、full atom coverageは確認できなかった。authority effectは`none`。
- archive内runtime、CLI、hook、adapter、test、CI、workflowは実行していない。静的な分類数、exact bytes/hash join、JSON/Markdown整合を確認した。
