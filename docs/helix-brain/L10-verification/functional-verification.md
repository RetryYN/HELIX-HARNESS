# HELIXBRAIN-L10-032-functional

生成view。意味正本: `functional-verification.json`。本文JSON SHA-256: `26ca12b6fa27b27ad80b79e6051a8616e4f3ef203de15589306415762ff94954`。直接編集せずJSONから再生成する。

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
| document_id | HELIXBRAIN-L10-032-functional |
| layer | L10 |
| pair | P3: L3↔L10 |
| category | functional |
| execution_entry | 承認済みL3、固有義務集合、下位の実証明receipt、組合せ契約、同revision/scopeのoracleがそろってから実行する。下位receiptを左L3の起草前提にしない。参照共通契約の不足は実行停止条件。 |
| system_specific_obligation | 項目別の不足が知識供給→CORE材料返却でも保存され、知識受領と案件義務充足が別に示されること。局所の15項目存在確認や下位greenだけでは証明されない。 |
| completion | 必要caseの実観測と下位receipt/固有義務/組合せ契約の照合が揃い、未観測・未完は残る。Integrated→VerifiedはHARNESS022/056の契約へ渡し、PO Acceptedを生成しない。 |

## HELIXBRAIN-L10-032-F01 15項目の独立識別

**requirement_ref**: HELIXBRAIN-L3-032-F01
**positive_input**: 15項目を持つMSG004/001/005の限定採用内容をそれぞれ与える。各項目の根拠と原適用制限を照合する。
**expected_observation**: 全項目が個別に参照でき、単体・接続・構成体の内容差を保持する。返却は候補であり採用判断を伴わない。
**negative_input**: 同じ表示labelに異なる意味を入れる、またはrelationの端と向きを落とす。
**failure_observation**: 不一致項目・元revisionを示し、同じ意味の契約として返さない。
**proof_needed**: 対象requirement/oracle revisionとscope、局所/接続の下位証明、実際の入出力と副作用観測、相違とBackflow先。実行前oracleと実観測を分ける。
**execution_state**: not_executed

## HELIXBRAIN-L10-032-F02 定義欠落と矛盾の返却

**requirement_ref**: HELIXBRAIN-L3-032-F02
**positive_input**: F01の成立材料から15項目を一つずつ除去し、別に未定義と矛盾を各項目へ入れる。
**expected_observation**: 正常材料だけが完全な定義として識別される。欠落・未定義・矛盾の種類と対象項目が区別される。
**negative_input**: required section/fieldを別Patternのrequired inputで代替する。
**failure_observation**: 元項目の不足が残り、完全性が成立しない。
**proof_needed**: 対象requirement/oracle revisionとscope、局所/接続の下位証明、実際の入出力と副作用観測、相違とBackflow先。実行前oracleと実観測を分ける。
**execution_state**: not_executed

## HELIXBRAIN-L10-032-F03 案件値未決と非適用

**requirement_ref**: HELIXBRAIN-L3-032-F03
**positive_input**: 同じ定義について、案件値供給済み、案件値のみ未供給、根拠付き非適用、適用条件unknownを比較する。
**expected_observation**: 案件値のみ未供給の材料は知識受領可能性と未完設計義務を別に表せる。非適用の根拠を保持する。
**negative_input**: unknownをN/Aへ変換する、または定義欠落を案件値未決へ変える。
**failure_observation**: 変更を成立させず、元の不足種類・理由・返却先を保持する。
**proof_needed**: 対象requirement/oracle revisionとscope、局所/接続の下位証明、実際の入出力と副作用観測、相違とBackflow先。実行前oracleと実観測を分ける。
**execution_state**: not_executed

## HELIXBRAIN-L10-032-F04 identity・版・出所

**requirement_ref**: HELIXBRAIN-L3-032-F04
**positive_input**: 同じfilenameの異なるidentity、同identityの異なる版、pack版のみ異なる候補を与える。
**expected_observation**: 各相違を正しい識別軸で返す。version_target=1.0を実版として扱わない。
**negative_input**: 別revisionのoracle、source無し、宣言互換範囲外を混入する。
**failure_observation**: 当該参照を未評価または不適用として返し、別候補の成功で相殺しない。
**proof_needed**: 対象requirement/oracle revisionとscope、局所/接続の下位証明、実際の入出力と副作用観測、相違とBackflow先。実行前oracleと実観測を分ける。
**execution_state**: not_executed

## HELIXBRAIN-L10-032-F05 JSON意味とview

**requirement_ref**: HELIXBRAIN-L3-032-F05
**positive_input**: 同じJSONから得たviewと、JSONを保持して表示だけ変えたviewを比較する。
**expected_observation**: 意味内容と知識stateがJSONに結ばれ、表示変更を意味更新にしない。
**negative_input**: viewだけでmeasurement/completion欠落を補う。
**failure_observation**: JSONの当該不足を保持し、生成成功を完全性の証拠にしない。
**proof_needed**: 対象requirement/oracle revisionとscope、局所/接続の下位証明、実際の入出力と副作用観測、相違とBackflow先。実行前oracleと実観測を分ける。
**execution_state**: not_executed

## HELIXBRAIN-L10-032-F06 計測と成立条件の束縛

**requirement_ref**: HELIXBRAIN-L3-032-F06
**positive_input**: 義務とoracleへの参照を持つ定義、および計測値だけ未定の同じ定義を与える。
**expected_observation**: 定義の関係は辿れ、案件値未決は未完のままCOREへ渡る。
**negative_input**: 義務と無関係な計測、別revisionのoracle、文書生成成功だけのcompletionを入れる。
**failure_observation**: 該当定義の不足または矛盾を示し、project義務成立を返さない。
**proof_needed**: 対象requirement/oracle revisionとscope、局所/接続の下位証明、実際の入出力と副作用観測、相違とBackflow先。実行前oracleと実観測を分ける。
**execution_state**: not_executed

## HELIXBRAIN-L10-032-F07 製品固有意味の分離

**requirement_ref**: HELIXBRAIN-L3-032-F07
**positive_input**: 汎用項目に製品固有値を添えた材料と未見domain/actorの材料を与える。
**expected_observation**: 汎用定義と製品値の所属を識別し、製品値・不足判断をCOREへ返す。
**negative_input**: BRAIN出力にtemplate選択、要求合意、設計完成、project義務消込を加える。
**failure_observation**: 当該裁定を契約の成立結果にせず、責務違反を示す。
**proof_needed**: 対象requirement/oracle revisionとscope、局所/接続の下位証明、実際の入出力と副作用観測、相違とBackflow先。実行前oracleと実観測を分ける。
**execution_state**: not_executed

## HELIXBRAIN-L10-032-F08 知識stateとpromotion

**requirement_ref**: HELIXBRAIN-L3-032-F08
**positive_input**: 限定内容採用済みで運用promotion未実施のMSG/VT103材料を与える。
**expected_observation**: 内容採否と運用stateが別に辿れ、未実施工程は未実施と返る。
**negative_input**: AI生成のみ、評価scope無し、独立検証無しの材料を採用済みにする。
**failure_observation**: promotionを成立させず不足工程を返す。032の返却が他工程の承認を代行しない。
**proof_needed**: 対象requirement/oracle revisionとscope、局所/接続の下位証明、実際の入出力と副作用観測、相違とBackflow先。実行前oracleと実観測を分ける。
**execution_state**: not_executed

## HELIXBRAIN-L10-032-F09 条件別依存と返却

**requirement_ref**: HELIXBRAIN-L3-032-F09
**positive_input**: 常時入力だけの局所候補、COREへ返す候補、CORE由来またはLABO評価を選んだ候補を分ける。
**expected_observation**: 選択条件で必要になる不足だけを返し、未選択source成功を主張しない。
**negative_input**: receiver未受領を知識定義欠落へ変える、または選択sourceの欠落を別sourceで補う。
**failure_observation**: 定義欠落と接続未成立を分離し、知識owner/CORE/OSへ原因別に返す。
**proof_needed**: 対象requirement/oracle revisionとscope、局所/接続の下位証明、実際の入出力と副作用観測、相違とBackflow先。実行前oracleと実観測を分ける。
**execution_state**: not_executed
