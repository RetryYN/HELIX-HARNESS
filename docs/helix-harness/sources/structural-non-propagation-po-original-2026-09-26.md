---
title: "HELIX 構造保証非伝播 要求差分案（POの原文、2026-09-26）"
kind: source_snapshot
source: PO（2026-09-26のClaude作業sessionで提示）
recorded_at: 2026-09-26
decision_record: docs/governance/decisions/harness-v-valley-process-po-decisions-2026-09-26.md
authority_effect: none
---

# HELIX 構造保証非伝播 要求差分案（POの原文、2026-09-26）

2026-09-26（Asia/Tokyo）、POが「こいつもアイディアで」として示した本文を、そのまま保存する。
本書は書き換えない。現在の意味はHARNESSとOSの要求（L2）と受入（L11）に置き、差分はgitで辿る。
原文の表題にある「v0.1」は原文の一部として残す。

---

# HELIX 構造保証非伝播 要求差分案 v0.1

## 1. 目的

現行HELIXは、要求を単体・接続・構成体に分け、Forward小・中・大へ接続する。

本要求差分ではこの分類を新設しない。

追加するのは、各構造粒度の成立・設計義務・検証結果を独立して扱い、下位の成立から上位の成立を推定しないための条件である。

基本原則を次とする。

```text
Unit成立
≠ Connection成立

Connection成立
≠ Composite成立

下位Proof
≠ 上位Proof
```

一方で変更影響はrelationを通じて上位・下位へ伝播する。

```text
Completionは伝播しない。
Impactは伝播する。
```

---

# 2. HARNESS-L2-008 要求形成への追加

現行の単体・接続・構成体分類を次の条件まで強化する。

## 追加要求

単体・接続・構成体は、それぞれ別の要求identityとして成立状態を持つ。

単体要求の成立から、その単体を含む接続要求または構成体要求の成立を自動導出してはならない。

接続要求の成立から、その接続を含む構成体要求の成立を自動導出してはならない。

構成体要求を単体・接続へ分解した場合も、構成体そのものに固有の目的、behavior、failure、constraint、acceptanceを失ってはならない。

要求分類は下流の実装・検証結果から誤りが判明した場合に再評価できる。

構造粒度の意味が変わる場合は、下流で直接書き換えずBackflowで要求形成へ戻す。

---

# 3. HARNESS-L2-009 設計義務への追加

unit、connection、compositeには、それぞれ固有の設計義務を導出する。

```text
Unit
→ 単体内部のbehavior / state / failure等

Connection
→ interface / direction / ownership /
   ordering / retry / timeout /
   idempotency / partial failure等

Composite
→ architecture / end-to-end behavior /
   system invariant / recovery /
   NFR / operation等
```

下位構造の設計成果を束ねただけで、上位構造の設計義務を充足したものとしてはならない。

特にCompositeを分解するとき、

```text
Composite
├─ Unit obligations
├─ Connection obligations
└─ Composite-specific obligations
```

を保持する。

`Composite-specific obligations` が空になる場合も、空であることを根拠付きで確認する。

---

# 4. HARNESS-L2-005 検証義務への追加

検証義務は要求の構造粒度ごとに独立して導出する。

```text
Unit
→ Unit-level verification

Connection
→ Boundary / Integration verification

Composite
→ System-level verification
```

下位検証の成功を、上位検証の成功証拠として代用してはならない。

具体的には、

```text
All Unit Green
≠ Connection Green

All Unit Green
+ All Connection Green
≠ Composite Green
```

とする。

上位構造は、その構造に固有のoracle、expected failure、証拠条件を持つ。

動的CIは固定段数を持たず、要求type、layer、pair、変更種別、risk、relationから必要な検証だけを導出する。

下位Proofを再利用できる場合でも、その証拠を入力として利用するのであり、上位Proofそのものを省略したことにはしない。

---

# 5. HARNESS-L2-004 変更影響への追加

変更による影響は、要求・設計・検証間のrelationから導出する。

ただし、変更された下位identityの状態を上位identityへそのまま伝播してはならない。

例：

```text
Unit A changed
```

から、

```text
Connection A-B = failed
Composite X = failed
```

を自動生成しない。

代わりに、

```text
Connection A-B = affected
Composite X = affected
```

として再評価対象を導出する。

影響状態は最低限、

```text
affected
unaffected
unknown
```

を区別する。

`unknown` を暗黙に `unaffected` として扱ってはならない。

再検証の結果によってのみ、その構造identityの成立状態を更新する。

---

# 6. Backflowによる構造再分類

実装、Reverse、検証、運用観測によって要求の構造粒度が誤っていたと判明した場合、Backflowを発行できる。

例：

```text
Unit問題として要求化
↓
実装・検証
↓
実際にはA→Bの意味不一致
↓
Backflow
↓
Connection Requirementとして再形成
```

または、

```text
複数Connectionを個別修正
↓
Systemとして成立しない
↓
Composite固有要求の欠落を発見
↓
Backflow
↓
Composite Requirementを追加・修正
```

再分類時は、

* 元の要求identity
* 元のtype
* 新しいtype候補
* 根拠となったfinding
* 対象revision
* 影響する設計
* 影響する検証
* 既存成果の再利用可否

を追跡する。

旧identityを黙って書き換えて履歴を失わない。

---

# 7. OSへの適用条件

OSは現行のForward定義を変更しない。

```text
単体
→ Forward 小

接続
→ Forward 中

構成体
→ Forward 大
```

これは既存HELIX定義を使用する。

追加する運用条件は次のみとする。

1. 各要求identityの進行・成立状態を独立して保持する。
2. Forward小の完了からForward中・大の完了を生成しない。
3. Forward中の完了からForward大の完了を生成しない。
4. relationから変更影響を導出し、必要な再検証候補へ接続する。
5. `affected / unaffected / unknown` を成立状態と混同しない。
6. HARNESSが導出した上位検証義務を、下位CI greenで省略しない。
7. Backflowによる構造再分類後は、新しい要求revisionから必要Ticket・設計義務・検証義務を再導出する。

---

# 8. L11受入条件

## 8.1 成立非伝播

Unit A、B、Cをすべて成立させる。

A→B、B→CのConnectionを未検証にする。

期待結果：

```text
Unit A = satisfied
Unit B = satisfied
Unit C = satisfied

Connection A-B ≠ satisfied
Connection B-C ≠ satisfied

Composite X ≠ satisfied
```

Unit成功だけでConnectionまたはCompositeを成立させた場合は不合格。

---

## 8.2 ConnectionからCompositeへの非伝播

全Unitおよび全Connectionを成立させる。

Composite固有oracleを未実行にする。

期待結果：

```text
Units = satisfied
Connections = satisfied
Composite = unverified
```

下位green集合だけでCompositeを成立させた場合は不合格。

---

## 8.3 Composite固有義務の保持

CompositeをUnitとConnectionへ分解する。

期待結果：

元Compositeの、

* end-to-end目的
* system invariant
* failure
* recovery
* NFR
* acceptance

のうち分解後も必要な義務がComposite側へ残る。

Unit/Connectionへ分解したことだけでComposite要求を消した場合は不合格。

---

## 8.4 Impact伝播

Unit Aを変更する。

Aが参加するConnectionおよび上位Compositeへのrelationが存在する。

期待結果：

```text
Unit A = changed

Connection A-B = affected
Composite X = affected
```

と識別される。

Connection/Compositeを自動failedまたは自動passedに変更してはならない。

---

## 8.5 Unknownの保持

変更影響を証明できないrelationを入力する。

期待結果：

```text
impact = unknown
```

を保持し、`unaffected` や検証不要へ変換しない。

---

## 8.6 Backflow再分類

Unit要求として進めた変更について、実装または検証からConnection問題である証拠を与える。

期待結果：

* findingを保持する。
* 元要求を黙って変更しない。
* Backflowへ接続する。
* Connection Requirement候補を形成する。
* 影響する設計・検証を再導出する。
* 人間合意が必要な意味変更は既存要求形成経路へ戻す。

---

# 9. 既存要求との関係

本差分は新しい要求分類機構を追加しない。

既存の次の意味を強化する。

```text
HARNESS-L2-008
→ 単体・接続・構成体の要求identity

HARNESS-L2-009
→ 各構造型固有の設計義務

HARNESS-L2-004
→ relationによる変更影響

HARNESS-L2-005
→ 構造型固有の検証義務と動的CI

OS ticket
→ Forward 小 / 中 / 大
```

したがって本差分の新規性は、

```text
Structural Satisfaction Non-Propagation
+
Structure-specific Obligation Preservation
+
Impact Propagation
+
Backflow Retyping
```

に限定する。

---

# 10. Core Invariants

1. 下位構造の成立は上位構造へ伝播しない。
2. 下位Proofのgreenは上位Proofを代替しない。
3. 分解によって上位固有義務を消さない。
4. CompletionではなくImpactをrelation経由で伝播する。
5. `unknown`を成功・非影響へ補完しない。
6. 構造分類の誤りはBackflowで修正する。
7. OSはHARNESSの構造意味を再定義しない。
8. Forward小・中・大の既存定義を重複実装しない。
