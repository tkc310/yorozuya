const factories = new Set(["ok", "err", "okAsync", "errAsync"]);
const consumers = new Set(["match", "unwrapOr", "unwrapOrElse", "isOk", "isErr"]);

function calleeName(node) {
  if (!node) {
    return "";
  }
  if (node.type === "Identifier") {
    return node.name;
  }
  return "";
}

function isFactoryCall(node) {
  return node && node.type === "CallExpression" && factories.has(calleeName(node.callee));
}

function referenceIsConsumed(identifier) {
  let current = identifier;
  while (current.parent) {
    const parent = current.parent;
    if (parent.type === "MemberExpression" && parent.object === current && !parent.computed) {
      const name = parent.property && parent.property.type === "Identifier" ? parent.property.name : "";
      return consumers.has(name);
    }
    if (parent.type === "ReturnStatement" && parent.argument === current) {
      return true;
    }
    if (parent.type === "ArrowFunctionExpression" && parent.body === current) {
      return true;
    }
    if (
      parent.type === "ChainExpression" ||
      parent.type === "ParenthesizedExpression" ||
      parent.type === "AwaitExpression" ||
      parent.type === "TSAsExpression" ||
      parent.type === "TSNonNullExpression" ||
      parent.type === "TSSatisfiesExpression"
    ) {
      current = parent;
      continue;
    }
    return false;
  }
  return false;
}

function declaredVariables(context, node) {
  if (typeof context.getDeclaredVariables === "function") {
    return context.getDeclaredVariables(node);
  }
  if (context.sourceCode && typeof context.sourceCode.getDeclaredVariables === "function") {
    return context.sourceCode.getDeclaredVariables(node);
  }
  return [];
}

const rule = {
  meta: {
    type: "problem",
    docs: {
      description: "Result と ResultAsync は返すか、match / unwrapOr / unwrapOrElse / isOk / isErr で使う",
    },
    schema: [],
    messages: {
      unused: "Result を返さず、match、unwrapOr、unwrapOrElse、isOk、isErr も呼んでいません。",
    },
  },
  create(context) {
    return {
      ExpressionStatement(node) {
        if (isFactoryCall(node.expression)) {
          context.report({ node, messageId: "unused" });
        }
      },
      VariableDeclarator(node) {
        if (!isFactoryCall(node.init) || node.id.type !== "Identifier") {
          return;
        }
        const variables = declaredVariables(context, node);
        const used = variables.some((variable) =>
          variable.references.some(
            (reference) => reference.identifier !== node.id && referenceIsConsumed(reference.identifier),
          ),
        );
        if (!used) {
          context.report({ node, messageId: "unused" });
        }
      },
    };
  },
};

const plugin = {
  meta: { name: "must-use-result" },
  rules: {
    "must-use-result": rule,
  },
};

export default plugin;
