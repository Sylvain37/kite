/** Dependency-free YAML subset codec used by Kite documents. */
export const manifest = {
  id: "org.kite.codec.yaml",
  version: "1.0.0",
  kind: "codec"
};

function stripComment(line) {
  let quote = null;
  let escaped = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (quote === '"') {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') quote = null;
      continue;
    }
    if (quote === "'") {
      if (ch === "'" && line[i + 1] === "'") {
        i += 1;
      } else if (ch === "'") {
        quote = null;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === "#" && (i === 0 || /\s/.test(line[i - 1]))) {
      return line.slice(0, i).trimEnd();
    }
  }
  return line.trimEnd();
}

/** Convert significant YAML lines into indentation-aware tokens. */
function tokenize(text) {
  const lines = [];
  String(text).replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n").split("\n").forEach((raw, index) => {
    if (/^\s*\t/.test(raw) || /^ +\t/.test(raw)) {
      throw new SyntaxError(`YAML line ${index + 1}: indentation tabs are not supported.`);
    }
    const withoutComment = stripComment(raw);
    if (!withoutComment.trim()) return;
    const indent = withoutComment.match(/^ */)[0].length;
    lines.push({ indent, content: withoutComment.slice(indent), line: index + 1 });
  });
  return lines;
}

function splitTopLevel(text, delimiter = ",") {
  const parts = [];
  let current = "";
  let quote = null;
  let escaped = false;
  let depth = 0;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quote === '"') {
      current += ch;
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') quote = null;
      continue;
    }
    if (quote === "'") {
      current += ch;
      if (ch === "'" && text[i + 1] === "'") {
        current += text[++i];
      } else if (ch === "'") quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      current += ch;
      continue;
    }
    if (ch === "[" || ch === "{") depth += 1;
    if (ch === "]" || ch === "}") depth -= 1;
    if (ch === delimiter && depth === 0) {
      parts.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim() || text.trim().endsWith(delimiter)) parts.push(current.trim());
  return parts;
}

function findMappingColon(text) {
  let quote = null;
  let escaped = false;
  let depth = 0;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quote === '"') {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') quote = null;
      continue;
    }
    if (quote === "'") {
      if (ch === "'" && text[i + 1] === "'") i += 1;
      else if (ch === "'") quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === "[" || ch === "{") depth += 1;
    else if (ch === "]" || ch === "}") depth -= 1;
    else if (ch === ":" && depth === 0 && (i === text.length - 1 || /\s/.test(text[i + 1]))) return i;
  }
  return -1;
}

function parseQuoted(value) {
  if (value.startsWith('"')) {
    try {
      return JSON.parse(value);
    } catch {
      throw new SyntaxError(`Invalid double-quoted YAML string: ${value}`);
    }
  }
  return value.slice(1, -1).replace(/''/g, "'");
}

function parseScalar(raw) {
  const value = raw.trim();
  if (value === "") return "";
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return parseQuoted(value);
  }
  if (/^(?:null|~)$/i.test(value)) return null;
  if (/^(?:true|false)$/i.test(value)) return value.toLowerCase() === "true";
  if (/^[-+]?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][-+]?\d+)?$/.test(value)) return Number(value);

  if (value.startsWith("[") && value.endsWith("]")) {
    const inner = value.slice(1, -1).trim();
    return inner ? splitTopLevel(inner).map(parseScalar) : [];
  }
  if (value.startsWith("{") && value.endsWith("}")) {
    const result = {};
    const inner = value.slice(1, -1).trim();
    if (!inner) return result;
    for (const part of splitTopLevel(inner)) {
      const colon = findMappingColon(part);
      if (colon < 0) throw new SyntaxError(`Invalid inline YAML object: ${value}`);
      const key = parseKey(part.slice(0, colon));
      result[key] = parseScalar(part.slice(colon + 1));
    }
    return result;
  }
  return value;
}

function parseKey(raw) {
  const key = raw.trim();
  if (!key) throw new SyntaxError("Empty YAML key.");
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    return String(parseQuoted(key));
  }
  return key;
}

function parseMappingLine(content, lineNumber) {
  const colon = findMappingColon(content);
  if (colon < 0) throw new SyntaxError(`YAML line ${lineNumber}: expected a key/value pair.`);
  return {
    key: parseKey(content.slice(0, colon)),
    rawValue: content.slice(colon + 1).trim()
  };
}

/** Recursively parse one indentation block as a mapping or sequence. */
function parseBlock(lines, start, indent) {
  if (start >= lines.length) return { value: null, next: start };
  if (lines[start].indent !== indent) {
    throw new SyntaxError(`YAML line ${lines[start].line}: unexpected indentation.`);
  }
  return lines[start].content === "-" || lines[start].content.startsWith("- ")
    ? parseSequence(lines, start, indent)
    : parseMapping(lines, start, indent);
}

function parseMapping(lines, start, indent) {
  const object = {};
  let index = start;
  while (index < lines.length) {
    const token = lines[index];
    if (token.indent < indent) break;
    if (token.indent > indent) {
      throw new SyntaxError(`YAML line ${token.line}: orphan indentation.`);
    }
    if (token.content === "-" || token.content.startsWith("- ")) break;

    const { key, rawValue } = parseMappingLine(token.content, token.line);
    index += 1;
    if (rawValue !== "") {
      object[key] = parseScalar(rawValue);
      continue;
    }
    if (index < lines.length && lines[index].indent > indent) {
      const child = parseBlock(lines, index, lines[index].indent);
      object[key] = child.value;
      index = child.next;
    } else {
      object[key] = null;
    }
  }
  return { value: object, next: index };
}

function parseSequence(lines, start, indent) {
  const array = [];
  let index = start;
  while (index < lines.length) {
    const token = lines[index];
    if (token.indent < indent) break;
    if (token.indent !== indent || !(token.content === "-" || token.content.startsWith("- "))) break;

    const rest = token.content.slice(1).trimStart();
    index += 1;
    if (!rest) {
      if (index < lines.length && lines[index].indent > indent) {
        const child = parseBlock(lines, index, lines[index].indent);
        array.push(child.value);
        index = child.next;
      } else {
        array.push(null);
      }
      continue;
    }

    const colon = findMappingColon(rest);
    if (colon < 0) {
      array.push(parseScalar(rest));
      if (index < lines.length && lines[index].indent > indent) {
        throw new SyntaxError(`YAML line ${lines[index].line}: a list scalar cannot have a nested block.`);
      }
      continue;
    }

    const item = {};
    const key = parseKey(rest.slice(0, colon));
    const rawValue = rest.slice(colon + 1).trim();
    if (rawValue !== "") {
      item[key] = parseScalar(rawValue);
    } else if (index < lines.length && lines[index].indent > indent) {
      const child = parseBlock(lines, index, lines[index].indent);
      item[key] = child.value;
      index = child.next;
    } else {
      item[key] = null;
    }

    if (index < lines.length && lines[index].indent > indent) {
      const continuationIndent = lines[index].indent;
      const continuation = parseMapping(lines, index, continuationIndent);
      Object.assign(item, continuation.value);
      index = continuation.next;
    }
    array.push(item);
  }
  return { value: array, next: index };
}

export function parse(text) {
  const lines = tokenize(text);
  if (!lines.length) return null;
  if (lines[0].indent !== 0) throw new SyntaxError(`YAML line ${lines[0].line}: the document must start in column 1.`);
  const result = parseBlock(lines, 0, 0);
  if (result.next !== lines.length) {
    throw new SyntaxError(`YAML line ${lines[result.next].line}: unexpected content.`);
  }
  return result.value;
}

function scalarToYAML(value) {
  if (value === null || value === undefined) return "null";
  if (typeof value === "boolean" || typeof value === "number") return String(value);
  const text = String(value);
  const reserved = /^(?:null|~|true|false|[-+]?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][-+]?\d+)?)$/i;
  const needsQuotes = text === "" || reserved.test(text) || /^\s|\s$/.test(text) || /[:#\[\]{},&*!|>'"%@`\n\r]/.test(text) || /^[-?]\s/.test(text);
  return needsQuotes ? JSON.stringify(text) : text;
}

function keyToYAML(key) {
  const text = String(key);
  return /^[A-Za-z_][A-Za-z0-9_.-]*$/.test(text) ? text : JSON.stringify(text);
}

function writeNode(value, indent, lines) {
  const pad = " ".repeat(indent);
  if (Array.isArray(value)) {
    if (!value.length) {
      lines.push(`${pad}[]`);
      return;
    }
    for (const item of value) {
      if (item && typeof item === "object") {
        lines.push(`${pad}-`);
        writeNode(item, indent + 2, lines);
      } else {
        lines.push(`${pad}- ${scalarToYAML(item)}`);
      }
    }
    return;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value).filter(([, child]) => child !== undefined);
    if (!entries.length) {
      lines.push(`${pad}{}`);
      return;
    }
    for (const [key, child] of entries) {
      if (child && typeof child === "object") {
        if (Array.isArray(child) && child.length === 0) lines.push(`${pad}${keyToYAML(key)}: []`);
        else if (!Array.isArray(child) && Object.keys(child).length === 0) lines.push(`${pad}${keyToYAML(key)}: {}`);
        else {
          lines.push(`${pad}${keyToYAML(key)}:`);
          writeNode(child, indent + 2, lines);
        }
      } else {
        lines.push(`${pad}${keyToYAML(key)}: ${scalarToYAML(child)}`);
      }
    }
    return;
  }
  lines.push(`${pad}${scalarToYAML(value)}`);
}

export /** Serialize the supported YAML subset using deterministic indentation. */
function stringify(value) {
  const lines = [];
  writeNode(value, 0, lines);
  return `${lines.join("\n")}\n`;
}

const codec = Object.freeze({
  id: "yaml",
  extensions: ["yml", "yaml"],
  parse,
  stringify
});

export function activate(context) {
  return context.codecs.register(codec.id, codec);
}
