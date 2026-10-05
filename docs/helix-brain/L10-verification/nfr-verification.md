# HELIX-BRAIN L10 非機能検証 — Stage 1（007/008/028）

**状態：部分草稿・未承認・未実行。** 対測定設計は`../L3-requirements/nfr-grade.md`の技術候補を検証する。全ケースで対象revision・fixture・入力・観測結果を記録し、閾値適用前にcandidate statusを保持する。固定L2/L11範囲を越えるSLA、承認gate、ownerを作らない。

| 親L2 | 測定項目・入力/変異 | L10判定材料（AC/L10 trace） | 限界 |
|---|---|---|---|
| `HELIXBRAIN-L2-007` | required field coverage: 全8 fieldを満たすnormal fixture、および各fieldを個別にmissing/stale/wrong revisionへ変える。 | 8/8各fieldのsource trace、missing reason、candidate維持、accepted/mature誤遷移0候補を観測。`BRAIN-007-AC-01/02`; C01–C03,C05,C06,C09。 | 実績数/verifier人数は測らず、新しいthresholdにしない。 |
| `HELIXBRAIN-L2-007` | false promotion: AI-generated-only、single success-only、counterexample/limitation欠落、LABO target revision mismatchと、LABO評価／OS登録／OS振分け／独立検証のみを採否へ代用する4変異を個別投入。 | accepted/mature遷移なし。不足field/sourceとLABO評価対象revision mismatchを区別しowner stateを観測。`BRAIN-007-AC-02`; C02–C05,C07。 | 未実行の設計候補。 |
| `HELIXBRAIN-L2-008` | state distinction/pin stability: 5 named stateを個別入力し、Product CoreがRを参照後にR superseded/R2追加する。R参照にR2を返す変異と同revision Rの内容を書き換える変異を個別投入する。 | stateを別値として保持し既存Core R参照とOS usageを維持、owner状態を分離。黙った置換の各変異を拒否／検出しBRAINへ戻す。`BRAIN-008-AC-01/02`; C01,C07,C08,C09。 | state遷移順やretentionは追加しない。 |
| `HELIXBRAIN-L2-008` | unknown handling: identity/revision/state unknown/conflict、actual version欠落、version_targetのactual代用を個別投入。 | currentへの暗黙解決なし、candidate use停止、BRAIN知識stateとOS project-useの相互writebackなし。`BRAIN-008-AC-02`; C02,C03。 | state名・version grammarを新設しない。 |
| `HELIXBRAIN-L2-028` | range/identity matrix: BRAIN-L2-028が指定するdescriptorと採択HARNESS L2-010/011のpack/call境界依存を分け、合成fixtureが宣言するrangeの内側・外側・欠落・解釈未確定を試す（fixture値は試験入力のみ）、descriptor/knowledge fieldを独立変異。 | 宣言range内かつ全field整合時だけapplicable。outside/unknown/mismatchは停止し、knowledge側はBRAIN（L2-008）、descriptor/range側はHARNESS ownerへ戻す。`BRAIN-028-AC-01/02`; C01–C04,C07。 | 固定L2にrange syntax/comparatorはないため製品規則として採択しない。range field自体がfixtureに欠ける場合、その枝は未評価/unknown。 |
| `HELIXBRAIN-L2-028` | boundary ownership: version_target代用とcommon exchange/update/rollback/unfinished-obligation義務のBRAIN移管を個別要求。 | 実版代用を拒否し、common lifecycleはHARNESS契約へ返しBRAINで再定義しない。`BRAIN-028-AC-02`; C05–C06。 | BRAIN専用NFRではなく親境界の測定候補。 |
| `HELIXBRAIN-L2-028` | version軸の取り違え：各軸に異なる合成値を与え、artifact←knowledge revision、knowledge version←contract、descriptor内version入替えとdescriptor／knowledge identityの双方向代入を独立投入。 | 各変異を分母に記録し誤受理0候補、該当field・期待軸・BRAIN（L2-008）／HARNESS owner戻し先を観測。`BRAIN-028-AC-02`; C08。 | 欠測・未評価を分母から除かず、実測合格としない。version構文は決めない。 |

測定値は候補であり未実施。結果をPO判断、L3承認、実装・実行許可へ読み替えない。

## Stage 2b追補 — 採択済み001〜006の部分草稿

**状態：候補のみ（独立review／L3承認前）。** Stage 1 prefixは最新main `a7ae47c0bd97cd53298594086923c73dfb2a712b`で承認済みのbytesを保持する。本追補はPO main `633bf12ea8f948db8ba3d6600179c4a9507377a7`の採択registrationと、固定L2/L11 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`の001〜006だけを候補として具体化する。各親のversion targetは1.0、G0配属はStage 2bであり、release収載や全前Stage完了gate、実装・実行許可を生成しない。後続版・Web条件付き・保留/不採択を親にしない。

### L10-BRAIN-001-NFR-01 — 列挙意味条件と誤確定の観測

対応 `BRAIN-001-NFR-01`、`BRAIN-001-AC-01`〜`BRAIN-001-AC-04`。機能CASE表の正常・項目別変異・未見・owner戻しfixtureを使用する。実出力の値がfixture source/期待oracleと一致するNchecked、選択された必須項目Nrequired、missing/unknown/意味不整合を誤成功へ変換したNfalse、各不足理由/戻し先を照合する。件数だけ/名称だけの案Aが意味変異を見逃すかを案Bと比較する。未選択sourceを分母に加えず、入力必須欠落を未適用扱いにしない。Nplannedのvalid/failed/missing/censored分類、単位、分母0、valid0、未測定をL3候補どおりに観測する。実行済みの測定値はまだなく、候補の成立を断定しない。

### L10-BRAIN-002-NFR-01 — 列挙意味条件と誤確定の観測

対応 `BRAIN-002-NFR-01`、`BRAIN-002-AC-01`〜`BRAIN-002-AC-04`。機能CASE表の正常・項目別変異・未見・owner戻しfixtureを使用する。実出力の値がfixture source/期待oracleと一致するNchecked、選択された必須項目Nrequired、missing/unknown/意味不整合を誤成功へ変換したNfalse、各不足理由/戻し先を照合する。件数だけ/名称だけの案Aが意味変異を見逃すかを案Bと比較する。未選択sourceを分母に加えず、入力必須欠落を未適用扱いにしない。Nplannedのvalid/failed/missing/censored分類、単位、分母0、valid0、未測定をL3候補どおりに観測する。実行済みの測定値はまだなく、候補の成立を断定しない。

### L10-BRAIN-003-NFR-01 — 列挙意味条件と誤確定の観測

対応 `BRAIN-003-NFR-01`、`BRAIN-003-AC-01`〜`BRAIN-003-AC-04`。機能CASE表の正常・項目別変異・未見・owner戻しfixtureを使用する。実出力の値がfixture source/期待oracleと一致するNchecked、選択された必須項目Nrequired、missing/unknown/意味不整合を誤成功へ変換したNfalse、各不足理由/戻し先を照合する。件数だけ/名称だけの案Aが意味変異を見逃すかを案Bと比較する。未選択sourceを分母に加えず、入力必須欠落を未適用扱いにしない。Nplannedのvalid/failed/missing/censored分類、単位、分母0、valid0、未測定をL3候補どおりに観測する。実行済みの測定値はまだなく、候補の成立を断定しない。

### L10-BRAIN-004-NFR-01 — 列挙意味条件と誤確定の観測

対応 `BRAIN-004-NFR-01`、`BRAIN-004-AC-01`〜`BRAIN-004-AC-04`。機能CASE表の正常・項目別変異・未見・owner戻しfixtureを使用する。実出力の値がfixture source/期待oracleと一致するNchecked、選択された必須項目Nrequired、missing/unknown/意味不整合を誤成功へ変換したNfalse、各不足理由/戻し先を照合する。件数だけ/名称だけの案Aが意味変異を見逃すかを案Bと比較する。未選択sourceを分母に加えず、入力必須欠落を未適用扱いにしない。Nplannedのvalid/failed/missing/censored分類、単位、分母0、valid0、未測定をL3候補どおりに観測する。実行済みの測定値はまだなく、候補の成立を断定しない。

### L10-BRAIN-005-NFR-01 — 列挙意味条件と誤確定の観測

対応 `BRAIN-005-NFR-01`、`BRAIN-005-AC-01`〜`BRAIN-005-AC-04`。機能CASE表の正常・項目別変異・未見・owner戻しfixtureを使用する。実出力の値がfixture source/期待oracleと一致するNchecked、選択された必須項目Nrequired、missing/unknown/意味不整合を誤成功へ変換したNfalse、各不足理由/戻し先を照合する。件数だけ/名称だけの案Aが意味変異を見逃すかを案Bと比較する。未選択sourceを分母に加えず、入力必須欠落を未適用扱いにしない。Nplannedのvalid/failed/missing/censored分類、単位、分母0、valid0、未測定をL3候補どおりに観測する。実行済みの測定値はまだなく、候補の成立を断定しない。

### L10-BRAIN-006-NFR-01 — 列挙意味条件と誤確定の観測

対応 `BRAIN-006-NFR-01`、`BRAIN-006-AC-01`〜`BRAIN-006-AC-04`。機能CASE表の正常・項目別変異・未見・owner戻しfixtureを使用する。実出力の値がfixture source/期待oracleと一致するNchecked、選択された必須項目Nrequired、missing/unknown/意味不整合を誤成功へ変換したNfalse、各不足理由/戻し先を照合する。件数だけ/名称だけの案Aが意味変異を見逃すかを案Bと比較する。未選択sourceを分母に加えず、入力必須欠落を未適用扱いにしない。Nplannedのvalid/failed/missing/censored分類、単位、分母0、valid0、未測定をL3候補どおりに観測する。実行済みの測定値はまだなく、候補の成立を断定しない。

## Stage 2b追補 — 採択済み009/010/011/012/029候補の測定

**状態：未承認・未実行。** 下記測定はL3技術候補と対応するfunctional CASE fixtureを照合する。旧HARNESS IPA/CI/runtime値は証拠にしない。結果をPO判断、L3承認または実行許可へ読み替えない。

| 親L2／candidate | 入力母集団とoracle | 判定と限界 |
|---|---|---|
| `HELIXBRAIN-L2-009` / `BRAIN-009-NFR-01` | C01–C11で選択された各Unit/relationと必要source/scope/versionを分母候補にする。端点、relation根拠、owner別状態の一致数、unknown/欠落を誤昇格した数を別記する。 | relation名のみと全trace照合を比較。未選択Unit/sourceは未観測。率の分母0では率なし。 |
| `HELIXBRAIN-L2-010` / `BRAIN-010-NFR-01` | C01–C09の選択failure条件についてcondition/impact/counterexample/evidence/source/scopeを別項目として照合し、普遍禁止/適用への誤一般化を個別記録。 | failure名の一致だけと条件付き意味の照合を比較。sourceにないfailure不存在を推定しない。 |
| `HELIXBRAIN-L2-011` / `BRAIN-011-NFR-01` | C01–C09の選択sourceに含まれるproduct-specific要素と一般化根拠/provenanceを分母候補とし、各変異の漏れ・source喪失を独立計数。 | 語数だけとsource-linked分離を比較。未選択sourceは分母外かつ未観測。 |
| `HELIXBRAIN-L2-012` / `BRAIN-012-NFR-01` | C01–C10のselected queryで列挙output tuple各要素、候補状態、未決decisionを別々に照合。field欠落・誤authority生成を独立記録。 | 返却候補数だけとtuple/decision状態照合を比較。候補受領は採用oracleではない。 |
| `HELIXBRAIN-L2-029` / `BRAIN-029-NFR-01` | C01–C52の選択構成を対象とし、identity/source/version、applicability、required input、constraint、trade-off、negative/failure、5 relation type/端点/意味の必要項目を列挙し、各項目のmissing/unknown/mismatchと誤適用を別記する。 | relation label数だけと条件付きtuple照合を比較。常時必須・操作時・選択source条件を分け、未選択source/参照資料は未観測。L2-030のreceipt義務は測定対象外。 |

各測定の計画母集団を`Nplanned`、契約scope内の必須要素数を`Nrequired`、期待oracleと照合できた数を`Nchecked`、unknown/欠落を成功へ誤変換した数を`Nfalse`として記録する。処理失敗、入力欠落、観測欠落、打切りは重ねず理由付きで分ける。正しいoracle不合格も判定可能な観測に含め、処理失敗へ隠さない。`Nrequired=0`では率を算出せず、欠けた必須条件を対象外にしない。未実施は未測定。時間測定には根拠ある開始/終了条件と単位を要し、valid時間標本0なら分位値なしとする。固定SLA、最低標本数、追加承認gateは設けない。
