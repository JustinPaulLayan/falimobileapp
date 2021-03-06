import { Loading, QSpinnerAudio, QSpinnerBars, Platform } from 'quasar'

export default async ({ Vue }) => {
  const lang = 'tl-PH'
  Vue.prototype.$speechTalkCordova = (text) => {
    return new Promise((resolve, reject) => {
      if (Platform.is.cordova) {
        cordova.plugins.diagnostic.requestMicrophoneAuthorization(function (status) {
          if (status === cordova.plugins.diagnostic.permissionStatus.GRANTED) {
            Loading.show({
              delay: 0,
              spinner: QSpinnerAudio, // ms,
              backgroundColor: 'primary'
            })
            window.TTS.speak({
              text: text,
              locale: lang,
              rate: 0.60
            }, () => {
              Loading.hide()
              setTimeout(() => {
                resolve(true)
              }, 400)
            }, (reason) => {
              reject(reason)
            })
          }
        }, function (error) {
          reject(error)
          console.error(error)
        })
      } else {
        let speech = new SpeechSynthesisUtterance()
        // Set the text and voice attributes.
        speech.lang = lang
        speech.text = text
        speech.volume = 1
        speech.rate = 1
        speech.pitch = 1
        setTimeout(() => {
          window.speechSynthesis.speak(speech)
        }, 300)

        speech.addEventListener('end', () => {
          Loading.hide()
          resolve(true)
        })
      }
    })
  }
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  const recognition = SpeechRecognition ? new SpeechRecognition() : false

  Vue.prototype.$speechToText = {
    start: (lang = 'tl-PH', message = '', continuous = false) => {
      return new Promise((resolve, reject) => {
        let text = ''
        setTimeout(() => {
          Loading.show({
            // delay: 400,
            spinner: QSpinnerBars, // ms,
            backgroundColor: 'primary',
            message,
            messageColor: 'white'
          })
          recognition.lang = lang // this.voiceSelect
          recognition.continuous = continuous
          recognition.start()
        }, 400)

        recognition.onresult = (event) => {
          let current = event.resultIndex
          // Get a transcript of what was said.
          let transcript = event.results[current][0].transcript
          // Add the current transcript to the contents of our Note.
          // var noteContent += transcript
          text += transcript
          console.log('SUCESSO')
          resolve(text)
        }
        recognition.onspeechend = (event) => {
          // if (continuous) {
          // reject(false)
          Loading.hide()
          // console.log('end')
          // }
        }
        recognition.nomatch = () => {
          Loading.hide()
          // reject(false)
        }
        recognition.onend = () => {
          text = ''
          Loading.hide()
          if (!continuous) {
            reject(false)
          }
        }
      })
    },
    stop: () => {
      recognition.stop()
    }
  }
}