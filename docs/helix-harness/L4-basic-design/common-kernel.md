# HELIX 共通カーネル L4基本設計（K1〜K10・E・G3/G4/G5/G8/G10/G11・Phase 1・型番台帳/配置）

status: design_pair_defined
owner: HELIX-HARNESS（工程の標準と検証義務の所有。2026-10-08のPO判断の判断2）
parent_requirement: なし（一つの親要求を定めず、要素ごとに承認済みL3のACへtraceする。2026-10-08のPO判断の判断2。1.3を参照）
paired_l9: ../L9-integration-verification/common-kernel-integration-verification.md
base: main `66abf6bf158baebc6bfceb5ccf693d425aae41a9`（引用した現行本文のSHA-256はL4付録A）

本書は、8機構が共通に使う結果の型・版の鍵・証拠・義務・依存・世代切替・操作権限・label遷移・独立性を扱う共通カーネルのL4基本設計であり、対のL9結合検証設計と一体で更新する。各要素は承認済みL3 ACと適用するConcept/L2へtraceし、由来のない意味を要求へ昇格させない。型番台帳と配置は2026-10-08/09の既存PO判断の範囲で設計する。

`design_pair_defined`は契約とoracleの設計定義状態を表す。独立reviewの結果は対象PRのexact base/HEAD記録で追い、上流承認・実装・実行・合格の状態をこのstatusに混ぜない。設計、review、mergeからL3以上の承認、Phase 1成立、v0.1宣言、内部deployment、releaseまたは要求完了を生成しない。

2026-10-09 PO判断が採用した構成基本案の四つの具体化事項はrepository-layout L4に一意に定め、本書15.5と共通型へ接続する。判断記録が非対象とする実装、新世代CIの起動、release/deployment、visibility/LICENSE変更、配布repo作成/切替、directory作成、L2/Concept変更、新しい承認手続きは、本設計から許可として導かない。

## 1. 配置

### 1.1 層とpair

現行の層とpairは、Concept（`docs/concept/helix-concept.md:239`）とHARNESS-L2-001（`docs/helix-harness/L2-requirements/product-requirements.md:99`）が定める`L4↔L9`である。旧HELIXも`L4 基本設計 ↔ L9 結合テスト`を対にしていた（`LEGACY-ASSET-80FD1264A2C50E2E4AA4`、`archive/legacy-generation-2026-09-14/root/docs/process/README.md:44-55`、SHA-256 `21a875ca5b46a8396485690a8405923ea197552fe4aa2302b1eaad6f7e650985`）。L9は「interface、依存の向き、stateとdataの所有、transaction、失敗の伝わり方、retry、timeout、冪等性、結合度、責務の重複」を見る（HARNESS-L2-003／004、同L2:110）。本書と対になる検証設計はL9に置く。

### 1.2 置き場所

| 対象 | 置き場所 | 根拠 |
|---|---|---|
| 共通カーネルL4基本設計 | `docs/helix-harness/L4-basic-design/` | 共通カーネルを所有するHELIX-HARNESSのL4として、現行の`docs/<mechanism>/`機構×層配置に置く。 |
| 共通カーネルL9結合検証 | `docs/helix-harness/L9-integration-verification/` | L4とのpairを保ち、V字各層のverification設計の正本を`docs/`に置く。 |

2026-10-09 PO判断（`docs/governance/decisions/repository-layout-and-source-visibility-po-decision-2026-10-09.md`）は、`docs/`の既存配置を維持し、L4〜L9も機構×層の同じ並びに置き、V字各層のverification設計を`docs/`に置くことを採用した。この節は既存配置を示すものであり、新しいdirectoryを作る許可ではない。L4とL9を対にする旧根拠は`LEGACY-ASSET-80FD1264A2C50E2E4AA4`（旧`docs/process/README.md:44-55`、SHA-256 `21a875ca5b46a8396485690a8405923ea197552fe4aa2302b1eaad6f7e650985`）。共通カーネルの所有者をHELIX-HARNESSとする根拠はConcept原則4/10と2026-10-08 PO判断2である。

### 1.3 境界と配置の扱い

- **親要求**：本書は一つの親要求の下に置かず、要素ごとに承認済みL3 ACへ由来を辿る（2026-10-08 PO判断2）。HARNESS-L2-031の意味は「ログ・入力からの最小再現と回帰候補生成」であり、「031＝共通部品」は所属の確定であって本書の親要求化ではない。
- **文書配置**：L4〜L9の機構×層配置とverification設計の`docs/`正本は2026-10-09 PO判断で採用済みである。ここから別のauthoring rule fileを追加したり、既存`docs/governance/l3-l10-authoring-layout.md`の適用範囲を変更したりしない。`docs/`のrepository-wideな再配置も行わない。
- **作業入口**：L4〜L6設計と対のverification設計は、承認済みL3/L10を親とする既存の作業入口条件に従う。
- **新しい構成基本案**：15.5は、2026-10-09 PO判断が採用した構成基本案をrepository-layout L4の唯一の具体化へ接続する。判断記録に列挙された実装・実行・release等の非対象は、配置記述から許可として導かない。

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

引用した現行本文は冒頭のbaseの各ファイル（SHA-256は付録A）である。各ACの承認は`docs/governance/l3-l10-po-post-confirmation.md`の各行が示す判断記録による。

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

### 2.7 状態語の写像と検証範囲

- `Unknown`と`Unobserved`の境界を、各機構のL3の語で一件ずつ確かめる（例：HARNESSの「未評価」の二分）。境界がL3の意味に触れる場合は、L2へ戻す論点にする（6章）。
- `UnknownReason`の語彙が、承認済みL3の否定fixtureをすべて表せるか。表せない語が出たら、語彙を足す前に`Value`の否定でないかを確かめる。
- 対のL9 IV-K1-01〜13で、HARNESSの検証結果とCONNECTの互換結果の写像、`combine`/`admit`の成分保持と非肯定を確かめる設計とする。未実行の項目を合格に数えない。

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

### 3.6 機構別契約と検証範囲

- kind語彙とidentity形式は、各機構の既存L2/L3 identityに整合するL4契約で定める。共通K2は語彙を推測しない。
- inputs全集合の宣言者は操作ownerである。K10の明示依存closureとK4の義務が参照するoracle/入力をoperation宣言へ照合する。宣言済み必須入力の欠落は鍵構成前に拒否し、未知の依存を推測で追加しない。宣言外依存の真偽まで検出できるとは保証しない。
- 時間鮮度の閾値はK2に含めない。staleは版の不一致である。既存意味に新しい時間閾値を足す場合だけ6.2へ戻す。
- 対のL9 IV-K2-01〜20はrevision/digest、非Valueの旧記録、鍵各field、複数記録の集約を照合する設計であり、本書で実行済みとはしない。

## 4. 用語の区別

旧HELIXと同じ語を使う場合、意味を次のように分ける（本書の設計判断。5章）。

| 語 | 本書での意味 | 旧HELIXでの意味 |
|---|---|---|
| operation authority tuple | 操作の許可を束ねる組（actor、target、operation、revision、environment、scope、expiry等）。SECURITYのL3が使う語に合わせる。K3で定める | 「authority tuple」はregistryやIssue／PRのidentityの組を指した（`LEGACY-ASSET-40605F1E36A5DDCE0D84`、`docs/design/helix/L6-function-design/github-workflow-identity-contract.md:33`、SHA-256 `cf46f99a4d5ace7ba11be2d168820b3026365dd3f61bcb68ae49867c5cf54806`）。本書はこの意味を「registry identity tuple」と呼ぶ |
| 遅着作用 | 失効した割当てやrunが後から返した、状態を変える作用。拒否する（K7で定める） | 旧HIL-FR-27「失効runのlate resultをcommitしない」（`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`、`docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:117`、SHA-256 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`） |
| 遅着観測 | 割当ての終了後に届いた観測（CI、review、費用）。追補する | 旧「遅着CI/review/costは追補する」（`LEGACY-ASSET-3A15E5645D2D2A59DFF5`、`docs/governance/candidates/execution-ticket-requirements.md:307`、SHA-256 `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`） |

## 5. 本書の設計判断と、旧HELIXとの差

次の表のうち、上の4行はL4起草者（AI）の設計判断であり、POの判断ではない。L4以降の設計はAIが行う（旧charter §3、AGENTS.md「再構築の原則」）ため、本書に理由と旧sourceを記録し、独立reviewで確かめる。下の2行は、2026-10-08のPO判断記録による。このうち開発repoのクロスレビューの行は開発repoの運用規則であり、製品の設計の根拠ではない。

| 判断（出所） | 本書での適用 | 旧source（保持点・変更点） |
|---|---|---|
| 旧HELIX内の矛盾(a)は「L4以降は完全自動」に揃える（AIの設計判断） | 本書（L4）とL9に人の承認を置かない。独立reviewで確かめる | 旧charter §3（`LEGACY-ASSET-3B16BCFFAF353ADA813A`、`docs/design/helix/L0-charter/helix-charter_v0.1.md:18,22-30`、SHA-256 `8eff96bf58e6bb2cca247acef18c4f6cf07e304f3f23fb4179ddd8e5b19b23d8`）の「L4以降はAIが完全自動」を保持する。旧gate-design（`LEGACY-ASSET-2E09592A003B32C118C1`、`docs/governance/gate-design.md:23-40`、SHA-256 `d96852613b6d04c522872f110ad78dc6b2ade4007cc5a6a8b048eba273d3a726`）のG7・G11のPO sign-offは採らない（変更点）。理由：旧内部の矛盾を、現行の規則（AGENTS.md：人が持つ上流はConcept・L1・L2と、L3の承認）に揃える。G11（L11受入）の人の受入は、HARNESS-L2-022の利用者受入として別に残り、本判断で消えない |
| 結果とeventの正本はrepository内の追記専用JSONL。SQLiteのprojection DBは置かない（AIの設計判断。K5で詳細化） | K2の記録の保存先（K5で定める） | 旧ADR-007（`LEGACY-ASSET-8771887517A619A2D501`、`docs/adr/ADR-007-harness-db-sqlite-projection.md:18-22`、SHA-256 `50c05a00872be6c23de531aaecd6a6cfd26abec264718e0223ac2630f739dcdf`）は、`harness.db`を「projectionでありauthoring sourceではない」とし、正本を「docs/YAML/JSON state/log」と「markdown/YAML」に置いた。一方、旧`CLAUDE.md:250`（`LEGACY-ASSET-6EBDB617A8104A7756D0`）はsession continuationについて「`harness.db`のevent/projectionを正本」としており、旧の内部で扱いが揃っていなかった。保持する点：projectionは再構築でき、正本ではない（ADR-007）。変更する点：(1)K2の結果とeventの正本を、種類の異なるJSON state・logから、一つの追記専用JSONLの形式に揃える、(2)正本を正規化して保持するDB（`harness.db`）を置かず、projectionは必要なときにJSONLから導く、(3)旧`CLAUDE.md:250`のDB正本の扱いは採らない。区分は`replace`（保存の形式）。理由は設計上の三点である。K2-I2とK2-I4は記録を上書きせず衝突を両方残すことを求め、追記専用の形式がこれを構造で満たす。repositoryの記録は各行がcommitと本文のSHA-256で固定でき、K2の`revision`・`digest`と同じ方法で参照できる（AGENTS.md「過去の本文を指すときは対象のcommitと本文のSHA-256」）。正本をrepositoryの一系統にすれば、Concept原則7（`docs/concept/helix-concept.md:308`「意味の正本、実行事実、表示、作業文脈を分けて保つ」）の再構築を、DBの復元なしにrepositoryだけで行える。規模と再構築の費用はK5の実装検証対象であり、未測定の性能を保証しない |
| 信頼の根は、版とdigestで固定した検証器の集合をrepositoryで管理する。署名は後回し（AIの設計判断。K6・Eで詳細化） | K2の`producer`の枠（K6・Eで定める） | 旧closure-evidence-materialization（`LEGACY-ASSET-901EFEC93D536D3AA418`、`docs/design/harness/L6-function-design/closure-evidence-materialization.md:67-76`、SHA-256 `a8951a0cdd590da84612de8c6b6e5960ca5c32ad3b3d0c0d0511b9f5789c0264`）の「local hash単独では真正性を主張しない」を保持する。GitHub required-checkを信頼の根にする点は`replace`。理由：新世代CIは未構築で、旧CIは使えない |
| 旧用語の衝突は定義を分ける（AIの設計判断） | 4章 | 上表のとおり |
| 開発repoのreviewは、作成と別系統（別runtime・別model family）のクロスレビューを必須とする（PO判断：2026-10-08の委任判断記録の判断1。開発repoの運用規則） | 本PRの作成とreviewに適用する。製品K9の根拠にしない | 解禁判断記録の判断3（`docs/governance/decisions/l4-l6-design-unlock-and-common-kernel-trace-po-decision-2026-10-08.md:57-61`）により、これは開発repo（本repository）の運用規則であり、製品（HELIX）の要求ではない。製品のK9はConcept:236（独立reviewはidentity・context・authority・review routeで行い、providerの同異では独立性を決めない）と承認済みL3から導く（17章、8.2のK9） |
| G4はbytes変化＝意味変化（PO判断：2026-10-08判断記録の判断2） | K2-I3 | 2026-10-08判断記録の判断2 |

2026-10-09構成判断とrepository-layout RL-P7〜P9により、上表のrepository正本という保存先の選択はstore=repositoryの非機密開発logに限定する。stage/instanceのevent正本は宣言したstoreの追記専用JSONLであり、Git repositoryへ複製しない。形式・K2/K5規則とprojection非正本は保持し、保存先だけをLogDecl.storeで分ける（9.3、15.5）。

## 6. 既存意味を保つ設計と意味変更時の上流

各要素について、承認済みL3と適用する既存Concept/L2が定める範囲の型、API、参照、所有、順序、合成、診断、projectionをL4のAI設計として定め、対のL9と独立reviewで確かめる。未登録source、missing input、unknown authenticity、未着receipt、staleは各要素の型付き非肯定として保持する。それらを新しいPO待ちや承認gateへ変換しない。技術設計上の選択が残ることだけでも上流へ戻さない。

### 6.1 既存意味を保つ設計と残余限界

本書のG11は時間・鮮度条件の整理用識別子である。5章で引用する旧gate-designのG11（L11受入gate）とは別であり、旧番号から時間条件や新しい人承認を導かない。

| 対象 | L4で定める設計責務 | 保持する残余限界 |
|---|---|---|
| K1 / G10 | 2章に従って各機構の状態を`Observed<T>`へ写し、G10の肯定・否定・unknown等の成分を合成する。 | 各機構の語義を共通型の都合だけで統一・変更しない。missing、unknown、unobserved、staleを肯定へ縮退させない。 |
| K2 / G4 | 3章のkey field、正準順、lookup、stale/conflictを設計する。bytesと意味revisionの境界は2026-10-08 PO判断2を維持する。 | 判定器ができるまではbytes変化を常に意味変化として扱い旧結果を使わない。同revisionの異digestはUnknown(conflict)、新revisionの旧ValueはStaleであり、現行鍵を捏造しない。 |
| K3 | 16章のoperation authority tupleとcurrent permission照合、K7/G5受信側の接続を定める。 | 既存許可を生成・拡張せず、unknown/conflictを許可にしない。target identityとrevision subjectの対応はowner宣言で照合し、同一identityだと推測しない。 |
| K4 / G3 | 13章の義務集合・状態・oracle種別・継承/受領を、承認済みACに沿って設計する。 | traceの存在だけで義務充足にしない。human-interface範囲や機械判定割合を新設しない。 |
| K5 | 9章のappend、固定prefix、projection、restore/replay、conflict手順を設計する。 | 既知headなしに真の末尾削除を検出できると主張しない。未設計の保存容量・圧縮・外部archiveの保証を足さない。 |
| K6 / E | 10章のreceipt admission、reproduction、issuer authenticityを分け、各assuranceを保持する。 | 現行sourceで証明できないissuer/過去実行の真正性を肯定しない。未知の真正性は別の許可待ちにしない。 |
| K7 / G5 | 15章とOS/INFRA/HARNESS/SECURITY ACに沿ってrequest/apply、fencing、current permission照合、受け手ごとの取消し伝播を設計する。 | 跨writer原子性、既に実行された作用の取消し、数値で定められていない伝播上限を保証しない。pointer移動を正常起動の証拠にしない。 |
| K8 | §18のK8-I1〜I8に従い、source/project/revisionとcurrent分類宣言から未信頼labelを観測し、明示routeのK6検証・K3 permission・実作用観測を別結果として結ぶ。current owner入力・operation key・保存結果・projectionの再照合、Unknown/Unobserved/Staleの保持を定める。 | K8は許可・route・作用を生成せず、汎用taint伝播や独自classification/target語彙を加えない。未証明issuer真正性、未観測作用、ACにないtargetの扱いを肯定へ補わない。 |
| K9 | 17章のcreator inventory、四軸比較、current target binding、操作別K2鍵と非肯定の早期returnを定める。 | provider/modelの同異を独立性とせず、開発repoのcross-runtime規則を製品要求へ転用しない。K6の真正性限界を四軸比較で消さない。 |
| K10 | 14章に従って承認済み依存closure/影響ACの範囲でtyped edgeとclosure/impactを設計する。 | 宣言外runtime依存やedgeの真偽を推測しない。L3にない一律cycle拒否を加えない。 |
| E | 10章に従ってverification receiptのissuer/evidence boundaryとK6 admissionを設計する。 | receiptの有無や設計上のadmissionを実行済み/合格としない。 |
| G3 | 13章に従ってoracle種別と義務単位の検証責務を設計する。 | coverageやtraceだけから人の判断・合格を生成しない。 |
| G4 | 3章に従って既存bytes/meaning境界でkeyとmeaning revisionの対応を設計する。 | 新しい意味revision基準を加えない。 |
| G5 | 15章に従ってK7とK10を使う取消し伝播の責務を設計する。 | 未指定の上限や受け手の意味を作らない。 |
| G8 | 11章に従ってsource/build/artifact/run receiptとartifact reproductionを分ける。 | 固定bytesだけから実行環境や起動成功の真正性を肯定しない。 |
| G10 | 2章に従って状態語の写像と複数成分の合成を設計する。 | unknown等を成功へ縮退させない。 |
| G11 | 対象節の既存述語・観測値・非肯定結果を対応づける。 | 新しい時間・割合・件数の数値閾値は定めない。 |
| Phase 1 | 12章のC1–C4、固定`Corpus`/`Phase1Scope`、`authority_effect: none`を保った条件構成を設計する。 | 測定設計は実行、合格、gate変更、v0.1宣言を意味しない。 |
| 型番台帳 | 15.4に従いHARNESS-L2-010/HELIXOS-L2-014の既存項目をK5/K7の正本から導く。 | 新しい項目や第二の台帳を作らない。内部deployment状態を台帳へ二重記録しない。 |
| 配置・source visibility | 1.2/1.3と15.5で、2026-10-09 PO判断の基本案を同一責務境界に写す。開発source、pack、cross-pack declarations、型番登録、records、repo外の実行/配布を区別する。 | 本文の設計からdirectory作成、visibility/LICENSE変更、release/deployを実行しない。詳細境界は15.5/8.2に列挙する。 |

### 6.2 既存意味を追加・変更するとき

次の場合だけ対象意味を所有する既存上流authorityへ戻す。missing source、未着receipt、unknown authenticity、実装がないこと、技術設計の選択肢が残ることは、それだけでは上流戻しの理由ではない。

- G11その他に新しい時間・割合・件数の閾値を追加・変更する場合（freshness、取消し伝播、Phase 1対象数/割合等）。
- 承認済み各機構のunknown/unobserved/denyの意味や責任主体を変える場合。
- K4/G3で、承認済みACにない義務、HumanInterface、機械判定範囲を追加する場合。
- K5/K6/E/G8で、既存ACにない保存・真正性・署名・外部固定・execution environment attestationを要求へ加える場合。
- K10で、承認済みL3にない一律cycle拒否を要求へ加える場合。
- 台帳へL2/OS L2が定めない項目を追加する場合、または段階単位の内部deploymentを部品・接続単独へ広げる場合。

2026-10-09判断の四つのL4具体化事項（正本一意化、ReleaseManifest、開発source公開と配布範囲の分離、recordsの物理配置）は、既にL4へ割り当てられた技術設計であり、§6.2のPO待ちに分類しない。設計の結果として固定L2/L3の意味そのものを変える必要が判明した場合だけ、対象revisionと変更意味を特定し、既存authority経路を使う。

## 7. 既存の人判断と許可済み外部作用

本章は既存の人判断・外部作用境界を分類し、新しい承認手続き、PR gate、PO確認、delivery receiptを追加しない。L4/L9の技術設計判断はAIが記録し独立reviewで確かめる。`design_pair_defined`はpair本文に設計を定義したという事実のみを表し、review済み/承認済みと同義ではなく、実装・実行・release許可を意味しない。

両文書のstatusは設計定義状態だけを表し、review/mergeから上流承認、Phase 1成立、v0.1宣言、実装・実行・deployment、完了を生成しない。独立reviewは別のexact PR/HEAD記録で判定する。

### 7.1 既存の人判断

- Phase 1条件を誰がいつ確認するか、数値、条件成立後に承認手順を変えるか、v0.1成立を宣言するか、advisory検査をどう扱うかは12.5の既存列挙を維持する。P1-C1–C4の設計/測定は条件成立を表さない。
- 自動rollbackをPhase 2で扱うか、段階を組み直さない部品・接続単独の内部deploymentを許すかは15.9の既存未決を維持する。ReleaseManifestの技術設計はそれ自体でrollback policyの新しい人判断を作らない。
- 2026-10-09 PO判断で採用した構成基本案とpublic開発source範囲は再承認に送らない。四つのL4設計論点はAIの技術設計責務であり、PO待ちに置かない。
- 2026-10-09判断はL4–L9を機構×層に配置しverification設計を`docs/`に置くことを採用済みとする。新規の一般rule fileは本PRで作らず、既存二文書の1.2/1.3に判断を正確に反映して独立reviewする。
- 上記以外で既存L2/L3の要求意味・responsibility/authorityを変更する場合は、変更する意味と対象revisionを特定して既存authority経路へ戻す。技術detailの未決やmissingだけで人の判断を求めない。

### 7.2 許可済み外部作用の範囲

- 内部deployment・cutover・release・tag・配布repo作成/切替などは既存の対象と作用を特定する許可の範囲に限る。K7は許可を発行せず、適用直前に既存許可を照合する。
- public開発sourceの判断はpublic release、distribution allowlist、配布先visibility、LICENSE変更を含まない。配布先privateと配布対象allowlistの設計は開発sourceの閲覧範囲と別に扱う。判断記録が非対象とするvisibility/LICENSE変更、配布repo作成/切替、CI起動、directory作成を本PRから実行しない。
- `docs/`と実装directoryの配置記述はdirectoryを作らない。Records設計も、機密を含むinstance state/案件data/credentialsをpublic repoへ入れる許可にはならない。
- missing source、owner contract、receipt、測定値は各要素の`Unknown`/`Unobserved`/`missing_input`等で保持し、非肯定の限界を示す。欠落から新しいPO許可やgateを生成しない。
- Git mergeや文書statusは実行環境の起動、artifact deployment、rollback完了、instance state/historyの巻き戻し証拠にならない。

通常のL4/L9設計reviewに人間approveや別delivery receiptを追加しない。通常のGitHub作業の既存規則を保ち、不可逆な外部作用は既存の明示許可へ結びつける。

## 8. 設計範囲と対の結合検証

### 8.1 一つのL4／L9 pairとして扱う理由

K1の型とK2の鍵を共通の前提とし、K3〜K10と組込要素が同じ型・鍵・証拠を消費する。依存する共通契約を先に定め、各契約と対のL9 oracleを同時に更新する。L4だけを定めて検証設計を後回しにせず、L9だけから要求や合格を生成しない。所有者はHELIX-HARNESSであり、単一の親要求を作らず要素ごとに承認済みL3 ACへtraceする。

### 8.2 設計範囲と残余限界

全行は本pairに定義した契約とoracleの位置を示す。実装・実行・合格・上流承認の状態ではない。各要素の由来、旧source、保持点・差分は参照章に固定する。既存意味内の技術詳細はAIの設計責務であり、既存意味を変える場合だけ6.2へ戻す。既存の人判断と外部作用は7章に従う。

| 対象 | L4位置 | L9位置 | 定義した責務 | 保持する限界 |
|---|---|---|---|---|
| K1 / G10 | §2 | IV-K1-01〜13 | `Observed<T>`、状態語の写像、全成分の保持、合成と非肯定 | 機構固有の語義を変更せず、不明を肯定へ縮退させない |
| K2 / G4 | §3・§5 | IV-K2-01〜20 | ResultKey、正準順、record/lookup、revision変化とdigest競合 | 判定器ができるまでbytes変化は意味変化。旧結果を使わず、同revision異digestはUnknown(conflict)、新revisionの旧ValueはStale |
| K3 | §16 | IV-K3-01〜17 | current authority tuple、operation別許可照合、K7とG5受信側 | 許可を生成せず、停止と遅いwriterの違いをlogだけでは保証しない |
| K4 / G3 | §13 | IV-K4-01〜10、IV-G3-01〜05 | 義務集合・状態、oracle種別、導出・評価・継承・受領 | traceを充足とせず、新しいHumanInterfaceや機械判定割合を要求にしない |
| K5 | §9 | IV-K5-01〜26 | append-only event、固定prefix、restore/project/replay、segment開設・停止 | 既知headなしの真の末尾削除、未測定の容量/圧縮/性能を保証しない |
| K6 / E | §10 | IV-K6-01〜15 | receipt admission、再検証、issuer authenticityとreproductionの分離 | 登録sourceとの一致だけでは発行者・過去実行の真正性を証明しない |
| K7 / G5 | §15.2〜15.3 | IV-K7-01〜13、IV-G5-01〜10、IV-K3-17 | request/apply、fencing、conditional append、受け手別取消しと回復診断 | 跨writer原子性、未指定の伝播上限、pointerから正常起動を保証しない |
| K8 | §18 | IV-K8-01〜26 | SECURITY-AC-001-01にtraceした入力label分類、明示route検証、実作用観測、current key/record projectionを各々分離して結ぶ | untrustedを解除せず、K8から許可・実行・汎用taint意味を生成しない。K3/K6の非肯定とissuer真正性の限界を保持する |
| K9 | §17 | IV-K9-01〜15 | creator inventory、四軸比較、role付きsource binding、current target照合と操作別鍵 | provider/modelで独立性を決めず、開発repo cross-runtime規則やLABO blind評価を製品K9の親にしない |
| K10 | §14 | IV-K10-01〜14 | typed edge、graph、closure/impact、source/owner境界 | 宣言外edgeの真偽やruntime依存を推測せず、一律cycle拒否を要求にしない |
| G8 | §11 | IV-G8-01〜07 | source/build/artifact/runの分離、artifact固定とreproduction | 固定artifactだけでは実行環境の真正性・正常起動を証明しない |
| G11 | §§3.6、6、10.3、12、13、15.8 | IV-K6-14、IV-K3-07/16、IV-P1-01〜07、IV-G5-01〜10 | revision上のcurrent性と既存の観測/条件を各所有契約へ結ぶ | 新しい時間・割合・件数の閾値を置かず、既存expiryの照合を時計値による新しい適格性へ拡張しない |
| Phase 1 | §12 | IV-P1-01〜07 | C1〜C4、固定Corpus/Scope、条件ごとの非肯定保持 | authority_effectはnone。測定設計から条件成立・gate変更・v0.1を生成しない |
| 型番台帳・配置 | §§1.2〜1.3、15.4〜15.5 | IV-LDG-01〜04、repository-layout L9 IV-RL-01〜54 | 登録事実と固定宣言、配置設計への接続、release/target/actual分離、storeとencoded records | directory/CI/release/配布を実行せず、Git単独をappend-only/authenticityの証拠にしない。storage primitiveの実装詳細はL5で設計する |

G14（外部標準の版固定）はCONNECTのL4で扱い、共通カーネルに含めない。各ownerは本契約を消費する機構別詳細を同じL4正本へ追補し、要求意味を変える場合だけ既存authority経路へ戻す。

## 9. K5 状態は証拠から導出（追記専用JSONLとprojection）

K1の型とK2の鍵の上に、記録の正本の形と、正本から状態を導くprojectionを定める。

### 9.1 置き場所と範囲

K5は本書と対のL9へ追記する。共通カーネルは一つの設計identityであり、更新し続ける文書は同じファイルを更新する（AGENTS.md「再構築の原則」）。K5はK1の`Observed`、K2の`ResultKey`・K2-I2bの「追記順」・3.4のイベントを直接参照し、8章の設計範囲と付録Aを共有するため、別ファイルに分けると参照と付録が二重になる。K5は正本の記録形式とprojectionの導出境界を定める。

ログの物理配置は15.5に定める。本章は記録の形式と規則だけを定める。

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
Store        = repository | stage | instance
LogDecl      = { log_id, owner, store: Store, operations: Operation[], value_encodings, event_types, manifest_writer }
SegmentId    = { log_id, writer, segment_no }      # 一つのsegmentに書くのは一つのwriterだけ
FixedRef     = { store: Store, locator, digest: Digest }
RepositoryLocator = { revision: GitRevision, path } # 既存FixedRefの(GitRevision, path)を維持
LogEntry     = { schema_version, segment: SegmentId, seq, prev_digest, event, entry_digest }
  seq          = 1から始まる符号なし整数（segmentごと）
  prev_digest  = 同じsegmentのseq-1のentry_digest。seq=1は"genesis"
  entry_digest = Digest(canonical_json({schema_version, segment, seq, prev_digest, event}))
Event        = ResultRecorded | ResultConflictDetected | Correction | SegmentOpened | DeclaredEvent
  ResultRecorded         = { key: ResultKey, key_digest, result: ResultBody, result_digest, producer }
  ResultBody             = Observedのクラスとクラス別field（2.2）。Value.valueとevidenceは次のどちらか
                             - Inline(value)：LogDeclのvalue_encodingsでinlineと宣言した値型だけ
                             - FixedRef{ store, locator, digest }：宣言したstore内の固定実体
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
- **復元できる記録形式**（K2との接続）：`ResultRecorded`は`ResultKey`の全field（3.2）と`ResultBody`を持つ。logの行と、`FixedRef`が指すstore内の固定実体だけから、K2の`ResultRecord`（3.2）を4クラス（`Value`、`Unknown`、`Unobserved`、`NotApplicable`）のまま復元できる。`store=repository`の`RepositoryLocator`は従来の`(GitRevision, path)`と同じrevision・pathを表し、既存の固定参照を移行・別解釈しない。`store=stage|instance`のlocatorは各storeの固定locatorとして扱い、物理storeの実装はここで定めない。storeの配置・recordsのpath符号化の唯一の正本は[リポジトリ構成L4 §2・§6](repository-layout.md)（RL-P8/P9）であり、本節は配置を重複定義しない。3.4の`ResultRecorded`・`ResultConflictDetected`のfieldは本節の定義で具体化する（3.4をこの範囲で更新した。K2の意味は変えない）。
- **機微な値**：業務payload、secret、credentialの値をeventに入れない（CONNECT-AC-005-01）。`Inline`は、logの所有者が`LogDecl`で宣言した値型（例：pass／fail、compatible／incompatible）だけに使う。それ以外の値と証拠は`FixedRef`で参照する。
- **`FixedRef`の解決**：`store=repository`ではlocatorの`(GitRevision, path)`のbytesを読み、SHA-256が`digest`と一致すれば解決できる。`store=stage|instance`では指定storeのlocatorからbytesを読む。いずれも読めない、または一致しない場合、その記録は`Unknown(unreadable)`として復元する（元のクラスへ戻さない）。`result_digest`は参照のまま計算するので、解決できない場合もK2の`record`の冪等・競合の判定は変わらない。
- **manifest**：各logに一つ、`manifest_writer`だけが書くmanifest segmentを置き、`SegmentOpened`でそのlogのsegmentを列挙する。manifestのprefixが、ある時点のlogのsegmentの全集合である。
- **scope**：`ScopeDecl`は、projectionが読むsegmentの集合を宣言する。`segments`はmanifestの`manifest_head`までに開いたsegmentの部分集合で、宣言は操作の所有者が持つ（3.2「入力の全集合の宣言は各操作の所有者が持つ」）。全体を読むscopeは、manifestの全segmentを列挙する。

### 9.4 不変条件

- **K5-I1 追記専用**：書いた行のbytesを変えない。消さない。並べ替えない。追記は末尾だけとする。
- **K5-I2 連鎖**：segmentごとに`seq`は1から欠番・重複なく続き、各行の`prev_digest`は直前の行の`entry_digest`に等しく、各行の`entry_digest`は再計算と一致する。`schema_version`は既知の値である。
- **K5-I3 損傷の検出**：次の8条件は互いに独立に検査し、どれか一つでも当たればそのsegmentは損傷している：(a)解析できない行、(b)未知の`schema_version`、(c)`seq`の欠番、(d)`seq`の重複、(e)`prev_digest`の不一致、(f)`entry_digest`の再計算との不一致、(g)指定した`SegmentHead`の`seq`の行が無い、または同じ`seq`の行の`entry_digest`が違う、(h)行の実bytesがその行を解析した`LogEntry`の`canonical_json`（3.2）＋LF一つとbyte単位で一致しない。各行はcanonical JSONの後にLFを一つだけ持つ。CRLF、末尾空白、BOM、canonicalでない表記、終端LF欠落は(h)で検出し、他の条件と独立に損傷とする。条件(a)〜(h)を独立に検査し、損傷したsegmentの読取りは`Unknown(unreadable)`とし、当たった条件を`evidence`に入れる。損傷していない部分だけを読んで成功としない。
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

### 9.7 保証限界と意味変更の境界

既知のSegmentHeadまたは外部anchorを持たない読み手は、真の末尾削除を検出できない。この限界を成功へ補完しない。保持期間・圧縮・外部archiveの保証は現行ACにないため本書は追加しない。既存契約内の方式設計はAIの責務であり、新しい完全削除検出、保持義務または外部固定を要求へ足す場合だけ6.2へ戻す。

### 9.8 segmentの開設・停止と検証範囲

- writerはK7-I6のassignment/run単位とする。新assignment/runは別writer/segmentであり、取消しまたは失効したrunのsegmentを新runへ引き継いで追記しない。K3/K7のcurrent authority・fenceが非肯定になれば旧writerの追記を止める。ここで新しいSegmentClosedイベントや時刻による自動closeは加えない。正常終了という名称だけから新しいEpochIssued/revokeを生成しない。終了後の作用は既存OSのcurrent assignment/expiryとK7-I6の取消し・失効契約で照合する。遅着観測はcurrent writerがLateObservationとして元episodeへ結び、旧writerの作用を許す根拠にしない。過去segmentは固定prefixの読取り対象として残す。
- segment開設は、manifest_writerがcurrent OS assignment/runとwriter対応を読み、K5の既存SegmentOpenedをmanifestへ追記してから当該writerが追記する。未登録segmentへの書込みを認めず、manifestが読めない/登録未確認なら開始しない。物理配置とstore別の書込み前提は15.5およびrepository-layout RL-P4〜P9に従う。
- K5-I5のpeer_unreadable時はResultRecordedを追記しない。可用性低下を成功扱いで回避せず、欠落segmentを修復したと推測しない。容量・checkpointの性能値は今後の実装検証対象で、保証値やPO待ちを本書で新設しない。
- 対のL9 IV-K5-01〜26へ対応づける。1万/10万行等の測定案は実行済みでも要求閾値でもない。

## 10. K6 検証receiptとE その真正性

検証器が出す証拠（receipt）の形と、それを信じてよい条件を、K1の型、K2の鍵、K5のlogの上に定める。

### 10.1 範囲

本章はreceiptと検証器集合の共通契約を定める。11章のG8はsourceとartifactの鎖、12章のPhase 1は条件の測定を定め、いずれも本章のreceiptを消費する。これらの責務を一つの成功判定へ縮約しない。

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
- `started`と`completed`は記録するだけで、順序や有効性の判定に使わない（時間の閾値はL2へ戻す論点。§6.2／G11）。

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

### 10.8 issuer authenticityの保証限界

再現一致でも、過去の実行と発行者の真正性は証明できない。実行していないreceiptやexecution欄の書換えを再現だけで検出したとはしない。非決定的検証器では結果の再現も保証しない（10.5）。issuer_authenticity、reproduction、evidence integrityを別assuranceとして保持し、未知をPO待ちや許可へ変換しない。既存契約の方式具体化はAIが設計する。署名・外部固定等の新しい真正性保証を製品要求へ追加する場合だけ6.2へ戻す。

### 10.9 所有と検証範囲

- 各操作に必要な検証器（`required_for`）を誰がどう宣言するか。13章のK4-I4で決めた（義務が参照する検証器の集合と一致させる）。
- `VerifierSet`の置き場所。15.5で決めた。
- 試作：`scaffold/l3l10-checks/`のreceiptを本章の形へ写し、L9のIV-K6-01〜15を動かす。

## 11. G8 実行物の検証

sourceを確かめた証拠と、配布・実行されるbytes（実行物）を確かめた証拠を分け、両者をbuildの記録で結ぶ。

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
- **G8-I2 buildの鎖**：実行物`X`（`ArtifactRef`）がsource `S`から作られたと言えるのは、次の二つを別々に満たす場合だけとする。(a)**buildの受入**：buildの基底鍵`build_key`（`operation: build`、`subject: S`、`inputs`＝依存・設定・toolchainの全`SubjectRef`、`scope`）は、build操作の所有者が固定実体として宣言したcurrentの値を呼出し側が渡す。receiptの側から入力や鍵を採らない。`build_key`からbuilderのreceipt鍵を導き（10.3）、`restore`→`lookup`→`admit_receipt`を通る。非`Value`ならその結果を返す（`Stale`、`Unknown(conflict)`、`Unobserved(not_run)`、`Unknown(unreadable)`等）。(b)**鎖の照合**：受け入れた`BuildManifest`に`artifact.identity`が`X.identity`の項目があり、その`artifact.revision`と`artifact.digest`が`X`と一致し、`output.digest`が`X.digest`と一致する。項目が無ければ`Unobserved(not_run)`（そのbuildは`X`を作っていない）、`revision`か`digest`が違えば`Unknown(conflict)`とする。producerは(a)のbuilderであり、builderの識別を欠くreceiptは(a)で拒否され、他のfieldで補わない。
- **G8-I3 使う直前の再計算**：実行物を配布・展開・実行する受け口は、その時点のbytesのSHA-256を再計算し、`X.digest`と比べる。違えば`Unknown(conflict)`とし、展開・実行しない。sourceとsourceのreceiptが変わっていなくても、配布物だけが差し替えられればここで検出する。
- **G8-I4 artifactの再現**：builderが集合で`deterministic`なら、同じ`build_key`（同じ`S`とbuild入力）で再びbuildし、新しい`BuildManifest`の`X.identity`の項目の`digest`を`X.digest`と比べ、`artifact_reproduction`とする（一致で`Value`、不一致で`Unknown(conflict)`、項目が無ければ`Unobserved(not_run)`、決定的でなければ`Unknown(unsupported)`）。これはK6-I8の`reproduction`（`inner`の再現）とは別の比較であり、両方を`ChainResult`と`AdmittedReceipt`に別々に持つ。どちらが一致しても、過去にそのbuildで配布物が作られたことは保証しない（`issuer_authenticity`は`Unknown(unsupported)`のまま。10.5）。
- **G8-I5 合格は別の証拠**：buildの鎖とdigestの一致は、実行物の検証の合格を意味しない。実行物の合格は、`subject`が`X`の必要な検証器のreceiptを`required`で合成した結果だけによる（K6-I7）。
- **G8-I6 段階の構成**：段階（v0.x）の記録は、含むpackの`ArtifactRef`の組を持ち、source tagやsource revisionだけで段階を表さない（AC-OS-014-04）。

API：`build_chain(build_key, X, verifier_set) -> Observed<ChainResult>`は、G8-I2の(a)、(b)の順に検査し、最初に当たった結果を返す。`rebuild_compare(chain, build_key) -> Observed<ChainResult>`はG8-I4に従い、同じ`build_key`で再buildして`artifact_reproduction`を埋める。`admit_artifact_bytes(X, bytes) -> Observed<ArtifactRef>`はG8-I3に従う。

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
| `LEGACY-ASSET-70D2389B7A28A79D8B1D`／`docs/design/helix/L6-function-design/distribution-deterministic-archive.md:22-35`／`b621aa3c79f53b1ed81fdbf9084ead082d4b6c999e27e9d0575ae93eda9d3e60` | 同じ入力を2回packageしてbytesの一致を確かめる。署名・publishは責務外 | bytesの再現をG8-I4の`artifact_reproduction`として持つ。K6-I8の`reproduction`は`inner`の再現として別に保持する | `semantic_rederive` |

検証器自身の配布物と論理の誤り（11.4の下2行）は、旧HELIXに記述が見つからない（旧design-catalog:838で署名・attestationはtodo）。本章はそれを扱えない範囲として記すだけで、新しい仕組みを足さない。

### 11.6 実行環境の保証限界

固定source/build/artifact bytesだけでは、実行processがそのbytesを実行したことや実行環境の真正性を証明しない。attestation等が未定義なら未知を保持し、新しい人判断やPR gateへ変換しない。G8の鎖と再現の設計はIV-G8-01〜07へ対応づける。既存ACにない環境真正性保証を新しい要求へ追加する場合だけ6.2へ戻す。

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
- L3／L10のPRの検査の操作を`l3l10_pr_check`とし、各PRの基底鍵を`{operation: l3l10_pr_check, subject: {kind: pr_head, identity: "<pr>#head", revision: head, digest: headのtreeのdigest}, inputs: [{kind: pr_base, identity: "<pr>#base", revision: base, digest: baseのtreeのdigest}], scope}`とする（AIの設計判断）。headとbaseに役割を含む別のidentityを与えるのは、K6-I4の`read`（identityごとに一つのdigest）で両方を検査できるようにするためである。

### 12.3 条件

各条件は、成分を作り、`P1Polarity`で肯定・否定へ写し、条件ごとにK1の`combine`で合成する。`Phase1Status`は、四つの条件の全成分を条件の識別を付けて外側へ展開し、各条件の`set_reason`を`{条件, Unknown(missing_input)}`の成分として加えて、一つの`combine`で合成する（K6-I7と同じ展開）。

- **P1-C1 検証器の集合**：成分は集合の各memberで、`deterministic`なら肯定、でなければ否定とする。memberが0件なら`set_reason`。集合が無ければ`Unknown(missing_input)`の成分。先行例として、仮組み`scaffold/l3l10-checks/`（`SCF-B-0157`）の5検査（`pin_recompute`、`count_ids`、`fixed_quote`、`return_vocab`、`boundary_removed`）を、正式なmemberの候補とする。仮組みのままではmemberにしない（`scfctl check-replacement`→`retire`で置き換えたものだけ）。advisoryの検査（`boundary_removed`）はmemberとして数えるが、C2の検出の判定には使わない。
- **P1-C2 回帰コーパス**：成分は`Corpus`の各要素で、`in_scope`なら、該当する型の検査のreceiptが`bad_head`の同じ`path`・`line`で違反を出し、`fixed_head`の同じ箇所で出さないとき肯定、どちらかが違えば否定、receiptが受け入れられなければその非`Value`とする。`in_scope`でない要素は、理由・判断者・再入条件を持つ`NotApplicable`とし（K1-I5）、持たなければ`Unknown(invalid_disposition)`。C2は`partition`ごとに二つの合成（`pre_freeze`、`post_freeze`）に分け、それぞれの要素が0件または全部が`NotApplicable`ならその合成の`set_reason`とする。二つの合成の全成分と`set_reason`は、`{C2, partition, 要素}`または`{C2, partition, set_reason}`の識別を付けて`Phase1Status`の外側へ展開する。したがって一方のpartitionが0件・全`NotApplicable`なら、他方のpartitionや他の条件が肯定でも、`Phase1Status`は`Positive`にならず、そのpartitionの理由が残る。`pre_freeze`の結果を`post_freeze`の検出とみなさない（先行例の`README.md`「抽出規則はコーパスを見ながら作った」）。
- **P1-C3 配線と実行**：(1)`required_for[l3l10_pr_check]`の識別の集合が、集合の全memberの識別と一致する。一致しなければ`Unknown(conflict)`の成分。(2)`prs`の各PRについて、C3専用の受け口`phase1_wiring(pr, verifier_set) -> { member -> Observed<AdmittedReceipt> }`で、K6-I7の(1)〜(4)と同じ手順（`restore`→memberごとのreceipt鍵での`lookup`→`admit_receipt`）を行い、memberごとの受入の結果をそのまま得る。`required`の`RequiredResult`は`registry`を持たないため、C3はそれを使わない（`RequiredResult`の型は変えない）。受入済み（`Value(AdmittedReceipt)`）なら、成分「実行済み」を肯定、成分「登録と評価の一致」を、`registry.registered`と`registry.evaluated`の一致で肯定・否定とする。照会や受入が非`Value`（`Stale`、`Unknown(conflict)`、`Unobserved(not_run)`、`Unknown(unreadable)`、`Unknown(missing_input)`）なら、その非`Value`をそのmemberの成分とする。C3は実行の有無だけを測り、検査が違反を返したか（`inner`の否定）は数えない。評価された検査が`Unknown`を返した場合も「評価済み」であり、「未実行」と同一視しない。`prs`が0件なら`set_reason`。
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

### 12.6 条件の検証範囲

- 試作：仮組みの5検査とコーパスで、P1-C1〜C4を`Phase1Status`として計算し、L9のIV-G8-01〜07とIV-P1-01〜07を動かす。

## 13. K4 義務の一級化とG3 oracleの種別

検証義務を固定した集合として導き、義務ごとに状態と、合否を決めるoracleの種別を持たせる。

### 13.1 範囲と由来

K4とG3は一つのPRにした。G3のoracleの種別は義務の一つのfieldであり、分けると義務の型が欠けたまま先に固まるためである。差分は目安の範囲に収まる。

| 由来 | 位置 | 要点 |
|---|---|---|
| HARNESS | `AC-HARNESS-L3-014-01`〜`04`（`docs/helix-harness/L3-requirements/functional-requirements.md:176-179`） | 要件のsource・revision・scopeから、kind・対象・構成・risk・domainに合う義務を対応づける。unit・connection・compositeの義務を別に扱い、下位成果の存在だけで上位義務を成立扱いしない。必要な入力のmissing・unknown・conflictを識別して戻す。必要な検証設計の欠落を、traceがあっても不合格にする |
| HARNESS | `AC-HARNESS-L3-021-02`（同:482） | unitの成功をすべて与えても、構成体固有の義務が欠ければ構成体の成立を保留する |
| HARNESS | `AC-HARNESS-L3-036-04`（同:611） | 選択した省略・回収の義務と、gate・result・受入の状態を分け、未完の選択義務を保つ |
| HARNESS | `AC-HARNESS-L3-041-02`（同:758） | 各義務を、atomか理由付きのgapへ個別に対応させ、値を補完しない |
| OS | `AC-OS-018-01`、`AC-OS-023-02`（`docs/helix-os/L3-requirements/functional-requirements.md:161,194`） | 独立review担当へ未完の義務を渡す。受け手が受けた未完の義務の一件欠落を不成立とする |
| CONNECT | `CONNECT-AC-006-03`（`docs/helix-connect/L3-requirements/functional-requirements.md:160`） | 交換の前後で、未完のoperationと義務を旧revisionと対応づけて引き継ぐ |
| INFRASTRUCTURE | `INFRA-005-AC-04`（`docs/helix-infrastructure/L3-requirements/functional-requirements.md:293`） | failure・partial・unknownで、変更前の状態と未完の義務を残す |
| G3：HARNESS | `AC-HARNESS-L3-049-05`（`docs/helix-harness/L3-requirements/functional-requirements.md:826`）、`AC-HARNESS-L3-022-01`・`02`（同:230-231） | 機械のpass、人の文言判断、要求の受入を別状態にし、機械のpassから人の合意・受入を生成しない。L11の内容oracleと別個の利用者受入の記録を分ける |
| G3：SECURITY | `SECURITY-AC-026-01`・`02`（`docs/helix-security/L3-requirements/functional-requirements.md:547-548`） | 決定規則で強制できる条件をBot（LLM）の判断へ委譲しない。semanticな入力は判断の入力として区別し、判断不能をpassにしない |

承認は`docs/governance/l3-l10-po-post-confirmation.md`の各行が示す判断記録による（HARNESS Stage 2a・2b・3・5、OS Stage 2a、CONNECT Stage 2a、INFRASTRUCTURE Stage 2a、SECURITY Stage 4）。2026-10-08の委任判断記録のL3／L10の承認の運用は開発repoの運用規則であり、本章の根拠にしない（解禁判断記録の判断3）。

### 13.2 型

```text
OracleKind     = Mechanical | LlmJudgment | HumanInterface             # G3
OracleRef      = { kind: OracleKind, verifier: identity?,
                   human: { adapter: identity, decision_kind, requires_positive: Bool }? }
Disposition    = Required
               | NotApplicable(reason, authority, reentry_trigger)       # K1-I5と同じ
               | Deferred(target_point, owner, discharge_condition)
Obligation     = { obligation_id, source: SubjectRef, target: SubjectRef,
                   granularity: unit | connection | composite, pair, operation, oracle: OracleRef, disposition }
DerivationRule = { identity, version, digest }
ObligationSet  = FixedRef。{ derived_from: SubjectRef[], rule: DerivationRule, obligations: Obligation[] }
OperationDecl  = FixedRef。操作の所有者が宣言する、操作ごとのcurrentの { operation, version, inputs: SubjectRef[], scope }
HumanDecision  = { record: SubjectRef, target: SubjectRef, scope, decision_kind,
                   decision: accepted | rejected | pending }    # adapterが既存authority sourceの記録から作る
ObligationView = { set_key, combined: Combined,
                   assurance: { (obligation_id, verifier) -> { reverifiable, reproduction, issuer_authenticity } },
                   inherited: { obligation_id -> 旧revisionの非Positiveの記録 } }
Handoff        = FixedRef。{ from_view, to_set_key, unfinished: obligation_id[], inherited: { obligation_id -> 記録 } }
```

- **導出の鍵**：`ObligationSet`はK2の記録として残す。鍵は`operation: derive_obligations`、`operation_version`＝`rule.version`、`subject`＝対象、`inputs`＝`derived_from`の全SubjectRefと`{kind: derivation_rule, identity: rule.identity, revision: rule.version, digest: rule.digest}`、`scope`とする。したがって、規則の版の更新は`operation_version`が違うため`Unobserved(not_run)`、規則の同じ版でbytesだけの変更は`Unknown(conflict)`、由来のidentityを保った新revisionは旧記録が`Value`なら`Stale`、旧記録が非`Value`なら`Unobserved(not_run, superseded)`、由来のidentityの追加・削除は`Unobserved(not_run)`になる（K2-I2）。
- **検証の基底鍵**：義務`b`の検証の基底鍵は、`b.operation`の`OperationDecl`から`{operation: b.operation, operation_version: decl.version, subject: b.target, inputs: decl.inputs, scope: decl.scope}`として作る。`OperationDecl`は操作の所有者が固定実体として宣言したcurrentの値を呼出し側が渡し、receiptの側から入力を採らない（11章の`build_key`と同じ考え方）。
- 義務の`obligation_id`は、`source.identity`、`target.identity`、`granularity`、`pair`、`operation`から決まる値とし、revisionを含めない。版をまたいで同じ義務を辿るためである（K4-I5）。

### 13.3 不変条件

- **K4-I1 導出された全集合**：義務の集合は`ObligationSet`から読み、呼出し側から受け取らない。`evaluate`の出力の`combined`は、集合の各`obligation_id`の成分を必ず含む。消費側は`check_view`でこれを照合し、集合にある`obligation_id`の成分が無ければその義務を`Unknown(missing_input)`、集合に無い`obligation_id`の成分があれば`Unknown(unregistered)`とする。`obligations`が0件なら`set_reason = Unknown(missing_input)`（K1-I4）。
- **K4-I2 粒度の分離**：composite・connectionの義務の成分は、その義務自身のoracleの結果だけから作る。下位（unit）の義務の結果から上位の義務の肯定を導かない（AC-014-02、021-02）。
- **K4-I3 dispositionの成立**：`NotApplicable`は3fieldをすべて持つ場合だけ成立し、合成で除外される（K1-I5）。`Deferred`は3fieldをすべて持つ場合だけ成立し、成分は`Unobserved(pending_receipt)`とする（肯定にならず、合成から除外されない）。fieldが欠ければ、どちらも`Unknown(invalid_disposition)`の成分とする。`Required`・`Deferred`以外に「飛ばす」dispositionは置かない。
- **K4-I4 義務と検証器**：操作`o`の`VerifierSet.required_for[o]`（10.3）の識別の集合は、`o`の`Required`の義務のうち`oracle.kind`が`Mechanical`か`LlmJudgment`のものが参照する`verifier`の集合と一致しなければならない（10.9の所有責務を具体化する）。一致しなければ`Unknown(conflict)`の成分とする。各義務の成分は、13.2の基底鍵からK6-I7の(1)〜(4)の手順（K5の固定prefixでの`restore`→検証器ごとのreceipt鍵での`lookup`→`admit_receipt`）で得た受入の結果の`inner`の全成分（`set_reason`を含む）を、`{obligation_id, verifier, 検査}`の識別を付けて展開したものとする。受け入れた各receiptの`reverifiable`・`reproduction`・`issuer_authenticity`は、`{obligation_id, verifier}`ごとに`assurance`へ入れる。
- **K4-I5 未完義務の継承と受渡し**：対象の新しいrevisionで義務の集合を導き直したとき、旧revisionで成分が`Positive`でなかった義務は、`obligation_id`で新しいviewの`inherited`へ旧の記録を結ぶ。新しいrevisionの成分は新しいreceiptから作り、旧の結果を流用しない（K2-I2）。旧revisionにあり新しい集合に無い未完の義務も`inherited`に残し、その義務の`source`の所有者へ戻す。所有者の間で渡すときは`Handoff`を固定実体として作る。受け手は`receive`で、`from_view`から「旧で`Positive`でなかった全`obligation_id`（新しい集合に無いものを含む）」とその各記録を計算し直し、`Handoff`と照合する。(1)`unfinished`のIDの集合が一致しなければ、欠けた義務を`Unknown(missing_input)`、余分な義務を`Unknown(unregistered)`とする。(2)`unfinished`の各IDについて、`Handoff.inherited`に記録があり、その記録（K2の`key_digest`と`result_digest`）が`from_view`の対応する記録と一致しなければならない。記録が無ければ`Unknown(missing_input)`、別の記録なら`Unknown(conflict)`とする。
- **K4-I6 unknownは飛ばさない**：`Unknown`・`Unobserved`・`Stale`の成分は、合成でそのまま非`Value`として残る。成分が非`Value`の義務を「未適用」や「対象外」へ読み替えない。

### 13.4 G3 oracleの種別

- **G3-I1 種別は義務ごとに固定**：`oracle.kind`は`ObligationSet`に固定し、評価の時点で変えない。種別を変えるのは新しいrevisionの`ObligationSet`である。
- **G3-I2 機械判定**：`Mechanical`の義務を満たせるのは、集合で`deterministic`の検証器のreceiptだけとする。決定的でない検証器のreceiptは、その義務では`Unknown(unsupported)`の成分とする（SECURITY-AC-026-01：決定規則で強制できる条件をLLMへ委譲しない）。
- **G3-I3 LLMの判断**：`LlmJudgment`の義務は、決定的でない検証器のreceiptで満たせる。その`assurance`は`reproduction = Unknown(unsupported)`のまま`ObligationView`で消費側へ返る。判断不能（`Unknown`）は肯定にしない（SECURITY-AC-026-02）。
- **G3-I4 人のIF**：`HumanInterface`の義務を満たせるのは、`oracle.human.adapter`（集合に固定した決定的な検証器）が、既存のauthority sourceの記録から作った`HumanDecision`だけとする。新しい人の承認を求めず、既にある記録を読むだけである。写像は次の順で決め、最初に当たったものを成分とする。(1)`HumanDecision`が無い→`Unobserved(pending_receipt)`。(2)`target.identity`が義務の`target.identity`と違う、`scope`が違う、`decision_kind`が違う→`Unobserved(pending_receipt)`（その義務についての記録ではない）。(3)`target`のidentityが同じで`revision`が違う→旧revisionへの記録として`Stale`。同じ`revision`で`digest`が違う→`Unknown(conflict)`。(4)`decision`が`pending`→`Unobserved(pending_receipt)`。(5)`requires_positive`が真なら、`accepted`は肯定、`rejected`は否定。`requires_positive`が偽（記録があることだけを求める義務）なら、`accepted`・`rejected`のどちらも肯定とする。利用者受入を求める義務は`requires_positive`を真とし、偽を受入の義務へ付けない。記録だけを求める義務の肯定から、受入の状態を作らない。機械やLLMのreceiptから`HumanDecision`を作らない（AC-049-05、022-01・02）。`HumanInterface`を付けてよいのは、由来の承認済みL3が人の記録（利用者受入、人の文言判断等）を求める義務だけとする。
- **G3-I5 割合は情報だけ**：`ObligationSet`から、種別ごとの義務の数を数えられる。この数は情報であり、合否や承認を生成しない。閾値は置かない。

### 13.5 API境界

- `derive(sources, rule, target, scope) -> ResultRecorded | Rejected(reason)`：導出規則の側の受け口。由来と規則だけを受け取り、`ObligationSet`を作る。由来の承認済みL3が人の記録を求めていない義務に`HumanInterface`を付けた集合は拒否する（G3-I4）。
- `evaluate(set_key, decls: {operation -> OperationDecl}, verifier_set, input_heads) -> Observed<ObligationView>`：K5の`restore`（`input_heads`の固定prefix、K5-I11の完全性）→`lookup`で`ObligationSet`を得て（非`Value`ならそれを返す）、K4-I4の集合の一致を検査した後、義務ごとに13.2の基底鍵から成分を作り（K4-I2〜I4、G3-I2〜I4）、全成分を一つの`combine`へ渡す。`decls`に義務の操作が無ければ、その義務を`Unknown(missing_input)`とする。
- `check_view(view, set_key) -> Observed<ObligationView>`：消費側の受け口。K4-I1に従う。
- `reverify_view(view, targets: {(obligation_id, verifier)}?) -> Observed<ObligationView>`：受け入れた各receiptにK6の`reverify`を適用し、結果を`assurance`の`reproduction`へ入れる。`targets`を指定すれば、その組だけを再検証する。`evaluate`は再検証を行わない。`evaluate`の直後の`reproduction`は、決定的な検証器のreceiptでは`Unobserved(not_run)`、決定的でない検証器のreceiptでは、再検証の呼出しの有無にかかわらず`Unknown(unsupported)`とする（G3-I3、IV-G3-03）。再検証は常に必須ではなく、消費側が必要なときに呼ぶ。公開経路で返る`reproduction`は、未実施`Unobserved(not_run)`、一致`Value`、不一致`Unknown(conflict)`、決定的でない検証器`Unknown(unsupported)`のいずれかである。
- `inherit(old_view, new_set_key, decls, verifier_set, input_heads) -> Observed<{view: ObligationView, handoff: Handoff}>`：新しい集合を`evaluate`し、K4-I5に従って`inherited`と`Handoff`を作る。
- `receive(handoff, from_view) -> Observed<Handoff>`：受け手の受け口。K4-I5の照合を行う。

### 13.6 旧HELIXとの対応

| 旧source（ID／path:行／SHA-256） | 保持する点 | 変更する点 | 区分候補 |
|---|---|---|---|
| `LEGACY-ASSET-FEB591CA3369A4AF7729`／`docs/design/harness/L6-function-design/descent-obligation.md:20-24,66-69`／`8f6a5104bdb15790cd282414ef0e2b24976787097bce0245b5cff02ac3aaf984` | 上流から「在るべき下流」を生成し、不在をfail-closeする（absence-blindnessへの対策）。義務を`satisfied／deferred／unmet`に分け、deferに待ち先・解消条件・ownerを持たせる | 状態をK1の型で表す。義務に粒度、oracleの種別、由来のrevisionを足す | `semantic_rederive` |
| `LEGACY-ASSET-E7AB06BE3282A7D4CBDA`／`docs/design/helix/L6-function-design/ci-deferred-obligation-recovery.md:17-35`／`077592139976a41d786141018c116e2c09393e41c8132adf0a259b86443083a9` | 延期した義務をexactly oneの回収先へ結ぶ。missing・duplicate・expired・cancelled・stale HEADを成功で相殺しない | CIに限らず全義務へ広げる。期限（時刻）は使わない（§6.2／G11） | `semantic_rederive` |
| `LEGACY-ASSET-E9998EF887555DBB2751`／`docs/design/helix/L6-function-design/ci-verification-plan.md:20-35`／`21e0b8a05b965d6c1ad27c55bf28ff2d711daa4112c96589da63075b02fc5841` | 上流が渡すrequired obligationのexact setを照合し、一件でも消えたら拒否する。pendingは未完として追跡する | 集合を呼出し側から受けず、固定した導出から得る（K4-I1） | `semantic_rederive` |
| `LEGACY-ASSET-C35E93F2D36777CD7462`／`docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md:351,383`／`2a757a52082f823c4e52ae1e04887b62b8ac5f5df0d833d2b1c00516d6572357` | `required／not_applicable／deferred`を明示し、deferredはfreezeをblockする。N/Aは理由・actor・再入を持つ | `Deferred`の成分を`Unobserved`とし、合成から除外しない | `semantic_rederive` |
| `LEGACY-ASSET-BC214D81DE9E77B8A804`／`docs/archive/cross-system-audit-2026-09-05/source/audit-report.md.txt:72-80`（F02）／`dcf0d4e0dcc4db772afac465df10f2412134cd65dcd019a18cb99c9fd39be53f` | 失敗史：必須集合を呼出し側から空にすると個別検査が消えた | K4-I1の根拠 | 失敗史（区分なし） |
| `LEGACY-ASSET-3B16BCFFAF353ADA813A`／`docs/design/helix/L0-charter/helix-charter_v0.1.md:39`、`LEGACY-ASSET-EE5DBACC7F28F7D1F605`／`docs/design/helix/L3-requirements/pillar-functional-requirements.md:152`／`8eff96bf58e6bb2cca247acef18c4f6cf07e304f3f23fb4179ddd8e5b19b23d8`、`7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544` | 機械判定とAI判定の境界をformalizeし、coverage単独のpassを完了の根拠にしない | 境界を「gateごとの規則」から「義務ごとの`oracle.kind`」の型へ移す | `semantic_rederive` |
| `LEGACY-ASSET-D68CEADABCBECF13EFCB`／`docs/skills/judgment-core.md:70-73`／`e0c0fc7c3c813ba59e434ea19dad3f54e90f2b7bd8e1b5151c572a06b3d3c1e8` | 機械で決まるものはlint・testに寄せ、LLMは程度の評価と盲点の発見に使う。決定的なgateをLLMの判断で代替しない | なし（G3-I2として再導出） | `semantic_rederive` |
| `LEGACY-ASSET-98372FEE8A3AC8F9C299`／`docs/design/helix/L5-detail/design-template-json-authority.md:74`／`3015d4f3d65cd1f8205f88f29dd59c4f1f7ef42c729d8144f2319e49fe20d830` | verificationの欄に「required oracle class」を置いた | 値域を`Mechanical／LlmJudgment／HumanInterface`に定める | `semantic_rederive` |

義務ごとにoracleの種別を値域つきの型として持つこと、人のIFを第三の種別とすること、既存の記録を`HumanDecision`へ写すadapterは、旧HELIXに対応が見つからない**新規案**である。旧は境界のformalizeを要件に掲げたが、型にしなかった。検索の範囲は`archive/legacy-generation-2026-09-14/root/`の全ファイル（`grep -rIl`、読取りだけ）で、`oracle_type` 0件、`oracleKind` 0件、`oracle_kind` 0件、`oracle class` 1件（上表の`design-template-json-authority.md:74`。値域は定めていない）だった。

### 13.7 意味変更時の境界

承認済みL3が人の記録を求めない義務へHumanInterfaceを新設する場合、または機械判定割合の新しい目標/閾値を要求へ足す場合だけ6.2へ戻す。既存ACからの義務型・oracle分類・導出/評価/継承/受領の具体化はAIのL4設計責務であり、技術上の不足をPO待ちにしない。

### 13.8 機構別導出と検証範囲

- 導出規則（`DerivationRule`）の具体（承認済みL3のACとtemplateから義務を作る規則）は、HARNESS-L2-014・041の設計（各機構のL4）で定める。本章は規則の型と、導いた集合の扱いだけを定める。
- 試作：承認済みのL3の一つの親について義務の集合を手で導き、L9のIV-K4-01〜10とIV-G3-01〜05を動かす。

## 14. K10 型付き依存グラフ

対象どうしの関係を、型と性質を宣言した語彙のedgeとして持ち、整合・依存閉包・影響・独立復旧をグラフの規則として検査する。

### 14.1 由来

| 由来 | 位置 | 要点 |
|---|---|---|
| HARNESS | `AC-HARNESS-L3-023-02`・`03`（`docs/helix-harness/L3-requirements/functional-requirements.md:80-81`） | 常時必須、成立したoperation条件、選択したsource条件の依存だけを有効なclosureに含める。条件不成立、未選択・未観測、参照のみ、unknown・staleを別状態にする。該当条件の安全依存は必須としてclosureに残し、unknownな条件は保留にする |
| HARNESS | `FR-HARNESS-L3-010`の境界（同:33） | 固定L2-010から、依存循環の独立した拒否条件は導出しない。依存closureの条件は固定L2-023の範囲で扱う |
| HARNESS | `AC-HARNESS-L3-014-04`（同:179）、`AC-HARNESS-L3-030-04`（同:256） | 変更の影響を照合する。影響を受けたものを新しいrevisionへtraceし直し、影響範囲の外まで一律に保留しない |
| INTELLIGENCE | `AC-INTELLIGENCE-L3-078-04`（`docs/helix-intelligence/L3-requirements/functional-requirements.md:589`） | 影響を受けたもののexact setだけをstaleにし、影響を受けないprojectionを保つ |
| OS | `AC-OS-014-07`（`docs/helix-os/L3-requirements/functional-requirements.md:27`） | 宣言済みのdependency graphと対応環境から、自己依存なしに起動・更新・復旧できることを確かめる。graph上の参照だけからruntimeの依存を推測しない |
| INFRASTRUCTURE | `INFRA-006-AC-01`（`docs/helix-infrastructure/L3-requirements/functional-requirements.md:79`）、`INFRA-001-AC-03`（同:63） | 通常のControl Planeや停止中のサービスを経由しない独立の経路で復旧する。pathの方向と境界を欠いたものを既知・健全としない |
| BRAIN | `BRAIN-005-AC-01`・`02`（`docs/helix-brain/L3-requirements/functional-requirements.md:499-500`）、`BRAIN-INFRA-014-AC-01`・`02`（同:347-348）、`BRAIN-INFRA-015-AC-02`（同:359） | edgeはsourceが宣言した関係の種類・方向・意味・端点を持つ。名称の類似だけのedgeや未確認の因果を確定しない。未定のedgeを確定edgeとして扱わない。「影響しうる」を根拠なく「原因」へ強めない |

承認は`docs/governance/l3-l10-po-post-confirmation.md`の各行が示す判断記録による（HARNESS Stage 1・2c・2b、INTELLIGENCE Stage 3、OS Stage 2b、INFRASTRUCTURE Stage 1、BRAIN Stage 2b）。性質を宣言する語彙と、グラフの規則としての検査の形は、AIの設計判断である。

### 14.2 型

```text
RelationType   = { name, transitive: Bool, symmetric: Bool, inverse: name?, contradicts: name[],
                   dependency: Bool, propagation: none | along | against }   # 性質の宣言
                   # along：fromの変更がtoへ伝わる（例：A affects B）。against：toの変更がfromへ伝わる（例：A depends_on B）
RelationVocab  = FixedRef。{ revision, types: RelationType[] }               # 閉じた語彙
DepClass       = required | operation_condition(operation, predicate) | selected_source(source) | reference_only
Edge           = { from: identity, to: identity, relation: name, source: SubjectRef,  # edgeを宣言した由来
                   meaning, dep_class: DepClass, safety: Bool, state: candidate | confirmed | retired }
GraphDecl      = FixedRef。操作の所有者が宣言する { scope, sources: SubjectRef[], vocab, control_plane: identity[]? }
ConditionState = FixedRef。操作の所有者が宣言する、操作ごとのcurrentの
                 { operation_conditions: {(operation, predicate) -> true | false | unknown},
                   selected_sources: {source -> selected | not_selected | unknown} }
GraphRules     = FixedRef。各操作（build_graph、check_graph、closure、impact、independent）の規則の { identity, version, digest }
Closure        = { seed, effective: identity[], held: identity[],
                   diagnostics: { identity -> condition_false | not_selected | reference_only },
                   combined: Combined }
Impact         = { changed: SubjectRef[], affected: identity[], possibly: identity[], combined: Combined }
```

**SubjectRefへの写像と鍵**：固定実体は`{kind, identity, revision, digest}`で表す。`RelationVocab`は`kind: relation_vocab`、`GraphDecl`は`kind: graph_decl`、`ConditionState`は`kind: condition_state`、`GraphRules`の各規則は`kind: graph_rule`とし、identity・revision・digestは各固定実体のものとする。各操作の結果はK2の記録とし、鍵を次のとおりとする（K2の`inputs`はSubjectRefの配列であり、鍵そのものを入れない）。

| 操作 | operation_version | subject | inputs | scope |
|---|---|---|---|---|
| `build_graph` | 規則の版 | `GraphDecl` | `sources`の全SubjectRef、`vocab`、規則 | `GraphDecl.scope` |
| `check_graph` | 規則の版 | `GraphRef` | 規則 | 同上 |
| `closure` | 規則の版 | `GraphRef` | seedの各node（`kind: graph_node`）、`ConditionState`、closureの規則、check_graphの規則 | 同上 |
| `impact` | 規則の版 | `GraphRef` | 変わった対象の各SubjectRef、`ConditionState`、impactの規則、check_graphの規則 | 同上 |
| `independent` | 規則の版 | `GraphRef` | 復旧の操作（`kind: operation`）、`ConditionState`、independentの規則、check_graphの規則、closureの規則 | 同上 |

`GraphRef`は`build_graph`の記録を指すSubjectRefで、`{kind: graph, identity: GraphDecl.identity, revision: build_graphの記録のkey_digest, digest: result_digest}`とする。各操作の`inputs`には、自分の規則に加えて、直接・間接に使う規則（`closure`・`impact`はcheck_graphの規則、`independent`はcheck_graphとclosureの規則）を入れる。したがって、使う規則のどれか一つが変われば、下流の結果は旧記録と完全一致しない。`GraphDecl`・`ConditionState`・`GraphRules`は、操作の所有者が固定実体として宣言したcurrentの値を呼出し側が渡し、edgeや結果の側から入力を採らない。同じグラフでもseedや条件の状態が違えば別の問いになる。

**照会の二段**：下流の結果を照会するときは、(1)currentの`GraphDecl`・`sources`・`vocab`・build_graphの規則で`build_graph`の記録を照会し、(2)その結果が`Value`の場合だけ、得た記録から`GraphRef`を作って下流の結果を照会する。(1)が`Unknown(conflict)`や`Stale`、`Unobserved`等の非`Value`なら、その結果を返して(2)へ進まず、`GraphRef`の新しい版へ読み替えない。`GraphRef`の`revision`は`build_graph`の`key_digest`であり、元の宣言の変化の分類（K2-I2）は(1)の段で決まる。

### 14.3 不変条件

- **K10-I1 閉じた語彙と端点**：edgeの`relation`は`vocab`の名前でなければならない。無ければそのedgeは`Unknown(unregistered)`の成分とする。`from`・`to`はグラフのnodeでなければならず、欠ければ`Unknown(missing_input)`とする。方向の無いedgeは置かない。
- **K10-I2 候補と確定**：`state`が`confirmed`になるのは、`source`が承認済みの固定実体で、そのedgeの種類・方向・意味・端点を宣言している場合だけとする。LLMの提案、名称の類似、pathの近さから作ったedgeは`candidate`にとどめ、整合・閉包・影響・独立の検査で肯定の根拠にしない。影響の検査では`possibly`として別に列挙する。
- **K10-I3 性質の検査**：確定edgeについて、(a)`symmetric`の型で逆向きの確定edgeが無い、(b)`inverse`を持つ型で逆の型の確定edgeが無い、(c)同じ端点の組に`contradicts`の関係にある二つの確定edgeがある、の各々を否定の成分とする。成分はedgeまたはedgeの組ごとに作り、全成分を一つの`combine`で合成する。edgeが0件なら`set_reason`。現行の型は循環の禁止を表すfieldを持たず、K10は循環を否定にしない（14.7）。
- **K10-I4 依存閉包**：`closure(seed)`は、`dependency`が真の型の確定edgeを、`transitive`が真の型についてだけ推移的にたどる。各edgeの`dep_class`と`ConditionState`で、行き先を次のとおり分ける。`required`、`true`の`operation_condition`、`selected`の`selected_source`は`effective`。`unknown`の`operation_condition`・`selected_source`は`held`。`false`の`operation_condition`は`diagnostics`の`condition_false`、`not_selected`の`selected_source`は`not_selected`、`reference_only`は`reference_only`とし、いずれもたどらない。`combined`の成分は、`effective`の各nodeへのedge（肯定）と`held`の各node（`Unknown(missing_input)`）とする。`diagnostics`は状態と根拠を残すが、有効な閉包の判定の成分には入れない（HARNESS-023-02：未選択sourceや条件不成立の依存を、有効な閉包や保留の条件に含めない）。`unknown`の選択を`not_selected`へ読み替えない。`safety`が真のedgeは、`effective`の条件を満たすとき外さない。
- **K10-I5 影響**：`impact(changed)`は、変わった対象から、確定edgeを型の`propagation`の向きにたどる（`along`はfromからtoへ、`against`はtoからfromへ、`none`はたどらない）。`dep_class`の条件はK10-I4と同じく`ConditionState`で分け、`held`に当たる枝の先は`Unknown(missing_input)`の成分とし、「影響なし」にしない。`candidate`のedgeでだけ到達するnodeは`possibly`に入れる。`affected`は「見直す対象」を示すだけであり、記録のクラスを書き換えない（K10-I7）。
- **K10-I6 独立復旧**：`independent(op)`は次の順に成分を作る。(1)同じ`GraphRef`の`check_graph`の結果の全成分（否定、非`Value`、`set_reason`）を`{graph_check, …}`の識別付きで入れる。(2)`op`のnodeがグラフに無ければ`Unknown(missing_input)`、`control_plane`の宣言が無ければ`Unknown(missing_input)`を入れる。(3)`op`からのK10-I4の閉包について、`effective`に入った`control_plane`のnodeごとに否定、`held`の各nodeに`Unknown(missing_input)`を入れる。(4)全成分を一つの`combine`で合成する。したがって、グラフの一部に未登録の関係や欠けた端点があれば、`control_plane`に到達しなくても`Positive`にならない。結果は「宣言したグラフの上で独立」だけを示す（14.5）。`closure`と`impact`も、(1)と同じく`check_graph`の非肯定の成分を入れる。
- **K10-I7 影響と結果・義務**：`affected`の各nodeについて、(a)そのidentityを鍵の`subject`または`inputs`に持つK2の記録の集合と、(b)K4の義務のうち、そのidentityを`target`か`source`に持つもの、またはその義務の`operation`のcurrentの`OperationDecl`の`inputs`にそのidentityを持つもの（13.2の基底鍵の`subject`・`inputs`にそのidentityが入る義務）の集合を、K5の`restore`した記録と、呼出し側が渡すcurrentの`OperationDecl`（`decls`）から列挙する。これが見直す対象のexact setである。見直しは、各操作の所有者がcurrentの宣言（`OperationDecl`等）を更新した後に、そのcurrentの基底鍵でK2の`lookup`とK4の`evaluate`をやり直すことで行う。その結果のクラスはK2-I2のとおりであり、identityの集合を保った正当な新revisionで旧記録が`Value`なら`Stale`、同じrevisionでbytesだけ変われば`Unknown(conflict)`、入力のidentityの集合が変われば`Unobserved(not_run)`、旧記録が非`Value`なら`Unobserved(not_run, superseded)`となる。`affected`に無い記録と義務は見直さない（INTELLIGENCE-078-04、HARNESS-030-04）。

### 14.4 API境界

- `build_graph(decl, rules) -> ResultRecorded | Rejected(reason)`：宣言だけを受け取り、K10-I1・I2に従ってedgeを正規化する。`candidate`を`confirmed`へ変える経路は、`source`の承認済みの固定実体の宣言だけとする。
- `check_graph(graph_ref, rules, input_heads) -> Observed<Combined>`：K5の`restore`（固定prefixと完全性）→`lookup`でグラフを得て（非`Value`ならそれを返す）、K10-I1・I3を検査する。
- `closure(graph_ref, seed, condition_state, rules, input_heads) -> Observed<Closure>`、`impact(graph_ref, changed, condition_state, rules, input_heads) -> Observed<Impact>`、`independent(graph_ref, op, condition_state, rules, input_heads) -> Observed<Combined>`：同じくグラフを得てから、K10-I4〜I6に従う。
- `review_set(impact, obligation_set_keys, decls, input_heads) -> Observed<{records, obligations}>`：K10-I7の見直す対象のexact setを返す。義務は`obligation_set_keys`の各集合から読み、`decls`は操作の所有者が宣言したcurrentの`OperationDecl`を呼出し側が渡す。`decls`に義務の操作が無ければ、その義務を`Unknown(missing_input)`として返す。記録のクラスは変えない。

### 14.5 扱える範囲と扱えない範囲

| 対象 | 扱い |
|---|---|
| 宣言したedgeの型・端点・性質の整合 | 扱える（K10-I1、I3） |
| 宣言したグラフと条件の状態の上での依存閉包・影響・独立 | 扱える（K10-I4〜I6） |
| 宣言されていない依存（隠れた自己依存、実行時だけの依存） | 扱えない。OS-014-07のとおり、段階を分けた起動・更新・復旧の観測で確かめる |
| `candidate`のedgeの真偽 | 扱えない。`possibly`として列挙するだけで、確定は由来の宣言による |
| `ConditionState`の値の正しさ | 扱えない。宣言した所有者の責任であり、K10は`unknown`を保留として扱うだけ |

### 14.6 旧HELIXとの対応

| 旧source（ID／path:行／SHA-256） | 保持する点 | 変更する点 | 区分候補 |
|---|---|---|---|
| `LEGACY-ASSET-D94F2C0530850989B5F4`／`docs/design/helix/L6-function-design/ci-responsibility-registry.md:26-36`／`1ec55190d3c6eb018fa4288f8fd91b47a94955afddc5c01d419ea4f9d5a1c144` | edgeは明示された型（`refines／implements／verifies／contains／consumes／depends_on`）だけを受理し、名称類似・path近接・LLM推測でedgeを足さない。seedから明示edgeの有向closureを計算する | 型を語彙として外に出し、性質を宣言する。旧はdependency cycleを一律に拒否したが、本章は承認済みL3に由来が無いため一律にしない（14.7） | `semantic_rederive` |
| `LEGACY-ASSET-EBEF9C2559936172AD8F`／`docs/design/helix/L5-detail/design-registry.md:39-50,79`／`e57a1a119c4013a2282e31be8a6ebd1b898a158f3a581bd470f83f1850e4e4ed` | node・edge・version・authority・staleを結ぶ。edgeの状態を`shadow／canonical／stale／retired`に分ける | 状態を`candidate／confirmed／retired`にし、staleはK2の導出に任せる | `semantic_rederive` |
| `LEGACY-ASSET-04F72C685179FF8BD977`／`src/runtime/issue-hierarchy.ts:800-812`／`c1238598e6b9dd9832b08e2e679328489c7e44f7a79bf3a54e42c742f47adace` | `depends_on`に逆の`blocks`が無ければfindingにする（逆関係の対の照合） | Issueの関係に限っていた照合を、語彙の`inverse`の性質として一般化する。srcは除外classのため参照だけ | `semantic_rederive`（参照のみ） |
| `LEGACY-ASSET-6929C09B95A444D95B49`／`docs/improvement-backlog.md:17`（IMP-148）／`e6d327ff488860dcaa8d7a150ac893e5cf0940eb710396cdf7ae746f5689a9e2` | 失敗史：edgeの語彙が設計・DB・collector・影響分析の間で同期せず、残差が残った | 語彙を一つの固定実体（`RelationVocab`）にし、グラフの鍵に入れる | 失敗史（区分なし） |

関係の型ごとに推移性・対称性・逆関係・矛盾・変更の伝播の向きを値として宣言し、グラフの規則として検査する形は、旧HELIXに見つからない**新規案**である。旧には型の列挙と、Issueの関係での逆関係の対の照合（上表）だけがあった。検索の範囲は`archive/legacy-generation-2026-09-14/root/`の全ファイル（`grep -rIl`、読取りだけ）で、`transitive` 13件、`symmetric` 6件、`conflicts_with` 1件、`reflexive` 0件、`推移` 13件だった。`transitive`と`推移`の該当はpackageの推移依存（lock・SBOM・import）の意味、`symmetric`はroleの一覧とIssueの関係の照合、`conflicts_with`は旧PLANとの衝突のflagであり、関係の型の性質を宣言するものは無かった（`対称`は99件あり、抜き取りでは「非対称」（runtimeの間や記述の非対称、Issueの依存の非対称）の意味で、関係の型の性質の宣言ではなかった。全件は読んでいない）。

### 14.7 依存循環の境界

承認済みL3が導出していない一律cycle拒否は加えない。K10は宣言済み語彙と性質に従いclosure/impactを扱い、cycleの存在だけから拒否を推論しない。一律拒否を新しい要求へ追加する場合だけ6.2へ戻す。

### 14.8 機構別語彙と検証範囲

- 各機構の語彙（どの関係の型を置き、性質の値をどうするか）は、各機構のL4で承認済みL3の由来から宣言する。
- `control_plane`の宣言の所有者は、15.5でINFRASTRUCTUREとした。
- 試作：HARNESS-L2-023のpack依存を小さなグラフにし、L9のIV-K10-01〜14を動かす。

## 15. K7 世代pointerとfencing、G5 取消しの伝播、型番台帳と配置

段階の現行の世代を指すpointerと遅着作用の拒否（K7）、取消しを依存する受け手へ伝える経路（G5）、内部デプロイ方針6の型番台帳の形式と実装のディレクトリ配置を定める。三つは同じ「段階（composite）の型番」を参照する。

### 15.1 由来

| 由来 | 位置 | 要点 |
|---|---|---|
| OS | `AC-OS-014-01`、`014-04`、`014-06`（`docs/helix-os/L3-requirements/functional-requirements.md:21,24,26`） | 段階のidentityを保ち、packの版・構成等を一組として保存する。前の段階の構成・artifactを保持して次を作り、問題があれば前の構成へ戻す。案件のstate・recordは戻さない |
| INFRASTRUCTURE | `INFRA-005-AC-03`（`docs/helix-infrastructure/L3-requirements/functional-requirements.md:287`）、`INFRA-006-AC-03`（同:91） | rollback先の適格性とreceiptを持ち、rollbackだけでincidentを閉じない。最後の適格revisionと未完の義務を追う |
| HARNESS | `AC-HARNESS-L3-010-01`・`03`（`docs/helix-harness/L3-requirements/functional-requirements.md:37,39`）、`AC-HARNESS-L3-021-03`（同:483） | packのidentity・版・入出力・依存・検証範囲・owner・収載を宣言する。失敗時は直前の適格版へ戻す。rollbackの証拠が対象の版・scopeと一致するときだけ復元候補とする |
| SECURITY | `SECURITY-AC-009-01`（`docs/helix-security/L3-requirements/functional-requirements.md:180`） | revoke等のtriggerを、OSの新規割当、Workerの実行と途中成果物、CONNECT、credential、artifact accessの全受け手へ伝え、受け手ごとに受領・適用・未達・未観測を区別する。停止を確認できないまま継続しない |
| PO判断 | `docs/governance/decisions/po-l3-l10-post-confirmation-and-internal-deployment-policy6-2026-10-08.md:59-70`（判断2：方針6の確定） | 部品・接続・システムを種別付きの型番で識別し、台帳で版・検証範囲・内部デプロイの状態を管理する。項目はHARNESS-L2-010とHELIXOS-L2-014のものをそのまま使う。コードの配置はアプリケーションの構造に合わせるが、フォルダのpathを識別子の正本にしない。`docs/`は変えない |

承認は`docs/governance/l3-l10-po-post-confirmation.md`の各行が示す判断記録による（OS Stage 2b、INFRASTRUCTURE Stage 1・2a、HARNESS Stage 1・5、SECURITY Stage 1）。開発repoの「差し戻しの判断記録」（運用モデル「POの事後確認」）は開発repoの運用規則であり、G5の根拠にしない（解禁判断記録の判断3）。

### 15.2 K7 世代pointerとfencing

```text
Generation  = { target: identity（段階の型番）, number: 符号なし整数, composition: SubjectRef（台帳の段階の版）, manifest: ManifestRef }
PointerLog  = K5のlog（log_id: generation:<target>、store: stage）。PointerMovedを書くsegmentは、段階の所有者（OS）が
              宣言した一つのpointer_writerのsegment（pointer segment）だけとする
  GenerationStaged { generation } # 同じtarget/compositionのReleaseEstablished済みmanifestを指す場合だけ
  PointerMoved     { request: entry_digest（MoveRequested）, from, to, checked_heads: SegmentHead[] }  # 適用。現行を変える
  MoveAuthorizationObserved { move: entry_digest（PointerMoved）, phase: immediate | recovery,
                              check: FixedRef（PermissionCheck）, observed_at: SubjectRef | null } # pointer_writerが直後照合から追記。pointerを変えない
  WriterHandoff    { from_segment_head: SegmentHead, to_segment }  # pointer_writerの交代。交代後のpointer segmentの最初の行
RequestLog  = K5のlog（log_id: move-request:<target>、store: stage）。requesterごとのsegmentに書く
  MoveRequested    { pointer_head: SegmentHead（request時のpointer segmentの末尾）, from, to,
                     kind: promote | rollback | rebuild, authorization: SubjectRef,
                     eligibility: RequiredResult（request時のcurrent照合結果。ReleaseEstablishedの固定受入証拠を複製しない）,
                     eligibility_snapshot: { decl: SubjectRef（OperationDecl）, verifier_set: SubjectRef,
                                             heads: SegmentHead[] } }   # 記録だけ。現行を変えない
  RollbackRequired { generation, evidence }                       # 観測。pointerを動かさない
EpochLog    = K5のlog（log_id: epoch:<scope>、store: stage）。書くのは割当ての所有者（OS）の一つのsegmentだけ
  EpochIssued { scope, number }
EpochToken  = { scope, number, entry_digest（EpochIssuedの行） }
MoveUnfinished = { move: entry_digest（PointerMoved）, check: PermissionCheck,
                   rollback_required: FixedRef（RequestLogのRollbackRequired） }
                # 未完の診断参照。K4の義務や新しい許可を発行する型ではない
```

`ManifestRef`、`stage_key`、`ReleaseLog`、`ReleaseEstablished`、`RuntimeLog`、`RuntimeObserved`の型はrepository-layout L4 §4.1（RL-R1〜R5）の定義を参照し、本節では再定義しない。

- **K7-I1 一つの現行と順序**：`PointerMoved`の順序は、pointer_writerのsegmentの`seq`の順とし、pointer_writerが交代したときは、新しいsegmentの最初の行の`WriterHandoff`が指す旧segmentの末尾の後に続ける（K5-I7のsegmentの辞書順は使わない）。現行の世代は、この順で最後の`PointerMoved`の`to`とする。`WriterHandoff`の連鎖が途切れていれば、現行は`Unknown(missing_input)`とする。
- **K7-I2 二段と直列化**：`request_move`は、pointer segmentの末尾を`pointer_head`として読み、その固定prefixからK7-I1で現行の世代を導き、`from`がそれと一致しなければ`Rejected(stale_from)`とする。次に適格性を検査し（K7-I3）、そのとき使ったcurrentの`OperationDecl`・`VerifierSet`の参照と、読んだlogの末尾を`eligibility_snapshot`に固定して、`MoveRequested`を`RequestLog`へ追記する。pointer segmentへは書かないので、request自身の追記でpointer segmentの末尾は変わらない。`apply_move(request)`は、pointer segmentへの条件付き追記`append_if_head(pointer segment, expected_head = request.pointer_head, PointerMoved)`だけをcommitの境界とする。`append_if_head`は、segmentの末尾が`expected_head`と一致することの確認と一行の追記を、pointer_writerが一つの操作として行い、確認と追記の間に別の追記が入らない（K5の`append`の上に置くK7の受け口。旧node-runtime-cutoverのsingle authority pointer CAS）。一致しなければ`Rejected(stale_head)`とし、何も追記しない。`expected_head`が`pointer_head`なので、追記が成功すれば、`from`と現行の一致もcommitまで保たれる。requestの後に別の`PointerMoved`が一件でも入れば、そのrequestはstaleであり、新しい`pointer_head`へ付け替えて使わず、`request_move`をやり直す（旧node-runtime-cutoverのprepareとcommitの分離）。実storeのcompare-and-append要件はrepository-layout L4 §6.2 RL-P7に従い、Git mergeを代用しない。
- **K7-I2b 適格性の入力の再読**：`apply_move`は、追記の直前に、所有者のcurrentの`OperationDecl`・`VerifierSet`の参照と、`eligibility_snapshot.heads`の各segmentの末尾を読み直し、`eligibility_snapshot`と一致しなければ`Rejected(stale_eligibility)`として追記せず、`request_move`をやり直させる（旧node-runtime-cutoverのcommit直前の全staged digestの再読）。読み直したheadは`checked_heads`として`PointerMoved`に記録する。他のwriterのsegmentへの追記を、pointer_writerの一つの操作の中で止めることはできないので、読み直しと追記の間に入った変更は、追記の後で次のとおり検出する。`verify_current(target)`は、追記の後に、currentの`OperationDecl`のscopeが必要とする全segment（K5-I11）の`current_head`を取り直し、その新しい固定prefixで、現行の世代の適格性をK7-I3と同じ手順で求め直す。`checked_heads`は記録として残すが、検出の根拠には使わない。必要なsegmentの欠落や読取不能は`Unknown(missing_input)`・`Unknown(unreadable)`として`Positive`にしない。求め直した結果が`Positive`でなければ、その結果を観測として記録し、`RollbackRequired`を追記する（pointerは動かさない。K7-I5）。新しい鍵の正しいreceiptがあれば`Positive`になりうるので、変更があれば必ず非`Value`になるとは扱わない。他のwriterとの完全な原子性は与えず、読み直しと追記の間の変更は、この追記の後の再計算でだけ検出する。許可の変化（取消し等）はG5とK7-I6の`Epoch`で扱う。
- **K7-I3 適格性の入力**：移動先の世代の適格性は、操作`stage_verification`について、currentの`OperationDecl`の版をoperation_versionとするRL-R2のstage_key（`subject`＝移動先の`ManifestRef`、`inputs`＝RL-R2のstage_keyに定めるmanifestのcomposite/source/artifact.pack/artifact.artifact/environment/rollback refs、`scope`＝current `OperationDecl`のscope）を作り、固定した`VerifierSet`と`input_heads`でK6-I7の手順（`restore`→`lookup`→`admit_receipt`→全成分の`combine`）に、RL-R2のbuild_chain・admit_artifact_bytes・artifact検証成分を加えて行った`RequiredResult`とする。`GenerationStaged`は、そのmanifestについて`ReleaseEstablished`があり、manifest.targetとgeneration.target、manifest.compositeとgeneration.compositionがそれぞれexact一致するときだけ記録できる（RL-R4）。`ReleaseEstablished.eligibility`がrelease成立の唯一の固定受入証拠であり、`MoveRequested.eligibility`は移動時にcurrent stage_keyで行うK2/K6再照合結果である。独立編集可能な受入値を複製しない。`Positive`でなければ`Rejected(not_eligible)`とし、request時の`RequiredResult`（`assurance`を含む）は`MoveRequested`に記録する。移動先は`kind`ごとに次を満たさなければ`Rejected(not_eligible)`とする。promote：`to`は、まだ現行になったことの無い新しい世代の`number`（`GenerationStaged`済み）。rebuild：`to`は新しい世代の`number`で、その`composition`が`from`の世代の`composition`とidentity・revision・digestまで一致する。rollback：`to`は保持している（`GenerationStaged`済みで、かつて現行になった）前の世代の`number`（AC-OS-014-06、HARNESS-010-03、021-03）。
- **K7-I4 許可と適用の分離**：`MoveRequested`は記録だけであり、現行・内部デプロイの状態・G5-I6の待ちを変えない。`PointerMoved`を追記できるのは、`authorization`が対象段階・移動先`to.composition`の版・作用`deploy`とその`kind`に束縛された許可として照合され、取り消されていない場合だけとする。kindは16.4のMoveActionRefで照合し、別構成版・別kindを段階名とdeployだけで許可しない。`from/to`世代番号とpointer末尾はrequest/CAS・適格性の入力であり、許可へ新しい軸として加えない。明示された広い既存許可の再利用はK3-I1/I3の既存包含規則による。照合はK3（16章）で行う。currentの7軸・宣言されたoperation input・source・expiry・取消しの照合が全て肯定の場合だけ追記へ進み、照合できなければ`Rejected(authorization_unverified, check)`とする（`MoveRequested`はpendingのまま）。追記直後もcurrentの許可を再照合し、`MoveAuthorizationObserved`に当該moveとcheckを固定する。phase=immediateのcheckが肯定で観測時点も記録できるなら`Appended(PointerMoved)`、非肯定または時刻未観測なら追記済みpointerの事実を保持した`AppliedUncertain{event, check, unfinished: MoveUnfinished}`とし、`RollbackRequired`と未完の診断を残す。直後観測が欠ける間も完了ではない。回復は15.6の`recover_move_observation`による現在時点の再照合として記録し、欠落した直後の成功を捏造しない。内部デプロイとcutoverは、対象と作用を明示したPOの許可を要する外部作用であり（AGENTS.md、内部デプロイの判断記録の方針1）、K7はその許可を生成しない。
- **K7-I4b 直後観測の位置**：phase=immediateは、参照するPointerMovedと同じpointer segmentにおけるseq+1の行に限る。project・ledger_view・G5はphaseの自己申告だけを受け入れず、この位置とmove digestを照合する。それ以外の位置・別segment・別moveのimmediateは`Unknown(conflict)`として通常完了やG5待ち解消へ使わない。observed_atは観測時点の記録であり、この順序検査を代用しない。停止後の再開では、次のseqが空いていても15.6の回復経路を使いphase=recoveryとする。ログから検査できるのは位置・segment・move digestまでである。他の行が無い停止・再開と遅い連続実行はログだけでは識別できず、再開後にseq+1へimmediateを偽装した履歴の検出は保証しない。再開時のrecovery経路は実装の制御フロー契約として、L9の停止注入で確かめる。writerの実行履歴の真正性をK6を超えて保証しない。
- **K7-I5 自動の切戻しをしない**：失敗を観測しても、pointerを動かさず`RollbackRequired`を追記するだけとする（旧ADR-009の保持）。自動の切戻しは、Phase 2へ移る判断で扱う（2026-10-08判断記録の判断3）。rollbackは構成だけを戻し、案件のstate・recordは現在のものを引き継ぐ（AC-OS-014-06）。rollbackでincidentを閉じない（INFRA-005-AC-03）。
- **K7-I6 fencing（遅着作用の拒否）**：割当て・runのscopeごとに、現在の`EpochToken`は`EpochLog`の最後の`EpochIssued`とする。再割当て、取消し、失効で新しい`EpochIssued`を追記する。状態を変える作用（K5への追記、artifactの書込み、結果の`record`）は`EpochToken`を持ち、`admit_effect`は次の順で検査する。(1)`scope`、`number`、`entry_digest`が現在の`EpochToken`とすべて一致しなければ`Rejected(fenced)`（小さい値、大きい値、別のscope、同じnumberで別の行のいずれも拒否する）。(2)そのscopeが依存する許可の取消しについて`PropagationView`が`Positive`でなければ`Rejected(revocation_pending)`。(3)取り消された許可に代わる新しい許可の記録が無ければ`Rejected(missing_authorization)`。旧い`EpochToken`の観測（CI、review、費用）は、作用と別の`LateObservation`のeventとして元のepisodeへ結んで追記し、作用として適用しない（4章の「遅着観測」）。

### 15.3 G5 取消しの伝播

```text
Revocation      = { revoked: SubjectRef, record: SubjectRef（取消しの記録）, trigger }
RecipientClass  = os_assignment | worker_run | connect | credential | artifact_access | approval_consumer | internal_deployment
RecipientMap    = FixedRef。SECURITYが宣言する { nodeのkind -> RecipientClass }
RecipientDecl   = FixedRef。受け手の所有者が宣言する、currentの { identity -> SubjectRef }
PropagationView = { revocation, recipients: { identity -> Set<RecipientClass> }, combined: Combined,
                    assurance: { (identity, verifier) -> { reverifiable, reproduction, issuer_authenticity } } }
```

- **G5-I1 受け手の全集合**：`propagate`は、(1)K10の照会の二段で、currentの`GraphDecl`・`GraphRules`からグラフを得る（非`Value`なら、その結果を返す）。(2)`impact(changed = [revoked])`と、`review_set(impact, obligation_set_keys, decls)`を行う。(3)`affected`の各nodeは、そのnodeの`kind`を`RecipientMap`で写した`RecipientClass`の受け手とする（写せなければ`Unknown(unregistered)`の成分）。`review_set`の各記録は、その鍵の`subject`のidentityを、各義務は、その`target`のidentityを、`approval_consumer`の受け手とする。同じidentityに複数の種類が導かれれば、すべての種類を保持し、種類ごとに成分を作る（後から導いた種類で上書きしない）。(4)`check_graph`・`impact`・`review_set`の否定・非`Value`・`set_reason`の成分は、`{graph, …}`・`{review, …}`の識別付きですべて`combined`へ入れる。受け手が0件なら`set_reason`。
- **G5-I2 状態はreceiptから**：受け手`r`の現在の参照は、`r`の所有者が宣言した`RecipientDecl`の`SubjectRef`とし、receiptや旧い記録から採らない。`RecipientDecl`に`r`が無ければ`Unknown(missing_input)`、同じidentityで同じrevisionに二つのdigestがあれば`Unknown(conflict)`の成分とする。`r`の状態は、操作`revocation_apply`について、`r`のcurrentの`OperationDecl`から作る基底鍵（`subject`＝`r`の現在の`SubjectRef`、`inputs`＝宣言の入力と`Revocation.record`、`scope`＝宣言のscope）で、固定した`VerifierSet`の`required_for[revocation_apply]`の検証器（受け手の適用を確かめる検証器）のreceiptを、K6-I7の手順で得る。receiptの`inner`の検査`applied`が肯定、`failed`が否定、`received`が`Unobserved(pending_receipt)`であり、`inner`の全成分と`set_reason`を`{r, verifier, 検査}`付きで`combined`へ入れる。照会や受入の非`Value`（receiptが無い`Unobserved(not_run)`、`Stale`、`Unknown(conflict)`、`Unknown(unreadable)`、`Unknown(missing_input)`）は`r`の成分とする。`assurance`は`{r, verifier}`ごとに返す。旧い取消しの`applied`のreceiptは、K2-I2のとおり、別の取消しの記録（別identity）なら`Unobserved(not_run)`、同じ取消しの記録の旧revision（旧記録は`Value`）なら`Stale`、同じrevisionでdigestが違えば`Unknown(conflict)`となり、いずれも`applied`として数えない。
- **G5-I3 停止を続ける**：`PropagationView`が`Positive`になるまで、取り消された記録に依存するscopeの作用を、K7-I6の(2)で拒否する。
- **G5-I4 取消しから許可を作らない**：取消しは承認・許可を生成しない。取消しを取り消して元へ戻す経路を置かず、再開には新しい許可の記録を要する（K7-I6の(3)）。
- **G5-I5 承認の状態と記録**：取消しは新しい記録として追記し、取り消された記録や本文を書き換えない。承認の記録を入力に持つ結果は、K10-I7の見直しの対象になる。
- **G5-I6 内部デプロイ**：現行の世代の`composition`が取り消された記録に依存する場合、`RollbackRequired`を追記し、受け手`internal_deployment`は、許可を照合した`PointerMoved`が適用され、同じmoveの`MoveAuthorizationObserved`のphase=immediateの直後checkが肯定でobserved_atが記録され、かつG5-I2のcurrent receiptが成立するまで`Unobserved(not_run)`とする。`MoveRequested`、直後観測欠落、`AppliedUncertain`では、この待ちを解消しない（K7-I4）。位置の検査はK7-I4bに従う。停止・再開の区別はログでは保証せず、対のL9 IV-K3-17の停止注入で回復経路を確かめる。

### 15.4 型番台帳

- **形式**：型番台帳は`LogDecl.store=repository`のK5 log（`log_id: model-number-ledger`）とし、manifestを書くのはOS（段階の登録と統制）、unit・connectionの行のsegmentを書くのはHARNESS（packの宣言）、compositeの行のsegmentを書くのはOSとする（AC-OS-014-09の所有の境界）。行は`DeclaredEvent`（9.3）とし、種類は`ModelNumberDeclared{kind: unit | connection | composite, identity, owner}`とRL-C3の`VersionRegistered{identity, version, declaration: FixedRef, declaration_digest}`である。`declaration_digest`は宣言の固定bytesのSHA-256であり、登録eventはpack/compositeの項目を複製しない。
- **項目**：`ledger_view`は`VersionRegistered.declaration`の固定bytesを実読し、`declaration_digest`と一致する宣言だけから項目を導く。保存行は登録事実・version・FixedRef・digestだけを持ち、viewの項目を別の編集可能な値として保存しない。unit・connectionの宣言項目は、HARNESS-L2-010がpackに求める宣言（identity、版と成熟度、入力・出力の契約、依存の種別・identity・版、検証範囲とoracle、ownerの種別とidentity、収載・非収載。AC-HARNESS-L3-010-01）だけとする。composite viewの項目は、HELIXOS-L2-014の「一組として保存するもの」（packと依存のidentityと版、configuration、data format、対応環境、能力と制約、scope内の受入の証拠、更新・rollbackの条件。AC-OS-014-04）に限定する。declaration.jsonが持つのはRL-C2の識別項目・構成項目（受入の証拠を除く）であり、viewの受入fieldはReleaseManifestから導く`ReleaseEstablished.eligibility`を参照する。各declared項目の具体値は該当pack/composite declarationの固定参照で表し、台帳では登録事実とその参照を結ぶ（RL-C1〜C3）。同じ値の独立した編集源を二つ作らず、新しい要求項目は足さない。版はK2の`SubjectRef`、検証範囲はK4の`ObligationSet`、依存はK10のedge、scope内の受入の証拠はReleaseManifestから導く`ReleaseEstablished.eligibility`で表す（RL-R2）。`ReleaseEstablished.eligibility`は固定された唯一の受入証拠であり、後続`MoveRequested.eligibility`は既存K2/K6のcurrent照合結果として保持し、独立編集値として受入結果を再保存しない。これは項目の表し方であり、項目を足すものではない。
- **内部デプロイの状態**：台帳に別に書かず、K7の`PointerLog`から導くprojectionとする（二つの正本を作らないため）。現行世代は`PointerMoved`、許可の直後照合状態は同じmoveのphase=immediateの`MoveAuthorizationObserved`から別fieldに導く。phase=recoveryは回復時点の診断として別に保持し、欠けたimmediateを埋めない。observed_at=nullも肯定完了にしない。観測欠落は`Unobserved(not_run)`、非肯定はそのcheck全成分を保持し、通常の完了と区別する。後続moveを前のmoveの肯定で補わず、許可のcurrent性は使用時にK3で再照合する。`MoveRequested`は現行や完了を変えない。位置の検査はK7-I4bに従う。停止・再開の区別はログでは保証せず、対のL9 IV-K3-17の停止注入で回復経路を確かめる。
- **現行の台帳**：台帳の現在の内容は、K5の`project`で導く。台帳はK10のグラフの`sources`の一つになり、依存のedgeの由来になる。

### 15.5 配置と正本の所在

配置の詳細の正本は[リポジトリ構成L4](repository-layout.md)であり、対の検証は[リポジトリ構成L9](../L9-integration-verification/repository-layout-integration-verification.md)である。2026-10-09 PO構成判断を具体化した同書の型・符号化・公開/配布契約を、本書に別定義しない。本書はK5/K7/台帳の共通型と結合境界を持ち、同書§10の6項目を9.3/9.4/15.2/15.4/15.6へ反映する。

| 対象 | 配置と責務の参照 |
|---|---|
| 意味・検証設計 | `docs/`の機構×層。repository-layout §2、RL-C7、RL-T2。L4/L9本文はここに保持する |
| pack declaration・実装・検証 | `helix/<enc(機構)>/{units,connections,composites}/<enc(型番)>/declaration.json`と同packのsrc/tests/fixtures。§2/3、RL-C1〜C5。フォルダ名はidentityの正本でない |
| cross-pack宣言 | `declarations/<enc(所有機構)>/<enc(種類)>/<enc(identity)>.json`。RL-C2。pack項目はここに二重記載しない |
| 型番登録 | 15.4のK5 model-number-ledger。RL-C3のVersionRegisteredが宣言の固定bytes/digestを参照する。型番文字列やfolderの存在は登録でない |
| repository記録 | store=repositoryのlogだけを`records/<enc(log_id)>/manifest.jsonl`と`records/<enc(log_id)>/segments/<enc(writer)>/<20桁segment_no>.jsonl`へ置く。encはrepository-layout §6.1の唯一の定義を使う |
| stage/instance記録 | RL-P7〜P9。PointerLog/RequestLog/EpochLog/RuntimeLogはstore=stage。Git mergeをappend_if_headの代用にしない |
| release/配布/実行 | ReleaseManifest/ReleaseEstablished/RuntimeObservedは§4、DistributionProfile/投影は§5。public開発sourceとprivate配布を混同しない |

フォルダと宣言のidentity/owner/kind不一致はRL-C4のUnknown(conflict)、台帳未登録はUnknown(unregistered)、登録済み実体欠落はUnknown(missing_input)を保持する。物理pathをK2のlogical identityへ代入しない。K5損傷検出とK7 current authorization/fencing/CASはそれぞれ既存境界で検査し、path符号化やGit履歴から真正性・書込み保護を生成しない。物理強制手段と新規案の採否はrepository-layout §8/11/12の範囲のままであり、本書から実施・採択を生成しない。

#### 旧HELIXとの対応

| 旧source（asset ID / path:行 / SHA-256） | 保持する点 | 変更する点 |
|---|---|---|
| `LEGACY-ASSET-FDBA655B1CFF75DCDC0E` / `archive/legacy-generation-2026-09-14/root/docs/governance/repository-structure.md:13-97,102-120,146-173` / `6f8ee784049d03279641151714c3572656eb20c64cfb769853b6e885abf4f262` | canonical tree、意味の正本とgenerated/runtime/historyの区別、空folderを実装許可としない、root configを抑える | `src/tests/config/.helix`等の旧配置とtoolchainは採らず、現行のpack・宣言・record構成へ置換する。 |
| `LEGACY-ASSET-A2F6A697D7FFFD490B57` / `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/release-module-bundle-composition-requirements.md:54-58,110-115,133-138` / `336d361ec89c36ca377113aca2f08b6b510cd0127ddbba191d311cec4990c89c` | path ownershipと変更箇所からverification範囲を決めること | 旧Module/Bundleを現行pack種別・台帳へ置換し、repo split/旧release waveは引き継がない。 |
| `LEGACY-ASSET-809B35B3C91567A97AF5` / `archive/legacy-generation-2026-09-14/root/docs/design/harness/L5-detailed-design/source-boundary-architecture.md:11-18,47-57` / `6bee024905701ca99ccd09e2a357e3b91fbf5370e4118630cfb1da5119d07610` | owner分離、一方向依存、default-deny、empty/missing policyをallowとしない | 旧source-boundary実装/schemaは移さず、現行のowner契約へL4で接続する。 |
| `LEGACY-ASSET-8195605FB59B8B837EFF` / `archive/legacy-generation-2026-09-14/root/docs/adr/ADR-005-distribution-model-and-central-ui.md:16-36` / `dc6f09d05556442518fb09dd7fa38536562b0ab60e6947d044593500e5d3f16f` | 開発repoと版付き配布物を分けること | 旧internal GitHub pull、npm、中央UI、pluginの主軸は採らない。現行判断のpublic development sourceとprivate distribution boundaryに合わせる。 |
| `LEGACY-ASSET-80FD1264A2C50E2E4AA4` / `archive/legacy-generation-2026-09-14/root/docs/process/README.md:44-55` / `21a875ca5b46a8396485690a8405923ea197552fe4aa2302b1eaad6f7e650985` | L4基本設計とL9結合検証のpair | 現行の機構×層`docs/`配置へ置く。 |

配置・release・配布・物理pathの結合oracleはrepository-layout L9のIV-RL-01〜54に一意に置く。本書のIV-LDG-01〜04は台帳/カーネルへの接続、IV-K5は共通logの読取り契約を検証する。いずれも設計上の期待であり、実行・合格の証拠ではない。

### 15.6 API境界

- `request_move(target, from, to, kind, authorization, decls, verifier_set, input_heads) -> Appended(MoveRequested) | Rejected(stale_from | not_eligible)`：K7-I2・I3に従う。pointer segmentへは書かない。
- `apply_move(request, decls, verifier_set, input_heads) -> Appended(PointerMoved) | AppliedUncertain(event: entry_digest, check: PermissionCheck, unfinished: MoveUnfinished) | Rejected(stale_head | stale_eligibility) | Rejected(authorization_unverified, check: PermissionCheck)`：K7-I2・I2b・I4とK3（16.4）に従い、許可を使用直前に照合して`append_if_head`で追記する。`PermissionCheck`は通常checkまたは`PermissionCheckDiagnostic`を含み、K2 key自体が作れない場合も理由を返す。直後に許可変化を検出した場合は追記済みeventを保持して`AppliedUncertain`を返す。
- `recover_move_observation(move_ref, decls, verifier_set, input_heads) -> Appended(MoveAuthorizationObserved) | Rejected(not_a_move | already_immediate)`：move_refがPointerMovedを指さなければnot_a_move、K7-I4bを満たすimmediate観測が既にあればalready_immediateとして追記しない。追記後・直後観測前に停止した場合、pointer_writerは元のPointerMoved/MoveRequestedを実読して同じquery・許可refをcurrent sourceで再照合する。`MoveAuthorizationObserved`に`phase: recovery`と実際の観測時点を記録し、過去の直後照合の代用にしない。checkがPermissionCheckDiagnosticまたは時刻未観測でも、check全成分とobserved_at=nullを保持したrecovery行を追記しAppendedで返す。このAppendedは診断行の保存成功だけを表す。後続moveが既にある場合も元moveの診断としてだけ追記し、現行を戻さず、後続moveの観測に流用しない。recoveryが肯定でも元moveの未確認区間は残り、G5-I6の待ちや通常完了を遡及成立させない。必要な切替は既存K7手順の新しい明示moveで行う。
- `verify_current(target, decls, verifier_set) -> Observed<RequiredResult>`：K7-I2bの追記の後の検出。必要な全segmentの`current_head`を取り直して求め直し、`Positive`でなければ観測を記録して`RollbackRequired`を追記する。pointerは動かさない。
- `append_if_head(segment, expected_head, entry) -> Appended | Rejected(stale_head)`：K7-I2の条件付き追記。
- `admit_effect(effect, epoch_token, input_heads) -> Appended | Rejected(fenced | revocation_pending | missing_authorization)`：K7-I6に従う。
- `propagate(revocation, graph_decl, graph_rules, condition_state, obligation_set_keys, decls, recipient_decls, verifier_set, input_heads) -> Observed<PropagationView>`：G5-I1〜I3に従う。
- `ledger_view(input_heads) -> Observed<LedgerView>`：`LedgerView={rows:既存の型番台帳view行[], release, target:{generation, immediate_check, recovery_diagnostics}, actual}`。`rows`は既存の`model-number-ledger`の登録事実と固定宣言から導く。releaseは`ReleaseLog`の`ReleaseEstablished`、targetは`PointerLog`の現行`PointerMoved`と同moveのimmediate許可check・recovery診断を分けて保持し、actualは`RuntimeLog`の`RuntimeObserved`から別々に導く。各fieldの非肯定を保持し、他fieldから補わない。actualをpointerや許可checkから推定せず、`MoveRequested`を使わない（RL-R5）。

### 15.7 旧HELIXとの対応

| 旧source（ID／path:行／SHA-256） | 保持する点 | 変更する点 | 区分候補 |
|---|---|---|---|
| `LEGACY-ASSET-B6DC14C1DA937E3AC96C`／`docs/design/helix/L5-detail/node-runtime-cutover.md:47-53,106-112,123-129`／`49f3e4c324b19e728f7c05787bbd698f841728a526eedc7cec3f756b3601e9f9` | 切替は承認・計画・commit・監視の状態機械で、rollbackは`rollback_required→rollback_approved→rolling_back`だけ。commit pointは`runtime generation current` pointer一件のCASに縮約し、commit直前に承認・writer epoch・lease/fence等を再読し、CASの敗者や古いepochは作用0とする | runtimeの切替に限っていたものを、段階の世代pointerの`move`へ一般化する | `semantic_rederive` |
| `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`／`docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:117,198`／`db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb` | 失効したrunの遅着の結果をcommitしない（HIL-FR-27）。lease失効後の作用をfencing tokenの不一致で拒否する（HIL-NFR-18） | `Epoch`をK5の追記・K2の記録にも適用する | `semantic_rederive` |
| `LEGACY-ASSET-BC2275DCE9BFFCF813C8`／`docs/design/helix/L5-detail/python-worker-runtime.md:133-136`／`4c26544b5cf6e63ed226838ff5e04b3a669f6a9aa13456ffc5e5fb41fc755f8a` | cancel・timeout・再割当てでfence tokenを失効させ、その後の結果はbytesが正しくても拒否する。新しいownerは新しいrunから再開する | なし（K7-I6として再導出） | `semantic_rederive` |
| `LEGACY-ASSET-1B413588CFF3B1360B49`／`docs/adr/ADR-009-node-python-linux-runtime.md:113-120`／`bdd1c9a00243b723342e42531ddeabbf2f7570594943c11226d5b0461769753c` | 切替はrollbackを持つ可逆なtransactionとし、自動のfallbackを禁止し、許可を伴う明示のrollbackだけを許す | なし（K7-I3・I4として保持）。自動の切戻しはPhase 2の判断へ残す | `semantic_rederive` |
| `LEGACY-ASSET-D461943347D372ECF6DA`／`docs/governance/candidates/security-engagement-authority-requirements.md:33,43`／`38a68e48ca26cb277b6f5d88439b33b58aecf48f5b650f7596aec04e438b6b16` | revoke時に新規配車、in-flightのlease、credential、network、artifact accessを止める。revokeはin-flightまで伝播する | 受け手ごとの状態（SECURITY-AC-009-01）をK1の成分にし、受け手の集合をK10から導く | `semantic_rederive` |

受け手の集合を依存グラフの影響から導き、取消しを統一の経路で伝えること（G5-I1）と、型番台帳をK5のlogとして持つ形は、旧HELIXに見つからない**新規案**である。旧には、driftやstaleを起点にした失効と、securityの候補要求のrevokeだけがあった。検索の範囲は`archive/legacy-generation-2026-09-14/root/`の全ファイル（`grep -rIl`、読取りだけ）で、`revocation propagation`、`approval revocation`、`rescind`、`型番`、`model number`はいずれも0件だった。

### 15.8 取消し伝播の保証限界

受け手がappliedになるまでの時間上限は本書で新設しない。K7/G5は既存のrequest/apply/fencing/current permission/recipient伝播を設計し、未知の観測を保持する。既存L2/L3にない数値閾値を要求へ追加する場合だけ6.2へ戻す。

### 15.9 人の判断が要る点

列挙だけであり、本書は新しい承認手続きを作らない。

1. 内部デプロイとcutoverの実際の許可（既存の境界のとおり。K7はそれを生成しない）。
2. 自動の切戻しを使うか（Phase 2へ移る判断。2026-10-08判断記録の判断3）。
3. 段階を組み直さずに部品・接続を単独で内部デプロイしてよいか（2026-10-08判断記録の未決4）。本章は段階を単位とする現行の扱いに従う。

### 15.10 検証範囲

- 試作：小さな段階の世代を2つ作り、L9のIV-K7-01〜13、IV-G5-01〜10、IV-LDG-01〜04、repository-layout L9 IV-RL-01〜54を検証する設計とする。未実行の項目を合格に数えない。

## 16. K3 operation authority tupleと許可記録の照合

K3は既存の許可を読む境界を定める。許可を発行する機能ではない。一つの親要求は置かず、以下のACへ要素ごとにtraceする。引用は冒頭のmain baseの本文（付録Aと16.6でfull SHAを固定）である。

### 16.1 由来と責務

| 要素 | 承認済みL3の由来 | 保持する意味 |
|---|---|---|
| K3-I1・I2：7軸と操作別の照合 | `SECURITY-AC-008-01`（`docs/helix-security/L3-requirements/functional-requirements.md:166`） | actor/target/operation/revision/environment/scope/expiryを照合し、11操作を包括権限にしない |
| K3-I3：既決権限の再利用と非生成 | `SECURITY-AC-022-01`（同:511） | requestは許可でなく、既存の一致するauthorityを再利用する。通常作業に毎回の人間承認を追加しない |
| K3-I4・I5：変更・失効と段階間の同一性 | `SECURITY-AC-022-02`（同:512）、`SECURITY-AC-009-01`（同:180） | request→decision→assignment→effective scopeを照合し、deny/revoke/expiryを該当scopeへ伝える |
| K3-I6：所有の分離 | `SECURITY-AC-022-03`（同:513）、`SECURITY-AC-003-01`（同:96） | SECURITYは配置せず、OSは判断を上書きせず、Workerはscopeを拡張しない。別project/environment/worktreeへfallbackしない |
| K3-I7：追加の操作入力 | `SECURITY-AC-005-01`（同:124）、`SECURITY-AC-006-01`（同:138） | credential purposeとegressのsource/destination等は操作入力であり、7軸と混ぜずに独立に照合する |
| K7接続 | 上記008・022、`AC-OS-014-04`・`014-06`（`docs/helix-os/L3-requirements/functional-requirements.md:24,26`） | 許可は構成の版・対象・作用に束縛し、適格性と許可を分ける |

ACの承認対象revisionは`docs/governance/l3-l10-po-post-confirmation.md`のSECURITY Stage 1・Stage 4、OS Stage 2bの行が指す判断記録から辿る。開発repoのクロスレビュー規則を製品の許可条件にしない。

### 16.2 型と入力の所有

```text
PermissionQuery = { operation, target: identity, revision: SubjectRef（作用対象へ結びつく構成・artifact等の版）, requested_scope,
                    operation_inputs: { identity -> SubjectRef } }
PermissionQueryRef = SubjectRef{kind: permission_query,
  identity: canonical_json({kind: permission_query, operation, target, revision_identity: revision.identity, sorted_operation_input_identities}),
  revision: canonical JSON of {revision.revision, operation input revisions},
  digest: sha256(canonical_json(PermissionQuery))}
AuthorityInputRef(role, ref) = SubjectRef{kind: k3_authority_input,
  identity: canonical_json({role, identity: ref.identity}), revision: ref.revision,
  digest: sha256(canonical_json({role, ref}))}
HeadInputRef(role, head) = SubjectRef{kind: k3_head_observation,
  identity: canonical_json({role, segment: head.segment}),
  revision: head.seqのUTF-8 decimal表記, digest: sha256(canonical_json(head))}
OperationAuthorityTuple = { actor: identity, target: identity,
  operation: read | write | execute | network | install | delete | merge | release | deploy | credential-use | security-change,
  revision: SubjectRef（作用対象の版）, environment: SubjectRef,
  scope: 正規化した明示scope, expiry: 既存許可の有効期限 }
PermissionRecord = { ref: SubjectRef, tuple: OperationAuthorityTuple,
  operation_inputs: { identity -> SubjectRef },
  outcome: allow | deny | constrain, reason: 値非表示の理由,
  source: SubjectRef（既存authority記録）, issuer: identity,
  constraints: SubjectRef[] }
AuthorityDecl = FixedRef。SECURITYが所有するcurrentの宣言。
  { sources: { source identity -> { current: SubjectRef, adapter: VerifierRef, issuer: identity } },
    rules: SubjectRef（既存policyと照合規則）, required_inputs: { operation -> identity[] } }
AuthorityContext = { tuple: OperationAuthorityTuple,
  operation_inputs: { identity -> SubjectRef },
  current_assignment: SubjectRef（OS所有）, target_owner_decl: SubjectRef,
  environment_decl: SubjectRef（INFRASTRUCTURE所有）, operation_decl: SubjectRef,
  authority_decl: SubjectRef（SECURITY所有）, policy: SubjectRef,
  source_current: { source identity -> SubjectRef },
  observed_at: 時刻観測の固定参照, revocation_heads: SegmentHead[],
  pre_execution_constraints: SubjectRef[] }
AuthorityContextResolution = Resolved(AuthorityContext)
  | Unresolved(ResolutionDiagnostic{reason, available_refs, missing_identities})
PermissionCheckResult = { query: PermissionQueryRef,
  context: AuthorityContextResolution, permission: SubjectRef（呼出し側の候補ref）,
  effective_decision: Observed<SubjectRef>（current選択refとpermission候補refの一致を含む）,
  components: Component[], combined: Combined,
  assurance: K6の真正性3項目, authority_effect: "none" }
PermissionCheckDiagnostic = { query: PermissionQueryRef?, reason: missing_key | invalid_query,
  available_refs: SubjectRef[], missing_identities: identity[] }
PermissionCheck = PermissionCheckResult | PermissionCheckDiagnostic
```

`PermissionQuery`は作用希望の値でありauthorityやcurrent状態を証明しない。`resolve_authority_context(query, input_heads)`はownerが宣言したcurrentのOS assignment、対象・scopeのowner宣言、INFRASTRUCTUREの環境宣言、SECURITYの`AuthorityDecl`とpolicy、operation declarationを、固定した各segment prefixから読む。actorはcurrent assignmentの実行主体、targetとrevision_subjectの対応は当該操作の対象owner宣言から読み、queryのtargetとrevisionがその対応に一致するかを照合し、environment/scopeはそれぞれのowner宣言と環境参照から得る。K7の場合はtargetが段階identity、revision_subjectが移動先`to.composition`であり、台帳の段階/構成の対応を実読する（15.4、16.4）。呼出し側がcontext、assignment、owner宣言、環境、current source refを渡すAPIは置かない。これらが欠落・未登録・衝突しているときは、許可recordの値やqueryの申告で補わず、対応成分を`Unknown(missing_input/unregistered/conflict)`とする。`tuple.target`と`tuple.revision.identity`が同じとは限らない。複合対象の段階identityとその構成の版のように異なる場合、対象owner宣言・台帳が両者の対応を明示していることを必須とし、名前から推定しない。`scope`はproject/worktree、適用されるtenant等の明示identityを含むが、tenantの無い環境へ顧客tenantを新設しない。

queryの`operation_inputs`も未信頼の要求値として扱い、ownerがcurrent operation declarationと`AuthorityDecl.required_inputs[operation]`で要求するidentity集合と照合する。欠落、余分なkey、または同じkeyの別refはpositiveにしない。`PermissionRecord.operation_inputs`にも同じidentityごとの値が必須で、tuple一致で補完しない。credential purposeやegress classification/source/destinationはこれらの独立したoperation inputであり、7軸の一部にはしない。

`expiry`の形式と比較は既存許可sourceのadapterが宣言する。新しいTTL・猶予時間・無期限の既定値を置かない。時刻を観測できない、期限を解釈できない場合はunknownで止める。`observed_at`は開始・完了時刻による品質閾値（K6）ではなく、既存expiryを検査する入力である。

`PermissionRecord`は呼出し側のplain objectを受理しない。`permission`は参照だけを受け取り、`AuthorityDecl.sources`に登録された既存sourceのexact bytesを、そのsourceへ読取り専用に接続する固定adapterで読む。adapterは宣言されたissuerと原記録のissuer、ref/revision/digest、原記録の許可範囲を照合し、原記録に無いfield・許可・issuerを補わない。署名を持つsourceではその既存の検証も行い、検証不能ならunknown。登録外source、自己発行object、別sourceの同名記録は許可として数えない。K6のreceipt自体は許可sourceにならず、署名が無いreceiptの`issuer_authenticity = Unknown(unsupported)`を真正性の証明へ昇格しない。既存authorityの正本を読む照合と、receiptの発行者真正性は別の成分である。

### 16.3 不変条件

- **K3-I1 全軸**：7軸の単独欠落・unknown・衝突はその軸を`Unknown(missing_input/conflict)`とし、肯定にしない。`check_permission`は各軸とsource・status・追加操作入力の成分をすべて残しK1で合成する。scopeの文字列類似、名前の類似、上位scopeから一致を推測しない。`PermissionRecord`は7軸・outcome・issuer/source・必要なoperation input・constraintを欠かさず保持する。広い既存許可を使う場合は、既存source adapterが宣言する既存policyの包含規則でrequested tupleを許可する根拠を明示し、包含が未定義・不明なら非肯定とする。
- **K3-I2 完全な束縛と版の意味**：現在のcontextと許可記録のtarget/revision/environment/actor/operation/scope/expiryおよび`operation_inputs`をidentityごとに照合する。fresh checkで同identity・別revisionが観測された場合は、その新しいkeyのrevision比較を否定の`Value`として記録し、K1 `Stale`にしない。K1 `Stale`は以前の保存結果があり、`prior`・`recorded_key`・`current_key`で旧結果の再利用を示す場合だけで、これはK2 lookupの結果である。同revision・別digestは`Unknown(conflict)`、他の確定不一致は否定の`Value`。readから他10操作の許可を生成しない。11操作は一つずつ判定する。
- **K3-I3 既存記録だけ**：呼出し側が選んだ過去のrecordを単独で照合して有効としない。adapterはsourceのcurrent prefix全体から、queryに適用されるcurrent effective decisionをowner/sourceの既存選択規則で解決する。`effective_decision`成分は、その一意なcurrent record refと`permission`候補refの一致、および選択規則の結果を記録する。呼出し側候補がcurrent decisionでない場合は非肯定。広いrecordの適用可能性はsource adapterの既存包含規則だけで判定する。解決結果が一意でなく複数候補が競合する、または選択/包含規則・入力が未登録なら`Unknown(conflict/unregistered/missing_input)`。該当する現在判断が存在しなければ`Unknown(missing_input)`。古いallowより後の現在effectiveなdeny/constrainがある場合、古いallowは選択されず、denyは否定、constrainは以下の条件でのみ評価する。原記録が`allow`で全照合が肯定の場合、または`constrain`の既存owner宣言の制約を実行前に強制可能な狭いcontextと全前提証拠が肯定の場合だけ`combined = Positive`になりうる。実行時の制約履行・効果観測はWorker/INFRASTRUCTUREの別のK6結果であり、使用前許可を得る前提にしない。実行後receiptが未着ならその結果だけが`Unobserved(pending_receipt)`であり、permission record不在・current decision不在は`Unknown(missing_input)`とする。request、ACK、CI green、review、K6 receipt、K3照合成功から許可記録を発行しない。有効な既決許可は再利用し、新しい人間承認を要求しない。
- **K3-I4 使用時の再照合**：保存する結果のK2鍵は`operation = permission_check`、`operation_version = K3実装のUTF-8 version string`、`subject = permission`、`inputs = [PermissionQueryRef, K3 code/config/current assignment/target declaration/environment declaration/operation declaration/AuthorityDecl/policy/source current ref/adapter/required operation input/pre_execution_constraints/time observationの各role-bound AuthorityInputRef, 取消しprefixの各HeadInputRef, 各AuthorityInputRef内の原SubjectRefの集合]`、`scope = 再構成したtuple.scope`とし、操作の所有者が宣言する全集合を使う。raw `PermissionQuery`、時刻値、`SegmentHead`はK2 `inputs`へ直接入れず、それぞれcanonical `PermissionQueryRef`、role-boundな固定の時刻観測参照、`HeadInputRef`で表す。AuthorityInputRefのcanonical bytesと内包する原SubjectRefの実bytesをそれぞれ実読してK6 readへ含め、wrapperの一致を原source実読の代わりにしない。HeadInputRefは実読したheadのcanonical bytesを指し、内包するentry_digestでK5の固定prefixを照合する。各authority refは役割名をidentityへ含めることで、同じ原refが複数の役割を担う場合も役割結合を保つ。入力refsはidentityで整列し、同一identity・同一refの完全重複だけをdedupする。同一identityで異なるrefが一つでもあればkey生成前に`Rejected(missing_key)`とし、その場合K1 componentの`Unknown`も記録・合成しない。queryとその全operation input値は`PermissionQueryRef`のdigestへ含める。使用時には現在の宣言、sourceのcurrent参照、時刻、取消しの全必要segmentを読み直して鍵を作る。receiptや旧結果からcurrent入力を採らない。変更した鍵へ旧Positiveを流用しない（K2）。読取不能・必要segment欠落はunknownであり「取消しなし」としない。
- **K3-I5 失効**：期限切れ・revoke・確定scope driftは否定、expiryや取消し状態の不明は非`Value`とする。G5の伝播完了は新しい許可でなく、K7-I6のfencingも引き続き必要。再開には旧記録の書換えでなく、新しい有効なcurrent許可記録の参照と全照合を要する。停止は該当operation/risk scopeに限り、無関係な一般文書の意味unknownで全操作を止めない。
- **K3-I6 段階の分離**：request、SECURITY判断、OS assignment、Worker適用の各参照を対応付け、tupleの連続性を照合する。SECURITYは許可判断と制約、OSはassignment/進行、Workerは制約の実適用、INFRASTRUCTUREは物理観測を持つ。許可の肯定は適用完了・成果の成功ではない。
- **K3-I7 操作入力**：`AuthorityDecl.required_inputs`が既存policyから宣言する当該操作の入力集合を完全一致で照合する。credentialのpurposeやegressのdata classification・source/destination等は別成分とし、tuple一致で代用しない。入力集合の完全性を確認できなければ`Unknown(missing_input/unregistered)`。旧impact/risk要約、旧sink enum、Webの1.x sink enforcementを全操作の新必須条件にしない。

### 16.4 APIとK7への接続

- `resolve_authority_context(query: PermissionQuery, input_heads) -> AuthorityContextResolution | PermissionCheckDiagnostic`：所有者のcurrent宣言と固定prefixからcontextを内部再構成する。resolverはowner登録済み読取り境界からK5 `current_head`を内部取得し、その末尾の固定prefixで再構成する。caller `input_heads`は期待値であって末尾を選ばず、内部取得したcurrentと不一致なら旧prefixを使わず非肯定とする。current宣言が読めない等、K2 keyが作れる不足は`Unresolved`にし、対応成分をK1 `Unknown(missing_input/unreadable/conflict)`として記録する。完全なK2 keyを作れない場合は`PermissionCheckDiagnostic(reason: missing_key)`を返し、K1 `Unknown`やK2 resultとして記録しない。caller-provided contextは受け付けない。
- `check_permission(query: PermissionQuery, permission: SubjectRef, input_heads) -> PermissionCheck`：source adapterがcurrent prefixから有効判断を一意に解決し、`permission`参照がそのcurrent recordを指すこと、K3-I1〜I7、operation input binding、expiry、取消しを検査する読取り専用境界。contextが未解決でもcomplete K2 keyを構成できる不足はdiagnostic componentsとして保持し、record不在・current判断不在は`Unknown(missing_input)`、保存済みK6結果のreceipt未着とは区別する。読取失敗は`Unknown(unreadable)`をsource成分とする。各非肯定成分・`assurance`を残す。K2 keyを作れない入力ref collision等は`PermissionCheckDiagnostic(reason: missing_key)`で返し、結果を保存しない。これはK1 `Observed`ではなく、K1でcombineせずK2へrecordしないAPI診断である。`apply_move`の`Rejected(authorization_unverified, check)`はこの`PermissionCheck`（通常checkかAPI診断のいずれか）を保持する。作用callback、許可発行、pointer追記のportを受け取らない。
- `apply_move(request, decls, verifier_set, input_heads)`：15.6と同じ引数契約とし、caller-provided contextは受けない。K7-I2・I2bの再読後、queryのtargetを対象段階identity、revisionを`to.composition`、operationを`deploy`とし、current台帳の段階/構成の対応とK7-I3適格性を照合する。actor/environment/scopeはcurrent owner宣言から得る。`kind`は固定の`MoveActionRef = SubjectRef{kind: move_action, identity: canonical_json({target, operation: deploy}), revision: kind, digest: sha256(canonical_json({target, kind}))}`としてK7のoperation declarationがrequired inputに宣言し、許可側の作用bindingと照合する。`kind/from/to`は引き続きK7のrequest/適格性で検査するが、`from`世代番号・`to`世代番号・`pointer_head`をPO許可の新しい必須軸にしない。`pointer_head`はCASだけに使う。同じ構成版とkindを既存の有効な許可範囲が含むときは再利用でき、広い許可の包含は16.3の既存adapter規則で明示的に証明する。段階名とdeployだけから未許可の構成版や別kindへ拡張しない。内部デプロイの切替は対象段階と作用を明示したPOの既存許可を読む（内部デプロイ判断記録:38–44）。これは旧node-runtime-cutoverのaction-binding approval/staged digestとADR-009の許可付き明示rollbackの保持（15.7）であり、通常の全操作への毎回の人間承認を追加しない。
- current effective decisionを解決できずK3が非肯定なら、追記前は`Rejected(authorization_unverified, check)`で何も追記しない。肯定の場合だけ`append_if_head`へ進む。pointerへの条件付き追記は許可sourceをlockしない。追記直後、pointer_writerはcurrentの許可を再照合し、`MoveAuthorizationObserved{move: entry_digest, phase: immediate, check: FixedRef, observed_at}`をPointerLogへ追記する。直後checkが肯定でobserved_atも記録できるなら`Appended(PointerMoved)`。直後checkが非肯定、欠落、またはobserved_at=nullなら、追記済みpointerの事実を保持して`AppliedUncertain{event, check, unfinished: MoveUnfinished}`とし、`RollbackRequired`と未完の診断を残す。欠けた観測ではK7/G5の内部デプロイ待ちは解消しない。直後観測はpre-authorizationではなく使用後のcurrent性の観測である。自動でpointerを戻さず、完全な跨writer原子性や取消し前の作用の取り消しを保証しない。
- 追記前に必要な制約は、その既存owner契約で実行前に設定・強制できる証拠を評価する。実行中・実行後の適用結果は別の結果観測であり、許可照合を成功させる材料として先取りしない。`MoveRequested`だけでは現行もG5-I6の待ちも変わらない。K3の肯定でも、stale_head/stale_eligibilityなら追記しない。許可照合を省略するfallbackは置かない。

### 16.5 旧HELIXとの対応

| 旧source | 保持する点 | 変更する点・理由 | 区分候補 |
|---|---|---|---|
| `LEGACY-ASSET-17E4FD7C3DB0B3C82210`、`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/authority-vocabulary-requirements.md:29–41,55–58` | request/approval/decisionを分け、approvalは対象・scope・revision・actor・provenance・必要なexpiryへ束縛する。actor名だけでhuman provenanceを作らない | 旧DB/CLI/包括PO attributionを移さず、既存sourceへの読取りadapterとして再導出 | `semantic_rederive` |
| `LEGACY-ASSET-B62E49D2E156232B8C63`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/security-capability-broker-authority.md:32–44,116–151` | typedな独立軸、不明のfail-close、action binding、実行前のcurrent照合、値非表示の理由 | 旧capability enumを現SECURITY-008の11操作・7軸へ置換。data/sink/impactをtupleへ追加せず、現005/006が要する操作入力だけを保持。旧broker/runtime/AND gateを移植しない | `semantic_rederive` |
| `LEGACY-ASSET-0327D0DF98618D3066FD`、`archive/legacy-generation-2026-09-14/root/docs/design/harness/L6-function-design/source-boundary-contracts.md:28–40,60–70` | analyzerが作用portを持たない。許可をexact scopeと失効へ束縛し、dispatch前driftは作用0、後driftはuncertainとする | 旧署名必須のreceiptをそのまま採らず、既存sourceの検証契約を読む。K6の未証明真正性は未証明のまま残す。作用portはK7/機構側に分ける | `semantic_rederive` |

これは旧実装のcopyでなく、承認済みL3の意味からの再導出である。adapterの具体実装は本書の範囲外とし、跨sourceの完全な原子性は与えない。L3に無い新しい許可軸や人間gateが必要ならL2へ戻す。

### 16.6 引用の固定

| path | 本文全体SHA-256 |
|---|---|
| `docs/helix-security/L3-requirements/functional-requirements.md` | `f6872a3ee941d63c80a9717bca7e81de832c043ad05cc9ac0c2db77eb264ee9e` |
| `docs/helix-os/L3-requirements/functional-requirements.md` | `666200db50ea9a2e7f0d67d57496a71368e497f2fdb6e3485d4838339000b393` |
| `docs/governance/decisions/stage-release-internal-deployment-po-decisions-2026-10-07.md` | `b7bd5a34fb0c722be49f90a58ba917de65a1dc8d28db36ae9eb86336cbbea0cb` |
| `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/authority-vocabulary-requirements.md` | `cb97e7594b38cfada7d4fedb948937bab9e9d8f3e7c7123eca82a7ce6e8f8eb4` |
| `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/security-capability-broker-authority.md` | `161722d80e7b0199310b1401992c3737bef2014b19b2776c0df4b15f833fe0a7` |
| `archive/legacy-generation-2026-09-14/root/docs/design/harness/L6-function-design/source-boundary-contracts.md` | `81ec7bb938d659e17ce59ddd7071f527511c585e71b89123be1c8bd505facd8a` |

## 17. K9 独立reviewの独立性記録

### 17.1 由来と境界

| 由来 | locator（対象本文のSHA-256） | 保持・再導出する意味 |
|---|---|---|
| Concept | `docs/concept/helix-concept.md:236` (`bbc787c5dc17de9eded156285ad82ef768788cfa31822dfffa477db073a5e715`) | 作成Worker自身・そのSubagentのreviewを独立reviewに数えない。identity・context・authority・review routeを独立に照合し、provider同異では決めない。 |
| OS L3 | `docs/helix-os/L3-requirements/functional-requirements.md:77` (`666200db50ea9a2e7f0d67d57496a71368e497f2fdb6e3485d4838339000b393`) `AC-OS-029-03` | reviewerは元Worker・支援者・test authorと別のidentity/context/authorityを持ち、receiptはcurrent exact HEAD/base/task scope/HARNESS oracle/current resultに束縛される。独立review passはVerified/Acceptedやcomposite完了を作らない。 |
| INTELLIGENCE L3 | `docs/helix-intelligence/L3-requirements/functional-requirements.md:564` (`35e936a6d83d7a83310cc2a1900e8f199c54923472df9e9b0d7a9bdeec059457`) `AC-INTELLIGENCE-L3-072-08` | candidate生成とreviewを分離し、receipt未着は未完義務として保つ。review実施時はidentity/context/authority/routeを別々に照合し、どれか一つの一致で独立性を不成立にする。同一scope/revision/case/oracleに適用可能な既存証拠は再利用でき、毎回新しいWorker実験を要求しない。 |
| 旧HELIX worker-independent-review L4 | `LEGACY-ASSET-D107FD145A2588FAAD09`／`archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/worker-independent-review.md:18-33` (`9fff293ed71c7a0be0e4dfcd7a5cca70eaacfdbf2cd553a605fd15510a3c99b3`) | FR-05 sealed outputを入力とし、実行成功後のprocess-local originからactorを導く。receiptによるactor自己申告を受け付けない。同provider/model familyでもidentity/session/contextの三軸が独立なら受理。実行起点のactor導出・自己申告拒否・三軸分離を再導出し、旧sealed capability/brokerはコピーしない。 |
| 旧HELIX worker-independent-review L9 | `LEGACY-ASSET-50A93B0E753DC3840E03`／`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L9-worker-independent-review-system-test-design.md:18-27` (`fd1bf27704c12072d56491ae66d21f9858f7275ec8c3f1a5e50714fd235eb672`) | 三軸collision、同provider/modelでも三軸独立なら正常、actor自己申告とstale originのnegativeを再導出する。copy output/finding偽装の真正性判定はK6の実行起点/read-set/receipt境界へ委譲し、K9が検出を保証するとはしない。旧broker/capability、sealed output、Ubuntu/AppArmor/bubblewrap経路は移さない。 |
| 旧producer-provenance-separation request | `LEGACY-ASSET-FD3F979AF945CE3EC306`／`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/producer-provenance-separation-requests.md:12-33` (`dfda22022f1f9ced3f543ccadb91ff7de9335d7a6ea7aaff9efdd1702ecda2a1`) | producer・commit executor・PR publisher・reviewerの役割を分け、actor/metadataからproducerを推測しない点を参考にする。文書は`draft_candidate`で要求authorityではない。 |
| 旧PPS要件candidate | `LEGACY-ASSET-A04F169C5D514C5443D0`／`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/producer-provenance-separation-requirements.md:13-73` (`9f1e268986845f5f209517de24f57f2828e130f971a1429be96d0f88a5e9d59a`) | producer/executor/publisher/reviewerのrole分離、assignment/scope/成果digest/HEADの因果束縛、raw metadataからの推測拒否を参考にする。PPS-R-03:28-35のproducer runtime/provider/model family/session基準は、Conceptとcurrent L3に合わないため製品K9の判定へ採らない。 |
| 旧PPS acceptance candidate | `LEGACY-ASSET-7AFB0C65E70ED4C0856E`／`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/producer-provenance-separation-acceptance.md:12-23` (`5b89153daa3ea4ea3d51c496b9c255ee881fb5ec9418a0540ac33bd68aef2411`) | role入替、assignment/scope/digest/HEAD変異、metadata spoofを独立反例にする形式を参考にする。PPS-AC-005のproducer runtime系統だけによる拒否はK9へ移さない。 |

開発repository内の作成/review cross-runtime・別model-family規則は、本repositoryの開発運用であってHELIX製品要件ではない（`docs/helix-harness/L4-basic-design/common-kernel.md:263,310`、解禁判断記録の判断3）。K9の入力・判定に含めない。

### 17.2 型と入力の完全性

K9は独立性という関係の観測だけを行い、reviewerの採用権限、要求の採択、検証全体の合格、Verified/Acceptedを生成しない。K1の`Observed<T>`、K2の`ResultKey`、K6のreceipt/assuranceを使う。

```text
ParticipantSlot = {
  slot: identity,                         # role位置の安定identity
  role: producer | original_worker | helper | test_author | consultant | subagent | reviewer,
  actor: SubjectRef,
  origin: SubjectRef,                      # assignment / actual execution source edge
  context: SubjectRef | null,
  authority: SubjectRef | null,
  route: SubjectRef | null
}
RoleSelection = {
  role: role,
  state: selected | not_selected | unknown,
  source: SubjectRef                       # 選択ownerのcurrent記録
}
ContentProducerGraph = {
  assignment: SubjectRef,
  candidate: SubjectRef,
  target: ReviewTarget,
  selections: RoleSelection[],
  slots: ParticipantSlot[],
  source_closure: SubjectRef,                # ownerが宣言したcurrent source-class set
  closure_evidence: SubjectRef[]             # 全source classの走査・対応付け記録
}
ParticipantBindingSet = {
  creator_slots: ParticipantSlot[],
  reviewer_slot: ParticipantSlot,
  role_selection_digest: Digest,
  comparison_sources: [{slot, role, axis, side, source_ref: SubjectRef | null}]
}
ReviewTarget = {
  artifact: SubjectRef,                     # current exact candidate HEAD
  base: SubjectRef,
  task_scope: SubjectRef,
  oracle: SubjectRef,
  current_result: SubjectRef,
  case: SubjectRef                          # 適用するcaseのidentityと版
}
ReviewAxisCheck = {
  creator_slot: identity,
  creator_role: role,
  axis: identity | context | authority | route,
  creator_ref: SubjectRef | null,
  reviewer_ref: SubjectRef | null,
  comparison_contract: SubjectRef | null,
  creator_axis_identity: identity | null,
  reviewer_axis_identity: identity | null,
  relation: Observed<same | distinct> # Unknown(reason)も保持
}
ReviewIndependence = {
  target: ReviewTarget,
  binding_set: ParticipantBindingSet,
  checks: ReviewAxisCheck[],
  outcome: Independent | NotIndependent(failed_axes[], reason_codes[])
}
K9IndependenceComponent = AxisRelationFact(slot, axis, same | distinct)
                        | RosterCompletenessFact(complete) | CreatorSetNonemptyFact(nonempty)
ReviewIndependenceCheck = { result: Observed<ReviewIndependence>,
                            components: Observed<K9IndependenceComponent>[],
                            combined: Combined<K9IndependenceComponent>,
                            assurance: K6の真正性3項目, authority_effect: "none" }
```

`ParticipantSlot`はcallerが任意に作る入力ではない。K2 `ResultRecord.producer`はそのrecordの記録producerであり、content producerの根拠へ代用しない。resolverは、(1) OS ownerが宣言したcurrent assignmentから元Workerとtask/scopeを得る、(2)各ownerのcurrent selection recordで選択済みsupport/consult等を得る、(3)各実行・成果ownerが記録したactual producer/contributor graphから実際に参加した役割とorigin edgeを得る、(4)test authorなど別ownerのrole sourceを追加で照合する、の順に全creator-sideを作る。commit executor/publisher metadata、provider/model、reviewer自身の申告はparticipant sourceにしない。selectionが`not_selected`ならそのroleのparticipantを要求しない。`unknown`はparticipantなしへ読み替えない。

実装上の完全性は、current OS assignment、選択された各source ownerのselection記録、actual content-producer graph、owner宣言のcurrent source closure、各source classの走査/対応付け証拠を照合して確かめる。完全性不足の単独条件は、定義済みschemaのsource closure未登録をUnknown(unregistered)、必須source ref欠落とselection unknownをそれぞれUnknown(missing_input)、走査契約はあるがgraph全量性を証明できない場合をUnknown(unsupported)、必要coverage evidence未着をUnknown(missing_input)とする。coverage未着は完全性判定の必須入力不足であり、このoperationではUnobserved(pending_receipt)へ写さない。caller参照とcurrent正本の確定不一致およびsource間の確定不一致はUnknown(conflict)をこれら5条件より先に扱う。conflictが無く複数の不足条件が同時にあれば上の列挙順の最初をinventoryの主reasonとし、全条件とsource診断をevidenceへ保持する。独立positiveを返さない。登録済みclosureの全量照合が観測できても、期待role集合とactual graphに参加者欠落/追加またはsource間不一致があれば`Unknown(conflict)`とし、source側の理由・全差分を保持する。NotIndependentは比較identityの確定collisionに限る。これは登録source集合のcoverage観測であり、発行者や実際のactorの真正性を証明しない。K6の`issuer_authenticity=Unknown(unsupported)`は別assuranceにそのまま残る。

contextとrouteのrefは必ずそれぞれのowner contractから解決する。contextは実行session/contextを所有するsourceがcurrent refと対応participantを示し、review対象自体は`ReviewTarget`で別に完全一致させる。routeはreview routeのownerがcurrent route identity/revision/digestを宣言する。Concept:236とAC-INTELLIGENCE-L3-072-08はroute軸自体を根拠付けるが、具体的owner/schemaは定義していない。route/contextの契約schema未定義はUnknown(unsupported)、schema定義済みでcurrent宣言が未登録ならUnknown(unregistered)である。routeの意味をprovider/runtime/model差へ置き換えない。authority refは既存SECURITY ownerの適用中recordから解決し、caller claimだけでは受け入れない。authority軸は独立性に用いる実行authority identityの比較であり、K3の許可可否ではない。SECURITYのcurrent owner contractがrecordとそのauthority identityの対応を示す場合だけ比較し、PermissionRecord/source ref・revision・tupleのoperation/targetが違うことだけではdistinctとしない。対応schemaが未定義ならUnknown(unsupported)を保つ。これはConceptと現L3のauthority軸をowner sourceへ結ぶ技術的再導出であり、旧三軸にauthorityの定義があったとは扱わない。

### 17.3 比較とK2鍵

比較の単位はrole slotであり、K2 `inputs`の一意性制約をidentity衝突判定へ流用しない。creator-sideとreviewerに同じactor refがあっても、各role slotを`ParticipantBindingSet`に残し、比較を実施して`relation = same`の理由付きnegativeを作る。producerとtest_author等のcreator側roleでactor refが共有される場合も、元refはbinding setに保持し、K2 inputsでは下記の役割付きaliasにする。roleごとの起点・役割・比較相手を全件保持する。共有refの重複はK2 duplicate identityとして拒否しない。

役割付きsource参照は`RoleBoundSourceRef = SubjectRef{kind:k9_role_bound_source, identity:canonical_json({slot,role,axis,side,source_kind,source_identity}), revision:source_ref.revision, digest:source_ref.digest}`とする。これは登録済みresolverが元source実bytesを読める固定aliasであり、wrapper JSON自体のdigestではない。元SubjectRef全体とslot/axis/sideの対応はParticipantBindingSetのcanonical bytesへ固定する。K6はbinding bytesと各aliasから得た原source bytesを別々に実読して各digestを照合し、bindingを読んだだけでsource実読としない。同一source identityの異revisionが左右にあってもalias identityが違うため双方を読める。元のraw SubjectRefはK2 inputsへ重ねて投入しない。

K2基底鍵は`operation=review_independence`、`operation_version=K9規則版`、`subject=ReviewTarget.artifact`、`inputs=current assignment、producer graph/source closure/coverage、owner比較契約、ReviewTarget base/scope/oracle/current_result/case、ParticipantBindingSet固定ref、適用Concept/L3、RoleBoundSourceRef集合、K9 resolver code/config`、`scope=task_scope`とする。binding bytesにslot/role/選択状態とraw source refs全体をcanonical順で含める。左右や別slot/axisのref差はaliasとして共存し、同じalias identity内の異refだけをkey前Rejected(missing_key, identity_ref_conflict)とする。完全一致aliasの重複だけdedupし、raw sourceの同identity異revisionを比較前拒否へ逃がさない。

ReviewTargetはcreator graphとreviewer receiptで完全一致を要求する。各軸の比較identityはowner current contractで解決し、ref bytes/revision差だけでdistinctとしない。全creator slot×四軸のchecksを構築し、比較不能もrelation=Unknown(reason)として残す。比較identityが不明ならそのfieldはnullとし、same/distinctを捏造しない。チェックの打切りをせず、component順はnonempty、roster completeness、その後slot順・identity/context/authority/route順とする。各componentは`operation=review_independence_component`、K9規則版、`subject=ComponentBindingRef`（当該slot/axisまたは集合検査位置とsource対応を固定したcanonical SubjectRef）、inputsは当該検査のcurrent source/契約とReviewTarget参照、scopeはtask scopeの完全なK2鍵を持つ。component bindingのidentityは検査位置、revisionはK9規則版と当該current入力revision集合のcanonical表現、digestはbinding固定bytesのSHA-256とする。欠落したaxis source/contractはcheckとbindingへnull/理由として保持し、存在しないSubjectRefを捏造せず、既存owner宣言・観測済みsource・bindingを入力としてUnknown componentの鍵を作る。各Observed componentを別鍵で構成し、全体結果の鍵と混同しない。

以下の四軸component合成は、current source inventoryがValueで完全性を確認できた後だけ行う。inventoryが非Valueなら四軸比較・component合成へ進まず、同じactorを示す部分sourceが読めても、その部分情報を比較結果やNotIndependentへ変換しない。後段の早期return写像に従ってreview鍵付きUnknownを返し、inventoryの非Valueと診断はevidenceに保持する。

inventory非Valueの早期returnにも独立性operation自身の鍵を作る。この経路の鍵はoperation=review_independence、operation_version=K9規則版、subject=ReviewTarget.artifact、scope=task_scope、inputs=ReviewTarget残り5参照・current creator_inventory_ref・EarlyInventoryBindingRef・読めたcurrent owner/resolver契約・K9 resolver code/configである。EarlyInventoryBindingRefはtargetとinventory参照、inventory状態/主reason/全診断と未解決sourceのnullを固定したcanonical bytesのSubjectRefで、identityは当該review対象と早期return位置、revisionはK9版と既知入力revision集合、digestはそのbytesのSHA-256とする。存在しないsource refを捏造せず、inventory鍵をreview鍵へ代用しない。既知の必要target/owner/binding参照すら解決できずこの鍵を作れなければRejected(missing_key)を返す。inventoryがUnknownなら同じreason、Unobserved/Staleならmissing_input、NotApplicableならunsupportedをreview側reasonとする。元のinventory非Valueと診断はevidenceへ全て保持する。componentsはこのreasonのUnknown<RosterCompletenessFact>一件だけであり、17.3のreview_independence_component鍵（集合検査位置、EarlyInventoryBindingRefとinventory refを入力）を持つ。combinedはその一件をK1 combineしたUndetermined、non_valuesは当該component一件である。resultは独自review鍵のUnknown<ReviewIndependence>であり、四軸checksやReviewIndependence Valueを作らない。K2/K5へ保存する場合はcomponent・review・inventoryをそれぞれ自身の鍵で別recordにし、inventory recordのresultを上書きしない。

HARNESS所有の版付き写像`k9_independence_polarity`（版=K9規則版）はAxisRelationFactのsameをNegative、distinctと確認済みcomplete/nonemptyをPositiveへ写し、UnknownはK1 non-valueとして保持する。K1 combineは全componentを取り、sameが一件でもあればNegativeとし、全failed_axesと理由付きValue(NotIndependent)を返す。同時に他軸のUnknownも全checks/components/combined.non_valuesへ残す。inventory完全性の非Valueはこの合成より前で返す。sameが無くnon-valueがあればUndeterminedとUnknown（理由と全成分を保持）。nonempty・completeと全軸distinctが全てValueの場合だけIndependent/Positiveとする。creator 0件はnonempty=Unknown(missing_input)、source集合不一致はcompleteness=Unknown(conflict)であり、独立性collisionへ丸めない。外側components/combinedが判定の正本で、Independentは全成分肯定という条件を満たす場合だけ型の構築を許す。

review対象6要素はcurrent owner sourceとのfresh照合で完全一致を要求する。別identity、旧revision、同revisionのdigest差のいずれも、双方の値が読めて不一致が確定すればUnknown(conflict)とし、比較を開始しない。保存結果のK2 lookupは別の処理であり、current keyに対して同identityの旧revision＋digestのValueしか無ければStale、同revision異digestならUnknown(conflict)、subject/input identity集合が変わればUnobserved(not_run)とする。fresh不一致を保存済み旧ValueのStaleへ読み替えない。

### 17.4 不変条件とAPI案

- **K9-I1 source-boundary**：参加者identityはOS assignment・source owner selection・actual content-producer graphから解決する。呼出し側のactor/role申告、commit metadata、publisher、provider/modelをproducer sourceとして受け入れない。K6の実行起点receiptを使う範囲でもissuer authenticity unknownを引き継ぐ。
- **K9-I2 roster completeness**：assignmentからのexpected roster、selected source、actual content-producer graph、source closureがcurrent scope/revisionでそろうまで独立positiveを返さない。未登録source/未証明completeは`Unknown`。completeな登録source間でrole集合が食い違うなら`Unknown(conflict)`で全差分を保持する。
- **K9-I3 role bindingとdedup**：各slot/role/選択状態とref対応を`ParticipantBindingSet` digestへ入れる。K2 inputsは役割付きaliasで表し、元refと役割対応をbinding bytesへ固定する。比較はslot間で行い、same identityをK2 duplicate rejectionへ逃がさず、理由付き`NotIndependent`にする。
- **K9-I4 owner contract**：context・route・authority各refは当該ownerのcurrent contract/recordから解決する。契約schema未定義は`Unknown(unsupported)`、schema定義済みでcurrent owner宣言/record未登録は`Unknown(unregistered)`とし、provider/model/runtime名で補わない。
- **K9-I5 四軸と対象束縛**：identity/context/authority/routeを独立比較する。別contextは対象が違ってよい意味ではない。artifact HEAD/base/task scope/oracle/current result/caseは完全一致させる。どれか一つの軸でowner contractが解決した比較identityが同じなら明示negative。ref差だけを独立性としない。
- **K9-I6 empty creator拒否**：creator-sideのslot数0は`Unknown(missing_input)`。未選択を示す記録が無いoptional roleも空として扱わない。
- **K9-I7 段階分離・再利用**：candidateはscope/sourceで作成でき、review未実施は`Unobserved(pending_receipt)`として後続義務へ残す。同じK2鍵のvalidなreview/shadow evidenceは再利用可能。毎回新Worker実験を要求しない。party/axis/route/targetに関わる鍵が変わればK2-I2どおり旧結果を使わない。
- **K9-I8 authorityと真正性**：K9結果の`authority_effect`はnone。独立性positiveはfinding 0件やHARNESS段階、owner receipt、利用者acceptanceを作らない。K6 `issuer_authenticity = Unknown(unsupported)`は常に別assuranceとして残し、K9で真正性を主張しない。

```text
resolve_creator_inventory(
  current_assignment: SubjectRef,
  selected_source_records: SubjectRef[],
  actual_content_producer_graph: SubjectRef,
  owner_source_closure: SubjectRef[],
  input_heads: InputHeads
) -> Observed<{ slots: ParticipantSlot[], selections: RoleSelection[], complete: Bool }>

check_review_independence(
  target: ReviewTarget,
  creator_inventory: SubjectRef,             # resolver結果の固定参照。plain caller objectを受けない
  review_execution_record: SubjectRef,       # current review実行のowner source
  reviewer_origin_contract: SubjectRef,      # 実行originからreviewer slotを導く契約
  context_owner_contract: SubjectRef,
  authority_owner_record: SubjectRef,
  route_owner_contract: SubjectRef,
  input_heads: InputHeads
) -> ReviewIndependenceCheck | Rejected(missing_key, diagnostic)
```

current参照はresolverがOSと各ownerの登録済み読取り境界でK5 current_headを内部取得し、その固定prefixから実読して得る。caller input_headsは照会の期待値であって正本の末尾を選ばず、内部取得値と不一致なら非肯定として旧prefixを使わない。API引数のrefは照会対象であり正本指定を上書きできない。契約schema自体が未定義なら`Unknown(unsupported)`、定義済み契約のcurrent宣言/recordが未登録なら`Unknown(unregistered)`、caller参照と正本の不一致は`Unknown(conflict)`。

両APIはparticipant slot配列をcallerから受け取らず、OS assignment・content-producer graph・review execution recordとowner contract refsをcurrent sourceとしてK2 lookup/K6 receipt admissionで解決する。契約に登録されたsource closureと走査証拠で全量性を確認できなければ、`complete`をcallerのboolean claimから作らず非`Value`を返す。creator_inventoryはresolverのcurrent入力の全集合・K2鍵・K6 admissionへ照合し、callerが自作したinventoryを使わない。source inventoryが非Valueなら、17.3の早期return写像に従ってreview鍵付きUnknownを返し、inventoryの非Valueと診断はevidenceに保持し、四軸比較へ進まない。部分sourceにsameらしいactorがあってもNotIndependentを作らず、未確定rosterをcompleteへ上げない。完全性を確かめたinventory上で軸がUnknownになっても既知sameを消さず、以下の合成を行う。inventoryが読めるslotについては四軸を全て観測し、未知の軸も保持して17.3のcomponent列からresult/combinedを導く。Independentは全成分肯定に限り、既知sameとUnknown混在ならNotIndependentとnon_valuesを共に返す。K6 result receiptの`reproduction`と`issuer_authenticity`はAPI結果に併記するassuranceに別々に付ける。currentのowner contractがroute/context sourceを提供できない場合は未決を捏造で埋めない。

inventoryのK2鍵は`operation=resolve_creator_inventory`、`operation_version=K9規則版`、`subject=current assignment`、`scope=assignmentが宣言するtask scope`とする。inputsはcandidateのReviewTarget全6要素、selection source、actual content-producer graph、登録source closure/coverage evidence、適用Concept/L3、source owner/current resolver契約、resolver code/configの完全な参照集合である。subjectと重複するassignmentは再投入しない。役割別参照は17.3と同じslot/role付きwrapper方式で固定し、原bytesの実読をK6へ含める。inventoryのoperationはreview_independenceとは異なるため結果を代用できず、check_review_independenceはこのcurrent鍵とK6 admissionへinventory refを再照合する。結果を呼出し側のplain complete値から作らない。

### 17.5 旧HELIXとの差

保持するのは、実行起点のactor識別をreceiptの自己申告に頼らないこと、同一provider/modelを理由に独立reviewを拒否しないこと、複数軸を別々に比べること、HEADとreview対象を結ぶこと。変更するのは、旧worker reviewの三軸からConcept/承認済みL3のidentity/context/authority/route四軸へ広げ、OS current assignment・各source owner selection・actual content-producer graphを照合して参加者集合の完全性を扱うこと。PPSはproducer/executor/publisherの役割分離とmetadata推測拒否のみ参考にし、PPS-R-03のproducer runtime/provider/model family/session規則を製品K9へ移さない。開発repository専用のcross-runtime requirementは製品K9から明示的に除外する。

LABOのblind評価はK9共通条件へ採らない。現LABO L3 Stage 5「HELIXLABO-L2-064」1785–1822行（本文SHA-256 `362979fc4489c137d7641278a8ea8e55461f3592d56d802bb285ec34abc4a9b8`）は、選択比較scopeの候補名遮蔽・judge可視範囲・比較前の条件固定を定め、通常履歴のblind一律必須化やauthor/judge context独立性の追加を避けている。K9の四軸独立性の代替にも全reviewへの追加条件にもせず、LABO対象scopeの設計へ残す。

旧L9 ST-WRR-002/006/007のcopy output・finding payload spoof拒否は旧sealed execution origin/finding joinのconsumerだった（旧L4:26–33、同asset/hash）。K9は四軸の関係観測へ再導出し、この真正性保証を実装済みとして継承しない。Concept:236の「作成側の結論を引き継がず証拠を確かめる」はreview実施側の証拠照合とK6 receipt/read-setの責務として保持し、K9のIndependentだけではその実施を証明しない。K6のissuer_authenticityが未証明ならcopy/finding偽装の実履歴も未知であり、K9で補完しない。

旧判断史とconsumerもread-onlyで照合した。次のsourceはK9の新しい親要求ではなく、保持・除外の範囲を確かめる資料である。pathはarchive rootからの相対path、区分は意味再導出の候補とする。

| 旧asset ID / path:行 / SHA-256 | 判断史・consumerとK9での扱い |
|---|---|
| `LEGACY-ASSET-0F15A8439F925AA1CB08` / `docs/plans/PLAN-L4-65-worker-independent-review.md:2–43,58–60` / `cf65054392d64ce6e3b4a44c5ce16c89299a8690b54017e6442489c4dfab302d` | Issue227/WCC-FR-06とL9 pair、DB/Git/merge非作用・durable lifecycle後続という切分けを保持。旧planを実行経路にしない。 |
| `LEGACY-ASSET-0449CFE6165EF25515B7` / `docs/design/helix/L5-detail/worker-independent-review.md:18–40` / `0447d1fbc82fb60577ae58eb939d710290fb7c2d22bdfbf1cd66c725cc734b76` | strict receipt、finding digestとsealed reviewer outputの束縛、current origin再照合を確認。旧sealed保証をK9が既に満たすとはせず、真正性をK6側の限界へ分離。 |
| `LEGACY-ASSET-E8B32F8D6519FFCED39A` / `docs/design/helix/L6-function-design/worker-independent-review.md:17–34` / `5f07d5ee970dfc0cbecec99234f465dd299b2baf33b32c3b1df7e01e15ee21dc` | 三軸検査順とDB/Git/merge/lifecycle非作用を確認。旧関数・順序・provider枝は移植しない。 |
| `LEGACY-ASSET-25EB3B29EA909B050987` / `docs/design/helix/L5-detail/worker-lifecycle-receipt.md:1–73` / `275fe7149c80d6abbc85aa59b50bfc4c00e1f55bfd783b6cd092557cd8c21ccc` | review capabilityを消費する後続lifecycleとproposal対応の責務を確認。K9 relationからlifecycle完了を生成しない。 |
| `LEGACY-ASSET-D4CB3FE6A76F3A54FED1` / `docs/plans/PLAN-L3-1622-producer-provenance-separation.md:2–8,31–39,66–74` / `daea021e9f9aafe25837934bde4d10065676b76502fcd8e0523646ebaef95526` | draft/no_change/completion_claim_allowed=false、#539/#1605/lifecycle参照を確認。candidateであり承認の判断史へ昇格しない。 |
| `LEGACY-ASSET-D6816E22DAF2E990410B` / `docs/design/helix/L5-detail/github-cross-review-admission.md:1–110` / `c0a5cf042f66d378bb20aa50c7b3fdd0aa633e6ef4cb2f8742952075f72b0b35` | mixed/dual-receipt/external互換を開発repo admissionのconsumerとして確認。製品K9の条件へ入れない。 |

## 18. K8 入力ラベルの観測と明示経路の遷移記録

本節はPR9の下書きであり、SECURITYの入力分類・authority境界をカーネルで共有できる記録形にする。K8は汎用taint解析、データフロー伝播、policy語彙、権限判定を定義しない。K8が扱うのは、入力の出自と分類観測、およびSECURITYが明示済みとする昇格経路の参照と、そのauthority作用の観測を分けて表すことだけである。

### 18.1 由来とtrace

引用はmain `8d759ff9313252641154f386fe14c68e0a40e415`の本文。Concept全体SHA-256は`bbc787c5dc17de9eded156285ad82ef768788cfa31822dfffa477db073a5e715`、SECURITY L3全体は`f6872a3ee941d63c80a9717bca7e81de832c043ad05cc9ac0c2db77eb264ee9e`で固定する。

共通カーネルには親要求を置かず、K8の各要素を承認済み`SECURITY-AC-001-01`へ要素ごとにtraceする（2026-10-08 PO判断2）。K8から共通カーネル用のL2親や要求を作らない。HARNESSはConcept原則10に基づき共通の工程・検証契約を所有し、SECURITYの分類語彙や昇格権限を所有しない。

| K8要素 | 現行Concept / 承認済みL3 | ここで保持する意味 |
|---|---|---|
| 入力の出自、project、revision、data classification | `SECURITY-AC-001-01`（`docs/helix-security/L3-requirements/functional-requirements.md:68`） | 全入力source種別でsource・project・revision・分類を関連づける。正本・実行事実・表示・作業文脈の分離はConcept原則7（Concept:308）、project等の暗黙共有禁止はConcept:319。 |
| 未信頼状態と分類不能 | 同AC | 入力は未信頼として扱う。分類不能は`Unknown`のまま保持し、untrustedを解除しない。Concept:316の「不明を問題なしに読み替えない」と整合する。 |
| 明示昇格経路・targetの記録 | 同AC、Concept原則8（Concept:309） | 経路が明示された正例では経路とtargetを記録する。学習・監査結果を上流正本へ直接反映しない。カーネルは経路を発行・承認しない。 |
| read-only結果とauthority作用結果 | 同AC、Concept原則7・10（Concept:308、311） | 2結果を別field・別K1観測として返す。read-onlyからauthority作用を推定しない。SECURITYが制約とauthorityを所有する。 |
| 各targetへのread-only negative | 同AC | instruction、要求、authority、永続化、学習への昇格をreadだけから許さない。個別fixtureとして扱うtargetはAC本文に列挙されたAgent instruction、Tool authority、memory、BRAIN、training data、security policyを含む。 |


### 18.2 旧HELIXとの対応

旧sourceは出自と再導出範囲を確認するために参照した。旧資産の状態は台帳どおりであり、いずれも現行仕様または実行根拠として昇格しない。

| 旧source（asset ID／path:行／本文SHA-256） | 読み取った点 | 保持する点 | 変える点と理由 |
|---|---|---|---|
| `LEGACY-ASSET-18F7940E7994634D39A1`（revision 3）／`docs/design/helix/L1-requirements/pillar-requirements.md:43,57,66,77,81`／`7a73fa86acd8e5a7b755a9479f67c4d2af1579e533df101b1b3294eeceb0d8cc` | P8は外部参照・skill化に加え、外部dataの信頼境界、sandbox、不可逆作用を扱う旧要求の束だった。 | 外部dataとinstructionを混同しないsecurity境界を調べる起点。 | P8全体、旧sandbox方式・token・escalation表はK8へ持ち込まない。K8の範囲は承認済み`SECURITY-AC-001-01`の入力分類／明示経路に限定する。 |
| `LEGACY-ASSET-EE5DBACC7F28F7D1F605`／`docs/design/helix/L3-requirements/pillar-functional-requirements.md:171,186`／`7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544` | P8-04はraw input・trusted metadata・executable instructionの分離、HR-NFR-P8-02はinjection/exfiltration誘導の検出・分類と処置を記した。 | 入力本文、metadata、実行可能な指示を同じ意味へ縮約しない。 | 旧IDや旧検出動作をK8へ移さない。現行ACのsource/project/revision/classificationと、明示された遷移経路へ再導出する。 |
| `LEGACY-ASSET-8DA932B4A1012B9D8F00`／`docs/design/helix/L4-basic-design/worker-context-authority.md:19-24,30-53`／`aca532c939e34f2a4fb6b47f74254ff76a49dfaea1eeb56ff5edd7f3a181acec` | Worker起動時にcurrent authority/ruleやscopeをsealed contextへ結び、Issue本文やhistorical input自体をauthorityとみなさない旧境界。 | 出自・scope・authorityを曖昧な本文から推測しないという境界意識。 | Worker起動packet、sealed capability、sandbox／process境界はK8の責務ではなく、旧関数/APIは移植しない。 |
| `LEGACY-ASSET-AD72C8353ACD8C676C5F`／`docs/design/helix/L5-detail/worker-context-authority.md:19-46`／`8818e7af133f2feb2268c6f2c8b04e509735ff330ab8510c2361086a242e6f12` | packet fieldとdigestの厳密照合、解決前のauthority固定、failureの閉じた集合。 | K2鍵とK1の非肯定状態を使い、出自の欠落を肯定へ縮退させない。 | 旧18-field packet、failure code、評価順はK8の仕様へ転用しない。 |
| `LEGACY-ASSET-2A73DCD3E15EC9B529CF`／`docs/design/helix/L6-function-design/worker-context-authority.md:19-29`／`21406d2c7c72520f9928ce5e6ded143f8285c3975a3fb617293965661b01eff3` | 旧関数面はattest/reattest/compile/verify/launchを分け、同一process capabilityを署名やcross-process tokenと主張しなかった。 | K8も観測・照合APIとauthority作用を混同しない。 | 旧関数名・process launch・旧runtime authorityを採らず、現行L3から必要な純粋な分類・記録面を再導出する。 |
| `LEGACY-ASSET-D65FB82C21C5EDBDFCE4`／`docs/design/helix/L5-detail/memory-learning-promotion.md:39-48,72-89,91-145,147-165`／`70ed887f35ca38a6e406d91b750848a9b89cde73825358c554ad009d473a115a` | 知識memoryとcontinuationの分離、raw log/progress/secret等の排除、findingからlearning stageへ進む旧案。 | raw evidence本文、進捗・continuationを知識・memoryと同じ意味で扱わない。読み取りや分類から永続化／学習への昇格を作らない。 | memory compaction、role分離、stage graph、サイズ上限、DB/JSONL transactionはK8の範囲外。現行ACにない旧authority・数値を持ち込まない。 |
| `LEGACY-ASSET-256C9F8C3029B185B151`／`docs/design/helix/L6-function-design/memory-learning-promotion.md:31-60,72-148`／`e6e20a686ac0f9e019b9fd9803674c489b1e1674b7388efa20dfa3be648fb753` | 旧pure APIが候補分類、禁止内容検出、promotion stageを分けていた。 | 表示・分類・authority作用の責務を分ける形の参考にする。 | 旧API、HIL failure、promotionの認可や受入を移植しない。K8はauthority効果を生成しない。 |

区分候補：P8 L2/L3と旧設計は歴史的根拠の意味を再導出する。既存資産を完全一致で再利用せず、現行SECURITY L3から分類記録のsemantic re-deriveを行う。旧sandbox、旧memory promotion、旧worker packet実行方式は今回置換対象でもなく、K8へ流用しない。台帳では`LEGACY-ASSET-18F7940E7994634D39A1`の`disposition=source_snapshot_preservation`で`authority_status`は無く、他6件は`authority_status=historical`かつ`disposition=unresolved`である。

### 18.3 型とAPI

分類語彙と昇格対象はSECURITYの既存ownerが持つ。K8は語彙を列挙しない。SECURITYが所有するcurrent declarationは、current分類定義、ACに現れる既存target identityごとのowner参照、経路を検証するK6 verifier、作用観測を読む既存sourceを束ねる。当該operationが必要とする宣言項目が欠落・unknown・staleなら、そのoperationの肯定結果を作らない。

```text
TargetOwnerRef       = { target: SubjectRef, owner: SubjectRef }
ClassificationDecl   = SECURITY ownerのcurrent declaration。項目はoperation別に解決する。
  { classification_definition: SubjectRef, classifier: SubjectRef,
    route_slice: { target_owners: TargetOwnerRef[],
                   route_verifier: VerifierRef } | absent,
    effect_slice: { effect_source: SubjectRef } | absent }
                      # route_verifierはcurrent K6 VerifierSet内のexact member。
                      # effect_sourceはSECURITY ownerが宣言するcurrent作用source。
InputSourceRef       = { source: SubjectRef, project: SubjectRef }
                      # source SubjectRefが入力revisionとdata digestを持つ
ClassificationRef    = SubjectRef        # SECURITY分類定義内の既存項目
ObservedLabel        = { input: InputSourceRef, trust: "untrusted",
                         classification: Observed<ClassificationRef>,
                         key: ResultKey, evidence: EvidenceRef }
InputLabelRef        = SubjectRef{kind: k8_input_label_observation,
  identity: canonical_json({source_identity, classification_operation, scope}),
  revision: saved ResultRecord.key_digest,
  digest: sha256(canonical_json(saved K2 ResultRecord))}
  # K2/K5に保存済み分類operation ResultRecordの参照。source SubjectRefとは別。
ExplicitRouteRef     = { route: SubjectRef, target: SubjectRef,
                         permission_check: SubjectRef }
EffectObservation   = { source: SubjectRef, event: SubjectRef | null,
                         outcome: "none" | "occurred",
                         issuer: identity,
                         binding: { input_label: SubjectRef | null, route: SubjectRef | null,
                                    target: SubjectRef | null, permission_query: SubjectRef | null }
                                   | null }
EffectIssuerDiagnostic = non-K1, non-K2 projection diagnostic { state: match | mismatch | unavailable,
  source: SubjectRef | null, declared_issuer: identity | null,
  observed_issuer: identity | null,
  reason: source_unregistered | source_unreadable | issuer_missing | null }
EffectIssuerAssuranceDiagnostic = non-K1, non-K2 projection diagnostic { state: unproven,
                                    reason: no_existing_signature_or_anchor }
K8CaseInputBinding = { input_label: InputLabelRef, source: SubjectRef,
  project: SubjectRef, task_scope: SubjectRef, selection: not_selected | selected,
  route: SubjectRef | null, target: SubjectRef | null,
  permission_query: SubjectRef | null, effect_observation: SubjectRef | null }
K8CaseInputBindingRef = existing owner current ref with independent identity/revision/head for the input-only binding slice
K8CaseResultPointers = { classification_key: ResultKey, effect_key: ResultKey,
                         validation_key: ResultKey | null }
K8CaseBindingRef(input_binding, owner_input_binding) = SubjectRef{
  kind: k8_case_binding,
  identity: canonical_json({owner_identity, case_identity}),
  revision: owner_input_binding.revision,
  digest: sha256(canonical_json(input_binding))}
  # input_label経由の分類ResultKeyを含む。effect/validation ResultKeyは含めない。
K8OperationVersion(operation, api_contract, owner_contracts) = UTF-8(canonical_json({
  operation, api_contract, owner_contracts: SubjectRef identity順}))
ExistingRequiredInputRole = identity from the existing owner declaration required-input set
K8RoleBoundInputRef(side, role, ref) = SubjectRef{
  kind: k8_role_input,
  identity: canonical_json({side: "saved" | "current", role: ExistingRequiredInputRole, ref_identity: ref.identity}),
  revision: ref.revision,
  digest: ref.digest}
  # aliasのrevision/digestは原refの実bytesを表す。side/role/refの対応はownerの固定required-input binding bytesとalias identityへ結ぶ。
  # readerは原source bytesを実読してdigestを計算しalias identityへ記録する。wrapperだけを読むことはsource実読でない。
  # 原SubjectRefはTransitionValidation.components.raw_read_refsに別保持する。
TransitionCase = { input_binding_ref: K8CaseInputBindingRef,
                   result_pointers: K8CaseResultPointers }
                 # input-only bindingと結果pointer projectionは別source slice。
                 # selectionはinput-only bindingだけから決める。pointerの有無は選択やcurrent key構成可否を決めない。
MismatchField = input_label | route | target | revision_subject | permission_check | permission_query | effect_event
  | binding.input_label | binding.route | binding.target | binding.permission_query
  | issuer | current_classification_record
TransitionOutcome = Validated | Mismatch{fields: nonempty MismatchField[]} | Denied{source: permission_check | route_verification}
TransitionValidation = { result: Observed<TransitionOutcome> | KeyUnavailable,
  components: { saved_input_label: Observed<ClassificationRef>,
                current_classification: Observed<ClassificationRef>,
                effect: Observed<EffectObservation>,
                permission_check: PermissionCheck | KeyUnavailable,
                route_verification: RequiredResult | KeyUnavailable,
                issuer_source_match: EffectIssuerDiagnostic,
                raw_read_refs: SubjectRef[] } | ValidationEvidenceUnavailable,
  issuer_authenticity: EffectIssuerAssuranceDiagnostic }
ValidationEvidenceUnavailable = non-K1 non-K2 diagnostic { state: evidence_unavailable,
  evidence_ref: EvidenceRef, reason: unreadable }
KeyUnavailable = { state: "key_unavailable", diagnostic: Rejected(missing_key) }
LabelTransition      = { source_label: ObservedLabel,
                         read_result: Observed<ClassificationRef>,
                         observed_effect: Observed<EffectObservation>,
                         validated_transition: TransitionValidation | NotSelected,
                         pointer_diagnostics: non-K1 non-K2 diagnostic[] }
NotSelected = { state: "not_selected" } # selection projection。validation queryを発行していないcaseで、K1結果・ResultKeyはなくcombineへ渡さない。
# K1のUnobserved(not_selected)は完全なResultKeyを持つ操作照会の状態。本projectionは照会自体を発行しないowner selectionを表す差分である。
```

`target_owners.target`はAC本文が指す既存対象のidentity参照であり、新しいtarget語彙ではない。`ClassificationDecl.route_slice.route_verifier`はK6のcurrent `VerifierSet`にexact一致するmemberを指す。`effect_slice.effect_source`はSECURITY ownerが宣言するcurrent source identityであり、source ownerの既存current readerで実体を読む。K3 `AuthorityDecl.sources`の許可sourceとeffect sourceを同一視しない。これらはowner登録済みのcurrent declarationの項目であり、各APIはcallerからdeclaration・reader・verifier setを受け取らず、固定adapterが各owner読取り境界でK5 current_headを内部取得し、その固定prefixを再読して解決する。caller input_headsは期待値であり、内部取得した末尾と不一致なら旧prefixを選ばない。現行headからkeyを構成し、分類/effect/validationの新規評価は18.4のUnknown(missing_input)候補として期待headと実読headを証拠に残す。読取りprojectionではcurrent keyのK2 lookup結果を変換せず、head期待値の不一致をpointer_diagnosticsと同じ非K1診断へ保持する。classification operationはsource/project/classification definition/classifierだけを必須とし、optionalなroute/effect sliceの不在で分類結果まで止めない。route検証・実作用観測で必要なsliceがcurrent declarationに無い場合、absenceをcurrent declarationの固定bytesへ保持する。API/schema/current owner declaration/case binding等のkey基盤が解決できるときは、存在するrefだけを入力にし、未登録sliceの架空refを足さずUnknown(unregistered)を返す。そのkey基盤も欠ける場合はAPI Rejectedまたはselected KeyUnavailableである。optional sliceの不在を扱うoperation_versionは既知のAPI/owner contract refsだけから構成する。各operationの`operation_version`/inputsにもそのoperationに適用されるsliceだけを含める。

`InputLabelRef`は`observe_input_label`がK2/K5既存方式で保存した分類operationの唯一のResultRecord（result: Observed<ClassificationRef>）の固定参照であり、K8固有authorityやsource refの別名ではない。identityは分類対象source identity・分類operation・既存scopeから作り、revision/digestは保存済みResultRecordのkey_digestとcanonical bytesから作る。利用側はsaved recordへInputLabelRefの全fieldを一致させる。current classification keyは別に再構成・lookupし、validation PositiveにはそのValueとsaved recordの全field一致を要する。ObservedLabelはこのrecordのkey.subject/input binding、result、evidenceから再構成するprojectionであり、同じ分類keyに別result=ObservedLabelのrecordを重ねて保存しない。再構成した`ObservedLabel.input.source`からsource/project/classification definitionを再読する。単なるsource SubjectRefを`InputLabelRef`の代用にしない。

`K8CaseBindingRef`の`owner_identity`と`case_identity`は既存owner/case identity、`owner_input_binding`はcurrent prefixから実読した既存ownerのinput-only binding slice参照、`revision`はそのslice refのrevision、digestはcanonical `K8CaseInputBinding` bytesから求める。結果key pointerを保存するprojection／segmentは別source identity/headであり、input bindingのsource ref/revision/headに含めない。input-only sliceの固定revision/headを結果pointerの追記で進めない。両source identityを分けるのはbackdatingではなく、入力宣言と結果参照projectionの責務分離である。結果key pointerだけが更新されても`K8CaseBindingRef`のrevision/digest/HeadInputRefは変わらず、current input binding自体が変われば更新する。各refは実読したcanonical `SubjectRef`値とし、nullのfieldには架空refを作らない。`K8OperationVersion`の`api_contract`と`owner_contracts`は各operationに適用される既存current API/schema/contract参照であり、owner_contractsはidentity順に正準化する。classification/effect/validationすべてに同じ正準化規則を適用し、`operation`はそれぞれ`classify_input_label`、`observe_authority_effect`、`validate_label_transition`とする。該当current refが一意に解決できない場合はversionを推定せず、keyを作らない。current owner bindingを読めない場合はcase binding refを作らず、case APIのmissing-key診断へ進む。

- `observe_input_label(input_ref, input_heads) -> ObservedLabel | Rejected(missing_key)`：固定adapterがSECURITY ownerのcurrent declarationとsource ownerのcurrent readerを固定prefixから再読する。分類operationに必要なsource／project／revision／digest／classification definition／classifier refが揃わなければ、K2 key作成前に`Rejected(missing_key)`とする。入力bytesを実読してdigestを再計算し、既存のcurrent分類評価で読む。評価境界が無い場合は`Unknown(unregistered)`。route/effect項目が未登録でも分類operation自体は妨げない。callerのclassification値・reader・declarationはcurrent根拠にしない。分類不能はK1 `Unknown`で、`trust="untrusted"`を保持する。
- `observe_authority_effect(case_ref, effect_observation_ref, input_heads) -> Observed<EffectObservation> | Rejected(missing_key)`：固定adapterが渡された`case_ref`のowner current bindingを再読し、同じcaseに結合されたSECURITY ownerのcurrent effect-source登録とsource ownerのcurrent readerを固定prefixから再読する。case bindingは逆引きしない。原記録bytesのdigest・revision・issuerと実作用記録にあるinput label/route/target/permission queryのbindingを照合する。原記録に無いbindingを補わず、原source bytes上の`outcome="none"`、`event=null`、`binding=null`またはbinding内nullをそのまま観測値へ保持する。binding欠落を理由に、実読した作用事実までUnknown/Rejectedへ読み替えない。callerのsource reader、verifier set、declaration、keyやplain `outcome="occurred"`をcurrent根拠にしない。fresh評価のeffect source未登録はUnknown(unregistered)、実読不能はUnknown(unreadable)、未着はUnobserved(not_run)、caller期待headとの不一致はUnknown(missing_input)候補として後述の優先順で決める。Staleはcurrent keyの読取りlookupからだけ導き、fresh resultとして保存しない。
- `validate_label_transition(case_ref, input_label_ref: InputLabelRef, route_ref, k3_permission_check_ref, effect_observation_ref, input_heads) -> TransitionValidation | Rejected(missing_key)`：not_selectedのcaseにも明示照会できる。この場合もcurrent validation keyの全必須refを必要とし、構成不能ならAPI Rejected(missing_key)、構成可能ならTransitionValidation.resultを鍵付きUnobserved(not_selected)としK2 record/lookupを通す。依存の読取り診断はcomponentsへ保持するがselected用のMismatch/Denied/Validated評価を行わない。record_label_transitionのquery未発行NotSelected projectionとはこの照会発行の有無で区別する。selectedなら以下を行う。固定adapterが渡された`case_ref`のcurrent case bindingを再読して参照を固定し、`input_label_ref`は旧分類ResultRecordの固定参照として保存済recordへ全field一致で実読解決し、ObservedLabel projectionを再構成する。別componentとしてcurrent classification keyを作りK2 lookupし、positive validationにはcurrent分類resultがValueかつそのResultRecordがsaved InputLabelRefの指すrecordと全field一致することを要する。APIの他ref引数はcurrent case bindingにあるrefとの照合値であり、固定adapterはowner current sourceからrefを読み直す。case bindingと引数refが全field一致しなければvalidationを肯定しない。その`ObservedLabel.input.source`からsource/project/classification definitionを再読し、current `ClassificationDecl`、K6 `VerifierSet`とroute verifier、target owner、K3既存`PermissionCheck`、effect observationも固定prefixから再読し、各lookup結果を`components`に保持する。permission参照は保存済み結果のK2 lookupがValue(PermissionCheckResult)となり、current queryで再照合できる場合だけ使う。PermissionCheckDiagnosticはkeyなし・非保存のためこの参照へ代用せず、Unknown/Unobserved/Staleもvalidationを肯定しない。ExplicitRouteRef.permission_checkとk3_permission_check_refは全field一致を要する。permission checkは現行tupleのactor/target/operation/revision/environment/scope/expiry等と、route target・実作用eventを同じ作用としてexact bindし、K3-I1〜I7に従い`combined=Positive`なら継続し、`Negative`は`Denied{source:permission_check}`とする。route_ref.target.identityは再構成query.targetおよびtuple.targetと一致させる。作用対象ownerのcurrent declarationが当該targetとrouteから解決したrevision_subjectはquery.revisionおよびtuple.revisionとidentity/revision/digestまで一致させる。target identityとrevision_subject.identityが同じとは仮定しない。対応宣言が不明ならUnknown(unsupported)で肯定しない。`EffectObservation.issuer`がcurrent effect-source registrationのdeclared issuerと一致すれば非K1 diagnosticの`issuer_source_match.state=match`、異なれば`state=mismatch`として`Mismatch{fields:[issuer]}`を返す。current registration/readerが取得できなければ`state=unavailable`で、元のeffect componentの非Valueを保つ。署名/anchorの真正性はこの一致から導かない。`EffectObservation.binding.input_label`は保存済み`InputLabelRef`、`binding.route`は`route_ref.route`、`binding.target`は`route_ref.target`、`binding.permission_query`は再照合したK3 checkの`query`とidentity/revision/digestまで各々一致させる。bindingがnullまたは一つでも不一致ならvalidatedにしない。route ref等のrequired key入力が存在しkey構成可能であれば、不一致・binding欠落は後述の判定表で保持する。required ref自体が無くK2 keyを構成できないselected caseは`KeyUnavailable(Rejected(missing_key))`とし、呼出側で補わない。さらに再読した`EffectObservation`が`Value(occurred)`で、event identityがroute/target/permission checkの作用tupleと一致し、K6 `RequiredResult.combined=Positive`およびK3 `PermissionCheckResult.combined=Positive`の場合だけresultを`Value(Validated)`にする。原記録の`outcome="none"`は選択済みvalidationに対する`Value(Mismatch{fields:[effect_event]})`である。この関数は許可・作用記録を作らず、K3の既存許可と既発生作用の記録を読む。
- `record_label_transition(case_ref, input_heads) -> LabelTransition | Rejected(missing_key)`：固定adapterはownerのcurrent input-only binding sliceと別read viewのresult pointer projectionを読み、両方をcase identityで結合する。input bindingのfield欠落または不正selectionは`Rejected(missing_key)`とし、`selection=not_selected`を明示未選択として扱い、pointerの有無では変えない。callerが任意のkeyを指定しない。operationごとのcurrent K2 keyをowner declaration、input-only current refs、scopeから再構成してlookupし、caseに保存済みのclassification/effect/validation ResultKeyを照会keyに使わない。case内ResultKeyはcurrent再構成結果との比較用historical pointerに限る。historical pointerのrevision/digestが古いだけならcurrent lookupへ影響させない。pointerのoperation/subject/scope/case identityが対応operationと異なる、又はpointer field自体が欠落する場合は`pointer_diagnostics`へ`Rejected(missing_key)`と該当fieldを記録し、そのpointerを利用しない。この診断はK1/K2へ保存せず、current keyで得た分類・作用・validationを消さない。K2 lookupで分類結果、effect observation、transition validationを別fieldで返す。`TransitionValidation.components`が利用可能なら、そのeffectと`LabelTransition.observed_effect`は同じcurrent effect keyのlookup結果を全field一致で共有する。LabelTransitionはこれらを包む読取りprojectionであり、集約用のResultKeyを作らず、各nested結果の鍵を保持する。`selection=selected`ならpointerが非null/null/欠落のいずれでもinput-only bindingからcurrent validation keyを構成し、可能ならK2 lookupを返す。null/欠落pointerはpointer_diagnosticsへmissing_keyとして保持するだけであり、保存済みDenied/Mismatch/非Valueを置換しない。pointerが非nullでもrequired route/permission参照自体が無くcurrent keyを構成できなければ`TransitionValidation.result=KeyUnavailable`とし、利用可能な分類/effect/K3/K6 componentsを保持する。`selection=not_selected`ならpointerのnull/非nullを問わずNotSelectedを返し、非null pointerはselection不一致のpointer_diagnosticsへ記録する。このdiagnosticはK1結果ではなくK2にも保存せず、K1 combineにも渡さない。NotSelectedはownerが未選択を明示したselection projectionである。K1 2.2のUnobserved(not_selected)との差分は、K1が完全な鍵を持つ操作照会の結果であるのに対し、本projectionはvalidation queryを発行せずrequired route refsも要求しない点である。これはAC-HARNESS-L3-030-02の未選択を未観測に保つ意味を保持し、未選択を成功にしない。実際に完全な鍵を持つvalidation queryを未選択として照会する境界ではK1のUnobserved(not_selected)を使い、NotSelectedで代用しない。いずれも`read_result`から`observed_effect`または`validated_transition`を導かない。case binding自体を読めず分類/effectの基盤を解決できない場合に限りAPI全体をRejectedとしてよい。作用sourceの原記録bytesに`none`またはbinding fieldのnull/欠落があっても、原記録が作用を観測していれば`observed_effect`へ事実を保持し、validationは非肯定とする。

入力labelは遷移の前後を通して`untrusted`のまま保持する。明示routeによるauthority作用が起きた事実の観測と、route・owner・K3既存許可の照合に成功した`validated_transition`は別状態である。作用sourceが実際の作用を観測したがroute bindingが欠落・不一致・未検証の場合、`observed_effect=Value({outcome:"occurred", ...})`を消さず、keyを構成できるvalidationは18.4の決定表に従い、確定不一致は否定Value、不明は対応する非Valueとして別に返す。selected validationのrequired ref欠落でK2 keyを構成できない場合は`KeyUnavailable(Rejected(missing_key))`をprojectionへ保持する。KeyUnavailableだけはK1結果ではなく、K2に保存せずcombineへ渡さない。この組はK7 `AppliedUncertain`と同じく「作用済みの事実をRejectedへ読み替えない」形だが、K8は新たな作用やrollbackを実行しない。

### 18.4 K1/K2/K6との整合

- **K1**：分類不能は`Unknown`、実作用をまだ読めない／読んでいない場合はその原因に応じた`Unknown`／`Unobserved`、実読値間の確定した矛盾は`Value(Mismatch{fields})`（Negative）として、K2 conflict等の未知は元の非Valueとして残す。`KeyUnavailable`はK1結果ではなくprojection診断で、combineへ渡さない。いずれも`untrusted`を解除しない。
- **K2**：分類keyは`operation=classify_input_label`、classifier/schema版を含む`operation_version`、`subject=input.source`、既存scopeを表す`scope`とする。`inputs`にはproject、SECURITY分類定義、current classifier refと分類operationに必要なcurrent declaration refなど、subjectと重複しない結果依存入力だけを含める。inputs内は共通SubjectRefをexact一致で一件にdedupする。同一identityでkind/revision/digestが異なるrefがあればK2 `key_of`へ渡す前に`Rejected(missing_key)`とし、どちらかを選ばない。分類operationにroute verifier・target owner・effect sourceを要求しない。effect keyは`operation=observe_authority_effect`、`subject=effect_observation_ref`、validation keyは`operation=validate_label_transition`、`subject=InputLabelRef`とする。`InputLabelRef`は保存済み分類ResultRecordの固定参照で、ObservedLabel projectionを再構成し、source refでは代用しない。これらの`scope`はcurrent owner case bindingが指す既存case/task scopeを使う。各`operation_version`は`K8OperationVersion`規則に従い、operationごとにK8 API contractと当該operationで使う既存owner schema/contractのcurrent refsを`canonical_json`で正準化した文字列とする。classification keyは分類対象source/project/classification inputsと既存scopeだけから作り、K8CaseBindingRefをinputsに含めない。effect/validation keyはowner current declarationが定めるoperation別required-input全集合にK8CaseBindingRefとinput-only binding sliceのHeadInputRefを含める。result pointer projectionまたはその保存source identityのHeadInputRefはinputsへ入れない。effect keyにはSECURITY effect-source registration/source owner reader、原記録ref、case binding refs、存在するinput label/route/target/K3 query/event refsおよび各ownerの`HeadInputRef`を含める。validation keyには保存済み`InputLabelRef`が指す分類結果から再読したsource/project/classification定義、SECURITY target-owner/route slices、明示route/target、保存済みK3 `PermissionCheck`のResultKey依存SubjectRefと`PermissionQueryRef`、K6 `VerifierSet`/verifier contract/route receipt、effect observation/event、および各ownerの`HeadInputRef`を含める。K2 inputsでは各refから`K8RoleBoundInputRef(side,role,ref)`というK2 `SubjectRef`を作り、保存済みK3 query dependencyとK8 current owner refが同一identityで異なるrevision/digestでも別aliasとして共存させる。key前Rejectedはside/role/ref.identityで決まる同一alias identity内でkind/revision/digestが異なるrefが衝突した場合だけに限り、別aliasの不一致はcurrent K3 lookupの`Stale`等として残す。effect/validation K2 `inputs`には`K8CaseBindingRef`を含める。このrefのcanonical bytesはinput-only sliceである既存case identity、`InputLabelRef`、source/project/task scope、selection、route、target、permission query、effect observation refsを結び、分類ResultKeyはInputLabelRef経由で含み、結果pointerのclassification/effect/validation ResultKeyは含めない。分類ResultKeyはcase bindingに依存しない。case input bindingは分類ResultKeyから作ったInputLabelRefに依存するが、分類operationのkeyはcase input bindingに依存しない。effect/validation keyだけがcase input bindingに依存し、結果pointerやその保存source headはこれらのinputsから除外するため循環も自己無効化も生じない。subjectと重複するrefは除き、inputs全体はrole-bound `SubjectRef.identity`で整列し、完全一致refだけを同一alias内でdedupする。headはraw SegmentHeadでなく16.2のHeadInputRefで固定prefix観測をSubjectRef化して使う。operationごとのrequired-input集合はSECURITY current declarationの対応sliceとK3 `AuthorityDecl.required_inputs`から読む。必須key field欠落は`Rejected(missing_key)`、同revisionのbytes差は`Unknown(conflict)`、revision＋digest更新後の旧`Value`は`Stale`、input identity集合変更は`Unobserved(not_run)`。保存済みK3結果はcurrent keyでlookupし、その非肯定クラスと`assurance`を維持する。caseに保存された古いResultKeyはlookupへ使わず、current keyとの比較に限る。operation versionまたはscopeのcurrent根拠が欠落・unknown・staleならkeyを肯定しない。
effect operationでは原記録のnone/event=null/binding=nullをK8CaseBindingRefと原source固定bytesへ保持し、存在するbinding/event参照だけをinputsへ含める。route/permission/eventがnullであること自体はeffect key構成の欠落ではない。validationは明示route/permissionなどのrequired参照を必要とし、その参照自体が無ければKeyUnavailable診断になる。issuerやrevision/digestのscalar値をSubjectRefとして投入せず、原記録SubjectRef/current owner契約と固定binding bytesへ束縛する。

検証operationの値型は`TransitionOutcome = Validated | Mismatch{fields} | Denied{source}`であり、HARNESS所有の写像`k8_transition_polarity`（版はcurrent K8 validation API contract refのrevision/digest）で`Validated`はPositive、`Mismatch`と`Denied`はNegativeへ写し、合成のpolarityへこの識別と版を記録する。K3 `PermissionCheckResult.combined=Negative`は`Denied{source:permission_check}`、K6 `RequiredResult.combined=Negative`は`Denied{source:route_verification}`、保存されたroute/effect/target/query/event間の確定した不一致は該当field名を列挙した`Mismatch`とする。K2の`Unknown(conflict)`（同revision・異digest）は値の不一致ではなく、K2 lookup結果のまま残す。現在のInputLabelRefは固定saved record参照を解決して保持し、別のcurrent classification key lookupも実行する。current classification keyのStaleはcomponentのまま保持し、validation outcomeへ直接代入しない。`TransitionValidation.components`はK3 `PermissionCheck`（診断を含む）とK6 `RequiredResult`を元型のまま保持し、`result`がUnknown/Mismatch/Deniedでも各`assurance`と元診断を落とさない。`issuer_source_match`はcurrent source registrationのdeclared issuerと原記録issuerを比較する非K1/non-K2 diagnostic projectionであり、K2 ResultKeyやK1 `Observed`を追加しない。一致/不一致/未取得だけを示し、不一致は`Mismatch{fields:[issuer]}`、未取得は元のeffect componentのUnknown/Unobservedへ写す。署名/anchorの既存証拠は無いため`issuer_authenticity`も非K1/non-K2の`EffectIssuerAssuranceDiagnostic{state:unproven, reason:no_existing_signature_or_anchor}`とし、issuer一致から真正性を推論しない。

`validate_label_transition`はcurrent入力から新しい評価を行い、下表でfresh outcomeを決める。`record_label_transition`は読取りprojectionであり、fresh評価や結果の追記を行わず、各operationのcurrent query keyでK2 lookupする。両者を混ぜない。fresh評価時のdependency Staleはcomponentへ原型で保持し、validation自身のStaleへ型違いで代入しない。

| 判定順 | 条件 | fresh validationの結果 |
|---|---|---|
| 1 | source/case基盤を読めない、field欠落/不正selection、同一alias identity内の異ref、分類/effect keyの必須基盤ref欠落 | API Rejected(missing_key) |
| 2 | validation keyの全必須refが揃わない | selectedはprojection内KeyUnavailable。not_selectedの明示照会はAPI Rejected(missing_key) |
| 2a | key構成可能なnot_selectedの明示照会 | 鍵付きUnobserved(not_selected)。以下のselected評価へ進まない |
| 3 | 実読値のroute/target/query/event/binding/issuer確定不一致、selectedのeffect=none、又はcurrent分類Valueのrecordとsaved InputLabelRefのrecordが確定不一致 | Value(Mismatch{fields})（Negative）。fieldsはMismatchFieldの列挙順で、確定した不一致だけを各一回保持 |
| 4 | K3 combined=Negative | Value(Denied{source:permission_check})（Negative） |
| 5 | K6 route combined=Negative | Value(Denied{source:route_verification})（Negative） |
| 6 | 全componentと構造照合から集めたUnknown候補が一つ以上 | 下記の閉語彙順でUnknown(reason)。全候補と元result/assuranceを保持 |
| 7 | Unknown候補なし、Unobserved候補あり | not_selected、not_run、pending_receiptの順でUnobserved(why)。全候補を保持 |
| 8 | 全必須成分がValueで一致しK3/K6 combined=Positive | Value(Validated)（Positive） |

Unknown候補は、dependency Unknownの元reason、dependency Stale→missing_input、required NotApplicable→missing_input、内容/binding欠落→missing_input、source読取不能→unreadable、未登録reader/declaration→unregistered、routeからrevision_subjectへの対応不明→unsupported、PermissionCheckDiagnosticのmissing_key→missing_input／invalid_query→missing_inputから集める。K3/K6 combined=Undeterminedは内側の全non-value成分とset_reasonを同じ規則で展開し、候補が得られない不正な空合成もmissing_inputとする。reasonの決定順はambiguous、unsupported、conflict、evaluation_error、indeterminate、unreadable、incomparable、unregistered、missing_input、invalid_dispositionで固定する。UnknownとUnobservedが同時ならUnknownを選び、最初の候補だけで他を捨てない。NotSelected/KeyUnavailable等の非K1診断を成分へ捏造しない。

fresh評価をK2/K5へ保存するとき、唯一のvalidation ResultRecord.resultはObserved<TransitionOutcome>とし、components・raw read refs・各assuranceはそのevidenceが指す固定bytesへ保持する。evidenceには当該validation ResultKey/ResultRecord/result pointerを含めず、自己参照を作らない。TransitionValidation全体を別のresultとして同じ鍵へ二重保存しない。K2 record後はcurrent keyのlookupを通した結果をresultへ返す。同一鍵異bodyのConflictなら結果はK2 Unknown(conflict)であり、fresh候補をそのまま肯定出力せず、競合した両bodyとassuranceを証拠に残す。

読取りprojectionはcurrent keyでのlookup結果をそのまま保持する。validation自身の旧ValueはStale<TransitionOutcome>、同revision異digestはUnknown(conflict)、operation version/scope/identity集合変更はUnobserved(not_run)、旧非ValueはK2-I2bのsuperseded付きUnobservedである。fresh評価を呼んでこれらを上書きしない。projectionのcomponentsはcurrent依存の読取り診断であり、旧resultの証拠をcurrentへ書き換えない。旧result.prior.evidenceもその固定参照のまま保つ。current Valueを再構成する場合は保存evidenceのcomponents/assuranceを実読して保持し、欠落を既定値で補わない。保存evidenceを読めなければcomponentsを非K1/non-K2のValidationEvidenceUnavailableにし、lookup結果自体とevidence参照は維持する。この診断からassuranceを肯定・補完せず、observed_effectの独立したcurrent lookup結果も消さない。

MismatchFieldは型の列挙を閉語彙・順序とする。API引数とcase input-only bindingのref差はinput_label/route/target/permission_query/effect_event、作用bindingの差はbinding.*、作用eventのtuple差またはnoneはeffect_event、source issuer差はissuer、current分類Valueとsaved recordの全field差はcurrent_classification_recordへ対応づける。ExplicitRouteRef.permission_checkとAPI k3_permission_check_refの差はpermission_check、route_ref.targetとK3 query.target/tuple.targetの差はtarget、ownerが解決したrevision_subjectとK3 query.revision/tuple.revisionの差はrevision_subjectへ対応づける。一つの差を無関係なfieldへ展開せず、実際に照合でき不一致と確定したfieldだけを重複なく列挙する。nullで比較不能なfieldはMismatchへ足さずUnknown候補にする。

observe_input_label/observe_authority_effectのfresh評価は、(1)必須key基盤欠落/同alias衝突はAPI Rejected、(2)全Unknown候補を収集し18.4のUnknownReason順で一つを選ぶ、(3)Unknownなしで未実施/未着ならUnobserved(not_run)、(4)全必須実読成立ならValue、の順とする。head不一致はmissing_input候補、読取不能はunreadable、未登録はunregistered、分類不能はindeterminateで、他の候補を捨てずevidenceへ保持する。保存後のK2 ConflictはlookupのUnknown(conflict)を返しfresh候補を上書き肯定しない。

`observe_input_label`はclassifier宣言field欠落をAPI Rejected(missing_key)、宣言済みclassifierの登録不在をUnknown(unregistered)、source読取不能をUnknown(unreadable)、分類不能をUnknown(indeterminate)とする。`observe_authority_effect`のcurrent source実読成立は原記録のnone/occurredをValueにし、source登録不在はUnknown(unregistered)、読取不能はUnknown(unreadable)、未着はUnobserved(not_run)とする。両APIの新規結果もK2 record/lookupを通し、K2 Conflictを肯定へ変換しない。読取り時は各current keyのK2クラスを維持する。

- **K6**：route検証receiptのbase keyは、operation=SECURITY current declarationが参照するK6 route verifierの既存operation、subject=明示route ref、scope=caseの既存scope、inputs=同operationのnon-verifier required refs（source/project/classification definition/targetとそのrevision_subject/K3 permission check refを含む。source/project等のrevision・digestは各SubjectRef内に保持し、revision scalarを別refとして作らない）で構成し、K6 `required(base_key, verifier_set, reverify)`へ渡す。receipt `read`はこのbase keyのsubjectとinputsからverifier類を除いた集合とidentity/revision/digestまで完全一致させる（K6-I4）。K6 `RequiredResult`の`combined`と`assurance`（`reverifiable`、`reproduction`、`issuer_authenticity`）、K3 `PermissionCheckResult.assurance`、実際に読んだraw SubjectRefは`TransitionValidation.components`に元result/refのまま別保持し、ValidationのresultがUnknown/Mismatch/Deniedでも捨てない。K6 receipt readはbase key inputsのrole-bound alias identityと原source実bytesのdigestへ完全一致させる。sideの割当規則はK8 API contract、role/ref対応はcurrent owner required-input bindingへ固定し、それらの契約refも鍵の入力へ保持する。aliasのidentityを見てwrapper bytesを読むのではなく、固定bindingが指す原sourceを実読し、ref.digestと再計算digestの一致を確認してalias identityへ記録する。bindingを読んだだけではこのsource実読を満たさない。issuer照合は登録済みsourceが申告するissuerとの一致だけを意味する。K6 receiptのissuer_authenticityは既存K6の鍵付きUnknown(unsupported)をそのまま保持する。effect source自身にはそのK6鍵を流用せず、非K1のEffectIssuerAssuranceDiagnostic{state:unproven, reason:no_existing_signature_or_anchor}で未証明を示す。登録issuer一致からどちらの真正性も肯定しない。receiptの`authority_effect="none"`は維持し、K6 receiptは許可記録にも実作用sourceにもならない。実作用はK3の許可照合と別に、SECURITYが宣言したeffect sourceからそのownerのcurrent readerで観測する。route/target欠落でK3 `PermissionQuery`を構成できない場合、`components.permission_check=KeyUnavailable`としK3 resultを捏造しない。

### 18.5 不変条件

- **K8-I1 出自の結合**：classification resultはsource、project、source revision、data classification、current `ClassificationDecl`に結び、別identityへ付け替えない。
- **K8-I2 未信頼の維持**：入力labelは`untrusted`で始まり、分類・route照合・許可・作用のどの結果でも、K8はこれを解除または書換えしない。
- **K8-I3 分類不能の保持**：分類不能はK1 `Unknown`のまま出力し、default classificationやtrustedへ穴埋めしない。
- **K8-I4 read/作用の分離**：read-only observationは実作用観測・検証済み遷移と別field／別keyに記録する。read-only結果やK6 receiptからauthority effectを導かない。
- **K8-I5 route検証**：遷移をvalidatedとするには、SECURITY current `ClassificationDecl`、target owner ref、K6 `RequiredResult.combined=Positive`となるcurrent route verifier receipt、exact K3 `PermissionCheck`の全てが揃い、targetと作用tupleが一致し、K3 checkが肯定であることを要する。K8は許可を生成せず、routeも実作用も実行しない。
- **K8-I6 作用観測の保全**：effect sourceから実作用を読んだとき、route／permissionが欠けても`observed_effect`を保持する。同じ結果で`validated_transition`はPositiveにしない（確定不一致ならNegative Valueを許す）。selected validation keyを構成できない場合は`KeyUnavailable`をprojectionへ保持し、作用観測を全体Rejectedで消さない。これはK7 `AppliedUncertain`の失敗伝達の形に倣い、作用済みの観測をRejectedで消さない。
- **K8-I7 target別negative**：ACに列挙された各targetについて、read-onlyだけからinstruction／要求／authority／永続化／学習への昇格が起きない。
- **K8-I8 taint伝播の限定**：任意のsink graph、暗黙inheritance、label join/meet、declassification規則を定めない。K8は汎用taint伝播型を設計せず、必要な意味は新規要求として生成せず、既存分類宣言・target owner・明示境界の判断だけから扱う。

#### 正常例

外部文書のsourceとproject、revision、data digestを持つ参照をSECURITY current `ClassificationDecl`から分類する。検証器は参照sourceの実bytesを読みdigestを再計算し、現行分類定義に従い、`ObservedLabel{trust:"untrusted", classification:Value(...)}`を返す。read-onlyでは独立したeffect sourceの読取りが`none`を観測し、`validated_transition`はownerの明示した未選択を表す`NotSelected`となる。

明示routeの正例では、target owner参照、current route verifierのK6 receipt、route targetと一致するcurrent K3 `PermissionCheck`、effect sourceから再読した`Value(occurred)`とそのeventのexact bindingが全て揃う。`observed_effect`と`validated_transition`はそれぞれ`Value`になるが、元のinput labelは`untrusted`を保つ。許可判断と作用観測は別の記録である。`observed_effect=Value(none)`、event欠落、またはevent/route/target/permission tuple不一致の場合、`validated_transition`は肯定しない。

#### 反例

- callerがclassificationをplain fieldで指定する、またはsource bytesを読まずにdigestを申告する → K8-I1/I3違反。既存のsource readerとdigest照合を通らず`Value`にしない。
- classificationを決められないfixtureをdefault trusted／既定classificationにする → K8-I2/I3違反。
- read-only結果をinstruction、requirement、authority、persistence、learningのいずれかへ変換する → K8-I4/I7違反。
- callerのplain `outcome="occurred"`、K6 receipt、K3 permission checkだけから実作用を肯定する → K8-I4/I6違反。effect sourceの実読みに基づく観測と分ける。
- effect sourceが作用eventを読んだがrouteまたはK3 permission refが欠ける → `observed_effect=Value(occurred)`を保持し、selected必須参照欠落なら`validated_transition.result=KeyUnavailable`、keyを構成できbinding内容が欠落する場合は`Unknown(missing_input)`。全体を成功、未作用、または単なる`Rejected`に縮退させない。
- route targetが`target_owners`と異なる、current route verifierが不一致、K3 permission checkが別target/action/scope/revision、非肯定またはstale → `validated_transition`は肯定でない。K3既定の照合結果に従う。
- 必須source/project/revision/digest/decl/keyが欠ける → K2 `Rejected(missing_key)`。K1 `Unknown`やdefault labelで代替しない。
- この章から汎用taint graph、全sink伝播、全target共通の新認可条件を作る → K8-I8違反。意味を追加せず既存ownerの分類宣言／明示境界へ戻す。

### 18.6 技術契約の閉鎖範囲

次の技術契約はL4で固定する。SECURITY ownerがcurrent分類定義、AC対象ごとの既存owner ref、route verifier、effect sourceを`ClassificationDecl`で宣言し、固定adapterが`input_heads`に対するfixed prefixから必要sliceを再読する。分類だけのoperationは分類sliceを必須とし、route/effect sliceの未登録で止めない。route verifierはcurrent K6 `VerifierSet`へexact登録されている場合だけ使う。effect sourceはそのsource ownerの既存current readerで実読・digest照合できる場合だけ観測する。明示routeはtarget ownerとroute verifier、再読したoccurred eventを照合し、作用に必要な許可はroute target／実作用tupleへ束縛したK3既存`PermissionCheck`の参照で照合する。K3の許可sourceと実作用sourceは別参照のまま保持する。API callerからsource reader/verifier set/declaration/keyをcurrent rootとして受け取らない。これによりSECURITY分類語彙・target語彙・許可を増やさず、呼出側の自己申告をauthorityへ変換しない。

各operationは自身のrequired-input sliceだけを要求する。分類sliceのcurrent参照がmissing／unknown／staleならclassificationを肯定せず、route/effect sliceがmissing／unknown／staleならroute/effect/transitionを肯定しない。分類operationはroute verifier・target owner・effect source sliceが未登録でも続行する。必要sliceのsource/project/revision/digest/key必須field欠落は、K2 `key_of`前の`Rejected(missing_key)`とする。同一role-bound alias identity内にkind/revision/digestが異なる複数refが集まった場合もK2 keyを作らず、`Rejected(missing_key)`で診断する。異なるside/roleのalias間では保存済み/current参照を共存させ、raw identityの一致だけで拒否しない。これらはL4の読取り・参照・結合契約であり、新しい人間承認やL2要求を追加しない。

## 付録A 引用した現行文書のSHA-256（base `66abf6bf158baebc6bfceb5ccf693d425aae41a9`）

| path | SHA-256 |
|---|---|
| `AGENTS.md` | `386d30378d49b96c055d237ccaa88ed02f3e43359ccfe006e4fd9c96bf5a595c` |
| `CLAUDE.md` | `910635d193d29146e145b1543b8f1398e2b42bdf2bea412d57eddf88874f8d74` |
| `docs/concept/helix-concept.md` | `bbc787c5dc17de9eded156285ad82ef768788cfa31822dfffa477db073a5e715` |
| `docs/governance/decisions/helix-connect-stage1-l3-l10-po-decision-2026-10-05.md` | `30e854580cc45b9b5a5cc793446dc4af83494dba73c8e6c45fb1c6e4a975f9c8` |
| `docs/governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md` | `c7a6d39ceb853fe6c00ccc336ffa7bbbd6c7e87a0aaba172f43f490dd0a7fd23` |
| `docs/governance/decisions/l3-l10-delegation-cross-runtime-review-po-decision-2026-10-08.md` | `27b51768cbf010d201ccc2aafe8e4c893ec5ccb2a9a0bce662af343ef87809ee` |
| `docs/governance/decisions/l4-l6-design-unlock-and-common-kernel-trace-po-decision-2026-10-08.md` | `2ff59b61c775b9e609832f1e93961a4e50c54a959208b9edbc66524e15f0d8f8` |
| `docs/governance/decisions/po-l3-l10-post-confirmation-and-internal-deployment-policy6-2026-10-08.md` | `a5061e7438c4be4ca9d14637ac9f5f04689fb00fd3b7cb7d9d59ae775f7a0571` |
| `docs/governance/decisions/repository-layout-and-source-visibility-po-decision-2026-10-09.md` | `2c700ffcbb89c034d9f0b43a7f69483e785abbef28bb07601857a1d0caa72030` |
| `docs/governance/decisions/stage-release-internal-deployment-po-decisions-2026-10-07.md` | `b7bd5a34fb0c722be49f90a58ba917de65a1dc8d28db36ae9eb86336cbbea0cb` |
| `docs/governance/github-upstream-operating-model.md` | `17168964783c6e8e164e10b653c9c91b16cabe84283d5dfeaa72621b454b69f2` |
| `docs/governance/l3-l10-authoring-layout.md` | `d1fb0c89df30aca6bb828f28e58329d57c40bb7593df540625562b5ac920a7ca` |
| `docs/governance/l3-l10-po-post-confirmation.md` | `8e44d6f001667ef11354f581833e0eab139dd3ef6c63438f71e539d15777d074` |
| `docs/governance/new-generation-start-here.md` | `f77acc1ddf01bd42dddf536b02b7ff562723d2d19e49a937928f640aebe1f86b` |
| `docs/helix-brain/L3-requirements/functional-requirements.md` | `6cf8be0c095fcd5ad5e52b6ee99e607c18d1b26be6f0d2e625e727d868a33cdf` |
| `docs/helix-connect/L3-requirements/functional-requirements.md` | `b3e4a47c0f49978880fc9bae7697d9b67eeaf72a112f821fef167c230c9d2e4b` |
| `docs/helix-harness/L2-requirements/product-requirements.md` | `9c9d499530f4d55c672391614eae6a3ccd6970d69d7c3ebc6e205ead24750c7d` |
| `docs/helix-harness/L3-requirements/functional-requirements.md` | `2180967f0075f467c99a553d34f688a1fdf434703803b1a34e7e147d6a7d2df5` |
| `docs/helix-harness/L4-basic-design/repository-layout.md` | `d7392f86c0c5d1ef8fcbe845ac4940ee3816c5f0687234c0acbc4899dc2b0aa6` |
| `docs/helix-harness/L9-integration-verification/repository-layout-integration-verification.md` | `74d3a76efea15ea048e69991fcada4b018d7a8e5da61405beb68ed78ae1db630` |
| `docs/helix-infrastructure/L3-requirements/functional-requirements.md` | `425d0746efe875dbfbeebc26562adea99a3cdd8e8ef6377a0164bca1d624cc2d` |
| `docs/helix-intelligence/L3-requirements/functional-requirements.md` | `35e936a6d83d7a83310cc2a1900e8f199c54923472df9e9b0d7a9bdeec059457` |
| `docs/helix-labo/L3-requirements/functional-requirements.md` | `362979fc4489c137d7641278a8ea8e55461f3592d56d802bb285ec34abc4a9b8` |
| `docs/helix-os/L3-requirements/functional-requirements.md` | `666200db50ea9a2e7f0d67d57496a71368e497f2fdb6e3485d4838339000b393` |
| `docs/helix-security/L3-requirements/functional-requirements.md` | `f6872a3ee941d63c80a9717bca7e81de832c043ad05cc9ac0c2db77eb264ee9e` |

旧sourceのpathは`archive/legacy-generation-2026-09-14/root/`からの相対pathである。旧sourceのSHA-256は本文bytesを再計算し、資産明細台帳の`source_sha256`と一致することを確かめた。旧資産の個別採否は、本書の区分候補を起点に、`docs/governance/legacy-asset-decisions.jsonl`の判断ログ契約に従って別に記録する。
