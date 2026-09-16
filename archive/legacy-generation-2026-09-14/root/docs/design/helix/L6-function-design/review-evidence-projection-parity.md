---
title: "review-evidence projection の環境非依存化（tracked 集合判定）機能設計"
layer: L6
kind: recovery
status: draft
created: 2026-09-05
updated: 2026-09-05
owner: Claude / TL
plan: docs/plans/PLAN-RECOVERY-1548-review-evidence-projection-parity.md
pair_artifact: docs/test-design/helix/L8-review-evidence-projection-parity-unit-test-design.md
---

# review-evidence projection の環境非依存化（tracked 集合判定）機能設計

## 1. 責務と非責務

本設計は `rebuildHarnessDb` の `projectReviewEvidenceRegistry` が生成する review-evidence 由来の
finding を、**HEAD tree に対して決定的**にする。過去 PLAN の `review_evidence` は書き換えない。

- 判定対象は `green_commands[].evidence_path` の分類だけである。green command の内容、`test_runs` 行、
  tracked evidence の parse 結果（`test_cases` / `test_results`）は不変。
- `.helix/harness.db` を evidence として引用する過去 PLAN の provenance は保全する（付け替えない）。
- logical DB receipt の schema、policy、canonicalization contract は変更しない。

## 2. 是正する欠陥（Issue #1548）

`projectStructuredGreenCommandCaseEvidence` は `existsSync(fullPath)` で evidence の有無を判定していた。
`.helix/harness.db` のような gitignore 済み runtime locator は、worktree では存在し clean clone（CI）では
存在しないため、同一 HEAD でも finding 数が +8 変わり、`helix-l3-g3-logical-db-bootstrap-receipt.v2` の
`projection_digest` が環境ごとに割れた。`workspace_attestation` は `--untracked-files=all` でも ignore 済み
ファイルを見ないため clean=true のまま projection だけが揺れ、PR #1547 の独立 receipt が ready 後の
admission で `review_receipt_invalid_or_stale`（実体は db provenance 不一致）となった。

```
同一 HEAD c4092f6e2
  worktree（harness.db あり）   projection bb778868…  findings 2047
  clean clone（なし）           projection 4c3b77c3… / 7c86569…  findings 2055（+8: green-command-evidence-missing）
  checkpoint digest             一致
```

## 3. 関数設計

| 関数 | シグネチャ | 事前条件 | 事後条件 | 不変条件 | oracle |
|---|---|---|---|---|---|
| `loadTrackedPathSet` | loadTrackedPathSet(repoRoot, exec?) => ReadonlySet<string> \| null | `exec` は git を起動できる。 | git 管理外 root（stderr が `not a git repository`）だけ null。git repo では HEAD tree（`git ls-tree -r -z --name-only HEAD`）の path 集合を返す。 | index（`git ls-files`）を正本にしない。git 起動不能・dubious ownership・unborn HEAD 等の「確認できない」失敗は null にせず例外で fail-close する。 | U-REVPAR-004 / 005 / 007 |
| `projectStructuredGreenCommandCaseEvidence` | (input: { …, trackedPaths: ReadonlySet<string> \| null }) => void | `trackedPaths` は同一 rebuild 内で 1 回だけ取得した集合。 | `trackedPaths` が非 null かつ `relPath` が集合に無い場合、存在確認も読込もせず `green-command-evidence-untracked`（warn）を記録して返る。集合にある path は従来どおり `missing` / parse 経路へ進む。 | null（非 git fixture）のときだけ従来の `existsSync` 判定。tracked evidence の parse 結果は変えない。 | U-REVPAR-001 / 002 / 003 |

`projectReviewEvidenceRegistry` は rebuild ごとに `loadTrackedPathSet(repoRoot)` を 1 回呼び、全 command へ
同じ集合を渡す。`runtimeLogPolicy` に依存させない。決定性は policy の如何にかかわらず成立させる。

## 4. finding の意味

| kind | 条件 | 環境依存 |
|---|---|---|
| `green-command-evidence-untracked` | evidence_path が HEAD tree に無い（runtime locator、未 commit、staged-only） | なし |
| `green-command-evidence-missing` | HEAD tree にあるが filesystem に無い（clean checkout では起きない） | あり（意図的。tracked 欠落は検出すべき） |
| `green-command-evidence-invalid-path` | evidence_path 欠落または absolute | なし |

`untracked` は「過去に runtime DB を測った証跡」を否定しない。参照先が tracked artifact でないことを
一定の finding として可視化するだけであり、PLAN 側の evidence_path を書き換える是正は本設計の範囲外。

## 5. fail-close 条件

- untracked runtime locator の有無で review-evidence findings が変わる。
- staged-only の path を tracked と誤認する（index を正本にする）。
- git repo 内で HEAD tree を読めないのに filesystem 判定へ戻る。
- git 起動不能や dubious ownership を非 git と同一視して null を返す。
- 同一 HEAD の clean clone と runtime DB ありの worktree で receipt の projection / checkpoint / receipt digest が割れる。

検査 oracle は `U-REVPAR-001` 〜 `U-REVPAR-007` の 7 件で固定する。
