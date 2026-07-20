---
canonical_vmodel: L1-L12
canonical_layer: L3
canonical_pair: L10
legacy_physical_layer: L3
l3_progression_marker: HELIX:L3-PROGRESSION-AUTHORITY:v1
l3_progression_authority: docs/governance/l3-progression-authority-rebaseline-2026-07-19.md
title: "前身UT-TDD全仕組み監査からのHELIX hardening要件"
layer: L3
kind: add-design
status: draft
created: 2026-07-20
updated: 2026-07-20
owner: TL / PO承認必須
source_audit: docs/governance/predecessor-harness-full-weakness-audit-2026-07-20.md
pair_artifact: docs/test-design/helix/predecessor-harness-mechanism-hardening-acceptance.md
related_requirements: docs/design/helix/L3-requirements/l12-scrum-rebaseline-requirements.md
---

# 前身UT-TDD全仕組み監査からのHELIX hardening要件

## 1. authorityと非変更契約

本書は前身UT-TDDの弱点をHELIXへ持ち込まないための差分要件である。L1〜L12 canonical V-model、6 pair、
Full V / Production Scrum / Discovery・PoC route、Production Scrumの縮約V＋TDD＋Scrum Reverse＋release＋operation
evidenceを変更しない。Bunはcurrent/target/fallback/rollback authorityにしない。

## 2. 機能要件

| ID | 要件 | source weakness |
|---|---|---|
| UTH-FR-001 | 前身repositoryのheads/tags/pull refsをexact OIDで二重advertisement確認し、sealed snapshot、ref/object/tree/tag peel、分母digestを作る。ref drift時は監査と採否receiptをstaleにする | UTW-024 |
| UTH-FR-002 | sourceのL0〜L14をcompatibility inputに限定し、canonical outputはL1〜L12 exactly onceと6 pairだけを返す。固定Scrum contractの変更をfail-closeする | UTW-001 |
| UTH-FR-003 | Bun command、lock、API、CI actionをactive authorityへ採用しない。TypeScript/Node 24 LTS transactional boundaryとPython semantic coreへbehavior atom単位で再実装する | UTW-001, UTW-010 |
| UTH-FR-004 | Python意味判断とNode副作用をversioned strict contractで分け、PythonへDB path、repository、credential、`.helix`を渡さず、Nodeだけが再検証後に単一transaction commitする | UTW-001 |
| UTH-FR-005 | canonical、compatibility、archive、generated evidenceを型と物理境界で分離し、同じenum/gateでlegacy成功がcanonical失敗を相殺しない | UTW-025 |
| UTH-FR-006 | continuationはappend-only event→harness.db冪等projectionを正本にし、prose/CURRENT/memoryへprogress・next action・leaseを複製しない | UTW-002 |
| UTH-FR-007 | tracked source、tracked audit evidence、generated runtime state、cache、DB、transcriptをmanifestで分離し、generated stateのcommitとsource cloneへの逆流を拒否する | UTW-012 |
| UTH-FR-008 | Claude/Codex/hosted API/CLI/IDEの全tool edit、shell、agent spawn、destructive git surfaceをcapability registryへ登録する。mechanical hook非適用面はsnapshot-bound preflightが無ければmutationを拒否する | UTW-003, UTW-019 |
| UTH-FR-009 | fail-open、warn、fail-closeをavailability・observability・safetyで分類し、欠損を空集合へ変換しない。安全・権威・完了・secret・PII・trace欠損は必ずfail-closeする | UTW-013, UTW-014 |
| UTH-FR-010 | `test`、targeted test、CI、doctor内testが同じrunner contractを参照し、detached HEAD、timeout、env、DB、working-tree policyの差をmachine-readableに宣言する | UTW-008 |
| UTH-FR-011 | doctor/check/projectionをregistry、dependency DAG、profile、scope、per-check timingへ分割し、targeted failureをfull aggregate再実行なしに再現できる | UTW-009, UTW-020, UTW-026 |
| UTH-FR-012 | Linux full gateをcanonicalとし、WindowsとmacOSのshell/path/SQLite/entrypoint compatibility matrixを持つ。platform legのscope差は明示し、狭いlegのgreenでfull gateを代替しない | UTW-010, UTW-011 |
| UTH-FR-013 | branch prefix、route、owner、TTL、base、merge strategyを単一policyにし、stale、merged残存、long-lived ahead branchをfinding化する | UTW-015 |
| UTH-FR-014 | main未包含の全head/pull commitをatom化し、adopt/harden/merge/reference/defer/rejectをexactly onceで記録する。branch削除で未分類atomを消さない | UTW-015, UTW-024 |
| UTH-FR-015 | PR trace、review、green command、approvalをlive head/base/merge-baseとdigestへ束縛し、synchronize、force以外のhead移動、base更新、evidence変更でstale化する | UTW-005 |
| UTH-FR-016 | feature対応はGitHub feature label＋Issueを入口とし、固定L12 V-model×Scrum hybridへrouteする。Issue Form schema、required labels、label bootstrap、inbound webhook、DB inbox、PLAN候補を一連のadmissionとして検証し、form存在だけをdogfood evidenceにしない | UTW-017 |
| UTH-FR-017 | repository ruleset、branch protection、CODEOWNERS、workflow、policy schemaをlive APIと双方向diffし、strict、bypass actor、PR-only、required check、merge methodの差をfail-closeする | UTW-004 |
| UTH-FR-018 | GitHub signal→Issue→PLAN→branch→PR→CI→merge→memory promotionをexecution episode/outboxでexactly onceにし、retry、crash、duplicate delivery、partial merge後処理をreconcileする | UTW-006, UTW-018 |
| UTH-FR-019 | merge後にbranch、worktree、slot、continuation、temporary evidence、memory candidateをtransactional closureし、失敗時は再開可能なnext actionをDBへ残す | UTW-018 |
| UTH-FR-020 | secret/PII/license scanをpush対象全commit/blob、tracked docs/evidence/memory、generated distributionへCIで再実行し、warn-only hookをterminal evidenceに数えない | UTW-007 |
| UTH-FR-021 | DB rebuildはevent-first、idempotent、atomic、schema-versioned、replayableにし、projectionごとのcurrency、input digest、duration、row count、failure boundaryを保存する | UTW-020 |
| UTH-FR-022 | completion/review/green evidenceはcommand、argv digest、scope、HEAD、exit code、started/completed、artifact digest、runner identityを持ち、timestamp/prose/自己申告だけを受理しない | UTW-021 |
| UTH-FR-023 | 全source atom→disposition→requirement→design→test→gate→runtime evidenceをtyped edgeで結び、unclassified、duplicate owner、orphan、stale、aggregate-only coverageを0にする | UTW-014, UTW-024 |
| UTH-FR-024 | MCP/tool/plugin/workerはofficial source、version、license、integrity、権限、mount、network、credential、resource bound、smoke resultをprofile化し、未登録またはstale profileを起動拒否する | UTW-022 |
| UTH-FR-025 | backlog findingのstatusをobserved/triaged/designed/implemented/verified/closedへ機械遷移させ、実装・test・runtime evidenceなしのstatus昇格と「implemented」proseを拒否する | UTW-023, UTW-032 |
| UTH-FR-026 | agent loop、test、doctor、clone、DB、external toolへtime/token/process/disk/network budgetを設定し、budget到達を成功や完了へ変換せずcheckpointとreentryを残す | UTW-027 |
| UTH-FR-027 | source、consumer、distributionで同一artifact manifest、SBOM/license、digest、Node version、test profileを使い、signed tag/release provenanceなしのpublishとBun経由rollbackを拒否する | UTW-016, UTW-029 |
| UTH-FR-028 | 外部freshness確認をfail-openにする場合もchecked_at、source status、stale reason、decision impact、workflow rerouteをreceiptへ残し、古いcacheをterminal判断に使わない | UTW-030 |
| UTH-FR-029 | high-impact actionはactor/tool/target/params、snapshot、scope、allowed outcome、expiry/trigger、dry-run、rollback、auditへ束縛し、drift時にreapprovalを要求する | UTW-031 |
| UTH-FR-030 | self-improvementはfinding→repair→verification→before/after metric→recipe promotion→recurrence監視を閉じ、件数減少だけで効果を主張しない | UTW-032 |
| UTH-FR-031 | freeze checkpointはauthority epoch、artifact/trace/evidence digest、未完obligationを保存する。reopen時はimpact範囲を再計算し、影響pairのreverificationがgreenになるまで旧freezeを流用しない | UTW-033 |
| UTH-FR-032 | PLAN revisionはpreimage CAS、canonical command、admission、append-only journal、source/projection atomic publish、rollback/replay receiptを単一transaction sagaとして実行し、legacy cleanup provenanceも欠落させない | UTW-034 |
| UTH-FR-033 | specialist agent registryはrole/capability/model class/verification axis、definition digest、allowlist、sync sourceを単一正本化し、drift時は起動拒否して必要な検証teamをrouteする | UTW-035 |
| UTH-FR-034 | Stop境界のDB currency更新はhook budget内でdurable intentを残してdetached bounded workerへ渡し、spawn error、timeout、partial refreshを次回SessionStartでreconcileする | UTW-036 |
| UTH-FR-035 | Forwardからのescapeはreason、origin PLAN/revision、observed HEAD/state、scope、evidence、reentry targetを持つtyped Issueへ変換し、Issue admissionとReverse/fullbackなしに別routeへ逃がさない | UTW-037 |

## 3. 非機能要件

| ID | 要件 | acceptance threshold | source weakness |
|---|---|---|---|
| UTH-NFR-001 | 再現性 | clean Linux checkoutでcanonical test commandが追加env手作業なしに同じ分母・結果を返す | UTW-008 |
| UTH-NFR-002 | feedback latency | profileごとにbudgetを宣言し、超過checkをtiming evidenceから特定できる。timeout延長だけでcloseしない | UTW-009, UTW-027 |
| UTH-NFR-003 | 認識負荷 | current authorityのstartup read集合と注入budgetをboundedにし、archive/compatibilityを通常注入しない | UTW-025 |
| UTH-NFR-004 | 変更容易性 | check/CLI/projection moduleはregistryとtyped port経由で追加でき、monolith switchへの重複配線を要求しない | UTW-026 |
| UTH-NFR-005 | signal品質 | experimental warning、provider log、expected failureをstructured channelへ分離し、gate verdictとactionable errorを埋没させない | UTW-028 |

## 4. freeze条件

- `UTW-001..037`が少なくとも1つの`UTH-FR/NFR`へmapされ、orphan 0である。
- `UTH-FR-001..035`と`UTH-NFR-001..005`がL10 acceptanceへ1対1以上でpairされる。
- L1〜L12、6 pair、Production Scrum固定契約のdeltaが0である。
- active Bun authority、Bun fallback、Bun rollback、Bun test authorityが0である。
- 本書はPO承認までdraftとし、要件化を実装完了として扱わない。
