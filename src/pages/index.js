import Link from "next/link";
import styles from "@/styles/Home.module.css";
import { useState } from "react";

export default function Home() {
  const [showMessage, setShowMessage] = useState(false);

  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        <img
          src="../.././chemistry-banner.png"
          alt="Chemical Process Banner"
          className={styles.heroImage}
        />
        <h1 className={styles.title}>
          Welcome to Chemical Process Calculations Calculator
        </h1>
        <p className={styles.typewriter}>
          Your companion for mastering Chemical Process Calculations.
        </p>

        <p className={styles.subtitleExtra}>
          Learn faster with interactive tools, step-by-step guidance, and clear
          visual explanations. Whether you’re solving your first material
          balance or diving into energy calculations, we’ve got you covered!
        </p>
      </header>

      <section className={styles.cards}>
        {/* CPC One - Active */}
        <Link href="/cpc-one" className={styles.card}>
          <img
            src="../.././cpc1.png"
            alt="CPC One"
            className={styles.cardImage}
          />
          <h2>CPC One</h2>
          <p>Start with the basics and solve your first process problems.</p>
        </Link>

        {/* CPC Two - Disabled / Under Construction */}
        <div
          className={`${styles.card} cursor-not-allowed opacity-60`}
          onClick={() => setShowMessage(true)}
          title="This part is still under construction"
        >
          <img
            src="../.././cpc2.png"
            alt="CPC Two"
            className={styles.cardImage}
          />
          <h2>CPC Two</h2>
          <p>Dive deeper into advanced calculations and problem-solving.</p>
        </div>

        <Link href="/properties" className={styles.card}>
          <img
            src="../.././periodic-table.png"
            alt="Properties table"
            className={styles.cardImage}
          />
          <h2>Properties Table</h2>
          <p>
            Key compound data: molar mass, melting points, heat capacity, and
            more.
          </p>
        </Link>

        <p className={styles.typewriter}>
          © {new Date().getFullYear()} UniCram. All rights reserved.
        </p>

        {showMessage && (
          <div className="fixed top-4 right-4 bg-yellow-100 text-yellow-800 border border-yellow-300 px-4 py-2 rounded shadow-lg">
            CPC Two is still under construction! 🚧
            <button
              className="ml-4 text-sm font-bold"
              onClick={() => setShowMessage(false)}
            >
              Close
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
