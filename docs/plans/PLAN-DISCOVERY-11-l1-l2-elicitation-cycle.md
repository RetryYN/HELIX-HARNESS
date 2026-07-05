---
plan_id: PLAN-DISCOVERY-11-l1-l2-elicitation-cycle
title: "PLAN-DISCOVERY-11 (kind=poc): L1⟷L2 要求洗い出しサイクル — 画面(mock)で要求を洗い出す反復前段 + 収束 gate → L3 ハンドオフ"
kind: poc
layer: cross
workflow_phase: S3
scrum_type: design-spike
drive: fe
status: draft
created: 2026-07-04
updated: 2026-07-05
owner: PO (人間) / Claude (Opus)
parent_design: docs/design/harness/L1-requirements/screen-requirements.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: aim
    slot_label: "AIM — L1⟷L2 要求洗い出しサイクルの Discovery 境界と S1/S4 判断条件を整理する"
  - role: tl
    slot_label: "TL — Forward front-end (L00-L06-design-phase §L2=L1 フェーズ分離) との整合・収束 gate を A-40 back-propagation の精緻化として接続する PoC レビュー"
  - role: po
    slot_label: "PO — elicitation cycle の入口/出口・AI gap-check 境界 (charter §3) の承認、収束『切る』の最終宣言主体"
generates:
  - artifact_path: docs/plans/PLAN-DISCOVERY-11-l1-l2-elicitation-cycle.md
    artifact_type: markdown_doc
  # draft のため generates は実在する自 doc のみ。設計成果 (forward/L00-L06-design-phase 追記 §L1⟷L2 cycle +
  # 収束 gate 仕様 + AI gap-check contract) と、それを enforce する consistency lint (src/lint) は本文 §スコープ参照。
  # 規範確定 (concept/requirements 先行) + Forward descent 着地時に generates へ追加する。
dependencies:
  parent: null
  requires: []
  references:
    - docs/process/forward/L00-L06-design-phase.md
    - docs/design/harness/L1-requirements/screen-requirements.md
    - docs/design/harness/L2-screen/README.md
    - src/workflow/design-elicitation.ts
    - src/lint/screen-impl-pair-freeze.ts
---

# PLAN-DISCOVERY-11 (kind=poc): L1⟷L2 要求洗い出しサイクル

## 目的

PO 理想「**画面を作って要求を洗い出す**、で〈切ったら〉**要件定義（L3）へ進む**」を Forward 前段の
first-class な工程として設計する。これは新 mode ではなく **Forward front-end（L0→L1→L2→[収束]→L3）の
精緻化**である。canonical `forward/L00-L06-design-phase.md:51` は既に **「L2 画面 = L1 のフェーズ分離」
（画面要求 → 要求/要件 L1→L3 上流、画面詳細 → L5）** と認識しており、本 PLAN はその往復を
**明示的な反復ループ + 収束 gate + AI gap-check** として formalize する（発明ではなく既存萌芽の formal 化）。

charter §3 の人-AI 境界を一切崩さない: L1/L2 は**人が直接作成**（mock=最後の直接関与）、L3 は **AI 起草・人は承認のみ**。

## 確定した設計判断（PO、2026-07-04）

- **AI 関与度 = gap-check のみ**: 人が画面(L2 mock)と要求(L1)を書く。AI は「mock にあるが要求に無い / 要求に
  あるが mock に無い」不整合・欠落を検出して surface するだけ（起草・確定はしない）。charter §3 厳守。
- **収束『切る』= 機械 gate + 人の宣言**: L1↔L2 の被覆一致・宙に浮いた要求ゼロ・L2⟷L10 mock ペア存在を
  consistency lint で機械判定し green を必要条件に、最終 freeze は人が宣言。接続先は **A-40 back-propagation
  （screen track 合流時の G1-trace 再検証、`gate-design.md` §2.1 末尾規約）の精緻化**とする
  （G1 は A-41→A-100 で PASS 済のため、G1 exit へ条件を直付けする事後拡張は循環であり行わない）。

## スコープ

### IN — 工程設計（Forward front-end 精緻化）
- **L1⟷L2 反復ループの明示化**: 1 ラウンド = 「L2 mock 更新 ⟷ L1 要求(BR/screen-req/FR-L1)更新」。
  mock が新要求を露出 → L1 back-prop（`screen-requirements.md` §trace / business-requirements 反映）→ mock 再描画、
  を bounded に回す。各ラウンドの変更を change-log/trace 化し back-prop を記録。back-prop 統制の参照は
  **A-40 back-propagation**（`gate-design.md` §2.1 末尾規約）であり、`forward-convergence.ts` ではない
  （同 lint は `kind=impl` 専用で poc はスコープ外。宙に浮いた別フローを作らない）。
- **AI gap-check contract**: 人フェーズに read-only の gap-check を配線。出力 = ①mock⟷要求の双方向欠落一覧、
  ②不整合（画面 ID ↔ screen-req ↔ FR-L1 の trace 断絶）、③L2⟷L10 mock ペア未整備。**提案のみ・確定しない**。
- **収束 gate 仕様（A-40 back-propagation の精緻化）**: 「L1⟷L2 相互整合・安定」の機械判定を、
  **A-40 back-propagation（screen track 合流時の G1-trace 再検証）の再検証条件**として組み込む。
  G1 exit（A-41→A-100 で PASS 済）へ条件を直付けする事後拡張は**循環のため行わない**。
  green + 人サインオフ → L3 へ baton carry（AI が L3 FR+AC を起草開始）。

### IN — enforcement（設計が確定したら Forward descent で実装）
- L1↔L2 consistency lint（`src/lint/`）: screen-requirements 15 画面 ↔ L2 screen-list/flow/ui-element の
  被覆双方向一致、dangling 要求ゼロ、L2⟷L10 mock ペア存在を検査。**IMP-039 self-pair（wireframe
  `pair_artifact: self`）は充足扱い**とし、G2 PASS 済の screen 設計へ false-positive を出さない。
  `screen-impl-pair-freeze.ts` とは**別ロジック**（段階順序検査 vs 双方向被覆検査）であり、共有するのは
  ユーティリティのみ（再発明も誤共有もしない）。fail-close は A-40 再検証点に接続、baseline debt は grandfather。
- gap-check の CLI/hook 結線点（read-only、人フェーズ支援）。

### IN — 要件抽出の観点表（gap-check の判定基準、属人化防止）

gap-check の「欠落」判定を属人的にしないため、各画面 × 以下の観点で被覆を機械列挙する
（観点未充足 = 欠落候補として surface。充足の宣言は人が行う）:

1. **入力**: 画面の入力要素ごとに対応する要求（validation・必須/任意・型・上限）があるか。
2. **出力/表示**: 表示データごとに出所（FR/データ要件）が L1 側に存在するか。
3. **異常系**: エラー表示・空状態・タイムアウト・二重操作の要求があるか。
4. **権限/安全境界**: 誰が操作できるか、action-binding approval 対象操作か（charter §3 / HNFR-P8 整合）。
5. **状態遷移**: 画面間遷移（正常系以外含む）が screen-flow と L1 要求の双方に存在するか。
6. **データライフサイクル**: 生成・更新・削除・保持期限の要求があるか（削除/retention は既知の手薄領域）。
7. **NFR**: 応答時間・可用性等の数値要求が該当 NFR グレードに接地しているか。
8. **外部依存**: 画面が前提とする外部 API・runtime 前提が明示されているか。

### IN — 発散防止 bound（サイクル暴走の構造的抑止）

- 反復は **1 収束単位あたり最大 3 ラウンド**を既定とする。3 ラウンドで green に至らない場合は
  自動継続せず **PO へエスカレーション**（スコープ分割 or 要求凍結の判断を人が行う）。
- ラウンド上限・観点表の閾値は将来チューニング対象のため、実装時は TS 定数直書きではなく
  **policy module へ分離**する（`refactor-candidate-policy.ts` と同じ分離パターン）。

### 収束後の拘束（要件定義=決定事項、安全実装への baton）

収束宣言（機械 green + 人サインオフ）以降、要件定義を**拘束力ある決定事項**として扱う:

1. **L1/L2 freeze**: 収束済み L1 要求・L2 mock は decision record。以後の変更は新ラウンド起票
  （change-log + A-40 再検証）を経由し、silent edit しない。
2. **L3 = 実装の SSoT**: AI が起草し PO が承認した L3 FR+AC が下流（L4〜L7）の唯一の判断基準。
  実装エージェントは AC（Given/When/Then）の機械検証でのみ completion を主張できる
  （prose claim 禁止 = HNFR-P3 / PLAN claim discipline と同一原則）。
3. **要件外実装の遮断**: L3 に trace しない実装は forward-convergence / trace lint / doctor が検出する
  （kind=impl へ降下した時点で既存 enforcement のスコープに入る）。
4. **安全境界の継承**: AC に安全境界（auth/payments/PII/破壊的操作）が関わる場合、実装は
  action-binding approval（HNFR-P8）を経ずに進めない。escalate は要件不備として L1⟷L2 へ back-prop する。

### OUT / 非対象
- **新 mode を作らない**（modes/ は Forward 以外。本件は Forward 前段）。
- AI が L1/L2 を起草・確定しない（charter §3、gap-check の read-only を厳守）。
- L3 以降の自動化（既存 Forward 本線、本 PLAN は L3 ハンドオフ点までを設計）。
- design-bottomup（backend 起点 FE derive、`design-elicitation.ts`）とは入口が別。greenfield 前段が本 PLAN の対象で、
  bottom-up と混同しない（合流点のみ参照）。

## 規範整合（上位正本先行）

`process/modes/README.md` の規範ルール「規範変更は concept/requirements（上位正本）先行 → docs/process へ反映」に従う。
本件は Forward 本線 front-end への追記のため、確定前に **concept v3.1 / requirements v1.2 の該当節（L1/L2/G1）へ
trace seed を通す**（本 draft は提案。confirmed 昇格前に上位正本の追補要否を TL/PO 判定）。

## 受入条件
- Forward front-end の L1⟷L2 反復ループ・AI gap-check・収束 gate が `forward/L00-L06-design-phase.md`（+ 必要なら
  上位正本）に矛盾なく記述され、charter §3 境界（人=L1/L2、AI=L3 起草）を破らない。
- 収束 gate が **A-40 back-propagation の精緻化**として接続され、PASS 済 G1 exit を事後拡張しない（循環禁止）。
  gap-check は read-only（確定権を持たない）。
- consistency lint が IMP-039 self-pair を充足扱いとし、G2 PASS 済 screen 設計へ false-positive を出さない。
- 収束宣言後の baton は §収束後の拘束（要件定義=決定事項）に従う。
- consistency lint は設計確定後の Forward descent で実装し stale-edge を作らない（generates は着地時追加）。
- doctor / lint / plan lint green。confirmed 前に review evidence 記録（可能なら別 runtime / model family）。

## スケジュール
- mode: serial（設計 → 規範整合 → enforcement 実装の順、各独立着地）。
- Step 1: L1⟷L2 反復ループ + AI gap-check contract + 収束 gate 仕様を `forward/L00-L06-design-phase.md` 追記案として設計（TL）。
- Step 2: 上位正本（concept/requirements）への trace seed 要否を判定・反映（PO 承認）。
- Step 3: consistency lint を Forward descent（L6→L7）で実装（既存 screen-impl-pair-freeze を参照）。
- Step 4: gap-check の read-only 結線。
- Step 5: 検証 → review → A-40 再検証点への接続確認 → confirmed。

## 訂正記録（2026-07-05、cross-review 反映）

code-reviewer（sonnet, 2026-07-04）cross-review の指摘 3 点を本文へ反映した（本 PLAN は draft のため
in-place 訂正。supersession は不要だが、接続先変更は設計判断のため記録する）:

1. 収束 gate の接続先を「既存 G1 exit の拡張」から **A-40 back-propagation の精緻化**へ訂正。
   理由: L2 は G1 exit の後工程であり、G1 は A-41→A-100 で PASS 済。PASS 済 gate の exit へ条件を
   事後追加する設計は循環する。正しい接続点は screen track 合流時の G1-trace 再検証（A-40、
   `docs/governance/gate-design.md` §2.1 末尾規約）。
2. back-prop 統制の参照を `forward-convergence.ts`（kind=impl 専用、poc スコープ外）から A-40 へ訂正。
3. consistency lint に IMP-039 self-pair 充足扱いを明記（G2 PASS 済 screen 設計への false-positive 防止）。
   `screen-impl-pair-freeze.ts` とは別ロジックでユーティリティのみ共有。

あわせて PO 要求「要件定義を決定事項とし、エージェントが安全に実装する仕組み」（2026-07-05）を受けて
§要件抽出の観点表 / §発散防止 bound / §収束後の拘束 を追加した。

## S1 進捗メモ（2026-07-05）

- Step 1 の TL 提案は本 PLAN 本文の §目的 / §スコープ / §受入条件として整理済み。
  具体的には「L1⟷L2 反復ループ」「AI gap-check は read-only」「収束 gate は A-40 back-propagation の精緻化」
  という 3 点を設計案として固定した。
- S1 時点では `docs/process/forward/L00-L06-design-phase.md` / `docs/process/gates.md` への正本反映は、
  上位正本（concept / requirements）への trace seed 要否を PO/TL が判定してから行う。現時点で
  canonical process doc を更新して confirmed と主張しない。
- consistency lint 実装、gap-check CLI/hook 結線、A-40 再検証点への fail-close 接続は Step 2 承認後の Forward descent
  対象であり、S1 proposal のまま current completion evidence へ混ぜない。
- この S1 next action は Step 2 完了記録で解消済み。現行 next action は S2 PoC 実走記録を参照する。

## Step 2 完了記録（2026-07-05、PO 承認）

- PO 判断: **trace seed = required**、S2 進行承認（「OK進めて」2026-07-05）。
- seed 反映済み: `docs/governance/helix-harness-concept_v3.1.md` §2.3「L2 画面は L1 のフェーズ分離」注記直下、
  `docs/governance/helix-harness-requirements_v1.2.md` §1.4 正規式モデル注記内。いずれも PoC 段階の
  trace seed と明示し、confirmed 昇格時に正式追補する（規範ルール「上位正本先行」充足）。

## S2 PoC 実走記録（2026-07-05、PM-06 設計書ビューア × 観点表 Round 1）

対象 = PM-06（2026-06-22 追加の最新画面、欠落残存の可能性が最も高い）。AI gap-check は read-only で
欠落**候補**を surface するのみ。充足宣言・L1 反映は人（PO）の作業。

| 観点 | 判定 | 所見 |
|------|------|------|
| 1 入力 | 被覆 | filter 3 種は enum、自由入力なし。validation 要求は不要と判断できる形 |
| 2 出力/表示 | 被覆 | 情報要素 ↔ `DesignDocTree`/`DocPreview`/`DocToc` + renderer 3 種が対応（ui-element §2.PM） |
| 3 異常系 | **欠落候補 2 件** | (a) L2 `MermaidRenderer` に render error fallback があるが、**L1 要求側に描画失敗・doc 不存在・空ツリー時の要求が無い**（L2→L1 逆方向欠落の実例）。(b) L1 状態種別の frozen(青) が L2 標準 5 値 `ok/warn/error/empty/loading` に写像未定義 |
| 4 権限/安全境界 | **欠落候補 1 件** | read-only (S5=b) は両層整合。ただし L1「共有用」に対し**共有相手のアクセス制御要求が無い**（外部共有は PLAN-L7-146 parked に依存。要 PO 判断） |
| 5 状態遷移 | 被覆 | PM-02/PM-04/HM-01 ↔ PM-06 の deep-link・breadcrumb・back 復帰が screen-flow §2/§5 に存在 |
| 6 データライフサイクル | 被覆(軽微) | read-only viewer のため生成/削除なし。frozen doc の過去版参照要求は無いが非目標と読める |
| 7 NFR | **欠落候補 1 件** | 更新頻度 30s はあるが、**大型 doc（50KB 級）プレビューの応答時間・Mermaid 複雑度上限の数値要求が無い**（NFR グレード表欠落と同根、PLAN-L3-07 Step 3 と接続） |
| 8 外部依存 | **欠落候補 1 件** | **Markdown/Mermaid renderer のライブラリ依存と script 実行安全前提（sandbox/CSP）が L1/技術要求に未明示** |

- Round 1 結果: 8 観点中 4 観点で欠落候補 5 件。観点表は実画面で機械列挙として機能した（属人判定なし）。
- 収束判定は行わない（本 PoC は観点表の有効性検証が目的。L1 反映 → Round 2 は PO の充足宣言後）。
- S3 verify への引き継ぎ: 欠落候補 5 件の要否判断（PO）→ 反映されたら Round 2 で被覆再列挙 → 3 ラウンド
  bound 内で green になるかを確認する。
- 現行 workflow phase は S2。terminal 化、process 正本反映、consistency lint / gap-check CLI 実装はまだ行わない。

## S2 Round 1 反映 + Round 2 再列挙（2026-07-05、PO 承認「やっておくれ」）

- **PO 判断: 欠落候補 5 件すべて accept**（「やっておくれ」2026-07-05）。反映は AI が PO 承認の写経として
  実施（判断 = 人、記述 = AI 代筆。charter §3 の「AI が要求を確定しない」は PO 判断先行で充足）。
- **Round 1 反映**: `docs/design/harness/L1-requirements/screen-requirements.md` §1.PM.06 へ 5 行を追加
  （異常系 / 状態種別写像義務 / NFR 初期値 p95 ≤ 2 秒 / 共有スコープ out-of-scope 宣言 / 外部依存 sandbox 前提）。
  A-40 change-log 注記を同所に残置（G1-trace 再検証対象）。NFR 初期値は外部化基準の運用チューニング値。
- **Round 2 再列挙結果**: L1 側 **8 観点 green（8/8）**。残差は **L2 側 1 件** — StatusBadge 標準 5 値への
  frozen 写像定義と PM-06 空ツリー表示行の L2 追記。L2 は G2 PASS 済（frozen）のため、この残差は
  次ラウンドの「L2 mock 更新」として **screen track 再開時に A-40 再検証点経由**で反映する（silent edit しない）。
- **PoC 判定材料**: Round 1 検出 → 人承認 → 反映 → Round 2 で L1 green、残差が機械列挙で可視、
  3 ラウンド bound 内。観点表 + 反復ループ + A-40 接続の機構は greenfield 前段として機能することを実証。
- S3 verify への引き継ぎ: 本記録を S3 の検証対象とし、S4 decide（本採用 → Forward descent で
  consistency lint / gap-check CLI 実装）の判断材料とする。

## S3 verify 記録（2026-07-05、AI 実施 — decide-record-proceed 既定に基づく）

S2 実走記録（Round 1 検出 → PO accept ×5 → 反映 → Round 2 再列挙）を機械証跡で検証した:

- 反映実体: commit `14179b2`（screen-requirements §1.PM.06 +5 行 + A-40 change-log 注記、本 PLAN の Round 記録）。
- 機械 gate: `helix plan lint` OK（checked=517）、doctor `doc-consistency` OK（screens=15 不変）、
  `design-language` OK（english prose 0）。同時刻の `coding-rules` violation 12 件は PLAN-L3-07 Step 1
  （Codex 委譲、循環依存 lint の TDD red フェーズ）由来であり本 PLAN のスコープ外。
- 機構検証の結論: 観点表（8 観点）は属人判定なしで欠落を機械列挙でき、反復ループは
  検出 → 人承認 → 反映 → 再列挙 → 残差可視化の 1 周を 3 ラウンド bound 内で完了した。
  A-40 接続・charter §3 境界（判断 = 人、記述 = AI 代筆）・silent edit 禁止も運用で維持された。
- 残差: L2 側 1 件（StatusBadge 写像 + 空ツリー行）は screen track 再開時に A-40 経由（S4 の阻害ではない）。
- 判定: **S3 verify = pass**。S4 decide（本採用可否、PO 一括判断）へ進む準備完了。

## 壊さない / 再発させない
- charter §3 の人-AI 境界を越えない（AI が L1/L2 を確定しない）。
- 既存 G1 exit / L2⟷L10 mock ペア設計（IMP-039）を回帰させない。
- 新 mode を増やさない（Forward 前段の精緻化に限定、mode ecosystem を撹乱しない）。
- generates 実在物のみ規約を守り relation-graph stale-edge を作らない。

## レビュー / 次工程
- 実装（consistency lint 等）は設計確定後・Codex in-flight 着地後に harness workflow で行う。基準点は HEAD。
- 次 action: ~~PO が S2 Round 1 の欠落候補 5 件について `accept / reject / defer` を判断する~~ →
  **判断済み（accept ×5、2026-07-05「やっておくれ」、§S2 Round 1 反映参照）**。現行の次 action は
  S3 verify（Round 1→2 の実走記録を検証）→ S4 decide（本採用可否、PO）。L2 側残差 1 件は screen track
  再開時に A-40 経由で反映する。
- 出典: PO 対話（2026-07-04）「画面を作って要求を洗い出す→切ったら要件定義」。既存萌芽 = `forward/L00-L06-design-phase.md:51`
  「L2 = L1 フェーズ分離」。関連 = [[upstream-helix-reconciliation]]（screen 設計連鎖 gap は PLAN-L7-323 で L3/L6 降下側を扱う）。
