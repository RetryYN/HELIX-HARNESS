# confirmed175 DAC-FR-004〜008 条件別crosswalk（2026-09-29）

## 範囲と基準

基準HEADは `17eb59cd9093c8daf12cb2fcc43c24c5e5406ea8`。旧confirmed identity全体の条件別監査から、同じ旧source文書に連続するDAC-FR-004〜008の5 identityだけを選び、現行L2/L11と照合した。既存の[confirmed175 full audit](legacy-confirmed175-full-audit-2026-09-28.md)と、DAC-FR-003だけを扱う[専用監査](dac-fr-003-authority-binding-recursive-target-2026-09-29.md)は基準・重複確認に使った。旧sourceを実行せず、旧runtime/test/CIの証拠を使わない。

旧sourceは `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/document-authority-census-requests.md`（file SHA-256 `81ac3006a11a087c069b196c1512b078ad5f19c1cff1da0ff34d8986ff2feb66`）。該当source-qualified identitiesはいずれも正本[confirmed identity carry-forward ledger](../../legacy-migration/identity/legacy-confirmed-requirement-identity-carry-forward.jsonl)で `confirmed::preserved_pending_rehome`、`successor_requirement_ids: []`、`decision_record: null`。共有asset `LEGACY-ASSET-D201753B1A0CC6EA3980` のasset ledger dispositionは `source_snapshot_preservation`、product targetは `unresolved`。従ってsource保全を現行要件への再配置やowner移管と読み替えない。

現行側は[HELIX-OS要求](../../../helix-os/L2-requirements/governance-requirements.md)（17eb時点SHA-256 `9b4a26cb92654b133b6154dffec903ab745132be96173cc049782c5faa6a5f3a`）、対の[HELIX-OS受入](../../../helix-os/L11-acceptance/governance-acceptance.md)（`8ac93048fbc05032e6b1e578a944620089c0eae528bd7fb1d3cf2a125faf4e2e`）、および表記したHARNESSのL2/L11を読んだ。[HELIX-OS PO判断記録](../../decisions/helix-os-requirements-po-decision-2026-09-28.md)と[HELIX-HARNESS PO判断記録](../../decisions/helix-harness-requirements-po-decision-2026-09-28.md)は固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`のL2/L11本文を対象に含める。OS判断はHELIXOS-L2-015とその固定L11一式を採用集合に含め、HARNESS判断はHARNESS-L2-004/005/010/011を明示候補の採用集合に含める。HELIXOS-L2-007/017/019も固定L2/L11対象revisionに含まれる。**この判断はcrosswalk上の関係IDを含むL2/L11本文への合意であり、旧source atomのsuccessor、条件別closure、実装、実行受入を作らない。** 17eb上で追加されたHELIXOS-L2-106候補はFR-003の単一atom範囲であり、以下のidentityへ拡張しない。

## 条件別照合

全行の旧source prefixは上記archive path、file SHA、asset IDで共通する。line SHAは原文行そのもののSHA-256。現行L2/L11参照はfull auditのrelationを再読して示した。oracle gapは現行の採択済み条項で検査可能な成功・反例が記載されていない条件であり、新しいoracleや分類規則の採択案ではない。

| 旧identity / source line SHA-256 | 旧条件の焦点 | 現行L2 / 対L11参照とPO状態 | 未充足の条件別oracleまたは保留意味 |
|---|---|---|---|
| `DAC-FR-004` `:51` / `9eeafcb6a2c3c4b4bd65ad22a1b0b8da22c9ce7e51bdc4a3423a6fbe19fe61c4` | artifactからconsumerへの逆向きgraph、startup到達性、生成伝播を示す。 | HELIXOS-L2-015（L2 `:642–650`、L11 `:324–330`）。PO採用済み。 | L2-015はauthority source/revision/digestと未解決状態を追跡するが、artifact集合からconsumer relationを逆引きしstartup reachabilityとgeneration propagationを別々に完全列挙するpositive oracle、missing edge／inactive consumerを識別するnegative oracleはない。sourceの目的節は文書・規則・生成物を挙げるが、対象artifact/consumer classの明示的な包含・除外集合は定めていない。 |
| `DAC-FR-005` `:52` / `d032e840fb88ab1cf46f096553a8ba597473f2faa903ba71cf264e11cda4755d` | source、generator、generated artifact、digest、consumerを一つのprovenance chainに束縛する。 | HELIXOS-L2-015/007、HARNESS-L2-010/011（L2 `governance-requirements.md:642–650, 60`; `product-requirements.md:340–361`; L11 `governance-acceptance.md:27,324–330`; `product-acceptance.md:205–206`）。固定L2/L11対象へのPO合意あり。 | 一つの選択chainで各edgeとrevision/digestを辿れるpositive oracle、異revision・欠損generator・誤consumerを混ぜたnegative oracleが採択L11にない。一般provenance、pack boundary、画面非依存呼出しの各要件から、この全artifact census chainやその必須joinを推定できない。 |
| `DAC-FR-006` `:53` / `a530b7e86791c8a5b21b9af8f34294b8be7cf12cca090b5289f518fbbf1e0ecd` | authority claim、active consumer、startup到達性、生成伝播を入力にseverity/dispositionを決める。 | HELIXOS-L2-015 / HELIXOS-L11-015（L2 `:642–650`; L11 `:324–330`）。PO採用済み。 | L2/L11のunknown/conflict/stale保持はあるが、DAC severity/disposition outcomeを入力状態へ写す成功・反例oracleはない。旧lineはseverity label、順序、threshold、同時条件の優先規則を指定していない。これらの意味が決まるまで分類結果を補作できない。 |
| `DAC-FR-007` `:54` / `66c50b0225ca6e331174adccf608cd149f41f50496e14a2e64215c437c5be3bf` | baseline debtと新規debtを分離し、新規debtへfail-close ratchetを適用する。 | HARNESS-L2-004/005、HELIXOS-L2-015（L2 `product-requirements.md:55–56,114–121`; `governance-requirements.md:642–650`。L11 HARNESS `product-acceptance.md:24–25`; OS `governance-acceptance.md:324–330`）。固定対象へのPO合意あり。 | HARNESSのunknown/未検証保留と必要検証義務は残るが、baseline識別・比較の対象/基準revisionを示すpositive oracleと、新規debtまたはbaseline driftが混じる場合にratchetを fail-close するnegative oracleはない。baseline更新者、更新条件、既存debtが残る間の適用scopeは旧lineで決まらず、決め打ちしない。 |
| `DAC-FR-008` `:55` / `13b0b5a9231121837b7237368eed3718214a0095129f9b9ad31a5c69dd3be2e6` | findingをtyped taxonomyで出し、分類または修正先を推測しない。 | HELIXOS-L2-015/017/019、HARNESS-L2-004/005（L2 `governance-requirements.md:642–650,662–690`; `product-requirements.md:55–56,114–121`; L11 `governance-acceptance.md:324–357,338–350`; `product-acceptance.md:24–25`）。固定対象へのPO合意あり。 | 現行条項はauthority記録、ticket/handoff、unknown/staleの証拠保持と検証義務を扱うが、DAC finding typeの列挙とtype→所管/差戻し先の完全mapping、そのmappingの正常・曖昧・未対応type negative oracleを定めない。旧§5のRecovery/Redesign/Refactoring/Requirement Re-entry語は旧routeであり、現行lane/ownerへの一対一移管は未判断。 |

## 判定と限界

- 5行すべてで旧source identityは確認済みのまま、formal successor未割当・正式な要求再配置は未解決である。asset ledgerの`source_snapshot_preservation`、crosswalkのtarget ID、POによる当該L2/L11 revisionの採用は各identityのclosureではない。
- FR-004/005/006/008はHELIXOS-L2-015との関係を持つが、一般authority/provenance/unknown境界の存在だけでは旧census機能全体や分類・routingの条件を満たさない。FR-007はHARNESSの変更影響・verification義務と関連するが、baseline/new debt comparisonとratchet oracleは別に欠けている。
- 旧sourceのexact HEAD census、全consumer閉包、severity語彙、baseline更新意味、現行所管へのfinding routingのどれも本監査では決定していない。旧sourceのcurrent owner移管、formal successor、意味変更/retireには既存authorityに従う判断が必要となる対象があれば、その判断を待つ。候補・auditから判断を生成しない。
- これは5 identityに限定した静的crosswalkであり、全confirmed175、DAC文書全体、実装・runtime・L11実行、source consumer全域、旧asset全4,020件の閉包を証明しない。`authority_effect: none`。

## 静的照合

canonical identity ledgerの5行とlegacy asset ledgerのsource/file digestを照合し、holding sourceの行SHAを再計算した。MPR registerに当該5 source atomをinputとする登録がないこと、L2-106のFR-003単一atom範囲を確認した。current requirement/acceptance file SHAと対象行位置をHEADで照合した。旧workflow、CLI、runtime、test、CIは実行していない。
