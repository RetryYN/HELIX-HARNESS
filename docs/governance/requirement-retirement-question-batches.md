# 旧要求の削除・吸収・置換候補 人間質問batch

prepared_at: 2026-09-17
status: batch_1_draft_review_pending
program_id: RDP-002-RETIREMENT
parent_program: RDP-002
github_projection_issue: 1849
question_unit: one retirement candidate
batch_size: 5
authority_effect: none

## 目的

似ている旧要求、包含される旧要求、旧技術方式に固定された要求から、current要求として残さなくてよい候補を探す。
[重複cluster台帳](requirement-overlap-candidate-clusters.jsonl)は検索母集団であり、cluster一件をそのまま一問にしない。
原要求ID単位で比較し、次のいずれにするかを5件ずつ人間へ確認する。

- `retain_separate`: 独立した意味があるため別要求として残す。
- `absorb_then_retire_legacy_id`: 固有atomを別要求へ移した後、包含された旧IDをretire候補にする。
- `merge_then_retire_legacy_ids`: 全固有atomを新しい一要求へ移した後、複数の旧IDをretire候補にする。
- `strip_technical_binding`: 目的・failure・制約を残し、旧技術方式の指定をretire候補にする。
- `unresolved`: 判断材料が不足しているため生存中のまま保留する。

`retire候補`は物理削除や不採用の確定ではない。successorまたはreplacement不要根拠、全atomの行先、consumer影響、
L11 oracle、対象revision付き人間decisionが揃うまで、原要求本文とidentityを保持する。

Batch 1は旧Requirement IR 9 identityを比較する5候補である。初期multi-product母集団66件の残り57件、
`single_product` 87件、confirmed identity 175件、その他holdingは未処理母集団として生存中であり、削除候補なしとは
判定していない。Batch 1回答後も候補探索を5件ずつ続ける。

## 以前の質問の扱い

[旧責務境界質問](requirement-overlap-question-batches.md)の`Q-OVL-001`から`Q-OVL-025`は、削除候補の判断単位として
使用しない。2026-09-17に提示した最初の5問へのPO回答`OK`も削除判断へ適用しない。責務境界は比較材料として保持し、
削除・吸収・統合・技術指定廃止の問いは本書の`Q-RET-*`で行う。

## Batch 1

### Q-RET-001 `HIL-FR-31`を`HIL-FR-05`へ吸収できるか

両方とも、上流変更時にV-pairをstale化し、再freeze後にForwardへ戻す要求である。

- `HIL-FR-05`の固有意味：影響layerへのrouting、Screen Applicability／prototypeまたはskip receiptのstale化、
  Reverse→Redesign→pair-freeze→Forward順序、L0変更のPO escalation、redesign PLAN／修正layer／stale edge／pair receipt。
- `HIL-FR-31`の固有意味：screen applicability／prototype agreementのstale化、再承認前の実装claimとForward合流の拒否、
  stale edge／re-entry task／re-freeze receipt。
- **A（推奨）**：拒否条件を後継へ残し、旧`HIL-FR-31`を`absorb_then_retire_legacy_id`候補にする。
- **B**：対象と受入が異なる独立要求として両方残す。
- **C**：successor設計まで保留する。

### Q-RET-002 `HIL-BR-17`を`HIL-FR-30`へ吸収できるか

両方とも、監査findingを`current_pr_fix`と`successor_issue`へ分け、同じ因果でwriterまたは後続工程へ送る要求である。

- `HIL-BR-17`の固有意味：Claude監査findingを対象にした機械的disposition、AIによるfinding破棄禁止、
  後続Issueのcurrent PRへの再流入禁止。
- `HIL-FR-30`の固有意味：correctness／security／data loss／oracle等の影響判定、successorだけからのPipeline起動、
  重複判定、current修正の一括返却、途中欠落時のready拒否、typed disposition／writer return／join出力。
- **A（推奨）**：二つの禁止条件を後継へ残し、旧`HIL-BR-17`を`absorb_then_retire_legacy_id`候補にする。
- **B**：業務要求と機能要求として両方残す。
- **C**：監査actorとpipeline設計が決まるまで保留する。

### Q-RET-003 `HIL-BR-24`を`HIL-FR-45`へ吸収できるか

両方とも、要求の原文、atom、authority、分類、acceptance、capability、template、design obligation、revisionを
一つの履歴へ結ぶRequirement Definition Ledgerを求めている。

- `HIL-BR-24`の固有意味：要件定義自体を設計対象とし、trace行の存在だけを完了にしない。
- `HIL-FR-45`の固有意味：stable ID／immutable revision、canonical statement、modality、scope/non-goal、
  authority/rationale、owner、riskを含むtyped edge、8種の変更操作、before/after digest、全source atom disposition、
  downstream stale、review authority付きreceipt、orphan/stale findingを含む出力。
- **A（推奨）**：上位原則と完了禁止条件を後継へ残し、旧`HIL-BR-24`を`absorb_then_retire_legacy_id`候補にする。
- **B**：上位要求と機能要求として両方残す。
- **C**：Requirement LedgerのL2/L11採否まで保留する。

### Q-RET-004 `HIL-NFR-26`と`HIL-NFR-28`を一つへ統合できるか

両方とも、文書・行・ID・templateの存在だけを完全性証拠にせず、各要求または設計義務を意味内容、edge、oracle、
根拠付きN/Aへ個別接続する要求である。

- `HIL-NFR-26`だけの意味：設計義務単位、TBD・空欄・範囲表記・一行複数義務消込の拒否。
- `HIL-NFR-28`だけの意味：active requirement単位、source atom・authority・applicability、ambiguity・orphan・staleの拒否。
- **A（推奨）**：二つの分母と全negative caseを一つのcomposite NFRへ残し、旧2 IDを`merge_then_retire_legacy_ids`候補にする。
- **B**：要求完全性と設計完全性を別NFRとして残す。
- **C**：要求台帳と設計義務graphの接続設計まで保留する。

### Q-RET-005 `HIL-TR-08`のNode↔Python固定方式を廃止候補にするか

この要求はNode↔Pythonをchild process＋JSON Lines over stdioで接続する方式を固定している。一方で、versioned protocol、
stdout／stderrのchannel分離、envelopeのschema、run／request identity、type、sequence、deadline、payload digestという
境界品質も含む。

- **A（推奨）**：固定技術方式を`strip_technical_binding`候補にし、境界が必要な場合だけ品質atomを技術中立の後継へ残す。
- **B**：Node↔Python＋JSON Linesをcurrent技術要求として残す。
- **C**：新世代runtime境界のresearch／PoCまで保留する。

## 回答方法

`Q-RET-001=A`のように5件を回答する。Aでも直ちに削除せず、retire候補として仮登録する。各候補は後続PRで
successor、atom coverage、consumer、L11、技術代替証拠を揃え、最終retire判断を一要求identityずつ行う。
