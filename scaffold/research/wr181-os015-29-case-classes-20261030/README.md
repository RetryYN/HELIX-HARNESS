# WR181 OS015: 独立確認済み29件の複合class投影候補

この候補は `dd5787507a9ef3b69f411074e2fcbc7710ca1d62` を基点に、別途独立照合済みの29件だけをL4/L5で定義した2つの複合negative classへ結び、L8/L9へ順方向に投影する。L8/L9の既存期待は変更せず、L8からL9、L9から上流への生成も行わない。

## 上流からのclass形成

L4 `failure_classifications` とL5 `failure_rules` に次の2 classを追加した。両方とも `HELIXOS-L3-015-F02` とL4の診断契約が定める原event保持・field比較を基礎とし、L4のfinding順・violation優先集約・condition値域を使う。L5側は `FN-OS015-01` の既存functionと入力境界を根拠に同じfield比較とreturnを定義した。unknown operand時のfinding pointerはunknown側operand、known conflict時はL4 algorithmどおりactual `records`側を指す。

| class ID | L4/L5 finding順 | 軸・状態・owner | 導出条件 |
|---|---|---|---|
| `OS015-NEG-composite-original_event_mutated-source_conflict-original_event` | `original_event_mutated`, `source_conflict` | `original_event`, `violation`, `management-authority-owner` | original_event全体が独立contextと異なり、比較対象fieldの両operandが既知値で不一致。 |
| `OS015-NEG-composite-original_event_mutated-source_unresolved-original_event` | `original_event_mutated`, `source_unresolved` | `original_event`, `violation`, `management-authority-owner` | original_event全体が独立contextと異なり、比較対象fieldにunknown operandがある。 |

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
- 最新GitHub mainは `1b91e01d30ab40b5023b06d72f1fd83039ce7590`（`git ls-remote` とfetch後の `FETCH_HEAD` で照合）。dd578からの差分はWR154/WR171/WR184/WR185/OS security関連の別pathのみで、OS015対象層・checkerと重複しない。clean trialへ候補を3-way適用し、静的validator・check-child・scfctl validate/stale・`git diff --check` を実測。check-childの部分一致/FAILとscfctlの結果は候補worktreeと同じ。証拠は `check-child-current-main-trial.json`、`static-evidence-validation.txt`、`scfctl-validate-current-main-trial.txt`、`scfctl-stale-current-main-trial.txt`。
- `git diff --check` は空出力で成功。既存CI、runtime、testは起動していない。

## pinと履歴の確認

pinは次の順に確定した。いずれも候補branchの祖先commitであり、記録したpathのblob SHA-256を `git show <revision>:<path>` で再照合する。

| 対象 | 確定commit | 対象pathのSHA-256 |
|---|---|---|
| L4・L9 | `746071b8f77cc0b07212dde2127f3d4d2c87f647` | L4 `0c9b85fe91483fcf2cf8630739e9a07b231d90aac20f42174d807268eddbda56`、L9 `66fd4c44b4dd0aec0e1419dbd885c26462bc6465838fd99ed653db8f86477a76` |
| L5のpair pin | `5111d246ce7945f1fa195ab5cdbab7cdc3f4ca78` | L5 `bd4bb190c608f6e6555c0a01b969ddc3b7f12617cef592b2fdba2f00d62e1ef7` |
| L8のL5候補pin | `db44bcc3396a37f9f3259dbc5f34cb809a3b2c58` 内のL8文書が、L5確定commit `5111d246…` と上記L5 hashを指す | — |

最終静的validatorはL5/L8の `source_pair_pins`、L8の `candidate_l5_bytes` について、対象revision内のpath hashと現在HEADからの祖先到達性を検証する。旧 `reproduce.py` を含むcommitはclean branchの履歴へ含めず、入力から分類を再計算しない最終静的validatorだけを保持した。
