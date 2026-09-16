---
status: draft_candidate
authority_status: approved_pending_canonical_promotion
canonical_vmodel: L1-L12
canonical_layer: L1
canonical_pair: L12
plan: PLAN-L3-84-helix-concept-v4-upgrade
approval_record_id: L3-PO-1496-001
approval_scope: candidate_exact_set_only
approved_body_sha256: 73e110258b8051906e1ac529d7c1ca857fc78a4c87b42291645348fa6f4f776a
authority_note: "本文の未承認表記は承認前の原稿を保持したもの。PLANの候補承認記録を参照し、current Concept・Requirement IR・runtimeへの昇格と区別する。L1分類はL2要求の合意済みを意味しない。"
---
# HELIX Concept v4.0 L1要求候補

## Authority境界

本書はIssue #1496の未承認候補であり、current L1要求ではない。

| ID | 要求 |
|---|---|
| HCV4-BR-001 | 利用者は、複数AIへ開発を委譲しても価値、要求、承認、不可逆作用の最終authorityを保持できること。 |
| HCV4-BR-002 | 利用者は、変更の責務、対象、実行者、検証、証拠、release、運用結果を同一系譜で追跡できること。 |
| HCV4-BR-003 | 利用者は、AIの完了宣言ではなく反証可能な証拠で変更完了を確認できること。 |
| HCV4-BR-004 | 利用者は、provider、model、IDE、runtimeが変化しても同じauthorityと安全境界を維持できること。 |
| HCV4-BR-005 | 利用者は、HELIXの機能を適格性が確認された単位で組み合わせ、導入、更新、復旧できること。 |
| HCV4-BR-006 | 利用者は、開発・運用で得た知見をauthorityの無断変更なしに改善候補へ還流できること。 |

## 期待する利用体験

人間は意図、要求、体験、承認境界を示す。HELIXは変更契約を作り、bounded workerへ配り、独立検証し、
同一HEADの証拠で閉じる。失敗や環境変化は既存Requirementへ再入し、人間に日常的な進捗操作を要求しない。
