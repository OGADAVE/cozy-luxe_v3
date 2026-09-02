/* ===================================================
   COZY-LUXE — FIRESTORE DATA SERVICE
   ---------------------------------------------------
   Handles:

   • Products
   • Product CRUD
   • Product images
   • Best seller flags
   • Collection/category images
   • Homepage hero image
   • Instagram/lifestyle gallery
   • Firestore → storefront synchronization
   • Order tracking

   Cloudinary stores actual image files.
   Firestore stores Cloudinary secure URLs.

   Firestore collections:

   products/
   categoryImages/
   site/
   gallery/
   orders/

   =================================================== */

"use strict";

/* ===================================================
   FIREBASE READY
   =================================================== */

function waitForFirebase(timeoutMs = 8000) {

  return new Promise(resolve => {

    /* Firebase is already ready */
    if (
      window.fb &&
      window.fb.db
    ) {

      resolve(window.fb);
      return;

    }


    let finished = false;


    function finish(value) {

      if (finished) {
        return;
      }

      finished = true;

      resolve(value);

    }


    /* Listen for Firebase initialization */
    window.addEventListener(
      "firebase-ready",
      () => {

        finish(
          window.fb?.db
            ? window.fb
            : null
        );

      },
      {
        once: true
      }
    );


    /* Fallback timeout */
    setTimeout(() => {

      finish(
        window.fb?.db
          ? window.fb
          : null
      );

    }, timeoutMs);

  });

}


/* ===================================================
   FIRESTORE DATA CLEANER
   ---------------------------------------------------
   Firestore rejects undefined values by default.

   This helper removes undefined values before data
   is written to Firestore.
   =================================================== */

function cleanFirestoreData(value) {

  if (Array.isArray(value)) {

    return value
      .filter(item => item !== undefined)
      .map(item => cleanFirestoreData(item));

  }


  if (
    value &&
    typeof value === "object" &&
    !(value instanceof Date)
  ) {

    const cleaned = {};

    Object.entries(value).forEach(
      ([key, item]) => {

        if (item !== undefined) {

          cleaned[key] =
            cleanFirestoreData(item);

        }

      }
    );

    return cleaned;

  }


  return value;

}


/* ===================================================
   PRODUCTS
   =================================================== */


/**
 * Load all products from Firestore.
 */
async function fsListProducts() {

  const fb =
    await waitForFirebase();


  if (!fb?.db) {

    throw new Error(
      "Firebase is not available."
    );

  }


  const snapshot =
    await fb.getDocs(
      fb.collection(
        fb.db,
        "products"
      )
    );


  const products = [];


  snapshot.forEach(docSnap => {

    const data =
      docSnap.data() || {};


    products.push({

      id: docSnap.id,

      ...data

    });

  });


  return products;

}


async function fsSaveProduct(product) {

  const fb =
    await waitForFirebase();


  if (!fb?.db) {

    throw new Error(
      "Firebase is not available."
    );

  }


  if (
    !product ||
    !product.id
  ) {

    throw new Error(
      "Product ID is required."
    );

  }


  const id =
    String(product.id).trim();


  if (!id) {

    throw new Error(
      "Product ID is required."
    );

  }


  const productData = {
    ...product
  };


  /* ID is stored as the Firestore document ID,
     not duplicated inside the document. */

  delete productData.id;


  const cleanedData =
    cleanFirestoreData(productData);


  const dataToSave = {

    ...cleanedData,

    updatedAt:
      new Date().toISOString()

  };


  await fb.setDoc(

    fb.doc(
      fb.db,
      "products",
      id
    ),

    dataToSave,

    {
      merge: true
    }

  );


  return {

    id,

    ...cleanedData

  };

}


/**
 * Delete product.
 */
async function fsDeleteProduct(id) {

  const fb =
    await waitForFirebase();


  if (!fb?.db) {

    throw new Error(
      "Firebase is not available."
    );

  }


  if (!id) {

    throw new Error(
      "Product ID is required."
    );

  }


  await fb.deleteDoc(

    fb.doc(
      fb.db,
      "products",
      String(id).trim()
    )

  );

}


/* ===================================================
   BEST SELLERS
   =================================================== */


/**
 * Set or unset bestseller status.
 */
async function fsSetBestSeller(
  productId,
  isBestSeller
) {

  const fb =
    await waitForFirebase();


  if (!fb?.db) {

    throw new Error(
      "Firebase is not available."
    );

  }


  if (!productId) {

    throw new Error(
      "Product ID is required."
    );

  }


  const id =
    String(productId).trim();


  await fb.setDoc(

    fb.doc(
      fb.db,
      "products",
      id
    ),

    {

      bestSeller:
        Boolean(isBestSeller),

      updatedAt:
        new Date().toISOString()

    },

    {
      merge: true
    }

  );


  return true;

}


/* ===================================================
   CATEGORY / COLLECTION IMAGES
   =================================================== */

async function fsListCategoryImages() {

  const fb =
    await waitForFirebase();


  if (!fb?.db) {

    throw new Error(
      "Firebase is not available."
    );

  }


  const snapshot =
    await fb.getDocs(

      fb.collection(
        fb.db,
        "categoryImages"
      )

    );


  const imageMap = {};


  snapshot.forEach(docSnap => {

    const data =
      docSnap.data() || {};


    const image =
      typeof data.image === "string"
        ? data.image.trim()
        : "";


    if (!image) {
      return;
    }


    const categoryId =
      String(
        data.categoryId ||
        docSnap.id
      ).trim();


    if (categoryId) {

      imageMap[categoryId] =
        image;

    }

  });


  return imageMap;

}


/**
 * Save collection/category image.
 */
async function fsSaveCategoryImage(
  categoryId,
  imageUrl
) {

  const fb =
    await waitForFirebase();


  if (!fb?.db) {

    throw new Error(
      "Firebase is not available."
    );

  }


  if (!categoryId) {

    throw new Error(
      "Collection category ID is required."
    );

  }


  if (!imageUrl) {

    throw new Error(
      "Image URL is required."
    );

  }


  const id =
    String(categoryId).trim();


  if (!id) {

    throw new Error(
      "Collection category ID is required."
    );

  }


  const parsedUrl =
    validateHttpsUrl(
      imageUrl,
      "The Cloudinary image URL is invalid."
    );


  await fb.setDoc(

    fb.doc(
      fb.db,
      "categoryImages",
      id
    ),

    {

      categoryId: id,

      image:
        parsedUrl.href,

      updatedAt:
        new Date().toISOString()

    },

    {
      merge: true
    }

  );


  return parsedUrl.href;

}


/**
 * Delete category image record.
 */
async function fsDeleteCategoryImage(
  categoryId
) {

  const fb =
    await waitForFirebase();


  if (!fb?.db) {

    throw new Error(
      "Firebase is not available."
    );

  }


  if (!categoryId) {

    throw new Error(
      "Collection category ID is required."
    );

  }


  await fb.deleteDoc(

    fb.doc(
      fb.db,
      "categoryImages",
      String(categoryId).trim()
    )

  );

}


/* ===================================================
   URL VALIDATION
   =================================================== */

function validateHttpsUrl(
  value,
  errorMessage = "Invalid HTTPS URL."
) {

  let parsedUrl;


  try {

    parsedUrl =
      new URL(
        String(value).trim()
      );

  } catch {

    throw new Error(
      errorMessage
    );

  }


  if (
    parsedUrl.protocol !== "https:"
  ) {

    throw new Error(
      "Only secure HTTPS image URLs are allowed."
    );

  }


  return parsedUrl;

}


/* ===================================================
   STATIC CATALOG → FIRESTORE
   =================================================== */

async function initProducts() {

  try {

    const fb =
      await waitForFirebase();


    if (!fb?.db) {

      console.info(
        "COZY-LUXE: Firebase unavailable. Using static catalog."
      );

      return PRODUCTS;

    }


    const firestoreProducts =
      await fsListProducts();


    if (
      Array.isArray(firestoreProducts) &&
      firestoreProducts.length > 0
    ) {

      PRODUCTS.length = 0;

      PRODUCTS.push(
        ...firestoreProducts
      );


      console.info(
        `COZY-LUXE: Loaded ${PRODUCTS.length} products from Firestore.`
      );

    } else {

      console.info(
        "COZY-LUXE: Firestore products collection is empty. Using static catalog."
      );

    }

  } catch (error) {

    console.warn(

      "COZY-LUXE: Could not load products from Firestore. Using static catalog.",

      error

    );

  }


  return PRODUCTS;

}


/* ===================================================
   HOMEPAGE HERO PHOTO
   ---------------------------------------------------
   Firestore:

   site/
      hero {
        image: "https://res.cloudinary.com/...",
        updatedAt: "..."
      }
   =================================================== */

async function fsGetHeroImage() {

  const fb =
    await waitForFirebase();


  if (!fb?.db) {

    throw new Error(
      "Firebase is not available."
    );

  }


  const heroRef =
    fb.doc(
      fb.db,
      "site",
      "hero"
    );


  const docSnap =
    await fb.getDoc(heroRef);


  if (!docSnap.exists()) {

    return null;

  }


  const data =
    docSnap.data() || {};


  const image =
    typeof data.image === "string"
      ? data.image.trim()
      : "";


  return image || null;

}


/**
 * Save homepage hero photo.
 */
async function fsSaveHeroImage(
  imageUrl
) {

  const fb =
    await waitForFirebase();


  if (!fb?.db) {

    throw new Error(
      "Firebase is not available."
    );

  }


  if (!imageUrl) {

    throw new Error(
      "Image URL is required."
    );

  }


  const parsedUrl =
    validateHttpsUrl(
      imageUrl,
      "The Cloudinary image URL is invalid."
    );


  await fb.setDoc(

    fb.doc(
      fb.db,
      "site",
      "hero"
    ),

    {

      image:
        parsedUrl.href,

      updatedAt:
        new Date().toISOString()

    },

    {
      merge: true
    }

  );


  return parsedUrl.href;

}


/* ===================================================
   INSTAGRAM / LIFESTYLE GALLERY
   ---------------------------------------------------
   Firestore:

   gallery/
      {documentId} {
        image: "https://res.cloudinary.com/...",
        postUrl: "https://www.instagram.com/p/ABC123/",
        order: 0,
        updatedAt: "..."
      }
   =================================================== */


/**
 * Validate Instagram post URL.
 */
function validateInstagramPostUrl(
  postUrl
) {

  const value =
    String(postUrl || "").trim();


  if (!value) {

    throw new Error(
      "Instagram post URL is required."
    );

  }


  let parsedUrl;


  try {

    parsedUrl =
      new URL(value);

  } catch {

    throw new Error(
      "Enter a valid Instagram post URL."
    );

  }


  const hostname =
    parsedUrl.hostname
      .toLowerCase()
      .replace(/^www\./, "");


  if (
    hostname !== "instagram.com"
  ) {

    throw new Error(
      "Enter a valid Instagram URL."
    );

  }


  /*
   * Accepts:
   *
   * https://www.instagram.com/p/ABC123/
   * https://instagram.com/p/ABC123/
   *
   * Also allows /reel/ and /tv/.
   */
  const validPath =
    /^\/(p|reel|tv)\/[^/?#]+/i.test(
      parsedUrl.pathname
    );


  if (!validPath) {

    throw new Error(
      "Enter a valid Instagram post, reel, or video URL."
    );

  }


  return parsedUrl.href;

}


/**
 * Load all gallery photos.
 *
 * Gallery items are ordered by the "order" field.
 */
async function fsListGalleryImages() {

  const fb =
    await waitForFirebase();


  if (!fb?.db) {

    throw new Error(
      "Firebase is not available."
    );

  }


  const galleryRef =
    fb.collection(
      fb.db,
      "gallery"
    );


  const orderedQuery =
    fb.query(
      galleryRef,
      fb.orderBy("order")
    );


  const snapshot =
    await fb.getDocs(
      orderedQuery
    );


  const images = [];


  snapshot.forEach(docSnap => {

    images.push({

      id: docSnap.id,

      ...(docSnap.data() || {})

    });

  });


  return images;

}


/**
 * Save or update a gallery photo.
 *
 * @param {string} id
 * @param {string} imageUrl
 * @param {string} postUrl
 * @param {number} order
 */
async function fsSaveGalleryImage(
  id,
  imageUrl,
  postUrl,
  order
) {

  const fb =
    await waitForFirebase();


  if (!fb?.db) {

    throw new Error(
      "Firebase is not available."
    );

  }


  if (!id) {

    throw new Error(
      "Gallery photo ID is required."
    );

  }


  if (!imageUrl) {

    throw new Error(
      "Image URL is required."
    );

  }


  const galleryId =
    String(id).trim();


  if (!galleryId) {

    throw new Error(
      "Gallery photo ID is required."
    );

  }


  const parsedImageUrl =
    validateHttpsUrl(
      imageUrl,
      "The Cloudinary image URL is invalid."
    );


  const cleanPostUrl =
    validateInstagramPostUrl(
      postUrl
    );


  let displayOrder =
    Number(order);


  if (!Number.isFinite(displayOrder)) {

    displayOrder = 0;

  }


  displayOrder =
    Math.max(
      0,
      Math.floor(displayOrder)
    );


  await fb.setDoc(

    fb.doc(
      fb.db,
      "gallery",
      galleryId
    ),

    {

      image:
        parsedImageUrl.href,

      postUrl:
        cleanPostUrl,

      order:
        displayOrder,

      updatedAt:
        new Date().toISOString()

    },

    {
      merge: true
    }

  );


  return parsedImageUrl.href;

}


/**
 * Delete gallery photo record.
 */
async function fsDeleteGalleryImage(
  id
) {

  const fb =
    await waitForFirebase();


  if (!fb?.db) {

    throw new Error(
      "Firebase is not available."
    );

  }


  if (!id) {

    throw new Error(
      "Gallery photo ID is required."
    );

  }


  await fb.deleteDoc(

    fb.doc(
      fb.db,
      "gallery",
      String(id).trim()
    )

  );

}


/* ===================================================
   ORDER TRACKING
   ---------------------------------------------------
   Firestore:

   orders/
      {orderCode} {
        phone,
        status,
        placedOn,
        itemsSummary,
        total
      }
        =================================================== */

async function fsLookupOrder(
  orderCode,
  phone
) {

  try {

    const fb =
      await waitForFirebase();


    if (
      !fb?.db ||
      !orderCode
    ) {

      return null;

    }


    if (
      typeof fb.getDoc !== "function"
    ) {

      console.warn(
        "COZY-LUXE: getDoc() is unavailable. Check firebase-init.js."
      );

      return null;

    }


    const cleanOrderCode =
      String(orderCode).trim();


    if (!cleanOrderCode) {

      return null;

    }


    const orderRef =
      fb.doc(
        fb.db,
        "orders",
        cleanOrderCode
      );


    const docSnap =
      await fb.getDoc(
        orderRef
      );


    if (!docSnap.exists()) {

      return null;

    }


    const data =
      docSnap.data() || {};


    /*
     * Normalize phone numbers.
     *
     * Example:
     *
     * 08012345678
     * +2348012345678
     *
     * Both can be compared using the last 10 digits.
     */

    const normalisedPhone =
      String(phone || "")
        .replace(/\D/g, "");


    const dataPhone =
      String(data.phone || "")
        .replace(/\D/g, "");


    /*
     * If no phone was supplied, do not expose
     * the order.
     */
    if (!normalisedPhone) {

      return null;

    }


    const lookupLast10 =
      normalisedPhone.slice(-10);


    const storedLast10 =
      dataPhone.slice(-10);


    const phoneMatches =
      lookupLast10.length === 10 &&
      storedLast10.length === 10 &&
      lookupLast10 === storedLast10;


    if (!phoneMatches) {

      return null;

    }


    return {

      id: docSnap.id,

      ...data

    };

  } catch (error) {

    /*
     * Deliberately return null.

     * The track-order page should treat permission
     * failures / missing documents as "not found"
     * rather than exposing Firestore internals.
     */

    console.warn(
      "COZY-LUXE: Order lookup failed.",
      error
    );

    return null;

  }

}


/* ===================================================
   OPTIONAL GLOBAL EXPORT
   ---------------------------------------------------
   These functions are already global because this is
   a normal script rather than a module.

   The explicit object below makes debugging easier.
   =================================================== */

window.COZY_LUXE_FIRESTORE = {

  waitForFirebase,

  fsListProducts,
  fsSaveProduct,
  fsDeleteProduct,

  fsSetBestSeller,

  fsListCategoryImages,
  fsSaveCategoryImage,
  fsDeleteCategoryImage,

  fsGetHeroImage,
  fsSaveHeroImage,

  fsListGalleryImages,
  fsSaveGalleryImage,
  fsDeleteGalleryImage,

  fsLookupOrder,

  initProducts

};