import React, { useState, useEffect, useRef } from "react";
import "./App.css";

import { faHeart, faPlus, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box } from "@mantine/core";
import { ChromePicker, ColorResult } from "react-color";

export const ENDPOINT = "http://localhost:8080";

interface Color {
  hex: string;
}
function App() {
  const [color, setColor] = useState<Color>({ hex: "#ffffff" }); 
  // State for the currently selected color
  const [colors, setColors] = useState<Color[]>([]); 
  // State for the list of colors
  const [showPicker, setShowPicker] = useState<boolean>(false); 
  // State to toggle color picker visibility
  const pickerRef = useRef<HTMLDivElement>(null); 
  // Reference to the color picker element

  useEffect(() => {
    const storedColors = localStorage.getItem("colors");
    if (storedColors) {
      setColors(JSON.parse(storedColors));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("colors", JSON.stringify(colors));
  }, [colors]);

  const handleColorChange = (newColor: ColorResult) => {
    setColor({ hex: newColor.hex });
  };

  const handleAddColor = () => {
    setColors([...colors, color]);
    setShowPicker(false);
  };

  const handleDeleteColor = (index: number) => {
    const newColors = [...colors];
    newColors.splice(index, 1);
    setColors(newColors);
  };

  const handlePickerClick = (e: any) => {
    if (pickerRef.current && !pickerRef.current.contains(e.target)) {
      setShowPicker(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handlePickerClick, true);
    return () => {
      document.removeEventListener("click", handlePickerClick, true);
    };
  }, []);

  return (
    <Box className="app-box">
      <div>
        <div>
          <h4 className="title">My favorite color</h4>
        </div>
        <div>
          {colors.map((c, i) => (
            <FontAwesomeIcon
              className="icon"
              icon={faHeart}
              style={{ color: c.hex }}
            />
          ))}
          <input
            className="color-name"
            type="text"
            value={color.hex}
            readOnly
          />

          <button
            className="color-picker"
            onClick={() => setShowPicker(!showPicker)}
          >
            {colors.map((c, i) => (
              <Box style={{ color: c.hex, display: "inline-block" }}></Box>
            ))}
          </button>

          <button className="button-add" onClick={handleAddColor}>
            <FontAwesomeIcon className="icon-plus" icon={faPlus} />
          </button>
        </div>
        {showPicker && (
          <div ref={pickerRef}>
            <ChromePicker color={color.hex} onChange={handleColorChange} />
          </div>
        )}
        <ul>
          {colors.map((c, i) => (
            <li
              key={c.hex}
              style={{ backgroundColor: c.hex, marginRight: 20, height: 35 }}
            >
              {c.hex}
              <button
                style={{ marginLeft: 400 }}
                onClick={() => handleDeleteColor(i)}
              >
                <FontAwesomeIcon className="icon-plus" icon={faTrashCan} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Box>
  );
}

export default App;
