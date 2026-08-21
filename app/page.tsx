// app/page.tsx
"use client";
import { useState, useEffect } from "react";
import Papa from "papaparse";
import SensorCard from "../components/SensorCard";
import { formatSensorValue, formatLabel } from "../utils/formatter";

export default function Dashboard() {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState({ kode: 0, pesan: "Menunggu sistem..." });
  const [sensor, setSensor] = useState<any>(null);
  
  // State Tema
  const [isDarkMode, setIsDarkMode] = useState(true);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results: any) => setCsvData(results.data),
    });
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && currentIndex < csvData.length) {
      interval = setInterval(async () => {
        const row = csvData[currentIndex];
        setSensor(row);
        
        try {
          const res = await fetch("http://localhost:8000/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: row.type || 0.0,
              air_temperature: row.air_temperature || 0.0,
              process_temperature: row.process_temperature || 0.0,
              rotational_speed: row.rotational_speed || 0.0,
              torque: row.torque || 0.0,
              tool_wear: row.tool_wear || 0.0
            }) 
          });
          
          const data = await res.json();
          setStatus({ kode: data.status_kode, pesan: data.pesan });
        } catch (err) {
          console.error("Koneksi gagal", err);
        }
        
        setCurrentIndex((prev) => prev + 1);
      }, 1000); 
    } else if (currentIndex >= csvData.length) {
      setIsRunning(false);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, currentIndex, csvData]);

  return (
    <div className={`min-h-screen p-4 md:p-8 font-sans transition-colors duration-500 selection:bg-blue-500/30 
      ${isDarkMode ? 'bg-[#0B1120] text-slate-200' : 'bg-slate-50 text-slate-800'}`}>
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        
        {/* Header Panel */}
        <header className={`flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 md:pb-6 gap-6 ${isDarkMode ? 'border-slate-800' : 'border-slate-300'}`}>
          
          {/* Diubah menjadi text-left agar rapi dengan tombol di kanan */}
          <div className="w-full md:w-auto text-left">
            <h1 className={`text-xl md:text-3xl font-semibold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Industrial IIoT Dashboard
            </h1>
            <p className={`text-sm md:text-base mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Real-time CNC Machine Monitoring
            </p>
          </div>
          
          {/* justify-center diubah menjadi justify-end agar tombol rata kanan di mobile */}
          <div className="flex items-center justify-end gap-4 w-full md:w-auto">
            
            {/* Tombol Tema (SVG) */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              className={`p-2 rounded-full transition-all hover:scale-110 active:scale-95 ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-200'}`}
              title={isDarkMode ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
            >
              {isDarkMode ? (
                <svg className="w-6 h-6 text-shadow-slate-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
              ) : (
                <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                </svg>
              )}
            </button>

            {/* HARDWARE CONTROL PANEL */}
            <div className="flex items-center gap-3 py-3 rounded-lg md:w-auto">
              
              {/* Indikator Hijau (Load CSV) */}
              <div className="flex items-center gap-3">
                <label 
                  htmlFor="csv-upload" 
                  className="w-6 h-6 rounded-full bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)] cursor-pointer transition-all active:scale-90"
                  title=""
                ></label>
                <input 
                  id="csv-upload"
                  type="file" 
                  accept=".csv" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
                <span className="text-xs font-medium text-slate-400 tracking-wider"></span>
              </div>

              {/* Indikator Merah (Start/Stop) */}
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsRunning(!isRunning)}
                  disabled={csvData.length === 0}
                  className={`w-6 h-6 rounded-full transition-all active:scale-90 
                    ${csvData.length === 0 
                      ? 'bg-slate-400 cursor-not-allowed opacity-50' 
                      : isRunning 
                        ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)] animate-pulse' 
                        : 'bg-rose-900 hover:bg-rose-700 shadow-[0_0_5px_rgba(244,63,94,0.2)]' 
                    }`}
                  title=""
                ></button>
                <span className="text-xs font-medium text-slate-400 tracking-wider"></span>
              </div>

            </div>
          </div>
        </header>

        {/* Status Panel */}
        <div className={`relative overflow-hidden p-6 md:p-8 rounded-2xl border transition-all duration-700 flex flex-col items-center justify-center min-h-160px
          ${status.kode === 1 
            ? (isDarkMode ? 'bg-rose-950/20 border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.15)]' : 'bg-rose-50 border-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.15)]') 
            : (isDarkMode ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-emerald-50 border-emerald-300 shadow-sm')
          }`}>
          {status.kode === 1 && <div className="absolute inset-0 bg-rose-500/5 animate-pulse rounded-2xl" />}
          <p className={`text-xs md:text-sm font-semibold tracking-[0.2em] mb-2 ${status.kode === 1 ? (isDarkMode ? 'text-rose-400' : 'text-rose-600') : (isDarkMode ? 'text-emerald-400' : 'text-emerald-600')}`}>
            STATUS OPERASIONAL
          </p>
          <h2 className={`text-3xl md:text-5xl font-bold tracking-tight text-center ${status.kode === 1 ? 'text-rose-500' : 'text-emerald-500'}`}>
            {status.pesan}
          </h2>
        </div>

        {/* Sensor Grid */}
        {sensor && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {Object.entries(sensor).map(([key, val]) => (
              <SensorCard 
                key={key} 
                label={formatLabel(key)} 
                value={formatSensorValue(key, val as number)}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}