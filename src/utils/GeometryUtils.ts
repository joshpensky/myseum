import quickhull from 'quickhull';
import { SelectionEditorPoints } from '@src/hooks/useSelectionEditor';
import { Position } from '@src/types';

export type Line = [Position, Position];

export enum Orientation {
  COLINEAR = 0,
  CLOCKWISE = 1,
  COUNTER_CLOCKWISE = 2,
}

export class GeometryUtils {
  static getLineLength(a: Position, b: Position) {
    return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
  }

  /**
   * Gets the angle of the line, with the range [-180deg, 180deg].
   *
   * // https://stackoverflow.com/a/9614122
   */
  static getLineAngle(a: Position, b: Position) {
    const theta = Math.atan2(b.y - a.y, b.x - a.x);
    return theta * (180 / Math.PI);
  }

  /**
   * Calculates the slope and intercept of the line formed by the given points.
   *
   * This is based on the formula y = mx + b, where m=slope and b=intercept.
   *
   * @param a the initial point
   * @param b the terminal point
   */
  static getSlopeIntercept(a: Position, b: Position) {
    // m = (y1 - y2) / (x1 - x2);
    let slope: number | undefined;
    if (a.x === b.x) {
      slope = undefined; // the line is vertical, so no slope
    } else {
      slope = (a.y - b.y) / (a.x - b.x);
    }

    // y = mx + b  --->  b = y - mx
    const intercept = a.y - (slope ?? 0) * a.x;

    return { slope, intercept };
  }

  /**
   * Calculates the slope of a line perpendicular to one with the given slope.
   *
   * @param slope the slope to calculate
   */
  static getPerpendicularSlope(slope: number | undefined) {
    if (slope === undefined) {
      return 0; // convert vertical to horizontal slope
    } else if (slope === 0) {
      return undefined; // convert horizontal to vertical slope
    }
    return -1 / slope;
  }

  // Gets the orientation of three points
  static getOrientation(p1: Position, p2: Position, p3: Position) {
    const value = (p2.y - p1.y) * (p3.x - p2.x) - (p2.x - p1.x) * (p3.y - p2.y);
    if (value === 0) {
      return Orientation.COLINEAR;
    } else if (value > 0) {
      return Orientation.CLOCKWISE;
    }
    return Orientation.COUNTER_CLOCKWISE;
  }

  // Checks if the given point exists on the given line
  static isPointOnLine(point: Position, line: Line) {
    const [l1, l2] = line;
    const isPointWithinXRange = Math.min(l1.x, l2.x) <= point.x && point.x <= Math.max(l1.x, l2.x);
    const isPointWithinYRange = Math.min(l1.y, l2.y) <= point.y && point.y <= Math.max(l1.y, l2.y);
    return isPointWithinXRange && isPointWithinYRange;
  }

  // https://math.stackexchange.com/questions/198764/how-to-know-if-a-point-is-inside-a-circle
  static isPointWithinCircle(point: Position, circle: Position & { radius: number }) {
    const pointToCenterLength = this.getLineLength(point, circle);
    return pointToCenterLength <= circle.radius;
  }

  // Checks if the given lines intersect or are colinear
  static doLinesIntersect(lineAB: Line, lineXY: Line) {
    const [a, b] = lineAB;
    const [x, y] = lineXY;

    // Get the orientation of a and b on line xy
    const oA_XY = this.getOrientation(x, y, a);
    const oB_XY = this.getOrientation(x, y, b);
    // Get the orientation of x and y on line ab
    const oX_AB = this.getOrientation(a, b, x);
    const oY_AB = this.getOrientation(a, b, y);

    // INTERSECTION CHECK
    // https://algorithmtutor.com/Computational-Geometry/Check-if-two-line-segment-intersect/
    const abIntersectsXy =
      (oA_XY === Orientation.CLOCKWISE && oB_XY === Orientation.COUNTER_CLOCKWISE) ||
      (oA_XY === Orientation.COUNTER_CLOCKWISE && oB_XY === Orientation.CLOCKWISE);
    const xyIntersectsAb =
      (oX_AB === Orientation.CLOCKWISE && oY_AB === Orientation.COUNTER_CLOCKWISE) ||
      (oX_AB === Orientation.COUNTER_CLOCKWISE && oY_AB === Orientation.CLOCKWISE);
    if (abIntersectsXy && xyIntersectsAb) {
      return true;
    }

    // COLLINEAR CHECKS
    // If a is on line xy, then the lines intersect
    if (oA_XY === Orientation.COLINEAR && this.isPointOnLine(a, [x, y])) {
      return true;
    }
    // If b is on line xy, then the lines intersect
    if (oB_XY === Orientation.COLINEAR && this.isPointOnLine(b, [x, y])) {
      return true;
    }
    // If x is on line ab, then the lines intersect
    if (oX_AB === Orientation.COLINEAR && this.isPointOnLine(x, [a, b])) {
      return true;
    }
    // If y is on line ab, then the lines intersect
    if (oY_AB === Orientation.COLINEAR && this.isPointOnLine(y, [a, b])) {
      return true;
    }

    // Otherwise, the lines don't intersect
    return false;
  }

  // https://cdn.tutors.com/assets/images/courses/math/geometry-help/convex-concave-quadrilateral.jpg
  static isComplexQuadrilateral(points: SelectionEditorPoints) {
    const [a, b, x, y] = points;
    const abIntersectsXy = this.doLinesIntersect([a, b], [x, y]);
    const ayIntersectsBx = this.doLinesIntersect([a, y], [b, x]);
    return abIntersectsXy || ayIntersectsBx;
  }

  static isConcaveQuadrilateral(points: SelectionEditorPoints) {
    // Checks the convex hull of the corner points
    // If the quadrilateral is concave (a.k.a, all points aren't accounted for in hull [1-4 and back again]), it's invalid!
    const hull = quickhull(points);
    return hull.length === points.length;
  }

  static isConvexQuadrilateral(points: SelectionEditorPoints) {
    return !this.isComplexQuadrilateral(points) && !this.isConcaveQuadrilateral(points);
  }

  /**
   * Sorts the given points starting at the top-left-most point and clockwise around.
   *
   * NOTE: you SHOULD check that the points form a convex quadrilateral before running!
   *
   * ```
   *  (1)------(2)
   *   |        |
   *   |        |
   *  (4)------(3)
   * ```
   *
   * @param points the points that form the convex quadrilateral
   */
  static sortConvexQuadrilateralPoints(points: SelectionEditorPoints): SelectionEditorPoints {
    // Sort points left to right
    const sortedPoints = [...points].sort((a, b) => a.x - b.x);

    let leftIndex = 0;
    // Check the two leftmost points for the lowest Y value
    if (sortedPoints[1].y < sortedPoints[0].y) {
      leftIndex = 1;
    }

    // Trace the convex hull to arrange the points into a quadrilateral
    const hull: Position[] = [];
    let p = leftIndex;
    let q: number;
    do {
      hull.push(sortedPoints[p]);
      q = (p + 1) % sortedPoints.length;

      for (let i = 0; i < sortedPoints.length; i++) {
        if (
          GeometryUtils.getOrientation(sortedPoints[p], sortedPoints[i], sortedPoints[q]) ===
          Orientation.COUNTER_CLOCKWISE
        ) {
          // Get the next counter clockwise point around the polygon
          q = i;
        }
      }

      // Restart loop with the next index
      p = q;
    } while (p !== leftIndex);

    // Return the final hull of points
    return hull as SelectionEditorPoints;
  }

  /**
   * Gets the position and dimensions of a rectangle averaged from the given points of a
   * convex quadrilateral.
   *
   * NOTE: you SHOULD check that the points form a convex quadrilateral before running!
   *
   * @param points the points that form a convex quadrilateral
   */
  static getAverageRectangle(points: SelectionEditorPoints) {
    const beforePoints = this.sortConvexQuadrilateralPoints(points);
    const [a, b, c, d] = beforePoints;

    const x = (a.x + d.x) / 2; // X avg of leftmost two points
    const y = (a.y + b.y) / 2; // Y avg of topmost two points

    const width = (b.x + c.x) / 2 - x; // X avg of rightmost two points, minus avg of leftmost
    const height = (c.y + d.y) / 2 - y; // X avg of bottommost two points, minus avg of topmost

    return {
      x,
      y,
      width,
      height,
    };
  }

  /**
   * Checks where the given point exists within the given polygon.
   *
   * Algorithm taken from https://wrf.ecse.rpi.edu//Research/Short_Notes/pnpoly.html
   *
   * @param point the point to check
   * @param polygon the polygon to check if the point resides within
   */
  static isPointInPolygon(
    point: Position,
    polygon: { 0: Position; 1: Position; 2: Position } & Position[],
  ) {
    const { x, y } = point;

    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const pointA = polygon[i];
      const pointB = polygon[j];

      const intersect =
        pointA.y > y !== pointB.y > y &&
        x < ((pointB.x - pointA.x) * (y - pointA.y)) / (pointB.y - pointA.y) + pointA.x;

      if (intersect) {
        inside = !inside;
      }
    }

    return inside;
  }

  /**
   * Finds the nearest projection of the given point on the line.
   *
   * Algorithm taken from https://jsfiddle.net/shishirraven/4dmjh0sa/
   *
   * @param p the point to project on the line
   * @param line the line to project onto
   */
  static findNearestPointOnLine(point: Position, line: Line) {
    const [a, b] = line;
    // https://www.mathsisfun.com/algebra/vectors-dot-product.html
    const vectorAB = { x: b.x - a.x, y: b.y - a.y };
    const vectorAP = { x: point.x - a.x, y: point.y - a.y };
    const magnitudeAB = Math.pow(vectorAB.x, 2) + Math.pow(vectorAB.y, 2);
    const dotProduct = vectorAP.x * vectorAB.x + vectorAP.y * vectorAB.y;
    const theta = Math.min(1, Math.max(0, dotProduct / magnitudeAB));
    return {
      x: a.x + vectorAB.x * theta,
      y: a.y + vectorAB.y * theta,
    };
  }

  /**
   * Finds the nearest projection of the given point on the polygon's edges.
   *
   * @param point the point to project on the polygon
   * @param polygon the polygon whose edges to project onto
   */
  static findNearestPointOnPolygon(
    point: Position,
    polygon: { 0: Position; 1: Position; 2: Position } & Position[],
  ) {
    const nearestPoints: Position[] = [];
    for (let i = 0; i < polygon.length; i++) {
      const line = [polygon[i], polygon[(i + 1) % polygon.length]] as Line;
      nearestPoints.push(this.findNearestPointOnLine(point, line));
    }

    const shortestDistance = nearestPoints.reduce(
      (acc, nearPoint, index) => {
        const distance = this.getLineLength(nearPoint, point);
        if (acc.index < 0 || distance <= acc.distance) {
          return { distance, index };
        }
        return acc;
      },
      { distance: 0, index: -1 },
    );

    return nearestPoints[shortestDistance.index];
  }

  /**
   * Finds a point on the vector formed by the given points, at the given magnitude.
   *
   * @param initialPoint the starting point of the vector
   * @param terminalPoint the ending point of the vector (determines direction)
   * @param magnitude the magnitude, or length, along the vector at which the point should be
   */
  static findPointOnVector(initialPoint: Position, terminalPoint: Position, magnitude: number) {
    const direction = this.getLineLength(initialPoint, terminalPoint);
    const theta = magnitude / direction;
    return {
      x: (1 - theta) * initialPoint.x + theta * terminalPoint.x,
      y: (1 - theta) * initialPoint.y + theta * terminalPoint.y,
    };
  }

  /**
   * In the editor, there is a case where the validity of the convex quadrilateral path may
   * be questioned when a point is moved inward toward the center.
   *
   * This method offsets an invalid point in a path to ensure that a convex quadrilateral will
   * ALWAYS be formed.
   *
   * For example, we have point E which represents the invalid quadrilateral vertex. We want to find
   * the point closest to the polygon that still forms a valid convex quadrilateral.
   *
   * ```
   *           . . . A
   *       . .       |
   *    . .          |
   *  D      C  NC---N--X   E
   *    . .          |
   *       . .       |
   *           . . . B
   * ```
   *
   * @param path the points that make up the quadrilateral
   * @param invalidPointIndex the index of the point that invalidates the convexity of the quadrilateral
   * @param offset a positive offset representing the distance to place the corrected point (distance from N->X)
   */
  static fixConvexQuadrilateral(
    path: SelectionEditorPoints,
    invalidPointIndex: number,
    offset: number,
  ) {
    // 1) Disregard point E and form triangle ABD.
    const numPoints = path.length;
    const triangle = [
      path[(numPoints + (invalidPointIndex - 1)) % numPoints], // A
      path[(invalidPointIndex + 1) % numPoints], // B
      path[(invalidPointIndex + 2) % numPoints], // D
    ];
    // 2) Form a line between the surrounding points of E (line AB)
    const lineAB: Line = [triangle[0], triangle[1]];
    // 3) Find the nearest projection of point E on line AB (point N)
    const nearestPointOnLine = GeometryUtils.findNearestPointOnLine(
      path[invalidPointIndex],
      lineAB,
    );

    // 4) Find the slope of the line perpendicular to AB. This will serve as our vector
    const { slope } = GeometryUtils.getSlopeIntercept(triangle[0], triangle[1]);
    const perpSlope = GeometryUtils.getPerpendicularSlope(slope) ?? 0;
    const perpIntercept = nearestPointOnLine.y - perpSlope * nearestPointOnLine.x;
    const perpVector: Line = [
      { x: 0, y: perpIntercept },
      { x: 1, y: perpSlope + perpIntercept },
    ];

    // 5) Find the center point of triangle ABD (point C)
    const centerPoint = {
      x: (triangle[0].x + triangle[1].x + triangle[2].x) / 3,
      y: (triangle[0].y + triangle[1].y + triangle[2].y) / 3,
    };
    // 6) Find the projection of the center onto the perpendicular vector (point NC)
    const nearestCenterPointOnPerpLine = GeometryUtils.findNearestPointOnLine(
      centerPoint,
      perpVector,
    );

    // 7) Invert the direction of vector N->NC by the given magnitude to find the offset point (point X)
    const offsetPoint = GeometryUtils.findPointOnVector(
      nearestPointOnLine,
      nearestCenterPointOnPerpLine,
      -1 * Math.abs(offset),
    );

    return offsetPoint;
  }
}
