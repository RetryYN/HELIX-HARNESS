---
title: "Python 意味コアと Node 実行境界 L9システムテスト設計（L4 pair）"
layer: L4
sub_doc: system-test-design
artifact_type: test_design
executed_at_layer: L9
kind: add-design
status: draft
created: 2026-08-08
updated: 2026-08-08
owner: QA
pair_artifact: docs/design/helix/L4-basic-design/python-semantic-core-node-boundary.md
github_issue_id: 230
---

# Python 意味コアと Node 実行境界 L9システムテスト設計（L4 pair）

L4基本設計 §3 の system assertion（SA-PSC-01〜04）を L9 で検証する。test citation は
各実装スライスの PLAN 確定時に登録する。L8（結合）が schema・envelope・projection の
型/段間契約の検証であるのに対し、L9 は実 doc・実 contract・実 spawn 構成・実 gate 配線を
端から端まで通す system 粒度で検証する（L8 の再実行にしない）。

| SA | 対象 | 検証内容 |
|---|---|---|
| SA-PSC-01 | 実 hybrid document end-to-end | 実 repo の実 doc + 実 sidecar 一式を Python 意味コア→envelope→Node 再検証→`harness.db` projection の全経路へ通し、意味判定重複 0・未再検証 commit 0 を assert |
| SA-PSC-02 | 実 spawn 隔離境界 | Python プロセスの実行環境（env / argv / cwd / network）に DB path・credential・repository write・`.helix/` が渡らないことを実 spawn 経路で assert |
| SA-PSC-03a | 実 gate fail-close（drift + authoring 境界） | source / sidecar / schema / HEAD / digest drift を実 commit 経路で、別 authoring DB / reverse write を実 doctor gate 経路で fail-close し、違反ごとに `harness.db` が 1 行も動かないことを assert（citation: `tests/psc-gate-system.test.ts`（drift + partial write 0）および `tests/semantic-boundary.test.ts`（authoring 境界。U-PSC-006 と共有）） |
| SA-PSC-03b | 実 gate fail-close（browser evidence 偽装） | browser evidence の偽装・改ざんを commit 前に検知し fail-close することを assert。**未実装ブロック**（受け皿不在。下記ブロック記録） |
| SA-PSC-04 | 実 inventory intake receipt | 実 source ファイル一式（211-file inventory）から Python 意味コアが filename / digest / inventory 差異 / atom disposition を intake receipt へ固定し、Node 再検証→`harness.db` projection commit までの全経路を assert（VDH-FR-001） |

## SA-PSC-03a の観測点（L8 の再実行にしない根拠）

L8（U-PSC-003 / U-PSC-004 / U-PSC-006）は合成 fixture で pure 関数と型・段間契約を検査する。
SA-PSC-03a が L8 に対して新規に足す観測は次の 2 点である。

1. **実 repository の実 doc**（ディスクから読んだ実 digest）を source にする。合成文字列を
   source と取り違える経路を塞ぐ。
2. 違反 1 件ごとに **`harness.db` の semantic 全テーブル行数が不変**であることを観測する。
   head だけを見ると result 行だけ残る partial write を見逃す。

**訂正（review round1）**: 当初は「実 doctor gate を実 repo に対して走らせる」ことも新規点として
挙げていたが、これは事実誤認だった。U-PSC-006（`tests/semantic-boundary.test.ts` の実 repo
regression fence）が既に `analyzeSemanticBoundary` と `checkSemanticBoundary` を実 repo で実行し、
違反注入によって fence の実効性まで実証している。重複 test を削除し、SA-PSC-03a の
authoring 境界面は U-PSC-006 を citation する。

### mutation 実測（2026-08-09）

| mutation | 結果 |
|---|---|
| envelope digest の再計算を外す | killed |
| sidecar 束縛検査（`PSC_CONTRACT_UNBOUND`）を外す | killed |
| 実 gate の入力を空集合にする | killed（起草時の 2 本目 test での実測。当該 test は U-PSC-006 と重複のため削除済みで、現行はこの kill を U-PSC-006 が担う） |
| CAS を pre-lock 側だけ外す | **survive** |
| CAS を in-lock 側だけ外す | **survive** |
| CAS を両層同時に外す | killed |

CAS の単層 mutation が survive するのは、pre-lock チェックと in-lock `WHERE` が同一条件を
二重に守っているためであり欠陥ではない。in-lock 層は L8 の U-PSC-004（rival writer 注入）が
独立に担保する。SA-PSC-03a が担保するのは「どちらか一方でも生きていれば stale head が
commit されない」ことである。

## ブロック記録

- **SA-PSC-01 / SA-PSC-02 / SA-PSC-04**: Python 意味コアの実 spawn を要求するが、repository に
  Python 実装は存在しない（`.py` 0 件、CI に Python toolchain なし）。L5
  `python-worker-runtime.md` §0 が「HDS-HIL-14 supply-chain gate なしに実装・active 化しない」と
  自ら宣言しており、解除には Python version / interpreter provenance / package・lock /
  wheel・sdist / SBOM・license の凍結判断が要る。
- **SA-PSC-03b**: browser evidence の証跡が `SemanticCommitBundleV1` に無く、`src/semantic/` に
  関連実装も無い。検知する gate 自体が未実装であり、assert を書くと実装不在のまま green に
  なる。受け皿の実装着地が解除条件。
