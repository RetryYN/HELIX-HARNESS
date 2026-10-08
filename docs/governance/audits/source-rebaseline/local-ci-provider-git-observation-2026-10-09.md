# local CI provider Git初回identity観測

status: observation_record
authority_effect: none
recorded_at: 2026-10-08T21:51:12.023556+00:00

- 観測対象main: `e997e0bc9f11dd5a2f5b332bf7d7297bd288243e`
- Actions run: [37849424799](https://github.com/RetryYN/HELIX-HARNESS/actions/runs/37849424799)、job `113558360272`
- Dispatch時刻: `2026-10-08T21:49:22.132205+00:00`
- Workflow本文SHA-256: `4a35a0cc629a50e0ae0331b57b8789195bb6cf600e14836d56af4707e6b30f1e`
- Trusted provider本文SHA-256: `8c15f4772867f40451d90ec77af6758c0199b83daf95dbb8ca33b50b65ec5387`
- Local receipt canonical digest: `64756f264c826221581e04e67ec3f0a33ad2b1d1648d553ffc9e070d8e8e1138`
- Provider executable: trusted adapterの固定設定`/usr/bin/git`。dispatch/receiptからpathを入力していない。
- 観測tuple: `name=git`, `version=2.55.0`, full-file SHA-256 `d4d2ba562243015206d4248edfec871a74786499292d00ed072dbca2f5ae8073`
- 結果: `Unobserved(not_run)`、detailは`provider Git pin is not yet observed in source config`。workflow conclusionは`failure`であり、期待した非肯定のidentity-only停止である。

信頼済みmainのproviderがbinary bytesと`--version`だけを観測した。pinは未設定だったため、target解決・receipt検証・DIFFの実行・positive ProviderResultへ進んでいない。初回観測をparityやCI passとして扱わない。runner image labelやGit versionだけからupstream provenanceを保証しない。

同じ作業の次の技術差分として、共有configの`executables.provider_git`だけへこのtupleを固定する。local Git（2.43.0 / `2a8c18fbf43da9f692d75474c72bea9dfd796c260b0f3dfe456376abc3bbd668`）、Python、bwrap、sandbox profileは変更しない。config digestが変わるので旧receiptを再利用せず、独立review・merge後のmainでlocal receiptを再生成してからActionsのselected DIFF parityを測定する。今回の記録は製品要求の採否、OS-020/HARNESS-036 ACのpass、L8〜L10実行合格、Issue close、releaseを生成しない。
