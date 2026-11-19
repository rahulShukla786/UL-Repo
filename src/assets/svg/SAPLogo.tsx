import React from "react";

interface SAPLogoProps {
  size?: number;
  className?: string;
}

export const SAPLogo: React.FC<SAPLogoProps> = ({ size = 28, className }) => (
  <svg
    width={size}
    height={size * 0.7}
    viewBox="0 0 100 70"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect width="100" height="70" rx="4" fill="#0072C6" />
    <text
      x="50"
      y="48"
      textAnchor="middle"
      fontFamily="Arial, sans-serif"
      fontWeight="bold"
      fontSize="32"
      fill="white"
    >
      SAP
    </text>
  </svg>
);

export default SAPLogo;
