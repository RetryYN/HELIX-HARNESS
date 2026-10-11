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

上の例はdetached領域での読取り確認である。編集するときは独立した作業branchを用意し、対象を読んでから変更する。commit・push・Draft PR・exact base／content HEADの独立review・Ready化・独立側の明示merge・read-afterは既存の運用モデルに従う。通知箱はrootの既存仮設経路に一本化し、作業領域ごとに複製・再設定しない。作業領域の片付けも同モデルの既存条件に従う。

## 未構築の範囲と戻し先

文書規則の集約は #2903、環境と再現・検証経路の整理は #2905、最初の対象要求と機構接続は #2846 で扱う。セットアップ失敗は対象revision・操作・結果を記録し、環境／参照の不足と要求意味の不足を区別して戻す。未実行・unknownをpassやN/Aに読み替えない。

製品用toolchain・依存lock・設定の実体化、クリーンな領域での製品test、更新・復旧の実行は後続範囲である。L3以下の停止と再開範囲は[10/10判断](decisions/rollback-to-requirements-closure-po-decision-2026-10-10.md)に従う。本案内の再現確認やIssueのcloseから、それらの起草・実装・CI起動・内部デプロイ・releaseの許可を生成しない。

## 旧sourceと保持・変更

旧`archive/legacy-generation-2026-09-14/root/docs/governance/repository-structure.md:102–173`（LEGACY-ASSET-FDBA655B1CFF75DCDC0E）、同rootの`docs/governance/coding-rules.md:10–31,138–143`（LEGACY-ASSET-4B835ADBEFBCCC13C1C0）、`CLAUDE.md:49–63`を起点とする。責務に沿う配置、既存規則の正本、実装と検証の区別、設定の最小化、意味処理と外部作用の分離を保持する。

旧のNode／Python製品toolchainと`helix doctor`による検査は、現在停止中の製品実装経路へ移植しない。代わりに、現行で許可された文書整理の再現例とscaffold静的確認だけを案内する。変更理由は旧能力の不在ではなく、10/10巻き戻し後の作業範囲と現行の独立review経路へ対応させるためである。製品の検証義務をこの文書作業の確認へ置き換えない。
