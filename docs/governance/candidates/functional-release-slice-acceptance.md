---
document_id: HELIX-FUNCTIONAL-RELEASE-SLICE-L10-CANDIDATE
version: 0.2.0
status: draft_candidate
canonical_vmodel: L1-L12
canonical_layer: L10
canonical_pair: L3
title: "Functional Release Slice composition受入候補"
layer: L10
kind: add-design
created: 2026-09-04
updated: 2026-09-05
owner: QA / Codex TL
plan: PLAN-L3-83-functional-release-slice-composition
github_issue_id: 1494
pair_of: docs/governance/candidates/functional-release-slice-requirements.md
---

# Functional Release Slice composition受入候補

## §0 合否境界

v0.2追加差分は2026-09-05に明示承認された（[L3-PO-1494-002](https://github.com/RetryYN/HELIX-HARNESS/issues/1494#issuecomment-5548610640)）。既存v0.1承認履歴は維持する。
本承認は受入条件への承認であり、実装検収・独立レビュー・正本昇格・#397 IR admission・publish／cutoverの成立を意味しない。

Sliceを追加した事実、file count、Bundle名、green件数だけでは合格にしない。L1／L3／L10／Requirement IRのauthority、
Module ownership、Bundle exact set、依存閉包、channel、artifact、consumer、rollback、DB／GitHub／DevOSのread-afterを同じ
Slice revisionへ束縛する。candidate承認前はruntime、current DB、generated release outputへ投影しない。

## §1 Oracle完全集合

| AC ID | 対応要件 | 合格条件 | 否定mutation |
|---|---|---|---|
| `FRS-AC-001` | FRS-R-01 | schemaの全必須field、version、channel、digest、strict unknown拒否が成立する | field欠落、重複ID、別軸identity混入を受理しない |
| `FRS-AC-002` | FRS-R-02 | L1／L3／L10／IRのpath・revision・digestが同じsourceへ束縛される | Issue、README、branch、providerから意味を推測した入力を拒否 |
| `FRS-AC-003` | FRS-R-03 | shadow→preview→rc→stable→deprecated→retiredの順序と証拠が検査される | channel飛越、stale receipt、expiry後の昇格を拒否 |
| `FRS-AC-004` | FRS-R-04 | Sliceのprimary Moduleがexactly oneで、orphan／重複／owner不明が拒否される | primaryを2件または0件にするmutationをkill |
| `FRS-AC-005` | FRS-R-05 | Slice／Module／Bundleのversion、channel、digestが独立して保存される | Slice stableからModule／Bundleを暗黙stable化しない |
| `FRS-AC-006` | FRS-R-06 | included／excluded Sliceのexact set、unknown、conflict、required欠落が検査される | excludedをincludedへ戻す、未指定を含めるmutationを拒否 |
| `FRS-AC-007` | FRS-R-07 | 維持・分割・統合・移管の比較と旧新identity、所有、consumer、rollback証拠を保持する | 現境界を無条件固定、または証拠なしで新Moduleを正本化するmutationを拒否 |
| `FRS-AC-008` | FRS-R-08 | qualification packetがHEAD、authority、registry、artifact、CI、DB、review、consumer、rollback、expiryを保持する | 1項目欠落、digest不一致、green件数だけのqualifiedを拒否 |
| `FRS-AC-009` | FRS-R-09 | preview／rc／stableごとの必須検証profileと独立reviewが守られる | 下位channelのgreenで上位channelを通すmutationをkill |
| `FRS-AC-010` | FRS-R-10 | rollbackまたはreplacementが同一Slice revisionのartifact／manifest／stateへ収束する | rollback成功だけでincident／releaseを終端化しない |
| `FRS-AC-011` | FRS-R-11 | SliceとBundleがそれぞれ昇格条件を満たし、他identityを暗黙書換えしない | Bundle証拠を揃えてもpreview／rc Sliceのstable Bundle収載を拒否 |
| `FRS-AC-012` | FRS-R-12 | changed pathからModule→Slice→Bundle→verification profileが決定的に導出される | secondary pathだけでownerを変更、affected Sliceを落とすmutationをkill |
| `FRS-AC-013` | FRS-R-13 | 局所検証とshared／authority／critical pathのdependent closureが両立する | Slice分割で検証義務を減らすmutationを拒否 |
| `FRS-AC-014` | FRS-R-14 | unknown／ambiguous／staleはfullまたはfail-closeへ送られる | unknownを空集合、局所green、成功へ補完しない |
| `FRS-AC-015` | FRS-R-15 | 同一入力からmanifest、artifact、checksum、digestが再現される | timestamp、順序、absolute path、credential混入をkill |
| `FRS-AC-016` | FRS-R-16 | Future／System Synthesisはrelease候補をproposalで返すだけでcurrent writeを行わない | deltaからSlice／Bundle／Requirement／Assignmentを直接変更しない |
| `FRS-AC-017` | FRS-R-17 | DevOSはgenerated manifestとseal済みreceiptだけを保存する | DevOS手編集、未承認Sliceのpublish／cutoverを拒否 |
| `FRS-AC-018` | FRS-R-18 | registry、artifact、GitHub、DB、consumer、rollbackを再生し同じrevisionへ収束する | event順序変更、projection削除、read-after不一致をgreenにしない |
| `FRS-AC-019` | §1 | RLSの既存機構を再利用し、承認済み新要求から旧構成をversion-upする | 旧構成を共同正本として再昇格、またはModule／Bundleを同一enumへ畳み込むmutationを拒否 |
| `FRS-AC-020` | §2 | 非対象のruntime、routing、resident lane、別authority、publishが候補から発生しない | 未承認candidateからruntime／tag／secret変更を行うmutationをkill |
| `FRS-AC-021` | FRS-R-19 | 全対象要求revisionに実装・runtime接続・検証・Module・Slice・Bundleと未成立状態が対応する | 要求を分母から削除、二重owner、stale source、未検証を完成とするmutationを拒否 |
| `FRS-AC-022` | FRS-R-20 | 利用目的・責務・依存から構成とWaveを導出し旧新identityと移行条件を保持する | 旧個数や9群・17系統の固定強制、循環依存隠蔽を拒否 |
| `FRS-AC-023` | FRS-R-21 | Module連動CI・公開の完成なしに内部適用でき、同じ義務と比較条件で待ち時間・rerunを測定する | 必須義務削減、局所単回値の全CI効果への転用を拒否 |
| `FRS-AC-024` | FRS-R-22 | Phase Aで事前発行branch、dispatch前後のowner／HEAD、single-writerを確認し、成果回収・ローカル検収・独立レビューまで成立する。Phase Bはlease／fenceへ接続する | #819／#860完成の一律前提化、二重writer、所有不明、wrong HEAD、期限切れ、予算逸脱、未回収成果の受理を拒否 |
| `FRS-AC-025` | FRS-R-23 | 操作・対象・影響に必要な安全依存だけを閉包化し、全て有効な場合のみ投入可能とする | 必須安全条件をoptionalへ変更、欠落や不明をgreenにするmutationを拒否 |
| `FRS-AC-026` | FRS-R-24 | Lite／Fullのexact Slice構成にBundle固有の統合・更新・rollback・L12検証がある | 単体greenで組合せ検収を代用、未qualified Slice混入を拒否 |

## §2 量閉じと実証順

- feature contract: `FRS-FR-001..006` exact 6件。
- supporting requirement: `FRS-R-01..24` exact 24件。
- acceptance: `FRS-AC-001..026` exact 26件。
- 実証順: authority candidate → #397 IR admission → schema／registry → composition → qualification → CI／consumer／rollback → replay／read-after。
- 本候補のhappy pathがgreenでも、各negative mutation、unknown、stale、未承認writeの失敗を独立に確認する。

## §3 L1からの追跡

| 利用者要求 | L3支持要件 | L10受入 |
|---|---|---|
| FRS-BR-001 | FRS-R-01、02、03、08、09 | FRS-AC-001、002、003、008、009 |
| FRS-BR-002 | FRS-R-06、11 | FRS-AC-006、011 |
| FRS-BR-003 | FRS-R-04、05 | FRS-AC-004、005 |
| FRS-BR-004 | FRS-R-12、13、14 | FRS-AC-012、013、014 |
| FRS-BR-005 | FRS-R-10、15、17、18 | FRS-AC-010、015、017、018 |
| FRS-BR-006 | FRS-R-07、16、20 | FRS-AC-007、016、022 |
| FRS-BR-007 | FRS-R-19、20 | FRS-AC-021、022 |
| FRS-BR-008 | FRS-R-21、22 | FRS-AC-023、024 |
| FRS-BR-009 | FRS-R-23、24 | FRS-AC-025、026 |

FRS-AC-019／020は全体の正本移行・非対象境界を横断検証する。候補の記述整合とruntime oracleの実装・成功は別に管理する。
