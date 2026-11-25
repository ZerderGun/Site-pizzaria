// FORNO NOBRE — funcionalidades do site
// IMPORTANTE: substitua pelo número da pizzaria com código do país e DDD.
// Exemplo Brasil: 5511999999999 (somente números, sem +, espaços ou traços).
const WHATSAPP_NUMBER = "5511999999999";

const pizzas = [
  { id: 1, name: "Margherita", description: "Molho de tomate, muçarela, tomate fresco e manjericão.", price: 39.90, image: "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=900&q=80" },
  { id: 2, name: "Calabresa", description: "Calabresa fatiada, muçarela, cebola e orégano.", price: 42.90, image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=900&q=80" },
  { id: 3, name: "Quatro Queijos", description: "Uma combinação cremosa de queijos e toque de orégano.", price: 46.90, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80" },
  { id: 4, name: "Portuguesa", description: "Presunto, ovo, cebola, azeitona, muçarela e ervilha.", price: 45.90, image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=900&q=80" },
  { id: 5, name: "Frango com Catupiry", description: "Frango desfiado, requeijão cremoso e muçarela.", price: 47.90, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80" },
  { id: 6, name: "Chocolate", description: "Chocolate cremoso para fechar a noite com doçura.", price: 41.90, image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=900&q=80" }
];

const cart = new Map();
const menuGrid = document.getElementById("menuGrid");
const cartPanel = document.getElementById("cartPanel");
const cartOverlay = document.getElementById("cartOverlay");
const cartItems = document.getElementById("cartItems");
const toast = document.getElementById("toast");
let toastTimer;

const money = value => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function renderMenu() {
  menuGrid.innerHTML = pizzas.map(pizza => `
    <article class="pizza-card">
      <div class="pizza-image" style="background-image:url('${pizza.image}')" role="img" aria-label="Pizza ${pizza.name}"></div>
      <div class="pizza-body">
        <h3>${pizza.name}</h3>
        <p>${pizza.description}</p>
        <div class="pizza-bottom">
          <span class="pizza-price">${money(pizza.price)}</span>
          <button class="add-button" data-add="${pizza.id}" aria-label="Adicionar ${pizza.name} ao carrinho">+ Adicionar</button>
        </div>
      </div>
    </article>`).join("");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2300);
}

function addToCart(id) {
  const pizza = pizzas.find(item => item.id === id);
  if (!pizza) return;
  cart.set(id, (cart.get(id) || 0) + 1);
  renderCart();
  showToast(`${pizza.name} adicionada ao carrinho!`);
}

function changeQuantity(id, delta) {
  const next = (cart.get(id) || 0) + delta;
  if (next <= 0) cart.delete(id); else cart.set(id, next);
  renderCart();
}

function renderCart() {
  const count = [...cart.values()].reduce((sum, quantity) => sum + quantity, 0);
  const total = [...cart.entries()].reduce((sum, [id, quantity]) => {
    const pizza = pizzas.find(item => item.id === id);
    return sum + (pizza ? pizza.price * quantity : 0);
  }, 0);
  document.getElementById("cartCount").textContent = count;
  document.getElementById("cartTotal").textContent = money(total);

  if (cart.size === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Seu carrinho está vazio. Que tal escolher uma pizza?</p>';
    return;
  }
  cartItems.innerHTML = [...cart.entries()].map(([id, quantity]) => {
    const pizza = pizzas.find(item => item.id === id);
    return `<article class="cart-item">
      <div><h3>${pizza.name}</h3><p>${money(pizza.price)} cada</p><strong>${money(pizza.price * quantity)}</strong></div>
      <div class="quantity" aria-label="Quantidade de ${pizza.name}">
        <button data-change="${id}" data-delta="-1" aria-label="Diminuir ${pizza.name}">−</button>
        <span>${quantity}</span>
        <button data-change="${id}" data-delta="1" aria-label="Aumentar ${pizza.name}">+</button>
      </div>
    </article>`;
  }).join("");
}

function openCart() {
  cartOverlay.hidden = false;
  cartPanel.classList.add("open");
  cartPanel.setAttribute("aria-hidden", "false");
  document.body.classList.add("cart-open");
  document.getElementById("closeCart").focus();
}

function closeCart() {
  cartPanel.classList.remove("open");
  cartPanel.setAttribute("aria-hidden", "true");
  cartOverlay.hidden = true;
  document.body.classList.remove("cart-open");
}

function checkoutWhatsApp() {
  if (cart.size === 0) {
    showToast("Adicione pelo menos uma pizza antes de finalizar.");
    return;
  }
  if (!/^\d{10,15}$/.test(WHATSAPP_NUMBER) || WHATSAPP_NUMBER === "5511999999999") {
    showToast("Configure o WhatsApp real no arquivo script.js.");
    return;
  }
  const lines = [...cart.entries()].map(([id, quantity]) => {
    const pizza = pizzas.find(item => item.id === id);
    return `• ${quantity}x ${pizza.name} — ${money(pizza.price * quantity)}`;
  });
  const total = [...cart.entries()].reduce((sum, [id, quantity]) => sum + pizzas.find(p => p.id === id).price * quantity, 0);
  const message = `Olá! Gostaria de fazer um pedido na Forno Nobre:\n\n${lines.join("\n")}\n\n*Total estimado: ${money(total)}*\n\nPor favor, confirmem disponibilidade, taxa de entrega e prazo. `;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
}

menuGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (button) addToCart(Number(button.dataset.add));
});
cartItems.addEventListener("click", event => {
  const button = event.target.closest("[data-change]");
  if (button) changeQuantity(Number(button.dataset.change), Number(button.dataset.delta));
});
document.getElementById("openCart").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);
document.getElementById("checkoutButton").addEventListener("click", checkoutWhatsApp);
document.getElementById("contactOrder").addEventListener("click", () => {
  if (cart.size) checkoutWhatsApp();
  else { document.getElementById("cardapio").scrollIntoView({ behavior: "smooth" }); showToast("Escolha suas pizzas no cardápio para montar o pedido."); }
});

document.getElementById("menuToggle").addEventListener("click", () => {
  const nav = document.getElementById("mainNav");
  const isOpen = nav.classList.toggle("open");
  document.getElementById("menuToggle").setAttribute("aria-expanded", String(isOpen));
  document.getElementById("menuToggle").setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
});
document.querySelectorAll(".main-nav a").forEach(link => link.addEventListener("click", () => {
  document.getElementById("mainNav").classList.remove("open");
  document.getElementById("menuToggle").setAttribute("aria-expanded", "false");
}));
document.addEventListener("keydown", event => { if (event.key === "Escape") closeCart(); });
document.getElementById("year").textContent = new Date().getFullYear();
renderMenu();
renderCart();
