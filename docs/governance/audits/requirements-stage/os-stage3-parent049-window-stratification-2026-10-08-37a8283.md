# OS Stage 3・親049の設定revision別計測window監査

- 記録種別：時点監査（immutable）
- 日付：2026-10-08
- 作業base：`37a8283be429c57f3706153ad522e7ad288fecc3`
- 固定親：`633bf12ea8f948db8ba3d6600179c4a9507377a7`
- 対象：HELIXOS-L2-049、AC-OS-L3-049-04と対応NFR/L10計測行
- 機械可読pin：[`os-stage3-parent049-window-stratification-2026-10-08-37a8283.json`](os-stage3-parent049-window-stratification-2026-10-08-37a8283.json)

## 根拠と採択状態

固定L2 `docs/helix-os/L2-requirements/governance-requirements.md:1205-1211`（全文SHA-256 `c530b01dbf396481f3ea0124f9a603d2a8ddfb813c9ab1e88db316262342949a`、span SHA-256 `e9372f19e5064cb5470141fef25a3212aa65cede5d44ecfff8c9ed86da83668b`）は、設定上限が変更可能であり、登録数・上限を実行数やthroughputと同一視しないことを定める。固定L11 `docs/helix-os/L11-acceptance/governance-acceptance.md:821-828`（全文SHA-256 `40b2d902a2ed321c337d6982d3d61443e77e9d50d078bf698c3208038c9f6997`、span SHA-256 `d5a3a0c361a6d0056a8c608f5230a52d206c000d7ac81ff969aeaba30ad4d810`）は、利用率の分母・観測時点・scopeを示し、missing time/capacityを成功分母へ入れないoracleを置く。

PO採択register `docs/governance/decisions/po-decision-2026-09-29-57candidates.md:72`（全文SHA-256 `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`、行SHA-256 `d687c78415c220eeb40b695e4c6126951712eb1680e064be2dc87501edc8da5a`）は`MPR-RC-HELIXOS-L2-049-003`を条件付き採択している。この修正は後段義務・担当・capacityの条件を変更しない。

## 旧sourceからの対応

- `LEGACY-ASSET-11E8FE0479751F02A4A3`、`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/three-lane-capacity-profile-requests.md:15-17`（全文SHA `a428f2de8652b9508456aed358152865a1f96f6978e5d204b1e2dfd3a1d2e1ba`）：capacity pool上限とactive WIPを分ける意味を再利用。
- `LEGACY-ASSET-F172CBC75CAA4FCFC2EB`、`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/three-lane-capacity-profile-requirements.md:29-31`（全文SHA `d2df9851fcd3db79ffaed03116f85118da43fe26f943412045215a58cfa3804e`）：下流能力に応じたbackpressureを再利用。
- `LEGACY-ASSET-23D3D9769B093AFDCC25`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/management-integration-cell-requirements.md:56-60,102-106`（全文SHA `f840e16cab80b88fa4e4730ed49f47f0afeee2050cad309a3d87da4cce057ec6`、span SHA-256は56-60が`f5410868cedfd32d77983ec79de795850885f9cbddc1ce4160805203eb3eca39`、102-106が`9508c4439c191599853307e0096d8ec21eabbe3dd98abed165be38d61531e222`）：READY task、順序、空いたcapacityの再利用を意味再導出。

旧sourceは設定revisionをまたぐ利用率の時間計測法を定めていない。よって固定bucket幅を継承せず、現L2の変更可能な設定とL11のcapacity×経過時間を対応づける最小測定方法として、既存設定revisionごとの不変区間を比較する。新しい設定記録fieldやsource schemaは設けない。

## 変更内容

`nfr-grade.md`から親・旧sourceに根拠のない15分候補、1分noise/overhead、60分比較を除いた。NFR-049-01は設定revision、scope、capacity、観測時間ごとにstate/countとlineageを分けて記録する。既存変更時点が分かる場合は区間を分割し、各区間のcapacity×経過時間を分母として扱う。変更時点または経過時間が不明ならunknown/未評価とし、0や成功率へ丸めない。

L10では通常fixture `CASE-OS-L10-049-04`をrevision一定・時間既知に限定し、`CASE-OS-L10-049-08`で記録済みrevision境界をまたぐ区間を誤って単一capacityで集計する変異を検出する。`CASE-OS-L10-049-09`は他入力を保ったまま観測時間だけをunknownにし、算出値を作らないことを確認する。NFR-049-01/02/03はこの正常区間・revision境界・unknown時間を別々に集計する。いずれも文書上のoracle候補で、fixture実行結果ではない。

## 6文書SHA-256

| 文書 | base `37a8283` | 作業後 | 変更 |
|---|---|---|---|
| `docs/helix-os/L3-requirements/functional-requirements.md` | `68bf95443b494e16bb2a72506358536d7d8740fb620e09d55ed0b922d3b9ed03` | `68bf95443b494e16bb2a72506358536d7d8740fb620e09d55ed0b922d3b9ed03` | なし |
| `docs/helix-os/L3-requirements/business-requirements.md` | `cbe1866df47503b17e8a11b786dee8da58cd8a2a0a99778b64bd4a669b2fa702` | `cbe1866df47503b17e8a11b786dee8da58cd8a2a0a99778b64bd4a669b2fa702` | なし |
| `docs/helix-os/L3-requirements/nfr-grade.md` | `d4e76c3dc15b28894937ddc0e39cb223aeef106284fae13b8ea4212dfce02726` | `b13de2fe0b2a5401c27286e21984eaeef070fd64967eea5c44ae1b79947dff07` | あり |
| `docs/helix-os/L10-verification/functional-verification.md` | `2c2ce95380e2deb5478bb06c27057d519373bfeabc9259799e400b390e0c5d3e` | `ae7eb6acae3eff36ad76299db8cd4cc2b3e16cc519e9c8b2c72bec01475789ce` | あり |
| `docs/helix-os/L10-verification/business-verification.md` | `f785e13aa9a1ef8494154f03e20d0582418916281c51a6b729d385d5b66ef051` | `f785e13aa9a1ef8494154f03e20d0582418916281c51a6b729d385d5b66ef051` | なし |
| `docs/helix-os/L10-verification/nfr-verification.md` | `156c0b6cf45630ba44f3540ceb97dae511fb7bdd93148e1a99ef4e0adfd9e543` | `b15bb880d09b246bb523674d03621d2021cde1305caef6485181cbce64ec8ade` | あり |

## 静的確認と限界

- `new_functional_cases_present`：PASS
- `new_cases_trace_to_ac04904`：PASS
- `nfr_case_03_present_and_traced`：PASS
- `no_duplicate_049_case_ids`：PASS
- `parent_ac04904_present`：PASS
- `unsupported_15_60_bucket_removed_from_049_rows`：PASS
- `git diff --check`：PASS。
- 文書IDとtraceだけを静的確認した。fixture、旧test、runtime、CIは実行していない。
- 確認範囲はOS-049の利用率計測と対応する六文書に限る。OS Stage3全体や旧source全consumerの完了を主張しない。
