---
layer: L6
artifact_type: design_doc
status: confirmed
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
next_pair_freeze: L7
plan: docs/plans/PLAN-L6-05-setup-solo-team.md
---

> **L6 contract marker**: `planSetup(input: SetupInput) => SetupPlan` と `runSetup(input: SetupInput) => SetupResult` は unit-test 粒度の契約である。DbC pre/post/invariant は solo/team 検出と setup 出力を U-SETUP-001..007 へ写像する。

<!--
① 設計 (L6 機能設計) — helix setup solo/team GitHub 設定出し分け。
計画: PLAN-L6-05-setup-solo-team (add-design)。pair (③): docs/test-design/harness/L7-unit-test-design.md §1.7 U-SETUP。
実装 (②): src/setup/index.ts + src/cli (helix setup) (PLAN-L7-03-setup-solo-team, add-impl, 後続)。
土台思想: helix status の mode 検出 (src/runtime/detect.ts)「検出して提案する」を solo/team 軸へ拡張。
上位整合: 要件 §6.5 Phase 0-A/0-B / §9.1 A/B 種別 / L4 external-if GitHub 境界 (後段 Reverse で back-fill)。
-->

# HELIX — L6 機能設計: helix setup solo/team (参加規模検出 + 提案/確認/記録 + GitHub 設定出し分け)

## §1 概要

`helix setup` を、**利用者の参加規模に応じて GitHub 設定を solo (Phase 0-A) / team (Phase 0-B) で出し分ける** runtime 機能として設計する。(1) repo の owner 種別・collaborator 数・既存 CODEOWNERS/branch-protection を gh 経由で**検出**し、(2) solo/team を理由つきで**提案** → 人間確認 → 確定 phase を `.helix/state/setup.json` に**記録**し、(3) phase 別の GitHub 設定 (workflow / ISSUE・PR テンプレ / commitlint / CODEOWNERS / branch-protection) を生成する。`helix status` の mode 検出と同じ「**検出して提案する**」思想を solo/team 軸に拡張する。

> **PO 確定事項** (2026-06-02 / 2026-07-05 更新): ① solo/team は参加アカウント数等で自動「**提案**」するが、確定は**人間確認 + 状態記録** (数だけで自動確定しない) / ② branch protection / Required 化は GitHub 設定操作でファイルでは完結しないため**既定 emit-only** (スクリプト+手順生成) とし、明示 `--apply-branch-protection` 時だけ `gh auth status` と repository admin 権限を preflight して適用する / ③ **token は読まない・記録しない** (gh 認証状態に委譲) / ④ solo→team の格上げは**ガバナンス変更**であり、phase 確定なしに暴発させない。

> **なぜ「提案どまり」か**: 参加アカウント数は代理指標であり (bot / 単発 contributor / org-with-1 等の曖昧ケース)、かつ solo→team の格上げは branch protection / 必須レビューを ON にする**認可・本番影響**を持つ。要件 §6.5 でも Phase 0-A→0-B は「bootstrap-owner から各 team へレビュー責任を移管する**意図的マイルストーン**」であり、headcount で自動発火させない。検出は**既定値の提案まで**、確定は人間 + state 記録で**安定化** (毎回再推測しない)。

## §2 機能設計 (L6 粒度)

### §2.1 責務分離 (検出=提案どまり / 確定=人間+記録 / 適用=既定 emit-only)

| 層 | 責務 | 失敗 / 安全方針 |
|----|------|----------------|
| **検出** (`detectProjectScale`) | gh で owner 種別 / collaborator 数 / 既存 CODEOWNERS・protection を読む。**判定も適用もしない** | never throws。gh 不在/未認証/権限不足 → 不明信号 (`unknown`/`null`) |
| **推奨** (`recommendPhase`) | 信号 → solo/team の提案 + 理由 + confidence。**純関数** | 不明信号 → solo (安全側) low confidence |
| **確定** (`runSetup` orchestration) | フラグ > 対話確認 (推奨提示) > 安全フォールバック で phase 確定 → `.helix/state/setup.json` 記録 | 非対話 + フラグ無し → solo |
| **生成** (`planSetup` / `emitSetup`) | phase 別の生成物計画 → テンプレ render → ファイル書込 (dry-run は書かない) | **token を書かない**。既存ファイル上書きは confirm 経由 |
| **適用要求** (`applyBranchProtection`) | **既定: スクリプト生成のみ (skip)**。`--apply-branch-protection` 指定時は `gh auth status` と repository admin 権限を確認し、通過時だけ GitHub remote apply へ進む | gh 未認証 / repo metadata 不取得 / admin 権限不足 / API 失敗は `{applied:false, reason:*}` で停止。token は保持しない |

「検出→提案」は hook でなく **CLI subcommand** (`helix setup`) の対話フローで実現する (hook は足さない)。

### §2.2 型 / schema (D-CONTRACT)

```ts
type SetupPhase = "0-A" | "0-B";                    // 0-A=solo / 0-B=team

interface ProjectScale {                            // 検出結果 (生信号、判定しない)
  ownerType: "User" | "Organization" | "unknown";
  collaborators: number | null;                     // 取得不可は null
  hasCodeowners: boolean;
  hasBranchProtection: boolean | null;              // 取得不可は null
}
interface PhaseRecommendation { phase: SetupPhase; reason: string; confidence: "high" | "low"; }

interface GeneratedFile { path: string; category: "A" | "B"; purpose: string; }   // category=§9.1 A/B
interface GithubAction  { kind: "branch-protection"; script_path: string; applied: boolean; }  // 既定 applied=false
interface SetupPlan { phase: SetupPhase; files: GeneratedFile[]; actions: GithubAction[]; dryRun: boolean; }

interface SetupState {                              // .helix/state/setup.json (確定値 SSoT)
  phase: SetupPhase;
  decidedAt: string;
  decidedBy: "flag" | "confirm" | "fallback";
  signals: ProjectScale;                            // 4 フィールドのみ。token を含めない (recordSetupState で strip)
}
interface HelixProjectSetupState {                  // .helix/state/project-setup.json (HELIX project setup の completion 境界 SSoT)
  schemaVersion: "helix-project-setup-state.v1";
  setupCommand: "helix setup project";
  phase: SetupPhase;
  decidedAt: string;
  decidedBy: "flag" | "confirm" | "fallback";
  objectiveBoundary: ConsumerReadinessPlan["objectiveBoundary"]; // completionClaimAllowed=false を永続化
  postSetupWorkflow: {
    nextRoute: string;
    readinessOk: boolean;
    verificationCommands: string[];
    verificationMatrix: FirstRunVerificationMatrixRow[];
  };
}
interface SetupArgs { phase?: SetupPhase; dryRun: boolean; applyBranchProtection: boolean; teams?: { tl: string; qa: string; po: string }; }  // teams は CLI --tl-team/--qa-team/--po-team から
interface SetupResult { phase: SetupPhase; written: string[]; branchProtection: { applied: boolean; reason: string }; }
type TemplateSet = { [name: string]: string };     // テンプレ名 → 内容。emitSetup の render 入力 (内部 helper renderArtifacts が消費)
```

**秘匿原則 (CLAUDE.md 禁止事項)**: 認証 token を一切読まない (gh の認証状態に委ねる)。`SetupState.signals` は 4 フィールドへ strip して書き、gh 出力に万一含まれうる認証情報を state/docs/log に**残さない**。生成ファイルの内容に token を埋め込まない。

### §2.3 関数 signature + DbC (src/setup/index.ts + src/cli)

| 関数 | signature | pre | post |
|------|-----------|-----|------|
| `detectProjectScale` | `(deps: { gh: GhRunner; fs: FsReader }) => ProjectScale` | — | **never throws**。`gh api repos/{o}/{r}` の `owner.type` / `collaborators length` / CODEOWNERS・protection 有無を読む。gh 不在/未認証/権限不足 → `ownerType:"unknown", collaborators:null, hasBranchProtection:null`。**token は読まない** (gh 認証状態に委譲) |
| `recommendPhase` | `(scale: ProjectScale) => PhaseRecommendation` | — | **純関数**。`ownerType==="Organization"` OR `collaborators>1` OR `hasCodeowners` OR `hasBranchProtection===true` → `0-B` (high、既存 protection は team 既存運用の強信号) / `ownerType==="User"` かつ `collaborators<=1` → `0-A` (high) / それ以外 (unknown 信号) → `0-A` (low、安全フォールバック)。**`hasBranchProtection===null` (取得不可) / `collaborators===null` は unknown 扱いで単独では 0-B トリガーにしない** |
| `planSetup` | `(phase: SetupPhase, opts: { teams?; dryRun: boolean }) => SetupPlan` | — | **純関数 (I/O なし)**。`0-A` = 共通 (A 種別: adapter docs (`AGENTS.md` / `CLAUDE.md` / `.claude/CLAUDE.md` / `.claude/settings.json`) + harness-check.yml / ISSUE・PR テンプレ / commitlint / escalation-stale)。`0-B` = 共通 (A) + `CODEOWNERS` (B、teams 名を反映) + `setup-branch-protection.sh` + `GithubAction{applied:false}`。`actions.applied` は常に false (適用は別関数) |
| `emitSetup` | `(plan: SetupPlan, templates: TemplateSet, deps: { fs: FsWriter; confirm }) => string[]` | — | テンプレを render して書込 (内部 helper `renderArtifacts` が純 render を担う)。**`plan.dryRun` は書かず一覧 (path) を返すのみ**。既存ファイル上書きは `confirm` 経由。`AGENTS.md` / `CLAUDE.md` / `.claude/CLAUDE.md` は consumer 既存行を保持し、`<!-- HELIX:managed:start -->`〜`<!-- HELIX:managed:end -->` の managed block だけを挿入/更新する。`.claude/settings.json` など構造ファイルは既存なら confirm なしに上書きしない。**生成内容に token を含めない**。書いた path 配列を返す |
| `recordSetupState` | `(state: SetupState, deps: { fs: FsWriter }) => void` | — | `.helix/state/setup.json` を**上書き** (単一ファイル = 確定値 SSoT。再実行・phase 変更時は最新 state で上書きし append しない)。**`signals` は 4 フィールド (ownerType/collaborators/hasCodeowners/hasBranchProtection) のみへ strip** (それ以外を破棄 = 認証情報混入経路を遮断) |
| `recordHelixProjectSetupState` | `(state: HelixProjectSetupState, deps: { fs: FsWriter }) => void` | `runHelixProjectSetup` が dry-run ではなく、`consumerReadiness.objectiveBoundary` と `postSetupWorkflow` を計算済み | `.helix/state/project-setup.json` を上書きし、`scope=consumer_setup_readiness_not_whole_program_completion` と `completionClaimAllowed=false` を後続の `helix completion decision-packet --json` が復元できる形で保存する。さらに `postSetupWorkflow.verificationCommands[]` と同じ command set を `verificationMatrix[]` として保存し、各 row に `phase` / `command` / `writePolicy=no-write` / `requiresMaterializedPaths[]` / `expected` / `evidence` を残す。旧 `setup.json` の 4-field strip 契約は壊さず、HELIX project setup 専用の completion 境界と初回稼働 matrix だけを別 state として残す。 |
| `applyBranchProtection` | `(plan: SetupPlan, deps: { gh; confirm; isInteractive }, opts: { apply: boolean }) => { applied: boolean; reason: string }` | — | `opts.apply!==true` → `{applied:false, reason:"emit-only"}` (既定)。branch-protection action が無い場合は `no-action`。`apply=true` では `gh auth status`、`gh api repos/{owner}/{repo}`、`permissions.admin===true` を順に確認し、通過時だけ `gh api -X PUT repos/{owner}/{repo}/branches/main/protection` を実行する。成功時 `{applied:true, reason:"applied"}`、未認証/権限不足/API 失敗は `{applied:false, reason:*}` を返す |
| `runSetup` | `(args: SetupArgs, deps) => SetupResult` | — | orchestration。phase = `args.phase` (フラグ) > `confirm(recommendPhase(detectProjectScale()))` (対話) > `0-A` (fallback)。確定 → `recordSetupState` → `planSetup` → `emitSetup` → (`applyBranchProtection` は opt-in の要求として評価)。**非対話 + フラグ無し → 0-A**。**invariant: `--apply-branch-protection` は gh 認証/admin 権限があるときだけ remote apply へ進む** |

`GhRunner` = `(args: string[]) => { ok: boolean; stdout: string }` の注入インターフェース (test=mock、**raw token 非依存** = gh の認証状態に委ねる seam)。`FsReader`/`FsWriter` は session-log の `nodeDeps` パターン (I/O 注入で純粋化)。`confirm` = 対話確認の注入 (非対話時は安全既定)。`isInteractive` = TTY/CI 判定の注入。

### §2.4 file vs GitHub-API 境界 (本機能の核心判断)

| GitHub 生成物 | solo (0-A) | team (0-B) | harness が書くファイル? | GitHub 設定/API 操作? |
|---|---|---|---|---|
| harness-check.yml / ISSUE・PR テンプレ / commitlint / escalation-stale.yml (workflow) | ✅ | ✅ | YES (`GeneratedFile`) | NO |
| CODEOWNERS (team 名注入) | ✕ | ✅ | YES (`GeneratedFile`) | NO (gh で `codeowners/errors` 検証は可) |
| Required Status Checks 登録 / 必須レビュー数=1 / branch protection | ✕ | ✅ | **NO** | **YES (`GithubAction`、GitHub settings / branch protection)** → 既定は `setup-branch-protection.sh` 生成のみ。明示 `--apply-branch-protection` と gh/admin preflight 通過時だけ API apply する |

「ファイルで完結する」ものを `GeneratedFile`、「GitHub 設定操作」を `GithubAction` として**型で分離**し、実装時の境界混同を構造的に防ぐ。後者は既定 emit-only、明示 `--apply-branch-protection` と gh/admin preflight 通過時だけ適用する。**commitlint の配置 (root `commitlint.config.js` vs `package.json` キー) は §9.1 A 種別と repository-structure §8 config 最小化方針が衝突しうる** → **L7 impl で突合・解決済 (下記)**。

> **commitlint 配置の解決 (L7、2026-06-28)**: repository-structure.md は commitlint を `package.json` に集約し root config を 6 枚に抑える方針。よって `emitSetup` は**対象 repo の `package.json` が既に `"commitlint"` キーを宣言していれば root `commitlint.config.js` を emit しない** (`packageJsonDeclaresCommitlint` 純関数で判定)。self-host (HELIX repo) は `package.json` に集約済みなので dotfile 非生成 = governance 準拠かつ tracked-canonical hard gate を再発させない。`package.json` に key の無い generic consumer は従来どおり dotfile を emit する (非破壊・機能維持)。被覆 = U-SETUP-014。

> **HELIX project setup (L7、2026-07-01)**: HELIX 導入済み VSCode で新規 project を始める入口として
> `helix setup project` を追加する。これは `runSetup` の solo/team 判定・adapter/hook 投影・branch protection
> emit-only 境界を再利用し、追加で status / completion decision-packet / completion review-bundle / version-up dry-run / consumer doctor / rename plan / handover status / team run dry-run を開く `.vscode/tasks.json`、
> `.vscode/settings.json` と
> `.helix/memory` / `.helix/handover` / `.helix/evidence` / `.helix/teams` の project-local baseline を作る。
> `runHelixProjectSetup` は現行 `.helix` baseline と `helix setup project` canonical commandを
> `identifierTransition` として同時に返し、PLAN-M-02 cutover/action-binding approval が無い限り
> `blocked_pending_cutover_approval` / `mustNotApply=true` を出す。
> 親 `helix setup` は legacy solo/team adapter setup として残すが、text surface は
> `helix setup project` が HELIX project bootstrap の正入口であること、親 `setup` が VS Code task /
> `.helix` project baseline / rename packet を生成せず L14 completion evidence ではないことを明示する。
> HELIX project setup の branch protection は `githubPlan.planOnly=true` / `appliesRemote=false` /
> `applyCommandAvailable=true` を返し、既定は emit-only のまま、`--apply-branch-protection` が渡されると
> `gh auth status` と repository admin 権限を preflight してから適用する。
> これは GitHub branch protection / required status checks が repository workflow を変える外部設定であり、
> bootstrap command の副作用として実適用しないための U-SETUP-021 境界である。
> brownfield では `importReport` で既存 non-mergeable path を skipped/review_required として返す。
> ただし、前回 setup が生成した内容と完全一致する managed path は `identicalManagedPaths` に分類し、
> consumer-owned conflict として review へ送らない。これにより `helix setup project` の再実行は prompt-free /
> idempotent になり、同一 `.vscode/tasks.json` や `.helix/teams/default-hybrid.yaml` を import report blocker と誤認しない。
> `importReport.requiresReview=true` の間は、consumer CLI / artifact preflight が green でも
> `postSetupWorkflow.readinessOk=false` とし、`review_import_report` を解消するまで HELIX work ready とは扱わない。
> projected hook が呼ぶ bare `helix` CLI は `consumerReadiness` で PATH 解決性を preflight し、
> `not spawnable on PATH` を unresolved signal として扱う。
> `package.json.scripts.helix` / `bun run helix` は VSCode task / CI / package-local smoke の必須証跡であり、
> bare `helix --version` の代替証跡にはしない。package script だけが存在する場合、`helix-package-script` は
> true でも `helix-cli` は false のままなので、setup readiness は `fix_consumer_readiness` へ戻る。
> 逆に bare `helix --version` だけが解決しても、生成済み VS Code task / CI は `bun run helix ...` を使うため、
> `helix-package-script=false` のまま `fix_consumer_readiness` へ戻す。
> 解決不能なら `bun link` remediation を出して silent pass させない。
> `hasHelixCli` 未指定は green 扱いせず、`setup project` と `distribution plan` は bare `helix --version`
> 相当の実測値を readiness に渡す。
> wet run は `.helix/state/project-setup.json` に `objectiveBoundary.completionClaimAllowed=false` を保存し、
> 後続の standalone `helix completion decision-packet --json` はこの state を読んで
> `CONSUMER-SETUP-BOUNDARY` / `consumer_setup_boundary` の synthetic blocker を返す。
> これにより、空の consumer repo で `docs/plans` がまだ無い状態でも setup ready を L14 / whole-program completion に
> 読み替えない。
> `consumerReadiness.artifactReadiness` は実際の `runHelixProjectSetup` plan に束縛し、AGENTS / VSCode task / `.helix` baseline / default-hybrid team
> だけでなく、配布される `CLAUDE.md` / `.claude/CLAUDE.md` / Claude subagent / Claude slash-command も
> 初回稼働契約として検査する。これらが日本語 HELIX prose、`helix completion decision-packet --json`、
> `helix completion review-bundle --json` の exact digest / semantic digest 確認、
> `helix doctor --profile consumer`、PLAN-M-02 rename/cutover 境界、secret/PII guardrail を落とした場合は
> setup JSON の readiness 自体を `fix_consumer_readiness` へ戻し、consumer doctor だけに検出を先送りしない。
> Phase 0-B/team plan では `.github/CODEOWNERS` も readiness 対象に含め、TL/QA/PO team slug が解決済みで
> `{{TL_TEAM}}` / `{{QA_TEAM}}` / `{{PO_TEAM}}` placeholder が残る場合は `fix_consumer_readiness` へ戻す。
> さらに配布 `harness-check.yml` は artifact readiness の時点で検査し、`permissions: contents: read`、
> `write-all` または任意 scope の `write` permission 不在、`push` / `pull_request`、`pull_request_target` 不使用、secret 不要、package-local
> `bun run helix ...` smoke command 群を満たさなければ setup readiness を `fix_consumer_readiness` へ戻す。
> GitHub secure-use の read-only / least privilege 境界を JSON 上の `consumerReadiness.ci` 宣言だけに閉じ込めず、
> 実テンプレの drift でも fail-close する。
> 2026-07-03 追補: `harness-check.yml` の `run:` command は「必須 command を含む」だけでは不十分であり、
> `CONSUMER_CI_RUN_COMMANDS` の固定 13 本 (`bun install --frozen-lockfile`、10 本の `bun run helix ...` smoke、
> `bun run typecheck`、`bun run test`) と順序・件数が一致する場合だけ artifact readiness / consumer doctor を green にする。
> 余分な `run:` (例: `echo` / `curl` / `gh` / install 追加) は、`permissions: contents: read` と必須 smoke が揃っていても
> `fix_consumer_readiness` に戻す。GitHub Actions の `GITHUB_TOKEN` least-privilege と `pull_request_target` 境界を
> 「read-only smoke 固定集合」へ落とし込み、初回 setup CI が任意 shell 実行 surface へ広がらないようにする。
> 2026-07-03 追補1b: `escalation-stale.yml` も配布 workflow なので、placeholder/noop ではなく schedule 起動の
> no-write route audit として固定する。workflow は `permissions.contents=read`、`pull_request_target` 不使用、
> secret 不使用、`actions/checkout@v4` の `persist-credentials=false`、`oven-sh/setup-bun@v2`、固定
> `bun run helix handover status --json` / `bun run helix completion decision-packet --json` /
> `bun run helix completion review-bundle --json` / `bun run helix doctor --profile consumer --json` を持つ場合だけ artifact readiness / consumer doctor を green にする。
> `echo ... placeholder`、`TODO`、write permission、追加 trigger、余分な command は `fix_consumer_readiness` へ戻す。
> 2026-07-03 追補2: `consumerReadiness.artifactReadiness` は `harness-check.yml` を YAML として parse し、
> workflow 名、`push:main` / `pull_request:main`、`pull_request_target` 不在、`permissions.contents=read` と
> write permission 不在、`jobs.harness-check.runs-on=ubuntu-latest`、`actions/checkout@v4` の
> `with.persist-credentials=false` かつ余分な checkout input 不在、`oven-sh/setup-bun@v2` の `with:` 不在、
> workflow / job / step の custom `env:` 不在、job / step の `if:`・`continue-on-error:` 不在、
> job-level `permissions` override 不在、workflow / job の `defaults`・`concurrency` 不在、
> job の `strategy`・`container`・`services`・`environment`・`needs`・`timeout-minutes`・`uses`・`secrets` 不在、
> step の `shell`・`timeout-minutes`・`working-directory` 不在、secret 参照不在、固定 `run:` command set をすべて満たす場合だけ green にする。
> `run:` が完全一致していても branch が `develop` のみ、setup-bun step 欠落、job 名や runner drift がある場合は
> consumer doctor に先送りせず `fix_consumer_readiness` へ戻す。`workflow_dispatch` / `schedule` などの追加 trigger、
> 期待 2 本以外の `uses:` action、job permission override、skip / soft-pass できる expression control field、`${{ secrets.NAME }}` / `${{ secrets['NAME'] }}` / 空白入り bracket secret 参照も
> read-only smoke 証跡として扱わない。
> `postSetupWorkflow.verificationCommands` は setup dry-run / status / setup dry-run JSON による GitHub CI safety / `helix completion decision-packet --json` /
> `helix completion review-bundle --json` / `helix version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json` / `helix doctor --profile consumer` /
> `helix rename plan --json` / handover status /
> `helix team run --definition .helix/teams/default-hybrid.yaml --mode hybrid --json` を含む集約リストである。
> 即時実行できるものは `dryRunVerificationCommands` に分け、投影 artifact が materialize された後に確認する
> `helix doctor --profile consumer` と team-run dry-run は `postApplyVerificationCommands` に分ける。
> ready route は active handover または current PLAN route に接続する。
> `postSetupWorkflow.verificationMatrix[]` は setup-dry-run / vscode-profile-open / status-frontier / github-ci-safety / completion-decision-packet / completion-review-bundle / version-up-dry-run / consumer-doctor /
> identifier-cutover-packet / handover-route / team-run-dry-run の phase / command / expected / evidence / source、
> source metadata として sourceUrl / sourceCheckedAt / latestOfficialStatus / sourceStatusDelta / adoptionDecision、
> adoptionDecisionDelta / workflowRouteImpact の各 field に加えて、`availability=dry-run-immediate|post-apply-or-projected|manual-local` と
> `requiresMaterializedPaths[]` を持つ。VS Code workspace task / profile 起動と
> Workspace Trust の実行境界、completion decision packet、completion review-bundle の `semanticBundleDigest`、PLAN-M-02 rename packet、HELIX status/handover/team definition contract を初回稼働の検証証跡へ接続し、
> command 名の列挙だけで「別プロジェクトで動く」claim を閉じない。VS Code Tasks / Workspace Trust の
> 公式 source は checked date と採用判断を matrix に残し、source 名だけの stale な根拠にしない。text surface は
> `verification-check:` と `verification-source:` を出し、JSON を見ない利用者にも公式/正本 source を落とさない。
> wet run はこの matrix のうち初回稼働 state に必要な `phase` / `command` / `writePolicy` /
> `requiresMaterializedPaths[]` / `expected` / `evidence` を `.helix/state/project-setup.json` に永続化する。
> consumer doctor は command list だけが残って matrix が欠落した state、11 行のうち
> `version-up-dry-run` が欠落した state、`writePolicy` が no-write でない row、evidence/expected が空の row を
> fail-close し、初回稼働証跡を薄い command 一覧へ退行させない。
> `helix doctor --profile consumer` は `.vscode/tasks.json` の label/command だけでなく、schema version が
> `2.0.0`、`tasks` が配列、各 task が `type=shell`、`problemMatcher=[]`、`runOptions.runOn` 未指定または `default`、task-level `options` なしであること、
> かつ `.vscode/settings.json` が `task.allowAutomaticTasks=off` であることを検査する。
> 期待 task 以外の余分な task でも `runOptions.runOn=folderOpen` などの自動実行があれば fail-close する。
> 2026-07-03 追補: `helix setup project --dry-run --json` の `consumerReadiness.artifactReadiness` も
> 同じ `.vscode/tasks.json` / `.vscode/settings.json` を JSON として parse し、期待 task 9 本
> task 対象である status / doctor / completion decision-packet / completion review-bundle / version-up dry-run / rename plan / handover status / setup dry-run / team run dry-run
> の 9 本について label・command・順序・件数、`type=shell`、`problemMatcher=[]`、task-level `options` 不在、
> `runOptions.runOn` 未指定または `default`、`task.allowAutomaticTasks=off` を満たす場合だけ green にする。
> 文字列上 required command が含まれていても、余分な task、自動実行 task、構造不正 settings が混じる場合は
> consumer doctor に先送りせず `fix_consumer_readiness` へ戻す。
> これにより VS Code Tasks / Workspace Trust の境界を「生成した」だけでなく、consumer repo で自動実行に開いていない
> 証跡として扱う。
> dry-run は引き続き副作用ゼロ、branch protection / external API / secrets / identifier cutover は自動適用しない。
> VSCode 連携は標準 task に限定し、extension ID や外部 install を setup が暗黙実行しない。被覆 = U-SETUP-015..017。
> 2026-07-02 追記: `runHelixProjectSetup` は L3 HR-FR-P6-03 / HAC-P6-03a の
> GitHub rules/checks plan と consumer doctor baseline 要求に対応し、`githubPlan` と `doctorBaseline` を返す。
> `githubPlan` は plan-only / remote apply 無し / required check `harness-check` / branch protection
> `emit_only` を示し、`doctorBaseline` は setup dry-run / status / `helix completion decision-packet --json` /
> `helix completion review-bundle --json` / `helix version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json` / `helix doctor --profile consumer` /
> `helix rename plan --json` / handover status / team-run dry-run と
> `.helix/memory|handover|evidence|teams` baseline を示す。被覆 = U-SETUP-019。
> clean distribution acceptance は `src/cli.ts` 直実行や handmade `helix` shim だけでは閉じない。
> source / clean artifact の `package.json` は package-local `scripts.helix="bun run src/cli.ts"` を持ち、
> dogfood repo でも `bun run helix --version` が VSCode task / CI と同じ入口で動く。
> `bun run build` で `package.json.bin.helix=./dist/helix` の実体を作り、temp-local `BUN_INSTALL` 配下で
> `bun link` → consumer repo の `bun link helix --no-save` → consumer `node_modules/.bin/helix` の
> `--version` / setup / status / doctor / handover / team run dry-run を実行して、package/bin 経路が別 project で動くことを証明する。
> `harness-check.yml` と `consumerReadiness.ci.requires` は GitHub Actions workflow syntax / permissions の公式境界
> (workflow YAML、`push` / `pull_request`、top-level `permissions`) に合わせ、`push:main` / `pull_request:main`、
> `permissions: contents: read`、`pull_request_target` 不使用、secret 不要を contract とする。
> `escalation-stale.yml` も同じ GitHub Actions secure-use / minimum permission 境界を使い、スケジュール監査が
> issue 書き込みや placeholder command へ退行しないことを setup と consumer doctor の両方で確認する。
> `bun install --frozen-lockfile` 後に `bun run helix --version` を package/bin resolution preflight として置き、
> `bun run helix setup project --dry-run --json`、`bun run helix status --json`、
> `bun run helix completion decision-packet --json`、`bun run helix completion review-bundle --json`、`bun run helix version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json`、
> `bun run helix doctor --profile consumer --json`、`bun run helix rename plan --json`、
> `bun run helix handover status --json`、
> `bun run helix team run --definition .helix/teams/default-hybrid.yaml --mode hybrid --json` を含め、
> acceptance は `CONSUMER_CI_RUN_COMMANDS` 全体を consumer repo で実行し、
> post-setup verification と CI の command set をずらさない。
> 2026-07-03 追補4: `consumerReadiness.ci.packagePreflight` は Bun 公式 docs を source として持ち、
> `bun install --frozen-lockfile` が lockfile の exact version を使い lockfile を更新せず、`package.json` と
> `bun.lock` が不一致なら error になること、CI では `bun.lock` commit が必要であること、Bun v1.2 以降の
> text lockfile は `bun.lock` で旧 binary lockfile は `bun.lockb` であることを構造化して返す。
> `checks[]` の boolean だけでなく、`installCommand`、許容 lockfile 名、必須 scripts
> (`helix` / `typecheck` / `test`)、対応 `bun run ...` command、sourceUrl、lockfileSourceUrl、
> source metadata として scriptsSourceUrl、sourceCheckedAt、latestOfficialStatus、sourceStatusDelta、adoptionDecision、
> workflowRouteImpact の各 field を出し、lockfile や scripts 欠落時は `fix_consumer_readiness` へ戻す根拠を JSON から追える。
> 2026-07-04 追補5: fresh consumer repo では `helix setup project` が `package.json` と `bun.lock`
> を生成し、`scripts.helix` / `scripts.typecheck` / `scripts.test`、`devDependencies.helix`、
> `devDependencies.typescript` を materialize する。brownfield repo で package surface を merge した場合も、
> `bun install --lockfile-only` で lockfile を再生成し、`bun install --frozen-lockfile` が stale lockfile で
> 落ちる状態を ready と誤認させない。配布済み Pack tag は runtime import する `typescript` を transitive
> dependency として解決できないため、consumer setup package surface は当面 `typescript` を明示し、
> release/version-up activation 前の既存 tag でも package-local `bun run helix --version` が解決できるようにする。
> GitHub Issue / Pull Request template は公式 template 仕様に合わせて `.github/ISSUE_TEMPLATE/*.md` と
> `.github/PULL_REQUEST_TEMPLATE.md` に配置し、Recovery / Add-feature / V-model artifact / 検証 checklist を
> consumer doctor が fail-close で検査する。これにより別 project の入口が「ファイルがある」だけでなく、
> HELIX workflow の起票・PR 証跡として使える状態かを保証する。
> 2026-07-02 追記: setup が consumer repo へ配布する `AGENTS.md` / `CLAUDE.md` / `.claude/CLAUDE.md` /
> Claude subagent / Claude slash-command / setup JSON の説明文は日本語-first とし、CLI 名・識別子・
> stable token だけを原語で残す。`loadTemplates` の built-in fallback と `docs/templates/adapter/` 実体の
> 両方を U-SETUP-020 で固定し、導入先に英語説明文だけの adapter doc を生成しない。
> `helix doctor --profile consumer` は setup template manifest 由来の配布済み Claude subagent / slash-command
> も検査し、frontmatter YAML、subagent `name` と file 名の一致、`description` / `tools`、consumer-safe、
> `helix status` / `helix completion decision-packet --json` / `helix completion review-bundle --json` / `helix version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json` /
> `helix doctor --profile consumer`、secret/PII 禁止、findings-first を持つこと、
> 各 slash-command が `description`、`helix status --json`、`helix completion decision-packet --json`、
> `helix completion review-bundle --json` の exact digest / semantic digest 確認、version-up dry-run、consumer doctor 導線を持つことを fail-close する。
> `status` は状態、completion packet は `completionClaimAllowed=false` と未完了列、completion review-bundle は `semanticBundleDigest` と scoped review packet 束、consumer doctor は配布面の健全性を担い、doctor の成功だけを完了可否へ読み替えない。
> 2026-07-02 追記: `AGENTS.md` が案内する `helix team run --definition .helix/teams/<team>.yaml`
> は配布済み `.helix/teams/default-hybrid.yaml` に接続する。consumer doctor はこの YAML を
> `teamDefinitionSchema` で parse し、`buildTeamRunPlan(..., "hybrid")` の dry-run plan が Codex worker /
> Claude reviewer の provider 分離を持つことを fail-close する。VS Code task、consumer CI、distribution
> acceptance も同じ dry-run command を実行し、案内だけで実体が無い状態を許さない。被覆 = U-SETUP-023。

### §2.5 fail-safe + 安全フォールバック

- **検出不能 → solo (0-A)** を 3 層で一貫: `detectProjectScale` (never throws + unknown 信号) → `recommendPhase` (unknown → 0-A low) → `runSetup` (非対話+フラグ無し → 0-A)。緩い側 (solo = 強制なし) に倒すことで、検出失敗時に誤って team 設定 (branch protection) を発火させない。
- **dry-run**: `--dry-run` は生成物一覧を表示し**何も書かない** (破壊的変更ゼロ)。
- **既存ファイル保護**: 上書きは `confirm` 経由 (無断上書きしない)。
- **ガバナンス暴発防止**: branch protection 適用は明示 `--apply-branch-protection` と gh/admin preflight を必須にし、既定 emit-only から自動昇格しない。認証・権限・API apply のいずれかが失敗した場合は reason 付きで停止し、token は state/docs/log に保存しない。

### §2.6 ストレージ / 配置 / hook

- 確定 phase: `.helix/state/setup.json` (gitignored runtime state、確定値の SSoT。毎回再推測しない安定化)。HELIX project setup の completion 境界は `.helix/state/project-setup.json` に分離し、setup ready と whole-program completion を後続コマンドで混同しない。
- 生成物の配置 (対象 repo): `.github/` (workflow / CODEOWNERS / ISSUE_TEMPLATE / PR template) / repo root or package.json (commitlint、L7 で config 最小化方針と突合) / `scripts/setup-branch-protection.sh`。
- 本 repo のテンプレ置き場: `docs/templates/github/`、`docs/templates/adapter/`、`docs/templates/project/`。テンプレ実ファイル群は `PLAN-L7-03-setup-solo-team` / `PLAN-L7-157-distribution-clean-pull` (add-impl) が `artifact_type=template` として generates・tracking する。既存プロジェクトへ harness binary だけを持ち込む場合は対象 repo にこの docs tree が存在しないため、`loadTemplates` は `BUILTIN_GITHUB_TEMPLATES` を fallback として持つ (PLAN-L7-66)。対象 repo 側の `docs/templates/github/` / `docs/templates/adapter/` / `docs/templates/project/` が存在する場合はそれで built-in を上書きできる。adapter template には `AGENTS.md` / `CLAUDE.md` / `.claude/CLAUDE.md` / `.claude/settings.json` に加え、`.codex/config.toml` / `.codex/hooks.json` / Claude subagent templates / Claude slash-command templates を含める。`.claude/settings.json` は `agent-guard`、`work-guard`、`git-command-guard` を配り、`.codex/hooks.json` は Codex tool 名 `spawn_agent|spawn_agents_on_csv`、`apply_patch|write_file`、`exec_command|local_shell` へ同じ guard intent を割り当てる。project template には `.helix/teams/default-hybrid.yaml` を含める。`.codex/config.toml` は direct Codex CLI/IDE の hooks feature を有効化する前提ファイルであり、`.codex/hooks.json` だけが存在しても未発火になりうるため、`codex-hook-adapter` doctor は repo-local `.codex/config.toml` の `[features].hooks=true` も fail-close で検査する。consumer-facing prose / subagent / command は HELIX 名義にし、CLI 名・managed marker は `PLAN-M-02` の atomic migration まで `helix` / `HELIX:managed` を維持する。source/clean artifact の `package.json` は `scripts.helix` を持ち、生成 VSCode task / GitHub workflow と同じ `bun run helix ...` を dogfood でも実行できる。root の開発用 `.claude` / `.codex` 状態は clean distribution から除外し、導入先には template 経由で投影する。
- hook: **無し** (setup は CLI subcommand。hook は足さない)。

## §3 ③ 単体テスト設計 (pair) — L7-unit-test-design.md §1.7

U-SETUP-001 (`detectProjectScale` never-throws / gh 失敗→unknown) / U-SETUP-002 (`recommendPhase` 純粋・team/solo/fallback 信号) / U-SETUP-003 (`planSetup` 0-A=A のみ / 0-B=A+CODEOWNERS+bp script / team 名注入) / U-SETUP-004 (`emitSetup` dry-run 非書込 / 期待ファイル書込 / token 非含。**内部 helper `renderArtifacts` の render 内容もここで被覆**) / U-SETUP-005 (`recordSetupState` signals 4 フィールド strip / token 非含 / 再読込同一) / U-SETUP-006 (`applyBranchProtection` apply≠true→emit-only / gh 未認証なら gh-auth-required / gh auth + repository admin が揃えば非対話でも PUT 適用) / U-SETUP-007 (`runSetup` フラグ>確認>fallback 優先順 + legacy setup apply 要求が gh preflight 経由でのみ remote apply へ進むこと + CLI text が legacy setup を HELIX project bootstrap / L14 completion evidence と誤認させない) / U-SETUP-009 (`planSetup` が adapter テンプレを含め、`.codex/config.toml` と `.codex/hooks.json` をセットで preview する) / U-SETUP-010 (`emitSetup` が brownfield 既存 adapter doc を非破壊 merge し、構造ファイルは confirm なしに上書きしない) / U-SETUP-014 (`packageJsonDeclaresCommitlint` 純関数 + `emitSetup` が package.json 宣言済みなら commitlint dotfile を skip / 未宣言なら従来 emit) / U-SETUP-015 (`planHelixProjectSetup` / `runHelixProjectSetup` / `helix setup project` が VSCode task と project-local memory/handover/evidence/team baseline を非破壊に emit し、dry-run と branch protection 既定 emit-only 境界を維持する。JSON/text は `.helix` 現行 baseline、`helix setup project` / `.helix` 目標、PLAN-M-02 承認待ち `identifierTransition`、`.helix/state/project-setup.json` の `completionClaimAllowed=false` と first-run `verificationMatrix[]` 永続化、`helix completion decision-packet --json` と `helix completion review-bundle --json` と `helix version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json` の no-write 証跡、`helix rename plan --json` の blocked packet、`code --profile HELIX .` の manual-local 検証を返し、setup ready・consumer doctor green・cutover を L14 完了や apply 済みと誤認させない) / U-SETUP-016 (brownfield の既存 non-mergeable path を `importReport` に残し、`review_import_report` へ送る) / U-SETUP-017 (`consumerReadiness` が projected hook 用 bare `helix` CLI PATH preflight と remediation / secret 不要 CI smoke を返す。`package.json.scripts.helix` は package-local fallback 証跡であり、bare PATH 不在を green にしない。さらに `artifactReadiness` が実際の setup plan に束縛され、0-B/team では `.github/CODEOWNERS` の TL/QA/PO slug 解決と placeholder 不在を検査し、AGENTS / VSCode task / `.helix` baseline / default-hybrid team に加えて `CLAUDE.md` / `.claude/CLAUDE.md` / Claude subagent / Claude slash-command の日本語 HELIX prose、completion packet preflight、completion review-bundle、version-up dry-run、consumer doctor、rename/cutover 境界、secret/PII guardrail、`harness-check.yml` の任意 write permission 不在を検査する。`objectiveBoundary` で progress 90%、`completionClaimAllowed=false`、Pack reference、version binding、completion / review-bundle / version-up / cutover packet command を返し、consumer setup ready を whole-program completion と誤認させない。requested tag が local package version 由来 tag と不一致なら `distribution-version-binding` check で fail-close する) / U-SETUP-018 (`runConsumerDoctor` が `.helix/state/project-setup.json` の first-run matrix 全11行、automatic command 10件、manual-local command 1件、`writePolicy=no-write`、evidence/expected 非空を fail-close で検査する) / U-SETUP-019 (`githubPlan` と `doctorBaseline` が rules/checks plan と `helix completion decision-packet --json` / `helix completion review-bundle --json` / `helix version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json` / `helix doctor --profile consumer` / `helix rename plan --json` baseline を plan-only 構造で返し、配布 subagent / slash-command にも status・completion packet・completion review-bundle・version-up dry-run・consumer doctor の baseline を要求する) / U-SETUP-020 (配布 adapter / subagent / command template と setup next action が日本語-first であり、`helix-test` を含む command が completion packet preflight と completion review-bundle と version-up dry-run を持つことを固定する) / U-SETUP-021 (`runHelixProjectSetup --apply-branch-protection` が gh auth + repository admin 権限で branch protection を適用できることを固定する) / U-SETUP-022 (`loadTemplates` / built-in fallback の branch protection script が gh preflight 付きで remote API を適用できることを固定する) / U-SETUP-023 (`.helix/teams/default-hybrid.yaml` を配布し、consumer doctor / VS Code task / CI / distribution acceptance が team-run dry-run を検査する)。

2026-07-03 追補3: 現行正本では、U-SETUP-015/017/018/019/020 は completion review-bundle を含む。`verificationMatrix[]` は `completion-review-bundle` と `vscode-profile-open` を含む全11行で、consumer doctor は `semanticBundleDigest` と VS Code profile open 証跡を fail-close で検査する。`consumerReadiness` は projected hook 用 bare `helix --version`、CI / VS Code task 用 `package.json.scripts.helix`、`bun install --frozen-lockfile` 用 lockfile、CI 用 `package.json.scripts.typecheck` / `scripts.test` を ready 条件にし、どれかが欠ければ `fix_consumer_readiness` へ戻す。doctor baseline、配布 subagent、slash-command、setup next action は `helix completion decision-packet --json` / `helix completion review-bundle --json` / `helix version-up dry-run ...` を初回検証の no-write 証跡として扱い、`code --profile HELIX .` は自動実行 command ではなく manual-local 証跡として扱う。

U-SETUP-016 追加境界: 生成済み HELIX project への同一内容再実行は `identicalManagedPaths` として分類し、`skippedExistingPaths=[]`、prompt なし、`importReport.nextRoute=ready` を維持する。既存 consumer-owned non-mergeable path の review route と、前回 setup 生成物の idempotent rerun を同じ brownfield として扱わない。

2026-07-04 追補4: U-SETUP-037 は fresh repo の package bootstrap を固定し、`package.json` / `bun.lock` / VSCode task が同時に生成されること、`consumerReadiness.ok=true` と `postSetupWorkflow.nextRoute=ready` が package-local command surface に裏付くことを検査する。U-SETUP-038 は brownfield repo で package surface を merge したときに lockfile を再生成することを固定し、既存 `bun.lock` を stale のまま CI preflight green にしない。source package 自身は runtime import に必要な `typescript` を `dependencies` に置き、clean distribution acceptance は released Pack tag の install 再現性と現行 clean artifact の local-link command smoke を分けて検証する。

2026-07-04 追補5: PLAN-L7-303 では、`consumerReadiness` に `distribution-package-surface` blocking check と `ci.distributionPackageSurface` を追加する。生成 `harness-check.yml` は `bun run helix setup project --dry-run --json` などの package-local CLI surface を要求するため、公開 Pack tag の install が成功しても、その tag が生成 CI command を実行できない場合は ready としない。2026-07-04 の外部実測では `HELIX-HARNESS-OS` の `v0.1.0` / `v0.1.4` はどちらも `setup project --dry-run --json` が `unknown option '--json'` で失敗したため、公開 tag をそのまま HELIX first-run ready 証跡に使うことは禁止する。ready は現行 clean artifact の local-link smoke、または version-up activation によって公開 Pack tag の CLI surface が更新された実測証跡がある場合だけ許可する。これにより、package.json / lockfile / VSCode task が揃っただけの false green を `fix_consumer_readiness` へ戻す。

U-SETUP-024 追加境界: `common/escalation-stale.yml` は `schedule` 起動の no-write route audit であり、placeholder/noop workflow ではない。built-in fallback、setup artifact readiness、consumer doctor は、workflow 名、weekly cron、top-level `permissions.contents=read`、write permission 不在、`pull_request_target` 不在、checkout credential 非保持、setup-bun 入力不在、custom env / skip / soft-pass / job permission override 不在、secret 参照不在、placeholder/TODO/TBD 不在、固定 handover / completion decision packet / consumer doctor command set を fail-close で検査する。

**PLAN-L7-157 distribution addendum**: `buildCleanDistributionPlan(paths, tag, cleanRepo)` は R1/R2/R12/R13 の clean export contract。clean-repo + signed-tarball channel を返し、LICENSE / package / src / adapter templates (Claude/Codex hook、subagent、command templates を含む) を入れる一方、dogfood (`docs/plans`、`docs/design/harness`、`docs/test-design`、`.helix`)、central UI (`src/web/`)、web 専用 test (`tests/web.test.ts`)、frontend asset / dashboard route / dependency residue を clean artifact から除外し、必須 file 欠落または denylist drift で fail-close する (U-SETUP-011)。`buildConsumerReadinessPlan(host/runtime/workspace/tag signals)` は R3/R5/R6/R8/R9/R10/R16/R17 の onboarding/readiness contract で、Bun / git / gh / bare `helix` / runtime preflight、CI self-sufficiency、rollback managed paths、tag-pin/public contracts、monorepo package-root placement、portability smoke scenarios、`objectiveBoundary` を host 非変更で返す (U-SETUP-012)。`objectiveBoundary` は consumer readiness の scope を `consumer_setup_readiness_not_whole_program_completion` に固定し、Pack reference、local package version、local distribution tag、requested tag、Pack latest tag、Pack latest 採用前の version-up activation requirement、progress 90%、`completionClaimAllowed=false`、completion / review-bundle / version-up / cutover packet command を同じ JSON surface に出す。Pack reference の `mainHead` は `helix audit objective-external --json` が観測する配布レポ `main` の参照 HEAD であり、Pack latest tag や local distribution tag の採用済み状態を意味しない。`distribution-version-binding` check は requested tag が local package version 由来 tag と一致する時だけ green にし、Pack latest tag など別 tag を指定した distribution plan は version-up activation decision 記録まで fail-close する。生成される Claude/Codex adapter hook は bare `helix ...` を呼ぶため、`helix` が PATH 上で spawn できない (`not spawnable on PATH`) 場合 readiness は fail-close し、install flow は `helix setup` 前に linked/package binary を確立しなければならない。local distribution acceptance smoke (U-SETUP-013 / AT-DIST-001) は planned clean artifact set を temp repo に materialize し、`src/web/` と `tests/web.test.ts` が無いこと、`bun install --frozen-lockfile`、`status --json`、`distribution plan --json`、`typecheck` が通ることを検証する。さらに clean artifact CLI を別の空 consumer repo から `setup project --json` として実行し、fresh import report、readiness ok、`.vscode/tasks.json`、日本語-first adapter / Claude subagent 生成を確認する。fake `helix` は echo ではなく clean artifact CLI へ委譲する shim とし、生成 VSCode task と CI command set は package-local `bun run helix status --json` / `bun run helix completion decision-packet --json` / `bun run helix completion review-bundle --json` / `bun run helix version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json` / `bun run helix doctor --profile consumer --json` / `bun run helix rename plan --json` / `bun run helix handover status --json` / `bun run helix setup project --dry-run --json` / `bun run helix team run --definition .helix/teams/default-hybrid.yaml --mode hybrid --json` を consumer repo で実行する。adapter hook/readiness の bare `helix` PATH preflight は別契約として維持し、VSCode task の package-local command へ混ぜない。consumer doctor profile は dogfood PLAN/design/test-design/runtime state を要求せず、setup が投影した adapter / VSCode task / `.helix` baseline を検査する。brownfield consumer では既存 `AGENTS.md` と `.vscode/tasks.json` を置いた状態で setup を 2 回実行し、consumer 行保持、managed block 重複なし、`.vscode/tasks.json` skip、`importReport.nextRoute=review_import_report` を確認する。source repo 用 full `doctor` は clean artifact が dogfood PLAN/design/test-design/runtime state を意図的に除外するため対象外であり、consumer repo では `--profile consumer` を使う。

PLAN-L7-251 addendum: brownfield conflict smoke と idempotent rerun smoke は分けて扱う。既存 consumer-owned `.vscode/tasks.json` は従来どおり `review_import_report` へ送るが、fresh setup 後の同一 generated artifacts は `identicalManagedPaths` として `ready` に戻ることを acceptance に含める。

> **孤児 0**: §2.3 契約関数 7 本 ↔ U-SETUP-001〜007 を 1:1 被覆。`renderArtifacts` は `emitSetup` 内部 helper のため U-SETUP-004 に内包 (独立契約でない)。
> **freeze**: **G6 (機能設計凍結)** で ①(本書) ⇔ ③(L7-unit-test-design.md §1.7 U-SETUP) の pair を確定。**G7** で ①⇔②⇔③⇔④ の 4-artifact 双方向 trace を凍結。`next_pair_freeze: L7`。

## §4 既存機構との関係 (mode 検出 / session-log / agent-guard)

| | mode 検出 (detect.ts) | setup solo/team (本機能) |
|--|----------------------|--------------------------|
| 軸 | どの AI runtime が居るか (standalone/claude-only/codex-only/hybrid) | 参加規模 = solo/team (Phase 0-A/0-B) |
| 思想 | 検出して提案 (config を mode の主信号にしない) | **検出して提案 → 人間確認 → state 記録** (数で自動確定しない) |
| 確定の所在 | 実行時に毎回検出 | `.helix/state/setup.json` に**記録**して安定化 |
| 安全側 | — | 検出不能 → solo (緩い側) フォールバック |

deps 注入 (`GhRunner`/`FsReader`/`FsWriter`/`confirm`) は session-log の `nodeDeps` パターン、`onPath` (`gh` 有無判定) は `src/runtime/detect.ts` を再利用する。

## §5 上位整合 (後段 Reverse で back-fill)

本機能の要件・境界契約は **bottom-up build → 後段 Reverse で back-fill** ([[feedback_addfeature_bottomup_reverse_backfill]]):

- **L4 external-if (PLAN-L4-04)**: GitHub 境界の DbC 契約 (file vs gh-api 境界 / emit-only 既定 / gh auth/admin preflight 付き apply) を external-if.md へ back-fill。
- **§6.5 Phase 0-A/0-B**: `helix setup` の solo/team 出し分けが §6.5 の 2-stage と整合することを正本側に明記 (§10.1 受入条件 `setup --dry-run` と接続)。
- **L3 要件 (FR/AC)**: 参加規模検出 + 提案/確認/記録 + GitHub 設定出し分けの振る舞いを既存 FR 拡張で吸収 (新 FR は Reverse で要否判断、fr-registry-audit を壊さない)。
- **§6 用語 (Phase 0-A/0-B / 参加規模検出 / emit-only)**: L0 §10 用語集へ back-merge (§G.9、導入層 L6)。
- **認可・本番影響の境界**: branch protection 適用は gh auth/admin preflight と audit 可能な CLI 結果を前提にし、token は保持しない。不可逆 rename / version-up activation などの高影響 action は引き続き action-binding approval 境界で扱う。
