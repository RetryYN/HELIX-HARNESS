# 開発repository向けlocal CI

status: scaffold
authority_effect: none
binding: SCF-B-0158

HELIX-OSのlocal CI設計L4〜L7に基づく仮設driver。#2716判断2の範囲で構築する。固定5検査をlocalで回し、Actionsでは選択済みDIFFだけを照合する。旧archiveは読み取りデータに限り、実行しない。

現在は実装中であり、CI実行・合格・正式OS unitへの移管を表さない。外部receiptから要求承認、受入、merge許可、完了を生成しない。

## 外部runtimeの準備

runnerのportable identity・sandbox mount先・SHA-256はこのdirectoryの[`config.json`](config.json)に固定されている。`prepare_runtime.py`は、明示した既存runtimeのbytes/treeがこのpinに一致するときだけ、stdlib bundleとrunner用host configを新しいrepository外pathへ作る。既存pathは上書きしない。pin不一致、symlink directory、special file、読めない入力があれば準備を拒否し、pinを更新しない。

準備scriptは指定したJSONとpathだけを読み、package install、network download、archive内runtimeの起動、実行ファイルのversion probeを行わない。runtimeの実行可否とversionは、後でrunnerが既存契約のpreflightで照合する。file symlinkは解決先がregular fileの場合だけbytesを読み、bundleでは元のrelative pathにregular fileとして書く。symlink directoryとspecial fileは拒否する。`__pycache__`、`test`、`venv`のpath componentはportable stdlib treeへ含めない。

先にhost-localのabsolute pathだけを記したJSONをrepository外に用意する。JSONと各runtime source pathはrepository外に置き、値には利用者が既に持つruntimeのpathを明示する。JSONのkeyは次のとおり。

- top-level: `python`, `git`, `bwrap`, `mounts`
- `mounts`: `python_bin`, `stdlib`, `git_bin`, `loader`, `lib_0`〜`lib_18`
- `mounts.stdlib`はbundle元の既存stdlib directoryを指す。出力host configでは、新しく作ったbundle directoryへ置き換わる。

`config.json`の全portable SHAを変えずに準備する。出力先のparent directoryは事前に作成してよいが、bundleとhost configの各出力pathは存在しない新規pathを指定する。

```sh
REPO_ROOT="$(pwd -P)"
python3 -B scaffold/local-ci/prepare_runtime.py \
  --repo-root "$REPO_ROOT" \
  --portable-config "$REPO_ROOT/scaffold/local-ci/config.json" \
  --host-paths /absolute/path/to/local-runtime-paths.json \
  --bundle-output /absolute/path/to/new-runtime/python3.12 \
  --host-config-output /absolute/path/to/new-runtime/host-config.json
```

成功時の標準出力はstatus、bundle file count、bundle SHA、profile digestだけで、host pathは出力しない。生成されるhost configには明示したhost-local pathが含まれるため、repository外で保管する。

## local CIの実行例

`BASE`と`HEAD`には要求するfull commit IDを明示し、receipt pathにはrepository外の新規pathを指定する。host configもrepository外でなければならない。

```sh
REPO_ROOT="$(pwd -P)"
BASE="<40桁のbase commit ID>"
HEAD="<40桁のhead commit ID>"
python3 -B scaffold/local-ci/driver.py \
  --repo "$REPO_ROOT" \
  --base "$BASE" \
  --head "$HEAD" \
  --host-config /absolute/path/to/new-runtime/host-config.json \
  --receipt /absolute/path/to/new-receipt.json
```

このlocal CIは固定5検査の実行結果と診断を返す仮設機構であり、設計上もrepository/要求のauthorityを持たない。準備結果、test pass、receipt、Actions上のDIFF照合は、要求承認、受入、merge/release許可、完了を生成しない。
