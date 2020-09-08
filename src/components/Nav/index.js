import React from 'react';
import PropTypes from 'prop-types';
import c from 'classnames';
import styles from './nav.module.scss';

const Nav = () => (
  <nav id="nav" className={styles.navContent}>
    <div className={styles.navInner}>
      <div
        id="nav-left"
        className={c(styles.navInnerItem, styles.navInnerItemLeft, styles.navContent)}
      />

      <div id="nav-center" className={(styles.navInnerItem, styles.navContent)}>
        <h1>Logo</h1>
      </div>

      <div
        id="nav-right"
        className={c(styles.navInnerItem, styles.navInnerItemRight, styles.navContent)}>
        <button className={styles.navContentNoReplace}>Log in</button>
      </div>
    </div>
  </nav>
);

Nav.propTypes = {
  children: PropTypes.node,
};

export default Nav;
