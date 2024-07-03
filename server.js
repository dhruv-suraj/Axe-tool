const puppeteer = require('puppeteer');
const axeCore = require('axe-core');
const fs = require('fs');
const path = require('path');
const { Parser } = require('json2csv');

async function runAxeOnPage(page, pageName, url) {
  // Inject the axe-core library into the page
  await page.addScriptTag({ content: axeCore.source });

  // Run axe-core and get results
  const results = await page.evaluate(async () => {
    return await axe.run();
  });

  const violations = results.violations.map(violation => {
    return violation.nodes.map(node => ({
      id: violation.id,
      impact: violation.impact,
      description: violation.description,
      help: violation.help,
      helpUrl: violation.helpUrl,
      html: node.html,
      target: node.target.join(', '),
      pageName: pageName, // Add page name to track the source of the violation
      url: url // Add URL to track the source of the violation
    }));
  }).flat();

  return violations;
}

async function runAxeOnSingleUrl(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });

  // Run axe-core on the main page
  let violations = await runAxeOnPage(page, 'Main page', url);

  // Get the first five tabs
  const tabs = await page.$$eval('a', anchors => anchors.slice(0, 5).map(anchor => anchor.href));

  // Run axe-core on each tab
  for (let i = 0; i < tabs.length; i++) {
    const tabPage = await browser.newPage();
    await tabPage.goto(tabs[i], { waitUntil: 'networkidle2' });
    const tabViolations = await runAxeOnPage(tabPage, `Page ${i + 1}`, tabs[i]);
    violations = violations.concat(tabViolations);
    await tabPage.close();
  }

  await page.close();
  await browser.close();

  // Remove duplicate violations
  const uniqueViolations = removeDuplicates(violations);

  const fields = [
    'id',
    'impact',
    'description',
    'help',
    'helpUrl',
    'html',
    'target',
    'pageName', // Include page name field in the CSV
    'url' // Include URL field in the CSV
  ];

  // Save CSV report
  const parser = new Parser({ fields });
  const csv = parser.parse(uniqueViolations);
  const csvReportPath = path.resolve(__dirname, 'axe-report.csv');
  fs.writeFileSync(csvReportPath, csv);
  console.log(`Accessibility CSV report saved to ${csvReportPath}`);
}

function removeDuplicates(violations) {
  const unique = [];
  const map = new Map();
  for (const violation of violations) {
    const key = `${violation.id}-${violation.target}-${violation.url}`;
    if (!map.has(key)) {
      map.set(key, true);
      unique.push(violation);
    }
  }
  return unique;
}

const url = process.argv[2];
if (!url) {
  console.error('Please provide a URL as an argument');
  process.exit(1);
}

runAxeOnSingleUrl(url).catch(err => {
  console.error('Error running axe:', err);
});

