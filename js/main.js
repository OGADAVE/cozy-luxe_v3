/* ===================================================
   COZY-LUXE — SHARED SITE APPLICATION
   ---------------------------------------------------

   Handles:

   • Cart
   • Toasts
   • WhatsApp
   • Newsletter
   • Mobile menu
   • Homepage collections
   • Homepage best sellers
   • Firestore product initialization
   • Firestore collection images

   =================================================== */

"use strict";


/* ===================================================
   CONFIG
   =================================================== */

const WHATSAPP_NUMBER =
  "2347072987483";

const CART_KEY =
  "cozyluxe_cart";


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
   MOBILE MENU
   ---------------------------------------------------
   Wires up #menuToggle / #mobileNav on any page that has
   them. Opens/closes on click, closes on Escape, closes
   when a link inside the panel is tapped, closes when the
   user taps outside it, and closes automatically if the
   window is resized back past the desktop breakpoint.
   =================================================== */

function initMobileMenu(){

  const toggle =
    document.getElementById("menuToggle");

  const nav =
    document.getElementById("mobileNav");


  if(!toggle || !nav){
    return;
  }


  function closeMobileMenu(){

    nav.classList.remove("open");
    toggle.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");

  }


  function toggleMobileMenu(){

    const isOpen =
      nav.classList.toggle("open");

    toggle.classList.toggle("open", isOpen);
    toggle.setAttribute(
      "aria-expanded",
      isOpen ? "true" : "false"
    );

  }


  toggle.addEventListener(
    "click",
    event => {

      event.stopPropagation();
      toggleMobileMenu();

    }
  );


  nav
    .querySelectorAll("a")
    .forEach(link => {

      link.addEventListener(
        "click",
        closeMobileMenu
      );

    });


  document.addEventListener(
    "keydown",
    event => {

      if(event.key === "Escape"){
        closeMobileMenu();
      }

    }
  );


  document.addEventListener(
    "click",
    event => {

      const clickedInsideNav =
        nav.contains(event.target);

      const clickedToggle =
        toggle.contains(event.target);

      if(!clickedInsideNav && !clickedToggle){
        closeMobileMenu();
      }

    }
  );


  window.addEventListener(
    "resize",
    () => {

      if(window.innerWidth > 1000){
        closeMobileMenu();
      }

    }
  );

}


/* ===================================================
   CART
   =================================================== */

function getCart(){

  try{

    const raw =
      localStorage.getItem(
        CART_KEY
      );

    if(!raw){
      return [];
    }


    const cart =
      JSON.parse(raw);


    return Array.isArray(cart)
      ? cart
      : [];

  }catch(error){

    console.warn(
      "COZY-LUXE: Could not read cart.",
      error
    );

    return [];

  }

}


function saveCart(cart){

  try{

    localStorage.setItem(
      CART_KEY,
      JSON.stringify(cart)
    );

  }catch(error){

    console.warn(
      "COZY-LUXE: Could not save cart.",
      error
    );

  }


  updateCartBadge();

}


function addToCart(
  productId,
  qty = 1,
  size = null
){

  const quantity =
    Math.max(
      1,
      Number(qty) || 1
    );


  const cart =
    getCart();


  const existing =
    cart.find(
      item =>
        item.id === productId &&
        (item.size || null) ===
          (size || null)
    );


  if(existing){

    existing.qty =
      (Number(existing.qty) || 0) +
      quantity;

  }else{

    cart.push({

      id: productId,

      qty: quantity,

      size: size || null

    });

  }


  saveCart(cart);

}


function updateCartQty(
  productId,
  size,
  qty
){

  const quantity =
    Number(qty) || 0;


  if(quantity <= 0){

    removeFromCart(
      productId,
      size
    );

    return;

  }


  const cart =
    getCart();


  const item =
    cart.find(
      entry =>
        entry.id === productId &&
        (entry.size || null) ===
          (size || null)
    );


  if(item){

    item.qty = quantity;

  }


  saveCart(cart);

}


function removeFromCart(
  productId,
  size = null
){

  const cart =
    getCart().filter(
      item =>
        !(
          item.id === productId &&
          (item.size || null) ===
            (size || null)
        )
    );


  saveCart(cart);

}


function cartCount(){

  return getCart()
    .reduce(
      (total, item) =>
        total +
        (Number(item.qty) || 0),
      0
    );

}


function cartTotal(){

  return getCart()
    .reduce(
      (total, item) => {

        const product =
          typeof getProduct === "function"
            ? getProduct(item.id)
            : null;


        if(!product){
          return total;
        }


        const price =
          typeof priceForSize === "function"
            ? priceForSize(
                product,
                item.size
              )
            : null;


        if(
          price === null ||
          !Number.isFinite(
            Number(price)
          )
        ){

          return total;

        }


        return total +
          Number(price) *
          (Number(item.qty) || 0);

      },
      0
    );

}


function updateCartBadge(){

  document
    .querySelectorAll(
      ".cart-badge"
    )
    .forEach(
      element => {

        element.textContent =
          cartCount();

      }
    );

}


/* ===================================================
   TOAST
   =================================================== */

function showToast(message){

  let toast =
    document.querySelector(
      ".toast"
    );


  if(!toast){

    toast =
      document.createElement(
        "div"
      );

    toast.className =
      "toast";

    document.body.appendChild(
      toast
    );

  }


  toast.textContent =
    message;


  toast.classList.add(
    "show"
  );


  clearTimeout(
    window._cozyLuxeToastTimer
  );


  window._cozyLuxeToastTimer =
    setTimeout(
      () =>
        toast.classList.remove(
          "show"
        ),
      2600
    );

}


/* ===================================================
   WHATSAPP
   =================================================== */

function buildWhatsAppMessage({
  productName,
  sku,
  size,
  qty,
  price
}){

  const lines = [

    "Hello COZY-LUXE.",
    "",

    "I would like to order:",
    "",

    "Product:",
    `${productName}${size ? ` (${size})` : ""}`,
    "",

    "Product Code:",
    `${sku || "—"}`,
    "",

    "Quantity:",
    `${qty}`,
    "",

    "Price:",
    price === null ||
    price === undefined
      ? "Please advise"
      : formatNaira(
          Number(price) *
          Number(qty)
        ),
    "",

    "Delivery Address:",
    "____________________",
    "",

    "Full Name:",
    "____________________",
    "",

    "Phone Number:",
    "____________________",
    "",

    "Thank you."

  ];


  return encodeURIComponent(
    lines.join("\n")
  );

}


function buildWhatsAppCartMessage(){

  const cart =
    getCart();


  const lines = [

    "Hello COZY-LUXE.",
    "",

    "I would like to order:",
    ""

  ];


  cart.forEach(item => {

    const product =
      getProduct(item.id);


    if(!product){
      return;
    }


    const unitPrice =
      priceForSize(
        product,
        item.size
      );


    const sku =
      skuForSize(
        product,
        item.size
      );


    const priceText =
      unitPrice === null
        ? "Please advise"
        : formatNaira(
            unitPrice *
            item.qty
          );


    lines.push(

      `• [${sku}] ${product.name}` +
      `${item.size ? ` (${item.size})` : ""}` +
      ` ×${item.qty} — ${priceText}`

    );

  });


  lines.push(

    "",

    `Total: ${formatNaira(cartTotal())}`,

    "",

    "Delivery Address:",
    "____________________",

    "",

    "Full Name:",
    "____________________",

    "",

    "Phone Number:",
    "____________________",

    "",

    "Thank you."

  );


  return encodeURIComponent(
    lines.join("\n")
  );

}


function whatsappLink(message){

  return (
    `https://wa.me/${WHATSAPP_NUMBER}` +
    `?text=${message}`
  );

}


/* ===================================================
   HOMEPAGE COLLECTIONS
   =================================================== */

async function renderHomepageCollections(){

  const grid =
    document.getElementById(
      "homeCollectionsGrid"
    );


  if(!grid){
    return;
  }


  try{

    let categoryImages = {};


    /*
     * Load category images from Firestore.
     */
    if(
      typeof fsListCategoryImages ===
      "function"
    ){

      try{

        categoryImages =
          await fsListCategoryImages();

      }catch(error){

        console.warn(
          "COZY-LUXE: Collection images unavailable. Using fallback swatches.",
          error
        );

      }

    }


    if(
      typeof CATEGORIES ===
        "undefined" ||
      !Array.isArray(CATEGORIES)
    ){

      throw new Error(
        "CATEGORIES is unavailable."
      );

    }


    /*
     * Show the first 8 on homepage.
     *
     * The full collections page can show all.
     */
    const categories = CATEGORIES;


    grid.innerHTML =
      categories
        .map(category => {

          const id =
            String(
              category.id
            );


          const name =
            escapeHTML(
              category.name
            );


          const swatch =
            escapeHTML(
              category.swatch ||
              "sw1"
            );


          const icon =
            escapeHTML(
              category.icon ||
              ""
            );


          const image =
            categoryImages[id] ||
            "";


          /*
           * The image is placed inside the existing
           * .coll-photo container.
           *
           * object-fit: cover ensures the card is
           * filled without distortion.
           */
          const imageHTML =
            image
              ? `
                <img
                  src="${escapeHTML(image)}"
                  alt="${name}"
                  class="coll-image"
                  loading="lazy"
                  decoding="async"
                  onerror="
                    this.onerror=null;
                    this.style.display='none';
                    if(this.parentElement){
                      this.parentElement.classList.add('image-failed');
                    }
                  "
                >
              `
              : "";


          return `

            <a
              class="coll-card"
              href="collection.html?cat=${encodeURIComponent(id)}"
              aria-label="View ${name} collection"
            >

              <div
                class="coll-photo ${swatch}"
              >

                ${imageHTML}

              </div>


              <div
                class="coll-badge"
                aria-hidden="true"
              >
                ${icon}
              </div>


              <h4>
                ${name}
              </h4>

            </a>

          `;

        })
        .join("");


  }catch(error){

    console.error(
      "COZY-LUXE: Collection rendering failed.",
      error
    );


    grid.innerHTML = `

      <div
        class="error-message"
        role="alert"
      >
        Our collections are temporarily
        unavailable. Please refresh the page.
      </div>

    `;

  }

}


/* ===================================================
   HOMEPAGE BEST SELLERS
   =================================================== */

function renderHomepageBestSellers(){

  const grid =
    document.getElementById(
      "bestSellersGrid"
    );


  if(!grid){
    return;
  }


  try{

    if(
      typeof getBestSellers !==
      "function"
    ){

      throw new Error(
        "getBestSellers() is unavailable."
      );

    }


    const products =
      getBestSellers();


    if(!products.length){

      grid.innerHTML = `

        <div
          class="error-message"
          role="status"
        >
          No best-selling products are
          currently available.
        </div>

      `;

      return;

    }


    grid.innerHTML =
      products
        .map(product => {

          const productId =
            encodeURIComponent(
              product.id
            );


          const productName =
            escapeHTML(
              product.name
            );


          const variant =
            variantLabelHTML(
              product
            );


          const price =
            priceRowHTML(
              product
            );


          const photo =
            productPhotoHTML(
              product,
              "product-photo"
            );


          const saleTag =
            product.oldPrice
              ? `
                <span
                  class="tag"
                  style="
                    position:absolute;
                    top:10px;
                    left:10px;
                  "
                >
                  Sale
                </span>
              `
              : "";


          const bestSellerTag = `
            <span
              class="tag bestseller-tag"
              style="
                position:absolute;
                top:10px;
                right:10px;
              "
            >
              Best Seller
            </span>
          `;


          return `

            <div
              class="product-card"
            >

              <a
                href="product.html?id=${productId}"
                style="
                  position:relative;
                  display:block;
                "
                aria-label="View ${productName}"
              >

                ${photo}

                ${saleTag}

                ${bestSellerTag}

              </a>


              <div
                class="product-info"
              >

                <div class="pname">
                  ${productName}
                </div>


                <span
                  class="pvariant"
                >
                  ${variant}
                </span>


                <div
                  class="price-row"
                >
                  ${price}
                </div>


                <a
                  href="product.html?id=${productId}"
                  class="btn-view"
                >
                  View Details
                </a>

              </div>

            </div>

          `;

        })
        .join("");


  }catch(error){

    console.error(
      "COZY-LUXE: Best seller rendering failed.",
      error
    );


    grid.innerHTML = `

      <div
        class="error-message"
        role="alert"
      >
        We're having trouble loading our
        best-selling products.
      </div>

    `;

  }

}


/* ===================================================
   HOMEPAGE INITIALIZATION
   =================================================== */

async function initHomepage(){

  const hasHomepage =
    document.getElementById(
      "homeCollectionsGrid"
    ) ||
    document.getElementById(
      "bestSellersGrid"
    );


  if(!hasHomepage){
    return;
  }


  /*
   * First load Firestore products.
   */
  if(
    typeof initProducts ===
    "function"
  ){

    try{

      await initProducts();

    }catch(error){

      console.warn(
        "COZY-LUXE: Product initialization failed. Static catalog will be used.",
        error
      );

    }

  }


  /*
   * Render both sections.
   */
  await renderHomepageCollections();

  renderHomepageBestSellers();

}


/* ===================================================
   NEWSLETTER
   =================================================== */

function initNewsletterForms(){

  document
    .querySelectorAll(
      ".newsletter-form"
    )
    .forEach(form => {

      /*
       * Skip forms that manage themselves — e.g. index.html's
       * #newsletterForm has its own dedicated submit handler
       * with localStorage persistence and a mailto fallback.
       * Attaching this generic handler too would double-fire.
       */
      if(form.id === "newsletterForm"){
        return;
      }

      const button =
        form.querySelector(
          "button"
        );


      const input =
        form.querySelector(
          "input"
        );


      if(!button){
        return;
      }


      button.addEventListener(
        "click",
        event => {

          event.preventDefault();


          const email =
            input
              ? input.value.trim()
              : "";


          /*
           * Better email validation than
           * simply checking for "@"
           */
          const valid =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/
              .test(email);


          if(valid){

            showToast(
              "You're on the list — welcome to COZY-LUXE."
            );


            if(input){
              input.value = "";
            }

          }else{

            showToast(
              "Please enter a valid email address."
            );

          }

        }
      );

    });

}


/* ===================================================
   HEADER
   =================================================== */

function initHeader(){

  updateCartBadge();


  const header =
    document.querySelector(
      ".site-header"
    );


  if(!header){
    return;
  }


  function updateShadow(){

    header.style.boxShadow =
      window.scrollY > 10
        ? "0 2px 14px rgba(43,33,24,0.06)"
        : "none";

  }


  updateShadow();


  window.addEventListener(
    "scroll",
    updateShadow,
    {
      passive: true
    }
  );

}


/* ===================================================
   DOM READY
   =================================================== */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    initHeader();

    initMobileMenu();

    initNewsletterForms();

    await initHomepage();

  }
);