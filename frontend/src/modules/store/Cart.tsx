import React from 'react';
import './Cart.css';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  availableStock?: number;
}

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  totalPrice: number;
  onCheckout: () => void;
  onClose: () => void;
}

const Cart: React.FC<CartProps> = ({
  items,
  onUpdateQuantity,
  onRemove,
  totalPrice,
  onCheckout,
  onClose,
}) => {
  return (
    <aside className="cart" role="complementary" aria-label="Shopping cart">
      <div className="cart-header">
        <h3>Shopping Cart</h3>
        <button
          className="cart-close"
          onClick={onClose}
          aria-label="Close cart"
        >
          ✕
        </button>
      </div>

      {items.length === 0 ? (
        <div className="cart-empty">
          <p>Your cart is empty</p>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {items.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-details">
                  <h4 className="cart-item-name">{item.name}</h4>
                  <div className="cart-item-price">${item.price.toFixed(2)}</div>
                </div>

                <div className="cart-item-controls">
                  <div className="quantity-controls">
                    <button
                      className="quantity-btn"
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="quantity-display">{item.quantity}</span>
                    <button
                      className="quantity-btn"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      disabled={
                        item.availableStock !== undefined &&
                        item.quantity >= item.availableStock
                      }
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <button
                    className="btn-remove"
                    onClick={() => onRemove(item.id)}
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    Remove
                  </button>
                </div>

                <div className="cart-item-subtotal">
                  Subtotal: ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="cart-footer">
            <div className="cart-total">
              <span className="cart-total-label">Total:</span>
              <span className="cart-total-amount">${totalPrice.toFixed(2)}</span>
            </div>

            <button
              className="btn btn-success btn-large"
              onClick={onCheckout}
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </aside>
  );
};

export default Cart;

