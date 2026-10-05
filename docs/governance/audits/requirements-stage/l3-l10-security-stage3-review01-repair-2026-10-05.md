# SECURITY Stage 3 review01修正記録

- 対象: HELIX-SECURITY Stage 3、親029/030/032/034/035。
- 正式指摘: #2599 comment `5989265592`（Major 11 / Minor 11 / Blocker 0）。本文UTF-8 bytes 10964、SHA-256 `335b5435d46a9fd5407e7b1b0d7e4375ea95310a7b0cfb6d7a82767fe27fdce1`。
- 対象HEAD: `baeb824095a468a31ecad89ab28ef1d64207d52b`。本文修正commit: `73cec60ee2a57534421f13896e796a6329006459`。固定L2/L11: `633bf12ea8f948db8ba3d6600179c4a9507377a7`。
- この追補記録のauthority effectはnone。PO判断、独立review、finding独立closureは生成しない。

## 修正内容
- **M-029-1 (Major)**: 029依存の区分を欠いていたため、常時必須・操作時必須・参照資料のみをAC/CASE-029-04へ明記。
- **M-029-2 (Major)**: main Worker偽装と既存006/007/016条件欠落を別fixtureとしてAC/CASE-029-05に追加。
- **M-029-3 (Major)**: 公開コードでも免除しない条件と、変化・観測不能時の個別caseをAC/CASE-029-06に追加。
- **M-030-1 (Major)**: 既存008/010/011/012/013依存と、permission/rollbackを含む変更軸をAC/CASE-030-04へ追加。
- **M-032-1 (Major)**: 規範sourceを旧v1.3:430へ訂正。pillar/HATは補強資料として分離。
- **M-032-2 (Major)**: Worker迂回禁止、OS assignment/未完義務、policy actor追加・旧enforcer復帰の独立negativeをAC/CASE-032-03へ追加。
- **M-034-1 (Major)**: 責務越境3種を別negativeとしてAC/CASE-034-04へ追加。
- **M-034-2 (Major)**: read-only scope越境を既存008/007へ戻し、1.x probeを旧契約の代用としないcaseを追加。
- **M-035-1 (Major)**: 別repository denyと別runtime allowlist能力の流用を独立変異としてCASE-035-04へ追加。
- **M-035-2 (Major)**: 旧repository/provider申告だけのdeny能力・適用状態をunknownとするcaseを、provider-flag bypass試行から分離。
- **M-035-3 (Major)**: 対象revision/authority/repository policyの常時束縛、同scope正常例、revision drift negativeを追加。
- **m-029-a (Minor)**: scoped credential-useを拒否しない根拠をL2-005とL2-033 P0補足へ明記。029の許可範囲は拡張しない。
- **m-029-b (Minor)**: INFRASTRUCTUREの適用観測とWorkerの強制責務を分離。
- **m-029-c (Minor)**: no-trainingの同値代替化を禁止し、通常作業へ都度人間承認を加えない条件を記録。
- **m-030-a (Minor)**: 6fab baselineと2d499 pre-isolationのsource path/full/raw span pinを追加。
- **m-030-b (Minor)**: 変更軸へpermissionを追加し、1.x Web保護を前倒ししない条件を明記。
- **m-032-a (Minor)**: 031受入結果から032充足を推定しない独立条件を追加。
- **m-register (Minor)**: 現在のlocator訂正行を同一digest・authority effectなしとして記録し、採択revisionと区別。
- **m-034-a (Minor)**: 6fab baseline line 271 atomをarchive revisionとは別pinで追加。
- **m-035-a (Minor)**: cleanup未確認時に当該run完了を成功扱いしないようFR/AC表現を整合。
- **m-035-b (Minor)**: 次run cleanupの戻し先にpolicy owner SECURITYを追加。
- **m-035-c (Minor)**: 既存006/007/OS-018失敗を035成功で相殺しない独立negativeを追加。

## 固定親・旧source・物理pin

JSON `docs/governance/audits/requirements-stage/l3-l10-security-stage3-review01-repair-2026-10-05.json` の `fixed_parent_source_pins` に、固定L2/L11の全文SHA・物理span/raw-LF SHAと、旧sourceのrevision/path/spanを格納した。6fab baseline、2d499 pre-isolation、archive sourceは別revision/source atomとして記録した。

## 文書とprefix

6つのcanonical文書のfull SHA-256とbyte数:
- `docs/helix-security/L3-requirements/functional-requirements.md` — `8468573c03ed0394c9e695e0c64ed16cc16602dfc81e0025795f98343804a7bb` (100126 bytes); 承認済みmain prefix `8e4c5064a0ab84345c31d6abf6a764c84eb34ad2c4ee41405c074507e175b165`とbyte一致（76904 bytes）。
- `docs/helix-security/L10-verification/functional-verification.md` — `34ebeebab63164227dd589e534bfd343ce19f01e933a4bf3c183fd0335732891` (73252 bytes); 承認済みmain prefix `f679d21ad0b707ac450473f6b21d1d1feb29d8c2982ed83c6d67133dc2ffe507`とbyte一致（62505 bytes）。
- `docs/helix-security/L3-requirements/business-requirements.md` — `0b2894925bc80895ff61723377f27b14b4cca32289756747c566e35cba049dee` (1958 bytes); 承認済みmain prefix `e6cfb2b5abff73254f0f8d860ffbd0590085fed224cf8f2fb61a02271d780ff9`とbyte一致（1430 bytes）。
- `docs/helix-security/L10-verification/business-verification.md` — `8683764bb26d0d1f582828096c050c264df45a4f0fdc2c94e34bb4dbf9e1eb7a` (1461 bytes); 承認済みmain prefix `d136764cfef2b6eeca900c5046a1228764e414591cc58bd9b6e076fca62fc933`とbyte一致（933 bytes）。
- `docs/helix-security/L3-requirements/nfr-grade.md` — `e08bdd84397a11766a2828c66ceb56b7d8e9ec4f3b0071993ce8cac4a94ed4ed` (12906 bytes); 承認済みmain prefix `bc2476eafc5922b451a7c967e9d05aa477e6649c58b77427cd24ed1d4de12427`とbyte一致（9983 bytes）。
- `docs/helix-security/L10-verification/nfr-verification.md` — `0b808d2216e75cbd34905513139409a9b5d6f281f07c2767c890ff917cf883bc` (9640 bytes); 承認済みmain prefix `683fd29048418b6e8d1e78ab27bc727dc026d7c5555c7a63662d27da7746fd18`とbyte一致（7420 bytes）。

編集行pinはJSONの`current_changed_literal_line_pins`に47件記録した。旧cutout記録はSHA `a006159344512b6c473e0c981dafe6ce42b4c0aa37b073508f4583e3f3d941f5`（JSON）と`7ddb4ce7916a69eac186e857ae952d5d5c2aa91eb6dc3e8fa527c0c8f40e5cad`（MD）のbytesを保持し、変更していない。

## 静的確認

- `git diff --check`: pass。
- `scfctl validate`: 147 bindings、fail 0。
- `scfctl stale`: 0。
- `scfctl residuals`: 0。
- `govcheck`: ok（atoms=7622, requirements=57, files=58）。
- 追加AC/CASE/NFR trace: 7/7 IDがFR、functional L10、NFR L10で相互参照。
- 6文書すべてのmain prefixをbyte単位で確認。
- 旧runtime/test/CI/Bunは起動していない。

## 未了・限界

この記録は作成側の自己申告で、独立reviewやPOのStage判断を代替しない。rootの本文・source照合と独立reviewは未了。旧実装やruntimeを検証していない。
