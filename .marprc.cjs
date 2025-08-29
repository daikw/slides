// Marp CLI configuration to enable PlantUML in Markdown.
// Docs: https://github.com/marp-team/marp-cli#configuration-file

// Use CommonJS for compatibility with Marp CLI's default loader.
const { Marp } = require('@marp-team/marp-core')

module.exports = {
  // Custom engine: enable html and add markdown-it-plantuml
  engine: (opts) =>
    new Marp({ ...opts, html: true }).use(require('markdown-it-plantuml'), {
      // Use HTTPS PlantUML server for generated images
      server: 'https://www.plantuml.com/plantuml',
    }),
}
