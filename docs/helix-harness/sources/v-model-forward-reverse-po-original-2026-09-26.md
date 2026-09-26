---
title: "HELIX V-Model Forward / Reverse-Refactor Assurance Model（POの原文、2026-09-26）"
kind: source_snapshot
source: PO（2026-09-26のClaude作業sessionで提示）
recorded_at: 2026-09-26
decision_record: docs/governance/decisions/harness-v-valley-process-po-decisions-2026-09-26.md
authority_effect: none
---

# HELIX V-Model Forward / Reverse-Refactor Assurance Model（POの原文、2026-09-26）

2026-09-26（Asia/Tokyo）、POが「HARNESSの工程自体をVの谷をベースにちょっと改変の要求アイディア」として示した本文を、そのまま保存する。
本書は書き換えない。現在の意味はHARNESSの要求（L2）と受入（L11）に置き、差分はgitで辿る。

---

# HELIX V-Model Forward / Reverse-Refactor Assurance Model

## 1. 一文定義

HELIXのVモデルは、左側Forwardで要求・設計を実装可能な単位へ具体化し、原子CIによる最低保証を維持しながら高速に暫定成果を生成する。

Vの谷以降は、実装された実体を各V-pairの粒度でReverse観測し、設計とのずれ・境界・依存・責務を再評価し、振る舞いを保てる範囲ではRefactorしたうえで段階的にProofを強化する。

つまり、

**前半は「速く作るための最低保証」
後半は「実物を磨きながら成立を証明する品質保証」**

とする。

---

# 2. 基本構造

```text
                    L1 企画
                  /          \
             L2 要求          L12 運用評価
                /                \
           L3 要件                L11 受入
              /                      \
         L4 基本設計                L10 総合Proof
            /                            \
       L5 詳細設計                      L9 結合Proof
          /                                  \
     L6 実装 ───── Vの谷 ───── L7 TDD Closure
                                      \
                                      L8 Unit Proof
```

概念的には、

```text
左側
Forward Construction

        ↓

Vの谷
Implementation + Atomic Closure

        ↓

右側
Reverse Observation
→ Boundary Review
→ Refactor / Backflow
→ Progressive Proof
```

と捉える。

---

# 3. 左側Forwardの目的

左側の目的は「完成品質を毎回証明すること」ではない。

目的は、

> **正しく分解された変更を、高速に実装可能な暫定成果へ変換すること**

である。

Forwardは現行HELIXのTicket粒度に対応する。

```text
Forward 小
= 単体要求 / Unit

Forward 中
= 接続要求 / Connection

Forward 大
= 構成体要求 / Composite
```

作業量ではなく、要求構造によって粒度を決める。

---

# 4. Atomic CI Principle

Forward小および実装中の基本CIは、変更scopeに閉じた最小保証とする。

## 原則

> Ticketの責務境界内で証明可能な範囲を超えて、毎回全Systemを検証しない。

Atomic CIが保証するものは、

* Ticketの対象revisionが解決できる
* 対象設計・要求へtraceできる
* 変更した責務のoracleを満たす
* 対象scopeのtestが成立する
* 直接依存との最低contractを壊していない
* 許可scope外へ変更していない
* 明白なstatic / schema / contract違反がない
* 既知blockerを残したまま暫定成立にしない

ことである。

具体的なlint、typecheck、unit test等は言語・artifactに依存して動的に導く。

固定コマンド集合をAtomic CIの定義にしない。

---

# 5. Atomic CIの位置づけ

Atomic CIは、

```text
QUALITY PROVEN
```

を意味しない。

意味するのは、

```text
PROVISIONAL
= 次の結合工程へ渡してよい
```

である。

状態は概念的に、

```text
WORKING
↓
Atomic CI
↓
PROVISIONAL
```

とする。

この段階ではSystem成立・利用者受入・Release成立を主張しない。

---

# 6. Vの谷

現在のHELIX V-pairでは、

```text
L6 実装
↔
L7 TDD Closure
```

がVの谷になる。

ここでは、

```text
Design Contract
↓
Implementation
↓
Red
↓
Green
↓
Local Refactor
↓
Atomic CI
↓
Provisional Artifact
```

までを閉じる。

ここでのRefactorは局所的な実装整理であり、

* public contract
* requirement
* architecture意味
* state semantics

を変更しない。

変更が必要ならBackflowする。

---

# 7. 右側の再定義

右側を単純な「テスト工程」としない。

右側は、

> **結合範囲を拡大するたびに実物をReverse観測し、対応する左側設計との境界を見直し、必要ならRefactorしてからProofする工程**

とする。

基本loop：

```text
Observe
↓
Reverse
↓
Compare with paired design
↓
Boundary Review
↓
Refactor or Backflow
↓
Integrate
↓
Proof
↓
Promote
```

---

# 8. Scoped Reverse Principle

右側で毎回Full Reverseを行わない。

正規Forwardによって、

* requirement
* design
* pair
* revision
* Ticket
* artifact

が既知である場合は、それを基準に限定Reverseする。

```text
Expected Design
vs
Observed Reality
```

だけを比較する。

Full Reverseは、

* lineage不明
* legacy asset
* 設計trace欠落
* canonical設計を信用できない
* 大規模drift

などの場合のRecovery手段として残す。

---

# 9. L8 — Unit Reverse Refactor

対応：

```text
L5 詳細設計
↔
L8 Unit Proof
```

見るもの：

* 内部contract
* state
* edge case
* local dependency
* responsibility
* algorithm structure

処理：

```text
実装観測
↓
L5と比較
↓
局所的な歪みを検出
↓
behavior invariantならRefactor
↓
Unit Proof
```

ここでは主に、

* extract
* split
* deduplicate
* naming
* dependency整理
* local interface整理

を扱う。

外部contractが変わるならRefactorではなくBackflow。

---

# 10. L9 — Connection / Boundary Reverse Refactor

対応：

```text
L4 基本設計
↔
L9 結合Proof
```

ここを右肺の中心とする。

Forward小で作った複数Unitを、Forward中のConnectionとして結合する前後で、

* interface
* dependency direction
* state ownership
* data ownership
* transaction
* failure propagation
* retry
* timeout
* idempotency
* coupling
* duplicated responsibility

をReverse観測する。

```text
Unit A      Unit B
  ↓           ↓
PROVISIONAL artifacts
       ↓
Boundary Observation
       ↓
Reverse actual relation
       ↓
L4 designと比較
       ↓
Boundary Refactor
       ↓
Connection Proof
```

例えば、

```text
密結合
→ interface抽出

双方向依存
→ dependency inversion

state owner不明
→ ownership再配置

内部実装参照
→ public boundaryへ限定
```

を行う。

---

# 11. RefactorとBackflowの境界

右側で何でも直してよいわけではない。

## Refactor

外部意味を保存できる変更。

```text
behavior invariant
contract invariant
requirement invariant
```

なら右側で処理できる。

## Backflow

意味が変わる場合。

```text
Implementation structure wrong
→ Refactor

Detailed contract wrong
→ L5へBackflow

Architecture / boundary wrong
→ L4へBackflow

Requirement / acceptance wrong
→ L3 / L2へBackflow

Product value wrong
→ L1へBackflow
```

右側が左側のauthorityを黙って書き換えない。

---

# 12. L10 — Composite / System Proof

対応：

```text
L3 要件
↔
L10 総合検証
```

ここではForward中を複数束ね、Forward大の構成体として成立するかを見る。

対象：

* FR
* NFR
* AC
* system state
* end-to-end behavior
* failure path
* recovery
* security
* performance
* capacity
* observability

Atomic CIのpassを合算してSystem成立としない。

```text
Unit Proof
+
Connection Proof
≠
System Proof
```

構成体固有のbehaviorとfailureを検証する。

---

# 13. L11 — Acceptance Proof

対応：

```text
L2 要求
↔
L11 受入
```

ここでは、

> 作ったものが設計通りか

ではなく、

> **利用者が要求したものとして成立しているか**

を確認する。

L10までgreenでもL11を自動passさせない。

L11で意味差が見つかった場合は、直接コードを修正するのではなく、

```text
Finding
↓
Backflow
↓
Requirement re-entry
↓
必要なForward再実行
```

とする。

---

# 14. Release Port

Releaseを最後の「針通し」にしない。

開発開始時からRelease Portを持つ。

```text
Release Port
├─ required proof
├─ artifact identity
├─ target environment
├─ dependency
├─ security condition
├─ rollback
├─ deployment condition
└─ acceptance state
```

各工程で条件を満たしていく。

```text
Atomic Proof      ✓
Connection Proof  ✓
System Proof      ✓
Acceptance        ✓
Artifact Identity ✓
Deployment Proof  ?
```

Release直前に初めて全条件を探さない。

---

# 15. Proof CI Principle

後半のCIは「たくさんテストを回すCI」ではない。

> **そのintegration depthで成立すべき設計仮説を証明するCI**

とする。

概念上、

```text
Atomic CI
↓
Boundary Proof CI
↓
Composite / System Proof CI
↓
Acceptance / Release Proof
↓
Deployment / Operation Proof
```

へ強くなる。

ただし固定5段pipelineにはしない。

HARNESSが検証義務を定義し、OS検収がTicket・risk・pair・変更内容から必要profileだけを動的合成する。

---

# 16. CI Profileと要求粒度

基本対応：

```text
Unit Requirement
→ Atomic CI

Connection Requirement
→ Boundary / Integration Proof

Composite Requirement
→ System Proof
```

ただしriskにより昇格可能とする。

例えば認証・DB migration・Security・Release変更なら、Unit変更でも早期に上位Proofを要求できる。

つまり、

```text
CI depth
=
Requirement Granularity
× Integration Depth
× Risk
× Change Type
```

で決める。

---

# 17. Progressive Proof Principle

品質を最初から最大強度で検査しない。

結合範囲に合わせて証明責務を増やす。

```text
Atomic
→ 局所成立

Connection
→ 境界成立

Composite
→ System成立

Acceptance
→ 利用要求成立

Deployment
→ 実環境成立

Operation
→ 時間軸上の成立
```

これにより、

> 小さな変更でも毎回Full CI

を避けながら、最終品質を落とさない。

---

# 18. 成果物の昇格状態

概念状態：

```text
WORKING
↓
PROVISIONAL
↓
INTEGRATED
↓
VERIFIED
↓
ACCEPTED
↓
RELEASE-ELIGIBLE
↓
DEPLOYED
↓
OBSERVED
```

意味：

### PROVISIONAL

Atomic CIを通過。

次の結合へ渡せる。

### INTEGRATED

Boundary Reverse / Refactor / Connection Proofを通過。

### VERIFIED

System Proofを通過。

### ACCEPTED

L11要求受入を通過。

### RELEASE-ELIGIBLE

Release Portの必須条件が揃った。

### DEPLOYED

対象環境への配備が成立。

### OBSERVED

L12で運用時間軸まで確認された。

前状態の成立から後状態を推定しない。

---

# 19. Reverse Ticketとの関係

右側のReverse観測と、現行HELIXの`Reverse Ticket`を区別する。

## Right-Arm Scoped Reverse

通常Forwardの内部処理。

既知のpaired designへ実体を照合する。

新Ticketを毎回発行する必要はない。

## Reverse Ticket

以下の場合に独立発行する。

* 設計と実装の明確なdrift
* canonical lineage欠落
* 同種finding再発
* performance regression
* Incident後の恒久化
* Scrum Reverse checkpoint
* 大規模な設計回帰

つまり、

```text
通常
→ Scoped Reverse

異常 / 大規模drift
→ Reverse Ticket
```

とする。

---

# 20. Refactor Ticketとの関係

右側の小さなBoundary Refactorは、現在のForward Ticket内部で処理可能とする。

一方、

* 独立した大規模構造改善
* cross-cutting refactor
* architecture全体の再整理

は、

```text
Refactor
Design-refactor
Performance-refactor
```

Ticketとして切る。

これによりTicketの乱造を防ぐ。

---

# 21. OSの責務

HARNESSはこの工程原則と検証義務を定義する。

HELIX-OSは、

```text
Ticket
↓
scope / requirement type / risk
↓
必要工程をcompile
↓
Workerへ配車
↓
Atomic CI
↓
合流管理
↓
Proof CI
↓
Evidence登録
↓
次状態へpromotion
```

を運転する。

OSはoracleを勝手に削除・追加しない。

---

# 22. Intelligenceの責務

現行再定義に従い、稼働中の、

* 理解
* 計画
* 予測
* 診断
* Review
* Worker配置案

はIntelligenceが支援する。

したがって、

```text
「このBoundaryは密結合か？」
「どのBackflow先が妥当か？」
「どのTicketを先に進めるか？」
```

等の意味判断候補はIntelligenceが出せる。

ただし最終的なOS stateやHARNESS工程authorityを直接変更しない。

---

# 23. LABOとの接続

このモデルの実績はすべてLABOへ返す。

例えば、

```text
Atomic CI平均時間
Atomicで捕捉できたfailure率
L9で見つかったboundary defect
Refactor前後の再作業量
System Proofでの漏れ
Backflow発生率
Release Portでの詰まり
Production Incident
```

を集積する。

LABOは、

> Atomic CIが軽すぎるか
> Proofを前倒しすべきか
> Boundary Refactorが効いているか
> System化すべき判断か
> 運用へFallbackすべきか

を評価し、HARNESS / OS / Intelligence / BRAIN等へFeedbackする。

---

# 24. 基本原則

## 原子CI原則

局所変更には局所成立を証明する最小CIを適用する。

## Progressive Proof原則

統合範囲が広がるほどProof責務を増やす。

## Paired Reverse原則

右側では実体をpaired designへReverse照合する。

## Boundary Refactor原則

結合時に境界・責務・依存を見直し、意味保存可能ならRefactorする。

## Backflow原則

意味を変更する必要があれば、右側で黙って修正せず対応する左層へ戻す。

## Dynamic CI原則

CI段数・job集合を固定せず、要求・Ticket・risk・pairから導く。

## Evidence Promotion原則

前状態のgreenだけで上位成立を推定しない。

## Release Port原則

Release条件を終端で探さず、最初から出口契約として持つ。

---

# 25. 最終形

```text
                FORWARD / BUILD
─────────────────────────────────────

Requirement
↓
Design
↓
Ticket decomposition
↓
Forward Small / Unit
↓
Implementation
↓
TDD
↓
Atomic CI
↓
PROVISIONAL

                V VALLEY

─────────────────────────────────────
            REVERSE / ASSURANCE

Observed Reality
↓
Scoped Reverse
↓
Boundary Review
↓
Refactor or Backflow
↓
Connection Proof
↓
INTEGRATED
↓
System Reverse / Proof
↓
VERIFIED
↓
Acceptance
↓
ACCEPTED
↓
Release Port
↓
Deployment
↓
Operation / L12
```

HELIXのVモデルは、

> **左側で完璧な実装を待つ仕組みではなく、最低保証付きの暫定解を高速に作る。
> 右側で実物から設計を逆照合し、境界を磨きながら証明強度を段階的に高める。**

モデルとする。

これにより、

**開発速度と品質保証を同じCIへ押し込まず、推進と証明を分離しながら最終的な完全性を高める。**
