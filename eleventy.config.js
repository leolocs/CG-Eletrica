module.exports = function (eleventyConfig) {
  // Reaproveita os assets existentes em public/assets sem duplicá-los em src/
  eleventyConfig.addPassthroughCopy({ assets: "assets" });

  eleventyConfig.addFilter("currentYear", () => new Date().getFullYear());

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
