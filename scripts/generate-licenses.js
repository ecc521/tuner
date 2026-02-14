const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const nodeModulesDir = path.join(rootDir, 'node_modules');
const assetsDir = path.join(rootDir, 'assets');
const outputFile = path.join(assetsDir, 'licenses.json');

// List of dependencies to manually attribute if missing LICENSE file
const manualAttributions = {
    // Add any manual attributions here if needed
    'node-forge': {
        name: 'node-forge',
        license: 'BSD-3-Clause',
        licenseText: `Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.`
    },
    'SpaceMono': {
        name: 'Space Mono',
        version: '1.0',
        license: 'OFL-1.1',
        licenseText: `SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide development of collaborative font projects, to support the font creation efforts of academic and linguistic communities, and to provide a free and open framework in which fonts may be shared and improved in partnership with others.

The OFL allows the licensed fonts to be used, studied, modified and redistributed freely as long as they are not sold by themselves. The fonts, including any derivative works, can be bundled, embedded, redistributed and/or sold with any software provided that any reserved names are not used by derivative works. The fonts and derivatives, however, cannot be released under any other type of license. The requirement for fonts to remain under this license does not apply to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright Holder(s) under this license and clearly marked as such. This may include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the copyright statement(s).

"Original Version" refers to the collection of Font Software components as distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting, or substituting -- in part or in whole -- any of the components of the Original Version, by changing formats or by porting the Font Software to a new environment.

"Author" refers to any designer, engineer, programmer, technical writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining a copy of the Font Software, to use, study, copy, merge, embed, modify, redistribute, and sell modified and unmodified copies of the Font Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components, in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled, redistributed and/or sold with any software, provided that each copy contains the above copyright notice and this license. These can be included either as stand-alone text files, human-readable headers or in the appropriate machine-readable metadata fields within text or binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font Name(s) unless explicit written permission is granted by the corresponding Copyright Holder. This restriction only applies to the primary font name as presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font Software shall not be used to promote, endorse or advertise any Modified Version, except to acknowledge the contribution(s) of the Copyright Holder(s) and the Author(s) or with their explicit written permission.

5) The Font Software, modified or unmodified, in part or in whole, must be distributed entirely under this license, and must not be distributed under any other license. The requirement for fonts to remain under this license does not apply to any document created using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM OTHER DEALINGS IN THE FONT SOFTWARE.`,
        homepage: 'https://fonts.google.com/specimen/Space+Mono'
    }
};

function getLicenseText(packagePath) {
    const files = ['LICENSE', 'LICENSE.txt', 'LICENSE.md', 'license', 'license.txt', 'license.md'];
    for (const file of files) {
        const licensePath = path.join(packagePath, file);
        if (fs.existsSync(licensePath)) {
            return fs.readFileSync(licensePath, 'utf8');
        }
    }
    return null;
}

function scanDependencies() {
    const licenses = {};

    // Read root package.json for direct dependencies
    const packageJsonPath = path.join(rootDir, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
        console.error('No package.json found at root!');
        return;
    }

    const rootPkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = { ...rootPkg.dependencies, ...rootPkg.devDependencies };

    // Function to process a dependency
    const processDependency = (depName) => {
        if (licenses[depName]) return; // Already processed

        // Handle manual override early
        if (manualAttributions[depName]) {
            licenses[depName] = manualAttributions[depName];
            return;
        }

        let pkgPath;
        try {
            // Resolve package.json path using require.resolve
            // This handles dependency hoisting correctly
            const entryPath = require.resolve(path.join(depName, 'package.json'), { paths: [rootDir] });
            pkgPath = path.dirname(entryPath);
        } catch (e) {
            // Fallback: assume top-level node_modules
            pkgPath = path.join(nodeModulesDir, depName);
            if (!fs.existsSync(path.join(pkgPath, 'package.json'))) {
                console.warn(`Could not resolve package.json for ${depName}`);
                return;
            }
        }

        const depPkgPath = path.join(pkgPath, 'package.json');
        const depPkg = JSON.parse(fs.readFileSync(depPkgPath, 'utf8'));

        let licenseType = depPkg.license || (depPkg.licenses && depPkg.licenses[0]?.type);
        if (typeof licenseType !== 'string') licenseType = 'Unknown';

        // node-forge special handling if manual list didn't catch it
        if (depName === 'node-forge' && licenseType.includes('GPL')) {
             licenseType = 'BSD-3-Clause';
        }

        const licenseText = getLicenseText(pkgPath) || 'License text not found.';

        licenses[depName] = {
            name: depName,
            version: depPkg.version,
            license: licenseType,
            licenseText: licenseText,
            homepage: depPkg.homepage,
            repository: depPkg.repository ? (typeof depPkg.repository === 'string' ? depPkg.repository : depPkg.repository.url) : null
        };
    };

    // Process manual attributions first
    Object.keys(manualAttributions).forEach(name => {
        licenses[name] = manualAttributions[name];
    });

    // Process all direct dependencies
    Object.keys(dependencies).forEach(processDependency);

    // Also process implicit dependencies (React, Expo internals) that are critical
    // This is simplified; a full scan is complex. We'll stick to direct dependencies mostly,
    // plus a few key ones if needed.
    // However, licenses usually require attribution for ALL linked code.
    // For a React Native app, this means basically everything in the bundle.
    // To be safe, we'll iterate over the top-level node_modules folders that start with @ or are not hidden.

    const topLevelModules = fs.readdirSync(nodeModulesDir).filter(name => !name.startsWith('.'));
    topLevelModules.forEach(name => {
        if (name.startsWith('@')) {
            const scopeDir = path.join(nodeModulesDir, name);
            if (fs.existsSync(scopeDir)) {
                 const scopedModules = fs.readdirSync(scopeDir).filter(n => !n.startsWith('.'));
                 scopedModules.forEach(subName => processDependency(`${name}/${subName}`));
            }
        } else {
            processDependency(name);
        }
    });

    // Write to file
    // sort by name
    const sortedLicenses = Object.values(licenses).sort((a, b) => a.name.localeCompare(b.name));

    fs.writeFileSync(outputFile, JSON.stringify(sortedLicenses, null, 2));
    console.log(`Generated licenses for ${sortedLicenses.length} packages at ${outputFile}`);
}

scanDependencies();
