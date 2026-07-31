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
  development_styles:
    - FULL_L1_L12_V
    - PRODUCTION_SCRUM
    - V_DESIGN_SCRUM_IMPLEMENTATION
  case_driven_models:
    - Discovery
    - PoC
---

# estimation（見積もり）

schedule commitment 前に HELIX PLAN の complexity / effort を score する手順
（FR-L1-39 task complexity / effort）。機械分類は `helix task classify`
（kind / drive / size / complexity / risk）が使える。本 pack の 3 軸 scoring は
PLAN author が PLAN 作成時に行い、PLAN body に記録する（classify の出力と食い違う場合は
食い違いの理由を書く）。

## この skill を読む条件

- agent へ delegated され、session boundary に収める必要がある PLAN を作成する。
- case-driven S1 experiment planで、S2 PoC開始前にrelative sizingが必要。
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

## development style／case-driven model別補正

- **3 development styles:** 選択したstyleのslice境界と正規V-pairを含めてscoreする。Scrumを
  文書・品質工程の省略として減算しない。
- **case-driven Discovery／PoC:** S2 PoC stepだけをscoreする。S3 verifyとS4 decideは
  S2完了までsizeしない。production styleとは別に記録する。
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
