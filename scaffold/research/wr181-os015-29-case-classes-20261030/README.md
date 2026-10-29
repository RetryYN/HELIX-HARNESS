# WR181 OS015: 独立確認済み29件の複合class投影候補

この候補は `dd5787507a9ef3b69f411074e2fcbc7710ca1d62` を基点に、別途独立照合済みの29件だけをL4/L5で定義した2つの複合negative classへ結び、L8/L9へ順方向に投影する。L8/L9の既存期待は変更せず、L8からL9、L9から上流への生成も行わない。

## 上流からのclass形成

L5規則に従い、class IDはcanonical key object `{expected_classification, finding_codes, backflow_owner, expected_axis, expected_state, owner_ref:{kind,id}}` のUTF-8 SHA-256全64桁とした。可読名はIDに含めず、次表の説明列で示す。静的validatorも同じ正規化でdigestを再計算する。

L4 `failure_classifications` とL5 `failure_rules` に次の2 classを追加した。両方とも `HELIXOS-L3-015-F02` とL4の診断契約が定める原event保持・field比較を基礎とし、L4のfinding順・violation優先集約・condition値域を使う。L5側は `FN-OS015-01` の既存functionと入力境界を根拠に同じfield比較とreturnを定義した。unknown operand時のfinding pointerはunknown側operand、known conflict時はL4 algorithmどおりactual `records`側を指す。

| class | canonical class ID (SHA-256) | L4/L5 finding順 | 軸・状態・owner | 導出条件 |
|---|---|---|---|
| known conflict | `07c9fd844a293140f5dc77476ab8ed90116889361788956739abfdcf65b874c4` | `original_event_mutated`, `source_conflict` | `original_event`, `violation`, `management-authority-owner` | original_event全体が独立contextと異なり、比較対象fieldの両operandが既知値で不一致。 |
| unknown operand | `4e0c28b06920d3a9665cbe4beeaf48cea44d7b0d350dddfaec9c8471de1e86b5` | `original_event_mutated`, `source_unresolved` | `original_event`, `violation`, `management-authority-owner` | original_event全体が独立contextと異なり、比較対象fieldにunknown operandがある。 |

根拠pointerは各L4/L5 class rowの `source_pointers` に記録した。class形成にL8/L9の観測や期待は使っていない。L8/L9にはL4/L5 class rowとL7固定入力へのstructured source pointerを置いた。

## 29件の対応範囲

選択対象は `HELIXOS-L9-015-C0045`–`C0061` と `C0102`–`C0113`。各caseの固定刺激はL7 `given.input` のsingle replacementで、入力全体はL7 `fixture_inputs.inspect` から復元して記録済み `expanded_input_sha256` と照合する。各caseのfindingとclass assignmentは、上流L4仕様と固定刺激を別途独立に手作業照合して [`case-evidence.json`](case-evidence.json) に宣言した。具体的なstimulus path/value、L7 pointer、入力hash、finding pointer、class ID、L8/L9 case pointerが記録されている。L7 `expected_proposal`、L8 `expected`、L9 `expected` は参照していない。

L8/L9の既存ケース全583行を基点revisionから比較し、許可したlink field以外が全行一致することだけを不変性確認に用いる。L8に追加した `rule_ref` と `function_ref` は既存L5 ruleへ結ぶ。L8/L9のraw material refsはL7の `given.input` を指す。

29件の内訳はknown mismatch 15件、unknown operand 14件。C0044は先行手動reviewで `expected_proposal` を見ており独立導出範囲外のため除外した。未割当は112件で、その中にC0044を含む。L4/L5にある既存class keyのうち6個はL8/L9側の対応行が未形成のまま残る。check-childの全体結果はFAILであり、全coverage、negative PASS、freeze成立を主張しない。

## 静的照合の再実行

リポジトリrootで次を実行する。

```sh
python3 scaffold/research/wr181-os015-29-case-classes-20261030/validate_static_evidence.py
```

この静的validatorは、手作業で記録したcase assignmentsを入力から再生成・再判定せず、固定入力hash/pointer、宣言済みL4/L5 classとL8/L9 linkの構造対応、追加source pointer解決、L8/L9全583行の期待不変だけを確認する。L4 comparatorや製品動作は実行・再実装しない。既存checkerを変更せず、runtime・test・CIも実行しない。

## 検証結果

- 静的validatorは手作業宣言済み29件の入力hash/pointer、上流class keyとL8/L9 refs、期待不変を確認した。宣言件数はconflict 15件・unresolved 14件。L8/L9全583ケースで、class/material/rule/function link以外のcase内容は基点と完全一致した。source pointerはRFC 6901 resolverで解決した。
- `check-child` は編集前・候補・最新main trialともL4/L9 pairとL5/L8 pairがPASS。negative 4-wayは候補2 classと29割当が整合する一方、L4/L5=33 class、L8/L9=27 class、583 caseずつ、paired 460件、全体FAILを維持する。残余はL8に112 missing case refs（C0044を含む）と6 class keyのL8/L9各不在、計136 failure。
- 旧freeze `os007-os015-function-pair-freeze-2026-10-28.json` は変更前後とも `all_mechanical_matched=false`。CHK-PIN-SHA256はpinned inputなし、CHK-JSON-POINTERは67確認・2421失敗、CHK-NEG-4WAY-MATCHとCHK-L3-OBLIGATION-MAPはnot evaluated、public function freezeは8失敗。候補はfreezeを生成せず、旧freezeも変更しない。
- `scfctl validate`: bindings=162, fail=0。`scfctl stale`: stale=0。SCF-B-0170/0172のL4/L5 pinは現行候補shaを固定し、clean base `dd578...` のshaと根拠をnote/evidenceへ併記した。
- 最新GitHub mainは `821a655ad6949b2a7a5344b26e3c170cccc353a6`（`git ls-remote` とfetch後の `FETCH_HEAD` で照合）。dd578からの差分はWR154/WR171/WR184/WR185/OS security関連の別pathのみで、OS015対象層・checkerと重複しない。clean trialへ候補を3-way適用し、静的validator・check-child・scfctl validate/stale・`git diff --check` を実測。check-childの部分一致/FAILとscfctlの結果は候補worktreeと同じ。個別生出力は保持せず、実行コマンド・target revision・件数と結果を `verification-summary.json` に集約した。
- `git diff --check` は空出力で成功。既存CI、runtime、testは起動していない。

## pinと履歴の確認

pinは次の順に確定した。いずれも候補branchの祖先commitであり、記録したpathのblob SHA-256を `git show <revision>:<path>` で再照合する。

| 対象 | 確定commit | 対象pathのSHA-256 |
|---|---|---|
| L4・L9 | `cbb5d2d246ca4a18a0892759830e9bdc51538578` | L4 `01735cffe39ccb512d09cc53b69aed285c9c670cd6492a67826f8d4b408d6cd6`、L9 `3ecf720b12782b8b3ce35930b00bd255da8dc34a6d3eb2fd00fd0b459b914485` |
| L5のpair pin | `898cf3dfea2bed9c4592a0624e5cc5f32b713e37` | L5 `a9b79b4b718a841dacc44724feb40571c69544d16848fd147b554e4aabb5d7da` |
| L8のL5候補pin | `e321fa97b5edc2d4a2edc4555b31864a884d0476` 内のL8文書が、L5確定commit `898cf3df…` と上記L5 hashを指す | L8 `8661f4fe5e09586b5cf58b4d863632495576735bd842f710c3ca05a5a5fa07d2` |

最終静的validatorはL5/L8の `source_pair_pins`、L8の `candidate_l5_bytes` について、対象revision内のpath hashと現在HEADからの祖先到達性を検証する。旧 `reproduce.py` を含むcommitはclean branchの履歴へ含めず、入力から分類を再計算しない最終静的validatorだけを保持した。
