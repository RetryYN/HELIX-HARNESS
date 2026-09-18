# L2D-S1-01 authority語彙分離 人間判断packet（v1、superseded）

prepared_at: 2026-09-17
status: superseded_by_v2
superseded_by: `docs/governance/audits/source-rebaseline/l2d-s1-01-authority-vocabulary-human-decision-packet-v2.md`
superseded_reason: 本packetの入力分母は旧AVS 3文書だけであり、2026-09-18に成立したsource holding `MPR-SH-LEGACY-RULE-004`（規則atom 7,622件）とRDP-002 clusterを計上していない。本packetのまま承認しない。計上した意味（AVSのL1 atom 6件、L3 atom 20件、L10 oracle 20件）はv2でも生存する。
decision_unit: L2D-S1-01
authority_effect: none
proposed_disposition: split

## 判断する内容

旧`authority-vocabulary`系列が保持する意味を、次の責務分割で対象別L2／L11へ採用してよいかを判断する。

- HELIX-HARNESSは、request／directive／selection／approval／decision／disposition／runtime judgmentを
  工程上の異なる意味として規定し、指示を要求・設計・検証・完了の代替にしない条件を所有する。
- HELIX-OSは、各identityの出典、対象、scope、revision、actor、期限、状態、正本pointerを記録・投影し、
  AI解釈、GitHub actor、通知、memory、旧語彙から人間authorityを生成しない統制を所有する。
- 旧候補が指定したschema、DB identity、CLI、prompt、adapter、doctor、PLAN signalの実現方式はL2で固定しない。
  承認された意味からL3／L10で再導出する。

これは要求本文の変更、successor確定、runtime適用、旧資産retireの承認ではない。本packetの承認後に、同じ判断revisionへ
束縛したL2／L11変更と無損失receiptを別PRで提示する。

## 判断対象revision

基準repository revisionは`edf87f61b11b8eedee106c17df26c9396875c1e7`である。

| role | path | SHA-256 | 現在のauthority |
|---|---|---|---|
| 旧L1意味source | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/authority-vocabulary-requests.md` | `5c29cba6331dff96082f74612ceaf755fe4a30a10e75be62797e8073de7fec99` | `draft_candidate`、historical source |
| 旧L3具体化source | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/authority-vocabulary-requirements.md` | `cb97e7594b38cfada7d4fedb948937bab9e9d8f3e7c7123eca82a7ce6e8f8eb4` | `draft_candidate`、historical source |
| 旧L10 oracle source | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/authority-vocabulary-acceptance.md` | `0641ced495a545ca4820eec457caecb6cdf53531a112e00024e8f7c6ce6179d0` | `draft_candidate`、historical source |
| HARNESS L2比較対象 | `docs/helix-harness/L2-requirements/product-requirements.md` | `a844c18a1c9e963093b8808bca1c70c7dce2ebd7bf1b1f00ca468a4a82700c77` | Concept／L1承認後、L2再採否待ち |
| OS L2比較対象 | `docs/helix-os/L2-requirements/governance-requirements.md` | `78467562f0eb6270bf552a5c10880e83e3a237d3d24eae281d658e6b454909be` | Concept／L1承認後、L2再採否待ち |
| HARNESS L11比較対象 | `docs/helix-harness/L11-acceptance/product-acceptance.md` | `11ff00b74f2b7e0286ed115ae35d62f34b9f65f72a19fb8b7265eda1b795e40b` | L2 pair再採否待ち |
| OS L11比較対象 | `docs/helix-os/L11-acceptance/governance-acceptance.md` | `db691bb55ab1079eeee70bc7cf86c61f197bf13d95455b9ad375f60fe3356a19` | L2 pair再採否待ち |

旧文書にある過去のIssue comment、`L3候補承認済み`という表記、旧PLANの状態は、新しいConcept／L1に対する
今回のL2／L11採否を成立させない。

## 親と接続案

| target | 親L1 | L2候補 | L11候補 | 所有する意味 |
|---|---|---|---|---|
| HELIX-HARNESS | HARNESS-L1-002／003／006、HARNESS-L1-004 | HARNESS-L2-003／005 | HCV4-L11-001／003／004／006と該当negative case | 工程で区別するauthority語彙、合意・凍結・再開条件、指示と技術根拠・検証証拠の分離 |
| HELIX-OS | HELIXOS-L1-001／008、HELIXOS-L1-002／004／007 | HELIXOS-L2-001／003／007 | HCV4-L11-001と「要求形成・人間反応」のAVS条件 | 出典・scope・revision・状態・pointerの保存、通知と正本の分離、stale・偽provenance・未承認操作の拒否 |

HARNESSが語彙の工程意味を決め、OSがその意味を勝手に変更せず記録・投影・執行する。OSの記録成功だけで
HARNESS上の合意、検証、受入、完了を成立させない。

## 旧L1 atomの無損失対応

| source atom | 保持する意味 | proposed target |
|---|---|---|
| AVS-BR-001 | 会話の口調やAI解釈から人間authorityを生成しない。directiveには実行意図・対象・許可scopeが要る | HARNESS-L2-003 + HELIXOS-L2-001／007 |
| AVS-BR-002 | 半永続なarchitecture・authority・責務境界だけをversioned decision recordが所有する | HARNESS-L2-003 + HELIXOS-L2-001 |
| AVS-BR-003 | selection、approval、disposition、runtime judgmentを別identityで保持する | HARNESS-L2-003 + HELIXOS-L2-001／003／007 |
| AVS-BR-004 | directiveは要求・設計・ADR・approval・技術根拠・検証・完了の代替にならない | HARNESS-L2-003／005 + HELIXOS-L2-003／007 |
| AVS-BR-005 | agent連絡は有期限coordinationと正本pointerに限り、長期authority本文と分ける | HELIXOS-L2-001／007。memory詳細はL2D-S2-04へ生存中保留 |
| AVS-BR-006 | workflow開始理由を人間directiveへ偽装せず、旧`po_directive`をcurrent出力にしない | HARNESS-L2-003 + HELIXOS-L2-001／003／007。signal実現はL3へ延期 |

6件すべてを計上し、削除候補は0件である。

## 旧L3 atomの無損失対応

| atom群 | source IDs | L2で保持する意味 | 実現詳細の扱い |
|---|---|---|---|
| 入力とdirective境界 | AVS-R-01、01A、02、03、03A、03B、03C | 入力種別、human provenance、委任scope、技術判断、反証、escalation境界を混同しない | exact enum、classifier、field構成はL3で再導出 |
| authority identity | AVS-R-04、05、06 | decision、selection、approval、disposition、runtime judgmentを区別し、対象revisionとscopeへ束縛する | schemaとDB identityはL3で再導出 |
| current／legacy境界 | AVS-R-07、08、09 | 曖昧な旧値を推測変換せず、current出力で包括的な`PO判断`等へ再集約しない | adapter、CLI、generated docs、prompt、doctorはL3で再導出 |
| coordination／knowledge境界 | AVS-R-10、11、12、15 | 通知・memoryをauthority正本にせず、失効を再提示せず、再利用知識は所定のadmissionを通す | memory詳細はL2D-S2-04、Learning詳細はL2D-S3-02へ生存中保留 |
| provenance／移行境界 | AVS-R-13、14、16 | AI・actor名・memory authorから人間provenanceを作らず、historical tokenをcurrentへ逆流させない | signal token、PLAN entry、compatibility adapterはL3で再導出 |

AVS-R-01から16までの20 atomをすべて計上した。別decision unitへ送る意味もsource ID付きで残し、今回の分割を
削除や不採用として扱わない。

## L11 negative oracleの保持

旧AVS-AC-001..016の20 oracleを次のfailure classとして保持する。L2適用PRでは各旧ACからHARNESS／OSのL11行への
完全な対応表を作り、未対応0を条件とする。

| source oracle | 保持するfailure class |
|---|---|
| AVS-AC-001 | 0件または複数の入力分類を拒否する |
| AVS-AC-001A | 実行意図・対象・許可scopeを欠き、口調だけに基づくdirective化を拒否する |
| AVS-AC-002 | 相談・叱責・質問・仮説からapproval／decisionを生成しない |
| AVS-AC-003 | 指示だけを理由に正本照合、安全確認、受入検証を省略しない |
| AVS-AC-003A | 指示だけを設計理由、review verdict、risk acceptance、完了証拠に使わない |
| AVS-AC-003B | 思考停止、盲目的実行、全件の人間丸投げを拒否し、authority矛盾とexact escalation境界を示す |
| AVS-AC-003C | 逐語実行や検討打切りを忠実性として合格にしない |
| AVS-AC-004 | Issue commentやmemoryだけのdecisionを拒否する |
| AVS-AC-005 | selection、approval、disposition、runtime judgmentをdecisionへ畳み込まない |
| AVS-AC-006 | 対象・scope・revision・actorとの束縛を欠くapprovalを拒否する |
| AVS-AC-007 | 曖昧な旧`decision`値を推測変換しない |
| AVS-AC-008 | current surfaceからgeneric decision identityを再出力しない |
| AVS-AC-009 | current identityを包括的`PO判断`／`PO決定`／`PO指示`へ再集約しない |
| AVS-AC-010 | requirement／design／profile本文をcoordination memoryへ保存しない |
| AVS-AC-011 | invalid／superseded memoryをcurrent guidanceへ再提示しない |
| AVS-AC-012 | Claude／Codex等の片側runtimeだけでauthority分類規則を変更しない |
| AVS-AC-013 | actor名やAI要約からhuman attributionを生成しない |
| AVS-AC-014 | historical greenでcanonical failureを相殺しない |
| AVS-AC-015 | memory本文をLearning admissionなしでSkill／Knowledge正本へ昇格しない |
| AVS-AC-016 | 未定義・wrong-axis・legacy provenanceによるworkflow開始を拒否する |

20 oracleすべてを個別計上し、未対応は0件である。

## 変更・棄却する旧拘束

| 旧拘束 | disposition案 | 理由 |
|---|---|---|
| 旧L1／L3／L10 identityをそのままcurrent canonicalへ昇格 | replace | 現行は承認済みConcept v4.1と4対象L1の下でL1-L12へ再配置する |
| `PO判断`／`PO決定`／`PO指示`を包括的current identityにする | reject_current_output | 出典、対象、scope、revision、判断種別を失わせる |
| generic `decision` fieldへ複数意味を格納する | reject_current_output | approval、selection、disposition、runtime judgmentを誤伝播する |
| memory、Issue、GitHub actor、AI解釈をauthority正本にする | reject | 人間provenanceと版付き正本を偽造または陳腐化させる |
| 旧schema／DB／CLI／prompt／adapter／doctor／PLAN signalをL2で固定する | defer_and_rederive | 意味要求より下流の実現方式であり、新世代architectureに合わせL3／L10で選ぶ |
| 旧`po_directive`をcurrent出力またはPLAN開始authorityにする | compatibility_input_only_candidate | historical inputの読取り要否をL3で判断し、currentへ再出力しない |

これは旧要求の削除ではない。意味atomを保持したうえで、旧identityと実現方式の拘束を新世代責務へ置き換える案である。

## 判断後にも残る未決

- exact enum、schema、record形式、DB要否、adapter、CLI表示、prompt、rule marker、doctor検査はL3／L10で決める。
- memoryのTTL、payload、失効とLearning admissionはL2D-S2-04／L2D-S3-02で決める。
- workflow signalのexact tokenとroute生成は、HARNESSの分類規範とOS推進責務を分けてL3で決める。
- 過去データのcompatibility adapterが必要か、read-only変換か、完全retireかはconsumer inventory後に決める。
- AVS以外のS1 sourceとの重複・包含は後続unitでrelationを付け、今回のsource identityを消さない。

## 人間判断（superseded、選択しない）

本節はv1のものであり、現行はv2である。ここから選択しない。判断対象は、上記exact source revisionにあるAVSの全6 L1 atom、全20 L3 atom、全20 L10 oracleを落とさず、
HARNESSの規範責務とOSの記録・執行責務へ`split`する方針である。

- `approve_split`: 上記責務分割と旧拘束の扱いを採用し、L2／L11適用PRの作成へ進む。
- `changes_requested`: 変更するatom、target、境界、理由を指定し、本packetを改訂する。
- `defer`: sourceを生存中仮登録のまま保持し、後続採否を進めない。
- `reject`: 不採用にするatomとその影響を明示した別decisionを要求する。黙って削除しない。

判断recordにはdecision unit、選択、actor、判断時刻、本packetのcommit SHA、本packet SHA-256、対象7文書のSHA-256を
記録する。判断前は`authority_effect: none`を維持する。
