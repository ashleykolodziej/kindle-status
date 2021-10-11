const puppeteer = require('puppeteer');

const capture = async () => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	await page.setViewport({
		width: 800,
		height: 600,
	});

	await page.goto('https://ashleykolodziej.github.io/kindle-status/');
	await page.waitForSelector('.fc');
	await page.screenshot({
		path: 'schedule.png',
		fullPage: true,
	});

	await browser.close();
};

capture();
