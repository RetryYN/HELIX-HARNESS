---
title: "HELIX-OS要求一式に対するPO判断（2026-09-28）"
decision_record_id: HDEC-HELIXOS-REQUIREMENTS-PO-2026-09-28
decision_status: recorded
decider_role: PO
decided_at: 2026-09-28
recorded_at: 2026-09-28
source: https://github.com/RetryYN/HELIX-HARNESS/pull/2199#issuecomment-5857756135
authority_effect: effective_when_this_record_is_admitted_to_main
---

# HELIX-OS要求一式に対するPO判断（2026-09-28）

## 記録範囲とPO原文の出典

PO判断はPOがClaude（review_merge lane）との会話で2026-09-28に示し、Claudeが原文のままPR comment（本PR等の「PO判断の受領と次の作業」）と作業指示へ転記した。本記録は全文を保持する。出典commentはfrontmatterのsourceと、以下の対象PR commentリンクで特定する。

## PO原文（全文）

> #2198〜#2205について、各確認資料が固定したL1の対象revisionを確定し、L2と対になるL11の要求一式に合意する。各PRの明示候補集合は、記載されているversion_targetと適用条件を保持して採用する。
> HARNESSの所属は029＝CORE、031＝共通部品、032＝COREとする。
> SECURITYはA案を採用する。全操作のauthority境界を適用するが、有効な既決権限を再利用し、通常作業の毎回の人間承認は追加しない。
> 後続版・Web条件付き要求を1.0へ前倒しせず、旧sourceの未完引継ぎは保持する。判断記録を各PRへ反映し、必要な追随・独立レビュー・統合後確認を行った後、最後の横断整理へ進める。ただし、旧HELIXからデグレ検証は必要。

## 対象revision

POは固定main f6dad2a33e24f000b87d7f09b8d40288257e74cc上の以下のbytesを確認対象revisionとして確定し、L2本文 HELIXOS-L2-001〜HELIXOS-L2-029 と、それぞれに対になる固定L11受入本文一式に合意した。

| 層 | 固定対象path | SHA-256 |
|---|---|---|
| L1 | [docs/helix-os/L1-planning/system-intent.md](../../helix-os/L1-planning/system-intent.md) | 2bb62571308aa1fde0351ca7242e961ddd25b9c4722196c7bb255cf3ad1cfe0e |
| L2 | [docs/helix-os/L2-requirements/governance-requirements.md](../../helix-os/L2-requirements/governance-requirements.md) | c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf |
| L11 | [docs/helix-os/L11-acceptance/governance-acceptance.md](../../helix-os/L11-acceptance/governance-acceptance.md) | 925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680 |

明示候補集合は確認資料の候補表にある最新registration IDとの対応で識別する。

確認資料とPO判断出典:

- 確認packet（固定HEAD `635f6c9296592473d0f6fb667d436a1f5f80afb7`）: [候補表・最新registration ID対応](https://github.com/RetryYN/HELIX-HARNESS/blob/635f6c9296592473d0f6fb667d436a1f5f80afb7/docs/governance/audits/requirements-stage/helix-os-po-confirmation-2026-09-27.md)
- PO判断受領comment: [https://github.com/RetryYN/HELIX-HARNESS/pull/2199#issuecomment-5857756135](https://github.com/RetryYN/HELIX-HARNESS/pull/2199#issuecomment-5857756135)

固定対象本文のSHAは変更していない。L1/L2/L11のdraft/candidate metadataは固定時点の本文として維持し、POのrevision確認・要求合意・候補採用は本decision recordを正本として読む。

## 採用する明示候補集合

POは以下の全16件を、確認資料に記載された各version_targetと適用条件を保持して採用した。

HELIXOS-L2-014, HELIXOS-L2-015, HELIXOS-L2-016, HELIXOS-L2-017, HELIXOS-L2-018, HELIXOS-L2-019, HELIXOS-L2-020, HELIXOS-L2-021, HELIXOS-L2-022, HELIXOS-L2-023, HELIXOS-L2-024, HELIXOS-L2-025, HELIXOS-L2-026, HELIXOS-L2-027, HELIXOS-L2-028, HELIXOS-L2-029

L2-014のv0.x→v1.0段階候補、L2-017のcore 1.0・動的外部workflow 4.0、L2-026の1.0構築過程から、その他の各version_targetと適用条件を確認packetの候補表どおり維持する。017の4.0機能を1.0必須にせず、026は1.0構築過程のcandidateとして扱う。

後続版または条件付きの能力を1.0へ前倒ししない。固定L2/L11本文に定めた操作条件・例外・適用条件を要約で置き換えない。

## 共通の適用条件と未完引継ぎ

- 旧sourceの未完引継ぎ、既存holding、および旧要求に関する未解決atomは維持する。今回の採用から旧sourceの被覆完了、retire、holding解除、またはcoverage範囲拡張を導かない。
- 旧HELIXからのデグレ検証は必須である。最終横断整理の前に、旧機能・要求・受入・運用保証を確定したL1/L2/L11と対応づけ、未対応の消失と弱まった受入、negative oracle、failure記録を検出する。旧runtime/test/CIを実行せず、本判断記録は検証完了を意味しない。
- 実装順序について総合検証#2197のA/Bは未判断である。要件（L3）開始時の判断として残し、推奨を採択済みにしない。
- 本L1確定とL2/L11合意は、L3要件承認、実装、実行、配布、release、不可逆な外部作用の許可を与えない。
- PO原文中のHARNESS所属指定はHARNESS確認PR、SECURITY A案はSECURITY確認PRへ適用する。本OS判断記録は別機構の要求を変更しない。

## register・receipt・pin

既存registerのregistered_proposal等の状態およびauthority_effect: noneは変更しない。POの採用は本外部decisionと候補表の最新registration IDとの対応で読む。register行は追記・書換えをしていない。本文bytesに変更がないため、coverage receipt・pin・bindingも変更しない。
