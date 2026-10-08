---
title: "HELIX-HARNESS Stage 1 L9結合検証設計"
layer: L9
status: design_pair_defined
owner: HELIX-HARNESS
paired_l4: ../L4-basic-design/stage1-harness.md
paired_l4_sha256: 25fbd104fd47f39d22f542664e57fd44a440af8904e11b2f0b397ac6606b6cfb
base: main `33bbe8cd5f080be9e400e9259db22645bc620eda`
---

# HELIX-HARNESS Stage 1 L9結合検証設計

`design_pair_defined`はL4契約とL9 oracleの設計定義であり、review/承認/実行/合格を表さない。本書は[Stage 1 L4](../L4-basic-design/stage1-harness.md)の一方向固定参照であり、L4はL9 SHAをpinしない。L4 raw bytes SHA-256は`25fbd104fd47f39d22f542664e57fd44a440af8904e11b2f0b397ac6606b6cfb`。L4の6つのL3/L10 source SHAが固定scopeの正本である。

## 1. 固定scopeとoracle条件

対象は承認済み`HARNESS-L2-010/011/023`のStage 1 L3/L10固定revision `a77672513325aa9e79f3780af40455361b5d19a8`で、L4 §1の6本文pinを用いる。010/011のversion_targetなし、023の`1.0`を保持する。機能L3は11 AC、機能L10は12 source case。NFR L3/L10は5候補と5 case。business requirement/business oracleは3親の全てに独立して存在しない。

fixtureは合成pack descriptor、owner identity、dependency declaration/source selection、revision、authority参照、receipt、event、time、artifact digestを使う。実ネットワーク、外部API、実credential、release、deployment、旧test/runtime/CIを起動しない。dispatch/oracleの検査はfixture上で行い、実effectや権限を作らない。fixture不足は未評価/unknownとして保持する。結果は現行K1–K10の型・key・evidence・authority・dependency契約に従い、承認、release判断、候補成立を生成しない。

一つのverifier IDは一つの固定L10 functional case、NFR caseまたは親別business-boundary rowを受け持つ。固定L10 case内で複数fixtureを要求する箇所は、そのcase本文の条件を各々独立fixtureに分けて一つずつ照合する。L10 `CASE-HARNESS-L10-*`/NFR caseはsource ID、ここで定義する`IV-HARNESS-S1-*`はL9 verifier IDであり、置換・再採番しない。

## 2. 機能case trace（12件）

各行のnegativeは固定L10 fixture条件を保持する。複数mutationがあるcaseも、一fixtureで変える条件は一つとする。正常対照、独立mutation、owner返却はcaseのoracleとして別々に確認し、まとめて一つの失敗にしない。

| L9 verifier ID | 固定親 / L3 AC | L10 source case | fixtureと期待oracle | ownerへの返却 |
|---|---|---|---|---|
| `IV-HARNESS-S1-F-010-01` | `HARNESS-L2-010` / `AC-HARNESS-L3-010-01` | `CASE-HARNESS-L10-010-01` | 正常descriptorはpack identity/version/maturity、input/output contract、dependency種別/identity/version、verification scope/oracle、owner class+identity、収載/除外、release unit/productの別versionを照合する。ownerを二重化、release-unit所有packを別unitから共有、宣言外dependencyを各種類ごとに使う、または未検証/未適格packを暗黙収載するnegativeを独立に与える。component/core共有能力の正常対照も含め、所有単位と収載集合が契約に一致することを照合する。 | pack宣言の欠落・矛盾はpack contract owner、操作固有不成立はcallerへ理由と返却先を示す。 |
| `IV-HARNESS-S1-F-010-02` | `HARNESS-L2-010` / `AC-HARNESS-L3-010-02` | `CASE-HARNESS-L10-010-02` | 基準pack集合から一packだけ差替え、全pack identity/version/evidenceを前後比較する。対象外差分は0件。失敗fixtureでは対象pack revisionだけを無効化し、成功扱いしない。複数pack更新を混ぜない。 | pack contract ownerまたは操作固有callerへfailure理由を返す。 |
| `IV-HARNESS-S1-F-010-03` | `HARNESS-L2-010` / `AC-HARNESS-L3-010-03` | `CASE-HARNESS-L10-010-03` | 同じdeclared input/pack versionから同じ宣言成果物となる再生成を照合する。失敗復帰先は直前適格版/明示replacementを各独立fixtureにし全identity/version/evidenceを比較する。maturity昇格、pack成功、pack差替えを別々に与え、release unit/product版・maturityの変化が0であること、上位構成未完時に適格packが隠れないことを照合する。交換・更新不能な巨大packの期待return先はDesign-refactor。 | pack契約とcaller固有operationのfailureをowner別に返す。 |
| `IV-HARNESS-S1-F-010-04` | `HARNESS-L2-010` / `AC-HARNESS-L3-010-04` | `CASE-HARNESS-L10-010-04` | function/folder一覧だけの入力と、pack identity・owner・contract・release-unit収載を持つ入力を個別比較する。function/folder catalogだけはpackとして受理せず、不足項目を返す。 | pack contract ownerへ不足項目を示す。 |
| `IV-HARNESS-S1-F-011-01` | `HARNESS-L2-011` / `AC-HARNESS-L3-011-01` | `CASE-HARNESS-L10-011-01` | 画面/GUI/local path/provider/CI製品なしの明示構成で機能を呼び宣言出力を利用する正常fixtureを照合し、HELIX内部管理対象/運用記録を要求する変異を個別に拒否する。異なるprovider構成とtenantの正常fixtureも別に置く。pack宣言とcaller inputを区別し、pack/能力identity、contract/dependency versionのmissing/unknown/stale/mismatchを一fieldごと独立に与え、未対応versionを同等扱いしない。 | pack宣言側はpack contract owner、operation/caller input側はcaller ownerへfield別に返す。 |
| `IV-HARNESS-S1-F-011-02` | `HARNESS-L2-011` / `AC-HARNESS-L3-011-02` | `CASE-HARNESS-L10-011-02` | 既存SECURITY authorityとproject/tenant/environment scopeを正常fixtureとして与える。authority参照とscopeの各missing/unknown/stale/mismatch、別tenant/scope外target、HELIX本体DB/key/internal control共有をそれぞれ独立fixtureで照合する。pack独自分離stateの利用は正常側に置く。scope内実行だけ許し、HARNESSがauthorityを発行/拡張しない。 | authority条件は既存SECURITY owner、scopeと共有不成立はcaller/pack ownerへ理由を返す。 |
| `IV-HARNESS-S1-F-011-03` | `HARNESS-L2-011` / `AC-HARNESS-L3-011-03` | `CASE-HARNESS-L10-011-03` | 複数progress update、終端/未完state、result/evidenceを一operationに相関させ、呼出し元へ返す。resume用途中stateの内部記録は許す一方、呼出し元のresult保存/表示または業務完了判断をHARNESSへ移す変異は個別に拒否する。 | correlation/返却不足はcaller/operation ownerへ返す。 |
| `IV-HARNESS-S1-F-011-04` | `HARNESS-L2-011` / `AC-HARNESS-L3-011-04` | `CASE-HARNESS-L10-011-04` | 同じlogical operation/state、pack/contract/dependency version、scope、既存authority、idempotency keyでresumeする正常fixture。resume state・各version/scope/authority・receiptのmissing/unknown/stale/mismatch、HARNESSによる同operation key変更、expiry不成立を各々独立に照合しsuccessにしない。callerの別keyは別operation正常対照。preflight/dispatch直前/直後のsnapshotを照合し、dispatch前不成立はeffect 0 blocked/held、dispatch後結果不明はuncertain/unknown。期限前/ちょうど/後とdispatch前後のL10指定clock fixtureを保持し、等号候補A/Bは`IV-HARNESS-S1-N-011-02`と同じ比較条件へ戻す。 | pack declarationはpack contract owner、operation state/scope/receiptはcaller、authority/safetyは既存SECURITY、dispatch運転状態はOS ownerへ戻す。 |
| `IV-HARNESS-S1-F-023-01` | `HARNESS-L2-023` / `AC-HARNESS-L3-023-01` | `CASE-HARNESS-L10-023-01` | 常時必須/operation条件/source選択/reference-onlyの4区分を同じpack revisionに束縛する。未実装dependencyでもclassification-onlyでmissing/unknownを表現可能とする。区分/owner/version/range/condition欠落・曖昧と、安全条件/oracleをreference-onlyに偽装する変異を別々に照合する。 | pack宣言不備/偽装はpack contract ownerへ理由と戻し先を返す。 |
| `IV-HARNESS-S1-F-023-02` | `HARNESS-L2-023` / `AC-HARNESS-L3-023-02` | `CASE-HARNESS-L10-023-02` | operation/source condition true/false/unknown/contradictory、未選択source、選択source missing/stale、暗黙fallback、明示reselection、新input、closureの過剰/過少、correlation欠落、単体pack greenのみを個別fixtureで照合する。成立したoperation/source条件＋常時必須だけをclosureに含める。unselectedは未観測、unknown/contradictionは保留。明示reselectionだけ新inputとして再評価する。単体greenからcomposite成立を推定しない。 | dependency契約はpack owner、operation/source/scope/resultはcaller、authorityはSECURITY。上流scope meaning不明だけはそのownerへ戻す。 |
| `IV-HARNESS-S1-F-023-03` | `HARNESS-L2-023` / `AC-HARNESS-L3-023-03` | `CASE-HARNESS-L10-023-03` | 人代行、口頭のみ受領、後続版依存、1.0安全依存、unknown dependency、同input/revision再評価の各fixtureを分離する。人代行もactor/source/revision/scope/受領/検証receiptと既存authority/isolation/versionを満たす。分類だけで実装済を要さない。closureからfeature/owner/version/maturity/adoption/実装許可を生成しない。 | 欠けた義務の既存pack/caller/authority ownerへ戻し、authority定義を作らない。 |
| `IV-HARNESS-S1-F-011-05` | `HARNESS-L2-011` / `AC-HARNESS-L3-011-02` | `CASE-HARNESS-L10-011-05` | HARNESS要求だけの正常scopeと、その要求からWEB要求/設計を導出する変異を比較する。HARNESS scopeは維持し、WEB導出を拒否する。 | HARNESS owner境界を保ち、WEB意味を導出しない。 |

## 3. NFR case trace（5件）

5 verifierは固定L3/L10 NFR候補に一対一で対応する。計測候補や合成結果を性能SLO/実測/承認へ昇格しない。

| L9 verifier ID | 固定NFR / L3 AC | L10 source case | 測定fixtureと期待oracle |
|---|---|---|---|
| `IV-HARNESS-S1-N-010-01` | `NFR-C-HARNESS-010-01` / `AC-HARNESS-L3-010-03` | `CASE-HARNESS-L10-NFR-010-01` | 同じinput/pack version/artifact contractの2生成結果を比較し、宣言artifact bytes digest一致、予期しない差分0を照合する。semantic除外はcontractが非意味metadataと明記した場合だけ。digest algorithmや生成方式は追加しない。 |
| `IV-HARNESS-S1-N-010-02` | `NFR-C-HARNESS-010-02` / `AC-HARNESS-L3-010-02` | `CASE-HARNESS-L10-NFR-010-02` | 一pack差替え前後の全pack version/evidenceを比較し、対象外差分0を照合する。複数pack更新は別scopeとして本候補の測定から外す。 |
| `IV-HARNESS-S1-N-011-01` | `NFR-C-HARNESS-011-01` / `AC-HARNESS-L3-011-04` | `CASE-HARNESS-L10-NFR-011-01` | 同一operation/keyのresume/re-deliveryと、effectなし中断/処理後重複送達を分け、key保持と追加effect 0（高々一回）を照合する。callerの別key operationは対照。 |
| `IV-HARNESS-S1-N-011-02` | `NFR-C-HARNESS-011-02` / `AC-HARNESS-L3-011-04` | `CASE-HARNESS-L10-NFR-011-02` | 固定L10のexpiry直前/ちょうど/直後、preflight/dispatch前後、resume、期限前開始で期限後結果の各fixtureを使う。既存contractが等号規則を定めれば従い、未定義時は案A `now >= expiry`と案B `now > expiry`を同一clockで比較する。dispatch前expiredはblocked/heldかつeffect 0、dispatch後に結果が不確実ならuncertain/unknown。どの案でもexpiry後success 0。 |
| `IV-HARNESS-S1-N-023-01` | `NFR-C-HARNESS-023-01` / `AC-HARNESS-L3-023-03` | `CASE-HARNESS-L10-NFR-023-01` | 固定NFRのD1–D15全15 fixtureを別々に実施し、同じpack revision/inputで各々2評価したclosureとreasonのmeaning digest差分0を照合する。source selection、4分類、missing/stale、条件true/false/unknown/contradictory、fallback/reselection、cycle、reference-only偽装、人代行、未実装依存をNFR sourceのscopeどおり保持する。digestは試験比較値で正本schema/実装方式ではない。 |

## 4. Business boundary trace（独立business oracleなし）

固定L3 business/L10 businessは3親に独立business requirement/oracleを置かず、機能ACを参照する共有境界を定める。下表のverifierは「独立business oracleを追加しないこと」と既存境界の保持だけを確かめる。新business AC、事業値、利用者受入やrelease判断を作らない。

| L9 verifier ID | 固定親 | source | 境界oracle |
|---|---|---|---|
| `IV-HARNESS-S1-B-010` | `HARNESS-L2-010` | L3業務共有境界 / L10業務行010 | FRS-BR-001/002/003/005/009とL2-008区別は固定functional ACへ追跡し、収益/優先順位/release decisionを追加しない。 |
| `IV-HARNESS-S1-B-011` | `HARNESS-L2-011` | L3業務共有境界 / L10業務行011 | 呼出し側の保存/表示/業務完了判断はcallerに残り、HARNESSの独立business oracleへ移さない。 |
| `IV-HARNESS-S1-B-023` | `HARNESS-L2-023` | L3業務共有境界 / L10業務行023 | 条件別dependency classificationから利用方針やownerを導出せず、機能ACに対する業務acceptanceを新設しない。 |

## 5. 共通kernelと製品境界の結合確認

ここでの参照はbase `7d48e458fcff7e03df18abc4f768981410685cf7`の共通kernel L4/L9を指す。kernel別の新型やpolicyを作らない。

| 既存kernel | 対応するHARNESS L9観測 | 境界 |
|---|---|---|
| K1 | 全caseのValue/Unknown/Unobserved/Stale、未評価、missing入力の保持 | unknown/未観測を肯定へ変換しない。 |
| K2 | pack/caller/dependency/operation/scope/artifact identity、revision、digestのkey照合 | source ownerが渡すcurrent refsを照合し、別版を読み替えない。 |
| K3 | CASE-011-02/04、CASE-023-03の既存authority参照 | SECURITYの権限決定を代替しない。 |
| K4 | CASE-010-01/02/03、011-03/04、023-02/03のunfinished obligation | 未完のreceipt/依存義務を消さない。 |
| K5 | artifact/evidence/result/recoveryの記録不変・provenance | oracleは物理writerや永続化方式を実装しない。 |
| K6 | declared scope/oracleのreceipt一致、result/evidenceの照合 | receiptからapproval/実行実体を導かない。 |
| K7 | pack/operation version fencing、replacement、resume | revision drift時に旧resultをcurrent扱いしない。 |
| K8 | pack maturityとrelease unit/productの別label観測 | pack labelだけから上位labelを昇格しない。 |
| K9 | fixed scopeで要求される場合の独立review/evidence参照 | reviewをL3承認、authority、release可否にしない。 |
| K10 | CASE-023のtyped dependency closure | 4分類/conditionは固定親どおり。宣言外dependencyを作らない。 |

親別仕様がkernelの一般化で変わる場合は親のscopeへ戻し、kernel参照から要求意味を拡張しない。HELIX-HARNESS製品の外部機能契約をOS運転やINFRA物理観測で代替せず、K3のauthority判断も新設しない。

## 6. 旧source・未評価・設計限界

旧sourceの保持/再導出/置換、path/line/full SHAと台帳statusは[L4 §2](../L4-basic-design/stage1-harness.md)に記録した。旧L3 acceptance design/FRS/L8 test資料はfailure shapeとtrace構造の比較根拠であって、現行oracle/実行結果/authorityではない。

L10 NFR-C-HARNESS-011-02のexpiry等号は既存契約に定義があるかで扱い、無い場合の候補比較はL9に閉じる。特定TTL/clock skew、retry count、test runner、transport、manifest schema、physical write/dispatch mechanismは本pairが決めない。HARNESS-L1-005の要求意味に疑問が生じたときはその箇所だけ上流へ戻し、別の要求・parent・gateを作らない。

本書は合成fixtureの期待設計のみである。fixture、L8/L9/L10、旧CI/test/runtime、実外部communication、実装、releaseは実行していない。ここにある期待値をpass/covered/承認/実装完了として主張しない。
