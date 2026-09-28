# 旧source照合の現行authority overlay（2026-09-29）

基準main: `10e061a406b8d5655cbac483a3e6ea4988ac2380`（PR #2295 merge commit）。
対象: 2026-09-28のREG-06 population auditが記録した歴史的な照合結果に、2026-09-29の57件PO判断が与える現在のauthority効果を重ねて読むための追補。
本書は旧sourceを再調査する全件監査ではなく、既存のsource/line inventory、candidate receipt、PO判断記録を参照する有効状態overlayである。

## 現行判断が更新する範囲

REG-06の基準main `fc9551321196a18f5e3a6d1f67ccf266be8237bc`時点では、「現行41候補packetはすべて未採択」と記録されていた。その文は同監査の対象時点を示す歴史的記録として保持する。現在は[#2295のPO判断記録](../../decisions/po-decision-2026-09-29-57candidates.md)が、その記録にexact identityと本文digestで固定した57件のL2/L11 revisionに対して有効である。

| 処置 | 件数 | authority効果 |
|---|---:|---|
| 採択 | 42 | 判断記録の各行に固定されたL2/L11 revisionに限る |
| 条件付き採択 | 11 | 記録に列挙された選択・配置・scope条件とrevisionを一体として適用 |
| 保留 | 4 | 記録に列挙された保留対象のまま |
| 合計 | 57 | 57件以外へは波及しない |

条件付き3件 HELIXOS-L2-049/-050、HELIXCONNECT-L2-009は[#2294の訂正後L11](https://github.com/RetryYN/HELIX-HARNESS/pull/2294)を対象とする。HELIXOS-L2-052の範囲は所有を確認できる未使用local作業領域の整理と後続PRを変えない照合であり、remote branch削除を含まない。HELIXLABO-L2-062は`version_target: 2.0`を維持する。

本判断に含めない後発候補は、HARNESS-L2-048、HELIXBRAIN-L2-031、HARNESS-L2-049である。条件判断の表、各registration ID、L2/L11 section digest・file SHA、receipt参照は判断記録を正本とし、本overlayは再掲しない。

## live candidate registerとの照合

現行append-only register 600行から、`requirement_identity`を持つ最新registrationをidentityごとに読むとlive candidate identityは310件である。うち250件は8機構のPO判断記録（HARNESS 24、OS 16、BRAIN 42、LABO 53、INTELLIGENCE 54、SECURITY 28、INFRASTRUCTURE 26、CONNECT 7）に固定され、残る57件は本節冒頭の#2295判断記録に固定されている。したがって現時点の照合は**310 = 307 decisioned + 3 undecided**である。

| live identity | latest registration | 現在の状態 |
|---|---|---|
| `HARNESS-L2-048` | `MPR-RC-HARNESS-L2-048-001` | #2295の対象外。`registered_proposal` / `authority_effect: none`のまま |
| `HELIXBRAIN-L2-031` | `MPR-RC-HELIXBRAIN-L2-031-001` | #2295の対象外。`registered_proposal` / `authority_effect: none`のまま |
| `HARNESS-L2-049` | `MPR-RC-HARNESS-L2-049-002` | #2295の対象外。`registered_proposal` / `authority_effect: none`のまま |

register status、receipt、main掲載、候補本文の存在から、上記3件またはその他の候補のPO採択を生成しない。未決の3 identityを310/307/3の照合で採択・保留・不採択へ振り分けたことにもならない。各live registrationと判断記録のidentity集合を照合した結果を示すだけである。

PO判断の適用は、下表のsource atomがすでにcandidate receiptへ選択登録されている場合でも、そのexact candidate revisionの採否を確定するところまでである。receipt上の選択source atomを超えた旧要求全体の被覆、formal successor、L11受入実行、実装、初回release範囲、旧source retirement、要求stage完了は生成しない。登録台帳の`authority_effect: none`と`registered_proposal`は候補登録の性質を表す。採否はPO判断記録とexact revisionの対応から読む。

## 57件と旧sourceの接点：証拠がある範囲

次は、PO判断対象の中で既存receiptが特定の旧source atomを選んでいる代表例である。source atom集合・scopeの正本は各receiptであり、下表の一覧は全57件対全旧sourceの再crosswalkではない。selected atomに限った対応を示し、同じ文書・family・IDの未選択条件へ拡張しない。

| 判断対象 | 対応を示す既存receipt/source | 現在読めること | 残る境界 |
|---|---|---|---|
| HARNESS-L2-034 | `harness-measurement-contract-coverage-receipt-2026-09-28-r3.json`。旧v1.3 §4.3の選択spanと、旧HR-NFR-REG-001〜007の基準/pre-isolation atom | 計測契約候補のexact revisionは採択された。receiptが選んだatomの範囲で判断対象になる | v1.3全521行、旧NFR registry全体、運用計測・実装の回復は主張しない |
| HARNESS-L2-039 | `harness-experience-contract-coverage-receipt-2026-09-28-r3.json`。v1.3 Experience/UI/Frontendの選択atomとHR-FR-DHR001–006の基準/pre-isolation revision atom | experience contract候補のexact revisionは採択された | receiptが明示的に除外する211資産、技術実現、状態entity詳細、v1.3全体は閉じない |
| HARNESS-L2-040/-041 | `harness-layer-ledger-extraction-coverage-receipt-2026-09-28-r2.json`。旧HIL-FR-46/-47の選定条件 | 2候補への分割条件は採択された | ledger登録writer、layer snapshot生成、ledgerへの候補行追加の実行・保存はholdingに残る。HIL-FR-18、HAC/HAT全体は閉じない |
| HARNESS-L2-043/-044 | `harness-template-example-coverage-receipt-2026-09-28.json`（HIL-FR-55の選択行）、`harness-contract-portfolio-coverage-receipt-2026-09-28.json`（HIL-FR-54の選択行） | 記録されたBルート等の条件付き採択が適用される | FR-55の他source/IR/HAC/HATやFR-54以外のportfolio atom、旧template/portfolio runtimeはreceiptのscope外 |
| HELIXSECURITY-L2-034 | `security-v13-hyb-002-profile-coverage-receipt-2026-09-28.json`。旧v1.3 HR-FR-HYB-002の選択された6 atom | MCP profileの指定6 atomに対する候補revisionは採択された | 同一旧2行の残り6 atomと旧全体の条件閉包は別holdingに残り、全source closureを意味しない |
| HELIXLABO-L2-064/-065 | `labo-worker-blind-coverage-receipt-2026-09-28-r2.json`（旧HIL-NFR-35 1行）、`labo-bench-qualification-scorecard-coverage-receipt-2026-09-28.json`（旧HIL-FR-61/-62 2行） | 旧Worker/BENCH sourceの記録されたatomと候補revisionの関係が採択対象になる。065の条件は判断記録のD1選択を適用する | 旧IRとの意味重複を二重計上せず、全Worker評価・Bench文書・他Bench条件や実装を閉じない |
| HELIXOS-L2-049/-050 | `helixos-worker-utilization-coverage-receipt-2026-09-29-r4.json`、`helixos-reviewer-capacity-coverage-receipt-2026-09-29-r3.json`。選択された旧candidate spanのみ | 訂正後L11を含むexact candidate revisionに記録された条件を採択 | 各receiptのpending remainderと旧source family全体を保全。全worker/provider matrixのsuccessorは主張しない |
| HELIXCONNECT-L2-009 | `connect-o7-direction-feedback-coverage-receipt-2026-09-29-r2.json`。直接legacy atom集合は0、5行はreference-only | 新しい候補revisionに対するA条件付き採択 | CONNECTの旧source意味をcoveredにしない。receiptはarchive限定検索外のclosureも主張しない |

他の採択・条件付き採択・保留対象も同じPO判断記録にexact revisionで列挙されている。行名の一致、関連IDへの参照、候補登録、receiptの`no_loss`だけでは、未選択source atomの被覆や旧条件の採択を推定しない。特にPO判断記録は、候補 `HARNESS-L2-041/-043/-044`、`HELIXLABO-L2-061/-064/-065` などと関連する旧要求の残差をcoveredまたはformal successor済みに数えないよう明記する。

## 旧source母集団の未完了境界

[REG-06の人口・join監査](legacy-source-origin-reg06-population-audit-2026-09-28.md)と[機械可読台帳](legacy-source-origin-reg06-population-audit-2026-09-28.json)のsource populationは、57件の判断で次のようには閉じない。

| 母集団 | 現時点の証拠 | 残る条件 |
|---|---|---|
| Requirement IR | 153 identity（IR108 108件＋IR45 45件）、153/153 `preserved_pending_rehome`、formal successor 0 | IRとconfirmed identityの重複候補を解き、各原条件・出力・否定oracleを現行L2/L11又は記録済み処置に条件単位で結ぶ |
| confirmed identity | 175件、175/175 `preserved_pending_rehome`、formal successor 0。158件の`non-residual`は監査分類であって移行完了ではない | source-qualified conditionごとの保持・再導出・置換・版印・記録付き廃止を明示する |
| 補助source | system contract 24、refinement 14、acceptance 72、system test 24。旧schema relationは現行のsuccessorや受入実行ではない | contract/AC/HAT/refinementを親条件・出力・拒否oracleごとに閉じる。親relation unmappedを残さない |
| v1.3 | 521非空行、303 condition / 154 description / 64 heading。conditionはcovered 3、partial 84、unresolved 171、implementation-only 31、version-target 14。formal successor 0 | [行別監査JSON](legacy-v13-semantic-condition-audit-2026-09-28.json)の`REQSRC-SUP-*`各行を閉じる。§4.3、§4.5、§4.6.1、§4.11を優先して詳細条件とL11 oracleを確認する。description行も規範条件の続きでないか全量分類する |
| 旧candidate | 92文書、4,755非空行。累積訂正後872 requirement-atom行（141 source relation/coverage未解決、155未採択candidate route、576 unknown）、2,957 explanation、926 structure | [意味route JSONL](legacy-candidate4755-semantic-routing-2026-09-28.jsonl)と訂正overlayを基にatom単位で判断する。explanation 2,957行も未検査の要求を含み得る。candidateのhistorical/draft authorityを保つ |
| semantic line inventory | 2,386 spans、うち2,058 pending atomization（721 review units） | 721 unitを要求・制約・受入・根拠・例・navigation等に分類し、328 identity-anchored spansと重複計上しない |

v1.3の521行では、行本文・line digest照合の完全性は示されているが、意味coverageの閉包は未証明である。固定auditの3件`covered`も形式的successorではなく限定条件routeである。旧candidateの分類訂正はappend-onlyである：`LEGACY-CAND-LINE-000142`（AAFD line45）と`LEGACY-CAND-LINE-003082`（IPC line45）がexplanationからrequirement atomへ訂正され、累積unknownは576となった。追加5件の false negative は`003083`, `001105`, `000603`, `000425`, `000143`で、各々の原文・digestとunknown境界は[5 atom follow-up](legacy-candidate-five-atom-followup-2026-09-28.md)を参照する。

## 条件単位で次に閉じるべき旧source

既存照合で具体的残差が確認済みのため、次のworkstreamを別々に進める。採択済みの近接IDを、出力field・反例・L11 oracleが一致する前に旧conditionのcoverageへ繰り上げない。

1. **専門Worker契約の生成・muster** — `HIL-BR-09`（旧infinity-loop requirements:61、行SHA `4bafa90da44e3d6bc2cb8f3f3517f16f1e7c72ff2d5872236de3cd3b2b2a3111`）、`HIL-BR-30`（同:82、`8018d4ab61dd475b84ee1356de5de5137adf94bd41e975f2669c98371f1d401e`）、`HIL-FR-59`（同:149、`809e21f8712d919dadefec5a46f925499d4dd2b38215def9448e409dc6eac029`）、`HIL-FR-60`（同:150、`646140e1b0193743f2d10874a4b4dc234299f69b8580473b98914923d4016c35`）。原文は`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md`。[IR108の処置監査](legacy-ir108-disposition-summary-2026-09-28.md)は契約生成、専門化の測定可能な利点、Workerと検証者の分離、ライフサイクルのoracleを残差とする。HARNESS-L2-047の条件付きA配置だけでは、この一群は閉じない。
2. **Layer Ledger／Template Obligation** — `HIL-FR-46/-47`は同じ旧原文の136〜137行（行SHA `a62b63ab18b23ac9564d6c7ffca7580ac9471a6d6e7374f8e4a26c93f0441b6c`、`785f0998ca9fd2192bcddc638d1ef1233551c251e307e631303642abe7713fad`）。HARNESS-L2-040/-041では選択した条件atomが採択された。一方、receiptはwriter・snapshot実行のatomと、より広いHAC／HAT／system contractのatomを未完として保持する。旧出力と拒否oracleの全体を、対象候補の節とholdingのatomに照合する。
3. **LABOの計測残差** — 旧`execution-ticket-requirements.md:399`から選んだ明示条件14件は、[#2278の後続索引](legacy-source-condition-followup-index-2026-09-28.md)と現行P1記録で、既存候補との関連3件、新候補を要する9件、意味判断が未解決の2件に分類される。LABO-L2-061/064/065/068/069の採択だけで14件全体は閉じない。旧Worker Competency ContractのFR01〜09／AC01〜07は#2279で7つの機能へ分けた。57件判断後もSECURITY-033の対象範囲、専門Worker契約の生成・muster、LABO受入条件の差が残る。HELIXLABO-L2-067/-068で選んだ最初の適格candidateの結果と総Attempt数の区別を保持する。
4. **v1.3の条件群** — §4.3の計測、§4.5のUXとsource追跡、§4.6.1のpackage・consumer・rollback・promotion受入、§4.11の型付きauthority組とfail-closeをatom化して照合する。HARNESS-L2-034/-039とSECURITY-L2-034には採択されたexact revisionがあるが、receiptの対象は選択したsource範囲に限られ、節全体の閉包ではない。各原文行（`REQSRC-SUP-*`）、対のL11条件、残差atomを分けて保持する。
5. **IR108／IR45とconfirmed175の残差** — 近接IDだけでなく、条件・出力oracleを照合する。IR108の監査には明示的な残差候補が7件ある（`HIL-BR-09/-15/-30`、`HIL-FR-46/-47/-59/-60`）。IR45の45 identityにはformal successorがない。confirmed175の行別台帳には既知の残差5群とOPEN／PPR行がある。`non-residual`という監査分類だけで閉包とせず、sourceごとの`status`を読む。
6. **PHCAPの境界** — 台帳行を範囲限定の回復監査と照合する。`PHCAP-02..18`（19を除く）と20の計18件には、採択要求と関連するが部分的なものが16件、主要条件が不明なものが2件あり、工程の実行完了は0件である。`PHCAP-07`は正式には未再実装、`PHCAP-08`は意味的等価性が未解決のまま。`PHCAP-19`の意味はOS-L2-005/022、LABO-L2-050、範囲限定のINTELLIGENCE-L2-063を通じて再導出されたが、`implementation_recovered:false`であり、runtime・receipt・L3/L10・受入実行の証拠はない。57件判断から回復済み・完了へ変えない。

## PHCAP inventoryのauthority時点

[Phase Capability Inventory](../../phase-capability-inventory.md)とJSONは`inventory_and_work_projection_only`であり、JSONのevidence snapshotはmain `e784fa68702af4b7c57911b866b48fe7df094f88`を指す。これは後発のPO判断より前のinventory evidence時点である。snapshot本文を上書きせず、現在の要求authorityは8機構の判断記録と2026-09-29判断記録から読む。PHCAPの17 degraded / 1 not-reimplemented / 1 equivalence-unresolvedはsourceとの差分分類であり、57候補の採否によって自動解消されない。

## stage 5–6への影響

現行mainでは旧source母集団と主要joinの所在、局所候補処置、一部のmeaning differenceを特定できている。しかし次は未証明である：旧source requirement atomに未対応が0件、旧acceptance/negative oracleが弱まった箇所の全列挙、全register候補の採択/保留/不採択の完了、最終総合整理のfinding 0件。したがって要求stage完了・L3への移行を宣言しない。

次の総合整理では、本書の現行authority overlayと各source-specific receiptを使い、上記workstreamを処置する。57件の採択済みは厳密にそのrevisionの要求合意として扱い、要件承認、実装・受入実行、releaseへの許可には読み替えない。旧HELIXのworkflow、CLI、hook、adapter、runtime、test、CIは実行せず、旧asset 4,020件の一律再調査も開始条件にしない。
