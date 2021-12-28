#!/usr/bin/env node
const { Command } = require("commander");
const complexity = require("./complexity");
const package = require("../package.json");

const version = package.version;
const program = new Command();

// 设置默认node和babel环境变量 防止报错 阻拦了后面的检查问题
process.env.NODE_ENV = "development";
process.env.BABEL_ENV = "development";
const main = () => {
  program
    .version(version, "-v, --version", "输出版本号")
    .option("-max, --max [max]", "设置最大圈层复杂度", (v) => {
      return Number(v);
    })
    .option("-mode, --mode [mode]", "设置扫描模式", "complexity");

  program.parse(process.argv);
  // 解析命令行参数
  const options = program.opts();
  const { mode } = options;
  // 根据模式匹配对应处理函数
  const modeMap = new Map([
    // 检查圈层复杂度
    ["complexity", complexity],
  ]);
  modeMap.get(mode)({ ...options });
};

main();
