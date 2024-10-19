"use client";

import { ClientSideSuspense } from "@liveblocks/react";
import { CommentsOverlay } from "./CommentsOverlay";
import { ErrorBoundary } from "react-error-boundary";
import styles from "./Toolbar.module.css";

export function Comments() {
  return (
    <ErrorBoundary
      fallback={
        <div className={styles.toolbar}>
          An error occurred while loading threads.
        </div>
      }
    >
      <ClientSideSuspense fallback={null}>
        <CommentsOverlay />
      </ClientSideSuspense>
    </ErrorBoundary>
  );
}
