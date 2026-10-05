# HELIX-BRAIN L3 非機能要件・候補値 — Stage 1（007/008/028）

**状態：部分草稿・未承認。** 本書の値は固定親の列挙field/state/境界を検証可能にする根拠付き技術候補であり、PO指定SLA、採択済閾値、実測結果ではない。比較案・根拠・測定方法・判定境界を対のL10へ結び、候補の採否は通常のL3承認で扱う。parameterごとのPO確認は設けない。固定要求の意味・範囲・owner・版を変える場合だけL2へ戻す。

旧NFRの形式的起点は **`LEGACY-ASSET-DB669724249A14A665F0`**（`archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/nfr-grade.md:21-34,58-74`、全文SHA-256 `2197b4d2f4118aae83202f9f886056fd9de360f21667e25fe9c9d906f76c832d`）。これはHELIX-HARNESSの旧NFR文書であり、BRAIN要件や現行値ではない。NFRと測定・判定を結ぶ骨格のみ再導出する。旧IPA grade、数値、pass条件、CI/runtimeを移さない。旧BRAIN固有の直接一致するNFR根拠は確認できず、以下は固定BRAIN L2/L11からの候補である。

| 親L2／測定項目 | 技術候補・比較 | 根拠・測定方法 | 判定材料・未確定範囲 |
|---|---|---|---|
| `HELIXBRAIN-L2-007` required provenance field coverage | 8/8 required fieldsを個別に解決可能とする候補。案Aは総数のみ、案Bはsource/provenance/evidence/adopted reason/evaluated scope/counterexample/limitation/LABO target revisionを個別照合し欠落を特定する。説明可能なBを候補とする。 | L2-007とL11:35の列挙に基づく。各fieldの欠落、stale、revision不一致を個別に与え、candidate stateとpromotion結果を観測。 | 欠落ごとのaccepted/mature誤遷移0を候補判定。必要実績件数・verifier人数は上流にないため候補化しない。 |
| `HELIXBRAIN-L2-007` false promotion | AI-generated-onlyまたはsingle successだけによるaccepted/mature遷移0を候補とする。 | L2-007/L11:35の明示否定条件。単独根拠mutationとowner別stateを照合。 | promotion結果、不足根拠・ownerを観測。実測前の候補値。 |
| `HELIXBRAIN-L2-008` named state distinction and pin stability | L2列挙5 stateを個別識別し、supersession時も既存consumer exact revisionを保持する候補。案Aは現stateのみ、案Bは全state/consumer referenceを照合しsilent replacementを検出。 | current/superseded/deprecated/experimental/retiredを別々に与え、R参照中にR2 supersessionを作る正常fixtureと、R参照へR2を返す／同revision内容を書き換える独立negativeを用いる。 | 5値とR pinを照合。新state・semver grammar・transition SLA・保存期間は未指定。 |
| `HELIXBRAIN-L2-008` unknown handling | unknown identity/revision/stateをcurrentへ推測解決しない、version_targetをactualとして受けない候補。 | unknown/競合/欠落mutationとversion_target差し替えを別々に投入。 | candidate use停止、BRAIN/OS owner分離を確認。新stateや追加ownerは作らない。 |
| `HELIXBRAIN-L2-028` declared compatibility match | descriptorに宣言されたrange内だけapplicable、outside/unknown/mismatchはnot-applicableまたはunknownとする候補。 | BRAIN L2-028が列挙するdescriptor field/rangeと、採択HARNESS L2-010/011のpack/call境界依存を分けて扱い、技術候補として、descriptorがrangeを宣言する合成fixtureを置き、そのfixture内でrequired versionの内側・外側・欠落・解釈未確定を比較する。fixture値は試験入力に限り、製品値・range構文・比較規則として採択しない。range field自体がない/読めない場合はunknown/未評価とする。 | range syntax/comparator/fallbackは固定L2にないため採択候補にしない。合成fixture値は測定入力に限り、本書で製品値として決めない。 |
| `HELIXBRAIN-L2-028` descriptor/knowledge axis separation | descriptor fieldとBRAIN knowledge identity/revision/version/stateを独立照合し、cross-substitutionによる誤受理0を候補とする。 | descriptorとknowledge各fieldを個別変異し、identityおよび各version軸に互いに異なる合成値を置いた入替え変異を独立投入する。応答tuple、該当field、期待軸、BRAIN（L2-008）／HARNESS ownerへの戻し先を観測。 | 独自schema/digest/timeoutは未指定。BRAINは共通exchange/update/rollback/unfinished-obligation lifecycleを再定義しない。 |

候補値は未実測であり、測定できない/fixture未充足/契約値が不明な場合を成功としない。旧数値を自動継承しない。

## Stage 2b追補 — 採択済み001〜006の部分草稿

**状態：候補のみ（独立review／L3承認前）。** Stage 1 prefixは最新main `a7ae47c0bd97cd53298594086923c73dfb2a712b`で承認済みのbytesを保持する。本追補はPO main `633bf12ea8f948db8ba3d6600179c4a9507377a7`の採択registrationと、固定L2/L11 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`の001〜006だけを候補として具体化する。各親のversion targetは1.0、G0配属はStage 2bであり、release収載や全前Stage完了gate、実装・実行許可を生成しない。後続版・Web条件付き・保留/不採択を親にしない。

### BRAIN-001-NFR-01 — 意味条件の照合可能性（候補）

根拠：固定HELIXBRAIN-L2-001と対応L11の列挙条件。比較案Aは件数/名称だけの照合、案Bは各適用項目のidentity/source/意味/状態/戻し先を照合する。本案はBを候補とする。測定対象は今回のfixture scopeで選択された必須項目であり、全製品・全欠陥の性能保証ではない。必要項目の有限集合を各々照合（対象内100%候補）し、missing/unknown/意味不整合を成功に丸める件数0を候補判定とする。未選択のsource/将来候補は必須母集団へ足さない。

測定は計画試行Nplannedをvalid観測/Nfailed/Nmissing/Ncensoredの互いに重ならない区分へ記録する。validは合格件数でなく比較できる観測件数であり、不合格を正しく観測した試行も入る。Nfailedは処理エラーにより判定可能な観測を得られなかった試行に限り、観測できたoracle不合格と区別する。Nplanned=Nvalid+Nfailed+Nmissing+Ncensoredを照合する。missingは入力欠落と観測欠落を別表示、censoredは停止/打切りで判定未完のもの。各行の理由を保ち、未実施は未測定。対象scopeで契約が要求する項目Nrequired（値不明や欠落も母集団に残す）と、期待oracleどおり照合したNchecked（正しい不足/不合格判定も含む）、誤成功Nfalseを併記する。Nrequired=0なら照合率は算出せず、必須入力自体の欠落を『対象なし』へ変換しない。時間を測る場合は既存の単位/開始終了条件とvalid標本数を記録し、valid=0では分位値を出さない。固定SLA/保持期間/最低sample数は設定しない。

### BRAIN-002-NFR-01 — 意味条件の照合可能性（候補）

根拠：固定HELIXBRAIN-L2-002と対応L11の列挙条件。比較案Aは件数/名称だけの照合、案Bは各適用項目のidentity/source/意味/状態/戻し先を照合する。本案はBを候補とする。測定対象は今回のfixture scopeで選択された必須項目であり、全製品・全欠陥の性能保証ではない。必要項目の有限集合を各々照合（対象内100%候補）し、missing/unknown/意味不整合を成功に丸める件数0を候補判定とする。未選択のsource/将来候補は必須母集団へ足さない。

測定は計画試行Nplannedをvalid観測/Nfailed/Nmissing/Ncensoredの互いに重ならない区分へ記録する。validは合格件数でなく比較できる観測件数であり、不合格を正しく観測した試行も入る。Nfailedは処理エラーにより判定可能な観測を得られなかった試行に限り、観測できたoracle不合格と区別する。Nplanned=Nvalid+Nfailed+Nmissing+Ncensoredを照合する。missingは入力欠落と観測欠落を別表示、censoredは停止/打切りで判定未完のもの。各行の理由を保ち、未実施は未測定。対象scopeで契約が要求する項目Nrequired（値不明や欠落も母集団に残す）と、期待oracleどおり照合したNchecked（正しい不足/不合格判定も含む）、誤成功Nfalseを併記する。Nrequired=0なら照合率は算出せず、必須入力自体の欠落を『対象なし』へ変換しない。時間を測る場合は既存の単位/開始終了条件とvalid標本数を記録し、valid=0では分位値を出さない。固定SLA/保持期間/最低sample数は設定しない。

### BRAIN-003-NFR-01 — 意味条件の照合可能性（候補）

根拠：固定HELIXBRAIN-L2-003と対応L11の列挙条件。比較案Aは件数/名称だけの照合、案Bは各適用項目のidentity/source/意味/状態/戻し先を照合する。本案はBを候補とする。測定対象は今回のfixture scopeで選択された必須項目であり、全製品・全欠陥の性能保証ではない。必要項目の有限集合を各々照合（対象内100%候補）し、missing/unknown/意味不整合を成功に丸める件数0を候補判定とする。未選択のsource/将来候補は必須母集団へ足さない。

測定は計画試行Nplannedをvalid観測/Nfailed/Nmissing/Ncensoredの互いに重ならない区分へ記録する。validは合格件数でなく比較できる観測件数であり、不合格を正しく観測した試行も入る。Nfailedは処理エラーにより判定可能な観測を得られなかった試行に限り、観測できたoracle不合格と区別する。Nplanned=Nvalid+Nfailed+Nmissing+Ncensoredを照合する。missingは入力欠落と観測欠落を別表示、censoredは停止/打切りで判定未完のもの。各行の理由を保ち、未実施は未測定。対象scopeで契約が要求する項目Nrequired（値不明や欠落も母集団に残す）と、期待oracleどおり照合したNchecked（正しい不足/不合格判定も含む）、誤成功Nfalseを併記する。Nrequired=0なら照合率は算出せず、必須入力自体の欠落を『対象なし』へ変換しない。時間を測る場合は既存の単位/開始終了条件とvalid標本数を記録し、valid=0では分位値を出さない。固定SLA/保持期間/最低sample数は設定しない。

### BRAIN-004-NFR-01 — 意味条件の照合可能性（候補）

根拠：固定HELIXBRAIN-L2-004と対応L11の列挙条件。比較案Aは件数/名称だけの照合、案Bは各適用項目のidentity/source/意味/状態/戻し先を照合する。本案はBを候補とする。測定対象は今回のfixture scopeで選択された必須項目であり、全製品・全欠陥の性能保証ではない。必要項目の有限集合を各々照合（対象内100%候補）し、missing/unknown/意味不整合を成功に丸める件数0を候補判定とする。未選択のsource/将来候補は必須母集団へ足さない。

測定は計画試行Nplannedをvalid観測/Nfailed/Nmissing/Ncensoredの互いに重ならない区分へ記録する。validは合格件数でなく比較できる観測件数であり、不合格を正しく観測した試行も入る。Nfailedは処理エラーにより判定可能な観測を得られなかった試行に限り、観測できたoracle不合格と区別する。Nplanned=Nvalid+Nfailed+Nmissing+Ncensoredを照合する。missingは入力欠落と観測欠落を別表示、censoredは停止/打切りで判定未完のもの。各行の理由を保ち、未実施は未測定。対象scopeで契約が要求する項目Nrequired（値不明や欠落も母集団に残す）と、期待oracleどおり照合したNchecked（正しい不足/不合格判定も含む）、誤成功Nfalseを併記する。Nrequired=0なら照合率は算出せず、必須入力自体の欠落を『対象なし』へ変換しない。時間を測る場合は既存の単位/開始終了条件とvalid標本数を記録し、valid=0では分位値を出さない。固定SLA/保持期間/最低sample数は設定しない。

### BRAIN-005-NFR-01 — 意味条件の照合可能性（候補）

根拠：固定HELIXBRAIN-L2-005と対応L11の列挙条件。比較案Aは件数/名称だけの照合、案Bは各適用項目のidentity/source/意味/状態/戻し先を照合する。本案はBを候補とする。測定対象は今回のfixture scopeで選択された必須項目であり、全製品・全欠陥の性能保証ではない。必要項目の有限集合を各々照合（対象内100%候補）し、missing/unknown/意味不整合を成功に丸める件数0を候補判定とする。未選択のsource/将来候補は必須母集団へ足さない。

測定は計画試行Nplannedをvalid観測/Nfailed/Nmissing/Ncensoredの互いに重ならない区分へ記録する。validは合格件数でなく比較できる観測件数であり、不合格を正しく観測した試行も入る。Nfailedは処理エラーにより判定可能な観測を得られなかった試行に限り、観測できたoracle不合格と区別する。Nplanned=Nvalid+Nfailed+Nmissing+Ncensoredを照合する。missingは入力欠落と観測欠落を別表示、censoredは停止/打切りで判定未完のもの。各行の理由を保ち、未実施は未測定。対象scopeで契約が要求する項目Nrequired（値不明や欠落も母集団に残す）と、期待oracleどおり照合したNchecked（正しい不足/不合格判定も含む）、誤成功Nfalseを併記する。Nrequired=0なら照合率は算出せず、必須入力自体の欠落を『対象なし』へ変換しない。時間を測る場合は既存の単位/開始終了条件とvalid標本数を記録し、valid=0では分位値を出さない。固定SLA/保持期間/最低sample数は設定しない。

### BRAIN-006-NFR-01 — 意味条件の照合可能性（候補）

根拠：固定HELIXBRAIN-L2-006と対応L11の列挙条件。比較案Aは件数/名称だけの照合、案Bは各適用項目のidentity/source/意味/状態/戻し先を照合する。本案はBを候補とする。測定対象は今回のfixture scopeで選択された必須項目であり、全製品・全欠陥の性能保証ではない。必要項目の有限集合を各々照合（対象内100%候補）し、missing/unknown/意味不整合を成功に丸める件数0を候補判定とする。未選択のsource/将来候補は必須母集団へ足さない。

測定は計画試行Nplannedをvalid観測/Nfailed/Nmissing/Ncensoredの互いに重ならない区分へ記録する。validは合格件数でなく比較できる観測件数であり、不合格を正しく観測した試行も入る。Nfailedは処理エラーにより判定可能な観測を得られなかった試行に限り、観測できたoracle不合格と区別する。Nplanned=Nvalid+Nfailed+Nmissing+Ncensoredを照合する。missingは入力欠落と観測欠落を別表示、censoredは停止/打切りで判定未完のもの。各行の理由を保ち、未実施は未測定。対象scopeで契約が要求する項目Nrequired（値不明や欠落も母集団に残す）と、期待oracleどおり照合したNchecked（正しい不足/不合格判定も含む）、誤成功Nfalseを併記する。Nrequired=0なら照合率は算出せず、必須入力自体の欠落を『対象なし』へ変換しない。時間を測る場合は既存の単位/開始終了条件とvalid標本数を記録し、valid=0では分位値を出さない。固定SLA/保持期間/最低sample数は設定しない。

## Stage 2b追補 — 採択済み009/010/011/012/029（技術候補）

値は固定L2/L11を照合可能にする技術候補で、PO指定SLAや実測値ではない。旧NFR `LEGACY-ASSET-DB669724249A14A665F0`（`nfr-grade.md:21-34,58-74`）から測定・判定を結ぶ形式のみ再導出し、旧IPA grade、placeholder、固定比率、CI/runtime条件を置換する。BRAIN固有NFRの旧直接一致根拠は検索範囲で確認できず、以下は固定親と機能CASEの独立oracleからの候補である。

| 親L2 | 候補比較と判定材料 | 測定母集団・境界 |
|---|---|---|
| `HELIXBRAIN-L2-009` | 案A: relation名・candidate件数だけを確認。案B: 選択されたUnit/relationのsource、両端identity、意味、scope、version、owner別評価/登録/検証状態を照合する。案BはL2-009の構成根拠とcandidate-only保証を直接検査できるため候補。選択relationごとの必須要素を照合し、欠落・unknown・不一致を昇格成功へ変換した数を別計数する。 | C01–C11の選択fixtureのみ。未選択sourceを分母へ入れない。各変異とowner状態を分離し、全体成功件数で個別欠落を相殺しない。 |
| `HELIXBRAIN-L2-010` | 案A: failure名だけの照合。案B: 選択failureの成立条件、影響、反例、evidence/source/scopeと条件付き適用を項目ごとに照合する。固定L2/L11が求める意味を測るBを候補とする。sourceにあるalternative candidateと条件付き禁止構造の保持、sourceにないalternativeのunknown維持も照合する。 | C01–C09の選択failure fixture。L11列挙全種を一律に全条件へ適用しない。unknown scopeとsource/evidence欠落は各々区別し、未見normal C09を含む。 |
| `HELIXBRAIN-L2-011` | 案A:製品固有語の件数だけを見る。案B:選択sourceごとに一般化根拠、製品固有残余、source/provenanceを照合する。意味漏れとsource喪失を検出するBを候補とする。 | C01–C09の対象sourceだけを分母にし、製品名・requirement・製品固有screen/具体API・business rule・user judgment・provenanceの変異を独立計数。未選択sourceは未観測。 |
| `HELIXBRAIN-L2-012` | 案A:返却候補数だけを見る。案B:返却 tuple（candidate、required input、relation、alternative、constraint、evidence、version）とdecision未決状態を対応付ける。採用authorityの誤生成とtuple各field欠落を独立に観測するBを候補とする。 | C01–C10のquery/選択候補scope。候補数と必須field充足を混ぜず、意味不明を空母集団や選択成功へ変えない。 |
| `HELIXBRAIN-L2-029` | 案A:構成数とrelation labelだけを見る。案B:選択したPattern/Unit/Part tuple（identity/source/version、applicability、required input、constraint、trade-off、negative/failure、relation type/endpoint/meaning）を追跡し、unknown・矛盾とowner境界を別軸で照合する。列挙されたrelation例とL2-003/005/008の必須条件を直接検査できるBを候補とする。 | C01–C52の選択構成fixture。5 relation typeと各必須情報を独立に照合し、未選択CORE/LABO sourceは未観測。参照資料は分母・oracleにしない。 |

共通の測定報告候補：対象scopeで契約上要求される要素数を分母として明示し、値欠落・unknownも対象要素から除かない。観測可能、観測した不合格、処理失敗、入力/観測欠落、打切りを別々に数え、分母0では率を算出しない。正しい不合格判定は判定可能な観測であり失敗件数へ隠さない。未実行は未測定であり、欠測を0や成功へ変換しない。時間を測る場合は根拠ある開始/終了条件と単位を併記し、valid時間標本が0なら分位値なしとする。これは測定形式の候補であり、新しいSLA、最低標本数、承認gateを設けない。
