# SECURITY Stage 1 parent 009 trigger matrix / parent 012 scope clarification (2026-10-08)

## 対象と固定根拠

この時点監査は、main `786ee7c85c5454e3b2314c1d8ee3ca28f5178db1` から作成したbranch `codex/security-stage1-trigger-matrix` 上で、SECURITY Stage 1 parent 009 と 012 のL3/L10表現だけを対象とする。固定L2/L11は revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc` のbytesであり、PO採択decisionのrevisionとは別である。親033、その他のStage 1親、過去監査は対象外で変更していない。

固定source全体SHA-256: L2 `docs/helix-security/L2-requirements/security-requirements.md` `027e6d25c8665e8aca006f23660c4ecfcc0ec0a92946be871e935ec5aa7a774c`; L11 `docs/helix-security/L11-acceptance/security-acceptance.md` `25635649f87c0e805a5d1cf35b5c1201144c851533808770cd4f9ac6ba067c01`.

| 固定親 | 根拠箇所・section SHA-256 | 採択decision row |
|---|---|---|
| L2-009 | L2 `:150–158`, `1e0f47fdc6cdce52f324d178b6c927b4519ab9412f51f7bfb1def0a33df9abca` | 47 |
| L11-009 | L11 `:33`, `749fcd644ce86f164a511fcef1381bbfd9aba301fccd6c6ce4d8f01e7fd7324e` | 47 |
| L2-012 | L2 `:180–188`, `6d2afeee0c6f60a332265c1196c447f47b578e6e72700b8216d03d4e00f49a27` | 50 |
| L11-012 | L11 `:36`, `1663d911bb3c1800f17b00172f4e1ec8234cdc7605cb6d0dae2760bc3ed3c114` | 50 |

PO adoption source is `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`, fixed at `49318f1f1de5810dfc61fdfe3a2565b86509009d`; it is not the L2/L11 source revision. This change does not alter a parent, decision, requirement meaning, owner, scope, or version.

## 旧source起点と処置

旧HELIXの `LEGACY-ASSET-B62E49D2E156232B8C63` (`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/security-capability-broker-authority.md`, full SHA-256 `161722d80e7b0199310b1401992c3737bef2014b19b2776c0df4b15f833fe0a7`, CAP-001–007 lines 160–166) と `LEGACY-ASSET-170112AB2FA2FFDBFEE9` (`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/security-capability-broker-acceptance.md`, full SHA-256 `b6f926f39cd824fc102cf82bd1625d14d298f666c931786fdc6c8117d06af1c4`, lines 1–59) を再読した。保持点は旧sourceのfail-close/negative oracleを候補として扱うこと。旧sourceは現行L2-009の各triggerと現行recipient群を結ぶ完全な同一契約ではないため、trigger集合とrecipient意味は固定L2/L11から再導出した。旧workflow、CLI、test、runtimeは実行していない。

L2-009は revoke、scope drift、credential漏洩、異常通信、runtime逸脱、unknown の各triggerについて全該当recipientへの伝播を明記する。従前のFR-009-01はtrigger一覧とrecipient一覧を同段落に持つが、各triggerの独立入力を明示せず、CASE-009-01はrecipient状態の独立変異だけでtriggerごとのrecipient網羅を固定していなかった。そこでFRのACとFVのCASEに、列挙済み6 triggerを別入力とし、triggerごとに該当recipientを確認し、各trigger×該当recipientの未達/未観測negativeを独立に評価する条件を追記した。recipient、停止動作、unknown範囲、復旧可能性、数値latencyを追加していない。

L2-012は `Agent package` を列挙し、L2-010は別に `Agent definition` を列挙する。既存L3/L10が前者を `Agent` と短縮し対象を曖昧にしていたため、FR-012-01のACとCASE-012-01のoracleを `Agent package` とし、L2-010のAgent definitionとの識別を記した。新しいpackage検査要件、項目、owner、scanner/registry/providerを追加していない。旧archive内に同じ `Agent package` 契約がないという検索は今回再実施していない。これは固定L2の対象名を使う表記訂正であり、旧source不在を新要件の根拠にしていない。

## 変更対象とbytes

| Path | base full SHA-256 | 修正後 full SHA-256 |
|---|---|---|
| `docs/helix-security/L3-requirements/functional-requirements.md` | `f6da676a3c816e6e845e7cc7c8e7711f9f0d9e4a6b8fa6a6c6595dd730aa8ea5` | `666d9548008a88a265a3db30c6814bfdf632e506f8b435e6a0e1b6c525ff5f3d` |
| `docs/helix-security/L10-verification/functional-verification.md` | `30b4e33419b617c0f7b2710f26e2aa8ae771b67e3fa29510aa01495e0200947a` | `39b06b8363abce0f2027e23387c076c76fbc81236c2a79d41abce9431afd13b9` |

## 静的検証と限界

`SECURITY-FR-009-01` は `SECURITY-AC-009-01` と L2-009 に結び続け、`SECURITY-CASE-009-01` は同ACへ結び続ける。FR/FVの009 trigger列は固定L2/L11の6項目と一致する。012のFR/FV対象表記は `Agent package` で揃い、L2-010側の `Agent definition` は変更していない。変更ファイル以外のL3/L10本文と旧監査は差分に含まれない。

`git diff --check` とID/参照・対象表記の静的確認を行う。fixtureは実行しておらず、独立reviewも未実施である。これは親009/012および指定されたL3/L10箇所に限定した追補であり、全Stage 1・全48文書の意味再監査や全旧consumer調査を主張しない。
