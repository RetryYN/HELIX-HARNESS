# HARNESS Stage 3 親046 BV/FV同一CASE ID inventory（m20）

- 記録種別: 時点監査。`authority_effect: none`、`decision_effect: none`。
- 対象: HARNESS Stage 3 親046だけ。L10要件本文は変更していない。commit/pushなし。
- 基点: latest main `4fdcd449fac8ffbc7c6ab18654b355497be07b91`。
- 起点となったreview: [#2655 review05 / comment 6041633885](https://github.com/RetryYN/HELIX-HARNESS/pull/2655#issuecomment-6041633885)。raw bodyはUTF-8 4193 bytes、SHA-256 `1d9547637296f14c7bd5c62489626849fd400046c358a0b349de93a6b13e6480`。同commentのm20は、Stage5範囲外の親044/046についてBV/FV双方に同じCASE IDが現れる点を別途確認するよう求める。本記録ではそのうち親046の3組を照合する。Stage5の判断やapproval状態は対象にしない。
- 固定親: L2 `318ec4a04abb3c1cc17111b3d939f913facd5fd3` `product-requirements.md:1025–1035` span SHA-256 `47cc23b066cc970427a8b9193eda3be9cc06a43f19b7cb03e6f78a0116d6e01e`、L11同revision `product-acceptance.md:759–771` span SHA-256 `a8e99f7df7166566c04b1113b045851d8417e17e8078c034f8f2a34ebfe4f37f`。PO decision revision `17a2f310358ee7fe209b9d37cddf4a927c740248`, line 51: HARNESS-L2-046採択、registration `MPR-RC-HARNESS-L2-046-001`。
- 旧source: `LEGACY-ASSET-02319C2481B9E01698D5`, 旧revision `3fd20391`, `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md` full SHA-256 `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`。L259 S1/S2の行SHA (LFなし) `e4c0f143df26e2777e66ada84e1903a154519b42e9732eaa6f06f9d09c849db6`、L647 summary行SHA `6c616a3fb85f5affae79a701b3ac2accf0975373d3540e8738bdd2b3c0a9d41e`。companion 6fabd125は`17a2f310358ee7fe209b9d37cddf4a927c740248`の`docs/governance/requirements-source/helix-requirements-v1.3-baseline-6fabd125.txt` SHA-256 `1eecfe3cbbbf1c61956b23ddbd2f28a5146233d0d0be15fddd8098998ed097e1`。不変review12記録も、L259に独立するFull V/Scrum条件2件、L647は重複要約で第三条件ではないと固定している。

| CASE ID | BV親046 | FV一次定義 | AC | 意味の照合 |
|---|---:|---:|---|---|
| `CASE-HARNESS-L10-046-r12-fullv-normal` | BV:149 | FV:2347 | `AC-HARNESS-L3-046-01` | Full V正常。BVの入力・観測はFV一次定義と同一scopeを要約し、別のfixture変異は追加していない。各raw行SHAはJSONに記録。 |
| `CASE-HARNESS-L10-046-r12-scrum-normal` | BV:150 | FV:2353 | `AC-HARNESS-L3-046-02` | Scrum正常。BVの入力・観測はFV一次定義と同一scopeを要約し、別のfixture変異は追加していない。各raw行SHAはJSONに記録。 |
| `CASE-HARNESS-L10-046-r12-fullv-no-scrum` | BV:151 | FV:2348 | `AC-HARNESS-L3-046-01` | Full V no-Scrum。BVの入力・観測はFV一次定義と同一scopeを要約し、別のfixture変異は追加していない。各raw行SHAはJSONに記録。 |

現在のmain本文SHA-256はBV `864b0034aa84c4e9b29ec2ebb7bf2151a97dfdca0028c85ba2e0cee655d965ad`、FV `191dcb11cb400c10516e2a437314ffea60de97cb7432091ff6ee47f964640e9a`。各CASE IDはBVの一行とFVの一次定義一行に対応し、FVの親046-02行（FV:2300）は明示的にindex-onlyとして別に記述される。したがって、この範囲の一次fixture identityは3件であり、BV/FV表の記載行を単純加算して6件にしない。

FV側はindexと一次定義を区別する一方、BV親046の見出し・直前説明には同一IDのFV一次CASE参照であること、BVでは再定義しないこと、重複計上しないことの明記がない。親044では同趣旨の参照/no-redefinition/no-double-count注記が明示されており、その点が親046の不足を示す比較証拠となる。よってID実体は同じfixture参照と判断できるが、表を集計する人向けの母数表現は親046で不足している。

推奨最小修正（本文は未編集）: BV親046 table直前へ次の一文を加える。

> 以下3行は、同一CASE IDのFV一次CASE定義を業務観点から参照する。入力・変異・oracleはFV定義に従い、BV行で再定義せず独立fixtureとして重複計上しない。

この修正案はケースの意味・期待結果・承認状態を変えず、母数の読み違いだけを防ぐ。集計範囲の全件数は本inventoryから推定しない。

検証: exact main revisionのBV/FV全文を読んで全文SHAを固定し、3組のcase行bytes/SHAを個別に固定。固定L2/L11 span、PO採択行、旧source所在と既存review12のsource pinsを照合。FV index-only記述を確認。変更は本監査MD/JSONだけで、要件本文の差分なし。全raw pins・formal bodyは隣接JSONに収録。
