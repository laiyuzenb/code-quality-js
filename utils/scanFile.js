const path = require("path");
const fs = require("fs");
const glob = require("glob");
const ignore = require("ignore");

/**
 * 默认参数
 */
const DEFAULT_PARAM = {
  rootPath: "",
  ignoreRules: [],
  defalutIgnore: true,
  ignoreFileName: ".gitignore",
  ignoreRules: ["node_modules"],
  extensions: "./**/*.?(js|vue|jsx)",
};

/**
 * 加载ignore配置文件，并处理成数组
 * @param {*} ignoreFileName
 */
async function loadIgnorePatterns(ignoreFileName) {
  const ignorePath = path.resolve(process.cwd(), ignoreFileName);
  try {
    const ignores = fs.readFileSync(ignorePath, "utf8");
    return ignores.split(/[\n\r]|\n\r/).filter((pattern) => Boolean(pattern));
  } catch (e) {
    return [];
  }
}

/**
 * 根据ignore配置过滤文件列表
 * @param {*} files
 * @param {*} ignorePatterns
 * @param {*} cwd
 */
function filterFilesByIgnore(
  files,
  ignorePatterns,
  ignoreRules,
  cwd = process.cwd()
) {
  const ig = ignore().add([...ignorePatterns, ...ignoreRules]);
  const filtered = files
    .map((raw) => (path.isAbsolute(raw) ? raw : path.resolve(cwd, raw)))
    .map((raw) => path.relative(cwd, raw))
    .filter((filePath) => !ig.ignores(filePath))
    .map((raw) => path.resolve(cwd, raw));
  return filtered;
}

/**
 * 执行扫描
 * @param {*} path 扫描路径 - 默认为当前路径
 */
module.exports = async function scan(param) {
  param = Object.assign(DEFAULT_PARAM, param);

  const { ignoreRules, ignoreFileName, extensions } = param;
  const ignorePatterns = await loadIgnorePatterns(ignoreFileName);
  const files = glob.sync(extensions);
  const result = filterFilesByIgnore(files, ignorePatterns, ignoreRules);

  return result;
};
