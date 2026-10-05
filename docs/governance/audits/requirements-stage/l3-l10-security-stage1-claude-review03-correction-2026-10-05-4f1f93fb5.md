# PR #2578 SECURITY Stage 1 review03 修正記録

本文commit: `4f1f93fb5e9eb085f7abf49a810b3da667757b85`（親 `170272a4b562bee3f1c34a4c514f01454978a84b`）。公式review comment `#5986152189`、raw body SHA-256 `fc2dd2260d3c0e090b30794e00fabebb7180b840686e063dc25b33f926116bc7`。

全18指摘（Major 4、Minor 14）を本文または訂正監査へ反映した。L2/L11のscope、owner、version、authorityは変更していない。作成側修正であり、root検収と独立reviewは未完了。

## 指摘ごとの処置

| 指摘 | 重大度 | 反映位置 | 処置 |
|---|---|---|---|
| M1 (X1-005) | Major | FR:118 | 旧assetをLEGACY-ASSET-99C939E249CAF40935CBへ修正しfull SHAとlines 61–64を明記。Capability Leaseはarchive内不在の検索範囲を明記し、L1-005が指す現行判断記録とfull SHAへsource pin。 |
| M2 (020 L11 quote) | Major | FV:206 | L11:44原文を固定oracleへ戻し、既存contract条件をBot fixtureで判定するよう分離。 |
| M3 (033-2) | Major | FR:322; FV:225–226 | L2-007隔離制約の適用不能と観測不能を別変異にして、対象dispatchだけ停止・戻し先保持。 |
| M4 (033-5) | Major | FR:320 | 固定L2:462の選択task contract文意へ再記述し「共通」「証拠交換」を削除。 |
| x3 / N2 | Minor | FR:38 | EE5 assetに2026-10-03 metadata correctionがあったとの誤記を除き、対象はL2-003 registration MPR -002と明記。旧auditは不変、新auditへ誤記訂正履歴を記録。 |
| N3 (FV:40,49) | Minor | FV:40,49 | 固定L11:25/26のoracle文を正確に戻し、source identity/classification等はfixture側へ分離。 |
| N4 (FR:126) | Minor | FR:126 | assignment contextを除き、fixed L2-005 credential request actor/environmentをL2-008 tupleと照合。 |
| N5 (FV:89,91) | Minor | FV: SECURITY-CASE-006-01 | source identity欠落の独立fixtureと不合格oracleを明記。 |
| 007-1 | Minor | FV:116,118 | Worker自己拡張、rollback不能を独立変異として追加。 |
| 007-2 | Minor | FV:101 | owner declarationをSECURITY policy revisionの宣言値に特定。 |
| 007-5 | Minor | FV:114 | policy revisionとsource revisionを別々の束縛対象として列挙。 |
| 007 timeout | Minor | FV:115 | L11 fixture descriptor 90sとfixture由来の記録を回復し、製品既定値でないことを維持。 |
| 013-1 | Minor | FV:170 | producerだけの変更をCASE-013の独立negative fixtureに追加。 |
| 020-1 | Minor | FV:207 | Bot応答待ちだけを変える別fixtureで決定結果/権限不変を確認。 |
| 033-1 | Minor | FR: SECURITY-AC-033-01 | 別HEADで作成した成果を同一task結果として受理する変異を不合格に追加。 |
| N3-033 digest | Minor | FR:318 | receipt candidate_digest_ruleと318ec4aでのb486値、633bf12でP0 tailが異なるため再計算値0008f6e6…となることを明記。 |
| N4-033 owner | Minor | FV:235 | INFRASTRUCTUREをL2-033 ownerとして割当てず、L2-007 physical application observation ownerへ返す記述に限定。 |
| N5-audit | Minor | new audit legacy source reconciliation | 78eadc096の誤ったP8-04 range 168–171を171へ訂正し、本文に引用されるarchitecture/SEA assetsとraw spansを追加。旧audit bytes不変。 |

## source・本文検証

固定L2/L11、PO採択記録、registration receipt、L1-005およびCapability Lease判断記録のraw LF inclusive spanを `24` 件固定し、各full-file/span SHA-256を再計算した。L2-033旧digest規則は318ec4aで `b486a0c44e8f21a6f8738dedeac91dcb94da335b73409b6adeaecf8fa639bf1a`、固定snapshot 633bf12で `0008f6e6f06f48140267ccdea4842fcf22962d81812bb22f4f6446c78fd5c623` と確認した。

旧sourceはasset 15件、raw span 18件を台帳とarchive実bytesで検算した。旧P8-04 locatorの168–171を正確な171行へ絞り、本文に追加参照されたarchitecture.mdとSEA sourceを記録した。元のaudit `docs/governance/audits/requirements-stage/l3-l10-security-nfr008-trace-repair-2026-10-05-78eadc096.json`（SHA `187381de8482f3b04f730ab8936741216f4002d9fb0d1fdf0f00b9d53651ae53`）は変更していない。

6 canonical本文のexact SHA-256:

| 文書 | SHA-256 | bytes | 行数 |
|---|---|---:|---:|
| `docs/helix-security/L3-requirements/business-requirements.md` | `fcf2504a4fef152d1829fddb1a9d65397cb16114a6edbd964c619422da75097d` | 747 | 5 |
| `docs/helix-security/L3-requirements/functional-requirements.md` | `e44778ca2650289dda413f7b683453df9dc4a2ddead2e1561bb843b85317bb4a` | 66445 | 324 |
| `docs/helix-security/L3-requirements/nfr-grade.md` | `3fe1d98024d5a54e734ab8276ee3d55af78d743c7f1bf12b46b9d351139fe50b` | 6964 | 45 |
| `docs/helix-security/L10-verification/business-verification.md` | `717e206126b910a8261e5448227bb73b0961ac3dbf3f1f71a41ef487dc0f6ee5` | 526 | 3 |
| `docs/helix-security/L10-verification/functional-verification.md` | `6c530f510340112ca21de3d76599a3f80ac071bbfec3131186a15b6df069affc` | 50347 | 250 |
| `docs/helix-security/L10-verification/nfr-verification.md` | `37d223cb22f8a7923662967ad501200e5f2a7e5f4db436a180d7af3affd0da9c` | 4983 | 19 |

## 検証結果と限界

- `git diff --check`: PASS。
- `scfctl validate`: PASS（147 bindings、fail=0）。
- `scfctl stale`: PASS（stale=0）。
- `scfctl residuals`: PASS（residuals=0）。
- `govcheck`: PASS（7622 atoms / 57 requirements / 58 files）。
- 旧runtime、旧test、旧CI、Bunは実行していない。push、PR、mailbox操作はしていない。
- 旧記録の `verification_json_sha256` `4d12a02b767bdd4cb489988f17b807b8b16377acbe4a4b8754149faaf1907377` は元記録にpathnameがなく対象artifactを特定できないため未検証の歴史的値として保持した。PASSや再計算値を主張しない。

権限効果はなし。PO承認、指摘closure、独立review、Ready、merge admissionは生成していない。
