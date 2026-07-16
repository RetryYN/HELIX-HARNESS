---
title: "Hybrid docgen Python engine adoption ledger"
status: draft
created: 2026-07-16
updated: 2026-07-16
owner: PO / TL
mechanical_anchor_inventory: docs/governance/hybrid-universal-mechanical-anchor-inventory.md
module_anchor_ledger: docs/governance/hybrid-python-module-anchor-ledger.md
schema: hybrid-python-engine-adoption.v1
source: ハイブリッド設計ドキュメントv1-fixed.zip
source_sha256: 9c547ba8bc9eaf3a12f27254fd3eb6d04b37fb8c899f13d56ceb0d2cff179fb3
requirements: HIL-FR-15/HIL-TR-02/HIL-TR-03
---

# Hybrid docgen Python engine採否台帳

## §0 方針

Hybrid ZIPのPython engine/toolをTS/Nodeへbulk portしない。Python behaviorを第一候補として保全し、Nodeは
execution admission、sandbox、schema/digest/path/provenance再検証、harness.db authoritative commitを担う。
本表の判定軸は**runtime reuse disposition**である。static surface scanによるprovisional判断であり、import closure、fixture、実run、output schema、
license/dependency、determinismを閉じるまでactive採用ではない。
意味機能そのものの採否はsource capability台帳の**semantic adoption disposition**で別管理し、同一tool SHAをjoin keyとする。
両軸が異なる値でも矛盾ではないが、一方を他方へ暗黙変換しない。

判定語彙:

- `reuse-as-is-candidate`: source behaviorを変更せず、共通Python worker envelopeで実行できる候補。
- `reuse-with-adapter`: source behaviorは維持し、file/process side effectだけを隔離adapterで拘束する候補。
- `redesign-required`: fail-open gateやcontrol-plane authorityを含み、Python workerとしてそのまま起動してはならない。
- `harden/redesign/reject`: 実fixture監査後にのみ選ぶ。現時点でPythonであること自体を理由に選ばない。

## §1 Inventoryとprovisional disposition（29/29）

| tool | bytes | SHA-256（join key） | static surface | provisional runtime reuse disposition |
|---|---:|---|---|---|
| `activation.py` | 5238 | `4f3551d20de322f3eb33d434bd7a246091090b62fbfd074aa7cb1cf4a4f9b815` | filesystem、YAML、`build.py` import、CLI | reuse-with-adapter |
| `agent_docs.py` | 5682 | `502e9e294296515e9cd93beb3c43d7df832263fb773bc4ccccf3d38ab5f4f963` | file write | reuse-with-adapter |
| `agent_meta.py` | 6655 | `1e8c0cc9094a5eaa6cff3e269578445c7b37c479f554f674597bdf7f079da0ad` | file write、CLI | reuse-with-adapter |
| `assign.py` | 15738 | `7f1d282479ecead55c0f46913930492ea926fba7acc2a3ff358fd99b60fa731b` | file write、CLI | reuse-with-adapter |
| `build.py` | 43897 | `80bb586b05d85f04761270ed4a6668a7da316ba9511d46ac053f59ad1ab58c9c` | file write、subprocess、CLI | reuse-with-adapter |
| `consistency.py` | 7203 | `9c37e133586bf2abb32ac6ecbf3b17ef1e042e40c3e1412d64a3530b7ac526ac` | pure/library候補 | reuse-as-is-candidate |
| `derive_traces.py` | 13745 | `4604d0f0a0036323bd8290e902f02b065571cce97b88f13482f55fae7a1341dc` | file write、CLI | reuse-with-adapter |
| `diagram_dsl.py` | 11141 | `f58d114e3fd1140d34a24dd745e78fd1b18d85cd649c248f9368c93ab82a2834` | file write/render | reuse-with-adapter |
| `diff_report.py` | 8381 | `8053167575ef261be528e4070d52990d5f15fbe30b0d411769d1993a981f2820` | file write、subprocess、CLI | reuse-with-adapter |
| `export_sheets.py` | 1941 | `1e1c876efdcddf8cfffeb827b2ae71c36ecc6f6c6158919101c65785328e2428` | `gspread` external network/write | reuse-with-adapter（登録connector・network policy必須） |
| `fix_names.py` | 2528 | `12cfb88c84140d4172784c20553ba5f300564748b080ed24b146ae9eacaa731b` | filesystem rename、CLI | reuse-with-adapter |
| `hook_gate.py` | 1496 | `a07abc8e7a4b41e89a77ad26d45a054651e063dbe247db4555554cb8cef59646` | subprocess、parse failure時fail-open gate | redesign-required（Node control-plane gateへ移管） |
| `id_utils.py` | 9173 | `869da1887a8feba5ceee8c4e763eeb2f7d52f426f13592d2f09d8e7769888061` | pure/library候補 | reuse-as-is-candidate |
| `impact.py` | 7266 | `76dc282fbcbb454f6a535fd91c07b83aa1ceacd503a775cc561d493d726e8203` | read/analysis、CLI | reuse-as-is-candidate |
| `md_export.py` | 3773 | `5b18a47d5fdcac8165454d82b603a6ec4c0f09f03508ddabdcb5a6fd52020fec` | file write | reuse-with-adapter |
| `package.py` | 1619 | `e810ef575cdef648058d3c01062fd7466b8a75d8c450a74a96cc51892c1f6fd6` | ZIP/file write、CLI | reuse-with-adapter |
| `render.py` | 2450 | `8ae96449745c2479845ea13ec20e3f5d2e5b2f27858481f0d469d371b1a8ba7d` | pure/library候補 | reuse-as-is-candidate |
| `review.py` | 11178 | `3487bfe855a8b880e7ef76a997a30fc3a56521789aa5f51c44cf1a81634f8653` | file write、CLI、seed引数上書き疑義 | reuse-with-adapter（determinism fixture必須） |
| `schedule.py` | 24232 | `6dc3b51ddab01d93c9e1b8a3ebc5faea725a95698d049245bf1410ee06730c8c` | file write、CLI | reuse-with-adapter |
| `schema_check.py` | 3064 | `b8c6a5aa5740999f545a4d34ce17238af632b2d05bb7504e7741f7b4aa35d4b2` | CLI | reuse-as-is-candidate |
| `scope.py` | 8277 | `3311ca1f2f881afae6a6369bd826bdcebc5babcd19de4165d52739083c5d97c3` | file write、CLI | reuse-with-adapter |
| `selftest.py` | 7723 | `7cd8629a873c6fe61c53066c6d095920159b4f45fbd2fa5e2e08659b9c24ab27` | file write | reuse-with-adapter |
| `spec_check.py` | 14390 | `6d11080883b27803a4a5c2ebbfdd8b62e8cbcd77cd31a01b1b48c4e58e6e9ebe` | file write、CLI | reuse-with-adapter |
| `spec_trace.py` | 9034 | `7d1bf525566725279e730f3aca22609bc89b3a7f2f6f25ffabc50083b649bc4d` | CLI | reuse-as-is-candidate |
| `spec_types.py` | 4098 | `56f20e5e2acca72fa8255ddc6ed2a94c9978299fe4bb7c53bf01e931c3df1e9e` | pure/library候補 | reuse-as-is-candidate |
| `style.py` | 5935 | `1f3c1dd2930e5fb980493ea4257db884ba410726f4c027d81f8600f827f89bf3` | pure/library候補 | reuse-as-is-candidate |
| `util.py` | 2056 | `5c5c74450213ac97cc04114c3343502523a65c836124ff9daee42a3a9f932a59` | subprocess | reuse-with-adapter |
| `validate.py` | 2480 | `b63f2ad7d01e86442b77bbedac491976ddb4849ac7c06391f14bb122c715844a` | pure/library候補 | reuse-as-is-candidate |
| `verify_files.py` | 4401 | `5325a12fd408b6a65ac6afdfcc5dc9c8c09e930d6d4d13d484790fa2162c5d36` | CLI | reuse-as-is-candidate |

## §2 Static closureとblocking obligations

| metric | count | verdict |
|---|---:|---|
| Python tool inventory | 29/29 | PASS |
| direct SQLite pattern | 0/29 | favorable、動的確認pending |
| external network/write surface | 1/29以上 | `export_sheets.py`の`gspread`を確認。default deny＋登録connector必須 |
| clear filesystem mutation | 15/29以上 | AST＋known call surface。call graph/dynamic確認pending |
| known subprocess surface | 4/29以上 | hook gateを含む。allowlistまたはredesign必須 |
| main guard module | 22/29 | AST観測。既存CLI 16/29計数をstale化 |
| CLI subcommand / leaf route上限 | 19 / 40 | callableへのexposure edge。behaviorへ二重算入しない |
| provisional reuse-as-is candidate | 10/29 | 実fixture pending |
| provisional reuse-with-adapter | 18/29 | adapter/fixture pending |
| redesign-required | 1/29 | fail-open control-plane gateをPython workerとして起動禁止 |
| active adoption | 0/29 | FAIL |

freeze前に各toolのimport/dependency closure、入力/output schema、relative path manifest、command allowlist、
timeout/cancel、determinism、fixture producer/assertion、Node再検証、rollbackを個別に閉じる。
