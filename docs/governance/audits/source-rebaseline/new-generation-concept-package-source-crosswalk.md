# 新世代のConcept・提供構成と旧Concept Vision Package候補の対応

親：[HELIX Concept](../../../concept/helix-concept.md)。本書の旧PKG-D01〜13、四対象、Concept v4.1という表記は当時の照合履歴である。現行Conceptの8機構＋2共通部品、1.0／1.x／2.0／3.0／4.0／5.0、HARNESSとWebだけの製品属性へ要求を割り付ける候補は[全件要求対応表](../../crosswalks/concept-mechanism-version-requirement-crosswalk.md)に置く。旧Packageの数、旧四対象routing、旧実装方式から現行の製品数・完成条件・successorを生成しない。

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

## 機構再編（Concept v4.3）の旧資産照合

確認日: 2026-09-24。Concept v4.3（8機構＋2共通部品への再編）の作成時に、[資産明細台帳](../../legacy-asset-disposition.jsonl)の`source_path`から、
Vision、infinity-loop要求、Worker blind benchmark、product data connector、security capability broker、isolated worktree sandbox runnerを検索した。
対応sourceと、[Worker capacity](new-generation-worker-capacity-source-crosswalk.md)、[Security](new-generation-security-engagement-source-crosswalk.md)、
本書の判断史・failure・consumer記録を照合した。`consumer_refs=[]`は、consumerが存在しないことの証明ではない。

| 旧asset ID・source | 保持する意味と観測したfailure／consumer | 再編での扱い |
|---|---|---|
| `LEGACY-ASSET-DD53551C74BB4939A325` Vision v0.1（SHA-256 `1725bee697999140ac0f7d0926b4a4cf5636a2f7e3d5a554822c722c3effcd74`） | 所有者による継続改修、開発と成長の分離、複数事業への能力投入、モデル改善と動的判断、Webの開発提供、許可された実績の還流。台帳のdispositionは`unresolved`、consumer_refsは空 | 長期構想の意味入力。旧実現形や承認を継承しない。§5.4のIntelligenceをBRAIN／Intelligenceへ分けること、§6のConnectorをCONNECT共通部品にすること、§2の全体統制を分散authorityにすること、§4の節目とHARNESS Version 1の展開前提は、変更・具体化した差分として扱う |
| `LEGACY-ASSET-719D5EC9C06FC4AAD0FF` infinity-loop L1要求 | 自走・計測・Worker・接続の要求source。台帳は`source_snapshot_preservation`、consumerはcarry-forward ledgerとatomization review | 原文atomを無損失で保持し、対象別L1／L2の採否へ送る |
| `LEGACY-ASSET-09F4CAA4129F5DF63C5E` Worker blind benchmark L4設計 | 独立評価と、provenance不足時の失敗条件。smokeの成功はadmissionを示さない。台帳は`unresolved`、consumer_refsは空 | LABO／OS境界の参考。旧benchmarkを新しいoracleへ流用しない |
| `LEGACY-ASSET-C3DE79BA9451172F3E43` product data connector L5設計 | read-only、lineage、schema・鮮度・driftのfailureを確認。台帳は`unresolved`、consumer_refsは空 | CONNECTとWebデータ利用条件の参考。旧接続・DB方式を採用しない |
| `LEGACY-ASSET-B62E49D2E156232B8C63` security capability broker L3要求 | typed認可、scope drift時のfail-close、旧broker greenの限界を確認。台帳は`unresolved`、consumer_refsは空 | Securityの操作点制限の参考。旧brokerを現行の認可にしない |
| `LEGACY-ASSET-42DBFF81CAA08B82AF11` isolated worktree sandbox runner計画 | dirty baselineと隔離失敗の条件を確認。台帳は`unresolved`、consumer_refsは空 | Runner／Sandboxの停止・隔離条件の参考。旧planやruntimeを実行しない |

これらは代表pathの照会であり、BRAIN、LABO、Intelligence、Security、CONNECT、Runner／Sandboxの全資産・consumerを閉じた調査ではない。
対応する機構の定義と要求で、原source、判断史、failure、consumer、全候補asset IDを確定し、
[旧資産の完全一致再利用統制](../../legacy-asset-reuse-control.md)に従って再利用・意味の再導出・置換を個別に判断する。
Concept本文は旧実装のownerや合格証拠を採用しない。

## 出典保全とauthority

受領原文は`docs/archive/intake/2026-09-06-concept-vision/`にhistorical sourceとして保持する。原文内の過去発言、
調査結果、件数、承認、CI結果を現在の実測や承認に転用しない。GitHub PR・Issueとremote branchは同期・作業記録であり、
意味authorityや原文保全の唯一の所在にしない。欠落した別ZIP、JSON、DECISIONS、調査書の内容を推測で補完しない。

## 次工程

（2026-09-14時点の記述。Conceptはその後1ファイルのHELIX Conceptへ移行し、機構再編（2026-09-24）を経ている。現在の次工程は[新世代作業入口](../../new-generation-start-here.md)に従う。）

Concept v4.1承認後、HARNESS、HELIX-OS、HELIX-Webその他の個別製品L1へ意味候補を分配し、対象別L2／L11で
個別採否する。正式な提供構成と版管理は、その新しい上流からL3／L10へ降ろし直す。要求整理が閉じるまで
既存CI、旧RLS／FRS、旧Package／Module、旧配布経路を実行しない。
