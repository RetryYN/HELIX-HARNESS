# HARNESS-L2-049 修正後の時点監査

対象WT `/home/tenni/.helix-worktrees/l3-harness-stage3-parent049` のHEAD `db517b80021c028d8f96da8d99879875b02d151f`、base `ceda1c53b53c53fffb8c23f394add1f2b809deb1`を確認した。Root integration checkpoint `/tmp/root-harness049-integration-checkpoint.json` の6 suffixとworktree内の実本文が一致し、各本文はceda prefixへsuffixを追加した同一bytesである。

## Root統合時のsource・authority補正

worker v2 candidateは `/tmp/harness049-parent-authoring-candidate-fix-v2-current-ceda.json`（SHA-256 `a6547b629d40eacafbb256cc80e89f47fba11108794a583d6b583ed65f81b699`）。v2 JSON内のfixed-parent/authority metadataは旧318または誤ったL2 digestを含んでいた。これらは履歴値として保存し、Root checkpointが示す採択source `ea6f756f96a7370de78e412d737c7a7ed472114a` のL2 1070–1092、L11 802–814を現物照合した。span digestはそれぞれ `a5df1f7bdca708046ec9ad68e1eea0974884da63205b8995ad45dcd8f0bbc116` / `f3fb47da21371084e9f8c7c7f7ca6dd945c8e98ae7c7b70597c3fc44e4e08ee7`。PO live26の39行・72行、登録-003の現物も確認し、-002の意味を継承しない採択境界を記録した。

## 旧source・consumer・ID境界

旧VDH source、25 semantic spanのsource register、coverage receipt、legacy asset ledger、旧Stage3 FR・assessment auditを指定revisionのbytesで照合した。049入力に選ばれたspanはVDH-FR-011 STATE/DEVICE/VIEW。VDH-FR-005 PATTERNはpendingとして区別した。選択した旧consumerは14物理行で、全行literal/SHAを保持した。旧FV82行はID・raw literal・line hashをこの監査JSON内に限って保持し、現FVは98 unique IDs/6列で旧82 IDを保持している。

## Root修正差分

v2 candidateとcurrent bodyの間でFV tableの既存28行に差分があった。正常入力で049自身の誤出力となるCASE-06/08/23/24は、入力側ownerへ返さず候補出力処理の訂正とした。CASE-11〜13は選択profile・元測定receiptの画面/領域/文言役割、finding分類・理由、scope/revisionへの根拠一致を求める。20 confusion-cell rowsは誤ったcell計上を正解扱いせず、正常入力に対する集計出力不一致を049側で訂正する形。r10 profile-version-unknownは既存design/oracle責務へ返し個体unknownを分ける。CASE-15/fixture count/route rowを現物全文で保存した。

## six本文 SHA-256

- `docs/helix-harness/L3-requirements/business-requirements.md` suffix `837d4b9fe3ef94e3106253c70af1358f68079cf572e0abbe4617ac0cac0676aa`, full `37a6bba0633b59f91977accc04a42804e53d3e2ed6e72dd3c290f57794412880`
- `docs/helix-harness/L3-requirements/functional-requirements.md` suffix `a3a497423584ba8cd6147aa25daa6235945418d438ffe3e391356e5d65d358b1`, full `c03158ee32eafa513ae555be9a498a2fa5a29fc83103c8acab00e55a05af6ade`
- `docs/helix-harness/L3-requirements/nfr-grade.md` suffix `e42f66ea04010bc0b9bcf777f5aef978a96c42fe6bc26eba06f21be556bec7c0`, full `320b11a9b8f60438b5b2158520c5d003e86e763474e8a19eab4b2b7715b75187`
- `docs/helix-harness/L10-verification/business-verification.md` suffix `2216d09b9d41021366fe053e2245f8ced4a079936d88d0e5a223f11b1d7d77d9`, full `8cb3ba651a727467a4b7fad9f179085451c51fd95bb9259fa9da19215fce9d8e`
- `docs/helix-harness/L10-verification/functional-verification.md` suffix `f20854108293e9a097b9702bef134d5fdb32528c29f57d7f112594a5b91f6b93`, full `dedf302fbef90b215367c36d8274902be2de6a5b67c668eab70c5ba5e6fa8444`
- `docs/helix-harness/L10-verification/nfr-verification.md` suffix `e5aeb736ac361b4096e3edac10a76e094462c0611d640d209747dcda8490a6f9`, full `a28d216ca516bdafe3a57d994045a666b57ea2dd58628c574be8fa11d00e7c54`

未実行：fixture/runtime/oracle、render実測、独立review。意味完全性・PO/L3承認は主張しない。

監査JSON SHA-256: `d0ba36b7d079ac34f6b1a368d9020c1e907a79d15efd38111d51503b7dd25251`
