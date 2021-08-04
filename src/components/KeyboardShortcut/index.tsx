import { Fragment } from 'react';
import cx from 'classnames';
import styles from './keyboardShortcut.module.scss';

type Key = 'meta' | 'alt' | 'ctrl' | 'shift' | string;

interface KeyboardShortcutProps {
  keys: Key[];
}

export const KeyboardShortcut = ({ keys }: KeyboardShortcutProps) => {
  const isOSX = /(Mac OS X)/gi.test(navigator.userAgent);

  const getKeyValue = (key: Key) => {
    switch (key) {
      case 'meta': {
        return isOSX ? '⌘' : 'ctrl';
      }
      case 'alt': {
        return isOSX ? 'option' : 'alt';
      }
      default: {
        return key.toLowerCase();
      }
    }
  };

  const getKeyLabel = (key: Key) => {
    switch (key) {
      case 'meta': {
        return isOSX ? 'command' : 'control';
      }
      case 'alt': {
        return isOSX ? 'option' : 'alt';
      }
      case 'ctrl': {
        return 'control';
      }
      default: {
        return key.toLowerCase();
      }
    }
  };

  return (
    <span className={cx(styles.root, isOSX && styles.rootMac)}>
      {keys.map(key => (
        <Fragment key={key}>
          <kbd className={cx(styles.key, styles[`key--${key}`])}>
            <span aria-label={getKeyLabel(key)}>{getKeyValue(key)}</span>
          </kbd>
        </Fragment>
      ))}
    </span>
  );
};
