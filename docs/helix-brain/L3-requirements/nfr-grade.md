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
| `HELIXBRAIN-L2-028` descriptor/knowledge axis separation | descriptor fieldとBRAIN knowledge identity/revision/version/stateを独立照合し、cross-substitutionによる誤受理0を候補とする。 | descriptorとknowledge各fieldを個別変異し、各version軸に互いに異なる合成値を置いた入替え変異を独立投入する。応答tuple、該当field、期待軸、BRAIN（L2-008）／HARNESS ownerへの戻し先を観測。 | 独自schema/digest/timeoutは未指定。BRAINは共通exchange/update/rollback/unfinished-obligation lifecycleを再定義しない。 |

候補値は未実測であり、測定できない/fixture未充足/契約値が不明な場合を成功としない。旧数値を自動継承しない。
