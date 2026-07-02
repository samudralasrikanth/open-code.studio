/* eslint-disable */
import { describe, it, expect, beforeEach } from "vitest";

import { EditorNavigationService } from "../src/application/EditorNavigationService.js";
import { EditorGroup } from "../src/domain/EditorGroup.js";
import { EditorInput } from "../src/domain/EditorInput.js";
import { WorkbenchLayout } from "../src/domain/WorkbenchLayout.js";

// Dummy Input for testing
class DummyInput extends EditorInput {
  constructor(private readonly _id: string) {
    super();
  }
  public override get typeId(): string {
    return "dummy";
  }
  public override get name(): string {
    return `Dummy ${this._id}`;
  }
  public override get description(): string | undefined {
    return undefined;
  }
  public override async resolve(): Promise<void> {
    // no-op
  }
  public override matches(other: EditorInput): boolean {
    return other instanceof DummyInput && other._id === this._id;
  }
}

describe("Editor Platform Integration", () => {
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
  });

  it("WorkbenchLayout handles multiple groups", () => {
    const layout = new WorkbenchLayout();
    expect(layout.groups.length).toBe(1); // default 'main'
    expect(layout.activeGroup).toBe(layout.groups[0]);

    const group2 = new EditorGroup("side");
    layout.addGroup(group2);
    expect(layout.groups.length).toBe(2);
    expect(layout.activeGroup).toBe(group2);

    layout.removeGroup(group2);
    expect(layout.groups.length).toBe(1);
    expect(layout.activeGroup).toBe(layout.groups[0]);
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
