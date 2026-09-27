---
title: "HELIX-CONNECT要求一式に対するPO判断（2026-09-28）"
decision_record_id: HDEC-HELIXCONNECT-REQUIREMENTS-PO-2026-09-28
decision_status: recorded
decider_role: PO
decided_at: 2026-09-28
recorded_at: 2026-09-28
source: https://github.com/RetryYN/HELIX-HARNESS/pull/2205#issuecomment-5857757034
authority_effect: effective_when_this_record_is_admitted_to_main
---

# HELIX-CONNECT要求一式に対するPO判断（2026-09-28）

## 記録範囲とPO原文の出典

PO判断はPOがClaude（review_merge lane）との会話で2026-09-28に示し、Claudeが原文のままPR comment（本PR等の「PO判断の受領と次の作業」）と作業指示へ転記した。本記録は全文を保持する。出典commentはfrontmatterのsourceと、以下の対象PR commentリンクで特定する。

## PO原文（全文）

> #2198〜#2205について、各確認資料が固定したL1の対象revisionを確定し、L2と対になるL11の要求一式に合意する。各PRの明示候補集合は、記載されているversion_targetと適用条件を保持して採用する。
> HARNESSの所属は029＝CORE、031＝共通部品、032＝COREとする。
> SECURITYはA案を採用する。全操作のauthority境界を適用するが、有効な既決権限を再利用し、通常作業の毎回の人間承認は追加しない。
> 後続版・Web条件付き要求を1.0へ前倒しせず、旧sourceの未完引継ぎは保持する。判断記録を各PRへ反映し、必要な追随・独立レビュー・統合後確認を行った後、最後の横断整理へ進める。ただし、旧HELIXからデグレ検証は必要。

## 対象revision

POは固定main f6dad2a33e24f000b87d7f09b8d40288257e74cc上の以下のbytesを確認対象revisionとして確定し、L2本文HELIXCONNECT-L2-001〜007とそれぞれに対になる固定L11受入本文一式に合意した。

| 層 | 固定対象path | SHA-256 |
|---|---|---|
| L1 | [docs/helix-connect/L1-planning/connect-intent.md](../../helix-connect/L1-planning/connect-intent.md) | 9c212572afda81405c6d5ab70151f5b35356722204616e85e132162b45907c70 |
| L2 | [docs/helix-connect/L2-requirements/connect-requirements.md](../../helix-connect/L2-requirements/connect-requirements.md) | 31e3f234172bb5a92b26d41db2de21534cd4301274fc7e2800b4f8a935ce598b |
| L11 | [docs/helix-connect/L11-acceptance/connect-acceptance.md](../../helix-connect/L11-acceptance/connect-acceptance.md) | bc0cf2f39f9c368074c546b39f53a6bd350998bb0bbdb056285b305f22cc9dad |

明示候補集合は確認資料の候補表にある最新registration IDとの対応で識別する。

確認資料とPO判断出典:

- 確認packet（固定HEAD `28fe3c5de696440aaf1f74be543d37ecea009566`）: [候補表・最新registration ID対応](https://github.com/RetryYN/HELIX-HARNESS/blob/28fe3c5de696440aaf1f74be543d37ecea009566/docs/governance/audits/requirements-stage/helix-connect-po-confirmation-2026-09-27.md)
- PO判断受領comment: [https://github.com/RetryYN/HELIX-HARNESS/pull/2205#issuecomment-5857757034](https://github.com/RetryYN/HELIX-HARNESS/pull/2205#issuecomment-5857757034)

固定対象本文のSHAは変更していない。L1/L2/L11のdraft/candidate metadataは固定時点の本文として維持し、POのrevision確認・要求合意・候補採用は本decision recordを正本として読む。

## 採用する明示候補集合

POは以下の全7件を、確認資料に記載された各version_targetと適用条件を保持して採用した。

HELIXCONNECT-L2-001, HELIXCONNECT-L2-002, HELIXCONNECT-L2-003, HELIXCONNECT-L2-004, HELIXCONNECT-L2-005, HELIXCONNECT-L2-006, HELIXCONNECT-L2-007

全候補のversion_target 1.0と各適用条件を確認packetどおり維持し、後続版/Web条件付きの内容を前倒ししない。

適用条件の意味は固定L2/L11本文を正本とする。本記録は候補の一律実行、実装、releaseを意味しない。

## 共通の適用条件と未完引継ぎ

- 旧sourceの未完引継ぎ、既存holding、および旧要求に関する未解決atomは維持する。今回の採用から旧sourceの被覆完了、retire、holding解除、または既存coverage範囲の拡張を導かない。
- 旧HELIXからのデグレ検証は必須である。最終横断整理の前に、旧機能・要求・受入・運用保証を確定したL1/L2/L11と対応づけ、未対応の消失と弱まった受入、negative oracle、failure記録を特定する。旧workflow/runtime/test/CIは実行しない。本記録は検証完了を示さない。
- 総合検証#2197の実装順序A/Bは未判断である。要件（L3）開始時の判断として残し、推奨を採択済みにしない。
- 本L1確定とL2/L11合意は、L3要件承認、実装、実行、配布、release、不可逆な外部作用の許可を含まない。
- PO原文中のHARNESS所属指定はHARNESS確認PR、SECURITY A案はSECURITY確認PRで記録する。本CONNECT判断記録は別機構の要求を変更しない。

## register・receipt・pin

候補採用はこの外部decisionと確認資料の候補表にある最新registration IDとの対応から読む。registerのregistered_proposal等の状態およびauthority_effect: noneは変更しない。本記録でregister行の追記・書換えは行っていない。本文bytesに変更がないため、coverage receipt、pin、bindingも変更しない。
