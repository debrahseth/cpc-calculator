import Link from "next/link";
import styles from "@/styles/Home.module.css";

export default function Home() {
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
        <Link href="/cpc-one" className={styles.card}>
          <img
            src="../.././cpc1.png"
            alt="CPC One"
            className={styles.cardImage}
          />
          <h2>CPC One</h2>
          <p>Start with the basics and solve your first process problems.</p>
        </Link>

        <Link href="/cpc-two" className={styles.card}>
          <img
            src="../.././cpc2.png"
            alt="CPC Two"
            className={styles.cardImage}
          />
          <h2>CPC Two</h2>
          <p>Dive deeper into advanced calculations and problem-solving.</p>
        </Link>
      </section>
    </div>
  );
}
