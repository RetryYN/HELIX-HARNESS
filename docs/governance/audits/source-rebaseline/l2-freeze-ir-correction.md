# L2反映先・L3凍結境界のJSON是正差分

本書は指定JSON正本に対する変更案。JSON本体への適用は未実施であり、独立した要求正本や承認receiptではない。
根拠は現行L1–L12のL2要求／L11受入、requirements v1.3のL2合意・L3凍結境界、および
[対象別責務決定](../../../concept/product-boundary.md)である。

## 確認した矛盾

`HIL-FR-19` revision 1はwalkthroughで発見した要求を「L1反映先」へ接続する。
`HIL-FR-20` revision 1は画面合意等の欠落で「L1 freezeとL3開始」を拒否する。
同じ親契約`HR-FR-HIL-15` revision 1は、prototype／walkthrough／agreementまたは構造化非UI記録により
「L3 freezeする」と定義している。受入`HAC-HIL-15c`もscope変更時の「L2再entry」を定義している。

## 適用する変更案

| 対象 | 変更後の条件 |
|---|---|
| HIL-FR-19 | Walkthrough Loopはprototype版、ユーザー観測、発見要求deltaまたはno_delta、L2要求への反映先、企画への影響がある場合のL1反映先、再作成判断を記録し、boundedに反復する |
| HIL-FR-20 | 画面対象はartifact・walkthrough・L2要求反映・prototype agreementを、非対象は適用範囲・理由・判定者・対象HEAD・要求への影響・再評価条件を持つreceiptを確認する。不足時はL3凍結と後続実装への進行を拒否する。L3の起草まで一律禁止する条件にしない |
| HR-FR-HIL-15 | L2の要求・プロト合意、または非UI適用性を確認してL3を凍結する。要求の反映先と判定対象revisionを明示し、L1企画への変更有無を独立に扱う |
| HAC-HIL-15a | 非UIでもL2要求を保持し、必要な適用性項目が揃った対象revisionでL3凍結できる |
| HAC-HIL-15b | UIのprototype・walkthrough・L2要求反映・agreementのいずれかが欠ける場合、L3凍結を拒否する |
| HAC-HIL-15c | scope変更で影響するL2要求・適用性・agreementをstale化して再評価する。L1企画への影響がない変更をL1合意へ一律差し戻さない |
| HAT-HIL-15 | 上記正例・反例を、対象要求revision・prototype版または非UI記録・凍結対象と対応づけて検証する。L1へのみ要求反映した例、別revisionのagreement、非UI項目欠落を拒否する |

既存`HAT-HIL-15`はdesigned_not_implementedである。シナリオの改訂を実行成功に変更しない。
HARNESSは合意・凍結条件を所有し、OSはwalkthrough反復・適用性記録・実行制御を所有する。

## 更新範囲と未完条件

- 対象要求・契約・受入・テストのrevisionとsemantic digest、各shardのdigest、manifest rootを同じ変更へ束縛する。
- 既存参照の変更影響を列挙し、生成viewとDB projectionを同じrevisionへ追従させる。旧Markdown互換入力から正本を再生成しない。
- `archive/legacy-generation-2026-09-14/root/config/requirement-ir-authority.json`はjson_transaction_onlyを指定している。正規更新経路とrollback・競合revisionの扱いを確認して適用する。
- 読み取った`archive/legacy-generation-2026-09-14/root/src/requirements/requirement-ir-authority-cutover.ts`は旧shadowをcanonicalへ変換する全体書出し処理であり、この差分更新の手段として実行しない。
- 本調査で差分適用のCLIは確認できていない。経路の不存在を断定せず、正規transactionの接続確認を残作業とする。

本書は7レコードの変更範囲を具体化したものであり、JSON是正・下流検証・利用者合意の完了を主張しない。

## 正規更新経路の調査結果

`src`・`tests`・`scripts`のAuthoring Admission、Atomic Canonicalization、json_transaction_only、
auto_admit_with_staleの参照と、関連moduleの公開interfaceを確認した。

| 調査対象 | 確認した責務 | この差分への適用判断 |
|---|---|---|
| `archive/legacy-generation-2026-09-14/root/src/requirements/requirement-authority.ts` | shadowからcanonicalへの昇格とdigest算出 | 既存canonicalの差分更新APIではない |
| `archive/legacy-generation-2026-09-14/root/src/requirements/requirement-discovery.ts` | discovery eventの生成とcandidate projection再構成 | canonical shardへのcommit処理とは別 |
| `archive/legacy-generation-2026-09-14/root/src/runtime/forward-plan-authoring-transaction.ts` | PLAN予約、Forward／Reverse文書、journalのtransaction | 入力はPLAN専用。requirement shard更新へ流用しない |
| `archive/legacy-generation-2026-09-14/root/src/design/design-registry-transaction.ts` | Design Registry graph・authority transitionのstore commit | graph更新契約。requirements-irの複数shard・manifest書出しを代替しない |
| `archive/legacy-generation-2026-09-14/root/requirements-ir/system_contracts.json#/HR-FR-HIL-19` | Authoring Admissionと原子的Canonical化の要求契約 | specified。実装済み・運用可能という状態ではない |
| `archive/legacy-generation-2026-09-14/root/requirements-ir/system_tests.json#/HAT-HIL-19` | 原子的Canonical化の検証シナリオ | designed_not_implemented。transactionの実行証拠として使えない |

確認範囲では、この7レコードを既存canonicalから改訂してmanifest・生成view・DBへ整合させる運用可能な入口を特定できなかった。
他用途のtransactionが存在することや、契約名を検査するテストがあることを、要求正本の更新機構が使える証拠にしない。
この不足はHELIXOS-L2-001／002に関係する管理機構の欠落として扱う。
次の作業は既存HR-FR-HIL-19の設計・実装状況との照合であり、新しい正本や第二のAdmission Engineを作ることではない。

## 設計から実装への接続で確認した不足

`docs/design`・`docs/test-design`を契約IDと機構名で検索したところ、HR-FR-HIL-19の直接参照は
元L3契約、対応L10案、Requirement Discoveryのrefinementに留まり、対象shard更新を所有するL4–L6設計への直接接続は確認できなかった。
検索結果だけで不存在とは認定せず、既存の別名設計や責務登録との照合を残す。

[PLAN-L3-53](../../../../archive/legacy-generation-2026-09-14/root/docs/plans/PLAN-L3-53-requirement-discovery-json-authority.md)のpreconditionには
「Authoring Admission Engineが存在する」とあるが、同PLANの非対象はschema/runtime等であり、
closure対象もL3／L10契約sliceである。このconfirmed状態をEngine実装済みの証拠に使えない。
[RDJ契約](../../../../archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/requirement-discovery-json-authority.md)もPR-1は契約のみと明記している。

[自律Authoring指示書](../../../../archive/legacy-generation-2026-09-14/root/docs/governance/autonomous-authoring-admission-transaction-directive_v0.1.md)は
Proposalの自由な作成・修正を許し、Canonical確定だけにAdmission Transactionとreceiptを要求する。
したがって是正案の起草は進められるが、入口未確認のままcanonical shardを手編集し、正本化済みとすることはできない。

未完の接続は、HR-FR-HIL-19 → shard更新を所有する設計 → revision／CAS／rollback付き更新実装 →
HAT-HIL-19の実行証拠 → canonicalization receiptである。PLAN-L3-53の契約承認や既存cutover成功でこの接続を補わない。

[機械可読な意味差分proposal](l2-freeze-ir-proposal/README.md)に、4 shard・7レコードの変更前testと本文置換を保存した。
生成時のメモリ上検査は成功したが、revision・digest・下流を含む正本化transactionは未実施。

差分再照合で、FR-19／20の成果物欄が最初のproposalで省略されていたため復元した。
walkthrough receipt・requirements delta・iteration checkpoint、G2判定・agreement／skip receipt・不足codeを保持する。
HAT-HIL-15の証拠欄と反例欄も更新案に含め、既存のimplicit skip・static-only・stale拒否を残した。23件の変更前testをメモリ上で確認済み。

POの範囲指定により、今回は文書整理と適用待ち差分までとする。更新機構の設計・実装と正本適用は後続作業であり、本差分の検証完了とは分ける。

## 凍結sourceのauthority語彙差分

横断監査では、Infinity Loop、常駐レーン、三社レーンの凍結sourceに、Issue／PLAN／branch／leaseを
「正本」と呼ぶ箇所が残っていることも確認した。L2対象別要求で固定した境界では、これらは要求意味の正本ではなく、
assignment scope、変更先、writer所有、作業projectionである。

本文だけを先行訂正すると`REFINEMENT_SOURCE_STALE`、`REFINEMENT_SOURCE_PROJECTION_DRIFT`、pinned compatibility
digest差異が発生することを104テスト中3失敗で確認した。このため凍結sourceの本文変更は取り消し、次の正規改訂へ送る。

- source本文、Requirement IRのstatement／source digest／projection、対応受入を同一revisionで更新する。
- `scope正本`は`assignment scope authority`、branchは変更先、leaseはwriter authorityへ分ける。
- Issue本文・label・close、PR merge、CI greenから要求の意味・採否・合意・受入を生成しない。
- 変更後にrefinement source freshness、projection、compatibility pinを同じ検査で再確認する。

失敗を根拠にdigestや期待値だけを更新していない。この語彙差分は、上記7レコードのJSON Patchとは別の適用待ち項目である。
