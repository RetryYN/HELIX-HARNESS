---
title: "bounded probe履歴 L9 system test設計"
layer: L9
artifact_type: test_design
status: draft
created: 2026-08-17
updated: 2026-08-17
owner: Codex / TL
plan: docs/plans/PLAN-L7-582-bounded-probe-history.md
pair_artifact: docs/design/helix/L4-basic-design/bounded-probe-history.md
---

# bounded probe履歴 L9 system test設計

## 実行境界

受理済みNFR identity、current HEAD、dataset digestからprobe portを経て、bounded result、append-only
history、replayへ至るNode経路を対象とする。#220のpure evaluatorは呼び出さず、#188のrouting／allocationも
consumer境界として別管理する。

## system oracle一覧

1. current identityとallowlistが一致するprobeだけが実行され、network／credentialがdeny／noneとなる。
2. portのAbortSignal、deadline、CPU、memory、output、sample上限を越えた実行／resultは受理されず、greenへ縮退しない。port例外もfail-closeする。
3. event、前event digest、sequence、headが同一transactionで収束し、再送は同一payloadだけ冪等となる。
4. DB再open後のreplayが同じchainを返し、直接更新・削除・head改ざんをfail-closeする。
5. requirement、release、regression、improvement episodeのjoin keyがeventから失われない。

## 後続境界

#221の履歴は#193のNFR measurement contractと#188のrouting／allocationへ入力として渡す。履歴を理由に
thresholdやrouting decisionをこのsliceで推測しない。
---
