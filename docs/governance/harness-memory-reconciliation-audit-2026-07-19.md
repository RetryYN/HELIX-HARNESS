---
title: "harness memory 全件追突・retire監査"
status: confirmed
created: 2026-07-19
owner: Codex
---

# harness memory 全件追突・retire監査（2026-07-19）

## 1. 分母と判定規則

`helix memory list harness --json`を安全作業ツリーと共有元worktreeの双方で取得し、ID和集合 **38件**を分母とした。`project` layerは0件だった。本文、key、ID、provenanceを読み、次のいずれかへexactly oneで分類した。

- `canonicalized`: 要件、ADR、project rule、設計、監査、PLANへ内容が移管済み。
- `backfilled`: 本追突で要件またはproject ruleへ不足を追加した。
- `superseded`: 後続裁定・再監査が旧内容を反証し、後続正本を採用した。
- `historical`: 完了済み作業・過去時点state・tool運用教訓であり、要件へ昇格しない。

memoryをretireする条件は、正本targetが存在し、矛盾が解消され、未処置の要求がmemory本文だけに残っていないこととする。retireは無証跡の削除ではない。active SessionStart surfaceから本文を退役し、body-free lifecycle receiptだけを保持する。

## 2. 全38件の処置台帳

| # | memory key | 判定 | 正本／処置 |
|---:|---|---|---|
| 1 | `inventory-existing-first` | canonicalized | `AGENTS.md` HELIX再構築方針、旧HELIX inventory-first規則 |
| 2 | `web-research-recency` | backfilled | `AGENTS.md` External Source Research。現在日付、最新一次source、HELIX適合、処置記録を明文化 |
| 3 | `compiled-binary-rootpath-gotcha` | historical | commit `9f76cb7`で解消済み。Node cutover後の一般要件にはせず、repoRoot明示・artifact smokeの既存testへ委ねる |
| 4 | `rename-timing-decision` | canonicalized | `AGENTS.md`、PLAN-M-02、action-binding cutover境界 |
| 5 | `no-ask-and-defer` | canonicalized | `AGENTS.md` judgment-core／bias-to-action、deferはPLAN化 |
| 6 | `old-helix-source-repo` | superseded-partial | repo/inventory-firstは`AGENTS.md`へ保持。旧「TS/Bun再実装・Python禁止」はADR-010で廃止 |
| 7 | `background-notify-mechanism` | historical | nohup callback誤認のtool運用教訓。現runtimeのtracked session/wait契約を使い、product FRにはしない |
| 8 | `claude-standard-memory-retired` | canonicalized | `AGENTS.md` Session Start／Continuation。`.helix` memory・DBを横断正本とする |
| 9 | `constraint-first-philosophy` | canonicalized | requirements §5、judgment-core、gate/lint/hook/schemaのfail-close原則 |
| 10 | `l6-descent-mandatory` | canonicalized | plan-descent gate、L5/L6→L7 pair規律、requirements §2 |
| 11 | `hybrid-same-plan-collab` | canonicalized | `AGENTS.md` Git Rules。foreign work、staged diff、transient tree、番号再確認 |
| 12 | `judgment-core-ssot` | canonicalized | `docs/skills/judgment-core.md`と`AGENTS.md`判断コア |
| 13 | `old-helix-migration-closed` | historical | migration completion auditとlegacy-adoption tests。旧repoはread-only source |
| 14 | `improvement-plans-2026-07-06-closed` | historical | PLAN-L7-340/341、ADR-008 confirmed。再起票しない |
| 15 | `upstream-uttdd-reconciliation` | canonicalized | `upstream-uttdd-reconciliation-audit-2026-07-04.md`、handover退役監査 |
| 16 | `decide-record-proceed` | canonicalized | judgment-coreと`AGENTS.md` TL Driven Mode。L1/L2、gate signoff、不可逆だけをPO境界とする |
| 17 | `codex-0144-hook-trust-gating` | backfilled | `AGENTS.md`を0.144+ SubagentStop、canonical matcher、`trusted_hash`更新、silent skip拒否へ訂正 |
| 18 | `github-autonomous-ops-default` | backfilled | `CLAUDE.md`旧requested-only行を自走push/PR/CI/self-healへ訂正。requirements §6、GH-FR-001..016 |
| 19 | `helix-not-ut-harness` | canonicalized | `AGENTS.md`／charter／requirementsの正式名称HELIX。UTは参考土台のみ |
| 20 | `upstream-is-po-own-work` | historical | 直系系譜として監査sourceへ保持。license免除を一般product requirementにはしない |
| 21 | `codex-assignment-l6-61-retirement-slice` | historical | commit `e5928191`、PLAN-L6-61／REVERSE-344完了。再実行しない |
| 22 | `handover-retirement-direction` | canonicalized | DB/memory continuation正本、handover retirement監査 |
| 23 | `orchestration-runtime-bridge-gap` | historical | runtime bridge、loop projection、provider mismatch gate実装済み。PLAN-L7-307とは分離 |
| 24 | `helix-build-state` | superseded | 2026-07-12の90%／PR #2時点state。現在地はharness.dbを再計算し、このsnapshotを使わない |
| 25 | `closure-selfdrive-po-decision` | backfilled | requirements `HR-FR-HYB-001`。typed evidence充足時だけ自走し、不可逆・未完了・generic evidenceを拒否 |
| 26 | `hybrid-docgen-engine-audit-2026-07-14` | canonicalized | vmodel adoption matrix §9とdesign harness assessment audit。SessionStart原因は未確定としてNFRへ分離 |
| 27 | `hybrid-docgen-gap-followup-for-codex` | superseded | metadata／semantic diffはruntime実装済み。旧TS/Bun再実装指示はADR-010で廃止。残Design HARNESSは`HR-FR-DHR-*`へ再定義 |
| 28 | `system-audit-2026-07-14-goal` | canonicalized | UTF-8誤検知は`src/schema/design-declarations.ts`＋test、parent実在性は`src/plan/lint.ts`＋testで解消。SessionStartは未再現NFRとして扱う |
| 29 | `adr-010-runtime-authority-ruling` | backfilled | ADR-010、requirements §8、`AGENTS.md`に加え`.claude/CLAUDE.md`のproposal-only残存を訂正 |
| 30 | `v051-remediation-complete-for-codex` | superseded | 30件／206 filesの誤claim。後続2 memoryと再監査が反証 |
| 31 | `v051-completion-claim-correction` | canonicalized | `hybrid-rebaseline-v0.5.1-verification-audit-2026-07-18.md`のFAIL→是正履歴 |
| 32 | `v051-final-reverification` | canonicalized | digest `1e14a857…`、211/209、REQ169/AC119/edge347の最終PASS |
| 33 | `hybrid-engine-requirements-extraction-gaps` | backfilled | requirements `HR-FR-HYB-001..010`でG-01〜G-10を全件ID化 |
| 34 | `nfr-consolidation-improvement-audit` | backfilled | requirements `HR-NFR-REG-001..007`。測定契約、DB性能、fault/race/soak、時系列を正本化 |
| 35 | `design-harness-status` | backfilled | requirements `HR-FR-DHR-001..006`。実装済み文書系と設計段階screen/refactor系を分離 |
| 36 | `requirements-consistency-audit` | backfilled | ADR-010／L1〜L12はrequirements v1.3とproject rulesへ反映。collision宣言driftは0。残trace課題は本台帳と各監査へ保持 |
| 37 | `authoring-admission-directive` | backfilled | requirements `HIL-BR-26`、`HIL-FR-51..53`、`HIL-NFR-30..32`へ正式採用 |
| 38 | `l12-canonical-vmodel-direction` | canonicalized | requirements §1〜2／§9とL12 direction directive。L0は層外anchor、releaseはL11↔L12 milestone |

## 3. 追突後の不変条件

1. memoryだけに存在する現行PO裁定・要件・未処置gapは0件。
2. stale／反証済みmemoryは後続SessionStartでactive表示しない。
3. consume後も本台帳、要件、ADR、PLAN、event historyから判断理由を再構築できる。
4. runtime未実装のDesign HARNESS、Authoring Admission、NFR registryを実装済みと誤表示しない。
5. closure自走権限を、未完了PLANをgeneric green commandで閉じる権限へ拡張しない。
6. root worktreeと安全作業ツリーのactive ID和集合を再取得し、0件になるまで完了扱いにしない。

## 4. retire実行証跡

2026-07-19にconsumer `requirements-reconciliation-2026-07-19`で処置した。

- 安全作業ツリー: 初期active 37件。35件を`consumed` receiptへ変換し、v2 UTC schemaに違反していた後続監査2件は、本台帳へ本文を保存した後にcompactionでdamaged payloadを除去した。
- 共有元root worktree: 初期active 36件。root固有の`system-audit-2026-07-14-goal`を含む36件をreceiptへ変換した。
- 分岐間の和集合: 38件すべてが本台帳の行1〜38にexactly oneで存在する。
- 最終観測: 両worktreeともlegacy `memory list harness`は0件、v2 `selectedIds`は0件、`damaged`は0件。
- 永続不変条件: `helix memory retire harness <ids...> --consumer <id>`はfencedかつidempotentとし、legacy readerもv2 terminal receiptをactive memoryとして再表示しない。
