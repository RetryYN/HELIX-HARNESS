# 旧source起点の要求・受入再照合：中間記録

## 基準と判定境界

基準mainは `559ae3ba4bfe660d666a57f227466d7dcdd440d9`（#2233統合後）である。旧要求の原文行・SHA、現行L2/L11、2026-09-28の8機構PO判断を照合した。旧workflow、CLI、hook、runtime、test、CIは実行していない。監査資料は固定HEADの観測記録であり、その後の候補PRの採択や受入実行を示さない。

現行側から参照される旧source92 pathの監査は[判断後横断照合](post-po-cross-mechanism-audit-2026-09-28.md)にある。本記録は旧source集合から現行へ向かう再照合を追加する。source holdingの生存、同じ語の近接ID、仮登録receiptの`no_loss`を、旧要求全体の意味被覆に換算しない。IRとconfirmed identityの重複、system contractとacceptanceの派生関係を足し算しない。

| 母集団 | 今回の照合資料 | 基準時点で確かめたこと | 残ること |
|---|---|---|---|
| Requirement IR 153 | [W1業務33](legacy-ir-business-source-recheck-2026-09-28.md)、[W2機能24](legacy-ir-functional-source-recheck-2026-09-28.md)、[W3非機能40](legacy-ir-quality-source-recheck-2026-09-28.md)、[W4技術11](legacy-ir-technical-source-recheck-2026-09-28.md)、[108件判定行列](legacy-ir108-disposition-matrix-2026-09-28.json)と[要約](legacy-ir108-disposition-summary-2026-09-28.md)、[残余45件の行別監査](legacy-ir45-remaining-disposition-2026-09-28.md)と[完全明細](legacy-ir45-remaining-disposition-2026-09-28.json) | 153件の差集合を重複なく全件監査。108件の旧source行SHA、現行16 L2/L11 file SHA、W2の旧出力欄24件、残り45件の原文行SHAを検算。残り45件の372 target referenceは現行L2と対L11の参照箇所を固定した。108件中7件、残り45件中27件に具体的な意味残差候補がある。 | 専門agent・Product Data等の未割当条件、旧IR source atomの正式後継割当が残る。FR46/47は基準HEAD後の#2234で未採択候補を起草・統合したが、採択済み集合には入らない。 |
| confirmed identity 175 | [175件の行別監査](legacy-confirmed175-full-audit-2026-09-28.md)と[完全明細](legacy-confirmed175-full-audit-2026-09-28.json)、[残差5群の原文再照合](legacy-confirmed175-residual-disposition-2026-09-28.md) | 175/175のsource path・file/line SHAを検算。既知残差は5群17件、残り158件はcrosswalk保持主張のみ92件、条件細目未確認58件、後発候補でauthority未成立8件。 | source atomの後継割当は175件とも未成立。既知5群の保持・置換・retireは未決。旧D-02の90%はHARNESS-L2-036未採択候補であり採択済み目標ではない。 |
| IR補助134（system contract 24、refinement 14、acceptance 72、system test 24） | [補助契約・refinementの照合](legacy-auxiliary-contract-refinement-recheck-2026-09-28.md)、[96件のnegative oracle・成果物照合](legacy-system-acceptance-negative-oracle-audit-2026-09-28.md) | source SHAと現行L2/L11の関係を分け、旧HAT24件が旧時点で設計済み・未実装だったことを維持。候補のoracle存在と採択済みoracleを区別。 | 一回限りmigration inventory、Product Data projection、template/atom完全性、専門team等の後継・scope。旧受入の実行済みという主張はしない。 |
| PHCAP-02..20（19） | [PHCAP意味照合](phcap19-semantic-recovery-audit-2026-09-28.md)、[UIL-R01..15の条件別照合](phcap19-condition-crosswalk-2026-09-28.md) | 初期台帳の縮退17、正式再実装なし1、意味同等性未解決1を旧asset ID/path/SHAと照合。PHCAP-19の循環意味は後続PO判断でOS/LABO/INTELLIGENCEに分割採択されている。UILの旧詳細と現在の採択済み意味を条件別に分けた。 | 他18能力のcondition-level対応、PHCAP-08同等性、現行実装・受入実行。近接IDだけで回復とはしない。 |
| v1.3の521非空行 | [v1.3・候補母集団の境界監査](legacy-v13-candidate-population-boundary-audit-2026-09-28.md)。旧source file SHA-256 `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406` | source行とline digestは521/521一致。9行に旧IRまたは補助identityへの明示参照があり、512行には既知IDの明示参照がない。 | 521行の意味coverageは未評価。明示IDがある9行も内容被覆済みとはしない。 |
| 旧candidate 92文書・4,755行 | [候補行台帳](../../legacy-migration/candidate/legacy-candidate-source-line-carry-forward.jsonl)と[母集団の境界監査](legacy-v13-candidate-population-boundary-audit-2026-09-28.md) | source行とline digestは4,755/4,755一致。2行にexact ID、3行に曖昧ID、4,750行にliteral IDなし。旧candidateの未採択状態と原文行を保持。 | literal IDなしを要求意味なしと扱わず、関連familyの原文条件と現行L2/L11を照合する。全行の採択・retireや4,020旧資産の再調査は主張しない。 |

## 現在の残差の扱い

- [108件の要約](legacy-ir108-disposition-summary-2026-09-28.md)のBR09/30・FR59/60は、配置案やticketと専門agent contract compiler/muster gateの生成物を同一視できない。配置・scopeはP-SPECIALISTの人間判断候補として保持する。BR15のProduct Data正規projectionも一般的なsource/event接続では閉じない。旧機能の採否と各consumer/版は未決である。
- FR46/47は候補040/041をPR #2234で起草・統合し、旧原文の契約意味を保持する案とした（review済みHEAD `635c06ecec6788d0806bfa306a42c6aa4b8ac75c`、merge `5e42b759addec0166af3d0fd98ca878a8c851f10`）。登録writer、layer snapshot生成、候補行の正本追加の実行先は既存OS要求に明記されないため、[r2 receipt](../requirement-registration/harness-layer-ledger-extraction-coverage-receipt-2026-09-28-r2.json)で旧sourceの残余を生存source holdingへ保留した。review・mergeは要求採択を生成しない。
- [confirmed残差](legacy-confirmed175-residual-disposition-2026-09-28.md)の旧数値・UI体験・例外release・専用資格は、人の上流意味に触れる。決まっていない値や旧方式を現在の1.0へ推測で挿入しない。
- [旧受入の弱点](legacy-system-acceptance-negative-oracle-audit-2026-09-28.md)では、原文の反例・negative oracle・成果物を旧IDごとに明記した。採択済みL2/L11の欠陥、未採択候補の採否、下流実装の未完を区別する。

**現時点の判定**：8機構の固定L1/L2/L11の間で新たな責務矛盾は確認していない。ただし旧source起点の未対応条件は0ではない。手順5の「旧機能の行き先が全件明示され、黙って消えたもの0件」と、手順6の「全候補の採用・保留・不採用、最後の指摘0件」はまだ達成していない。[確認後に生じた25候補](post-confirmation-candidate-inventory-2026-09-28.md)の採否も未決である。本記録から要求ステージ終了、L3着手、release、tagを生成しない。
