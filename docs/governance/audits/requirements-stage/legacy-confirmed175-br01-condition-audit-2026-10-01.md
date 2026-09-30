# confirmed175 BR-01 条件別照合

監査時点: `2026-10-01`。比較baseはmain `a1fbe91d9ceb41d3d2655cdb7fce0bfaf8592acc`。
対象は旧confirmed identity `harness/L1-requirements/business-requirements.md::BR-01`、旧source line 41。
比較先はPOが2026-09-28に固定した `f6dad2a33e24f000b87d7f09b8d40288257e74cc` のHARNESS L2/L11 bytes。
これは読取専用の意味照合であり、`authority_effect: none`。採択、formal successor割当、条件閉包、Step 5完了、実装・実行・受入を主張しない。

## 旧sourceと既存状態

旧source line 41（archiveとholding双方のfile SHA-256 `09ad9a27afe25bd730f57319865d1f342e6b31729da2dd27f22ecd6cb753ac61`、line SHA-256 `eea2c595f0f92bc8fbacd8c06e912db0438567da39979ecba646ca12302786fc`）は、次の条件を示す。

> 設計⇔実装⇔テストの整合を機械強制し、AI 委譲しても回帰が壊れず **1 案件を L0-L14 通しで回せる**

原文の明示数値・参照は「1案件」「L0-L14」「concept P1 / 成功① ③」。このBR-01行自体には回帰率等の閾値、例外、個別negative caseはない。

資産 `LEGACY-ASSET-9F48ADEEB477DCA54039` はsource snapshot preservationで、旧source authorityはconfirmed、target authorityはdraft_candidate、carryは`preserved_pending_rehome`、successor未割当。資産台帳のconsumer refsは`requirement-carry-forward-ledgers`と`requirement-atomization-review`。旧functional baton tableのREQSRC-LINE-00092/000397等、運用test pair表のREQSRC-LINE-00116、PM-01/02等にBR-01参照があるが、これらは別の旧source identity・未atom化consumer参照であり、BR-01の移管完了やsuccessorを示さない。

全量監査はBR-01を「既存crosswalkが再導出／保持を報告。ただしsource atomごとのcarry-forward未割当」と分類し、HARNESS-L2-001/003/004/005とL11 21・23–25を関連付ける。queueは個別比較なしと記録する。本監査でqueue、full audit、既存confirmed175個別監査全件を照合した。queueとfull auditのBR-01行は母集団・既存状態の記録であり、固定f6dad2aとの個別条件比較ではなかった。#2421のDAC-BR-001..005個票もsource-qualified identityで走査した。これは`helix/L1-requirements/document-authority-census-requests.md`のDAC-BR名前空間であり、`harness/L1-requirements/business-requirements.md::BR-01`とはsource path・identityが異なるため重複しない。個別監査JSONをsource-qualified identityの完全一致で走査し、BR-01比較記録の重複がないことを確認した。

## 固定L2/L11との比較

固定HARNESS L2/L11 file SHA-256はそれぞれ `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a` と `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4`。行別SHAと現物照合は併設JSONに記録する。

| 旧条件 | 固定pairで保持・再導出される範囲 | 未閉包の残差 |
|---|---|---|
| 設計・実装・testの整合を機械強制 | HARNESS-L2-001は正規のL1–L12 pairとL2/L11・L3/L10の区別を置き、L0 charterを層外の根拠として残す。L2-004は要求変更から影響する設計/testと再検証範囲を導く。L2-005はticket関係、変更種類・layer・riskから検証義務と証拠条件を導き、言語/tool/実装方式に依存させない。 | BR-01固有の全projectに対するtrace完全性／設計・実装・test整合のend-to-end受入oracleは固定pairにない。これらの一般契約はsuccessor割当や全条件被覆を証明しない。 |
| AI委譲後も回帰を壊さない | L2-003は未合意・未検証の進行を止め、Vの谷より右で実物を対の設計と照合し、意味を保つ変更だけをRefactor、意味変更をBackflowする。L2-004は変更条件の再検証を導き、L2-005はoracle、expected failure、evidence、有効期限、差戻し先を説明可能にする。 | BR-01には回帰率や許容数値がない。固定pairもBR-01専用のregression fixture一式、failure/output schema、回帰ゼロの判定oracleを確定しない。実装で回帰しない証拠も評価対象外。 |
| 1案件をL0-L14通しで回せる | L2-001は企画から検証までを現行L1–L12と正規V-pairで構成し、L2.5結果を要求合意と区別する。L2-003は開始・凍結・差戻し・再開・完了、各artifact状態、Release条件を明確にする。L11-001/003はpair、非適用理由、未合意・未検証停止、状態推定禁止を確認する。 | 「1案件」という単独実行単位と、その一案件の全工程を受け入れるBR-01個票oracleは書かれていない。旧L0-L14番号は現行番号へ転記せず、現行pairはL1–L12、L0は層外anchorとする。 |
| `concept P1 / 成功① ③` | trace sourceを示すラベルとして保持する。関連する現行契約は上記L2-001/003/004/005。 | trace labelは追加の条件や採択を作らず、BR-01の条件閉包を意味しない。 |

固定L11のnegative／boundary条件には、L2.5結果を要求合意としないこと、L2.5を飛ばす場合の非適用理由、未合意・未検証の停止、状態の前工程からの推定禁止、意味変更のBackflow、検査省略の記録と後続ticket回収がある。これは現行の工程契約を具体化するが、旧BR-01が明記した例外ではなく、BR-01の全受入を証明するものでもない。旧行にない数値閾値やnegative oracleを新設していない。

## 固定revision後の採択pair

2026-09-29の57候補判断はHARNESS-L2-041/042/046を採択し、043/044を条件付き採択した。041のactive templateからの義務抽出とgap提示、042の意味を保つDesign Refactorのsemantic/consumer/oracle/dependency根拠、046のFull V／Scrum工程条件は関連する下流契約を限定的に補う。041は層ledgerを定義せず、その役割はHARNESS-L2-040とHELIXOS-L2-038にある。042はDesign Refactorの範囲、046は開発方式条件の範囲であり、いずれもBR-01固有の一案件end-to-end受入や回帰なしoracleではない。043/044の配置・portfolio条件もBR-01固有条件を追加しない。

2026-09-29の11候補判断はHARNESS-L2-049の当時の-002を採択せず、2026-09-30 live26判断が訂正後-003の表示可能prototype計測を採択した。live26で採択された055/056は選択されたFR-L1-48/49 atomに限る。057＋OS-054、058＋OS-034＋OS-101、059＋OS-102は通常採択のセットであり、リスク受容、Issue契約など各組の限定条件を持つ。これらはBR-01の全工程・一案件受入・AI委譲回帰oracleを追加しない。判断記録・対象revisionのpinと評価はJSONに記録した。後続pairをf6dad2aの本文へ混ぜず、固定比較の結論は維持する。

2026-09-30 live26判断はHARNESS-L2-060＋HELIXOS-L2-103をA案で一体承認した。HARNESS-L2-060は現行契約上で適用が決まった工程に限り入力revisionと段階証拠を結び、HELIXOS-L2-103は同じscope/revisionのevent・current projection・利用可能な因果参照を記録する。B案の旧工程列と前段証拠を全案件へ一律必須化する扱いは採られていない。旧HIL-FR-01のend-to-end lifecycleは`MPR-SH-IR-003#HIL-FR-01`にholdingのまま残るため、このpairはBR-01ごとの「1案件をL0-L14通しで回せる」受入義務を閉じない。採択pairは現行の適用工程の証拠連鎖を限定して支えるが、全案件共通の旧stage chain、一案件end-to-end oracle、L0-L14全工程を通す結果は未確認であり、BR-01のsource atom・formal successor・条件閉包の残差は維持する。判断、MPR registration、L2/L11 section pinはJSONに記録した。

## 残差と検証

BR-01は引き続き`preserved_pending_rehome`でsuccessor未割当。個別比較で確認できたのは工程・pair・影響・検証義務に関する広い保持／再導出であり、単一案件のend-to-end受入、BR-01専用の回帰oracle、atom単位の引継ぎは未確認である。この記録は要求意味の変更、旧条件のretire、後続作業の許可を与えない。

JSON構文、旧sourceと固定targetのfile/line pins、full auditとqueueのidentity、既存個別監査との重複、後続decision参照を静的照合した。旧CLI/runtime/hook/test/CIは実行していない。`scfctl validate`および`git diff --check`の結果をこのcommitに記録する。
