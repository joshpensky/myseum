import Link from 'next/link';
import styles from './footer.module.scss';

export const Footer = () => (
  <footer className={styles.footer}>
    <p>
      Made with ♥ by{' '}
      <a href="https://joshpensky.com" target="_blank" rel="noreferrer noopener">
        Josh Pensky
      </a>
    </p>

    <ul aria-label="Links" className={styles.links}>
      <li className={styles.linksItem}>
        <Link href="/privacy">
          <a>Privacy</a>
        </Link>
      </li>
      <li className={styles.linksItem}>
        <Link href="/terms">
          <a>Terms</a>
        </Link>
      </li>
      <li className={styles.linksItem}>
        <Link href="/accessibility">
          <a>Accessibility</a>
        </Link>
      </li>
    </ul>
  </footer>
);
