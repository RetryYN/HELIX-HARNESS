# P16 品質特性のtrade-off、設計判断の記録形式、viewpoint／viewの観察（D01 Software Architecture）

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
binding: [SCF-B-0156](../../../bindings/SCF-B-0156.json)
素材の状態：本書の観察はすべて「未評価の候補素材」である。外部repositoryで採られていることは、HELIXでの成立を意味しない。値（閾値、既定値、期間、件数、語数等）は持ち込まない。技術選定・採用推奨ではない。

埋めようとしたgap：[D01 Software Architecture](../../brain-domain-material-inventory-20261004/materials/D01-software-architecture.md) §4「品質特性どうしのtrade-off（性能と整合性、可用性と費用等）を並べる知識」「viewpoint／viewの定義（誰の関心事をどの図で示すか）」。

## 調べたrepository
| repo | URL | 固定commit | ライセンス(SPDX) | archived | 取得日 | 選んだ理由 |
|---|---|---|---|---|---|---|
| kubernetes/enhancements | https://github.com/kubernetes/enhancements | f7be055669b365e9b4ab3905bda6ef385e0c84ca（default branch: master） | Apache-2.0 | false | 2026-10-05 | KEP（設計提案）のtemplate、metadataのschema（Go）、検証関数、production readinessの質問票が同じrepositoryにある。判断記録の状態と置換を機械で読める形にしている例 |
| rust-lang/rfcs | https://github.com/rust-lang/rfcs | fdb511cf68e5f9262994b49c2212466b096d3870（main） | Apache-2.0 | false | 2026-10-05 | RFCのtemplateが「欠点」「根拠と代替案」「先行例」「未解決の問い」を分けている。状態をfileに持たず、PRのmergeとcloseで表す対照例 |
| python/peps | https://github.com/python/peps | 730372f74cd1c200170478fb91a9b3f07a737acd（main） | null（GitHub APIのlicenseがnull。repository rootにLICENSE fileは無く、PEPのtemplateと各PEPの末尾に「public domain or under the CC0-1.0-Universal license」と書かれている） | false | 2026-10-05 | PEP 1が状態の遷移、Resolution（判断の所在）、Rejected Ideas、置換の対のheaderを定め、lint scriptとindex生成がそれを読む。決着後の文書を「歴史文書」とし、正本を別へ移す仕組みがある |
| adr/madr | https://github.com/adr/madr | ba75bb1b20d42af5746b246ad348c202419ae681（develop） | NOASSERTION（LICENSE冒頭：「MIT OR CC0-1.0」） | false | 2026-10-05 | ADR形式の1つ。decision driver（品質特性を含む）、選択肢ごとのGood／Neutral／Bad、Confirmationを欄にしている。形式自体の変更をMADR自身で記録している |
| arc42/arc42-template | https://github.com/arc42/arc42-template | 32fd461c91b184777e14f7d66b4e46db936fd3e5（main） | NOASSERTION（LICENSE冒頭：「licensed under the Creative Commons Attribution-ShareAlike 4.0 International License」。share-alikeのため構造の観察だけにした） | false | 2026-10-05 | architecture文書の章立て。品質目標、品質scenario、判断、risk、building block／runtime／deploymentの各viewを章として分けている |
| structurizr/structurizr | https://github.com/structurizr/structurizr | c950180a64b49c46ce2c8381a08562eec088ebf8（main） | Apache-2.0 | false | 2026-10-05 | 1つのmodelから複数のviewを作るDSLとJava実装。viewごとの要素の制約、perspective（品質の観点）、ADRの取込み、文書の欠落を検査するinspectionがコードで読める |

（structurizr/javaは、metadataを取得した時点でarchived: trueだった。default branchはmaster、固定commitは5783db719d701978e3a833bd5596736e69545121、SPDXはApache-2.0。現行の実装は上表のstructurizr/structurizrにあるため、本文は読んでいない。）

## 観察

### P16-O01 判断記録のmetadataを型で定義し、状態と成熟段階の組合せを検証する（KEP）
- 出典：kubernetes/enhancements、`api/proposal.go` 行62–90（https://github.com/kubernetes/enhancements/blob/f7be055669b365e9b4ab3905bda6ef385e0c84ca/api/proposal.go#L62-L90）、行100–132（https://github.com/kubernetes/enhancements/blob/f7be055669b365e9b4ab3905bda6ef385e0c84ca/api/proposal.go#L100-L132）、行233–252（https://github.com/kubernetes/enhancements/blob/f7be055669b365e9b4ab3905bda6ef385e0c84ca/api/proposal.go#L233-L252）、`keps/NNNN-kep-template/kep.yaml` 行1–51（https://github.com/kubernetes/enhancements/blob/f7be055669b365e9b4ab3905bda6ef385e0c84ca/keps/NNNN-kep-template/kep.yaml#L1-L51）。信頼性ラベル：primary（公式source repository）。本文確認：済
- 何をしているか：
  - KEPは本文（README.md）とは別に `kep.yaml` を持ち、title、status、owning-sig、reviewers、approvers、see-also、replaces、stage、milestone、feature-gates、disable-supported、metricsを書く。
  - Goの `Proposal` 構造体がこのschemaを持ち、`validate:"required"` でtitle、番号、authors、owning-sig、approvers、statusを必須にしている。`Status` は列挙（provisional、implementable、implemented、deferred、rejected、withdrawn、replaced）、`Stage` も列挙（alpha、beta、stable、deprecated、disabled、removed）で、`IsValid()` が集合の外を拒む。
  - `Validate` は、`status: implemented` なのに `stage` がstableでないものをerrorにする。判断の状態（status）と、実装の成熟段階（stage）を別の軸として持ち、その組合せの一部だけを検査している。
- 解いている問題と前提：大量の提案を一覧・絞込みするとき、本文を読まずに状態を知る必要がある（`keps/sig-architecture/0000-kep-process/README.md` 行135–137のmetadataの目的）。判断の状態と機能の成熟は別に動く、という前提を持つ。
- 必要な入力：状態の集合、成熟段階の集合、両者の許される組合せ、所有する組織単位の一覧（`validateGroups` が照合する）。
- trade-off・失敗の仕方：型と列挙で拒めるのは書式と集合の外の値だけで、本文の妥当性は検査しない。組合せの検査は `implemented ⇒ stable` の1つしか読めず、例えば `rejected` と `stage` の組合せは検査されない。
- 反例・適用しない場合：rust-lang/rfcsは状態をfileに書かない（P16-O06）。MADRの状態は自由文字列で、列挙にしていない（P16-O10）。
- 互換・非互換：P16-O02（置換の関係）、P16-O03（段階ごとの質問票と承認）と組み合わさる。
- 限界：状態名・段階名はこのrepository固有で、HELIXの状態modelへ持ち込まない。

### P16-O02 置換（replaces／superseded-by）を双方向の欄として定めるが、対の一致は検査しない（KEP）
- 出典：kubernetes/enhancements、`keps/sig-architecture/0000-kep-process/README.md` 行192–219（https://github.com/kubernetes/enhancements/blob/f7be055669b365e9b4ab3905bda6ef385e0c84ca/keps/sig-architecture/0000-kep-process/README.md#L192-L219）、`api/proposal.go` 行117–119（https://github.com/kubernetes/enhancements/blob/f7be055669b365e9b4ab3905bda6ef385e0c84ca/api/proposal.go#L117-L119）、`keps/NNNN-kep-template/kep.yaml` 行18–22（https://github.com/kubernetes/enhancements/blob/f7be055669b365e9b4ab3905bda6ef385e0c84ca/keps/NNNN-kep-template/kep.yaml#L18-L22）、`keps/sig-network/536-topology-aware-routing/kep.yaml` 行1–15（https://github.com/kubernetes/enhancements/blob/f7be055669b365e9b4ab3905bda6ef385e0c84ca/keps/sig-network/536-topology-aware-routing/kep.yaml#L1-L15）、同 `README.md` 行30–31（https://github.com/kubernetes/enhancements/blob/f7be055669b365e9b4ab3905bda6ef385e0c84ca/keps/sig-network/536-topology-aware-routing/README.md#L30-L31）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - process文書は、新しいKEPが `replaces` に旧KEPを書き、旧KEPは `superseded-by` に新KEPを書く、と対で定める。`superseded-by` は `replaced` 状態への移行と組にする、とある。状態の定義では、`rejected` のKEPも「historical document」として残す。
  - Goの構造体は `SeeAlso`、`Replaces`、`SupersededBy` を持つ。しかし `Validate`（P16-O01）は、対の一致も、`replaced` 状態と `superseded-by` の有無の組合せも検査しない。
  - templateの `kep.yaml` は `see-also` と `replaces` を例示するが、`superseded-by` の行は無い。process文書は参照を `KEP-123` の形と書き、templateはpathの形で例示している。
  - 実例では、KEP 536の `kep.yaml` は `status: replaced` だが `superseded-by` を持たず、置換先は本文の文で示されている。
- 解いている問題と前提：判断の撤回・置換を、新旧どちらから辿っても分かるようにする。文書は消さずに残す。
- 必要な入力：新旧の判断の識別子、置換が全部か一部か（KEPの欄は区別しない）。
- trade-off・失敗の仕方：欄を定めても、対の一致を機械で確かめないと、片側だけの記録や本文だけの記録が残る（KEP 536）。process文書とtemplateで参照の書き方が違い、どちらに合わせるかが書き手に委ねられる。
- 反例・適用しない場合：PEPは `Replaces`／`Superseded-By` の対を必須の規則として書くが、lintは書式だけを見る（P16-O09）。Rustは欄を持たず、本文の注記で示す（P16-O06）。
- 互換・非互換：P16-O01の状態列挙と組み合わさる。P16-O13（structurizrのdecision link）とは、関係を欄で持つか、本文のlinkから抽出するかで異なる。
- 限界：KEPの全件について対の一致を数えてはいない。KEP 536は1例である。

### P16-O03 品質特性を、成熟段階ごとに必須となる質問票と、段階ごとの承認者で扱う（KEPのProduction Readiness Review）
- 出典：kubernetes/enhancements、`keps/NNNN-kep-template/README.md` 行453–482（https://github.com/kubernetes/enhancements/blob/f7be055669b365e9b4ab3905bda6ef385e0c84ca/keps/NNNN-kep-template/README.md#L453-L482）、行542–566（https://github.com/kubernetes/enhancements/blob/f7be055669b365e9b4ab3905bda6ef385e0c84ca/keps/NNNN-kep-template/README.md#L542-L566）、行581–653（https://github.com/kubernetes/enhancements/blob/f7be055669b365e9b4ab3905bda6ef385e0c84ca/keps/NNNN-kep-template/README.md#L581-L653）、行654–676（https://github.com/kubernetes/enhancements/blob/f7be055669b365e9b4ab3905bda6ef385e0c84ca/keps/NNNN-kep-template/README.md#L654-L676）、行677–700（https://github.com/kubernetes/enhancements/blob/f7be055669b365e9b4ab3905bda6ef385e0c84ca/keps/NNNN-kep-template/README.md#L677-L700）、行765–796（https://github.com/kubernetes/enhancements/blob/f7be055669b365e9b4ab3905bda6ef385e0c84ca/keps/NNNN-kep-template/README.md#L765-L796）、行349–413（https://github.com/kubernetes/enhancements/blob/f7be055669b365e9b4ab3905bda6ef385e0c84ca/keps/NNNN-kep-template/README.md#L349-L413）、`api/approval.go` 行36–77（https://github.com/kubernetes/enhancements/blob/f7be055669b365e9b4ab3905bda6ef385e0c84ca/api/approval.go#L36-L77）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - templateのProduction Readiness Review（PRR）の節は、品質特性を問いの形で並べる。有効化と巻戻し（Feature Enablement and Rollback）、rollout・upgrade・rollbackの失敗の仕方、監視（SLI／SLO、使われているかの判定）、依存、scalability（新しいAPI呼出し、object数・大きさの増加、資源の枯渇）、troubleshooting（API serverやetcdが使えないときの挙動、既知の失敗の仕方）である。
  - 節ごとに、どの段階で必須になるかを書いている（有効化と巻戻しはalpha、rolloutはbeta。scalabilityはalphaで推奨、betaで必須、GAでは現場の経験に基づいて前の回答を確かめる）。
  - Graduation Criteriaは、機能・security・監視・testの要求をbetaまでに満たし、GAの条件にそれらを含めない、と書く。
  - PRRの承認は別fileで、`PRRApproval` 構造体が段階（alpha、beta、stable、deprecated、removed、disabled）ごとに承認者を持つ。`ApproverForStage` は段階に対応する承認者を返し、その段階の記録が無ければerrorを返す。
- 解いている問題と前提：品質特性の検討を、提案の初回にまとめて求めるのではなく、成熟段階に合わせて求める。巻戻し（rollback）を、設計の欄として最初に書かせる。
- 必要な入力：段階の定義、段階ごとに必須の問い、段階ごとの承認者。
- trade-off・失敗の仕方：問いは品質特性ごとに独立して並び、特性どうしのtrade-off（例えばscalabilityと巻戻しの容易さの衝突）を書く欄は無い。`approval.go` には、段階のpointerがnilでないことの検証が必要というTODOがある（行39）。
- 反例・適用しない場合：MADRは段階を持たず、1つの判断を1回で記録する（P16-O10）。PEPは状態の遷移（Provisional→Final等、P16-O08）は持つが、品質特性の問いを段階ごとに課す仕組みは読んだ範囲に無い（P16-O09のSecurity Implications等は段階に結び付かない節である）。arc42は品質を文書の章（品質目標と品質scenario）として持ち、段階で区切らない（P16-O11）。
- 互換・非互換：P16-O01の `stage` と同じ段階集合を使う。P16-O11の品質scenario（刺激・環境・応答・測定）とは、問いの形か、scenarioの形かで異なる。
- 限界：段階の数、期間、件数の目安はこのrepository固有で、持ち込まない。

### P16-O04 目的と非目的、risk、欠点、代替案を別の節に分ける（KEPの本文）
- 出典：kubernetes/enhancements、`keps/NNNN-kep-template/README.md` 行176–256（https://github.com/kubernetes/enhancements/blob/f7be055669b365e9b4ab3905bda6ef385e0c84ca/keps/NNNN-kep-template/README.md#L176-L256）、行797–822（https://github.com/kubernetes/enhancements/blob/f7be055669b365e9b4ab3905bda6ef385e0c84ca/keps/NNNN-kep-template/README.md#L797-L822）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - Motivationの下にGoals（成功をどう知るか）とNon-Goals（範囲外。議論を絞るため）を置く。
  - Proposalは「何を」に留め、API設計や実装は書かない。「どう」はDesign Detailsへ分ける。
  - Risks and Mitigationsは、securityとecosystemへの影響を含めて広く考え、securityとUXを誰がreviewするかを書く。
  - Drawbacksは「なぜ実装すべきでないか」、Alternativesは「他にどの方式を考え、なぜ除いたか」を、提案ほど詳しくなくてよいとして書く。
  - Implementation Historyは、Summary・Motivationのmerge（SIGの受容）、Proposalのmerge（設計への合意）、実装開始、最初のrelease、GA、退役・置換をmilestoneとして記録する。
- 解いている問題と前提：提案の利点だけでなく、実施しない理由と除いた案を読者が同じ文書で見られるようにする。1つの文書が提案から退役まで更新され続ける前提である。
- 必要な入力：目的、範囲外、risk、欠点、検討した代替案と除外理由、履歴のmilestone。
- trade-off・失敗の仕方：代替案ごとの品質特性の比較表の形は定めておらず、除外理由は自由文である。欠点（Drawbacks）とrisk（Risks and Mitigations）の区別は書き手に委ねられる。
- 反例・適用しない場合：PEPは、決着後の文書を更新しない歴史文書として扱う（P16-O08）。KEPの本文は退役まで履歴を追記する点で異なる。
- 互換・非互換：P16-O05（Rustの節）、P16-O09（PEPの節）、P16-O10（MADRのPros and Cons）と同じ問題を別の分け方で解いている。比較は§「同じ問題の解き方の比較」。
- 限界：templateの欄の存在は、各KEPがその欄を十分に書いていることを意味しない。個々のKEPの記述の質は調べていない。

### P16-O05 「欠点」「根拠と代替案」「先行例」「未解決の問い」「将来の可能性」を分け、未解決の問いを解決の時点で分類する（Rust RFC）
- 出典：rust-lang/rfcs、`0000-template.md` 行47–103（https://github.com/rust-lang/rfcs/blob/fdb511cf68e5f9262994b49c2212466b096d3870/0000-template.md#L47-L103）、行22–45（https://github.com/rust-lang/rfcs/blob/fdb511cf68e5f9262994b49c2212466b096d3870/0000-template.md#L22-L45）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 説明を、利用者に教える形のGuide-level explanationと、他の機能との相互作用・実装・corner caseを書くReference-level explanationの2段に分ける。
  - Drawbacksは「なぜこれをすべきでないか」を書く。Rationale and alternativesは、この設計が設計空間の中でなぜ最善か、他にどの設計を考え、なぜ選ばなかったか、やらない場合の影響は何か、libraryやmacroで代替できないか、を問う。
  - Prior artは、他の言語・communityの経験を良い点・悪い点の両方で書く。ただし、他言語の先例だけでは動機にならない、とも書く。
  - Unresolved questionsは、RFCのmerge前に解く問い、安定化前に実装を通して解く問い、範囲外として将来独立に扱う問い、の3つに分ける。
  - Future possibilitiesは関連する拡張を書く欄だが、そこに書いたことは採用の理由にならない、と明記する。
- 解いている問題と前提：提案の正当化（根拠）と、却下した案の理由と、まだ決まっていないことを混ぜない。未決事項を、どの段階で決めるかで分ける。
- 必要な入力：代替案、却下理由、「やらない」場合の影響、先例、未決事項と解決の時点。
- trade-off・失敗の仕方：品質特性の名前や比較軸は欄にない。読みやすさ・保守性への影響は、Guide-levelとRationaleの問いの中で触れられるだけである。
- 反例・適用しない場合：PEPは却下した案を独立の節（Rejected Ideas）にする（P16-O09）。Rustは「根拠と代替案」を1つの節にまとめている。
- 互換・非互換：P16-O06（決定の手続き）と対になる。P16-O04のNon-Goals、P16-O09のOpen Issuesと役割が近い。
- 限界：templateの節の存在だけを観察した。個々のRFCの記述は、置換の注記（P16-O06）以外は読んでいない。

### P16-O06 状態をfileに持たず、PRのmerge／closeと「処分（disposition）」で表す。置換は本文の注記で示す（Rust RFC）
- 出典：rust-lang/rfcs、`README.md` 行100–118（https://github.com/rust-lang/rfcs/blob/fdb511cf68e5f9262994b49c2212466b096d3870/README.md#L100-L118）、行135–160（https://github.com/rust-lang/rfcs/blob/fdb511cf68e5f9262994b49c2212466b096d3870/README.md#L135-L160）、行179–189（https://github.com/rust-lang/rfcs/blob/fdb511cf68e5f9262994b49c2212466b096d3870/README.md#L179-L189）、行227–243（https://github.com/rust-lang/rfcs/blob/fdb511cf68e5f9262994b49c2212466b096d3870/README.md#L227-L243）、`text/1444-union.md` 行13（https://github.com/rust-lang/rfcs/blob/fdb511cf68e5f9262994b49c2212466b096d3870/text/1444-union.md#L13-L13）、`text/1183-swap-out-jemalloc.md` 行13（https://github.com/rust-lang/rfcs/blob/fdb511cf68e5f9262994b49c2212466b096d3870/text/1183-swap-out-jemalloc.md#L13-L13）、`text/0769-sound-generic-drop.md` 行5–10（https://github.com/rust-lang/rfcs/blob/fdb511cf68e5f9262994b49c2212466b096d3870/text/0769-sound-generic-drop.md#L5-L10）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - RFCはPRとして出され、mergeされると `text/` に置かれて「active」になる。fileの冒頭はFeature Name、Start Date、RFC PR、Rust Issueのlinkだけで、状態の欄は無い。
  - 決定の前に、subteamの誰かが処分（merge、close、postpone）を付けてfinal comment period（FCP）を提案する。長い議論では、議論の現状と主なtrade-off・対立点をまとめるsummary commentが先に置かれる。FCPに入る前にsubteam全員の署名を要する。FCP中に新しい論点が出ればFCPを取り消し、開発に戻す。
  - 決定の理由が議論から明らかでない場合、subteamが理由のcommentを足す（行200–205）。
  - mergeされた「active」は実装の優先度を意味しない。受理後の大きな変更は新しいRFCにし、元のRFCに注記を加える。小さな変更をamendmentとして扱う範囲はsubteamが決める。
  - 「postponed」はclose時のlabelで、評価も実装も将来に回すことを示す。採る見込みが無ければpostponeでなくcloseする、と区別している。
  - 置換の記録はmetadataでなく本文の注記である。実例では「superseded by」「partially superseded by」が、Summaryの直後や `History` 節に自由文で書かれている。
- 解いている問題と前提：決定の正本をPRの議論とmergeに置き、文書の中には状態を持たせない。却下・延期されたRFCはrepositoryの `text/` に入らず、PRとして残る。
- 必要な入力：処分の種類、trade-offのsummary、署名者、置換先と、置換が全部か一部か。
- trade-off・失敗の仕方：fileだけを見ても、却下された案や延期された案は分からない（PR側を読む必要がある）。置換は自由文の注記なので、機械で辿るには本文の解析が要る。注記の位置もRFCごとに違う。
- 反例・適用しない場合：KEPとPEPは状態をfileのmetadataに持つ（P16-O01、P16-O08）。
- 互換・非互換：「全部の置換」と「一部の置換」を区別して書く点は、KEPの `superseded-by`（区別しない、P16-O02）と異なる。
- 限界：GitHub上のPR、label、FCPのcommentは読んでいない。process文書の記述だけを観察した。期間などの値は持ち込まない。

### P16-O07 決着後の判断記録を「歴史文書」とし、現行の正本を別の場所へ移して印を付ける（PEP）
- 出典：python/peps、`peps/pep-0001.rst` 行467–480（https://github.com/python/peps/blob/730372f74cd1c200170478fb91a9b3f07a737acd/peps/pep-0001.rst#L467-L480）、`peps/pep-0012.rst` 行675–700（https://github.com/python/peps/blob/730372f74cd1c200170478fb91a9b3f07a737acd/peps/pep-0012.rst#L675-L700）、`pep_sphinx_extensions/pep_processor/parsing/pep_banner_directive.py` 行66–79（https://github.com/python/peps/blob/730372f74cd1c200170478fb91a9b3f07a737acd/pep_sphinx_extensions/pep_processor/parsing/pep_banner_directive.py#L66-L79）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - PEP 1は、Accepted、Final、Rejected、Supersededに達したPEPを原則として大きく変更しない、とする。決着したPEPは「living specification」ではなく歴史文書であり、期待される挙動の正式な文書はLanguage Reference、Library Reference、PyPA Specificationsなど別の場所で保守する。
  - Standards Track PEPについて、Provisionalの間、またはSteering Councilの承認のもとでAcceptedの間に、実装経験と利用者のfeedbackで変えた点は、PEPに記録し、Finalの時点の実装を正確に表すようにする（この条件の外での変更の扱いは同箇所に書かれていない）。
  - PEP 12は `canonical-doc` directive（packaging用、typing用の派生あり）を定め、現行の正本へのlinkを持つbannerをPEPの冒頭に出す。banner文は「This PEP is a historical document.」で始まる。
- 解いている問題と前提：判断の記録（なぜそう決めたか）と、現在の仕様（今どう動くか）を同じ文書に持たせると、どちらかが古くなる。判断記録は書き換えず、仕様は別に更新し続ける、という分離である。
- 必要な入力：判断記録と現行仕様の対応、現行仕様の置き場所。
- trade-off・失敗の仕方：利用者は2か所を読む必要がある。bannerが付いていないPEPでは、本文が現行仕様と一致するかを読者が判断できない。
- 反例・適用しない場合：KEPは同じfileを退役まで更新し、Implementation Historyを追記する（P16-O04）。Active状態のInformational・Process PEP（PEP 1自身など）は更新され続ける（`pep-0001.rst` 行463–464、482）。
- 互換・非互換：P16-O08（状態の遷移）とP16-O09（置換のheader）と組み合わさる。
- 限界：`canonical-doc` を使うPEPが複数あることはgrepで確かめたが、各PEPのbannerの内容や正本との一致は確かめていない。

### P16-O08 判断の状態遷移と、判断の所在（Resolution）を記録する。受理後の撤回は「未release」に限る（PEP）
- 出典：python/peps、`peps/pep-0001.rst` 行409–464（https://github.com/python/peps/blob/730372f74cd1c200170478fb91a9b3f07a737acd/peps/pep-0001.rst#L409-L464）、行616–639（https://github.com/python/peps/blob/730372f74cd1c200170478fb91a9b3f07a737acd/peps/pep-0001.rst#L616-L639）、行673–676（https://github.com/python/peps/blob/730372f74cd1c200170478fb91a9b3f07a737acd/peps/pep-0001.rst#L673-L676）、`pep_sphinx_extensions/pep_zero_generator/constants.py` 行32（https://github.com/python/peps/blob/730372f74cd1c200170478fb91a9b3f07a737acd/pep_sphinx_extensions/pep_zero_generator/constants.py#L32-L32）、`pep_sphinx_extensions/pep_zero_generator/writer.py` 行232–240（https://github.com/python/peps/blob/730372f74cd1c200170478fb91a9b3f07a737acd/pep_sphinx_extensions/pep_zero_generator/writer.py#L232-L240）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 状態はDraft、Active、Accepted、Provisional、Deferred、Rejected、Withdrawn、Final、Superseded。AcceptedからFinalへは、参照実装がmainのsource repositoryに入ったときに移る。
  - Provisionalは「暫定受理」で、実装に入った後、Python releaseに含まれた後でも、RejectedまたはWithdrawnになりうる。PEP 1は、Provisionalに頼らないよう、範囲を減らして一部を後のPEPへ回す方を好ましいとする。
  - Rejectedも「記録として残すことが重要」とする。Withdrawnは、author自身が悪い案だと判断したか、競合する案の方が良いと認めた場合である。
  - Acceptedは、実装で設計の根本的な欠陥が見つかった場合にRejected／Withdrawnへ戻せる。ただし、releaseに含まれていない場合に限り、release済みの変更は通常の非推奨の手続き（新しいPEPが要ることもある）を経る。
  - 行439–442は、Accepted、Rejected、Withdrawnになったとき、状態の更新に加えて少なくとも `Resolution` headerに判断を述べた投稿へのlinkを足す、と書く。一方、header一覧の注（行673–676）は `Resolution` headerを「Standards Track PEPだけ必須」とする。両者の関係（Informational・Process PEPで439–442の「at the very least」をどこまで求めるか）は、読んだ範囲では明示されていない。
  - index生成は、Rejected、Withdrawn、Supersededを「dead」の集合にまとめ、1つの区分に並べる。
- 解いている問題と前提：判断が覆る経路と、覆せない時点（release）を状態の規則として書く。判断そのものの文面は、PEPの外（議論の場）にあり、PEPはそのlinkを持つ。
- 必要な入力：状態の集合、遷移の条件（参照実装、release）、判断の所在のURL。
- trade-off・失敗の仕方：Provisionalは、release後に撤回されうるため、利用者側で版の互換の問題を起こしうる（PEP 1自身がそう書いている）。
- 反例・適用しない場合：KEPは `status` と `stage` を別の軸に分け（P16-O01）、PEPは1つの状態にまとめる。Rustは状態をfileに持たない（P16-O06）。
- 互換・非互換：P16-O07（決着後の扱い）、P16-O09（置換のheader）と組み合わさる。
- 限界：状態名、遷移図（`pep-0001/process_flow.svg`）は読んだ範囲で観察した。svgの図そのものは読んでいない。

### P16-O09 Rationale、Rejected Ideas、Open Issues、互換性、securityを別の節にし、置換の対をheaderで持つ。lintは書式だけを見る（PEP）
- 出典：python/peps、`peps/pep-0001.rst` 行518–575（https://github.com/python/peps/blob/730372f74cd1c200170478fb91a9b3f07a737acd/peps/pep-0001.rst#L518-L575）、行707–711（https://github.com/python/peps/blob/730372f74cd1c200170478fb91a9b3f07a737acd/peps/pep-0001.rst#L707-L711）、`peps/pep-0012/pep-NNNN.rst` 行37–98（https://github.com/python/peps/blob/730372f74cd1c200170478fb91a9b3f07a737acd/peps/pep-0012/pep-NNNN.rst#L37-L98）、`check-peps.py` 行58–74（https://github.com/python/peps/blob/730372f74cd1c200170478fb91a9b3f07a737acd/check-peps.py#L58-L74）、行183–200（https://github.com/python/peps/blob/730372f74cd1c200170478fb91a9b3f07a737acd/check-peps.py#L183-L200）、行359–369（https://github.com/python/peps/blob/730372f74cd1c200170478fb91a9b3f07a737acd/check-peps.py#L359-L369）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - Rationaleは、設計判断の理由、検討した別の設計、関連する仕事（他言語での扱い）を書き、community内の合意の証拠と、議論で出た重要な反対・懸念を扱う。
  - Rejected Ideasは、議論で出て採られなかった案を理由とともに記録する。PEP 1はその目的を、最終版に至る思考の記録と、同じ却下案の再提起の防止とし、Rationaleから「なぜ採らなかったか」だけを切り出した節と位置づける。
  - Open Issuesは、draftの間に出た未決の論点を記録する。Backwards Compatibilityは非互換の内容と深刻度と対処を書き、不十分なら却下されうる。Security Implicationsは懸念を明示する。templateにはChange History（大きな変更の要約を新しい順に）もある。
  - `Superseded-By` は、後の文書で古くなったことを示し、新しいPEPは `Replaces` を持たなければならない、と対で定める。
  - `check-peps.py` は必須header、状態の集合、headerごとの書式を検査する。`Requires`／`Replaces`／`Superseded-By` については、PEP番号の書式とcomma区切りを検査する関数だけを呼ぶ（読んだ範囲では、相手側のPEPに対のheaderがあるかは見ていない）。
- 解いている問題と前提：採った案の根拠と、採らなかった案の理由と、まだ決まっていないことを、読者が別々に探せるようにする。
- 必要な入力：却下した案と理由、未決の論点、非互換とその深刻度、security上の懸念、置換の相手。
- trade-off・失敗の仕方：Rationaleと Rejected Ideasの境は書き手の判断である。対のheaderの一致は規則として書かれているが、lintが見る範囲は書式である（KEPと同じ構図、P16-O02）。
- 反例・適用しない場合：Rustは却下理由を「Rationale and alternatives」に含める（P16-O05）。MADRは選択肢ごとにGood／Neutral／Badを並べる（P16-O10）。
- 互換・非互換：P16-O07、P16-O08と組み合わさる。
- 限界：`pep_sphinx_extensions` のheader処理（`pep_headers.py`）は、置換関係のlink化の箇所の存在だけを確認し、本文は読んでいない。

### P16-O10 decision driverに品質特性を置き、選択肢ごとにGood／Neutral／Badを並べ、確認方法（Confirmation）を持つ（MADR）
- 出典：adr/madr、`template/adr-template.md` 行1–73（https://github.com/adr/madr/blob/ba75bb1b20d42af5746b246ad348c202419ae681/template/adr-template.md#L1-L73）、`docs/decisions/0014-allow-neutral-arguments.md` 行7–47（https://github.com/adr/madr/blob/ba75bb1b20d42af5746b246ad348c202419ae681/docs/decisions/0014-allow-neutral-arguments.md#L7-L47）、`docs/decisions/0016-outcome-before-detailed-pros-cons.md` 行7–28（https://github.com/adr/madr/blob/ba75bb1b20d42af5746b246ad348c202419ae681/docs/decisions/0016-outcome-before-detailed-pros-cons.md#L7-L28）、`docs/decisions/0018-use-confirmation-as-heading.md` 行7–34（https://github.com/adr/madr/blob/ba75bb1b20d42af5746b246ad348c202419ae681/docs/decisions/0018-use-confirmation-as-heading.md#L7-L34）、`docs/decisions/0009-support-links-between-adrs-inside-an-adrs.md` 行7–50（https://github.com/adr/madr/blob/ba75bb1b20d42af5746b246ad348c202419ae681/docs/decisions/0009-support-links-between-adrs-inside-an-adrs.md#L7-L50）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - front matterにstatus（例示は proposed、rejected、accepted、deprecated、「superseded by ADR-xxxx」の形）、date、decision-makers、consulted、informedを持つ。いずれも任意で、statusは列挙ではなく自由文字列である。consultedとinformedは、双方向の相談相手と一方向の通知先を区別する。
  - Context and Problem Statementで、判断の範囲を構造要素（component、connector等）を指して明示するよう促す。
  - Decision Driversの例示は「望む品質特性、関心事、制約、force」である。Considered Optionsを並べ、Decision Outcomeで選んだ案とその理由（k.o.基準を満たす唯一の案、forceを解く、比較で最良、等）を書く。
  - ConsequencesはGood／Badで、品質特性の改善と犠牲を書く。Pros and Cons of the Optionsは選択肢ごとにGood、Neutral、Badを並べる。0014は「どの品質特性に正・負の効果があるか」「どのdecision driverを満たさないか」を論拠の例として挙げる。
  - 0016は、結論を詳細なPros and Consより前に置く、と決めた（読者がまず結論を見られる。論理の流れが崩れる欠点は記録されている）。
  - Confirmationは、実装が判断に沿っているかの確かめ方（review、fitness function、ArchUnit等のtest）を書く欄である。0018は、「validation」はtemplateの範囲外、「verification」は形式的な手続きに結び付きやすい、として「Confirmation」の語を選んだ。
  - 0009は、ADR間のlinkを「More Information」に自由に書く案を選んだ（parseが難しくなる欠点を記録している）。表で持つ案には「どのlinkが置換済みかが不明」という欠点が挙がっている。
- 解いている問題と前提：品質特性を判断の入力（driver）として先に挙げ、選択肢ごとの正・負・中立の効果として比較する。判断後に、実装が沿っているかを確かめる手段まで同じ記録に持たせる。
- 必要な入力：decision driver（品質特性・制約）、選択肢、選択肢ごとの論拠、確認の手段、関係者の区分。
- trade-off・失敗の仕方：品質特性どうしのtrade-offは、選択肢ごとのGood／Badの並びから読者が読み取る形で、「どの特性をどの特性と引き換えたか」を書く専用の欄は無い。statusが自由文字列のため、置換の関係は文字列とlinkの解析に頼る（P16-O13のimporterの挙動）。
- 反例・適用しない場合：KEPは品質特性を段階ごとの問いとして扱う（P16-O03）。arc42は品質を判断とは別の章（品質目標、品質scenario）に置く（P16-O11）。
- 互換・非互換：MADRのADRはstructurizrに取り込める（P16-O14）。arc42は判断の章でADR（Nygard形式。Cognitectの記事へのlink）を形の1つに挙げる（P16-O11）。MADRはその派生と読めるが、これは推論で、arc42のtemplateはMADRを名指ししていない。
- 限界：MADR自身の判断記録（`docs/decisions/`）は形式についての判断であり、architectureの判断の実例ではない。

### P16-O11 品質目標→品質要求の木→品質scenarioの段階と、判断・riskの章を分ける（arc42）
- 出典：arc42/arc42-template、`EN/adoc/01_introduction_and_goals.adoc` 行48–69（https://github.com/arc42/arc42-template/blob/32fd461c91b184777e14f7d66b4e46db936fd3e5/EN/adoc/01_introduction_and_goals.adoc#L48-L69）、`EN/adoc/10_quality_requirements.adoc` 行11–99（https://github.com/arc42/arc42-template/blob/32fd461c91b184777e14f7d66b4e46db936fd3e5/EN/adoc/10_quality_requirements.adoc#L11-L99）、`EN/adoc/04_solution_strategy.adoc` 行10–26（https://github.com/arc42/arc42-template/blob/32fd461c91b184777e14f7d66b4e46db936fd3e5/EN/adoc/04_solution_strategy.adoc#L10-L26）、`EN/adoc/09_architecture_decisions.adoc` 行10–29（https://github.com/arc42/arc42-template/blob/32fd461c91b184777e14f7d66b4e46db936fd3e5/EN/adoc/09_architecture_decisions.adoc#L10-L29）、`EN/adoc/11_technical_risks.adoc` 行10–19（https://github.com/arc42/arc42-template/blob/32fd461c91b184777e14f7d66b4e46db936fd3e5/EN/adoc/11_technical_risks.adoc#L10-L19）。信頼性ラベル：primary。本文確認：済（CC BY-SA 4.0のため構造だけを書く）
- 何をしているか：
  - 第1章の品質目標は、主要なstakeholderにとって最重要の品質目標を、優先順位付きの表と具体的なscenarioで書く。project目標と混同しないよう注意し、ISO 25010の分類図を参照する。
  - 第10章は、第1章の目標を参照し、それより重要度の低い品質要求も含める。概要（10.1）は分類ごとの表、mindmap、品質特性の木（Bass+21の「Quality Attribute Utility Tree」を名指し）で書く。
  - 品質scenario（10.2）は、品質要求を受入れ基準として判定できるようにする。種類は利用scenario（実行時の刺激への反応）と変更scenario（変更・拡張の効果）。形は短い形（背景、刺激、測定）と長い形（ID、名前、source、stimulus、environment、artifact、response、response measure）の2つを並べる。
  - 判断は2か所に分かれる。第4章（solution strategy）は、主要な品質目標をどう達成するかを含む基本判断を短く書く。第9章は、重要・高価・大規模・高riskの判断を根拠とともに書き、形としてADR、重要度順の表、判断ごとの節を挙げる。第4章との重複を避けるよう求める。
  - 第11章は、技術riskと技術的負債を優先順位付きで書き、軽減策を添える。
- 解いている問題と前提：品質を、目標（少数・最重要）、要求の分類（木）、判定可能なscenario（受入れ基準）の段階で詳しくしていく。判断とriskは品質とは別の章で、相互参照する。
- 必要な入力：stakeholder、品質の分類、scenarioの要素、判断、risk。
- trade-off・失敗の仕方：templateは、scenarioどうしの衝突（trade-off点）や、判断が影響する品質特性（感度点）を書く欄を持たない。品質の章と判断の章の対応は、書き手の相互参照に委ねられる。
- 反例・適用しない場合：MADRは品質特性を個々の判断のdriverとして書く（P16-O10）。KEPは段階ごとの問いにする（P16-O03）。
- 互換・非互換：P16-O12（view）と同じtemplateの別の章。第9章はADR（Nygard形式。Cognitectの記事へのlink、`09_architecture_decisions.adoc` 行27）を形の1つに挙げる。P16-O10のMADRはその派生と読めるが、これは推論で、templateはMADRを名指ししていない。
- 限界：品質目標の件数の目安など、templateにある値は持ち込まない。参照先のQ42 modelやdocs.arc42.orgは読んでいない。

### P16-O12 view（building block、runtime、deployment）を章として固定し、stakeholderの文書への期待を表にする（arc42）
- 出典：arc42/arc42-template、`EN/adoc/05_building_block_view.adoc` 行11–35（https://github.com/arc42/arc42-template/blob/32fd461c91b184777e14f7d66b4e46db936fd3e5/EN/adoc/05_building_block_view.adoc#L11-L35）、`EN/adoc/06_runtime_view.adoc` 行10–32（https://github.com/arc42/arc42-template/blob/32fd461c91b184777e14f7d66b4e46db936fd3e5/EN/adoc/06_runtime_view.adoc#L10-L32）、`EN/adoc/07_deployment_view.adoc` 行11–37（https://github.com/arc42/arc42-template/blob/32fd461c91b184777e14f7d66b4e46db936fd3e5/EN/adoc/07_deployment_view.adoc#L11-L37）、`EN/adoc/01_introduction_and_goals.adoc` 行72–112（https://github.com/arc42/arc42-template/blob/32fd461c91b184777e14f7d66b4e46db936fd3e5/EN/adoc/01_introduction_and_goals.adoc#L72-L112）。信頼性ラベル：primary。本文確認：済（CC BY-SA 4.0のため構造だけを書く）
- 何をしているか：
  - building block viewは、静的な分解（module、component、subsystem等）と依存を、black boxとwhite boxの階層（Level 1が全体のwhite box、Level 2以降が選んだ要素の内部）で書く。全てのarchitecture文書で必須とする。
  - runtime viewは、重要なuse case、重要な外部interfaceでの相互作用、起動・停止、error・例外を、scenarioで書く。選ぶ基準を「architecture上の重要性」とし、網羅ではなく代表を選ぶよう求める。静的modelを読まない（読めない）stakeholder向けである、と書く。
  - deployment viewは、実行基盤と、software要素から基盤要素への対応（mapping）を書き、環境（開発、test、本番）ごとに書くよう求める。
  - 第1章のstakeholder表は、役割ごとに「architecture文書への期待」を書き、機能・品質要求を繰り返さず、文書の必要を書くよう求める。例示の表は、役割ごとにどの章（building block、runtime、deployment、risk、判断等）が要るかを結び付けている。
- 解いている問題と前提：誰（stakeholder）がどの関心でどのviewを読むかを、文書の章立てとstakeholder表で示す。ISO/IEC/IEEE 42010の「viewpoint」の語は使っていない。
- 必要な入力：stakeholderと文書への期待、要素の階層、代表scenario、基盤と対応関係。
- trade-off・失敗の仕方：viewの種類はtemplateで固定され、関心事ごとに新しいviewpoint（例えばsecurity viewpoint）を定義する仕組みは無い。stakeholder表とviewの対応は例示の文中にあり、欄としては持たない。
- 反例・適用しない場合：structurizrは、1つのmodelから種類の決まったviewを複数作り、品質の観点はperspectiveとして要素に付ける（P16-O13・O14）。
- 互換・非互換：P16-O11（品質と判断の章）と同じtemplateに含まれる。building blockの階層はstructurizrのsystem context／container／componentの段階（P16-O13）に近いが、段の名前と数は異なる。
- 限界：図の表記は自由（UML、BPMN、状態機械等）とされ、表記の規則は観察対象にしていない。

### P16-O13 1つのmodelから種類の決まったviewを作り、view種別ごとに置ける要素を型で制限する。品質の観点はperspectiveとして要素に付ける（Structurizr）
- 出典：structurizr/structurizr、`structurizr-core/src/main/java/com/structurizr/view/ContainerView.java` 行188–209（https://github.com/structurizr/structurizr/blob/c950180a64b49c46ce2c8381a08562eec088ebf8/structurizr-core/src/main/java/com/structurizr/view/ContainerView.java#L188-L209）、`structurizr-core/src/main/java/com/structurizr/view/SystemContextView.java` 行98–105（https://github.com/structurizr/structurizr/blob/c950180a64b49c46ce2c8381a08562eec088ebf8/structurizr-core/src/main/java/com/structurizr/view/SystemContextView.java#L98-L105）、`structurizr-dsl/src/main/java/com/structurizr/dsl/StructurizrDslTokens.java` 行47–55（https://github.com/structurizr/structurizr/blob/c950180a64b49c46ce2c8381a08562eec088ebf8/structurizr-dsl/src/main/java/com/structurizr/dsl/StructurizrDslTokens.java#L47-L55）、`structurizr-core/src/main/java/com/structurizr/model/Perspective.java` 行6–15（https://github.com/structurizr/structurizr/blob/c950180a64b49c46ce2c8381a08562eec088ebf8/structurizr-core/src/main/java/com/structurizr/model/Perspective.java#L6-L15）、`structurizr-core/src/main/java/com/structurizr/model/ModelItem.java` 行233–240（https://github.com/structurizr/structurizr/blob/c950180a64b49c46ce2c8381a08562eec088ebf8/structurizr-core/src/main/java/com/structurizr/model/ModelItem.java#L233-L240）、行242–245（https://github.com/structurizr/structurizr/blob/c950180a64b49c46ce2c8381a08562eec088ebf8/structurizr-core/src/main/java/com/structurizr/model/ModelItem.java#L242-L245。名前の例「Security」と一意であることのcomment）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - DSLのview種別は、systemLandscape、systemContext、container、component、dynamic、deployment、filtered、image、customである。viewはmodelの要素を参照して作り、要素をview側に複製しない。
  - view種別ごとに `checkElementCanBeAdded` が置ける要素を制限する。system context viewは人、software system、`CustomElement` を受け付け、それ以外は `ElementNotPermittedInViewException` になる（例外のmessageは「人とsoftware systemだけ」と書くが、条件は `CustomElement` も通す）。container viewも、人と `CustomElement` を無条件に受け付ける（行190–192）。container viewは、範囲のsoftware system自身を置けず、親と子を同時に置くことも検査する（`checkParentAndChildrenHaveNotAlreadyBeenAdded`）。
  - `Perspective` は要素と関係に付ける「architectural perspective」（commentはviewpoints-and-perspectivesの文献を参照する）で、名前（例として「Security」）、説明、値、またはURLから取る動的な値を持つ。1つの要素に同名のperspectiveは1つだけである（`addPerspective` が重複を拒む）。
- 解いている問題と前提：同じ構造を、詳しさの違う複数の図で示しても食い違わないよう、図をmodelの射影にする。品質の関心事（security等）は、新しいview種別ではなく、要素ごとの属性として持つ。
- 必要な入力：要素の型の階層（人、software system、container、component、deployment node等）、関係、perspectiveの名前と値。
- trade-off・失敗の仕方：view種別が固定されているため、関心事ごとのviewpointを利用者が新しく定義することはできない（customとfilteredで部分的に補う）。perspectiveは要素ごとの名前と値で、perspectiveどうしの衝突やtrade-offを表す構造は無い。
- 反例・適用しない場合：arc42はviewを文書の章として持ち、modelを前提にしない（P16-O12）。
- 互換・非互換：P16-O14（判断の取込みと検査）と同じworkspaceに入る。
- 限界：DSLの言語仕様の文書は別のsite（docs.structurizr.com）にあり、読んでいない。dynamic、deployment、filtered viewの制約は読んでいない。

### P16-O14 判断記録（ADR）を外部の形式からworkspaceへ取り込み、「viewに無い要素」「判断の無い構成」を検査する。欠けた状態の既定は形式ごとに違う（Structurizr）
- 出典：structurizr/structurizr、`structurizr-dsl/src/main/java/com/structurizr/dsl/DecisionsParser.java` 行8–51（https://github.com/structurizr/structurizr/blob/c950180a64b49c46ce2c8381a08562eec088ebf8/structurizr-dsl/src/main/java/com/structurizr/dsl/DecisionsParser.java#L8-L51）、`structurizr-import/src/main/java/com/structurizr/importer/documentation/MadrDecisionImporter.java` 行21–31（https://github.com/structurizr/structurizr/blob/c950180a64b49c46ce2c8381a08562eec088ebf8/structurizr-import/src/main/java/com/structurizr/importer/documentation/MadrDecisionImporter.java#L21-L31）、行165–198（https://github.com/structurizr/structurizr/blob/c950180a64b49c46ce2c8381a08562eec088ebf8/structurizr-import/src/main/java/com/structurizr/importer/documentation/MadrDecisionImporter.java#L165-L198）、`structurizr-import/src/main/java/com/structurizr/importer/documentation/AdrToolsDecisionImporter.java` 行36–46（https://github.com/structurizr/structurizr/blob/c950180a64b49c46ce2c8381a08562eec088ebf8/structurizr-import/src/main/java/com/structurizr/importer/documentation/AdrToolsDecisionImporter.java#L36-L46）、行160–211（https://github.com/structurizr/structurizr/blob/c950180a64b49c46ce2c8381a08562eec088ebf8/structurizr-import/src/main/java/com/structurizr/importer/documentation/AdrToolsDecisionImporter.java#L160-L211）、`structurizr-core/src/main/java/com/structurizr/documentation/Decision.java` 行12–19（https://github.com/structurizr/structurizr/blob/c950180a64b49c46ce2c8381a08562eec088ebf8/structurizr-core/src/main/java/com/structurizr/documentation/Decision.java#L12-L19）、行99–103（https://github.com/structurizr/structurizr/blob/c950180a64b49c46ce2c8381a08562eec088ebf8/structurizr-core/src/main/java/com/structurizr/documentation/Decision.java#L99-L103）、`structurizr-core/src/main/java/com/structurizr/documentation/Documentable.java` 行3–8（https://github.com/structurizr/structurizr/blob/c950180a64b49c46ce2c8381a08562eec088ebf8/structurizr-core/src/main/java/com/structurizr/documentation/Documentable.java#L3-L8）、`structurizr-inspection/src/main/java/com/structurizr/inspection/model/ElementNotIncludedInAnyViewsInspection.java` 行30–37（https://github.com/structurizr/structurizr/blob/c950180a64b49c46ce2c8381a08562eec088ebf8/structurizr-inspection/src/main/java/com/structurizr/inspection/model/ElementNotIncludedInAnyViewsInspection.java#L30-L37）、`structurizr-inspection/src/main/java/com/structurizr/inspection/model/SoftwareSystemDecisionsInspection.java` 行13–20（https://github.com/structurizr/structurizr/blob/c950180a64b49c46ce2c8381a08562eec088ebf8/structurizr-inspection/src/main/java/com/structurizr/inspection/model/SoftwareSystemDecisionsInspection.java#L13-L20）、`structurizr-inspection/src/main/java/com/structurizr/inspection/PropertyBasedSeverityStrategy.java` 行94–110（https://github.com/structurizr/structurizr/blob/c950180a64b49c46ce2c8381a08562eec088ebf8/structurizr-inspection/src/main/java/com/structurizr/inspection/PropertyBasedSeverityStrategy.java#L94-L110）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - DSLの `!decisions <path> <type|fqn>` は、adrtools、madr、log4brainsの3形式のimporterを名前で選ぶ。種別を省くとadrtoolsのimporterになる。3つの名前に当たらない値は、そのままclassの完全修飾名として扱われ（行46）、利用者が任意のimporterを指定できる。
  - `Decision` はid、title、date、status（文字列）、他のdecisionへのlink（id、説明）を持つ。自分自身へのlinkは足さない。decisionはworkspace、software system、container、componentに付けられる（`Documentable` を実装するclass。ただし `Documentable` のcommentは「workspaces and software systems」とだけ書き、実装と一致していない）。
  - 状態が書かれていない場合の既定が形式ごとに違う。MADRのimporterはfront matterに `status:` が無ければ「accepted」とする。adr-toolsのimporterは `## Status` 節が無ければ「Proposed」とし、古い綴り「Superceded」を「Superseded」に正規化する。
  - linkの抽出も形式ごとに違う。MADRは本文中の全てのMarkdown linkのうち、取り込んだdecisionのfile名に一致するものを、既定の説明でlinkにする。adr-toolsは `## Status` 節から `## Context` までの行だけを読み、link前の文を関係の説明（例えば置換）として取る。
  - inspectionは、どのviewにも含まれない要素（`model.element.noview`）と、containerを持つのにdecisionが無いsoftware system（`model.softwaresystem.decisions`）を違反として報告する。重大度はworkspace、model、要素の階層のpropertyで上書きでき、具体的な型名から `*` の上位へ順に探し、見つからなければerrorとする。
- 解いている問題と前提：判断記録をarchitecture modelの要素に結び付け、modelと図と判断の欠落を同じ検査にかける。判断記録の形式は外部に任せ、取り込む側で正規化する。
- 必要な入力：判断記録の形式、記録を付ける要素、検査の重大度の設定。
- trade-off・失敗の仕方：状態が無い記録は、MADRでは「受理済み」、adr-toolsでは「提案中」として取り込まれる。同じ「欠け」が形式によって逆の意味になる。MADRのlinkは関係の種類（置換か、参照か）を区別しない。
- 反例・適用しない場合：KEPとPEPは、置換の関係を専用の欄で持つ（P16-O02、P16-O09）。
- 互換・非互換：P16-O10（MADR）の記録をこの経路で読む。P16-O13のmodelと同じworkspaceに入る。
- 限界：`Log4brainsDecisionImporter` と `AbstractDecisionImporter` の本文は読んでいない。inspectionを実行して結果を見てはいない（コードを読んだだけ）。

## 同じ問題の解き方の比較
| 問題 | repoA のやり方 | repoB のやり方 | 違いが生じる前提 |
|---|---|---|---|
| 判断の状態を何で表すか | KEP：`kep.yaml` の列挙＋成熟段階を別の軸にし、型で検証（O01）。PEP：headerの1つの状態、lintが集合を検査（O08・O09） | Rust：fileに持たず、PRのmerge／closeと処分labelで表す（O06）。MADR：任意・自由文字列のfront matter（O10） | 一覧・絞込みを機械でするか。決定の正本を文書に置くかPRに置くか |
| 置換・撤回の記録 | KEP：`replaces`／`superseded-by` の対（O02）。PEP：`Replaces`／`Superseded-By` の対（O09） | Rust：本文の注記で、全部か一部かを区別（O06）。MADR：statusの文字列とMarkdown link（O10・O14） | 対の一致を機械で確かめるか（読んだ範囲ではどれも書式まで）。一部の置換を表すか |
| 却下した案と理由 | KEP：Alternatives（除外理由）とDrawbacks（O04）。Rust：Rationale and alternatives（O05） | PEP：Rejected Ideasを独立の節にし、再提起の防止を目的に挙げる（O09）。MADR：選択肢ごとのGood／Neutral／Bad（O10） | 却下理由を根拠の一部とみるか、独立の索引とみるか |
| 未決事項 | Rust：解決の時点（RFC中、安定化前、範囲外）で3分類（O05） | PEP：Open Issues（O09）。KEP：段階ごとに必須になる節で、未記入を許す時期を決める（O03） | 判断を段階的に固めるか、1回で固めるか |
| 品質特性の扱い | KEP：段階ごとに必須の問い（巻戻し、監視、scalability、troubleshooting）（O03） | arc42：目標→木→scenarioの段階（O11）。MADR：判断ごとのdriverと選択肢ごとの正負（O10）。Structurizr：要素ごとのperspective（O13） | 品質を判断の入力にするか、文書の章にするか、modelの属性にするか |
| 判断記録と現行仕様の関係 | PEP：決着後は歴史文書、正本は別へ移しbannerで示す（O07） | KEP：同じfileを退役まで更新し履歴を追記（O04）。Rust：大きな変更は新しいRFC、元に注記（O06） | 判断の記録と現在の仕様を同じ文書に持つか |
| 判断の確認 | MADR：Confirmation（review、fitness function、test）（O10） | KEP：PRR承認を段階ごとに別fileで記録（O03）。Structurizr：判断の欠落をinspectionで報告（O14） | 判断に実装が沿っているかを誰がいつ確かめるか |
| viewの定義 | arc42：building block、runtime、deploymentを章で固定し、stakeholderの期待を表にする（O12） | Structurizr：1つのmodelから種類の決まったviewを射影し、型で要素を制限（O13） | 図をmodelから生成するか、文書として書くか |

## 見つからなかったこと・gap
- 品質特性どうしのtrade-off（ATAMの感度点・trade-off点に当たるもの）を書く専用の欄は、6 repositoryのどれにも見つからなかった。trade-offは、MADRの選択肢ごとのGood／Bad、KEPのDrawbacksとRisks、RustのDrawbacksとRationale、arc42のrisk章に分かれて書かれ、「どの特性をどの特性と引き換えたか」は読み手が組み立てる。RustのREADMEは、FCPの前に「主なtrade-offと対立点」をsummary commentにまとめる手続きを書くが、そのcommentは文書の欄ではなくPR上にある（読んでいない）。
- ISO/IEC/IEEE 42010の意味でのviewpoint（関心事→viewpoint→viewの定義）を、利用者が新しく定義する仕組みは見つからなかった。arc42とStructurizrはviewの種類を固定し、品質の関心事はStructurizrではperspective（要素の属性）、arc42ではstakeholder表と品質章に置く。`viewpoint` の語は、arc42のEN版adoc、MADR、structurizrのJava・Markdownの範囲では、Structurizrの `Perspective.java` のcomment中のURLにだけ出た（structurizrの同梱static jsにも同じ文字列が出るが、図の描画の変数名で、viewpointの概念とは関係がない）。
- 置換関係の双方向の一致を機械で検査する実装は見つからなかった。KEPの `Validate` とPEPの `check-peps.py` は、読んだ範囲では書式と集合だけを検査する。KEPの実例（KEP 536）では、`status: replaced` でも `superseded-by` が無かった。
- 判断の「影響範囲」を構造要素に結び付ける欄は、MADRのContext（構造要素を指すよう促す文）とStructurizrのdecisionの付け先（workspace、system、container、component）だけで、KEP・PEP・Rustは本文の自由記述である。KEPの `participating-sigs` は組織の範囲で、構造の範囲ではない。
- 却下・延期した案の記録の置き場所は、repositoryで割れる。KEPとPEPは文書を残し（rejected、Rejected）、Rustはrepository外のPRに残す。Rustで却下されたRFCのPRは読んでいない。

## 検索範囲と結果（読んだpath、検索した語、読んでいないもの）
- 方法：6 repositoryを作業用の一時領域へ `git clone --filter=blob:none --no-checkout` し、固定commitをcheckout（core.hooksPathを無効化）。読むだけで、build・test・script・hook・package managerは実行していない（`check-peps.py`、`generate-book.py`、Makefile、Maven wrapper、Go codeを含む）。metadataは `gh api repos/<owner>/<repo>` で取得した。
- kubernetes/enhancements：`keps/NNNN-kep-template/README.md`（見出し全体、176–256、349–482、542–566、677–700、797–830）、`keps/NNNN-kep-template/kep.yaml`（全体）、`keps/sig-architecture/0000-kep-process/README.md`（133–230、見出し）、`api/proposal.go`（33–140、225–256）、`api/approval.go`（17–80）、`keps/prod-readiness/` 配下のyaml 1件、`keps/sig-network/536-topology-aware-routing/kep.yaml`（1–30）と同 `README.md`（30–31）、`keps/sig-storage/2451-service-account-token-volumes/kep.yaml`（status行）。`status: replaced`、`superseded-by`、`replaces:` をgrepした。読んでいないもの：`cmd/`・`pkg/` の検証tool本体、`keps/sig-architecture/1194-prod-readiness`、個別KEPの本文の大半。
- rust-lang/rfcs：`0000-template.md`（全体）、`README.md`（100–250）、`text/1444-union.md`（1–16）、`text/1183-swap-out-jemalloc.md`（1–16）、`text/0769-sound-generic-drop.md`（1–14）、`text/1201-naked-fns.md`（supersedの行）。`text/` 全体を「superseded by」でgrepした。読んでいないもの：`lang_changes.md`・`libs_changes.md`・`compiler_changes.md`（subteam別の基準）、GitHubのPR・FCPのcomment。
- python/peps：`peps/pep-0001.rst`（400–482、500–580、615–740、grepの該当行）、`peps/pep-0012.rst`（675–700）、`peps/pep-0012/pep-NNNN.rst`（全体）、`check-peps.py`（40–75、183–200、328–332、355–372、429–440）、`pep_sphinx_extensions/pep_processor/parsing/pep_banner_directive.py`（60–95）、`pep_sphinx_extensions/pep_zero_generator/constants.py`（25–35）、`writer.py`（232–245）。`canonical-doc` を使うPEPを数えた。読んでいないもの：`pep-0001/process_flow.svg`、`pep_headers.py` の本文、個別PEPの本文。
- adr/madr：`template/adr-template.md`（全体）、`docs/decisions/0008`（1–60）、`0009`（全体）、`0014`（全体）、`0016`（全体）、`0018`（全体）、LICENSE冒頭。読んでいないもの：`template/` の他の3 template、`docs/decisions/` の他の判断、`docs/tooling.md`。
- arc42/arc42-template：`EN/adoc/01`（40–121）、`04`（全体）、`05`（1–80）、`06`（6–35）、`07`（6–45）、`09`（全体）、`10`（全体）、`11`（全体）、LICENSE冒頭。読んでいないもの：`02`・`03`・`08`・`12`、他言語版、docs.arc42.org、Q42 model。
- structurizr/structurizr：`structurizr-core` の `documentation/Decision.java`（全体）、`Documentable.java`（全体）、`model/Perspective.java`（1–80）、`model/ModelItem.java`（215–245）、`view/ContainerView.java`（185–212）、`view/SystemContextView.java`（95–106）、`structurizr-dsl` の `DecisionsParser.java`（全体）、`StructurizrDslTokens.java`（grepの該当行）、`README.md`、`structurizr-import` の `MadrDecisionImporter.java`（160–207）、`AdrToolsDecisionImporter.java`（36–50、158–215）、`structurizr-inspection` の `ElementNotIncludedInAnyViewsInspection.java`、`SoftwareSystemDecisionsInspection.java`、`WorkspaceScopeInspection.java`、`PropertyBasedSeverityStrategy.java`（1–145）。読んでいないもの：`Log4brainsDecisionImporter.java`、`AbstractDecisionImporter.java`、`ComponentView.java` の本体、dynamic・deployment・filtered view、DSLの言語仕様文書（別site）。
- 検索した語：`trade-off`／`tradeoff`／`trade off`（KEP template・process、PEP 1、Rust template・README、arc42 EN、MADR、structurizr）、`viewpoint`（arc42 ENのadoc、MADRとstructurizrのJava・Markdown）、`supersed`、`replaces`、`Rejected`、`Resolution`、`canonical-doc`、`Perspective`、`checkElementCanBeAdded`、`status`。
- 選ばなかった候補：structurizr/java（archived。現行はstructurizr/structurizrへ移っている）、npryce/adr-tools・thomvaill/log4brains（MADRとstructurizrのimporterで形式の違いを見られたため、本体は読んでいない）、ISO/IEC/IEEE 42010の規格本文（有償で、公式source repositoryではない）。

## BRAINの属性について未決の事項（由来の種類、scope、評価根拠、版、状態）
- 由来の種類：すべて外部OSSの固定commitから観察した記録（primary source）である。ただし性質が2種類ある。KEP・PEP・Rust・arc42・MADRのtemplateと手続き文書は「規範として書かれた形式」で、Go・Python・Javaのコード（KEPの `Validate`、`check-peps.py`、structurizrのimporter・inspection）は「実際に機械が確かめている範囲」である。両者が食い違う点（置換の対の一致、`Documentable` のcomment）を、知識recordでどちらの由来として持つかは未決。
- scope：観察した判断記録は、OSSの言語・platformの機能提案（KEP、PEP、RFC）と、一般のarchitecture判断（MADR、arc42）で、規模と承認の構造が違う。HELIXのD01で、どの層の判断（方式設計、個別の設計判断、製品の機能提案）に対応させるかは未決。
- 評価根拠：HELIXでの成功・失敗の証拠はない。外部repositoryでの採用を、HELIXでの妥当性の根拠にしない（HELIXBRAIN-L2-026／027の経路で扱う）。
- 版：固定commit SHAで版を表す。arc42のtemplateには `version.properties` があり、製品版と commit のどちらを主キーにするかは未決。KEPのprocess文書は「templateがmetadata schemaの正本」と書いており、文書とtemplateのどちらの版に結ぶかも未決。
- license：arc42はCC BY-SA 4.0（share-alike）で、構造の観察だけにした。python/pepsはGitHub API上のlicenseがnullで、文書ごとの表示（public domain or CC0-1.0）しかない。この2種類をBRAINの由来の属性にどう記録するかは未決。
- 状態：全観察（P16-O01〜O14）は未評価の候補素材である。HELIX-BRAINへの登録・採否・選定は行っていない。
