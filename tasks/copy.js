const fs = require('fs-extra');
const globby = require('globby');
const {getDestDir} = require('./paths');
const reload = require('./reload');
const {createTask} = require('./task');

const srcDir = 'src';
const cwdPaths = [
    'background/index.html',
    'config/**/*.config',
    'icons/**/*.*',
    'ui/assets/**/*.*',
    'ui/popup/compatibility.js',
    'manifest.json',
];
const paths = cwdPaths.map((path) => `${srcDir}/${path}`);

function getCwdPath(/** @type {string} */srcPath) {
    return srcPath.substring(srcDir.length + 1);
}

async function patchManifestFirefox({debug, firefox, thunderbird}) {
    const manifest = await fs.readJson(`${srcDir}/manifest.json`);
    const fireFoxPatch = await fs.readJson(`${srcDir}/manifest-firefox.json`);
    const thunderBirdPatch = await fs.readJson(`${srcDir}/manifest-thunderbird.json`);
    const patched = firefox ? {...manifest, ...fireFoxPatch} : {...manifest, ...thunderBirdPatch};
    const destDir = getDestDir({debug, firefox, thunderbird});
    await fs.writeJson(`${destDir}/manifest.json`, patched, {spaces: 4});
}

async function patchManifestMV3({debug}) {
    const manifest = await fs.readJson(`${srcDir}/manifest.json`);
    const mv3Patch = await fs.readJson(`${srcDir}/manifest-mv3.json`);
    const patched = {...manifest, ...mv3Patch};
    patched.browser_action = undefined;
    const destDir = getDestDir({debug, mv3: true});
    await fs.writeJson(`${destDir}/manifest.json`, patched, {spaces: 4});
}

async function copyFile(path, {debug, firefox, mv3, thunderbird}) {
    const cwdPath = getCwdPath(path);
    const destDir = getDestDir({debug, firefox, mv3, thunderbird});
    if ((firefox || thunderbird) && cwdPath === 'manifest.json') {
        await patchManifestFirefox({debug, firefox, thunderbird});
    } else if (mv3 && cwdPath === 'manifest.json') {
        await patchManifestMV3({debug});
    } else if (mv3 && cwdPath === 'background/index.html') {
        // Do nothing
    } else {
        const src = `${srcDir}/${cwdPath}`;
        const dest = `${destDir}/${cwdPath}`;
        await fs.copy(src, dest);
    }
}

async function copy({debug}) {
    const files = await globby(paths);
    for (const file of files) {
        await copyFile(file, {debug, firefox: false});
        await copyFile(file, {debug, firefox: true});
        await copyFile(file, {debug, mv3: true});
        await copyFile(file, {debug, firefox: false, thunderbird: true});
    }
}

module.exports = createTask(
    'copy',
    copy,
).addWatcher(
    paths,
    async (changedFiles) => {
        for (const file of changedFiles) {
            if (await fs.exists(file)) {
                await copyFile(file, {debug: true, firefox: false, mv3: false, thunderbird: false});
                await copyFile(file, {debug: true, firefox: true, mv3: false, thunderbird: false});
                await copyFile(file, {debug: true, firefox: false, mv3: true, thunderbird: false});
                await copyFile(file, {debug: true, firefox: false, mv3: false, thunderbird: true});
            }
        }
        reload({type: reload.FULL});
    },
);
