# Candidate 4755 規範語マーカー順位21〜40の意味監査

対象はscreen commit `f330d71d2b86d5d2e762478ce85d9d396b81bb54` が固定した255行poolの順位21〜40。順位はscreenの基準を再構成し、保存済み上位20件との一致を確認して得た。旧archive原文・前後節、source-line台帳、asset台帳を照合した。現行L2/L11比較は、POが固定したF6 bytesに明示crosswalkが見つかった範囲に限る。

先行top20監査 `0de781db5` とのID重複は0件。本batchは旧candidate rowの機械的`explanation`分類を変えず、排他的意味分類とnormative contextを別軸で記録する。現行crosswalkはこの20件では確認できなかったため、近似pairは割り当てていない。

## 行別監査

|順位|旧source ID / source:行|排他的意味分類|normative context|現行F6 crosswalk|残差・次処置|
|---:|---|---|---|---|---|
|21|`LEGACY-CAND-LINE-004329` · `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/security-engagement-authority-acceptance.md:24`|受入oracle（SEA-AC-011） (独立条件=False)|あり: acceptance_expected_or_negative_behavior|明示crosswalkなし|SEA-FR-004..005の親条件、対象owner、broker/attestation境界を復元し、現行crosswalkの有無を別途照合する。|
|22|`LEGACY-CAND-LINE-000137` · `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-requirements.md:36`|複合要求条件（AAFD-R-02） (独立条件=True)|あり: direct_requirement_condition|明示crosswalkなし|AAFD-R-02のsource/consumerと対象機構を特定し、identity条件と現行authority境界を項目ごとに比較する。|
|23|`LEGACY-CAND-LINE-000156` · `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-requirements.md:67`|複合要求条件（AAFD-R-07） (独立条件=True)|あり: direct_requirement_condition|明示crosswalkなし|AAFD-R-07の親条件・episode/dedupe consumerを調べ、現行対応の有無を確認する。|
|24|`LEGACY-CAND-LINE-000213` · `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/authority-vocabulary-acceptance.md:21`|受入oracle（AVS-AC-001） (独立条件=False)|あり: acceptance_expected_or_negative_behavior|明示crosswalkなし|AVS-R-01と分類入力・出力schemaを復元し、誤分類の反例群とownerを確認する。|
|25|`LEGACY-CAND-LINE-000217` · `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/authority-vocabulary-acceptance.md:25`|受入oracle（AVS-AC-003A） (独立条件=False)|あり: acceptance_expected_or_negative_behavior|明示crosswalkなし|AVS-R-03Aのparent sourceとsurface/consumerを特定し、authority/evidence境界の候補を比較する。|
|26|`LEGACY-CAND-LINE-000218` · `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/authority-vocabulary-acceptance.md:26`|受入oracle（AVS-AC-003B） (独立条件=False)|あり: acceptance_expected_or_negative_behavior|明示crosswalkなし|AVS-R-03Bの意味・owner・escalation consumerを回復し、現行scopeと比較する。|
|27|`LEGACY-CAND-LINE-000224` · `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/authority-vocabulary-acceptance.md:32`|受入oracle（AVS-AC-008） (独立条件=False)|あり: acceptance_expected_or_negative_behavior|明示crosswalkなし|AVS-R-08のsurface一覧・identity schemaとfailure evidenceを復元する。|
|28|`LEGACY-CAND-LINE-000226` · `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/authority-vocabulary-acceptance.md:34`|受入oracle（AVS-AC-010） (独立条件=False)|あり: acceptance_expected_or_negative_behavior|明示crosswalkなし|AVS-R-10のmemory consumer/TTL/ownershipを特定し、現行OS/HARNESS/BRAINの境界を個別確認する。|
|29|`LEGACY-CAND-LINE-000227` · `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/authority-vocabulary-acceptance.md:35`|受入oracle（AVS-AC-011） (独立条件=False)|あり: acceptance_expected_or_negative_behavior|明示crosswalkなし|AVS-R-11のinvalid/superseded判定、invalidation consumer、旧surfaceをsourceから復元する。|
|30|`LEGACY-CAND-LINE-000228` · `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/authority-vocabulary-acceptance.md:36`|受入oracle（AVS-AC-012） (独立条件=False)|あり: acceptance_expected_or_negative_behavior|明示crosswalkなし|AVS-R-12のadapter/output contractと利用先を復元し、旧実行方式の再利用を前提にしない意味比較を準備する。|
|31|`LEGACY-CAND-LINE-000230` · `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/authority-vocabulary-acceptance.md:38`|受入oracle（AVS-AC-014） (独立条件=False)|あり: acceptance_expected_or_negative_behavior|明示crosswalkなし|AVS-R-14のsignal/token authorityとfailure consumerを調べ、時点・source境界を個別比較する。|
|32|`LEGACY-CAND-LINE-000233` · `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/authority-vocabulary-acceptance.md:42`|受入方法論規範 (独立条件=False)|あり: acceptance_method_norm|明示crosswalkなし|20 oracleの全行、独立failure classの定義、親AVS要求・現行の受入ownerを照合する。|
|33|`LEGACY-CAND-LINE-000334` · `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-bounded-repair-acceptance.md:20`|受入oracle（BBR-AC01） (独立条件=False)|あり: acceptance_expected_or_negative_behavior|明示crosswalkなし|BBR-R01の原稿由来条件、対象/consumer、合法RED判定条件を復元する。|
|34|`LEGACY-CAND-LINE-000406` · `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-bounded-repair-requirements.md:49`|複合要求条件（BBR-R03内） (独立条件=False)|あり: direct_requirement_condition|明示crosswalkなし|BBR-R03全体と直前適用条件、transaction/CAS consumerを確認し、各repairの許可範囲との結合を照合する。|
|35|`LEGACY-CAND-LINE-000416` · `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-bounded-repair-requirements.md:63`|複合要求条件（BBR-R05） (独立条件=False)|あり: direct_requirement_condition|明示crosswalkなし|BBR-R05全列挙、根拠原文、拒否証拠と現行Security/OS authority ownerを照合する。|
|36|`LEGACY-CAND-LINE-000423` · `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-bounded-repair-requirements.md:73`|受入方法論規範（段階投入・受入引継ぎ） (独立条件=False)|あり: acceptance_method_norm|明示crosswalkなし|段階投入の親条件、独立検証/consumer scopeと受入ownerを特定し、個別検査義務を分解する。|
|37|`LEGACY-CAND-LINE-000424` · `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-bounded-repair-requirements.md:74`|受入oracle（段階投入の反例） (独立条件=False)|あり: acceptance_expected_or_negative_behavior|明示crosswalkなし|直前の受入義務と段階投入scopeへ結び、反例ごとの期待拒否・証拠を復元する。|
|38|`LEGACY-CAND-LINE-000440` · `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-intake-source.md:16`|コード内assertion（原文復元） (独立条件=False)|なし: lexical false positive|明示crosswalkなし|要求残差にしない。archive原文完全性の必要な証拠は別途保全する。コードは実行しない。|
|39|`LEGACY-CAND-LINE-000442` · `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-intake-source.md:18`|コード内assertion（原文復元） (独立条件=False)|なし: lexical false positive|明示crosswalkなし|要求残差にしない。必要時はsource restoration evidence側で扱う。コードは実行しない。|
|40|`LEGACY-CAND-LINE-000471` · `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-acceptance.md:17`|受入oracle（CIG-AC-004） (独立条件=False)|あり: acceptance_expected_or_negative_behavior|明示crosswalkなし|CIG-R-03とCIG-AC-004のsource/full consumer scopeを回復し、現行requirementsのcrosswalk有無とfixture範囲を確認する。|

## 判定境界

- 既存top20を含む既監査範囲とのID重複はなく、この20件のexclusive groupは合計20（受入oracle 12、複合要求条件4、受入方法論規範2、コード内assertion 2）。normative contextは18行、コード語句だけのfalse positiveは2行。
- #22（AAFD-R-02）と#23（AAFD-R-07）の2行だけを、source見出し/本文で識別できる複合要求条件として独立条件に分類した。#34/#35は親要求内の条件、#36/#37は段階投入・受入引継ぎ節の義務/oracleとして保持し、新しいidentityを作らない。
- #38/#39はbase64原文復元コードの`blocks`語に対するscreen hit。archive codeは実行しておらず、要求残差に数えない。
- 選択された全assetのtarget/upstream/pairは未解決。採択、retire、closure、現行実装または受入実行の主張はない。

## 検証

順位poolは255行、screen保存上位20件との再現一致、対象行20件のID一意・source line/bytes SHA・台帳join、F6 pair file SHAとline/query照合、Markdown/JSON整合、`git diff --check`で静的に確認する。旧workflow、CLI、hook、test、CI、runtimeは実行しない。

Authority effect: `none`.
