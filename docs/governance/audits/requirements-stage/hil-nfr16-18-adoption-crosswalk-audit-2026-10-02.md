# HIL-NFR-16〜18 現行L2/L11との条件別照合

監査基準は `bca7592cf444b07292a1366e3b28e7de4d9f88cb`。旧archiveはsource・consumer・判断史の読解だけに使い、旧runtime、test、CLI、CIは実行していない。原文pin、current section digest、決定行、NFR17を選択したOS112 receiptはpaired JSONに記録した。

## authorityと対象範囲

2026-09-28 OS decisionはL2-001〜029および対のL11本文を固定し、018/019を含む明示16候補を採択している。現行018/019のsection digestはdecision固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc` のbytesと一致する。032は2026-09-29 57-candidate decision 55行で採択され、L2/L11の現行sectionはdecision記録のdigestと一致する。見出しの「候補」語だけから未採択とは読んでいない。

112は未採択候補だが、旧NFR17をsource atomとして直接含み、classification、最小取得、redaction、retention/freshness policy参照、機微データ漏えい否定oracleを候補本文へ具体化している。receipt上のselected atomはBR15、FR23、FR24、NFR17の4件で、NFR17のIR statement pointerはsource-linesに記録済み。旧L1 197行は同じidentityへのcorroborating referenceで、追加atomではない。従ってNFR17の重複候補は作らず、112の採否未決を保つ。

120のL2/L11 sectionはそれぞれ `HELIXOS-L2-120` / `HELIXOS-L11-120` 見出しに存在するが、未採択候補でsourceは別identityのHIL-FR-32である。120にあるlease/fence/checkpointの一般lifecycle条件を、NFR18の採択済みclosureへ足し込まない。

## 条件別照合

| 旧条件 | 現行の具体箇所 | 判断 |
|---|---|---|
| NFR16: exact fingerprintのみ、wildcard禁止 | 採択032 L2/L11はcheck identity/version・known fingerprint・policy baselineを束縛し、L11のwildcard、fingerprint変更、version未宣言negativeを持つ。旧HR-FR-HIL-06/HAC-HIL-06cもexact-known-onlyとfingerprint変更を扱う。 | 保持済み。 |
| NFR16: 無期限不可 | 採択032はexpiryまたはiteration上限を要求。期限切れ、上限超過、両方欠落は不適格。 | 保持済み。 |
| NFR16: directory単位・全check一括の禁止 | 採択032はeligibilityを「check単位の例外」として扱い、exact check identity/version・fingerprintを要求しwildcardを拒否する。別個のdirectory/all-check fixtureはない。check単位の明示条件は広域例外禁止を意味的に含み得るため、fixture名の欠落だけで残差とはしない。 | 既存のcheck-unit/exactnessで包含される解釈が妥当。個別fixture不在のみを根拠に新要求を起こさない。 |
| NFR16: 期限切れ、対象変更、fingerprint変更で失効 | 032は期限/iteration上限超過、fingerprint変更、baseline不一致、scope外を拒否する。一方baselineとcurrent HEAD/treeを別fieldとし、scope内で条件が一致すれば対象変更後も同じpolicyでeligibleになり得る。旧run receipt流用拒否とquarantine自体の失効は異なる。032の選択sourceはFR29/HAC06cでありNFR16の採択ではない。 | 意味差あり・未証明。対象変更で例外が失効する条件をNFR16 source holdingに残し、忠実候補または意味変更の要否を判断材料として具体化する。 |
| NFR18: lease失効後の実行継続を拒否 | 採択018はscope/head/lease/capability/authorityの不一致で起動または継続を止め、途中成果を隔離して未完義務をhandoffする。019はstale/拒否/未実行を成功と区別する。 | 一般的な継続停止・未完保持は採択済み。 |
| NFR18: 失効後、fencing token不一致のtool call/artifact/completionを拒否 | 旧HR-FR-HIL-08はfencing下のlease/lifecycleと旧fence拒否を持つ。採択018はlease等の不一致で実行継続を止め、途中成果を隔離する。残差候補は、lease失効後に届くtool call/artifact/completionだけを対象attemptの現在fenceへ束縛して拒否する条件であり、通常の有効な実行中callすべてへ追加gateを広げない。019はevent/provenance/checkpoint一般条件で、この遅延効果ごとのtoken照合を明記しない。 | 狭い追加保証の可能性が残る。旧sourceはtool call/artifact/completionを個別に挙げる。既存の停止・隔離が遅延到着分まで確実に拒否するかを区別し、OS120は別FR32候補として代用しない。 |
| NFR18: crash後は最後のdurable checkpointからだけ再開 | 採択019はeventのprovenanceと訂正履歴、保存/projection失敗時の成功checkpoint公開禁止、原eventからの再構築、未完義務保持を要求。L11はprovider-memory/summaryのみから再開する負例を持つ。 | durable/成功checkpointの一般境界は保持済み。複数checkpoint時に「最新のdurable checkpointだけ」を選び、それより古いcheckpointや未durable進捗からの再開を拒否する順序選択は明示されず、原文のexclusive条件は未証明。 |

## 残差と次の扱い

NFR16の対象変更によるquarantine失効は、032のrun receipt結合だけでは保持を証明できない。対象変更後もpolicy scope内なら適用が続く032と旧条件との差を保持し、この条件をsource holdingに残す。NFR18では「失効後に到着するtool call/artifact/completionをfencing token不一致で拒否すること」と「最後のdurable checkpointだけを再開点にすること」が、採択済み本文の明示保証として確認できなかった。原文条件を保持する忠実候補または意味変更の選択肢を具体化する。採択済み018/019/032や別sourceの120を書き換えない。

旧HAT-HIL-06/08は `designed_not_implemented` の設計資料であり、実行証拠として扱っていない。`docs/governance/audits/requirements-stage/hil-nfr16-18-adoption-crosswalk-audit-2026-10-02.json` が機械照合用のsource/section/decision hashesを保持する。
