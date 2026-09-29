# 現行17件のMPR候補に対するPO判断packet（2026-09-29）

基準commit: `a8dbf0daac7c7b6332521e9b73080e977a788222`（packet作成時点の`origin/main`）。本書はreview用worksheet兼監査snapshotである。記載したMPRはすべて`registered_proposal`／`authority_effect: none`のままであり、本書はPO判断、採択、保留、不採択、L3承認、工程完了、実装許可を生成しない。

## 判断対象と選択肢

POは候補ごとに、ここに固定した現行registrationと対になるL2/L11 section bytesを対象として、次のいずれかを選べる。

- **採択**：下記の候補意味を、このexact revisionについて採択する。採択しても実装・実行・旧source全体の被覆・source holding解除は主張しない。依存事項を明記し、関連候補は個別に判断する。
- **保留**：記載した意味、依存、親revisionまたはscopeの論点が解決するまで候補を採択しない。候補登録とsource holdingは別々に維持する。
- **不採択**：このexact candidate revisionを、理由と影響を記録して選ばない。不採択だけで無関係なsource holdingをretireしたり、別のsuccessorを割り当てたりしない。

**本packetでは選択肢を選ばず、採択も推奨しない。** 候補意味には新しい制約や計測責務が含まれる可能性があるため、意味を持つPO判断の対象として提示する。以下のreceiptにある`no_loss`は、そのreceiptが選択したsource atomの対応範囲だけを表し、旧source全体の被覆を意味しない。

## 現行候補revisionの固定

L2 section digestは現行最新MPRの`candidate_semantic_digest`。L11 digestは対応する`###` sectionの開始から次の同階層または上位見出しの直前までを取り、末尾空行を除き、UTF-8 LFを一つ付けたbytesのSHA-256である。各sourceの全file SHA-256は下表にまとめる。

| 候補identity | 現行最新registration | L2 section digest | L11 identity / section digest | 現行`version_target` |
|---|---|---|---|---|
| `HARNESS-L2-049` | `MPR-RC-HARNESS-L2-049-003` | `sha256:a5df1f7bdca708046ec9ad68e1eea0974884da63205b8995ad45dcd8f0bbc116` | `HARNESS-L11-049` / `sha256:f3fb47da21371084e9f8c7c7f7ca6dd945c8e98ae7c7b70597c3fc44e4e08ee7` | `1.0` |
| `HARNESS-L2-055` | `MPR-RC-HARNESS-L2-055-001` | `sha256:9f1e63176242d81d93a89a0c3823d3fbe689b8ebd0ae0de2f5a786b88e8787b5` | `HARNESS-L2-055` / `sha256:f1b9332d75fc5e07158165b0dbb0d037983ab1df0219dc5e519ceef3583aa96a` | unset |
| `HARNESS-L2-056` | `MPR-RC-HARNESS-L2-056-001` | `sha256:993283110e6faba06d7811df397179743b22a3f666e8a2e002da91c794eeade0` | `HARNESS-L2-056` / `sha256:9a8406bc5c2051eb0bed0bc57571f1e139c856d3559072dee8de3a019111a047` | unset |
| `HARNESS-L2-057` | `MPR-RC-HARNESS-L2-057-001` | `sha256:2c487f5408d31f0f982ab210be3df4d1d824bd75169b96bd1321cb0edd2a23ac` | `HARNESS-L2-057` / `sha256:8cc4692c5b2eb356809f30b47a3addb9206c0c4e0f4c11d9f505426cf7fe83e1` | unset |
| `HARNESS-L2-058` | `MPR-RC-HARNESS-L2-058-002` | `sha256:c50e2183bb1186bb585fbb80b924d628be74aaaf363515f047c74ef906d71bc3` | `HARNESS-L2-058` / `sha256:5dfc18281d1ab48e2d0cf81d4c9cfb6f3d7f035a38a5955cfcedc33d0f1875c9` | unset |
| `HARNESS-L2-059` | `MPR-RC-HARNESS-L2-059-001` | `sha256:9ebafbcc5b738dbaccaa53bfaff0b5843b0dd5fba30cc68beb51fe1dbe2e267f` | `HARNESS-L11-059` / `sha256:830646bc2f5bafcce50d20c88fb3d657ad7f5e2353dcf148628151a7c0992198` | unset |
| `HARNESS-L2-060` | `MPR-RC-HARNESS-L2-060-001` | `sha256:d4f0419f2095828ac041a28ca906f45d4dd79b5bfa83000097111f5d13235c30` | `HARNESS-L11-060` / `sha256:d4714dd28d70de6e7bc4a1c8ca4fe18784d825507ebd019ee2c6c716306b35b5` | unset |
| `HARNESS-L2-061` | `MPR-RC-HARNESS-L2-061-001` | `sha256:c44ffb80fec07ed6c0fe68e95bbd68358d87632b28d77caad96d28f231badb1a` | `HARNESS-L2-061` / `sha256:2323039d4fce66098d165d290c7bba20eadd59a86ff1f28069115ae45c82919a` | unset |
| `HELIXLABO-L2-070` | `MPR-RC-HELIXLABO-L2-070-001` | `sha256:07d9114fe55ed6bea2522756652cadec23f89397c619429360062256dc94e533` | `HELIXLABO-L2-070` / `sha256:c6268c5f97bfa3d87a1075d9aa6eac2eca20593e611c9aadcd92ee1025e9beb1` | `1.0` |
| `HELIXOS-L2-034` | `MPR-RC-HELIXOS-L2-034-003` | `sha256:6b019294047fce2e1c8b5d1b5e8d379fa9111f5912274f6dca918ffd81c0e1e8` | `HELIXOS-L2-034` / `sha256:b89f63d709b38de1ddc8b7ca7d51de595b9cae587da320e027aefed67a3a4e4b` | `1.0` |
| `HELIXOS-L2-054` | `MPR-RC-HELIXOS-L2-054-001` | `sha256:a9c1561ab310399fa27d5aca8bd9ebca8264176516357470157526df8c297eef` | `HELIXOS-L2-054` / `sha256:1021d37a8c3a94113c94aa1b92d3e8a79ae758f274aa40b570b5d151f7233aac` | unset |
| `HELIXOS-L2-055` | `MPR-RC-HELIXOS-L2-055-001` | `sha256:6d23a405ce2c0c6d56a65a4b02d9c39ead8533db3064058dcd7027b641fb9052` | `HELIXOS-L11-055` / `sha256:6bc639b45df952b7cf6cb7433ba3e2bfad978265681ac4ef0fbf03bdc4eb33a2` | unset |
| `HELIXOS-L2-101` | `MPR-RC-HELIXOS-L2-101-002` | `sha256:03ee1bbc860f879b9362eccc024f1cfa056b8cc3e364c16b4683ed18fe9598b5` | `HELIXOS-L2-101` / `sha256:bea9231cf52c1491768397621ecb9fd42f54f07b3eb323a3cfaa68aff08d818a` | unset |
| `HELIXOS-L2-102` | `MPR-RC-HELIXOS-L2-102-001` | `sha256:5d020c09b0e5686e01876e3c52d2ce10e8aded44a799a9f6374542d31de31218` | `HELIXOS-L11-102` / `sha256:0bfce78875f0e59ded0a2f2ecd31f39e795e043105d33c762d38e15251ea8459` | unset |
| `HELIXOS-L2-103` | `MPR-RC-HELIXOS-L2-103-001` | `sha256:6115a7190bad6a5ff449574a3150116dcdcd31e69f70e6a5b1625a59e171c7dc` | `HELIXOS-L11-103` / `sha256:b9d2360893edeb64152899f8a8bf71afa3ab3d9ec387300c8358885dfca823a0` | unset |
| `HELIXOS-L2-104` | `MPR-RC-HELIXOS-L2-104-001` | `sha256:a6346a95c796b0d1c2e72e5f24e150767ced6329b9f6137a9547370e82ad502d` | `HELIXOS-L11-104` / `sha256:b899b8da8d4bb85c5972b7e116e2f3837e61dd20a337018baeadb2a2a5dfe90f` | unset |
| `HELIXOS-L2-105` | `MPR-RC-HELIXOS-L2-105-001` | `sha256:81e6de13e8876410f69cf586f8aba014765864664d11ec68305d0fede366ad4c` | `HELIXOS-L11-105` / `sha256:5d075dc35360a2fe87839d2bb2acba4bdee6e6295fdcdbc6e64b60a85a5fcef2` | unset |

source fileと全file SHA-256:

| 機構 | L2 source / SHA-256 | L11 source / SHA-256 |
|---|---|---|
| HARNESS | `docs/helix-harness/L2-requirements/product-requirements.md` / `45955ffba1293b603f3c513ec1e9e328dd7bcf24b038463eb20dd480d1dc2108` | `docs/helix-harness/L11-acceptance/product-acceptance.md` / `411b1e5067c50d0fef789a9635d83031816bd984662906028844173a96b295be` |
| LABO | `docs/helix-labo/L2-requirements/labo-requirements.md` / `30f040fc451d6eca6f9c1be5727ccfebe1ee147d0375b36caee894194f7c848b` | `docs/helix-labo/L11-acceptance/labo-acceptance.md` / `ca658fcb9975028fbc5ec8a2b89efae81b41ec3d2fd3ebc7349674c0f4e7b328` |
| HELIX-OS | `docs/helix-os/L2-requirements/governance-requirements.md` / `e514fdf3bd8036d1cba0d3214368cd3bf03ba62fca4b372c946e5ae960dd9354` | `docs/helix-os/L11-acceptance/governance-acceptance.md` / `b537e5c456e054e3f5c6292c0f07f908404cbbed7db18672628a90ac2dabce2e` |

## 候補意味・source receipt・判断論点

pathはすべてrepository rootからの相対path。receiptは現行registrationの`coverage_receipt_ref`である。receiptのscopeと保全されたholdingはreceipt本文およびregisterの記録どおり維持する。

| 候補／PO選択肢（未選択） | 現行L2/L11が示す候補意味 | source receipt | PO判断に含める依存・未解決点・境界 |
|---|---|---|---|
| `HARNESS-L2-049` — 採択／保留／不採択 | すでに表示可能で利用許可のあるprototypeを入力として、画面scope/revision、device/view、適用profile、oracleに沿って表示を計測し、証拠、unknown、精度fixture、文言量findingを返す。prototypeは生成しない。 | `docs/governance/audits/requirement-registration/o10-visual-design-harness-coverage-receipt-2026-09-29-r3.json#HARNESS-L2-049` | 現行`-003`は`-002`をsupersedeし、L2 digestは同じだがL11 oracleが変わったため再判断が必要。#11は旧`-002`と旧L11の組だけを訂正待ち未採択とし、`-003`を対象に含めていない。O10の別論点は生成能力を将来049へ加える／別候補化／deferのいずれか。計測候補と混同しない。`MPR-SH-VDH-O10-001`は他のspan（VDH-FR-005 Patternを含む）を保持する。 |
| `HARNESS-L2-055` — 採択／保留／不採択 | 隣接layerの双方向trace gate結果として、下流への欠落・上流への戻り・粒度不一致・非隣接edge/aggregate・edge receipt findingを報告する。 | `docs/governance/audits/requirement-registration/hil-fr48-49-gate-outcome-coverage-receipt-2026-09-29.json` | 選択範囲はHIL-FR-48 atom。stale revision、NFR-29 cross-condition、HIL-FR-49異snapshot条件、関連IR行は保留中。この限定scopeで足りるか判断する。57件／11件の決定記録に本候補はない。 |
| `HARNESS-L2-056` — 採択／保留／不採択 | 6つのcanonical V-pairを不可分に扱い、L12 feedback先を保持し、必要evidence/oracleが片側または欠落ならpairを未完とする。 | `docs/governance/audits/requirement-registration/hil-fr48-49-gate-outcome-coverage-receipt-2026-09-29.json` | 選択範囲はHIL-FR-49 atomのみ。NFR-29、snapshot不一致、IR条件はsource holdingに残る。同じreceipt・隣接行でもHARNESS-055と分けて判断する。 |
| `HARNESS-L2-057` — 採択／保留／不採択 | HIL-FR-07のHARNESS側について、gate outcomeの意味とclose適格条件を定める。 | `docs/governance/audits/requirement-registration/hil-fr07-closure-coverage-receipt-2026-09-29.json` | gate意味はHARNESSが所有し、OS-054はPR/CI/audit/style/child-Issue/closure-receiptの運転を別途提案する。両候補は別々に判断し、依存がある場合は明記する。一方の決定から他方を推定しない。旧memory-compaction atomはreceipt対象外。 |
| `HARNESS-L2-058` — 採択／保留／不採択 | PR findingを6区分に分類し、それぞれがcurrentまたはsuccessor scopeかを判定する。 | `docs/governance/audits/requirement-registration/hil-fr09-disposition-coverage-receipt-2026-09-29-r3.json` | OS-101の証拠receipt・appeal連結と意味partitionを対応させるが、owner責務ごとに判断する。旧directive-disposition分類は`MPR-SH-DIRECTIVE-DISPOSITION-002`に残る。本候補はHIL-FR-09またはNFR-21全体ではない。 |
| `HARNESS-L2-059` — 採択／保留／不採択 | Issue contractの11個の意味fieldと必須存在・欠落時の扱いを定め、field意味はHARNESSが持つ。 | `docs/governance/audits/requirement-registration/hil-fr03-issue-contract-coverage-receipt-2026-09-29.json#HARNESS-L2-059` | OS-102はdurable intake/projection/handoffでcontractを受け取るが、field意味を決めない。より広いIR条件は保留中。HARNESS意味とOS接続を別々に判断し、両方を採る場合は互換性を明示する。 |
| `HARNESS-L2-060` — 採択／保留／不採択 | 工程入力commit/tree revisionとscopeをstage evidenceへ結び、別revisionの入力に対してevidenceを読めないようにする。 | `docs/governance/audits/requirement-registration/hil-fr01-path-coverage-receipt-2026-09-29.json#HARNESS-L2-060` | OS-103はappend-only event/current projectionとparent/cause lineageを別途提案する。stage順序と全工程共通のpredecessor receipt条件は選択atomに含まれない。入力意味とevent保存/projectionを分けて判断する。 |
| `HARNESS-L2-061` — 採択／保留／不採択 | 文書のみを対象とするread-only quality reviewについて、起動条件、4つのreview観点、review未起動時のfail-closed、および記録付きPO例外を定める。 | `docs/governance/audits/requirement-registration/doc-quality-review-coverage-receipt-2026-09-29.json#BR08-FR45-DOC-REVIEW-COVERAGE-2026-09-29` | 旧BR-08/FR-L1-45から選んだatomのみ。source identityにformal successorはまだなく、残りのsource atomはholdingにある。選択前に「PO例外」の意味、4観点と起動条件の十分性を検討する。本候補だけでreviewerや現行review routingは確定しない。 |
| `HELIXLABO-L2-070` — 採択／保留／不採択 | scope付きの補助telemetry scorecardとして4種の待ち時間、escaped defects、rollback/recovery、observer overhead、evidence freshnessを示し、条件が合うfirst-pass/repair・Attempt metricを別定義・別receiptのまま併記する。 | `docs/governance/audits/requirement-registration/labo-supplemental-telemetry-coverage-receipt-2026-09-29.json#HELIXLABO-L2-070` | 旧candidate line 399のうち9 atomを選択。3 atomは別候補に属し、意味未解決の2 atomは`MPR-SH-CANDIDATE-003`に残る。採択済みLABO-059/006/001を置換せず、LABO-067/068も採択しない。追加の計測・提示負担とunknown/unavailable動作が意図どおりか判断する。 |
| `HELIXOS-L2-034` — 採択／保留／不採択 | 元の指示／findingの処分に関する証拠、根拠、異議履歴を、限定されたOS記録・接続契約として保持する。 | `docs/governance/audits/requirement-registration/os-directive-disposition-coverage-receipt-2026-09-28-r3.json#HELIXOS-L2-034` | revision追補：`-003`は`-002`をsupersedeし、source atom digestと選択scopeが更新された。先行PO判断#57は`-002`だけを対象にし、採択は継承しない。旧FR-09処分分類全体を閉じず、`MPR-SH-DIRECTIVE-DISPOSITION-002`も残る。追加atomを確認し、directive dispositionとfinding dispositionを区別する。後続のPO判断で現行revisionを別個に判断する。 |
| `HELIXOS-L2-054` — 採択／保留／不採択 | OSがclosure evidence参照を照合し、PR、CI、独立audit、選択merge方式、child Issue、closure receipt出力を含むclose handoffを記録・運転する。 | `docs/governance/audits/requirement-registration/hil-fr07-closure-coverage-receipt-2026-09-29.json` | gate outcomeとclose適格性のHARNESS-057意味/oracleに依存するが、新たなmerge admissionを作らず、OS evidenceでHARNESS意味を代替しない。OS候補として別に判断する。旧memory-compaction atomは対象外。 |
| `HELIXOS-L2-055` — 採択／保留／不採択 | 実装開始前にready Issueをclaim/leaseし、工程・authority照合に伴うclaim/blocking/lease結果を記録する。 | `docs/governance/audits/requirement-registration/helixos-fr08-ready-claim-coverage-receipt-2026-09-29.json` | 旧HIL-FR-08をpartitionし、claimとlease/output atomを選択した一方、意味差のあるuniform reverse/redesign/pair-freeze gateは保留した。claim範囲と、既存HARNESS/OS authority・gate条件の利用方法を確認する。receiptの`no_loss`はFR-08全体の被覆ではない。 |
| `HELIXOS-L2-101` — 採択／保留／不採択 | HARNESSのfinding意味を裁定せず、PR finding-disposition receiptを永続化し、異議をその証拠へ連結する。 | `docs/governance/audits/requirement-registration/hil-fr09-disposition-coverage-receipt-2026-09-29-r3.json` | 現行exact候補は`-002`。HARNESS-058とのfield/partition互換性を確認し、OSの証拠・異議連結とHARNESSの意味分類を分離する。旧directive/NFR/IR条件全体は選択されていない。 |
| `HELIXOS-L2-102` — 採択／保留／不採択 | source identity、11-field表現、contract revision、digestを保持し、HARNESS Issue contractをdurableにintake、projection、handoffする。 | `docs/governance/audits/requirement-registration/hil-fr03-issue-contract-coverage-receipt-2026-09-29.json#HELIXOS-L2-102` | field意味はHARNESS-059に依存し、OSが意味を補完、正規化、検証しない。旧exactly-once/duplicate/conflict/quarantineや他のIR条件は明示的に範囲外で保留中。旧storage contractを復活させず接続責務を判断する。 |
| `HELIXOS-L2-103` — 採択／保留／不採択 | exact scope/revisionについて、append-only stage event、current-state projection、参照可能なparent/cause lineageを相互参照可能に保つ。 | `docs/governance/audits/requirement-registration/hil-fr01-path-coverage-receipt-2026-09-29.json#HELIXOS-L2-103` | HARNESS-060の入力revision意味を使う。stage順序・遷移規則・predecessor receipt・pass/close意味は定めず、HARNESS等の既存ownerまたは保留sourceに残る。event記録/projection接続として別途判断する。 |
| `HELIXOS-L2-104` — 採択／保留／不採択 | 同一operation/scope/revisionについて、SECURITYのauthority、worker isolation適用の観測、HARNESSの品質受入という3 owner結果を代用せず連結する。 | `docs/governance/audits/requirement-registration/legacy-candidate-line-000603-three-checks-coverage-receipt-2026-09-29.json#HELIXOS-L2-104` | registrationの親L1 revisionは`draft_candidate`と記録され、親承認は主張されていない。採択前に現行親authority/revisionを確認する。旧crosswalkの1 atomのみ選択。既存owner contractが前提で、本候補は新gateやdeny authorityを加えない。 |
| `HELIXOS-L2-105` — 採択／保留／不採択 | 限定incident episodeのrecovery-check参照とsource revisionをprocedure／rollback記録へ結び、rollback未実施も明示recordとして扱う。報告するのは記録一式の充足だけ。 | `docs/governance/audits/requirement-registration/phcap17-incident-episode-coverage-receipt-2026-09-29.json` | #2321はこの現行候補を扱うが、57件または11件のformal decision表には含まれない。incidentをcloseせず、health/releaseを主張せず、本番authorityを生成せず、immediate release/backfill役割も解決しない。`MPR-SH-PHCAP17-INCIDENT-001`とHIL-FR-16 holdingを維持する。 |

## revision追補とsource holdingの照合

- **HARNESS-049**：現行registrationは`MPR-RC-HARNESS-L2-049-003`。`-002`をsupersedeしL2 semantic digestは維持するが、対応L11 section digestは訂正後の計測専用oracleである。#11記録は旧未採択状態を`-002`と旧L11 digestに限定し、訂正後のexact revisionについてPO再確認を求める。#2322はL11訂正でありPO判断を含まない。後続のPO判断では`-003`と訂正後L11 digestを対象にする。
- **HELIXOS-034**：現行registrationは`MPR-RC-HELIXOS-L2-034-003`で、`-002`をsupersedeし、L2 digestとsource atom setも変わった。前の#57/#11決定表に現行exact `-003`はないため、#2322または後続PO記録で別個に判断する。
- **57候補PO記録の先行する4件の保留**：`HARNESS-L2-045`（値の責務・単位・欠落/読取不能/超過時の扱いを確定）、`HELIXOS-L2-030`（実行OSとconsumerの分離、配布/切替条件を確定）、`HELIXOS-L2-039`（HARNESS-045とcontract/version/budget条件を揃える）、`HELIXOS-L2-045`（scope、version target、HARNESSからOSへの所有移動の有無を明記）。これらは現行17候補に含まれず、各保留を上表の候補への保留票と解釈しない。
- **source coverageは未完**：receiptは各receipt/registerに記載されたselected atomに限定される。本packetは旧source母集団、旧acceptance/negative-oracle、全候補の処置、stage 5完了を証明しない。特にstage-5の旧source coverageは未証明のままである。

## 実施した静的確認

- packet基準commitを確認し、project作業入口、現行MPR register、対応するL2/L11 section、関連receipt、#57/#11判断記録、既存O10 candidate packet、判断後のlive-authority照合auditを読んだ。
- append-only registerから`requirement_identity`ごとの最新registrationを選び、17件のidentity集合、registration ID、candidate digest、receipt参照、L2記載の`version_target`を照合した。
- 基準commitのbytesから全L11 section digestと6つのsource全file SHA-256を再計算した。旧workflow、CLI、hook、runtime、test、CIは実行していない。
- 本草案はauthorityを作らず、live systemへの操作も行わない。
