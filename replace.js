const fs = require('fs');
const path = require('path');

function walk(dir) {
    let files = fs.readdirSync(dir);
    for (let file of files) {
        let full = path.join(dir, file);
        if (fs.statSync(full).isDirectory()) {
            walk(full);
        } else if (file === 'layout.jsx') {
            let cont = fs.readFileSync(full, 'utf8');
            let regex = /{\/\*\s*<Link[^>]*href="\/onboarding"[^>]*>[\s\S]*?<Globe[^>]*\/> Ecosystem Mode\s*<\/Link>\s*\*\/}/g;
            let regex2 = /<Link[^>]*href="\/onboarding"[^>]*>[\s\S]*?<Globe[^>]*\/> Ecosystem Mode\s*<\/Link>/g;
            
            let updated = false;
            if (regex.test(cont)) {
                cont = cont.replace(regex, '');
                updated = true;
            }
            if (regex2.test(cont)) {
                cont = cont.replace(regex2, '');
                updated = true;
            }
            
            if (updated) {
                fs.writeFileSync(full, cont);
                console.log('Removed from', full);
            }
        }
    }
}
walk('./src/app/(dashboard)/dashboard');
