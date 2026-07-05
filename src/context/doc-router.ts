import { classifyTask, type TaskKind } from "../task/classify";

export interface CanonicalDocInput {
  path: string;
  text: string;
}

export interface DocSection {
  doc_path: string;
  heading: string;
  level: number;
  anchor: string;
  text: string;
}

export interface DocIndex {
  docs: CanonicalDocInput[];
  sections: DocSection[];
}

export interface RoutedDocContext {
  task_kind: TaskKind;
  sections: DocSection[];
  fail_open: boolean;
  reason: string;
}

const KIND_TERMS: Record<TaskKind, string[]> = {
  design: ["設計", "要件", "requirements", "design", "trace", "pair-freeze"],
  "add-feature": ["実装", "追加", "feature", "implementation", "workflow", "acceptance"],
  refactor: ["refactor", "リファクタ", "module", "boundary", "drift"],
  troubleshoot: ["debug", "error", "doctor", "recovery", "troubleshoot", "障害", "検証"],
  poc: ["poc", "spike", "discovery", "s4", "検証", "判断"],
  reverse: ["reverse", "backfill", "as-is", "audit", "逆流", "突合"],
  unknown: [],
};

function slugifyHeading(heading: string): string {
  const slug = heading
    .trim()
    .toLowerCase()
    .replace(/[`*_()[\]{}]/g, "")
    .replace(/[^a-z0-9\u3040-\u30ff\u3400-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "section";
}

function wholeDocSection(doc: CanonicalDocInput): DocSection {
  return {
    doc_path: doc.path,
    heading: doc.path,
    level: 0,
    anchor: "document",
    text: doc.text,
  };
}
export function buildDocIndex(docs: readonly CanonicalDocInput[]): DocIndex {
  const sections: DocSection[] = [];
  for (const doc of docs) {
    const matches = [...doc.text.matchAll(/^(#{1,6})\s+(.+)$/gm)];
    if (matches.length === 0) {
      sections.push(wholeDocSection(doc));
      continue;
    }
    for (let index = 0; index < matches.length; index += 1) {
      const match = matches[index];
      const next = matches[index + 1];
      const start = match.index ?? 0;
      const end = next?.index ?? doc.text.length;
      const heading = match[2].trim();
      sections.push({
        doc_path: doc.path,
        heading,
        level: match[1].length,
        anchor: slugifyHeading(heading),
        text: doc.text.slice(start, end).trim(),
      });
    }
  }
  return { docs: [...docs], sections };
}

function sectionMatches(section: DocSection, terms: readonly string[]): boolean {
  const haystack = `${section.heading}\n${section.text}`.toLowerCase();
  return terms.some((term) => haystack.includes(term.toLowerCase()));
}

export function routeDocContext(input: {
  taskText: string;
  docs: readonly CanonicalDocInput[];
  maxSections?: number;
}): RoutedDocContext {
  const task = classifyTask({ text: input.taskText });
  const index = buildDocIndex(input.docs);
  const terms = KIND_TERMS[task.kind];
  if (terms.length === 0 || index.sections.length === 0) {
    return {
      task_kind: task.kind,
      sections: index.docs.map(wholeDocSection),
      fail_open: true,
      reason: terms.length === 0 ? "unknown-task-kind" : "empty-doc-index",
    };
  }

  const maxSections = Math.max(1, input.maxSections ?? 6);
  const selected = index.sections
    .filter((section) => sectionMatches(section, terms))
    .slice(0, maxSections);
  if (selected.length === 0) {
    return {
      task_kind: task.kind,
      sections: index.docs.map(wholeDocSection),
      fail_open: true,
      reason: "no-matching-section",
    };
  }
  return {
    task_kind: task.kind,
    sections: selected,
    fail_open: false,
    reason: "matched-task-kind",
  };
}
