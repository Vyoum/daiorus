import React from 'react';
import { Flag, Pencil, Calculator, Plus } from 'lucide-react';
import styles from './pricing.module.css';

export default function OverseasPricing() {
  return (
    <div>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>Overseas Pricing Module</h1>
        <p className={styles.pageSubtitle}>
          Configure global surcharges, regional shipping logic, and preview international price translations.
        </p>
      </header>

      <div className={styles.contentGrid}>
        
        {/* Left Column: Configurations */}
        <div className={styles.configCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Global Strategy Baseline</h2>
            <button className={styles.editBtn}>Edit Global Rules</button>
          </div>

          <div className={styles.baselineGrid}>
            <div className={styles.baselineBox}>
              <span className={styles.baselineLabel}>Base Overseas Surcharge</span>
              <div className={styles.baselineValueRow}>
                <span className={styles.baselineValue}>15%</span>
                <span className={styles.baselineDesc}>applied to base price</span>
              </div>
            </div>
            
            <div className={styles.baselineBox}>
              <span className={styles.baselineLabel}>Global Free Shipping Threshold</span>
              <div className={styles.baselineValueRow}>
                <span className={styles.baselineValue}>$250</span>
                <span className={styles.baselineDesc}>USD equivalent</span>
              </div>
            </div>

            <div className={styles.baselineBox}>
              <span className={styles.baselineLabel}>Standard Handling Fee</span>
              <div className={styles.baselineValueRow}>
                <span className={styles.baselineValue}>$12</span>
                <span className={styles.baselineDesc}>per order</span>
              </div>
            </div>
          </div>

          <h3 className={styles.subTitle}>Regional Configurations</h3>
          
          <div className={styles.regionList}>
            {/* Region 1 */}
            <div className={styles.regionRow}>
              <div className={styles.regionName}>
                <Flag className={styles.regionFlag} size={16} />
                United States
              </div>
              <div className={styles.regionStat}>
                Surcharge: <span className={styles.regionStatValue}>+12%</span>
              </div>
              <div className={styles.regionStat}>
                Free Ship: <span className={styles.regionStatValue}>$200</span>
              </div>
              <button className={styles.regionAction}><Pencil size={14} /></button>
            </div>

            {/* Region 2 */}
            <div className={styles.regionRow}>
              <div className={styles.regionName}>
                <Flag className={styles.regionFlag} size={16} />
                United Kingdom
              </div>
              <div className={styles.regionStat}>
                Surcharge: <span className={styles.regionStatValue}>+18%</span>
              </div>
              <div className={styles.regionStat}>
                Free Ship: <span className={styles.regionStatValue}>£150</span>
              </div>
              <button className={styles.regionAction}><Pencil size={14} /></button>
            </div>

            {/* Region 3 */}
            <div className={styles.regionRow}>
              <div className={styles.regionName}>
                <Flag className={styles.regionFlag} size={16} />
                Australia
              </div>
              <div className={styles.regionStat}>
                Surcharge: <span className={styles.regionStatValue}>+20%</span>
              </div>
              <div className={styles.regionStat}>
                Free Ship: <span className={styles.regionStatValue}>$300 AUD</span>
              </div>
              <button className={styles.regionAction}><Pencil size={14} /></button>
            </div>

            {/* Region 4 */}
            <div className={styles.regionRow}>
              <div className={styles.regionName}>
                <Flag className={styles.regionFlag} size={16} />
                India
              </div>
              <div className={styles.regionStat}>
                Surcharge: <span className={styles.regionStatValue}>+25%</span>
              </div>
              <div className={styles.regionStat}>
                Free Ship: <span className={styles.regionStatValue}>₹25,000</span>
              </div>
              <button className={styles.regionAction}><Pencil size={14} /></button>
            </div>
          </div>

          <button className={styles.addRegionBtn}>
            <Plus size={14} strokeWidth={3} /> Add Region Exception
          </button>
        </div>

        {/* Right Column: Preview Calculator */}
        <div className={styles.previewCard}>
          <div className={styles.previewHeader}>
            <Calculator size={20} />
            <h2 className={styles.previewTitle}>Pricing Preview</h2>
          </div>
          <p className={styles.previewDesc}>
            Test how base prices translate across active regions based on current rules.
          </p>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Base Price (USD)</label>
            <div className={styles.darkInputWrapper}>
              <span className={styles.currencySymbol}>$</span>
              <input type="text" className={styles.darkInput} defaultValue="100.00" />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Target Region</label>
            <select className={styles.darkSelect} defaultValue="UK">
              <option value="US">United States</option>
              <option value="UK">United Kingdom</option>
              <option value="AU">Australia</option>
              <option value="IN">India</option>
            </select>
          </div>

          <div className={styles.calculationArea}>
            <div className={styles.calcRow}>
              <span className={styles.calcLabel}>Base Price</span>
              <span className={styles.calcValue}>$100.00</span>
            </div>
            <div className={styles.calcRow}>
              <span className={styles.calcLabel}>Regional Surcharge (18%)</span>
              <span className={styles.calcValue}>+$18.00</span>
            </div>
            
            <div className={styles.calcDivider}></div>
            
            <div className={styles.calcRow}>
              <span className={styles.calcLabel}>Est. Exchange Rate</span>
              <span className={styles.calcValue}>
                x 0.79 GBP
                <span className={styles.calcSubtext}>Live Rate</span>
              </span>
            </div>

            <div className={styles.calcDivider}></div>

            <div className={styles.finalPriceRow}>
              <span className={styles.finalPriceLabel}>Final Display Price</span>
              <span className={styles.finalPriceValue}>£93.22</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
