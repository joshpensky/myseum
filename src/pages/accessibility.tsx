import Link from 'next/link';
import { BasicPageLayout } from '@src/layouts/BasicPageLayout';

const Accessibility = () => (
  <BasicPageLayout title="Accessibility">
    <p>This is an accessibility statement from Myseum.</p>

    <h2>Conformance status</h2>

    <p>
      The{' '}
      <Link href="https://www.w3.org/WAI/standards-guidelines/wcag/">
        <a>Web Content Accessibility Guidelines (WCAG)</a>
      </Link>{' '}
      defines requirements for designers and developers to improve accessibility for people with
      disabilities. It defines three levels of conformance: Level A, Level AA, and Level AAA. Myseum
      is fully conformant with WCAG 2.1 level AA. Fully conformant means that the content fully
      conforms to the accessibility standard without any exceptions.
    </p>

    <h2>Date</h2>

    <p>
      This statement was created on 17 May 2022 using the{' '}
      <Link href="https://www.w3.org/WAI/planning/statements/">
        <a>W3C Accessibility Statement Generator Tool.</a>
      </Link>
    </p>
  </BasicPageLayout>
);

export default Accessibility;
