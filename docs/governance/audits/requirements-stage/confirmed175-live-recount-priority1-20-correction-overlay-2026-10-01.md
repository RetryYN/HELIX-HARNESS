# confirmed175 live recount priority 1–20 correction overlay（2026-10-01）

起点: `50686b6762788574cb471967e8c24846d3dd56ae`（origin/main）

前回の厳格訂正: commit `620e524c25b84e6a73ac017dffcfa7006b1f8466`、JSON SHA-256 `4e1580797bc360247f4efe5e1b5b5c598371f491a5a3a31423496e045ed7309b`
priority 1–20 bundle: commit `f6c864beec458ef1233e63099d52c6b6d68051ce`

## 同じ厳格条件での再計数

| 指標 | 件数 |
|---|---:|
| 前回overlayのunique strict comparison | 155 |
| 前回overlayで未確認 | 20 |
| priority 1–20 audit records | 20 |
| 厳格条件を満たすaudit records | 20 |
| 既存155との重複として除外 | 16 |
| 新たに資格を満たすunique identity | 4 |
| 訂正後unique strict comparison | 159 |
| 同じ条件で未確認 | 16 |
| formal successor assignment | 0 |
| source atom closure | 0 |
| preserved pending rehome | 175 |

同じidentity-specific record内に、confirmed175のsource-qualified identity、archive source file SHAと該当line SHA、identity-local comparison/residualがあることを確認した。監査artifactはF6 revisionと比較対象のHARNESS L2/L11 file SHAを固定している。archiveのfile/line SHAとF6 target digestは元commitのbytesに照合した。

## 新規に追加する4 identity

| Identity | 監査record | archive source | 同一recordの残存条件 |
|---|---|---|---|
| `BR-01` | `legacy-confirmed175-br01-br08-d01-d07-fixed-f6-condition-audit-2026-10-01.json` `/identities/0` | `business-requirements.md:41` | BR-01専用trace-completeness oracle、AI委譲後の回帰fixture/failure schema/閾値、単一案件end-to-end受入結果がない。 |
| `FR-L1-05` | `legacy-confirmed175-priority-11-20-fixed-f6-condition-audit-2026-10-01.json` `/identity_records/3` | `functional-requirements.md:36` | static predicate/config schema、unknown/missing config拒否、fail-close outcome schema、`.helix/phase.yaml`の扱いがない。 |
| `FR-L1-21` | 同上 `/identity_records/5` | `functional-requirements.md:52` | W観点対応、test level間の重複oracle、fail-close、finding schema、pass/failが定義されていない。 |
| `FR-L1-23` | 同上 `/identity_records/6` | `functional-requirements.md:54` | Full Vとの同格性、各value sliceのright-arm証拠、system受入の一体条件とfullback制限がない。 |

4件ともsource pin、比較record、残差は同一identity recordに存在する。各source file/line SHA、F6 revision、HARNESS L2/L11のpathとSHA-256はJSON companionに固定した。比較は旧source identityの移管、採択、successor割当て、closureを行わない。

## 既存155との重複として除外する16件

`BR-06`, `BR-08`, `D-01`–`D-09`, `UX-02`, `FR-L1-20`, `FR-L1-35`, `FR-L1-37`, `FR-L1-38`。priority audit上では同じ厳格条件を満たすが、前回155件にすでに含まれるため追加数は0とした。

## 残る未確認16件

`FR-L1-40`, `FR-L1-41`, `FR-L1-42`, `FR-L1-44`, `FR-L1-51`, `PM-01`, `DAC-FR-001`, `DAC-FR-002`, `DAC-FR-003`, `DAC-FR-009`, `DAC-FR-010`, `DAC-NFR-002`, `DAC-NFR-003`, `HBR-P6`, `S-BR-001`, `3L-BR-007`。これらには本overlayで新たに資格を与えていない。

既存の155/20 overlayとpriority 1–20 bundleの原本は変更していない。authority effect、承認、formal successor assignment、source atom closureはすべて0のままであり、175件すべてを`preserved_pending_rehome`として保持する。
