import tw, { css } from 'twin.macro';
import { useTheme } from '@src/providers/ThemeProvider';
import { useGrid } from '@src/providers/GridProvider';

const GridLines = () => {
  const { itemSize, columns, rows } = useGrid();
  const theme = useTheme();

  const themedRingColor =
    theme &&
    {
      mint: tw`ring-mint-700`,
      pink: tw`ring-mint-700`, // TODO
      navy: tw`ring-navy-800`,
      paper: tw`ring-mint-700`, // TODO
    }[theme.color];

  return (
    <div
      css={[
        themedRingColor,
        tw`opacity-20 h-full relative ring-1 ring-inset pointer-events-none`,
        css`
          width: calc(${itemSize}px * ${columns});
        `,
      ]}>
      <div css={tw`absolute inset-0 size-full flex flex-col pointer-events-none`}>
        {Array(rows)
          .fill(null)
          .map((_, idx) => (
            <div
              key={idx}
              css={[
                themedRingColor,
                tw`flex-shrink-0 w-full ring-0.5 ring-inset`,
                css`
                  height: ${itemSize}px;
                `,
              ]}
            />
          ))}
      </div>
      <div css={tw`absolute inset-0 size-full flex pointer-events-none`}>
        {Array(columns)
          .fill(null)
          .map((_, idx) => (
            <div
              key={idx}
              css={[
                themedRingColor,
                tw`flex-shrink-0 h-full ring-0.5 ring-inset`,
                css`
                  width: ${itemSize}px;
                `,
              ]}
            />
          ))}
      </div>
    </div>
  );
};

export default GridLines;
