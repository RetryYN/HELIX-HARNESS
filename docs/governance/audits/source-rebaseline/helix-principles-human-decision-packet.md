# HELIXエージェント七大原則 人間判断packet

prepared_at: 2026-09-16
status: awaiting_human_decision
decision_id: HDEC-HELIX-AGENT-PRINCIPLES-0.1
authority_effect_before_decision: none

## 判断対象

| 対象 | SHA-256 | 状態 |
|---|---|---|
| `docs/concept/helix-principles.md` | `92e809433bc4e7c9d88c17ba8caaa8d24dc5b8ec32650a0360410640300bdcc2` | `draft_candidate`、人間判断待ち |

SHA-256は上記pathのUTF-8 file bytes全体に対して算出する。内容が変わった場合、この判断対象は失効し、新しいdigestへ
固定し直す。PR、Issue、review、CI、DB、会話の状態はこの判断を成立させない。

## 何を判断するか

POが提示した次の七大原則を、HELIXで企画、要求整理、設計、実装、検証、運用改善を担うエージェントの共通行動基準として
採用してよいかを判断する。

1. リサーチ＆検証ファースト
2. 原子PR原則／非依存並列化
3. DDD設計／TDD開発
4. 下流トラブルは上流還流。トラブル時は要件定義や設計を疑う
5. ミニマム実装／適時リファクタリング
6. 責務／依存分離で変更耐性を最適化
7. 確かな証拠と計測改善で品質を守る

判断対象本文は、上記7項目を行動へ適用できる粒度に説明し、適用順序と迷った場合の戻り先を示す。HELIX全体の製品identity、
責務境界、authority、V-model、system invariantはConcept側に残し、本判断へ含めない。

## 選択肢

| 判断 | 結果 |
|---|---|
| `approve` | 上記exact file revisionをHELIXエージェントの共通行動基準として承認する。個別要求や下位文書は別判断のまま |
| `changes_requested` | 既存Conceptと要求を保持したまま、指定された原則または説明を修正して新しいdigestへ再固定する |
| `reject` | 本候補をauthorityへ昇格しない。既存Concept、要求、台帳の状態は変更しない |

平易な返答では「この七原則で進める」、または異なる原則と修正内容の指定で足りる。記録時にactor、decision、target path、
SHA-256、時点、維持する条件を`HDEC-HELIX-AGENT-PRINCIPLES-0.1`へ束縛する。

## この判断で成立しないもの

- 個別要求の追加、採否、分割、統合、意味変更、retire。
- Concept、対象別L1、L2／L11、L3／L10の承認。
- DDD、TDD、research、計測で使う具体的なtool、framework、schema、数値基準。
- 要求エンジン、Design Template、DB、adapter、CI、runtime、workflowの設計・実装。
- repository foundation PR #1797のmerge admission。
- HELIX-HARNESS Version 1完成、HELIX-Web展開、release、deployment。

## 既存上流との接続

| source | SHA-256 | 接続する範囲 |
|---|---|---|
| `docs/concept/helix-concept-v4.1.md` | `56118722c190dddfdf5436cb2c15f8b5773431d18638e0870f8dd03ec68c210e` | Evidence Closure、Responsibility First、Controlled Adaptation、上流還流 |
| `docs/concept/product-boundary.md` | `097f27311060c56e387cf49fe6ec75731e5fd9dc04ac1a4be987d285e02ee038` | HARNESS／HELIX-OS／個別製品の責務分離 |
| `docs/governance/upstream-rebaseline-and-asset-governance-policy-2026-09-14.md` | `3b5f4140787ede35ebbaae650082f5872ee0cb48e0e25f17bdb87f35f8dfa2cb` | researchから要求・検証へ降ろす順序、stale化、証拠、改善候補 |

既存上流に未承認候補が含まれるため、七大原則の承認だけで親Conceptや製品責務境界を承認済みにしない。親sourceが変更された
場合は影響を確認し、本候補を必要に応じて`stale`へ戻す。
