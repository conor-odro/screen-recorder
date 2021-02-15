const videoElem = document.getElementById("video");
const startElem = document.getElementById("start");
const stopElem = document.getElementById("stop");

const displayMediaOptions = {
  video: true,
  audio: true,
};

const chunks = [];
let mediaRecorder = null;

async function startCapture() {
  console.log('Start')
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
  console.log('Stop')
  mediaRecorder.stop();
  let tracks = videoElem.srcObject.getTracks();

  tracks.forEach(track => track.stop());
  videoElem.srcObject = null;
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

// Set event listeners for the start and stop buttons
startElem.addEventListener("click", async function(evt) {
  const stream = await startCapture();
  if(stream) recordStream(stream);
}, false);

stopElem.addEventListener("click", function(evt) {
  stopCapture();
}, false);