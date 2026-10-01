# confirmed175 live件数の訂正overlay（2026-10-01）

- 基準main: `50686b6762788574cb471967e8c24846d3dd56ae`。
- 元の時点監査: 公開in-branch commit `353e0535a943c415e4fa6fc9b93e89fb92654f5b` の `confirmed175-live-recount-2026-10-01.json`、SHA-256 `f406d89f20c5f78a4984097b03735cd6737569a4e49688e2534d58d2971b8adb`。
- 本記録は元の監査を履歴として保持し、そのartifact索引から漏れていた既存のidentity別監査を同じ厳格閾値で再照合する。採否やsource closureを変更しない。

## 訂正後の厳格件数

| 指標 | 件数 |
|---|---:|
| confirmed identity母集団 | 175 |
| 元の集計で条件比較証拠あり | 112 |
| 追加で条件比較証拠が成立 | 43 |
| 一意の条件比較証拠あり | **155** |
| 同じ閾値で未確認 | **20** |
| 正式successor割当 | 0 |
| source atom closure | 0 |
| 再配置待ちで保持 | 175 |

追加43件は元の未確認63件からのみ選び、source-qualified identityで重複除外した。旧行SHAと残余が別recordの場合は結合しない。3L-BR-007は比較先INTELLIGENCEの固定F6 L2/L11 file SHAが監査bytesにないため未確認のままにする。

## 112件の構成と厳格閾値の再分類

元のqueueにある30件の内訳は、比較artifact SHAが固定された27件と、明示的なfocused identity recordを持つ3件である。後者は `confirmed175-three-condition-meaning-delta-2026-09-28.md` の対象3 identityについて、各々のarchive source file/line SHA、固定F6 L2/L11 pairのpath/file SHA、identity固有残差が明記されている。したがって同じsource pin＋残差＋固定pairという閾値を満たすfocused側へ分類し、queue分類からは除く。strict集計は `27 queue + 93 focused − 8 overlap = 112 unique` のまま。3件は二重計上せず、175母集団や後続の155→159→167→173も変えない。詳細pinと各identityは本overlay JSONの `queue_kind_reclassification` に記録した。

## identity別判定

| Identity | 判定 | 監査recordまたは未確認理由 |
|---|---|---|
| `BR-01` | 未確認 | source pinはあるが、同一identity record内に固定F6との条件比較・残余・対象pairが揃わない。 |
| `BR-06` | 追加計上 | confirmed175-five-residual-condition-audit-2026-09-30.json /records/0 |
| `BR-08` | 追加計上 | confirmed175-five-residual-condition-audit-2026-09-30.json /records/3 |
| `D-01` | 追加計上 | confirmed175-kpi-d01-d09-condition-audit-2026-09-30.json /records/0 |
| `D-02` | 追加計上 | confirmed175-kpi-d01-d09-condition-audit-2026-09-30.json /records/1 |
| `D-03` | 追加計上 | confirmed175-kpi-d01-d09-condition-audit-2026-09-30.json /records/2 |
| `D-04` | 追加計上 | confirmed175-kpi-d01-d09-condition-audit-2026-09-30.json /records/3 |
| `D-05` | 追加計上 | confirmed175-kpi-d01-d09-condition-audit-2026-09-30.json /records/4 |
| `D-06` | 追加計上 | confirmed175-kpi-d01-d09-condition-audit-2026-09-30.json /records/5 |
| `D-07` | 追加計上 | confirmed175-kpi-d01-d09-condition-audit-2026-09-30.json /records/6 |
| `D-08` | 追加計上 | confirmed175-kpi-d01-d09-condition-audit-2026-09-30.json /records/7 |
| `D-09` | 追加計上 | confirmed175-kpi-d01-d09-condition-audit-2026-09-30.json /records/8 |
| `UX-02` | 追加計上 | confirmed175-five-residual-condition-audit-2026-09-30.json /records/1 |
| `FR-L1-05` | 未確認 | 当該identityのqueue_fixed_target_refsが空。一般的なF6 SHAや近接参照では対象pairを確定できない。 |
| `FR-L1-20` | 追加計上 | legacy-confirmed175-fr-l1-20-37-38-39-43-condition-audit-2026-09-30.json /records/0 |
| `FR-L1-21` | 未確認 | 旧行SHAはsource.source_entriesにあり、condition_comparisonとは別record。同一record条件を満たさない。 |
| `FR-L1-23` | 未確認 | 旧行SHAはsource.source_entriesにあり、condition_comparisonとは別record。同一record条件を満たさない。 |
| `FR-L1-35` | 追加計上 | confirmed175-five-residual-condition-audit-2026-09-30.json /records/2 |
| `FR-L1-37` | 追加計上 | legacy-confirmed175-fr-l1-20-37-38-39-43-condition-audit-2026-09-30.json /records/1 |
| `FR-L1-38` | 追加計上 | legacy-confirmed175-fr-l1-20-37-38-39-43-condition-audit-2026-09-30.json /records/2 |
| `FR-L1-39` | 追加計上 | legacy-confirmed175-fr-l1-20-37-38-39-43-condition-audit-2026-09-30.json /records/3 |
| `FR-L1-40` | 未確認 | 旧行pinと条件比較が別record。同一identity recordにsource pinと残余が揃わない。 |
| `FR-L1-41` | 未確認 | 旧行pinと条件比較が別record。同一identity recordにsource pinと残余が揃わない。 |
| `FR-L1-42` | 未確認 | 旧行pinと条件比較が別record。同一identity recordにsource pinと残余が揃わない。 |
| `FR-L1-43` | 追加計上 | legacy-confirmed175-fr-l1-20-37-38-39-43-condition-audit-2026-09-30.json /records/4 |
| `FR-L1-44` | 未確認 | scope identity、旧行pin、条件比較が別objectに分かれるため未確認に据え置く。 |
| `FR-L1-51` | 未確認 | 旧行SHAはsource.source_entriesにあり、condition_comparisonとは別record。同一record条件を満たさない。 |
| `NFR-05` | 追加計上 | confirmed175-nfr-01-08-11-17-condition-audit-2026-09-30.json /records/4 |
| `PM-01` | 未確認 | source_assets pinとcondition_comparisonが別record。同一identity recordにsource pinと残余が揃わない。 |
| `BBG-BR01` | 追加計上 | legacy-confirmed175-bbg-br01-br02-condition-audit-2026-10-01.json /source_qualified_identities/0 |
| `BBG-BR02` | 追加計上 | legacy-confirmed175-bbg-br01-br02-condition-audit-2026-10-01.json /source_qualified_identities/1 |
| `DAC-FR-001` | 未確認 | source pinとidentity固有の条件・残余が別record。厳格閾値では結合しない。 |
| `DAC-FR-002` | 未確認 | source pinとidentity固有の条件・残余が別record。厳格閾値では結合しない。 |
| `DAC-FR-003` | 未確認 | source pinとidentity固有の条件・残余が別record。厳格閾値では結合しない。 |
| `DAC-FR-009` | 未確認 | source pin・残余・F6 revisionはあるが、当該identityの対象pairのL2/L11 file SHAが不足。 |
| `DAC-FR-010` | 未確認 | source pin・残余・F6 revisionはあるが、当該identityの対象pairのL2/L11 file SHAが不足。 |
| `DAC-NFR-002` | 未確認 | source pinとidentity固有の条件・残余が別record。厳格閾値では結合しない。 |
| `DAC-NFR-003` | 未確認 | source pinとidentity固有の条件・残余が別record。厳格閾値では結合しない。 |
| `HBR-P0` | 追加計上 | legacy-confirmed175-hbr-p0-p1-p2-hnfr-ac-p3-p5-fixed-f6-condition-audit-2026-10-01.json /records/0 |
| `HBR-P1` | 追加計上 | legacy-confirmed175-hbr-p0-p1-p2-hnfr-ac-p3-p5-fixed-f6-condition-audit-2026-10-01.json /records/1 |
| `HBR-P2` | 追加計上 | legacy-confirmed175-hbr-p0-p1-p2-hnfr-ac-p3-p5-fixed-f6-condition-audit-2026-10-01.json /records/2 |
| `HBR-P4` | 追加計上 | legacy-confirmed175-hbr-p4-p7-p8-p9-hnfr-p8-fixed-f6-condition-audit-2026-10-01.json /records/0 |
| `HBR-P6` | 未確認 | 母集団・集計matrixにはあるが、旧行SHAと残余を持つidentity固有recordがない。 |
| `HBR-P7` | 追加計上 | legacy-confirmed175-hbr-p4-p7-p8-p9-hnfr-p8-fixed-f6-condition-audit-2026-10-01.json /records/1 |
| `HBR-P8` | 追加計上 | legacy-confirmed175-hbr-p4-p7-p8-p9-hnfr-p8-fixed-f6-condition-audit-2026-10-01.json /records/2 |
| `HBR-P9` | 追加計上 | legacy-confirmed175-hbr-p4-p7-p8-p9-hnfr-p8-fixed-f6-condition-audit-2026-10-01.json /records/3 |
| `HNFR-AC` | 追加計上 | legacy-confirmed175-hbr-p0-p1-p2-hnfr-ac-p3-p5-fixed-f6-condition-audit-2026-10-01.json /records/3 |
| `HNFR-P3` | 追加計上 | legacy-confirmed175-hbr-p0-p1-p2-hnfr-ac-p3-p5-fixed-f6-condition-audit-2026-10-01.json /records/4 |
| `HNFR-P5` | 追加計上 | legacy-confirmed175-hbr-p0-p1-p2-hnfr-ac-p3-p5-fixed-f6-condition-audit-2026-10-01.json /records/5 |
| `HNFR-P8` | 追加計上 | legacy-confirmed175-hbr-p4-p7-p8-p9-hnfr-p8-fixed-f6-condition-audit-2026-10-01.json /records/4 |
| `SR-1` | 追加計上 | legacy-confirmed175-resident-lane-sr-1-11-condition-audit-2026-09-30.json /records/0 |
| `SR-10` | 追加計上 | legacy-confirmed175-resident-lane-sr-1-11-condition-audit-2026-09-30.json /records/9 |
| `SR-11` | 追加計上 | legacy-confirmed175-resident-lane-sr-1-11-condition-audit-2026-09-30.json /records/10 |
| `SR-2` | 追加計上 | legacy-confirmed175-resident-lane-sr-1-11-condition-audit-2026-09-30.json /records/1 |
| `SR-3` | 追加計上 | legacy-confirmed175-resident-lane-sr-1-11-condition-audit-2026-09-30.json /records/2 |
| `SR-4` | 追加計上 | legacy-confirmed175-resident-lane-sr-1-11-condition-audit-2026-09-30.json /records/3 |
| `SR-5` | 追加計上 | legacy-confirmed175-resident-lane-sr-1-11-condition-audit-2026-09-30.json /records/4 |
| `SR-6` | 追加計上 | legacy-confirmed175-resident-lane-sr-1-11-condition-audit-2026-09-30.json /records/5 |
| `SR-7` | 追加計上 | legacy-confirmed175-resident-lane-sr-1-11-condition-audit-2026-09-30.json /records/6 |
| `SR-8` | 追加計上 | legacy-confirmed175-resident-lane-sr-1-11-condition-audit-2026-09-30.json /records/7 |
| `SR-9` | 追加計上 | legacy-confirmed175-resident-lane-sr-1-11-condition-audit-2026-09-30.json /records/8 |
| `S-BR-001` | 未確認 | source_assets pinとcondition_comparisonが別record。同一identity recordにsource pinと残余が揃わない。 |
| `3L-BR-007` | 未確認 | identity固有の残余recordはHELIXINTELLIGENCE-L2-010と対L11を比較するが、監査bytesにそのF6 L2/L11 file SHAがない。他機構のpinでは代用しない。 |

## 判断状態との境界

FR-L1-35は旧sourceと固定F6の条件比較証拠としてのみ追加計上する。後続PO判断ではHELIXOS-L2-045と対L11は、対象集合、`version_target`、HARNESSからOSへ移す所有範囲が未解決のため**保留**のままである。今回の計数は保留解除、successor割当、旧sourceのclosureを意味しない。

## 索引漏れと停止理由

元のartifact索引にはD-01〜09のKPI監査、BBG-BR01/02監査、SR-1〜11監査、HBR/HNFRのidentity別監査などが入っていなかった。FR-L1-51も索引外に監査があるが、旧行pinと条件比較・残余が別recordなので厳格件数に加えない。FR-L1-44もidentity、旧行pin、条件比較が分離している。

63件すべての旧archive file／行SHAを再計算した。対応JSONは、全identityのsource pin、監査record、未確認理由、監査artifactのSHA-256を保持する。この訂正から採択、退役、L3承認、受入・実装・実行、source atom被覆、要求ステージ完了を生成しない。
