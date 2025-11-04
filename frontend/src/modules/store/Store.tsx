import React, { useState, useEffect } from 'react';
import { productApi, orderApi } from '../../services/api';
import ProductCard from './ProductCard';
import Cart from './Cart';
import Checkout from './Checkout';
import './Store.css';

interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  category: string;
  price: number;
  imageUrl?: string;
  availableStock?: number;
}

interface CartItem extends Product {
  quantity: number;
}

const Store: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productApi.getAll();
      setProducts(response.data);
      setError('');
    } catch (err: any) {
      setError('Failed to load products. Please try again later.');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      return [...prevItems, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

  const filteredProducts =
    selectedCategory === 'All'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  if (loading) {
    return (
      <main>
        <div className="container">
          <div className="loading">
            <div className="spinner" role="status" aria-label="Loading products"></div>
          </div>
        </div>
      </main>
    );
  }

  if (showCheckout) {
    return (
      <Checkout
        cartItems={cartItems}
        totalPrice={getTotalPrice()}
        onBack={() => setShowCheckout(false)}
        onSuccess={() => {
          setCartItems([]);
          setShowCheckout(false);
          setShowCart(false);
        }}
      />
    );
  }

  return (
    <main className="store">
      <div className="container">
        <div className="store-header">
          <h2>Our Products</h2>
          <button
            className="btn btn-primary cart-button"
            onClick={() => setShowCart(!showCart)}
            aria-label={`Shopping cart with ${cartItems.length} items`}
          >
            🛒 Cart ({cartItems.length})
          </button>
        </div>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        <div className="category-filter">
          <label htmlFor="category-select" className="form-label">
            Filter by Category:
          </label>
          <select
            id="category-select"
            className="form-input category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="store-content">
          <div className="products-grid">
            {filteredProducts.length === 0 ? (
              <p className="no-products">No products available in this category.</p>
            ) : (
              filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                />
              ))
            )}
          </div>

          {showCart && (
            <div className="cart-sidebar">
              <Cart
                items={cartItems}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
                totalPrice={getTotalPrice()}
                onCheckout={() => setShowCheckout(true)}
                onClose={() => setShowCart(false)}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Store;

