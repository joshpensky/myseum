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
  static getSlopeIntercept(a: Position, b: Position) {
    // m = (y1 - y2) / (x1 - x2);
    const slope = a.x === b.x ? undefined : (a.y - b.y) / (a.x - b.x);

    // y = mx + b
    // y - mx = b
    const intercept = a.y - (slope ?? 0) * a.x;

    return { slope, intercept };
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

  static isPointWithinCircle(point: Position, circle: Position & { radius: number }) {
    // Check if point is within circular target using Pythagorean theorem:
    // sqrt((x - center_x)^2 + (y - center_y)^2) <= radius
    // https://math.stackexchange.com/questions/198764/how-to-know-if-a-point-is-inside-a-circle
    const euclidianDistance = Math.sqrt(
      Math.pow(point.x - circle.x, 2) + Math.pow(point.y - circle.y, 2),
    );
    return euclidianDistance <= circle.radius;
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
   *
   * https://wrf.ecse.rpi.edu//Research/Short_Notes/pnpoly.html
   *
   * @param point
   * @param polygon
   */
  static isPointInConvexQuadrilateral(point: Position, quadrilateral: SelectionEditorPoints) {
    const { x, y } = point;

    let inside = false;

    for (let i = 0, j = quadrilateral.length - 1; i < quadrilateral.length; j = i++) {
      const pointA = quadrilateral[i];
      const pointB = quadrilateral[j];

      const intersect =
        pointA.y > y !== pointB.y > y &&
        x < ((pointB.x - pointA.x) * (y - pointA.y)) / (pointB.y - pointA.y) + pointA.x;

      if (intersect) {
        inside = !inside;
      }
    }

    return inside;
  }

  static getClosestPointToPolygon(point: Position, polygon: Position[]) {
    if (polygon.length < 3 || polygon.length > 4) {
      return undefined;
    }

    let centerPoint: Position | undefined;
    if (polygon.length === 3) {
      const centerX = (polygon[0].x + polygon[1].x + polygon[2].x) / 3;
      const centerY = (polygon[0].y + polygon[1].y + polygon[2].y) / 3;
      centerPoint = { x: centerX, y: centerY };
    } else if (polygon.length === 4) {
      const lineAX = GeometryUtils.getSlopeIntercept(polygon[0], polygon[2]);
      const lineBY = GeometryUtils.getSlopeIntercept(polygon[1], polygon[3]);
      // https://www.mathopenref.com/coordintersection.html
      if (lineAX.slope !== undefined && lineBY.slope !== undefined) {
        const intersectX = (lineAX.intercept - lineBY.intercept) / (lineBY.slope - lineAX.slope);
        const intersectY = lineAX.slope * intersectX + lineAX.intercept;
        centerPoint = { x: intersectX, y: intersectY };
      }
    }

    if (centerPoint) {
      const lineMB = GeometryUtils.getSlopeIntercept(point, centerPoint);
      const intersectionPts: Position[] = [];
      for (let i = 0; i < polygon.length; i++) {
        const basePointA = polygon[i];
        const basePointB = polygon[(i + 1) % polygon.length];
        const baseLineMB = GeometryUtils.getSlopeIntercept(basePointA, basePointB);

        let intersectPoint: Position | undefined;

        if (lineMB.slope === baseLineMB.slope) {
          // pass, both lines are parallel
        } else if (lineMB.slope === undefined && baseLineMB.slope !== undefined) {
          intersectPoint = {
            x: point.x,
            y: baseLineMB.slope * point.x + baseLineMB.intercept,
          };
        } else if (lineMB.slope !== undefined && baseLineMB.slope === undefined) {
          intersectPoint = {
            x: basePointA.x,
            y: lineMB.slope * basePointA.x + lineMB.intercept,
          };
        } else if (lineMB.slope !== undefined && baseLineMB.slope !== undefined) {
          // https://www.mathopenref.com/coordintersection.html
          const intersectX =
            (baseLineMB.intercept - lineMB.intercept) / (lineMB.slope - baseLineMB.slope);
          const intersectY = baseLineMB.slope * intersectX + baseLineMB.intercept;
          intersectPoint = { x: intersectX, y: intersectY };
        }

        if (
          intersectPoint &&
          GeometryUtils.isPointOnLine(intersectPoint, [basePointA, basePointB])
        ) {
          intersectionPts.push(intersectPoint);
        }
      }

      const shortestDistance = intersectionPts.reduce(
        (acc, pt, index) => {
          const d = Math.sqrt(Math.pow(pt.x - point.x, 2) + Math.pow(pt.y - point.y, 2));
          if (acc.index < 0 || d <= acc.distance) {
            return { distance: d, index };
          }
          return acc;
        },
        { distance: 0, index: -1 },
      );
      const shortestPt = intersectionPts[shortestDistance.index];
      return shortestPt;
    }
  }
}
