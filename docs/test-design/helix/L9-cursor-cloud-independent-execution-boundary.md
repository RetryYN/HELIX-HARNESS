---
title: "Cursor Cloud第三者実行レーンのL9統合oracle"
status: draft
authority_status: canonical_draft
owner_issue: 1293
layer: L9
canonical_vmodel: L1-L12
pair_layer: L4
completion_claim_allowed: false
runtime_activation_allowed: false
created: 2026-09-12
source_head: 2677f0ee8bfdd7fb4e2e4b6e59fc9c2037401567
plan: docs/plans/PLAN-L4-77-cursor-cloud-independent-execution-boundary.md
parent_design: docs/design/helix/L4-basic-design/cursor-cloud-independent-execution-boundary.md
pair_artifact: docs/design/helix/L4-basic-design/cursor-cloud-independent-execution-boundary.md
---

# Cursor Cloud第三者実行レーンのL9統合oracle（未実行）

## 検証境界

[L4設計](../../design/helix/L4-basic-design/cursor-cloud-independent-execution-boundary.md)のportを接続する
後続試験設計であり、テスト実装・成功証拠ではない。`IT-CPA-*` は本設計内の行識別子に限り、
FR／AC／gateを新設しない。
既存L10の `docs/test-design/helix/three-lane-cloud-governance-acceptance.md` の一部へtraceし、
27 AC全体の検収を所有しない。予算と外部provenanceは#1359／#862の契約を消費する境界であり、ownerを移管しない。

fixtureは固定時計、制御可能な並行barrier、branch書込みを実際に拒否できる隔離target、外部readerの応答列、
launch/stopの呼出し記録、費用予約の観測を使う。開始判定・実run作成・書込み成功・receipt受理・安全返却を別々に数える。
単なるmock呼出し回数は実効排他やcloud強制の証拠にしない。最初のoffline fixture成功と、
許可取得後の実providerによる同じ反例の成立は別段階とし、現時点ではどちらも未実行である。

IT-CPA-004/005/010は#860所有のAssignment／lease primitiveをCursor consumerで検証する。
ownership authorityやlease schemaを#1293へ移管せず、#1293はcloud adapter接続・外部read-after・E2Eを所有する。

## 統合条件（Given/When/Then）

| oracle | 上位AC／既存契約 | Given | When | Then | 回復／取り除くとRedになる境界 |
|---|---|---|---|---|---|
| IT-CPA-001 | 3L-AC-005/013、WCC-FR-09 | current source/IR、1 scope、有限資源、発行済みbranch、全portが成立 | contextから外部回収まで1 assignmentを通す | launch/run各1、証拠は同assignment/branchへ結合、blind review待ち1、accepted 0 | assignment結合を除去すれば別run混入で失敗。実cloudの成立は別証拠 |
| IT-CPA-002 | 3L-AC-004/013/014、WCC-FR-01/09 | 正常入力の一項目だけを変えるfixture集合 | Issue/PLAN両方・両方なし、authority/rule/HEAD/payload drift、schema欠落、失効admission、非control発行を各々入力 | 反例ごとにlaunch 0、固有の失敗理由。別の正常fieldで相殺しない | fresh入力で全前段をやり直す。各検査除去を別mutationとする |
| IT-CPA-003 | 3L-AC-005/026 | 発行済みbranchと排他所有を持つが外部読取を改変できる | 未発行、provider事後発行、owner不明/不一致、assignment不一致、stale base HEADを個別投入 | 起動直前legが各々拒否しlaunch 0。起動後legの正常応答を与えても起動不可 | 外部read-after除去をmutationにする。cwd/env/mainから補完しない |
| IT-CPA-004 | 3L-AC-025 | 同一repository/branchへ別processの2 assignmentが同時到着 | 同じ旧snapshotをbarrierで読ませ、#860所有のPhase A実ownership取得とCursor launchを競合させる | 原子的取得の勝者1、敗者launch 0、最大同時writer 1。異なるbranchでは双方の正当な取得を許可 | pure acquireWorkGraphLeaseだけへ置換すると両者成功してRed。観測listをlock扱いしない |
| IT-CPA-005 | 3L-AC-025/026 | 有効な所有の取得直後にcontrol processが落ちる | restart、expiry、renewal境界で同branchを再取得し、旧tokenからwriteも試す | healthy runのbounded renewalだけを許可。現所有とwrite不能をfresh再照合するまでlaunch 0。process消滅、expiry、lock年齢だけでstealせず、旧tokenのwrite成功0 | owner/action違いのrenewal、失敗renewal後のwrite、旧世代write、未返却stealを各mutationにする |
| IT-CPA-006 | 3L-AC-005/025/026 | providerはrunを作成したがlaunch応答が消失 | 同actionを再処理し、外部run照合も一時失敗 | 実run作成は1のまま、盲目的再launch 0、所有/費用予約を保持 | 同runの帰属確認後に観測再開。結果不明のままretryするmutationを拒否 |
| IT-CPA-007 | 3L-AC-003/014 | repo-owned環境とadmission fixtureを用意 | provider停止、scope外/main/別branch/DB write、禁止secret/network到達を個別試行 | 停止をDEGRADED表示。禁止先write/到達の成功0。prompt遵守やBuild成功だけではpassしない | 実consumerの強制を除去するとRed。許可されたbranch内writeはpositive controlで成功 |
| IT-CPA-008 | 3L-AC-007/008/009/014 | pool/cycle・committed/reserveを持つ有限予算、競合する2予約 | UNKNOWN usage、古い証拠、token/quotaのみ、予算不足、同じ残額の二重消費を投入 | 不成立入力のlaunch 0、同じ残額の過剰確保0。未照合費用を0へ戻さない | 資源確保と競合検査の除去でRed。通貨・金額単位のexact equalityはL3 amendment候補であり、canonical化前はこのoracleの合否authorityにしない |
| IT-CPA-009 | 3L-AC-014/025 | absolute deadlineと実効金額上限が束縛された稼働run | expiry境界、cap到達、clockずれ、usage通知遅延を個別に進める | 期限/上限外の許可write・課金0を強制機構の観測で示す。示せない機構は起動不適格 | stop経路へ遷移し再配車0。ローカルtimeout/事後usage監視だけへの置換を拒否 |
| IT-CPA-010 | 3L-AC-025、3L-AC-027のPhase A前提のみ | stop ACK済みだがremote workerまたは旧権限が残る | 完了/取消/期限切れを各々通知し、旧workerの遅延writeと次assignmentを試す | writer不能が未証明なら返却/再配車0。証明後の旧write成功0、新しい正当なwriterは1 | stop ACK＝安全返却とするmutationでRed。Phase B lease/fence完成とは数えない |
| IT-CPA-011 | 3L-AC-015 | 起動前leg正常、成果HEADはbaseから進行、独立した外部reader | 起動後と回収時にowner交代/別branch/別assignment/帰属不能HEAD/自己申告costを各々返す | 反例ごとの回収receipt受理0。正当な同assignmentのHEAD進行は受理。両legを保存 | 前段成功で後段をskipするmutation、baseとcandidateの単純同値判定を拒否 |
| IT-CPA-012 | 3L-AC-013/015、WCC-FR-05 | remote JSON/差分を隔離受信し、対応する外部観測を用意 | copied local seal、未知schema、過大bytes、改変diff、path脱出、symlink脱出、command/SQL文字列を各々投入 | local capabilityへの昇格0、禁止write/command実行0、不正receipt受理0。HEAD/path/diff bytesを別照合 | 同runへbounded再回収のみ。WeakMapチェック除去やpath一覧digestだけの検査でRed |
| IT-CPA-013 | 3L-AC-006、WCC-FR-06 | external run観測とexact candidate HEADが結合された候補 | 独立reviewへ渡し、自己review/worker会話混入/旧HEAD receiptを各々試す。次にchanges requestedを返す | 不正review受理0、reviewer write 0。元assignment/同branchへ限定修正を返し、新HEADで旧reviewをstale化。run成功だけではaccepted 0 | budget/TTL/所有を再検証し、scope/設計変更は既存re-entryへ。remote origin接続が不足ならreceiptを作らない |
| IT-CPA-014 | 3L-AC-014/015/025 | 稼働中、回収中、stop照合中のそれぞれで通信が失敗 | bounded期限まで再照合し、最後まで終端/費用/write不能のいずれかを取得できない | 隔離・理由付き未成立、accepted/所有再利用/新規dispatch 0。不確実な費用予約を解放しない | 外部証拠が復旧した同runだけをreconcile。無限poll・盲目的再実行・UNKNOWNの成功扱いを除去 |

## 再利用テストと次層の義務

IT-CPA-005は少なくとも、正常renewal、wrong owner、wrong assignment/action/branch、stale token、
renewal replay、deadline後renewal、絶対上限の延長、process消滅だけを根拠にしたsteal、旧workerが
write可能なままの再取得を独立fixture／mutationとして持つ。一つの正常caseでこれらを代表させない。

- context/admission: `tests/worker-context-packet.test.ts`、`tests/worker-descriptor-admission.test.ts`、
  `tests/project-hook-assignment-provider.test.ts`、`tests/worker-wrapper-admission.test.ts`。
- 排他/資源: `tests/work-graph-receipt-acceptance.test.ts`、`tests/slot-scheduler-quota-handover.test.ts`。
- 回収/review: `tests/worker-output-admission.test.ts`、`tests/worker-isolation-broker.test.ts`、
  `tests/worker-review-receipt.test.ts`。U-WLIFE-001〜003は既存local lifecycleの回帰で、remote検証の代用品ではない。
- 環境: `tests/cursor-cloud-environment.test.ts`。Build仕様の検査と実際のscope/secret/network強制は分ける。

L5/L8でfixtureのidentity、exact失敗コード、時計・再試行上限、実consumer観測点、各mutationとassertionを固定する。
L6/L7で本物の競合・遅延writeを検出するRed→Greenを残す。テスト名やpathの存在、文書中の語彙一致だけを
ここに列挙した14 oracleの実行成功と数えない。IR main未着地、正式ID未予約、pair未freeze、独立review未成立、
実cloudの権限・費用・強制機構未確認のため、本L4/L9だけからruntimeを開始できない。
