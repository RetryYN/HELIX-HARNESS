---
title: "HELIX-CONNECT受入候補"
canonical_vmodel: L1-L12
canonical_layer: L11
canonical_pair: L2
layer: L11
kind: test_design
status: draft
authority_status: draft_candidate
freeze_blocking: true
parent_concept: docs/concept/helix-concept.md
parent_planning: docs/helix-connect/L1-planning/connect-intent.md
pair_artifact: docs/helix-connect/L2-requirements/connect-requirements.md
sources:
  - docs/helix-connect/sources/connect-l1-po-original-2026-09-27.md
  - docs/governance/decisions/connect-l1-po-decisions-2026-09-27.md
  - docs/governance/audits/g7-connect-source-connection-inventory.md
---

# HELIX-CONNECT受入候補

本書は[HELIX-CONNECT要求候補](../L2-requirements/connect-requirements.md)と対になるL11候補である。すべて未実行・未採択であり、文書・ID登録・review・mergeから要求合意、要件承認、実装・運用許可を生成しない。受入は対象要求revisionと同じ接続集合・端点・契約revision・構成体を使い、結果と証拠を照合して判断する。

単体能力（unit）、片側交換の接続（connection）、複数接続の構成体（composite）の結果を別に記録する。単体の受入から構成体の受入を推定しない。`version_target`は目標能力版で、実版ではない。HELIX-CONNECTは業務判断や承認をしない。

各接続の能力名、契約/成果物/依存revision、互換範囲、対象scope、correlation ID、期限、冪等キー、result stateを、受入入力と証拠に記録する。HARNESS-L2-010/011の共通入出力・依存・検証・更新/切戻し/未完義務引継ぎを適用する。SECURITYの許可やdata-use区分は識別子と結果を照合するだけで、CONNECTの受入が許可を発行・拡張しない。

## 受入項目

| AC ID | 対応要求 | 種別 | 受入判定の要点 |
|---|---|---|---|
| HELIXCONNECT-L11-001 | HELIXCONNECT-L2-001 | unit | 登録identityと両端契約が一意に結び付き、不足・不明・同一接続identityの異なる宣言による重複・identity衝突は利用可能にならない。識別可能な別接続による端点共有は拒否しない |
| HELIXCONNECT-L11-002 | HELIXCONNECT-L2-002 | unit | 既存scope/access条件下で互換性を照合し、送信時のみ許可を確認。revision変更後はstaleを検知して再照合まで通信を止める |
| HELIXCONNECT-L11-003 | HELIXCONNECT-L2-003 | unit | 送受信が正しい接続identity・operation・契約revisionに束縛され、契約外入力を成功扱いしない |
| HELIXCONNECT-L11-004 | HELIXCONNECT-L2-004 | unit | 同一内容の再送は二重効果を生まず、異digest衝突・上限超過・再送不能結果は停止する |
| HELIXCONNECT-L11-005 | HELIXCONNECT-L2-005 | unit | 送受信・再送・stale・部分失敗を接続単位に順序追跡できる |
| HELIXCONNECT-L11-006 | HELIXCONNECT-L2-006 | connection | 片側交換後、固定側を変更せず互換なら通信し、非互換/unknown/staleならfail-closeする |
| HELIXCONNECT-L11-007 | HELIXCONNECT-L2-007 | composite | 複数の接続辺とoperation lineageを終端まで追跡し、途中失敗時に全体成功を報告しない |

## 単体接続の確認

### HELIXCONNECT-L11-001 接続登録

一つの接続について、登録済み端点、方向、接続identity、両端の意味契約revision、adapter/transport revision、互換範囲を入力し、受領結果と登録状態を照合する。能力名、契約/成果物/依存版、scope、correlation ID、期限、冪等キー、result stateを含む完全なdescriptorを確認する。各必須値を一つずつ欠落させる、同一接続identityを異なる宣言で二重登録する、未登録revisionを指定するケースでは登録が利用可能状態にならず、欠落またはidentity衝突を記録する。同じ端点を共有する複数の異なる接続identityは、それぞれの意味契約とscopeを識別できれば登録可能である。登録結果が業務承認やSECURITY許可を生成していないことを確認する。

### HELIXCONNECT-L11-002 契約版照合とstale再検証

登録receipt、互換宣言、および入力の読取りに適用される既存scope/access条件の下で、宣言範囲内の両端revisionを参照のみで照合する。互換範囲内ならrevision組合せに束縛した互換性receiptが`compatible`となり、送信適格性は`not_evaluated`、送信attemptは0件であることを確認する。この照合に送信実行用許可を事前要求しない。読取りaccess条件が欠落、拒否またはunknownの場合は、比較結果を出さずunknown/保留とする。

続いて実送信の適格性を判断する操作では、互換成立に加え、actor/target/operation/revision/environment/scope/expiryが一致する有効なSECURITY許可と、適用data-use/classification条件がある場合だけ`eligible`となることを確認する。許可の欠落、unknown、期限切れ、失効、scope不一致、または適用条件のunknownでは、互換結果を保持して`withheld`とし、送信attemptが0件であることを確認する。互換性のunknown/incompatible/staleは、許可があっても送信適格にならない。

登録後に片端revisionまたはadapter revisionを変更し、旧revisionでstaleが立つこと、再照合前は利用不能であること、互換のある新revisionの照合証拠によってのみ当該revision組合せのstaleが解消されることを確認する。未fixtureのrevision組でも、宣言範囲内の参照照合だけなら送信実行用許可を要求しない。宣言外・未登録revisionはunknownとして保留し、互換成立や送信可能を推定しない。

### HELIXCONNECT-L11-003 契約に束縛した通信

同じ接続identity・契約revisionに束縛した要求と受領確認では、同じoperation identityが両端記録に現れ、契約に従う通信結果が得られる。能力名、契約/成果物/依存版、target scope、correlation ID、期限、idempotency key、result stateのどれかを欠落・不一致にした場合に通過しないことを確認する。契約外field、異なるrevision、未知operation、接続identityの取り違えを注入し、正常受信として記録されず、対象接続・理由・観測地点が特定できる証拠が残ることを確認する。適用されるSECURITY許可、期限、operation/target/environment/scope、data-use区分が不明または範囲外なら、CONNECT自身が許可判定を代替せず送信を止める。

### HELIXCONNECT-L11-004 再送・重複防止

一回目の送信後に応答が失われたケースで、再送条件を満たす同一operation・同一digestだけを設定済み上限まで再送し、受信側の処理効果は一回分であることを確認する。上限に到達した後は追加attemptがなく、未完結果が業務ownerへ返ることを確認する。同じoperation identityで異なるdigestを送るケースは衝突として拒否され、受信側の処理効果が増えないことを確認する。業務エラーまたは再送不可の失敗はretryされないことを確認する。

### HELIXCONNECT-L11-005 追跡と部分失敗

送信受付後に受信確認が失敗するケース、再送途中で接続がstaleになるケース、期限切れ、取消、許可失効を作る。証拠に、接続identity、能力名、operation/correlation/idempotency identity、target scope、使用revision、期限、互換照合結果、各attemptの識別子・順序・結果、停止理由、成功を観測した端点を含むことを確認する。ACKなし・取消・期限切れ・許可失効をunknown/unfinishedとして保持し、業務完了へ丸めない。途中まで成功した状態をend-to-end成功へ丸めず、raw業務payload、secret、credential値を追跡証拠へ複製しない。

## 接続の確認

### HELIXCONNECT-L11-006 片側交換

二機構の一接続を用意する。4ケース（送信側機構本体のみ、送信側adapter/transportのみ、受信側機構本体のみ、受信側adapter/transportのみを交換）を独立に行い、交換しない側の機構・契約revisionを固定する。交換revisionが互換範囲内なら、stale再照合後に固定側を改変せず同一契約上の通信が成立することを確認する。未完operation/ACK/attempt/期限/未完義務が交換後のhandoffに保持され、旧revisionと新revisionを混ぜず、再照合と再開条件の成立前にretryされないことを確認する。交換前後のrevision・照合・送受信が一続きの証拠から辿れることを確認する。続いて各交換側について非互換revision、未登録revision、意味契約変更、stale照合結果を与え、各ケースで通信が0件となり、固定側を更新したことにして成功を偽装しないことを確認する。互換範囲外を交換可能と扱わない。

## 構成体の確認

### HELIXCONNECT-L11-007 複数機構の構成体

3つ以上の機構と複数の接続identityで構成する一連の処理を用意し、各辺に異なる能力名、契約revision、対象scopeを割り当てる。各辺の登録・互換照合・operation/correlation/idempotency引継ぎ・expiry/result state・SECURITY/data-use識別子・送受信結果が辺ごとに記録され、構成体の追跡から全辺の順序と終端が辿れることを確認する。一つの中間辺をstale、timeout、異digest再送衝突、期限切れ、取消、許可失効、部分成功にし、後続辺へ未許可の再送/送信が伝播しないこと、全体が成功表示にならないこと、停止位置と未完の引継ぎ先/recovery先が明示されることを確認する。全辺が技術的に完了しても、接続先業務上の成立・承認が生成されないことを確認する。

## 判断に使う証拠

各受入結果は対象の要求revision、接続棚卸しで確定した接続identity集合、端点revision、試験前後の登録revision、照合結果、各operation/attempt、受信側効果、失敗時の停止地点へ対応づける。fixture例や一つのconnection greenだけで、未棚卸接続、別の端点revision、複数機構の構成体を受け入れ済みとしない。未実行、証拠欠落、unknown、revision不一致はpassにしない。

## 段階ごとの成立範囲

段階リリースに含める接続機能の範囲は、HELIXCONNECT-L2-001〜007のうち、その段階で機能として成立する要求から導出する。独立した段階リリース機能や段階の順序は本受入候補で新設しない。


### HELIXCONNECT-L11-008 MCP profile catalogとtyped descriptorの供給

静的fixtureで、登録済みprofile identity/revisionの列挙、設定契約の型、operation/tool capability descriptor、安全・read-only probe descriptorが同じprofile/revisionへ束縛されることを確認する。descriptorにraw secretまたはcredential値が含まれず、descriptorの読出しがauthorization、probe起動、tool実行を生まないことを確認する。

未登録・未知profile、同一identityの競合宣言、未登録revision、誤った設定型、欠落または型違いdescriptor、変更後にstaleなrevisionをfixtureへ与え、各々が利用可能状態にならず、reasonとprofile/revisionが記録されることを確認する。既定profileへのfallbackや安全性の推定がないことを確認する。read-only descriptorがあっても、それ自体でprobe実行・認可が可能にならないことを確認し、operation safetyの判定先がSECURITYであることを示す。SECURITY-L2-034の未採択候補に属するpolicy oracleをこの候補のpass根拠にしない。

不正identity/config/descriptorの修正先がprofile提供元、policy/safetyのunknownまたは拒否の戻し先がSECURITYと区別され、対象外profileへ失敗が伝播しないfixtureを確認する。確認は文書と静的fixtureの受入 oracle に限定し、旧runtime・旧testや現行MCP runtimeの起動、実probe、tool操作を行わない。証拠がない場合はpassではなくunknownとする。本受入候補の成立は要求の採択、実装、実行許可またはSECURITY-L2-034採択を意味しない。
### HELIXCONNECT-L11-009 接続方向・実行順序属性とfeedback relationの受入候補

- **正常例（片方向）**：A→Bを`one_way`として登録し、同じoperation/correlation lineage上の結果と一方向feedback B→Aを記録する。B→Aの伝送を実行する場合は、独立して宣言された逆方向connectionとそのoperationに適用される既存authorityを照合する。許可がなければfeedbackは未送信のreturn relationとして記録され、送信成功に見せない。
- **正常例（bounded loop）**：前向き辺A→Bと、理由・source/target identity・revisionを持つfeedback edge B→A、既存のretry/budget policy参照、期限、終端ownerを与える。各反復のattempt countとoperation lineageを累積し、既存上限到達で停止してOS-040等の既存ownerへ未解決として返す。prose feedbackだけでresolvedにしない（OS-044境界）。
- **正常例（順序）**：複数edgeをserial指定した場合は宣言順と先行条件を維持する。parallel指定では独立するedgeをそれぞれ追跡し、宣言されたjoinの全条件が満たされるまでcompositeを完了扱いしない。
- **拒否例**：one-way A→BからB→Aの送信権を推論する、paired bidirectionalの片方向だけauthority確認する、方向またはfeedbackのendpoint/contract revisionを欠いたrelationを利用可能扱いする、理由なしfeedbackをresolutionとして扱う、termination policyなしのloop、反復ごとのretry budget reset、宣言のない順序/join、辺の一部成功を全体成功へ伝播する場合は不合格。
- **unknown例**：endpoint、接続identity、契約revision、既存authority、feedback reason/source、retry上限／budget、期限、join条件、ACKのいずれかがmissing・unknown・stale・conflictなら、送信／retry／完了を成立させず、missing inputとownerを記録して停止する。
