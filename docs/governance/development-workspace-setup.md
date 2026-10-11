# 新世代の文書・要求整理に使う作業環境

## 対象と位置

要件定義に入る準備として、現行repositoryの文書編集・既存source照合・静的確認・独立reviewを再現するための案内である。製品の実行環境、正式なschema・compiler・Python接続・CIのセットアップではない。現在の許可範囲は[作業入口](new-generation-start-here.md)、操作は[GitHub上流運用モデル](github-upstream-operating-model.md)から読む。

この案内は既存の操作経路への参照と再現例であり、新しい検査gateやツール採用条件を追加しない。対象文書・参照する共通部品に不足があれば、その対象に限定して記録する。

## 現在の作業に使うもの

| 対象 | 用途と確かめ方 | 限界 |
|---|---|---|
| Git | `git --version`、対象revisionの取得、作業領域の分離、commit・差分・read-after | repositoryの内容承認や成果物の採用ではない |
| GitHub CLI | `gh --version`、現在のIssue／PRの取得、既存の許可範囲でのprojection | 接続は実際の対象repositoryのreadで確認する。認証情報を文書・出力へ保存しない |
| Python 3 | `python3 --version`、新世代scaffoldの静的tool。`scaffold/tools/scfctl.py`は標準libraryだけで動く | 製品Pythonコアの採用版・依存・実行環境ではない |
| editor設定 | rootの[.editorconfig](../../.editorconfig)に従う文書編集 | lint・型検査・製品testの成立を意味しない |
| 既存GUIレーン | 登録済みの作成側と独立review側。[GUIレーンの運転と通知](github-upstream-operating-model.md#guiレーンの運転と通知)に従って登録・配送・ACKを確かめる | 配送成功やACKから要求採否やmerge admissionを生成しない |

Node／npmのインストールがあっても、現行の文書整理には製品用packageを追加しない。製品の言語版・依存lock・型検査・lint・formatter・test経路は対象の要件・設計から導出する。現在のインストール版やarchiveの設定を採用根拠にしない。

## 分離した作業領域での再現例

既存cloneから対象のmain revisionを取得し、既存の変更や他レーンの作業に触れない別領域を用意する。次の一時変数は、この作業だけで使う。

```sh
git fetch origin main
helix_prep_revision=$(git rev-parse origin/main)
helix_prep_workspace=$(mktemp -d)
git worktree add --detach "$helix_prep_workspace" "$helix_prep_revision"
cd "$helix_prep_workspace"
git status --short
git rev-parse HEAD
python3 --version
git --version
gh --version
gh repo view RetryYN/HELIX-HARNESS --json nameWithOwner
git diff --check
python3 -B scaffold/tools/scfctl.py validate
python3 -B scaffold/tools/scfctl.py stale
```

`git status --short`に既存変更が無く、HEADが取得したrevisionと一致することを確かめる。`scfctl`の結果はScaffold Bindingの限定的な静的整合の証拠であり、文書の意味・全sourceの移管・製品検証の合格とは別である。外部consumer参照を持つBindingは現在のGUI環境にも依存するため、別端末で不足が出たらその参照を確認し、合格させるためにdigestや許可を緩めない。

参照確認は今回編集する文書とその依存先を対象とし、意味は旧source・現行Concept・対象L2／L11・採用判断へ戻って読む。参照先ファイルの存在やID集合の一致だけで独立意味reviewを代用しない。旧archive内のtool・test・workflowは実行しない。

上の例はdetached領域での読取り確認である。編集するときは独立した作業branchを用意し、対象を読んでから変更する。commit・push・Draft PR・exact base／content HEADの独立review・Ready化・独立側の明示merge・read-afterは既存の運用モデルに従う。通知箱の操作は、hookに登録済みの既存checkoutの絶対pathにある`scaffold/review-handoff/gui_mailbox.py`で行い、分離作業領域内の同名scriptを実行しない。両GUIが同じ仮設経路を使う条件は[review-handoffの説明](../../scaffold/review-handoff/README.md#依頼と指摘返却)を参照する。作業領域の片付けも同モデルの既存条件に従う。

## 製品環境の条件を整理する調査

#2905の現在の作業は、対象設計へ渡す条件と確認方法の整理である。最初の対象scopeは#2846の[PO選択](decisions/first-development-target-selection-po-decision-2026-10-11.md)によりBRAIN032→CORE009→OS002の循環とした。以下の未定欄をインストール済みの版や旧toolで埋めず、対象の要件・設計と対検証へ結ぶ。正式な設定、setup script、CI、製品testは作らず実行しない。

| 項目 | 現在確認できること | 対象設計に渡す必要条件と確認方法 | 未定・不足の戻し先 |
|---|---|---|---|
| OS・CPU・shell | 今回の文書確認は既存Linux上のbash経路。Windows等の製品対応は未検証 | 対象が使うOS／architecture／shell／filesystemと、Python・外部境界・依存binaryの対応を同じ構成へ固定し、クリーンな対象環境で確認する。文書確認端末と製品対象OSを分ける | 対応範囲は#2846、native依存とsetup差は対象設計。既存端末の成功から複数OS対応にしない |
| runtimeの版 | Git・gh・Python・Node・npmの版表示は[限定観測](audits/requirements-entry-preparation-observation-2026-10-11.json)にある。製品採用版ではない | 対象契約の対応版、依存と型／test toolの対応、実際に起動したinterpreterとpackage managerの版を照合する。単にlatestを入れず、同じ構成を再現できる版指定と変更影響を設計する | 最小対象と互換条件は#2846、具体版の選定は対象設計。版の不一致は成功扱いせず環境構成へ戻す |
| 依存・lock | 正式な製品manifest／lockは現行treeに無い。scfctlは標準libraryのみ | 直接・推移依存、実行／検証／任意依存、取得元・版・artifact hash、対象OS条件、解決toolとoptionを同じ構成に結ぶ。manifestと解決結果を別に照合し、クリーンな環境で固定集合を復元できることを確認する | Python／Nodeの採用とlock形式は対象設計。無依存ならその限定範囲を記録。旧lockを現在の解決証拠にしない |
| 環境変数の名前 | 今の再現例で追加する環境変数は無い。`helix_prep_revision`／`helix_prep_workspace`はshellローカル変数である | command探索の`PATH`、Pythonを選ぶ場合の`VIRTUAL_ENV`・`PYTHONPATH`・`PYTHONHOME`、npmを選ぶ場合の`NODE_ENV`等は、使用有無と影響を調査する名前であり、製品必須設定ではない。対象が追加する名前はconsumer、必須／任意、未設定時の扱い、scopeとともに設計で列挙する。secret値やcredentialを列挙しない | 現行で宣言済みの製品必須変数名は未確認。対象scope依存の名前は#2846と対象設計へ。既存hostの値を暗黙の必要条件にしない |
| setupの成立 | 文書経路は[再現記録](audits/document-workspace-setup-reproduction-2026-10-11-r2.json)で確認済み | 別のクリーンな作業領域から同じrevision・依存集合・option・環境構成を用意し、設計が選んだ起動／型／lint／testで対象契約を確かめる。実行command、結果、版、oracle、対象scopeを記録する | 正式setupと受入oracleは対象設計。文書のscfctl合格を製品setup合格へ置き換えない |
| 更新と復旧 | 製品環境の更新・復旧は未実施 | 現用構成と候補構成の入力、依存差、適用対象、検証と戻す構成を区別する。別環境で再構築・検証し、失敗時に現用を保持して戻せることを対象の復旧oracleで確かめる。生成環境のコピーを再現手順にしない | 構成・成果物・案件履歴の扱いはOS／INFRASTRUCTUREと対象設計。内部デプロイは別の許可。更新失敗をlockやoracleの緩和で解消しない |

技術調査の比較材料として、[PyPAのvenv案内](https://packaging.python.org/en/latest/guides/installing-using-pip-and-virtual-environments/)はprojectごとの依存環境の分離を説明し、[Pythonのvenv仕様](https://docs.python.org/3/library/venv.html)は環境を移動・コピーする代わりに再作成する性質を示す。[pipの再現install](https://pip.pypa.io/en/stable/topics/repeatable-installs/)は推移依存を含む版固定とhash照合を説明する。これらはPython環境を選ぶ場合の調査材料であり、pip／venvの採用決定ではない。

環境変数名の影響は[Pythonの起動・環境仕様](https://docs.python.org/3/using/cmdline.html#environment-variables)、venv仕様、npm仕様を比較する。既存hostの環境変数値は取得・保存しない。資料の確認日は2026-10-11であり、[調査と静的照合記録](audits/development-environment-conditions-2026-10-11.json)に比較先、対象bytes、未確定部分と限定範囲を残す。

[npm ciの仕様](https://docs.npmjs.com/cli/v11/commands/npm-ci/)ではmanifestとlockが不一致ならlockを更新せず失敗し、解決に影響するoptionも合わせる必要がある。これはNode／npmを選んだ場合の不一致検出の比較例であり、現在の環境でnpm ciを実行する指示ではない。資料の版は採用runtime版を意味せず、実際に選定する版の仕様を再照合する。

### コード・検証配置とPython境界を設計へ渡す

配置の入力は[既決の基本案](decisions/repository-layout-and-source-visibility-po-decision-2026-10-09.md)。docsに意味と対検証設計、機構のunit／connection／compositeごとのパックに実装と対応testを置く方向を起点とし、宣言・型番登録・記録・実行状態の責務を分ける。パック内の具体pathや形式は設計後に定め、ここでカット済みのコードを復元しない。

| 境界・検証経路 | 現在整理する入力と確認観点 | 設計後の出力と失敗時の戻し先 |
|---|---|---|
| Python意味処理 | 旧CLAUDE:61–63と[Pythonコア候補](../helix-harness/candidates/requirement-engine-python-core-requirements.md)を照合。要求・知識・revision／scopeから義務・不足質問・差分を導く意味と、外部作用を分ける。候補全件を採択済みにしない | 対象input／output・版・unknown／failure・互換・資源境界を設計へ。意味不足はHARNESS／BRAIN、候補の採否は#1799／#1801。schemaや通信方式をここで固定しない |
| 外部作用の境界 | DB／Git／GitHub write、認可、lease、割当・実行・状態更新はPython意味処理へ移さない。接続材料と実行結果を分ける | consumer側で対象revision・scope・版・権限を再照合する境界と対oracleを対象設計へ。実際の操作を持つOS／SECURITY／CONNECT等へ戻し、Python出力を承認や実行許可にしない |
| 型検査・lint・format | 対象言語、型契約、命名、依存方向、生成物の扱い、失敗の表現と既存規律を先に照合する | 選んだtool・設定・command・対象集合と終了状態を設計へ。formatterの自動更新と検査を区別する。契約違反は該当設計、環境不一致は環境構成、旧ruleの未移管は#1813／#1814へ |
| test・独立review | 対象要求／設計と対oracle、適用scope、正常・負例・unknown、既決REDFIRST Aを入力にする | ローカルを起点に凍結oracleと実装前Red／Greenの観測を同じrevision・環境・結果へ結ぶ。単体成功を接続／構成体成功にしない。oracle不足は対検証owner、意味変更は上流、実装欠陥は対象作成側へ。独立reviewは既存運用に従う |

### 最小対象で選ぶ安全・接続・資源・計測

#2846の[最初の要求例](requirements-first-roadmap.md#一つの要求例による初回の接続照合)は要求段階の比較例であり、最初の実装scopeの選定ではない。したがって環境条件は、例の全機構を常時必須として固定しない。対象を選んだら、実際に使う各操作について次の既存契約と対検証を照合する。

- 安全：読み書きの対象・actor・project／環境・有効なauthorityと拒否条件をSECURITYへ結ぶ。既存権限から対象外の許可を増やさない。
- 接続：Python／consumerと必要な外部接続の版・互換・scope・入力／結果・未受領をCONNECTと各端のownerへ結ぶ。未使用の接続は未選択と記録する。
- 資源：対象OS・interpreter・依存環境、保存先、Workerの実行制約、起動・復旧に必要な資源と観測をINFRASTRUCTURE／OSへ結ぶ。大規模cloudや全Botを一律に要求しない。
- 計測：対象revision・環境構成・attempt、command結果、時間・負荷・失敗・未実行範囲を原記録として残す範囲を選び、LABOの評価とINTELLIGENCEの支援入力へ渡す。記録が存在するだけで改善成功にしない。

選択結果と未確定契約は#2846へ保持する。これは必要条件の照合方法であり、安全・接続・資源・計測の具体scopeが既に確定した証拠ではない。

## 未構築の範囲と戻し先

### 初回対象案への環境条件の対応

#2846の[template提供・適用・案件追跡の対象案](requirements-first-roadmap.md#初回対象候補templateの意味契約から案件の義務追跡まで)へ、#2905の条件を次のように当てる。[POが選択した初回対象](decisions/first-development-target-selection-po-decision-2026-10-11.md)に対応する準備条件である。実装scope・toolchain・setup成立は確定しない。BRAIN032の汎用知識、CORE009の意味処理、OS002の案件記録を一つの共有state/権限へまとめない。

| 項目 | 選択対象から具体化できる条件 | 対象設計以降に残るもの |
|---|---|---|
| 実行環境・依存 | BRAINの意味JSONを読む環境、COREの意味処理、OSの記録操作、Workerの検証環境と、それぞれの接続・利用版を識別する。意味処理の候補はPythonだが、OSの外部作用の言語や全機構共通runtimeを推定しない | 対象OS/CPU/shell、interpreter/依存binaryの対応、言語版、依存manifest/lock形式と取得元、必要/任意/検証依存。候補の技術的不確実性を確認して対象要件・設計へ |
| 配置・型・lint・format | BRAINのknowledge契約、COREの適用単体、OSの案件追跡単体、各connection/compositeを責務に沿って分け、型契約・正常/負例/unknownと対検証を各ownerへ結ぶ。意味JSONと生成表示、原記録とprojection、検証設計と実行testを区別する | 既決配置基本案から各パックのpath・schema・型・tool commandと対象集合を導出。formatterは意味採用や記録訂正を代行しない。具体toolと設定は未選定 |
| 環境変数・安全 | 各consumerの入力探索、版/scope選択、記録先、接続、実行制約を識別し、未設定時のunknown/拒否とownerを示す。Pythonの探索名等は前表の調査候補のまま。通常意味処理へcredentialを渡す前提を置かない | 必須/任意の変数名、scope、consumer、欠落時の扱いを設計で列挙。secret値は記録しない。SECURITYの認可・隔離・egressをINFRA/Workerで実適用できることを別に検証 |
| ローカル検証・再現 | BRAIN032の15項目・不足/値未決、CORE009の適用集合/N/A/影響、OS002の原記録からの再構築を、それぞれのL11へ戻す。接続の版不一致・未受領・別scope、構成体の部分成功も別に扱う | 要件と対検証、凍結test/oracle、クリーン環境の固定依存復元、実装前Red/Green、独立review。具体fixtureとtoolは未構築。scfctlをこの製品検証へ代用しない |
| 初回割当・資源・計測 | OS018のLABO水準/INTELLIGENCE配置案を保持し、Worker/資源/attemptの対応、操作のauthority、時間・費用・負荷・失敗・未観測の原記録を選択scopeへ結ぶ | 初回の供給経路と未評価の限定条件は[配置入力の照合](requirements-first-roadmap.md#初回配置に供給する入力と未評価状態)を使う。実task/source/根拠・担当、資源容量/制限値、測定方式と評価scopeは未供給。性能未評価をqualifiedへ変えず、authority・安全・oracle不足も補完しない |
| setup・更新・復旧 | 各単体と辺を別の成立結果で確かめるsetup材料を用意し、旧新構成・検証対象artifact・使用版とOS案件記録を結ぶ。更新失敗時は適格な現用構成と原記録を保つ | 独立復旧資源、戻し先の構成/data互換、再接続・起動・復旧oracle、実setup/restore結果。段階構成の検証と内部デプロイは別事象・許可。単体成功だけで内部循環全体のsetup成立にしない |

対象選択後の照合でも、上の6行の責務・必要条件は選択対象に対応する一方、右欄の具体値と実依存の閉包は未確定である。初回Bench入力と配置案、接続identity、template集合の不足を#2846と各ownerへ残す。この対応だけで#2905を閉じず、ticket全体の完了条件を独立reviewで照合する。具体的な言語版・tool・設定の確定と実再現は後続設計・構築へ残る。対象案の安全/接続/資源/計測と初回配置の照合入口はロードマップの周辺契約表にあり、一段の照合先を有効依存閉包の完成へ変換しない。

文書規則の集約は #2903、環境と再現・検証経路の整理は #2905、最初の対象要求と機構接続は #2846 で扱う。セットアップ失敗は対象revision・操作・結果を記録し、環境／参照の不足と要求意味の不足を区別して戻す。未実行・unknownをpassやN/Aに読み替えない。

製品用toolchain・依存lock・設定の実体化、クリーンな領域での製品test、更新・復旧の実行は後続範囲である。L3以下の停止と再開範囲は[10/10判断](decisions/rollback-to-requirements-closure-po-decision-2026-10-10.md)に従う。本案内の再現確認やIssueのcloseから、それらの起草・実装・CI起動・内部デプロイ・releaseの許可を生成しない。

## 旧sourceと保持・変更

旧`archive/legacy-generation-2026-09-14/root/docs/governance/repository-structure.md:102–173`（LEGACY-ASSET-FDBA655B1CFF75DCDC0E）、同rootの`docs/governance/coding-rules.md:10–31,138–143`（LEGACY-ASSET-4B835ADBEFBCCC13C1C0）、`CLAUDE.md:49–63`を起点とする。責務に沿う配置、既存規則の正本、実装と検証の区別、設定の最小化、意味処理と外部作用の分離を保持する。

旧のNode／Python製品toolchainと`helix doctor`による検査は、現在停止中の製品実装経路へ移植しない。代わりに、現行で許可された文書整理の再現例とscaffold静的確認だけを案内する。変更理由は旧能力の不在ではなく、10/10巻き戻し後の作業範囲と現行の独立review経路へ対応させるためである。製品の検証義務をこの文書作業の確認へ置き換えない。
