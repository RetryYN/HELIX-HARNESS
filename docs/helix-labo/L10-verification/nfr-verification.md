# HELIX-LABO L10 NFR測定設計 — Stage 1（001/011）

[L3 NFR候補](../L3-requirements/nfr-grade.md)と同じ合成入力・scope・revisionで測定する。未実行、未承認。

| 親L2 | 測定項目 | 入力・変異 | 判定材料 |
|---|---|---|---|
| `HELIXLABO-L2-001` | 20-field coverage / observed-status fidelity | source contractごとに20 fieldsを提供し、実在する各statusを個別投入。存在する1 field/statusずつ欠落/変換し、all-success snapshotも対照fixtureにする | 20 required field coverage、存在statusのdistinctness、source上の非success event脱落0、未発生statusの捏造0、unknown/not_observedのsuccess coercion 0。 |
| `HELIXLABO-L2-001` | source isolation/partial failure | 1sourceだけcorrupt/unauthorized/secret/out-of-scope、別source valid | affected source held/warning; unrelated valid source preserved; LABO writeback 0。 |
| `HELIXLABO-L2-001` | scope boundary | Web/WEB-OS 031/032契約未選択と選択ケースを分ける | 未選択時は1.0必須依存でない。選択時だけそのaccepted source contractで扱う。 |
| `HELIXLABO-L2-011` | reference roundtrip | source observation→Aggregate→Correlate→episode candidate→sourceのidentity/revisionを往復 | 全referenceが元recordへ戻り、source ID/revisionとmissingnessを保持。 |
| `HELIXLABO-L2-011` | false causality | co-timed/co-located unrelated events、missing relation/source, aggregate-only-success | correlation candidateとcausal claimが区別され、evidenceなしcausal assertion 0。 |

測定不能・未観測は成功扱いせず、許可source不足はsource owner、relation不足はcorrelationへ返す。性能・容量・保持期間の候補が必要になった場合はL3で根拠付き比較案と対の測定を起草し、個別parameterのPO gateを作らない。
