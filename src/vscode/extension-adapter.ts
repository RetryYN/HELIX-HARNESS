import { execFile } from "node:child_process";
import { join } from "node:path";
import {
  HELIX_COPY_POINTER_COMMAND,
  HELIX_HARNESS_VIEW_ID,
  HELIX_PROJECT_VIEW_ID,
  HELIX_REFRESH_VISUALIZATION_COMMAND,
} from "./extension-manifest";
import type { TreeNodeState, TreeViewNode, VisualizationTreeViewModel } from "./tree-view-provider";

export interface VscodeDisposableLike {
  dispose(): void;
}

export interface VscodeTreeItemLike {
  id?: string;
  label: string;
  description?: string;
  tooltip?: string;
  contextValue?: string;
  collapsibleState?: number;
  command?: {
    title: string;
    command: string;
    arguments?: unknown[];
  };
}

export interface VscodeTreeDataProviderLike<T> {
  getTreeItem(element: T): VscodeTreeItemLike;
  getChildren(element?: T): T[] | Promise<T[]>;
}

export interface VscodeTreeViewLike<T> extends VscodeDisposableLike {
  title?: string;
  reveal?(element: T): Promise<void>;
}

export interface VscodeEventEmitterLike<T> extends VscodeDisposableLike {
  event: unknown;
  fire(value?: T): void;
}

export interface VscodeApiLike {
  TreeItemCollapsibleState: {
    None: number;
    Collapsed: number;
    Expanded: number;
  };
  EventEmitter: new <T>() => VscodeEventEmitterLike<T>;
  window: {
    createTreeView<T>(
      viewId: string,
      options: { treeDataProvider: VscodeTreeDataProviderLike<T> },
    ): VscodeTreeViewLike<T>;
  };
  commands: {
    registerCommand(
      command: string,
      callback: (...args: unknown[]) => unknown,
    ): VscodeDisposableLike;
  };
  env: {
    clipboard: {
      writeText(value: string): PromiseLike<void> | Promise<void> | void;
    };
  };
  workspace?: {
    workspaceFolders?: Array<{
      uri: {
        fsPath: string;
      };
    }>;
  };
}

export interface VscodeExtensionContextLike {
  extensionPath: string;
  subscriptions: VscodeDisposableLike[];
}

export interface HelixVisualizationExtensionDeps {
  loadTree: () => Promise<VisualizationTreeViewModel> | VisualizationTreeViewModel;
}

export interface RegisteredHelixVisualization {
  projectProvider: HelixTreeDataProvider;
  harnessProvider: HelixTreeDataProvider;
  refresh(): Promise<void>;
}

function isTreeNode(value: unknown): value is TreeViewNode {
  if (!value || typeof value !== "object") return false;
  const node = value as Partial<TreeViewNode>;
  return (
    typeof node.id === "string" &&
    typeof node.label === "string" &&
    typeof node.contextValue === "string" &&
    (node.collapsibleState === "none" ||
      node.collapsibleState === "collapsed" ||
      node.collapsibleState === "expanded") &&
    Array.isArray(node.children)
  );
}

function validateTreeNode(rootId: "project" | "harness", value: unknown): TreeViewNode {
  if (!isTreeNode(value)) {
    throw new Error("HELIX visualization tree contains an invalid node");
  }
  if (rootId === "project" && value.id.startsWith("harness/")) {
    throw new Error(`HELIX visualization tree leaks harness node into Project root: ${value.id}`);
  }
  if (rootId === "harness" && value.id.startsWith("project/")) {
    throw new Error(`HELIX visualization tree leaks project node into HARNESS root: ${value.id}`);
  }
  if (value.command) {
    if (
      value.command.command !== HELIX_COPY_POINTER_COMMAND ||
      !Array.isArray(value.command.arguments) ||
      value.command.arguments.length !== 1 ||
      typeof value.command.arguments[0] !== "string" ||
      value.command.arguments[0].length === 0
    ) {
      throw new Error(`HELIX visualization tree contains a non read-only command: ${value.id}`);
    }
  }
  for (const child of value.children) validateTreeNode(rootId, child);
  return value;
}

export function validateVisualizationTreeViewModel(value: unknown): VisualizationTreeViewModel {
  if (!value || typeof value !== "object") {
    throw new Error("HELIX visualization tree payload is not an object");
  }
  const tree = value as Partial<VisualizationTreeViewModel>;
  if (tree.schema_version !== "visualization-tree-view.v1") {
    throw new Error(`HELIX visualization tree schema mismatch: ${String(tree.schema_version)}`);
  }
  if (!Array.isArray(tree.roots) || tree.roots.length !== 2) {
    throw new Error("HELIX visualization tree must contain Project and HARNESS roots");
  }
  if (tree.roots[0]?.id !== "project" || tree.roots[1]?.id !== "harness") {
    throw new Error("HELIX visualization tree roots must be ordered as project,harness");
  }
  if (!Array.isArray(tree.warnings)) {
    throw new Error("HELIX visualization tree warnings must be an array");
  }
  return {
    schema_version: tree.schema_version,
    source_clock: typeof tree.source_clock === "string" ? tree.source_clock : null,
    roots: [validateTreeNode("project", tree.roots[0]), validateTreeNode("harness", tree.roots[1])],
    warnings: tree.warnings.filter((warning): warning is string => typeof warning === "string"),
  };
}

function collapsibleState(vscode: VscodeApiLike, state: TreeNodeState): number {
  switch (state) {
    case "expanded":
      return vscode.TreeItemCollapsibleState.Expanded;
    case "collapsed":
      return vscode.TreeItemCollapsibleState.Collapsed;
    case "none":
      return vscode.TreeItemCollapsibleState.None;
  }
}

export class HelixTreeDataProvider implements VscodeTreeDataProviderLike<TreeViewNode> {
  private readonly changeEmitter: VscodeEventEmitterLike<TreeViewNode | undefined>;

  constructor(
    private readonly vscode: VscodeApiLike,
    private root: TreeViewNode,
  ) {
    this.changeEmitter = new vscode.EventEmitter<TreeViewNode | undefined>();
  }

  get onDidChangeTreeData(): unknown {
    return this.changeEmitter.event;
  }

  replaceRoot(root: TreeViewNode): void {
    this.root = root;
    this.changeEmitter.fire(undefined);
  }

  getTreeItem(element: TreeViewNode): VscodeTreeItemLike {
    return {
      id: element.id,
      label: element.label,
      description: element.description,
      tooltip: element.tooltip,
      contextValue: element.contextValue,
      collapsibleState: collapsibleState(this.vscode, element.collapsibleState),
      command: element.command
        ? {
            title: element.command.title,
            command: element.command.command,
            arguments: element.command.arguments,
          }
        : undefined,
    };
  }

  getChildren(element?: TreeViewNode): TreeViewNode[] {
    return element ? element.children : this.root.children;
  }
}

function rootById(tree: VisualizationTreeViewModel, id: "project" | "harness"): TreeViewNode {
  const root = tree.roots.find((candidate) => candidate.id === id);
  if (!root) throw new Error(`HELIX visualization tree is missing ${id} root`);
  return root;
}

export async function registerHelixVisualization(
  context: VscodeExtensionContextLike,
  vscode: VscodeApiLike,
  deps: HelixVisualizationExtensionDeps,
): Promise<RegisteredHelixVisualization> {
  const initialTree = validateVisualizationTreeViewModel(await deps.loadTree());
  const projectProvider = new HelixTreeDataProvider(vscode, rootById(initialTree, "project"));
  const harnessProvider = new HelixTreeDataProvider(vscode, rootById(initialTree, "harness"));

  const projectView = vscode.window.createTreeView(HELIX_PROJECT_VIEW_ID, {
    treeDataProvider: projectProvider,
  });
  const harnessView = vscode.window.createTreeView(HELIX_HARNESS_VIEW_ID, {
    treeDataProvider: harnessProvider,
  });

  const refresh = async () => {
    const nextTree = validateVisualizationTreeViewModel(await deps.loadTree());
    projectProvider.replaceRoot(rootById(nextTree, "project"));
    harnessProvider.replaceRoot(rootById(nextTree, "harness"));
  };

  const refreshCommand = vscode.commands.registerCommand(
    HELIX_REFRESH_VISUALIZATION_COMMAND,
    refresh,
  );
  const copyCommand = vscode.commands.registerCommand(HELIX_COPY_POINTER_COMMAND, (pointer) => {
    if (typeof pointer === "string" && pointer.length > 0) {
      return vscode.env.clipboard.writeText(pointer);
    }
    return undefined;
  });

  context.subscriptions.push(projectView, harnessView, refreshCommand, copyCommand);
  return { projectProvider, harnessProvider, refresh };
}

export function loadTreeViewFromHelixCli(input: {
  repoRoot: string;
  helixCommand?: string;
}): Promise<VisualizationTreeViewModel> {
  const helixCommand = input.helixCommand ?? "helix";
  return new Promise((resolve, reject) => {
    execFile(
      helixCommand,
      ["progress", "tree-view", "--json"],
      { cwd: input.repoRoot, env: process.env },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`helix progress tree-view failed: ${stderr || error.message}`));
          return;
        }
        try {
          resolve(validateVisualizationTreeViewModel(JSON.parse(stdout)));
        } catch (parseError) {
          reject(
            new Error(`helix progress tree-view returned invalid JSON: ${String(parseError)}`),
          );
        }
      },
    );
  });
}

export function defaultWorkspaceRepoRoot(
  vscode: VscodeApiLike,
  context: VscodeExtensionContextLike,
): string {
  return vscode.workspace?.workspaceFolders?.[0]?.uri.fsPath ?? join(context.extensionPath, "..");
}

export function activateHelixVisualizationExtension(
  context: VscodeExtensionContextLike,
  vscode: VscodeApiLike,
  input: { repoRoot?: string; helixCommand?: string } = {},
): Promise<RegisteredHelixVisualization> {
  const repoRoot = input.repoRoot ?? defaultWorkspaceRepoRoot(vscode, context);
  return registerHelixVisualization(context, vscode, {
    loadTree: () => loadTreeViewFromHelixCli({ repoRoot, helixCommand: input.helixCommand }),
  });
}
