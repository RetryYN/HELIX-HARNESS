import { join } from "node:path";

const GENERATED_BY = "helix-handover";
const HANDOVER_DIR = join(".helix", "handover");
const POINTER_PATH = join(HANDOVER_DIR, "CURRENT.json");
const PLAN_DIGEST_DIR = join(".helix", "logs", "plan");
const CURRENT_PLAN_REL = join(".helix", "state", "current-plan");
const MAX_SAME_DAY_ENTRIES = 4;
const MAX_SUMMARY_PLANS = 12;
const HANDOVER_NEXT_ACTION_MARKER = "機械次手 (workflowNextActions)";
const HANDOVER_OUTSTANDING_MARKER = "機械集計 (outstanding)";

export {
  CURRENT_PLAN_REL,
  GENERATED_BY,
  HANDOVER_DIR,
  HANDOVER_NEXT_ACTION_MARKER,
  HANDOVER_OUTSTANDING_MARKER,
  MAX_SAME_DAY_ENTRIES,
  MAX_SUMMARY_PLANS,
  PLAN_DIGEST_DIR,
  POINTER_PATH,
};
