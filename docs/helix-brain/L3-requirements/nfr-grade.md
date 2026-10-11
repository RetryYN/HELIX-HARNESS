# HELIXBRAIN-L3-032-nfr

生成view。意味正本: `nfr-grade.json`。本文JSON SHA-256: `3ee2f57fc2fbdb48bd9134e25409645acf3b1658aafbd236b36563d385ac5b38`。直接編集せずJSONから再生成する。

| 項目 | 内容 |
|---|---|
| mechanism | HELIX-BRAIN |
| stage | Stage 1 |
| primary_parent | HELIXBRAIN-L2-032 |
| version_target | 1.0 |
| status | draft_not_approved |
| authority_effect | none_until_exact_revision_delegated_approval |
| scope | 10/12限定前提構築の032汎用template候補提供。003/005/007/008/028等は参照契約で、その全能力の新規承認や全seed採用を表さない。 |
| source_revision | a2cc3defcee5a229145c89217af30c7d20da998f |
| source_pins | path: docs/concept/helix-concept.md / sha256: bbc787c5dc17de9eded156285ad82ef768788cfa31822dfffa477db073a5e715 / path: docs/concept/helix-principles.md / sha256: 5b3d1d42b38a6e09d5c4da45760036e5234f5a316b3a02e7c48fb88a48a4c441 / path: docs/helix-brain/L1-planning/brain-intent.md / sha256: 2674b2e1a770a038b2d53a93ca635a0cbbfca42af463a562f22e1c51d5ebb5f0 / path: docs/helix-brain/L2-requirements/brain-requirements.md / sha256: ef41de572d35912a0345dad2960a3ae7015ca5434d67247503785b9f65e8346c / path: docs/helix-brain/L11-acceptance/brain-acceptance.md / sha256: b48433e20139daa2f6cd7da7bac1b35e1634fd802d68ada87a93a7d3d7b44c87 / path: docs/governance/decisions/brain-template-contract-032-po-decision-2026-10-10.md / sha256: 6f0b54a464f5031fc1b501340a9fea88544bde2bd68faabc8001c72628f82964 / path: docs/governance/decisions/requirements-entry-restart-po-decision-2026-10-12.md / sha256: 994a81b2d5eb4cbf291951b688fca85fa2b1353848091c0ab4cfac91fb8c131b / path: docs/governance/decisions/msgcontent-knowledge-po-decision-2026-10-12.md / sha256: 85fbebc322732a083e6fefb9aa5b7c7f9f24de8d894266240c7f94f472e00b5a / path: docs/governance/decisions/p3first-knowledge-po-decision-2026-10-12.md / sha256: c091ac5083a0ebffb441921ab614567cfece8d95ded91cba3de3d462f9d667a9 / path: docs/helix-brain/candidates/first-cycle-design-template-knowledge.json / sha256: 3779f7612a1555a07796bb3097f124ca4c63878bc3a42ec6fc864cb317d5d1a8 / path: docs/helix-brain/candidates/first-cycle-reference-template-knowledge.json / sha256: 321d1253e63a11c3b14b398138ee976e2960298d2007431808396171b2431caf / path: docs/governance/decisions/seedfirst-knowledge-po-decision-2026-10-10.md / sha256: 4168da797e1a55da10e9f21d50a0dec21c0e79153c3200dace0a7762fbd888ae / path: docs/helix-brain/knowledge/requirements-acceptance-template-knowledge.json / sha256: 8fb9dd2a7f4a90f3f941f36331f7418c55e1441763f8e84da709c9056c3c9e77 |
| knowledge_use | MSGCONTENTの3templateの意味・制限、P3FIRSTのVT103と選択SDOP19節だけ。原candidate/schema/keyを正式化せず、SEEDFIRSTのVT001/VT102とC01/C02/C08/C26の限定意味は、非UIかつ技術的不確実性なしを確認した要求/受入部分に限る。他pairへ自動拡張しない。 |
| serialization_boundary | 本JSON keyは要件文書の記述用。製品template schema、wire format、registry、式木、algorithmを固定しない。JSON本文が意味正本でMDは同内容の生成view。 |
| legacy_comparison | reuse_class: semantic_rederivation / sources: path: archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/design-template-json-authority.md / lines: 19 / 60 / path: archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/design-template-json-authority.md / lines: 33 / 108 / path: archive/legacy-generation-2026-09-14/root/docs/governance/predecessor-harness-full-weakness-audit-2026-07-20.md / lines: 65 / 101 / preserve: 項目・identity/版・未知保持・意味/view分離・項目単位trace。UTW014の欠損空集合化とUTW021の自己申告完了を防ぐ。 / change: 旧TPL ID文法、整数版、lifecycle enum、式木、runtime、pair freezeを継承せず、採用032と限定知識の意味から再導出する。 / reason: 旧統合されなかったtemplate意味供給をBRAIN責務へ分離し、10/10のseed不使用・hash/件数のみreviewを繰り返さない。 |
| remaining | 参照するHARNESS共通L3契約のexact revisionは未承認。先行pairの閉包後に束縛し直す。 / CORE009/OS002、接続・安全・資源・計測の限定pairを別機構PRで起草する。032だけで限定前提全体の要件定義完了としない。 / 本体のschema/方式/計測値の導出、対設計とoracle凍結、実装前Red、実装/Green、L10実行、PO L11実物受入は後続段階。 |
| document_id | HELIXBRAIN-L3-032-nfr |
| layer | L3 |
| pair | P3: L3↔L10 |
| category | nfr |

## HELIXBRAIN-L3-032-N01 追跡可能性

**parent**: HELIXBRAIN-L2-032
**obligation**: 各返却項目・不足・矛盾についてsource/knowledge revisionと根拠へ戻れる。識別できない項目を成功返却にしない。
**oracle_ref**: HELIXBRAIN-L10-032-N01
**failure_return**: 汎用定義/知識版はBRAIN。製品値/適用はCORE。project記録はOS。意味が変わる左層へBackflow。

## HELIXBRAIN-L3-032-N02 未知の保存

**parent**: HELIXBRAIN-L2-032
**obligation**: 欠落、unknown、矛盾、非適用、未観測、未受領を失わず、説明・件数・hash一致・下位greenで成立へ変えない。
**oracle_ref**: HELIXBRAIN-L10-032-N02
**failure_return**: 汎用定義/知識版はBRAIN。製品値/適用はCORE。project記録はOS。意味が変わる左層へBackflow。

## HELIXBRAIN-L3-032-N03 観測と非機能値の不足

**parent**: HELIXBRAIN-L2-032
**obligation**: 稼働対象の性能/容量/可用性/運用条件等は採用P3FIRSTの問いとHARNESS034へ結び、根拠付き値または適用判定を別途導く。未決baseline/閾値・方式・実資源をBRAIN知識が創作しない。初回実操作の安全/資源/観測契約は各ownerへ返す。
**oracle_ref**: HELIXBRAIN-L10-032-N03
**failure_return**: 汎用定義/知識版はBRAIN。製品値/適用はCORE。project記録はOS。意味が変わる左層へBackflow。
