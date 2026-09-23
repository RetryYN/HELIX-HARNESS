# Concept機構・導入版・製品属性 要求対応表

親：[HELIX Concept](../../concept/helix-concept.md)。status: **再配置候補・authority_effect: none**。対象Conceptは現行の単一ファイルであり、後の版の能力を前の版の完成条件にしない。

## 既存資料と設置理由

既存の[旧Concept由来要求crosswalk](legacy-concept-derived-requirements.md)はHCV4-L2の6件とHARNESS／OSへの分割だけを扱い、旧IR 153件、4対象L2、DTK、L1-COV、およびConceptの機構×版×製品属性を全件同一粒度で扱わない。既存本文は歴史的な6件の移管候補として更新して残し、本表をその接続先として新設した。各原要求の全列は[JSONL](concept-mechanism-version-requirement-crosswalk.jsonl)に置く。現行の意味正本ではなく、POと独立reviewが行ごとの原文と差分を照合するための候補表である。

## 判定と出所

- 維持：意味・制約・受入をそのまま使う。改変：意味を保ち、担当・分割・接続・具体化を変える。不採用候補：旧実現方式を持ち込まず、目的は消さない。追加：分離構成に必要な接続・運用・受入を補う。いずれも本表の候補であり、原authorityや採否を変更しない。
- JSONLの`original_text`は原文、`original_constraint`は原表の確認結果・制約またはIR acceptance IDである。`semantic_digest`はIRについてsourceのdigestを転記した。現行L2・DTKの51行は要求文UTF-8 bytes、L1-COVの4行と1.0土台の7行は原表の1行全体のUTF-8 bytesをSHA-256で算出した暫定追跡値である。各行の`digest_method`に対象を記録し、原文と文書revisionは`source_location`と`source_revision`で辿る。
- IRは[carry-forward台帳](../legacy-requirement-carry-forward.jsonl)の原ID・revision・原文・digest・source pointerを転記し、`target_assessment`を責務候補として扱った。既存のroutingはsuccessor確定ではない。現行4対象L2とL11はすべてdraft、DTKはdraft candidate、L1-COVは監査work unitであり要求IDではない。
- 製品属性は機構別に`mechanism_product_attributes`へ記録する。HARNESSとWebのみ`製品`、OS・Web-OS・BRAIN・LABO・Intelligence・Securityは`非製品`、CONNECTとRunner／Sandboxは`共通部品`である。HARNESS内のサービス①〜⑦／入口／枠／部品／コアは独立した`harness_placement`へ記録し、製品属性と混ぜない。複数機構の行は単一ownerの意味ではない。
- `version_target`はConceptの導入版と照らした**印**であり、採択済みrelease scopeではない。`version_1_0_foundation_candidate=true`は下表の仮ID 7行だけに付け、既存要求の部分候補と全条件被覆を区別する。HARNESS内区分を特定できない行は未特定に保持し、検索範囲と結果を各行に記録した。
- 原要求が複数機構へ跨る行は、単体と接続の両方を後続要求で立てて合成被覆を検証する。`mechanism_candidate`の配列は複数責務の候補であり、単一の混在ownerを作らない。原IDを消さず、意味変更と担当移動を独立列にした。

## 旧HELIX照合

旧`root/CLAUDE.md:72-85`のinventory-first・自律境界、`root/docs/process/modes/version-up.md:16-35`の将来版保全と`version_target`、`root/docs/process/modes/add-feature.md:9-18`の既存層への追補を確認した。資産明細台帳の`LEGACY-ASSET-A60CF91DD2AF6693E6F9`（IR requirements.json、source snapshot preservation）、`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`（infinity-loop L1要求、source snapshot preservation）、`LEGACY-ASSET-DD53551C74BB4939A325`（Vision、unresolved）、`LEGACY-ASSET-425B20B6CF26326D0461`（旧Concept v4要求、unresolved）を照合した。原文の価値と出典・保全状態を保持し、旧Package／四対象routingを現Conceptの製品数・完成版・実装方式へ昇格しない。旧sourceのconsumer refsが空の行はconsumer不存在の証明ではない。旧test／CLI／CIは実行していない。

## 対応の分母と未決

| 集合 | 行数 | 原authority | 現在の扱い |
|---|---:|---|---|
| 4対象L2 | 37 | draft | Conceptとの差分と各L11を候補として照合 |
| HIL IR | 153 | specified/frozen（旧source） | 原意味を保持し、routingを候補化。successor確定0 |
| DTK | 14 | draft candidate | HARNESS工程契約とOS管理・推進・検収の接続候補 |
| L1-COV | 4 | coverage audit only | 監査work unit。正式要求IDとしない |
| 1.0土台の不足補完 | 7 | Concept意味は承認済み、要求ID未採番 | 全条件被覆の未証明箇所を仮IDで候補化 |

旧confirmed文書identity 175件等の別母集団は[carry-forward状況](../requirement-carry-forward-status.md)で保持され、IR 153件と合算しない。今回指定された系列の215行を記録したことを、旧資産全量のatom化や移管完了へ読み替えない。

## 1.0から入れる土台の確認

| Conceptの土台 | 既存要求の部分候補 | 残る照合・追加候補 |
|---|---|---|
| ログと証拠 | HELIXOS-L2-007、HILのログ・証拠行 | 能力・モデル版とepisodeの全機構共通形 → 仮ID-BASE-01 |
| データの利用区分 | HELIXWEBOS-L2-006、HILのdata scope行 | 出典・権利・機密・学習用／評価用の区分 → 仮ID-BASE-02 |
| 計測 | HELIXOS-L2-005、L1-COV-G5-WORKER-OPTIMIZATION | 品質・費用・時間・再作業・失敗の構成版別計測 → 仮ID-BASE-03 |
| 接続契約と版 | HELIXWEBOS-L2-002、HELIXWEB-L2-007 | 能力名・相関ID・期限・冪等キー・結果状態の全機構契約 → 仮ID-BASE-04 |
| 隔離の単位 | HELIXWEBOS-L2-001、HILの隔離行 | 1.0の全記録・権限・資源へのproject／tenant／環境付与 → 仮ID-BASE-05 |
| 構成版の固定と切戻し | HELIXOS-L2-006、HELIXWEBOS-L2-002 | 実行job単位の能力・モデル・構成固定と段階適用 → 仮ID-BASE-06 |
| 後から加わる機構の受け口 | HELIXWEBOS-L2-006、HELIXOS-L2-005 | 1.0時点の評価・学習入力記録と後発機構の接続 → 仮ID-BASE-07 |

部分候補だけではConceptの一行全体を満たすと証明できないため、仮IDは不足分の**追加候補**である。3.0の学習処理、4.0の動的フロー生成などを1.0へ前倒ししない。

## 責務の検収境界

BRAINは稼働時の理解・計画・予測・診断、Intelligenceは3.0から知識・モデルを改善する。LABOは1.0から効果・退行を独立評価し、学習処理は担わない。OSの管理は登録と状態、推進はticket graphとworkflow、検収はCI・testの選定と独立確認を担う。Web-OSは1.xから顧客tenant・job・service運転を担い、OSの内部stateを共有しない。HARNESSは7サービスと入口・枠・部品・コアの工程・検証契約を持ち、OS内部DB・Worker pool・学習履歴を利用者の必須構成にしない。

**人間判断に渡す項目**は[判断パッケージ](concept-requirement-po-decision-packet.md)に、担当移動・技術変更のみの作業は同書のAI作業一覧に分離した。
