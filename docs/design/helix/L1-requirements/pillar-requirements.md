---
title: "HELIX L1 要件 — charter P0–P9 → 業務要求 (HBR) / 非機能要求 (HNFR)"
layer: L1
kind: design
status: confirmed
created: 2026-06-28
updated: 2026-07-01
owner: PO (人間 / RetryYN)
plan: PLAN-L1-06-helix-solo-conversion
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
pair_artifact: docs/test-design/helix/L1-pillar-operational-test-design.md
---

# HELIX L1 要件 — charter P0–P9 → HBR / HNFR

> charter §7「P0–P9 を L1 の業務要求 (BR-*) / 非機能要求 (NFR-*) へ降ろす」の **confirmed 要件**（PLAN-L1-06
> Step 6、PO による G-REQ.L1 re-freeze 承認済み）。
> ID は HELIX 名前空間 **HBR-/HNFR-** で harness の confirmed BR-NN/NFR-NN 件数・doc-consistency 正本を侵さない
> （harness L1 は solo 化のみ、HELIX 柱要件は本書で additive に積む）。各要件は「機械強制可能・検証可能」に書く。
> precedence: 仕組み=harness 上 / 機能=旧 HELIX 上、機能は仕組みを超えない。

## §0 既存 harness FR インベントリ接地（重複防止）

本書は top-down（charter 柱）だけでなく **bottom-up（既存 harness FR-L1-01..51）と突き合わせて**起草する
（設計駆動キュレーション原則: 各粒度で既存機能を洗い出し→取捨選択→機能一覧整合）。各 HBR/HNFR は
**「既存 FR（接地・再利用）」＋「GAP（net-new で本要件が足す分）」** を明示し、既存機構を二重定義しない。
インベントリ突合の要点（pmo-project-explorer、51 FR 全件マップ済）:

- **既存 FR が厚い柱**: P0（19 FR）/ P4（10 FR、ただし検出のみ・修復欠）/ P9（11 FR、projection のみ・enforcement 欠）。
- **既存 FR が薄い/欠の柱（HELIX の真の net-new）**: **P6**（FR-L1-05/17 のみ、gated-push/PR auto/CI auto-fix/tag は FR 無し）、**P8**（ほぼ皆無、外部検索/skillify/sandbox/escalation 境界の FR 無し）、**P7**（memory は impl detail 止まり、2 層 architecture/共有 access/Glossary SSoT の FR 無し）。
- **GAP を実装で先行充足（一部）した柱**: **P2/P7** — subagent loop 構造・worker≠verifier・2 層 memory architecture + 実 runtime bridge は既存 FR に無かった GAP で **PLAN-L7-175/176/177 が green**。typed agent↔tool contract は **PLAN-L7-213**、loop effort-budget は **PLAN-L7-214**、hosted/API preflight core は **PLAN-L7-215** で L7 実装済み。ただし**残 GAP あり**（HNFR-AC: 全 agent rule/memory 一般化、P7: Glossary SSoT 連結）→ 柱全体は partial、§1 GAP 列参照。

## §1 業務要求 (HBR、charter 柱 → 能力要件、既存 FR 接地つき)

| ID | 業務要求 (機械強制/検証可能) | 既存 FR（接地・再利用） | GAP（本要件の net-new） |
|----|------------------------------|--------------------------|--------------------------|
| **HBR-P0** | **逸脱受け止めと Forward 収束** — 駆動 workflow で逸脱・障害・暴走を受け止め `forward_return` 規律で必ず Forward 正本へ収束。AI 暴走ガード（lock/budget time-cap/Recovery） | FR-L1-08/10/11/13/14/15/16/18/24/25/26/27/44（mode/recovery/routing/onboarding） | `forward_return` を **first-class の機械検証規律**として未定義（複数 FR に暗黙散在）。**runaway guard（budget time-cap）standalone FR 無し** |
| **HBR-P1** | **要件承認後フル自動＋連続自律走行** — engine（resume 3 条件/job-queue/budget time-cap/fresh-session）で完走、Scrum 分割でスケール、version-up で今版外作業を保全 | FR-L1-13/23/29/30/31/42（Forward/Scrum fullback/screen/context handover/handover） | **continuous-run engine 自体（heartbeat/job-queue/budget time-cap/無人再入）の FR 無し**。**version-up lifecycle（`version_target`/タグ）FR 無し** |
| **HBR-P2** | **オーケストレーション根本強化＋ループエンジニアリング** — サブエージェントを loop 単位（解釈→検証→計画→実行→検証→返却）で動かし orchestrator 統括、worker≠verifier 自己評価禁止、effort/budget 制御。Claude 視点だけでなく **Codex CLI / Codex IDE / hosted API tool surface でも同じ状態遷移・同じ判定**で動く | FR-L1-09/12/28/37/39/41/46/48（guard/injection/W設計/model-effort/difficulty/drive-routing/roster/CLI） | loop 構造・worker≠verifier 専用 FR は既存に無し → **PLAN-L7-175/176/177 で一部充足済**。Codex `spawn_agent` guard parity は PLAN-L7-139 continuation で direct spawn/bulk spawn を fail-close 化済み。typed agent↔tool request/response registry core は PLAN-L7-213 で doctor hard gate 化済み。loop 内 effort-budget 制御は PLAN-L7-214 で `tickLoopEffortBudget` + `tick` 接続済み。hosted/API preflight core は PLAN-L7-215 で `validateAdapterParityMap` / `requireHostedSurfacePreflight` + CLI JSON evidence 化済み |
| **HBR-P3** | **強い検証基盤（完全自動の安全要）** — pair_closure/片肺禁止/機械 vs AI 判定境界を機械強制、成果を外部真実に照合（held-out） | FR-L1-02/03/05/21/22/25/45/50（TDD/trace/gate/W-gate/FE detector/refactor/doc-reviewer/DDD-TDD） | **pair_closure 専用 FR・片肺禁止 standalone・機械 vs AI 境界の formalize 無し**。**external-truth grounding（held-out）FR 無し** |
| **HBR-P4** | **自動保守システム** — drift/劣化/不整合を自動検出→**自動修復**、detection-routing 循環、学習ループ（recipe 蓄積/予防 gate 昇格）。根幹=P7 メモリ | FR-L1-08/11/18/19/33/34/36/38/43/49（検出・学習・inventory・評価・drift-lint） | **検出は厚いが「自動修復」FR 無し**。**learning→promote-to-gate/detector 専用 FR 無し**。劣化(flake/perf)検出未被覆 |
| **HBR-P6** | **GitHub 運用自動化 + 配布/フルセットアップ** — gated push（全 gate PASS で authorized、raw push fail-close deny）/ PR クロスレビュー自動 / CI 失敗時 auto-fix-repush / タグ版管理。加えて、配布 tag/release pin から **1 コマンドで repo-local hooks・Claude/Codex adapter・state/memory/handover・GitHub rules/checks の baseline を bootstrap**できる | FR-L1-05/17（fail-close gate / CI-PR linkage）**のみ＝薄い**。配布/途中導入の接地は FR-L1-44 + technical L1 の GitHub-pull/tag-pin/setup 方針 | **gated-push 認可・PR 自動 cross-review・CI auto-fix-and-repush・tag/version lifecycle すべて FR 無し → 大きく net-new**。**final distribution + one-command full setup** は HELIX L1 で first-class 要求化し、L3/L7 で `ut-tdd setup`（PLAN-M-02 後は `helix setup`）へ展開 |
| **HBR-P7** | **ハーネスネイティブ 2 層メモリ** — harness-memory（保守の根幹）と project-memory を分離、**全エージェント同一記憶共有（silo 禁止）**。Claude 内蔵メモリではなく Codex からも読める `.ut-tdd/memory` / provider handover を SSoT にする | FR-L1-19/36/38/46/47（learning/skill・model 評価 projection/roster/skill — memory は impl detail 止まり） | 2 層 memory **architecture FR・cross-agent 共有 access・Glossary SSoT 無し** → architecture は **PLAN-L7-175/176 で充足済**、残=**Glossary SSoT 連結 / Codex SessionStart surface と Claude surface の同一 bounded recall 検証** |
| **HBR-P8** | **外部連携・外部検索（原則）** — 外部（Web/docs/OSS/tool）を検索・参照し幻覚を外部照合で抑止、有益知見をスキル化して自己取込（自己拡張） | （直接無し。FR-L1-09/05 が security guard 側のみ） | **外部検索/web grounding・skillify ループ・sandbox/trust-boundary すべて FR 無し → ほぼ全部 net-new**（最大の空白） |
| **HBR-P9** | **HELIX DB 収束（trace/drift/coverage/contract）** — 成果物を台帳に収束し整合を機械追跡、**DB 未収束＝未完了**、影響範囲分析の資産保全 backbone | FR-L1-03/04/06/07/18/20/33/35/40/49/51（trace/registry/hook/doctor/observability/inventory/readiness/drive-state/drift/progress-color） | **「DB 未収束＝未完了」enforcement gate 無し**（green-command-digest が部分代替）。**cross-artifact relation graph FR・contract ledger 無し** |

## §2 非機能要求 (HNFR、charter 柱の非機能側面)

| ID | 非機能要求 (検証可能) | 既存 FR/機構（接地） | GAP（本要件の net-new） |
|----|----------------------|----------------------|--------------------------|
| **HNFR-P3** | **検証の厳格性** — pair_closure/片肺禁止/自己評価禁止を fail-close 強制、合格主張は実証跡（test/command green）裏付け必須（prose 主張禁止、coding≠substance） | review-evidence green_commands + green-command-digest（substance gate）/ FR-L1-05 | **external-truth grounding の厳格性基準**（内部整合だけでなく外部照合）を非機能水準として未定義 |
| **HNFR-P5** | **コンテキスト効率** — 動的注入・可逆圧縮で「必要分だけ」渡し長時間無人自走を支える。閾値到達前に handover 要約→fresh session、注入予算を持つ | FR-L1-12/31/37/42/47（injection/context-handover/effort/handover/skill-pack） | **injection budget（上限）・handover 前の圧縮/要約 contract が FR 無し**（FR-L1-31 は閾値 trigger のみ）。外部 delta=headroom CCR 可逆圧縮 |
| **HNFR-P8** | **外部連携セキュリティ（厳格・hard 制約）** — 外部連携は secret 漏洩防止/信頼境界/サンドボックス下でのみ。**不可逆操作の escalation 境界**＝本番/認証認可/決済/PII/secret/license/schema migration/破壊的データ/外部 API・infra 変更のみ人間へ戻す | FR-L1-09（agent guard）/ FR-L1-05 / SECRET_PATTERN | **sandbox/trust-boundary の機能要件化・escalation 境界の FR 化が無し**（CLAUDE.md 安全境界に prose で在るが FR 未昇格） |
| **HNFR-AC** | **エージェント整合（同一記憶・同一規則）** — 全エージェントが単一規則セットに従い同一記憶（P7 2 層）を共有、per-agent 規則乖離・記憶サイロ禁止。`rule-drift` を全エージェントへ一般化し、Claude/Codex の tool 名・hook surface 差分を adapter map で吸収する | rule-drift（Codex↔Claude adapter 乖離検査）/ FR-L1-46/47 / codex-hook-adapter doctor | rule-drift は 2 adapter のみ。**全 agent への一般化 + 共有 memory access の機械強制 + Codex hosted API surface（repo hook 非強制）での明示 preflight が net-new** |

## §2.5 外部研究 delta（2026-06-28、L1 re-freeze 反映済み、L3 一次検証済み）

PLAN-L1-06 Step 2/3 の外部研究パス（pmo-tech-docs 委譲、2025–2026 ソース照合）で surface した、net-new GAP を
sharpen する delta。**verify-don't-blindly-adopt**: 概念 delta は HELIX precedence（仕組み≦harness）に適合する
もののみ採用候補とし、**個別ツール・数値・出典は PLAN-L3-06 で一次検証し、HR-FR/HR-NFR/HAC へ降下済み**。仕組みを超えない。

| 優先 | 対象 GAP | delta（採用候補・概念） | 出典系統（2025–2026、要一次検証） |
|------|----------|--------------------------|-----------------------------------|
| P1 | HNFR-P8 | **escalation 境界を prose→FR 機械強制**へ昇格。不可逆操作のみ human approval、approval は action-binding（actor/tool/target/params/timestamp/expiry 記録）。**承認範囲は最小化**（過剰承認＝click-through 疲弊＝prompt-injection 攻撃面、というセキュリティ根拠つき） | OWASP LLM06:2025 Excessive Agency |
| P1 | HBR-P6 | gated-push の具体手段 = **GitHub Rulesets push rules（bypass-actor 限定で raw push deny）+ Merge Queue（required checks 全通過後のみ merge）**。GAP 列に実装手段として明記し L3 設計者の判断材料に | GitHub Docs（rulesets / merge queue） |
| P1 | HNFR-P5 | **artifact trail（変更ファイルパス追跡）を汎用圧縮と分離し harness DB へ専用記録**。汎用 summarization では artifact trail が消失する実証あり → projection-writer 連携を L1 から明示 | Factory AI context-compression 分析 |
| P2 | HNFR-P3 | external-truth grounding に **measurable AC**: 「外部参照 URL なき断定クレーム＝未検証＝gate reject」。span-level verification + source attribution（URL+公開日+版）を substance gate へ。self-verification 単独は禁止（worker≠verifier と連動） | RAG span-level verification / OWASP |
| P2 | HBR-P8 | sandbox/trust-boundary 具体化方針 = **外部コード実行は MicroVM デフォルト**（低リスク external call は gVisor、無制限禁止）。外部 API/GitHub は **action 単位の short-lived / fine-grained token**（タスク完了/失敗で失効、再利用禁止） | MicroVM(Firecracker/Kata) / short-lived token |
| P2 | HNFR-P5 | injection budget の **3 層 context 管理**（直近 N ターン逐語 / 中間 rolling summary / 古域は目標・制約のみ）。handover 圧縮は **anchored iterative**（sections 固定・新規 truncate 分のみ merge、全再生成禁止）。層境界ターン数は**要数値化** | Anchored Iterative Summarization / 3 層管理 |
| P3 | HBR-P6 | 自律 tag 版管理ツールは **semantic-release vs Release Please を ADR 化**（Release Please は PR 経由 gate レビューを持ち HELIX approval gate と親和）。CI auto-fix の **repush 信頼度閾値**（暫定 0.75+、未達は Issue 起票→escalate）を FR 化し際限ない repush を防ぐ | semantic-release(MIT) / Release Please(Apache-2.0) |

**採用しなかった/保留**: self-verification 単独（HNFR-P3 が明示禁止、best practice も不支持）/ ARIA delegation graph（arxiv 段階、実用 OSS 未確認）/ Anthropic compact beta（harness handover と競合有無 未確認）。

**L3 一次検証結果（PLAN-L3-06）**: Release Please / semantic-release / GitHub Rulesets / Merge Queue / OWASP LLM01・LLM06 / Firecracker / gVisor / GitHub token docs は L3 §2.5 で一次出典を固定。ACON 等の論文実装は採用済み runtime 前提にせず、必要時は後続 PLAN で TS/Bun 再実装可否を個別検証する。**ADR-001 厳守: OSS は概念採取＋TS-Bun 再実装、bulk import 禁止。**

## §2.6 Codex runtime parity 要求（PLAN-L1-06 close 前追加、2026-06-28）

Claude 視点だけで L1 を閉じないため、P2/P7/HNFR-AC の acceptance overlay として以下を固定する。PLAN-L3-06 で `HR-FR-P2-03` / `HR-FR-P7-01` / `HR-NFR-AC-*` へ降下済み。

| 対象 | L1 要求 | L3/L7 での検証観点 |
|------|---------|--------------------|
| HBR-P2 / HNFR-AC | Codex の `apply_patch` / `write_file` / `exec_command` / `local_shell` surface は Claude の `Edit` / `Write` / `MultiEdit` / `Bash` と同じ guard intent に正規化される | `.codex/hooks.json` と `.claude/settings.json` が同じ TS entrypoint を呼ぶ。hosted API tool surface は repo hook が非強制であることを明示し、編集前 git/status preflight を要求する |
| HBR-P2 | hybrid では Codex worker の成果を Codex 自身が承認しない。Codex-only では cross-agent を僭称せず `intra_runtime_subagent` / `cross_agent_review: unavailable` を記録する | `selectVerifier` が opposite provider を選ぶ。single-runtime fallback は明示 status/block reason を持ち、self-review を gate PASS 根拠にしない |
| HBR-P7 | Claude/Codex どちらで開始しても同じ `.ut-tdd/memory` と `.ut-tdd/handover/provider` から bounded recall する | Claude 内蔵 memory / `.claude/agent-memory` を正本にしない。Codex SessionStart でも同じ memory surface（直近 12 件 / 240 字）を表示する |
| HNFR-AC | Codex 固有の subagent/tool surface（例: `spawn_agent`）は、guard parity が未実装なら fail-close または明示 deferred とし、自由委譲面を作らない | `spawn_agent|spawn_agents_on_csv` は Codex hook adapter の agent-guard で `agent_type` allowlist / direct model override / task body / bulk spawn を fail-close 検証する。新 surface は tool contract registry / deferred follow-up のいずれかで機械追跡し、未ガード surface を「存在しない」扱いにしない |

## §2.7 Distribution / full setup 要求（2026-06-28 追補）

最終的に「配布して、利用者がコマンドで簡単にフルセットアップできる」状態を L1 能力境界に含める。
既存 harness L1 には GitHub-pull / tag-pin / `setup` / onboarding 方針があるが、HELIX 柱要求では
P6/P9 の確定 GAP として明示する。

| 対象 | L1 要求 | L3/L7 での検証観点 |
|------|---------|--------------------|
| HBR-P6 / HBR-P9 | 配布は GitHub tag/release pin を正本とし、現行機械識別子では `ut-tdd setup`、PLAN-M-02 の rename 後は `helix setup` 相当の 1 コマンドで full bootstrap できる。fresh repo だけでなく **既存プロジェクト途中導入**にも対応する | fresh repo と既存 repo の両方で repo-local hook、Claude/Codex adapter、`.ut-tdd`/`.helix` state、memory/handover、GitHub rulesets/required checks plan、doctor baseline が生成される。既存 docs/code/state は import report と skip_sub_doc/段階移行により取り込み、未整備 sub-doc を理由に即 block しない |
| HBR-P1 / HNFR-P5 | セットアップ後に fresh session / handover から迷わず再開できる。必要な next_action と未充足 gate が command output に出る | 手作業の doc 探索を前提にしない。再実行は idempotent で、既存設定との差分 plan を出す |
| HBR-P1 / HBR-P6 / HBR-P9 | セットアップ済みプロジェクトは tag bump / release pin 更新で version-up できる。更新は既存 harness state を読み、必要な migration / compatibility / rollback plan を出す | 現行 version と target tag を検出し、差分 plan・互換性 warning・rollback point・再実行 idempotency を記録する。破壊的 migration や不可逆な branch/ruleset 変更は自動適用しない |
| HNFR-P8 / HNFR-AC | branch protection/rulesets/secrets/外部 API 設定など本番・外部影響を持つ適用は dry-run/emit-only を既定にし、実適用は action-binding approval を必須にする。setup は既存ファイルを silent overwrite / delete / reset しない | `--dry-run` が無変更、apply は対象・actor・params・expiry を audit に残す。既存ファイル衝突は stop + diff plan + backup/merge 指示にし、hosted API surface でも同じ preflight を要求する |

## §2.8 Asset / progress visualization 要求（2026-06-30 追補）

HELIX 資産と進捗は、LLM に都度「図を描かせる」生成物ではなく、Markdown 正本・harness.db projection・relation graph から
再生成可能な view として可視化する。VSCode Webview / VSCode View / 将来の web dashboard は UI surface であり、
正本は docs と DB に置く。

| 対象 | L1 要求 | L3/L7 での検証観点 |
|------|---------|--------------------|
| HBR-P9 / HBR-P4 | 設計層、PLAN、test-design、implementation、gate、review evidence、dependency / trace edge を DB と Markdown から読み、進捗・未収束・依存関係・blocker を可視化する。LLM 生成の要約図を正本にしない | Markdown parser / harness.db / relation graph から Mermaid などの deterministic diagram data を生成し、LLM なしで再現できる。図の node/edge 数が DB source と一致し、未収束 artifact が見える |
| HBR-P7 / HNFR-P3 | skill 発火、agent slot、model run、runtime verification、handover、memory recall を計測 view として見られる。検証戦略・RUN & Debug 証跡と同じ evidence path に戻れる | skill_invocations / model_runs / test_runs / guardrail_decisions / runtime verification log event へ drill-down でき、projection-only evidence は runtime verified と誤表示しない |
| HNFR-AC / HNFR-P8 | VSCode Webview / View は read-only first。command 実行、外部 API、設定変更、branch/ruleset 変更など action surface は action-binding approval と preflight を要求する | Webview が DB/docs 由来の read model だけを描画し、秘密情報・provider transcript・machine-local absolute path を保持しない。編集/実行導線は CLI command copy または approval-bound action に限定する |

起票: `PLAN-DISCOVERY-10-helix-asset-visualization.md`。既存 `PLAN-L7-141-web-dashboard-component-derived` は中央 UI の
deferred 実装 PLAN であり、本要求の L1 起点・VSCode Webview/View・DB/Markdown deterministic visualization とは別に扱う。

## §3 harness 既存 FR/BR/NFR との関係（重複させない・接地済）

- harness `business-requirements.md` の BR-01..08/21/22・`nfr.md` NFR-15 件・**`functional-requirements.md` の FR-L1-01..51 は既存資産**。本書 HBR/HNFR は §0/§1/§2 で **各 FR を接地（再利用）**し、**GAP（net-new）だけを足す**。番号は HELIX 名前空間で衝突しない。
- **二重定義しない**: 既存 FR が被覆する部分は「既存 FR」列で再利用宣言し、本要件は GAP 列の差分のみを規定する。仕組みは harness 正本、HELIX は方向性＋GAP 能力を積む。
- **L3/L4 降下済みの整合**: 各 HBR/HNFR は PLAN-L3-06 で L3 FR/NFR/AC へ、PLAN-L4-51 で L4 block へ降下済み。接地 FR-L1-NN を親に持つ拡張として扱い、harness FR registry（51 件）と整合させる（新 FR は GAP 分のみ）。配布/フルセットアップは FR-L1-44（onboarding）と technical L1 の GitHub-pull/tag-pin/setup 方針に接地し、HELIX 側の「最終利用可能状態」として §2.7 を展開済み。
- **取捨選択メモ**: P2/P7 の GAP は一部を実装で先行充足（PLAN-L7-175/176/177）し、残りは PLAN-L3-06 / PLAN-L4-51 で要求・block 化済み。P6/P8 は既存 FR がほぼ無い HELIX の最大 net-new 領域として L3/L4 に優先降下済み。P0/P4/P9 は既存 FR が厚いので「enforcement 化（forward_return/auto-repair/DB-未収束＝未完了）」の薄い差分として降下済み。

## §4 pair（片肺禁止）/ 後続

- pair = `docs/test-design/helix/L1-pillar-operational-test-design.md`（OT-* ⇔ HBR/HNFR を 1:1。Step 4 で起票・対凍結）。
- **承認**: PO レビュー → G-REQ.L1 re-freeze（Step 6）で status=confirmed（A-143）。
- L3/L4 降下: PLAN-L3-06 / PLAN-L4-51 で、各 HBR/HNFR を L3 FR/NFR/AC と L4 block へ分解済み（next_pair_freeze=L3 は完了）。
- 一部実装済（partial）の P2/P7（HBR-P2/P7）は L3 back-fill（[[helix-orchestration-memory]] HR-BR-07/12/NFR-03 + runtime R 系 + HR-BR-13R/14R bridge）と整合。P2 typed contract は PLAN-L7-213、loop effort-budget は PLAN-L7-214、hosted/API preflight core は PLAN-L7-215 で実装済み。残 GAP（全 agent rule/memory 一般化 / Glossary SSoT）は PLAN-L3-06 で起票済み、実装・下位詳細は後続 L5+ / L7+ の対象。
