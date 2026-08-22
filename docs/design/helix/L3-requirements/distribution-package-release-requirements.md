---
title: "multi-project配布packageと段階release L3要件"
layer: L3
artifact_type: design
status: draft
created: 2026-08-14
updated: 2026-08-22
owner: Codex / TL
plan: docs/plans/PLAN-L3-65-distribution-repository-devos-authority.md
pair_artifact: docs/test-design/helix/distribution-package-release-system-test-design.md
---

# multi-project配布packageと段階release L3要件

## 1. authority

要件正本は`docs/governance/helix-harness-requirements_v1.3.md` §4.6.1の`HR-FR-HYB-008`と
`HR-AC-HYB-008-01..09`である。本書のrevision 3はrequirements v1.3.13とcanonical Requirement IR
refinementとして`HELIX-HARNESS-LITE`／`consumer_core_v1`の配布先を`HELIX-HARNESS-DevOS`へ更新する。L3↔L10 pairと
下位設計への入口を固定し、別製品authorityを追加しない。

## 2. system境界

- 入力: development source HEAD、requirements digest、package version、versioned capability allowlist、consumer profile。
- 出力: immutable artifact、manifest、consumer smoke evidence、promotion／rollback plan、approval-bound remote action。
- authority: development repository。distribution repositoryやgenerated artifactを逆向き正本にしない。
- consumer: clean／既存／monorepo project。HELIX-HARNESS自身のdogfood stateをconsumerへ持ち込まない。
- transaction: local plan／build／dry-runは可逆。safe release standing authorizationへ完全一致する既定配布先の
  canary／preview／stableは自走可能。policy外target、repository切替、identifier／state cutoverはaction-binding approval対象。

### 2.1 初期consumer profile

- display name: `HELIX-HARNESS-LITE`
- profile ID: `consumer_core_v1`
- source authority: development repository `HELIX-HARNESS`のみ
- distribution repository: `RetryYN/HELIX-HARNESS-DevOS`
- generation: typed capability allowlistからのdeterministic projection
- promotion: Full HELIXでconsumer-safe終端済みcapabilityだけをversioned receiptで昇格
- prohibition: Lite fork、独自仕様、手編集allowlist、development state混入、除外capabilityの到達可能surface

初期allowlist capabilityは次のexact setとする。

- L1-L12正規Vモデル、PLAN／Issue／branchのauthority契約。
- typed workflow identity、legacy input-only隔離。
- CI、doctor、lint、mutationの反証oracle。
- schema／templateだけのDB projection、replay、checkpoint。developmentのDB実データは含めない。
- setup project、status、completion decision packet、review bundle、consumer doctor、基本CLI。
- exact-HEAD independent review、GitHub contract、Codex／Claude hookのconsumer integration profile。

初期profileは#188 switching／routing／allocation、#819 resident multi-runtime lane、lane supervisor、Grok／Cursor
resident lane、provider自動fallback、multi-HEAD resident runtime、未終端security broker、development固有PLAN／memory／
`harness.db`実データ／receipt／credential／absolute pathを含めない。除外capabilityはartifact fileだけでなくCLI help、
setup、schema、doctor、generated docsからも到達不能でなければならない。

Full HELIXでconsumer-safe acceptanceが終端したcapabilityだけをversioned promotion receiptによりprofile manifestへ
昇格できる。Lite独自仕様、Lite側からFullへの逆流、手編集によるallowlist追加、除外capabilityの推測fallbackを禁止する。

### 2.2 安全な段階releaseのstanding authorization

`RetryYN/HELIX-HARNESS-DevOS`だけをtargetとするcanary／preview／stableは、source HEAD、requirements refinement／
profile／artifact digest、exact-HEAD review、Linux／Windows smoke、credential target authority、rollback rehearsalの
monitoring window、expiryを束縛したstanding authorization receiptが一致する場合に限り追加承認なしで自走できる。
target／params／artifact drift、stage skip、credential authority不一致、policy期限切れはfail-closeする。repository切替、
identifier／state cutover、policy外target、consumer data破壊を伴う操作はaction-binding approval境界へ残す。

## 2.3 Requirement IR詳細化条項

#### DIST-LITE-R-01 profile identityとauthority

初期consumer distributionは表示名`HELIX-HARNESS-LITE`、machine profile ID`consumer_core_v1`とし、
HELIX-HARNESSだけをsource authority、`RetryYN/HELIX-HARNESS-DevOS`を配布先とする。Liteをfork、独立製品、
逆向きrequirements authorityとして扱わない。旧`RetryYN/HELIX-HARNESS-OS`はcompatibility inputに限り、
current output、receipt、tag pinへ再投影しない。

#### DIST-LITE-R-02 typed allowlistと除外

profileはtyped capability IDのversioned allowlistから決定的に生成する。初期exact setと除外exact setを
file、CLI help、setup、schema、doctor、generated docsの全surfaceで強制し、path一致やfallbackで未終端capabilityを
含めない。

#### DIST-LITE-R-03 artifact identityとpromotion

同一source HEAD、requirements refinement digest、profile version／digest、package versionのbuildは同一artifact
digestを返す。canary、preview、stableは同じartifactを一方向promotionし、rebuild差替え、stage skip、手編集manifestを
拒否する。

#### DIST-LITE-R-04 consumer verificationとrollback

clean Linux fresh processでinstall、build、setup、status、consumer doctor、minimal workflow、CI、completion evidenceを
再現し、Windowsは同一Node artifactを検証する。upgrade、rollback、uninstallはconsumer所有bytesとconsumer evidenceを
保全する。

#### DIST-LITE-R-05 境界付きrelease authorization

既定配布先、HEAD、profile、artifact、review、Linux／Windows smoke、credential target、rollback、monitoring、expiryが
standing authorization receiptへ完全一致するsafe staged releaseだけを追加承認なしで実行する。policy外target、
repository切替、identifier／state cutover、consumer data破壊はaction-binding approvalへ停止する。

## 3. 要件trace

| 要件 | system責務 | L10 oracle |
|---|---|---|
| `HR-AC-HYB-008-01` | profile／manifest exact setとsource／requirements／profile／artifact／version binding | `ST-DIST-001` |
| `HR-AC-HYB-008-02` | dogfood／state／secret／PII／absolute path除外 | `ST-DIST-002` |
| `HR-AC-HYB-008-03` | clean／既存／monorepoへの非破壊idempotent setup | `ST-DIST-003` |
| `HR-AC-HYB-008-04` | README／LICENSE／attribution／provenance／免責 | `ST-DIST-004` |
| `HR-AC-HYB-008-05` | `consumer_core_v1` clean Linux consumerでのfull smoke | `ST-DIST-005` |
| `HR-AC-HYB-008-06` | 同一Node artifactのWindows compatibility smoke | `ST-DIST-006` |
| `HR-AC-HYB-008-07` | canary→preview→stable同一artifact promotion | `ST-DIST-007` |
| `HR-AC-HYB-008-08` | consumer成果を保全するengine pin rollback | `ST-DIST-008` |
| `HR-AC-HYB-008-09` | safe release standing authorizationとpolicy外action-binding approval | `ST-DIST-009` |

## 4. 非目標

本L3 sliceではartifact builder、setup implementation、remote sync、tag、release、promotion、cutoverを実行しない。
旧HELIXのPython／Bash runtime、Bun、dogfood assetをbulk importしない。
