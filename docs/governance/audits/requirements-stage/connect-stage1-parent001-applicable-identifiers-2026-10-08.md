# CONNECT Stage 1 parent 001: 適用識別子の追補監査

対象branch `codex/connect-stage1-applicable-identifiers`、起点 `9229f59edc36b8396ea99bde5f6f903b35c1ccdf`。L3/L10本文は未承認候補であり、変更はCONNECT-L2-001入力のtraceと静的oracleを具体化する範囲に限る。固定L2/L11、PO決定、既存source inventoryは変更していない。実送信、authority有効性判定、旧test/CI/runtime実行、要求採択、L3承認、実装許可は行っていない。

## 対象と差分

`docs/governance/decisions/helix-connect-requirements-po-decision-2026-09-28.md` (`HDEC-HELIXCONNECT-REQUIREMENTS-PO-2026-09-28`, SHA-256 `82db2060dbaa77b5b9e6f38fa11219ec811b108b1870e6a86ca112810f9bae69`) は、2026-09-28にPOがL2/L11と明示候補を採択し、`authority_effect: effective_when_this_record_is_admitted_to_main` と記録する。採択authority状態はmain checkpoint `633bf12ea8f948db8ba3d6600179c4a9507377a7`で確認される。一方、採択対象のL2/L11本文revisionはこのcheckpointと混同せず、decision本文が固定対象として指定した `f6dad2a33e24f000b87d7f09b8d40288257e74cc` である。固定L2全体SHA-256は `31e3f234172bb5a92b26d41db2de21534cd4301274fc7e2800b4f8a935ce598b`、固定L11全体SHA-256は `bc0cf2f39f9c368074c546b39f53a6bd350998bb0bbdb056285b305f22cc9dad`。採択登録 `MPR-RC-HELIXCONNECT-L2-001-002` が対象identityである。

修正対象の固定L2-001原文は `docs/helix-connect/L2-requirements/connect-requirements.md:56-65`。このLF-inclusive raw span pinは `sha256:895fae2d3c5cd5c725a31e6c16a6d7032e17da08f4e2e509fabb52f0cd85da18` で、範囲は親heading、定義、共通pack適用、入力、出力、単独依存、失敗時の戻し先を含む。SHAの対象は行56〜65全byte（改行込み）であり、行56〜62までの入力側だけのpin `4edfbf22e2c32b87d91114510d3c2467f4276e6bf356462429be6831b563095d` とは区別する。この10行spanのSHAは `f6dad2a`、採択確認点`633bf12`、作業base`9229f59`で一致する。対L11 `connect-acceptance.md:42-44` のLF-inclusive raw span SHA-256は `437f822eee764595ff677ca31b6789e9d51179cfc6c6f1bb461eaaed54a0d056`。

既存L3 `docs/helix-connect/L3-requirements/functional-requirements.md` は親入力表に適用識別子を列挙していたが、`CONNECT-AC-001-01` と `CONNECT-CASE-001-01` の完全descriptor、正常fixture、field別negativeにはその3識別子が列挙されていなかった。そこでACに識別子受渡しとsource/consumer owner返却・usable禁止を明記し、L10 `functional-verification.md`に以下だけを追加した。

- `CONNECT-CASE-001-01` 正常fixture: 明示的に適用された3つの合成識別子を値どおりdescriptor/receiptへ結ぶ。
- `CONNECT-CASE-001-02` 正常対照: source/consumerが登録-only scopeに識別子なしと明示する場合、識別子不在だけで拒否しない。
- `CONNECT-CASE-001-03`〜`08`: SECURITY許可、data-use、classificationの各識別子についてmissingとunknownをそれぞれ単独変異し、登録usableを拒否して宣言元source/consumerへ戻す。

基準mainから変更後のSHA-256: functional L3 `85e3186fbb82d8f61a12351f567a118850b856473b7928a334cea1e5f28464a4` → `ab44312ecc9bf9c3c2a5a547aaca89cf5166388cb8528037d654f2a8f46a2a6a`; functional L10 `fdff7c3edba7be7c7a169a92c72b1befe697dc3c3af39ec7733315ec20fa2d2f` → `8b8b8cf663eefa66b129d6b401b1e91896cfaa7787d855138684350f9a56baa1`; business L10 `ecfe151650418d88e69726d3102f542bb43e75faeb8737224f1e04c4181dfec0` → `5d03d9c92b4b19cf291c3de6f96107b371f679b77bc9ae49183af7b2e97b8b5a`.

unknown fixtureは入力sourceから宣言された識別子を解決できない状態を指し、許可の有効性/expiryや送信適格性をCONNECTが判定する意味にしていない。新しい適用性schema、送信許可判定、新gate、fieldごとのPO確認を追加しない。`functional-verification.md`の親対応表/責務表と`business-verification.md`のCASE参照を001-01〜08へ同期した。

## 旧source起点・処分

旧起点として、旧配布L3 `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/distribution-package-release-requirements.md` lines 24–83（`LEGACY-ASSET-9B7682EBDEA171005D45`, SHA-256 `c854d77696bba4904bc91c1d32b8f1bd714408480f16538b7eb7e77291104f1c`）と対の旧L10 `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/distribution-package-release-system-test-design.md` lines 1–58（`LEGACY-ASSET-6C9D2BE4E3C77D78F8EB`, SHA-256 `3b3e8b72c51ac418ed58c9278cb07f683c37eaf723d6710d12c1ddfb34a811fc`）を実読した。旧L3はconsumer profile identity/source authority/package identityを、旧L10はexact identityの正常・独立negative・evidence対応形式を示す。しかし旧sourceにCONNECT用SECURITY許可、data-use、classification identifierの個別受渡し要件は見つからず、これらの現在の意味根拠として扱わない。identityの明示結合と独立負例を設ける検証形式だけを再導出し、旧profile ID、allowlist、security broker、distribution authority/許可をCONNECTへ転用していない。

この差分の実質的入力根拠はPO decisionが採択したL2本文revision `f6dad2a`の上記L2-001 spanと、同じ本文revisionの対L11 HELIXCONNECT-L11-001である。作業base `9229f59edc36b8396ea99bde5f6f903b35c1ccdf`でも全体bytesおよび採択parent spanを再確認した。decision sourceのPO原文はPR #2205 comment `5857757034` を参照する。L11は登録identity/両端契約・descriptorを照合し、不足/不明時はusableにしない。登録がSECURITY許可を生成しないことも維持する。

## 確認結果と限界

変更した正本はHELIX-CONNECTの機能L3、機能L10、業務L10の3文書のみ。固定L2/L11内容と対象identityを意味変更していない。静的確認 `PASS`: parent inputの識別子行、6つのcase ID、3つの合成opaque ID、source/consumer ownerへの返却、usable禁止、non-applicable正常対照、送信authority validityを判定しない限界、business trace rangeを確認した。normal applicable、normal non-applicable、6つの単独negativeで、他の識別子・接続descriptorをbaselineどおり保つ構成を静的確認する。要求のauthority validityやdata-use policyの正しさはこのoracleの対象外で、その判断は既存ownerのまま。

この監査は静的文書照合のみ。runtime、外部送信、実際のSECURITY policy/authority、全CONNECT consumerの意味完了は検証していない。Business ACは追加せず、独立NFRも追加していない。
