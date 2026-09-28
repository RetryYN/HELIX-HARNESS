# 手順5 P1: Worker機能単位の旧条件処置案

基準main: `859bebd2ef1ee7079800793a7f0d9c1b88c123d5`（PR #2277 merge後）。本書はWorkerの機能単位6件に限るread-onlyの意味照合案であり、要求の採択、旧source holding解除、正式successor割当、実装・実行受入を生成しない。旧CLI、runtime、adapter、test、CIは実行していない。対象外を含むREG-06全体の未対応0は主張しない。

## 範囲と数え方

旧条件を、作業の進行に沿った6つの機能単位へまとめて照合する。

1. 起動とassignment
2. eventとlifecycle記録
3. 出力と結果の受領
4. 安全・権限・隔離
5. adapterとWorker契約
6. 検収・承認の責務

「単位」は意味をまとめた調査行であり、旧atom数、source line数、L2要求数ではない。現行要求にある同義の意味と、その要求だけでは未成立の詳細を分けた。candidateは採択済みとして数えない。旧実装方式のretireはPOへ提示する処置案であり、retire判断済みとはしない。

## 6単位の照合

| # | 機能単位 | 旧条件と根拠 | 現行の採択済み契約／候補 | 処置案 |
|---:|---|---|---|---|
| 1 | 起動とassignment | 旧`WCC-FR-01/02/09`: descriptorとprovider共通I/O、HARNESS wrapper経由の起動、起動前のHEAD・authority・scope・budget・payload binding（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/worker-common-contract.md:55-56,63`; asset `LEGACY-ASSET-9114D4E463E95B67DD0C`; file SHA-256 `773280fa06cfb06989c4d2d66b15499635d14cd024b77401c18715c9d0588290`）。 | OS L2-004/L11-004はticketからのWorker指定、assignment、対象revision、モデルクラス、呼出しlane、scope、予算/期限、結果・証拠と停止を採択済み（`governance-requirements.md:538-547`; `governance-acceptance.md:24,37-38`）。SECURITY L2-007/008は適用制約と個別operation authorityを採択済み。SECURITY L2-033は外部Workerのdescriptor/version/config・HEAD・authority・rule・assignment境界を束ねる**未採択候補**（`security-requirements.md:455-466`）。 | 共通assignment/停止条件は採択済み。外部Workerの実行文脈束縛の追加詳細はL2-033候補の範囲に留める。旧CLI名、固定wrapper経路、旧context packet schemaはPO retire提案。 |
| 2 | eventとlifecycle記録 | 旧WCC-FR-01はprovider別I/Oを同じtyped event形へ収束。旧lifecycle設計はrequest/admit/sandbox/run/proposal/revalidate/terminalをexact event chainへ束ねる（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/worker-common-contract.md:55`; `.../L5-detail/worker-lifecycle-receipt.md:20,34-42`; lifecycle asset `LEGACY-ASSET-25EB3B29EA909B050987`, file SHA-256 `275fe7149c80d6abbc85aa59b50bfc4c00e1f55bfd783b6cd092557cd8c21ccc`）。 | OS L2-007/009とL11-007/009は出典・event・判断・検証証拠、durable記録、冪等投影、checkpoint、担当交代後の未完義務と予算の保持を採択済み（`governance-requirements.md:60-64`; `governance-acceptance.md:27,29`）。 | 因果trace・durability・冪等性・未完保持は採択済み。特定の旧state列、hash-chain、process-local receipt/DB writerを要求意味として再導入せず、PO retire提案。 |
| 3 | 出力と結果の受領 | 旧WCC-FR-05はstrict schema/digestを既定にし、不適合出力をcommit対象外とする。FR-06はworker/reviewer model familyを記録（同旧source:59-60）。旧output設計は特定envelope/schema/canonical stdoutでadmit（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/worker-output-admission.md:21-66`; asset `LEGACY-ASSET-9739694943846FEB80E8`, file SHA-256 `c6bdc58ce2df0317ce20f95b48d4eda043c385819faa4ec66019ce3a52f52cff`）。 | OS L2/L11-004は結果・成果物・証拠をassignmentへ結びWorker自己申告だけで独立検証済みにしない。HARNESS L2/L11-010/011は契約済みpackの入出力、版、証拠・相関、停止/再開を採択済み（`product-requirements.md:340-360`; `product-acceptance.md:205-206`）。外部Worker出力の非権威性、context-binding、別HEAD成果拒否はSECURITY L2-033の未採択候補（同security L2 `:455-466`; L11 `security-acceptance.md:124-133`）。 | 一般の結果追跡と独立検収は採択済み。外部Workerのauthority非生成とcontext/output束縛はL2-033候補のまま。旧canonical envelope、stdout制限、digest方式の細目はPO retire提案（現行の契約識別/検証義務を妨げない）。 |
| 4 | 安全・権限・隔離 | 旧WCC-FR-03/04は隔離worktree、repository/DB/credential非到達、network deny、scope外diff拒否を列挙（WCC同:57-58）。旧isolation policyはsecret task全般deny、host allowlist非対応、特定broker/enforcerを前提（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/worker-isolation-policy.md:21-43`; asset `LEGACY-ASSET-604CADBAF8004788EB15`, file SHA-256 `152a7a5806001ae1b2e0215d7cd61db14b7c61cbc4b4b501524bda58622716cf`）。 | SECURITY L2/L11-005〜009がraw secret隔離、egress、実行制約の伝達と適用観測、操作authority、revoke/隔離伝播を採択済み（`security-requirements.md:110-157`; `security-acceptance.md:29-33`）。#2277後もL2-033全体は未採択候補で、その追補はraw secret/機密内容がWorkerへ渡る場合をdenyし、既存の限定credential-use capabilityを同条件だけで一律denyしない（L2 `:479-485`; L11 `:147-154`）。 | 安全保証とowner境界は採択済み。旧sandbox broker、旧filesystem/network手段はPO retire提案。旧「secret/credentialが必要なtask一律deny」の曖昧な範囲は、#2277の未採択訂正candidateと採択済み005を併記し、PO判断なしにretire済みとしない。 |
| 5 | adapterとWorker契約 | 旧WCC-FR-01/02はprovider共通descriptor・I/O・同一CLI wrapperを要求（WCC `:55-56`）。旧HIL-BR-30は工程/要求入力から専門Worker契約を自動生成（後掲source表）。 | HARNESS L2/L11-010/011はpack単位のversioned input/output/dependency/verification contractと呼出し境界を採択済み。OS L2-004はWorker identity/capability/provider/model/configを記録。INTELLIGENCE L2-014は目的/scope/input/output/action/stop/versionを持つ専門Bot候補を採択済みだが、実作業はOS割当Workerへhand-off（`intelligence-requirements.md:126-130`; 2026-09-28 PO decisionの明示候補集合に含む）。ただしHIL-BR-30/FR-59/FR-60が要求した専門Worker contractの生成物とmuster判定は、既存割当・Bot manifest・pack contractでは満たさないと個別監査が判定。 | 一般のprovider中立契約は採択済み。旧wrapper/typed-event adapter実装はPO retire提案。専門Worker contract生成・musterは**新しい要求候補が必要**だが、後継ID・配置は未決。HARNESS/INTELLIGENCE配置A/BのPO判断前に要求本文を起こさない。 |
| 6 | 検収・承認の責務 | 旧WCC-FR-06は作成者と独立reviewerを区別するが、provider/model familyも独立性要件に含める（WCC `:60`）。旧resident-laneはworkerまたは同じidentity/session/contextでの自己検収を禁じる（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/resident-lane-orchestration-requirements.md:298-310`; file SHA-256 `17bc83614d7f5f75b61831eb447a23ee706cb8a6d9e54477736e553ff956dcfd`）。 | OS L2/L11-004採択済み: INTELLIGENCEは配置案、OSは検証後の割当、Workerは実行、SECURITYは自己承認防止/authority。作成側Worker/Subagentを独立reviewと数えず、identity/context/authority/routeで独立性を判定。PO Worker decision（`worker-execution-model-po-decisions-2026-09-26.md:56-60,82-92`; file SHA-256 `1c93bf0aadccfdf6b536a32d3923a17fbd00a1fd830850f9369b5b6d6b12efb2`）。 | 責任分離・独立検収は採択済み。provider/model familyの一致/相違を独立性の代理にする旧条件はPO retire提案。別providerや毎回の人間承認は要求しない。 |

## specialist contract生成の限定残差

以下は、今回の6単位のうち#5「adapterとWorker契約」に属する一つの機能残差である。担当割当・配置案・Bot manifestと、runtime-neutral specialist contractの生成出力を同一視しない。

| 旧condition | 旧source evidence | 現行照合と残差 |
|---|---|---|
| HIL-BR-30 | `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:82`; file SHA-256 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`; line SHA-256 `8018d4ab61dd475b84ee1356de5de5137adf94bd41e975f2669c98371f1d401e`。入力から専門契約を必要時に生成し、専門化根拠なしのagent増殖を避け、worker/verifier/authority分離・最小context・tool/path・budget・停止条件を生成時に拘束する。 | L2-004/017/018のticket/assignment、INTELLIGENCE L2-010配置案、L2-014 Bot manifestは生成contract outputそのものを保証しない。現行再照合でも残差。 |
| HIL-FR-59 | 同asset/path/file SHA; `:149`; line SHA-256 `809e21f8712d919dadefec5a46f925499d4dd2b38215def9448e409dc6eac029`。runtime-neutral contractにobjective、成果schema、tool guidance、task boundary、context selector、allow/deny tool/path、model/effort class、budget、checkpoint、escalation、verification contractを生成し、input/output digestと理由/guard receiptを伴う。 | 現行OS/INT/LABO/HARNESSの当該L2/L11はこれら全fieldを持つcontract生成物を定めない。未処分の意味残差。 |
| HIL-FR-60 | 同asset/path/file SHA; `:150`; line SHA-256 `646140e1b0193743f2d10874a4b4dc234299f69b8580473b98914923d4016c35`。専門化の測定便益（専門知識/独立context/並列性/blind verification）とsingle-worker十分性でmuster/retireを判断し、worker/verifier分離、lease/fencing、retire条件を保つ。 | INTELLIGENCE配置案とLABO評価をこのmuster/retire能力の代替としない。特に配置が決まっておらず、現行candidate closureなし。 |

既存監査`legacy-ir108-disposition-summary-2026-09-28.md:30,33-38`およびmatrix JSONのHIL-BR-30 `:1177-1178`、HIL-FR-59 `:2539-2543`、HIL-FR-60 `:2598-2599`も、contract生成/musterはassignmentやplacementだけで充足せず、後継IDなし、P-SPECIALISTの配置・scopeが未決とする。旧HIL-BR-09 `infinity-loop-platform-requirements.md:61`（line SHA `4bafa90da44e3d6bc2cb8f3f3517f16f1e7c72ff2d5872236de3cd3b2b2a3111`）もHARNESS側agent contract generation案を記す。旧案の特定runtime/team定義方式は移植根拠にしない。

**推奨する後続P1 PR**: HIL-BR-30/FR-59/FR-60を一つの専門Worker contract生成/muster capabilityとして、L2と対L11の正常・拒否・未見oracleへ整理する。今回の監査で要求本文や候補IDは作らない。候補化と同時にPO判断packetでP-SPECIALISTの配置候補（HARNESS/INTELLIGENCE）と適用scopeを比較し、既存owner（HARNESSの工程/pack contract、INTELLIGENCEの専門化/配置案、LABOの能力・効果評価、OSのassignment、SECURITYのauthority）を重複させない。固定provider/worker数や旧runtime射影は候補にしない。

## 件数と進捗表示

この監査用に定義した6単位は、照合開始時点では分類未了 `6/6` と置く。これはREG-06の旧source atom数や未解決件数ではない。照合後の**分類結果**は次のとおり。

| 状態 | 単位数 | 内訳 |
|---|---:|---|
| 採択済みの一般条件に対応 | 2/6 | #2 event意味、#6 approval。旧実装方式のretire提案はPO未決であり、旧行全体のclosureではない。 |
| 採択済みの一般条件＋既存未採択candidate detail | 3/6 | #1の割当/停止、#3の結果/検収、#4の安全/authorityの一般条件は採択済み。外部Workerのcontext/output/isolation detailはSECURITY-L2-033候補にも接続し、P0訂正後も未採択。 |
| 新要求候補が必要 | 1/6 | #5一般adapter契約は採択済みだが、専門Worker contract生成/musterは別の残差（HIL-BR-30/FR-59/FR-60、後継ID未割当）。 |
| 旧方式としてPOへretire提示 | 上記に直交 | same CLI wrapper、provider固有typed event/wire protocol、旧lifecycle/hash-chain/DB、旧sandbox broker/enforcer、特定canonical stdout envelope、provider/model familyでの独立性判定。 |

従って、この6件の**分類未了は6→0**。処置が必要な機能残差は2群に集約される。ひとつは#1/#3/#4に接続する既存L2-033候補の採否、もうひとつは#5内の専門Worker contract生成/muster候補である。一般条件が採択済みの単位は5/6だが、これを各旧行全体の無損失や採択済みだけでのclosureとは数えない。P1全体のcompletionやREG-06未対応ゼロを意味しない。retireのPO選択がなければ旧方式項目は「retire提案中」と保持する。

## REG-06/overlayとの関係

`legacy-source-origin-reg06-population-audit-2026-09-28.md`はsource→current condition mapping未完と明記し、未対応0を否定する。本表は逆向きのREG-06 closureを代替しない。candidate 4,755 source linesの補正後累積は、要求条件882、unknown route 586、source relation未解決141、unadopted-candidate relation-only155。description-condition overlayは指定10行だけをdescriptionからconditionへ再分類しており、Worker条件のcoverageを付与しない。これら全体件数は本調査で減算しない。

## 静的検証の範囲

本書作成では対象旧source、現行L2/L11、PO decision、REG-06母集団監査、条件overlay、IR108 disposition監査を読んだ。旧runtime/test/CIは実行していない。監査案であり、L2/L11やregister/receiptの変更、要求候補登録、採択、実装/実行検収は行っていない。
