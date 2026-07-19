<!-- HELIX:L3-PROGRESSION-AUTHORITY:v1 -->
> **L3進行authority**: 層・pair・runtime判断は docs/governance/l3-progression-authority-rebaseline-2026-07-19.md を正とする。本文の旧layer/runtime表現はdomain contentだけを保持するcompatibility debtであり、L3 freeze条件へ使用しない。
> **層正本**: `docs/governance/helix-harness-requirements_v1.3.md` の L1-L12 canonical contract に従う。

> **現行authority（2026-07-19）**: Forward工程はL1-L12、正規pairはL1↔L12 / L2↔L11 / L3↔L10 / L4↔L9 / L5↔L8 / L6↔L7。L0 charterは層外anchorである。L0-L14の既存path・ID・成果物はcompatibility projectionとしてのみ読む。

# docs/process — 工程 (L1-L12) + 駆動モデル定義

ここは HELIX の **「どう開発を進めるか」の方法論定義**を置く場所 (repository-structure §2)。harness 自身の機能要件 (docs/design / src) とは別物。

> **これは何を読めば分かるか (PO 向け入口)**: 「工程 (V-model L1-L12)」と「駆動モデル (mode)」と「ゲート」の 3 つで開発の進め方が決まる。下の §1 用語 → §2 読む順序 の順に読めば全体像がつかめる。

---

## §1 まず用語: PLAN を分類する 4 軸 (kind / layer / drive / workflow_phase)

すべての PLAN (`docs/plans/PLAN-*.md`) は次の 4 軸で分類される。**4 軸は別々の問い**であり混同しない。

| 軸 | 問い (一言) | 値の例 | 正本 |
|----|-----------|--------|------|
| **kind** | この PLAN は**何をする**のか | charter / design / impl / poc / reverse / add-design / add-impl / refactor / retrofit / recovery / troubleshoot / research (12 種) | requirements §1.3 |
| **layer** | V-model の**どの工程**か | canonical: L1-L12 / compatibility read: L0-L14 / cross (横断駆動) | L12 directive / requirements §1.4 |
| **drive** | **どの専門職 (specialist) を招集する**のか | be / fe / fullstack / db / agent (5 種 = 専門職、V7 再設計済) | requirements §1.6 |
| **workflow_phase** | 横断駆動の**局面** | S0-S4 (poc) / R0-R4 (reverse)。他 kind は持たない (10 種) | requirements §1.5 |

### drive (専門職) を詳しく — 「どの専門職を招集するか」

drive は「**その PLAN にどの専門職 (specialist) / 専門エージェントを招集するか**」を表す。これで **L10 UX 磨きの要否 / owner role / mandatory_agents / orchestration_mode** が変わる (concept §2.6.4)。**入口パターンは driveでなく駆動モデル (mode) が担う** (両者は別軸)。

**drive = 専門職 5 種** (V7 再設計済、§1.6):

| drive | 専門職 | L10 (UX 磨き) |
|-------|--------|---------------|
| `be` | バックエンド / API / ロジック | UI 変更時のみ |
| `fe` | フロント / UI / モック駆動 | 常に必要 |
| `fullstack` | BE + FE 同時 | 常に必要 |
| `db` | スキーマ / データモデル | UI 変更時のみ |
| `agent` | AI エージェント / プロンプト設計 | 常に必要 (会話 UI) |

> **V7 再設計 (PLAN-DISCOVERY-04 V7 → PLAN-REVERSE-01 R3、実装済 2026-06-02)**: 旧 §1.6 enum は `scrum/reverse/poc/troubleshoot` (= 駆動モデル名/状況) を drive に混在させ、「駆動モデル (mode)」と命名衝突していた (例: `scrum=仮説検証` は誤り。仮説検証は Discovery)。これらを drive から除去し**専門職 5 種**に整理。横断駆動 (Discovery/Scrum/Reverse/Recovery/Incident) の drive は**対象 work の専門職を継承**する (例: PLAN-RECOVERY-01=fullstack)。入口分類は駆動モデル ([modes/](modes/)) が担う。

### 4 軸の組み合わせ規則 (排他 / matrix)

- **kind × layer 排他** (§1.1): 横断駆動 (poc/reverse/recovery) は `layer=cross` のみ。それ以外の kind は単一の実 layer (cross 不可)。
- **kind × drive matrix** (§1.6、V7 再設計済): 全 12 kind とも drive = 専門職 5 種 (be/fe/fullstack/db/agent) のいずれか。横断駆動 (poc/reverse/recovery) と troubleshoot は**対象 work の専門職を継承** (V3 決着: recovery=fullstack 等が合法)。
  - ⚠ matrix の**機械検証 (ペア強制) は schema 未実装** (frontmatter.ts は将来実装、現状 enum 検証のみ)。enum (5 種) は実装済。
- **kind × workflow_phase** (§1.5): poc は S0-S4、reverse は R0-R4 のみ。他 kind は workflow_phase を持たない。

---

## §2 読む順序 (全体像)

1. **[forward/overview.md](forward/overview.md)** — Forward (本体経路) の V-model L1-L12 と V-pair の全体像。まずここ。
2. **forward/** 各工程詳細 — 既存ファイル名はcompatibility IDを維持するが、内容は[L1-L6 設計フェーズ](forward/L00-L06-design-phase.md) (左腕) / [L6↔L7 unit実装・検証](forward/L07-implementation.md) (谷) / [L8-L12 検証フェーズ](forward/L08-L14-verification-phase.md) (右腕)として読む。
3. **[modes/README.md](modes/README.md)** — 駆動モデル (mode) 正本台帳。Forward 以外の入口 (Discovery / Reverse / Recovery / Incident / Refactor / Retrofit / Add-feature / Scrum / version-up / Research)。**どの mode も出口は Forward に合流**する。
4. **[gates.md](gates.md)** — canonicalゲート体系 G1-G12 + 層外L0 intake + 人間サインオフ必須ゲート + 横断検出。

---

## §3 中核の考え方 (3 つだけ)

1. **V-model**: L1-L12の正規pairで設計・テスト設計・実装・検証を双方向traceする。L0-L14成果物を読む場合もcanonical pairへ投影し、旧pairを新規判定へ使わない。
2. **入口は分かれても出口は 1 本**: 駆動モデル (mode) は「入口の状況」が違うだけ。**全 mode が最終的に Forward L1-L12 へ合流**する。入口を散らさず工程を一本化する。
3. **確証なき設計は Discovery で**: 紙上で確定できない設計は「確証あり」と偽らず、Discovery (kind=poc、設計→仮実装→検証→確定) で回して確かめる (PLAN-DISCOVERY-01 §1.1)。

---

## §4 位置付け

本 dir 全体は **正本化済** (PLAN-REVERSE-01、2026-06-04)。PLAN-DISCOVERY-04 (Discovery) dogfood 実績を経て、PLAN-REVERSE-01 終点で正本化した。規範変更は concept/requirements (上位正本) 先行 → 本 dir へ反映する。
