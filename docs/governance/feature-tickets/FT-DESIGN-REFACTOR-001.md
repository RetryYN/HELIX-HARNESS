# FT-DESIGN-REFACTOR-001 — 設計完了後の設計リファクタリングと反例先行検証を検討する

作業種別: research / 設計改善候補の整理
状態: `proposed_upstream_waiting`（後続作業の予約。実装Readyではない）
対象: HELIX-HARNESSの設計・検証契約と、BRAIN・CORE・OSおよび関係機構の接続
入力: 2026-10-15のPO指示「設計が終わったら対応」と、外部監査レビュー／Design TDD・Design CI・Design Refactor案。

## 着手順と目的

現在進行中の基本・詳細設計と全体整合性確認を先に進め、その完了を確認した後に本作業へ着手する。基本設計92/92対の配置だけを「設計完了」にしない。対象revision、未閉包、既存の完了条件を確認する。本ticketは承認済み要求の意味を保つ設計改善の調査・起草を予約し、新要求や工程の採用を確定しない。

設計1周目で形成した構造を、要求・契約の具体化、全体の矛盾・重複・結合の整理へつなぐ。周回数を固定工程や新しい必須gateにはしない。

## 外部監査から保全する指摘

2026-10-15 08:21 JSTの監査対象mainは `2237fa4692c90f08eeb5ef0a0d410ccda591c1ee`。基本92/92・詳細39/92は当該時点の配置数であり、完成率ではない。

- 初回BRAIN032→CORE009→OS002のowner接続監査には7経路の未閉包があり、codecの追加だけで成立扱いにしない。
- 過去の設計不足監査は固定revisionの証拠として保存し、着手時のmainとの差分を再評価する。
- 大規模な合成fixtureの保守性、反例の識別力、元資料との対応、型の共通化に伴う意味喪失を確認する。
- 文書配置・合成期待の一致と、実装／製品CI／実物L11受入を分ける。

共有監査本文のSHA-256: `bae3449d3e277a9bf919c58522b987274b5efd358ecf2e8121bcfbcffdfbf0d0`。原入力は共有添付「HELIX-HARNESS 最新進捗フルレビュー 2026年10月15日 08:21 JST時点」。上記は外部指摘であり、着手時に一次資料へ照合する。

## 整理する5観点

- 責務: BRAINの知識提供、COREの製品適用、OSの案件・状態記録と、各機構の判断／書込権限を照合する。
- 契約: 型・schema・入出力・presence（欠落とnull）・revision・scope・失敗意味の不整合を特定する。
- 依存: producer→consumer、owner、adapter、source資格、未閉包接続を追跡する。
- 検証: 重複oracle、未評価field、弱いsubset比較、不足する反例、自己参照する期待を見直す。
- 構造: 意味とconsumer契約を比較して共通化／分離を選ぶ。同名・似たJSON形だけで統合しない。

## 設計TDD・設計CI・設計Refactorの検討案

1. 要求・対検証・旧sourceから独立して期待を導き、変更前の設計欠陥を識別する反例とoracleを先に固定する。例: 接続でnullと欠落を混同する欠陥。
2. 変更前revisionでその欠陥を検出した結果をRedとして保存する。形式エラーや期待値の自己一致だけで代用しない。
3. 最小の設計修正を行い、同じ凍結oracleで欠陥解消を照合する。
4. 要求意味・公開契約・失敗意味・consumerを維持して構造を改善し、同oracleと影響先を再照合する。
5. HARNESS005の検証義務、HARNESS015のTDD／Refactor、OS020のCI組立・運転・回収、L4/L9・L5/L8の対契約へ対応付け、設計変更用profileの可否・不足・既存範囲を明示する。

変更箇所だけを根拠に検査を省略せず、version付き影響関係から必要集合を導く。unknown・stale・広域影響は既存契約に従って範囲拡大／全体照合へ戻す。省略分は理由・回収先・未完を保持し、targeted Greenを全体Greenにしない。

設計者自身の期待だけでGreenにしない。独立reviewで反例の識別力と元要求への対応を確認する。静的設計検証のGreenと製品実装のRed→Green→Refactorを区別し、人間の要求意味判断や受入を代替しない。BRAIN／LABOへ改善材料を渡す場合も、既存の出典・知識昇格・評価境界を保持する。

## 旧資産との対応と差分

- `LEGACY-ASSET-603D0E8D8193914F4AC0`: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/design-refactoring-domain-model.md` §0〜§1。意味署名、consumer/oracle、意味保存、見た目だけの共通化拒否を起点とする。
- `LEGACY-ASSET-12E2CD9B07EFAC343ED0`: 同archiveの `docs/governance/candidates/refactoring-trigger-admission-requirements.md` RTG-R-02〜06。件数だけで改善を強制しないこと、scope／未評価／意味変更の戻し先を保持する。
- 同archiveの `docs/governance/ddd-tdd-rules.md` 行23〜27、117〜120。実欠陥を識別するRed、意味保存Refactor、unknown impactと省略の扱いを確認した。
- 旧失敗のconsumer漏れ、stale／偽oracle、名称だけの統合を負例へ保持する。旧runtime・CI・DB・旧層番号・旧一律full/nightly既定やgateは移植しない。

処置は意味の再導出候補。変更点は設計変更を対象にした反例先行／profile候補への具体化で、理由は今回のPO指示と横断設計の不整合防止。既存要求を越える点は差分として分離し、既存の上流判断経路へ戻す。Issueで新しい承認手続きを作らない。

## 作業の確認と戻し先

- [ ] 着手対象revisionと現行設計の完了確認、残課題との境界を記録する。
- [ ] 5観点を元要求・対検証・旧source・consumerへ双方向に対応付ける。
- [ ] 最小の具体例で変更前Red→最小修正→意味保存Refactorと独立照合の実行可能性を示す。
- [ ] 影響集合・省略／回収・unknown時の拡大条件を既存契約と照合する。
- [ ] 重複削減後も原oracleの識別力・要求被覆・追跡が残ることを確認する。
- [ ] profileの既存範囲／新規候補／未成立を分け、独立reviewの指摘・未review範囲を記録する。

要求意味・public behavior・保存schema／migration・authorityの変更を見つけた場合は、単なるRefactorとして押し通さず既存のBackflow／Redesign等へ戻す。現行の設計作業で見つかったblockerは、この後続Issueに移して放置しない。

本ticketから新世代CIの実装・起動、製品実装Ready、release／deploy、要求採用を生成しない。

関連: #3051（技術候補T02/T03/T04）、#1906（旧Refactor能力棚卸し）、#1814（要求間の責務重複）。既存Issueは別scopeで継続する。
