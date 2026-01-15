(function () {
  'use strict'

  Lampa.Platform.tv()

  function log() {
    var args = Array.prototype.slice.call(arguments)
    console.log.apply(console, ["Torr"].concat(args))
  }

  function fetchWithXHR(url, callback, errorCallback) {
    var xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)
  
    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 300) {
        callback(xhr.responseText)
      } else {
        errorCallback(xhr.statusText)
      }
    }
  
    xhr.onerror = function() {
      errorCallback("Ошибка сети")
    }
  
    xhr.send()
  }
  
  log("Start torr.js")

  fetchWithXHR(
    "http://localhost:8090",
    function(responseText) {
      log("Server is up")
    },
    function(error) {
      log("Server is down!")
      log("Error:", error)

      try {
        var request = webOS.service.request("luna://com.webos.applicationManager", {
          method: "launch",
          parameters: { id: "torrserv.matrix.app" },
          onSuccess: function (inResponse) {
            log("Server:", "The app is launched")
          },
          onFailure: function (inError) {
            log("Server:", "Failed to launch the app")
            log("Server:", "[" + inError.errorCode + "]", inError.errorText)
          },
        })
      } catch (error) {
        log("Error:", error.message)
      }
    }
  )
  
})()
