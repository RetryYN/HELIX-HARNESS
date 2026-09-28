# REG-06 IR108 HIL-BR-22／27 disposition overlay

## 位置づけ

本記録は、PR #2272でmergeされた[条件別照合監査](legacy-ir108-br21-br22-br27-condition-audit-2026-09-28.md)を、IR108 disposition matrixのeffective readへ反映するappend-only overlayである。matrix JSON、#2272監査、REG-06母集団snapshotは変更しない。machine-readable overlayは[JSON](legacy-ir108-br22-br27-disposition-overlay-2026-09-28.json)。

基準main（merge commit）は `db2a455bc2b868ffe8ced9d8abe91a46b6d9e551`。#2272のbranch baseは `87e292931b18815aacd4f34003d461d877f532d6`、reviewed content HEADは `a39691382e84898715d384ddffc76d5d03d0a4d1`。final aggregatorはHIL-BR-22/27に限り、matrix全体SHA、JSON Pointer、identity、source line SHAが一致した場合、base rowの`dispositions`／`remaining_condition`のeffective readに本overlayの値を優先する。不一致時は有効分類を出さず、`unresolved`として集約を停止する。base matrix値は履歴としてのみ保持し、有効分類のfallbackにしない。元matrix行は編集しない。

| 固定証拠 | revision / digest |
|---|---|
| IR108 matrixの最終変更commit | `17965750e526fad599673880d81d955678c8b296` |
| IR108 matrixのsnapshot baseline | `559ae3ba4bfe660d666a57f227466d7dcdd440d9` |
| IR108 matrix JSON SHA-256 | `0e26f66e4d593f7f710e17b8c2349dffd5849467f208fc5fbdda635e31dd224d` |
| #2272条件別監査 SHA-256 | `37038a391acee8ad8859d476046fb936ec6fedc5ffba87c4d005c7aa5339e0c0` |
| 旧requirements文書 asset / SHA-256 | `LEGACY-ASSET-719D5EC9C06FC4AAD0FF` / `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb` |
| 旧Requirements IR asset / SHA-256 | `LEGACY-ASSET-A60CF91DD2AF6693E6F9` / `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` |

この分類訂正は監査上のcondition dispositionだけを更新する。旧IR 153件のcarry-forward authorityは `preserved_pending_rehome` のままであり、formal successor ID、POによる追加採択、意味変更、retire、受入実行、実装許可を生成しない。`adopted_meaning`は採択済み現行文書に意味の一部があるという照合分類であり、旧identityの移管完了を意味しない。

## Effective disposition

| identity | snapshot value | effective overlay value |
|---|---|---|
| HIL-BR-22 | `adopted_meaning`; `remaining_condition: null` | `adopted_meaning` + `true_missing_condition_needing_candidate`; residual `HIL-BR-22-R1` |
| HIL-BR-27 | `adopted_meaning`; `remaining_condition: null` | `adopted_meaning` + `true_missing_condition_needing_candidate`; residuals `HIL-BR-27-R1`–`R4` |

`HIL-BR-22-R1` の旧source spanは「要求系統とservice/capability系統をDesign Templateへ結び、各要求から生じる設計義務を原子的に生成・消込する。閉じた要求集合について説明のない設計漏れを0件にし、未知の要求まで網羅したとは主張しない。」である。HARNESS-L2-009/L11-009はtemplateから設計義務を導きrequired input欠落を戻す。HELIXOS-L2-016/L11-016は未接続・unknown・stale relationを示し未解決edgeで下流完了に進めない。さらにHELIXOS-L2-001/002/005/007/013のL11:45はtemplate候補・選定版・設計義務、N/A、backflow、個別消込をtraceし、template欠落・stale・conflict・必須input欠落時のfallbackを拒否する。これらは個別義務の状態を部分保持する。なおOS L2:23–25とL11:44のsource atom no-loss receiptは要求PR候補の登録・atom計上にscopeがあり、設計義務の集合を閉じる証拠として数えない。残るのは、固定したclosed scopeの全design obligationを原子的に生成・消込した根拠と、説明のない漏れが0件であるgateである。

`HIL-BR-27-R1` の旧source spanは「要求atom、設計義務、risk、状態遷移、failure境界、適用工程から必要十分な`Design Contract Portfolio`を導出する。」である。採択済みHARNESS/BRAINの局所条件は、この適用入力に対するportfolio十分性を閉じない。HARNESS-L2-044/L11-044のclass-wise zero-uncovered／zero-duplicate gateは必要十分性を具体化する類似案だが、別source HIL-FR-54由来の未採択条件であり、この旧行に書かれた条件や後継ではない。

`HIL-BR-27-R2` は、上記旧source文のうち「同じ意味契約の文書量産」の拒否条件である。HARNESS-L2-044には意味重複0の類似gateがあるが、別source HIL-FR-54由来の未採択候補であり、BR-27の後継ではない。

`HIL-BR-27-R3` は旧sourceの「設計契約とtemplate見本は固定冊数で配布せず、」という明示条件である。採択済みHARNESS-L2-025/026とBRAIN-L2-003/009だけでは、固定冊数による配布を拒否する条件を確認できない。

`HIL-BR-27-R4` は、上記旧source文のうち「見本不足をLLM自由補完で埋めること」の拒否条件である。採択済みHARNESS-L2-009と対L11は必須input欠落をAI補完で埋めず、質問・要求候補・N/A判断候補へbackflowする条件を持つ（L11 `product-acceptance.md:69,130`）。これはAIによる欠落補完を一部禁じるが、旧文の「見本不足」—template例・見本自体の不足—と必須inputの欠落は対象が異なる。したがって必須input欠落の拒否は保持済み、template見本が適用rule／branchを十分に例示するか確認し、足りない例をLLMで自由補完しない条件は未被覆として残す。HARNESS-L2/L11-043（別source HIL-FR-55）はrule／branch別positive/negative example coverageを扱う類似の未採択候補であり、BR-27のsuccessorでも採択済み要求でもない。

## 採択済み意味の根拠と類似する未採択候補

- HIL-BR-22の採択済み部分は、HARNESS-L2-009／L11-009が選択templateから設計義務を導き、適用差・required input欠落を見つけて戻すこと、HELIXOS-L2-016／L11-016が要求relationの未接続・unknown・staleを示し未解決edgeを下流完了へ進めないことである。
- HIL-BR-27の採択済み部分は、HARNESS-L2-009／025／026と対L11がtemplate義務、unit設計、composite oracle、revision/scope/unknownを扱うこと、BRAIN-L2-003／009と対L11がPatternの適用条件と構成候補状態を扱うこと、およびHARNESS-L2-009／L11-009が必須inputのAI補完を拒否することである。対象revisionは各機構の2026-09-28 PO判断記録で確認する。
- HARNESS-L2-041/L11-041（別source HIL-FR-47）、HARNESS-L2-043/L11-043（別source HIL-FR-55）、HARNESS-L2-044/L11-044（別source HIL-FR-54）は未採択候補である。それぞれの類似条件はsource relationとして記録し、BR-22/27のformal successorまたは採択済みcoverageに昇格させない。

この細分は[#2274の独立review R2274-01](https://github.com/RetryYN/HELIX-HARNESS/pull/2274#issuecomment-5871512201)を受けたappend-only overlay内の訂正であり、旧source line 79の意味を保持しつつ、必須input欠落とtemplate見本不足を別の条件として扱う。BR-22のOS L11:45およびsource-atom receipt境界の追加照合もoverlayに記録し、個別義務の消込とclosed-scope全件gateを区別した。

詳細な行・本文revision・PO判断根拠は[#2272監査の条件別比較](legacy-ir108-br21-br22-br27-condition-audit-2026-09-28.md#条件別の旧現行照合)を参照する。隣接HIL-BR-21/24/25やIR母集団の他identityには本overlayを適用しない。

## 検証境界

静的検証はmatrixと旧sourceの固定digest、JSON構文、overlay対象2 identity、relative link、effective fieldの解決結果を確認する。旧source、archive runtime、旧test、旧CIは実行しない。本overlayは条件比較の訂正であり、REG-06全母集団のno-loss、旧source未対応0、要求stage完了を主張しない。
