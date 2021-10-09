"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = _default;

var handleProfilerImport = function handleProfilerImport(t, path) {
  var profilerFound = false;
  var reactImportIdx = null;
  var profilerImportName = 'Profiler';
  path.node.body.forEach(function (n, idx) {
    if (n.type === 'ImportDeclaration') {
      if (n.source.value === 'react') {
        reactImportIdx = idx;
      }

      n.specifiers.forEach(function (specifier) {
        if (specifier.imported && specifier.local) {
          if (specifier.imported.name === 'Profiler' || specifier.local.name === 'Profiler') {
            profilerFound = true; // get local identifier in case of aliasing

            profilerImportName = specifier.local.name;
          }

          if (!specifier.imported && specifier.local) {
            if (specifier.local.name === 'Profiler') {
              profilerFound = true;
            }
          }
        }
      });
    } // TODO: Add code for variableDeclaration require


    if (!profilerFound) {
      // react import found
      if (reactImportIdx !== null) {
        path.node.body[reactImportIdx].specifiers.push(t.importSpecifier(t.identifier('Profiler'), t.identifier('Profiler')));
      } else {
        // create es6 import
        path.node.body.unshift(t.ImportDeclaration([t.importSpecifier(t.identifier('Profiler'), t.identifier('Profiler'))], t.stringLiteral('react')));
      }
    }
  });
  return profilerImportName;
};

function _default(_ref) {
  var t = _ref.types;

  var wrapWithProfiler = function wrapWithProfiler(jsx) {
    return t.JSXElement(t.JSXOpeningElement(t.JSXIdentifier('Profiler'), []), t.JSXClosingElement(t.JSXIdentifier('Profiler')), [jsx.node]);
  };

  return {
    visitor: {
      Program: {
        enter: function enter(path, state) {
          if (this.file.opts.filename) {
            var includeNodeModules = Boolean(state.opts && state.opts.includeNodeModules); // ignore node modules if includeNodeModules opt not specified as true

            if (this.file.opts.filename.match(/node_modules/) !== null && !includeNodeModules) {
              return;
            } // check if file has jsx


            var hasJSX = true;
            path.traverse({
              JSXElement: {
                enter: function enter() {
                  hasJSX = true;
                }
              }
            });

            if (!hasJSX) {
              return;
            }

            var profilerImport = handleProfilerImport(t, path);
          }
        }
      },
      VariableDeclaration: {
        exit: function exit(path, state) {}
      },
      JSXElement: {
        exit: function exit(path, state) {
          var container = path.container,
              parent = path.parent,
              node = path.node;
          var topLevelReactComponent = parent.type === "ReturnStatement";

          if (topLevelReactComponent) {
            // wrap top level react component with profiler
            // path.replaceWithSourceString(
            //   JSON.stringify(wrapWithProfiler(path))
            // )
            var newNode = wrapWithProfiler(path);
            console.log(t.isJSXElement(newNode));
            path.replaceWith(newNode);
            path.skip();
          }
        }
      }
    }
  };
}