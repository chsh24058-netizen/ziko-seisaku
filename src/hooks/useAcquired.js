import { useEffect, useState } from "react";

export function useAcquired(storageKey) {
  const [acquiredIds, setAcquiredIds] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(acquiredIds));
  }, [acquiredIds, storageKey]);

  const toggleAcquired = (node) => {
    if (node.type !== "資格") return;

    setAcquiredIds((prev) => {
      if (prev.includes(node.id)) {
        return prev.filter((id) => id !== node.id);
      }

      return [...prev, node.id];
    });
  };

  return { acquiredIds, toggleAcquired };
}
