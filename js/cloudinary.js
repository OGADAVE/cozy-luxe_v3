/* ===================================================
   COZY-LUXE — CLOUDINARY UPLOAD HELPER
   ---------------------------------------------------
   Cloud name:
   vvgs8n6b

   Unsigned upload preset:
   cozy-luxe

   The upload preset MUST be configured as:

   Signing Mode:
   Unsigned

   This client-side upload flow does NOT expose a
   Cloudinary API secret.

   Cloudinary stores the actual image files.

   Firestore stores the resulting secure_url.
   =================================================== */

"use strict";


/* ===================================================
   CLOUDINARY CONFIGURATION
   =================================================== */

const CLOUDINARY_CLOUD_NAME =
  "vvgs8n6b";

const CLOUDINARY_UPLOAD_PRESET =
  "cozy-luxe";


/* ===================================================
   CLOUDINARY UPLOAD ENDPOINT
   =================================================== */

const CLOUDINARY_UPLOAD_URL =
  `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;


/* ===================================================
   UPLOAD FILE TO CLOUDINARY
   ---------------------------------------------------
   @param {File|Blob} file
   @param {string} [folder]
   @param {function} [onProgress]
   @returns {Promise<Object>}
   =================================================== */

function uploadToCloudinary(
  file,
  folder,
  onProgress
) {

  return new Promise(
    (resolve, reject) => {


      /* =================================================
         VALIDATE FILE
         ================================================= */

      if (!file) {

        reject(
          new Error(
            "Please select an image file."
          )
        );

        return;

      }


      if (
        typeof file !== "object" ||
        typeof file.size !== "number"
      ) {

        reject(
          new Error(
            "The selected file is invalid."
          )
        );

        return;

      }


      if (file.size <= 0) {

        reject(
          new Error(
            "The selected file is empty."
          )
        );

        return;

      }


      /* =================================================
         OPTIONAL FILE TYPE VALIDATION
         ================================================= */

      const fileType =
        String(file.type || "")
          .toLowerCase();


      /*
       * Allow common image formats.
       *
       * SVG is intentionally not allowed here because
       * SVG files can contain executable markup.
       */

      const allowedTypes = [

        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/avif"

      ];


      if (
        fileType &&
        !allowedTypes.includes(fileType)
      ) {

        reject(
          new Error(
            "Unsupported image format. Please use JPG, PNG, WebP, GIF, or AVIF."
          )
        );

        return;

      }


      /* =================================================
         OPTIONAL PROGRESS CALLBACK
         ================================================= */

      const progressCallback =
        typeof onProgress === "function"
          ? onProgress
          : null;


      /* =================================================
         FORM DATA
         ================================================= */

      const formData =
        new FormData();


      formData.append(
        "file",
        file
      );


      formData.append(
        "upload_preset",
        CLOUDINARY_UPLOAD_PRESET
      );


      /*
       * Only send folder if one was actually supplied.
       */

      const cleanFolder =
        String(folder || "").trim();


      if (cleanFolder) {

        formData.append(
          "folder",
          cleanFolder
        );

      }


      /* =================================================
         XHR
         ================================================= */

      const xhr =
        new XMLHttpRequest();


      xhr.open(
        "POST",
        CLOUDINARY_UPLOAD_URL,
        true
      );


      /* =================================================
         PROGRESS
         ================================================= */

      xhr.upload.onprogress =
        event => {

          if (
            progressCallback &&
            event.lengthComputable
          ) {

            const percent =
              Math.round(
                (
                  event.loaded /
                  event.total
                ) * 100
              );


            try {

              progressCallback(
                Math.min(
                  100,
                  Math.max(
                    0,
                    percent
                  )
                )
              );

            } catch (callbackError) {

              console.warn(
                "COZY-LUXE: Cloudinary progress callback failed.",
                callbackError
              );

            }

          }

        };


      /* =================================================
         REQUEST COMPLETED
         ================================================= */

      xhr.onload = () => {

        let response = null;


        try {

          response =
            JSON.parse(
              xhr.responseText || "{}"
            );

        } catch {

          reject(
            new Error(
              "Cloudinary returned an invalid response."
            )
          );

          return;

        }


        /* -----------------------------------------------
           SUCCESS
           ----------------------------------------------- */

        if (
          xhr.status >= 200 &&
          xhr.status < 300
        ) {

          /*
           * A successful Cloudinary upload should contain
           * secure_url.
           */

          if (
            !response.secure_url
          ) {

            reject(
              new Error(
                "Cloudinary upload succeeded, but no secure image URL was returned."
              )
            );

            return;

          }


          /*
           * Force 100% completion when successful.
           */

          if (progressCallback) {

            try {

              progressCallback(100);

            } catch {

              /* Ignore callback errors */

            }

          }


          resolve(
            response
          );

          return;

        }


        /* -----------------------------------------------
           CLOUDINARY ERROR
           ----------------------------------------------- */

        let errorMessage =
          "Cloudinary upload failed.";


        if (
          response &&
          response.error &&
          response.error.message
        ) {

          errorMessage =
            response.error.message;

        } else if (
          typeof response.message === "string" &&
          response.message.trim()
        ) {

          errorMessage =
            response.message.trim();

        }


        reject(
          new Error(
            errorMessage
          )
        );

      };


      /* =================================================
         NETWORK ERROR
         ================================================= */

      xhr.onerror = () => {

        reject(
          new Error(
            "Cloudinary upload failed because of a network error."
          )
        );

      };


      /* =================================================
         REQUEST ABORTED
         ================================================= */

      xhr.onabort = () => {

        reject(
          new Error(
            "Cloudinary upload was cancelled."
          )
        );

      };


      /* =================================================
         TIMEOUT
         ================================================= */

      xhr.timeout =
        120000;


      xhr.ontimeout = () => {

        reject(
          new Error(
            "Cloudinary upload timed out. Please check your internet connection and try again."
          )
        );

      };


      /* =================================================
         SEND
         ================================================= */

      try {

        xhr.send(
          formData
        );

      } catch (error) {

        reject(
          error instanceof Error
            ? error
            : new Error(
                "Could not start the Cloudinary upload."
              )
        );

      }

    }
  );

}


/* ===================================================
   CONVENIENCE HELPER
   ---------------------------------------------------
   Returns only the secure Cloudinary URL.

   Example:

   const url = await uploadImageToCloudinary(
     file,
     "products"
   );
   =================================================== */

async function uploadImageToCloudinary(
  file,
  folder,
  onProgress
) {

  const response =
    await uploadToCloudinary(
      file,
      folder,
      onProgress
    );


  return response.secure_url;

}


/* ===================================================
   OPTIONAL GLOBAL EXPORT
   =================================================== */

window.COZY_LUXE_CLOUDINARY = {

  uploadToCloudinary,

  uploadImageToCloudinary

};