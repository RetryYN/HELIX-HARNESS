# Goal 5：Scaffold validatorの監査（2026-09-25）

- status: `research_premise_candidate`
- authority_effect: `none`
- base SHA: `e57b2523b89dd29e6879c71e05ce49e86f1c07c0`（PR #2136取込後）
- scope: `scaffold/**/validate.py` 137件のうちGoal 5対象17件。

## 対象と判断

PR #2136を取り込んだmainの`e57b2523b89dd29e6879c71e05ce49e86f1c07c0`を起点に、`scaffold/**/validate.py`全137件を実行した。基準結果は91件合格、46件失敗。このうち本Goal 5の対象17件を以下に記録する。残る29件はGoal 1で扱う既知の不一致であり、`scaffold-validator-goal1-findings-2026-09-25.md`に別記されている。

対象17件はすべて意味の不一致として扱う。validator、inventory、source row、固定された意味条件は変更していない。赤の結果を停止条件として維持し、古いBindingを現行文書へ機械的に付け替えていない。137件すべての名前、前後の終了状態、標準出力・標準エラーを`scaffold-validator-goal5-results-2026-09-25.jsonl`に記録した。

## 個別の失敗と判断

| Validator | 直接原因の分類 | 基準時の直接原因 | 生成器の比較 | 意味上の停止理由と処置 |
|---|---|---|---|
| `scaffold/legacy-implementation-residual-0126/validate.py` | 参照差（固定upstream closure）＋意味差 | `E_BINDING_UPSTREAM: path/raw SHA closure` | `generate.py`あり。実行は終了コード0、追跡対象の差分なし。失敗は継続。 | 固定されたsource closureは、過去の承認済み四製品/L1対象を前提にしている。現在は製品属性と上流revisionが変わったため、現行digestへ差し替えると、変更後の意味を過去の残存調査が確認済みだと扱うことになる。失敗を維持。 |
| `scaffold/legacy-overlap-reconciliation-0144/validate.py` | schema差＋意味差 | `E_BINDING binding upstream exact schema`。validatorはupstream rowのキーを`{path, sha256}`に限定するが、現行Bindingには`note`もある。 | `generate.py`あり。再実行を試したところ、SCF-B-0144のupstream SHAを旧baseへ戻し、現行の付け直しnote（9/24 PO判断を記録したnoteを含む）を削除した。試行差分は復元した。 | row schemaの差が直接原因。背景には過去の四製品比較範囲と、LABOを除外する旧holdがある。現行境界ではHELIX-HARNESS/HELIX-Webのみが外部提供製品属性を持ち、HELIX-OS/HELIX-Web-OSは機構であり、LABOが評価・研究責務を担う。validatorやBindingを変えて合格させるとschema差と境界意味の変化を隠すため、両方を記録して失敗を維持。 |
| `scaffold/legacy-test-design-worker-workflow-0148/validate.py` | 意味差（non-upstream契約） | `E_BINDING: Binding non-upstream contract differs from code-pinned scaffold boundary`。現行Binding core SHAは`11fee501…`、validatorの固定値は`d334e2eb…`。 | 生成器なし。 | 単なる上流pinのずれではなく、non-upstream契約の差である。固定されたworker workflow test-design契約は現行の境界・配置判断より前のもので、`connections.boundary`の意味が現行Bindingと同じだとは確認できない。失敗を維持。 |
| `scaffold/legacy-semantic-review-wave37/validate.py` | 参照差（input digest）＋意味差 | `docs/concept/product-boundary.md`のinput digest不一致。 | 生成器あり。再実行でboundary、phase inventory、4つのL1文書、prior fixed inputのdigestが変わった。ledger JSONLは不変。再生成後は合格したが、試行を復元。 | `IRUNIT-HIL-NFR-01-HELIX-OS`、`…NFR-10-HELIX-OS`、`…NFR-19-HELIX-OS`を対象とする（archive requirements IR 4432、4819、5206行）。旧四製品モデルに基づく候補routingが固定されている。更新後の入力には後日のVision分類とOS/LABO責務変更が入る一方、ledgerは再レビューされていない。固定証拠と失敗を維持。 |
| `scaffold/legacy-semantic-review-wave38/validate.py` | 参照差（input digest）＋意味差 | product-boundary input digest不一致。 | 生成器あり。現行入力digestだけが更新され、ledger JSONLは不変。採用せず。 | 対象は`NFR-02-OS`、`NFR-06-OS`、`TR-07-OS`（archive IR 4475、4647、6430行）。旧四製品routingとauthority holdに基づくledgerであり、現行意味をレビューした記録ではないため失敗を維持。 |
| `scaffold/legacy-semantic-review-wave39/validate.py` | 参照差（input digest）＋意味差 | product-boundary input digest不一致。 | 生成器あり。現行入力digestだけを更新。採用せず。 | 対象は`NFR-14-OS`、`NFR-21-OS`、`TR-01-OS`、`TR-08-HARNESS`、`TR-08-OS`（4984、5285、6165、6466行）。固定routing前提と現行境界の意味が異なるため失敗を維持。 |
| `scaffold/legacy-semantic-review-wave40/validate.py` | 参照差（input digest）＋意味差 | product-boundary input digest不一致。 | 生成器あり。現行入力digestだけを更新。採用せず。 | 対象は`BR-20-HARNESS`、`FR-04-OS`、`FR-33-OS`、`NFR-03-OS`、`NFR-05-OS`（821、1557、2804、4511、4597行）。固定routing前提と現行境界の意味が異なるため失敗を維持。 |
| `scaffold/legacy-semantic-review-wave41/validate.py` | 参照差（input digest）＋意味差 | product-boundary input digest不一致。 | 生成器あり。現行入力digestだけを更新。採用せず。 | 対象は`NFR-06-HARNESS`、`NFR-07-HARNESS/OS`、`NFR-08-HARNESS/OS`（4640–4648、4683–4691、4726–4734行）。固定routing前提と現行境界の意味が異なるため失敗を維持。 |
| `scaffold/legacy-semantic-review-wave42/validate.py` | 参照差（input digest）＋意味差 | product-boundary input digest不一致。 | 生成器あり。現行入力digestだけを更新。採用せず。 | 対象は`NFR-09-HARNESS/OS`、`NFR-11-HARNESS/OS`、`NFR-12-HARNESS`（4767–4777、4853–4863、4896–4906行）。固定routing前提と現行境界の意味が異なるため失敗を維持。 |
| `scaffold/legacy-semantic-review-wave43/validate.py` | 参照差（input digest）＋意味差 | product-boundary input digest不一致。 | 生成器あり。現行入力digestだけを更新。採用せず。 | 対象は`NFR-12-OS`、`NFR-13-OS`、`NFR-15-HARNESS/OS`、`NFR-19-HARNESS`（4896–4906、4939–4949、5025–5035、5197–5207行）。固定routing前提と現行境界の意味が異なるため失敗を維持。 |
| `scaffold/legacy-semantic-review-wave44/validate.py` | 参照差（input digest）＋意味差 | product-boundary input digest不一致。 | 生成器あり。現行入力digestだけを更新。採用せず。 | 対象は`NFR-34/35/36/37/38/40-OS`、`TR-02/03/09/10-OS`（archive IR 5842–6161、6206–6290、6507–6591行）。固定routing前提と現行境界の意味が異なるため失敗を維持。 |
| `scaffold/legacy-semantic-review-wave45/validate.py` | 参照差（input digest）＋意味差 | product-boundary input digest不一致。 | 生成器あり。現行入力digestだけを更新。採用せず。 | 対象は`NFR-20/22/25-HARNESS`、`NFR-31/39-OS`、`TR-06/11-HARNESS`（5240–5282、5326–5368、5455–5497、5713–5755、6067–6114、6378–6420、6593–6635行）。固定routing前提と現行境界の意味が異なるため失敗を維持。 |
| `scaffold/legacy-semantic-review-wave46/validate.py` | 参照差（input digest）＋意味差 | product-boundary input digest不一致。 | 生成器あり。現行入力digestだけを更新。採用せず。 | 対象は`NFR-27/28/30-HARNESS/OS`（5541–5583、5584–5626、5670–5712行）。固定routing前提と現行境界の意味が異なるため失敗を維持。 |
| `scaffold/legacy-semantic-review-wave47/validate.py` | 参照差（input digest）＋意味差 | product-boundary input digest不一致。 | 生成器あり。現行入力digestだけを更新。採用せず。 | 対象は`NFR-23/24/26-HARNESS/OS`（5369–5410、5412–5453、5498–5539行）。固定routing前提と現行境界の意味が異なるため失敗を維持。 |
| `scaffold/legacy-semantic-review-wave48/validate.py` | 参照差（input digest）＋意味差 | product-boundary input digest不一致。 | 生成器あり。現行入力digestだけを更新。採用せず。 | 対象は`NFR-29/32-HARNESS/OS`、`NFR-33-HARNESS`（5627–5669、5756–5797、5799–5840行）。固定routing前提と現行境界の意味が異なるため失敗を維持。 |
| `scaffold/legacy-semantic-review-wave49/validate.py` | 参照差（input digest）＋意味差 | product-boundary input digest不一致。 | 生成器あり。現行入力digestだけを更新。採用せず。 | 対象は`TR-04/05-HARNESS/OS`、`TR-06/11-OS`（6292–6333、6335–6376、6378–6419、6593–6634行）。固定routing前提と現行境界の意味が異なるため失敗を維持。 |
| `scaffold/legacy-semantic-review-wave50/validate.py` | 参照差（input digest）＋意味差 | product-boundary input digest不一致。 | 生成器あり。現行入力digestだけを更新。採用せず。 | 対象は`NFR-20/22-OS`（5240–5281、5326–5367行）。固定routing前提と現行境界の意味が異なるため失敗を維持。 |

wave37–50の全14件で生成器を実験的に再実行した。product boundary、phase capability inventory、現行4つのL1入力（該当するwaveではprior-fixed inputも）が更新され、レビュー済みledger JSONLは変わらなかった。つまり、現在の資料digestを差し込むだけでvalidatorは合格するが、ledgerに記録された対象の再レビューにはならない。そのため全waveの再生成を採用しなかった。各waveの候補対象と保留routing状態は過去の記録であり、現在のrouting承認として扱わない。

## 旧sourceとauthorityの照合

現行sourceの照合範囲は次のとおり。`docs/concept/product-boundary.md:7`は外部提供する製品属性と機構を区別し、`:64–71`はOS/Web-OS/LABO間の改善loopを記す。9/24決定`docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:37–48`はWeb/Web-OSを要求層からVision材料へ分類し直す。9/25決定`docs/governance/decisions/mechanism-placement-po-decisions-2026-09-25.md:29–36,60–69`はLABO・Intelligence責務の配置と、OSに残す改善候補の登録・還流責務を記録する。

0126ではvalidatorが`BASE_REVISION=5562f04…`および`EXPECTED_PRODUCTS=(HELIX-HARNESS, HELIX-OS, HELIX-Web, HELIX-Web-OS)`を固定していること（`scaffold/legacy-implementation-residual-0126/validate.py:20,117`）、READMEの四製品責務候補scopeを確認した。0144はinventoryの同じarchive revisionと、`LABO: excluded; Issue #2089 hold remains in force`というauthority境界を固定している（`scaffold/legacy-overlap-reconciliation-0144/inventory.json`、validator `:596`、README）。したがって0144の直接エラーはupstream row schemaだが、修復すると旧scope・holdも現行Bindingへ誤って投影される。

旧sourceの照合先として、wave対象要件は`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json`の行を個別欄に記録した。旧workflow/test-designの関係では、資産明細台帳がuniversal workflow test design（`LEGACY-ASSET-CDB0C680878837FF2E36`、`docs/governance/legacy-asset-disposition.jsonl:2543`）とworker benchmark system test design（`LEGACY-ASSET-6F5F69296B4AB47B96E5`、同2787行）を歴史的/未解決としている。requirements IR snapshotは`LEGACY-ASSET-A60CF91DD2AF6693E6F9`（同2866行）。これらは所有者・atomization・要求binding・consumer等の残課題を持つ。旧CLAUDE `archive/legacy-generation-2026-09-14/root/CLAUDE.md:176–177`の誤った開発残滓を削除または明示的にsupersedeする規則は一般原則であり、今回の17対象を個別に裁定した直接前例とは確認できなかった。固定レビューを現行sourceへ機械的に付け直す旧手順も見つからなかった。本監査は差を記録するもので、retirement、supersession、新しいauthorityを宣言しない。

## 全137件の結果

変更後のscfctl 4検査はすべて終了コード0。`python3 -B scaffold/tools/scfctl.py stale`は`stale=0`、`validate`は`bindings=142 fail=0`、`residuals`は`residuals=0`、`selftest`は`cases=69 fail=0`。`git diff --check`も合格。


before/after JSONLは、基準revision `e57b2523b89dd29e6879c71e05ce49e86f1c07c0`と監査記録作成後に実行した137件すべてのpath、終了状態、標準出力、標準エラーを収録する。対象17件は基準と同じ診断で失敗を維持し、追加失敗はなかった。結果は基準・実行後とも91 pass / 46 fail、状態変化0件。Goal 5でvalidator条件やinventoryは変更していない。
