import { ComponentType, PropsWithChildren } from 'react';
import Button from '@src/components/Button';
import styles from './reviewSection.module.scss';

export interface ReviewSectionProps {
  icon: ComponentType;
  title: string;
  onEdit(): void;
}

export const ReviewSection = ({
  children,
  icon: Icon,
  onEdit,
  title,
}: PropsWithChildren<ReviewSectionProps>) => (
  <section className={styles.section}>
    <header className={styles.sectionHeader}>
      <span className={styles.sectionIcon} aria-hidden="true">
        <Icon />
      </span>
      <h4>{title}</h4>
    </header>

    {children}

    <Button className={styles.sectionEdit} onClick={() => onEdit()}>
      Edit
    </Button>
  </section>
);
