---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 9d0c95976a9295bccdaf7df223c5f15cd4cae4295ad84d4f54afb9aeda34016c
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: e265b57e50d4c0f2f161c89a7dadbde12738bd84eab21de3fb5745d7741ef125
rule_id: RUL-COR-05
group: コア
product: OS
atoms_primary: 50
atoms_secondary: 48
issue_projection: none
---

# RUL-COR-05（コア／OS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

toolchainと依存を固定し、clean環境とofflineで再現できるようにする。lockのずれ、部品表の欠落を失敗にする。

## 主として対応づいた規則（50件）

| atom | 規則 | 種類 | 強制 | 失敗時 | 旧実装固有の部分 | 副 | 出どころ | 由来 |
|---|---|---|---|---|---|---|---|---|
| `RA-072` | エージェントはNode.js LTSとPythonをruntime前提とし、Bunのないclean環境でgateを実行する。 | tooling_runtime | prose | n/a | ADR-009のNode.js LTS範囲 | — | .claude/CLAUDE.md:259-260 | A／gpt-6-astra |
| `RB06-178` | 決定性検査は同一snapshot・version・configの結果digest差をnondeterminism findingとして失敗させる。 | process_gate | prose | fail_close | 未実装DeterminismGate | `RUL-OSA-06` | docs/governance/infinity-loop-assertion-coverage-ledger.md:171-171 | B06／gpt-6-astra |
| `RB06-287` | consumerはGit dependencyをtag-pinしてdevDependenciesへcommitし、setup adapterはengine内容を複製せず参照する。 | tooling_runtime | prose | n/a | GitHub-pull配布三層モデル | `RUL-COR-01` | docs/governance/repository-structure.md:175-182 | B06／gpt-6-astra |
| `RB07-119` | bootstrap projectionはtracked workspaceを必須とし、runtime logsと明示されたruntime projection stepsを除外する。 | tooling_runtime | config | n/a | excluded_paths／excluded_projection_steps | — | docs/governance/l3-g3-logical-db-bootstrap-policy.json:77-99 | B07／gpt-6-astra |
| `RB07-129` | hook入口はpackage-localのhelixだけを呼び、個人絶対pathや旧tool名を使わない。 | tooling_runtime | prose | n/a | helix hook entrypoint | `RUL-OSM-02`、`RUL-OSM-07` | docs/skills/security-and-hardening.md:79-80 | B07／gpt-6-astra |
| `RB07-150` | 切出し受入ではclean checkoutのPowerShell・POSIX実行、4種modeのJSON出力、WSL2なしの検査成功、必要なGit Bashの明示呼出し、個人path除去を確認する。 | process_gate | prose | fail_close | helix doctor／status --json／旧4 mode | `RUL-OSM-07` | docs/governance/helix-harness-extraction-plan_v0.1.md:108-114 | B07／gpt-6-astra |
| `RB07-261` | 担当者はVitest正規runnerの代わりにNode組込みtest runnerをCI代替として使わない。 | tooling_runtime | prose | n/a | npm run test／Vitest | `RUL-OSA-05` | docs/skills/testing.md:48-56 | B07／gpt-6-astra |
| `RC0-102` | node-engine-runtimeは、package.json読取失敗、engines.node欠落、range／version解釈不能、または実行Nodeの範囲外で失敗する。証拠書込用assertも同じ不合格を例外にする。 | tooling_runtime | doctor／gate | fail_close | Node engines comparator対応範囲 | `RUL-COR-04`、`RUL-OSA-06` | src/doctor/node-engine-runtime.ts:86-117; src/doctor/node-engine-runtime.ts:134-180 | C／gpt-6-astra |
| `RC01-165` | runtime-portabilityは、package.jsonのtypeがmoduleでない場合、不合格にする。 | tooling_runtime | lint | fail_close | Node ESM | — | src/lint/runtime-portability.ts:80-87 | C01／gpt-6-astra |
| `RC01-166` | runtime-portabilityは、package.jsonにNode engine指定がない場合、不合格にする。 | tooling_runtime | lint | fail_close | engines.node | — | src/lint/runtime-portability.ts:88-95 | C01／gpt-6-astra |
| `RC01-167` | runtime-portabilityは、build scriptにesbuildのtokenがない場合、不合格にする。 | tooling_runtime | lint | fail_close | esbuild固定 | — | src/lint/runtime-portability.ts:96-103 | C01／gpt-6-astra |
| `RC01-172` | runtime-portabilityは、TypeScript compilerOptions.typesにnodeがない場合、不合格にする。 | tooling_runtime | lint | fail_close | node標準library型の明示指定 | — | src/lint/runtime-portability.ts:149-156 | C01／gpt-6-astra |
| `RC01-175` | runtime-portabilityは、srcまたは.claude/hooks配下にpy・sh・bash・js・mjs・cjsのruntimeファイルがある場合、不合格にする。 | tooling_runtime | lint | fail_close | 旧runtime言語禁止集合 | — | src/lint/runtime-portability.ts:28-28; src/lint/runtime-portability.ts:186-196 | C01／gpt-6-astra |
| `RC01-178` | runtime-portabilityは、許可wrapperにpythonまたはpython3のtokenがある場合、不合格にする。 | tooling_runtime | lint | fail_close | wrapperからPythonへのdispatch禁止 | — | src/lint/runtime-portability.ts:223-230 | C01／gpt-6-astra |
| `RC01-180` | runtime-portabilityは、検査対象内容に指定のユーザーlocal絶対path patternがある場合、不合格にする。 | tooling_runtime | lint | fail_close | Windows Users、/home/、/Users/、旧sourceホームpathのpattern | `RUL-COR-04` | src/lint/runtime-portability.ts:29-30; src/lint/runtime-portability.ts:244-251 | C01／gpt-6-astra |
| `RC01-182` | runtime-portabilityは、検査対象にstate-db/index.tsがある場合、node:sqlite文字列がないかbun:sqlite文字列があると不合格にする。 | tooling_runtime | lint | fail_close | src/state-db/index.tsの文字列検査 | — | src/lint/runtime-portability.ts:267-278 | C01／gpt-6-astra |
| `RC01-188` | toolchain-pinは、Action registryに有効なentryが1件もない場合、不合格にする。 | safety_security | lint | fail_close | entries.size === 0 | `RUL-COR-04` | src/lint/toolchain-pin.ts:166-172 | C01／gpt-6-astra |
| `RC01-189` | toolchain-pinは、package.jsonがない場合、不合格にする。 | tooling_runtime | lint | fail_close | package-json-missing | `RUL-COR-04` | src/lint/toolchain-pin.ts:176-188 | C01／gpt-6-astra |
| `RC01-191` | toolchain-pinは、engines.nodeが未指定の場合、不合格にする。 | tooling_runtime | lint | fail_close | engines.node | — | src/lint/toolchain-pin.ts:202-209 | C01／gpt-6-astra |
| `RC01-192` | toolchain-pinは、engines.nodeが具体的なmajor.minorを含む正規表現に一致しない、またはlatest等の禁止patternに一致する場合、不合格にする。 | tooling_runtime | lint | fail_close | 独自正規表現によるsemver range検査 | `RUL-COR-04` | src/lint/toolchain-pin.ts:210-217 | C01／gpt-6-astra |
| `RC01-195` | toolchain-pinは、SHA固定されたActionのidentityがregistryにない場合、不合格にする。 | safety_security | lint | fail_close | github-action-identity-unknown | `RUL-COR-04` | src/lint/toolchain-pin.ts:307-313 | C01／gpt-6-astra |
| `RC01-196` | toolchain-pinは、workflowのAction SHAがregistryのSHAと違う場合、不合格にする。 | safety_security | lint | fail_close | github-action-ref-registry-mismatch | — | src/lint/toolchain-pin.ts:314-320 | C01／gpt-6-astra |
| `RC01-197` | toolchain-pinは、workflowのrun文字列にnpm installがあり同じ文字列にnpm ciがない場合、不合格にする。 | tooling_runtime | lint | fail_close | step.run単位の文字列検査 | — | src/lint/toolchain-pin.ts:322-331 | C01／gpt-6-astra |
| `RC01-198` | toolchain-pinは、source harness-checkのsetup-node参照がregistryの固定SHAに一致しない場合、不合格にする。 | tooling_runtime | lint | fail_close | .github/workflows/harness-check.yml | — | src/lint/toolchain-pin.ts:244-267; src/lint/toolchain-pin.ts:333-343 | C01／gpt-6-astra |
| `RC01-199` | toolchain-pinは、source harness-checkに正規setup-node stepがない、またはそのnode-versionが非空文字列でない場合、不合格にする。 | tooling_runtime | lint | fail_close | source-harness-check-node-version-missing | — | src/lint/toolchain-pin.ts:259-266; src/lint/toolchain-pin.ts:343-351 | C01／gpt-6-astra |
| `RC01-200` | toolchain-pinは、source harness-checkのnode-versionのmajor.minorがengines.nodeから抽出した下限版のmajor.minorと違う場合、不合格にする。 | tooling_runtime | lint | fail_close | patch差は比較せず最初の数値versionを下限として抽出 | — | src/lint/toolchain-pin.ts:270-277; src/lint/toolchain-pin.ts:352-364 | C01／gpt-6-astra |
| `RC01-201` | toolchain-pinは、検査入力のlockfile一覧が空の場合、不合格にする。実loaderはpackage-lock.jsonの存在を収集する。 | tooling_runtime | lint | fail_close | package-lock.jsonの存在検査でありGit追跡検査ではない | — | src/lint/toolchain-pin.ts:78-85; src/lint/toolchain-pin.ts:380-386 | C01／gpt-6-astra |
| `RC02-006` | doctorのnode-engine-runtime checkは、engines.node欠落、解釈不能な範囲または実行版、実行Nodeの範囲外、package.json読込・解析失敗の場合に失敗する。 | tooling_runtime | doctor | fail_close | 空白区切りAND comparatorのみを解釈し、\|\|・^・~・x形式は受理しない | `RUL-COR-04` | src/doctor/node-engine-runtime.ts:30-117; src/doctor/node-engine-runtime.ts:156-180 | C02／gpt-6-astra |
| `RC02-007` | Node実行版のauthority assertionは、package.jsonを読めない場合、または実行版検査が不合格の場合に例外を投げ、呼出先の処理を継続させない。 | evidence_claim | gate | fail_close | assertNodeEngineRuntimeAuthorityとnode_engine_runtime_authority_*例外 | `RUL-COR-04` | src/doctor/node-engine-runtime.ts:127-153 | C02／gpt-6-astra |
| `RC02-143` | consumer doctorのconsumer-package-preflight checkは、package rootのpackage.jsonが読めない・解析不能、helix/typecheck/test scriptが非空文字列でない、またはpackage-lock.jsonを読めない場合に失敗する。 | tooling_runtime | doctor | fail_close | lockfile検査は同じpackage-lock.jsonを重複照会 | `RUL-COR-04`、`RUL-OSA-06` | src/doctor/index.ts:6138-6172 | C02／gpt-6-astra |
| `RC02-166` | doctorのtoolchain-pin checkは、package・toolchain固定検査が不合格、またはファイル走査不能の場合に失敗する。 | tooling_runtime | doctor | fail_close | analyzeToolchainPin、toolchain scopeでも同じ関数を使用 | `RUL-OSA-06` | src/doctor/index.ts:6728-6741 | C02／gpt-6-astra |
| `RC04-277` | bubblewrap導入処理は、OSがUbuntu 24.04以外なら失敗する。 | tooling_runtime | ci | fail_close | Ubuntu 24.04固定 | `RUL-COR-04` | .github/scripts/install-bubblewrap.sh:10-15 | C04／gpt-6-astra |
| `RC04-278` | bubblewrap導入処理は、codenameがnoble以外なら失敗する。 | tooling_runtime | ci | fail_close | noble固定 | `RUL-COR-04` | .github/scripts/install-bubblewrap.sh:17-21 | C04／gpt-6-astra |
| `RD00-150` | CI telemetry検証は、runnerのobserved値とauthority値のいずれかのidentity項目が異なる場合、拒否する。 | evidence_claim | ci | fail_close | RUNNER_IDENTITY_KEYS照合 | `RUL-COR-04` | src/runtime/ci-execution-telemetry.ts:545-549 | D00／gpt-6-astra |
| `RD00-195` | CI telemetryは、連結するartifact transfer間でlockfile digestが異なる場合、失敗する。 | evidence_claim | ci | fail_close | artifact_dependency_lockfile_mismatch | `RUL-COR-02`、`RUL-COR-04` | src/runtime/ci-execution-telemetry.ts:852-860 | D00／gpt-6-astra |
| `RD01-248` | logical DB receipt検証は、workspaceがclean=trueでなければ不正とする。 | evidence_claim | gate | fail_close | workspace_attestation.clean | `RUL-FRM-04` | src/runtime/github-cross-review-admission.ts:211-222 | D01／gpt-6-astra |
| `RD04-121` | isolation brokerは、worker起動時に継承環境を空にし、HOME・LANG・PATH・TMPDIRだけを固定値で設定する。 | safety_security | config | fail_close | FIXED_ENVIRONMENTと--clearenv | — | src/runtime/worker-isolation-broker.ts:53-58; src/runtime/worker-isolation-broker.ts:712-739; src/runtime/worker-isolation-broker.ts:764-770 | D04／gpt-6-astra |
| `RD11-001` | adapter probeは、必要なpackageが宣言されていない場合に警告し、ready=falseにする。暗黙のインストールは行わない。 | tooling_runtime | lint | warn | ADAPTERSとdeclaredPackagesによる判定 | `RUL-OSM-02` | src/lint/tool-adapter.ts:244-252; src/lint/tool-adapter.ts:272-276 | D11／gpt-6-astra |
| `RD11-037` | profile safety検査は、packageNameが指定されたexpectedPackageと異なる場合に警告する。 | tooling_runtime | lint | warn | expectedPackage未指定時はprofile自身のpackageNameを使用 | `RUL-OSM-02` | src/lint/verification-profile-safety.ts:170-181 | D11／gpt-6-astra |
| `RD11-038` | profile safety検査は、必要packageが宣言されていない場合に警告し、ready=falseにする。 | tooling_runtime | lint | warn | package-missingはwarnだがreadinessを失敗させる | `RUL-OSM-02` | src/lint/verification-profile-safety.ts:182-190; src/lint/verification-profile-safety.ts:242-252 | D11／gpt-6-astra |
| `RD11-052` | profile probeは、必要packageがpackage.jsonのdependencies・devDependencies・optionalDependenciesにない場合にpackage checkを失敗にする。 | tooling_runtime | lint | fail_close | package.json欠落・parse失敗時は空集合 | `RUL-COR-04` | src/lint/verification-profile.ts:106-122; src/lint/verification-profile.ts:227-234 | D11／gpt-6-astra |
| `RE01-005` | 実装者はBunを現行依存やfallbackとして再導入してはならない。 | tooling_runtime | prose | fail_close | Bun廃止方針 | `RUL-OSM-07` | docs/governance/helix-harness-requirements_v1.2.md:26-31 | E01／claude-opus |
| `RE01-098` | 外部tool導入者は公式の信頼できる配布元とintegrityを確認し、登録・probeを満たしたtoolだけを実行する。 | safety_security | prose／gate | fail_close | 外部tool allowlistとprobe | `RUL-COR-06` | docs/governance/helix-harness-requirements_v1.2.md:1386-1402 | E01／claude-opus |
| `RE01-104` | optional exporterは既定で無効とし、不足する依存を自動installせずfindingとして扱う。出力のchunk切捨てで完全なexportを装ってはならない。 | tooling_runtime | config／prose | warn | optional exporterとchunk出力 | `RUL-FRM-04` | docs/governance/helix-harness-requirements_v1.2.md:1438-1442 | E01／claude-opus |
| `RE01-158` | 作業者はlocal stateと個人overrideをGitから除外し、Nodeのversion pinとlockfileを管理する。 | tooling_runtime | config／doctor | fail_close | 旧.gitignore・Node pin・lockfile契約 | `RUL-OSM-09` | docs/governance/helix-harness-requirements_v1.2.md:2430-2438 | E01／claude-opus |
| `RE01-213` | 配布実装者はPOSIXとPowerShellで同じNode artifactを使い、Bun・旧UT・旧実装を再利用経路へ戻さず、必要なbehavior atomを再実装する。 | tooling_runtime | prose／gate | fail_close | Node artifactと旧UT/Bun廃止 | `RUL-OSM-07` | docs/governance/helix-harness-requirements_v1.3.md:310-312 | E01／claude-opus |
| `RE01-216` | 配布検証者はfresh Linuxでinstallからsetup・status・doctor・workflow dry-runを確認し、Windowsでも同じartifactを検証する。state混入・bare CLI依存・network/credential依存・非冪等性を負例で検査する。 | process_gate | gate | fail_close | distribution smokeとnegative oracle | `RUL-FRM-05` | docs/governance/helix-harness-requirements_v1.3.md:319-322 | E01／claude-opus |
| `RE01-279` | runtime検証者はLinuxをcanonicalなfull検証環境とし、Windows/macOSの互換検証でも同じfixtureを使う。Windows jobをrenameした場合は存在確認を含む参照側も更新する。 | tooling_runtime | ci／gate | fail_close | Linux-primaryとWindows/macOS compatibility job | `RUL-FRM-05` | docs/governance/helix-harness-requirements_v1.3.md:575-578 | E01／claude-opus |
| `RG13-010` | DB検証者はrepository contractに準拠する同一runtimeで、projection／receipt digestが別checkout間でも一致することを確認する。 | evidence_claim | prose | n/a | G3 bootstrap verifierのprojection／receipt digest | `RUL-COR-02` | docs/governance/l3-rebaseline-g3-freeze-packet.md:515-518 | G13／claude-opus |
| `RG17-004` | 障害調査担当者は、Windowsでhook entrypointのstatusがnullの場合、またはenv-pathの必須directory欠落を調べる場合、PATHにSystem32が含まれることを確認する。 | tooling_runtime | prose | n/a | WindowsのSystem32と旧hook entrypointのstatus表現 | `RUL-OSP-05` | docs/skills/debugging-and-error-recovery.md:44-44; docs/skills/debugging-and-error-recovery.md:137-138 | G17／claude-opus |

## 副として対応づいた規則（48件）

`RA-068`、`RA-073`、`RA-238`、`RB04-257`、`RB05-185`、`RB05-269`、`RB06-112`、`RB06-167`、`RB06-229`、`RB06-267`、`RB06-285`、`RB06-288`、`RB07-195`、`RC01-169`、`RC01-184`、`RC01-185`、`RC01-187`、`RC01-190`、`RC02-017`、`RC04-195`、`RC04-276`、`RD00-145`、`RD00-148`、`RD00-149`、`RD00-171`、`RD00-186`、`RD00-280`、`RD04-097`、`RD04-098`、`RD04-115`、`RD10-031`、`RD10-032`、`RE01-002`、`RE01-086`、`RE01-102`、`RE01-108`、`RE01-109`、`RE01-159`、`RE01-211`、`RG03-007`、`RG08-007`、`RG13-003`、`RG14-004`、`RG14-010`、`RG14-013`、`RG14-014`、`RG14-016`、`RG19-012`
