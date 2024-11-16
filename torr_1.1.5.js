
fetch("http://localhost:8090/ ", {
    method: "GET",
    }).then(response => response)
    .then(data => {
        console.log("server is up")
    })
    .catch((error) => {
	var request = webOS.service.request('luna://com.webos.applicationManager', {
  			method: 'launch',
  			parameters: { id: 'torrserv.matrix.app' },
  			onSuccess: function (inResponse) {
   		 		console.log('The app is launched');
 		 		 // To-Do something
			  },
 			 onFailure: function (inError) {
 				console.log('Server','Failed to launch the app');
  		 		console.log('Server','[' + inError.errorCode + ']: ' + inError.errorText);
  		  		// To-Do something
			  },
	});
      console.error('Error:', error);
      console.log("server is down!!")   
    });

