---
title: "旧要求・旧asset直接semantic review wave 1 review応答"
status: review_response
authority_effect: none
review_request_id: RH-1913-GUI-01
reviewed_content_sha: ef085d5c2246fcf04dc655fb8467044b8437f856
---

# 旧要求・旧asset直接semantic review wave 1 review応答

## 対象

Claude GUI review laneから受領した`GUI-1913-RESPONSE-01`を、PR #1913のcontent SHA `ef085d5c2246fcf04dc655fb8467044b8437f856`に対するreviewとして処理した。結果は`incomplete`、指摘はMajor 3件、Minor 2件、Info 1件であった。

本応答は指摘処分の記録であり、要求採否、phase採否、旧asset再利用、実装開始、merge許可を生成しない。

## 指摘処分

| finding | 処分 | 修正 |
|---|---|---|
| `MAJOR-1913-01-01` | 対応 | BR-01の要求edgeを、別要求のAuthoring契約から原文所在asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`へ差し替えた。同一要求IDの逐語契約であることと、非実行の要求source snapshotで実装証拠ではないことを分離した。 |
| `MAJOR-1913-01-02` | 対応 | schema revision 2でatom ID、引用index、match mode、required termを追加した。verifierは引用digestに加え、引用本文へのliteral fragmentまたはcontrolled term出現を検査する。意味判断の独立導出ではない限界も方法書へ明記した。 |
| `MAJOR-1913-01-03` | 対応 | unitごとにatom inventory、confirmed／unresolved／uncovered exact setとcanonical digestを持つcoverage receiptを追加し、ledgerから再計算する検査を加えた。 |
| `MINOR-1913-01-01` | 対応 | BR-01の原文所在assetを本waveで優先reviewし、元の誤ったrequirement edgeと置き換えた。 |
| `MINOR-1913-01-02` | 対応 | `fail-closeする`を単独atomにせず、各triggerと述語を一体のatomに分割した。agent guardのconfirmed coverageは未登録agentとmodel/effort overrideに限定した。 |
| `INFO-1913-01-01` | 対応 | `EXPECTED_DECISIONS`は意味導出器ではなくreview判定のregression pinであると方法書へ明記した。 |

## 追加の保守的訂正

`agent-ssot-runtime-projection.ts`はdriftを検出するが、user-modified driftをwarning＋skipとするため、FR-12の「手編集driftをfail-closeする」直接対応を`confirmed`から`unresolved`へ訂正した。`worker-context-packet.ts`もpath集合の検査までは確認できるが、実access enforcementのconsumerを確認できないため`unresolved`を維持した。

この結果、6 edgeは`confirmed` 2、`rejected` 1、`unresolved` 3となる。直接部分実装証拠はOSのagent guard 1件だけである。HARNESSのconfirmed edgeは要求契約一致であり、実装証拠には数えない。

## 検証境界

archiveのsource、runtime、hook、test、CI、adapterは実行していない。静的検査では入力revision、archive bytesとmanifest、引用行、atom束縛、coverage receipt、未review集合、過大主張防止を検査する。consumer closure、旧実行可能性、現行replacement、要求やphaseの採否は未確認のままである。
