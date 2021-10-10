/**
 * @fileoverview Stylish reporter (Modified for Student Site Boilerplate)
 * @author Sindre Sorhus
 */
"use strict";

const chalk = require("chalk"),
    stripAnsi = require("strip-ansi"),
    table = require("text-table");

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Given a word and a count, append an s if count is not one.
 * @param {string} word A word in its singular form.
 * @param {int} count A number controlling whether word should be pluralized.
 * @returns {string} The original word with an s on the end if count is not one.
 */
function pluralize(word, count) {
    return (count === 1 ? word : `${word}s`);
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

module.exports = function(results) {

    let output = "\n",
        errorCount = 0,
        warningCount = 0,
        fixableErrorCount = 0,
        fixableWarningCount = 0,
        summaryColor = "yellow",
        successColor = "green",
        exampleLocation = null,
        exampleLine = null,
        exampleMessage = null,
        exampleRule = null;

    if (results[0].messages.length !== 0) {
			exampleLocation = `${results[0].messages[0].line}:${results[0].messages[0].column}`,
			exampleLine = `${results[0].messages[0].line}`,
			exampleMessage = `${results[0].messages[0].message}`,
			exampleRule = `${results[0].messages[0].ruleId}`;
    }

    results.forEach(result => {
        const messages = result.messages;

        if (messages.length === 0) {
            return;
        }

        errorCount += result.errorCount;
        warningCount += result.warningCount;
        fixableErrorCount += result.fixableErrorCount;
        fixableWarningCount += result.fixableWarningCount;

        output += `${chalk.underline(result.filePath)}\n`;

        output += `${table(
            messages.map(message => {
                let messageType;
                if (message.fatal || message.severity === 2) {
                    messageType = chalk.red("error");
                    summaryColor = "red";
                } else {
                    messageType = chalk.yellow("warning");
                }
                return [
                    "",
                    message.line || 0,
                    message.column || 0,
                    messageType,
                    message.message.replace(/([^ ])\.$/u, "$1"),
                    chalk.dim(message.ruleId || "")
                ];
            }),
            {
                align: ["", "r", "l"],
                stringLength(str) {
                    return stripAnsi(str).length;
                }
            }
        ).split("\n").map(el => el.replace(/(\d+)\s+(\d+)/u, (m, p1, p2) => chalk.dim(`${p1}:${p2}`))).join("\n")}\n\n`;
    });

    const total = errorCount + warningCount;

    if (total > 0) {
        output += chalk[summaryColor].bold([
            "\u2716 ", total, pluralize(" problem", total),
            " (", errorCount, pluralize(" error", errorCount), ", ",
            warningCount, pluralize(" warning", warningCount), ")\n"
        ].join(""));

        if (fixableErrorCount > 0 || fixableWarningCount > 0) {
            output += chalk[summaryColor].bold([
                "  ", fixableErrorCount, pluralize(" error", fixableErrorCount), " and ",
                fixableWarningCount, pluralize(" warning", fixableWarningCount),
                " potentially fixable by running `npm run fix`.\n"
            ].join(""));
        }

        output += chalk[successColor].bold([
            "\n\ud83d\udd27 ", "Tips to fix this:\n",
        ].join(""));

        if (fixableErrorCount > 0 || fixableWarningCount > 0) {
            output += "   - Try running " + chalk.dim("`npm run fix`") + " to resolve any errors \n     that can be fixed automatically.\n";
        } else {
        	output += "   - Look at each file " + chalk[successColor].bold("one by one.") + " The file name is underlined.\n";
        	output += "   - Start with the " + chalk[successColor].bold("first") + " error in the file, and work your way down.\n";
        	output += "     Sometimes when you fix one error, it fixes other errors too.\n";
        	output += "   - Look for the " + chalk[successColor].bold("line and column number.") + " It looks like this: " + chalk.dim(exampleLocation) + "\n";
        	output += "   - " + chalk[successColor].bold("Find") + " the code in your file by using the first number: " + chalk.dim(exampleLine) + "\n";
        	output += "     This line is where the problem is.\n";
        	output += "   - " + chalk[successColor].bold("Read") + " the message: " + chalk.dim(exampleMessage) + "\n";
        	output += "     Look to see " + chalk[successColor].bold("how the message relates to your code.") + "\n";
        	output += "   - If you are still unsure, try " + chalk[successColor].bold("looking up") + " the rule name: " + chalk.dim(exampleRule) + "\n";
        	output += "     at " + chalk["cyan"].underline("https://eslint.org/docs/rules/") + ".\n";
        	output += "   - Rerun " + chalk.dim("`npm run test`") + " to see if you fixed the error.";
        }
    }

    // Resets output color, for prevent change on top level
    return total > 0 ? chalk.reset(output) : "";
};
