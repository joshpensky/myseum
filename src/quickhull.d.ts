declare module 'quickhull' {
  import { Position } from '@src/types';

  const method: (points: Position[]) => Position[];
  export default method;
}
