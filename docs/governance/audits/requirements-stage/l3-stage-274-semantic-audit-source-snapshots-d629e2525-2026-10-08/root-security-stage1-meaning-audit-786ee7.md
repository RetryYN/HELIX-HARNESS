# HELIX-SECURITY Stage 1 意味監査（001–016 / 020 / 028）

## 対象と境界

対象はmain revision `786ee7c85c5454e3b2314c1d8ee3ca28f5178db1` のHELIX-SECURITY Stage 1、親001–016/020/028。033自体は別scopeとして意味判定しない。作業tree HEADは `fa642cddc3c4446e3635f1c6badd90209862cfac` なので、すべて対象revisionの `git show` から読んだ。repo編集なし。archive runtime/test/CLI/CIは起動していない。

L3 FR `functional-requirements.md:1–16` は対象19 identityを列挙し、001–016/020/028の親採択をdecision revision `49318f1f1de5810dfc61fdfe3a2565b86509009d` と区別する。固定L2/L11本文はf6dad2a revision（FR:15,38）であり、登録・採択decisionは本文固定revisionと別。633bf12に関連する後続の033 MPR/P0追補は今回の対象外で、fixed f6dad本文の代わりにしていない。

## 結論と具体所見

対象親の大半では、固定L2/L11の条件、owner、未適用/unknown時の動作がL3/L10 normal・negative・unseen oracleへ保たれており、追加の意味欠落を確認しなかった。次の二つは本文上の具体的なcoverage残余である。

1. **L2-009 trigger別coverageがL10で明示されない。** 固定L2 `security-requirements.md:156` は「各triggerごとに全該当recipientへの伝播」を要求する。L11 `security-acceptance.md:33` とFR `functional-requirements.md:180` はrevoke/scope drift/credential漏洩/異常通信/runtime逸脱/unknownの6 triggerを列挙する。一方、FV `functional-verification.md:133–137` のCASE-009-01はrecipientごとの受領/適用/未達/未観測変異と新しいrevoke trigger正常例を記すが、6 triggerそれぞれの独立fixtureとtriggerごとの該当recipient closureを明記しない。NFRV `nfr-verification.md:13` もscope別recipientを測るだけでtrigger別入力を明示しない。複数triggerを一度に与えると、特定trigger固有の未発火/未伝播を別triggerの成功で隠すfalse successが残る。候補は既存CASE-009-01に、各列挙triggerを個別入力し、そのtriggerに該当するrecipient全件の受領/適用と未達negativeを対応付ける一文を足すこと。これはL2-009の既存条件を展開するだけで、新しいtrigger、recipient、latency閾値は加えない。
2. **L2-012の対象名「Agent package」がL3/L10では曖昧。** L1 `security-intent.md:57` と固定L2 `security-requirements.md:182` は「Agent package」を明記する。L11 `security-acceptance.md:36`、FR `functional-requirements.md:214,222`、CASE `functional-verification.md:160–164` は「Agent」とだけ書き、L2-010の「Agent definition」と区別しない。Stage 1の他CASEにAgent packageを明記する補完箇所もなかった。L2-012のリスト先頭に一般語「package」があるため包括解釈もできるが、同じリスト内でAgent packageを別記する一方、CASEがAgent定義とpackage artifactのどちらをfixtureにするかは不明である。Agent definitionだけを試験して012を閉じるfalse success候補として、対象語の明確化が必要。新しいpackage inspection/control仕様を作る根拠はなく、既存L2の語「Agent package」をL3/L10の対象名にも使い、010のAgent definitionとの区別を明記するのが最小。

## 読了した現行文書の範囲

| 文書 | exact-mainの読了範囲 | 照合点 |
|---|---|---|
| 固定L2 `docs/helix-security/L2-requirements/security-requirements.md` | 001–003 `70–98`、004–008 `100–148`、009–016 `150–228`、020 `260–268`、028 `342–350` | 入出力、保証、依存、版、failure route。特に007の9制御、009の各trigger、010/012の資産列、014–016の1.0/1.x境界、020のGuard/Bot境界、028のHARNESS共通lifecycle帰属。 |
| 固定L11 `docs/helix-security/L11-acceptance/security-acceptance.md` | 共通境界 `19–21`、001–016/020/028表 `25–52`、007詳細制御表 `69–87` | 成功/反例、個別制御、合成値のfixture限定、secret非露出。 |
| L3 BR `docs/helix-security/L3-requirements/business-requirements.md` | `1–5`, `7–18`, `21–23` | 19親に独立business identity/ACなし、他Stageへ一般化しないowner境界。 |
| L3 FR `docs/helix-security/L3-requirements/functional-requirements.md` | authority/source boundary `1–16`, `38–54`; 001–008 `58–168`; 009–016 `170–280`; 020 `282–294`; 028 `296–304`; crosswalk `479–489`および該当親paragraph | fixed-parent refs/raw pin記述、旧対応、適用条件、owner、AC、return route。 |
| L3 NFR `docs/helix-security/L3-requirements/nfr-grade.md` | applicability `1–29`; shared candidates `31–45` | 005/007/008/009/010/013/014/016/020のcandidate条件・根拠。数値は根拠付き未承認候補、対象外親に新thresholdなし。033共有行は033の意味を本監査対象にしない。 |
| L10 BV `docs/helix-security/L10-verification/business-verification.md` | `1–18` | Stage 1 19親に独立business ACなし。Stage2c/3/4は今回の親scope外。 |
| L10 FV `docs/helix-security/L10-verification/functional-verification.md` | 001–003 `37–62`; 004–008 `64–128`; 009–016 `130–201`; 020 `203–210`; 028 `212–219` | 正常、negative、unseen、owner戻し先、固定L11 oracle。007は各9制御を個別行にする。009はtrigger別caseが未明示。012のAgent package名が未明示。 |
| L10 NFRV `docs/helix-security/L10-verification/nfr-verification.md` | applicability/rows `5–17`および034+の別scope heading `20+`は必要箇所のみ確認 | Stage 1の候補測定方法、failure owner、009 recipient closure。Stage 1以外のNFR内容は本監査していない。 |

## 親別の意味照合・旧source

| 親 | 現行との照合、結果 | 旧sourceの直接読了範囲／未確認 |
|---|---|---|
| 001 | read/untrusted/authority/persist/learnを分離。明示昇格経路のpositiveと各targetへのnegativeを用意。 | `LEGACY-ASSET-EE5DBACC7F28F7D1F605`, old pillar FR HR-FR-P8-04 `pillar-functional-requirements.md:171`、HR-NFR-P8-02 `:186`を直接読了。raw/trusted metadata/instruction分離の隣接根拠。旧CAPは直接対応でないという現crosswalkを確認。 |
| 002 | 5命令例を個別合成入力、Tool/system/authority/credential/policy直結を拒否し、完全検出器を要求しない。 | 同asset HR-NFR-P8-02 `:186` と旧pillar acceptance HAT-P8-04 `L3-pillar-acceptance-test-design.md:126`を直接読了。旧CAP-001の操作型と命令様dataは別責務というcrosswalkを確認。 |
| 003 | project/tenant/environment/assignment/resourceを分離した一変数negative、適用tenant軸だけ照合し、物理環境identityはINFRAへ戻す。 | 旧CAP-002 target identity/TOCTOU `security-capability-broker-authority.md:68–80`（同文書全体も読了）とSEA `security-engagement-authority-requirements.md:24–30`を直接読了。後者はtarget/environment authorityに限られ、現隔離要求と同一視しない現crosswalkを確認。 |
| 004 | 10構成種別、project/root/HEAD/revision/digest/owner/scopeの単独欠落/stale/他project変異と未見正常revisionを検査。owner unknownを保ち実行停止。 | 旧CAP-002 `:68–80`を直接読了。TOCTOUのみ部分類似で、現構成集合/owner/scopeは固定L2から再導出と記録。旧schema/runtimeは未移植。 |
| 005 | raw値非露出、canonical classifier同一性、store非公開、scope付きpositive、repository混入/egress/revoke/unknownを別negative。authority tupleの7項目とpurpose inputを混同しない。 | 旧architecture `L4-basic-design/architecture.md:61–64`（single secret predicate）を直接読了。旧CAP全文 `:1–176` と paired `security-capability-broker-acceptance.md:1–59`を直接読了。Capability Leaseが旧archiveにないことは現FRの検索記録を参照したが、今回archive全件再検索はしていない。 |
| 006 | 送信条件を列挙し、許可済みnormalと各tuple mismatch/unknown negativeを分離。L2-019/1.x sinkは1.0 gateにしない。 | 旧CAP `:97–112` data classification/sink authorityを直接読了。旧CAP-006は別runtime surface coverageで本要件根拠にしないことを確認。旧旧test/runtimeは実行せず。 |
| 007 | 9制御、request→実環境への適用と観測を分離。read-onlyでもwrite禁止とpost-state、rollback N/Aは変更なしの確認時のみ。政策owner=SECURITY、enforcer=Worker環境、実資源/観測=INFRA。 | 旧CAP `:133–166` runtime coverage/AND admission、CAP-007 canonical-failure reason receiptを直接読了。paired acceptance `:42–59` mutation/evidenceを直接読了。現FRは旧Runner/Sandboxを復帰させず、部分類似だけ保持。 |
| 008 | 11 operationを別tupleで判定し、全7 field drift、read/Agentからwrite/deploy昇格を拒否。OS進行はOS owner。 | 旧CAP typed tuple/authority `:32–44,114–131,160–166`とpaired acceptance `:18–29,55–59`を直接読了。旧高影響action/human approval semanticsは現L2に移さず、全operation authorityを再導出というcrosswalkを確認。 |
| 009 | SECURITYはtrigger/policyだけ、recipient stateは各owner。unknownの安全影響範囲を限定。recipient closure/復旧可能前stateを確認。ただしtriggerごと独立fixtureの明記欠落あり（上記finding）。 | SEA `:33` revoke/scope-drift停止を直接読了。旧CAP/acceptanceも上記範囲を読了。旧end-to-end機構横断flowは直接の同一契約なしとするcrosswalkを確認。 |
| 010 | 15 update targetのprovenance/digest/change/new executable/finding/rollback。未知を採用せず、authorityはL2-008、昇格はL2-023。 | Old pillar FR `22–349` はcrosswalkの隣接source locatorとして確認し、security/updateに関する必要箇所ではHR-FR-P8-04/HR-NFR-P8-02を読了。15対象集合そのものは旧assetから継承せずL2/PO §11から再導出との現FRを確認。全349行の全atomを再監査していない。 |
| 011 | file/hash/nameからcapability不変を推定せず、model/Agent/MCP/pluginに適用し、比較不能unknown。 | 旧pillar FRおよびpaired test designを隣接資料としてcrosswalk確認。旧HAT本文の全範囲再読はしていない。正確な能力差条件は固定L2/PO §12から再導出との処置を確認。 |
| 012 | provenance field/unknownを明示しscanner/registry/providerを必須化しない。Agent packageの明示scope名がL3/L10から落ちた曖昧さを報告（上記finding）。 | 旧pillar FR/acceptanceはneighboring provenance materialとのcrosswalk確認。archive全体に`Agent package`語がないことはexact revisionの `git grep` で確認したが、これは旧source complete semantic searchではない。現source対象はL1/L2/PO §13。 |
| 013 | source→build/validation→distribution/runのidentity chain、producer単独差、missing step、digest-only trust/passをnegative。 | 旧pillar FR/acceptanceのchain隣接資料としてcrosswalk確認、全関連旧段落は未読。現chainは固定L2から再導出との現FRを確認。 |
| 014 | 3 target class別decision/理由のみ。保存/handoff/LABO/BRAIN registrationを別L2-027へ残す。source/target/metadata missing, unknown, wrong-targetでhold/deny。 | 現FR `244` は旧SECURITY L3/旧pillar FR/旧acceptanceを検索範囲とし同一契約なしと記す。本監査はそのcrosswalkを読んだが、旧source全範囲の新規検索・再確認はしていない。形式隣接のみで旧意味継承を主張しない。 |
| 015 | 列挙資産と列挙外assetのowner/identity/source/revision/digest、内容dumpなし。1.0基盤と1.x Web protection分離。 | 現FRは旧pillar FR/acceptanceのcore asset/provenanceを隣接根拠と記録。上記HR-FR-P8-04/old HAT-P8-04を直接読了し、asset identityの完全一致契約がない点を確認。全旧pillar ranges未読。 |
| 016 | 6 classと分類記録own metadataをasset identityへ結合しunknownを保つ。1.x sink enforcementを1.0にしない。 | 現FRは旧pillar FR/acceptanceをdata sensitivity隣接例と記録。上記P8 sourceを直接読了し、現6 class語彙/版境界の同一契約は見ていない。全旧source span未読。 |
| 020 | 8 deterministic GuardはBot不在でも機能し、Botは必要時INTELLIGENCEへ。候補Bot全稼働や1.x Core Asset sink protectionを1.0に混ぜず、必要なcredential/general egress/operation guardは延期しない。 | 旧CAP `:133–166`のruntime coverage/AND failureを直接読了し、paired acceptance `:18–29,42–53`のfail-close/no legacy greenを直接読了。Bot候補一覧と同じ責務の旧sourceは現crosswalkが特定せず、旧全資産監査はしていない。 |
| 028 | SECURITY固有accept/reject/unknownをHARNESS descriptorと010/013へ束縛。HARNESSが共通descriptor/交換/rollback/unfinished lifecycleを所有。candidate versionとversion_targetを分離。 | 現FR `300` は旧pillar FR/business detail/security broker/test designを検索範囲とし同一SECURITY/HARNESS descriptor splitなしと記録。crosswalkと選択した旧CAP/paired/legacy test sourcesを確認。旧全source consumerを網羅したとは主張しない。 |

## 既存review記録との重なり確認

`l3-l10-security-stage1-claude-review03-correction-2026-10-05-4f1f93fb5.md` と `l3-l10-security-stage1-review04-correction-2026-10-05-3f8e6f2.md` のfinding/disposition summaryを読み、009 trigger独立fixtureまたは012 Agent package名の指摘は記録内に見つけなかった。これは未返却Minorの不存在を証明しない。上記は今回の本文と固定親の直接照合から得た所見であり、既存review findingの再開/重大度の格上げではない。

## 確認できなかったこと

- L10 fixtureは未実行。document design上の照合のみ。
- 全274 parent、SECURITY Stage1全CASEの全source/consumer、archive内全legacy asset、全未返却review commentを同深度再監査していない。
- 012の「package」がAgent packageを包括する意図かどうかは本文から確定できない。要求意味を変更せず名寄せする最小修正文案以上の判断はしていない。
- 033の意味・修正範囲は監査していない。共有NFR候補内の参照のみ、対象親005/008/009に必要な範囲を確認した。
