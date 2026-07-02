import { describe, expect, it } from "vitest";

import {
  uriDisplayName,
  uriEquals,
  uriFromPath,
  uriFromString,
  uriScheme,
  uriToPath
} from "../src/domain/WorkspaceUri.js";

describe("WorkspaceUri", () => {
  describe("uriFromPath", () => {
    it("creates a file:// URI from an absolute Unix path", () => {
      const uri = uriFromPath("/Users/dev/project");
      expect(uri).toBe("file:///Users/dev/project");
    });

    it("creates a file:// URI from a Windows-style absolute path", () => {
      const uri = uriFromPath("C:/Users/dev/project");
      expect(uri).toBe("file://C:/Users/dev/project");
    });

    it("normalises backslashes to forward slashes", () => {
      const uri = uriFromPath("C:\\Users\\dev\\project");
      expect(uri).toBe("file://C:/Users/dev/project");
    });

    it("throws for relative paths", () => {
      expect(() => uriFromPath("relative/path")).toThrow("WorkspaceUri requires an absolute path");
    });
  });

  describe("uriFromString", () => {
    it("accepts known schemes", () => {
      expect(() => uriFromString("file:///path")).not.toThrow();
      expect(() => uriFromString("ssh://host/path")).not.toThrow();
      expect(() => uriFromString("container://name/path")).not.toThrow();
    });

    it("rejects unknown schemes", () => {
      expect(() => uriFromString("ftp://host/path")).toThrow("Unsupported WorkspaceUri scheme");
      expect(() => uriFromString("raw-path")).toThrow("Unsupported WorkspaceUri scheme");
    });
  });

  describe("uriScheme", () => {
    it("returns the scheme of a file URI", () => {
      expect(uriScheme(uriFromPath("/home/dev"))).toBe("file");
    });

    it("returns the scheme of an ssh URI", () => {
      expect(uriScheme(uriFromString("ssh://host/path"))).toBe("ssh");
    });
  });

  describe("uriToPath", () => {
    it("converts a file URI back to a path", () => {
      expect(uriToPath(uriFromPath("/home/dev/project"))).toBe("/home/dev/project");
    });

    it("throws for non-file URIs", () => {
      expect(() => uriToPath(uriFromString("ssh://host/path"))).toThrow(
        "Cannot convert non-file URI"
      );
    });
  });

  describe("uriDisplayName", () => {
    it("returns the last path segment", () => {
      expect(uriDisplayName(uriFromPath("/home/dev/my-project"))).toBe("my-project");
    });

    it("handles trailing slashes", () => {
      expect(uriDisplayName(uriFromPath("/home/dev/project"))).toBe("project");
    });
  });

  describe("uriEquals", () => {
    it("returns true for identical URIs", () => {
      const a = uriFromPath("/home/dev/project");
      const b = uriFromPath("/home/dev/project");
      expect(uriEquals(a, b)).toBe(true);
    });

    it("returns false for different URIs", () => {
      const a = uriFromPath("/home/dev/project-a");
      const b = uriFromPath("/home/dev/project-b");
      expect(uriEquals(a, b)).toBe(false);
    });
  });
});
