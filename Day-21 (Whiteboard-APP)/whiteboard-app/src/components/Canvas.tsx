/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Excalidraw, MainMenu, WelcomeScreen } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import type { FILE } from "../types";

interface CanvasProps {
  onSaveTrigger: boolean;
  fileId: string;
  fileData: FILE;
  onSave?: (data: any) => void;
}

function Canvas({ onSaveTrigger, fileId, fileData, onSave }: CanvasProps) {
  const [whiteBoardData, setWhiteBoardData] = useState<any>();

  useEffect(() => {
    if (onSaveTrigger) {
      saveWhiteboard();
    }
  }, [onSaveTrigger]);

  const saveWhiteboard = () => {
    const dataToSave = {
      _id: fileId,
      whiteboard: JSON.stringify(whiteBoardData),
    };
    
    // Call the onSave callback if provided
    if (onSave) {
      onSave(dataToSave);
    }
    
    // Log for development
    console.log("Whiteboard saved:", dataToSave);
  };

  const getInitialElements = () => {
    if (fileData?.whiteboard) {
      try {
        const elements = JSON.parse(fileData.whiteboard);
        if (Array.isArray(elements)) {
          return elements;
        }
      } catch (error) {
        console.error("Error parsing whiteboard data:", error);
        return [];
      }
    }
    return [];
  };

  return (
    <div className="h-[670px] w-full border border-gray-300 rounded-lg overflow-hidden shadow-lg" style={{ height: "670px" }}>
      {fileData && (
        <Excalidraw
          theme="light"
          initialData={{
            elements: getInitialElements(),
          }}
          onChange={(excalidrawElements) =>
            setWhiteBoardData(excalidrawElements)
          }
          UIOptions={{
            canvasActions: {
              saveToActiveFile: false,
              loadScene: false,
              export: false,
              toggleTheme: false,
            },
          }}
        >
          <MainMenu>
            <MainMenu.DefaultItems.ClearCanvas />
            <MainMenu.DefaultItems.SaveAsImage />
            <MainMenu.DefaultItems.ChangeCanvasBackground />
          </MainMenu>
          <WelcomeScreen>
            <WelcomeScreen.Hints.MenuHint />
            <WelcomeScreen.Hints.MenuHint />
            <WelcomeScreen.Hints.ToolbarHint />
            <WelcomeScreen.Center>
              <WelcomeScreen.Center.MenuItemHelp />
            </WelcomeScreen.Center>
          </WelcomeScreen>
        </Excalidraw>
      )}
    </div>
  );
}

export default Canvas;
