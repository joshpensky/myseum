import BaseDocument, { Head, Html, Main, NextScript } from 'next/document';

class Document extends BaseDocument {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Add Google fonts */}
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,700;1,400&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default Document;
