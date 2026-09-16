# HELIX 整理・VISION・CONCEPT 取込パケット

## 目的
このZIPは、2026-09-06までに整理したHELIXの責務境界・外部提供Package・長期VISION・生物学CONCEPTを、既存HELIXへ安全に取り込むための入力パケットである。

**このパケット自体は新しい意味正本、runtime設定、実装完了宣言ではない。** 既存Requirement IR、L1-L12、Module/Slice/Bundle、owner、独立review、品質・安全・公開権限を優先する。

## 読取順
1. `current/HELIX_CATALOG_INTAKE_v0.6.md`
2. `current/HELIX_DEVELOPMENT_PACKAGE_CATALOG_v0.6.md`
3. `current/HELIX_RELEASE_AND_VERSION_CATALOG_v0.6.md`
4. `vision/HELIX_VISION_INTAKE_v0.1.md`
5. `vision/HELIX_VISION_v0.1.md`
6. `concept/HELIX_CONCEPT_INTAKE_v0.1.md`
7. `concept/HELIX_CONCEPT_v0.1.md`
8. 必要時のみ `evidence/HELIX_EXISTING_HIERARCHY_AND_TRANSITIONS_v0.1.md`

## 取り込み原則
- 外部提供単位は対象製品の**開発責務**に限定する。内部統治・自己計測・学習・機構創出・HELIX自身の公開工場は暗黙同梱しない。
- Packageは利用者視点、Moduleは所有、Functional Release Sliceは検証・昇格・更新/rollback、Bundle/Profileは構成として別関係を維持する。
- 品質判定、安全許可、worker出力受理、独立review、親受入、merge、Release、Deploymentを統合flagへ潰さない。
- VISION 1.0〜5.0、HELIX-Web、HELIX-FACTORY、MARKETING、HDA、System Compilerは未来構想。現在の1.0分母へ無条件追加しない。
- CONCEPTのDNA/Gene/Genome/発現/恒常性/免疫/アポトーシス等は説明語彙。既存ID・schema・runtime enumを名称置換しない。
- GeneはPLANではなく、経験から検証・選抜され次の仕事へ継承可能になった適応情報という概念案として扱う。
- HELIX自己改善は成長側から正規開発経路へ戻す。自己提案を自己承認・自己検収にしない。
- 未確定は未確定のまま保持し、文書存在や候補登録を実装済み・公開済みへ昇格しない。

## HELIX側で行う作業
1. 既存owner/Requirement/Design/Test/Issue/PLANと各提案の対応をread-onlyで作る。
2. `doc-only / taxonomy-only / requirement-impacting / implementation-impacting / future-only` に差分分類する。
3. doc-onlyは文書配置・相互参照だけを行う。
4. requirement-impactingのみ、影響範囲を既存L1/L3/L10・Requirement IR・承認経路へ戻す。
5. Package候補は既存Module/Slice/Bundleへ対応付け、独立consumer・依存閉包・更新/rollbackが実証される前に正式公開単位へ昇格しない。
6. VISION/CONCEPTをロードマップや実行権限の正本として利用しない。

## まず作る成果物
- VISIONとCONCEPTの正式な文書配置案
- v0.6 Package/Release整理と既存RLS/OPS/World Governanceのcrosswalk
- 衝突・重複・旧定義・意味変更が必要な箇所の一覧
- 「今取り込める文書差分」と「正規要求改版が必要な差分」の分離
- 1.0へ影響しない未来構想のparking/reference方法

## 非対象
このパケットだけを根拠に、コード移動・削除、owner移管、全件再freeze、Module/Sliceの正式採番、tag/publish/cutover、HELIX-Web実装、LLM学習、MARKETING統合、4.0/5.0機能実装を開始しない。
