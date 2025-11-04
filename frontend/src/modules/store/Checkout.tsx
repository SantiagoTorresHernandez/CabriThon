import React, { useState } from 'react';
import { orderApi } from '../../services/api';
import './Checkout.css';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CheckoutProps {
  cartItems: CartItem[];
  totalPrice: number;
  onBack: () => void;
  onSuccess: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({
  cartItems,
  totalPrice,
  onBack,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');

      const orderData = {
        ...formData,
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      };

      await orderApi.create(orderData);
      setSuccess(true);
      
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="checkout">
        <div className="container">
          <div className="card checkout-success">
            <h2>✓ Order Placed Successfully!</h2>
            <p>Thank you for your order. You will receive a confirmation email shortly.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout">
      <div className="container">
        <button className="btn btn-secondary back-button" onClick={onBack}>
          ← Back to Cart
        </button>

        <h2 className="checkout-title">Checkout</h2>

        <div className="checkout-layout">
          <div className="checkout-form-section">
            <div className="card">
              <h3>Shipping Information</h3>

              {error && (
                <div className="error-message" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="customerName" className="form-label">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="customerName"
                    name="customerName"
                    className="form-input"
                    value={formData.customerName}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="customerEmail" className="form-label">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="customerEmail"
                    name="customerEmail"
                    className="form-input"
                    value={formData.customerEmail}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="customerPhone" className="form-label">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="customerPhone"
                    name="customerPhone"
                    className="form-input"
                    value={formData.customerPhone}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="shippingAddress" className="form-label">
                    Shipping Address *
                  </label>
                  <textarea
                    id="shippingAddress"
                    name="shippingAddress"
                    className="form-input"
                    rows={4}
                    value={formData.shippingAddress}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="notes" className="form-label">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    className="form-input"
                    rows={3}
                    value={formData.notes}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-success btn-large"
                  disabled={loading}
                >
                  {loading ? 'Placing Order...' : 'Place Order'}
                </button>
              </form>
            </div>
          </div>

          <div className="order-summary-section">
            <div className="card">
              <h3>Order Summary</h3>

              <div className="summary-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="summary-item">
                    <div className="summary-item-info">
                      <span className="summary-item-name">{item.name}</span>
                      <span className="summary-item-qty">× {item.quantity}</span>
                    </div>
                    <div className="summary-item-price">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary-total">
                <span className="summary-total-label">Total</span>
                <span className="summary-total-amount">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Checkout;

