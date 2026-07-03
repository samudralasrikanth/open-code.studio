export type SplitNode =
  | { type: "group"; groupId: string }
  | { type: "split"; orientation: "horizontal" | "vertical"; left: SplitNode; right: SplitNode };

export interface EditorLayout {
  root: SplitNode;
}
