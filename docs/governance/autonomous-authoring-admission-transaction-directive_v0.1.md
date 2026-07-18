# HELIX 自律 Authoring・Admission Transaction 導入指示書 v0.1

- status: directive（要件反映は Proposal 扱い。L1/L3 正本への反映は別途 Admission 判断）
- source: PO 提供指示書「HELIX_自律Authoring_Admission_Transaction導入指示書.md」（2026-07-19 受領）
- 突合基準: `docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md` /
  `docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md`（HEAD 時点）

## 0. 要件定義との突合結果（2026-07-19）

| 項目 | 原案 | 突合結果 | 処置 |
|---|---|---|---|
| HIL-BR-26 | 新規追加 | 既存最大 HIL-BR-25。連番整合、重複なし | 原案どおり採用 |
| HIL-FR-51〜53 | 新規追加 | 既存最大 HIL-FR-50。連番整合、重複なし | 原案どおり採用 |
| HIL-NFR-34〜36 | 新規追加 | 既存最大 HIL-NFR-29。**30〜33 が欠番となる採番衝突** | **HIL-NFR-30〜32 へ採番修正** |
| 「Admission」名称 | Admission Transaction | 既存 HIL-BR-06 に Issue ライフサイクルの「Admission gate」が存在（別概念） | 本件は **Authoring Admission** と呼称し区別する |
| 概念重複 | Authoring 統制 | 既存要件に Authoring 正本化トランザクションの直接重複なし（HIL-FR-10 は memory 圧縮で別物） | 新規要求として妥当 |

以降の本文では NFR ID を修正後（HIL-NFR-30/31/32）で記載する。

## 1. 目的

HELIX における Markdown・PLAN・要件・設計書の編集を禁止するのではなく、AI による自由な起草・修正能力を
維持したまま、正本化だけを機械的かつ原子的に制御する。

1. AI の自走性を維持する。
2. 無検証の要件変更・設計逸脱・trace 断絶を防止する。
3. Markdown・履歴台帳・HELIX DB・証跡の部分更新を防止する。

基本原則:

> AI による Authoring は許可する。
> 無検証の Canonical 化は禁止する。
> 正本化は Admission Transaction を通して行う。

## 2. 現行方針の修正

「AI が直接 Markdown を追加・改変・意味変更することを禁止する」という規則は採用しない。
これは AI による要件定義・設計修正・Reverse・Redesign・自己改善を阻害し、HELIX の自走目的と矛盾する。

正式方針:

> AI は Markdown・PLAN・要件・設計書を自律的に起草・追加・修正・分割・統合・改名できる。
> ただし、変更を Canonical な正本として確定する場合は、Admission Transaction を通して変更内容・意味差分・
> 権限・影響範囲・trace・revision 及び検証証跡を機械検査する。
> 通常の可逆変更は AI が自動確定し、上位目的・安全境界・不可逆な外部契約を変更する場合のみ人間へ escalate する。

## 3. Authoring 状態モデル

Authoring 対象は Proposal / Candidate / Canonical の 3 状態で管理する。

### 3.1 Proposal

AI が自由に作成・変更できる作業状態。許可する操作: Markdown の新規作成、要件文章の修正、要件の分割・統合、
ファイル名及び配置の変更案、設計書の追加・修正、Reverse による back-fill、Redesign による上流修正、
文書差分及び改訂履歴の生成。

Proposal は未検証状態であり、Canonical 要件・設計完了・実装許可の根拠には使用しない。

### 3.2 Candidate

Proposal に対して Admission 検証を実行している状態。最低限、次を検査する:
schema 適合 / stable ID 及び revision / authority / source provenance / 意味差分 / 上位要求との整合 /
requirement〜design〜test trace / pair artifact / 影響範囲 / 重複及び孤立 / downstream stale 範囲 /
security 及び irreversible boundary / 必要な review 及び test evidence。

Candidate は検査途中のため、Canonical 確定として扱わない。

### 3.3 Canonical

Admission Transaction が完了し、Canonicalization Receipt が発行された状態。以下を単一 transaction として確定する:
Markdown、安定asset ID、revision、意味digest、authoring event、trace edge、影響record、
stale記録、HELIX DB投影、Canonicalization Receipt（正本化receipt）。

一部だけ更新された状態を Canonical として残してはならない。

## 4. 自動確定と人間承認の境界

### 4.1 AI が自動確定してよい変更（Admission PASS 後）

誤字・表記・説明改善 / schema を変えない追記 / 上位要求から一意に導出可能な詳細化 / 欠落 trace の補完 /
既存要件を変更しない AC 追加 / 設計書の不足項目補完 / 重複文書の整理 / 内部ファイルの改名 /
内部構造のリファクタリング / Reverse で確認済み実装事実を設計へ戻す変更 / 既定 template への適合 /
obsolete reference の更新 / source provenance 及び evidence の追加 / 可逆かつ外部影響のない変更。

### 4.2 AI が自動 revision でよい意味変更

意味変更であっても、次の条件をすべて満たす場合は AI が新 revision を作成してよい:

- 上位の L0／L1 目的を変更しない
- 既存の安全境界を弱めない
- scope authority から一意に導出できる
- 影響対象を機械的に特定できる
- downstream 成果物を stale 化できる
- rollback 又は supersede 経路がある
- test oracle を生成又は更新できる
- unresolved trade-off が存在しない

旧 revision は上書きせず履歴として保持する。

### 4.3 人間承認が必要な変更

以下は Decision Packet を生成し、PO 承認まで Canonical 化を停止する:

L0 の目的変更 / 事業スコープ変更 / 既承認要件の削除又は実質的縮小 / 安全境界の緩和 /
認証・認可・PII・secret・決済への影響 / 本番環境又は外部 API への不可逆変更 / 公開 API 又は外部契約の破壊的変更 /
schema migration 又は破壊的データ操作 / ライセンス判断 / 複数案に真正な trade-off が存在する /
上位要求同士が矛盾している / authority が機械的に確定できない / rollback 不能 /
external publish・release・merge・tag・distribution 切替。

## 5. Admission Transaction 要件

正規経路:

```text
AI Authoring
→ Proposal 保存
→ Semantic Diff 生成
→ Admission Classification
→ Authority 検証
→ Trace／Pair／Impact 検証
→ Security／Irreversible 判定
→ 必要な Test／Review 実行
→ Canonical Revision 作成
→ Markdown／Ledger／DB／Receipt 原子的更新
```

### 5.1 必須入力

```yaml
command_id:
subject_asset_id:
base_revision:
proposed_revision:
source_path:
proposal_digest:
semantic_diff_digest:
change_class:
authority_refs:
requirement_ids:
affected_layers:
affected_artifacts:
pair_artifacts:
rollback_route:
actor:
runtime:
model:
created_at:
```

### 5.2 変更分類

`editorial` / `clarification` / `trace_backfill` / `design_detail` / `semantic_revision` / `split` / `merge` /
`rename` / `supersede` / `deprecate` / `security_sensitive` / `irreversible` / `scope_change` /
`authority_uncertain`。

分類不能・複数分類の矛盾又は根拠欠落は fail-close する。

### 5.3 自動判定結果

`auto_admit` / `auto_admit_with_stale_propagation` / `repair_then_retry` / `human_decision_required` /
`reject` / `conflict` のいずれかを返す。曖昧な成功状態を返してはならない。

## 6. 原子的書込み要件

Canonical 化は次の write set を一つの operation として扱う:

```text
asset revision
→ Markdown publish
→ authoring event
→ semantic diff record
→ authority edge
→ requirement/design/test trace
→ impact edge
→ downstream stale events
→ projection update
→ canonicalization receipt
```

必須事項:

- `command_id` による冪等性
- `base_revision` の CAS 検査
- 同一 command＋同一 digest は既存 receipt を返す
- 同一 command＋異なる digest は conflict
- 書込み途中の failure は全 rollback
- Markdown だけ更新された状態を残さない
- DB projection だけ更新された状態を残さない
- receipt 発行前に全 write set を再検査する
- receipt には before／after revision と write count を記録する
- projection は event から再構築可能とする

## 7. Markdown の位置づけ

Markdown は人間及び AI が読む Canonical Authoring View とする。ただし次を区別する:

- Markdown＝現在の正本表現
- append-only ledger＝revision 及び遷移履歴の正本
- HELIX DB＝検索・trace・impact・進捗用 projection
- receipt＝正本化操作の証明

Markdown 単独・DB 単独又は receipt 単独を Canonical 化の根拠にしてはならない。

## 8. 改名・移動・分割・統合

### 8.1 改名・移動

ファイルパス・ファイル名を identity にしない。immutable `asset_id` を維持し、path 変更は alias／location history
として記録する。参照先を一括更新し、old path は stale 又は redirect として扱い、移動前後で semantic identity が
同一であることを検証する。

### 8.2 分割

親 asset を保持し、全 source authority を子 asset へ disposition、AC 及び trace を子へ割当、未配分要素を 0 件にし、
親 asset を `superseded_by_split` として保持する。

### 8.3 統合

全入力要件を新 asset へ包含し、acceptance oracle の消失を禁止、source authority を全件保持、旧 asset を
`superseded_by_merge` として保持し、同義統合と意図削除を区別する。

## 9. Review・検証要件

### 9.1 通常の自動 Authoring

editorial・clarification・trace backfill 等は決定論的検査だけで自動 Admission してよい。

### 9.2 意味変更

semantic revision では最低限: semantic diff / impact analysis / pair artifact 更新 / affected test oracle /
downstream stale propagation / independent review 又は deterministic oracle / rollback・supersede route を要求する。

### 9.3 最終レビュー

Canonical freeze 又は merge に使用する最終 review は、必須 test green 後に実行し、reviewed subject revision＋HEAD を
固定し、worker と異なる reviewer を使用し、review 後の変更で stale 化し、未解消 FLAG があれば Admission 不可とする。
Authoring 途中の相談・テスト作成・修正指示は Terminal Review とは区別する。

## 10. 失敗時の動作

| 状況 | 動作 |
|---|---|
| schema 不整合 | 修正可能なら repair して再検査 |
| trace 欠落 | trace candidate を生成して再検査 |
| pair 欠落 | pair 作成 task を起票 |
| authority 不明 | human decision required |
| base revision 更新 | proposal を stale 化、rebase／再生成 |
| downstream 影響未処理 | stale propagation 完了まで保留 |
| transaction 失敗 | 全 rollback |
| 同一 command 異 payload | conflict |
| 安全境界変更 | human decision required |
| irreversibility 検出 | action-binding approval 待ち |
| review 後の変更 | review 及び receipt を stale 化 |

AI は失敗を理由に Authoring 内容を黙って破棄してはならない。

## 11. HELIX 要件への反映指示（Proposal、採番は突合修正済み）

### 11.1 HIL-BR への追加

**HIL-BR-26（自律 Authoring と Canonical 化の分離）**

> AI は要件・設計・PLAN 及び関連 Markdown を自律的に起草・追加・修正・分割・統合・改名できる。Authoring の
> 自由度は維持し、Canonical 化だけを Authoring Admission Transaction で制御する。通常の可逆変更は AI が
> 自動確定し、上位目的・安全境界・不可逆な外部契約を変更する場合だけ人間へ escalate する。

### 11.2 HIL-FR への追加

**HIL-FR-51（Authoring Admissionエンジン）**

> Authoring Admission Engine は Proposal の意味差分・authority・revision・trace・pair・impact・安全境界及び
> rollback route を検査し、auto-admit・repair・human-decision・reject 又は conflict を決定する。

**HIL-FR-52（原子的Canonicalization Transaction）**

> Canonicalization Transaction は Markdown・asset revision・event ledger・trace・impact・stale propagation・
> HELIX DB projection 及び receipt を単一 operation で原子的に更新する。部分成功は Canonical として扱わない。

**HIL-FR-53（意味revisionとasset identity）**

> Authoring asset は path・名称から独立した immutable ID を持ち、意味変更は新 revision として保持される。
> rename・move・split・merge 及び supersede は履歴と typed edge を失わず処理する。

### 11.3 HIL-NFR への追加（原案 34〜36 → 30〜32 に採番修正）

**HIL-NFR-30（Authoring自律性）**

> 可逆かつ既定 policy 内の Authoring 変更では人間入力を要求せず、機械検証から Canonical 化まで自動完走できること。

**HIL-NFR-31（Canonicalization原子性）**

> Authoring 正本・ledger・trace・projection 及び receipt は all-or-nothing で更新され、fault injection 後にも
> 部分 current 状態が 0 件であること。

**HIL-NFR-32（意味変更の安全性）**

> 意味変更は authority・impact・pair・oracle・rollback 及び downstream stale propagation が揃わない限り
> Canonical 化されないこと。

## 12. 受入条件

最低限、以下をテストで証明する:

1. AI が新規 Markdown を作成し、人間承認なしで自動 Canonical 化できる。
2. 誤字修正が自動 Admission される。
3. 要件詳細化が上位要求から一意に導出される場合、自動 revision できる。
4. L0 目的変更は自動 Admission されない。
5. security boundary 緩和は人間承認へ送られる。
6. Markdown 書込み後に DB 更新が失敗した場合、全体が rollback される。
7. DB 更新後に receipt 生成が失敗した場合、Canonical 状態が残らない。
8. 同一 command 再送で revision が増えない。
9. 同一 command ID の異なる payload が拒否される。
10. rename 後も asset identity と trace が維持される。
11. split 後に未配分要求が 1 件あれば失敗する。
12. merge で acceptance oracle が消失する場合は失敗する。
13. base revision 更新後に古い proposal が Canonical 化できない。
14. review 後に文書が変更された場合、review が stale 化する。
15. downstream 設計・テストが未更新なら完了 claim が拒否される。
16. Proposal 失敗時にも原案と finding が保持される。
17. AI が「人間確認待ち」を乱発せず、真の判断境界だけを escalate する。
18. event から Markdown＋DB projection が再構築できる。

## 13. 非目標

本対応では以下を行わない: AI による Markdown 編集の禁止 / 全変更への人間承認要求 / Markdown を廃止して DB
だけを正本にする / 自由記述 Authoring を不可能にする / 軽微な変更まで重い review を要求する /
既存文書の全件即時移行 / path を immutable identity として固定する / Admission Engine へ LLM の自由裁量だけを
持たせる。

## 14. 実装順序

1. Authoring asset＋revisionのschema
2. semantic diff 分類
3. Admission判定のpure core
4. Markdown Proposal／Candidate／Canonical 境界
5. Atomic Canonicalization Transaction
6. receipt 及び projection
7. rename／move 対応
8. split／merge 対応
9. stale propagation
10. human Decision Packet
11. fault injection test
12. 既存要件・PLAN の段階移行

既存 Markdown を一括変換してはならない。新規及び意味変更対象から段階適用し、旧資産は baseline／grandfather
として明示管理する。

## 15. 最終原則

HELIX の Authoring 統制は、AI の書込み能力を制限する機構にしてはならない。目指す状態:

> AI は自由に考え、書き、修正し、設計を進化させる。
> HELIX は、その変更が正本になる瞬間だけを厳格に管理する。
> 人間は真の目的変更・安全判断・不可逆判断だけを担当する。

書込みを禁止するのではなく、正本化をトランザクション化すること。
