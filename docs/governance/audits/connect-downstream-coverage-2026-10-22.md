---
audit_record_id: AUDIT-CONNECT-DOWNSTREAM-COVERAGE-20261022-C2
authority_effect: none
source_revision: ba4ac1cdd76fdd0d907e684c035b059e8029b9da
audit_input_sha256: 6ae8be6b586679e5ea9a79b80e95679bf9473ea37a89bb2dc028133e79b0396a
scope: HELIX-CONNECT 8 parents / 29 pairs / 32 source documents
---

# CONNECT下流設計の存在・凍結記録照合（#3545 C2）

固定入力は`docs/governance/audits/prerequisite-l3-l10-definition-audit-2026-10-12.json`（source_revision `ba4ac1cdd76fdd0d907e684c035b059e8029b9da`、SHA-256 `6ae8be6b586679e5ea9a79b80e95679bf9473ea37a89bb2dc028133e79b0396a`）。対象は同snapshotのpairs index 196–224。4層sourceは同BASEのCONNECT L4/L9/L5/L8 JSON 32件。監査authorityはnone。

## 基準と範囲

A2・B1・B2とSECURITY C1 R2（content `111f28dbe52e5e562009c8c827d73c01035e2525`）の5分類境界を継承する。①は当該層・child scopeの明示freeze記録、②は当該層の凍結未完／未凍結の明示が対象scopeへ及ぶ場合、③はこの限定照合で記録未確認、④はartifactなし、⑤は明示根拠でscope外。③は不存在を意味しない。status名、L3承認、fixture/expectedの一部固定、未成立を記さない工程・前提素材、L6/L7のコード等だけに限定された凍結を②へ流用しない。L5/L8自身が対象層で実装前oracle凍結未成立を文書全体へ明示する場合は、その文書の対応child範囲を②とする。単なるTDD/CI/runtime/資格・実source不足は、それだけで凍結状態の未完とはしない。

固定BASEの32 JSONについて、全階層のremaining/pending/unclosed/unfixed/unobserved系keyと、freeze/frozen/凍結等のkey・親path、同語を含む文字列値を走査した。候補は本文の対象layer・named scope・child対応を読み分けた。各L4/L9のremainingは後続L5/L8・schema/codec・runtime等との横断的な列挙で、現基本pairの凍結未完を示すnamed記録とは確認できない。基本対の未完根拠とせず、下流作業として扱う。実参照Pointerと凍結記録の有無は別軸。

旧source/failureの根拠は固定入力`/legacy_basis`に記載された `archive/legacy-generation-2026-09-14/root/CLAUDE.md:49–63, 82–85`、`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requests.md:23–67`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/design-template-json-authority.md:16–60`、`archive/legacy-generation-2026-09-14/root/docs/governance/predecessor-harness-full-weakness-audit-2026-07-20.md:65–101`（UTW-005/014/021/024/029）。保持するのはinventory-first、責務・connection・scopeの明示、未成立を未成立のまま返す点。変更するのは固定revisionのL3/L10と下流実参照・freeze記録を分けて監査する点。旧runtime等は実行していない。failureは意味確認材料で、新gateやauthorityを生成しない。

## 凍結根拠と限定判断

- **基本L4/L9**: 29組全て実sourceと同一entry L10 oracle参照を確認したが、L4/L9自身の凍結未完記録は確認できなかったため③。L4/L9にある後続L5/L8の実装前作業・runtime・全体閉包は基本対へ持ち込まない。
- **詳細L5/L8**: 003の2組はL8の`fixture_coverage_limits`がFN-C003-01/FN-C003-02のAbsent枝を独立oracle検証していないと示すが、これは未観測分岐のcoverage limitで、literal input/whole return等の凍結未成立を示す記録ではないため③。009の`/unclosed/9`はL5/L8 source自身に「test/oracle凍結…未成立」を明示し、対象文書の10組全体を覆う。層外工程（L6/L7、実装成果、Green/Refactor/CI/L11）も併記されるが、未成立の明示を工程順序だけで対象層から除外しない。従って009のF01–F10全10組を②とする。これは①の凍結済みを意味しない。
- **詳細③の19組（003の2組を含む）**: 当該pairのL5/L8層に凍結未完を明示する記録を確認できず③。一般的なsource/provider資格、schema/codec、runtime、authority、CI/TDD、L11、業務意味未具体化、全430対への言及だけでは対象層のfreeze未完明示にならない。004のfinite case/coverage limits、006の有限caseやpending final review、007の局所素材とqualification不足は部分記録として保ち、pair全体の①/②へしない。

有限の部分記録は全体freezeと分ける。004 L8のfixture coverage limitは合成packet 69件に限る（S16:2584 `/fixture_coverage_limits/0`）。009 L8は288 original casesと101 additional independent casesを記録する（S32:404 `/oracle_freeze`）一方、`/oracle_freeze/not_claimed`は実TDD/test/CI/資格/完了の成立を主張しない。この有限材料は明示された未成立を①へ読み替えない。

## 親別集計

| 親 | 組数 | L4/L9 ② / ③ | L5/L8 ② IDs | L5/L8 ③ |
|---|---:|---:|---|---:|
| HELIXCONNECT-L2-001 | 2 | 0 / 2 | — | 2 |
| HELIXCONNECT-L2-002 | 3 | 0 / 3 | — | 3 |
| HELIXCONNECT-L2-003 | 2 | 0 / 2 | — | 2 |
| HELIXCONNECT-L2-004 | 3 | 0 / 3 | — | 3 |
| HELIXCONNECT-L2-005 | 3 | 0 / 3 | — | 3 |
| HELIXCONNECT-L2-006 | 2 | 0 / 2 | — | 2 |
| HELIXCONNECT-L2-007 | 4 | 0 / 4 | — | 4 |
| HELIXCONNECT-L2-009 | 10 | 0 / 10 | HELIXCONNECT-L3-009-F01, HELIXCONNECT-L3-009-F02, HELIXCONNECT-L3-009-F03, HELIXCONNECT-L3-009-F04, HELIXCONNECT-L3-009-F05, HELIXCONNECT-L3-009-F06, HELIXCONNECT-L3-009-F07, HELIXCONNECT-L3-009-F08, HELIXCONNECT-L3-009-F09, HELIXCONNECT-L3-009-F10 | 0 |

集計：L4/L9は② 0・③ 29。L5/L8は② 10・③ 19（②: HELIXCONNECT-L2-009 F01–F10）。①④⑤は付与しない。

## pair別の実参照・分類

各行は固定audit JSONのL3 `/pairs/{index}/requirement/entry/id`とL10 `/pairs/{index}/oracle/entry/id`の両value位置を記す。各sourceはalias表に示すpathの固定BASE bytes。Pointer後の行番号はそのPointer valueの開始行。L9の同じverification obligation entryにある`system_oracle_ref`がL10 IDと一致することを全行で確認。

| idx / 監査L3・L10入力位置 | 親・L3 → L10 | L4 child ref | L9 child ref ; 同entry L10 ref | L5 child ref | L8 child ref | L4/L9 | L5/L8 |
|---|---|---|---|---|---|---:|---:|
| 196 / 10538 `/pairs/196/requirement/entry/id`; 10551 `/pairs/196/oracle/entry/id` | HELIXCONNECT-L2-001; `HELIXCONNECT-L3-001-F01` → `HELIXCONNECT-L10-001-F01` | S1:106 `/contracts/0/requirement_ref` | S2:95 `/verification_obligations/0/requirement_ref`; S2:96 `/verification_obligations/0/system_oracle_ref` | S3:513 `/function_signatures_and_branches/0/algorithm/2`（FN-C001-01; context S3:500 `/function_signatures_and_branches/0/id`） | S4:201 `/cases/0/requirement_ref` (+32) | ③ | ③ |
| 197 / 10578 `/pairs/197/requirement/entry/id`; 10591 `/pairs/197/oracle/entry/id` | HELIXCONNECT-L2-001; `HELIXCONNECT-L3-001-F02` → `HELIXCONNECT-L10-001-F02` | S1:175 `/contracts/1/requirement_ref` | S2:7156 `/verification_obligations/1/requirement_ref`; S2:7157 `/verification_obligations/1/system_oracle_ref` | S3:538 `/function_signatures_and_branches/1/algorithm/0`（FN-C001-02; context S3:523 `/function_signatures_and_branches/1/id`） | S4:1389 `/cases/33/requirement_ref` (+47) | ③ | ③ |
| 198 / 10618 `/pairs/198/requirement/entry/id`; 10631 `/pairs/198/oracle/entry/id` | HELIXCONNECT-L2-002; `HELIXCONNECT-L3-002-F01` → `HELIXCONNECT-L10-002-F01` | S5:127 `/contracts/0/requirement_ref` | S6:114 `/verification_obligations/0/requirement_ref`; S6:115 `/verification_obligations/0/system_oracle_ref` | S7:6072 `/function_contracts/0/requirement_ref` | S8:263 `/cases/0/requirement_ref` (+23) | ③ | ③ |
| 199 / 10658 `/pairs/199/requirement/entry/id`; 10671 `/pairs/199/oracle/entry/id` | HELIXCONNECT-L2-002; `HELIXCONNECT-L3-002-F02` → `HELIXCONNECT-L10-002-F02` | S5:157 `/contracts/1/requirement_ref` | S6:2432 `/verification_obligations/1/requirement_ref`; S6:2433 `/verification_obligations/1/system_oracle_ref` | S7:6214 `/function_contracts/1/requirement_ref` | S8:4413 `/cases/24/requirement_ref` (+28) | ③ | ③ |
| 200 / 10698 `/pairs/200/requirement/entry/id`; 10711 `/pairs/200/oracle/entry/id` | HELIXCONNECT-L2-002; `HELIXCONNECT-L3-002-F03` → `HELIXCONNECT-L10-002-F03` | S5:187 `/contracts/2/requirement_ref` | S6:7816 `/verification_obligations/2/requirement_ref`; S6:7817 `/verification_obligations/2/system_oracle_ref` | S7:6333 `/function_contracts/2/requirement_ref` | S8:14204 `/cases/53/requirement_ref` (+34) | ③ | ③ |
| 201 / 10738 `/pairs/201/requirement/entry/id`; 10751 `/pairs/201/oracle/entry/id` | HELIXCONNECT-L2-003; `HELIXCONNECT-L3-003-B01` → `HELIXCONNECT-L10-003-B01` | S9:165 `/contracts/1/requirement_ref` | S10:36127 `/verification_obligations/1/requirement_ref`; S10:36128 `/verification_obligations/1/system_oracle_ref` | S11:1202 `/obligation_trace/1/l3` | S12:1854 `/cases/48/l3_ref` (+13) | ③ | ③ |
| 202 / 10778 `/pairs/202/requirement/entry/id`; 10791 `/pairs/202/oracle/entry/id` | HELIXCONNECT-L2-003; `HELIXCONNECT-L3-003-F01` → `HELIXCONNECT-L10-003-F01` | S9:135 `/contracts/0/requirement_ref` | S10:124 `/verification_obligations/0/requirement_ref`; S10:125 `/verification_obligations/0/system_oracle_ref` | S11:1195 `/obligation_trace/0/l3` | S12:174 `/cases/0/l3_ref` (+47) | ③ | ③ |
| 203 / 10818 `/pairs/203/requirement/entry/id`; 10831 `/pairs/203/oracle/entry/id` | HELIXCONNECT-L2-004; `HELIXCONNECT-L3-004-F01` → `HELIXCONNECT-L10-004-F01` | S13:127 `/contracts/0/requirement_ref` | S14:114 `/verification_obligations/0/requirement_ref`; S14:115 `/verification_obligations/0/system_oracle_ref` | S15:5660 `/obligation_trace/0/requirement_ref` | S16:213 `/cases/0/l3_ref` (+24) | ③ | ③ |
| 204 / 10858 `/pairs/204/requirement/entry/id`; 10871 `/pairs/204/oracle/entry/id` | HELIXCONNECT-L2-004; `HELIXCONNECT-L3-004-F02` → `HELIXCONNECT-L10-004-F02` | S13:157 `/contracts/1/requirement_ref` | S14:4792 `/verification_obligations/1/requirement_ref`; S14:4793 `/verification_obligations/1/system_oracle_ref` | S15:5706 `/obligation_trace/1/requirement_ref` | S16:938 `/cases/25/l3_ref` (+16) | ③ | ③ |
| 205 / 10898 `/pairs/205/requirement/entry/id`; 10911 `/pairs/205/oracle/entry/id` | HELIXCONNECT-L2-004; `HELIXCONNECT-L3-004-F03` → `HELIXCONNECT-L10-004-F03` | S13:188 `/contracts/2/requirement_ref` | S14:7230 `/verification_obligations/2/requirement_ref`; S14:7231 `/verification_obligations/2/system_oracle_ref` | S15:5738 `/obligation_trace/2/requirement_ref` | S16:1431 `/cases/42/l3_ref` (+26) | ③ | ③ |
| 206 / 10938 `/pairs/206/requirement/entry/id`; 10951 `/pairs/206/oracle/entry/id` | HELIXCONNECT-L2-005; `HELIXCONNECT-L3-005-F01` → `HELIXCONNECT-L10-005-F01` | S17:156 `/contracts/0/requirement_ref` | S18:143 `/verification_obligations/0/requirement_ref`; S18:144 `/verification_obligations/0/system_oracle_ref` | S19:6529 `/obligation_trace/0/requirement_ref` | S20:234 `/cases/0/requirement_ref` (+41) | ③ | ③ |
| 207 / 10978 `/pairs/207/requirement/entry/id`; 10991 `/pairs/207/oracle/entry/id` | HELIXCONNECT-L2-005; `HELIXCONNECT-L3-005-F02` → `HELIXCONNECT-L10-005-F02` | S17:186 `/contracts/1/requirement_ref` | S18:19857 `/verification_obligations/1/requirement_ref`; S18:19858 `/verification_obligations/1/system_oracle_ref` | S19:6536 `/obligation_trace/1/requirement_ref` | S20:31951 `/cases/42/requirement_ref` (+21) | ③ | ③ |
| 208 / 11018 `/pairs/208/requirement/entry/id`; 11031 `/pairs/208/oracle/entry/id` | HELIXCONNECT-L2-005; `HELIXCONNECT-L3-005-N01` → `HELIXCONNECT-L10-005-N01` | S17:215 `/contracts/2/requirement_ref` | S18:23534 `/verification_obligations/2/requirement_ref`; S18:23535 `/verification_obligations/2/system_oracle_ref` | S19:6543 `/obligation_trace/2/requirement_ref` | S20:39680 `/cases/64/requirement_ref` (+25) | ③ | ③ |
| 209 / 11058 `/pairs/209/requirement/entry/id`; 11071 `/pairs/209/oracle/entry/id` | HELIXCONNECT-L2-006; `HELIXCONNECT-L3-006-F01` → `HELIXCONNECT-L10-006-F01` | S21:144 `/contracts/0/requirement_ref` | S22:133 `/verification_obligations/0/requirement_ref`; S22:134 `/verification_obligations/0/system_oracle_ref` | S23:797 `/function_contracts/0/requirement_ref` | S24:321 `/cases/0/requirement_ref` (+49) | ③ | ③ |
| 210 / 11098 `/pairs/210/requirement/entry/id`; 11111 `/pairs/210/oracle/entry/id` | HELIXCONNECT-L2-006; `HELIXCONNECT-L3-006-F02` → `HELIXCONNECT-L10-006-F02` | S21:174 `/contracts/1/requirement_ref` | S22:9472 `/verification_obligations/1/requirement_ref`; S22:9473 `/verification_obligations/1/system_oracle_ref` | S23:5758 `/function_contracts/1/requirement_ref` | S24:17088 `/cases/50/requirement_ref` (+60) | ③ | ③ |
| 211 / 11138 `/pairs/211/requirement/entry/id`; 11151 `/pairs/211/oracle/entry/id` | HELIXCONNECT-L2-007; `HELIXCONNECT-L3-007-B01` → `HELIXCONNECT-L10-007-B01` | S25:274 `/contracts/3/requirement_ref` | S26:30160 `/verification_obligations/3/requirement_ref`; S26:30161 `/verification_obligations/3/system_oracle_ref` | S27:7179 `/obligation_trace/3/requirement_ref` | S28:3031 `/cases/80/requirement_ref` (+10) | ③ | ③ |
| 212 / 11178 `/pairs/212/requirement/entry/id`; 11191 `/pairs/212/oracle/entry/id` | HELIXCONNECT-L2-007; `HELIXCONNECT-L3-007-F01` → `HELIXCONNECT-L10-007-F01` | S25:187 `/contracts/0/requirement_ref` | S26:172 `/verification_obligations/0/requirement_ref`; S26:173 `/verification_obligations/0/system_oracle_ref` | S27:7152 `/obligation_trace/0/requirement_ref` | S28:231 `/cases/0/requirement_ref` (+38) | ③ | ③ |
| 213 / 11218 `/pairs/213/requirement/entry/id`; 11231 `/pairs/213/oracle/entry/id` | HELIXCONNECT-L2-007; `HELIXCONNECT-L3-007-F02` → `HELIXCONNECT-L10-007-F02` | S25:217 `/contracts/1/requirement_ref` | S26:21251 `/verification_obligations/1/requirement_ref`; S26:21252 `/verification_obligations/1/system_oracle_ref` | S27:7161 `/obligation_trace/1/requirement_ref` | S28:1596 `/cases/39/requirement_ref` (+24) | ③ | ③ |
| 214 / 11258 `/pairs/214/requirement/entry/id`; 11271 `/pairs/214/oracle/entry/id` | HELIXCONNECT-L2-007; `HELIXCONNECT-L3-007-N01` → `HELIXCONNECT-L10-007-N01` | S25:246 `/contracts/2/requirement_ref` | S26:26357 `/verification_obligations/2/requirement_ref`; S26:26358 `/verification_obligations/2/system_oracle_ref` | S27:7170 `/obligation_trace/2/requirement_ref` | S28:2471 `/cases/64/requirement_ref` (+15) | ③ | ③ |
| 215 / 11298 `/pairs/215/requirement/entry/id`; 11311 `/pairs/215/oracle/entry/id` | HELIXCONNECT-L2-009; `HELIXCONNECT-L3-009-F01` → `HELIXCONNECT-L10-009-F01` | S29:248 `/contracts/0/requirement_ref` | S30:187 `/verification_obligations/0/requirement_ref`; S30:188 `/verification_obligations/0/system_oracle_ref` | S31:29719 `/obligation_scope_matrix/0/requirement_ref` | S32:153347 `/cases/339/obligation_refs/0` (+1) | ③ | ②[S31:29504] |
| 216 / 11338 `/pairs/216/requirement/entry/id`; 11351 `/pairs/216/oracle/entry/id` | HELIXCONNECT-L2-009; `HELIXCONNECT-L3-009-F02` → `HELIXCONNECT-L10-009-F02` | S29:299 `/contracts/1/requirement_ref` | S30:7111 `/verification_obligations/1/requirement_ref`; S30:7112 `/verification_obligations/1/system_oracle_ref` | S31:29727 `/obligation_scope_matrix/1/requirement_ref` | S32:148026 `/cases/328/obligation_refs/0` (+1) | ③ | ②[S31:29504] |
| 217 / 11378 `/pairs/217/requirement/entry/id`; 11391 `/pairs/217/oracle/entry/id` | HELIXCONNECT-L2-009; `HELIXCONNECT-L3-009-F03` → `HELIXCONNECT-L10-009-F03` | S29:348 `/contracts/2/requirement_ref` | S30:11894 `/verification_obligations/2/requirement_ref`; S30:11895 `/verification_obligations/2/system_oracle_ref` | S31:29735 `/obligation_scope_matrix/2/requirement_ref` | S32:148948 `/cases/330/obligation_refs/0` (+3) | ③ | ②[S31:29504] |
| 218 / 11418 `/pairs/218/requirement/entry/id`; 11431 `/pairs/218/oracle/entry/id` | HELIXCONNECT-L2-009; `HELIXCONNECT-L3-009-F04` → `HELIXCONNECT-L10-009-F04` | S29:395 `/contracts/3/requirement_ref` | S30:15861 `/verification_obligations/3/requirement_ref`; S30:15862 `/verification_obligations/3/system_oracle_ref` | S31:29743 `/obligation_scope_matrix/3/requirement_ref` | S32:155528 `/cases/343/obligation_refs/0` | ③ | ②[S31:29504] |
| 219 / 11458 `/pairs/219/requirement/entry/id`; 11471 `/pairs/219/oracle/entry/id` | HELIXCONNECT-L2-009; `HELIXCONNECT-L3-009-F05` → `HELIXCONNECT-L10-009-F05` | S29:450 `/contracts/4/requirement_ref` | S30:23492 `/verification_obligations/4/requirement_ref`; S30:23493 `/verification_obligations/4/system_oracle_ref` | S31:29751 `/obligation_scope_matrix/4/requirement_ref` | S32:138391 `/cases/305/obligation_refs/0` (+3) | ③ | ②[S31:29504] |
| 220 / 11498 `/pairs/220/requirement/entry/id`; 11511 `/pairs/220/oracle/entry/id` | HELIXCONNECT-L2-009; `HELIXCONNECT-L3-009-F06` → `HELIXCONNECT-L10-009-F06` | S29:508 `/contracts/5/requirement_ref` | S30:35739 `/verification_obligations/5/requirement_ref`; S30:35740 `/verification_obligations/5/system_oracle_ref` | S31:29759 `/obligation_scope_matrix/5/requirement_ref` | S32:135910 `/cases/300/obligation_refs/0` (+8) | ③ | ②[S31:29504] |
| 221 / 11538 `/pairs/221/requirement/entry/id`; 11551 `/pairs/221/oracle/entry/id` | HELIXCONNECT-L2-009; `HELIXCONNECT-L3-009-F07` → `HELIXCONNECT-L10-009-F07` | S29:555 `/contracts/6/requirement_ref` | S30:38818 `/verification_obligations/6/requirement_ref`; S30:38819 `/verification_obligations/6/system_oracle_ref` | S31:29767 `/obligation_scope_matrix/6/requirement_ref` | S32:137044 `/cases/303/obligation_refs/0` (+9) | ③ | ②[S31:29504] |
| 222 / 11578 `/pairs/222/requirement/entry/id`; 11591 `/pairs/222/oracle/entry/id` | HELIXCONNECT-L2-009; `HELIXCONNECT-L3-009-F08` → `HELIXCONNECT-L10-009-F08` | S29:721 `/contracts/7/requirement_ref` | S30:45954 `/verification_obligations/7/requirement_ref`; S30:45955 `/verification_obligations/7/system_oracle_ref` | S31:29775 `/obligation_scope_matrix/7/requirement_ref` | S32:140124 `/cases/309/obligation_refs/0` (+4) | ③ | ②[S31:29504] |
| 223 / 11618 `/pairs/223/requirement/entry/id`; 11631 `/pairs/223/oracle/entry/id` | HELIXCONNECT-L2-009; `HELIXCONNECT-L3-009-F09` → `HELIXCONNECT-L10-009-F09` | S29:769 `/contracts/8/requirement_ref` | S30:49449 `/verification_obligations/8/requirement_ref`; S30:49450 `/verification_obligations/8/system_oracle_ref` | S31:29783 `/obligation_scope_matrix/8/requirement_ref` | S32:139370 `/cases/307/obligation_refs/0` (+2) | ③ | ②[S31:29504] |
| 224 / 11658 `/pairs/224/requirement/entry/id`; 11671 `/pairs/224/oracle/entry/id` | HELIXCONNECT-L2-009; `HELIXCONNECT-L3-009-F10` → `HELIXCONNECT-L10-009-F10` | S29:812 `/contracts/9/requirement_ref` | S30:51362 `/verification_obligations/9/requirement_ref`; S30:51363 `/verification_obligations/9/system_oracle_ref` | S31:29791 `/obligation_scope_matrix/9/requirement_ref` | S32:139749 `/cases/308/obligation_refs/0` (+5) | ③ | ②[S31:29504] |

## source alias inventory

| Alias | 層 | 実root field (`/parent`, `/document_id`) | 監査対象L3 IDs（pair表参照） | source path | 値line (`/parent` / `/document_id`) |
|---|---:|---|---|---|---:|
| S1 | L4 | HELIXCONNECT-L2-001 / `HELIXCONNECT-L4-001` | HELIXCONNECT-L3-001-F01, HELIXCONNECT-L3-001-F02 | `docs/helix-connect/L4-basic-design/connection-registration-descriptor.json` | 2 / 88 |
| S2 | L9 | HELIXCONNECT-L2-001 / `HELIXCONNECT-L9-001` | HELIXCONNECT-L3-001-F01, HELIXCONNECT-L3-001-F02 | `docs/helix-connect/L9-integration-verification/connection-registration-descriptor.json` | 2 / 88 |
| S3 | L5 | HELIXCONNECT-L2-001 / `HELIXCONNECT-L5-001` | HELIXCONNECT-L3-001-F01, HELIXCONNECT-L3-001-F02 | `docs/helix-connect/L5-detail-design/connection-registration-descriptor.json` | 2 / 612 |
| S4 | L8 | HELIXCONNECT-L2-001 / `HELIXCONNECT-L8-001` | HELIXCONNECT-L3-001-F01, HELIXCONNECT-L3-001-F02 | `docs/helix-connect/L8-unit-verification/connection-registration-descriptor.json` | 2 / 3121 |
| S5 | L4 | HELIXCONNECT-L2-002 / `HELIXCONNECT-L4-002` | HELIXCONNECT-L3-002-F01, HELIXCONNECT-L3-002-F02, HELIXCONNECT-L3-002-F03 | `docs/helix-connect/L4-basic-design/compatibility-stale-send-eligibility.json` | 2 / 107 |
| S6 | L9 | HELIXCONNECT-L2-002 / `HELIXCONNECT-L9-002` | HELIXCONNECT-L3-002-F01, HELIXCONNECT-L3-002-F02, HELIXCONNECT-L3-002-F03 | `docs/helix-connect/L9-integration-verification/compatibility-stale-send-eligibility.json` | 2 / 107 |
| S7 | L5 | HELIXCONNECT-L2-002 / `HELIXCONNECT-L5-002` | HELIXCONNECT-L3-002-F01, HELIXCONNECT-L3-002-F02, HELIXCONNECT-L3-002-F03 | `docs/helix-connect/L5-detail-design/compatibility-stale-send-eligibility.json` | 2 / 6592 |
| S8 | L8 | HELIXCONNECT-L2-002 / `HELIXCONNECT-L8-002` | HELIXCONNECT-L3-002-F01, HELIXCONNECT-L3-002-F02, HELIXCONNECT-L3-002-F03 | `docs/helix-connect/L8-unit-verification/compatibility-stale-send-eligibility.json` | 2 / 33421 |
| S9 | L4 | HELIXCONNECT-L2-003 / `HELIXCONNECT-L4-003` | HELIXCONNECT-L3-003-B01, HELIXCONNECT-L3-003-F01 | `docs/helix-connect/L4-basic-design/operation-envelope-receipt.json` | 2 / 117 |
| S10 | L9 | HELIXCONNECT-L2-003 / `HELIXCONNECT-L9-003` | HELIXCONNECT-L3-003-B01, HELIXCONNECT-L3-003-F01 | `docs/helix-connect/L9-integration-verification/operation-envelope-receipt.json` | 2 / 117 |
| S11 | L5 | HELIXCONNECT-L2-003 / `HELIXCONNECT-L5-003` | HELIXCONNECT-L3-003-B01, HELIXCONNECT-L3-003-F01 | `docs/helix-connect/L5-detail-design/operation-envelope-receipt.json` | 2 / 159 |
| S12 | L8 | HELIXCONNECT-L2-003 / `HELIXCONNECT-L8-003` | HELIXCONNECT-L3-003-B01, HELIXCONNECT-L3-003-F01 | `docs/helix-connect/L8-unit-verification/operation-envelope-receipt.json` | 2 / 159 |
| S13 | L4 | HELIXCONNECT-L2-004 / `HELIXCONNECT-L4-004` | HELIXCONNECT-L3-004-F01, HELIXCONNECT-L3-004-F02, HELIXCONNECT-L3-004-F03 | `docs/helix-connect/L4-basic-design/retry-deduplication-conflict.json` | 2 / 107 |
| S14 | L9 | HELIXCONNECT-L2-004 / `HELIXCONNECT-L9-004` | HELIXCONNECT-L3-004-F01, HELIXCONNECT-L3-004-F02, HELIXCONNECT-L3-004-F03 | `docs/helix-connect/L9-integration-verification/retry-deduplication-conflict.json` | 2 / 107 |
| S15 | L5 | HELIXCONNECT-L2-004 / `HELIXCONNECT-L5-004` | HELIXCONNECT-L3-004-F01, HELIXCONNECT-L3-004-F02, HELIXCONNECT-L3-004-F03 | `docs/helix-connect/L5-detail-design/retry-deduplication-conflict.json` | 2 / 202 |
| S16 | L8 | HELIXCONNECT-L2-004 / `HELIXCONNECT-L8-004` | HELIXCONNECT-L3-004-F01, HELIXCONNECT-L3-004-F02, HELIXCONNECT-L3-004-F03 | `docs/helix-connect/L8-unit-verification/retry-deduplication-conflict.json` | 2 / 202 |
| S17 | L4 | HELIXCONNECT-L2-005 / `HELIXCONNECT-L4-005` | HELIXCONNECT-L3-005-F01, HELIXCONNECT-L3-005-F02, HELIXCONNECT-L3-005-N01 | `docs/helix-connect/L4-basic-design/technical-trace-handoff-custody.json` | 2 / 136 |
| S18 | L9 | HELIXCONNECT-L2-005 / `HELIXCONNECT-L9-005` | HELIXCONNECT-L3-005-F01, HELIXCONNECT-L3-005-F02, HELIXCONNECT-L3-005-N01 | `docs/helix-connect/L9-integration-verification/technical-trace-handoff-custody.json` | 2 / 136 |
| S19 | L5 | HELIXCONNECT-L2-005 / `HELIXCONNECT-L5-005` | HELIXCONNECT-L3-005-F01, HELIXCONNECT-L3-005-F02, HELIXCONNECT-L3-005-N01 | `docs/helix-connect/L5-detail-design/technical-trace-handoff-custody.json` | 2 / 223 |
| S20 | L8 | HELIXCONNECT-L2-005 / `HELIXCONNECT-L8-005` | HELIXCONNECT-L3-005-F01, HELIXCONNECT-L3-005-F02, HELIXCONNECT-L3-005-N01 | `docs/helix-connect/L8-unit-verification/technical-trace-handoff-custody.json` | 2 / 223 |
| S21 | L4 | HELIXCONNECT-L2-006 / `HELIXCONNECT-L4-006` | HELIXCONNECT-L3-006-F01, HELIXCONNECT-L3-006-F02 | `docs/helix-connect/L4-basic-design/one-side-replacement-recovery.json` | 2 / 126 |
| S22 | L9 | HELIXCONNECT-L2-006 / `HELIXCONNECT-L9-006` | HELIXCONNECT-L3-006-F01, HELIXCONNECT-L3-006-F02 | `docs/helix-connect/L9-integration-verification/one-side-replacement-recovery.json` | 2 / 126 |
| S23 | L5 | HELIXCONNECT-L2-006 / `HELIXCONNECT-L5-006` | HELIXCONNECT-L3-006-F01, HELIXCONNECT-L3-006-F02 | `docs/helix-connect/L5-detail-design/one-side-replacement-recovery.json` | 2 / 281 |
| S24 | L8 | HELIXCONNECT-L2-006 / `HELIXCONNECT-L8-006` | HELIXCONNECT-L3-006-F01, HELIXCONNECT-L3-006-F02 | `docs/helix-connect/L8-unit-verification/one-side-replacement-recovery.json` | 2 / 281 |
| S25 | L4 | HELIXCONNECT-L2-007 / `HELIXCONNECT-L4-007` | HELIXCONNECT-L3-007-B01, HELIXCONNECT-L3-007-F01, HELIXCONNECT-L3-007-F02, HELIXCONNECT-L3-007-N01 | `docs/helix-connect/L4-basic-design/composite-edge-terminal.json` | 2 / 165 |
| S26 | L9 | HELIXCONNECT-L2-007 / `HELIXCONNECT-L9-007` | HELIXCONNECT-L3-007-B01, HELIXCONNECT-L3-007-F01, HELIXCONNECT-L3-007-F02, HELIXCONNECT-L3-007-N01 | `docs/helix-connect/L9-integration-verification/composite-edge-terminal.json` | 2 / 165 |
| S27 | L5 | HELIXCONNECT-L2-007 / `HELIXCONNECT-L5-007` | HELIXCONNECT-L3-007-B01, HELIXCONNECT-L3-007-F01, HELIXCONNECT-L3-007-F02, HELIXCONNECT-L3-007-N01 | `docs/helix-connect/L5-detail-design/composite-edge-terminal.json` | 2 / 258 |
| S28 | L8 | HELIXCONNECT-L2-007 / `HELIXCONNECT-L8-007` | HELIXCONNECT-L3-007-B01, HELIXCONNECT-L3-007-F01, HELIXCONNECT-L3-007-F02, HELIXCONNECT-L3-007-N01 | `docs/helix-connect/L8-unit-verification/composite-edge-terminal.json` | 2 / 216 |
| S29 | L4 | HELIXCONNECT-L2-009 / `HELIXCONNECT-L4-009` | HELIXCONNECT-L3-009-F01, HELIXCONNECT-L3-009-F02, HELIXCONNECT-L3-009-F03, HELIXCONNECT-L3-009-F04, HELIXCONNECT-L3-009-F05, HELIXCONNECT-L3-009-F06, HELIXCONNECT-L3-009-F07, HELIXCONNECT-L3-009-F08, HELIXCONNECT-L3-009-F09, HELIXCONNECT-L3-009-F10 | `docs/helix-connect/L4-basic-design/direction-order-feedback-relations.json` | 2 / 220 |
| S30 | L9 | HELIXCONNECT-L2-009 / `HELIXCONNECT-L9-009` | HELIXCONNECT-L3-009-F01, HELIXCONNECT-L3-009-F02, HELIXCONNECT-L3-009-F03, HELIXCONNECT-L3-009-F04, HELIXCONNECT-L3-009-F05, HELIXCONNECT-L3-009-F06, HELIXCONNECT-L3-009-F07, HELIXCONNECT-L3-009-F08, HELIXCONNECT-L3-009-F09, HELIXCONNECT-L3-009-F10 | `docs/helix-connect/L9-integration-verification/direction-order-feedback-relations.json` | 2 / 180 |
| S31 | L5 | HELIXCONNECT-L2-009 / `HELIXCONNECT-L5-009` | HELIXCONNECT-L3-009-F01, HELIXCONNECT-L3-009-F02, HELIXCONNECT-L3-009-F03, HELIXCONNECT-L3-009-F04, HELIXCONNECT-L3-009-F05, HELIXCONNECT-L3-009-F06, HELIXCONNECT-L3-009-F07, HELIXCONNECT-L3-009-F08, HELIXCONNECT-L3-009-F09, HELIXCONNECT-L3-009-F10 | `docs/helix-connect/L5-detail-design/direction-order-feedback-relations.json` | 3 / 2 |
| S32 | L8 | HELIXCONNECT-L2-009 / `HELIXCONNECT-L8-009` | HELIXCONNECT-L3-009-F01, HELIXCONNECT-L3-009-F02, HELIXCONNECT-L3-009-F03, HELIXCONNECT-L3-009-F04, HELIXCONNECT-L3-009-F05, HELIXCONNECT-L3-009-F06, HELIXCONNECT-L3-009-F07, HELIXCONNECT-L3-009-F08, HELIXCONNECT-L3-009-F09, HELIXCONNECT-L3-009-F10 | `docs/helix-connect/L8-unit-verification/direction-order-feedback-relations.json` | 3 / 2 |

S3（L5-001）の両L5 child linkは実function定義内のL3 field-rule参照で確認する。ただしalgorithm内の実文字列はfull IDでなく略記`L3-001-F01` / `L3-001-F02`であり、親文書S3の`parent=HELIXCONNECT-L2-001`文脈とaudit pair表を合わせて対象を対応付ける: F01はS3:513 `/function_signatures_and_branches/0/algorithm/2`（FN-C001-01; IDはS3:500）、F02はS3:538 `/function_signatures_and_branches/1/algorithm/0`（FN-C001-02; IDはS3:523）。ただしfunctionごとのL4 contract linkは確認できない。S3:616–617 `/source_document_bindings/requirements/0..1`とS3:621–622 `/source_document_bindings/basic_design_contracts/0..1`はそれぞれ独立したscope/listで、両者のindex一致からFN↔L4の対応を推定しない。S3:673 `/unfinished_information_contract/source_basis/0/exact_value/id`のL4-F02は同source_basis内のF02証拠copyに限る。その他のtarget L3 ID出現はS3:20–21 `/upstream_adoption/approval/approved_object_ids/0..1`、127/134 `/approved_requirements/0..1/id`、146/157 `/approved_system_oracles/0..1/requirement_ref`、586/591 `/approved_object_hashes/0..1/id`でsnapshot/approval。S3:1106 `/private_registration_receipt_seam/types/RegistrationFieldName/order`にもF01 field順への言及があるが、別のchild-link fieldではない。F02だけのS3:674,678,711,728 `unfinished_information_contract/source_basis/*`はsource evidence内の複製。これらは別のactual function linkやF01の根拠へ数えない。

各表のrefは同source・同shapeでIDごとにnumeric index最小の位置を示す（S3の2本はalgorithm内略記参照）。L8/009では`cases/*/obligation_refs/*`を使う。括弧内`+N`は同じcontainer/key shapeで同一L3 IDを指す追加件数（最小index行を含まない数）。他の各child refも指定schemaのrepresentative Pointerであり、他field/container内のコピー数は数えていない。Alias表の`/parent`と`/document_id`は固定BASEの実root field。対象L3 IDs列は監査scopeの列挙で、sourceのpair fieldを意味しない。child ref成立はpair表のactual pointerで個別表示する。

## source上の限定的なfreeze・境界候補位置

| source / pointer | 固定BASEの値・対象 | 分類上の扱い |
|---|---|---|
| S12:2622 `/fixture_coverage_limits/0` | FN-C003-01; S11:1199 `/obligation_trace/0/function`＝FN-C003-01→L3-003-F01。固定48 rawの範囲でAbsent枝は独立oracle検証されていない。 | coverage限界のみ。凍結未完根拠ではなくdetail③ |
| S12:2623 `/fixture_coverage_limits/1` | FN-C003-02; S11:1206 `/obligation_trace/1/function`＝FN-C003-02→L3-003-B01。固定14 rawの範囲でAbsent枝は独立oracle検証されていない。 | coverage限界のみ。凍結未完根拠ではなくdetail③ |
| S31:29504 `/unclosed/9` | L6は関数設計、L7は対の関数検証。実装成果は層外。test/oracle凍結・実装前Red・Green・Refactor・新CI・L11は未成立。 | 自文書の実装前test/oracle凍結未成立。009全10組のdetail② |
| S32:179301 `/unclosed/9` | L6は関数設計、L7は対の関数検証。実装成果は層外。test/oracle凍結・実装前Red・Green・Refactor・新CI・L11は未成立。 | 自文書の実装前test/oracle凍結未成立。009全10組のdetail② |
| S32:404 `/oracle_freeze` | original_cases=288, additional_independent_cases=101; methodは有限raw/wholeとの対応・期待値を計算出力から生成しないこと、not_claimedは実TDD/test/CI/資格/完了の成立ではない | 部分記録。pair全体へ一般化しない |
| S16:2584 `/fixture_coverage_limits/0` | 69件の固定合成packetのみを評価する。実再送・receiver効果・transport・資格は観測しない。 | 部分記録。pair全体へ一般化しない |

## 009の未成立記録と部分材料

S31:29504 `/unclosed/9`とS32:179301 `/unclosed/9`は、それぞれ11項目のunclosed配列のindex 9。`scope/target_pairs=10`で文書が対象とする10組のL5/L8に対し、test/oracle凍結を含む未成立を明記するため、文書全体の対象範囲に及ぶ②根拠とした。L6/L7や層外実装の工程説明が併記されても、明示された未成立を工程説明だけで除外しない。`/oracle_freeze`には288 original casesと101 additional independent casesの有限材料がある一方、`/oracle_freeze/not_claimed`は実TDD/test/CI/資格/完了を主張しない。有限case材料は独立の事実として保ち、②を①へ読み替えない。

## 対象外と未完範囲

本監査はCONNECT 29組のsource presence/ref/freeze-record照合のみ。SECURITY 35組はC1、CONNECT後のINFRA 29・LABO 26・INTELLIGENCE 11、計66組は未照合。HARNESS 126、OS 79、BRAIN 70の別監査を本監査で再判定しない。C全130組や全405組の完了、設計適合、実装許可、PO承認、authorityの変更を主張しない。

凍結候補走査は32 sourceの全key/valueを対象に実施した。候補語の出現は所在の診断であり、分類済pair数ではない。未確認の語や不在は②/①の根拠に使用していない。
