import { vi } from "vitest";

export const mockModel = {
  dispose: vi.fn(),
  getValue: vi.fn().mockReturnValue("file contents here"),
  setValue: vi.fn()
};

export const editor = {
  create: vi.fn().mockReturnValue({
    dispose: vi.fn(),
    setModel: vi.fn(),
    onDidChangeModelContent: vi.fn().mockReturnValue({ dispose: vi.fn() }),
    onDidBlurEditorText: vi.fn().mockReturnValue({ dispose: vi.fn() }),
    focus: vi.fn()
  }),
  createModel: vi.fn().mockReturnValue(mockModel),
  getModel: vi.fn().mockReturnValue(null)
};

export const Uri = {
  parse: vi.fn().mockImplementation((val: { toString(): string }) => ({
    toString: () => val.toString()
  }))
};
