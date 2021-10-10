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

    if (results.length > 0 && results[0].messages.length !== 0) {
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

        output += chalk[successColor].bold([
            "\n\ud83d\udd27 ", "Tips to fix this:\n",
        ].join(""));

        if (exampleRule === "parser-error") {
            output += "   - This error is a " + chalk.dim("parser-error") + ". It looks like nonsense, but it\n";
            output += "     usually means that something is wrong with your " + chalk[successColor].bold("syntax") + ".\n";
            output += "   - First, " + chalk[successColor].bold("find the file") + ". The file name and folder is underlined.\n";
            output += "   - Then, look for the " + chalk[successColor].bold("line and column number.") + " It looks like this: " + chalk.dim(exampleLocation) + "\n";
        	output += "   - " + chalk[successColor].bold("Find") + " the code in your file by using the first number: " + chalk.dim(exampleLine) + "\n";
        	output += "     This line will be close to where the problem is. You can find\n";
        	output += "     line numbers to the left of your code in your text editor.\n";
        	output += "     Syntax errors are usually caused by " + chalk[successColor].bold("the previous line of code.") + "\n";
            output += "   - Check very carefully for " + chalk[successColor].bold("syntax errors") + " using these checklists.\n";
            output += "     \u2610 Does every " + chalk[successColor].bold("opening tag") + chalk.dim(" (such as \<p\>)") + " have a matching\n";
            output += "       " + chalk[successColor].bold("closing tag") + chalk.dim(" (such as \<\/p\>)") + "?\n";
            output += "     \u2610 Do you have all of these characters in the " + chalk[successColor].bold("right places") + "?\n";
        	output += "           \u2610 Left bracket (starts a tag): " + chalk.dim("\<") + "\n";
        	output += "           \u2610 Right bracket (ends a tag): " + chalk.dim("\>") + "\n";
        	output += "           \u2610 Equals sign (sets an attribute value): " + chalk.dim("\=") + "\n";
        	output += "           \u2610 Quotation marks (surrounds the attribute value): " + chalk.dim("\"") + "\n";
            output += "     \u2610 Do you see any " + chalk[successColor].bold("odd highlighting") + " in your code editor?\n";
            output += "       Check the line above it for possible issues.\n";
            output += "   - If you are still can't find the problem, " + chalk[successColor].bold("try asking a classmate.") + "\n\n";
        	output += "Here is a simple example of " + chalk[successColor].bold("proper syntax") + " for a tag with an attribute\n"
        	output += "to help you double check. Look carefully for syntax differences in your\n"
        	output += "code, and note the placement of each of the characters in the line.\n\n"
        	output += chalk.bold("Code example: ") + chalk.dim("\<a href\=\"https://www.google.com\">Google\</a\>") + "\n\n";
        } else {
        	output += "   - Look at each file " + chalk[successColor].bold("one by one.") + " The file name is underlined.\n";
        	output += "   - Start with the " + chalk[successColor].bold("first") + " error in the file, and work your way down.\n";
        	output += "     Sometimes when you fix one error, it fixes other errors too.\n";
        	output += "   - Look for the " + chalk[successColor].bold("line and column number.") + " It looks like this: " + chalk.dim(exampleLocation) + "\n";
        	output += "   - " + chalk[successColor].bold("Find") + " the code in your file by using the first number: " + chalk.dim(exampleLine) + "\n";
        	output += "     This line (or the line above it) is where the problem is.\n";
        	output += "   - " + chalk[successColor].bold("Read") + " the message: " + chalk.dim(exampleMessage) + "\n";
        	output += "     Look to see " + chalk[successColor].bold("how the message relates to your code.") + "\n";
        	output += "   - Double check that you have " + chalk[successColor].bold("closed your tags") + " in the right order.\n";
        	output += "   - If you are still unsure, try " + chalk[successColor].bold("looking up") + " the rule name: " + chalk.dim(exampleRule) + "\n";
        	output += "     at " + chalk["cyan"].underline("https://html-validate.org/rules/index.html") + ".\n";
        	output += "   - Rerun " + chalk.dim("`npm run test`") + " to see if you fixed the error.\n";
        }
    }

    // Resets output color, for prevent change on top level
    return total > 0 ? chalk.reset(output) : "";
};
