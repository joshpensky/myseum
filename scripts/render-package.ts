const packageTemplate = `
{
  "name": "next-pages-gen",
  "main": "index.js",
  "types": "index.d.ts",
  "browser": "index-browser.js"
}
`.trim();

export const renderPackageJson = () => packageTemplate;
