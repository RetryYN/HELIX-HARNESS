# HELIXエージェント七大原則 人間判断packet

prepared_at: 2026-09-16
status: candidate_authority_decision_pending
decision_id: HDEC-HELIX-AGENT-PRINCIPLES-0.1
authority_effect_before_decision: none

## 判断対象

| 対象 | SHA-256 | 状態 |
|---|---|---|
| `docs/concept/helix-principles.md` | `41d8fbe759bf24a7245df0597ddaa9c8eb6c4c0184b124ecd5d349e6c19a2dbb` | `draft_candidate`。候補の物理統合に人間承認は不要。authority昇格を判断するときだけcurrent revision reviewを確認する |

SHA-256は上記pathのUTF-8 file bytes全体に対して算出する。内容が変わった場合、この判断対象は失効し、新しいdigestへ
固定し直す。PR、Issue、review、CI、DB、会話の状態はこの判断を成立させない。

## 何を判断するか

POが提示した次の七大原則を、HELIXで企画、要求整理、設計、実装、検証、運用改善を担うエージェントの共通行動基準として
採用してよいかを判断する。

1. リサーチ＆検証ファースト
2. 原子PR原則/非依存並列化
3. DDD設計/TDD開発
4. 下流トラブルは上流還流※トラブルの原因は要件定義や設計を疑え
5. ミニマム実装/適時リファクタリング
6. 責務/依存分離で変更耐性を最適化
7. 確かな証拠と計測改善で品質を守れ

判断対象本文は、上記7項目を行動へ適用できる粒度に説明し、HARNESS route内での適用方法と迷った場合の戻り先を示す。
同本文の「PO提示原文」節が2026-09-16の指示を表記変更せず保持する。HELIX全体の製品identity、
責務境界、authority、V-model、system invariantはConcept側に残し、本判断へ含めない。

## review状態と未解決事項

| 項目 | 現在値 |
|---|---|
| completed body review HEAD | `71c4abc98d630810787195eb8e0df1c7a4f2bc4e` |
| review receipt | [GitHub Claude review](https://github.com/RetryYN/HELIX-HARNESS/pull/1826#issuecomment-5686320968) |
| result | Blocker 0／Major 0／Minor 0 |
| state | 判断対象本文は上記review後に不変。候補統合時はPR current HEADの外部reviewを確認し、将来のauthority判断時はその時点の本文revisionとreviewを改めてread-afterする |

内容上の未解決review findingはない。repository foundation PR #1797と5大目標PR #1827の物理統合は完了した。
本PRの候補統合はauthorityを生成しないため、人間承認をmerge条件にしない。将来、本候補を共通行動基準へ昇格するときは
exact本文revisionを人間が採否し、承認後も個別要求と下位文書を別判断に保つ。

authority判断時は、本文file SHA-256、review対象revision／digest、最新findingをread-afterする。本文digestに未reviewの変更が
ある、または未解消Blocker／Majorがある場合は昇格判断を停止する。Minorは内容と処置を示し、人間が残存を認識できる状態にする。
この条件を候補PRのmerge gateとして使わない。

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
| `docs/concept/helix-concept-v4.1.md` | `181b0c555f4e27f83a1f92d315aee0e66a9f3f645e3cebe0a1b8d487878efaad` | 七大原則を9構造原則と分離した行動規律として接続する改訂候補。Evidence Closure、Responsibility First、Controlled Adaptation、上流還流 |
| `docs/concept/product-boundary.md` | `097f27311060c56e387cf49fe6ec75731e5fd9dc04ac1a4be987d285e02ee038` | HARNESS／HELIX-OS／個別製品の責務分離 |
| `docs/governance/upstream-rebaseline-and-asset-governance-policy-2026-09-14.md` | `3b5f4140787ede35ebbaae650082f5872ee0cb48e0e25f17bdb87f35f8dfa2cb` | researchから要求・検証へ降ろす順序、stale化、証拠、改善候補 |

既存上流に未承認候補が含まれるため、七大原則の承認だけで親Conceptや製品責務境界を承認済みにしない。親sourceが変更された
場合は影響を確認し、本候補を必要に応じて`stale`へ戻す。Concept v4.1の今回改訂は七大原則本文を変更せず、HARNESS routeを
置き換えない行動規律として接続する。current pairの外部reviewで無矛盾を確認するまでauthority判断へ進めないが、候補mergeは止めない。

## 5大目標候補との関係と統合順

別PR #1827の5大目標はHELIXの到達方向・価値、本書の七大原則はエージェントの行動基準である。いずれもConceptに
従属し、一方の承認またはmergeが他方の承認、Concept改訂、要求追加を生成しない。物理統合順はrepository foundation
PR #1797、5大目標PR #1827、#1827上へ載せ直した七大原則PR #1826とする。最終読込順はConcept／製品責務境界→
5大目標→七大原則→対象別L1へ揃える。
