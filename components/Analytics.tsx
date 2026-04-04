"use client";

import { useEffect } from "react";

export default function Analytics() {
  useEffect(() => {
    let anon_id = localStorage.getItem("anon_id");
    const isNew = !anon_id;
    if (isNew) {
      anon_id = crypto.randomUUID();
      localStorage.setItem("anon_id", anon_id);
    }
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: isNew ? "first_visit" : "return_visit",
        hour: new Date().getHours(),
        anon_id,
      }),
    });
  }, []);

  return null;
}
