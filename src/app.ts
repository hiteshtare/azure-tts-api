import { createReadStream, readFileSync } from "fs";
import * as dotenv from 'dotenv';
import * as path from 'path';

import * as  sdk from "microsoft-cognitiveservices-speech-sdk";
import { getLogger, Logger } from 'log4js';
import { AudioConfig, SpeechSynthesizer } from "microsoft-cognitiveservices-speech-sdk";

// Import custom modules
import { APP_CONFIG } from './config/index';
import { getLoggerLevel, setLoggerLevel } from './utils/common.util';

// Import bot configuration/variables from .env file in root folder
const ENV_FILE = path.join(__dirname, '.env');
dotenv.config({ path: ENV_FILE });

// To set logger level global using ENV
setLoggerLevel();
// Logger initialise
const _logger = getLoggerLevel();

const CUSTOM_SPEECH_Subscription_Key = process.env.CUSTOM_SPEECH_SUBSCRIPTION_KEY || '';
const CUSTOM_SPEECH_Region = process.env.CUSTOM_SPEECH_REGION || '';

_logger.info(`CUSTOM_SPEECH_Subscription_Key: ${CUSTOM_SPEECH_Subscription_Key}`);
_logger.info(`CUSTOM_SPEECH_Region: ${CUSTOM_SPEECH_Region}`);

const speechConfig = sdk.SpeechConfig.fromSubscription(CUSTOM_SPEECH_Subscription_Key, CUSTOM_SPEECH_Region);
const audioConfig = AudioConfig.fromAudioFileOutput("path-to-file.wav");

const synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);
synthesizer.speakTextAsync(
  "A simple test to write to a file.",
  result => {
    synthesizer.close();
    if (result) {
      // return result as stream
      return createReadStream("path-to-file.wav");
    }
  },
  error => {
    console.log(error);
    synthesizer.close();
  });


function xmlToString(filePath: string) {
  const xml = readFileSync(filePath, "utf8");
  return xml;
}