export function getLocalMessage(messageName: string) {
    return chrome.i18n.getMessage(messageName);
}

export function getUILanguage() {
    let code: string;
    if (chrome.i18n) {
        code = chrome.i18n.getUILanguage();
    } else {
        // Background serivice workers do not have access to "foreground" APIs like chrome.i18n
        code = navigator.language.split('-')[0];
    }
    if (code.endsWith('-mac')) {
        return code.substring(0, code.length - 4);
    }
    return code;
}
