const phrase = /create\s+table/i;

function filePath(context) {
  const name =
    context.filename ||
    (typeof context.getFilename === "function" ? context.getFilename() : "") ||
    "";
  return String(name).split("\\").join("/");
}

function inMigrations(context) {
  return filePath(context).includes("src/server/db/migrations/");
}

function literalHasPhrase(node) {
  return typeof node.value === "string" && phrase.test(node.value);
}

function templateHasPhrase(node) {
  return node.quasis.some((quasi) => {
    const text = quasi.value.cooked ?? quasi.value.raw ?? "";
    return phrase.test(text);
  });
}

const rule = {
  meta: {
    type: "problem",
    docs: {
      description: "表を作る SQL は src/server/db/migrations に置く",
    },
    schema: [],
    messages: {
      forbidden: "表を作る SQL は src/server/db/migrations に置いてください。",
    },
  },
  create(context) {
    if (inMigrations(context)) {
      return {};
    }
    return {
      Literal(node) {
        if (literalHasPhrase(node)) {
          context.report({ node, messageId: "forbidden" });
        }
      },
      TemplateLiteral(node) {
        if (templateHasPhrase(node)) {
          context.report({ node, messageId: "forbidden" });
        }
      },
    };
  },
};

const plugin = {
  meta: { name: "no-create-table" },
  rules: {
    "no-create-table": rule,
  },
};

export default plugin;
