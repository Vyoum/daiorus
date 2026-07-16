'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Price from './Price';
import { useCart } from './CartProvider';
import { useWishlist } from './WishlistProvider';

function ProductMediaImage({ src, alt, priority = false }) {
  const isLocal = typeof src === 'string' && src.startsWith('/');

  if (isLocal) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        className="product-img"
        priority={priority}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="product-img"
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
    />
  );
}

export default function ProductCard({
  product,
  showMaterial = false,
  showRemove = false,
  priority = false,
}) {
  const { addToCart, lastAddedAt, lastAddedProductId } = useCart();
  const { isWished, toggle, remove } = useWishlist();
  const tag = product.tag ? String(product.tag) : '';
  const wished = isWished(product.id);
  const href = product.slug ? `/product/${product.slug}` : null;
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (lastAddedProductId !== product.id || !lastAddedAt) return undefined;
    setJustAdded(true);
    const timer = setTimeout(() => setJustAdded(false), 1400);
    return () => clearTimeout(timer);
  }, [lastAddedAt, lastAddedProductId, product.id]);

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (showRemove) {
      remove(product.id);
      return;
    }
    toggle(product);
  };

  const moveWishlistItemToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    if (showRemove) {
      remove(product.id);
    }
  };

  const media = (
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

      <button
        type="button"
        className={`product-wishlist-btn${wished ? ' is-active' : ''}`}
        aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
        aria-pressed={wished}
        onClick={handleWishlist}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            fill={wished ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <ProductMediaImage src={product.image} alt={product.name} priority={priority} />
      <button
        type="button"
        className={`product-action-btn${justAdded ? ' is-added' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          addToCart(product);
        }}
      >
        {justAdded ? 'Added' : 'Add To Cart'}
      </button>
    </div>
  );

  return (
    <article className={`product-card${wished ? ' is-wished' : ''}`}>
      {href ? (
        <Link href={href} className="product-card-link">
          {media}
          <h3 className="product-name">{product.name}</h3>
        </Link>
      ) : (
        <>
          {media}
          <h3 className="product-name">{product.name}</h3>
        </>
      )}
      {showMaterial && product.material ? (
        <p className="product-material">{product.material}</p>
      ) : null}
      <p className="product-price">
        <Price amount={product.price} />
      </p>
      {showRemove ? (
        <button type="button" className="wishlist-cart-btn" onClick={moveWishlistItemToCart}>
          Move to cart
        </button>
      ) : null}
    </article>
  );
}
