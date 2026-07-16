---
title: "HELIX L3要件 — ZIP L1-L12 canonical authority cutover"
layer: L3
kind: add-design
status: confirmed
created: 2026-07-13
updated: 2026-07-16
owner: Codex / TL
plan: PLAN-L3-14-vmodel-canonical-authority-cutover
authority_kind: canonical-supersession
authority_epoch: vmodel-l1-l12-v1
authority_scope: requirement-and-design-authoring
design_authority_state: pending-receipt
authority_activation_status: pending-po-approval
runtime_cutover_state: pending
active_runtime_compatibility: legacy-l0-l14
requirements_authority_freeze_blocking: true
implementation_preflight_blocking: true
runtime_cutover_blocking: true
authority_receipt: docs/governance/vmodel-authority-receipt-v1.md
runtime_authority: docs/adr/ADR-009-node-python-linux-runtime.md
supersedes_scope:
  - concept-v3.1-vmodel-layer-numbering
  - requirements-v1.2-vmodel-layer-numbering
  - scrum-equals-poc-only
  - implementation-at-legacy-l7
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
related_l3: docs/design/helix/L3-requirements/vmodel-docgen-fit.md
related_l12: docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md
pair_artifact: docs/test-design/helix/vmodel-canonical-authority-cutover-acceptance.md
spec:
  defines:
    - { id: HR-FR-VMCUT-01, kind: 正本権限, title: canonical authority precedence, layer: L3, owner: TL, status: confirmed }
    - { id: HR-FR-VMCUT-02, kind: 層移行, title: L0-L14 to L1-L12 exact remap, layer: L3, owner: TL, status: confirmed }
    - { id: HR-FR-VMCUT-03, kind: 成果物移行, title: independent L6 transition, layer: L3, owner: TL, status: confirmed }
    - { id: HR-FR-VMCUT-04, kind: 互換性, title: compatibility window and rollback, layer: L3, owner: TL, status: confirmed }
    - { id: HR-FR-VMCUT-05, kind: 検出, title: authority drift fail-close gate, layer: L3, owner: QA, status: confirmed }
---

# HELIX L3要件 — ZIP L1-L12 canonical authority cutover

> Authority Banner — `vmodel-l1-l12-v1`
> 本文はauthoring authority候補であり、`VMAUTH-2026-07-16-01`承認前はpendingである。承認後も現行L0–L14 schemaは
> runtime compatibilityであり、implementation preflightとruntime cutoverをgreenにしない。

## §0 判断

### §0.1 適用・非適用

- `VMAUTH-2026-07-16-01`承認後の新規要求、設計、template、generator、pair意味のauthoring authorityは本書のL1–L12とする。
  承認前はcandidateであり、旧L0–L14へ戻して新規freezeすることも禁止する。
- schema、CLI、path、DB、hookのactive executionはterminal cutover receiptまでlegacy L0–L14 compatibilityを維持する。
  design authority activeをruntime cutover完了へ読み替えない。
- L1企画からL2要求・画面/flow/prototypeを作り、walkthrough反映または構造化no-UI skip後だけL3をfreezeする。
- L5で詳細設計とtest design/acceptance oracleを先にfreezeし、L7 artifact familyへRed evidenceを記録してから
  L6 Green実装へ入る。L7はtest implementation、refactor、trace/TDD closureであり、test designの初出層ではない。
- Scrumはproduct backlog/sprint/BDDの横軸overlayで、各production vertical sliceが該当範囲の縮約Vを完走する。
  PoC `S0–S4`はDiscovery/spike routeであり、production Scrum全体の定義ではない。
- authority driftをviewやcompat projectionだけで補正せず、Core Readsとauthoring sourceが同じepochを指すまで
  requirements freezeをfail-closeする。

### HR-FR-VMCUT-01 正本権限

移行後のauthorityは次の順とする。

1. PO承認済みのrepo-owned L0/L1判断と本L3 freeze。
2. ZIPから抽出・hardeningしたrepo-owned Markdown設計、typed declaration、L1-L12 catalog。
3. `harness.db` projectionとread-only view。
4. pinned ZIP archiveはupstream source evidenceであり、runtimeが直接読む可変正本にはしない。
5. legacy L0-L14 pathは期限付きcompatibility inputであり、新規設計のcanonical outputにはしない。

これにより「ZIPを正本とする」と「archiveをruntime stateにしない」を両立する。ZIPの設計意味を上位に置き、
実行可能な正本はreview可能なrepo-owned抽出物へ固定する。

## §1 層の完全対応

### HR-FR-VMCUT-02 L0-L14からL1-L12へのexact remap

| 現行 | canonical | 移行判断 |
|---|---|---|
| L0 charter | L1 企画 | charterの意味を失わず企画層へ投影 |
| L1要求 / L2 screen-mock | L2 要求・画面・flow | 要求抽出cycleとして統合 |
| L3 | L3 要件freeze | typed FR/ACを必須化 |
| L4 | L4 基本設計 | 維持 |
| L5 + 旧独立L6機能設計 | L5 詳細設計+test contract | 必要契約を吸収し、重い独立成果物を新規生成しない |
| L7 implementation | L6 実装 | source bindingをtyped宣言へ接続 |
| L8-L12 test-design/verification | L7-L11 TDD・単体・結合・総合・受入 | VペアIDを保持して再投影 |
| L13/L14 operation/release | L12 運用テスト・release | runtime evidenceとpost-release verificationを維持 |

既存artifactは一括renameしない。`legacy_layer`と`canonical_layer`の両方をprojectionし、compat期限までは旧入力を
受理するが、新規generator/PLAN/templateはcanonical layerだけを出力する。

#### token単位remap

| legacy token | canonical token | semantic disposition | （日本語の機械契約記述）
|---|---|---|
| L0 | L1 | charter/価値/scopeを企画へ投影 |
| L1 | L2 | business要求を要求探索へ投影 |
| L2 | L2 | screen/mock/flow/prototypeを要求探索へ統合 |
| L3 | L3 | FR/AC freezeを維持 |
| L4 | L4 | 基本設計を維持 |
| L5 | L5 | 詳細設計を維持 |
| L6 | L5 | 旧独立機能設計を詳細設計へ吸収 |
| L7 | L6 | product code/implementationを実装へ投影 |
| L8 | L7 | test implementation/Red/refactor/trace closureへ投影 |
| L9 | L8 | 単体検証へ投影 |
| L10 | L9 | 結合検証へ投影 |
| L11 | L10 | 総合検証へ投影 |
| L12 | L11 | 受入検証へ投影 |
| L13 | L12 | deploy/post-deploy evidenceを運用・価値へ統合 |
| L14 | L12 | operation/value evidenceを運用・価値へ統合 |
| cross | cross | layer横断型として維持し、layer completenessへ算入しない |

正規V-pairは`L1↔L12`、`L2↔L11`、`L3↔L10`、`L4↔L9`、`L5↔L8`、`L6↔L7`の6組である。
range集約や算術offsetだけをremap証拠にせず、各legacy tokenは上表の一意なcanonical tokenへ解決する。

### HR-FR-VMCUT-03 独立L6成果物の移行

旧L6の契約はcanonical L5へ吸収し、新規の独立L6設計成果物を生成しない。既存成果物は移行完了まで
compatibility inputとして追跡し、削除や改名を一括実行しない。

## §2 切替の不変条件

### HR-FR-VMCUT-04 compatibility windowとrollback

- Core Reads、AGENTS/CLAUDE、schema enum、PLAN lint、pair gate、current-location、DB、VSCode、consumer templateの
  authority markerが同じcutover epochを指す。
- 独立旧L6を新規生成した場合、またはZIP archiveをruntime stateとして直接参照した場合はfail-closeする。
- viewはcanonical値を作らずDB projectionだけを描画する。
- compatibility inputを削除する前に利用件数0、rollback rehearsal、snapshot bindingを記録する。
- `.helix`/CLI identifier migrationとは分離し、PLAN-M-02の承認境界を越えない。

### HR-FR-VMCUT-05 authority driftのfail-close検出

Core Reads、typed declaration、catalog、projection、templateのcutover epochまたはlayer mappingが一致しない場合は
terminal claimを拒否する。検出結果をviewだけで補正せず、authoring sourceへ戻して是正する。

## §3 後続分割

- L4: 正本権限と切替architecture、epoch、consumer surface matrixを定義する。
- L5: schema/DB remap、compat parser、rollback詳細設計。
- L6: canonical binding contract。
- L7: migration implementation、detector、template/view更新。
- L8-L12: unit/integration/system/acceptance/operationの各検証を定義する。
