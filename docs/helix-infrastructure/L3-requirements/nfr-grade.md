# HELIX-INFRASTRUCTURE L3 非機能要件・候補値（1.0対象親12件の草稿）

**状態：部分草稿・未承認。** 下表は上流のfield/status/境界を測定可能にする候補値と比較観点である。完全coverage、誤昇格/誤帰属0等の候補は親の明示条件に基づき、L2が指定した性能SLAだとは扱わない。旧HELIXの数値を自動継承せず、測定不能/未観測を成功扱いしない。

| 項目 | 候補値・比較 | 根拠と測定 | 代替・未確定範囲 |
|---|---|---|---|
| `HELIXINFRASTRUCTURE-L2-001` — topology field coverage | 各観測でparent列挙のresource identity/role/environment/location/version/dependency/lifecycleをsource-linkedに保持 | L2-001とL11のresource tuple。environmentごとのfixtureを照合し、必要field欠落はunknown。 | aggregateの存在確認案と全fieldのsource-linked照合案を比較し、前者では欠落sourceを隠すため後者を候補とする。resource数・environment数・latency/capacity thresholdはL2/L11が規定しない。 |
| `HELIXINFRASTRUCTURE-L2-001` — 環境混同・論理物理誤同一 | 誤帰属0（別environmentを本番証拠にしない、logical CONNECT edgeをphysical routeにしない） | L2-001の独立environment・logical/physical区別。scopeを混ぜるmutationを照合。 | 共通environment labelだけの案は別環境の証拠を混ぜるため採らず、独立identityとlogical/physical区別を測る。availability、topology discovery時間のSLOなし。 |
| `HELIXINFRASTRUCTURE-L2-001` — network/storage metadata completeness | 親列挙のpath tuple全fieldとstorage owner/durability/backup/retention/environment/confidentiality/recovery属性が未観測ならunknown | L2-001/L11のfield列挙。各属性を欠落・他environment由来にし、推定補完がないことを確認。 | resource名だけを記録する案より、列挙属性のsource-qualified照合がowner/recovery欠落を検出できる。retention日数、backup回数、GPU memory、concurrency、latency等はresource sourceが示す値を測定するだけで閾値を追加しない。 |
| `HELIXINFRASTRUCTURE-L2-006` — recovery dependency independence | 停止対象control planeへの依存経路0 | L2-006/L11のOS/control plane unavailable scenario。各bounded operation path dependencyをgraphで照合し、停止対象へ戻るedgeがない。 | 通常control plane経由案は停止時に循環するため、限定pathの依存graph照合を候補とする。運用の可用性%、RTO/RPO、recovery timeout/retryは根拠なし。 |
| `HELIXINFRASTRUCTURE-L2-006` — authority and operation scope | 列挙operationすべてが別SECURITY authority/target scopeと対応し、未対応operationの成功claim 0 | L2-006/L11列挙操作: 点検、health確認、service停止、rollback、recovery起動。各scope/authorityを欠落・不一致で試験。 | 通常authorityを流用する案は独立復旧の対象scopeを示せず、別authorityと各5操作の対応を測る。操作ごとの人手approvalや追加gateを作らない。 |
| `HELIXINFRASTRUCTURE-L2-003` — resource demand fieldとcapacity observationをenvironment/resource/revisionで全件参照できる候補coverage 100% (L2列挙field set) | resource demand fieldとcapacity observationをenvironment/resource/revisionで全件参照できる候補coverage 100% (L2列挙field set) / 要求量比: available >= requested / available < requested / unknown (stale/missing/unmeasurable/適用閾値・条件未設定) の3結果を分け、unknownをeligibleとする誤判定0。固定機種・固定utilization値は指定しない。 | L2/L11は要求量照合とunknown・不足の扱いを明示する。available >= requested は適用閾値・条件が設定済みのfixtureだけに用いる候補で、未設定は十分性unknownとする。要求量は各起動要求にある値をsourceとし、汎用GPU/CPU閾値は発明しない。 | aggregate容量だけの案はdimension欠測を隠すため、対象revision/属性別の比較とunknownを候補とする。 親に明記されない技術値が別途必要な場合は根拠・比較・測定方法付きL3候補にし、自動採用しない。 |
| `HELIXINFRASTRUCTURE-L2-004` — 親列挙state 8/8識別とsource/revision紐付け候補 | 親列挙state 8/8識別とsource/revision紐付け候補 / unknown/stale/collector-missingをhealthyとする誤分類0。incident cause/severityは承認済み意味の参照のみ。 | 8状態とunknown/healthy区別、L2-019後続境界は固定L2/L11の列挙から取る。freshness時間やcollector-confidence数値はL2-019 scopeのため1.0へ作らない。 | aggregate healthy案はcollector欠測を隠すため、8状態/source別の判定を候補とする。 親に明記されない技術値が別途必要な場合は根拠・比較・測定方法付きL3候補にし、自動採用しない。 |
| `HELIXINFRASTRUCTURE-L2-005` — 宣言scope内の各required state/owner/source/recovery fieldが追跡可能な割合100%候補 | backup target/source revision/time/completeness/location/integrity/expiryおよびcompatibility/procedureの明示fieldをscope内100%追跡できる候補 / restoreはintegrity・dependency reconnection・startup・verificationの全条件一致、rollback targetはartifact/config/dependency/data compatibilityとprocedureを全てtrace。未確認をsuccessにする件数0。 | このscopeはoperation-specific restore/recovery integrityを検証し、固定時間や保持期間を一律主張しない。L2/L11で別の時間・期間要件が必要と分かったときは比較根拠・測定方法付きL3 candidateを提示する。 | backup job greenのみの案はrestore/rollbackを示さず、各実結果と未完義務を別証拠で測る。 親に明記されない技術値が別途必要な場合は根拠・比較・測定方法付きL3候補にし、自動採用しない。 |
| `HELIXINFRASTRUCTURE-L2-009` — 通常接続の列挙reference/owner fieldsの送受相互追跡 coverage 100%候補 | 通常接続の列挙reference/owner fieldsの送受相互追跡 coverage 100%候補 / 通常接続にstage release completionを依存させる件数0、stage pack利用時のstage/runtime identity混同0。 | L2/L11は通常接続とpack収載を分け、identityとscopeを明記。相互参照の列挙fieldを検査し、stage completenessを一律前提化しない。 | OSとruntimeを一正本に畳む案はownerを失うため、versioned相互参照案を候補とする。 親に明記されない技術値が別途必要な場合は根拠・比較・測定方法付きL3候補にし、自動採用しない。 |
| `HELIXINFRASTRUCTURE-L2-010` — authority request field一致率100%候補 | authority request field一致率100%候補: target/project/action/revision/scope/expiry (適用時はcredential scope/update-admissionも含む)。不一致/期限切れを実行可能にする件数0。 / read-only scopeの宣言write-setは0; updateでdenied/unknown/mismatchなら変更前停止。credential raw valueの記録件数0。 | L2/L11はauthority field、条件付きadmission、read-only write set、限定recovery例外をそれぞれ明示。実scope/fixture単位で照合し旧risk enum/approval機構は持ち込まない。 | Worker successだけの案はauthority/actual-state不一致を隠すため、各fieldと実状態の照合を候補とする。 親に明記されない技術値が別途必要な場合は根拠・比較・測定方法付きL3候補にし、自動採用しない。 |
| `HELIXINFRASTRUCTURE-L2-002` — drift分類・三状態保持 | 固定親の9差異類型を9/9個別に識別し、design/target/actualを無言変更する件数0の候補。 | L2列挙の種類を分母にし、C01〜05の個別・未見複合fixtureと入力before/afterを比較する。 | version番号だけの一致案はconfig/network/permission等の差を落とすため採らない。freshnessの経過時間や全環境SLAはこの比較scopeに不要。必要な値は別途根拠・比較・測定候補として導出可能。 |
| `HELIXINFRASTRUCTURE-L2-007` — 復旧trace・成功条件 | 宣言scopeの再構築/再接続/起動/検証の4段階を全件traceする候補coverage 4/4。元machineだけの必要入力依存0、未完verificationからの誤success0。 | C01〜05で完全復旧、未知版、記録存在のみ、入力欠落、各段階failure、停止再開を比較し実結果とsource版を観測。 | backup存在を成功にする案を拒否。固定RTO/RPOや機種の閾値はこの機能判定に不要。製品ごと必要なら根拠付き候補であり、上流に数値がないことを候補化禁止の理由にしない。 |

## 測定・承認境界

この表のcoverage/誤昇格0/誤帰属0/roundtrip完全性は親L2/L11の明示要素を漏れなく守る候補である。実測性能値の採否はテストfixtureとL4以降の実現可能性を踏まえ通常のL3承認へまとめて送る。個別parameter承認を要求しない。上流が指定する外部version/range/retention等があるときは当該source値を使い、新しい値を作らない。

## Stage 4 technical candidates

| 候補ID／親 | 候補値・測定条件 | 根拠と比較 | 適用限界 |
|---|---|---|---|
| NFR-INFRA-008-01 / HELIXINFRASTRUCTURE-L2-008 | selected design/target/actual field間のtrace欠落0、actual→design誤書戻し0 | 三sourceを別々に追跡する案と実環境結果だけを見る案を比較し、後者は承認designとtargetのずれを隠すため前者を候補とする。 | 選択scopeのfieldだけ。deployment SLAは追加しない。 |
| NFR-INFRA-025-01 / HELIXINFRASTRUCTURE-L2-025 | Worker/resource/work-reference tupleの欠落0、move前後のwork reference不一致0 | field単位でsource/revisionを追う案とmachine単位で集約する案を比較し、machine集約はWorker identityを失うため不採用。 | capacity閾値・autoscaling目標は指定しない。必要値は根拠・比較・測定付き候補とする。 |

## Stage 5 — L2-011 NFR候補測定

| 候補 | 対象AC | 候補値・比較・根拠 | L10測定 |
|---|---|---|---|
| NFR-INFRA-011-01 | INFRA-011-AC-01 | PO固定の最低18 item全てについて個別入力/expected/observed/result参照を閉じるcoverage 18/18を候補とする。aggregate構成体greenだけを数える案より、項目別traceで欠落を特定できる。18という分母は親の列挙で固定される。 | C01–C18を各々正常＋個別欠落/unknown/stale変異として測り、各itemのevidence closureを記録する。 |
| NFR-INFRA-011-02 | INFRA-011-AC-02 | 欠落/unknown/stale/mismatch/unauthorized unit・connection・minimum itemをcomposite successへ写像する件数0候補。aggregate-only案とunit/connection/compositeを分離する案を比較し、後者がfailure位置・未完ownerを保つため候補とする。 | C19–C23でpartial success、backup-only、stage dependency誤適用、Web/later-version混入、未見正常構成を測定しfalse passを個別記録する。 |
