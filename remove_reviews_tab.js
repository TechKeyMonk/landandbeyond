const fs = require('fs');
const path = require('path');

const filePaths = [
    path.join(__dirname, 'dashboard.html'),
    path.join(__dirname, 'public', 'dashboard.html')
];

for (const filePath of filePaths) {
    if (!fs.existsSync(filePath)) {
        console.warn('File not found:', filePath);
        continue;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Remove Sidebar menu
    const sidebarRegex = /\s*<!-- Item 8: Customer Reviews -->[\s\S]*?<\/button>\n/;
    content = content.replace(sidebarRegex, '');

    // 2. Remove Tab Content
    const tabRegex = /\s*<!-- TAB 8: CUSTOMER REVIEWS -->[\s\S]*?<\/section>\n/;
    content = content.replace(tabRegex, '');
    
    // 3. Remove Modal
    const modalRegex = /\s*<!-- REVIEW EDIT \/ ADD MODAL -->[\s\S]*?<\/div>\s*<\/div>\n/;
    content = content.replace(modalRegex, '');

    // 4. Remove JS Logic
    const jsRegex = /\s*\/\/ --------------------------------------------------------------------------\s*\/\/ 8\. RENDER REVIEWS MODULE\s*\/\/ --------------------------------------------------------------------------[\s\S]*?window\.deleteReview = deleteReview;\n/;
    content = content.replace(jsRegex, '');

    // 5. Remove switchAdminTab entry
    const switchTabRegex = /\s*else if \(tabName === 'reviews'\) renderReviewsModule\(\);/;
    content = content.replace(switchTabRegex, '');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully removed reviews tab from', filePath);
}
