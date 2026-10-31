// src/app/reliever-absen/[token]/page.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { submitRelieverAttendance } from './actions';

export default function RelieverAbsenPage({ params }: { params: Promise<{ token: string }> }) {
  const [token, setToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);

  // Ambil token dari params
  useEffect(() => {
    params.then((p) => setToken(p.token));
  }, [params]);

  // Nyalakan Kamera & Ambil Lokasi
  useEffect(() => {
    async function setupCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        setErrorMsg("Gagal mengakses kamera. Pastikan izin kamera diberikan.");
      }
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => setErrorMsg("Gagal mengambil lokasi. Pastikan GPS aktif.")
    );

    setupCamera();

    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  // Fungsi Ambil Foto
  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setPhoto(dataUrl);
      }
    }
  };

  const handleSubmit = async (action: 'IN' | 'OUT') => {
    if (!location) return setErrorMsg("Lokasi belum terdeteksi.");
    if (!photo) return setErrorMsg("Silakan ambil foto selfie terlebih dahulu.");
    
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Konversi base64 ke File
    const res = await fetch(photo);
    const blob = await res.blob();
    const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });

    const formData = new FormData();
    formData.append('lat', location.lat.toString());
    formData.append('lng', location.lng.toString());
    formData.append('selfie', file);

    try {
      await submitRelieverAttendance(token, action, formData);
      setSuccessMsg(`Berhasil Clock ${action === 'IN' ? 'In' : 'Out'}!`);
      setPhoto(null);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
        
        <div className="bg-indigo-600 p-6 text-white text-center">
          <h1 className="text-xl font-bold">Absensi Reliever</h1>
          <p className="text-indigo-200 text-sm mt-1">Ambil foto selfie & pastikan lokasi aktif.</p>
        </div>

        <div className="p-6 space-y-4">
          {errorMsg && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm">{errorMsg}</div>}
          {successMsg && <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-sm">{successMsg}</div>}

          {/* Kamera / Foto */}
          <div className="relative aspect-square bg-slate-200 rounded-2xl overflow-hidden">
            {!photo ? (
              <>
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <button onClick={takePhoto} className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full border-4 border-indigo-500 shadow-lg"></button>
              </>
            ) : (
              <>
                <img src={photo} alt="Selfie" className="w-full h-full object-cover" />
                <button onClick={() => setPhoto(null)} className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white text-sm font-bold rounded-xl shadow-lg">Ulangi Foto</button>
              </>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="text-xs text-center text-slate-500">
            Lokasi: {location ? `${location.lat}, ${location.lng}` : 'Mendeteksi...'}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <button 
              onClick={() => handleSubmit('IN')} 
              disabled={isLoading}
              className="py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 disabled:opacity-50"
            >
              {isLoading ? '...' : 'Clock In'}
            </button>
            <button 
              onClick={() => handleSubmit('OUT')} 
              disabled={isLoading}
              className="py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 disabled:opacity-50"
            >
              {isLoading ? '...' : 'Clock Out'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}