---
title: "Devinを能力条件付きのPR作成側として扱う見直し記録（2026-10-22）"
decision_record_id: HDEC-DEVIN-CONTENT-PRODUCER-2026-10-22
decision_status: recorded
decider_role: PO
decided_at: 2026-10-22
recorded_at: 2026-10-22
source: Issue #3510 comment 6322961721
authority_effect: operation_direction_only_no_runtime_activation
---

# DevinのPR作成側への条件付き割当（2026-10-22）

## 記録の範囲

本記録はDevinのworker限定を見直すWI-1bの上流確認・review対象である。POの発言と統制側の解釈を分け、Devinだけに限った運転方向、旧運用との差分、現行mailboxの未対応境界、後続の実装分割案を記録する。Antigravityの扱いは変更しない。本PRは資格情報・利用者設定・通知実装を変更・有効化しない。本記録やそのPRは、記載した経路が成立した証拠ではない。

## POの原文と統制側の読み

2026-10-22、統制側が「Devinはcommitまで（push・PRはしない）なので、DevinのproposalはCodexがPRにまとめる」と案内したことに対し、POは次のように指摘した（[Issue #3510 comment](https://github.com/RetryYN/HELIX-HARNESS/issues/3510#issuecomment-6322961721)）。

> まずこのルールがおかしい。ほかのイシューみろ。

同commentには、POの2026-10-22指示として「Devinを先行実装部隊」とし、ClaudeがDevin・Codexへ割り当ててreview・mergeすること、ならびに2026-10-21のprovider適性に応じて役割を入れ替える発言が参照されている。統制側はこれを、Devinのworker限定をやめ、能力条件を満たす場合にDevinをPR作成側へ割り当てられる方向と読む。この詳細な適用解釈は統制側の整理であり、「まずこのルールがおかしい」というPOの原文そのものを、個々のmailbox実装変更への追加承認と同一視しない。

## Devinに限る当面の作成運転案

- Devinは、必要なGitHub操作能力を割当前に確認できる場合に限り、作成側として扱える。割当範囲は自分のbranchへのpush、Draft PR作成、exact HEADを束縛した`review_request`送信、review指摘の修正、独立reviewで`no_findings`を受けた後のReady化までとする。
- Devinが作成したPRの独立reviewと明示mergeは作成者以外が担い、当面はClaudeが担当する。Devin自身のreview・merge経路は開かない。
- Devinが作成側の必要能力を満たさない、または作成できない場合、Codexがproposalを検収・取り込み、作成側としてPRを作成する既存の代替経路を使う。
- Antigravityは2026-10-19の試験中・worker限定の扱いを維持し、本記録から作成・review・merge権限を導かない。

これは運転方向の記録であり、現在の仮設経路を実行可能にするものではない。文書とPRは上流確認・reviewの対象に留まり、資格情報・利用者設定・通知実装を変更・有効化せず、現行経路が利用可能であることも示さない。

## 旧HELIX・既決判断との対応

旧sourceは`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:84`のHIL-BR-32（SHA-256 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`）、旧`CLAUDE.md:191-214`「GitHub 自走運用」（`LEGACY-ASSET-6EBDB617A8104A7756D0`）、および2026-10-19の[4runtime PO判断](four-runtime-mailbox-po-decision-2026-10-19.md)である。WI-1の[2026-10-22判断記録](control-lane-coordination-po-decision-2026-10-22.md)も照合した。

- **保持する点**：HIL-BR-32のprecedenceを変えず作業を分離すること、作成者と独立review・merge担当を分けること、秘密・機密を第三者runtimeへ委譲しないこと。Devinは作成したPRを自分でreview・mergeしない。
- **変更する点**：2026-10-19判断が記録した「Devinは作業だけ」という扱いを、POの2026-10-22指示を受けたDevin個別の能力条件付き作成側という運転解釈へ狭く改める。Antigravityを含む第三者runtime全体へ例外を広げず、旧HIL-BR-32本文や2026-10-19判断の過去本文は書き換えない。
- **変更の理由**：POがDevinのworker限定ルールの再確認を求め、「Devinを先行実装部隊」とする指示を参照したためである。現行の固定runtime規則との食い違いを明らかにし、能力確認、Devin作成・Claude reviewの独立性、未実装経路を区別する。

DevinがPR #3418・#3419を作成した実績は能力確認の参考に留まり、権限の根拠ではない。両PRはmergedではなく、関連comment（[#3418 comment 6279914948](https://github.com/RetryYN/HELIX-HARNESS/pull/3418#issuecomment-6279914948)、[#3418 comment 6280016444](https://github.com/RetryYN/HELIX-HARNESS/pull/3418#issuecomment-6280016444)、[#3419 comment 6280025182](https://github.com/RetryYN/HELIX-HARNESS/pull/3419#issuecomment-6280025182)）にはpush／Draftが当時の依頼scope外であり、close後にCodexが採用し直した経緯が記録されている。今回の見直しで当時のscope違反を遡って承認・完了にしない。

## 現行経路の状態と後続WI案

現行`scaffold/review-handoff/packet.py`は`PR_RUNTIMES = ("claude", "codex")`で、`validate`はauthor／reviewerをClaude・Codexの組に限定する。`gui_mailbox.py send`も同じ組を要求し、`bind`の`LANES`ではDevinを`worker`に限定する。従ってDevinをauthorとする`review_request`や、Devinの`execution` bindingは現在成立しない。運用文書だけでこの制約を通過できるものとして扱わない。

別WIでは、PR packet／通知経路を**Devin author → Claude reviewer**の一方向に限って成立させる案を提示する。最小の実装範囲は、`packet.py`のPR作成側・review側の組み合わせ判定とpacket生成、`gui_mailbox.py`のDevin author bindingおよび`review_request`送信判定、対応する正例・拒否例のselftestとREADME／SCF-B-0003の境界記述である。既存のClaude↔Codex経路を保持し、PRのauthor→reviewer組としてCodex→Devin、Claude→Devinを追加しない。これは既存の`work_request`／`work_result`経路を禁止・変更する意味ではない。Devin author bindingは現行のexclusive `execution` lane制約とCodexのexecution割当が競合しうる。この競合の扱いは未解決として残し、本WI-1bではexclusive制約を変更する案を作らない。Devin自身のreview・merge、Antigravityの作成・review経路も追加しない。Devin作成PRでClaudeからexact HEADの独立review responseが返るまでReady化できない運転を対象にする。別WIの判断・実装・検証が済むまで、この経路は利用可能と宣言しない。

## 対象外

- Antigravityの権限、一般的な第三者runtimeの権限、旧HIL-BR-32全体の変更。
- `packet.py`、`gui_mailbox.py`、README、selftest、Bindingのrole／obligationsの実装変更。
- PR #3418・#3419の遡及承認、merge状態の変更、Issue完了。
- 要求の意味、L3以下の承認、新しいmerge admission、release、tag、cutover、配布の許可。
