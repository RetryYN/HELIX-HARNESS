# 旧candidate README 9行の分類再評価（#2350後、2026-09-29）

## 範囲と結果

作業基準commitは `98411231e2eb111ca779d8b83478e6667c6cb7b3`（#2351 merge後）。分類・routeの比較基準は `a7b207ac7685e55bb94ba175de8fb2ad8bb696b7`（#2350 merge後）で、#2351は対象source・router・先行監査を変更していない。対象は旧README `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/README.md` 一文書で、本文37 source rowsの見出し・箇条書き・前後文脈を読み直した。#2347の4,755行recount上、このREADMEで `product_requirement_atom` かつroute `unknown` と分類された行は下表の9 IDだけであり、全て#2350のfirst-20 auditに `true_unknown` として含まれていた。

9行のうち7行は候補ファイル名、対象層、README projection、source参照先を示すnavigation/explanationで、product requirement atomの条件を述べないため `explanation` へ再分類する。`000021` はv4.0承認対象bytes保持とU1再整備の承認対象分離、`000037` は存在しない分冊原稿ではなく統合文書中のINV個別カードを参照先にするsource解決条件として、それぞれ `management_process_condition` に再分類する。現行の管理条件とは完全一致せず、successorや製品L2/L11 routeは割り当てない。

| Source ID | README line | 監査前（#2347） | 推奨する分類 | route処置 |
|---|---:|---|---|---|
| `LEGACY-CAND-LINE-000021` | 33 | product atom / unknown | `condition` (`management_process_condition`) | `management_successor_unresolved` |
| `LEGACY-CAND-LINE-000022` | 35 | product atom / unknown | `explanation` | `not_applicable_noncondition` |
| `LEGACY-CAND-LINE-000023` | 36 | product atom / unknown | `explanation` | `not_applicable_noncondition` |
| `LEGACY-CAND-LINE-000024` | 37 | product atom / unknown | `explanation` | `not_applicable_noncondition` |
| `LEGACY-CAND-LINE-000025` | 38 | product atom / unknown | `explanation` | `not_applicable_noncondition` |
| `LEGACY-CAND-LINE-000026` | 39 | product atom / unknown | `explanation` | `not_applicable_noncondition` |
| `LEGACY-CAND-LINE-000027` | 40 | product atom / unknown | `explanation` | `not_applicable_noncondition` |
| `LEGACY-CAND-LINE-000031` | 47 | product atom / unknown | `explanation` | `not_applicable_noncondition` |
| `LEGACY-CAND-LINE-000037` | 54 | product atom / unknown | `condition` (`management_process_condition`) | `management_successor_unresolved` |

## Source bytesと意味判断

全行はasset `LEGACY-ASSET-A9F7F40B7F61D64C4F8F`、source file SHA-256 `6ad0e2fbee65ee8ca556c8afbd3bfc7f55a4b710961343905ced07eb378ec49e` に属する。各source IDの行番号、元router分類、source/target authority状態、行内容SHA（改行除く）、物理行bytes SHA（行終端含む）、物理行bytes base64は[JSON証跡](legacy-candidate-readme-pointer-classification-audit-2026-09-29.json)に固定した。

| Source ID | 原文（READMEの物理行） | 再分類理由 |
|---|---|---|
| `LEGACY-CAND-LINE-000021` | - &#96;helix-concept-v4.1.md&#96;: 最新のHARNESS／HELIX-OS／個別製品境界を反映した次revision候補。v4.0の承認対象bytesを変更せず、U1上流再整備の承認対象を分ける | 候補revisionの取扱いについて、旧v4.0承認bytesを保持しU1再整備の承認対象を分離する条件が明記される。機能能力ではなく、旧候補のdecision/source boundaryである。historical_candidate状態を保持し、現行の反復承認手続きへ昇格させない。 |
| `LEGACY-CAND-LINE-000022` | - &#96;helix-concept-v4.0.md&#96;: Verified Change Operating SystemへのConcept候補 | Concept候補ファイルとその主題を列挙する索引行。機能の要求・適用条件・受入oracleは述べない。 |
| `LEGACY-CAND-LINE-000023` | - &#96;helix-concept-v4-requests.md&#96;: L1要求候補 | L1要求候補ファイルへの層付きポインタだけで、L1要求の個別意味は参照先に別source rowsとして存在する。 |
| `LEGACY-CAND-LINE-000024` | - &#96;helix-concept-v4-requirements.md&#96;: L3要件候補 | L3要件候補ファイルへのポインタだけで、個別要件の要求条件や承認結果をこの行は定めない。 |
| `LEGACY-CAND-LINE-000025` | - &#96;helix-concept-v4-acceptance.md&#96;: L10受入候補 | L10受入候補ファイルへのポインタだけで、受入条件・oracle・実行結果をこの行は定めない。 |
| `LEGACY-CAND-LINE-000026` | - &#96;helix-concept-v4-capability-delta.md&#96;: baseline capabilityとの実測差分 | capability-delta候補への短い説明だけで、対象baseline、差分判定、受入を定義しない。 |
| `LEGACY-CAND-LINE-000027` | - &#96;helix-concept-v4-readme-projection.md&#96;: 人間向けREADME説明候補（非authority） | 非authorityの人間向けREADME説明候補へのポインタ。README投影の存在をproduct behaviorへ変換しない。 |
| `LEGACY-CAND-LINE-000031` | - &#96;development-investment-stage-directives-intake_v1.0.md&#96;: 開発コスト削減・知能化に関する | 投資directive intake候補ファイルとテーマへのポインタ。個別INVの条件は参照先本文とその固有source_item_idへ保持し、この見出し的説明行に集約しない。 |
| `LEGACY-CAND-LINE-000037` | 「INV-001〜072 個別実施カード」をその参照先として扱う。 | README:50-54のsource-location修正の末尾であり、存在しない分冊原稿ではなく統合文書中のINV個別実施カードを参照先にするよう指示する、歴史的source解決/移管条件。INV自体の採否やproduct requirement意味とは分けて管理process条件として保持し、current successorは割り当てない。 |

## 前後行と参照先の保全

`000021`は新revision候補の説明文に含まれる旧approved-bytes保持／U1 approval-target分離条件として独立に残す。v4.1 filenameのarchive内参照先は存在しない。current authority-state modelにはsource/target状態分離があるが、この旧条件と同一のexact successorは確認できない。過去の条件を現行Conceptや毎回のhuman approvalへ自動継承しない。

`000022`〜`000027`は旧Concept v4.0、L1要求、L3要件、L10受入、capability delta、人間向けREADME説明候補への一覧行である。参照先のsource rowsは別IDで保持されている。READMEの参照行自体は、それらの内容・要求意味・acceptanceを代替しない。`000031`はINV intakeへのnavigationで、`000037`はその直後の「source documentが存在しない」注意と続く参照先解決条件である。INV本文sourceは別ID `LEGACY-CAND-LINE-001056`〜`001068`に保持され、READMEの隣接条件 `000034`等へも混合しない。

近傍の `000018`、`000028`、`000034` は独立した `management_process_condition` source rowsであり、継続行 `000019`、`000029`や説明行 `000033`、`000035`、`000036`を今回変更していない。参照先ファイル別のsource ID範囲とhashはJSONに列挙した。

## routeと件数への影響

分類前の#2347 baselineはstructure 926 / explanation 2,911 / condition 918（product requirement atom subtype 913）で、routeはproduct known 336 / unknown 577、management successor unresolved 4、Concept unknown 1である。今回のbounded overlayが与えるdeltaは、explanation `+7`、aggregate condition `-7`、product requirement atom subtype `-9`、management process condition `+2`、product route unknown `-9`、management successor unresolved `+2`、product route known `0`。対象IDのroute分類差分であり、新しい累積recountやstage completion数ではない。

#2350はfirst-20 route assessmentで4 adopted_relevant_partial / 6 unadopted_candidate_relation_only / 10 true_unknownを記録した。対象9行はいずれもこの中のtrue_unknownだった。分類overlay適用後、7行はproduct route対象外のexplanation、2行はproduct routeを持たないmanagement conditionとなる。そのため#2350の20行selected set、true_unknown件数、およびselection order全体は分類補正後のcurrent product-unknown populationを表さない。新しいfirst-20集合は再選定していない。

#2347の累積分類・route件数は#2350のroute overlayに加え今回の9分類補正より前の値で、歴史値としてstaleである。監査本文・JSON、旧router、line ledgerは更新しない。対象9行deltaから現在累積総数を宣言せず、全4,755行と適用可能なoverlayを改めて走査・照合するまで新しい全体件数は出さない。

## authorityと限界

全9行のsource stateは `historical_candidate`、target stateは `draft_candidate`、atomizationは `preserved_pending_atomization` のまま。classification correctionはsource authority変更、採択、formal successor、current L2/L11 coverage、retirement、no-loss closureを意味しない。旧source、register、router snapshot、#2347/#2350監査は変更していない。

## 検証

9 IDが同一README内の `product_requirement_atom + route unknown` 集合全体と一致し、#2350対象内の9件全てが `true_unknown` であることを機械照合した。archive file SHA、source ledger line SHA、physical line bytes SHAを再計算した。JSON parse、route/classification delta、参照先ごとのsource ID区間を静的確認した。旧CLI/runtime/hook/test/CIは実行していない。

[機械可読証跡](legacy-candidate-readme-pointer-classification-audit-2026-09-29.json) はsource IDごとのexact bytes、分類案、route案、参照先source範囲、SHA pinを含む。
