// Import node modules
import { createReadStream, readFile, readFileSync } from "fs";
import * as dotenv from 'dotenv';
import * as path from 'path';

import * as  sdk from "microsoft-cognitiveservices-speech-sdk";
import { getLogger, Logger } from 'log4js';
import { AudioConfig, SpeechSynthesizer } from "microsoft-cognitiveservices-speech-sdk";

// Import custom modules
import { APP_CONFIG, GLOBAL_VARIABLES } from './config/index';
import { getLoggerLevel, setLoggerLevel } from './utils/common.util';
import { XmlDocument } from "xmldoc";
import { parseString } from "xml2js";

// Import bot configuration/variables from .env file in root folder
const ENV_FILE = path.join(__dirname, '.env');
dotenv.config({ path: ENV_FILE });

// To set logger level global using ENV
setLoggerLevel();
// Logger initialise
const _logger = getLoggerLevel();

APP_CONFIG.CUSTOM_SPEECH_Subscription_Key = process.env.CUSTOM_SPEECH_SUBSCRIPTION_KEY || '';
APP_CONFIG.CUSTOM_SPEECH_Region = process.env.CUSTOM_SPEECH_REGION || '';

_logger.info(`CUSTOM_SPEECH_Subscription_Key: ${APP_CONFIG.CUSTOM_SPEECH_Subscription_Key}`);
_logger.info(`CUSTOM_SPEECH_Region: ${APP_CONFIG.CUSTOM_SPEECH_Region}`);

readFileByLine('src/assets/doc/data_prep.txt');

GLOBAL_VARIABLES.arrLine.forEach((utterance: string, index: number) => {
  _logger.debug(`${index}: ${utterance}`);

  createAudioByLine(utterance);
});

// createAudioByLine();

////////////////////////////////////////////////////////////////////////////////
function createAudioByLine(utterance: string) {
  const speechConfig = sdk.SpeechConfig.fromSubscription(APP_CONFIG.CUSTOM_SPEECH_Subscription_Key, APP_CONFIG.CUSTOM_SPEECH_Region);
  const audioConfig = AudioConfig.fromAudioFileOutput(`src/assets/audio/${utterance}.wav`);

  // read XML file
  readFile(`src/assets/sample/ssml.xml`, "utf-8", (err, data) => {
    if (err) {
      throw err;
    }

    // convert XML data to JSON object
    parseString(data, (err, result) => {
      if (err) {
        throw err;
      }

      result.speak.voice[0]['_'] = `${utterance}`;

      //Replacing voice text with utterance
      _logger.debug(result.speak.voice[0]['_']);

      _logger.info('New XML');
      _logger.debug(JSON.stringify(result, null, 4));


      const synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);
      synthesizer.speakSsmlAsync(
        result,
        result => {
          synthesizer.close();
          if (result) {
            // return result as stream
            return createReadStream(`src/assets/audio/${utterance}.wav`);
          }
        },
        error => {
          console.log(error);
          synthesizer.close();
        });
    });
  });


}

function readFileByLine(path: string) {
  _logger.warn(`readFileByLine`);
  GLOBAL_VARIABLES.arrLine = [];

  var array = readFileSync(path).toString().split("\n");
  for (let i in array) {
    //To check string is valid
    if (array[i].length > 0)
      GLOBAL_VARIABLES.arrLine.push('' + array[i]);
  }
}

function xmlToString(filePath: string) {
  const xml = readFileSync(filePath, "utf8");
  return xml;
}