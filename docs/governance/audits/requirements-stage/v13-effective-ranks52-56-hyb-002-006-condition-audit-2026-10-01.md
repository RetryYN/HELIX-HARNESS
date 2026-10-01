# v1.3 corrected131 pool: rank 52／56 原文比較監査

## 対象と順位

基点は `855ea3d15e47e1e02f170cf7f065ca7d006d38e0`。この監査はsource-qualified corrected131 poolの次の2行だけを確認する。

|順位|旧source ID|旧要求|行|
|---:|---|---|---:|
|52|`REQSRC-SUP-00213`|`HR-FR-HYB-002`／`HR-AC-HYB-002`|286|
|56|`REQSRC-SUP-00217`|`HR-FR-HYB-006`／`HR-AC-HYB-006`|290|

母集団は303行のqueue中、`primary_residual`かつ`unresolved_for_closure_work`の255行である。指定された32件のfocused auditとの完全なsource identity tuple joinで124行を除き、残る131行を旧source物理行番号、同番号内のsource IDの順に並べる。rank reconstruction proofはraw ID token hit 136とsource-qualified identity hit 124を区別している。rank crosswalkのpool上で00213は52位、00217は56位である。

## 先行raw mentionがrank filterにならなかった理由

先行 `v13-development-style-11` には両IDが含まれるが、いずれも `/population_and_deduplication/excluded_exact_source_item_ids` の単なる配列要素（00213はindex 27、00217はindex 28）であり、source path、source-file SHA-256、旧source物理行、source-line SHA-256を束ねるidentity tupleではない。00213には後発監査のprose/citation上の出現もあるが、それらも当該queue tupleを特定しない。よってこの32監査joinでは、ID文字列だけを理由に行を除外しない。00217について、同join proofが挙げる出現は同じ除外配列だけである。

ただし「他のsource-qualified記録が一切ない」という意味ではない。queueは00213の限定coverage/atom mapping記録を24件、00217を20件記録している。receiptの記載は作成時点の状態として保持し、後発のPO判断を別の時点として照合した。2026-09-29の判断記録ではSECURITY-034とOS-044が採択され、CONNECT-008はA配置（供給はCONNECT、安全判定はSECURITY）として条件付き採択されている。よってこれらを現在も「未採択」とは記述しない。後発decisionの採択と配置判断を記録する一方、この監査は全source行のclosureを主張しない。

## 旧source、asset、pair pins

archive sourceは `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md`、SHA-256 `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`。保全snapshot `docs/governance/requirements-source/helix-requirements_v1.3.md` も同じSHA-256である。資産台帳は `LEGACY-ASSET-02319C2481B9E01698D5`、`docs/governance/legacy-asset-disposition.jsonl:956`（行SHA-256 `a6d52de16ee4aa8ecb37ed092fb4c2beda22ec89d1d036b3028414a753375dde`、台帳全体SHA-256 `cd73ac407937ad86c6be2c0b27d70863b1873fe39c2d6c0f89620e648dccad8c`）。dispositionは読み取り専用source snapshot保全であり、product targetはunresolved。

旧286行はprofile列挙・設定、typed safety/read-only probe、profile単位のcredential/egress/tool-capability fail-close、および未登録profile・secret要求・write可能probeの拒否を一つのFR/AC行に含む。旧290行はfeedbackの7状態とSessionStart surfaceをevent/projectionで扱い、未ack finding消失、prose handoverのみの解決、source HEAD不一致を拒否する。

固定比較対象はrevision `f6dad2a33e24f000b87d7f09b8d40288257e74cc` のL2 `docs/helix-harness/L2-requirements/product-requirements.md`（全体SHA-256 `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a`）およびL11 `docs/helix-harness/L11-acceptance/product-acceptance.md`（全体SHA-256 `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4`）。比較に使った行番号と行SHA-256はJSONに固定した。関連するのはL2-004/005/008、L11-005/008のtrace・検証・finding・Backflow・証拠条件である。一般的な機能関係だけで、旧HYB行の個別adoptionや全受入を推定しない。

## 行別比較

### rank 52 — `REQSRC-SUP-00213` / MCP profile catalog

**判定: partial。旧source行は未解決で、行全体のclosureは未確認。** 固定F6のL2-008は要求形成、意味比較、scope逸脱の提示、人の訂正・合意、候補出力を承認済み要求や操作権限へ自動昇格させない境界を持つ。L2/L11-005には一般的な検証義務、oracle、証拠identityの条件がある。これらはprofile供給条件の一部に関係するが、固定pairは型付きMCP profile catalogの全契約を個別に採択していない。

別のsource-qualified coverage receiptは、旧行を12 atomに分け、SECURITY-034とCONNECT-008へ分配した。receipt作成時には両候補pending POで、source coverageはpartial、意味closureは0/12と記録されていた。その後のPO判断はSECURITY-034を採択し、CONNECT-008をA配置で条件付き採択した。候補の採択・配置は後発の状態として記録するが、profile列挙・設定・typed descriptor/read-only probe供給と、credential/egress/tool capabilityのfail-close・3 negative caseを含む旧source行全体のclosureをこの監査が再判定・宣言するものではない。receiptの0/12はreceipt作成時点の記録である。

### rank 56 — `REQSRC-SUP-00217` / feedback lifecycle

**判定: partial。旧source行は未解決で、行全体のclosureは未確認。** 固定F6のL2-004/008とL11-005/008は、trace・変更影響、findingの保持、Backflow、証拠relation、およびCI/evidenceだけで受入を成立させない条件に関係する。しかし7段階のlifecycle、event/projection、SessionStart surface、旧ACの3 negative clauseすべてを網羅する単一のadopted successorは確認できない。

既存のsource crosswalkは2026-09-29時点で、8個のclause-span/revision atomのうち2件をadopted OS-007/009で満たし、2件を部分関係、2件を当時未採択のOS-044候補、2件をexact general successorなしのpendingとして記録する。後発のPO判断はOS-044を採択している。crosswalkのsource line closure countは0であり、後発採択を含めても本監査は旧source行全体のclosureを主張しない。未ack findingについての2 atom対応やprose-only条件の採択を、旧lifecycle全体のclosureと読まない。

## 後発PO判断の時点pin

`origin/main`（commit `50686b6762788574cb471967e8c24846d3dd56ae`）の `docs/governance/decisions/po-decision-2026-09-29-57candidates.md` を参照した。ファイルSHA-256は `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`。該当行のSHA-256は67行=`6f3334da6887e697a3df623ada6e7e84963870ea7d706759edfdda4bfbe96153`、93行=`ec02930f3e3c7d0108f9e6a81c4e5376b4ed6259ba9396cc3aa2fc0732bca489`、94行=`0f5350230dd35d037de1a8b8f7366867f4677a5e8ee37d8856c3919a73b3f366`。

- 67行: `HELIXOS-L2-044` 採択。根拠receiptは `os-v13-hyb-006-feedback-resolution-coverage-receipt-2026-09-28.json`。
- 93行: `HELIXSECURITY-L2-034` 採択。根拠receiptは `security-v13-hyb-002-profile-coverage-receipt-2026-09-28.json`。
- 94行: `HELIXCONNECT-L2-008` 条件付き採択。A配置としてprofile supplyをCONNECT、安全判定をSECURITYへ置き、registration -002を対象とする。根拠receiptは `connect-v13-hyb-002-profile-supply-coverage-receipt-2026-09-29.json`。

各receiptに記録されたpending/unadoptedはreceipt作成時点の記述として残す。後発採択は固定F6比較revisionを変更せず、旧source行全体のclosureをこの監査に発生させない。decision file、行SHA、対象IDはJSONの `later_po_decision_pin` にも構造化して記録した。

## 残差と主張境界

両行はqueue上primary residual／unresolvedであり、正式successor assignmentは本監査では行わない。後発PO判断による限定candidate採択・配置は上記のexact pinで認識するが、それだけから当該source行全体のclosure、実装・受入実行を推定しない。本監査は人間authorityを生成せず、archive runtime、CLI、test、CIを実行していない。

構造化した出典tuple、監査join/crosswalk pins、既存coverageの限定scope、F6 pair行digests、行別残差は対応JSONに記録した。
