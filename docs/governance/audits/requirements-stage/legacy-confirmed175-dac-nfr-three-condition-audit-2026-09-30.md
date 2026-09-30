# confirmed175 DAC NFR 3条件の原文起点監査

## 範囲と結論

旧 `document-authority-census-requests.md` のconfirmed identity `DAC-NFR-001`、`DAC-NFR-004`、`DAC-NFR-005`だけを、旧原文から2026-09-28に固定された採択L2/L11 revisionへ個別に照合した。旧source file SHA-256は `81ac3006a11a087c069b196c1512b078ad5f19c1cff1da0ff34d8986ff2feb66`。assetは `LEGACY-ASSET-D201753B1A0CC6EA3980`。

3件とも、固定採択L2/L11には関係する境界の一部があるが、旧条件の全意味は確認できないため、旧監査の `OPEN` を保つ。正式successorは3件とも未割当である。本記録は意味差の監査であり、採択、successor、coverage、受入成功、またはStep 5完了を主張しない。authority effectは `none`。

## 旧sourceとasset記録

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/document-authority-census-requests.md` の63、66、67行。保全snapshotは `docs/governance/requirements-source/legacy-documents/docs/design/helix/L1-requirements/document-authority-census-requests.md`。
- 旧sourceとholding snapshotのfile digestは双方 `81ac3006a11a087c069b196c1512b078ad5f19c1cff1da0ff34d8986ff2feb66`。
- asset dispositionのrevision 3は `source_snapshot_preservation`、read-only・non-executable sourceとして記録し、`carry_forward_state=preserved_pending_rehome`、`decision_status=pending_human_confirmation`、正式target未割当を保持している。source snapshotの保存は要求配置・採択ではない。
- 個票 `legacy-confirmed175-full-audit-2026-09-28.json` の3行も、旧condition textとline digestを一致させ、`successor_requirement_ids=[]`、`mapping_authority_effect=none`、`audit_classification=部分再導出／旧固有条件・反例・数値・出力の一部が未確認`としている。

## 固定した現行照合対象

対象はPO decisionで合意された固定commit `f6dad2a33e24f000b87d7f09b8d40288257e74cc`のbytesに限定した。各文書のSHA-256は次のとおり。

| 文書 | 固定blob | SHA-256 | 該当箇所 |
|---|---|---|---|
| HARNESS L2 `docs/helix-harness/L2-requirements/product-requirements.md` | `e09de04601039d8593768eb3f3342d3416d03b8b` | `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a` | HARNESS-L2-010/011、340–361行 |
| HARNESS L11 `docs/helix-harness/L11-acceptance/product-acceptance.md` | `f827c6bd955bbeb91deba5b7dced93e512e5da9e` | `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4` | HARNESS-L2-010/011、205–206行 |
| OS L2 `docs/helix-os/L2-requirements/governance-requirements.md` | `44a2db57aac3e23963da283284d229b5269d7ed2` | `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf` | HELIXOS-L2-015、642行以降 |
| OS L11 `docs/helix-os/L11-acceptance/governance-acceptance.md` | `e75e5d5163149bc3c2ed48f973067ba991accc33` | `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680` | HELIXOS-L2-015、324–329行 |

この4文書は2026-09-28の各機構PO decisionが対象revisionとして固定したもの。L11は未実行の受入条件であり、記載だけから実行成功を推定しない。

## 条件別の照合

### DAC-NFR-001 — 同一HEAD・同一registry入力に対する決定性

**旧原文（63行）**：inventory、graph、findingは同一HEADと同一registry入力に対して決定的である。

HARNESS-L2-010は、同じ入力と版から同じpack成果物を再現することを要求し、HARNESS-L2-011は能力・契約版・依存版、相関ID付きの進行・結果・証拠を定める。HELIXOS-L2-015はsource identity・revision・digest、判断出所、責務を正本へ辿れるようにし、訂正履歴も追跡する。HARNESS L11の010は同じ入力・版からの再現を受入条件に含む。これらは再現性、固定入力、出所追跡の部分的な接点である。

一方、固定L2/L11はDACのinventory・graph・findingを同一HEADと同一registry入力で再生成したときの一致を受入oracleとして定めない。対象をHARNESSのpack成果物一般またはOSのauthority記録一般からDAC scannerへ広げることもできない。したがってDAC固有の決定性条件は未確認として残す。

### DAC-NFR-004 — 外部接続なしのrepo-local censusとadapter分離

**旧原文（66行）**：GitHub、network、providerがなくてもrepo-local censusを再現でき、外部surfaceは別adapterで追加する。

HARNESS-L2-011は特定GUI、ローカルpath、AI provider、CI製品に依存しない呼出しを定め、L2-010は外部実行接続を含む依存の明示を要求する。HELIXOS-L2-015はsourceのidentity・revision・digestと正本／Issue・PR等のprojectionを分けて記録する。これらは利用環境非依存とauthority/projection分離に部分的に接続する。

しかし固定L2/L11に、GitHub・network・providerを欠く環境でrepo-local censusを再現する条件や、外部surface接続を別adapterへ閉じる契約はない。ローカルpathを呼出し条件として要求しないことは、repo-local入力だけでcensusが再現可能であることの証明ではない。したがってoffline/repo-local実行条件とadapter境界は残差である。

### DAC-NFR-005 — scanner非変更とfinding／修復候補だけの出力

**旧原文（67行）**：scannerは文書本文を書き換えず削除せず、findingと修復候補だけを出力する。

HARNESS-L2-003は意味変更を右側で黙って書き換えずBackflowへ戻す状態境界を持ち、L2-004とそのL11条件は影響範囲、再検証、source atomの未計上・重複・digest相違を管理し、`no_loss`を誤って出さないことを定める。HELIXOS-L2-015は管理record・Issue/PR/CI・memoryから要求意味やdecisionを生成しないことと、原eventを保持することを定める。これらは自動的な意味変更・authority昇格を抑制し、finding／差戻しを扱う境界に部分的に接続する。

しかし、scannerによる文書本文の編集・削除を禁止する非変更契約、出力をfindingと修復候補に限定する契約、scannerのL11検査は固定revisionで確認できない。authorityの非生成と原event保持は文書corpus自体の非変更を保証しない。したがってDAC専用scannerの非変更・report-only出力条件を未確認残差として維持する。

## 重複監査と検証範囲

- GitHub上の現行main `0f5050e2b25cd622640c99c5de170cca087f7d8a`とlocal integration `d84a7388fc56fbdb4df97d2eb0f5f0ddea611053`では、3 identityは既存の全数監査に現れる。両revisionのREG-06母集団・join監査にもidentity/ledger参照があるが、いずれも本条件を個別に照合したmeaning-delta recordではない。作業開始時のローカル`main` `5f18c8b9fd8364a81fe7c8614cc48f3d34152e6f`も確認した。
- PR #2387–#2392の変更ファイル一覧を確認した。各PRはFRS受入、World Governance、FRS要求の分類、Concept metadataの別監査であり、DAC-NFR三条件の個別監査との重複はない。
- 静的確認で旧archive sourceとholding snapshotのfile digest、3 source line digest、固定revisionの4 target blob/SHA、PR変更pathと監査範囲の対応を確認した。JSON構文とMarkdown内部参照も検査した。
- 旧CLI・runtime・test・CIは実行していない。GitHubへのpush、PR、mergeは行わない。

## 状態

| 条件 | 照合結論 | successor | authority effect |
|---|---|---|---|
| DAC-NFR-001 | 再現性と入力固定は部分接続。DAC inventory/graph/findingの同一HEAD・registry oracleは未確認 | 未割当 | none |
| DAC-NFR-004 | provider等に依存しない呼出しとprojection分離は部分接続。offline repo-local censusと外部adapter分離は未確認 | 未割当 | none |
| DAC-NFR-005 | authority非生成・Backflow・no-loss境界は部分接続。scanner非変更とfinding／修復候補だけの出力は未確認 | 未割当 | none |
