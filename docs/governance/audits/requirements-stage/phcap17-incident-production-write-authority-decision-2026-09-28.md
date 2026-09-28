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

**問い**：上記二旧資産の三者確認（本番変更前のentryとIncidentのexit）を、現行のSECURITY/OS要求へどう引き継ぐか。対象revisionは旧file SHA-256二つ、現行`HELIXSECURITY-L2-008` section SHA-256、上記OS Incident行、およびこの監査のexact PR HEADで固定する。選択自体とその後の候補起草・独立reviewを分ける。

| 案 | POが決める意味 | 影響・後続作業 |
|---|---|---|
| **A（推奨：旧保証をIncidentに限定して保持）** | production Incidentの本番変更前にon-call・TL・PMの三者確認を必須にし、exitにも三者の確認記録を残す。read-onlyの観測や通常の開発作業へ一律拡張しない。 | SECURITYの既存操作別authorityに加えるIncident固有条件として、対象L1との導出とL2/L11候補を別PRで起草する。OSのIncident型との受渡し、緊急時に誰が何を確認できるか、欠員時の扱いは推測せず差分として示す。旧条件を弱めず、現行A案の通常作業境界を守る。 |
| **B（意味変更を明示して置換）** | 旧固定三者quorumを、同じproduction writeに対する現行SECURITY-L2-008の有効なoperation-specific authority判断で置き換える。旧processのexit三者確認もretireする。hotfix収束、恒久対策、postmortem等の他の旧exit条件は本選択の処分対象外として未解決のまま保持する。この案は新しいreceiptやexit oracleを追加しない。 | `RB08-182`と旧processの該当三者条件について、対象revision付きの意味変更・retire理由と影響をPO判断記録に残す。現在の008から自動的に置換済みとは扱わない。必要なL2/L11追随を別PRで起草する。 |

どちらも未選択である。推奨Aは旧保証を黙って落とさず、POが既に決めた「通常作業で毎回の人間承認を増やさない」とscopeを分けるための作成側提案であり、既存authorityや旧三者条件の採択ではない。判断までは旧atomと両資産を`unresolved`で保ち、PHCAP-17全体の回復や要求ステージ終了を主張しない。
