# HELIX-OS Stage 2a L3/L10確認資料（2026-10-05）

本文revision `2cf89e02c345736f15e41a0df13ea98dc69fc07a`。8親015/016/017/018/019/020/023/027、6文書456行、28 AC・84機能CASE・8 NFRと対の測定設計。L3未承認・L10未実行。

正本と判断の出所を辿れる管理記録、複数対象の状態表示、HARNESS契約に沿うticket推進、Worker割当、実行証拠の継続、検証運転と受渡しを具体化した案です。未評価のWorkerについても、固定親の六条件と有効な操作authority、人の限定scope確認が揃った初回作業を扱い、結果の検証・人確認・LABO受領と性能評価を別々に記録します。

技術候補は、同じ入力から作るticketの一致、必要bindingの欠落数、累積制約の保持、scope別の予算・時間分布です。比率は契約入力が定義する分母・開始点・単位がある場合に限り、欠測・分母0・失敗を隠しません。一律の予算、期限、件数、score、SLAは根拠なく加えません。

固定L2/L11の意味・範囲・担当・1.0の版を保持し、旧L3要件と対の検証文書について項目別の再利用・再導出・置換を本文に記録しました。旧指摘の未解消・未確認範囲は監査へ持ち越しています。修正後exact HEADのClaude独立reviewと、それを添えたPOのL3判断が残ります。

|正本|SHA-256|
|---|---|
|`docs/helix-os/L3-requirements/functional-requirements.md`|`4a7cd38bf18e99771b1fddf3df8655cf5b3002bf37f7e986a6ec03e32c86d0fd`|
|`docs/helix-os/L3-requirements/business-requirements.md`|`63fbc1015bd3201e865aadebdaf4a1c8e90d9aac0d22f499f3c1e8dae64f16a8`|
|`docs/helix-os/L3-requirements/nfr-grade.md`|`e6ce8baa339d98e0e8c9035da88af2ec0b13187ab09825cbf843cadbf591fab4`|
|`docs/helix-os/L10-verification/functional-verification.md`|`bcb7716aaaa1a2b059c228a7ea3d5e6770f89bc4d989fa54aef1e2f8c2086724`|
|`docs/helix-os/L10-verification/business-verification.md`|`5340970c819e4f55c510fd8ac07dd76a5d5aab8f20da82e8b610b642210836e7`|
|`docs/helix-os/L10-verification/nfr-verification.md`|`01531f013063076f1f94dca60799ad9fbbd2a1cd436766911ed04d883ac04ea0`|

静的監査：[l3-l10-os-stage2a-static-validation-2026-10-05-2cf89e02c.json](l3-l10-os-stage2a-static-validation-2026-10-05-2cf89e02c.json)。48 source pinをGitの全文・実在行spanから再計算し、不一致0。AC/CASE重複・未解決参照0、scf147 fail0/stale0/residuals0、govcheckとdiff-checkは合格。実行・性能の実測は行っていません。
