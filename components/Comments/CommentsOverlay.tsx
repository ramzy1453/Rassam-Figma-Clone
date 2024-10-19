"use client";

import { useEditThreadMetadata, useThreads } from "@liveblocks/react/suspense";
import { ThreadData } from "@liveblocks/client";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./CommentsOverlay.module.css";
import { getCoordsFromAccurateCursorPositions } from "@/lib/coords";
import { PinnedThread } from "./PinnedThread";
import { useMaxZIndex } from "@/lib/useMaxZIndex";

export function CommentsOverlay() {
  const { threads } = useThreads();
  const [beingDragged, setBeingDragged] = useState(false);
  const maxZIndex = useMaxZIndex();

  return (
    <div
      style={{ pointerEvents: beingDragged ? "none" : "auto" }}
      data-hide-cursors
    >
      {threads
        .filter((thread) => !thread.resolved)
        .map((thread) => (
          <OverlayThread
            key={thread.id}
            thread={thread}
            maxZIndex={maxZIndex}
            onDragChange={setBeingDragged}
          />
        ))}
    </div>
  );
}

type OverlayThreadProps = {
  thread: ThreadData;
  maxZIndex: number;
  onDragChange: (dragging: boolean) => void;
};

function OverlayThread({ thread, maxZIndex }: OverlayThreadProps) {
  const editThreadMetadata = useEditThreadMetadata();

  const threadRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const [coords, setCoords] = useState<{ x: number; y: number }>({
    x: -10000,
    y: -10000,
  });

  // Update thread when another user edits, and update coords when page resizes
  useEffect(() => {
    if (draggingRef.current) {
      return;
    }
    function updateCoords() {
      const { cursorSelectors, cursorX, cursorY } = thread.metadata;
      if (!cursorSelectors) {
        return;
      }

      const fromAccurateCoords = getCoordsFromAccurateCursorPositions({
        cursorSelectors: cursorSelectors.split(","),
        cursorX,
        cursorY,
      });

      if (!fromAccurateCoords) {
        setCoords({ x: -10000, y: -10000 });
        return;
      }

      setCoords({ x: fromAccurateCoords?.x, y: fromAccurateCoords.y });
    }

    updateCoords();

    window.addEventListener("resize", updateCoords);
    window.addEventListener("orientationchange", updateCoords);

    return () => {
      window.removeEventListener("resize", updateCoords);
      window.removeEventListener("orientationchange", updateCoords);
    };
  }, [thread]);

  // If other thread(s) above, increase z-index on last element updated
  const handleIncreaseZIndex = useCallback(() => {
    if (maxZIndex === thread.metadata.zIndex) {
      return;
    }

    editThreadMetadata({
      threadId: thread.id,
      metadata: {
        zIndex: maxZIndex + 1,
      },
    });
  }, [thread, editThreadMetadata, maxZIndex]);

  return (
    <div
      ref={threadRef}
      id={`thread-${thread.id}`}
      className={styles.overlayWrapper}
      style={{
        transform: `translate(${coords.x}px, ${coords.y}px)`,
        zIndex: draggingRef.current ? 9999999 : thread.metadata.zIndex,
      }}
      data-ignore-when-placing-composer
    >
      <PinnedThread thread={thread} onFocus={handleIncreaseZIndex} />
    </div>
  );
}
