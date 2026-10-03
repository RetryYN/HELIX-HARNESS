# 新世代のConcept・提供構成と旧Concept Vision Package候補の対応

確認日: 2026-09-14

## 目的

`concept-vision-package-intake.md`と`concept-vision-release-crosswalk.md`を、HELIX上位Concept、提供プロダクト
HARNESS、管理統制するHELIX-OS、個別製品の長期構想へ分解する。受領原文10文書とchecksumはhistorical intakeとして保全し、
旧main、Issue、PR、RLS／FRS、既存Module、既存CIを新世代のauthorityやbaselineにしない。

本表は要求源の照合である。Concept承認、L1／L2合意、L3凍結、Requirement IR更新、Package採番、公開、配布、
CI・Worker実行を行わない。

## 上位ConceptとVisionの再分類

| 旧記述 | 保持候補の意味 | 新世代接続先 | 持ち込まない条件 | 状態 |
|---|---|---|---|---|
| 作ったものと、つくる力を育て続ける | 要求から運用・改善までをつなぎ、経験を根拠と適用条件付きで戻す | Concept v4.1、HELIXOS-L2-005 | 旧Concept版、旧Learning／Knowledge機構を固定しない | semantic_atom_candidate |
| 対象製品開発・HELIX自己改善・全体統制 | HARNESS、個別製品、HELIX-OSの責務を分け、自己改善も通常の要求・独立検証へ戻す | product governance boundary、Concept v4.1 | 「全体統制」を別製品・統合writer・自己承認権限にしない | boundary_reapproval_required |
| Gene／Genome／発現 | 知識継承を説明する比喩 | historical terminology | runtime enum、DB、Requirement／PLAN identityとして採用しない | prose_only_rejected_for_runtime |
| Vision 1.0..5.0 | 段階的な長期能力候補 | 個別製品・将来構想のintake | 公開SemVer、現在の実装分母、完成gate、HARNESSの必須依存にしない | future_candidate_reapproval |
| Web／Connector／HDA／FACTORY等 | 個別製品または将来能力の候補 | HELIX-Web等の対象別L1／L2 | HELIX-OS内部機能やHARNESS同梱機能へ一括転用しない | product_specific_reapproval |

## PKG-D01..13の対象別再分類

旧PKG-IDは受領カタログの文書IDであり、新世代の正式Package、Module、Slice、Bundle、runtime enumではない。

| 旧ID | 意味候補 | 新世代owner | 再採否条件 |
|---|---|---|---|
| PKG-D01／D02／D05 | 要求形成、設計、検証の提供能力 | HARNESS | L1–L12工程と提供構成から新IDを導出し、旧Module名を継承しない |
| PKG-D03 | 計画・進行・停止再開 | HARNESS／HELIX-OS | 工程条件はHARNESS、実行状態・継続はOSへ分ける |
| PKG-D04 | Worker実行・候補成果生成 | HELIX-OS | Worker要求として再承認し、HARNESS提供能力と実行providerを分ける |
| PKG-D06 | CI計画・実行 | HARNESS／HELIX-OS | 検証契約はHARNESS、profile生成・運転はOS。既存CIを使わずNCIから再導出する |
| PKG-D07 | 操作認可・隔離・出力境界 | HELIX-OS | 操作別authorityから再導出し、便宜的なcore集約や候補からの権限付与をしない |
| PKG-D08 | 受入・変更統合 | HARNESS／HELIX-OS | 受入条件はHARNESS、統合操作と証拠管理はOS。PRを意味authorityにしない |
| PKG-D09 | 開発対象製品のrelease | HARNESS／個別製品／HELIX-OS | 提供契約、製品受入、配布操作を分け、HELIX自己releaseと権限・receiptを共有しない |
| PKG-D10..D12 | 配備、運用・保守、診断・回復 | HELIX-OS／個別製品 | OSの実行統制と製品固有SLO・環境・受入を分け、旧Moduleを再利用しない |
| PKG-D13 | 意味保存を伴う構造改善 | HARNESS／HELIX-OS | 工程上の変更・再検証条件はHARNESS、候補生成・実行管理はOSへ分ける |

## 提供・版管理で保持する意味

1. 利用者向けの提供構成と内部の責務所有を分け、同じartifactのownerを二重化しない。
2. 文書revision、能力目標、構成版、公開release、artifact digest、deployment revisionを別軸で扱う。
3. 公開releaseから構成、source、artifact、検収証拠へ辿り、同一版のbytes上書きを許さない。
4. HELIX内部の統治・学習・自己公開機構を、HARNESS外部利用者へ説明のない必須依存として同梱しない。
5. 将来能力やPKG-D01..13の全完成を、現在の提供構成に対する一括gateにしない。

旧Package／Module／Slice／Bundleの名前、個数、`8+1`、Lite／Full、旧channel、旧builder、旧registryは採用しない。
必要な構成概念は、Concept v4.1と対象別L1／L2の承認後に新しいidentity・schema・L3／L10として導出する。
旧「CIとCursorの先行投入」は棄却済みであり、既存進行として維持しない。

## 出典保全とauthority

受領原文は`docs/archive/intake/2026-09-06-concept-vision/`にhistorical sourceとして保持する。原文内の過去発言、
調査結果、件数、承認、CI結果を現在の実測や承認に転用しない。GitHub PR・Issueとremote branchは同期・作業記録であり、
意味authorityや原文保全の唯一の所在にしない。欠落した別ZIP、JSON、DECISIONS、調査書の内容を推測で補完しない。

## 次工程

Concept v4.1承認後、HARNESS、HELIX-OS、HELIX-Webその他の個別製品L1へ意味候補を分配し、対象別L2／L11で
個別採否する。正式な提供構成と版管理は、その新しい上流からL3／L10へ降ろし直す。要求整理が閉じるまで
既存CI、旧RLS／FRS、旧Package／Module、旧配布経路を実行しない。
