# BRAIN Stage 4 review02 修正記録

本文候補: `1ae9150ea2f87938f11dc5dd6a9408c5422bc563`。正式指摘はcomment `5994934207`（raw UTF-8 SHA-256 `64a82a9ea3af00469963c3d1ad400c745354dcb66051002e9209284220948776`、16件：Major 3／Minor 13）。この記録は作成側の修正と静的照合であり、独立review、PO承認、実装、mergeを示さない。Fable独立reviewは未実施。

対象は固定登録 `MPR-RC-HELIXBRAIN-L2-018/019/020/021/022/023/030-002` のStage 4、7親のみ。対象外の親・Stage・候補・runtimeは含めない。

## Findings

- **M1**：018 AC-02の不合格句が欠落。 対応：AC-02へraw original保存とreceipt単独accepted/matureの拒否を明記し、C08/C13を保持。 根拠ID：`BRAIN-018-AC-02, L10-BRAIN-018-C08, L10-BRAIN-018-C13`
- **M2**：022/023のcontract identity欠落・version missing/unknown fixtureがない。 対応：各個別CASEを追加。022はHARNESS受領方法へ返し、023は宛先を創作せずunknown保持。 根拠ID：`BRAIN-022-AC-02, BRAIN-022-AC-04, L10-BRAIN-022-C14, L10-BRAIN-022-C15, L10-BRAIN-022-C16, BRAIN-023-AC-02, BRAIN-023-AC-04, L10-BRAIN-023-C11, L10-BRAIN-023-C12, L10-BRAIN-023-C13`
- **M3**：023の固定親にないreturn destination。 対応：製品固有混入だけProduct Core、LABO未経由結果は昇格停止。scope/source/applicability/required input/counterexampleの未指定宛先はunknown保持。 根拠ID：`BRAIN-023-AC-02, BRAIN-023-AC-04, L10-BRAIN-023-C06, L10-BRAIN-023-C07, L10-BRAIN-023-C08, L10-BRAIN-023-R-applicability-missing, L10-BRAIN-023-R-required-input-missing, L10-BRAIN-023-R-counterexample-missing`
- **m1**：019へ030の限定relation種別とHARNESS両候補保持条件を混入。 対応：relation typeはsource-declared例に留め、複数候補の比較可能保持と選択先境界を固定親に合わせた。 根拠ID：`BRAIN-019-AC-01, L10-BRAIN-019-C01`
- **m2**：020に固定親が指定しないBRAIN戻し先を加えていた。 対応：identity/state不足と独立検証未了の宛先を除去しunfinished保持、固定されたLABO/OS経路のみ保持。 根拠ID：`BRAIN-020-AC-02, L10-BRAIN-020-R-identity-missing, L10-BRAIN-020-R-state-missing, L10-BRAIN-020-R-independent-verification`
- **m3**：021がknowledge ownerまたはBRAIN L1の固定returnを落としていた。 対応：ACに両可能性を保持、owner指定fixtureとowner unspecified unknown fixtureを分離。 根拠ID：`BRAIN-021-AC-02, L10-BRAIN-021-C16, L10-BRAIN-021-C18`
- **m4**：021の採用と昇格拒否が一つに束ねられていた。 対応：採用拒否と一般化/昇格拒否を別AC/CASEにした。 根拠ID：`BRAIN-021-AC-03, BRAIN-021-AC-04, L10-BRAIN-021-R-adoption, L10-BRAIN-021-R-promotion`
- **m5**：018–021のcompatibility range不一致が個別に試されない。 対応：各contractでrange mismatch fixtureを追加。 根拠ID：`L10-BRAIN-018-C16, L10-BRAIN-019-C16, L10-BRAIN-020-C15, L10-BRAIN-021-C17`
- **m6**：crosswalk AC trace列に一部trace先ACがない。 対応：020 AC-03、030 AC-02/04 trace列を同期。 根拠ID：`BRAIN-020-AC-03, BRAIN-030-AC-02, BRAIN-030-AC-04, L10-BRAIN-020-R-infra-unselected, L10-BRAIN-030-C33, L10-BRAIN-030-R-correlation-mismatch`
- **m7**：business verificationのCASE/R traceが追加CASE/Rを含まない。 対応：018–023/030全対象CASE範囲と全R-*参照を拡張。 根拠ID：`L10-BRAIN-018-C16, L10-BRAIN-019-C16, L10-BRAIN-020-C15, L10-BRAIN-021-C18, L10-BRAIN-022-C16, L10-BRAIN-023-C13, L10-BRAIN-030-C38`
- **m8**：旧UWJ source spanと意味語の対応が不一致。 対応：実在する43–54/25–32をpinしcore/signal question等の実記述へ合わせた。 根拠ID：`LEGACY-ASSET-5EE032D657C221184B00, LEGACY-ASSET-6FFD7F4E58066D08B053`
- **m9**：018 receiver identity欠落と019 applicabilityの宛先が粗い/不正確。 対応：018 C12は宛先を推定せず、019 response applicabilityはBRAIN L2-003/008または親L1へ。 根拠ID：`L10-BRAIN-018-C12, L10-BRAIN-019-R-response-applicability`
- **m10**：030 AC-05 applicability unknown returnとCASE期待が不一致。 対応：AC/CASEで当該適用を保留し固定親が指定するときだけreturn。 根拠ID：`BRAIN-030-AC-05, L10-BRAIN-030-R-applicability-unknown`
- **m11**：L11未見fixtureが未公開Pattern pair/互換範囲外versionであることとrequired field/relation/unknown receipt照合が不足。 対応：未公開Pattern pairをC32へ明示しfield/relation/unknown receipt照合。 根拠ID：`BRAIN-030-AC-05, L10-BRAIN-030-C32`
- **m12**：review01 correction auditの030旧source crosswalk locatorが誤っている。 対応：既存監査不変。本文030はSYN-R-02実source 49–61/acceptance 29–33へ訂正し、新auditで旧locatorと現在locatorの差を明示。 根拠ID：`LEGACY-ASSET-F1F753F31DB8D874EF21, LEGACY-ASSET-BEAB5EE27CD04F5E866F`
- **m13**：030 authority上書き禁止、LABO評価から採択/承認/実装を生成しない境界がAC/CASEにない。 対応：AC-06とC37/C38で各独立negative化し、成功をidentity/version/scopeに限定。 根拠ID：`BRAIN-030-AC-06, L10-BRAIN-030-C37, L10-BRAIN-030-C38`

## sourceと監査上の訂正

固定親L2/L11・PO/G0・旧UWJとpaired acceptanceはJSONの実在行範囲、full SHA-256、raw-LF span SHA-256、literalでpinした。L2共通contractは633bf12の31–33行。旧sourceの030は `SYN-R-02` 実体のrequirements 49–61行とacceptance 29–33行に訂正した。review01 correction auditの誤った030 locatorは書き換えず、本追補に過去locatorと現行locatorの違いを残す。

## 検証

- canonical 6文書の現body revision full SHA-256とbytes/line数を記録。latest base `1a7933157fef8327a0e2747348cbe57e596019aa` に対する6ファイルprefix一致: `True`。
- functional CASE/R definition: 191件（親別: {'018': 19, '019': 25, '020': 31, '021': 23, '022': 19, '023': 16, '030': 58}）。NFR gradeとNFR verificationの対象参照集合は定義と同一: `True` / `True`。
- current changed lines: 81件をphysical line、literal、raw-LF line SHAで固定。`git diff --check HEAD^ HEAD`: pass。
- 旧source/runtime/test/CI/Bunは実行していない。

## 未確認・未完了

Opus review02所見の本文修正を記録した。Fable独立review、root意味検収、PO承認、実装、Ready/mergeは未成立。新世代runtime/CIの挙動は未検証。
