/**
 * 代码复杂度检测
 */

const eslint = require("eslint");
const scanFile = require("./scanFile");

const { CLIEngine } = eslint;

const cli = new CLIEngine({
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    complexity: ["error", { max: 0 }],
  },
  useEslintrc: true,
});

/**
 * 提取函数类型正则
 */
const REG_FUNC_TYPE = /^(Method |Async function |Arrow function |Function )/g;

/**
 * eslint提示前缀
 */
const MESSAGE_PREFIX = "Maximum allowed is 1.";

/**
 * eslint提示后缀
 */
const MESSAGE_SUFFIX = "has a complexity of ";

/**
 * 提取mssage主要部分
 * @param {*} message
 */
function getMain(message) {
  return message.replace(MESSAGE_PREFIX, "").replace(MESSAGE_SUFFIX, "");
}

/**
 * 提取代码复杂度
 * @param {*} message
 */
function getComplexity(message) {
  const main = getMain(message);
  /(\d+)\./g.test(main);
  return +RegExp.$1;
}

/**
 * 获取函数名
 * @param {*} message
 */
function getFunctionName(message) {
  const main = getMain(message);
  let test = /'([a-zA-Z0-9_$]+)'/g.test(main);
  return test ? RegExp.$1 : "*";
}

/**
 * 提取函数类型
 * @param {*} message
 */
function getFunctionType(message) {
  let hasFuncType = REG_FUNC_TYPE.test(message);
  return hasFuncType ? RegExp.$1 : "";
}

/**
 * 提取文件名称
 * @param {*} filePath
 */
function getFileName(filePath) {
  return filePath.replace(process.cwd(), "").trim();
}

/**
 * 获取重构建议
 * @param {*} complexity
 */
function getAdvice(complexity) {
  if (complexity > 20) {
    return "强烈建议重构";
  } else if (complexity > 15) {
    return "建议重构";
  } else {
    return "无需重构";
  }
}

/**
 * 获取单个文件的复杂度
 */
function executeOnFiles({ files, max }) {
  const reports = cli.executeOnFiles(files).results;
  // 所有函数复杂度
  const complexityList = [];

  const result = [];
  const fileCount = files.length;
  let funcCount = 0;
  for (let i = 0; i < reports.length; i++) {
    const { messages, filePath } = reports[i];
    for (let j = 0; j < messages.length; j++) {
      const { message, ruleId, line, column } = messages[j];
      funcCount++;
      if (ruleId === "complexity") {
        const complexity = getComplexity(message);
        complexityList.push(complexity);

        if (complexity >= max) {
          result.push({
            funcType: getFunctionType(message),
            funcName: getFunctionName(message),
            position: line + "," + column,
            fileName: getFileName(filePath),
            complexity,
            advice: getAdvice(complexity),
          });
        }
      }
    }
  }

  return { fileCount, funcCount, result, complexityList };
}

/**
 * 执行扫描
 * @param {*} scanParam 扫描参数
 */
module.exports = async function (scanParam) {
  const { max } = scanParam;

  const files = await scanFile(scanParam);
  // 返回扫描后代码复杂度报告
  return executeOnFiles({ files, max });
};
