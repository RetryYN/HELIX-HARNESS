# Concept・Vision・Package取込対応表

状態: 整理中。要求承認、実装完了、公開版の確定を表さない。

## 入力と基準

- 入力: `HELIX_Concept＆Vision.zip`、2026-09-06受領。
- ZIP SHA-256: `c6faf07352063a1715f07aedb4b2c551716f2f401611ff4db1ff2624f01a90b0`
- 照合基準main: `0f733a9a034759521ad38ac6b92c8c5a39f7b9a1`
- 同梱10 Markdown文書は同梱SHA256SUMSと一致。パスに絶対パス・親ディレクトリ参照なし。
- 全10文書を通読済み。階層調査evidenceの主張と現在mainとの独立照合は未完了。
- 原文保存先: `docs/archive/intake/2026-09-06-concept-vision/`。10文書とSHA256SUMSを保存し、`sha256sum -c SHA256SUMS.txt` は10/10一致、exit 0。原文の参照不整合も改変せず保持し、整理版で補正する。

原文に含まれる過去発言の引用や調査者の確認記録を、今回の承認や今回実施した検証へ転用しない。

## 版管理の対応方針

| 提案の対象 | 束縛先 | 自動的に確定しないもの |
| --- | --- | --- |
| Concept v0.1 / Vision v0.1 | 文書revision、原文digest、採用差分 | 既存Concept v4承認の取消・同一視 |
| Vision 1.0〜5.0 | 長期能力目標、対象要求の参照 | 公開SemVer、現在の実装分母、G評価 |
| PKG-D01〜13 | 利用者向け提供view、既存Module所有Sliceの選択 | 新しいコードowner、独立公開版 |
| Module | 既存primary owner、path、artifact | Packageへの所有権移管 |
| Functional Release Slice | 検証、昇格、互換性、更新・rollback | 文書IDからの正式採番 |
| Bundle / Profile | Module/Sliceのexact構成lock | 設定版と公開版の同一視 |
| Artifact | source HEAD、構成、digest、検収receipt | 同一公開版のbytes上書き |
| Deployment | 環境、適用revision、receipt | 配布物不変時の製品版変更 |

同じ公開実体のPackageとBundleには版台帳を二重に作らない。正式な公開実体が未確定なら公開版も未確定とする。

## 既存責務への接続候補

| 差分 | 接続先 | 分類・残確認 |
| --- | --- | --- |
| 版・owner・要求・証拠の対応 | #1500 Capability/Release Portfolio | 既存Issue本文を照合済み。管理projectionであり新しい意味正本にしない |
| Package提供範囲とModule/Slice/Bundle | #1494 / #1073 / #1074 | 要求差分候補。現行L1/L3/L10との項目別比較が必要 |
| 全体・開発・成長の分類 | World Governance | 分類差分候補。新しい統合writerを作らない |
| Gene / Genome / 発現 | 既存Learning/Knowledge/Context | 説明語彙。runtime enum・別DBを追加しない |
| Web / HDA / FACTORY / System Compiler | 長期Vision参照 | future-only。現在範囲へ必須依存を追加しない |

提供範囲は対象製品の開発責務と必要基盤。HELIX自身の統治・学習・公開工場の暗黙同梱を避ける一方、必要な安全・品質・証拠を削らない。既存consumer構成の変更は別途parity・依存閉包・更新/rollbackで検収する。

## 入力文書の補正対象

1. Conceptの `basis/` 参照4件は同梱配置と不一致。編集版で同梱文書の実配置へ修正する。
2. Visionの別ZIP・roadmap JSON同梱という記述は今回の入力に一致しない。編集版は実inventoryに合わせる。
3. `DECISIONS_v0.6.md` と `history/v0.5/HELIX_RELEASE_AND_GENERATION_RESEARCH_v0.5.md` はZIPにない。出典欠落として表示し、内容を創作しない。
4. 46旧成果、325 node、295 relation、35 Gate、29受渡しは入力資料の主張。現在mainの実測件数へ転用しない。

## 完了条件と削除条件

- 全入力文書を保持し、編集版との差分を追跡する。
- Concept/Visionの説明と要求変更を分け、要求変更は既存要求・受入へ戻す。
- 旧成果の全件対応で欠落・二重所有・未所属を明示する。
- 参照解決、文書版、原文digest、既存要求への対応を検証する。
- 保存先がcommitで復元可能になり、内容保存を再検証してから元ZIPを削除する。
- 現在は原文のローカル保存・hash検証まで完了。commit保存、整理版の正式配置、要求差分反映、独立検収は未完了。元ZIP削除も未実施。
