import { faHeart, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./App.css";
import { Box } from "@mantine/core";
import React, { useState, useEffect, useRef } from "react";
import { ChromePicker, ColorResult } from "react-color";

export const ENDPOINT = "http://localhost:8080";

interface Color {
  hex: string;
}
function App() {
  const [color, setColor] = useState<Color>({ hex: "#ffffff" });
  const [colors, setColors] = useState<Color[]>([]);
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const pickerRef = useRef<HTMLDivElement>(null);

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
          <text className="title">My favortie color</text>
        </div>
        <div>
          {colors.map((c, i) => (
            <FontAwesomeIcon
              className="icon"
              icon={faHeart}
              key={c.hex}
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
            Pick Color
          </button>

          <button className="button-add" onClick={handleAddColor}>
            Add Color
          </button>
        </div>
        {showPicker && (
          <div ref={pickerRef}>
            <ChromePicker color={color.hex} onChange={handleColorChange} />
          </div>
        )}
        <ul>
          {colors.map((c, i) => (
            <li key={c.hex} style={{ backgroundColor: c.hex }}>
              {c.hex}
              <button onClick={() => handleDeleteColor(i)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </Box>
  );
}

export default App;
