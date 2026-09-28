# v1.3／旧candidate母集団と現行L2/L11の境界監査

監査日: 2026-09-28（Asia/Tokyo）
範囲: 旧requirements v1.3の521非空行、およびarchive配下旧candidate 92文書・4,755非空行。読み取り専用。旧runtime、CLI、hook、test、CIは実行していない。

## 母集団・digest確認

| 集合 | archive source / 行 | 独立確認 | 台帳・状態 |
|---|---|---|---|
| v1.3 | `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:1-664`、file SHA-256 `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406` | 664物理行・521非空行。指定mapping内の各521行と本文を照合し、SHA一致。| [補助source inventory](../../../governance/legacy-migration/requirement/legacy-requirement-supplementary-source-inventory.md) は521行を `preserved_pending_atomization` とする。v1.3の521行台帳をsource path・pointer・行text・line digestで再照合し、521/521一致、行不一致0。台帳SHA-256 `1a0591e1da6f9579d970aedfccff90ac6a8e1aefbbe0f4047e3aeb950a8449bb`。|
| 旧candidate | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/` | mappingが挙げる92 source fileすべて存在。各fileのSHA-256と非空行数を再計算し92/92一致、合計4,755。現行行台帳4,755行・ID重複0。各source path/line/text/line digestをarchiveへ照合し4,755/4,755一致。| [candidate inventory](../../../governance/legacy-migration/candidate/legacy-candidate-source-inventory.md)、[行台帳](../../../governance/legacy-migration/candidate/legacy-candidate-source-line-carry-forward.jsonl)。行台帳SHA-256 `a5f6cebe42b019a4f0511a54f7409493bc007d6395ec449cb0af8e2fa792d781`。全行の状態は`historical_candidate` / `draft_candidate` / `preserved_pending_atomization`。|

照合の再計算入力はarchive本文、[v1.3行台帳](../../../governance/legacy-migration/requirement/legacy-requirement-supplementary-source-carry-forward.jsonl)と[旧candidate行台帳](../../../governance/legacy-migration/candidate/legacy-candidate-source-line-carry-forward.jsonl)である。作業時のcandidate mapping headerにあった`citation_map_sha256=6dc52f5e…`は現在の行台帳SHA-256 `a5f6cebe…`と一致しない。source fileと全4,755行は独立照合で一致したため、件数・原文の検証には現行台帳を用いたが、旧mapping headerの同一bytes来歴は確認できない。

## identity到達と分類

| 母集団・区分 | 数 | 監査上の意味 |
|---|---:|---|
| v1.3のsource-key exact join | 0/521 | 台帳・IRのidentity keyへの一対一 joinはない。 |
| v1.3の明示IR ID | 7行 | v1.3:353-359に`HIL-BR-26`、`HIL-FR-51..53`、`HIL-NFR-30..32`を明示。source IDへの到達だけで現行successor・内容被覆にならない。 |
| v1.3の明示confirmed identity | 0行 | 節単位mappingに並ぶ`FR-L1-*`等は意味比較候補で、source行の明示ID参照ではない。 |
| v1.3の補助identity参照 | 2行 | v1.3:407の`HR-FR-HIL-15/17/19/20`と:437の`HR-FR-HIL-22`。旧`system_contracts` typed edgeで合計36個の旧IR IDへ構造到達するが、同契約の親source relationは`unmapped`。 |
| v1.3全行の意味coverage / successor | 521行すべて未評価 / 0 | 明示参照のある9行もsemantic coverageは未評価、successorは未割当。残る512行をID不記載だけで無関係・coveredにしない。 |
| candidateのliteral citation区分 | exact 2、ambiguous 3、IDなし4,750 | exact 2行は同じ`requirement-formation-scoped-admission-intake.md:76,155`の`HR-FR-HIL-19`。旧typed edgeでHIL-BR-26、HIL-FR-51..53、HIL-NFR-30..32へ到達するが、候補全体の条件被覆ではない。ambiguous 3行は`world-governance-acceptance.md:28-30`の裸の`BR-01..03`で、旧HARNESS BRとの参照候補にとどまる。 |
| candidateの真の構造-only | README 1文書・37行 | `candidates/README.md`は目次・状態説明であり、それ自体を能力要求/successorに数えない。その他のID不記載4,750行を非memberとは断定しない。 |

v1.3の区分値はmapping snapshotの`line_population_summary`と全行再計数に基づく。9行のうち明示IR IDは7行、auxiliary referenceは2行で、confirmed identityの明示参照はない。候補区分値はmappingの`typed_population_citations`をarchive本文・現行candidate line ledgerへ突合した。したがって「ID記載なし」は真の非member分類ではなく、行ごとの意味判定が残る区分である。

## 現行authorityと具体的残差

2026-09-28の現行入口は本体8機構のL1対象revisionと対になるL2/L11一式へのPO合意を示し、明示候補250件だけを採用している（[入口](../../../governance/new-generation-start-here.md)）。旧candidateの4,755行はその候補集合へ含めず、行台帳上もsuccessor・意味変更・decisionは0件。[authority state model](../../../governance/authority-state-model.md)に従い、旧文書のhistorical `confirmed`／candidate表示、mainへの掲載、registration、Issue/PR、receiptだけで現行採用・被覆を生成しない。以下は意味上の残差/詳細候補であり、独立した現行L2 defectの確定ではない。

| 旧source条件・現行責務 | 具体的に残る境界 | 監査上の扱い |
|---|---|---|
| v1.3 §4.3、:247-251。旧source SHAは上表 | 14種の品質/計測対象、metric・workload/environment/data・baseline/target・sampling・oracle・owner・layer・再測定trigger、L11/L12計測というv1.3固有の詳細。現行crosswalkはHARNESS metric/oracleとOS probe/evidenceを分担（[旧crosswalk](../../../governance/audits/source-rebaseline/requirements-v1.3-target-crosswalk.md)）。HARNESS-L2-034/L11の測定追補は250集合外のproposalであり、元行とNFR registryを条件別に保持する。| 各条件の現行本文receipt/採用がない限り「generic quality requirementでcovered」とはしない。未採択候補の存在だけで現行欠陥とも判定しない。 |
| v1.3 §4.5、:267-277。旧source SHAは上表 | Experience/UI/Frontend contractとscreen-region-slot-action-state-binding trace、implemented・ux_verified・L11受入の分離。現行レビューではHARNESS-L2-039候補が269/271/273/275の一部を扱う一方、:267/:277の特定source/技術実現はその候補のscope外。固定済001-009/025-026の状態と、候補039やv1.3全節のscopeは分ける。| 固定L2/L11の合意を旧§4.5全要件の一括採択に広げない。技術実現詳細はL3具体化候補。 |
| v1.3 §4.6.1、:298-345。旧source SHAは上表 | exact manifest/digest、consumer非破壊導入、Linux/Windows検証、channel/promotion、rollback、remote sync/tag/publish/cutover approvalの9 acceptance。現行crosswalkはHARNESS consumer packageとOS distribution/controlに分担（[旧crosswalk](../../../governance/audits/source-rebaseline/requirements-v1.3-target-crosswalk.md)）。現行reviewはOS-L2-021等との意味重複と、OS-L2-030 index追補の未採択を明確に分離。| package/consumer意味の現行採用と、v1.3 9AC各oracle・将来配布/実行の採択を混同しない。 |
| v1.3 §4.11、:443-458。旧source SHAは上表 | capability、target identity、provenance、data class、sink、impact、approval binding、postcondition/rollback/expiryのtyped tupleとfail-close。現行のSECURITY L2-001..009は責務領域を保持するが、候補familyのunified authorization schema・privileged-finding lifecycleを一括で採択したことにはならない。| owner境界の採用とcandidate schemaの全field受入は別。現行欠陥として確定せず、source-specific oracleへ残す。 |
| candidate: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:123-161,258-282` SHA-256 `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b` (family 950行) | HIL-FR-03/06/27/32/61-63と意味重複。一方、canonical ticket schema、measurement/feedback ledger、Attempt revision lifecycle等はcandidate detail。現行ownerはOS assignment/recovery、HARNESS call/oracle、LABO comparison、INT proposalへ分かれる。| 独立Ticket engineやcandidate全体の採用を導かない。個別詳細は現行固定候補の条件と照合が必要。 |
| candidate: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requirements.md:37-73,174-193` SHA-256 `eb1a7747afacd607217ee9e1905f87e629354a023102c1f32521ff8a9bc54a17` (family 285行) | OS-L2-014/021/026とHARNESS-L2-023は段階構成・配布・依存closureの意味に関係するが、Module/Slice/Bundle ontology、旧9AC、固定channel/release runtimeは全体採択されていない。| 現行の固定bytesの採択とFRS候補taxonomy/full lifecycleを分離。旧taxonomyを復活させない。 |
| candidate: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/harness-memory-coordination-boundary-requirements.md:37-65,81-94` SHA-256 `421d8cbcdb12120c7bf97bdbae053d3e1dac0d73229418b4f74341a2dd182dbc` (family 172行) | HMC-BR-003のLABO/INT/OS owner/version splitとOS/HILのauthority境界を保持。一方、TTL envelope、multi-projection consistency、dedupe/dead-letter/replay/provider parityはcandidate schema詳細。| owner splitは既決。詳細schemaの不在を直ちにL2欠陥や権限追加の根拠にしない。 |
| candidate: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-requirements.md:27-58,73-98` SHA-256 `685d95abf7218410b807dd9c58efd73a45b0b1937f820fefacf111fb2276bc1a` (family 157行) | HIL-FR-09/16/21/22/26/61-63と監査・learning意味が重なる。snapshot/schema、invalidation、model TER、P4/P8 claim-span/external knowledge条件は候補固有。| LABO評価、INT提案、OS記録、SECURITY policy、HARNESS oracleの分担を保つ。将来版条件を1.0へ繰り上げない。 |
| candidate: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/security-engagement-authority-requirements.md:18-40,55-57` SHA-256 `38a68e48ca26cb277b6f5d88439b33b58aecf48f5b650f7596aec04e438b6b16` (family 112行) | SECURITY L2のtrust/isolation/credential/egress/runtime/action/revoke ownerと重なるが、SEA authorization schema、特権queue/evidence、finding lifecycle/revokeはcandidate固有詳細。| 現行security ownerの採択からunified schemaやcandidate全体の採用を推定しない。 |

candidate上記行はfamilyの代表文書/行であり、同family全92文書の意味を代表したり、欠落行の網羅を証明したりしない。全source file SHA、行ID、原文、line digestはmappingと行台帳に保持される。

## 判定と限界

- この照合から確定できるのは、source populationの完全性、identity/typed reachabilityの狭さ、及び現行owner/候補への意味上のrouteである。v1.3の521行全ては意味coverage未評価・successor未割当。候補family群も全行のatom-by-atom covered/uncovered判定ではない。
- candidate mappingの28 family分類は「既存意味との重なり」と「candidate-specific detail」を分離するが、文書/行をfamily要約だけでcoveredにする根拠ではない。IDなし4,750行は無関係でも充足済みでもなく、個別意味review待ち。明確なnavigation-only README 37行以外をtrue nonmemberと確定する証拠は得ていない。
- v1.3 old sourceで本文L9が述べる「document revision confirmed」や153 frozen統計は、そのv1.3全条件の現行対象別L2合意・L11受入・実装を示さない。現行補助台帳は521行を`preserved_pending_atomization`とし、relation/successor/採否を未確定とする。
- 従って現段階で旧v1.3/candidate母集団だけを根拠に、本体8機構の固定L2/L11が欠陥あり、または旧条件一式が採択済みとは判定しない。上記の具体的残差は、原文条件ごとの現行bytes/decision/適用versionへ接続する際の照合対象である。登録・Issue/PR・runtime/旧test/CIは採否や完了の証拠に使っていない。
