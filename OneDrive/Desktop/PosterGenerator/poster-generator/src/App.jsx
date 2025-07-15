import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";

const TEMPLATE_OPTIONS = [
  { file: "template1.jpg.avif", colors: { text: '#000000', shadow: '#ffffff', gradient: ['#FFD700', '#FF6B35'] } },
  { file: "template2.jpg.avif", colors: { text: '#000000', shadow: '#ffffff', gradient: ['#FF6B6B', '#4ECDC4'] } },
  { file: "template3.jpg.jpg", colors: { text: '#000000', shadow: '#ffffff', gradient: ['#667eea', '#764ba2'] } },
];

const App = () => {
  const [tpl, setTpl] = useState(0);
  const [shopName, setShopName] = useState("");
  const [offer, setOffer] = useState("");
  const [address, setAddress] = useState("");
  const canvasRef = useRef(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(async (pos) => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
        );
        const data = await res.json();
        setAddress(data.display_name || "");
      } catch {
        console.warn("Reverse geocoding failed");
      }
    });
  }, []);

  const drawText = (ctx, text, x, y, maxFontSize, fillColor, shadowColor, maxWidth) => {
    let fontSize = maxFontSize;
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    
    while (ctx.measureText(text).width > maxWidth && fontSize > 20) {
      fontSize -= 2;
      ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    }
    
    ctx.fillStyle = shadowColor;
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText(text, x, y);
    
    ctx.fillStyle = fillColor;
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillText(text, x, y);
  };
  
  const drawGradientText = (ctx, text, x, y, maxFontSize, colors, maxWidth) => {
    let fontSize = maxFontSize;
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    
    while (ctx.measureText(text).width > maxWidth && fontSize > 24) {
      fontSize -= 2;
      ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    }
    
    const gradient = ctx.createLinearGradient(x - maxWidth/2, y - fontSize/2, x + maxWidth/2, y + fontSize/2);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    
    ctx.fillStyle = '#000000';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.fillText(text, x, y);
    
    ctx.fillStyle = gradient;
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillText(text, x, y);
  };

  const drawPoster = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const template = new Image();
    const currentTemplate = TEMPLATE_OPTIONS[tpl];
    template.src = `/templates/${currentTemplate.file}`;
    template.onload = () => {
      canvas.width = template.width;
      canvas.height = template.height;
      ctx.drawImage(template, 0, 0);
      
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      
      const margin = Math.min(canvas.width, canvas.height) * 0.05;
      const textWidth = canvas.width - (margin * 2);
      const baseSize = Math.min(canvas.width, canvas.height) / 20;
      
      if (shopName) {
        drawText(ctx, shopName, canvas.width / 2, canvas.height * 0.12, 
          Math.min(Math.max(baseSize * 1.5, 32), 72), 
          currentTemplate.colors.text, currentTemplate.colors.shadow, textWidth);
      }
      
      if (offer) {
        drawGradientText(ctx, offer, canvas.width / 2, canvas.height * 0.3, 
          Math.min(Math.max(baseSize * 2, 40), 96), 
          currentTemplate.colors.gradient, textWidth);
      }
      
      if (address) {
        const addressSize = Math.min(Math.max(baseSize * 0.9, 24), 36);
        ctx.font = `${addressSize}px Arial, sans-serif`;
        ctx.fillStyle = currentTemplate.colors.text;
        ctx.shadowColor = currentTemplate.colors.shadow;
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        wrapText(ctx, address, canvas.width / 2, canvas.height * 0.88, textWidth, addressSize * 1.3);
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }
    };
    template.onerror = () => {
      canvas.width = 800;
      canvas.height = 1200;
      const currentTemplate = TEMPLATE_OPTIONS[tpl];
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, currentTemplate.colors.gradient[0]);
      gradient.addColorStop(1, currentTemplate.colors.gradient[1]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      const textWidth = canvas.width * 0.9;
      
      if (shopName) drawText(ctx, shopName, canvas.width / 2, canvas.height * 0.12, 48, '#ffffff', '#000000', textWidth);
      if (offer) drawGradientText(ctx, offer, canvas.width / 2, canvas.height * 0.3, 64, ['#FFD700', '#FF6B35'], textWidth);
      if (address) {
        ctx.font = '28px Arial, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        wrapText(ctx, address, canvas.width / 2, canvas.height * 0.88, textWidth, 36);
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }
    };
  }, [tpl, shopName, offer, address]);

  useEffect(() => {
    drawPoster();
  }, [drawPoster]);

  const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
    if (!text) return;
    const words = text.split(" ");
    let line = "";
    const lines = [];
    
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      if (ctx.measureText(testLine).width > maxWidth && n > 0) {
        lines.push(line.trim());
        line = words[n] + " ";
      } else {
        line = testLine;
      }
    }
    if (line.trim()) lines.push(line.trim());
    
    if (lines.length > 3) {
      lines.splice(2, lines.length - 2, lines.slice(2).join(' ').substring(0, 50) + '...');
    }
    
    const startY = y - (lines.length * lineHeight) + lineHeight;
    lines.forEach((line, index) => {
      ctx.fillText(line, x, startY + (index * lineHeight));
    });
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement("a");
    link.download = "poster.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 text-center bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Local Store Poster Designer</h1>
        
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {TEMPLATE_OPTIONS.map((template, i) => (
            <div
              key={template.file}
              className={`w-24 sm:w-32 shrink-0 cursor-pointer border-2 rounded-xl overflow-hidden transition-all duration-200 ${tpl === i ? "border-cyan-400 shadow-lg shadow-cyan-400/25" : "border-gray-600 hover:border-gray-400"}`}
              onClick={() => setTpl(i)}
            >
              <img src={`/templates/${template.file}`} alt="template" className="w-full h-32 sm:h-40 object-cover" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="order-2 lg:order-1"
          >
            <canvas ref={canvasRef} className="w-full max-w-md mx-auto lg:max-w-none shadow-2xl rounded-2xl bg-white/10 backdrop-blur-sm" />
          </motion.div>

          <div className="space-y-4 order-1 lg:order-2">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-200">Shop Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter your shop name" 
                    value={shopName} 
                    onChange={(e) => setShopName(e.target.value)} 
                    className="w-full p-3 bg-white/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-white placeholder-gray-300 backdrop-blur-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-200">Special Offer</label>
                  <input 
                    type="text" 
                    placeholder="e.g., 50% OFF, Buy 1 Get 1 Free" 
                    value={offer} 
                    onChange={(e) => setOffer(e.target.value)} 
                    className="w-full p-3 bg-white/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-white placeholder-gray-300 backdrop-blur-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-200">Address</label>
                  <textarea 
                    placeholder="Enter your shop address" 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                    className="w-full p-3 bg-white/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent h-20 resize-none text-white placeholder-gray-300 backdrop-blur-sm" 
                  />
                </div>
                <button 
                  onClick={handleDownload} 
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white text-lg py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] font-medium"
                >
                  Generate & Download Poster
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
