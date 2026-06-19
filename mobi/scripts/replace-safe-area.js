const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            if(!file.includes('node_modules') && !file.includes('.git') && !file.includes('.expo')) {
                results = results.concat(walk(file));
            }
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(path.join(__dirname, '..'));

let changed = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Check if SafeAreaView is imported from react-native
    const rnImportRegex = /import\s+{([^}]*SafeAreaView[^}]*)}\s+from\s+['"]react-native['"];?/;
    const match = content.match(rnImportRegex);
    
    if (match) {
        // remove SafeAreaView from react-native import
        let importsStr = match[1];
        let parts = importsStr.split(',').map(p => p.trim()).filter(p => p && p !== 'SafeAreaView');
        let newImportsStr = parts.join(', ');
        
        let newContent;
        if (parts.length === 0) {
            newContent = content.replace(rnImportRegex, '');
        } else {
            newContent = content.replace(rnImportRegex, `import { ${newImportsStr} } from 'react-native';`);
        }
        
        // add import SafeAreaView from react-native-safe-area-context
        if (!newContent.includes('react-native-safe-area-context')) {
            // Find the last import line to append to
            const lastImportIdx = newContent.lastIndexOf('import ');
            if (lastImportIdx !== -1) {
                const endOfLine = newContent.indexOf('\n', lastImportIdx);
                newContent = newContent.slice(0, endOfLine + 1) + "import { SafeAreaView } from 'react-native-safe-area-context';\n" + newContent.slice(endOfLine + 1);
            } else {
                newContent = "import { SafeAreaView } from 'react-native-safe-area-context';\n" + newContent;
            }
        } else {
            // react-native-safe-area-context is already imported, ensure SafeAreaView is in it
            const rnscRegex = /import\s+{([^}]*)}\s+from\s+['"]react-native-safe-area-context['"];?/;
            const rnscMatch = newContent.match(rnscRegex);
            if (rnscMatch && !rnscMatch[1].includes('SafeAreaView')) {
                newContent = newContent.replace(rnscRegex, `import { ${rnscMatch[1].trim()}, SafeAreaView } from 'react-native-safe-area-context';`);
            }
        }
        
        fs.writeFileSync(file, newContent, 'utf8');
        changed++;
        console.log(`Updated ${file.split('\\').pop()}`);
    }
});

console.log(`\nUpdated ${changed} files.`);
