import fs from "fs";
import path from "path";

const root = path.resolve(import.meta.dirname, "..");
const SPACING = 2.5;
const LETTER_STARTS = [161.557, 169.835, 178.69, 206.798, 224.767, 249.69, 258.085];

function getLetterIndex(startX) {
  for (let i = LETTER_STARTS.length - 1; i >= 0; i -= 1) {
    if (startX >= LETTER_STARTS[i] - 5) return i;
  }
  return 0;
}

function getStartX(part) {
  const match = part.match(/^M([-\d.]+)/i);
  return match ? Number.parseFloat(match[1]) : 0;
}

function spreadTextPath(d, fill) {
  const parts = d.split(/Z\s*M/i).map((part, index) =>
    index === 0 ? part : `M${part}`,
  );

  const letterGroups = Array.from({ length: LETTER_STARTS.length }, () => []);
  for (const part of parts) {
    const letterIndex = getLetterIndex(getStartX(part));
    letterGroups[letterIndex].push(part.endsWith("Z") ? part : `${part}Z`);
  }

  const groups = letterGroups
    .filter((group) => group.length > 0)
    .map((group, index) => {
      const dx = index * SPACING;
      const combinedPath = group.join("");
      if (dx === 0) {
        return `<path d="${combinedPath}" fill="${fill}"/>`;
      }
      return `<g transform="translate(${dx}, 0)"><path d="${combinedPath}" fill="${fill}"/></g>`;
    })
    .join("\n");

  const letterCount = letterGroups.filter((group) => group.length > 0).length;
  const extraWidth = (letterCount - 1) * SPACING;

  return { groups, extraWidth };
}

const sourceFile = path.join(root, "docs/logo/full_logo.svg");
const sourceSvg = fs.readFileSync(sourceFile, "utf8");
const sourceMatch = sourceSvg.match(
  /<path d="([^"]+)" fill="(#[0-9A-Fa-f]{6})"\s*\/?>\s*<\/svg>/,
);

if (!sourceMatch) {
  throw new Error("Could not extract wordmark path from docs/logo/full_logo.svg");
}

const [, sourcePath, sourceFill] = sourceMatch;
const { groups, extraWidth } = spreadTextPath(sourcePath, sourceFill);

const targets = [
  {
    file: "public/assets/logo/logo-wordmark-light.svg",
    fill: "#F5F7FA",
  },
  {
    file: "public/LOGO.svg",
    fill: "#22282E",
  },
  {
    file: "LOGO.svg",
    fill: "#22282E",
  },
  {
    file: "docs/logo/full_logo.svg",
    fill: sourceFill,
  },
];

for (const target of targets) {
  const file = path.join(root, target.file);
  if (!fs.existsSync(file)) continue;

  let svg = fs.readFileSync(file, "utf8");
  const { groups: spacedGroups } = spreadTextPath(sourcePath, target.fill);

  svg = svg.replace(
    /viewBox="0 0 \d+(?:\.\d+)? 111"/,
    `viewBox="0 0 ${272 + extraWidth} 111"`,
  );

  svg = svg.replace(
    /<path d="[^"]+" fill="(#[0-9A-Fa-f]{6})"\s*\/?>\s*(?:<g transform="translate\([^"]+\)"><path d="[^"]+" fill="(#[0-9A-Fa-f]{6})"\/><\/g>\s*)*<\/svg>/,
    `${spacedGroups}\n</svg>`,
  );

  fs.writeFileSync(file, svg);
  console.log(`Updated ${target.file}`);
}

console.log(`Letter spacing: +${SPACING}px between ${LETTER_STARTS.length} letters`);
