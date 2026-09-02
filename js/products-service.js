/* ===================================================
   COZY-LUXE — FIRESTORE DATA SERVICE
   ---------------------------------------------------
   Handles:

   • Products
   • Product CRUD
   • Product images
   • Best seller flags
   • Collection/category images
   • Firestore → storefront synchronization

   Cloudinary stores actual image files.

   Firestore stores Cloudinary secure URLs.
   =================================================== */

"use strict";


/* ===================================================
   FIREBASE READY
   =================================================== */

function waitForFirebase(timeoutMs = 8000){

  return new Promise(resolve => {

    if(
      window.fb &&
      window.fb.db
    ){

      resolve(window.fb);
      return;

    }

    let finished = false;


    function finish(value){

      if(finished){
        return;
      }

      finished = true;
      resolve(value);

    }


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


    setTimeout(
      () => {

        finish(
          window.fb?.db
            ? window.fb
            : null
        );

      },
      timeoutMs
    );

  });

}


/* ===================================================
   PRODUCTS
   =================================================== */


/**
 * Load all products from Firestore.
 */
async function fsListProducts(){

  const fb =
    await waitForFirebase();


  if(!fb?.db){

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


/**
 * Save/update product.
 *
 * IMPORTANT:
 * merge:true prevents accidental deletion
 * of fields that may already exist in Firestore.
 */
async function fsSaveProduct(product){

  const fb =
    await waitForFirebase();


  if(!fb?.db){

    throw new Error(
      "Firebase is not available."
    );

  }


  if(
    !product ||
    !product.id
  ){

    throw new Error(
      "Product ID is required."
    );

  }


  const id =
    String(product.id);


  const productData = {

    ...product,

    id: undefined

  };


  delete productData.id;


  await fb.setDoc(

    fb.doc(
      fb.db,
      "products",
      id
    ),

    {

      ...productData,

      updatedAt:
        new Date().toISOString()

    },

    {

      merge: true

    }

  );


  return {

    id,

    ...productData

  };

}


/**
 * Delete product.
 */
async function fsDeleteProduct(id){

  const fb =
    await waitForFirebase();


  if(!fb?.db){

    throw new Error(
      "Firebase is not available."
    );

  }


  if(!id){

    throw new Error(
      "Product ID is required."
    );

  }


  await fb.deleteDoc(

    fb.doc(
      fb.db,
      "products",
      String(id)
    )

  );

}


/* ===================================================
   BEST SELLERS
   =================================================== */


/**
 * Set/unset bestseller status.
 *
 * This is useful for the admin dashboard.
 */
async function fsSetBestSeller(
  productId,
  isBestSeller
){

  const fb =
    await waitForFirebase();


  if(!fb?.db){

    throw new Error(
      "Firebase is not available."
    );

  }


  if(!productId){

    throw new Error(
      "Product ID is required."
    );

  }


  await fb.setDoc(

    fb.doc(
      fb.db,
      "products",
      String(productId)
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


/**
 * Load all collection images.
 *
 * Firestore:
 *
 * categoryImages/
 *    bedsheets
 *    complete
 *    pillows
 *    etc.
 *
 * Each document:
 *
 * {
 *   categoryId: "bedsheets",
 *   image: "https://res.cloudinary.com/...",
 *   updatedAt: "..."
 * }
 */
async function fsListCategoryImages(){

  const fb =
    await waitForFirebase();


  if(!fb?.db){

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


    if(image){

      imageMap[
        String(
          data.categoryId ||
          docSnap.id
        )
      ] = image;

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
){

  const fb =
    await waitForFirebase();


  if(!fb?.db){

    throw new Error(
      "Firebase is not available."
    );

  }


  if(!categoryId){

    throw new Error(
      "Collection category ID is required."
    );

  }


  if(!imageUrl){

    throw new Error(
      "Image URL is required."
    );

  }


  let parsedUrl;


  try{

    parsedUrl =
      new URL(
        String(imageUrl).trim()
      );

  }catch{

    throw new Error(
      "The Cloudinary image URL is invalid."
    );

  }


  if(
    parsedUrl.protocol !== "https:"
  ){

    throw new Error(
      "Only secure HTTPS image URLs are allowed."
    );

  }


  const id =
    String(categoryId);


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
){

  const fb =
    await waitForFirebase();


  if(!fb?.db){

    throw new Error(
      "Firebase is not available."
    );

  }


  if(!categoryId){

    throw new Error(
      "Collection category ID is required."
    );

  }


  await fb.deleteDoc(

    fb.doc(
      fb.db,
      "categoryImages",
      String(categoryId)
    )

  );

}


/* ===================================================
   STATIC CATALOG → FIRESTORE
   =================================================== */


/**
 * Load products from Firestore.
 *
 * If Firestore contains products:
 *     Firestore becomes the active catalog.
 *
 * If Firestore is empty/unavailable:
 *     static data.js remains active.
 */
async function initProducts(){

  try{

    const fb =
      await waitForFirebase();


    if(!fb?.db){

      console.info(
        "COZY-LUXE: Firebase unavailable. Using static catalog."
      );

      return PRODUCTS;

    }


    const firestoreProducts =
      await fsListProducts();


    /*
     * IMPORTANT:
     *
     * Only replace the static catalog if Firestore
     * actually contains products.
     *
     * This prevents an empty Firestore collection
     * from blanking the entire website.
     */
    if(
      Array.isArray(firestoreProducts) &&
      firestoreProducts.length
    ){

      PRODUCTS.length = 0;

      PRODUCTS.push(
        ...firestoreProducts
      );


      console.info(
        `COZY-LUXE: Loaded ${PRODUCTS.length} products from Firestore.`
      );

    }else{

      console.info(
        "COZY-LUXE: Firestore products collection is empty. Using static catalog."
      );

    }


  }catch(error){

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
      hero   { image: "https://res.cloudinary.com/...", updatedAt: "..." }
   =================================================== */


/**
 * Load the current homepage hero photo URL (or null if
 * none has been uploaded yet).
 */
async function fsGetHeroImage(){

  const fb =
    await waitForFirebase();


  if(!fb?.db){

    throw new Error(
      "Firebase is not available."
    );

  }


  const docSnap =
    await fb.getDocs(
      fb.collection(
        fb.db,
        "site"
      )
    );


  let image = null;


  docSnap.forEach(entry => {

    if(entry.id === "hero"){

      const data =
        entry.data() || {};

      const value =
        typeof data.image === "string"
          ? data.image.trim()
          : "";

      if(value){
        image = value;
      }

    }

  });


  return image;

}


/**
 * Save the homepage hero photo.
 */
async function fsSaveHeroImage(imageUrl){

  const fb =
    await waitForFirebase();


  if(!fb?.db){

    throw new Error(
      "Firebase is not available."
    );

  }


  if(!imageUrl){

    throw new Error(
      "Image URL is required."
    );

  }


  let parsedUrl;


  try{

    parsedUrl =
      new URL(
        String(imageUrl).trim()
      );

  }catch{

    throw new Error(
      "The Cloudinary image URL is invalid."
    );

  }


  if(parsedUrl.protocol !== "https:"){

    throw new Error(
      "Only secure HTTPS image URLs are allowed."
    );

  }


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
      {autoId}   {
        image: "https://res.cloudinary.com/...",   <- the thumbnail photo
        postUrl: "https://www.instagram.com/p/...", <- the actual IG post
        order: 0,
        updatedAt: "..."
      }

   Each gallery tile shows a photo you upload AND links out to the
   specific Instagram post you made for it — so a click opens that
   exact post, not just your profile.
   =================================================== */


/**
 * Load all gallery photos, ordered for display.
 */
async function fsListGalleryImages(){

  const fb =
    await waitForFirebase();


  if(!fb?.db){

    throw new Error(
      "Firebase is not available."
    );

  }


  const snapshot =
    await fb.getDocs(
      fb.query(
        fb.collection(
          fb.db,
          "gallery"
        ),
        fb.orderBy("order")
      )
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
 * Save (create or update) a gallery photo.
 *
 * @param {string} id        Firestore doc id for this tile
 * @param {string} imageUrl  Cloudinary thumbnail image URL
 * @param {string} postUrl   The Instagram post this tile links to
 *                           (e.g. https://www.instagram.com/p/ABC123/)
 * @param {number} order     Display order (0-based)
 */
async function fsSaveGalleryImage(id, imageUrl, postUrl, order){

  const fb =
    await waitForFirebase();


  if(!fb?.db){

    throw new Error(
      "Firebase is not available."
    );

  }


  if(!id){

    throw new Error(
      "Gallery photo ID is required."
    );

  }


  if(!imageUrl){

    throw new Error(
      "Image URL is required."
    );

  }


  const cleanPostUrl =
    String(postUrl || "").trim();


  if(
    !cleanPostUrl ||
    !/^https:\/\/(www\.)?instagram\.com\//i.test(cleanPostUrl)
  ){

    throw new Error(
      "Enter a valid Instagram post URL (e.g. https://www.instagram.com/p/ABC123/)."
    );

  }


  let parsedUrl;


  try{

    parsedUrl =
      new URL(
        String(imageUrl).trim()
      );

  }catch{

    throw new Error(
      "The Cloudinary image URL is invalid."
    );

  }


  if(parsedUrl.protocol !== "https:"){

    throw new Error(
      "Only secure HTTPS image URLs are allowed."
    );

  }


  await fb.setDoc(

    fb.doc(
      fb.db,
      "gallery",
      String(id)
    ),

    {

      image:
        parsedUrl.href,

      postUrl:
        cleanPostUrl,

      order:
        Number(order) || 0,

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
 * Delete a gallery photo record.
 */
async function fsDeleteGalleryImage(id){

  const fb =
    await waitForFirebase();


  if(!fb?.db){

    throw new Error(
      "Firebase is not available."
    );

  }


  if(!id){

    throw new Error(
      "Gallery photo ID is required."
    );

  }


  await fb.deleteDoc(

    fb.doc(
      fb.db,
      "gallery",
      String(id)
    )

  );

}


/* ===================================================
   ORDER TRACKING
   ---------------------------------------------------
   Firestore:

   orders/
      {orderCode}   { phone, status, placedOn, itemsSummary, total }

   SECURITY NOTE: order documents are keyed by their order code, and
   this looks up a single document directly by that ID (a Firestore
   "get") rather than listing the whole "orders" collection. This
   matters — the Firestore rules only allow public "get" on this
   collection, not "list", specifically so a visitor can retrieve
   the one order they already have the code for, but can never
   enumerate every customer's name, phone number and address by
   listing the collection. Do not change this back to a
   collection-wide getDocs() scan without also relaxing "list" in
   firestore.rules, which would leak every order to any visitor.

   NOTE: checkout.html does not yet write completed orders
   to Firestore — this is ready for when it does. Until
   then, every lookup returns null and track-order.html
   falls back to its WhatsApp prompt, which is expected.
   =================================================== */


/**
 * Look up an order by its code and the phone number used
 * on it. Returns null if not found, if Firebase isn't
 * configured, if the order doesn't exist, or if the phone
 * number doesn't match the one on file — callers should
 * treat null as "not found" rather than as an error.
 */
async function fsLookupOrder(orderCode, phone){

  try{

    const fb =
      await waitForFirebase();


    if(!fb?.db || !orderCode){
      return null;
    }


    if(typeof fb.getDoc !== "function"){

      console.warn(
        "COZY-LUXE: getDoc() is unavailable — check js/firebase-init.js imports getDoc."
      );

      return null;

    }


    const docSnap =
      await fb.getDoc(
        fb.doc(
          fb.db,
          "orders",
          String(orderCode).trim()
        )
      );


    if(!docSnap.exists()){
      return null;
    }


    const data =
      docSnap.data() || {};


    const normalisedPhone =
      String(phone || "")
        .replace(/\D/g, "");


    const dataPhone =
      String(data.phone || "")
        .replace(/\D/g, "");


    const phoneMatches =
      !normalisedPhone ||
      dataPhone.endsWith(
        normalisedPhone.slice(-10)
      );


    if(!phoneMatches){
      return null;
    }


    return data;

  }catch(error){

    return null;

  }

}