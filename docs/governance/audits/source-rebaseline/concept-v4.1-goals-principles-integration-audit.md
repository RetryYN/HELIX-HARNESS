# Concept v4.1・5大目標・七大原則 接続監査

確認日: 2026-09-17

## 目的

HELIX自体の5大目標とHELIXエージェントの七大原則を、要求や実装へ直結させず、Concept v4.1候補の
製品責務、authority、構造原則、上流順序へ接続できているかを確認する。本監査は候補文書の物理統合を対象とし、
Concept、目標、原則、L1、L2／L11のauthority昇格を行わない。

## 対象revision

| 対象 | SHA-256 | 役割 |
|---|---|---|
| `docs/concept/helix-concept-v4.1.md` | `007ef9b54c85faa3cc4e8195fcf02c3e78de82bce679799d7b2fd11028fbd6b7` | 製品identity、責務境界、authority、9構造原則、system invariant、上流順序 |
| `docs/concept/helix-five-goals.md` | `cfade733b9023bcc3329916206a911794e13f2b4f4f1e198d6c57618049771ca` | HELIX全体の5到達目標 |
| `docs/concept/helix-principles.md` | `41d8fbe759bf24a7245df0597ddaa9c8eb6c4c0184b124ecd5d349e6c19a2dbb` | エージェントの7行動原則 |
| `docs/concept/product-boundary.md` | `097f27311060c56e387cf49fe6ec75731e5fd9dc04ac1a4be987d285e02ee038` | HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OSの責務境界 |

## 5大目標の接続

| 目標 | Concept上の接続先 | 直接生成しないもの |
|---|---|---|
| システム駆動エージェント自走 | Human Sovereignty、Contract Compilation、Bounded Multi-AI Execution、Durable and Replayable、Evidence Closure | authority、要求、許可、完了 |
| 開発するほど賢くなる自己知能型改善 | HELIX-OS Concept、Controlled Adaptation、HARNESS自己適用・改善 | 要求変更、自己承認、無条件な学習反映 |
| 設計から全体をシミュレーションする予測 | Responsibility First、relation、V-pair、stale化、反証可能な証拠 | 確定事実、採否、技術方式 |
| CIとbotで品質とスピードを両立し非エンジニアでも作れる | HARNESSの開発・検証契約、HELIX-OSの実行統制、個別製品の利用者体験 | CI greenからの要求・受入・完了 |
| 低コストWorkerを最適配置 | Bounded Multi-AI Execution、計測、assignment、独立review | provider固定、自己申告による能力認定、品質義務の省略 |

5目標は5/5接続され、目標文書のPO提示原文は変更していない。対象別の利用者価値、非対象、要求、受入、数値基準、
技術方式はL1以降へ残る。

## 七大原則の接続

七大原則はConceptの9構造原則へ統合せず、HARNESS route内の判断点で用いる行動規律として接続した。

| 七大原則 | Conceptとの関係 |
|---|---|
| リサーチ＆検証ファースト | 上流authorityと反証条件を確認してから下流へ降ろす |
| 原子PR原則／非依存並列化 | responsibility、relation、対象revisionに沿って変更単位を分ける |
| DDD設計／TDD開発 | domainと責務を先に定め、要求・設計・検証pairを閉じる |
| 下流トラブルは上流還流 | 対象上流へ候補を戻し、採否後のrevisionから再導出する |
| ミニマム実装／適時リファクタリング | 承認scope内の最小変更と、別採否が必要な構造改善を分ける |
| 責務／依存分離 | Product SeparationとResponsibility Firstを変更境界へ適用する |
| 確かな証拠と計測改善 | Evidence ClosureとControlled Adaptationを完了・改善判断へ適用する |

七原則は7/7接続され、原則文書のPO提示原文は変更していない。Production、Research、Discovery／PoC、
UI prototypeのrouteとroute内順序はHARNESS側に残る。

## 無損失境界

- 旧要求source、Requirement IR、semantic line、L2／L11、Feature Ticket、Issue本文を変更しない。
- 5大目標と七大原則から新しい個別要求、責務owner、ticket、workflow、技術選定を追加しない。
- HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OSの責務境界を統合し直さない。
- 旧CI、旧test、旧runtime、旧DBを実行・変更しない。
- 候補PRのmergeを人間approval、canonical promotion、要求採否へ変換しない。

## 次の降下単位

本接続候補の外部review後、対象別L1で5大目標の価値被覆と七大原則の適用境界を確認する。L1差分は本PRへ混載しない。
L1候補の後も、旧要求source atomの未計上0を証明するまでL2要求を削除・統合・retireせず、個別要求PRへ分ける。
