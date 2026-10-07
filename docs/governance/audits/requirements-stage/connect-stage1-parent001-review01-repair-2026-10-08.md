# CONNECT Stage 1 parent 001 review01修正追補

- 種別: 時点監査・review指摘への修正記録
- authority effect: none
- 対象レビュー: PR #2677 review01、Claude `review_merge`
- formal comment: https://github.com/RetryYN/HELIX-HARNESS/pull/2677#issuecomment-6044432300
- formal comment body: 5,805 bytes、SHA-256 `765949c49d56e71507ef42b115693cd18aa0c3391b448981b10281444e9a5d57`
- 対象HEAD: `f0985debaa903d9780a00350283eb62c4624e636`
- 作業base: `9229f59edc36b8396ea99bde5f6f903b35c1ccdf`

## 指摘と対応

**M1 — 固定親の出力引用**: L3 `functional-requirements.md`の「固定親の入出力と共通束縛」表にあるHELIXCONNECT-L2-001の出力セルから「適用識別子」を除いた。固定L2:63の出力原文「接続identity、登録revision、端点/能力/契約/依存の参照、状態、登録結果receipt。」へ戻した。source/consumerが宣言した適用識別子をdescriptorとreceiptへ結ぶ導出は、L3 `CONNECT-AC-001-01`にすでに明記されており、表の外でそのまま保持した。ACとFV正常・negative CASEは削除・置換していない。

照合対象の固定L2-001原文は、PO採択対象revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`の `docs/helix-connect/L2-requirements/connect-requirements.md:56-65`。LF-inclusive 10行spanは1,662 bytes、SHA-256 `895fae2d3c5cd5c725a31e6c16a6d7032e17da08f4e2e509fabb52f0cd85da18`。L2:63の出力一行とL3表を目視・静的に照合した。対L11の確認範囲は `docs/helix-connect/L11-acceptance/connect-acceptance.md:42-44`、LF-inclusive 878 bytes、SHA-256 `437f822eee764595ff677ca31b6789e9d51179cfc6c6f1bb461eaaed54a0d056`。

**m1 — 識別子衝突の独立negativeの所在**: 新CASEは追加せず、FVの`CONNECT-CASE-001-03〜08`節に、識別子自体の衝突は`CONNECT-CASE-001-01`の「同一接続identityに対する異宣言」negativeで測る、と追記した。review01が選択肢(b)として認めた既存CASEによる被覆を明示する。既存のmissing/unknownの単独変異、正常対照、責務境界は保つ。

**nit — 監査の表現**: 既存のimmutable監査 `connect-stage1-parent001-applicable-identifiers-2026-10-08.md` は変更しない。本追補では「修正対象の固定L2-001原文」を「照合対象の固定L2-001原文」と表記し、変更したのはL3の引用表であり親revisionは不変と明示した。

## 旧source起点と意味境界

既存監査の旧asset/source inventoryを起点とし、旧配布L3 `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/distribution-package-release-requirements.md:24-83`（`LEGACY-ASSET-9B7682EBDEA171005D45`、SHA-256 `c854d77696bba4904bc91c1d32b8f1bd714408480f16538b7eb7e77291104f1c`）と旧配布L10 `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/distribution-package-release-system-test-design.md:1-58`（`LEGACY-ASSET-6C9D2BE4E3C77D78F8EB`、SHA-256 `3b3e8b72c51ac418ed58c9278cb07f683c37eaf723d6710d12c1ddfb34a811fc`）の該当内容を再読した。旧sourceは配布profile identityと正常/negative/evidenceの構造的隣接例に限り、適用SECURITY許可・data-use・classification識別子の現在の意味根拠にはしない。現在の出力引用は固定L2:63を逐語的に戻し、L3導出は採択L2/L11に整合するACへ残す。固定親の意味、scope、owner、version、PO判断は変更していない。

## 6本文SHA-256

SHAは作業base本文と修正後working treeの実bytesから算出した。

| 本文 | base `f0985de` | 修正後 |
|---|---|---|
| `docs/helix-connect/L3-requirements/business-requirements.md` | `3ff964c1b762c9f67228214d62df5e208d0e0ab5bd4f2ffb57b26f8684ebd925` | `3ff964c1b762c9f67228214d62df5e208d0e0ab5bd4f2ffb57b26f8684ebd925` |
| `docs/helix-connect/L3-requirements/functional-requirements.md` | `ab44312ecc9bf9c3c2a5a547aaca89cf5166388cb8528037d654f2a8f46a2a6a` | `b3e4a47c0f49978880fc9bae7697d9b67eeaf72a112f821fef167c230c9d2e4b` |
| `docs/helix-connect/L3-requirements/nfr-grade.md` | `8becd7af6701e3de40a300c617aa3eca2d0214a867a2685b8615efcf8b7582aa` | `8becd7af6701e3de40a300c617aa3eca2d0214a867a2685b8615efcf8b7582aa` |
| `docs/helix-connect/L10-verification/business-verification.md` | `5d03d9c92b4b19cf291c3de6f96107b371f679b77bc9ae49183af7b2e97b8b5a` | `5d03d9c92b4b19cf291c3de6f96107b371f679b77bc9ae49183af7b2e97b8b5a` |
| `docs/helix-connect/L10-verification/functional-verification.md` | `8b8b8cf663eefa66b129d6b401b1e91896cfaa7787d855138684350f9a56baa1` | `75a384b335c0d7e1f816644f498982e903fb0c5003a5e266a6d1019cecad6dcc` |
| `docs/helix-connect/L10-verification/nfr-verification.md` | `9efc5ddc902da565ad3d1295b2088ade1e7ab3427f1b4206ff3d4686a1197e48` | `9efc5ddc902da565ad3d1295b2088ade1e7ab3427f1b4206ff3d4686a1197e48` |

## 検証と限界

- 固定L2:63出力とFR表の出力セルが一致すること、ACの識別子traceが維持されること、FV 001-01の異宣言negativeへの参照と既存001-03〜08の単独変異が残ることを静的確認する。
- `git diff --check`を実施する。旧runtime/test/CI、実接続登録、送信、fixture実行は行わない。
- review01は現HEADを承認しないと明記している。本修正は承認、L3承認、merge admission、実装許可を生成しない。独立再reviewは未実施。
