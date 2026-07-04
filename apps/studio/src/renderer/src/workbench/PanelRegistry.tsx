/**
 * PanelRegistry.tsx — Contribution-point system for workbench panels.
 *
 * Panels register themselves here. The layout engine reads
 * from this registry to decide what to render in each region.
 */

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

import type { PanelPosition } from "./LayoutDescriptor.js";

// ── Panel Contribution ──────────────────────────────────────

/** What each panel contributes to the workbench. */
export interface PanelContribution {
  /** Unique panel identifier (e.g., "explorer", "terminal", "chat"). */
  id: string;
  /** Display title shown in tabs and tooltips. */
  title: string;
  /** Icon element rendered in ActivityBar and tab headers. */
  icon: React.ReactNode;
  /** The React component to render when this panel is active. */
  component: React.ComponentType;
  /** Where this panel lives by default. */
  defaultPosition: PanelPosition;
  /** All positions this panel is allowed to occupy. */
  allowedPositions: PanelPosition[];
  /** Sort order within a region (lower = earlier). */
  order: number;
  /** Optional dynamic badge count (e.g., unread notifications). */
  badge?: () => number;
  /** Optional conditional visibility predicate. */
  when?: () => boolean;
}

// ── Registry Implementation ─────────────────────────────────

export class PanelRegistryImpl {
  private panels: Map<string, PanelContribution> = new Map();
  private listeners: Set<() => void> = new Set();

  /** Register a panel contribution. */
  register(panel: PanelContribution): void {
    this.panels.set(panel.id, panel);
    this.notify();
  }

  /** Unregister a panel by ID. */
  unregister(id: string): void {
    this.panels.delete(id);
    this.notify();
  }

  /** Get all panels for a given position, sorted by order. */
  getByPosition(position: PanelPosition): PanelContribution[] {
    return Array.from(this.panels.values())
      .filter((p) => p.defaultPosition === position)
      .filter((p) => !p.when || p.when())
      .sort((a, b) => a.order - b.order);
  }

  /** Get a single panel by ID. */
  get(id: string): PanelContribution | undefined {
    return this.panels.get(id);
  }

  /** Get all registered panels. */
  getAll(): PanelContribution[] {
    return Array.from(this.panels.values()).sort((a, b) => a.order - b.order);
  }

  /** Subscribe to registry changes. */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn());
  }
}

// ── React Context ───────────────────────────────────────────

const PanelRegistryContext = createContext<PanelRegistryImpl | null>(null);

interface PanelRegistryProviderProps {
  children: React.ReactNode;
  onReady?: (registry: PanelRegistryImpl) => void;
}

export function PanelRegistryProvider({
  children,
  onReady
}: PanelRegistryProviderProps): React.ReactElement {
  const registryRef = useRef<PanelRegistryImpl | null>(null);

  if (!registryRef.current) {
    registryRef.current = new PanelRegistryImpl();
    onReady?.(registryRef.current);
  }

  return (
    <PanelRegistryContext.Provider value={registryRef.current}>
      {children}
    </PanelRegistryContext.Provider>
  );
}

// ── Hook ────────────────────────────────────────────────────

/** Access the panel registry from any workbench component. */
export function usePanelRegistry(): PanelRegistryImpl {
  const registry = useContext(PanelRegistryContext);
  if (!registry) {
    throw new Error("usePanelRegistry must be used within <PanelRegistryProvider>");
  }

  // Force re-render when registry changes
  const [, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);

  React.useEffect(() => {
    return registry.subscribe(bump);
  }, [registry, bump]);

  return registry;
}

/** Get panels for a specific position (convenience hook). */
export function usePanelsForPosition(position: PanelPosition): PanelContribution[] {
  const registry = usePanelRegistry();
  return useMemo(() => registry.getByPosition(position), [registry, position]);
}
