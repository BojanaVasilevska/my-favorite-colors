import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { faHeart, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box } from "@mantine/core";
import { ChromePicker, ColorResult } from "react-color";
import "./App.css";

const API_BASE = "http://localhost:8080/api";

interface Color {
  id?: number;
  title: string;
}

const getContrastColor = (hex: string) => {
  const r = parseInt(hex.substr(1, 2), 16);
  const g = parseInt(hex.substr(3, 2), 16);
  const b = parseInt(hex.substr(5, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 160 ? "#222" : "#fff";
};

function App() {
  const [color, setColor] = useState<Color>({ title: "#30a3a3" });
  const [colors, setColors] = useState<Color[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    axios
      .get(`${API_BASE}/colors`)
      .then((res) => setColors(res.data.data))
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  const handleAddColor = async () => {
    try {
      const res = await axios.post(`${API_BASE}/peek_color`, { title: color.title });
      setColors((prev) => [...prev, res.data.data]);
      setShowPicker(false);
    } catch (error) {
      console.error("Add color error:", error);
    }
  };

  const handleDeleteColor = async (id?: number) => {
    if (!id) return;
    try {
      await axios.delete(`${API_BASE}/delete_color/${id}`);
      setColors((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleColorChange = (newColor: ColorResult) => {
    setColor({ title: newColor.hex });
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
                style={{ color: color.title }}
              />
            </div>
            <input
              className="color-name"
              type="text"
              value={color.title}
              onChange={(e) => setColor({ title: e.target.value })}
            />
          </div>
          <div className="color-picker-wrapper">
            <button className="color-picker" onClick={() => setShowPicker(!showPicker)}>
              <Box className="color-box" style={{ backgroundColor: color.title }} />
            </button>
            {showPicker && (
              <div className="color-picker-container" ref={pickerRef}>
                <ChromePicker color={color.title} onChange={handleColorChange} />
              </div>
            )}
          </div>
          <button className="button-add" onClick={handleAddColor}>
            +
          </button>
        </div>

        <ul className="color-list">
          {colors.map((c) => {
            const textColor = getContrastColor(c.title);
            return (
              <li
                key={c.id}
                className="color-list-item"
                style={{
                  backgroundColor: c.title,
                  color: textColor,
                }}
              >
                {c.title}
                <FontAwesomeIcon
                  className="icon-trash"
                  icon={faTrashAlt}
                  onClick={() => handleDeleteColor(c.id)}
                  style={{ color: textColor }}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default App;
