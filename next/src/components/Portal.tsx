import { useEffect, useRef, Children, PropsWithChildren, ReactPortal } from 'react';
import { createPortal } from 'react-dom';

export type PortalProps = {
  className?: string;
  prepend?: boolean;
  to: string | HTMLElement;
};

/**
 * Mounts a portal to another element on the page. The `to` prop refers
 * to the ID of the element to mount to.
 *
 * @example
 * ```
 * <div id="modal-root"></div>
 * {isModalOpen && (
 *   <Portal to="modal-root">
 *     <Modal />
 *   </Portal>
 * )}
 * ```
 */
const Portal = ({
  className,
  children,
  prepend,
  to,
}: PropsWithChildren<PortalProps>): ReactPortal => {
  const portalRoot = useRef<HTMLElement | null>(null);
  const childRoot = useRef(document.createElement('div'));

  // Get a reference of our portal root point
  useEffect(() => {
    if (typeof to === 'string') {
      portalRoot.current = document.querySelector(`#${to}`);
    } else {
      portalRoot.current = to;
    }
  }, [to]);

  useEffect(() => {
    if (className) {
      childRoot.current.classList.add(className);

      return () => {
        childRoot.current.classList.remove(className);
      };
    }
  }, [className]);

  useEffect(() => {
    if (portalRoot.current) {
      const child = childRoot.current;

      // When the child should mount, we will either prepend or append it to the portal root
      if (prepend) {
        const firstChild = portalRoot.current.firstChild;
        portalRoot.current.insertBefore(child, firstChild);
      } else {
        portalRoot.current.appendChild(child);
      }

      return () => {
        // Then when component unmounts, we will unmount it from the portal
        if (portalRoot.current?.contains(child)) {
          portalRoot.current.removeChild(child);
        }
      };
    }
  }, [prepend, to]);

  return createPortal(Children.only(children), childRoot.current);
};

export default Portal;
