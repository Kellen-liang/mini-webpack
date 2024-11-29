const fs = require('fs');
const path = require('path');
const paser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const babel = require('@babel/core');

function moduleAnalyser(fileName) {
  const content = fs.readFileSync(fileName, 'utf8');
  const ast = paser.parse(content, { sourceType: "module" });
  const dependencies = {};
  traverse(ast, {
    ImportDeclaration({ node }) {
      const dirname = path.dirname(fileName);
      // path.join()方法在Mac系统中输出的结果和在Windows系统中是不一样的，在Mac中输出"/"，在Windows中输出"\\"，所以我们这里需要用到正则进行处理一下
      const newFile = ('./' + path.join(dirname, node.source.value)).replace(/\\/g, '/');
      dependencies[node.source.value] = newFile
    }
  })
  const { code } = babel.transformFromAst(ast, null, {
    presets: ["@babel/preset-env"]
  })

  return { fileName, dependencies, code };

}

const moduleInfo = moduleAnalyser('./src/entry.js')
console.log(moduleInfo)

/**
 * 1.读取入口文件获取文件内容
 * 2.提取文件的依赖。借助babel/parser和@babel/traverse,通过操作AST抽象语法树提取所有依赖
 * 3.使用babel对代码进行行转换、编译，把代码转换成浏览器可以认识的es5。借助@babel/core和@babel/preset-env，提供
 *  transformFromAst()方法进行转换，这个方法会把ast抽象语法树转换成一个对象并且返回，对象里包含一个code，这个code就是编译生成的，
 *  可以在浏览器上直接运行的当前模块的代码
 * 4.
 */