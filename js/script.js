const cartBtn = document.querySelector(".cart");
const cartContainer = document.querySelector(".cart-container");
const closeBtn = document.getElementById("close");
const cartItemsContainer = document.querySelector(".cart-items");
const adressInput = document.querySelector("#adress");
const finalizarBtn = document.querySelector("#finalizarPedido");
const adressWarning = document.querySelector("#adresswarning");

let cartItems = [];

function getCategory() {
  // Mapeamento de traduções das categorias
  const categoryTranslations = {
    hamburgers: "Hambúrgueres",
    pizzas: "Pizzas",
    hotDogs: "HotDogs",
    drinks: "Drinks",
  };

  fetch("db.json")
    .then((response) => response.json())
    .then((data) => {
      const products = data.products;
      for (let category in products) {
        const categoryDiv = document.querySelector(
          `#${category.toLowerCase()}`
        );
        if (categoryDiv) {
          // Obter a tradução ou usar o nome original
          let categoryName = categoryTranslations[category] || category;

          // Criar o título da categoria
          const categoryTitle = document.createElement("h2");
          categoryTitle.textContent = categoryName;
          categoryDiv.appendChild(categoryTitle);

          // Exibir os produtos da categoria
          displayCategoryProducts(products[category], categoryDiv);
        }
      }
    })
    .catch((error) => {
      console.error("Erro ao buscar dados:", error);
    });
}

function displayCategoryProducts(products, categoryDiv) {
  const productsContainer = document.createElement("div");
  productsContainer.classList.add("products-container");

  products.forEach((product) => {
    const productCard = createProductCard(product);
    productsContainer.appendChild(productCard);
  });

  categoryDiv.appendChild(productsContainer);
}

function createProductCard(product) {
  const productCard = document.createElement("div");
  productCard.classList.add("product-card");

  productCard.innerHTML = `
    <img src="${product.image}" alt="${product.name}" />
    <div class="card-content">
      <h3>${product.name}</h3>
      <p class="description">${product.description}</p>
      <div class="price-cart">
        <p class="price">R$ ${product.price.toFixed(2)}</p>
        <i class="fa-solid fa-cart-plus cart-item-icon"></i>
      </div>
    </div>
  `;

  const cartItemIcon = productCard.querySelector(".cart-item-icon");

  if (cartItemIcon) {
    cartItemIcon.addEventListener("click", function (event) {
      const cartItemElement = event.target.closest(".product-card");
      if (cartItemElement) {
        const name = cartItemElement.querySelector("h3").textContent;
        const price = parseFloat(
          cartItemElement
            .querySelector(".price")
            .textContent.replace("R$ ", "")
            .replace(",", ".")
        );
        addToCart(name, price);
      }
    });
  }

  return productCard;
}

getCategory();

cartBtn.addEventListener("click", () => {
  cartContainer.style.visibility = "visible";
  adressWarning.style.visibility = "hidden";
  adressInput.style.border = "var(--tertiary-color) 2px solid";

  nav.classList.remove("active");
});

closeBtn.addEventListener("click", () => {
  cartContainer.style.visibility = "hidden";
  adressWarning.style.visibility = "hidden";
  adressInput.value = "";
});

const hamburger = document.querySelector(".hamburger");
const nav = document.querySelector(".nav");

hamburger.addEventListener("click", () => nav.classList.toggle("active"));

document.querySelectorAll(".nav-list a").forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      nav.classList.remove("active");
    }
  });
});

function addToCart(name, price) {
  const productCard = Array.from(
    document.querySelectorAll(".product-card")
  ).find((card) => card.querySelector("h3").textContent === name);

  if (productCard) {
    const image = productCard.querySelector("img").src;
    const description = productCard.querySelector(".description").textContent;

    const existingItem = cartItems.find((item) => item.name === name);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cartItems.push({
        name: name,
        price: price,
        quantity: 1,
        image: image,
        description: description,
      });
    }

    updateCart();

    const isMobile = window.innerWidth <= 768;
    Toastify({
      text: `"${name}" foi adicionado ao carrinho!`,
      duration: 3000,
      gravity: "top",
      position: isMobile ? "center" : "right",
      style: {
        background: "linear-gradient(to right, #000000, #ffd700)",
      },
    }).showToast();
  } else {
    console.error("Produto não encontrado");
  }

  if (cartItems.length > 0) {
    cartBtn.classList.add("active");
  }
}

function updateCart() {
  const cartItemsContainer = document.querySelector(".cart-items");
  const totalElement = document.querySelector(".total p");

  if (!cartItemsContainer) {
    console.error("Elemento com a classe 'cart-items' não encontrado.");
    return;
  }

  cartItemsContainer.innerHTML = "";
  let total = 0;
  let totalQuantity = 0;
  cartItems.forEach((item, index) => {
    const cartItem = document.createElement("li");
    cartItem.classList.add("cart-item");
    cartItem.innerHTML = `
      <div class="cart-item-image">
        <img src="${item.image}" alt="${item.name}" />
        <p class="description">${item.description}</p>
      </div>
      <div class="info">
        <h4>${item.name}</h4>
      </div>
      <div class="price">
        <p>R$ ${item.price.toFixed(2)}</p>
        <div class="counter">
          <i class="fa-solid fa-minus"></i>
          <span>${item.quantity}</span>
          <i class="fa-solid fa-plus"></i>
        </div>
      </div>
    `;

    const minusButton = cartItem.querySelector(".fa-minus");
    const plusButton = cartItem.querySelector(".fa-plus");
    const quantitySpan = cartItem.querySelector("span");

    plusButton.addEventListener("click", () => {
      item.quantity += 1;
      quantitySpan.textContent = item.quantity;
      updateCart();
    });

    minusButton.addEventListener("click", () => {
      if (item.quantity > 1) {
        item.quantity -= 1;
        quantitySpan.textContent = item.quantity;
        updateCart();
      } else if (item.quantity === 1) {
        cartItems.splice(index, 1);
        updateCart();
      }
    });

    cartItemsContainer.appendChild(cartItem);
    total += item.price * item.quantity;
    totalQuantity += item.quantity;
  });

  totalElement.innerHTML = `Total: R$ ${total.toFixed(2)}`;

  const cartIcon = cartBtn.querySelector("i");
  const badge = cartBtn.querySelector(".badge");

  if (cartItems.length > 0) {
    cartBtn.classList.add("active");
    if (!badge) {
      const newBadge = document.createElement("span");
      newBadge.classList.add("badge");
      newBadge.textContent = totalQuantity;
      cartBtn.appendChild(newBadge);
    } else {
      badge.textContent = totalQuantity;
    }
  } else {
    cartBtn.classList.remove("active");
    if (badge) {
      badge.remove();
    }
  }
}

adressInput.addEventListener("input", (event) => {
  let inputValue = event.target.value;

  if (inputValue !== "") {
    adressWarning.style.visibility = "hidden";
    adressInput.style.border = "var(--tertiary-color) 2px solid";
  }
});

finalizarPedido.addEventListener("click", () => {
  if (cartItems.length === 0) return;

  if (adressInput.value === "") {
    adressWarning.style.visibility = "visible";
    adressInput.style.border = "2px solid red";
    return;
  }

  const items = cartItems
    .map((item) => {
      const total = item.price * item.quantity;
      return `${item.quantity}x ${item.name} - R$ ${total.toFixed(2)}`;
    })
    .join("\n");
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const message = encodeURIComponent(items);
  const phone = "+5561994057043";
  window.open(
    `https://wa.me/${phone}?text=${message}%0AEndereço: ${
      adressInput.value
    }%0ATotal: R$ ${totalPrice.toFixed(2)}`,
    "_blank"
  );

  cartItems = [];
  updateCart();
  adressInput.value = "";
});
