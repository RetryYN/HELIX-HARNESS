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
- binding内のどの欄でも（禁止事項の列挙を除く）`archive/legacy-generation-*`を指すbindingは不合格（SCF-OS-003）。
- 同じ役割を2つの非退役bindingが持つ場合、どちらかの`overlap_reason`に相手のidを記した根拠が無ければ不合格（SCF-OS-002）。
- bindingの入れ子を含むどの階層にも、schemaに無い欄（承認、受入、完了など）を持ち込めない（SCF-OS-007）。
- 置換確認は、bindingが宣言した役割・義務・接続・consumer・oracle・negative caseの全件が正式側へ対応づいた時だけ合格。1件でも未移管、二重owner、二重writer、二重CIがあれば不合格（SCF-HARNESS-005、SCF-OS-004）。
- `retire`は、置換確認の合格記録と、その記録を読み直したdigestが一致する時だけ遷移する（SCF-OS-005）。
- `residuals`は、置換完了後に残るbinding、退役済みなのにartifactが残るもの、差し替えIssueの無いものを列挙する（SCF-OS-006）。
- `scfctl`は`scaffold/`の外へ書かない。要求、設計、承認、受入、工程完了をどこにも生成しない（SCF-OS-007）。
- `kind`は`scaffold`だけを受け付け、`poc`／`research`／`feature`は別identityとして拒否する（SCF-HARNESS-006）。
- 自己検査の結果は証拠種別`scaffold`であり、`implemented`／`verified`／CI greenを意味しない（SCF-HARNESS-003／004）。

## 差し替え忘れを防ぐ仕組み

1. 全bindingは`replacement.issue`（差し替え台帳Issueの番号）を必須にする。無いものは`validate`で不合格。
2. `residuals`が、置換未完・撤去漏れ・Issue未記載を一覧する。`stale`の出力は**全PR**の本文に貼る（PR templateの項目）。bindingの`upstream[].path`が指すファイル（Markdownに限らずJSONL台帳等を含む）は`scaffold/`の外にあり、`scaffold/`に触れないPRでも変更されうる。変更したファイルが束縛対象かを作成側の認識に頼らず、読み取りだけの`stale`を条件なしに実行して検出する。`scaffold/`または正式実装に触れた時、および`stale`が1件以上を返した時は、`validate`／`residuals`／`selftest`の出力も貼る。`stale`が1件以上のPRは、そのPRで下記の確認つきの再束縛を行い`stale=0`にするまでmergeしない。`stale`はPRのhead時点の値であり、baseが進んだ後や別PRの上に積んだPRではmerge結果で変わりうるため、merge admissionを行う側が、その直前にbaseを更新した状態で`stale=0`を再確認し、結果をreview記録に残す（[GitHub上流運用モデル](../docs/governance/github-upstream-operating-model.md)の「作成側とレビュー対応側の責務」。PR classを問わない）。

   staleを解消するときは、digestを書き換える前に、上流の差分がbindingの依拠する記述を変えたかを確認する。確認の対象は`role`と`obligations`に限らず、`reason`、`verification`（`oracles`、`negative_cases`）、`replacement.role_target`を含むbinding全体である。変えていなければ`upstream`のdigestを現行へ再束縛する。変えていれば、bindingの該当fieldを見直してから再束縛する。digestだけを機械的に追随させない。
3. 正式な物が入ったPRは、対応するbindingを`replacing`にし、`check-replacement`の合格を証拠として付け、その後`retire`する。
   この順序を飛ばして`retired`にしたbindingは`validate`で不合格。

## L11受入候補とcaseの対応

候補のL11受入候補16項目を、`checks/cases/`のcase（38件）へ写している。対応が無い項目は「未検査」と書く。

| # | L11受入候補（要旨） | 要求 | case |
|---|---|---|---|
| 1 | 正式な設計が無い状態で、仮artifactから、担っている役割と上流のsource revisionへ辿れる。 | SCF-HARNESS-001、SCF-HARNESS-002、SCF-OS-001 | 01 |
| 2 | 上流を持たないScaffold、役割を宣言しないScaffoldの登録を拒否する。 | SCF-HARNESS-001、SCF-HARNESS-002 | 02a／02b／02c |
| 3 | 置換先の役割が未特定のScaffold Bindingを有効にしようとし、拒否する。具体的な正式artifactだけが未… | SCF-OS-001 | 03a／03b／03c |
| 4 | 仮実装だけがある要求を与え、`implemented`／`verified`と表示しない。 | SCF-HARNESS-003 | 04 |
| 5 | 仮の検証が成功し、正式CIが未実行の状態を与え、正式な結果をgreenやverifiedにしない。仮の検証結果が正式な検… | SCF-HARNESS-003、SCF-HARNESS-004、SCF-OS-003 | 04／17／17b |
| 6 | Scaffoldが宣言した一時契約の範囲外を仮の検証の対象にしようとし、拒否する。 | SCF-HARNESS-004 | 05 |
| 7 | 上流revisionを変更し、対応するScaffoldがstaleになる。ownerまたは上流を失ったScaffoldを… | SCF-OS-002 | 06／06b／06c |
| 8 | 正式な物を投入し、役割・義務・consumer・oracleのうち1件を未移管にした場合、置換完了を拒否する。 | SCF-HARNESS-005、SCF-OS-004 | 07／07b／07c |
| 9 | 付け替え対象のrevisionと証拠のrevisionが一致しない置換を与え、置換完了を拒否する。 | SCF-OS-004 | 08／08b／08c |
| 10 | 置換完了前のScaffold削除を拒否する。 | SCF-OS-005 | 09／09b |
| 11 | 置換の確認結果の読み直し（read-after）が無い、または読み直した結果が確認結果と一致しない状態で撤去済みへ遷移し… | SCF-OS-005 | 08c／08d／08e |
| 12 | 置換完了後にScaffold、仮adapter、仮CIを1件残し、残留として検出する。 | SCF-OS-006 | 10／10b |
| 13 | 1つのScaffoldを根拠なく2つの正式ownerへbindingし、拒否する。 | SCF-OS-002 | 11／11b／11c |
| 14 | 旧CIまたは旧runtimeを呼び出すScaffoldを登録し、拒否する。 | SCF-OS-003 | 12／12b／12c |
| 15 | PoCまたはResearchのticketをScaffoldとして登録する、あるいはScaffoldをPoCの成立性判断… | SCF-HARNESS-006 | 13／13b |
| 16 | Scaffoldの登録、検証成功、撤去のいずれかを入力として、要求の採否・人間承認・工程完了を生成しようとし、拒否する。 | SCF-OS-007 | 14／14b |

## しないこと

- 旧CI、旧runtime、旧DB、旧hookを呼ばない。`archive/`配下は読みもしない。
- GitHub workflowを置かない（新世代CIは未構築。仮の検証はlocal実行と`evidence/`の記録に留める）。
- このdirectoryの存在や自己検査の合格から、L2の採否、人間承認、L10／L11／L12の成立を生成しない。
