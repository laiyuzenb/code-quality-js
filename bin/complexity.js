const { logger, inspectComplexity } = require("../utils");
const { mean } = require("lodash");

const _median = (arr) => {
  arr.sort((a, b) => {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  });
  //求中位数
  if (arr.length % 2 === 0) {
    return (arr[arr.length / 2 - 1] + arr[arr.length / 2]) / 2;
  } else {
    return arr[Math.floor(arr.length / 2)];
  }
};

/**
 * 检查代码圈层复杂度
 * @param {number} max - 最大圈层复杂度
 */
const complexity = async ({ max = 15 }) => {
  logger.loading("正在执行代码复杂度检测...");
  const inspectParam = {
    rootPath: "",
    defalutIgnore: true,
    ignoreFileName: ".gitignore",
    ignoreRules: ["node_modules"],
    extensions: "**/*.?(js|vue|jsx)",
    max,
  };
  const inspectResult = await inspectComplexity(inspectParam);
  const { fileCount, funcCount, result, complexityList } = inspectResult;

  // 计算中位数 平均数
  const meanNumber = mean(complexityList).toFixed(2);
  const median = _median(complexityList);

  logger.success(
    `检测完成, 共检测【${fileCount}】个文件，【${funcCount}】个函数，其中可能存在问题的函数【${result.length}】个, 圈层复杂度平均数 【${meanNumber}】圈层复杂度中位数 【${median}】`
  );
  if (result.length) {
    logger.table(result);
  } else {
    logger.info("你的代码非常棒！");
  }
  logger.stop();
};

module.exports = complexity;
