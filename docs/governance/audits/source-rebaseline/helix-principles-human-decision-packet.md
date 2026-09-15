# HELIX原理原則 人間判断packet

prepared_at: 2026-09-16
status: awaiting_human_decision
decision_id: HDEC-HELIX-PRINCIPLES-0.1
authority_effect_before_decision: none

## 判断対象

| 対象 | SHA-256 | 状態 |
|---|---|---|
| `docs/concept/helix-principles.md` | `79565501a0cb3b55394a5ad306970d327ea895a76111e53f6bfe67ec08d67034` | `draft_candidate`、人間判断待ち |

SHA-256は上記pathのUTF-8 file bytes全体に対して算出する。内容が変わった場合、この判断対象は失効し、新しいdigestへ
固定し直す。PR、Issue、review、CI、DB、会話の状態はこの判断を成立させない。

## 何を判断するか

既存Concept、製品責務境界、上流統制方針、authority状態モデルから抽出した12原則を、Conceptより下位、対象別L1より
上位の共通判断基準として採用してよいかを判断する。

確認する要点は次のとおりである。

1. 人が意味、製品境界、所定の上流承認、不可逆作用の許可を所有する。
2. localの対象別sourceと承認revisionを意味正本とし、GitHub等をprojectionに限定する。
3. HARNESSの開発契約、HELIX-OSの管理・推進・改善、個別製品の利用価値を分離する。
4. HARNESSが工程の意味と順序を持ち、HELIX-OSの推進がticket graphとworkflow instanceへ具体化する。
5. Conceptから正規V-pairへ上流順に導出する。
6. 旧要求を無損失で保持し、人間decision前に削除、統合、意味変更、retireを確定しない。
7. authority、carry-forward、仮登録、作業projection、実装・検証・受入・運用の状態を混ぜない。
8. Worker実行をrevision、assignment、権限、資源、path、期限へ束縛する。
9. 完了をexact revisionと反証可能な証拠joinで判断する。
10. unknown、矛盾、欠測を保持して停止する。
11. 観測と学習を改善候補へ戻し、authorityを直接変更しない。
12. 旧資産の再利用と提供構成を適格性に基づいて判断する。

## 選択肢

| 判断 | 結果 |
|---|---|
| `approve` | 上記exact file revisionを共通判断基準として承認する。個別要求や下位文書は別判断のまま |
| `changes_requested` | 原要求と既存Conceptを保持したまま、指定された原則を修正して新しいdigestへ再固定する |
| `reject` | 本候補をauthorityへ昇格しない。既存Concept、要求、台帳の状態は変更しない |

平易な返答では「この原則で進める」、または異なる原則と修正内容の指定で足りる。記録時にactor、decision、target path、
SHA-256、時点、維持する条件を`HDEC-HELIX-PRINCIPLES-0.1`へ束縛する。

## この判断で成立しないもの

- 個別要求の追加、採否、分割、統合、意味変更、retire。
- Concept、対象別L1、L2／L11、L3／L10の承認。
- 要求エンジン、Design Template、DB、adapter、CI、runtime、workflowの設計・実装。
- repository foundation PR #1797のmerge admission。
- HELIX-HARNESS Version 1完成、HELIX-Web展開、release、deployment。

## 導出元の固定値

| source | SHA-256 |
|---|---|
| `docs/concept/helix-concept-v4.1.md` | `56118722c190dddfdf5436cb2c15f8b5773431d18638e0870f8dd03ec68c210e` |
| `docs/concept/product-boundary.md` | `097f27311060c56e387cf49fe6ec75731e5fd9dc04ac1a4be987d285e02ee038` |
| `docs/governance/upstream-rebaseline-and-asset-governance-policy-2026-09-14.md` | `3b5f4140787ede35ebbaae650082f5872ee0cb48e0e25f17bdb87f35f8dfa2cb` |
| `docs/governance/authority-state-model.md` | `4c381a0811d70a702e380e9fbcb52010d48807d8e7927ab68549d2d80e47a38a` |

導出元に未承認候補が含まれるため、本原則の承認だけで親Conceptや製品責務境界を承認済みにしない。親sourceが変更された
場合は影響を確認し、本候補を必要に応じて`stale`へ戻す。
