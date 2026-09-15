# 旧要求補助source無損失inventory

status: preserved_pending_relation_mapping
ledger: [補助source台帳](legacy-requirement-supplementary-source-carry-forward.jsonl)

旧要求を要求本文だけへ縮約しないため、未追跡だった次の655 itemを原文・source pointer・digest付きで保持する。

| source | item | 現在状態 |
|---|---:|---|
| `helix-requirements_v1.3.md` | 521非空行 | `preserved_pending_atomization` |
| `acceptance_cases.json` | 72 | `preserved_pending_rehome` |
| `refinement_contracts.json` | 14 | `preserved_pending_rehome` |
| `system_contracts.json` | 24 | `preserved_pending_rehome` |
| `system_tests.json` | 24 | `preserved_pending_rehome` |

採否、対象、既存153要求とのrelation、successor、意味変更は全件未確定である。要求だけでなく、acceptance、refinement、contract、testの意味も原sourceへ戻れる状態で後続mappingする。

[見出し保全台帳](legacy-requirement-structural-heading-carry-forward.jsonl)は、22旧要求文書でsemantic line台帳から構造記号として除外した見出し317行を保持する。既存identityとしてsemantic line台帳に含まれる見出し21行と合わせ、見出し338/338行を追跡する。
