const LOOP_PLAN_ID =
  /^PLAN-(?:L(?:[0-9]|1[0-4])|M|DISCOVERY|REVERSE|RECOVERY)-[A-Za-z0-9][A-Za-z0-9-]*$/;

export function assertLoopPlanId(planId: string): string {
  if (!LOOP_PLAN_ID.test(planId)) throw new RangeError(`invalid loop plan id: ${planId}`);
  return planId;
}
