# Capability Lease runtime導入の運用記録（operation_change入力）

prepared_at: 2026-09-21
authority_effect: none
pr_class: operation_change

## これは何か

[Capability Lease bootstrap判断packet](capability-lease-bootstrap-decision-packet.md)（以下 packet）の手順2が定める後続の
`operation_change` PRについて、GitHub上流運用モデルが`operation_change`に求める必須入力（HELIX-OS要求、操作authority、backup、
rollback、read-after）を1か所に置く。本PRはpacketの意味を文言とcodeへ落とすだけで、意味を新たに決めない。

## 必須入力

| 入力 | 内容 |
|---|---|
| HELIX-OS要求 | 承認済みHELIX-OS L1の`HELIXOS-L1-003`（許可・予算・依存・独立検証の範囲でWorkerへ委譲する）と`HELIXOS-L1-004`（CI・review・証拠収集の統制）、およびpacketのbootstrap判断（packet 規則の意味4）。承認済みのHELIX-OS L2要求はまだない |
| 操作authority | [HDEC-CAPLEASE-BOOT-01](../../decisions/capability-lease-bootstrap-approval-2026-09-20.md)（packet SHA-256 `395c61bf…`へのapprove、`accept_bootstrap_risk`） |
| 外部作用 | 本PRのmerge自体はGitHubの外部状態を変えない。`scaffold/lease/lease.json`の`activated_at`が`null`のため、executorはどのPRも運ばず、Issue本文も書かない。外部作用が始まるのは、有効化のPR（AI側identityの分離とPOの確認の後）がmainへ入った時点である |
| backup | 変更前の状態はmain（`aa42531d009f57b5d65b1763aa33fb84d40b3a11`）そのものである。本PRが変えるのは新規の`scaffold/lease/`、`scaffold/bindings/SCF-B-0004.json`、`scaffold/evidence/lease-selftest.json`、本記録と、AGENTS.md・GitHub上流運用モデル・PR template・上流authority台帳の規則文言だけである |
| rollback | lease記録を有効化しない限り、merge後も外部作用は無い。取り下げる場合は、取り下げを判断したrecordに基づく後続PRで、`SCF-B-0004`を`retire`し`scaffold/lease/`を撤去し、規則文言を戻す。revertやforce pushでmainの履歴を隠さない |
| read-after | merge後に、main HEADがmerge commitであること、第1親・第2親、merge commitのtreeで`scfctl validate／stale／residuals／selftest`とgovcheckの合格、`python3 scaffold/lease/leasectl.py selftest`の合格、`python3 scaffold/lease/leasectl.py status`で`activated_at: null`を確かめる |

## 本PRで文言へ落とした規則の意味（packet 規則の意味1〜8）

| 規則の意味 | 反映先 |
|---|---|
| 1 作成・修正側はmergeしない、を維持。有効なleaseを持つ別contextの主体は人間の追加確認なしでmergeしてよい | AGENTS.md 17行、運用モデル「作成側とレビュー対応側の責務」 |
| 2 lease対象PRの独立review通路（`accept_bootstrap_risk`の間の転記を含む） | 運用モデル「review、判断、merge admission」冒頭 |
| 3 merge admission条件4をleaseで満たし、PR単位の許可を廃止。例外は非常経路と再bootstrap | 運用モデル「governance／operation_change PRのmerge admission」条件4 |
| 4 `operation_change`の必須入力「HELIX-OS要求」 | 同節冒頭、本記録 |
| 5 lease対象PRのmergeとread-afterはexecutor、Issue closeは従来どおり | 運用モデル「作成側とレビュー対応側の責務」 |
| 6 投稿command・executor commandだけを許可し、例外は非常用command・実測command | AGENTS.md 16行 |
| 7 レビュー対応側の定義から人を除き、人間はmergeしない | AGENTS.md 17行、運用モデル「作成側とレビュー対応側の責務」 |
| 8 PR class表へ`decision_record`を追加 | 運用モデル「PR classとscope」、PR template |

## 実装が未検証の点

`scaffold/lease/README.md`の「未検証」に列挙した、実物のGitHubでまだ確かめていない挙動（activity APIの形、collaborator roleの値、
review削除の拒否時のerror種別、Issueの編集履歴の形、merge-treeとGitHubのmerge結果の一致）は、有効化の前に実測する。
実測するまでlease記録を有効化しない。
