import { Star } from 'lucide-react';
import { getAdminReviews } from '../../../../lib/admin/reviews';
import { formatDate, formatTime, initials } from '../../../../lib/admin/format';
import ReviewRowActions from './ReviewRowActions';
import styles from './reviews.module.css';

function Stars({ rating }) {
  return (
    <span className={styles.stars} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={14}
          className={i < rating ? styles.starOn : styles.starOff}
          fill={i < rating ? 'currentColor' : 'none'}
        />
      ))}
    </span>
  );
}

function statusClass(status) {
  if (status === 'APPROVED') return styles.statusApproved;
  if (status === 'HIDDEN') return styles.statusHidden;
  return styles.statusPending;
}

export default async function ReviewsPage() {
  const { reviews, total, error } = await getAdminReviews();

  return (
    <div>
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Reviews</h1>
          <p className={styles.pageSubtitle}>
            Customer reviews across all products. Approve, hide, or delete as needed.
          </p>
        </div>
        <div className={styles.statPill}>
          <strong>{total}</strong> total
        </div>
      </header>

      {error ? <div className={styles.bannerError}>{error}</div> : null}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Product</th>
              <th className={styles.th}>Customer</th>
              <th className={styles.th}>Rating</th>
              <th className={styles.th}>Review</th>
              <th className={styles.th}>Date</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.length === 0 ? (
              <tr className={styles.tr}>
                <td className={styles.td} colSpan={7} style={{ textAlign: 'center', padding: 40 }}>
                  No reviews yet. When customers leave reviews from their account orders, they
                  appear here.
                </td>
              </tr>
            ) : (
              reviews.map((review) => (
                <tr key={review.id} className={styles.tr}>
                  <td className={styles.td}>
                    <div className={styles.productCell}>
                      {review.productImage ? (
                        <img
                          src={review.productImage}
                          alt=""
                          className={styles.productThumb}
                        />
                      ) : (
                        <div className={styles.productThumbPlaceholder} />
                      )}
                      <span className={styles.productName}>{review.productName}</span>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.customerCell}>
                      <div className={styles.avatar}>{initials(review.authorName)}</div>
                      <div>
                        <div className={styles.customerName}>{review.authorName}</div>
                        <div className={styles.customerEmail}>{review.authorEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <Stars rating={review.rating} />
                  </td>
                  <td className={styles.td}>
                    <div className={styles.reviewBody}>
                      {review.title ? (
                        <div className={styles.reviewTitle}>{review.title}</div>
                      ) : null}
                      <p className={styles.reviewText}>{review.body}</p>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.dateCell}>
                      <span className={styles.dateMain}>{formatDate(review.createdAt)}</span>
                      <span className={styles.dateSub}>{formatTime(review.createdAt)}</span>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <span className={`${styles.status} ${statusClass(review.status)}`}>
                      {review.status}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <ReviewRowActions reviewId={review.id} status={review.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
