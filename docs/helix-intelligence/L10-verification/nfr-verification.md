# HELIX-INTELLIGENCE L10 非機能検証設計（部分草稿）

status: draft_for_l3_review
approval: not_approved
scope: Stage 2a / version_target 1.0 explicit items only
paired_l3: ../L3-requirements/nfr-grade.md
execution_status: designed_only_not_executed

NFR候補の測定設計であり、L3機能ACの正本は[機能要件](../L3-requirements/functional-requirements.md)。結果・承認・release判定は生成しない。

| case ID | NFR候補ID | 入力／比較 | oracle／測定 | 失敗・未評価 |
|---|---|---|---|---|
| `CASE-INTELLIGENCE-L10-NFR-010-01` | `NFR-INTELLIGENCE-010-01` | 同一親revision・同一scopeで候補条件と比較案をfixture化する。 | 軸別欠落・scope mismatch・stale evidenceを変異させ、qualified表示0件。 | 候補条件が観測不能、入力scope不一致なら未評価として記録し、承認値とみなさない。 |
| `CASE-INTELLIGENCE-L10-NFR-010-02` | `NFR-INTELLIGENCE-010-02` | 同一親revision・同一scopeで候補条件と比較案をfixture化する。 | 全属性positiveと各属性を一つ欠いたfixtureでproposal確定数とOS返却数を比較。 | 候補条件が観測不能、入力scope不一致なら未評価として記録し、承認値とみなさない。 |
| `CASE-INTELLIGENCE-L10-NFR-066-01` | `NFR-INTELLIGENCE-066-01` | 同一親revision・同一scopeで候補条件と比較案をfixture化する。 | 同一fixtureのfield presence/type/意味を比較し、欠落・意味変更0を数える。 | 候補条件が観測不能、入力scope不一致なら未評価として記録し、承認値とみなさない。 |
| `CASE-INTELLIGENCE-L10-NFR-066-02` | `NFR-INTELLIGENCE-066-02` | 同一親revision・同一scopeで候補条件と比較案をfixture化する。 | 各receipt属性を一つずつ欠落・ずらしたfixtureでOS受領成立0、assignment生成0を確認。 | 候補条件が観測不能、入力scope不一致なら未評価として記録し、承認値とみなさない。 |

## 親・旧source crosswalk（item単位）

全固定親は `f6dad2a33e24f000b87d7f09b8d40288257e74cc` 時点。旧statusは履歴情報のみで現行authorityを継承しない。test-designはoracle/failure consumerとして読んだ資料で、旧test/runtime/CLI/CIは実行していない。

| identity／管理行 | PO判断・登録（path/行/SHA） | 固定L2（行・全文SHA・span SHA） | 固定L11（行/span・全文SHA） | 旧L3（asset/path/行/SHA） | 旧test-design（asset/path/行/SHA） | 判断 |
|---|---|---|---|---|---|---|
| `HELIXINTELLIGENCE-L2-010` / `MPR-RC-HELIXINTELLIGENCE-L2-010-004` (adopted, `version_target: 1.0`) | PO `docs/governance/decisions/helix-intelligence-requirements-po-decision-2026-09-28.md:57`, SHA `8362ecb58921593b473ac85d277f0db36a7cbe0952268531913191e4eab260ad`; register row `397` SHA `89bdc3bcaaee36a2c5632e3d784c176776bf32521e10621ac837ed22a47235fc`; candidate digest `sha256:29b05afbff84475d17b9b1f0698762dab2a1be92480313833d9c8fef87d410c1` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:102-107`; SHA `40497f22a3ec2aff462b617764df7da6d09b427d95ed91d2ee737535c2e91260`; span `bb5239d4bcd59c2d9c125704c26ba3dad3ce45d4d9acd55eb662f060e25924dd` | `docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md` 71-71 / `fb8e588559cf58c54fd45b991e4b60f27929e0c8bd2f96bf8b57c7eed161c712`; SHA `4b96aa9565325a35d3ca10813453434df9ec15f21ea64f5db22740fdb3218e3a` | `LEGACY-ASSET-9114D4E463E95B67DD0C` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/worker-common-contract.md` 行 26-45, 47-110, 123-137; SHA `773280fa06cfb06989c4d2d66b15499635d14cd024b77401c18715c9d0588290` | `LEGACY-ASSET-C6ADB99F1353965C5449` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/worker-common-contract-acceptance.md` 行 18-37, 39-64; SHA `c8dff734891a6a7350feb9b698c40e1616946cdd424433d662f1da49d8ac800d` | worker委譲面・隔離・receipt・失敗境界を候補根拠へ再導出。provider一覧、sandbox/receipt schema、benchmark/admissionの既定値を移植しない。／negative mutation/failure oracle、fallback拒否、receipt mismatch候補。旧sandbox/provider admission値は再導出対象外。 |
| `HELIXINTELLIGENCE-L2-066` / `MPR-RC-HELIXINTELLIGENCE-L2-066-003` (adopted, `version_target: 1.0`) | PO `docs/governance/decisions/helix-intelligence-requirements-po-decision-2026-09-28.md:96`, SHA `8362ecb58921593b473ac85d277f0db36a7cbe0952268531913191e4eab260ad`; register row `474` SHA `41e40d750c55abaec6fd55d3ce49feab66d1bb1bed68481466cdd665c636600e`; candidate digest `sha256:4085daba7873d4cddefe498b04e59ff5b4e44ba3ec80a307537b51af601cfa69` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:454-465`; SHA `40497f22a3ec2aff462b617764df7da6d09b427d95ed91d2ee737535c2e91260`; span `e7b52b1bd92d6ff3fb47acbfd13e119c590cc7d6dc472e6eb96d32864f3d23c4` | `docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md` 131-139 / `7969c17ed59308cc1c052b7a2ffb246e5cf92d8cdcad5bc12f4ad2545d9fc0f1`; SHA `4b96aa9565325a35d3ca10813453434df9ec15f21ea64f5db22740fdb3218e3a` | `LEGACY-ASSET-9114D4E463E95B67DD0C` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/worker-common-contract.md` 行 26-45, 47-110, 123-137; SHA `773280fa06cfb06989c4d2d66b15499635d14cd024b77401c18715c9d0588290` | `LEGACY-ASSET-437A6A68F9A9E0AE1B9E` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/resident-lane-orchestration-acceptance.md` 行 17-55; SHA `63ac3d0fbc36f014977998f9073846bfc01e5d352e07c1e10d408f0eab0ad707` | worker委譲面・隔離・receipt・失敗境界を候補根拠へ再導出。provider一覧、sandbox/receipt schema、benchmark/admissionの既定値を移植しない。／scope、wrong actor, stale receipt, lost handoff等のnegative oracle候補。old event/lease/assignment valuesを移植しない。 |
