import React, { useState } from 'react';
import './ProductCard.css';

interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  category: string;
  price: number;
  imageUrl?: string;
  availableStock?: number;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (quantity > 0 && (!product.availableStock || quantity <= product.availableStock)) {
      onAddToCart(product, quantity);
      setQuantity(1);
    }
  };

  const isOutOfStock = product.availableStock !== undefined && product.availableStock <= 0;

  return (
    <article className="product-card">
      <div className="product-image">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} />
        ) : (
          <div className="product-image-placeholder">No Image</div>
        )}
      </div>

      <div className="product-details">
        <h3 className="product-name">{product.name}</h3>
        
        <p className="product-description">{product.description}</p>

        <div className="product-price">${product.price.toFixed(2)}</div>

        {product.availableStock !== undefined && (
          <div className={`product-stock ${isOutOfStock ? 'out-of-stock' : ''}`}>
            {isOutOfStock ? 'Out of Stock' : `${product.availableStock} in stock`}
          </div>
        )}

        <div className="product-actions">
          <label htmlFor={`quantity-${product.id}`} className="quantity-label">
            Quantity:
          </label>
          <input
            type="number"
            id={`quantity-${product.id}`}
            className="quantity-input"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
            max={product.availableStock || 999}
            disabled={isOutOfStock}
            aria-label="Product quantity"
          />
          <button
            className="btn btn-primary btn-add-to-cart"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            aria-label={`Add ${product.name} to cart`}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;

