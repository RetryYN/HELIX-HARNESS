# HELIX-HARNESS-LITE配布ガイド

HELIX-HARNESS-LITEは、requirements、L1–L12、typed workflow identity、CI／doctor、exact-HEAD review、
completion evidenceをconsumer repositoryへ導入するstable subsetです。HELIX-HARNESSが唯一のsource authorityであり、
Liteは独立forkではありません。

## 必要環境

- Node.js `>=24.15.0 <25`
- npm
- Git
- Codex／Claudeを使う場合は各provider公式CLIで認証する。credentialをrepositoryへ保存しない。

## installとsetup

検証済みtarballをconsumer repositoryへ配置し、checksumを確認してからinstallします。

```sh
npm install --ignore-scripts ./HELIX-HARNESS-LITE-1.0.0.tar.gz
npx --no-install helix setup project --dry-run --json
npx --no-install helix setup project --json
npx --no-install helix status --json
npx --no-install helix doctor --profile consumer --json
```

setupはHELIX管理fileだけを作成します。同名のconsumer所有fileが異なるbytesで存在する場合は上書きせず停止します。
monorepoではHELIXを適用するpackage rootから実行してください。

## minimal workflowとcompletion evidence

provider実行を伴わないbounded dry-runとcompletion evidenceは次で確認できます。

```sh
npx --no-install helix codex --role se --task "consumer task" --json
npx --no-install helix claude --role qa --task "consumer review" --json
npx --no-install helix completion decision-packet --json
npx --no-install helix completion review-bundle --json
```

Liteは`team run`、resident lane、provider自動配車を正規consumer commandとして公開しません。

## 更新／復旧／削除

engine versionはpackage managerのimmutable versionまたは検証済みtarball digestへpinします。upgrade前に現在pinを保存し、
失敗時は直前pinだけへrollbackします。consumer sourceと`.helix/evidence`は巻き戻しません。uninstallではpackageとHELIX管理fileだけを
対象とし、consumer所有fileやcompletion evidenceを削除しません。

## proxy／CA／mirror設定

network設定はnpmとprovider公式CLIの標準設定を使用します。HELIXへproxy credential、CA private key、mirror tokenを
書き込みません。offline CIでは`npm ci --ignore-scripts`と`npx --no-install`を使用し、暗黙downloadを許可しません。

## support／security境界

host破壊、credential送信、任意network egress、cloud destructive operation、production impactはLiteの自動許可対象ではありません。
問題報告にはsecret／PIIを含めず、source HEAD、profile digest、artifact digest、doctor receiptだけを添付してください。

正式な配布repositoryは`RetryYN/HELIX-HARNESS-DevOS`です。旧`HELIX-HARNESS-OS`はcompatibility input-onlyです。

## licenseとprovenance

- license: `LICENSE`
- third-party: `THIRD_PARTY_NOTICES.md`
- provenance: `PROVENANCE.md`およびartifact manifest
- disclaimer: `DISCLAIMER.md`
