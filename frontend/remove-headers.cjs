const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/pages');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));
let processed = 0;

files.forEach(file => {
  const filePath = path.join(dir, file);
  let code = fs.readFileSync(filePath, 'utf8');

  // Match the entire page-header div correctly including nested divs
  // Because regex matching nested HTML is hard, we use index counting
  
  const headerStartIdx = code.indexOf('<div className="page-header">');
  if (headerStartIdx === -1) return;

  // Find the exact closing </div> for the page-header by matching pairs
  let openCount = 0;
  let headerEndIdx = -1;
  for (let i = headerStartIdx; i < code.length; i++) {
    if (code.slice(i, i + 4) === '<div') {
      openCount++;
    } else if (code.slice(i, i + 5) === '</div') {
      openCount--;
      if (openCount === 0) {
        headerEndIdx = i + 6; // include </div>
        break;
      }
    }
  }

  if (headerEndIdx === -1) {
    console.log('Could not find closing div for', file);
    return;
  }

  const headerContent = code.substring(headerStartIdx, headerEndIdx);
  
  // Extract all <button... elements from the page-header, EXCEPT the generic ones if any, wait, any button in page-header is a generic action button like + Add Zone
  const buttonRegex = /<button[\s\S]*?<\/button>/g;
  const buttons = [];
  let match;
  while ((match = buttonRegex.exec(headerContent)) !== null) {
    buttons.push(match[0]);
  }

  // Remove the page-header fully
  code = code.slice(0, headerStartIdx) + code.slice(headerEndIdx);

  // If there are buttons extracted, inject them into the filter-bar
  if (buttons.length > 0) {
    const filterBarIdx = code.indexOf('<div className="filter-bar">');
    if (filterBarIdx !== -1) {
      // Find the closing </div> for filter-bar
      let openCountFilter = 0;
      let filterBarEndIdx = -1;
      for (let i = filterBarIdx; i < code.length; i++) {
        if (code.slice(i, i + 4) === '<div') openCountFilter++;
        else if (code.slice(i, i + 5) === '</div') {
          openCountFilter--;
          if (openCountFilter === 0) {
            filterBarEndIdx = i;
            break;
          }
        }
      }

      if (filterBarEndIdx !== -1) {
        // Insert buttons right before the closing </div> of filter-bar
        // Wrap them in an marginLeft: 'auto' div so they push to the right
        const buttonsHtml = '\n        <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>\n          ' + buttons.join('\n          ') + '\n        </div>\n      ';
        code = code.slice(0, filterBarEndIdx) + buttonsHtml + code.slice(filterBarEndIdx);
      } else {
        console.log('Could not find filter-bar closing div for', file);
      }
    } else {
      // No filter-bar, just inject the buttons where the header used to be?
      const buttonsHtml = '<div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px", gap: "10px" }}>' + buttons.join('\n') + '</div>';
      code = code.slice(0, headerStartIdx) + buttonsHtml + code.slice(headerStartIdx);
    }
  }

  // Clean up any double blank lines left behind
  code = code.replace(/\n\s*\n\s*\n/g, '\n\n');

  fs.writeFileSync(filePath, code);
  processed++;
  console.log('Processed', file, 'extracted buttons:', buttons.length);
});

console.log('Complete! Processed', processed, 'files.');
