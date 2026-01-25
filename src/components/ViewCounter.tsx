"use client";

import { useEffect, useRef } from "react";

export default function ViewCounter({ id }: { id: string }) {
  const called = useRef(false);

  useEffect(() => {
    if (!called.current) {
      fetch(`/api/projects/${id}/views`, { method: "POST" }).catch(() => {});
      called.current = true;
    }
  }, [id]);

  return null;
}