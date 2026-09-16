export type ScreenCategory = "PM" | "HM" | "GD";
export type StatusLevel = "ok" | "warn" | "error" | "empty" | "loading";

export interface StatusToken {
  fg: string;
  bg: string;
  icon: string;
}

export interface UiTokens {
  version: number;
  mode: "light";
  color: {
    status: Record<StatusLevel, StatusToken>;
    fg: { default: string; muted: string; onAccent: string };
    canvas: { default: string; subtle: string; inset: string };
    border: { default: string; muted: string };
    accent: { fg: string; emphasis: string; subtle: string };
    danger: { emphasis: string };
  };
  size: {
    layout: { minWidth: number; gutter: number; contentMaxWidth: string };
    table: { rowHeight: number; cellPadX: number; cellPadY: number };
    control: { height: number; minTarget: number };
    radius: { sm: number; md: number };
  };
  type: {
    font: { body: string; mono: string };
    fontSize: { body: number; small: number; h1: number; h2: number; code: number };
    lineHeight: { body: number; dense: number };
    weight: { regular: number; medium: number; bold: number };
  };
  focus: { ringColor: string; ringWidth: number; ringOffset: number; ringStyle: string };
  motion: { pollIntervalSec: number; spinnerDurationMs: number; reducedMotion: string };
}

export interface UiComponentSpec {
  name: string;
  source: "L2-common" | "L2-screen-specific" | "L4-alias";
  readOnly: boolean;
  states: StatusLevel[];
}

export interface ScreenSpec {
  id: string;
  name: string;
  category: ScreenCategory;
  url: string;
  l1Reference: string;
  specificComponents: string[];
  commonComponents: string[];
  mission: string;
  primaryStatus: StatusLevel;
}

export interface RenderedScreen {
  screen: ScreenSpec;
  html: string;
}
