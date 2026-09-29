# live MPR authority照合（2026-09-29、main `968e9c5`）

## 対象と結論

基準commitは `968e9c517366112093090ba4d874b3ca6b18af6b`（PR #2324 merge後）。この監査は、そのcommitに含まれるappend-only MPR registerの各`requirement_identity`について、最も新しいregistrationを選び、対象revisionに対する既存PO判断記録と照合した読み取り専用の時点記録である。

| live identity | exact live revisionを採択 | exact live revisionを保留 | 未判断 | 合計 |
|---:|---:|---:|---:|---:|
|  | 310 | 4 | 18 | 332 |

「採択」には、採択条件がその判断記録に列挙される条件付き採択を含む。条件付き採択は記録された条件とexact revisionの範囲に限る。保留は採択や不採択ではない。候補registerの`registered_proposal`、`authority_effect: none`はregister上の登録状態であり、採否は対象revisionを固定したPO判断記録から読む。

この集計はL1/L2の要求判断状態である。L3承認、実装・実行・受入、release許可、旧source全体のcoverage、要求Stage完了を示さない。

## 算定根拠

1. 8機構の2026-09-28 PO判断記録は固定したL1対象revisionとL2/L11要求revisionに対して、計250候補を採択した（HARNESS 24、OS 16、BRAIN 42、LABO 53、INTELLIGENCE 54、SECURITY 28、INFRASTRUCTURE 26、CONNECT 7）。入口と各判断記録は[新世代作業入口](../../new-generation-start-here.md)に列挙されている。
2. #2295の判断記録は57候補を固定し、42件を採択、11件を条件付き採択、4件を保留とした。[57候補判断記録](../../decisions/po-decision-2026-09-29-57candidates.md)。
3. その後の[11候補判断記録](../../decisions/po-decision-2026-09-29-11candidates.md)は10件を採択し、HARNESS-L2-049の`-002`を採択対象外とした。採択10件には、従前に対象外だった候補と、HARNESS-L2-041およびHELIXOS-L2-038の新しい生存revisionが含まれる。HARNESS-L2-049 `-003`は別revisionであり、この判断記録の対象ではない。
4. #2323で共有された[現行17候補のPO判断packet](po-decision-packet-live-17-candidates-2026-09-29.md)は判断worksheetでありPO判断ではない。packetの17 identityは、HARNESS-L2-049 `-003`、HARNESS-L2-055〜061、HELIXLABO-L2-070、HELIXOS-L2-034 `-003`、HELIXOS-L2-054/055、HELIXOS-L2-101〜105。#2324で追加されたHELIXOS-L2-106を合わせ、未判断は18 identityとなる。
5. #2295後の旧live照合は基準 `c258bfe8` で315 identity／305 exact-revision decisioned／10 undecidedだった。この基準からmain `968e9c5`までは17 identityが増え、判断記録に含まれない後続revisionもある。HARNESS-L2-049の`-003`およびHELIXOS-L2-034の`-003`を旧revisionの判断から継承せず、registerの最新状態と判断recordの対象集合を再照合した結果が本書の332件である。旧照合の315件集計を現行値として再利用しない。

採択310件の算術は`250 + 53 + 8 - 1 = 310`。8は11候補判断で新たに採択されたlive identity（HARNESS-048、BRAIN-031、HARNESS-050〜054、OS-053）。HARNESS-041とOS-038は同判断で後続registrationが採択されたが、identity自体は先行250／57件の採択集合に含まれるため二重計上しない。`-1`は、先に採択されたHELIXOS-L2-034 `-002`を後続未判断revision `-003`がsupersedeした分である。4件の保留は57候補判断の明示保留であり、合計は`310 + 4 + 18 = 332`。

## 現行の保留・未判断revision

### 保留4件

| identity | 現在の保留判断 | 解除条件の要旨 |
|---|---|---|
| `HARNESS-L2-045` | #2295で保留 | WBS予算・期限の決定責務、単位、未設定・参照不能・超過時の扱いを確定する。 |
| `HELIXOS-L2-030` | #2295で保留 | HELIX本体の実行OSとconsumer側のOS、配布段階・切替条件を分けて確定する。 |
| `HELIXOS-L2-039` | #2295で保留 | HARNESS-045と対にし、契約・版・予算条件をそろえる。 |
| `HELIXOS-L2-045` | #2295で保留 | 対象機構集合、version target、HARNESSからOSへの所有移動の有無を明記する。 |

根拠とexact revisionは[57候補判断記録](../../decisions/po-decision-2026-09-29-57candidates.md)を参照。保留は機能の削除・不採用ではない。

### 未判断18件

下表の各registrationは基準commitのregisterにあるidentityごとの最新行。section digestはregisterの`candidate_semantic_digest`。HARNESS-055〜058のrevisionは、旧#2295後照合にあったHARNESS-055/056などの別候補と混同せず、この基準mainの行を採用する。

| identity | latest registration | L2 section digest |
|---|---|---|
| `HARNESS-L2-049` | `MPR-RC-HARNESS-L2-049-003` | `a5df1f7bdca708046ec9ad68e1eea0974884da63205b8995ad45dcd8f0bbc116` |
| `HARNESS-L2-055` | `MPR-RC-HARNESS-L2-055-001` | `9f1e63176242d81d93a89a0c3823d3fbe689b8ebd0ae0de2f5a786b88e8787b5` |
| `HARNESS-L2-056` | `MPR-RC-HARNESS-L2-056-001` | `993283110e6faba06d7811df397179743b22a3f666e8a2e002da91c794eeade0` |
| `HARNESS-L2-057` | `MPR-RC-HARNESS-L2-057-001` | `2c487f5408d31f0f982ab210be3df4d1d824bd75169b96bd1321cb0edd2a23ac` |
| `HARNESS-L2-058` | `MPR-RC-HARNESS-L2-058-002` | `c50e2183bb1186bb585fbb80b924d628be74aaaf363515f047c74ef906d71bc3` |
| `HARNESS-L2-059` | `MPR-RC-HARNESS-L2-059-001` | `9ebafbcc5b738dbaccaa53bfaff0b5843b0dd5fba30cc68beb51fe1dbe2e267f` |
| `HARNESS-L2-060` | `MPR-RC-HARNESS-L2-060-001` | `d4f0419f2095828ac041a28ca906f45d4dd79b5bfa83000097111f5d13235c30` |
| `HARNESS-L2-061` | `MPR-RC-HARNESS-L2-061-001` | `c44ffb80fec07ed6c0fe68e95bbd68358d87632b28d77caad96d28f231badb1a` |
| `HELIXLABO-L2-070` | `MPR-RC-HELIXLABO-L2-070-001` | `07d9114fe55ed6bea2522756652cadec23f89397c619429360062256dc94e533` |
| `HELIXOS-L2-034` | `MPR-RC-HELIXOS-L2-034-003` | `6b019294047fce2e1c8b5d1b5e8d379fa9111f5912274f6dca918ffd81c0e1e8` |
| `HELIXOS-L2-054` | `MPR-RC-HELIXOS-L2-054-001` | `a9c1561ab310399fa27d5aca8bd9ebca8264176516357470157526df8c297eef` |
| `HELIXOS-L2-055` | `MPR-RC-HELIXOS-L2-055-001` | `6d23a405ce2c0c6d56a65a4b02d9c39ead8533db3064058dcd7027b641fb9052` |
| `HELIXOS-L2-101` | `MPR-RC-HELIXOS-L2-101-002` | `03ee1bbc860f879b9362eccc024f1cfa056b8cc3e364c16b4683ed18fe9598b5` |
| `HELIXOS-L2-102` | `MPR-RC-HELIXOS-L2-102-001` | `5d020c09b0e5686e01876e3c52d2ce10e8aded44a799a9f6374542d31de31218` |
| `HELIXOS-L2-103` | `MPR-RC-HELIXOS-L2-103-001` | `6115a7190bad6a5ff449574a3150116dcdcd31e69f70e6a5b1625a59e171c7dc` |
| `HELIXOS-L2-104` | `MPR-RC-HELIXOS-L2-104-001` | `a6346a95c796b0d1c2e72e5f24e150767ced6329b9f6137a9547370e82ad502d` |
| `HELIXOS-L2-105` | `MPR-RC-HELIXOS-L2-105-001` | `81e6de13e8876410f69cf586f8aba014765864664d11ec68305d0fede366ad4c` |
| `HELIXOS-L2-106` | `MPR-RC-HELIXOS-L2-106-001` | `b1f3d62a007f954a788602fbff45fa70d3b8bb4b2fec547113a0db30d9598fcc` |

HARNESS-L2-058の現行latest registrationは`-002`である。HARNESS-L2-055/056/057はそれぞれ`-001`。これらはregister実データおよび#2323 packetで照合した。

## #2324後のHELIXOS-L2-106 exact revision

HELIXOS-L2-106は#2323 packetの17件には含まれない後発候補で、`968e9c5`のMPR registerと候補本文で次のように固定される。

| 項目 | 基準commit `968e9c5` の値 |
|---|---|
| Registration | `MPR-RC-HELIXOS-L2-106-001`（`registered_proposal`, `authority_effect: none`） |
| L2節 | `sha256:b1f3d62a007f954a788602fbff45fa70d3b8bb4b2fec547113a0db30d9598fcc` |
| L11節 | `HELIXOS-L11-106`, `sha256:bc577dcbe57f06daefe80618ee2787012794e2489d46b32c7b0fcb85d32bc835` |
| L2 file | `docs/helix-os/L2-requirements/governance-requirements.md`, `sha256:9b4a26cb92654b133b6154dffec903ab745132be96173cc049782c5faa6a5f3a` |
| L11 file | `docs/helix-os/L11-acceptance/governance-acceptance.md`, `sha256:8ac93048fbc05032e6b1e578a944620089c0eae528bd7fb1d3cf2a125faf4e2e` |
| Coverage receipt | [`dac-fr-003-authority-binding-coverage-receipt-2026-09-29.json`](../requirement-registration/dac-fr-003-authority-binding-coverage-receipt-2026-09-29.json) |
| Receipt file SHA-256 | `0b91c82ed9d92c723c391ad828f058a282f7e56e37132f333b32303d913b9ed2` |
| Source input | `CONFIRMED-DAC-FR-003` 1 atom、archive `document-authority-census-requests.md:50`、`LEGACY-ASSET-D201753B1A0CC6EA3980` |

receiptの`candidate_input_coverage_result: no_loss`はその1 atomの限定candidate mappingだけを表す。`MPR-SH-CONFIRMED-003`のholdingは生存し、formal successor、owner移管、適用対象、PO採択、DAC-FR-003全体closureは未確定である。[DAC-FR-003局所監査](dac-fr-003-authority-binding-recursive-target-2026-09-29.md)とreceiptのscopeを超えてcoverageを主張しない。

## Stage6との関係と旧source根拠

この追補はlive MPRのexact-revision authority censusであり、既存の[PO後横断監査](post-po-cross-mechanism-audit-2026-09-28.md)や[REG-06 population audit](legacy-source-origin-reg06-population-audit-2026-09-28.md)の履歴本文を変更・置換しない。8機構判断とMPR採択数だけでは旧source closureを証明しない。既存REG-06監査が示すIR 153、confirmed identity 175、補助source 134はいずれもformal successor assignment 0であり、v1.3 521行・旧candidate 4,755行・semantic-line inventoryのcondition coverageも未完である。したがって本書からStage5/6完了やL3移行を生成しない。

最後のPO後横断監査は `85cee18960bd1973fb1b28132e6498464b0f673b`を基準とする2026-09-28記録で、8機構判断後の責務・依存・版の限定照合である。#2295の57候補判断、後続11候補判断、#2323の17候補packet、#2324のOS-106は同監査の対象外であり、同監査の「その範囲で新たな衝突なし」を後続候補の横断整合やStage6閉鎖へ外挿しない。

旧HELIXの「各層で旧HELIXの機能sourceを必ず含める」inventory-first規則と「人が要求を持ち、AIは要件を起草して承認へ送る」自律境界は、旧`archive/legacy-generation-2026-09-14/root/CLAUDE.md:72-85`に記載される。現行監査ではこの保持点を使い、旧sourceを読み取り専用の起点として扱う。旧CLI、workflow、runtime、test、CIは実行していない。

## 静的照合方法

- `management-provisional-requirement-register.jsonl`の全行をJSONとして読み、`requirement_identity`ごとに最後のregistrationを選択した。基準treeのlive identityは332件で、全件が`requirement_candidate`である。
- 8機構、57候補、11候補の判断記録の対象identity・registration範囲を基準treeのlatest registrationへ照合した。判断はlatest exact revisionに一致するときだけ数えた。
- 18未判断行のregistration ID・L2 digestはregisterから照合した。OS-106のL11/file digestとcoverage scopeは、L2/L11本文、DAC-FR-003監査、receiptで照合した。
- これは文書・register・revisionの静的確認であり、旧CIやruntime、candidateを実行していない。
