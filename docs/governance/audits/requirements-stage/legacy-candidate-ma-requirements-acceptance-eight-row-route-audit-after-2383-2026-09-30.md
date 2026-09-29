# 旧Mechanism Adequacy要件・受入候補8行のL2/L11照合案

## 概要

- 基準main: `4cdbf2f8b87b437a2353186961f6a6dd15b13275`（#2383 merge後）。`authority_effect`は`none`。
- 対象は旧MA requirements 6行とacceptance 2行。L2要件とL10受入が同じMA候補契約を構成する範囲を先行して照合する。
- #2382のeffective recountは478 product/unknown、317 product-targeted unionとの交差288、未監査190。#2383のMA要求9行を適用後、残りは181行。
- 対象8行は#2382後の478 poolに入り、classification overlays、#2382時点の347 route union、#2383の9行を含む後続356 route unionとの交差はいずれも0。8行の原文line SHAをcarry-forward inventoryおよびarchive bytesで照合した。
- 個別routeは`partial=7 / unknown=1`。候補status、台帳、PR、Issue参照から採択・successor・coverageを推定しない。

## 旧source

| source | asset | file SHA-256 | selected IDs |
|---|---|---|---|
| `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/mechanism-adequacy-requirements.md` | `LEGACY-ASSET-6B290551143ECF5F90DA` | `9dc69a90285a7d70f0b03b71a8189fb8404c26e40386f98b70b4c787c8740dc2` | `003336, 003337, 003343, 003344, 003349, 003353` |
| `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/mechanism-adequacy-acceptance.md` | `LEGACY-ASSET-2CE2F9E494E084235170` | `de7e7a248ab0f0eaab77f6fba079c1876a244f50e6282ec5600c147187b9b7f6` | `003137, 003158` |

## 固定採択比較

- 比較revision: `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2/L11 pinsとPO判断記録のdigestはJSONに記録した。
- `HARNESS-L2-003` / L2:54・L11:23は意味変更を正しいownerへ返すこと、`HARNESS-L2-004` / L2:55・L11:24は要求→設計/test traceと変更時の再検証、`HARNESS-L2-005` / L2:56・L11:25は検証義務・oracle・expected failure・current evidence、`HARNESS-L2-007` / L2:58・L11:27はVersion 1の証拠範囲とHELIX-Web完了の除外、`HARNESS-L2-008` / L2:59・L11:28は候補・Issue/PR/CIから要求合意・操作許可を生成しない境界。
- `HELIXOS-L2-005` / L11:25は出典と適用範囲付きの観測・失敗・改善候補を登録し、LABOへ還流して追跡する。`HELIXOS-L2-007` / L11:27は共通provenance/evidenceの欠落・重複・stale拒否、`HELIXOS-L2-019` / L11:352–357はevent provenance、projection再構築・失敗時checkpoint拒否に限って比較する。
- `HELIXLABO-L2-004/005/007/010` / L11:48–54は意味保存比較、保持/変更意味の区別、同条件再現・oracle/副作用、target-specific Feedback proposalとevidence/scope/counterexample/risk/revalidationを定める。候補判断や権限変更は行わない。
- `HELIXSECURITY-L2-008` / L2:140–148・L11:32はactor/target/operation/revision/environment/scope/expiryが一致するoperation-specific authorityを要求する。`HELIXSECURITY-L2-025` / L2:312–320・L11:49はWeb→Internal HELIXのtenant/service identity・classification境界を定め、Web公開運用を1.xに置く。
- これらは近接predicateの限定一致だけに用いる。MA固有の不足誤認分類、評価の決定性、AI output provenance、DB replay、過去事例のpoint-in-time replay、Learningの意味・責務は採択に含めない。

## 行別route

| Source ID | 旧source line | route | 固定採択predicateとの関係 |
|---|---:|---|---|
| `LEGACY-CAND-LINE-003336` | requirements:57 | partial | `HELIXLABO-L2-010` L2:141・L11:54のtarget-specific Feedback proposalと証拠・scope・counterexample・regression risk・revalidationが、候補出力と証拠の一部に重なる。MA固有schema、副作用、migration/rollback全体は未採択。 |
| `LEGACY-CAND-LINE-003337` | requirements:58 | partial | `HELIXLABO-L2-004` L2:93・L11:48、`HELIXLABO-L2-005` L2:101・L11:49、`HARNESS-L2-003` L2:54・L11:23の意味保存比較・意味変更明示・ownerへの返却が重なる。MA提案の詳細次元と専用評価基準規則は残る。 |
| `LEGACY-CAND-LINE-003343` | requirements:66 | partial | `HELIXLABO-L2-007` L2:117・L11:51の同条件再現、機械判定、oracle、副作用範囲、retry/rollback/idempotencyが重なる。固定入力によるMA評価再生成とAI model/session/context/output digestは未確定。 |
| `LEGACY-CAND-LINE-003344` | requirements:67 | partial | `HELIXOS-L2-019` L2:682–690・L11:352–357および`HELIXOS-L2-007` L2:60・L11:27がevent provenance、projection、duplicate/stale区別、projection failure時の成功checkpoint拒否に重なる。旧MA専用DB構造、順序・wrong-HEAD・世代/environment混載規則全体は未採択。 |
| `LEGACY-CAND-LINE-003349` | requirements:74 | partial | `HELIXSECURITY-L2-008` L2:140–148・L11:32はactor/target/operation/revision/environment/scope/expiryのoperation authorityとmissing/expired/drifting時の拒否に重なる。候補文言にかかわらず、MA probe lifecycleの全体を採択したとは扱わない。 |
| `LEGACY-CAND-LINE-003353` | requirements:80 | partial | `HELIXLABO-L2-010` L2:141・L11:54のFeedback proposal、`HELIXOS-L2-005` L2:58・L11:25のsource/scope付き改善候補の還流・追跡が重なる。旧Learning authority、point-in-time replay、後日判明した正解の排除は未採択。現行改善評価のownerはLABO。 |
| `LEGACY-CAND-LINE-003137` | acceptance:23 | unknown | 関連確認として`HARNESS-L2-005` L2:56・L11:25の汎用verification/oracle/evidenceを照合したが、直接重なるMA固有predicateはない。誤設定を能力不足と判定しない条件が未採択のためunknownを維持する。 |
| `LEGACY-CAND-LINE-003158` | acceptance:47 | partial | `HELIXSECURITY-L2-008` L2:140–148・L11:32のoperation authority、`HARNESS-L2-007` L2:58・L11:27のHELIX-Web completion除外、`HELIXSECURITY-L2-025` L2:312–320・L11:49のWeb asset boundaryが限定的に重なる。Web専用dependency/schema/Release禁止は採択されていない。 |

## authority境界と限界

- これは旧candidate sourceのroute監査案であり、候補revisionの採択、formal successor、旧source全体のcoverage、acceptance execution、implementation、Stage 5完了を示さない。
- MA candidate/Issue/PLANに書かれた過去の承認・lint・test記録は、固定された現行L2/L11 authorityや現在の実行証拠へ昇格しない。
- 旧Learningの再導入、独自DB/replay契約、MA候補からの操作許可生成、Web scopeの拡張・縮小にはこの監査はauthorityを与えない。
- archive workflow、CLI、hook、adapter、test、CI、runtimeは実行していない。静的なrevision、row ID、原文digest、pool、route、authority境界の照合のみ。
