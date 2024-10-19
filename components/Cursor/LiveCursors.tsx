import { COLORS } from "@/constants";
import { LiveCursorProps } from "@/types/type";
import React from "react";
import Cursor from "./Cursor";

export default function LiveCursors({ others }: LiveCursorProps) {
  return others.map(({ presence, connectionId }) => {
    if (!presence?.cursor) return null;

    return (
      <Cursor
        key={connectionId}
        color={COLORS[Number(connectionId) % COLORS.length]}
        x={presence.cursor.x}
        y={presence.cursor.y}
        message={presence.message}
      />
    );
  });
}
