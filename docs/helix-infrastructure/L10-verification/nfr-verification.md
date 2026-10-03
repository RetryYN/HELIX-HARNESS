# HELIX-INFRASTRUCTURE L10 非機能検証（部分草稿）

**状態：部分草稿・未承認・未実行。** `../L3-requirements/nfr-grade.md`の候補値を検証する測定設計。このStage 1契約確認に不要な性能SLAは追加しない。別の技術値が要件上必要な場合は、上流指定の有無にかかわらず根拠・比較・測定方法付きのL3候補として提示し、承認前の閾値をoracleへ適用しない。

| 親L2 | 測定項目 | 入力・変異 | 判定材料 |
|---|---|---|---|
| `HELIXINFRASTRUCTURE-L2-001` | field・topology完全性 | L2/L11が列挙するfieldを含む環境別resource graph、各fieldを欠落させるfixture、対象外Model Runtime | 親が列挙した全fieldの有無、missingをunknownとして扱うこと、CONNECT logical edgeとphysical pathの分離、source/revision参照。 |
| `HELIXINFRASTRUCTURE-L2-001` | 環境誤帰属・論理物理混同 | development/staging/production/recoveryを別identityとし、別環境の成功やnetwork pathを混ぜる変異 | 環境の誤帰属とlogical/physicalの誤同一化が0であること。 |
| `HELIXINFRASTRUCTURE-L2-001` | NFR観測 | scope対象のmodel/server/GPU-memory requirement/concurrency/latency/capacity/health/endpoint | source/revision付きで観測値を記録する。このStage 1契約検証にperformance閾値は不要であり新設しない。将来このscopeで閾値が要件上必要なら、L3候補として根拠・比較・測定方法とともに提示し、未承認値を合否へ適用しない。旧値や参考測定値を自動閾値化しない。 |
| `HELIXINFRASTRUCTURE-L2-006` | control planeからの独立性 | HELIX-OS/通常control planeが利用不能なfailure fixtureで限定operation pathを評価 | 復旧pathが利用不能なcontrol planeへ依存しない。 |
| `HELIXINFRASTRUCTURE-L2-006` | authority・scopeの網羅性 | 列挙操作ごとに別SECURITY authority、target、operation scopeを個別に欠落/不一致 | authority/target/operationが不明なら停止し、残作業と最終適格revisionを保持する。 |

測定結果はfield完全性、owner境界、source revision、unknown/holdの処置などの観測値で記録する。このStage 1契約検証では、対象behaviorの合否に性能時間・容量・保持期間の閾値を要しないため新設しない。別の技術値が要件上必要なら、上流に数値指定がなくてもL3候補として根拠・比較案・測定方法を添えて通常の承認パッケージに提示し、parameterごとの承認は求めない。旧値や参考測定値を自動継承・合否閾値へ昇格させない。
