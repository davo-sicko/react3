import { useState, useEffect } from 'react';
import './App.css';
import { AsideCategories } from './components/AsideCategories';
import { ServiceCard } from './components/ServiceCard';
import { AuthModal } from './components/AuthModal';
import { CartModal } from './components/CartModal';
import {
  getServices,
  getCategories,
  login,
  addCategory,
  createAppointment,
} from './api/client';

export default function App() {
  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const appStyles = {
    backgroundColor: theme === "dark" ? "#050505" : "#fff",
    color: theme === "dark" ? "#fff" : "#000",
    minHeight: "100vh",
  };

  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    Promise.all([getServices(), getCategories()])
      .then(([servicesData, categoriesData]) => {
        setServices(servicesData);
        setCategories(categoriesData);
      })
      .catch((err) => {
        setError(err.message || 'Не удалось загрузить данные');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleCategory = (catId) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const handleAddCategory = async (name) => {
    try {
      const newCat = await addCategory(name);
      setCategories((prev) => [...prev, newCat]);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogin = async (email, password) => {
    const data = await login(email, password);
    setUser(data);
  };

  const handleAddToCart = (service) => {
    setCart((prev) => [...prev, service]);
  };

  const handleRemoveFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCheckout = async (amount) => {
    if (!user) {
      alert('Сначала войдите в систему');
      setShowAuth(true);
      return;
    }

    try {
      for (const item of cart) {
        await createAppointment({
          user_id: user.user_id,
          service_id: item.service_id,
          amount: item.finalPrice,
          notes: 'Заказ футбольной экипировки',
        });
      }
      alert('Заказ успешно оформлен и оплачен!');
      setCart([]);
      setShowCart(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredServices =
    selectedCategories.length === 0
      ? services
      : services.filter((s) => selectedCategories.includes(s.category_id));

  return (
    <div className="layout" style={appStyles}>
      <header className="header">
        <div className="header-logo">Футбольный Экипировочный Центр</div>
        <div className="header-actions">
          <button onClick={toggleTheme}>
            Переключить тему
          </button>
          <button className="cart-badge-button" onClick={() => setShowCart(true)}>
            Корзина ({cart.length})
          </button>
          {user ? (
            <div className="user-profile">
              <span>{user.email} ({user.role})</span>
              {user.discount_percent > 0 && (
                <span className="user-coupon">
                  {user.discount_coupon} (-{user.discount_percent}%)
                </span>
              )}
              <button onClick={() => setUser(null)}>Выйти</button>
            </div>
          ) : (
            <button className="primary-button" onClick={() => setShowAuth(true)}>
              Войти
            </button>
          )}
        </div>
      </header>

      <div className="main-content">
        <AsideCategories
          categories={categories}
          selectedCategories={selectedCategories}
          onToggleCategory={handleToggleCategory}
          onAddCategory={handleAddCategory}
          isAdmin={user?.role === 'admin'}
        />

        <main className="catalog">
          {loading && (
            <div className="state-message">Загрузка данных...</div>
          )}

          {!loading && error && (
            <div className="state-message error">
              <div>Ошибка: {error}</div>
              <button className="retry-button" onClick={loadData}>
                Попробовать снова
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="services-grid">
              {filteredServices.map((service) => (
                <ServiceCard
                  key={service.service_id}
                  service={service}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {showAuth && (
        <AuthModal onClose={() => setShowAuth(false)} onLogin={handleLogin} />
      )}

      {showCart && (
        <CartModal
          cart={cart}
          user={user}
          onClose={() => setShowCart(false)}
          onRemoveItem={handleRemoveFromCart}
          onCheckout={handleCheckout}
        />
      )}
    </div>
  );
}