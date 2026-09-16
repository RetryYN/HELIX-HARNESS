---
title: "要求整理開始時の無損失ベースライン"
status: verified_entry_baseline
verified_at: 2026-09-17
source_revision: 6d22306090a12d1e809a47f895de972e917fa648
authority_effect: none
---

# 要求整理開始時の無損失ベースライン

## 目的

要求整理を、旧要求の削減や現行37件への置換として開始しないための入口を固定する。本書は要求の採否、
統合、意味変更、successor割当を行わない。検証済みの母集団、処理系列、停止条件だけを固定する。

## 検証した母集団

`management-provisional-requirement-register.jsonl`は28 recordを持ち、`supersedes_registration_id`を
解決した生存中`source_holding`は次の12件だった。全件について参照先の存在、非空行数、file SHA-256が
登録値と一致した。

| 生存中holding | 登録行数 | 役割 |
|---|---:|---|
| `MPR-SH-HEADING-002` | 317 | 構造見出し |
| `MPR-SH-IR-003` | 153 | Requirement IR |
| `MPR-SH-CONFIRMED-003` | 175 | confirmed identity |
| `MPR-SH-SEMANTIC-LINE-003` | 2,386 | 旧要求文書のsemantic line |
| `MPR-SH-SUPPLEMENTARY-003` | 655 | requirements v1.3とIRの補助source |
| `MPR-SH-CANDIDATE-003` | 4,755 | 旧candidateの非空行 |
| `MPR-SH-WORKFLOW-003` | 108 | HARNESS工程source clause |
| `MPR-SH-SCRUM-REVERSE-001` | 300 | Scrum Reverse source line |
| `MPR-SH-PREISOLATION-002` | 333 | archive隔離前の変更path |
| `MPR-SH-DELEGATED-DOC-003` | 114 | 意味relation closureのfile blob |
| `MPR-SH-DELEGATED-REF-001` | 788 | closure文書の参照edge |
| `MPR-SH-PO-GOALS-PRINCIPLES-001` | 12 | 5大目標と七大原則のexact原文 |

これらは重複、包含、派生relationを含むため、行数を要求総数として合算しない。各holdingは独立した
未処理集合として残し、一つのholdingに存在しないことを削除または不要の根拠にしない。

## Requirement IRの照合

`legacy-requirement-carry-forward.jsonl`と`legacy-ir-target-routing-queue.jsonl`を照合した。

- 両方とも153件かつ153個のunique `requirement_id`を持ち、ID集合は一致した。
- statement semantic digestは153件すべて一致した。
- 153件すべてが`preserved_pending_rehome`かつ`successor_assignment_status: unassigned`だった。
- W1業務価値33件、W2機能69件、W3非機能40件、W4技術制約11件に分かれる。
- 対象候補はOS 84件、HARNESS／OS分割51件、対象未解決18件である。

この153件は現行37件へ移管済みではない。37件は製品別のrouting containerであり、
`current-l2-requirement-granularity-audit.md`が示すとおり、現時点の単体要求は0件である。

## 三つの処理系列

要求整理は次の三系列を混ぜずに進める。

1. **上流判断系列**: `l2-source-adoption-sequence.md`のS1からS4、29 decision unitを順に扱う。
   最初は`L2D-S1-01 authority-vocabulary`とし、後続判断が使う意味語彙を先に固定する。
2. **旧IR再配置系列**: 153件をW1からW4の順で一件ずつ扱う。原identity、原文、digestを保持し、
   unit、connection、compositeへ分割する場合も全atom被覆を要求する。
3. **残存holding原子化系列**: confirmed、semantic line、supplementary、candidate、workflow、見出し、
   Scrum Reverse、pre-isolation、delegated document／reference、目標・原則を個別にatom化・分類する。

上流判断系列は後続の分類語彙とauthority境界を与える。旧IRと残存holdingはその完了によって消化済みには
ならず、それぞれの処理receiptが必要である。

## 適用順序

1. `L2D-S1-01`でrequest、directive、selection、approval、decision、disposition、runtime judgment、
   notificationの意味とauthorityを整理する。
2. S1の残りで要求形成、根拠、人間反応、要求正本化、変更耐性、source棚卸し、AI可読化を整理する。
3. S1が閉じた後にS2からS4を順に扱い、同時に旧IRと残存holdingの移管判断をその語彙へ束縛する。
4. 各要求は原文、source revision、親Concept／L1、対象product、kind、L11 negative case、未被覆atomを持つ。
5. GitHub Issueは進行projectionに限定し、Issue close、PR merge、CI結果から要求採否を生成しない。

## この入口で禁止すること

- 旧要求、旧identity、source line、参照edgeを削除すること。
- 類似、責務重複、旧技術、実装済みを理由に要求を統合・縮退・retireすること。
- 現行37件のrouting containerを全要求のsuccessorとして扱うこと。
- 未承認のConcept／L1／L2候補をruntime、DB、CI、botへ適用すること。
- 既存CIを要求成立の根拠として使うこと。

## 次の停止点

次は`L2D-S1-01`のsource closureと無損失な判断packetを作る。packetでは既存AVS候補をそのまま採択せず、
保持atom、責務配置、語彙衝突、追加候補、L11 negative caseを示す。人間decisionが記録されるまでは、
現行要求本文、管理register、runtime、GitHub運用へ適用しない。
