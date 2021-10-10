'use strict';

const _ = require('lodash');
const chalk = require('chalk');
const stringFormatter = require('stylelint/lib/formatters/stringFormatter');

/**
 * @type {import('stylelint').Formatter}
 */
module.exports = function (results) {
	let output = stringFormatter(results),
		exampleLocation = null,
		exampleLine = null,
		exampleMessage = null,
		exampleRule = null;;

   results.every(result => {
        if (result.errored === false) {
            return true;
        } else {
        		exampleLocation = `${result.warnings[0].line}:${result.warnings[0].column}`,
				exampleLine = `${result.warnings[0].line}`,
				exampleMessage = `${result.warnings[0].text}`,
				exampleRule = `${result.warnings[0].rule}`;
				return false;
        }
   });

	if (output !== '') {
		output += chalk['green'].bold([
         "\ud83d\udd27 ", "Tips to fix this:\n",
      ].join(""));

		output += "   - Try running " + chalk.dim("`npm run fix`") + " to resolve any errors \n     that can be fixed automatically.\n";
		output += "   - Look at each file " + chalk['green'].bold("one by one.") + " The file name is underlined.\n";
		output += "   - Start with the " + chalk['green'].bold("first") + " error in the file, and work your way down.\n";
		output += "     Sometimes when you fix one error, it fixes other errors too.\n";
		output += "   - Look for the " + chalk['green'].bold("line and column number.") + " It looks like this: " + chalk.dim(exampleLocation) + "\n";
		output += "   - " + chalk['green'].bold("Find") + " the code in your file by using the first number: " + chalk.dim(exampleLine) + "\n";
		output += "     This line is where the problem is.\n";
		output += "   - " + chalk['green'].bold("Read") + " the message: " + chalk.dim(exampleMessage) + "\n";
		output += "     Look to see " + chalk['green'].bold("how the message relates to your code.") + "\n";
		output += "   - If you are still unsure, try " + chalk['green'].bold("looking up") + " the rule name: " + chalk.dim(exampleRule) + "\n";
		output += "     at " + chalk["cyan"].underline("https://stylelint.io/user-guide/rules/list/") + ".\n";
		output += "   - Rerun " + chalk.dim("`npm run test`") + " to see if you fixed the error.\n\n";
	}

	return `${output}`;
};
