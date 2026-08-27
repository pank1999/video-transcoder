"use client";

import { useState } from "react";
import { UploadCloud, FileVideo, Image as ImageIcon, CheckCircle, XCircle } from "lucide-react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<"video" | "photo">("video");
  const [resolutions, setResolutions] = useState<string[]>(["1920x1080"]);
  const [uploading, setUploading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleResolutionToggle = (res: string) => {
    if (resolutions.includes(res)) {
      setResolutions(resolutions.filter((r) => r !== res));
    } else {
      setResolutions([...resolutions, res]);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setUploading(true);
    setStatusMsg("Requesting upload URL...");

    try {
      const res = await fetch("/api/upload/url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          fileSize: file.size,
          type,
          resolutions,
        }),
      });

      const data = await res.json();

      if (res.status === 403 && data.code === "LIMIT_REACHED") {
        setShowAuthModal(true);
        setUploading(false);
        setStatusMsg("");
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to initiate upload");
      }

      setStatusMsg("Uploading file to S3...");
      const s3Res = await fetch(data.url, {
        method: "PUT",
        headers: {
          "Content-Type": type === "photo" ? "image/jpeg" : "video/mp4",
        },
        body: file,
      });

      if (!s3Res.ok) {
        throw new Error("Failed to upload file to S3");
      }

      setStatusMsg(`Upload successful! Job ID: ${data.jobId}`);
    } catch (err: any) {
      console.error(err);
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-20 px-4">
      <div className="max-w-2xl w-full text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
          Ultimate Media Transcoder
        </h1>
        <p className="text-gray-400 text-lg">
          Upload your media and automatically convert it to multiple formats instantly. 
          Free users get 3 conversions (up to 20MB each) without logging in.
        </p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 max-w-xl w-full shadow-2xl backdrop-blur-sm relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-blue-600/20 blur-[100px] rounded-full pointer-events-none" />

        <div className="flex gap-4 mb-8 justify-center">
          <button
            onClick={() => setType("video")}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
              type === "video" 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" 
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            <FileVideo size={20} /> Video
          </button>
          <button
            onClick={() => setType("photo")}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
              type === "photo" 
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30" 
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            <ImageIcon size={20} /> Photo
          </button>
        </div>

        <div 
          className="border-2 border-dashed border-gray-700 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500 hover:bg-gray-800/50 transition-colors mb-8 group"
          onClick={() => document.getElementById("file-upload")?.click()}
        >
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept={type === "video" ? "video/*" : "image/*"}
          />
          <UploadCloud size={48} className="text-gray-500 mb-4 group-hover:text-blue-400 transition-colors" />
          <p className="text-lg font-semibold text-gray-300">
            {file ? file.name : "Click to upload or drag & drop"}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Max file size: 20MB (Anonymous)
          </p>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Target Resolutions
          </h3>
          <div className="flex flex-wrap gap-2">
            {["1920x1080", "1280x720", "854x480", "640x360"].map((res) => (
              <button
                key={res}
                onClick={() => handleResolutionToggle(res)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  resolutions.includes(res)
                    ? "bg-gray-700 text-white ring-1 ring-blue-500"
                    : "bg-gray-800 text-gray-500 hover:text-gray-300"
                }`}
              >
                {res}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!file || uploading || resolutions.length === 0}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-xl shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {uploading ? "Processing..." : "Start Transcoding"}
        </button>

        {statusMsg && (
          <div className="mt-4 text-center text-sm font-medium text-blue-400">
            {statusMsg}
          </div>
        )}
      </div>

      {/* Authentication Wall Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl relative">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              <XCircle size={24} />
            </button>
            <h2 className="text-2xl font-bold text-white mb-4">You've reached your free limit!</h2>
            <p className="text-gray-400 mb-8">
              You've used up your 3 free anonymous transcodes. Please sign in or create an account to unlock more processing power.
            </p>
            <button 
              className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors mb-3"
            >
              Continue with Google
            </button>
            <button 
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-500 transition-colors"
            >
              Sign up with Email
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
