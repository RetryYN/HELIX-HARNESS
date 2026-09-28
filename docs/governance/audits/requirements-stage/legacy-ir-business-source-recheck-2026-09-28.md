# IR153 W1業務要件33件の旧source→現行要求再照合

## 固定範囲・方法

- 監査基準HEAD: main `559ae3ba4bfe660d666a57f227466d7dcdd440d9`（#2231〜#2233反映後の現行本文。対象文書ごとのSHA-256を以下に固定）。
- 旧企画原文: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md`, file SHA-256 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`。BR-01〜33はL1表の各行53〜85。各行SHAは各IDの節に記載。
- 旧IR: `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-01..33`, SHA-256 `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。IR source pointer/identityはL1各行のrecordを照合する鍵であり、lineage/意味同値を新たに生成しない。
- 基準時の状態mapping `85cee189...` と旧 `semantic_residual` labelは証拠候補として再読し、現在の本文・PO判断記録・後発候補で更新した。IR `formal_successor_assignment` は全33件未割当のまま。候補対応はsuccessor登録ではない。
- 2026-09-28 PO判断記録は固定L1/L2/L11 revisionと各明示候補集合に適用する。追加ID `OS-030/032/033/034/035`, `INTELLIGENCE-072`, `LABO-063/061/064`, `HARNESS-038` などは決定明示集合外なら未採択候補。候補register `authority_effect:none` やPR mergeから採択を生成しない。
- 現行L11は要求段階の受入oracleとして読み、L11実行は主張しない。現行対象文書と本監査基準時のSHA-256:

  - `docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md` — `a60e2c9c5b9d0828acdf4348e5cabbf7f3c032ec5d33b628f3d9e2bf305176de`
  - `docs/governance/decisions/handoff-integration-po-decisions-2026-09-26.md` — `3f12d5a53b05dc478cc7138e362730d38c6aa835079b41b6124cb569f0fc6b9d`
  - `docs/governance/decisions/mechanism-placement-po-decisions-2026-09-25.md` — `d2bd02399212b3912825203a9c9037060332a2b1d48a942197bc9cd53536b2cb`
  - `docs/governance/github-upstream-operating-model.md` — `1cb8ed88d4f0e65b37674f692d5fe391c7c5c4b3f482e60c86e160609a8c46a1`
  - `docs/helix-brain/L11-acceptance/brain-acceptance.md` — `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`
  - `docs/helix-brain/L2-requirements/brain-requirements.md` — `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`
  - `docs/helix-harness/L11-acceptance/product-acceptance.md` — `6262609e08a80b493d14cbbd9205befaff61e8046bc567128b37445f2b825974`
  - `docs/helix-harness/L2-requirements/product-requirements.md` — `1e4e5b9be4258bfe5e3ab6a4c6911a7cab380617a01d50fa5ac5472adb849c99`
  - `docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md` — `f70b7b996d79c432ac4771fd58e2819e1619abfbedd96d145d38f31e21142630`
  - `docs/helix-intelligence/L2-requirements/intelligence-requirements.md` — `39e31f6a18385c8ca37f57fcaac4076d55c5fba2c49f47eadbaf48be5ef48d6d`
  - `docs/helix-labo/L11-acceptance/labo-acceptance.md` — `119fa43bce6753bdb0fed5420641617b9665907a7b1c3b2e6def590098e7442d`
  - `docs/helix-labo/L2-requirements/labo-requirements.md` — `c34b87dde7c94eecb7d4aa83146cf2f3de1b50c278bd0e99cbf9e96a01145f71`
  - `docs/helix-os/L11-acceptance/governance-acceptance.md` — `86b7949cf7700300588e8dc2ccb4448e31111223d2f1cace81109533452d551e`
  - `docs/helix-os/L2-requirements/governance-requirements.md` — `db2b119daa7fbc47b79b1652beba72149fb0d6969af7bb400c1650d77464f2b5`
  - `docs/helix-security/L11-acceptance/security-acceptance.md` — `a931c77c099d2fe9dcef184da6c0427db35653308c21d0ac90b6210c02dc4ef5`
  - `docs/helix-security/L2-requirements/security-requirements.md` — `286385d4e59ea69667c095a0a483338d8fb8786c7c7ec2c381c127775b8435ca`

## 33 identityごとの照合

各identityの現行L2参照と対L11受入行位置はmain `5c79869`の実ファイル行。以下の要旨は単語一致ではなく、条件・scope・失敗時やunknown時のoracleを読んだ照合結果である。

### HIL-BR-01

- **旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:53`; asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; line SHA-256 `45b0c35f91386b8060b6e15a12a23b57416a40687a3aed5debbbe1118911f0c1`; IR `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-01` (IR SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`).
- **旧条件**: Codex自動走行とClaude Code監査を、PRとharness.db eventで交互に接続し、人のL3承認後は不可逆境界以外を無人完走する。
- **現行L2照合先ID**: HARNESS-L2-001, HARNESS-L2-002, HARNESS-L2-003, HARNESS-L2-004, HARNESS-L2-005, HARNESS-L2-008, HARNESS-L2-009, HELIXOS-L2-004, HELIXOS-L2-007, HELIXOS-L2-009, HELIXOS-L2-010。これは照合先でありIRの正式successor割当てではない。
- **現行L2条件**:
  - `docs/helix-harness/L2-requirements/product-requirements.md:72-76,98-105,112` — 人間の要件判断、工程/検証、ticket起点の作成と独立review、継続記録はHARNESS/OSの条件付きworkflowと役割分担へ再導出。旧harness.dbは現行証拠正本として引き継がれない。全不可逆境界外を無人完走させる一般保証ではなく、操作ごとのscopeで動かす。
  - `docs/helix-os/L2-requirements/governance-requirements.md:57,62,74-87,187-205,662-690` — 人間の要件判断、工程/検証、ticket起点の作成と独立review、継続記録はHARNESS/OSの条件付きworkflowと役割分担へ再導出。旧harness.dbは現行証拠正本として引き継がれない。全不可逆境界外を無人完走させる一般保証ではなく、操作ごとのscopeで動かす。
- **現行L11**: `docs/helix-harness/L11-acceptance/product-acceptance.md:21` (HARNESS-L2-001), `docs/helix-harness/L11-acceptance/product-acceptance.md:22` (HARNESS-L2-002), `docs/helix-harness/L11-acceptance/product-acceptance.md:23` (HARNESS-L2-003), `docs/helix-harness/L11-acceptance/product-acceptance.md:24` (HARNESS-L2-004), `docs/helix-harness/L11-acceptance/product-acceptance.md:25` (HARNESS-L2-005), `docs/helix-harness/L11-acceptance/product-acceptance.md:28` (HARNESS-L2-008), `docs/helix-harness/L11-acceptance/product-acceptance.md:29` (HARNESS-L2-009), `docs/helix-os/L11-acceptance/governance-acceptance.md:24` (HELIXOS-L2-004), `docs/helix-os/L11-acceptance/governance-acceptance.md:414` (HELIXOS-L2-004), `docs/helix-os/L11-acceptance/governance-acceptance.md:27` (HELIXOS-L2-007), `docs/helix-os/L11-acceptance/governance-acceptance.md:417` (HELIXOS-L2-007), `docs/helix-os/L11-acceptance/governance-acceptance.md:29` (HELIXOS-L2-009), `docs/helix-os/L11-acceptance/governance-acceptance.md:419` (HELIXOS-L2-009), `docs/helix-os/L11-acceptance/governance-acceptance.md:30` (HELIXOS-L2-010), `docs/helix-os/L11-acceptance/governance-acceptance.md:420` (HELIXOS-L2-010)
- **版と処置**: HARNESS-L2-001: 個別本文に明示なし; HARNESS-L2-002: 個別本文に明示なし; HARNESS-L2-003: 個別本文に明示なし; HARNESS-L2-004: 個別本文に明示なし; HARNESS-L2-005: 個別本文に明示なし; HARNESS-L2-008: 個別本文に明示なし; HARNESS-L2-009: 個別本文に明示なし; HELIXOS-L2-004: 個別本文に明示なし; HELIXOS-L2-007: 個別本文に明示なし; HELIXOS-L2-009: 個別本文に明示なし; HELIXOS-L2-010: 個別本文に明示なし
- **再照合結論**: 人間の要件判断、工程/検証、ticket起点の作成と独立review、継続記録はHARNESS/OSの条件付きworkflowと役割分担へ再導出。旧harness.dbは現行証拠正本として引き継がれない。全不可逆境界外を無人完走させる一般保証ではなく、操作ごとのscopeで動かす。
- **PO判断・採択状態**: 2026-09-28 PO固定revisionのL2/L11本文に照合。該当する明示候補はPO判断の対象範囲内なら採択済み、ただしIRの正式successor割当て・実行受入は未了。追加候補や本文に未採択表示がある場合は下記の対象別処置を優先する。
- **状態の区別**: 正式successor `未割当`、受入実行 `本照合では実行評価せず、結果を主張しない`。これは意味欠落、PO採択、L3・実装完了とは別状態である。

### HIL-BR-02

- **旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:54`; asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; line SHA-256 `efbb1519b99cd0994be2ac840e6efd3f9e5706e131472ca4ac67e3ec78b013fa`; IR `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-02` (IR SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`).
- **旧条件**: Claude Code拡張hookはCodexのPR作成/更新/完了を検出し、監査jobを冪等生成する。全base branchのPRを対象とし、stacked PRを除外しない。
- **現行L2照合先ID**: HELIXOS-L2-007, HELIXOS-L2-009, HELIXOS-L2-010, HELIXOS-L2-035。これは照合先でありIRの正式successor割当てではない。
- **現行L2条件**:
  - `docs/helix-os/L2-requirements/governance-requirements.md:62,74-87,187-205` — 旧hookが全base branchのPR create/update/completeを捕捉し、audit jobを冪等生成する契約は、現在のGUIでの明示review request/responseや一般event projectionの記述からは導けない。旧hookは非採用。全対象PR listenerとaudit jobの現行owner/版/受入は不明であり、対応済みとしない。
- **現行L11**: `docs/helix-os/L11-acceptance/governance-acceptance.md:27` (HELIXOS-L2-007), `docs/helix-os/L11-acceptance/governance-acceptance.md:417` (HELIXOS-L2-007), `docs/helix-os/L11-acceptance/governance-acceptance.md:29` (HELIXOS-L2-009), `docs/helix-os/L11-acceptance/governance-acceptance.md:419` (HELIXOS-L2-009), `docs/helix-os/L11-acceptance/governance-acceptance.md:30` (HELIXOS-L2-010), `docs/helix-os/L11-acceptance/governance-acceptance.md:420` (HELIXOS-L2-010), `docs/helix-os/L11-acceptance/governance-acceptance.md:581` (HELIXOS-L2-035)
- **版と処置**: HELIXOS-L2-035は現行L2/L11本文でversion_target: 1.0の未採択OS単体候補。既存HELIXOS-L2-007/009/010の個別本文にはversion_target印は明示されず、その記載から版を推定しない。
- **再照合結論**: OS-L2-035/L11-035は旧BR02の全base/stackedを含むPR lifecycle event intakeと冪等audit job要求生成を選択project scope内に具体化する。これは1.0未採択候補で、既存GUI review route・旧hookとは区別する。
- **PO判断・採択状態**: 2026-09-28確定対象のOS-007/009/010は採択済みだが、全PR lifecycle捕捉は別能力。後発HELIXOS-L2-035/L11-035（1.0、未採択）が選択project scopeのイベント取込・冪等job要求を部分具体化する。IRの正式successor割当て・実行受入は未了。
- **状態の区別**: 正式successor `未割当`、受入実行 `未実行・結果を主張しない`。これは意味欠落、PO採択、L3・実装完了とは別状態である。

### HIL-BR-03

- **旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:55`; asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; line SHA-256 `fe2e8f8d73b09e2000548f6189fffdc9a3c16d3be80309153b8c1c80c57d7fa2`; IR `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-03` (IR SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`).
- **旧条件**: Claude CodeはCodex完了時にraw実行ログ、PR、test/CI、監査所見を圧縮し、永続知識だけをharness memoryへ昇格する。進捗はDB continuationへ残しmemoryへ混載しない。
- **現行L2照合先ID**: HELIXOS-L2-001, HELIXOS-L2-004, HELIXOS-L2-005, HELIXOS-L2-007, HELIXOS-L2-009。これは照合先でありIRの正式successor割当てではない。
- **現行L2条件**:
  - `docs/helix-os/L2-requirements/governance-requirements.md:60,62,295-300,351-370` — 進捗とsource evidenceはOS、知識は1.0〜2.xでLABO、3.0以降でINTELLIGENCE、規則は機構正本へ分離（PO 2026-09-24）。旧harness memory/DBを再採用しない。圧縮summary生成・その入力範囲は現行契約に明示されず未照合。
- **現行L11**: `docs/helix-os/L11-acceptance/governance-acceptance.md:21` (HELIXOS-L2-001), `docs/helix-os/L11-acceptance/governance-acceptance.md:411` (HELIXOS-L2-001), `docs/helix-os/L11-acceptance/governance-acceptance.md:24` (HELIXOS-L2-004), `docs/helix-os/L11-acceptance/governance-acceptance.md:414` (HELIXOS-L2-004), `docs/helix-os/L11-acceptance/governance-acceptance.md:25` (HELIXOS-L2-005), `docs/helix-os/L11-acceptance/governance-acceptance.md:415` (HELIXOS-L2-005), `docs/helix-os/L11-acceptance/governance-acceptance.md:27` (HELIXOS-L2-007), `docs/helix-os/L11-acceptance/governance-acceptance.md:417` (HELIXOS-L2-007), `docs/helix-os/L11-acceptance/governance-acceptance.md:29` (HELIXOS-L2-009), `docs/helix-os/L11-acceptance/governance-acceptance.md:419` (HELIXOS-L2-009)
- **版と処置**: HELIXOS-L2-001: 個別本文に明示なし; HELIXOS-L2-004: 個別本文に明示なし; HELIXOS-L2-005: 個別本文に明示なし; HELIXOS-L2-007: 個別本文に明示なし; HELIXOS-L2-009: 個別本文に明示なし
- **再照合結論**: 進捗とsource evidenceはOS、知識は1.0〜2.xでLABO、3.0以降でINTELLIGENCE、規則は機構正本へ分離（PO 2026-09-24）。旧harness memory/DBを再採用しない。圧縮summary生成・その入力範囲は現行契約に明示されず未照合。
- **PO判断・採択状態**: 2026-09-28 PO固定revisionのL2/L11本文に照合。該当する明示候補はPO判断の対象範囲内なら採択済み、ただしIRの正式successor割当て・実行受入は未了。追加候補や本文に未採択表示がある場合は下記の対象別処置を優先する。
- **状態の区別**: 正式successor `未割当`、受入実行 `本照合では実行評価せず、結果を主張しない`。これは意味欠落、PO採択、L3・実装完了とは別状態である。

### HIL-BR-04

- **旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:56`; asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; line SHA-256 `05f22df554f2f1a0d88ed2c1b5fb421742d7c878311be64b4ed4e3c1c801295c`; IR `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-04` (IR SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`).
- **旧条件**: 全Issueはdevelopment style、case-driven activation、specialist capability、runtime modeを別fieldで持つ。Reverse R0–R4が適用されるIssueでは実装前の先行taskとし、省略値を持たない。
- **現行L2照合先ID**: HARNESS-L2-002, HARNESS-L2-003, HELIXOS-L2-004, HELIXOS-L2-010。これは照合先でありIRの正式successor割当てではない。
- **現行L2条件**:
  - `docs/helix-harness/L2-requirements/product-requirements.md:98-105,110-112` — style、case trigger、ticket kind、Reverse routeは現行条件付き工程にある。旧R0-R4とspecialist/runtimeの4 field名は同一形でない。現在のstyle/work kind/change kind/risk/surface/worker情報を一対一の後継fieldとは断定しない。
  - `docs/helix-os/L2-requirements/governance-requirements.md:57,129-149,662-680` — style、case trigger、ticket kind、Reverse routeは現行条件付き工程にある。旧R0-R4とspecialist/runtimeの4 field名は同一形でない。現在のstyle/work kind/change kind/risk/surface/worker情報を一対一の後継fieldとは断定しない。
- **現行L11**: `docs/helix-harness/L11-acceptance/product-acceptance.md:22` (HARNESS-L2-002), `docs/helix-harness/L11-acceptance/product-acceptance.md:23` (HARNESS-L2-003), `docs/helix-os/L11-acceptance/governance-acceptance.md:24` (HELIXOS-L2-004), `docs/helix-os/L11-acceptance/governance-acceptance.md:414` (HELIXOS-L2-004), `docs/helix-os/L11-acceptance/governance-acceptance.md:30` (HELIXOS-L2-010), `docs/helix-os/L11-acceptance/governance-acceptance.md:420` (HELIXOS-L2-010)
- **版と処置**: HARNESS-L2-002: 個別本文に明示なし; HARNESS-L2-003: 個別本文に明示なし; HELIXOS-L2-004: 個別本文に明示なし; HELIXOS-L2-010: 個別本文に明示なし
- **再照合結論**: style、case trigger、ticket kind、Reverse routeは現行条件付き工程にある。旧R0-R4とspecialist/runtimeの4 field名は同一形でない。現在のstyle/work kind/change kind/risk/surface/worker情報を一対一の後継fieldとは断定しない。
- **PO判断・採択状態**: 2026-09-28 PO固定revisionのL2/L11本文に照合。該当する明示候補はPO判断の対象範囲内なら採択済み、ただしIRの正式successor割当て・実行受入は未了。追加候補や本文に未採択表示がある場合は下記の対象別処置を優先する。
- **状態の区別**: 正式successor `未割当`、受入実行 `本照合では実行評価せず、結果を主張しない`。これは意味欠落、PO採択、L3・実装完了とは別状態である。

### HIL-BR-05

- **旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:57`; asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; line SHA-256 `e60a18dffeb53ed25761c5cde58dd69b9a8004c11a5e914589ffc3bf9e74d11d`; IR `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-05` (IR SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`).
- **旧条件**: 監査で既存設計の欠陥または不足が判明した場合は、選択済みdevelopment style内の`Redesign` specialist routeへ割り当て、再freeze後に実装する。
- **現行L2照合先ID**: HARNESS-L2-002, HARNESS-L2-003, HARNESS-L2-004, HELIXOS-L2-004, HELIXOS-L2-010。これは照合先でありIRの正式successor割当てではない。
- **現行L2条件**:
  - `docs/helix-harness/L2-requirements/product-requirements.md:105,109-111,114` — Design-refactor/Refactor/Redesign/Retrofitを契約差分で振り分け、意味変更はBackflow/Decide/再freezeへ戻す。旧specialistという固定agent identityは採用されず、ticket発行とWorker実行が分離。
  - `docs/helix-os/L2-requirements/governance-requirements.md:139,142-146` — Design-refactor/Refactor/Redesign/Retrofitを契約差分で振り分け、意味変更はBackflow/Decide/再freezeへ戻す。旧specialistという固定agent identityは採用されず、ticket発行とWorker実行が分離。
- **現行L11**: `docs/helix-harness/L11-acceptance/product-acceptance.md:22` (HARNESS-L2-002), `docs/helix-harness/L11-acceptance/product-acceptance.md:23` (HARNESS-L2-003), `docs/helix-harness/L11-acceptance/product-acceptance.md:24` (HARNESS-L2-004), `docs/helix-os/L11-acceptance/governance-acceptance.md:24` (HELIXOS-L2-004), `docs/helix-os/L11-acceptance/governance-acceptance.md:414` (HELIXOS-L2-004), `docs/helix-os/L11-acceptance/governance-acceptance.md:30` (HELIXOS-L2-010), `docs/helix-os/L11-acceptance/governance-acceptance.md:420` (HELIXOS-L2-010)
- **版と処置**: HARNESS-L2-002: 個別本文に明示なし; HARNESS-L2-003: 個別本文に明示なし; HARNESS-L2-004: 個別本文に明示なし; HELIXOS-L2-004: 個別本文に明示なし; HELIXOS-L2-010: 個別本文に明示なし
- **再照合結論**: Design-refactor/Refactor/Redesign/Retrofitを契約差分で振り分け、意味変更はBackflow/Decide/再freezeへ戻す。旧specialistという固定agent identityは採用されず、ticket発行とWorker実行が分離。
- **PO判断・採択状態**: 2026-09-28 PO固定revisionのL2/L11本文に照合。該当する明示候補はPO判断の対象範囲内なら採択済み、ただしIRの正式successor割当て・実行受入は未了。追加候補や本文に未採択表示がある場合は下記の対象別処置を優先する。
- **状態の区別**: 正式successor `未割当`、受入実行 `本照合では実行評価せず、結果を主張しない`。これは意味欠落、PO採択、L3・実装完了とは別状態である。

### HIL-BR-06

- **旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:58`; asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; line SHA-256 `a90664e31f6dade0b57082ed945153ddd37fbf371a1580decea81abfde5c6edb`; IR `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-06` (IR SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`).
- **旧条件**: IssueはAdmission、Reverse Evidence、Redesign、Scope、Implementation Entry、Closureの各gateを通過しない限りready/implement/merge/closeへ遷移しない。
- **現行L2照合先ID**: HARNESS-L2-001, HARNESS-L2-002, HARNESS-L2-003, HARNESS-L2-004, HARNESS-L2-005, HARNESS-L2-008, HARNESS-L2-009, HELIXOS-L2-002, HELIXOS-L2-004, HELIXOS-L2-008, HELIXOS-L2-010。これは照合先でありIRの正式successor割当てではない。
- **現行L2条件**:
  - `docs/helix-harness/L2-requirements/product-requirements.md:72-76,98-112,114-119` — scope/Reverse/Redesign/Admission/Implementation/Closureに対応する条件と受入拒否は複数stageへ展開。すべてのIssueにReverse/Redesignを無条件要求する意味ではない。旧列が全件必須か条件付きかは要原source/PO境界確認。
  - `docs/helix-os/L2-requirements/governance-requirements.md:62-87,662-690` — scope/Reverse/Redesign/Admission/Implementation/Closureに対応する条件と受入拒否は複数stageへ展開。すべてのIssueにReverse/Redesignを無条件要求する意味ではない。旧列が全件必須か条件付きかは要原source/PO境界確認。
- **現行L11**: `docs/helix-harness/L11-acceptance/product-acceptance.md:21` (HARNESS-L2-001), `docs/helix-harness/L11-acceptance/product-acceptance.md:22` (HARNESS-L2-002), `docs/helix-harness/L11-acceptance/product-acceptance.md:23` (HARNESS-L2-003), `docs/helix-harness/L11-acceptance/product-acceptance.md:24` (HARNESS-L2-004), `docs/helix-harness/L11-acceptance/product-acceptance.md:25` (HARNESS-L2-005), `docs/helix-harness/L11-acceptance/product-acceptance.md:28` (HARNESS-L2-008), `docs/helix-harness/L11-acceptance/product-acceptance.md:29` (HARNESS-L2-009), `docs/helix-os/L11-acceptance/governance-acceptance.md:22` (HELIXOS-L2-002), `docs/helix-os/L11-acceptance/governance-acceptance.md:412` (HELIXOS-L2-002), `docs/helix-os/L11-acceptance/governance-acceptance.md:24` (HELIXOS-L2-004), `docs/helix-os/L11-acceptance/governance-acceptance.md:414` (HELIXOS-L2-004), `docs/helix-os/L11-acceptance/governance-acceptance.md:28` (HELIXOS-L2-008), `docs/helix-os/L11-acceptance/governance-acceptance.md:418` (HELIXOS-L2-008), `docs/helix-os/L11-acceptance/governance-acceptance.md:30` (HELIXOS-L2-010), `docs/helix-os/L11-acceptance/governance-acceptance.md:420` (HELIXOS-L2-010)
- **版と処置**: HARNESS-L2-001: 個別本文に明示なし; HARNESS-L2-002: 個別本文に明示なし; HARNESS-L2-003: 個別本文に明示なし; HARNESS-L2-004: 個別本文に明示なし; HARNESS-L2-005: 個別本文に明示なし; HARNESS-L2-008: 個別本文に明示なし; HARNESS-L2-009: 個別本文に明示なし; HELIXOS-L2-002: 個別本文に明示なし; HELIXOS-L2-004: 個別本文に明示なし; HELIXOS-L2-008: 個別本文に明示なし; HELIXOS-L2-010: 個別本文に明示なし
- **再照合結論**: scope/Reverse/Redesign/Admission/Implementation/Closureに対応する条件と受入拒否は複数stageへ展開。すべてのIssueにReverse/Redesignを無条件要求する意味ではない。旧列が全件必須か条件付きかは要原source/PO境界確認。
- **PO判断・採択状態**: 2026-09-28 PO固定revisionのL2/L11本文に照合。該当する明示候補はPO判断の対象範囲内なら採択済み、ただしIRの正式successor割当て・実行受入は未了。追加候補や本文に未採択表示がある場合は下記の対象別処置を優先する。
- **状態の区別**: 正式successor `未割当`、受入実行 `本照合では実行評価せず、結果を主張しない`。これは意味欠落、PO採択、L3・実装完了とは別状態である。

### HIL-BR-07

- **旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:59`; asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; line SHA-256 `f0e61fc0481c4643c32404f290014a58f14c4f856ec91e3dbfa086eb0f857e21`; IR `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-07` (IR SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`).
- **旧条件**: user directiveとIssueは分類前にdurable intake receiptを持ち、AIが不要判断だけでreject/drop/close/cancelできない。AIの非actionable dispositionは非終端で、cancel/supersedeはPOだけが行える。closure receiptが無いcloseは拒否または再openする。
- **現行L2照合先ID**: HELIXOS-L2-001, HELIXOS-L2-002, HELIXOS-L2-007, HELIXOS-L2-009, HELIXOS-L2-010, HELIXOS-L2-034。これは照合先でありIRの正式successor割当てではない。
- **現行L2条件**:
  - `docs/helix-os/L2-requirements/governance-requirements.md:60,62,74-87,187-205,295-300` — 原eventを分類前にdurable保存し、AI判断だけで内容を消さない。GitHub投影失敗時のIssueを非実装状態で閉じるのは原event保持後のprojection処理であり、work ticketの取消ではない。cancel/supersedeのPO専属権限とclosure receipt時のreopen semanticsは現行引用で直接確認できない。
- **現行L11**: `docs/helix-os/L11-acceptance/governance-acceptance.md:21` (HELIXOS-L2-001), `docs/helix-os/L11-acceptance/governance-acceptance.md:411` (HELIXOS-L2-001), `docs/helix-os/L11-acceptance/governance-acceptance.md:22` (HELIXOS-L2-002), `docs/helix-os/L11-acceptance/governance-acceptance.md:412` (HELIXOS-L2-002), `docs/helix-os/L11-acceptance/governance-acceptance.md:27` (HELIXOS-L2-007), `docs/helix-os/L11-acceptance/governance-acceptance.md:417` (HELIXOS-L2-007), `docs/helix-os/L11-acceptance/governance-acceptance.md:29` (HELIXOS-L2-009), `docs/helix-os/L11-acceptance/governance-acceptance.md:419` (HELIXOS-L2-009), `docs/helix-os/L11-acceptance/governance-acceptance.md:30` (HELIXOS-L2-010), `docs/helix-os/L11-acceptance/governance-acceptance.md:420` (HELIXOS-L2-010), `docs/helix-os/L11-acceptance/governance-acceptance.md:539` (HELIXOS-L2-034)
- **版と処置**: HELIXOS-L2-001: 個別本文に明示なし; HELIXOS-L2-002: 個別本文に明示なし; HELIXOS-L2-007: 個別本文に明示なし; HELIXOS-L2-009: 個別本文に明示なし; HELIXOS-L2-010: 個別本文に明示なし; HELIXOS-L2-034: 1.0
- **再照合結論**: 既存OS-015/019の原event不変・source/revision/訂正履歴を基礎にし、OS-L2-034/L11-034未採択候補がcancel/supersedeの既存PO authority receipt、異議/reopen、closure receipt条件を具体化する。
- **PO判断・採択状態**: 基礎の原event/durable projectionは確定本文に保持。後発HELIXOS-L2-034/L11-034（1.0、未採択）がPO権限付きcancel/supersede・異議/再開・closure receiptの境界を具体化する。候補採択とIRの正式successorは未了。
- **状態の区別**: 正式successor `正式successor未割当（候補登録はsuccessor割当てではない）`、受入実行 `候補段階の受入未実行・結果を主張しない`。これは意味欠落、PO採択、L3・実装完了とは別状態である。

### HIL-BR-08

- **旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:60`; asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; line SHA-256 `02e2ea44d0a29250ef2c4d46aad42a0b83ffef0db3191eae2a05bec398c47dbf`; IR `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-08` (IR SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`).
- **旧条件**: acceptance oracleに不要な機能拡張、公開API、CLI、schema、dependency、設定、汎用化をScope Gateで拒否する。必要性が新たに判明した場合は子Issue＋Reverseへ分離する。
- **現行L2照合先ID**: HARNESS-L2-003, HARNESS-L2-004, HARNESS-L2-008, HARNESS-L2-009, HELIXOS-L2-004, HELIXOS-L2-010。これは照合先でありIRの正式successor割当てではない。
- **現行L2条件**:
  - `docs/helix-harness/L2-requirements/product-requirements.md:72-76,110-119` — scope外変更停止、影響関係、unknown保留、Backflow/別ticketはHARNESS/OSにある。旧列挙したAPI/CLI/schema/dependency/config/genericity全種を個別の例として照合する受入や正式atom割当てはない。
  - `docs/helix-os/L2-requirements/governance-requirements.md:662-690` — scope外変更停止、影響関係、unknown保留、Backflow/別ticketはHARNESS/OSにある。旧列挙したAPI/CLI/schema/dependency/config/genericity全種を個別の例として照合する受入や正式atom割当てはない。
- **現行L11**: `docs/helix-harness/L11-acceptance/product-acceptance.md:23` (HARNESS-L2-003), `docs/helix-harness/L11-acceptance/product-acceptance.md:24` (HARNESS-L2-004), `docs/helix-harness/L11-acceptance/product-acceptance.md:28` (HARNESS-L2-008), `docs/helix-harness/L11-acceptance/product-acceptance.md:29` (HARNESS-L2-009), `docs/helix-os/L11-acceptance/governance-acceptance.md:24` (HELIXOS-L2-004), `docs/helix-os/L11-acceptance/governance-acceptance.md:414` (HELIXOS-L2-004), `docs/helix-os/L11-acceptance/governance-acceptance.md:30` (HELIXOS-L2-010), `docs/helix-os/L11-acceptance/governance-acceptance.md:420` (HELIXOS-L2-010)
- **版と処置**: HARNESS-L2-003: 個別本文に明示なし; HARNESS-L2-004: 個別本文に明示なし; HARNESS-L2-008: 個別本文に明示なし; HARNESS-L2-009: 個別本文に明示なし; HELIXOS-L2-004: 個別本文に明示なし; HELIXOS-L2-010: 個別本文に明示なし
- **再照合結論**: scope外変更停止、影響関係、unknown保留、Backflow/別ticketはHARNESS/OSにある。旧列挙したAPI/CLI/schema/dependency/config/genericity全種を個別の例として照合する受入や正式atom割当てはない。
- **PO判断・採択状態**: 2026-09-28 PO固定revisionのL2/L11本文に照合。該当する明示候補はPO判断の対象範囲内なら採択済み、ただしIRの正式successor割当て・実行受入は未了。追加候補や本文に未採択表示がある場合は下記の対象別処置を優先する。
- **状態の区別**: 正式successor `未割当`、受入実行 `本照合では実行評価せず、結果を主張しない`。これは意味欠落、PO採択、L3・実装完了とは別状態である。

### HIL-BR-09

- **旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:61`; asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; line SHA-256 `4bafa90da44e3d6bc2cb8f3f3517f16f1e7c72ff2d5872236de3cd3b2b2a3111`; IR `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-09` (IR SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`).
- **旧条件**: 工程表のlayer×drive×task-kind×verification patternからHARNESS所有agent contractとW-agent teamを生成し、Claude/Codex固有定義へ決定論的に射影する。
- **現行L2照合先ID**: HARNESS-L2-001, HARNESS-L2-002, HARNESS-L2-003, HARNESS-L2-005, HARNESS-L2-008, HARNESS-L2-009, HELIXOS-L2-004, HELIXOS-L2-010。これは照合先でありIRの正式successor割当てではない。
- **現行L2条件**:
  - `docs/helix-harness/L2-requirements/product-requirements.md:72-76,115-119` — HARNESSが工程とoracleの規範を所有し、OSがroute/ticketを構成、INTELLIGENCEは配置案を出し、Workerが実行する。旧layer×drive×task-kind×verification patternからagent contract/W-agent teamを生成しClaude/Codexへ決定論射影する具体出力は現行要件に示されない。
  - `docs/helix-os/L2-requirements/governance-requirements.md:57,662-680` — HARNESSが工程とoracleの規範を所有し、OSがroute/ticketを構成、INTELLIGENCEは配置案を出し、Workerが実行する。旧layer×drive×task-kind×verification patternからagent contract/W-agent teamを生成しClaude/Codexへ決定論射影する具体出力は現行要件に示されない。
- **現行L11**: `docs/helix-harness/L11-acceptance/product-acceptance.md:21` (HARNESS-L2-001), `docs/helix-harness/L11-acceptance/product-acceptance.md:22` (HARNESS-L2-002), `docs/helix-harness/L11-acceptance/product-acceptance.md:23` (HARNESS-L2-003), `docs/helix-harness/L11-acceptance/product-acceptance.md:25` (HARNESS-L2-005), `docs/helix-harness/L11-acceptance/product-acceptance.md:28` (HARNESS-L2-008), `docs/helix-harness/L11-acceptance/product-acceptance.md:29` (HARNESS-L2-009), `docs/helix-os/L11-acceptance/governance-acceptance.md:24` (HELIXOS-L2-004), `docs/helix-os/L11-acceptance/governance-acceptance.md:414` (HELIXOS-L2-004), `docs/helix-os/L11-acceptance/governance-acceptance.md:30` (HELIXOS-L2-010), `docs/helix-os/L11-acceptance/governance-acceptance.md:420` (HELIXOS-L2-010)
- **版と処置**: HARNESS-L2-001: 個別本文に明示なし; HARNESS-L2-002: 個別本文に明示なし; HARNESS-L2-003: 個別本文に明示なし; HARNESS-L2-005: 個別本文に明示なし; HARNESS-L2-008: 個別本文に明示なし; HARNESS-L2-009: 個別本文に明示なし; HELIXOS-L2-004: 個別本文に明示なし; HELIXOS-L2-010: 個別本文に明示なし
- **再照合結論**: HARNESSが工程とoracleの規範を所有し、OSがroute/ticketを構成、INTELLIGENCEは配置案を出し、Workerが実行する。旧layer×drive×task-kind×verification patternからagent contract/W-agent teamを生成しClaude/Codexへ決定論射影する具体出力は現行要件に示されない。
- **PO判断・採択状態**: 2026-09-28 PO固定revisionのL2/L11本文に照合。該当する明示候補はPO判断の対象範囲内なら採択済み、ただしIRの正式successor割当て・実行受入は未了。追加候補や本文に未採択表示がある場合は下記の対象別処置を優先する。
- **状態の区別**: 正式successor `未割当`、受入実行 `本照合では実行評価せず、結果を主張しない`。これは意味欠落、PO採択、L3・実装完了とは別状態である。

### HIL-BR-10

- **旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:62`; asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; line SHA-256 `ca5829916d8bbf77ee11866a67c191e9de28e97edb9a012ed6c8980c633527f3`; IR `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-10` (IR SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`).
- **旧条件**: Issue・Reverse・Redesign・development-style PLAN・commit・PR・CI・audit・memoryを同一causality chainとしてharness.dbへ収束する。join切れは未完了とする。
- **現行L2照合先ID**: HARNESS-L2-002, HARNESS-L2-003, HARNESS-L2-004, HARNESS-L2-005, HARNESS-L2-008, HARNESS-L2-009, HELIXOS-L2-001, HELIXOS-L2-002, HELIXOS-L2-007, HELIXOS-L2-009, HELIXOS-L2-010。これは照合先でありIRの正式successor割当てではない。
- **現行L2条件**:
  - `docs/helix-os/L2-requirements/governance-requirements.md:60,62,74-87,187-205,295-300,662-690` — 同じticket/cause/source/revision/evidenceへ結び、joinやprojectionの欠落を成功にしない。旧harness.dbを現行正本にせず複数のsourceと機構receiptへ移した。
  - `docs/helix-harness/L2-requirements/product-requirements.md:72-76,112,115-119` — 同じticket/cause/source/revision/evidenceへ結び、joinやprojectionの欠落を成功にしない。旧harness.dbを現行正本にせず複数のsourceと機構receiptへ移した。
- **現行L11**: `docs/helix-harness/L11-acceptance/product-acceptance.md:22` (HARNESS-L2-002), `docs/helix-harness/L11-acceptance/product-acceptance.md:23` (HARNESS-L2-003), `docs/helix-harness/L11-acceptance/product-acceptance.md:24` (HARNESS-L2-004), `docs/helix-harness/L11-acceptance/product-acceptance.md:25` (HARNESS-L2-005), `docs/helix-harness/L11-acceptance/product-acceptance.md:28` (HARNESS-L2-008), `docs/helix-harness/L11-acceptance/product-acceptance.md:29` (HARNESS-L2-009), `docs/helix-os/L11-acceptance/governance-acceptance.md:21` (HELIXOS-L2-001), `docs/helix-os/L11-acceptance/governance-acceptance.md:411` (HELIXOS-L2-001), `docs/helix-os/L11-acceptance/governance-acceptance.md:22` (HELIXOS-L2-002), `docs/helix-os/L11-acceptance/governance-acceptance.md:412` (HELIXOS-L2-002), `docs/helix-os/L11-acceptance/governance-acceptance.md:27` (HELIXOS-L2-007), `docs/helix-os/L11-acceptance/governance-acceptance.md:417` (HELIXOS-L2-007), `docs/helix-os/L11-acceptance/governance-acceptance.md:29` (HELIXOS-L2-009), `docs/helix-os/L11-acceptance/governance-acceptance.md:419` (HELIXOS-L2-009), `docs/helix-os/L11-acceptance/governance-acceptance.md:30` (HELIXOS-L2-010), `docs/helix-os/L11-acceptance/governance-acceptance.md:420` (HELIXOS-L2-010)
- **版と処置**: HARNESS-L2-002: 個別本文に明示なし; HARNESS-L2-003: 個別本文に明示なし; HARNESS-L2-004: 個別本文に明示なし; HARNESS-L2-005: 個別本文に明示なし; HARNESS-L2-008: 個別本文に明示なし; HARNESS-L2-009: 個別本文に明示なし; HELIXOS-L2-001: 個別本文に明示なし; HELIXOS-L2-002: 個別本文に明示なし; HELIXOS-L2-007: 個別本文に明示なし; HELIXOS-L2-009: 個別本文に明示なし; HELIXOS-L2-010: 個別本文に明示なし
- **再照合結論**: 同じticket/cause/source/revision/evidenceへ結び、joinやprojectionの欠落を成功にしない。旧harness.dbを現行正本にせず複数のsourceと機構receiptへ移した。
- **PO判断・採択状態**: 2026-09-28 PO固定revisionのL2/L11本文に照合。該当する明示候補はPO判断の対象範囲内なら採択済み、ただしIRの正式successor割当て・実行受入は未了。追加候補や本文に未採択表示がある場合は下記の対象別処置を優先する。
- **状態の区別**: 正式successor `未割当`、受入実行 `本照合では実行評価せず、結果を主張しない`。これは意味欠落、PO採択、L3・実装完了とは別状態である。

### HIL-BR-11

- **旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:63`; asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; line SHA-256 `dd739ce7aee374ea0c72e6361c71b87fed2f3384344c90c35fe96dad469972b2`; IR `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-11` (IR SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`).
- **旧条件**: Issue/実行/監査履歴からrecipe候補を作り、再現性検証後だけskill、detector、gateへ段階昇格する。自動生成物の即時強制適用を禁止する。
- **現行L2照合先ID**: HELIXLABO-L2-006, HELIXLABO-L2-007, HELIXLABO-L2-008, HELIXLABO-L2-016, HELIXLABO-L2-017, HELIXLABO-L2-050, HELIXLABO-L2-063。これは照合先でありIRの正式successor割当てではない。
- **現行L2条件**:
  - `docs/helix-os/L2-requirements/governance-requirements.md:60,295-300` — 未計測skill/誤推薦/旧版を拒否し、改善候補を登録・評価・採否へ分離。recipe再現性検証後にskill/detector/gateへ段階昇格する厳密な旧sequenceと各昇格oracleは現在の参照行にない。
- **現行L11**: `docs/helix-labo/L11-acceptance/labo-acceptance.md:50` (HELIXLABO-L2-006), `docs/helix-labo/L11-acceptance/labo-acceptance.md:51` (HELIXLABO-L2-007), `docs/helix-labo/L11-acceptance/labo-acceptance.md:52` (HELIXLABO-L2-008), `docs/helix-labo/L11-acceptance/labo-acceptance.md:67` (HELIXLABO-L2-016), `docs/helix-labo/L11-acceptance/labo-acceptance.md:68` (HELIXLABO-L2-017), `docs/helix-labo/L11-acceptance/labo-acceptance.md:100` (HELIXLABO-L2-050), `docs/helix-labo/L11-acceptance/labo-acceptance.md:225` (HELIXLABO-L2-063)
- **版と処置**: HELIXLABO-L2-006: 1.0; HELIXLABO-L2-007: 1.0; HELIXLABO-L2-008: 1.0; HELIXLABO-L2-016: 1.0; HELIXLABO-L2-017: 1.0; HELIXLABO-L2-050: 1.0; HELIXLABO-L2-063: 1.0
- **再照合結論**: 再現性検証後の予防候補・owner改善還流は、既存LABO-L2-007/006/008/016/017/050と関連する未採択候補063に分けて保持。overlay判断では063の追加追補は不要。LABOが強制適用を行わない境界を保つ。
- **PO判断・採択状態**: LABOの候補・評価・再観測の既決1.0責務に照合。後発HELIXLABO-L2-063/L11-063は再現後の予防候補還流の未採択構成体候補。既存L2-007等の再現可能性/shadow条件と合わせて意味を再導出し、063へ追加修正は不要とするreview記録あり。候補 adoptionと受入実行は未了。
- **状態の区別**: 正式successor `正式successor未割当（候補登録はsuccessor割当てではない）`、受入実行 `候補段階の受入未実行・結果を主張しない`。これは意味欠落、PO採択、L3・実装完了とは別状態である。

### HIL-BR-12

- **旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:64`; asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; line SHA-256 `f6f4b1de17ba7f5095862b8481ef023ce8fcc38ca7c3047e687ae3a0436c6a48`; IR `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-12` (IR SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`).
- **旧条件**: GitHub由来のIssue/PR/CI eventとユーザー差し込みIssue/PLANを同じintake契約へ正規化し、development style、case-driven activation、specialist capability、style再接続点を決定する。
- **現行L2照合先ID**: HARNESS-L2-002, HARNESS-L2-003, HELIXOS-L2-001, HELIXOS-L2-002, HELIXOS-L2-007, HELIXOS-L2-009, HELIXOS-L2-010。これは照合先でありIRの正式successor割当てではない。
- **現行L2条件**:
  - `docs/helix-os/L2-requirements/governance-requirements.md:60,62,74-87,187-205` — GitHub/ユーザー入力の原event保持後、source付き別projectionとticketへ進む。HARNESSはstyle/trigger、OSは分類projection/ticket、Issueはwork authorityでない。全GitHub eventsの捕捉や旧specialist/runtime fieldsへの同値変換は示されない。
  - `docs/helix-harness/L2-requirements/product-requirements.md:98-105` — GitHub/ユーザー入力の原event保持後、source付き別projectionとticketへ進む。HARNESSはstyle/trigger、OSは分類projection/ticket、Issueはwork authorityでない。全GitHub eventsの捕捉や旧specialist/runtime fieldsへの同値変換は示されない。
  - `docs/helix-os/L2-requirements/governance-requirements.md:129-149` — GitHub/ユーザー入力の原event保持後、source付き別projectionとticketへ進む。HARNESSはstyle/trigger、OSは分類projection/ticket、Issueはwork authorityでない。全GitHub eventsの捕捉や旧specialist/runtime fieldsへの同値変換は示されない。
- **現行L11**: `docs/helix-harness/L11-acceptance/product-acceptance.md:22` (HARNESS-L2-002), `docs/helix-harness/L11-acceptance/product-acceptance.md:23` (HARNESS-L2-003), `docs/helix-os/L11-acceptance/governance-acceptance.md:21` (HELIXOS-L2-001), `docs/helix-os/L11-acceptance/governance-acceptance.md:411` (HELIXOS-L2-001), `docs/helix-os/L11-acceptance/governance-acceptance.md:22` (HELIXOS-L2-002), `docs/helix-os/L11-acceptance/governance-acceptance.md:412` (HELIXOS-L2-002), `docs/helix-os/L11-acceptance/governance-acceptance.md:27` (HELIXOS-L2-007), `docs/helix-os/L11-acceptance/governance-acceptance.md:417` (HELIXOS-L2-007), `docs/helix-os/L11-acceptance/governance-acceptance.md:29` (HELIXOS-L2-009), `docs/helix-os/L11-acceptance/governance-acceptance.md:419` (HELIXOS-L2-009), `docs/helix-os/L11-acceptance/governance-acceptance.md:30` (HELIXOS-L2-010), `docs/helix-os/L11-acceptance/governance-acceptance.md:420` (HELIXOS-L2-010)
- **版と処置**: HARNESS-L2-002: 個別本文に明示なし; HARNESS-L2-003: 個別本文に明示なし; HELIXOS-L2-001: 個別本文に明示なし; HELIXOS-L2-002: 個別本文に明示なし; HELIXOS-L2-007: 個別本文に明示なし; HELIXOS-L2-009: 個別本文に明示なし; HELIXOS-L2-010: 個別本文に明示なし
- **再照合結論**: GitHub/ユーザー入力の原event保持後、source付き別projectionとticketへ進む。HARNESSはstyle/trigger、OSは分類projection/ticket、Issueはwork authorityでない。全GitHub eventsの捕捉や旧specialist/runtime fieldsへの同値変換は示されない。
- **PO判断・採択状態**: 2026-09-28 PO固定revisionのL2/L11本文に照合。該当する明示候補はPO判断の対象範囲内なら採択済み、ただしIRの正式successor割当て・実行受入は未了。追加候補や本文に未採択表示がある場合は下記の対象別処置を優先する。
- **状態の区別**: 正式successor `未割当`、受入実行 `本照合では実行評価せず、結果を主張しない`。これは意味欠落、PO採択、L3・実装完了とは別状態である。

### HIL-BR-13

- **旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:65`; asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; line SHA-256 `9a5021ffa24ad3187864fdce1aa09ba6c6eb658b318afa7f46954b422224ef04`; IR `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-13` (IR SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`).
- **旧条件**: 全PLANは画面工程を`prototype_required`または`not_applicable`へ明示分類する。画面対象はprototype→walkthrough→要求back-propagation→agreement後に要件をfreezeし、画面非対象は証拠付きskip receiptでのみ通過する。
- **現行L2照合先ID**: HARNESS-L2-003。これは照合先でありIRの正式successor割当てではない。
- **現行L2条件**:
  - `docs/helix-harness/L2-requirements/product-requirements.md:106-107` — HARNESS L2:106-107とL11:41-42は旧条件の意味を保持し、画面外PoCのPO追加条件を含む。受入未実行で合格未確認。
- **現行L11**: `docs/helix-harness/L11-acceptance/product-acceptance.md:23` (HARNESS-L2-003)
- **版と処置**: HARNESS-L2-003: 個別本文に明示なし
- **再照合結論**: HARNESS-L2-003/L11-003で画面工程の適用分類、画面対象のprototype→walkthrough→要求への戻し→合意前freeze禁止、非対象の証拠付きskipを意味として保持する。
- **PO判断・採択状態**: 2026-09-28 PO固定revisionのL2/L11本文に照合。該当する明示候補はPO判断の対象範囲内なら採択済み、ただしIRの正式successor割当て・実行受入は未了。追加候補や本文に未採択表示がある場合は下記の対象別処置を優先する。
- **状態の区別**: 正式successor `未割当; 事務的対応表は主張しない`、受入実行 `未実行・結果を主張しない`。これは意味欠落、PO採択、L3・実装完了とは別状態である。

### HIL-BR-14

- **旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:66`; asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; line SHA-256 `58c9c92d2cd7bc384de26c076841eaaaf3b52ab231c83c9a86a72973f7747d91`; IR `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-14` (IR SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`).
- **旧条件**: ZIP、前身repository exact 2件（`unison-ai-product/UT-TDD_AGENT-HARNESS`、`RetryYN/ai-dev-kit-vscode`）のcurrent advertised `heads/tags/pull` ref authority、現行HELIXのsourceをatomic behavior単位へ完全分解し、各項目を採否判断から要件・設計・テスト・Gateまで追跡する。file集合やaggregate親の列挙、source宣言、読了だけを採用済みとみなさない。ref件数、unique tree entry分母、全ref-entry edge分母はauthority receiptから導出し、観測時の件数を要件へ固定しない。
- **現行L2照合先ID**: HARNESS-L2-004, HELIXOS-L2-002, HELIXOS-L2-006, HELIXOS-L2-007。これは照合先でありIRの正式successor割当てではない。
- **現行L2条件**:
  - `docs/helix-harness/L2-requirements/product-requirements.md:137-148` — archive資産目録、原子単位の処置、consumerの閉鎖、no-loss traceを要求する。個別targetの版は割り当てない。
  - `docs/helix-os/L2-requirements/governance-requirements.md:170-185` — archive consumer、digest、所有者、処置を追跡し、receiptから導く母数を動的に保つ。
- **現行L11**: `docs/helix-harness/L11-acceptance/product-acceptance.md:24` (HARNESS-L2-004), `docs/helix-os/L11-acceptance/governance-acceptance.md:22` (HELIXOS-L2-002), `docs/helix-os/L11-acceptance/governance-acceptance.md:412` (HELIXOS-L2-002), `docs/helix-os/L11-acceptance/governance-acceptance.md:26` (HELIXOS-L2-006), `docs/helix-os/L11-acceptance/governance-acceptance.md:416` (HELIXOS-L2-006), `docs/helix-os/L11-acceptance/governance-acceptance.md:27` (HELIXOS-L2-007), `docs/helix-os/L11-acceptance/governance-acceptance.md:417` (HELIXOS-L2-007)
- **版と処置**: HARNESS-L2-004: 個別本文に明示なし; HELIXOS-L2-002: 個別本文に明示なし; HELIXOS-L2-006: 個別本文に明示なし; HELIXOS-L2-007: 個別本文に明示なし
- **再照合結論**: 旧条件の無損失・consumer閉包・原子的な採否追跡は現行HARNESS/OSのarchive disposition要求として再導出される。旧remote/ref/tree数は固定要件へ移さずauthority receiptから測る。repository移行を完了する正式ticketは引用本文から特定できない。
- **PO判断・採択状態**: 2026-09-28 PO固定revisionのL2/L11本文に照合。該当する明示候補はPO判断の対象範囲内なら採択済み、ただしIRの正式successor割当て・実行受入は未了。追加候補や本文に未採択表示がある場合は下記の対象別処置を優先する。
- **状態の区別**: 正式successor `未割当`、受入実行 `本照合では実行評価せず、結果を主張しない`。これは意味欠落、PO採択、L3・実装完了とは別状態である。

### HIL-BR-15

- **旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:67`; asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; line SHA-256 `880385839788ea49f14544ee9dd0f1ed5037bc84b1707a9ba55f4fa6a267c2f5`; IR `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-15` (IR SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`).
- **旧条件**: 将来のproduct-data sourceをversioned connectorで取り込み、由来・鮮度・schema・authorityを保持した正規projectionとして設計判断、coverage、impact、Issue routing、docgen/detectorへ供給する。
- **現行L2照合先ID**: HELIXBRAIN-L2-026, HELIXBRAIN-L2-027, HELIXLABO-L2-001, HELIXLABO-L2-021, HELIXLABO-L2-031, HELIXOS-L2-007, HELIXOS-L2-009, HELIXOS-L2-010。これは照合先でありIRの正式successor割当てではない。
- **現行L2条件**:
  - `docs/helix-labo/L2-requirements/labo-requirements.md:49-75,161-193` — LABO provides source-specific permitted observation connectors and provenance/unknown handling; its L1/L2 table separates internal 1.0 inputs from optional source contracts.
  - `docs/helix-brain/L2-requirements/brain-requirements.md:29-33,70-79` — 外部source知識の候補pathは独立した2.0対象。
  - `docs/helix-os/L2-requirements/governance-requirements.md:85-87,261-269,336-345` — OSはsourceに結び付いたprojection、stale状態、利用側を記録し、製品の意味解釈は所有しない。
- **現行L11**: `docs/helix-brain/L11-acceptance/brain-acceptance.md:66` (HELIXBRAIN-L2-026), `docs/helix-brain/L11-acceptance/brain-acceptance.md:67` (HELIXBRAIN-L2-027), `docs/helix-labo/L11-acceptance/labo-acceptance.md:45` (HELIXLABO-L2-001), `docs/helix-labo/L11-acceptance/labo-acceptance.md:72` (HELIXLABO-L2-021), `docs/helix-labo/L11-acceptance/labo-acceptance.md:82` (HELIXLABO-L2-031), `docs/helix-os/L11-acceptance/governance-acceptance.md:27` (HELIXOS-L2-007), `docs/helix-os/L11-acceptance/governance-acceptance.md:417` (HELIXOS-L2-007), `docs/helix-os/L11-acceptance/governance-acceptance.md:29` (HELIXOS-L2-009), `docs/helix-os/L11-acceptance/governance-acceptance.md:419` (HELIXOS-L2-009), `docs/helix-os/L11-acceptance/governance-acceptance.md:30` (HELIXOS-L2-010), `docs/helix-os/L11-acceptance/governance-acceptance.md:420` (HELIXOS-L2-010)
- **版と処置**: HELIXBRAIN-L2-026: 個別本文に明示なし; HELIXBRAIN-L2-027: 個別本文に明示なし; HELIXLABO-L2-001: 1.0; HELIXLABO-L2-021: 1.0; HELIXLABO-L2-031: 個別本文に明示なし; HELIXOS-L2-007: 個別本文に明示なし; HELIXOS-L2-009: 個別本文に明示なし; HELIXOS-L2-010: 個別本文に明示なし
- **再照合結論**: LABOの許可済み観測接続とBRAIN向け外部知識候補は別経路である。LABOの内部観測は1.0候補、BRAIN外部情報→LABO→BRAINは2.0。旧条件が列挙する全consumerへ一つのversioned projectionを渡す規範と、各consumerの受入は確認できず、統合対応とはみなさない。
- **PO判断・採択状態**: 2026-09-28 PO固定revisionのL2/L11本文に照合。該当する明示候補はPO判断の対象範囲内なら採択済み、ただしIRの正式successor割当て・実行受入は未了。追加候補や本文に未採択表示がある場合は下記の対象別処置を優先する。
- **状態の区別**: 正式successor `未割当`、受入実行 `本照合では実行評価せず、結果を主張しない`。これは意味欠落、PO採択、L3・実装完了とは別状態である。

### HIL-BR-16

- **旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:68`; asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; line SHA-256 `646af69fb95ddc876d0ad4dacf319cbf80499531c5c1fa6fbda620ce99b1f28c`; IR `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-16` (IR SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`).
- **旧条件**: 検証をslice統合前のimpact CI、候補固定後のfull CI、GitHub PR上の外部CIの3段に固定し、各段のSHA/treeと直前段からのlineageがgreenでなければ次段へ進めない。style内統合によるSHA変更はpredecessor bindingで追跡する。
- **現行L2照合先ID**: HARNESS-L2-005, HARNESS-L2-009, HELIXOS-L2-008, HELIXOS-L2-020。これは照合先でありIRの正式successor割当てではない。
- **現行L2条件**:
  - `docs/helix-harness/L2-requirements/product-requirements.md:56,115-121,125-135` — 検証義務は全件共通の三段階に固定せず、scope・risk・変更内容から導く。
  - `docs/helix-os/L2-requirements/governance-requirements.md:61,114-117,296,307-315` — CI profile is bound to upstream revision, harness revision and change set; legacy execution is excluded.
- **現行L11**: `docs/helix-harness/L11-acceptance/product-acceptance.md:25` (HARNESS-L2-005), `docs/helix-harness/L11-acceptance/product-acceptance.md:29` (HARNESS-L2-009), `docs/helix-os/L11-acceptance/governance-acceptance.md:28` (HELIXOS-L2-008), `docs/helix-os/L11-acceptance/governance-acceptance.md:418` (HELIXOS-L2-008), `docs/helix-os/L11-acceptance/governance-acceptance.md:359` (HELIXOS-L2-020)
- **版と処置**: HARNESS-L2-005: 個別本文に明示なし; HARNESS-L2-009: 個別本文に明示なし; HELIXOS-L2-008: 個別本文に明示なし; HELIXOS-L2-020: 1.0
- **再照合結論**: 旧固定3段は動的な変更別検証へ置換され、revision/runner結果のlineageは保持される。外部CIを含む旧段数を要求しない理由がHARNESS L2に記録され、新CI未構築・L11未実行は要求欠落と分離する。
- **PO判断・採択状態**: 2026-09-28 PO固定revisionのL2/L11本文に照合。該当する明示候補はPO判断の対象範囲内なら採択済み、ただしIRの正式successor割当て・実行受入は未了。追加候補や本文に未採択表示がある場合は下記の対象別処置を優先する。
- **状態の区別**: 正式successor `未割当`、受入実行 `本照合では実行評価せず、結果を主張しない`。これは意味欠落、PO採択、L3・実装完了とは別状態である。

### HIL-BR-17

- **旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:69`; asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; line SHA-256 `cc9a2df7388bf9bcc70ad6b6325fbe41263285fce5d2bd6a0b306f132c71061c`; IR `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-17` (IR SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`).
- **旧条件**: Claude監査findingをcurrent contract影響と責務境界で機械的にdispositionする。同じ責務・既存scope内で安全かつ局所的に閉じるfindingは`current_pr_fix`としてwriterへ返し、独立責務・別設計・lifecycle・性能改善だけを`successor_issue`としてIssue、Universal Reverse、memory要約、Codex ready queueへ同一causality chainで接続する。AIの自由判断だけによるfinding破棄と、後続Issueのcurrent PRへの再流入を認めない。
- **現行L2照合先ID**: HELIXOS-L2-004, HELIXOS-L2-010。これは照合先でありIRの正式successor割当てではない。
- **現行L2条件**:
  - 現行L2 owner rowを特定できない。
- **現行L11**: `docs/helix-os/L11-acceptance/governance-acceptance.md:24` (HELIXOS-L2-004), `docs/helix-os/L11-acceptance/governance-acceptance.md:414` (HELIXOS-L2-004), `docs/helix-os/L11-acceptance/governance-acceptance.md:30` (HELIXOS-L2-010), `docs/helix-os/L11-acceptance/governance-acceptance.md:420` (HELIXOS-L2-010)
- **版と処置**: HELIXOS-L2-004: 個別本文に明示なし; HELIXOS-L2-010: 個別本文に明示なし
- **再照合結論**: 意味欠落は確認しなかった。IR→successorのatom receiptはないため、要求再配置の管理状態は未割当のまま。
- **PO判断・採択状態**: 2026-09-28 PO固定revisionのL2/L11本文に照合。該当する明示候補はPO判断の対象範囲内なら採択済み、ただしIRの正式successor割当て・実行受入は未了。追加候補や本文に未採択表示がある場合は下記の対象別処置を優先する。
- **状態の区別**: 正式successor `正式successor未割当（事務的対応と意味被覆は別状態）`、受入実行 `本照合では実行評価せず、結果を主張しない`。これは意味欠落、PO採択、L3・実装完了とは別状態である。

### HIL-BR-18

- **旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:70`; asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; line SHA-256 `ed9ca61ec5d2fbf34a6b774cea859f41810b2f0cb9dc9105b46912ddf383ac2f`; IR `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-18` (IR SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`).
- **旧条件**: HARNESSはagent定義だけでなく、生成、lease、実行、checkpoint、検証、解放、quarantine、retireまでのinstance lifecycleを正本として保持する。
- **現行L2照合先ID**: HARNESS-L2-001, HARNESS-L2-010, HELIXOS-L2-018。これは照合先でありIRの正式successor割当てではない。
- **現行L2条件**:
  - `docs/helix-harness/L2-requirements/product-requirements.md:28-32,340-360` — HARNESSがprocess/agent contractを所有し、OSのruntime operationと分離する。
  - `docs/helix-os/L2-requirements/governance-requirements.md:57,293-305,538-552,672-680` — OSがassignment、execution、lease、checkpoint、recovery、Worker lifecycleを所有する。
- **現行L11**: `docs/helix-harness/L11-acceptance/product-acceptance.md:21` (HARNESS-L2-001), `docs/helix-harness/L11-acceptance/product-acceptance.md:205` (HARNESS-L2-010), `docs/helix-os/L11-acceptance/governance-acceptance.md:345` (HELIXOS-L2-018)
- **版と処置**: HARNESS-L2-001: 個別本文に明示なし; HARNESS-L2-010: 個別本文に明示なし; HELIXOS-L2-018: 1.0
- **再照合結論**: 運用instance lifecycleの所有はPO判断でOSへ再配置され、HARNESSには工程/agent contractが残る。OS L2-018の対応受入は1.0。生成agent contractとprovider固有runtime射影の要求までは引用本文にない。
- **PO判断・採択状態**: 2026-09-28 PO固定revisionのL2/L11本文に照合。該当する明示候補はPO判断の対象範囲内なら採択済み、ただしIRの正式successor割当て・実行受入は未了。追加候補や本文に未採択表示がある場合は下記の対象別処置を優先する。
- **状態の区別**: 正式successor `未割当`、受入実行 `本照合では実行評価せず、結果を主張しない`。これは意味欠落、PO採択、L3・実装完了とは別状態である。

### HIL-BR-19

- **旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:71`; asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; line SHA-256 `a4b222e8ead41022fd779d22ee7fdce8b029511e2d4cfc34d38145f525871e3a`; IR `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-19` (IR SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`).
- **旧条件**: Bun撤去はNodeでも一部動く状態ではなく、activeな開発・実行・検証・配布surfaceがBunなしで再現可能となった時点だけを完了とする。
- **現行L2照合先ID**: 現行L2 targetなし。これは照合先でありIRの正式successor割当てではない。
- **現行L2条件**:
  - `docs/helix-harness/L2-requirements/product-requirements.md:56,133-143` — 言語・toolに依存しないCIとarchive起点の移行統制を定めるが、BunからNodeへの移行を割り当てない。
  - `docs/helix-os/L2-requirements/governance-requirements.md:307-315` — 旧workflowを実行せず、現行CI要求を再導出する。
- **現行L11**: 明示的な現行照合先/L11 rowなし（実装移行条件か意味欠落かは別判定）
- **版と処置**: 現行L2 targetなし。個別版は未確認。
- **再照合結論**: Bunなしでの開発・実行・検証・配布再現はrepository固有の移行完了条件であり、8機構L2/L11に具体作業owner、対象面、受入fixtureはない。これは製品能力の欠落とは判定できず、migration work assignmentも特定できない。
- **PO判断・採択状態**: 2026-09-28 PO固定revisionのL2/L11本文に照合。該当する明示候補はPO判断の対象範囲内なら採択済み、ただしIRの正式successor割当て・実行受入は未了。追加候補や本文に未採択表示がある場合は下記の対象別処置を優先する。
- **状態の区別**: 正式successor `未割当`、受入実行 `本照合では実行評価せず、結果を主張しない`。これは意味欠落、PO採択、L3・実装完了とは別状態である。

### HIL-BR-20

- **旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:72`; asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; line SHA-256 `c60a8d8c2232cca18a3c551aab70dc32c3f350868a7c79a28d2e51b419bcd003`; IR `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-20` (IR SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`).
- **旧条件**: 既知の内部CI failureは証拠を保持した機械的quarantineで一時隔離できるが、対象外failure、新規fingerprint、最低代替gate失敗を無視してはならない。旧UTの検証契約を棚卸し後に再構築する。
- **現行L2照合先ID**: HARNESS-L2-005, HARNESS-L2-009, HELIXOS-L2-008, HELIXOS-L2-020, HELIXOS-L2-032。これは照合先でありIRの正式successor割当てではない。
- **現行L2条件**:
  - `docs/helix-harness/L2-requirements/product-requirements.md:115-121,137-148` — 必要な検証、想定failure、旧/現行CIの境界を追跡する。
  - `docs/helix-os/L2-requirements/governance-requirements.md:296,307-315` — failure/runner/retryと現行CIの再導出を記録する。
- **現行L11**: `docs/helix-harness/L11-acceptance/product-acceptance.md:25` (HARNESS-L2-005), `docs/helix-harness/L11-acceptance/product-acceptance.md:29` (HARNESS-L2-009), `docs/helix-os/L11-acceptance/governance-acceptance.md:28` (HELIXOS-L2-008), `docs/helix-os/L11-acceptance/governance-acceptance.md:418` (HELIXOS-L2-008), `docs/helix-os/L11-acceptance/governance-acceptance.md:359` (HELIXOS-L2-020), `docs/helix-os/L11-acceptance/governance-acceptance.md:513` (HELIXOS-L2-032)
- **版と処置**: HARNESS-L2-005: 個別本文に明示なし; HARNESS-L2-009: 個別本文に明示なし; HELIXOS-L2-008: 個別本文に明示なし; HELIXOS-L2-020: 1.0; HELIXOS-L2-032: 1.0
- **再照合結論**: HELIXOS-L2-032/L11-032は既知failure fingerprint・対象scope・期限・fingerprint変更失効・最低代替gate条件を具体化する1.0未採択候補。一般failureを無視する許可は与えない。
- **PO判断・採択状態**: HARNESS/OSのfailure・required-gate基礎は採択済み。後発HELIXOS-L2-032/L11-032（1.0、未採択）が既知failure fingerprint/scope/expiry/change失効/最低代替gate条件を具体化する。別OS-033 replayability 候補と分ける。正式successor/実証は未了。
- **状態の区別**: 正式successor `正式successor未割当（候補登録はsuccessor割当てではない）`、受入実行 `候補段階の受入未実行・結果を主張しない`。これは意味欠落、PO採択、L3・実装完了とは別状態である。

### HIL-BR-21

- **旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:73`; asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; line SHA-256 `8369ba5931af089d75853750a76b87e29c2316f6b7d161d9d70f9ef02058d5ab`; IR `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-21` (IR SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`).
- **旧条件**: 設計上の重複、責務混在、変更波及、埋込みpolicyを、外部仕様と受入挙動を維持したまま外部化・共通化・オブジェクト化する第一級`DesignRefactor`駆動モデルを持つ。要求・公開contract・永続state semanticsを変える場合は`Redesign`または`Retrofit`へrerouteする。
- **現行L2照合先ID**: HARNESS-L2-002, HARNESS-L2-003, HARNESS-L2-004。これは照合先でありIRの正式successor割当てではない。
- **現行L2条件**:
  - `docs/helix-harness/L2-requirements/product-requirements.md:105,109-111,114` — L2 product-requirements.md:105とL11 product-acceptance.md:39-40はSR0-SR4/SR4 receipt/exactly-one routeと、observable behavior/public surface/DB semantics/requirement変化時Redesign/Retrofitを直接要求する。L2:111は契約保持時のrefactorと差分時の上流Backflowを、OS governance-requirements.md:142-146およびgovernance-acceptance.md:289-293はticket種・受入routeを具体化する。要求条件の欠落は見つからない。全L11未実行であり受入成立は主張しない。
  - `docs/helix-os/L2-requirements/governance-requirements.md:139,142-146` — L2 product-requirements.md:105とL11 product-acceptance.md:39-40はSR0-SR4/SR4 receipt/exactly-one routeと、observable behavior/public surface/DB semantics/requirement変化時Redesign/Retrofitを直接要求する。L2:111は契約保持時のrefactorと差分時の上流Backflowを、OS governance-requirements.md:142-146およびgovernance-acceptance.md:289-293はticket種・受入routeを具体化する。要求条件の欠落は見つからない。全L11未実行であり受入成立は主張しない。
- **現行L11**: `docs/helix-harness/L11-acceptance/product-acceptance.md:22` (HARNESS-L2-002), `docs/helix-harness/L11-acceptance/product-acceptance.md:23` (HARNESS-L2-003), `docs/helix-harness/L11-acceptance/product-acceptance.md:24` (HARNESS-L2-004)
- **版と処置**: HARNESS-L2-002: 個別本文に明示なし; HARNESS-L2-003: 個別本文に明示なし; HARNESS-L2-004: 個別本文に明示なし
- **再照合結論**: L2 product-requirements.md:105とL11 product-acceptance.md:39-40はSR0-SR4/SR4 receipt/exactly-one routeと、observable behavior/public surface/DB semantics/requirement変化時Redesign/Retrofitを直接要求する。L2:111は契約保持時のrefactorと差分時の上流Backflowを、OS governance-requirements.md:142-146およびgovernance-acceptance.md:289-293はticket種・受入routeを具体化する。要求条件の欠落は見つからない。全L11未実行であり受入成立は主張しない。
- **PO判断・採択状態**: 2026-09-28 PO固定revisionのL2/L11本文に照合。該当する明示候補はPO判断の対象範囲内なら採択済み、ただしIRの正式successor割当て・実行受入は未了。追加候補や本文に未採択表示がある場合は下記の対象別処置を優先する。
- **状態の区別**: 正式successor `未割当`、受入実行 `未実行・結果を主張しない`。これは意味欠落、PO採択、L3・実装完了とは別状態である。

### HIL-BR-22

- **旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:74`; asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; line SHA-256 `836dae29beb73621e534e560f67f26ef198dfdc9b25fa4f00c2dadeda7d47fca`; IR `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-22` (IR SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`).
- **旧条件**: 要求系統とservice/capability系統をDesign Templateへ結び、各要求から生じる設計義務を原子的に生成・消込する。閉じた要求集合について説明のない設計漏れを0件にし、未知の要求まで網羅したとは主張しない。
- **現行L2照合先ID**: HARNESS-L2-009, HELIXOS-L2-016。これは照合先でありIRの正式successor割当てではない。
- **現行L2条件**:
  - `docs/helix-harness/L2-requirements/product-requirements.md:55,59-60,115-121,379-385` — 要求からtemplateへの設計義務、unit/connection/compositeの責務、差戻し、scopeを定義する。
  - `docs/helix-os/L2-requirements/governance-requirements.md:55-63,652-670` — OS traces requirement revisions, obligations and unknown state.
- **現行L11**: `docs/helix-harness/L11-acceptance/product-acceptance.md:29` (HARNESS-L2-009), `docs/helix-os/L11-acceptance/governance-acceptance.md:331` (HELIXOS-L2-016)
- **版と処置**: HARNESS-L2-009: 個別本文に明示なし; HELIXOS-L2-016: 1.0
- **再照合結論**: 閉じた要求集合の義務生成・消込と未知を完全扱いしない意味はHARNESS/OSへ分担再導出される。独立ledger/database schemaは要求されない。候補本文の個別版表は当該IDへ固定版を与えない。
- **PO判断・採択状態**: 2026-09-28 PO固定revisionのL2/L11本文に照合。該当する明示候補はPO判断の対象範囲内なら採択済み、ただしIRの正式successor割当て・実行受入は未了。追加候補や本文に未採択表示がある場合は下記の対象別処置を優先する。
- **状態の区別**: 正式successor `未割当`、受入実行 `本照合では実行評価せず、結果を主張しない`。これは意味欠落、PO採択、L3・実装完了とは別状態である。

### HIL-BR-23

- **旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:75`; asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; line SHA-256 `cc91796d9bc94e30f90c053d25a1e4300e47565350f6c15ad8cc5884b4fab5b0`; IR `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-23` (IR SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`).
- **旧条件**: HARNESS所有のRequirement Translator subagentはchat、product data、source capabilityを要求atomへ翻訳し、既存templateで表現不能な論点を黙って捨てずTemplate Gap Issueとして改善loopへ戻す。
- **現行L2照合先ID**: HARNESS-L2-008, HARNESS-L2-024, HELIXOS-L2-015, HELIXOS-L2-016。これは照合先でありIRの正式successor割当てではない。
- **現行L2条件**:
  - `docs/helix-harness/L2-requirements/product-requirements.md:59,175-198,499-512` — 要求の翻訳、意味差分、質問、不確実性、template gapをsource側の工程へ戻す。
  - `docs/helix-os/L2-requirements/governance-requirements.md:85-87,261-269,336-345` — OSはsource authorityとprojectionを記録し、要求の意味を起草しない。
- **現行L11**: `docs/helix-harness/L11-acceptance/product-acceptance.md:28` (HARNESS-L2-008), `docs/helix-harness/L11-acceptance/product-acceptance.md:235` (HARNESS-L2-024), `docs/helix-harness/L11-acceptance/product-acceptance.md:240` (HARNESS-L2-024), `docs/helix-os/L11-acceptance/governance-acceptance.md:324` (HELIXOS-L2-015), `docs/helix-os/L11-acceptance/governance-acceptance.md:331` (HELIXOS-L2-016)
- **版と処置**: HARNESS-L2-008: 個別本文に明示なし; HARNESS-L2-024: 1.0; HELIXOS-L2-015: 1.0; HELIXOS-L2-016: 1.0
- **再照合結論**: 要件翻訳・不確実性保持・template gapの差戻しはHARNESS L2-008/024へ具体化され、source/authorityの記録はOSへ分離される。Template Gap Issueという固定ticket名や特定subagent runtimeは採択されていない。HARNESS-L2-024は1.0、008個別版は未確定。
- **PO判断・採択状態**: 2026-09-28 PO固定revisionのL2/L11本文に照合。該当する明示候補はPO判断の対象範囲内なら採択済み、ただしIRの正式successor割当て・実行受入は未了。追加候補や本文に未採択表示がある場合は下記の対象別処置を優先する。
- **状態の区別**: 正式successor `未割当`、受入実行 `本照合では実行評価せず、結果を主張しない`。これは意味欠落、PO採択、L3・実装完了とは別状態である。

### HIL-BR-24

- **旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:76`; asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; line SHA-256 `ddd462343bec5f68160e4bc0ff14c5ada0dd595fa4d6f7271b7435127eb0b438`; IR `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-24` (IR SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`).
- **旧条件**: 要件定義そのものを設計対象として台帳化し、原文、原子要求、authority、分類、scope、priority、acceptance oracle、capability/service、template適用、design obligation、revisionを一つの履歴へ結ぶ。trace行の存在だけを要件定義完了とみなさない。
- **現行L2照合先ID**: HARNESS-L2-008, HARNESS-L2-009, HELIXOS-L2-015, HELIXOS-L2-016。これは照合先でありIRの正式successor割当てではない。
- **現行L2条件**:
  - `docs/helix-harness/L2-requirements/product-requirements.md:50-60,115-121,175-208` — 要求contractにidentity、source、scope、pair、優先度、未決質問、traceを保持する。
  - `docs/helix-os/L2-requirements/governance-requirements.md:55-63,85-87,642-670` — OSはauthority、revision、evidence、portfolio状態、unknownを記録する。
- **現行L11**: `docs/helix-harness/L11-acceptance/product-acceptance.md:28` (HARNESS-L2-008), `docs/helix-harness/L11-acceptance/product-acceptance.md:29` (HARNESS-L2-009), `docs/helix-os/L11-acceptance/governance-acceptance.md:324` (HELIXOS-L2-015), `docs/helix-os/L11-acceptance/governance-acceptance.md:331` (HELIXOS-L2-016)
- **版と処置**: HARNESS-L2-008: 個別本文に明示なし; HARNESS-L2-009: 個別本文に明示なし; HELIXOS-L2-015: 1.0; HELIXOS-L2-016: 1.0
- **再照合結論**: 要求意味・oracle・設計義務はHARNESS、authority/source履歴はOSへ分担され、一つのDBへ統合しない。BR-24列挙の全fieldを一体schemaに持つ現行契約は確認できないが、同じ出力責務かはfield別に分解すべきで、現段階ではschema形状を欠落と断定しない。traceだけで完了としない条件は保持。
- **PO判断・採択状態**: 2026-09-28 PO固定revisionのL2/L11本文に照合。該当する明示候補はPO判断の対象範囲内なら採択済み、ただしIRの正式successor割当て・実行受入は未了。追加候補や本文に未採択表示がある場合は下記の対象別処置を優先する。
- **状態の区別**: 正式successor `未割当`、受入実行 `本照合では実行評価せず、結果を主張しない`。これは意味欠落、PO採択、L3・実装完了とは別状態である。

### HIL-BR-25

- **旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:77`; asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; line SHA-256 `5f6245bdc3312264b8e3ff4ba5589f71fa97f8bcbe4b7ff055e0070b54de2fd6`; IR `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-25` (IR SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`).
- **旧条件**: canonical L1からL12の各layerに粒度固有の設計・実行・検証台帳を置く`Layer Ledger Chain`を持つ。L0 charterは層外authority anchorとしてL1企画へ投影する。各台帳は上位/下位layerと双方向に導出・逆伝播し、正規V-modelの左右pairとも双方向に対応する。上下または左右の片edgeだけで工程完了を主張しない。
- **現行L2照合先ID**: HARNESS-L2-001, HARNESS-L2-004, HARNESS-L2-008, HARNESS-L2-009, HELIXOS-L2-015, HELIXOS-L2-016。これは照合先でありIRの正式successor割当てではない。
- **現行L2条件**:
  - `docs/helix-harness/L2-requirements/product-requirements.md:52,55,99,108-119` — 6つの標準V-pairと、要求・設計・テスト間の双方向traceを定義する。
  - `docs/helix-os/L2-requirements/governance-requirements.md:55-63,85-87` — OSはportfolio間の関係、stale状態、unknownを保持する。
- **現行L11**: `docs/helix-harness/L11-acceptance/product-acceptance.md:21` (HARNESS-L2-001), `docs/helix-harness/L11-acceptance/product-acceptance.md:24` (HARNESS-L2-004), `docs/helix-harness/L11-acceptance/product-acceptance.md:28` (HARNESS-L2-008), `docs/helix-harness/L11-acceptance/product-acceptance.md:29` (HARNESS-L2-009), `docs/helix-os/L11-acceptance/governance-acceptance.md:324` (HELIXOS-L2-015), `docs/helix-os/L11-acceptance/governance-acceptance.md:331` (HELIXOS-L2-016)
- **版と処置**: HARNESS-L2-001: 個別本文に明示なし; HARNESS-L2-004: 個別本文に明示なし; HARNESS-L2-008: 個別本文に明示なし; HARNESS-L2-009: 個別本文に明示なし; HELIXOS-L2-015: 1.0; HELIXOS-L2-016: 1.0
- **再照合結論**: 双方向trace・片edgeだけでの完了禁止は再導出される。独立L1–L12ごとの物理台帳や新しい層数を規範化してはいない。layer ledger chainの独立artifactを意味するかは現行pair graphとの同値が決められておらず未確定。
- **PO判断・採択状態**: 2026-09-28 PO固定revisionのL2/L11本文に照合。該当する明示候補はPO判断の対象範囲内なら採択済み、ただしIRの正式successor割当て・実行受入は未了。追加候補や本文に未採択表示がある場合は下記の対象別処置を優先する。
- **状態の区別**: 正式successor `未割当`、受入実行 `本照合では実行評価せず、結果を主張しない`。これは意味欠落、PO採択、L3・実装完了とは別状態である。

### HIL-BR-26

- **旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:78`; asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; line SHA-256 `b84cbe4081fd2972d37ef74e063e7a92d112bfcfdd38b72c52a50e9ca1a58a91`; IR `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-26` (IR SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`).
- **旧条件**: AIは要件・設計・PLAN・関連Markdownを自律的に起草、追加、修正、分割、統合、改名できる。Authoringの自由とCanonical化を分離し、正本化だけを`Authoring Admission Transaction`で制御する。可逆かつ既定policy内の変更は自動確定し、上位目的、安全境界、不可逆な外部契約を変更する場合だけ人間へescalateする。
- **現行L2照合先ID**: HELIXOS-L2-001, HELIXOS-L2-002, HELIXOS-L2-007, HELIXOS-L2-009。これは照合先でありIRの正式successor割当てではない。
- **現行L2条件**:
  - `docs/helix-os/L2-requirements/governance-requirements.md:515-532` — L2 governance-requirements.md:523-529は変更案保持、適用policy/scopeでの自動適用・判断、atomicity/stale/idempotency/旧shadowを定義する。L11 governance-acceptance.md:245-250は許可内外、部分更新失敗、二重再送、stale、旧shadowをoracle化する。L11:243は全件未実行、L2:531-532はruntime実証未取得。未実行は要求欠落ではない。
- **現行L11**: `docs/helix-os/L11-acceptance/governance-acceptance.md:21` (HELIXOS-L2-001), `docs/helix-os/L11-acceptance/governance-acceptance.md:411` (HELIXOS-L2-001), `docs/helix-os/L11-acceptance/governance-acceptance.md:22` (HELIXOS-L2-002), `docs/helix-os/L11-acceptance/governance-acceptance.md:412` (HELIXOS-L2-002), `docs/helix-os/L11-acceptance/governance-acceptance.md:27` (HELIXOS-L2-007), `docs/helix-os/L11-acceptance/governance-acceptance.md:417` (HELIXOS-L2-007), `docs/helix-os/L11-acceptance/governance-acceptance.md:29` (HELIXOS-L2-009), `docs/helix-os/L11-acceptance/governance-acceptance.md:419` (HELIXOS-L2-009)
- **版と処置**: HELIXOS-L2-001: 個別本文に明示なし; HELIXOS-L2-002: 個別本文に明示なし; HELIXOS-L2-007: 個別本文に明示なし; HELIXOS-L2-009: 個別本文に明示なし
- **再照合結論**: L2 governance-requirements.md:523-529は変更案保持、適用policy/scopeでの自動適用・判断、atomicity/stale/idempotency/旧shadowを定義する。L11 governance-acceptance.md:245-250は許可内外、部分更新失敗、二重再送、stale、旧shadowをoracle化する。L11:243は全件未実行、L2:531-532はruntime実証未取得。未実行は要求欠落ではない。
- **PO判断・採択状態**: 2026-09-28 PO固定revisionのL2/L11本文に照合。該当する明示候補はPO判断の対象範囲内なら採択済み、ただしIRの正式successor割当て・実行受入は未了。追加候補や本文に未採択表示がある場合は下記の対象別処置を優先する。
- **状態の区別**: 正式successor `未割当`、受入実行 `未実行・結果を主張しない`。これは意味欠落、PO採択、L3・実装完了とは別状態である。

### HIL-BR-27

- **旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:79`; asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; line SHA-256 `5817952f602eee18e355553d0da608e8c290ae7d3575ac77a0b20301d4c7dcc6`; IR `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-27` (IR SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`).
- **旧条件**: 要求定義から下流を自動走行するための設計契約とtemplate見本は固定冊数で配布せず、要求atom、設計義務、risk、状態遷移、failure境界、適用工程から必要十分な`Design Contract Portfolio`を導出する。同じ意味契約の文書量産と、見本不足をLLM自由補完で埋めることの双方を拒否する。
- **現行L2照合先ID**: HARNESS-L2-025, HARNESS-L2-026, HELIXBRAIN-L2-003, HELIXBRAIN-L2-009。これは照合先でありIRの正式successor割当てではない。
- **現行L2条件**:
  - `docs/helix-harness/L2-requirements/product-requirements.md:59-60,379-385,499-558` — Templateおよびunit/composite設計contractは要求から適用義務を導き、根拠のない完了を拒否する。
  - `docs/helix-harness/L2-requirements/product-requirements.md:533,547` — HARNESS-L2-026と025のversion_targetは1.0。
- **現行L11**: `docs/helix-harness/L11-acceptance/product-acceptance.md:342` (HARNESS-L2-025), `docs/helix-harness/L11-acceptance/product-acceptance.md:332` (HARNESS-L2-026), `docs/helix-brain/L11-acceptance/brain-acceptance.md:31` (HELIXBRAIN-L2-003), `docs/helix-brain/L11-acceptance/brain-acceptance.md:37` (HELIXBRAIN-L2-009)
- **版と処置**: HARNESS-L2-025: 1.0; HARNESS-L2-026: 1.0; HELIXBRAIN-L2-003: 個別本文に明示なし; HELIXBRAIN-L2-009: 個別本文に明示なし
- **再照合結論**: 必要十分な設計義務という意味はunit/compositeへ分けて具体化される。HARNESS-L2-026/-025は1.0候補。BRAIN Patternは候補知識であり存在だけで適用採用を決めない。固定冊数またはLLM自由補完を許す意味はない。
- **PO判断・採択状態**: HARNESS-L2-025 compositeと026 unitは2026-09-28明示集合で採択済み（1.0、適用条件保持）。要求由来設計義務をunit/compositeに分け、適用外・unknown・不足を対L11で拒否する。旧候補mappingの「adoption pending」は古い状態として退ける。受入実行/形式successor assignmentは未了。
- **状態の区別**: 正式successor `未割当`、受入実行 `未実行・結果を主張しない`。これは意味欠落、PO採択、L3・実装完了とは別状態である。

### HIL-BR-28

- **旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:80`; asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; line SHA-256 `a3477e895f8234f17ff1d2dedeb00b0ed0ce717f63bc7bbe5d583b0d51debafc`; IR `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-28` (IR SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`).
- **旧条件**: `Design Contract Portfolio`を選択済みdevelopment styleの層entry/exitへ接続し、短いsprintでも上位要求・style返却先・V-pair oracleを失わない。Discovery／PoCはScrum非内包のcase-driven S0–S4として別接続し、S4判断後だけ選択済みstyleへ収束する。
- **現行L2照合先ID**: HARNESS-L2-002, HARNESS-L2-003。これは照合先でありIRの正式successor割当てではない。
- **現行L2条件**:
  - 現行L2 owner rowを特定できない。
- **現行L11**: `docs/helix-harness/L11-acceptance/product-acceptance.md:22` (HARNESS-L2-002), `docs/helix-harness/L11-acceptance/product-acceptance.md:23` (HARNESS-L2-003)
- **版と処置**: HARNESS-L2-002: 個別本文に明示なし; HARNESS-L2-003: 個別本文に明示なし
- **再照合結論**: 旧S0–S4ラベルは現行で逐語維持されず、S4をDecide ticketへ分ける。PoC/Discoveryの起動、結果return、要求意味変更時のBackflow、Decideのhuman outcomeはHARNESS-L2-002/003:98,101,103–104とL11:22–23、PO記録:112に明示。確認した条件について未被覆を認定しない。
- **PO判断・採択状態**: 2026-09-28 PO固定revisionのL2/L11本文に照合。該当する明示候補はPO判断の対象範囲内なら採択済み、ただしIRの正式successor割当て・実行受入は未了。追加候補や本文に未採択表示がある場合は下記の対象別処置を優先する。
- **状態の区別**: 正式successor `未割当`、受入実行 `未実行・結果を主張しない`。これは意味欠落、PO採択、L3・実装完了とは別状態である。

### HIL-BR-29

- **旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:81`; asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; line SHA-256 `7b052ddde5f76436cd96990bbf6eb99a0c7d51c9f168b99d67a5badadb1dd94b`; IR `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-29` (IR SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`).
- **旧条件**: 判断系skillを汎用checklistの固定配布に限定せず、工程、domain、risk、failure mode、判断authorityに適合するversioned judgment packとして拡張する。候補skillはshadow評価と独立reviewを経るまで判断gateの強制規則へ昇格しない。
- **現行L2照合先ID**: HELIXBRAIN-L2-028, HELIXINTELLIGENCE-L2-072。これは照合先でありIRの正式successor割当てではない。
- **現行L2条件**:
  - `docs/helix-brain/L2-requirements/brain-requirements.md:29-33,110-124,150-179` — Patternの適用条件、証拠、反例、昇格状態は知識contractに属する。
  - `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:39-44` — L1からL2への機能・版対応表がINTELLIGENCE能力のscopeを定義する。
  - `docs/helix-os/L2-requirements/governance-requirements.md:294-296` — 未計測またはstaleなskillを適格としない。
- **現行L11**: `docs/helix-brain/L11-acceptance/brain-acceptance.md:68` (HELIXBRAIN-L2-028), `docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:289` (HELIXINTELLIGENCE-L2-072)
- **版と処置**: HELIXBRAIN-L2-028は知識revision/pack compatibilityの1.0契約。HELIXINTELLIGENCE-L2-072は現行個別本文上のversion_target: 1.0候補・未採択。BR-29配置A/B（HARNESS/OS配置案を維持するかINTELLIGENCEへpack候補を置くか）はR2225-01でPO判断未了。3.0学習接続は1.0前提にしない。
- **再照合結論**: INTELLIGENCE-L2-072/L11-072はversioned judgment pack候補の適用scope・shadow・独立review前の非強制を担う1.0未採択案。既存HARNESS/OS配置AとINTELLIGENCE配置BのPO判断は未了。
- **PO判断・採択状態**: BRAIN-L2-028の知識revision/compatibilityは2026-09-28採択範囲にあり。後発HELIXINTELLIGENCE-L2-072/L11-072はversioned judgment pack・shadow評価の1.0未採択候補。HARNESS/OS配置維持（A）対INTELLIGENCE配置（B）のPO判断が未了で、B案採択を推定しない。3.0学習は1.0前提にしない。
- **状態の区別**: 正式successor `未割当`、受入実行 `本照合では実行評価せず、結果を主張しない`。これは意味欠落、PO採択、L3・実装完了とは別状態である。

### HIL-BR-30

- **旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:82`; asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; line SHA-256 `8018d4ab61dd475b84ee1356de5de5137adf94bd41e975f2669c98371f1d401e`; IR `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-30` (IR SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`).
- **旧条件**: HARNESSは工程表、Design Contract Portfolio、判断pack、task分類から専門agent contractを必要時に自動生成し、runtime固有subagent定義へ射影する。専門化の根拠がないagent増殖を避け、worker/verifier/authority分離、最小context、tool/path権限、budget、停止条件を生成時に拘束する。
- **現行L2照合先ID**: HARNESS-L2-010, HARNESS-L2-011, HELIXOS-L2-005, HELIXOS-L2-018。これは照合先でありIRの正式successor割当てではない。
- **現行L2条件**:
  - `docs/helix-harness/L2-requirements/product-requirements.md:72-76,340-360` — HARNESSは工程・agent contractとartifactの入出力・scope・版・権限を定義する。
  - `docs/helix-os/L2-requirements/governance-requirements.md:57,293-305,538-552,662-680` — OSは計画案、割当、Worker実行、権限、lifecycleを分ける。
- **現行L11**: `docs/helix-harness/L11-acceptance/product-acceptance.md:205` (HARNESS-L2-010), `docs/helix-harness/L11-acceptance/product-acceptance.md:206` (HARNESS-L2-011), `docs/helix-os/L11-acceptance/governance-acceptance.md:25` (HELIXOS-L2-005), `docs/helix-os/L11-acceptance/governance-acceptance.md:415` (HELIXOS-L2-005), `docs/helix-os/L11-acceptance/governance-acceptance.md:345` (HELIXOS-L2-018)
- **版と処置**: HARNESS-L2-010: 個別本文に明示なし; HARNESS-L2-011: 個別本文に明示なし; HELIXOS-L2-005: 個別本文に明示なし; HELIXOS-L2-018: 1.0
- **再照合結論**: 役割・実行境界はHARNESS契約とOS割当/実行へ分担されるが、専門agent contractの自動生成とruntime固有subagentへの決定論的射影は候補本文に出力契約として確認できない。ticket/assignment生成をagent生成と同一視しない。
- **PO判断・採択状態**: 2026-09-28 PO固定revisionのL2/L11本文に照合。該当する明示候補はPO判断の対象範囲内なら採択済み、ただしIRの正式successor割当て・実行受入は未了。追加候補や本文に未採択表示がある場合は下記の対象別処置を優先する。
- **状態の区別**: 正式successor `未割当`、受入実行 `本照合では実行評価せず、結果を主張しない`。これは意味欠落、PO採択、L3・実装完了とは別状態である。

### HIL-BR-31

- **旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:83`; asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; line SHA-256 `3855ae08424acc6ca58c6c2e4366dc7235d91aa8b5b1c7784c64e8a8c4879d4f`; IR `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-31` (IR SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`).
- **旧条件**: 第三者workerを価格や公称性能だけで採用せず、機械判定可能なacceptance bench、blind judgeを含むfull bench、HELIX実task scorecardで品質・安全・実効costを比較し、採用、用途限定、quarantine、retireを証拠付きで決定する。
- **現行L2照合先ID**: HELIXINTELLIGENCE-L2-010, HELIXINTELLIGENCE-L2-011, HELIXLABO-L2-054, HELIXLABO-L2-055, HELIXLABO-L2-061, HELIXLABO-L2-064, HELIXOS-L2-018。これは照合先でありIRの正式successor割当てではない。
- **現行L2条件**:
  - `docs/helix-labo/L2-requirements/labo-requirements.md:151-159` — LABO-055は過去task/model classのevidenceと評価済み／未評価状態を出力する。
  - `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:39-44` — INTELLIGENCEの配置／skill比較scope表。
- **現行L11**: `docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:71` (HELIXINTELLIGENCE-L2-010), `docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:163` (HELIXINTELLIGENCE-L2-010), `docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:72` (HELIXINTELLIGENCE-L2-011), `docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:164` (HELIXINTELLIGENCE-L2-011), `docs/helix-labo/L11-acceptance/labo-acceptance.md:94` (HELIXLABO-L2-054), `docs/helix-labo/L11-acceptance/labo-acceptance.md:56` (HELIXLABO-L2-055), `docs/helix-labo/L11-acceptance/labo-acceptance.md:191` (HELIXLABO-L2-055), `docs/helix-labo/L11-acceptance/labo-acceptance.md:205` (HELIXLABO-L2-061), `docs/helix-labo/L11-acceptance/labo-acceptance.md:233` (HELIXLABO-L2-064), `docs/helix-os/L11-acceptance/governance-acceptance.md:345` (HELIXOS-L2-018)
- **版と処置**: HELIXINTELLIGENCE-L2-010: 1.0, 1.0; HELIXINTELLIGENCE-L2-011: 1.0, 1.0; HELIXLABO-L2-054: 1.0; HELIXLABO-L2-055: 1.0; HELIXOS-L2-018: 1.0
- **再照合結論**: LABO-055の水準/履歴評価に加え、HELIXLABO-L2-061はtask/oracle/context隔離、HELIXLABO-L2-064はruntime名blindと再現比較を具体化する1.0未採択候補。採用・用途限定・quarantine/retireのdecision authorityは既存ownerに残す。
- **PO判断・採択状態**: INTELLIGENCE-010/011、OS-018、LABO-055とLABO-059は2026-09-28固定集合で採択済み。LABO-059は品質優先比較/同条件cohort/総費用評価を所有する。後発LABO-061（1.0未採択）はpublic task/hidden oracle・task履歴/fixture隔離、LABO-064（1.0未採択）は候補名blind/再現条件、両者の実施は未採択。資格scope別8軸benchを全通常Workerへ一般化しない。
- **状態の区別**: 正式successor `正式successor未割当（候補登録はsuccessor割当てではない）`、受入実行 `候補段階の受入未実行・結果を主張しない`。これは意味欠落、PO採択、L3・実装完了とは別状態である。

### HIL-BR-32

- **旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:84`; asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; line SHA-256 `3118efe1554c4ca3438938e76112b255450c927e1b10a515ec4b3216e505b830`; IR `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-32` (IR SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`).
- **旧条件**: Claude/Codex以外の定額worker runtime（Kimi/Grok等）をprecedenceを曲げずproposal-only workerとして接続し、実行を隔離worktree/sandbox内に限定してrepository本体、`.helix/` state、harness DB、credentialへ到達させない。秘密・機密を含む作業の第三者runtime委譲を禁止する。
- **現行L2照合先ID**: HELIXOS-L2-018, HELIXSECURITY-L2-003, HELIXSECURITY-L2-004, HELIXSECURITY-L2-007, HELIXSECURITY-L2-008, HELIXSECURITY-L2-009, HELIXSECURITY-L2-029, HELIXSECURITY-L2-031。これは照合先でありIRの正式successor割当てではない。
- **現行L2条件**:
  - `docs/helix-os/L2-requirements/governance-requirements.md:57,219-242,293-305,538-552,672-680` — OSは割当・runtime、資源、Worker実行を制約する。
  - `docs/helix-security/L2-requirements/security-requirements.md:76-146` — SECURITYのsource・data・credential・egress・runtime契約を適用し、各操作のidentityを照合する。
- **現行L11**: `docs/helix-os/L11-acceptance/governance-acceptance.md:345` (HELIXOS-L2-018), `docs/helix-security/L11-acceptance/security-acceptance.md:27` (HELIXSECURITY-L2-003), `docs/helix-security/L11-acceptance/security-acceptance.md:28` (HELIXSECURITY-L2-004), `docs/helix-security/L11-acceptance/security-acceptance.md:31` (HELIXSECURITY-L2-007), `docs/helix-security/L11-acceptance/security-acceptance.md:32` (HELIXSECURITY-L2-008), `docs/helix-security/L11-acceptance/security-acceptance.md:33` (HELIXSECURITY-L2-009), `docs/helix-security/L11-acceptance/security-acceptance.md:89` (HELIXSECURITY-L2-029), `docs/helix-security/L11-acceptance/security-acceptance.md:104` (HELIXSECURITY-L2-031)
- **版と処置**: HELIXOS-L2-018: 1.0; HELIXSECURITY-L2-003: 個別本文に明示なし; HELIXSECURITY-L2-004: 個別本文に明示なし; HELIXSECURITY-L2-007: 個別本文に明示なし; HELIXSECURITY-L2-008: 個別本文に明示なし; HELIXSECURITY-L2-009: 個別本文に明示なし; HELIXSECURITY-L2-029: 1.0; HELIXSECURITY-L2-031: 1.0, 1.0
- **再照合結論**: 既存SECURITY/OS分担を維持する。SECURITY-L2-029候補は主契約外runtimeのopt-out・機密送信制約、SECURITY-L2-031候補は追加runtimeをproposal-onlyにし正本へ直接アクセスさせず通常ownerへ戻す境界を具体化する。
- **PO判断・採択状態**: 2026-09-28 PO固定revisionのL2/L11本文に照合。該当する明示候補はPO判断の対象範囲内なら採択済み、ただしIRの正式successor割当て・実行受入は未了。追加候補や本文に未採択表示がある場合は下記の対象別処置を優先する。
- **状態の区別**: 正式successor `正式successor未割当（候補登録はsuccessor割当てではない）`、受入実行 `候補段階の受入未実行・結果を主張しない`。これは意味欠落、PO採択、L3・実装完了とは別状態である。

### HIL-BR-33

- **旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:85`; asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; line SHA-256 `5e1c5b4e6d83e4aaa36437955baf35e30c8e4f835831f9e9c7c2fdead1ed760f`; IR `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-33` (IR SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`).
- **旧条件**: 配布はmarketplace型パッケージ仕様（正本index、手編集禁止の生成index、first-party/third-party分離、免責記載）で定義し、配布surfaceの実切替は既存cutover承認境界に従う。
- **現行L2照合先ID**: HARNESS-L2-006, HARNESS-L2-010, HARNESS-L2-011, HELIXOS-L2-006, HELIXOS-L2-021, HELIXOS-L2-030。これは照合先でありIRの正式successor割当てではない。
- **現行L2条件**:
  - `docs/helix-harness/L2-requirements/product-requirements.md:31-33,57,165-171,340-348` — 外部製品と版付きパックの対象範囲を定義する。
  - `docs/helix-os/L2-requirements/governance-requirements.md:29,170-185,243-252,459-492` — OSは内部機構と外部製品を区別し、source・権利・artifact・配布・切替状態を記録する。
- **現行L11**: `docs/helix-harness/L11-acceptance/product-acceptance.md:26` (HARNESS-L2-006), `docs/helix-harness/L11-acceptance/product-acceptance.md:205` (HARNESS-L2-010), `docs/helix-harness/L11-acceptance/product-acceptance.md:206` (HARNESS-L2-011), `docs/helix-os/L11-acceptance/governance-acceptance.md:26` (HELIXOS-L2-006), `docs/helix-os/L11-acceptance/governance-acceptance.md:416` (HELIXOS-L2-006), `docs/helix-os/L11-acceptance/governance-acceptance.md:366` (HELIXOS-L2-021), `docs/helix-os/L11-acceptance/governance-acceptance.md:480` (HELIXOS-L2-030)
- **版と処置**: HARNESS-L2-006: 個別本文に明示なし; HARNESS-L2-010: 個別本文に明示なし; HARNESS-L2-011: 個別本文に明示なし; HELIXOS-L2-006: 個別本文に明示なし; HELIXOS-L2-021: 1.0
- **再照合結論**: OS-L2-030の元節と末尾追補は、正本indexのrevision/digestから生成indexを決定論的に導出し、生成index単体の手編集を拒否するBR33/HR24/HAC/HAT条件を明記した。first/third-party分離、免責、cutover authority境界は元030節に保持される。r2 receiptは旧92 atom/28 pendingを保持し、4原文atomを追加した。
- **PO判断・採択状態**: OS-021は2026-09-28採択済み。後発OS-030（1.0候補、未採択。#2228 r2）はcanonical index→generated index決定論的生成、生成index単体の手編集拒否を既存package/rights/distribution boundaryに追補し、旧source 4 atomを加え96 total/28 pending保持と記録。first/third-party区分、disclaimer、existing cutover authorityは本文で照合し続け、候補から採択/配布許可を作らない。
- **状態の区別**: 正式successor `未割当（登録はsuccessor割当てではない）`、受入実行 `未実行。候補L11は要求段階oracleに限る`。これは意味欠落、PO採択、L3・実装完了とは別状態である。

## W1まとめ

- W1母集団33/33を旧source行SHA・現行L2根拠行・現行L11の行位置へ対応した。該当する現行L2/L11文書のSHA-256は上記に固定。旧runtime・CI・testは実行せず、L11も実行していない。
- 2026-09-28採択済み候補の意味を、古いmapping上の`候補_mapped_adoption_pending`から「採択済み／IR 正式successor未割当」へ戻さない。後発候補は採択未了として分離する。
- 真の意味残差とみなす条件は、単なる正式successor不在・旧field名・schema・旧runtime不在ではなく、原文要件の保証・反例・authority/版条件が現行L2/L11に見つからず、PO判断記録にも変更記録がない場合に限定した。
- W2は次の照合単位として別途続行する。
