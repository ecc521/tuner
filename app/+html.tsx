import { ScrollViewStyleReset } from 'expo-router/html';

// The base URL for GitHub Pages deployment. Ideally sourced from app.json.
const baseUrl = process.env.EXPO_ROUTER_BASE ?? '';

const ICON_SIZES = [16, 24, 32, 48, 64, 72, 76, 96, 120, 144, 152, 160, 180, 196, 512];
const APPLE_TOUCH_ICON_SIZES = [72, 76, 120, 144, 152, 180];

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
        <style>{responsiveBackground}</style>
        {/* Add any additional <head> elements that you want globally available on web... */}
        {ICON_SIZES.map((size) => (
          <link
            key={size}
            rel="icon"
            type="image/png"
            sizes={`${size}x${size}`}
            href={`${baseUrl}/images/${size}x${size}-eighth-note.png`}
          />
        ))}
        {APPLE_TOUCH_ICON_SIZES.map((size) => (
          <link
            key={size}
            rel="apple-touch-icon"
            sizes={`${size}x${size}`}
            href={`${baseUrl}/images/${size}x${size}-eighth-note.png`}
          />
        ))}
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
