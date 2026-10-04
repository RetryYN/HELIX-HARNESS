# HELIX-LABO L10 総合検証 — Stage 1（001/011の候補）

状態：未実行の合成fixture・oracle設計。L3承認、実装許可、実際の接続の存在、業務完了を生成しない。

旧HELIXのtest-design起点は旧L10定義 `archive/legacy-generation-2026-09-14/root/docs/process/forward/L08-L14-verification-phase.md:162-170,195-207`（`LEGACY-ASSET-34DF3B535879CC73FA86`、SHA-256 `d7847b2e7c85673971cb01f8fc42c1325aeb331a0630ee53914a3162951dbd2a`）の要件挙動をsystem-levelで照合する意味を保持する。旧test-designは旧L10文書そのものとは扱わず、ここでは対のoracle設計からfailure classだけを参照する。旧source/test/runtimeを実行しない。

## 共通oracle

[L3機能要件](../L3-requirements/functional-requirements.md)の同じACを照合する。採択済みCONNECT L2/L11の合成fixtureで選択connection identity・revision・scopeを固定し、未承認L3の成功を仮定しない。適用するmain固定の操作別正本は[L2-001](../../helix-connect/L2-requirements/connect-requirements.md#helixconnect-l2-001-接続登録と端点契約の識別unit)/[L11-001](../../helix-connect/L11-acceptance/connect-acceptance.md#helixconnect-l11-001-接続登録)（登録）、[L2-002](../../helix-connect/L2-requirements/connect-requirements.md#helixconnect-l2-002-契約互換性照合とstale再検証unit)/[L11-002](../../helix-connect/L11-acceptance/connect-acceptance.md#helixconnect-l11-002-契約版照合とstale再検証)（互換照合）、[L2-003](../../helix-connect/L2-requirements/connect-requirements.md#helixconnect-l2-003-契約に束縛した通信unit)/[L11-003](../../helix-connect/L11-acceptance/connect-acceptance.md#helixconnect-l11-003-契約に束縛した通信)（通信）である。これは固定L2/L11への通常のcanonical参照確認で、新しいgateではない。接続条件とLABOの業務入力を独立・併発変異にし、技術判断と元source/correlationの戻し先を混同しない。固定CONNECT L2に専用戻し先がない比較不能はunknown/staleで停止し、新ownerを設けない。旧runtime/test/CIは実行しない。

## HELIXLABO-L2-001 — L10 oracle（対応 `LABO-001-FR-01`）

- 親：PO固定 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2 `docs/helix-labo/L2-requirements/labo-requirements.md:69-76` span SHA-256 `9c1f285a0835a56fd7042025636ff68c2bca46d31eb2df693465d02fe772a104`。対L11 `docs/helix-labo/L11-acceptance/labo-acceptance.md` full SHA-256 `bcd77438bf1afa4d33c31d35fa5138ea6f978f3d241d159bde35f0b0ccf83200`.
- 対応AC: `LABO-001-AC-01`, `LABO-001-AC-02`。各caseはシステム全体の受渡しとowner境界を照合し、単体componentの成功だけでは対全体を満たさない。

### 検証fixtureとcase

- **L10-LABO-001-C01**（AC `LABO-001-AC-01`／`LABO-001-AC-02`に対応）：L2-021〜030から個別採択されたsource contractのrevisionを明示し、その許可sourceの実在field/status eventを取り込む。 **期待oracle**：許可されたsourceごとに20 fieldとsource identity/revisionを保持し、実在するstatusを個別状態として出す。fixtureに存在しないstatusを捏造しない。
- **L10-LABO-001-C02**（AC `LABO-001-AC-01`／`LABO-001-AC-02`に対応）：一つのsourceだけ破損し、他sourceは有効な場合、対象sourceのwarning/unknownを分離して有効sourceは保つ。 **期待oracle**：破損sourceだけwarning/unknownになり、他sourceの有効recordは維持される。
- **L10-LABO-001-C03**（AC `LABO-001-AC-01`／`LABO-001-AC-02`に対応）：元source snapshotにはfailure/rejected/cancelled/blocked/unknown/not_observed eventが存在するのに、success-only projectionがそれらを落とすfixtureを与える。 **期待oracle**：元sourceの非success event欠落を検出し、そのsourceを欠落理由付きhold/warningにする。元source上に非success eventがないcaseは拒否しない。
- **L10-LABO-001-C04**（AC `LABO-001-AC-01`／`LABO-001-AC-02`に対応）：source revision missing/staleをcurrentとして提示する。 **期待oracle**：missing/stale revisionはunknown/holdになり、current identityを付与せずsource ownerへ返る。
- **L10-LABO-001-C05**（AC `LABO-001-AC-01`／`LABO-001-AC-02`に対応）：secretまたは許可scope外の情報を与える。 **期待oracle**：secret/out-of-scope inputは取り込み成功にならず、source ownerへ理由付きで返る。
- **L10-LABO-001-C06**（AC `LABO-001-AC-01`／`LABO-001-AC-02`に対応）：LABOからsource canonical recordへ書き戻そうとする。 **期待oracle**：LABO observationは保持するがsource canonical stateへのwritebackは0であり、要求を権限境界で拒否する。
- **L10-LABO-001-C07**（AC `LABO-001-AC-01`／`LABO-001-AC-02`に対応）：Web/WEB-OS source contractが未選択/未採択の場合に1.0必須と誤認する。 **期待oracle**：Web/WEB-OS未選択時はsource接続をoptional/unconfiguredとして示し、1.0必須依存エラーにしない。
- **L10-LABO-001-C08**（AC `LABO-001-AC-01`に対応）：観測期間内の許可sourceにsuccess eventのみが存在し、他statusは発生していないsnapshotを与える。 **期待oracle**：実在するsuccess recordを正常に取り込み、未発生のfailure/rejected/blocked/not_observedを生成せず、存在しないstatusの欠落errorも出さない。
- **L10-LABO-001-C09**（AC `LABO-001-AC-01`／`LABO-001-AC-02`に対応）：既知の過去source revision・観測時点が保持されたhistorical observationと、同じ古いrevisionをcurrentと偽装した入力を別々に与える。 **期待oracle**：正確な過去revisionのhistoryはhistoricalとして保存・追跡し、currentと偽装したものだけをstale/unknownとして拒否する。
- **L10-LABO-001-C10**（AC `LABO-001-AC-01`／`LABO-001-AC-02`に対応）：他のfieldが有効な許可source observationから必須fieldを一つ欠落させ、別sourceには有効recordを与える。 **期待oracle**：field欠落observationは成功扱いせず欠落理由付きでholdしsource責務へ返す。他sourceの有効recordは保持し、欠落値を推測補完しない。

### 観測点とoracle

source identity/revisionごとの観測；20 field identitiesと7 status classifications；source state/authorityとLABO observationの分離；missing/unknown reasonと戻し先；source単位warningと他sourceの独立性。

**判定**：正常caseは各AC候補が親のfield/state/boundaryを満たす証拠を示す。反例caseでは該当情報が拒否/unknown/保留となり、誤った成功・昇格・owner間writebackを起こさない。部分成功は部分として記録し、残作業を成功に丸めない。

**旧test-design oracleの限定**：旧`AC-FR-BR21-09`（`business-detail.md:137-145`）は壊れたinvocation_logだけをskipし他sourceを保つHARNESS dashboardのfailure例。部分source破損を分離するfailure classのみ類例にし、旧4 source/5 metric/30秒pollを移さない。旧case ID・閾値・role schema・runtimeを使わず、現行L2/L11へ合わせた検証設計とする。

## HELIXLABO-L2-011 — L10 oracle（対応 `LABO-011-FR-01`）

- 親：PO固定 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2 `docs/helix-labo/L2-requirements/labo-requirements.md:163-166` span SHA-256 `9fcf8b7b648681c7ff08080565a2d708cdd9c5a619e40e8f8bad6196f4c36cb6`。対L11 `docs/helix-labo/L11-acceptance/labo-acceptance.md` full SHA-256 `bcd77438bf1afa4d33c31d35fa5138ea6f978f3d241d159bde35f0b0ccf83200`.
- 対応AC: `LABO-011-AC-01`, `LABO-011-AC-02`。各caseはシステム全体の受渡しとowner境界を照合し、単体componentの成功だけでは対全体を満たさない。

### 検証fixtureとcase

- **L10-LABO-011-C01**（AC `LABO-011-AC-01`／`LABO-011-AC-02`に対応）：L2-001 Aggregate identity/outputをsource revision付きで参照してsource-backed observationをepisode candidateにし、元sourceへdereferenceできる。専用connector `HELIXLABO-L2-011`のadmitted identity/revision、schema version、source provenanceを同時に入力する。 **期待oracle**：episode candidateから元observation identity/source revisionへ戻れ、revision・fieldと専用connector契約が一致する。
- **L10-LABO-011-C02**（AC `LABO-011-AC-01`／`LABO-011-AC-02`に対応）：observation identity/source revision/relationの業務入力欠落・不一致fixtureと、専用connector `HELIXLABO-L2-011` のcontract identity/revision/schema/provenance不一致または欠落を別々に与え、併発も一つ与える。consumer receiptは選択connection identity・admitted contract revision・scopeに結び、別scope/旧revision resultの流用を独立変異にする。技術failureは採択済みCONNECT-L2-001/002/003の該当契約fixtureを参照する。**期待oracle**：業務入力不一致は元source/relationのunresolvedを保持し、元source/correlation ownerへ返す。connector契約failureの技術判定は上記対応表の固定CONNECT L2/L11に従い、戻し先はその契約が明示する場合だけ使う。比較不能など専用戻し先のない場合はunknown/staleで停止し、新ownerを設けない。consumer側でCONNECT技術条件を再判定しない。両failureを同一routeにまとめない。
- **L10-LABO-011-C03**（AC `LABO-011-AC-01`／`LABO-011-AC-02`に対応）：Aggregate engine成功だけでCorrelate接続も成功と主張する。 **期待oracle**：Aggregateの成功状態とAggregate→Correlate接続状態を分離し、未接続を成功表示しない。
- **L10-LABO-011-C04**（AC `LABO-011-AC-01`／`LABO-011-AC-02`に対応）：relation/field不一致またはsource observation欠落。 **期待oracle**：不一致relationは補完せずunresolvedを保持し、元recordと不一致理由をcorrelation側へ返す。
- **L10-LABO-011-C05**（AC `LABO-011-AC-01`／`LABO-011-AC-02`に対応）：同時刻/同pathだが因果evidenceのないevent。 **期待oracle**：causal evidenceのないeventはrelated/unknownまでとし、causalに確定しない。
- **L10-LABO-011-C06**（AC `LABO-011-AC-01`／`LABO-011-AC-02`に対応）：relation不一致をcorrelationへ戻して再照合する際、元source eventを保持する。 **期待oracle**：不一致を黙って補完・上書きせず、元source recordとrevisionを保ってcorrelationへ戻す。source contractが訂正後revisionを供給する場合はそのrevisionを別の入力として照合するが、独立したdiscrepancy recordは必須にしない。

### 観測点とoracle

input observation identity/source revision；episode candidate identityとrelation evidence；source refの往復一致；unknown/missing stateと戻し先；evidenceなしのcausal assertionがないこと。

**判定**：正常caseは各AC候補が親のfield/state/boundaryを満たす証拠を示す。反例caseでは該当情報が拒否/unknown/保留となり、誤った成功・昇格・owner間writebackを起こさない。部分成功は部分として記録し、残作業を成功に丸めない。

**旧test-design oracleの限定**：直接対応する旧oracleは確認できない。旧BR-21の部分失敗時にrecordを失わない考えのみ類例で、因果・時間相関規則は継承しない。旧case ID・閾値・role schema・runtimeを使わず、現行L2/L11へ合わせた検証設計とする。

## 未見正常fixture

- **L10-LABO-001-C11**（`LABO-001-AC-01`）：既存fixtureにない許可source identity/revisionと実在statusの組合せを、固定source contractの20 field宣言・観測時点とともに与える。既存正常oracleで20 field・実在status・出典を保持し、未発生statusを生成せず他sourceを巻き込まない。宣言範囲外やsource不足は正常例に含めない。
- **L10-LABO-011-C07**（`LABO-011-AC-01`）：同じ採択済み契約範囲内の未見observation/episode identityを、source revision・field・欠測・選択接続の完全な束縛情報とともに与える。episodeから元観測へ往復参照でき、欠測は欠測、相関は因果未確定のままとなる。

親ごとの正常・否定・未見正常は同じAC条件で評価し、未観測を実績0件や成功へ写像しない。
