# 上流authority状態モデル

status: active_foundation_rule
generation: new-generation-2026-09-14
scope: upstream documents, requirement carry-forward, management provisional registration, work tickets, GitHub projections

## 目的

要求意味の採用状態、対象別文書の起草状態、旧要求の再配置状態、作業ticketの進行状態、GitHub projectionの状態を分ける。同じ`draft`、`confirmed`、`pending`、`open`という表示から別軸の状態を推定しない。

旧要求文書が`confirmed`であることと、その要求をHELIX-HARNESS／HELIX-OSへどう分けるかが未確定であることは両立する。新しい対象別L2が`draft`であることを理由に、旧要求の採用済み意味をcandidateへ降格しない。

## 五つの独立した状態軸

| 軸 | 問うこと | 現在使う値の例 | authorityへの作用 |
|---|---|---|---|
| `source_authority_state` | sourceでその意味がどの状態だったか | `confirmed`、`draft`、`proposed`、`placeholder`、`historical_candidate`、`specified_frozen`、`source_status_not_declared` | 元状態を保存する。新世代の対象や配置を自動確定しない |
| `target_authority_state` | 新世代の対象別文書が人間decisionへ束縛されているか | `draft_candidate`、`draft`、`awaiting_parent_approval`、`approved_revision` | `approved_revision`だけが対象revisionの現行意味authorityになる |
| `carry_forward_state` | 原要求の意味がsuccessorへ欠落なく移ったか | `preserved_pending_rehome`、`partially_covered`、`covered`、`meaning_change_decided`、`retired_by_decision` | 元の採用済み意味は`covered`または人間decisionまで保持する |
| `management_registration_state` | 管理層がsource集合または要求候補を仮登録しているか | `registered_source_holding`、`registered_proposal`、`stale`、`superseded`、`rejected_registration` | 常に`authority_effect: none`。他の四軸、要求採用、実装許可を変更しない |
| `work_projection_state` | 作業・外部表示がどこまで進んだか | `proposed_upstream_waiting`、`ready`、`in_progress`、`reviewed`、`closed`、`projection_failed` | 要求意味、採否、承認、受入へ作用しない |

文書の既存metadata名は移行中の表示であり、この五軸を一つのfieldへ押し込まない。後続の要求登録・分類機構では五軸を別fieldとして持つ。現在のMarkdownでは、文脈が曖昧な`status`だけを根拠に状態遷移させず、台帳とdecision recordを併読する。

## 現在の読替え

| 現在の記録 | 正しい解釈 | 禁止する解釈 |
|---|---|---|
| 旧要求文書17件の`confirmed` | sourceで採用済みだった要求意味をそのまま保持する | 新世代の対象・owner・実現方式まで承認済み |
| 旧要求文書3件の`draft`、1件の`proposed`、1件の`placeholder` | sourceの未確定状態を保持する | 不要、削除済み、retired |
| 旧IR 6ファイルの`specified`／`frozen`と、frontmatter statusを持たず本文L9で文書revisionだけをconfirmedとするv1.3 | source表現を`specified_frozen`／`source_status_not_declared`として保持し、v1.3本文の限定も併記する | target要求、網羅、実装、受入まで`confirmed`と自動読替え |
| IR 153件の`preserved_pending_rehome` | 原文・identity・意味を保持し、successor被覆が未完 | candidateへ降格、未採用、37件へ置換済み |
| Concept v4.1の`draft_candidate`／`awaiting_human_approval` | 人間へ提示する最新Concept案 | 旧要求の採用状態を解除済み、canonical化済み |
| 対象別L1／L2／L11の`draft` | 新しい対象・粒度・接続での構成案 | 参照した旧要求をdraftへ降格済み |
| Feature Ticketの`proposed_upstream_waiting` | local作業契約の候補で、上流承認待ち | 要求採用済み、実装Ready |
| GitHub Issueのopen／closed、PRのDraft／Ready／merged、checkのgreen／failure | 外部作業・review・証拠projection | 要求の採否、意味変更、retire、受入 |

## 許可する状態遷移

```text
source_authority_state
  └─ 変更しない。source snapshotと台帳に固定する

target_authority_state
  draft_candidate／draft
    → 対象revision付き人間decision
    → approved_revision

carry_forward_state
  preserved_pending_rehome
    → successorごとの意味atom被覆記録
    → partially_covered または covered
  preserved_pending_rehome／partially_covered
    → 対象revision付き人間decision
    → meaning_change_decided または retired_by_decision

management_registration_state
  source集合 → registered_source_holding
  要求候補 → registered_proposal
  内容変更・訂正 → stale／superseded／rejected_registrationをappend
  └─ 他の四軸を変更しない

work_projection_state
  上流revisionと独立して進行・失敗・closeできる
  └─ 他の四軸を変更しない
```

`covered`は、successor ID、対象product、原意味atom、successor側の被覆、未被覆0件を一要求identityごとに確認した場合だけ成立する。意味変更、縮退、統合、retireは、対象revisionと変更前後を示した人間decisionが必要である。

## fail-close規則

- 一つの`status`から別軸の状態を推定しない。
- `confirmed → draft`のようにsource状態を書き換えて再配置を表現しない。
- target文書への参照、Issue作成、PR merge、review、check、実装欠落から`covered`を生成しない。
- successorを複数に分けた場合、全successorの合成で原意味を被覆するまで未被覆atomを`pending`に残す。
- 同名ID、近い文面、同じ対象候補だけで統合しない。
- 人間decisionが不明、revision不一致、digest不一致の場合は元状態を保持して停止する。

## AIの読込規則

AIは上流を扱う前に、[新世代入口](new-generation-start-here.md)、[上流authority台帳](upstream-authority-register-2026-09-14.md)、本状態モデル、[carry-forward管理状況](requirement-carry-forward-status.md)の順に読む。GitHubや実装を先に観測しても、この順序を逆転させない。

現在のsource別実数、successor、未被覆、meaning changeはcarry-forward台帳を正本とする。本書の例示件数を機械状態の代替にしない。
