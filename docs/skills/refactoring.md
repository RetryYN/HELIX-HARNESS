---
schema_version: skill.v1
name: refactoring
skill_type: process
applies_to:
  layers:
    - L4
    - L5
    - L6
    - L7
  drive_models:
    - Refactor
    - Forward
    - Add-feature
---

# refactoring（リファクタリング）

Refactor drive model（FR-L1-25）における behaviour-invariant な code improvement。
Refactor PLAN は externally observable behaviour を変えずに structure を変更する。
public API、`.helix/` state artefact、`harness.db` schema を変える変更は refactoring ではない。
Add-feature または Retrofit として route する。

## この skill を読む条件

- PLAN が `drive: Refactor` または `kind: refactor` を持つ。
- `helix review --uncommitted` finding が dead code、oversized function、
  cleanup すべき naming violation を指摘している。
- Add-feature PLAN に、observable behaviour を変えてはいけない internal cleanup step が含まれる。

## 開始前の scope check

1 行でも書く前に、次の質問へ答える。

1. 変更対象 code の **observable boundary** は何か。
   exported functions、CLI exit codes、`.helix/` に書く files、DB rows など。
2. 現在の test suite はすべての observable boundary behaviours を覆っているか。
   `bun run test` を実行して coverage を確認する。覆っていない場合は先に characterisation tests を書く
   （testing skill 参照）。regression fence の無い refactor は safety net の無い behaviour change である。
3. PLAN の `kind` value は `refactor` か。`kind=add-impl` がある場合、その PLAN は
   Reverse pairing obligation を持つため尊重する。

## Refactor cycle（refactor 手順）

### Step 1 — regression fence を作る

`bun run test` を実行し、baseline pass count を記録する。refactor scope 内に `.skip` または `.todo` の
test がある場合は、un-skip するか、それを扱う PLAN を起票する。fence が complete かつ Green の場合だけ進む。

### Step 2 — structural change を 1 つだけ行う

各 commit は structural change を 1 つだけ含む。function rename、helper extraction、
equivalent branches の collapse、dead code removal など。各 change 後に full gate sequence を実行する。

```
bun run typecheck && bun run lint && bun run test && helix doctor
```

いずれかの gate が Red になった場合は、進む前に最後の change を戻す。
Red gate をまたいで複数 structural changes を蓄積しない。

### Step 3 — behaviour invariance を確認する

- `bun run test` が baseline と同じ Green tests 数で pass する
  （refactor 中は tests を追加・削除しない。追加・削除は後続 Add-feature または TDD work で行う）。
- `helix doctor` exits 0.
- refactor が public export signature に触れる場合、`helix review --uncommitted` を実行し、
  downstream breakage が無いことを確認する。

### Step 4 — design docs を更新する

refactor が module structure（file rename、新 module extraction）を変える場合は、
paired L5 design doc と L6 test design doc を新 structure に合わせて更新する。
refactor 後に paired design doc の無い source file が残る場合、それは descent obligation gap である。

## kind=refactor PLAN の checklist

- [ ] 最初の structural commit 前に regression fence が Green。
- [ ] 各 commit が structural change を 1 つだけ含む。
- [ ] `bun run typecheck && bun run lint && bun run test && helix doctor` green
      after every commit.
- [ ] new exported API surface を追加していない
      （追加する場合は Add-feature routing が必要）。
- [ ] `.helix/` state schema または `harness.db` schema を変更していない。
- [ ] L5/L6 design docs が new structure に合わせて更新されている。
- [ ] PLAN `review_evidence` が trace-freeze SHA を記録している。
- [ ] `helix review --uncommitted` に blocking findings が無い。

## Anti-patterns（避けるパターン）

- 同じ commit で refactor と feature addition を混ぜる。
  これは separate concerns であり review obligations も別。混ぜると regression fence が invalidated になる。
- coverage 改善のために refactor 中に tests を追加する。
  これは refactor step ではなく TDD step。別の Add-feature または Reverse PLAN へ route する。
- passing `helix doctor` を behaviour invariance の証明として扱う。
  doctor は structural governance を確認するが、observable output correctness は確認しない。
- callers と design docs を更新せずに public CLI flag または `.helix/` field を rename する。
  これは breaking API change であり、refactor ではない。
