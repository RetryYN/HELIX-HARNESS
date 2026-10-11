# HELIXBRAIN-L10-032-business

生成view。意味正本: `business-verification.json`。本文JSON SHA-256: `2a6157091b2cbd0d81576257b08cf443532c1a02bf8e16fc7762add12bf6f84c`。直接編集せずJSONから再生成する。

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
| source_pins | path: docs/concept/helix-concept.md / sha256: bbc787c5dc17de9eded156285ad82ef768788cfa31822dfffa477db073a5e715 / path: docs/concept/helix-principles.md / sha256: 5b3d1d42b38a6e09d5c4da45760036e5234f5a316b3a02e7c48fb88a48a4c441 / path: docs/helix-brain/L1-planning/brain-intent.md / sha256: 2674b2e1a770a038b2d53a93ca635a0cbbfca42af463a562f22e1c51d5ebb5f0 / path: docs/helix-brain/L2-requirements/brain-requirements.md / sha256: ef41de572d35912a0345dad2960a3ae7015ca5434d67247503785b9f65e8346c / path: docs/helix-brain/L11-acceptance/brain-acceptance.md / sha256: b48433e20139daa2f6cd7da7bac1b35e1634fd802d68ada87a93a7d3d7b44c87 / path: docs/governance/decisions/brain-template-contract-032-po-decision-2026-10-10.md / sha256: 6f0b54a464f5031fc1b501340a9fea88544bde2bd68faabc8001c72628f82964 / path: docs/governance/decisions/requirements-entry-restart-po-decision-2026-10-12.md / sha256: 994a81b2d5eb4cbf291951b688fca85fa2b1353848091c0ab4cfac91fb8c131b / path: docs/governance/decisions/msgcontent-knowledge-po-decision-2026-10-12.md / sha256: 85fbebc322732a083e6fefb9aa5b7c7f9f24de8d894266240c7f94f472e00b5a / path: docs/governance/decisions/p3first-knowledge-po-decision-2026-10-12.md / sha256: c091ac5083a0ebffb441921ab614567cfece8d95ded91cba3de3d462f9d667a9 / path: docs/helix-brain/candidates/first-cycle-design-template-knowledge.json / sha256: 3779f7612a1555a07796bb3097f124ca4c63878bc3a42ec6fc864cb317d5d1a8 / path: docs/helix-brain/candidates/first-cycle-reference-template-knowledge.json / sha256: 321d1253e63a11c3b14b398138ee976e2960298d2007431808396171b2431caf |
| knowledge_use | MSGCONTENTの3templateの意味・制限、P3FIRSTのVT103と選択SDOP19節だけ。原candidate/schema/keyを正式化せず、SEEDFIRSTは非UIかつ技術的不確実性なしを確認した部分に限る。 |
| serialization_boundary | 本JSON keyは要件文書の記述用。製品template schema、wire format、registry、式木、algorithmを固定しない。JSON本文が意味正本でMDは同内容の生成view。 |
| legacy_comparison | reuse_class: semantic_rederivation / sources: path: archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/design-template-json-authority.md / lines: 19 / 60 / path: archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/design-template-json-authority.md / lines: 33 / 108 / path: archive/legacy-generation-2026-09-14/root/docs/governance/predecessor-harness-full-weakness-audit-2026-07-20.md / lines: 65 / 101 / preserve: 項目・identity/版・未知保持・意味/view分離・項目単位trace。UTW014の欠損空集合化とUTW021の自己申告完了を防ぐ。 / change: 旧TPL ID文法、整数版、lifecycle enum、式木、runtime、pair freezeを継承せず、採用032と限定知識の意味から再導出する。 / reason: 旧統合されなかったtemplate意味供給をBRAIN責務へ分離し、10/10のseed不使用・hash/件数のみreviewを繰り返さない。 |
| remaining | 参照するHARNESS共通L3契約のexact revisionは未承認。先行pairの閉包後に束縛し直す。 / CORE009/OS002、接続・安全・資源・計測の限定pairを別機構PRで起草する。032だけで限定前提全体の要件定義完了としない。 / 本体のschema/方式/計測値の導出、対設計とoracle凍結、実装前Red、実装/Green、L10実行、PO L11実物受入は後続段階。 |
| document_id | HELIXBRAIN-L10-032-business |
| layer | L10 |
| pair | P3: L3↔L10 |
| category | business |

## HELIXBRAIN-L10-032-B01 候補提供の価値

**requirement_ref**: HELIXBRAIN-L3-032-B01
**positive_input**: 同じ問題の複数候補とconflicts_with/alternative_toを照合する。
**expected_observation**: 候補と未決inputが別個に残る。
**negative_input**: 一つを正解として採用済みに上書きする。
**failure_observation**: 選択をBRAINの成立結果にしない。
**proof_needed**: 対象requirement/oracle revisionとscope、局所/接続の下位証明、実際の入出力と副作用観測、相違とBackflow先。実行前oracleと実観測を分ける。
**execution_state**: not_executed

## HELIXBRAIN-L10-032-B02 受領と案件義務の分離

**requirement_ref**: HELIXBRAIN-L3-032-B02
**positive_input**: 定義が完備して案件値が未決の候補をCOREへ返す流れを照合する。
**expected_observation**: 知識受領と未完義務が同時に表せる。
**negative_input**: 知識receiptだけから案件義務を消し込む。
**failure_observation**: 案件成立を認めずCORE/OSの未完を残す。
**proof_needed**: 対象requirement/oracle revisionとscope、局所/接続の下位証明、実際の入出力と副作用観測、相違とBackflow先。実行前oracleと実観測を分ける。
**execution_state**: not_executed

| execution_entry | 承認済みL3、固有義務集合、下位の実証明receipt、組合せ契約、同revision/scopeのoracleがそろってから実行する。下位receiptを左L3の起草前提にしない。参照共通契約の不足は実行停止条件。 |
| system_specific_obligation | 項目別の不足が知識供給→CORE材料返却でも保存され、知識受領と案件義務充足が別に示されること。局所の15項目存在確認や下位greenだけでは証明されない。 |
| completion | 必要caseの実観測と下位receipt/固有義務/組合せ契約の照合が揃い、未観測・未完は残る。Integrated→VerifiedはHARNESS022/056の契約へ渡し、PO Acceptedを生成しない。 |
