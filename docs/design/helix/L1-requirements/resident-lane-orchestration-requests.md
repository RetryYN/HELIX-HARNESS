---
canonical_vmodel: L1-L12
canonical_layer: L1
canonical_pair: L12
title: "常駐マルチランタイム・レーン オーケストレーション要求"
layer: L1
kind: add-design
status: draft
created: 2026-08-20
updated: 2026-09-01
owner: PO / Codex TL
plan: PLAN-L3-75-resident-lane-orchestration-authority
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
pair_artifact: docs/test-design/helix/resident-lane-orchestration-recognition.md
next_pair_freeze: L12
---

# HELIX 常駐マルチランタイム・レーン オーケストレーション要求分解書

- 文書ID: `HELIX-RLO-BRQ-001`
- バージョン: `0.3.0-draft`
- 作成日: `2026-08-20`
- 最終更新: `2026-09-01`（Issue #826、#1293、#1294〜#1296の現行決定を反映）
- 状態: `request-decomposition-draft / L3承認待ち`
- 上位文書: `docs/design/helix/L3-requirements/resident-lane-orchestration-requirements.md`（`HELIX-RLO-REQ-001`）
- 対象リポジトリ: `RetryYN/HELIX-HARNESS`
- 主対象Issue: `#819`（推奨親 Capability: `#92`）
- 位置づけ: 本書 = **要求（L1粒度、BR/SR/CN）**。上位文書 = **要件（L3粒度、RLO-FR/INV/NFR/AC）**。
  正規 pair は `L1↔L12` / `L3↔L10` に従い、本書の各要求は L12 受入観点（検収で何が満たされれば良いか）を併記する。

---

## 1. 文書目的

要件定義書 `HELIX-RLO-REQ-001` は「どう実現するか」の粒度（FR/INV/NFR/AC）で書かれている。
本書はそれを一段上の **要求（なぜ・何を達成したいか）** へ分解・逆起票し、
L1（機能エリア / BR・NFR）→ L3（FR）のトレースを成立させる。

分解方針:

1. 要求は「達成したい状態」で書き、実現手段（schema、state machine 等）は要件側へ残す。
2. 各要求に、要件定義書側の対応 ID（RLO-FR / RLO-INV / RLO-NFR / RLO-AC）をトレースとして付す。
3. **通知経路要求（BR-5）を明示的に立てる**。本仕組みの搬送路は、普段使っている
   Codex（`helix codex` 委譲・Codex CLI session）と Claude（Claude Code hooks・
   SessionStart surface・`harness.db` feedback_events）の既存通知経路であり、
   新規メッセージング基盤を要求しない。

---

## 2. ステークホルダーと動機

| ステークホルダー | 動機 |
|---|---|
| PO（人間） | 承認境界（L3 承認・不可逆操作）以外に関与せず、開発が常時前進すること |
| Codex TL レーン | frontier を止めずに分解・配車・統合に専念できること |
| Worker レーン（Grok Build / Cursor / Codex worker） | scope が明確な仕事を受け取り、同じ branch で完結できること |
| Claude Review レーン | アンカリングなしの blind review を、詰まらない在庫量で行えること |
| HELIX Control Plane | 状態正本を自分が持ち、provider の生死に依存しないこと |

---

## 3. 業務要求（BR）

### BR-1: 開発フローの常時前進

Codex が TL として常時 frontier を進め、独立タスクを複数 worker へ並行配車し、
PO の直接関与なしに PR → review → merge まで循環する状態を実現する。

- 根拠: 上位文書 §3.1
- L12 受入観点: 2worker＋1reviewer の連続 canary が停止なく完走する（完了定義）
- トレース: RLO-FR-001〜003, 030 / RLO-AC-018

### BR-2: scope正本の択一と専用branch（PO決定 2026-08-20）

workerへ仕事を渡すときは、必ず **scope正本を一つ**（GitHub IssueまたはPLANの択一）と
**専用branchを一つ**渡す。PLANはbranchの代替ではなくscope authorityであり、branchは常に必須とする。
branch = 変更先正本、lease = 所有者正本は常に必須とする。
自動配車網より先にこの契約を成立させる。

- HELIX の Forward / Scrum workflow では Issue を起票しないため、
  上位文書の RLO-INV-001「Issue 必須」は本要求で緩和・上書きする:
  **assignmentはIssue参照またはPLAN参照（`plan_id`＋受入条件digest）の
  いずれか一つを scope 正本として持たなければならない**。
- Issue 経由のフロー（GitHub 起点の Capability 進行）では従来どおり Issue を正本とする。
  同一 assignment に Issue と PLAN の二重正本を持たせない。
- 根拠: 上位文書 §1 中核ルール ＋ PO 決定（Forward/Scrum は Issue を立てない）
- L12 受入観点: scope 正本なし / branch なし / base SHA なしの dispatch が 0 件
- トレース: RLO-INV-001〜005（INV-001 は本 BR で改版要）/ RLO-FR-007〜010 / RLO-AC-001〜006

### BR-8: resident lane／native subagent／CLI workerの分離

常駐レーン、provider内部native subagent、HELIX CLIから起動するbounded workerを別identity、別capacity、
別receiptとして扱う。subagentは親laneのscope／branch／budgetを継承し、独立branchが必要なら正式assignmentへ昇格する。

- Codex主経路: Sol TL／管制 → Luna native worker。Terraはcurrent routingから除外する。
- Cursor Cloud worker: 標準Grok、上位Kimi、下位Composerを初期policyとし、effortはHELIX-Benchで導出する。
- 未評価effortはprovider既定として明示し、silent fallbackや推測した高effort固定を行わない。
- L12受入観点: lane/subagent/CLI identityの混同0件、requested/effective modelとeffort sourceを全receiptから追跡できる。
- トレース: RLO-FR-037〜040 / RLO-AC-027〜030

### BR-3: 検収独立性の維持

Claude は worker 会話を引き継がない blind exact-HEAD review 専用レーンであり続ける。
worker の自己 review / 自己 merge を許さず、changes requested は元 worker・同 branch へ返す。

- 根拠: 上位文書 §7.4 / RLO-INV-006
- L12 受入観点: worker 自己承認 0 件、changes requested の元 worker 復帰が実運用で成立
- トレース: RLO-FR-014〜018 / RLO-AC-011〜015

### BR-4: provider の生死に依存しない継続性

個別 session（Codex / Claude / Grok Build / Cursor）は終了・compact・再起動してよく、
論理レーンと assignment は HELIX 側の event / checkpoint から復元される。

- 根拠: 上位文書 §5.1 常駐の定義 / RLO-INV-007
- L12 受入観点: daemon / provider 再起動後に同じ assignment を再開できる
- トレース: RLO-FR-002, 027〜029 / RLO-NFR-001〜002 / RLO-AC-016〜018

### BR-5: 既存 Codex／Claude 通知経路への搬送路統合（新規要求）

配車・完了・review dispatch・差戻しの通知は、**普段使っている Codex と Claude の
既存経路を搬送路として使う**。具体的には:

- Codex 側: `helix codex --role <role> --task "..."` 委譲と Codex CLI session 起動を
  dispatch 通知の実体とする（別の通知バスを新設しない）。
- Claude 側: Claude Code の SessionStart surface（`harness.db` の `feedback_events` /
  continuation projection）と hook lifecycle（Stop / SubagentStop）を review dispatch と
  差戻し受領の実体とする。
- 通知の正本は provider 側受信箱ではなく HELIX event（`review_dispatched`、
  `review_changes_requested` 等）であり、通知欠落時は event からの再送で回復する。
- **搬送方式は「durable タスクキュー＋hook」とする（PO 決定 2026-08-20）**:
  control plane が event 正本から導出した queue を持ち、provider 側は既存 hook /
  委譲 surface で queue を消費する。新規常駐 daemon は Release 0-1 では作らない。

- 根拠: PO 方針（本 lane の仕組みは既存 Codex/Claude 経路の延長として構築する）
- L12 受入観点: 新規メッセージング基盤ゼロで worker→PR→Claude→worker 循環が回る。
  通知の取りこぼしが event replay で回復する。
- トレース: RLO-FR-014, 016 / §14 event 契約 / RLO-NFR-001

### BR-6: 段階導入と既存経路の無劣化（構成別固定配車、PO 決定 2026-08-20）

Grok Build / Cursor が未導入・停止中でも、現行 Codex＋Claude 経路は同じ結果で動く。
runtime 構成数に応じた固定配車を既定とし、release は固定配車 → advisory routing →
限定自動配車の順で進め、各段階に PO 承認境界を置く。

配車対象タスクは **進行・設計・実装・レビューの 4 区分** とする。
実装はさらに **フロントエンド実装とバックエンド実装で適性を分離**して扱い、
配車表・ベンチ計測とも FE/BE を別軸で持つ（PO 決定 2026-08-20）。

| 構成 | 進行 | 設計 | 実装（FE / BE 別適性） | レビュー |
|---|---|---|---|---|
| 2 runtime（現状） | Codex TL | Codex | Codex worker | Claude |
| 3 runtime（＋Grok Build） | Codex TL | Codex | **Grok Build**（worker、FE/BE 適性はベンチで確定） | Claude |
| 4 runtime（＋Cursor） | Codex TL | Codex | Grok Build ＋ Cursor（FE/BE をベンチ結果で割当） | Claude |

**設計タスクの worker 委譲（PO 決定 2026-08-20）**: HELIX は設計ウエイトが大きくなる
特性があるため、設計タスクは Codex 専任に固定せず **worker レーンへ委譲してよい**。
ただし設計成果の統合判断と正本化（L 層への freeze）は Codex TL / 進行レーンが保持し、
worker はベンチで設計適性 evidence を得たものに限る（実装と同様に適性を計測軸へ加える）。

- 根拠: RLO-INV-008 / §19 段階リリース ＋ PO 決定（なければ今の状態、3 つなら Grok がワーカー）
- L12 受入観点: provider 未導入環境で既存経路の全 gate が green（RLO-AC-019）。
  runtime 追加時に配車表どおりの lane 割当になる。
- トレース: RLO-FR-004〜006, 030〜032 / RLO-NFR-007 / 上位文書 §12（初期固定配車の改版要）

### BR-7: HELIX ベンチによる worker 適性評価（新規、PO 決定 2026-08-20）

Grok Build / Cursor を worker レーンへ admission する前に、**HELIX ベンチ**で
適性 evidence を取得する。ベンチ結果が admission と配車表更新の判断根拠となる。

**ベンチは新設ではなく既存要件への接続である**: blind benchmark による worker/model/effort
比較と用途別 admit/retire は `HR-FR-HIL-22`（L3 正本）、Worker Acceptance Bench は
`HIL-FR-61`、provider 横断の委譲面／sandbox／receipt／blind benchmark 共通契約は
PLAN-L3-18（`docs/design/helix/L3-requirements/worker-common-contract.md`）として
既に正本化済み。本要求はこれらに **FE/BE/設計の適性分離軸** と
**モデル世代単位の適性記録** を追加する差分要求である。

- Cursor は背後のモデルが変わる可能性があるため、**モデル変更を検知したら再ベンチ**を
  要求する（provider 名ではなくモデル世代単位で適性を記録する）。
- **実装適性はフロントエンドとバックエンドで分離して計測・記録**する（PO 決定
  2026-08-20）。FE ベンチと BE ベンチを別タスク群とし、片方の適性をもう片方へ
  流用しない。配車表の実装割当も FE/BE 別に決める。
- ベンチ evidence は provider 別成功率・所要時間・差戻し率（RLO-NFR-005 の可観測性指標）と
  同じ軸で記録し、将来の advisory routing（RLO-FR-031）の入力データを兼ねる。
- 根拠: PO 決定（Grok と Cursor は HELIX ベンチで適性を見る）
- L12 受入観点: ベンチ evidence なしの新規 provider admission が 0 件。
  Cursor のモデル変更後、旧適性記録が新モデルへ引き継がれない。
- トレース: RLO-FR-004〜006 / RLO-NFR-005 / RLO-FR-031〜032（routing 入力）

---

## 4. システム要求（SR）

BR を実現するためにシステムが備えるべき能力。要件（FR）の直接の親。

| SR | 内容 | 親BR | 対応要件 |
|---|---|---|---|
| SR-1 | assignment を scope 正本（Issue または PLAN）＋branch＋base SHA＋lease へ束縛する dispatch 契約 | BR-2 | RLO-FR-007〜010, §9（Issue 必須部の改版要） |
| SR-2 | 一 branch 一 writer の排他（lease／fence、sub-agent は親内包） | BR-2 | RLO-INV-003, RLO-FR-008, 025〜026 |
| SR-3 | runtime capability の typed 検出と optional provider 投影 | BR-6 | RLO-FR-004〜006 |
| SR-4 | バックグラウンド control plane（daemon、heartbeat、event、checkpoint、復元） | BR-4 | RLO-FR-001〜003, 027〜029 |
| SR-5 | worker completion packet（typed field＋digest、自然言語非正本） | BR-3 | RLO-FR-012〜013, §13 |
| SR-6 | blind review dispatch と元 worker 差戻し循環 | BR-3, BR-5 | RLO-FR-014〜018 |
| SR-7 | merge admission（exact HEAD＋CI generation＋receipt＋DB convergenceの統合判定） | BR-3 | RLO-FR-019〜020 |
| SR-8 | WIP／review 在庫の backpressure（初期 worker 2・在庫 2） | BR-1 | RLO-FR-021〜024 |
| SR-9 | 既存通知経路 adapter（Codex 委譲 wrapper／Claude hook surface）への配線 | BR-5 | RLO-FR-014, 016（搬送路の実装面） |
| SR-10 | lane 単位 HEAD／checkpoint の多 branch 並行管理 | BR-1, BR-4 | §14.1, RLO-AC-024〜026 |
| SR-11 | HELIX ベンチ実行・適性記録（モデル世代単位、FE/BE 実装適性を分離計測、設計適性を含む） | BR-7 | RLO-NFR-005, RLO-FR-031〜032 |

---

## 5. 制約要求（CN）

| CN | 内容 | 由来 |
|---|---|---|
| CN-1 | canonical 層は L1-L12。要求=L1、要件=L3 として正本化し、L0-L14 旧体系へ戻さない | l12-canonical directive |
| CN-2 | Python semantic core / TS-Node transactional boundary の層別 authority を維持する（ADR-009/010） | ADR-009/010 |
| CN-3 | 新定義は要件正本（requirements v1.3 系列）へ載せてから runtime を移行する | CLAUDE.md 本線 |
| CN-4 | release / tag / cutover / 自動 routing 有効化は action-binding approval 境界を維持 | GitHub 自走運用ルール |
| CN-5 | secret / credential / PII を assignment・event・evidence に書かない | 安全境界 |
| CN-6 | main 直接 push 禁止・PR 経由・required check `harness-check` を変更しない | branch protection |

---

## 6. トレース総括（要求 → 要件）

```text
BR-1 常時前進           → SR-4, SR-8, SR-10 → RLO-FR-001..003, 021..024, 030
BR-2 Issue/branch正本   → SR-1, SR-2        → RLO-INV-001..005（INV-001改版要）, RLO-FR-007..010
BR-3 検収独立           → SR-5, SR-6, SR-7  → RLO-FR-012..020
BR-4 provider非依存     → SR-4              → RLO-FR-002, 027..029, RLO-NFR-001..002
BR-5 既存通知経路統合   → SR-6, SR-9        → RLO-FR-014, 016, §14 event
BR-6 段階導入・構成別配車 → SR-3            → RLO-FR-004..006, 030..032, RLO-NFR-007
BR-7 ベンチ適性評価     → SR-11             → RLO-NFR-005, RLO-FR-031..032（要件側へ新規FR追加要）
```

要件定義書側の全 RLO-FR（001〜032）は上記いずれかの BR/SR に親を持つ。
親が本書に存在しない要件が要件定義書へ追加された場合、本書の改版を必須とする。

---

## 7. PO 決定事項（2026-08-20 反映済み）

1. scope 正本は Issue または branch（PLAN 紐づき）。Forward / Scrum は Issue を立てない。
2. runtime 構成別固定配車: 2=現状（Codex＋Claude）、3=Grok Build が実装 worker。
3. 配車タスク区分は進行・設計・実装・レビューの 4 区分。
4. 設計タスクは worker へ委譲可（統合判断・正本化は進行レーン保持）。
5. 実装適性は FE / BE を分離して評価する。
6. Grok Build / Cursor は HELIX ベンチで適性を見る。Cursor はモデル変動前提で
   モデル世代単位に適性を記録し、変更時は再ベンチ。

## 8. 未決事項（PO 確認待ち）

1. BR-5 の Claude 側搬送路として、Claude Code hook（SessionStart / Stop）以外に
   常駐 review daemon（headless session）を新設するか、既存 hook surface で足りるか。
2. Grok Build / Cursor の adapter 認証情報の管理境界（capability broker 経由で統一するか）。
3. 本書と要件定義書は 2026-08-20 に `docs/design/helix/L1-requirements/` /
   `L3-requirements/` へ配置済み。残タスクは正本化 PLAN の起票（frontmatter 付与、
   design-catalog / glossary 登録、`RESIDENT-LANE-ORCHESTRATION-001` の L3 登録）。
4. HELIX ベンチの具体タスクセット（FE / BE / 設計それぞれの代表タスクと合格基準）。
5. 設計委譲時の worker への設計入力形式（L 層テンプレートをそのまま渡すか、
   assignment packet へ設計 brief を埋め込むか）。
