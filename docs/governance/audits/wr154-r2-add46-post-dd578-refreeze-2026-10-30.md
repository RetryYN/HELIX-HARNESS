# WR154-R2 ADD-46再適用とdd578限定refreeze候補

## 基点と対象差分

GitHub APIと`git ls-remote origin refs/heads/main`の両方でmainを確認し、`dd5787507a9ef3b69f411074e2fcbc7710ca1d62`を基点にした。#3896 merge commitはその祖先である。前回基点からの差分はOS015関連に限られ、L4/L5/L8/L9の対象設計・検証文書、SCF-B-0168/0169、10/30旧refreeze recordには変更がなかった。

最新main上の旧refreezeはcheck-freeze PASS、L8 SHAは`75e5aa65453f1812f7b5decafcdab823b49783e03014f18b68c97b4e06386efd`。旧recordを変更せず保持し、clean main worktreeから候補を再適用した。

## ADD-46候補

`HARNESS-L8-009-ADD-46`に固定writer leaf一件を追加した。入力刺激は過去L8 fixture `c9fcb23c010ede88c528c4959929b8bdfedb730e` の`#/fixture_contract/normal_fixtures/0/input`から選び、source collectionを空に固定する。期待値はL4/L5のwriter条件と型から生成し、L9期待を生成元に使わない。

L8 SHAは`d6b802563c312a272e89f7482e73d874ded32ec0ab4d0237748629d4fb989df7`。追加case件数は54のまま、ADD-46は`not_executed`。これはRecordOccurrence writer leafの候補であり、F05全体返却、producer実行、U-ID、L9対応を示さない。再生成scriptは[build_wr154_r2_add46_fixed_writer_case.py](build_wr154_r2_add46_fixed_writer_case.py)。既存source_basis 7件、expectation_basis 4件、過去fixture pointer 1件の計12件がすべて解決した。

## 限定refreeze候補

新しい[限定refreeze record](tdd/h009-fn5-axis-cause-pointer-crosswalk-add46-refreeze-2026-10-30.json)はdd578を`source_main`と`request_base_sha`にし、変更aliasをL8だけに限定する。L8 pre pinは旧mainの`75e5aa…`、post pinはADD-46後の`d6b802…`。記録時刻は`2026-10-29T18:10:07+00:00`、freeze影響の再計算時刻は`2026-10-29T18:10:16+00:00`。

次の3条件は維持した。

1. DT-VT-105に沿い、L3/L10とL4/L9からO2期待を独立に導き、L5/L8 native shapeを対応照合する。
2. O2の2枝をL8 U-ID #26/27へ対応させ、どちらも`not_executed`・独立review pendingのまま保つ。
3. private detail reentry `D-H009-T3b`を別sliceに保つ。

ADD-46は同一L8文書内の別候補だがこのO2 sliceのclosure対象外であり、refreezeのcase数へ加えていない。新recordは`authority_effect: none`。旧10/29 freezeと旧10/30 refreezeは編集していない。refreeze再生成scriptは[build_wr154_add46_limited_refreeze.py](build_wr154_add46_limited_refreeze.py)。

## 関連freezeとchecker結果

dd578 main上のfreeze/refreeze recordから、名称にfreeze/refreezeを含み、L5/L8/L9文書の完全pathを本文に持つ35件を選んで同じ集合を前後比較した。mainは3/35 matched、候補は2/35 matched。唯一のBoolean遷移は旧10/30 refreezeのtrue→false。旧recordのL8 post pinだけが候補L8と異なる。10/29 axis freezeはmain・候補ともFAILでpin不一致2件、source-content candidateも両方FAILでpin不一致3件だった。

35件のraw reportはmainが621,838 bytes / SHA-256 `65ec803f7931cc326bd5fe6ce03a8fb0db27f0df12abaa62f01559256afec477`、候補が622,995 bytes / SHA-256 `86ecca024888c5c8edd7c712c44e100402d1400f491cd1da95259fee6e93623e`。25件のrow object差分はBoolean遷移1件とは別の数え方である。

- `check-child`: PASS。pair各11対11、negative各層107件・一致107、ownership capすべてPASS。
- 新限定refreezeの`check-freeze`: PASS。pin、pointer、entity count、verification fieldが一致。
- 旧10/30 refreezeの`check-freeze`: L8 post pinのみ不一致。他のpointer/count/verificationは一致。
- SCF-B-0168/0169のL8 pinを更新。`scfctl validate`: 161 bindingで失敗0、`stale`: 0。
- `git diff HEAD --check`とJSON parseは合格。旧10/30 refreezeの本文はbaseと同一。

## 再現

候補worktree rootから実行し、`--base-root`にはdd578 clean checkoutの相対pathを渡す。

```sh
python3 docs/governance/audits/build_wr154_r2_add46_fixed_writer_case.py \
  --root . \
  --output docs/helix-harness/L8-unit-verification/product-template-application.json
python3 docs/governance/audits/build_wr154_add46_limited_refreeze.py \
  --root . \
  --base-root ../<dd578-clean-worktree> \
  --base-revision dd5787507a9ef3b69f411074e2fcbc7710ca1d62 \
  --recorded-at-utc 2026-10-29T18:10:07+00:00 \
  --recomputed-at-utc 2026-10-29T18:10:16+00:00
python3 scaffold/tools/design_verification_checker.py check-child --root . \
  --l4 docs/helix-harness/L4-basic-design/product-template-application.json \
  --l9 docs/helix-harness/L9-integration-verification/product-template-application.json \
  --l5 docs/helix-harness/L5-detail-design/product-template-application.json \
  --l8 docs/helix-harness/L8-unit-verification/product-template-application.json
python3 scaffold/tools/design_verification_checker.py check-freeze --root . --worktree \
  docs/governance/audits/tdd/h009-fn5-axis-cause-pointer-crosswalk-add46-refreeze-2026-10-30.json
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
```

候補branchはdd578を基点にし、commit `1ae1bb27a97364ba913c3226ed00bb462c80d5b7` に記録した。pushはしていない。ADD-46の実行、fixture全体、producer、L9期待、独立意味review、pair freezeは未成立。
