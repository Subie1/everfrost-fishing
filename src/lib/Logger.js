require("colors").enable();

module.exports.enable = function () {
    // ORIGINAL
    const originalLog = console.log;

    // OLD
    console.logf = function (data) {
        originalLog(data);
    }

    // MAIN
    console.log = function (data) {
        const error = new Error();
        const stackLines = error.stack.split('\n');
        const callingFileLine = stackLines[2].trim();
        const callingFile = callingFileLine.substring(callingFileLine.lastIndexOf('(') + 1, callingFileLine.lastIndexOf(':')).split("\\");
        const name = callingFile[callingFile.length - 1].split(":")[0];

        originalLog.apply(console, [
            "DEBUG".white.underline + "  |".white + ` ${name} `.dim + "| " + data
        ])
    }

    console.error = function (data) {
        const error = new Error();
        const stackLines = error.stack.split('\n');
        const callingFileLine = stackLines[2].trim();
        const callingFile = callingFileLine.substring(callingFileLine.lastIndexOf('(') + 1, callingFileLine.lastIndexOf(':')).split("\\");
        const name = callingFile[callingFile.length - 1].split(":")[0];

        originalLog.apply(console, [
            "ERROR".red.underline + "  |".red + ` ${name} `.dim + "| " + data
        ])
    }

    console.success = function (data) {
        const error = new Error();
        const stackLines = error.stack.split('\n');
        const callingFileLine = stackLines[2].trim();
        const callingFile = callingFileLine.substring(callingFileLine.lastIndexOf('(') + 1, callingFileLine.lastIndexOf(':')).split("\\");
        const name = callingFile[callingFile.length - 1].split(":")[0];

        originalLog.apply(console, [
            "SUCCESS".green.underline + "  |".green + ` ${name} `.dim + "| " + data
        ])
    }

    console.warning = function (data) {
        const error = new Error();
        const stackLines = error.stack.split('\n');
        const callingFileLine = stackLines[2].trim();
        const callingFile = callingFileLine.substring(callingFileLine.lastIndexOf('(') + 1, callingFileLine.lastIndexOf(':')).split("\\");
        const name = callingFile[callingFile.length - 1].split(":")[0];

        originalLog.apply(console, [
            "WARNING".yellow.underline + "|".yellow + ` ${name} `.dim + "| " + data
        ])
    }

    console.warn = function (data) {
        const error = new Error();
        const stackLines = error.stack.split('\n');
        const callingFileLine = stackLines[2].trim();
        const callingFile = callingFileLine.substring(callingFileLine.lastIndexOf('(') + 1, callingFileLine.lastIndexOf(':')).split("\\");
        const name = callingFile[callingFile.length - 1].split(":")[0];

        originalLog.apply(console, [
            "WARNING".yellow.underline + "|".yellow + ` ${name} `.dim + "| " + data
        ])
    }

    console.special = function (data) {
        const error = new Error();
        const stackLines = error.stack.split('\n');
        const callingFileLine = stackLines[2].trim();
        const callingFile = callingFileLine.substring(callingFileLine.lastIndexOf('(') + 1, callingFileLine.lastIndexOf(':')).split("\\");
        const name = callingFile[callingFile.length - 1].split(":")[0];

        originalLog.apply(console, [
            "SPECIAL".magenta.underline + "|".magenta + ` ${name} `.dim + "| " + data
        ])
    }

    // AS
    console.logAs = function (name, data) {
        originalLog.apply(console, [
            "DEBUG".white.underline + "  |".white + ` ${name} `.dim + "| " + data
        ])
    }

    console.errorAs = function (name, data) {
        originalLog.apply(console, [
            "ERROR".red.underline + "  |".red + ` ${name} `.dim + "| " + data
        ])
    }

    console.successAs = function (name, data) {
        originalLog.apply(console, [
            "SUCCESS".green.underline + "|".green + ` ${name} `.dim + "| " + data
        ])
    }

    console.warningAs = function (name, data) {
        originalLog.apply(console, [
            "WARNING".yellow.underline + "|".yellow + ` ${name} `.dim + "| " + data
        ])
    }

    console.warnAs = function (name, data) {
        originalLog.apply(console, [
            "WARNING".yellow.underline + "|".yellow + ` ${name} `.dim + "| " + data
        ])
    }

    console.specialAs = function (name, data) {
        originalLog.apply(console, [
            "SPECIAL".magenta.underline + "|".magenta + ` ${name} `.dim + "| " + data
        ])
    }
}