# HARNESS工程要求source被覆監査

status: source_preserved_target_unapproved
machine_ledger: `harness-workflow-source-clause-carry-forward.jsonl`
scope: development style、Discovery／PoC、Research、UI prototypeと各合流・差戻し条件

## 目的

HARNESSの工程を一つの直線へ要約して旧要求を落とさないため、確認済みsourceにある工程identityとtrigger行を原文・行番号・file／line digest付きで固定する。本監査は旧要求全体の代替ではなく、工程順序に直接関係する16 clauseの追加索引である。全要求の分母は既存の要求source台帳群を維持する。

## 現在値

| 集合 | 件数 | source状態 | 新世代target | successor | 人間decision |
|---|---:|---|---|---:|---:|
| HARNESS工程source clause | 16 | `confirmed` 16 | `draft_candidate` 16 | 0 | 0 |

16件は次を覆う。

- development styleとProduction Scrumの同格性・V-pair closure。
- Discovery／PoCの4 trigger、S0–S4、S4人間判断、選択style／L3への合流。
- Researchの3 trigger、research memo＋ADR、L4への合流、成立性実験時のPoC切替。
- Screen Applicability、prototype builder、walkthrough、要求back-propagation、agreement、skip、再entry。
- 要求・設計変更時のprototype agreement stale化と再freeze。

## 読み方

`current_projection_refs`は現行候補文書が意味を参照する場所であり、successor割当や移管完了ではない。16件はすべて`preserved_pending_rehome`で、後続の一要求identityごとのPRにおいて保持atom、対象product、successor、L11、未被覆atom、人間decisionを確定する。近い文面を理由に統合せず、全体要求台帳から削除しない。

GitHub上流文書の導出順、HARNESS製品のroute、HELIX-OS推進が生成するworkflow instanceを別軸として読む。`premise organization`等のcandidate語彙を、このconfirmed集合へ自動算入しない。
