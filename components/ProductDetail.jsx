'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Price from './Price';
import ProductImageCarousel from './ProductImageCarousel';
import ProductSpecs from './ProductSpecs';
import ProductPriceBreakup from './ProductPriceBreakup';
import ProductDeliveryEstimate from './ProductDeliveryEstimate';
import { useCart } from './CartProvider';
import { useWishlist } from './WishlistProvider';
import { useCurrency } from './CurrencyProvider';
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
  const { isLocalCurrency } = useCurrency();
  const wished = isWished(product.id);
  const [justAdded, setJustAdded] = useState(false);
  const [infoTab, setInfoTab] = useState('details');
  const showPriceBreakup = isLocalCurrency;

  useEffect(() => {
    if (lastAddedProductId !== product.id || !lastAddedAt) return undefined;
    setJustAdded(true);
    const timer = setTimeout(() => setJustAdded(false), 1400);
    return () => clearTimeout(timer);
  }, [lastAddedAt, lastAddedProductId, product.id]);

  useEffect(() => {
    if (!showPriceBreakup && infoTab === 'breakup') {
      setInfoTab('details');
    }
  }, [showPriceBreakup, infoTab]);

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

          <ProductSpecs product={product} />

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

          {showPriceBreakup ? (
            <div className={styles.tabSwitch} role="tablist" aria-label="Product information">
              <button
                type="button"
                role="tab"
                aria-selected={infoTab === 'details'}
                className={`${styles.tabBtn} ${infoTab === 'details' ? styles.tabBtnActive : ''}`}
                onClick={() => setInfoTab('details')}
              >
                Product Details
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={infoTab === 'breakup'}
                className={`${styles.tabBtn} ${infoTab === 'breakup' ? styles.tabBtnActive : ''}`}
                onClick={() => setInfoTab('breakup')}
              >
                Price Breakup
              </button>
            </div>
          ) : null}

          <div className={styles.tabPanel} role="tabpanel">
            {showPriceBreakup && infoTab === 'breakup' ? (
              <ProductPriceBreakup product={product} />
            ) : (
              <>
                {product.description ? (
                  <p className={styles.description}>{product.description}</p>
                ) : (
                  <p className={styles.description}>
                    A DAIORUS piece crafted to catch the light — refined, wearable, and made to last.
                  </p>
                )}
                {product.productInfo ? (
                  <p className={styles.productInfo}>{product.productInfo}</p>
                ) : null}
              </>
            )}
          </div>

          <ProductDeliveryEstimate />

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
