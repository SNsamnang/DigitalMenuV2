import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

const QRCodeGenerator = ({ url, color }) => {
  const [showQR, setShowQR] = useState(false);

  const handleDownload = () => {
    const canvas = document.getElementById("qr-code");
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = "qr-code.png";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
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
          <div className="bg-white p-4 rounded-lg shadow-lg">
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
