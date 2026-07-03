/* eslint-disable */
import { describe, it, expect, beforeEach } from "vitest";

import { EditorService } from "../src/application/EditorService.js";
import { EditorNavigationService } from "../src/application/EditorNavigationService.js";
import { EditorGroup } from "../src/domain/EditorGroup.js";
import { EditorInput } from "../src/domain/EditorInput.js";
import { WorkbenchLayout } from "../src/domain/WorkbenchLayout.js";
import type { EditorLayout } from "../src/domain/EditorLayout.js";

// Dummy Input for testing
class DummyInput extends EditorInput {
  constructor(
    private readonly _id: string,
    private _dirty: boolean = false
  ) {
    super();
  }
  public override get id(): string {
    return this._id;
  }
  public override get typeId(): string {
    return "dummy";
  }
  public override getName(): string {
    return `Dummy ${this._id}`;
  }
  public override getTooltip(): string | undefined {
    return undefined;
  }
  public override get uri(): any {
    return undefined;
  }
  public override isDirty(): boolean {
    return this._dirty;
  }
  public override isReadonly(): boolean {
    return false;
  }
  public override matches(other: EditorInput): boolean {
    return other instanceof DummyInput && other._id === this._id;
  }
}

describe("Editor Platform Integration (EPIC-0006 Milestone 2)", () => {
  it("EditorGroup handles opening and pinning inputs", () => {
    const group = new EditorGroup("test-group");
    const input1 = new DummyInput("1");
    const input2 = new DummyInput("2");

    group.openInput(input1, { preview: true, active: true });
    expect(group.inputs.length).toBe(1);
    expect(group.previewInput).toBe(input1);
    expect(group.activeInput).toBe(input1);

    // Opening another preview replaces the first
    group.openInput(input2, { preview: true, active: true });
    expect(group.inputs.length).toBe(1);
    expect(group.previewInput).toBe(input2);
    expect(group.inputs[0]).toBe(input2);

    // Opening as not-preview pins it
    group.openInput(input1, { preview: false, active: true });
    expect(group.inputs.length).toBe(2);
    expect(group.previewInput).toBe(input2);
    expect(group.activeInput).toBe(input1);

    // Check EditorInputState
    const state1 = group.getInputState(input1);
    expect(state1).toEqual({
      active: true,
      preview: false,
      pinned: true,
      dirty: false
    });
  });

  it("WorkbenchLayout handles SplitNode recursive tree layouts", () => {
    const layout = new WorkbenchLayout();
    expect(layout.groups.length).toBe(1); // default 'main'
    expect(layout.layout.root).toEqual({ type: "group", groupId: "main" });

    // Split group
    const newGroup = layout.splitGroup(layout.groups[0], "horizontal", "side-1");
    expect(layout.groups.length).toBe(2);
    expect(layout.layout.root).toEqual({
      type: "split",
      orientation: "horizontal",
      left: { type: "group", groupId: "main" },
      right: { type: "group", groupId: "side-1" }
    });
    expect(layout.activeGroup).toBe(newGroup);

    // Remove group side-1 -> promotes 'main' back to root
    layout.removeGroup(newGroup);
    expect(layout.groups.length).toBe(1);
    expect(layout.layout.root).toEqual({ type: "group", groupId: "main" });
  });

  it("EditorService handles restoreState and input resolution", async () => {
    const service = new EditorService();
    const mockInputResolver = async (id: string) => new DummyInput(id);

    const savedState = {
      layout: {
        root: {
          type: "split",
          orientation: "horizontal" as const,
          left: { type: "group", groupId: "g1" },
          right: { type: "group", groupId: "g2" }
        }
      },
      groups: [
        { id: "g1", inputs: ["1", "2"], activeInput: "2", previewInput: "2" },
        { id: "g2", inputs: ["3"], activeInput: "3" }
      ],
      activeGroup: "g2"
    };

    await service.restoreState(savedState, mockInputResolver);

    expect(service.groups.length).toBe(2);
    expect(service.activeGroup?.id).toBe("g2");
    expect(service.editorLayout.root).toEqual(savedState.layout.root);

    const group1 = service.groups.find((g) => g.id === "g1")!;
    expect(group1.inputs.length).toBe(2);
    expect(group1.activeInput?.id).toBe("2");
    expect(group1.previewInput?.id).toBe("2");
  });

  it("EditorNavigationService handles history", () => {
    const nav = new EditorNavigationService();
    const input1 = new DummyInput("1");
    const input2 = new DummyInput("2");

    nav.logNavigation(input1);
    nav.logNavigation(input2);

    expect(nav.canGoBack).toBe(true);
    expect(nav.goBack()).toBe(input1);

    expect(nav.canGoForward).toBe(true);
    expect(nav.goForward()).toBe(input2);
  });
});
