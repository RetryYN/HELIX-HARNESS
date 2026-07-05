import {
  HELIX_REQUIREMENTS_BINDING_DEFAULTS,
  type RefactorCandidatePolicy,
} from "../config/requirements-binding";

export type { RefactorCandidatePolicy };

export const REFACTOR_SCAN_ROOTS = HELIX_REQUIREMENTS_BINDING_DEFAULTS.refactorCandidates.scanRoots;

export const REFACTOR_CANDIDATE_THRESHOLDS =
  HELIX_REQUIREMENTS_BINDING_DEFAULTS.refactorCandidates.thresholds;

export const REFACTOR_POLICY_TERMS =
  HELIX_REQUIREMENTS_BINDING_DEFAULTS.refactorCandidates.policyTerms;

export const DEFAULT_REFACTOR_CANDIDATE_POLICY =
  HELIX_REQUIREMENTS_BINDING_DEFAULTS.refactorCandidates;
