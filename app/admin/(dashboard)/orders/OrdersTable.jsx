'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronDown,
  Printer,
  Truck,
  MoreHorizontal,
  RefreshCw,
  Check,
  Undo2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import {
  formatDate,
  formatTime,
  formatINR,
  initials,
  paymentLabel,
  fulfillmentLabel,
} from '../../../../lib/admin/format';
import styles from './orders.module.css';

function FulfillIcon({ tone }) {
  if (tone === 'delivered') return <Check size={14} className={`${styles.fulfillIcon} ${styles.delivered}`} />;
  if (tone === 'processing') return <RefreshCw size={14} className={styles.fulfillIcon} />;
  if (tone === 'refunded') return <Undo2 size={12} className={styles.fulfillIcon} style={{ marginRight: 4 }} />;
  return (
    <span
      className={`${styles.paymentDot} ${styles.paid}`}
      style={{ backgroundColor: 'var(--admin-danger)' }}
    />
  );
}

function shipmentStatusLabel(order) {
  const shipment = order.shipment;
  if (shipment?.docketNumber) {
    if (order.status === 'PENDING') {
      return { kind: 'booked_sequel', message: 'Booked in Sequel (payment pending)' };
    }
    return { kind: 'booked' };
  }
  if (shipment?.status === 'FAILED') {
    return {
      kind: 'failed',
      message: shipment.errorMessage || 'Booking failed',
      hint: 'Click Retry to try again',
    };
  }
  if (shipment?.status === 'CANCELLED') {
    return { kind: 'cancelled', message: 'Cancelled' };
  }
  if (order.status === 'PENDING') {
    return { kind: 'ready_pending', message: 'Unpaid — admin can book in Sequel for testing' };
  }
  if (order.status === 'CANCELLED' || order.status === 'REFUNDED') {
    return { kind: 'na', message: '—' };
  }
  if (order.status === 'PAID' || order.status === 'PROCESSING') {
    return { kind: 'ready', message: 'Ready to ship' };
  }
  if (order.status === 'SHIPPED' || order.status === 'DELIVERED') {
    return { kind: 'ready', message: 'Not booked' };
  }
  return { kind: 'na', message: '—' };
}

function canBookShipment(order) {
  if (order.country && String(order.country).toUpperCase() !== 'IN') return false;
  if (order.shipment?.status === 'BOOKED' && order.shipment?.docketNumber) return false;
  if (order.shipment?.status === 'FAILED') return true;
  return ['PENDING', 'PAID', 'PROCESSING'].includes(order.status);
}

function shipButtonLabel(order, rowBusy) {
  if (rowBusy) return '…';
  if (order.shipment?.status === 'FAILED') return 'Retry';
  if (order.status === 'PENDING') return 'Book in Sequel';
  return 'Ship';
}

async function bookShipment(orderId, { force = false } = {}) {
  const res = await fetch('/api/admin/sequel247/shipment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, force }),
  });
  const data = await res.json();
  if (!res.ok) {
    const message = [data.error, data.hint].filter(Boolean).join(' ');
    throw new Error(message || data.reason || 'Could not create shipment');
  }
  return data;
}

export default function OrdersTable({ orders, total, sequelConfigured }) {
  const router = useRouter();
  const [selected, setSelected] = useState(() => new Set());
  const [busyIds, setBusyIds] = useState(() => new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [message, setMessage] = useState('');

  const selectableShippable = useMemo(
    () => orders.filter((order) => canBookShipment(order)),
    [orders],
  );

  const allShippableSelected =
    selectableShippable.length > 0 && selectableShippable.every((order) => selected.has(order.id));

  const selectedShippableCount = useMemo(
    () => orders.filter((order) => selected.has(order.id) && canBookShipment(order)).length,
    [orders, selected],
  );

  const toggleAll = () => {
    if (allShippableSelected) {
      setSelected(new Set());
      return;
    }
    setSelected(new Set(selectableShippable.map((order) => order.id)));
  };

  const toggleOne = (orderId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  const runBook = async (orderIds, { force = false } = {}) => {
    const results = [];
    for (const orderId of orderIds) {
      setBusyIds((prev) => new Set(prev).add(orderId));
      try {
        const data = await bookShipment(orderId, { force });
        results.push({ orderId, ok: true, data });
      } catch (err) {
        results.push({ orderId, ok: false, error: err.message || 'Failed' });
      } finally {
        setBusyIds((prev) => {
          const next = new Set(prev);
          next.delete(orderId);
          return next;
        });
      }
    }

    const okCount = results.filter((r) => r.ok).length;
    const failCount = results.length - okCount;
    if (failCount === 0) {
      setMessage(`Created ${okCount} shipment${okCount === 1 ? '' : 's'}.`);
    } else {
      const firstError = results.find((r) => !r.ok)?.error;
      setMessage(
        `Booked ${okCount}, failed ${failCount}${firstError ? `: ${firstError}` : ''}.`,
      );
    }

    setSelected(new Set());
    router.refresh();
  };

  const handleBulkShip = async () => {
    if (bulkBusy || selectedShippableCount === 0) return;
    setBulkBusy(true);
    setMessage('');
    try {
      const ids = orders
        .filter((order) => selected.has(order.id) && canBookShipment(order))
        .map((order) => order.id);
      await runBook(ids);
    } finally {
      setBulkBusy(false);
    }
  };

  const handleRowShip = async (order, { force = false } = {}) => {
    if (busyIds.has(order.id)) return;
    setMessage('');
    await runBook([order.id], { force });
  };

  return (
    <div className={styles.tableContainer}>
      <div className={styles.filterContainer}>
        <div className={styles.filterGroup}>
          <button type="button" className={`${styles.dropdownBtn} ${styles.activeFilter}`}>
            All Time <ChevronDown size={14} />
          </button>
        </div>

        <div className={styles.bulkActions}>
          <button type="button" className={styles.bulkActionBtn} disabled>
            <Printer size={16} />
            Print Invoices
          </button>
          <button
            type="button"
            className={`${styles.bulkActionBtn} ${selectedShippableCount > 0 ? styles.bulkActionBtnActive : ''}`}
            disabled={bulkBusy || selectedShippableCount === 0}
            onClick={handleBulkShip}
          >
            <Truck size={16} />
            {bulkBusy ? 'Creating…' : `Book in Sequel${selectedShippableCount ? ` (${selectedShippableCount})` : ''}`}
          </button>
        </div>
      </div>

      {message ? <p className={styles.shipmentMessage}>{message}</p> : null}

      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th} style={{ width: 40 }}>
              <input
                type="checkbox"
                className={styles.checkbox}
                aria-label="Select shippable orders"
                checked={allShippableSelected}
                onChange={toggleAll}
                disabled={selectableShippable.length === 0}
              />
            </th>
            <th className={styles.th}>Order</th>
            <th className={styles.th}>Date</th>
            <th className={styles.th}>Customer</th>
            <th className={styles.th}>Product</th>
            <th className={styles.th}>Total</th>
            <th className={styles.th}>Payment</th>
            <th className={styles.th}>Fulfillment</th>
            <th className={`${styles.th} ${styles.shipmentColumn}`}>Shipment</th>
            <th className={styles.th} />
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr className={styles.tr}>
              <td className={styles.td} colSpan={10} style={{ textAlign: 'center', padding: 40 }}>
                No orders yet. Paid checkouts will appear here.
              </td>
            </tr>
          ) : (
            orders.map((order) => {
              const payment = paymentLabel(order.status);
              const fulfill = fulfillmentLabel(order.status);
              const shippable = canBookShipment(order);
              const rowBusy = busyIds.has(order.id);
              const shipment = order.shipment;
              const shipmentLabel = shipmentStatusLabel(order);

              return (
                <tr key={order.id} className={styles.tr}>
                  <td className={styles.td}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      aria-label={`Select ${order.orderNumber}`}
                      checked={selected.has(order.id)}
                      onChange={() => toggleOne(order.id)}
                      disabled={!shippable}
                    />
                  </td>
                  <td className={styles.td}>
                    <span className={styles.orderId}>{order.orderNumber}</span>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.dateCell}>
                      <span className={styles.dateMain}>{formatDate(order.createdAt)}</span>
                      <span className={styles.dateSub}>{formatTime(order.createdAt)}</span>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.customerCell}>
                      <div className={styles.customerAvatar}>{initials(order.customerName)}</div>
                      <div className={styles.customerInfo}>
                        <span className={styles.customerName}>{order.customerName}</span>
                        <span className={styles.customerEmail}>{order.customerEmail}</span>
                      </div>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.productCell}>
                      {order.productImage ? (
                        <img src={order.productImage} alt="" className={styles.productImage} />
                      ) : (
                        <div className={styles.productImage} />
                      )}
                      <span className={styles.productName}>{order.productName}</span>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.price}>{formatINR(order.totalInr)}</span>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.paymentBadge}>
                      <span className={`${styles.paymentDot} ${styles[payment.tone] || styles.pending}`} />
                      {payment.label}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.fulfillBadge}>
                      <FulfillIcon tone={fulfill.tone} /> {fulfill.label}
                    </span>
                  </td>
                  <td className={`${styles.td} ${styles.shipmentColumn}`}>
                    <div className={styles.shipmentCell}>
                      {shipment?.docketNumber ? (
                        <>
                          <span className={styles.docketNumber}>{shipment.docketNumber}</span>
                          {order.status === 'PENDING' ? (
                            <span className={styles.shipmentSequelOnly}>Sequel dashboard only</span>
                          ) : null}
                          {shipment.estimatedDelivery ? (
                            <span className={styles.shipmentMeta}>EDD: {shipment.estimatedDelivery}</span>
                          ) : null}
                          {shipment.docketPrintUrl ? (
                            <a
                              href={shipment.docketPrintUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.shipmentLink}
                            >
                              Label <ExternalLink size={12} />
                            </a>
                          ) : null}
                        </>
                      ) : shipmentLabel.kind === 'failed' ? (
                        <div className={styles.shipmentErrorBlock}>
                          <span className={styles.shipmentError}>{shipmentLabel.message}</span>
                          {shipmentLabel.hint ? (
                            <span className={styles.shipmentMeta}>{shipmentLabel.hint}</span>
                          ) : null}
                        </div>
                      ) : shipmentLabel.kind === 'ready' || shipmentLabel.kind === 'ready_pending' ? (
                        <div className={styles.shipmentReadyBlock}>
                          <span className={styles.shipmentReady}>{shipmentLabel.message}</span>
                          {shippable ? (
                            <button
                              type="button"
                              className={styles.shipBtnInline}
                              disabled={rowBusy}
                              onClick={() => handleRowShip(order)}
                            >
                              <Truck size={14} />
                              {shipButtonLabel(order, rowBusy)}
                            </button>
                          ) : null}
                        </div>
                      ) : (
                        <span className={styles.shipmentMeta}>{shipmentLabel.message}</span>
                      )}
                    </div>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.rowActions}>
                      {shippable ? (
                        <button
                          type="button"
                          className={styles.shipBtn}
                          disabled={rowBusy}
                          onClick={() =>
                            handleRowShip(order, {
                              force: order.shipment?.status === 'FAILED',
                            })
                          }
                        >
                          {order.shipment?.status === 'FAILED' ? (
                            <RefreshCw size={14} />
                          ) : (
                            <Truck size={14} />
                          )}
                          {shipButtonLabel(order, rowBusy)}
                        </button>
                      ) : (
                        <MoreHorizontal size={18} className={styles.moreBtn} />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      <div className={styles.pagination}>
        <span className={styles.paginationText}>
          Showing {orders.length === 0 ? 0 : 1} to {orders.length} of {total} orders
        </span>
        <div className={styles.paginationControls}>
          <button type="button" className={styles.pageBtn} disabled>
            <ChevronLeft size={16} />
          </button>
          <button type="button" className={`${styles.pageBtn} ${styles.active}`}>
            1
          </button>
          <button type="button" className={styles.pageBtn} disabled>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
