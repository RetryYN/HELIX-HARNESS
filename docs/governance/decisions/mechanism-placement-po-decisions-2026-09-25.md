---
title: "機構ごとの要求候補の配置と分類の修正 decision record（2026-09-25）"
decision_record_id: HDEC-MECHANISM-PLACEMENT-2026-09-25
decision_status: recorded
decider_role: PO
decided_at: 2026-09-25
recorded_at: 2026-09-25
source_repository_revision: 8e37e3c944765a830f88d59d5412cc10bf3e993d
authority_effect: effective_when_this_record_is_admitted_to_main
follow_up: PO最適ドラフトPR（全要求を最終的に詰める後続PR）
---

# 機構ごとの要求候補の配置と分類の修正（2026-09-25）

## 記録の範囲

2026-09-25（Asia/Tokyo）のClaude作業sessionで、POが示した配置と分類の判断を記録する。
POの発言はそのまま引用する。AIの整理は、引用と区別して書く。
本記録から、要求・要件の承認、L3凍結、実装許可、release、Issue closeを生成しない。
移した候補は、移す前の状態（draft_candidate等）を保つ。

## POの発言と判断

POは「要求整理まで終わったんだっけ？分類の修正は必要そう？物理的にディレクトリ分けているから配置を変えたほうがよくない？」と問うた。
AIが分類のずれと配置案を示し、POが次のとおり選んだ。

| 論点 | AIが示した選択肢 | POの判断 |
|---|---|---|
| HELIX-Web・HELIX-Web-OSの文書の置き場所 | 各機構の下の`vision/`へ移す、Concept側へまとめる、動かさない | 「なんでそれを触ろうと思ったのかその発想が正直信じられない。」。Web・Web-OSの文書は触らない |
| OSの要求にある、担当がLABO・Intelligenceの項目 | 機構の候補置き場へ移す、先に両機構のL1を起こす、OSに置いたまま印だけ付ける | 機構の候補置き場へ移す |
| `docs/governance/candidates/`にある機構の要求候補 | 担当する機構のフォルダへ移す、今は動かさない | 担当する機構のフォルダへ移す |
| 進め方 | 別のPRで今すぐ行う、PO最適ドラフトでまとめて行う | 別のPRで今すぐ行う |
| HARNESSとOSにまたがる候補 | 機構ごとに文書を分ける、主な機構に1つで置く | 機構ごとに文書を分ける |
| 設計template system | HARNESSとBRAINに分ける、HARNESSに置く、BRAINに置く | BRAINに置く |
| 技術調査 | Intelligenceが発行しLABOが研究、BRAINに置く、LABOに置く | LABOに置く |
| 旧Bugbot由来の限定修復 | 発行はIntelligence・実行統制はOS、全部Intelligenceへ移す、OSに残す | 全部Intelligenceへ移す |

次の2点は、AIが一覧で案として示し、POは個別に選ばなかった。AIの案のとおりに進めた。

- 監査・学習・成果の出所の節は、監査（AAFD）をIntelligence、学習（RCLS）をLABOへ移し、成果の出所（PPS）はOSに残す。
- 再構築の進め方に関する候補（旧資産の退役、旧ルール群から導いた要求、Scaffold Binding）、OS編成案の取込記録、退役済みのticket導出候補は、`docs/governance/candidates/`に残す。

## 配置の変更

### 移した候補ファイル

| 元のpath | 移した先 | 移す前のSHA-256 |
|---|---|---|
| `docs/governance/candidates/design-template-system-requirements.md` | `docs/helix-brain/candidates/design-template-system-requirements.md` | `761465218e29b0b3f4c07021262ee2c263d731943babb9583f12ad685ca45e92` |
| `docs/governance/candidates/requirement-engine-python-core-requirements.md` | `docs/helix-harness/candidates/`（HARNESS要求）と`docs/helix-os/candidates/`（REQENG-OS-001〜007）へ分けた | `3516e26747ec2c97586f0b0324033144a46b3351629422c9079f59a919b74425` |
| `docs/governance/candidates/semantic-density-python-extraction-policy.md` | `docs/helix-harness/candidates/semantic-density-python-extraction-policy.md` | `7c352f567288d56ae9a355425cc06cc1d1be0a83aa6fab2a6fc6e7d11c3e91aa` |
| `docs/governance/candidates/ai-readable-authority-requirements.md` | `docs/helix-os/candidates/`（OS要求と共通の節）と`docs/helix-harness/candidates/`（AIDOC-HARNESS-001〜003）へ分けた | `4121203ec2fc7d746a138a90f5523fa71cfe3a36e63849e13d668c7c94155f6f` |
| `docs/governance/candidates/next-generation-ci-requirements.md` | `docs/helix-os/candidates/`（OS要求と共通の節）と`docs/helix-harness/candidates/`（NCI-HARNESS-001〜004）へ分けた | `0a79006c6e7ddf6ad7dcdb78115de1d416727fd215cee078527f441e0b83b312` |
| `docs/governance/candidates/wbs-ledger-requirements.md` | `docs/helix-os/candidates/`（OS要求と共通の節）と`docs/helix-harness/candidates/`（WBS-HARNESS-001とそのL11候補1項目）へ分けた | `34711045caea9a6bac6fa1084b056e393593efe76099b7f124af4e17265a84f6` |

分けるときは、要求の行と受入候補の行の文言を変えていない。共通の節（目的、責務の分け方、停止条件）は、要求の多いほうの文書に残し、分けた先からリンクした。

### OSの要求案から移した項目

| 項目 | 移した先 | OSに残したもの |
|---|---|---|
| HELIXOS-L2-005のうち改善の評価と研究 | [LABOの候補](../../helix-labo/candidates/improvement-research-requirements.md) | 改善候補の登録と還流先への振り分け |
| HELIXOS-L2-012（技術調査）とHELIXOS-L1-011、対のL11行 | 同上 | 移管先を示す案内行（IDを保つ） |
| HELIXOS-L2-013（同じ仕事の横断診断）とHELIXOS-L1-012、対のL11行 | 同上 | 移管先を示す案内行（IDを保つ） |
| 監査・学習・成果の出所の節のうち学習（RCLS）と、その受入条件 | 同上 | — |
| 監査・学習・成果の出所の節のうち監査（AAFD）と、その受入条件 | [Intelligenceの候補](../../helix-intelligence/candidates/audit-bounded-repair-requirements.md) | 成果の出所（PPS）の節と受入条件 |
| 限定修復の統制条件の節と、その受入条件 | 同上 | 移管先を示す案内 |

HARNESSの要求案「限定修復に適用する検証条件」の「修復の実行統制はHELIX-OSが所有する」は、移管先を示す文に改めた。修復後に維持する検証義務はHARNESSに残した。

移管した行の他の要求から「HELIXOS-L2-001／002／007／013」のように参照されている箇所は、案内行が同じIDで残るため、書き換えていない。

## 旧HELIXとの対応

- **旧source**：旧HELIXは、要求候補を`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/`の1か所に置いた（92文書）。設計文書は`docs/design/harness/`と`docs/design/helix/`に、対象ごとに分けていた。
- **保持する点**：候補の状態、ID、文言、出典、承認記録は変えない。候補を要求（L2）として扱わない。
- **変更する点**：機構の要求候補を、担当する機構のフォルダの`candidates/`へ置く。HARNESSとOSにまたがる候補は、機構ごとの文書に分ける。再構築の進め方に関する候補は、`docs/governance/candidates/`に残す。
- **変更理由**：POの判断による。現行は機構ごとにフォルダを分けているため、担当する機構のフォルダを見ればその機構の候補が分かるようにする。

## 承認済みrevisionへの影響

- WBS台帳の候補は、2026-09-19にSHA-256 `34711045…`の本文が承認されている（`HDEC-L2D-S0-02`）。2文書へ分けた後の本文は、その承認対象とは別のrevisionである。要求の行と受入候補の行の文言は変えていない。
- HELIX-OSのL1は、[2026-09-24のPO判断](concept-requirement-po-decisions-2026-09-24.md)で本文SHA-256 `ffbafa47e5b218c4ddfdd170e4ba7c12cd6cdfe518fbdcce5ccbbee7e0b151bc`をPOが採用している。本記録で変えたのは、そのbytesのうちHELIXOS-L1-011とL1-012の2行（移管先への案内行にした）だけである。
  - 変更後のbytesは採用済みrevisionとは別のrevisionであり、9/24の採用を変更後のbytesへ自動では引き継がない。
  - 2行の移管は、本記録のPO判断（OSの要求にある担当がLABOの項目を機構の候補置き場へ移す）による。新しい承認手続きは作らない。
  - 変更後の本文は、HARNESS L1の1.0土台の追記と同じく、PO最適ドラフトPRで対象revisionを確認する。

## 変更しなかったもの

- HELIX-Web・HELIX-Web-OSの文書（POの判断）。
- 判断記録、監査記録、source holding、snapshot（例：`docs/governance/phase-capability-inventory.json`の`current_evidence_snapshot`、`scaffold/`配下の証拠）にある元のpath。これらはその時点の記録であり、書き換えない。元のpathは上の表で新しいpathへ辿れる。
- 要求対応表（`docs/governance/crosswalks/concept-mechanism-version-requirement-crosswalk.jsonl`）と現行L2分類台帳（`docs/governance/current-l2-structure-classification.jsonl`）の該当行。後続のPO最適ドラフトで、判断の列とあわせて直す。

## 未確定の点

後続のPO最適ドラフトPRで確認する。

- **設計template systemの本文**：本文は移す前のまま、「HARNESSがtemplateを提供し、HELIX-OSが登録・改善を管理する」と書いている。BRAIN（汎用のパターン）、ヘリックスコア（製品固有の意味）、OSの分担に合わせて、文言をそろえる。
- **技術調査とクローラー**：技術調査の置き場所はLABOとした。一方、[BRAIN・ヘリックスコアのPO指示](brain-helix-core-po-intent-2026-09-25.md)では、Intelligenceがクローラーを発行するとしている。両者の関係を、LABOとIntelligenceのL1で詰める。
- **限定修復の実行統制**：検出から実行までをIntelligenceへ移した。OSの推進・検収との接点（許可、隔離適用、検収）をどう持つかは、IntelligenceのL1で詰める。
- **LABO・BRAIN・IntelligenceのL1**：3つとも企画（L1）がない。候補は、L1ができた後に要求として採否する。
