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
  const [color, setColor] = useState<Color>({ hex: "#ffffff" }); // State for the currently selected color
  const [colors, setColors] = useState<Color[]>([]); // State for the list of colors
  const [showPicker, setShowPicker] = useState<boolean>(false); // State to toggle color picker visibility
  const pickerRef = useRef<HTMLDivElement>(null); // Reference to the color picker element

  useEffect(() => {
    // Load colors from local storage on component mount
    const storedColors = localStorage.getItem("colors");
    if (storedColors) {
      setColors(JSON.parse(storedColors));
    }
  }, []);

  useEffect(() => {
    // Save colors to local storage when colors state changes
    localStorage.setItem("colors", JSON.stringify(colors));
  }, [colors]);

  const handleColorChange = (newColor: ColorResult) => {
    // Update the selected color when color picker value changes
    setColor({ hex: newColor.hex });
  };

  const handleAddColor = () => {
    // Add the selected color to the colors list and hide the color picker
    setColors([...colors, color]);
    setShowPicker(false);
  };

  const handleDeleteColor = (index: number) => {
    // Remove a color from the colors list based on its index
    const newColors = [...colors];
    newColors.splice(index, 1);
    setColors(newColors);
  };

  const handlePickerClick = (e: any) => {
    // Hide the color picker when clicking outside of it
    if (pickerRef.current && !pickerRef.current.contains(e.target)) {
      setShowPicker(false);
    }
  };

  useEffect(() => {
    // Add event listener to handle clicks outside of the color picker
    document.addEventListener("click", handlePickerClick, true);
    return () => {
      // Clean up the event listener when the component unmounts
      document.removeEventListener("click", handlePickerClick, true);
    };
  }, []);

  return (
    <div className="app-container">
      <div className="app-box">
        <h4 className="title">My Favorite Colors</h4>
        
        {/* Color input section */}
        <div className="color-section">
          <div className="color-input-container">
            {/* Heart icon container */}
            <div className="heart-icon-container">
              <FontAwesomeIcon
                className="heart-icon"
                icon={faHeart}
                style={{ color: color.hex }}
              />
            </div>
            {/* Color input */}
            <input
              className="color-name"
              type="text"
              value={color.hex}
              onChange={(e) => setColor({ hex: e.target.value })}
              style={{ borderColor: color.hex }}
            />
          </div>
          
          {/* Color picker button */}
          <button className="color-picker" onClick={() => setShowPicker(!showPicker)}>
            <Box className="color-box" style={{ backgroundColor: color.hex }} />
          </button>
          
          {/* Add color button */}
          <button className="button-add" onClick={handleAddColor}>
            +
          </button>
        </div>

        {/* Color picker */}
        {showPicker && (
          <div className="color-picker-container" ref={pickerRef}>
            <ChromePicker color={color.hex} onChange={handleColorChange} />
          </div>
        )}

        {/* Color list */}
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
