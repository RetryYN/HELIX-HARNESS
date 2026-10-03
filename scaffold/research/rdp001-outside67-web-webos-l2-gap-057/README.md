# outside67 Web／Web-OS L2要求 source gap research（Scaffold）

この束は `MPR-SH-OUTSIDE67-001` の67 `path_revision_pair`から、HELIX-Webの `OUTSIDE67-PATH-011` とHELIX-Web-OSの `OUTSIDE67-PATH-008` を各1件だけ選んだ静的研究候補です。分母67、現行live source holding 14件、今回選択2件、未調査65件を固定します。path／blobは要求そのものではありません。

pre-isolation revision `2d4991042be55268bac30a8bbcdac45b3865030a` とarchive revision `064280b5c1c5c98f949e6e3be5ef87cbe4a4b658`をGit objectのread-only参照で読みました。Web文書はline 17のVision link pathだけが変化し、Web-OS文書はbyte-identicalです。この差分の意味同値、要求採否、authorityは判断していません。旧archiveのruntime／test／CI／hook／adapterは実行していません。

`semantic-atoms.jsonl` は選択した要求行を122候補（atomized candidate 109件、`composite_unresolved` 13件）へ分けて原文lineへ束縛します。同一source lineから複数のunit／connection／constraintを作る場合も、line coverageは一回だけ数え、各候補に逐語`source_fragment`を付けます。frontmatter、表関係、複数責務、未分割境界は `composite_unresolved` としてatomized完了数から除外しました。fragment自身に述語がある候補はdirect source supportとして保持し、fragmentが同一行の列挙語である場合は、`inherited_predicate`に同一行のexact text／character position／pre-isolation・archive spanを付けてfragment＋述語をsource-supportedへ復元します。今回の復元は109件全件（action direct 40、action inherited 53、condition direct 21、condition inherited 16）です。actor／sequenceや最終ownerを確定しない文脈は`candidate_inference`へ残し、行全体にない生成guardは削除します。原文fragment自身の明示的否定、またはexact inherited predicateで組み立てた否定だけをsource-supported conditionへ保持します。候補productは四製品（HELIX-HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OS）を分母に残し、旧／現行implementation・旧／現行degradation・failure・consumer・decision・phase authorityはunknownです。

J01再検収として、各atomの`normalized_statement`、`retained_meaning`、`unresolved_questions`、`diff_observation`を独立recordへ固定し、それぞれのkeyset・status・source referenceをvalidatorで検査します。regular atomと`composite_unresolved`は別の全keysetを持ち、未知keyは拒否します。inventoryの`findings`（F）、`unresolved_questions`（Q）、`prohibited_inference`（P）もid／status／textの固定record配列として扱い、順序とstatusを検査します。

この研究束はcurrent requirement、successor、正式source、L2／L11合意、L3／L10設計、実装、受入、release、deploymentを生成しません。bindingは `SCF-B-0057` とし、0057以降に同IDが存在しないことを確認して登録します。

## 検証

```text
python3 scaffold/rdp001-outside67-web-webos-l2-gap-057/validate.py
python3 scaffold/rdp001-outside67-web-webos-l2-gap-057/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

validatorは別processでGit object、holding、revision snapshot、line coverage、atom keyset／固定意味欄、inventory固定catalog、fragmentとinherited predicateの同一行span／position、source provenanceの逐語支持と推論分離を再計算します。exact PR HEADについては、記録した`base_origin_main`がHEADの祖先であることだけを検査し、live `origin/main`との一致を要求しません。selfcheckはbaselineに加え、denominator／digest／span／inherited predicate／product／phase／implementation／degradation／failure／consumer／decision／authority／successor／旧実行／semantic fieldへの推論混入／guard inferenceの残留／candidate inference分離違反／固定keyset改変のnegative caseを期待error code付きで確認します。
