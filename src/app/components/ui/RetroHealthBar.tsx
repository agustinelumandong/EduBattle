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

  // Responsive size configurations for different screen sizes
  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          // Mobile-first approach with responsive scaling
          width: "150px", // Mobile
          widthSm: "120px", // Small screens
          widthMd: "150px", // Medium screens
          fontSize: "12px", // Mobile
          fontSizeSm: "8px", // Small screens
          fontSizeMd: "10px", // Medium screens
          height: "100px", // Mobile
          heightSm: "100px", // Small screens
          heightMd: "100px", // Medium screens
        };
      case "large":
        return {
          width: "300px", // Mobile
          widthSm: "300px", // Small screens
          widthMd: "300px", // Medium screens
          widthLg: "300px", // Large screens
          fontSize: "16px", // Mobile
          fontSizeSm: "12px", // Small screens
          fontSizeMd: "14px", // Medium screens
          fontSizeLg: "16px", // Large screens
          height: "100px", // Mobile
          heightSm: "100px", // Small screens
          heightMd: "100px", // Medium screens
          heightLg: "100px", // Large screens
        };
      case "medium":
      default:
        return {
          width: "110px", // Mobile
          widthSm: "140px", // Small screens
          widthMd: "180px", // Medium screens
          widthLg: "200px", // Large screens
          fontSize: "7px", // Mobile
          fontSizeSm: "9px", // Small screens
          fontSizeMd: "11px", // Medium screens
          fontSizeLg: "12px", // Large screens
          height: "48px", // Mobile
          heightSm: "32px", // Small screens
          heightMd: "28px", // Medium screens
          heightLg: "30px", // Large screens
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <div className={`${className}`} style={{ 
      padding: "0.5rem", // Reduced padding for mobile
      marginBottom: "0.5rem" 
    }}>
      {/* Label with responsive sizing */}
      <div 
        className="nes-text is-white mb-2"
        style={{ 
          fontFamily: "'Press Start 2P', cursive",
          textAlign: "center",
          // Responsive font sizes using CSS custom properties
          fontSize: sizeStyles.fontSize,
          lineHeight: "1.2"
        }}
      >
        {label}
      </div>
      
      {/* Responsive NES.css Progress Bar Container */}
      <div 
        className="w-full flex justify-center"
        style={{ position: "relative" }}
      >
        <progress 
          className={`${getProgressClass()} responsive-healthbar`}
          value={healthPercentage} 
          max="100"
          style={{
            // Mobile-first responsive sizing - using CSS variables for dynamic sizing
            width: sizeStyles.width,
            height: sizeStyles.height,
            transition: "all 0.3s ease"
          }}
        />
        
        {/* Responsive Health Text Overlay */}
        {showText && (
          <div
            style={{
              position: "absolute",
              top: "40%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: sizeStyles.fontSize,
              fontFamily: "'Press Start 2P', cursive",
              color: "white",
              textShadow: "1px 1px 0 black, -1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black",
              pointerEvents: "none",
              zIndex: 10,
              lineHeight: "1",
              letterSpacing: "0.5px"
            }}
          >
            {currentHealth}/{maxHealth}
          </div>
        )}
      </div>
    </div>
  );
};

export default RetroHealthBar;
