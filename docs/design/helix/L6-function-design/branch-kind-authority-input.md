---
title: "branch判定の入力authority復旧設計"
layer: L6
status: draft
plan: docs/plans/PLAN-RECOVERY-935-branch-authority-input.md
parent_doc: docs/design/helix/L3-requirements/github-autonomous-operations-requirements.md
pair_artifact: docs/test-design/helix/L7-branch-kind-authority-input.md
created: 2026-09-05
updated: 2026-09-05
---

# branch判定の入力契約

GH-FR-005／GH-AC-003／GH-NFR-001を具体化する設計候補。
PLAN種別・branch分類の意味は既存analyzerを維持し、入力取得だけを復旧する。
本書の追加は実装・受入・独立レビューの完了を意味しない。

## 共通snapshot

入力はrepository、candidate commit、base commit、branch identity、作業差分を含むかを保持する。
明示snapshotを優先する。providerから取得する場合も同じ型へ正規化し、解決元を保持する。
base未指定時に任意のremote名やfirst parentを選ばない。必要なauthorityが取得できなければunavailable。
両commitを実在するcommit objectへ解決し、差分計算に使用するmerge-baseもsnapshot内で一度確定する。
複数merge-base、到達不能、不正revision、観測中のHEAD変更は受理しない。

## 取得結果

- `available`: 同一snapshotからcommit差分とPLANを取得できた。
- `not_applicable`: 非Git consumerなど、明示した適用条件で対象外となった。理由を表示する。
- `unavailable`: 適用対象のauthority、Git操作、PLAN parse等を検証できなかった。正常へ変換しない。

一般的なGit失敗をnon-gitと同一視しない。権限拒否、corrupt repository、missing objectはunavailable。
detached HEADはbranch identityを外部snapshotで確定できる場合だけ評価し、`HEAD`をbranch種別にしない。

## 差分・PLAN読込

1. 確定したmerge-baseからcandidateまでのpathをNUL区切りで取得する。
2. 作業差分を含める場合はstaged／unstaged／untrackedを同じrepositoryから取得する。
3. renameは旧新path、deleteは削除事実を保持し、PLAN削除を読込エラーとして握り潰さない。
4. candidate-only検証ではPLANをcandidate objectから読む。作業差分検証では作業treeとの関係を明示する。
5. superseded_by-onlyの比較元も同じmerge-base objectから読む。fileがbaseに存在しないこととGit失敗を分ける。
6. pathを正規化して重複を除去し、unsafe pathを拒否する。Gitの表示用quote文字列をpathとして使わない。

新規PLANをstageした後に作業treeから削除すると、candidateと作業treeの比較だけでは
追加と削除が相殺される。path集合はindex差分を保持し、削除事実はcandidate比較と
index対作業tree比較の両方から取得する。この場合は取得不能ではなく、PLANなしとして
既存の`missing_plan`判定へ渡す。Gitが確認していない欠落は取得不能のまま拒否する。

## consumer境界

GitHub event adapterはPLAN-RECOVERY-98の確定規則を維持する。PRはbase/head SHA、
通常pushはbefore/head SHAを渡す。非PRでbeforeが空またはzeroの場合だけ、candidateの親を
Git objectとして解決してbaseへ渡す。PRのbase欠落や不正な明示baseをこの分岐で補わない。
これはevent種別に束縛した入力生成であり、loaderの暗黙fallbackではない。
guardとfinal doctorへ同じ規則を適用し、定期・手動実行をbase=candidateの空差分にしない。

`loadBranchKindInput`を共通入口とし、CLIによるpath再構成とbase PLANの独立再取得をなくす。
CLIから与えるchanged pathはsnapshotの実差分との一致を検証する。空の明示集合を未指定へ変換しない。
doctorとCLIは同じsnapshotで同じfindingを返す。取得不能は専用findingでhard failし、対象外は理由付き表示とする。
既存のPLAN必須、kind mismatch、Issue warningは変更しない。DB／Git／GitHubへのwriteは追加しない。

## 検証対応

### local入力供給の接合候補（未実装）

通常CLIのsnapshot引数がすべて未指定の場合だけ、PR contextを入力providerとして使用する。
一部指定・不正な明示値はproviderで補完しない。pure loader自体は外部APIへ接続しない。
CLI側の取得は読取専用・時間制限付きとし、同一repositoryのopen PR、head branch、
base/headの完全SHAを検証する。remote名からbaseを選ばず、PRのbase objectを使う。
取得前後のlocal HEAD／branchとPR headを照合し、未push、取得中変更、forkの取り違え、
不正応答、取得不能を拒否する。失敗応答の本文や認証情報は表示しない。

現在のghでは`pr view --json baseRefOid`が未対応であるため、PRのREST表現にある
`base.sha`／`head.sha`と双方のrepository identityを取得・検証する。実装では取得adapterを
注入可能とし、network不使用の反例と実Git fixtureを組み合わせる。

この候補だけではPR作成前・offlineの入力供給は解決しない。その場合は明示snapshotを使い、
全local経路が自動復旧したとは主張しない。未pushのlocal HEADをPR headへ書き換えたり、
不足をwarningへ降格して完了証拠を生成したりしない。

| U-ID | 対象 | 反例と期待結果 | test citation |
| --- | --- | --- | --- |
| U-BRAUTH-012 | PR入力provider | 同一repository／branch／HEADを照合し、取得中の変更とproviderによる入力改変を拒否する。CLI自動取得の証明には含めない | tests/branch-kind-authority-input.test.ts |
| U-BRAUTH-010 | merge-base一意性 | 実criss-cross履歴の2件のbaseを拒否し、単一baseは受理する | tests/branch-kind-authority-input.test.ts |
| U-BRAUTH-011 | snapshot整合 | diff取得直後の実HEAD変更を拒否する | tests/branch-kind-authority-input.test.ts |
| U-BRAUTH-001 | commit済みPLAN | clean treeでもcandidateのPLANを認識する | tests/branch-kind-authority-input.test.ts |
| U-BRAUTH-002 | 作業差分 | staged／unstaged／untrackedを欠落・重複なく取得する | tests/branch-kind-authority-input.test.ts |
| U-BRAUTH-003 | base identity | 存在しない明示baseを別baseで相殺しない | tests/branch-kind-authority-input.test.ts |
| U-BRAUTH-004 | 適用対象 | 明示non-git consumerとGit取得障害を分離し、Git管理下の対象外偽装を拒否する | tests/branch-kind-authority-input.test.ts |
| U-BRAUTH-005 | branch identity | 作業branchの偽装と未解決HEADを拒否し、明示detached snapshotは維持する | tests/branch-kind-authority-input.test.ts |
| U-BRAUTH-006 | PLAN削除 | Gitの削除事実を取得障害と混同せずmissing_planへ渡す | tests/branch-kind-authority-input.test.ts |
| U-BRAUTH-007 | supersession比較 | 同一base／candidateを使い、作業treeの本文変更をcommit済みmetadata-onlyへ混入させない | tests/branch-kind-authority-input.test.ts |
| U-BRAUTH-008 | CLI／doctor接合 | 同一snapshotの判定一致、changed集合偽装、不揃い入力の拒否を検証する | tests/branch-kind-authority-input.test.ts |
| U-BRAUTH-009 | CI入力供給 | workflow実体がeventに応じたbase／candidateを供給し、不正なPR baseを補完しない | tests/harness-check-workflow.test.ts |

`U-BRAUTH-001`はcleanなcommit済みPLANの認識、`U-BRAUTH-002`は作業差分union、
`U-BRAUTH-003`はbase exact束縛、`U-BRAUTH-004`は取得結果分類、`U-BRAUTH-005`はdetached／shallow、
`U-BRAUTH-006`はpath操作、`U-BRAUTH-007`はsupersession比較、`U-BRAUTH-008`はCLI／doctor同値を検証する。
各oracleを対になるL7設計と専用loaderテストへ束縛する。
既存`tests/branch-kind.test.ts`は分類契約の非退行検証として残す。
