// https://github.com/jlouthan/perspective-transform

declare module 'perspective-transform' {
  type PointsGrid = [number, number, number, number, number, number, number, number];

  type PerspT = {
    /**
     * Map a point from the source quadrilateral to the destination quadrilateral.
     */
    transform(x: number, y: number): [number, number];
    /**
     * Map a point from the destination quadrilateral to the source quadrilateral.
     */
    transformInverse(x: number, y: number): [number, number];
    /**
     * Get the coordinates of the corners of the transform's source quadrilateral, expressed as an array.
     */
    srcPts: PointsGrid;
    /**
     * Get the coordinates of the corners of the transform's destination quadrilateral, expressed as an array.
     */
    dstPts: PointsGrid;
    /**
     * Get the homographic transform matrix, expressed as an array of coefficients.
     */
    coeffs: PointsGrid;
    /**
     * Get the inverse homographic transform matrix, expressed as an array of coefficients.
     */
    coeffsInv: PointsGrid;
  };

  const constructor: (srcPts: PointsGrid, dstPts: PointsGrid) => PerspT;

  export default constructor;
}
