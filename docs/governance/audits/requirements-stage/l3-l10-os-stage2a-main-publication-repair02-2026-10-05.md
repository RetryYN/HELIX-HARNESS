# HELIX-OS Stage 2a repair02 追補監査

root検収の追加指摘3件と、旧READMEのasset ID解決を記録する作成側の追補証拠。OS Stage 2aの採択8親・1.0範囲・意味・owner・versionを変えていない。旧main publication auditおよび旧時点記録は変更していない。

- 対象: HELIXOS-L2-015 / 016 / 017 / 018 / 019 / 020 / 023 / 027
- Stage2a本文commit: `a92171633d7408282dbebdd59cb8f75b928ceb77`
- 本文parent: `5175ea14809a4344cc30e287b0272d3b340569fa`
- 追補前publication audit: `docs/governance/audits/requirements-stage/l3-l10-os-stage2a-main-publication-2026-10-05.json` (`5175ea14809a4344cc30e287b0272d3b340569fa`, SHA-256 `f9d6a0aef7dc19273c69c36de08f530701a46d1e1106ccd1ed8e39b18fe14bb9`)
- main参照: `02f40864ecfbe64d97f45fa67daafc9d9928e264`。承認済Stage2b-014 prefix bytesを6文書すべてで再照合した。
- 追補JSON SHA-256: `2bc59efecd7777ba2abadff4ec45b4a90dc299b703412f4b74a8ae8da635909c`

## root追加指摘の処置

1. 業務検証のStage2a 8親見出しへ019を追加した。本文の8親範囲は従来どおり。
2. NFR共通測定語を修正した。`n_valid=0`は分位値なし、failure/missing/censored等の観測件数を保持し、実測がまったくない場合だけ未実測とする。
3. L2-018の停止時戻し先を二段階で示した。ACと各CASE-OS-018-02a〜02lは停止理由・未完義務を記録し、最初にOS管理/推進へ戻す。外部source値の欠落/不一致なら、OS管理/推進の記録から既存source ownerへ訂正依頼する。OSはsource authorityを持たず、新owner/gateも加えていない。

## 旧README asset identity追補

旧監査のinherited source indices 2・3は `asset_id: null` だった。archive側READMEのfull SHAと台帳の `docs/design/harness/L3-functional/README.md` source SHAが一致するため、`LEGACY-ASSET-9A772391C7FB1298D45F` へ解決した。旧レコード自体は修正せず、この追補にのみpin IDとspanを追加する。

| prior pin | resolved asset ID | span | full-file SHA-256 | raw-LF span SHA-256 |
|---|---|---:|---|---|
| prior pin index 2 | `LEGACY-ASSET-9A772391C7FB1298D45F` | 16–56 | `949b0da00d2a417e1b36d3679b89735de7adadf831f567dbe383dfe6337f19e4` | `fbb50e1ed591235cba594d8b8a10d5f1c55be865e3df9c9daf75f3814a18ab6a` |
| prior pin index 3 | `LEGACY-ASSET-9A772391C7FB1298D45F` | 37–49 | `949b0da00d2a417e1b36d3679b89735de7adadf831f567dbe383dfe6337f19e4` | `f4254d0ba80424a1474a2a7baa07b646fb985ca7be8a35b79bc05403f8b33ddd` |

Source commit: `c2e4c2eb6ea29f69d9f8fa5e329adbf37c56acc7`; archived path: `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/README.md`; file 4,297 bytes / 56 lines. 旧対応は比較資料であり、現行の層配置authorityではない。

## 6文書の現在bytes

| canonical | bytes | 行 | SHA-256 | 承認済Stage2b prefix bytes / SHA-256 |
|---|---:|---:|---|---|
| `docs/helix-os/L3-requirements/functional-requirements.md` | 37121 | 158 | `2a30d207049d7152dae8375050d4e3523cb11ae72439ac1b9cfc93a76a479131` | 12600 / `cb82838b9e18ac8df5e02b48b65f1c318b90c08aec3cecd67a5d97193e827ab5` |
| `docs/helix-os/L3-requirements/business-requirements.md` | 8144 | 49 | `13c43f5f3dcd1ff8aaf348d404fb962d0894f6e97b2abd41cda671ada1995f3b` | 855 / `235787ab8c96e15ac91eec955ed5650a49a0993636e8523d006dc587f6d9a863` |
| `docs/helix-os/L3-requirements/nfr-grade.md` | 10095 | 57 | `28a8b3041a059066786ecf0a4ae7d582802094c6462563e0c3d64b8dd0a9db72` | 2732 / `0c87bdde3491124ed8e6e8888115802f91ca1897e0760b44273d395967180326` |
| `docs/helix-os/L10-verification/functional-verification.md` | 39901 | 285 | `b9c9a503b568b1878672fcfd73eb35fee2234cab9f3b69305c7c79aeb8084cf5` | 19873 / `6dcafdd7f88ad6acde046702d4c0b681c9d94973f2967f24625bf5264cb24476` |
| `docs/helix-os/L10-verification/business-verification.md` | 5385 | 34 | `f9189f593cd3dc078d405ad58e5e884240d7398c5e9f59faafa6bdff6119f6fb` | 891 / `ffed2d5b4b688dd22aa8d3aae0b3b9faadd01a6074af530c8630da602f513629` |
| `docs/helix-os/L10-verification/nfr-verification.md` | 8192 | 53 | `4bde0b30cfea98e980474945be106eccd1ce4b1f6f997f51deec3cc853106b27` | 2608 / `2c0060eaa9efc027d34011f1948d18cdec66665e17b8a5b2e9b9b29d9fb29748` |

6 prefixは承認済本文revision `6276adb92b3056b1e53055cd56f214ebc5d87158` の対象document prefixとbyte-identical。L3/L10後続候補へStage2b-014承認は継承していない。

## 静的確認と限界

- inherited fixed/legacy source 48 pins: full fileとraw-LF spanをGit bytesから再計算一致。
- README 2 spans: full file/span SHA一致、台帳asset IDのsource path/SHAが一意一致。
- 28 Stage2a AC、84 Stage2a CASE、未解決CASE参照0。
- 各停止negative 02a〜02lに停止理由とOS管理/推進への最初の戻し先を確認。
- NFRのvalid time samplesとobserved failure/missing/censored/no-measurementの区別を確認。
- `git diff --check`: PASS。

この監査は作成側の追補であり、rootによる追補後bytesの最終検収、Claude独立review、Stage2a L3承認、実行許可を生成しない。push/PR/mailbox操作、旧runtime/test/CI/Bun実行はない。
