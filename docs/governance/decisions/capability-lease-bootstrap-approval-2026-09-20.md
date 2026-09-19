---
title: "Capability Lease bootstrap（CAPLEASE-BOOT-01）承認のdecision record"
decision_record_id: HDEC-CAPLEASE-BOOT-01
decision_status: approved
decided_at: 2026-09-19T16:44:32Z
recorded_at: 2026-09-20
source_repository_revision: fa143dde311e290dcd53526143a1189457ec6012
authority_effect: effective_when_this_record_is_admitted_to_main
---

# Capability Lease bootstrap（CAPLEASE-BOOT-01）承認のdecision record

## 人間判断

POは2026-09-20 01:44:32（Asia/Tokyo。UTCで`2026-09-19T16:44:32Z`）の作業session（Claude Code）で、次の問いに対し次の選択を明示した。
時刻は、session logがこの回答を受信した時刻である。

> 問い: #1883の判断として「approve + accept_bootstrap_risk（現行値のまま）」をPO決定としてdecision recordに記録してよいですか？
> （記録後にHEAD確定→Opus/Sol再review→PO手merge）
>
> 選択: approve + accept（approve、independence=accept_bootstrap_risk、値変更なしでrecordを追加する）

この選択を、下記packetのexact bytesに対する判断として記録する。会話要約、GitHub状態、PR merge、review結果、
外部監査の評価から判断を推定したものではない。

POの回答はPR番号を指しており、revisionやdigestを指定していない。本recordはこれを、回答の時点でPR #1883のheadにあった
packetのbytes（下表）へ束縛する。理由は「対象revisionについて」に示す。POが別のrevisionを指していた場合、本recordは誤りであり、
新しい判断として訂正する。

## 判断対象

| Decision ID | decision unit | 対象 | commit | 判断したSHA-256 | 選択 | 独立性の選択 |
|---|---|---|---|---|---|---|
| `HDEC-CAPLEASE-BOOT-01` | `CAPLEASE-BOOT-01` | `docs/governance/audits/source-rebaseline/capability-lease-bootstrap-decision-packet.md` | `fa143dde311e290dcd53526143a1189457ec6012` | `1a9c87e35e0815b301282f33be1fb0736ad3631377883649e2f0b15bb6a2011b` | `approve` | `accept_bootstrap_risk` |

actorはPOである。packetが提案値としPOが変更できるとした値（期限`2026-12-31T23:59:59+09:00`、merged表示の待ち時間10分、
`projection_sync`のholder、`merge_executor`の対象区分と許可集合・除外集合）は、いずれも変更していない。

### 対象revisionについて

独立reviewが未解消0件（Opus 0/0/0、Sol 0/0/0）に達したのは`a272237e370f86aa5077f87ade07f588c1a47465`（packet SHA-256
`688e5918…`）である。その後`fa143dde`で、leaseを担うScaffoldのIDだけを`SCF-B-0003`から`SCF-B-0004`へ改めた
（`SCF-B-0003`はPR #1885の仮組みが使うため）。`fa143dde`のcommit（2026-09-20 01:43:26 Asia/Tokyo）とpushはPOの回答の前であり、
回答の時点のPR headは`fa143dde`だった。そのため本recordは`fa143dde`のbytesへ束縛する。両revisionの差分はこのID 4箇所だけである。

packet本文の`status: awaiting_human_decision`と`authority_effect: none`は変更しない。書き換えると判断したbytesが変わるためである。
判断の正本は本recordである。

## 承認した意味

packetの「人間判断」節の`approve`に従い、次をpacketの本文どおり、正式なHELIX-OS要求が成立するまでのScaffold上流decisionとして承認する。

- 2つのlease定義（`merge_executor`、`projection_sync`）。
- 両leaseに共通する条件（期限、取消しと即時停止、置換先、二重境界、意味判断に使わないこと）。
- 後続PRで改める規則の意味1〜6。
- `projection_sync`の残存risk（Issue更新APIに条件付き書込みがないことによる上書きを、予防でなく検出で扱うこと）の受容。

独立性は`accept_bootstrap_risk`とする。packetが述べる帰結を受け入れる。帰結の正本はpacket本文であり、次はその要約である。

- 作成側、reviewer、executorが同じGitHub accountと実行環境から動くため、偽造と独立性違反を事前にも事後にも止められないこと。
- 補償統制として、review commentの全文、digest、IDをmerge commit messageへ残すこと。
- POが依頼する外部監査がlease mergeを読み直し、lease監査記録をrepoへ入れること（lease監査記録はlease対象外で、POがmergeする）。
  監査が担えるのはauthority面の変更の見逃しと記録間の不整合の発見であり、偽造や独立性違反はほぼ検出できないこと。
  最後の監査記録より後のlease mergeが10件に
  達したら、executorは次のmergeをしないこと。
- 見逃し・不整合・偽造・独立性違反が判明したらleaseを`suspended`とし、人間判断まで再開しないこと。
- reviewerが自ら投稿できない場合に限り、作成側がreviewer出力を全文そのまま転記した応答commentを認めること（転記である旨を明記）。

## この判断で成立しないもの

packetの「本packetの承認で成立しないもの」を維持する。正本はpacket本文であり、次はその要約である。

- HELIX-OSまたはHARNESSの要求採択、対象別L2／L11への適用。
- lease記録、上記規則の文言改訂、executor commandの実装、Scaffold Binding（`SCF-B-0004`）の登録、実行環境の許可設定。これらは後続の
  `operation_change` PRとPOの設定で行い、そのPRがmainへ入るまでleaseは存在しない。
- 本recordを含むPR（#1883）と後続`operation_change` PRのmerge。leaseでlease自身を有効化できないため、この2つは既存規則のまま、
  POがGitHubで直接mergeする。

次はpacketの記載ではなく、本recordの作成側の注記である（POの判断ではない）。leaseが存在するまで、既存PR（#1881、#1882、#1885等）は
既存規則のmerge admissionに従い、本判断はそれらのmerge許可を与えない。

## revision変更時の扱い

packetのbytesが変わった場合、本判断を新revisionへ自動継承しない。誤記訂正を含め、semantic diff、影響範囲、
本recordとの関係を示した新しい判断を要求する。本record自体の追記やPR mergeによるcommit SHA変更は、上表の対象file SHA-256が
不変である限り対象bytesを変えない。
