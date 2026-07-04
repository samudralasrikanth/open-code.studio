import { useState, useEffect, useCallback } from "react";

export function usePlatform() {
  const [platformInfo, setPlatformInfo] = useState<{ appVersion: string; platform: string } | null>(
    null
  );

  useEffect(() => {
    let mounted = true;
    window.ocs?.health
      .platformInfo()
      .then((info) => {
        if (mounted) {
          setPlatformInfo({ appVersion: info.appVersion, platform: info.platform });
        }
      })
      .catch(() => {
        if (mounted) {
          setPlatformInfo({ appVersion: "0.1.0", platform: "unknown" });
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const minimize = useCallback(() => {
    window.ocs?.window.minimize();
  }, []);

  const getTheme = useCallback(async (): Promise<"dark" | "light" | "system"> => {
    const result = await window.ocs?.theme.get();
    return (result?.theme as any) ?? "dark";
  }, []);

  const setTheme = useCallback(async (theme: string): Promise<void> => {
    await window.ocs?.theme.set(theme);
  }, []);

  return { platformInfo, minimize, getTheme, setTheme };
}
