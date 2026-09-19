---
title: "Capability Lease bootstrap（CAPLEASE-BOOT-01）承認のdecision record"
decision_record_id: HDEC-CAPLEASE-BOOT-01
decision: approve+accept_bootstrap_risk
approved_targets:
  - path: docs/governance/audits/source-rebaseline/capability-lease-bootstrap-decision-packet.md
    from_sha256: absent
    sha256: 395c61bfb71f5cedc8b1945cac288f6b2b1334454be7732ca6ba57e0f9815533
scope_paths:
  - docs/governance/audits/source-rebaseline/capability-lease-bootstrap-decision-packet.md
  - docs/governance/decisions/capability-lease-bootstrap-approval-2026-09-20.md
decider_role: PO
decided_at: 2026-09-19T19:03:57.276Z
recorded_at: 2026-09-20
source_repository_revision: 8731f7e226bac4755327c05c0df96b345da18b63
authority_effect: effective_when_this_record_is_admitted_to_main
---

# Capability Lease bootstrap（CAPLEASE-BOOT-01）承認のdecision record

## 人間判断

POは2026-09-20 04:03:57.276（Asia/Tokyo。UTCで`2026-09-19T19:03:57.276Z`）の作業session（Claude Code）で、次の問いに対し次の選択を明示した。
時刻は、session logがこの回答を受信した時刻である。

> 問い: #1883（Capability Lease の判断packet）は、Opus と Sol の両方で指摘が0件になりました。改訂はこの版（HEAD 8731f7e2、
> packet SHA-256 395c61bf…）で止めてあります。この版をどう判断しますか。approve の場合は、AI 側のアカウントをどこまで分けるか
> （独立性の選択）もあわせて選んでください。
>
> 選択肢（「(推奨)」は問いを作ったAI側の推奨である）:
> - approve + accept (推奨): PO と AI 側のアカウントは必ず分けますが、AI 側の中（作成側・reviewer・executor）は1つのアカウントで
>   動かします。用意するアカウントが少なく、自走に早く戻れます。reviewer の判定が偽造されうる残存 risk を受け入れる選択で、
>   期限は 2026-12-31 までです。
> - approve + separate: 作成側・各 reviewer・executor・recovery を、それぞれ別の GitHub アカウントにします。偽造への耐性は
>   上がりますが、アカウントを4つ以上用意し、権限も設定する必要があり、有効化が遅れます。
> - changes_requested: 変える項目と理由を指定してもらい、packet を改訂します。
> - reject: 今の都度許可の運用を続けます。
>
> 選択: approve + accept (推奨)

問いはHEAD（`8731f7e2`）とpacket SHA-256の先頭8桁を示しており、HEADを介してこの選択を下表のexact bytesに対する判断として記録する。会話要約、GitHub状態、
review結果、外部監査の評価から判断を推定したものではない。

本recordの出所はsessionでの回答であり、packetが定めるPR reviewではない。packetの「人間判断」節のとおり、本PR（bootstrap）は
AI側identityの分離前でPOのaccountが作成者と同じためPR reviewでapproveできないので、既存の方法で判断を記録する。
本recordはleaseの上流decisionであり、packetの定めにより、他のPRの`authority_basis`には使わない。

## 判断対象

| Decision ID | decision unit | 対象 | commit | 判断したSHA-256 | 選択 | 独立性の選択 |
|---|---|---|---|---|---|---|
| `HDEC-CAPLEASE-BOOT-01` | `CAPLEASE-BOOT-01` | `docs/governance/audits/source-rebaseline/capability-lease-bootstrap-decision-packet.md` | `8731f7e226bac4755327c05c0df96b345da18b63` | `395c61bfb71f5cedc8b1945cac288f6b2b1334454be7732ca6ba57e0f9815533` | `approve` | `accept_bootstrap_risk` |

actorはPOである。packetが提案値としPOが変更できるとした値（期限`2026-12-31T23:59:59+09:00`、merged表示の待ち時間10分、
`projection_sync`のholder、`merge_executor`のbootstrap profile 3区分、authority面の検出対象・保護面）は、いずれも変更していない。

packet本文の`status: awaiting_human_decision`と`authority_effect: none`は変更しない。書き換えると判断したbytesが変わるためである。
判断の正本は本recordである。

## 承認した意味

packetの「人間判断」節の`approve`に従い、次をpacketの本文どおり、正式なHELIX-OS要求が成立するまでのScaffold上流decisionとして承認する。

- 2つのlease定義（`merge_executor`のadmission profile 3区分を含む、`projection_sync`）。
- 両leaseに共通する条件。
- 後続PRで改める規則の意味1〜8。
- `projection_sync`の残存riskの受容、およびpacketの「既知の残存riskと後続PRで扱う論点」節に列挙された残存。

独立性は`accept_bootstrap_risk`とする。packetが述べる帰結（reviewer判定の偽造と独立性違反を事前にも事後にも止められないこと、
補償統制、外部監査、監査の遅れでの停止等）を受け入れる。帰結の正本はpacket本文である。

## この判断で成立しないもの

packetの「本packetの承認で成立しないもの」を維持する。正本はpacket本文であり、次はその要約である。

- HELIX-OSまたはHARNESSの要求採択、対象別L2／L11への適用。
- lease記録、規則の文言改訂、executor command等の実装、Scaffold Binding（`SCF-B-0004`）の登録、AI側identityの分離、実行環境の
  許可設定。これらは後続の`operation_change` PRとPOの設定で行い、そのPRがmainへ入るまでleaseは存在しない。
- 本recordを含むPR（#1883）と後続`operation_change` PRのmerge。この2つは既存規則のまま、merge通路を明示許可されたレビュー対応側
  （作成側と異なるcontextのruntime）がmergeする。POが行うのはその通路の実行環境の許可設定であり、mergeではない。

次はpacketの記載ではなく、本recordの作成側の注記である（POの判断ではない）。leaseが存在するまで、既存PR（#1881、#1882、#1885等）は
既存規則のmerge admissionに従い、本判断はそれらのmerge許可を与えない。

## revision変更時の扱い

packetのbytesが変わった場合、本判断を新revisionへ自動継承しない。PR mergeによるcommit SHA変更は、上表の対象file SHA-256が
不変である限り対象bytesを変えない。判断後に本recordの判断内容を変更する場合は、新しい判断を要する。
