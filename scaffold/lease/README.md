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
python3 scaffold/lease/leaserecover.py PR --context ID --mode review|comment [...] [--self-repair SHA256] [--apply]
python3 scaffold/lease/leaseprobe.py --login LOGIN --review-id ID [--lease-pr N] [--apply]
```

上は引数の形である。executor（`leasectl.py`の`admit`・`sync`）・非常用command・実測command・投稿command（`--apply`）は、
`/usr/bin/python3 -I <rootが所有するcopy>/scaffold/lease/…`の形で起動する（下記「有効化」手順2）。起動時に次を確かめ、どれかを欠けば何もしない:
`-I`で起動している（user site・`PYTHON*`環境変数を読まない）、command群・interpreter・`gh`（`/usr/bin`か`/bin`から引く）・`git`・`openssl`・`tar`等と
その祖先directoryのすべてがrootの所有でgroup・otherから書けない（実行者が所有する置き場所は、mode bitを落としていても信頼しない）、command群の`.py`のbytesがorigin/main
（有効化前の実測ではそのPRのhead、自己修理では修理PRのhead）の`scaffold/lease/`と一致する。外部commandへ渡す環境は許可リストで作り
（`PATH=/usr/bin:/bin`、passwdのhome、`GH_TOKEN`だけを通す）、呼出し元の`PATH`・`XDG_*`・`GH_HOST`等を受け取らない。
`leasectl.py status`は、この起動条件の結果も`integrity`として出力する（POが有効化前の実測を確認する出力）。

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
   POがGitHub Appを作り、本repositoryにだけinstallする。権限はcontents・pull requests・issuesの書込み、metadataとadministrationの
   読取りに限り（administrationの読取りはbranch protection・rulesetの再取得に要る）、administration・repository rulesの書込みは与えない。AI側のcontext（作成側・reviewer・executor・`recovery`）はinstallation tokenだけを使い、
   POのaccountの資格情報（`gh auth`のtoken等）はAI側のどのcontextからも取得・使用できない場所へ移す。
   `identity.po`へPOのloginを、`identity.ai`・`creator`・`executor`・`recovery`と`reviewers`の各`login`へAppのlogin（`<app slug>[bot]`）を、`identity.apps`へapp slugを記入する（identity表。どのroleが欠けても未有効。`accept_bootstrap_risk`では全roleが`identity.ai`と同じ）。
   executorは、AI側の全login（`ai`・`creator`・`executor`・`recovery`・`reviewers`）が`identity.apps`のAppのloginでなければ未有効として扱う。
   executorはAppのloginをcollaborator roleではなくappの権限で照合し、administration・repository rulesの書込みがあるか、
   取得できなければ停止する。PRの作成者がAppになるため、POは自分のPR reviewで判断できる。
   Appの秘密鍵は、executorと非常用commandを動かすOS userのhomeの`.helix-lease/apps/<app slug>.pem`に置く（環境変数で変えない。AI側contextからは読めない）。
   AI側context（作成側・reviewer・実測command）が使うinstallation tokenは、POが所有するwrapperがその鍵から発行して渡す。executorは呼出し元が
   渡した`GH_TOKEN`をそのまま使う（同じAppのtokenしか存在しないため、権限の上乗せは無い）。executorはAppのJWTを、呼出し元のproxy環境変数を使わず固定のtrust store（`/etc/ssl/certs/ca-certificates.crt`）で検証した`api.github.com`への直接の接続だけで送り、
   `GET /repos/{repo}/installation`からinstallationの実際の権限を取得し、許可集合（contents・pull_requests・issuesの`write`、
   metadata・administrationの`read`）とちょうど一致しない権限（外の権限・過剰だけでなく、欠落や`read`への縮退も含む）、別のappのinstallation、取得の失敗のどれでも停止する。
2. すべてのrulesetのbypass対象を空にし（Appを含めない）、admin資格情報をAI側から隔離する。
   executor command・非常用command・実測command・投稿commandは、rootが所有しgroup・otherが書けない場所（祖先directoryを含む。例: `/opt/helix-lease/`）に
   置いたcopy（下記）から実行し、POの実行環境の許可はそのpathのcommandを`/usr/bin/python3 -I`で起動する形に限る（packet 二重境界。
   AI側の作業treeのcommandを許可しない）。copyは`git archive`またはfresh cloneだけから作る（作業treeからcopyしない。`__pycache__`等の
   既知でないentryがあれば、command群をimportする前に拒否する）。有効化前（手順5の実測・確認）は本PRの最終exact HEADから、
   有効化後はmainから作る（照合先がそれぞれ`--lease-pr`のPRのheadとorigin/mainであるため）。`gh`は`/usr/bin`に置く。
   executor・非常用commandは、AI側contextと別のOS userとして動かす（POが所有するwrapper、例: そのcommandだけを許すsudoersの規則で、
   installation tokenの`GH_TOKEN`だけを渡した空の環境）。同じOS userでは、AI側contextが動作中のexecutor processへattachでき（ptrace）、
   上の起動条件では防げないため、POはこれを有効化の前に確かめる。lease mergeで`scaffold/lease/`が変わった後は、
   POがそのcopyをmainの版へ更新するまで、executorはbytesの不一致で止まる（安全側）。
   executorと`recovery`が通常pushできるbranch protectionにする（POが設定する）。
3. `baseline`へ、mainのbranch protection（force push禁止、削除禁止、`enforce_admins`有効）とrulesetの一覧・bypass対象を記録する。
4. 状態Issueを1件作り`status_issue`へ、draftの試験PRを1件作り`probe.test_pr`へ記入する。POがその試験PRへ、本文に`decision:`行を
   書かない試験reviewを`APPROVED`と`CHANGES_REQUESTED`で1件ずつ提出し、そのIDを`probe.test_reviews`へ記入する。
5. 1〜4を本PRへpushした後、AI側の各loginで`leaseprobe.py --lease-pr <本PR> --login L --review-id ID --apply`を両試験reviewに実行する。
   executor userで実行した`leasectl.py status --lease-pr <本PR>`の`integrity`が`ok`、`runner`がAI側contextと別のOS user、`probe.status`が`ok`（全login×2 reviewが30日以内に`denied`または`unavailable`）であることを
   確かめ、結果commentのIDを`probe.activation_results`へ記入する（executorは、これらのcommentが状態Issueに編集されずに現存し、
   AI側の全login×2 reviewを`denied`または`unavailable`で覆うことを毎回確かめ、欠ければ未有効として扱う）。`--lease-pr`は、main上のlease記録が未有効の間だけ使える。
6. 下記「未検証」を実物で確かめる。保護設定・rulesetを取得できない、または基準値が無い間はexecutorは停止する（空の一致にしない）。上流authority台帳のCapability Lease行の状態（未有効化）を有効化へ更新する。`origin_main`へ本PRのmerge直前のmain HEADを、`activated_at`へ時刻を記入し、最終headで独立reviewを受ける。
   mainが動いた場合は`origin_main`を記入し直す（content変更のため再review）。POは、有効化の値（実測結果・起点・`activated_at`）を
   含む最終headを確認し、既存規則の条件4（merge通路の明示許可）をその最終exact HEADに固定して与える（本PRは既存規則でmergeするため、
   POの確認はPR reviewではなくこの許可である。executorは有効化mergeにPO reviewを照合しない）。
7. 本PRを既存規則でmergeする（mergeするruntimeはAppのinstallation tokenで動く）。executorは、起点の直後の1件に限り、lease記録を
   未有効から有効へ変えた、AI側loginによるこのmergeを、executor以外のmain更新として扱わない。以後mainを更新するのはexecutorだけである。

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
- executorは共有の作業treeと`.git`を使わず、実行ごとに使い捨てのbare repositoryへ`https://github.com/<repo>.git`からfetchして判定する。
  gitは呼出し元の`GIT_*`、system・globalの設定、HOME配下のattributes（`core.attributesFile=/dev/null`）、replace objectsを読まない
  （`git replace`や`.git/config`・`info/attributes`・`~/.config/git/attributes`で判定を変えない）。
  起動時の検査（上記「使い方」）を満たさなければ何もしない。状態領域の置き場所は実行userのhome（passwd）の`.helix-lease/`に固定し、環境変数で変えない。
- 自己修理（packet「非常用command自体も機能しない場合」）: `leaserecover.py --self-repair <SHA-256>`は、修理PRのheadの版と一致するbytesで
  実行する。origin/mainと異なる各fileの変更後SHA-256が、そのPRが追加するrecordの`approved_targets`にexactに列挙されていること、
  `--self-repair`の値（実行するcommand群の`path SHA-256`の行をpath順に並べたもののSHA-256）が実行するbytesと一致することを確かめ、
  判断の成立は通常の非常経路（または再bootstrap）の判定で確かめる。値はPOの許可が引数に固定し、merge commit messageの`permission_args`に残る。
- 有効化mergeは既存規則（merge API）で入るため、activityの種別が`pr_merge`でもよい（起点の直後の1件だけ）。
- AppのinstallationはAppの対象repositoryを選択したもの（`repository_selection: selected`）に限り、実測commandはinstallation tokenの
  対象repositoryが本repositoryだけであることを確かめる。
- 有効化前の実測結果commentは、`activated_at`より前に置かれ、有効化時点の試験review（結果commentが示す`APPROVED`・`CHANGES_REQUESTED`の各1件）を
  AI側の全loginについて覆うものに限る。有効化後に実測の修理で付け直した試験reviewは、`probe_status`の30日以内の結果で確かめる
  （付け直しでleaseが未有効に落ちない）。実測の修理は`probe.activation_results`を変えられない。
- PRのreview一覧で、GraphQL側に無いreview（`lastEditedAt`を確かめられないもの）があれば、未編集として扱わず取得失敗とする。
  非常経路と再bootstrapは、packetのとおり「lease記録の有効性」を条件から除くため、この実測結果の現存照合も行わない。
- 実測commandは、lease記録の`status_issue`が開いているIssue（PRでなく、試験PRでもない）であることを確かめてから書き込む。
- 起動条件には、`GH_TOKEN`があること（ghには空の設定directoryを渡し、実行userのgh設定を読まない）、`pycache_prefix`が無いこと、
  processをnon-dumpable（`prctl(PR_SET_DUMPABLE, 0)`）にできたことも含む。起動条件を欠けば、照合先の取得（network）へも進まない。
- 提出前（`PENDING`）のPO reviewは、GitHubの仕様で本人以外から見えない。packetは判断を「提出時刻が最新の1件」とするため、
  提出前のreviewは判断ではなく、executorはそれを待たない。POが判断を変える途中でmergeを止めたいときは、先に変更後のreviewを提出する
  （またはlease停止の経路を使う）。
- 試験reviewは、登録した状態（`APPROVED`と`CHANGES_REQUESTED`の各1件）のまま試験PRに現存することを確かめる。状態が変われば実測の欠落として扱い、
  実測commandはその試験reviewを試行しない。
- 検査(a)(b)は`python3 -s -E`で起動し、HOMEをtree外の空のtmpfsにし、pid名前空間も切る（PRが置いたuser siteのcodeを読み込まない）。
- 実測の期限（30日）と監査の遅れの上限（10件）はpacketの固定値であり、lease記録では変えない。
- 解除時刻（`last_resume_at`）は、それを記録したlease記録がmainへ入った時刻を上限にする。gitの呼出しは環境変数のcommit時刻・
  author・committerの上書きを受け取らない。
- lease記録の`identity.po`がAI側loginまたはAppのlogin（`[bot]`）なら、未有効として扱い、判断も成立させない。
- projection_syncは書込みのたびに状態領域へ`pending_sync`を置き、そのreceiptがmainへ入るまで同じIssueへ書き込まない。
- どの階層の`.gitattributes`も、行単位で保護面かを判定する。
- 非常mergeの後に起点を付け直して再開するrecordは、frontmatterの`recovery_read_after`（`merge_commit`と`mismatch_items`。read-afterの不一致の項目（`tree`、`parents`、
  `main_actor_mismatch`等）を`,`で連ね、無ければ`none`）で、起点以降の非常mergeごとに`merge_result`のread-after結果を列挙する。列挙の不一致・欠落、状態Issueの停止commentの
  欠落があれば運ばない。
- 変更前bytesのSHA-256とrecordとの照合は、`docs/governance/decisions/`配下の本文に現れる64桁のSHA-256表記と比べる。
- pathは`core.quotepath=false`と`-z`で引用符なしに読み、renameとcopyは検出せず削除と追加として扱う。
- `merge_result`はread-afterの後に、その結果（一致、または不一致の一覧）を含めて置く。投稿の失敗はread-after不一致として停止する。

## 未検証（実際のGitHubでまだ確かめていないこと）

次は公開仕様に基づいて実装したが、有効化前に実物で確かめる。確かめるまで`activated_at`を記入しない。

- repository activity API（`GET /repos/{owner}/{repo}/activity`）の`before`／`after`／`activity_type`／`actor`の形と、保持期間。
- collaborator permission APIの`role_name`（`write`等）の値。
- administrationの読取りを持つinstallation tokenで、branch protectionとrulesetの`bypass_actors`を取得できること。
- AppのJWTで`GET /repos/{repo}/installation`が`app_slug`・`permissions`・`repository_selection`を返すこと。
  installation tokenで`GET /installation/repositories`が本repositoryを返すこと（`leaseprobe.py`の認証確認）。
- gitのcredential helper（`gh auth git-credential`）が、`GH_TOKEN`のinstallation tokenでfetch・pushに資格情報を渡すこと。
- 既存規則でのmergeのactivityの`activity_type`（`pr_merge`か`push`か）。
- activity APIの`actor.login`と、PR・comment・reviewの`user.login`が、Appでは`<app slug>[bot]`になること。installation tokenでの`git push`がbranch protectionの下でmainへ通常pushできること。
- GraphQL `deletePullRequestReview`の拒否時のerror種別（`leaseprobe.py`の`DENIED`／`UNAVAILABLE`の目印）。
- Issueの`userContentEdits`の`diff`が直前の版の本文を返すか（projection_syncの編集履歴照合）。
- `git merge-tree --write-tree`とGitHubのmerge結果のtreeが一致すること（mergeable判定との対応）。
