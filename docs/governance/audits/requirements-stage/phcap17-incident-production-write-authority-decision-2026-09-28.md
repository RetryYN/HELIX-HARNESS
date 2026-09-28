# PHCAP-17 Incidentの本番変更前authority条件：旧原文照合とPO判断材料

監査日: 2026-09-28。状態: 旧条件の一部を現行責務へ接続した監査。旧三者確認の保持・置換・廃止は未決。本書は要求候補の採択、production操作の許可、Incident実装・受入完了を生成しない。

## 原文と母集団の境界

| 証拠 | 固定原文の意味 | 状態 |
|---|---|---|
| `LEGACY-ASSET-4618C7243C283228809A`、`archive/legacy-generation-2026-09-14/root/docs/skills/incident-runbook.md:45–49,77`、file SHA-256 `f5ba60755a67d7aff8a38eb2fd4212a17fa3c9186a63ce4763843f25a458e402`。49行SHA-256 `e50ceb46277f1b9da924dca76c5a5de905976fa6d65679467baefa933f601672`、77行SHA-256 `1a210e1b7c14b1383fe670cdbdecb166148bc9f31cdea2f63a9fa74174940ff0` | production incident/regression/hotfix、target=productionのIncidentで、本番変更前のon-call・TL・PM承認記録をentry条件と完了checklistにする。抽出atomは[旧rule inventory](../../legacy-migration/rule-atom/legacy-rule-atom-inventory.jsonl)の`RB08-182`（2226行、`fail_close`）。 | asset dispositionは`unresolved`。抽出inventoryの`authority_effect:none`から現行要求への採択を推定しない。 |
| `LEGACY-ASSET-9E033C3E39BE107D4CF1`、`archive/legacy-generation-2026-09-14/root/docs/process/modes/incident.md:25–26,53,79–81`、file SHA-256 `bad6448a63dbc6b7867b9845ca8caf96ee144802961504f3793667f49fc28f7c`。26行SHA-256 `0c6ff1d14a43665de181ed38b574128bc19d13207b1eead72ee58b2eb348c989`、53行SHA-256 `889ebfa20375da760e615ff703d32efb15c294e98641a218acf0d0842b90f8f2` | Incidentの承認者とexit条件に同じ三者の人間サインオフを置く。on-callは本番対応、TLは技術的恒久対策、PMはscope・影響範囲を担う。 | asset dispositionは`unresolved`。旧workflow model・PLAN分割・旧CLIを現行工程へ移植しない。 |

[phase inventory](../../phase-capability-inventory.md)の`PHCAP-17`は`thin_candidate`／`degraded_and_incomplete`（55行）であり、現行successorの決定でも回復完了でもない。旧runbookのalert procedure、rollback、timeline、恒久対策等は本書の`RB08-182`照合対象外で、両旧資産の残条件として保持する。旧資産台帳全4,020件の一律再調査や旧workflow・CLI・hook・test・CIの実行は行っていない。

## 現行への接続と残差

| 命題 | 現行sourceと判定 |
|---|---|
| 本番writeの操作別許可 | [HELIXSECURITY-L2-008](../../../helix-security/L2-requirements/security-requirements.md)（140–148行、section SHA-256 `6135842a799b9883cb29c5ce9e6ffcf601997d66cb3d314c8031ba9cbbae9f2c`）はactor・target・operation・revision・environment・scope・expiryを照合し、高影響操作の個別authority欠落/unknownを拒否する。[対L11](../../../helix-security/L11-acceptance/security-acceptance.md)（32、58行）は越境と権限欠落を拒否する。これらは[SECURITYのPO判断](../../decisions/helix-security-requirements-po-decision-2026-09-28.md)が固定した008の意味であり、現行本文への後続追記を三者条件の追加承認にはしない。 |
| Incidentの業務経路 | [HELIXOSのticket種別](../../../helix-os/L2-requirements/governance-requirements.md)（141行、line SHA-256 `1273c34787e2a0221eaa1ab171f720be5fcbec1c1e05d11725513949a98f8cd2`）は本番障害への緊急対応、L12運用評価、恒久対策のReverse経由を定める。[対L11](../../../helix-os/L11-acceptance/governance-acceptance.md)のticket型・戻し先もこれに従う。承認者の人数・役割は定めない。 |
| 三者の本番変更前確認 | 現行008のauthority tupleにはon-call・TL・PMという固定quorumがなく、OSのIncident型にもない。よって`RB08-182`のこの条件の現行IDによる完全被覆、意味変更、retireはいずれも未成立。旧runbookと旧processのexit三者条件も未解決のまま保持する。 |

[SECURITYのPO判断](../../decisions/helix-security-requirements-po-decision-2026-09-28.md)は全操作のauthority境界を採用し、有効な既決権限を再利用し、**通常作業の毎回の人間承認を追加しない**。Incidentの本番変更はこの通常作業と同一視しない。一方、このPO原文だけで旧三者条件を自動的に採択または廃止しない。既存のoperation-specific authorityが欠ける本番writeは現在もdeny/unknownであり、以下のPO判断待ちを実行許可へ変換しない。

## POへ提示する対象revision付き選択肢

**問い**：上記二旧資産の三者確認（本番変更前のentryとIncidentのexit）を、現行のSECURITY/OS要求へどう引き継ぐか。対象revisionは旧file SHA-256二つ、現行`HELIXSECURITY-L2-008` section SHA-256、上記OS Incident行、およびこの監査のexact PR HEADで固定する。選択自体とその後の候補起草・独立reviewを分ける。[PO原文の過剰停止への注意](../../sources/requirements-stage-po-handoff-original-2026-09-27.md)（35–36行）、[総合検証の過剰停止防止](integrated-verification-2026-09-27.md)（26行）とSECURITYのPO判断に照らし、Incident例外を通常作業全体へ広げない。旧sourceの三者確認は三つの人間の役割を挙げるが、超個人開発でそれぞれを別人が担えるとは推定しない。

| 案 | POが決める意味 | 影響・後続作業 |
|---|---|---|
| **A（旧三者を別人で保持）** | production Incidentの本番変更前とexitにon-call・TL・PMそれぞれ別の人の確認を必須にする。read-only観測や通常作業へ拡張しない。 | 三役を別人で配置できない個人開発や緊急時には本番修正が止まる。有効な既決authorityがあっても三者が欠ければ進めない。欠員時の例外は旧sourceにないため推測で設けない。旧保証は最大限保持するが、過剰停止防止のPO注意と衝突し得る。 |
| **B（推奨：三役の確認観点を保持し兼任を許す）** | production Incidentの本番変更前とexitに、on-callの復旧、TLの技術的恒久対策、PMのscope・影響を人が確認したことを残す。一人が複数役を兼任できるとし、別人三者quorumは要求しない。AIを三役の人間確認に数えない。通常作業には適用しない。 | 旧三者独立の保証を緩める意味変更であり、POの対象revision付き判断が必要。個人開発でも一人の人間で三観点を確認できるが、その人も不在なら本番変更は止まる。既存SECURITY-L2-008の操作別authorityは別途必要。観点ごとの確認の所在とOS Incidentとの受渡しはPO判断後にL2/L11候補へ起草し、現時点で新しい実行gateを成立させない。 |
| **C（旧三役を明示的に置換・retire）** | 旧固定三者quorumを、同じproduction writeに対する現行SECURITY-L2-008の有効なoperation-specific authority判断で置き換える。旧processのexit三者確認もretireする。hotfix収束、恒久対策、postmortem等の他の旧exit条件は本選択の処分対象外として未解決のまま保持する。この案は新しいreceiptやexit oracleを追加しない。 | `RB08-182`と旧processの該当三者条件について、対象revision付きの意味変更・retire理由と影響をPO判断記録に残す。旧三者が確認した復旧・技術・影響の観点を必須としては保持しない。現在の008から自動的に置換済みとは扱わず、必要なL2/L11追随を別PRで起草する。 |

三案とも未選択である。推奨Bは旧sourceの三つの確認観点をIncidentに限定して保持し、個人開発で別人三者を常時揃える停止条件を避ける作成側提案である。別人quorumを緩めるため、POの明示的な意味変更判断なしに採択しない。Aは旧保証を最も厳格に保持するが、緊急復旧が止まる可能性を受け入れる案。Cは旧三者条件を明示的に退ける案。判断までは旧atomと両資産を`unresolved`で保ち、PHCAP-17全体の回復や要求ステージ終了を主張しない。
