# OS Stage 3・親049 review01 Minor追補

- 記録種別：時点監査追補（immutable）
- 日付：2026-10-08
- 対象HEAD：`0b21246db2dc9c3aad48bf8ab4f73b56ffc7bc3e`
- 作業base：`37a8283be429c57f3706153ad522e7ad288fecc3`
- 固定親revision：`633bf12ea8f948db8ba3d6600179c4a9507377a7`
- 正式review：PR #2684 review01 comment `6045713435`、本文UTF-8 bytes SHA-256 `e927853b789a935c8d1d7b4b3b9b76e7f22b4cf2290cf65238006caedee68c06`（5120 bytes）
- 追補対象：固定親の意味・対象・owner・versionを変えず、AC-049-04と既存NFR-049-02の測定区間記述、ならびに前監査の根拠説明を明確化。
- 旧監査 [`os-stage3-parent049-window-stratification-2026-10-08-37a8283.md`](os-stage3-parent049-window-stratification-2026-10-08-37a8283.md) とJSONは変更していない。

## 固定親・判断・旧sourceの再照合

固定L2 `docs/helix-os/L2-requirements/governance-requirements.md:1205-1211`（全文SHA-256 `c530b01dbf396481f3ea0124f9a603d2a8ddfb813c9ab1e88db316262342949a`、span SHA-256 `e9372f19e5064cb5470141fef25a3212aa65cede5d44ecfff8c9ed86da83668b`）では、設定上限が変更可能で、登録数・上限と実行数・throughputを同一視しない。固定L11 `docs/helix-os/L11-acceptance/governance-acceptance.md:821-828`（全文SHA-256 `40b2d902a2ed321c337d6982d3d61443e77e9d50d078bf698c3208038c9f6997`、span SHA-256 `d5a3a0c361a6d0056a8c608f5230a52d206c000d7ac81ff969aeaba30ad4d810`）は分母・観測時点・scopeのoracleを示す。このL11 spanには「missing time/capacityを成功分母へ入れない」という文言はない。時間またはcapacity欠落をunknown/未評価とする根拠は、既存 `CASE-OS-L10-049-04`（`functional-verification.md:678`）であり、前監査のL11帰属をこのように訂正する。

PO判断 `docs/governance/decisions/helix-os-stage3-l3-l10-po-decision-2026-10-05.md:59`（作業base `37a8283be429c57f3706153ad522e7ad288fecc3` 上の原文、当該行SHA-256 `e1c24c9297b78e687ff3725b62218e7258d3d0b164eb4eeac55997a8d545d017`） は、15min/15・60min候補を固定親・旧sourceに根拠のない測定設計案として明記または除去するよう明示する。前監査の候補値除去はこの判断に沿う。旧sourceに状態保存義務を定める根拠は確認できないため、review01 Minor1に従い、そのような新規義務は追加しない。

旧sourceの範囲差は次の通り。固定L2:1211が参照する原文のlocatorは `three-lane-capacity-profile-requests.md:17-21`、`three-lane-capacity-profile-requirements.md:31`、`management-integration-cell-requirements.md:58-60,104-106`。前監査は関連記述を狭く選んだ箇所を locator として記録していた。現物を読み直した選択spanはそれぞれ、旧requests `15-17`（3L-BR-010の見出しとcapacity/WIP分離、span SHA-256 `5fa5dd54753c0f7d6de806ebdd5a4788c2c5e7aa39e3dd37722b7fd878336f9b`）、旧requirements `29-31`（3L-R-28の見出しとbackpressure、`f4cfd36029a75bfefa296aef38edb4b55538e1a57149006b9f5924a394fcb7a0`）、旧MIC `56-60`と`102-106`（READY割当・順序・空きcapacity再利用、各span SHA-256 `f5410868cedfd32d77983ec79de795850885f9cbddc1ce4160805203eb3eca39`、`9508c4439c191599853307e0096d8ec21eabbe3dd98abed165be38d61531e222`）。全ファイルSHAは前監査の固定値を再確認した。locator差は選択spanと固定L2の参照locatorの差として記録し、同一範囲だったとは主張しない。

## 本文の限定修正

- `AC-OS-L3-049-04` は、configured capacityとelapsed observed timeの積を用いるwindowが同じ設定revision内であることを明示した。これは既存 `CASE-OS-L10-049-04` の設定revision一定条件と整合する。
- `CASE-OS-L10-NFR-049-02` はrevisionごとの個別分母を常に別記し、既存観測時点から全区間境界を判別できる場合だけ合算値も示すと明確化した。境界が一部でも不明なら合算を作らずunknown/未評価を保つ。
- 対象外の四本文（BR、NFR grade、BV、FV）は変更していない。Minor1に関する状態保存要件も追加していない。

## 6本文SHA-256

「修正前」はreview01追補作業開始時のHEAD `0b21246db2dc9c3aad48bf8ab4f73b56ffc7bc3e`、すなわち旧時点監査作成後の本文を指す。

| 文書 | 修正前 `0b21246` | 修正後tree | 今回差分 |
|---|---|---|---|
| `docs/helix-os/L3-requirements/business-requirements.md` | `cbe1866df47503b17e8a11b786dee8da58cd8a2a0a99778b64bd4a669b2fa702` | `cbe1866df47503b17e8a11b786dee8da58cd8a2a0a99778b64bd4a669b2fa702` | なし |
| `docs/helix-os/L3-requirements/functional-requirements.md` | `68bf95443b494e16bb2a72506358536d7d8740fb620e09d55ed0b922d3b9ed03` | `60d1e7f55115f2b645971131b1925a57df3509806e0a30fb5348933c37320919` | AC-049-04 |
| `docs/helix-os/L3-requirements/nfr-grade.md` | `b13de2fe0b2a5401c27286e21984eaeef070fd64967eea5c44ae1b79947dff07` | `b13de2fe0b2a5401c27286e21984eaeef070fd64967eea5c44ae1b79947dff07` | なし |
| `docs/helix-os/L10-verification/business-verification.md` | `f785e13aa9a1ef8494154f03e20d0582418916281c51a6b729d385d5b66ef051` | `f785e13aa9a1ef8494154f03e20d0582418916281c51a6b729d385d5b66ef051` | なし |
| `docs/helix-os/L10-verification/functional-verification.md` | `ae7eb6acae3eff36ad76299db8cd4cc2b3e16cc519e9c8b2c72bec01475789ce` | `ae7eb6acae3eff36ad76299db8cd4cc2b3e16cc519e9c8b2c72bec01475789ce` | なし |
| `docs/helix-os/L10-verification/nfr-verification.md` | `b15bb880d09b246bb523674d03621d2021cde1305caef6485181cbce64ec8ade` | `b6cada49897d94dbee7d428b95ce4b3487019c0e032cc69ad1596388d2baf3ed` | NFR-049-02 |

## 確認と限界

`git diff --check` と対象行・CASE ID/traceの静的確認を行う。fixtureは実行していない。#2684の他Minorについて、本文変更を求めないものは本追補の根拠説明で対応し、他のOS Stage3親・旧source consumerの全体監査は主張しない。
