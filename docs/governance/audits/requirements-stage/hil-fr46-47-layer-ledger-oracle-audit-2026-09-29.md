# HIL-FR-46/47 layer ledger・template抽出の要求／oracle監査

基準revision: `origin/main` `a53e24cf0bf27aa5ed39681716402cdd49902cc3`（PR #2295のPO判断を含む）
監査種別: read-only source-to-requirement / acceptance-oracle照合
対象: 旧HIL-FR-46、HIL-FR-47と、旧HST-CASE-030-04/-05。
本書は監査証跡であり、要求変更、採択変更、実装・受入実行、旧要求family全体のclosureを生成しない。

## 判定

旧要求の意味は、HARNESSの契約責務（HARNESS-L2-040/041）とOSの登録・保存・snapshot運転責務（HELIXOS-L2-038）へ分担して再導出されている。2026-09-29 PO判断記録は、各L2/L11の特定revisionを明示採択した。L2/L11本文に残る「候補」「未採択」等は採択前snapshot metadataであり、そのexact sectionについてはPO判断記録をauthorityとして読む。

要求意味の一致とacceptance oracleの具体性は別に判定する。040/041/038の契約本文と一般のL11例は採択済みだが、旧HST-CASE-030-04の原子性拒否、および030-05の同一入力・同一versionの抽出再実行で非決定的出力を隔離するoracleは、現行のL11に明示されていない。これはこの監査範囲で見つけたoracle明確化の残差である。030-04はHIL-NFR-29に紐づく旧cross-conditionで、FR-46/47単独の要求atomではない。

候補がPO採択されたことは、実装・実行やL11受入の実施を示さない。HARNESS L11-040/041は受入例であり、OS L11-038も未実行の受入oracle候補と明記する。旧IR全体、HR-FR-HIL-18、HAC/HATのcoverage closureも主張しない。

## 旧sourceの固定

旧要求表の正確なarchive sourceは [`infinity-loop-platform-requirements.md`](../../../../archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md) で、file SHA-256は `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`、asset IDは `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`。

| 旧ID | 行 | line SHA-256 | 要求意味と出力 |
|---|---:|---|---|
| HIL-FR-46 | 136 | `a62b63ab18b23ac9564d6c7ffca7580ac9471a6d6e7374f8e4a26c93f0441b6c` | canonical L1–L12ごとのledger type・粒度・必須node/edge・authority・input/output・entry/exit gate・template versionを登録する。L0 charterは層外anchorとして別登録する。rowはstable subject ID、revision、source span、semantic digest、status、owner、上下流edgeを持つ。旧出力: layer ledger catalog、row revision、layer snapshot、coverage receipt。 |
| HIL-FR-47 | 137 | `785f0998ca9fd2192bcddc638d1ef1233551c251e307e631303642abe7713fad` | active templateの章・field・table row・applicability rule・done-when・pair contractを原子的obligationとして機械抽出し、ledger候補行を作る。未対応、空/TBD、抽出不能、同一義務重複をfinding化し、LLM自由補完で埋めない。旧出力: template atom、ledger proposal、extractor/version digest、gap finding。 |

上表の行digestとsource textは[旧source atom inventory](../requirement-registration/harness-layer-ledger-extraction-source-lines-2026-09-28.jsonl)にも固定されている。別revisionの旧requirements IR、旧assertion/test-design設計、実装runtimeをこの二行と同じsource revisionとして扱わない。

## 現行責務分担とPO採択

| 責務 | 現行ID・範囲 | #2295 PO判断の固定値 |
|---|---|---|
| 意味契約 | [HARNESS-L2-040](../../../helix-harness/L2-requirements/product-requirements.md#harness-l2-040)／[L11-040](../../../helix-harness/L11-acceptance/product-acceptance.md#harness-l2-040)：canonical L1–L12 catalog、6組のV-pair、独立したL0 anchor、row identity/edge、snapshotとcoverage receiptの意味。 | 採択。register `MPR-RC-HARNESS-L2-040-002`。L2 section SHA-256 `c349606d7798e3f4eb5e6cb31e0618a83dcfa05f9fc888b0ce618f6d160757df`、L11 section SHA-256 `366518f8e32ac4dda1e5f4ec88ef0cfed6bc363d597955ffffb1a82d706fc212`。 |
| template抽出意味 | [HARNESS-L2-041](../../../helix-harness/L2-requirements/product-requirements.md#harness-l2-041)／[L11-041](../../../helix-harness/L11-acceptance/product-acceptance.md#harness-l2-041)：active template revision/scopeに対する原子的抽出、source span・applicability・digest、proposalと個別gap。空/TBD、未対応、抽出不能、重複の不完了扱い。 | 採択。register `MPR-RC-HARNESS-L2-041-002`。L2 section SHA-256 `d68926cf1d569478e86228065e9f4f2177f33be19166f48fbb31a167eb266260`、L11 section SHA-256 `259c383203d86b79c159395b64c0d03d88db665486d28f5fc2aea8f7556a73a8`。 |
| OS運転・保存 | [HELIXOS-L2-038](../../../helix-os/L2-requirements/governance-requirements.md#helixos-l2-038)／[L11-038](../../../helix-os/L11-acceptance/governance-acceptance.md#helixos-l2-038)：HARNESS定義済み契約とproposalを対象revision・authority・scopeへ束縛し、OS側のappend-only writer、snapshot/projection、receipt、stale/partial failure、再開を運転する。HARNESSの意味を再判定しない。 | 採択。register `MPR-RC-HELIXOS-L2-038-001`。L2 section SHA-256 `603b5db48045408a85d116071a4ad0f8a470064cd073a05beb9bc118f386fd6c`、L11 section SHA-256 `eabb68eaafc76f0080fbe9cb9c6904005c88b72e7cee9563f2515b4488de2e5d`。 |

根拠は[2026-09-29 PO判断記録](../../decisions/po-decision-2026-09-29-57candidates.md)の行45–46、61。記録はauthority effectを「mainへ登録された場合、明示固定revisionにのみ有効」とし、現行基準mainに含まれる。PO採択はL2/L11の意味revisionに対する要求decisionであり、実装許可、L3承認、受入実行のreceiptではない。

判断記録が固定する共通の現行文書file SHA-256は、HARNESS L2 `111cc0285e94bf0a1569627653ba1c578d5dcdf9dbedbbf168bb9acca3ae8d09`、HARNESS L11 `3c8831fc3e843791d9fa1901cf0060b90d1e41ad6a3a5ff4c33022fe9a9958c5`、OS L2 `89d79c76a7d46c4e1c76cf88046eac5a22dfcddcd96726c75cf82f0ddd80bdb2`、OS L11 `7547b0ada257c2cbc65771c8c83aaec58f4405e85e095f9bdfae4d1b56f2a0fd`であり、表のsection digestと合わせて対象revisionを特定する。

HARNESSの[2026-09-28 R2 source split receipt](../requirement-registration/harness-layer-ledger-extraction-coverage-receipt-2026-09-28-r2.json)と[OS writer coverage receipt](../requirement-registration/os-layer-ledger-writer-coverage-receipt-2026-09-28.json)は採択前に記録された証跡として不変保持される。そこに残る`candidate_state: unadopted`、旧scope説明、`preserved_pending_registration_refs`は当該receipt時点の記録であり、後続PO判断の状態投影として更新しない。source holding `MPR-SH-HARNESS-LAYER-LEDGER-EXTRACTION-001`は[現行management register](../../management-provisional-requirement-register.jsonl)に登録され、archive source atomの参照・保全を続ける。R2の`no_loss`は二つの旧source行から選択した候補入力範囲の条件別splitに限り、実装・全family closureを意味しない。

## 旧negative oracleとの対照

oracle sourceは [`infinity-loop-system-assertion-cases.md`](../../../../archive/legacy-generation-2026-09-14/root/docs/governance/infinity-loop-system-assertion-cases.md)、file SHA-256 `98d2f9c9721481e6b4363c0683c00b187ce789fd6a39723323eca72395102ea8`。

| 旧case / 行 | line SHA-256 | 旧negative oracle | 現行L2/L11との照合 |
|---|---|---|---|
| HST-CASE-030-04 / 293 | `88e977c12fc8d4c20830e2bbfe2e7da91b8477f6311ed1f6ef8702bfac54a1d9` | 一行に二義務を入れたledger commitをrejectし、row増分0、`HIL_LAYER_OBLIGATION_NOT_ATOMIC`。source rowはHIL-NFR-29。 | HARNESS-041の要求意味はatomic obligation。一件ずつatom化する正常例はあるが、集約atom入力をcommit時にrejectしrow増分0となる具体的negative case/failure oracleはL11-041に明記されない。意味の保持は確認、oracle具体化は不足。HIL-NFR-29を含むcross-conditionとして扱う。 |
| HST-CASE-030-05 / 294 | `2463bc4e08ed5c82aa3ad531f26fe81d455fe07e97a78130b7cd321f767cd58c` | 同一input/versionに異なるextraction digestを記録した状態でreplayし、quarantine・current更新0件・`HIL_LAYER_EXTRACTION_NONDETERMINISTIC`。source rowはHIL-FR-47。 | HARNESS-041はextractor/version digestとsemantic digestを出力するが、同一input/versionの二回の抽出結果を比較し、差分なら隔離・current不更新にする契約を明記しない。L11-041にそのnegative caseもない。OS-038/L11の同proposal/correlation IDに対するappend冪等性とpayload/base衝突拒否はstorage再試行の契約であり、extractor出力の非決定性検出とは異なる。 |

隣接旧caseは差分境界を確認するため照合した。CASE-030-02（line 291）はL7 registry entry欠落、030-03（line 292）はtemplate span欠落、030-06（295）はtemplate revision stale、030-07/-08（296–297）はempty/TBD、030-09（298）はunknown field、030-10（299）は重複obligationである。採択HARNESS L2/L11-040/041はこれらの意味条件またはgap/不完了扱いを記述している。030-04/-05をこれらの近接caseやOS append oracleで代用しない。

## 限界と次の扱い

- 本監査は旧FR46/47の二つの要求行、および指定された二つのsystem assertion caseだけを対象とする。HIL-BR-25、HIL-NFR-29全体、旧HR-FR-HIL-18、HAC/HAT、旧L0–L14 remapの完全な条件・fixture・consumer照合を行ったとは主張しない。
- 040/041/038は#2295で採択済みだが、L2/L11本文の採択前表現をこの監査で編集しない。OS-038はOSの保存・snapshot・候補proposal append責務で、HARNESS semantic catalog/extractionの意味ownerを置き換えない。
- 「受入oracleが具体化されていない」と「実装が失敗した」は別である。本証跡は旧caseと採択済みL11本文の静的比較だけで、テストも旧runtimeも実行していない。
- 次の要求整理ではCASE-030-04/-05の各oracleをL11へどう明示するかを、採択済み意味から逸脱しない範囲で個別reviewする。既存採択本文を変更する場合は対象revisionと必要なauthority状態を再確認する。ここでは新要求・追加承認手続き・実装条件を作らない。
