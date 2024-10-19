import { ActiveElement, NavbarProps } from "@/types/type";
import Image from "next/image";
import LiveAvatars from "../Users/LiveAvatars";
import { memo } from "react";
import { navElements } from "@/constants";
import { Button } from "@/components/UI/button";
import { ShapesMenu } from "../ShapesMenu";
import { NewThread } from "../Comments/NewThread";

function Navbar({
  activeElement,
  handleActiveElement,
  imageInputRef,
  handleImageUpload,
}: NavbarProps) {
  const isActive = (value: string | Array<ActiveElement>) =>
    (activeElement && activeElement.value === value) ||
    (Array.isArray(value) &&
      value.some((val) => val?.value === activeElement?.value));

  return (
    <nav className="flex select-none items-center justify-between gap-4 bg-primary-black px-5 text-white">
      <Image src="/assets/logo.svg" alt="FigmaClone" width={58} height={20} />
      <ul className="flex flex-row">
        {navElements.map((element) => (
          <li
            key={element.name}
            onClick={() => {
              if (Array.isArray(element.value)) return;
              //@ts-expect-error : type error
              handleActiveElement(element);
            }}
            className={`group px-2 py-4 flex justify-center items-center
            ${
              isActive(element.value)
                ? "bg-primary-green"
                : "hover:bg-primary-grey-200"
            }
            `}
          >
            {Array.isArray(element.value) ? (
              <ShapesMenu
                //@ts-expect-error : type error
                item={element}
                handleActiveElement={handleActiveElement}
                imageInputRef={imageInputRef}
                handleImageUpload={handleImageUpload}
                activeElement={activeElement}
              />
            ) : element.value === "comments" ? (
              <NewThread>
                <Button
                  className="relative w-5 h-5 object-contain"
                  variant="ghost"
                >
                  <Image
                    src={element.icon}
                    alt={element.name}
                    fill
                    className={isActive(element.value) ? "invert" : ""}
                  />
                </Button>
              </NewThread>
            ) : (
              <Button
                className="relative w-5 h-5 object-contain"
                variant="ghost"
              >
                <Image
                  src={element.icon}
                  alt={element.name}
                  fill
                  className={isActive(element.value) ? "invert" : ""}
                />
              </Button>
            )}
          </li>
        ))}
      </ul>
      <LiveAvatars />
    </nav>
  );
}

export default memo(
  Navbar,
  (prevProps, nextProps) => prevProps.activeElement === nextProps.activeElement
);
