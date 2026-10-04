# P07 Formと情報構造の観察（D10 UX / Interaction、D04 Frontend）

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
binding: [SCF-B-0156](../../../bindings/SCF-B-0156.json)
素材の状態：本書の観察はすべて「未評価の候補素材」である。外部repositoryで採られていることは、HELIXでの成立を意味しない。値（閾値、既定値、色、寸法等）は持ち込まない。技術選定・採用推奨ではない。

## 調べたrepository
| repo | URL | 固定commit | ライセンス(SPDX) | archived | 取得日 | 選んだ理由 |
|---|---|---|---|---|---|---|
| alphagov/govuk-frontend | https://github.com/alphagov/govuk-frontend | 283cc58ead97f3e3379199976709713914e00b05 (main) | MIT | false | 2026-10-04 | error summaryのfocus移動、error messageとfieldの関連付け、character countの実装がある |
| alphagov/govuk-design-system | https://github.com/alphagov/govuk-design-system | d1b51e67c01d841d7cba58a29ef1f74384cb7b34 (main) | MIT | false | 2026-10-04 | validationのtiming、question pages（one thing per page）、check answers、task list、navigationのpattern文書がある |
| x-govuk/govuk-form-builder | https://github.com/x-govuk/govuk-form-builder | f16a8adb4528208f8436ee3271038dfc3b5ee009 (main) | MIT | false | 2026-10-04 | server側のerror集合からerror summaryとfield idを生成する実装（GOV.UK patternのserver側実装）がある |
| react-hook-form/react-hook-form | https://github.com/react-hook-form/react-hook-form | 09a889c14c4f08472664e1d06f50eb06d3dea42b (master) | MIT | false | 2026-10-04 | validation modeの状態機械、dirty/touched/submittingのformState、submit時focusの実装がある |
| final-form/final-form | https://github.com/final-form/final-form | 2a5cc026c21d9487a403a1025dcea3e0f68f1dea (main) | API上はNOASSERTION（LICENSE本文はMIT License） | false | 2026-10-04 | framework非依存のfield flag model（active/visited/touched/modified/dirty）とsubmit errorの分離がある |
| adobe/react-spectrum（react-aria） | https://github.com/adobe/react-spectrum | 99e610236887da619ad9d54a1cd87983166c043d (main) | Apache-2.0 | false | 2026-10-04 | realtime validationとdisplay validationの分離、native constraint validationとの統合、server errorの扱いがある |

注：ministryofjustice/moj-frontendは読んでいない（x-govukで代えた）。final-formのSPDXはGitHub APIでNOASSERTIONと返ったが、`LICENSE`の1行目は「MIT License」だった。

## 観察

### P07-O01 送信時だけvalidateし、server側validationを必須にする（GOV.UK validation pattern）
- 出典：alphagov/govuk-design-system、`src/patterns/validation/index.md` 行68–76、78–92、94–103（https://github.com/alphagov/govuk-design-system/blob/d1b51e67c01d841d7cba58a29ef1f74384cb7b34/src/patterns/validation/index.md#L68-L103）。同 行51–66（https://github.com/alphagov/govuk-design-system/blob/d1b51e67c01d841d7cba58a29ef1f74384cb7b34/src/patterns/validation/index.md#L51-L66）。信頼性ラベル：primary（公式source repository、設計文書）。本文確認：済
- 何をしているか：field離脱時にvalidateせず、利用者がserviceの次の段階へ進もうとした時点（continue／submit）でvalidateする（行70）。入力途中のvalidationは原則避け、user researchで利点が上回ると示された場合に限る（行72–76）。server側validationは常に要り、client側は利用者需要がある場合に限って足す（行85–87）。HTML5 validationは切り、`novalidate`を付け、`required`も付けない（行94–103）。error時の表示は、入力値を保ったまま同じpageを再表示し、`<title>`の先頭に「Error: 」を付け、error summaryをpage上部に置いてfocusを移し、各fieldの横にerror messageを出す（行53–58）。
- 解いている問題と前提：入力の遅い利用者への妨害（行72）、client側validationがJS失敗や回避で働かない場合（行85）、client側とserver側の規則が食い違う危険（行92）。page単位でserverへ往復する多段formが前提。
- 必要な入力：validation規則をserver側に持つこと。「次の段階へ進む」動作がpage単位で定まっていること。
- trade-off・失敗の仕方：文書自体が、`required`を付けないことがscreen reader利用者に問題を起こすかは調査中と書いている（行111）。client側validationの需要を持つteamからの研究を募っている（行109）。
- 反例・適用しない場合：character countだけは入力中に表示する例外として挙げている（行74、P07-O09）。react-ariaは「commit時（blur等）」を既定の表示timingにしている（P07-O07）。react-hook-formはtimingをmodeで選ばせる（P07-O05）。
- 互換・非互換：P07-O02、O03、O04と一体で使われる。P07-O07のnative constraint validation利用とは、HTML5 validationを使うかで衝突する。
- 限界：GOV.UKの公共serviceと利用者研究を前提にした記述であり、HELIXで同じ効果が出ることを意味しない。

### P07-O02 error summaryへのfocus移動と、label・legendを見せてからfieldへfocusする
- 出典：alphagov/govuk-frontend、`packages/govuk-frontend/src/govuk/components/error-summary/error-summary.mjs` 行13–29、63–91、109–152（https://github.com/alphagov/govuk-frontend/blob/283cc58ead97f3e3379199976709713914e00b05/packages/govuk-frontend/src/govuk/components/error-summary/error-summary.mjs#L13-L152）。同 `template.njk` 行7–9、19–33（https://github.com/alphagov/govuk-frontend/blob/283cc58ead97f3e3379199976709713914e00b05/packages/govuk-frontend/src/govuk/components/error-summary/template.njk#L7-L33）。設計文書：alphagov/govuk-design-system `src/components/error-summary/index.md` 行20–31、39–59（https://github.com/alphagov/govuk-design-system/blob/d1b51e67c01d841d7cba58a29ef1f74384cb7b34/src/components/error-summary/index.md#L20-L59）。信頼性ラベル：primary。本文確認：済
- 何をしているか：`ErrorSummary`（`ConfigurableComponent`の派生）は、初期化時に`disableAutoFocus`が偽なら自分のroot要素へ`setFocus`する（行24–26）。summary内のlink clickを横取りし（`handleClick`）、`focusTarget`がlinkのhashからinput要素を引いて、関連するlegendかlabelを`scrollIntoView`した後でinputを`preventScroll`付きでfocusする（行63–91）。`getAssociatedLegendOrLabel`は、radio・checkboxなら常にfieldsetのlegendを使い、それ以外はlegendとinputの距離がviewportに対して一定以内ならlegend、そうでなければ`label[for]`か祖先labelを返す（行109–152）。templateは`role="alert"`を別の子要素に置く（行7–9）。errorListの各項目は`href`があればlinkにする（行22–30）。設計文書は、errorが1件でも常にsummaryを出すこと、見出しの文言、各回答へのlink、field横のmessageと同じ文言にすること（行20–29）、複数fieldの質問では最初の誤りfieldへ、radio・checkboxでは最初の選択肢へlinkすること（行47–53）、breadcrumbs・back linkの下で`<h1>`の上に置くこと（行59）を決めている。
- 解いている問題と前提：browser既定のanchor移動ではlabelが画面外に出て文脈なしでinputが見える問題と、NVDAでlabelが読まれない問題（行44–58のコメント）。focusとalertの読み上げが競合する問題（templateのコメント 行7–8）。
- 必要な入力：各fieldが一意な`id`を持つこと。summaryの各項目が対応するfield idを`href`に持つこと。label・legendの関連付けがmarkup上で済んでいること。
- trade-off・失敗の仕方：コード内のlegend採否は画面上の位置計算に依存し、計算できないbrowserではlabelへ退避する（行136–144）。issue #2055（open）：NVDA＋Firefoxで同じ不正formを2回送るとsummaryにfocusが当たらない（https://github.com/alphagov/govuk-frontend/issues/2055）。issue #2072（open）：Safari＋VoiceOverでsummaryのlistが読まれない（https://github.com/alphagov/govuk-frontend/issues/2072）。issue #2657（closed）：JAWSで見出しだけ読まれlistが読まれない（https://github.com/alphagov/govuk-frontend/issues/2657）。読み上げは支援技術とbrowserの組合せで変わる。
- 反例・適用しない場合：react-hook-form（P07-O06）とreact-aria（P07-O07）はsummaryを持たず、最初の誤りfield自体へfocusする。`disableAutoFocus`でfocus移動を止められる（行166–180）。
- 互換・非互換：P07-O03（field側のerror message）、P07-O04（server側でのsummary生成）と組む。P07-O06・O07の「fieldへ直接focus」とは、focusの行き先で両立しない。
- 限界：位置判定に使う比率など寸法に関わる値は持ち込まない。支援技術での挙動はissueが示すとおり未解決のものがある。

### P07-O03 error messageをhint・labelとともに`aria-describedby`で連結し、隠しprefixを付ける
- 出典：alphagov/govuk-frontend、`packages/govuk-frontend/src/govuk/components/input/template.njk` 行18–19、89–110（https://github.com/alphagov/govuk-frontend/blob/283cc58ead97f3e3379199976709713914e00b05/packages/govuk-frontend/src/govuk/components/input/template.njk#L89-L110）。`error-message/template.njk` 行3–12（https://github.com/alphagov/govuk-frontend/blob/283cc58ead97f3e3379199976709713914e00b05/packages/govuk-frontend/src/govuk/components/error-message/template.njk#L3-L12）。設計文書：govuk-design-system `src/components/error-message/index.md` 行24–28、36–52、70–72（https://github.com/alphagov/govuk-design-system/blob/d1b51e67c01d841d7cba58a29ef1f74384cb7b34/src/components/error-message/index.md#L24-L72）。信頼性ラベル：primary。本文確認：済
- 何をしているか：input templateは、利用者指定の`describedBy`にhint id（`<id>-hint`）とerror id（`<id>-error`）を順に連結し、input要素の`aria-describedby`にする（input 行91、102）。errorがあるとform groupとinputにerror classを付ける。error message templateは、隠しtext（既定は英語の「Error」、`visuallyHiddenText`で差し替えや無効化ができる）を本文の前に付ける（行3、8–9）。設計文書は、messageをquestion textとhintの後に置くこと、入力値を消さないこと（合格した値も残す）、message文言にlabelの語句を含めること（行40–44、70–72）を決めている。資格がない、権限がない、service側の問題といった利用者が直せない事柄はerror messageにせず、別pageへ誘導する（行24–28）。
- 解いている問題と前提：screen reader利用者がfieldに入ったときにerrorを聞けるようにすること、summaryとfieldの文言を照合できるようにすること。
- 必要な入力：field idの命名規則（`-hint`、`-error`の接尾辞）。field単位で1つのmessage。
- trade-off・失敗の仕方：describedByは文字列連結なので、利用者指定のid、hint、errorの順序がtemplateに固定されている。言語を切り替える場合はprefixを差し替える必要がある（error-message index 行54）。
- 反例・適用しない場合：react-ariaの`FieldError`はvalidation contextが`isInvalid`でなければ何も描画しない（`packages/react-aria-components/src/FieldError.tsx` 行47–49）。複数のerror文字列を空白で連結して1つにする（同 行63）。
- 互換・非互換：P07-O02、O04と組む。
- 限界：文言の例は英語圏の公共service向けで、文言規則そのものは持ち込まない。

### P07-O04 server側のerror集合から、summary・link先id・表示順を生成する
- 出典：x-govuk/govuk-form-builder、`lib/govuk_design_system_formbuilder/elements/error_summary.rb` 行19–27、45–91、109–115（https://github.com/x-govuk/govuk-form-builder/blob/f16a8adb4528208f8436ee3271038dfc3b5ee009/lib/govuk_design_system_formbuilder/elements/error_summary.rb#L19-L115）。`base.rb` 行31–37、54–58（https://github.com/x-govuk/govuk-form-builder/blob/f16a8adb4528208f8436ee3271038dfc3b5ee009/lib/govuk_design_system_formbuilder/base.rb#L31-L58）。`presenters/error_summary.rb` 行1–35（https://github.com/x-govuk/govuk-form-builder/blob/f16a8adb4528208f8436ee3271038dfc3b5ee009/lib/govuk_design_system_formbuilder/presenters/error_summary.rb#L1-L35）。`traits/date_input.rb` 行93–102（https://github.com/x-govuk/govuk-form-builder/blob/f16a8adb4528208f8436ee3271038dfc3b5ee009/lib/govuk_design_system_formbuilder/traits/date_input.rb#L93-L102）。信頼性ラベル：primary。本文確認：済
- 何をしているか：`ErrorSummary#html`は、bound objectの`errors`が空ならsummaryを出さない（行20）。`role: "alert"`の子要素にtitleとlistを入れる（行22–26）。`error_messages`はRailsの`object.errors.messages`を取り、`order`引数か、objectに設定されたorder methodがあればその順で並べ替える。指定にない属性は後ろへ回す（行55–79）。`presenter`は差し替えでき、`formatted_error_messages`を持たなければ`ArgumentError`にする（行48–53）。既定のpresenterは属性ごとに最初のmessageだけを出す（presenter 行33–35）。3要素目に任意のURLを返せば、別pageへのlinkにもできる（presenter 行21–32）。link先は`field_id(link_errors: true)`の契約に従う。field側はerrorがあるとidを`field-error`系に切り替え、summaryのlinkと一致させる（base 行31–37）。date inputは、errorがあるとき最初の分割fieldにそのidを付ける（date_input 行96–102）。`:base`（object全体）のerrorは`link_base_errors_to`で指定したfieldへ結ぶ（error_summary 行109–115）。
- 解いている問題と前提：GOV.UK error summaryのlink規則（P07-O02の設計文書 行47–53）を、server側のmodel validation結果から機械的に満たすこと。page単位の再表示（P07-O01）を前提にしている。
- 必要な入力：model上のerror集合（属性→messages）。field idの生成規則。必要なら表示順の指定。
- trade-off・失敗の仕方：既定の表示順はvalidationの実行順に依存すると、presenterのコメントが明記している（行5–7）。画面上の並びと揃えるには明示的にorderを渡す必要がある。errorがあるとfield idが変わるため、idに依存する他の参照も影響を受け得る（コードから読める範囲の推定）。
- 反例・適用しない場合：react-hook-formのfocus順は登録順（P07-O08）、react-ariaはDOM順（P07-O07）で、client側で順序を決める。
- 互換・非互換：P07-O01〜O03と組む。
- 限界：Rails／ActiveModelのerror構造を前提にしている。

### P07-O05 validation timingを「送信前mode」と「送信後mode」の2系統の状態機械にする
- 出典：react-hook-form、`src/constants.ts` 行1–16（https://github.com/react-hook-form/react-hook-form/blob/09a889c14c4f08472664e1d06f50eb06d3dea42b/src/constants.ts#L1-L16）。`src/logic/getValidationModes.ts` 行4–10（https://github.com/react-hook-form/react-hook-form/blob/09a889c14c4f08472664e1d06f50eb06d3dea42b/src/logic/getValidationModes.ts#L4-L10）。`src/logic/skipValidation.ts` 行3–20（https://github.com/react-hook-form/react-hook-form/blob/09a889c14c4f08472664e1d06f50eb06d3dea42b/src/logic/skipValidation.ts#L3-L20）。`src/logic/createFormControl.ts` 行112–116、1269–1307（https://github.com/react-hook-form/react-hook-form/blob/09a889c14c4f08472664e1d06f50eb06d3dea42b/src/logic/createFormControl.ts#L1269-L1307）。`src/types/form.ts` 行117–142（https://github.com/react-hook-form/react-hook-form/blob/09a889c14c4f08472664e1d06f50eb06d3dea42b/src/types/form.ts#L117-L142）。信頼性ラベル：primary。本文確認：済
- 何をしているか：`VALIDATION_MODE`は`onBlur`、`onChange`、`onSubmit`、`onTouched`、`all`の5つ。`getValidationModes`がmodeをflag集合に変える。`createFormControl`は`mode`（送信前）と`reValidateMode`（送信後）のflagを別々に持つ。`reValidateMode`の型は`onTouched`と`all`を除く（types 行124）。共通のevent handler `onChange`はblurとchangeの両方を受け、`skipValidation(isBlurEvent, isTouched, isSubmitted, reValidateMode, mode)`でこのeventでvalidateするかを決める。送信済みかで参照するflag集合を切り替え、`onTouched`は未送信時に限り「一度blurした後は変更ごと」になる（skipValidation 行9–17）。validation規則も既存errorもないfieldはskipする（createFormControl 行1290–1295）。`delayError`でerror表示を遅らせ、blurで保留中のerrorを即時に出す（行1310–1314）。
- 解いている問題と前提：入力中の過剰なerror表示と、送信後の修正確認の速さを両立すること。client側SPAで、fieldのevent（blur、change）を全部受けられることが前提。
- 必要な入力：送信前と送信後のtimingの選択。field単位のvalidation規則か、form単位のresolver。
- trade-off・失敗の仕方：issue #4821「onTouched modeで送信後にvalidationが動かない」（closed、https://github.com/react-hook-form/react-hook-form/issues/4821、題名のみ確認）は、mode間の遷移で不具合が出た例。既定値（mode、delay時間）は持ち込まない。
- 反例・適用しない場合：GOV.UKは送信時だけに固定する（P07-O01）。final-formはvalidationを走らせるtimingと表示判断を分け、表示は利用側に`touched`を使わせる（P07-O06）。react-ariaは計算を常時行い、表示だけをcommitする（P07-O07）。
- 互換・非互換：P07-O06（touched・dirtyの定義）に依存する。P07-O01とは、client側でtimingを変えるという前提で衝突する。
- 限界：React向けの設計で、framework非依存ではない。

### P07-O06 入力状態のflag model：dirty（初期値との差）とmodified（変更履歴）とtouched（blur済み）を分ける
- 出典：final-form、`src/types.ts` 行74–99（https://github.com/final-form/final-form/blob/2a5cc026c21d9487a403a1025dcea3e0f68f1dea/src/types.ts#L74-L99）。`src/FinalForm.ts` 行586–590、778–851（https://github.com/final-form/final-form/blob/2a5cc026c21d9487a403a1025dcea3e0f68f1dea/src/FinalForm.ts#L778-L851）、行1250–1360（https://github.com/final-form/final-form/blob/2a5cc026c21d9487a403a1025dcea3e0f68f1dea/src/FinalForm.ts#L1250-L1360）。docs `docs/types/FieldState.md` 行95–113、163–171、197–205、`docs/types/Config.md` 行70–101、129–139。react-hook-form、`src/logic/createFormControl.ts` 行554–651（https://github.com/react-hook-form/react-hook-form/blob/09a889c14c4f08472664e1d06f50eb06d3dea42b/src/logic/createFormControl.ts#L554-L651）、行1923–1926、1445–1451、1950–2030（https://github.com/react-hook-form/react-hook-form/blob/09a889c14c4f08472664e1d06f50eb06d3dea42b/src/logic/createFormControl.ts#L1950-L2030）。`src/logic/getProxyFormState.ts` 行4–32、`src/types/form.ts` 行149–158、166以降。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - final-formの`FieldState`は、`active`、`visited`（focusを得たことがある）、`touched`（focusを得て失ったことがある）、`modified`（一度でも変更された。resetまで偽に戻らない）、`dirty`／`pristine`（初期値との比較）、`modifiedSinceLastSubmit`／`dirtySinceLastSubmit`、`submitting`、`submitFailed`、`submitSucceeded`、`error`、`submitError`、`validating`を持つ。`focus`で`active`と`visited`、`blur`で`touched`を立てる（FinalForm 行778–788、842–850）。`validateOnBlur`が真ならblur時、偽ならchange時に`runValidation`を呼ぶ（行789–823）。docsは`touched`を「error messageを表示する時を知るのに有用」と書く（FieldState.md 行171）。表示の判断は利用側に委ねている。`submit`は同期errorがあると全fieldを`markAllFieldsTouched`し、`submitFailed`にして終える（行1267–1273）。errorがなければ進み、`onSubmit`がsubmission errors（値と同じ形。全体errorは`FORM_ERROR`キー）を返せば`submitErrors`として別に保持する（行1297–1309）。docsは、Promiseはerrorを「resolve」し、rejectは通信・server障害に残すと規定する（Config.md 行93–95）。
  - react-hook-formは`touchedFields`をblur時だけ立てる（createFormControl 行635–645）。`dirtyFields`は既定値と`deepEqual`して、同じなら外す（行572–599）。つまり「変更履歴」ではなく「初期値との差」で、final-formの`modified`に当たるflagはない。`formState`はproxyで、読まれたkeyだけを購読扱いにして再描画を絞る（getProxyFormState 行9–29）。`handleSubmit`は`isSubmitting`を立て、検証し、errorがなければ`onValid`、あれば`onInvalid`の後に`_focusError`を呼ぶ。最後に`isSubmitted`、`isSubmitSuccessful`、`submitCount`を更新する（行1950–2025）。
- 解いている問題と前提：「いつerrorを見せるか」を判断する材料を、field単位の状態として持つこと。購読単位を細かくして再描画を抑えること（final-form `docs/philosophy.md` 行39–45のobserver pattern）。
- 必要な入力：初期値（dirtyの基準）。fieldの登録。
- trade-off・失敗の仕方：react-hook-form issue #11366（closed、https://github.com/react-hook-form/react-hook-form/issues/11366）で、送信時に全fieldをtouchedにしてほしいという要望に対し、maintainerは「touchedはuser入力から導く状態であり、上書きは正しい解ではない」と答え、`isSubmitted`との併用を示した。利用側は`error && (isTouched || isSubmitted)`のような条件を書くことになる。final-formは逆に送信失敗時に`markAllFieldsTouched`する。同じ要求への方針が正反対である。
- 反例・適用しない場合：GOV.UK patternはpage再表示型なので、client側のflag modelを持たない（P07-O01）。
- 互換・非互換：P07-O05の前提になる。P07-O07のrealtime／display分離とは別の軸で、併用できる（react-aria docsにreact-hook-formとの統合例がある、`forms.mdx` 行444以降）。
- 限界：どのflagを表示条件にするかの結論はrepoごとに違う。ここでは選ばない。

### P07-O07 計算上のvalidation（realtime）と表示上のvalidation（display）を分け、commitで同期する
- 出典：adobe/react-spectrum、`packages/react-stately/src/form/useFormValidationState.ts` 行60–74、125–191、193–229（https://github.com/adobe/react-spectrum/blob/99e610236887da619ad9d54a1cd87983166c043d/packages/react-stately/src/form/useFormValidationState.ts#L60-L229）。`packages/react-aria/src/form/useFormValidation.ts` 行35–58、67–93、95–137、167–176（https://github.com/adobe/react-spectrum/blob/99e610236887da619ad9d54a1cd87983166c043d/packages/react-aria/src/form/useFormValidation.ts#L35-L176）。`packages/react-aria-components/src/Form.tsx` 行31–60（https://github.com/adobe/react-spectrum/blob/99e610236887da619ad9d54a1cd87983166c043d/packages/react-aria-components/src/Form.tsx#L31-L60）。docs `packages/dev/s2-docs/pages/react-aria/forms.mdx` 行201–226、258–264（https://github.com/adobe/react-spectrum/blob/99e610236887da619ad9d54a1cd87983166c043d/packages/dev/s2-docs/pages/react-aria/forms.mdx#L201-L264）。信頼性ラベル：primary。本文確認：済
- 何をしているか：`FormValidationState`は`realtimeValidation`（入力ごとに更新）と`displayValidation`（commit時に更新）を持ち、`updateValidation`、`resetValidation`、`commitValidation`を公開する（行60–74）。realtimeは、制御された`isInvalid`、server error、client側の`validate`関数の結果、browserの組込みvalidationの順で優先して決まる（行186–187）。`validationBehavior`が`native`ならdisplayはcommit済みの`currentValidity`を使う。`aria`ならrealtimeをそのまま表示する（行188–191）。server errorは`Form`の`validationErrors`から`FormValidationContext`経由でfield `name`ごとに引く。新しい値が来たら表示し、利用者がcommitしたら消す（行138–160、227）。`useFormValidation`は、nativeのときrealtimeの結果を`setCustomValidity`でinputへ反映する（行36–57）。`invalid` eventでcommitし、form内で最初のinvalid要素（`form.elements`のDOM順、行167–176）が自分ならfocusし、browser既定のerror UIは`preventDefault`で抑える（行67–89）。`change`でcommitする。form resetではdisplayを有効状態へ戻すが、React側の自動resetは除外しようとする（行104–117のコメントに「best-effort」と明記）。`Form`は既定で`native`を使い、`aria`のときだけ`noValidate`を付ける（Form.tsx 行31–38、49–52）。docsは、既定ではcommit（blur等）か送信時にerrorを表示し、realtimeが要る場合は利用側でcontrolledにして`isInvalid`を設定すると書く（行222–226）。`aria`は送信をblockしない（行258）。
- 解いている問題と前提：入力途中の部分的な値でerrorを見せないこと（docs 行132、224）と、browserのconstraint validationを送信blockに使うこととの両立。server側errorと利用者の修正の関係（修正したら消す）。
- 必要な入力：field `name`とserver errorのkeyの対応。nativeとariaのどちらを使うかの選択。
- trade-off・失敗の仕方：コメントが、React自動resetの検出をbest-effortで偽陽性があり得ると明記している（行105–108）。server errorを未修正のまま消さないよう、表示中ならcommitしない（行68–72）。hookの既定は`aria`（useFormValidationState 行107）で、`Form`の既定は`native`（Form.tsx 行49）。どの層で既定が決まるかに注意が要る。
- 反例・適用しない場合：GOV.UKはHTML5 validationを使わない（P07-O01 行94–103）。react-hook-formのfocusは登録順（P07-O08）。
- 互換・非互換：P07-O06のflag modelと併用例がある（docs 行444以降）。P07-O01とはnative validationの利用で衝突する。
- 限界：browserのconstraint validation APIに依存する。

### P07-O08 送信失敗時のfocus先の決め方（登録順、DOM順、summary）
- 出典：react-hook-form、`src/logic/createFormControl.ts` 行1445–1451、1923–1926、2009–2016（https://github.com/react-hook-form/react-hook-form/blob/09a889c14c4f08472664e1d06f50eb06d3dea42b/src/logic/createFormControl.ts#L1923-L1926）。`src/logic/iterateFieldsByAction.ts` 行5–38（https://github.com/react-hook-form/react-hook-form/blob/09a889c14c4f08472664e1d06f50eb06d3dea42b/src/logic/iterateFieldsByAction.ts#L5-L38）。react-aria `useFormValidation.ts` 行74–85、167–176。govuk-frontend `error-summary.mjs` 行24–26。信頼性ラベル：primary。本文確認：済
- 何をしているか：react-hook-formは`shouldFocusError`が真で、native validationを使っていないとき、`_names.mount`（登録順）を順に辿り、errorを持つ最初のrefを`focus`する（`_focusInput`、`iterateFieldsByAction`）。submit後に同期で1回、`setTimeout`でもう1回呼ぶ（行2015–2016）。react-ariaは`form.elements`のDOM順で最初のinvalid要素を決める。GOV.UKはfieldではなくsummaryへfocusする。
- 解いている問題と前提：送信失敗後に、keyboard・screen reader利用者が最初の誤りへ到達できるようにすること。
- 必要な入力：順序の基準（登録順、DOM順、summaryの列挙順）。
- trade-off・失敗の仕方：react-hook-form issue #1613（closed、https://github.com/react-hook-form/react-hook-form/issues/1613）は、動的に追加したfieldが登録順のために後回しになり、DOM上で先にある誤りfieldへfocusしないと報告した。maintainerは期待どおりの挙動とし、SSR、CSS、media queryと組み合わせるとDOM順の決定は難しいと述べた。報告者は、弱視の利用者が先頭の誤りを見落とすと指摘した。
- 反例・適用しない場合：GOV.UKはfield単位のfocusではなく、summaryを経由させる（P07-O02）。
- 互換・非互換：P07-O02とは行き先で両立しない。P07-O04のorder指定は、summaryの列挙順をDOM順に揃える手段になる。
- 限界：どの順序基準が正しいかの評価はしない。

### P07-O09 入力中に表示するvalidationの例外：character countの可視表示と読み上げ表示の分離
- 出典：alphagov/govuk-frontend、`packages/govuk-frontend/src/govuk/components/character-count/character-count.mjs` 行146–156、204–264、296–337（https://github.com/alphagov/govuk-frontend/blob/283cc58ead97f3e3379199976709713914e00b05/packages/govuk-frontend/src/govuk/components/character-count/character-count.mjs#L204-L337）。設計文書：govuk-design-system `src/patterns/validation/index.md` 行74。信頼性ラベル：primary。本文確認：済
- 何をしているか：可視counterは`input` eventごとに更新する（`handleInput`）。上限を超えるとtextareaとmessageにerror classを付ける。ただし既存のserver側error messageがあるときはtextareaのerror classを触らない（行307–312のコメント）。screen reader用の`aria-live="polite"`要素は別に作る（行146–156）。focus中はpollingで値の変化を検出し、最後の入力から一定時間経ってから読み上げ用messageを更新する（`handleFocus`、行230–250のコメント）。音声入力softwareがeventを出さずに値を変える場合への対策とされる。閾値を下回る間は、読み上げ要素を`aria-hidden`にする（行326–337）。
- 解いている問題と前提：長文を書いた後で上限超過に気づく損失（validation pattern 行74）と、入力ごとの読み上げで利用者を妨げないことの両立。
- 必要な入力：上限の値と、表示を始める条件。
- trade-off・失敗の仕方：eventを出さない値変更をpollingで補っている。間隔や閾値の値は持ち込まない。
- 反例・適用しない場合：GOV.UKの他のcomponentは入力中の表示をしない（P07-O01）。
- 互換・非互換：P07-O01の例外として位置づけられている。P07-O07のrealtime表示（`aria`）と目的は似るが、読み上げを可視表示から分けている点が違う。
- 限界：単一componentの例外であり、一般化はしない。

### P07-O10 多段formと情報構造：one thing per page、check answers、task list、service navigationの使い分け
- 出典：alphagov/govuk-design-system、`src/patterns/question-pages/index.md` 行56–64、70–92、118–122、137–164（https://github.com/alphagov/govuk-design-system/blob/d1b51e67c01d841d7cba58a29ef1f74384cb7b34/src/patterns/question-pages/index.md#L56-L164）。`src/patterns/check-answers/index.md` 行17–25、54–66（https://github.com/alphagov/govuk-design-system/blob/d1b51e67c01d841d7cba58a29ef1f74384cb7b34/src/patterns/check-answers/index.md#L17-L66）。`src/patterns/complete-multiple-tasks/index.md` 行23–41、52–84、100–129（https://github.com/alphagov/govuk-design-system/blob/d1b51e67c01d841d7cba58a29ef1f74384cb7b34/src/patterns/complete-multiple-tasks/index.md#L23-L129）。`src/patterns/navigate-a-service/index.md` 行19–39、83–93、110–159（https://github.com/alphagov/govuk-design-system/blob/d1b51e67c01d841d7cba58a29ef1f74384cb7b34/src/patterns/navigate-a-service/index.md#L19-L159）。review例：govuk-frontend `packages/govuk-frontend-review/src/views/examples/error-summary-with-one-thing-per-page/index.njk` 行9–60。信頼性ラベル：primary（pattern文書）。本文確認：済
- 何をしているか：
  - question page：back link、page heading、continue buttonを必須にする。1 pageに1質問から始め、label・legendをpage headingにしてscreen readerの重複読み上げを避ける（行70–75）。同じheadingを複数pageで使わない（行86）。複数質問をまとめるのは、user researchが示す場合（例：繰り返し作業する内部利用者）に限り、statementの見出しを使う（行118–122）。browser backを壊さず、直前の状態で戻す。一度きりの操作（支払い等）の後はbackで再実行させない（行58–64）。全stepを並べるprogress indicatorを避ける理由に、条件分岐sectionを扱いにくいことを挙げる（行146–164）。review例では、1質問pageのdate inputでlegendをpage headingにし、summaryが誤りのある分割fieldへlinkしている。
  - check answers：小〜中規模の手続きでは確認page 1枚を確認画面の直前に置く。大規模なら各sectionの末尾に置く（行19–21）。「Change」linkで戻った後はcheck answersへ戻し、回答の変更で追加の質問が要れば、それを済ませてから戻す（行56–64）。
  - complete multiple tasks：複数sessionにまたがる長い手続きに限って使う（行25）。taskとstatusで構成し、前提taskが未完了なら「開始不可」statusにして行をlinkにしない（行74）。error状態のtaskは、入力時点のsummaryとmessageで避ける（行80）。可能なら順不同で完了できるようにする（行106）。完了の判定を利用者に委ねる場合はradio質問を使う（行108–125）。
  - navigate a service：navigation linkは、繰り返し使う、複数task、明確な順序がないserviceに限る（行21–25）。明確なend-to-end journeyがあればnavigationを避け、task listを使う（行31–39）。navigationはsite mapではなく、最重要の上位sectionだけを載せる（行91–93）。header内の要素は一般（全体）から個別（service、page）の順に並べる（行114）。breadcrumbsは`<main>`の直前に置き、skip linkでnavigation全体を飛ばせるようにする（行159）。
- 解いている問題と前提：手続きの順序性の有無でnavigationの型を選ぶこと。多段formで、変更・戻り・再開の経路を保つこと。
- 必要な入力：手続きの順序性があるか、session数、利用者が繰り返し使うか。各質問の依存関係（条件分岐、前提task）。
- trade-off・失敗の仕方：task statusは数が増えると覚えにくいと文書自身が書く（complete-multiple-tasks 行58）。progress indicatorは、多くのserviceで外しても悪影響がなかったと文書が述べるが、根拠はblogへのlinkなので、本観察では一次根拠にしない。
- 反例・適用しない場合：react-hook-form、final-form、react-ariaはpage階層やnavigationを扱わない。form内の状態に限る。
- 互換・非互換：P07-O01（page単位の送信時validation）とP07-O02（page上部のsummary）を前提にしている。
- 限界：公共手続き（行政service）の構造が前提で、内部向け多質問pageは例外として扱われている。

## 同じ問題の解き方の比較
| 問題 | repoA のやり方 | repoB のやり方 | 違いが生じる前提 |
|---|---|---|---|
| validationの表示timing | GOV.UK：送信（continue）時だけ。入力中は例外（character count）に限る | react-hook-form：送信前と送信後を別modeで選ぶ／react-aria：計算は常時、表示はcommit（blur・change・submit）時 | page往復型serverのformか、SPAでfield eventを全部受けられるか |
| HTML5 constraint validation | GOV.UK：`novalidate`で切り、`required`も付けない | react-aria：既定で`native`を使い、browser UIだけ`preventDefault`で抑える | browser既定UIを表示の一貫性の障害とみるか、送信blockの機構として使うか |
| 送信失敗時のfocus先 | GOV.UK：error summaryへfocusし、linkからlabel・legendを見せてfieldへ | react-hook-form：登録順で最初の誤りfield／react-aria：DOM順で最初のinvalid field | summaryという中間要素を持つか。field順序の基準をどこに置くか |
| 送信時のtouched | final-form：同期errorがあると全fieldをtouchedにする | react-hook-form：touchedはuser入力からだけ導き、`isSubmitted`の併用を求める（#11366） | touchedを「表示条件」とみるか「利用者の行為の記録」とみるか |
| 変更の追跡 | final-form：`modified`（履歴）と`dirty`（初期値との差）を別flagにし、送信以降の変化も持つ | react-hook-form：`dirtyFields`は既定値との`deepEqual`だけで、履歴flagはない | 「一度触った」と「今違う」を区別する必要があるか |
| server側error | final-form：`submitErrors`を同期errorと別に持ち、Promiseはerrorをresolveする | react-aria：`validationErrors`をcontextで配り、利用者のcommitで消す／govuk-form-builder：model errorsからsummaryとidを生成する | server errorをclient状態に持ち込むか、page再描画で表すか |
| summaryの列挙順 | govuk-form-builder：既定はvalidation実行順で、orderで上書きする | govuk-frontend：渡されたerrorListの順をそのまま描く | 順序の責任をserver modelに置くかtemplate利用者に置くか |

## 見つからなかったこと・gap
- GOV.UK系で、client側validationを入れたservice teamの研究結果の一次資料は見つからなかった（validation patternは募集中と書いている、行109）。
- `required`を付けないことのscreen readerへの影響は、文書上も未調査とされる（行111）。
- react-hook-formとfinal-formには、page階層やnavigation（情報構造）に当たる機構がない（form内状態に限られる）。
- 多段form（wizard）の状態保持（page間で値をどこに持つか、session再開）について、GOV.UKのpattern文書は利用者側の振る舞いを規定するが、実装の状態modelは扱っていない。x-govuk/govuk-prototype-kit等は読んでいない。
- ministryofjustice/moj-frontendは読んでいない。
- react-aria `validationBehavior`の既定が層によって違う理由（hookは`aria`、`Form`は`native`）を説明するRFCやissueは見つからなかった（検索結果は0件）。

## 検索範囲と結果（読んだpath、検索した語、読んでいないもの）
- 取得方法：各repoを作業用の一時領域（作業用の一時領域）へ`git clone --filter=blob:none`し、sparse-checkoutで固定commitをcheckoutした。コード、test、build、hookは実行していない。
- govuk-frontend：`components/error-summary/{error-summary.mjs,template.njk}`、`error-message/template.njk`、`input/template.njk`（行1–115付近）、`character-count/character-count.mjs`（行140–415）、review例 `error-summary-with-one-thing-per-page/index.njk`（行1–60）を読んだ。issue検索語は「error summary focus」で、#2055、#2072、#2657の本文を読んだ（#1936、#2059は題名のみ）。
- govuk-design-system：`src/patterns/{validation,question-pages,check-answers,complete-multiple-tasks,navigate-a-service,task-list-pages}/index.md`、`src/components/{error-summary,error-message}/index.md`（error-messageは行1–80）を読んだ。breadcrumbs、service-navigation、task-list componentの文書は未読。
- govuk-form-builder：`elements/error_summary.rb`、`presenters/error_summary.rb`、`traits/error.rb`、`base.rb`（行25–100）、`traits/date_input.rb`（行90–105）、`govuk_design_system_formbuilder.rb`（設定説明 行100–115、232–233）を読んだ。
- react-hook-form：`constants.ts`、`logic/{getValidationModes,skipValidation,getProxyFormState,shouldRenderFormState,iterateFieldsByAction}.ts`、`logic/createFormControl.ts`（行108–145、554–651、1269–1340、1445–1455、1920–2060）、`types/form.ts`（行100–175）を読んだ。issue検索語は「focus first error order」「onTouched reValidateMode」で、#1613と#11366の本文とcommentを読んだ（#4821は題名のみ）。`validateField.ts`、resolver、`useController`は未読。
- final-form：`src/FinalForm.ts`（行400–470、580–600、775–860、1250–1375）、`src/types.ts`（行74–123、364–386）、`docs/philosophy.md`、`docs/types/FieldState.md`（行95–205）、`docs/types/Config.md`（行60–139）、`LICENSE`冒頭を読んだ。react-final-formは未読。
- react-spectrum：`packages/react-stately/src/form/useFormValidationState.ts`（全体）、`packages/react-aria/src/form/useFormValidation.ts`（全体）、`packages/react-aria-components/src/{Form.tsx（行22–62）,FieldError.tsx（grep箇所）}`、`packages/dev/s2-docs/pages/react-aria/forms.mdx`（見出しと該当行をgrepで確認）を読んだ。`rfcs/`は一覧だけ確認した（form validationのRFCは一覧になかった）。issue検索「validationBehavior native aria default」「validation on blur display」は0件だった。
- gh api呼出しは約25回。

## BRAINの属性について未決の事項（由来の種類、scope、評価根拠、版、状態）
- 由来の種類：設計文書（GOV.UK pattern）と実装（4 library）が混在している。文書由来の観察（O01、O10）と実装由来の観察（O05〜O08）を同じ種類として扱うかは未決。
- scope：GOV.UKの観察は公共手続きのpage往復型formが前提。react-hook-form、final-form、react-ariaはSPAのfield状態管理が前提。HELIXのどの対象（D10 UX／D04 Frontend）のどの層に当てるかは未決。
- 評価根拠：GOV.UK文書が挙げる研究根拠の多くは外部blogへのlinkで、本観察では一次根拠にしていない。外部での成功をHELIXでの成功とみなさない。
- 版：すべて上表の固定commitに固定している。上流の更新で行範囲が変わる可能性がある。
- 状態：全観察は未評価の候補素材である。HELIX-BRAINへの登録や採否はしていない（HELIXBRAIN-L2-026／027の経路の対象）。
