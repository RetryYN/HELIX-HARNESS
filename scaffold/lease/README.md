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
有効化の条件は下記「有効化」のとおりで、POが確認するまで満たされない。

## 構成

| file | 役割 |
|---|---|
| `lease.json` | lease記録（機械可読）。identity表、基準値、起点、状態Issue、試験PR・試験review、mapping、検査toolの入力一覧 |
| `leasecore.py` | 判定の中核。GitHubにもgitにも触れない純粋な関数。型付きの拒否理由を返す |
| `leasegh.py` | GitHubとgitからsnapshotを集め、許可リストを通した書込みだけを行う。検査(a)(b)を隔離環境で実行する |
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
python3 scaffold/lease/leasectl.py status
python3 scaffold/lease/leasectl.py selftest [--record]
python3 scaffold/lease/leasepost.py request --pr N --class C --reviewer-target RUNTIME --request-file F \
        --creator RUNTIME,MODEL,PROVIDER,SESSION [--basis F.json] [--op-inputs F.json] [--apply]
python3 scaffold/lease/leasepost.py response --pr N --request-id RID --reviewer RUNTIME,MODEL,PROVIDER,SESSION \
        --counts B,M,m --authority-basis-sufficient yes --new-authority-created no \
        [--operation-admission pass] [--transcription-faithful yes] [--transcribed] --text-file F [--apply]
python3 scaffold/lease/leaserecover.py PR --context ID --mode review|comment [...] [--apply]
python3 scaffold/lease/leaseprobe.py --login LOGIN --review-id ID [--apply]
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

有効化は、`lease.json`の次の欄を埋めるPRを、lease有効前の既存規則でmergeして行う（leaseはまだ存在しないため）。

1. AI側のGitHub identity（別accountまたはGitHub App）を用意し、POのaccountの資格情報をAI側のどのcontextからも使えない場所へ移す。
   `identity`へPOのloginとAI側のlogin（`accept_bootstrap_risk`では`ai`の1つ）を記入する。
2. AI側loginの実効roleを組み込みの`write`ちょうどにし、すべてのrulesetのbypass対象を空にし、admin資格情報をAI側から隔離する。
   executorと`recovery`が通常pushできるbranch protectionにする（POが設定する）。
3. `baseline`へ、mainのbranch protection（force push禁止、削除禁止、`enforce_admins`有効）とrulesetの一覧・bypass対象を記録する。
4. 状態Issueを1件作り`status_issue`へ、draftの試験PRを1件作り`probe.test_pr`へ記入する。POがその試験PRへ、本文に`decision:`行を
   書かない試験reviewを`APPROVED`と`CHANGES_REQUESTED`で1件ずつ提出し、そのIDを`probe.test_reviews`へ記入する。
5. AI側の各loginで`leaseprobe.py`を両試験reviewに実行し、結果がすべて`denied`または`unavailable`であることをPOが確認する。
6. `origin_main`へ有効化時点のmain HEADを、`activated_at`へ時刻を記入する。

## 実装で定めたこと（packet「既知の残存riskと後続PRで扱う論点」への対応）

- 実測で「結果として数えない」結果（一時的な失敗、未知のerror）は、状態Issueへ投稿しない（`leaseprobe.py`）。
- executorは結果commentだけでなく、固定した試験reviewが試験PRに現存することを自ら確かめ、無ければ`review_source_unsafe`とする。
- 再bootstrapでidentity表だけを差し替える場合は、packetを改訂せず、差替えを判断したrecordで運ぶ（「登録と解除だけ」と同じ扱い）。
- 実測の期限切れ中に運べるのは、`approved_targets`が`probe_paths`と`lease.json`の`probe`欄だけであるdecision_recordである
  （lease記録は欄単位で比較する）。approve以外のrecordは`approved_targets`が空のため形式上この条件を満たすが、出所はPO reviewであり、
  判断の生成にはならない。期限切れ中の削除への多重防御（観測済みIDの必須化・events照合の待ち）は加えていない（残存risk）。

## 未検証（実際のGitHubでまだ確かめていないこと）

次は公開仕様に基づいて実装したが、有効化前に実物で確かめる。確かめるまでlease記録を有効化しない。

- repository activity API（`GET /repos/{owner}/{repo}/activity`）の`before`／`after`／`activity_type`／`actor`の形と、保持期間。
- collaborator permission APIの`role_name`（`write`等）の値。
- GraphQL `deletePullRequestReview`の拒否時のerror種別（`leaseprobe.py`の`DENIED`／`UNAVAILABLE`の目印）。
- Issueの`userContentEdits`の`diff`が直前の版の本文を返すか（projection_syncの編集履歴照合）。
- `git merge-tree --write-tree`とGitHubのmerge結果のtreeが一致すること（mergeable判定との対応）。
