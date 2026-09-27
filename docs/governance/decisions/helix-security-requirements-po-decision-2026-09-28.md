---
title: "HELIX-SECURITY 要求一式のPO判断"
decision_record_id: HDEC-SECURITY-REQUIREMENTS-2026-09-28
decision_status: recorded
decider_role: PO
decided_at: 2026-09-28
recorded_at: 2026-09-28
source_repository_revision: f6dad2a33e24f000b87d7f09b8d40288257e74cc
authority_effect: effective_when_this_record_is_admitted_to_main
---

# HELIX-SECURITY 要求一式のPO判断

## PO原文

PO判断はPOがClaude（review_merge lane）との会話で2026-09-28に示し、Claudeが原文のまま[本PRの「PO判断の受領と次の作業」コメント](https://github.com/RetryYN/HELIX-HARNESS/pull/2203#issuecomment-5857756675)および他の確認PR・作業指示へ転記した。本記録はその全文を保持する。受信時刻は記録していないため日付のみ示す。判断の根拠は次の明示回答であり、reviewやmergeの結果ではない。

> #2198〜#2205について、各確認資料が固定したL1の対象revisionを確定し、L2と対になるL11の要求一式に合意する。各PRの明示候補集合は、記載されているversion_targetと適用条件を保持して採用する。
> HARNESSの所属は029＝CORE、031＝共通部品、032＝COREとする。
> SECURITYはA案を採用する。全操作のauthority境界を適用するが、有効な既決権限を再利用し、通常作業の毎回の人間承認は追加しない。
> 後続版・Web条件付き要求を1.0へ前倒しせず、旧sourceの未完引継ぎは保持する。判断記録を各PRへ反映し、必要な追随・独立レビュー・統合後確認を行った後、最後の横断整理へ進める。ただし、旧HELIXからデグレ検証は必要。

## 対象revisionと処置

[確認資料（判断前の固定版）](https://github.com/RetryYN/HELIX-HARNESS/blob/124a17200dd0ec370650820910cadb63bd757b9e/docs/governance/audits/requirements-stage/helix-security-po-confirmation-2026-09-27.md)が固定した本文を対象とする。L1対象revisionを確定し、L2と対になるL11の要求一式に合意する。明示候補28件は全件採用。下表のSHA-256は実ファイルbytesであり、本文を将来変更した場合へ無条件継承しない。

| 固定source | SHA-256 | Git blob |
|---|---|---|
| [docs/helix-security/L1-planning/security-intent.md](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/helix-security/L1-planning/security-intent.md) | `b779ae38e077474ee10ee07e1bb50eac1da64a86ee3bf2bc06504c1dd53be61d` | `06174b826c5dfa398450cb38b44c8b4dd3236246` |
| [docs/helix-security/L2-requirements/security-requirements.md](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/helix-security/L2-requirements/security-requirements.md) | `027e6d25c8665e8aca006f23660c4ecfcc0ec0a92946be871e935ec5aa7a774c` | `e1ccfdf6b0c5ff358b9e4a79a7f088038f3d8be3` |
| [docs/helix-security/L11-acceptance/security-acceptance.md](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/helix-security/L11-acceptance/security-acceptance.md) | `25635649f87c0e805a5d1cf35b5c1201144c851533808770cd4f9ac6ba067c01` | `d373ec1bf994650c74b5d7af66652c9bf8abdbf5` |

## 明示候補の採用範囲

以下の各行の処置は **採用**。version_target・適用条件を原文どおり保持する。register履歴の末尾が対応する最新登録であり、receiptの略号と実ファイル・SHAの対応は上記固定確認資料のReceipt節に記録されている。

| L2 identity | kind | version_target（L2本文） | register revision履歴 | 最新receipt | 最新管理状態 |
|---|---|---|---|---|---|
| `HELIXSECURITY-L2-001` | `unit` | 1.0 | `MPR-RC-HELIXSECURITY-L2-001-001` | `SECURITY-functional` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-002` | `unit` | 1.0 | `MPR-RC-HELIXSECURITY-L2-002-001` | `SECURITY-functional` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-003` | `unit` | 1.0 | `MPR-RC-HELIXSECURITY-L2-003-001 → MPR-RC-HELIXSECURITY-L2-003-002` | `SECURITY-stage` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-004` | `unit` | 1.0 | `MPR-RC-HELIXSECURITY-L2-004-001` | `SECURITY-functional` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-005` | `unit` | 1.0 | `MPR-RC-HELIXSECURITY-L2-005-001` | `SECURITY-functional` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-006` | `unit` | 1.0 | `MPR-RC-HELIXSECURITY-L2-006-001` | `SECURITY-functional` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-007` | `connection` | 1.0 | `MPR-RC-HELIXSECURITY-L2-007-001 → MPR-RC-HELIXSECURITY-L2-007-002` | `SECURITY-stage` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-008` | `unit` | 1.0 | `MPR-RC-HELIXSECURITY-L2-008-001` | `SECURITY-functional` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-009` | `composite` | 1.0 | `MPR-RC-HELIXSECURITY-L2-009-001 → MPR-RC-HELIXSECURITY-L2-009-002` | `SECURITY-stage` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-010` | `unit` | 1.0 | `MPR-RC-HELIXSECURITY-L2-010-001` | `SECURITY-functional` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-011` | `unit` | 1.0 | `MPR-RC-HELIXSECURITY-L2-011-001` | `SECURITY-functional` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-012` | `unit` | 1.0 | `MPR-RC-HELIXSECURITY-L2-012-001` | `SECURITY-functional` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-013` | `unit` | 1.0 | `MPR-RC-HELIXSECURITY-L2-013-001` | `SECURITY-functional` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-014` | `unit` | 1.0 | `MPR-RC-HELIXSECURITY-L2-014-001 → MPR-RC-HELIXSECURITY-L2-014-002` | `SECURITY-functional-r2` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-015` | `unit` | 1.0の土台、実利用保護は1.x | `MPR-RC-HELIXSECURITY-L2-015-001` | `SECURITY-functional` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-016` | `unit` | 1.0の区分基盤、公開時適用は1.x | `MPR-RC-HELIXSECURITY-L2-016-001` | `SECURITY-functional` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-017` | `unit` | 1.x | `MPR-RC-HELIXSECURITY-L2-017-001` | `SECURITY-functional` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-018` | `unit` | 1.x | `MPR-RC-HELIXSECURITY-L2-018-001` | `SECURITY-functional` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-019` | `unit` | 1.x | `MPR-RC-HELIXSECURITY-L2-019-001` | `SECURITY-functional` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-020` | `unit` | Guard 1.0、Botは必要時 | `MPR-RC-HELIXSECURITY-L2-020-001 → MPR-RC-HELIXSECURITY-L2-020-002` | `SECURITY-stage` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-021` | `connection` | 1.0の境界、対象別能力に従う | `MPR-RC-HELIXSECURITY-L2-021-001 → MPR-RC-HELIXSECURITY-L2-021-002` | `SECURITY-functional-r2` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-022` | `composite` | 1.0 | `MPR-RC-HELIXSECURITY-L2-022-001` | `SECURITY-functional` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-023` | `composite` | 1.0 | `MPR-RC-HELIXSECURITY-L2-023-001` | `SECURITY-functional` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-024` | `connection` | 1.0 | `MPR-RC-HELIXSECURITY-L2-024-001` | `SECURITY-functional` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-025` | `composite` | 1.x、1.0から基盤準備 | `MPR-RC-HELIXSECURITY-L2-025-001` | `SECURITY-functional` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-026` | `connection` | 1.x能力は1.x、Guard/Bot境界は1.0 | `MPR-RC-HELIXSECURITY-L2-026-001` | `SECURITY-functional` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-027` | `composite` | 1.0 | `MPR-RC-HELIXSECURITY-L2-027-001 → MPR-RC-HELIXSECURITY-L2-027-002` | `SECURITY-functional-r2` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-028` | `unit` | 1.0 | `MPR-RC-HELIXSECURITY-L2-028-001 → MPR-RC-HELIXSECURITY-L2-028-002` | `SECURITY-functional-r2` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |

## 個別の判断と本文への適用

SECURITYのA案を採用する。L1-008/009の全操作へのauthority境界を確定し、L2/L11-008・009・022およびWorker接続007に適用する。有効な既決権限を再利用し、通常作業の毎回の人間承認を追加しない。対象operation/revision/scope・期限等の照合、変更・失効時の再照合、停止伝播は保持する。旧special engagement固有のadmissionは通常作業へ移植しない。015/016の1.0基盤、020のGuardと必要時Bot、026の1.0 Guard/Bot境界と1.x意味接続能力を区別し、017〜019・025を1.0へ前倒ししない。

承認対象の本文bytesは変更しない。本文の「候補」「未採択」「人の判断が残る点」は判断前の記述として保存し、本記録が指定したrevisionと候補集合の採否・所属／scope判断には本記録を適用する。本文内容は選択された案と一致しているため、条件の追加・削除やL11の改変を行わない。registerの管理状態 `registered_proposal` と `authority_effect: none` は登録の性質を表すため書き換えず、採択は本記録と上表のidentity・最新登録IDの対応から読む。候補本文・source atomが不変のため、訂正register、receipt、研究pinの付け直しは不要である。

## 保持する境界と残る作業

- 後続版・Web条件付き要求は表のversion_targetと適用条件のまま採用し、1.0へ前倒ししない。要求への合意を実装済み・受入実行済みと扱わない。
- 旧sourceの保持点・意味再導出・変更理由は固定確認資料の旧source対応と機構内監査へ結び付ける。既存の未完source holding・未割当atomを保持し、候補の採用から旧sourceのretireや全被覆完了を生成しない。
- POが求めた旧HELIXからのデグレ検証を最終横断整理の必須作業にする。旧機能・要求・受入・運用保証と採用本文を照合し、失われた機能、弱まった受入、反例・失敗時義務の欠落を調べる。本記録はその検証完了を主張しない。
- 想定対応順序のA/B、L3要件承認、下流実装開始、v0.1収載、release/tag/配布は今回の判断対象外。既存の対象revision・authority境界に従う。
- このPRの判断記録追加後のexact HEADをClaudeが独立reviewし、指摘解消・Ready化・merge・read-after後、最終横断整理へ進む。
