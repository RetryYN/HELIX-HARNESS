# HELIX L12 canonical V モデル方向指示書 v0.1

- status: directive（PO 方向決定の記録。実 cutover は既存 L3 要件の gate に従う）
- decided: 2026-07-19（PO チャット決定）
- 正本定義 source: `ハイブリッド設計ドキュメントv1-fixed.zip` 内 `hybrid-docgen/docs/107_Vモデル・レベル定義.yaml`
- 関連正本: `docs/design/helix/L3-requirements/vmodel-docgen-fit.md`（HR-FR-VMFIT-02）/
  `docs/design/helix/L3-requirements/vmodel-canonical-authority-cutover.md` /
  `docs/design/helix/L3-requirements/hybrid-rebaseline-v0.5.0-collision.md`（HR-FR-V050-06）

## 1. 決定

工程骨格は **L1–L12 モデルを canonical とする**。L0–L14 モデルは compatibility projection 側とし、
新規の要件・設計・trace・gate は L1–L12 の層 ID を正とする。

これは既存 L3 要件（vmodel-docgen-fit の「L12 を canonical target にする」）の再確認であり、
新規の裁定ではない。本指示書は PO の方向確認と、L14 モデルから保存すべき 2 資産を明文化する。

## 2. 採用理由（L12 が個人開発 HELIX に優る点）

1. V 字の高さ対称が素直で、pair gate（設計⇔検証の 1 対 1）を機械的に張れる。
2. 降下距離が短く、重い機能設計層を L5 詳細設計＋typed declaration＋L7 TDD closure へ吸収できる
   （HR-FR-VMFIT-02）。個人開発の実装速度問題への構造的解。
3. 層の細粒度は層ごとに担当・承認者が分かれる企業組織向けの分割であり、単独＋AI 運用では
   文書置き場の数が増えるだけで価値を生まない。

## 3. 層定義（107 正本。この採番以外を新規に使わない）

機械判定用の正規V-pairは `L1 ⇔ L12`、`L2 ⇔ L11`、`L3 ⇔ L10`、`L4 ⇔ L9`、
`L5 ⇔ L8`、`L6 ⇔ L7` の6組とする。下表のL6/L7頂点表現もこのpairを分割表示したものである。

| L | 工程 | 検証の対（⇔） | 位置 |
|---|---|---|---|
| L1 | 企画 | ⇔ L12 運用テスト | 下降 |
| L2 | 要求（画面プロトで引き出し） | ⇔ L11 受入テスト | 下降（反復） |
| L3 | 要件（締める＝凍結点） | ⇔ L10 総合テスト | 下降 |
| L4 | 基本設計 | ⇔ L9 結合テスト | 下降 |
| L5 | 詳細設計（＋テスト設計、シフトレフト） | ⇔ L8 単体テスト | 下降 |
| L6 | 実装（プロダクトコード） | — | 下降 |
| L7 | テスト実装 ⇔ 実装（TDD クロージャ） | 頂点＝V が閉じる | 頂点 |
| L8 | 単体テスト | → L5 詳細設計を検証 | 上昇 |
| L9 | 結合テスト | → L4 基本設計を検証 | 上昇 |
| L10 | 総合テスト | → L3 要件を検証 | 上昇 |
| L11 | 受入テスト | → L2 要求を検証 | 上昇 |
| L12 | 運用テスト | → L1 企画を検証 | 上昇 |

補足規約:

- **本番リリースは層ではなく L11⇔L12 間の出荷マイルストン**とする。「本番テスト」という独立層を
  新設しない（107 準拠）。
- L2 の凍結ゲート＝画面プロトタイプの合意記録。プロト合意なき L3 凍結を禁止する。
- 画面モックは L2 内の要求引き出し装置であり、独立層にしない。
- テスト設計は下降側（L5 まで）で整備し、実行は上昇側（L8〜）で行う。
- 駆動方向は固定順ではなくリスク依存（ドメイン＝テスト先、UX＝プロト先、複数クライアント＝契約先）。

### 3.1 PO 提示案との突合記録（2026-07-19）

PO 案「L1 要求 / L2 画面モック / … / L7 単体 / L8 結合 / L9 統合 / L10 受入 / L11 本番テスト / L12 運用」は
(a) L1 の企画欠落、(b) L7 TDD クロージャ頂点の欠落と「本番テスト」層の挿入、の 2 点で 107 正本と乖離する。
本指示書は 107 正本採番を採用し、PO 案の意図は次で吸収する: 要求定義= L2、画面モック= L2 内装置、
本番リリース= L11⇔L12 間マイルストン、単体〜運用テスト= L8〜L12。

## 4. L14 モデルから保存する 2 資産（必達）

L12 骨格の採用は、次の 2 点を失う理由にならない。層以外の形で保存する。

1. **L0 charter の権威**: `docs/design/helix/L0-charter/helix-charter_v0.1.md` は工程層ではなく
   **全層 authority の根（層外 anchor）** として別格を維持する。L12 canonical view 上は L1 企画へ
   投影されるが、自律境界（人= 企画・要求・モック、AI= 要件起草以降）の定義元は charter のままとする。
2. **運用→企画の還流ループ（infinity loop）**: 旧 L13/L14 が担っていた feedback は、L12⇔L1 の
   検証対＋harness.db feedback lifecycle＋Reverse 常設入口として維持する。工程の尻尾で終わらせない。

## 5. 移行規律（既存要件の再確認）

- 現行 L0–L14 と L12 canonical の**二重表示を green にしてから** schema enum や PLAN ID policy を変える
  （vmodel-docgen-fit.md の規律）。破壊的 rename は行わない。
- v0.5.x package 内の L0–L14 表現は source として保存し、canonical output は L1–L12 へ exact remap する
  （HR-FR-V050-06）。
- 既存ディレクトリ（`docs/design/helix/L13-post-deploy/` 等)の物理改名は cutover gate（dry-run・backup・
  rollback・action-binding approval）成立まで行わない。

## 6. 波及事項

- Authoring Admission（`docs/governance/autonomous-authoring-admission-transaction-directive_v0.1.md`）の
  `affected_layers` は L1–L12 canonical の層 ID を正とし、L0–L14 は projection 経由で導出する。
  同指示書の要件反映時に layer enum を本指示書へ揃える。
- solo tailoring profile（HVM-TAILOR-*）は L12 骨格上で引き続き有効（企業 governance 文書 NA、
  図・索引 optional、詳細設計が機能設計契約を吸収）。
