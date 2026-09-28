# 手順5 REG-06: 旧source起点の母集団・join・現状判定

基準main: `fc9551321196a18f5e3a6d1f67ccf266be8237bc`。読み取り専用の母集団・参照関係整理であり、旧CLI/runtime/test/CIは実行していない。機械可読row台帳は[JSON](legacy-source-origin-reg06-population-audit-2026-09-28.json)。各IR/confirmed/aux identity、v1.3 `source_item_id` 521件、candidate `source_item_id` 4,755件、PHCAP 20件を既存ledger/auditのID・pointer・digestへ結ぶ。source本文を再複製せず、line/file SHAと既存JSONL/JSON行refを参照する。

## 判定

- **矛盾0:** 8機構のPO反映後に責務・依存・version境界の新規矛盾を見つけなかった、という既存[横断監査](post-po-cross-mechanism-audit-2026-09-28.md)の限定結果は再利用できる。旧source全体の意味矛盾0を本joinは主張しない。
- **旧source未対応0:** **未証明・主張しない**。逆向きのsource-to-current condition mappingが未完で、未対応0の値はfalse/unknownのまま。
- **弱まった受入の全列挙:** **未証明・主張しない**。既存の明示delta/findingsを次の条件別review入口に保持する。

## 母集団とauthority状態

| 集合 | 件数と確定分割 | 状態・join上の意味 |
|---|---|---|
| Requirement IR | 153 identities = IR108 overlay 108 + IR45 remaining 45。ID集合は互いに素、union=153。 | 153/153 `preserved_pending_rehome`、formal successor 0。108/45のidentity-level dispositionは条件atom→L2/L11 closureではない。 |
| confirmed文書identity | 175 = residual 17 + audited non-residual 158。 | 175/175 `confirmed::preserved_pending_rehome`、formal successor 0。158の「non-residual」は監査分類であり再配置完了ではない。 |
| 補助source | 134 = system contract 24 + refinement 14 + acceptance 72 + system test 24。 | 全件relation未完。旧schemaのtyped edges: contracts→IR identity 153 edge/153 unique target、AC→contract 72、HAT→contract 24、refinement→contract 39 edge/12 target。これらは旧構造relationで、現行successor・意味duplicate・受入実行を示さない。 |
| v1.3 source lines | 664 physical / 521 nonempty lines、全行に`REQSRC-SUP`・line digest。 | 521/521 `preserved_pending_atomization`、formal successor 0。condition audit: 303 condition / 154 description / 64 heading-structure。303 condition行のstatusは3 bounded covered / 84 partial / 171 unresolved / 31 implementation-only / 14 version-target（合計303）。残る218 not-applicableは非condition行154 description + 64 heading-structure。 |
| 旧candidate source lines | 92 files / 4,755 nonempty lines。 | `historical_candidate`→`draft_candidate`、全行pending atomization。分類870 requirement_atom（141 relation-only・coverage未解決、155 unadopted candidate relation、574 unknown）、2,959 explanation、926 structure。explanationにも条件false-negativeの可能性あり。 |
| semantic line inventory | 2,386 spans = ID-anchored 328 + pending atomization 2,058（721 review units）。 | 328は175 confirmedと153 IRへline routeしたsource spansで、要求数やno-duplicate証明ではない。残る2,058は要求と確定していないが、non-requirementとも判定していない。 |
| PHCAP | 20 capability rows。01 rederived, 02–06/09–20 degraded (17), 07 formally not reimplemented, 08 semantic equivalence unresolved。 | bounded recovery auditは02–18から19を除外+20の18件: adopted-relevant-partial 16、unknown-primary 2、phase execution closure 0。PHCAP-19は別auditで要求意味rederivedだがimplementation recovered false。能力rowはrequirement identityと重複計上しない。 |

現行の**41候補packet**は旧candidate 4,755行とは別の母集団である。41件すべて`registered_proposal`/`authority_effect:none`/PO未採択。250件の採択済み対象revisionも別軸であり、41候補、過去の旧承認status、merge、receiptから採択を推定しない。

## 確定joinと未知

| 接続 | 観測された関係 | 推論できないこと |
|---|---|---|
| IR153 ↔ confirmed175 | source path + line + line SHAの完全一致joinは0。既存管理資料は部分的意味重複を明記。 | 完全一致0を意味重複0へ置換できない。ID文字列だけでdedupeしない。 |
| IR153 ↔ aux134 | 24旧system contractが153 IR IDをtyped `requirement_ids`で参照。 | 親source relationがunmapped。意味被覆やsuccessor assignmentではない。 |
| v1.3 521 ↔ IR/confirmed/aux | auditのexact source-key join=0。explicit ID lines 9（7 IR + 2 aux）、confirmed 0。2 aux linesの旧typed edgesは36 unique IR IDsへ到達。 | explicit mention/typed reachは条件のcoverageでない。ID未記載の512行をnonmember扱いしない。3行の局所covered判定もformal successorはunassigned。 |
| candidate4755 ↔ IR/confirmed/aux | citation audit: exact 2行、ambiguous 3行、literal IDなし4,750行。source relation/target refsは一部にある。 | literal ID absenceはnonmemberの証拠ではない。exact/ambiguous reference、current L2 routing、candidate detailからIR/confirmed/aux coverageを推定しない。 |
| AC72/HAT24/refinement14 ↔ system contract24 | archive JSONにtyped parent edgesあり。各contractは3 ACと1 HAT。refinementは39 primary/related edgesで12 distinct contractsへ接続。 | 旧schema edgeは現行の要求・受入判定、採択、テスト実行を意味しない。 |
| PHCAP20 ↔ requirement populations | 各phaseは代表assetとcurrent requirement refsを持つ。18 bounded auditの16件はadopted-relevant条項とのpartial、2件はunknown-primary。 | 近接L2 refsは能力全体や実装/実行closureではない。PHCAP-07/08 unknownを隠さず、PHCAP-19別判定を18行集計へ混ぜない。 |

v1.3 semantic auditは source exact join 0、明示IR 7、明示confirmed 0、明示auxiliary 2、typed reachable IR 36、formal successor 0を記録する。旧candidate 4,755 auditは4 batchの全coverage claimをfalseとし、5 false-negative rowsを後から発見・追加したが再reviewは未実施。source relation 141行も coverage claim=false。

## 次の条件別照合の入口

1. **IR 153:** 108/45各recordの旧条件・出力/拒否oracleをspan化し、現行具体L2と対L11へ結ぶ。大きな`current_target_ids`集合をcoverage扱いしない。
2. **confirmed 175:** 17 residualを先行し、続いて158 non-residualも全てsource-qualified identity/path/line digestで条件を読んで処置する。全件successorなし。
3. **aux 134:** 24 contractをtyped IR edgeごとに条件化し、各positive/negative AC/HATをparentと一緒に確認。14 refinementは全件relation unmappedを解消せず、候補statusを保つ。
4. **v1.3 521:** 171 unresolvedと84 partialから条件・受入を追い、218 not-applicable claimsも理由/条件単位で確認。31 implementation-only/14 version-targetを採択軸と分ける。3 covered行もsuccessor未割当。
5. **candidate 4,755:** 5 correction rowsと574 unknown atom rowsを先にreviewし、141 relation-only/155 unadopted-routeを意味条件単位で判定。2,959 explanation rowsも再走査し、source authorityをhistorical/draftのまま維持。
6. **semantic lines 2,386:** 2,058 pending spansを721 review unitから分類し、328 anchored linesと機械統合しない。partial/duplicate/conflict/nonmemberはいずれもsource-evidence付き別statusへ。
7. **PHCAP 20:** 18 bounded recordsの現行refを能力条件別に検証、PHCAP-07/08 unknownを維持し、PHCAP-19は意味recoveryとimplementation未回復を別報告する。

本監査は母集団、join、開始点の整理であり、条件別処置完了、未対応0、旧受入実行、手順5終了を示さない。
