# confirmed175 条件比較: DAC-FR-009 / DAC-FR-010

## 範囲と状態

基準revision `29bbd42f8c5d4399776b9b5cfc4fc18f789ea300`。旧asset `sha256:eeace2db2a8183a6563428d4c486dedeb7a0ba0286703b195948c5cd4e749f56` はconfirmed L1 source snapshotで、carry-forwardは `preserved_pending_rehome`。監査対象は source-qualified identity 2件。固定f6 `f6dad2a33e24f000b87d7f09b8d40288257e74cc` と照合する静的比較であり、`authority_effect: none`。

旧L1 sourceは `L3-PO-1381-001` で確認済み。本監査は対象別successor、owner移管、実装・実行・受入・closureを生成しない。旧CLI/runtime/hook/test/CIは実行していない。

## Sourceとconsumer pin

### DAC-FR-009

Source-qualified identity: `helix/L1-requirements/document-authority-census-requests.md::DAC-FR-009`。

- Source line 56, SHA-256 `sha256:881e9a2aa919c8bb082c075f7ab2648bc78c7a185e6689af6042ca8dbe16a004`: | `DAC-FR-009` | #825の要求materialization監査、#1370のstartup projection、#206の旧surface是正と責務を重複させずAND条件で接続する。 |
- 旧consumer pins:
  - `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/document-authority-census-requirements.md:66` SHA-256 `sha256:2c23e1baa276622f0708c40ff631e2eaadbd335e45e9a02bb8a58a935d3a23ba`: | `DAC-R-011` | #825、#1370、本Censusは独立receiptを返し、aggregate gateは三者すべてのgreenを要求する。 | `DAC-FR-009` |
  - `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/document-authority-census-acceptance.md:42` SHA-256 `sha256:ae85dc265a15434d43c8e9f844be42f2ff62743d167c26909721aeb329300b20`: | `DAC-AC-017` | `DAC-R-011` | #825または#1370だけをgreenにする | Censusを含むaggregateはgreenにならない |
- 保持する意味: #825の要求materialization監査、#1370のstartup projection、Census receiptの3つを個別に識別し、すべてが明示的にgreenの場合だけaggregate greenとする。各入力のstatusとprovenanceを保持し、missing・stale・unknown・non-greenの優先順位や変換規則を新設しない。#206は旧surface是正の責務境界を示す参照として保持し、receiptに数えない。
- 固定f6比較と残差: #825の要求materialization監査、#1370のstartup projection、Census receiptをそれぞれ独立入力とする。#206は責務境界の参照であり、重複しない第四receiptとして扱わない。固定f6に3 receipt ANDの完全一致targetはない。後発live26採択のHELIXOS-L2-111は抽象AND条件への近接に限られ、receipt identity、owner、scope、実際のgreen証拠、gateを確定しない。

### DAC-FR-010

Source-qualified identity: `helix/L1-requirements/document-authority-census-requests.md::DAC-FR-010`。

- Source line 57, SHA-256 `sha256:a60b7e32cea56eb79ae7839c89b34d49add9a777e5bbe5721cc9a738fd149046`: | `DAC-FR-010` | Concept、requirements、README等のsemantic epochが変わったとき、旧epochのactive claimとconsumerを検出する。 |
- 旧consumer pins:
  - `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/document-authority-census-requirements.md:65` SHA-256 `sha256:5d1aec9d95fcb2085a2eb4cbfeae3ffe4a37a4bde96558663b72a90212814e3b`: | `DAC-R-010` | semantic epoch変更時は、旧epochをcurrentとして読むconsumer、digest pin、README、startup packetをstaleとして検出する。 | `DAC-FR-010` |
  - `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/document-authority-census-acceptance.md:41` SHA-256 `sha256:0769303001a13a9afd63a699757336f2dbd015b3f7e0c0eb0116f53cca481290`: | `DAC-AC-016` | `DAC-R-010` | semantic epoch更新後も旧digest pinをconsumerへ残す | `SEMANTIC_EPOCH_DRIFT`でredになる |
- 関連context（source atom外） `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/document-authority-census-requests.md:64` SHA-256 `sha256:fa28c9426e876631ba56fae5df7c7e04313cd18e28f70c1693d928587f5f6c8f`: | `DAC-NFR-002` | compatibility、historical、referenceの存在を欠陥扱いせず、active decision利用だけを拒否する。 |
- 保持する意味: 明示されたsemantic epoch変更後に、旧epochのactive claimとconsumerを検出する。digest差だけからepoch変更を推定せず、明示的に束縛されたsource/consumer間のepoch関係を比較する。epoch/source/consumer/scope evidenceが欠落またはstaleならunknownを保持する。
- 固定f6比較と残差: Fixed f6 OS-015 covers owner/identity/source/revision/digest authority records; HARNESS-001/004 cover layer-pair integrity and change impact/reverification. They do not specify semantic-epoch authority, full active claim/consumer enumeration, stale epoch detection, or scanner residual handling. HELIXOS-L2-110 is a later live26-adopted one-source/consumer epoch-pin comparison only, not a full census or scanner closure.

## 固定f6 L2/L11比較

DAC-FR-009には三receiptの明示ANDを担う固定f6 targetを特定できず、targetなしと記録する。DAC-FR-010についてはHELIXOS-L2-015、HARNESS-L2-001、HARNESS-L2-004のrevision-pinned L2/L11 bytesを比較した。正確な行pinとSHA-256はJSONの `fixed_f6_target.relevant_comparison_pins` にある。

## 後発decision proximity screen

57候補（57 identity row）、11候補（10 registered adoption rows＋HARNESS-L2-049未採択row）、live26（26 identity row）のregistration-decision表を各source fileのdigestとともにコンパクトに照合し、2つの旧source identityの直接decision matchは0件。screen対象のadopted registration-decision rowは53+10+25=88件。live26採択 `HELIXOS-L2-111` は三つの明示greenを求める抽象ANDだけ、`HELIXOS-L2-110` は明示した一つのsource/consumer epoch-pin比較だけを対象とする条件近接で、旧sourceとの同値やclosureを示さない。詳細はJSONのdecision row、registration row、候補section pinsに記録。いずれも旧source closure、formal successor/owner transfer、全receipt mapping、全consumer census、scanner実行を生じない。

## 重複照合と検証境界

先行FR009/010 registration source-lines / coverage receiptsおよびlive candidate packetは確認した。これらはsingle-atom candidate scope recordであり、本fixed-f6 condition comparisonとは別種の証拠。BR01-05とFR04-08個票も別identity scope。本監査JSONに要求stage既存の参照artifact一覧、決定表行SHA、source/consumer/L2/L11 pinsを格納した。

静的確認のみに限定する。archive runtime、CLI、hook、test、CIは不実行。
