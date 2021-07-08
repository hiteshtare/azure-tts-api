// Import node modules
import request = require('request-promise');

import { getLoggerLevel } from './common.util';
import { GLOBAL_VARIABLES, APP_CONFIG } from '../config';
import axios from 'axios';

// Logger initialise
const _logger = getLoggerLevel();

export async function issueAccessToken(): Promise<void> {
  _logger.warn(`issueAccessToken`);

  const uri = `https://${APP_CONFIG.CUSTOM_SPEECH_Region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`;
  _logger.info(`uri : ${uri}`);

  const headers = {
    'Ocp-Apim-Subscription-Key': `${APP_CONFIG.CUSTOM_SPEECH_Subscription_Key}`
  };

  //GET Request for fetching GeneeConfig
  const postOptions = {
    method: 'POST',
    uri: uri,
    headers: headers
  };

  return await request(postOptions)
    .then(async (resp: any) => {
      _logger.info(`Issue AccessToken fetched successfully.`);
      _logger.debug(resp);
      // GLOBAL_VARIABLES.accesToken = resp;
    }).catch((err) => {
      _logger.error(err);
    });
}

export async function createTextToSpeech(): Promise<void> {
  _logger.warn(`createTextToSpeech`);

  const uri = `https://${APP_CONFIG.CUSTOM_SPEECH_Region}.tts.speech.microsoft.com/cognitiveservices/v1`;
  _logger.info(`uri : ${uri}`);

  const headers = {
    'Content-Length': '225',
    'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
    'Host': `${APP_CONFIG.CUSTOM_SPEECH_Region}.tts.speech.microsoft.com`,
    'Content-Type': 'application/ssml+xml',
    'Ocp-Apim-Subscription-Key': `${APP_CONFIG.CUSTOM_SPEECH_Subscription_Key}`,
    'Authorization': `Bearer ${GLOBAL_VARIABLES.accesToken}`
  }

  const payload = "<speak version='1.0' xml:lang='en-US'><voice xml:lang='en-US' xml:gender='Female'\n    name='en-US-AriaNeural'>\n        Hello Hitesh. Please kill corona\n</voice></speak>"
  // _logger.info(`postOptions`);
  // _logger.debug(postOptions);

  axios({
    method: 'post',
    url: uri,
    headers: headers,
    data: payload
  }).then((response) => {
    // console.log(response.data);
    console.log(response.status);
    console.log(response.statusText);
    console.log(response.headers);
    console.log(response.config);
  });
}
