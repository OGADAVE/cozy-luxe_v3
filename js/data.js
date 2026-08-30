/* ===================================================
   COZY-LUXE — PRODUCT & CATEGORY DATA
   ---------------------------------------------------
   Static fallback catalog.

   Firestore is the primary source once products exist
   in the "products" collection.

   BEST SELLERS
   -------------
   Set:

       bestSeller: true

   on a product to make it appear in the homepage
   Best Sellers section.

   IMAGE
   -----
   Product images are stored in:

       image: "https://res.cloudinary.com/..."

   Collection/category images are stored separately
   in Firestore under:

       categoryImages/{categoryId}

   =================================================== */

"use strict";


/* ===================================================
   CATEGORIES
   =================================================== */

const CATEGORIES = [

  {
    id: "bedsheets",
    name: "Bedsheet Collections",
    icon: "🛏",
    swatch: "sw1"
  },

  {
    id: "complete",
    name: "Complete Bedding Collections",
    icon: "🛌",
    swatch: "sw2"
  },

  {
    id: "pillows",
    name: "Pillows",
    icon: "🧵",
    swatch: "sw3"
  },

  {
    id: "duvets",
    name: "Duvets",
    icon: "🧣",
    swatch: "sw4"
  },

  {
    id: "nightwear",
    name: "Nightwear",
    icon: "👔",
    swatch: "sw5"
  },

  {
    id: "blankets",
    name: "Blankets",
    icon: "🧶",
    swatch: "sw6"
  },

  {
    id: "fragrances",
    name: "Home Fragrances",
    icon: "🕯",
    swatch: "sw7"
  },

  {
    id: "candles",
    name: "Scented Candles",
    icon: "🕯",
    swatch: "sw8"
  },

  {
    id: "robes",
    name: "Bath Robes",
    icon: "🛍",
    swatch: "sw1"
  },

  {
    id: "stack",
    name: "Complete Royal Bedroom Upgrade (STACK VALUES 15% OFF)",
    icon: "🎁",
    swatch: "sw6"
  }

];


/* ===================================================
   STATIC PRODUCTS
   =================================================== */

let PRODUCTS = [

  /* -------------------------------------------------
     BEDSHEET COLLECTIONS
     ------------------------------------------------- */

  {
    id: "cozy-nest",
    sku: "CL-BED-001",
    name: "Cozy Nest",
    category: "bedsheets",
    variant: "4 × 6",
    includes: "1 Flat Sheet + 2 Pillowcases",
    price: 28000,
    swatch: "sw1",
    bestSeller: true,
    desc: "A soft, breathable bedsheet set woven for everyday hotel-grade comfort. Includes 1 flat sheet and 2 matching pillowcases."
  },

  {
    id: "elite",
    sku: "CL-BED-002",
    name: "Elite",
    category: "bedsheets",
    variant: "6 × 7",
    includes: "1 Flat Sheet + 4 Pillowcases",
    price: 38000,
    swatch: "sw2",
    bestSeller: true,
    desc: "Our signature Elite bedsheet — a smooth, cool-to-the-touch finish. Includes 1 flat sheet and 4 pillowcases."
  },

  {
    id: "odogwu",
    sku: "CL-BED-003",
    name: "Odogwu",
    category: "bedsheets",
    variant: "7 × 7",
    includes: "1 Flat Sheet + 4 Pillowcases",
    price: 40000,
    swatch: "sw3",
    bestSeller: true,
    desc: "A bold, statement bedsheet in a rich textured weave. Includes 1 flat sheet and 4 pillowcases."
  },


  /* -------------------------------------------------
     COMPLETE BEDDING
     ------------------------------------------------- */

  {
    id: "elite-set",
    sku: "CL-CMP-001",
    name: "Elite Set",
    category: "complete",
    variant: "6 × 7",
    includes: "1 Flat Sheet + 1 Duvet Cover + 4 Pillowcases",
    price: 130000,
    swatch: "sw4",
    bestSeller: true,
    desc: "The complete Elite experience: flat sheet, duvet cover and four pillowcases in matching premium fabric."
  },

  {
    id: "odogwu-set",
    sku: "CL-CMP-002",
    name: "Odogwu Set",
    category: "complete",
    variant: "7 × 7",
    includes: "1 Flat Sheet + 1 Duvet Cover + 4 Pillowcases",
    price: 140000,
    swatch: "sw5",
    bestSeller: false,
    desc: "The complete Odogwu experience: flat sheet, duvet cover and four pillowcases in a bold textured weave."
  },


  /* -------------------------------------------------
     PILLOWS
     ------------------------------------------------- */

  {
    id: "memory-pillow",
    sku: "CL-PIL-001",
    name: "Memory Pillow",
    category: "pillows",
    variant: null,
    includes: null,
    price: 60000,
    swatch: "sw6",
    bestSeller: true,
    desc: "Contoured memory foam pillow that adapts to your head and neck for uninterrupted sleep."
  },


  /* -------------------------------------------------
     DUVETS
     ------------------------------------------------- */

  {
    id: "duvet",
    sku: "CL-DUV-001",
    name: "Duvet",
    category: "duvets",
    variant: null,
    includes: null,
    price: 30000,
    swatch: "sw7",
    bestSeller: false,
    desc: "A plush, hypoallergenic duvet — warm without weight, finished in a soft cotton shell."
  },


  /* -------------------------------------------------
     NIGHTWEAR
     ------------------------------------------------- */

  {
    id: "female-nightwear",
    sku: "CL-NGT-001",
    name: "Female Nightwear",
    category: "nightwear",
    variant: null,
    includes: null,
    price: 28000,
    swatch: "sw8",
    bestSeller: false,
    desc: "Effortlessly elegant nightwear tailored in a soft, breathable fabric."
  },

  {
    id: "male-nightwear",
    sku: "CL-NGT-002",
    name: "Male Nightwear",
    category: "nightwear",
    variant: null,
    includes: null,
    price: 30000,
    swatch: "sw1",
    bestSeller: false,
    desc: "Refined, comfortable nightwear cut for a relaxed fit."
  },


  /* -------------------------------------------------
     BLANKETS
     ------------------------------------------------- */

  {
    id: "flower-blanket",
    sku: "CL-BLK-001",
    name: "Flower Blanket",
    category: "blankets",
    variant: null,
    includes: null,
    price: 35000,
    swatch: "sw2",
    bestSeller: false,
    desc: "An ultra-plush throw blanket in a soft floral pattern, perfect for cool evenings."
  },

  {
    id: "plain-blanket",
    sku: "CL-BLK-002",
    name: "Plain Blanket",
    category: "blankets",
    variant: null,
    includes: null,
    price: 35000,
    swatch: "sw3",
    bestSeller: false,
    desc: "An ultra-plush, understated throw blanket in a solid tone for effortless styling."
  },


  /* -------------------------------------------------
     HOME FRAGRANCE
     ------------------------------------------------- */

  {
    id: "home-fragrance",
    sku: "CL-FRG-001",
    name: "Home Fragrance",
    category: "fragrances",
    variant: null,
    includes: null,

    sizes: [
      {
        label: "200 ml",
        price: 15000,
        sku: "CL-FRG-001-200"
      },
      {
        label: "300 ml",
        price: 22500,
        sku: "CL-FRG-001-300"
      },
      {
        label: "500 ml",
        price: 55000,
        sku: "CL-FRG-001-500"
      }
    ],

    swatch: "sw4",
    bestSeller: true,

    desc: "A refined room fragrance with warm, layered notes — the finishing touch to a luxury bedroom."
  },


  /* -------------------------------------------------
     SCENTED CANDLES
     ------------------------------------------------- */

  {
    id: "scented-candle",
    sku: "CL-CND-001",
    name: "Scented Candle",
    category: "candles",
    variant: null,
    includes: null,

    sizes: [
      {
        label: "200 ml",
        price: 10000,
        sku: "CL-CND-001-200"
      },
      {
        label: "300 ml",
        price: 15000,
        sku: "CL-CND-001-300"
      }
    ],

    swatch: "sw5",
    bestSeller: false,

    desc: "Hand-poured scented candle in a reusable glass vessel, finished with gold detailing."
  },


  /* -------------------------------------------------
     ROYAL STACK
     ------------------------------------------------- */

  {
    id: "royal-stack",
    sku: "CL-STK-001",
    name: "The Royal Stack",
    category: "stack",
    variant: null,
    includes: null,
    price: null,
    swatch: "sw6",
    bestSeller: false,

    bundleItems: [

      {
        id: "odogwu-set"
      },

      {
        id: "memory-pillow"
      },

      {
        id: "female-nightwear"
      },

      {
        id: "male-nightwear"
      },

      {
        id: "home-fragrance",
        size: "300 ml"
      },

      {
        id: "scented-candle",
        size: "300 ml"
      }

    ],

    desc: "Everything you need for a complete royal bedroom refresh, stacked into one set: the Odogwu Set, Memory Pillow, nightwear for two, and matching home fragrance and candle."
  }

];


/* ===================================================
   HELPERS
   =================================================== */

function getProduct(id){

  if(!id){
    return null;
  }

  return PRODUCTS.find(
    product => String(product.id) === String(id)
  ) || null;

}


function getCategory(id){

  if(!id){
    return null;
  }

  return CATEGORIES.find(
    category => String(category.id) === String(id)
  ) || null;

}


function getProductsByCategory(categoryId){

  return PRODUCTS.filter(
    product =>
      String(product.category) === String(categoryId)
  );

}


/* ===================================================
   BEST SELLERS
   ---------------------------------------------------
   Firestore/admin controlled.
   No hardcoded product ID list.
   =================================================== */

function getBestSellers(){

  return PRODUCTS.filter(
    product => product && product.bestSeller === true
  );

}


/* ===================================================
   PRICE HELPERS
   =================================================== */

function formatNaira(value){

  const number = Number(value);

  if(!Number.isFinite(number)){
    return "₦0";
  }

  return "₦" + number.toLocaleString("en-NG");

}


function productBasePrice(product){

  if(!product){
    return null;
  }

  if(
    Array.isArray(product.sizes) &&
    product.sizes.length
  ){

    const prices = product.sizes
      .map(size => Number(size.price))
      .filter(Number.isFinite);

    return prices.length
      ? Math.min(...prices)
      : null;
  }

  return product.price === null
    ? null
    : Number(product.price);

}


function priceForSize(product, sizeLabel){

  if(!product){
    return null;
  }

  if(
    Array.isArray(product.sizes) &&
    product.sizes.length
  ){

    const match =
      product.sizes.find(
        size =>
          String(size.label) === String(sizeLabel)
      );

    return match
      ? Number(match.price)
      : productBasePrice(product);
  }

  return product.price === null
    ? null
    : Number(product.price);

}


function skuForSize(product, sizeLabel){

  if(!product){
    return "";
  }

  if(
    Array.isArray(product.sizes) &&
    product.sizes.length
  ){

    const match =
      product.sizes.find(
        size =>
          String(size.label) === String(sizeLabel)
      );

    return match
      ? match.sku
      : product.sku;
  }

  return product.sku || "";

}


/* ===================================================
   SAFE HTML
   =================================================== */

function escapeHTML(value){

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* ===================================================
   PRODUCT PRICE HTML
   =================================================== */

function priceRowHTML(product){

  if(!product){
    return "";
  }

  if(product.price === null){

    return `
      <span
        class="new"
        style="color:var(--gold-deep);"
      >
        Ask for Price
      </span>
    `;

  }


  if(
    Array.isArray(product.sizes) &&
    product.sizes.length
  ){

    return `
      <span class="new">
        From ${formatNaira(productBasePrice(product))}
      </span>
    `;

  }


  if(product.oldPrice){

    return `
      <span class="old">
        ${formatNaira(product.oldPrice)}
      </span>

      <span class="new">
        ${formatNaira(product.price)}
      </span>
    `;

  }


  return `
    <span class="new">
      ${formatNaira(product.price)}
    </span>
  `;

}


/* ===================================================
   VARIANT LABEL
   =================================================== */

function variantLabelHTML(product){

  if(!product){
    return "";
  }

  if(product.variant){
    return escapeHTML(product.variant);
  }

  if(
    Array.isArray(product.sizes) &&
    product.sizes.length
  ){

    return `${product.sizes.length} sizes`;

  }

  return "";

}


/* ===================================================
   PRODUCT PHOTO
   =================================================== */

function productPhotoHTML(
  product,
  extraClass = "product-photo"
){

  if(!product){
    return "";
  }

  const safeClass =
    String(extraClass || "product-photo")
      .replace(/[^a-zA-Z0-9_-]/g, "");


  if(product.image){

    const image =
      escapeHTML(product.image);

    const name =
      escapeHTML(product.name || "COZY-LUXE Product");

    return `
      <img
        src="${image}"
        alt="${name}"
        class="${safeClass}"
        loading="lazy"
        decoding="async"
        width="800"
        height="800"
        style="
          width:100%;
          height:100%;
          object-fit:cover;
          display:block;
        "
        onerror="
          this.onerror=null;
          this.style.display='none';
          if(this.nextElementSibling){
            this.nextElementSibling.style.display='block';
          }
        "
      >

      <div
        class="${safeClass} ${escapeHTML(product.swatch || "sw1")}"
        style="display:none;"
        aria-hidden="true"
      ></div>
    `;

  }


  return `
    <div
      class="${safeClass} ${escapeHTML(product.swatch || "sw1")}"
      aria-hidden="true"
    ></div>
  `;

}


/* ===================================================
   BUNDLE HELPERS
   =================================================== */

function resolveBundleItems(product){

  if(
    !product ||
    !Array.isArray(product.bundleItems)
  ){

    return [];

  }

  return product.bundleItems
    .map(entry => {

      const bundleProduct =
        getProduct(entry.id);

      if(!bundleProduct){
        return null;
      }

      const size =
        entry.size || null;

      return {

        product: bundleProduct,

        size,

        price:
          priceForSize(
            bundleProduct,
            size
          ),

        sku:
          skuForSize(
            bundleProduct,
            size
          )

      };

    })
    .filter(Boolean);

}


function bundleIndividualValue(product){

  return resolveBundleItems(product)
    .reduce(
      (total, item) =>
        total + (Number(item.price) || 0),
      0
    );

}