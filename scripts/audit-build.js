const fs = require("node:fs");
const path = require("node:path");

const outputDir = path.resolve("_site");
const prefixArgument = process.argv.find((argument) => argument.startsWith("--pathprefix="));
const pathPrefix = prefixArgument
  ? `/${prefixArgument.split("=")[1].replace(/^\/+|\/+$/g, "")}`
  : "";
const issues = [];

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

function countMatches(content, expression) {
  return [...content.matchAll(expression)].length;
}

function attributes(tag) {
  return Object.fromEntries(
    [...tag.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)].map((match) => [
      match[1].toLowerCase(),
      match[2],
    ]),
  );
}

function resolveInternalReference(htmlFile, rawReference) {
  const decoded = rawReference.replaceAll("&amp;", "&");
  const [pathname, fragment = ""] = decoded.split("#", 2);

  if (!pathname) return { file: htmlFile, fragment };
  if (/^(?:[a-z]+:|\/\/)/i.test(pathname)) return null;

  const cleanPath = pathname.split("?", 1)[0];
  let normalizedPath = cleanPath;

  if (pathPrefix && (normalizedPath === pathPrefix || normalizedPath.startsWith(`${pathPrefix}/`))) {
    normalizedPath = normalizedPath.slice(pathPrefix.length) || "/";
  }

  let target = normalizedPath.startsWith("/")
    ? path.join(outputDir, normalizedPath.slice(1))
    : path.resolve(path.dirname(htmlFile), normalizedPath);

  if (normalizedPath.endsWith("/")) target = path.join(target, "index.html");

  return { file: target, fragment };
}

if (!fs.existsSync(outputDir)) {
  console.error("Build ausente: execute npm run build antes da auditoria.");
  process.exit(1);
}

const files = walk(outputDir);
const htmlFiles = files.filter((file) => file.endsWith(".html"));

for (const htmlFile of htmlFiles) {
  const relativeFile = path.relative(outputDir, htmlFile);
  const html = fs.readFileSync(htmlFile, "utf8");
  const h1Count = countMatches(html, /<h1\b/gi);

  if (h1Count !== 1) issues.push(`${relativeFile}: esperado 1 H1, encontrado ${h1Count}`);
  if (!/<title>\s*[^<]+\s*<\/title>/i.test(html)) issues.push(`${relativeFile}: title ausente`);
  if (!/<meta\s+name="description"\s+content="[^"]+"/i.test(html)) issues.push(`${relativeFile}: description ausente`);
  if (!/<link\s+rel="canonical"\s+href="https:\/\/cgeletrica\.com\.br\//i.test(html)) issues.push(`${relativeFile}: canonical inválido ou ausente`);

  for (const property of ["og:title", "og:description", "og:url", "og:image"]) {
    if (!new RegExp(`<meta\\s+property="${property}"\\s+content="[^"]+"`, "i").test(html)) {
      issues.push(`${relativeFile}: ${property} ausente`);
    }
  }

  const ids = [...html.matchAll(/\sid=["']([^"']+)["']/gi)].map((match) => match[1]);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicateIds.length) issues.push(`${relativeFile}: IDs duplicados (${[...new Set(duplicateIds)].join(", ")})`);

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const attrs = attributes(match[0]);
    if (!("alt" in attrs)) issues.push(`${relativeFile}: imagem sem alt (${attrs.src || "src desconhecido"})`);
    if (!attrs.width || !attrs.height) issues.push(`${relativeFile}: imagem sem width/height (${attrs.src || "src desconhecido"})`);
  }

  for (const match of html.matchAll(/<a\b[^>]*target=["']_blank["'][^>]*>/gi)) {
    const attrs = attributes(match[0]);
    const rel = new Set((attrs.rel || "").split(/\s+/));
    if (!rel.has("noopener") || !rel.has("noreferrer")) {
      issues.push(`${relativeFile}: target=_blank sem noopener noreferrer (${attrs.href || "href desconhecido"})`);
    }
  }

  if (/\b(?:lorem ipsum|placeholder|fict[ií]ci[oa]|estudo demonstrativo)\b/i.test(html)) {
    issues.push(`${relativeFile}: conteúdo provisório ou fictício encontrado`);
  }

  for (const match of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)) {
    const reference = resolveInternalReference(htmlFile, match[1]);
    if (!reference) continue;

    if (!fs.existsSync(reference.file)) {
      issues.push(`${relativeFile}: referência interna ausente (${match[1]})`);
      continue;
    }

    if (reference.fragment && reference.file.endsWith(".html")) {
      const targetHtml = fs.readFileSync(reference.file, "utf8");
      const escapedFragment = reference.fragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (!new RegExp(`\\sid=["']${escapedFragment}["']`, "i").test(targetHtml)) {
        issues.push(`${relativeFile}: âncora ausente (${match[1]})`);
      }
    }
  }
}

for (const requiredFile of [".htaccess", "404.html", "robots.txt", "sitemap.xml"]) {
  if (!fs.existsSync(path.join(outputDir, requiredFile))) issues.push(`arquivo obrigatório ausente: ${requiredFile}`);
}

if (issues.length) {
  console.error(`Auditoria falhou com ${issues.length} problema(s):`);
  issues.forEach((issue) => console.error(`- ${issue}`));
  process.exit(1);
}

console.log(`Auditoria concluída: ${htmlFiles.length} páginas HTML, links locais, assets e metadados validados.`);
