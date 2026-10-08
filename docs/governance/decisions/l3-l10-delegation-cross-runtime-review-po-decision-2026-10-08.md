---
title: "L3／L10委任承認を作成と別系統の独立reviewへ改め、Fableをエスカレーション先にする PO decision record（2026-10-08）"
decision_record_id: HDEC-L3-L10-DELEGATION-CROSS-RUNTIME-2026-10-08
decision_status: recorded
decider_role: PO
decided_at: 2026-10-08
recorded_at: 2026-10-08
source: 2026-10-08（Asia/Tokyo）のClaude作業session（lane `review_merge`）でのPOの発言
authority_effect: effective_when_this_record_is_admitted_to_main
---

# L3／L10委任承認の改定：作成と別系統の独立review（2026-10-08）

## 記録の範囲

本書は、[2026-10-05のL3／L10承認の委任判断](l3-l10-approval-delegation-po-decision-2026-10-05.md)（SHA-256 `9028384fe51660c6785dc55e034bbd887702fd53b00bd9fd16641e7b6d8c2220`）の、承認が成立する条件だけを改める。2026-10-05の記録は書き換えない。委任の範囲（L3／L10に限る。Concept、L1、L2は人が判断する）と、POの事後確認は変えない。

あわせて、L4共通設計の起草の前に決める論点のうち、POが推奨どおりとした2件を記録する。

本書から、新しい承認手続き・merge gate、L10の実行・合格、実装・内部デプロイ・release・tag・cutover・配布の許可、Issue closeを生成しない。

## POの発言

2026-10-08、Claudeが「独立性の要件（K9）」「意味revisionの判定（G4）」「版と段階の対応（F）」の3論点と推奨を示した。POは次のように述べた（原文）。

> SOLになければいいじゃん。ほかはおすすめでいいよ。あと毎回Fableレビューはダルい。

Claudeが「SOLになければ」の意味を、選択肢を示して確かめた問いに対し、POは次のように答えた（原文）。

> そもそもクロスレビューしてんじゃん。作業者とレビューの分離入ってんだろ？

続けて、POは次のように述べた（原文）。

> あとSol6.1だからな。

> Fableはエスカレーション。

## 判断1：委任承認の成立条件を、作成と別系統の独立reviewへ改める

### 改定前（2026-10-05）

OpusとFableの見解が一致した場合に成立する。一致とは、Opusの独立reviewが`no_findings`、Fableが同じ本文revisionで承認を止める問題がないと結論、その後に6文書のbytesが変わっていないこと。

### 改定後

次の三つが、同じ対象の本文revisionについてそろった場合に成立する。

1. **作成と別系統の独立review**：作成側（content producer）とは別のruntimeで、別のmodel familyに属するreview側が、exact base／content HEADを独立にreviewし、承認を止める問題がない（`no_findings`）と結論している。現行の運用では、Codex（OpenAI系。現行モデルはSol 6.1）が作成した本文をClaude（Anthropic系）が、Claudeが作成した本文をCodexがreviewする。
2. **系統の記録**：review commentに、作成側とreview側のruntime、model family、モデル名と版を記す。同じ系統どうしのreviewは、この条件を満たさない。
3. 1の後で、6文書のbytesが変わっていない。

### Fableの位置づけ

Fable（Claudeのadvisor）は毎回のreviewに入れない。次の場合のエスカレーション先とする。

- 作成側とreview側の判断が分かれて解けない場合。
- review側が、固定親との対応や要求の意味の判断に迷う場合。
- 不可逆・高影響の操作の前に、確認が必要な場合。

Fableの結論は助言として記録する。Fableが承認を止める問題を挙げた場合は、review側が固定親に照らして確かめ、妥当なら作成側へfindingとして返す。それでも解けない場合は、両方の見解を添えてPOへ上げる。

### 記録

- 判断記録の`decider_role`は`PO（委任：作成と別系統の独立review）`とする。
- 判断記録には、本書、2026-10-05の委任判断記録、独立reviewの結論commentのIDと取得したbodyのSHA-256、作成側とreview側の系統、承認対象の本文revision、6文書のSHA-256を固定する。
- review側は、利用できる場合、`scaffold/l3l10-checks/`の検出器（`SCF-B-0157`）を実行し、receiptの結果をreview commentに添える。検出器は違反の検出器であり、合格条件ではない。

### 経過措置

本書がmainへ入る前に、2026-10-05の条件（OpusとFableの一致）で成立した承認は、そのまま有効とする。本書がmainへ入った後に新しく承認する本文revisionから、改定後の条件を使う。

## 判断2：意味revisionの判定（G4）

意味が変わらなければ下流を無効にしない仕組み（backdating）の前提となる「意味revisionの不変」について、機械による判定器ができるまでは、本文のbytesが変われば常に「意味が変わった」として扱う（安全側）。判定器ができた時点で、その判定器を版とdigestで固定し、置き換える。

## 判断3：版と段階の対応（F）

人の関与を段階的に減らす計画（Phase 0〜4）と、段階リリース（HELIXOS-L2-014）を、次のように対応させる。

- Phase 1（L3／L10の承認で、機械検査が主になる）の条件がそろった時点で、段階リリースv0.1の成立（release）とする。
- v0.1を自己開発に使い始めること（内部デプロイ）は、release とは別の事象である。[内部デプロイの判断記録](stage-release-internal-deployment-po-decisions-2026-10-07.md)の方針1のとおり、対象と作用を明示したPOの許可を要する。本書はその許可を含まない。
- 旧ADR-009（自動fallback禁止、明示rollbackのみ）と、Phase 2〜3の自動切戻しの差は、Phase 2へ移る判断の時に改めて扱う。本書では変えない。
- Phase 1の条件の具体（機械検査の範囲、過去のMajorの回帰コーパスでの検出、検査器の配線と実行の証拠）は、L4共通設計で定め、別に確認する。

## 旧HELIXとの対応

| 旧source | 保持する点 | 変える点 |
|---|---|---|
| 旧`CLAUDE.md`（`LEGACY-ASSET-6EBDB617A8104A7756D0`、SHA-256 `7bdfc0bc578359e42efae4242ee42b53abd6e2ec23874f1294d3ec0e278c8feb`）195–197行「GitHub 自走運用」：人のapproveを不要とし（PO明示承認）、品質ゲートをCIとharness内のクロスランタイムreview evidenceに置いた | 人のapproveの代わりに、異なるruntimeのreview証拠を品質ゲートにすること | 対象をPRのapproveから、L3／L10の対象revision承認へ広げる（2026-10-05の判断で既に広げた点は保持）。2者目を同じ系統のFableから、作成と別系統のreview側へ替える |
| `LEGACY-ASSET-A04F169C5D514C5443D0` `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/producer-provenance-separation-requirements.md` 28–34行 PPS-R-03（SHA-256 `9f1e268986845f5f209517de24f57f2828e130f971a1429be96d0f88a5e9d59a`）：独立性はcontent producerのruntime／provider／model family／sessionとの関係で判定し、同一producer系統のreviewをterminal evidenceにしない | 独立性を作成側との系統の違いで判定すること | なし（このsourceの意味を、L3／L10委任承認の成立条件として再導出する） |
| `LEGACY-ASSET-D107FD145A2588FAAD09` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/worker-independent-review.md` 17–30行（SHA-256 `9fff293ed71c7a0be0e4dfcd7a5cca70eaacfdbf2cd553a605fd15510a3c99b3`）：同じprovider／modelでも、identity、session、contextの3軸が独立なら受理する | identity・session・contextの分離を記録すること | 旧HELIX内で、model familyを独立性の要件とするか（PPS-R-03）、記録だけとするか（本source）が食い違っていた。本書はPPS-R-03に寄せ、作成と同じ系統どうしのreviewを独立reviewとしない |

変更の理由は、POの指示（「そもそもクロスレビューしてんじゃん。作業者とレビューの分離入ってんだろ？」「毎回Fableレビューはダルい」「Fableはエスカレーション」）である。作成と別系統のreviewで独立性が満たされているため、同じ系統の2者目を毎回入れる必要がない。

## 本書から生成しないもの

新しい承認手続き・merge gate、L2の変更、L10の実行・合格、v0.1の宣言、実装・運転・内部デプロイ・release・tag・cutover・配布・外部公開の許可、Issue close。
