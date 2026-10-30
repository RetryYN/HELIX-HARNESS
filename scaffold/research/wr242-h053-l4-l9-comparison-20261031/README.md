# WR242 H053 L4/L9 比較証拠

status: scaffold（比較・review訂正証拠。authority_effectはnone）

authority_effect: none

## 固定された証拠

- 比較base: `dd07a3498be74f32519adf42a221caf51e547ea1`
- 比較前source-only artifact: [`blind-source-only.json`](blind-source-only.json)
- 固定SHA-256: `5e69cd0c3c472090947fec9454d892ffa2caa24ed0aa2a1b2540f7d9c18f408b`
- 固定記録: [#3510 comment 6534090409](https://github.com/RetryYN/HELIX-HARNESS/issues/3510#issuecomment-6534090409)
- 比較記録（時点固定）: [`comparison.json`](comparison.json), SHA-256 `ee245db3d4dab87aea212c6fe2f5f44f00f34fbfcd35faebb63fdd5fe88aa437`
- 検証記録（時点固定）: [`verification-summary.json`](verification-summary.json), SHA-256 `a025836db3757b3dded20ff6407a73064d18ac515b20922122c232c95ae6ffb9`
- PR #3983 R1訂正追補: [`review-r1-addendum.json`](review-r1-addendum.json)
- Scaffold Binding: `SCF-B-0203`

固定source-only artifact、当初comparison、当初verification-summaryは追補後もbyte単位で変更していない。追補はcomparisonの一部結論を明示的に撤回し、同じ時点の記録を上書きせずに訂正根拠を追加する。

## R1訂正

R1指摘に従い、当初の `l4_l9_class_migration: not feasible` という結論を撤回する。固定blind artifactがkeyをassertしなかった事実は、設計値が定められないことの証明ではない。訂正後の結論は「この比較証拠PRではexplicit class migrationを実施しなかった」であり、casewise設計または後続migrationが不可能とは述べない。

HARNESS011の先例である [PR #3955](https://github.com/RetryYN/HELIX-HARNESS/pull/3955) はL4/L9の38 casewise negative rowを既存case参照に沿って整合し、[PR #3968](https://github.com/RetryYN/HELIX-HARNESS/pull/3968) は続いてL5/L8の38行をcasewiseで整合した。どちらも4層の明示equivalence-class markerを前提にしていない。

H053でもL4の38 `failure_classifications` rowはL9 negative caseへ38/38一意に結び付く。既存rowのcode、L4 `conditions[]` とL9 `change`、backflow owner、record axes、claim/operation/reference state、副作用数はそれぞれ38/38一致する。これは既存casewise対応であり、formal class membershipの宣言ではない。

base checkerのnegative_4wayには76 failureがあり、内訳は `change_or_condition` 38件と `expected` 38件だった。`change_or_condition` ではL4の条件がplural `conditions[]` にあり、L5 ruleにはsingular `condition`/`change` がないためcase行値を解決できない。`expected` ではL4の一般的な `effect` は存在するがcase-specificなL8/L9 `expected` と異なり、L5 ruleに `expected`/`effect` はない。これは具体的なcasewise投影差分であり、casewise設計が不可能という根拠ではない。PR-Aではそれらの投影を行わず、別依頼に分ける。

QA §3の `expected_axis` は非空string、または順序付き非空string配列を許す。したがってstring一つに限るという当初の記述は訂正する。現行L4は `expected_record_axes` に複数のstructured observationを持ち、claim/operation stateも別々に記録する。このPRではQA class-key fieldへのprojectionを行わないが、配列形状を阻害理由とはしない。

## Checkerとbindingの時点管理

当初baselineはbase `dd07a349` のchecker SHA-256 `cfd12c5bc4a1dd45351858488b476af0025d35deca7027da35bb1373818b129d` で測定した。PR #3982 のmerge `2684816ad6179cc3535e4a6c297e61d10fd75ca0` でcheckerは `contract.function_refs` を扱う更新を受けた。最新main `216c22400e2823eff6126982a44459b4a938fe70` のchecker SHA-256は `e751526d67cd8df11e5aac1c5a1a178dfbd0fecc3f2ed21f995b7dda11ea4d5d`。この更新はexplicit-mode owner解決に関わり、legacy casewise branchは変更されていない。

Checkerとfixed blindのSHAは検証証拠でありupstream inputではないため、`SCF-B-0203` の `upstream[].path` から外し、`verification.oracles`へ時点付きで記録した。upstreamには `scaffold/` 外の入力文書だけを残す。

`dd07a349` と最新mainのmerge treeは `c540e17453c0eec9f4fdf62c4cf5d0403d2cb502` で、merge-tree検査ではconflict 0。最新main上へscaffold成果を重ねた検証の実測は追補artifactとvalidator出力に記録する。

## 静的確認

```sh
python3 scaffold/research/wr242-h053-l4-l9-comparison-20261031/validate_comparison.py
```

validatorはread-onlyで、固定blind・比較・baseline summaryのSHA、32 leafのpointer/hash、38行のL4/L9/candidate追跡、R1訂正内容、checker時点hashを確かめる。historical `comparison.json`と`verification-summary.json`を書き換えない。L4 algorithm、runtime、test、CI、旧runtimeは起動しない。

## Scope

このPRは比較・review訂正証拠のみで、L4/L9のcasewise projectionやformal explicit migrationを実施しない。L5/L8は後続PR-Bの対象とする。各設計変更は別の依頼と根拠に基づいて進める。
