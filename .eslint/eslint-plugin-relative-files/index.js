const { existsSync } = require('fs');
const { dirname, join } = require('path');

module.exports.rules = {
    'must-end-with-js': {
        meta: {
            fixable: true,
        },
        create: function (context) {
            const fixSourcePath = (node) => {
                const source = node.source.value;
                // if it's a relative import or export that doesn't end with .js
                if (source.startsWith('.') && !source.endsWith('.js')) {
                    const fullPath = join(dirname(context.getFilename()), node.source.value);
                    // and a .tsx? file exists
                    if (existsSync(`${fullPath}.ts`) || existsSync(`${fullPath}.tsx`)) {
                        context.report({
                            node,
                            message: 'Relative imports and exports must end with .js',
                            fix: (fixer) => fixer.replaceText(node.source, `'${node.source.value}.js'`),
                        });
                    }
                }
            };

            return {
                ExportAllDeclaration: fixSourcePath,
                ExportNamedDeclaration: fixSourcePath,
                ImportDeclaration: fixSourcePath,
                ImportNamespaceSpecifier: fixSourcePath,
            };
        },
    },
};

// module.exports.rules = {
//     'must-end-with-js': {
//         meta: {
//             fixable: true,
//         },
//         create(context) {
//             function rule(node) {
//                 if (node.source.value.startsWith('.') && !node.source.value.endsWith('.js')) {
//                     context.report({
//                         node,
//                         message: 'Relative imports and exports must end with .js',
//                         fix(fixer) {
//                             return fixer.replaceText(node.source, `'${node.source.value}.js'`);
//                         },
//                     });
//                 }
//             }
//
//             return {
//                 ExportAllDeclaration: rule,
//                 ExportNamedDeclaration: rule,
//                 ImportDeclaration: rule,
//             };
//         },
//     },
// };
