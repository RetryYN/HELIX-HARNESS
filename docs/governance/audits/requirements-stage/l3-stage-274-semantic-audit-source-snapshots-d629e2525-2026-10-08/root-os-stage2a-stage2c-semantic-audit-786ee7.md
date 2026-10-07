# HELIX-OS Stage 2a / 2c 意味監査

対象revision: `786ee7c85c5454e3b2314c1d8ee3ca28f5178db1`（`main`指定revision）。作業treeのHEADは `fa642cddc3c4446e3635f1c6badd90209862cfac` だったため、以下は全て `git show <対象revision>:<path>` で取得して読んだ。repo編集なし。旧test/runtime/CIは実行していない。

## 判定

今回指定されたOS親015/016/017/018/019/020/023/027および028/029について、固定L2/L11の適用条件・owner境界・false success/false rejectを、現行L3/L10のnormal/negative/unseen oracleと照合した範囲では、追加の具体的な意味欠落または誤りを確認しなかった。これは全274親の監査、独立review、実行検証、L3承認を意味しない。

## revisionの扱い

- Stage 2aの固定L2/L11本文は、L3 FRのsource宣言に従い `f6dad2a` revision。main `633bf12` のPO decision row 48はOS-L2-014〜029の採択登録であり、固定本文revisionとは別。
- 018にはさらに `MPR-RC-HELIXOS-L2-018-002` が `633bf12` のPO decision (`po-decision-2026-10-03-additions10.md`, row 34) で採択されている。これはf6dad固定本文へ遡及させず、L2 span 1604–1619とL11 span 1259–1276の別sourceとしてFR-OS-018に記録される。
- Stage 2c親028/029の固定本文もf6dad2a。`633bf12` はPO採択・登録の記録であり、固定親の本文sourceではない。FR-OS-028/029のsource欄とcrosswalkはこの区別を明示している。

## 文書別に読んだ範囲

- 固定L2: `docs/helix-os/L2-requirements/governance-requirements.md` 015 `642–651`、016 `652–661`、017 `662–671`、018 `672–681`、019 `682–691`、020 `692–701`、023 `722–731`、027 `824–845`、028 `847–862`、029 `863–877`。
- 固定L11: `docs/helix-os/L11-acceptance/governance-acceptance.md` 共通result binding `322`; 015 `324–329`、016 `331–336`、017 `338–344`、018 `345–351`、019 `352–358`、020 `359–365`、023 `380–386`、027 `442–456`、028 `457–466`、029 `468–478`。
- L3 BR: `docs/helix-os/L3-requirements/business-requirements.md` Stage2c境界 `9–11`、Stage2a `13–53`。Stage2cは独立BR/business owner/KPIなしと明記。Stage2a BRは各親の成果をOS管理成果として記述し、外部製品成果や新owner/KPIを作らない。
- L3 FR: `docs/helix-os/L3-requirements/functional-requirements.md` Stage2a source/legacy起点 `97–127`、015–017 `129–155`、018 `156–165`、019 `166–178`、020 `179–187`、023 `188–196`、027 `197–211`; Stage2c 028/029 `53–92`と旧source crosswalk `82–91`。同ファイルの親→FR/AC/CASE表 `205–210`、旧source別crosswalk `213–224` も照合。
- L3 NFR: `docs/helix-os/L3-requirements/nfr-grade.md` 028/029 `21–38`、Stage2a `45–76`。候補値をSLA/合否閾値に昇格せず、母数・除外・censoring等を分ける記述を確認。
- L10 BV: `docs/helix-os/L10-verification/business-verification.md` Stage2c `13–16`、Stage2a `17–31`。Stage2cに独立business caseなし。Stage2aの表はBR/AC/CASEと機能側への参照を同期。
- L10 FV: `docs/helix-os/L10-verification/functional-verification.md` Stage2c CASE 028/029 `83–204`、trace表 `205–210`; Stage2a 015 `235–260`、016 `261–282`、017 `283–357`、018 `358–416`、019 `417–455`、020 `456–480`、023 `481–507`、027 `508–600`。
- L10 NFRV: `docs/helix-os/L10-verification/nfr-verification.md` Stage2c `19–30`、Stage2a `35–65`。

## 親別照合

| 親 | 固定L2/L11と現行対応の意味照合 | 旧source起点と照合した範囲 | 結果 |
|---|---|---|---|
| 015 | authority census、source/revision/actor/訂正履歴の追跡。projectionから要求・人間判断を生成しない。positiveとsource/authority/evidence欠落等のnegativeはCASE-015群に分離。 | `LEGACY-ASSET-C6936A5DA79A6DAE4FE4` Document Authority Census `.../document-authority-census-requirements.md:23–87` を直接読了。旧capability broker paired acceptanceの指定spanはcrosswalk確認のみ。 | 欠落/owner誤り/偽成功を確認せず。 |
| 016 | 対象・requirement revision・unit/connection/composite・dependency edge・delivery stateの区別、下位成功から上位readinessを作らない。CASE-016群にnormalと各関係・状態negative。 | `LEGACY-ASSET-E78B8D68CC327AA00991` `requirement-discovery-json-authority.md:26–78` を直接読了。shared pairの全spanは未読。 | 欠落/owner誤り/偽成功を確認せず。 |
| 017 | HARNESS既定部品/INT案と既存authority/dependency/budget/deadlineを照合し、ticket種別・flow・systemの各個別traceを保つ。OSがHARNESS/INT ownerを代替せず、部品外workflowを4.0境界へ残す。CASE-017-HXT type/flow/system群とnormal/negativeで追跡。 | `LEGACY-ASSET-5EE032D657C221184B00` `universal-workflow-ai-judgment-engine.md:13–87`を直接読了。旧HXT全tableとpaired casesの全範囲は未読。 | 欠落/owner誤り/偽成功を確認せず。全HXT旧意味の再監査ではない。 |
| 018 | Worker/reviewer分離、assignment/attempt/scope/cumulative constraints/unfinished dutyを保持。SECURITY/INFRA/LABO ownerを代替せず、追加018-002を適用sourceがある場合だけ記録。receipt不足だけで全assignment停止しない条件、quality eventなし・consult未選択時にreceiptを作らない条件、source不明時に元decision/policy ownerへ返す条件がFRとCASEに一致。 | `LEGACY-ASSET-50CA1C554747F12266D3` resident lane requirementsの一部 `:34–80`と`:663–666`、`LEGACY-ASSET-437A6A68F9A9E0AE1B9E` acceptance `:43`を直接読了。長い他spanはcrosswalk locatorのみ。 | 観察した範囲で偽拒否（receipt欠落だけでassignment停止）をFRが明示的に防いでいる。追加欠陥なし。 |
| 019 | source-bound eventからepisode再構築、欠落/重複/stale/拒否/未実行を成功と区別。hold/確認待ち期限一覧はL1-002/008に沿うL2-019 projectionで、人間向けにsource/owner/state/unfinished dutyを出し、AI解決可能性・PO宛先・deadline・承認・完了・stop/reassignmentを生成しない。CASE-019 02g–02lは単独変異armで一覧投影を照合。 | `LEGACY-ASSET-8FECCE93E3996E8AAAFF` orchestration memory runtime `:14–50`、`LEGACY-ASSET-1EAF81D2FED559ED38C4` lifecycle state acceptance `:235–265`はcrosswalkで位置確認。直接読了は未実施。 | hold/expiry既修復内容を再発findingにしない。追加欠陥なし。旧source全範囲未読。 |
| 020 | HARNESS義務/oracleを対象diff/head/environmentへ結び、execution result収集。旧CI代用、意味review/human acceptance/merge/release生成は禁止。CASE-020 negative群は義務/oracle/head/result欠落・CIの代替利用等を個別化。 | `LEGACY-ASSET-EE5DBACC7F28F7D1F605` `pillar-functional-requirements.md:38–57,134–197,198–307`をcrosswalkで照合。旧全span直接再読は未実施。 | 欠落/owner誤り/偽成功を確認せず。 |
| 023 | handoffで対象revision/relation/source stateとsender/receiver、digest/scope/causal ID/evidence/unfinished dutyを保持。transport receiptやPR/CIでbusiness completionを作らない。各caseでhandoff/各relationを分離。 | resident lane requirements `:34–80`とacceptance `:43`の一部は上記のとおり直接読了。指定される他resident spanは未読。 | 欠落/owner誤り/偽成功を確認せず。 |
| 027 | 性能未評価状態とoperation permissionを分離。採択済み六条件・authorityが全成立する限定初回のみ、結果を同scopeでLABOへ送り、初回成功をqualificationにしない。CASE-027には各必須condition/authorityの単独negativeと通常例がある。候補NFRに根拠のないuniversal minimum/scoreを設定しない。 | resident lane requirements `:663–666` (RLO-FR-040) と acceptance `:43` (RLO-AC-030)を直接読了。 | 欠落/owner誤り/偽成功を確認せず。 |
| 028 | 通常non-consult operationは該当SECURITY authority、execution constraint、INFRA resourceを束ね、未選択consult artifactは要求しない。実際に選んだsource permissionはconsult有無を問わず確認。subtask/unknown oracle/相談の欠落ごとに固定L2 ownerへ返し、未定義ownerを推測しない。 | 旧L3 process/pillar FR/AC/lifecycle/resident lane/budget crosswalkと旧L5/L6 lifecycle integration/unit testの指定spanを確認。直接読んだ一部: lifecycle integration `:9–45,72–90`、unit `:9–45,72–98`; 他の列挙spanは未読。 | owner・適用条件と正常/negative/unseen経路に矛盾を確認せず。 |
| 029 | support proposal・028 actual consult receipt・029 compositeは別identity。consultなしでは028 receiptを要求せず、選択時は要件/実作業/ HARNESS result/independent review/owner receiptを維持。actual consultのみsource/response/return receiptを追加。review finding 0だけでVerified、VerifiedだけでAcceptedにしない。新HEADには新result/review receipt。budget/deadline/stopは各独立未完negative。 | 028の旧sourceに加え、旧L5 integration/unit test指定spanを確認。固定L2/L11と異なる旧test-author/reviewer関係・旧provider/runtime mechanicsは現行へ持ち込まない旨がcrosswalkにあることを確認。全列挙source spanは未読。 | false success/false rejectおよびowner誤りを確認せず。 |

## 技術値とoracle

NFR/NFRVにある候補値は候補であり、承認済みSLA、pass threshold、固定sample minimumとして使われていない。028ではselected/authorized consult attemptを、029ではstarted composite attemptを母数とし、unstarted/denied/非該当を混ぜない。019/027も期限・universal score等を追加していない。該当CASEはL11 fixtureの既存入力・拒否時状態を参照し、旧test/runtimeの実行結果を現行証拠にしていない。

## 確認限界・未確認

- 固定親と現行6文書の指定Stage本文、対応trace table、主要normal/negative/unseen casesは読み合わせた。全CASEを一行ごとに機械的に再実行したものではなく、L10は未実行。
- 旧資産は現行crosswalkで列挙された全consumer、全source span、全failure historyを再読していない。上表に「未読」とした部分はlocator/crosswalkでの存在確認に留まり、旧source semanticsの完全監査ではない。archive test/runtime/CIは起動していない。
- 他のOS親、他機構、274親全体、現行承認状況の全scopeについて意味完了を判定していない。今回の作業は指定revisionの指定OS scopeに限る。
