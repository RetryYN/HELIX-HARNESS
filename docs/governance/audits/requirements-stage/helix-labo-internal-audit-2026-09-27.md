# HELIX-LABO 機構内監査

## 対象と基準

- 監査基準: `858026b250a15d4fec020b21b315c250decf960b`。作業時のcheckoutは`5c5bf790ecc1129bfcd11225cfe0ab31c587b192`だったが、対象のL1/L2/L11、PO source、decision、legacy candidate各ファイルを基準commitと比較し、すべて同一内容であることを確認した。
- 読了した現行資料とSHA-256:
  - `docs/helix-labo/L1-planning/labo-intent.md` — `78b686adcefe6a6867134a17238b59acef19e6c52dc735989f47aa637ed309cc`
  - `docs/helix-labo/L2-requirements/labo-requirements.md` — `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`
  - `docs/helix-labo/L11-acceptance/labo-acceptance.md` — `9f37f8c3ef0882724825433c6484d7ae4f73d24750962ebebe535c63e54e1060`
  - PO原文 `docs/helix-labo/sources/labo-core-engine-po-original-2026-09-26.md` — `3f95f09ee86920e0dd6172a9e28f32192c1ee16bd4bfbec72438464bfee9fa16`
  - legacy holding `docs/helix-labo/candidates/improvement-research-requirements.md` — `b0c1a193a61b5c64f8fef7307f17370aa1eb2a79a3fbdc425f88ff6c87a4cb9e`
  - decision `docs/governance/decisions/labo-core-engine-po-decisions-2026-09-26.md` — `b77fedaafaa484a178b4fda9e271ad44b892213d7b8db2a18a0250f3ed6d3169`
  - G9補強PO原文 `docs/helix-os/sources/body-reinforcement-po-original-2026-09-27.md` — `cf45adb7212a35c496e420973be0933ec38d4c00175051811f6a9c0b2c06ac78`; decision `docs/governance/decisions/body-reinforcement-po-decisions-2026-09-27.md` — `c0cf47913b93e462cd609b51f3a8ca634b84bf46dc351aa1debfcb91b919ce8d`
  - G19 PO原文 `docs/helix-harness/sources/capability-reinforcement-po-original-2026-09-27.md` — `ab8bb6ae8cd418053d6baaafccaa80ee8ef2e715caab1576e5a00c306e97d1f8`; decision `docs/governance/decisions/worker-support-derivation-2026-09-27.md` — `433e3887f834f9c0c9054282c4c25b9caee59334c1121a15fb7dad86661b014d`.
- 対象はL1/L2/L11の各identity、PO §24不変条件、legacy asset holding、G9の初回Bench条件、G13/G19比較条件。旧資料は静的に読んだだけで、旧runtime/test/CLI/CIは実行していない。

## 監査結果

重大な本文矛盾・PO条件の欠落は見つからなかった。以下は要求候補の意味・受入条件の整合確認であり、文書や静的validatorの存在を実装・利用者受入とみなしていない。L1/L2/L11は`draft_candidate`で、採択、L3承認、実行許可を生成しない（L1 front matterおよびL2 `:19-21`、L11 `:19-21`）。

### identityと受入行の全件照合

現行identityはL2見出しから数えた53件。構成はgeneral 001–010 (10)、connections 011–042 (32)、composite 050–053 (4)、Bench接続054、Bench単体055、追補056–060 (5)。043–049は欠番であって未収載要求ではない（L2 `:23-25`）。以下のL2行は各要求見出し、L11行は同IDの受入表または追補を指す。親/版はL2の親対応表 `:27-45`、L1→L2/L11/版対応表 `:47-63`、各接続個別条件 `:163-294` を合わせて確認した。

| L2 ID | 親L1 (primary / context) | 版・要求範囲 | L2根拠 | L11根拠と監査したoracle |
|---|---|---|---|---|
| 001 | L1-001 | 1.0 | :69 | :45 許可された全状態、provenance、source authority不変 |
| 002 | L1-002 | 1.0 | :77 | :46 episodeの要求から復旧まで、相関≠因果 |
| 003 | L1-003 | 1.0 | :85 | :47 複数分類軸とunknown保持 |
| 004 | L1-004 | 1.0 | :93 | :48 意味・条件を保つ部分構造比較 |
| 005 | L1-004 | 1.0 | :101 | :49 変換操作と意味差、変更非実行 |
| 006 | L1-005 | 1.0 | :109 | :50 同条件比較、OS assignmentとWorker結果、品質・費用・介入・反例 |
| 007 | L1-006 | 1.0 | :117 | :51 oracle・副作用・retry/rollback/idempotency、system化の過剰主張拒否 |
| 008 | L1-006 | 1.0 | :125 | :52 operation復帰/保証/未完義務 |
| 009 | L1-005, L1-007 | 1.0 | :133 | :53 一件から一般化しない、scopeと反例 |
| 010 | L1-007, L1-010 | 1.0 | :141 | :54 Feedback必須情報とauthority境界 |
| 011 | L1-001, L1-002 | 1.0 | :163 | :62 Aggregate→Correlate、source参照と因果未確定 |
| 012 | L1-002, L1-003 | 1.0 | :167 | :63 episode→分解、根拠/unknown保持 |
| 013 | L1-003, L1-004 | 1.0 | :171 | :64 分解軸と根拠→Vector |
| 014 | L1-004 | 1.0 | :175 | :65 元意味/目的/条件→Transformation |
| 015 | L1-004, L1-005 | 1.0 | :179 | :66 baseline/candidate/hybridの版・条件・oracle |
| 016 | L1-005, L1-006 | 1.0 | :183 | :67 比較結果/反例→保証配分 |
| 017 | L1-006 | 1.0 | :187 | :68 system/operation保証と未完義務を引継ぎ、LABOは切替えない |
| 018 | L1-005, L1-007 | 1.0 | :191 | :69 標本条件・反例と限定scope |
| 019 | L1-005, L1-007, L1-010 | 1.0 | :195 | :70 target別Feedbackとresponsibility |
| 020 | L1-001, L1-006 | 1.0 | :199 | :71 operation復帰後の新観測と前後版 |
| 021 | L1-001 | 1.0 | :203 | :72 HARNESS許可観測とsource revision |
| 022 | L1-001 | 1.0 | :207 | :73 OS ticket/運転/証拠、未完保持 |
| 023 | L1-001 | 1.0 | :211 | :74 BRAIN利用/変更結果、source版 |
| 024 | L1-001 | 1.0 | :215 | :75 INTELLIGENCE判断と過去評価の分離 |
| 025 | L1-001 | 1.0 | :219 | :76 SECURITY scope適合evidence |
| 026 | L1-001 | 1.0 | :223 | :77 INFRASTRUCTURE resource/runtime evidence、source版 |
| 027 | L1-001 | 1.0 | :227 | :78 CONNECT contract/provenance/schema版 |
| 028 | L1-001 | 1.0 | :231 | :79 Worker結果とOS assignment/ticketの照合 |
| 029 | L1-001 | 1.0 | :235 | :80 CI/test結果とrevision/range |
| 030 | L1-001 | 採択済みProduct scopeに従う | :239 | :81 Product meaningとsource identity維持 |
| 031 | L1-001 | 選択したWeb source contractがある場合 | :243 | :82 任意接続。未採択Webを1.0前提にしない |
| 032 | L1-001 | 選択したWEB-OS source contractがある場合 | :247 | :83 任意接続。tenant scope/authority維持 |
| 033 | L1-009 | 2.0 | :251 | :84 外部provenance、命令/patchを直接実行しない |
| 034 | L1-007, L1-009 | 内部generic evidence 1.0。外部評価loop 2.0 | :255 | :85 複数meaning/product/episodeの支持と範囲 |
| 035 | L1-007, L1-010, INTELLIGENCE-L1-018 | 1.0評価材料 | :259 | :86 評価payload、未評価保持。Bench重複なし |
| 036 | L1-007 | 1.0 | :263 | :87 HARNESS candidateへの返却、要求/contractを書換えない |
| 037 | L1-007 | 1.0 | :267 | :88 OS向け運転Feedback、ticket/routingはOS |
| 038 | L1-007 | 1.0 | :271 | :89 SECURITY提案、権限変更やrestricted data移動なし |
| 039 | L1-007 | 1.0 | :275 | :90 Worker execution feedbackをOS/SECURITY経由へ |
| 040 | L1-007 | 対象接続の採択scope | :279 | :91 接続固有feedback、CONNECTが契約を所有 |
| 041 | L1-007 | 各Product採択scope | :283 | :92 product meaningをCORE側へ返す |
| 042 | L1-007 | WEB-OS接続の採択時のみ | :287 | :93 任意接続、authority不変 |
| 050 | L1-008 | 1.0 | :298 | :100 source→変更→再観測、同一ticket/版と独立効果評価 |
| 051 | L1-009 | 2.0 | :304 | :101 外部sourceを検証後candidateへ |
| 052 | L1-007, L1-010, INTELLIGENCE-L1-018 | 1.0 evidence | :310 | :102 035 payloadの同revision受領、学習実行は不要 |
| 053 | L1-010, INTELLIGENCE-L1-021..026 | 3.0+ | :316 | :103 training data利用循環、1.0依存にしない |
| 054 | L1-011, INTELLIGENCE-L1-010 | 1.0 | :290 | :94 055のscope/level/evidence/未評価を変えず受渡し |
| 055 | L1-011 | 1.0 | :150 | :56 task/model class別evidenceとunassessed、配置非決定 |
| 056 | L1-011 primary; OS-L1-003/INTELLIGENCE-L1-010 context | 1.0 | :379-389 | :138-146 初回runをobserved/unassessedで保持。oracle実適用時だけ範囲限定評価 |
| 057 | L1-001, L1-011 primary; OS-L1-003/006 context | 1.0 | :391-401 | :148-154 CONNECTまたは同義務人手receipt、stale/重複防止、結果受領と評価を分離 |
| 058 | L1-001 | 1.0 | :403-414 | :156-162 常時provenance/許可等、選択sourceごとに接続、Web操作は条件付き |
| 059 | L1-005 primary, L1-011 context | 1.0 | :416-439 | :170-176 G20: 選択目的に応じてなし/旧/新cohortを選ぶ。baseline/current/candidate/hybridは別軸 |
| 060 | L1-005 primary, L1-011 context | 1.0 | :441-455 | :178-185 G19: 同じWorker/model/provider/version/effortで支援有無だけ比較し、独立reviewと全費用を検査 |

### PO・legacy起点と保持/変更

1. **LABOの時間軸とauthority** — PO原文§1–3、§18、§21–25（原文snapshot全体を保持）、L1 `:17-35,67-85`、decisionを照合した。過去の結果・episode評価はLABO、現在/未来の判断・配置案はINTELLIGENCE、ticket登録/routingと指定/割当はOS、state/authorityは各sourceに残す。L2 `:19-21`とL11 `:105-125`の15不変条件にもこの境界が反映されている。各文書が未採択revisionである留保も明記されている。
2. **episode / RCLS** — `LEGACY-ASSET-D60AE87D9DFA0740F4A8`, `archive/legacy-generation-2026-09-14/root/src/schema/harness-db-tables-evaluation.ts:32`, SHA `d3f5f8b303cd9f568d7695d19c05d0e4b492f7df9caa60c929a749fa2990bbe2`の`improvement_episode_id`を保ち、episodeの対象を機構横断の履歴へ拡張している。`LEGACY-ASSET-F2C2755C8809C2C0DEAD`, 旧RCLS `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-requests.md:17-38`, SHA `c3d9f28a17ac8882f22b5cf86b6d0b16c457a996b3eb0682b6de1010d64ea29c`にあるownership、CASE/SCENE/PATTERN/LOG/VERIFY、最小packet、段階的昇格、失効/revalidation、authority非変更は保持候補として記載（L2 `:342-353`, L11 `:127-136`）。新たなlearning subsystemをLABOへ重複追加していない。
3. **HBRとsystem/operation** — `LEGACY-ASSET-EE5DBACC7F28F7D1F605`, `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md:46,92` (HBR-P4; 全体SHA `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544`)にある計測に基づく改善評価を保持し、POに沿って品質・費用・再作業・人の介入・運用負荷へ評価軸を広げている。L1 `:81-85`はsystemからoperationへのfallbackに対応する旧記述がないことを明示し、保持扱いに偽装せず差分としている。HBR-P8の外部source provenance/security境界は候補と外部評価経路として残し（L2 `:342-353`）、採択済み扱いしていない。
4. **Bench** — `LEGACY-ASSET-3A15E5645D2D2A59DFF5`, `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:349-351`, SHA `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`のHXB-FR-015から、証拠状態とtask/risk/profileを示し、配置・権限をBenchが決めない境界を保持している。`LEGACY-ASSET-50CA1C554747F12266D3`, `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/resident-lane-orchestration-requirements.md:663-666`, SHA `17bc83614d7f5f75b61831eb447a23ee706cb8a6d9e54477736e553ff956dcfd`のRLO-FR-040は`provider_default_unbenchmarked`とscore単独でauthority/assignmentを変えない条件を保持する。受入は別資産`LEGACY-ASSET-437A6A68F9A9E0AE1B9E`, `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/resident-lane-orchestration-acceptance.md:43`, SHA `63ac3d0fbc36f014977998f9073846bfc01e5d352e07c1e10d408f0eab0ad707`で、未評価表示とauthority非導出を確認した。L1 `:89-90`、L2 `:150-161,379-389`、L11 `:56,138-146`も未評価、scope、receipt、非割当の条件を残す。PO補強第1点はRLO-FR-040だけでは初回割当/実行の条件が閉じないと指摘している。056/057とOS/INTELLIGENCE側の追補は観測・受領・評価の境界を閉じる候補であり、実行許可そのものとはしていない。
5. **Bench比較の旧根拠** — `LEGACY-ASSET-28FB139B26CD61CC51EE`, `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/helix-bench-evaluation.md:76-147`, SHA `a1a5fea1fb89434fb025a9c0541f5cacb10ac9be66e97e7e7964975d2469b116`と、受入資産`LEGACY-ASSET-A952A3A175EB82A4781B`, `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/helix-bench-evaluation-acceptance.md:30-41`, SHA `6b5a72da16fe56130350b6e8b8fc2606cb8c90015ff73f34ffb3b93625a0c185`を照合した。同一task snapshot/scorer/protocol/hardwareの比較、oracleに基づく結果、品質/security/data-loss failureを平均で相殺しない、accepted changeが0のrunを成功扱いしない、retry/review/rescue費用、価格provenance、履歴versionのscopeを保持する。G20のL2-059は「常に三cohort」の読みを、比較目的ごとに必要cohortを選ぶ条件へ改めた。明示的な三者比較の要件は残る。
6. **G19 Worker支援** — PO原文第5項とdecisionでは、強い役がtest/指示を準備し、軽いWorkerが実装/相談し、独立review後に元Workerが修正する流れを求めている。LABO060は同じ元Worker/model/provider/version/effortとtask/oracleの2群を受け取り、支援経路の有無だけを変える。補助者/救援/review/人の費用も含む。評価はLABO、支援案はINTELLIGENCE、assignmentはOS、oracleはHARNESSが所有する。060は059に統合されない。059は効果目的に応じたHELIX支援cohortを比較し、060はWorker設定を固定した支援あり/なしを分離する。L2 `:441-455`、L11 `:178-185`に条件と2群のreceiptがある。
7. **Connectorの旧来条件** — `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`と`LEGACY-ASSET-C35E93F2D36777CD7462`の旧connector/schemaについて、provenance等の意味はL2 `:361-368`に保持されている。sourceごとの版、schema、権利、provenance、接続境界は引き継ぐ。一方、旧来の製品データ取込connectorをそのまま移すのではなく、PO判断に沿って現行の各edgeに個別connectorを置く（L1 `:88-90`, L2 `:163-294`）。

## 確認事項と具体的な不足

### 問題なし（条件を本文で閉じている）

- **観測と評価の分離**: 056は初回runを観測済みとして取り込むが、一般的な適格性の証明にはしない。対象scopeに適用できるoracle/revisionを実績へ実際に適用し、結果・失敗/反例/unknown・評価者・receiptが揃った場合に限り、その範囲の評価済み水準にできる（L2 `:384-389`; L11 `:141-146`）。scopeやoracleが不明・欠落なら未評価を保つ。根拠のない数値閾値や標本数下限は追加していない。
- **評価と配置/authorityの分離**: 055はtask/model-class別のevidenceを生成し、054は同じ水準・scope・根拠をINTELLIGENCEへ渡す。配置案はINTELLIGENCE、assignmentはOSの責務（L1 `:55-63,90-91`; L2 `:150-161,290-294`; L11 `:56,94`）。RLO-FR-040の未評価/default明示と、scoreからauthorityを導かない条件も残る。
- **選択sourceに応じた観測依存**: 058はprovenance/source state/data-use許可/scope/契約版/source authorityを保持し、選択した各sourceの接続と安全条件を要求する。一方、未選択sourceは未観測のまま、別sourceだけを扱う有効な呼出しを妨げない。Web/WEB-OSは採択済みsource contractの下で選んだ場合にのみ必要。PO補強第2点に沿い、安全依存は任意化していない（L2 `:403-414`, L11 `:156-162`）。
- **G20 cohort修正**: 059は実験条件（`baseline/current/candidate/hybrid`）と支援cohort（HELIXなし/旧版/新版）を分ける。導入効果なら有無、改訂効果なら旧版/新版、三者関係を主張する場合に限り3群を使う。未選択cohortの欠落は、必要な二者比較を妨げず、二者比較の結果を三者比較として報告することも許さない（L2 `:420,426`; L11 `:170-175`）。
- **G19支援比較**: 060は元Worker/model/provider/version/effortとtask/oracleを固定し、支援有無だけを変える。相談receiptは実相談を行うrunに必要であり、事前test/指示準備だけの支援では要求しない。支援、救援、再作業、人の介入/費用を含める（L2 `:441-455`; L11 `:180-185`）。独立reviewerは元Workerと支援作成者のどちらとも分離され、POの段階処理と整合する。
- **Web/日次候補の扱い**: 現行LABOのidentityに`HELIXLABO-L2-WEB-*`はない。旧Web原案の14項目は`improvement-research-requirements.md:67-100`に`authority_status: awaiting_human_approval`の候補として保持され、日次集計/遅着訂正（WEB-007）は同文書`:91`にある未採択条件で、現行1.0要求ではない。L11 `:129-136`もWeb項目を候補と明示する。Web観測接続031/032とWeb向け042は上流source/connection contract採択時だけ（L2 `:243-249,287-289`）で、LABO 1.0全体はWeb本番運用やtenant dataを前提としない。
- **保持と状態**: 旧RCLS/Web項目はholding文書に残っている。現行文書は候補状態を維持し、L11も未実行の文書やvalidator成功を利用者受入とみなさない。旧候補を失わず、採択済み条件へ黙って昇格させていない。

### 明確化候補（採択済み欠陥とは断定しない）

1. **旧Benchの評価根拠を現行Benchへどう対応づけるか** — 旧HXB-R-06/07/08とAC-008..014には、指標ごとの分子/分母、欠測・失敗の扱い、信頼区間、受入変更あたりの正規化、benchmark作成者とblind judgeの分離がある（`helix-bench-evaluation.md:119-147`; acceptance `:37-41`）。現行055/056はscope付き結果・評価者・receiptを求め、059/060は費用、oracle、比較可能性、reviewer分離を定めるが、LABOの各scoreに旧指標をすべて明記してはいない。旧Benchはhistorical sourceとしてholdingされ、task/model evidenceへ意味を再導出しているため、これはPO条件の欠落と断定できない。ただし1.0 Benchが指標別または集計性能を主張するなら、分母/欠測やscoring/judging provenanceをどう示すか、あるいは現行scoreの対象外とするかをL11で明記する候補がある。source decisionなしに数値下限や固定反復回数を戻さない。
2. **水準evidenceの版/鮮度** — L1/055は評価期間とscopeを含み、RCLS候補はexpiry/authority/provider/modelのstalenessと再検証を保持する。一方055単体では、task class定義・oracle・model class・source変更後に過去evidenceをいつstaleとするかの対応が詳しくない。L11候補holding `:131`はstaleness/revocation/revalidationを確認対象としている。task class定義、model/provider/version、oracle、source revision、評価期間と適用条件に結び、scope不一致・期限到来で未評価/再評価へ戻す旨を明確化する候補がある。現行のholding意味を具体化する提案で、任意の期限値を新設しない。
3. **G19の履歴比較条件** — 060は履歴runのsource/authority/version/scope/receipt保持を求めるが、履歴runを支援あり/なしの対応群として扱う互換条件は059ほど具体的に再掲していない。現行L11ではoracle/receipt不明なら比較不能となる。060にも同一snapshot、environment/toolchain、scorer/protocol/hardware等の対応条件を明示する候補がある。ただし現状でもL2はそれらを比較入力として要求し、差があれば同条件と主張できないため、誤った成功経路は確認していない。

以上の3点は文書の明確化候補であり、採択済み欠陥とは断定しない。Web有効化、最低標本数、ユーザーへの反復確認、LABOによる配置決定、runtime操作を強制する具体的な受入矛盾は見つからなかった。既存L1/legacy holdingの範囲で明確化するか、L1/PO採択まで保留するかは親レビューに委ねる。

## Lines and exclusions checked

- L1 exact hierarchy/meaning: `labo-intent.md:17-35,42-90,92-102`; its mapping has 11 parent identities. L2 table is the authoritative 53-item expansion; IDs 043–049 are unused, not hidden requirements.
- L2 individual requirement groups: units `:65-161`, connectors `:163-294`, composites `:298-320`, invariants and source crosswalk `:322-377`, additions `:379-455`.
- L11 general/unit/connection/composite/§24/candidate rows: `labo-acceptance.md:19-136`, G9 acceptance `:138-162`, G13 `:164-176`, G19 `:178-185`.
- PO source §1–25 including §24 invariants at `labo-core-engine-po-original-2026-09-26.md:1-842`; G9 and G19 PO snapshots and decisions cited above. None of these decisions is treated as L1/L2 adoption.
- Web input source itself is referenced as a candidate in holding file; its exact 14 candidates are retained `improvement-research-requirements.md:67-100`, including daily collection. It is excluded from the current 53-identity count.

trackedファイルは編集していない。旧実行物・test artifactも実行していない。

## 作成側の検収と後続消化

GPT6 Luna highの調査をCodex executionが検収した。明確化候補1・2は、L2-055/056と対応するL11の「評価済み」の根拠を確かめる受入補強案として後続消化へ渡す。評価に使うmetricの定義・欠測処理・scorer/source revisionを辿り、過去の結果を現在の範囲へ無条件流用しないことを具体例で確認する。旧Benchの全固定手順や数値を一律復活させず、未採択holdingの採択も生成しない。具体式・許容値・有効期間の値はL3へ渡す事項として区別する。

候補3は本文変更不要とする。L2-060の同条件・支援だけ変更・条件不一致時未評価、対のL11の同一task/oracleと両receiptの条件により、異なる履歴条件の無根拠な同条件比較を既に拒否する。横断整理では059の目的別cohortと060の同一Worker比較の区別を再確認する。監査mergeは受入補強の完了でも要求採択でもない。
