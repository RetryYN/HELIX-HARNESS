# 既存repository全資産の棚卸し・充足度mapping要求案

base `742258892f94ab5c42d9274e7732b39608abf3bb`。[JSON候補](requirements-resolution-packet.json)、SHA-256 `3644eab31167f09e3a6fa3c1f20ad60ac4ca5f71bdf5b5ac88b1bdb5c6a97632`。authority_effect: none。

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
