# Stage 1着手前の承認委任・v0.1条件の照合

基準revision: `8414e71d2cde465f9cd15f604c8367148ba4165e`。本書は時点の照合記録であり、要求・判断記録の変更、release、内部デプロイ、成立宣言を生成しない。開発に使った段階はv0.1前（scaffold運転）。

## 承認委任の入口を現行判断へ合わせる

AGENTS.mdとCLAUDE.mdのOpus・Fable一致という記述は2026-10-05の条件を残していた。2026-10-08判断1は、作成とは別runtime・別model familyのexact base／content HEADに対するno_findings、両側の系統記録、review後の6文書bytes不変へ改定した。入口をこの判断へ合わせる。Fableはエスカレーション先、POは機構×Stageの事後確認を持つ。改定前に成立した承認を取り消さない。

旧sourceはarchive内CLAUDE.md:82–85の人の上流所有とAIの要件起草以下の自走、195–197の独立クロスruntime reviewを起点にする。自律境界と独立reviewを保持し、L3／L10委任の具体的成立条件は既存PO判断から再導出する。追加の承認手続きは作らない。

## 二系統のv0.1条件

| 所在 | 対象・条件 | 他の条件へ転用できないもの |
|---|---|---|
| 2026-10-07内部デプロイ判断「現在の状態」、HELIXOS-L2-014:619–633 | 正式packから、要求確認→作業→検証→記録が狭くても一周する段階構成。pack・安全依存・環境・受入証拠・更新／切戻し・自己依存解消を扱う | 個別packや検査器の成功だけでは段階全体の統合・受入・復旧を証明しない |
| 2026-10-08委任改定判断3、共通kernel §12 | 開発repoのL3／L10に対するPhase 1の機械検査が主になる条件。determinism、過去Majorのbad／fixed両head、前後partition、全member receipt、機械判定しない範囲を固定入力に結ぶ | Phase1Statusはauthority_effect:none。製品側の全段階受入、release宣言や内部デプロイ許可を自動生成しない |

10月8日判断はPhase 1条件がそろった時点をv0.1成立へ対応づけている。一方、10月7日判断とL2-014の段階構成条件を削除したとは書かれていない。両者の対象と証拠は同一ではないため、AIが片方だけを成立の十分条件へ統一しない。G8監査の固定仕事は候補・未立証であり、採択済みの最初の段階構成やPhase 1測定scopeの代わりにしない。

**PO判断待ち**：両系統の条件を段階releaseの成立判定へどう対応づけるか。L2-014の意味・範囲を縮める必要がある場合はL2へ戻す。この項目だけを保留し、Stage 1の設計・実装とローカルCIは別の解禁範囲で進める。Phase 1の実scope・corpus・成立確認時点は本照合で決めない。内部デプロイは既存判断どおり対象と作用を明示した別のPO許可を要する。

旧sourceのFRS-BR-008／009（functional-release-slice-requests.md:59–67）は、必要検証の保持、安全依存閉包、組合せの統合・更新・rollbackを個別成功から分ける点を起点にする。旧CIの先行実行やLite／Full呼称は採らず、HELIXOS-L2-014と既存判断で記録された置換を保持する。新しいrelease条件は追加しない。

## 読取対象の固定

| path | 基準revisionのfile bytes SHA-256 |
|---|---|
| `docs/governance/decisions/stage-release-internal-deployment-po-decisions-2026-10-07.md` | `b7bd5a34fb0c722be49f90a58ba917de65a1dc8d28db36ae9eb86336cbbea0cb` |
| `docs/governance/decisions/l3-l10-delegation-cross-runtime-review-po-decision-2026-10-08.md` | `27b51768cbf010d201ccc2aafe8e4c893ec5ccb2a9a0bce662af343ef87809ee` |
| `docs/helix-os/L2-requirements/governance-requirements.md` | `97f9158bea0d5c39821bb6538887b909d04687798c8e836d151681ebb06f9bf7` |
| `docs/helix-harness/L4-basic-design/common-kernel.md` | `a62e29a499c3011b28c46951aea355f35a7209fc1a9ef8221da46da516ec8dba` |
| `docs/governance/audits/g8-v0-1-scope-derivation.md` | `5f3ebd6cbcdce062a9016579e4f893d1c0094fc908600a43cd883ac3fb4d4781` |
| `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requests.md` | `bf47d434930bd701d368a49b725d49b00a5af2f385b6e1436b294f7b47796e20` |
