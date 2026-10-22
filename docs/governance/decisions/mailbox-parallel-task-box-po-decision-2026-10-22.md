---
title: "mailboxの5件上限と並列・直列タスクボックスのPO判断（2026-10-22）"
decision_record_id: HDEC-MAILBOX-PARALLEL-TASK-BOX-2026-10-22
decision_status: recorded
decider_role: PO
decided_at: 2026-10-22
recorded_at: 2026-10-22
source: "Issue #3570本文およびcomment 6331874297・6331875384・6331891728"
authority_effect: effective_when_this_record_is_admitted_to_main
---

# 記録の範囲

[Issue #3570](https://github.com/RetryYN/HELIX-HARNESS/issues/3570)に記録されたPOの原文と、その具体化を残す。通常作業の新しい承認やgate、実権限、release、要求採否は生成しない。

## POの原文

統制が「Codexだけ3件」を提案したことへの回答：

> メールボックスは最大5件の依頼にしたほうが良くない？

> Codexはサブエージェントを並列3体呼べる同時タクス遂行力は3、デビンは並列の理論上制限なし、3つは余裕とのこと。以上の理由からタスクの上限を3にする意味もましてや1にする意味が全くない。

[並列実行の指示](https://github.com/RetryYN/HELIX-HARNESS/issues/3570#issuecomment-6331874297)：

> 並列タクスボックスとかにしてメッセージで３つ並行でやれとかにするとか処理能力を最大に使える構成にせよ。

[理由](https://github.com/RetryYN/HELIX-HARNESS/issues/3570#issuecomment-6331875384)：

> 今後のチケット化を考えたらこれが効率的。

[直列の指示](https://github.com/RetryYN/HELIX-HARNESS/issues/3570#issuecomment-6331891728)：

> あとは直列ボックスもあり。A⇒B⇒Cの順番でやれとか。

## 統制による具体化と実装範囲

- Codex・Devinはそれぞれ未完了5件まで。Antigravityは指示対象外で1件を保持する。
- mailbox全体のFIFO直列claimを廃止し、各依頼を先頭の完了なしにclaim/ACKできる。結果とreleaseは一致する依頼だけを解放し、ACK済み依頼は結果/releaseまで保持する。
- 後続待機中はTTLを進めず、claim処理で配送可能にした時点から元TTLを一度だけ開始する。旧FIFO保存状態とsingletonも読み、既存の待機依頼を失わない。
- 後続PRではparallel/serialの最小形式で並列の直列列 `(A⇒B)∥C` を表す。一般DAGは作らない。直列では前段のmerge又はwork_resultを待ち、後続baseはmerge後mainへ束縛する。incomplete/blocked/findingsでは後続へ進まず結果を返す。
- 後続PRで一括inspectと通知に「未完了の依頼は互いに独立したものとして並列で実行する（Codexはsubagentを使う）」を反映する。依存は依頼側がscopeへ書き、結果は個別request_idで返す。

[分割の回答](https://github.com/RetryYN/HELIX-HARNESS/issues/3570#issuecomment-6331929069)は、①上限・並列claim、②ボックス形式と進行、③一括通知と文書を順に独立reviewし、前段merge後mainを次のbaseとする。本記録と同じPRの実装は①に限る。②③の成立を①から主張しない。baseのずれは既存参照SHA照合で検出し、新しいgateを足さない。

## 旧source・失敗との照合

- 旧HELIX `archive/legacy-generation-2026-09-14/root/docs/plans/PLAN-L7-64-team-runner-launch.md:48–66`（`LEGACY-ASSET-BD52CCF6AECA69C7152F`）はparallel/max_parallelを尊重し、理由がある場合だけsequentialとした。`docs/design/harness/L6-function-design/agent-slots.md:89–108`（同archive、`LEGACY-ASSET-2A7155AEF524EA8B2B05`）はfile conflict/downstream dependency/shared stateを直列化理由としていた。
- 保持するのは上限内の並列実行、依頼と結果の対応、理由のある依存の分離である。旧team runner/CLI/lock機構は再利用・実行せず、現行GUIの同session配送へ意味を再導出する。変更は今回のPO指示による。
- [#3086 comment 6273666458](https://github.com/RetryYN/HELIX-HARNESS/issues/3086#issuecomment-6273666458)の10/20の選択はDevin3件・FIFO先頭1件だった。[10/20の結果宛先判断記録](work-result-any-recipient-po-decision-2026-10-20.md)は宛先と依頼全値照合を扱い、claim直列化の根拠ではない。結果の原依頼照合は保持する。
- [#3405 R1](https://github.com/RetryYN/HELIX-HARNESS/pull/3405#issuecomment-6274010500)では、先頭ACK済み中に後続がclaim不能のまま送信起点TTLで消えた。[R2](https://github.com/RetryYN/HELIX-HARNESS/pull/3405#issuecomment-6274171969)の待機TTL停止を保持し、並列claimでも待機依頼を失わないtestを置く。この失敗は全claim直列の必要性を示さない。
- #3086の期限切れ明示releaseで後続昇格が保存されなかった失敗と[#3529の修正](https://github.com/RetryYN/HELIX-HARNESS/pull/3529)は対象選択・原依頼の権限照合・保存の順序として保持する。
- 派生例は `RetryYN/ProFine` [#231](https://github.com/RetryYN/ProFine/issues/231)・[#238](https://github.com/RetryYN/ProFine/pull/238)、`docs/tickets/GOV-0011-ui-split-heavy-specs-fully-parallel.md`（blob `50265f97420703da630c0a92e7786f11d2668cad`）。重いUI仕様を分割しparallelにした事例で、mailboxの並行衝突の根拠ではない。WP各repositoryは検索権限エラーを含み、限定調査から全履歴の不存在は断定しない。

実GUIの5件ACKや処理能力、ボックス全体の完成はscaffold testの合格と区別する。旧runtime/test/CIは実行しない。
