"use client";

import React from "react";

interface RetroHealthBarProps {
  currentHealth: number;
  maxHealth: number;
  label: string;
  color?: "primary" | "success" | "warning" | "error";
  size?: "small" | "medium" | "large";
  className?: string;
  showText?: boolean;
}

const RetroHealthBar: React.FC<RetroHealthBarProps> = ({
  currentHealth,
  maxHealth,
  label,
  color = "error", // Default to error (red) for health
  size = "medium",
  className = "",
  showText = true,
}) => {
  const healthPercentage = Math.max(0, Math.min(100, (currentHealth / maxHealth) * 100));
  
  // NES.css progress bar classes based on color
  const getProgressClass = () => {
    switch (color) {
      case "primary":
        return "nes-progress is-primary";
      case "success":
        return "nes-progress is-success";
      case "warning":
        return "nes-progress is-warning";
      case "error":
      default:
        return "nes-progress is-error";
    }
  };

  // Size configurations for different progress bar sizes
  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          width: "150px",
          fontSize: "8px",
          height: "20px",
        };
      case "large":
        return {
          width: "300px", 
          fontSize: "16px",
          height: "40px",
        };
      case "medium":
      default:
        return {
          width: "200px",
          fontSize: "12px",
          height: "30px",
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <div className={`${className}`} style={{ padding: "1rem", marginBottom: "1rem" }}>
      {/* NES.css Progress Bar */}
      <div style={{ position: "relative" }}>
        <progress 
          className={getProgressClass()}
          value={healthPercentage} 
          max="100"
          style={{
            width: sizeStyles.width,
            height: sizeStyles.height,
          }}
        >
           
        </progress>
        
        {/* Health Text Overlay */}
        {showText && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: sizeStyles.fontSize,
              fontFamily: "'Press Start 2P', cursive",
              color: "white",
              textShadow: "1px 1px 0 black",
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            {currentHealth}/{maxHealth}
          </div>
        )}
      </div>
      
      {/* Label with NES.css text styling */}
      <div className="nes-text is-white" style={{ 
        marginBottom: "0.5rem", 
        fontSize: sizeStyles.fontSize,
        fontFamily: "'Press Start 2P', cursive",
        textAlign: "center"
      }}>
        {label}
      </div>
    </div>
  );
};

export default RetroHealthBar;
