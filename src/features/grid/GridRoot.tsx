import { PropsWithChildren, ReactNode, useRef, useState } from 'react';
import useIsomorphicLayoutEffect from '@src/hooks/useIsomorphicLayoutEffect';
import { Dimensions, Position } from '@src/types';
import { GridItemChildProps } from './GridItem';
import { getScrollParent } from './scroll';
import { GridContext } from './useGrid';

export interface GridItemDto {
  position: Position;
  size: Dimensions;
}

export interface GridRenderItemProps extends GridItemChildProps {
  disabled: boolean;
}

interface GridRootProps<Item extends GridItemDto> {
  preview?: boolean;
  size: Dimensions;
  step?: number;
  // more
  items: Item[];
  getItemId(item: Item): string;
  onItemChange?: ((index: number, value: Item) => void) | false;
  onSizeChange?(value: Dimensions): void;
  renderItem(item: Item, props: GridRenderItemProps, index: number): ReactNode;
}

export const GridRoot = <Item extends GridItemDto>({
  children,
  preview,
  size,
  step,
  items,
  getItemId,
  onItemChange,
  onSizeChange,
  renderItem,
}: PropsWithChildren<GridRootProps<Item>>) => {
  const rootElRef = useRef<HTMLDivElement>(null);
  const scrollElRef = useRef<Element>();
  const gridRef = useRef<HTMLDivElement>(null);

  const [projectedItem, setProjectedItem] = useState<GridItemDto | null>(null);

  const [widthPx, setWidthPx] = useState(0);
  const [heightPx, setHeightPx] = useState(0);

  // Observe resizes to the page grid
  useIsomorphicLayoutEffect(() => {
    if (rootElRef.current) {
      scrollElRef.current = getScrollParent(rootElRef.current);

      const observer = new ResizeObserver(entries => {
        const [rootEl] = entries;
        setHeightPx(rootEl.contentRect.height);
        setWidthPx(rootEl.contentRect.width);
      });
      observer.observe(rootElRef.current);
      return () => {
        observer.disconnect();
      };
    }
  }, []);

  // Calculate the grid unit size as the element height divided by the grid size height (# of rows)
  const unitPx = heightPx / size.height;

  const gridWidth = Math.max(size.width, !unitPx ? 0 : widthPx / unitPx);

  return (
    <GridContext.Provider
      value={{
        step: step ?? 1,
        preview: preview ?? false,
        unitPx,
        size: { height: size.height, width: gridWidth },
        viewportRef: scrollElRef,
        rootElRef,
        gridRef,
        items,
        getItemId,
        onItemChange: onItemChange as any,
        onSizeChange,
        renderItem,
        projectedItem,
        setProjectedItem,
      }}>
      {children}
    </GridContext.Provider>
  );
};
