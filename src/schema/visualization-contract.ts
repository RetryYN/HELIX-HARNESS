/**
 * Adapter-neutral DTO primitives for visualization projections.
 * Builders and adapters may extend these values but must not add I/O ownership here.
 */
export type DrilldownKind = "cli" | "table" | "docs";

export interface Drilldown {
  kind: DrilldownKind;
  pointer: string;
}

export interface MetricRow {
  label: string;
  value: number;
  drilldown: Drilldown | null;
}

export interface GraphIrNode {
  id: string;
  label: string;
  group: string;
}

export interface GraphIrEdgeInput {
  from: string;
  to: string;
  kind: string;
}

export interface GraphIrEdge {
  from: string;
  to: string;
  kind: string;
}

export interface GraphIr {
  nodes: GraphIrNode[];
  edges: GraphIrEdge[];
}
