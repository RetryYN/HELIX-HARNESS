---
title: "HIL-BR-02の製品scopeに関するPO decision record"
decision_record_id: HDEC-HIL-BR-02-PRODUCT-SCOPE-2026-09-23
decision_status: recorded
decided_at: 2026-09-23
recorded_at: 2026-09-23
source_repository_revision: 5cf43693bd94fe17ce8b340426e847ea53814a06
authority_effect: product_scope_only_when_admitted_to_main
---

# HIL-BR-02の製品scope判断

## POの判断

POには次の質問を示し、対象は製品scopeであって要求採用・実装承認ではないと明示した。

> 旧要求HIL-BR-02（CodexのPRを検出して監査jobを冪等生成し、全base/stacked PRを対象にする）は、HELIX-OSの単体要求として分類し、他3要求と結ぶHR-FR-HIL-03はHARNESS↔OSの接続候補として別に保持してよいですか？これは製品scopeの判断で、要求採用・実装承認ではありません。

POは次の選択肢を選んだ。

> はい。BR-02はOS単体、接続は別（推奨）

「（推奨）」は提示した選択肢のラベルである。この判断により、`HIL-BR-02`の原文全体をHELIX-OSの`product_unit`として分類する。`HR-FR-HIL-03`が束ねる4要求間の受渡しとend-to-end受入は、HARNESS／OSの接続候補として単体unitから分離して保持する。接続要求の本文・successor・採否はまだ確定しない。

## 固定した判断対象

判断時のmainは`5cf43693bd94fe17ce8b340426e847ea53814a06`。原要求`HIL-BR-02` revision 1の原文は次のとおりで、semantic digestは`sha256:7fa42e4ad34404d9b69757fe10fb50b5bfb9766c10dcd297b3eb9ac1a0b608ad`である。

> Claude Code拡張hookはCodexのPR作成/更新/完了を検出し、監査jobを冪等生成する。全base branchのPRを対象とし、stacked PRを除外しない。

| 出典 | 判断時のSHA-256 | 判断への用途 |
|---|---|---|
| [`requirements.json`](../requirements-source/requirements-ir/requirements.json) | `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | 原文、revision、`HR-FR-HIL-03`への直接relation |
| [`system_contracts.json`](../requirements-source/requirements-ir/system_contracts.json) | `2a7df673138568526e714342679ce2982238966b42f2d1967b2da92e9dbf02ab` | `HIL-BR-02`、`HIL-BR-17`、`HIL-FR-09`、`HIL-FR-30`を束ねる契約 |
| [四製品routing候補](../legacy-ir-product-routing-bootstrap.jsonl) | `c35934693b273e6cfd03e509886dc22bd1367e78ae1aa4568563a7da252c41e1` | BR-02はOS単体、ほか3件はHARNESS／OS分割候補 |
| [製品責務境界](../../concept/product-boundary.md) | `097f27311060c56e387cf49fe6ec75731e5fd9dc04ac1a4be987d285e02ee038` | OSは実行・管理・統制、HARNESSは工程・契約 |

## 判断の限界と次の接続

BR-02の`primary_system_contract_id`は`HR-FR-HIL-03`で、下流pairは`pending_pair_descent`である。旧contractは監査job生成のほか、finding分類・writer返却・successor昇格まで含む。BR-02のOS単体分類から、contract全体をOS単体に配置したり、接続が成立したとみなしたりしない。ほか3要求のHARNESS／OS分割は候補のままで、個別判断を要する。

生存中14 source holdingの存在とrevisionは[管理register](../management-provisional-requirement-register.jsonl)（SHA-256 `b68f3acae41fcd7796bf323e8eb3036aa13970c3af8608e13c5aaa1b237258dd`）で保持する。今回の入口screenではIR・semantic line・補助sourceを直接関係候補とし、`CONFIRMED-003`、`CANDIDATE-003`、`WORKFLOW-003`、`PREISOLATION-002`、`DELEGATED-DOC-003`、`DELEGATED-REF-001`、`LEGACY-RULE-004`の7 holdingはBR-02関連性を未確認として残した。未確認という一般状態だけから、この限定した製品scope判断を無期限に止めない。判断を変える具体的な原文・relationが後で見つかった場合は、対象revisionを固定して再判断する。全holdingのatom化・無損失処理はRDP全体の完了条件である。

このrecordは要求の採用、意味変更、縮退、retire、successor割当、L2／L11適用、工程確定、実装成立を生成しない。bootstrapの`PHCAP-10`／`PHCAP-12`は候補のままである。旧hook等の再利用適性は、要求scopeに合う資産をL3要件定義で選んだ後、既存の旧資産再利用統制に従って判断する。旧資産4,020件の一括調査や実行をこの判断の前提にしない。
