---
audit_record_id: AUDIT-INFRA-DOWNSTREAM-COVERAGE-20261022-C3
authority_effect: none
source_revision: ba4ac1cdd76fdd0d907e684c035b059e8029b9da
audit_input_sha256: 6ae8be6b586679e5ea9a79b80e95679bf9473ea37a89bb2dc028133e79b0396a
scope: HELIX-INFRASTRUCTURE 9 parents / 29 pairs / 36 source documents
---

# INFRASTRUCTURE下流設計の存在・凍結記録照合（#3545 C3）

固定入力は`docs/governance/audits/prerequisite-l3-l10-definition-audit-2026-10-12.json`（source_revision `ba4ac1cdd76fdd0d907e684c035b059e8029b9da`、SHA-256 `6ae8be6b586679e5ea9a79b80e95679bf9473ea37a89bb2dc028133e79b0396a`）。対象はsamehash snapshotのpairs index 225–253。4層sourceは固定BASEのINFRASTRUCTURE L4/L9/L5/L8 JSON 36件。authority_effectはnone。

## 基準・検索範囲・旧source

5分類はA2/B1/B2とC1 R2の監査基準を継承する。①は当該pair層の明示freeze receipt、②は同じ下流層の対象scopeについてfreeze未完/未成立が明示された場合、③は限定検索でその記録を確認できない場合、④は当該source artifactなし、⑤は明示根拠で対象外。③は不存在の証明ではない。status名、L3/L10 approval、approved/snapshot/fixtureのID出現や部分case固定だけでは①にしない。L4/L9の「対L5/L8 oracle freeze未完」はbasic対のfreeze根拠へ流用しない。L5/L8自身の「test/oracle凍結未成立」はL6/L7や層外実装の工程文脈に併記されていても、その明示だけを工程順序で除外しない。一方、L6/L7や実TDD/CI/L11、資格/source供給、coverage limit等のみの残件はfreeze未成立とみなさない。

固定BASEの36 JSON全階層についてremaining/pending/unclosed/unfixed/unobserved等の候補とfreeze/frozen/凍結/未固定等のkey・親path・文字列値を走査し、対象層・明示scopeを個別に読んだ。fixture、snapshot、部分probe、実source資格の未成立はfreeze receipt/未完とは分離する。実参照Pointerもfreeze分類とは独立に記す。

旧source/failureの入口は固定audit `/legacy_basis`。旧 `archive/legacy-generation-2026-09-14/root/CLAUDE.md:49–63, 82–85`、`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requests.md:23–67`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/design-template-json-authority.md:16–60`、`archive/legacy-generation-2026-09-14/root/docs/governance/predecessor-harness-full-weakness-audit-2026-07-20.md:65–101`（UTW-005/014/021/024/029）を維持する。既存inventory/authorityと局所対oracleを照合し、欠落・版混同・自己申告完了を防ぐ失敗から、固定revisionのL3/L10・実child link・freeze記録を分離して確認する。failureから要求意味、新gate、authorityは生成しない。旧runtime/CLI/hook/test/CIを実行しない。

## 凍結候補の限定判断

- **基本L4/L9**: 29組全てのactual L4 contract / L9 obligation child refと、同一L9 entryのL10 oracle refを確認した。L4/L9自身に当該basic scopeの明示freeze receiptまたは未成立記録を確認できず、基本29組は③。L4/L9の`remaining`がL5/L8 oracle凍結を未完と記していても、それは後続対の記述として基本層へ移さない。001 S1:171 `/remaining/2`・S2:171 `/remaining/2` と002 S5:137 `/remaining/2`・S6:137 `/remaining/2` は凍結・実観測・実経路・L11の横断的な列挙で、現basic child scopeのnamedな凍結状態とは確認できず③とする。
- **詳細L5/L8の001–004**: 計12組の各L5/L8 `/remaining/2` は「test/oracle凍結→実装前Red→Green→Refactorの素材であり」と工程素材を説明し、「実TDD/CI/L11/全92親430意味閉包/Ready」を未成立とする。凍結そのものを未成立と明記するC1 R2やCONNECT009とは目的語が異なる。B2の前提素材説明と同様に③とする。単に同じ文に未成立という語があることから②を作らない。
- **詳細L5/L8③**: parent 005 (3), 006 (2), 009 (2), 010 (7), 025 (3) の17組はsource資格、schema、実操作、有限ケース外、TDD/CI/実L10/L11等の残件はあるが、今回読んだ範囲では対象L5/L8 scope自身のfreeze未成立を明示する記録として確認できず③。例: 005は有限probe外・資格・実operationとL6/L7/TDD/CIを残すがoracle freeze不成立を言わない。006は有限L9 fixture外、資格/closure boundaryを残すがfreezeの未成立を明示しない。009は実source資格、実停止再開、codec/TDD等の未成立で、test/oracle freeze自体は記していない。010/025も実権限・実資格・coverage・全scope等の不足であり凍結状態とは分ける。

比較した固定BASEの文面は次のとおり。SECURITY/CONNECTの参照は本表のS aliasとは別文書を直接示す。

| 記録・位置 | 原文の該当句 | 「未成立」の対象と扱い |
|---|---|---|
| INFRA001 S3:827 `/remaining/2`（002–004も同型） | 「test/oracle凍結→実装前Red→Green→Refactorの素材であり、実TDD/CI/L11/全92親430意味閉包/Ready未成立。」 | 凍結の工程は「素材」を修飾し、その後の実TDD等が未成立。③ |
| `docs/helix-security/L5-detail-design/project-scope-isolation.json`:1963 `/completion_limit/3` | 「その前のtest/oracle凍結→実装前Red→Green→Refactorと独立再検証/実L9L10/PO実物L11は未成立。」 | 凍結自体が未成立の列挙に含まれる。C1の詳細② |
| `docs/helix-connect/L5-detail-design/direction-order-feedback-relations.json`:29504 `/unclosed/9` | 「test/oracle凍結・実装前Red・Green・Refactor・新CI・L11は未成立。」 | 凍結自体が未成立の列挙に含まれる。C2の詳細② |
| `docs/helix-os/L5-detail-design/ticket-workflow-derivation.json`:497 `/remaining/2`; `docs/helix-os/L5-detail-design/event-episode-continuity.json`:791 `/remaining/2` | 前者「…の前提素材を作る作業であり、実TDD/CIの合格証拠ではない。」、後者「…の前提素材であり本作業は実TDDではない。」 | B2で③とした工程素材の型 |

INFRAにはOSの「実TDDではない」という明示否定文はない。「実TDD等未成立」を凍結未着手まで含むと読む余地は残るが、本照合は実際に明記された状態を対象とする。「…の素材であり」で文節が分かれ、凍結自体に未成立を係らせる記述を確認できないため③とする。否定文の有無で①へ変えることもせず、記録未確認と、凍結済み・未凍結の断定を分ける。

工程素材として③に保つ固定BASE根拠（凍結自体の未成立ではない）:

| 親 | L5 evidence | L8 evidence | 記録の要点 |
|---|---|---|---|
| 001 | S3:827 `/remaining/2` | S4:827 `/remaining/2` | 凍結から始まる工程の素材。未成立の対象は実TDD/CI等 |
| 002 | S7:709 `/remaining/2` | S8:709 `/remaining/2` | 同上 |
| 003 | S11:808 `/remaining/2` | S12:808 `/remaining/2` | 同上 |
| 004 | S15:733 `/remaining/2` | S16:733 `/remaining/2` | 同上 |

上記以外のL5/L8 10 sourceでは全階層のremaining/pending/unclosed/unfixed/unobservedとfreeze/frozen/凍結等を走査した。今回の限定scopeで、他の文書に同じ当該層freeze未成立を明示する残件は確認していない。source資格・authority・consumer binding・codec・runtime・実TDD/CI/L11等の記録は③の意味を変えない。

部分記録の例: S19:308とS20:308 `/whole_scope_baseline/limit`は92親/430組の母数・監査scope参照で、意味閉包/凍結の証拠ではない。S8:18490 `/unit_scope/original_raw_and_whole_expected`はapproved input/whole expectedを凍結設計素材として保持する記録だが、実TDD/CIや現在の全oracle freeze成立を主張しない。いずれも①へ昇格しない。

## 親別集計

| 親 | 組数 | L4/L9 ② / ③ | L5/L8 ② IDs | L5/L8 ③ |
|---|---:|---:|---|---:|
| HELIXINFRASTRUCTURE-L2-001 | 5 | 0 / 5 | — | 5 |
| HELIXINFRASTRUCTURE-L2-002 | 2 | 0 / 2 | — | 2 |
| HELIXINFRASTRUCTURE-L2-003 | 3 | 0 / 3 | — | 3 |
| HELIXINFRASTRUCTURE-L2-004 | 2 | 0 / 2 | — | 2 |
| HELIXINFRASTRUCTURE-L2-005 | 3 | 0 / 3 | — | 3 |
| HELIXINFRASTRUCTURE-L2-006 | 2 | 0 / 2 | — | 2 |
| HELIXINFRASTRUCTURE-L2-009 | 2 | 0 / 2 | — | 2 |
| HELIXINFRASTRUCTURE-L2-010 | 7 | 0 / 7 | — | 7 |
| HELIXINFRASTRUCTURE-L2-025 | 3 | 0 / 3 | — | 3 |

集計：基本・詳細とも②0・③29。①④⑤も各0件。

## pair別の実参照・分類候補

各行のaudit位置は固定入力JSONの`/pairs/{index}/requirement/entry/id`（L3）と`/pairs/{index}/oracle/entry/id`（L10）。各alias rowも固定BASEのJSON。Pointer後の行番号は値の開始行。L9の`system_oracle_ref`は同一verification_obligation entry内でaudit L10と一致することを確認。`(+N)`は同じcontainer/key shapeで同じL3値を指す追加出現数（数値index最小の代表を除く）。独立case数や意味網羅数ではない。実参照はL4 `contracts/*/requirement_ref`、L9 `verification_obligations/*/requirement_ref`、L5/L8は表記のactual `contracts` / `function_contracts` / `functions` / `trace` / `cases` fieldsに限定した。approved snapshot、fixture内部の写し、source対象集合、その他文字列出現はchild参照に流用しない。traceはL3と対象L5/L8、L10を同じrowで結ぶ明示layer mapであり、表に各値位置を示す。

| idx / audit source位置 | 親・L3 → L10 | L4 child | L9 child ; same entry L10 | L5 child | L8 child | basic | detail |
|---|---|---|---|---|---|---:|---:|
| 225 / AUDIT:11698 `/pairs/225/requirement/entry/id`; 11711 `/pairs/225/oracle/entry/id` | HELIXINFRASTRUCTURE-L2-001; `HELIXINFRASTRUCTURE-L3-001-B01` → `HELIXINFRASTRUCTURE-L10-001-B01` | S1:364 `/contracts/4/requirement_ref` | S2:20249 `/verification_obligations/4/requirement_ref` ← S2:20250 `/verification_obligations/4/system_oracle_ref` | S3:2142 `/contracts/4/source_contract/requirement_ref` | S4:1053 `/trace/4/l3`; S4:1056 `/trace/4/l8`; S4:1058 `/trace/4/l10` | ③ | ③ |
| 226 / AUDIT:11738 `/pairs/226/requirement/entry/id`; 11751 `/pairs/226/oracle/entry/id` | HELIXINFRASTRUCTURE-L2-001; `HELIXINFRASTRUCTURE-L3-001-F01` → `HELIXINFRASTRUCTURE-L10-001-F01` | S1:195 `/contracts/0/requirement_ref` | S2:181 `/verification_obligations/0/requirement_ref` ← S2:182 `/verification_obligations/0/system_oracle_ref` | S3:1953 `/contracts/0/source_contract/requirement_ref` | S4:833 `/trace/0/l3`; S4:836 `/trace/0/l8`; S4:838 `/trace/0/l10` | ③ | ③ |
| 227 / AUDIT:11778 `/pairs/227/requirement/entry/id`; 11791 `/pairs/227/oracle/entry/id` | HELIXINFRASTRUCTURE-L2-001; `HELIXINFRASTRUCTURE-L3-001-F02` → `HELIXINFRASTRUCTURE-L10-001-F02` | S1:235 `/contracts/1/requirement_ref` | S2:4152 `/verification_obligations/1/requirement_ref` ← S2:4153 `/verification_obligations/1/system_oracle_ref` | S3:1998 `/contracts/1/source_contract/requirement_ref` | S4:884 `/trace/1/l3`; S4:887 `/trace/1/l8`; S4:889 `/trace/1/l10` | ③ | ③ |
| 228 / AUDIT:11818 `/pairs/228/requirement/entry/id`; 11831 `/pairs/228/oracle/entry/id` | HELIXINFRASTRUCTURE-L2-001; `HELIXINFRASTRUCTURE-L3-001-F03` → `HELIXINFRASTRUCTURE-L10-001-F03` | S1:273 `/contracts/2/requirement_ref` | S2:9869 `/verification_obligations/2/requirement_ref` ← S2:9870 `/verification_obligations/2/system_oracle_ref` | S3:2041 `/contracts/2/source_contract/requirement_ref` | S4:939 `/trace/2/l3`; S4:942 `/trace/2/l8`; S4:944 `/trace/2/l10` | ③ | ③ |
| 229 / AUDIT:11858 `/pairs/229/requirement/entry/id`; 11871 `/pairs/229/oracle/entry/id` | HELIXINFRASTRUCTURE-L2-001; `HELIXINFRASTRUCTURE-L3-001-F04` → `HELIXINFRASTRUCTURE-L10-001-F04` | S1:315 `/contracts/3/requirement_ref` | S2:14172 `/verification_obligations/3/requirement_ref` ← S2:14173 `/verification_obligations/3/system_oracle_ref` | S3:2088 `/contracts/3/source_contract/requirement_ref` | S4:994 `/trace/3/l3`; S4:997 `/trace/3/l8`; S4:999 `/trace/3/l10` | ③ | ③ |
| 230 / AUDIT:11898 `/pairs/230/requirement/entry/id`; 11911 `/pairs/230/oracle/entry/id` | HELIXINFRASTRUCTURE-L2-002; `HELIXINFRASTRUCTURE-L3-002-F01` → `HELIXINFRASTRUCTURE-L10-002-F01` | S5:158 `/contracts/0/requirement_ref` | S6:147 `/verification_obligations/0/requirement_ref` ← S6:148 `/verification_obligations/0/system_oracle_ref` | S7:1396 `/trace/0/l3`; S7:1398 `/trace/0/l5`; S7:1401 `/trace/0/l10` | S8:715 `/trace/0/l3`; S8:718 `/trace/0/l8`; S8:720 `/trace/0/l10` | ③ | ③ |
| 231 / AUDIT:11938 `/pairs/231/requirement/entry/id`; 11951 `/pairs/231/oracle/entry/id` | HELIXINFRASTRUCTURE-L2-002; `HELIXINFRASTRUCTURE-L3-002-F02` → `HELIXINFRASTRUCTURE-L10-002-F02` | S5:178 `/contracts/1/requirement_ref` | S6:7303 `/verification_obligations/1/requirement_ref` ← S6:7304 `/verification_obligations/1/system_oracle_ref` | S7:1447 `/trace/1/l3`; S7:1449 `/trace/1/l5`; S7:1452 `/trace/1/l10` | S8:766 `/trace/1/l3`; S8:769 `/trace/1/l8`; S8:771 `/trace/1/l10` | ③ | ③ |
| 232 / AUDIT:11978 `/pairs/232/requirement/entry/id`; 11991 `/pairs/232/oracle/entry/id` | HELIXINFRASTRUCTURE-L2-003; `HELIXINFRASTRUCTURE-L3-003-B01` → `HELIXINFRASTRUCTURE-L10-003-B01` | S9:207 `/contracts/2/requirement_ref` | S10:8751 `/verification_obligations/2/requirement_ref` ← S10:8752 `/verification_obligations/2/system_oracle_ref` | S11:1647 `/trace/2/l3`; S11:1649 `/trace/2/l5`; S11:1652 `/trace/2/l10` | S12:887 `/trace/2/l3`; S12:890 `/trace/2/l8`; S12:892 `/trace/2/l10` | ③ | ③ |
| 233 / AUDIT:12018 `/pairs/233/requirement/entry/id`; 12031 `/pairs/233/oracle/entry/id` | HELIXINFRASTRUCTURE-L2-003; `HELIXINFRASTRUCTURE-L3-003-F01` → `HELIXINFRASTRUCTURE-L10-003-F01` | S9:169 `/contracts/0/requirement_ref` | S10:156 `/verification_obligations/0/requirement_ref` ← S10:157 `/verification_obligations/0/system_oracle_ref` | S11:1574 `/trace/0/l3`; S11:1576 `/trace/0/l5`; S11:1579 `/trace/0/l10` | S12:814 `/trace/0/l3`; S12:817 `/trace/0/l8`; S12:819 `/trace/0/l10` | ③ | ③ |
| 234 / AUDIT:12058 `/pairs/234/requirement/entry/id`; 12071 `/pairs/234/oracle/entry/id` | HELIXINFRASTRUCTURE-L2-003; `HELIXINFRASTRUCTURE-L3-003-F02` → `HELIXINFRASTRUCTURE-L10-003-F02` | S9:188 `/contracts/1/requirement_ref` | S10:5340 `/verification_obligations/1/requirement_ref` ← S10:5341 `/verification_obligations/1/system_oracle_ref` | S11:1616 `/trace/1/l3`; S11:1618 `/trace/1/l5`; S11:1621 `/trace/1/l10` | S12:856 `/trace/1/l3`; S12:859 `/trace/1/l8`; S12:861 `/trace/1/l10` | ③ | ③ |
| 235 / AUDIT:12098 `/pairs/235/requirement/entry/id`; 12111 `/pairs/235/oracle/entry/id` | HELIXINFRASTRUCTURE-L2-004; `HELIXINFRASTRUCTURE-L3-004-B01` → `HELIXINFRASTRUCTURE-L10-004-B01` | S13:187 `/contracts/1/requirement_ref` | S14:8722 `/verification_obligations/1/requirement_ref` ← S14:8723 `/verification_obligations/1/system_oracle_ref` | S15:1355 `/trace/1/l3`; S15:1357 `/trace/1/l5`; S15:1360 `/trace/1/l10` | S16:799 `/trace/1/l3`; S16:802 `/trace/1/l8`; S16:804 `/trace/1/l10` | ③ | ③ |
| 236 / AUDIT:12138 `/pairs/236/requirement/entry/id`; 12151 `/pairs/236/oracle/entry/id` | HELIXINFRASTRUCTURE-L2-004; `HELIXINFRASTRUCTURE-L3-004-F01` → `HELIXINFRASTRUCTURE-L10-004-F01` | S13:168 `/contracts/0/requirement_ref` | S14:156 `/verification_obligations/0/requirement_ref` ← S14:157 `/verification_obligations/0/system_oracle_ref` | S15:1304 `/trace/0/l3`; S15:1306 `/trace/0/l5`; S15:1309 `/trace/0/l10` | S16:748 `/trace/0/l3`; S16:751 `/trace/0/l8`; S16:753 `/trace/0/l10` | ③ | ③ |
| 237 / AUDIT:12178 `/pairs/237/requirement/entry/id`; 12191 `/pairs/237/oracle/entry/id` | HELIXINFRASTRUCTURE-L2-005; `HELIXINFRASTRUCTURE-L3-005-F01` → `HELIXINFRASTRUCTURE-L10-005-F01` | S17:120 `/contracts/0/requirement_ref` | S18:108 `/verification_obligations/0/requirement_ref` ← S18:109 `/verification_obligations/0/system_oracle_ref` | S19:2777 `/contracts/0/requirement_ref` | S20:561 `/trace/0/l3`; S20:564 `/trace/0/l8`; S20:566 `/trace/0/l10` | ③ | ③ |
| 238 / AUDIT:12218 `/pairs/238/requirement/entry/id`; 12231 `/pairs/238/oracle/entry/id` | HELIXINFRASTRUCTURE-L2-005; `HELIXINFRASTRUCTURE-L3-005-F02` → `HELIXINFRASTRUCTURE-L10-005-F02` | S17:138 `/contracts/1/requirement_ref` | S18:1433 `/verification_obligations/1/requirement_ref` ← S18:1434 `/verification_obligations/1/system_oracle_ref` | S19:2807 `/contracts/1/requirement_ref` | S20:584 `/trace/1/l3`; S20:587 `/trace/1/l8`; S20:589 `/trace/1/l10` | ③ | ③ |
| 239 / AUDIT:12258 `/pairs/239/requirement/entry/id`; 12271 `/pairs/239/oracle/entry/id` | HELIXINFRASTRUCTURE-L2-005; `HELIXINFRASTRUCTURE-L3-005-F03` → `HELIXINFRASTRUCTURE-L10-005-F03` | S17:156 `/contracts/2/requirement_ref` | S18:4857 `/verification_obligations/2/requirement_ref` ← S18:4858 `/verification_obligations/2/system_oracle_ref` | S19:2837 `/contracts/2/requirement_ref` | S20:615 `/trace/2/l3`; S20:618 `/trace/2/l8`; S20:620 `/trace/2/l10` | ③ | ③ |
| 240 / AUDIT:12298 `/pairs/240/requirement/entry/id`; 12311 `/pairs/240/oracle/entry/id` | HELIXINFRASTRUCTURE-L2-006; `HELIXINFRASTRUCTURE-L3-006-B01` → `HELIXINFRASTRUCTURE-L10-006-B01` | S21:163 `/contracts/1/requirement_ref` | S22:2486 `/verification_obligations/1/requirement_ref` ← S22:2487 `/verification_obligations/1/system_oracle_ref` | S23:2742 `/function_contracts/1/requirement_ref` | S24:4523 `/cases/21/requirement_ref` (+15) | ③ | ③ |
| 241 / AUDIT:12338 `/pairs/241/requirement/entry/id`; 12351 `/pairs/241/oracle/entry/id` | HELIXINFRASTRUCTURE-L2-006; `HELIXINFRASTRUCTURE-L3-006-F01` → `HELIXINFRASTRUCTURE-L10-006-F01` | S21:144 `/contracts/0/requirement_ref` | S22:131 `/verification_obligations/0/requirement_ref` ← S22:132 `/verification_obligations/0/system_oracle_ref` | S23:2674 `/function_contracts/0/requirement_ref` | S24:192 `/cases/0/requirement_ref` (+20) | ③ | ③ |
| 242 / AUDIT:12378 `/pairs/242/requirement/entry/id`; 12391 `/pairs/242/oracle/entry/id` | HELIXINFRASTRUCTURE-L2-009; `HELIXINFRASTRUCTURE-L3-009-F01` → `HELIXINFRASTRUCTURE-L10-009-F01` | S25:168 `/contracts/0/requirement_ref` | S26:156 `/verification_obligations/0/requirement_ref` ← S26:157 `/verification_obligations/0/system_oracle_ref` | S27:750 `/trace/0/l3`; S27:752 `/trace/0/l5_function`; S27:777 `/trace/0/l10` | S28:264 `/cases/0/requirement_ref` (+21) | ③ | ③ |
| 243 / AUDIT:12418 `/pairs/243/requirement/entry/id`; 12431 `/pairs/243/oracle/entry/id` | HELIXINFRASTRUCTURE-L2-009; `HELIXINFRASTRUCTURE-L3-009-F02` → `HELIXINFRASTRUCTURE-L10-009-F02` | S25:186 `/contracts/1/requirement_ref` | S26:1832 `/verification_obligations/1/requirement_ref` ← S26:1833 `/verification_obligations/1/system_oracle_ref` | S27:806 `/trace/1/l3`; S27:808 `/trace/1/l5_function`; S27:833 `/trace/1/l10` | S28:4762 `/cases/22/requirement_ref` (+21) | ③ | ③ |
| 244 / AUDIT:12458 `/pairs/244/requirement/entry/id`; 12471 `/pairs/244/oracle/entry/id` | HELIXINFRASTRUCTURE-L2-010; `HELIXINFRASTRUCTURE-L3-010-F01` → `HELIXINFRASTRUCTURE-L10-010-F01` | S29:132 `/contracts/0/requirement_ref` | S30:118 `/verification_obligations/0/requirement_ref` ← S30:119 `/verification_obligations/0/system_oracle_ref` | S31:735 `/functions/0/requirement_ref` | S32:390 `/cases/0/requirement_ref` (+24) | ③ | ③ |
| 245 / AUDIT:12498 `/pairs/245/requirement/entry/id`; 12511 `/pairs/245/oracle/entry/id` | HELIXINFRASTRUCTURE-L2-010; `HELIXINFRASTRUCTURE-L3-010-F02` → `HELIXINFRASTRUCTURE-L10-010-F02` | S29:149 `/contracts/1/requirement_ref` | S30:2911 `/verification_obligations/1/requirement_ref` ← S30:2912 `/verification_obligations/1/system_oracle_ref` | S31:780 `/functions/1/requirement_ref` | S32:5669 `/cases/25/requirement_ref` (+11) | ③ | ③ |
| 246 / AUDIT:12538 `/pairs/246/requirement/entry/id`; 12551 `/pairs/246/oracle/entry/id` | HELIXINFRASTRUCTURE-L2-010; `HELIXINFRASTRUCTURE-L3-010-F03` → `HELIXINFRASTRUCTURE-L10-010-F03` | S29:166 `/contracts/2/requirement_ref` | S30:4314 `/verification_obligations/2/requirement_ref` ← S30:4315 `/verification_obligations/2/system_oracle_ref` | S31:825 `/functions/2/requirement_ref` | S32:8283 `/cases/37/requirement_ref` (+6) | ③ | ③ |
| 247 / AUDIT:12578 `/pairs/247/requirement/entry/id`; 12591 `/pairs/247/oracle/entry/id` | HELIXINFRASTRUCTURE-L2-010; `HELIXINFRASTRUCTURE-L3-010-F04` → `HELIXINFRASTRUCTURE-L10-010-F04` | S29:183 `/contracts/3/requirement_ref` | S30:5095 `/verification_obligations/3/requirement_ref` ← S30:5096 `/verification_obligations/3/system_oracle_ref` | S31:870 `/functions/3/requirement_ref` | S32:9744 `/cases/44/requirement_ref` (+7) | ③ | ③ |
| 248 / AUDIT:12618 `/pairs/248/requirement/entry/id`; 12631 `/pairs/248/oracle/entry/id` | HELIXINFRASTRUCTURE-L2-010; `HELIXINFRASTRUCTURE-L3-010-F05` → `HELIXINFRASTRUCTURE-L10-010-F05` | S29:200 `/contracts/4/requirement_ref` | S30:6165 `/verification_obligations/4/requirement_ref` ← S30:6166 `/verification_obligations/4/system_oracle_ref` | S31:916 `/functions/4/requirement_ref` | S32:11764 `/cases/52/requirement_ref` (+8) | ③ | ③ |
| 249 / AUDIT:12658 `/pairs/249/requirement/entry/id`; 12671 `/pairs/249/oracle/entry/id` | HELIXINFRASTRUCTURE-L2-010; `HELIXINFRASTRUCTURE-L3-010-F06` → `HELIXINFRASTRUCTURE-L10-010-F06` | S29:217 `/contracts/5/requirement_ref` | S30:7470 `/verification_obligations/5/requirement_ref` ← S30:7471 `/verification_obligations/5/system_oracle_ref` | S31:962 `/functions/5/requirement_ref` | S32:14162 `/cases/61/requirement_ref` (+6) | ③ | ③ |
| 250 / AUDIT:12698 `/pairs/250/requirement/entry/id`; 12711 `/pairs/250/oracle/entry/id` | HELIXINFRASTRUCTURE-L2-010; `HELIXINFRASTRUCTURE-L3-010-N01` → `HELIXINFRASTRUCTURE-L10-010-N01` | S29:234 `/contracts/6/requirement_ref` | S30:8276 `/verification_obligations/6/requirement_ref` ← S30:8277 `/verification_obligations/6/system_oracle_ref` | S31:1007 `/functions/6/requirement_ref` | S32:15681 `/cases/68/requirement_ref` (+3) | ③ | ③ |
| 251 / AUDIT:12738 `/pairs/251/requirement/entry/id`; 12751 `/pairs/251/oracle/entry/id` | HELIXINFRASTRUCTURE-L2-025; `HELIXINFRASTRUCTURE-L3-025-F01` → `HELIXINFRASTRUCTURE-L10-025-F01` | S33:131 `/contracts/0/requirement_ref` | S34:118 `/verification_obligations/0/requirement_ref` ← S34:119 `/verification_obligations/0/system_oracle_ref` | S35:1725 `/contracts/0/requirement_ref` | S36:208 `/cases/0/requirement_ref` (+14) | ③ | ③ |
| 252 / AUDIT:12778 `/pairs/252/requirement/entry/id`; 12791 `/pairs/252/oracle/entry/id` | HELIXINFRASTRUCTURE-L2-025; `HELIXINFRASTRUCTURE-L3-025-F02` → `HELIXINFRASTRUCTURE-L10-025-F02` | S33:148 `/contracts/1/requirement_ref` | S34:2204 `/verification_obligations/1/requirement_ref` ← S34:2205 `/verification_obligations/1/system_oracle_ref` | S35:1742 `/contracts/1/requirement_ref` | S36:5068 `/cases/15/requirement_ref` (+15) | ③ | ③ |
| 253 / AUDIT:12818 `/pairs/253/requirement/entry/id`; 12831 `/pairs/253/oracle/entry/id` | HELIXINFRASTRUCTURE-L2-025; `HELIXINFRASTRUCTURE-L3-025-N01` → `HELIXINFRASTRUCTURE-L10-025-N01` | S33:166 `/contracts/2/requirement_ref` | S34:4422 `/verification_obligations/2/requirement_ref` ← S34:4423 `/verification_obligations/2/system_oracle_ref` | S35:1760 `/contracts/2/requirement_ref` | S36:10246 `/cases/31/requirement_ref` (+19) | ③ | ③ |

## 固定BASE source alias inventory

全36 source artifactを固定BASEから読んだ。`/parent`と`/document_id`は実際のroot field。L4/L9では実`/pair`値も記す。sourceの実child pointerは直上のpair表へ個別に記載する。

| Alias | parent / layer | fixed source path | 実root fieldの行・Pointer・値 |
|---|---|---|---|
| S1 | HELIXINFRASTRUCTURE-L2-001 / L4 | `docs/helix-infrastructure/L4-basic-design/resource-topology-environment.json` | 2 `/parent`=`HELIXINFRASTRUCTURE-L2-001`; 174 `/document_id`=`HELIXINFRASTRUCTURE-L4-001`; 176 `/pair`=`L9` |
| S2 | HELIXINFRASTRUCTURE-L2-001 / L9 | `docs/helix-infrastructure/L9-integration-verification/resource-topology-environment.json` | 2 `/parent`=`HELIXINFRASTRUCTURE-L2-001`; 174 `/document_id`=`HELIXINFRASTRUCTURE-L9-001`; 176 `/pair`=`L4` |
| S3 | HELIXINFRASTRUCTURE-L2-001 / L5 | `docs/helix-infrastructure/L5-detail-design/resource-topology-environment.json` | 2 `/parent`=`HELIXINFRASTRUCTURE-L2-001`; 829 `/document_id`=`HELIXINFRASTRUCTURE-L5-001`; 830 `/pair`=`HELIXINFRASTRUCTURE-L5/L8-001` |
| S4 | HELIXINFRASTRUCTURE-L2-001 / L8 | `docs/helix-infrastructure/L8-unit-verification/resource-topology-environment.json` | 2 `/parent`=`HELIXINFRASTRUCTURE-L2-001`; 829 `/document_id`=`HELIXINFRASTRUCTURE-L8-001`; 830 `/pair`=`HELIXINFRASTRUCTURE-L5/L8-001` |
| S5 | HELIXINFRASTRUCTURE-L2-002 / L4 | `docs/helix-infrastructure/L4-basic-design/design-target-actual-drift.json` | 2 `/parent`=`HELIXINFRASTRUCTURE-L2-002`; 140 `/document_id`=`HELIXINFRASTRUCTURE-L4-002`; 142 `/pair`=`L9` |
| S6 | HELIXINFRASTRUCTURE-L2-002 / L9 | `docs/helix-infrastructure/L9-integration-verification/design-target-actual-drift.json` | 2 `/parent`=`HELIXINFRASTRUCTURE-L2-002`; 140 `/document_id`=`HELIXINFRASTRUCTURE-L9-002`; 142 `/pair`=`L4` |
| S7 | HELIXINFRASTRUCTURE-L2-002 / L5 | `docs/helix-infrastructure/L5-detail-design/design-target-actual-drift.json` | 2 `/parent`=`HELIXINFRASTRUCTURE-L2-002`; 711 `/document_id`=`HELIXINFRASTRUCTURE-L5-002`; 712 `/pair`=`HELIXINFRASTRUCTURE-L5/L8-002` |
| S8 | HELIXINFRASTRUCTURE-L2-002 / L8 | `docs/helix-infrastructure/L8-unit-verification/design-target-actual-drift.json` | 2 `/parent`=`HELIXINFRASTRUCTURE-L2-002`; 711 `/document_id`=`HELIXINFRASTRUCTURE-L8-002`; 712 `/pair`=`HELIXINFRASTRUCTURE-L5/L8-002` |
| S9 | HELIXINFRASTRUCTURE-L2-003 / L4 | `docs/helix-infrastructure/L4-basic-design/resource-capacity-startup.json` | 2 `/parent`=`HELIXINFRASTRUCTURE-L2-003`; 149 `/document_id`=`HELIXINFRASTRUCTURE-L4-003`; 151 `/pair`=`L9` |
| S10 | HELIXINFRASTRUCTURE-L2-003 / L9 | `docs/helix-infrastructure/L9-integration-verification/resource-capacity-startup.json` | 2 `/parent`=`HELIXINFRASTRUCTURE-L2-003`; 149 `/document_id`=`HELIXINFRASTRUCTURE-L9-003`; 151 `/pair`=`L4` |
| S11 | HELIXINFRASTRUCTURE-L2-003 / L5 | `docs/helix-infrastructure/L5-detail-design/resource-capacity-startup.json` | 2 `/parent`=`HELIXINFRASTRUCTURE-L2-003`; 810 `/document_id`=`HELIXINFRASTRUCTURE-L5-003`; 811 `/pair`=`HELIXINFRASTRUCTURE-L5/L8-003` |
| S12 | HELIXINFRASTRUCTURE-L2-003 / L8 | `docs/helix-infrastructure/L8-unit-verification/resource-capacity-startup.json` | 2 `/parent`=`HELIXINFRASTRUCTURE-L2-003`; 810 `/document_id`=`HELIXINFRASTRUCTURE-L8-003`; 811 `/pair`=`HELIXINFRASTRUCTURE-L5/L8-003` |
| S13 | HELIXINFRASTRUCTURE-L2-004 / L4 | `docs/helix-infrastructure/L4-basic-design/runtime-observation-incident.json` | 2 `/parent`=`HELIXINFRASTRUCTURE-L2-004`; 149 `/document_id`=`HELIXINFRASTRUCTURE-L4-004`; 151 `/pair`=`L9` |
| S14 | HELIXINFRASTRUCTURE-L2-004 / L9 | `docs/helix-infrastructure/L9-integration-verification/runtime-observation-incident.json` | 2 `/parent`=`HELIXINFRASTRUCTURE-L2-004`; 149 `/document_id`=`HELIXINFRASTRUCTURE-L9-004`; 151 `/pair`=`L4` |
| S15 | HELIXINFRASTRUCTURE-L2-004 / L5 | `docs/helix-infrastructure/L5-detail-design/runtime-observation-incident.json` | 2 `/parent`=`HELIXINFRASTRUCTURE-L2-004`; 744 `/document_id`=`HELIXINFRASTRUCTURE-L5-004`; 745 `/pair`=`HELIXINFRASTRUCTURE-L5/L8-004` |
| S16 | HELIXINFRASTRUCTURE-L2-004 / L8 | `docs/helix-infrastructure/L8-unit-verification/runtime-observation-incident.json` | 2 `/parent`=`HELIXINFRASTRUCTURE-L2-004`; 744 `/document_id`=`HELIXINFRASTRUCTURE-L8-004`; 745 `/pair`=`HELIXINFRASTRUCTURE-L5/L8-004` |
| S17 | HELIXINFRASTRUCTURE-L2-005 / L4 | `docs/helix-infrastructure/L4-basic-design/backup-restore-rollback.json` | 2 `/parent`=`HELIXINFRASTRUCTURE-L2-005`; 101 `/document_id`=`HELIXINFRASTRUCTURE-L4-005`; 103 `/pair`=`L9` |
| S18 | HELIXINFRASTRUCTURE-L2-005 / L9 | `docs/helix-infrastructure/L9-integration-verification/backup-restore-rollback.json` | 2 `/parent`=`HELIXINFRASTRUCTURE-L2-005`; 101 `/document_id`=`HELIXINFRASTRUCTURE-L9-005`; 103 `/pair`=`L4` |
| S19 | HELIXINFRASTRUCTURE-L2-005 / L5 | `docs/helix-infrastructure/L5-detail-design/backup-restore-rollback.json` | 2 `/parent`=`HELIXINFRASTRUCTURE-L2-005`; 425 `/document_id`=`HELIXINFRASTRUCTURE-L5-005`; 426 `/pair`=`HELIXINFRASTRUCTURE-L8-005` |
| S20 | HELIXINFRASTRUCTURE-L2-005 / L8 | `docs/helix-infrastructure/L8-unit-verification/backup-restore-rollback.json` | 2 `/parent`=`HELIXINFRASTRUCTURE-L2-005`; 557 `/document_id`=`HELIXINFRASTRUCTURE-L8-005`; 558 `/pair`=`HELIXINFRASTRUCTURE-L5-005` |
| S21 | HELIXINFRASTRUCTURE-L2-006 / L4 | `docs/helix-infrastructure/L4-basic-design/independent-bootstrap-recovery.json` | 2 `/parent`=`HELIXINFRASTRUCTURE-L2-006`; 124 `/document_id`=`HELIXINFRASTRUCTURE-L4-006`; 126 `/pair`=`L9` |
| S22 | HELIXINFRASTRUCTURE-L2-006 / L9 | `docs/helix-infrastructure/L9-integration-verification/independent-bootstrap-recovery.json` | 2 `/parent`=`HELIXINFRASTRUCTURE-L2-006`; 124 `/document_id`=`HELIXINFRASTRUCTURE-L9-006`; 126 `/pair`=`L4` |
| S23 | HELIXINFRASTRUCTURE-L2-006 / L5 | `docs/helix-infrastructure/L5-detail-design/independent-bootstrap-recovery.json` | 2 `/parent`=`HELIXINFRASTRUCTURE-L2-006`; 3043 `/document_id`=`HELIXINFRASTRUCTURE-L5-006`; 3044 `/pair`=`HELIXINFRASTRUCTURE-L5/L8-006` |
| S24 | HELIXINFRASTRUCTURE-L2-006 / L8 | `docs/helix-infrastructure/L8-unit-verification/independent-bootstrap-recovery.json` | 2 `/parent`=`HELIXINFRASTRUCTURE-L2-006`; 8772 `/document_id`=`HELIXINFRASTRUCTURE-L8-006`; 8773 `/pair`=`HELIXINFRASTRUCTURE-L5/L8-006` |
| S25 | HELIXINFRASTRUCTURE-L2-009 / L4 | `docs/helix-infrastructure/L4-basic-design/os-work-resource-relations.json` | 2 `/parent`=`HELIXINFRASTRUCTURE-L2-009`; 149 `/document_id`=`HELIXINFRASTRUCTURE-L4-009`; 151 `/pair`=`L9` |
| S26 | HELIXINFRASTRUCTURE-L2-009 / L9 | `docs/helix-infrastructure/L9-integration-verification/os-work-resource-relations.json` | 2 `/parent`=`HELIXINFRASTRUCTURE-L2-009`; 149 `/document_id`=`HELIXINFRASTRUCTURE-L9-009`; 151 `/pair`=`L4` |
| S27 | HELIXINFRASTRUCTURE-L2-009 / L5 | `docs/helix-infrastructure/L5-detail-design/os-work-resource-relations.json` | 2 `/parent`=`HELIXINFRASTRUCTURE-L2-009`; 345 `/document_id`=`HELIXINFRASTRUCTURE-L5-009`; 346 `/pair`=`HELIXINFRASTRUCTURE-L5/L8-009` |
| S28 | HELIXINFRASTRUCTURE-L2-009 / L8 | `docs/helix-infrastructure/L8-unit-verification/os-work-resource-relations.json` | 2 `/parent`=`HELIXINFRASTRUCTURE-L2-009`; 12 `/document_id`=`HELIXINFRASTRUCTURE-L8-009`; 13 `/pair`=`HELIXINFRASTRUCTURE-L5/L8-009` |
| S29 | HELIXINFRASTRUCTURE-L2-010 / L4 | `docs/helix-infrastructure/L4-basic-design/security-worker-operation.json` | 2 `/parent`=`HELIXINFRASTRUCTURE-L2-010`; 111 `/document_id`=`HELIXINFRASTRUCTURE-L4-010`; 113 `/pair`=`L9` |
| S30 | HELIXINFRASTRUCTURE-L2-010 / L9 | `docs/helix-infrastructure/L9-integration-verification/security-worker-operation.json` | 2 `/parent`=`HELIXINFRASTRUCTURE-L2-010`; 111 `/document_id`=`HELIXINFRASTRUCTURE-L9-010`; 113 `/pair`=`L4` |
| S31 | HELIXINFRASTRUCTURE-L2-010 / L5 | `docs/helix-infrastructure/L5-detail-design/security-worker-operation.json` | 2 `/parent`=`HELIXINFRASTRUCTURE-L2-010`; 338 `/document_id`=`HELIXINFRASTRUCTURE-L5-010`; 339 `/pair`=`HELIXINFRASTRUCTURE-L8-010` |
| S32 | HELIXINFRASTRUCTURE-L2-010 / L8 | `docs/helix-infrastructure/L8-unit-verification/security-worker-operation.json` | 2 `/parent`=`HELIXINFRASTRUCTURE-L2-010`; 338 `/document_id`=`HELIXINFRASTRUCTURE-L8-010`; 339 `/pair`=`HELIXINFRASTRUCTURE-L5-010` |
| S33 | HELIXINFRASTRUCTURE-L2-025 / L4 | `docs/helix-infrastructure/L4-basic-design/worker-resource-movement-isolation.json` | 2 `/parent`=`HELIXINFRASTRUCTURE-L2-025`; 111 `/document_id`=`HELIXINFRASTRUCTURE-L4-025`; 113 `/pair`=`L9` |
| S34 | HELIXINFRASTRUCTURE-L2-025 / L9 | `docs/helix-infrastructure/L9-integration-verification/worker-resource-movement-isolation.json` | 2 `/parent`=`HELIXINFRASTRUCTURE-L2-025`; 111 `/document_id`=`HELIXINFRASTRUCTURE-L9-025`; 113 `/pair`=`L4` |
| S35 | HELIXINFRASTRUCTURE-L2-025 / L5 | `docs/helix-infrastructure/L5-detail-design/worker-resource-movement-isolation.json` | 2 `/parent`=`HELIXINFRASTRUCTURE-L2-025`; 371 `/document_id`=`HELIXINFRASTRUCTURE-L5-025`; 373 `/pair`=`L8` |
| S36 | HELIXINFRASTRUCTURE-L2-025 / L8 | `docs/helix-infrastructure/L8-unit-verification/worker-resource-movement-isolation.json` | 2 `/parent`=`HELIXINFRASTRUCTURE-L2-025`; 12 `/document_id`=`HELIXINFRASTRUCTURE-L8-025`; 14 `/pair`=`L5` |

## 限定検索で保持する境界

本監査はHARNESS126・OS79・BRAIN70の先行監査とあわせ、今回のC3 INFRA29組のみを一覧化する。SECURITY35・CONNECT29は別監査である。LABO26組とINTELLIGENCE11組は後続scopeで、本表は8機構405組の完了を意味しない。凍結候補を表にするもので、freeze approval、設計適合性、リンク完全性、実装許可、正式resolverを生成しない。未確認はartifact不存在へ読み替えない。
