# 参照用source archive（保護用）

2026-09-25のPO指示（「保護のためのZIP系は参考としてこのリポに持ってきてくれる？」）により、旧HELIXが本体を外してmanifestだけで管理していたsource archiveを、元のbytesのまま保存する。
POはハイブリッド設計ドキュメントについて「これをHELIXコアのベースにしてた」と述べている。

本フォルダは**読むだけの参考資料**である。

- 展開した中身のtool、script、hook、CI定義（`.github/workflows/`等）を実行しない。
- 中身を要求、設計、承認、受入、実装の正本や完了証拠にしない。
- 中身を現行pathへcopyしない。採用するときは、[旧資産の完全一致再利用統制](../../docs/governance/legacy-asset-reuse-control.md)に従い、採否を別に判断する。
- archiveのbytesを変更しない。更新版が出たら、別のファイル名で追加する。

## 収録物

| ファイル | SHA-256 | ファイル数（ディレクトリ除く） | 取得元 | 旧HELIXのmanifest |
|---|---|---|---|---|
| `ハイブリッド設計ドキュメントv1-fixed.zip` | `9c547ba8bc9eaf3a12f27254fd3eb6d04b37fb8c899f13d56ceb0d2cff179fb3` | 703 | git blob `a49c4e46193d2a0c788587dc689a9fc4329733ec`（commit `ea3d678f3`、2026-07-09追加） | [hybrid-vmodel-source.v1](../legacy-generation-2026-09-14/root/docs/migration/source-manifests/hybrid-vmodel-source.v1.json)。`archive_sha256`と一致 |
| `ハイブリッド設計ドキュメント_v1.zip` | `76fa65d8b69e366047bfa5ad248d2f1a2337e2d1144d689f8c4bbe28e9175193` | 703 | 2026-09-25にPOが提供したファイル | なし（旧HELIXの管理外） |
| `hybrid-core-requirements-rebaseline-v0.5.0.zip` | `04e9c88a9214e77654787b9e1301eb35bc69a2f264d179d14211e849c58aca61` | 208 | git blob `d1fbeccaf8c4006f5ba0ee077d9c1e887caff6c0`（commit `694b45bf8`、2026-07-18追加） | [hybrid-core-rebaseline.v0.5.0](../legacy-generation-2026-09-14/root/docs/migration/source-manifests/hybrid-core-rebaseline.v0.5.0.json)。`archive_sha256`と一致 |
| `hybrid-core-requirements-rebaseline-v0.5.1.zip` | `1e14a8576715f5a249f270fb5472e02023400526e00866baa709befe9edb48fd` | 211 | git blob `a20f09e0888e80f0e13374ef10dab52e1e6aeee7`（commit `c6e30ef1f`、2026-07-18追加） | [hybrid-core-rebaseline.v0.5.1](../legacy-generation-2026-09-14/root/docs/migration/source-manifests/hybrid-core-rebaseline.v0.5.1.json)。`archive_sha256`と一致 |

### ハイブリッド設計ドキュメントの2版の関係

- 2つとも703ファイルで、ファイル名の集合は同じである。`_v1.zip`はこのほかにディレクトリ項目を37件持つ。
- 中身が違うファイルは261件ある。内訳は次のとおり。
  - `build/`のxlsx 252件
  - md 3件、yaml 3件
  - `tools/assign.py`と`tools/schedule.py`
  - `build/signals.json`
- `v1-fixed`は、`tools/assign.py`と`tools/schedule.py`に、Scrum実装状態の読み取り、`docs/assign.yaml`との連携、`id_utils`を足している。したがって、`_v1.zip`が修正前、`v1-fixed`が修正後の版と読める。
- 旧HELIXが採用判断に使ったのは`v1-fixed`である（[L12 Vモデル ZIP 採用マトリクス](../legacy-generation-2026-09-14/root/docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md)）。

## 見つからなかったもの

- `UNIVERSAL-WORKFLOW-REQUIREMENTS-SKILL_v1.1.0.zip`
  - [manifest](../legacy-generation-2026-09-14/root/docs/migration/source-manifests/universal-workflow-requirements-skill.v1.1.0.json)の記録：SHA-256 `b6fd08f5054930dde8379969bf9a84cb21270d1b7bac8e87be3bc243ad425d26`、14 entry。
  - 探した範囲：ローカルのファイルシステム全体と、このrepositoryのgit object全体。どちらにもなかった。manifestにgit blobの記録はない。
  - 見つかった場合は、SHA-256が一致することを確かめてから、本フォルダへ追加する。

## 旧HELIXとの違い

旧HELIXは、これらのarchive本体をrepositoryから外し、source manifest（SHA-256、entry集合、採用entry）だけを残した（commit `3b4a21d43`「migrate root source archives to manifests」、2026-08-29）。

| 観点 | 内容 |
|---|---|
| 保持する点 | identityはmanifestの`archive_sha256`で確かめる。authorityは`migration_source_only`とし、採否は旧採用判断とは別に行う。中身を実行しない |
| 変更する点 | archive本体のbytesを、参照用としてrepositoryに再び保存する |
| 変更理由 | POの指示による。消失を防いで保護し、設計パターン・テンプレートを取り込む際の参照元にするため |
