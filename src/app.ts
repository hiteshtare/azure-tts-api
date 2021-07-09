// Import node modules
import { createReadStream, readFileSync } from "fs";
import * as dotenv from 'dotenv';
import * as path from 'path';

import * as  sdk from "microsoft-cognitiveservices-speech-sdk";
import { AudioConfig, SpeechSynthesizer } from "microsoft-cognitiveservices-speech-sdk";

// Import custom modules
import { APP_CONFIG, GLOBAL_VARIABLES } from './config/index';
import { getLoggerLevel, setLoggerLevel } from './utils/common.util';
import { Builder, parseString } from "xml2js";

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

//Reset Global Variables
GLOBAL_VARIABLES.arrSSML = [];
GLOBAL_VARIABLES.arrLine = [];

readFileByLine('src/assets/doc/data_prep.txt');


GLOBAL_VARIABLES.arrLine.forEach((utterance: string, index: number) => {
  _logger.debug(`${index}: ${utterance}`);

  updateSSMLWithUtterance(utterance);

  // createAudioByLine(utterance);
});

GLOBAL_VARIABLES.arrSSML.forEach(async (ssml: string, index: number) => {
  // _logger.info('New SSML');
  // _logger.debug(JSON.stringify(ssml, null, 4));

  await createAudioByLine(GLOBAL_VARIABLES.arrLine[index], ssml);
});

// createAudioByLine('test', '');

function updateSSMLWithUtterance(utterance: string) {
  _logger.warn(`updateSSMLWithUtterance`);

  //read XML file
  // const data = readFileSync(`src/assets/sample/ssml_en-US-AriaNeural.xml`, "utf-8");

  //Indian Accents
  // const data = readFileSync(`src/assets/sample/ssml_en-IN-NeerjaNeural.xml`, "utf-8");
  const data = readFileSync(`src/assets/sample/ssml_en-IN-Ravi.xml`, "utf-8");

  // convert XML data to JSON object
  parseString(data, (err, result) => {
    if (err) {
      throw err;
    }
    // _logger.info('SSML')
    // _logger.debug(result.speak.voice[0]['$']['name']);

    result.speak.voice[0]['_'] = `${utterance}`;

    //Replacing voice text with utterance
    _logger.debug(result.speak.voice[0]['_']);

    const builder = new Builder();
    let newData = builder.buildObject(result);
    GLOBAL_VARIABLES.arrSSML.push(newData);
  });// end of parseString
}

async function createAudioByLine(utterance: string, ssml: string) {
  _logger.info('Utterance');
  _logger.debug(utterance);
  // _logger.info('New SSML');
  // _logger.debug(ssml);

  const fileName = utterance.replace(/ /g, "_");
  const path = `src/assets/audio/${fileName}.wav`;
  const speechConfig = sdk.SpeechConfig.fromSubscription(APP_CONFIG.CUSTOM_SPEECH_Subscription_Key, APP_CONFIG.CUSTOM_SPEECH_Region);
  const audioConfig = AudioConfig.fromAudioFileOutput(path);

  // ssml = xmlToString("ssml.xml");
  // _logger.info(`ssml`);
  // _logger.debug(ssml);

  const synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);
  return await synthesizer.speakSsmlAsync(
    ssml,
    async (result) => {
      synthesizer.close();
      if (result) {
        // return result as stream
        _logger.info(`Audio creation successfull @ ${path}`);
        return await createReadStream(path);
      }
    },
    error => {
      _logger.error(error);
      synthesizer.close();
    });
}

function readFileByLine(path: string) {
  _logger.warn(`readFileByLine`);

  var array = readFileSync(path).toString().split("\n");
  for (let i in array) {
    //To check string is valid
    if (array[i].length > 0)
      GLOBAL_VARIABLES.arrLine.push('' + array[i]);
  }
}

function xmlToString(filePath: string) {
  _logger.warn(`xmlToString`);

  const xml = readFileSync(filePath, "utf8");
  return xml;
}