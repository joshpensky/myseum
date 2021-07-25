/// <reference types="next" />
/// <reference types="next/types/global" />

declare module '*.scss' {
  const content: Record<string, string>;
  export default content;
}
