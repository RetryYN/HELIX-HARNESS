---
schema_version: skill.v1
name: estimation
skill_type: process
applies_to:
  layers:
    - L1
    - L3
  drive_models:
    - Forward
    - Add-feature
    - Discovery
    - Scrum
    - Reverse
    - Refactor
    - Retrofit
---

# estimation（見積もり）

schedule commitment 前に HELIX PLAN の complexity / effort を score する手順
（FR-L1-39 task complexity / effort）。機械分類は `helix task classify`
（kind / drive / size / complexity / risk）が使える。本 pack の 3 軸 scoring は
PLAN author が PLAN 作成時に行い、PLAN body に記録する（classify の出力と食い違う場合は
食い違いの理由を書く）。

## この skill を読む条件

- agent へ delegated され、session boundary に収める必要がある PLAN を作成する。
- Discovery S1 plan step で、S2 PoC 開始前に relative sizing が必要。
- sprint が stalled しており、root cause が under-estimated scope である。
- 複数 PLAN が同じ session slot を競合し、prioritise が必要。

## Scoring dimensions（採点軸）

§工程表を書く前に、各 PLAN を 3 軸で score する:

| 軸 | 1 (small) | 2 (medium) | 3 (large) |
|---|---|---|---|
| **Size** | single doc または single src file | 2-5 files、one layer | cross-layer、5 files 超 |
| **Dependency depth** | unresolved dependency なし | 1-2 resolved deps | 3+ chain または unresolved dep |
| **Uncertainty** | well-understood pattern | unknown があり research needed | novel、先に PoC が必要 |

3 つの score と合計を PLAN body に記録する（例: `[2+1+2=5]`）。
Total 3-4 は one session に収まる。Total 5-6 は split または timebox。
Total 7-9 は scheduling 前に child PLANs へ decompose する必要がある。

**見積もりは予測ではなく会話の道具である。** 複数の見積もり（別 agent / 別 runtime / PO）が
ばらけたら、それは見積もりの失敗ではなく**理解の相違を見つけた成功**。数字を平均せず、
ばらけの原因（前提・scope 解釈の差）を特定してから再 score する。Uncertainty=3 のまま
commit するのは判断の先送りであり、先に research / PoC PLAN へ切り出す。

## Drive-model adjustments（drive model 別補正）

- **Forward / Add-feature:** generated design doc が新規の場合、Reverse back-fill により Size に +1 する。
  明示的に note する。
- **Reverse / Retrofit:** Uncertainty が 1 になることは稀。design coverage の無い existing code は通常 2 または 3。
- **Refactor:** refactored module が多数の caller から import される場合、Dependency depth は上がる。
  unique import site を数える。
- **Discovery (Scrum):** S2 PoC step だけを score する。S3 verify と S4 decide は S2 完了まで size しない。
- **Recovery / Incident:** score に関係なく single session に time-box する。
  scope-reduction decision は `.helix/audit/` に記録する。

## Session boundary の rule

natural gate（pair-freeze、trace-freeze、accept）を越える agent session で continuation event と
`harness.db` projection が更新されない場合、それは untracked session split である。score 5+ の PLAN を
scheduling する前に、§工程表へ first session を終える stepと、`helix status` で next action を
再確認する手順を書く。

## Delegation sizing（委譲 sizing）

sub-agent へ delegate する場合:

- free-form task description ではなく PLAN path を渡す。
- delegation 前に対象 PLAN で `helix plan lint` が 0 で終了することを確認する。
- size 7+ の PLAN は先に child PLANs へ split する。7+ PLAN の delegation は runaway scope expansion を招く。

## Validation after sizing（sizing 後の検証）

```
helix plan lint            # schema violation を reject し、missing deps を捕捉する
helix status               # active / stalled PLAN を表示する
helix doctor               # governance gate。unresolved deps はここで surface する
```

## Anti-patterns（避けるパターン）

- existing source を先に読まず、Reverse または Retrofit PLAN に Uncertainty=1 を付ける。
- "small fixes" だからと sizing を完全に skip する。unscored PLAN は stalled session へ蓄積する。
- 1 つの axis が 3 なのに、sum score だけを見て decomposition を skip する。
  total に関係なく、単一 axis 3 は decomposition review の根拠になる。
