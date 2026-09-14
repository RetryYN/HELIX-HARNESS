# Infinity Loop機能要求の対象別照合

旧世代で指定JSON正本だったIRのFR69件を読んだ対象別整理案。原文は[requirements.json](../../../../archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json)。
本文・契約・受入を本表で置換しない。新世代では対象別L2へ意味を個別採否し、承認上流からprojectionを再導出する。

照合時のファイルSHA-256：`80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。

| 正本ID | revision | 対象 | 分離・是正する条件 |
|---|---|---|---|
| HIL-FR-01 | 1 | OS・意味変更要 | 旧一律reverse遷移を現行の条件付き適用と照合。段階receiptはOS |
| HIL-FR-02 | 1 | OS | PR event正規化と監査queueの冪等登録 |
| HIL-FR-03 | 1 | HARNESS／OS | Issue contractの投影。要求意味はローカル正本から参照 |
| HIL-FR-04 | 1 | OS・意味変更要 | 全Issue R0–R4必須はBR-04と矛盾。Reverse適用時の証拠条件と分離 |
| HIL-FR-05 | 1 | HARNESS／OS | 再設計の層・pair条件とrouter実行。Forward一律返却は選択styleと照合 |
| HIL-FR-06 | 1 | HARNESS／OS | scope条件・根拠と実diff検査。派生IDの循環根拠禁止 |
| HIL-FR-07 | 1 | HARNESS／OS | closure条件と実証拠照合。memory compaction必須の適用範囲をHMCと照合 |
| HIL-FR-08 | 1 | OS | ready claimと実装tool起動制御。Reverse適用性を照合 |
| HIL-FR-09 | 1 | OS | 監査findingの分類・writer返却・独立反証・非終端状態 |
| HIL-FR-10 | 1 | OS・意味変更要 | 永続知識をmemoryへ昇格する旧条件はHMCの通知限定と衝突 |
| HIL-FR-11 | 1 | OS・意味変更要 | HARNESS正本agent registryをOSへ分離。旧drive軸も是正対象 |
| HIL-FR-12 | 1 | OS | adapter生成とguard、model・effort・path・context制約 |
| HIL-FR-13 | 1 | OS | 検証patternに基づくteam生成・担当分離 |
| HIL-FR-14 | 1 | OS | 学習候補の段階昇格・効果・復旧先。HARNESS規則の直接上書き禁止 |
| HIL-FR-15 | 1 | OS | docgen入力の採否・source・DB接続 |
| HIL-FR-16 | 2 | OS | source inventoryと採否。exact source/ref集合は削らず照合 |
| HIL-FR-17 | 1 | HARNESS／OS | 画面適用条件はHARNESS、判定実行・receiptはOS |
| HIL-FR-18 | 1 | HARNESS／OS | prototype生成機構はOS。要求発見に必要な操作条件はHARNESS |
| HIL-FR-19 | 1 | HARNESS／OS・意味変更要 | L1反映先の旧記述をL2要求へ是正し、企画影響時だけL1にも戻す |
| HIL-FR-20 | 1 | HARNESS／OS・意味変更要 | L1 freeze／L3開始の旧境界をL2合意・L3凍結条件と照合 |
| HIL-FR-21 | 2 | OS | source snapshotの取得・固定・失効 |
| HIL-FR-22 | 1 | HARNESS／OS | capability coverage検査と採否・設計・検証のjoin |
| HIL-FR-23 | 1 | OS | product data connector登録と秘密値非保存。Web製品化の要求ではない |
| HIL-FR-24 | 1 | OS | product data取得・mapping・freshness・tombstone |
| HIL-FR-25 | 1 | OS | engine登録・run・artifact・digest管理 |
| HIL-FR-26 | 1 | OS | detector登録・実行・finding保存 |
| HIL-FR-27 | 1 | HELIX実装／OS | Node／Python supervisorとlate result拒否。semantic core契約と接続 |
| HIL-FR-28 | 1 | OS | CI段階の実行・receipt・lineage。三段固定の適用範囲を照合 |
| HIL-FR-29 | 1 | OS | quarantine対象・期限・代替gate・是正責務 |
| HIL-FR-30 | 1 | OS・意味変更要 | finding処理と後続作業の原子生成。Universal Reverseとmemory要約の意味を最新候補と照合 |
| HIL-FR-31 | 1 | HARNESS／OS | L1／L2への差戻し条件と実装claim制御。再承認の範囲をRFAと照合 |
| HIL-FR-32 | 1 | OS | agent lifecycle・lease・checkpoint・終端状態 |
| HIL-FR-33 | 1 | HELIX実装／OS | HELIX active surfaceのBun検出。利用先プロダクトの言語へ強制しない |
| HIL-FR-34 | 1 | HELIX実装／OS | HELIX platform adapterの契約試験 |
| HIL-FR-35 | 1 | HARNESS／OS | Reverse適用時の実質証拠条件と検査実行 |
| HIL-FR-36 | 1 | OS | 入力原記録とdisposition根拠。作業依頼を自動承認へ昇格しない |
| HIL-FR-37 | 1 | OS | source behaviorの原子抽出と未分類・重複の検出 |
| HIL-FR-38 | 1 | HARNESS／OS | scope根拠・最小必要性・循環拒否の検査 |
| HIL-FR-39 | 1 | HARNESS／OS | 意味保存refactor条件と候補生成・reroute実行 |
| HIL-FR-40 | 1 | HARNESS／OS | Domain Objectの分類・命名・oracle接続。全案件の設計方式へ一律強制しない |
| HIL-FR-41 | 1 | OS | templateの適用条件・版・schema管理 |
| HIL-FR-42 | 1 | HARNESS／OS | 設計義務条件とgraph生成・消込検査 |
| HIL-FR-43 | 1 | OS | 要求atom翻訳・原文・曖昧性・challenge管理 |
| HIL-FR-44 | 1 | OS | template gapとshadow・独立監査・昇格 |
| HIL-FR-45 | 1 | OS | 要求ID・revision・採否・全source対応の台帳管理。旧JSONとの出典対応を保持 |
| HIL-FR-46 | 1 | HARNESS／OS | 層の粒度・必須edge条件とledger登録・snapshot |
| HIL-FR-47 | 1 | OS | 義務抽出と候補行・gap検出。自由補完を証拠にしない |
| HIL-FR-48 | 1 | HARNESS／OS | 上下層の双方向・粒度・revision条件と検査 |
| HIL-FR-49 | 1 | HARNESS／OS | 正規V-pair・oracle条件と双方向join、運用feedback還流 |
| HIL-FR-50 | 1 | HARNESS／OS | ledger再編候補・意味保存・pair維持の検証 |
| HIL-FR-51 | 1 | HARNESS／OS | admission結果分類・scope・authority検査。RFA候補の発効と照合 |
| HIL-FR-52 | 1 | OS・意味変更要 | Markdown更新の一律記述と旧JSON／transaction境界をhistorical sourceとして照合し、新世代authorityを再定義 |
| HIL-FR-53 | 1 | OS | asset identity・意味revision・移動／分割／統合の履歴 |
| HIL-FR-54 | 1 | HARNESS／OS | portfolioの条件と導出・重複／未被覆検出 |
| HIL-FR-55 | 1 | HARNESS／OS | positive／negative例の十分性条件とcoverage評価 |
| HIL-FR-56 | 1 | HARNESS／OS | style・Discovery接続条件とportfolio routing |
| HIL-FR-57 | 1 | OS | judgment pack登録・適用・合成・競合検出 |
| HIL-FR-58 | 1 | OS | judgment packのshadow比較・独立review・段階昇格 |
| HIL-FR-59 | 1 | OS | 専門agent contract生成と入力・出力・権限・予算拘束 |
| HIL-FR-60 | 1 | OS | 専門化の実益評価・muster・担当分離・lease検査 |
| HIL-FR-61 | 1 | OS | worker smoke／full benchと盲検・採用判断 |
| HIL-FR-62 | 1 | OS | 実task scorecard・実効費用・用途別採用 |
| HIL-FR-63 | 1 | OS | model／effort選択の比較根拠。固定既定値の現行適用範囲を照合 |
| HIL-FR-64 | 1 | OS | 第三者worker sandbox・通信・設定差分・quarantine |
| HIL-FR-65 | 1 | OS | 委譲環境変数・stdin・timeoutの制御 |
| HIL-FR-66 | 1 | OS | 第三者出力のNode再検証と許可範囲外副作用の拒否 |
| HIL-FR-67 | 1 | OS | 払い出しpayload最小化・履歴除外・secret検査 |
| HIL-FR-68 | 1 | OS | 委譲イベント・応答policy・adapter契約。ACPは採用確定としない |
| HIL-FR-69 | 1 | OS | 第三者委譲の構成・データ分類・bypass期間・quota・FS証拠 |

HARNESS／OSの行は、工程・提供契約の定義をHARNESS、状態管理・実行・記録をOSへ分割する。
旧FR中の固定画面状態数、固定CI段階、既定effort、exact source範囲等は、表に省略したことを削除根拠にしない。
採否・適用範囲・根拠revisionを原文と詳細契約から確認し、個別条件を移管する。
BR・NFR・TRの対応表と合わせて153 IDを照合するが、本文読取りと対象判断はL2合意・契約被覆・実装・受入の証拠ではない。
