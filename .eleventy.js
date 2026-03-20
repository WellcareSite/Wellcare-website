const markdownIt = require("markdown-it");

module.exports = function(eleventyConfig) {
  // Markdown filter for rendering data content
  const md = markdownIt({ html: true, breaks: true });
  eleventyConfig.addFilter("markdownify", function(content) {
    if (!content) return "";
    return md.render(content);
  });

  // Pass through static assets
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.addPassthroughCopy("src/js");

  // Date filter
  eleventyConfig.addFilter("date", function(dateObj, format) {
    if (!dateObj) return "";
    const d = new Date(dateObj);
    if (format === "Y" || format === "yyyy") return d.getFullYear().toString();
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    return months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
  });

  // Truncate filter
  eleventyConfig.addFilter("truncate", function(str, len) {
    if (!str) return "";
    if (str.length <= len) return str;
    return str.substring(0, len) + "...";
  });

  // Create team collection
  eleventyConfig.addCollection("team", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/team/*.md").sort((a, b) => {
      return (a.data.order || 0) - (b.data.order || 0);
    });
  });

  // Create blog collection
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/blog/*.md").sort((a, b) => {
      return b.date - a.date;
    });
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
