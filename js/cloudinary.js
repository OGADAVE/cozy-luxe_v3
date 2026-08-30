/* ===================================================
   COZY-LUXE — Cloudinary upload helper
   Cloud name: vvgs8n6b
   Unsigned upload preset: cozy-luxe
   (Preset must be set to "Unsigned" in the Cloudinary console
   for this client-side upload flow to work.)
   =================================================== */

const CLOUDINARY_CLOUD_NAME = "vvgs8n6b";
const CLOUDINARY_UPLOAD_PRESET = "cozy-luxe";

/**
 * Uploads a File/Blob straight from the browser to Cloudinary using the
 * unsigned preset above — no backend or API key needed for this call.
 * Resolves to the Cloudinary response (use .secure_url for the hosted link).
 *
 * @param {File} file
 * @param {string} [folder] optional Cloudinary folder, e.g. "proof-of-payment" or "products"
 * @param {function} [onProgress] optional (percent:number) => void
 */
function uploadToCloudinary(file, folder, onProgress){
  return new Promise((resolve, reject) => {
    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    if (folder) formData.append("folder", folder);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);

    xhr.upload.onprogress = (e) => {
      if (onProgress && e.lengthComputable){
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      try{
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) resolve(data);
        else reject(data.error ? data.error.message : "Upload failed");
      }catch(e){ reject("Upload failed — invalid response"); }
    };
    xhr.onerror = () => reject("Upload failed — network error");
    xhr.send(formData);
  });
}
