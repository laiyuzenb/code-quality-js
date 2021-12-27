const chalk = require("chalk");
const { table } = require("table");
const { Signale } = require("signale");
const { Spinner } = require("cli-spinner");

const spinner = new Spinner("");
const TABLE_HEAD = ["复杂度", "重构建议", "函数名", "函数类型", "位置"];
const INFO_COLOR = "#c0ffb3";
const WARNING_BG_COLOR = "#f75f00";
const WARNING_COLOR = "#f7e8f6";

const options = {
  types: {
    error: {
      badge: " ❌ ",
      color: "red",
      label: "失败",
    },
    success: {
      badge: " 🎉 ",
      color: "green",
      label: "成功",
    },
    info: {
      badge: "",
      color: "",
      label: "",
    },
  },
};

const signale = new Signale(options);

// 处理数据展示颜色
function getColorData(data) {
  const { complexity, advice, funcName, fileName, funcType, position } = data;
  const colorData = [];
  if (complexity > 15) {
    colorData.push(chalk.red(complexity));
    colorData.push(chalk.whiteBright.bgRed.bold(advice));
  } else if (complexity > 10) {
    colorData.push(chalk.yellow(complexity));
    colorData.push(
      chalk.hex(WARNING_COLOR).bgHex(WARNING_BG_COLOR).bold(advice)
    );
  } else {
    colorData.push(chalk.green(complexity));
    colorData.push(chalk.green(advice));
  }
  return colorData.concat([
    chalk.hex(INFO_COLOR)(funcName),
    chalk.hex(INFO_COLOR)(funcType),
    chalk.hex(INFO_COLOR)(`${fileName} [${position}]`),
  ]);
}

const handleData = (target) => {
  const result = target.map(getColorData);
  result.unshift(TABLE_HEAD);
  return result;
};

module.exports = {
  success: function (msg) {
    signale.success(chalk.green(msg));
  },
  error: function (msg) {
    signale.error(chalk.red(msg));
  },
  info: function (msg) {
    signale.info(chalk.green(msg));
  },
  loading: (title = "加载中...") => {
    spinner.setSpinnerTitle(` 💫  ${title}  %s`);
    spinner.setSpinnerString("⣾⣽⣻⢿⡿⣟⣯⣷");
    spinner.start();
  },
  stop: () => {
    spinner.stop();
  },
  table: (data) => {
    console.log(table(handleData(data)));
  },
};
