const fs = require("node:fs");
const path = require("node:path");

const project = __dirname;
const dist = path.join(project, "dist");
let html = fs.readFileSync(path.join(dist, "index.html"), "utf8");
const css = fs.readFileSync(path.join(dist, "styles.css"), "utf8");
const calculator = fs.readFileSync(path.join(dist, "calculator.js"), "utf8");
const app = fs.readFileSync(path.join(dist, "app.js"), "utf8");

html = html
  .replace('<link rel="stylesheet" href="styles.css" />', `<style>\n${css}\n</style>`)
  .replace('<script src="calculator.js" defer></script>', `<script>\n${calculator}\n</script>`)
  .replace('<script src="app.js" defer></script>', "")
  .replace("</body>", `<script>\n${app}\n</script>\n</body>`);

const output = path.join(project, "Kita-Beitragsrechner.html");
fs.writeFileSync(output, html);
console.log(output);
