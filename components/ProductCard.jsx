'use client';

import Price from './Price';
import { useCart } from './CartProvider';

export default function ProductCard({ product, showMaterial = false }) {
  const { addToCart } = useCart();
  const tag = product.tag ? String(product.tag) : '';

  return (
    <article className="product-card">
      <div className="product-img-wrapper">
        {tag ? (
          <span
            className={`product-tag ${tag.toLowerCase() === 'new' ? 'new' : ''} ${
              tag.toLowerCase() === 'sale' ? 'sale' : ''
            }`}
          >
            {product.tag}
          </span>
        ) : null}
        <img src={product.image} alt={product.name} className="product-img" />
        <button
          type="button"
          className="product-action-btn"
          onClick={() => addToCart(product)}
        >
          Add To Cart
        </button>
      </div>
      <h3 className="product-name">{product.name}</h3>
      {showMaterial && product.material ? (
        <p className="product-material">{product.material}</p>
      ) : null}
      <p className="product-price">
        <Price amount={product.price} />
      </p>
    </article>
  );
}
