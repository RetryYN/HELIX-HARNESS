# Candidate 4755 説明行の規範語スクリーン補集合 ranks 1–20 意味監査

## 対象と導出

#2353の4,755行へ#2356、#2360、#2363、#2366、#2367、#2368、#2369、#2381を順に反映したeffective explanation 2,965行から、意味監査済みmarker pool 255行を除いた補集合2,710行を対象とする。queueは`LEGACY-CAND-LINE`数値suffix昇順。見出し・表headerとしてscreen対象から意図的に外された行も補集合に残る。今回の対象はrank 1–20。

marker非該当だけで非規範的・非要求とは判定しない。有効分類と意味上の機能を分け、条件・禁止・権限境界を含む可能性を調べた。exact source/ledger bytesとcurrent/F6比較pinはpaired JSONに記録した。

## 行別監査

|補集合rank|source ID|分類|原文|意味・分類上の懸念|現行との関係・残条件|
|---:|---|---|---|---|---|
|1|`LEGACY-CAND-LINE-000002`|`explanation`|このdirectoryは、L1／L3／L10のcurrent authorityへ昇格する前の提案を置く。|候補置き場の役割・配置を説明する索引前置き。（分類上の懸念: 要注意）|「提案を置く」は管理process条件とも読める。現行authority modelは候補と承認revisionを区別するが、この行固有の継承先はない。 残条件: 候補配置と昇格の意味をsource atom単位で現行registerへ対応づける。|
|2|`LEGACY-CAND-LINE-000003`|`explanation`|candidateをruntime入力、DB authority、README上の確定機能として扱わない。plan固有human approval、|candidateをruntime入力・DB authority・README確定機能として扱わない境界。文は次行へ続く。（分類上の懸念: あり）|「扱わない」はmarker外の規範的authority禁止。後半 clause と同一文のため複合atomにも注意。現行authority model/AGENTSは候補やGitHubから採否・承認を生成しない。 残条件: 旧語彙の禁止境界と現行authorityのscopeをrow単位で照合し、次行との結合を保つ。|
|3|`LEGACY-CAND-LINE-000004`|`explanation`|canonical merge、Requirement IR admission、main反映後の再読を経たものだけを現行正本へ移す。|候補を現行正本へ移すための手順・条件。前行から続く文の完結部。（分類上の懸念: あり）|「…を経たものだけ」は条件だがmarker外。旧canonical merge/Requirement IR admissionは現行手順へ自動継承できない。 残条件: 現行decision/admissionと旧IR・merge・read-after条件の差分を対応づける。|
|4|`LEGACY-CAND-LINE-000006`|`explanation`|- [新世代CIの上流要求候補](next-generation-ci-requirements.md)|新世代CI候補へのMarkdown link。navigation row。（分類上の懸念: なし）|単独義務はなく候補文書の所在を示す。現行OS候補へ移設済みで候補statusも維持。 残条件: family pointerだけを保持し、行自体からCI候補採用や実装許可を作らない。|
|5|`LEGACY-CAND-LINE-000007`|`explanation`|HARNESSが所有する検証契約とHELIX-OSが所有するCI生成・実行統制を分け、承認上流から新規導出するための候補である。|HARNESS検証契約とOSのCI生成・実行統制を分けて導出する候補の目的説明。（分類上の懸念: なし）|候補の責務意図を説明し、独立の受入predicateはない。現行OS CI候補にも境界記述はあるが旧行crosswalkではない。 残条件: 責務familyを現行要件へ照合し、旧sourceの個別採否は保留する。|
|6|`LEGACY-CAND-LINE-000008`|`explanation`|要求整理が完了するまでworkflow、runtime、gate、test、設定、PR／CI運用へ進めない。|要求整理完了までworkflow等の設計・運用へ進まない停止条件。（分類上の懸念: あり）|「進めない」は実質的な禁止条件だがmarker外。現行entryもCI実装を止めるが、解除条件・scopeは現行stateから再導出する。 残条件: 「要求整理完了」を現行L2/decisionの許可条件へ個別に対応づける。|
|7|`LEGACY-CAND-LINE-000010`|`explanation`|- [AI可読上流文書の要求候補](ai-readable-authority-requirements.md)|AI可読上流文書候補へのMarkdown link。navigation row。（分類上の懸念: なし）|文書位置の参照で、要求条件を記さない。現行AGENTS/CLAUDE/entryは別のauthority読込経路を定める。 残条件: old link/familyとcurrent instructionのsource対応を確認する。|
|8|`LEGACY-CAND-LINE-000011`|`explanation`|HARNESSの工程契約、HELIX-OSの実行コンテキスト、個別製品要求を分け、AIが承認上流へ戻れる入口を構成する候補である。|HARNESS工程、OS実行context、製品要求を分け、承認上流へ戻るAI入口を構成する候補の目的説明。（分類上の懸念: なし）|独立したmust/acceptance条件でなく候補目的の記述。現行読込順とは主題が近いが行固有bindingはない。 残条件: 必要な意味を現行contextへ再導出する場合も旧行の採択とは分ける。|
|9|`LEGACY-CAND-LINE-000012`|`explanation`|現行`AGENTS.md`、`CLAUDE.md`、hook、adapter、promptは要求整理中に変更しない。|要求整理中に現行AGENTS/CLAUDE/hook/adapter/promptを変更しない制約。（分類上の懸念: あり）|「変更しない」はmarker外の禁止・期間条件。現行AGENTS/CLAUDEは現行正本だが、この旧凍結範囲を現行へ広く継承しない。 残条件: 対象・期間・変更権限を現行規則と照合し、旧凍結条件の終期を解決する。|
|10|`LEGACY-CAND-LINE-000014`|`explanation`|- [入力・既存owner接続](infrastructure-operations-quality-intake.md)|Infrastructure operations-quality intake候補へのlink。（分類上の懸念: なし）|navigation row。現行Infrastructure L1には旧NIO family参照があるがこのlink行固有bindingではない。 残条件: リンク先source atomsと現行L1を直接照合する。|
|11|`LEGACY-CAND-LINE-000015`|`explanation`|- [L1要求候補](infrastructure-operations-quality-l1-request-candidates.md)|Infrastructure operations-quality L1 request candidatesへのlink。（分類上の懸念: なし）|navigation row。現行Infrastructure L1のexact revisionはPO判断で固定済み。本文のdraft metadataは当時のsnapshotとして保持されるが、このlink行の個別bindingではない。 残条件: 旧source atoms・確定L1 revision・PO決定scopeを対応づける。|
|12|`LEGACY-CAND-LINE-000016`|`explanation`|- [L3要求候補](infrastructure-operations-quality-l3-requirement-candidates.md)|Infrastructure operations-quality L3 requirement candidatesへのlink。（分類上の懸念: なし）|navigation rowでL3要件意味は含まない。現行L2/L11の採用は旧L3全体の採用やcoverageでない。 残条件: L3 source atomsのcarry-forwardと個別authorityを追跡する。|
|13|`LEGACY-CAND-LINE-000017`|`explanation`|- [L10受入候補](infrastructure-operations-quality-l10-acceptance-candidates.md)|Infrastructure operations-quality L10 acceptance candidatesへのlink。（分類上の懸念: なし）|navigation rowで受入oracleを含まない。現行L11は別revisionのpair。 残条件: 旧L10 atomごとのcurrent L11 oracle・decision traceが残る。|
|14|`LEGACY-CAND-LINE-000019`|`explanation`|包括的な自動修復権限、実装・運用完了を成立させない。|包括的自動修復authorityや実装・運用完了を候補から成立させない境界。（分類上の懸念: あり）|「成立させない」はprohibition regex外だがauthority/完了境界。現行authority modelも候補から採否・完了を生成しない。 残条件: 個別修復operation authorityと完了条件の現行ownerを対応づける。|
|15|`LEGACY-CAND-LINE-000022`|`explanation`|- `helix-concept-v4.0.md`: Verified Change Operating SystemへのConcept候補|旧Concept v4.0候補の説明ラベル。（分類上の懸念: なし）|document-name/reference metadata。現行Conceptは単一文書へ統合。v4.1 decisionは本行/v4.0 fileを承認しない。 残条件: 旧Concept atomsをcurrent Conceptとの差分とPO決定scopeで照合する。|
|16|`LEGACY-CAND-LINE-000023`|`explanation`|- `helix-concept-v4-requests.md`: L1要求候補|旧v4 requests文書へのlinkと「L1要求候補」ラベル。（分類上の懸念: なし）|navigation/layer labelで要求predicateなし。旧L1要求という用語を現行L1 planning/L2 requirementsへ直訳しない。 残条件: 旧sourceの内容と現行Concept/L1/L2へ正しい層で対応する。|
|17|`LEGACY-CAND-LINE-000024`|`explanation`|- `helix-concept-v4-requirements.md`: L3要件候補|旧v4 requirements文書へのlinkとL3候補ラベル。（分類上の懸念: なし）|navigation/candidate metadata。現行入口ではL3はL2/L11後でありv4.1承認もL3を含まない。 残条件: L3 atomsと現行target pair/authorityを個別照合する。|
|18|`LEGACY-CAND-LINE-000025`|`explanation`|- `helix-concept-v4-acceptance.md`: L10受入候補|旧v4 acceptance文書へのlinkとL10候補ラベル。（分類上の懸念: なし）|navigation/acceptance category referenceでoracle条件なし。v4.1 decisionはL10を承認していない。 残条件: 旧L10 oracleのsuccessor/coverage/authorityは未確定。|
|19|`LEGACY-CAND-LINE-000026`|`explanation`|- `helix-concept-v4-capability-delta.md`: baseline capabilityとの実測差分|旧v4 capability delta文書の説明。（分類上の懸念: なし）|差分監査へのreference labelで、差分自体を要求しない。 残条件: source delta atomsとcurrent consumersのprovenanceを追跡する。|
|20|`LEGACY-CAND-LINE-000027`|`explanation`|- `helix-concept-v4-readme-projection.md`: 人間向けREADME説明候補（非authority）|旧v4 README projection候補であり非authorityとの説明。（分類上の懸念: なし）|説明metadata。README projectionをauthorityにしない境界は含意するが、単独の要求としての採択はない。 残条件: 現行authority sourceと旧projectionを区別し、successor/closureは未設定のまま保つ。|

## source・current・authority照合

20行すべて旧`docs/governance/candidates/README.md`由来。archive原文、source-line carry-forward ledger、asset disposition ledgerをID、path、file digest、行digestで照合した。全件`historical_candidate`／`draft_candidate`／`preserved_pending_atomization`で、successorとdecisionはなく、assetは`product_target=unresolved`、`disposition=unresolved`、upstream/pair IDなし。

現行入口、authority-state model、source inventory、carry-forward status、Concept、CI候補、Infrastructure L1/L2と関連decisionを確認した。F6 HARNESS/OS/INFRASTRUCTURE L2/L11は比較revisionのpinであり、今回の行を個別採択・bindingするdecisionではない。Concept v4.1の承認も旧v4.0のpointer行やL3/L10候補を承認しない。

000003–000004は行をまたぐ一文でcandidateのauthority境界と移行条件を記述する。000008、000012、000019にもlexical marker外の停止・禁止条件があるため、`explanation`だけから非要求扱いしない。リンク・文書名（000006、000010、000014–000017、000022–000027）はnavigation/metadataとして分類した。いずれもexact row crosswalkやsuccessorは未確認。

## 非主張

- 採択、retire、successor、source coverage、受入実行、実装・運用完了、authority変化、closureは0件。authority effectは`none`。
- F6/currentの話題上の類似から個別bindingを推定しない。exact crosswalkの不在から意味の不在・棄却も推定しない。
- archiveはread-only。旧実行経路、test、CI、runtimeは実行していない。検証は文書revision、ID対応、byte/hash join、生成物の静的整合に限る。

Authority effect: `none`。
