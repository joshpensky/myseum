import { ComponentType } from 'react';
import { GlobalLayoutProps } from './layouts/GlobalLayout';

export type PageComponent<
  PageProps = any,
  ComputedPageProps = PageProps
> = ComponentType<ComputedPageProps> & {
  useComputedProps?(pageProps: PageProps): { global: GlobalLayoutProps; page: ComputedPageProps };
};

export type Position = {
  x: number;
  y: number;
};

export type Dimensions = {
  width: number;
  height: number;
};
export type Dimensions3D = {
  width: number;
  height: number;
  depth: number;
};
