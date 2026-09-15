---
title: "HARNESS設計template system要求候補"
status: draft_candidate
authority_status: awaiting_human_approval
created: 2026-09-15
updated: 2026-09-15
product_owner: HELIX-HARNESS
operational_owner: HELIX-OS
derived_from:
  - docs/governance/candidates/requirement-engine-python-core-requirements.md
  - archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/requirement-discovery-json-authority.md
  - archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/design-template-json-authority.md
---

# HARNESS設計template system要求候補

## 目的とauthority順序

初期開発で参照できる設計知識がなく、AIごとに設計論点と成果物が変わる状態を防ぐ。HARNESSは要求kind、対象責務、
system構成、risk、domainに応じたversioned Design Templateと設計義務を提供する。HELIX-OSはtemplateの登録、選定、適用、
利用結果、改善候補を管理し、HELIX自身と複数productの経験からtemplateを継続改善する。

要求の意味authorityはConcept、企画、利用者指示、人間合意にある。Design Templateは要求を設計都合で生成しない。
Forwardでは要求から必要な設計義務を導き、Backflowでは設計に必要な入力の欠落を質問・要求候補として上流へ戻す。
Backflow候補も要求エンジンと人間の採否を経る。

## HARNESS要求候補

| ID | 要求 | 確認する結果 |
|---|---|---|
| DST-HARNESS-001 | requirement kind、subject、relation、risk、domain、layer／pairに応じて適用可能なDesign Template exact setを選べる | AI、言語、projectが変わっても必要な設計論点が恣意的に増減しない |
| DST-HARNESS-002 | templateはID、version、applicability、必須input／section／field、relation、owner、negative oracle、measurement、completion、supersessionを持つ | 文書の見た目やfilenameではなく意味契約と版を比較できる |
| DST-HARNESS-003 | unit、connection、compositeごとに異なる設計義務を生成し、各要求identityから義務、設計成果、対検証へ辿る | unit templateだけで接続・system全体の設計を満たしたと判定しない |
| DST-HARNESS-004 | templateの必須inputが要求に無い場合、missing design inputを質問、矛盾、derived requirement candidate、N/A判断候補として要求エンジンへbackflowする | 欠落をAIが補完せず、設計を進めるために必要な意味判断を上流へ戻せる |
| DST-HARNESS-005 | 初期利用のため、出典・採否・適用範囲・限界・negative caseを持つ最小seed template packを提供する | templateが無いことを理由に自由形式で設計せず、seedを普遍的正解とも扱わない |
| DST-HARNESS-006 | template適用をrequired／conditional／N/A／unresolvedで判定し、理由、判断者、対象revision、再評価条件を持つ | 全template強制と根拠なしskipの両方を防ぐ |
| DST-HARNESS-007 | template更新時に要求、設計義務、成果物、検証へのsemantic impactを出し、旧版利用をstaleとして識別する | filename置換やschema digest更新だけで移行完了にしない |

## HELIX-OS要求候補

| ID | 要求 | 確認する結果 |
|---|---|---|
| DST-OS-001 | 承認済みtemplate、seed、候補、retired版をregistryで区別し、対象projectが使用したexact setと版を管理する | archive template、未承認候補、別product版をcurrentとして選ばない |
| DST-OS-002 | 要求分類とHARNESS applicability contractからtemplate選定候補を作り、人間判断が必要なunknown／conflictを保持する | OSが要求意味やtemplate適用規則を独自に追加しない |
| DST-OS-003 | template適用、設計義務の生成・消込、N/A、backflow、成果、finding、再作業、受入、運用結果を同じ因果関係で管理する | 文書生成やcheckboxだけで設計義務を完了にしない |
| DST-OS-004 | 複数projectの利用結果から不足、過剰要求、誤選定、再作業、欠陥流出をtemplate改善候補へ戻す | 利用回数やAI自己評価だけでtemplateを昇格・変更しない |
| DST-OS-005 | templateが未登録、非適用、stale、conflict、必要input欠落の場合に停止またはbackflowし、任意templateへfallbackしない | 初期参照不足を自由設計で隠さず、理由と解消先を確認できる |

## seed templateの作り方

初期seedは空白から一人のAIが作らない。archive内のtemplate、実プロダクトの設計成果、失敗事例、一般的な設計領域を
source inventoryへ入れ、意味atomごとに採択する。最小seedは少なくとも次を別templateまたは明示sectionとして扱う。

- unit behavior、state、input／output、failure、recovery。
- connection contract、direction、data meaning、ordering、timeout、retry、idempotency、partial failure。
- composite architecture、boundary、dependency、end-to-end flow、capacity、security、observability、operation。
- data、permission、privacy、external interface、migration、rollback、testability。

templateの存在は要求充足、設計完成、検証成功を証明しない。旧Design Template JSON、旧#290、旧test、旧CIの成功は
behavior sourceであり、新世代seedの承認や完成証拠にしない。
[意味密度による抽出方針](semantic-density-python-extraction-policy.md)に従い、applicability、設計義務、required input不足、
backflow、semantic impactはPython core候補、registry commit・版適用・外部作用はtransactional boundary候補として分離し、
後者の実装技術は新世代architectureからL3以降で選定する。
