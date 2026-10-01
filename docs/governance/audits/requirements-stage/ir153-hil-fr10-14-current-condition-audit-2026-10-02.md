# IR153 HIL-FR-10〜14 現行条件照合

## 基準と範囲

照合対象は `a93fec99f8c10aafb7e1b54a24ea9d1ba55bac20` の本文と、旧IRのFR10〜14各条項です。旧L1は `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md`（SHA-256 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`）、旧IRは `docs/governance/requirements-source/requirements-ir/requirements.json`（SHA-256 `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`）です。各物理行、IR JSON pointer、statement/record digest、HR/HAC/HAT、現行L2/L11の全file SHA・section digest、PO decision pinは[監査JSON](ir153-hil-fr10-14-current-condition-audit-2026-10-02.json)に記録しました。

確認対象はFR10〜14に限り、FR01〜60・IR153全体のclosureは主張しません。旧L4/L5のAgent Registry、Agent Lifecycle、Memory/Learning Promotion資料はsource意味確認だけに読み、実行していません。旧runtime、CLI、test、CIは実行していません。

採否はdecision recordと固定対象revisionから読みました。本文見出しに残るcandidate/unadopted表示は歴史的metadataとして扱っています。HARNESS-L2-047は2026-09-29 decision row 52で条件付きA配置採択され、その現在section digestは決定値と一致します。OSの017/018/019/022/023は2026-09-28固定decisionが対象集合へ採択しており、現行section digestも固定値に一致します。BRAIN-007/008/009/020/025およびLABO-007も固定decisionで採択済みですが、採択済み能力と旧FR atomの正式移管は別の事実として記録しました。

## FR別照合

| 旧FR | 現行保証との対応 | 結論 |
|---|---|---|
| HIL-FR-10 | OS-019はevent/evidence/projectionのprovenanceとcontinuityを保持する契約で、Issue admission summaryとcompletion knowledgeを別eventとして圧縮するmemory compactionではありません。BRAIN-007/008/025は知識候補のsource/evaluation/version/adoptionを統制しますが、旧compaction outputやno-promotion receipt、raw log除外は定めません。HARNESS-057は旧FR10をsource holdingに置き、候補scope外と明記しています。 | 旧条件は採択済みpairに保持されていません。2026-09-24 PO判断の「Codex-Claude連携用に限る」memory範囲を含め、successor/適用scopeは未確定として保持します。 |
| HIL-FR-11 | HARNESS-047はruntime-neutral specialist contract、入力/出力digest、生成根拠、guard結果等を決定row52の対象scopeで保証します。一方、旧registry全項目（特にlayer×drive、skills/blind/generatesの意味）を一般registryとして引き継いだとは読めません。FR11 correction ledgerはHARNESS意味契約＋OS registry/version/holdingの分割案でPO待ちです。HARNESS-054も未採択で、layer/drive mappingとTeamDefinitionを未決にしています。 | 一部意味対応。FR11 atomのformal successorなし。配置/範囲判断をbootstrap routingから生成しません。 |
| HIL-FR-12 | HARNESS-047はcontract field、model/effort class、allowed/denied tool/path候補、guard、digestを扱い、OS-018/SECURITYは適用時のassignment/operation制約を担います。採択済みL2/L11に、Claude/Codex adapter生成、手編集drift、未登録agent、override、blind-context漏洩、path bypass全てをfail-closeする一体のsync/guard oracleは見当たりません。 | 部分対応。旧provider固有adapter形式を現行要求へ持ち込まず、残る保証境界は未割当として保持します。 |
| HIL-FR-13 | HARNESS-047 L11はworker/verifierのidentity/context/authority分離を確認し、OS-018 L11は作成側の自己承認/自己reviewを拒否します。旧の `task-kind→verification patterns→eligible agents` 二段決定論的選択とTeamDefinition出力は採択済みscopeにありません。HARNESS-054は未採択です。 | worker/verifier分離の意味は保持されます。旧選択アルゴリズム・TeamDefinition形は未採択。FR13 atomのformal successorなし。 |
| HIL-FR-14 | BRAIN-007/008/009/020/025、LABO-007、OS-022は候補・評価・登録・独立検証・採否、知識identity/stateと証拠範囲を分離します。旧 `raw event→pattern→recipe→shadow→skill/detector/gate` の段階ledger、全effect-measurement、promoted skill/detector/gateのrollback target/receiptはこの採択済みpair合成にはありません。OS-019 continuityはpromotion ledgerではありません。別sourceのlearning/shadow候補は採択済みFR14 successorの証拠ではありません。 | 採用/評価の境界は部分対応。旧pipeline/rollback義務は保持未確認。FR14 atomのformal successorなし。 |

FR11〜14で「現行本文に相当する語がない」ことだけを欠落理由にはしていません。本文の意味条件とauthorityの一致を確認し、現在は旧source atomから現行要求への正式割当が未確認である点を残します。FR10〜14の旧IRは依然として `pending_pair_descent` です。

## 近接監査FR05/08の再確認

FR05/08はこの監査の主対象外なので、既存監査の残差に関わる範囲のみ読みました。HARNESS-003/004/005は選択scopeのfreeze、Backflow、影響するdesign/V-pairと再検証、riskに応じた検証を扱いますが、旧L1→L12/L2→L11の固定番号対応やscreen/prototype/skip receipt stale matrixをそのまま現行規範として保持するとは確認できません。固定旧layer番号との差はholdingに残し、新候補は作っていません。

FR08について、OS-017/018/019のticket/workflow、assignment、scope/authority/head、lease失効、未完義務の条件とHARNESS-003/004のfreeze/Backflowを確認しました。しかし、Reverse/Redesign/pair-freezeが未完ならOSがclaim/tool startを拒否するという異機構接続oracleは、今回読んだ採択済み節から確認できませんでした。一般的なticket scope/authorityだけで保持と断定せず、追加照合対象として残します。新候補は起草していません。

## 検証

監査JSONに旧L1の5物理行と旧IRの5 identity/digest、現在本文のfull-file/section SHA、PO decision対象を記録しました。JSON parse、MarkdownとJSONの5行整合、section pin再計算を静的に確認してからlocal commitします。requirements本文・decision本文は変更していません。
