import cx from 'classnames';
import Logo from '@src/svgs/Logo';
import styles from './nav.module.scss';

const Nav = () => (
  <nav id="nav" className={styles.navContent}>
    <div className={styles.navInner}>
      <div
        id="nav-left"
        className={cx(styles.navInnerItem, styles.navInnerItemLeft, styles.navContent)}
      />

      <div id="nav-center" className={(styles.navInnerItem, styles.navContent)}>
        <span className={styles.logo}>
          <Logo />
        </span>
      </div>

      <div
        id="nav-right"
        className={cx(styles.navInnerItem, styles.navInnerItemRight, styles.navContent)}
      />
    </div>
  </nav>
);

export default Nav;
