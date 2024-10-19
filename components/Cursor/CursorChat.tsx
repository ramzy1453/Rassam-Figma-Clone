import { cn } from "@/lib/utils";
import CursorSVG from "@/public/assets/CursorSVG";
import { CursorChatProps, CursorMode } from "@/types/type";
import React from "react";

export default function CursorChat({
  cursor,
  cursorState,
  setCursorState,
  updateMyPresence,
}: CursorChatProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateMyPresence({ message: event.target.value });
    setCursorState({
      mode: CursorMode.Chat,
      message: event.target.value,
      previousMessage: null,
    });
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setCursorState({
        mode: CursorMode.Hidden,
      });
    } else if (event.key === "Enter") {
      setCursorState({
        //@ts-expect-error - message is not null
        previousMessage: cursorState.message,
        mode: CursorMode.Chat,
        message: "",
      });
    }
  };
  return (
    <div
      className="absolute top-0 left-0"
      style={{
        transform: `translate(${cursor.x}px, ${cursor.y}px)`,
      }}
    >
      {cursorState.mode === CursorMode.Chat && (
        <>
          <CursorSVG color="#000" />
          <div
            onKeyUp={(e) => e.stopPropagation()}
            style={{
              borderRadius: 20,
            }}
            className="absolute left-2 top-5 bg-blue-500 px-4 py-2 text-sm leading-relaxed text-white"
          >
            {cursorState.previousMessage && (
              <div className="text-left">{cursorState.previousMessage}</div>
            )}
            <input
              className={cn(
                "border-none z-10 w-50 bg-transparent text-white placeholder-blue-300 outline-none",
                {}
              )}
              autoFocus
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={
                cursorState.previousMessage ? "" : "Type a message..."
              }
              value={cursorState.message}
              maxLength={50}
            />
          </div>
        </>
      )}
    </div>
  );
}
