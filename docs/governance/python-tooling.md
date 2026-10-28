# RepositoryのPython整形・静的検査

`helix/`と`scaffold/`のPythonには、ルートの[`ruff.toml`](../../ruff.toml)を使う。
Ruff 0.17.1のformatterとlinterを同じ設定で実行する。`archive/`と通知のlocal証拠は対象外である。
選定と既存違反の扱いは[技術判断記録](decisions/python-format-lint-tool-selection-2026-10-28.md)に残す。

これは本repositoryのローカル開発用設定であり、製品利用者のtool選択や品質保証全体の定義ではない。
GitHub workflowへの組込みは、[workflowの入口](../../.github/workflows/README.md)とWR72の検証契約整理へ戻す。

## 準備と確認

利用するPython環境へ固定版を導入する。仮想環境を使う場合も同じ版を指定する。

```sh
python3 -m pip install 'ruff==0.17.1'
```

repositoryルートで次の1コマンドを実行する。最初の検査が失敗した場合も整形検査を実行し、
どちらかが失敗すればコマンド全体を失敗にする。修正は行わない。

```sh
sh -c 'RAYON_NUM_THREADS=2 python3 -m ruff check --no-fix --no-cache; lint_status=$?; RAYON_NUM_THREADS=2 python3 -m ruff format --no-cache --check --output-format concise; format_status=$?; test "$lint_status" -eq 0 && test "$format_status" -eq 0'
```

GUIレーンが実行するときは、既存の`bounded_exec.py`を通す。

```sh
python3 -B scaffold/tools/bounded_exec.py --timeout-ms 60000 --max-output-bytes 200000 -- sh -c 'RAYON_NUM_THREADS=2 python3 -m ruff check --no-fix --no-cache; lint_status=$?; RAYON_NUM_THREADS=2 python3 -m ruff format --no-cache --check --output-format concise; format_status=$?; test "$lint_status" -eq 0 && test "$format_status" -eq 0'
```

`RAYON_NUM_THREADS=2`は多CPUのWSLでthread数に伴う仮想メモリがwrapperの上限を超えた実測への対処である。
新しい品質閾値ではない。Ruffの版違いは`required-version`で失敗する。
終了コード、対象revision、出力の切詰め、process回収をそれぞれ確認する。

## 整形と意味の検証

整形を適用するコマンドは次のとおり。初回の一括適用は設定PRとは別の整形PRへ分ける。

```sh
RAYON_NUM_THREADS=2 python3 -m ruff format --no-cache
```

`ruff check --fix`はこの整形コマンドに含めない。import削除、変数名、式の変更は別の差分で判断する。
初回整形では、全Pythonの前後AST（位置情報を除く）と文字列値、対象集合を照合し、
全unit testを同じ条件で再実行する。記録された過去revisionのsource/test SHAは歴史証拠として保持する。

現在のPython unitは`HELIXBRAIN-UNIT-DESCRIPTOR-DEFINITION`の1つである。unitのdirectoryで実行する。

```sh
PYTHONPATH=src:tests python3 -B -m unittest discover -s tests -v
```

formatter/linterの成功は、動作test、上流設計との照合、独立review、受入の代わりにはならない。
設定PR時点では既存コードの整形違反が残る。整形PRで解消した実測を別に残す。
