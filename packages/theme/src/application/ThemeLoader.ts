import type { Theme } from "../domain/Theme.js";
import { ThemeSerializer } from "./ThemeSerializer.js";

export class ThemeLoader {
  constructor(private readonly serializer: ThemeSerializer) {}

  public loadFromString(content: string): Theme {
    return this.serializer.deserialize(content);
  }

  public serializeToString(theme: Theme): string {
    return this.serializer.serialize(theme);
  }
}
