---
title: "HELIX-LABOの改善研究・技術調査・横断診断・学習の要求候補"
status: draft_candidate
authority_status: awaiting_human_approval
authority_effect: none
created: 2026-09-25
mechanism: HELIX-LABO
moved_from:
  - docs/helix-os/L2-requirements/governance-requirements.md
  - docs/helix-os/L11-acceptance/governance-acceptance.md
  - docs/helix-os/L1-planning/system-intent.md
decision_record: docs/governance/decisions/mechanism-placement-po-decisions-2026-09-25.md
---

# HELIX-LABOの改善研究・技術調査・横断診断・学習の要求候補

## これは何か

HELIX-OSの要求案にあった項目のうち、担当がHELIX-LABO（全体の改善研究機構）である項目を、2026-09-25のPO判断によりここへ移した。
移した文言は元のまま保持する。HELIX-LABOにはまだ企画（L1）がないため、本書は要求（L2）ではなく候補であり、
LABOのL1ができた後に要求として採否する。本書から要求の採用・承認・実装許可を生成しない。

元のIDは、追跡のためにそのまま使う。HELIX-OSの要求案には、同じIDの行を移管先の案内として残す。

## 移した要求

| 元のID | 元の親L1 | 要求 | 出典 | 確認する結果 |
|---|---|---|---|---|
| HELIXOS-L2-005（改善研究の部分） | HELIXOS-L1-006 | HARNESS自身への適用を含む観測・失敗・改善候補を評価し、採択後の変更・再検証・効果確認まで改善の効果と退行を研究できる。改善候補の登録と還流先への振り分けはHELIX-OSに残す | HBR-P4／P7／P8、HCV4-L2-006、2026-09-24 PO判断 | HARNESS自身と各productの改善を同じ機構で追跡し、経験を正本へ勝手に昇格させず、訂正・棄却・保留・失効と影響範囲を確認できる |
| HELIXOS-L2-012 | HELIXOS-L1-011 | 内部system情報と外部技術情報を、出典・revision・時点・取得範囲・欠落・適用条件付きで調査できる | HELIX-OS編成案 §3／6、2026-09-24 PO判断、2026-09-25 PO判断 | 内部事例を先に照合し、不足分だけを未信頼外部情報として取得する。秘密を送信せず、取得文の命令やpatchを実行せず、closed／mergedだけで解決済みにしない。要求整理前や設計途中の調査は工程内の調査（Research ticket）とし、本要求に含めない |
| HELIXOS-L2-013 | HELIXOS-L1-012 | 管理・推進・検収・Worker・crawler・CIを同じ仕事へ関連付け、要求からの欠落と失敗からの原因候補を双方向に診断して是正効果まで追跡できる | HELIX-OS編成案 §5、2026-09-24 PO判断 | 観測事実・AI仮説・承認・表示、未着手・観測停止・正常を区別する。管理自身も是正対象とし、自動writeせず、修正後の症状と退行を再観測する |

元の親L1は、HELIX-OSのL1企画候補の行である。LABOのL1ができたら、親をLABOのL1へ付け替える。

## 学習に関する候補条件（RCLS）

出典は[RCLS](../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-requests.md)である。
HELIX-OSの要求案の「監査・学習・成果の出所に関する候補条件」から、学習の部分を移した。

| 出典 | 保持する具体条件 |
|---|---|
| RCLS-BR-001 | 知識・経験の所有を安定したresponsibility_idで追跡し、フォルダやSkill名の変更で失わない |
| RCLS-BR-002 | CASE／SCENE／PATTERN／LOG／VERIFYを責務・事例・revisionへ対応づけ、相関を因果、自己評価を独立検証として扱わない |
| RCLS-BR-003 | 割当には責務・事例・リスク・provider・task class・context budgetに応じた最小packetを使い、全記録を一括投入しない |
| RCLS-BR-004 | project内、独立検証、横断検証、shadow、Mechanismへの段階を区別し、機構化した規則のSkill本文との二重管理を解消する |
| RCLS-BR-005 | 反例・authority変更・provider／model／version・期限・security／licenseを適格性へ反映し、失効・矛盾・取消後の再検証を確認できる |
| RCLS-BR-006 | 学習結果は提案・証拠・検索入力として扱い、要求・設計・merge・Release authorityを直接書き換えない。既存の要求形成・改善機構を重複実装しない |

RCLSの最小packetはsceneとartifact classも保持して決定的に構成する。学習の仕組みを既存の要求形成・改善・評価機構と重複実装しない。

## L11受入候補

全件未実行である。

| 元のID | 受入条件 |
|---|---|
| HELIXOS-L2-012 | 内部情報の欠落と外部情報の相違を保持し、秘密送信、取得命令実行、外部patch自動採用、closed／mergedだけの解決認定を拒否する |
| HELIXOS-L2-013 | 同じ仕事について上流からの欠落と失敗からの原因候補を突合し、管理自身を含む是正ticket、再検証、再観測へ辿る。未着手や観測停止を正常と表示しない |

RCLSは採用revision確定後に次を確認する。

- 責務名や保存場所の変更後も経験の所有を追跡できる。事例・推論・検証を区別し、自己評価を独立検証として表示しない。
- 割当packetの選択根拠と予算を確認し、全Skill・memory・logの一括投入を認めない。昇格段階と失効・取消後の再検証を識別できる。
- 学習提案だけで要求・設計・merge・Releaseが変更されない。機構化後の規則がSkill本文と二重に判定を支配しない。

## 未確定の点

- 技術調査（HELIXOS-L2-012）について、2026-09-25のBRAIN・ヘリックスコアのPO指示では、Intelligenceがクローラーを発行するとしている。本書の置き場所はPO判断によりLABOとした。クローラーの発行とLABOの技術調査の関係は、LABOとIntelligenceのL1で詰める。
