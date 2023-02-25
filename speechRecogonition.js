require('dotenv').config();

const fs = require("fs");
const sdk = require("microsoft-cognitiveservices-speech-sdk");
const fileName = process.argv[2];
const speechConfig = sdk.SpeechConfig.fromSubscription(process.env.KEY, "eastus");
speechConfig.speechRecognitionLanguage = "zh-CN";

console.log('file name', fileName);


function fromFile() {
  let audioConfig = sdk.AudioConfig.fromWavFileInput(fs.readFileSync(fileName));
  let speechRecognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

  speechRecognizer.recognizing = (s, e) => {
    console.log(`RECOGNIZING: Text=${e.result.text}`);
  };

  speechRecognizer.recognized = (s, e) => {
    if (e.result.reason == sdk.ResultReason.RecognizedSpeech) {
      console.log(`RECOGNIZED: Text=${e.result.text}`);

      fs.appendFile(`${fileName}.txt`, e.result.text, function (err) {
        if (err) throw err;
        console.log('Saved!');
      });
    }
    else if (e.result.reason == sdk.ResultReason.NoMatch) {
      console.log("NOMATCH: Speech could not be recognized.");
    }
  };

  speechRecognizer.canceled = (s, e) => {
    console.log(`CANCELED: Reason=${e.reason}`);

    if (e.reason == sdk.CancellationReason.Error) {
      console.log(`"CANCELED: ErrorCode=${e.errorCode}`);
      console.log(`"CANCELED: ErrorDetails=${e.errorDetails}`);
      console.log("CANCELED: Did you set the speech resource key and region values?");
    }

    speechRecognizer.stopContinuousRecognitionAsync();
  };

  speechRecognizer.sessionStopped = (s, e) => {
    console.log("\n    Session stopped event.");
    speechRecognizer.stopContinuousRecognitionAsync();
  };

  speechRecognizer.startContinuousRecognitionAsync();
}
fromFile();
