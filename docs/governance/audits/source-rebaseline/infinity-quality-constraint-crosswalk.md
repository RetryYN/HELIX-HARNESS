# Infinity Loop品質・技術制約の対象別照合

旧世代で指定JSON正本だったIRのNFR40件・TR11件を読んだ整理案。原文は[requirements.json](../../../../archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json)。
本表は要件本文を置換せず、対象と衝突の確認先を示す。JSON transaction・採用revisionの変更は未実施。

照合時のファイルSHA-256：`80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。

| 正本ID | revision | 対象・確認する条件 |
|---|---|---|
| HIL-NFR-01 | 1 | OS：副作用の冪等性。memory昇格の意味はHMCと照合 |
| HIL-NFR-02 | 1 | HARNESS／OS：検証独立性の条件と担当分離・学習昇格運用 |
| HIL-NFR-03 | 1 | 意味変更要：全Issue Reverse必須はBR-04の条件付き適用と矛盾。予算到達時の未完義務保持はOS |
| HIL-NFR-04 | 1 | OS：loop上限・停止・checkpoint・再起票抑制 |
| HIL-NFR-05 | 1 | OS：外部入力・命令・metadata・証拠の分離 |
| HIL-NFR-06 | 1 | HARNESS／OS：操作許可境界と実行時照合。個別操作の認可を要求採択と分ける |
| HIL-NFR-07 | 1 | HARNESS／OS：scopeと最小必要性の条件、検出・評価の実行 |
| HIL-NFR-08 | 1 | OS：failure code・出典・実証拠の保存。prose合格禁止はHARNESSの証拠条件を参照 |
| HIL-NFR-09 | 1 | 実装制約：Linux基準とOS adapter。consumerのOS一律指定へ転用しない |
| HIL-NFR-10 | 1 | 意味変更要：agent registryのHARNESS所有をOSへ。adapter再生成・独自正本禁止を保持 |
| HIL-NFR-11 | 1 | HARNESS：L2プロト・非UI適用性の証拠条件。OSは記録を管理 |
| HIL-NFR-12 | 1 | OS：source atomの完全列挙と採否追跡。対象集合を固定して実測 |
| HIL-NFR-13 | 1 | OS：snapshot・engine・configに束縛した決定性 |
| HIL-NFR-14 | 1 | 実装制約／OS：IPC障害時のfail-closeと部分結果非昇格 |
| HIL-NFR-15 | 1 | HARNESS／OS：証拠lineage条件とCI receipt収集。三段固定の適用範囲を照合 |
| HIL-NFR-16 | 1 | OS：quarantine対象・期限・失効条件 |
| HIL-NFR-17 | 1 | OS：product data取得・分類・保持・鮮度・投影範囲 |
| HIL-NFR-18 | 1 | OS：lease失効・fencing・durable再開 |
| HIL-NFR-19 | 1 | 実装制約：platform別の検証証拠。wrapper成功を別OS成功にしない |
| HIL-NFR-20 | 1 | HARNESS／OS：Reverse適用時の証拠条件と実行・収集。全案件必須化とは分ける |
| HIL-NFR-21 | 1 | OS・採用差分照合要：原記録保持とdisposition。取消・終端権限をAVS／RFAのscopeと照合 |
| HIL-NFR-22 | 1 | OS：atomic source coverageとextractor変更時の再評価 |
| HIL-NFR-23 | 1 | HARNESS／OS：scope導出根拠の条件とgraph検査 |
| HIL-NFR-24 | 1 | HARNESS／OS：意味保存refactorの条件と改善候補・証拠・実施管理 |
| HIL-NFR-25 | 1 | 適用範囲要確認：Domain Object設計規律。全consumerへの一律必須条件にせず、対象設計方式と根拠を照合 |
| HIL-NFR-26 | 1 | HARNESS／OS：設計義務の個別充足条件と消込管理 |
| HIL-NFR-27 | 1 | OS：Translatorの原文・不確実性・template採用管理 |
| HIL-NFR-28 | 1 | HARNESS／OS：要求と設計義務の完全性条件、対応と状態の管理 |
| HIL-NFR-29 | 1 | HARNESS／OS：層・pair・revision・粒度の条件と台帳検査 |
| HIL-NFR-30 | 1 | HARNESS／OS・採用差分照合要：既定policy内authoringと自動正本化。RFA候補の発効と区別 |
| HIL-NFR-31 | 1 | OS：正本更新transactionの原子性と障害時復旧 |
| HIL-NFR-32 | 1 | HARNESS／OS：意味変更のadmission条件と下流失効・transaction実行 |
| HIL-NFR-33 | 1 | HARNESS／OS：contract十分性の条件と重複・context負荷の検出 |
| HIL-NFR-34 | 1 | OS：pack・agent生成物の未承認状態、失効、権限・予算・独立性 |
| HIL-NFR-35 | 1 | OS：worker評価の盲検・再現性・非相殺 |
| HIL-NFR-36 | 1 | OS：model／effort選択と品質・費用・再試行の追跡 |
| HIL-NFR-37 | 1 | OS：委譲データ分類と第三者runtime制約。原文のopt-out条件とNFR-39のローカル証明条件を両方照合 |
| HIL-NFR-38 | 1 | OS：一時設定の終了時除去とrepository側deny。設定有効化を本表で認可しない |
| HIL-NFR-39 | 1 | OS：第三者runtimeの隔離・通信・FS検証。ベンダー宣言をローカル証明へ転用しない |
| HIL-NFR-40 | 1 | OS：quota・rate制限の保留と代替提案、無計画retry禁止 |
| HIL-TR-01 | 1 | HELIX実装：Node control plane、Bun除去 |
| HIL-TR-02 | 1 | 意味照合要：Pythonをdata/detection planeだけに限定せずADR-010 semantic coreと整合 |
| HIL-TR-03 | 1 | HELIX実装：旧ソース採否と正本非迂回、出典・結果投影 |
| HIL-TR-04 | 1 | HELIX実装・提供対応環境：Linux primary。WSL等をcore前提にしない |
| HIL-TR-05 | 1 | HELIX実装：OS adapterとplatform別検証 |
| HIL-TR-06 | 1 | HELIX実装・提供物：依存lock・clean install・検査の再現性 |
| HIL-TR-07 | 1 | 意味変更要：write authorityをL4で決定する旧条件はADR-010のNode transactional boundaryと衝突 |
| HIL-TR-08 | 1 | HELIX実装：Node／Python IPC契約。HARNESS利用先の言語・通信方式に強制しない |
| HIL-TR-09 | 1 | HELIX実装：Node commitとPythonへの最小入力。read snapshotの範囲をADR-010と照合 |
| HIL-TR-10 | 1 | OS実装：DB内の責務・状態分離。DBを要求意味正本にしない |
| HIL-TR-11 | 1 | HELIX実装・提供物：全active surfaceのBun不依存。consumerプロダクト自体の言語制約ではない |

HARNESSの工程・提供条件はHARNESS L2、実行・管理はHELIX-OS L2へ接続する。
「HELIX実装」の項目は対象実装の制約として保持し、HARNESSを使う個別プロダクトの言語やOSへ自動伝播しない。
矛盾を検出した行は、期待値を緩める変更では解消しない。要求本文・契約・受入・実装境界の整合が必要である。
