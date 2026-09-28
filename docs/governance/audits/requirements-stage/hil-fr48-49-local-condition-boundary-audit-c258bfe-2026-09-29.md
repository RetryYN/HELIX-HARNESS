# HIL-FR-48/49 条件別I/O・現行counterpart・次候補境界の限定監査

---
audit_id: HIL-FR48-49-LOCAL-CONDITION-BOUNDARY-C258BFE-2026-09-29
audit_status: bounded_static_audit
authority_effect: none
reviewed_main: c258bfe81624ab03b08fccf6bd1fccc5e279040a
scope: HIL-FR-48/49 line 138-139, assertion cases 031/032, HARNESS-L2/L11-040/022/025/026, MPR-SH-IR-003
excluded: old runtime/test/CI execution; requirement adoption/change; successor assignment; full NFR-29/HIL-BR-25/HAC/HAT closure
---

## 結論

旧HIL-FR-48は隣接層の上下edge、逆伝播、粒度、stale、aggregate粒度を評価するvertical gateの要求である。旧HIL-FR-49は6つの正規V-pairをatomic oracle単位で双方向joinし、L12からL1と層外L0へfeedbackを返すhorizontal gateの要求である。旧assertion caseは、各条件を個別入力し、`vertical edge receipt`／`V-pair receipt`または局所finding/staleを返す設計例を持つ。ただし同表の`design-defined`／`not-implemented`は旧testの実行結果ではない。

採択済みHARNESS-L2-040は12層・6 pair・row/edge・L0 anchorのcatalog契約を定め、L11はcatalogの欠落や一部不整合を例示する。HARNESS-L2-022は段階別検証・受入証拠、025/026は設計および対oracleの生成・構成を定める。これらを合わせても、旧FR-48/49の各gate条件に対する局所評価結果、pairごとのfinding、L12 feedbackの二つの出口、実行receipt欠落時のgreen拒否を一対一には特定できない。#2299の監査が記した条件別gapは、この限定照合でも残る。

これは既存要求の欠落確定や新L2/L11追加の判定ではない。MPR-SH-IR-003のIR行と原文source relationは両要求を`preserved_pending_rehome`として保持し、successor IDを持たない。次候補は、 gate意味そのものが要求層の必須契約なのか、具体的な設計・実装方法なのかを分けてから決める。意味とownerが確定するまでは要求本文を追加・変更しない。

## 対象revisionとsource

| 面 | exact input |
|---|---|
| 最新main | `c258bfe81624ab03b08fccf6bd1fccc5e279040a`。本監査と現行counterpartはこのHEADで読取。 |
| 旧source | `LEGACY-ASSET-719D5EC9C06FC4AAD0FF` revision 3、archive `root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md`、file SHA-256 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`。HIL-FR-48 line 138 SHA-256 `e12937bb604330b7c3d1ad13f23bb3e60969b888cd16a311405e7a993e360d41`、HIL-FR-49 line 139 SHA-256 `58417554e28eff13d562e183533c1f76fbca3c27a29de9385d09e70b615ccf37`。 |
| 旧反例source | `archive/.../root/docs/governance/infinity-loop-system-assertion-cases.md:301-321`、file SHA-256 `98d2f9c9721481e6b4363c0683c00b187ce789fd6a39723323eca72395102ea8`。Supporting test-designは`archive/.../root/docs/test-design/helix/L6-layer-ledger-pair-gate-unit-test-design.md`、file SHA-256 `a0d9a570e2d4fd7ad77d4671202e21fb76fa29845a5d4bad7b3c374905401217`。いずれも読取のみ。 |
| 既存pair-gate監査 | [HIL-FR-48/49層間・V-pair gate条件監査](hil-fr48-49-pair-gate-condition-audit-2026-09-29.md)、基準main `319869830f3711a1509f6c76dd3663a3007e1fc5`、file SHA-256 `2233c63d86f805598a07fe4fc1d7e15d692daf83dce28fdb23b0d7e6eff341fc`。本書は条件別I/Oと境界を追記する静的照合であり、前監査の結論やauthorityを更新しない。 |
| 現行counterpart | HARNESS L2 file SHA-256 `b8d81434cd0ae28155f507ee6e797d945061496c0c3d8f76dc79b524d2857df3`、L11 file SHA-256 `f4b385be3af82090ae43322bff6c1a139b5f785fec8b02ecc616db19416ad834`。HARNESS-L2-040/L11-040 exact adopted section digestsはそれぞれ`c349606d7798e3f4eb5e6cb31e0618a83dcfa05f9fc888b0ce618f6d160757df`／`366518f8e32ac4dda1e5f4ec88ef0cfed6bc363d597955ffffb1a82d706fc212`（[57候補判断表](../../decisions/po-decision-2026-09-29-57candidates.md)）。L2-022/025/026は2026-09-28のHELIX-HARNESS decision recordが固定した候補revisionを参照する。 |
| IR holding | `MPR-SH-IR-003`は153件のIR集合を`source_preserved_unassigned`で保全し、authority effectはnone。対象IR rowsは`docs/governance/legacy-migration/requirement/legacy-requirement-carry-forward.jsonl`のHIL-FR-48/49、各`carry_status: preserved_pending_rehome`、`successor_requirement_ids: []`、`decision_record: null`。原文とのexact joinは`legacy-ir-document-source-relation.jsonl` rows 81/82。 |

旧HIL-FR-48/49の要求statement semantic digestはそれぞれ`sha256:49d1f634eefe71ad7a79be172439935c1ba75c7bb889e05746c5c98fe28e9329`／`sha256:3a7cb511eea1c36e2c2453e2416c1e80de7926d7a6bafbeea6a7da577e47516b`。同一要求のIR copyを別source atomとして加算しない。

## 条件別の入力・出力・negative oracle

次表の期待結果は旧要求・assertion sourceに記された判定意味を読み直したものであり、新しいfailure codeや現行schemaを定義しない。旧error codeは識別のため括弧内に示すだけで、現行語彙へ移さない。

| 条件・旧case | 個別入力 | 期待する出力／negative oracle | 現行counterpartと残るgap |
|---|---|---|---|
| FR-48 正常な隣接vertical pair（031-01） | 同一対象revisionの隣接layer parent/child、対応row、双方向edge、scope・粒度・snapshot。 | 有効な組だけをvertical edge receiptへ結び、未解決descent/backpropがない状態を返す。これは旧期待値であって実行証拠ではない。 | L2/L11-040は12層のcatalog、row、edge、同revision coverageを定義する。L11-040の例はcatalogの片側edge欠落を扱うが、gate評価receiptと局所finding出力は別途特定されない。 |
| FR-48 上位義務の未降下（031-02） | 親rowが存在し、子側`derived_from`/downstream relationを一つだけ欠落させた隣接pair。 | 子へ降りていない義務に限ってfindingを返し、vertical receiptを成立扱いにしない（旧識別子`HIL_LAYER_VERTICAL_DERIVED_FROM_MISSING`）。 | L2-040はedgeの保持を契約する。L11-040は片側edgeの不備を一般例として拒否するが、上位→下位欠落を他方向の不備から独立したoracleにしない。 |
| FR-48 下位発見の未逆伝播（031-03） | 子側finding/source rowを保持し、親側`backpropagates_to`/`supersedes` edgeだけを欠落させる。 | 未逆伝播findingを別に返し、未解消状態を保持する（旧識別子`HIL_LAYER_VERTICAL_BACKPROP_MISSING`）。 | HARNESS-L2-003/004のBackflow意味と040のedge catalogは関連するが、要求が定めるpair gateの逆向き評価・独立出力は未特定。 |
| FR-48 adjacency bypass（031-05） | 正規層L5のchildが隣接親L4を飛ばしL3を直接参照するedge。 | bypassを指摘し、通常の隣接vertical pairとしてreceiptを成立させない（旧識別子`HIL_LAYER_VERTICAL_ADJACENCY_BYPASS`）。 | L2-040は正規layer catalogueを持つ。L11-040は層欠落やpair片側edgeを例示するが、L5→L3の非隣接edge拒否を明示しない。 |
| FR-48 granularity mismatch（031-06） | 親obligationより粗い単位のchildを、隣接edgeで接続する。 | 粒度不整合findingを返し、aggregate edgeを個別obligationの被覆として受理しない（旧識別子`HIL_LAYER_VERTICAL_GRANULARITY_INVALID`）。 | L2-040のcatalogはlayer/row粒度を定義するが、子が親より粗い場合の拒否oracleはL11-040の例から確定できない。 |
| FR-48/NFR-29 stale・revision・snapshot差（031-04/07/08） | edge targetの旧digest、parent/child semantic revision不一致、またはpair source snapshot不一致をそれぞれ単独投入する。 | 各条件をstaleとして示し、旧receiptをcurrentとして再利用せず新receiptを出さない。031-07/08では旧期待がpair receipt 0件。 | 040はrevision/snapshotの識別を含む。#2299監査は部分対応とした。これらはNFR-29 cross-conditionであり、FR-48の要求atom数に重複加算しない。 |
| FR-49 正常な6 V-pairとfeedback（032-01） | 同一対象revisionのcanonical 6 pair（L1↔L12、L2↔L11、L3↔L10、L4↔L9、L5↔L8、L6↔L7）、各atomic oracle、L12 feedback先L1と層外L0。 | pair単位の設計・verification joinが有効な範囲をreceiptへ結ぶ。L0 charterは独立した層外anchorであり7番目のpairにしない。 | 採択済みL2-040は6組とL0層外anchorを明示する。L2/L11-022は段階別検証・利用者受入契約。025/026は端から端設計と対のoracle設計を定める。これらは単独ではhorizontal gateの評価実行・receiptを意味しない。 |
| FR-49 各正規pair欠落（032-02〜07） | 6 pairのうち一組だけについて、対応設計edgeまたはverification edgeを個別に欠落させる。6組それぞれでscope・revisionは固定する。 | 欠けたpairだけをfindingにし、V-pair receiptのcomplete/green状態を返さない。旧sourceはpairごとに独立negative caseを置く。 | L2-040は6組の存在契約、L11-040はpair片側edge欠落の一般例を持つ。各pairの欠落を局所化する出力と6組それぞれのoracle対応は未特定。 |
| FR-49 L12 feedback先欠落（032-08） | 旧caseが対象にするL12 observationから層外L0 charterへのedgeを欠落させる。別条件としてsource本文のL12→L1 requirement feedback edgeを欠落させる。 | L0 anchor欠落はfeedback findingを返す（旧識別子`HIL_LAYER_FEEDBACK_L12_L0_ANCHOR_MISSING`）。L12→L1の欠落も独立にunknown/gapとして特定する。旧assertion case 032-08はL0欠落だけを表し、L12→L1のcaseがあるとは推定しない。 | 040はL0を別anchorとして持ち、L2-021はL12 observationから要求へ戻る関係を持つ。対象監査のL2-040/022/025/026では二つのfeedback edgeを個別照合するgate oracleは確定しない。L0をpairへ混ぜない。 |
| FR-49 forward片側欠落（032-13） | design→verificationのedgeだけを欠落させ、同じpairのreverse edge、scope、snapshotは保持する。 | forward欠落と対象pairを局所findingにし、非対称なpair receiptを成立させない（旧識別子`HIL_LAYER_VPAIR_FORWARD_MISSING`）。 | 040は双方向edgeのcatalog契約、025は双方向traceの設計整合を含む。forward欠落をpair gateで局所拒否する出力・receiptは未特定。 |
| NFR-29 cross-conditionのreverse片側欠落（032-09） | verification→designのreverse edgeだけを欠落させ、同じpairのforward edge、scope、snapshotは保持する。 | reverse欠落を別findingにし、非対称なpair receiptを成立させない（旧識別子`HIL_LAYER_VPAIR_REVERSE_MISSING`）。FR-49の032-13と対になる片側欠落だが、旧case 032-09のsource rowはHIL-NFR-29であり、FR-49のsource atom数には加えない。 | 040の双方向edge契約と対照するcross-conditionとして保持する。032-13と同一旧要求行へ移管しない。 |
| FR-49 oracle identity不一致（032-10） | 同一pair/snapshotに結んだdesign oracleとverification oracleでoracle IDを異ならせる。 | mismatch findingを返し、そのoracle joinを有効なpairとして採らない（旧識別子`HIL_LAYER_VPAIR_ORACLE_MISMATCH`）。 | 022はoracle・evidence・stage状態、025/026は対oracleの設計を扱う。identity一致／不一致をgateが局所拒否するoracleは未特定。 |
| FR-49 実行receipt欠落（032-11） | paired design/oracleはあるが対応するverification execution receiptがない。 | 状態はpairedに留め、green/verified相当を生成せず、欠落receipt findingを返す（旧識別子`HIL_LAYER_VPAIR_EXECUTION_MISSING`）。設計済みoracleを実行済み証拠に読み替えない。 | 022は実行結果・証拠を段階別に扱う。025/026は設計/対oracle出力であり、execution receiptではない。pair単位の「receipt欠落ならgreenなし」はこの対象節だけでは明示されない。 |
| FR-49 design/verification snapshot差（032-12） | design側とverification側のsnapshot revisionだけを不一致にする。 | staleとしてpair receipt 0件を返し、片側の新旧結果を合成しない（旧識別子`HIL_LAYER_VPAIR_SNAPSHOT_MISMATCH`）。 | 040はsnapshot identityを定義し、025/026はrevision-bound設計traceを持つ。現行L11にsnapshot差を実際のpair evaluationで拒否する専用例は未特定。これはNFR-29 cross-conditionとして別に保持する。 |

旧system assertion 031-09/032-14はassertion meta caseであり、FR-48/49のcondition atomへ追加しない。旧test-design側CASE-032-08のprojection-invalid入力と、上表のsystem assertion CASE-032-08のL12→L0 feedback-edge欠落は異なる。projection不正の別conditionはこの局所監査でFR-49へ取り込まない。

## 現行counterpartの責務境界

| Current identity | この監査で確認した機能 | FR-48/49 gateとの違い |
|---|---|---|
| HARNESS-L2/L11-040 | L1–L12 ledger type/粒度/node/edge・revision・coverage契約、canonical six pair、L0 anchorの別登録を規定。L11はcatalog構造・欠落・revision/edge不整合の例を持つ。L2-040のexact adopted revisionは2026-09-29 57候補判断表の`MPR-RC-HARNESS-L2-040-002`に固定。 | catalog/coverage契約の存在は全旧caseに対する実gate結果や局所pair receiptを意味しない。L11の一部反例を、6組・上下両方向・全粒度・stale各条件の網羅とみなさない。 |
| HARNESS-L2/L11-022 | Provisional→Integrated→Verified→Acceptedの段階別oracle/evidence/利用者受入条件、未評価保持、意味差のBackflow。2026-09-28 HARNESS decisionのexact revisionを使用する。 | pair接続の入力・評価単位を識別する材料であり、すべてのvertical/horizontal edgeを走査するpair gateと同一ではない。 |
| HARNESS-L2/L11-026 | L3要件から相互参照する設計と対の検証設計を作るunit、source/requirement/design/oracleのtraceと正常・誤り・未見例。2026-09-28 decisionのexact revision。 | 設計生成・設計案の照合契約。設計成果の生成だけでverification execution receiptやpair evaluation結果を生成しない。 |
| HARNESS-L2/L11-025 | 026と必要な接続を束ね、構成体固有の端から端trace・invariant・failure path・対oracleを確認するcomposite。2026-09-28 decisionのexact revision。 | 設計全体の整合とoracle設計であり、040の全layer catalogを評価する実行gateやpairごとのreceipt generatorとは別責務。 |

## 次候補の境界

- 現在の根拠だけではHIL-FR-48/49を既存要求から欠落と断定しない。旧IRのcarry statusは両方とも`preserved_pending_rehome`であり、人間decisionまたは正式successorは存在しない。
- 次の判定では、旧caseの各条件を (a) 現行要求の必須L11 acceptance meaning、(b) L3以降に具体化するgate algorithm/data structure、(c) OS側の保存・実行・receipt運転 に分類する。旧error code、API名、fixture ID/数、digest形式を新世代へ固定しない。
- 条件が(a)に属し、既存040/022/025/026の正確なrevisionで不足を特定できた場合だけ、ownerと影響revisionを分けたbounded requirement candidateを検討する。vertical pairとhorizontal V-pair、L12→L1/L0 feedback、NFR-29 stale/snapshotを一つの曖昧なcompositeへ束ねない。採択済み040/022/025/026本文を変更・上書きせず、新しいcandidate identityまたは対象revision付きL11 clarificationの要否を別途決める。
- 条件が(b)なら、要求意味が足りるか確認したうえでL3設計へ渡す。条件が(c)なら、OSの既存authority/state/projection要求との責務関係を独立照合する。旧gateが実装されていないこと自体は新L2を加える理由にしない。
- meaning owner、対象layer、必須／条件付き適用範囲、pair/scope/snapshotの判定入力、failure output、recovery/receipt要件のいずれかが未確定なら、L2/L11本文・registerは追加せず、未確定のままsource holdingに残す。

## 限界

本書は旧FR-48/49 line 138–139と参照したassertion cases、指定された現行HARNESS節、旧IR holding間の局所静的照合である。NFR-29全体、HIL-BR-25、HAC/HAT、IR全153件、実装consumer、保存writer、旧test/runtime、他機構の責務境界を閉じない。candidate、receipt、fixtureの存在から採択、実装、実行、受入、successor割当、要求stage完了は生成しない。
