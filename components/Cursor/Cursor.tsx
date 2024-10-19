import CursorSVG from "@/public/assets/CursorSVG";
import React from "react";

type Props = {
  x: number;
  y: number;
  color: string;
  message: string;
};
export default function Cursor({ x, y, color, message }: Props) {
  return (
    <div
      className="pointer-events-none absolute top-0 left-0"
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
    >
      <CursorSVG color={color} />
      {message && (
        <div
          style={{ backgroundColor: color }}
          className="absolute left-2 top-5 px-4 py-2 text-sm text-white rounded-3xl"
        >
          <p className="text-white whitespace-nowrap text-sm leading-relaxed">
            {message}
          </p>
        </div>
      )}
    </div>
  );
}
