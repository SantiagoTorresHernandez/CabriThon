import React from 'react';
import svgPaths from "../imports/svg-wo6k4hq2bk";

export default function Logo() {
  return (
    <div
      className="max-w-full"
      style={{ width: "clamp(110px, 18vw, 200px)", height: "auto" }}
      data-name="Logo"
      aria-label="Geko Logo"
    >
      <svg className="block w-full h-auto" fill="none" preserveAspectRatio="xMidYMid meet" viewBox="0 0 334 113">
        <g id="Logo">
          <g id="Vector">
            <path d={svgPaths.pfa8f670} fill="#29BF12" />
            <path d={svgPaths.p195d1480} fill="#29BF12" />
            <path d={svgPaths.p55f0880} fill="#29BF12" />
            <path d={svgPaths.p30278680} fill="#29BF12" />
            <path d={svgPaths.p3dab7760} fill="url(#paint0_radial_1_16)" />
            <path d={svgPaths.p10e97d00} fill="url(#paint1_linear_1_16)" />
          </g>
        </g>
        <defs>
          <radialGradient cx="0" cy="0" gradientTransform="translate(167 10.2965) rotate(90) scale(118.41 303.237)" gradientUnits="userSpaceOnUse" id="paint0_radial_1_16" r="1">
            <stop stopColor="#FFBA49" />
            <stop offset="1" stopColor="#29BF12" />
          </radialGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_1_16" x1="55.2351" x2="55.2351" y1="82.8527" y2="111.95">
            <stop stopColor="#228A12" />
            <stop offset="1" stopColor="#29BF12" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
