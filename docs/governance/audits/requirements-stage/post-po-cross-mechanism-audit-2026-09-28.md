# PO判断後の横断照合・旧sourceデグレ監査

## 対象と判断の反映

対象は本体8機構である。基準mainは `85cee18960bd1973fb1b28132e6498464b0f673b`。
[前回の総合検証](integrated-verification-2026-09-27.md)の後に、POは#2198〜#2205の固定L1 revisionを確定し、L2と対になるL11の要求一式に合意した。
本記録は判断の反映と静的な照合の証拠であり、L11実行結果やL3承認を示さない。

| 機構 | 判断記録 | 採用候補 | 確認PR |
|---|---|---:|---|
| HARNESS | [判断記録](../../decisions/helix-harness-requirements-po-decision-2026-09-28.md) | 24 | #2198 |
| OS | [判断記録](../../decisions/helix-os-requirements-po-decision-2026-09-28.md) | 16 | #2199 |
| BRAIN | [判断記録](../../decisions/helix-brain-requirements-po-decision-2026-09-28.md) | 42 | #2200 |
| LABO | [判断記録](../../decisions/helix-labo-requirements-po-decision-2026-09-28.md) | 53 | #2201 |
| INTELLIGENCE | [判断記録](../../decisions/helix-intelligence-requirements-po-decision-2026-09-28.md) | 54 | #2202 |
| SECURITY | [判断記録](../../decisions/helix-security-requirements-po-decision-2026-09-28.md) | 28 | #2203 |
| INFRASTRUCTURE | [判断記録](../../decisions/helix-infrastructure-requirements-po-decision-2026-09-28.md) | 26 | #2204 |
| CONNECT | [判断記録](../../decisions/helix-connect-requirements-po-decision-2026-09-28.md) | 7 | #2205 |

[機械照合記録](po-confirmation-closure-2026-09-28.json)に、8 PRのreview対象HEAD・指摘0件comment・merge commit・read-after、24承認対象文書のSHA-256、採用250候補と最新registration ID・decision・receiptの対応を収録した。
8 PRの変更16ファイルはreview対象HEAD、merge tree、上記基準mainで同じblobである。24要求文書はPOが確認した `f6dad2a33e24f000b87d7f09b8d40288257e74cc` と同じbytesである。
registerの過去行やregistered_proposal／authority_effect:noneは変更せず、採用は外部decisionから読む。250候補は全件採用であり、保留・不採用への暗黙変更はない。別のrouting／移管宣言22件を追加採用候補として数えない。

## 判断前の論点との照合

| 論点 | PO判断後の状態 | 本文との照合 |
|---|---|---|
| 8機構のL1対象revision、L2／L11一式 | 各decisionの固定revisionで確定・合意 | 24文書SHA一致。文書内draft metadataは固定時点の値を残し、decisionを優先する |
| HARNESSの所属 | 029＝CORE、031＝共通部品、032＝CORE | L2と対のL11の既存所属に一致。本文・registerの訂正は不要 |
| SECURITYのauthority範囲 | A案：全操作の境界、有効な既決権限の再利用、毎回人間確認を追加しない | L2-008/009/022〜024の意味と対のL11に一致。通常操作への新しい承認gateを足さない |
| version_target | 採用時の値・適用条件を保持 | 1.0配属214件、後続版33件、Web source条件付き3件という前回分類を変更しない。SECURITY-026の1.0はGuard責務境界に限定 |
| INFRASTRUCTURE | 1.0最低18項目の要求範囲を保持 | 全26候補の採用を、後続版能力の1.0前倒しへ読み替えない |
| 要件で確定する事項 | 前回のL3引継ぎを保持 | 数値・予算・形式・版・実現可能性等の技術導出と、要求意味の変更を区別する |
| 実装順序A/B | 未判断 | L3開始時のPO判断として残す。今回の要求合意から順序の選択を生成しない |
| 旧source未完引継ぎ | 保持し、デグレ照合を別途実施する | 250候補採用や24文書SHA一致を旧資産全件の無損失移管証明にしない |

## 接続・依存・責務

要求本文の変更がないことを確認した上で、[結合・責務・機能境界](coupling-boundaries-2026-09-27.md)、[横断解消](cross-mechanism-resolution-2026-09-27.md)、[L3引継ぎ](l3-handoff-2026-09-27.md)とのPO判断の衝突を照合する。

- HARNESSは工程と意味oracle、OSは割当・実行管理、INTELLIGENCEは案と予測・配置支援、LABOは履歴水準と比較評価、BRAINは知識の保持・提供を担う。採用によるownerの交換はない。
- CONNECTは登録・契約版・stale・通信・再送・追跡・交換の共通条件を持つ。各接続の業務上の意味は元の機構に残る。
- SECURITY全操作境界の採用は、選択されていない外部作用の権限や、Web展開後の機能の先取りを意味しない。有効な既決権限を再利用し、通常作業を一律に人待ちにしない。
- INFRAの資源・復旧とOSの作業状態を分ける。独立OOB復旧を通常のOS実行経路へ閉じ込めず、初回の未評価状態を成功や評価済みに変えない。
- 契約版とscopeを保持し、失敗・stale・未完義務を受け手と戻し先へ引き継ぐ。各版・各操作に条件付きの依存を常時必須へ変えない。

この範囲では、PO判断によって新たに生じた責務・依存・版の矛盾は確認しなかった。旧sourceに対する欠落の有無は、次のデグレ照合で独立に扱う。

## 旧HELIXからのデグレ照合

監査成果を検収中。旧sourceのpath・行・asset ID・SHAと現行ID／L11の対応を下位資料に集約する。旧CIの性能候補条件、旧Benchのhidden oracle・blind judge条件の具体的引継ぎ先を確認している。いずれも旧sourceはdraftであり、採用済み旧要求の消失とは断定しない。本監査の後に未解消事項を消化し、要求ステージ終了の条件を再照合する。

## 現行入口と作業表示の追随

[作業入口](../../new-generation-start-here.md)と[上流authority管理台帳](../../upstream-authority-register-2026-09-14.md)に8判断記録への入口を設けた。旧観測時点の未合意・旧4対象の説明を、現在の8機構固定revisionの状態として読まないよう明示した。要求本文24ファイルは変更しない。
旧 `archive/legacy-generation-2026-09-14/root/CLAUDE.md:65-85` （SHA-256 `7bdfc0bc578359e42efae4242ee42b53abd6e2ec23874f1294d3ec0e278c8feb`）の層別取捨選択・inventory-first・人の企画／要求とAIの起草の分担を参照し、対象revisionを示す人間decisionに従う点を保持する。旧層番号・旧実行経路は現行へ転用しない。
Issue #1907は現行8対象の本文と判断記録へ追随し、OPENを維持した。旧説明は履歴として保持し、Issue更新を要求完了の証拠にしない。

## 静的検証

[検証記録](final-static-validation-2026-09-28.json)に対象validatorのSHA・結果と既知失敗のerrorを保存した。

- Scaffold Binding 142件：validate fail 0、stale 0、residuals 0。selftest 69件成功。
- governance：govcheck、rulebook再生成照合、govcheck selftest成功。
- 現行研究validator 137件：105成功・既知32失敗。既存結果とpath／returncode／作業先pathを正規化した失敗本文が一致し、新しい失敗は0件。
- 入口・台帳変更に対するbindingの変更はupstream SHA／追随noteに限定。動作契約は不変。OUTSIDE67-PATH-060の現行counterpartはSHA／bytesだけを更新し、固定commit・旧source・captureは変更しない。
- registerは追記・変更0行で、250候補の最新IDは各判断記録の候補集合に一致。相対file参照とdiff空白検査も成功。

既知32失敗は成功へ置き換えない。旧CIや旧testを代替実行していない。
