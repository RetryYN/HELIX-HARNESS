# Goal 5：Scaffold validatorの監査（2026-09-25）

- status: `research_premise_candidate`
- authority_effect: `none`
- base SHA: `e57b2523b89dd29e6879c71e05ce49e86f1c07c0`（PR #2136取込後）
- scope: `scaffold/**/validate.py` 137件のうちGoal 5対象17件。

## 対象と判断

PR #2136を取り込んだmainの`e57b2523b89dd29e6879c71e05ce49e86f1c07c0`を起点に、`scaffold/**/validate.py`全137件を実行した。基準結果は91件合格、46件失敗。このうち本Goal 5の対象17件を以下に記録する。残る29件はGoal 1で扱う既知の不一致であり、`scaffold-validator-goal1-findings-2026-09-25.md`に別記されている。

基準時の対象17件のうち、wave37–50の14件は、各ledger rowの保留・候補状態と現行の明示decisionを照合し、意味条件に矛盾がないことを確認したため、生成器でinput/prior-meta digestを更新した。ledger JSONLと候補・保留fieldは不変で、14 validatorは合格した。0126、0144、0148の3件は意味・契約不一致を解消できないため、固定条件を維持して失敗を残した。137件すべての名前、前後の終了状態、標準出力・標準エラーを`scaffold-validator-goal5-results-2026-09-25.jsonl`に記録した。

## 個別の失敗と判断

| Validator | 直接原因の分類 | 基準時の直接原因 | 生成器の比較 | 意味上の停止理由と処置 |
|---|---|---|---|---|
| `scaffold/legacy-implementation-residual-0126/validate.py` | 参照差（固定upstream closure）＋意味差 | `E_BINDING_UPSTREAM: path/raw SHA closure` | `generate.py`あり。実行は終了コード0、追跡対象の差分なし。失敗は継続。 | 固定されたsource closureは、過去の承認済み四製品/L1対象を前提にしている。現在は製品属性と上流revisionが変わったため、現行digestへ差し替えると、変更後の意味を過去の残存調査が確認済みだと扱うことになる。失敗を維持。 |
| `scaffold/legacy-overlap-reconciliation-0144/validate.py` | schema差＋意味差 | `E_BINDING binding upstream exact schema`。validatorはupstream rowのキーを`{path, sha256}`に限定するが、現行Bindingには`note`もある。 | `generate.py`あり。再実行を試したところ、SCF-B-0144のupstream SHAを旧baseへ戻し、現行の付け直しnote（9/24 PO判断を記録したnoteを含む）を削除した。試行差分は復元した。 | row schemaの差が直接原因。背景には過去の四製品比較範囲と、LABOを除外する旧holdがある。現行境界ではHELIX-HARNESS/HELIX-Webのみが外部提供製品属性を持ち、HELIX-OS/HELIX-Web-OSは機構であり、LABOが評価・研究責務を担う。validatorやBindingを変えて合格させるとschema差と境界意味の変化を隠すため、両方を記録して失敗を維持。 |
| `scaffold/legacy-test-design-worker-workflow-0148/validate.py` | 意味差（non-upstream契約） | `E_BINDING: Binding non-upstream contract differs from code-pinned scaffold boundary`。現行Binding core SHAは`11fee501…`、validatorの固定値は`d334e2eb…`。 | 生成器なし。 | 単なる上流pinのずれではなく、non-upstream契約の差である。固定されたworker workflow test-design契約は現行の境界・配置判断より前のもので、`connections.boundary`等のnon-upstream契約field差を現行判断史と照合した。過去の固定core SHA `d334e2eb…` は`b06607540`時点、`7aa2c1208`（`docs: resolve concept requirement review findings`）で`e88a0cf9…`へ変わり、`connections.dependencies`、`boundary`、`obligations`、`owner_candidate`、`reason`が変更された。さらに`a0e56c4cd`で9/24 PO判断の前提noteが加わり、core SHAは`11fee501…`となった。validator `:655–658`はupstreamを除外してcanonical coreを計算する。したがって、単なるupstream pin差でなく、固定されたnon-upstream境界契約の変更であり、失敗を維持。 |
| `scaffold/legacy-semantic-review-wave37/validate.py` | 参照差（input/prior-meta digest） | `docs/concept/product-boundary.md`のinput digest不一致。 | 生成器あり。順次再実行を採用し、boundary、phase inventory、4つのL1文書、prior-meta input digestを更新。ledger JSONLは不変。再生成後PASS。 | 対象ledger rowは候補routing・人判断待ち・authorityなしで、製品ownerの確定を主張しない。明示decisionとの確定矛盾を見つけられなかったため、生成器の再生成を採用する。照合行と入力差分は下表に記録。 |
| `scaffold/legacy-semantic-review-wave38/validate.py` | 参照差（input/prior-meta digest） | product-boundary input digest不一致。 | 生成器あり。順次再実行を採用し、現行input/prior-meta digestを更新。ledger JSONLは不変。再生成後PASS。 | 対象は`NFR-02-OS`、`NFR-06-OS`、`TR-07-OS`（archive IR 4475、4647、6430行）。ledger rowは候補・人判断待ち・authorityなしで、確定ownerを主張しない。README:38も現owner未確定、Web/Web-OSへの単独routing根拠なしとする。現行明示decisionとの確定矛盾はなく、生成器再生成を採用する。row単位の照合は下表に記録。 |
| `scaffold/legacy-semantic-review-wave39/validate.py` | 参照差（input/prior-meta digest） | product-boundary input digest不一致。 | 生成器あり。順次再実行を採用し、現行input/prior-meta digestを更新。ledger JSONLは不変。再生成後PASS。 | 対象は`NFR-14-OS`、`NFR-21-OS`、`TR-01-OS`、`TR-08-HARNESS`、`TR-08-OS`（4984、5285、6165、6466行）。ledger rowは候補・人判断待ち・authorityなしで、確定ownerを主張しない。現行の明示decisionとの確定矛盾はなく、生成器再生成を採用する。row単位の照合は下表に記録。 |
| `scaffold/legacy-semantic-review-wave40/validate.py` | 参照差（input/prior-meta digest） | product-boundary input digest不一致。 | 生成器あり。順次再実行を採用し、現行input/prior-meta digestを更新。ledger JSONLは不変。再生成後PASS。 | 対象は`BR-20-HARNESS`、`FR-04-OS`、`FR-33-OS`、`NFR-03-OS`、`NFR-05-OS`（821、1557、2804、4511、4597行）。ledger rowは候補・人判断待ち・authorityなしで、確定ownerを主張しない。現行の明示decisionとの確定矛盾はなく、生成器再生成を採用する。row単位の照合は下表に記録。 |
| `scaffold/legacy-semantic-review-wave41/validate.py` | 参照差（input/prior-meta digest） | product-boundary input digest不一致。 | 生成器あり。順次再実行を採用し、現行input/prior-meta digestを更新。ledger JSONLは不変。再生成後PASS。 | 対象は`NFR-06-HARNESS`、`NFR-07-HARNESS/OS`、`NFR-08-HARNESS/OS`（4640–4648、4683–4691、4726–4734行）。ledger rowは候補・人判断待ち・authorityなしで、確定ownerを主張しない。現行の明示decisionとの確定矛盾はなく、生成器再生成を採用する。row単位の照合は下表に記録。 |
| `scaffold/legacy-semantic-review-wave42/validate.py` | 参照差（input/prior-meta digest） | product-boundary input digest不一致。 | 生成器あり。順次再実行を採用し、現行input/prior-meta digestを更新。ledger JSONLは不変。再生成後PASS。 | 対象は`NFR-09-HARNESS/OS`、`NFR-11-HARNESS/OS`、`NFR-12-HARNESS`（4767–4777、4853–4863、4896–4906行）。ledger rowは候補・人判断待ち・authorityなしで、確定ownerを主張しない。現行の明示decisionとの確定矛盾はなく、生成器再生成を採用する。row単位の照合は下表に記録。 |
| `scaffold/legacy-semantic-review-wave43/validate.py` | 参照差（input/prior-meta digest） | product-boundary input digest不一致。 | 生成器あり。順次再実行を採用し、現行input/prior-meta digestを更新。ledger JSONLは不変。再生成後PASS。 | 対象は`NFR-12-OS`、`NFR-13-OS`、`NFR-15-HARNESS/OS`、`NFR-19-HARNESS`（4896–4906、4939–4949、5025–5035、5197–5207行）。ledger rowは候補・人判断待ち・authorityなしで、確定ownerを主張しない。現行の明示decisionとの確定矛盾はなく、生成器再生成を採用する。row単位の照合は下表に記録。 |
| `scaffold/legacy-semantic-review-wave44/validate.py` | 参照差（input/prior-meta digest） | product-boundary input digest不一致。 | 生成器あり。順次再実行を採用し、現行input/prior-meta digestを更新。ledger JSONLは不変。再生成後PASS。 | 対象は`NFR-34/35/36/37/38/40-OS`、`TR-02/03/09/10-OS`（archive IR 5842–6161、6206–6290、6507–6591行）。ledger rowは候補・人判断待ち・authorityなしで、確定ownerを主張しない。現行の明示decisionとの確定矛盾はなく、生成器再生成を採用する。row単位の照合は下表に記録。 |
| `scaffold/legacy-semantic-review-wave45/validate.py` | 参照差（input/prior-meta digest） | product-boundary input digest不一致。 | 生成器あり。順次再実行を採用し、現行input/prior-meta digestを更新。ledger JSONLは不変。再生成後PASS。 | 対象は`NFR-20/22/25-HARNESS`、`NFR-31/39-OS`、`TR-06/11-HARNESS`（5240–5282、5326–5368、5455–5497、5713–5755、6067–6114、6378–6420、6593–6635行）。ledger rowは候補・人判断待ち・authorityなしで、確定ownerを主張しない。現行の明示decisionとの確定矛盾はなく、生成器再生成を採用する。row単位の照合は下表に記録。 |
| `scaffold/legacy-semantic-review-wave46/validate.py` | 参照差（input/prior-meta digest） | product-boundary input digest不一致。 | 生成器あり。順次再実行を採用し、現行input/prior-meta digestを更新。ledger JSONLは不変。再生成後PASS。 | 対象は`NFR-27/28/30-HARNESS/OS`（5541–5583、5584–5626、5670–5712行）。ledger rowは候補・人判断待ち・authorityなしで、確定ownerを主張しない。現行の明示decisionとの確定矛盾はなく、生成器再生成を採用する。row単位の照合は下表に記録。 |
| `scaffold/legacy-semantic-review-wave47/validate.py` | 参照差（input/prior-meta digest） | product-boundary input digest不一致。 | 生成器あり。順次再実行を採用し、現行input/prior-meta digestを更新。ledger JSONLは不変。再生成後PASS。 | 対象は`NFR-23/24/26-HARNESS/OS`（5369–5410、5412–5453、5498–5539行）。ledger rowは候補・人判断待ち・authorityなしで、確定ownerを主張しない。現行の明示decisionとの確定矛盾はなく、生成器再生成を採用する。row単位の照合は下表に記録。 |
| `scaffold/legacy-semantic-review-wave48/validate.py` | 参照差（input/prior-meta digest） | product-boundary input digest不一致。 | 生成器あり。順次再実行を採用し、現行input/prior-meta digestを更新。ledger JSONLは不変。再生成後PASS。 | 対象は`NFR-29/32-HARNESS/OS`、`NFR-33-HARNESS`（5627–5669、5756–5797、5799–5840行）。ledger rowは候補・人判断待ち・authorityなしで、確定ownerを主張しない。現行の明示decisionとの確定矛盾はなく、生成器再生成を採用する。row単位の照合は下表に記録。 |
| `scaffold/legacy-semantic-review-wave49/validate.py` | 参照差（input/prior-meta digest） | product-boundary input digest不一致。 | 生成器あり。順次再実行を採用し、現行input/prior-meta digestを更新。ledger JSONLは不変。再生成後PASS。 | 対象は`TR-04/05-HARNESS/OS`、`TR-06/11-OS`（6292–6333、6335–6376、6378–6419、6593–6634行）。ledger rowは候補・人判断待ち・authorityなしで、確定ownerを主張しない。現行の明示decisionとの確定矛盾はなく、生成器再生成を採用する。row単位の照合は下表に記録。 |
| `scaffold/legacy-semantic-review-wave50/validate.py` | 参照差（input/prior-meta digest） | product-boundary input digest不一致。 | 生成器あり。順次再実行を採用し、現行input/prior-meta digestを更新。ledger JSONLは不変。再生成後PASS。 | 対象は`NFR-20/22-OS`（5240–5281、5326–5367行）。ledger rowは候補・人判断待ち・authorityなしで、確定ownerを主張しない。現行の明示decisionとの確定矛盾はなく、生成器再生成を採用する。row単位の照合は下表に記録。 |

wave37–50は各生成器を順番に再実行し、input digestおよびprior-meta lineage digestを更新した。ledger JSONLは全行不変で、validatorは合格した。これは現在資料への参照整合性を回復した結果であり、ledgerに記録された候補・保留状態を承認済みroutingへ昇格させない。rowごとの照合根拠、変更したmeta SHA-256、Binding依存は以下に記録する。

## wave37–50のrow単位照合と採用範囲

各JSONL行で`product_scope`はHELIX-OSまたはHELIX-HARNESSのみ。確認対象の各rowは`product_alignment_status=candidate_boundary_pending_human_decision`、`routing_state=candidate_product_routing_requires_human_review`、`authority_effect=none`、`new_build_allowed=false`、`phase_authority_status=candidate_unchanged`を保持する。従って`candidate_product_targets`は探索候補集合で、承認済みowner/routingの宣言ではない。現行9/24 decision（下記:37–48）はWeb/Web-OSをVision材料へ移し、9/25 decision（:29–36,60–69）はLABO/OS責務を明示したが、これらのwave rowにあるHIL-* IDへの承認済みrouting変更は示していない。差異がある候補crosswalkも未承認candidate同士の差として扱い、PO決定と誤認しない。

| Wave | JSONL row番号と対象unit | 旧requirements IR行 | 確認したrow/fieldと結果 |
|---|---|---|---|
| 37 | 1 NFR01-OS; 4 NFR10-OS; 7 NFR19-OS | 4432, 4819, 5206 | 上記candidate/hold field。確定routeなし。 |
| 38 | 1 NFR02-OS; 4 NFR06-OS; 7 TR07-OS | 4475, 4647, 6430 | 同上。README:38は旧OS候補保存、現owner未確定、Web/Web-OSへの単独routing根拠なしと明記。 |
| 39 | 1 NFR14-OS; 4 NFR21-OS; 7 TR01-OS; 10 TR08-HARNESS; 13 TR08-OS | 4984, 5285, 6165, 6466 | 同上。確定routeなし。 |
| 40 | 1 BR20-HARNESS; 4 FR04-OS; 7 FR33-OS; 8 NFR03-OS; 11 NFR05-OS | 821, 1557, 2804, 4511, 4597 | 同上。確定routeなし。 |
| 41 | 1 NFR06-HARNESS; 3/5 NFR07-HARNESS/OS; 6/8 NFR08-HARNESS/OS | 4640–4648, 4683–4691, 4726–4734 | 同上。確定routeなし。 |
| 42 | 1/4 NFR09-HARNESS/OS; 7/9 NFR11-HARNESS/OS; 10 NFR12-HARNESS | 4767–4777, 4853–4863, 4896–4906 | 同上。確定routeなし。 |
| 43 | 1 NFR12-OS; 2 NFR13-OS; 4/7 NFR15-HARNESS/OS; 10 NFR19-HARNESS | 4896–4906, 4939–4949, 5025–5035, 5197–5207 | 同上。確定routeなし。 |
| 44 | 1 NFR34-OS; 4 NFR35-OS; 7 NFR36-OS; 10 NFR37-OS; 13 NFR38-OS; 16 NFR40-OS; 19 TR02-OS; 22 TR03-OS; 25 TR09-OS; 28 TR10-OS | 5842–6161, 6206–6290, 6507–6591 | 同上。NFR35のOS scopeとcrosswalk候補OS+LABOの差はcandidate-to-candidate。現行PO判断L2-005とは対象IDが異なり、承認済み矛盾ではない。 |
| 45 | 1 NFR20-HARNESS; 3 NFR22-HARNESS; 5 NFR25-HARNESS; 7 NFR31-OS; 8 NFR39-OS; 9 TR06-HARNESS; 12 TR11-HARNESS | 5240–5282, 5326–5368, 5455–5497, 5713–5755, 6067–6114, 6378–6420, 6593–6635 | 同上。確定routeなし。 |
| 46 | 1/3 NFR27-HARNESS/OS; 6/8 NFR28-HARNESS/OS; 10/12 NFR30-HARNESS/OS | 5541–5583, 5584–5626, 5670–5712 | 同上。確定routeなし。 |
| 47 | 1/3 NFR23-HARNESS/OS; 4/7 NFR24-HARNESS/OS; 10/12 NFR26-HARNESS/OS | 5369–5410, 5412–5453, 5498–5539 | 同上。確定routeなし。 |
| 48 | 1/3 NFR29-HARNESS/OS; 4/6 NFR32-HARNESS/OS; 7 NFR33-HARNESS | 5627–5669, 5756–5797, 5799–5840 | 同上。確定routeなし。 |
| 49 | 1/2 TR04-HARNESS/OS; 3/5 TR05-HARNESS/OS; 7 TR06-OS; 9 TR11-OS | 6292–6333, 6335–6376, 6378–6419, 6593–6634 | 同上。確定routeなし。 |
| 50 | 1 NFR20-OS; 3 NFR22-OS | 5240–5281, 5326–5367 | 同上。確定routeなし。 |

旧JSONL行番号は各waveの`legacy-requirement-direct-semantic-review-waveNN.jsonl`内の1-based row番号。archive IR行番号は`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json`。全waveについて生成器で更新したのはmetaのcurrent input digestとprior-meta lineage digestのみ。固定JSONL、候補scope、hold、authority fieldに差分はない。

## 生成metaとBinding rebindの証跡

14個のmetaは順序どおりwave37→50で再生成した。下表のSHA-256はbase `2ba366250790030c1110888950ac9685a1cebb77`から変更後への完全値。入力資料の差として`docs/concept/product-boundary.md:7,64–71`、phase inventoryのstatus/revision参照、および4対象L1（HARNESS/OS/Web/Web-OS）の内容・revision更新が反映された。これらの更新は参照digestを現行化するもので、上記ledger意味fieldを変えていない。

| Wave | meta path | 旧SHA-256 | 新SHA-256 |
|---|---|---|---|
| 37 | `scaffold/legacy-semantic-review-wave37/legacy-requirement-direct-semantic-review-wave37.meta.json` | `6e38f8169c4a7fda0cac19a679acd9c164dc5f036376b001339bd2e9c0957d36` | `7f542d5811491ee2d00f9d6d8e6fb94ebd3b0fc90be70f02369279a2678e4379` |
| 38 | `scaffold/legacy-semantic-review-wave38/legacy-requirement-direct-semantic-review-wave38.meta.json` | `0600255c3bd0486041f006d2dd8b7a959bd86ca7e6e12519d8c9ef7d68db3527` | `f44d9b68f862565713a5dc2c532f6a00d7af3339bf5f2134bc666e3175148dd2` |
| 39 | `scaffold/legacy-semantic-review-wave39/legacy-requirement-direct-semantic-review-wave39.meta.json` | `8b8185804e4aeb1bb7c482f625863d763c188ddcfbe38051f5575c5784d1b9b3` | `dab39a96b836c80701216fa98dffde0298b2a4137462a6bd85fbffffb7d5583f` |
| 40 | `scaffold/legacy-semantic-review-wave40/legacy-requirement-direct-semantic-review-wave40.meta.json` | `dcb11e2de949d11892d55c2c2d7bcb599948221482262066c150ad3898ae4ada` | `14d233c47027efa74f188aaa37ed267fe14c91b9eae03697f82e437c464efce6` |
| 41 | `scaffold/legacy-semantic-review-wave41/legacy-requirement-direct-semantic-review-wave41.meta.json` | `3438e8bc0469af4387d6f8ba3d0de19c80836110da9583e01112c0acb7289b74` | `e2630eefb0c3961b420c143febf9f4f992b83577a34484f44686e0d7cc4356c4` |
| 42 | `scaffold/legacy-semantic-review-wave42/legacy-requirement-direct-semantic-review-wave42.meta.json` | `67cf81adb01c8f5848586bcf368a9f229d81b3adef47e22b0ae060b84778843d` | `c6d6b9da7a83c9ad717ca1713c715c90ea1f4853ba7790bf46982d92ff0a7674` |
| 43 | `scaffold/legacy-semantic-review-wave43/legacy-requirement-direct-semantic-review-wave43.meta.json` | `8b56237ca8fb0f7ce3c63ec9757594478e5025d99ed3bc1d1a9479a2e0fc91ef` | `91a66bf5b6613e3c2847c565cb786302bcb7cb610353d29d8cec0aa49ab37ecb` |
| 44 | `scaffold/legacy-semantic-review-wave44/legacy-requirement-direct-semantic-review-wave44.meta.json` | `e145b8eb1eb7d32b6aecfc7fcf159a69a881b6d5907350571067b479fb96adc6` | `3d1f701544e6d7ba22e8e69233014c1774a25657ada2c4bb7c45096edf4f7d20` |
| 45 | `scaffold/legacy-semantic-review-wave45/legacy-requirement-direct-semantic-review-wave45.meta.json` | `1b97993eb71233c66721aa2bb818d6a606864c6c479483ab9240e576ec6f0a59` | `0eca98408654a85aaf3f8716d7078c7ead35f0a6e7e8311c9c6ba5b354fde34f` |
| 46 | `scaffold/legacy-semantic-review-wave46/legacy-requirement-direct-semantic-review-wave46.meta.json` | `862fb2bf65032ab1fb073f560b107608b0d917ed9bb4889c624aa5e322b83077` | `9bea4c61726af019f9e175aa37d25485ce2764af397431d5ffefe500545ff8ab` |
| 47 | `scaffold/legacy-semantic-review-wave47/legacy-requirement-direct-semantic-review-wave47.meta.json` | `f1820ce62789cd82a79456adc9c0264314997f19344922d722037bf23233a9e2` | `2ba1c46edb5ee311d7a2e7278cb991c907f5b113c5746c3e4171a5cff3699b30` |
| 48 | `scaffold/legacy-semantic-review-wave48/legacy-requirement-direct-semantic-review-wave48.meta.json` | `80532ad1ef212fb405d362ac62bd7773095b9fc9983239aa272bffcae6bf3990` | `5c32eccfa4cdfda66150c8da58a709e0cb5b17c5bc381ae492c78ac36ae470db` |
| 49 | `scaffold/legacy-semantic-review-wave49/legacy-requirement-direct-semantic-review-wave49.meta.json` | `ba315824038686077b64561a03c670335726a6a6dea3b88cdc75d36ff954a30c` | `1936ae4abcc3e1643f6a15503725d2ce731af194f450e2c1736c5ae0266a0a16` |
| 50 | `scaffold/legacy-semantic-review-wave50/legacy-requirement-direct-semantic-review-wave50.meta.json` | `e62712988c2c006a0fb31c7231d83b9cba25882d533404e02b6ee0d659971016` | `36ffccf576c08cd7e9871371ad489b23a566a9a9a474d9003f7a9319bba2b76a` |

scfctl `stale`で直接meta pathを参照するBindingは次の14件と特定した（広いwave directory検索の44件を全件rebindしたわけではない）。rebind前に各Bindingの`role`、`obligations`、`reason`、`connections`（consumers/dependenciesを含む）、`operations`、`artifacts`、`verification`、`replacement`を旧JSONと比較し、全field不変を確認した。変更は全upstream依存rowのSHAと、再生成理由・旧新digest・authority不変を記したnoteだけ。

| Binding | 直接参照するwave meta（旧SHA先頭→新SHA先頭） |
|---|---|
| SCF-B-0061 | 37 (`6e38f8169c4a`→`7f542d581149`) |
| SCF-B-0064 | 37 (`6e38f8169c4a`→`7f542d581149`), 38 (`0600255c3bd0`→`f44d9b68f862`) |
| SCF-B-0068 | 39 (`8b8185804e4a`→`dab39a96b836`) |
| SCF-B-0070 | 40 (`dcb11e2de949`→`14d233c47027`) |
| SCF-B-0072 | 41 (`3438e8bc0469`→`e2630eefb0c3`) |
| SCF-B-0075 | 42 (`67cf81adb01c`→`c6d6b9da7a83`) |
| SCF-B-0077 | 43 (`8b56237ca8fb`→`91a66bf5b661`) |
| SCF-B-0078 | 44 (`e145b8eb1eb7`→`3d1f701544e6`) |
| SCF-B-0082 | 44 (`e145b8eb1eb7`→`3d1f701544e6`), 45 (`1b97993eb712`→`0eca98408654`) |
| SCF-B-0086 | 44 (`e145b8eb1eb7`→`3d1f701544e6`), 45 (`1b97993eb712`→`0eca98408654`) |
| SCF-B-0089 | 46 (`862fb2bf6503`→`9bea4c61726a`), 47 (`f1820ce62789`→`2ba1c46edb5e`) |
| SCF-B-0093 | 47 (`f1820ce62789`→`2ba1c46edb5e`), 48 (`80532ad1ef21`→`5c32eccfa4cd`) |
| SCF-B-0094 | 48 (`80532ad1ef21`→`5c32eccfa4cd`), 49 (`ba3158240386`→`1936ae4abcc3`) |
| SCF-B-0097 | 49 (`ba3158240386`→`1936ae4abcc3`), 50 (`e62712988c2c`→`36ffccf576c0`) |

## 旧sourceとauthorityの照合

現行sourceの照合範囲は次のとおり。`docs/concept/product-boundary.md:7`は外部提供する製品属性と機構を区別し、`:64–71`はOS/Web-OS/LABO間の改善loopを記す。9/24決定`docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:37–48`はWeb/Web-OSを要求層からVision材料へ分類し直す。9/25決定`docs/governance/decisions/mechanism-placement-po-decisions-2026-09-25.md:29–36,60–69`はLABO・Intelligence責務の配置と、OSに残す改善候補の登録・還流責務を記録する。

0126の旧判断/sourceは、固定BASE `5562f04…`と四製品責務候補research scope、formal owner/consumer closureを決めない境界である（`scaffold/legacy-implementation-residual-0126/README.md:3,7,9,11`、validator `:20,117`）。source anchorは承認済み四製品L1とproduct-boundary digestを固定する（README:11）。現行9/24のVision分類・9/25のOS/LABO責務変更を旧research evidenceが評価済みとはみなせないため、E_BINDING_UPSTREAM closureを解消せず残す。0144は旧main `7afee33…`、PR #2078 fixed HEAD `c55ffc91…`のoverlap scope（README:3）、四製品比較とLABO除外/Issue #2089 hold（README:15）、inventoryの同archive revision・hold（validator `:596`）を固定する。直接エラーはupstream row schemaだが、note付き最新upstreamへ単純rebindすると旧scopeとholdを新しいcurrent authorityとして誤投影するため、失敗を維持。

旧sourceの照合先として、wave対象要件は`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json`の行を個別欄に記録した。旧workflow/test-designの関係では、資産明細台帳がuniversal workflow test design（`LEGACY-ASSET-CDB0C680878837FF2E36`、`docs/governance/legacy-asset-disposition.jsonl:2543`）とworker benchmark system test design（`LEGACY-ASSET-6F5F69296B4AB47B96E5`、同2787行）を歴史的/未解決としている。requirements IR snapshotは`LEGACY-ASSET-A60CF91DD2AF6693E6F9`（同2866行）。これらは所有者・atomization・要求binding・consumer等の残課題を持つ。旧CLAUDE `archive/legacy-generation-2026-09-14/root/CLAUDE.md:176–177`の誤った開発残滓を削除または明示的にsupersedeする規則は一般原則であり、今回の17対象を個別に裁定した直接前例とは確認できなかった。固定レビューを現行sourceへ機械的に付け直す旧手順も見つからなかった。本監査は差を記録するもので、retirement、supersession、新しいauthorityを宣言しない。

## 全137件の結果

再生成後に137 validatorを全件再実行し、基準91 pass / 46 failから105 pass / 32 failとなった。Goal 5対象ではwave14件がfail→pass、0126/0144/0148の3件は失敗維持。Goal 1の既知29件は変化なし。変更後のscfctl 4検査はすべて終了コード0。`python3 -B scaffold/tools/scfctl.py stale`は`stale=0`、`validate`は`bindings=142 fail=0`、`residuals`は`residuals=0`、`selftest`は`cases=69 fail=0`。`git diff --check`も合格。


manifest JSONLは基準revision `e57b2523b89dd29e6879c71e05ce49e86f1c07c0`と変更後HEADの137件すべてについて、path、終了状態、標準出力、標準エラーを収録する。結果は基準91 pass / 46 fail、変更後105 pass / 32 fail。Goal 5でvalidator条件、inventory、ledger rowは変更していない。
