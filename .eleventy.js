const markdownIt = require("markdown-it");

module.exports = function(eleventyConfig) {
  // Markdown filter for rendering data content
  const md = markdownIt({ html: true, breaks: true });
  eleventyConfig.addFilter("markdownify", function(content) {
    if (!content) return "";
    return md.render(content);
  });

  // GitHub Pages path prefix rewriting
  const prefix = process.env.GITHUB_PAGES ? "/Wellcare-website" : "";
  if (prefix) {
    eleventyConfig.addTransform("ghpages-paths", function(content) {
      if (this.page.outputPath && this.page.outputPath.endsWith(".html")) {
        // Rewrite href, src, action attributes
        content = content.replace(/(href|src|action)="\/(?!\/)/g, '$1="' + prefix + '/');
        // Rewrite url('/path') in inline styles (single quotes)
        content = content.replace(/url\('\/(?!\/)/g, "url('" + prefix + '/');
        // Rewrite url("/path") in inline styles (double quotes)
        content = content.replace(/url\("\/(?!\/)/g, 'url("' + prefix + '/');
        // Rewrite url(/path) without quotes
        content = content.replace(/url\(\/(?!\/)/g, 'url(' + prefix + '/');
        return content;
      }
      return content;
    });
  }

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
    pathPrefix: process.env.GITHUB_PAGES ? "/Wellcare-website/" : "/",
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
