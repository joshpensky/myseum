import { Fragment, useRef } from 'react';
import { useField } from 'formik';
import { FieldWrapper } from '@src/components/FieldWrapper';
import IconButton from '@src/components/IconButton';
import { TextField } from '@src/components/TextField';
import { CloseIcon } from '@src/svgs/Close';
import { SearchIcon } from '@src/svgs/SearchIcon';
import styles from './searchBar.module.scss';

interface SearchBarProps {
  label: string;
  name: string;
}

export const SearchBar = ({ label, name }: SearchBarProps) => {
  const [, meta, helpers] = useField(name);
  const fieldRef = useRef<HTMLInputElement>(null);

  return (
    <FieldWrapper name={name} label={label} labelClassName="sr-only">
      {field => (
        <Fragment>
          <TextField
            {...field}
            ref={fieldRef}
            className={styles.input}
            type="search"
            autoComplete="off"
            placeholder={label}
            onKeyDown={evt => {
              if (evt.key === 'Escape') {
                evt.stopPropagation();
              }
            }}
          />

          <label className={styles.icon} htmlFor="search" aria-hidden="true">
            <SearchIcon />
          </label>

          {!!meta.value && (
            <IconButton
              className={styles.clear}
              type="button"
              title="Clear search"
              onClick={() => {
                helpers.setValue('');
                fieldRef.current?.focus();
              }}>
              <CloseIcon />
            </IconButton>
          )}
        </Fragment>
      )}
    </FieldWrapper>
  );
};
