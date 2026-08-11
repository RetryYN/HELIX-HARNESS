---
plan_id: PLAN-RECOVERY-50-doctor-drop-home-session-scan
title: "PLAN-RECOVERY-50 (recovery): doctor の gate 経路から home session 履歴の走査を外す"
kind: recovery
layer: cross
drive: agent
status: draft
route_mode: recovery
entry_signals:
  - "po_directive:2026-08-11 PO 指示「別途イシュー回収をしてくれ」。Issue #495（helix doctor がセッション履歴サイズに比例して上限なく遅くなる）を自走で解消する"
created: 2026-08-11
updated: 2026-08-11
owner: Claude / TL
github_issue_id: 495
engineering_discipline_required: true
behavior_contract_id: DB-PROJECTION-INGESTION-001
responsibility_owner: doctor-db-projection-ingestion
change_slice: atomic
refactor_step: not_applicable
legacy_retirement_state: not_applicable
no_code_decision: modify
ddd_modeling_decision: policy
backprop_decision: not_required
backprop_decision_reason: "db-projection-ingestion / drive-db-registration の判定内容と必須表集合を変更しない。変更するのは doctor が gate 判定に不要な home ディレクトリ走査を実行するか否かだけであり、要件・設計契約の追加ではない"
contract_preconditions: "checkDbProjectionIngestion が projectRuntimeModelTelemetryForDoctor を呼び、~/.claude/projects と ~/.codex/sessions を毎回全走査して model_runs へ overlay する。走査対象は repository state ではなく home 配下の session 履歴であるため、doctor の実行時間が repository と無関係に単調増加し上限が無い"
contract_postconditions: "doctor の gate 経路から当該走査を外す。db-projection-ingestion の判定は rowCounts(db) のみに依存し、その必須表集合は不変。drive-db-registration の modelRuns > 0 は repo-local rebuild が投影する行だけで満たされる。telemetry の恒久 ingest は helix telemetry scan が単独で担う"
contract_invariants: "analyzeDbProjectionIngestion の必須表・evidence-gated 表の集合を 1 件も追加・削除しない。drive-db-registration の modelRuns / modelOrphans 判定式を変更しない。projectTokenUsage の投影内容は不変で、U-DBPROJ-PROV-03 が同一 fixture で同一行を検証し続ける"
contract_failures: "U-DOCTORSCAN-001 が、投影可能な fixture を HELIX_CLAUDE_SESSIONS_DIR へ置いた状態で checkDbProjectionIngestion 実行後に role='session' 行を検出したら fail する"
tdd_red_required: true
red_at: "2026-08-12T00:16:12Z"
green_at: "2026-08-12T00:17:05Z"
mutation_oracle_evidence: "seeded defect を checkDbProjectionIngestion へ注入し（削除した projectRuntimeModelTelemetry(db) の呼び出しを復元＝現行の欠陥を復元）、tests/slow/doctor.test.ts::U-DOCTORSCAN-001 が 1 failed / 1 passed で killed になることを実測した（2026-08-12T00:16:12Z）。復元後 U-DBPROJ-PROV 系 2 件 passed（2026-08-12T00:17:05Z）。U-DOCTORSCAN-001 は同一 fixture が単体 overlay では 1 行入ることを先に assert しているため、「fixture が空で 0 件」との取り違えが起きない"
complexity_effect: net_neutral
parent_design: docs/design/harness/L6-function-design/function-spec.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/function-spec.md, oracle_id: U-DOCTORSCAN-001, test_path: tests/slow/doctor.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — overlay を観測する gate の全数特定" }
  - { role: se, slot_label: "SE — gate 経路からの走査除去と関数名の是正" }
  - { role: qa, slot_label: "QA — 走査しないことの負例 oracle と前後実測" }
  - { role: tl, slot_label: "TL — 契約変更（U-DBPROJ-PROV-03 の doctor 束縛解除）の妥当性判定" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-50-doctor-drop-home-session-scan.md, artifact_type: markdown_doc }
  - { artifact_path: src/doctor/index.ts, artifact_type: source_module }
  - { artifact_path: tests/slow/doctor.test.ts, artifact_type: test_code }
dependencies:
  parent: null
  requires: []
  blocks:
    - issue:495
review_evidence: []
---

# PLAN-RECOVERY-50：doctor の gate 経路から home session 履歴の走査を外す

## §1 なぜ recovery か

`helix doctor` の実行時間が、repository の状態ではなく **開発者の home 配下に溜まった session 履歴のサイズ**に比例して増える。履歴は使うほど増え続けるため上限が無い。

Issue #495 は「想定される方向（未検証）」として走査上限・キャッシュ・gate としての必要性の再評価を挙げていた。本 PLAN はその 3 番目を実測で確定させた結果、**上限やキャッシュを設計する前に走査そのものを外せる**と判断したものである。

## §2 実測

### §2.1 起票から 2 日で +46%

`loadRuntimeSessionUsage` を直接計測（Node v22.23.1）。

| | 起票時 (2026-08-09) | 再測 (2026-08-11) |
|---|---|---|
| 走査時間 | 75,134ms | **109,585ms** |
| 投影行数 | — | 2,975,911 |

「上限が無く単調に悪化する」という起票時の指摘が 2 日で実測として現れた。

### §2.2 コストの 99.3% は Codex 側

| 対象 | 時間 | 行数 | ディスク | ファイル数 |
|---|---|---|---|---|
| `~/.claude/projects` | 768ms | 100,753 | 582M | 863 |
| `~/.codex/sessions`（差分） | **108,817ms** | 2,875,158 | **13G** | 12,384 |

## §3 overlay を観測する gate は 1 つも存在しなかった

除去してよいことは 3 点で確定する。**1 点でも成立しなければ除去できない**ので、すべて実測した。

### §3.1 呼び出し元の gate は `model_runs` を参照しない

走査を呼んでいるのは `checkDbProjectionIngestion`（`src/doctor/index.ts`）だが、その判定は `analyzeDbProjectionIngestion(rowCounts(db))` だけである。`src/lint/db-projection-ingestion.ts` 全文で `model_runs` の出現数は **0**。必須表一覧にも evidence-gated 表一覧にも含まれない。

### §3.2 `model_runs` を見る唯一の gate は overlay より前に走る

`src/lint/drive-db-registration.ts` が `stats.modelRuns <= 0` で `missing_model_runs` を出すため、`model_runs` は別 gate の検査対象ではある。ただし `runDoctor` 内の呼び出し順序は

```
checkDriveDbRegistration(deps.repoRoot, sharedProjectionDb)   ← 先
checkDbProjectionIngestion(deps.repoRoot, sharedProjectionDb) ← 後（ここで overlay）
```

であり、**drive-db-registration は overlay された行を一度も見ない**。

加えて要求は `> 0` のみである。home 走査を一切行わず repo-local の `rebuildHarnessDb` だけで構築した結果 **1,592 行**が入るため、除去後も条件は満たされる。

`modelOrphans` は `COALESCE(m.role,'') <> 'session'` で session 行を除外しているため、session 行の増減は orphan 判定に影響しない。

### §3.3 共有 projection は `:memory:` で破棄される

`sharedProjectionDb = openHarnessDb(":memory:", ...)` であり、`runDoctor` 末尾で `close()` される。overlay した 297 万行は **どこにも永続化されない**。

### §3.4 他の読み手

| 読み手 | 依存 | 影響 |
|---|---|---|
| `model-evaluation`（success_rate） | `model_runs.plan_id` → `plan_registry` の join | session 行は `plan_id=''` で join しない |
| `l3-g3-freeze-packet-v2` | `evidence_path LIKE '.helix/evidence/pair-agent/%'` | session 行は `evidence_path=sessionId` で不一致 |
| `visualization-read-model` | `model_runs.total`（表示のみ） | doctor の in-memory 値は表示に使われない |
| `checkTelemetryClosure` | docs を読む（DB 非依存） | 影響なし |

telemetry の恒久 ingest は `helix telemetry scan`（`src/cli.ts`、harness.db への永続書き込み）が単独で担う。同 command は `loadRuntimeSessionUsage` + `projectTokenUsage` を直接呼ぶため、doctor 側の関数に依存しない。

## §4 変更内容

### §4.1 gate 経路からの除去

`checkDbProjectionIngestion` から `projectRuntimeModelTelemetryForDoctor(repoRoot, db)` の呼び出しを削除する。

### §4.2 関数名の是正

doctor が呼ばなくなる以上 `...ForDoctor` は誤解を招く residue になるため、`projectRuntimeModelTelemetry(db: HarnessDb)` へ改名する。第 1 引数 `_repoRoot` は元から未使用だったため同時に落とす。関数自体は削除しない（`U-DBPROJ-PROV-03` が投影内容を検証し続ける）。

`docs/design/harness/L6-function-design/function-spec.md` と `docs/test-design/harness/L7-unit-test-design.md`（`U-DBPROJ-PROV-03` の対象関数名）、および両者の binding を検査する `tests/vmodel-pair.test.ts` を同時に更新する。新規 oracle は canonical な `docs/test-design/harness/L8-unit-test-design.md` へ登録する（L7 は canonical reuse 対象外の legacy 投影であり、oracle id も 3 桁書式が必須のため既存の `U-DBPROJ-PROV-0x` 系とは別 family とする）。

## §5 検証

### §5.1 負例 oracle `U-DOCTORSCAN-001`

投影可能な fixture を `HELIX_CLAUDE_SESSIONS_DIR` へ置いたうえで `checkDbProjectionIngestion` を実行し、`model_runs` の `role='session'` 行が **0 件**であることを固定する。

**「走査しなかった」と「fixture が空だった」を取り違えないよう**、同一 fixture が単体 overlay では 1 行入ることを先に assert している。この 2 段が無いと、fixture 生成が壊れても緑になる。

### §5.2 mutation

削除した呼び出しを復元する seeded defect（＝現行の欠陥そのもの）を注入すると

```
× U-DOCTORSCAN-001: db-projection-ingestion は home の runtime session 履歴を走査しない
 Tests  1 failed | 1 passed | 89 skipped (91)
```

**killed**。復元後 2 passed。

### §5.3 効果（同一コーパスでの前後比較）

`checkDbProjectionIngestion` 単独の実測。

| | 実測値 |
|---|---|
| 除去前 | **142,386ms** |
| 除去後 | **7,534ms** |

**18.9 倍**、1 回あたり約 134.9 秒の短縮。除去後の値は home 履歴サイズに依存しない。

## §6 範囲外

### §6.1 CI への影響

CI runner に session 履歴は無いため、起票時の「CI には無関係」は維持される。本変更は doctor の実行内容を減らす方向のみで、CI が遅くなる経路は無い。CI 実測の再取得は行っていない。

### §6.2 doctor の残りの支配項

本 PLAN は `checkDbProjectionIngestion` の 1 項目だけを扱う。除去後も同 check には repo-local rebuild の 7.5 秒が残り、doctor 全体には他の check がある。全体の再プロファイルと次の支配項の特定は別 Issue とする。

### §6.3 telemetry ingest の運用

`helix telemetry scan` をいつ誰が実行するかという運用設計には触れない。本 PLAN は doctor が毎回それを肩代わりするのをやめるだけである。
