import generate from "@babel/generator";
import { parse } from "@babel/parser";

let isProfilerImported = false;

const handleProfilerImport = (t, path) => {
  let profilerFound = false
  let reactImportIdx = null
  let profilerImportName = 'Profiler'

  path.node.body.forEach((n, idx) => {
    if (n.type === 'ImportDeclaration') {
      if (n.source.value === 'react') {
        reactImportIdx = idx
      }

      n.specifiers.forEach(specifier => {
        if (specifier.imported && specifier.local) {
          if (specifier.imported.name === 'Profiler' || specifier.local.name === 'Profiler') {
            profilerFound = true
            // get local identifier in case of aliasing
            profilerImportName = specifier.local.name
          }

          if (!specifier.imported && specifier.local) {
            if (specifier.local.name === 'Profiler') {
              profilerFound = true
            }
          }
        }
      })
    }

    // TODO: Add code for variableDeclaration require

    if (!profilerFound && !isProfilerImported) {
      isProfilerImported = true;
      // react import found
      if (reactImportIdx !== null) {
        path.node.body[reactImportIdx].specifiers.push(
          t.importSpecifier(
            t.identifier('Profiler'),
            t.identifier('Profiler')
          )
        )
      } else {
        // create es6 import
        path.node.body.unshift(
          t.ImportDeclaration(
            [
              t.importSpecifier(
                t.identifier('Profiler'),
                t.identifier('Profiler')
              )
            ],
            t.stringLiteral('react')
          )
        )
      }
    }
  })

  return profilerImportName
}

export default function ({ types: t }) {
  const getComponentName = (scope) => {
    let componentName = null
    if (scope.path.type === "ClassMethod") {
      componentName = scope.path.parentPath.parent.id.name;
    } else if(scope.path.type === "FunctionDeclaration") {
      componentName = scope.path.container.declaration.id.name
    } else {
      componentName = scope.path.container.id.name;
    }
    return componentName
  }
  const wrapWithProfiler = (jsx, componentName) => {
    return t.JSXElement(
      t.JSXOpeningElement(
        t.JSXIdentifier('Profiler'),
        [
          t.JSXAttribute(
            t.JSXIdentifier('id'),
            t.stringLiteral(componentName)
          ),
          t.JSXAttribute(
            t.JSXIdentifier('onRender'),
            t.JSXExpressionContainer(
              t.Identifier('onRenderCallBack$')
            )
          )
        ]
      ),
      t.JSXClosingElement(
        t.JSXIdentifier('Profiler')
      ),
      [
        jsx.node
      ]
    )
  }

  return {
    visitor: {
      Program: {
        enter(path, state) {
          if (this.file.opts.filename) {
            const includeNodeModules = Boolean(
              state.opts && state.opts.includeNodeModules
            )

            // ignore node modules if includeNodeModules opt not specified as true
            if (this.file.opts.filename.match(/node_modules/) !== null && !includeNodeModules) {
              return
            }

            // check if file has jsx
            let hasJSX = true

            path.traverse({
              JSXElement: {
                enter() {
                  hasJSX = true
                }
              }
            })

            if (!hasJSX) {
              return
            }

            const profilerImport = handleProfilerImport(t, path)
            path.unshiftContainer('body', t.importDeclaration(
              [
                t.importSpecifier(
                  t.identifier('onRenderCallBack$'),
                  t.identifier('onRenderCallBack$')
                )
              ],
              t.stringLiteral('babel-plugin-wrap-profiler/src/profiler-utils')
            ))
          }
        }
      },
      VariableDeclaration: {
        exit(path, state) {
        }
      },
      JSXElement: {
        exit(path, state) {
          if(this.file.opts.filename) {
            const includeNodeModules = Boolean(
              state.opts && state.opts.includeNodeModules
            )

            // ignore node modules if includeNodeModules opt not specified as true
            if (this.file.opts.filename.match(/node_modules/) !== null && !includeNodeModules) {
              return
            }
            const { parent, scope } = path
            const topLevelReactComponent = parent.type === "ReturnStatement"
            if (topLevelReactComponent) {
              // function component name
              let componentName = getComponentName(scope)
              // wrap top level react component with profiler
              // const newNode = wrapWithProfiler(path, componentName)
              const Profiler = 'Profiler'
              const newNodeAst = parse(`
                <${Profiler} id="${componentName}" onRender={onRenderCallBack$}>
                  ${generate(path.node).code}
                </${Profiler}>
              `, {
                sourceType: "module",
                plugins: ["jsx"]
              }).program.body[0].expression
              path.replaceWith(
                newNodeAst
              )
              path.skip()
            }
          }
        }
      }
    }
  } 
}
