---
title: "開発の規律に当たる要求を1.0に入れる PO decision record（2026-10-10）"
decision_record_id: HDEC-DISCIPLINE-REQUIREMENTS-INTO-1.0-2026-10-10
decision_status: recorded
decider_role: PO
decided_at: 2026-10-10
recorded_at: 2026-10-10
source: 2026-10-10（Asia/Tokyo）のClaude作業session（lane `review_merge`）でのPOの発言と選択
authority_effect: effective_when_this_record_is_admitted_to_main
---

# 開発の規律に当たる要求を1.0に入れる（2026-10-10）

## 記録の範囲

本書は、採択済みで1.0の範囲から外れていた要求のうち、開発の規律に当たる43件を1.0に入れるPOの判断を記録する。

本書は対象要求の版だけを決める。要求の意味、採択したrevision、L2・L11の本文は変えない。新しい承認手続き・merge gate、L3の再開、実装、CI、release、内部デプロイも生成しない。

## 経緯

- [実装順序のPO選択記録](implementation-order-po-decision-2026-10-03.md)52–59行は、採択374件を版で分けた。版未指定の62件については「対象版を本記録で選ばず、1.0への自動収載も行わない」とした。
- その根拠は[残り11候補のPO判断](po-decision-2026-09-29-11candidates.md)42行の「採択によって`version_target: 1.0`へ変更しない」である。
- HARNESS-L2-001〜009は、[HELIX-HARNESS要求のPO判断](helix-harness-requirements-po-decision-2026-09-28.md)66行で、routing条件として合意された。374件とは別の分母に置かれ、版はどの記録にも付いていない。
- 版を決め直す問いは、その後POへ出されなかった。その結果、命名規律（HARNESS-L2-048）とDesign Template（HARNESS-L2-009）を含む規律の要求が、L3の対象とした274件の1.0 rosterから外れた（[巻き戻しの判断記録](rollback-to-requirements-closure-po-decision-2026-10-10.md)34行、108行）。

## POの発言と選択（原文）

Claudeが「048・009などの規律の要求を1.0に入れるか」と問い、POは次のように答えた。

> 入れる

ClaudeはAskUserQuestionで範囲を問い、POは次を選んだ。

> 問い：「採択済みなのに1.0から外れてる要求が見つかった。版未指定が62件、後続版・Web条件付きが38件（こっちは版が決まってるから対象外）、ほかにHARNESS-L2-001〜009の「routing条件」がある（009はここ）。1.0に入れる範囲はどれにする？」
>
> POの選択：「規律だけ、一覧を確認 (Recommended)」

Claudeは、版未指定の62件とHARNESS-L2-001〜009を本文から分類し、一覧をPOに示した。そのうえで、判定が分かれる15件の扱いを問い、POは次を選んだ。

> 問い：「規律に当たる28件を1.0に入れる。どちらとも言える15件はどうする？」
>
> POの選択：「15件も1.0に入れる (Recommended)」

分類の基準、各要求の判定、L2本文の根拠は、[分類の監査記録](../audits/requirements-stage/discipline-requirements-1.0-classification-2026-10-10.md)にある。

## 判断：1.0に入れる43件

### 規律に当たる28件

| 機構 | 要求 |
|---|---|
| HELIX-HARNESS（routing条件） | HARNESS-L2-001、003、004、005、008、009 |
| HELIX-HARNESS（版未指定） | HARNESS-L2-048、050、051、053、055、056、057、058、060、063、068、072、077、078、080、081、082、083、084 |
| HELIX-OS（版未指定） | HELIXOS-L2-001（`MPR-RC-HELIXOS-L2-001-001`、HIL-NFR-32の6条件）、054、101 |

### 判定が分かれたが入れる15件

| 機構 | 要求 |
|---|---|
| HELIX-HARNESS（routing条件） | HARNESS-L2-002、007 |
| HELIX-HARNESS（版未指定） | HARNESS-L2-059、062、085 |
| HELIX-OS（版未指定） | HELIXOS-L2-053、055、106、109、110、111、113、124、127 |
| HELIX-BRAIN（版未指定） | HELIXBRAIN-L2-031 |

- 各要求は、採択または合意したrevisionのまま版を1.0にする。新しいrevisionの採択は生成しない。
- 次の版は変えない。
  - 版未指定のうち規律に当たらない27件：HARNESS-L2-052、065、067、079、087、088、HELIXOS-L2-102、103、104、105、107、108、115、117、118、119、120、121、122、123、125、126、128、129、130、131、132。
  - routing条件のHARNESS-L2-006。
  - 後続版35件とWeb条件付き3件。
- HELIXOS-L2-053の本文は、正本を「Markdown上のcanonical本文」としている（`docs/helix-os/L2-requirements/governance-requirements.md` 1246行）。これは[JSONを正本とする方針](brain-helix-core-po-intent-2026-09-25.md)と食い違う。この食い違いは、要求の意味の修正として別に扱う。本書は053の意味を変えない。

## L2本文の版の印

L2本文には、対象要求の版について「版は未指定のままPO判断に残す」などの記載が残っている。これらの記載は、本書の後に版の印を1.0へ直す。直すのは版の印だけで、要求の意味は変えない。

## 旧HELIXとの対応

| 旧source | 保持する点 | 変える点 |
|---|---|---|
| 旧`CLAUDE.md`「HELIX 再構築方針」「precedence（拘束原則）」（`archive/legacy-generation-2026-09-14/root/CLAUDE.md` 49–63行）：仕組み（Vモデル工程・gate・harnessルール）を個別機能より上に置く | 仕組みに当たる要求を、個別機能より先に同じ版へ入れる | 規律の要求を版の印の有無で落とさないよう、版をPO判断で明示する |

## 本書から生成しないもの

- 要求の意味の変更、新しいrevisionの採択、L2・L11本文の意味の変更。
- L3の再開、およびL3の順序・範囲。巻き戻しの判断記録に従い、POの指示を受けてから決める。
- 新しい承認手続き・merge gate。
- 実装、CI、release、内部デプロイ。
- Issue close。
