"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import portrait from "./suvir-potdar.jpg";
import portraitFull from "./suvir-potdar-full.jpg";

const ALT = "Suvir Potdar holding a New Jersey licence plate that reads SENIOR";
const CAPTION = "Senior photo, 2026.";

export function Portrait() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  // A backdrop click only counts if the press started there too. Without this,
  // the very click that opens the dialog lands on the backdrop and shuts it
  // again, and dragging off the photo would dismiss it.
  const pressedBackdrop = useRef(false);
  // The full-size file is only fetched once the dialog has actually been opened.
  const [opened, setOpened] = useState(false);

  const open = useCallback(() => {
    setOpened(true);
    dialogRef.current?.showModal();
    // showModal() leaves the page behind the dialog scrollable.
    document.body.style.overflow = "hidden";
  }, []);

  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  // Escape, the backdrop, and the close button all end in a `close` event.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const unlock = () => {
      document.body.style.overflow = "";
    };
    dialog.addEventListener("close", unlock);

    return () => {
      dialog.removeEventListener("close", unlock);
      unlock();
    };
  }, []);

  return (
    <figure className="portrait">
      <button type="button" className="portrait-trigger" onClick={open} aria-label="Expand photo">
        <Image src={portrait} alt={ALT} sizes="210px" placeholder="blur" priority />
      </button>
      <figcaption>{CAPTION}</figcaption>

      <dialog
        ref={dialogRef}
        className="lightbox"
        aria-label={ALT}
        onMouseDown={(event) => {
          pressedBackdrop.current = event.target === dialogRef.current;
        }}
        onClick={(event) => {
          // Clicks that land on the dialog itself are backdrop clicks.
          if (event.target === dialogRef.current && pressedBackdrop.current) close();
          pressedBackdrop.current = false;
        }}
      >
        <div className="lightbox-inner">
          {opened ? (
            <Image
              src={portraitFull}
              alt={ALT}
              sizes="(max-width: 700px) 88vw, 620px"
              placeholder="blur"
            />
          ) : null}
          <div className="lightbox-foot">
            <span>{CAPTION}</span>
            <button type="button" onClick={close}>close</button>
          </div>
        </div>
      </dialog>
    </figure>
  );
}
