"use client";

import { useEffect, useState } from "react";
import { lastfm } from "./content";

type Track = { name: string; artist: string; url?: string };

// Last.fm marks the live track with @attr.nowplaying on the first item.
// A proxy can forward this response shape untouched, so one parser covers both.
type RecentTracks = {
  recenttracks?: {
    track?: Array<{
      name?: string;
      url?: string;
      artist?: { "#text"?: string };
      "@attr"?: { nowplaying?: string };
    }>;
  };
};

function parse(data: RecentTracks): Track | null {
  const track = data.recenttracks?.track?.[0];
  if (track?.["@attr"]?.nowplaying !== "true") return null;

  const name = track.name?.trim();
  const artist = track.artist?.["#text"]?.trim();
  if (!name || !artist) return null;

  return { name, artist, url: track.url };
}

export function NowPlaying() {
  const [track, setTrack] = useState<Track | null>(null);

  useEffect(() => {
    if (!lastfm.endpoint) return;

    let live = true;

    const check = () =>
      fetch(lastfm.endpoint, { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error("lastfm"))))
        .then((data) => {
          if (live) setTrack(parse(data));
        })
        .catch(() => {
          if (live) setTrack(null);
        });

    check();
    const timer = setInterval(check, 60_000);

    return () => {
      live = false;
      clearInterval(timer);
    };
  }, []);

  // Nothing scrobbling, or the request failed: the row is simply not there.
  if (!track) return null;

  return (
    <p className="now-playing" title={`${track.name} — ${track.artist}`}>
      <span className="eq" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </span>
      <span className="now-playing-text">
        <span className="sr-only">Listening to </span>
        {track.url ? (
          <a href={track.url} target="_blank" rel="noopener noreferrer">
            {track.name}
          </a>
        ) : (
          track.name
        )}
        , {track.artist}
      </span>
    </p>
  );
}
