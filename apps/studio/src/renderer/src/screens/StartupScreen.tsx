import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { SplashScreen } from "./SplashScreen.js";

export function StartupScreen(): React.ReactElement {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function boot(): Promise<void> {
      await new Promise((resolve) => setTimeout(resolve, 700));
      if (cancelled) return;

      try {
        const active = await window.ocs?.workspace.getActive();
        if (active) {
          navigate(`/workspace/${active.id}`, { replace: true });
        } else {
          navigate("/welcome", { replace: true });
        }
      } catch {
        navigate("/welcome", { replace: true });
      }

      setReady(true);
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (!ready) {
    return <SplashScreen />;
  }

  return null;
}
