import { Fragment, PropsWithChildren, useEffect, useState } from 'react';

type ClientOnlyProps = Record<never, string>;

export const ClientOnly = ({ children }: PropsWithChildren<ClientOnlyProps>) => {
  const [mounted, setMounted] = useState(false);

  // `useEffect` is only run client-side, so this will allow mount
  // the component once the effect has run
  useEffect(() => {
    setMounted(true);
  }, []);

  return <Fragment>{mounted && children}</Fragment>;
};
