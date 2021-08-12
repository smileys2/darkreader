module.exports = {
    getDestDir: function ({debug, firefox, thunderbird, mv3}) {
        const browser = thunderbird ? 'thunderbird' : firefox ? 'firefox' : mv3 ? 'chrome-mv3' : 'chrome';
        const buildTypeDir = `build/${debug ? 'debug' : 'release'}`;
        return `${buildTypeDir}/${browser}`;
    }
};
