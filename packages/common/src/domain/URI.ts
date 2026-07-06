export class URI {
  public readonly scheme: string;
  public readonly authority: string;
  public readonly path: string;
  public readonly query: string;
  public readonly fragment: string;

  private constructor(
    scheme: string,
    authority: string,
    path: string,
    query: string,
    fragment: string
  ) {
    this.scheme = scheme;
    this.authority = authority;
    this.path = path || "/";
    this.query = query;
    this.fragment = fragment;
  }

  public static parse(value: string): URI {
    try {
      const url = new URL(value);
      return new URI(
        url.protocol.replace(":", ""),
        url.host,
        url.pathname,
        url.search.replace("?", ""),
        url.hash.replace("#", "")
      );
    } catch {
      // Fallback for simple paths that aren't valid full URLs
      if (value.startsWith("/")) {
        return new URI("file", "", value, "", "");
      }
      throw new Error(`Invalid URI: ${value}`);
    }
  }

  public static file(path: string): URI {
    return new URI("file", "", path, "", "");
  }

  public static from(components: {
    scheme: string;
    authority?: string;
    path?: string;
    query?: string;
    fragment?: string;
  }): URI {
    return new URI(
      components.scheme,
      components.authority || "",
      components.path || "/",
      components.query || "",
      components.fragment || ""
    );
  }

  public toString(): string {
    let result = `${this.scheme}:`;
    if (this.authority || this.scheme === "file") {
      result += `//${this.authority}`;
    }
    result += this.path;
    if (this.query) {
      result += `?${this.query}`;
    }
    if (this.fragment) {
      result += `#${this.fragment}`;
    }
    return result;
  }

  public toJSON(): string {
    return this.toString();
  }

  public with(change: {
    scheme?: string;
    authority?: string;
    path?: string;
    query?: string;
    fragment?: string;
  }): URI {
    return new URI(
      change.scheme !== undefined ? change.scheme : this.scheme,
      change.authority !== undefined ? change.authority : this.authority,
      change.path !== undefined ? change.path : this.path,
      change.query !== undefined ? change.query : this.query,
      change.fragment !== undefined ? change.fragment : this.fragment
    );
  }
}
