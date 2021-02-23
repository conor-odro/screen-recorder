const displayMediaOptions = {
  video: true,
  audio: true,
};

const chunks = [];
let mediaRecorder = null;

async function startCapture() {
  console.log('Start Capturing')
  let capturedStream = null;

  try {
    capturedStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
  } catch(err) {
    console.error("Error: " + err);
  }
  return capturedStream
}

function recordStream(stream) {
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

function stopCapture(evt) {
  console.log('Stop Capturing')
  mediaRecorder.stop();
  
  download(chunks);
}

function download(recordedChunks) { 
  var blob = new Blob(recordedChunks, {
    type: 'video/webm'
  });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  document.body.appendChild(a);
  a.style = 'display: none';
  a.href = url;
  a.download = 'test.webm';
  a.click();
  window.URL.revokeObjectURL(url);
}

const onStopClick = () => {
  const button = document.querySelector('#sc-button');

  stopCapture();

  button.classList.remove('recording');
  button.innerText = "Start Recording";

  button.removeEventListener('click', onStopClick);
  button.addEventListener('click', onStartClick);
}

const onStartClick = async () => {
  const button = document.querySelector('#sc-button');

  const stream = await startCapture();
  if(stream) recordStream(stream);

  button.classList.add('recording');
  button.innerText = "Stop Recording";

  button.removeEventListener('click', onStartClick);
  button.addEventListener('click', onStopClick);
}



const initialiseRecorder = () => {
  const button = document.querySelector('#sc-button');

  button.addEventListener('click', onStartClick)
}

export { initialiseRecorder }