---
title: "HELIX L4 基本設計 — Python 意味コアと Node 実行境界の capability 境界"
layer: L4
kind: add-design
status: draft
created: 2026-08-08
updated: 2026-08-08
owner: Claude / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-PSC-01
related_l3: docs/design/helix/L3-requirements/ai-vision-design-harness-engine.md
pair_artifact: docs/test-design/helix/L4-python-semantic-core-node-boundary-system-test-design.md
next_pair_freeze: L5
requirements:
  - VDH-FR-001
  - VDH-FR-016
  - VDH-FR-017
github_issue_id: 230
---

# HELIX L4 基本設計 — Python 意味コアと Node 実行境界の capability 境界

Issue #230 の capability を、ADR-010（accepted）の層別 authority に基づき隣接 capability との
境界（owner 分離）と system assertion 対象で定める。route は `forward_full_v` 上の
Design HARNESS foundation であり、L4/L5 pair-freeze 後に L6 実装 ↔ L7 TDD closure へ進む。

## §0 用語規約（ADR-010 準拠、旧呼称の是正）

- **Python 意味コア（semantic core）**: activation / schema / spec / trace / impact / schedule /
  review / build / validation の意味判断の恒久正本。旧「proposal-only worker」「reject 前提の
  暫定 worker」という呼称・位置づけは ADR-010 で廃止済みであり、本設計以降の文書は
  「意味コア」で統一する。
- **Node 実行境界（transactional boundary）**: browser 実行（Playwright / axe / Lighthouse /
  VRT）、provider 呼び出し、schema・authority・policy・HEAD・digest の再検証、Git / GitHub、
  atomic promotion、`harness.db` transaction の唯一の担い手。
- 両者は**同格の層別権威**であり、一方を他方の全面上位として記述しない。
- 既存 L5/L6（`docs/design/helix/L5-detail/python-worker-runtime.md` /
  `docs/design/helix/L6-function-design/python-worker-runtime.md`）の旧 proposal-only 呼称は
  compatibility debt であり、L5 pair-freeze 時に本 §0 の用語へ是正する（機能契約の
  JSON Lines envelope・digest 検証・quarantine 構造は再利用する）。

## §1 capability 境界（owner 分離）

| capability | primary owner | 本設計の関係 |
|---|---|---|
| Python 意味コアの semantic contract（意味判断の入出力 schema・決定性・digest）と Node 実行境界の revalidation / transaction（VDH-FR-017） | **#230（本設計）** | primary |
| intake receipt（source filename / digest / 211-file inventory / atom disposition の固定、VDH-FR-001） | **#230（本設計）** | primary（intake の意味判定は Python、receipt の永続化は Node） |
| hybrid document sidecar（既存 document slot への typed contract 付帯、独立 engine / 別 authoring DB 禁止、VDH-FR-016） | **#230（本設計）** | primary（sidecar は authoring source 側、`harness.db` は再構築可能 read-model projection のみ） |
| 外部 AI worker 共通 admission（WCC-FR-01、descriptor 検証） | #194（着地済み `src/runtime/worker-descriptor-admission.ts`） | **別責務**。Design HARNESS 意味 authority として再利用・混載しない |
| Canonical Design IR intake control plane | #257 | downstream（本 foundation の semantic contract を前提とする） |
| delegated UI capsule / route lifecycle | #212 | consumer（本 foundation の current receipt を consumer trace として要求） |
| screen/frontend 工程の artifact receipt admission | #180 | consumer（本 foundation を含む 9 slice exact set を current HEAD で検証） |
| harness.db スキーマ・projection 基盤 | PLAN-L7-44 系（既存 state-db） | 本設計はテーブル追加時に registry-generated DDL / IMMUTABLE 規律へ従属する |

## §2 分離原則（ADR-010 の機械化対象）

1. **意味判定重複 0**: Node は Python の意味結果を再実装しない。Node が行うのは
   schema / authority / policy / HEAD / digest の再検証のみ（意味の再計算ではなく形式検証）。
2. **Python の authoritative write 0**: Python へ DB path / credential / repository / `.helix/` を
   渡さない。Python はネットワーク default deny。Python 出力の command / SQL / absolute path /
   code を実行しない。
3. **Node の未再検証 commit 0**: Node は Python の semantic result envelope を versioned contract
   （schema_version + result_digest + provenance）で再検証せずに `harness.db` / Git / GitHub へ
   commit しない。検証失敗は quarantine（fail-close、commit 0）。
4. **別 authoring DB 禁止**: semantic contract は既存 hybrid document slot の sidecar として
   保持し、独立文書体系・独立 engine を作らない。`harness.db` は authoring source を
   逆書きしない再構築可能 read-model projection とする。
5. **決定性**: 同一 source + 同一 contract version の意味結果は deterministic であり、
   semantic result と Node transaction receipt は別々に再現可能とする。
6. **証跡保全**: browser evidence（Playwright / axe / Lighthouse / VRT）の偽装・改ざんは
   Node transaction commit 前に検知し fail-close する（fail-close 対象の全列挙は §3
   SA-PSC-03 を正本とする）。

## §3 system assertion（L4↔L9 対象）

| SA | assertion | 検証面（L9 固有粒度） |
|---|---|---|
| SA-PSC-01 | 実 hybrid document（repo 内の実 doc）と実 sidecar 一式を入力に、Python 意味コア実行→envelope 生成→Node 再検証→`harness.db` projection までの全経路を通し、意味判定重複 0・未再検証 commit 0 を end-to-end で assert する | system（実 doc・実 contract、合成 fixture 不使用） |
| SA-PSC-02 | Python プロセスへ渡る実行環境（env / argv / cwd）に DB path・credential・repository write 経路・`.helix/` が含まれないことと、ネットワーク default deny を実 spawn 経路で assert する | system（実 spawn 構成の検査、型レベル検証と区別） |
| SA-PSC-03 | source / sidecar / schema / HEAD / digest の drift、別 authoring DB、reverse write、browser evidence 偽装の各違反を実 gate 経路（doctor/lint 配線後）で fail-close することを assert する | system（実 gate 配線経由） |
| SA-PSC-04 | 実 source ファイル一式（211-file inventory）を入力に、Python 意味コアが source filename / digest / inventory 差異 / atom disposition を intake receipt へ固定し、Node が receipt を再検証して `harness.db` projection へ commit するまでの全経路を end-to-end で assert する（VDH-FR-001） | system（実 inventory・合成 fixture 不使用） |

## §4 実装スライス方針（L5 で確定、粒度の宣言のみ）

#177/#209 と同じ規律（TDD・2 ラウンド adversarial review・digest pin 同時更新）で進める。

1. **semantic contract 層（Node 側）**: semantic result envelope / sidecar descriptor の
   versioned schema と Node revalidator（形式検証のみ、意味の再実装なし）。
2. **Python 意味コア骨格**: 別 root の versioned contract 配下に Python core を新設し、
   決定的な意味結果（activation / schema 検証から開始）を envelope で返す。
3. **Node transaction consumer**: 再検証済み envelope の `harness.db` projection と
   atomic promotion（registry-generated DDL、operations 台帳で冪等性）。
4. **sidecar / intake receipt**: hybrid document sidecar の canonicalize と
   VDH-FR-001 intake receipt の固定。
5. **gate 配線**: SA-PSC-03 の実 gate（doctor/lint）接続。

## §5 非 scope

- #194 worker-descriptor-admission の変更・再利用（別責務のまま維持）。
- 旧 W1-W3a Python runtime の bulk port（ADR-009/010 で禁止）。
- browser 実行系（Playwright / axe / Lighthouse / VRT）の実装本体（Node 境界の責務宣言のみ。
  実装は #211/#180 系の後続）。
- Canonical Design IR の意味設計（#257 owner）。

## §6 Design Reality Binding 契約

本 doc は設計フェーズの正本であり、runtime asset は実装スライスで生成する。到達性 witness は
実装スライスの test 着地時に追記する（着地前に到達性を主張しない）。

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [],
  "assets": [],
  "failure_reachability": []
}
```
