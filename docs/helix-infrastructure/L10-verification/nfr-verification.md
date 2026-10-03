# HELIX-INFRASTRUCTURE L10 非機能検証（部分草稿）

**状態：部分草稿・未承認・未実行。** `../L3-requirements/nfr-grade.md`の候補値を検証する測定設計。上流にない性能SLAは追加せず、ここで書いた完備性・誤り0候補だけをoracle候補として照合する。

| 親L2 | 測定項目 | 入力・変異 | 判定材料 |
|---|---|---|---|
| `HELIXINFRASTRUCTURE-L2-001` | field・topology完全性 | L2/L11が列挙するfieldを含む環境別resource graph、各fieldを欠落させるfixture、対象外Model Runtime | 親が列挙した全fieldの有無、missingをunknownとして扱うこと、CONNECT logical edgeとphysical pathの分離、source/revision参照。 |
| `HELIXINFRASTRUCTURE-L2-001` | 環境誤帰属・論理物理混同 | development/staging/production/recoveryを別identityとし、別環境の成功やnetwork pathを混ぜる変異 | 環境の誤帰属とlogical/physicalの誤同一化が0であること。 |
| `HELIXINFRASTRUCTURE-L2-001` | NFR観測 | scope対象のmodel/server/GPU-memory requirement/concurrency/latency/capacity/health/endpoint | source/revision付きで観測値を記録する。親に閾値がなければ観測またはunknownとし、合否閾値を作らない。 |
| `HELIXINFRASTRUCTURE-L2-006` | control planeからの独立性 | HELIX-OS/通常control planeが利用不能なfailure fixtureで限定operation pathを評価 | 復旧pathが利用不能なcontrol planeへ依存しない。 |
| `HELIXINFRASTRUCTURE-L2-006` | authority・scopeの網羅性 | 列挙操作ごとに別SECURITY authority、target、operation scopeを個別に欠落/不一致 | authority/target/operationが不明なら停止し、残作業と最終適格revisionを保持する。 |

測定結果はfield完全性、owner境界、source revision、unknown/holdの処置などの観測値で記録する。性能時間・容量・保持期間の合否値がL2/L11にない場合、測定値は参考情報として保持し、閾値へ昇格させない。候補値は通常のL3承認パッケージにまとめ、parameterごとの承認を求めない。
