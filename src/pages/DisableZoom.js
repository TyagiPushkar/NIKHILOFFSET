import { useEffect } from "react";

function DisableZoom() {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "viewport";
    meta.content =
      "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
    document.head.appendChild(meta);
    return () => document.head.removeChild(meta);
  }, []);

  return null;
}

export default DisableZoom;