import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

const QRCodeGenerator = ({ url, color }) => {
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const effectiveUrl =
    url || (typeof window !== "undefined" ? window.location.href : "");

  const handleDownload = () => {
    const canvas = document.getElementById("qr-code");
    if (!canvas) {
      console.error("QR canvas element not found. Download aborted.");
      return;
    }
    try {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = "qr-code.png";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (err) {
      console.error("Failed to generate PNG from canvas:", err);
    }
  };

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(effectiveUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = effectiveUrl;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowQR(true)}
        className="flex items-center p-3 rounded-full text-white text-sm"
        style={{ backgroundColor: color }}
      >
        <i className="fas fa-qrcode"></i>
      </button>

      {showQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setShowQR(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <QRCodeCanvas
              id="qr-code"
              value={url}
              size={256}
              level={"H"}
              includeMargin={true}
              style={{ padding: "10px" }}
            />

            {/* URL display + copy */}
            <div className="mt-3 flex flex-col items-center space-y-2">
              <div className="flex items-center space-x-2 w-full">
                <input
                  type="text"
                  readOnly
                  value={effectiveUrl}
                  className="w-64 md:w-96 px-3 py-2 border rounded bg-gray-50 text-sm truncate"
                  title={effectiveUrl}
                />
                <button
                  onClick={handleCopy}
                  className="px-3 py-2 rounded text-sm"
                  style={{ backgroundColor: color }}
                >
                  {copied ? (
                    <span className="text-white">Copied</span>
                  ) : (
                    <i className="fas fa-copy text-white"></i>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-4 flex justify-center space-x-2">
              <button
                onClick={handleDownload}
                className="px-4 py-2 rounded text-white"
                style={{ backgroundColor: color }}
              >
                <i className="fas fa-download mr-2"></i>
                Download
              </button>
              <button
                onClick={() => setShowQR(false)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QRCodeGenerator;
