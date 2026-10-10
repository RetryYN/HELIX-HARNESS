# 要求の未決論点と固定差分案

## ASSETCOVER：既存repository全資産の棚卸し・充足度mapping要求案

base `742258892f94ab5c42d9274e7732b39608abf3bb`。[JSON候補](requirements-resolution-packet.json)、SHA-256 `cd07bb3e310d45ba3a35189551ebdd545d7176aa58dce4ff1bf8ec30c0f43dfc`。authority_effect: none。

#1852の旧FR-L1-33を起点に、HARNESS-L2-089という一つのunitと対L11を提案する。現行019（Full Reverse入口）、027（source型抽出）、034（計測）、OS033（detector運転）の近接能力と、全資産・カテゴリ網羅・充足reportの不足を分ける。版は未指定で、旧P2/Phase Bと初期必須化しない条件を保持する。

旧sourceはfunctional-requirements.md:64（asset LEGACY-ASSET-6B6C5CB0E481BE01088B）、同309/317の残差、L3の743/773–774、screen469、internal-asset-inventoryの旧失敗/別identity、module-decomposition212。完全path・引用bytes/digestはJSONに保持する。旧inventoryのclosedと固定件数を現行成立の証拠へ転用せず、旧test/CLI/CI/runtimeを実行しない。

## 提案L2

### HARNESS-L2-089 既存repository全資産の棚卸し・充足度mapping候補（unit、未採択）

- **対象・親・版**：旧FR-L1-33の資産棚卸しと充足度mappingを、一つのHARNESS unit候補として具体化する。親候補はHARNESS-L1-001／003／005／008。既存成果を要求・設計・検証のtraceへ結び、既存資産の不足と不明を要求形成へ返すための能力である。旧優先度P2と後続PLANへの分類を保持し、新しいversion_targetを指定しない。019のFull Reverse入口から参照できるが、すべての019利用やPhase 0の開始にこのunitの完了を一律に要求しない。
- **受け取るもの**：対象repository identityとsource snapshot/revision、全資産の列挙根拠、各資産のsource/provenanceと読み取れる内容、照合対象の要求／設計義務／契約identity・revision・scopeと充足判定根拠。列挙した項目数だけで全量性を推定しない。許可されたread scopeがrepository全体を覆わない、列挙元や資産の内容が未観測の場合は、その範囲を不足として保持する。照合基準がまだない資産は棚卸し可能でも、充足済みとは判定しない。
- **棚卸しの範囲**：リポジトリ全資産について、command、skill、detector、template、state、hook、docs、testsの各カテゴリを確認する。複数カテゴリに関係する資産は同じ資産の関係として保持し、重複列挙でcoverageを増やさない。カテゴリ名に一致しない資産も除外せず未分類として残す。旧W11/W12/W16のworkflow/task/agent builder、audit/metrics/dashboard、asset/code catalogも棚卸し対象に含める。
- **提供するもの**：列挙された資産と根拠、各カテゴリの観測状態、各資産／照合条件の対応、充足した条件・一部のみ確認できた条件・不足・不明・非対象の根拠を持つ充足度reportと不足項目list。資産が存在することと、その内容が要求／義務を満たすことを区別する。元資産・基準revision・scopeが変われば影響する対応を再照合待ちとして残す。割合やthresholdを本候補で新設せず、数値を使う場合は既存034の計測契約に従う。
- **拡張能力の分類**：上記builder、audit/metrics/dashboard、asset/code catalogは、後続PLANの候補機能・trace hint・CI summaryとして分類する。棚卸しで発見したことからPhase 0の必須開発導線、稼働済み機能、現行のCI開始条件を生成しない。候補分類の原根拠と未決を残し、旧能力を不要として削除しない。
- **不足・失敗・回復**：カテゴリ抜け、列挙根拠欠落、読めない資産、別revision、未解決の資産identity、照合基準欠落を個別に不足／unknownとして返す。読めた一部だけでrepository全体を網羅済みにせず、資料なしを不存在や充足済みへ補完しない。資産／列挙不足はinput/source owner、要求値・合意不足は008、設計義務不足は009または該当設計ownerへ戻す候補へ結ぶ。根拠が補われた後も、元の不足と対象revisionを保持して再照合する。新しい停止gateや承認手続きを追加しない。
- **責務と依存**：HARNESSは資産と充足根拠の意味照合・report／不足候補を提供する。実sourceの列挙・収集や実検査は選択された利用環境・担当ownerの証拠を使い、OSの記録・運転、LABOの評価、INTELLIGENCEの稼働中判断を代行しない。対象repository/sourceと照合scopeが常時必要で、内容充足を判定する操作には対応基準と根拠が必要である。非選択のdetector実行を必須化しない。027のsource型抽出、033（OS）のdetector運転、034の計測規範だけから全資産棚卸し成立を推定しない。019とは入口と棚卸しunitの別identityを保つ。
- **限界・旧source**：旧functional-requirements.md:64の全資産・8カテゴリ・拡張分類と、旧L3のP2/Phase B carry、画面consumerの機能一覧＋coverageを保持する。入力snapshot／判定基準と不足の区別は、旧sourceでは固定されていないため今回の具体化差分として提示する。旧asset inventoryの19/107等の件数、旧CLI、hook、DB、guardやactive closed記録は現行基準へ移植しない。旧FR33のcatalog DB粒度（同:309）・A126文書export（同:317）、旧画面表示の具体化、formal successor／全source移管、実装・受入成立・L3再開は別に保持する。

## 対L11案

### HARNESS-L2-089 全資産棚卸し・充足度mappingの対L11候補（未採択）

**正常例**：対象repository Rの同じsnapshot Sと列挙根拠で全資産を受け、8カテゴリと拡張能力の分類、資産から同じrevision/scopeの照合基準への対応を追える。複数カテゴリの一資産は重複して充足数を増やさない。存在する資産でも内容が基準を満たさない場合は不足をreport/listへ示す。基準未決や読めない内容はunknown／未照合として残す。拡張能力を後続候補・trace hint・CI summaryへ分類し、初期必須導線へ昇格させない。

**負例**：hookだけ未列挙、testsだけ未読、未分類資産の無断除外、別snapshotのdocs結果、同じtemplateの二重計上、存在するだけのskillを義務充足とする、基準なしの充足宣言、W11/W12/W16拡張の省略またはPhase 0必須化を、一つずつ混入する。該当資産／カテゴリ／基準の不足と戻し先を識別し、他の成功や固定件数で全量／全充足を生成しない。旧doctorの0件・旧inventoryのclosed印・GitHubのcloseは現行の成立根拠にしない。

**unknown・回復・未見例**：列挙根拠とread scopeがrepository全体を覆うか不明、snapshotがstale、asset identityが未解決、照合基準が欠落した例を区別し、不明範囲を不存在／成功へ変えない。source/inputまたは要求・設計ownerが不足を補った後、元の対象revision/scope・不足履歴と新根拠を結んで再照合する。未公開のカテゴリ抜け、拡張asset、部分読取、別版の基準を含むfixtureで、既知の名前や件数だけでは網羅性・充足が成立しないことを確認する。この候補段階でfixtureを実行済みとは主張しない。

**成立範囲**：棚卸し・意味照合unit固有の条件を確認する。Full Reverse全体、入先サービス、接続／構成体、実CI／runtime、旧FR33全移管を、このunitのreport生成だけで完了にしない。新規version_targetは指定しない。

## 未完と前の案

旧FR33のcatalog DB粒度・A126 export・具体画面・formal successor、#1852の他旧要求/接続/構成体は残る。この案だけで#1852をcloseしない。snapshot・照合基準・不足の区別は今回の具体化差分で、旧sourceに既定だったとは主張しない。schema・parser・演算・割合・thresholdや新しい承認gateを定めない。

DDDSTRICTはPO判断待ちのまま、前packet全体をJSONのpending_packet.packetへ完全一致で保持した。SEEDFIRSTの採択記録もその内部に保持する。未回答を採択とみなさず、canonical/MPR/台帳/Bindingは変更していない。

## INCIDENTPORT：Incidentの即releaseと通常Portの関係（#1857）

対象は旧`harness/L1-requirements/functional-requirements.md::FR-L1-16`の「検出→hotfix→即release→収束→current L1〜L12 backfill」です。独立判定で、この意味判断だけが#1857の要求側の未完事項と確認されました（[判定](https://github.com/RetryYN/HELIX-HARNESS/issues/1857#issuecomment-6092550610)）。本案のbaseは`11cdd5acdb5dacd435b2cd780b17c459857ac889`、意味候補とsource/span digestはJSONの`incident_release_decision`です。上のASSETCOVERとJSON内部のDDDSTRICTの採否は別の未回答のまま保持します。

旧sourceはfunctional-requirements.md:47（LEGACY-ASSET-6B6C5CB0E481BE01088B）、incident.md:35–56/68–70（LEGACY-ASSET-9E033C3E39BE107D4CF1）、要件v1.3:626（LEGACY-ASSET-02319C2481B9E01698D5）。旧modeにもproduction境界・approval確認があるため、「即release＝無承認・全検査bypass」とは断定しません。旧L0〜L14の層番号を現行へ写さず、current L1–L12へ戻る要望を保持します。旧test／CLI／runtime／CIは実行しません。

- **A**：Incident固有のrelease例外を残す方向を選び、最低安全条件・権限・backfillと対L11を追加形成して改めて提示します。方向選択だけでは未定義の例外を承認できず、#1857はOPENのままです。
- **B（推奨）**：通常Release Portをhotfixにも適用します。即releaseを通常Portの例外として残さず、条件成立後の迅速な適用とします。FR-L1-16全体はretireせず、検出・hotfix・収束・postmortem・L12 feedback・backfill・選択済み開発方式への復帰を保持します。

Bは現行003/017のRelease-eligible条件との整合が理由です。旧sourceの不在・未完成・runtimeの存在を変更理由にしません。HARNESSは工程条件、OSは既存Incident／continuity／ticket／検収／受渡し契約の運転と記録を持ち、既存SECURITY操作authorityと有効な既決権限を保持します。旧modeの三者確認主体をこの選択で移管・撤回せず、未処置の旧条件はholdingへ残します。

### BのHARNESS-L2-003追補案

挿入位置：L2の「工程規則として保持する具体条件」表の「開発の開始時からRelease Portを持つ」行の直後。行全文とSHA-256、一意一致件数、反映後file digestをJSONのeditへ固定しています。

| HARNESS-L2-003 | Incidentのhotfixにも通常のRelease Portの必須条件を適用し、緊急性やhotfixという名称から省略を許可しない。旧FR-L1-16の「即release」を通常Portの例外として存続させず、条件が成立した後の迅速な適用として扱う。必要な証明・成果物識別・対象環境・依存・security・rollback・配備条件・受入状態がmissing／unknown／staleならRelease-eligibleにしない。検出・暫定対処・収束確認・postmortem・L12 feedbackと、収束後のcurrent L1–L12へのbackfillは保持する。恒久対策はReverse fullbackで影響する要求・設計・対検証を確認し、選択済み開発方式の該当層へ戻す。暫定収束や配備成功だけで恒久対策とbackfillを完了にしない。HARNESSは工程条件を持ち、OSは既存Incident／continuity／ticket／検収／受渡し契約を参照して運転・記録する。既存SECURITYの操作authorityと有効な既決権限を保持し、本追補からrelease許可や追加承認手続きを生成しない |

### Bの対L11追補案

挿入位置：L11の「工程条件の確認シナリオ」の「開発の開始時にRelease Portの必須条件」箇条の直後。同様にanchor全文・digest・一意性・反映後file digestを固定しています。

- HARNESS-L2-003（Incident）：通常Release Portの必須条件と既存操作authorityを満たすhotfixは、緊急性に依存せず同じRelease-eligible条件で確認する。必要な証明、対象環境、security、rollback、受入状態のいずれかが欠けたhotfixに「即release」や暫定収束を与えても、欠けた条件を省略できずRelease-eligibleにならない。収束後はpostmortemとL12 feedback、current L1–L12の影響先・backfillの未完義務、Reverse fullbackから選択済み開発方式への戻り先を辿る。未完のbackfillや恒久対策を配備成功・収束・Issue closeで完了にしない。戻り先がunknownなら完了へ補完せず保持する。通常Portの条件成立と実release許可・実行・受入結果を分離し、旧CLI／runtime／CIの成功を証拠へ流用しない。

影響先は003（追補対象）、017（既存Port参照）、OS010/017/019/020/023（運転・戻り先・continuity・検収・受渡し）、OS105（復旧証拠相関の限定scope）、旧carry／workflow clause／source holdingです。003の既決1.0は保持し、他identityの意味や版を変更しません。判断が採用された後もformal successorと旧source全移管は別であり、台帳の空successorを本案から埋めません。

PO未回答でcanonical L2/L11、MPR、旧carry、Bindingは無変更です。採択対象はBの003追補と対L11、および通常Port例外の意味置換だけです。release/deployの許可・実行、L3再開、要求全体完了、#1857のcloseは含みません。

## O10GEN：Pattern・製品CORE・UI profile内での画面試作生成（#1853）

独立レビューの[blocker F1](https://github.com/RetryYN/HELIX-HARNESS/issues/1853#issuecomment-6092938361)は、049の測定範囲とは別の生成能力についてPO選択が未記録である点です。base `cd318c216433d915636db3f9a80f628ca6457f0f`、JSONの`o10_generation_decision`へsource/span、選択肢、BのL2/L11全文と反映前後digestを固定しました。既存ASSETCOVER/DDDSTRICT/INCIDENTPORTは別の未回答のままです。

旧VDH-FR-005（asset LEGACY-ASSET-335176749F6322C3CD8D、旧L3:43）、VDH-AC-005（旧受入設計:21）、旧assessment（LEGACY-ASSET-4E880D2FCD37879BA300）の画面機構未実装と文書管理との混同、O10作業依頼を起点にします。O10は要求authorityではありません。旧runtime/test/CI/CLIは実行しません。

- **A**：049の将来revisionへ生成を統合する方向。計測だけで単独利用できる既決意味を保持した操作別の具体案を再形成してPOへ提示します。方向だけでは採択・closeしません。
- **B（推奨）**：生成を新しいHARNESS-L2-090と対L11へ分け、1.0で採用します。049測定・039関係・079証拠を保持し、責務を混ぜません。以下が採択対象の全文です。
- **C**：生成能力を明示保留。MPR-SH-VDH-O10-001と親#1813で追跡し、POの1.0生成指定、生成input/producer責務の具体化、測定だけでは画面試作要望を満たせない確認を再評価条件とします。後続版未指定で、retireしません。記録後に#1853を独立再判定します。

BはO10の制約内生成方向とBRAIN006/023・COREの責務に沿います。生成物の存在だけで能力成立とした旧失敗を避け、各制約への意味対応と反例を持ちます。旧sourceの不在・未完成自体を変更理由にしません。039の後続追補を含め既決の関係scopeから生成能力の採択を推定せず、B/Cでは049003・039003・079001・086002の本文と版を変更しません。

### Bの固定L2案

### HARNESS-L2-090 Pattern・製品CORE・UI profileの制約内で画面prototypeを構成する候補（HARNESS単体、1.0）

- **対象・親・版**：HELIX-HARNESSの部品であるVisual Design HARNESSの生成unit候補。親はHARNESS-L1-006/008/009。O10が示した1.0の制約内画面試作を対象にする。049の表示計測、039の契約関係、079の操作可能artifact/walkthrough証拠とは別の能力として保持する。候補から採択、L3再開、実装許可を生成しない。
- **受け取るもの**：画面を持つ対象のL2要求とscope/revision、生成に使う明示選択済みPattern Contractのidentity/版/適用条件/required・forbiddenと必要input、製品COREのVisual Identity・screen/flow/tokenの制約、UI profileと各入力の出所・利用条件。UI profileは情報優先順位、pattern/token、responsive、motion budget、reduced-motion、accessibility、brand、operational/expressive/mixedの区分を保持する。製品固有値は製品COREへ残し、汎用知識へ混入しない。Patternの適用性や必要制約がmissing/unknown/conflict/staleなら白紙生成で補わず不足を返す。
- **提供するもの**：選択した制約と同じ対象scope/revisionに結び付いた、実際に描画できるHTML等の画面試作候補、各適用制約と構成要素の対応、制約不足・矛盾・未評価範囲と戻し先。画面・操作・状態等のidentityは既存039の意味関係と対象COREの識別を使い、別のID発行規範を追加しない。生成物を入力sourceや要求意味の正本にせず、JSON正本・生成viewの既決境界を守る。
- **保証すること**：AIは選択したPatternのrequiredを満たしforbiddenを含まない範囲で、製品固有のVisual Identityと上記UI profileの各適用制約を保って構成する。根拠のない新しい画面・操作・機能、product固有値の共通Rule Pack化、未選択Patternの暗黙採用をしない。非適用項目は既存の根拠・判定者・対象revision・再評価条件を残し、unknownをN/Aに変換しない。生成した見た目や項目の存在だけで制約充足としない。
- **接続と責務**：BRAIN006/023は汎用Pattern/Unit/Part・適用条件・反例・必要inputを提供し、製品COREは固有意味・Visual Identityを持つ。HARNESSの生成unitはその入力内で試作を構成する。039はExperience/UI/Frontendの関係を、079は操作path・9状態・仮data・manifest/起動/traceとwalkthroughを、049は入力済みprototypeの実描画計測と検査精度を所有する。生成unitの候補出力を各既存契約へ渡すだけで、その契約の合格・実行済みを生成しない。作業の発行・実行・記録はOS等の既存owner、利用結果の汎用化候補はLABO経由とし、BRAINへ直接昇格しない。
- **失敗・戻し先・回復**：Pattern条件や必要input不足はBRAIN/選択source ownerへ、製品固有制約不足は対象COREへ、要求の矛盾や新しい操作が必要なら008/024の既存Backflowへ返す。生成候補の制約違反は違反箇所・対象制約・scope/revisionを示して再構成候補に戻す。不足を補った別revisionでは影響する対応を再照合し、古い候補の充足結果を流用しない。既存003/012のPrototype適用と人の合意前freeze禁止を保持する。
- **人の境界と限界**：vision、brand、見た目の好み、prototype agreement、要件承認、利用者受入は人に残す。候補生成や機械制約照合だけでimplemented/ux_verified/production-readyを主張しない。非画面対象に画面生成を強制せず、技術PoCの適用は独立に003で判定する。実データUX、実装とのdrift、analytics event結線はO10の後続範囲のままで、1.0へ追加しない。旧211-file intake、旧mission分母/層番号、schema/API/CLI/DB/Node/Bun、具体framework・生成model・閾値を導入しない。
- **旧sourceと差分**：VDH-FR-005の制約内構成とUI profile各条件、VDH-AC-005の違反検出を保持する。旧assessmentの文書管理の存在を画面生成能力の完成証拠にしない。O10の1.0方向と現Concept/BRAIN006/023の責務に対応づけ、生成unitを049測定・039関係・079証拠から分けることが今回の具体化差分。旧未完成やruntime存在を変更理由にしない。旧source holdingとformal successor未確定は維持する。

### Bの固定対L11案

### HARNESS-L2-090 制約内画面prototype構成の対L11候補（1.0、未採択）

**正常例**：同じscope/revisionの画面要求、選択Patternのrequired/forbidden、製品Visual Identity、UI profileを与える。試作は実際に描画可能で、構成要素からrequired/forbidden・情報優先順位・pattern/token・responsive・motion budget・reduced-motion・accessibility・brand・surface区分の各適用制約へ意味上の対応を辿れる。製品固有値を共通知識へ入れず、生成候補と各制約の照合状態を示す。079の操作再生/walkthrough条件や049の測定を未実施なら、その未完義務を示す。生成だけで人の合意・受入・UX完成にならない。

**独立した負例**：required一項欠落、forbidden要素追加、情報優先順位違反、token不一致、responsive条件違反、motion budget逸脱、reduced-motion代替欠落、accessibility条件欠落、brand制約違反、operational/expressive/mixed区分の混同、製品固有値の汎用Rule Pack混入を各別fixtureとして照合する。対象制約と違反箇所を示し、見栄えの評価や他の制約passで相殺しない。未選択Patternの暗黙採用、要求にない操作追加、静止画/proseだけをrenderable試作とする例も未完とする。motion等の数値は入力契約に従い、新しい固定閾値をoracleが作らない。

**unknown・回復・未見例**：Patternの適用条件、必要input、UI profile、製品制約が欠落/矛盾/staleの例を区別し、白紙生成/自由補完/N/Aで充足にしない。ownerが不足を補った後、元scope/revisionと新根拠を結び直し、影響する試作候補を再照合する。未公開Pattern/profileや製品であっても選択条件を解釈できる場合は同じ意味で構成・検査し、未知条件は未評価として返す。非画面は根拠付き非適用とし、非画面で技術成立性不明ならPoCを省かない。

**状態・責務の負例**：生成候補からAIがbrand/prototype合意を自己承認する、生成成功をimplemented/ux_verifiedとする、039の関係や079の証拠を生成unitのpassで代替する、049の測定passを生成義務充足の代用とする、LABOを迂回してBRAINへ製品情報を昇格する例を拒否する。実行、表示計測、walkthrough、人の合意は各既存owner/契約へ残す。fixtureは静的な期待条件で、実行証拠ではない。

このpacketだけではcanonical/MPR/carry/Bindingを変更しません。090の固定案と1.0指定以外の要求採否、正式schema、UI seed全体、model/framework、実装、内部デプロイ、L3再開、実受入、旧source全移管、holding解除、要求Stage完了・Issuecloseを含めません。
