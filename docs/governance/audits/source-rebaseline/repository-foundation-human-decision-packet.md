# Repository foundation 人間判断packet

prepared_at: 2026-09-16
status: decision_protocol_review_pending
decision_id: HDEC-REPOSITORY-FOUNDATION-0.1
authority_effect_before_decision: none
target: PR #1797 reviewed content HEAD bound by a pre-decision payload

## 何を判断するか

PR #1797を、HELIX新世代を上流から組み直すためのrepository基盤として採用してよいかを判断する。判断対象は次の六点に
限る。

1. 旧世代4,020 fileを元pathとSHA-256付きの非実行archiveへ隔離し、現行pathから旧workflow、runtime、hook、test、
   AI instructionを起動できない構成。
2. 現行文書をConcept、HELIX-HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OS、governanceへ物理分離した構成。
3. GitHubを要求正本にせず、local上流revisionからIssue、PR、commentへ一方向投影し、remoteをread-afterする運用。
4. 旧要求の原文、identity、元status、revision、digestを保持し、要求PRごとに未計上atom 0と管理層の仮登録を要求する
   無損失条件。
5. Conceptから対象別L1、L2／L11、L3／L10、下流pairへ降ろす順序と、未承認・stale・conflict時の停止条件。
6. AIが[新世代作業入口](../../new-generation-start-here.md)から対象、authority状態、読込順、許可作業、停止作業を確認できる
   最小context。

判断対象revisionは、判断直前にGitHub APIからread-afterしたPR #1797のcurrent full HEADを`target_content_head`として固定する。
branch名、PR本文、Issue状態、CI結果だけでは対象revisionを確定しない。判断後にdecision recordを同じPRへ保存することで
HEADが一度だけ変わるため、下記の二段階記録を使い、record追加後のHEADを新しい内容承認対象へ読み替えない。

## 判断前に必要な証拠

| 条件 | 必要な状態 |
|---|---|
| 静的整合 | [Repository foundation readiness](../../repository-foundation-readiness.md)の条件1〜4がcurrent HEADで成立 |
| 外部意味review | 許可されたGitHub Claude通路でcurrent exact HEADをreviewし、未解消Blocker／Majorが0 |
| review配送 | [PR投影packet](../../github-upstream-pr-packet.md)に従う`review_request_delivery_receipt`をGitHubから取得し、request payload、comment ID、remote本文、target full SHAの一致をread-afterする。local file pathだけの投稿を配送済みにしない |
| 人間read-after | current HEAD、PR差分、readiness、最新review finding、本packetを判断直前に再取得 |

一つでも欠ける、対象HEADが変わる、reviewが別HEADを指す場合は判断を停止し、新revisionへ固定し直す。加えて、判断時HEADの
[carry-forward管理状況](../../requirement-carry-forward-status.md)「機械台帳」に記載したSHA-256または管理registerの
`source_atom_set_digest`が、参照先台帳fileの実測SHA-256と一致しない場合も停止する。

## decision recordの二段階記録

### 1. 承認前payloadの固定

人間へ判断を求める前に、次のfieldを持つcanonical JSON payloadを作成する。RFC 8785 JSON Canonicalization Schemeで
serializeしたUTF-8 bytesのSHA-256を`decision_payload_sha256`とする。payload全文とdigestをPR #1797の
`human_decision_request` commentへ投影し、remote本文とdigestをread-afterする。
payloadは`docs/governance/audits/source-rebaseline/repository-foundation-decision-payload.schema.json`へ適合させる。

- `schema_version`: `repository_foundation_decision_payload.v1`
- `decision_id`: `HDEC-REPOSITORY-FOUNDATION-0.1`
- `target_pr`: `1797`
- `target_content_head`: 判断直前のcurrent full HEAD
- `decision_packet_path`と、そのHEADにおけるfile SHA-256
- current HEADを対象にしたcontent review request、delivery receipt、review responseのcomment IDとBlocker／Major／Minor
- 判断対象六項目、判断で成立しない事項、維持する停止条件
- `allowed_post_decision_change_paths`: `docs/governance/audits/source-rebaseline/repository-foundation-decisions.jsonl`だけ
- `required_merge_method`: `merge_commit`

人間には`target_content_head`と`decision_payload_sha256`を示す。「このrepository基盤で進める」は、その提示payloadに対する
`approve_foundation`としてのみ受理する。payload提示後にPR HEAD、packet digest、review resultが変わった場合は回答前後を問わず
停止し、新payloadから判断をやり直す。

### 2. 承認後recordとfinal review

承認後は`docs/governance/audits/source-rebaseline/repository-foundation-decisions.jsonl`へ一件だけappendし、その変更だけを
`target_content_head`の直後の一commitにする。recordは少なくともdecision record ID、decision ID、actor、decision、時点、
人間の判断原文、`target_content_head`、packet path／digest、content review三comment、review結果、decision payload comment／digest、
判断対象／非対象、維持する停止条件、許可されたrecord path、`required_merge_method: merge_commit`、`correction_of`を持つ。
decision recordは承認事実の証拠であり、Concept、要求、設計、実装のauthorityを追加しない。
各行は`docs/governance/audits/source-rebaseline/repository-foundation-decision-record.schema.json`へ適合させる。
各行のJSON objectもRFC 8785でserializeし、一recordにつきLF終端の一行としてappendする。

record追加後のHEADは、次をすべて満たすrecord-only最終reviewに通す。

1. `target_content_head`を直接の親とする一commitだけが追加されている。
2. diff pathは上記decision JSONL一件だけで、承認payloadと人間回答を忠実に記録している。
3. archive、要求source、台帳、Concept、対象別文書、運用規則、readiness、packetに差分がない。
4. GitHub Claudeがrecord追加後のexact HEADを確認し、未解消Blocker／Major／Minorが0である。

この四条件を満たすrecord-only HEADは、承認済み内容を変更せず証拠を同梱したmerge対象であり、同じ人間判断を再要求しない。
一つでも外れる場合は承認を失効させ、変更後HEADの意味reviewと新しいdecision payloadからやり直す。final review結果やReady化を
recordするためにbranchへ追加commitしてはならず、GitHub commentとPR metadataのread-afterで保持する。

## 選択肢

| 判断 | 結果 |
|---|---|
| `approve_foundation` | 対象exact HEADのrepository構成、archive隔離、上流運用、無損失admission、AI入口を新世代の基盤として採用する |
| `changes_requested` | 旧要求とarchiveを保持したまま、指定箇所を修正し、新しいexact HEADでreviewと判断をやり直す |
| `reject_foundation` | 対象revisionを基盤として採用しない。旧要求の保持台帳やarchive bytesを削除・棄却したことにはしない |

平易な返答では、証拠条件が成立し、`target_content_head`とpayload digestが提示された後に「このrepository基盤で進める」、
または修正箇所を指定すればよい。判断記録は上記二段階記録で固定する。

## この判断で成立しないもの

- Concept v4.1、HELIXの5大目標、エージェント七大原則の承認。
- HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OSの対象別L1、L2／L11、責務詳細の承認。
- 旧要求の追加、削除、統合、縮退、意味変更、successor割当、対象productへの配置。
- 旧資産のreuse、replace、retire、物理削除、旧実装の再activation。
- L3以降の設計・実装、要求engine、管理登録runtime、GitHub同期adapter、新世代CIの開始。
- release、deployment、外部公開、配布repositoryの切替。

PR merge、Issue close、既存CodeQL、旧CI green、review依頼の存在は、この人間判断を生成しない。

## merge方式

#1797は途中commit SHAをIssue、projection receipt、監査記録のsource revisionとして保持しているため、squash mergeとrebase mergeを
禁止し、GitHubのmerge commitで取り込む。platformがmerge commitを拒否する場合は停止し、別方式へfallbackしない。merge後は
merge commitが二親を持ち、第2親がrecord-only final HEADであり、`target_content_head`を含むPR全履歴がmainの祖先になったことを
read-afterする。merge commitの生成自体はGitHubの統合作用であり、record-only final HEADの内容を変えないため再承認対象にしない。

Ready化とmerge実行の直前にrepositoryの`allow_merge_commit`、main branch protection、ruleset、PRのmergeable状態をGitHub APIから
再取得する。required platform gateが存在する場合は、その成立を確認するまで停止する。CodeQL等の非required外部projectionは
foundationの意味合格根拠へ算入せず、その失敗を理由にsquash／rebaseや旧CIへfallbackしない。

## 判断後の次工程

`approve_foundation`後も、旧要求はすべてpendingのまま残す。別PRの5大目標と七大原則、Concept revision、対象別L1、
個別要求の順に人間判断を分ける。各`requirement` PRは一要求identityを基本単位とし、原atomを「候補へ保持」「別の生存中
仮登録へ保留」「人間decisionで変更・retire」の三集合へ完全分割して、未計上0を示すまでmerge候補にしない。
