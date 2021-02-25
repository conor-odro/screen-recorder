const displayMediaOptions = {
  video: true,
  audio: true,
};

const chunks = [];
let mediaRecorder = null;

chrome.browserAction.onClicked.addListener(function (tab) {
  chrome.tabs.executeScript(tab.ib, {
    file: 'src/initialiseExtension.js'
  });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'testAction') {
    console.log('test success!')
    return sendResponse(`The date you sent was: ${request.payload}`)
  }
  else if (request.action === 'startRecording') {
    startRecording(request, sender, sendResponse)
  }
  else if (request.action === 'stopRecording') {
    stopCapture();

    setTimeout(() => {
      const url = URL.createObjectURL(new Blob(chunks));
      console.log('final video URL', url);
      sendResponse({ url });
      chunks.length = 0;
    }, 5000)
  }

  return true;
});

const startRecording = async (request, sender, sendResponse) => {
  const { isTabCapture } = request.payload;

  if(isTabCapture){
    const stream = await startTabCapture();
    if(stream) recordStream(stream);
  } 
  else {
    const stream = await startCapture();
    if(stream) recordStream(stream);
  }
}

const startCapture = async () => {
  console.log('Start Capture')
  let capturedStream = null;

  try {
    capturedStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
  } catch(err) {
    console.error("Error: " + err);
  }

  return capturedStream
}

const startTabCapture = () => {
  console.log('Start Tab Capture');

  return new Promise((resolve, reject) => {
    chrome.tabCapture.capture(displayMediaOptions, stream => {
      if(stream) return resolve(stream);
      else return reject('Error: no stream provided by tabCapture')
    });
  });
}

const stopCapture = () => {
  console.log('Stop Capturing')

  mediaRecorder.stop();
}

const recordStream = (stream) => {
  const options = { mimeType: 'video/webm;codecs=vp8' };
  mediaRecorder = new MediaRecorder(stream, options);
  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      console.log('saving chunk', event.data)
      chunks.push(event.data);
    }
  };
  mediaRecorder.start(1000);
}
