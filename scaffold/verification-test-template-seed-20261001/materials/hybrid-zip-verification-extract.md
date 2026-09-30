# 材料抽出 04：ハイブリッド設計ドキュメントZIPの検証・テスト系テンプレート

status: scaffold（調査材料。採否、要求、設計、実装の決定ではない）
authority_effect: none
binding: [SCF-B-0153](../../bindings/SCF-B-0153.json)

- 対象：`archive/reference-sources/ハイブリッド設計ドキュメントv1-fixed.zip`（SHA-256 `9c547ba8bc9eaf3a12f27254fd3eb6d04b37fb8c899f13d56ceb0d2cff179fb3`、`archive/reference-sources/MANIFEST.sha256` 5行目と一致）。
- 読み方：Pythonの`zipfile`でentryを読み、YAMLとMarkdownは本文を、見本のxlsxは`openpyxl`でセルの値だけを読んだ。ZIP内のtool（`tools/*.py`、`build.py detect`等）は実行していない。現行pathへcopyしていない。
- `source-inventory.md` §5 gap 8（ZIP catalogの未抽出）を埋めるための抽出である。先行の調査`scaffold/design-pattern-inventory-20260925/README.md`（SCF-B-0151）は、この群を「検証・受入・テスト」束（44行）として一覧していたが、中身を読んでいなかった。
- 同READMEの旧判断 HVM-REJECT-01〜03（101–103行：Python generator／Excel builderを移植しない、53文書を一律必須にしない、Excel buildを完了証跡の正本にしない）を、本抽出でも守る。

## 1. 読んだentry

| entry | SHA-256 | 中身 |
|---|---|---|
| `hybrid-docgen/templates/28_検証設計書.yaml` | `740af962617ec39ef6be584bac2918838526b8416680f60d0c47a596dbbb4835` | 章立てだけ（検証方針・方式、検証マトリクス、技法カタログ、テストデータ、カバレッジ基準、リスクベース、エントリ／エグジット基準、契約テスト） |
| `hybrid-docgen/build/md/28_検証設計書.md` | `80296363916b47afe036304bf9b52b746cc6c3b905f87e45a40197b8468c626d` | 28の見本本文 |
| `hybrid-docgen/templates/12_テスト計画書.yaml` | `c3d359c68b5af9270ec6aadd095e8efe188cd817f8a7bf0a3bd6d58e14ed74d7` | 章立て（戦略のVモデル対応、環境、日程、完了基準、不具合管理、結果報告） |
| `hybrid-docgen/templates/29_受入基準・BDDシナリオ.yaml` | `5551b43d83e64bda18e8b3af14f5f46df9b026b860df8146c364e921947522ab` | 章立て（Example Mapping、Gherkin、アウトライン、受入基準一覧とUS→ACの親子） |
| `hybrid-docgen/build/09_受入テスト設計書_見本.xlsx` | `b58e14de47b7497506cb050118dd37fee5b4703d8587958e9ef17817acbe6fd3` | 受入の観点、ケース、重要度の定義 |
| `hybrid-docgen/build/51_画面検証(UIテスト)設計_見本.xlsx` | `f4d84078bc623a80cc3c833c64796503e5526ef9a387471de127c4c6431b3913` | 画面検証の種別、E2E、VRT、互換、a11y、データ、CI |
| `hybrid-docgen/build/53_PoC検証設計書_見本.xlsx` | `8380abc74113242077c1a725751f9f089301ac37512af088c8da391957d22bab` | 仮説、検証項目、成功基準とGo／No-Go、結果、引継ぎ・破棄 |
| `hybrid-docgen/build/49_AI成果物検証設計_見本.xlsx` | `737d14688658b6a0926cc2ff99370d80f7e15f1f98b0783449b76a08b9b6b29d` | AI出力の観点7つ、検証の流れ、成果物別の受入、Eval、grounding、guardrail、3層防御 |
| `hybrid-docgen/build/md/107_Vモデル・レベル定義.md` | `b5f337a19fe1658495869b91b7c98770141d502aeaa7e456f0a5f630498f4e17` | L1〜L12の対、テスト設計のシフトレフト、駆動方向をriskで決める |
| `hybrid-docgen/build/md/109_QA診断・品質チェックリスト.md` | `31c0ca38c9391c6c8203c63fbfad2e2532bd1cb1986875853d7798d5b5a9301e` | 診断6種、ISO/IEC 25010の特性別診断、Go／No-Go、スモークの最小集合 |
| `hybrid-docgen/build/md/101_性能試験計画書.md` | `b93906779fceffea7343bfbdd4540fd59de7e8bb27de804445826f7fef5a644f` | 目標と出所、通常・ピーク・スパイク・持続の負荷モデル |

見本の値（TeamFlowという架空製品、担当者名、目標値、SC-/F-/NF-等のID）は例であり、写さない。

## 2. 抽出した意味atomと行き先

| # | atom | 出典 | 行き先 | 扱い |
|---|---|---|---|---|
| Z1 | 検証の方式を4つ（テスト、レビュー・検査、分析、実機での実証）に分け、組み合わせる | 28 第1章 | DT-VT-004 §1 | 保持。IADT（inspection、analysis、demonstration、test）として一般的な分類 |
| Z2 | 要件ごとに、方式・レベル・技法・ケースIDを一意に対応づける検証マトリクス | 28 第2章 | DT-VT-004 §2 | 保持。ID体系は写さない |
| Z3 | 技法を対象の特性で使い分ける（同値、境界、デシジョン、状態遷移、ペアワイズ、経験ベース） | 28 第3章 | DT-VT-002（既存カードC04〜C07で被覆） | 重複のため新設しない |
| Z4 | テストデータ：正常・異常・境界・空・最大、テナント分離用の複数テナント、マスキング、seedで再現可能 | 28 第4章、51 第7章 | DT-VT-004 §4 | 保持 |
| Z5 | カバレッジ基準（要件網羅、同値・境界を最低1件、全状態・全許可遷移、全規則、分岐） | 28 第5章 | DT-VT-004 §3 | 観点は保持。**数値の目標は置かない**（HARNESS-L2で未採択） |
| Z6 | リスクベース（影響×発生確率で厚く配分、低riskは削減） | 28 第6章 | DT-VT-003（既存）、DT-VT-004 §5 | 保持 |
| Z7 | レベルごとのエントリ（開始）／エグジット（完了）基準 | 28 第7章 | DT-VT-004 §6 | 形は保持。「GA可」のような出荷判断は写さない（Release Portの別契約） |
| Z8 | 画面検証の種別（プロトタイプ検証をL2凍結前の関門、コンポーネント、E2E、VRT、クロスブラウザ、レスポンシブ、a11y） | 51 第2章 | DT-VT-005 §1 | 保持。プロトタイプ検証はHARNESS-L2-003のL2.5へ読み替える |
| Z9 | VRTの差分は人がレビューして確定し、主要状態（空、エラー、多言語）を対象にする | 51 第4章 | DT-VT-005 §3 | 保持。旧HELIXの差分分類a/b/cと合わせる |
| Z10 | E2E・VRT・a11yの失敗は「マージ不可」 | 51 第8章 | 採らない | merge admissionは現行の運用規則が持つ。templateが新しいmerge条件を作らない |
| Z11 | PoC：検証仮説と不確実性（技術・価値・事業）、検証項目と方法、成功基準、結果、Go時の引継ぎとNo-Go時の破棄・方針転換、使い捨て前提 | 53 全章 | DT-VT-006 | 保持。Go／No-Goは「要求へ還流する材料」とし、L3凍結の判断はHARNESS-L2-003の合意による |
| Z12 | AI出力の観点7つ（正確性、幻覚、根拠・出典、一貫性・完全性、安全性、機密・PII・ライセンス、バイアス） | 49 第2章 | DT-VT-007 §1 | 保持 |
| Z13 | AI生成 → 自動チェック → レビュー → 受入判定 → 記録、不合格は再生成へ戻す | 49 第3章 | DT-VT-007 §2 | 流れは保持。受入判定の主体は現行の役割分担（独立review、人の上流判断）による |
| Z14 | 構造ゲートのgreenは「壊れていない」の意味で品質の証明ではない。3層（構造ゲート、敵対検証、人の抜き打ち）で各層の残余を次層が拾う | 49 第9章 | DT-VT-007 §3 | 考え方は保持。**人の抜き打ちの比率・頻度は採らない**（人の作業と判断を増やすため、POの判断なしに入れない） |
| Z15 | 攻撃者・防御者はblindで別session・別modelとし、作成に関与したmodelは就けない。no_attackは安全の証明でなくPASS-WEAK | 49 9-1 | DT-VT-007 §3、DT-VT-002 C36 | 保持 |
| Z16 | L1〜L12の対（単体⇔詳細、結合⇔基本、総合⇔要件、受入⇔要求、運用⇔企画）とテスト設計のシフトレフト | 107 第2章、28 第9章 | DT-VT-101〜106（既存） | 現行HARNESS-L2-040の6組と一致。名称は現行の要求文に合わせる |
| Z17 | 駆動の方向（テスト先／実装先）をriskの所在で決める | 107 第3章 | DT-VT-003の候補 | 本版では採らず、後続の候補として残す |
| Z18 | ISO/IEC 25010の特性ごとに、測定できる形で診断内容を書く（「十分に速い」は不可）。結果は済・指摘・対象外（理由） | 109 第2章 | DT-VT-004 §7 | 保持 |
| Z19 | Go／No-Goチェックリスト、条件付きGoはリスク受容の記録がある場合だけ、迷ったらNo-Go側 | 109 第3章 | 採らない | 出荷の判断はRelease Portの契約と、不可逆な外部作用への明示の許可による（AGENTS.md）。templateが判定手続きを作らない |
| Z20 | スモーク・回帰の最小集合を既存のテストIDから選び、新しいIDを作らない | 109 第4章 | DT-VT-101の候補 | 本版では採らない。Web展開後の運用で扱う |
| Z21 | 性能の目標に出所（要件ID、SLO）を持たせ、通常・ピーク・スパイク・持続の負荷モデルを作る | 101 第2・3章 | DT-VT-002 C30（既存） | 既存カードとHARNESS-L2-034で被覆 |

## 3. 採らないもの

- ZIPのtool、`python tools/build.py detect`等のcommand、`spec.defines`／`traces_from`等のagent欄、Excelの出力（HVM-REJECT-01・03）。
- 53文書の一律必須化（HVM-REJECT-02）。本抽出で作ったtemplateも、対象ごとに適用を判定する。
- 見本の値、架空製品のID、担当者名。
- merge、release、GAの可否をtemplateが決めること（Z10、Z19）。
