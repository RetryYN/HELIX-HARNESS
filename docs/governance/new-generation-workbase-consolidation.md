# 新世代作業基盤への集約 operation contract

operation_id: `NG-WORKBASE-CONSOLIDATION-20260917-001`
status: `completed`
operation_class: `operation_change`
authority_effect: `none`
authorized_by: `PO instruction 2026-09-17; see #PO指示原文`
target_generation: `new-generation-2026-09-14`

## 目的

旧世代の作業branch、worktree、stash、未統合commit、未コミット差分を失わず非実行archiveへ退避し、現役の作業面を
`main`一つへ集約する。GitHubには旧世代切替点を読み取る`archive`と、現役の`main`だけを置く。local repositoryと
worktreeは`main`一つに限定し、旧branchから現役作業を再開できるように見せない。新世代の要求整理は、集約済み
`main`にあるローカル上流だけを入口にする。

本operationは作業基盤の整理だけを行う。要求の採否、分割、統合、再配置、successor確定、L1／L2／L11変更、L3、
実装、CI、runtime再構築を行わない。集約完了後は要求整理へ進む直前で停止する。

本operationのPR作成・修正側は差分作成、証拠提示、review依頼、finding対応までを担う。最終merge、post-merge
read-after、Issue closeは、作成側から独立して割り当てられ、exact HEADのreviewとmerge admissionを確認し、対象通路を
明示許可されたレビュー対応側が行う。責務割当だけでGitHub等の実行通路を許可しない。

## PO指示原文

2026-09-17（Asia/Tokyo）の本作業会話で、POは次の順に指示した。

> ローカル、ギットハブのブランチ、ワークツリーを整理してメインのみにたためる感じか？

> アーカイブとメインの2つか。

> それをイシューにして新世代への作業基盤へ整理を完遂して。要求整理前まで進めてくれ。

この指示は、local branchとworktreeを現役`main`一つへ集約し、GitHub remote branchを非実行保全用`archive`と現役
`main`の二本へ整理し、旧状態をrepo外archiveにも保存し、Issueで進行と証拠を共有し、要求整理前で停止する
action-binding authorizationとして適用する。旧一時branchの削除、`archive` branchの作成、canonical rootのfresh clone化は
許可scopeに含む。mainの履歴変更、force-push、tag削除、archive破棄、要求変更は許可scopeに含めない。

## PO指示による最終状態

| surface | 完了状態 |
|---|---|
| GitHub branch | 現役`main`と、旧世代切替点を保持する非実行保全用`archive`だけが存在する |
| local branch | 新しい作業cloneには`main`だけが存在する |
| worktree | canonical repository rootの`main` worktree一つだけが存在する |
| archive | GitHub `archive`は旧世代切替点を保持し、旧Git object、全worktree HEAD、local／remote ref、stash、dirty／untracked／ignored stateは復元可能な形でrepo外にも保持する |
| 実行境界 | GitHub `archive`とrepo外archiveをCLI、hook、CI、runtime、要求authority、fallbackとして使わない |

GitHub `archive`は、PR #1797による新世代repository foundation導入前の旧世代切替点
`6fabd12512a3659fff4a956692cdd61faeeb16ce`を指す。これは旧世代のGitHub可読snapshotであり、全一時branch、worktree、
stashを含む完全保全物の代替ではない。完全保全はrepo外のverified bundleとraw archiveが担う。現役branchは`main`だけとする。

## 事前inventory receipt

基準`origin/main`は`e9b77484ed12ada6c779a0b83dee73d1f2389b1d`。2026-09-17T01:06:12+09:00時点のexact inventoryを
repo外archiveへ保存した。

| 対象 | 件数 | 状態 |
|---|---:|---|
| registered worktree | 822 | clean 781、dirtyまたは読取不能41、main到達641、main未到達181 |
| local branch | 976 | main到達712、main未到達264 |
| origin remote ref | 220 | main到達108、main未到達112。symbolic refを含む |
| stash | 44 | 全entryをSHAとsubject付きで記録 |
| repo関連active process | 17 | apply前に再取得し、旧writerを停止またはarchive側へ隔離する |

exact inventoryのSHA-256は次のとおり。

| receipt | SHA-256 |
|---|---|
| worktree inventory | `82aeae7c7e5fd67bea44041fc481e165d6177392c34250bfbada30fd4ec32247` |
| local branch inventory | `5437c9c630ffc50061627f268ed31b5739164b3c64d1e8ac82eb1207bb71ca09` |
| origin ref inventory | `42747a8060a3ee3894f0bb5ffc9c0e0f9da7e9ea76c7a0005cdc778ac6d61676` |
| stash inventory | `16643dde01f31be7b1ede9a6c16d83c03f91c21e829855a1ed7d50a43fb09077` |
| active process inventory | `b17dccca6d7d7dc84cb1faeefc5ad88ea801fdcbe18352d06078a6fda8cbdd6c` |

全worktree HEAD 822件は一意なarchive refへ束縛した。local branch、remote-tracking ref、tag、stashと合わせてGit bundleへ
保存し、`git bundle verify`でcomplete historyを確認した。

- archive worktree-ref mapping: 822件、SHA-256
  `8fbb2b865470120e8c4cd602d6de2d1905e8166711783a85fa5229ea51297ed5`
- Git bundle: 2,928 refs、144 MiB、SHA-256
  `4cd53361afa4770d43320a1aadc56d5e56c6c379b181116c406600a51dff6ddf`

archive保存先の絶対pathは、個人環境pathをrepo文書へ固定しないため外部operation receiptだけに保持する。

## apply順序

1. 本contractのcontent revisionからGitHub Issueを作成し、contract merge後にIssueのsource revisionをmerge commitへ訂正する。
2. apply直前にworktree、ref、stash、active processを再取得し、事前receiptとの差分を追加receiptへ保存する。
3. 差分に含まれる新しいHEADをarchive refへ追加し、Git bundleを再生成・verifyする。
4. review laneを終端し、repo関連processを再取得する。旧scanner、receiver、Claude lane等のwriterを停止して停止対象と結果をreceiptへ残す。VS Codeの表示・言語serverは旧stateのwriterに使わない。
5. canonical root、linked worktree root、例外pathを削除せず、同一filesystem上のrepo外archiveへrenameして生bytesを保持する。
6. canonical pathへ`main`だけを取得するfresh cloneを作る。旧`.git`、hook、runtime state、DB、worktree metadataを移植しない。
7. GitHubの`main`と`archive`以外のbranchを、archive済みexact ref集合と照合して削除する。`archive`は旧世代切替点へ
   exact SHAで作成する。force-push、main履歴変更、tag削除はしない。
8. local／GitHub branch、worktree、main／archive HEAD、archive bundle、raw archive件数をread-afterし、完了receiptを
   Issueと本書へ接続する。

途中で新しい未archive HEAD、archive digest不一致、bundle verify失敗、main HEAD drift、保存先不足が見つかった場合は、残りの
applyを停止する。削除を先行させない。

## 完了条件

- GitHub open PRが0で、remote branchが現役`main`と非実行保全用`archive`だけである。
- canonical local cloneのlocal branch、remote-tracking branch、registered worktreeがそれぞれ`main`一つである。
- canonical local cloneがcleanで、HEADと`origin/main`が一致する。
- apply直前の全worktree HEAD、local branch、remote branch、stashがverified bundleまたはraw archiveに存在する。
- dirty、untracked、ignored stateを持つ旧worktreeをraw archiveへrenameし、削除していない。
- GitHub `archive`とrepo外archiveを現行の実行、fallback、authorityへ接続していない。
- 要求文書、要求atom、管理層register、L1／L2／L11、要求Issue #1798〜#1815を変更・closeしていない。

## 停止境界

完了後は、要求の要否、重複、技術代替、対象製品、unit／connection／composite、successorを整理する前で停止する。
次の要求整理は、POの再開指示を受けて別PRから始める。

## 完了receipt

2026-09-17T01:21:47+09:00の初回read-afterで、operation apply基準
`233498d6ab0a9033359d4d5056946b9bed88cc46`に対して次を確認した。GitHub `archive`作成後の訂正read-afterは
2026-09-17T01:45:35+09:00に実施し、`archive`と`main`のexact SHAを再確認した。

| 確認対象 | 結果 |
|---|---|
| 最終preflight | worktree 823、local branch 977、origin ref 220、stash 44を再取得 |
| Git object保全 | 全最終worktree HEAD 823件をarchive refへ束縛し、complete historyのGit bundleをverify |
| 最終Git bundle | 144 MiB、SHA-256 `de83e9371bfebe09f97e5a0db18d5fc5858c5531cb822b603f68ebe86a76af55` |
| raw archive | 旧canonical root 2.0 GiB、共通linked worktree root 75 GiB、例外worktree 9件・948 MiBをrename保存 |
| raw move receipt | SHA-256 `011a8ff75e1163e7851d345260cb24694ee0f077e3032f5160759abe0f0d9534` |
| GitHub branch処置 | 旧一時branch 218件をarchive inventoryとSHA一致後に削除、成功218／失敗0。その後、PO指示の二本構成へ訂正し、旧世代切替点`6fabd12512a3659fff4a956692cdd61faeeb16ce`を`archive`として作成 |
| branch delete receipt | SHA-256 `723b9dfa8ba3baa9774529da28bbff6a228471acbd6184fbfc0f14b71bce4e6b` |
| canonical local | fresh clone、local branch `main` 1件、registered worktree 1件、clean、HEAD＝`origin/main` |
| GitHub訂正read-after | branchは`archive`と`main`の2件。`archive`＝`6fabd12512a3659fff4a956692cdd61faeeb16ce`、`main`＝`13997e942095d11ec19bbb76e3231edc119f1ec5` |
| archive実行境界 | old scanner、receiver、Claude lane、archiveをcwdにしたshell／language serverを停止。archive cwd process 0件 |
| 要求境界 | #1798〜#1805、#1812〜#1815は全件OPENを維持。要求文書・要求atom・L1／L2／L11は不変 |

exact path、全ref、全worktree status、process停止対象、remote branch削除結果はrepo外operation receiptへ保持した。
repo外archiveはsource recovery専用で、現行repositoryのremote、worktree、hook、CLI、CI、runtime、DB、fallbackへ接続して
いない。GitHub `archive`はremote上の非実行snapshotとして存在するが、worktree、hook、CLI、CI、runtime、DB、fallback、
要求authorityには接続していない。
