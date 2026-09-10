# インフラ・運用品質 L3要求候補

状態: candidate / unapproved。source: #1728。

| ID | 機能・非機能要求候補 |
|---|---|
| NIO-L3-01 | Requirement formationは対象、環境、workload、failure mode、data criticality、RTO/RPO候補、観測可能性、運用ownerをtyped inputとして収集し、未知をunknownのまま保持する。 |
| NIO-L3-02 | Design Obligation Graphはdeployment、configuration、secret、capacity、telemetry、logging、alert、incident、backup、restore、rollback、maintenance、decommission、costの適用性を全件導出する。 |
| NIO-L3-03 | measurement evidenceはmetric定義、単位、scope、source、authority、timestamp、freshness、collector health、sample count、digestを持つ。 |
| NIO-L3-04 | logging contractはevent identity、severity、correlation、redaction、retention、loss/duplication、ordering、clock、schema evolutionを扱い、secret/PIIを既定denyする。 |
| NIO-L3-05 | alertはtyped findingからincident/recovery ownerへ決定的にrouteし、重複・storm・silence・ack・expiryを管理する。 |
| NIO-L3-06 | backup/restore、rollback、failover、degraded operationは実行可能なprocedureとfault injectionを持ち、名称や文書の存在を成功証拠にしない。 |
| NIO-L3-07 | operation evidenceはrequirement/design/test/runtime/release identityへ双方向traceし、差分をRequirement Re-entryへ送る。 |
| NIO-L3-08 | 自動修復は対象契約、actor、tool、target、params、budget、blast radius、rollback、独立検証、consumer evidenceが成立した範囲だけruntime admissionする。 |
| NIO-L3-09 | designed/implemented/verified/observed/operatedの状態遷移は証拠付きで、collector停止・欠測・staleをhealthyへ変換しない。 |

## 既存owner接続規律

- #219〜#223を計測・event・logging・routingのownerとして再利用する。
- #1160をdeployment以後、#1169を要求還流、#1033/#290を横断構成のownerとして再利用する。
- #282/#186/#1318を要求導出・機械生成・TDD接続へ利用する。
- owner未確定時は新実装へ落とさず、未被覆findingとして統制側へ返す。
