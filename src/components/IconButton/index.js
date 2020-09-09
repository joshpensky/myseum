import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import styles from './iconButton.module.scss';

const IconButton = forwardRef(({ icon: Icon, title, onClick }, ref) => (
  <button ref={ref} className={styles.button} title={title} onClick={onClick}>
    <span className={styles.icon}>
      <Icon />
    </span>
  </button>
));

IconButton.displayName = 'IconButton';

IconButton.propTypes = {
  icon: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

export default IconButton;
