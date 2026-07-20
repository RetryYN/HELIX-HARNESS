#!/usr/bin/env -S npx --no-install tsx
import {
  classifyFinalRecognitionDisposition,
  scanL12HybridRecognitionCandidates,
} from "../src/lint/l12-hybrid-recognition";

const valueAfter = (flag: string): string | undefined => {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
};

const disposition = valueAfter("--disposition");
const reviewStatus = valueAfter("--status");
const documentStatus = valueAfter("--document-status");
const finalDisposition = valueAfter("--final-disposition");
const candidates = scanL12HybridRecognitionCandidates()
  .map((candidate) => ({
    ...candidate,
    finalDisposition: classifyFinalRecognitionDisposition(candidate),
  }))
  .filter(
    (candidate) =>
    (!disposition || candidate.disposition === disposition) &&
    (!reviewStatus || candidate.reviewStatus === reviewStatus) &&
    (!documentStatus || candidate.documentStatus === documentStatus) &&
    (!finalDisposition || candidate.finalDisposition === finalDisposition),
  );

if (process.argv.includes("--paths")) {
  process.stdout.write(`${candidates.map((candidate) => candidate.path).join("\n")}\n`);
} else if (process.argv.includes("--summary")) {
  const signalHits: Record<string, number> = {};
  const dispositions: Record<string, number> = {};
  const reviewStatuses: Record<string, number> = {};
  const documentStatuses: Record<string, number> = {};
  const auditDispositions: Record<string, number> = {};
  const finalDispositions: Record<string, number> = {};
  for (const candidate of candidates) {
    dispositions[candidate.disposition] = (dispositions[candidate.disposition] ?? 0) + 1;
    reviewStatuses[candidate.reviewStatus] = (reviewStatuses[candidate.reviewStatus] ?? 0) + 1;
    auditDispositions[candidate.auditDisposition] =
      (auditDispositions[candidate.auditDisposition] ?? 0) + 1;
    finalDispositions[candidate.finalDisposition] =
      (finalDispositions[candidate.finalDisposition] ?? 0) + 1;
    if (candidate.documentStatus) {
      documentStatuses[candidate.documentStatus] =
        (documentStatuses[candidate.documentStatus] ?? 0) + 1;
    }
    for (const signal of candidate.signals) {
      signalHits[signal.id] = (signalHits[signal.id] ?? 0) + 1;
    }
  }
  process.stdout.write(
    `${JSON.stringify({ documents: candidates.length, dispositions, reviewStatuses, auditDispositions, finalDispositions, documentStatuses, signalHits }, null, 2)}\n`,
  );
} else {
  process.stdout.write(`${JSON.stringify(candidates, null, 2)}\n`);
}
