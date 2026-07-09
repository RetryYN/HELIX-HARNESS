import { describe, expect, it } from "vitest";
import { activate, deactivate } from "../src/vscode/extension";
import {
  defaultWorkspaceRepoRoot,
  registerHelixVisualization,
  type VscodeApiLike,
  type VscodeDisposableLike,
  type VscodeTreeDataProviderLike,
  validateVisualizationTreeViewModel,
} from "../src/vscode/extension-adapter";
import {
  HELIX_COPY_POINTER_COMMAND,
  HELIX_HARNESS_VIEW_ID,
  HELIX_PROJECT_VIEW_ID,
  HELIX_REFRESH_VISUALIZATION_COMMAND,
  helixVscodeContributionManifest,
  helixVscodePackageManifest,
} from "../src/vscode/extension-manifest";
import type { TreeViewNode, VisualizationTreeViewModel } from "../src/vscode/tree-view-provider";

function disposable(): VscodeDisposableLike {
  return { dispose() {} };
}

function root(id: "project" | "harness", label: string, childLabel: string): TreeViewNode {
  return {
    id,
    label,
    description: "source-clock",
    contextValue: `root.${id}`,
    collapsibleState: "expanded",
    children: [
      {
        id: `${id}/child`,
        label: childLabel,
        description: "ready",
        tooltip: "tooltip",
        contextValue: "child",
        collapsibleState: "none",
        command:
          id === "project"
            ? {
                title: "Copy pointer",
                command: "helix.copyPointer",
                arguments: ["helix progress tree-view --json"],
              }
            : undefined,
        children: [],
      },
    ],
  };
}

function tree(projectChildLabel = "Current location"): VisualizationTreeViewModel {
  return {
    schema_version: "visualization-tree-view.v1",
    source_clock: "2026-07-08T00:00:00.000Z",
    roots: [root("project", "Project", projectChildLabel), root("harness", "HARNESS", "Growth")],
    warnings: [],
  };
}

function fakeVscode() {
  const treeViews: Array<{
    id: string;
    provider: VscodeTreeDataProviderLike<TreeViewNode>;
  }> = [];
  const commands = new Map<string, (...args: unknown[]) => unknown>();
  const clipboardWrites: string[] = [];
  const fired: unknown[] = [];
  const vscode: VscodeApiLike = {
    TreeItemCollapsibleState: { None: 0, Collapsed: 1, Expanded: 2 },
    EventEmitter: class {
      event = "event";
      fire(value?: unknown) {
        fired.push(value);
      }
      dispose() {}
    },
    window: {
      createTreeView(viewId, options) {
        treeViews.push({
          id: viewId,
          provider: options.treeDataProvider as unknown as VscodeTreeDataProviderLike<TreeViewNode>,
        });
        return disposable();
      },
    },
    commands: {
      registerCommand(command, callback) {
        commands.set(command, callback);
        return disposable();
      },
    },
    env: {
      clipboard: {
        writeText(value: string) {
          clipboardWrites.push(value);
        },
      },
    },
  };
  return { vscode, treeViews, commands, clipboardWrites, fired };
}

describe("VSCode extension adapter", () => {
  it("U-VEXT-001: registers Project/HARNESS tree views from the dynamic tree payload", async () => {
    const fake = fakeVscode();
    const context = { extensionPath: "/repo/ext", subscriptions: [] };

    const registered = await registerHelixVisualization(context, fake.vscode, {
      loadTree: () => tree(),
    });

    expect(fake.treeViews.map((view) => view.id)).toEqual([
      HELIX_PROJECT_VIEW_ID,
      HELIX_HARNESS_VIEW_ID,
    ]);
    expect(context.subscriptions).toHaveLength(4);

    const projectChildren = registered.projectProvider.getChildren();
    expect(projectChildren.map((child) => child.label)).toEqual(["Current location"]);
    expect(
      registered.projectProvider.getTreeItem(projectChildren[0] as TreeViewNode),
    ).toMatchObject({
      id: "project/child",
      label: "Current location",
      collapsibleState: 0,
      command: {
        title: "Copy pointer",
        command: "helix.copyPointer",
        arguments: ["helix progress tree-view --json"],
      },
    });

    const harnessChildren = registered.harnessProvider.getChildren();
    expect(harnessChildren.map((child) => child.label)).toEqual(["Growth"]);
  });

  it("U-VEXT-002: refreshes providers and keeps commands read-only", async () => {
    const fake = fakeVscode();
    let loadCount = 0;
    await registerHelixVisualization(
      { extensionPath: "/repo/ext", subscriptions: [] },
      fake.vscode,
      {
        loadTree: () => {
          loadCount += 1;
          return loadCount === 1 ? tree("Before") : tree("After");
        },
      },
    );

    const refresh = fake.commands.get(HELIX_REFRESH_VISUALIZATION_COMMAND);
    expect(refresh).toBeDefined();
    await refresh?.();
    expect(fake.fired).toEqual([undefined, undefined]);
    const refreshedChildren = await Promise.resolve(fake.treeViews[0]?.provider.getChildren());
    expect(refreshedChildren?.map((child: TreeViewNode) => child.label)).toEqual(["After"]);

    const copyPointer = fake.commands.get(HELIX_COPY_POINTER_COMMAND);
    copyPointer?.("helix progress tree-view --json");
    copyPointer?.("");
    copyPointer?.({ bad: "value" });
    expect(fake.clipboardWrites).toEqual(["helix progress tree-view --json"]);
  });

  it("U-VEXT-003: rejects malformed or mixed-root dynamic tree payloads before rendering", async () => {
    expect(() =>
      validateVisualizationTreeViewModel({
        ...tree(),
        schema_version: "bad",
      }),
    ).toThrow(/schema mismatch/);
    expect(() =>
      validateVisualizationTreeViewModel({
        ...tree(),
        roots: [root("harness", "HARNESS", "Growth"), root("project", "Project", "Current")],
      }),
    ).toThrow(/project,harness/);
    expect(() =>
      validateVisualizationTreeViewModel({
        ...tree(),
        roots: [
          {
            ...root("project", "Project", "Current"),
            children: [root("harness", "HARNESS", "leak")],
          },
          root("harness", "HARNESS", "Growth"),
        ],
      }),
    ).toThrow(/leaks harness node/);
    expect(() =>
      validateVisualizationTreeViewModel({
        ...tree(),
        roots: [
          {
            ...root("project", "Project", "Current"),
            children: [
              {
                ...root("project", "Project", "Current").children[0],
                command: {
                  title: "Run",
                  command: "workbench.action.tasks.runTask",
                  arguments: ["mutate"],
                },
              },
            ],
          },
          root("harness", "HARNESS", "Growth"),
        ],
      }),
    ).toThrow(/non read-only command/);

    const fake = fakeVscode();
    let loadCount = 0;
    await registerHelixVisualization(
      { extensionPath: "/repo/ext", subscriptions: [] },
      fake.vscode,
      {
        loadTree: () => {
          loadCount += 1;
          if (loadCount === 1) return tree("Before");
          return {
            ...tree("After"),
            roots: [root("harness", "HARNESS", "bad"), root("project", "Project", "bad")],
          };
        },
      },
    );

    const refresh = fake.commands.get(HELIX_REFRESH_VISUALIZATION_COMMAND);
    await expect(Promise.resolve(refresh?.())).rejects.toThrow(/project,harness/);
    const children = await Promise.resolve(fake.treeViews[0]?.provider.getChildren());
    expect(children?.map((child: TreeViewNode) => child.label)).toEqual(["Before"]);
  });

  it("U-VEXT-004: keeps VSCode contribution manifest aligned with registered views and commands", () => {
    const manifest = helixVscodeContributionManifest();

    expect(manifest.activationEvents).toEqual([
      `onView:${HELIX_PROJECT_VIEW_ID}`,
      `onView:${HELIX_HARNESS_VIEW_ID}`,
    ]);
    expect(manifest.contributes.views.helix.map((view) => view.id)).toEqual([
      HELIX_PROJECT_VIEW_ID,
      HELIX_HARNESS_VIEW_ID,
    ]);
    expect(manifest.contributes.commands.map((command) => command.command)).toEqual([
      HELIX_REFRESH_VISUALIZATION_COMMAND,
      HELIX_COPY_POINTER_COMMAND,
    ]);
    expect(manifest.readOnlyCommands).toEqual([
      HELIX_REFRESH_VISUALIZATION_COMMAND,
      HELIX_COPY_POINTER_COMMAND,
    ]);
  });

  it("U-VEXT-005: resolves the VSCode workspace folder as the CLI repo root", () => {
    const fake = fakeVscode();
    fake.vscode.workspace = {
      workspaceFolders: [{ uri: { fsPath: "/repo/project" } }],
    };

    expect(
      defaultWorkspaceRepoRoot(fake.vscode, { extensionPath: "/ext/helix", subscriptions: [] }),
    ).toBe("/repo/project");
    fake.vscode.workspace = undefined;
    expect(
      defaultWorkspaceRepoRoot(fake.vscode, { extensionPath: "/ext/helix", subscriptions: [] }),
    ).toBe("/ext");
  });

  it("U-VEXT-006: exposes an injectable VSCode activate/deactivate entrypoint", async () => {
    const fake = fakeVscode();
    const result = await activate({ extensionPath: "/repo/ext", subscriptions: [] }, fake.vscode, {
      loadTree: () => tree(),
    });

    expect(result.projectProvider.getChildren().map((child) => child.label)).toEqual([
      "Current location",
    ]);
    expect(fake.treeViews.map((view) => view.id)).toEqual([
      HELIX_PROJECT_VIEW_ID,
      HELIX_HARNESS_VIEW_ID,
    ]);
    deactivate();
  });

  it("U-VEXT-007: emits a package manifest for VSCode packaging without mutating package.json", () => {
    const manifest = helixVscodePackageManifest({
      version: "0.1.0-test",
      publisher: "RetryYN",
      main: "./dist/vscode/extension.js",
    });

    expect(manifest).toMatchObject({
      name: "helix-visualization",
      displayName: "HELIX Visualization",
      publisher: "RetryYN",
      version: "0.1.0-test",
      main: "./dist/vscode/extension.js",
      extensionKind: ["workspace"],
      categories: ["Other"],
    });
    expect(manifest.activationEvents).toEqual([
      `onView:${HELIX_PROJECT_VIEW_ID}`,
      `onView:${HELIX_HARNESS_VIEW_ID}`,
    ]);
    expect(manifest.contributes.commands.map((command) => command.command)).toEqual([
      HELIX_REFRESH_VISUALIZATION_COMMAND,
      HELIX_COPY_POINTER_COMMAND,
    ]);
  });
});
