import { useEffect, useState } from "react";

export function useIsMdScreen() {
  const [isMedium, setIsMedium] = useState(() => window.innerWidth >= 768);

  useEffect(() => {
    const handler = () => setIsMedium(window.innerWidth >= 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return isMedium;
}
