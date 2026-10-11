# HELIXBRAIN-L3-032-functional

生成view。意味正本: `functional-requirements.json`。本文JSON SHA-256: `770228821c8aee584f9b0419939525eabef42cc9dfebca3e5f1d6ff7e6d5917b`。直接編集せずJSONから再生成する。

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
| document_id | HELIXBRAIN-L3-032-functional |
| layer | L3 |
| pair | P3: L3↔L10 |
| category | functional |
| descriptor_meanings | descriptor: template identity / meaning: 機能としてのtemplate識別。filenameやviewの所在と分ける。 / descriptor: version / meaning: template内容の版。knowledge revision、pack contract/artifact版、version_targetと分ける。 / descriptor: layer/pair / meaning: 義務の適用層と対。HARNESSが定めた対を参照する。 / descriptor: applicability / meaning: 汎用問題・前提と適用条件。unknownを非適用にしない。 / descriptor: required input / meaning: 適用に必要な入力の意味と根拠。定義と案件値を分ける。 / descriptor: required section / meaning: 満たす必要のある節の意味と原適用条件。 / descriptor: required field / meaning: 節に属する欄の意味・要否の条件。節のN/Aを全欄へ一律転写しない。 / descriptor: relation / meaning: 関係の種類・向き・両端identity/revision。名称類似を意味関係にしない。 / descriptor: 意味owner / meaning: 項目の意味を持つ責任者。製品判断や実運転のownerと分ける。 / descriptor: trace / meaning: source/provenance、項目根拠と知識revisionへの参照。 / descriptor: negative oracle / meaning: 契約が不成立になる条件と検証で観測する差異。 / descriptor: measurement / meaning: 適用義務の計測観点・根拠とoracleの関係。実値を創作しない。 / descriptor: completion / meaning: 適用義務の成立条件と対oracleの関係。project成立の裁定ではない。 / descriptor: downstream kind / meaning: 義務を渡す対象の種類。単体・接続・構成体の違いを残す。 / descriptor: supersession / meaning: 旧知識から新知識への明示関係。過去参照を黙って差し替えない。 |

## HELIXBRAIN-L3-032-F01 15項目の独立識別

**parent**: HELIXBRAIN-L2-032
**obligation**: 同じtemplate identity/version・knowledge revision・sourceに結ぶ15項目をそれぞれ識別・比較できるJSON意味契約候補として返す。各項目の意味はdescriptor_meaningsに従う。
**oracle_ref**: HELIXBRAIN-L10-032-F01
**failure_return**: 汎用定義/知識版はBRAIN。製品値/適用はCORE。project記録はOS。意味が変わる左層へBackflow。

## HELIXBRAIN-L3-032-F02 定義欠落と矛盾の返却

**parent**: HELIXBRAIN-L2-032
**obligation**: 項目欠落・未定義・同一revision内の意味矛盾は、項目identity、source/revision、理由、knowledge ownerへの戻し先を返す。完全な契約としない。他Patternやview生成の成功で補わない。
**oracle_ref**: HELIXBRAIN-L10-032-F02
**failure_return**: 汎用定義/知識版はBRAIN。製品値/適用はCORE。project記録はOS。意味が変わる左層へBackflow。

## HELIXBRAIN-L3-032-F03 案件値未決と非適用

**parent**: HELIXBRAIN-L2-032
**obligation**: 定義済みfieldの案件値がunknownならfield identity・未決理由・元knowledge版を保持してCOREへ未充足材料として返す。根拠付き非適用、定義欠落、適用条件unknownを別に示す。
**oracle_ref**: HELIXBRAIN-L10-032-F03
**failure_return**: 汎用定義/知識版はBRAIN。製品値/適用はCORE。project記録はOS。意味が変わる左層へBackflow。

## HELIXBRAIN-L3-032-F04 identity・版・出所

**parent**: HELIXBRAIN-L2-032
**obligation**: template identity/version、knowledge identity/revision/state、pack identity/contract/artifact/dependency版を別々に照合する。source/版/scopeがmissingなら未評価。互換性がunknown/mismatchなら利用を許さず、latestや同名filenameへfallbackしない。
**oracle_ref**: HELIXBRAIN-L10-032-F04
**failure_return**: 汎用定義/知識版はBRAIN。製品値/適用はCORE。project記録はOS。意味が変わる左層へBackflow。

## HELIXBRAIN-L3-032-F05 JSON意味とview

**parent**: HELIXBRAIN-L2-032
**obligation**: JSON意味契約と生成Markdown/HTML等のview・説明を区別する。表示だけの変更で意味identity・版・知識stateを更新しない。説明をrequired項目の定義代替にしない。
**oracle_ref**: HELIXBRAIN-L10-032-F05
**failure_return**: 汎用定義/知識版はBRAIN。製品値/適用はCORE。project記録はOS。意味が変わる左層へBackflow。

## HELIXBRAIN-L3-032-F06 計測と成立条件の束縛

**parent**: HELIXBRAIN-L2-032
**obligation**: measurementとcompletionは、どの適用義務を、どの観点・根拠・対oracleで確認するかを識別可能にする。値unknownと定義unknownを分け、具体的閾値・製品値はBRAINが新設しない。
**oracle_ref**: HELIXBRAIN-L10-032-F06
**failure_return**: 汎用定義/知識版はBRAIN。製品値/適用はCORE。project記録はOS。意味が変わる左層へBackflow。

## HELIXBRAIN-L3-032-F07 製品固有意味の分離

**parent**: HELIXBRAIN-L2-032
**obligation**: screen/API/permission/stateなどの製品固有値、採用結果、単一成功事例を汎用契約へ混入しない。未提示のdomain/actorでも同じ分離条件で扱い、COREの選択・OSの記録・LABOの評価をBRAINが決めない。
**oracle_ref**: HELIXBRAIN-L10-032-F07
**failure_return**: 汎用定義/知識版はBRAIN。製品値/適用はCORE。project記録はOS。意味が変わる左層へBackflow。

## HELIXBRAIN-L3-032-F08 知識stateとpromotion

**parent**: HELIXBRAIN-L2-032
**obligation**: source、provenance、評価範囲、限界、反例、採用状態を既存知識記録へ結ぶ。候補生成・限定内容採用・LABO評価・OS受領の単独成功でaccepted/matureへ昇格しない。BRAIN007/025の既存工程を保持する。
**oracle_ref**: HELIXBRAIN-L10-032-F08
**failure_return**: 汎用定義/知識版はBRAIN。製品値/適用はCORE。project記録はOS。意味が変わる左層へBackflow。

## HELIXBRAIN-L3-032-F09 条件別依存と返却

**parent**: HELIXBRAIN-L2-032
**obligation**: 常時の003/005/007/008/028を参照する。CORE返却時は019/022/030、CORE由来またはLABO評価を選んだ入力は018/020/025の該当source/scope/evaluationを参照する。未選択sourceは未観測。受渡し先の完了receiptを候補提供前の入力にしない。
**oracle_ref**: HELIXBRAIN-L10-032-F09
**failure_return**: 汎用定義/知識版はBRAIN。製品値/適用はCORE。project記録はOS。意味が変わる左層へBackflow。
