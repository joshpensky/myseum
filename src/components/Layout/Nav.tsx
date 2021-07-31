import { ReactNode, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import tw, { css } from 'twin.macro';
import cx from 'classnames';
import useIsomorphicLayoutEffect from '@src/hooks/useIsomorphicLayoutEffect';
import Logo from '@src/svgs/Logo';
import UserAuthState from './UserAuthState';
import styles from './nav.module.scss';

const replaceableContent = css`
  > *:not(.no-replace):not(:first-child) {
    ${tw`hidden invisible`}
  }
`;

export interface NavProps {
  overrides?: {
    left?: ReactNode;
    center?: ReactNode;
    right?: ReactNode;
  };
  visible?: boolean;
}

const Nav = ({ overrides, visible: visibleOverride }: NavProps) => {
  const navRef = useRef<HTMLDivElement>(null);
  const [navHeightPx, setNavHeightPx] = useState(0);

  const [visible, setVisible] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
    };
  }, []);

  useEffect(() => {
    if (visible !== null || !visibleOverride) {
      setVisible(visibleOverride ?? false);
    }
  }, [visibleOverride]);

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
        mounted && [visible === true && styles.rootVisible, visible === false && styles.rootHidden],
      )}
      style={{ '--nav-height': `${navHeightPx}px` }}
      css={replaceableContent}>
      <div ref={navRef} css={tw`flex flex-1 py-2.5 px-4`}>
        <div id="nav-left" css={[tw`flex flex-1 items-center justify-start`, replaceableContent]}>
          {overrides?.left}
        </div>

        <div
          id="nav-center"
          css={[tw`flex flex-1 items-center justify-center`, replaceableContent]}>
          {overrides?.center}
          <Link passHref href="/">
            <a css={tw`flex h-8`}>
              <Logo />
            </a>
          </Link>
        </div>

        <div id="nav-right" css={[tw`flex flex-1 items-center justify-end`, replaceableContent]}>
          {overrides?.right}
          <UserAuthState />
        </div>
      </div>
    </nav>
  );
};

export default Nav;
