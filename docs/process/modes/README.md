> **正本化済** (PLAN-REVERSE-01 で DISCOVERY-04 dogfood 実績から正本化、2026-06-04)。docs/process は forward/modes/gates の運用正本。規範変更は concept/requirements (上位正本) 先行 → 本 dir へ反映する。

# 駆動モデル (mode) 定義 — index + 正本台帳

出典: concept v3.1 §2.5 (9-mode ecosystem) / §2.6 (signal→mode 配線) / requirements v1.2 §1.3 VALID_KINDS / §1.5 workflow_phase / §1.6 VALID_DRIVES / §1.8 VALID_ROLES

---

## 1. mode とは

mode (駆動モデル) は **「入口条件」と「文脈遷移 (昇華)」だけを規定**し、**出口は必ず Forward L0-L14 (`../forward/`) に合流**する (concept §2.5)。入口を散らさず工程を一本化するための分類であり、完了先 (設計・実装・検証・運用の同一接続) を分断しない。

Forward (本体) は `../forward/` に定義する。本 dir は **Forward 以外の駆動モデル** を 1 ファイル 1 モードで定義する。

---

## 2. 正本台帳 (mode ↔ kind / drive / phase / Forward 合流)

> **4 軸 (kind / layer / drive / workflow_phase) の意味**は [../README.md §1](../README.md) を参照 (drive = 「どの技術軸で作るか」等)。本台帳の列はこの 4 軸 + owner/承認者/Forward 合流。
>
> **重要 (なぞらず翻案)**: source process reference の workflow ファイル名と HELIX の `kind` (§1.3 12 種) は **1:1 でない**。Incident / Add-feature は独立 kind を持たず複数 kind を内包し、Discovery / Scrum は同一 `kind=poc` だが **mode (入口) が異なる** (drive ではなく mode で区別。drive は両者とも対象 work の専門職)。本台帳が mode と frontmatter taxonomy の対応の正本。
>
> **drive 列について (V7 再設計済、§1.6)**: drive = 専門職 5 種 (be/fe/fullstack/db/agent) のみ。横断駆動 (Discovery/Scrum/Reverse/Recovery/Incident) は **対象 work の専門職を継承**する (旧 `poc/scrum/reverse/troubleshoot` を drive にする運用は廃止 = V7)。

| mode | file | kind (§1.3) | drive (§1.6、専門職) | layer | workflow_phase (§1.5) | owner (§2.5) | 承認者 (§2.6.3) | Forward 合流点 |
|------|------|-------------|--------------|-------|----------------------|--------------|------------------|----------------|
| **Discovery** | [discovery.md](discovery.md) | `poc` | 専門職継承 (be/fe/fullstack/db/agent) | `cross` | **S0-S4** | po + tl | — | S4 `decision_outcome=confirmed` → L1 (要求) / L3-L6 設計 (終点で Reverse 昇華) |
| **Scrum** | [scrum.md](scrum.md) | `poc` | 専門職継承 | `cross` | **S0-S4** | po + aim | — | S4 `decision_outcome=confirmed` → L1 (increment は Reverse fullback で昇華) |
| **Reverse** | [reverse.md](reverse.md) | `reverse` | 専門職継承 (逆引き対象) | `cross` | **R0-R4** | tl | po (R3 Intent 検証、§1.8 fail-close) | R4 `forward_routing` → L1/L3/L4/L5/gap-only (schema enum) |
| **Recovery** | [recovery.md](recovery.md) | `recovery` | 専門職継承 (復旧対象、例 fullstack) | `cross` | **禁止** (phase なし) | tl + po | tl (再開点) + po (スコープ) | 収束後 → 中断工程 / 再発防止 → L14 |
| **Incident** | [incident.md](incident.md) | `troubleshoot` + `recovery` (内包) | 専門職継承 (障害対象) | `L7` (troubleshoot) / `cross` (recovery) | 禁止 | オンコール + tl + pm | オンコール + tl + pm の三者 | 収束後 → L12/L13 / 恒久対策 → L1-L6 / postmortem → L14 |
| **Refactor** | [refactor.md](refactor.md) | `refactor` | `be/fe/fullstack/db/agent` | `L7` | 禁止 | se + tl | — | L7 内部改善のみ (L8/L9 を保護網に流用) |
| **Retrofit** | [retrofit.md](retrofit.md) | `retrofit` | `be/fe/fullstack/db/agent` | `L7` | 禁止 | se + tl | config_drift は tl 単独 | upgrade 後 → L4 / 影響範囲 L4-L7 / 要件変更 → L1/L3 |
| **Add-feature** | [add-feature.md](add-feature.md) | `add-design` + `add-impl` (内包) | 親 PLAN と一致 | `L3-L7` | 禁止 | aim + tl | — | 既存維持 + L3/L7 差分 (影響範囲へ直接接続) |
| **version-up** | [version-up.md](version-up.md) | 親 kind 維持 + `version_target` (新 kind なし) | 対象 work 継承 | 対象実 layer | 禁止 | aim + tl + po | po (将来版活性化) | 将来版活性化時 → add-feature で L2/L3→L7 合流 |
| **Research** | [research.md](research.md) | `research` | `be/fe/fullstack/db/agent` | `L1-L4` | 禁止 | tl | — | ADR が L1 要求 / L4 基本設計の判断材料 |

> **multi-kind セルの読み方 (§1.10 排他制約と整合)**: Incident の `L7 (troubleshoot) / cross (recovery)` や Add-feature の `add-design + add-impl` のように 2 kind を内包する mode は、**1 PLAN = 1 kind = 1 layer** が原則 (§1.10 排他: 横断駆動 kind→layer=cross / それ以外→単一実 layer)。Incident は **troubleshoot として起票するなら layer=L7、recovery として起票するなら layer=cross** であり、両者を 1 PLAN に同居させない (障害対応の中で復旧が必要なら recovery PLAN を別途起こす)。表の「/」は OR (kind に応じた択一) であって 1 PLAN への両載せではない。

---

## 3. mode ecosystem との対応 (concept §2.5 + version-up 追補)

concept §2.5 の元の **9-mode** は **Forward + 上表 8 mode (Research と version-up を除く)**。その後、
version-up は PLAN-DISCOVERY-09 / PLAN-REVERSE-140 で「今版に入れないが将来版へ保全する」駆動モデルとして
正本化され、Research は §1.3 VALID_KIND / `research/*` ブランチとして mode 化している。したがって本台帳の
運用上の全 mode は Forward + Discovery / Scrum / Reverse / Recovery / Incident / Refactor / Retrofit /
Add-feature / version-up / Research であり、古い 9-mode 表記だけを根拠に version-up を漏らしてはならない。

| 区分 | mode |
|------|------|
| 本体 | Forward (`../forward/`) |
| 経路 2 系 | Reverse / Discovery / Scrum |
| 経路 3 系 | Add-feature |
| 補助 1 系 | Recovery / Incident |
| v3.1 新規 | Refactor / Retrofit |
| 将来版保全 | version-up |
| 前段調査 | Research (§2.5 9-mode 外。kind/branch として正本) |
| **工程専門** (mode でない) | screen-design (Forward L2 内) / frontend-design (Forward L10 内) — concept §2.5、独立経路にせず Forward 設計文脈の工程専門として運用 |

---

## 4. signal → mode 自動 routing (concept §2.6.1、機械化目標)

| signal | mode |
|--------|------|
| `drift` (schema/contract 差分) | Reverse (normalization) |
| `debt_degradation` / `code_smell` / `structural` | Refactor |
| `dependency_outdated` / `upgrade` / `config_drift` | Retrofit |
| `agent_runaway` / `context_exhaustion` / `regression_dev` / `runaway` | Recovery (承認必須) |
| `production_incident` / `hotfix_required` / `regression_prod` (env=prod) | Incident (承認必須) |
| `feature_addition` / `scope_extension` | Add-feature |
| `version_deferral` (将来版へ保全) | version-up |
| `user_feedback_iteration` / `requirement_continuous_refinement` | Scrum |
| 要件未確定 / 実現性不透明 | Discovery |

`env=prod` / regression 系は優先的に Incident / Recovery に倒す。本番→Incident・開発中→Recovery で分岐 (§2.6.5)。

---

## 5. 共通原則 (全 mode 共通)

- **出口 = Forward 合流**: どの mode も最終的に L0-L14 へ戻る。mode 固有で設計・テスト・検証を完結させない。
- **承認境界**: Recovery / prod Incident / config_drift Retrofit は人間サインオフ必須 (§2.6.3、承認者は本台帳列)。
- **execution mode 参照**: cross-agent review が self-review に化けないよう判断ゲートは `helix status` の execution mode を参照する (§2.6.4 / §2.1.2.1)。
- **mode 連鎖**: Discovery 終点 → Reverse 昇華 / Scrum increment → Reverse fullback / Incident・Add-feature の前段に Discovery (要件未確定時) or Reverse (既存逆引き時) / Retrofit の影響評価前段に Reverse (`upgrade`) / Research で「作れるか不明」→ Discovery 切替 / **Add-feature (最頻) の bottom-up build (L6/L7) → 後段 Reverse fullback で L3 要件 back-fill (常態、add-feature.md §1.1 経路 B)**。

---

## 6. git ライフサイクル (Issue 起点スパイン、利用者チーム向け仕様)

> **正本 = requirements §6.8 / §6.9**。本節はその mode 別要約。**harness 利用者チームに課す製品仕様**であり、harness 開発者 (solo/main 直) の手順ではない (Phase 0-A では緩和、Phase 0-B で有効化、§6.5)。

全 mode は **問題/signal 起点 → Issue → PLAN → branch → PR+CI → merge+close** の一本道に乗る (§6.8.1)。Forward も「発注元 Issue (要件)」起点。

| mode | 起点 (Issue 化する signal) | branch prefix (§6.1) | merge/CI 単位 (§6.9) | close |
|------|---------------------------|----------------------|----------------------|-------|
| Forward (design) | 発注元要件 Issue | `design/*` | 設計 PLAN/hub 完了 PR で vmodel-lint CI | hub merge |
| Forward (impl) | 同上 | `feature/*` | **G7 trace freeze で全量 CI (本命アンカー)** | G7 merge |
| Discovery / Scrum | requirement_undefined / user_feedback | `poc/*` | **CI 回さない** (使い捨て)。confirmed→Reverse→`feature/*` | Reverse 合流時 |
| Reverse | drift / fullback | `reverse/*` | R4 routing 先 `feature/*` の G7 | Forward 合流時 |
| Incident / Recovery | regression_prod / regression_dev | `hotfix/*` | 緊急 harness-check サブセット | hotfix merge + 恒久対策は別 Issue |
| Add-feature | feature_addition | `add/*` | 親 PLAN と同 PR | merge → **最頻は後段 `reverse/*` で L3 要件 back-fill** (§1.1 経路 B) |
| Refactor / Retrofit | debt_degradation / dependency_outdated **or improvement-backlog** | `refactor/*` | L7 内 G7 | merge |

**右腕 (L8-L14) は post-merge/scheduled CI** で、失敗時は §6.8.4 に従い **Issue を自動起票 → Recovery/Incident/Add-feature で差し戻し**。poc/* は merge せず CI 分を浪費しない (§6.4)。粒度は **1 Issue = 1 PLAN/hub = 1 branch** (§6.8.2)、PLAN frontmatter `github_issue_id` で close 漏れ機械検知。

## 7. このドキュメントの位置付け

本台帳および各 mode 定義は **正本化済** (PLAN-REVERSE-01、2026-06-04)。gate の機械検証条件は [../gates.md](../gates.md)、git ライフサイクルの正本は requirements §6.8/§6.9。

## MCP-VERIFICATION-PROFILE-WORKFLOW（MCP 検証 profile workflow）

全 mode は requirements §6.8.10 の MCP / external verification profile ルールを継承する。

- mode は workflow signal と profile recommendation を出す場合に限り、MCP server または外部 test foundation を推奨できる。
- Add-feature / Refactor / Retrofit の discovery で profile、plugin、MCP server、test foundation を追加する場合、変更を `backprop_decision` で分類する。
- Recovery / Incident は診断に MCP/browser/GitHub profile を使える。通常の branch push、draft PR 作成、PR body 生成、CI 状態取得は `gh` 委譲認証と repo write preflight が通れば AI agent の通常運用として扱う。branch protection / ruleset / release / tag publish / repository rename / force-push / 本番・認証・secret・権限境界を変える write action は action-binding approval または Incident 承認と、該当操作に必要な admin preflight を必須とする。
- Discovery / Scrum は profile を PoC evidence として使えるが、confirmed outcome は Forward または Reverse back-fill を必要とする。
- profile の利用可否は environment state である。Docker、browser、auth、MCP server installation の欠落は finding として扱い、無関係な local check を無効化しない。
- mode または gate で profile rule が有効な場合、accept/close には normalized evidence が必要である。

## CANONICAL-DOCUMENT-EXPORT-WORKFLOW（正本 document export workflow）

全 mode は requirements §6.8.11 の canonical document export ルールを継承する。

- Concept、requirements、detailed design、PLAN、ADR、test-design document は derived artifact としてのみ CSV/Markdown/XLSX/PPTX へ変換できる。
- Add-feature / Reverse / Recovery / Retrofit の discovery で新しい export surface が必要になった場合、変更を `backprop_decision` で分類する。
- CSV と Markdown summary export は built-in の document conversion output とする。
- XLSX/PPTX export は renderer readiness evidence を必要とし、ExcelJS / SheetJS / PptxGenJS / D2 を暗黙 install してはならない。
- export された spreadsheet/deck は source document path、section ID、FR/AC/AT/PLAN/ADR ID、status、trace、evidence link を保持する。
- generated file は source document digest が変わると stale になり、refresh まで current evidence として使えない。
- export file に基づく人間判断は、accept/close 前に通常の review/gate/handover evidence として記録する。

## TOOL-ADAPTER-WORKFLOW（ツール adapter workflow）

全 mode は requirements §6.8.9 の optional tool adapter ルールを継承する。

- Dependency-cruiser、Knip、Madge、Graphviz、Mermaid、D2 は optional adapter であり、source-of-truth system ではない。
- mode は workflow signal と readiness probe を通じてのみ adapter を推奨できる。
- package / executable / config readiness の欠落は finding であり、暗黙 install の trigger にしてはならない。
- adapter raw output は bounded evidence に留まり、gate が消費できる output は normalized DB row のみである。
- auto-fix/delete behavior は、人間承認済み PLAN と rollback evidence がない限り scope 外である。

## LOWER-L-REVERSE-BACKPROP（下位 L の Reverse backprop）

全 mode は requirements v1.2 §6.8.8 の whole-system consistency rule を継承する。下位 layer task (L4-L14) が addition、ticket、acceptance change、DB projection、guardrail、workflow rule、automation rule を作成または発見した場合、その mode は `backprop_decision` で分類する。

- `local_impl_only`: upstream requirements/design/acceptance が unchanged であり、その理由を audit に記録した場合だけ local close できる。
- `requires_design_normalization`: Reverse `normalization` / `design` へ route し、L4-L6 または test-design を back-fill する。
- `requires_requirement_backprop`: Reverse `fullback` / `design` へ route し、Forward completion 前に L1/L3 FR/AC/AT/registry へ back-merge する。
- `requires_concept_policy`: human policy judgment のため停止し、Forward 再開前に concept / requirements を更新する。

これは Add-feature bottom-up work、Recovery/Incident regression、Retrofit impact finding、Refactor discovery、right-arm verification failure、improvement-backlog item に適用する。`requires_*` back-prop decision が open の間、mode は accept/close を主張できない。

## CODING-RULE-WORKFLOW（coding-rule 規約 workflow）

全 mode は coding-rule SSoT を workflow artifact として使う。

- SSoT: `docs/governance/coding-rules.md`.
- Issue -> PLAN -> branch -> PR+CI は coding-rule impact として `unchanged`、`updated`、`not_applicable` のいずれかを保持する。
- TypeScript/Bun implementation style、lint tooling、naming、typing、error-handling、generated-code boundary を変更する mode は、implementation freeze 前に SSoT を更新する。
- machine gate: `helix doctor` は `checkCodingRules` を実行し、workflow placement または SSoT reference の欠落は hard failure とする。
## DDD-TDD-WORKFLOW（DDD/TDD 規約 workflow）

- SSoT: `docs/governance/ddd-tdd-rules.md`
- mode 固有の変更も domain-boundary、invariant trace、Red-first evidence、oracle-strength、integration GWT check を継承する。
- quantitative check と qualitative review は別 step だが、freeze に影響する decision には両方が必要である。
## TDD-STYLE-DRIVE-FIRING（TDD-style 駆動 firing）

drive model はすべて同じ Red/Green 形状ではないが、いくつかは TDD-style loop として管理できる。共通 rule は次のとおり。

- Red: test、design、dependency、DB projection、evidence gap のいずれかを観測した状態。
- Yellow: PLAN/target は存在するが、regression/design/dependency fence が閉じていない状態。
- Green: paired evidence ID が存在し、required command が pass し、relation impact が closed で、review が Green evidence 後に実施された状態。

| 対象 | 適合度 | Red trigger source |
| --- | --- | --- |
| Forward design / `kind=design` | strong | `descent_obligation_missing`, `pair_artifact_missing`, `test_design_missing` |
| Add-feature | strong | `feature_addition`, `scope_extension`, `acceptance_gap` |
| Refactor | strong | `code_smell`, `structural`, `debt_degradation`, `artifact_progress_red` |
| Reverse | strong | `drift`, `schema_contract_gap`, `as_is_test_design_missing` |
| Retrofit | strong | `dependency_outdated`, `upgrade`, `config_drift`、stale `dependency_edges` |
| Recovery / Incident | strong | `regression_dev`, `regression_prod`, `forced_stop`、失敗した `quality_signals` |
| screen-design | strong | `screen_requirement_gap`, `wireframe_missing`, `screen_impl_pair_gap` |
| frontend-design | strong | `a11y_regression`, `visual_regression`, `token_drift`、UX feedback（要望） |
| Discovery / Scrum | partial | uncertainty または user feedback を hypothesis/increment verification へ変換したもの |
| Research | weak | decision evidence と ADR readiness。通常の Red-Green loop ではない |

DB firing source は `findings`、`quality_signals`、`feedback_events`、`graph_nodes`、`dependency_edges`、`impact_results`、`artifact_progress` である。
これらは workflow signal または PLAN input だけを作り、authored PLAN/docs/source を直接 rewrite しない。machine-readable contract は `src/workflow/contracts.ts` の `classifyDriveTddFits` である。
