# HELIX 共通カーネル L4基本設計（K1・K2・K5・K6・G8・Phase 1）

status: draft_for_l4_review
owner: HELIX-HARNESS（工程の標準と検証義務の所有。2026-10-08のPO判断の判断2）
parent_requirement: なし（一つの親要求を定めず、要素ごとに承認済みL3のACへtraceする。2026-10-08のPO判断の判断2。1.3を参照）
paired_l9: ../L9-integration-verification/common-kernel-integration-verification.md
base: main `3d2f78ce4ed11fa07d987fffa3632b20b0f7c51d`（引用した本文のSHA-256は`f88c96ce`で固定した。付録A。`f88c96ce`から`3d2f78ce`までに引用した本文は変わっていない）

本書は、8機構が共通に使う結果の型と版の鍵（共通カーネル）のL4基本設計の下書きである。最初のPRはK1（結果の多値型）とK2（identity・revision・digestによる鍵）、PR2はK5（追記専用JSONLとprojection。9章）、PR3はK6とE（検証receiptとその真正性。10章）、PR3bはG8（11章）とPhase 1の条件の具体（12章）を扱う。残りは8.2の「後続PRの計画」に置く。

本書は要求の意味、範囲、担当、版を作らない。各要素は承認済みL3のACを由来とし、由来の無い要素は「L2へ戻す論点」に分ける。本書は実装、実行、内部デプロイ、releaseの許可を含まない。本書の承認・merge・試作の合格から、L3以上の承認や完了を生成しない。

## 1. 配置

### 1.1 層とpair

現行の層とpairは、Concept（`docs/concept/helix-concept.md:239`）とHARNESS-L2-001（`docs/helix-harness/L2-requirements/product-requirements.md:99`）が定める`L4↔L9`である。旧HELIXも`L4 基本設計 ↔ L9 結合テスト`を対にしていた（`LEGACY-ASSET-80FD1264A2C50E2E4AA4`、`archive/legacy-generation-2026-09-14/root/docs/process/README.md:44-55`、SHA-256 `21a875ca5b46a8396485690a8405923ea197552fe4aa2302b1eaad6f7e650985`）。L9は「interface、依存の向き、stateとdataの所有、transaction、失敗の伝わり方、retry、timeout、冪等性、結合度、責務の重複」を見る（HARNESS-L2-003／004、同L2:110）。本書と対になる検証設計はL9に置く。

### 1.2 置き場所（提案）

| 層 | 置き場所 | 名前の根拠 |
|---|---|---|
| L4基本設計 | `docs/helix-harness/L4-basic-design/` | 旧`docs/design/<target>/L4-basic-design/`の層名を保持し、現行の対象別folder（`docs/<mechanism>/L3-requirements/`等）の下へ置き直す |
| L9結合検証 | `docs/helix-harness/L9-integration-verification/` | 旧`docs/test-design/harness/L9-integration-test-design.md`の「結合」を保持し、現行L10の`L10-verification/`に合わせて「verification」とする |

L3／L10の配置規則（`docs/governance/l3-l10-authoring-layout.md:7-34`）を同じ考え方でL4／L9へ延ばした。文書（`docs/`）の構成を変える判断ではなく、既存の判断（`docs/governance/decisions/po-l3-l10-post-confirmation-and-internal-deployment-policy6-2026-10-08.md:68`「`docs/`の構成は既存の判断のまま変えない」）に反しない範囲で、新しい層のfolderを足すだけである。旧`docs/design/`と`docs/test-design/`への分離は採らない。現行は機構ごとのfolderに要求から検証までを置くためである。

共通カーネルを`docs/helix-harness/`に置くのは、HARNESSが「工程の標準と検証義務」を持つ（Concept原則10、`docs/concept/helix-concept.md:311`）ためである。8機構が使う型であっても、所有を一つにする（Concept原則4）。

### 1.3 未決（配置）

- **親要求**：一つの親要求の下に置かず、要素ごとに承認済みL3のACへ由来を辿る（2026-10-08のPO判断、`docs/governance/decisions/l4-l6-design-unlock-and-common-kernel-trace-po-decision-2026-10-08.md` 判断2）。HARNESS-L2-031の意味は「ログ・入力からの最小再現と回帰候補生成」（`docs/helix-harness/L2-requirements/product-requirements.md:627-645`）であり、「031＝共通部品」は031の所属の確定である（`docs/governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md:19,66`）。そのため031を親としない。
- **L4の配置規則の置き場**：L3／L10は`l3-l10-authoring-layout.md`が配置を定める。L4／L9の配置規則を同書へ追記するか、別に置くかは未決とする。本書の提案は、その規則が決まるまでの仮の配置である。
- **作業入口**：L4〜L6の設計と対の検証設計は、2026-10-08のPO判断（同判断記録の判断1）で、承認済みL3／L10を親とする範囲に限り、作業入口の「現在停止する作業」から外れた。

## 2. K1 結果の多値型 `Observed<T>`

### 2.1 由来

| 由来 | 位置 | 要点 |
|---|---|---|
| Concept | `docs/concept/helix-concept.md:316` | 不明を「問題なし」に読み替えない |
| HARNESS | `AC-HARNESS-L3-022-02`（`docs/helix-harness/L3-requirements/functional-requirements.md:231`） | 判定不能な品質は未評価のまま保持し、上位stateを作らない |
| HARNESS | `AC-HARNESS-L3-030-02`（同:254）、`AC-HARNESS-L3-032-02`／`032-03`（同:285-286） | missing・unknown・stale・不一致をfieldごとに扱い、未選択は未観測に保つ。unknown／not connectedを推測で接続済みにしない |
| CONNECT | `CONNECT-AC-002-01`（`docs/helix-connect/L3-requirements/functional-requirements.md:61`）、`CONNECT-AC-006-02`（同:159） | 互換をcompatible／incompatible／unknown／staleに区別し、unknownをcompatibleへ推定しない |
| LABO | `LABO-001-AC-02`（`docs/helix-labo/L3-requirements/functional-requirements.md:45`） | unknown・not_observedをsuccess化しない。非successのeventを除去しない |
| INFRASTRUCTURE | `INFRA-001-AC-01`（`docs/helix-infrastructure/L3-requirements/functional-requirements.md:51`） | 値または明示的unknownを持ち、既定値で補完しない。読取不能なら以前のobservationをcurrentとみなさない |
| SECURITY | `SECURITY-AC-001-01`（`docs/helix-security/L3-requirements/functional-requirements.md:68`） | 分類不能はunknown／untrustedと判定する |
| BRAIN | `BRAIN-008-AC-02`（`docs/helix-brain/L3-requirements/functional-requirements.md:85`） | unknown stateをcurrentへ暗黙に解決しない |

引用した本文は、base `f88c96ce`の各ファイル（SHA-256は付録A）である。各ACの承認は`docs/governance/l3-l10-po-post-confirmation.md`の各行が示す判断記録による。

各機構のACは、それぞれの状態語で同じ規則を述べている。K1はこれを一つの型にまとめる設計であり、各機構の状態語と意味を置き換えない（2.4の写像表）。

### 2.2 型

```text
Observed<T> =
  | Value(value: T, key: ResultKey, evidence: EvidenceRef)
  | Unknown(reason: UnknownReason, key: ResultKey, evidence: EvidenceRef?)
  | Unobserved(key: ResultKey, why: UnobservedWhy, superseded: KeyDigest?)
  | Stale(prior: Value<T>, recorded_key: ResultKey, current_key: ResultKey)
  | NotApplicable(reason: Text, authority: AuthorityRef, reentry_trigger: Text, key: ResultKey)
```

| クラス | 意味 | 例 |
|---|---|---|
| `Value` | 対象の鍵（K2）について観測し、値が定まった | pass、fail、incompatible、0件（完全走査の結果） |
| `Unknown` | 観測を試み、または入力を受けたが、値を定められない | 比較不能、分類不能、parse不能、評価器の異常、入力の矛盾 |
| `Unobserved` | 観測していない。証拠が無い | 未選択の操作、未実行、receiptの未着 |
| `Stale` | 値はあるが、記録した鍵が現在の鍵と一致しない | 対象・oracle・契約のいずれかのrevisionが変わった |
| `NotApplicable` | 適用しないことを、理由・authority・再入条件とともに決めた | 非UI対象へのUI条件 |

`UnknownReason`は閉じた語彙とする：`ambiguous`、`unsupported`、`conflict`、`evaluation_error`、`indeterminate`、`unreadable`、`incomparable`、`unregistered`、`missing_input`、`invalid_disposition`。語彙の追加は本書の改訂で行う。`UnobservedWhy`は`not_selected`、`not_run`、`pending_receipt`の三つとする。`superseded`は、旧revisionで記録された非`Value`の結果が現在の鍵に対して使えなくなった場合に、その記録を指す（K2-I2b）。

`Stale`は照会のときに導く値であり、記録しない（K2-I2）。`Stale`の`prior`は`Value`に限る。旧revisionの記録が`Value`以外の場合は、`Stale`を作らず`Unobserved(not_run, superseded)`を返す（K2-I2b）。

合成と判定のために、次の型を置く。

```text
Polarity     = Positive | Negative
PolarityOf<T> = (value: T) -> Polarity          # 各機構が自分の値型ごとに持つ
Verdict      = Positive | Negative | Undetermined
Withheld     = { index: 位置 | whole, class, reason } # 拒否の理由。成分ごとに一つ。集合全体の理由はindex=whole
Combined<T>  = { verdict: Verdict,
                 components: Observed<T>[],      # 入力の全成分を入力順のまま保持
                 polarity: PolarityOf<T>の識別と版,
                 negatives: index[],             # 否定のValueの位置
                 non_values: index[],            # Unknown／Unobserved／Stale／無効なN/Aの位置
                 excluded: index[],              # 成立したNotApplicableの位置
                 set_reason: Unknown? }          # 有効な判定成分が0件のときだけUnknown(missing_input)
```

`Value`の値を肯定・否定へ写す責務は、その値型を持つ機構が`PolarityOf<T>`として持つ（例：CONNECTの`compatible`→Positive、`incompatible`→Negative。HARNESSの`pass`→Positive、`fail`→Negative）。カーネルは写像を持たず、受け取った写像の識別と版を`Combined`に記録する。写像が無い値型は`combine`へ渡せない（`Unknown(missing_input)`）。

`fail`、`mismatch`、`incompatible`のように、観測して否定が定まったものは`Value`である。否定の確定と不明を混ぜない。

### 2.3 不変条件

- **K1-I1 縮退の禁止**：`Unknown`、`Unobserved`、`Stale`を、`Value`（特に肯定の値）へ変換する関数を置かない。`NotApplicable`は肯定の値ではない。
- **K1-I2 fail-closed**：肯定の判定（gate、昇格、適格、compatible等）は、全成分が肯定の`Value`の場合だけ成立する。理由の付いた`NotApplicable`の成分は、判定から除外できる。
- **K1-I3 合成**：`combine`の`verdict`は、否定の`Value`が一つでもあれば`Negative`、それ以外に`non_values`が一つでもあれば`Undetermined`、`excluded`を除く全成分が肯定の`Value`ならば`Positive`とする。`excluded`を除いた有効な判定成分が0件（成分0件、または全成分が成立した`NotApplicable`）なら、`verdict = Undetermined`、`set_reason = Unknown(missing_input)`とする（K1-I4）。いずれの場合も`components`に全成分を入力順のまま残し、`negatives`と`non_values`に該当する位置をすべて記す。最初の否定で後続の成分を捨てない。`Combined`を単一の色や点数に縮約しない。
- **K1-I4 空集合**：必須の集合が空または欠落している場合は`Unknown(missing_input)`とする。空集合の全称を真にしない。`combine`ではこれを`Combined`の`set_reason = Unknown(missing_input)`（`verdict = Undetermined`）で表し、`admit`は`{index: whole, class: Unknown, reason: missing_input}`を理由に入れる。単独の照会（`lookup`等）では`Unknown(missing_input)`そのものを返す。
- **K1-I5 N/Aの成立**：`NotApplicable`は`reason`、`authority`、`reentry_trigger`をすべて持つ場合だけ成立する。一つでも欠ければ`Unknown(invalid_disposition)`とする。
- **K1-I6 鍵の必須**：すべてのクラスが鍵（K2）を持つ。鍵の無い結果、または鍵のfield（3.2の`ResultKey`の5fieldと、`subject`・各`inputs`の`SubjectRef`の4field）が一つでも欠けた結果は、受信の境界（`combine`の各成分、`admit`が受け取る`Combined`の各成分、`record`の`key`、`lookup`の`query_key`）で拒否し、成分として数えない。`admit`は`combine`を経ずに作られた`Combined`もありうるため、成分の鍵を検査し直す。拒否は呼出し元へ理由`missing_key`として返し、`Unknown`や`Unobserved`へ読み替えて先へ渡さない。
- **K1-I7 「無い」の確定**：「対象が無い」を`Value`（0件）とするのは、完全走査を示す証拠がある場合だけとする。部分走査や読取失敗は`Unknown(unreadable)`または`Unobserved`とする。
- **K1-I8 fail-openの限定**：表示や観測のための投影で、非`Value`を省略して表示する方策は、その投影の宣言に明示した場合だけ許す。その投影の出力を判定の入力にしない。

### 2.4 写像表（G10：不明の共通分類）

旧HELIXの局所語と、承認済みL3の状態語を、クラスに一度ずつ写像する。写像は語の置換ではなく、K1の型へ載せるときの対応である。各機構の本文と意味は変えない。

| 語 | 出どころ | クラス |
|---|---|---|
| `ambiguous` | 旧`docs/process/README.md:36-37`（`LEGACY-ASSET-80FD1264A2C50E2E4AA4`。曖昧・未知の入力を推測で昇格させずfail-close） | `Unknown(ambiguous)` |
| `unsupported` | 同上 | `Unknown(unsupported)` |
| `mismatch` | 旧measurement-evidence-evaluator（binding／baseline） | 否定の`Value` |
| `conflict` | 旧v1.3:361（同じcommand_idで異なるdigest） | `Unknown(conflict)`。K2のput規則も参照 |
| `absent` | 旧feedback-lifecycle（完全走査marker付きの不在） | 完全走査の証拠があれば`Value`（0件）、無ければ`Unknown(unreadable)` |
| `evaluation_error` | 旧design-template-json-authority | `Unknown(evaluation_error)` |
| `indeterminate` | 旧destructive-command-guard | `Unknown(indeterminate)`。blockと同じ扱いはK1-I2で満たす |
| `unknown` | CONNECT／INFRA／SECURITY／BRAIN／LABOのL3 | `Unknown`（理由は各機構の観測に従う） |
| `stale` | CONNECT-AC-002-01、HARNESS-030-04等 | `Stale` |
| `not_observed`／未観測 | LABO-001-AC-02、HARNESS-032-03 | `Unobserved` |
| 未評価 | AC-HARNESS-L3-022-02 | receiptが無ければ`Unobserved(pending_receipt)`、oracle・scope不足なら`Unknown(missing_input)` |
| `incompatible` | CONNECT-AC-002-01 | 否定の`Value` |
| `not_applicable` | 旧design-template-json-authority、HARNESS L3（非UI対象） | `NotApplicable` |

### 2.5 API境界

- `combine(components: Observed<T>[], polarity: PolarityOf<T>) -> Combined<T>`：K1-I3、I4、I6に従う純関数。成分が一つの場合も`combine`を通す。
- `admit(c: Combined<T>) -> Admitted | Withheld(reasons: Withheld[])`：K1-I2の判定。`Admitted`は`verdict = Positive`の場合だけ返す。`Withheld`の`reasons`は空にならない。理由は次の順にすべて入れる：`negatives`の各位置は`{位置, Value, negative_value}`、`non_values`の各位置は`{位置, クラス, 理由}`（`Unknown`の`reason`、`Unobserved`の`why`、`Stale`、`invalid_disposition`）、`set_reason`があれば`{whole, Unknown, missing_input}`。`verdict`が`Positive`でないのに理由が0件になる`Combined`は作られない（Undeterminedは`non_values`か`set_reason`の少なくとも一方を持ち、Negativeは`negatives`を持つ）。`admit`は`Combined`以外を受け取らない。単独の`Observed`を直接`admit`へ渡す経路は置かない。
- 機構をまたぐ判定（例：CONNECTの互換とHARNESSの検証結果）は、各機構の`Observed`をそれぞれの`PolarityOf`で写した後に一つの`combine`へ渡す。値型が異なる成分は、成分ごとに写像を指定する（`combine`は成分ごとの`(Observed, PolarityOf)`の組も受け取れる）。
- `disposition(reason, authority, reentry_trigger, key) -> Observed<T>`：K1-I5の検査を通った場合だけ`NotApplicable`を返す。

各機構は、自分の状態語から`Observed<T>`への写像関数を自分で持つ。カーネルは写像の向きを一方向（機構の語→カーネル）に限り、カーネルから機構の状態を書き戻さない。

### 2.6 旧HELIXとの対応

| 旧source（ID／path:行／SHA-256） | 保持する点 | 変更する点 | 区分候補 |
|---|---|---|---|
| `LEGACY-ASSET-5E2592D7BB50EC290C9B`／`docs/design/helix/L4-basic-design/measurement-evidence-evaluator.md:48-70`／`d446588a1fe6999e458a41f2c4683d34459ff7b12b28a057642cc2f6e15e6898` | 軸ごとにunknownを持つ。fail／mismatchならred、残りにunknownがあればunknown。stale・推測値をgreenへ縮退しない。最初の失敗で後続を捨てない | 計測評価の局所型から全機構の型へ広げる。`Unobserved`と`NotApplicable`を独立のクラスにする | `semantic_rederive` |
| `LEGACY-ASSET-98372FEE8A3AC8F9C299`／`docs/design/helix/L5-detail/design-template-json-authority.md:97-99`／`3015d4f3d65cd1f8205f88f29dd59c4f1f7ef42c729d8144f2319e49fe20d830` | missing・unknown enumをN/Aへ丸めない。N/Aは`reason`・`authority`・`reentry_trigger`を持つdisposition | なし（K1-I5として再導出） | `semantic_rederive` |
| `LEGACY-ASSET-C35E93F2D36777CD7462`／`docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md:98-99`／`2a757a52082f823c4e52ae1e04887b62b8ac5f5df0d833d2b1c00516d6572357` | 暗黙skip、stale skip、空理由を拒否する | gateごとの拒否条件を、型の不変条件へ移す | `semantic_rederive` |
| `LEGACY-ASSET-E7C5C528479A2FFDE118`／`docs/design/harness/L6-function-design/destructive-command-guard.md:25-26`／`aed67c9542f178fec521530fe8fef2ff952bcfaa7bc90888b068e7de67daefd8` | `indeterminate`をblockと同じ境界にする | 局所語を`Unknown(indeterminate)`へ写像する | `semantic_rederive` |
| `LEGACY-ASSET-F6E9EA3422A0EF1DF090`／`docs/design/harness/L6-function-design/feedback-lifecycle.md:94-103`／`2e0a028fc48c6acc92a5b09ada9fc511ed0389b71af9deee782ec81aa731a655` | 不在によるcloseは完全走査markerがある場合だけ。partial rebuildや読取失敗でcloseしない | `absent`を独立クラスにせず、K1-I7で`Value`（0件）の成立条件として扱う | `semantic_rederive` |
| `LEGACY-ASSET-63857110B2C14B808B15`／`docs/design/helix/L3-requirements/lifecycle-state-separation.md:150`／`a4077092ff5f268cfc58af2823573565f1144f3d88b696b9f59cf20112ff857b` | `unobserved`は証拠が一つも無い状態 | 運用観測の一entityから全機構の`Unobserved`へ広げる | `semantic_rederive` |
| `LEGACY-ASSET-BC214D81DE9E77B8A804`／`docs/archive/cross-system-audit-2026-09-05/source/audit-report.md.txt:72-80`（F02）／`dcf0d4e0dcc4db772afac465df10f2412134cd65dcd019a18cb99c9fd39be53f` | 失敗史：必須集合を空にすると個別検査が消えた | K1-I4の根拠 | 失敗史（区分なし） |
| `LEGACY-ASSET-85832C01812D05143691`／`docs/governance/rule-enforcement-gap-audit-2026-08-12.md:152-154`（ISSUE-22）／`da0331303c1766aea4e763d2d0ddee02e5cdbb0add900d0c779f0024a4886e7f` | 失敗史：fail-openのhookの失敗が握りつぶされた | 旧の意図的なfail-open（観測・表示）を既定から外し、K1-I8の明示宣言に限る | `replace`（既定値の変更） |

旧HELIXには、不明の分類の共通定義が無い。G10の共通定義（2.2のクラス集合と2.4の写像表）は**新規案**である。調査の範囲と結果を次に記す（2026-10-08、本書の起草者が実施）。

- 範囲：`archive/legacy-generation-2026-09-14/root/`の全ファイル（`docs/`、`src/`、`tests/`、`config/`、旧`CLAUDE.md`・`AGENTS.md`を含む）。`grep -rIl`による読取だけで、旧code・scriptは実行していない。
- 検索語と該当ファイル数：`NotApplicable` 0、`tristate` 0、`unknown_class` 0、`unknown taxonomy` 0、`未知の分類` 0、`不明の分類` 0、`Unobserved` 1（`src/state-db/visualization-view-model.ts`）、`unobserved` 5、`inconclusive` 9、`未観測` 20。
- `unobserved`の5件は`lifecycle-state-separation.md`とその対の受入設計、`src/`・`tests/`の実装であり、一つの機構（運用観測）の状態語である。`未観測`・`inconclusive`の該当（重複を除き29件）は、各行を読み、いずれも個別の機能（feedback lifecycle、impact CI、agent lifecycle、execution ticket、mechanism adequacy、V-model docgen等）の局所的な使用であった。機構横断のクラス集合を定める記述は無かった。
- 旧の用語集`docs/design/helix/L3-requirements/glossary-ssot.md`（`LEGACY-ASSET-BE8CCE567342EAB19B1C`、SHA-256 `610c5dc6513c25c17d8a813e4685b46e4fda3d2a19c9472e62af70f08038abf5`、`status: placeholder`）は、`unknown`、`stale`、`not_applicable`、`未観測`、`不明`をいずれも含まない。

### 2.7 未決と試作で確かめること

- `Unknown`と`Unobserved`の境界を、各機構のL3の語で一件ずつ確かめる（例：HARNESSの「未評価」の二分）。境界がL3の意味に触れる場合は、L2へ戻す論点にする（6章）。
- `UnknownReason`の語彙が、承認済みL3の否定fixtureをすべて表せるか。表せない語が出たら、語彙を足す前に`Value`の否定でないかを確かめる。
- 試作（`scaffold/`、Scaffold Binding登録）：HARNESSの検証結果とCONNECTの互換結果を同じ`Observed`で保存し、`combine`と`admit`がL3の否定fixtureをすべて`Withheld`にすることを確かめる。

## 3. K2 identity・revision・digestによる鍵

### 3.1 由来

| 由来 | 位置 | 要点 |
|---|---|---|
| Concept | `docs/concept/helix-concept.md:105` | 誰が・何を・どの要求と構成の版で・どの能力とモデルの版を使い・どうなったかを結ぶ |
| HARNESS | `AC-HARNESS-L3-010-01`／`010-03`（`docs/helix-harness/L3-requirements/functional-requirements.md:37,39`） | packのidentity・version・依存の版を宣言し、同じ宣言入力と版から同じ成果物を得る |
| HARNESS | `AC-HARNESS-L3-022-05`（同:234） | revision違い・scope違い・oracle失効では上位stateを作らない |
| HARNESS | `AC-HARNESS-L3-030-04`、`031-05`、`032-04`（同:256,272,287） | 契約・oracle・packを更新したら影響物を新revisionへtraceし直し、旧revisionのpass・receiptを流用しない |
| CONNECT | `CONNECT-AC-002-01`（`docs/helix-connect/L3-requirements/functional-requirements.md:61`） | 登録時と使用時のrevisionを区別し、端点・意味契約・adapter・互換範囲の変化をstaleの契機にする |
| LABO | `LABO-001-AC-02`（`docs/helix-labo/L3-requirements/functional-requirements.md:45`） | 既知の古いrevisionをcurrentとして偽装しない |
| BRAIN | `BRAIN-008-AC-02`（`docs/helix-brain/L3-requirements/functional-requirements.md:85`） | exact revision Rの参照へR2を返す置換と、同じRの内容の書換えを拒否する |
| OS | `AC-OS-014-02`（`docs/helix-os/L3-requirements/functional-requirements.md:22`） | pack・依存のidentity、契約と成果物の版を照合する |
| INTELLIGENCE | `AC-INT-010-06`（`docs/helix-intelligence/L3-requirements/functional-requirements.md:25`） | 共通pack契約のidentity・版・互換範囲が欠落・stale・不一致なら互換不成立 |
| PO判断 | `docs/governance/decisions/l3-l10-delegation-cross-runtime-review-po-decision-2026-10-08.md:72-74`（判断2） | 意味revisionの判定器ができるまで、bytesが変われば意味が変わったとして扱う |

### 3.2 型

```text
Digest       = "sha256:" + 64 lowercase hex            # 内容のSHA-256
GitRevision  = 40 lowercase hex                         # git commit。Digestと混同しない
SubjectRef   = { kind, identity, revision, digest }
ResultKey    = { operation, operation_version, subject: SubjectRef,
                 inputs: SubjectRef[] (identityで整列), scope }
KeyDigest    = Digest(canonical_json(ResultKey))
ResultRecord = { key: ResultKey, key_digest: KeyDigest,
                 result: Observed<T>, result_digest: Digest, producer: ProducerRef }
```

- `kind`は対象の種別（要求、要件、設計文書、pack、契約、oracle、成果物、構成等）。閉じた語彙とし、各機構のL4で値を足す。型番（方針6）の`unit`／`connection`／`composite`は`kind`の下位区分として持つ。
- `identity`は版をまたいで変わらない識別子（例：`HARNESS-L2-031`、pack identity）。pathを`identity`にしない（方針6「フォルダのpathを型番やパックの境界の正本にしない」）。
- `revision`は対象の版の識別子。repository内の文書は`(GitRevision, path)`、登録の版は登録ID（例：`MPR-RC-…-002`）とする。
- `digest`は対象の内容bytesのSHA-256。文書は本文全体のbytes（AGENTS.md「過去の本文を指すときは対象のcommitと本文のSHA-256」）。構造化データは`canonical_json`（object keyを辞書順、配列順は保持、非有限数を拒否）のbytesとする。
- `inputs`は結果に影響する入力の全集合（oracle、契約、設定、依存、環境の版）。省いた入力は、その結果の鍵に含まれないため、変化しても検出できない。入力の全集合の宣言は各操作の所有者が持つ。
- `producer`は結果を出した検証器・Workerの識別と版である。真正性はK6（receipt）とEで扱い、本PRでは参照の枠だけを置く。

### 3.3 不変条件

- **K2-I1 完全一致**：記録した結果をそのクラスのまま返せるのは、照会の鍵と記録の鍵が全fieldで一致する（`key_digest`が等しい）場合だけとする。
- **K2-I2 照会の集約順**：`lookup`は、記録集合全体から一つの結果を次の順で決める。各段で結果が決まれば、後の段へ進まない。staleは記録を書き換えて付けるものではなく、照会のたびに鍵を比べて導く。
  1. **候補の選別**：`operation`、`operation_version`、`scope`が照会と同じで、`subject`の`identity`が同じで、`inputs`の`identity`の集合が同じ記録を候補とする。それ以外（`subject`の`identity`の変更、入力の追加・削除、件数を保った`identity`の置換を含む）は別の問いであり、候補にしない。候補が0件なら`Unobserved(not_run)`。
  2. **候補集合全体の競合検査**：候補のどれか一つでも、照会と同じ`identity`の`SubjectRef`について、(a)`revision`が同じで`digest`が違う、または(b)`kind`が違う場合は、`Unknown(conflict)`とする。(a)は同じrevisionの内容が二通りある状態（BRAIN-008-AC-02の「同revision Rの内容の書換え」）、(b)は同じidentityが別の種別を指す衝突であり、どちらが正しいかを照会側で決められない。この段は完全一致の有無にかかわらず先に行う。
  3. **完全一致の選択**：全fieldが一致する（`key_digest`が等しい）候補があれば、その記録を記録したクラスのまま返す（`Value`は`Value`、`Unknown`は`Unknown`、`Unobserved`は`Unobserved`、`NotApplicable`は`NotApplicable`）。旧revisionの候補が同時にあっても無視する。完全一致の候補が複数あり`result_digest`が異なれば`Unknown(conflict)`（K2-I4）。
  4. **旧revisionからの扱い**：完全一致が無ければ、残る候補はすべて`revision`の違う旧revisionの記録である（1〜3により、ほかのfieldの不一致は残らない）。K2-I2bで返り値を決める。
- **K2-I2b 旧revisionの記録の扱い**：旧記録が`Value`なら`Stale(prior, recorded_key, current_key)`を返す。旧記録が`Unknown`、`Unobserved`、`NotApplicable`なら`Unobserved(not_run, superseded = 旧記録のkey_digest)`を返す。旧revisionの`NotApplicable`は新revisionへ持ち越さない（理由・authority・再入条件は旧revisionに対して決めたものであるため）。旧revisionの候補が複数ある場合は、K5の追記順で最後の記録を使う。どの場合も肯定の判定にはならない。
- **K2-I3 意味revision（G4、PO判断2）**：`same_meaning(a, b)`は版付きの関数とし、現在の実装は`a.revision == b.revision`かつ`a.digest == b.digest`だけとする。したがって、bytesが変われば常に旧結果を使わない（K2-I2の2または4）。bytesが同じで`revision`だけが違う場合も、鍵が違うため4に当たり、旧結果を使わない。意味が同じなら下流を無効にしない仕組み（backdating）は、判定器を版とdigestで固定して置き換えるまで使わない。
- **K2-I4 冪等な記録**：同じ`key_digest`で同じ`result_digest`の記録は、既存の記録を返し、何もしない。同じ`key_digest`で異なる`result_digest`の記録は、両方を保持して`Conflict`を返し、後の記録で前の記録を上書きしない。`Stale`は記録できない（`record`は拒否する）。
- **K2-I5 版の置換の禁止**：`identity`と`revision`を指定した参照へ、別の`revision`の記録を値として返さない（K2-I2の4で`Stale`または`Unobserved`になる）。同じ`revision`で`digest`が変わった場合は、K2-I2の2により`Unknown(conflict)`とする。
- **K2-I6 digestの型**：`Digest`、`GitRevision`、prefixの無いhex、短縮したdigestを別の型とし、相互に比較しない。短縮形は表示だけに使う。
- **K2-I7 層を分けた版**：packの版、release unitの版、統合製品の版、段階（v0.x）の版を別の`SubjectRef`として持ち、一つの版の昇格から他の版を昇格させない（`AC-HARNESS-L3-010-03`）。

### 3.4 イベントとAPI境界

- イベント：`ResultRecorded`（鍵、結果、`key_digest`、`result_digest`、`producer`）、`ResultConflictDetected(key_digest, result_digests[])`。各fieldの形式はK5（9.3）で定める。staleはイベントにしない（K2-I2）。保存はK5（repository内の追記専用JSONL。本書の設計判断。5章）で行い、本PRでは記録の形式だけを定める。
- `key_of(operation, operation_version, subject, inputs, scope) -> ResultKey`：`inputs`を`identity`で整列し、重複した`identity`を拒否する。
- `lookup(records, query_key) -> Observed<T>`：K2-I1、I2、I2b、I5に従う純関数。`query_key`は照会時点の`subject`と`inputs`の`revision`・`digest`を持つ。
- `record(records, key, result, producer) -> Recorded | NoOp | Conflict | Rejected(missing_key | stale_not_recordable)`：K1-I6とK2-I4に従う。

### 3.5 旧HELIXとの対応

| 旧source（ID／path:行／SHA-256） | 保持する点 | 変更する点 | 区分候補 |
|---|---|---|---|
| `LEGACY-ASSET-130EFBE7012012FF9281`／`docs/design/helix/L6-function-design/layer-ledger-pair-gate.md:191,283,287`／`458c7a428c4ce9a19506cd4061568dda091bdf2674517fafec235fc374d720ad` | pair receiptが`derived_from_digest`・`snapshot_digest`・`verdict: verified\|failed\|stale`を持つ。変更の原因ごとに後段の段階をstaleにする | 層pairに限っていた鍵を、全機構の結果の鍵へ広げる。staleを記録へのイベントでなく照会時の導出にする | `semantic_rederive` |
| `LEGACY-ASSET-28B47108797C610AE0BC`／`docs/design/helix/L6-function-design/engine-detector-execution.md:53,86,134`／`50262d5ab40b334db414b6d9502eb08559fa15ad35db0f93722ae6a778e3c805` | source・version・config・schemaの変化で証拠をstaleにする。入力digestの束（`FixedExecutionInputV1`） | 旧にもbackdatingは無い。本書もK2-I3で使わない（PO判断2） | `semantic_rederive` |
| `LEGACY-ASSET-9A2C16ECB41E0E007EFF`／`docs/design/harness/L6-function-design/digest-canonicalization-authority.md:12-30`／`ac0dd11655279e0653726d4eeb06a90663c65663f36fc33a78be237f93f36b89` | `sha256:<64 lowercase hex>`と`canonicalJson`。bare・truncated・domain固有のdigestを混同しない | なし（K2-I6として再導出） | `semantic_rederive` |
| `LEGACY-ASSET-02319C2481B9E01698D5`／`docs/governance/helix-harness-requirements_v1.3.md:361`／`788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406` | 同じ`command_id`と同じdigestなら既存receiptを返し、異なるdigestはconflict。reviewは対象revisionとHEADに固定し、後の変更でstaleにする | なし（K2-I4として再導出） | `semantic_rederive` |
| `LEGACY-ASSET-210D6B145CA997AE3CFA`／`docs/design/helix/L6-function-design/github-ci-status-head-binding.md:14-35`／`ada13578a51b0d9b154947a10b1aac1bcca6e211d9488d54c95ee4111a122526` | 別HEADの成功でgreenにしない。SHAが不正なら推測せずunavailable | 鍵をHEADだけから入力の組へ広げる | `semantic_rederive` |
| `LEGACY-ASSET-A127DEC3EEE6ED63CF17`／`docs/governance/predecessor-harness-full-weakness-audit-2026-07-20.md:71`（UTW-005）／`bab121404c956a0a4b403e589bea1c414af59b5996989bea5fab9f98f42f6872` | 失敗史：traceとreview証拠が最新HEADへ結び直されなかった | K2-I2（照会時の導出）の根拠 | 失敗史（区分なし） |

旧HELIXには、意味が変わらなければ下流を無効にしない仕組み（backdating）が無い。本書もPO判断2により使わない。backdatingを入れる時点で、判定器の版とdigestの固定とともに**新規案**として示す。

### 3.6 未決と試作で確かめること

- `kind`の語彙と、各機構の`identity`の形式（登録IDとpack identityの関係等）。各機構のL4で値を足す。
- `inputs`の全集合を誰が宣言するか。各操作の所有者が宣言する設計にしたが、宣言漏れを検出する方法はK10（依存グラフ）とK4（義務）で扱う。
- 時間による鮮度（観測の期限）はK2に含めない。K2のstaleは版の不一致だけである。時間の閾値はL2へ戻す論点とする（6章、G11）。
- 試作：L9のIV-K2-01〜20を`scaffold/`（Scaffold Binding登録）で動かし、revisionの変更、同じrevisionのdigestの変更、非`Value`の旧記録、鍵の各fieldの単独変更、複数記録の集約が、それぞれ定義した返り値になることを確かめる。

## 4. 用語の区別

旧HELIXと同じ語を使う場合、意味を次のように分ける（本書の設計判断。5章）。

| 語 | 本書と後続PRでの意味 | 旧HELIXでの意味 |
|---|---|---|
| operation authority tuple | 操作の許可を束ねる組（actor、target、operation、revision、environment、scope、expiry等）。SECURITYのL3が使う語に合わせる。K3で定める | 「authority tuple」はregistryやIssue／PRのidentityの組を指した（`LEGACY-ASSET-40605F1E36A5DDCE0D84`、`docs/design/helix/L6-function-design/github-workflow-identity-contract.md:33`、SHA-256 `cf46f99a4d5ace7ba11be2d168820b3026365dd3f61bcb68ae49867c5cf54806`）。本書はこの意味を「registry identity tuple」と呼ぶ |
| 遅着作用 | 失効した割当てやrunが後から返した、状態を変える作用。拒否する（K7で定める） | 旧HIL-FR-27「失効runのlate resultをcommitしない」（`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`、`docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:117`、SHA-256 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`） |
| 遅着観測 | 割当ての終了後に届いた観測（CI、review、費用）。追補する | 旧「遅着CI/review/costは追補する」（`LEGACY-ASSET-3A15E5645D2D2A59DFF5`、`docs/governance/candidates/execution-ticket-requirements.md:307`、SHA-256 `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`） |

## 5. 本書の設計判断と、旧HELIXとの差

次の表のうち、上の4行はL4起草者（AI）の設計判断であり、POの判断ではない。L4以降の設計はAIが行う（旧charter §3、AGENTS.md「再構築の原則」）ため、本書に理由と旧sourceを記録し、独立reviewで確かめる。下の2行は、2026-10-08のPO判断記録による。このうち開発repoのクロスレビューの行は開発repoの運用規則であり、製品の設計の根拠ではない。

| 判断（出所） | 本書での適用 | 旧source（保持点・変更点） |
|---|---|---|
| 旧HELIX内の矛盾(a)は「L4以降は完全自動」に揃える（AIの設計判断） | 本書（L4）とL9に人の承認を置かない。独立reviewで確かめる | 旧charter §3（`LEGACY-ASSET-3B16BCFFAF353ADA813A`、`docs/design/helix/L0-charter/helix-charter_v0.1.md:18,22-30`、SHA-256 `8eff96bf58e6bb2cca247acef18c4f6cf07e304f3f23fb4179ddd8e5b19b23d8`）の「L4以降はAIが完全自動」を保持する。旧gate-design（`LEGACY-ASSET-2E09592A003B32C118C1`、`docs/governance/gate-design.md:23-40`、SHA-256 `d96852613b6d04c522872f110ad78dc6b2ade4007cc5a6a8b048eba273d3a726`）のG7・G11のPO sign-offは採らない（変更点）。理由：旧内部の矛盾を、現行の規則（AGENTS.md：人が持つ上流はConcept・L1・L2と、L3の承認）に揃える。G11（L11受入）の人の受入は、HARNESS-L2-022の利用者受入として別に残り、本判断で消えない |
| 結果とeventの正本はrepository内の追記専用JSONL。SQLiteのprojection DBは置かない（AIの設計判断。K5で詳細化） | K2の記録の保存先（K5で定める） | 旧ADR-007（`LEGACY-ASSET-8771887517A619A2D501`、`docs/adr/ADR-007-harness-db-sqlite-projection.md:18-22`、SHA-256 `50c05a00872be6c23de531aaecd6a6cfd26abec264718e0223ac2630f739dcdf`）は、`harness.db`を「projectionでありauthoring sourceではない」とし、正本を「docs/YAML/JSON state/log」と「markdown/YAML」に置いた。一方、旧`CLAUDE.md:250`（`LEGACY-ASSET-6EBDB617A8104A7756D0`）はsession continuationについて「`harness.db`のevent/projectionを正本」としており、旧の内部で扱いが揃っていなかった。保持する点：projectionは再構築でき、正本ではない（ADR-007）。変更する点：(1)K2の結果とeventの正本を、種類の異なるJSON state・logから、一つの追記専用JSONLの形式に揃える、(2)正本を正規化して保持するDB（`harness.db`）を置かず、projectionは必要なときにJSONLから導く、(3)旧`CLAUDE.md:250`のDB正本の扱いは採らない。区分は`replace`（保存の形式）。理由は設計上の三点である。K2-I2とK2-I4は記録を上書きせず衝突を両方残すことを求め、追記専用の形式がこれを構造で満たす。repositoryの記録は各行がcommitと本文のSHA-256で固定でき、K2の`revision`・`digest`と同じ方法で参照できる（AGENTS.md「過去の本文を指すときは対象のcommitと本文のSHA-256」）。正本をrepositoryの一系統にすれば、Concept原則7（`docs/concept/helix-concept.md:308`「意味の正本、実行事実、表示、作業文脈を分けて保つ」）の再構築を、DBの復元なしにrepositoryだけで行える。規模と再構築の費用はK5の未決とする |
| 信頼の根は、版とdigestで固定した検証器の集合をrepositoryで管理する。署名は後回し（AIの設計判断。K6・Eで詳細化） | K2の`producer`の枠（K6・Eで定める） | 旧closure-evidence-materialization（`LEGACY-ASSET-901EFEC93D536D3AA418`、`docs/design/harness/L6-function-design/closure-evidence-materialization.md:67-76`、SHA-256 `a8951a0cdd590da84612de8c6b6e5960ca5c32ad3b3d0c0d0511b9f5789c0264`）の「local hash単独では真正性を主張しない」を保持する。GitHub required-checkを信頼の根にする点は`replace`。理由：新世代CIは未構築で、旧CIは使えない |
| 旧用語の衝突は定義を分ける（AIの設計判断） | 4章 | 上表のとおり |
| 開発repoのreviewは、作成と別系統（別runtime・別model family）のクロスレビューを必須とする（PO判断：2026-10-08の委任判断記録の判断1。開発repoの運用規則） | 本PRの作成とreviewに適用する。製品K9の根拠にしない | 解禁判断記録の判断3（`docs/governance/decisions/l4-l6-design-unlock-and-common-kernel-trace-po-decision-2026-10-08.md:57-61`）により、これは開発repo（本repository）の運用規則であり、製品（HELIX）の要求ではない。製品のK9はConcept:236（独立reviewはidentity・context・authority・review routeで行い、providerの同異では独立性を決めない）と承認済みL3から導く（8.2のPR8） |
| G4はbytes変化＝意味変化（PO判断：2026-10-08判断記録の判断2） | K2-I3 | 2026-10-08判断記録の判断2 |

## 6. L2へ戻す論点

本書で由来を見つけられず、要求の意味に触れるため、L4で決めないもの。

1. **時間による鮮度の閾値**（G11）：観測の期限、失効の許容遅延をどの機構が持つか。L2は数値を新設しない方針である。
2. **不明と未観測の境界の各機構での意味**（G10の一部）：LABOの「不明と未観測」、INFRAの鮮度、SECURITYのunknown／denyが、2.2の境界と異なる意味を持つ場合。
3. K5（9章）の論点：末尾の削除の検出と、logの保持期間・圧縮（9.7）。
4. K6・E（10章）の論点：receiptの発行の真正性（10.8）。
5. G8（11章）の論点：実行環境の真正性（11.6）。

## 7. 人の判断が要る点

列挙だけであり、本書は新しい承認手続きを作らない。親要求の扱いと作業入口の停止は、2026-10-08のPO判断で決着した（1.3）。

1. L4／L9の配置規則の置き場（`l3-l10-authoring-layout.md`へ追記するか、別に置くか）。本書の配置は、その規則が決まるまでの提案である。人の上流の意味には触れないため、後続PRでAIが決め、独立reviewで確かめてよい。
2. Phase 1の条件の確認者・時期、数値、条件がそろった後の手順の変更、v0.1の宣言と内部デプロイ、advisoryの検査の扱い（12.5）。

## 8. PRの範囲と後続PRの計画

### 8.1 最初のPRの範囲と切り方の理由

最初のPRは、配置の提案、K1、K2、用語の区別、対のL9（K1・K2の結合検証）に限る。

- K1とK2は他のすべての要素の前提である（K3〜K10の結果はK1の型で返し、K2の鍵で保存する）。運用モデル「PRの原子性」の「対象PRが実際に参照する共通部品は先行PRで閉じる」に従い、先に閉じる。
- K1とK2は一つの変更目的（結果を版の鍵で保存し、不明を縮退させない）を成す。K2のstaleはK1の`Stale`クラスとして返るため、分けると片方だけでは検証できない。
- 運用モデルの`design_verification`は「後続の一つのV-pair」を扱うため、L4とL9を同じPRに置く。
- 人が読む本文はL4とL9を合わせて約410行で、目安の上限をわずかに超える。超える理由は、review01・02で鍵の各fieldと複数記録の集約を検証項目として列挙する必要が生じたことと、K1・K2が8機構のACへの由来の表と旧sourceの対応表を要することである。K1とK2は上の理由で分けられない。

### 8.2 後続PRの計画

各PRはL4の節と対のL9を同じPRに置く。依存の順に並べる。

| PR | 範囲 | 主な由来の候補（承認済みL3） | 組み込むG・E | 主な旧source（旧ファイル名。各PRで旧資産ID・行・SHA-256を固定する） | 未決 |
|---|---|---|---|---|---|
| 2（9章で起草） | K5 状態は証拠から導出（追記専用JSONL＋projection） | CONNECT-AC-005-01（追記で訂正）、LABO-001-AC-02（source stateへwritebackしない） | — | event-projection-checkpoint-replay、ADR-007（置換）、handover-db-derivation | projectionの規模と再構築の費用（旧IMP-151、149） |
| 3（10章で起草） | K6 provenance／receipt、E 検証receiptの真正性 | HARNESS-L2-022系のreceipt、032-05 | E | work-graph-receipt-acceptance、gate-evidence-substance、closure-evidence-materialization（置換）、check-registry（登録と実行の照合） | 署名を後回しにする間の改ざん検出の範囲。検証器の集合の配置 |
| 3b（11・12章で起草） | G8 実行物の検証、Phase 1の条件の具体（2026-10-08判断3） | SECURITY-AC-012-01、SECURITY-AC-013-01（配布・実行artifactとbuild済みartifactの鎖） | G8 | release-module-bundle-composition、distribution-package-release、distribution-lite-consumer-canary、gate-design、check-registry | 版の宣言、内部デプロイ、人のゲートを外す判断はL2・POへ戻す |
| 4 | K4 義務を一級データに | HARNESS-L2-022、030〜032、036 | G3（oracle種別：機械判定／LLM判断／人のIF） | descent-obligation、ci-deferred-obligation-recovery、ci-verification-plan、charter P3 | 未完義務の継承は新規案を含む |
| 5 | K10 型付き依存グラフ | HARNESS-L2-023（依存閉包）、INFRA | — | ci-responsibility-registry、design-registry | 関係型の性質宣言は新規案 |
| 6 | K7 世代pointer／fencing、型番の台帳形式とディレクトリ配置（方針6） | OS-014、INFRA | G5（取消しの伝播） | node-runtime-cutover、HIL-FR-27、ADR-009 | 自動切戻しとADR-009の差（Phase 2の判断時に扱う）。G5の統一伝播は新規案 |
| 7 | K3 operation authority tuple | SECURITY-AC-006-01ほかSECURITY Stage 1 | G5の受信側 | authority-vocabulary、security-capability-broker、source-boundary-contracts | 旧の軸（data_classification、sink、impact）の採否 |
| 8 | K9 独立性の記録（製品の要求） | Concept:236（identity・context・authority・review routeで独立性を決め、providerの同異では決めない）。承認済みL3の候補：AC-OS-029-03（`docs/helix-os/L3-requirements/functional-requirements.md:77`。current exact HEADのreview receipt）、AC-INTELLIGENCE-L3-072-08（`docs/helix-intelligence/L3-requirements/functional-requirements.md:564`。candidate生成と独立reviewの段階分離）、LABOのblind評価。開発repoの運用規則（2026-10-08委任判断記録の判断1）は根拠にしない（解禁判断記録の判断3） | — | worker-independent-review（同provider／modelでもidentity・session・contextが独立なら受理）、producer-provenance-separation（PPS-R-03。開発repoの運用規則の起点であり、製品K9の要件としては採らない） | review routeの軸は新規案 |
| 9 | K8 label遷移 | SECURITY-AC-001-01 | — | pillar P8、worker-context-authority、memory-learning-promotion | label伝播（taint型）は新規案 |

G14（外部標準の版固定）はCONNECTのL4で扱い、共通カーネルに含めない。

## 9. K5 状態は証拠から導出（追記専用JSONLとprojection）

本章はPR2で追加する。K1の型とK2の鍵の上に、記録の正本の形と、正本から状態を導くprojectionを定める。

### 9.1 置き場所と範囲

K5は本書と対のL9へ追記する。共通カーネルは一つの設計identityであり、更新し続ける文書は同じファイルを更新する（AGENTS.md「再構築の原則」）。K5はK1の`Observed`、K2の`ResultKey`・K2-I2bの「追記順」・3.4のイベントを直接参照し、8章の計画と付録Aを共有するため、別ファイルに分けると参照と付録が二重になる。PRの範囲はK5の一つの変更目的（正本の記録形式と、projectionの導出の境界）に限り、人が読む差分は本章と対のL9で約155行（表の行が長いため、文字量では目安の上限に近い）である。

ログの置き場所（ディレクトリ）は決めない。方針6の具体的なディレクトリ配置とともに8.2のPR6で決める。本章は記録の形式と規則だけを定める。

### 9.2 由来

| 由来 | 位置 | 要点 |
|---|---|---|
| Concept | `docs/concept/helix-concept.md:308`（原則7） | 意味の正本、実行事実、表示、作業文脈を分けて保ち、再構築できる |
| CONNECT | `CONNECT-AC-005-01`（`docs/helix-connect/L3-requirements/functional-requirements.md:109`） | 記録済みeventを上書き・削除・順序差替えせず、訂正を追記で表す。同identity同digestの重複と異digestの衝突を区別する |
| INTELLIGENCE | `AC-INTELLIGENCE-L3-078-06`（`docs/helix-intelligence/L3-requirements/functional-requirements.md:591`） | repositoryのevent journalからprojectionを再構築する。同じevent集合の順序を変えてもexact setとdigestで比べる。DBを失っても同じjournalから同じprojection・digestを再構築する。DB種別・実装は固定しない |
| INTELLIGENCE | `AC-INTELLIGENCE-L3-078-04`（同:589） | 影響を受けたprojectionのexact setだけをstaleにし、stale projectionの再利用を拒否する |
| INTELLIGENCE | `AC-INT-063-03`（同:691） | 遅着・別順のhistorical outcomeは元のepisodeへ結び、current judgmentを上書きしない |
| LABO | `LABO-001-AC-02`（`docs/helix-labo/L3-requirements/functional-requirements.md:45`） | success-only projectionで非successのeventを除去しない。LABOからsource stateへwritebackしない |
| LABO | `LABO-002-AC-03`（同:149）、`LABO-050-AC-02`（同:1579） | 訂正時に元eventを上書きしない。遅着の再観測は追加し、既存のsource recordを上書きしない |
| HARNESS | `AC-HARNESS-L3-024-05`（`docs/helix-harness/L3-requirements/functional-requirements.md:442`） | 再開時は新eventを追記して影響差分を再評価する |

承認は`docs/governance/l3-l10-po-post-confirmation.md`の各行が示す判断記録による（CONNECT Stage 1：`docs/governance/decisions/helix-connect-stage1-l3-l10-po-decision-2026-10-05.md:22`、INTELLIGENCE Stage 3・Stage 5、LABO Stage 1・Stage 2b・Stage 5、HARNESS Stage 2b）。正本をrepository内の追記専用JSONLにすることはAIの設計判断である（5章）。

### 9.3 型

```text
LogDecl      = { log_id, owner, operations: Operation[], value_encodings, event_types, manifest_writer }
SegmentId    = { log_id, writer, segment_no }      # 一つのsegmentに書くのは一つのwriterだけ
LogEntry     = { schema_version, segment: SegmentId, seq, prev_digest, event, entry_digest }
  seq          = 1から始まる符号なし整数（segmentごと）
  prev_digest  = 同じsegmentのseq-1のentry_digest。seq=1は"genesis"
  entry_digest = Digest(canonical_json({schema_version, segment, seq, prev_digest, event}))
Event        = ResultRecorded | ResultConflictDetected | Correction | SegmentOpened | DeclaredEvent
  ResultRecorded         = { key: ResultKey, key_digest, result: ResultBody, result_digest, producer }
  ResultBody             = Observedのクラスとクラス別field（2.2）。Value.valueとevidenceは次のどちらか
                             - Inline(value)：LogDeclのvalue_encodingsでinlineと宣言した値型だけ
                             - FixedRef{ revision: (GitRevision, path), digest }：repository内の固定実体
  result_digest          = Digest(canonical_json(ResultBody))   # FixedRefは参照のままdigestに入れる
  ResultConflictDetected = { key_digest, result_digests[] }
  Correction             = { target: entry_digest, reason, replacement: DeclaredEvent? }
  SegmentOpened          = { segment }                # manifest segmentにだけ書く
  DeclaredEvent          = { event_type, refs }       # 機構がLogDeclで宣言したevent
SegmentHead  = { segment, seq, entry_digest }
ScopeDecl    = { scope_id, revision, log_id, manifest_head: SegmentHead, segments: SegmentId[] }
Projector    = { identity, version, digest }
Projection   = { projector, scope: ScopeDecl, input_heads: SegmentHead[], output, output_digest }
  output_digest = Digest(canonical_json(output))
Checkpoint   = { projector, scope, input_heads, state, state_digest }
```

- 1行に1つの`LogEntry`を`canonical_json`（3.2）で書き、改行で区切る。
- **復元できる記録形式**（K2との接続）：`ResultRecorded`は`ResultKey`の全field（3.2）と`ResultBody`を持つ。logの行と、`FixedRef`が指すrepository内の固定実体だけから、K2の`ResultRecord`（3.2）を4クラス（`Value`、`Unknown`、`Unobserved`、`NotApplicable`）のまま復元できる。3.4の`ResultRecorded`・`ResultConflictDetected`のfieldは本節の定義で具体化する（3.4をこの範囲で更新した。K2の意味は変えない）。
- **機微な値**：業務payload、secret、credentialの値をeventに入れない（CONNECT-AC-005-01）。`Inline`は、logの所有者が`LogDecl`で宣言した値型（例：pass／fail、compatible／incompatible）だけに使う。それ以外の値と証拠は`FixedRef`で参照する。
- **`FixedRef`の解決**：`(GitRevision, path)`のbytesを読み、SHA-256が`digest`と一致すれば解決できる。読めない、または一致しない場合、その記録は`Unknown(unreadable)`として復元する（元のクラスへ戻さない）。`result_digest`は参照のまま計算するので、解決できない場合もK2の`record`の冪等・競合の判定は変わらない。
- **manifest**：各logに一つ、`manifest_writer`だけが書くmanifest segmentを置き、`SegmentOpened`でそのlogのsegmentを列挙する。manifestのprefixが、ある時点のlogのsegmentの全集合である。
- **scope**：`ScopeDecl`は、projectionが読むsegmentの集合を宣言する。`segments`はmanifestの`manifest_head`までに開いたsegmentの部分集合で、宣言は操作の所有者が持つ（3.2「入力の全集合の宣言は各操作の所有者が持つ」）。全体を読むscopeは、manifestの全segmentを列挙する。

### 9.4 不変条件

- **K5-I1 追記専用**：書いた行のbytesを変えない。消さない。並べ替えない。追記は末尾だけとする。
- **K5-I2 連鎖**：segmentごとに`seq`は1から欠番・重複なく続き、各行の`prev_digest`は直前の行の`entry_digest`に等しく、各行の`entry_digest`は再計算と一致する。`schema_version`は既知の値である。
- **K5-I3 損傷の検出**：次の7条件は互いに独立に検査し、どれか一つでも当たればそのsegmentは損傷している：(a)解析できない行、(b)未知の`schema_version`、(c)`seq`の欠番、(d)`seq`の重複、(e)`prev_digest`の不一致、(f)`entry_digest`の再計算との不一致、(g)指定した`SegmentHead`の`seq`の行が無い、または同じ`seq`の行の`entry_digest`が違う。損傷したsegmentの読取りは`Unknown(unreadable)`とし、当たった条件を`evidence`に入れる。損傷していない部分だけを読んで成功としない。
- **K5-I4 固定prefix**：`project`、`verify`、checkpointは、`input_heads`の各`SegmentHead`までのprefix（`seq`が1から`head.seq`までの行）だけを読む。それより後に追記された行は読まない。現在の末尾は`current_head`で別に取得し、新しい`input_heads`として渡す。
- **K5-I5 冪等な追記**：`ResultRecorded`の追記の前に、logのmanifestが列挙する全segmentを読み、同じ`key_digest`の記録を探す。同じ`result_digest`があれば追記しない（`NoOp`）。異なる`result_digest`があれば、新しい`ResultRecorded`と`ResultConflictDetected`を追記し、前の行は残す（`Conflict`）。読めないsegmentが一つでもあれば、重複を判定できないので追記しない（`Rejected(peer_unreadable)`）。
- **K5-I6 一つの問いは一つのlog**：`ResultKey`の`operation`ごとに、記録先のlogを`LogDecl.operations`で一つだけ宣言する。
- **K5-I7 順序**：順序はsegmentの中の`seq`だけで定まる。K2-I2bの「追記順で最後」は、`(writer, segment_no, seq)`の順で比べて最後とする。`writer`はUnicode NFCに正規化したUTF-8のbyte列として比べ、`segment_no`と`seq`は符号なし整数として数値で比べる。これは決定的にするための規則であり、時間の前後を意味しない（肯定の判定に影響しない。K2-I2b）。
- **K5-I8 訂正**：訂正の木の根は`DeclaredEvent`である。`Correction`の直接の対象（`target`）は、`DeclaredEvent`、または根が`DeclaredEvent`である`Correction`とする。`Correction`を対象にする訂正は、その`Correction`が属する木を延ばす。`ResultRecorded`・`ResultConflictDetected`・`SegmentOpened`は訂正できない（根にも途中にもならない）。結果を改めるには新しいrevisionの鍵で記録し、旧結果はK2-I2によりstaleになる。同じ鍵の異なる結果はK2-I4のconflictとして残す。対象の有効な内容は、対象を根とする訂正の木から次のとおり決める（segmentをまたいでも同じ。追記順は使わない）：訂正が無ければ元の内容。訂正の木が一本の鎖なら、鎖の末端の`replacement`。末端に`replacement`が無ければ「撤回」（元の行は残し、projectionの集計には入れない）。木が分岐していれば（同じ対象への訂正が二つ以上あり、どちらも他方を対象にしていない）、その対象は`Unknown(conflict)`とする。
- **K5-I9 projectionは正本でない**：projectionの出力をlogへ書き戻さない。`record`の入力にしない。projectionからeventを作らない。
- **K5-I10 決定的な再構築**：同じ`projector`、`scope`、`input_heads`からは、行の読込み順やsegmentの並び順によらず、同じ`output_digest`を得る（INTELLIGENCE-078-06）。
- **K5-I11 全量の前提**：projectionは、`scope.manifest_head`までのmanifestを損傷なく読み、`scope.segments`が列挙する全segmentの`SegmentHead`が`input_heads`にあり、そのprefixを損傷なく読めた場合だけ`Value`とする。`input_heads`に欠けたsegmentがあれば`Unknown(missing_input)`、`scope.segments`が0件なら`Unknown(missing_input)`（K1-I4）、損傷・読取不能なら`Unknown(unreadable)`とする。scopeが一部のsegmentだけを宣言するprojectionの「0件」「閉じた」は、そのscopeについての値であり、log全体についての値として扱わない（`scope`は鍵に入る。K5-I12）。
- **K5-I12 projectionの鍵**：projectionはK2の`ResultKey`で次のように扱う。`operation`＝`projector.identity`、`operation_version`＝`projector.version`、`subject`＝`{kind: projector, identity: projector.identity, revision: projector.version, digest: projector.digest}`、`inputs`＝manifestと各segmentの`SegmentHead`（`{kind: log_segment, identity: segmentの正規文字列, revision: seqの10進表記, digest: entry_digest}`）、`scope`＝`scope_id`と`revision`。したがって、segmentへの追記ではK2-I2の4により旧projectionは`Stale`、projectorの版の更新では`operation_version`が変わるためK2-I2の1により`Unobserved(not_run)`、同じ版のままprojectorのbytesだけが変わればK2-I2の2(a)により`Unknown(conflict)`になる。影響を受けないsegmentだけを`input_heads`とするprojectionは変わらない（INTELLIGENCE-078-04）。
- **K5-I13 checkpoint**：checkpointは、その`scope`が同じで、各`input_heads`がcheckpointの`input_heads`を前方に延ばしたもの（同じsegment、checkpointの`seq`以上、checkpointの`seq`の行の`entry_digest`が一致）である場合だけ使える。checkpointの`state_digest`は保存した`state`から再計算して一致を確かめ、差分を畳み込んだ結果は全量の再構築と同じ`output_digest`でなければならない。どれかが成り立たなければ、そのcheckpointを使わず`Unknown(conflict)`とする。

### 9.5 API境界

各受け口は、引数に応じて次を検査し、満たさなければ理由を付けて拒否する。拒否を`Value`へ読み替えない。

- `append(segment, event, writer) -> Appended(SegmentHead) | NoOp | Conflict | Rejected(reason)`：共通に、`writer`がsegmentの`writer`と一致し、segmentがmanifestに列挙されていること。eventの種類別に次を検査する。
  - `ResultRecorded`：`ResultKey`の13field（K1-I6）、`key_digest`と`result_digest`の再計算、`ResultBody`のクラス別field（`Stale`は拒否、`NotApplicable`は3field、`Unknown`・`Unobserved`は語彙）、`Inline`は宣言した値型だけ、`operation`の記録先がこのlog（K5-I6）。K5-I5に従う。
  - `ResultConflictDetected`：`result_digests`が2件以上で、各々が同じ`key_digest`の`ResultRecorded`としてlogにあること。
  - `Correction`：`target`が同じlogの`DeclaredEvent`、または根が`DeclaredEvent`である`Correction`であること（K5-I8）。
  - `SegmentOpened`：manifest segmentへの追記であり、`writer`が`manifest_writer`であること。
  - `DeclaredEvent`：`event_type`が`LogDecl.event_types`にあること。
- `current_head(segment) -> Observed<SegmentHead>`：損傷なく読めた末尾。
- `read(segment, head) -> Observed<LogEntry[]>`：`head`までのprefixをK5-I2・I3で検査する。
- `restore(log, scope, input_heads) -> Observed<ResultRecord[]>`：K5-I4の固定prefixとK5-I11の完全性（manifest、`scope.segments`の全head、損傷の無いprefix）を`project`と同じ規則で検査したうえで、prefixの`ResultRecorded`から`ResultRecord`を復元し、`FixedRef`を解決する（9.3）。K2の`lookup`の`records`は、`restore`が`Value`を返した場合のその記録集合だけとする。`restore`が`Unknown(missing_input)`や`Unknown(unreadable)`を返した場合は、部分の記録集合を返さず、`lookup`を呼ばず、照会の結果をその非`Value`とする。K2の`lookup`は渡された集合の外の欠落を検出できないため、完全性は`restore`で確かめる。scopeが一部のsegmentだけを宣言する場合は、そのscopeの記録集合として扱い、照会の鍵の`scope`と一致するときだけ使う。
- `project(projector, scope, input_heads) -> Observed<Projection>`：K5-I4、I8〜I11に従う。
- `verify(projection, checkpoint?) -> Observed<Projection>`：(1)保存した`output`から`output_digest`を再計算して保存値と比べる、(2)`input_heads`のprefixから再構築した`output_digest`と比べる、(3)checkpointを使う場合はK5-I13を確かめる。どれかが一致しなければ`Unknown(conflict)`とし、そのprojectionを使わない。projectorの版やdigestが違う二つのprojectionの差はこの不一致ではなく、K5-I12の鍵の違いとして扱う。

### 9.6 旧HELIXとの対応

| 旧source（ID／path:行／SHA-256） | 保持する点 | 変更する点 | 区分候補 |
|---|---|---|---|
| `LEGACY-ASSET-BB08D70A42B6445B2D1E`／`docs/design/helix/L4-basic-design/event-projection-checkpoint-replay.md:36-42,62-64,78-89,119-122`／`9e18d68b5e463192fb30b839eb164d79f7202a15374482f65181b238df8e513d` | append-onlyで訂正は追記だけ。同一event_idで同じdigestはno-op、異なるdigestは拒否。projectionはevent列から再構築する派生物で、編集を逆流させない。projectionとread-backの不一致はfail-close。全体scopeのdigestをlaneのcheckpointに流用すると無関係な追記で誤ってdriftになる | 旧27-30行は`harness.db`を計画・状態のauthorityとした。本書は正本をrepository内のJSONLに置き、DBを置かない（5章）。異なるdigestは拒否でなく両方を残してconflictにする（K2-I4、K5-I5）。laneのcheckpointをsegmentとprojectionの`input_heads`へ一般化する | `semantic_rederive` |
| `LEGACY-ASSET-C35E93F2D36777CD7462`／`docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md:145-153`／`2a757a52082f823c4e52ae1e04887b62b8ac5f5df0d833d2b1c00516d6572357` | append-only event→projection→checkpointの共通形。`event_seq`を一意かつ単調にし、`previous_event_digest`と`event_digest`で鎖状に結ぶ。canonical JSON Linesで追記する。同じoperation IDと同じdigestは重複として除き、異なるdigestはconflict | 連鎖の単位をaggregateからsegment（writerごと）へ替える。UPDATE/DELETE拒否triggerとDB transactionは置かず、K5-I3の読取り時の検査で代える | `semantic_rederive` |
| `LEGACY-ASSET-8771887517A619A2D501`／`docs/adr/ADR-007-harness-db-sqlite-projection.md:18-22`／`50c05a00872be6c23de531aaecd6a6cfd26abec264718e0223ac2630f739dcdf` | projectionは再構築でき、authoring sourceではない | 正本と保存の形式（5章のとおり） | `replace`（保存の形式） |
| `LEGACY-ASSET-9EDE8332CF4F627105EA`／`docs/design/harness/L6-function-design/handover-db-derivation.md:35-38`／`e95e612c601ccb226b90e515eca633439745bb9a2266c889031ef7518c39d18d` | eventを先に追記し、event IDとpayload digestで冪等に投影する。append後・projection前はreplayする。同じsequenceで異なるpayloadはfail-close | 投影先をSQLiteからprojectionの純関数へ替える。同31行の「DBとmemoryが矛盾すればDB優先」は採らない（DBを置かない） | `semantic_rederive` |
| `LEGACY-ASSET-F6E9EA3422A0EF1DF090`／`docs/design/harness/L6-function-design/feedback-lifecycle.md:76-104`／`2e0a028fc48c6acc92a5b09ada9fc511ed0389b71af9deee782ec81aa731a655` | 終端（closed／superseded）は再投影で戻らない。新しい観測は新generationとして扱う。不在によるcloseは、canonical sourceの完全走査markerが揃う場合だけ | feedbackの状態機械を、K5-I9（eventだけが状態を変える）とK5-I11（全量の前提。完全走査markerをmanifestと`ScopeDecl`へ一般化する）、K2のrevisionへ一般化する | `semantic_rederive` |
| `LEGACY-ASSET-F677F6D81EB9FCAE2E3F`／`docs/governance/handover-retirement-memory-audit-2026-07-11.md:34-35,56,81`／`93b4a0bd78ebc88266eb3d795ad29384169a1fa8698691acbb724984f462d8b4` | 失敗史：状態を保存するpointer（`CURRENT.json` 311,927 bytes）の肥大と、手書きmarkerのdriftを防衛機構で根絶できなかった。projectionがopenを再生成し、close済みのfeedbackが復活した（open=2010で飽和） | 状態を保存しない（K5-I9）。「閉じた」を全量の前提でだけ出す（K5-I11） | 失敗史（区分なし） |
| `LEGACY-ASSET-6929C09B95A444D95B49`／`docs/improvement-backlog.md:258,260`（IMP-149、IMP-151）／`e6d327ff488860dcaa8d7a150ac893e5cf0940eb710396cdf7ae746f5689a9e2` | 失敗史：projectorの誤検出がrebuildの度に誤ったdriftを出した。470MBのDBの全件読取りで長時間停止した（独立検証では「不確実」） | projectorの版を鍵に入れ、projectorの修正を別の問いとして扱う（K5-I12、9.5の`verify`）。読む範囲を宣言した`input_heads`に限り、checkpointの等価性を検査する（K5-I13）。規模の数値は9.8の試作で測る | 失敗史（区分なし） |

writerごとにsegmentを分けることと、segmentをまたぐ順序を時間の前後と結ばない規則（K5-I7）は、旧HELIXに対応が見つからない**新規案**である。旧は一つのaggregateの中の単調な`event_seq`を前提にしていた（`infinity-loop-platform-basic-design.md:145-153`、`handover-db-derivation.md:35-38`）。検索の範囲は`archive/legacy-generation-2026-09-14/root/docs/design/`配下（`grep -rIl`、読取りだけ）で、検索語と該当ファイル数は`segment` 14、`hash chain` 3、`hash-chain` 6、`previous_event_digest` 8、`prev_digest` 0、`writer別` 0である。`segment`の14件はpathの区切りやIDの区切りの意味であり、ログの分割の意味のものは無かった。連鎖の語の該当は、いずれも一つのaggregateまたは一つのinstanceの中の連鎖だった。

`manifest_writer`だけがsegmentを登録する規則（9.3、9.5）と、読めないsegmentがあるときに追記しない規則（K5-I5の`peer_unreadable`）は、AIの設計判断である。保持する点は、旧feedback-lifecycle（`feedback-lifecycle.md:94-104`）の、完全走査markerが揃う場合だけ不在を確定する考え方と、旧event-projection-checkpoint-replay（`event-projection-checkpoint-replay.md:38`）・旧infinity-loop（`infinity-loop-platform-basic-design.md:145-147`）の、同じidentityで異なるdigestを検出する考え方である。変更する点は、markerをsource tableごとの印からmanifest segmentへの追記で表し、登録する主体を一つに限ること、重複の照合で読めないsegmentがあれば追記しないことである。理由は二つある。manifest自体を複数のwriterが書くと、segmentと同じくgitのbranchで連鎖が壊れる（K5-I1・I2）。読めないsegmentに同じ鍵の異なる結果があるのに追記すると、K2-I4の競合の保持を見落とす。

### 9.7 L2へ戻す論点

1. **末尾の削除の検出**：既知の`SegmentHead`を持たない読み手は、segmentの末尾の削除を検出できない。repository外に末尾を固定するか（調査資料のG9）は、要求の意味に触れるため決めない。
2. **保持期間と圧縮**：logが増え続ける。古い行を圧縮・退避してよいか、その場合に何を正本とするかを定める承認済みのACは見つからなかった。

### 9.8 未決と試作で確かめること

- segmentの`writer`の粒度（lane、Worker、PRのいずれか）と、segmentを閉じる条件。8.2のPR6（ディレクトリ配置）と合わせて決める。
- manifestへのsegmentの登録は`manifest_writer`だけが行うため、writerがsegmentを開くときの手順（OSの割当てとの接続）は未決とする。
- K5-I5により、一つのsegmentが読めないとそのlogへの`ResultRecorded`の追記が止まる。安全側の選択だが、運用への影響を試作で確かめる。
- 試作（`scaffold/`、Scaffold Binding登録）：L9のIV-K5-01〜21を動かす。あわせて、1万行・10万行のsegmentでの全量再構築とcheckpointからの差分の時間を測り、checkpointを必須にする規模の目安を得る。

## 10. K6 検証receiptとE その真正性

本章はPR3で追加する。検証器が出す証拠（receipt）の形と、それを信じてよい条件を、K1の型、K2の鍵、K5のlogの上に定める。

### 10.1 範囲と切り方

8.2の計画のPR3は、K6、E、G8（実行物の検証）、Phase 1の条件の具体を一つにしていた。本PRはK6とEに限り、G8とPhase 1の条件の具体は次のPR（8.2のPR3b）に分ける。理由は二つある。G8の「実行物を検証した証拠」とPhase 1の「検査器が配線され実行された証拠」は、どちらも本章のreceiptと検証器の集合を参照する。運用モデル「PRの原子性」の「参照する共通部品は先行PRで閉じる」に従い、先に閉じる。また、四つを一つのPRにすると、人が読む差分が目安の400行を大きく超える。

### 10.2 由来

| 由来 | 位置 | 要点 |
|---|---|---|
| Concept | `docs/concept/helix-concept.md:105`、`:307`（原則6） | 誰が・何を・どの版で・どうなったかを結ぶ。対象の版、実体、独立レビュー、結果の読み直しで完了を判定する |
| HARNESS | `AC-HARNESS-L3-022-02`（`docs/helix-harness/L3-requirements/functional-requirements.md:231`） | oracle・receiptが不足する品質は未評価のままとし、上位stateを作らない |
| HARNESS | `AC-HARNESS-L3-031-02`（同:269） | 各段階のreceiptを同じoracle・scope・revision・environmentへ結ぶ。receiptが無い、または別のscope・revisionなら拒否する |
| HARNESS | `AC-HARNESS-L3-032-05`（同:288） | 受け渡しを実行・合格・承認へ変換しない。後続receiptなしにstateを昇格させない |
| HARNESS | `AC-HARNESS-L3-036-02`（同:609） | local・CIのgateの条件の一致を照合し、run・result・receiptはOSが担う |
| SECURITY | `SECURITY-FR-031-03`（`docs/helix-security/L3-requirements/functional-requirements.md:352`） | runtimeの出力や自己申告だけでは、canonicalな証拠・受入・merge等を作れない |
| SECURITY | `SECURITY-AC-012-01`（同:222） | source・producer・version・digest等の不明なfieldを列挙し、不明のままtrustedへ昇格させない |
| OS | `AC-OS-018-01`（`docs/helix-os/L3-requirements/functional-requirements.md:161`） | exactなticket・head・要求revision・authority・Workerと成果・証拠を辿る。作成したWorkerの出力を自己承認にしない |
| OS | `AC-OS-023-02`（同:194） | revision・digest・authority・証拠が一致しなければunresolvedとする |
| OS | `AC-OS-029-03`（同:77） | review receiptはcurrent exactなHEAD・base・scope・oracle・結果を束縛する |

承認は`docs/governance/l3-l10-po-post-confirmation.md`の各行が示す判断記録による（HARNESS Stage 2a・2c・3、SECURITY Stage 1・2c、OS Stage 2a・2c）。信頼の根を「版とdigestで固定した検証器の集合」とし、署名を後回しにすることはAIの設計判断である（5章）。開発repoの運用規則（作成と別系統のreview）は、本章の根拠にしない（解禁判断記録の判断3）。

### 10.3 型

```text
VerifierRef   = { identity, version, digest }               # digestは検証器のcodeと設定の全bytes
VerifierEntry = { ref: VerifierRef, deterministic: Bool, checks: { CheckId -> PolarityOfの識別と版 } }
VerifierSet   = { set_id, revision, members: VerifierEntry[], required_for: { operation -> identity[] } }
                # repository内の固定実体（9.3のFixedRef）として置き、digestで固定する
ReceiptBody   = { verifier: VerifierRef, verifier_set: SubjectRef, key: ResultKey,
                  read: { identity -> Digest },              # 検証器が実際に読んだbytesのdigest
                  execution: { argv_digest, exit, outputs: FixedRef[], started, completed },
                  registry: { registered: CheckId[], evaluated: CheckId[] },
                  inner: Combined,                           # 検査ごとの成分の合成（K1）
                  authority_effect: "none" }
AdmittedReceipt = { body: ReceiptBody, reverifiable: Bool,   # reverifiableは集合のdeterministicから導く
                    reproduction: Observed<...>,             # reverifyの結果。未実施はUnobserved(not_run)
                    issuer_authenticity: Unknown(unsupported) }  # 署名が無い間は常にこの値（10.5）
RequiredResult  = { combined: Combined, assurance: { identity -> AdmittedReceiptの真正性3項目 } }
```

- **基底鍵とreceipt鍵**：操作の対象を表す鍵を基底鍵（`base_key`：`operation`、`subject`、`inputs`、`scope`）とする。集合の検証器`m`のreceipt鍵は、基底鍵の`operation_version`を`m.version`に置き、`inputs`へ`{kind: verifier, identity: m.identity, revision: m.version, digest: m.digest}`と`{kind: verifier_set, identity: set_id, revision, digest}`を加えたものとする。検証器ごとに鍵が違う。receiptはこの鍵でK2の記録（K5の`ResultRecorded`）として残し、結果の`Value`は`ReceiptBody`を指す`FixedRef`とする。
- **K2による照会の結果**：receipt鍵の照会は、K2-I2の規則どおりである。旧記録が`Value`で、identityの集合を保ったまま正当なrevisionの更新（対象・入力・集合の新revision）があれば`Stale`。同じrevisionでdigestだけが違えば（対象・入力・検証器・集合のいずれでも）`Unknown(conflict)`。検証器の版の更新は`operation_version`が違うため`Unobserved(not_run)`。identityの集合の追加・削除・置換も`Unobserved(not_run)`。
- **readの期待集合**：`read`のidentityの集合は、鍵の`subject`と、`inputs`のうち`kind`が`verifier`・`verifier_set`でないものの全identityと、ちょうど一致しなければならない。検証器と集合は「読んだ入力」でなく実行の主体であり、K6-I2で照合する。
- `started`と`completed`は記録するだけで、順序や有効性の判定に使わない（時間の閾値はL2へ戻す論点。6章1）。

### 10.4 不変条件

- **K6-I1 発行者**：`ReceiptBody`の`execution`、`read`、`registry`、`inner`は、検証器が自分の実行から作る。呼出し側が渡した値を入れない（`run`の受け口は鍵だけを受け取る）。
- **K6-I2 集合への所属**：receiptを使えるのは、`verifier`が、鍵に入れた`verifier_set`の`members`の`ref`に`identity`・`version`・`digest`の全部で一致する場合だけとする。一致しなければ`Unknown(unregistered)`とする。`deterministic`と各検査の写像（`PolarityOf`）は集合の`VerifierEntry`から読み、receiptの側の申告を使わない。
- **K6-I3 鍵と本体の一致**：`ReceiptBody.key`、`verifier`、`verifier_set`は、照会したreceipt鍵（10.3）と記録の鍵の両方に一致しなければならない。一致しなければ`Unknown(conflict)`とする。
- **K6-I4 readの完全性**：`read`のidentityの集合が10.3の期待集合より少なければ（空を含む）`Unknown(missing_input)`、多ければ`Unknown(conflict)`、各digestが鍵の`digest`と違えば`Unknown(conflict)`とする。
- **K6-I5 実体の再計算**：`outputs`の各`FixedRef`は、bytesを読んでSHA-256を再計算し、記録したdigestと比べる。一致しなければ`Unknown(conflict)`、読めなければ`Unknown(unreadable)`とする。digestの一致は「そのbytesである」ことの証拠に限る。
- **K6-I6 登録と評価の照合**：`inner`の成分は、`registry.registered`の各検査を一つずつとし、評価されていない検査は`Unobserved(not_run)`、登録されていない検査の結果は`Unknown(unregistered)`の成分とする。各成分の`PolarityOf`は集合の`VerifierEntry.checks`のものを使う。`inner`は記録したものを使わず、成分と集合の写像からK1の`combine`で再合成し、記録と違えば`Unknown(conflict)`とする。`registered`が0件なら`set_reason = Unknown(missing_input)`（K1-I4）。
- **K6-I7 必要な検証器と合成**：`required`は次の順で`RequiredResult`を作る。(1)K5の`restore`で操作のscopeの記録集合を得る。`Value`でなければ、必要な全検証器の成分をその非`Value`とする。(2)必要な各検証器`m`のreceipt鍵を10.3で導き、`lookup`する。(3)`Value`なら`admit_receipt`し、受け入れられたら、その`inner`の全成分（`set_reason`は`Unknown(missing_input)`の成分として）を、検証器`m`と検査の識別を付けて外側の成分に加える。(4)`lookup`や`admit_receipt`が`Value`でなければ、その非`Value`を`m`の成分とする。(5)全成分を、成分ごとの`PolarityOf`で一つの`combine`へ渡す。receiptが「ある」ことを肯定へ写さない。内部の否定・非`Value`・`set_reason`はすべて外側の成分に残り、内部が`Undetermined`なら外側も肯定にならない。必要でない検証器のreceiptは成分に入れない。
- **K6-I8 再現の確認**：`reverifiable`（集合の`deterministic`）の検証器のreceiptは、同じ検証器を同じ入力で再び実行し、`inner`のdigestが一致することを確かめられる（`reverify`）。一致すれば`reproduction`は`Value`、しなければ`Unknown(conflict)`、`reverifiable`でなければ`Unknown(unsupported)`とする。`reverify`が保証するのは「固定した入力で同じ結果が再現する」ことだけであり、過去にその実行が行われたことや、receiptを書いたのが検証器であることは保証しない（10.5）。
- **K6-I9 不変と訂正**：receiptは訂正できない（K5-I8）。誤ったreceiptは、同じ鍵の別の結果としてK2-I4のconflictに残るか、検証器の新しい版で記録し直す。
- **K6-I10 authorityを作らない**：`RequiredResult`が肯定でも、承認、merge、受入、要求意味、工程の完了を生成しない（`authority_effect: "none"`）。消費側へは`combined`と`assurance`（`reverifiable`、`reproduction`、`issuer_authenticity`）を一緒に渡し、消費側は`reproduction`が`Value`でない成分や`issuer_authenticity`を、再現を確かめた成分と同じに扱わない。

### 10.5 E：署名が無い間に検出できること・できないこと

| 改変・すり替え | 検出 | 規則 |
|---|---|---|
| 記録後のreceipt行・本体・出力の改変 | できる | K5-I3、K6-I5、`FixedRef`のdigest |
| 別の入力に対するreceiptの流用・本体の差替え・readの欠落 | できる | K2-I1、K6-I3、I4 |
| 集合に無い検証器、bytesの違う検証器のreceipt | できる | K6-I2、K2-I2の2 |
| 必要な検証器のreceiptが無い、登録した検査が評価されていない | できる | K6-I6、I7 |
| 決定的な検証器について、再現と違う結果を持つ偽のreceipt | 再現の確認でできる | K6-I8 |
| 決定的な検証器について、実行していないのに、再現と同じ結果と整合したdigestを持つreceiptを書く | できない（結果は正しいが、過去の実行の事実は証明されない） | `issuer_authenticity`は常に`Unknown(unsupported)` |
| `execution`の欄（argv、exit、時刻）だけを、整合したdigestで書き換える | できない（再現の確認は`inner`だけを比べる） | 同上 |
| 決定的でない検証器（LLMの判断等）について、整合した偽のreceiptを書く | できない | 同上。`reproduction`も`Unknown(unsupported)` |
| repositoryの履歴ごとの書換え | できない | 10.8 |

### 10.6 API境界

- `run(verifier, base_key) -> ResultRecorded`：検証器の側の受け口。基底鍵だけを受け取り、receipt鍵を10.3で導き、K6-I1に従って`ReceiptBody`を作り、K5の`append`へ渡す。鍵以外の入力（結果、digest、exit等）を受け取る経路を置かない。
- `admit_receipt(record, query_key, verifier_set) -> Observed<AdmittedReceipt>`：K6-I2、I3、I4、I5、I6の順に検査し、最初に当たった規則の結果を返す。当たった条件はすべて`evidence`に記す。全部を通れば`Value(AdmittedReceipt)`（`reproduction`は`Unobserved(not_run)`）。
- `reverify(admitted) -> Observed<AdmittedReceipt>`：K6-I8に従い、`reproduction`を埋めて返す。
- `required(operation, base_key, verifier_set, reverify: Bool) -> RequiredResult`：K6-I7に従う。`reverify`を指定した場合は、受け入れた各receiptに`reverify`を適用する。

### 10.7 旧HELIXとの対応

| 旧source（ID／path:行／SHA-256） | 保持する点 | 変更する点 | 区分候補 |
|---|---|---|---|
| `LEGACY-ASSET-8E9E06111D6FE1538308`／`docs/design/helix/L4-basic-design/work-graph-receipt-acceptance.md:17-35`／`db4eb979037a611e51edaab22fe31f774fd7038d7ffb72bcf26ece6fb9de8b42` | receiptを同じHEADへ束縛する。未来のreceiptの先書きと、自己承認を拒否する | 委譲→review→終了→受入の三段は本章で固定しない（K9とOSの設計で扱う）。束縛をHEADからK2の鍵へ広げる | `semantic_rederive` |
| `LEGACY-ASSET-A4EAB5E3345E3C125C77`／`docs/design/helix/L4-basic-design/worker-lifecycle-receipt.md:16-31`／`d39b3cdc2e7d9f72ad03d0d3db5571a6b0de579fadf0b147b8a6d4f90dc2ed2c` | 実行をhash-chainのeventとして残し、HEAD・出力・reviewを一つのreceiptへ束縛する。複写・未封印のreceiptを拒否する | 連鎖はK5のsegmentで持ち、receipt自身には持たせない | `semantic_rederive` |
| `LEGACY-ASSET-78704C8347EBDD58FC52`／`docs/design/helix/L6-function-design/gate-evidence-substance.md:15-47`／`6f4a3cdbf5e66071525e6d4b76df2a8c9bedea355338321c5ea597cc1dd73ba6` | manifestの自己申告digestを実測とみなさず、bytesのSHA-256と照合する。digestの一致はbytesの一致の証拠に限り、実行の証拠と区別する。失敗史：保存済みの5commandのうち4件がdigest不一致で、5件ともtest sourceを参照していた | gateごとの照合を、全receiptの`outputs`の再計算（K6-I5）へ一般化する | `semantic_rederive` |
| `LEGACY-ASSET-901EFEC93D536D3AA418`／`docs/design/harness/L6-function-design/closure-evidence-materialization.md:13-15,56,67-76`／`a8951a0cdd590da84612de8c6b6e5960ca5c32ad3b3d0c0d0511b9f5789c0264` | 呼出し側の自己申告でない証跡。receiptのfieldはspawnしたprocessの実行から内部で作り、caller入力を禁止する。local hash単独では真正性を主張しない | 信頼の根をGitHub required-checkから、repositoryで固定した検証器の集合へ替える（5章の設計判断） | `replace`（信頼の根） |
| `LEGACY-ASSET-C4B746501A6562E3F8B4`／`docs/design/helix/L3-requirements/predecessor-harness-mechanism-hardening-requirements.md:53`（UTH-FR-022）／`c0978eae37f6c7c8e113191404c0fd76328818e438b0ea5b3cf98ebd489a6639` | 証拠はcommand、argv digest、scope、HEAD、exit、開始・終了、artifact digest、runnerを持ち、時刻・prose・自己申告だけを受理しない | HEADとscopeをK2の鍵で表す | `semantic_rederive` |
| `LEGACY-ASSET-0327D0DF98618D3066FD`／`docs/design/harness/L6-function-design/source-boundary-contracts.md:65-66`／`81ec7bb938d659e17ce59ddd7071f527511c585e71b89123be1c8bd505facd8a` | 固定したissuerだけを信頼し、自己発行のreceiptを拒否する | 署名の検証を後回しにし、集合への所属（K6-I2）と再現の確認（K6-I8）で一部を代える。再現の確認は結果の再現だけを保証し、発行者の真正性は代えられない。代えられない範囲を10.5に明記し、`issuer_authenticity`として消費側へ渡す | `semantic_rederive` |
| `LEGACY-ASSET-D107FD145A2588FAAD09`／`docs/design/helix/L4-basic-design/worker-independent-review.md:20`／`9fff293ed71c7a0be0e4dfcd7a5cca70eaacfdbf2cd553a605fd15510a3c99b3` | actorは実行の側から導き、receiptでの自己申告を受け付けない | なし（K6-I1として再導出） | `semantic_rederive` |
| `LEGACY-ASSET-6CC1A5B9E9472F1100AF`／`src/doctor/check-registry.ts:20-40`／`07e52e804cb83b74ec3026a25baca593e35f8f2107c581adc8afdf6a93fbb581` | 登録したhardの検査の件数と評価した件数を別に数える | 件数でなく検査ごとの成分にし、未評価を`Unobserved`とする（K6-I6）。srcは除外classのため参照だけ | `semantic_rederive`（参照のみ） |
| `LEGACY-ASSET-ED86DAA9D6A1511A591C`／`src/lint/pin-chain-derivation.ts:6-7`／`5f81fa005896bd34f66538084eabdf627b1df9025285a020bae4c0976fcaaca6` | 決定的なpinと意味のreviewのpinを分ける | 集合の`deterministic`として持ち、再現の確認の可否を分ける（K6-I8）。srcは参照だけ | `semantic_rederive`（参照のみ） |
| `LEGACY-ASSET-C0F9CE549442BA1D551E`／`docs/plans/PLAN-L7-428-enforcement-wiring-gap.md:87-110`／`dd527d30dfb5a601008656d4d38c0cdefcf44aa9cbe277bccc5fad4b8c81751c` | 失敗史：人のgateを外す根拠にした判定moduleが実行経路から到達できず、単体testだけがgreenだった | K6-I7の根拠。実行の証拠を必要な検証器ごとのreceiptにし、receiptの存在を肯定へ写さない | 失敗史（区分なし） |
| `LEGACY-ASSET-B8D84651753481B5F2B9`／`docs/governance/operations-rule-audit-2026-07-26.md:48`（ORA-015）／`d32bb1a780a36cd0710cbd58d575e900ac14c154a0e84f5dc92423b46c01466e` | 失敗史：全digestを再計算したと主張しながら、別HEADのdigestを載せていた | K6-I4の`read`（実際に読んだbytesのdigest）の根拠 | 失敗史（区分なし） |
| `LEGACY-ASSET-EC07511FF3E241F15359`／`docs/design/design-catalog.yaml:838`／`4cf182ed5e983bb36cf0f61d69f2749c19b6612e5311aafbe2cb73dee6321864` | 署名・attestationは旧でも未設計（todo）だった | 本書も後回しにし、検出できない範囲を10.5に記す | 記録のみ |

先行例として、現行の仮組み`scaffold/l3l10-checks/`（`SCF-B-0157`）のreceipt（`README.md`の「receiptの形」、SHA-256 `1112465d14bc6112509779ddff50148839469234a26d39faeff474ecf8ddff34`）を読んだ。検証器のsource digest、入力のrevisionとdigest、登録と評価の照合、検査ごとの3値、`authority_effect: none`を持つ。仮組みであり、本設計の正本や合格の証拠にしない。

### 10.8 L2へ戻す論点

1. **receiptの発行の真正性**：決定的な検証器でも、実行していないのに再現と同じ結果を持つreceiptや、`execution`の欄だけを書き換えたreceiptは、再現の確認では検出できない。決定的でない検証器（LLMの判断等）のreceiptは、結果も再現できない（10.5）。過去の実行と発行者の真正性を確かめるには、署名またはrepository外への固定（調査資料のG9）が要る。それを求めるかは要求の意味に触れるため決めない。本書は、消費側が`issuer_authenticity`と`reproduction`を区別して持つことまでを定める。

### 10.9 未決と試作で確かめること

- 各操作に必要な検証器（`required_for`）を誰がどう宣言するか。検証義務のK4（8.2のPR4）で決める。
- `VerifierSet`の置き場所。ディレクトリ配置とともに8.2のPR6で決める。
- 試作：`scaffold/l3l10-checks/`のreceiptを本章の形へ写し、L9のIV-K6-01〜15を動かす。

## 11. G8 実行物の検証

本章と12章はPR3bで追加する。sourceを確かめた証拠と、配布・実行されるbytes（実行物）を確かめた証拠を分け、両者をbuildの記録で結ぶ。

### 11.1 範囲と由来

本PRはG8（11章）とPhase 1の条件の具体（12章）を扱う。どちらも10章のreceiptと検証器の集合だけを参照し、人が読む差分は二つ合わせて目安の範囲に収まるため、一つのPRにした。

| 由来 | 位置 | 要点 |
|---|---|---|
| SECURITY | `SECURITY-AC-013-01`（`docs/helix-security/L3-requirements/functional-requirements.md:236`） | build・検証済みartifactと配布・実行artifactのidentity・digest・provenance・producerが同じ鎖で一致する。producerの欠落を他のfieldで補完しない。digestの一致だけからsourceの信頼や検証の合格を推定しない |
| SECURITY | `SECURITY-AC-012-01`（同:222）、`SECURITY-AC-010-01`（同:194） | source・producer・version・digest等の不明なfieldを列挙し、不明のままtrustedへ昇格させない。新しい実行物の出現を追う |
| HARNESS | `AC-HARNESS-L3-010-03`（`docs/helix-harness/L3-requirements/functional-requirements.md:39`） | 同じ宣言入力とpackの版から同じ成果物を得る |
| HARNESS | `AC-HARNESS-L3-017-02`、`017-03`（同:390-391） | 別revisionの証拠や成果物identityの不一致ではeligibleにしない。同一入力からのartifactの再現性を比べる |
| OS | `AC-OS-014-04`（`docs/helix-os/L3-requirements/functional-requirements.md:24`） | 段階はpackの版、configuration等を同じrevisionの組へ結ぶ。source tagだけを段階としない |

承認は`docs/governance/l3-l10-po-post-confirmation.md`の各行が示す判断記録による（SECURITY Stage 1、HARNESS Stage 1・2b、OS Stage 2b）。

### 11.2 型

```text
ArtifactRef   = SubjectRef{ kind: artifact, identity, revision, digest }  # digestは配布・実行されるbytes全体
SourceRef     = SubjectRef{ kind: source, ... }
BuildManifest = [{ artifact: ArtifactRef, output: FixedRef }]  # builderが作る。生成した各artifactの識別とbytesの対応
BuildReceipt  = 10章のreceiptで、operation = build、subject = SourceRef、
                inputs = build入力（依存、設定、toolchain）＋builder（kind: verifier）＋集合、
                execution.outputs = [BuildManifestのFixedRef]＋各artifactのFixedRef
ChainResult   = { build: AdmittedReceipt, artifact: ArtifactRef, artifact_reproduction: Observed<...> }
```

builderは`VerifierSet`のmemberとして固定し、build操作の`required_for`に挙げる（10.3）。実行物に対する検証（test、scan、review）のreceiptは、`subject`を`ArtifactRef`とする。`BuildManifest`はK6-I5により他の出力と同じくbytesを再計算して確かめる。artifactの`identity`はsourceの`identity`と別の値にする（AIの設計判断。同じ値にすると、K2では`kind`の違いが`Unknown(conflict)`として現れる）。

### 11.3 不変条件

- **G8-I1 対象の区別**：実行物の照会の鍵は`subject`が`ArtifactRef`である。sourceの`identity`と違えば、sourceのreceiptは候補にならず`Unobserved(not_run)`（K2-I2の1）。同じ`identity`で`kind`だけが違えば`Unknown(conflict)`（K2-I2の2(b)）。いずれの場合も、sourceのreview・testのreceiptを実行物の肯定へ写す写像を置かない。
- **G8-I2 buildの鎖**：実行物`X`（`ArtifactRef`）がsource `S`から作られたと言えるのは、次の二つを別々に満たす場合だけとする。(a)**buildの受入**：`S`のcurrentの基底鍵からbuilderのreceipt鍵を導き（10.3）、`restore`→`lookup`→`admit_receipt`を通る。非`Value`ならその結果を返す（`Stale`、`Unknown(conflict)`、`Unobserved(not_run)`、`Unknown(unreadable)`等）。(b)**鎖の照合**：受け入れた`BuildManifest`に`artifact.identity`が`X.identity`の項目があり、その`artifact.revision`と`artifact.digest`が`X`と一致し、`output.digest`が`X.digest`と一致する。項目が無ければ`Unobserved(not_run)`（そのbuildは`X`を作っていない）、`revision`か`digest`が違えば`Unknown(conflict)`とする。producerは(a)のbuilderであり、builderの識別を欠くreceiptは(a)で拒否され、他のfieldで補わない。
- **G8-I3 使う直前の再計算**：実行物を配布・展開・実行する受け口は、その時点のbytesのSHA-256を再計算し、`X.digest`と比べる。違えば`Unknown(conflict)`とし、展開・実行しない。sourceとsourceのreceiptが変わっていなくても、配布物だけが差し替えられればここで検出する。
- **G8-I4 artifactの再現**：builderが集合で`deterministic`なら、同じ`S`とbuild入力で再びbuildし、新しい`BuildManifest`の`X.identity`の項目の`digest`を`X.digest`と比べ、`artifact_reproduction`とする（一致で`Value`、不一致で`Unknown(conflict)`、項目が無ければ`Unobserved(not_run)`、決定的でなければ`Unknown(unsupported)`）。これはK6-I8の`reproduction`（`inner`の再現）とは別の比較であり、両方を`ChainResult`と`AdmittedReceipt`に別々に持つ。どちらが一致しても、過去にそのbuildで配布物が作られたことは保証しない（`issuer_authenticity`は`Unknown(unsupported)`のまま。10.5）。
- **G8-I5 合格は別の証拠**：buildの鎖とdigestの一致は、実行物の検証の合格を意味しない。実行物の合格は、`subject`が`X`の必要な検証器のreceiptを`required`で合成した結果だけによる（K6-I7）。
- **G8-I6 段階の構成**：段階（v0.x）の記録は、含むpackの`ArtifactRef`の組を持ち、source tagやsource revisionだけで段階を表さない（AC-OS-014-04）。

API：`build_chain(S, X, verifier_set) -> Observed<ChainResult>`は、G8-I2の(a)、(b)の順に検査し、最初に当たった結果を返す。`rebuild_compare(chain) -> Observed<ChainResult>`はG8-I4に従い`artifact_reproduction`を埋める。`admit_artifact_bytes(X, bytes) -> Observed<ArtifactRef>`はG8-I3に従う。

### 11.4 検証器自身の配布物：扱える範囲と扱えない範囲

| 対象 | 扱い |
|---|---|
| どのbytesの検証器を信じるか | 扱える。集合で`identity`・`version`・`digest`を固定し、receiptの鍵に入れる（K6-I2） |
| 検証器のbytesが集合と違う | 扱える。同じ版でbytesが違えば`Unknown(conflict)`（10.3） |
| 検証器が使うtoolchain（interpreter、library） | 宣言した範囲で扱える。`kind: toolchain`の入力として鍵に入れれば、K2-I2のとおり、identityを保った新revision（旧記録が`Value`）で`Stale`、同じrevisionでbytesだけの変更で`Unknown(conflict)`、toolchainのidentityの追加・削除で`Unobserved(not_run)`、旧記録が非`Value`なら`Unobserved(not_run, superseded)`になる。宣言しなければ検出しない |
| 実行したprocessが、固定したbytesを本当に実行したか | 扱えない。署名やrepository外の固定、実行環境の証明が要る（10.5、11.6） |
| 検証器の論理の誤り（不正な入力を合格にする欠陥） | digestの固定では扱えない。固定は「どのbytesか」を決めるだけで、そのbytesが正しく判定することを保証しない。回帰コーパス（12章）で既知の型だけを確かめる |

### 11.5 旧HELIXとの対応

| 旧source（ID／path:行／SHA-256） | 保持する点 | 変更する点 | 区分候補 |
|---|---|---|---|
| `LEGACY-ASSET-A2F6A697D7FFFD490B57`／`docs/design/helix/L3-requirements/release-module-bundle-composition-requirements.md:84-92`／`336d361ec89c36ca377113aca2f08b6b510cd0127ddbba191d311cec4990c89c` | 同じsource・registry・profile入力から同じartifactを作る。release packetはsourceのfull SHA、artifact digest等を束縛する。未信頼のartifactはcode実行前に検査し、static failureを実行のgreenで相殺しない | 旧Module／Bundleと配布repositoryを前提にしない。束縛をK2の鍵とbuild receiptで表す | `semantic_rederive` |
| `LEGACY-ASSET-9B7682EBDEA171005D45`／`docs/design/helix/L3-requirements/distribution-package-release-requirements.md:24-26,55-64`／`c854d77696bba4904bc91c1d32b8f1bd714408480f16538b7eb7e77291104f1c` | 入力はsource HEAD・要求digest・version等、出力はimmutable artifact。generated artifactを逆向きの正本にしない | 段階releaseの自走の承認条件（standing authorization）は本章で扱わない（release・cutoverは人の判断に残る） | `semantic_rederive` |
| `LEGACY-ASSET-9FD4DE252D3C27F88915`／`docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md:21-32`／`05bcaccb027a0e7bd9e82444751c961de8ac2b3102867cb5c7ba3b6babd34230` | builder receiptを期待値とし、artifactのbytes digestを展開前に再計算する。1 byteの差替え・別HEADは展開・起動前にfail-closeする | Lite・Windowsの構成は移さない。G8-I3として全実行物へ一般化する | `semantic_rederive` |
| `LEGACY-ASSET-70D2389B7A28A79D8B1D`／`docs/design/helix/L6-function-design/distribution-deterministic-archive.md:22-35`／`b621aa3c79f53b1ed81fdbf9084ead082d4b6c999e27e9d0575ae93eda9d3e60` | 同じ入力を2回packageしてbytesの一致を確かめる。署名・publishは責務外 | 再現をK6-I8の`reproduction`として持つ | `semantic_rederive` |

検証器自身の配布物と論理の誤り（11.4の下2行）は、旧HELIXに記述が見つからない（旧design-catalog:838で署名・attestationはtodo）。本章はそれを扱えない範囲として記すだけで、新しい仕組みを足さない。

### 11.6 L2へ戻す論点

1. **実行環境の真正性**：実行したprocessが固定したbytesを実行したことを確かめる仕組み（署名、attestation、実行環境の証明）を求めるか。調査資料のG6・G9に関わり、要求の意味に触れる。

## 12. Phase 1の条件の具体

### 12.1 位置づけ

2026-10-08のPO判断（`docs/governance/decisions/l3-l10-delegation-cross-runtime-review-po-decision-2026-10-08.md:76-83`、判断3）は、Phase 1（L3／L10の承認で機械検査が主になる）の条件がそろった時点を段階リリースv0.1の成立とし、条件の具体をL4共通設計で定め、別に確認するとした。本章は、その条件を測れる述語として定める。

- 本章の条件は、HELIX自身の開発（本repositoryのL3／L10のPR）について測る。開発repoの運用規則を製品の要求の根拠にしない（解禁判断記録の判断3）。段階リリースとしての製品側の由来は、`AC-OS-014-01`（段階のidentityと1.0到達を別状態にする）、`014-03`（限定範囲でも仕事が一周する）、`014-08`（段階・pack・1.0の判定を分ける）（`docs/helix-os/L3-requirements/functional-requirements.md:21,23,28`）である。
- 本章は、v0.1の宣言、内部デプロイ、人のゲートを外す判断、数値の閾値、条件を誰がいつ確かめるかを決めない（12.5）。
- 条件の結果はK1の型で表し、`authority_effect: "none"`とする。条件がそろっても、v0.1の成立やgateの変更を生成しない。

### 12.2 型

```text
Phase1Scope  = FixedRef。{ observation_base: SegmentHead[],          # 測るときに読むlogの末尾（K5の固定prefix）
                           prs: [{ pr, base: GitRevision, head: GitRevision }] }  # 確定したPRの集合
Corpus       = FixedRef。{ frozen_at: GitRevision,
                           elements: [{ pr, review_comment_id, major_id, bad_head, fixed_head, base, path, line,
                                        types, partition: pre_freeze | post_freeze, in_scope: Bool,
                                        exclusion: NotApplicable? }] }
Phase1Status = Combined。鍵のinputsに、検証器の集合、Corpus、Phase1Scope、observation_baseを入れる
P1Polarity   = 本書が定める版付きのPolarityOf（identity: phase1-polarity、version: 1）
```

- `prs`と`partition`は、評価の時点で計算せず、固定実体に書いた値を使う。後でPRやMajorが増えても、同じ固定入力の`Phase1Status`は変わらない。増えたものは新しいrevisionの`Phase1Scope`・`Corpus`として測り、旧結果はK2により`Stale`になる。
- L3／L10のPRの検査の操作を`l3l10_pr_check`とし、各PRの基底鍵を`{operation: l3l10_pr_check, subject: {kind: pr_head, identity: pr, revision: head, digest: headのtreeのdigest}, inputs: [{kind: pr_base, identity: pr, revision: base, digest}], scope}`とする（AIの設計判断）。

### 12.3 条件

各条件は、成分を作り、`P1Polarity`で肯定・否定へ写し、条件ごとにK1の`combine`で合成する。`Phase1Status`は、四つの条件の全成分を条件の識別を付けて外側へ展開し、各条件の`set_reason`を`{条件, Unknown(missing_input)}`の成分として加えて、一つの`combine`で合成する（K6-I7と同じ展開）。

- **P1-C1 検証器の集合**：成分は集合の各memberで、`deterministic`なら肯定、でなければ否定とする。memberが0件なら`set_reason`。集合が無ければ`Unknown(missing_input)`の成分。先行例として、仮組み`scaffold/l3l10-checks/`（`SCF-B-0157`）の5検査（`pin_recompute`、`count_ids`、`fixed_quote`、`return_vocab`、`boundary_removed`）を、正式なmemberの候補とする。仮組みのままではmemberにしない（`scfctl check-replacement`→`retire`で置き換えたものだけ）。advisoryの検査（`boundary_removed`）はmemberとして数えるが、C2の検出の判定には使わない。
- **P1-C2 回帰コーパス**：成分は`Corpus`の各要素で、`in_scope`なら、該当する型の検査のreceiptが`bad_head`の同じ`path`・`line`で違反を出し、`fixed_head`の同じ箇所で出さないとき肯定、どちらかが違えば否定、receiptが受け入れられなければその非`Value`とする。`in_scope`でない要素は、理由・判断者・再入条件を持つ`NotApplicable`とし（K1-I5）、持たなければ`Unknown(invalid_disposition)`。C2は`partition`ごとに二つの合成（`pre_freeze`、`post_freeze`）に分け、それぞれの要素が0件または全部が`NotApplicable`ならその合成の`set_reason`とする。`pre_freeze`の結果を`post_freeze`の検出とみなさない（先行例の`README.md`「抽出規則はコーパスを見ながら作った」）。
- **P1-C3 配線と実行**：(1)`required_for[l3l10_pr_check]`の識別の集合が、集合の全memberの識別と一致する。一致しなければ`Unknown(conflict)`の成分。(2)`prs`の各PRについて、基底鍵で`required`（K6-I7）を呼び、member別の照会と受入の結果を得る。受入済み（`Value(AdmittedReceipt)`）なら、成分「実行済み」を肯定、成分「登録と評価の一致」を、`registry.registered`と`registry.evaluated`の一致で肯定・否定とする。照会や受入が非`Value`（`Stale`、`Unknown(conflict)`、`Unobserved(not_run)`、`Unknown(unreadable)`、`Unknown(missing_input)`）なら、その非`Value`をそのmemberの成分とする。C3は実行の有無だけを測り、検査が違反を返したか（`inner`の否定）は数えない。評価された検査が`Unknown`を返した場合も「評価済み」であり、「未実行」と同一視しない。`prs`が0件なら`set_reason`。
- **P1-C4 機械で判定しない範囲の明示**：成分は`Corpus`の`in_scope`でない要素の型ごとの列挙で、列挙があれば肯定とする。列挙が無ければ`Unknown(missing_input)`の成分。

測定値のうち、本書で決めない数値（12.5）は条件に入れない。宣言が無い測定値は肯定にしない。

### 12.4 旧HELIXとの対応

| 旧source（ID／path:行／SHA-256） | 保持する点 | 変更する点 | 区分候補 |
|---|---|---|---|
| `LEGACY-ASSET-2E09592A003B32C118C1`／`docs/governance/gate-design.md:11-13,116-127`／`d96852613b6d04c522872f110ad78dc6b2ade4007cc5a6a8b048eba273d3a726` | ゲート判定を再現可能にし、構造は機械（engine）、意味はreviewで分ける | 旧G1〜G12のsign-off表は採らない（5章）。機械の範囲をP1-C1・C4で表す | `semantic_rederive` |
| `LEGACY-ASSET-59E7DCC3DF0FDD2DC7C0`／`docs/feedback-log.md:16`（FB-001）／`33255eca508d3cd01e8f0a4461aad3d8aca3a36e6c08e4bad91612a9fdc5886d` | 失敗史：件数・link存在を中身の証拠にした | 条件がそろっても承認や完了を生成しない（12.1） | 失敗史（区分なし） |

旧HELIXで人の承認を減らした先例（旧`CLAUDE.md:195-197`、`LEGACY-ASSET-6EBDB617A8104A7756D0`、SHA-256 `7bdfc0bc578359e42efae4242ee42b53abd6e2ec23874f1294d3ec0e278c8feb`。`docs/plans/PLAN-L7-418-github-self-driving-ops.md`、`LEGACY-ASSET-24186F25EB5E7A627309`、SHA-256 `2134f3066f0913018415e1ca5cad971d5e85589d8f21ceff7bf75534d05a0fa3`）と、その失敗（PLAN-L7-428。10.7）は、P1-C3（配線と実行の証拠）の根拠である。段階ごとに外したgateと置き換えた検査器を成立条件として持つ形は、旧HELIXに見つからない新規案である。検索の範囲は`archive/legacy-generation-2026-09-14/root/`の全ファイル（`grep -rIl`、読取りだけ）で、`staged autonomy`、`autonomy level`、`自律レベル`、`段階的自律`はいずれも0件だった。

### 12.5 人の判断が要る点

列挙だけであり、本書は新しい承認手続きを作らない。

1. Phase 1の条件を誰がいつ確かめるか（判断3「別に確認する」）。
2. 数値：`Phase1Scope`の開始revisionと対象PRの数、`in_scope`の割合、固定後に加わったMajorの件数の下限。
3. 条件がそろった後に、L3／L10の承認の手順（委任の条件、POの事後確認）を変えるか。
4. v0.1の成立の宣言と、内部デプロイ（内部デプロイの判断記録の方針1）。
5. advisoryの検査（`boundary_removed`）の扱い。

### 12.6 未決と試作で確かめること

- 試作：仮組みの5検査とコーパスで、P1-C1〜C4を`Phase1Status`として計算し、L9のIV-G8-01〜07とIV-P1-01〜07を動かす。

## 付録A 引用した現行文書のSHA-256（base `f88c96ce`）

| path | SHA-256 |
|---|---|
| `docs/concept/helix-concept.md` | `bbc787c5dc17de9eded156285ad82ef768788cfa31822dfffa477db073a5e715` |
| `docs/helix-harness/L2-requirements/product-requirements.md` | `9c9d499530f4d55c672391614eae6a3ccd6970d69d7c3ebc6e205ead24750c7d` |
| `docs/helix-harness/L3-requirements/functional-requirements.md` | `2180967f0075f467c99a553d34f688a1fdf434703803b1a34e7e147d6a7d2df5` |
| `docs/helix-connect/L3-requirements/functional-requirements.md` | `b3e4a47c0f49978880fc9bae7697d9b67eeaf72a112f821fef167c230c9d2e4b` |
| `docs/helix-labo/L3-requirements/functional-requirements.md` | `362979fc4489c137d7641278a8ea8e55461f3592d56d802bb285ec34abc4a9b8` |
| `docs/helix-security/L3-requirements/functional-requirements.md` | `f6872a3ee941d63c80a9717bca7e81de832c043ad05cc9ac0c2db77eb264ee9e` |
| `docs/helix-infrastructure/L3-requirements/functional-requirements.md` | `425d0746efe875dbfbeebc26562adea99a3cdd8e8ef6377a0164bca1d624cc2d` |
| `docs/helix-brain/L3-requirements/functional-requirements.md` | `6cf8be0c095fcd5ad5e52b6ee99e607c18d1b26be6f0d2e625e727d868a33cdf` |
| `docs/helix-os/L3-requirements/functional-requirements.md` | `666200db50ea9a2e7f0d67d57496a71368e497f2fdb6e3485d4838339000b393` |
| `docs/helix-intelligence/L3-requirements/functional-requirements.md` | `35e936a6d83d7a83310cc2a1900e8f199c54923472df9e9b0d7a9bdeec059457` |
| `docs/governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md` | `c7a6d39ceb853fe6c00ccc336ffa7bbbd6c7e87a0aaba172f43f490dd0a7fd23` |
| `docs/governance/decisions/l3-l10-delegation-cross-runtime-review-po-decision-2026-10-08.md` | `27b51768cbf010d201ccc2aafe8e4c893ec5ccb2a9a0bce662af343ef87809ee` |
| `docs/governance/decisions/po-l3-l10-post-confirmation-and-internal-deployment-policy6-2026-10-08.md` | `a5061e7438c4be4ca9d14637ac9f5f04689fb00fd3b7cb7d9d59ae775f7a0571` |
| `docs/governance/decisions/l4-l6-design-unlock-and-common-kernel-trace-po-decision-2026-10-08.md`（base `3d2f78ce`で固定） | `2ff59b61c775b9e609832f1e93961a4e50c54a959208b9edbc66524e15f0d8f8` |

旧sourceのpathは`archive/legacy-generation-2026-09-14/root/`からの相対pathである。旧sourceのSHA-256は本文bytesを再計算し、資産明細台帳の`source_sha256`と一致することを確かめた。旧資産の個別採否は、本書の区分候補を起点に、`docs/governance/legacy-asset-decisions.jsonl`の判断ログ契約に従って別に記録する。
