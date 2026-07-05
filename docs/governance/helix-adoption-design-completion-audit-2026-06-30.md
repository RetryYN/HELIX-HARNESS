---
title: "HELIX adoption design completion audit 2026-06-30"
status: confirmed
created: 2026-06-30
owner: TL (Codex)
scope:
  - upstream_helix_harness_adoption
  - legacy_helix_extension_adoption
  - l7_5_run_debug_runtime_verification
  - visualization_discovery_ticket
---

# HELIX 採用設計完了監査 2026-06-30

この監査は semantic completion check である。file presence、green tests、prose volume
だけでは十分と扱わない。各 row は、user request に対応する design meaning、layer descent
target、test または verification oracle、正直な remaining-scope classification がある場合だけ
受理する。

## §0 User-request trace ID（利用者要求の追跡 ID）

| Trace ID | 元の user request | この監査で使う completion standard |
|----------|-----------------------|-----------------------------------------|
| UR-01 | upstream `unison-ai-product/HELIX-HARNESS` を確認し HELIX へ採用する | Current HEAD を確認済み。採用対象は raw upstream text ではなく HELIX requirements/contracts として記録する |
| UR-02 | 既存 L3 から L6 まで upstream adoption を完全に降ろす。直接採用可能なら L7 fork も許容 | L3/L4/L5/L6 と paired test-design trace が存在する。direct L7 implementation は実装・テスト済みでない限り partial と呼ぶ |
| UR-03 | 旧 HELIX `RetryYN/ai-dev-kit-vscode` を確認し、既存 L3 から L6 へ extension を降ろす | Current HEAD を確認済み。確認済み旧 HELIX surface の semantic extension group を L3/L4/L5/L6/test-design へ map する |
| UR-04 | L7 implementation に L7.5 RUN & Debug を追加する | Runtime-verification contract は source code と unit tests を持つ。real external runtime execution は過大主張しない |
| UR-05 | L6 function design に log design を追加する | Runtime verification log event fields、redaction、completeness、projection boundary を L6 で定義する |
| UR-06 | LLM generation ではなく DB/Markdown 由来の VSCode Webview/View visualization task/PLAN を起票する | L1 requirement と draft Discovery PLAN が存在する。この ticket では implementation を明示的に out of scope とする |
| UR-07 | test strategy に加えて verification strategy を追加する | Test-design docs は test oracle と runtime verification strategy を区別する |
| UR-08 | performance NFR、adapter/plugin/settings prework、HELIX rename direction を追加する | L3/L6/test evidence が存在する。runtime enforcement または mechanical rename が future scope に残る箇所は partial とする |

## §1 Source freshness（参照元の鮮度）

| Source | 必須確認 | 現在の evidence | 判定 |
|--------|----------------|------------------|----------|
| `unison-ai-product/HELIX-HARNESS` | adoption basis を主張する前に current upstream HEAD を確認する | 2026-06-30 の `git ls-remote` は `7f83ca811353ed90b3e981178a1b0c9977dd5863` を返し、`docs/design/helix/L3-requirements/upstream-substance-gap.md` の `source_upstream_commit_full` と一致 | pass |
| `RetryYN/ai-dev-kit-vscode` | old HELIX adoption basis を主張する前に current legacy HEAD を確認する | 2026-06-30 の `git ls-remote` は `1cb4c3e9e73e3d2933b353ccaa2b1f64fffa9f23` を返し、`docs/design/helix/L3-requirements/legacy-helix-extension.md` の `source_legacy_commit_full` と一致 | pass |
| Global HELIX CLI flow files | Session-start rule は `$HOME/ai-dev-kit-vscode/helix/HELIX_CORE.md`、`SKILL_MAP.md`、`CODEX_TL_MODE.md` を求める | この execution environment には当該 path が無い。代わりに repo-local `AGENTS.md`、`CLAUDE.md`、HELIX/HELIX docs を使用 | residual risk |

Residual risk は、source commit basis は fresh だが global local flow files を読めなかったという意味である。
これを full workflow compliance として隠してはならない。

## §2 Requirement-to-design semantic map（要求から設計への意味対応）

| User request | 設計すべき意味 | Design evidence | Test / verification evidence | Implementation / PLAN evidence | 判定 |
|--------------|-------------------------------|-----------------|------------------------------|--------------------------------|----------|
| UR-01 / UR-02 | upstream A-146 substance gap を raw upstream prose ではなく HELIX contract として採用する。guard governance、consumer PATH、green evidence integrity、telemetry provenance、distribution curation、FE substance、drive entry、runtime matcher evidence を覆う | `docs/design/helix/L3-requirements/upstream-substance-gap.md` の L3 `HU-FR-01..08`、`docs/design/helix/L4-basic-design/upstream-substance-gap.md` の L4 boundary、`docs/design/helix/L5-detail/upstream-substance-gap.md` の L5 contract `HU-C01..08`、`docs/design/helix/L6-function-design/upstream-substance-gap.md` の L6 functions `classifyUpstreamA146Finding` から `verifyRuntimeMatcherEvidence` | `docs/test-design/helix/upstream-substance-gap.md` は A146-1..8 を HU-FR、HUT-SYS、HU-C、U-UPSTREAM oracle へ map する。`docs/test-design/harness/L7-unit-test-design.md` §1.25 と `tests/upstream-adoption.test.ts` は `U-UPSTREAM-001..009` を exercise する。`tests/vmodel-pair.test.ts` は commit marker と HU trace set を確認する | `src/runtime/upstream-adoption.ts` は A146 L6 functions の pure L7 decision contract を実装する。Public distribution publication、external runtime execution、provider CLI verification、DB projection collector は future scoped work に残る | design descent pass。pure decision L7 slice pass。runtime/publication wiring は partial |
| UR-03 | legacy Python/Bash runtime、`.helix` state、personal path を reject しながら old HELIX capability meaning を抽出する。runtime discipline、technical question gate、detector axis registry、recommender catalog、RUN & Debug trace、core/adapter distribution、hook/guard suite、agent/role/model policy、workflow inventory、DB/registry/API surface、continuous-run controls、learning/feedback loop を保持する | `docs/design/helix/L3-requirements/legacy-helix-extension.md` の L3 `HLX-FR-01..12`、L4 `HLX-SYS-01..12`、L5 `HLX-C01..12`、`docs/design/helix/L6-function-design/legacy-helix-extension.md` の `buildWorkPreflightDecision` から `buildLearningFeedbackDecision` までの L6 functions | `docs/test-design/helix/legacy-helix-extension.md` は old HELIX source family を HLX-FR、HLX-SYS、HLX-C、`U-HLX-001..013` oracle へ map する。`docs/test-design/harness/L7-unit-test-design.md` §1.24 と `tests/legacy-adoption.test.ts` は 13 件すべての U-HLX oracle を exercise する | `src/runtime/legacy-adoption.ts` は全 HLX L6 functions の pure L7 decision contract を実装する。ただし full legacy runtime parity ではなく、各 decision の CLI/doctor wiring は future scoped work に残る | design descent pass。pure decision L7 slice pass。runtime wiring は partial |
| UR-04 / UR-05 | Runtime behavior claim を projection-only row から受理しない。RUN & Debug には obligation model、redaction 付き append-only log event shape、DB-visible runtime evidence が必要 | L6 function contract、`RuntimeVerificationLogEvent`、append-only writer contract、`projectRuntimeVerificationEvents` projection contract は `docs/design/harness/L6-function-design/function-spec.md` にある。upstream L6 adoption も `docs/design/helix/L6-function-design/upstream-substance-gap.md` に verification strategy/log design を含む | `docs/test-design/harness/L7-unit-test-design.md` §1.23 は U-RUNDEBUG-001..007 を定義する。`tests/run-debug.test.ts`、`tests/cli-surface.test.ts`、`tests/projection-writer.test.ts` は classification、obligation、projection rejection、log creation、completeness、CLI append、DB projection を exercise する | `src/runtime/run-debug.ts` は L7.5 runtime-verification contract を実装し、`helix run-debug log` は complete event を `.helix/evidence/run-debug/runtime-verification.jsonl` に append し、`src/state-db/projection-writer.ts` は valid row を `runtime_verification_events` へ project する。External Claude/Codex execution はこの slice に含めない | scoped L7.5 slice は pass。external runtime launcher は future scope |
| UR-06 | Visualization は docs、harness.db、relation graph、runtime evidence 上の read model である。LLM-generated diagram は source of truth ではない。progress、dependencies、skill/model/runtime telemetry、action-binding constraints を含める | `docs/design/helix/L1-requirements/pillar-requirements.md` の L1 requirement §2.8 | `docs/test-design/helix/L1-pillar-operational-test-design.md` の L1 operational test HOT-P9 と related overlays | Draft PLAN `docs/plans/PLAN-DISCOVERY-10-helix-asset-visualization.md` は VSCode Webview/View discovery、deterministic node/edge views、drill-down、read-only first、non-goals を定義する | 要求された ticketing scope は pass。lower-layer implementation は意図的に未開始 |
| UR-07 | 「code が unit oracle を満たすか」と「runtime behavior が実際に起きたか」を分離する | `docs/design/helix/L3-requirements/pillar-functional-requirements.md` の HELIX L3 verification overlay、harness/upstream adoption docs の L6 runtime verification function contracts | `docs/test-design/harness/L7-unit-test-design.md` §0.1、`docs/test-design/helix/L3/L4/L5/L6` verification-strategy sections | RUN & Debug classification は実装済み。broader runtime evidence は future contract に段階化されている | design は pass。implementation は partial |
| UR-08 | Consumer adapter template は HELIX-branded Claude/Codex settings を持ち、rename PLAN まで mechanical `helix` identifier を保持する | `docs/templates/adapter/`、`src/setup/templates.ts`、`docs/design/harness/L6-function-design/setup-solo-team.md` の adapter template docs と setup fallback | `tests/setup.test.ts`、distribution acceptance tests、Codex hook adapter oracles、agent-guard oracles | template generation/fallback は実装・テスト済み。Codex `spawn_agent|spawn_agents_on_csv` は agent-guard 経由。direct hosted API hook enforcement は明示的 residual risk | declared boundary 付き pass |
| UR-08 | Verification workload は fast/default/full profile、resource budgets、timeouts、duration evidence を持つ | `docs/design/helix/L3-requirements/pillar-functional-requirements.md` の `HR-NFR-P5-03` | HELIX test-design docs の `HAT-N5-03`、`HST-N5-03`、`LIT-N5-03`、`HU-PILLAR-N5-03` | Design と tests は存在を検査する。profile-specific p95/worker-count runtime enforcement は later implementation scope | design descent は pass。implementation は partial |
| UR-08 | Prose は HELIX へ移すが、atomic rename まで CLI/state/managed marker は残す | `docs/plans/PLAN-M-02-helix-identifier-rename.md`。adapter templates は machine-bound 箇所で `helix` と `HELIX:managed` を保持しつつ HELIX prose を使用 | setup tests は HELIX adapter text と marker boundary を assert する | adapter templates は実装済み。full mechanical rename は未実施であり、完了主張してはならない | deferred mechanical rename 付き pass |

## §3 Feature-list audit（機能一覧監査）

現在の feature list は「old HELIX の全 file」ではない。curated semantic feature list である。
inventory basis は次のとおり。

- upstream `HELIX-HARNESS` at `7f83ca811353ed90b3e981178a1b0c9977dd5863`: 372 plans、
  47 design docs、6 test-design docs、156 TS source files、117 TS tests、58 audit docs を確認し、
  さらに consolidated substance-gap remediation audit として A-146。
- old HELIX `ai-dev-kit-vscode` at `1cb4c3e9e73e3d2933b353ccaa2b1f64fffa9f23`: 82 `helix*`
  commands、139 `cli/lib` Python modules、17 detector files、14 builder files、19 Claude 関連 assets、
  agents、31 role configs、18 Claude hooks、130 skills、49 workflow docs、35 verify scripts を確認し、
  98 Bats tests。

これらの count は import 目標数ではない。既存 HELIX pillar docs に属する meaning、`HU-FR-*`
または `HLX-FR-*` へ落とす meaning、reject する legacy runtime assumption を判断するための
確認済み source surface である。

| Source family | 採用した feature meaning | Current HELIX ID range | 除外した legacy assumption |
|---------------|-------------------------|------------------------|----------------------------|
| Upstream A-146 audit | distribution、runtime evidence、telemetry provenance、FE substance、routing 周辺の 8 substance gaps | `HU-FR-01..08`, `HU-C01..08`, `U-UPSTREAM-001..009` | raw upstream artifact name は current HELIX runtime state として扱わない |
| Old HELIX runtime rules | work preflight と fail-close discipline | `HLX-FR-01`, `HLX-C01`, `U-HLX-001` | `.helix/handover` と旧 `helix` CLI は current state として採用しない |
| Old HELIX question hook | TL advisor evidence に裏付けられた technical-user-question gate | `HLX-FR-02`, `HLX-C02`, `U-HLX-002` | Claude shell hook implementation は直接 port しない |
| Old HELIX detector registry | axis registry と routeable detector findings | `HLX-FR-03`, `HLX-C03`, `U-HLX-003..004` | Python detector modules は copy しない |
| Old HELIX recommender/catalog | traceable skill/code/command candidate recommendation | `HLX-FR-04`, `HLX-C04`, `U-HLX-005` | raw legacy paths や Codex wrappers は current execution paths として受理しない |
| Old HELIX debug commands | RUN & Debug trace と missing-action analysis | `HLX-FR-05`, `HLX-C05`, `U-HLX-006` | legacy task log parser format は新しい source of truth ではない |
| Old HELIX core / runtime adapters | core injection と repo-local adapter distribution boundary | `HLX-FR-06`, `HLX-C06`, `U-HLX-007` | personal absolute paths と missing global files は public truth ではない |
| Old HELIX hook / guard suite | AskUserQuestion、agent guard、fire/stop guard、context bundle、plan auto-register、skill catalog rebuild の guard-surface disposition | `HLX-FR-07`, `HLX-C07`, `U-HLX-008` | unwired guard surface は active と主張しない |
| Old HELIX agents / roles | typed role roster、slot policy、model-family constraint、review-substitute boundary | `HLX-FR-08`, `HLX-C08`, `U-HLX-009` | persona files は current runtime policy そのものではない |
| Old HELIX workflow process docs | pillar/workflow/gate inventory mapping | `HLX-FR-09`, `HLX-C09`, `U-HLX-010` | unknown workflow docs は auto-route しない |
| Old HELIX DB / registry / API modules | Harness DB projection、read-model、API boundary、provenance | `HLX-FR-10`, `HLX-C10`, `U-HLX-011` | raw legacy DB/state/API は current state として import しない |
| Old HELIX scheduler / job / budget commands | queue lock、timebox、budget、stop condition、evidence を持つ continuous-run control | `HLX-FR-11`, `HLX-C11`, `U-HLX-012` | uncontrolled auto-run は forbidden |
| Old HELIX learning / feedback / recipe modules | improvement backlog と skill telemetry feedback loop | `HLX-FR-12`, `HLX-C12`, `U-HLX-013` | learning output だけでは acceptance を close できない |

Old HELIX family disposition は
`docs/design/helix/L3-requirements/legacy-helix-extension.md` §0.1 に記録済みである。意図した
scope が HELIX-HARNESS semantic adoption ではなく full old-HELIX product parity である場合、
別の product-parity PLAN がまだ必要である。現作業は「old HELIX source surface を確認し、拡張可能な
meaning を採用し、semantic extensions を既存 L3 から L6 へ降ろす」ことを満たすが、direct
command/skill/runtime parity は主張しない。

## §4 Honest completion classification（正直な完了分類）

| Area | Design descended to L6 | Test / verification paired | L7 implementation present | Complete と呼べるか |
|------|------------------------|----------------------------|---------------------------|--------------------------|
| Upstream A-146 adoption | yes | yes | partial: pure decision contract は実装済み、runtime/publication wiring は未完了 | no。semantic decision slice は complete だが full runtime/publication parity ではない |
| Old HELIX extension adoption | yes | yes | partial: pure decision contract は実装済み、runtime/CLI parity は未完了 | no。semantic decision slice は complete だが full runtime parity ではない |
| L7.5 RUN & Debug runtime verification | yes | yes | append-only CLI evidence logging と DB projection を含め yes | この scoped slice では yes |
| Visualization Webview/View request | request により L1 + PLAN のみ | L1 operational acceptance のみ | no | ticketing は yes。implementation は no |
| Verification strategy | yes | yes | partial | no。runtime coverage は ongoing |
| Adapter templates/settings | yes | yes | setup/template generation は yes | hosted-API hook boundary 付きで yes |
| Performance NFR | yes | yes | partial | no。runtime enforcement は later |
| HELIX rename | prose/template partial | tests は boundary を cover | partial | no。mechanical rename は PLAN-M-02 に残る |

## §5 Gate result（ゲート結果）

| Gate | Result | 理由 |
|------|--------|--------|
| G-DESIGN-SEMANTIC | residual risk 付き pass | ①②③④ は explicit meaning-to-layer mapping を持つ。residual risk は global HELIX flow files の不在、および semantic adoption を超える full old-HELIX product parity が将来要求される可能性である。 |
| G-PAIR | pass | Upstream、legacy、L7.5、L1 visualization、verification strategy、performance NFR、adapter template changes は paired test-design または test-code evidence を持つ。 |
| G-IMPLEMENTATION-CLAIM | partial | L7.5 RUN & Debug、その DB projection、adapter/config/template changes、upstream A-146 pure decision contracts、old HELIX pure decision contracts は implementation を持つ。Public distribution/runtime wiring と full legacy runtime/CLI parity は未完了。 |
| G-ACCEPT | whole user goal では fail | whole goal は広い adoption と implementation language を含む。residual risk が accepted / planned / implemented されるまで open のままにする。 |
