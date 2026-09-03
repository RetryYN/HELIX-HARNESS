---
layer: L8
artifact_type: test_design
status: confirmed
legacy_source: docs/test-design/harness/L7-unit-test-design.md
pair_group:
  schema_version: helix-pair-group.v1
  group_id: harness-l8-unit
  authority: docs/design/
  members:
    - docs/design/harness/L6-function-design/active-plan-selection.md
    - docs/design/harness/L6-function-design/closure-authority-backfill.md
    - docs/design/harness/L6-function-design/closure-auto-approval.md
    - docs/design/harness/L6-function-design/closure-evidence-materialization.md
    - docs/design/harness/L6-function-design/descent-obligation.md
    - docs/design/harness/L6-function-design/development-ci-bounded-time.md
    - docs/design/harness/L6-function-design/fe-roster-orchestration.md
    - docs/design/harness/L6-function-design/feedback-lifecycle.md
    - docs/design/harness/L6-function-design/handover-db-derivation.md
    - docs/design/harness/L6-function-design/handover-mechanism.md
    - docs/design/harness/L6-function-design/handover-retirement.md
    - docs/design/harness/L6-function-design/left-arm-carry-log.md
    - docs/design/harness/L6-function-design/memory-cross-runtime-surface.md
    - docs/design/harness/L6-function-design/plan-descent-gate.md
    - docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md
    - docs/design/harness/L6-function-design/plan-number-uniqueness.md
    - docs/design/harness/L6-function-design/triage-decision-integrity.md
    - docs/design/helix/L6-function-design/skill-pack-uplift.md
created: 2026-07-08
updated: 2026-08-01
---

# HELIX — L8 単体テスト設計

## §0 位置付け

PO 指示（2026-07-08）により、L7 実装 PLAN の起票前提として参照する単体テスト設計の正本 path を
`docs/test-design/harness/L8-unit-test-design.md` とする。

既存 `docs/test-design/harness/L7-unit-test-design.md` は legacy shim として残すが、2026-07-08 以降に起票する
`kind=impl` / `kind=add-impl` の L7 PLAN は、本書を `pair_artifact` に持たなければならない。

## §1 起票 gate

- L7 PLAN は L6 機能設計 doc を `parent_design` に持つ。
- L7 PLAN は本書を `pair_artifact` に持つ。
- L7 PLAN は `generates` に `test_code` を持つ。
- L7 PLAN が採用候補や設計棚卸しだけを本文に置く場合、実装 ready として扱わず L3-L6 へ降下する。

## §2 Legacy 移行

既存の L7-unit test design 内容は本書へ段階移行する。移行完了まで、本書は gate 用の正本 path として機能し、
詳細 oracle は旧正本を参照する。

## §3 単体 oracle 被覆

L8 は単体テスト設計の正本であり、L9 結合テスト設計とは混同しない。既存 oracle は段階移行中のため、
本書は `fr-unit-coverage.md` と legacy `L7-unit-test-design.md` を参照しながら L6 function design の
単体粒度を閉じる。本書は `pair_group` の strict member set により、harness/helix双方のL6設計から本書へ降下する
集中L8正本の逆trace集合を表す。個別の対応は下表とPLANの`verification_bindings`でexactに拘束し、
`pair_artifact`へdirectoryやancestor prefixを戻さない。

| 被覆 family | trace | oracle route |
|---|---|---|
| L6 function contract | FR-L1-01..FR-L1-51 | `docs/design/harness/L6-function-design/fr-unit-coverage.md` の `U-FR-*` 行を単体 oracle 正本とする |
| descent obligation | FR-L1-03 | `U-DESC-*`。L6 から L8 単体テスト設計への pair を fail-close で検査する |
| plan descent gate | FR-L1-03 | `U-PDESC-*`。L7 impl PLAN は L8 unit pair を持つまで起票不可 |
| vmodel pair-freeze | FR-L1-03 | `U-VPAIR-007/008`。未参照test-designと不正なtyped exemptionをfail-closeし、nested pathとlive exemption集合も検査する。詳細fixtureはlegacy L7 test-designと`tests/vmodel-pair.test.ts`で保持する |
| visualization recovery handoff | U-VISUAL-003 | `close_ready` の `decision_draft` artifact を read-only Project view と `vmodel fit` recovery handoff gate に投影し、closure review scope / outcome / generation command / approval lane を表示する。詳細 oracle は legacy `L7-unit-test-design.md` の U-VISUAL-003 と `tests/visualization-read-model.test.ts` / `tests/visualization-treeview.test.ts` が担う |
| memory delegation recall 注入 | PLAN-L7-406 / PLAN-L7-414 / L6-64 §3-§4 | `U-MEMX-001/001b/002/003/004/005`（MEMX-S1..S5 の降下）。委譲 stdin への MEMORY_RECALL_HEADER 合成、空入力の byte 同一 no-op、skill 注入との固定順序、DELEGATION_MEMORY_BUDGET（6 件/200 chars）の cap、skill 0 件でも memory recall を落とさない独立条件、surface policy（delegation / team_run / task_route の全呼出面で注入。PLAN-L7-414 の解禁後仕様。新呼出面は policy 追加まで非注入の fail-close 既定）を `tests/runtime-adapter.test.ts` が担う |
| SessionStart 予算収束 | PLAN-L7-471 / `orchestration-memory.md` / `feedback-lifecycle.md` | `U-SSBUDGET-001..008`。hook 経路からの full lifecycle reconcile 分離、batch append による全 ref receipt 維持、stdout/stderr 経路分離 (feedback surface と attempt escalation の双方)、`session_start` / memory recall の先行確定、`helix feedback reconcile` による保守本体を `tests/session-start-budget.test.ts` が担う |
| Claude memory async wake | PLAN-L7-469 / `orchestration-memory.md` §2.3.1 | `U-MEMWAKE-001/004/005`。宛先key、非Claude起点、active/未配信選択、境界付き本文、atomic claim、digest ACK、同一ID非再配信、one-shot generation、terminal tombstone、Git共通dir投影を`tests/claude-memory-wake.test.ts`とprocess E2Eが担う |
| Claude PR convergence | PLAN-L7-473 / `orchestration-memory.md` §2.3.2 | `U-CPRCONV-001`。PR作成後の自動dispatch、同一PR新HEAD supersede、Claude/current HEAD/CI/DB/comment receipt、stale/blocker/CI red/改変receiptのmerge拒否を`tests/claude-pr-convergence.test.ts`が担う |
| L12 canonical 二重投影 | PLAN-L7-460 / HR-FR-VMCUT-02/05 | `U-VMCUT-001`。remap SSoT の legacy L0–L14 全 15 layer 被覆、縮退 remap（L5/旧L6→L5、L13/L14→L12）、unmapped L-token の fail-close violation、非 L-token 無視、実 repo unmapped 0 の二重表示 summary を `tests/layer-projection.test.ts` が担う |
| memory handover isolation gate | PLAN-L7-459 / L6-64 §6 MEMX-S6 | `U-MEMX-006`。remote 未到達の `.helix/memory/` 変更コミットの閾値超過 violation、閾値内 stale 件数 surface、remote 到達済み OK、git 取得不能時の fail-close violation を `tests/memory-handover-isolation.test.ts` が担う |
| feedback surface group-first cap | PLAN-L7-404 | 単一 signal_type クラスタの予算独占排除（group 単位 limit・surface_count 実数保持・group breadcrumb）と escalation surface cap（既定 10、0=無制限）を `tests/feedback-surface.test.ts` / `tests/attempt-escalation.test.ts` の PLAN-L7-404 ケースが担う |
| agent-guard fable apex 境界 | PLAN-L7-409 / PLAN-L7-306 | `U-AGFA-001/002/003`。fable 要求は `FABLE_APEX_SUBAGENTS`（現行 advisor-fable のみ）以外を fail-close で block、frontmatter に fable を宣言しただけの非 apex agent の worker 用途を拒否、bypass は `HELIX_ALLOW_RAW_AGENT=1` のみ（WARN 付き）を `tests/agent-guard.test.ts` が担う |
| docs / runtime state secret-scan | PLAN-L7-410 / PLAN-L7-52 | `U-SSCAN-001..004`。credential marker（narrow 正本 + aws/github/private-key/bearer/assignment）の violation 報告、明示的合図語 allow marker と語境界の非誤検知、clean 集合の OK message、実 repo regression（violations=0 の機械検証）を `tests/secret-scan.test.ts` が担う |
| harness memory structure v2 | PLAN-L7-407 / L6-62 §8 | `U-MEMV2-001a/001b/002a/002b/003/004a/004b/005a/005b/006/007a/007b/008a/008b`。v1互換、raw codec fail-close、operationId crash recovery、SQLite coordination/fencing、別process consume/compact-write race、takeover lifecycle、group-first/code-point budget、body非包含session eventを`tests/memory/memory-v2.test.ts`が担う |
| feedback lifecycle | PLAN-L6-63 / `feedback-lifecycle.md` §9 | 下表の12 oracle。journal、surface、session nudgeの各testへ1:1降下する |
| session handover retirement | PLAN-L6-61 / `handover-mechanism.md` §2.1 / `handover-retirement.md` §8 | `U-HRET-001..015`。typed disposition、phase journal、移管reconcile、at-least-once delivery、旧surface不存在・復活検出、action-binding approvalを下表の単体oracleへ降下する |
| agent slot lifecycle / team strategy | PLAN-L6-07 / `agent-slots.md` §1 / legacy L7 §1.9-§1.10 | `U-SLOT-001..009` / `U-TEAM-001..003`。slot の fire→release、stale 回収、並列上限、team strategy と直列化3条件を既存単体oracleへ降下する |
| skill scaffold / catalog 品質 | PLAN-L7-420 / `function-spec.md` skill品質追補 | `U-SKQUAL-001..006`。生成時衝突、本文実質、近似重複、SKILL_MAP双方向同期、doctor hard gateをfail-closeで検証する |
| ZIP 設計 catalog coverage | PLAN-L7-421 / `orchestration-memory.md` §2.3.1 | `U-DESIGNCOV-001..014`。ZIP 122 trace、tailoring理由、artifact実在、catalog外追加、baseline pin、path traversal、doctor hard gateをfail-closeで検証する |
| development model設計admission Reverse | PLAN-REVERSE-492 / AUTH-SURFACE-RUNTIME-001 | `U-REVERSE-492-001`。Reverse PLAN自身をbehavior contract、reuse strategy、pair artifact、generated oracleのexact tupleへ束縛し、名前だけのdesign backfillを拒否する |
| PLAN固有Vペア4点binding | PLAN-L6-65 / `plan-descent-specific-parent-binding.md` §5 | `U-PSPB-006..029`。PLAN ID・L6 parent・L8 oracle・生成test pathを同一tupleへ結合し、authority semantic pin、解消PLAN証拠pin、全generated test逆包含で偽Vペアをfail-closeする |
| FE roster/model generation | PLAN-L6-66 / `docs/design/harness/L6-function-design/fe-roster-orchestration.md` | `U-FEROSTER-001..003`。Opus lead・Sonnet worker・Fable advisory-only、現行Sonnet世代、legacy authority解消を固有testへ降下する |
| 開発CI bounded-time | PLAN-L6-67 / `docs/design/harness/L6-function-design/development-ci-bounded-time.md` | `U-CITIME-001..003`。required job上限、全回帰step上限、fail-closeと後続gate同居を固有testへ降下する |
| active PLAN選択整合性 | PLAN-L6-68 / `docs/design/harness/L6-function-design/active-plan-selection.md` | `U-APSEL-001..007`。exact canonical ID受理、截断候補提示、registry検証不能fail-close、全writer集約、watermark以後orphan 0、CLI integrationを固有testへ降下する |
| skill pack 判断力uplift | PLAN-L6-65 / `skill-pack-uplift.md` | `U-SKUP-001..011`。PLAN-L7-419の実装済みskill catalog・判断frame・marker・CLI citation・言語/license/decision precedenceを固有test caseへ束縛する |
| CI hard-gate integrity self-heal | PLAN-L7-423 / `function-spec.md` | `U-CISELF-001..008`。dependency boundary、compat shim、secret SSoT、human/technical review分離、L6逆trace、fresh-clone approval frontierを固有test caseへ束縛する |
| document semantic diff local artifact | PLAN-L7-457 / `document-semantic-diff.md` §3.1 | `U-DOCDIFF-008` / `IT-DOCDIFF-003`。専用root、new-file-only、dry-run 0 write、durable receiptを固有testへ束縛する |
| Reverse fullback scope全entry | PLAN-L7-673 / `governance-enforcement.md` §2.8 | `U-RFSCOPE-001..003`。必須外layerのinvalid decision、未生成`updated` evidence、valid `not_impacted`を検査し、追加layerの未検査を許可しない。必須3層限定へ戻すmutationをkillする | `tests/plan-lint.test.ts`, `tests/tools/reverse-fullback-scope-mutation/run-mutation.ts` |

### Reverse fullback scope全entryのoracle（PLAN-L7-673）

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-RFSCOPE-001 | 必須外`verification-design`の`decision: inferred` | 許可されないdecisionを`reverse_fullback_scope_missing`として拒否する | `tests/plan-lint.test.ts` |
| U-RFSCOPE-002 | 必須外`verification-design`の未生成`updated` evidence | 同一PLANの`generates`に無いevidence pathを`reverse_fullback_scope_missing`として拒否する | `tests/plan-lint.test.ts` |
| U-RFSCOPE-003 | 必須外`verification-design`の`not_impacted` | 変更が無いことを理由付きで宣言したscopeを受理する | `tests/plan-lint.test.ts` |

### active PLAN選択整合性のoracle

### 文書semantic diff local artifactのoracle

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-DOCDIFF-008 | local artifact port | root escape、symlink、既存targetを拒否し、dry-runはwrite 0、成功時はdurable digest receipt | `tests/document-report-write-port.test.ts` |
| IT-DOCDIFF-003 | CLI artifact output | 明示`--out`の専用root外・既存targetを拒否し、dry-runはwrite 0 | `tests/cli-surface.test.ts` |
| U-MEMWAKE-001 | event selection / delivery | 通常key、Claude起点、既配信ID、重複・0 byte・切り詰めclaimの後続starvation、本文data fence escape、Git共通dir未投影、claim後のdigest ACKを拒否する | `tests/claude-memory-wake.test.ts` |
| U-MEMWAKE-002 | repository Stop hook | project hookが`claude-memory-wake`を`asyncRewake`・bounded timeoutで配線する | `tests/runtime-hook-entrypoints.test.ts` |
| U-MEMWAKE-003 | consumer template | 配布templateも同じ`asyncRewake` commandを保持しsetup readinessをgreenにする | `tests/setup.test.ts` |
| U-MEMWAKE-004 | one-shot FSM | sender runtime対称の`OFF -> ARMED -> CLAIMED -> DELIVERED -> REVIEWED -> TERMINAL`だけを受理し、同一keyの再ARM、claim前delivery、二重claim、二度目のrearmをfail-closeする | `tests/claude-memory-wake.test.ts` |
| U-MEMWAKE-005 | generation / terminal | 同一PR/HEAD再通知は1 generationへdedupeし、new HEADだけが旧HEADをSUPERSEDEDにする。旧receiverのlegacy claimが残っていても新generationを妨げず、review/close/mergeのterminal tombstone後とwatcher再起動後に再注入しない | `tests/claude-memory-wake.test.ts` |
| U-CPRCONV-001 | PR convergence | PR作成成功を自動dispatchし、同一PR新HEADを優先する。旧HEAD、CI red、DB未収束、blocker、改変receiptではmerge 0 | `tests/claude-pr-convergence.test.ts` |
| U-CPRCONV-002 | CLI surface | PR notify、review receipt、reviewed mergeの専用commandを公開し、raw merge以外の正規経路を形成する | `tests/cli-surface.test.ts` |
| U-CPRCONV-003 | PR atomic scope生成 | changed PLANのbehavior contract／responsibility ownerとexact changed pathsからPR scope manifestを自動生成する | `tests/github-merge-readiness.test.ts` |
| U-IHIER-001 | GitHub Issue階層audit | root/capability/task/findingの親子、cycle、上限、双方向依存、duplicateを検査し、open active non-blocked leafだけをREADYとして返す | `tests/issue-hierarchy.test.ts` |
| U-IHIER-002 | Issue依存close gate | `depends_on`先がopenのclosed Issueを`closed_with_open_dependency`で拒否する | `tests/issue-hierarchy.test.ts` |
| U-IHIER-003 | PLAN↔Issue binding | PLAN `github_issue_id`とIssue `plan_id`の双方向不一致を拒否する | `tests/issue-hierarchy.test.ts` |
| U-IHIER-005 | PR focus / repository full audit | PR focusはclosure graphから到達するdependency componentだけを検査して無関係driftを隔離する。scheduled/手動のfocusなし監査は全採用Issueを検査してmissing PLANをfail-closeし、main pushでは未merge PLANとの重なりを誤ってredにしない | `tests/issue-hierarchy.test.ts`、`tests/harness-check-workflow.test.ts` |
| U-IHIER-006 | Issue依存audit workflow event境界 | PRはfocus付き監査、schedule／手動runは`--require-referenced-plans`付き全件監査とし、main pushではrepository full auditを起動しない | `tests/harness-check-workflow.test.ts` |
| U-IHIER-008 | 複数PLAN Issue binding | parent/capability Issueは`plan_id: null`と明示的な`plan_ids`集合で複数atomic PLANを束縛し、全PLANを双方向監査する | `tests/issue-hierarchy.test.ts` |
| U-IHIER-009 | PLAN binding表現の曖昧性 | scalar `plan_id`と`plan_ids`集合の同時指定をfail-closeし、暗黙のPLAN帰属推測を許可しない | `tests/issue-hierarchy.test.ts` |
| U-IHIER-010 | Issue依存契約の採用境界と失敗帰属 | prose markerだけのIssueを非採用とし、不正なyaml fenced blockを原因Issue番号付き`issue_dependency_contract_invalid`へ投影する | `tests/issue-hierarchy.test.ts` |
| U-IHIER-011 | Issue依存契約のdetector／parser形状一致 | fence直後marker、marker前空行、same-line markerを同じ採用blockとして受理し、同形状のmalformed blockをIssue番号付きfindingへ投影する | `tests/issue-hierarchy.test.ts` |
| U-IHIER-012 | hierarchy／dependency cross-contract | relationを宣言するactive hierarchy Issueだけを対象に、dependency block欠落、`blocked_by`／`depends_on`集合差、`blocks`集合差を個別findingで拒否し、parent-only Issueは対象外にする | `tests/issue-hierarchy.test.ts` |
| U-IHIER-013 | dependency migration dry-run | active hierarchy正本からadd／replace、exact `depends_on`／`blocks`、PLAN束縛、parser往復可能なcanonical contract blockを持つmigration candidateを決定的に投影し、既に一致するIssue、scalar／set競合、add／replace事前状態不一致を拒否する | `tests/issue-hierarchy.test.ts` |
| U-IHIER-014 | hierarchy／dependency relation union closure | どちらか片側projectionだけに宣言された既存edgeを削除せず、存在する両端nodeの`blocks`／`blocked_by`へunion closureし、metadata drift・edge removal・hierarchy block欠落を拒否する | `tests/issue-hierarchy.test.ts` |
| U-IHIER-015 | hierarchy compatibility input normalization | compatibility-only `plan_id`を含む契約と複数行relation配列を入力時だけ受理し、current typed hierarchyへ正規化する | `tests/issue-hierarchy.test.ts` |
| U-IHIER-016 | PLAN binding migration projection | candidate treeのexact PLAN bindingで既存dependency contractの`plan_id: null`／stale bindingを置換し、GitHub IssueとPLAN正本を収束する | `tests/issue-hierarchy.test.ts` |
| U-IHIER-017 | legacy Issue role adapter | 旧`issue_role: feature`をinput-onlyでcurrent `capability`へ変換し、current rendererへ旧roleを再出力しない | `tests/issue-hierarchy.test.ts` |
| U-IMETA-001 | GitHub Issue metadata audit | type/lifecycle欠落と48時間以上unlabeled openを拒否し、closedと閾値未満をstale findingへ誤算入しない | `tests/issue-metadata-audit.test.ts` |
| U-IMETA-WF-001 | Issue metadata scheduled audit workflow | schedule/workflow_dispatchだけでread-only監査を起動し、PR required gateへ混載せず、finding・CLI失敗・権限不足をsuccessへ変換しない | `tests/issue-metadata-audit-workflow.test.ts` |
| U-IMETA-WF-003 | Issue metadata audit fail-open shell oracle | 論理OR＋`true`／論理OR＋`:`（末尾`;`を含む）／`; true`／`set +e`を個別mutationで拒否する | `tests/issue-metadata-audit-workflow.test.ts` |
| U-CPRCONV-004 | canonical DB receipt束縛 | approve receiptをrepository-owned verifierのschema、projection/replay、checkpoint/replay、receipt digestへ束縛し、caller suppliedのad-hoc digestと非収束を拒否する | `tests/claude-pr-convergence.test.ts` |
| U-CPRCONV-006 | required check effective state | `gh pr checks --required`のapp-bound latest effective集合だけを採用し、pass以外、0件、取得不能を拒否する | `tests/claude-pr-convergence.test.ts` |
| U-CPRCONV-007 | runtime独立性の対称化 | author=claude / reviewer=codexの向きでもreceiptを構築・検証・merge可能にする（PLAN-RECOVERY-41） | `tests/claude-pr-convergence.test.ts` |
| U-CPRCONV-008 | self-review拒否 | 同一runtimeのreceiptを構築時に`runtime_independence_missing`で落とし、構築を迂回した場合もmerge判定で拒否する | `tests/claude-pr-convergence.test.ts` |
| U-CPRCONV-009 | runtime識別子の閉集合 | canonical receiptが識別しないruntime識別子を`runtime_identity_invalid`で拒否する | `tests/claude-pr-convergence.test.ts` |
| U-CPRCONV-010 | model/runtime pair | missing／unknown／same model-providerとruntime↔model provider不一致を共通pair coreで拒否する | `tests/claude-pr-convergence.test.ts` |
| U-CPRCONV-011 | canonical comment decoder | current v3とbyte-compatible historical v2をcanonical envelopeから読む。v2も旧builderと同じHEAD、CI、verdict、DB収束、URL、時刻の意味検証を再実行し、digest再封印による不正値とv2 current loadを拒否する | `tests/claude-pr-convergence.test.ts` |
| U-CPRCONV-025 | review receipt comment seal | `commentUrl`の省略、null、空文字を実comment投稿必須へ正規化し、実URLだけを投稿済みとして扱う。非stringとplaceholder persist迂回を拒否する | `tests/claude-pr-convergence.test.ts` |
| U-CPRCONV-027 | review receipt comment read-after | 形式上正しいがGitHubに存在しないcomment URL、取得URL不一致、sealed bodyのreceipt digest不一致をfail-closeし、実在commentだけをlocal receipt／merge前検証へ通す | `tests/claude-pr-convergence.test.ts` |
| U-GITGUARD-010 | reviewed merge route | direct `gh pr merge`を拒否し、receipt検証wrapperだけを許可する | `tests/git-command-guard.test.ts` |
| U-CPRCONV-005 | PR lifecycle収束 | AI runtimeのdirect `gh pr close/reopen`を拒否し、read-only PR参照とreviewed merge wrapperを許可する | `tests/git-command-guard.test.ts` |
| U-SSBUDGET-001 | SessionStart 予算 | hook 経路が full lifecycle reconcile / projection を回さず、保留を後続経路名つきで明示する | `tests/session-start-budget.test.ts` |
| U-SSBUDGET-002 | 実行順の保全 | feedback surface がある session でも `session_start` event が session log へ耐久記録され、harness memory recall が高価な feedback surface より前に stdout へ確定する | `tests/session-start-budget.test.ts` |
| U-SSBUDGET-003 | 保守の受け皿 | 予算のない `helix feedback reconcile` が reconcile + projection 本体を実行できる | `tests/session-start-budget.test.ts` |
| U-SSBUDGET-004 | 全 ref receipt 契約 | 130 件を打ち切らず全件 surface receipt 化し、全件が同一 receipt session に属し、同一 session 再実行は追記ゼロ (batch append で予算内に収める) | `tests/session-start-budget.test.ts` |
| U-SSBUDGET-005 | schema 作成の非退行 | DB 未作成 repo で SessionStart 実行後も schema が整い、`no such table` で DB 依存 command が壊れない (maintenance 分離時の退行回帰) | `tests/session-start-budget.test.ts` |
| U-SSBUDGET-006 | JSON 経路の非汚染 | feedback がある repo でも `helix codex --execute --json` の stdout が JSON として parse 可能で、surface は捨てずに stderr へ分離される | `tests/session-start-budget.test.ts` |
| U-SSBUDGET-008 | 予算 kill 耐性 | feedback 経路の journal 読取を FIFO で恒久 block した状態で、`harness-memory (` marker 観測後に SIGKILL しても `session_start` event が session log へ耐久記録されている。kill 前に子が barrier 手前で生存していること、SIGKILL で終了したこと、側効果の終端 echo が出ていないこと (feedback 未完了の証拠) も同時に assert する。時間依存の足止め (lock retry 上限) は false green になるため使わない | `tests/session-start-budget.test.ts` |
| U-SSBUDGET-007 | JSON 経路の非汚染 (escalation) | 直前 session に連続失敗ループがある repo でも `helix codex --execute --json` の stdout が JSON として parse 可能で、attempt escalation も捨てずに stderr へ分離される (feedback だけを seed した U-SSBUDGET-006 が見逃した迂回経路) | `tests/session-start-budget.test.ts` |

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-APSEL-001 | exact match | canonical完全IDだけを受理しcurrent-planへ保存 | `tests/session-log.test.ts` |
| U-APSEL-002 | 截断ID | prefix候補を決定論的に提示し、保存せずfail | `tests/session-log.test.ts` |
| U-APSEL-003 | 検証不能 | 空ID・空registry・未知IDを保存せずfail | `tests/session-log.test.ts` |
| U-APSEL-004 | writer/event集約 | 3桁commit IDを截断せず、CLI/commit hookのinvalid activationでmarker不変、event attributionもexact ID以外はnull | `tests/session-log.test.ts` |
| U-APSEL-005 | orphan ratchet | historical raw rowを保持し、watermark以後の新規orphanをfail | `tests/drive-db-registration.test.ts` |
| U-APSEL-006 | CLI integration | 截断IDをexit 1と候補提示で拒否し、current-plan markerをbyte不変で保持 | `tests/runtime-hook-entrypoints.test.ts` |
| U-APSEL-007 | CLI exact integration | fixture registryの完全IDを受理し、完全IDとtimestampだけをmarkerへ保存 | `tests/cli-surface.test.ts` |

### 開発CI bounded-timeのoracle

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-CITIME-001 | job上限 | required jobの上限が20分でなければfail | `tests/harness-check-workflow.test.ts` |
| U-CITIME-002 | 全回帰step上限 | 全回帰stepが15分でない、またはjob上限以上ならfail | `tests/harness-check-workflow.test.ts` |
| U-CITIME-003 | fail-close | job/stepのfail-open、command差替え、後続lint/doctorのjob外移動をfail | `tests/harness-check-workflow.test.ts` |

### CI hard-gate integrity self-healのoracle

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-CISELF-001 | dependency cycle | 解消済みcycleの復活またはgrandfather再追加をfail | `tests/ci-governance-self-heal.test.ts` |
| U-CISELF-002 | compatibility | 旧feedback lifecycle importからNode adapterが消えたらfail | `tests/ci-governance-self-heal.test.ts` |
| U-CISELF-003 | secret SSoT | security policyとstate-db互換exportが別identityならfail | `tests/ci-governance-self-heal.test.ts` |
| U-CISELF-004 | human bypass | human-only approveで技術green command gateを通過したらfail | `tests/ci-governance-self-heal.test.ts` |
| U-CISELF-005 | L6逆trace | L6 docのliteral逆traceがL8から欠落したらfail | `tests/ci-governance-self-heal.test.ts` |
| U-CISELF-006 | review evidence | 実repoに順序違反・技術green欠落・human bypassがあればfail | `tests/ci-governance-self-heal.test.ts` |
| U-CISELF-007 | source boundary | projectionがNode adapter、CLIがpure policyへ逆向き依存したらfail | `tests/ci-governance-self-heal.test.ts` |
| U-CISELF-008 | fresh-clone approval frontier | genuine decision draft未生成の`approval_required`はdraft生成を案内してgreen。ただしmissing/present同時、apply許可、公開済みapproval混入、scope/digest/review混入、誤commandはredとし、draft公開後のapproval invariantも維持する | `tests/ci-governance-self-heal.test.ts` |

### skill pack判断力upliftのoracle

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-SKUP-001 | pack catalog | 新規5 packのskill.v1 metadata欠落をfail | `tests/skill-pack-uplift.test.ts` |
| U-SKUP-002 | SKILL_MAP | 新規packのtrigger表未登録をfail | `tests/skill-pack-uplift.test.ts` |
| U-SKUP-003 | judgment frame | 新規packの中核判断anchor欠落をfail | `tests/skill-pack-uplift.test.ts` |
| U-SKUP-004 | adversarial contract | attacker/defender/no_attack/PASS-WEAK欠落をfail | `tests/skill-pack-uplift.test.ts` |
| U-SKUP-005 | browser matrix | 9状態matrixまたは報告型欠落をfail | `tests/skill-pack-uplift.test.ts` |
| U-SKUP-006 | judgment SSoT | judgment-core v2とmarker driftをfail | `tests/skill-pack-uplift.test.ts` |
| U-SKUP-007 | CLI citation | touched packの不存在command/subcommand参照をfail | `tests/skill-pack-uplift.test.ts` |
| U-SKUP-008 | 日本語prose | touched pack/commandの英語prose増加と日本語比率退行をfail | `tests/skill-pack-uplift.test.ts` |
| U-SKUP-009 | license | CC-BY attribution/URL欠落をfail | `tests/skill-pack-uplift.test.ts` |
| U-SKUP-010 | decision precedence | adversarial FLAGを多数決が上書きする記述をfail | `tests/skill-pack-uplift.test.ts` |
| U-SKUP-011 | delivery substance | 垂直slice/progressive elaboration/oracle出所のanchor欠落をfail | `tests/skill-pack-uplift.test.ts` |

### PLAN固有Vペア4点bindingのoracle

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-PSPB-006 | 4点happy path | confirmed L6、L8 exact row、生成test、PLAN/oracle両citationが一致すればpass | `tests/plan-descent-specific-parent-binding.test.ts` |
| U-PSPB-007 | binding必須 | impl/add-implのbinding 0件を`verification_bindings_absent`とする | `tests/plan-descent-specific-parent-binding.test.ts` |
| U-PSPB-008 | parent一致 | entry parentとtop-level parentの不一致を`binding_parent_mismatch`とする | `tests/plan-descent-specific-parent-binding.test.ts` |
| U-PSPB-009 | oracle一意宣言 | L8にoracleが無い/複数rowなら`oracle_not_declared`/`oracle_ambiguous`とする | `tests/plan-descent-specific-parent-binding.test.ts` |
| U-PSPB-010 | row-test結合 | oracle rowのexact test citationとbinding test pathの不一致を拒否する | `tests/plan-descent-specific-parent-binding.test.ts` |
| U-PSPB-011 | generates結合 | test未実在/symlink escape/PLAN generatesに同一`test_code`無しを拒否する | `tests/plan-descent-specific-parent-binding.test.ts` |
| U-PSPB-012 | case単位citation | exact PLAN IDまたは一意な`it/test("U-ID: ...")` case title欠落を別reasonで拒否する | `tests/plan-descent-specific-parent-binding.test.ts` |
| U-PSPB-013 | canonical path/schema | 非array/null/未知field/空scalar、絶対path、空/`.`/`..` segment、backslash、range IDを拒否する | `tests/plan-descent-specific-parent-binding.test.ts` |
| U-PSPB-014 | 重複/ownership | 重複tupleと同一oracleの同時active複数test path分岐を拒否し、archived履歴はowner競合から除く | `tests/plan-descent-specific-parent-binding.test.ts` |
| U-PSPB-015 | 共有L8 | 別oracleへscopeされた複数PLANは同じL8/testを共有でき、family要約だけでは充足しない | `tests/plan-descent-specific-parent-binding.test.ts` |
| U-PSPB-016 | exact fingerprint ratchet | baseline内exact findingだけ免除し、同じPLANの新reason/detailはred、解消は減少としてpass | `tests/plan-descent-specific-parent-binding.test.ts` |
| U-PSPB-017 | baseline authority | immutable initial追記、initial外tombstone、再出現、digest drift、重複、非canonical順をfail-closeする | `tests/plan-descent-specific-parent-binding.test.ts` |
| U-PSPB-018 | implementation対象境界 | draftを含むimpl/add-implを検査し、archived/DISCOVERYは対象外とする | `tests/plan-descent-specific-parent-binding.test.ts` |
| U-PSPB-019 | lint/doctor配線 | plan lint単一/全走査とdoctor hard gateが同じanalyzer結果をANDする | `tests/plan-descent-specific-parent-binding.test.ts`, `tests/slow/doctor.test.ts` |
| U-PSPB-020 | real repository | 実repoに新規違反0、PLAN-L7-419とgate自身が永久baselineなしで4点bindingを満たす | `tests/plan-descent-specific-parent-binding.test.ts` |
| U-PSPB-021 | authority semantic pin | legacy exemptionのPLAN本文・意味frontmatter・未知field・agent slot変更を`baseline_plan_semantic_drift`で拒否し、review/owner/updatedだけの変更は許容する。key/path順・CRLF/NFC正規化は同digestとする | `tests/plan-descent-specific-parent-binding.test.ts` |
| U-PSPB-022 | authority v3 migration | 旧v1 fingerprint集合の独立identity pinを維持した286 semantic pin backfill、full-entry genesis digest、schema downgrade・pin改竄・tombstone chain driftを拒否する | `tests/plan-descent-specific-parent-binding.test.ts` |
| U-PSPB-023 | generated test全被覆 | non-empty bindingを持つPLANの全`generates.test_code`がbinding test pathに含まれなければ`generated_test_unbound`とする | `tests/plan-descent-specific-parent-binding.test.ts` |
| U-PSPB-024 | doctor hard gate | production authority v4と全repo snapshotをdoctorが同一analyzerでfail-close評価する | `tests/slow/doctor.test.ts` |
| U-PSPB-025 | authority解消証拠 | 無関係/confirmed/対象不一致/config生成欠落・型偽装/review欠落・偽verdict・不完全command・同一model/後改変のresolution PLANを拒否し、completed typed metadata + distinct-model green reviewだけをtombstoneへsemantic pinする | `tests/plan-descent-specific-parent-binding.test.ts` |
| U-PSPB-026 | authority解消loader統合 | repo loaderが修正済target PLAN・completed resolution PLAN・non-zero tombstoneを同一snapshotでgreenにし、resolution PLAN後改変をhard failする | `tests/plan-descent-specific-parent-binding.test.ts` |
| U-PSPB-027 | authority解消metadata schema | `resolves_authority`のauthority path、SHA-256 fingerprint、typed target PLAN ID、reasonをstrict schemaで拘束し、未知fieldも拒否する | `tests/frontmatter.test.ts` |
| U-PSPB-028 | Recovery eligibility | draft／confirmed／completedを含む全Recovery PLANを検査し、eligibilityからRecoveryを除去するmutationをredにする。archivedだけを対象外とする | `tests/plan-descent-specific-parent-binding.test.ts` |
| U-PSPB-029 | Recovery scoped baseline | 対象化delta 260件、scope digest、reason別件数をcode-side pinへ一致させ、件数上方修正、scope欠落、cross-scope ownership 3件欠落を拒否する | `tests/plan-descent-specific-parent-binding.test.ts` |
| U-FEROSTER-001 | FE topology責任境界 | fe-leadがOpus lead/reviewer、fe-uiがSonnet worker、両者allowlist、advisor-fableが助言のみで実装しないことを固定する | `tests/fe-roster-orchestration.test.ts` |
| U-FEROSTER-002 | Sonnet世代SSoT | sonnet agent、team model policy、現行pricingがclaude-sonnet-5へ揃い、旧4-6 pricingは履歴用に保持されることを固定する | `tests/fe-roster-orchestration.test.ts` |
| U-FEROSTER-003 | legacy authority解消 | PLAN-L7-309の固有Vペア補修をcompleted resolution PLANとv3 tombstoneへ結合し、active exemptionを1件減らす | `tests/fe-roster-orchestration.test.ts` |

### ZIP 設計 catalog coverage の oracle

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-DESIGNCOV-001 | coverage式 | done/todo/na混在時に`done/(done+todo)`となりnaを分母へ入れない | `tests/design-coverage.test.ts` |
| U-DESIGNCOV-002 | category/todo surface | category別%とtodo残件数をresult/messageの双方へ出す | `tests/design-coverage.test.ts` |
| U-DESIGNCOV-003 | tailoring | `na_reason`欠落をredとし、黙って対象外にできない | `tests/design-coverage.test.ts` |
| U-DESIGNCOV-004 | done実態 | artifact無し・不存在のdone宣言をredとする | `tests/design-coverage.test.ts` |
| U-DESIGNCOV-005 | schema/trace一意性 | source欠落/重複、id重複、status/category不正をredとする | `tests/design-coverage.test.ts` |
| U-DESIGNCOV-006 | catalog fail-close | catalog不在・schema不正をgreenへ倒さない | `tests/design-coverage.test.ts` |
| U-DESIGNCOV-007 | catalog外追加 | 未登録design docと削除済baseline entryをredとする | `tests/design-coverage.test.ts` |
| U-DESIGNCOV-008 | baseline pin | rogue docとbaseline追記の同時変更をcode-side fingerprint不一致でredとする | `tests/design-coverage.test.ts` |
| U-DESIGNCOV-009 | artifact scope | `package.json`等の許可root外artifactによるdone偽装をredとする | `tests/design-coverage.test.ts` |
| U-DESIGNCOV-010 | path traversal | `..`、`.`、空segment、絶対path、drive/backslash表記をcanonical path検査でredとする | `tests/design-coverage.test.ts` |
| U-DESIGNCOV-011 | 122完全trace | `zip-00/123/999`と期待集合の欠番をredとし、`zip-01..122`完全一致を要求する | `tests/design-coverage.test.ts` |
| U-DESIGNCOV-012 | na空洞化 | 短文/禁止句の理由と全件naによる採用分母0をredとする | `tests/design-coverage.test.ts` |
| U-DESIGNCOV-013 | real catalog | 実repo catalogの122件、43 done/57 todo/22 na、違反0を固定する | `tests/design-coverage.test.ts` |
| U-DESIGNCOV-014 | doctor wiring | `checkDesignCoverage`のgreen messageが`runFullDoctor`へ出て、結果がhard gate ANDへ接続される | `tests/slow/doctor.test.ts` |
| U-REVERSE-492-001 | Reverse design backfill実体 | PLAN-REVERSE-492のbehavior contract、`reuse-as-is`、pair artifact、L8正本とgenerated test codeをexactに照合し、欠落・重複・別契約へのdriftをredとする | `tests/design-coverage.test.ts` |

### system review triage判断整合性のoracle

対象設計: `docs/design/harness/L6-function-design/triage-decision-integrity.md`

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-TRIAGE-001 | 正常契約 | catalog 3件、system保留、backlog 14件、残差、未列挙claimがexactならpass | `tests/triage-decision-integrity.test.ts` |
| U-TRIAGE-002 | schema | manifest欠落・parse不能・version不一致をfail-close | `tests/triage-decision-integrity.test.ts` |
| U-TRIAGE-003 | catalog pin | done集合の欠落・追加・artifact差異を拒否 | `tests/triage-decision-integrity.test.ts` |
| U-TRIAGE-004 | legacy system | system done化またはlegacy shim artifact採用を拒否 | `tests/triage-decision-integrity.test.ts` |
| U-TRIAGE-005 | backlog pin | verified 14件の欠落・追加・重複を拒否 | `tests/triage-decision-integrity.test.ts` |
| U-TRIAGE-006 | source drift | manifestが正しくてもcatalog/backlog実値が違えば拒否 | `tests/triage-decision-integrity.test.ts` |
| U-TRIAGE-007 | residual | IMP-118完了化、IMP-148欠落・完了化を拒否 | `tests/triage-decision-integrity.test.ts` |
| U-TRIAGE-008 | count-only | 10件のID無しcompleted、件数変更、重複IDを拒否 | `tests/triage-decision-integrity.test.ts` |
| U-TRIAGE-009 | evidence | done artifact不存在を拒否 | `tests/triage-decision-integrity.test.ts` |
| U-TRIAGE-010 | simultaneous shrink | manifestとsourceから同じ判断を削ってもcode pinで拒否 | `tests/triage-decision-integrity.test.ts` |
| U-TRIAGE-011 | real repository | 現行repoの判断契約がgreen | `tests/triage-decision-integrity.test.ts` |
| U-TRIAGE-012 | doctor wiring | 同じanalyzer結果がdoctor okのANDとmessageへ接続 | `tests/slow/doctor.test.ts` |

### 左腕差し戻しcarry logのoracle

対象設計: `docs/design/harness/L6-function-design/left-arm-carry-log.md`

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-CARRY-001 | no-pushback | terminal PLANの空entryとtechnical review binding一致をpass | `tests/left-arm-carry-log.test.ts` |
| U-CARRY-002 | presence | enforcement後terminal PLANのdecision欠落をfail | `tests/left-arm-carry-log.test.ts` |
| U-CARRY-003 | decision/entry | no-pushback+entry、resolved+空をfail | `tests/left-arm-carry-log.test.ts` |
| U-CARRY-004 | mapping happy | 3 finding kindとL6/G6・L5/G5・L4/G4の対応をpass | `tests/left-arm-carry-log.test.ts` |
| U-CARRY-005 | mapping drift | findingとtarget layer/gateの誤対応をfail | `tests/left-arm-carry-log.test.ts` |
| U-CARRY-006 | finding evidence | 不存在、digest偽装、空summaryをfail | `tests/left-arm-carry-log.test.ts` |
| U-CARRY-007 | resolution PLAN | 不存在、layer違い、draft、review欠落をfail | `tests/left-arm-carry-log.test.ts` |
| U-CARRY-008 | resolution V-pair | affected design未生成、test-design delta欠落をfail | `tests/left-arm-carry-log.test.ts` |
| U-CARRY-009 | dependency | 元L7 requiresにresolution PLANが無ければfail | `tests/left-arm-carry-log.test.ts` |
| U-CARRY-010 | gate evidence | global PASSだけ、command違い、nonzero、hash不正をfail | `tests/left-arm-carry-log.test.ts` |
| U-CARRY-011 | ordering | finding→repass→tests green→reviewの順序違反をfail | `tests/left-arm-carry-log.test.ts` |
| U-CARRY-012 | review binding | 不存在review、digest違い、非technical verdictをfail | `tests/left-arm-carry-log.test.ts` |
| U-CARRY-013 | uniqueness | carry ID、artifact、evidenceの再利用をfail | `tests/left-arm-carry-log.test.ts` |
| U-CARRY-014 | terminal | draftはpresence対象外、同PLANをterminal化してdecision欠落ならfail | `tests/left-arm-carry-log.test.ts` |
| U-CARRY-015 | legacy boundary | backdateとbaseline改変によるpresence回避をfail | `tests/left-arm-carry-log.test.ts` |
| U-CARRY-016 | real loader | real repo loaderとparse fail-closeをpin | `tests/left-arm-carry-log.test.ts` |
| U-CARRY-017 | schema | strict frontmatter codecとunknown field拒否をpin | `tests/frontmatter.test.ts` |
| U-CARRY-018 | doctor wiring | checkerのANDとmessage配線をpin | `tests/slow/doctor.test.ts` |
| U-CARRY-019 | G7 wiring | G7がcarry resultをANDしmessageへ出すことをpin | `tests/gate-static.test.ts` |
| U-CARRY-020 | production strict loader | `entries`非array、carry/entryのunknown keyをraw cardinalityごと`invalid-carry-schema`へfail-closeする | `tests/left-arm-carry-log.test.ts` |
| U-CARRY-021 | canonical gate argv | `helix gate Gx` / `bun [run] src/cli.ts gate Gx`だけを許可し、任意commandへの`--gate`混入偽装を拒否する | `tests/left-arm-carry-log.test.ts` |
| U-CARRY-022 | real loader regression | real repo全PLANをproduction loaderで走査し、exact legacy authority込みでviolation 0を固定する | `tests/left-arm-carry-log.test.ts` |

### skill scaffold / catalog 品質の oracle

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-SKQUAL-001 | scaffold slug inventory | 大小文字正規化後の既存slug完全衝突は`--force`を含めwrite拒否、hyphen segment包含だけならadvisory | `tests/skill-scaffold.test.ts`, `tests/skill-scaffold-cli.test.ts` |
| U-SKQUAL-002 | scaffold substance | 未記入markerまたはgeneric stubを含む生成物はfailし、全marker記入後の1200字以上・2節以上はpass | `tests/skill-quality.test.ts` |
| U-SKQUAL-003 | duplicate content | name/slugの大小文字違い重複と、改行・句読点・見出し番号を変えた16-gram共有率0.35超の複製を検出 | `tests/skill-quality.test.ts` |
| U-SKQUAL-004 | substance boundary | 本文1199字または1節をfail、ちょうど1200字かつ2節をpassし比較演算子変異を排除 | `tests/skill-quality.test.ts` |
| U-SKQUAL-005 | SKILL_MAP双方向同期 | Pack列token完全一致で未登録packと不存在参照を検出し、本文substringや別tableを登録根拠にしない | `tests/skill-quality.test.ts` |
| U-SKQUAL-006 | doctor wiring / real catalog | 実catalogをgreen固定し、`runDoctor`の`skill-quality` hard gateがok集約とmessageへ接続される | `tests/skill-quality.test.ts` |

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-FLIFE-001 | strict codec / state machine | unknown version・非UTC・禁止遷移・破損行をfail-closeし、正常sourceを隠さずdiagnostic化 | `tests/feedback-lifecycle.test.ts` |
| U-FLIFE-002 | operation replay / SQLite lock | 同intent replayは追記0、異intentはconflict、直列化後のeventは1系列 | `tests/feedback-lifecycle.test.ts` |
| U-FLIFE-003 | crash recovery | multi-eventのpartial append後retryはsemantic prefixを検証し不足eventだけ追記 | `tests/feedback-lifecycle.test.ts` |
| U-FLIFE-004 | terminal再投影 | closed同generationは復活せず、authoritative再activeだけ新activity epochでopen | `tests/feedback-lifecycle.test.ts` |
| U-FLIFE-005 | generation / firstSeen | active再投影・通常payload driftはTTLを戻さず、安全側bucket昇格だけpolicy epochを進める | `tests/feedback-lifecycle.test.ts` |
| U-FLIFE-006 | telemetry TTL | 24h-1msはopen、境界一致でtelemetryだけack、gate/actionable/future clockは対象外 | `tests/feedback-lifecycle-surface.test.ts` |
| U-FLIFE-007 | canonical alias join | feedback_events aliasとfindings/quality_signals直読をfilter前に同identityへ正規化 | `tests/feedback-lifecycle-surface.test.ts` |
| U-FLIFE-008 | safe visibility | lifecycle unavailable・damaged・digest mismatch時は未解決を表示しruntime fail-open | `tests/feedback-lifecycle-surface.test.ts` |
| U-FLIFE-009 | dedupe / breadcrumb | fingerprint衝突で最高severityと全identityを保持し、理由別hiddenを分離 | `tests/feedback-lifecycle-surface.test.ts` |
| U-FLIFE-010 | session receipt | surface receiptは同一sessionだけ抑止し、未ack項目は次sessionで再表示 | `tests/feedback-lifecycle-surface.test.ts` |
| U-FLIFE-011 | promotion truth table / concurrency | 成功commit/plan_switchあり・成功memory_writeなしの場合だけ並行Stopを1通知へ収束 | `tests/memory-promotion.test.ts` |
| U-FLIFE-012 | fail-open / privacy | 破損log・nudge書込失敗でもStop 0、eventへbody/diff/secretを保存しない | `tests/memory-promotion.test.ts` |
| U-FLIFE-014 | torn write 復旧 | 最終 JSON 行の途中 byte (先頭直後 / 中央 / 末尾直前の 3 境界で parameterize) で切れた journal を、次の同一 operationId retry で全 receipt が valid 行として存在し `damaged` が空になるまで収束させる (1 回の write は atomic ではない) | `tests/feedback-lifecycle.test.ts` |
| U-FLIFE-013 | batch surface receipt | 多数sourceのsurface receiptを単一lock・単一journal snapshotで記録し、全refのsame-session抑止、replay追記0、operation conflictを検証する | `tests/feedback-lifecycle.test.ts` |
| U-VMCUT-001 | L12 canonical 二重投影 (HR-FR-VMCUT-02/05) | remapに無いlegacy L-token (例 L99) が観測されたらunmapped fail-close violation。全15 layer被覆、縮退remap (L5/旧L6→L5, L13/L14→L12)、非L-token無視、実repo unmapped 0のいずれが崩れてもfail | `tests/layer-projection.test.ts` |

### session handover 廃止の oracle

PLAN-REVERSE-344がR4へmergeされるまで本節は設計oracleであり、実装greenを主張しない。L7 retirement PLANは
以下の全oracleを`test_code`へ1:1で束縛し、provider/operations evidenceの保持試験を旧surface不存在試験と
分離しなければならない。

| U-ID | 対象 | 反例と期待結果 |
|---|---|---|
| U-HRET-001 | typed inventory | live参照の未分類、型なしallowlist、同一symbolの矛盾分類をhard fail |
| U-HRET-002 | phase state machine | canonical intentDigest、status値域、隣接forward edgeを検査し、prerequisite未達、skip、逆行、legacy_write_disabled以後/complete後rollback、異intent replayを拒否 |
| U-HRET-003 | legacy note移管 | provenance/TTL/link/operationIdを持つ有効noteだけ最大1件移管しsecret/PIIを拒否 |
| U-HRET-004 | journal crash recovery | partial append後にsemantic prefixを検証し、完了checkpointを重複実行しない |
| U-HRET-005 | delivery semantics | immutable entry UUID + stable consumer IDのdeliveryIdとpayload digest、durable receipt/event、pending→delivered→acknowledged/expired、同ID同digest dedupe、同ID異digest conflict、DB消失rebuildを検証し、stdout成功後crashの再配信を許容 |
| U-HRET-006 | continuation precedence | DBとmemory矛盾時はDBを表示しdiagnosticを生成、memoryでDBを上書きしない |
| U-HRET-007 | Stop / complete | session digest・DB event・promotion nudgeだけを生成しCURRENT/proseを書かない |
| U-HRET-008 | preserve境界 | provider delegationとoperations transitionをcontinuation sourceにはしない。retirement前後で件数・原本digest・provenance・schema validation・query/export可用性・retention metadataが不変であることを別fixtureで検証する |
| U-HRET-009 | archive reconcile | source/target件数とper-file digest一致前のsource削除を拒否 |
| U-HRET-010 | backup / rollback | checkpoint・digest一致時だけlegacy_write_disabled到達前rollbackを許可し、それ以後は旧read/writerを復活させずforward fixへ送る |
| U-HRET-011 | generated surfaces | adapter/setup/template/task/CI/distributionのmanifest差分をfail-close |
| U-HRET-012 | resurrection | complete後の旧CLI/path/import/writer/CURRENT再出現をhard fail |
| U-HRET-013 | fresh / brownfield | 旧surfaceなしでactive PLAN・blocker・next authority・feedbackを再開 |
| U-HRET-014 | residual allowlist | provider/operations/archive以外のlive handover residualを0とする |
| U-HRET-015 | action-binding cutover approval | PO/approved HEAD/typed manifest/target tree/generated baseline/dry-run digestを再計算し、enforce authorityと同一decision、期限内`appliedAt`、terminal journal digestへ束縛する。apply前の期限切れ、digest/decision/HEAD drift、terminal欠落を拒否する。`approved_applied`は適用時刻が期限内なら将来時刻で再失効せず、semantic targetのfinding 0と実resurrection analyzerのactual + 4 projection finding 0をANDする。retirement meta source/testの除外はexact path・typed role marker・許可finding型の積に限定し、類似path、marker欠落、command/symbol/writer混入は引き続fail-closeする |

`U-REGEXP-004` は削除済み `src/handover/**` を再 import せず、`U-HRET-001..015` citation と
`handover-retirement` / `handover-resurrection` lint import の積を direct regression coverage として認識する。
名称だけの retirement test は coverage に数えず、旧 module の再導入も要求しない。

実装binding（PLAN-L7-416 Sprint 1〜3）: `U-HRET-002/004/009/010`は
`tests/handover-retirement-runtime.test.ts`、`U-HRET-003/005/006/007`は
`tests/continuation-event-first.test.ts`、`U-HRET-008/009`のpreserve/archive追加oracleは
`tests/retirement-preserve.test.ts`へcitation済み。`U-HRET-011/012/014`は
`tests/handover-resurrection.test.ts`へcitationし、complete checkpoint後は residual 1件でもhard failする。
baseline authorityはimmutable Git revision/blob/file/semantic digestとcode pinを一致させ、preserve allowlistは
R4時点のpath/kind/digest authority、real collector、strict schema/retention/content検証からのみ生成する。
production modeはstrict journal terminal、approval authority、code pinの一致後だけenforceへ切り替える。
`U-HRET-015`は`tests/handover-cutover-approval.test.ts`へcitationし、approval単独の自己申告ではなく
`analyzeHandoverResurrectionShadowRepo`の実finding 0とのANDを固定する。
`U-HRET-013`はfresh/brownfield/distribution fixtureで旧surfaceを生成せず、DB continuationから再開できることを検証する。
complete journalや自己申告authorityだけが先行した場合はmodeを切り替えずhard failする。
fresh setup / brownfield merge / command contract / clean distribution全artifactは`renderSetupArtifacts`と
`renderBrownfieldSetupArtifacts`を起点にnamespace分離して同じresurrection policyで走査し、actual pathとの衝突、
distribution source欠落、projection件数不一致をfail-closeする。seed `ee156a5d`と後続code pinを分離し、
projection baselineの同一差分内自己承認を禁止する。

## §4 L6 reverse reference 追補

`l6-completion` は L6 設計 doc の filename が L8 単体テスト設計または旧正本に現れることを
凍結入力として扱う。以下の L6 追加設計は L8 正本の逆参照として保持し、詳細 oracle は
対応 PLAN / 旧正本に残す。

| L6 doc | oracle route |
|---|---|
| `handover-db-derivation.md` | retirement prerequisite の歴史的 oracle。`handover-retirement.md` に supersede され、独立した現役green契約やCURRENT writerの根拠にしない |
| `handover-retirement.md` | session/prose handover廃止、継続状態移管、復活検出の`U-HRET-*` oracle |
| `harness-memory-compaction.md` | harness memory 圧縮の単体 oracle |
| `memory-cross-runtime-surface.md` | memory delegation recall 注入の単体 oracle（`U-MEMX-*`） |
| `harness-memory-structure.md` | memory v2 schema/lifecycle/fencing/compaction/delivery/retire の15単体 oracle（`U-MEMV2-*`） |
| `feedback-lifecycle.md` | feedback lifecycle状態機械・TTL・surface filter・promotion nudgeの12単体oracle（`U-FLIFE-*`） |
| `plan-descent-specific-parent-binding.md` | PSPB 系 oracle |
| `reverse-feedback-closure.md` | reverse feedback 閉塞の単体 oracle |
| `closure-auto-approval.md` | close_ready機械承認と不可逆境界の`U-CAUTO-*` oracle |
| `closure-evidence-materialization.md` | production authority registryと証跡生成transactionの`U-CMAT-*` oracle |
| `closure-authority-backfill.md` | Vペア由来authority補完とrecoverable applyの`U-CABF-*` oracle |

### 正本化済みmemory退役 oracle（PLAN-L7-458）

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-MEMV2-005c | `retireMemory` | harness/projectのactive targetをbody-free receiptへ退役し、再実行は`already_consumed`かつ追記0。takeoverは別API境界に残す | `tests/memory/memory-v2.test.ts` |
| U-MEMV2-005d | legacy reader | v2 terminal receiptを旧`listMemory`／`surfaceMemory`がactive entryとして再表示しない | `tests/memory/memory-store.test.ts` |
| U-MEMV2-005e | 全件追突binding | 分岐間39件を台帳へexactly oneで保持し、worker runtime指示6件のL1/L3降下、repository memoryのactive 0、damaged 0、receipt body空を検証する | `tests/harness-memory-reconciliation-binding.test.ts` |
| U-MEMV2-005f | retirement authority／batch failure | consumer、layer、全ID、正本targetを束縛するauthorityをlock前後で検査し、欠落／差替えは追記0の`unauthorized`。batch途中失敗は先行成功と残件失敗を正確に返す | `tests/memory/memory-v2.test.ts` |
| U-MEMV2-005g | authority digest／path boundary | authority IDをsource revision＋全entry＋target content digestから再計算し、repo外realpathへ解決するsymlinkを拒否する。実在repo内targetは受理する | `tests/memory/memory-v2.test.ts` |

### GitHub収束運用adapter drift oracle（PLAN-L7-470）

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-RDRIFT-004 | merge/review/finding disposition marker parity | AGENTS、root CLAUDE、Claude runtime policyからnative auto-merge禁止、read-only AI-B、current PR局所修正、別episodeだけIssue化の各markerを一件ずつ除き、全fixtureを`rule-drift` violationにする | `tests/rule-drift.test.ts` |

### 要件文書registry検証（PLAN-L7-461）

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-RDOCREG-001 | `loadRequirementsDocRegistry` | registry欠落・schema不正・非`.md` pathをfail-closeし、正常時はcanonical／compatibilityの実在pathを返す。配布bundleと一時fixtureでもpackage rootを誤認しない | `tests/requirements-doc-registry.test.ts` |

### Issue closure契約（PLAN-L7-462）

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-ICLOSE-001 | `analyzePrContext` | `Closes #N`を持つPRでOutcome、PLAN/HEAD/test・CI/reviewを含むcurrent closure receipt、子Issue dispositionのいずれかが欠落すればfail-closeする。rejected/quarantinedはterminal decision receipt、superseded/cancelledは実値PO decisionの欠落を拒否し、template placeholderを証拠として受理しない | `tests/branch-kind.test.ts` |
| U-ICLOSE-002 | `harness-check` workflow | 全pull requestで`issue-closure-contract`がHELIX CLIの`guard pr-context`を通り、workflow-local forkを作らない | `tests/harness-check-workflow.test.ts` |
| U-ICLOSE-003 | consumer PR template | 配布templateのbyte manifestがclosure block追加後の正本digestへ固定される | `tests/setup.test.ts` |
| U-ICLOSE-004 | objective evidence audit | closure contractの要件・CLI・workflow・template traceをobjective evidence正本で検証する | `tests/goal-evidence-audit.test.ts` |

#### Issueクローズgraphの実在束縛（PLAN-RECOVERY-10）

| oracle | 対象 | 合否 | test |
|---|---|---|---|
| U-ICGRAPH-001 | graph green | canonical exact set、child/successor実状態、merged PR HEAD、CI run/HEAD/success、review comment digest/approveが全一致する場合だけgreen | `tests/issue-closure-graph.test.ts` |
| U-ICGRAPH-002 | graph completeness | duplicate/missing contract、open child、state不一致successorをtyped failureで拒否 | `tests/issue-closure-graph.test.ts` |
| U-ICGRAPH-003 | receipt freshness | stale/unmerged PR、別HEAD、別CI run/HEAD、CI red、review digest/verdict不一致を拒否 | `tests/issue-closure-graph.test.ts` |
| U-ICGRAPH-004 | contract parser | 散文や別schemaを証拠にせず、strict JSON exact key setだけを受理 | `tests/issue-closure-graph.test.ts` |
| U-ICGRAPH-005 | #227/#194回帰 | WCC contract receiptが一件でも未完なら両親Issueのcloseを拒否 | `tests/issue-closure-graph.test.ts` |
| U-ICGRAPH-006/007/009 | GitHub adapter | current Issue/PR/Actions/commentをread-only構築し、重複Closes、comment切詰め、graph contract未記載をfail-close | `tests/github-issue-closure-graph-adapter.test.ts` |
| U-ICGRAPH-008 | PR context結線 | graph file欠落、closing/snapshot exact setの片側欠落、graph findingを既存`analyzePrContext`のblockerへ昇格 | `tests/branch-kind.test.ts` |
| U-ICLOSE-004 | objective outstanding projection | 新規PLAN追加後のoutstanding件数をauditとCLI surfaceで同じ値へ同期する | `tests/goal-evidence-audit.test.ts` |

### 工学規律PLAN契約（PLAN-L7-463）

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-EDISC-001 | PLAN-L7-463 / 新規L3〜L7 PLAN | discipline markerまたは必須DbC/TDD/complexity fieldが欠落すればfail-closeする | `tests/ddd-tdd-rules.test.ts` |
| U-EDISC-002 | PLAN-L7-463 / 縮退判断 | `no_change`と`none`を明示したPLANを受理し、code追加やclass化を強制しない | `tests/ddd-tdd-rules.test.ts` |
| U-EDISC-003 | PLAN-L7-463 / complexity増加 | `add_code`または`justified_positive`で理由・削除条件のいずれかが欠落すればfail-closeする | `tests/ddd-tdd-rules.test.ts` |
| U-EDISC-004 | PLAN-L7-463 / 原子変更・極小refactor | behavior contract、責務owner、atomic slice、refactor段階、legacy状態の欠落・未知値を拒否し、consumer=0未確認のlegacy削除をfail-closeする | `tests/ddd-tdd-rules.test.ts` |

### PR scope manifest契約（PLAN-L7-466）

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-PRSCOPE-001 | `analyzePrContext` | 1 behavior／1 owner、安全なpath family、実差分とexact一致する予定変更path全集合、実在companion、scope expansionなしを持つ原子PRを受理する | `tests/branch-kind.test.ts` |
| U-PRSCOPE-002 | manifest safety | 複数behavior、unsafe glob／traversal、予定外/未変更path、根拠なしscope expansionをfail-closeする | `tests/branch-kind.test.ts` |
| U-PRSCOPE-003 | source companion | `src/`変更時に実差分へPLANとtestのexact companionが揃わなければfail-closeする | `tests/branch-kind.test.ts`, `tests/harness-check-workflow.test.ts` |
| U-PRSCOPE-004 | CLI changed-file | workflowが生成したNUL-delimited base..head path fileをCLIが読み、Unicode pathをquote変換せず検査し、unsafe pathはshell展開前に拒否する | `tests/cli-surface.test.ts` |
| U-PRSCOPE-005 | PLAN contract一致 | PR manifestのbehavior／ownerと必須PLAN companionの`behavior_contract_id`／`responsibility_owner`がexact一致しない場合にfail-closeする | `tests/branch-kind.test.ts` |
| U-PRSCOPE-006 | current GitHub snapshot parser | 1回のAPI readからbody／head／base／identity digestを作り、別PR・schema不正・不正SHAをfail-closeする | `tests/branch-kind.test.ts` |
| U-PRSCOPE-007 | current GitHub snapshot workflow | API取得不能を非zeroとし、同一snapshotからdiffとguard inputを作り、guard前後のbody／head／base driftをfail-closeする | `tests/harness-check-workflow.test.ts` |

### Issue #1052 outstanding snapshotのsemantic merge guard

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-OUTMERGE-001 | count/list exactness | `decision_count`と`plan_ids`を別側から採用したsnapshotを、件数不一致とcount/list不一致の双方でfail-closeする | `tests/outstanding.test.ts` |
| U-OUTMERGE-002 | blocker/action/live invariant | blocker／required actionの片側採用、live duplicate PLANによる件数と集合の意味 driftを検出する | `tests/outstanding.test.ts` |
| U-OUTMERGE-003 | early guard | 現行repoのcommitted snapshotをlive projectionと照合し、修復書込みなしで明示repair commandを返す | `tests/outstanding.test.ts` |
| U-OUTMERGE-004 | merge-readiness integration | semantic violationがある場合、push／PR作成可能判定をfail-closeし、`helix db rebuild`を提示する | `tests/github-merge-readiness.test.ts` |
| U-OUTMERGE-005 | guard negative oracle | driftしたsnapshotを早期guardへ渡した場合、`ok=false`かつsemantic violationを返す | `tests/outstanding.test.ts` |

scope expansionのunit oracleはreceipt pointerの構文と理由を検査する。外部commentの存在・内容・承認主体は
同一HEADのAI-B review evidenceで検証し、unit greenだけで承認済みとは扱わない。

### closure自走承認 oracle

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-CAUTO-001 | typed authority AND | HEAD/PLAN/evidence/runを実bytesから検証したmanifestだけ許可 | `tests/closure-auto-approval.test.ts` |
| U-CAUTO-002 | 自己申告排除 | DB集計greenでもevidence bytes driftならfail-close | `tests/closure-auto-approval.test.ts` |
| U-CAUTO-003 | typed不可逆境界 | capability authorityが不可逆ならhumanへ残し、heuristicに依存しない | `tests/closure-auto-approval.test.ts` |
| U-CAUTO-004 | replay/TOCTOU | HEAD、PLAN bytes、evidence bytes、run freshness driftを評価時とwrite直前CASで拒否 | `tests/closure-auto-approval.test.ts` |
| U-CAUTO-005 | atomic apply/audit | rename途中失敗を全rollbackし、失敗before/after auditとdigestを残す | `tests/closure-auto-approval.test.ts` |
| U-CAUTO-006 | bounded batch | 361件を100件以下のwindowで欠落・重複なく評価する | `tests/closure-auto-approval.test.ts` |
| U-CAUTO-007 | manifest接続境界 | typed manifest未接続のclose_ready候補をautomatableにもhuman approvalにも昇格させず、evidence_not_readyへ戻す | `tests/closure-auto-approval.test.ts` |
| U-CURRENT-LOCATION-001 | readiness projection | current-locationのclose_ready status・count・next commandがtyped readiness authorityと一致し、未接続候補を承認待ちへ誤表示しない | `tests/current-location.test.ts` |

### closure証跡materialization（PLAN-L6-72）

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-CMAT-001 | authority分類 | registryとsource digestで全close_readyをeligible/backfill_required/human_only/invalidへexactly-one分類し、unknown/重複/driftを拒否する | `tests/closure-authority-registry.test.ts` |
| U-CMAT-002 | authority非推測 | caller override、review commandだけ、曖昧test citation、複数oracle候補からbindingやgateを生成しない | `tests/closure-authority-registry.test.ts` |
| U-CMAT-003 | scope/HEAD | review-bundleとのmissing/excess/order drift、dirty tree、非main HEAD、symlink pathをfail-closeする | `tests/closure-evidence-materialization.test.ts` |
| U-CMAT-004 | runner固定 | bindingをsingle-path vitest argvへ固定し、任意shell、path traversal、未知gate commandを拒否する | `tests/closure-evidence-runner.test.ts` |
| U-CMAT-005 | dedupとoracle | 同一HEAD+argvは1回だけ実行し、JSON結果のcollect/execute/passを確認してPLAN+oracleごとexactly-one test caseを作る | `tests/closure-evidence-runner.test.ts` |
| U-CMAT-006 | all-or-none staging | 途中exit非0、timeout、signal、output欠落時はpersistent DB/JSONL/run record/manifestを変更しない | `tests/closure-evidence-materialization.test.ts` |
| U-CMAT-007 | exact join | test/gateの物理spawn receiptはHEAD+kind+argvごとfresh期間内exactly-one、stale後はimmutable historyを保持して更新し、論理runは選択receiptを1:N参照する。DB、JSONL attestation、run record、共有stdout/stderr artifact bytesがmaterialization identityとdigestで完全一致する | `tests/closure-evidence-materialization.test.ts`、`tests/closure-process-receipt-schema.test.ts` |
| U-CMAT-008 | crash recovery | DB/JSONL/filesystem各境界のcrashから再開/rollbackし、孤立eventとpartial manifestを残さない | `tests/closure-evidence-materialization.test.ts` |
| U-CMAT-009 | bounded production | 361件を100件以下のwindow、実worker pool concurrency上限4、HEAD+argv横断dedupe、single DB writerで欠落・重複なく処理する | `tests/closure-evidence-materialization.test.ts`、`tests/closure-evidence-runner.test.ts` |
| U-CMAT-010 | trust/human境界 | materializationはstatusを変更せず、executeはfresh required-check CASと不可逆human境界を維持する | `tests/closure-evidence-materialization.test.ts` |
| U-CMAT-011 | physical receipt schema | 旧DB rowを保存したadditive migrationで物理receiptをimmutable exactly-one化し、論理run参照はlegacy互換nullableとする | `tests/closure-process-receipt-schema.test.ts` |
| U-CMAT-012 | atomic process lock | 完全なowner directoryだけをatomic claimし、2 child同時barrierのwinnerをexactly-one化する。process birth identityでlive/stale/PID再利用を判定し、torn・symlink・異owner releaseをfail-closeする | `tests/closure-materialization-lock.test.ts` |
| U-CABF-001 | census保存則 | current review-bundleの361件をexactly-once分類し、missing/excess/duplicate/order driftを拒否する | `tests/closure-authority-backfill.test.ts` |
| U-CABF-002 | Vペア三者join | PLAN binding、L8 row、canonical non-symlink Vitest collected fullNameの`[PLAN/ORACLE]` markerが同じPLAN+oracle+pathへ一意joinする場合だけproposalを作り、comment-only・skip/todo・duplicateを拒否する | `tests/closure-authority-backfill.test.ts` |
| U-CABF-003 | authority非推測 | green command、review prose、類似file名、prefix oracle、単独test citationからbinding/gate/capabilityを生成しない | `tests/closure-authority-backfill.test.ts` |
| U-CABF-004 | typed gate/capability | confirmed designを第一、PLANを第二とする同値authority blockだけからsource pointer/digest付きgate/capabilityを採用し、conflict/unknownはinvalid、irreversibleはhuman_onlyにする | `tests/closure-authority-backfill.test.ts` |
| U-CABF-005 | read-only bundle | bundle生成はHEAD、scope、registry、source digestへ束縛し、registry/PLAN/test/DBを変更しない | `tests/closure-authority-backfill.test.ts` |
| U-CABF-006 | independent review | append-only receiptへ異なるworker/reviewer identity、expiry、HEAD/scope/registry/proposal/recompute digest、exactly-one verdictを束縛し、自己申告・偽造・stale・重複を拒否する | `tests/closure-authority-backfill-transaction.test.ts` |
| U-CABF-007 | recoverable atomic apply | governance mutation lockで2 writerをexactly-one化し、prospective preverify、before-image/journal fsync、rename+dir fsync、commit marker、crash recoveryを通じall-or-none適用する | `tests/closure-authority-backfill-transaction.test.ts` |
| U-CABF-008 | post-apply再分類 | registry hard gateと全候補再分類を実行し、失敗時before bytesを復元して、件数保存則、対象eligible化、非対象不変、materializer generation CASを確認する | `tests/closure-authority-backfill-transaction.test.ts` |
| U-CABF-009 | incremental convergence | 361件を100件以下のwindowで処理し、canonical append-only digest chainへreason backlog/cycle差分をidempotent保存し、registry commit後のledger失敗を決定論的に回復する | `tests/closure-authority-backfill-transaction.test.ts` |
| U-CABF-010 | human/closure境界 | backfillはclosure status、approval、不可逆actionを変更せず、human/action-binding authorityを維持する | `tests/closure-authority-backfill-transaction.test.ts` |
| U-CABF-011 | production public API | 3 public exportと共有candidate builderを検証する | `tests/closure-authority-backfill-production-route.test.ts` |
| U-CABF-012 | production run/window | 全候補保存則と最大100件windowを検証する | `tests/closure-authority-backfill-production-route.test.ts` |
| U-CABF-013 | production HEAD provenance | expected HEADとlocal origin/mainを検証する | `tests/closure-authority-backfill-production-route.test.ts` |
| U-CABF-014 | production source boundary | dirty、case-fold、symlink、submoduleを拒否する | `tests/closure-authority-backfill-production-route.test.ts` |
| U-CABF-015 | production allowlist | canonical strict allowlistを検証する | `tests/closure-authority-backfill-production-route.test.ts` |
| U-CABF-016 | production CLI | 必須optionとJSON/exit contractを検証する | `tests/closure-authority-backfill-production-route.test.ts` |
| U-CABF-017 | production read-only | 全経路でmutationが無いことを検証する | `tests/closure-authority-backfill-production-route.test.ts` |
| U-CABF-018 | production builder/verifier parity | 初回生成と再構築の同型性を検証する | `tests/closure-authority-backfill-production-route.test.ts` |

### PLAN採番一意性のoracle

対象設計: `docs/design/harness/L6-function-design/plan-number-uniqueness.md`

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-PLANNUM-001 | 新規衝突 | baseline外の採番keyが2本ならkey・実本数・許容本数・filenameを報告してfail-close | `tests/plan-number-uniqueness.test.ts` |
| U-PLANNUM-002 | baseline上限 | baseline登録済みkeyは許容本数まで通し、1本増で拒否する（凍結が上限として効く） | `tests/plan-number-uniqueness.test.ts` |
| U-PLANNUM-003 | 凍結の固定化防止 | 改番でbaselineを下回ったkeyを`resolvedBaselineKeys`で報告し、baselineを下げるよう促す | `tests/plan-number-uniqueness.test.ts` |
| U-PLANNUM-004 | 採番key粒度 | keyは`PLAN-<layer>-<number>`までで、slug違いまたはslug省略形を含む同番号は衝突、番号違いは非衝突。pattern外filenameは無視 | `tests/plan-number-uniqueness.test.ts` |
| U-PLANNUM-005 | real repository | 現行repoがbaseline超過0で、採番key数が空振りでなく、baselineにstale keyが無い | `tests/plan-number-uniqueness.test.ts` |
| U-PLANNUM-006 | plan lint wiring | 既定合成と`--gate number-uniqueness`の双方へ配線され、既定経路から外すmutationがkillされる | `tests/plan-number-uniqueness.test.ts` |
| U-DOCTORSCAN-001 | home走査の非実行 | `checkDbProjectionIngestion`はhome配下のruntime session履歴を走査しない（Issue #495）。投影可能なfixtureを`HELIX_CLAUDE_SESSIONS_DIR`へ置いても`model_runs`の`role='session'`行は0件のまま。同一fixtureが単体overlayでは1行入ることと対にして固定し、「fixtureが空で0件」との取り違えを防ぐ | `tests/slow/doctor.test.ts` |
| U-CLOSPROBE-001 | 再入の false negative | closure probe の再入 marker を active root の集合とし、間接再入(A→B→A)・marker が symlink 経由 path・解釈不能 marker をいずれも exit 2 で fail-close する（Issue #548）。子 marker が親 root と自 root の両方を含むことも固定する | `tests/cli-surface.test.ts` |
### エスカレーション前相談ゲート escalation-consult gate（PLAN-L7-549）

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-ESC-001 | `evaluateEscalationConsultGate` | 最終 assistant 応答が PO エスカレーション文言を含み、fresh な consult receipt が無ければ block=true（exit 2 で停止ブロック）。stale receipt・empty override marker も block を維持する | `tests/escalation-consult-gate.test.ts` |
| U-ESC-002 | receipt / override 経路 | fresh receipt（TTL 6h 内）または non-empty one-shot override（消費される）は pass。override は 2 回目に再利用できない | `tests/escalation-consult-gate.test.ts` |
| U-ESC-003 | fail-open 境界 | escalation 非検知・transcript_path 欠落・transcript parse 不能・receipt 読取失敗では block しない（既存 Stop hook 挙動を変えない） | `tests/escalation-consult-gate.test.ts` |

### setup-node v7移行dual admission（PLAN-RECOVERY-57）

対象設計: `docs/design/harness/L6-function-design/function-spec.md`

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-TOOLCHAIN-PIN-005 | source setup-node移行許可集合 | `actions/setup-node@v4`と`actions/setup-node@v7`は#596移行中だけgreenとし、いずれも既存のNode engine floor／`node-version`整合を維持する | `tests/toolchain-pin.test.ts` |
| U-TOOLCHAIN-PIN-006 | 未許可・未固定・混在ref | v6、v8、`@main`、refなし、および許可refと未許可refの混在を`source-harness-check-setup-node-ref-unsupported`でfail-closeし、先頭の許可stepで後続違反を隠せない | `tests/toolchain-pin.test.ts` |

### review CI generation deadlock回復（PLAN-RECOVERY-65）

対象設計: `docs/design/helix/L6-function-design/orchestration-memory.md`

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-GCRA-032 | Ready admission | newer pending／failure／cancelled runは同HEAD success receiptをstale化せず、newer successだけが旧receiptを拒否する | `tests/github-cross-review-admission.test.ts` |
| U-GRCIGEN-001 | latest success選択 | pending／failure／cancelledを除外して最新terminal successを返す | `tests/github-review-ci-generation.test.ts` |
| U-GRCIGEN-002 | tie break | 同一updatedAtではattempt、run ID順で決定的に選ぶ | `tests/github-review-ci-generation.test.ts` |
| U-GRCIGEN-003 | success不在 | terminal successが無ければnullを返して通知・receipt生成を拒否する | `tests/github-review-ci-generation.test.ts` |
| U-CPRCONV-023 | producer共有 | pr-notifyがnewer failureではなく同HEAD latest success generationを通知へ束縛する | `tests/claude-pr-convergence.test.ts` |
