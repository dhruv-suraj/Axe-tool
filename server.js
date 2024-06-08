// const puppeteer = require('puppeteer');
// const axeCore = require('axe-core');
// const fs = require('fs');
// const path = require('path');
// const { Parser } = require('json2csv');

// async function runAxe(url) {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();

//   await page.goto(url, { waitUntil: 'networkidle2' });

//   // Inject the axe-core library into the page
//   await page.addScriptTag({ content: axeCore.source });

//   // Run axe-core and get results
//   const results = await page.evaluate(async () => {
//     return await axe.run();
//   });

//   await browser.close();

//   // Process results into CSV format
//   const violations = results.violations.map(violation => {
//     return violation.nodes.map(node => ({
//       id: violation.id,
//       impact: violation.impact,
//       description: violation.description,
//       help: violation.help,
//       helpUrl: violation.helpUrl,
//       html: node.html,
//       target: node.target.join(', ')
//     }));
//   }).flat();

//   const fields = [
//     'id',
//     'impact',
//     'description',
//     'help',
//     'helpUrl',
//     'html',
//     'target'
//   ];

//   const parser = new Parser({ fields });
//   const csv = parser.parse(violations);

//   const reportPath = path.resolve(__dirname, 'axe-report.csv');
//   fs.writeFileSync(reportPath, csv);
//   console.log(`Accessibility report saved to ${reportPath}`);
// }

// const url = process.argv[2];
// if (!url) {
//   console.error('Please provide a URL as an argument');
//   process.exit(1);
// }

// runAxe(url).catch(err => {
//   console.error('Error running axe:', err);
// });

// const puppeteer = require('puppeteer');
// const axeCore = require('axe-core');
// const fs = require('fs');
// const path = require('path');
// const { Parser } = require('json2csv');

// async function runAxe(url) {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();

//   await page.goto(url, { waitUntil: 'networkidle2' });

//   // Inject the axe-core library into the page
//   await page.addScriptTag({ content: axeCore.source });

//   // Run axe-core and get results
//   const results = await page.evaluate(async () => {
//     return await axe.run();
//   });

//   await browser.close();

//   // Process results into CSV format
//   const violations = results.violations.map(violation => {
//     return violation.nodes.map(node => ({
//       id: violation.id,
//       impact: violation.impact,
//       description: violation.description,
//       help: violation.help,
//       helpUrl: violation.helpUrl,
//       html: node.html,
//       target: node.target.join(', ')
//     }));
//   }).flat();

//   const fields = [
//     'id',
//     'impact',
//     'description',
//     'help',
//     'helpUrl',
//     'html',
//     'target'
//   ];

//   // Save CSV report
//   const parser = new Parser({ fields });
//   const csv = parser.parse(violations);
//   const csvReportPath = path.resolve(__dirname, 'axe-report.csv');
//   fs.writeFileSync(csvReportPath, csv);
//   console.log(`Accessibility CSV report saved to ${csvReportPath}`);
// }

// const url = process.argv[2];
// if (!url) {
//   console.error('Please provide a URL as an argument');
//   process.exit(1);
// }

// runAxe(url).catch(err => {
//   console.error('Error running axe:', err);
// });


// const puppeteer = require('puppeteer');
// const axeCore = require('axe-core');
// const fs = require('fs');
// const path = require('path');
// const { Parser } = require('json2csv');

// async function runAxeOnMultipleUrls(urls) {
//   const browser = await puppeteer.launch();
  
//   for (const url of urls) {
//     const page = await browser.newPage();
//     await page.goto(url, { waitUntil: 'networkidle2' });

//     // Inject the axe-core library into the page
//     await page.addScriptTag({ content: axeCore.source });

//     // Run axe-core and get results
//     const results = await page.evaluate(async () => {
//       return await axe.run();
//     });

//     // Process results into CSV format
//     const violations = results.violations.map(violation => {
//       return violation.nodes.map(node => ({
//         id: violation.id,
//         impact: violation.impact,
//         description: violation.description,
//         help: violation.help,
//         helpUrl: violation.helpUrl,
//         html: node.html,
//         target: node.target.join(', ')
//       }));
//     }).flat();

//     const fields = [
//       'id',
//       'impact',
//       'description',
//       'help',
//       'helpUrl',
//       'html',
//       'target'
//     ];

//     // Save CSV report
//     const parser = new Parser({ fields });
//     const csv = parser.parse(violations);
//     const csvReportPath = path.resolve(__dirname, `axe-report-${encodeURIComponent(url)}.csv`);
//     fs.writeFileSync(csvReportPath, csv);
//     console.log(`Accessibility CSV report saved to ${csvReportPath}`);
//   }

//   await browser.close();
// }

// const urls = process.argv.slice(2);
// if (urls.length === 0) {
//   console.error('Please provide one or more URLs as arguments');
//   process.exit(1);
// }

// runAxeOnMultipleUrls(urls).catch(err => {
//   console.error('Error running axe:', err);
// });


const puppeteer = require('puppeteer');
const axeCore = require('axe-core');
const fs = require('fs');
const path = require('path');
const { Parser } = require('json2csv');

async function runAxeOnMultipleUrls(urls) {
  const browser = await puppeteer.launch();
  const violationsCollection = [];

  for (const url of urls) {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Inject the axe-core library into the page
    await page.addScriptTag({ content: axeCore.source });

    // Run axe-core and get results
    const results = await page.evaluate(async () => {
      return await axe.run();
    });

    // Process results into a flat array of violations
    const violations = results.violations.map(violation => {
      return violation.nodes.map(node => ({
        id: violation.id,
        impact: violation.impact,
        description: violation.description,
        help: violation.help,
        helpUrl: violation.helpUrl,
        html: node.html,
        target: node.target.join(', '),
        url: url // Add URL to track the source of the violation
      }));
    }).flat();

    // Collect all violations
    violationsCollection.push(...violations);

    await page.close(); // Close the page after processing
  }

  await browser.close();

  const fields = [
    'id',
    'impact',
    'description',
    'help',
    'helpUrl',
    'html',
    'target',
    'url' // Include URL field in the CSV
  ];

  // Save merged CSV report
  const parser = new Parser({ fields });
  const csv = parser.parse(violationsCollection);
  const csvReportPath = path.resolve(__dirname, 'merged-axe-report.csv');
  fs.writeFileSync(csvReportPath, csv);
  console.log(`Accessibility CSV report saved to ${csvReportPath}`);
}

const urls = process.argv.slice(2);
if (urls.length === 0) {
  console.error('Please provide one or more URLs as arguments');
  process.exit(1);
}

runAxeOnMultipleUrls(urls).catch(err => {
  console.error('Error running axe:', err);
});
