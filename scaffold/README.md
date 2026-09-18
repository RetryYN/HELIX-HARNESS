# scaffold／ — 仮設束縛（Scaffold Binding）の仮組み

status: scaffold（仮組み。正式な設計・実装・検証ではない）
authority_effect: none
upstream: [仮設束縛の上流要求候補](../docs/governance/candidates/scaffold-binding-requirements.md)（SCF-HARNESS-001〜006、SCF-OS-001〜007）
replacement_issue: GitHub Issue #1866（仮組み→本実装差し替え台帳。作業projectionであり正本ではない）

## これは何か

建物を建てる前に組む足場である。正式なHELIX-OSのScaffold Bindingのlifecycle実装（L3／L10から導出する）が
できるまでの間、「仮の物が、何の役割を、何の代わりに、いつまで担うか」を記録し、機械で検査できるようにする。

このdirectory自体が仮の物である。したがって、この機構自身も1件のScaffold Bindingとして
[`bindings/SCF-B-0001.json`](bindings/SCF-B-0001.json)に登録し、正式な物ができたら同じ手順で置換・撤去する。

## 構成

| path | 役割 | 書き込むもの |
|---|---|---|
| `bindings/*.json` | Scaffold Bindingの記録。1 file 1 binding | 人が編集する。`scfctl`は`retire`以外で書き込まない |
| `schema/binding.schema.json` | bindingの形式（JSON Schema draft 2020-12の語彙の一部。検査は`scfctl`が標準libraryだけで行う） | 変更はrevisionを上げる |
| `tools/scfctl.py` | 検査・一覧・置換確認・残留検出・撤去遷移・自己検査 | `scaffold/`配下だけ。`retire`はbinding fileのstateだけを書く |
| `checks/cases/*.json` | L11受入候補を写した否定例・肯定例 | 追加は候補のL11項目と対応づける |
| `evidence/` | 自己検査の結果（証拠種別`scaffold`）。正式な検証結果と混ぜない | `scfctl selftest --record`だけが書く |

## 使い方

```
python3 scaffold/tools/scfctl.py validate            # 全bindingを検査（形式、上流、役割、状態、二重binding、旧資産参照）
python3 scaffold/tools/scfctl.py list                 # 一覧（id、state、役割、置換先、差し替えIssue）
python3 scaffold/tools/scfctl.py stale                # 上流revisionの変化を検出してstale候補を出す
python3 scaffold/tools/scfctl.py residuals            # 置換完了後に残っている仮の物、差し替え未完の一覧
python3 scaffold/tools/scfctl.py check-replacement ID # 置換の無損失確認（役割・義務・接続・consumer・oracle・negative case）
python3 scaffold/tools/scfctl.py retire ID            # 置換確認とread-afterが揃った時だけretiredへ遷移
python3 scaffold/tools/scfctl.py selftest [--record]  # checks/cases を実行。--recordでevidence/へ結果を書く
```

終了codeは、合格0、不合格1、入力不正2である。

## 守ること（要求候補との対応）

- 上流（path＋revision）と役割を持たないbindingは`validate`で不合格（SCF-HARNESS-001／002）。
- `active`にできるのは置換先の役割（`replacement.role_target`）が特定済みのものだけ。正式artifactの具体pathは未決でよい（SCF-OS-001）。
- 状態は`registered`／`active`／`stale`／`conflict`／`orphan`／`replacing`／`retired`（SCF-OS-002）。
- artifactやcommandが`archive/legacy-generation-*`を指すbindingは不合格（SCF-OS-003）。
- 置換確認は、bindingが宣言した役割・義務・接続・consumer・oracle・negative caseの全件が正式側へ対応づいた時だけ合格。1件でも未移管、二重owner、二重writer、二重CIがあれば不合格（SCF-HARNESS-005、SCF-OS-004）。
- `retire`は、置換確認の合格記録と、その記録を読み直したdigestが一致する時だけ遷移する（SCF-OS-005）。
- `residuals`は、置換完了後に残るbinding、退役済みなのにartifactが残るもの、差し替えIssueの無いものを列挙する（SCF-OS-006）。
- `scfctl`は`scaffold/`の外へ書かない。要求、設計、承認、受入、工程完了をどこにも生成しない（SCF-OS-007）。
- `kind`は`scaffold`だけを受け付け、`poc`／`research`／`feature`は別identityとして拒否する（SCF-HARNESS-006）。
- 自己検査の結果は証拠種別`scaffold`であり、`implemented`／`verified`／CI greenを意味しない（SCF-HARNESS-003／004）。

## 差し替え忘れを防ぐ仕組み

1. 全bindingは`replacement.issue`（差し替え台帳Issueの番号）を必須にする。無いものは`validate`で不合格。
2. `residuals`が、置換未完・撤去漏れ・Issue未記載を一覧する。PRで`scaffold/`または正式実装に触れた時はこの出力をPR本文に貼る（PR templateの項目）。
3. 正式な物が入ったPRは、対応するbindingを`replacing`にし、`check-replacement`の合格を証拠として付け、その後`retire`する。
   この順序を飛ばして`retired`にしたbindingは`validate`で不合格。

## しないこと

- 旧CI、旧runtime、旧DB、旧hookを呼ばない。`archive/`配下は読みもしない。
- GitHub workflowを置かない（新世代CIは未構築。仮の検証はlocal実行と`evidence/`の記録に留める）。
- このdirectoryの存在や自己検査の合格から、L2の採否、人間承認、L10／L11／L12の成立を生成しない。
