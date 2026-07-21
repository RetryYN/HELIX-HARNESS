# L3 rebaseline G1/G3 freeze packet (snapshot 固定承認資料)

状態: 失効・要再生成
対象 PLAN: `PLAN-L3-20-infinity-loop-g3-freeze`
作成: 2026-07-21 (Claude / TL)

> 2026-07-22 PO指示により、別AIの同一HEAD文脈レビューと`harness.db`追従確認が
> merge必須要件へ追加された。本packetのsnapshot/digestは変更前のため失効しており、
> `PLAN-L3-21-contextual-pr-review-db-convergence`の独立review完了後に再生成する。
> 以下は監査用の旧snapshotとして保持し、承認には使用しない。

本 packet は PO 判断 2026-07-20 (工程を L3 へ戻して全面改修) の成果を一つの snapshot へ bind し、
PO の一回承認で G1 (L1 要求承認) / G3 (L3 要件承認) freeze を成立させるための承認資料である。
承認は action-binding (不可逆) であり、AI は本 packet の提示までを行い、承認自体を代行しない。

## 1. Snapshot 固定 (binding)

- レビュー済み L3 material snapshot: `6bd3d8e060b12a5d8d25d9ff21befe728d23f9a4`
  (PR #77 / #78 / #79 merge 済み。#77=L3-16/17/18 設計本体、#78=Issue closure contract、#79=L3-19 GitHub 運用投影)
- packet review HEAD: `cea9ebac5a86952b30b57d5427a8293f7516307d`
  (PR #86 merge 済み。material snapshot 以降に追加された本 packet と PLAN-L3-20 を含む。§2 の要件・設計・acceptance digest は material snapshot から不変)
- requirements 正本: `docs/governance/helix-harness-requirements_v1.3.md`
  digest = `sha256:2db16524916a9bb1feac8b7aef0432bb3d3e68e813c869d35f15a0ae19d252d5`
  (v1.2 は compatibility reference へ降格済み、supersession は双方向)

## 2. 承認対象 FR 集合と成果物 digest

| 領域 | FR | design doc | acceptance doc |
| --- | --- | --- | --- |
| Scrum→V 逆流 entity モデル | SRV-FR-101〜112 | `docs/design/helix/L3-requirements/scrum-reverse-entity-model.md`<br>`sha256:d6ac0ebe30737d0534ccb98943b3e277eb9a551236761baaae8e6b77b14b04ac` | `docs/test-design/helix/scrum-reverse-entity-model-acceptance.md`<br>`sha256:b076ebdaadef5a2e01d1059db903a2f95cbc659339f314dfbd7f9a87b2299ad4` |
| lifecycle 4 状態分離 | LSS-FR-01〜08 | `docs/design/helix/L3-requirements/lifecycle-state-separation.md`<br>`sha256:a4077092ff5f268cfc58af2823573565f1144f3d88b696b9f59cf20112ff857b` | `docs/test-design/helix/lifecycle-state-separation-acceptance.md`<br>`sha256:73a371eadd006c4f850cc0129f8c6cdf2b44c17d8356b94164cf253711c4f60c` |
| worker 共通契約 | WCC-FR-01〜08 | `docs/design/helix/L3-requirements/worker-common-contract.md`<br>`sha256:20186dde0ca6abdc0d0d41bbf1c040ed2116d2fa01dc4c55119267175dd0be61` | `docs/test-design/helix/worker-common-contract-acceptance.md`<br>`sha256:70c97570fb4b6e2fadb9dd8486be67a6439f6ccfae74026c18c4345df23a1033` |
| GitHub 運用投影 | GOP-FR-01〜14 | `docs/design/helix/L3-requirements/github-operations-projection.md`<br>`sha256:ddcb11850eef5181dbc705224e59a2451ff04708b56bc9c437b687355c5d7e46` | `docs/test-design/helix/github-operations-projection-acceptance.md`<br>`sha256:7638e322a28a3bb866704feb2fbf431c1d1afba8154883f6f679bb5e52bb9600` |

## 3. 承認により成立する状態

1. G1: L1 要求 (v1.3 §が参照する BR/NFR 系) を承認済みとして freeze する。
2. G3: L3 要件 (上記 FR 集合 + v1.3 本文 §4.1 / §4.9 / §4.10 / §6) を承認済みとして freeze する。
3. PLAN-L3-15〜19 を confirmed へ昇格し、各 review_evidence の verdict
   `advisory_approve_pending_l3_confirm` を `approve_after_fixes` へ同一 commit で昇格する
   (対象 = 各 PLAN frontmatter の該当 1 行ずつ。silent overwrite ではなく本 packet を根拠 cite する)。
4. 以降の L4〜L6 design descent と G4〜G6 pair freeze、L7 実装 wave を AI 自走で開始する
   (不可逆操作は従来どおり action-binding 境界)。

## 4. 既知の残 debt (承認範囲から明示除外)

- v1.2 compatibility reference の段階的日本語化・整理 (design-language baseline)。
- branch-kind `add/` × required Reverse pairing の guard 矛盾 (improvement gap 記録済み)。
- vitest 2→4 / vite / esbuild major 移行 (Issue #85、Dependabot #82/#83/#84)。
- Dependabot alerts が main で検出中の依存脆弱性 (critical 1 / high 1 / moderate 3)。
- 予約名衝突: Issue #30 の `PLAN-L3-15-infinity-loop-g3-freeze` は本 PLAN (L3-20) が正式名。

## 5. 承認方法 (PO)

Issue #30 (または本 packet を bundle する PR) へ、以下を含む承認コメントを記録する:

```
G1/G3 approve
snapshot: 6bd3d8e060b12a5d8d25d9ff21befe728d23f9a4
packet: docs/governance/l3-rebaseline-g3-freeze-packet.md
```

承認記録後、AI が §3 の昇格 commit と freeze 完了処理 (Forward 再開) を自走する。
