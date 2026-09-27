/** Tokens espelham as custom properties já definidas em assets/css/styles.css (:root) */
module.exports = {
  content: ["./src/**/*.{html,njk,js}"],
  corePlugins: {
    // Preflight desativado na Fase 1 para não conflitar com o reset já existente em styles.css
    preflight: false,
    // .container customizado já existe em styles.css; evita colisão de classes
    container: false,
  },
  theme: {
    extend: {
      colors: {
        bg: "#E0E0E0",
        surface: "#FFFFFF",
        "surface-soft": "#F3F3F3",
        ink: "#061224",
        muted: "#525252",
        line: "hsl(0, 0%, 85%)",
        accent: "#FBB016",
      },
      borderRadius: {
        DEFAULT: "12px",
      },
      maxWidth: {
        container: "1200px",
      },
      boxShadow: {
        DEFAULT: "0 18px 40px rgba(6, 18, 36, 0.08)",
      },
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
      },
      screens: {
        // Replicam os breakpoints max-width já usados no CSS legado
        "max-1040": { max: "1040px" },
        "max-820": { max: "820px" },
        "max-768": { max: "768px" },
      },
    },
  },
  plugins: [],
};
