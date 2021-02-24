const downloadFromUrl = (url) => {
  try {
    const x = new XMLHttpRequest();
    x.open('GET', url);
    x.responseType = 'blob';
    x.onload = function () {
      const url = URL.createObjectURL(x.response);
      
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.style = 'display: none';
      a.href = url;
      a.download = 'test.webm';
      a.click();
      window.URL.revokeObjectURL(url);
    };
    x.send();
  } catch (e) {
    console.log('Failed to download blobURL', e);
  }
}

const onStopClick = () => {
  const button = document.querySelector('#sc-button');

  chrome.runtime.sendMessage({ action: 'stopRecording' }, response => { 
    console.log('Recieved URL: ', response.url);
    downloadFromUrl(response.url)
  });

  button.classList.remove('recording');
  button.innerText = "Start Recording";

  button.removeEventListener('click', onStopClick);
  button.addEventListener('click', onStartClick);
}

const onStartClick = async () => {
  const button = document.querySelector('#sc-button');

  chrome.runtime.sendMessage({ action: 'startRecording', payload: { isTabCapture: true } });

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
