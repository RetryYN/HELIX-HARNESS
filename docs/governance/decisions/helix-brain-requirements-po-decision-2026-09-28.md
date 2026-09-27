---
title: "HELIX-BRAIN 要求L1/L2 PO判断 decision record（2026-09-28）"
decision_record_id: HDEC-BRAIN-REQUIREMENTS-PO-2026-09-28
decision_status: recorded
decider_role: PO
decided_at: 2026-09-28
recorded_at: 2026-09-28
source: "https://github.com/RetryYN/HELIX-HARNESS/pull/2200#issuecomment-5857756254"
source_description: "PO判断はPOがClaude（review_merge lane）との会話で2026-09-28に示し、Claudeが原文のままPR comment「PO判断の受領と次の作業」と作業指示へ転記した。本記録は全文を保持する。"
source_body_sha256: a2867863695d34a1db48b3eda86e387c853d46440a94b05427946b5b3a0df8c6
authority_effect: effective_when_this_record_is_admitted_to_main
---

# HELIX-BRAIN 要求L1/L2 PO判断（2026-09-28）

## 記録の範囲とPO原文

対象は全8確認PRへの一括判断のうちHELIX-BRAIN確認PRである。出典は[PR comment「PO判断の受領と次の作業」](https://github.com/RetryYN/HELIX-HARNESS/pull/2200#issuecomment-5857756254)。POがClaude（review_merge lane）との会話で示し、Claudeが原文のままcomment・作業指示へ転記した。以下は原文全文である。

> #2198〜#2205について、各確認資料が固定したL1の対象revisionを確定し、L2と対になるL11の要求一式に合意する。各PRの明示候補集合は、記載されているversion_targetと適用条件を保持して採用する。
> HARNESSの所属は029＝CORE、031＝共通部品、032＝COREとする。
> SECURITYはA案を採用する。全操作のauthority境界を適用するが、有効な既決権限を再利用し、通常作業の毎回の人間承認は追加しない。
> 後続版・Web条件付き要求を1.0へ前倒しせず、旧sourceの未完引継ぎは保持する。判断記録を各PRへ反映し、必要な追随・独立レビュー・統合後確認を行った後、最後の横断整理へ進める。ただし、旧HELIXからデグレ検証は必要。

## 判断前に固定された確認packet

候補集合・最新registration ID・kind・version_target・receiptを提示した判断前packetは、PR作成側content HEAD 7dd3029db8a08be459966f6a051cece8bdc54ce2 の[固定permalink](https://github.com/RetryYN/HELIX-HARNESS/blob/7dd3029db8a08be459966f6a051cece8bdc54ce2/docs/governance/audits/requirements-stage/helix-brain-po-confirmation-2026-09-27.md)にある。packet blob SHA-256は 434f43c937989bc5e70cce8b6874e84d9ea3f53c88a0c6354f808e2f1060ab34。このリンクは判断対象本文の固定commit f6dad2a33e24f000b87d7f09b8d40288257e74cc と区別し、候補表のregistration ID・版・条件の照合元を示す。

## 確定した対象revision

POは確認packetが固定したL1対象revisionを確定し、提示されたL2と対のL11一式を採用した。対象本文はいずれもcommit `f6dad2a33e24f000b87d7f09b8d40288257e74cc`の固定blobである。

| 対象 | 固定commit | path | SHA-256 |
|---|---|---|---|
| 親Concept | `f6dad2a33e24f000b87d7f09b8d40288257e74cc` | `docs/concept/helix-concept.md` | `06e210c312fc6a5f18c1fc29248e55ebe9c2eee0c177006e32d7b421af8baa78` |
| HELIX-BRAIN L1 | `f6dad2a33e24f000b87d7f09b8d40288257e74cc` | `docs/helix-brain/L1-planning/brain-intent.md` | `2674b2e1a770a038b2d53a93ca635a0cbbfca42af463a562f22e1c51d5ebb5f0` |
| HELIX-BRAIN L2 | `f6dad2a33e24f000b87d7f09b8d40288257e74cc` | `docs/helix-brain/L2-requirements/brain-requirements.md` | `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03` |
| HELIX-BRAIN L11 | `f6dad2a33e24f000b87d7f09b8d40288257e74cc` | `docs/helix-brain/L11-acceptance/brain-acceptance.md` | `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b` |

これらは確認packetの対象本文固定値である。confirmation PRのmetadata更新後HEAD・本記録追加後HEADと取り違えず、承認対象本文bytesを差し替えない。

## 明示候補全件の採用

POは、確認packetに明示された全42件をL2本文と同identityのL11受入条件を一式として採用した。下表は採用identityと最新registration ID、候補表に載るkind／version_target／適用条件の対応であり、明示集合すべてを列挙する。採用状態は本記録と各最新registration IDの対応から読む。register行そのものは変更しない。

| candidate identity | 最新 registration ID | kind / version_target・適用条件（候補表どおり） |
|---|---|---|
| `HELIXBRAIN-L2-001` | `MPR-RC-HELIXBRAIN-L2-001-002` | unit / 1.0 |
| `HELIXBRAIN-L2-002` | `MPR-RC-HELIXBRAIN-L2-002-002` | unit / 1.0 |
| `HELIXBRAIN-L2-003` | `MPR-RC-HELIXBRAIN-L2-003-002` | unit / 1.0 |
| `HELIXBRAIN-L2-004` | `MPR-RC-HELIXBRAIN-L2-004-002` | unit / 1.0 |
| `HELIXBRAIN-L2-005` | `MPR-RC-HELIXBRAIN-L2-005-002` | unit / 1.0 |
| `HELIXBRAIN-L2-006` | `MPR-RC-HELIXBRAIN-L2-006-002` | unit / 1.0 |
| `HELIXBRAIN-L2-007` | `MPR-RC-HELIXBRAIN-L2-007-002` | unit / 1.0 |
| `HELIXBRAIN-L2-008` | `MPR-RC-HELIXBRAIN-L2-008-002` | unit / 1.0 |
| `HELIXBRAIN-L2-009` | `MPR-RC-HELIXBRAIN-L2-009-002` | unit / 1.0 |
| `HELIXBRAIN-L2-010` | `MPR-RC-HELIXBRAIN-L2-010-002` | unit / 1.0 |
| `HELIXBRAIN-L2-011` | `MPR-RC-HELIXBRAIN-L2-011-002` | unit / 1.0 |
| `HELIXBRAIN-L2-012` | `MPR-RC-HELIXBRAIN-L2-012-002` | unit / 1.0 |
| `HELIXBRAIN-L2-INFRA-001` | `MPR-RC-HELIXBRAIN-L2-INFRA-001-002` | unit / 1.0 |
| `HELIXBRAIN-L2-INFRA-002` | `MPR-RC-HELIXBRAIN-L2-INFRA-002-002` | unit / 1.0 |
| `HELIXBRAIN-L2-INFRA-003` | `MPR-RC-HELIXBRAIN-L2-INFRA-003-002` | unit / 1.0 |
| `HELIXBRAIN-L2-INFRA-004` | `MPR-RC-HELIXBRAIN-L2-INFRA-004-002` | unit / 1.0 |
| `HELIXBRAIN-L2-INFRA-005` | `MPR-RC-HELIXBRAIN-L2-INFRA-005-002` | unit / 1.0 |
| `HELIXBRAIN-L2-INFRA-006` | `MPR-RC-HELIXBRAIN-L2-INFRA-006-003` | unit / 1.0 |
| `HELIXBRAIN-L2-INFRA-007` | `MPR-RC-HELIXBRAIN-L2-INFRA-007-003` | unit / 1.0 |
| `HELIXBRAIN-L2-INFRA-008` | `MPR-RC-HELIXBRAIN-L2-INFRA-008-003` | unit / 1.0 |
| `HELIXBRAIN-L2-INFRA-009` | `MPR-RC-HELIXBRAIN-L2-INFRA-009-003` | unit / 1.0 |
| `HELIXBRAIN-L2-INFRA-010` | `MPR-RC-HELIXBRAIN-L2-INFRA-010-002` | unit / 1.0 |
| `HELIXBRAIN-L2-INFRA-011` | `MPR-RC-HELIXBRAIN-L2-INFRA-011-002` | unit / 1.0 |
| `HELIXBRAIN-L2-INFRA-012` | `MPR-RC-HELIXBRAIN-L2-INFRA-012-002` | unit / 1.0 |
| `HELIXBRAIN-L2-INFRA-013` | `MPR-RC-HELIXBRAIN-L2-INFRA-013-003` | unit / 1.0 |
| `HELIXBRAIN-L2-INFRA-014` | `MPR-RC-HELIXBRAIN-L2-INFRA-014-003` | unit / 1.0 |
| `HELIXBRAIN-L2-INFRA-015` | `MPR-RC-HELIXBRAIN-L2-INFRA-015-002` | unit / 1.0 |
| `HELIXBRAIN-L2-INFRA-016` | `MPR-RC-HELIXBRAIN-L2-INFRA-016-003` | unit / 1.0 |
| `HELIXBRAIN-L2-INFRA-017` | `MPR-RC-HELIXBRAIN-L2-INFRA-017-002` | unit / 1.0 |
| `HELIXBRAIN-L2-018` | `MPR-RC-HELIXBRAIN-L2-018-002` | connection / 1.0 |
| `HELIXBRAIN-L2-019` | `MPR-RC-HELIXBRAIN-L2-019-002` | connection / 1.0 |
| `HELIXBRAIN-L2-020` | `MPR-RC-HELIXBRAIN-L2-020-002` | connection / 1.0 |
| `HELIXBRAIN-L2-021` | `MPR-RC-HELIXBRAIN-L2-021-002` | connection / 1.0 |
| `HELIXBRAIN-L2-022` | `MPR-RC-HELIXBRAIN-L2-022-002` | connection / 1.0 |
| `HELIXBRAIN-L2-023` | `MPR-RC-HELIXBRAIN-L2-023-002` | connection / 1.0 |
| `HELIXBRAIN-L2-024` | `MPR-RC-HELIXBRAIN-L2-024-002` | composite / 1.0 |
| `HELIXBRAIN-L2-025` | `MPR-RC-HELIXBRAIN-L2-025-002` | composite / 1.0 |
| `HELIXBRAIN-L2-026` | `MPR-RC-HELIXBRAIN-L2-026-002` | connection / 2.0 |
| `HELIXBRAIN-L2-027` | `MPR-RC-HELIXBRAIN-L2-027-002` | composite / 2.0 |
| `HELIXBRAIN-L2-028` | `MPR-RC-HELIXBRAIN-L2-028-002` | unit / 1.0 |
| `HELIXBRAIN-L2-029` | `MPR-RC-HELIXBRAIN-L2-029-001` | unit / 1.0 |
| `HELIXBRAIN-L2-030` | `MPR-RC-HELIXBRAIN-L2-030-002` | connection / 1.0 |

件数照合は42件。全件の同full identityがL11にも存在する。採用集合一覧:
`HELIXBRAIN-L2-001`, `HELIXBRAIN-L2-002`, `HELIXBRAIN-L2-003`, `HELIXBRAIN-L2-004`
`HELIXBRAIN-L2-005`, `HELIXBRAIN-L2-006`, `HELIXBRAIN-L2-007`, `HELIXBRAIN-L2-008`
`HELIXBRAIN-L2-009`, `HELIXBRAIN-L2-010`, `HELIXBRAIN-L2-011`, `HELIXBRAIN-L2-012`
`HELIXBRAIN-L2-INFRA-001`, `HELIXBRAIN-L2-INFRA-002`, `HELIXBRAIN-L2-INFRA-003`, `HELIXBRAIN-L2-INFRA-004`
`HELIXBRAIN-L2-INFRA-005`, `HELIXBRAIN-L2-INFRA-006`, `HELIXBRAIN-L2-INFRA-007`, `HELIXBRAIN-L2-INFRA-008`
`HELIXBRAIN-L2-INFRA-009`, `HELIXBRAIN-L2-INFRA-010`, `HELIXBRAIN-L2-INFRA-011`, `HELIXBRAIN-L2-INFRA-012`
`HELIXBRAIN-L2-INFRA-013`, `HELIXBRAIN-L2-INFRA-014`, `HELIXBRAIN-L2-INFRA-015`, `HELIXBRAIN-L2-INFRA-016`
`HELIXBRAIN-L2-INFRA-017`, `HELIXBRAIN-L2-018`, `HELIXBRAIN-L2-019`, `HELIXBRAIN-L2-020`
`HELIXBRAIN-L2-021`, `HELIXBRAIN-L2-022`, `HELIXBRAIN-L2-023`, `HELIXBRAIN-L2-024`
`HELIXBRAIN-L2-025`, `HELIXBRAIN-L2-026`, `HELIXBRAIN-L2-027`, `HELIXBRAIN-L2-028`
`HELIXBRAIN-L2-029`, `HELIXBRAIN-L2-030`

## 版・条件・責務境界

全候補は固定候補本文・候補表どおりのkind、version_target、scope、依存区分、適用条件、L11 oracleで採用する。後続版を1.0へ前倒しせず、条件付き経路は記載条件が満たされる場合だけ適用する。草案metadataはPOのL1確定・候補採用を覆さないが、採用からruntime成立・実装済み・受入合格を推定しない。
BRAIN-L2-026/027のversion_target 2.0を維持し、1.0へ前倒ししない。

HARNESS所属029＝CORE、031＝共通部品、032＝COREの決定はHARNESS確認PRにだけ適用する。SECURITY A案はSECURITY確認PRにだけ適用し、この機構へ権限移管や通常作業の毎回の人間承認を追加しない。

## 旧sourceの未完引継ぎ

旧HELIX sourceの意味・機能・受入・運用上の保証は、confirmation packetで示す対応と未完状態を保持する。全source atomの再配置・被覆・廃止・後続版移管が完了したとは推定せず、未完引継ぎは未完のまま残す。旧HELIXからのデグレ検証は必須で、後続の総合整理で旧assetごとに現行IDへの保持／意味の再導出／置換／後続版の版印／記録付き廃止を対応付け、未対応旧機能0件および弱まった受入・消えたnegative oracle・failure記録の有無を確かめる。本記録はデグレ検証完了を主張しない。旧workflow・CLI・hook・runtime・test・CIは実行しない。

## 今回未決の事項と影響

- L1対象revisionは確定し、全42候補を採用した。個別候補の不採用・保留・差戻しはない。
- L3要件内容・承認、実装、実受入、tag/release/配布の許可は今回決定していない。
- #2197実装順序A/BはPOが今回判断しておらず、推奨で埋めない。要件段階開始時の判断に残す。
- デグレ検証は必須の後続作業で未実施である。
- 本記録はPO判断を記録するもので、mainへのadmissionまではauthority_effectに記載の効力発生日を迎えない。

## 照合記録

原文出典は上記PR comment。block quote markerなし・段落間LFで連結した4段落のSHA-256は `a2867863695d34a1db48b3eda86e387c853d46440a94b05427946b5b3a0df8c6`。L1/L2/L11 blob SHAは固定commitから再計算してpacket値と一致。候補数・identity・最新registration IDもpacketの候補表と照合済み。既存register、coverage receipt、research pin、L1/L2/L11本文は変更していない。
