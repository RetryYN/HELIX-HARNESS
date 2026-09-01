# Closure Semantic Authority Join

## 目的

evidence-probeが観測したprocess値と、既存のreview／oracle／runtime authorityを混同せず、
PLANとartifact kindへexact joinしてclosure evidenceをmaterializeする。

## 契約

- 入力はclosure-evidence-semantic-authority-bundle.v1とする。
- bundle digest、各source artifactの物理digest、source payloadを再計算する。
- 同一PLANのreview、structured test、runtime recordは同一candidate HEADへ束縛する。
- structured testのoracle_idとruntimeのtest_oracle_idを一致させる。
- reviewはverdict=approve、runtimeはaccept_status=acceptedだけを受理する。
- PLANまたはartifact kindが一致しないrecordはplaceholderを解決しない。
- probeのcompleted_atをreview、test、runtimeの時刻へ流用しない。
- bundle digestとsource digestをapproval scopeへ含める。

## 失敗境界

absolute／repository外path、source digest不一致、payload不一致、重複record、wrong HEAD、
wrong oracle、unapproved review、unaccepted runtimeはfail-closeする。bundle欠落時は既存の
blocked_placeholdersを維持し、推測fallbackしない。
