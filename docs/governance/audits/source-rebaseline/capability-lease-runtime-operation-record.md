# Capability Lease runtime導入の運用記録（operation_change入力）

prepared_at: 2026-09-20
authority_effect: none
pr_class: operation_change

## これは何か

[Capability Lease bootstrap判断packet](capability-lease-bootstrap-decision-packet.md)（以下 packet）の手順2が定める後続の
`operation_change` PRについて、GitHub上流運用モデルが`operation_change`に求める必須入力（HELIX-OS要求、操作authority、backup、
rollback、read-after）を1か所に置く。本PRは有効化の欄を埋めるまでmergeしない（下記「外部作用」）。本PRはpacketの意味を文言とcodeへ落とすだけで、意味を新たに決めない。

## 必須入力

| 入力 | 内容 |
|---|---|
| HELIX-OS要求 | 承認済みHELIX-OS L1の`HELIXOS-L1-003`（許可・予算・依存・独立検証の範囲でWorkerへ委譲する）と`HELIXOS-L1-004`（CI・review・証拠収集の統制）、およびpacketのbootstrap判断（packet 規則の意味4）。承認済みのHELIX-OS L2要求はまだない |
| 操作authority | [HDEC-CAPLEASE-BOOT-01](../../decisions/capability-lease-bootstrap-approval-2026-09-20.md)（packet SHA-256 `395c61bf…`へのapprove、`accept_bootstrap_risk`） |
| 外部作用 | 本PRのmergeでleaseが有効になり、executorがmerge（mainへの通常push、`merge_result`）とprojection_sync（mapping上のIssue本文）を始める。packetは既存規則でのmergeを本PRまでに限り、削除不能の実測を有効化の条件とするため、有効化を別のPRへ分けず、本PRのlease記録を有効化の欄（identity表、基準値、状態Issue、試験PR・試験review、実測結果、起点、`activated_at`）まで埋め、実測を済ませてからmergeする。PO側の準備（AI側identityの分離等）が済むまで本PRはmergeしない。現headの`lease.json`は`activated_at: null`で、この状態ではexecutorはどのPRも運ばない。merge前にも次の外部操作を行う: 状態Issue1件と draftの試験PR1件の作成、POによる試験review（`decision:`行を持たない`APPROVED`・`CHANGES_REQUESTED`各1件）の提出、実測commandによるその試験reviewへの`deletePullRequestReview`の試行（AI側の各login×2 review）と状態Issueへの結果comment。これらのうち、状態Issueと試験PRの作成、branch `lease/probe-test`へのpush、実測の実行と結果commentは、`leaseboot`と`leaseprobe`が行う（mainへは押せない）。ローカルの実行環境は、POがrootで1回`scaffold/lease-bootstrap/install.sh`を実行して組む（executor用OS user、root所有のcopy、installation tokenを発行するwrapper、そのwrapperだけを許すsudoers）。既存のOS userをexecutorに指定した場合は、そのhomeの権限を0700へ変える（AI側から状態領域・秘密鍵へ届かないようにするため）。GitHub Appの作成・installとAppの秘密鍵の配置は、`appsetup.py`のmanifest flowでPOがbrowserで認可し、鍵はexecutor userのhomeへ0600で置かれる（AI側contextからは読めない） |
| 人間の操作 | POが越えるのは4つだけである。(1) rootで`install.sh`を1回実行する、(2) browserでGitHub Appの作成とこのrepositoryだけへのinstallを認可し、rulesetのbypassを空にし、POのaccountの資格情報をAI側から隔離する、(3) 試験PRでApproveとRequest changesを1回ずつ提出する、(4) 有効化の値を埋めた最終exact HEADを確認し、merge通路の許可をそのHEADに固定する。設定値の作成、状態Issue・試験PRの作成、lease記録への転記、実測、未検証項目の確認は行わない |
| backup | 変更前の状態はmain（`aa42531d009f57b5d65b1763aa33fb84d40b3a11`）そのものである。本PRが変えるのは新規の`scaffold/lease/`、`scaffold/bindings/SCF-B-0004.json`、`scaffold/evidence/lease-selftest.json`、本記録と、AGENTS.md・GitHub上流運用モデル・PR template・上流authority台帳の規則文言だけである。merge前の外部操作の対象（状態Issue・試験PR・試験review）は本PRのために新たに作るもので、既存のIssue・PR・reviewには書き込まない。試験reviewは判断を持たない（`decision:`行が無い）ため、実測で削除されても失われる人間判断は無い |
| rollback | merge後にleaseを止めるには、packet「取消しと即時停止」の経路（実行環境からexecutor commandの許可を外す、sessionへの停止指示、`revoked_at`を記録した`decision_record`）を使う。撤去する場合は、取り下げを判断したrecordに基づく後続PRで、`SCF-B-0004`を`retire`し`scaffold/lease/`を撤去し、規則文言を戻す。revertやforce pushでmainの履歴を隠さない。merge前の実測で試験reviewが削除された（`deleted`）場合は、leaseを有効化しない（本PRをmergeしない）。原因（AI側identityの権限）をPOが直し、POが新しい試験reviewを提出してから、lease記録の`probe.test_reviews`を付け直して実測をやり直す（`probe.activation_test_reviews`と`probe.activation_results`も新しい試験review・結果へ付け直す）。状態Issueと試験PRは、本PRを取り下げる場合もlease記録から参照が消えるだけで、削除しない。ローカルの実行環境は、sudoersの規則とcopyを外し、Appの秘密鍵をGitHub上で失効させれば元に戻る（executorは起動条件を欠いて何もしない） |
| read-after | merge前の外部操作: 状態Issue・試験PR・試験reviewのIDをlease記録へ記入し、実測結果commentのIDを`probe.activation_results`へ記入したうえで、`leasectl.py status --lease-pr <本PR>`をexecutor userで実行し、`integrity: ok`、`runner`がAI側contextと別のOS user、`probe.status: ok`、有効化の値を記入した後は`activation: ok`（executorと同じ有効化の検査）を確かめる（executorは有効化後も毎回、それらのcommentが編集されずに現存し、有効化時点の試験review（`probe.activation_test_reviews`）のIDと状態に一致し、`activated_at`より前であることを確かめる）。merge後に、main HEADがmerge commitであること、第1親・第2親、merge commitのtreeで`scfctl validate／stale／residuals／selftest`とgovcheckの合格、`python3 scaffold/lease/leasectl.py selftest`の合格、`python3 scaffold/lease/leasectl.py status`で`activated_at`と`probe.status: ok`を確かめ、`leasectl.py admit`のdry-runで、本PRのmergeがmain更新主体の照合を通る（起点の直後の有効化merge）ことを確かめる |

## 本PRで文言へ落とした規則の意味（packet 規則の意味1〜8）

| 規則の意味 | 反映先 |
|---|---|
| 1 作成・修正側はmergeしない、を維持。有効なleaseを持つ別contextの主体は人間の追加確認なしでmergeしてよい | AGENTS.md 17行、運用モデル「作成側とレビュー対応側の責務」 |
| 2 lease対象PRの独立review通路（`accept_bootstrap_risk`の間の転記を含む） | 運用モデル「review、判断、merge admission」冒頭 |
| 3 merge admission条件4をleaseで満たし、PR単位の許可を廃止。例外は非常経路と再bootstrap | 運用モデル「governance／operation_change PRのmerge admission」条件4 |
| 4 `operation_change`の必須入力「HELIX-OS要求」 | 同節冒頭、本記録 |
| 5 lease対象PRのmergeとread-afterはexecutor、Issue closeは従来どおり | 運用モデル「作成側とレビュー対応側の責務」 |
| 6 投稿command・executor commandだけを許可し、例外は非常用command・実測command（有効化の間だけ、対象PRを引数に固定した準備command） | AGENTS.md 16行 |
| 7 レビュー対応側の定義から人を除き、人間はmergeしない | AGENTS.md 17行、運用モデル「作成側とレビュー対応側の責務」 |
| 8 PR class表へ`decision_record`を追加 | 運用モデル「PR classとscope」、PR template |

## 実装が未検証の点

`scaffold/lease/README.md`の「未検証」に列挙した、実物のGitHubでまだ確かめていない挙動（activity APIの形、collaborator roleの値、
review削除の拒否時のerror種別、Issueの編集履歴の形、merge-treeとGitHubのmerge結果の一致）は、有効化の前に実測する。
実測するまでlease記録を有効化しない。
