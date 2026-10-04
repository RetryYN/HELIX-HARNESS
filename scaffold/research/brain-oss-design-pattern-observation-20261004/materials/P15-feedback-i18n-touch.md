# P15 feedbackとundo・多言語・mobile/touchの観察（D10 UX / Interaction）

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
binding: [SCF-B-0156](../../../bindings/SCF-B-0156.json)
素材の状態：本書の観察はすべて「未評価の候補素材」である。外部repositoryで採られていることは、HELIXでの成立を意味しない。値（閾値、既定値、色、寸法等）は持ち込まない。技術選定・採用推奨ではない。

## 調べたrepository
| repo | URL | 固定commit | ライセンス(SPDX) | archived | 取得日 | 選んだ理由 |
|---|---|---|---|---|---|---|
| formatjs/formatjs | https://github.com/formatjs/formatjs | bc0fd2253f6b8ceb395a80a2a852fa4cd68e2720（default branch: main） | GitHub API の `.license` は null（rootにLICENSEなし）。package単位では `packages/intl-messageformat/package.json` と `packages/react-intl/package.json` が BSD-3-Clause、`packages/icu-messageformat-parser/package.json` が MIT | false | 2026-10-04 | ICU MessageFormat（AST、plural/select）、翻訳が欠けたときのfallback、ソース文言のlintを一つのmonorepoで持っているため |
| i18next/i18next | https://github.com/i18next/i18next | 4ebd19d89111fa558d7086f6be64eb748bad6327（master） | MIT | false | 2026-10-04 | ICUとは別のやり方（keyにsuffixを付けるplural、言語のfallback階層、欠けたkeyの保存）を比べるため |
| emilkowalski/sonner | https://github.com/emilkowalski/sonner | 8e4662b39255120b62138312058f5d77c0139a5e（main） | MIT | false | 2026-10-04 | Web toastのaction/cancel、promiseの状態遷移、timerの一時停止、swipe、live regionを実装しているため |
| material-components/material-components-android | https://github.com/material-components/material-components-android | 60ff09436d5d477a4b9d02940f31eb01e1250620（master） | Apache-2.0 | false | 2026-10-04 | Snackbarのaction、dismiss理由のenum、表示を1件ずつにする管理、a11yに応じたtimeout、Chipのtouch target拡張があるため |
| adobe/react-spectrum | https://github.com/adobe/react-spectrum | 99e610236887da619ad9d54a1cd87983166c043d（main。前回clone済みのcommitと同じ） | Apache-2.0 | false | 2026-10-04 | `usePress` のpointer抽象（virtual click、touch）と、i18nの `isRTL`／`LocalizedStringFormatter` を読むため。前回のform系とは別の箇所 |

## 観察

### P15-O01 ICU MessageFormat のASTと、plural・selectを実行時に解決する構造
- 出典：
  - formatjs、`packages/icu-messageformat-parser/types.ts` 行8–120（https://github.com/formatjs/formatjs/blob/bc0fd2253f6b8ceb395a80a2a852fa4cd68e2720/packages/icu-messageformat-parser/types.ts#L8-L120）
  - `packages/intl-messageformat/formatters.ts` 行116–350（https://github.com/formatjs/formatjs/blob/bc0fd2253f6b8ceb395a80a2a852fa4cd68e2720/packages/intl-messageformat/formatters.ts#L116-L350）
  - `packages/intl-messageformat/core.ts` 行111–212（https://github.com/formatjs/formatjs/blob/bc0fd2253f6b8ceb395a80a2a852fa4cd68e2720/packages/intl-messageformat/core.ts#L111-L212）
  - 信頼性ラベル：primary（公式source repository）。本文確認：済
- 何をしているか：
  - parserは文言を `MessageFormatElement[]` に変換する。要素の種類は `TYPE` enum の literal／argument／number／date／time／select／plural／pound／tag。
  - `PluralElement` は、category名か `=N` をkeyにした `options`、`offset`、`pluralType`（cardinal／ordinal）を持つ。
  - `formatToParts` はASTを再帰的に辿る。plural要素では、まず `=値` の完全一致を探し、無ければ `Intl.PluralRules.select(値 - offset)` が返すcategory、それも無ければ `other` を選ぶ。
  - `#`（pound）は、現在のplural値をlocaleの数値形式で書いた文字列に置き換える。
  - tag要素は、呼出し側が `values` に渡した関数で部品を包む。
  - `IntlMessageFormat` は文言（文字列またはAST）、locale、formatsを受け取り、`Intl.*` のformatterをmemoizeしたcacheを持つ（`core.ts` 行100–107、120–161）。
- 解いている問題と前提：言語によって複数形の分類が違う問題を、文言の中の分岐としてtranslatorに委ねている。前提は、実行環境に `Intl.PluralRules` があること。無い場合は `MISSING_INTL_API` を投げ、polyfillを案内する（行305–313）。
- 必要な入力：
  - 文言の原文（defaultMessage）
  - locale
  - 名前付き書式（`formats` の number／date／time）
  - 全変数の値。値が欠けると `MissingValueError`（行159–162）
- trade-off・失敗の仕方：
  - select・pluralのkey探索に `hasOwnProperty` を使う。`constructor` という値でprototype chainを拾って落ちた不具合（issue #4490、本文確認済。https://github.com/formatjs/formatjs/issues/4490）への防御である（行279–284、299–303）。
  - bigintはPluralRulesに渡す前にnumberへ変換する（行314–316）。
  - 該当optionが無く `other` も無ければ `InvalidValueError` になる。
- 反例・適用しない場合：
  - i18next（P15-O02）は文言の中で分岐せず、keyのsuffixで分岐する。
  - react-aria（P15-O03）は文言を事前に関数へcompileし、実行時にparseしない。
- 互換・非互換：P15-O04（fallback）、P15-O05（lint）と組で使う。P15-O02とは文言の表現が非互換で、変換が必要。
- 限界：ICUの構文を採るかどうかは、HELIXで判断していない。cache戦略やhot pathの最適化は、このrepoの性能の前提に依存する。

### P15-O02 localeのplural categoryをkeyのsuffixにして探す構造
- 出典：
  - i18next、`src/PluralResolver.js` 行4–92（https://github.com/i18next/i18next/blob/4ebd19d89111fa558d7086f6be64eb748bad6327/src/PluralResolver.js#L4-L92）
  - `src/Translator.js` 行461–572（https://github.com/i18next/i18next/blob/4ebd19d89111fa558d7086f6be64eb748bad6327/src/Translator.js#L461-L572）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `PluralResolver.getRule` は、localeと種類（ordinal／cardinal）ごとに `Intl.PluralRules` をcacheする。`getSuffix` は、区切り文字とcategoryをつないだsuffixを返す。
  - `Translator.resolve` は、`count` と `context` の有無から候補keyを組み立てる。候補は、元のkey、plural suffix付き、`_zero`、context付き、context+plural。
  - 候補は最も具体的なものから順に、言語階層（`toResolveHierarchy`）と名前空間のそれぞれで探す（行512–566）。
  - `getSuffixes` は、localeが持つ全categoryを一定の順に並べて返す。定義は `src/PluralResolver.js` 行73–81。欠けたkeyを保存するときにも使う（`src/Translator.js` 行326–339）。
- 解いている問題と前提：plural・文脈による変化を、平坦なkey-value資源のままで表している。前提は、翻訳資源がlocale別のJSONであり、translatorがcategoryごとのkeyを用意すること。
- 必要な入力：
  - 区切り文字（`pluralSeparator`、`contextSeparator`）
  - 対象locale一覧
  - 資源の形（nested か flat か）
- trade-off・失敗の仕方：
  - `Intl` が無いときや、未知のlocaleでは、one／otherの2値に縮めた `dummyRule` に落ちる（行13–18、47–57）。この場合、言語本来のcategoryは失われる。
  - countが0のときは、言語のcategoryとは別に `_zero` keyを探す（Translator.js 行484、534–536）。
  - 名前空間が未loadのまま引かれると警告を出す（行498–509）。
- 反例・適用しない場合：formatjs（P15-O01）は分岐を1つの文言に閉じ込めるので、keyは増えない。
- 互換・非互換：P15-O04（欠けたkeyの扱い）と連動する。P15-O01とは資源の形式が異なる。
- 限界：suffixの命名と区切り文字はこの製品の慣習であり、HELIXへ持ち込まない。

### P15-O03 文言を事前に関数へcompileし、localeの近さで辞書を選ぶ構造
- 出典：
  - react-spectrum、`packages/@internationalized/string/src/LocalizedStringFormatter.ts` 行15–80（https://github.com/adobe/react-spectrum/blob/99e610236887da619ad9d54a1cd87983166c043d/packages/@internationalized/string/src/LocalizedStringFormatter.ts#L15-L80）
  - `packages/@internationalized/string/src/LocalizedStringDictionary.ts` 行45–138（https://github.com/adobe/react-spectrum/blob/99e610236887da619ad9d54a1cd87983166c043d/packages/@internationalized/string/src/LocalizedStringDictionary.ts#L45-L138）
  - `packages/react-aria/src/i18n/useLocalizedStringFormatter.ts` 行22–62（https://github.com/adobe/react-spectrum/blob/99e610236887da619ad9d54a1cd87983166c043d/packages/react-aria/src/i18n/useLocalizedStringFormatter.ts#L22-L62）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `LocalizedString` は、文字列か、`(args, formatter) => string` の関数である。関数のときは、formatterが持つ `plural`／`number`／`select` を呼ぶ（`plural` は `=N`、PluralRulesのcategory、`other` の順に探す）。
  - `LocalizedStringDictionary.getStringsForLocale` は辞書を次の順に探す。
    1. localeの完全一致
    2. language-script（例：sr-Latn）
    3. languageのみ
    4. 同じlanguageで始まる任意のlocale
    5. 既定locale
  - keyが無いときは `Error` を投げる（行48–50）。
  - hookは、辞書をWeakMapにcacheし、localeが変わるとformatterを作り直す。
- 解いている問題と前提：component library自身が持つUI文言（ボタン名、読み上げ文言）を、実行時のparserを入れずに多言語化している。前提は、build時に文言を関数へ変換するpipelineがあり、文言の集合が閉じていて、library作者が管理していること。
- 必要な入力：locale別の文言表、既定locale、package名（global辞書を使う場合）。
- trade-off・失敗の仕方：
  - keyが欠けると例外になる。formatjs・i18nextのように表示を続けるfallbackは無い。
  - global辞書にpackageが無い場合も例外になり、`createLocalizedStringDictionary` への追加を促す（行91–95）。
  - scriptが異なる言語を取り違えないよう、language-scriptの一致を優先している（行118–124のコメント）。
- 反例・適用しない場合：アプリが持つ、開いた文言集合（翻訳vendorとのやり取りがあるもの）には、formatjsの抽出workflow（P15-O05）がある。
- 互換・非互換：P15-O06（方向）と同じlocale contextを共有する。P15-O04のfallback方針とは対照的である。
- 限界：fallbackの順序はこのlibraryの判断である。HELIXでの欠落時の振る舞い（停止か表示継続か）は未決。

### P15-O04 翻訳が欠けたとき・書式が失敗したときのfallback連鎖とエラー通知
- 出典：
  - formatjs、`packages/intl/message.ts` 行122–266（https://github.com/formatjs/formatjs/blob/bc0fd2253f6b8ceb395a80a2a852fa4cd68e2720/packages/intl/message.ts#L122-L266）
  - i18next、`src/Translator.js` 行268–340（https://github.com/i18next/i18next/blob/4ebd19d89111fa558d7086f6be64eb748bad6327/src/Translator.js#L268-L340）
  - i18next、`src/LanguageUtils.js` 行114–193（https://github.com/i18next/i18next/blob/4ebd19d89111fa558d7086f6be64eb748bad6327/src/LanguageUtils.js#L114-L193）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - formatjs の `formatMessage` は、次の順に試す。各失敗は `onError` に `MissingTranslationError` または `MessageFormatError` として渡し、例外にはしない。
    1. 翻訳文を、対象localeで書式化する
    2. defaultMessageを、defaultLocaleで書式化する
    3. 翻訳文を生のまま返す
    4. defaultMessageを生のまま返す
    5. idを返す
  - 対象localeとdefaultLocaleが同じで、defaultMessageがあるときは、欠落を通知しない（行182–190）。
  - i18next は、言語階層を「完全なcode → script → language → fallbackLng」の順に組み立てる（`toResolveHierarchy`）。値が無いときはdefaultValue、それも無ければkeyを返す。
  - `saveMissing` が有効なら、`missingKeyHandler` かbackendへ欠けたkeyを送る。送り先言語は `saveMissingTo`（fallback／all／current）で決まる。pluralの場合はcategoryごとに送る。
- 解いている問題と前提：翻訳が遅れても画面を壊さない。欠落を開発・翻訳のpipelineへ戻す。前提は、source locale文言がcodeの中か既定資源にあること。
- 必要な入力：
  - defaultLocale、fallbackLngの規則（文字列、配列、object、関数）
  - 欠落の報告先（onError、missingKeyHandler）
  - 空文字列の扱い（`fallbackOnEmptyString`、`returnEmptyString`）
- trade-off・失敗の仕方：
  - formatjs は、`Object.create(null)` で作られたmessagesへの対策として `hasOwnProperty.call` を使う（issue #1914 を参照するコメント、行154–159。issue本文は未読）。
  - i18next は、flatな資源をnested前提で引いた可能性を検出して警告する（行284–290）。
  - fallback連鎖のcacheは、配列の破壊的変更でも無効化されるようにkeyを作っている（LanguageUtils.js 行134–139）。
- 反例・適用しない場合：react-aria の辞書（P15-O03）は、keyが欠けると例外にする。
- 互換・非互換：P15-O01、O02と組で使う。P15-O05のlintは、欠落を実行前に減らす側にある。
- 限界：「表示を続ける」と「止める」のどちらを選ぶかは製品の判断であり、HELIXでは未評価。

### P15-O05 ソース文言を使う場所の隣に置き、抽出・lintで翻訳の前提を守る構造
- 出典：
  - formatjs、`docs/src/docs/getting-started/message-declaration.mdx` 行1–8、12–25（https://github.com/formatjs/formatjs/blob/bc0fd2253f6b8ceb395a80a2a852fa4cd68e2720/docs/src/docs/getting-started/message-declaration.mdx#L1-L25）
  - `docs/src/docs/getting-started/application-workflow.mdx` 行25–35、56–65（https://github.com/formatjs/formatjs/blob/bc0fd2253f6b8ceb395a80a2a852fa4cd68e2720/docs/src/docs/getting-started/application-workflow.mdx#L25-L65）
  - `packages/eslint-plugin-formatjs/rules/enforce-plural-rules.ts` 行17–51、98–129（https://github.com/formatjs/formatjs/blob/bc0fd2253f6b8ceb395a80a2a852fa4cd68e2720/packages/eslint-plugin-formatjs/rules/enforce-plural-rules.ts#L17-L129）
  - `rules/no-missing-icu-plural-one-placeholders.ts` 行118–125
  - `rules/prefer-full-sentence.ts` 行150–165
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - docsは、`defaultMessage` と `description`（translator向けの文脈）を使う場所に書くことを推奨している。理由として、使われなくなった文言の自然消滅、文脈依存、toolchainでの検証を挙げる。
  - 抽出工程は、defaultMessageとdescriptionを1つのJSONに集める。そのJSONを翻訳vendorへupload・downloadし、commitする流れが書かれている。
  - eslint ruleはdefaultMessageをparseし、次を検査する。
    - plural categoryの要否・禁止（project設定のLDMLのcategoryのboolean）
    - `one {1 …}` のような固定数値の禁止。説明文は「`one` を他の数にも使うlocaleがある」としている
    - 前後の空白（文字列連結の兆候）
  - 一覧には、他に `no-literal-string-in-jsx`、`no-multiple-plurals`、`enforce-description` などのruleがある（`rules/` を一覧して確認）。
- 解いている問題と前提：翻訳不能な文言の作り方（連結、固定数値、文脈の欠如）を、翻訳前に機械的に止める。前提は、source localeが1つで、そのlocaleの文言をlintすること。
- 必要な入力：source locale、projectが要求するplural category、文言の宣言方法（抽出できる呼出し形）。
- trade-off・失敗の仕方：
  - lintが見るのはsource文言だけで、各翻訳先localeのcategoryの充足は検査対象外（`verifyAst` はdefaultMessageのASTだけを辿る）。
  - parseに失敗すると `parseError` を報告する（行74–86）。
  - docsは「宣言は抽出可能な形に限る」（文字列literal等）と制約している。動的な文言は抽出されない。
- 反例・適用しない場合：react-aria（P15-O03）はlibrary内で閉じた文言表を持ち、この抽出workflowを採っていない。
- 互換・非互換：P15-O01、O04と組で使う。
- 限界：lint ruleの選択とcategoryの設定はproductごとに決めるものであり、HELIXに持ち込まない。

### P15-O06 locale から文字の方向（LTR/RTL）を導く構造と、gestureの方向の論理化
- 出典：
  - react-spectrum、`packages/react-aria/src/i18n/utils.ts` 行13–76（https://github.com/adobe/react-spectrum/blob/99e610236887da619ad9d54a1cd87983166c043d/packages/react-aria/src/i18n/utils.ts#L13-L76）
  - `packages/react-aria/src/i18n/useDefaultLocale.ts` 行24–85（https://github.com/adobe/react-spectrum/blob/99e610236887da619ad9d54a1cd87983166c043d/packages/react-aria/src/i18n/useDefaultLocale.ts#L24-L85）
  - i18next、`src/i18next.js` 行568–651（https://github.com/i18next/i18next/blob/4ebd19d89111fa558d7086f6be64eb748bad6327/src/i18next.js#L568-L651）
  - sonner、`src/index.tsx` 行518–529（https://github.com/emilkowalski/sonner/blob/8e4662b39255120b62138312058f5d77c0139a5e/src/index.tsx#L518-L529）
  - material-components-android、`lib/java/com/google/android/material/behavior/SwipeDismissBehavior.java` 行302–350（https://github.com/material-components/material-components-android/blob/60ff09436d5d477a4b9d02940f31eb01e1250620/lib/java/com/google/android/material/behavior/SwipeDismissBehavior.java#L302-L350）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - react-aria `isRTL` は、次の順に判断する。
    1. `Intl.Locale(...).maximize()` の `getTextInfo()`（古い実装の `textInfo` プロパティも含む）
    2. scriptの集合
    3. languageの集合
  - `getDefaultLocale` は、navigator.language（またはserverから渡されたlocale）から `{locale, direction}` を返す。`languagechange` を購読して更新する。SSRでは固定の既定値を返し、hydration後に更新する。
  - i18next の `dir()` も `getTextInfo` を優先する。その後は、言語の一覧と `-arab`／`-latn` のscript部分から推定する。
  - sonner は、locale ではなく、文書の `dir` 属性または計算済みstyleから方向を取る。
  - MDC の swipe は方向を start/end の論理方向で指定し、`View.LAYOUT_DIRECTION_RTL` のときに物理方向を反転する。
- 解いている問題と前提：RTL言語でのlayoutとgestureの向き。
  - react-aria／i18next は、locale が方向の正本だという前提に立つ。
  - sonner は、host文書のdirが正本だという前提に立つ。
  - MDC は、View の layout direction が正本だという前提に立つ。
- 必要な入力：方向の正本をどこに置くか（locale、文書属性、view階層のどれか）。
- trade-off・失敗の仕方：
  - react-aria のコメントは、script推定を「言語推定より正確」としている。言語は複数のscriptで書かれるためである（行66–67）。
  - i18next は、lngが無いとき `'rtl'` を返す（行570）。意図はcodeからは読めない。
  - sonner の既定のswipe方向は位置の文字列（top/bottom/left/right）だけで決まり（`index.tsx` 行49–61）、dirを参照していない。
- 反例・適用しない場合：sonner は locale の判定を持たず、host に委ねている。
- 互換・非互換：P15-O11（swipe）、P15-O03（同じlocale context）と関係する。
- 限界：RTL言語・scriptの一覧はrepoごとに異なる。値はHELIXに持ち込まない。

### P15-O07 取消可能な操作の通知：action付きの一時通知と、dismiss理由の通知（undoそのものは呼出し側の責務）
- 出典：
  - material-components-android、`lib/java/com/google/android/material/snackbar/BaseTransientBottomBar.java` 行124–165（https://github.com/material-components/material-components-android/blob/60ff09436d5d477a4b9d02940f31eb01e1250620/lib/java/com/google/android/material/snackbar/BaseTransientBottomBar.java#L124-L165）
  - `lib/java/com/google/android/material/snackbar/Snackbar.java` 行357–377（https://github.com/material-components/material-components-android/blob/60ff09436d5d477a4b9d02940f31eb01e1250620/lib/java/com/google/android/material/snackbar/Snackbar.java#L357-L377）
  - `lib/java/com/google/android/material/snackbar/SnackbarManager.java` 行74–142、204–245（https://github.com/material-components/material-components-android/blob/60ff09436d5d477a4b9d02940f31eb01e1250620/lib/java/com/google/android/material/snackbar/SnackbarManager.java#L74-L245）
  - `docs/components/Snackbar.md` 行17–24、180–196（https://github.com/material-components/material-components-android/blob/60ff09436d5d477a4b9d02940f31eb01e1250620/docs/components/Snackbar.md#L17-L196）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `BaseCallback.onDismissed(bar, event)` は、閉じた理由を `DISMISS_EVENT_SWIPE`／`ACTION`／`TIMEOUT`／`MANUAL`／`CONSECUTIVE` で渡す。
  - `setAction` は、listenerを呼んだ直後に `DISMISS_EVENT_ACTION` で閉じる。textが空かlistenerがnullなら、actionを隠す。
  - `SnackbarManager` はsingletonで、`currentSnackbar` と `nextSnackbar` の2枠だけを持つ。新しい表示要求が来ると現在の表示を `CONSECUTIVE` で閉じ、閉じ終わった（`onDismissed`）後に次を出す。
  - recordはcallbackを `WeakReference` で持ち、消えたviewは飛ばす。
  - docsは用途を「直前の操作の取消（undo）や失敗した操作のretry」と書いている。
  - library 側にundoの状態やrollbackの機構は無い。理由のenumを受けて確定するか戻すかは、呼出し側が決める。
- 解いている問題と前提：画面を遮らない短い通知で、直前の操作を取り消す機会を出す。前提は、一度に表示するのは1件で、新しい通知が古い通知を置き換えること。
- 必要な入力：
  - 取り消せる操作の確定時期（timeout、swipe、置換で閉じたときに確定するか）
  - action文言
  - 表示期間の種別（短い、長い、無期限、ms指定）
- trade-off・失敗の仕方：
  - 置き換え（CONSECUTIVE）で前の通知のactionは押せなくなる。そのため、閉じた理由で処理を分けない呼出し側は、確定や取消を取りこぼしうる。
  - timeoutの予約はrecordに紐づき、取消時に `removeCallbacksAndMessages` で消す（行204–213）。
- 反例・適用しない場合：sonner（P15-O08）は、複数のtoastを同時に積み、閉じた理由をenumではなく別々のcallbackで分ける。
- 互換・非互換：P15-O09（timer）、P15-O10（a11y）、P15-O11（swipe）と組で使う。
- 限界：期間の既定値（`SHORT_DURATION_MS` 等）は持ち込まない。undoの確定方式はHELIXで未決。

### P15-O08 id で更新・取り消しできる通知のstoreと、非同期処理の状態遷移（loading→success/error）
- 出典：
  - sonner、`src/state.ts` 行13–168、196–312（https://github.com/emilkowalski/sonner/blob/8e4662b39255120b62138312058f5d77c0139a5e/src/state.ts#L13-L312）
  - `src/index.tsx` 行192–201、476–515、657–695（https://github.com/emilkowalski/sonner/blob/8e4662b39255120b62138312058f5d77c0139a5e/src/index.tsx#L476-L515）
  - `src/types.ts` 行57–81（https://github.com/emilkowalski/sonner/blob/8e4662b39255120b62138312058f5d77c0139a5e/src/types.ts#L57-L81）
  - issue #172（https://github.com/emilkowalski/sonner/issues/172、本文とcommentを確認済）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - module-levelのsingleton `Observer` が `toasts`、`dismissedToasts`、`pendingDismissals` を持つ。subscriberの `Toaster` へpublishする。
  - `create` は、idが既にあれば更新、無ければ追加する。dismiss済みのidなら古い項目を捨て、新規として扱う（`action` 等の古いpropsが漏れないため。行107–112）。
  - `dismiss` は、次のframeで配る形に遅らせる。同じidの `create` が先に来れば、dismissを取り消す（StrictModeの二重effect対策と、コメントに書かれている。行93–102）。
  - `promise` は、loading toastを作る。結果に応じて同じidをsuccess・errorへ書き換える。HTTP Response風で `ok=false` の場合もerror扱いにする。結果の表示が無ければdismissする。`unwrap` で元の結果を返す。
  - action click は `action.onClick` を呼び、`event.defaultPrevented` でなければ閉じる。cancel は `dismissible` のときだけ動く。
  - 閉じる経路ごとにcallbackが分かれる。
    - timeout → `onAutoClose`
    - 閉じるボタン・swipe・programmatic dismiss → `onDismiss`
    - action click → 読んだ範囲では、`onDismiss` を直接呼ぶ行は無い
  - 履歴は上限付きで刈り込むが、表示中のものは消さない（行66–80）。
- 解いている問題と前提：アプリのどこからでも1つの関数で通知を出し、非同期処理の進行を同じ通知の中で見せる。前提は、Reactのsingle page、全体で1つのstore、`Toaster` の描画前に作られたtoastの再生（`subscribe` 行45–48）。
- 必要な入力：
  - toastのid（更新・重複防止をしたい場合）
  - loading／success／errorの文言
  - actionを押した後も通知を残すかどうか
- trade-off・失敗の仕方：
  - issue #172 は「dismissible=false でもactionで閉じる」という報告である。対処は `event.preventDefault()` による抑止とdocsの明確化だった。後続のcommentには、別の利用経路で効かないという報告がある。
  - 履歴を無制限に持つと、JSXを抱えたまま増え続けるとコメントに書かれている（行15–16）。
- 反例・適用しない場合：MDC（P15-O07）は表示を1件にし、閉じた理由をenumにまとめる。
- 互換・非互換：P15-O09、O10、O11と組で使う。
- 限界：履歴の上限値、unmountまでの時間などの数値は持ち込まない。

### P15-O09 interaction・画面非表示・支援技術の利用中は、自動で閉じるtimerを止める・延ばす
- 出典：
  - sonner、`src/index.tsx` 行203–241（https://github.com/emilkowalski/sonner/blob/8e4662b39255120b62138312058f5d77c0139a5e/src/index.tsx#L203-L241）
  - sonner、`src/hooks.tsx` 行3–15
  - MDC、`SnackbarManager.java` 行144–160、223–237（https://github.com/material-components/material-components-android/blob/60ff09436d5d477a4b9d02940f31eb01e1250620/lib/java/com/google/android/material/snackbar/SnackbarManager.java#L144-L237）
  - MDC、`BaseTransientBottomBar.java` 行858–880、1428–1460（https://github.com/material-components/material-components-android/blob/60ff09436d5d477a4b9d02940f31eb01e1250620/lib/java/com/google/android/material/snackbar/BaseTransientBottomBar.java#L1428-L1460）
  - MDC、`Snackbar.java` 行453–472（https://github.com/material-components/material-components-android/blob/60ff09436d5d477a4b9d02940f31eb01e1250620/lib/java/com/google/android/material/snackbar/Snackbar.java#L453-L472）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - sonner は、残り時間をrefに持つ。展開中（expanded）、操作中（interacting）、`document.hidden` の間は経過分を差し引いて止め、終わったら再開する。
  - sonner は、loading中と無期限のtoastではtimerを張らない。`setTimeout(Infinity)` が即時実行になる問題をコメントで避けている（行220–223）。
  - MDC は、`pauseTimeout`／`restoreTimeoutIfPaused` を2つのタイミングで呼ぶ。
    - touch down・up（BehaviorDelegate）
    - swipeの drag・settle・idle
  - `Snackbar.getDuration` は、API Q 以上では `AccessibilityManager.getRecommendedTimeoutMillis` に、action有無のflagを付けて問い合わせる。それより前では、actionがありtouch explorationが有効なら無期限にする。
- 解いている問題と前提：利用者がactionに届く前に通知が消えることを防ぐ。前提は、OSやbrowserが状態の信号（visibilitychange、AccessibilityManager）を出すこと。
- 必要な入力：一時停止させる条件の一覧、支援技術の利用中に延長するかどうか。
- trade-off・失敗の仕方：
  - sonner のtimerは、hover・focus（expanded／interacting）とtabの可視性で止まる。支援技術の検出によるtimeoutの延長は、読んだ範囲には無い。
  - MDC は、OSの推奨値にtimeoutを委ねている。そのため、アプリ側の指定値はそのままでは使われない場合がある。
- 反例・適用しない場合：MDC には、Webのvisibilitychangeに当たる処理は読んだ範囲に無い。sonner には、OSのa11y推奨timeoutに当たる処理が無い。
- 互換・非互換：P15-O07、O08、O10と組で使う。
- 限界：期間・時間の値は持ち込まない。

### P15-O10 一時通知をlive regionで読み上げ、支援技術の利用時は動きを抑える
- 出典：
  - sonner、`src/index.tsx` 行784–793（https://github.com/emilkowalski/sonner/blob/8e4662b39255120b62138312058f5d77c0139a5e/src/index.tsx#L784-L793）
  - sonner、`src/index.tsx` 行750–770（hotkeyでの展開・Escape）
  - issue #306（https://github.com/emilkowalski/sonner/issues/306）、#620（https://github.com/emilkowalski/sonner/issues/620）。いずれも本文確認済
  - MDC、`BaseTransientBottomBar.java` 行383–384、1114–1123（https://github.com/material-components/material-components-android/blob/60ff09436d5d477a4b9d02940f31eb01e1250620/lib/java/com/google/android/material/snackbar/BaseTransientBottomBar.java#L1114-L1123）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - sonner は、常に描画されている `section` に `aria-live="polite"`、`aria-relevant="additions text"`、`aria-atomic="false"` を付ける。通常のtab順からは外し（tabIndex=-1）、hotkeyでfocusして展開する。
  - MDC は、viewにpoliteなlive regionを設定する。音声feedback系のa11y serviceが有効なときは、出入りのanimationを省く（`shouldAnimate`）。
- 解いている問題と前提：視覚に頼らない利用者に、一時通知の追加を伝える。
- 必要な入力：通知の緊急度の区分（polite／assertive）、通知の領域へのkeyboardでの到達経路、読み上げ文言の多言語化。
- trade-off・失敗の仕方：
  - issue #306 は、toastごとの `role=status` の要素が、toastがあるときだけ存在していたため、一部の読み上げ器が告知を逃した失敗の報告である。常に存在する容器にliveの属性を移す案が採られた。同じissueでは、固定の英語の `aria-label` が多言語のsiteで問題になると指摘されている。
  - issue #620 は、緊急の通知を `alertdialog` にする要望である。portal構造上対応できないとして閉じられた。
- 反例・適用しない場合：緊急の通知（alertdialog）は、両repoとも一時通知の範囲外としている。
- 互換・非互換：P15-O07〜O09と組で使う。P15-O03（読み上げ文言の多言語化）と関係する。
- 限界：ARIAの具体設定の妥当性は、HELIXでは未評価。

### P15-O11 pointerの種類を抽象化したpress、およびswipe・touch targetの扱い
- 出典：
  - react-spectrum、`packages/react-aria/src/interactions/usePress.ts` 行54–89、540–590、655–711、929–991（https://github.com/adobe/react-spectrum/blob/99e610236887da619ad9d54a1cd87983166c043d/packages/react-aria/src/interactions/usePress.ts#L540-L711 、#L929-L991）
  - `packages/react-aria/src/utils/isVirtualEvent.ts` 行18–58（https://github.com/adobe/react-spectrum/blob/99e610236887da619ad9d54a1cd87983166c043d/packages/react-aria/src/utils/isVirtualEvent.ts#L18-L58）
  - issue #1513（https://github.com/adobe/react-spectrum/issues/1513、本文確認済）
  - sonner、`src/index.tsx` 行314–427（https://github.com/emilkowalski/sonner/blob/8e4662b39255120b62138312058f5d77c0139a5e/src/index.tsx#L314-L427）
  - MDC、`lib/java/com/google/android/material/chip/Chip.java` 行2258–2334（https://github.com/material-components/material-components-android/blob/60ff09436d5d477a4b9d02940f31eb01e1250620/lib/java/com/google/android/material/chip/Chip.java#L2258-L2334）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - **usePress**
    - mouse、touch、pen、keyboard、virtual（支援技術や `element.click()`）を1つの `PressEvent`（pointerType付き）にまとめる。
    - 押下状態、対象、pointerId、合成されたmouse eventを無視するflagを `PressState` に持つ。
    - `isVirtualClick`／`isVirtualPointerEvent` は、event の detail、幅・高さ、pressure、pointerTypeの組合せから支援技術由来の操作を推定する。Android TalkBackは別判定にしている。
    - pointerupの直後には確定せず、clickを待つ。DOMの変更による誤配送への対策で、issue #1513 は背後の要素にもpointerが届く報告である。
    - long press後にclickが来ないmobileでは、遅延した合成clickで補う。
    - 実ブラウザの経路では、pointer eventの `pointercancel` を購読し（行585–590）、dragStartでも取り消す（`onDragStart`、行701–707。SafariはdragStart時にpointercancelを出さないため、とコメントにある）。scroll自体を購読して取り消すのは、`process.env.NODE_ENV === 'test'` のときだけ使われるfallback分岐（行709–711に「unit test専用」とのコメント）の記述である（`onScroll` 行929–939）。
    - double-tap zoom の遅延を避けるため、`touch-action` のstyleを注入する。`manipulation` はSafariでscroll時のpointercancelを壊すため使わない、とコメントにある（行980–982）。
  - **sonner の swipe**
    - pointer captureを取る。最初の移動で軸（x/y）を固定する。許可しない方向への移動には減衰をかける。
    - 移動量か速度が閾値を超えたら閉じる。
    - buttonの上で始まった押下はswipeにしない。右clickは無視する。
  - **MDC Chip**
    - `ensureMinTouchTargetSize` が有効で、描画上のサイズが最小target未満のときは、`InsetDrawable` で背景を内側に寄せる。そのうえで、viewの最小幅・高さを広げる。見た目の大きさと当たり判定の大きさを分けている。
- 解いている問題と前提：pointer・touch・支援技術でのbrowserやOSごとの差を、componentごとに個別に扱わないようにする。前提は、Pointer Eventsが使えること。testだけはJSDOM向けにmouse/touchのfallbackを持つ（行710–711のコメント）。
- 必要な入力：
  - pointerがtargetの外へ出たら取り消すか（`shouldCancelOnPointerExit`）
  - press時にfocusを移すか、text選択を許すか
  - gestureの許可方向
  - 最小touch targetを満たすかどうかの方針
- trade-off・失敗の仕方：
  - コードのコメントには、browser・OSの不具合への回避策が多数ある（WebKit・Chromium のbug番号を参照）。browserの挙動が変わると回避策が陳腐化する。
  - 支援技術の推定は経験則であり、誤判定の余地がある（isVirtualEvent.ts のコメントが条件の理由を説明している）。
  - MDC のtarget拡張は既定で無効（attrの既定値はfalse。値そのものは持ち込まない）。
- 反例・適用しない場合：
  - sonner は、press抽象を持たず、Pointer Eventsを直接扱う。
  - MDC は、touchの扱いをAndroid View（CoordinatorLayout Behavior）に委ねている。
- 互換・非互換：P15-O06（gesture方向のRTL）、P15-O09（touch中のtimer停止）と組で使う。
- 限界：閾値、遅延のms、速度、寸法は持ち込まない。

## 同じ問題の解き方の比較
| 問題 | repoA のやり方 | repoB のやり方 | 違いが生じる前提 |
|---|---|---|---|
| 複数形の表し方 | formatjs：1つの文言の中にICUの `plural {…}` 分岐を持ち、実行時にparseする（O01） | i18next：categoryごとに別key（suffix）を持つ（O02）。react-aria：事前に関数へcompileし、`plural()` を呼ぶ（O03） | 文言の集合が開いているか（vendorの翻訳）閉じているか（library内）。資源の形式。実行時にparserを持つか |
| 翻訳が欠けたとき | formatjs：defaultMessage→生の文→idへ落とし、onErrorで通知（O04） | i18next：言語階層→defaultValue→key、saveMissingで欠落を送る（O04）。react-aria：例外（O03） | 表示を続けることを優先するか、欠落を開発時に止めることを優先するか |
| 方向の正本 | react-aria／i18next：localeから導く（`getTextInfo` を優先し、script・言語で推定）（O06） | sonner：文書の `dir`・計算済みstyle。MDC：View の layout direction（O06） | libraryがlocaleを知っているか、hostに委ねるか |
| 取消可能な通知と閉じた理由 | MDC：理由のenumを1つのcallbackへ渡す。表示は1件で、新しい要求が置き換える（O07） | sonner：理由ごとに別callback（onAutoClose／onDismiss）。複数を同時に積み、idで更新する（O08） | 同時表示の方針（1件か複数か）、platformの慣習 |
| actionを押した後の扱い | MDC：listenerを呼んだ後、常に閉じる（ACTION理由） | sonner：既定では閉じる。`preventDefault` で残せる（issue #172） | actionの後に通知を状態表示（loading等）へ遷移させる用途を持つか |
| 自動で閉じるtimerの停止 | sonner：hover・focus・tabの非表示で停止（O09） | MDC：touch・swipe中は停止し、OSのa11y推奨timeoutに委ねる（O09） | Web と OS で取れる信号の違い |
| swipeの方向 | sonner：位置の文字列から物理方向を決める（dirを参照しない） | MDC：start/endの論理方向をRTLで反転（O06、O11） | layoutの方向をcomponentが知っているか |
| pointerの差 | react-aria：pressへ抽象化し、virtualを推定し、clickを待つ（O11） | sonner：Pointer Eventsを直接扱う。MDC：Viewのtouchに委ねる | 汎用のcomponent基盤か、単一のcomponentか |

## 見つからなかったこと・gap
- **undoそのものの実装**：MDC・sonnerとも、通知とactionの導線を提供するだけで、取り消すための状態保持・rollback・確定の遅延（遅延commit、楽観的更新の巻き戻し）はlibrary外であった。undoのdomain側の型は、今回の範囲では観察できていない。
- **Fluent（projectfluent）と MessageFormat 2（unicode-org/message-format-wg）**：今回は読んでいない。ICU（O01）とsuffix方式（O02）以外の文言モデル（関数呼出し、term参照、MF2のdata model）は未観察。
- **locale別の書式**：数値・日付は `Intl.*` に委ねる構造を確認しただけで、formatjs のpolyfill群（`packages/intl-numberformat` 等）の中身は読んでいない。
- **RTLの双方向テキスト（bidi isolation）**：変数を差し込む際のisolation制御文字の扱いは、読んだ範囲には無かった。
- **touch target**：最小寸法を保証する観察はMDC Chip の1箇所だけ。Web側（react-aria、sonner）でtarget sizeを保証するcodeは見ていない。
- **sonner の action click 経路**：`onDismiss`／`onAutoClose` のどちらが呼ばれるかの全経路は追い切れていない。removeToast → dismiss の経路（`index.tsx` 行657–675）からの推定にとどまる。

## 検索範囲と結果（読んだpath、検索した語、読んでいないもの）
- **formatjs**（固定commit bc0fd22…）
  - 読んだ：`packages/icu-messageformat-parser/types.ts` 1–120、`packages/intl-messageformat/formatters.ts` 全体、`core.ts` 100–230、`packages/intl/message.ts` 60–266、`packages/eslint-plugin-formatjs/rules/enforce-plural-rules.ts` 1–140
  - 部分的に読んだ：`no-missing-icu-plural-one-placeholders.ts` 118–130、`prefer-full-sentence.ts` 150–165
  - docsで読んだ：`getting-started/application-workflow.mdx` 1–75、`message-declaration.mdx` 1–60
  - rule一覧を `ls` した。
  - issue #4490 の本文を読んだ。#1914 はコード中のコメントとして参照しただけで、本文は未読。
- **i18next**（4ebd19d…）
  - 読んだ：`src/PluralResolver.js` 全体、`src/Translator.js` 260–340・461–580、`src/LanguageUtils.js` 110–196、`src/i18next.js` 565–651
  - 読んでいないもの：Interpolator、Formatter、BackendConnector
- **sonner**（8e4662b…）
  - 読んだ：`src/state.ts` 全体、`src/hooks.tsx` 全体、`src/types.ts` 55–82、`src/index.tsx` 49–61・190–262・300–330・428–442・470–530・655–700・740–800
  - grepした語：pause、swipe、action、aria-live、hotkey
  - issue #172、#306、#620 の本文とcommentを読んだ。CSS（`styles.css`）は読んでいない。
- **material-components-android**（60ff094…、sparse checkout）
  - 読んだ：`snackbar/SnackbarManager.java` 25–246、`BaseTransientBottomBar.java` 120–170・380–385・845–882・1105–1145・1425–1460、`Snackbar.java` 340–380・445–475、`behavior/SwipeDismissBehavior.java` 298–350、`chip/Chip.java` 2255–2385、`docs/components/Snackbar.md` 15–26・108–145・180–220
  - 読んでいないもの：テスト、MaterialButton、Snackbarのlayout resource
- **react-spectrum**（99e6102…、前回のcloneにsparse pathを追加）
  - 読んだ：`packages/react-aria/src/interactions/usePress.ts` 1–140・540–590・655–711・925–1000、grepで要所、`utils/isVirtualEvent.ts` 全体、`i18n/utils.ts` 全体、`i18n/useDefaultLocale.ts` 全体、`i18n/useLocalizedStringFormatter.ts` 全体、`@internationalized/string/src/LocalizedStringFormatter.ts` 全体、`LocalizedStringDictionary.ts` 40–150
  - issue #1513 の本文を読んだ。
  - 読んでいないもの：useLongPress、useMove、I18nProvider、build時に文言を関数へcompileするtool
- **実行していないもの**：外部repositoryのcode、script、test、build、install、hookは一切実行していない。cloneは `--filter=blob:none` で取得し、checkoutには `core.hooksPath=/dev/null` を指定した。
- **gh api の呼出し**：20回程度。

## BRAINの属性について未決の事項（由来の種類、scope、評価根拠、版、状態）
- **由来の種類**：全観察が外部OSSの一次source（code・docs・issue）である。issue（sonner #172・#306・#620、formatjs #4490、react-spectrum #1513）は「失敗・trade-offの根拠」という別の種類として区別するかどうかが未決。
- **scope**：O01〜O06（多言語）、O07〜O10（feedback・undo）、O11（pointer・touch）を、D10 UX／Interaction の下位のどの単位に置くかが未決。O06はi18nとgestureの両方にまたがる。
- **評価根拠**：全件が未評価の候補素材である。HELIXで成立するかの検証は行っていない。外部repoでの採用・成功を、HELIXでの成功とはみなさない（HELIXBRAIN-L2-026／027の2.0経路の対象）。
- **版**：各観察は上表の固定commit SHAにのみ結び付く。将来upstreamが変わったときに、観察を再照合する方法（SHAの更新か、別記録か）が未決。
- **状態**：全件「未評価」。登録・採否は行っていない。formatjs はrootのSPDXがnullで、package単位でlicenseが異なる。このようなlicense表記をBRAINの属性としてどう持つかが未決。
