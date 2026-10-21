---
audit_record_id: AUDIT-BRAIN-DOWNSTREAM-COVERAGE-20261022-B1
authority_effect: none
source_revision: ba4ac1cdd76fdd0d907e684c035b059e8029b9da
audit_input_sha256: 6ae8be6b586679e5ea9a79b80e95679bf9473ea37a89bb2dc028133e79b0396a
extraction_sha256: 8997176769260dc1ff55473b066b9f2cdeeac50008e583220b36f9298557b9d7
extractor_content: 5124acf9f368134dd778d6c2db39d5511add3af5
extractor_merge: c1476b2d00af149c584557043114ce6e0f670d29
scope: HELIX-BRAIN 16 parents / 70 pairs / 64 source documents
---

# BRAIN下流設計の存在・凍結記録照合（#3545 B1）

正本入力は`docs/governance/audits/prerequisite-l3-l10-definition-audit-2026-10-12.json`の固定BASE snapshot。source参照は固定base `ba4ac1cdd76fdd0d907e684c035b059e8029b9da`のHELIX-BRAIN L4/L9/L5/L8 JSONからのB0抽出（SHA-256 `8997176769260dc1ff55473b066b9f2cdeeac50008e583220b36f9298557b9d7`）で、64 alias・70 pairを内包する。JSONPointer・値位置lineはalias表とpair表をこのファイル内で辿れる。監査入力自身は`authority_effect: none`、405組全体の完了ではない。

## 基準と境界

HARNESS A2 `docs/governance/audits/harness-downstream-coverage-2026-10-22.md`の基準・旧source/failure対応を継承する。分類は①明示freeze記録あり、②当該pair層のremaining/pending等に凍結の未完・未凍結が明記、③今回の限定検索で記録未確認、④該当artifactなし、⑤明示根拠によりscope外。status単独、L3/L10承認、fixture/expectedの一部固定、L6/L7だけの将来記載を①/②に流用しない。③は不存在宣言ではない。今回③の共通理由は、固定BASEの指定された実artifact・nested未完欄・freeze記録の限定検索で、当該child pair層のfreeze記録を確認できなかったことを指す。これは証拠不存在の断定ではない。

②はL4/L9またはL5/L8という対の層区分ごとに記録する。対の一方の当該層に明示された凍結未完があり、そのscopeが当該子に及ぶ場合に②とする。pair全体の設計適合や全面凍結の結論ではない。child refsの有無もfreeze分類とは別である。

検索はfixed BASEの64 JSON全体について、全階層のremaining/pending/unclosed系、unfixed/unobserved系の欄に加え、freeze/frozen/凍結を含むkeyと親path、未固定・未凍結等を含む文字列値を走査した。approved snapshot・fixture内の参照、case入力/期待の局所固定、上位L3期待、statusはpair全体のfreeze証拠にしない。B0 R2の子参照抽出は限定profileを使い、allowlist外の文字列出現内訳は所在だけを示す。下記M1–M3はactual source objectを直接確認して追加した手動参照で、helperの探索範囲・正式resolverを拡張しない。

旧sourceと失敗対応の根拠は固定入力監査JSON `docs/governance/audits/prerequisite-l3-l10-definition-audit-2026-10-12.json`の`/legacy_basis`であり、HARNESS A2の分類・照合表は上記Markdownから継承する。旧CLAUDE 49–63/82–85、L4 template 16–60、weakness audit 65–101、UTW005/014/021等の出典は固定入力の`/legacy_basis`から辿る。failureは現行要求の意味確認材料であり、新しいgateやauthorityを作らない。

## BRAIN詳細の判定根拠

- **E1 — 032全14組のL5/L8区分を②とする根拠**: S63:3406 `/remaining/5`は「032 input」の19型member/presenceを記述し、全Context/Result/finding/codec/実owner/凍結/意味閉包を未完と明記する。固定L5 sourceの各pair行は個別の`/contracts/{index}/requirement_ref`（各行の実indexと値位置lineはpair表）を示し、14の異なるL3-032子を各1件ずつ結ぶため、同じL5 parent文書に列挙された14 child scopeへ適用する。S63:3405 `/remaining/4`もformal wire/parser・実fixture/oracle freeze未成立を記す。S63:5985 `/wire_codec_contract/remaining/0`はcodecの限定scopeとして記録し、単独で全14へ広げる根拠とはしない。S63:12900 `/first_local_implementation_binding/freeze_state`は一関数/L6限定のため主根拠にしない。S64:112966 `/first_local_tdd_verification/input_state`も局所inputの独立review/test凍結未成立を記すが、この一関数の記録を全14組の主根拠にしない。E1はL5/L8区分内に明示未完がある分類であり、全14のL8 test/oracleが一様に未凍結という断定ではない。
- **P1 — 004 F02の部分source/expected記録**: L8 source S16:6819 `/owner_return_symbolic_cases/8/frozen_symbolic_expected`とS16:7188 `/owner_return_symbolic_cases/8/supplemental_source_freeze`はF02-S09のsource-derived symbolic expected・著述来歴を保持する。これはF02の局所caseでありpair全体 freeze判定へ流用しない。従ってF02 detailは③[P1]。
- **P2 — 007の歴史的source-first記録**: L8 source S24:17265 `/private_upstream_return_verification/source_first_freeze`にhash/history snapshotがあるが、S24:19485 `/private_b01_responsibility_return_cases/freeze_flag_note_ja`は「freeze時点の記録であり現proposalの現在状態ではない」と区別する。現在のpair全体 freeze証拠とせず、007 detailは③（B01行に注記）。
- **P3 — 032 F09の部分case固定**: L9 source S62:1566 `/conditional_source_dependency_verification/requirement_ref`は`HELIXBRAIN-L3-032-F09`を指定し、S62:8707 `/conditional_source_dependency_verification/freeze_boundary`は10 caseのcandidate input/expectedだけを固定し、全oracle/whole/all14閉包にしないと明示する。L9側の有限case固定でありL5/L8 pair全体 freezeではない。F09 detailはE1による②[P3]。basicは③を保持する。S62:92568 `/definition_meaning_resolution_verification_plan/remaining/1`は「全fn1/F09 whole期待の先固定」という計画上の作業であり、現L4/L9 pairの凍結状態の明示とは区別する。

- **E2 — 028 N01の限定未凍結**: S56:36337 `/unclosed_obligations/0/requirement_ref`が当該N01を指定し、S56:36351 `/unclosed_obligations/0/additional_unverified_materials/1`は「新entryの完全literal input/whole returnは未凍結」、S56:36651 `/connected_n01_owner_application_conditions/status`も追加凍結未実施と記す。この新entryの範囲をL5/L8の②とし、旧caseや他の028子へ広げない。
- **未観測分岐の境界**: 007 F02のS24:19258 `/private_upstream_return_verification/unfixed_conditions/0`は17件に含まないmember Absent/null分岐を残す記録、011のS32:30523 `/unobserved_branch_matrix/0`・S32:30528 `/unobserved_branch_matrix/1`は型外・状態併存/優先順の未観測範囲である。これらはbranch coverageの限界を記すものとして保持し、特定の新entryの未凍結状態を明示するE2とは区別して③に置く。

## 部分固定記録の所在（pair全体の凍結へ流用しない）

| 対象source | 代表Pointer・行 | 記録と限界 |
|---|---|---|
| 004 L9 | S14:1428 `/verification_obligations/0/owner_return_symbolic_conditions/conditions/0/basis/frozen_symbolic_condition_sha256` | 同key9件。独立条件の著述履歴であり全pairのreceiptではない。 |
| 004 L8 | S16:7188 `/owner_return_symbolic_cases/8/supplemental_source_freeze` | P1の局所expected/source固定。 |
| 007 L8 | S24:17265 `/private_upstream_return_verification/source_first_freeze` | P2の歴史的source/hash。現proposal状態と区別。 |
| 012 L8 | S36:7972 `/binding_probes/0/independent_frozen_basis` | 同key8件。独立契約/同軸L9の規範束縛を示すbasisでありpair凍結receiptではない。 |
| 032 L9 | S62:30744 `/descriptor_target_port_verification/materials/0/independent_freeze` | 同key9件。有限raw/expectedのhash固定。 |
| 032 L9 | S62:120309 `/identity_version_trace_verification/frozen_seven_storage` | 著述済み期待literalの格納圧縮。全14義務の凍結を表さない。 |

固定監査JSONに記録されたHARNESS 126組はA2で照合済み。Cの内訳はSECURITY 35、CONNECT 29、INFRA 29、LABO 26、INTELLIGENCE 11の合計130組で、OS 79組と合わせた209組が未完。今回のB1でBRAIN 70組を全scopeとして監査するが、他scopeの完了や全405組完了、実装許可は主張しない。

## 親別集計

| 親 | 組数 | L4/L9 ② / ③ | L5/L8 ② child IDs | L5/L8 ③ |
|---|---:|---:|---|---:|
| HELIXBRAIN-L2-001 | 3 | 0 / 3 | — | 3 |
| HELIXBRAIN-L2-002 | 4 | 0 / 4 | — | 4 |
| HELIXBRAIN-L2-003 | 2 | 0 / 2 | — | 2 |
| HELIXBRAIN-L2-004 | 3 | 0 / 3 | — | 3 |
| HELIXBRAIN-L2-005 | 2 | 0 / 2 | — | 2 |
| HELIXBRAIN-L2-007 | 3 | 0 / 3 | — | 3 |
| HELIXBRAIN-L2-008 | 3 | 0 / 3 | — | 3 |
| HELIXBRAIN-L2-011 | 3 | 0 / 3 | — | 3 |
| HELIXBRAIN-L2-012 | 3 | 0 / 3 | — | 3 |
| HELIXBRAIN-L2-019 | 5 | 0 / 5 | — | 5 |
| HELIXBRAIN-L2-020 | 4 | 0 / 4 | — | 4 |
| HELIXBRAIN-L2-022 | 5 | 0 / 5 | — | 5 |
| HELIXBRAIN-L2-025 | 6 | 0 / 6 | — | 6 |
| HELIXBRAIN-L2-028 | 4 | 0 / 4 | HELIXBRAIN-L3-028-N01 | 3 |
| HELIXBRAIN-L2-030 | 6 | 0 / 6 | — | 6 |
| HELIXBRAIN-L2-032 | 14 | 0 / 14 | HELIXBRAIN-L3-032-B01, HELIXBRAIN-L3-032-B02, HELIXBRAIN-L3-032-F01, HELIXBRAIN-L3-032-F02, HELIXBRAIN-L3-032-F03, HELIXBRAIN-L3-032-F04, HELIXBRAIN-L3-032-F05, HELIXBRAIN-L3-032-F06, HELIXBRAIN-L3-032-F07, HELIXBRAIN-L3-032-F08, HELIXBRAIN-L3-032-F09, HELIXBRAIN-L3-032-N01, HELIXBRAIN-L3-032-N02, HELIXBRAIN-L3-032-N03 | 0 |

集計: L4/L9は② 0・③ 70、L5/L8は② 15（L3-032全14と028-N01）・③ 55。①④⑤は付与しない。L4/L9のremainingは下流L5/L8やfuture L6/L7を示し、当該L4/L9対の未完根拠にしない。L5/L8の未確認はartifact不存在を意味しない。

## B0 source alias inventory（64文書）

| source | path | status位置 | document pair |
|---|---|---|---|
| S1 | `docs/helix-brain/L4-basic-design/domain-identity-evolution.json` | /status:3 | pair=L9 @ 101 |
| S2 | `docs/helix-brain/L9-integration-verification/domain-identity-evolution.json` | /status:3 | pair=L4 @ 101 |
| S3 | `docs/helix-brain/L5-detail-design/domain-identity-evolution.json` | /status:6 | pair=L8 @ 5, paired_document=HELIXBRAIN-L8-001 @ 1767 |
| S4 | `docs/helix-brain/L8-unit-verification/domain-identity-evolution.json` | /status:6 | pair=L5 @ 5, paired_document=HELIXBRAIN-L5-001 @ 6653 |
| S5 | `docs/helix-brain/L4-basic-design/knowledge-hierarchy.json` | /status:3 | pair=L9 @ 126 |
| S6 | `docs/helix-brain/L9-integration-verification/knowledge-hierarchy.json` | /status:3 | pair=L4 @ 126 |
| S7 | `docs/helix-brain/L5-detail-design/knowledge-hierarchy.json` | /status:7 | pair=L8 @ 4 |
| S8 | `docs/helix-brain/L8-unit-verification/knowledge-hierarchy.json` | /status:7 | pair=L5 @ 4 |
| S9 | `docs/helix-brain/L4-basic-design/pattern-descriptor-applicability.json` | /status:3 | pair=L9 @ 91 |
| S10 | `docs/helix-brain/L9-integration-verification/pattern-descriptor-applicability.json` | /status:3 | pair=L4 @ 91 |
| S11 | `docs/helix-brain/L5-detail-design/pattern-descriptor-applicability.json` | /status:6 | paired_document=HELIXBRAIN-L8-003-PATTERN-DESCRIPTOR-APPLICABILITY @ 4 |
| S12 | `docs/helix-brain/L8-unit-verification/pattern-descriptor-applicability.json` | /status:6 | paired_document=HELIXBRAIN-L5-003-PATTERN-DESCRIPTOR-APPLICABILITY @ 4 |
| S13 | `docs/helix-brain/L4-basic-design/pattern-comparison.json` | /status:3 | pair=L9 @ 101 |
| S14 | `docs/helix-brain/L9-integration-verification/pattern-comparison.json` | /status:3 | pair=L4 @ 101 |
| S15 | `docs/helix-brain/L5-detail-design/pattern-comparison.json` | /status:6 | pair=L8 @ 5 |
| S16 | `docs/helix-brain/L8-unit-verification/pattern-comparison.json` | /status:6 | pair=L5 @ 5 |
| S17 | `docs/helix-brain/L4-basic-design/structure-relation-trace.json` | /status:3 | pair=L9 @ 126 |
| S18 | `docs/helix-brain/L9-integration-verification/structure-relation-trace.json` | /status:3 | pair=L4 @ 126 |
| S19 | `docs/helix-brain/L5-detail-design/structure-relation-trace.json` | /status:7 | pair=L8 @ 5 |
| S20 | `docs/helix-brain/L8-unit-verification/structure-relation-trace.json` | /status:7 | pair=L5 @ 5 |
| S21 | `docs/helix-brain/L4-basic-design/knowledge-provenance-promotion.json` | /status:3 | pair=L9 @ 106 |
| S22 | `docs/helix-brain/L9-integration-verification/knowledge-provenance-promotion.json` | /status:3 | pair=L4 @ 106 |
| S23 | `docs/helix-brain/L5-detail-design/knowledge-provenance-promotion.json` | /status:7 | pair=L8 @ 5 |
| S24 | `docs/helix-brain/L8-unit-verification/knowledge-provenance-promotion.json` | /status:7 | pair=L5 @ 5 |
| S25 | `docs/helix-brain/L4-basic-design/knowledge-version-supersession.json` | /status:3 | pair=L9 @ 101 |
| S26 | `docs/helix-brain/L9-integration-verification/knowledge-version-supersession.json` | /status:3 | pair=L4 @ 101 |
| S27 | `docs/helix-brain/L5-detail-design/knowledge-version-supersession.json` | /status:6 | pair=L8 @ 5 |
| S28 | `docs/helix-brain/L8-unit-verification/knowledge-version-supersession.json` | /status:6 | pair=L5 @ 5 |
| S29 | `docs/helix-brain/L4-basic-design/product-meaning-structural-separation.json` | /status:3 | pair=L9 @ 106 |
| S30 | `docs/helix-brain/L9-integration-verification/product-meaning-structural-separation.json` | /status:3 | pair=L4 @ 106 |
| S31 | `docs/helix-brain/L5-detail-design/product-meaning-structural-separation.json` | /status:6 | pair=HELIXBRAIN-L5-011-PRODUCT-MEANING-STRUCTURAL-SEPARATION↔HELIXBRAIN-L8-011-PRODUCT-MEANING-STRUCTURAL-SEPARATION @ 5 |
| S32 | `docs/helix-brain/L8-unit-verification/product-meaning-structural-separation.json` | /status:6 | pair=HELIXBRAIN-L5-011-PRODUCT-MEANING-STRUCTURAL-SEPARATION↔HELIXBRAIN-L8-011-PRODUCT-MEANING-STRUCTURAL-SEPARATION @ 5 |
| S33 | `docs/helix-brain/L4-basic-design/candidate-authority-boundary.json` | /status:3 | pair=L9 @ 101 |
| S34 | `docs/helix-brain/L9-integration-verification/candidate-authority-boundary.json` | /status:3 | pair=L4 @ 101 |
| S35 | `docs/helix-brain/L5-detail-design/candidate-authority-boundary.json` | /status:7 | pair=L8 @ 4 |
| S36 | `docs/helix-brain/L8-unit-verification/candidate-authority-boundary.json` | /status:7 | pair=L5 @ 4 |
| S37 | `docs/helix-brain/L4-basic-design/core-knowledge-reply.json` | /status:3 | pair=L9 @ 111 |
| S38 | `docs/helix-brain/L9-integration-verification/core-knowledge-reply.json` | /status:3 | pair=L4 @ 111 |
| S39 | `docs/helix-brain/L5-detail-design/core-knowledge-reply.json` | /status:6 | pair=L8 @ 5 |
| S40 | `docs/helix-brain/L8-unit-verification/core-knowledge-reply.json` | /status:6 | pair=L5 @ 5 |
| S41 | `docs/helix-brain/L4-basic-design/labo-evaluation-candidate-receipt.json` | /status:3 | pair=L9 @ 111 |
| S42 | `docs/helix-brain/L9-integration-verification/labo-evaluation-candidate-receipt.json` | /status:3 | pair=L4 @ 111 |
| S43 | `docs/helix-brain/L5-detail-design/labo-evaluation-candidate-receipt.json` | /status:7 | pair=L8 @ 4 |
| S44 | `docs/helix-brain/L8-unit-verification/labo-evaluation-candidate-receipt.json` | /status:7 | pair=L5 @ 4 |
| S45 | `docs/helix-brain/L4-basic-design/design-input-obligation-trace.json` | /status:3 | pair=L9 @ 106 |
| S46 | `docs/helix-brain/L9-integration-verification/design-input-obligation-trace.json` | /status:3 | pair=L4 @ 106 |
| S47 | `docs/helix-brain/L5-detail-design/design-input-obligation-trace.json` | /status:6 | pair=L8 @ 5 |
| S48 | `docs/helix-brain/L8-unit-verification/design-input-obligation-trace.json` | /status:6 | pair=L5 @ 5 |
| S49 | `docs/helix-brain/L4-basic-design/knowledge-independent-adoption.json` | /status:3 | pair=L9 @ 126 |
| S50 | `docs/helix-brain/L9-integration-verification/knowledge-independent-adoption.json` | /status:3 | pair=L4 @ 126 |
| S51 | `docs/helix-brain/L5-detail-design/knowledge-independent-adoption.json` | /status:6 | pair=L8 @ 5 |
| S52 | `docs/helix-brain/L8-unit-verification/knowledge-independent-adoption.json` | /status:6 | pair=L5 @ 5 |
| S53 | `docs/helix-brain/L4-basic-design/knowledge-descriptor-compatibility.json` | /status:3 | pair=L9 @ 111 |
| S54 | `docs/helix-brain/L9-integration-verification/knowledge-descriptor-compatibility.json` | /status:3 | pair=L4 @ 111 |
| S55 | `docs/helix-brain/L5-detail-design/knowledge-descriptor-compatibility.json` | /status:6 | pair=L8 @ 5 |
| S56 | `docs/helix-brain/L8-unit-verification/knowledge-descriptor-compatibility.json` | /status:6 | pair=L5 @ 5 |
| S57 | `docs/helix-brain/L4-basic-design/knowledge-query-receipt.json` | /status:3 | pair=L9 @ 121 |
| S58 | `docs/helix-brain/L9-integration-verification/knowledge-query-receipt.json` | /status:3 | pair=L4 @ 121 |
| S59 | `docs/helix-brain/L5-detail-design/knowledge-query-receipt.json` | /status:460 | pair=L8 @ 459 |
| S60 | `docs/helix-brain/L8-unit-verification/knowledge-query-receipt.json` | /status:460 | pair=L5 @ 459 |
| S61 | `docs/helix-brain/L4-basic-design/template-semantic-supply.json` | /status:6 | paired_document=HELIXBRAIN-L9-032-TEMPLATE-SEMANTIC-SUPPLY @ 4 |
| S62 | `docs/helix-brain/L9-integration-verification/template-semantic-supply.json` | /status:6 | paired_document=HELIXBRAIN-L4-032-TEMPLATE-SEMANTIC-SUPPLY @ 4 |
| S63 | `docs/helix-brain/L5-detail-design/template-semantic-supply.json` | /status:6 | paired_document=HELIXBRAIN-L8-032-TEMPLATE-SEMANTIC-SUPPLY @ 4 |
| S64 | `docs/helix-brain/L8-unit-verification/template-semantic-supply.json` | /status:6 | paired_document=HELIXBRAIN-L5-032-TEMPLATE-SEMANTIC-SUPPLY @ 4 |

## Pair別照合表（70組）

`L4/L9`と`L5/L8`の分類を独立して記載する。ref欄はB0参照と、M1–M3として明示した手動actual-source supplementのみを示す。未確認pairをfixture/snapshotから補完しない。L9欄の2本目の参照は同一entryのsystem_oracle_refで、全70行で対象L10値との一致を静的照合済み。M2/M3の(+N)は同文書のcases直下trace_refs/l3の同一値に対する追加件数。末列`audit L3/L10 line`は固定監査JSON内の`/pairs/{index}/requirement/entry/id`と`/pairs/{index}/oracle/entry/id`の値位置lineをこの順で示す。

| audit /pairs index | 親 | L3↔L10 | L4 child ref | L9 child/oracle ref | L4/L9 | L5 child ref | L8 child ref | L5/L8 | audit L3/L10 line |
|---:|---|---|---|---|---|---|---|---|---|
| 126 | HELIXBRAIN-L2-001 | `HELIXBRAIN-L3-001-B01`↔`HELIXBRAIN-L10-001-B01` | S1:179 `/contracts/2/requirement_ref` | S2:1410 `/verification_obligations/2/requirement_ref` ← S2:1411 `/verification_obligations/2/system_oracle_ref` | ③ | S3:1832 `/l4_contract_bindings/2/requirement_id` | S4:5787 `/cases/22/requirement_ref`(+3) | ③ | 7701/7715 |
| 127 | HELIXBRAIN-L2-001 | `HELIXBRAIN-L3-001-F01`↔`HELIXBRAIN-L10-001-F01` | S1:119 `/contracts/0/requirement_ref` | S2:106 `/verification_obligations/0/requirement_ref` ← S2:107 `/verification_obligations/0/system_oracle_ref` | ③ | S3:1816 `/l4_contract_bindings/0/requirement_id` | S4:44 `/cases/0/requirement_ref`(+9) | ③ | 7742/7756 |
| 128 | HELIXBRAIN-L2-001 | `HELIXBRAIN-L3-001-F02`↔`HELIXBRAIN-L10-001-F02` | S1:149 `/contracts/1/requirement_ref` | S2:668 `/verification_obligations/1/requirement_ref` ← S2:669 `/verification_obligations/1/system_oracle_ref` | ③ | S3:1824 `/l4_contract_bindings/1/requirement_id` | S4:3890 `/cases/10/requirement_ref`(+14) | ③ | 7783/7797 |
| 129 | HELIXBRAIN-L2-002 | `HELIXBRAIN-L3-002-B01`↔`HELIXBRAIN-L10-002-B01` | S5:235 `/contracts/3/requirement_ref` | S6:1672 `/verification_obligations/3/requirement_ref` ← S6:1673 `/verification_obligations/3/system_oracle_ref` | ③ | S7:1428 `/l4_contract_bindings/3/requirement_id` | S8:7709 `/cases/31/requirement_ref`(+10) | ③ | 7824/7838 |
| 130 | HELIXBRAIN-L2-002 | `HELIXBRAIN-L3-002-F01`↔`HELIXBRAIN-L10-002-F01` | S5:145 `/contracts/0/requirement_ref` | S6:131 `/verification_obligations/0/requirement_ref` ← S6:132 `/verification_obligations/0/system_oracle_ref` | ③ | S7:1404 `/l4_contract_bindings/0/requirement_id` | S8:348 `/cases/0/requirement_ref`(+11) | ③ | 7865/7879 |
| 131 | HELIXBRAIN-L2-002 | `HELIXBRAIN-L3-002-F02`↔`HELIXBRAIN-L10-002-F02` | S5:175 `/contracts/1/requirement_ref` | S6:659 `/verification_obligations/1/requirement_ref` ← S6:660 `/verification_obligations/1/system_oracle_ref` | ③ | S7:1412 `/l4_contract_bindings/1/requirement_id` | S8:3293 `/cases/11/requirement_ref`(+11) | ③ | 7906/7920 |
| 132 | HELIXBRAIN-L2-002 | `HELIXBRAIN-L3-002-N01`↔`HELIXBRAIN-L10-002-N01` | S5:205 `/contracts/2/requirement_ref` | S6:1209 `/verification_obligations/2/requirement_ref` ← S6:1210 `/verification_obligations/2/system_oracle_ref` | ③ | S7:1420 `/l4_contract_bindings/2/requirement_id` | S8:6256 `/cases/22/requirement_ref`(+9) | ③ | 7947/7961 |
| 133 | HELIXBRAIN-L2-003 | `HELIXBRAIN-L3-003-F01`↔`HELIXBRAIN-L10-003-F01` | S9:108 `/contracts/0/requirement_ref` | S10:96 `/verification_obligations/0/requirement_ref` ← S10:97 `/verification_obligations/0/system_oracle_ref` | ③ | S11:966 `/contracts/0/requirement_ref`(+1) | S12:273 `/typed_cases/0/requirement_ref`(+17) | ③ | 7988/8001 |
| 134 | HELIXBRAIN-L2-003 | `HELIXBRAIN-L3-003-F02`↔`HELIXBRAIN-L10-003-F02` | S9:137 `/contracts/1/requirement_ref` | S10:1036 `/verification_obligations/1/requirement_ref` ← S10:1037 `/verification_obligations/1/system_oracle_ref` | ③ | S11:992 `/contracts/1/requirement_ref`(+1) | S12:5732 `/typed_cases/18/requirement_ref`(+11) | ③ | 8028/8041 |
| 135 | HELIXBRAIN-L2-004 | `HELIXBRAIN-L3-004-B01`↔`HELIXBRAIN-L10-004-B01` | S13:344 `/contracts/2/requirement_ref` | S14:4174 `/verification_obligations/2/requirement_ref` ← S14:4175 `/verification_obligations/2/system_oracle_ref` | ③ | S15:2274 `/functions/2/requirement_ref`(+1) | S16:4133 `/cases/24/requirement_ref`(+9) | ③ | 8068/8082 |
| 136 | HELIXBRAIN-L2-004 | `HELIXBRAIN-L3-004-F01`↔`HELIXBRAIN-L10-004-F01` | S13:121 `/contracts/0/requirement_ref` | S14:106 `/verification_obligations/0/requirement_ref` ← S14:107 `/verification_obligations/0/system_oracle_ref` | ③ | S15:2175 `/functions/0/requirement_ref`(+2) | S16:167 `/cases/0/requirement_ref`(+16) | ③ | 8109/8123 |
| 137 | HELIXBRAIN-L2-004 | `HELIXBRAIN-L3-004-F02`↔`HELIXBRAIN-L10-004-F02` | S13:272 `/contracts/1/requirement_ref` | S14:2384 `/verification_obligations/1/requirement_ref` ← S14:2385 `/verification_obligations/1/system_oracle_ref` | ③ | S15:2227 `/functions/1/requirement_ref`(+2) | S16:3373 `/cases/14/requirement_ref`(+13) | ③[P1] | 8150/8164 |
| 138 | HELIXBRAIN-L2-005 | `HELIXBRAIN-L3-005-F01`↔`HELIXBRAIN-L10-005-F01` | S17:143 `/contracts/0/requirement_ref` | S18:131 `/verification_obligations/0/requirement_ref` ← S18:132 `/verification_obligations/0/system_oracle_ref` | ③ | S19:413 `/l4_contracts/0/requirement_ref` | M2 S20:39 `/cases/0/trace_refs/l3`(+31) | ③ | 8191/8204 |
| 139 | HELIXBRAIN-L2-005 | `HELIXBRAIN-L3-005-F02`↔`HELIXBRAIN-L10-005-F02` | S17:173 `/contracts/1/requirement_ref` | S18:1931 `/verification_obligations/1/requirement_ref` ← S18:1932 `/verification_obligations/1/system_oracle_ref` | ③ | S19:443 `/l4_contracts/1/requirement_ref` | M2 S20:5001 `/cases/32/trace_refs/l3`(+22) | ③ | 8231/8244 |
| 140 | HELIXBRAIN-L2-007 | `HELIXBRAIN-L3-007-B01`↔`HELIXBRAIN-L10-007-B01` | S21:184 `/contracts/2/requirement_ref` | S22:6807 `/verification_obligations/2/requirement_ref` ← S22:6808 `/verification_obligations/2/system_oracle_ref` | ③ | S23:437 `/l4_contracts/2/requirement_ref` | M3 S24:13454 `/cases/46/trace_refs/l3`(+17) | ③[P2] | 8271/8284 |
| 141 | HELIXBRAIN-L2-007 | `HELIXBRAIN-L3-007-F01`↔`HELIXBRAIN-L10-007-F01` | S21:124 `/contracts/0/requirement_ref` | S22:111 `/verification_obligations/0/requirement_ref` ← S22:112 `/verification_obligations/0/system_oracle_ref` | ③ | S23:377 `/l4_contracts/0/requirement_ref` | M3 S24:17 `/cases/0/trace_refs/l3`(+18) | ③ | 8311/8324 |
| 142 | HELIXBRAIN-L2-007 | `HELIXBRAIN-L3-007-F02`↔`HELIXBRAIN-L10-007-F02` | S21:154 `/contracts/1/requirement_ref` | S22:2922 `/verification_obligations/1/requirement_ref` ← S22:2923 `/verification_obligations/1/system_oracle_ref` | ③ | S23:407 `/l4_contracts/1/requirement_ref` | M3 S24:5454 `/cases/19/trace_refs/l3`(+26) | ③ | 8351/8364 |
| 143 | HELIXBRAIN-L2-008 | `HELIXBRAIN-L3-008-B01`↔`HELIXBRAIN-L10-008-B01` | S25:179 `/contracts/2/requirement_ref` | S26:3760 `/verification_obligations/2/requirement_ref` ← S26:3761 `/verification_obligations/2/system_oracle_ref` | ③ | S27:1577 `/functions/2/requirement_ref` | S28:10990 `/cases/41/requirement_ref`(+18) | ③ | 8391/8404 |
| 144 | HELIXBRAIN-L2-008 | `HELIXBRAIN-L3-008-F01`↔`HELIXBRAIN-L10-008-F01` | S25:119 `/contracts/0/requirement_ref` | S26:106 `/verification_obligations/0/requirement_ref` ← S26:107 `/verification_obligations/0/system_oracle_ref` | ③ | S27:936 `/functions/0/requirement_ref` | S28:84 `/cases/0/requirement_ref`(+25) | ③ | 8431/8444 |
| 145 | HELIXBRAIN-L2-008 | `HELIXBRAIN-L3-008-F02`↔`HELIXBRAIN-L10-008-F02` | S25:149 `/contracts/1/requirement_ref` | S26:2485 `/verification_obligations/1/requirement_ref` ← S26:2486 `/verification_obligations/1/system_oracle_ref` | ③ | S27:1216 `/functions/1/requirement_ref` | S28:6817 `/cases/26/requirement_ref`(+14) | ③ | 8471/8484 |
| 146 | HELIXBRAIN-L2-011 | `HELIXBRAIN-L3-011-B01`↔`HELIXBRAIN-L10-011-B01` | S29:184 `/contracts/2/requirement_ref` | S30:7836 `/verification_obligations/2/requirement_ref` ← S30:7837 `/verification_obligations/2/system_oracle_ref` | ③ | S31:5639 `/functions/2/requirement_ref` | S32:20620 `/cases/43/requirement_ref`(+17) | ③ | 8511/8524 |
| 147 | HELIXBRAIN-L2-011 | `HELIXBRAIN-L3-011-F01`↔`HELIXBRAIN-L10-011-F01` | S29:124 `/contracts/0/requirement_ref` | S30:111 `/verification_obligations/0/requirement_ref` ← S30:112 `/verification_obligations/0/system_oracle_ref` | ③ | S31:2706 `/functions/0/requirement_ref` | S32:98 `/cases/0/requirement_ref`(+25) | ③ | 8551/8564 |
| 148 | HELIXBRAIN-L2-011 | `HELIXBRAIN-L3-011-F02`↔`HELIXBRAIN-L10-011-F02` | S29:154 `/contracts/1/requirement_ref` | S30:6212 `/verification_obligations/1/requirement_ref` ← S30:6213 `/verification_obligations/1/system_oracle_ref` | ③ | S31:4647 `/functions/1/requirement_ref` | S32:17458 `/cases/26/requirement_ref`(+16) | ③ | 8591/8604 |
| 149 | HELIXBRAIN-L2-012 | `HELIXBRAIN-L3-012-B01`↔`HELIXBRAIN-L10-012-B01` | S33:179 `/contracts/2/requirement_ref` | S34:1840 `/verification_obligations/2/requirement_ref` ← S34:1841 `/verification_obligations/2/system_oracle_ref` | ③ | S35:1573 `/function_contracts/2/l3_ref` | S36:6154 `/cases/34/l3_ref`(+8) | ③ | 8631/8645 |
| 150 | HELIXBRAIN-L2-012 | `HELIXBRAIN-L3-012-F01`↔`HELIXBRAIN-L10-012-F01` | S33:119 `/contracts/0/requirement_ref` | S34:106 `/verification_obligations/0/requirement_ref` ← S34:107 `/verification_obligations/0/system_oracle_ref` | ③ | S35:1444 `/function_contracts/0/l3_ref` | S36:448 `/cases/0/l3_ref`(+14) | ③ | 8672/8686 |
| 151 | HELIXBRAIN-L2-012 | `HELIXBRAIN-L3-012-F02`↔`HELIXBRAIN-L10-012-F02` | S33:149 `/contracts/1/requirement_ref` | S34:840 `/verification_obligations/1/requirement_ref` ← S34:841 `/verification_obligations/1/system_oracle_ref` | ③ | S35:1505 `/function_contracts/1/l3_ref` | S36:2851 `/cases/14/l3_ref`(+20) | ③ | 8713/8727 |
| 152 | HELIXBRAIN-L2-019 | `HELIXBRAIN-L3-019-B01`↔`HELIXBRAIN-L10-019-B01` | S37:248 `/contracts/4/requirement_ref` | S38:3787 `/verification_obligations/4/requirement_ref` ← S38:3788 `/verification_obligations/4/system_oracle_ref` | ③ | S39:3561 `/functions/4/requirement_ref` | S40:22351 `/cases/61/requirement_ref`(+13) | ③ | 8754/8768 |
| 153 | HELIXBRAIN-L2-019 | `HELIXBRAIN-L3-019-F01`↔`HELIXBRAIN-L10-019-F01` | S37:132 `/contracts/0/requirement_ref` | S38:116 `/verification_obligations/0/requirement_ref` ← S38:117 `/verification_obligations/0/system_oracle_ref` | ③ | S39:2774 `/functions/0/requirement_ref` | S40:172 `/cases/0/requirement_ref`(+11) | ③ | 8795/8809 |
| 154 | HELIXBRAIN-L2-019 | `HELIXBRAIN-L3-019-F02`↔`HELIXBRAIN-L10-019-F02` | S37:160 `/contracts/1/requirement_ref` | S38:726 `/verification_obligations/1/requirement_ref` ← S38:727 `/verification_obligations/1/system_oracle_ref` | ③ | S39:2975 `/functions/1/requirement_ref` | S40:2028 `/cases/12/requirement_ref`(+31) | ③ | 8836/8850 |
| 155 | HELIXBRAIN-L2-019 | `HELIXBRAIN-L3-019-F03`↔`HELIXBRAIN-L10-019-F03` | S37:190 `/contracts/2/requirement_ref` | S38:2924 `/verification_obligations/2/requirement_ref` ← S38:2925 `/verification_obligations/2/system_oracle_ref` | ③ | S39:3334 `/functions/2/requirement_ref` | S40:20816 `/cases/44/requirement_ref`(+5) | ③ | 8877/8891 |
| 156 | HELIXBRAIN-L2-019 | `HELIXBRAIN-L3-019-N01`↔`HELIXBRAIN-L10-019-N01` | S37:219 `/contracts/3/requirement_ref` | S38:3204 `/verification_obligations/3/requirement_ref` ← S38:3205 `/verification_obligations/3/system_oracle_ref` | ③ | S39:3415 `/functions/3/requirement_ref` | S40:21223 `/cases/50/requirement_ref`(+10) | ③ | 8918/8932 |
| 157 | HELIXBRAIN-L2-020 | `HELIXBRAIN-L3-020-B01`↔`HELIXBRAIN-L10-020-B01` | S41:220 `/contracts/3/requirement_ref` | S42:6544 `/verification_obligations/3/requirement_ref` ← S42:6545 `/verification_obligations/3/system_oracle_ref` | ③ | M1 S43:8664 `/source_coupled_obligations/3/requirement_ref` | S44:18612 `/cases/55/requirement_ref`(+14) | ③ | 8959/8972 |
| 158 | HELIXBRAIN-L2-020 | `HELIXBRAIN-L3-020-F01`↔`HELIXBRAIN-L10-020-F01` | S41:131 `/contracts/0/requirement_ref` | S42:116 `/verification_obligations/0/requirement_ref` ← S42:117 `/verification_obligations/0/system_oracle_ref` | ③ | M1 S43:8618 `/source_coupled_obligations/0/requirement_ref` | S44:274 `/cases/0/requirement_ref`(+24) | ③ | 8999/9012 |
| 159 | HELIXBRAIN-L2-020 | `HELIXBRAIN-L3-020-F02`↔`HELIXBRAIN-L10-020-F02` | S41:161 `/contracts/1/requirement_ref` | S42:3813 `/verification_obligations/1/requirement_ref` ← S42:3814 `/verification_obligations/1/system_oracle_ref` | ③ | M1 S43:8633 `/source_coupled_obligations/1/requirement_ref` | S44:10733 `/cases/25/requirement_ref`(+14) | ③ | 9039/9052 |
| 160 | HELIXBRAIN-L2-020 | `HELIXBRAIN-L3-020-F03`↔`HELIXBRAIN-L10-020-F03` | S41:190 `/contracts/2/requirement_ref` | S42:5559 `/verification_obligations/2/requirement_ref` ← S42:5560 `/verification_obligations/2/system_oracle_ref` | ③ | M1 S43:8649 `/source_coupled_obligations/2/requirement_ref` | S44:15903 `/cases/40/requirement_ref`(+14) | ③ | 9079/9092 |
| 161 | HELIXBRAIN-L2-022 | `HELIXBRAIN-L3-022-B01`↔`HELIXBRAIN-L10-022-B01` | S45:243 `/contracts/4/requirement_ref` | S46:2078 `/verification_obligations/4/requirement_ref` ← S46:2079 `/verification_obligations/4/system_oracle_ref` | ③ | S47:1096 `/l4_contract_bindings/4/requirement_ref` | S48:6637 `/cases/37/requirement_ref`(+7) | ③ | 9119/9133 |
| 162 | HELIXBRAIN-L2-022 | `HELIXBRAIN-L3-022-F01`↔`HELIXBRAIN-L10-022-F01` | S45:128 `/contracts/0/requirement_ref` | S46:111 `/verification_obligations/0/requirement_ref` ← S46:112 `/verification_obligations/0/system_oracle_ref` | ③ | S47:1068 `/l4_contract_bindings/0/requirement_ref` | S48:103 `/cases/0/requirement_ref`(+9) | ③ | 9160/9174 |
| 163 | HELIXBRAIN-L2-022 | `HELIXBRAIN-L3-022-F02`↔`HELIXBRAIN-L10-022-F02` | S45:156 `/contracts/1/requirement_ref` | S46:613 `/verification_obligations/1/requirement_ref` ← S46:614 `/verification_obligations/1/system_oracle_ref` | ③ | S47:1075 `/l4_contract_bindings/1/requirement_ref` | S48:1907 `/cases/10/requirement_ref`(+9) | ③ | 9201/9215 |
| 164 | HELIXBRAIN-L2-022 | `HELIXBRAIN-L3-022-F03`↔`HELIXBRAIN-L10-022-F03` | S45:185 `/contracts/2/requirement_ref` | S46:1115 `/verification_obligations/2/requirement_ref` ← S46:1116 `/verification_obligations/2/system_oracle_ref` | ③ | S47:1082 `/l4_contract_bindings/2/requirement_ref` | S48:3449 `/cases/20/requirement_ref`(+5) | ③ | 9242/9256 |
| 165 | HELIXBRAIN-L2-022 | `HELIXBRAIN-L3-022-F04`↔`HELIXBRAIN-L10-022-F04` | S45:214 `/contracts/3/requirement_ref` | S46:1497 `/verification_obligations/3/requirement_ref` ← S46:1498 `/verification_obligations/3/system_oracle_ref` | ③ | S47:1089 `/l4_contract_bindings/3/requirement_ref` | S48:4529 `/cases/26/requirement_ref`(+10) | ③ | 9283/9297 |
| 166 | HELIXBRAIN-L2-025 | `HELIXBRAIN-L3-025-B01`↔`HELIXBRAIN-L10-025-B01` | S49:300 `/contracts/5/requirement_ref` | S50:17788 `/verification_obligations/5/requirement_ref` ← S50:17789 `/verification_obligations/5/system_oracle_ref` | ③ | S51:841 `/l4_contract_bindings/5/l3` | S52:43657 `/cases/92/requirement_ref`(+7) | ③ | 9324/9337 |
| 167 | HELIXBRAIN-L2-025 | `HELIXBRAIN-L3-025-F01`↔`HELIXBRAIN-L10-025-F01` | S49:149 `/contracts/0/requirement_ref` | S50:131 `/verification_obligations/0/requirement_ref` ← S50:132 `/verification_obligations/0/system_oracle_ref` | ③ | S51:811 `/l4_contract_bindings/0/l3` | S52:248 `/cases/0/requirement_ref`(+18) | ③ | 9364/9377 |
| 168 | HELIXBRAIN-L2-025 | `HELIXBRAIN-L3-025-F02`↔`HELIXBRAIN-L10-025-F02` | S49:179 `/contracts/1/requirement_ref` | S50:5085 `/verification_obligations/1/requirement_ref` ← S50:5086 `/verification_obligations/1/system_oracle_ref` | ③ | S51:817 `/l4_contract_bindings/1/l3` | S52:13236 `/cases/19/requirement_ref`(+16) | ③ | 9404/9417 |
| 169 | HELIXBRAIN-L2-025 | `HELIXBRAIN-L3-025-F03`↔`HELIXBRAIN-L10-025-F03` | S49:209 `/contracts/2/requirement_ref` | S50:8372 `/verification_obligations/2/requirement_ref` ← S50:8373 `/verification_obligations/2/system_oracle_ref` | ③ | S51:823 `/l4_contract_bindings/2/l3` | S52:21014 `/cases/36/requirement_ref`(+14) | ③ | 9444/9457 |
| 170 | HELIXBRAIN-L2-025 | `HELIXBRAIN-L3-025-F04`↔`HELIXBRAIN-L10-025-F04` | S49:239 `/contracts/3/requirement_ref` | S50:11267 `/verification_obligations/3/requirement_ref` ← S50:11268 `/verification_obligations/3/system_oracle_ref` | ③ | S51:829 `/l4_contract_bindings/3/l3` | S52:27447 `/cases/51/requirement_ref`(+28) | ③ | 9484/9497 |
| 171 | HELIXBRAIN-L2-025 | `HELIXBRAIN-L3-025-N01`↔`HELIXBRAIN-L10-025-N01` | S49:270 `/contracts/4/requirement_ref` | S50:15205 `/verification_obligations/4/requirement_ref` ← S50:15206 `/verification_obligations/4/system_oracle_ref` | ③ | S51:835 `/l4_contract_bindings/4/l3` | S52:38275 `/cases/80/requirement_ref`(+11) | ③ | 9524/9537 |
| 172 | HELIXBRAIN-L2-028 | `HELIXBRAIN-L3-028-B01`↔`HELIXBRAIN-L10-028-B01` | S53:372 `/contracts/3/requirement_ref` | S54:10549 `/verification_obligations/3/requirement_ref` ← S54:10550 `/verification_obligations/3/system_oracle_ref` | ③ | S55:3075 `/functions/3/requirement_ref`(+1) | S56:16893 `/cases/75/function_ref`(+18) ← S55:3074 `/functions/3/id` | ③ | 9564/9577 |
| 173 | HELIXBRAIN-L2-028 | `HELIXBRAIN-L3-028-F01`↔`HELIXBRAIN-L10-028-F01` | S53:131 `/contracts/0/requirement_ref` | S54:116 `/verification_obligations/0/requirement_ref` ← S54:117 `/verification_obligations/0/system_oracle_ref` | ③ | S55:1380 `/functions/0/requirement_ref`(+1) | S56:355 `/cases/0/function_ref`(+28) ← S55:1379 `/functions/0/id` | ③ | 9604/9617 |
| 174 | HELIXBRAIN-L2-028 | `HELIXBRAIN-L3-028-F02`↔`HELIXBRAIN-L10-028-F02` | S53:160 `/contracts/1/requirement_ref` | S54:3403 `/verification_obligations/1/requirement_ref` ← S54:3404 `/verification_obligations/1/system_oracle_ref` | ③ | S55:1772 `/functions/1/requirement_ref`(+1) | S56:5584 `/cases/29/function_ref`(+32) ← S55:1771 `/functions/1/id` | ③ | 9644/9657 |
| 175 | HELIXBRAIN-L2-028 | `HELIXBRAIN-L3-028-N01`↔`HELIXBRAIN-L10-028-N01` | S53:319 `/contracts/2/requirement_ref` | S54:9342 `/verification_obligations/2/requirement_ref` ← S54:9343 `/verification_obligations/2/system_oracle_ref` | ③ | S55:2829 `/functions/2/requirement_ref`(+2) | S56:15073 `/cases/62/function_ref`(+12) ← S55:2828 `/functions/2/id` | ②[E2; 新entry literal whole] | 9684/9697 |
| 176 | HELIXBRAIN-L2-030 | `HELIXBRAIN-L3-030-B01`↔`HELIXBRAIN-L10-030-B01` | S57:334 `/contracts/5/requirement_ref` | S58:9936 `/verification_obligations/5/requirement_ref` ← S58:9937 `/verification_obligations/5/system_oracle_ref` | ③ | S59:3571 `/functions/5/requirement_ref` | S60:51744 `/cases/87/requirement_ref`(+11) | ③ | 9724/9737 |
| 177 | HELIXBRAIN-L2-030 | `HELIXBRAIN-L3-030-F01`↔`HELIXBRAIN-L10-030-F01` | S57:143 `/contracts/0/requirement_ref` | S58:126 `/verification_obligations/0/requirement_ref` ← S58:127 `/verification_obligations/0/system_oracle_ref` | ③ | S59:3278 `/functions/0/requirement_ref` | S60:465 `/cases/0/requirement_ref`(+27) | ③ | 9764/9777 |
| 178 | HELIXBRAIN-L2-030 | `HELIXBRAIN-L3-030-F02`↔`HELIXBRAIN-L10-030-F02` | S57:173 `/contracts/1/requirement_ref` | S58:2797 `/verification_obligations/1/requirement_ref` ← S58:2798 `/verification_obligations/1/system_oracle_ref` | ③ | S59:3338 `/functions/1/requirement_ref` | S60:13754 `/cases/28/requirement_ref`(+14) | ③ | 9804/9817 |
| 179 | HELIXBRAIN-L2-030 | `HELIXBRAIN-L3-030-F03`↔`HELIXBRAIN-L10-030-F03` | S57:203 `/contracts/2/requirement_ref` | S58:3928 `/verification_obligations/2/requirement_ref` ← S58:3929 `/verification_obligations/2/system_oracle_ref` | ③ | S59:3394 `/functions/2/requirement_ref` | S60:19024 `/cases/43/requirement_ref`(+15) | ③ | 9844/9857 |
| 180 | HELIXBRAIN-L2-030 | `HELIXBRAIN-L3-030-F04`↔`HELIXBRAIN-L10-030-F04` | S57:274 `/contracts/3/requirement_ref` | S58:5756 `/verification_obligations/3/requirement_ref` ← S58:5757 `/verification_obligations/3/system_oracle_ref` | ③ | S59:3443 `/functions/3/requirement_ref` | S60:28131 `/cases/59/requirement_ref`(+13) | ③ | 9884/9897 |
| 181 | HELIXBRAIN-L2-030 | `HELIXBRAIN-L3-030-N01`↔`HELIXBRAIN-L10-030-N01` | S57:304 `/contracts/4/requirement_ref` | S58:8508 `/verification_obligations/4/requirement_ref` ← S58:8509 `/verification_obligations/4/system_oracle_ref` | ③ | S59:3502 `/functions/4/requirement_ref` | S60:42956 `/cases/73/requirement_ref`(+13) | ③ | 9924/9937 |
| 182 | HELIXBRAIN-L2-032 | `HELIXBRAIN-L3-032-B01`↔`HELIXBRAIN-L10-032-B01` | S61:333 `/contracts/0/requirement_ref` | S62:197 `/cases/0/requirement_ref` ← S62:198 `/cases/0/system_oracle_ref` | ③ | S63:1573 `/contracts/0/requirement_ref` | S64:8091 `/cases/0/requirement_ref` | ②[E1] | 9964/9978 |
| 183 | HELIXBRAIN-L2-032 | `HELIXBRAIN-L3-032-B02`↔`HELIXBRAIN-L10-032-B02` | S61:349 `/contracts/1/requirement_ref` | S62:222 `/cases/1/requirement_ref` ← S62:223 `/cases/1/system_oracle_ref` | ③ | S63:1595 `/contracts/1/requirement_ref` | S64:8137 `/cases/1/requirement_ref` | ②[E1] | 10005/10019 |
| 184 | HELIXBRAIN-L2-032 | `HELIXBRAIN-L3-032-F01`↔`HELIXBRAIN-L10-032-F01` | S61:365 `/contracts/2/requirement_ref` | S62:258 `/cases/2/requirement_ref` ← S62:259 `/cases/2/system_oracle_ref` | ③ | S63:1617 `/contracts/2/requirement_ref` | S64:8209 `/cases/2/requirement_ref` | ②[E1] | 10046/10060 |
| 185 | HELIXBRAIN-L2-032 | `HELIXBRAIN-L3-032-F02`↔`HELIXBRAIN-L10-032-F02` | S61:381 `/contracts/3/requirement_ref` | S62:316 `/cases/3/requirement_ref` ← S62:317 `/cases/3/system_oracle_ref` | ③ | S63:1639 `/contracts/3/requirement_ref` | S64:8328 `/cases/3/requirement_ref` | ②[E1] | 10087/10101 |
| 186 | HELIXBRAIN-L2-032 | `HELIXBRAIN-L3-032-F03`↔`HELIXBRAIN-L10-032-F03` | S61:397 `/contracts/4/requirement_ref` | S62:847 `/cases/4/requirement_ref` ← S62:848 `/cases/4/system_oracle_ref` | ③ | S63:1661 `/contracts/4/requirement_ref` | S64:10379 `/cases/4/requirement_ref` | ②[E1] | 10128/10142 |
| 187 | HELIXBRAIN-L2-032 | `HELIXBRAIN-L3-032-F04`↔`HELIXBRAIN-L10-032-F04` | S61:413 `/contracts/5/requirement_ref` | S62:905 `/cases/5/requirement_ref` ← S62:906 `/cases/5/system_oracle_ref` | ③ | S63:1683 `/contracts/5/requirement_ref` | S64:10500 `/cases/5/requirement_ref` | ②[E1] | 10169/10183 |
| 188 | HELIXBRAIN-L2-032 | `HELIXBRAIN-L3-032-F05`↔`HELIXBRAIN-L10-032-F05` | S61:430 `/contracts/6/requirement_ref` | S62:1030 `/cases/6/requirement_ref` ← S62:1031 `/cases/6/system_oracle_ref` | ③ | S63:1705 `/contracts/6/requirement_ref` | S64:10773 `/cases/6/requirement_ref` | ②[E1] | 10210/10224 |
| 189 | HELIXBRAIN-L2-032 | `HELIXBRAIN-L3-032-F06`↔`HELIXBRAIN-L10-032-F06` | S61:446 `/contracts/7/requirement_ref` | S62:1077 `/cases/7/requirement_ref` ← S62:1078 `/cases/7/system_oracle_ref` | ③ | S63:1727 `/contracts/7/requirement_ref` | S64:10871 `/cases/7/requirement_ref` | ②[E1] | 10251/10265 |
| 190 | HELIXBRAIN-L2-032 | `HELIXBRAIN-L3-032-F07`↔`HELIXBRAIN-L10-032-F07` | S61:462 `/contracts/8/requirement_ref` | S62:1135 `/cases/8/requirement_ref` ← S62:1136 `/cases/8/system_oracle_ref` | ③ | S63:1749 `/contracts/8/requirement_ref` | S64:10987 `/cases/8/requirement_ref` | ②[E1] | 10292/10306 |
| 191 | HELIXBRAIN-L2-032 | `HELIXBRAIN-L3-032-F08`↔`HELIXBRAIN-L10-032-F08` | S61:478 `/contracts/9/requirement_ref` | S62:1204 `/cases/9/requirement_ref` ← S62:1205 `/cases/9/system_oracle_ref` | ③ | S63:1771 `/contracts/9/requirement_ref` | S64:11138 `/cases/9/requirement_ref` | ②[E1] | 10333/10347 |
| 192 | HELIXBRAIN-L2-032 | `HELIXBRAIN-L3-032-F09`↔`HELIXBRAIN-L10-032-F09` | S61:494 `/contracts/10/requirement_ref` | S62:1262 `/cases/10/requirement_ref` ← S62:1263 `/cases/10/system_oracle_ref` | ③ | S63:1793 `/contracts/10/requirement_ref` | S64:11264 `/cases/10/requirement_ref` | ②[E1;P3] | 10374/10388 |
| 193 | HELIXBRAIN-L2-032 | `HELIXBRAIN-L3-032-N01`↔`HELIXBRAIN-L10-032-N01` | S61:512 `/contracts/11/requirement_ref` | S62:1344 `/cases/11/requirement_ref` ← S62:1345 `/cases/11/system_oracle_ref` | ③ | S63:1815 `/contracts/11/requirement_ref` | S64:11467 `/cases/11/requirement_ref` | ②[E1] | 10415/10429 |
| 194 | HELIXBRAIN-L2-032 | `HELIXBRAIN-L3-032-N02`↔`HELIXBRAIN-L10-032-N02` | S61:529 `/contracts/12/requirement_ref` | S62:1381 `/cases/12/requirement_ref` ← S62:1382 `/cases/12/system_oracle_ref` | ③ | S63:1837 `/contracts/12/requirement_ref` | S64:11531 `/cases/12/requirement_ref` | ②[E1] | 10456/10470 |
| 195 | HELIXBRAIN-L2-032 | `HELIXBRAIN-L3-032-N03`↔`HELIXBRAIN-L10-032-N03` | S61:545 `/contracts/13/requirement_ref` | S62:1505 `/cases/13/requirement_ref` ← S62:1506 `/cases/13/system_oracle_ref` | ③ | S63:1859 `/contracts/13/requirement_ref` | S64:11817 `/cases/13/requirement_ref` | ②[E1] | 10497/10511 |

## 手動補足参照

以下はB0の限定profileで自動抽出されなかったchild refを、固定BASEの実source object上で確認した補足である。参照元は実契約またはcase内のtrace fieldであり、fixture payload・approved snapshot・上位期待からの代用ではない。これらの参照追加はfreeze分類や意味適合を自動判定しない。

- **M1 — S43 `source_coupled_obligations`**: L5-020の4契約がpair表のindex 157–160に各々対応する。B01: S43:8664 `/source_coupled_obligations/3/requirement_ref`; F01: S43:8618 `/source_coupled_obligations/0/requirement_ref`; F02: S43:8633 `/source_coupled_obligations/1/requirement_ref`; F03: S43:8649 `/source_coupled_obligations/2/requirement_ref`。
- **M2 — S20 `trace_refs`**: L8-005の2 caseがpair表index 138–139に対応する。F01: S20:39 `/cases/0/trace_refs/l3`(+31); F02: S20:5001 `/cases/32/trace_refs/l3`(+22)。
- **M3 — S24 `trace_refs`**: L8-007の3 caseがpair表index 140–142に対応する。B01: S24:13454 `/cases/46/trace_refs/l3`(+17); F01: S24:17 `/cases/0/trace_refs/l3`(+18); F02: S24:5454 `/cases/19/trace_refs/l3`(+26)。
