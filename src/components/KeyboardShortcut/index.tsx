import { Fragment } from 'react';
import cx from 'classnames';
import styles from './keyboardShortcut.module.scss';

interface KeyboardShortcutProps {
  keys: ('meta' | string)[];
}

export const KeyboardShortcut = ({ keys }: KeyboardShortcutProps) => (
  <span className={styles.root}>
    {keys.map((key, i) => (
      <Fragment key={key}>
        <kbd className={cx(styles.key, styles[`key--${key}`])}>
          <span>{key === 'meta' ? '⌘' : key}</span>
        </kbd>
        {i < keys.length - 1 && <span className={styles.joiner}>+</span>}
      </Fragment>
    ))}
  </span>
);
