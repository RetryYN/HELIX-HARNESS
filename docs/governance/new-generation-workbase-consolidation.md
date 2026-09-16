# 新世代作業基盤への集約 operation contract

operation_id: `NG-WORKBASE-CONSOLIDATION-20260917-001`
status: `po_authorized_in_progress`
operation_class: `operation_change`
authority_effect: `none`
authorized_by: `PO instruction 2026-09-17`
target_generation: `new-generation-2026-09-14`

## 目的

旧世代の作業branch、worktree、stash、未統合commit、未コミット差分を失わず非実行archiveへ退避し、現役の作業面を
`main`一つへ集約する。GitHub、local repository、worktreeのどれを見ても、現役作業を旧branchから再開できるように
見せない。新世代の要求整理は、集約済み`main`にあるローカル上流だけを入口にする。

本operationは作業基盤の整理だけを行う。要求の採否、分割、統合、再配置、successor確定、L1／L2／L11変更、L3、
実装、CI、runtime再構築を行わない。集約完了後は要求整理へ進む直前で停止する。

## PO指示による最終状態

| surface | 完了状態 |
|---|---|
| GitHub branch | `main`だけが現役branchとして存在する |
| local branch | 新しい作業cloneには`main`だけが存在する |
| worktree | canonical repository rootの`main` worktree一つだけが存在する |
| archive | 旧Git object、全worktree HEAD、local／remote ref、stash、dirty／untracked／ignored stateを復元可能な形でrepo外へ保持する |
| 実行境界 | archiveをCLI、hook、CI、runtime、要求authority、fallbackとして使わない |

ここでいう「archive＋main」は、現役Git branchを二本にする意味ではない。archiveは非実行の保全領域であり、現役branchは
`main`一本だけとする。

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

1. 本contractを`main`へmergeし、GitHub Issueを本revisionのprojectionとして作成する。
2. apply直前にworktree、ref、stash、active processを再取得し、事前receiptとの差分を追加receiptへ保存する。
3. 差分に含まれる新しいHEADをarchive refへ追加し、Git bundleを再生成・verifyする。
4. canonical root、linked worktree root、例外pathを削除せず、同一filesystem上のrepo外archiveへrenameして生bytesを保持する。
5. canonical pathへ`main`だけを取得するfresh cloneを作る。旧`.git`、hook、runtime state、DB、worktree metadataを移植しない。
6. GitHubの`main`以外のbranchを、archive済みexact ref集合と照合して削除する。force-push、main履歴変更、tag削除はしない。
7. local／GitHub branch、worktree、main HEAD、archive bundle、raw archive件数をread-afterし、完了receiptをIssueと本書へ接続する。

途中で新しい未archive HEAD、archive digest不一致、bundle verify失敗、main HEAD drift、保存先不足が見つかった場合は、残りの
applyを停止する。削除を先行させない。

## 完了条件

- GitHub open PRが0で、remote branchが`main`だけである。
- canonical local cloneのlocal branch、remote-tracking branch、registered worktreeがそれぞれ`main`一つである。
- canonical local cloneがcleanで、HEADと`origin/main`が一致する。
- apply直前の全worktree HEAD、local branch、remote branch、stashがverified bundleまたはraw archiveに存在する。
- dirty、untracked、ignored stateを持つ旧worktreeをraw archiveへrenameし、削除していない。
- archiveを現行の実行、fallback、authorityへ接続していない。
- 要求文書、要求atom、管理層register、L1／L2／L11、要求Issue #1798〜#1815を変更・closeしていない。

## 停止境界

完了後は、要求の要否、重複、技術代替、対象製品、unit／connection／composite、successorを整理する前で停止する。
次の要求整理は、POの再開指示を受けて別PRから始める。
