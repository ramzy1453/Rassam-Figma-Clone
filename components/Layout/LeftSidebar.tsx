import { LeftShapes } from "@/constants";
import {
  motion,
  AnimatePresence,
  useIsPresent,
  MotionProps,
} from "framer-motion";
import Image from "next/image";
import React from "react";

type Props = {
  allShapes: [string, { type: string }][];
};

export default function LeftSidebar({ allShapes }: Props) {
  return (
    <section className="border flex flex-col border-t border-primary-grey-200 bg-primary-black text-primary-grey-300 min-w-[227px] sticky left-0 max-sm:hidden select-none overflow-y-auto">
      <h3 className="my-4 py-2 px-4 text-md uppercase">LAYERS</h3>
      <AnimatePresence>
        <ul className="space-y-4">
          {allShapes.map(([objectId, shape]) => {
            const el = LeftShapes[shape.type];
            return (
              <Item key={objectId}>
                <Image
                  src={el?.icon}
                  width={20}
                  height={20}
                  alt={shape.type}
                  className="mr-2 group-hover:invert"
                />
                {el?.name}
              </Item>
            );
          })}
        </ul>
      </AnimatePresence>
    </section>
  );
}

const Item = ({ children }: { children: React.ReactNode }) => {
  const isPresent = useIsPresent();
  const animations: MotionProps = {
    style: {
      position: isPresent ? "static" : "absolute",
    },
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0, opacity: 0 },
    transition: { type: "spring", stiffness: 900, damping: 40 },
  };
  return (
    <motion.li
      {...animations}
      layout
      className="flex py-3 px-4 hover:bg-primary-green hover:text-black cursor-pointer group"
    >
      {children}
    </motion.li>
  );
};
