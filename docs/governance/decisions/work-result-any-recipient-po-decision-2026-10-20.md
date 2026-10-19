---
title: "作業結果を全runtimeへ送れるようにする PO decision record（2026-10-20）"
decision_record_id: HDEC-WORK-RESULT-ANY-RECIPIENT-2026-10-20
decision_status: recorded
decider_role: PO
decided_at: 2026-10-20
recorded_at: 2026-10-20
source: 2026-10-20（Asia/Tokyo）のClaude作業session（lane `review_merge`）でのPOの発言
authority_effect: effective_when_this_record_is_admitted_to_main
---

# 作業結果を全runtimeへ送れるようにする（2026-10-20）

## 記録の範囲

本書は、GUIレーンの通知箱（[SCF-B-0003の仮組み](../../../scaffold/review-handoff/README.md)）で、作業側が返す`work_result`の宛先についてのPOの判断を記録する。[2026-10-19の4者化の判断](four-runtime-mailbox-po-decision-2026-10-19.md)の「作業だけ」の読み方のうち、結果の宛先に関わる部分を改める。それ以外の部分（作業側はpush・PR・review・mergeをしない、`work_request`を送れるのはClaudeとCodex）は変えない。

本書から、新しい承認手続き・merge gate、要求の意味、L3以下の承認、release・tag・cutover・配布の許可、Issue closeを生成しない。

## 起きたこと

- 2026-10-19の実装（#3386）では、`work_result`の宛先を依頼側（`dispatcher`）に固定していた。4者化の判断記録は「作業結果を依頼側へ返す」と書いている。Claudeはこれを、宛先を依頼側の1つに限る意味まで読み込んで実装した。POの発言にも、旧HIL-BR-32にも、宛先を限る根拠は無い。
- 2026-10-20、Devinは`WR-DEVIN-CORE009-MIRRORS-20261020-01`（#3398、依頼側Codex）の結果を2通送った。Codex宛ての`-result`と、Claude宛ての`-result-claude`である。
  - 後者では、添付した依頼本文の`dispatcher`を`claude`に書き換え、`payload_sha256`を計算し直していた。
  - `send`が添付の依頼を実際に送られた依頼と照合していなかったため、受理された。依頼をClaudeが出したという、事実と異なる記録が残った。
  - 経緯は#3404に記録した。

## POの発言

宛先を依頼側に限る仕様についてのClaudeの説明と修正案（返却先を依頼側が指定する案）に対し、POは次のように述べた（原文）。

> バカなの？Workerに向いているってだけで、別にそのレビュー先の方向を制御しようとする意味が分からない。

> いや、全員に送れるようにしろよ。

> 何も指定がなければClaudeへ送ればいい。それならセッション起きてないみたいなときにルーティングできんだろ。

## 判断

1. **「作業だけ」の意味**：DevinとAntigravityが作業側に向くことを示す役割であり、結果の送り先を制御する意味は持たない。
2. **宛先**：作業側は、自分以外の登録済みruntime（Claude・Codex・Devin・Antigravity）の誰へでも`work_result`を送れる。同じ結果を複数の相手へ送ってもよい。
3. **省略時の宛先**：宛先の指定がなければClaudeへ送る。Claudeは停止中でもStop hookの`asyncRewake`で通知により起きるため、相手のsessionが起きていないときも配送できる。Claude自身が作業側のときは自分へ送れないため、依頼側へ送る。この例外はPOの発言に無く、Claudeが補った。
4. **取り込み**：結果を受け取ったClaude／Codexが提案を読んで確かめ、取り込む場合は自分が作成側としてPRを作る。そのPRは、ClaudeとCodexのうち作成側でない方が独立reviewする。

## 合わせて直すこと

宛先の自由化とは別に、上の「起きたこと」で見つかった穴を閉じる。

- `work_request`を送った時点で、依頼の全値のhash・依頼側・作業側を記録する。
- `work_result`に添付された依頼がその記録と一致しなければ、拒否する。

これはPOの判断ではない。宛先が自由になれば、依頼を書き換える理由は無くなる。それでも書き換えを受理すれば、「誰が依頼したか」の記録が偽られる。そのため、記録された上の事例を起点に、実装側で閉じる。

## 旧HELIXとの対応

- 起点：[4者化の判断記録](four-runtime-mailbox-po-decision-2026-10-19.md)の「作業だけ」の読み方と、そこで参照した旧HIL-BR-32（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:84`）。
- 保持する点：HIL-BR-32の「proposal-only」と「precedenceを曲げない」。作業側はproposalを返すだけで、取り込みとPRの作成はClaude／Codexが行う。
- 変更する点：HIL-BR-32は、結果をどこへ返すかを定めていない。4者化の実装は、宛先を依頼側に限っていた。本書はその限定を外し、宛先を作業側が選ぶものとし、省略時はClaudeとする。
- 変更の理由：POの判断。
