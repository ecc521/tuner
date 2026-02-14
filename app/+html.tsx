import { ScrollViewStyleReset } from 'expo-router/html';

// The base URL for GitHub Pages deployment. Ideally sourced from app.json.
const baseUrl = process.env.EXPO_ROUTER_BASE ?? '';

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/*
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native.
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        {/* Using raw CSS styles as an escape-hatch to ensure the background color never flickers in dark-mode. */}
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
        {/* Add any additional <head> elements that you want globally available on web... */}
        <link rel="icon" type="image/png" sizes="16x16" href={`${baseUrl}/images/16x16-eighth-note.png`}/>
        <link rel="icon" type="image/png" sizes="24x24" href={`${baseUrl}/images/24x24-eighth-note.png`}/>
        <link rel="icon" type="image/png" sizes="32x32" href={`${baseUrl}/images/32x32-eighth-note.png`}/>
        <link rel="icon" type="image/png" sizes="48x48" href={`${baseUrl}/images/48x48-eighth-note.png`}/>
        <link rel="icon" type="image/png" sizes="64x64" href={`${baseUrl}/images/64x64-eighth-note.png`}/>
        <link rel="icon" type="image/png" sizes="72x72" href={`${baseUrl}/images/72x72-eighth-note.png`}/>
        <link rel="icon" type="image/png" sizes="76x76" href={`${baseUrl}/images/76x76-eighth-note.png`}/>
        <link rel="icon" type="image/png" sizes="96x96" href={`${baseUrl}/images/96x96-eighth-note.png`}/>
        <link rel="icon" type="image/png" sizes="120x120" href={`${baseUrl}/images/120x120-eighth-note.png`}/>
        <link rel="icon" type="image/png" sizes="144x144" href={`${baseUrl}/images/144x144-eighth-note.png`}/>
        <link rel="icon" type="image/png" sizes="152x152" href={`${baseUrl}/images/152x152-eighth-note.png`}/>
        <link rel="icon" type="image/png" sizes="160x160" href={`${baseUrl}/images/160x160-eighth-note.png`}/>
        <link rel="icon" type="image/png" sizes="180x180" href={`${baseUrl}/images/180x180-eighth-note.png`}/>
        <link rel="icon" type="image/png" sizes="196x196" href={`${baseUrl}/images/196x196-eighth-note.png`}/>
        <link rel="icon" type="image/png" sizes="512x512" href={`${baseUrl}/images/512x512-eighth-note.png`}/>
        <link rel="apple-touch-icon" sizes="72x72" href={`${baseUrl}/images/72x72-eighth-note.png`}/>
        <link rel="apple-touch-icon" sizes="76x76" href={`${baseUrl}/images/76x76-eighth-note.png`}/>
        <link rel="apple-touch-icon" sizes="120x120" href={`${baseUrl}/images/120x120-eighth-note.png`}/>
        <link rel="apple-touch-icon" sizes="144x144" href={`${baseUrl}/images/144x144-eighth-note.png`}/>
        <link rel="apple-touch-icon" sizes="152x152" href={`${baseUrl}/images/152x152-eighth-note.png`}/>
        <link rel="apple-touch-icon" sizes="180x180" href={`${baseUrl}/images/180x180-eighth-note.png`}/>
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveBackground = `
body {
  background-color: #fff;
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #000;
  }
}`;
