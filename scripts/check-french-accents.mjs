import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const shouldFix = process.argv.includes("--fix");

const SOURCE_EXTENSIONS = new Set([".ts", ".tsx"]);
const MARKDOWN_EXTENSIONS = new Set([".md"]);
const IGNORED_DIRS = new Set([
  ".agents",
  ".codex",
  ".cursor",
  ".git",
  ".next",
  ".vercel",
  "node_modules",
  "public",
]);

const accentHints = new Map([
  ["adhesion", "adhésion"],
  ["adherents", "adhérents"],
  ["aout", "août"],
  ["apercu", "aperçu"],
  ["apres", "après"],
  ["apparait", "apparaît"],
  ["apparaitra", "apparaîtra"],
  ["apparaitront", "apparaîtront"],
  ["bloquee", "bloquée"],
  ["bloquees", "bloquées"],
  ["categorie", "catégorie"],
  ["categories", "catégories"],
  ["chargee", "chargée"],
  ["cles", "clés"],
  ["competition", "compétition"],
  ["competitions", "compétitions"],
  ["confirmees", "confirmées"],
  ["controle", "contrôle"],
  ["coordonnees", "coordonnées"],
  ["creneau", "créneau"],
  ["creneaux", "créneaux"],
  ["dedie", "dédié"],
  ["dediee", "dédiée"],
  ["dedies", "dédiés"],
  ["debut", "début"],
  ["debuter", "débuter"],
  ["deja", "déjà"],
  ["deplacee", "déplacée"],
  ["depot", "dépôt"],
  ["derniere", "dernière"],
  ["demarre", "démarré"],
  ["effectuee", "effectuée"],
  ["equipe", "équipe"],
  ["etat", "état"],
  ["etats", "états"],
  ["ete", "été"],
  ["etre", "être"],
  ["eviter", "éviter"],
  ["evolution", "évolution"],
  ["generale", "générale"],
  ["gerer", "gérer"],
  ["gerees", "gérées"],
  ["identifies", "identifiés"],
  ["indefiniment", "indéfiniment"],
  ["modele", "modèle"],
  ["modeles", "modèles"],
  ["modifies", "modifiés"],
  ["operatif", "opératif"],
  ["pedagogique", "pédagogique"],
  ["pedagogiques", "pédagogiques"],
  ["pieces", "pièces"],
  ["premiere", "première"],
  ["preparer", "préparer"],
  ["pres", "près"],
  ["presence", "présence"],
  ["pret", "prêt"],
  ["pretes", "prêtes"],
  ["publiee", "publiée"],
  ["publiees", "publiées"],
  ["publies", "publiés"],
  ["reelles", "réelles"],
  ["recapitulatif", "récapitulatif"],
  ["regles", "règles"],
  ["regulierement", "régulièrement"],
  ["repondre", "répondre"],
  ["reperes", "repères"],
  ["reservee", "réservée"],
  ["reservees", "réservées"],
  ["reserves", "réservés"],
  ["resultat", "résultat"],
  ["resultats", "résultats"],
  ["reunion", "réunion"],
  ["seance", "séance"],
  ["seances", "séances"],
  ["securise", "sécurisé"],
  ["sante", "santé"],
  ["succes", "succès"],
  ["utilisee", "utilisée"],
  ["utilisees", "utilisées"],
  ["utilises", "utilisés"],
  ["verifie", "vérifié"],
  ["verifiee", "vérifiée"],
  ["verifiees", "vérifiées"],
  ["verifiez", "vérifiez"],
  ["verifier", "vérifier"],
]);

const wordPattern = new RegExp(
  `\\b(${[...accentHints.keys()].join("|")})\\b`,
  "giu",
);
const mojibakePattern = /[ÃÂ�]/gu;

const NON_DISPLAY_JSX_ATTRIBUTES = new Set([
  "className",
  "href",
  "id",
  "name",
  "role",
  "src",
  "type",
  "value",
]);

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) {
        files.push(...walk(path.join(dir, entry.name)));
      }
      continue;
    }

    const ext = path.extname(entry.name);
    if (SOURCE_EXTENSIONS.has(ext) || MARKDOWN_EXTENSIONS.has(ext)) {
      files.push(path.join(dir, entry.name));
    }
  }

  return files;
}

function getLineAndColumn(text, index) {
  const before = text.slice(0, index);
  const lines = before.split(/\r?\n/);
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
}

function preserveCase(word, suggestion) {
  if (word === word.toLocaleUpperCase("fr-FR")) {
    return suggestion.toLocaleUpperCase("fr-FR");
  }

  const firstLetter = word[0];
  if (firstLetter === firstLetter.toLocaleUpperCase("fr-FR")) {
    return (
      suggestion[0].toLocaleUpperCase("fr-FR") +
      suggestion.slice(1)
    );
  }

  return suggestion;
}

function reportMatches(file, fullText, text, start) {
  const findings = [];

  for (const match of text.matchAll(wordPattern)) {
    const word = match[0];
    const normalized = word.toLocaleLowerCase("fr-FR");
    const suggestion = accentHints.get(normalized);
    const absoluteIndex = start + match.index;
    const position = getLineAndColumn(fullText, absoluteIndex);
    const replacement = preserveCase(word, suggestion);

    findings.push({
      file,
      start: absoluteIndex,
      end: absoluteIndex + word.length,
      line: position.line,
      column: position.column,
      word,
      suggestion: replacement,
    });
  }

  return findings;
}

function isSkippedJsxAttribute(node) {
  const parent = node.parent;

  if (!parent || !ts.isJsxAttribute(parent)) {
    return false;
  }

  return NON_DISPLAY_JSX_ATTRIBUTES.has(parent.name.getText());
}

function isTemplateTextNode(node) {
  return (
    node.kind === ts.SyntaxKind.TemplateHead ||
    node.kind === ts.SyntaxKind.TemplateMiddle ||
    node.kind === ts.SyntaxKind.TemplateTail
  );
}

function getTemplateText(node) {
  const text = node.getText();
  if (node.kind === ts.SyntaxKind.TemplateHead) {
    return {
      content: text.slice(1, -2),
      start: node.getStart() + 1,
    };
  }

  if (node.kind === ts.SyntaxKind.TemplateMiddle) {
    return {
      content: text.slice(1, -2),
      start: node.getStart() + 1,
    };
  }

  return {
    content: text.slice(1, -1),
    start: node.getStart() + 1,
  };
}

function scanSourceFile(file) {
  const text = fs.readFileSync(file, "utf8");
  const source = ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const findings = [];

  function visit(node) {
    if (isSkippedJsxAttribute(node)) {
      ts.forEachChild(node, visit);
      return;
    }

    if (ts.isStringLiteral(node) && node.text.startsWith("/")) {
      ts.forEachChild(node, visit);
      return;
    }

    if (isTemplateTextNode(node)) {
      const templateText = getTemplateText(node);
      findings.push(
        ...reportMatches(file, text, templateText.content, templateText.start),
      );
    } else if (
      ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node) ||
      ts.isJsxText(node)
    ) {
      const nodeText = node.getText(source);
      const contentStart = ts.isJsxText(node) ? node.getStart(source) : node.getStart(source) + 1;
      const content = ts.isJsxText(node)
        ? nodeText
        : nodeText.slice(1, nodeText.length - 1);

      findings.push(...reportMatches(file, text, content, contentStart));
    }

    ts.forEachChild(node, visit);
  }

  visit(source);
  return findings;
}

function scanMarkdownFile(file) {
  const text = fs.readFileSync(file, "utf8");
  return reportMatches(file, text, text, 0);
}

function scanEncodingFile(file) {
  const text = fs.readFileSync(file, "utf8");
  const findings = [];

  for (const match of text.matchAll(mojibakePattern)) {
    const position = getLineAndColumn(text, match.index);

    findings.push({
      file,
      line: position.line,
      column: position.column,
      character: match[0],
    });
  }

  return findings;
}

const files = walk(root);
const findings = files.flatMap((file) => {
  const ext = path.extname(file);

  if (SOURCE_EXTENSIONS.has(ext)) {
    return scanSourceFile(file);
  }

  return scanMarkdownFile(file);
});
const encodingFindings = files.flatMap(scanEncodingFile);

if (shouldFix && findings.length > 0) {
  const findingsByFile = new Map();

  for (const finding of findings) {
    const fileFindings = findingsByFile.get(finding.file) ?? [];
    fileFindings.push(finding);
    findingsByFile.set(finding.file, fileFindings);
  }

  for (const [file, fileFindings] of findingsByFile) {
    const original = fs.readFileSync(file, "utf8");
    const fixed = fileFindings
      .toSorted((a, b) => b.start - a.start)
      .reduce(
        (current, finding) =>
          current.slice(0, finding.start) +
          finding.suggestion +
          current.slice(finding.end),
        original,
      );

    fs.writeFileSync(file, fixed);
  }

  console.log(`${findings.length} accent(s) corrigé(s).`);
  process.exit(0);
}

if (findings.length > 0) {
  console.error("Accents français potentiellement manquants :");
  for (const finding of findings) {
    const relativeFile = path.relative(root, finding.file);
    console.error(
      `${relativeFile}:${finding.line}:${finding.column} - "${finding.word}" -> "${finding.suggestion}"`,
    );
  }
  process.exitCode = 1;
}

if (encodingFindings.length > 0) {
  console.error("Encodage suspect dans des textes du projet :");
  for (const finding of encodingFindings) {
    const relativeFile = path.relative(root, finding.file);
    console.error(
      `${relativeFile}:${finding.line}:${finding.column} - caractère suspect "${finding.character}"`,
    );
  }
  process.exitCode = 1;
}
