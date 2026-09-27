---
title: "HELIX-LABO 要求L1/L2 PO判断 decision record（2026-09-28）"
decision_record_id: HDEC-LABO-REQUIREMENTS-PO-2026-09-28
decision_status: recorded
decider_role: PO
decided_at: 2026-09-28
recorded_at: 2026-09-28
source: "https://github.com/RetryYN/HELIX-HARNESS/pull/2201#issuecomment-5857756386"
source_description: "PO判断はPOがClaude（review_merge lane）との会話で2026-09-28に示し、Claudeが原文のままPR comment「PO判断の受領と次の作業」と作業指示へ転記した。本記録は全文を保持する。"
source_body_sha256: a2867863695d34a1db48b3eda86e387c853d46440a94b05427946b5b3a0df8c6
authority_effect: effective_when_this_record_is_admitted_to_main
---

# HELIX-LABO 要求L1/L2 PO判断（2026-09-28）

## 記録の範囲とPO原文

対象は全8確認PRへの一括判断のうちHELIX-LABO確認PRである。出典は[PR comment「PO判断の受領と次の作業」](https://github.com/RetryYN/HELIX-HARNESS/pull/2201#issuecomment-5857756386)。POがClaude（review_merge lane）との会話で示し、Claudeが原文のままcomment・作業指示へ転記した。以下は原文全文である。

> #2198〜#2205について、各確認資料が固定したL1の対象revisionを確定し、L2と対になるL11の要求一式に合意する。各PRの明示候補集合は、記載されているversion_targetと適用条件を保持して採用する。
> HARNESSの所属は029＝CORE、031＝共通部品、032＝COREとする。
> SECURITYはA案を採用する。全操作のauthority境界を適用するが、有効な既決権限を再利用し、通常作業の毎回の人間承認は追加しない。
> 後続版・Web条件付き要求を1.0へ前倒しせず、旧sourceの未完引継ぎは保持する。判断記録を各PRへ反映し、必要な追随・独立レビュー・統合後確認を行った後、最後の横断整理へ進める。ただし、旧HELIXからデグレ検証は必要。

## 判断前に固定された確認packet

候補集合・最新registration ID・kind・version_target・receiptを提示した判断前packetは、PR作成側content HEAD 0cf9d910fc89d345663e45b9cb76a27f385b896e の[固定permalink](https://github.com/RetryYN/HELIX-HARNESS/blob/0cf9d910fc89d345663e45b9cb76a27f385b896e/docs/governance/audits/requirements-stage/helix-labo-po-confirmation-2026-09-27.md)にある。packet blob SHA-256は d70d8d6a8ce88f42b164e3b211aaed077bf85fcf909dbb115d36c9238142a1ea。このリンクは判断対象本文の固定commit f6dad2a33e24f000b87d7f09b8d40288257e74cc と区別し、候補表のregistration ID・版・条件の照合元を示す。

## 確定した対象revision

POは確認packetが固定したL1対象revisionを確定し、提示されたL2と対のL11一式を採用した。対象本文はいずれもcommit `f6dad2a33e24f000b87d7f09b8d40288257e74cc`の固定blobである。

| 対象 | 固定commit | path | SHA-256 |
|---|---|---|---|
| 親Concept | `f6dad2a33e24f000b87d7f09b8d40288257e74cc` | `docs/concept/helix-concept.md` | `06e210c312fc6a5f18c1fc29248e55ebe9c2eee0c177006e32d7b421af8baa78` |
| HELIX-LABO L1 | `f6dad2a33e24f000b87d7f09b8d40288257e74cc` | `docs/helix-labo/L1-planning/labo-intent.md` | `78b686adcefe6a6867134a17238b59acef19e6c52dc735989f47aa637ed309cc` |
| HELIX-LABO L2 | `f6dad2a33e24f000b87d7f09b8d40288257e74cc` | `docs/helix-labo/L2-requirements/labo-requirements.md` | `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed` |
| HELIX-LABO L11 | `f6dad2a33e24f000b87d7f09b8d40288257e74cc` | `docs/helix-labo/L11-acceptance/labo-acceptance.md` | `bcd77438bf1afa4d33c31d35fa5138ea6f978f3d241d159bde35f0b0ccf83200` |

これらは確認packetの対象本文固定値である。confirmation PRのmetadata更新後HEAD・本記録追加後HEADと取り違えず、承認対象本文bytesを差し替えない。

## 明示候補全件の採用

POは、確認packetに明示された全53件をL2本文と同identityのL11受入条件を一式として採用した。下表は採用identityと最新registration ID、候補表に載るkind／version_target／適用条件の対応であり、明示集合すべてを列挙する。採用状態は本記録と各最新registration IDの対応から読む。register行そのものは変更しない。

| candidate identity | 最新 registration ID | kind / version_target・適用条件（候補表どおり） |
|---|---|---|
| `HELIXLABO-L2-001` | `MPR-RC-HELIXLABO-L2-001-001` | unit / 1.0 |
| `HELIXLABO-L2-002` | `MPR-RC-HELIXLABO-L2-002-001` | unit / 1.0 |
| `HELIXLABO-L2-003` | `MPR-RC-HELIXLABO-L2-003-001` | unit / 1.0 |
| `HELIXLABO-L2-004` | `MPR-RC-HELIXLABO-L2-004-001` | unit / 1.0 |
| `HELIXLABO-L2-005` | `MPR-RC-HELIXLABO-L2-005-001` | unit / 1.0 |
| `HELIXLABO-L2-006` | `MPR-RC-HELIXLABO-L2-006-001` | unit / 1.0 |
| `HELIXLABO-L2-007` | `MPR-RC-HELIXLABO-L2-007-001` | unit / 1.0 |
| `HELIXLABO-L2-008` | `MPR-RC-HELIXLABO-L2-008-001` | unit / 1.0 |
| `HELIXLABO-L2-009` | `MPR-RC-HELIXLABO-L2-009-001` | unit / 1.0 |
| `HELIXLABO-L2-010` | `MPR-RC-HELIXLABO-L2-010-001` | unit / 1.0 |
| `HELIXLABO-L2-055` | `MPR-RC-HELIXLABO-L2-055-002` | unit / 1.0 |
| `HELIXLABO-L2-011` | `MPR-RC-HELIXLABO-L2-011-001` | connection / 1.0 |
| `HELIXLABO-L2-012` | `MPR-RC-HELIXLABO-L2-012-001` | connection / 1.0 |
| `HELIXLABO-L2-013` | `MPR-RC-HELIXLABO-L2-013-001` | connection / 1.0 |
| `HELIXLABO-L2-014` | `MPR-RC-HELIXLABO-L2-014-001` | connection / 1.0 |
| `HELIXLABO-L2-015` | `MPR-RC-HELIXLABO-L2-015-001` | connection / 1.0 |
| `HELIXLABO-L2-016` | `MPR-RC-HELIXLABO-L2-016-001` | connection / 1.0 |
| `HELIXLABO-L2-017` | `MPR-RC-HELIXLABO-L2-017-001` | connection / 1.0 |
| `HELIXLABO-L2-018` | `MPR-RC-HELIXLABO-L2-018-001` | connection / 1.0 |
| `HELIXLABO-L2-019` | `MPR-RC-HELIXLABO-L2-019-001` | connection / 1.0 |
| `HELIXLABO-L2-020` | `MPR-RC-HELIXLABO-L2-020-001` | connection / 1.0 |
| `HELIXLABO-L2-021` | `MPR-RC-HELIXLABO-L2-021-001` | connection / 1.0 |
| `HELIXLABO-L2-022` | `MPR-RC-HELIXLABO-L2-022-001` | connection / 1.0 |
| `HELIXLABO-L2-023` | `MPR-RC-HELIXLABO-L2-023-001` | connection / 1.0 |
| `HELIXLABO-L2-024` | `MPR-RC-HELIXLABO-L2-024-001` | connection / 1.0 |
| `HELIXLABO-L2-025` | `MPR-RC-HELIXLABO-L2-025-001` | connection / 1.0 |
| `HELIXLABO-L2-026` | `MPR-RC-HELIXLABO-L2-026-001` | connection / 1.0 |
| `HELIXLABO-L2-027` | `MPR-RC-HELIXLABO-L2-027-001` | connection / 1.0 |
| `HELIXLABO-L2-028` | `MPR-RC-HELIXLABO-L2-028-001` | connection / 1.0 |
| `HELIXLABO-L2-029` | `MPR-RC-HELIXLABO-L2-029-001` | connection / 1.0 |
| `HELIXLABO-L2-030` | `MPR-RC-HELIXLABO-L2-030-001` | connection / 1.0 |
| `HELIXLABO-L2-031` | `MPR-RC-HELIXLABO-L2-031-001` | connection / 上流決定に従う; Web/WEB-OS source contract採択時のみ・1.0必須依存ではない |
| `HELIXLABO-L2-032` | `MPR-RC-HELIXLABO-L2-032-001` | connection / 上流決定に従う; Web/WEB-OS source contract採択時のみ・1.0必須依存ではない |
| `HELIXLABO-L2-033` | `MPR-RC-HELIXLABO-L2-033-001` | connection / 2.0 |
| `HELIXLABO-L2-034` | `MPR-RC-HELIXLABO-L2-034-001` | connection / 1.0 |
| `HELIXLABO-L2-035` | `MPR-RC-HELIXLABO-L2-035-001` | connection / 1.0 |
| `HELIXLABO-L2-036` | `MPR-RC-HELIXLABO-L2-036-001` | connection / 1.0 |
| `HELIXLABO-L2-037` | `MPR-RC-HELIXLABO-L2-037-001` | connection / 1.0 |
| `HELIXLABO-L2-038` | `MPR-RC-HELIXLABO-L2-038-001` | connection / 1.0 |
| `HELIXLABO-L2-039` | `MPR-RC-HELIXLABO-L2-039-001` | connection / 1.0 |
| `HELIXLABO-L2-040` | `MPR-RC-HELIXLABO-L2-040-001` | connection / 上流決定に従う; Feedback接続の対象scopeに限定 |
| `HELIXLABO-L2-041` | `MPR-RC-HELIXLABO-L2-041-001` | connection / 上流決定に従う; Feedback接続の対象scopeに限定 |
| `HELIXLABO-L2-042` | `MPR-RC-HELIXLABO-L2-042-001` | connection / version_targetは上流決定に従う; WEB-OS authority/source contractと個別connector採択時のみのFeedback接続 |
| `HELIXLABO-L2-054` | `MPR-RC-HELIXLABO-L2-054-001` | connection / 1.0 |
| `HELIXLABO-L2-050` | `MPR-RC-HELIXLABO-L2-050-001` | composite / 1.0 |
| `HELIXLABO-L2-051` | `MPR-RC-HELIXLABO-L2-051-001` | composite / 2.0 |
| `HELIXLABO-L2-052` | `MPR-RC-HELIXLABO-L2-052-001` | composite / 1.0 |
| `HELIXLABO-L2-053` | `MPR-RC-HELIXLABO-L2-053-001` | composite / 3.0+ |
| `HELIXLABO-L2-056` | `MPR-RC-HELIXLABO-L2-056-003` | unit / 1.0 |
| `HELIXLABO-L2-057` | `MPR-RC-HELIXLABO-L2-057-002` | connection / 1.0 |
| `HELIXLABO-L2-058` | `MPR-RC-HELIXLABO-L2-058-001` | unit / 1.0 |
| `HELIXLABO-L2-059` | `MPR-RC-HELIXLABO-L2-059-002` | unit / 1.0 |
| `HELIXLABO-L2-060` | `MPR-RC-HELIXLABO-L2-060-002` | unit / 1.0 |

件数照合は53件。全件の同full identityがL11にも存在する。採用集合一覧:
`HELIXLABO-L2-001`, `HELIXLABO-L2-002`, `HELIXLABO-L2-003`, `HELIXLABO-L2-004`
`HELIXLABO-L2-005`, `HELIXLABO-L2-006`, `HELIXLABO-L2-007`, `HELIXLABO-L2-008`
`HELIXLABO-L2-009`, `HELIXLABO-L2-010`, `HELIXLABO-L2-055`, `HELIXLABO-L2-011`
`HELIXLABO-L2-012`, `HELIXLABO-L2-013`, `HELIXLABO-L2-014`, `HELIXLABO-L2-015`
`HELIXLABO-L2-016`, `HELIXLABO-L2-017`, `HELIXLABO-L2-018`, `HELIXLABO-L2-019`
`HELIXLABO-L2-020`, `HELIXLABO-L2-021`, `HELIXLABO-L2-022`, `HELIXLABO-L2-023`
`HELIXLABO-L2-024`, `HELIXLABO-L2-025`, `HELIXLABO-L2-026`, `HELIXLABO-L2-027`
`HELIXLABO-L2-028`, `HELIXLABO-L2-029`, `HELIXLABO-L2-030`, `HELIXLABO-L2-031`
`HELIXLABO-L2-032`, `HELIXLABO-L2-033`, `HELIXLABO-L2-034`, `HELIXLABO-L2-035`
`HELIXLABO-L2-036`, `HELIXLABO-L2-037`, `HELIXLABO-L2-038`, `HELIXLABO-L2-039`
`HELIXLABO-L2-040`, `HELIXLABO-L2-041`, `HELIXLABO-L2-042`, `HELIXLABO-L2-054`
`HELIXLABO-L2-050`, `HELIXLABO-L2-051`, `HELIXLABO-L2-052`, `HELIXLABO-L2-053`
`HELIXLABO-L2-056`, `HELIXLABO-L2-057`, `HELIXLABO-L2-058`, `HELIXLABO-L2-059`
`HELIXLABO-L2-060`

## 版・条件・責務境界

全候補は固定候補本文・候補表どおりのkind、version_target、scope、依存区分、適用条件、L11 oracleで採用する。後続版を1.0へ前倒しせず、条件付き経路は記載条件が満たされる場合だけ適用する。草案metadataはPOのL1確定・候補採用を覆さないが、採用からruntime成立・実装済み・受入合格を推定しない。
LABO-L2-031/032はWeb/WEB-OS source contractと個別connectorが選択・採択された場合だけ有効なsource接続、042はWEB-OS authority/source contractと個別connector採択時だけのFeedback接続で、版は上流決定に従う。031/032/042を1.0必須依存へ含めない。040/041はFeedback対象scopeに限定する。033/051は2.0、053は3.0+。他の版・適用条件も候補表のまま保持する。

HARNESS所属029＝CORE、031＝共通部品、032＝COREの決定はHARNESS確認PRにだけ適用する。SECURITY A案はSECURITY確認PRにだけ適用し、この機構へ権限移管や通常作業の毎回の人間承認を追加しない。

## 旧sourceの未完引継ぎ

旧HELIX sourceの意味・機能・受入・運用上の保証は、confirmation packetで示す対応と未完状態を保持する。全source atomの再配置・被覆・廃止・後続版移管が完了したとは推定せず、未完引継ぎは未完のまま残す。旧HELIXからのデグレ検証は必須で、後続の総合整理で旧assetごとに現行IDへの保持／意味の再導出／置換／後続版の版印／記録付き廃止を対応付け、未対応旧機能0件および弱まった受入・消えたnegative oracle・failure記録の有無を確かめる。本記録はデグレ検証完了を主張しない。旧workflow・CLI・hook・runtime・test・CIは実行しない。

## 今回未決の事項と影響

- L1対象revisionは確定し、全53候補を採用した。個別候補の不採用・保留・差戻しはない。
- L3要件内容・承認、実装、実受入、tag/release/配布の許可は今回決定していない。
- #2197実装順序A/BはPOが今回判断しておらず、推奨で埋めない。要件段階開始時の判断に残す。
- デグレ検証は必須の後続作業で未実施である。
- 本記録はPO判断を記録するもので、mainへのadmissionまではauthority_effectに記載の効力発生日を迎えない。

## 照合記録

原文出典は上記PR comment。block quote markerなし・段落間LFで連結した4段落のSHA-256は `a2867863695d34a1db48b3eda86e387c853d46440a94b05427946b5b3a0df8c6`。L1/L2/L11 blob SHAは固定commitから再計算してpacket値と一致。候補数・identity・最新registration IDもpacketの候補表と照合済み。既存register、coverage receipt、research pin、L1/L2/L11本文は変更していない。
