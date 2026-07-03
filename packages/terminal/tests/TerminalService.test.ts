/* eslint-disable */
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { TerminalService } from "../src/application/TerminalService.js";
import { TerminalState } from "../src/domain/TerminalState.js";
import { TerminalEventTypes } from "../src/events/TerminalEvents.js";

// Mock Logger
const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
  flow: vi.fn()
} as any;

// Mock EventBus
const mockEvents = {
  publish: vi.fn(() => Promise.resolve({}))
} as any;

describe("TerminalService", () => {
  let service: TerminalService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new TerminalService(mockLogger, mockEvents);
  });

  afterEach(() => {
    service.dispose();
  });

  describe("create()", () => {
    it("should successfully create a terminal session using the mock shell fallback", async () => {
      const session = await service.create({
        cwd: "/home/dev/workspace",
        shell: "mock-shell",
        cols: 80,
        rows: 24
      });

      expect(session).toBeDefined();
      expect(session.id).toBeDefined();
      expect(session.name).toBe("mock-shell");
      expect(session.shell).toBe("mock-shell");
      expect(session.cwd).toBe("/home/dev/workspace");
      expect(session.status).toBe(TerminalState.ACTIVE);
      expect(session.pid).toBeDefined();

      expect(mockEvents.publish).toHaveBeenCalledWith(
        TerminalEventTypes.CREATED,
        expect.objectContaining({
          id: session.id,
          name: "mock-shell",
          cwd: "/home/dev/workspace"
        })
      );
    });
  });

  describe("sendInput()", () => {
    it("should send text input to PTY process and publish input event", async () => {
      const session = await service.create({
        cwd: "/home/dev/workspace",
        shell: "mock-shell"
      });

      service.sendInput(session.id, "help\r");

      expect(mockEvents.publish).toHaveBeenCalledWith(
        TerminalEventTypes.INPUT,
        expect.objectContaining({
          id: session.id,
          data: "help\r"
        })
      );
    });

    it("should throw an error for non-existent session", () => {
      expect(() => service.sendInput("invalid-id", "test")).toThrow();
    });
  });

  describe("resize()", () => {
    it("should resize terminal and emit layoutChanged event", async () => {
      const session = await service.create({
        cwd: "/home/dev/workspace",
        shell: "mock-shell"
      });

      service.resize(session.id, 100, 30);

      expect(mockEvents.publish).toHaveBeenCalledWith(
        TerminalEventTypes.LAYOUT_CHANGED,
        expect.objectContaining({
          id: session.id,
          cols: 100,
          rows: 30
        })
      );
    });
  });

  describe("close()", () => {
    it("should close and clean up session and emit stopped/closed events", async () => {
      const session = await service.create({
        cwd: "/home/dev/workspace",
        shell: "mock-shell"
      });

      service.close(session.id);

      expect(service.getSession(session.id)).toBeNull();
      expect(mockEvents.publish).toHaveBeenCalledWith(
        TerminalEventTypes.CLOSED,
        expect.objectContaining({
          id: session.id
        })
      );
    });
  });
});
