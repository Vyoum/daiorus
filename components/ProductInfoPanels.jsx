'use client';

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import ProductPriceBreakup from './ProductPriceBreakup';
import { buildProductSpecGroups } from '../lib/price-breakup';
import styles from './ProductInfoPanels.module.css';

function Accordion({ title, open, onToggle, children }) {
  return (
    <div className={styles.accordion}>
      <button
        type="button"
        className={styles.accordionBtn}
        aria-expanded={open}
        onClick={onToggle}
      >
        <span>{title}</span>
        {open ? <Minus size={16} strokeWidth={1.75} /> : <Plus size={16} strokeWidth={1.75} />}
      </button>
      {open ? <div className={styles.accordionBody}>{children}</div> : null}
    </div>
  );
}

function SpecRows({ rows }) {
  if (!rows?.length) return null;
  return (
    <dl className={styles.specList}>
      {rows.map((row) => (
        <div key={row.label} className={styles.specRow}>
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function ProductInfoPanels({ product }) {
  const groups = buildProductSpecGroups(product);
  const [openKey, setOpenKey] = useState('breakup');

  const toggle = (key) => {
    setOpenKey((prev) => (prev === key ? null : key));
  };

  return (
    <div className={styles.wrap}>
      {groups.productDetails.length ? (
        <Accordion
          title="Product Details"
          open={openKey === 'details'}
          onToggle={() => toggle('details')}
        >
          <SpecRows rows={groups.productDetails} />
          {product.description ? (
            <p className={styles.description}>{product.description}</p>
          ) : null}
        </Accordion>
      ) : null}

      {groups.diamondDetails.length ? (
        <Accordion
          title="Diamond Details"
          open={openKey === 'diamond'}
          onToggle={() => toggle('diamond')}
        >
          <SpecRows rows={groups.diamondDetails} />
        </Accordion>
      ) : null}

      {groups.metalDetails.length ? (
        <Accordion
          title="Metal Details"
          open={openKey === 'metal'}
          onToggle={() => toggle('metal')}
        >
          <SpecRows rows={groups.metalDetails} />
        </Accordion>
      ) : null}

      <Accordion
        title="Price Breakup"
        open={openKey === 'breakup'}
        onToggle={() => toggle('breakup')}
      >
        <ProductPriceBreakup product={product} />
      </Accordion>
    </div>
  );
}
