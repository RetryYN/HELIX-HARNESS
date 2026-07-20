# UT-TDD Agent Harness 全仕組み弱点監査（2026-07-20）

- 状態: 現行監査入力
- 対象: `unison-ai-product/UT-TDD_AGENT-HARNESS`
- main snapshot: `487ccd318a7e27f56ea35764d6204f35300d91d4`
- 取得日時: 2026-07-20（Asia/Tokyo）
- canonical 投影先: `docs/design/helix/L3-requirements/ut-tdd-mechanism-hardening-requirements.md`
- 不変 authority: `docs/governance/l12-canonical-vmodel-direction-directive_v0.1.md`、
  `docs/design/helix/L3-requirements/l12-scrum-rebaseline-requirements.md`

## 1. 監査目的と変更禁止境界

前身 repository の機能数や doctor green を評価するだけでなく、AI が長時間自走し、L1〜L12 V-model と
Scrum/PoC を通して設計、実装、検証、GitHub、継続、自己改善を安全に閉じるための「仕組み」の弱点を洗い出す。

次は弱点修正の対象にしない固定 authority である。

1. canonical は L1〜L12 exactly once、pair は `L1↔L12`、`L2↔L11`、`L3↔L10`、`L4↔L9`、
   `L5↔L8`、`L6↔L7` の6組である。L0 charter は層外 anchor とする。
2. Full V、Production Scrum、Discovery/PoC の route と Production Scrum の縮約 V、TDD、Scrum Reverse、
   release、operation evidence は変更しない。
3. Bun は current、target、fallback、rollback、test authority の前提にしない。対象内の Bun surface は
   source behavior の観測材料に限定する。
4. Python semantic core と TypeScript/Node transactional boundary の層別 authorityを維持する。

## 2. 母集団と検査方法

| 分母 | 観測値 |
|---|---:|
| advertised heads | 8 |
| tags | 0 |
| PR参照 | 92（head 89 / merge 3） |
| 全 refs の commit object | 1,631 |
| main tracked files | 1,945 |
| main top-level内訳 | docs 1,045 / src 311 / tests 234 / `.ut-tdd` 207 / skills 81 / その他67 |
| main実装・テスト拡張子 | TypeScript 550 |
| main文書 | Markdown 1,311 |
| main未包含head | 6（最大54 commits ahead） |
| mainの祖先でないPR head | 19（うち現行headと同一または旧squash前差分を含む） |

検査は `git ls-remote`、mirror clone、全 head/pull ref inventory、main tree 全ファイル分類、Core Reads、
workflow、ruleset、Issue/PR surface、source/test/docs の弱点語彙走査、target側の正規 green commandを用いた。
既存の2026-07-07 upstream auditと2026-07-18 GitHub参照監査は再利用したが、古い SHA の結論を最新
snapshotの代替にはしていない。

## 3. 実行証跡

| command | 結果 | 解釈 |
|---|---|---|
| `bun install --frozen-lockfile` | exit 0 | 対象自身の旧toolchain再現確認。HELIX採用根拠ではない |
| `bun run typecheck` | exit 0 | TypeScript型検査green |
| `bun run lint` | exit 0、544ファイル | Biome検査green |
| `bun test` | exit 1、2,096 pass / 37 fail / 4 errors / 1 skip | 素の入口は5秒timeoutとdetached HEAD前提不足で再現不能 |
| `bun run test` | exit 0、2,164 pass / 1 skip、228 files pass | 正規snapshot wrapperではgreen |
| 正規test duration | 220.54秒 | aggregate doctor test 214.17秒、projection test 55.60秒でfeedback loopが重い |

「正規 wrapper なら green」と「一般的な test entrypoint が同じ意味を持つ」は別である。前者の成功で、
入口の非対称、過大なfixture clone、5秒既定timeout、doctor monolithを相殺しない。

## 4. 弱点 ledger

severityは、権威・安全・完了判定を誤るものをCritical、自走停止・証跡欠落・主要品質退行をHigh、
効率・可搬性・保守性を継続的に損なうものをMediumとした。

| ID | severity | 弱点 | 観測根拠 | 要件化 |
|---|---|---|---|---|
| UTW-001 | Critical | L0〜L14とBunがsource全体のcurrent authorityとして深く埋め込まれている | Core Reads、README、package、CI、32 active Bun reference files | UTH-FR-002〜004 |
| UTW-002 | Critical | prose/CURRENT handoverがcontinuation正本で、event-first DB projectionと競合する | AGENTS/CLAUDEのSession Start、`.ut-tdd/handover` | UTH-FR-006 |
| UTW-003 | Critical | repository hookで覆えないhosted tool surfaceが手続き依存 | 対象AGENTSのscope boundary | UTH-FR-008 |
| UTW-004 | Critical | live policyと文書policyが乖離し得る | ruleset、branch policy、既存UT-GH-03〜05 | UTH-FR-017 |
| UTW-005 | Critical | PR trace/review evidenceが最新HEAD・merge-baseへ常時再束縛されない | 既存UT-GH-06/07/12 | UTH-FR-015 |
| UTW-006 | Critical | GitHub signal→Issue→PLAN→PR→CI→merge→memoryが単一exactly-once episodeで閉じない | execution episode branchがmain未統合、UT-GH-09/10/13 | UTH-FR-018 |
| UTW-007 | Critical | secret/PII scanの一部がwarn-onlyまたはhook依存で、CI全push blob再検証が不足 | `secret-scan-diff`既定warn、UT-GH-15 | UTH-FR-020 |
| UTW-008 | High | 素のtest入口と正規snapshot runnerの意味が異なり、37 fail/4 errorsになる | 実測 | UTH-NFR-001、UTH-FR-010 |
| UTW-009 | High | full regression/doctorが重く、timeoutと長いself-heal loopを生む | 220.54秒、doctor test 214.17秒 | UTH-NFR-002、UTH-FR-011 |
| UTW-010 | High | Bun runtime/CIがLinux・Windows双方の必須前提 | package engines、workflow | UTH-FR-003、UTH-FR-012 |
| UTW-011 | High | macOS legがなく、Windowsはfast/toolchain scopeのみ | workflow 2 legs | UTH-FR-012 |
| UTW-012 | High | tracked runtime stateが207 filesあり、source/evidence/generated state境界が太い | `.ut-tdd` tracked inventory | UTH-FR-007 |
| UTW-013 | High | fail-open/warn-onlyが安全性、観測性、可用性で統一分類されていない | session log、handover、update、scan、graphの複数方針 | UTH-FR-009 |
| UTW-014 | High | source loaderが欠損時に空集合へ縮退する箇所がありabsence blindnessを作る | graph designのfail-open記述等 | UTH-FR-009、UTH-FR-023 |
| UTW-015 | High | branch lifecycleが閉じず、main未包含6 heads、最大54 commits aheadが残る | mirror ref inventory | UTH-FR-013、UTH-FR-014 |
| UTW-016 | High | tag 0でrelease provenanceとsource snapshot authorityが弱い | ref inventory | UTH-FR-027 |
| UTW-017 | High | Issue Formsのlabel bootstrap/inbound dogfoodが未閉包 | 既存UT-GH-08/09 | UTH-FR-016 |
| UTW-018 | High | merge後branch/state/memory cleanupがtransactionalでない | UT-GH-02/13/14 | UTH-FR-018、UTH-FR-019 |
| UTW-019 | High | subagent/agent spawn guardはruntime surface差分に追随し続ける必要がある | 対象rulesの旧「未配線」履歴と現guard test | UTH-FR-008 |
| UTW-020 | High | DB rebuild、projection、test evidenceが巨大aggregateへ集中し、partial failureの診断単位が粗い | projection/doctor実測 | UTH-FR-011、UTH-FR-021 |
| UTW-021 | High | completion evidenceが時刻・prose・自己申告へ戻る余地がある | legacy evidence grandfather、review schemaの段階強制 | UTH-FR-022 |
| UTW-022 | High | external MCP/tool/pluginの実行、権限、supply-chain検証がprofile設計より後追い | backlog IMP-120〜124 | UTH-FR-024 |
| UTW-023 | High | improvement backlogにobserved/triaged/verifiedが92件あり、status名と実装実体が一致しない行がある | backlog status集計 | UTH-FR-025 |
| UTW-024 | High | source全refのatom化・採否・要件traceがcurrent receiptとして閉じていない | HELIX source ledgerのpredecessor-ut BLOCKED | UTH-FR-001、UTH-FR-023 |
| UTW-025 | Medium | docs 1,045、Markdown 1,311で正本・compatibility・archiveの認識負荷が高い | main inventory | UTH-NFR-003、UTH-FR-005 |
| UTW-026 | Medium | CLI、doctor、projectionのmonolithが変更影響とtargeted verificationを拡大する | long-running suites、既存refactor carry | UTH-FR-011、UTH-NFR-004 |
| UTW-027 | Medium | wrapperがcloneを重ね、disk/process/resource予算が明示的でない | snapshot runner実測 | UTH-NFR-002、UTH-FR-026 |
| UTW-028 | Medium | Node SQLite experimental warningが大量に出てsignal/noiseを悪化させる | 正規test output | UTH-NFR-005 |
| UTW-029 | Medium | consumer setup、source repo、clean distributionで検証集合が分岐しやすい | source/Pack workflow分離 | UTH-FR-027 |
| UTW-030 | Medium | update-checkなど外部可用性をfail-openにする機能にfreshness/decision impactの統一receiptがない | update advisory設計 | UTH-FR-028 |
| UTW-031 | Medium | manual approvalの対象、snapshot binding、expiry、reapproval triggerが機能ごとに不均一 | setup/release/cutover/security docs | UTH-FR-029 |
| UTW-032 | Medium | self-improvementがfinding数の消化へ寄り、before/after metricと再発率で閉じない | backlog、quality audit surface | UTH-FR-025、UTH-FR-030 |
| UTW-033 | High | freeze checkpointとreopen impact再検証がmain未統合で、確定済み成果物の再開境界が弱い | `work/freeze-checkpoint-plans`固有PLAN群 | UTH-FR-031 |
| UTW-034 | Critical | PLAN revisionのCAS、provenance、replay、rollbackを束ねるtransactional authoringがmain未統合 | `work/recovery-plan-revision-authoring`の25固有commit | UTH-FR-032 |
| UTW-035 | High | specialist agent registryのschema、sync、drift、guard digest、検証team招集が設計branchに残る | `work/l6-81-agent-registry-design` | UTH-FR-033 |
| UTW-036 | High | Stop hook内DB currency更新が5秒budgetと競合し、detached refresh/reconcileがmain未統合 | `work/l7-365-stop-hook-rebuild` | UTH-FR-034 |
| UTW-037 | Critical | Forward工程からのescapeをtyped Issueへ変換しreentryまで拘束するcontractがmain未統合 | `work/l6-83-exissue-red` | UTH-FR-035 |

## 5. 強みとして保持するもの

弱点監査は全否定ではない。次の仕組みはbehavior atomとして保持し、HELIX authorityへhardenする。

- document-firstとmachine enforcement、typed PLAN/spec/trace、doctor fail-close。
- detached HEADを使うreference fence、atomic DB rebuild、projection provenance。
- cross-provider review、light agent非承認、explicit staging、destructive action guard。
- Linux full＋Windows互換aggregate、clean distribution staging、dry-run release/cutoverの仕組み。
- Issue Forms、GitHub policy-as-code、relation graph、verification profile、skill telemetryの仕組み。

保持とは旧runtimeや旧層番号のportを意味しない。Python semantic coreまたはNode transactional boundaryへ
責務を分け、L1〜L12/Scrumの固定契約へ投影する。

## 6. 完全性判定

本監査の「全」は、取得済みsnapshotの全 tracked tree、全advertised head/tag/pull ref分母、正規Core Reads、
CI/ruleset、全source/test/docs分類、green command、既存監査の未閉包findingを対象にしたという意味である。
将来remote refやIssue/PRが変化した場合はsnapshot digestが変わるため、本監査を自動的にstaleとしdelta auditを要求する。

弱点37件はL3要件35件＋NFR5件へ全件mapした。`UTW-*`の未map、要件のsource finding欠落、固定L12/Scrumの
変更、Bun active authorityの再導入はいずれもL3 freeze blockerとする。
