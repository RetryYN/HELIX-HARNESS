# HELIX-HARNESS Stage 5 委任条件再照合（2026-10-07）

status: audit_supplement
review_comment: https://github.com/RetryYN/HELIX-HARNESS/pull/2621#issuecomment-6039140122
prior_decision_record: ../../decisions/helix-harness-stage5-l3-l10-po-decision-2026-10-06.md
authority_effect: none

## 再照合結果

Opus 5.5による正式な再照合（comment `6039140122`）は、旧承認記録が委任条件1の根拠としたcomment `6006664206`の実際のreviewerがOpusではなくFable 5.1であり、旧条件1（Opus `no_findings`）が成立していなかったと確認した。旧条件2もFableの結論であったため、旧revision `ed1161e03f8ea9209e573f274f37c9b97605087a`にはOpusとFableの独立した一致がなかった。

従って、旧判断記録の対象revisionについて委任承認状態を`unknown`として扱う。旧判断記録は当時の記録として不変のまま残し、本追補はその本文を訂正・置換しない。本追補も承認、取消し、再承認、PO判断、実装・実行・release許可を生成しない。

## 旧revisionのfinding

再照合は、旧対象の6本文追補、固定親L2/L11、PO採択行を対象に行い、監査台帳・依存先L2-009/022/026全文・Stage 2cの既存CASEによる共通禁止の被覆は未確認として明示した。Major findingは次の6件である。

| finding | 固定親 | 再照合内容 |
|---|---|---|
| M1 | `HARNESS-L2-025` | 要求採択・実装済み・利用者受入済みを生成しない拒否CASEが不足。 |
| M2 | `HARNESS-L2-033` | test生成・受渡しから要求承認やreleaseを生成しない拒否CASEが不足。 |
| M3 | `HARNESS-L2-035` | 原指示の記録だけでは対象revisionの合意にならない条件がFR/CASEに不足。 |
| M4 | `HARNESS-L2-035` | 正常な意味照合結果から実装・実行許可を生成しない独立反例が不足。 |
| M5 | `HARNESS-L2-037` | 出力の「根拠」「適用限界」がFR出力、正常判定、単独CASEから不足。 |
| M6 | `HARNESS-L2-025` | CORE connector versionがunknown、Template versionが互換範囲外の場合の既存ownerへの戻し先が不明確。 |

## 修正後revisionの状態

本作業branchでは、上記6 findingに対応するL3/L10の草稿差分を追加し、source hashと静的対応検証を別の機械可読証拠へ記録する。修正により本文revisionは変わるため、旧Opus/Fable所見を新revisionへ継承しない。

新revisionの委任承認状態は、同一revisionの独立Opus再照合、Fable自身による同revision本文と固定親の照合、両結果後に本文bytesが不変であることの確認が揃うまで`unknown`である。これらの確認前に`approved_revision`または委任承認済みを記録しない。

## 根拠

- Opus再照合comment: `6039140122`、PR #2621。対象本文 `ed1161e03f8ea9209e573f274f37c9b97605087a`、review HEAD `ad65e84ce8c291c21e1187da4091dd948fa9f62a`、base `8a763ce4211afa1ef2a7e54c209933a03e029243`。
- 固定L2/L11 source revision: 021/025/033は`f6dad2a33e24f000b87d7f09b8d40288257e74cc`、035/037は`318ec4a04abb3c1cc17111b3d939f913facd5fd3`。本文・raw span SHA-256は同じdirectoryの`l3-l10-harness-stage5-review-repair-evidence-2026-10-07-6039140122.json`に記録する。
- 旧承認記録の作業開始時SHA-256: `fe9dbbb17234313b9d318789b8700fa7317fb443ff0749632e5fc91a8439a49b`。本作業ではそのファイルを編集しない。
- 旧HELIXのL3/L10形とFR/AC対応は旧`docs/design/harness/L3-functional/functional-requirements.md`（`LEGACY-ASSET-B5B5E71B2AF1459D59A1`）と`docs/test-design/harness/L3-acceptance-test-design.md`（`LEGACY-ASSET-1B92155F959D7905DD1E`）を起点に確認した。Stage 5個別の保持・再導出・置換の出所とdigestは機械可読証拠および現行functional requirementsのStage 5 source tableを参照する。

この追補は監査記録であり、旧承認記録の書換え、要求意味の変更、L2再審議要否を決めるものではない。
