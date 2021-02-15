/* eslint-disable promise/no-promise-in-callback */
/* eslint-disable promise/prefer-await-to-then */
/* eslint-disable promise/prefer-await-to-callbacks */
const video = document.querySelector('video');

console.log('media-viewer.js', new Date().toISOString());

let getUserMediaStreamCalled = 0;
const blockedDevices = new RegExp('vmware', 'i');
const defaultConstraints = {
  audio: true,
  video: {
    width: { min: 320, ideal: 1024, max: 2048 },
    height: { min: 240, ideal: 768, max: 1536 },
    facingMode: 'user',
  },
};

async function getUserMediaStream(constraints) {
  try {
    getUserMediaStreamCalled++;
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    const tracks = stream.getTracks();
    if (tracks.some(track => blockedDevices.test(track.label))) {
      const err = new Error('Capture has been initiated with a blocked device');
      console.log(err);
      throw err;
    }
    return stream;
  } catch (err) {
    console.log('The following getUserMedia error occured:.. ', err);
    console.log({ code: err.code, name: err.name, message: err });
    throw err;
  }
}

async function initiateMediaViewer(data) {
  /**
   * videoDeviceIds differ between a standard context and an incognito context,
   * we have no way to determine what the new videoDeviceId would be in an
   * incognito session so we remove the exact match requirement from the
   * getMediaContext permissions request.
   **/

  try {
    const stream = await getUserMediaStream(defaultConstraints);
    handleSuccess(stream);
  } catch (err) {
    handleError(err);
  }
}

function handleError(error) {
  // We essentially only reset resolution to default when a selection is made through the dropdown
  // Hence why we use 'getUserMediaStreamCalled > 1', telling us that the default constraints (or pre-saved)
  // were unable to retrieve a valid stream suggesting an issue with the camera
  if (['width', 'height'].indexOf(error.constraint) > -1 && getUserMediaStreamCalled > 1) {
    // update local storage
    // chrome.storage.sync.set({ videoResolution: 'default' }, function () {
    //   console.log('getUserMedia error: setting video resolution to default');
    // });
    // let everyone know something went wrong
    window.parent.postMessage('mediaStreamResolutionError', '*');
    // window.parent.postMessage('mediaStreamError', '*');
  } else if (error.message === 'Could not start video source') {
    window.parent.postMessage('mediaStreamDOMException', '*');
    console.log('Removed saved devices due to error >>>', error);
  } else {
    // let everyone know something went wrong
    console.log('mediaStream error >>>', error);
    window.parent.postMessage('mediaStreamError', '*');
  }
}

function handleSuccess(stream) {
  window.stream = stream; // only to make stream available to console
  video.muted = true;
  video.srcObject = stream;
  // Gives us performance statistics
  // getDimensions();
}

window.onload = (event) => {
  initiateMediaViewer();
};
