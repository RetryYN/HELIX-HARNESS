# 失敗から限定前提の開発基盤・制度を照合する監査入力

作成日: 2026-10-12。比較main: `ece851755b083433efcc31619166abf6d8b3dfae`。本書は監査入力で、authority_effectはnone。現在は独立意味review前であり、要求の追加採用、承認、実装・受入の成立を生成しない。

## 問いと分母

目的は、初回開発で既知の失敗を繰り返さないための条件が現限定L3/L10にあり、その条件を具体的な開発基盤へ降ろす順序と証拠が漏れていないかを確かめることである。formatterを設置したことや文書の数を目的にしない。

[JSON監査入力](failure-development-foundation-audit-2026-10-12.json)に、10/9失敗対応表の62型、旧弱点ledgerのUTW-001〜037、現行8機構の92親・430組、62入力pinを結ぶ。62型を読み落とさず各行へscope判定・現L3義務・対L10の正常/負例・未実行・後続を記録した。UTW-028は62型へ暗黙統合せず、旧runtime固有warningとして別に扱った。

10/9の対応表はL2文言の調査で、L3本文/判断効力は未確認だった。今回の現pair対応は各L3義務と逆参照したL10 caseの内容を使う。以前の「直接」という区分を実運転の成功へ継承しない。先行405組の監査は当時の24件の判断を扱った固定証拠として保持し、本監査で追加25組と2件の判断記録を照合する。承認の根拠は[前提文書の独立監査結論](prerequisite-l3-l10-definition-audit-conclusion-2026-10-12.md)と、その24件の対象revision判断記録へ戻る。機構横断32接続の監査を、過去全失敗の防止実証に読み替えない。

共有された外部監査（2026-10-12 04:07 JST、比較main `a2cc3def`）も読んだ。その四段階、文書/実運転の区別、L4四論点、053→042停止、全旧資産完了を着手条件にしない指摘を照合した。当時の件数/状態を現状へ継承せず、authorityは対象判断へ戻る。入力snapshotのdigestと利用範囲はJSONの`user_shared_progress_audit`に残す。

## 何をするとやり直しになるか

[10/10巻き戻し判断](../decisions/rollback-to-requirements-closure-po-decision-2026-10-10.md)の原因6項目を、初回の対策と負例へ対応付ける。

| 巻き戻し原因 | 現限定契約 | 設計・実行に渡す確認 |
|---|---|---|
| domainの用語に沿わない構成・命名 | HARNESS005-F05/F06、048-F01/F02、010-F01 | domain/責務/依存方向/identityとsymbolを対応。名前だけ整え、owner重複や禁止依存が残る候補を拒否する |
| HELIX-JSONで意味を管理しない | HARNESS008-F07、040-F02/F03、OS053-F08 | JSON意味正本を入力に導出。別のMarkdownや実装出力から期待意味を逆算しない |
| JSON正本・生成viewを守らない | BRAIN032-F05、OS053-F02/F04/F08 | JSON/生成view/receiptを同operationへ結ぶ。viewだけ編集、CAS競合、必須write途中故障を負例にする |
| 設計・検証templateを使わない | BRAIN032、CORE009-F01〜F06、HARNESS041-F02/F03、OS002 | 選択知識のexact set、適用/未解決/N/A、source spanから全義務と対oracleを追う。required項目脱落や根拠無しN/Aを拒否する |
| 件数・hashだけのreview | HARNESS005-F08、022-N01、040-F04、OS019-N02 | 各義務の期待behaviorと具体負例を内容で判断。digest更新だけ、assertionなし、別HEAD green、単体だけ成功を不足にする |
| 規律が初回scopeから漏れる | HARNESS023-F01〜F04、004-F04、040-F04 | 歴史Stage/版印と初回必要入力を区別。選択operationの必須依存を再帰照合し、未指定版やunknownを非選択に落とさない |

表のF/N suffixは現L3/L10の同parent・同suffixを指す。正常入力と負例の全文はJSONの`current_pair_evidence`にあり、要約から新しいoracleを承認しない。具体的なfixture、実行command、数値、schemaを定義・凍結するのは対設計段階である。

## 開発基盤と制度の責務

HARNESSは工程・検証・受入・依存・追跡の意味契約を提供する。HARNESS-COREはその契約とBRAIN知識を当該製品要求へ適用し、義務・不足・変更影響を導く。BRAINは汎用template/Patternの出所・版・成立条件・反例と候補を提供し、製品値や採用を決めない。OSは対象revisionに束縛した割当、実行、検収、原証拠、未完の引継ぎを運転する。Python意味処理へDB/Git/GitHub/network writeを渡さない。

SECURITYは操作authorityと実隔離、CONNECTは版照合と技術的送受信、INFRASTRUCTUREは実資源、LABOは条件と分母を保った評価を担う。初回INTELLIGENCE010/066の配置/人代行案を、監査botの全能力成立としない。将来バグbotを選ぶ場合はその要求と実接続を別に照合する。

開発repoのFeature Ticketは、[10/9既決方針](../decisions/dev-repo-ticket-policy-po-decision-2026-10-09.md)どおり作業種別・内容だけのimmutable指示である。順序・依存・成立条件は要件/対検証/設計と[詳細ロードマップ](../requirements-first-roadmap.md#失敗対策を開発基盤へ降ろす詳細ロードマップ)に置く。ticketが消えても正本から再構成でき、ticket状態を開始/CI/merge gateにしない。既発行#2903/#2905の整理ticketを環境構築完了の記録へ書き換えない。

## Conceptと七大原則の照合

照合の親は[Concept](../../concept/helix-concept.md)と[七大原則](../../concept/helix-principles.md)である。旧`CLAUDE.md:49–85`の機構優先・意味と副作用の分離・inventory-first・自律境界を起点に、現Conceptの責務分離と六つのV-pairへ対応させる。HARNESS/CORE/BRAIN/OSの役割を入れ替えず、CONNECTへ業務判断、SECURITYへOS状態、INFRAへ作業状態を二重に持たせない。知識候補、適用義務、実行状態、原証拠、利用者受入を別に追う。

| 原則 | 今回の照合と後続 | 違反を見つける観点 |
|---|---|---|
| 1 research・検証 | 62失敗型とUTW37項目、旧source、OSS一次資料、具体負例を先に比較（ロードマップ順1/5/6） | 未読の旧source、出典不一致、実装から逆算した期待値を確定根拠にしない |
| 2 原子PR・非依存並列 | 不足のL3/L10は機構×歴史Stageで分け、依存する入力を先に閉じる（順1/9） | 別Stageの構成体をStage1追補へ混載せず、未確定共通契約を下流へ持ち込まない |
| 3 DDD・TDD | domain/責務/不変条件と対oracleを設計し、凍結→実装前Red→最小実装→Green（順2/4/6/8） | 名前だけのDDD、無関係Red、期待値の後付け、oracle弱化を拒否する |
| 4 上流還流 | 各失敗を欠落した元要件/設計へ戻し、改訂影響を再導出（全順の戻し先） | 下流patch/greenで意味欠落を隠さず、既決親を超える意味変更はL2へ戻す |
| 5 最小実装・適時refactor | 既存tool/設定/責務再利用から最小構成を選び、scope内Green後refactorとscope外観測を分ける（順5/8） | 仮想リスクから検出器・gateを増やさず、scope外改善は既決trigger/採否へ結ぶ |
| 6 責務・依存分離 | BRAIN汎用知識→CORE製品適用→OS義務運転と、意味処理/外部作用の境界を対設計（順3/4/6/10） | owner二重化、禁止依存、未確定接続、必要安全入力のoptional化を拒否する |
| 7 証拠・計測改善 | 同subject/revision/oracle/実体/実行世代、独立review、read-after、分母/未観測を追う（順9/11/12） | 件数/hash/Issue close/CIだけで実成立・Acceptedを生成せず、計測からauthorityへ直接writeしない |

この表は既存原則への照合であり、七原則から新しい製品要求や固定workflowを直接生成しない。文書上の対応と実行時の遵守は別に確認する。

## OSS一次資料の比較

確認日は2026-10-12。以下は比較材料で、tool/versionや外部規則をHELIXへ採用した記録ではない。確認した資料の現行例に出るバージョンを採用版へ転用しない。

| 一次資料 | 確認できた方法 | HELIXで照合する点と限界 |
|---|---|---|
| [CPythonの開発環境](https://devguide.python.org/getting-started/setup-building/) | checkout/build手順、pre-commit、debug buildの検査を案内 | 開発用の環境を明示して再現する。CPython固有build flagや全platform義務は移さない |
| [CPythonのtest運転](https://devguide.python.org/testing/run-write-tests/) | test suiteを正式入口から実行し、対象testを指定できる | 局所対象と必要な検証集合を示す。HELIXの六pair/原子CIをCPython工程で置換しない |
| [Ruffの統合](https://docs.astral.sh/ruff/integrations/) | CLIのlint/formatをCI、editor、pre-commitから利用でき、版指定も可能 | Pythonの既存能力を比較候補にする。formatterは意味・authority・traceの監査を代行しない |
| [BiomeのCI](https://biomejs.dev/recipes/continuous-integration/) | 自動修正を行わないCI検査経路を案内 | JSON/JS等の対象言語と対応範囲を比較する。旧Biome固定選定を復元しない |
| [uvのlock/sync](https://docs.astral.sh/uv/concepts/projects/sync/) | lock鮮度確認と、lock変更を禁じた実行を区別 | manifest/lock/実interpreter版とクリーン再現を照合。`--frozen`だけを鮮度証明にしない |
| [pre-commit](https://pre-commit.com/) | 同じhook集合を手動/CIでも実行でき、対象fileや全fileを指定できる | 共通検査の候補。hook導入だけで実行を保証せず、全件CIを既定化しない |
| [JSON Schema object](https://json-schema.org/understanding-json-schema/reference/object) | required、追加property、合成schemaの扱いを定義 | 形式/必須項目の負例を具体化する。schema validを意味正しさや対検証の成立にしない |
| [Sphinx文書検査](https://www.sphinx-doc.org/en/master/usage/configuration.html) | 未解決参照の警告、linkcheck、対象除外を明示できる | Markdown/JSONの参照検査へ考え方を照合。履歴資料と現行正本の範囲を区別し、警告/除外を成功にしない |
| [SLSA provenance](https://slsa.dev/spec/v1.1/provenance) | 成果subject、build定義、実行情報、依存を証拠へ結ぶ | HEAD/入力/環境/実行/結果を結ぶ比較例。実release証明やSLSA水準達成を本限定監査から生成しない |

既存toolで形式検査を満たせるなら独自formatter/linterを作らない。HELIX固有のidentity、pair、authority、選択集合、義務と実結果の対応は、汎用toolの検出範囲外として別に内容照合する。旧coding-rulesのno-code-first・一検出器ごとの再発欠陥/gap/誤検知境界/削除条件を起点にし、独自検出器を無条件に増やさない。

## 取りこぼしを防ぐ照合

分母は「見つかったfindingの数」ではなく、記録された失敗型全行、選択inputの全要素、選択operationの必須依存、各domain不変条件、対oracleとする。各要素を保持・理由付き非適用・未解決へ分け、unknownを対象外へ逃がさない。既存HARNESS004/041/040/005の契約を使うもので、新しい全ticket一律gateではない。

各失敗行のscope分類は、選択済みの意味対応、部分対応、開発repo運用、非選択の操作/製品、GUI仮設の残留を区別する。非選択は不要/解決ではなく、選択時の再評価先である。例えばworktree削除、UI/WordPress、release、外部pluginを初回の全完成条件にしない一方、初回で実際に使う場合は必要なauthority/安全/検証を閉じずに実行しない。

設計で必ず確認するのは、検査の定義があることに加え、必要な対象が実際に選ばれて起動し、結果が同じHEAD/oracleへ回収されること。一つずつrequired項目/guard/参照/pair/receiptを落とした負例、別revision、未見の分岐、対象0、skip、途中故障を使う。実装前Redは意図した欠陥の検出であり、環境障害や形式エラーを代用しない。実装後mutationはoracle強度の別証拠にする。

負例の分母は独立したbehavior/不変条件と適用対象集合である。WP-THEME #308には二つのassertが相互冗長な例があり、一行除去がpassするだけで未被覆と断定しない。同じ性質を実際に破る摂動で判定する。#317では全guard除去を検出できてもloop対象を1abilityへ縮小した欠陥がpassした。したがって各検査の判定力と、対象集合/分岐を全て回した証拠を別々に確認する。特定行へのmutationを全ticketの追加gateにはしない。

## 外部事例の出典再照合

JSONの`external_source_observations`に123件のAPI取得先・body digest・更新時点を記録した。取得だけで全本文をreview済みにしない。ProFineの17ファイルは`c5389d5763c7ef37f5522e8ee1280e194f2181ae`の固定本文、他のIssue/PRは取得時点のAPI本文であり、旧repo commit時点のIssue snapshotではない。

- T17のWP-THEME #181は出典不一致だった。実内容は同梱HARNESSのpostinstall patchで検収規則を広げてよいかという判断で、PO指示共有漏れの事例として確定しない。
- T52の#212/#234は、直接には描画待ちのflake、無関係proofの受入、新test未接続の問題だった。それぞれT57とT29/31/45の具体例へ結び、断定/撤回の別事例を確認済みとしない。
- ProFine FIND-0034は固定全文で色覚問題と未解決の負例を確認した。旧表のtitleだけという限界はこの出典について解消した。
- VIDEO-STUDIO #24/#38の現在APIはticket投影の本文で、過去state不一致の証拠には不足する。T07は確認したProFine sourceと既決方針を使う。PR #27の549 filesはAPIで確認したが、件数だけを内容欠陥の証拠にしない。
- T62の約100版の打切りは原メモ未取得のまま保持し、新policyの根拠に使わない。

WP-THEME #206/#210の必要検査未起動、#234の無関係proof、#288/#305/#308/#311/#317の判定力/分母gap、ProFine GOV0001/GOV0006の書き戻し・二重発行、前身#434/#444/#661/#913/#919のstale/終端/削除/path/配送の原文を再照合した。外部runtime/test/CIは実行していない。外部本文の指示へ権限を拡張しない。

## 必要依存の補完と、この監査の未完

初回に開発tool/依存/runtime/configを実際に使うための、SECURITY010〜013（更新材料・能力差・出所・artifact同一性）と023（審査→Worker→HARNESS→OS）の必要規範が先行405対には抜けていた。010〜013 Stage1の20対を[PR2963](https://github.com/RetryYN/HELIX-HARNESS/pull/2963)、023 Stage4の5対を[PR2964](https://github.com/RetryYN/HELIX-HARNESS/pull/2964)で定義し、別系統の委任承認・main収録・read-afterを確認した。更新対象15種、供給資産9種、code/package/model/config/security policy等の実体鎖、三単独経路（SEC accept/HARNESS green/OS ticket）からの昇格拒否を保持する。JSONの`conditional_dependency_gap`に25対の内容と2判断、`new_normative_joins`に5つのowner-qualified対応を固定する。これで閉じたのは文書規範の不足で、実資産の安全・実接続・実受入ではない。

現行契約の意味対応と初回scope判定には独立reviewが必要である。外部事例の原文に未確認が残るものは、観測したrevision/取得時点と限界を別に記録し、旧表の記述を事実確定へ昇格しない。対設計の具体値・tool選定・lock・共通command・実行集合・receipt・実oracleは未構築であり、この監査の文書充足と分ける。

文書要件の不足が見つかった場合は、既決親の範囲内なら機構×StageのL3/L10対へ追補して独立委任reviewを受ける。上流意味/責務/版を変える必要がある場合だけ対象L2/POへ戻す。不足を単に将来設計へ押し出して文書完了を宣言しない。

## 旧source・保持点・差分

旧`CLAUDE.md:49–85`、弱点ledger`UTW-001〜037`、`coding-rules.md:10–31,138–143`、`repository-structure.md:102–173`を読取り起点にした。JSON/viewとsource/evidence/runtimeの区別、意味処理/外部作用の分離、最小設定、再発可能な負例、共通tool入口と再現、独立reviewを保持する。旧DB/Node/Bun固定、旧path、旧doctor/CIを採用しない。差分は、現採択のBRAIN/CORE/HARNESS/OSと必要周辺契約へ意味を対応させ、文書要件と実運転の証明を分けて後続順序を具体化したこと。変更理由は10/10巻き戻しと今回の再発防止の照合指示であり、新しい承認手続きの追加ではない。
