import React from 'react';
import PropTypes from 'prop-types';
import Nav from '@src/components/Nav';
import styles from './layout.module.scss';

const Layout = ({ children }) => (
  <div className={styles.page}>
    <Nav />

    <main className={styles.main}>{children}</main>
  </div>
);

Layout.propTypes = {
  children: PropTypes.node,
};

export default Layout;
