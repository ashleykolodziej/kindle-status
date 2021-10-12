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
	await page.evaluate(() => {
  		document.body.style.transform = 'rotate(-90deg) translateY(-100px)';
	});
	await page.screenshot({
		path: 'schedule.png',
		type: 'png',
		fullPage: true,
	});

	await browser.close();
};

capture();
