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
| `leaseboot.py` | 有効化の準備command（`prepare`＝状態Issueと試験PRの作成、`probe`＝全login×2 reviewの実測、`verify`＝「未検証」の実測）。mainへは押せない |
| `../lease-bootstrap/` | POがrootで1回実行する`install.sh`（OS user、root所有copy、wrapper、sudoers）と、GitHub Appの作成・token発行を行う`appsetup.py` |
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
python3 scaffold/lease/leaseboot.py prepare|probe|verify --lease-pr N [--po LOGIN] [--apply]
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

## 有効化（POが越える境界だけをPOが行う。それまで`activated_at`は`null`）

packetは、既存規則でmergeするPRを、packet・判断recordのPR（#1883）と後続`operation_change` PR（本PR）に限り、削除不能の実測を
有効化の条件とする（有効化前の結果をlease記録に残し、POが確認する）。そのため有効化は、本PRのlease記録をmerge前に埋め、
実測を済ませてから、本PRを既存規則でmergeして行う。再bootstrap modeは停止後の再開経路であり、初回の有効化には使わない。

POが行うのは、人間にしか越えられない境界だけである。設定値の作成、状態Issue・試験PRの作成、OS環境の構築、lease記録への転記、
実測、未検証項目の確認、read-afterは、下記のcommandが行う。

**POの操作（4回）**

1. **rootで1回**: 本PRのheadの`scaffold/lease-bootstrap/install.sh`をGitHubから取り出して実行する（AI側の作業treeのbytesをrootで走らせない）。
   scriptは、自分のbytesが`--sha`の版と一致すること、`--sha`が`--pr`のPRの現在のheadでPRがopen・mainを対象にしていることを
   確かめ、違えば止まる。置くtreeのcommit・tree・command群のSHA-256を表示するので、POはPR画面の値と突き合わせる。
   ```
   sha=<本PRの現在のhead>
   curl -fsSL "https://raw.githubusercontent.com/RetryYN/HELIX-HARNESS/$sha/scaffold/lease-bootstrap/install.sh" -o /tmp/install.sh
   sha256sum /tmp/install.sh   # PR本文に載せたSHA-256と一致することを確かめる
   sudo sh /tmp/install.sh --sha "$sha" --repo RetryYN/HELIX-HARNESS --pr 1886 --ai-user <AI側のOS user>
   ```
   これは、executor用のOS user、`/opt/helix-lease`のroot所有copy（GitHubから`--sha`のtreeを取り出す）、installation tokenを発行する
   wrapper `/usr/local/sbin/helix-lease-run`、AI側userにそのwrapperの`leasectl`・`leasepost`・`leaseprobe`・`leaseboot`だけを許す
   sudoersを置き、続けてGitHub Appの作成へ進む。準備command（`leaseboot`）は別のfile（`/etc/sudoers.d/helix-lease-bootstrap`）で、
   対象PRを引数に固定して許可する。有効化が済んだらそのfileを消す（commandも有効化後は動かない）。
   非常用command（`leaserecover`）は既定で許可せず、packetのとおり、POが対象を引数に固定した行を必要なときだけ足す（sudoersに例を書いてある）。repositoryは公開である前提（cloneに資格情報を使わない）。
   Appを組織のsettingsで作る場合は`--org`を付ける。
2. **browserで認可**: 表示されたlocalhostのURLを開き、[GitHub Appを作成する]を押す。名前と権限（contents・pull requests・issuesの
   書込み、metadataとadministrationの読取り。administration・repository rulesの書込みは無し）は入力済みである。作成の戻りで秘密鍵は
   executor userのhomeへ0600で保存され、AI側contextからは読めない。続けて表示される install URLで、このrepositoryだけを選んでinstallする。
   あわせて、すべてのrulesetのbypass対象を空にし、POのaccountの資格情報（`gh auth`のtoken等）をAI側contextから取得・使用できない場所へ移す。
3. **試験PRで2回押す**: AIが作った試験PR（draft）で、Approveを1回、Request changesを1回提出する（本文は空でよい。判断行`decision:`を書かない）。
   これは、AI側identityがPO reviewを削除できないことを実測するためのreviewであり、判断ではない。
4. **最終headの承認**: 有効化の値を埋めた最終exact HEADを確認し、既存規則の条件4（merge通路の明示許可）をそのHEADに固定して与える
   （本PRは既存規則でmergeするため、POの確認はPR reviewではなくこの許可である。executorは有効化mergeにPO reviewを照合しない）。

**AI側が行うこと（`sudo -u <executor user> /usr/local/sbin/helix-lease-run <command> ...`の形で起動する）**

- 操作1・2の後: `leaseboot prepare --lease-pr <本PR> --po <POのlogin> --apply`
  状態Issueを1件、`lease/probe-test` branchと試験PR（draft）を1件作り、保護設定・rulesetの基準値、identity表（AI側の全roleを`<app slug>[bot]`）、
  状態Issue、試験PRを書いたlease記録の候補を出す。作成側はこれを本PRのlease記録へ入れてpushする。POが提出した試験reviewのIDと状態も記入する。
- 操作3の後: `leaseboot probe --lease-pr <本PR> --apply`
  AI側の全login×2 reviewへ削除の試行を行い、結果commentのIDを`probe.activation_results`へ、そのときの試験reviewを
  `probe.activation_test_reviews`へ書いた候補を出す。`leasectl status --lease-pr <本PR>`で`identity`（`po`がPOのlogin、AI側の全roleがAppのlogin）・`probe_registered`・`origin_main`・`baseline_diff`（記録といま取得した保護設定の違い。`一致`であること）と、
  `integrity`・`runner`・`probe.status`・`activation`を確かめる。
- `leaseboot verify --lease-pr <本PR>`: 下記「未検証」を実物で確かめる（読取りだけ）。取得できない項目・期待と違う値は成立とせず、
  1つでも欠ければ0以外で終わる。
- 最後に、上流authority台帳のCapability Lease行の状態（未有効化）を有効化へ更新し、`origin_main`へ本PRのmerge直前のmain HEADを、
  `activated_at`へ時刻を記入して、最終headで独立reviewを受ける。mainが動いた場合は`origin_main`を記入し直す（content変更のため再review）。
  保護設定・rulesetを取得できない、または基準値が無い間はexecutorは停止する（空の一致にしない）。
- 操作4の後: 本PRを既存規則でmergeする（mergeするruntimeはAppのinstallation tokenで動く）。executorは、起点の直後の1件に限り、
  lease記録を未有効から有効へ変えた、AI側loginによるこのmergeを、executor以外のmain更新として扱わない。以後mainを更新するのはexecutorだけである。

**境界（操作を機械へ移しても変えない）**

- AI側contextはexecutor userになれず、Appの秘密鍵を読めない。installation tokenはwrapperが発行して渡す。
- AI側contextはrootになれない。`/opt/helix-lease`はroot所有で、AI側からは書けない。
- executor userのhome（Appの秘密鍵と状態領域の置き場所）は、そのuserの所有で、AI側userのhomeと同じではなく、
  home自身と祖先が他のuserから書けず、symlinkを含まず、直下に別のuserの持ち物・symlink・他から書けるものが
  無いことを`install.sh`が（`checkhome.sh`で）確かめ、homeを0700にする（既存userを指定した場合は権限が変わる）。状態領域とApp設定・秘密鍵の置き場所・fileも、symlinkや他から読める権限なら読み書きに使わない
  （読み書きともsymlinkを追わない。秘密鍵のpathはApp設定のslugから組み立てず、形を確かめてから使う）。
  wrapperは呼び出し元の`PATH`・`HOME`を引き継がず、homeは実行userの登録内容から決める（特定できなければ止まる）。
- 有効化前に`--lease-pr`を受け付けるcommand（準備・実測・状態表示）は、実行環境が固定した対象PR（`/etc/helix-lease/target-pr`。root所有）と
  一致しなければ動かない。fileが無ければ「固定していない」として拒否する。
- どのcommandも、同じoptionが2回以上ある呼出しと、optionの省略形（`allow_abbrev`。subcommand側も含む）を拒否する（実行環境の許可が引数を固定しても、後勝ちの重複で別の対象へ向けられないようにする）。
- `leaseboot`が書けるのは、状態Issueの作成、`lease/`配下のbranchへのpush、試験PRの作成と、実測commandが置く結果commentだけである。
  mainへのpushは許可リストに入らない。lease記録がmainで有効になった後は`--lease-pr`を受け付けない。結果は標準出力のJSONで返し、fileは書かない。
- wrapper（`helix-lease-run`）から起動できるのは5つのlease commandだけ（sudoersが許すのは既定で4つ）で、`appsetup`（installation tokenの発行、秘密鍵の作成）は
  AI側contextから起動できない。tokenはwrapperの中だけで発行され、標準出力へ出ない。
- wrapperでexecutor userとして動くcommandは、呼出し元が渡したfileのうち、実行user自身・rootの持ちもの（Appの秘密鍵、状態領域、
  `/opt/helix-lease`のcopy）を開かない（投稿commandに読ませて外へ出させない）。
- 置くcodeは本PRの内容そのものであり、POが操作4で承認するのはそのbytesである。有効化前にcodeを直した場合は、起動条件のbytes照合で
  全commandが止まるため、POは`install.sh`を新しいheadで実行し直す（fail-closed）。
- lease mergeで`scaffold/lease/`が変わった後も同じで、POが`install.sh`を新しいSHAで実行し直すまで、executorは止まる（安全側）。
  実行し直すと前のcopyは`/opt/helix-lease.old`として残る（rootの持ちもの。起動条件は新しいcopyだけを見る）。
- lease mergeのcommitのident（author・committer）は固定値で、実行userのGECOSやgit設定を読まない（commitのauthorは主体の証明に使わない。
  主体はactivityとtokenで照合する）。

本PRを無効状態（`activated_at: null`）のままmergeした場合は、leaseは存在しない（packet「そのPRがmainへ入るまでleaseは存在しない」）。
その後に有効化するには、packetの改訂（有効化を運ぶPRの追加）と新たな人間判断が要る。

## 実装で定めたこと（packet「既知の残存riskと後続PRで扱う論点」への対応）

- 実測で「結果として数えない」結果（一時的な失敗、未知のerror）は、状態Issueへ投稿しない（`leaseprobe.py`）。
- executorは結果commentだけでなく、固定した試験reviewが試験PRに現存することを自ら確かめ、無ければ`review_source_unsafe`とする。
- 再bootstrapでidentity表だけを差し替える場合は、packetを改訂せず、差替えを判断したrecordで運ぶ（「登録と解除だけ」と同じ扱い）。
- 実測の期限切れ中に運べるのは、`approved_targets`が`probe_paths`と`lease.json`の`probe`欄だけであるdecision_recordである
  （lease記録は欄単位で比較する）。`approved_targets`が空のrecord（approve以外の判断を含む）と、実測関連の欄・bytesを実際には
  変えないrecordは、実測の修理として運ばない（packet「実測を行わないことで他の判断を運ぶ経路にはならない」）。期限切れ中の削除への多重防御（観測済みIDの必須化・events照合の待ち）は加えていない（残存risk）。
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
- copyを書ける状態（配置作業中のroot等）で`-B`なしに起動すると`__pycache__`ができ、以後すべてのcommandが既知でないentryで止まる
  （安全側）。copyはrootで実行せず、起動の形に`-B`を含める。
- 再bootstrapで状態Issueを差し替えた場合も、有効化前の実測結果commentは旧Issueに残るため、leaseは未有効として扱われる。
  そのrecordも`probe.activation_results`・`probe.activation_test_reviews`・`activated_at`の付け直しを列挙して運ぶ。
- 再bootstrapでidentity表を差し替えてAI側loginが増えた場合、新しいloginには有効化前の実測結果が無いため、leaseは未有効として扱われる。
  その再bootstrapのrecordは、新しいloginの実測結果と`probe.activation_results`・`probe.activation_test_reviews`・`activated_at`の付け直しを
  変更前後の状態として列挙して運ぶ。
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
- `git merge-tree --write-tree`とGitHubのmerge結果のtreeが一致すること（試験PRの`refs/pull/N/merge`のtreeと比べる。mergeはしない）。
