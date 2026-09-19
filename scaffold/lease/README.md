# scaffold/lease／ — Capability Lease（CAPLEASE-BOOT-01）の仮組み

status: scaffold（仮組み。正式な設計・実装・検証ではない）
authority_effect: none
upstream: [bootstrap判断packet](../../docs/governance/audits/source-rebaseline/capability-lease-bootstrap-decision-packet.md)、
[判断record HDEC-CAPLEASE-BOOT-01](../../docs/governance/decisions/capability-lease-bootstrap-approval-2026-09-20.md)
binding: [`SCF-B-0004`](../bindings/SCF-B-0004.json)（置換先: HELIX-OSの委任authority要求のL3／L10から導出する正式な実装。差し替え台帳 Issue #1866）

## これは何か

人間が意味を判断した後の機械的なmergeと、merge済みIssue本文の同期を、packetとPO判断に束縛したlease検査の内側でだけ行う
command群である。判断（承認・採否・処分）は生成しない。PRに含まれる意味の変化は、人間decision recordへの束縛を照合するだけである。
判定の意味の正本はpacketであり、このdirectoryはその写しの実装である。両者が食い違えばpacketが正であり、ここを直す。

**lease記録（`lease.json`）の`activated_at`が`null`の間、executorはどのPRも運ばない（`lease_not_activated`）。**
有効化は下記「有効化」のとおり、本PR（後続`operation_change` PR）のlease記録を実測の後に埋めて行う。

## 構成

| file | 役割 |
|---|---|
| `lease.json` | lease記録（機械可読）。identity表、基準値、起点、状態Issue、試験PR・試験review、mapping、検査toolの入力一覧 |
| `leasecore.py` | 判定の中核。GitHubにもgitにも触れない純粋な関数。型付きの拒否理由を返す |
| `leasegh.py` | GitHubとgitからsnapshotを集め、許可リストを通した書込みだけを行う。検査(a)(b)を隔離環境（user・network・mount名前空間。HOME、`/tmp`、状態領域、実行中のworking treeを空のtmpfsで覆う）で実行する |
| `leasectl.py` | executor command（`admit`＝merge_executor、`sync`＝projection_sync、`status`、`selftest`） |
| `leasepost.py` | 投稿command（review依頼＋delivery receipt、応答）。対象PRへのcomment作成だけ |
| `leaserecover.py` | 非常用command（非常経路と再bootstrap mode）。`decision_record` 1件だけ |
| `leaseprobe.py` | 削除不能の実測command。固定した試験reviewへの削除の試行と、状態Issueへの結果commentだけ |
| `leasefixtures.py`、`cases/` | negative case（packet 手順2の写し）の土台とcase |

すべて保護面である（packet「保護面」: `scaffold/`配下の`README.md`以外）。変更には、変更前後の状態をexactに列挙した
approve recordを`decision_record`で運ぶ必要がある。

## 使い方

```
python3 scaffold/lease/leasectl.py admit PR --context ID            # 判定だけ（dry-run）
python3 scaffold/lease/leasectl.py admit PR --context ID --apply    # 拒否理由0件のときだけmerge
python3 scaffold/lease/leasectl.py sync ISSUE --context ID [--apply]
python3 scaffold/lease/leasectl.py status [--lease-pr N]
python3 scaffold/lease/leasectl.py selftest [--record]
python3 scaffold/lease/leasepost.py request --pr N --class C --reviewer-target RUNTIME --request-file F \
        --creator RUNTIME,MODEL,PROVIDER,SESSION [--basis F.json] [--op-inputs F.json] [--apply]
python3 scaffold/lease/leasepost.py response --pr N --request-id RID --reviewer RUNTIME,MODEL,PROVIDER,SESSION \
        --counts B,M,m --authority-basis-sufficient yes --new-authority-created no \
        [--operation-admission pass] [--transcription-faithful yes] [--transcribed] --text-file F [--apply]
python3 scaffold/lease/leaserecover.py PR --context ID --mode review|comment [...] [--apply]
python3 scaffold/lease/leaseprobe.py --login LOGIN --review-id ID [--lease-pr N] [--apply]
```

`--context`はそのcommandを動かすruntimeのcontext識別子である（作成側・reviewerのsessionと異なること）。
終了codeは、成立0、拒否1、入力不正・内部エラー2である。実行環境の許可は、これらのcommandにだけ与える（packet 二重境界）。

## 機械可読なcommentの形

commentの本文に```` ```helix-lease ```` のfenceで囲んだJSONを1つだけ置く。0個・2個以上・不正なJSONは読まない。

- `review_request`: `review_request_id`、`pr`、`base`、`head`（full SHA）、`payload`（`pr_class`、`authority_basis`、
  `operation_inputs`、`creator`＝作成側context、`reviewer_target`、`request_text`）、`payload_sha256`（`payload`の正規化JSON
  ＝key順・区切り`,:`のUTF-8に対するSHA-256）。
- `review_request_delivery_receipt`: `receipt_id`、`review_request_id`、pair、`payload_sha256`、`request_comment_id`、
  `remote_body_sha256`（read-afterで取得した依頼comment本文のSHA-256）、`read_after_at`、`delivery_result`（`delivered`だけを数える）。
  訂正は旧receiptを消さず、`correction_of`で新しいreceiptを追記する。
- `review_response`: `review_request_id`、pair、`reviewer`（runtime、model、provider、session）、`counts`（blocker、major、minor）、
  `authority_basis_sufficient`、`new_authority_created`、区分により`operation_admission`・`transcription_faithful`、`transcribed`。
  応答全文はblockの後に置く。
- `merge_result`、`lease_state`（`suspended`）、`lease_probe_result`: executor・recovery・実測commandが書く。

PO判断は```` helix-lease ````を使わない。decision_record PRへのPR review本文の`decision: <選択>`の1行だけである
（再bootstrap modeだけ、PRへのissue commentの`decision: <選択> head: <full SHA>`の1行）。

## 有効化（POの確認が要る。それまで`activated_at`は`null`）

packetは、既存規則でmergeするPRを、packet・判断recordのPRと後続`operation_change` PR（本PR）の2つに限り、削除不能の実測を
有効化の条件とする（有効化前の結果をlease記録に残し、POが確認する）。そのため有効化は、本PRのlease記録をmerge前に埋め、
実測を済ませてから、本PRを既存規則でmergeして行う。再bootstrap modeは停止後の再開経路であり、初回の有効化には使わない。

1. AI側のGitHub identityはGitHub Appとする（AI用の別accountは作らない。packetは「GitHub Appまたは別account」を認める）。
   POがGitHub Appを作り、本repositoryにだけinstallする。権限はcontents・pull requests・issuesの書込みとmetadataの読取りに限り、
   administrationとrepository rulesは与えない。AI側のcontext（作成側・reviewer・executor・`recovery`）はinstallation tokenだけを使い、
   POのaccountの資格情報（`gh auth`のtoken等）はAI側のどのcontextからも取得・使用できない場所へ移す。
   `identity.po`へPOのloginを、`identity.ai`へAppのlogin（`<app slug>[bot]`）を、`identity.apps`へapp slugを記入する。
   executorはAppのloginをcollaborator roleではなくappの権限で照合し、administration・repository rulesの書込みがあるか、
   取得できなければ停止する。PRの作成者がAppになるため、POは自分のPR reviewで判断できる。
2. すべてのrulesetのbypass対象を空にし（Appを含めない）、admin資格情報をAI側から隔離する。
   executorと`recovery`が通常pushできるbranch protectionにする（POが設定する）。
3. `baseline`へ、mainのbranch protection（force push禁止、削除禁止、`enforce_admins`有効）とrulesetの一覧・bypass対象を記録する。
4. 状態Issueを1件作り`status_issue`へ、draftの試験PRを1件作り`probe.test_pr`へ記入する。POがその試験PRへ、本文に`decision:`行を
   書かない試験reviewを`APPROVED`と`CHANGES_REQUESTED`で1件ずつ提出し、そのIDを`probe.test_reviews`へ記入する。
5. 1〜4を本PRへpushした後、AI側の各loginで`leaseprobe.py --lease-pr <本PR> --login L --review-id ID --apply`を両試験reviewに実行する。
   `leasectl.py status --lease-pr <本PR>`の`probe.status`が`ok`（全login×2 reviewが30日以内に`denied`または`unavailable`）であることを
   確かめ、結果commentのIDを`probe.activation_results`へ記入する。POがその結果を確認する（本PRへのPR review）。
6. 下記「未検証」を実物で確かめる。`origin_main`へ本PRのmerge直前のmain HEADを、`activated_at`へ時刻を記入し、最終headで独立reviewを受ける。
   mainが動いた場合は`origin_main`を記入し直す（content変更のため再review）。
7. 本PRを既存規則でmergeする。executorは、起点の直後の1件に限り、lease記録を未有効から有効へ変えたこのmergeを、executor以外の
   main更新として扱わない。以後mainを更新するのはexecutorだけである。

本PRを無効状態（`activated_at: null`）のままmergeした場合は、leaseは存在しない（packet「そのPRがmainへ入るまでleaseは存在しない」）。
その後に有効化するには、packetの改訂（有効化を運ぶPRの追加）と新たな人間判断が要る。

## 実装で定めたこと（packet「既知の残存riskと後続PRで扱う論点」への対応）

- 実測で「結果として数えない」結果（一時的な失敗、未知のerror）は、状態Issueへ投稿しない（`leaseprobe.py`）。
- executorは結果commentだけでなく、固定した試験reviewが試験PRに現存することを自ら確かめ、無ければ`review_source_unsafe`とする。
- 再bootstrapでidentity表だけを差し替える場合は、packetを改訂せず、差替えを判断したrecordで運ぶ（「登録と解除だけ」と同じ扱い）。
- 実測の期限切れ中に運べるのは、`approved_targets`が`probe_paths`と`lease.json`の`probe`欄だけであるdecision_recordである
  （lease記録は欄単位で比較する）。approve以外のrecordは`approved_targets`が空のため形式上この条件を満たすが、出所はPO reviewであり、
  判断の生成にはならない。期限切れ中の削除への多重防御（観測済みIDの必須化・events照合の待ち）は加えていない（残存risk）。
- `accept_bootstrap_risk`でも、依頼・receipt・応答のcommentはidentity表のAI側loginの投稿だけを証拠とする（受容した
  残存riskは「AI側内部の偽造」であり、第三者の投稿は含まない）。AI側login以外がpairに束縛されたblockを置くと、そのPRは
  `review_identity_mismatch`で拒否される（安全側。第三者によるPR単位の妨害はあり得る）。
- 観測したPO reviewのID（再bootstrapでは判断commentのID）は、dry-runや拒否の時も状態領域へ追記し、消さない。
- lease記録が有効化される前は、停止を状態領域にも状態Issueにも記録しない（基準値が無いため。有効化後へ持ち越さない）。
- 状態領域の停止は、状態Issueと同じく、lease記録の直近の解除判断（`last_resume_at`）より後のものだけを数える。
- `SCF-B-0004`の`state`が`retired`になった時点で、leaseは期限切れと同じ扱いになる。
- 「lease mergeで入ったrecord」は、起点（`origin_main`）より後のfirst-parent上のcommitで入り、その記録を持つものに限る。
- activityの主体照合も、起点と「lease mergeで入ったrecord」も、親が2つ、messageの1行目と3行目が固定の形、対象PRにexecutor側loginの
  `merge_result`があるcommitに限る（messageの部分一致では決めない）。activityの各更新は、更新後commitの第1親が更新前のHEADであることも確かめる。
- 検査(a)(b)は`python3 -s -E`で起動し、HOMEをtree外の空のtmpfsにし、pid名前空間も切る（PRが置いたuser siteのcodeを読み込まない）。
- 実測の期限（30日）と監査の遅れの上限（10件）はpacketの固定値であり、lease記録では変えない。
- 解除時刻（`last_resume_at`）は、それを記録したlease記録がmainへ入った時刻を上限にする。
- projection_syncは書込みのたびに状態領域へ`pending_sync`を置き、そのreceiptがmainへ入るまで同じIssueへ書き込まない。
- どの階層の`.gitattributes`も、行単位で保護面かを判定する。
- 非常mergeの後に起点を付け直して再開するrecordは、frontmatterの`recovery_read_after`（`merge_commit`と`mismatch_codes`。不一致が
  無ければ`none`）で、起点以降の非常mergeごとに`merge_result`のread-after結果を列挙する。列挙の不一致・欠落、状態Issueの停止commentの
  欠落があれば運ばない。
- 変更前bytesのSHA-256とrecordとの照合は、`docs/governance/decisions/`配下の本文に現れる64桁のSHA-256表記と比べる。
- pathは`core.quotepath=false`と`-z`で引用符なしに読み、renameとcopyは検出せず削除と追加として扱う。
- `merge_result`はread-afterの後に、その結果（一致、または不一致の一覧）を含めて置く。投稿の失敗はread-after不一致として停止する。

## 未検証（実際のGitHubでまだ確かめていないこと）

次は公開仕様に基づいて実装したが、有効化前に実物で確かめる。確かめるまで`activated_at`を記入しない。

- repository activity API（`GET /repos/{owner}/{repo}/activity`）の`before`／`after`／`activity_type`／`actor`の形と、保持期間。
- collaborator permission APIの`role_name`（`write`等）の値。
- `GET /apps/{app_slug}`の`permissions`が、installation権限の上限として使えること（`identity.apps`を使う場合）。
- activity APIの`actor.login`と、PR・comment・reviewの`user.login`が、Appでは`<app slug>[bot]`になること。installation tokenでの`git push`がbranch protectionの下でmainへ通常pushできること。
- GraphQL `deletePullRequestReview`の拒否時のerror種別（`leaseprobe.py`の`DENIED`／`UNAVAILABLE`の目印）。
- Issueの`userContentEdits`の`diff`が直前の版の本文を返すか（projection_syncの編集履歴照合）。
- `git merge-tree --write-tree`とGitHubのmerge結果のtreeが一致すること（mergeable判定との対応）。
