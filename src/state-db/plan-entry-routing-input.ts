import { existsSync } from "node:fs";
import {
  loadPlanEntryRoutingDocs,
  type PlanEntryRoutingDoc,
  type PlanEntrySignalResolution,
  unresolvedPlanEntrySignals,
} from "../lint/plan-entry-routing";
import { defaultHarnessDbPath, type HarnessDb, openHarnessDb } from "./index";

function stringField(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function feedbackSignalToken(db: HarnessDb, value: string): string | null {
  const row = db
    .prepare(
      `SELECT signal_type, source_table
         FROM feedback_events
        WHERE source_id = ? OR feedback_event_id = ?
        LIMIT 1`,
    )
    .get(value, value);
  const signalType = stringField(row?.signal_type);
  const sourceTable = stringField(row?.source_table);
  return signalType ?? sourceTable;
}

function issueQueueSignalToken(db: HarnessDb, value: string): string | null {
  const queue = db
    .prepare("SELECT source_event_id FROM issue_queue WHERE issue_queue_id = ? LIMIT 1")
    .get(value);
  const sourceEventId = stringField(queue?.source_event_id);
  return sourceEventId ? feedbackSignalToken(db, sourceEventId) : null;
}

export function resolvePlanEntrySignalsFromDb(
  repoRoot: string,
  entrySignals: string[],
): PlanEntrySignalResolution[] {
  const dbPath = defaultHarnessDbPath(repoRoot);
  if (!existsSync(dbPath)) return unresolvedPlanEntrySignals(entrySignals);

  let db: HarnessDb | null = null;
  try {
    db = openHarnessDb(dbPath, { repoRoot });
    return entrySignals.map((value) => {
      if (value.startsWith("po_directive:")) {
        return { value, token: "po_directive", kind: "po_directive" };
      }
      const feedbackToken = feedbackSignalToken(db as HarnessDb, value);
      if (feedbackToken) return { value, token: feedbackToken, kind: "feedback" };
      const queueToken = issueQueueSignalToken(db as HarnessDb, value);
      if (queueToken) return { value, token: queueToken, kind: "issue_queue" };
      return { value, token: null, kind: "unresolvable" };
    });
  } catch {
    return unresolvedPlanEntrySignals(entrySignals);
  } finally {
    try {
      db?.close();
    } catch {
      // fail-close の判定は上で完了済み。close 失敗は lint 結果へ影響させない。
    }
  }
}

export function loadPlanEntryRoutingDocsFromDb(
  repoRoot: string = process.cwd(),
  target?: string,
): PlanEntryRoutingDoc[] {
  return loadPlanEntryRoutingDocs(repoRoot, target, (entrySignals) =>
    resolvePlanEntrySignalsFromDb(repoRoot, entrySignals),
  );
}
