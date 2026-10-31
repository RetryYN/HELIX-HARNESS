# WR255 SEC009 L4/L9 独立投影とoverlay証拠

このディレクトリはL4/L9用の独立V-pair補足を記録するscaffold evidenceです。L5/L8候補は `overlay/` に固定した読み取り用snapshotとしてだけ含め、L5/L8正式文書やWR255 L5/L8用bindingを変更しません。正式化、authority、実動作を生みません。

## 投影規則と285行照合

`validate_l4_l9_supplement.py` はbase revision `c14adddf2678c7a69d76420c451df3f05b1251ab` のL9 case source pointerを起点に、現在のL4 `failure_classifications` を参照してnegative 277行の `condition`、`expected`、`expected_preserved` を構成します。L9の `expected_proposal` は入力にも期待値にも使いません。case IDとL4 class pointer、L9 source pointer、givenのSHA-256、各期待値のSHA-256を `overlay-summary.json` に行単位で保存します。

positive 8行はcanonical L9のnested givenにcase固有入力がなく、共通 `evidence_limit` だけです。期待3項目は `null` のままです。`positive-source-review.json` は各行のL9 pointerとL3/L10/L4の契約レベル根拠、そこから導ける最小の条件付き意味、ケース固有値が欠けているため未確定な点を分離して記録します。L10 oracleは契約単位のoracleであり、個別行のoracle IDやtest citationは確認できないため追加していません。

285行すべてについて、入力pointerとgivenの内容を照合し、negativeの期待は対応するL4 classから行別に導出できるかを検査します。負のgivenは全行が `evidence_limit` のみで同じhashとなり、行固有の対象値・実際値・差分を裏付けません。したがって、case-specific事実として値を補っていません。既存L9 case ID、L4 class割当、L9 expected proposal、multi-contract residualは保持します。

## checkerとpair境界

`overlay-check-child.json` はcanonical L4/L9とL5/L8 branchの固定snapshotを使った現在checkerの静的照合結果です。L4/L9 pairとL5/L8 pairは各々checker上成立し、negative 277件がmatched、4way negative failureは0件です。positive 8件は個別行の根拠が揃わず未成立です。この結果は形式検証やsecurity behaviorの証拠ではなく、4wayの完了主張にも使いません。

元のbase時点check-child報告ではfailure 2,235件でした。内訳は、L8/L9間case属性差847（expected 285、expected_preserved 285、condition 277）、missing condition/expected/expected_preserved 各285、observation欠落277、class key missing/unexpected各128です。うち277件の `function_ref` unresolvedはL8候補のL5 function参照追加で解消しました。修正後overlay結果は上記の通り別ファイルに記録しています。

## L4 nested pointer consumer監査

`pointer-consumer-audit.json` はL8とcanonical L9それぞれについて、L4のnested `negative_classifications` を指す直接pointer 308件、full-path wrapper 275件、計583文字列出現を個別に記録します。直接pointerの31 unique targetは30個の行targetとcollection 1件です。30行targetはclass IDでL4 top-level classへ一意に対応し、明示aliasで比較した意味フィールドは値・型が一致します。一方、`code` はnested側でclass identity、top-level側でexpected outcomeの意味を持ち、`change`/`axis`/`state`等にも別名があり、`expected_text` は同名同値のtop-level fieldがありません。よって既存consumerをraw pointer置換だけで安全に移行できるとは確認できません。

collection pointerについては旧候補IDの順序付き一覧までは対応づけましたが、曖昧なcaseを割り当てず新しいcomposite classを含めない集合を直接指すRFC6901 pointerはありません。各consumerの明示的な移行先、field mapping、再照合が未完了です。SCF-B-0209の `check-replacement` は `E_REPL: transfer（対応表）が無い` で失敗し、retire条件未成立のためpendingを維持します。

## 再実行

```sh
python3 scaffold/research/wr255-sec009-l4l9-supplement-20261101/validate_l4_l9_supplement.py
python3 -B scaffold/tools/scfctl.py validate
python3 -B scaffold/tools/scfctl.py stale
python3 -m json.tool docs/helix-security/L9-integration-verification/revoke-quarantine-propagation.json >/dev/null
git diff --check
```

checker、scfctl、JSON構文、diffの静的確認のみを行い、旧runtime/test/CIまたはL4 algorithmは実行しません。
