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

    if (!profilerFound) {
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
          t.importDeclaration(
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

export default function ({ types: t, template }) {
  const getComponentName = (scope) => {
    let componentName = ''
    switch (scope.path.type) {
      case "ClassMethod":
        componentName = scope.path.parentPath.parent.id.name;
        break;
      case "FunctionDeclaration":
        componentName = scope.path.container.declaration.id.name
        break;
      case "FunctionExpression":
        scope.path.parentPath.parentPath.parentPath.parent.arguments.forEach(arg => {
          if (arg.type === "Identifier") {
            componentName = arg.name
          }
        })
        break;
      default:
        componentName = scope.path.container.id.name;
        break;
    }
    return componentName
  }

  const wrapWithProfiler = (jsx, componentName) => {
    const Profiler = 'Profiler'
    return template.ast`
      React.createElement(
        ${Profiler},
        {
          id: '${componentName}',
          onRender: onRenderCallBack$
        },
        ${jsx.node}
      )
    `
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
              t.stringLiteral('babel-plugin-wrap-profiler/lib/profiler-utils')
            ))
          }
        }
      },
      JSXElement: {
        enter(path, state) {
          // TODO: move node_modules check logic to pre
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
              const newNodeAst = wrapWithProfiler(path, componentName)
              path.replaceWith(newNodeAst)
            }
          }
        }
      }
    }
  } 
}
