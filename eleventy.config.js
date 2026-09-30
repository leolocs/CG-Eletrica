const {
  CircleCheck,
  ClipboardCheck,
  Clock,
  Crosshair,
  ExternalLink,
  MapPin,
  MessageSquareText,
  ShieldCheck,
  Zap,
} = require("lucide");

const lucideIcons = {
  "circle-check": CircleCheck,
  "clipboard-check": ClipboardCheck,
  clock: Clock,
  crosshair: Crosshair,
  "external-link": ExternalLink,
  "map-pin": MapPin,
  "message-square-text": MessageSquareText,
  "shield-check": ShieldCheck,
  zap: Zap,
};

function escapeAttribute(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderIconNode([tag, attributes]) {
  const renderedAttributes = Object.entries(attributes)
    .map(([name, value]) => `${name}="${escapeAttribute(value)}"`)
    .join(" ");

  return `<${tag} ${renderedAttributes}></${tag}>`;
}

module.exports = function (eleventyConfig) {
  // Reaproveita os assets existentes em assets/ sem duplicá-los em src/
  eleventyConfig.addPassthroughCopy({ assets: "assets" });

  eleventyConfig.addFilter("currentYear", () => new Date().getFullYear());

  eleventyConfig.addShortcode("lucide", (name, className = "") => {
    const icon = lucideIcons[name];

    if (!icon) {
      throw new Error(`Ícone Lucide não configurado: ${name}`);
    }

    const iconClasses = `lucide lucide-${name}${className ? ` ${className}` : ""}`;
    const classAttribute = ` class="${escapeAttribute(iconClasses)}"`;
    const nodes = icon.map(renderIconNode).join("");

    return `<svg${classAttribute} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${nodes}</svg>`;
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
