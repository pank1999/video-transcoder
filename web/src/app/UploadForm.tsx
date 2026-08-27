"use client";

import { useState } from "react";
import { UploadCloud, FileVideo, Image as ImageIcon, XCircle } from "lucide-react";

const VIDEO_RES = ["1920x1080", "1280x720", "854x480", "640x360"];
const PHOTO_RES = ["Original", "Web (1920px)", "Social (1080px)", "Thumbnail (400px)"];

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<"video" | "photo">("video");
  const [resolutions, setResolutions] = useState<string[]>([VIDEO_RES[0]]);
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
    <div id="upload-section" className="bg-white border border-gray-200 rounded-2xl p-8 max-w-xl w-full shadow-sm relative overflow-hidden mx-auto mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Start your free trial</h2>

      <div className="flex gap-4 mb-8 justify-center">
        <button
          onClick={() => {
            setType("video");
            setResolutions([VIDEO_RES[0]]);
          }}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-medium transition-all ${
            type === "video" 
              ? "bg-black text-white" 
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <FileVideo size={18} /> Video
        </button>
        <button
          onClick={() => {
            setType("photo");
            setResolutions([PHOTO_RES[0]]);
          }}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-medium transition-all ${
            type === "photo" 
              ? "bg-black text-white" 
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <ImageIcon size={18} /> Photo
        </button>
      </div>

      <div 
        className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-black hover:bg-gray-100 transition-colors mb-8 group"
        onClick={() => document.getElementById("file-upload")?.click()}
      >
        <input
          id="file-upload"
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept={type === "video" ? "video/*" : "image/*"}
        />
        <UploadCloud size={40} className="text-gray-400 mb-4 group-hover:text-black transition-colors" />
        <p className="text-lg font-medium text-gray-800">
          {file ? file.name : "Click to upload or drag & drop"}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Max file size: 20MB (Anonymous limit)
        </p>
      </div>

      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
          Target Formats & Sizes
        </h3>
        <div className="flex flex-wrap gap-2">
          {(type === "video" ? VIDEO_RES : PHOTO_RES).map((res) => (
            <button
              key={res}
              onClick={() => handleResolutionToggle(res)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                resolutions.includes(res)
                  ? "bg-blue-50 text-blue-700 ring-1 ring-blue-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 ring-1 ring-transparent"
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
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {uploading ? "Processing..." : "Start Transcoding"}
      </button>

      {statusMsg && (
        <div className="mt-4 text-center text-sm font-medium text-blue-600">
          {statusMsg}
        </div>
      )}

      {/* Authentication Wall Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white border border-gray-200 p-8 rounded-2xl max-w-md w-full text-center shadow-xl relative">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900"
            >
              <XCircle size={24} />
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Free limit reached</h2>
            <p className="text-gray-600 mb-8">
              You've used up your 3 free anonymous transcodes. Please sign in or create an account to unlock more processing power.
            </p>
            <button 
              className="w-full bg-white border border-gray-300 text-gray-900 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors mb-3"
            >
              Continue with Google
            </button>
            <button 
              className="w-full bg-black text-white font-semibold py-3 rounded-xl hover:bg-gray-800 transition-colors"
            >
              Sign up with Email
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
