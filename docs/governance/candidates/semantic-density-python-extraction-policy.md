---
title: "意味密度による旧実装Python core抽出方針"
status: draft_candidate
authority_status: awaiting_human_approval
created: 2026-09-15
product_owner: HELIX-HARNESS
execution_boundary_owner: HELIX-OS
---

# 意味密度による旧実装Python core抽出方針

## 方針

旧実装は実装言語やdirectoryで一括移植せず、処理の出力を支配する責務で分解する。入力からdomain意味を導く割合が高い
処理をPython semantic coreへ取り込み、外部状態を変更する割合が高い処理をNode／TypeScript transactional boundaryで
新規構成する。混在処理は意味関数と外部作用を分離してから取り込む。

## 判定軸

| 判定 | 特徴 | 新世代owner |
|---|---|---|
| semantic-dominant | 同じversioned inputから分類、正規化、差分、関係、影響、質問、義務、評価を決定論的に返す。外部writeなしで検証できる | Python semantic core |
| transactional-dominant | authorization、lease／fence、CAS、DB／Git／GitHub commit、queue、network、credential、filesystem、配布、監視を扱う | Node／TypeScript transactional boundary |
| mixed | 一つの関数・module・flowに意味判断と外部作用が共存する | semantic sliceをPythonへ抽出し、effect sliceをNodeで再構成 |
| historical-only | 旧authority、旧mode、旧CI、旧runtime stateへ意味が固定され、新要求へ適用できない | archive sourceのまま保持 |

「意味割合」は行数や言語比率では判定しない。次をbehavior atomごとに記録する。

- domain questionと出力意味。
- 入力schema、出力schema、determinism、invariant、failure、unknown。
- external read／write、credential、network、DB、Git、filesystem依存。
- 旧authority／mode／schemaへの結合。
- 新世代の親要求、対象product、unit／connection／composite、対oracle。
- 採択、再導出、置換、historical-onlyと理由。

## 旧実装から引き込む方法

1. 旧Requirement Engine、requirement authority、discovery、trace、impact、Design Template、semantic utilitiesをinventoryする。
2. fileではなくbehavior atomへ分け、semantic／transactional／mixed／historical-onlyを判定する。
3. semantic atomは入力・出力・不変条件・failure fixtureを保持してPython contractへ再導出する。
4. mixed atomは外部作用を切り離し、PythonへDB path、repository、credential、commandを渡さない形にする。
5. Node境界がPython出力を再検証し、許可、revision、lease、idempotencyを満たす場合だけcommitする。
6. 新要求から作ったoracleで評価し、旧test greenやbyte parityを完成条件にしない。

旧Python codeも無条件copyしない。新しいsemantic contract、dependency、license、security、resource boundaryに適合する場合だけ
再利用候補にできる。旧TypeScript codeは意味atomのsourceとして使えるが、TSであったことを新世代ownerの根拠にしない。

## 適用先

- 要求エンジン: 抽出、原子化、kind分類、relation、質問、semantic diff、impact。
- Design Template: applicability、設計義務生成、required input不足、backflow、semantic impact。
- 将来候補: review、文書生成、quality rule、trace、変更影響、意味評価。

本方針は旧runtimeの復活、実装開始、旧CI実行、Pythonへの外部write解放を認可しない。
