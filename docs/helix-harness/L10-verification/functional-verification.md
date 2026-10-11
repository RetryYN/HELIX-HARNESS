# HARNESS-L10-PACK-functional

生成view。意味正本: `functional-verification.json`。JSON SHA-256: `bb46fce98407685586ecf6524bcfc61bd062636b2cea951e1ba73c7dd2833f11`。JSONから再生成する。

| 項目 | 内容 |
|---|---|
| mechanism | HELIX-HARNESS |
| stage | Stage 1 |
| primary_parents | HARNESS-L2-010 / HARNESS-L2-011 / HARNESS-L2-023 / HARNESS-L2-052 / HARNESS-L2-053 |
| l2_individual_version_target_by_parent | HARNESS-L2-010: None / HARNESS-L2-011: None / HARNESS-L2-023: 1.0 / HARNESS-L2-052: 1.0 / HARNESS-L2-053: 1.0 |
| status | draft_not_approved |
| authority_effect | none_until_exact_revision_delegated_approval |
| source_revision | a2cc3defcee5a229145c89217af30c7d20da998f |
| scope | 限定前提構築が参照する共通pack境界・呼出し・条件別依存とcommand意味identity・asset identity/意味revision照合のpair。既存Stage/親の版を変更せず、初回3主対象と周辺機構の全能力を混載しない。 |
| source_pins | path: docs/concept/helix-concept.md / sha256: bbc787c5dc17de9eded156285ad82ef768788cfa31822dfffa477db073a5e715 / path: docs/concept/helix-principles.md / sha256: 5b3d1d42b38a6e09d5c4da45760036e5234f5a316b3a02e7c48fb88a48a4c441 / path: docs/helix-harness/L1-planning/product-intent.md / sha256: 238ae0590f43c10c0a59a0cea4a9907328752a81388891e1a115d4278db00e1f / path: docs/helix-harness/L2-requirements/product-requirements.md / sha256: c5a2eb180f260534174abbf031121f49122791621f7728c4e1be6348a93dab2d / path: docs/helix-harness/L11-acceptance/product-acceptance.md / sha256: 05c5f5a3071f46e3b8904f51a73749b31b9681d69a3a6c3655e532a11eaaa1cd / path: docs/governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md / sha256: c7a6d39ceb853fe6c00ccc336ffa7bbbd6c7e87a0aaba172f43f490dd0a7fd23 / path: docs/governance/decisions/requirements-entry-restart-po-decision-2026-10-12.md / sha256: 994a81b2d5eb4cbf291951b688fca85fa2b1353848091c0ab4cfac91fb8c131b / path: docs/governance/decisions/p3first-knowledge-po-decision-2026-10-12.md / sha256: c091ac5083a0ebffb441921ab614567cfece8d95ded91cba3de3d462f9d667a9 / path: docs/helix-brain/candidates/first-cycle-reference-template-knowledge.json / sha256: 321d1253e63a11c3b14b398138ee976e2960298d2007431808396171b2431caf / path: docs/governance/audits/requirements-stage/implementation-order-addendum-2026-10-03.json / sha256: ec970df79eaaf693f8825045b235c43ea10aefa7925701b1fff2a974df3e4e0a / path: docs/governance/decisions/po-decision-2026-09-29-11candidates.md / sha256: 6e10127a65a775b0a7554ccb359abdfc1221d17a2c48fb79321d59369df127c5 / path: docs/governance/decisions/version-join-requirement-resolution-po-decision-2026-10-10.md / sha256: be23fea5cbffa3a19538bf3b1dba67eff424454f9adaa1d369aa9e22ba4c6dff / path: docs/governance/audits/requirement-registration/version-join-coverage-receipt-2026-10-10.json / sha256: 6938fd8d1f85bcf2470da04d51cbe257d490e027ec31424c1e792d304ecd2881 / path: docs/governance/decisions/discipline-requirements-into-1.0-po-decision-2026-10-10.md / sha256: ff1a4872408f9ee0b55f69bf089bd6cebe2199a3afd46d5afd376be0a4ea5a23 / path: docs/governance/requirements-entry-restart-proposal.json / sha256: 29bd949ddd49348bb149f11ea253959075f7c7ac7e248035701a2002199efaf4 |
| knowledge_use | P3FIRSTのVT103と選択SDOP19節を問い/証拠/Backflowの限定材料として使う。数値/方式/全技法/正式schemaを採用しない。知識採用を実適用としない。 |
| document_format | JSONが意味正本、Markdownは生成view。本keyを製品pack descriptor schemaやwire formatへ固定しない。 |
| legacy_comparison | reuse_class: semantic_rederivation / source_path: archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requests.md / source_lines: 23 / 67 / preserve: 独立したbehavior単位、収載/除外、成熟度分離、再現/rollback、安全閉包と組合せの別証拠。 / change: 旧Slice/Module/Bundleの名称/enum/永続化を移さず、採用010/011/023のownerと4条件区分で再導出する。 / reason: 全対応sourceと一利用の有効依存を混同せず、未選択を未観測に保ち、無関係な全基盤完了を開始条件にしない。 / failure_basis: UTW014の欠損空集合化、UTW021の自己申告完了（predecessor-harness-full-weakness-audit-2026-07-20.md:65–101）を旧sourceとして照合した。 / command_sources: path: archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md / lines: 142 / 142 / preserve: command idempotencyの意味条件 / change: 意味判定をHARNESS、原子保存・CAS運転をOSへ非重複配分 / reason: 9/29採択済み052/OS053の責務境界に従う。旧DB/runtimeは移さない。 / path: archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L1-infinity-loop-operational-test-design.md / lines: 76 / 76 / use: 異payload conflictのoracle設計参照のみ。FR53履歴/故障注入実行は052へ取り込まない。 / asset_identity_source: path: archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md / lines: 143 / 143 / preserve: path非依存identity・意味revision・history/authority/oracle/typed edgeの保持と欠落unknown / change: 現行HARNESSの記録照合へ意味を再導出し、実変換・保存・authority裁定は初回非選択に残す。 / reason: 9/29採択と10/12限定再開の操作scopeを守る。旧runtime/実装/FR全体successorを継承しない。 |
| remaining | 053の042参照は未決、JSON原子確定のOS053、命名/trace/対/DDD-TDD等は別pairで起草・承認する。 / 呼出し実運転に使う認可/隔離/資源/記録/再開のowner-qualified契約を当該操作で束縛する。 / 実装/CI/切替/デプロイ/実行/PO L11受入は本pairの承認から成立しない。通常L3全体の再開はPO Acceptedの範囲に限る。 |
| roster_version_scope_by_parent | HARNESS-L2-010: version_class: 1.0 / version_intent: 1.0 / version_intent_label: 1.0 target candidate / basis: docs/governance/audits/requirements-stage/implementation-order-addendum-2026-10-03.json / boundary: 10/3固定rosterの起草対象区分を保持する。L2個別印の追加、release収載、実装許可を生成しない。 / HARNESS-L2-011: version_class: 1.0 / version_intent: 1.0 / version_intent_label: 1.0 target candidate / basis: docs/governance/audits/requirements-stage/implementation-order-addendum-2026-10-03.json / boundary: 10/3固定rosterの起草対象区分を保持する。L2個別印の追加、release収載、実装許可を生成しない。 / HARNESS-L2-023: version_class: 1.0 / version_intent: 1.0 / version_intent_label: 1.0 target candidate / basis: docs/governance/audits/requirements-stage/implementation-order-addendum-2026-10-03.json / boundary: 10/3固定rosterの起草対象区分を保持する。L2個別印の追加、release収載、実装許可を生成しない。 / HARNESS-L2-052: historical_version_class: 版未指定 / version_target: 1.0 / basis: docs/governance/decisions/version-join-requirement-resolution-po-decision-2026-10-10.md / boundary: 10/10 VERSIONJOINが052の版のみ更新。既存Stage 1・意味・ownerを保持する。 / HARNESS-L2-053: historical_version_class: 版未指定 / version_target: 1.0 / basis: docs/governance/decisions/discipline-requirements-into-1.0-po-decision-2026-10-10.md / boundary: 版のみ更新。既存Stage 1・9/29の採択意味・ownerは保持。 |
| parent_basis | identity: HARNESS-L2-010 / decision: docs/governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md / fixed_revision: f6dad2a33e24f000b87d7f09b8d40288257e74cc / current_section_sha256: 9fbd159e2b1cbf31ef16913e29b33417ab2f247e2c0f0328268f2c9f67e2d6b4 / comparison: 対象節は9/28採用固定revisionと同文。current file全体の採用を意味しない。 / identity: HARNESS-L2-011 / decision: docs/governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md / fixed_revision: f6dad2a33e24f000b87d7f09b8d40288257e74cc / current_section_sha256: 30eb7f1ebc78889dc640155aa09811c7a6bcc2938bb4e34f122f245442c97952 / comparison: 対象節は9/28採用固定revisionと同文。current file全体の採用を意味しない。 / identity: HARNESS-L2-023 / decision: docs/governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md / fixed_revision: f6dad2a33e24f000b87d7f09b8d40288257e74cc / current_section_sha256: 32ad44e70357315304c5da5ce012f7ba4b9956e27a699f21ecddea1c54eeaf03 / comparison: 対象節は9/28採用固定revisionと同文。current file全体の採用を意味しない。 / identity: HARNESS-L2-052 / decision: docs/governance/decisions/po-decision-2026-09-29-11candidates.md / version_decision: docs/governance/decisions/version-join-requirement-resolution-po-decision-2026-10-10.md / fixed_revision: d4b439e5c48591749709a8707d0ee319c673f000 / current_section_sha256: f801e11097fe905b8519978ade42e06f8b3504d6481f4e14fc67f863c769669f / comparison: VERSIONJOIN対象節digest f801e110…と一致。9/29の意味と10/10の版指定だけを使用する。 / identity: HARNESS-L2-053 / decision: docs/governance/decisions/po-decision-2026-09-29-11candidates.md / meaning_revision: 909c8015326f35f8d42ce12e3c388923de411d1f / adopted_meaning_section_sha256: ebc78869f6d94668d9fed00d0a0415d068d85c0f61c0d98f01a9c4ec39710587 / current_section_sha256: f3f41538d08f0f85bcf9eace48429bcfd655f77de108cfc313cf60c06c135a45 / version_decision: docs/governance/decisions/discipline-requirements-into-1.0-po-decision-2026-10-10.md / comparison: 意味は9/29固定採択、1.0印は10/10判断。042参照の未決を補完しない。 |
| operation_scope_boundary | 初回の053はidentity/意味revisionと供給された記録の照合を扱う。042参照未決とrename/move/split/merge/supersede/Design Refactor実操作の非選択は再開案unresolved_inputsに従って保持する。 |
| document_id | HARNESS-L10-PACK-functional |
| layer | L10 |
| pair | P3: L3↔L10 |
| category | functional |
| execution_entry | 承認済みL3/対oracle、下位証明receipt、組合せ契約、実operationのauthority/隔離/資源/観測を同revision/scopeへ結んで開始する。未来receiptを左L3起草の入力にしない。 |
| system_specific_obligation | 条件分類→呼出し可否→相関結果の流れで、宣言した選択範囲と実利用が一致し、不足・未観測が失われず、pack成功から上位成立を推定しないこと。command意味identityの照合とOSのCAS/保存結果を同operationへ結び、同一再送・異payload競合・OS拒否・unknownが互いに混同されず、意味同一だけで保存/原子性成功を成立扱いしないこと。asset identity・意味revisionと履歴/authority/oracle/edgeの照合結果を分け、欠落unknownと非選択の実変換を記録上の成功へ混ぜないこと。局所caseを集めるだけではこの組合せ義務を証明しない。 |
| required_evidence | 下位proof参照、固有義務ごとの結果、composition contract、機械導出の有無、入力/出力/拒否/副作用の実観測、oracle/revision/scope、不足・N/Aの理由/判定者/対象revision/再評価条件。計測を行う場合はHARNESS034の採用条件へ別途束縛する。 |
| completion | 未実行/片側欠落/別oracle/unknownを成功にせず、必要証拠の照合結果をHARNESS022/056の状態契約へ渡す。L10 VerifiedとPO L11 Acceptedを分ける。 |

## HARNESS-L10-010-F01 behaviorと所有境界

**parent**: HARNESS-L2-010
**requirement_ref**: HARNESS-L3-010-F01
**positive_input**: 同じ能力を2サービスが使う宣言を、部品/COREの一つのownerへ結ぶ。
**expected_observation**: behaviorと所有者が一意に辿れ、利用者2件とowner1件が区別される。
**negative_input**: 関数/フォルダだけをpackとする、二重所有、全能力を巨大packにまとめ交換不能。共用能力を特定サービスの専有packに置く。
**failure_observation**: 対象packに境界/所有findingを残し、適格構成として返さない。
**execution_state**: not_executed

## HARNESS-L10-010-F02 宣言の完全性

**parent**: HARNESS-L2-010
**requirement_ref**: HARNESS-L3-010-F02
**positive_input**: 各宣言と実利用依存を同じpack revisionで比較する。
**expected_observation**: 入力/出力/依存/義務/oracle/版が全て個別に辿れ、実利用に未宣言依存がない。
**negative_input**: 各項目を一つずつ欠落させる、実利用依存を追加して宣言へ記録しない。
**failure_observation**: 不足項目と依存identityを示し、契約の完全性を不成立にする。
**execution_state**: not_executed

## HARNESS-L10-010-F03 収載・除外と独立した版

**parent**: HARNESS-L2-010
**requirement_ref**: HARNESS-L3-010-F03
**positive_input**: 適格Aと未適格Bの構成について、A収載/B除外と各版/stateを比較する。
**expected_observation**: Aの適格性が上位未完で隠れず、Bは暗黙収載されない。
**negative_input**: pack昇格だけで製品を昇格、除外を省略、未検証Bを収載。
**failure_observation**: 不一致の構成を特定し、上位の適格性を推定しない。
**execution_state**: not_executed

## HARNESS-L10-010-F04 再現と局所置換

**parent**: HARNESS-L2-010
**requirement_ref**: HARNESS-L3-010-F04
**positive_input**: 固定入力/版の再生成と、Aのみ置換失敗してAの適格版へ戻す検証条件を準備する。
**expected_observation**: 意味/成果の再現根拠、旧/新/復旧先と非対象Bの版/証拠が同revision/scopeで照合可能。
**negative_input**: latestへ暗黙更新、復旧先不明、非対象Bの証拠を失う。
**failure_observation**: 再現/復旧の不足を返し、更新/切替成功を主張しない。
**execution_state**: not_executed

## HARNESS-L10-011-F01 画面から独立した呼出し

**parent**: HARNESS-L2-011
**requirement_ref**: HARNESS-L3-011-F01
**positive_input**: 同じ意味入力を画面なしのconsumerと別作業環境のconsumerから与える。
**expected_observation**: 宣言した能力と入出力契約で同じ意味結果を照合できる。
**negative_input**: 特定GUIや固定pathだけの隠れた入力を要求する。特定AI provider/CI製品がなければ呼べない。Web固有の要求または設計をこの契約から導く。
**failure_observation**: 当該実装依存を不足/契約違反として示し、環境非依存を成立させない。
**execution_state**: not_executed

## HARNESS-L10-011-F02 呼出しと依存版の照合

**parent**: HARNESS-L2-011
**requirement_ref**: HARNESS-L3-011-F02
**positive_input**: 互換範囲内と範囲外、unknownの版を別入力で照合する。
**expected_observation**: 対応した範囲だけ参照可能。unknown/不一致は利用保留として返る。
**negative_input**: version_targetを実contract版にする、別版へfallbackする。
**failure_observation**: 相違軸と対象版を返し、その利用の成功を認めない。
**execution_state**: not_executed

## HARNESS-L10-011-F03 権限・隔離の受渡し

**parent**: HARNESS-L2-011
**requirement_ref**: HARNESS-L3-011-F03
**positive_input**: 必要権限と隔離scopeを宣言したcallと、範囲外資源を要求するcallを比較する。
**expected_observation**: 宣言と実際のアクセス対象をscopeへ結び、範囲外操作は未実施/拒否を証明する。
**negative_input**: 渡していない権限、別tenant資源、共有鍵を暗黙利用する。
**failure_observation**: 範囲外作用を成功にせず、認可/隔離の契約ownerへ戻す。
**execution_state**: not_executed

## HARNESS-L10-011-F04 相関した進行・結果・証拠

**parent**: HARNESS-L2-011
**requirement_ref**: HARNESS-L3-011-F04
**positive_input**: 完了/失敗/途中停止のcallを同じ入力revisionと相関IDへ対応付ける。
**expected_observation**: 進行と結果と証拠が別に辿れ、別callの証拠を混ぜない。
**negative_input**: 相関欠落、別scopeの証拠、表示成功から保存成立を推定。
**failure_observation**: 該当結果を未完/不一致として返し、証拠の所属を訂正する。
**execution_state**: not_executed

## HARNESS-L10-011-F05 停止・期限・再開

**parent**: HARNESS-L2-011
**requirement_ref**: HARNESS-L3-011-F05
**positive_input**: 途中で停止し、同じ冪等キーと記録した状態を使う再開、期限切れを別caseにする。
**expected_observation**: 既実施範囲と再開範囲が辿れ、期限切れは未完として残る。
**negative_input**: 途中状態無しで成功再開、期限切れを成功、同キーでscopeが違う状態を使用。
**failure_observation**: 再開対象の不足/不一致を示し、成功や重複作用の無さを推定しない。
**execution_state**: not_executed

## HARNESS-L10-023-F01 4区分の意味

**parent**: HARNESS-L2-023
**requirement_ref**: HARNESS-L3-023-F01
**positive_input**: 各区分の依存を一つずつ持つ宣言とoperation/source選択入力を与える。
**expected_observation**: 常時+成立操作条件+選択source条件の依存だけを必要とし、条件false/未選択未観測/参照のみを別に返す。
**negative_input**: 全対応sourceを常時必須とする、必要依存を単なる対応可能一覧へ落とす。分類で機能/owner/上位要求/版成熟度を変更、後続版能力を1.0へ強制、必要安全依存を後続版として除外、未選択能力の1.0完成義務を削除・延期。
**failure_observation**: 誤分類と影響する利用を示し、当該closure成立を認めない。分類による意味/版scopeの変更を特定し、元の要求と完成義務を保持して拒否する。
**execution_state**: not_executed

## HARNESS-L10-023-F02 条件の未知と保留

**parent**: HARNESS-L2-023
**requirement_ref**: HARNESS-L3-023-F02
**positive_input**: 同じ操作条件にtrue/false/unknown/staleを与えて別々に照合する。pack宣言不足、呼出し入力不足、authority/安全/親scope矛盾を個別caseとして与える。
**expected_observation**: trueは必須、falseはその操作を含まない利用に限り除外、unknown/staleは該当操作保留。3つの不足種別ごとに上記owner/POと010/011への戻し先が理由付きで照合できる。
**negative_input**: unknownをfalse、source選択unknownを未選択として閉じる。戻し先を取り違える、POが持つ意味を呼出しownerが推定、保留を別source/手作業/参照資料で迂回。
**failure_observation**: 元の未知と不足依存を保存し、別操作全体を根拠なく停止しない。種別・不足・正しい戻し先を示し、根拠未成立の当該操作を保留したままにする。
**execution_state**: not_executed

## HARNESS-L10-023-F03 選択sourceと安全依存

**parent**: HARNESS-L2-023
**requirement_ref**: HARNESS-L3-023-F03
**positive_input**: Worker入力028を選び他sourceを選ばない宣言、必要な安全条件が揃う/欠ける利用を分ける。
**expected_observation**: 選択sourceと該当安全条件をclosureへ含め、未選択sourceは未観測。安全条件unknownは保留。
**negative_input**: 選択source失敗から暗黙fallback、安全を参照資料へ分類、未選択成功を返す。credential条件をoptional化。実行条件/source authority/required oracleの文書を参照資料へ分類して依存を消す。
**failure_observation**: 不足source/安全依存を示し、実利用可否を不成立/保留にする。authority/oracle/credentialを含む必要依存の誤分類を特定して拒否する。
**execution_state**: not_executed

## HARNESS-L10-023-F04 分類と実利用の分離

**parent**: HARNESS-L2-023
**requirement_ref**: HARNESS-L3-023-F04
**positive_input**: 未実装依存を含む宣言を分類し、その同じ結果で利用成立を求める。
**expected_observation**: 分類結果は不足を伴って成立し得るが、利用実行の成立は不足のまま別結果になる。
**negative_input**: 分類成功を利用許可/機能成立とする、全source実装を分類開始条件にする。
**failure_observation**: 二つの成立判定を区別し、全体gateの追加や未完隠蔽をしない。
**execution_state**: not_executed

## HARNESS-L10-052-F01 command意味identityの4軸

**parent**: HARNESS-L2-052
**requirement_ref**: HARNESS-L3-052-F01
**positive_input**: 同じIDと異なるscope/base/payloadの入力を個別に比較する。
**expected_observation**: 4軸の値と相違が辿れ、ID一致だけでは同一操作にならない。
**negative_input**: IDだけで同一操作、path/PR番号/到着時刻で意味identityを決める。
**failure_observation**: 誤った代替軸を示し、同一操作として受理しない。
**execution_state**: not_executed

## HARNESS-L10-052-F02 正規化規則とscopeのrevision

**parent**: HARNESS-L2-052
**requirement_ref**: HARNESS-L3-052-F02
**positive_input**: 同じ意味payloadを固定規則/revisionで再評価し、規則revisionだけが異なる入力も比較する。
**expected_observation**: 固定条件で意味digestが一致し、規則/revision違いは同一digestの根拠にしない。
**negative_input**: 規則revision欠落、別revisionのdigestを同一評価とする。
**failure_observation**: 根拠不足または不一致をunknown/conflictへ残し、規則を推測しない。
**execution_state**: not_executed

## HARNESS-L10-052-F03 同一操作の再送

**parent**: HARNESS-L2-052
**requirement_ref**: HARNESS-L3-052-F03
**positive_input**: 初回と全軸一致の再送について入力値と意味結果を比較する。
**expected_observation**: 両方が同一identity/意味結果に結ばれ、再送の別意味変更が発行されない。
**negative_input**: 全軸一致の再送を別意味変更、意味同一から実retry成功を推定。
**failure_observation**: 意味判定の違反または未実証の運転を示し、二重意味変更を成立扱いしない。
**execution_state**: not_executed

## HARNESS-L10-052-F04 異payload・scope・baseのconflict

**parent**: HARNESS-L2-052
**requirement_ref**: HARNESS-L3-052-F04
**positive_input**: 同じIDでpayload atom一つ、scopeだけ、baseだけを変える三つの後続入力を独立に比較する。
**expected_observation**: 各相違がconflictとなり、先行identity/結果/receiptのdigestとrevisionが不変で二つ目の意味revisionがない。
**negative_input**: 異payloadを同IDだけで冪等扱い、scope/base違いで先行receiptを上書き。
**failure_observation**: 相違軸と先行identityを返し、後続入力の受理と先行証拠の置換を拒否する。
**execution_state**: not_executed

## HARNESS-L10-052-F05 OSのbase CASと意味判定の分離

**parent**: HARNESS-L2-052
**requirement_ref**: HARNESS-L3-052-F05
**positive_input**: 同じ意味payloadの古いbaseをOSがstale/conflictとした入力を意味照合へ渡す。
**expected_observation**: 意味identityの照合根拠とOSのCAS結果が区別され、保存拒否が保持される。
**negative_input**: payload一致だけでOS拒否を無視、HARNESSでCAS保存を代行。
**failure_observation**: OS結果と対象baseを保持し、該当canonicalizationを成立扱いしない。
**execution_state**: not_executed

## HARNESS-L10-052-F06 欠落・unknownの保留

**parent**: HARNESS-L2-052
**requirement_ref**: HARNESS-L3-052-F06
**positive_input**: 各必要値を一つずつ欠落させ、正常入力と比較する。
**expected_observation**: 欠落値と不足scope/revisionが個別に示され、passにならない。
**negative_input**: unknownを同一payloadとする、他scopeのoracleや先行identityを流用。
**failure_observation**: 不足と差戻し先を保持し、当該意味判定を成功へ変えない。
**execution_state**: not_executed

## HARNESS-L10-053-F01 path非依存のasset identity

**parent**: HARNESS-L2-053
**requirement_ref**: HARNESS-L3-053-F01
**positive_input**: 異なるpathで同一asset ID、同一pathで異なるasset ID、同名異義の記録を個別に照合する。
**expected_observation**: 同一性はasset IDと履歴へ結び、path/nameの一致と区別される。
**negative_input**: 同じpathを再利用して旧identityへ併合、同名異義を同一asset、identity重複を隠す。
**failure_observation**: 競合/対応不明のidentityをunknownへ残し、path/nameだけで同一と返さない。
**execution_state**: not_executed

## HARNESS-L10-053-F02 意味revisionと差分

**parent**: HARNESS-L2-053
**requirement_ref**: HARNESS-L3-053-F02
**positive_input**: 意味変更前後と、意味不変のlocation変更だけの記録を別入力として照合する。
**expected_observation**: 前者は意味revisionと差分/影響、後者は同identity/location履歴として区別される。
**negative_input**: location差分だけで意味revisionを発行、意味差分をlocation履歴だけとして隠す。
**failure_observation**: 相違する意味/location軸と影響を返し、誤ったrevision分類を成立扱いしない。
**execution_state**: not_executed

## HARNESS-L10-053-F03 供給されたlineage記録の対応

**parent**: HARNESS-L2-053
**requirement_ref**: HARNESS-L3-053-F03
**positive_input**: 供給されたlocation履歴と前後identity/関係/authority/oracle/edgeが揃った記録を、それぞれ対応表へ照合する。
**expected_observation**: 記録上の対応を個別に辿れ、対応表成立を実変換/保存/authority移転の成立としない。
**negative_input**: 親子/統合元/後継の追跡切断、関係種別の欠落、base revision違い、lineage先不在。
**failure_observation**: 不足関係と影響historyをunknownへ残し、全履歴保持や実操作成功を主張しない。
**execution_state**: not_executed

## HARNESS-L10-053-F04 authority・oracle・typed edge欠落

**parent**: HARNESS-L2-053
**requirement_ref**: HARNESS-L3-053-F04
**positive_input**: authorityだけ、oracleだけ、typed edgeだけを欠落した三つの入力を、全項目が辿れる入力と別々に比較する。
**expected_observation**: 各欠落は具体的項目と対象identity/revisionへ結ばれ、authority保持/受入可能/lineage closureを合格にしない。
**negative_input**: historyがあるのでauthority移転済み、authorityがあるのでoracle不要、receiptがあるのでedge保持済みとする。
**failure_observation**: 該当欠落のunknownを保持し、成立している別項目を全closure成功へ昇格しない。
**execution_state**: not_executed
