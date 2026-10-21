import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCheck,
  ChevronDown,
  Copy,
  Heart,
  Menu,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Star,
  Trash2,
  X,
} from "lucide-react";

type Product = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  price: number;
  image: string;
  category: "sweet" | "savory";
  note: string;
  ingredients: string;
};

const products: Product[] = [
  {
    id: "original",
    name: "Original Vanilla",
    subtitle: "The little classic that started it all.",
    description:
      "Golden, delicately crisp crackers meet a generous layer of silky vanilla custard. Familiar, comforting, and impossible to stop at one.",
    price: 25000,
    image: "/images/gabin-original.jpg",
    category: "sweet",
    note: "Umi's favorite",
    ingredients:
      "Cream crackers, milk, butter, flour, sugar, eggs, and vanilla.",
  },
  {
    id: "chocolate",
    name: "Chocolate Bliss",
    subtitle: "For your very important chocolate break.",
    description:
      "Our signature golden crunch, filled with smooth, rich chocolate custard. A little indulgence that makes an ordinary afternoon feel special.",
    price: 28000,
    image: "/images/gabin-chocolate.jpg",
    category: "sweet",
    note: "A little indulgence",
    ingredients:
      "Cream crackers, milk, cocoa, chocolate, butter, flour, sugar, and eggs.",
  },
  {
    id: "cheese",
    name: "Creamy Cheese",
    subtitle: "A little sweet. A little savory. All love.",
    description:
      "Creamy, gently savory cheese tucked between two perfectly golden crackers. The sweet-salty little bite you never knew you needed.",
    price: 28000,
    image: "/images/gabin-cheese.jpg",
    category: "savory",
    note: "Sweet meets savory",
    ingredients:
      "Cream crackers, milk, cheddar cheese, butter, flour, sugar, and eggs.",
  },
];

const bundles = [
  {
    id: "box-6",
    name: "A Little Happiness",
    count: 6,
    description: "6 Original Vanilla gabin",
    price: 25000,
    saving: 0,
    tag: "Just for you",
  },
  {
    id: "box-12",
    name: "Better Together",
    count: 12,
    description: "6 Original Vanilla + 6 Chocolate Bliss",
    price: 49000,
    saving: 4000,
    tag: "The sharing favorite",
  },
  {
    id: "box-24",
    name: "The Happy Gathering",
    count: 24,
    description: "8 of each of our three lovely flavors",
    price: 99000,
    saving: 9000,
    tag: "More to go around",
  },
];

const catalog = [
  ...products.map((p) => ({ ...p, size: "6 pieces" })),
  ...bundles.map((b) => ({
    id: b.id,
    name: b.name,
    price: b.price,
    image:
      b.id === "box-6"
        ? products[0].image
        : b.id === "box-12"
          ? products[1].image
          : products[2].image,
    size: `${b.count} pieces - ${b.id === "box-6" ? "Original" : "Mixed flavors"}`,
  })),
];

const faqs = [
  {
    question: "What exactly is gabin?",
    answer:
      "Think of your favorite golden, crispy cracker, with a lovely layer of creamy filling tucked inside. Gabin is a much-loved Indonesian snack, and ours is made in small batches with a little extra love. A perfect companion for tea, coffee, or a well-earned break.",
  },
  {
    question: "How do I place an order?",
    answer:
      "Pick a flavor or a sharing box, add it to your bag, and prepare your order request. You can then share it with Warung Umi through WhatsApp. Umi will confirm availability, your total including any delivery fee, and payment details before your order is final.",
  },
  {
    question: "Can I mix and match my flavors?",
    answer:
      "Of course. Add different flavor packs to your bag, or choose a Better Together or Happy Gathering box for a ready-made mix. Have a special combination in mind? Leave a note in your order request and Umi will let you know what is possible.",
  },
  {
    question: "How should I store my gabin?",
    answer:
      "Gabin is at its crispy, creamy best when enjoyed fresh. Because our fillings contain dairy and eggs, do not leave them at room temperature for extended periods. Ask Umi for the storage instructions and best-before guidance for your specific batch when you order.",
  },
  {
    question: "Do you offer delivery or pickup?",
    answer:
      "You can request either delivery or pickup at checkout. Delivery coverage, fees, and collection times are confirmed directly by Umi on WhatsApp. Share your location so we can find the best way to get your little box of happiness to you.",
  },
  {
    question: "What about ingredients and allergens?",
    answer:
      "Our gabin contains wheat, milk, and eggs. Chocolate may also contain soy, and all flavors are prepared in a shared kitchen. If you have an allergy or dietary requirement, please check directly with Umi before ordering. We cannot guarantee an allergen-free environment.",
  },
];

const money = (amount: number) =>
  `Rp${new Intl.NumberFormat("id-ID").format(amount)}`;
const merchantWhatsApp = (import.meta.env.VITE_ORDER_WHATSAPP || "").replace(
  /\D/g,
  "",
);
type Cart = Record<string, number>;
type ModalState =
  | { type: "cart" }
  | { type: "product"; id: string }
  | { type: "checkout" }
  | null;

function Spark({
  className = "",
  size = 24,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M20 1C22.3 13.2 26.8 17.7 39 20C26.8 22.3 22.3 26.8 20 39C17.7 26.8 13.2 22.3 1 20C13.2 17.7 17.7 13.2 20 1Z"
        fill="currentColor"
      />
    </svg>
  );
}

function Logo({ light = false }: { light?: boolean }) {
  return (
    <a
      className={`brand ${light ? "brand-light" : ""}`}
      href="#home"
      aria-label="Gabin Warung Umi home"
    >
      <span className="brand-word">
        gabin
        <Spark size={15} />
      </span>
      <span className="brand-caption">WARUNG UMI</span>
    </a>
  );
}

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Modal({
  children,
  title,
  onClose,
  drawer = false,
  returnFocus,
}: {
  children: ReactNode;
  title: string;
  onClose: () => void;
  drawer?: boolean;
  returnFocus?: HTMLElement | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const reduced = useReducedMotion();
  useEffect(() => {
    const previousFocus =
      returnFocus || (document.activeElement as HTMLElement | null);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(
      () =>
        ref.current
          ?.querySelector<HTMLElement>(
            "[data-autofocus], button, input, a[href]",
          )
          ?.focus(),
      50,
    );
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRef.current();
      if (event.key !== "Tab" || !ref.current) return;
      const focusable = Array.from(
        ref.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select, textarea, [tabindex="0"]',
        ),
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
      window.requestAnimationFrame(() => previousFocus?.focus());
    };
  }, []);
  return (
    <motion.div
      className={`modal-backdrop ${drawer ? "drawer-backdrop" : ""}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.div
        ref={ref}
        className={`modal-panel ${drawer ? "cart-panel" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        initial={
          reduced
            ? false
            : drawer
              ? { x: "100%" }
              : { opacity: 0, y: 25, scale: 0.98 }
        }
        animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
        exit={
          reduced ? undefined : drawer ? { x: "100%" } : { opacity: 0, y: 15 }
        }
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
      >
        <button
          className="icon-button modal-close"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <X size={21} />
        </button>
        {children}
      </motion.div>
    </motion.div>
  );
}

function App() {
  const [cart, setCart] = useState<Cart>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("gabin-bag") || "{}");
      return Object.fromEntries(
        Object.entries(saved).filter(
          ([id, quantity]) =>
            catalog.some((p) => p.id === id) &&
            typeof quantity === "number" &&
            Number.isInteger(quantity) &&
            quantity > 0 &&
            quantity <= 99,
        ),
      ) as Cart;
    } catch {
      return {};
    }
  });
  const [modal, setModal] = useState<ModalState>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [selectedBundle, setSelectedBundle] = useState("box-12");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [toast, setToast] = useState("");
  const [preparedOrder, setPreparedOrder] = useState<{
    text: string;
    reference: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [delivery, setDelivery] = useState("delivery");
  const [orderDraft, setOrderDraft] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
  });
  const [isScrolled, setIsScrolled] = useState(false);
  const checkoutId = useId();
  const reduced = useReducedMotion();
  const toastTimer = useRef<number | undefined>(undefined);
  const lastPageFocus = useRef<HTMLElement | null>(null);
  const cartEntries = Object.entries(cart)
    .map(([id, quantity]) => ({
      product: catalog.find((p) => p.id === id)!,
      quantity,
    }))
    .filter((item) => item.product);
  const cartCount = cartEntries.reduce((sum, item) => sum + item.quantity, 0);
  const total = cartEntries.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const activeProduct =
    modal?.type === "product" ? products.find((p) => p.id === modal.id) : null;

  useEffect(() => {
    try {
      localStorage.setItem("gabin-bag", JSON.stringify(cart));
    } catch {
      /* The bag still works when browser storage is unavailable. */
    }
  }, [cart]);
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(toastTimer.current);
    };
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);
  useEffect(() => {
    if (!preparedOrder) return;
    document.querySelector<HTMLElement>(".order-prepared h2")?.focus();
    document.querySelector(".modal-panel")?.scrollTo({ top: 0 });
  }, [preparedOrder]);

  const notify = (message: string) => {
    window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(""), 3500);
  };
  const addToCart = (id: string) => {
    if ((cart[id] || 0) >= 99) {
      notify("A big celebration? Please ask Umi about larger orders.");
      return;
    }
    setCart((current) => ({
      ...current,
      [id]: Math.min((current[id] || 0) + 1, 99),
    }));
    notify(`${catalog.find((p) => p.id === id)?.name} added to your bag`);
  };
  const changeQuantity = (id: string, change: number) => {
    setCart((current) => {
      const next = { ...current };
      const quantity = Math.min((next[id] || 0) + change, 99);
      if (quantity <= 0) delete next[id];
      else next[id] = quantity;
      return next;
    });
  };
  const openCart = () => {
    setMenuOpen(false);
    setModal({ type: "cart" });
  };
  const closeModal = () => setModal(null);
  const navigate = () => setMenuOpen(false);
  const beginCheckout = () => {
    setPreparedOrder(null);
    setCopied(false);
    setModal({ type: "checkout" });
  };
  const prepareOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!cartEntries.length) {
      setModal({ type: "cart" });
      return;
    }
    const form = new FormData(event.currentTarget);
    const reference = `GU-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const text = [
      "Hi Umi! I would love to order some gabin.",
      `Order request: ${reference}`,
      "",
      ...cartEntries.map(
        ({ product, quantity }) =>
          `${quantity} x ${product.name} (${product.size}) - ${money(product.price * quantity)}`,
      ),
      "",
      `Product subtotal: ${money(total)}`,
      "Delivery fees, availability, and payment to be confirmed.",
      "",
      `Name: ${String(form.get("name")).trim()}`,
      `WhatsApp: ${String(form.get("phone")).trim()}`,
      `Fulfillment: ${delivery === "delivery" ? "Delivery" : "Pickup"}`,
      delivery === "delivery"
        ? `Address: ${String(form.get("address")).trim()}`
        : "Please let me know the pickup location and available times.",
      form.get("note") ? `Note: ${String(form.get("note")).trim()}` : "",
      "",
      "Please confirm my order. Thank you!",
    ].join("\n");
    setPreparedOrder({ text, reference });
  };
  const copyOrder = async () => {
    if (!preparedOrder) return;
    try {
      await navigator.clipboard.writeText(preparedOrder.text);
      setCopied(true);
    } catch {
      notify("Please select and copy the order summary below.");
    }
  };

  return (
    <>
      <div
        inert={!!modal}
        onFocusCapture={(event) => {
          lastPageFocus.current = event.target as HTMLElement;
        }}
      >
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <header className={`site-header ${isScrolled ? "is-scrolled" : ""}`}>
          <div className="nav-shell page-width">
            <Logo />
            <nav className="desktop-nav" aria-label="Main navigation">
              <a href="#flavors">Our flavors</a>
              <a href="#story">The Umi story</a>
              <a href="#love-notes">Love notes</a>
              <a href="#faq">A few FAQs</a>
            </nav>
            <div className="nav-actions">
              <button
                className="bag-button"
                onClick={openCart}
                aria-label={`Open shopping bag, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}
              >
                <ShoppingBag size={20} strokeWidth={1.6} />
                <span className="bag-label">Your bag</span>
                <span className="bag-count" key={cartCount}>
                  {cartCount}
                </span>
              </button>
              <a className="button button-small nav-order" href="#flavors">
                Let's snack <ArrowUpRight size={16} />
              </a>
              <button
                className="icon-button menu-toggle"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                aria-controls="mobile-navigation"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
          <AnimatePresence>
            {menuOpen && (
              <motion.nav
                id="mobile-navigation"
                className="mobile-nav"
                aria-label="Mobile navigation"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <a href="#flavors" onClick={navigate}>
                  Our flavors <ArrowUpRight size={18} />
                </a>
                <a href="#story" onClick={navigate}>
                  The Umi story <ArrowUpRight size={18} />
                </a>
                <a href="#love-notes" onClick={navigate}>
                  Love notes <ArrowUpRight size={18} />
                </a>
                <a href="#faq" onClick={navigate}>
                  A few FAQs <ArrowUpRight size={18} />
                </a>
              </motion.nav>
            )}
          </AnimatePresence>
        </header>

        <main id="main">
          <section className="hero" id="home" aria-labelledby="hero-heading">
            <motion.img
              className="hero-image"
              src="/images/gabin-hero.jpg"
              alt="Golden, crispy gabin with creamy vanilla filling on a deep plum ceramic plate"
              fetchPriority="high"
              initial={reduced ? false : { scale: 1.055 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
            />
            <div className="hero-image-wash" />
            <div className="page-width hero-content">
              <motion.div
                className="hero-copy"
                initial={reduced ? false : "hidden"}
                animate="visible"
                variants={{
                  hidden: {},
                  visible: {
                    transition: { staggerChildren: reduced ? 0 : 0.12 },
                  },
                }}
              >
                <motion.p
                  className="eyebrow hero-eyebrow"
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <Spark size={16} /> A LITTLE HOMEMADE HAPPINESS
                </motion.p>
                <motion.h1
                  id="hero-heading"
                  variants={{
                    hidden: { opacity: 0, y: 22 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.8 },
                    },
                  }}
                >
                  <span className="hero-brand">Gabin.</span>
                  <span>Little bites,</span>
                  <em>big happiness.</em>
                </motion.h1>
                <motion.p
                  className="hero-description"
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  Golden, crispy, and filled with the good stuff.
                  <br className="desktop-break" /> Homemade by Umi. Made to make
                  your day.
                </motion.p>
                <motion.div
                  className="hero-actions"
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <a className="button" href="#flavors">
                    Find your happy flavor <ArrowUpRight size={19} />
                  </a>
                  <a className="text-link" href="#story">
                    Made with love <Heart size={16} />
                  </a>
                </motion.div>
              </motion.div>
            </div>
            <a
              className="hero-scroll"
              href="#flavors"
              aria-label="Explore our flavors"
            >
              <ArrowDown size={17} />
            </a>
          </section>

          <section
            className="love-strip"
            aria-label="A little love from our snack lovers"
          >
            <div className="page-width love-strip-inner">
              <div className="stars" role="img" aria-label="Five stars">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <p>
                Small bites. <span>A whole lot of love.</span>
              </p>
              <a href="#love-notes">
                A few happy words <ArrowRight size={15} />
              </a>
            </div>
          </section>

          <section
            className="flavors section-space page-width"
            id="flavors"
            aria-labelledby="flavors-heading"
          >
            <Reveal className="section-heading">
              <div>
                <p className="eyebrow">MEET YOUR NEW SNACK OBSESSION</p>
                <h2 id="flavors-heading">
                  Find your <em>happy flavor.</em>
                </h2>
              </div>
              <p>
                Three little reasons to take a break.
                <br />
                Which one will be your favorite?
              </p>
            </Reveal>
            <Reveal className="flavor-tabs" delay={0.08}>
              <div role="tablist" aria-label="Filter flavors">
                {[
                  { id: "all", label: "All the goodness" },
                  { id: "sweet", label: "Sweet classics" },
                  { id: "savory", label: "Sweet & savory" },
                ].map((tab, index, tabs) => (
                  <button
                    key={tab.id}
                    id={`tab-${tab.id}`}
                    role="tab"
                    aria-selected={filter === tab.id}
                    aria-controls="flavor-results"
                    tabIndex={filter === tab.id ? 0 : -1}
                    className={filter === tab.id ? "active" : ""}
                    onClick={() => setFilter(tab.id)}
                    onKeyDown={(event) => {
                      if (
                        ["ArrowRight", "ArrowLeft", "Home", "End"].includes(
                          event.key,
                        )
                      ) {
                        event.preventDefault();
                        const next =
                          event.key === "Home"
                            ? 0
                            : event.key === "End"
                              ? tabs.length - 1
                              : (index +
                                  (event.key === "ArrowRight" ? 1 : -1) +
                                  tabs.length) %
                                tabs.length;
                        setFilter(tabs[next].id);
                        document
                          .getElementById(`tab-${tabs[next].id}`)
                          ?.focus();
                      }
                    }}
                  >
                    {tab.label}
                    <span>
                      {tab.id === "all"
                        ? "03"
                        : tab.id === "sweet"
                          ? "02"
                          : "01"}
                    </span>
                  </button>
                ))}
              </div>
              <span className="pack-note">Good things come in packs of 6</span>
            </Reveal>
            <div
              className="product-grid"
              role="tabpanel"
              id="flavor-results"
              aria-labelledby={`tab-${filter}`}
              tabIndex={0}
            >
              <AnimatePresence mode="popLayout">
                {products
                  .filter(
                    (product) =>
                      filter === "all" || product.category === filter,
                  )
                  .map((product, index) => (
                    <motion.article
                      layout={!reduced}
                      key={product.id}
                      className="product"
                      initial={{ opacity: 0, y: reduced ? 0 : 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      viewport={{ once: true, amount: 0.1 }}
                      transition={{ duration: 0.45, delay: index * 0.07 }}
                    >
                      <button
                        className="product-image-button"
                        onClick={() =>
                          setModal({ type: "product", id: product.id })
                        }
                        aria-label={`Discover ${product.name}`}
                      >
                        <img
                          src={product.image}
                          alt={`${product.name} gabin, with a generous creamy filling between golden crackers`}
                          loading="lazy"
                          width="1024"
                          height="1024"
                        />
                        <span className="product-tag">{product.note}</span>
                        <span className="product-discover">
                          <ArrowUpRight size={19} />
                        </span>
                      </button>
                      <div className="product-info">
                        <h3>
                          <button
                            onClick={() =>
                              setModal({ type: "product", id: product.id })
                            }
                          >
                            {product.name}
                          </button>
                        </h3>
                        <p>{product.subtitle}</p>
                      </div>
                      <div className="product-bottom">
                        <div className="product-price">
                          {money(product.price)}
                          <span> / 6 pieces</span>
                        </div>
                        <button
                          className="add-button"
                          onClick={() => addToCart(product.id)}
                          aria-label={`Add ${product.name}, 6 pieces, to bag`}
                        >
                          Add to bag <Plus size={17} />
                        </button>
                      </div>
                    </motion.article>
                  ))}
              </AnimatePresence>
            </div>
            <Reveal className="flavors-footnote">
              <span>
                A cup of tea, a little gabin, and a moment just for you.
              </span>
              <Heart size={15} />
            </Reveal>
          </section>

          <section className="story" id="story" aria-labelledby="story-heading">
            <div className="story-image">
              <img
                src="/images/umi-kitchen.jpg"
                alt="Umi's hands carefully assembling custard-filled gabin in a sunlit home kitchen"
                loading="lazy"
                width="1536"
                height="1024"
              />
              <div className="story-image-caption">
                <span>From our little kitchen,</span>
                <em>with a whole lot of heart.</em>
              </div>
            </div>
            <div className="story-content">
              <Reveal>
                <p className="eyebrow">
                  NOT JUST A SNACK. A LITTLE PIECE OF HOME.
                </p>
                <h2 id="story-heading">
                  The secret ingredient?
                  <br />
                  <em>A little Umi love.</em>
                </h2>
                <p className="story-intro">
                  Some of the best things come from a small kitchen. Ours starts
                  with a familiar recipe, good ingredients, and the simple joy
                  of making something people love.
                </p>
                <div className="story-values">
                  <div>
                    <span>01</span>
                    <div>
                      <h3>Small batches. Big heart.</h3>
                      <p>Carefully made by hand. Never just another snack.</p>
                    </div>
                  </div>
                  <div>
                    <span>02</span>
                    <div>
                      <h3>That crispy-creamy kind of magic.</h3>
                      <p>A golden crunch, a soft center, a very happy you.</p>
                    </div>
                  </div>
                  <div>
                    <span>03</span>
                    <div>
                      <h3>Good moments, made for sharing.</h3>
                      <p>
                        From afternoon tea to a table full of your favorite
                        people.
                      </p>
                    </div>
                  </div>
                </div>
                <p className="umi-signature">
                  With love, Umi <Heart size={21} />
                </p>
              </Reveal>
            </div>
          </section>

          <section
            className="testimonials section-space page-width"
            id="love-notes"
            aria-labelledby="testimonials-heading"
          >
            <Reveal className="centered-heading">
              <p className="eyebrow">GOOD SNACKS BRING PEOPLE TOGETHER</p>
              <h2 id="testimonials-heading">
                A little love, <em>from you.</em>
              </h2>
              <p>
                The best part of what we do? Making your day a little sweeter.
              </p>
            </Reveal>
            <div className="testimonial-grid">
              {[
                {
                  quote:
                    "Crispy on the outside, so creamy inside. I bought a box to share with my family... let's just say I had to order another one.",
                  name: "Nadia R.",
                  detail: "Team Original Vanilla",
                  initials: "NR",
                  color: "pink",
                },
                {
                  quote:
                    "The chocolate one with a cup of coffee? My new favorite afternoon ritual. It really does taste like someone made it with love.",
                  name: "Rizky A.",
                  detail: "Team Chocolate Bliss",
                  initials: "RA",
                  color: "green",
                },
                {
                  quote:
                    "Brought these to our family get-together and they disappeared in minutes. Simple, delicious, and just the right amount of sweet.",
                  name: "Dewi S.",
                  detail: "Team A Little Bit of Everything",
                  initials: "DS",
                  color: "yellow",
                },
              ].map((review, index) => (
                <Reveal
                  className="testimonial"
                  key={review.name}
                  delay={index * 0.1}
                >
                  <div
                    className="stars"
                    role="img"
                    aria-label="5 out of 5 stars"
                  >
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill="currentColor"
                        strokeWidth={0}
                      />
                    ))}
                  </div>
                  <blockquote>&ldquo;{review.quote}&rdquo;</blockquote>
                  <div className="reviewer">
                    <span className={`reviewer-avatar ${review.color}`}>
                      {review.initials}
                    </span>
                    <div>
                      <strong>{review.name}</strong>
                      <span>{review.detail}</span>
                    </div>
                    <CheckCheck size={18} aria-label="Love note" />
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          <section
            className="bundles-section"
            id="happy-boxes"
            aria-labelledby="bundles-heading"
          >
            <div className="page-width section-space">
              <Reveal className="centered-heading">
                <p className="eyebrow">HAPPINESS LOOKS GOOD IN A BOX</p>
                <h2 id="bundles-heading">
                  A little for you. <em>More to share.</em>
                </h2>
                <p>
                  Pick your happy size. We'll take care of the delicious part.
                </p>
              </Reveal>
              <fieldset className="bundle-grid">
                <legend className="sr-only">Choose your gabin box</legend>
                {bundles.map((bundle, index) => (
                  <Reveal key={bundle.id} delay={index * 0.08}>
                    <label
                      className={`bundle ${selectedBundle === bundle.id ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="bundle"
                        value={bundle.id}
                        checked={selectedBundle === bundle.id}
                        onChange={() => setSelectedBundle(bundle.id)}
                      />
                      <span className="bundle-top">
                        <span>{bundle.tag}</span>
                        <span className="radio-dot">
                          {selectedBundle === bundle.id && <span />}
                        </span>
                      </span>
                      <span className="bundle-quantity">
                        {bundle.count}
                        <span>happy bites</span>
                        <Spark size={43} />
                      </span>
                      <span className="bundle-name">{bundle.name}</span>
                      <span className="bundle-description">
                        {bundle.description}
                      </span>
                      <span className="bundle-price">
                        {money(bundle.price)}
                        {bundle.saving > 0 && (
                          <span>Save {money(bundle.saving)}</span>
                        )}
                      </span>
                    </label>
                  </Reveal>
                ))}
              </fieldset>
              <Reveal className="bundle-action">
                <button
                  className="button"
                  onClick={() => addToCart(selectedBundle)}
                >
                  Add my happy box <ShoppingBag size={18} />
                </button>
                <p>Thoughtfully packed. Happily shared.</p>
              </Reveal>
            </div>
          </section>

          <section
            className="faq-section section-space page-width"
            id="faq"
            aria-labelledby="faq-heading"
          >
            <Reveal className="faq-intro">
              <p className="eyebrow">A FEW THINGS YOU MIGHT WONDER</p>
              <h2 id="faq-heading">
                Good questions.
                <br />
                <em>Honest answers.</em>
              </h2>
              <p>
                A little more about your
                <br className="desktop-break" /> soon-to-be favorite snack.
              </p>
              <Spark size={64} className="faq-spark" />
            </Reveal>
            <div className="faq-list">
              {faqs.map((faq, index) => (
                <Reveal
                  className={`faq-item ${openFaq === index ? "open" : ""}`}
                  key={faq.question}
                  delay={index * 0.03}
                >
                  <h3>
                    <button
                      id={`faq-question-${index}`}
                      aria-expanded={openFaq === index}
                      aria-controls={`faq-answer-${index}`}
                      onClick={() =>
                        setOpenFaq(openFaq === index ? null : index)
                      }
                    >
                      {faq.question}
                      <span>
                        {openFaq === index ? (
                          <Minus size={18} />
                        ) : (
                          <Plus size={18} />
                        )}
                      </span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {openFaq === index && (
                      <motion.div
                        id={`faq-answer-${index}`}
                        role="region"
                        aria-labelledby={`faq-question-${index}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: reduced ? 0 : 0.3 }}
                        className="faq-answer"
                      >
                        <p>{faq.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Reveal>
              ))}
            </div>
          </section>

          <section className="final-cta" aria-labelledby="cta-heading">
            <Spark className="cta-spark cta-spark-one" size={130} />
            <Spark className="cta-spark cta-spark-two" size={80} />
            <Reveal>
              <p className="eyebrow">YOUR NEXT HAPPY MOMENT IS WAITING</p>
              <h2 id="cta-heading">
                Life's a little better
                <br />
                with <em>gabin.</em>
              </h2>
              <p>A little crunch. A creamy center. A whole lot of happy.</p>
              <a className="button" href="#flavors">
                Let's make snack time happy <ArrowUpRight size={19} />
              </a>
            </Reveal>
          </section>
        </main>

        <footer className="footer">
          <div className="page-width">
            <div className="footer-main">
              <div className="footer-brand">
                <Logo light />
                <p>
                  Homemade happiness.
                  <br />
                  From Umi, to you.
                </p>
              </div>
              <div className="footer-links">
                <div>
                  <h3>A little goodness</h3>
                  <a href="#flavors">Our flavors</a>
                  <a href="#happy-boxes">Happy boxes</a>
                  <button onClick={openCart}>
                    Your bag <ArrowUpRight size={13} />
                  </button>
                </div>
                <div>
                  <h3>A little about us</h3>
                  <a href="#story">The Umi story</a>
                  <a href="#love-notes">Love notes</a>
                  <a href="#faq">Questions & answers</a>
                </div>
                <div className="footer-note">
                  <h3>Made with care.</h3>
                  <p>
                    For slow afternoons,
                    <br />
                    sweet little breaks,
                    <br />
                    and your favorite people.
                  </p>
                  <Heart size={21} />
                </div>
              </div>
            </div>
            <div className="footer-bottom">
              <p>
                &copy; {new Date().getFullYear()} Gabin Warung Umi. All the
                love, all the little bites.
              </p>
              <a href="#home">
                Back to the good stuff <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        </footer>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            role="status"
            initial={{ opacity: 0, y: 20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 10, x: "-50%" }}
          >
            <span className="toast-check">
              <Check size={16} />
            </span>
            <span>{toast}</span>
            <button
              onClick={() => {
                setToast("");
                openCart();
              }}
            >
              View bag <ArrowRight size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {modal && (
          <Modal
            key={modal.type === "product" ? modal.id : modal.type}
            title={
              modal.type === "cart"
                ? "Your happy little bag"
                : modal.type === "checkout"
                  ? "Prepare your order request"
                  : activeProduct?.name || "Product details"
            }
            onClose={closeModal}
            drawer={modal.type === "cart"}
            returnFocus={lastPageFocus.current}
          >
            {modal.type === "cart" && (
              <div className="cart-content">
                <div className="cart-header">
                  <p className="eyebrow">A LITTLE HAPPINESS, PICKED BY YOU</p>
                  <h2>
                    Your happy little bag<span>({cartCount})</span>
                  </h2>
                </div>
                {cartEntries.length > 0 ? (
                  <>
                    <div className="cart-items">
                      {cartEntries.map(({ product, quantity }) => (
                        <div className="cart-item" key={product.id}>
                          <img
                            src={product.image}
                            alt={product.name}
                            width="100"
                            height="100"
                          />
                          <div className="cart-item-info">
                            <h3>{product.name}</h3>
                            <p>{product.size}</p>
                            <div className="quantity-control">
                              <button
                                onClick={() => changeQuantity(product.id, -1)}
                                aria-label={`Remove one ${product.name}`}
                              >
                                <Minus size={14} />
                              </button>
                              <span aria-live="polite">{quantity}</span>
                              <button
                                onClick={() => changeQuantity(product.id, 1)}
                                disabled={quantity >= 99}
                                aria-label={`Add one ${product.name}`}
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                          <div className="cart-item-end">
                            <strong>{money(product.price * quantity)}</strong>
                            <button
                              className="remove-item"
                              aria-label={`Remove ${product.name} from bag`}
                              onClick={() =>
                                setCart((current) => {
                                  const next = { ...current };
                                  delete next[product.id];
                                  return next;
                                })
                              }
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="cart-bottom">
                      <div className="cart-subtotal">
                        <span>A little happiness, total</span>
                        <strong>{money(total)}</strong>
                      </div>
                      <p>
                        Delivery fees and availability are confirmed by Umi
                        before payment.
                      </p>
                      <button className="button" onClick={beginCheckout}>
                        Prepare my order <ArrowRight size={18} />
                      </button>
                      <button
                        className="continue-shopping"
                        onClick={closeModal}
                      >
                        A little more browsing
                      </button>
                      <span className="cart-small-note">
                        <Heart size={13} /> Handmade, and worth the little wait.
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="empty-cart">
                    <ShoppingBag size={55} strokeWidth={1} />
                    <h3>
                      A little empty.
                      <br />A lot of possibilities.
                    </h3>
                    <p>Your next favorite snack is just a few clicks away.</p>
                    <button
                      className="button"
                      onClick={() => {
                        closeModal();
                        window.location.hash = "flavors";
                      }}
                    >
                      Find your happy flavor <ArrowUpRight size={17} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {modal.type === "product" && activeProduct && (
              <div className="product-detail">
                <img
                  className="detail-image"
                  src={activeProduct.image}
                  alt={`${activeProduct.name} golden gabin with creamy filling`}
                />
                <div className="detail-content">
                  <p className="eyebrow">A LITTLE BOX OF 6 HAPPY BITES</p>
                  <h2>{activeProduct.name}</h2>
                  <p className="detail-description">
                    {activeProduct.description}
                  </p>
                  <div className="detail-ingredients">
                    <strong>Good stuff inside</strong>
                    <p>{activeProduct.ingredients}</p>
                    <p>
                      <strong>Allergens:</strong> contains wheat, milk, and
                      eggs. Made in a shared kitchen; chocolate may contain soy.
                      Please check with Umi if you have an allergy.
                    </p>
                  </div>
                  <div className="detail-buy">
                    <strong>
                      {money(activeProduct.price)} <span>/ 6 pieces</span>
                    </strong>
                    <button
                      className="button"
                      onClick={() => addToCart(activeProduct.id)}
                    >
                      Add to my bag <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {modal.type === "checkout" && (
              <div className="checkout-content">
                {preparedOrder ? (
                  <div className="order-prepared">
                    <span className="prepared-check">
                      <Check size={30} />
                    </span>
                    <p className="eyebrow">ONE LITTLE STEP TO SNACK TIME</p>
                    <h2 tabIndex={-1}>
                      Your order request
                      <br />
                      is ready to share.
                    </h2>
                    <p>
                      {merchantWhatsApp
                        ? "Send your request to Umi in WhatsApp."
                        : "Select your Warung Umi chat in WhatsApp and send the request."}{" "}
                      Umi will confirm availability, delivery, and payment
                      directly with you.
                    </p>
                    <div className="prepared-summary">
                      <span>{preparedOrder.reference}</span>
                      <strong>{money(total)}</strong>
                      <p>
                        Product subtotal only. Delivery, if needed, is confirmed
                        separately.
                      </p>
                    </div>
                    <a
                      className="button"
                      href={`https://wa.me/${merchantWhatsApp}?text=${encodeURIComponent(preparedOrder.text)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle size={19} /> Continue in WhatsApp{" "}
                      <ArrowUpRight size={17} />
                    </a>
                    <button className="copy-order" onClick={copyOrder}>
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                      {copied
                        ? "Order request copied"
                        : "Copy order request instead"}
                    </button>
                    <details className="order-text">
                      <summary>
                        View your order request <ChevronDown size={15} />
                      </summary>
                      <pre>{preparedOrder.text}</pre>
                    </details>
                    <p className="checkout-disclaimer">
                      This is an order request, not a confirmed order. No
                      payment has been taken and nothing is sent until you share
                      it in WhatsApp.
                    </p>
                    <button
                      className="text-link"
                      onClick={() => {
                        setPreparedOrder(null);
                        setCopied(false);
                      }}
                    >
                      <ArrowLeft size={15} /> Edit my details
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      className="back-to-bag"
                      onClick={() => setModal({ type: "cart" })}
                    >
                      <ArrowLeft size={16} /> Back to your bag
                    </button>
                    <p className="eyebrow">LET'S GET THE GOOD STUFF TO YOU</p>
                    <h2>A few little details.</h2>
                    <p className="checkout-intro">
                      Prepare your request, then send it to Warung Umi in
                      WhatsApp to confirm your order.
                    </p>
                    <form onSubmit={prepareOrder} className="checkout-form">
                      <div className="form-row">
                        <label htmlFor={`${checkoutId}-name`}>
                          Your name
                          <input
                            id={`${checkoutId}-name`}
                            name="name"
                            value={orderDraft.name}
                            onChange={(event) =>
                              setOrderDraft((draft) => ({
                                ...draft,
                                name: event.target.value,
                              }))
                            }
                            autoComplete="name"
                            placeholder="What should we call you?"
                            pattern={".*\\S.*"}
                            title="Please enter your name, not just spaces."
                            required
                            maxLength={80}
                          />
                        </label>
                        <label htmlFor={`${checkoutId}-phone`}>
                          WhatsApp number
                          <input
                            id={`${checkoutId}-phone`}
                            name="phone"
                            value={orderDraft.phone}
                            onChange={(event) =>
                              setOrderDraft((draft) => ({
                                ...draft,
                                phone: event.target.value,
                              }))
                            }
                            type="tel"
                            autoComplete="tel"
                            placeholder="e.g. 0812 3456 7890"
                            pattern={"\\+?[0-9](?: ?[0-9]){7,14}"}
                            title="Use 8 to 15 digits, with optional spaces and a leading plus sign."
                            required
                            maxLength={20}
                          />
                        </label>
                      </div>
                      <fieldset className="delivery-options">
                        <legend>How would you like your gabin?</legend>
                        <label
                          className={delivery === "delivery" ? "selected" : ""}
                        >
                          <input
                            type="radio"
                            name="delivery"
                            value="delivery"
                            checked={delivery === "delivery"}
                            onChange={() => setDelivery("delivery")}
                          />
                          Delivery
                        </label>
                        <label
                          className={delivery === "pickup" ? "selected" : ""}
                        >
                          <input
                            type="radio"
                            name="delivery"
                            value="pickup"
                            checked={delivery === "pickup"}
                            onChange={() => setDelivery("pickup")}
                          />
                          I'll pick it up
                        </label>
                      </fieldset>
                      {delivery === "delivery" && (
                        <label htmlFor={`${checkoutId}-address`}>
                          Delivery address
                          <textarea
                            id={`${checkoutId}-address`}
                            name="address"
                            value={orderDraft.address}
                            onChange={(event) => {
                              event.currentTarget.setCustomValidity(
                                event.target.value.trim().length < 8
                                  ? "Please enter your full delivery address."
                                  : "",
                              );
                              setOrderDraft((draft) => ({
                                ...draft,
                                address: event.target.value,
                              }));
                            }}
                            autoComplete="street-address"
                            placeholder="Street, neighborhood, city, and postcode"
                            rows={2}
                            required
                            minLength={8}
                            maxLength={500}
                          />
                        </label>
                      )}
                      <label htmlFor={`${checkoutId}-note`}>
                        A little note <span>(optional)</span>
                        <textarea
                          id={`${checkoutId}-note`}
                          name="note"
                          value={orderDraft.note}
                          onChange={(event) =>
                            setOrderDraft((draft) => ({
                              ...draft,
                              note: event.target.value,
                            }))
                          }
                          placeholder="A special request, a gift, or just say hello..."
                          rows={2}
                          maxLength={500}
                        />
                      </label>
                      <div className="checkout-total">
                        <span>Product subtotal</span>
                        <strong>{money(total)}</strong>
                      </div>
                      <p className="checkout-disclaimer">
                        No payment is taken here. Umi will confirm availability,
                        any delivery fee, and payment details with you in
                        WhatsApp.
                      </p>
                      <button className="button" type="submit">
                        Prepare my WhatsApp request <ArrowRight size={18} />
                      </button>
                      <p className="privacy-note">
                        Your details stay in your browser until you choose to
                        share the request.
                      </p>
                    </form>
                  </>
                )}
              </div>
            )}
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
