---
title: "失敗の上に再編し、失敗から学んで最適化する開発の原則 PO decision record（2026-10-09）"
decision_record_id: HDEC-LEARN-FROM-FAILURES-2026-10-09
decision_status: recorded
decider_role: PO
decided_at: 2026-10-09
recorded_at: 2026-10-09
source: 2026-10-09（Asia/Tokyo）のClaude作業session（lane `review_merge`）でのPOの発言
authority_effect: effective_when_this_record_is_admitted_to_main
---

# 失敗の上に再編し、失敗から学んで最適化する開発の原則（2026-10-09）

## 記録の範囲

本書は、POが示した開発の原則を記録し、`AGENTS.md`「再構築の原則」に置く。

本書から、Concept・L1・L2の変更、新しい承認手続き・merge gate、外部repositoryの規則や本文の現行への複写、実装・release・内部デプロイを生成しない。

## 経緯

Claudeは、運用モデルの改訂の材料として、POが示した開発repositoryを読み取りで調べた。読んだのは、前身harness `unison-ai-product/UT-TDD_AGENT-HARNESS` と、`RetryYN/ProFine`、`RetryYN/HELIX-WP-THEME`、`RetryYN/HELIX-WP-HARNESS`、`RetryYN/HELIX-VIDEO-STUDIO`である。いずれも、旧HELIXの規律から派生して実際に運用されたrepositoryで、HELIXの現行の作業で起きている失敗と同じ型の失敗が記録されていた。例えば次のものである。

- worktreeとbranchの放置
- 通知の終端状態が無いことによる再起床
- チケットの書き戻しと依存によるgateの肥大
- 並行PRによる連番の取り合い
- 検査がCIで起動していないこと
- 規則の追加による入口文書の肥大

POは、これらのrepositoryについて次のように述べた（原文）。

> これは旧HELIXの規律を参考に開発を進めながらチケット方式で実プロダクトで回しながらハーネスを強化しているプロジェクト。これも参考になると思われる。おれのギットハブのなかにはかなり検証も踏まえた開発レポがあるから見たほうがいいぞ。チケット方式で踏む可能性や画面系のトラブル例もわかりやすい。

続けて、POは次のように述べた（原文）。

> HELIXの現行開発はこれらの失敗のうえに再編されていることを原則として置け。失敗から学んで最適化するシステムであること。

## 判断：開発の原則

- 現行のHELIXは、旧HELIXと、旧HELIXの規律から派生して実際に運用された開発repositoryで起きた失敗の上に再編している。
- HELIXは失敗から学んで最適化するシステムであり、開発もその原則で進める。規則、運用、設計を追加・変更・提案するときは、同じ種類の失敗の事例を確かめて起点にし、同じ失敗を繰り返さない形にする。
- 事例のない予防の規則は足さない。機構が成立した運用規則は減らす。手順は[GitHub上流運用モデル](../github-upstream-operating-model.md)「運用規則の置き場と、機構への移管」による。
- 派生repositoryは、旧HELIXの台帳資産ではない。事例はrepository、commit、Issue／PR番号で引く。規則や本文を現行へ写さず、旧HELIXと同じく保持する点と変える点を記録する。

[Concept](../../concept/helix-concept.md)の目標2「開発するほど賢くなる自己知能型改善システム」と「計測」（品質、費用、時間、再作業、失敗を測る）は、製品としてのHELIXの側の同じ方向の記述である。本書は開発の進め方の原則を記録するものであり、Conceptを変えない。開発repositoryの運用規則を製品の要求の根拠にしない（2026-10-08の[判断記録](l4-l6-design-unlock-and-common-kernel-trace-po-decision-2026-10-08.md)の判断3）。

## 旧HELIXとの対応

| 旧source | 保持する点 | 変える点 |
|---|---|---|
| `LEGACY-ASSET-A127DEC3EEE6ED63CF17`／`archive/legacy-generation-2026-09-14/root/docs/governance/predecessor-harness-full-weakness-audit-2026-07-20.md`（弱点ledger 65–101行）／SHA-256 `bab121404c956a0a4b403e589bea1c414af59b5996989bea5fab9f98f42f6872` | 前身harness（`unison-ai-product/UT-TDD_AGENT-HARNESS`）の全弱点を監査し、HELIXへ持ち込まない対象として台帳化したこと | 監査の対象を前身harnessの一時点から、旧HELIXの規律から派生して運用されたrepository群の失敗の事例へ広げる。旧の要件化（UTH-FR）の旧runtime・DB前提は採らない |
| `LEGACY-ASSET-C4B746501A6562E3F8B4`／`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/predecessor-harness-mechanism-hardening-requirements.md`（1–30行の目的と非変更契約）／SHA-256 `c0978eae37f6c7c8e113191404c0fd76328818e438b0ea5b3cf98ebd489a6639` | 前身の弱点をHELIXへ持ち込まないための差分要件を作ったこと | 差分を一回の要件化で閉じず、規則・運用・設計の追加ごとに事例を起点にする原則として置く |
| `LEGACY-ASSET-B8D84651753481B5F2B9`／`archive/legacy-generation-2026-09-14/root/docs/governance/operations-rule-audit-2026-07-26.md`（3–6行の目的）／SHA-256 `d32bb1a780a36cd0710cbd58d575e900ac14c154a0e84f5dc92423b46c01466e` | 新しい統制を増やさず、既存の正本へ運用面を収束させること | なし |

## 本書から生成しないもの

Concept・L1・L2の変更、新しい承認手続き・merge gate、外部repositoryの規則・本文の複写、外部repositoryへの書込み、実装、release、内部デプロイ、Issue close。
