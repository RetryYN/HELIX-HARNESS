# FT-DESIGN-REFACTOR-001 — 設計完了後の設計リファクタリングと反例先行検証を検討する

作業種別: research / 設計改善候補の整理
対象: HELIX-HARNESSの設計・検証契約と、BRAIN・CORE・OSおよび関係機構の接続
入力: 2026-10-15のPO指示「設計が終わったら対応」と、外部監査レビュー／Design TDD・Design CI・Design Refactor案。

## 着手順と目的

POの作業順序指示に沿い、現在進行中の基本・詳細設計と全体整合性確認の成果を点検し、設計リファクタリングと上流還流を整理する。基本設計92/92対の配置だけを「設計完了」にしない。対象revision、未閉包、既存の完了条件を確認する。順序はPO指示と上流文書から確かめ、このticket自体に依存や開始gateを持たせない。本ticketは承認済み要求の意味を保つ設計改善の調査・起草を予約し、新要求や工程の採用を確定しない。

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

## 設計から上流への還流とJSON正本の移行点検（追加指示）

2026-10-15の追加PO指示を受け、設計から見えた不足を要件・要求へ還流することと、未JSON化の要求文書を点検することを含める。形式移行と意味の是正は別々に追跡する。

確認基準main `e53935daec9cae2021424fb6c14a7b4e280b4b96`では、本体8機構のL3/L10にJSONが各3文書ずつ計48文書あり、対応する48 Markdownは「生成view・意味正本JSON」と明記されている。L2/L11は各機構1文書ずつ計16 Markdownで、同ディレクトリにJSONはない。L3/L10を未JSON化として再構築しない。この数は限定対象の充足やschema成立を証明しない。

`docs/helix-web/` と `docs/helix-web-os/` にも各L2/L11のMarkdownがあり、計4文書を別途保全する。これらは現行入口と2026-09-24の分類判断によりVision／将来候補で、本体8機構92親430対の限定設計対象ではないため今回の移行候補16文書には算入しない。扱い先は両者の既存 `candidates/`、HELIX-Webの `sources/`、現行のWeb分類・配置判断であり、所在するL2/L11ディレクトリだけから採択済み要求へ昇格しない。リファクタリング時の棚卸しで4文書の生存先・参照・将来の移行要否も確認し、黙って除外・削除しない。

- 設計だけの不足: 既存要件と対oracleを満たすようL4/L9・L5/L8を修正する。
- 要件の不足・矛盾: 元L2と対L11を確認し、該当L3/L10へ変更候補を戻す。上流・影響先・再検証を記録し、既存の委任承認経路で対象revisionを確認する。
- 要求の不足・意味変更: 目的・範囲・owner・版・受入条件を変える差分はL2/L11の候補へ戻し、人が持つ上流意味の判断へつなぐ。設計上の都合から要求を後付けしない。

還流候補ごとに、発見した設計revisionと箇所、元要求／要件／対oracle、反例、現状と提案の差、戻し先owner、影響先、処置・未完を記録する。追加のPO順序指示「還流はリファクタリング時でいい」に従い、上流還流の整理・起草・実施は設計リファクタリング時にまとめる。現在は発見箇所・根拠・戻し先候補を保存し、承認済み範囲で基本・詳細設計を進める。上流修正に依存する未成立部分は明示して保持し、還流前の設計からその部分の完了や実装Readyを生成しない。

L2/L11のJSON移行は、16文書全体からIDのある行と本文・表注・適用制限・版・N/A・保留・関係・旧source等の意味を棚卸しする。ID行だけを抽出して周辺条件を失わない。元の採択対象commit/bytes/digestと変更候補の対応を保持し、JSONへ変換しただけで既存承認を新bytesへ継承しない。生成MarkdownとJSONの二重正本を作らず、参照・consumer・既存decisionへの対応と意味同等性を独立照合する。

L3/L10についてもJSONが存在することだけで完了にせず、生成viewのdigest、対ID、要求revision、型／schemaの意味、設計へのtraceを確認する。移行候補の形式検証成功を要求承認や正式なschema/codec成立にしない。

- 設計発見を設計内修正／L3-L10還流／L2-L11還流へ分類し、未完と戻し先を追跡する。
- 8機構のL2/L11計16文書を意味単位で棚卸し、無損失JSON移行と生成viewの候補を作る。
- L3/L10の既存48 JSON正本と生成view・参照・対検証の整合を点検する。
- 形式移行と意味変更を分離し、旧承認対象と新候補の対応、影響先、独立review結果を確認する。

起点は `LEGACY-ASSET-4F5A1F0739EC1111D91D` の旧 `docs/design/helix/L4-basic-design/design-template-json-authority.md` §1〜§3（archive root内）。Requirement JSON・構造的意味と生成viewの分離、二重authority拒否、finding/proposalとして上流へ戻す意味を保持する。現行のOS053 JSON正本とHARNESS004 trace/影響、008要求形成の境界へ再導出し、旧schema/runtimeやMarkdownからの無断reverse writeを移植しない。変更理由は今回指示とL2/L11の現物差であり、全層の承認取り直しや新規一律gateを追加するものではない。

## 旧資産との対応と差分

- `LEGACY-ASSET-603D0E8D8193914F4AC0`: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/design-refactoring-domain-model.md` §0〜§1。意味署名、consumer/oracle、意味保存、見た目だけの共通化拒否を起点とする。
- `LEGACY-ASSET-12E2CD9B07EFAC343ED0`: 同archiveの `docs/governance/candidates/refactoring-trigger-admission-requirements.md` RTG-R-02〜06。件数だけで改善を強制しないこと、scope／未評価／意味変更の戻し先を保持する。
- `LEGACY-ASSET-5E22432B0A5A8F7CC8B3`: 同archiveの `docs/governance/ddd-tdd-rules.md` 行23〜27、117〜120。実欠陥を識別するRed、意味保存Refactor、unknown impactと省略の扱いを確認した。
- 旧失敗のconsumer漏れ、stale／偽oracle、名称だけの統合を負例へ保持する。旧runtime・CI・DB・旧層番号・旧一律full/nightly既定やgateは移植しない。

処置は意味の再導出候補。変更点は設計変更を対象にした反例先行／profile候補への具体化で、理由は今回のPO指示と横断設計の不整合防止。既存要求を越える点は差分として分離し、既存の上流判断経路へ戻す。Issueで新しい承認手続きを作らない。

## 作業の確認と戻し先

- 着手対象revisionと現行設計の完了確認、残課題との境界を記録する。
- 5観点を元要求・対検証・旧source・consumerへ双方向に対応付ける。
- 最小の具体例で変更前Red→最小修正→意味保存Refactorと独立照合の実行可能性を示す。
- 影響集合・省略／回収・unknown時の拡大条件を既存契約と照合する。
- 重複削減後も原oracleの識別力・要求被覆・追跡が残ることを確認する。
- profileの既存範囲／新規候補／未成立を分け、独立reviewの指摘・未review範囲を記録する。

要求意味・public behavior・保存schema／migration・authorityの変更を見つけた場合は、単なるRefactorとして押し通さず既存のBackflow／Redesign等へ戻す。現行の設計作業で見つかった不足は根拠・影響先とともに保全し、設計内で修正するものとリファクタリング時に上流へ還流するものを追跡する。

本ticketから新世代CIの実装・起動、製品実装Ready、release／deploy、要求採用を生成しない。

関連: #3051（技術候補T02/T03/T04）、#1906（旧Refactor能力棚卸し）、#1814（要求間の責務重複）。既存Issueは別scopeで継続する。
