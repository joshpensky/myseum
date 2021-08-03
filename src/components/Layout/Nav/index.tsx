import { ReactNode, useRef, useState } from 'react';
import Link from 'next/link';
import cx from 'classnames';
import UserAuthState from '@src/components/Layout/UserAuthState';
import useIsomorphicLayoutEffect from '@src/hooks/useIsomorphicLayoutEffect';
import Logo from '@src/svgs/Logo';
import styles from './nav.module.scss';

const ANIM_DURATION = Number.parseInt(styles.varAnimDuration, 10);

export interface NavProps {
  overrides?: {
    left?: ReactNode;
    center?: ReactNode;
    right?: ReactNode;
  };
  visible: boolean | null;
  onAnimationChange(isAnimating: boolean): void;
}

const Nav = ({ onAnimationChange, overrides, visible }: NavProps) => {
  const navRef = useRef<HTMLDivElement>(null);
  const [navHeightPx, setNavHeightPx] = useState(0);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (visible !== null) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      onAnimationChange(true);
      timeoutRef.current = setTimeout(() => {
        onAnimationChange(false);
      }, ANIM_DURATION);
    }
  }, [visible]);

  useIsomorphicLayoutEffect(() => {
    if (navRef.current) {
      const observer = new ResizeObserver(entries => {
        const [nav] = entries;
        setNavHeightPx(nav.borderBoxSize[0].blockSize);
      });
      observer.observe(navRef.current);
      return () => {
        observer.disconnect();
      };
    }
  }, []);

  return (
    <nav
      id="nav"
      className={cx(
        styles.root,
        visible !== null && (visible ? styles.rootVisible : styles.rootHidden),
        styles.navReplaceableContent,
      )}
      style={{ '--nav-height': `${navHeightPx}px` }}>
      <div ref={navRef} className={styles.navSections}>
        <div id="nav-left" className={cx(styles.navSectionsItem, styles.navReplaceableContent)}>
          {overrides?.left}
        </div>

        <div id="nav-center" className={cx(styles.navSectionsItem, styles.navReplaceableContent)}>
          {overrides?.center}
          <Link passHref href="/">
            <a className={styles.navLogo}>
              <Logo />
            </a>
          </Link>
        </div>

        <div id="nav-right" className={cx(styles.navSectionsItem, styles.navReplaceableContent)}>
          {overrides?.right}
          <div className="no-replace">
            <UserAuthState />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
