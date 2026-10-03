# 新世代の管理変更と旧Management Scrum Product Forwardの対応

確認日: 2026-09-14

## 目的

`docs/governance/management-scrum-product-forward.md`と対応する受入4件を、新世代のHARNESS工程契約と
HELIX-OS変更統制へ再分類する。旧文書はconfirmedだが、Issue-first、PLANを含むGit authority、既存adapter／template／CIを
前提に成立しているため、現在の上流authority・製品境界へ承認状態を継承しない。

本表は要求源の照合である。旧policy、PLAN、test、Issue template、AGENTS／CLAUDEへの投影を新世代で有効化せず、
L2合意、L3凍結、L10／L11受入、runtime・CI変更を行わない。

## 意味と旧方式の分離

| 旧記述／ID | 保持候補の意味 | 新世代接続先 | 持ち込まない条件 | 状態 |
|---|---|---|---|---|
| 管理上の観測を小さく収束する | gate漏れ、監査所見、再発を管理作業として分類し、観測・影響・判断・未完を追跡する | HELIXOS-L2-002／005／007 | 発見時点でのGitHub Issue起票を必須入口にせず、repo-owned intakeからremoteへ投影する | semantic_atom_candidate |
| `S0..S4`管理Scrum | 管理上の調査・候補・検証・採否を製品開発状態と分ける | HELIXOS-L2-003／005 | 旧stage enum、既存workflow、Project Statusを新世代の状態機械として継承しない | workflow_rederivation_required |
| product Forward／Scrum Reverse | 管理判断が製品要求を直接変えず、採択差分を影響する上流層へ戻す | HARNESS-L2-003／004、HELIXOS-L2-003／005 | 旧Reverse command、旧route、旧adapterを固定しない | split_reapproval_required |
| authority境界 | 要求意味、実行事実、read-side projectionを区別する | HELIXOS-L2-001／002／007 | `Git上のRequirement／Design／PLAN`を一括して意味正本にしない。対象別authority registerで文書・指定JSONの意味範囲を定め、PLANは作業契約とする | authority_conflict_rewrite |
| 管理見落とし契約 | 観測、影響、再発、提案、現在状態、戻し先を欠落なく保持し、重複を識別する | HELIXOS-L2-002／005／007 | GitHub Issue template、Issue番号、既存finding schemaを正規保存形式にしない | schema_rederivation_required |
| U-MSPF-001／002 | AI読取り入口から責務境界と正規authorityへ到達する | AIDOC-HARNESS／AIDOC-OS | 現行AGENTS／CLAUDE／governance READMEの文字列一致を新世代oracleにしない | ai_doc_oracle_rewrite |
| U-MSPF-003 | 管理観測の必須意味が欠けない | HELIXOS L11／L10候補 | 旧Issue template headingと既存testをoracleとして継承しない | oracle_atom_candidate |
| U-MSPF-004 | Project／DB projectionから意味・承認・完了を逆生成しない | HELIXOS L11／L10候補 | 旧DB replay、Project API、既存CIを合格条件にしない | oracle_atom_candidate |

## 新世代の変更入口

1. 人間指示、ローカル文書、指定JSON、観測、外部変化を、対象・出典・revision・authority状態付きでrepo-owned intakeへ登録する。
2. HELIX-OSは管理上の観測を分類し、影響・重複・調査・候補・採否を追跡する。remote Issueは必要に応じて生成するprojectionである。
3. 管理上の採択は製品要求を直接書き換えず、対象製品のConcept／L1／L2／L3のうち意味が変わる最上流へ変更候補を戻す。
4. HARNESSは差戻し、再合意、pair再凍結、再検証の工程条件を定める。HELIX-OSはその実行・停止・証拠を管理する。
5. GitHub Project、Issue、PR、DB、generated view、CI結果は意味authorityではなく、上流revisionへ束縛されたprojectionまたは実行証拠とする。

管理作業の具体的な方式をScrumと呼ぶか、`S0..S4`を使うかは対象別L1／L2の再承認後に決める。
既存workflow、adapter、hook、Issue template、testはlegacy sourceであり、意味採取後にarchive対象とする。

## 次工程

Concept v4.1と対象別L1の承認後、変更受付・管理判断・製品Forwardへの差戻しをHELIX-OS L2／L11と
HARNESS L2／L11へ個別採否する。L3／L10とAI読取り文書はその上流から再導出する。要求整理が閉じるまで
既存CI、旧adapter、旧Issue template、旧workflowを新世代経路として実行しない。
