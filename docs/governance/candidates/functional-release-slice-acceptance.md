---
document_id: HELIX-FUNCTIONAL-RELEASE-SLICE-L10-CANDIDATE
version: 0.1.0
status: draft_candidate
canonical_vmodel: L1-L12
canonical_layer: L10
canonical_pair: L3
title: "Functional Release Slice composition受入候補"
layer: L10
kind: add-design
created: 2026-09-04
updated: 2026-09-04
owner: QA / Codex TL
plan: PLAN-L3-83-functional-release-slice-composition
github_issue_id: 1494
pair_of: docs/governance/candidates/functional-release-slice-requirements.md
---

# Functional Release Slice composition受入候補

## §0 合否境界

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
| `FRS-AC-007` | FRS-R-07 | 横断機能がSliceとしてshadow測定され、証拠なしのModule増殖が起きない | Sliceを直ちにModuleへ投影するmutationを拒否 |
| `FRS-AC-008` | FRS-R-08 | qualification packetがHEAD、authority、registry、artifact、CI、DB、review、consumer、rollback、expiryを保持する | 1項目欠落、digest不一致、green件数だけのqualifiedを拒否 |
| `FRS-AC-009` | FRS-R-09 | preview／rc／stableごとの必須検証profileと独立reviewが守られる | 下位channelのgreenで上位channelを通すmutationをkill |
| `FRS-AC-010` | FRS-R-10 | rollbackまたはreplacementが同一Slice revisionのartifact／manifest／stateへ収束する | rollback成功だけでincident／releaseを終端化しない |
| `FRS-AC-011` | FRS-R-11 | Slice、Module、Bundleの更新が他identityを暗黙書換えしない | preview Sliceをstable Bundleへ暗黙包含するmutationを拒否 |
| `FRS-AC-012` | FRS-R-12 | changed pathからModule→Slice→Bundle→verification profileが決定的に導出される | secondary pathだけでownerを変更、affected Sliceを落とすmutationをkill |
| `FRS-AC-013` | FRS-R-13 | 局所検証とshared／authority／critical pathのdependent closureが両立する | Slice分割で検証義務を減らすmutationを拒否 |
| `FRS-AC-014` | FRS-R-14 | unknown／ambiguous／staleはfullまたはfail-closeへ送られる | unknownを空集合、局所green、成功へ補完しない |
| `FRS-AC-015` | FRS-R-15 | 同一入力からmanifest、artifact、checksum、digestが再現される | timestamp、順序、absolute path、credential混入をkill |
| `FRS-AC-016` | FRS-R-16 | Future／System Synthesisはrelease候補をproposalで返すだけでcurrent writeを行わない | deltaからSlice／Bundle／Requirement／Assignmentを直接変更しない |
| `FRS-AC-017` | FRS-R-17 | DevOSはgenerated manifestとseal済みreceiptだけを保存する | DevOS手編集、未承認Sliceのpublish／cutoverを拒否 |
| `FRS-AC-018` | FRS-R-18 | registry、artifact、GitHub、DB、consumer、rollbackを再生し同じrevisionへ収束する | event順序変更、projection削除、read-after不一致をgreenにしない |
| `FRS-AC-019` | §1 | RLS-02／03／05／09／11／12／13の差分が既存RLS意味を置換しない | Module／Bundleを別enumへ畳み込むmutationを拒否 |
| `FRS-AC-020` | §2 | 非対象のruntime、routing、resident lane、別authority、publishが候補から発生しない | 未承認candidateからruntime／tag／secret変更を行うmutationをkill |

## §2 量閉じと実証順

- feature contract: `FRS-FR-001..005` exact 5件。
- supporting requirement: `FRS-R-01..18` exact 18件。
- acceptance: `FRS-AC-001..020` exact 20件。
- 実証順: authority candidate → #397 IR admission → schema／registry → composition → qualification → CI／consumer／rollback → replay／read-after。
- 本候補のhappy pathがgreenでも、各negative mutation、unknown、stale、未承認writeの失敗を独立に確認する。
