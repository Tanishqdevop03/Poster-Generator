# Poster-Generator
What Problem Solve by tnhis Project:
A lightweight React + Vite app that helps small local shops design promotional posters using Canvas API, Geolocation API, and Background Task Api. Easily create, preview, and export your poster in multiple formats.

Features:
Auto-location detection via Geolocation + reverse geocoding
Live poster preview using Canvas API
Offloaded image generation with Web Worker for PNG export in:
Original dimensions
WhatsApp-friendly (1080×1920)
Print-ready A4 (2480×3508)
🎯 Multiple templates selectable in-app
💾 Pure client-side: No backend needed

Project Structure : 
poster-generator/
├── public/
│   └── templates/         ←  poster background images here
├── src/
│   ├── App.jsx            ← Main React component
│   └── main.jsx           ← App entrypoint
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js

Built With :
React + Vite
Canvas API – draw poster + text
Geolocation API – auto-fill address
Web Worker(Background Task Api) – generate multiple output PNGs
Tailwind CSS – clean, responsive UI (dekstop + Mobile)
Framer Motion – canvas fade-in animation


