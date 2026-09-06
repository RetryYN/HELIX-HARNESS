# HELIX — 開発責務パッケージ一覧 v0.6

**外部提供の対象は開発責務。HELIX全体統治・自己計測・学習・機構発明・自己公開工場は内部に残す。** 基盤は選んだ開発責務を成立させる最小契約だけを同梱する。 [DEC06]

これはv0.5を基にした提供構成の整理です。新しいrepo監査・実装・公開版採番は行っていません。PKG-Dは文書上の候補IDです。 [V05]

## 1. Packageの定義

Packageは「利用者が、ある開発責務を実行し、利用可能な成果を受け取れる道具一式」です。配布物はtool／library／template／adapter／設定／manifestなど。利用後の成果は要求・設計・実装候補・検証結果・Release artifact・配備receipt等です。両者を混ぜません。

提供責務には要求から実装までだけでなく、検証、統合、製品リリース、配備、運用・保守、診断・回復を含めます。計測や知識の利用そのものを排除せず、**対象製品の開発に使う部分とHELIX自身を育てる部分**を分けます。 [AS-S23][AS-S25][AS-S28]

依存ゼロを要求しません。別Packageのフル導入を常に要求せず、必要Slice／契約を選択します。一方、名前だけの独立性や、必要安全機能を外して小さく見せることは認めません。 [CUR07]

## 2. 開発Package候補

前の11領域を固定個数にはせず、対象projectのCI最適化と意味保存リファクタリングを、それぞれ利用者へ独立成果を返せる候補として別カードにしました。13件は今回の提供案であり、既存の13製品や13個の実装済み機能を意味しません。

| 文書ID | 提供責務 | 主な利用後成果 |
|---|---|---|
| PKG-D01 | 要求形成・要件定義 | 要求候補台帳と未解決事項／選択根拠・人間判断・prototype合意への参照 |
| PKG-D02 | 構造・UI/UX設計 | architecture／責務・依存・データ所有の設計／data／state／failure／security等の設計義務と先行test設計 |
| PKG-D03 | 開発計画・進行統制 | 実行計画とREADY判定／委譲要求／割当／停止・再開packet |
| PKG-D04 | Worker実行・成果生成 | code／文書／検証素材等の候補artifact／実行出所・実効設定・成功／失敗／取消の記録 |
| PKG-D05 | 検証・品質保証 | verification plan／oracle対応／test／計測／独立reviewの結果 |
| PKG-D06 | CI計画・実行最適化 | CI planと実行DAG／段階別CI receipt／延期義務の行先 |
| PKG-D07 | 開発安全・隔離実行 | 許可／拒否／保留と再開条件／隔離実行結果・安全境界の証拠 |
| PKG-D08 | 変更統合・PR管理 | 親受入／拒否と統合候補／PR／merge結果と確定対象HEAD |
| PKG-D09 | 製品リリース | 検証済みartifact／manifest／provenance／製品のRelease候補・互換性・更新／rollback手順 |
| PKG-D10 | 配備・環境適用 | DeploymentManifest／Plan／Receipt／対象環境のhealth／変更証拠 |
| PKG-D11 | 運用・保守 | SLO／health／資源／接続の観測report／期限付き保守計画・未完義務 |
| PKG-D12 | 障害診断・回復 | 根拠・反証条件付きの原因候補／ChangeDiagnosis＋BackflowDecision |
| PKG-D13 | 構造改善・リファクタリング | 構造／影響／置換候補と比較根拠／意味保存refactor計画・consumer／oracle／rollback束縛 |

## 3. 提供契約と停止・受渡し

各カードの処理はnative構造を参照する提供viewです。全体が現在ひとつの実装済みpipelineとして接続しているという認定ではありません。正式Slice・path allowlist・構成lock・公開版は未確定です。

### PKG-D01 要求形成・要件定義

目的・依頼を、根拠と受入条件を持つ要求／要件へまとめる。

| 項目 | 切り出す境界 |
|---|---|
| 対象 | 対象製品の上流開発 |
| 配布する道具 | 要求候補・質問・反応の契約と操作入口／要求IR／refinementの検査・表示／前提調査・選択・責務仮説検証の対象限定profile |
| 利用後の成果 | 要求候補台帳と未解決事項／選択根拠・人間判断・prototype合意への参照／要件IR候補／差分とAC・変更影響 |
| 入力・入口 | 対象project・原文・source参照・委任範囲を入力する。調査を本実装の許可に転用しない。 |
| 完了・出口 | 採否・未解決・AC・authorityが対象revisionに結び付いた要求／要件成果を返す。未承認候補をfrozenと表示しない。 |
| 次の受渡し | PKG-D02へ設計入力、PKG-D03へ許可scopeを渡す。画面合意はPKG-D02から受け、要求の採否は本責務で保持する。 |
| 含めない範囲 | HELIX全要求の無差別同梱／HELIX Worldの全機能棚卸し／cross-project知識昇格／研究・PoCからの無承認本実装 |
| 最小基盤の検討範囲 | DF01、DF02、DF03、DF05 |
| 条件付き依存 | 継続的な候補履歴を保持するprofileのみDF04／対話・prototype参照はDF08／画面生成が必要な場合はPKG-D02の該当Sliceを選択 |
| native Moduleの再利用候補 | helix-requirements |
| native Bundleへの対応候補 | helix-requirements |
| 旧成果ID | RG03-01、RG03-02、RG03-03、RG03-04 |
| 深部索引 | H01、H04、H05、H06 |
| 実版・適格性 | 公開版null／依存閉包・単独導入・公開資格は未検収。 |
| 既存owner | #282、#1556、#1169、#1318、#397 |
| 根拠 | [AS-S04] [AS-S06] [AS-S07] [AS-S08] [V04-P09] |

内部の流れ：
1. 原文保全 → 原子化／challenge
2. 質問・調査 → 候補比較
3. prototype反応を参照 → 要求採否
4. 要件IR差分 → source／owner／AC／承認照合

停止・差戻し：
- 原文・出所不足ならその候補の確定を保留
- 人間判断や合意が必要な差分だけ待機
- candidate状態・compile状態・convergenceを同じ完了flagにしない

### PKG-D02 構造・UI/UX設計

要求を構造・契約・表現・検証義務へ具体化する。

| 項目 | 切り出す境界 |
|---|---|
| 対象 | 対象製品の設計と人間合意 |
| 配布する道具 | 設計Registry・template／原子義務の契約／構造設計・部分合成の対象限定機能／選択したmodalityのprototype／preview adapterとtrace検査 |
| 利用後の成果 | architecture／責務・依存・データ所有の設計／data／state／failure／security等の設計義務と先行test設計／UI成果、walkthrough／合意／要求backprop証拠 |
| 入力・入口 | 対象要求とrevision、制約・検証条件、必要なmodalityを入力する。L2探索の暫定入力と確定設計入力は区別する。 |
| 完了・出口 | 設計成果と検証義務を同じ要求revisionへ束縛する。宣言API・test設計を実装／test実行済みと扱わない。 |
| 次の受渡し | PKG-D01へ要求差分、PKG-D03／04へ設計入力、PKG-D05へ先行検証義務を渡す。 |
| 含めない範囲 | HELIX自身の全体再設計planner／自動的な要求採用／全modalityの暗黙同梱／単なるscreenshotによるUX検収代用 |
| 最小基盤の検討範囲 | DF01、DF02、DF03、DF05 |
| 条件付き依存 | 永続設計台帳を使うprofileはDF04／renderer起動時はDF07およびPKG-D07の必要隔離／UI操作面はDF09 |
| native Moduleの再利用候補 | helix-design |
| native Bundleへの対応候補 | helix-design |
| 旧成果ID | RG04-01、RG04-02、RG04-03 |
| 深部索引 | H05、H06、H08 |
| 実版・適格性 | 公開版null／依存閉包・単独導入・公開資格は未検収。 |
| 既存owner | #168、#175、#177、#255、#1558 |
| 根拠 | [AS-S01] [AS-S07] [AS-S08] [AS-S11] [AS-S27] [V04-N17] |

内部の流れ：
1. requirement → capability → service → domain objectの導出参照
2. facet → obligation → template／section → oracle／gate
3. UI scope → ready → walkthrough → agreement → backprop

停止・差戻し：
- 未解決の意味・責務・oracleは対象設計の引渡しを保留
- UI合意と要求採否を相互に代用しない
- 未実証modalityは選択不可とし、全modality完成を一律条件にしない

### PKG-D03 開発計画・進行統制

対象仕事の依存・割当・進行・中断再開を管理する。

| 項目 | 切り出す境界 |
|---|---|
| 対象 | 開発作業の制御 |
| 配布する道具 | typed workflow選択・PLAN／work graph操作／Ticket／Assignment／leaseを結ぶ進行機能／継続実行・停止再開・レビュー依頼の協調機能 |
| 利用後の成果 | 実行計画とREADY判定／委譲要求／割当／停止・再開packet／未完義務・次の行為・停止理由 |
| 入力・入口 | 許可された目的・scope、要求／設計参照、dependency frontier、能力・予算条件を受ける。 |
| 完了・出口 | 現在の根拠に束縛した行為または保留／再入先を返す。自分で品質・安全・merge資格を偽装しない。 |
| 次の受渡し | PKG-D04へ実行依頼、PKG-D05へ独立検収依頼、PKG-D08へ統合候補を渡す。 |
| 含めない範囲 | HELIX全体のportfolio管理／HELIX-Bench学習・再評価engineの必須化／新たなself-improvement経路／常時全repo走査 |
| 最小基盤の検討範囲 | DF01、DF02、DF03、DF05、DF06 |
| 条件付き依存 | durable運転はDF04／通知／handoffはDF08／実行profileはPKG-D04の該当能力または同契約の外部adapter |
| native Moduleの再利用候補 | helix-workflow、helix-agent-runtime、helix-context-memory |
| native Bundleへの対応候補 | 未確定。既存Bundle／Profileの適用可能性を確認する。 |
| 旧成果ID | RG05-02、RG17-01、RG17-02 |
| 深部索引 | H02、H03、H07、H09 |
| 実版・適格性 | 公開版null／依存閉包・単独導入・公開資格は未検収。 |
| 既存owner | #819、#860、#826、#1293、#1534、#1562、#1215、#735、既存notification/outbox owner、#1448 |
| 根拠 | [AS-S02] [AS-S10] [AS-S17] [CUR02] [V04-N14] |

内部の流れ：
1. style／workflow／execution modeを別軸で解決
2. work graph → READY → delegation request
3. typed結果／receiptをjoin → 次行為
4. 中断 → checkpoint → current再照合 → 保存した再開先

停止・差戻し：
- 依存未完了・競合・古いleaseではdispatchを止める
- 不確実な副作用結果は自動再実行しない
- 通知配信・claim・仕事完了を区別する

### PKG-D04 Worker実行・成果生成

許可された限定taskを実行し、検証可能な候補成果を返す。

| 項目 | 切り出す境界 |
|---|---|
| 対象 | 実装・調査等の限定実行 |
| 配布する道具 | Worker descriptor／wrapper／provider adapter／実効設定とcontext packetの検査／候補成果・実行観測・取消の回収入口 |
| 利用後の成果 | code／文書／検証素材等の候補artifact／実行出所・実効設定・成功／失敗／取消の記録／型付きoutputと実行receipt |
| 入力・入口 | scope・対象HEAD・task・lease・budget・出力契約・認可済みcontextを受ける。 |
| 完了・出口 | 成果はproposalとして返す。独立検収前に共有正本へ直接適用しない。 |
| 次の受渡し | PKG-D07が安全境界、PKG-D05が独立品質検収、PKG-D08が親受入・統合を担当する。 |
| 含めない範囲 | HELIXの学習・知識昇格engine／非許可のcross-project knowledge／自分の成果の独立検収／自動publish |
| 最小基盤の検討範囲 | DF01、DF02、DF03、DF06、DF07、DF08 |
| 条件付き依存 | 実行profileに必要なPKG-D07の隔離・出力検査Slice／durable記録はDF04／供給済み知識を読むprofileのみ限定knowledge reader |
| native Moduleの再利用候補 | helix-agent-runtime、helix-context-memory |
| native Bundleへの対応候補 | 未確定。既存Bundle／Profileの適用可能性を確認する。 |
| 旧成果ID | RG05-01、RG09-01、RG16-01 |
| 深部索引 | H09 |
| 実版・適格性 | 公開版null／依存閉包・単独導入・公開資格は未検収。 |
| 既存owner | #819、#860、#826、#1293、#1534、#1562、#1384、#1382、#1035、#1172、#1370、#1373〜#1378 |
| 根拠 | [AS-S13] [AS-S14] [AS-S16] [V04-N11] [V04-N12] |

内部の流れ：
1. descriptor／wrapper／contextを照合
2. 隔離profileを成立させて実行
3. process終了 → scope監査 → output検査
4. 候補とreceiptを返却

停止・差戻し：
- unknown runtime／設定・隔離不足をhost fallbackで埋めない
- 非0終了や壊れたoutputを成功扱いしない
- 実行終了と独立review後のlifecycle terminalを分ける

### PKG-D05 検証・品質保証

要求と成果の対応・検証義務・独立reviewを判定する。

| 項目 | 切り出す境界 |
|---|---|
| 対象 | 対象製品の品質確認 |
| 配布する道具 | V-pair／verification義務の契約と評価／test／計測証拠の検査・独立review入口／品質判定と不足・staleの表示 |
| 利用後の成果 | verification plan／oracle対応／test／計測／独立reviewの結果／対象HEADに束縛した品質receiptと残義務 |
| 入力・入口 | 要求／設計・対象artifact・oracle・検証profile・信頼できる実行証拠を受ける。 |
| 完了・出口 | 宣言されたscopeの品質判定を返す。未実行・欠測・古い証拠は残件として返す。 |
| 次の受渡し | PKG-D06へ実行義務、PKG-D08／09／10へ品質証拠を渡す。 |
| 含めない範囲 | HELIX全体の世代採点／モデル総当たりBenchの必須化／安全操作の包括承認／自動merge |
| 最小基盤の検討範囲 | DF01、DF02、DF03、DF05 |
| 条件付き依存 | test実行adapterを使う場合はDF07と必要な安全Slice／自前CI配置を使う場合のみPKG-D06／永続検証台帳を使う場合はDF04 |
| native Moduleの再利用候補 | helix-verification |
| native Bundleへの対応候補 | helix-quality |
| 旧成果ID | RG01-02 |
| 深部索引 | H03、H08、H09、H10 |
| 実版・適格性 | 公開版null／依存閉包・単独導入・公開資格は未検収。 |
| 既存owner | 既存setup/doctor/review/GitHub各owner |
| 根拠 | [AS-S01] [AS-S11] [AS-S12] [AS-S16] [AS-S18] |

内部の流れ：
1. 義務・上下／左右pairの抽出・対応
2. test／measurement evidenceの照合
3. 独立review → finding収束
4. 品質判定／未検証／staleの返却

停止・差戻し：
- 実行証拠のないpairはその状態に留める
- 作成者とreviewerの独立性不足は受入拒否
- 品質greenで操作許可を付与しない

### PKG-D06 CI計画・実行最適化

必須検証を維持して、CI配置・待ち時間・再実行を改善する。

| 項目 | 切り出す境界 |
|---|---|
| 対象 | 対象projectのCI |
| 配布する道具 | verification義務からCI DAGを組む機能／資源に応じた配置・延期義務回収／対象CIの実測・証拠再利用判定とレポート |
| 利用後の成果 | CI planと実行DAG／段階別CI receipt／延期義務の行先／待ち時間・コスト・再実行の診断 |
| 入力・入口 | current verification registry、変更artifact、対象HEAD、required obligations、資源観測を受ける。 |
| 完了・出口 | 必要義務が追跡可能なCI結果を返す。全体の品質受入はPKG-D05／統合側の判定を残す。 |
| 次の受渡し | PKG-D05へ検証結果、PKG-D08へCI receiptを返す。対象CIの分析は提供範囲、HELIX自己進化は内部範囲。 |
| 含めない範囲 | UIL全体の必須同梱／HELIX-Benchの学習loop／CI greenだけでRelease認可／必要testの削除 |
| 最小基盤の検討範囲 | DF01、DF02、DF03、DF05 |
| 条件付き依存 | runner稼働時はDF06／DF07／継続queue／延期台帳はDF04／自分で隔離runnerを起動するprofileのみPKG-D07 |
| native Moduleの再利用候補 | helix-ci |
| native Bundleへの対応候補 | helix-dynamic-ci |
| 旧成果ID | RG02-01、RG02-02、RG02-03 |
| 深部索引 | H10 |
| 実版・適格性 | 公開版null／依存閉包・単独導入・公開資格は未検収。 |
| 既存owner | #93、#1204、既存verification plan/scheduler owner、#1563 |
| 根拠 | [AS-S18] [AS-S09] [V04-S20] [CUR07] |

内部の流れ：
1. 義務 → local／boundary／global／release-onlyへ分類
2. dependency closure → 配置DAG
3. 実行／延期／再実行 → predecessor付きreceipt
4. 実測収集 → ボトルネック診断

停止・差戻し：
- unknown selectorや高riskは既存full方針へ戻す
- 延期を成功／削除扱いしない
- 再利用は同一条件・lineageの証明が必要

### PKG-D07 開発安全・隔離実行

開発行為の到達範囲・秘密情報・外部作用・出力の信頼境界を守る。

| 項目 | 切り出す境界 |
|---|---|
| 対象 | 認可された開発・検証作業 |
| 配布する道具 | 操作前Guard／action-binding検査／選択backendのSandbox・資源制限／外部outputの入口検査・限定engagement管理 |
| 利用後の成果 | 許可／拒否／保留と再開条件／隔離実行結果・安全境界の証拠／受理可能なoutput候補またはquarantine |
| 入力・入口 | 対象・行為・期間・policy・credential参照・実backend identityと必要予算を受ける。 |
| 完了・出口 | 選択した範囲の安全判定とproposalを返す。共有適用は別権限へ渡す。 |
| 次の受渡し | PKG-D04／06／10等から利用され、候補outputをPKG-D05／08へ渡す。 |
| 含めない範囲 | HELIX Worldの自己権限変更／任意対象への包括的security検査／未認可cloud操作／プロジェクト秘密値の配布 |
| 最小基盤の検討範囲 | DF01、DF02、DF03、DF06、DF07 |
| 条件付き依存 | 監査履歴保持はDF04／engagementごとに対象／手法／期間／証拠アクセスを明示／別backend／OSは別に検収し、未実証組合せを同梱しない |
| native Moduleの再利用候補 | 未確定。既存ownerとの対応を先に行い、新Moduleを自動新設しない。 |
| native Bundleへの対応候補 | 未確定。既存Bundle／Profileの適用可能性を確認する。 |
| 旧成果ID | RG06-01、RG06-02、RG13-01、RG13-02、RG13-03、RG14-01、RG18-01、RG18-02 |
| 深部索引 | H09 |
| 実版・適格性 | 公開版null／依存閉包・単独導入・公開資格は未検収。 |
| 既存owner | #1543、#679、既存work/agent/git-command guard owner、#226、#227、#1555、既存transaction/review/merge admission owner、#1523、#1172 |
| 根拠 | [AS-S13] [AS-S14] [AS-S15] [V04-N04] [V04-N19] |

内部の流れ：
1. 操作前scope／authority検査
2. 実行中のFS／network／env／resource制約
3. 実行後scope／output検査
4. 取消・停止・隔離資源回収

停止・差戻し：
- 必要backend・認可・profile不足で実行拒否
- 未信頼出力を検査前に実行しない
- 安全成功を品質・merge・公開の認可にしない

### PKG-D08 変更統合・PR管理

検収済みの変更を正しい対象へ受け入れ、統合状態を確かめる。

| 項目 | 切り出す境界 |
|---|---|
| 対象 | 対象repositoryへの変更統合 |
| 配布する道具 | Git／PR契約・scope／owner照合／親acceptanceとmerge順序制御／main／DB／GitHub read-afterの照合 |
| 利用後の成果 | 親受入／拒否と統合候補／PR／merge結果と確定対象HEAD／収束証拠または再検査要求 |
| 入力・入口 | delegation・独立review・worker lifecycle・CIの同一対象receiptと現行leaseを受ける。 |
| 完了・出口 | 対象変更の統合結果と残件を返す。統合済みをRelease済みにしない。 |
| 次の受渡し | PKG-D03へ進行状態、PKG-D09へ確定artifact候補を渡す。 |
| 含めない範囲 | HELIX全体の新要求portfolio管理／品質判定の自己発行／全repoを無条件変更／未許可publish |
| 最小基盤の検討範囲 | DF01、DF02、DF03、DF04、DF05、DF06 |
| 条件付き依存 | Git／GitHub連携の該当DF07 adapter／通知はDF08／PKG-D05／06または同契約の外部検証receipt |
| native Moduleの再利用候補 | helix-github-ops |
| native Bundleへの対応候補 | 未確定。既存Bundle／Profileの適用可能性を確認する。 |
| 旧成果ID | RG01-03、RG14-02 |
| 深部索引 | H09、H10 |
| 実版・適格性 | 公開版null／依存閉包・単独導入・公開資格は未検収。 |
| 既存owner | 既存setup/doctor/review/GitHub各owner、#1543、#227、既存transaction/review/merge admission owner |
| 根拠 | [AS-S09] [AS-S16] [AS-S17] |

内部の流れ：
1. receipt／HEAD／権限／順序の再照合
2. 親acceptance
3. PR・merge前再評価
4. main／DB／GitHub read-after

停止・差戻し：
- stale HEAD・競合・blockerなら対象統合だけ停止
- writer／reviewerの自己acceptanceを禁止
- 外部system成功と内部投影一致を別確認

### PKG-D09 製品リリース

開発対象製品の成果物・提供構成・検収・公開版を確定する。

| 項目 | 切り出す境界 |
|---|---|
| 対象 | 利用者が作った製品のリリース |
| 配布する道具 | 対象製品用manifest／artifact／依存lockの処理／static検査・consumer検収・版の診断／認可された公開先adapterの候補 |
| 利用後の成果 | 検証済みartifact／manifest／provenance／製品のRelease候補・互換性・更新／rollback手順／公開可否または不足証拠 |
| 入力・入口 | 対象製品ID・artifact・公開contract・品質／安全証拠・公開先の認可を受ける。 |
| 完了・出口 | 開発対象製品のRelease成果を返す。配備先environmentへの反映はPKG-D10へ分離する。 |
| 次の受渡し | PKG-D10へ製品artifactを渡す。HELIX自身のPackageを作って配る工程は内部IN06が本能力を自己適用する。 |
| 含めない範囲 | HELIX全Moduleのportfolio／DevOS専用管理権限の暗黙同梱／世代認定／任意の製品への完成済みadapter保証 |
| 最小基盤の検討範囲 | DF01、DF02、DF03、DF05、DF09 |
| 条件付き依存 | builder／consumer runner起動はDF07と必要安全Slice／永続promotion記録はDF04／公開を行わずartifact検証だけを返すprofileを許す |
| native Moduleの再利用候補 | 未確定。既存ownerとの対応を先に行い、新Moduleを自動新設しない。 |
| native Bundleへの対応候補 | 未確定。既存Bundle／Profileの適用可能性を確認する。 |
| 旧成果ID | 旧RGに適切な独立成果IDなし。native契約の対象製品向け適用候補として保持。 |
| 深部索引 | H12、H13 |
| 実版・適格性 | 公開版null／依存閉包・単独導入・公開資格は未検収。 |
| 既存owner | 既存RLS／OPS owner。対象製品向けadapterとの対応は未確定。 |
| 根拠 | [CUR11] [CUR12] [CUR07] [AS-S23] |

内部の流れ：
1. 対象製品の構成・依存を固定
2. artifact生成／static検証
3. consumer／更新／rollback検収
4. 認可された範囲でRelease候補／公開結果を返す

停止・差戻し：
- HELIX専用Module／DevOS契約のまま汎用製品を扱わない
- 構成・consumer・rollback未確定なら昇格を止める
- 候補生成・品質合格・公開認可を別にする

### PKG-D10 配備・環境適用

検証済みartifactを指定環境へ反映し、healthと戻せる条件を確かめる。

| 項目 | 切り出す境界 |
|---|---|
| 対象 | 製品の配備・更新 |
| 配布する道具 | Environment／Deployment／Rollback契約／配備計画と選択環境adapter／preflight・health・観測・read-after処理 |
| 利用後の成果 | DeploymentManifest／Plan／Receipt／対象環境のhealth／変更証拠／RollbackPlan／Receipt |
| 入力・入口 | Release artifact・config・environment identity・migration・health・rollback・必要認可を受ける。 |
| 完了・出口 | 環境適用receiptと観測結果を返す。incident closure・恒久修正とは別。 |
| 次の受渡し | PKG-D11へ稼働条件、PKG-D12へ障害証拠を渡す。 |
| 含めない範囲 | provider control planeの再実装／任意cloud実働保証／consumer所有データの無断変更／HELIX自身の配布policy変更 |
| 最小基盤の検討範囲 | DF01、DF02、DF03、DF04、DF06、DF07 |
| 条件付き依存 | 実適用profileはPKG-D07の外部作用・秘密参照境界／PKG-D09または同等の検証済みRelease入力／plan-onlyとapply profileの権限を分ける |
| native Moduleの再利用候補 | helix-deployment |
| native Bundleへの対応候補 | 未確定。既存Bundle／Profileの適用可能性を確認する。 |
| 旧成果ID | RG11-01 |
| 深部索引 | H13 |
| 実版・適格性 | 公開版null／依存閉包・単独導入・公開資格は未検収。 |
| 既存owner | #1160〜#1167、#1169 |
| 根拠 | [AS-S23] [CUR12] |

内部の流れ：
1. RELEASED → DEPLOYMENT_PLANNED → PREFLIGHT_PASSED
2. STAGED → DEPLOYED → OBSERVING → HEALTHY
3. 異常時は停止／許可されたrollback

停止・差戻し：
- environment／artifact／config不一致でapply拒否
- 不可逆migrationや戻り先不明を単純rollback可能と表示しない
- command成功だけで健全稼働としない

### PKG-D11 運用・保守

対象製品の稼働状態と保守義務を追跡し、許可された対応へつなぐ。

| 項目 | 切り出す境界 |
|---|---|
| 対象 | 配備後の通常運用・予定保守 |
| 配布する道具 | OperationPolicy／Observation処理／MaintenanceObligationの期限・周期・owner管理／drift／更新／保守の計画と再観測 |
| 利用後の成果 | SLO／health／資源／接続の観測report／期限付き保守計画・未完義務／保守結果と必要な診断／改修要求 |
| 入力・入口 | 対象環境・運用policy・観測source・保守対象・周期・owner・許可範囲を受ける。 |
| 完了・出口 | 稼働・保守の現状と根拠、次の対応を返す。運用観測で製品要求を直接書換えない。 |
| 次の受渡し | PKG-D10へ適用・migration、PKG-D12へ原因診断、PKG-D01／02／04へ正規改修を渡す。 |
| 含めない範囲 | HELIX全体のUIL／知識昇格／自己管理専用control plane／常時外部送信／未認可secret rotation |
| 最小基盤の検討範囲 | DF01、DF02、DF03 |
| 条件付き依存 | 周期管理・永続台帳はDF04／観測adapterはDF07／通知はDF08／実適用はPKG-D10等の受渡し契約を利用 |
| native Moduleの再利用候補 | helix-operations、helix-maintenance |
| native Bundleへの対応候補 | 未確定。既存Bundle／Profileの適用可能性を確認する。 |
| 旧成果ID | RG11-03、RG16-02 |
| 深部索引 | H13 |
| 実版・適格性 | 公開版null／依存閉包・単独導入・公開資格は未検収。 |
| 既存owner | #1160〜#1167、#1169、#1172、#1370、#1373〜#1378 |
| 根拠 | [AS-S23] [CUR12] [V04-N11] |

内部の流れ：
1. policy → observation → quality／freshness確認
2. 期限／周期／drift → MaintenanceObligation
3. 保守計画 → 各実行ownerへ委譲
4. 再観測 → 残義務・異常の返却

停止・差戻し：
- 欠測を正常・余力ありと扱わない
- rotation／migration／環境変更は個別権限へ渡す
- 構造問題を局所patchで隠さず適切な再入へ送る

### PKG-D12 障害診断・回復

症状と証拠から原因候補・影響・戻す工程を特定する。

| 項目 | 切り出す境界 |
|---|---|
| 対象 | 対象製品のincident・開発中Recovery |
| 配布する道具 | Incident／ChangeDiagnosis／BackflowDecision契約／変更・契約・コード・環境へのtrace／封じ込め・復旧・恒久修正の区別と再入管理 |
| 利用後の成果 | 根拠・反証条件付きの原因候補／ChangeDiagnosis＋BackflowDecision／復旧／再観測／closureの条件と残件 |
| 入力・入口 | 症状、影響、current観測、Release／Deployment／変更／要求・設計参照を受ける。 |
| 完了・出口 | 診断成果と再入判断を独立して返せる。修正codeや環境適用は各ownerが行う。 |
| 次の受渡し | 原因に応じPKG-D01／02／04／13へ改修、PKG-D10へ復旧・再配備、PKG-D11へ再観測を渡す。 |
| 含めない範囲 | HELIX機構発明engine／推測での自動編集／新Troubleshooting workflow enum／観測不足でのincident終端 |
| 最小基盤の検討範囲 | DF01、DF02、DF03、DF05 |
| 条件付き依存 | incident履歴はDF04／追加観測はDF07／実復旧はPKG-D10または既存の限定Recovery adapter |
| native Moduleの再利用候補 | helix-diagnosis、helix-reverse-recovery |
| native Bundleへの対応候補 | 未確定。既存Bundle／Profileの適用可能性を確認する。 |
| 旧成果ID | RG11-02 |
| 深部索引 | H13、H02 |
| 実版・適格性 | 公開版null／依存閉包・単独導入・公開資格は未検収。 |
| 既存owner | #1160〜#1167、#1169 |
| 根拠 | [AS-S23] [AS-S02] [CUR12] |

内部の流れ：
1. incident → evidence correlation → diagnosis
2. change class／expansion kind／route／return layerを別判断
3. 必要な封じ込め・rollbackを既存ownerへ依頼
4. 改修／Release／再配備／再観測の証拠をjoin

停止・差戻し：
- confidence不足・target曖昧なら追加観測へ
- rollback成功で恒久修正・再入を省略しない
- 外部製品のbugをHELIX機構の欠陥と決めつけない

### PKG-D13 構造改善・リファクタリング

対象製品の挙動を保ち、責務・依存・実装を再編する。

| 項目 | 切り出す境界 |
|---|---|
| 対象 | 既存製品・開発資産の構造改善 |
| 配布する道具 | System Synthesisの構造分析・部分合成の対象限定部分／Refactoring eligibility／replacement計画／parity・no-degradation・移行／退役の検収profile |
| 利用後の成果 | 構造／影響／置換候補と比較根拠／意味保存refactor計画・consumer／oracle／rollback束縛／parity／移行／退役／read-after証拠 |
| 入力・入口 | 対象製品のcontract・構造graph・利用者・baseline・oracle・変更許可を受ける。 |
| 完了・出口 | 意味保存の成立・不成立と影響を返す。未達の部分を無理に削除しない。 |
| 次の受渡し | PKG-D02の設計とPKG-D04／05／08の実行・検収・統合を使う。HELIXへの自己適用も同じ契約で扱う。 |
| 含めない範囲 | UILによるHELIX自己改善の自動発火／cross-project rule promotion／whole-system plannerの自動write／新機構発明・自己承認 |
| 最小基盤の検討範囲 | DF01、DF02、DF03、DF05 |
| 条件付き依存 | 実変更はPKG-D04／05／08または同契約のconsumer／移行・退役の永続状態はDF04／read-only分析profileは変更権限を持たない |
| native Moduleの再利用候補 | helix-refactoring |
| native Bundleへの対応候補 | helix-refactoring |
| 旧成果ID | RG12-01 |
| 深部索引 | H14、H15 |
| 実版・適格性 | 公開版null／依存閉包・単独導入・公開資格は未検収。 |
| 既存owner | #1033、#1036、#1038、#1210、#1248、#1552 |
| 根拠 | [AS-S27] [AS-S08] [AS-S29] |

内部の流れ：
1. RF0 inventory → RF1 eligibility → RF2 replacement design
2. RF3 atomic executionを既存実行ownerへ委譲
3. RF4 parity／no-degradation
4. RF5 migration／retirement → RF6 read-after

停止・差戻し：
- 意味変更ならREDESIGN等へ戻す
- 名称類似・LOC削減だけで統合・削除しない
- 後継・consumer検証・rollback不足なら退役を止める

## 4. 組合せは別の検収

Lite／Full／Autonomous等は、検収した開発Packageの利用目的別構成です。実装時はPackage名の入れ子を新設せず、選択Slice／Moduleのversion・digestへ展開し、既存Bundle／Profileがexact lockを持ちます。同じSliceの重複、相反する版、暗黙の未検収機能を拒否します。 [CUR07][CUR11]

Fullも全repo配布ではありません。内部統治・学習・自己評価や非公開データを含めず、選択済み開発責務と必要依存に限定します。元のconsumer_core_v1／Liteの意味・除外・parityは勝手に変更しません。 [DEC06][CUR04][CUR11]

## 5. Package採用前に残る検証

公開する入口から成果まで、対象別consumerの実行・更新・取消・rollback／撤去、必要安全、独立品質検収、閉じた依存と除外の検査が必要です。内部成長runtimeが未導入・停止でも通常開発が続くことを実証します。未検収は未検収として保持し、文書の完成で相殺しません。

### 特に未確定の対象

PKG-D09の汎用製品向けRelease adapterは未検収です。既存RLSのHELIX自己配布をそのまま外部製品Release engineと呼び替えません。PKG-D07等でModuleのprimary所有が未確定な部分も、そのまま残しています。 [CUR11][V05]

## 出典

[DEC06]: DECISIONS_v0.6.md
[V05]: history/v0.5/HELIX_RELEASE_AND_GENERATION_RESEARCH_v0.5.md
[AS-S23]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/docs/design/helix/L3-requirements/product-lifecycle-operations-requirements.md
[AS-S25]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md
[AS-S28]: https://github.com/RetryYN/HELIX-HARNESS/issues/1384
[CUR07]: https://github.com/RetryYN/HELIX-HARNESS/issues/1494
[CUR11]: https://github.com/RetryYN/HELIX-HARNESS/blob/8f835e23c8d4110260d1eff97c9b167987bff37d/docs/design/helix/L3-requirements/release-module-bundle-composition-requirements.md
[CUR04]: https://github.com/RetryYN/HELIX-HARNESS/blob/8f835e23c8d4110260d1eff97c9b167987bff37d/config/distribution-profile-catalog.json
[AS-S04]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/docs/design/helix/L4-basic-design/requirement-refinement-authority.md
[AS-S06]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/src/requirements/requirement-discovery.ts
[AS-S07]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/src/design/screen-applicability.ts
[AS-S08]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/docs/design/helix/L5-detail/requirement-translation-obligation.md
[V04-P09]: https://github.com/RetryYN/HELIX-HARNESS/issues/1318
[AS-S01]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/docs/governance/helix-harness-requirements_v1.3.md
[AS-S11]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/docs/design/helix/L5-detail/layer-ledger-pair-gate.md
[AS-S27]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/docs/design/helix/L3-requirements/system-synthesis-requirements.md
[V04-N17]: https://github.com/RetryYN/HELIX-HARNESS/issues/255
[AS-S02]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/docs/design/helix/L3-requirements/workflow-classification-registry.v1.json
[AS-S10]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/docs/design/helix/L5-detail/forward-infinity-orchestration.md
[AS-S17]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/docs/design/helix/L4-basic-design/work-graph-receipt-acceptance.md
[CUR02]: https://github.com/RetryYN/HELIX-HARNESS/commit/8f835e23c8d4110260d1eff97c9b167987bff37d
[V04-N14]: https://github.com/RetryYN/HELIX-HARNESS/issues/1215
[AS-S13]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/docs/design/helix/L4-basic-design/worker-wrapper-admission.md
[AS-S14]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/src/runtime/worker-isolation-broker.ts
[AS-S16]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/src/runtime/worker-lifecycle-receipt.ts
[V04-N11]: https://github.com/RetryYN/HELIX-HARNESS/issues/1172
[V04-N12]: https://github.com/RetryYN/HELIX-HARNESS/issues/1370
[AS-S12]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/docs/design/helix/L6-function-design/layer-ledger-pair-gate.md
[AS-S18]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/src/runtime/ci-verification-plan.ts
[AS-S09]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
[V04-S20]: https://github.com/RetryYN/HELIX-HARNESS/blob/0f2881edf89d616e4ca3bcb6ea1ce91c9ae1e4d2/docs/governance/ci-critical-path-scheduler-terminal-fullback-evidence.md
[AS-S15]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/config/worker-isolation-runtime-catalog.json
[V04-N04]: https://github.com/RetryYN/HELIX-HARNESS/issues/1543#issuecomment-5553104152
[V04-N19]: https://github.com/RetryYN/HELIX-HARNESS/issues/1523
[CUR12]: https://github.com/RetryYN/HELIX-HARNESS/blob/8f835e23c8d4110260d1eff97c9b167987bff37d/docs/governance/release-module-bundle-rollout-roadmap.md
[AS-S29]: https://github.com/RetryYN/HELIX-HARNESS/blob/84fe826449c1415bd60b42c81c2c0820bc79411b/src/design/requirement-intake-lifecycle.ts
