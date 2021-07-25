import { Bounds, Position, Size } from './types';

// https://stackoverflow.com/a/42543908
export function getScrollParent(element: Element | null) {
  // If the page is server-rendered, early return
  // if (typeof document === 'undefined') {
  //   return null;
  // }

  // If no element is passed, return document element
  if (!element) {
    return document.documentElement;
  }

  let style = getComputedStyle(element);
  const excludeStaticParent = style.position === 'absolute';
  const overflowRegex = /(auto|scroll)/;

  // If element is fixed position, then it has no scroll parent
  // -> Return document element
  if (style.position === 'fixed') {
    return document.documentElement;
  }

  let parent: Element | null = element.parentElement;
  while (parent) {
    style = getComputedStyle(parent);

    // If the element is absolute but parent is static, find the parent
    if (excludeStaticParent && style.position === 'static') {
      parent = parent.parentElement;
      continue;
    }

    // If the parent is an overflow container of auto or scroll, we found scroll container!
    // -> Return this parent element!
    if (overflowRegex.test(style.overflow + style.overflowY + style.overflowX)) {
      return parent;
    }

    // Otherwise, continue looping
    parent = parent.parentElement;
  }

  // If all else fails, return document element
  return document.documentElement;
}

const MIN_DISTANCE_TO_SCROLL = 10;

// Gets the min bounds at which the viewport should scroll
export const getScrollBounds = (viewport: Element) => {
  let rect: Bounds;
  if (viewport === document.documentElement) {
    // If viewport is document, scrolling should occur at edges of window
    rect = {
      top: 0,
      bottom: window.innerHeight,
      left: 0,
      right: window.innerWidth,
    };
  } else {
    // Otherwise, scrolling should occur at edges of element
    rect = viewport.getBoundingClientRect();
  }

  return {
    top: rect.top + MIN_DISTANCE_TO_SCROLL,
    bottom: rect.bottom - MIN_DISTANCE_TO_SCROLL,
    left: rect.left + MIN_DISTANCE_TO_SCROLL,
    right: rect.right - MIN_DISTANCE_TO_SCROLL,
  };
};

// Get the actual amount of scrolling that the browser can do
export function getActualScrollDimensionDelta(
  viewport: Element,
  dimension: 'scrollLeft' | 'scrollTop',
  scrollBy: number,
) {
  const minScroll = 0;
  let maxScroll: number;
  if (dimension === 'scrollLeft') {
    maxScroll = viewport.scrollWidth - viewport.clientWidth;
  } else {
    maxScroll = viewport.scrollHeight - viewport.clientHeight;
  }

  const projectedScrollPosition = viewport[dimension] + scrollBy;
  const actualScrollPosition = Math.max(minScroll, Math.min(maxScroll, projectedScrollPosition));
  return scrollBy - (projectedScrollPosition - actualScrollPosition);
}

// Calculates the amount the browser should scroll on X + Y axes
export const getScrollDelta = (
  item: { position: Position; size?: Size },
  viewport: Element,
  scrollByOpts?: { scrollByDistance?: boolean },
) => {
  const scrollDelta: Position = {
    x: 0,
    y: 0,
  };
  const viewportScrollBounds = getScrollBounds(viewport);

  // Get the speed at which the DOM should scroll (in pixels/frame)
  function getScrollBy(distanceFromEdge: number, opts?: { scrollSpeedMax?: number }) {
    if (scrollByOpts?.scrollByDistance) {
      return distanceFromEdge;
    }
    const scrollSpeedMax = opts?.scrollSpeedMax ?? 3;
    const percentToEdge = Math.round(distanceFromEdge) / MIN_DISTANCE_TO_SCROLL;
    return Math.floor(percentToEdge * scrollSpeedMax);
  }

  // Auto-scroll the y axis
  if (item.position.y <= viewportScrollBounds.top) {
    // Handle scrolling up
    const scrollBy = getScrollBy(item.position.y - viewportScrollBounds.top);
    scrollDelta.y = getActualScrollDimensionDelta(viewport, 'scrollTop', scrollBy);
  } else if (item.position.y + (item.size?.height ?? 0) >= viewportScrollBounds.bottom) {
    // Handle scrolling down
    const scrollBy = getScrollBy(
      item.position.y + (item.size?.height ?? 0) - viewportScrollBounds.bottom,
    );
    scrollDelta.y = getActualScrollDimensionDelta(viewport, 'scrollTop', scrollBy);
  }

  // Auto-scroll the x axis
  if (item.position.x <= viewportScrollBounds.left) {
    // Handle scrolling left
    const scrollBy = getScrollBy(item.position.x - viewportScrollBounds.left);
    scrollDelta.x = getActualScrollDimensionDelta(viewport, 'scrollLeft', scrollBy);
  } else if (item.position.x + (item.size?.width ?? 0) >= viewportScrollBounds.right) {
    // Handle scrolling right
    const scrollBy = getScrollBy(
      item.position.x + (item.size?.width ?? 0) - viewportScrollBounds.right,
    );
    scrollDelta.x = getActualScrollDimensionDelta(viewport, 'scrollLeft', scrollBy);
  }

  return scrollDelta;
};
