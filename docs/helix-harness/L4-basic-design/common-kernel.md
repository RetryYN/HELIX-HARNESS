# HELIX 共通カーネル L4基本設計（K1・K2・K5）

status: draft_for_l4_review
owner: HELIX-HARNESS（工程の標準と検証義務の所有。2026-10-08のPO判断の判断2）
parent_requirement: なし（一つの親要求を定めず、要素ごとに承認済みL3のACへtraceする。2026-10-08のPO判断の判断2。1.3を参照）
paired_l9: ../L9-integration-verification/common-kernel-integration-verification.md
base: main `3d2f78ce4ed11fa07d987fffa3632b20b0f7c51d`（引用した本文のSHA-256は`f88c96ce`で固定した。付録A。`f88c96ce`から`3d2f78ce`までに引用した本文は変わっていない）

本書は、8機構が共通に使う結果の型と版の鍵（共通カーネル）のL4基本設計の下書きである。最初のPRはK1（結果の多値型）とK2（identity・revision・digestによる鍵）、PR2はK5（追記専用JSONLとprojection。9章）を扱う。残りは8.2の「後続PRの計画」に置く。

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

- イベント：`ResultRecorded(key_digest, result_digest, producer)`、`ResultConflictDetected(key_digest, result_digests[])`。staleはイベントにしない（K2-I2）。保存はK5（repository内の追記専用JSONL。本書の設計判断。5章）で行い、本PRでは記録の形式だけを定める。
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

## 7. 人の判断が要る点

列挙だけであり、本書は新しい承認手続きを作らない。親要求の扱いと作業入口の停止は、2026-10-08のPO判断で決着した（1.3）。

1. L4／L9の配置規則の置き場（`l3-l10-authoring-layout.md`へ追記するか、別に置くか）。本書の配置は、その規則が決まるまでの提案である。人の上流の意味には触れないため、後続PRでAIが決め、独立reviewで確かめてよい。

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
| 3 | K6 provenance／receipt、E 検証receiptの真正性、Phase 1の条件の具体（2026-10-08判断3） | HARNESS-L2-022系のreceipt、032-05 | E、G8（実行物の検証） | work-graph-receipt-acceptance、gate-evidence-substance、closure-evidence-materialization（置換）、check-registry（登録と実行の照合） | 署名を後回しにする間の改ざん検出の範囲。検証器の集合の配置 |
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

K5は本書と対のL9へ追記する。共通カーネルは一つの設計identityであり、更新し続ける文書は同じファイルを更新する（AGENTS.md「再構築の原則」）。K5はK1の`Observed`、K2の`ResultKey`・K2-I2bの「追記順」・3.4のイベントを直接参照し、8章の計画と付録Aを共有するため、別ファイルに分けると参照と付録が二重になる。PRの範囲はK5の一つの変更目的（正本の記録形式と、projectionの導出の境界）に限り、人が読む差分は本章と対のL9で約130行（表の行が長いため、文字量では目安の範囲の中ほど）である。

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

承認は`docs/governance/l3-l10-po-post-confirmation.md`の各行が示す判断記録による（CONNECT Stage 5、INTELLIGENCE Stage 3・Stage 5、LABO Stage 1・Stage 2b・Stage 5、HARNESS Stage 2b）。正本をrepository内の追記専用JSONLにすることはAIの設計判断である（5章）。

### 9.3 型

```text
LogId        = 版をまたいで変わらないログの識別子（pathを識別子にしない。方針6）
SegmentId    = { log_id, writer, segment_no }      # 一つのsegmentに書くのは一つのwriterだけ
LogEntry     = { schema_version, segment: SegmentId, seq, prev_digest, event, entry_digest }
  seq          = 1から始まる連番（segmentごと）
  prev_digest  = 同じsegmentのseq-1のentry_digest。seq=1は"genesis"
  entry_digest = Digest(canonical_json({schema_version, segment, seq, prev_digest, event}))
Event        = ResultRecorded | ResultConflictDetected | Correction
  Correction   = { target: entry_digest, reason, replacement_event? }
SegmentHead  = { segment, seq, entry_digest }      # 読んだ時点のsegmentの末尾
Projector    = { identity, version, digest }        # projectionを作る純関数の識別と版
Projection   = { projector, input_heads: SegmentHead[], output, output_digest }
Checkpoint   = { projector, input_heads, state_digest }
```

- 1行に1つの`LogEntry`を`canonical_json`（3.2）で書き、改行で区切る。
- `ResultRecorded`と`ResultConflictDetected`は3.4のイベントである。K2の`record`は、該当する`operation`のsegmentへの追記として実装する。K2の`lookup`の`records`は、segment群から導いたprojectionである。
- `writer`は追記する主体（lane、Worker、検証器等）の識別である。並行して働くwriterは別のsegmentに書く。gitで二つのbranchが同じsegmentの末尾へ追記すると連鎖が壊れるためである。
- 業務payload、secret、credentialの値をeventに入れない。eventは識別子とdigestで参照する（CONNECT-AC-005-01の「raw業務payload・secret・credential値を保存・複製しない」）。

### 9.4 不変条件

- **K5-I1 追記専用**：書いた行のbytesを変えない。消さない。並べ替えない。追記は末尾だけとする。訂正は`Correction`の追記で表し、元の行を残す。
- **K5-I2 連鎖**：segmentごとに`seq`は1から欠番・重複なく続き、各行の`prev_digest`は直前の行の`entry_digest`に等しく、各行の`entry_digest`は再計算と一致する。
- **K5-I3 損傷の検出**：segmentを読むとき、次のいずれかがあれば、そのsegmentは損傷している：`entry_digest`の不一致、`prev_digest`の不一致、`seq`の欠番・重複、解析できない行、未知の`schema_version`、呼出し元が渡した既知の`SegmentHead`（以前に読んだ末尾）より短い、既知の`SegmentHead`と同じ`seq`で`entry_digest`が違う。損傷したsegmentの読取りは`Unknown(unreadable)`を返し、損傷の種類を`evidence`に入れる。損傷していない部分だけを読んで成功としない。
- **K5-I4 冪等な追記**：同じK2の`key_digest`と同じ`result_digest`の`ResultRecorded`が、読める全segmentのどこかに既にあれば、追記しない（K2-I4の`NoOp`）。同じ`key_digest`で異なる`result_digest`なら、新しい`ResultRecorded`と`ResultConflictDetected`を追記し、前の行は残す（K2-I4の`Conflict`）。
- **K5-I5 一つの問いは一つのlog**：K2の`ResultKey`の`operation`ごとに、記録先の`LogId`を一つだけ宣言する。同じ`operation`の結果を二つのlogへ記録しない。
- **K5-I6 順序**：順序はsegmentの中の`seq`だけで定まる。segmentをまたぐ時刻の順序は定めない。K2-I2bの「追記順で最後」は、同じsegmentの中では`seq`の大きい方、segmentをまたぐ場合は`(segment, seq)`の辞書順で最後とする。後者は決定的にするための規則であり、時間の前後を意味しない（この選択は肯定の判定に影響しない。K2-I2b）。
- **K5-I7 projectionは正本でない**：projectionの出力をlogへ書き戻さない。projectionの出力を`record`の入力にしない。projectionから新しいeventを作らない（状態を変えるのはeventの追記だけ）。
- **K5-I8 決定的な再構築**：同じ`projector`と同じ`input_heads`からは、行の読込み順やsegmentの並び順によらず、同じ`output_digest`を得る（INTELLIGENCE-078-06）。
- **K5-I9 全量の前提**：projectionが「無い」「0件」「閉じた」を出すのは、`input_heads`の全segmentを損傷なく末尾まで読んだ場合だけとする（K1-I7）。どれか一つが損傷・読取不能なら、そのprojectionは`Unknown(unreadable)`とする。
- **K5-I10 projectionの鮮度**：projectionはK2の鍵で扱う。`operation`は`projector.identity`、`operation_version`は`projector.version`、`inputs`は`input_heads`の各segmentを`SubjectRef`（`kind=log_segment`、`revision=seq`、`digest=entry_digest`）としたものとする。したがって、segmentへの追記やprojectorの版の変更で、旧projectionはK2-I2によりstaleまたは未観測になる。影響を受けない`input_heads`のprojectionは変わらない（INTELLIGENCE-078-04）。
- **K5-I11 checkpoint**：checkpointから差分を畳み込んだ結果は、同じ`input_heads`の全量の再構築と同じ`output_digest`でなければならない。一致しなければ、そのcheckpointを使わず`Unknown(conflict)`とする。
- **K5-I12 ドリフト**：保存したprojectionの`output_digest`と、同じ`projector`・`input_heads`からの再構築の`output_digest`が違えば、そのprojectionは`Unknown(conflict)`とし、使わない。projectorの版が違う二つのprojectionの差はドリフトではなく、K5-I10の鍵の違い（別の問い）として扱う。

### 9.5 API境界

各受け口は、引数に応じて次を検査し、満たさなければ理由を付けて拒否する。拒否を`Value`へ読み替えない。

- `append(segment, event, writer) -> Appended(SegmentHead) | NoOp | Conflict | Rejected(reason)`：`writer`がsegmentの`writer`と一致すること、`event`がK1-I6・K2の鍵の検査を通ること、`Correction`の`target`が同じlogに存在すること。K5-I1・I4・I5に従う。
- `read(segment, known_heads) -> Observed<Entry[]>`：K5-I2・I3に従う。損傷なく末尾まで読めた場合だけ`Value`。
- `project(projector, input_heads) -> Observed<Projection>`：`input_heads`の各segmentを`read`し、K5-I7〜I9に従う。
- `verify(projection) -> Observed<Projection>`：K5-I11・I12に従い、再構築して比べる。

### 9.6 旧HELIXとの対応

| 旧source（ID／path:行／SHA-256） | 保持する点 | 変更する点 | 区分候補 |
|---|---|---|---|
| `LEGACY-ASSET-BB08D70A42B6445B2D1E`／`docs/design/helix/L4-basic-design/event-projection-checkpoint-replay.md:36-42,62-64,78-89,119-122`／`9e18d68b5e463192fb30b839eb164d79f7202a15374482f65181b238df8e513d` | append-onlyで訂正は追記だけ。同一event_idで同じdigestはno-op、異なるdigestは拒否。projectionはevent列から再構築する派生物で、編集を逆流させない。projectionとread-backの不一致はfail-close。全体scopeのdigestをlaneのcheckpointに流用すると無関係な追記で誤ってdriftになる | 旧27-30行は`harness.db`を計画・状態のauthorityとした。本書は正本をrepository内のJSONLに置き、DBを置かない（5章）。異なるdigestは拒否でなく両方を残してconflictにする（K2-I4）。laneのcheckpointをsegmentとprojectionの`input_heads`へ一般化する | `semantic_rederive` |
| `LEGACY-ASSET-C35E93F2D36777CD7462`／`docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md:145-149`／`2a757a52082f823c4e52ae1e04887b62b8ac5f5df0d833d2b1c00516d6572357` | append-only event→projection→checkpointの共通形。`event_seq`を一意かつ単調にし、`previous_event_digest`と`event_digest`で鎖状に結ぶ。canonical JSON Linesで追記する。同じoperation IDと同じdigestは重複として除き、異なるdigestはconflict | 連鎖の単位をaggregateからsegment（writerごと）へ替える。UPDATE/DELETE拒否triggerとDB transactionは置かず、K5-I3の読取り時の検査で代える | `semantic_rederive` |
| `LEGACY-ASSET-8771887517A619A2D501`／`docs/adr/ADR-007-harness-db-sqlite-projection.md:18-22`／`50c05a00872be6c23de531aaecd6a6cfd26abec264718e0223ac2630f739dcdf` | projectionは再構築でき、authoring sourceではない | 正本と保存の形式（5章のとおり） | `replace`（保存の形式） |
| `LEGACY-ASSET-9EDE8332CF4F627105EA`／`docs/design/harness/L6-function-design/handover-db-derivation.md:35-38`／`e95e612c601ccb226b90e515eca633439745bb9a2266c889031ef7518c39d18d` | eventを先に追記し、event IDとpayload digestで冪等に投影する。append後・projection前はreplayする。同じsequenceで異なるpayloadはfail-close | 投影先をSQLiteからprojectionの純関数へ替える。同31行の「DBとmemoryが矛盾すればDB優先」は採らない（DBを置かない） | `semantic_rederive` |
| `LEGACY-ASSET-F6E9EA3422A0EF1DF090`／`docs/design/harness/L6-function-design/feedback-lifecycle.md:76-93`／`2e0a028fc48c6acc92a5b09ada9fc511ed0389b71af9deee782ec81aa731a655` | 終端（closed／superseded）は再投影で戻らない。新しい観測は新generationとして扱う | feedbackの状態機械を、K5-I7（eventだけが状態を変える）とK5-I9（全量の前提）、K2のrevisionへ一般化する | `semantic_rederive` |
| `LEGACY-ASSET-F677F6D81EB9FCAE2E3F`／`docs/governance/handover-retirement-memory-audit-2026-07-11.md:34-35,56,81`／`93b4a0bd78ebc88266eb3d795ad29384169a1fa8698691acbb724984f462d8b4` | 失敗史：状態を保存するpointer（`CURRENT.json` 311,927 bytes）の肥大と、手書きmarkerのdriftを防衛機構で根絶できなかった。projectionがopenを再生成し、close済みのfeedbackが復活した（open=2010で飽和） | 状態を保存しない（K5-I7）。「閉じた」を全量の前提でだけ出す（K5-I9） | 失敗史（区分なし） |
| `LEGACY-ASSET-6929C09B95A444D95B49`／`docs/improvement-backlog.md:258,260`（IMP-149、IMP-151）／`e6d327ff488860dcaa8d7a150ac893e5cf0940eb710396cdf7ae746f5689a9e2` | 失敗史：projectorの誤検出がrebuildの度に誤ったdriftを出した。470MBのDBの全件読取りで長時間停止した（独立検証では「不確実」） | projectorの版を鍵に入れ、projectorの修正を別の問いとして扱う（K5-I10・I12）。読む範囲を宣言した`input_heads`に限り、checkpointの等価性を検査する（K5-I11）。規模の数値は9.8の試作で測る | 失敗史（区分なし） |

writerごとにsegmentを分けることと、segmentをまたぐ順序を時間の前後と結ばない規則（K5-I6）は、旧HELIXに対応が見つからない**新規案**である。旧は一つのaggregateの中の単調な`event_seq`を前提にしていた（`infinity-loop-platform-basic-design.md:145-149`、`handover-db-derivation.md:35-38`）。検索の範囲は`archive/legacy-generation-2026-09-14/root/docs/design/`配下（`grep -rIl`、読取りだけ）で、検索語と該当ファイル数は`segment` 14、`hash chain` 3、`hash-chain` 6、`previous_event_digest` 8、`prev_digest` 0、`writer別` 0である。`segment`の14件はpathの区切りやIDの区切りの意味であり、ログの分割の意味のものは無かった。連鎖の語の該当は、いずれも一つのaggregateまたは一つのinstanceの中の連鎖だった。

### 9.7 L2へ戻す論点

1. **末尾の削除の検出**：既知の`SegmentHead`を持たない読み手は、segmentの末尾の削除を検出できない。repository外に末尾を固定するか（調査資料のG9）は、要求の意味に触れるため決めない。
2. **保持期間と圧縮**：logが増え続ける。古い行を圧縮・退避してよいか、その場合に何を正本とするかを定める承認済みのACは見つからなかった。

### 9.8 未決と試作で確かめること

- segmentの`writer`の粒度（lane、Worker、PRのいずれか）と、segmentを閉じる条件。8.2のPR6（ディレクトリ配置）と合わせて決める。
- 試作（`scaffold/`、Scaffold Binding登録）：L9のIV-K5-01〜14を動かす。あわせて、1万行・10万行のsegmentでの全量再構築とcheckpointからの差分の時間を測り、checkpointを必須にする規模の目安を得る。

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
