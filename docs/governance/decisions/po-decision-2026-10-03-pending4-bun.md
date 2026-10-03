---
title: "要求整理末尾4件とBun恒久不使用のPO判断（2026-10-03）"
decision_record_id: HDEC-REQUIREMENTS-PENDING4-BUN-2026-10-03
decision_status: recorded
decider_role: PO
decided_at: 2026-10-03
recorded_at: 2026-10-03
decision_basis_revision: 7294112e39d8309d4ec43201953bbd706a92b325
authority_effect: effective_when_this_record_is_admitted_to_main_for_only_explicitly_fixed_revisions
---

# 要求整理末尾4件とBun恒久不使用のPO判断

## 判断の出所

[受領source](../audits/requirements-stage/po-decision-received-handoff-pending4-bun-2026-10-03.md)（file SHA-256 `cd25c99d95e5a0ffded19596c23be0a80f1e225b26ebd96507d52b76796da0b0`）にゴールファイル末尾の伝達内容を原文のまま保存した。PO発言原文は「これでBunは絶対に使わない」、選択は「Bun恒久不使用で承認」。選択肢本文は「H-067〈002〉・OS-125〈002〉・OS-131〈002〉は推奨の範囲で承認。OS-132は『HELIXの開発・実行・検証・配布でBunを今後も使わない』を加えた〈003〉にしてから承認する」。受領した判断を記録し、mailbox・review・mergeから採否を生成しない。

## 採択するexact revision

各L2/L11はidentity見出しから次の同階層以上の見出し直前まで、末尾空行を除去しUTF-8終端LF一つで正規化したSHA-256。MPR semantic digestとL11 pinを別々に照合する。最初の3件はbasis mainの002、OS132は同PRで訂正した003を採択する。[静的照合証拠](../audits/requirements-stage/po-decision-pending4-bun-verification-2026-10-03.json)が登録行・節pin・receipt・履歴保存を固定する。003の本文一致をClaude独立reviewで確認し、本記録のmain統合後にのみ有効とする。

| Identity | 登録revision | L2 SHA-256 | L11 SHA-256 | 採択範囲 |
|---|---|---|---|---|
| `HARNESS-L2-067` | `MPR-RC-HARNESS-L2-067-002` | `sha256:4ee1e8ec5374d7ea1d5cc3ea5f48abb353f371766421ffd61c6ab94e028a9373` | `sha256:f21e31ec15355abb15da22d68396cc05584be92457b49cdc3a4a76523a2fa2c8` | 責務分担A。選択した原資料の振る舞いの分解・意味・検証基準はHARNESS、識別・権限・保管・来歴はOS。原資料管理をHARNESSへ移さない。 |
| `HELIXOS-L2-131` | `MPR-RC-HELIXOS-L2-131-002` | `sha256:87981dfee01e17fd8cb999c8570a692a2968eb8b81ae3aad12da0dc5365a39cc` | `sha256:50bc6f97c31430637d3b3028e9144362c6992f0c11d7f754dcbbcc64bb3fa1b1` | pack・agent使用を明示した操作だけ。提案物だけで権限を得ず、選択根拠・対象への結合と作成主体とは別の確認を保つ。新しい人間承認や無関係な通常作業の停止を増やさない。 |
| `HELIXOS-L2-125` | `MPR-RC-HELIXOS-L2-125-002` | `sha256:c40e36c364626401c7b3a646e0fad5d2625a2c6dd710a6af3797647916fe0993` | `sha256:92114867a9ce5b4df19d51ca59c335bccd135a29837730f2736cd8acaf6fae0f` | 選択Worker操作の結果受領。一時backpressure単独では失敗にせず、既存上限・期限内に待機・再開して欠損のない結果を受け取る。不正・不完全・期限超過等を成功扱いしない。 |
| `HELIXOS-L2-132` | `MPR-RC-HELIXOS-L2-132-003` | `sha256:d6105ea7bfe423b58061fc934dc0fe754c540d439fe98089caae8737376bca75` | `sha256:e8092f9ba881887ff7df6c0eb41c340c7892ff92d87f349d96edf8f3ee2056fb` | HELIXの開発・実行・検証・配布surfaceでBunを今後も使わず再導入しない。一回移行時はactive全surfaceのBunなし再現が揃った場合だけ完了。Node.js・個別toolは指定しない。 |

## 旧原文との意味差

HARNESS067はHIL-FR-37、OS125はHIL-NFR-14、OS131はHIL-NFR-34/HR-FR-HIL-21、OS132はHIL-BR-19を起点とする。各登録のsource ledgerとcoverage receiptの原文・条件対応を保持する。旧001の不採択を002へ継承せず、旧版を遡及採択しない。

OS132の002はHELIX再構築の一回移行に限定していたが、POは今後のBun使用も禁止した。003は移行時にactiveな開発・実行・検証・配布の全surfaceがBunなしで再現できる保証を保持し、移行後もHELIXの同surfaceでBunを使わず再導入しない保証を加える。配置はOSのまま、任意の利用者repository全体へ広げない。Node.jsや個別toolの採用は指定しない。002とr1/r2 receiptは履歴として保存する。意味変更は今回の明示PO判断を根拠とする。

旧自律境界（`archive/legacy-generation-2026-09-14/root/CLAUDE.md:82–85`）の人が要求意味を持ちAIが起草する分担を保持する。要求とシステム仕様の区別は旧工程文書`docs/process/forward/L00-L06-design-phase.md`101行/AP-6 262行に従う。技術方式・契約・fixtureは既存receiptの下流材料に残す。

## 対象外と残す義務

既決の保留5件と現revision不採択5件は従来判断を維持する。MPR既存行と003行は`registered_proposal`／`authority_effect: none`のまま、採否authorityは本記録の対象pinだけに限る。source holding、正式successor、旧source全条件・consumer閉包、旧要求回収完了はこの判断から生成しない。

後続版・版未指定の条件を初版へ前倒ししない。L3要件承認、実装・実行・release・tag・配布の許可を含まない。要求段階の終了確認は8機構の合意・全latest候補の振分け・IR行き先を別途照合する。本判断だけでは終了宣言しない。
