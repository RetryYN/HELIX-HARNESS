# 旧Mechanism Adequacy要求候補9行のL2/L11照合案

## 概要

- 基準main: `193974e00b9dbd3d15b11c3945840bcb941c36a4`（#2382 merge後）。`authority_effect`は`none`。
- 対象は旧`mechanism-adequacy-requests.md`の9 exact source IDs。対象述語は、既存能力の不足を反証可能に判定する条件、判定の撤回・設計候補への引渡し、決定論的評価、運用効果の測定と受入例である。
- #2382が示す#2381後のproduct/unknown poolは478件、product-targeted route unionは317件、pool交差は288件、未監査は190件。#2379 HMCの30件はこのpool外であり、347は317＋30の全route監査union。対象9件は317 product-targeted union、#2379 HMC、#2381 overlayのいずれとも交差しない。
- 旧sourceの要件候補状態、asset台帳の未決status、Issue参照は現行採択を示さない。個別行のpartial/unknownは固定f6dad2 L2/L11 predicateとの比較だけを表し、採択・successor・coverage・acceptance・実装を主張しない。

## 旧sourceと選定根拠

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/mechanism-adequacy-requests.md`、asset `LEGACY-ASSET-D506685DD301D161D6ED`、file SHA-256 `6fe1be08ba67f63cd684b55ffd0b481b66ad3c063a9e255304fe860dca670244`。
- 原文9行とsource line SHA-256は`docs/governance/legacy-migration/candidate/legacy-candidate-source-line-carry-forward.jsonl`とarchive bytesを照合した。原文行番号は46, 54, 56, 60, 62, 68, 74, 80, 81。
- #2353 full `row_records`上の各source IDは`condition / product_requirement_atom / unknown`。#2356/#2360/#2363/#2366/#2367/#2368/#2369/#2381 overlay ID集合に対象IDはなく、#2382後も同じpool状態を保つ。
- #2378のprior 261 IDとselected 29 IDはdisjointでunion 290件。#2380の27 IDはそれとdisjointで、product-targeted unionは317件。対象9 IDはこの317件と0件交差。#2379のHMC 30 IDは別route auditであり、#2382がproduct/unknown poolとの交差0を確認した。対象9 IDとも0件交差。
- 選定理由: 同一の旧source文書から、反証可能な不足判定→再分類→設計候補→AI/機械評価の分離→運用結果測定→判定受入のまとまりを取り出した。隣接するが分類ラベルが`unadopted_candidate_relation_only`の行、metadata行、pool外行を含めない。

## 固定採択比較

- 比較対象revision: `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。PO判断recordと同revisionの8機構L2/L11 file pinsはJSONへ記録した。
- 主な照合locators:
  - HARNESS-L2-004 `docs/helix-harness/L2-requirements/product-requirements.md:55` / paired L11 `docs/helix-harness/L11-acceptance/product-acceptance.md:24`（要求から設計・testへのtrace、変更時の再検証範囲）。
  - HARNESS-L2-005 `product-requirements.md:56` / paired L11 `product-acceptance.md:25`（検証義務、oracle、expected failure、証拠条件）。
  - HARNESS-L2-008 `product-requirements.md:59` / paired L11 `product-acceptance.md:28`（要求候補やengine出力を合意・操作権限へ自動昇格させない境界）。
  - HELIXOS-L2-005 `docs/helix-os/L2-requirements/governance-requirements.md:58` / paired L11 `docs/helix-os/L11-acceptance/governance-acceptance.md:25`（観測・失敗・改善候補を出典とscope付きで還流し、再検証まで追跡）。
  - HELIXOS-L2-007 `governance-requirements.md:60` / L11 `governance-acceptance.md:43`（原eventを保持し、分類・projectionを原eventへ混入せず再構築する）。
  - HELIXOS-L2-019 `governance-requirements.md:686,689` / L11 `governance-acceptance.md:357`（原記録からのprojection再構築）。固定時本文の「候補」表記よりも、対象revisionとL2-019を明示採択したOSのPO判断記録27・48行を優先する。
  - HELIXOS-L2-002に対応づけられたRFA-BR-03 `governance-requirements.md:427-429,442,449` / L11 `governance-acceptance.md:215` とHARNESS-L2-004 `product-requirements.md:195` / L11 `product-acceptance.md:24`（影響範囲だけを再確定し、無関係な有効作業を継続する）。RFA-BR-03は出典であり、採択要求IDとして数えない。
  - HELIXLABO-L2-004/005/006/009/010 `docs/helix-labo/L2-requirements/labo-requirements.md:97,105,113,137,145` / 同IDのL11 `docs/helix-labo/L11-acceptance/labo-acceptance.md:48-50,53-54`（既存方式の条件比較、変換候補、反例と範囲、target別Feedback）。LABOのPO判断記録31行が固定L2/L11一式を採択している。
- `partial`は上記predicateに明示した直接一致部分に限定し、その行固有の追加義務は残差に分けた。`unknown`は直接一致predicateを特定できなかった行であり、要求意味不存在を意味しない。

## 対象行

| Source ID | 旧source行 | route | 直接一致／残差 |
|---|---:|---|---|
| `LEGACY-CAND-LINE-003267` | 46 | partial | 既存方式をsource evidence・目的・条件・構造で比較する点はLABO-L2-004、新機構の増加を目的化しない点はL2-005、有限例からの一般化を避ける点はL2-009に重なる。限定scopeでのMA不足判定と「世界初」等を断定しない固有基準は残差。 |
| `LEGACY-CAND-LINE-003271` | 54 | partial | 再現例・反例をfindingの証拠として扱う一部がOS-L2-005の観測・失敗登録およびHARNESS-L2-004の要求／設計／test traceと重なる。新機構の必要判定・形式確認・有限例から全方式を否定しない基準は残差。 |
| `LEGACY-CAND-LINE-003272` | 56 | partial | 既存解・反証・新証拠から改善候補を見直す一部がOS-L2-005の出典・適用範囲付き還流と重なる。撤回・再分類の状態遷移と判定履歴保持は残差。 |
| `LEGACY-CAND-LINE-003274` | 60 | partial | 既存方式と条件の比較仮説はLABO-L2-004、意味と適用条件付き変換候補は005、反例・scope・費用・限界の比較は006、target別候補の根拠・反例・riskは010に重なる。MA固有の不足能力・最小構造変更・移行/rollbackを一体にする設計handoffは残差。 |
| `LEGACY-CAND-LINE-003275` | 62 | partial | 判定／候補生成だけで実装・merge・publishを許可しない境界はHARNESS-L2-008の「要求候補から合意・操作権限を自動昇格しない」と重なる。設計品質・保証保持・既存契約への接続手順は残差。 |
| `LEGACY-CAND-LINE-003278` | 68 | partial | 原eventを正本にして分類projectionを分ける部分はHELIXOS-L2-007／L11:43、projection失敗後の原eventからの再構築は採択済みHELIXOS-L2-019／L11:357に重なる。決定論的MA判定、AI仮説との分離、model/session/context/output digest記録は残差。 |
| `LEGACY-CAND-LINE-003281` | 74 | partial | 効果・退行を出典とscope付きで還流し、採否後の変更・再検証へ追う一部がOS-L2-005に重なる。同条件before/after、予測／実測／欠測、baseline/candidate/post-main比較は残差。 |
| `LEGACY-CAND-LINE-003284` | 80 | unknown | HARNESS-L2-005の汎用oracle／expected-failure／evidence条件は関連するが、6分類それぞれの独立正例・反例と列挙された誤認原因を直接定めない。 |
| `LEGACY-CAND-LINE-003285` | 81 | partial | 無関係な有効作業を継続する部分がHELIXOS-L2-002に対応するRFA-BR-03／L11:215・L2:449とHARNESS-L2-004／L11:24に重なる。AI主張の拒否と既存解による新機構判定撤回は残差。 |

## 結果と限界

- route count: `partial=8`, `unknown=1`, total 9。分類review候補は0件で、選択した9行はいずれも要求述語であり、ID/status/Issue pointerだけのmetadata行ではない。003284は汎用検証契約だけではMA六分類の判定述語へ直接一致しないため`unknown`とした。各`partial`は上記の直接一致に限り、MA固有の判定・設計handoff・撤回などは残差に保持する。
- 「partial」は固定L2/L11にある一致箇所だけを記録する。残差は一致や採択へ含めない。「unknown」は対象行に一致する採択predicateを見出せなかったという限定的なroute判定である。
- #2382の478/317/288/190はproposal-effective分類と監査unionの件数であり、採択、successor、全量coverage、受入、実装、実行、Stage 5 closureを生成しない。#2379の30件は347全体unionに含むが、product-targeted 317や本poolへ加算しない。
- archive内のworkflow、CLI、hook、adapter、test、CI、runtimeは実行していない。文書、ID、revision、hash、固定条項locator、pool/union交差の静的照合に限定した。
