---
plan_id: PLAN-RECOVERY-39-spawn-bundle-rollout
title: "PLAN-RECOVERY-39 (recovery): spawn 系テストの CLI/hook bundle 起動への展開と等価性 oracle"
kind: recovery
layer: cross
drive: agent
status: confirmed
route_mode: recovery
entry_signals:
  - "po_directive:2026-08-06 #93のCI高速化タスクを進めていくこと（性能スライス候補1: CLI bootstrap短縮）"
created: 2026-08-09
updated: 2026-08-09
owner: Claude / TL
github_issue_id: 93
engineering_discipline_required: true
behavior_contract_id: U-CLIBUNDLE-001
responsibility_owner: impact-ci-recovery
change_slice: atomic
refactor_step: modify
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: none
contract_preconditions: "cli-surface だけが ensureCliBundle 経由の bundle 起動を使い、他の spawn 過多 suite は 1 spawn ごとに npx --no-install tsx で transpile を払っていた。#93 の profiling で支配項が CLI bootstrap × spawn 数であることが実測済み"
contract_postconditions: "ensureBundle を entrypoint 一般化し ensureCliBundle / ensureHookBundle / ensureRootProbeBundle を提供する。bundle の ROOT は build 時に repoRoot 基準の合成 anchor（import.meta.url の define）で固定し、成果物の物理配置と symlink 解決に依存させない。spawn 過多な 6 suite（closure-authority-backfill-production-route / version-up-readiness / closure-auto-approval / closure-authority-convergence-production / closure-evidence-materialization-cli / git-command-guard）の CLI・hook spawn を node + bundle 起動へ置換する。U-CLIBUNDLE-001 が bundle 起動と tsx 起動の exit code / 出力一致、および bundle の ROOT が呼び出し元 repoRoot と一致することを恒久的に固定する"
contract_invariants: "検査範囲を減らさない（テストの削除・skip・timeout 緩和をしない）。実運用（.claude/settings.json）の hook 起動は tsx のままだが、.claude/hooks/git-command-guard.ts を実プロセスとして tsx 起動する suite は本 slice 後 U-CLIBUNDLE-001 のみであり、その tsx 経路の被覆は他 suite ではなく本 oracle が担う。bundle の ROOT は常に呼び出し元 repoRoot に一致し、node_modules が別 repo への symlink である git worktree でもリンク先を指さない。esbuild の define は bundle される全 module の import.meta.url に及ぶため、repo-local かつ import.meta.url を使う module が repoRoot から 2 階層下に在ることを assertRootAnchorCompatible が build 時に検査し、例外は理由付き allowlist に限る。検査は fail-close であり、読めない input や repoRoot 相対でないキーを silent skip しない。packages:external による node_modules 解決を保つ"
contract_failures: "bundle が tsx と異なる exit code / 出力を返す、entrypoint 取り違え（hook 名で CLI を bundle する等）、bundle 名衝突、ROOT anchor の欠落・深さ逸脱・outfile 名との衝突（自己実行判定の誤発火）、深さ検査の無効化・allowlist の wildcard 化・読めない input の silent skip・repoRoot 相対でないキーの見逃しを U-CLIBUNDLE-001 で fail-close する"
tdd_red_required: true
red_at: "2026-08-09T04:45:12Z"
green_at: "2026-08-09T04:49:45Z"
mutation_oracle_evidence: "tests/cli-bundle-equivalence.test.ts が 9 mutation をいずれも exit 非 0 で kill することを実測済み（scratchpad の mutation runner で 9/9）: (1) ROOT anchor の define 削除（物理配置依存への退行）、(2) anchor 深さを 1 階層へ、(3) anchor 名を outfile と同名にする（l3-g3-logical-db-receipt の自己実行判定が誤発火）、(4) hook bundle の entrypoint 取り違え、(5) bundle 名衝突、(6) assertRootAnchorCompatible の no-op 化、(7) 深さ例外 allowlist の無条件 wildcard 化、(8) 読めない metafile input を silent skip へ戻す、(9) repoRoot 相対でないキーに対する fail-loud の除去。**通常の red→green ではない**: ensureHookBundle は測定駆動で実装が先行したため、oracle の有効性は事後の mutation で実証した（red_at は ROOT anchor 導入前に oracle が実環境の発散を検出して red になった時刻）。(2) は当初 survive した（深さを誤っても、その root に状態ファイルが無ければ tsx と同じ『無し』で一致するため外から観測できない）。実 CLI / hook の出力から ROOT は読めないため、専用 entrypoint tests/tools/bundle-root-probe.ts を追加して ROOT を直接観測する oracle に変え、kill を確認した。(6)-(9) は review round2/round3 の指摘に応じて追加した深さ検査とその fail-close 挙動を固定する"
complexity_effect: justified_positive
complexity_justification: "既存 ensureCliBundle を entrypoint 引数へ一般化し hook 用の薄い wrapper を 1 本足すだけ。テスト側は spawn 実行ファイルの差し替えのみで、CLI 表面・src 実装・CI step を増やさない"
removal_trigger: "vitest 側が spawn テストの transpile cache を提供し、bundle 迂回が不要になった時"
parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md
pair_artifact: tests/cli-bundle-equivalence.test.ts
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-CLIBUNDLE-001, test_path: tests/cli-bundle-equivalence.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — #93 性能スライス候補1（CLI bootstrap 短縮）の対象選定" }
  - { role: se, slot_label: "SE — ensureBundle 一般化と spawn 置換" }
  - { role: qa, slot_label: "QA — U-CLIBUNDLE-001 等価性 oracle" }
  - { role: tl, slot_label: "TL — bundle 迂回による実経路 coverage 喪失の有無" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-39-spawn-bundle-rollout.md, artifact_type: markdown_doc }
  - { artifact_path: tests/tools/cli-bundle.ts, artifact_type: test_code }
  - { artifact_path: tests/tools/bundle-root-probe.ts, artifact_type: test_code }
  - { artifact_path: tests/tools/root-anchor-fixtures/depth-violation.ts, artifact_type: test_code }
  - { artifact_path: tests/cli-bundle-equivalence.test.ts, artifact_type: test_code }
  - { artifact_path: tests/closure-authority-backfill-production-route.test.ts, artifact_type: test_code }
  - { artifact_path: tests/version-up-readiness.test.ts, artifact_type: test_code }
  - { artifact_path: tests/closure-auto-approval.test.ts, artifact_type: test_code }
  - { artifact_path: tests/closure-authority-convergence-production.test.ts, artifact_type: test_code }
  - { artifact_path: tests/closure-evidence-materialization-cli.test.ts, artifact_type: test_code }
  - { artifact_path: tests/git-command-guard.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-RECOVERY-18-lane-inventory-partial-logs.md
  requires: []
review_evidence:
  - reviewer: "Claude code-reviewer subagent (intra-runtime)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-09T06:05:00Z"
    tests_green_at: "2026-08-09T06:05:00Z"
    verdict: approve
    worker_model: claude-opus-5
    reviewer_model: claude-sonnet-5
    scope: "Codex CLI が usage limit 継続中のため規定代替の intra_runtime_subagent として、Claude code-reviewer（claude-sonnet-5, read-only）が 4 ラウンドでレビューした。round1 request_changes（Important 2）: (1) closure-evidence-materialization-cli.test.ts の変換漏れ（bundle path を tsx へ渡していた）、(2) contract_invariants の『実運用 tsx hook 経路の被覆は runtime-hook-entrypoints 等が担う』が事実誤認。(2) の是正で oracle を hook 3 シナリオへ広げたところ **実バグを検出**した（後述）。round2 request_changes（Important 1）: esbuild の define は bundle される全 module の import.meta.url を無差別置換するため、安全性が『repo-local module は全て深さ 2』という未検査の暗黙前提に依存している。是正: assertRootAnchorCompatible で metafile.inputs を走査し build 時 fail-close する機械検査へ変換、例外は理由付き allowlist（src/cli.ts のみ）に限定、ROOT プローブを実 ROOT 依存 lint module（src/lint/entity-coverage）経由の比較へ拡張。round3 request_changes（Important 2）: (1) その guard 自身の catch { continue } が silent skip で同型の抜け道、かつ repoRoot === build 実 cwd という暗黙前提が残る、(2) PLAN / L8 が round3 の実装を反映していない。是正: absWorkingDir: repoRoot を明示、読めない input と repoRoot 相対でないキーを throw、metafile キーの POSIX 前提を明示（round3 Minor の Windows 指摘も解消）、PLAN / L8 を同期。round4 approve（Critical 0 / Important 0 / Minor 2）。Minor の『途中に /../ を含むキーのすり抜け』は segments.includes('..') 判定と反例 case 追加で閉じた。**claim 訂正 2 件**: (a) round1 で否定された『他 suite が tsx hook 経路を担う』は事実誤認であり、.claude/hooks/git-command-guard.ts を実プロセスとして tsx 起動する suite は本 slice 後 U-CLIBUNDLE-001 のみである、と改めた。(b) cli-surface.test.ts の失敗理由を『node バージョンと PATH 上の bare helix 不在』と述べたが、reviewer の実測では helix-cli check は pass しており、落ちているのは readiness.checks[0]（node>=24.15.0 <25、local は v22.23.1）の 1 件のみ。本 diff に含まれない pre-existing の環境要因であることを reviewer が git diff で確認済み。**発見した実バグ**: node_modules が別 repo への symlink である git worktree では fileURLToPath(import.meta.url) が実体 path を返すため、node_modules 配下の bundle の ROOT がリンク先 repo に解決され、hook がリンク先の .helix/state/destructive-git-override を読んで tsx と異なる判定を返していた。既に merge 済みの cli-surface bundle も同じ欠陥を持っていたため、共有 helper への修正で同時に解消した。reviewer は mutation runner を自ら実行して 9/9 kill を再現し、tsc / biome / plan lint / metafile キー形状も独立に実測した。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --configLoader runner --project fast tests/cli-bundle-equivalence.test.ts tests/git-command-guard.test.ts tests/closure-evidence-materialization-cli.test.ts tests/closure-authority-backfill-production-route.test.ts tests/version-up-readiness.test.ts tests/closure-auto-approval.test.ts tests/closure-authority-convergence-production.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-09T06:05:00Z", evidence_path: tests/cli-bundle-equivalence.test.ts, output_digest: "sha256:474b842b76869d1c02fa23f76862c6544184fb0266c4a2d943b5c6ae98ea2d72", result: "7 files / 110 tests green、skip 0（U-CLIBUNDLE-001 と bundle 起動へ変換した 6 suite）" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-09T06:05:00Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0（出力なし）" }
      - { kind: lint, command: "npx --no-install biome check src tests", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-09T06:05:00Z", evidence_path: biome.json, output_digest: "sha256:419489a9eb58edc4b0c11d5fca4641594bce11dc0762dd26e7329fc1a33a0091", result: "exit 0（error 0。既存 warning は本 diff 外の tests/worker-isolation-broker.test.ts 由来で純増 0、reviewer が git log で未変更を確認）" }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-09T06:05:00Z"
  review_binding:
    reviewer: "Claude code-reviewer subagent (intra-runtime)"
    reviewed_at: "2026-08-09T06:05:00Z"
    evidence_digest: "sha256:92800ef38aa59ae9afebe0f9c605748093daa8df6f7d0eb9a9437feca58e72c7"
  entries: []
---

# PLAN-RECOVERY-39: spawn 系テストの bundle 起動への展開

## 目的（Issue #93 性能スライス候補1）

#93 の profiling は「支配項は CLI bootstrap（cli.ts import graph のロード）× spawn 数」であり、
2-core runner で lane が競合すると 1 spawn が 8〜15 秒へ膨張すると実測していた。
`cli-surface` だけが既に esbuild bundle 起動へ移っていたため、同じ手を spawn 過多な他 suite へ展開する。

## 計測（この machine、単一ファイル逐次実行）

| suite | 変換前 | 変換後 |
|---|---|---|
| `closure-authority-backfill-production-route` | 33,981ms | 14,763ms |
| `version-up-readiness` | 16,012ms | 9,117ms |
| `closure-auto-approval` | 16,921ms | 15,526ms |
| `closure-authority-convergence-production` | 17,638ms | 8,415ms |
| `closure-evidence-materialization-cli` | 19,110ms | 15,137ms |
| `git-command-guard` | 48,841ms | 33,869ms |
| **合計** | **152,503ms** | **96,827ms（−36.5%）** |

計測前提の明示: ローカル単一ファイル逐次実行であり、CI の 2-core runner 競合下の数値ではない。
#93 の profiling では競合時に 1 spawn が 8〜15 秒へ膨張していたため、CI での削減幅はこれと異なる
（大きくなる可能性が高いが、本 PLAN では実測していないので主張しない）。
`closure-auto-approval` の改善が小さいのは、支配項が CLI spawn ではなく `git` の
`execFileSync` 群であるため（bundle 化の対象外）。

## 検査範囲を減らしていないこと

- テストの削除・skip・timeout 緩和は行っていない。置換したのは spawn の実行ファイルのみ。
- 新設した U-CLIBUNDLE-001 は「テストが読み替えた成果物が本物と等価か」を検査する。
  これまで「bundle ≡ tsx」は暗黙の前提だったが、本 slice で機械検査に変えた。
- **tsx 経路の被覆に関する当初主張は誤りだった**。review 指摘を受けて実測した結果、
  `.claude/hooks/git-command-guard.ts` を**実プロセスとして tsx 起動する suite は本 slice 後
  U-CLIBUNDLE-001 のみ**であり、「runtime-hook-entrypoints 等が引き続き担う」は事実誤認だった。
  そのため oracle 側を fail-close（malformed stdin）1 本から、**破壊的コマンド検出**と
  **通過**を含む 3 シナリオへ広げ、判定ロジック本体の tsx 等価性を本 oracle で担保する形に改めた。

## 発見と修正: bundle の ROOT が別 repo を指す（U-CLIBUNDLE-001 が検出）

oracle を 3 シナリオへ広げた直後、bundle と tsx が**実際に発散**した。bundle 側だけが
BLOCK メッセージへ `override=blocked_invalid_authorization` を付けていた。

原因は環境構造である。この worktree の `node_modules` は別 repo への symlink であり、
`fileURLToPath(import.meta.url)` は symlink を解決した実体 path を返す。したがって
`node_modules/.helix-cli-cache/` へ置いた bundle の `ROOT = HERE/../..` は
**リンク先 repo** に解決され、hook がリンク先の `.helix/state/destructive-git-override` を読んでいた。
CI の runner は `node_modules` が実ディレクトリのため発現しないが、worktree 開発時の
クロスツリー汚染であり、**既に merge 済みの `cli-surface` bundle も同じ欠陥を抱えていた**。

配置を変える案は 2 つとも実測で破綻した（`.helix/cache/` は runtime state を乱して
CLI が bootstrap receipt を出し exit 1、`tests/` 配下は test inventory 走査を乱して同様）。
そもそも**物理配置に ROOT を依存させている**ことが原因なので、esbuild の `define` で
`import.meta.url` を **repoRoot 基準の合成 anchor** へ build 時固定した。成果物がどこに置かれ、
その path が symlink を経由しても、ROOT は常に呼び出し元 repoRoot に解決される。
共有 helper への変更なので `cli-surface` も同時に直る。

anchor に outfile 自身の名前を使わないのは、`src/doctor/l3-g3-logical-db-receipt.ts` が
`process.argv[1] === fileURLToPath(import.meta.url)` で自己実行を判定しており、
同一文字列にすると CLI bundle 起動のたびに receipt 出力が誤発火するため（mutation で実証済み）。

### 暗黙前提を機械検査に変えた（review round2 指摘）

`define` は entry だけでなく **bundle される全 module** の `import.meta.url` を無差別に置換する。
したがって anchor が正しく働くのは「repo-local module が全て repoRoot から 2 階層下に在る」
という前提の上であり、これを prose に留めると将来別の深さの module が import graph へ入ったとき
**無音で壊れる**。`assertRootAnchorCompatible` が esbuild の `metafile.inputs` を走査し、
`import.meta.url` を含む repo-local module が深さ 2 でなければ build を落とす。
例外は `ROOT_ANCHOR_DEPTH_EXCEPTIONS` に理由付きで登録したものだけとする
（現状 `src/cli.ts` のみ。深さ 1 だが `new URL("./web/index.ts", import.meta.url)` の
相対 dynamic import 専用で、bundle 経由では anchor 導入前から解決できない）。

検査は **fail-close** とし、読めない input や repoRoot 相対として解釈できないキーを
silent skip しない（round3 指摘。skip はこの guard が塞ごうとしている失敗そのもの）。
`metafile.inputs` のキーを repoRoot 相対に固定するため `absWorkingDir: repoRoot` を明示する。

また ROOT プローブは合成値だけでなく、**実 ROOT 依存 lint module**
（`src/lint/entity-coverage`）を bundle 越しに実行した結果も tsx 起動と突き合わせる。
define が依存 module へ波及することを、合成値ではなく実 module の挙動で確かめるためである。

## 意図的に採らなかった案

**bundle の staleness cache**: 1 bundle あたり約 80〜105ms（実測）であり、6 suite でも 1 秒未満。
mtime 判定を誤ると「古い成果物を実行して green」という最悪の失敗モードを招くため、
節約幅に対して危険が釣り合わない。cache を持たない判断を module doc へ明記した。

## §3 工程表

### Step 1: 対象選定（spawn 数ではなく実測時間で選ぶ）[直列]

根拠: downstream_dependency（推測ではなく計測が対象を決める）。

### Step 2: ensureBundle 一般化 + 6 suite の spawn 置換 → 計測 [直列]

根拠: file_conflict（共有 helper の signature 変更が全 caller へ波及する）。

### Step 3: 等価性 oracle の追加と mutation による有効性実証 [直列]

根拠: downstream_dependency（置換の妥当性を固定する検査）。

### Step 4: review → confirm → commit → PR → CI → merge → Issue #93 evidence [直列]

根拠: shared_state（outstanding snapshot / harness.db projection の単一owner収束）。

## §3.1 実装計画

情報源: `tests/tools/cli-bundle.ts`（cli-surface が既に使う bundle helper）と #93 の profiling
コメント（支配項 = CLI bootstrap × spawn 数）。対象 suite は spawn 数ではなく**実測時間**で選ぶ。
`ensureBundle(repoRoot, entryPoint, name)` を private 中核とし、`ensureCliBundle` /
`ensureHookBundle` を薄い wrapper として公開する。テスト側は
`npx --prefix <root> --no-install tsx <entry>` を `process.execPath <bundle>` へ置換するだけで、
引数・env・cwd・期待値は変えない。文字列リテラルとして `npx ... tsx` を持つ期待値
（version-up-readiness の evidence 文言など）は spawn ではないため置換対象から外す。

## 後続（本PLAN非対象）

- 性能スライス候補2（lane 再配置）・候補3（1 case あたりの spawn 数削減）
- `tests/slow/doctor.test.ts` の in-process 実行時間（約 175 秒）の分割
