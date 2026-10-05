# BRAIN Stage 4 review01 修正記録

対象：HELIX-BRAIN Stage 4 の7親。固定PO判断は `633bf12ea8f948db8ba3d6600179c4a9507377a7` の採択 `-002`、L2/L11起点は `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。本文修正revision：`b9b5d32f6bb2bf0f4ac687e1d5074caf7931c6b6`。本記録は作成側の修正・静的照合であり、独立再reviewや承認の成立を示さない。

## Findings
- **M1** — 023の負例が製品固有要素の欠落で、固定親が禁じる汎用知識への混入を試していない。 対応：製品固有要素ごとの一変異をgeneric knowledgeへ混入させる負例へ変更しProduct Coreへ戻す。 根拠：`docs/helix-brain/L3-requirements/functional-requirements.md:677`, `docs/helix-brain/L10-verification/functional-verification.md:715`, `docs/helix-brain/L10-verification/functional-verification.md:716`, `docs/helix-brain/L10-verification/functional-verification.md:717`。
- **M2** — 7親のNFR IDがgrade側で定義されず、NFR trace検査がない。 対応：7件のBRAIN-018/019/020/021/022/023/030-NFR-01をgradeへ定義し、gradeとNFR-Vが全175 CASE/R IDを参照。 根拠：`docs/helix-brain/L3-requirements/nfr-grade.md:105`, `docs/helix-brain/L3-requirements/nfr-grade.md:106`, `docs/helix-brain/L3-requirements/nfr-grade.md:107`, `docs/helix-brain/L3-requirements/nfr-grade.md:108`。
- **M3** — 018–021固定親の依存L2およびcontract identity/versionのmissing/unknown検証が不足。 対応：親別FR/ACと独立CASEへ依存・contract境界を追記。 根拠：`docs/helix-brain/L3-requirements/functional-requirements.md:622`, `docs/helix-brain/L3-requirements/functional-requirements.md:633`, `docs/helix-brain/L3-requirements/functional-requirements.md:644`, `docs/helix-brain/L3-requirements/functional-requirements.md:655`。
- **M4** — 019の候補field missing CASEに別親向けの曖昧な戻し先がある。 対応：候補response knowledge field欠落は固定依存先BRAIN L2-008へ統一し、query input不足はProduct Coreに分離。 根拠：`docs/helix-brain/L10-verification/functional-verification.md:612`, `docs/helix-brain/L10-verification/functional-verification.md:613`, `docs/helix-brain/L10-verification/functional-verification.md:614`, `docs/helix-brain/L10-verification/functional-verification.md:615`。
- **M5** — 021のnegativeでINTELLIGENCE query failureとBRAIN knowledge failureの戻し先が分岐混在。 対応：scope不足をINTELLIGENCE、knowledge source/version/meaningをBRAIN L1へCASE別に分離。 根拠：`docs/helix-brain/L10-verification/functional-verification.md:671`, `docs/helix-brain/L10-verification/functional-verification.md:672`, `docs/helix-brain/L10-verification/functional-verification.md:673`, `docs/helix-brain/L10-verification/functional-verification.md:674`。
- **M6** — 021の知識改変はあるがcandidate adoptionを独立拒否していない。 対応：AC-03/独立R-adoptionで採用・改変済みstate生成を拒否。 根拠：`docs/helix-brain/L3-requirements/functional-requirements.md:656`, `docs/helix-brain/L10-verification/functional-verification.md:687`。
- **M7** — 020がL2-007/008 generic provenance/identity/stateおよびOS登録未了を十分に扱わない。 対応：FR/ACと別fixtureでgeneric tuple、選択INFRA state、OS登録pendingを保持し、OS既存ownerへ戻す。 根拠：`docs/helix-brain/L3-requirements/functional-requirements.md:643`, `docs/helix-brain/L3-requirements/functional-requirements.md:644`, `docs/helix-brain/L10-verification/functional-verification.md:660`, `docs/helix-brain/L10-verification/functional-verification.md:663`。
- **M8** — 030/022 CASEがtraceする一部の製品結論・receipt・applicability/forward-trace条件をACに明記していない。 対応：030 AC-04/05と022 AC-02へ条件を同期。 根拠：`docs/helix-brain/L3-requirements/functional-requirements.md:690`, `docs/helix-brain/L3-requirements/functional-requirements.md:691`, `docs/helix-brain/L3-requirements/functional-requirements.md:666`, `docs/helix-brain/L10-verification/functional-verification.md:701`。
- **M9** — 022の単独設計選択禁止を独立に試さない。 対応：固定L2-022:439–443に基づくACとR-design-choiceを追加。 根拠：`docs/helix-brain/L3-requirements/functional-requirements.md:666`, `docs/helix-brain/L10-verification/functional-verification.md:707`。
- **M10** — 030にcompatibility range missingとreference-only substitutionの負例がない。 対応：missing rangeと参考資料によるreceipt/required field/authority代替を独立CASE化。 根拠：`docs/helix-brain/L3-requirements/functional-requirements.md:688`, `docs/helix-brain/L3-requirements/functional-requirements.md:689`, `docs/helix-brain/L10-verification/functional-verification.md:766`, `docs/helix-brain/L10-verification/functional-verification.md:767`。
- **M11** — 列挙されたnegative CASEの期待結果に親が定める戻し先が不足/複数候補で曖昧。 対応：不足ごとに固定された単一return ownerを追記。 根拠：`docs/helix-brain/L10-verification/functional-verification.md:612`, `docs/helix-brain/L10-verification/functional-verification.md:638`, `docs/helix-brain/L10-verification/functional-verification.md:676`, `docs/helix-brain/L10-verification/functional-verification.md:696`。
- **m1** — 018の製品固有relation欠落negative不足。 対応：独立product-relation-missing fixtureを追加。 根拠：`docs/helix-brain/L10-verification/functional-verification.md:599`。
- **m2** — 020 INFRA state欠落CASEの戻し先が固定親外へ誤っている。 対応：INFRA state/evidenceだけINFRASTRUCTURE、OS登録はOSへ分けた。 根拠：`docs/helix-brain/L10-verification/functional-verification.md:656`, `docs/helix-brain/L10-verification/functional-verification.md:663`。
- **m3** — 020 C02/C03がunknown候補で止める境界を明記しない。 対応：両revision比較失敗でcandidateをunknown/unfinishedとしLABOへ戻す。 根拠：`docs/helix-brain/L10-verification/functional-verification.md:636`, `docs/helix-brain/L10-verification/functional-verification.md:637`。
- **m4** — 018/019の一部CASE proseが文として崩れている。 対応：原本保存・知識候補の独立negativeの入力変異と期待結果を一文で明確化。 根拠：`docs/helix-brain/L10-verification/functional-verification.md:591`, `docs/helix-brain/L10-verification/functional-verification.md:610`, `docs/helix-brain/L10-verification/functional-verification.md:611`。
- **m5** — 固定親句からAC/CASEへの対応表が句単位でない。 対応：親ごとの物理span、AC ID、full CASE/R IDへ原子化。 根拠：`docs/helix-brain/L10-verification/functional-verification.md:562`, `docs/helix-brain/L10-verification/functional-verification.md:577`。
- **m6** — 030に固定親が特定しないconnection owner、022に曖昧なHARNESS名がある。 対応：030の未指定ownerはunknown維持、022の既存HARNESS ownerだけを記載。 根拠：`docs/helix-brain/L10-verification/functional-verification.md:766`, `docs/helix-brain/L10-verification/functional-verification.md:710`。
- **m7** — 030 C23はnegativeでなく正常境界でC33と重なる。 対応：C23を正常境界、C33を複数field正常境界として分離。 根拠：`docs/helix-brain/L10-verification/functional-verification.md:752`, `docs/helix-brain/L10-verification/functional-verification.md:762`。
- **m8** — 030のsource-declared複数relation正常と023の3つの個別negativeが不足。 対応：2候補/conflicts_with/alternative_toの両方保持正常を明記し、023 missing条件ごとにnegative化。 根拠：`docs/helix-brain/L10-verification/functional-verification.md:731`, `docs/helix-brain/L10-verification/functional-verification.md:724`, `docs/helix-brain/L10-verification/functional-verification.md:725`, `docs/helix-brain/L10-verification/functional-verification.md:726`。
- **m9** — 022 required-field definition missingの根拠が他親に見える。 対応：固定L2-022 required input/obligation clauseに根拠づける。 根拠：`docs/helix-brain/L3-requirements/functional-requirements.md:666`, `docs/helix-brain/L3-requirements/functional-requirements.md:667`, `docs/helix-brain/L10-verification/functional-verification.md:708`。
- **m10** — 旧監査source pinsはlocatorのみ、f6/common assets/mapping/030 L11 rangeに欠落がある。 対応：新監査はlocator 55件をfull/raw hashで再計算し、固定L2/L11、旧asset・parent map・L11:85,97–117を収録、L2 blank585–586は除外。 根拠：`audit:`。
- **m11** — 旧source crosswalkがpartial acceptanceと誤記。 対応：旧SYN-R-02決定的部分合成の実source:55–63表現へ修正。 根拠：`docs/helix-brain/L3-requirements/functional-requirements.md:608`, `audit:`。
- **m12** — registerの現-003 metadata-onlyとPO採択-002の関係が欠落。 対応：本文/監査で-002を承認authority、-003同digest metadata-onlyで承認非継承と記録。 根拠：`audit:`, `audit:`。

## 検証と根拠

- 55件の既存固定source locatorをfull blob SHA-256とLF終端込みraw span SHA-256で再計算。旧親別source 14 span、共有旧asset 5件（L3定義、L10定義、README、business、NFR）とasset ledgerの対応を記録。
- 固定L2は7親のf6dad2a/633bf12 spanを一致検算。L11-030は85行と97–117行を分離pinし、L2 585–586の空行を範囲に含めていない。POの採択-002とcurrent register -003はsource revisionごとに登録raw rowをpinし、semantic digest一致とmetadata-only変更を別記。
- Stage4 CASE/R定義は175件、親別件数をJSONに記録。固定句→AC→CASE表とNFR二表の各full L10 IDは定義へ解決し、重複ID・未解決IDは0。表幅は横断表4列、grade 4列、NFR-V 3列。
- `git diff --check` pass。現行 `scfctl validate`: 147 bindings / fail 0、`stale=0`、`residuals=0`。`govcheck`: ok（atoms=7622, requirements=57, files=58）。旧runtime/CI/test/Bunは実行していない。
- 6 canonical文書の現main `29e814a92af2aa52afcbcdd60549b32a2448513a` prefix bytesを保持。旧時点監査2件は変更せずhashを記録。

## 未完了

Claudeの独立review結果は未取得。PO承認、実装、release、採用・昇格を生成していない。本文は独立再review待ち。
