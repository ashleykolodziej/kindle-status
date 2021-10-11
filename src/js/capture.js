const puppeteer = require('puppeteer');

const capture = async () => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	await page.setViewport({
		width: 600,
		height: 800,
	});

	await page.goto('https://ashleykolodziej.github.io/kindle-status/');
	await page.waitForSelector('.fc');
	await page.screenshot({
		path: 'schedule.png',
		type: 'png',
		fullPage: false,
		clip: {
			x: 0,
			y: 0,
			width: 600,
			height: 800,
		},
	});

	await browser.close();
};

capture();
