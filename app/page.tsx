"use client";
import { useState, useEffect } from "react";
import Papa from "papaparse";

export default function Dashboard() {
  // Tambahan <any[]> agar TS tidak menganggap data selamanya kosong ('never')
  const [csvData, setCsvData] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState({ kode: 0, pesan: "Menunggu aliran data..." });
  // Tambahan <any> untuk menampung baris sensor
  const [sensor, setSensor] = useState<any>(null);

  // Menambahkan tipe 'React.ChangeEvent' pada parameter (e)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      // Menambahkan tipe 'any' pada results
      complete: (results: any) => setCsvData(results.data),
    });
  };

  useEffect(() => {
    // Mendeklarasikan tipe khusus untuk interval waktu
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
          console.error("Gagal terhubung ke Backend", err);
        }
        
        setCurrentIndex((prev) => prev + 1);
      }, 1000); 
    } else if (currentIndex >= csvData.length) {
      setIsRunning(false);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, currentIndex, csvData]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold border-b border-gray-700 pb-4 text-center">HMI Pemantauan Mesin Real-Time</h1>
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex items-center justify-between">
          <input type="file" accept=".csv" onChange={handleFileUpload} className="text-sm" />
          <button 
            onClick={() => setIsRunning(!isRunning)}
            disabled={csvData.length === 0}
            className={`px-6 py-2 rounded font-bold ${isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} disabled:opacity-50`}
          >
            {isRunning ? "Hentikan Simulasi" : "Mulai Simulasi"}
          </button>
        </div>

        <div className={`p-8 rounded-lg shadow-lg text-center transition-colors duration-500 ${status.kode === 1 ? 'bg-red-600 animate-pulse' : 'bg-green-600'}`}>
          <h2 className="text-2xl font-bold">STATUS MESIN</h2>
          <p className="text-4xl mt-2 font-black tracking-wider">{status.pesan.toUpperCase()}</p>
        </div>

        {sensor && (
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(sensor).map(([key, val]) => (
              <div key={key} className="bg-gray-800 p-4 rounded text-center border border-gray-700">
                <p className="text-xs text-gray-400 uppercase">{key}</p>
                <p className="text-xl font-mono mt-1">{String(val)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}