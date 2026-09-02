---
title: "Cursor Cloud Agent environment admission機能設計"
layer: L6
artifact_type: design
status: confirmed
created: 2026-09-02
updated: 2026-09-02
owner: SE / Security
plan: docs/plans/PLAN-RECOVERY-76-cursor-cloud-environment-admission.md
pair_artifact: docs/test-design/helix/L8-cursor-cloud-environment-admission-unit-test-design.md
related_l3: docs/design/helix/L3-requirements/technology-environment-reconciliation-requirements.md
github_issue_id: 1356
behavior_contract_id: TER-CURSOR-CLOUD-ENV-001
responsibility_owner: provider-environment-admission
---

# Cursor Cloud Agent environment admission機能設計

## 目的

Cursor Cloud AgentのBuild環境をHELIXのNode authorityへ束縛する。provider固有の第二security coreは作らず、
Technology Environment Reconciliation、supply-chain、host side-effect境界をrepo-owned adapterへ投影する。

## 決定

- Cursor公式の`.cursor/environment.json`から`.cursor/Dockerfile`を選択する。
- base imageは`node:24.20.0-bookworm-slim`のmulti-platform manifest digestへ固定する。
- install scriptはNode範囲を再検証してから`npm ci`、typecheck、build、targeted test、`helix status`を実行する。
- `nvm`、runtime download、`/usr/local`等のhost-global shim、predictable `/tmp`、warning継続を禁止する。
- Build失敗時はCursorの既存active Buildが維持されるprovider semanticsを利用し、失敗候補をactiveへ昇格しない。

## Authority導出

```text
package.json engines.node
  -> digest-pinned Debian/Node image
  -> environment.json build selection
  -> install-time runtime range assertion
  -> npm lockfile / build / targeted oracle / status
  -> Cursor Build success candidate
```

公式仕様上、Buildはdisk stateだけを保存し、install shellのexportはagent sessionへ継続しない。このためPATH shim案を
compatibilityとして残さず撤去し、runtime自体をDockerfileで固定する。

## Failure

wrong／欠落digest、Node 24.15未満または25以上、mutable download、host-global write、native fallback、検証command欠落は
すべてBuild前CIで拒否する。credential、Cursor API key、GitHub tokenをrepository、image、logへ格納しない。

## 外部仕様証拠

- Cursor Cloud Environment Setup（2026-09-02確認）: `.cursor/environment.json`のDockerfile route、installの冪等性、
  Buildはdisk stateのみ保存しexportを継続しないことを確認した。
- Node official image manifest（2026-09-02確認）: `24.20.0-bookworm-slim`を
  `sha256:ba849c60be29959425b8734d57b8b4b7d56f98edd9504c9af091d5281095a71e`へ固定した。
