---
layer: L9
sub_doc: system-test-design
parent_design: docs/design/helix/L4-basic-design/nfr-typed-registry-quality-taxonomy.md
pair_group:
  schema_version: helix-pair-group.v1
  group_id: helix-nfr-typed-registry-system
  authority: docs/design/helix/
  members:
    - docs/design/helix/L4-basic-design/nfr-typed-registry-quality-taxonomy.md
---

# NFR typed registry の L9 system test 設計

## 1. system boundary の対象

既存doctor registryから`checkNfrRegistry(repoRoot)`を呼び、repositoryの
`config/nfr-registry.json` と authority source bytesをread-onlyで検査する境界を対象とする。
thresholdの意味評価、probe実行、evidence履歴はsystem boundaryへ含めない。

## 2. system oracle の一覧

### IT-NFRREG-001 — missing／invalid／structural drift の fail-close

| setup | expected |
|---|---|
| configなしの一時root | `ok:false`、`registry_missing` |
| configがinvalid JSON | `ok:false`、`registry_json_invalid` |
| production configへunknown root field追加 | `ok:false`、`registry_schema_invalid` |

missingを空registryとして補完しない。JSON parse errorをwarningに変えない。unknown fieldを落として
再parseしない。doctor messageは原因codeを保持する。

### IT-NFRREG-002 — production full trace／partial rejection の検証

| setup | expected |
|---|---|
| current repository | `ok:true`、entry traceに001..003 |
| production configから003を除いた一時root | `ok:false`、`required trace HR-NFR-REG-003 missing` |

一時rootにはcurrent requirements source bytesを配置し、partial failureが単なるsource missingではなく
required trace admissionから生じることを確認する。

### IT-NFRREG-003 — full doctor 集約配線の検証

`runFullDoctor` が `checkNfrRegistry(repoRoot)` をexactly once呼び、`doctorCheckStates`、全体`ok`、
message集約の3面すべてへ同じ結果を接続することをcharacterization oracleで固定する。check関数だけが
存在して集約配線が消えるsilent bypassをgreenにしない。

## 3. failure isolation の境界

- doctor checkはconfigやsourceを変更しない。
- invalid registryが他checkのgreenで相殺されない。
- partial rolloutを「2/3 valid」としてsuccessにしない。
- error messageへabsolute temp path、source本文、credentialを出さない。
- `nfr-grade.md` を代替authorityとして探索しない。

## 4. pair trace の対応

| L4 concern | L9 oracle |
|---|---|
| declaration SSoTが存在しparse可能 | `IT-NFRREG-001` |
| strict schemaを維持 | `IT-NFRREG-001` |
| HR-NFR-REG-001..003がpartialでない | `IT-NFRREG-002` |
| invalid registryがfull doctor全体をredにする | `IT-NFRREG-003` |
| doctorがread-only | 各oracleのfixture read-after／source characterization |

## 5. 非対象の明示

- #220: metric算出、sampling代表性、freshness、threshold／SLO verdict。
- #221: probe process、retry、timeout、DB／時系列保存。
- #223: finding分類、Issue起票、approval、GitHub mutation。

これらが未実装でも本system oracleは構造admissionとして成立する。一方、それらの未実装を
「NFR測定完了」と読み替えない。
