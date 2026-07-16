'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Price from './Price';
import ProductImageCarousel from './ProductImageCarousel';
import { useCart } from './CartProvider';
import { useWishlist } from './WishlistProvider';
import styles from './ProductDetail.module.css';

function formatReviewDate(value) {
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value));
  } catch {
    return '';
  }
}

export default function ProductDetail({ product }) {
  const { addToCart, lastAddedAt, lastAddedProductId } = useCart();
  const { isWished, toggle } = useWishlist();
  const wished = isWished(product.id);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (lastAddedProductId !== product.id || !lastAddedAt) return undefined;
    setJustAdded(true);
    const timer = setTimeout(() => setJustAdded(false), 1400);
    return () => clearTimeout(timer);
  }, [lastAddedAt, lastAddedProductId, product.id]);

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link href="/shop">Shop</Link>
        {product.categoryName && product.category ? (
          <>
            <span>/</span>
            <Link href={`/category/${product.category}`}>{product.categoryName}</Link>
          </>
        ) : null}
        <span>/</span>
        <span>{product.name}</span>
      </div>

      <div className={styles.layout}>
        <ProductImageCarousel images={product.images} alt={product.name} />

        <div className={styles.info}>
          {product.tag ? <p className={styles.tag}>{product.tag}</p> : null}
          <h1 className={styles.title}>{product.name}</h1>
          {product.material ? <p className={styles.material}>{product.material}</p> : null}

          <div className={styles.priceRow}>
            <Price amount={product.price} className={styles.price} />
            {product.compareAt && product.compareAt > product.price ? (
              <Price amount={product.compareAt} className={styles.compare} />
            ) : null}
          </div>

          {product.avgRating != null ? (
            <p className={styles.ratingLine}>
              {product.avgRating}★ · {product.reviewCount} review
              {product.reviewCount === 1 ? '' : 's'}
            </p>
          ) : null}

          {product.description ? (
            <p className={styles.description}>{product.description}</p>
          ) : (
            <p className={styles.description}>
              A DAIORUS piece crafted to catch the light — refined, wearable, and made to last.
            </p>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              className={`${styles.addBtn} ${justAdded ? styles.added : ''}`}
              onClick={() => addToCart(product)}
            >
              {justAdded ? 'Added to cart' : 'Add to cart'}
            </button>
            <button
              type="button"
              className={`${styles.wishBtn} ${wished ? styles.wishActive : ''}`}
              onClick={() => toggle(product)}
              aria-pressed={wished}
            >
              {wished ? 'Saved' : 'Wishlist'}
            </button>
          </div>
        </div>
      </div>

      {product.reviews?.length ? (
        <section className={styles.reviews}>
          <h2 className={styles.reviewsTitle}>Customer reviews</h2>
          <div className={styles.reviewList}>
            {product.reviews.map((review) => (
              <article key={review.id} className={styles.review}>
                <div className={styles.reviewTop}>
                  <strong>{review.authorName}</strong>
                  <span>{review.rating}★</span>
                  <span className={styles.reviewDate}>{formatReviewDate(review.createdAt)}</span>
                </div>
                {review.title ? <h3 className={styles.reviewTitle}>{review.title}</h3> : null}
                <p className={styles.reviewBody}>{review.body}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
