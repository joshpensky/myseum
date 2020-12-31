import quickhull from 'quickhull';
import { SelectionEditorPoints } from '@src/hooks/useSelectionEditor';
import { Position } from '@src/types';

export type Line = [Position, Position];

enum Orientation {
  COLINEAR = 0,
  CLOCKWISE = 1,
  COUNTER_CLOCKWISE = 2,
}

export class GeometryUtils {
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

  // // Checks if the given lines intersect or are colinear
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
}
