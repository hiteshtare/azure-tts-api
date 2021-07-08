"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const dotenv = require("dotenv");
const path = require("path");
const sdk = require("microsoft-cognitiveservices-speech-sdk");
const log4js_1 = require("log4js");
const ENV_FILE = path.join(__dirname, '.env');
dotenv.config({ path: ENV_FILE });
const _logger = log4js_1.getLogger();
_logger.level = '' + process.env.LOGGER_LEVEL;
_logger.warn(`setLoggerLevel : ${_logger.level}`);
const CUSTOM_SPEECH_Subscription_Key = process.env.CUSTOM_SPEECH_SUBSCRIPTION_KEY || '';
const CUSTOM_SPEECH_Region = process.env.CUSTOM_SPEECH_REGION || '';
_logger.info(`CUSTOM_SPEECH_Subscription_Key: ${CUSTOM_SPEECH_Subscription_Key}`);
_logger.info(`CUSTOM_SPEECH_Region: ${CUSTOM_SPEECH_Region}`);
const speechConfig = sdk.SpeechConfig.fromSubscription(CUSTOM_SPEECH_Subscription_Key, CUSTOM_SPEECH_Region);
const synthesizer = new sdk.SpeechSynthesizer(speechConfig, undefined);
const ssml = xmlToString("ssml.xml");
synthesizer.speakSsmlAsync(ssml, result => {
    if (result.errorDetails) {
        console.error(result.errorDetails);
    }
    else {
        console.log(JSON.stringify(result));
    }
    synthesizer.close();
}, error => {
    console.log(error);
    synthesizer.close();
});
function xmlToString(filePath) {
    const xml = fs_1.readFileSync(filePath, "utf8");
    return xml;
}
//# sourceMappingURL=app.js.map