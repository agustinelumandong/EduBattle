"use client";

import React from "react";

interface RetroHealthBarProps {
  currentHealth: number;
  maxHealth: number;
  label: string;
  color?: "red" | "blue" | "green" | "yellow";
  size?: "small" | "medium" | "large";
  className?: string;
}

const RetroHealthBar: React.FC<RetroHealthBarProps> = ({
  currentHealth,
  maxHealth,
  label,
  color = "red",
  size = "medium",
  className = "",
}) => {
  const healthPercentage = Math.max(0, Math.min(100, (currentHealth / maxHealth) * 100));
  
  // Color schemes for different health bar types
  const colorSchemes = {
    red: {
      bg: "#4a0e0e",      // Dark red background
      fill: "#dc2626",    // Red fill
      border: "#7f1d1d",  // Red border
      shine: "#f87171",   // Light red shine
    },
    blue: {
      bg: "#0f172a",      // Dark blue background
      fill: "#2563eb",    // Blue fill
      border: "#1e40af",  // Blue border
      shine: "#60a5fa",   // Light blue shine
    },
    green: {
      bg: "#14532d",      // Dark green background
      fill: "#16a34a",    // Green fill
      border: "#15803d",  // Green border
      shine: "#4ade80",   // Light green shine
    },
    yellow: {
      bg: "#451a03",      // Dark yellow background
      fill: "#eab308",    // Yellow fill
      border: "#a16207",  // Yellow border
      shine: "#fbbf24",   // Light yellow shine
    },
  };

  const sizes = {
    small: {
      height: "16px",
      width: "120px",
      fontSize: "10px",
    },
    medium: {
      height: "20px",
      width: "160px",
      fontSize: "12px",
    },
    large: {
      height: "32px",
      width: "300px",
      fontSize: "14px",
    },
  };

  const scheme = colorSchemes[color];
  const sizeConfig = sizes[size];

  return (
    <div className={`retro-health-container ${className}`}>
     
      
      {/* Health Bar Container */}
      <div 
        className="retro-health-bar"
        style={{
          width: sizeConfig.width,
          height: sizeConfig.height,
          background: scheme.bg,
          border: `2px solid ${scheme.border}`,
          position: "relative",
          imageRendering: "pixelated",
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.5)",
        }}
      >
        {/* Health Fill */}
        <div
          className="retro-health-fill"
          style={{
            width: `${healthPercentage}%`,
            height: "100%",
            background: `linear-gradient(to bottom, ${scheme.shine}, ${scheme.fill})`,
            transition: "width 0.3s ease-out",
            imageRendering: "pixelated",
          }}
        />
        
        {/* Pixelated Shine Effect */}
        <div
          className="retro-health-shine"
          style={{
            position: "absolute",
            top: "2px",
            left: "2px",
            width: `calc(${healthPercentage}% - 4px)`,
            height: "2px",
            background: scheme.shine,
            opacity: 0.8,
            imageRendering: "pixelated",
            transition: "width 0.3s ease-out",
          }}
        />
        
        {/* Health Text Overlay */}
        <div
          className="retro-health-text"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "white",
            fontSize: sizeConfig.fontSize,
            fontWeight: "bold",
            textShadow: "1px 1px 0 black",
            fontFamily: "monospace",
            letterSpacing: "1px",
          }}
        >
          {currentHealth}/{maxHealth}
        </div>
      </div>

       {/* Label */}
       <div className="retro-health-label game-ui-text" style={{ fontSize: sizeConfig.fontSize }}>
        {label}
      </div>
    </div>
  );
};

export default RetroHealthBar;
