# HARNESS-L2-039 authority状態補正 overlay

> append-only補正記録。既存のv1.3意味条件監査、旧source、receipt、要求registerは変更しない。

## 補正対象

2026-09-29のPO判断 `HDEC-REQUIREMENTS-57-2026-09-29` は、`HARNESS-L2-039` の明示identityとL2/L11 section digestを固定して「採択」と記録している。固定section digestはL2 `e2a71f7961a3e8c7c241c7d1ef3238382d5d709296db2fb7e57a9dd0cd9215a0`、L11 `63177feef3ec82d4e0a4bb5a56c7cfefdbe3666f0eb18f0a5d2934cfd1211746`、registerは `MPR-RC-HARNESS-L2-039-003`。この補正はこの要求pairの候補採択状態に限る。

`harness-experience-contract-coverage-receipt-2026-09-28-r3.json#HARNESS-L2-039` は、receipt `authority_effect: none` のまま、24 revision atomの局所 `no_loss` を記録する。以下のatomは、PO採択pairへreceiptが `carried` と対応づけた入力identityである。これを旧source全体の被覆、形式的successor割当、条件閉包、実行または受入完了へ拡張しない。

## 24 receipt input atoms

| Atom ID | Source line | 同内容の対revision atom | Receipt処置 |
|---|---|---|---|
| `REQSRC-SUP-00203` | v1.3 L269 | `—` | `carried` |
| `V13-BASE-6FAB-L0254` | baseline L254 | `REQSRC-SUP-00203` | `carried` |
| `REQSRC-SUP-00204` | v1.3 L271 | `—` | `carried` |
| `V13-BASE-6FAB-L0256` | baseline L256 | `REQSRC-SUP-00204` | `carried` |
| `REQSRC-SUP-00205` | v1.3 L273 | `—` | `carried` |
| `V13-BASE-6FAB-L0258` | baseline L258 | `REQSRC-SUP-00205` | `carried` |
| `REQSRC-SUP-00206` | v1.3 L275 | `—` | `carried` |
| `V13-BASE-6FAB-L0260` | baseline L260 | `REQSRC-SUP-00206` | `carried` |
| `REQSRC-SUP-00296` | v1.3 L385 | `—` | `carried` |
| `V13-BASE-6FAB-L0370` | baseline L370 | `REQSRC-SUP-00296` | `carried` |
| `REQSRC-SUP-00297` | v1.3 L386 | `—` | `carried` |
| `V13-BASE-6FAB-L0371` | baseline L371 | `REQSRC-SUP-00297` | `carried` |
| `REQSRC-SUP-00298` | v1.3 L387 | `—` | `carried` |
| `V13-BASE-6FAB-L0372` | baseline L372 | `REQSRC-SUP-00298` | `carried` |
| `REQSRC-SUP-00299` | v1.3 L388 | `—` | `carried` |
| `V13-BASE-6FAB-L0373` | baseline L373 | `REQSRC-SUP-00299` | `carried` |
| `REQSRC-SUP-00300` | v1.3 L389 | `—` | `carried` |
| `V13-BASE-6FAB-L0374` | baseline L374 | `REQSRC-SUP-00300` | `carried` |
| `REQSRC-SUP-00301` | v1.3 L390 | `—` | `carried` |
| `V13-BASE-6FAB-L0375` | baseline L375 | `REQSRC-SUP-00301` | `carried` |
| `REQSRC-SUP-00302` | v1.3 L392 | `—` | `carried` |
| `V13-BASE-6FAB-L0377` | baseline L377 | `REQSRC-SUP-00302` | `carried` |
| `REQSRC-SUP-00507` | v1.3 L650 | `—` | `carried` |
| `V13-BASE-6FAB-L0631` | baseline L631 | `REQSRC-SUP-00507` | `carried` |

基準sourceは旧HELIX archiveの `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md`（asset `LEGACY-ASSET-02319C2481B9E01698D5`、SHA-256 `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`）。24件には基準sourceとbaseline revisionの別atomを含む。baseline atomはreceiptのpaired revision IDと行SHAで結び、旧archive監査に独立した行identityがあるとは扱わない。

## 古いauthority labelの補正

旧監査JSONの次のsource行には、「039は未採択候補」という判断時点の記述が含まれる。候補採択軸だけを本overlayで補正する。既存JSON内のsource分類・condition status・形式的successor欄は履歴として変更しない。

| Source atom | 旧監査上のcondition status | 補正後の読み方 |
|---|---|---|
| `REQSRC-SUP-00204` | `version-target` | 039の正確な要求revisionは採択済み。旧source条件statusは旧監査の記録を維持。 |
| `REQSRC-SUP-00205` | `version-target` | 039の正確な要求revisionは採択済み。旧source条件statusは旧監査の記録を維持。 |
| `REQSRC-SUP-00206` | `version-target` | 039の正確な要求revisionは採択済み。旧source条件statusは旧監査の記録を維持。 |
| `REQSRC-SUP-00296` | `version-target` | 039の正確な要求revisionは採択済み。旧source条件statusは旧監査の記録を維持。 |
| `REQSRC-SUP-00297` | `version-target` | 039の正確な要求revisionは採択済み。旧source条件statusは旧監査の記録を維持。 |
| `REQSRC-SUP-00298` | `version-target` | 039の正確な要求revisionは採択済み。旧source条件statusは旧監査の記録を維持。 |
| `REQSRC-SUP-00299` | `version-target` | 039の正確な要求revisionは採択済み。旧source条件statusは旧監査の記録を維持。 |
| `REQSRC-SUP-00300` | `version-target` | 039の正確な要求revisionは採択済み。旧source条件statusは旧監査の記録を維持。 |
| `REQSRC-SUP-00301` | `version-target` | 039の正確な要求revisionは採択済み。旧source条件statusは旧監査の記録を維持。 |
| `REQSRC-SUP-00302` | `version-target` | 039の正確な要求revisionは採択済み。旧source条件statusは旧監査の記録を維持。 |
| `REQSRC-SUP-00507` | `unresolved` | 039の正確な要求revisionは採択済み。旧source条件statusは旧監査の記録を維持。 |

特に `REQSRC-SUP-00507`（旧source §10 L650）と `V13-BASE-6FAB-L0631`（baseline L631）は、同じ行SHA `c9587a6500b2a47d8827b8e9e2c966b9b79e63a1d1b01263f32b7dd8ff978f01` を持つ別revision atomである。receiptでは両方が039へ `carried` とされるため、039採択の表示は補正する。一方、旧監査の `REQSRC-SUP-00507` condition statusは **`unresolved` のまま**、formal successorは未割当のままにする。7軸のcurrent UX evidence条件がsource上で採択候補へ取り込まれたことは、全source条件の閉包や受入実行を証明しない。

## sourceと記録の固定

- PO判断: `docs/governance/decisions/po-decision-2026-09-29-57candidates.md`、SHA-256 `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`。
- coverage receipt: `docs/governance/audits/requirement-registration/harness-experience-contract-coverage-receipt-2026-09-28-r3.json`、SHA-256 `0426898d7e676b1218b4c2428c610d6ce408e41e307b3822320aefa4ec71ac20`。receipt input atom set SHA-256 `737c561b69ac7c10915d0f32a566a6d92601c2cf6315501fafd1f051042b3b80`。
- 旧監査: `docs/governance/audits/requirements-stage/legacy-v13-semantic-condition-audit-2026-09-28.json`、SHA-256 `cd765545e584c50b423d652674ac54a3240aced24a321c0caa6bc2dd881ad863`。
- authority補正はcandidate採択状態のみ。旧source condition status、正式successor、source全体のcoverage、execution/acceptance状態は生成しない。
