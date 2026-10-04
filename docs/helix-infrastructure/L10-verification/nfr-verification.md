# HELIX-INFRASTRUCTURE L10 非機能検証（1.0対象親12件の草稿）

**状態：部分草稿・未承認・未実行。** `../L3-requirements/nfr-grade.md`の候補値を検証する測定設計。このStage 1/Stage 2a/Stage 2bの契約確認やStage 5の構成体照合に根拠のない性能SLAは追加しない。別の技術値が要件上必要な場合は、上流指定の有無にかかわらず根拠・比較・測定方法付きのL3候補として提示し、承認前の閾値をoracleへ適用しない。

| 親L2 | 測定項目 | 入力・変異 | 判定材料 |
|---|---|---|---|
| `HELIXINFRASTRUCTURE-L2-001` | field・topology完全性 | L2/L11が列挙するfieldを含む環境別resource graph、各fieldを欠落させるfixture、対象外Model Runtime | 親が列挙した全fieldの有無、missingをunknownとして扱うこと、CONNECT logical edgeとphysical pathの分離、source/revision参照。 |
| `HELIXINFRASTRUCTURE-L2-001` | 環境誤帰属・論理物理混同 | development/staging/production/recoveryを別identityとし、別環境の成功やnetwork pathを混ぜる変異 | 環境の誤帰属とlogical/physicalの誤同一化が0であること。 |
| `HELIXINFRASTRUCTURE-L2-001` | NFR観測 | scope対象のmodel/server/GPU-memory requirement/concurrency/latency/capacity/health/endpoint | source/revision付きで観測値を記録する。このStage 1/Stage 2a/Stage 2b契約検証にperformance閾値は不要であり新設しない。将来このscopeで閾値が要件上必要なら、L3候補として根拠・比較・測定方法とともに提示し、未承認値を合否へ適用しない。旧値や参考測定値を自動閾値化しない。 |
| `HELIXINFRASTRUCTURE-L2-006` | control planeからの独立性 | HELIX-OS/通常control planeが利用不能なfailure fixtureで限定operation pathを評価 | 復旧pathが利用不能なcontrol planeへ依存しない。 |
| `HELIXINFRASTRUCTURE-L2-006` | authority・scopeの網羅性 | 列挙操作ごとに別SECURITY authority、target、operation scopeを個別に欠落/不一致 | authority/target/operationが不明なら停止し、残作業と最終適格revisionを保持する。 |
| `HELIXINFRASTRUCTURE-L2-003` | resource demand fieldとcapacity observationをenvironment/resource/revisionで全件参照できる候補coverage 100% (L2列挙field set) | 採択済み親scopeから作る正常・境界・欠損fixture | resource demand fieldとcapacity observationをenvironment/resource/revisionで全件参照できる候補coverage 100% (L2列挙field set) 要求量比: available >= requested / available < requested / unknown (stale/missing/unmeasurable/適用閾値・条件未設定) の3結果を分け、unknownをeligibleとする誤判定0。固定機種・固定utilization値は指定しない。 根拠: L2/L11は要求量照合とunknown・不足の扱いを明示する。available >= requested は適用閾値・条件が設定済みのfixtureだけに用いる候補で、未設定は十分性unknownとする。要求量は各起動要求にある値をsourceとし、汎用GPU/CPU閾値は発明しない。 |
| `HELIXINFRASTRUCTURE-L2-004` | 親列挙state 8/8識別とsource/revision紐付け候補 | 採択済み親scopeから作る正常・境界・欠損fixture | 親列挙state 8/8識別とsource/revision紐付け候補 unknown/stale/collector-missingをhealthyとする誤分類0。incident cause/severityは承認済み意味の参照のみ。 根拠: 8状態とunknown/healthy区別、L2-019後続境界は固定L2/L11の列挙から取る。freshness時間やcollector-confidence数値はL2-019 scopeのため1.0へ作らない。 |
| `HELIXINFRASTRUCTURE-L2-005` | 宣言scope内の各required state/owner/source/recovery fieldが追跡可能な割合100%候補 | 採択済み親scopeから作る正常・境界・欠損fixture | backup target/source revision/time/completeness/location/integrity/expiry・compatibility・procedureを全件追跡する。restoreではintegrity/dependency reconnection/startup/verification全一致、rollbackではartifact/config/dependency/data compatibilityとprocedureのtraceを比較し、未確認を成功にする件数0。 根拠: このscopeはoperation-specific restore/recovery integrityを検証し、固定時間や保持期間を一律主張しない。L2/L1で別の時間・期間要件が必要と分かったときは比較根拠・測定方法付きL3 candidateを提示する。 |
| `HELIXINFRASTRUCTURE-L2-009` | 通常接続の列挙reference/owner fieldsの送受相互追跡 coverage 100%候補 | 採択済み親scopeから作る正常・境界・欠損fixture | 通常接続の列挙reference/owner fieldsの送受相互追跡 coverage 100%候補 通常接続にstage release completionを依存させる件数0、stage pack利用時のstage/runtime identity混同0。 根拠: L2/L11は通常接続とpack収載を分け、identityとscopeを明記。相互参照の列挙fieldを検査し、stage completenessを一律前提化しない。 |
| `HELIXINFRASTRUCTURE-L2-010` | authority request field一致率100%候補 | 採択済み親scopeから作る正常・境界・欠損fixture | authority request field一致率100%候補: target/project/action/revision/scope/expiry (適用時はcredential scope/update-admissionも含む)。不一致/期限切れを実行可能にする件数0。 read-only scopeの宣言write-setは0; updateでdenied/unknown/mismatchなら変更前停止。credential raw valueの無条件保存件数0。条件付き保持可否は既存SECURITY/source ownerの契約を参照し、検証証拠へのraw値出力は0。 根拠: L2/L11はauthority field、条件付きadmission、read-only write set、限定recovery例外をそれぞれ明示。実scope/fixture単位で照合し旧risk enum/approval機構は持ち込まない。 |
| `HELIXINFRASTRUCTURE-L2-002` | 9類型識別・三入力非変更 | `L10-INFRA-002-C01..05` の個別9類型、三source欠損、未見複合、scope不一致とbefore/after | 類型識別9/9候補、source/authority無言変更0、unknownから一致0。差異はsource/対象に限定する。 |
| `HELIXINFRASTRUCTURE-L2-007` | 4段階復旧trace・依存独立 | `L10-INFRA-007-C01..05` の完全/失敗/未知版/停止再開fixture | 4段階の実結果・入力版traceが4/4候補、元machine限定依存0、未完からsuccess0。backup/文書存在だけは不成立。時間SLAは実測・根拠候補を別に要する場合だけ追加する。 |

## Stage 5 — HELIXINFRASTRUCTURE-L2-011候補測定

| 親L2 | 測定項目 | 入力・変異 | 判定材料 |
|---|---|---|---|
| `HELIXINFRASTRUCTURE-L2-011` / `NFR-INFRA-011-01` / `INFRA-011-AC-01` | minimum-item evidence closure | `L10-INFRA-011-C01..18`の18個別scope、各正常fixtureと対応するmissing/stale/unknown変異 | PO列挙範囲の項目別証拠が18/18追跡可能かを数える。合算greenで欠落itemを補わない。 |
| `HELIXINFRASTRUCTURE-L2-011` / `NFR-INFRA-011-02` / `INFRA-011-AC-02` | unit/connection/composite false pass | `L10-INFRA-011-C19..23`の部分成功、backup-only、OS014条件、Web/later scope、read-only/update/recovery境界、未見正常構成 | false composite pass 0を候補測定。stage契約の通常構成への誤適用、後続版/Web混入、read-onlyへの無関係なbackup強制、適合する未見構成の拒否を別々に記録する。 |

測定結果はfield完全性、owner境界、source revision、unknown/holdの処置などの観測値で記録する。このStage 1/Stage 2a/Stage 2b契約検証では、対象behaviorの合否に性能時間・容量・保持期間の閾値を要しないため新設しない。別の技術値が要件上必要なら、上流に数値指定がなくてもL3候補として根拠・比較案・測定方法を添えて通常の承認パッケージに提示し、parameterごとの承認は求めない。旧値や参考測定値を自動継承・合否閾値へ昇格させない。

## Stage 4 NFR候補測定

| 候補 | 入力・測定 | 判定候補 | 限界 |
|---|---|---|---|
| NFR-INFRA-008-01 | approved design、target、actualを別々のrevision付きfixtureにする | mapping欠落とactualからdesignへの誤更新を個別測定し、双方0を候補とする。 | 物理deployment実行や可用性SLAを測らない。 |
| NFR-INFRA-025-01 | Worker/resource/work reference tupleをresource move前後で観測する | identity/reference欠落、不一致、assignment/isolation誤推定を別々に数え、誤推定0を候補とする。 | 親にないcapacity値を固定しない。必要値は候補起草可。 |
