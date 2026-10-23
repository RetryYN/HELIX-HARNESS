/-
HELIX 上流authority状態モデルの形式化パイロット（scaffold、authority_effect: none）。

対象: docs/governance/authority-state-model.md（五つの独立した状態軸、許可する状態遷移、fail-close規則）。
本fileは同文書の規則を有限の抽象モデルへ写したものであり、新しい規則・gate・承認手続きを足さない。
状態値は同文書の「現在使う値の例」を抽象値として使い、値域を確定しない。
写像と、抽象化で落とした意味は同じdirectoryの README.md に記録する。
-/

namespace HelixAuthority

/-! ## 状態軸（authority-state-model.md「五つの独立した状態軸」） -/

inductive SourceState where
  | confirmed | draft | proposed | placeholder
  | historicalCandidate | specifiedFrozen | sourceStatusNotDeclared
  deriving DecidableEq, Repr

inductive TargetState where
  | draftCandidate | draft | awaitingParentApproval | approvedRevision
  deriving DecidableEq, Repr

/-- 対象文書の層。委任承認の対象（L3／L10）を区別するためだけに持つ。 -/
inductive Layer where
  | l3 | l10 | other
  deriving DecidableEq, Repr

inductive DecisionKind where
  | human | delegated
  deriving DecidableEq, Repr

/-- 対象revision付きのdecision。`digestOk` はdecisionが指す本文digestの一致。 -/
structure Decision where
  kind : DecisionKind
  rev : Nat
  digestOk : Bool
  deriving DecidableEq, Repr

inductive CarryState where
  | preservedPendingRehome | partiallyCovered | covered
  | meaningChangeDecided | retiredByDecision
  deriving DecidableEq, Repr

inductive MgmtState where
  | unregistered | registeredSourceHolding | registeredProposal
  | stale | superseded | rejectedRegistration
  deriving DecidableEq, Repr

inductive WorkState where
  | proposedUpstreamWaiting | ready | inProgress | reviewed | closed | projectionFailed
  deriving DecidableEq, Repr

/-! 外部projection（GitHub表示）。五軸ではなく、work_projection側の観測として持つ。 -/

inductive IssueState where
  | opened | closed
  deriving DecidableEq, Repr

inductive PrState where
  | draft | ready | merged
  deriving DecidableEq, Repr

inductive CheckState where
  | none | green | failure
  deriving DecidableEq, Repr

/-- 一要求identity分の抽象状態。 -/
structure St where
  src : SourceState
  layer : Layer
  tgt : TargetState
  tgtRev : Nat
  /-- 現在の承認を成立させたdecision。 -/
  decision : Option Decision
  cf : CarryState
  /-- successorごとの被覆記録の件数。 -/
  successors : Nat
  /-- 原意味atomのうち未被覆の件数。 -/
  uncovered : Nat
  /-- 意味変更・retireを決めた対象revision付き人間decisionの有無。 -/
  changeDecision : Bool
  mgmt : MgmtState
  work : WorkState
  issue : IssueState
  pr : PrState
  check : CheckState
  deriving DecidableEq, Repr

/-- authorityを持つ部分（source／target／carry_forward）。management・work・外部projectionを含まない。 -/
structure Authority where
  src : SourceState
  layer : Layer
  tgt : TargetState
  tgtRev : Nat
  decision : Option Decision
  cf : CarryState
  successors : Nat
  uncovered : Nat
  changeDecision : Bool
  deriving DecidableEq, Repr

def St.authority (s : St) : Authority :=
  { src := s.src, layer := s.layer, tgt := s.tgt, tgtRev := s.tgtRev, decision := s.decision,
    cf := s.cf, successors := s.successors, uncovered := s.uncovered,
    changeDecision := s.changeDecision }

/-! ## 操作（authority-state-model.md「許可する状態遷移」） -/

inductive Act where
  /-- 対象revision付きdecision（人間、またはL3／L10の委任）。 -/
  | decide (d : Decision)
  /-- 対象文書の本文を更新し、新しいrevisionにする。 -/
  | edit
  /-- successor一件の被覆記録。`n` は新たに被覆したatom数。 -/
  | recordCoverage (n : Nat)
  /-- 意味変更（retire = false）またはretire（retire = true）の対象revision付き人間decision。 -/
  | decideChange (retire : Bool) (decisionOk : Bool)
  | register (proposal : Bool)
  | terminate (m : MgmtState)
  | workStep (w : WorkState)
  | setIssue (i : IssueState)
  | setPr (p : PrState)
  | setCheck (c : CheckState)
  deriving DecidableEq, Repr

def isOpenTarget : TargetState → Bool
  | .draftCandidate | .draft | .awaitingParentApproval => true
  | .approvedRevision => false

def mayDecide (layer : Layer) : DecisionKind → Bool
  | .human => true
  | .delegated => layer == .l3 || layer == .l10

def isPending : CarryState → Bool
  | .preservedPendingRehome | .partiallyCovered => true
  | _ => false

/-- 被覆記録を受け付ける前提：保持中で、新たに被覆するatomが1件以上かつ未被覆の範囲内。 -/
def canCover (cf : CarryState) (uncovered n : Nat) : Bool :=
  isPending cf && 0 < n && n ≤ uncovered

def isLive : MgmtState → Bool
  | .registeredSourceHolding | .registeredProposal => true
  | _ => false

def isTerminal : MgmtState → Bool
  | .stale | .superseded | .rejectedRegistration => true
  | _ => false

/-- 遷移関数。前提が成り立たない操作は状態を変えない（fail-close「元状態を保持して停止する」）。 -/
def step (s : St) : Act → St
  | .decide d =>
      if isOpenTarget s.tgt && d.rev == s.tgtRev && d.digestOk && mayDecide s.layer d.kind then
        { s with tgt := .approvedRevision, decision := some d }
      else s
  | .edit =>
      -- 承認は対象revisionに束縛される。新revisionは承認を引き継がない。
      if s.tgt == .approvedRevision then
        { s with tgtRev := s.tgtRev + 1, tgt := .draft, decision := none }
      else
        { s with tgtRev := s.tgtRev + 1 }
  | .recordCoverage n =>
      if canCover s.cf s.uncovered n then
        { s with successors := s.successors + 1, uncovered := s.uncovered - n,
                 cf := if s.uncovered - n == 0 then .covered else .partiallyCovered }
      else s
  | .decideChange retire ok =>
      if isPending s.cf && ok then
        { s with cf := if retire then .retiredByDecision else .meaningChangeDecided,
                 changeDecision := true }
      else s
  | .register proposal =>
      if s.mgmt == .unregistered then
        { s with mgmt := if proposal then .registeredProposal else .registeredSourceHolding }
      else s
  | .terminate m =>
      if isLive s.mgmt && isTerminal m then { s with mgmt := m } else s
  | .workStep w => { s with work := w }
  | .setIssue i => { s with issue := i }
  | .setPr p => { s with pr := p }
  | .setCheck c => { s with check := c }

/-! ## 不変条件 -/

/-- T1: approved_revisionは、同じ対象revision・digest一致・資格のあるdecisionがある時だけ。 -/
def approvalBound (s : St) : Prop :=
  s.tgt = .approvedRevision →
    ∃ d, s.decision = some d ∧ d.rev = s.tgtRev ∧ d.digestOk = true ∧
      mayDecide s.layer d.kind = true

/-- C1: coveredは、successorがあり未被覆が0件の時だけ。 -/
def coveredBound (s : St) : Prop :=
  s.cf = .covered → 0 < s.successors ∧ s.uncovered = 0

/-- C2: 意味変更・retireは人間decisionがある時だけ。 -/
def changeBound (s : St) : Prop :=
  (s.cf = .meaningChangeDecided ∨ s.cf = .retiredByDecision) → s.changeDecision = true

def Inv (s : St) : Prop := approvalBound s ∧ coveredBound s ∧ changeBound s

/-- 初期状態：対象は未承認、原要求は保持中、decision・被覆記録・意味変更decisionなし。 -/
def Init (s : St) : Prop :=
  isOpenTarget s.tgt = true ∧ s.decision = none ∧ s.cf = .preservedPendingRehome ∧
    s.successors = 0 ∧ s.changeDecision = false

inductive Reachable : St → Prop where
  | init {s} : Init s → Reachable s
  | next {s} (a : Act) : Reachable s → Reachable (step s a)

/-! ## 証明 -/

theorem init_inv {s : St} (h : Init s) : Inv s := by
  obtain ⟨ht, _, hc, _, _⟩ := h
  refine ⟨?_, ?_, ?_⟩
  · intro hap; rw [hap] at ht; simp [isOpenTarget] at ht
  · intro hcov; rw [hc] at hcov; cases hcov
  · intro h; rw [hc] at h; rcases h with h | h <;> cases h

theorem step_inv {s : St} (a : Act) (h : Inv s) : Inv (step s a) := by
  obtain ⟨hT, hC, hX⟩ := h
  cases a with
  | decide d =>
    simp only [step]
    split
    · next hg =>
      simp only [Bool.and_eq_true, beq_iff_eq] at hg
      obtain ⟨⟨⟨_, hrev⟩, hdig⟩, hmay⟩ := hg
      exact ⟨fun _ => ⟨d, rfl, hrev, hdig, hmay⟩, hC, hX⟩
    · exact ⟨hT, hC, hX⟩
  | edit =>
    simp only [step]
    split
    · refine ⟨?_, hC, hX⟩
      intro h; cases h
    · next hne =>
      refine ⟨?_, hC, hX⟩
      intro hap
      simp only [beq_iff_eq] at hne
      exact absurd hap hne
  | recordCoverage n =>
    simp only [step]
    split
    · refine ⟨hT, ?_, ?_⟩
      · intro hcov
        simp only at hcov
        split at hcov
        · next hz =>
          simp only [beq_iff_eq] at hz
          exact ⟨Nat.succ_pos _, hz⟩
        · cases hcov
      · intro h
        simp only at h
        split at h <;> (rcases h with h | h <;> cases h)
    · exact ⟨hT, hC, hX⟩
  | decideChange retire ok =>
    simp only [step]
    split
    · refine ⟨hT, ?_, fun _ => rfl⟩
      intro hcov
      simp only at hcov
      split at hcov <;> cases hcov
    · exact ⟨hT, hC, hX⟩
  | register p =>
    simp only [step]; split
    · exact ⟨hT, hC, hX⟩
    · exact ⟨hT, hC, hX⟩
  | terminate m =>
    simp only [step]; split
    · exact ⟨hT, hC, hX⟩
    · exact ⟨hT, hC, hX⟩
  | workStep w => exact ⟨hT, hC, hX⟩
  | setIssue i => exact ⟨hT, hC, hX⟩
  | setPr p => exact ⟨hT, hC, hX⟩
  | setCheck c => exact ⟨hT, hC, hX⟩

/-- 到達可能な全状態でT1・C1・C2が成り立つ。 -/
theorem reachable_inv {s : St} (h : Reachable s) : Inv s := by
  induction h with
  | init hi => exact init_inv hi
  | next a _ ih => exact step_inv a ih

/-- S1: source_authority_stateはどの操作でも変わらない。 -/
theorem source_frame (s : St) (a : Act) : (step s a).src = s.src := by
  cases a <;> simp only [step] <;> (try split) <;> rfl

def isProjection : Act → Bool
  | .workStep _ | .setIssue _ | .setPr _ | .setCheck _ => true
  | _ => false

def isManagement : Act → Bool
  | .register _ | .terminate _ => true
  | _ => false

/-- W1: work・Issue・PR・checkの操作はauthorityの部分を変えない（merge・close・greenから承認やcoveredを生成しない）。 -/
theorem projection_frame (s : St) (a : Act) (h : isProjection a = true) :
    (step s a).authority = s.authority := by
  cases a <;> simp [isProjection] at h <;> rfl

/-- M1: 管理層の仮登録はauthorityの部分もworkも変えない（authority_effect: none）。 -/
theorem management_frame (s : St) (a : Act) (h : isManagement a = true) :
    (step s a).authority = s.authority ∧ (step s a).work = s.work := by
  cases a <;> simp [isManagement] at h
  · simp only [step]; split <;> exact ⟨rfl, rfl⟩
  · simp only [step]; split <;> exact ⟨rfl, rfl⟩

/-- authorityの部分だけで定義した遷移。management・work・Issue・PR・checkを引数に持たない。 -/
def stepA (x : Authority) : Act → Authority
  | .decide d =>
      if isOpenTarget x.tgt && d.rev == x.tgtRev && d.digestOk && mayDecide x.layer d.kind then
        { x with tgt := .approvedRevision, decision := some d }
      else x
  | .edit =>
      if x.tgt == .approvedRevision then
        { x with tgtRev := x.tgtRev + 1, tgt := .draft, decision := none }
      else
        { x with tgtRev := x.tgtRev + 1 }
  | .recordCoverage n =>
      if canCover x.cf x.uncovered n then
        { x with successors := x.successors + 1, uncovered := x.uncovered - n,
                 cf := if x.uncovered - n == 0 then .covered else .partiallyCovered }
      else x
  | .decideChange retire ok =>
      if isPending x.cf && ok then
        { x with cf := if retire then .retiredByDecision else .meaningChangeDecided,
                 changeDecision := true }
      else x
  | _ => x

/-- 全体の遷移をauthorityへ射影すると、authorityだけの遷移と一致する。 -/
theorem step_authority (s : St) (a : Act) : (step s a).authority = stepA s.authority a := by
  cases a with
  | decide d =>
    by_cases hc : (isOpenTarget s.tgt && d.rev == s.tgtRev && d.digestOk &&
        mayDecide s.layer d.kind) = true <;> simp [step, stepA, St.authority, hc]
  | edit =>
    by_cases hc : s.tgt = .approvedRevision <;> simp [step, stepA, St.authority, hc]
  | recordCoverage n =>
    cases hc : canCover s.cf s.uncovered n <;> simp [step, stepA, St.authority, hc]
  | decideChange r ok =>
    by_cases hc : (isPending s.cf && ok) = true <;> simp [step, stepA, St.authority, hc]
  | register p =>
    by_cases hc : s.mgmt = .unregistered <;> simp [step, stepA, St.authority, hc]
  | terminate m =>
    by_cases hc : (isLive s.mgmt && isTerminal m) = true <;> simp [step, stepA, St.authority, hc]
  | workStep w => rfl
  | setIssue i => rfl
  | setPr p => rfl
  | setCheck c => rfl

/-- X2（非干渉）: authorityの次状態は、現在のauthorityと操作だけで決まる。
    management・work・Issue・PR・checkの値が違っても、authorityの遷移は同じになる。 -/
theorem authority_noninterference (s t : St) (a : Act) (h : s.authority = t.authority) :
    (step s a).authority = (step t a).authority := by
  rw [step_authority, step_authority, h]

/-! ## Red：既知の失敗を入れた変異モデルは反例を持つ

各変異は、記録された失敗の型を一つだけ入れる。正しいモデルでは同じ性質が証明済みであり、
変異モデルではその性質を破る具体的な状態と操作が存在する（反例）。 -/

/-- 反例に使う基準状態：L2相当の未承認対象、未被覆2件。 -/
def s0 : St :=
  { src := .confirmed, layer := .other, tgt := .draft, tgtRev := 1, decision := none,
    cf := .preservedPendingRehome, successors := 0, uncovered := 2, changeDecision := false,
    mgmt := .unregistered, work := .proposedUpstreamWaiting, issue := .opened, pr := .draft,
    check := .none }

theorem s0_init : Init s0 := ⟨rfl, rfl, rfl, rfl, rfl⟩

/-- 変異1（PR mergeを承認として扱う）。 -/
def stepMergeApproves (s : St) : Act → St
  | .setPr .merged => { s with pr := .merged, tgt := .approvedRevision }
  | a => step s a

theorem mergeApproves_breaks_inv :
    Inv s0 ∧ ¬ Inv (stepMergeApproves s0 (.setPr .merged)) := by
  refine ⟨init_inv s0_init, ?_⟩
  intro ⟨hT, _, _⟩
  obtain ⟨d, hd, _⟩ := hT rfl
  cases hd

/-- 変異2（Issue closeをcoveredとして扱う）。 -/
def stepCloseCovers (s : St) : Act → St
  | .setIssue .closed => { s with issue := .closed, cf := .covered }
  | a => step s a

theorem closeCovers_breaks_inv :
    Inv s0 ∧ ¬ Inv (stepCloseCovers s0 (.setIssue .closed)) := by
  refine ⟨init_inv s0_init, ?_⟩
  intro ⟨_, hC, _⟩
  have := (hC rfl).1
  cases this

/-- 変異3（一部successorの被覆記録だけでcoveredにする）。 -/
def stepPartialCovers (s : St) : Act → St
  | .recordCoverage n =>
      if canCover s.cf s.uncovered n then
        { s with successors := s.successors + 1, uncovered := s.uncovered - n, cf := .covered }
      else s
  | a => step s a

theorem partialCovers_breaks_inv :
    Inv s0 ∧ ¬ Inv (stepPartialCovers s0 (.recordCoverage 1)) := by
  refine ⟨init_inv s0_init, ?_⟩
  intro ⟨_, hC, _⟩
  have := (hC rfl).2
  cases this

/-- 変異4（decisionの対象revisionを照合しない＝古いrevisionへのdecisionで承認する）。 -/
def stepStaleDecision (s : St) : Act → St
  | .decide d =>
      if isOpenTarget s.tgt && d.digestOk && mayDecide s.layer d.kind then
        { s with tgt := .approvedRevision, decision := some d }
      else s
  | a => step s a

theorem staleDecision_breaks_inv :
    Inv s0 ∧ ¬ Inv (stepStaleDecision s0 (.decide ⟨.human, 0, true⟩)) := by
  refine ⟨init_inv s0_init, ?_⟩
  intro ⟨hT, _, _⟩
  obtain ⟨d, hd, hrev, _⟩ := hT rfl
  simp [stepStaleDecision, s0, isOpenTarget, mayDecide] at hd
  subst hd
  cases hrev

/-- 変異5（CI greenを見て承認する＝承認のguardが外部projectionを読む）。非干渉を破る。 -/
def stepGreenGuard (s : St) : Act → St
  | .decide d =>
      if s.check == .green && isOpenTarget s.tgt && d.rev == s.tgtRev && d.digestOk &&
          mayDecide s.layer d.kind then
        { s with tgt := .approvedRevision, decision := some d }
      else s
  | a => step s a

theorem greenGuard_breaks_noninterference :
    s0.authority = { s0 with check := .green }.authority ∧
    (stepGreenGuard s0 (.decide ⟨.human, 1, true⟩)).authority ≠
      (stepGreenGuard { s0 with check := .green } (.decide ⟨.human, 1, true⟩)).authority := by
  decide

end HelixAuthority
