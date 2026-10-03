# 要求段階の現在状況

2026-10-03時点のPO候補一覧は[監査snapshot](audits/requirements-stage/requirements-stage-closure-2026-10-03.md)にある。基準mainは`bf52f0b3d18059136539fb65d7f1ee3299f62c57`。採否joinとfixed-pair pin照合は確認済み。基準mainには判断未記録3件があり、Draft branchのOS132-002を加えると未決PO判断は4件です。要求段階の完了は示しません。

8機構のMPR latest requirement-candidate identityは383件。MPR物理711行、履歴revision、legacy IR 153件とは分母を分ける。

| 機構 | latest候補 | 採択 | 保留 | 現revision不採択 | 判断未記録 |
|---|---:|---:|---:|---:|---:|
| HELIX-HARNESS | 71 | 66 | 3 | 1 | 1 |
| HELIX-OS | 73 | 65 | 4 | 2 | 2 |
| HELIX-BRAIN | 43 | 43 | 0 | 0 | 0 |
| HELIX-LABO | 64 | 64 | 0 | 0 | 0 |
| HELIX-INTELLIGENCE | 62 | 60 | 0 | 2 | 0 |
| HELIX-SECURITY | 35 | 35 | 0 | 0 | 0 |
| HELIX-INFRASTRUCTURE | 26 | 26 | 0 | 0 | 0 |
| HELIX-CONNECT | 9 | 9 | 0 | 0 | 0 |
| **合計** | **383** | **368** | **7** | **5** | **3** |

## PO判断が残る候補

- `HARNESS-L2-067-002`：利用者が選択したsource/read scopeのbehavior意味をHARNESS責務として置くか。OSは原資料の識別、authority、来歴を持ち続ける。
- `HELIXOS-L2-131-002`：宣言されたpack/agent使用Worker operationで、提案物だけでは権限が生じないという利用者保証。該当operationに限定し、通常operationへ広げない。
- `HELIXOS-L2-125-002`：一時backpressureだけでは失敗扱いせず、既存契約内で待機・再開して完全結果を上限・期限内に届ける。対象は選択Worker operationの結果受領。`-001`不採択は履歴で、`-002`へ継承しない。

技術方式、内部契約、閾値、fixtureはPO判断に含めない。採択済み候補のrevisionと適用条件はdecisionに固定され、一覧から再質問しない。legacy IR 153件の行き先表は別集団として追補する。


## 共有Draftブランチの未採択追補候補

OSの `MPR-RC-HELIXOS-L2-132-002`（HIL-BR-19）は、旧HELIXのBun依存撤去に対応するHELIX再構築の一回のrepository migrationで、activeな開発・実行・検証・配布surfaceすべてがBunなしで再現可能になったことを利用者が確認してから完了とする要望。配置はHELIX-OS、親はL1-005/007。PO判断は未記録で、main基準383件とは別のDraft候補（branchはlatest候補384件・物理713行、未記録4件）。`-132-001`とr1 receiptは履歴として保持し、sourceはpending、runtime・command等はr2 migration receiptに引き継ぐ。

IR153件の[route locator projection](audits/requirements-stage/ir153-destination-projection-2026-10-03.md)では153/153行に行き先があり、未割当は0件です。これは参照先の有無だけを示します。旧sourceから利用者要望・保証・L11確認粒度への劣化照合は、確認済み0/153件、未検収153/153件です。この照合はsource本文全体の意味coverageを証明するものではなく、L3以下も対象外です。基準mainの3件とbranchのOS132-002を合わせた4件のPO判断も未決です。4候補の原文・推奨・影響L2/L11・保留残件はsnapshotの判断材料表にあります。
