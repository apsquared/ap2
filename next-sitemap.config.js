/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.apsquared.co',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: ['/api/*', '/admin/*'],
  robotsTxtOptions: {
    additionalSitemaps: [],
  },
  // Change frequency and priority for different types of pages
  transform: async (config, path) => {
    // Different rules based on the path
    if (path.startsWith('/tools/')) {
      return {
        loc: path,
        changefreq: 'monthly',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      }
    }
    if (path.includes('/posts/')) {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 0.7,
        lastmod: new Date().toISOString(),
      }
    }
    // Default transformation for other pages
    return {
      loc: path,
      changefreq: 'daily',
      priority: 0.5,
      lastmod: new Date().toISOString(),
    }
  },
} 