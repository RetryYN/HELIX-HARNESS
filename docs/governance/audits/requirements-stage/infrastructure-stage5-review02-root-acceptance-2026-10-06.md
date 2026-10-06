# INFRASTRUCTURE Stage 5 review02 Root検収追補

- 対象PR: #2622。本文revision `b6d34586d1da14e6f706ed3a492b7f12d4f0699b`。
- 固定main: `5404d0649762edec0475fc7e836a0b988a4f6631`。
- 正式review: [6006546472](https://github.com/RetryYN/HELIX-HARNESS/pull/2622#issuecomment-6006546472)、raw UTF-8 9867 bytes、SHA-256 `841a68a1300bdc57bac0c41063c29aad4e09b261d670cf663ac747c4c8a2ca91`。

Rootが正式所見28件と本文差分、固定L2/L11、旧sourceを照合し、追加の表記・索引不一致を補正した。旧監査は変更していない。独立再レビューとL3承認は未成立である。

## 所見ごとの処置

- **m1**: 86 CASEの範囲と7形式の分母を6本文で同期。CASE 001–086。
- **m2**: storage/resource sourceとCORE設計ownerを分離し日本語化。CASE 016, 017, 018。
- **m3**: 016–018の7 storage属性とbaselineを同期、018はnetwork.boundaryの単独変異。CASE 016, 017, 018。
- **m4**: Environmentのproduction evidenceを保持し079を専用表へ配置。CASE 007, 008, 009, 079。
- **m5**: Topologyのsource欠落と宣言設計不一致を原因別に区別。CASE 004, 005, 006。
- **m6**: resource観測不足とCORE設計不一致の宛先を区別。CASE 016, 017, 018。
- **m7**: 旧監査のm3/m5/m6解消過大記載を時点追補で訂正。CASE 016, 017, 018。
- **m8**: 004–006のnested pathと実在selectorを同期。CASE 004, 005, 006。
- **m9**: Observabilityのrecovery_stateを正常入力に保持。CASE 025, 026, 027。
- **m10**: 起動要求がある失敗の場合のOS/INTELLIGENCE返却を保持。CASE 022, 023, 024。
- **m11**: OS操作要求のないunit範囲の導出と通常操作のOS責務を区別。CASE 031, 032, 033, 056, 083, 084。
- **m12**: 固定親が名指さないWorker契約ownerをunknownに保持。CASE 019, 020, 021, 046, 047, 048, 071。
- **m13**: Stage scopeとenvironment identityを別fieldに保持。CASE 055, 056, 068, 069, 072。
- **m14**: 059–061と074のrestore.resultを同期、075は正常観測例。CASE 059, 060, 061, 075, 074。
- **m15**: empty write-setへのwrite試行拒否・未実行・before/afterを別に照合。CASE 055, 082, 086。
- **m16**: 058正常時に戻し先を生成せず独立recovery境界を保持。CASE 058。
- **m17**: 067のstage収載と077–086の除外・環境・操作のL11対応を訂正。CASE 067, 077, 078, 079, 080, 081, 082, 083, 084, 085, 086。
- **m18**: 071の契約欠落に根拠のないWorker ownerを作らない。CASE 046, 047, 048, 071。
- **m19**: 029のstate変異と030の分類source変異を分離。CASE 028, 029, 030。
- **m20**: 028–030の正常baselineをFR/FVで同期。CASE 028, 029, 030, 072。
- **m21**: 083/084の適用recovery義務だけを変異し復旧設計/OSへ戻す。CASE 056, 083, 084。
- **m22**: 081を固定親のdeniedへ揃える。CASE 081。
- **m23**: 074/078等のFR/FV literalと重複fieldを訂正。CASE 059, 060, 061, 067, 078, 074。
- **m24**: 077–085をscope・environment・operationのheader付き表へ整理。CASE 077, 078, 079, 080, 081, 082, 083, 084, 085。
- **m25**: 040–045のnested selectorとrevision identityを同期。CASE 040, 041, 042, 043, 044, 045。
- **m26**: NG/NVとFVの86件・7形式の分母を同期。CASE 001–086。
- **m27**: review01/Fable追記と当時の未補正を新時点の処置として記録。CASE 055, 057, 074, 086。
- **m28**: item06のpath-sim-01をitem02のTopologyへ結ぶ。CASE 016, 017, 018, 004, 005, 006。

## Root追加検収

FVの入力を正常baseline、変異を唯一のfield差分として明示した。FR/FVのmappingを合成fixture内のobject記法に揃え、restore.resultを同期した。005/006/017の変異後入力が残っていたため訂正し、004の正常入力もliteralへ揃えた。AC03へ057/080/081、AC04へ062を追加して、単なるID集合一致より細かなAC別集合を照合した。

固定・旧sourceのfull SHAと13 spanのraw LF SHA、literal、行範囲をRootがGit blobから再計算した。六本文SHAとmain全文prefix、86 CASE block SHAと全FR occurrence bytes、正式comment原文も再照合した。54 unitのFR入力cellとFV入力literalは完全一致、AC別集合は57/9/20/11件で一致する。

旧資産はOPS-R-02（`LEGACY-ASSET-17C4BF78919578FEBB18`:74–79）とOPS-AC-002（`LEGACY-ASSET-F46AB11BD14F2C0469F4`:26–29）のPlan/Receipt・before/afterの区別を起点とする。empty write-setやOS適用除外を旧文の直接条件とは扱わない。OS操作要求のないunitでの非適用はfixture範囲からの導出として記録し、通常操作083/084のOS返却を維持する。

read-only補助照合が018をnetwork.purposeと記した点と、006を76–80行とした点は誤りで、現本文018はnetwork.boundary、固定006は85–90行である。現在の記録はactual sourceに合わせ、旧時点記録は書き換えない。

## 検証と限界

`govcheck`は7622 atoms/57 requirements/58 filesで成功、`scfctl`は147件合格・stale 0・residuals 0、`git diff --check`成功。全CASEは合成fixture設計で未実行。旧runtime・test・CI・Bunは使っていない。Opus/Fableの同revision独立再レビューを次に受け、Rootの検収から要求承認・Ready・merge admissionを生成しない。

詳細なSHA、source literal、86 CASE、28件の対応は隣接JSON（SHA-256 `f2d34dbe700eb16f3ebbcfa14a922eb625144b6ed96f6cadb23f1cf6ec0aac9b`）に固定した。
