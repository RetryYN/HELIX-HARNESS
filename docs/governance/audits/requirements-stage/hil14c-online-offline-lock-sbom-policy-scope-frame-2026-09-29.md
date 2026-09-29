# HR-FR-HIL-14 / HAC-HIL-14c online/offline 条件のscope判断フレーム

記録日: 2026-09-29

照合基準: `origin/main` 相当 commit `41b9d9a455df647115505e8f6e74bfd205481a8d`

記録種別: bounded source audit とPO判断用選択肢。PO判断・候補採択・successor割当・実装・受入実行を記録するものではない。

## 対象と境界

対象は旧親contract `HR-FR-HIL-14` のうち、HAC-HIL-14c「online/offline同一lock/SBOM/policy」条件である。兄弟acceptanceは混ぜずに扱う。

| identity | 旧条件の役割 | このフレームでの扱い |
|---|---|---|
| `HAC-HIL-14a` | positive: Linux full、macOS portable、Windows compatibility の3 OS profileが各定義scopeでgreen | platform support scopeの判断材料。14cのdependency parity oracleへ吸収しない。 |
| `HAC-HIL-14b` | negative: adapter leak、path/process/lock異常を拒否 | adapter/OS contractのfailure境界。14cのonline/offline証跡と別条件として保持する。 |
| `HAC-HIL-14c` | boundary: online/offlineで同じlock、SBOM、policyを保ち、offline digest等で一致を示す | 本判断フレームの主対象。製品の性質かHELIX-HARNESS自身のrepository acceptanceかは未決。 |

旧sourceは3条件を同じ親へ接続するが、これは3つを同一条件に畳む根拠ではない。14cの行き先・適用範囲が確定するまでa/bも本記録から採択・移管しない。

## 旧sourceとtyped link

資産台帳上の旧source状態は`preserved_pending_rehome`、product targetは`unresolved`。各JSON source snapshotは読取専用で、旧sourceのspecified状態や旧HATの設計状態を現行authority・採択・合格へ昇格しない。

| 関係 | 旧path・位置 | asset / source SHA-256 | 行・意味digest |
|---|---|---|---|
| 親contractと要求identity | `archive/legacy-generation-2026-09-14/root/requirements-ir/system_contracts.json:316-338` (`#/HR-FR-HIL-14`) | `LEGACY-ASSET-67761C517521603F844C`; file `2a7df673138568526e714342679ce2982238966b42f2d1967b2da92e9dbf02ab` | 行318 identity `sha256:3d552d7794b788b0de9402af8ca372aaed00c7c10fe4385d1570e9f07dc36465`; 行329-331 behavior/transition/failure条件。contract semantic digest `sha256:d771b46b60a9f269213b4f08a3aca8823450f4dc38ddca9895228c8dfbdd5f99` |
| 正/負/境界 acceptance | `archive/legacy-generation-2026-09-14/root/requirements-ir/acceptance_cases.json:431-463` (`#/HAC-HIL-14a,b,c`) | `LEGACY-ASSET-4886CEF2A7AB5B7AA5C8`; file `4fabf58db6619ceaa5d0943fd295f5b0ec127be39f245428d203c6a3b366ae19` | a statement 行438 `sha256:4a431379b49f14d084c3771c44e1aef7c9a4e3f8cbc6f71b626ed2f7a6c9fd9b`; b 行449 `sha256:f3b868e3efece0a569d1e9cd490009fda90ea861a073d08304e29cc2728e4524`; c 行460 `sha256:0064db476fcc42b30fdbc766647b4e699196909255907c7c3dd090717a18d9c6` |
| aggregate system test | `archive/legacy-generation-2026-09-14/root/requirements-ir/system_tests.json:257-276` (`#/HAT-HIL-14`) | `LEGACY-ASSET-F7A988C2531DEAC3D23B`; file `7ff2a798c120f7622d77dff2aba83992c03fb5a40cfa3b491572b4e8558c191a` | 行259-275のscenario/evidence/negative boundary。statusは`designed_not_implemented`。semantic digest `sha256:465cd7dd4729b9a5911ab74f77dc20a9faa95a54d20db1170cd80e856f3017eb` |
| 親IRから要求へのtyped link | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json:2858-2884` (`#/HIL-FR-34`) | `LEGACY-ASSET-A60CF91DD2AF6693E6F9`; file `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | `primary_system_contract_id=HR-FR-HIL-14`、acceptance IDs a/b/c、`downstream_obligation.owner_id=HR-FR-HIL-14`。relationshipは旧IR内のtyped referenceであり、現行owner/successorを示さない。 |
| siblingを含む親技術条件 | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:170` (`HIL-TR-06`) | `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; file `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb` | 行170 `sha256:79e8af744e7986bcf0d5bfb1682e10d4494a383637ddb22151a6abbc1a327f19` |

IRのtyped chainは`HIL-FR-34 → HR-FR-HIL-14 → HAC-HIL-14a/b/c → HAT-HIL-14`。HIL-TR-06も親contractのrequirement_idsに含まれる。これは旧要求の関係保存であり、14cの独立要求化や現行機構ownerを決めない。

## 旧consumerとfailure evidence

- 旧system assertion consumer `archive/legacy-generation-2026-09-14/root/docs/governance/infinity-loop-system-assertion-cases.md`（asset `LEGACY-ASSET-7B1C7AED3AA401868455`, file SHA `98d2f9c9721481e6b4363c0683c00b187ce789fd6a39723323eca72395102ea8`）はHST-CASE-014-01..07をlines 121-127、HST-CASE-017-01..06をlines 139-144に記述する。前者は3 OS scope、adapter leak、root外symlink、process cancel、SQLite lock contentionを分け、後者はonline clean install、offline network 0/同一digest、SBOM component欠落、secret、license未分類、lock driftを分ける。各行は設計fixtureであり、`not-implemented` statusを含む。行digestは14系が順に `f24709e899c6372a62e8e716ecaf5c095fceaf98cd08ac5c55fed0d42c27eff1`, `4c89927b800ceec6bcb4861bfb722a1bf2889c80b713e17c39ab32fd2dc03f56`, `ad0a9e6d6275a69d52158c051737626fa047ec0b1b6ca50a467534fbc2e8e3ea`, `a5e876aad99005bb57fdd8b6ecdc912638f28ae75f7702d5c3e593ac39c8c1b5`, `82db7fad53774364268f19c3f58c683cf9f8163ac42201a3106bfc17ac3ccf79`, `ea1be9ae072245d5b961d1119f7283fea00919d7db85eaa60e697ca61e39972b`, `c4650ad99a84b5792df72d28de18257e927f25d8b46336e88220ac6173473cca`; 17系は `7c552ddfaa75f83d87a50bd49b050bde0cfceeb35e27a5f21633b684c3b77086`, `cde5a2b682a5a2a91ca30c95b1f39b35dd2e8b93320ec58cee5ce7d3fa8009cc`, `231ea23a45db75bff6fe069b4513ce1b574c4046eaf0d1e94c347571ddab6516`, `2f56233d65f9701aa1b2ef87d49f606ea330172d35682569a494c1c2cfa5114d`, `d0bc6261f734d23f6c57b91d54c2f5e742b06904b0539a9c98394867b3703df6`, `eba8a002e551b4056e3fafb925c90415d6471a2bf4e919e11c2c9e685a6c1812`。
- 旧function-design consumer `archive/legacy-generation-2026-09-14/root/docs/design/helix/L6-function-design/os-portability-supply-chain.md`（asset `LEGACY-ASSET-9A01A0B72DB343D5859E`, file SHA `b9976277c2d025b9ab0ae9454be97b679416e44823198d41b9b4aae127ffbc66`）はdraftで、`verifyOfflineInstallParity`、network attempt 0、graph/package digest一致、cache-miss fail-close、unified SBOMとsecret/license policy receiptをconsumer contractとして設計していた。
- 旧test-design consumer `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L6-os-portability-supply-chain-unit-test-design.md`（asset `LEGACY-ASSET-A1F623AB6959223426DA`, file SHA `947ac36e26182e6818db8f8d9f6f83694a00850ee4e1b33018b3fc64c6b7bf67`）もdraft。`U-OSSC-009`はnetwork attempt・cache miss・artifact mutationを、`U-OSSC-010/011`はSBOM欠落、secret、未分類/禁止licenseをfailure oracleとして記述する。
- 既存監査`legacy-auxiliary-contract-refinement-recheck-2026-09-28.md:47`はHAC/HAT条件を現行OS-L2-021、HARNESS-L2-005/022、OS-L2-020へ照合し、3 OS support tierと同一lock/SBOM/offline条件を現行の一般契約から導けない残差としている。旧設計/test-designの記載はconsumer/failureを特定する根拠だが、実装・実行・合格の証拠ではない。

## 現行L2/L11との照合

現在の本文hashは照合対象commit `41b9d9a455df647115505e8f6e74bfd205481a8d` の値。

| 現行identityと状態 | 現行path・位置・file SHA-256 | ここで確認できる範囲 | 未被覆または区別する点 |
|---|---|---|---|
| `HELIXOS-L2-020` と対L11（2026-09-28 PO対象 revisionの採用済み要求） | `docs/helix-os/L2-requirements/governance-requirements.md:692-700`, SHA `911e8f1eef71d35a7ad0ab381ea96cba9bffc01c4606c586687c63f16bbd02e7`; `docs/helix-os/L11-acceptance/governance-acceptance.md:359-364`, SHA `c67fdd664f3682dcdb865110451d0b6c31380c0b2abaadc427bc7e9a6b476d5c` | ticket/HARNESS義務由来の動的CI profile、exact HEAD/oracle/environment/run binding、状態区別と未完返却。旧CIは未構築/代用不可。 | profile選択・実行の運転契約であり、全productを3 OSで支援する意味や14cのlock/SBOM/policy parityを定義しない。 |
| `HELIXOS-L2-021` と対L11（同上、採用済み） | OS L2 `:702-710`, 同SHA上記; OS L11 `:366-371`, 同SHA上記 | 選択したHARNESS構成版の対象project配布・更新・復旧、artifact/source/互換/authorityとrollback追跡。 | HELIX自身のstage releaseとは別identity。Linux/macOS/Windows support tierやoffline supply-chain parityは条項にない。 |
| `HARNESS-L2-005` と対L11（2026-09-28 PO対象 revisionの採用済み要求） | `docs/helix-harness/L2-requirements/product-requirements.md:56,118-121`, SHA `ece844e9c26797035d9ce7e5e5a7b3f7653fadaa8b333b0f56269bd1f2d23aee`; `docs/helix-harness/L11-acceptance/product-acceptance.md:48-51`, SHA `ab94b4cec9535c70b5fd1a8553b41bdce51411fd59f65e64c5ddedc4fbacf878` | ticket/risk/変更scopeから検証義務、oracle、expected failure、証拠条件を導き、検証省略を記録・回収。HARNESSがoracle契約、OSがCI運転を担う。 | repositoryのオンライン/オフライン依存lock等価性を要求するproduct-specific acceptanceではない。 |
| `HARNESS-L2-022` と対L11（同上、採用済み） | HARNESS L2 `:447-462`, SHA上記; HARNESS L11 `:298-304`, SHA上記 | Provisional→Accepted段階の検証/受入、oracle・result・evidenceのrevision束縛。 | OS matrix、online/offline parityの固定内容を追加せず、run実績も生成しない。 |
| `HELIXSECURITY-L2-012`（採用済み） | `docs/helix-security/L2-requirements/security-requirements.md:180-188`、SHA `d3103f909e540e35a95310e6741cfd038a87789150577ea182a941d58a5f2bd5`; `docs/helix-security/L11-acceptance/security-acceptance.md:36`, SHA `e30e63771d58dae2ca69cb9cfff5d2ab6eb71311144aa263b068cb4ae4fbf556` | supply-chain対象のsource/producer/version/digest/dependency/permission/network/known-risk/update-delta/rollback provenance。 | provenanceを辿れることだけでは、HAC-14cのオンラインとオフラインのlock/SBOM/policy同一性や3 OS scopeを規定しない。 |
| `HELIXSECURITY-L2-005/008`（採用済み） | L2 `security-requirements.md:110-147`, SHA上記; L11 `security-acceptance.md:29,32`, SHA上記 | secret境界と操作ごとのauthority。 | 旧policy scanner、license分類の具体gate、SBOM closureまたはonline/offline parity oracleを新設しない。 |

OS L2-020/021の採用範囲は`docs/governance/decisions/helix-os-requirements-po-decision-2026-09-28.md:42-59`、HARNESS L2-005/022は`docs/governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md:35,37-51`、SECURITY L2-005/008/012は`docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md:35,37-50`に従う。本監査はこれらの採用範囲をHIL-14へ広げず、`HELIX-WEB`/`WEB-HARNESS`のLinux条件も本体へ一般化しない。

## PO判断の選択肢

この記録時点で、以下のいずれも未決である。選択は対象revision付きで行い、必要な場合はL2と対L11の双方に範囲を反映する。どの選択も単独で旧source holdingの解除、formal successor、実装開始、L11実行を意味しない。

| option | 適用scope | 意味と影響 |
|---|---|---|
| A — 製品能力として保持 | HELIX-HARNESS製品の明示されたサポートscope | a/b/cを製品のportable/platform contractとして保持する。各OSのsupport tier、対象成果物、定義scopeと、online/offline同一lock/SBOM/policyを製品能力として明示する。サポート範囲を曖昧な「cross-platform」へ広げない。 |
| B — HELIX-HARNESS repository固有の受入として保持 | HELIX-HARNESS自身の構成・依存・配布成果物 | a/b/cの対象をrepositoryの開発・配布工程へ限定し、利用者向け製品platform保証を含めない。具体的な適用artifactと受入境界は別途明示する。 |
| C — 条件ごとにscopeを分ける | a/bは製品または選択構成のplatform契約、cはrepo固有のsupply-chain受入、またはその逆を対象revisionに記載 | 旧兄弟を一括採否せず、それぞれに適用対象・責務・受入範囲を設定する。分割の可否と選んだscopeをPOが明示する。 |
| D — 現時点は保全して保留（推奨） | scopeと対象revisionの決定まで | 旧HR-FR-HIL-14、HAC a/b/c、HATおよびconsumer/failure証拠を`preserved_pending_rehome`として維持する。successor ID・候補・owner・採用版を作らず、製品scopeとrepository固有受入の区別が明確になった時点でA/B/Cを選ぶ。 |

推奨Dは意味を退ける判断ではない。旧条件を保全したままscope decisionを残す。POがA/B/Cを選択した場合も、選ばれたrevisionとscopeだけを扱い、旧source全体のclosureを推定しない。

## 静的照合の記録と停止境界

- 上記legacy file SHA-256はarchive bytesに対し再計算し、`legacy-auxiliary-contract-refinement-recheck-2026-09-28.md`のsource hashと一致することを照合した。
- current L2/L11 file SHA-256は対象commitの本文から再計算した。typed ID、path、位置は本文とdecision記録を照合した。
- 旧CLI/runtime/test/CI、現行CIは実行していない。HAT・HSTの`designed_not_implemented` / `not-implemented`を実績扱いしていない。
- このフレームは候補追加、L2/L11編集、採否、successor assignment、owner assignment、採用version、旧source closureを行わない。意思決定後の要求変更が必要な場合は、その対象revision・source・変更/保持理由を別の作業で明記する。
