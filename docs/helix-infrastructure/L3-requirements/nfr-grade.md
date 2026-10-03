# HELIX-INFRASTRUCTURE L3 非機能要件・候補値（部分草稿）

**状態：部分草稿・未承認。** 下表は上流のfield/status/境界を測定可能にする候補値と比較観点である。完全coverage、誤昇格/誤帰属0等の候補は親の明示条件に基づき、L2が指定した性能SLAだとは扱わない。旧HELIXの数値を自動継承せず、測定不能/未観測を成功扱いしない。

| 項目 | 候補値・比較 | 根拠と測定 | 代替・未確定範囲 |
|---|---|---|---|
| `HELIXINFRASTRUCTURE-L2-001` — topology field coverage | 各観測でparent列挙のresource identity/role/environment/location/version/dependency/lifecycleをsource-linkedに保持 | L2-001とL11のresource tuple。environmentごとのfixtureを照合し、必要field欠落はunknown。 | resource数・environment数・latency/capacity thresholdはL2/L11が規定しない。 |
| `HELIXINFRASTRUCTURE-L2-001` — 環境混同・論理物理誤同一 | 誤帰属0（別environmentを本番証拠にしない、logical CONNECT edgeをphysical routeにしない） | L2-001の独立environment・logical/physical区別。scopeを混ぜるmutationを照合。 | availability、topology discovery時間のSLOなし。 |
| `HELIXINFRASTRUCTURE-L2-001` — network/storage metadata completeness | 親列挙のpath tuple全fieldとstorage owner/durability/backup/retention/environment/confidentiality/recovery属性が未観測ならunknown | L2-001/L11のfield列挙。各属性を欠落・他environment由来にし、推定補完がないことを確認。 | retention日数、backup回数、GPU memory、concurrency、latency等はresource sourceが示す値を測定するだけで閾値を追加しない。 |
| `HELIXINFRASTRUCTURE-L2-006` — recovery dependency independence | 停止対象control planeへの依存経路0 | L2-006/L11のOS/control plane unavailable scenario。各bounded operation path dependencyをgraphで照合し、停止対象へ戻るedgeがない。 | 運用の可用性%、RTO/RPO、recovery timeout/retryは根拠なし。 |
| `HELIXINFRASTRUCTURE-L2-006` — authority and operation scope | 列挙operationすべてが別SECURITY authority/target scopeと対応し、未対応operationの成功claim 0 | L2-006/L11列挙操作: bootstrap, health check, service stop, rollback, recovery。各scope/authorityを欠落・不一致で試験。 | 操作ごとの人手approvalや追加gateを作らない。 |

## 測定・承認境界

この表のcoverage/誤昇格0/誤帰属0/roundtrip完全性は親L2/L11の明示要素を漏れなく守る候補である。実測性能値の採否はテストfixtureとL4以降の実現可能性を踏まえ通常のL3承認へまとめて送る。個別parameter承認を要求しない。上流が指定する外部version/range/retention等があるときは当該source値を使い、新しい値を作らない。
