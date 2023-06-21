import React, { useState, useEffect, useRef } from "react";
import "./App.css";

import { faHeart, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box } from "@mantine/core";
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
    <div className="app-container">
      <div className="app-box">
        <h4 className="title">My Favorite Colors</h4>
        <div className="color-section">
  <div className="color-input-container">
    <div className="heart-icon-container">
      <FontAwesomeIcon
        className="heart-icon"
        icon={faHeart}
        style={{ color: color.hex }}
      />
    </div>
    <input
      className="color-name"
      type="text"
      value={color.hex}
      onChange={(e) => setColor({ hex: e.target.value })}
      style={{ borderColor: color.hex }}
    />
  </div>
  <button className="color-picker" onClick={() => setShowPicker(!showPicker)}>
    <Box className="color-box" style={{ backgroundColor: color.hex }} />
  </button>
  <button className="button-add" onClick={handleAddColor}>
    +
  </button>
</div>

        {showPicker && (
          <div className="color-picker-container" ref={pickerRef}>
            <ChromePicker color={color.hex} onChange={handleColorChange} />
          </div>
        )}
        <ul className="color-list">
          {colors.map((c, i) => (
            <li
              key={i}
              className="color-list-item"
              style={{ backgroundColor: c.hex }}
            >
              {c.hex}
              <FontAwesomeIcon
                className="icon-trash"
                icon={faTrashAlt}
                onClick={() => handleDeleteColor(i)}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
