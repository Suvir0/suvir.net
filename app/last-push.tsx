"use client";

import { useEffect, useState } from "react";
import { profile } from "./content";

const fallback = `github.com/${profile.githubUser}`;

function ago(iso: string) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${mins} minutes ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} ${hrs === 1 ? "hour" : "hours"} ago`;
  const days = Math.round(hrs / 24);
  return `${days} ${days === 1 ? "day" : "days"} ago`;
}

type PushEvent = {
  type: string;
  repo: { name: string };
  created_at: string;
};

export function LastPush() {
  const [label, setLabel] = useState(fallback);

  useEffect(() => {
    let live = true;

    fetch(`https://api.github.com/users/${profile.githubUser}/events/public`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("github"))))
      .then((events: PushEvent[]) => {
        const push = (events || []).find((e) => e.type === "PushEvent");
        if (!push || !live) return;
        setLabel(`${push.repo.name.split("/")[1]}, ${ago(push.created_at)}`);
      })
      .catch(() => {});

    return () => {
      live = false;
    };
  }, []);

  return <>{label}</>;
}
