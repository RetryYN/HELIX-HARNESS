# Repository foundation 人間判断packet

prepared_at: 2026-09-16
status: decision_protocol_review_pending
decision_id: HDEC-REPOSITORY-FOUNDATION-0.1
authority_effect_before_decision: none
target: PR #1797 reviewed base/content HEAD pair bound by a pre-decision payload

この`status`は承認前に作成したpacketのsnapshotである。後述するschema適合decision record、record-only final review 0件、
GitHub read-afterがすべて成立した場合は、その外部証拠が本行を上書きし、本packetを更新するための追加commitを要求しない。

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

判断対象revisionは、判断直前にGitHub APIからread-afterしたPR #1797のbase `main` full SHAを`target_base_head`、
current full HEADを`target_content_head`としてpairで固定する。branch名、PR本文、Issue状態、CI結果だけでは対象revisionを
確定しない。判断後にdecision recordを同じPRへ保存することでHEADが一度だけ変わるため、下記の二段階記録を使い、
record追加後のHEADを新しい内容承認対象へ読み替えない。

## 判断前に必要な証拠

| 条件 | 必要な状態 |
|---|---|
| 静的整合 | [Repository foundation readiness](../../repository-foundation-readiness.md)の条件1〜4がcurrent HEADで成立 |
| 外部意味review | 許可されたGitHub Claude通路でexact base HEADとcurrent exact content HEADのpairをreviewし、未解消Blocker／Major／Minorが0 |
| review配送 | [PR投影packet](../../github-upstream-pr-packet.md)に従う`review_request_delivery_receipt`をGitHubから取得し、request payload、comment ID、remote本文、target full SHAの一致をread-afterする。local file pathだけの投稿を配送済みにしない |
| 人間read-after | current HEAD、PR差分、readiness、最新review finding、本packetを判断直前に再取得 |

一つでも欠ける、baseまたはcontent HEADが変わる、reviewが別pairを指す場合は判断を停止し、新revisionへ固定し直す。加えて、判断時HEADの
[carry-forward管理状況](../../requirement-carry-forward-status.md)「機械台帳」に記載したSHA-256または管理registerの
`source_atom_set_digest`が、参照先台帳fileの実測SHA-256と一致しない場合も停止する。

## decision recordの二段階記録

### 1. 承認前payloadの固定

人間へ判断を求める前に、次のfieldを持つcanonical JSON payloadを作成する。RFC 8785 JSON Canonicalization Schemeで
serializeしたUTF-8 bytesのSHA-256を`decision_payload_sha256`とする。payload全文とdigestをPR #1797の
`human_decision_request` commentへ投影し、remote本文とdigestをread-afterする。
payloadは`docs/governance/audits/source-rebaseline/repository-foundation-decision-payload.schema.json`へ適合させる。
このcommentはpayloadの配送と同一性確認だけを担うGitHub projectionであり、承認やauthorityを生成しない。人間の回答だけを
decision source eventとして扱い、承認時はその参照をlocal decision recordへ保存する。

- `schema_version`: `repository_foundation_decision_payload.v1`
- `decision_id`: `HDEC-REPOSITORY-FOUNDATION-0.1`
- `target_pr`: `1797`
- `target_base_ref`: `main`
- `target_base_head`: 判断直前のbase full SHA
- `target_content_head`: 判断直前のcurrent full HEAD
- `decision_packet_path`と、そのHEADにおけるfile SHA-256
- current HEADを対象にしたcontent review request、delivery receipt、review responseのcomment IDとBlocker／Major／Minor
- 判断対象六項目、判断で成立しない事項、維持する停止条件
- `allowed_post_decision_change_paths`: `docs/governance/audits/source-rebaseline/repository-foundation-decisions.jsonl`だけ
- `required_merge_method`: `merge_commit`

人間には`target_base_head`、`target_content_head`、`decision_payload_sha256`を示す。「このrepository基盤で進める」は、
その提示payloadに対する`approve_foundation`としてのみ受理する。payload提示後にbase HEAD、PR HEAD、packet digest、
review resultが変わった場合は回答前後を問わず停止し、新しいbase／content pairのreviewとpayloadから判断をやり直す。

### 2. 承認後recordとfinal review

承認後は`docs/governance/audits/source-rebaseline/repository-foundation-decisions.jsonl`へ一件だけappendし、その変更だけを
`target_content_head`の直後の一commitにする。recordは少なくともdecision record ID、decision ID、actor、decision、RFC 3339時点、
人間の判断原文、`target_base_ref`／`target_base_head`／`target_content_head`、packet path／digest、content review三comment、review結果、decision payload comment／digest、
判断対象／非対象、維持する停止条件、許可されたrecord path、`required_merge_method: merge_commit`、`correction_of`を持つ。
`decision_source_ref`は人間回答を再取得できる会話またはGitHub commentの参照、`decision_payload_remote_body_sha256`は
read-afterした`human_decision_request` comment本文のSHA-256とする。`authority_effect: repository_foundation_approved`は
repository基盤の採用事実だけを表し、Concept、要求、設計、実装のauthorityを追加しない。
各行は`docs/governance/audits/source-rebaseline/repository-foundation-decision-record.schema.json`へ適合させる。
各行のJSON objectもRFC 8785でserializeし、一recordにつきLF終端の一行としてappendする。

record追加後のHEADは、次をすべて満たすrecord-only最終reviewに通す。

1. `target_content_head`を直接の親とする一commitだけが追加されている。
2. PR baseは`target_base_head`のままで、diff pathは上記decision JSONL一件だけで、承認payloadと人間回答を忠実に記録している。
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

平易な返答では、証拠条件が成立し、`target_base_head`、`target_content_head`、payload digestが提示された後に「このrepository基盤で進める」、
または修正箇所を指定すればよい。`approve_foundation`だけを上記二段階記録で固定する。`changes_requested`と
`reject_foundation`は`human_decision_request`に対する人間回答のsource eventで保持し、branchへdecision recordをcommitしない。
その場合はPRを停止状態のまま維持し、修正または退役の後続判断へ進む。

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
禁止し、merge APIまたは`gh pr merge --merge`で方式を明示してGitHubのmerge commitとして取り込む。platformがmerge commitを
拒否する場合は停止し、別方式へfallbackしない。API応答のmerge commit full SHAを直ちにread-afterし、merge後は
merge commitが二親を持ち、第1親が`target_base_head`、第2親がrecord-only final HEADであり、`target_content_head`を含むPR全履歴がmainの祖先になったことを
read-afterする。merge commitの生成自体はGitHubの統合作用であり、record-only final HEADの内容を変えないため再承認対象にしない。
二親、親順序、祖先性のいずれかが不成立なら統合完了を宣言せず停止する。revert、force-push、履歴改変で隠さず、失敗事実、
期待した親、実測したmerge SHAと親をlocal監査文書の新規corrective PRへ記録し、そこから専用GitHub Issueへ投影して人間判断を求める。

Ready化とmerge実行の直前にrepositoryの`allow_merge_commit`、main HEAD、branch protection、ruleset、PRのmergeable状態をGitHub APIから
再取得する。main HEADが`target_base_head`と違う、またはrequired platform gateが存在する場合は、その再reviewまたは成立確認まで停止する。CodeQL等の非required外部projectionは
foundationの意味合格根拠へ算入せず、その失敗を理由にsquash／rebaseや旧CIへfallbackしない。

## 判断後の次工程

`approve_foundation`後も、旧要求はすべてpendingのまま残す。別PRの5大目標と七大原則、Concept revision、対象別L1、
個別要求の順に人間判断を分ける。各`requirement` PRは一要求identityを基本単位とし、原atomを「候補へ保持」「別の生存中
仮登録へ保留」「人間decisionで変更・retire」の三集合へ完全分割して、未計上0を示すまでmerge候補にしない。
