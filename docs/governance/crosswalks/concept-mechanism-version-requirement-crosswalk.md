# Concept機構・導入版・製品属性 要求対応表

親：[HELIX Concept](../../concept/helix-concept.md)。status: **再配置候補・authority_effect: none**。対象Conceptは現行の単一ファイルであり、後の版の能力を前の版の完成条件にしない。

## 既存資料と設置理由

既存の[旧Concept由来要求crosswalk](legacy-concept-derived-requirements.md)はHCV4-L2の6件とHARNESS／OSへの分割だけを扱い、旧IR 153件、4対象L2、DTK、L1-COV、およびConceptの機構×版×製品属性を全件同一粒度で扱わない。既存本文は歴史的な6件の移管候補として更新して残し、本表をその接続先として新設した。各原要求の全列は[JSONL](concept-mechanism-version-requirement-crosswalk.jsonl)に置く。現行の意味正本ではなく、POと独立reviewが行ごとの原文と差分を照合するための候補表である。

## 判定と出所

- 維持：意味・制約・受入をそのまま使う。改変：意味を保ち、担当・分割・接続・具体化を変える。不採用候補：旧実現方式を持ち込まず、目的は消さない。追加：分離構成に必要な接続・運用・受入を補う。いずれも本表の候補であり、原authorityや採否を変更しない。
- JSONLの`original_text`は原文、`original_constraint`は原表の確認結果・制約またはIR acceptance IDである。`semantic_digest`はIRについてsourceのdigestを転記した。現行L2・DTKの51行は要求文UTF-8 bytes、L1-COVの4行と1.0土台の7行は原表の1行全体のUTF-8 bytesをSHA-256で算出した暫定追跡値である。各行の`digest_method`に対象を記録し、原文と文書revisionは`source_location`と`source_revision`で辿る。
- IRは[carry-forward台帳](../legacy-requirement-carry-forward.jsonl)の原ID・revision・原文・digest・source pointerを転記し、`target_assessment`を責務候補として扱った。既存のroutingはsuccessor確定ではない。HARNESS・OSのL2候補22件はdraft、DTKはdraft candidate、L1-COVは監査work unitであり要求IDではない。Web・Web-OSの旧L2候補15件は、2026-09-24のPO判断によりVision材料へ分類され、要求・要件として数えない。
- 製品属性は機構別に`mechanism_product_attributes`へ記録する。HARNESSとWebのみ`製品`、OS・Web-OS・BRAIN・LABO・Intelligence・Securityは`非製品`、CONNECTとRunner／Sandboxは`共通部品`である。HARNESS内のサービス①〜⑦／入口／枠／部品／コアは独立した`harness_placement`へ記録し、製品属性と混ぜない。複数機構の行は単一ownerの意味ではない。
- `version_target`はConceptの導入版と照らした**印**であり、採択済みrelease scopeではない。`version_1_0_foundation_candidate=true`は下表の仮ID 7行だけに付け、既存要求の部分候補と全条件被覆を区別する。HARNESS内区分を特定できない行は未特定に保持し、検索範囲と結果を各行に記録した。
- 原要求が複数機構へ跨る行は、単体と接続の両方を後続要求で立てて合成被覆を検証する。`mechanism_candidate`の配列は複数責務の候補であり、単一の混在ownerを作らない。原IDを消さず、意味変更と担当移動を独立列にした。
- HILは旧routingをそのまま現行ownerへ昇格しない。HARNESSの契約だけを定める行にOSを機械的に加えず、OSへ渡す証拠や登録は`connection_target`に置く。GitHub event intakeはCONNECTとOSを分け、三段CIの旧固定方式は1.0の証拠lineage候補と別にPO未決として残す。pack運用・gap評価と3.0 Intelligenceの学習も版を分ける。

## 2026-09-24／25のPO判断反映

- 2026-09-24の[Concept・要求対応判断](../decisions/concept-requirement-po-decisions-2026-09-24.md)により、HELIX-WebとHELIX-Web-OSの旧L1・L2は要求層から外れ、Vision材料となった。crosswalk JSONLでは原文・過去の原文digestを保ち、`current_placement`・`disposition_candidate`・`source_authority_state`で現在の位置を示す。要求化する範囲や導入版は未確定である。
- 2026-09-25の[BRAIN・ヘリックスコア判断](../decisions/brain-helix-core-po-intent-2026-09-25.md)では、BRAINを汎用パターン、HARNESSのヘリックスコアを製品固有の意味・設計として接続する方向が記録された。HARNESS-L2-008／009の配列・配置候補はこの判断に合わせたが、要求文の整合、connectorの担当、BRAIN稼働中の役割は未決のままにした。
- 2026-09-25の[機構配置判断](../decisions/mechanism-placement-po-decisions-2026-09-25.md)により、HELIXOS-L2-005はOSの登録・振分けとLABOの評価・研究へ分担し、HELIXOS-L2-012／013は元IDの案内行をOSに残してLABO候補へ移管した。crosswalkの`previous_source_location`から移管前を、`source_location`から現在の候補本文を辿れる。LABO L1がないため候補状態を維持する。

旧HELIXとの対応は、[pillar requirements](../../../archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/pillar-requirements.md#L54-L57)のHBR-P4／P7／P8、[modes README](../../../archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md#L29-L47)、[旧inventory-firstと自律境界](../../../archive/legacy-generation-2026-09-14/root/CLAUDE.md#L72-L85)、および[完全一致再利用統制](../legacy-asset-reuse-control.md)を照合した。旧配置を現行担当へ自動昇格せず、旧原文とauthorityはGit履歴・snapshotの記録を保持する。旧runtime・tool・test・CIは実行していない。

## 旧HELIX照合

旧`root/CLAUDE.md:72-85`のinventory-first・自律境界、`root/docs/process/modes/version-up.md:16-35`の将来版保全と`version_target`、`root/docs/process/modes/add-feature.md:9-18`の既存層への追補を確認した。資産明細台帳の`LEGACY-ASSET-A60CF91DD2AF6693E6F9`（IR requirements.json、source snapshot preservation）、`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`（infinity-loop L1要求、source snapshot preservation）、`LEGACY-ASSET-DD53551C74BB4939A325`（Vision、unresolved）、`LEGACY-ASSET-425B20B6CF26326D0461`（旧Concept v4要求、unresolved）を照合した。原文の価値と出典・保全状態を保持し、旧Package／四対象routingを現Conceptの製品数・完成版・実装方式へ昇格しない。旧sourceのconsumer refsが空の行はconsumer不存在の証明ではない。旧test／CLI／CIは実行していない。

## 対応の分母と未決

| 集合 | 行数 | 原authority | 現在の扱い |
|---|---:|---|---|
| HARNESS・OS L2 | 22 | draft | Conceptとの差分と各L11を候補として照合 |
| Web・Web-OSの旧L2 | 15 | Vision材料 | PO判断により要求層から除外。ファイル移動はせず、将来の要求化と担当機構は未確定 |
| HIL IR | 153 | specified/frozen（旧source） | 原意味を保持し、routingを候補化。successor確定0 |
| DTK | 14 | draft candidate | HARNESS工程契約とOS管理・推進・検収の接続候補 |
| L1-COV | 4 | coverage audit only | 監査work unit。正式要求IDとしない |
| 1.0土台の不足補完 | 7 | Concept意味は承認済み、要求ID未採番 | 全条件被覆の未証明箇所を仮IDで候補化 |

旧confirmed文書identity 175件等の別母集団は[carry-forward状況](../requirement-carry-forward-status.md)で保持され、IR 153件と合算しない。今回指定された系列の215行を記録したことを、旧資産全量のatom化や移管完了へ読み替えない。

## 1.0から入れる土台の確認

| Conceptの土台 | 既存要求の部分候補 | 残る照合・追加候補 |
|---|---|---|
| ログと証拠 | HELIXOS-L2-007、HILのログ・証拠行 | 能力・モデル版とepisodeの全機構共通形 → 仮ID-BASE-01 |
| データの利用区分 | HILのdata scope行 | 旧HELIXWEBOS-L2-006はVision材料であり、要求の部分候補として扱わない。出典・権利・機密・学習用／評価用の区分 → 仮ID-BASE-02 |
| 計測 | HELIXOS-L2-005のOS側記録・還流、HELIX-LABOの評価・研究候補、L1-COV-G5-WORKER-OPTIMIZATION | 計測要求の被覆とLABO候補の採否は未確定。品質・費用・時間・再作業・失敗の構成版別計測 → 仮ID-BASE-03 |
| 接続契約と版 | HILの接続・版行 | 旧HELIXWEBOS-L2-002とHELIXWEB-L2-007はVision材料であり、要求の部分候補として扱わない。能力名・相関ID・期限・冪等キー・結果状態の全機構契約 → 仮ID-BASE-04 |
| 隔離の単位 | HILの隔離行 | 旧HELIXWEBOS-L2-001はVision材料であり、要求の部分候補として扱わない。1.0の全記録・権限・資源へのproject／tenant／環境付与 → 仮ID-BASE-05 |
| 構成版の固定と切戻し | HELIXOS-L2-006、HILの構成版・復旧行 | 実行job単位の能力・モデル・構成固定と段階適用 → 仮ID-BASE-06 |
| 後から加わる機構の受け口 | HELIXOS-L2-005のOS側登録・振分けとHELIX-LABO候補 | HELIXOS-L2-005の改善評価・研究はLABO候補へ移管済みだが、LABOのL1と要求採否は未了。旧HELIXWEBOS-L2-006はVision材料であり、要求の部分候補として扱わない。1.0時点の評価・学習入力記録と後発機構の接続 → 仮ID-BASE-07 |

部分候補だけではConceptの一行全体を満たすと証明できないため、仮IDは不足分の**追加候補**である。3.0以降の知識・モデル改善や動的フロー生成を1.0へ前倒ししない。Intelligenceの具体的な導入版は2026-09-25のPO判断で未確定のまま残る。

## 責務の検収境界

2026-09-25のPO判断に合わせ、以下は記録済みの配置・責務候補として扱う。L2／L11や要求本文の承認にはしない。

- **HELIX-OS**はプロダクトごとの固有性を持ち、工程管理と推進を担う。ticketの計画・発行、管理・推進・検収の分担は2026-09-24の判断を候補として保持する。
- **HELIX-BRAIN**はHELIX全体に共通する汎用性を持ち、設計テンプレ等から意味に基づく構造・設計パターンを取り出す。**HARNESSのヘリックスコア**は製品固有の意味と設計を持ち、HELIX-JSONとPythonの意味導出コアを持つ。両者は接続する方針だが、接続を担う機構とBRAINの稼働中の役割は未確定である。
- **HELIX-Intelligence**は監査、ローカルLLMへの判断依頼、botやcrawlerの発行を担う方向で記録された。BRAINとIntelligenceの接続口を1.0から用意する指示はある一方、各機能の導入版と稼働開始条件は未確定である。
- **HELIX-LABO**は全体の改善研究機構として、OSから移した技術調査、横断診断、改善の評価・研究を候補として保持する。LABOのL1がないため、これらは要求ではなく候補である。
- **Web・Web-OS**の旧L1・L2・L11はVision材料として扱う。既存ファイルを移動せず、要求化の内容、機構分担、導入版は確定しない。

未確定の点は、BRAINの稼働中の役割、機構間接続の担当、LABOの技術調査とIntelligenceのcrawler発行の関係、Intelligenceの導入版、HELIXが保持する「原本」と利用者の「正本」の意味対応、HARNESS・BRAIN・OS間の要求文整合である。これらは3つのdecision recordに記録されたとおりPO最適ドラフトで確認する。

**人間判断に渡す項目**は[判断パッケージ](concept-requirement-po-decision-packet.md)に、担当移動・技術変更・意味を変えない版配置だけの作業は同書のAI作業一覧に分離した。現時点の内訳はPO判断71行、AI作業144行である。上流の4対象L1、5大目標、product-boundaryの現行未承認差分は同パッケージの別節に置く。
