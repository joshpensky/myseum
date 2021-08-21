export interface Parameter {
  name: string;
  type: string;
  children: Record<string, Directory>;
}

export interface Directory {
  pathname: string | null;
  parameter: Parameter | null;
  children: Record<string, Directory>;
}
