/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Theme M3 Colors (Warm & Approachable Spec)
        "surface": "#fbf8fc",
        "surface-dim": "#dcd9dd",
        "surface-bright": "#fbf8fc",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f5f3f6",
        "surface-container": "#f0edf1",
        "surface-container-high": "#eae7eb",
        "surface-container-highest": "#e4e1e5",
        "on-surface": "#1b1b1e",
        "on-surface-variant": "#424938",
        "inverse-surface": "#303033",
        "inverse-on-surface": "#f3f0f4",
        "outline": "#727a66",
        "outline-variant": "#c2cab2",
        "surface-tint": "#3f6a00",
        "primary": "#3f6a00", // Soft Premium Lime 600
        "on-primary": "#ffffff",
        "primary-container": "#65a30d",
        "on-primary-container": "#1b3100",
        "inverse-primary": "#96d947",
        "secondary": "#9d4300", // Accent Orange 500
        "on-secondary": "#ffffff",
        "secondary-container": "#fd761a",
        "on-secondary-container": "#5c2400",
        "tertiary": "#b91a24",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#ff5955",
        "on-tertiary-container": "#600009",
        "error": "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        "primary-fixed": "#b1f661",
        "primary-fixed-dim": "#96d947",
        "on-primary-fixed": "#0f2000",
        "on-primary-fixed-variant": "#2e4f00",
        "secondary-fixed": "#ffdbca",
        "secondary-fixed-dim": "#ffb690",
        "on-secondary-fixed": "#341100",
        "on-secondary-fixed-variant": "#783200",
        "tertiary-fixed": "#ffdad7",
        "tertiary-fixed-dim": "#ffb3ad",
        "on-tertiary-fixed": "#410004",
        "on-tertiary-fixed-variant": "#930013",
        "background": "#fbf8fc",
        "on-background": "#1b1b1e",
        "surface-variant": "#e4e1e5",

        // Functional Nutrition Accents
        "calorie-orange": "#f97316",
        "protein-rose": "#f43f5e",
        "carb-amber": "#f59e0b",
        "fat-yellow": "#eab308",
        "surface-green-tint": "#f3fcef",
      },
      borderRadius: {
        "sm": "0.25rem",
        "DEFAULT": "0.5rem", // 8px
        "md": "0.75rem",    // 12px (Interactive buttons, inputs, dropdowns)
        "lg": "1rem",      // 16px
        "xl": "1.5rem",     // 24px (Main Containers and Cards per specification)
        "2xl": "1.5rem",    // Backwards compatibility 24px
        "3xl": "1.5rem",    // 24px cards
        "full": "9999px"
      },
      spacing: {
        "base": "8px",
        "xs": "4px",
        "sm": "12px",
        "md": "24px",
        "lg": "40px",
        "xl": "64px",
        "container-max": "1280px",
        "gutter": "24px",
        "margin-mobile": "16px",
        "section-padding": "80px"
      },
      fontFamily: {
        "sans": ["Manrope", "sans-serif"],
        "headline": ["Manrope", "sans-serif"],
        "display": ["Manrope", "sans-serif"],
        "body": ["Manrope", "sans-serif"],
        "label": ["Manrope", "sans-serif"]
      },
      fontSize: {
        "headline-xl": ["48px", { "lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "800" }],
        "headline-lg": ["32px", { "lineHeight": "40px", "letterSpacing": "-0.01em", "fontWeight": "800" }],
        "headline-lg-mobile": ["28px", { "lineHeight": "36px", "fontWeight": "800" }],
        "headline-md": ["24px", { "lineHeight": "32px", "fontWeight": "700" }],
        "body-lg": ["18px", { "lineHeight": "28px", "fontWeight": "400" }],
        "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
        "label-md": ["14px", { "lineHeight": "20px", "letterSpacing": "0.01em", "fontWeight": "600" }],
        "label-sm": ["12px", { "lineHeight": "16px", "letterSpacing": "0.03em", "fontWeight": "700" }]
      },
      boxShadow: {
        // Soft elevation: diffuse 4% opacity shadow using M3 neutral text values (#1b1b1e)
        "soft": "0 4px 24px rgba(27, 27, 30, 0.04)",
        "soft-hover": "0 8px 30px rgba(27, 27, 30, 0.06)",
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}