import { HELIX_COPY_POINTER_COMMAND } from "../schema/visualization-tree-contract";

export { HELIX_COPY_POINTER_COMMAND } from "../schema/visualization-tree-contract";

export const HELIX_PROJECT_VIEW_ID = "helix.projectView";
export const HELIX_HARNESS_VIEW_ID = "helix.harnessView";
export const HELIX_REFRESH_VISUALIZATION_COMMAND = "helix.refreshVisualization";

export interface VscodeViewContribution {
  id: string;
  name: string;
  when?: string;
}

export interface VscodeCommandContribution {
  command: string;
  title: string;
  category: string;
}

export interface HelixVscodeContributionManifest {
  activationEvents: string[];
  contributes: {
    viewsContainers: {
      activitybar: Array<{
        id: string;
        title: string;
        icon: string;
      }>;
    };
    views: Record<string, VscodeViewContribution[]>;
    commands: VscodeCommandContribution[];
  };
  readOnlyCommands: string[];
}

export interface HelixVscodePackageManifest extends HelixVscodeContributionManifest {
  name: string;
  displayName: string;
  publisher: string;
  version: string;
  engines: {
    vscode: string;
  };
  main: string;
  extensionKind: ["workspace"];
  categories: ["Other"];
}

export function helixVscodeContributionManifest(): HelixVscodeContributionManifest {
  return {
    activationEvents: [`onView:${HELIX_PROJECT_VIEW_ID}`, `onView:${HELIX_HARNESS_VIEW_ID}`],
    contributes: {
      viewsContainers: {
        activitybar: [
          {
            id: "helix",
            title: "HELIX",
            icon: "$(graph)",
          },
        ],
      },
      views: {
        helix: [
          {
            id: HELIX_PROJECT_VIEW_ID,
            name: "Project",
          },
          {
            id: HELIX_HARNESS_VIEW_ID,
            name: "HARNESS",
          },
        ],
      },
      commands: [
        {
          command: HELIX_REFRESH_VISUALIZATION_COMMAND,
          title: "Refresh Visualization",
          category: "HELIX",
        },
        {
          command: HELIX_COPY_POINTER_COMMAND,
          title: "Copy Pointer",
          category: "HELIX",
        },
      ],
    },
    readOnlyCommands: [HELIX_REFRESH_VISUALIZATION_COMMAND, HELIX_COPY_POINTER_COMMAND],
  };
}

export function helixVscodePackageManifest(
  input: { version?: string; publisher?: string; main?: string } = {},
): HelixVscodePackageManifest {
  return {
    name: "helix-visualization",
    displayName: "HELIX Visualization",
    publisher: input.publisher ?? "helix",
    version: input.version ?? "0.1.0",
    engines: {
      vscode: "^1.90.0",
    },
    main: input.main ?? "./dist/vscode/extension.js",
    extensionKind: ["workspace"],
    categories: ["Other"],
    ...helixVscodeContributionManifest(),
  };
}
