"use client";

import Live from "@/components/Live";
import Navbar from "@/components/Layout/Navbar";
import LeftSidebar from "@/components/Layout/LeftSidebar";
import RightSidebar from "@/components/Layout/RightSidebar";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { FabricObject, Canvas } from "fabric";
import {
  handleCanvasMouseMove,
  handleCanvasMouseDown,
  handleCanvasMouseUp,
  handleResize,
  initializeFabric,
  renderCanvas,
  handleCanvasObjectModified,
  handleCanvasSelectionCreated,
  handleCanvasObjectScaling,
  handlePathCreated,
} from "@/lib/canvas";
import { ActiveElement, Attributes } from "@/types/type";
import { useMutation, useRedo, useStorage, useUndo } from "@liveblocks/react";
import { LiveMap } from "@liveblocks/client";
import { defaultNavElement } from "@/constants";
import { handleDelete, handleKeyDown } from "@/lib/key-events";
import { handleImageUpload } from "@/lib/shapes";

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const isDrawing = useRef(false);
  const shapeRef = useRef<FabricObject | null>();
  const selectedShapeRef = useRef("text");
  const activeObjectRef = useRef<FabricObject | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const isEditingRef = useRef(false);
  const [elementAttributes, setElementAttributes] = useState<Attributes>({
    width: "",
    height: "",
    fontSize: "",
    fontWeight: "",
    fontFamily: "",
    fill: "#aabbcc",
    stroke: "#aabbcc",
  });

  const undo = useUndo();
  const redo = useRedo();

  const canvasObjects =
    useStorage((root) => root.canvasObjects) || new LiveMap();

  const syncShapeInStorage = useMutation(({ storage }, object) => {
    if (!object) return;
    const { objectId } = object;
    const shapeData = object.toJSON();
    shapeData.objectId = objectId;

    const canvasObjects = storage.get("canvasObjects");
    canvasObjects.set(objectId, shapeData);
  }, []);

  const deleteAllShapes = useMutation(({ storage }) => {
    const canvasObjects = storage.get("canvasObjects");
    if (!canvasObjects || canvasObjects.size === 0) return true;
    for (const [key] of canvasObjects) {
      canvasObjects.delete(key);
    }

    return canvasObjects.size === 0;
  }, []);

  const deleteShapeFromStorage = useMutation(({ storage }, objectId) => {
    const canvasObjects = storage.get("canvasObjects");
    canvasObjects.delete(objectId);
  }, []);

  const [activeElement, setActiveElement] = useState<ActiveElement>({
    name: "",
    value: "",
    icon: "",
  });

  const handleActiveElement = (element: ActiveElement) => {
    setActiveElement(element);
    selectedShapeRef.current = element?.value as string;

    if (element?.value === "reset") {
      deleteAllShapes();
      fabricRef.current?.clear();
      setActiveElement(defaultNavElement);
    }

    if (element?.value === "delete") {
      handleDelete(fabricRef.current as Canvas, deleteShapeFromStorage);
      setActiveElement(defaultNavElement);
    }

    if (element?.value === "image") {
      imageInputRef.current?.click();
      if (fabricRef.current) fabricRef.current.isDrawingMode = false;
    }
  };

  useEffect(() => {
    const canvas = initializeFabric({ canvasRef, fabricRef });
    canvas.on("mouse:down", (options) => {
      handleCanvasMouseDown({
        options,
        canvas,
        isDrawing,
        //@ts-expect-error: shape ref error
        shapeRef,
        selectedShapeRef,
      });
    });

    canvas.on("mouse:move", (options) => {
      handleCanvasMouseMove({
        options,
        canvas,
        isDrawing,
        shapeRef,
        selectedShapeRef,
        syncShapeInStorage,
      });
    });

    canvas.on("mouse:up", (options) => {
      handleCanvasMouseUp({
        //@ts-expect-error: options error
        options,
        canvas,
        isDrawing,
        shapeRef,
        selectedShapeRef,
        syncShapeInStorage,
        setActiveElement,
        activeObjectRef,
      });
    });

    canvas.on("object:modified", (options) => {
      handleCanvasObjectModified({
        options,
        syncShapeInStorage,
      });
    });
    canvas.on("selection:created", (options) => {
      handleCanvasSelectionCreated({
        options,
        isEditingRef,
        setElementAttributes,
      });
    });

    canvas.on("object:scaling", (options) => {
      handleCanvasObjectScaling({ options, setElementAttributes });
    });

    canvas.on("path:created", (options) => {
      handlePathCreated({ options, syncShapeInStorage });
    });

    addEventListener("resize", () => {
      handleResize({ canvas: fabricRef.current });
    });

    addEventListener("keydown", (e: KeyboardEvent) => {
      handleKeyDown({
        e,
        canvas: fabricRef.current,
        undo,
        redo,
        syncShapeInStorage,
        deleteShapeFromStorage,
      });
    });

    return () => {
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    renderCanvas({ fabricRef, canvasObjects, activeObjectRef });
  }, [canvasObjects]);

  return (
    <div className="">
      <Navbar
        activeElement={activeElement}
        handleActiveElement={handleActiveElement}
        imageInputRef={imageInputRef}
        handleImageUpload={(e) => {
          e.stopPropagation();

          handleImageUpload({
            file: e.target.files?.[0] as File,
            syncShapeInStorage,
            canvas: fabricRef as MutableRefObject<Canvas>,
            //@ts-expect-error : shaperef is not assignable to type Canvas
            shapeRef,
          });
        }}
      />
      <div className="flex h-full">
        <LeftSidebar allShapes={Array.from(canvasObjects)} />
        <Live canvasRef={canvasRef} undo={undo} redo={redo} />
        <RightSidebar
          elementAttributes={elementAttributes}
          setElementAttributes={setElementAttributes}
          fabricRef={fabricRef}
          isEditingRef={isEditingRef}
          activeObjectRef={activeObjectRef}
          syncShapeInStorage={syncShapeInStorage}
        />
      </div>
    </div>
  );
}
