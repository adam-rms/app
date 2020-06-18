// App logic.
window.myApp = {};
myApp.config = {
  //endpoint: 'http://localhost/api/',
  endpoint: 'https://adam-rms.com/api/',
  version: {
    code: 'WEB',
    number: 'WEB'
  }
}
myApp.data = {
  instances: [],
  instance: [],
  projects: {}
}
myApp.auth = {
  token: false,
  logout: function() {
    localStorage.setItem('token','');
    $("#app-mainview").hide();
    $("#login").show();
    navigator.app.exitApp();
  },
  changeInstance: function() {
    var listOfInstances = [];
    $(myApp.data.instances).each(function (index, element) {
      listOfInstances.push(element['instances_name']);
    });
    listOfInstances.push({
      label: 'Cancel',
      icon: 'md-close'
    });
    ons.openActionSheet({
      title: 'Change Instance',
      cancelable: true,
      buttons: listOfInstances
    }).then(function (index) {
      if (index >= 0 && index < myApp.data.instances.length) { //-1 is used to show a cancel and a number greater than the length of the array means it's also cancel
        myApp.functions.apiCall("instances/change.php", {"instances_id": myApp.data.instances[index]['instances_id']}, function (result) {
          myApp.controllers.firstBoot();
        });
      }
    });
  },
  instanceHasPermission(permissionid) {
    if (myApp.auth.token === false || !myApp.data.instance) {
      return false;
    }
    if (myApp.data.instance['permissionsArray'].includes(permissionid)) {
      return true;
    } else {
      return false;
    }
  }
}



ons.ready(function() {
  //Check for iPhone X and apply a fix
  if (ons.platform.isIPhoneX()) {
    document.documentElement.setAttribute('onsflag-iphonex-portrait', '');
    document.documentElement.setAttribute('onsflag-iphonex-landscape', '');
  }
  //Check version number of the app
  cordova.getAppVersion.getVersionNumber().then(function (version) {
    myApp.config.version.number = version;
  });
  cordova.getAppVersion.getVersionCode().then(function (version) {
    myApp.config.version.code = version;
  });



  ons.enableDeviceBackButtonHandler();
  ons.setDefaultDeviceBackButtonListener(function(event) {
    ons.notification.confirm('Do you want to close the app?') // Ask for confirmation
        .then(function(index) {
          if (index === 1) { // OK button
            navigator.app.exitApp(); // Close the app
          }
        });
  });

  document.querySelector('#myNavigator').addEventListener('postpush', function(e) {
    if (myApp.controllers.pages[e.enterPage.id] !== undefined && typeof myApp.controllers.pages[e.enterPage.id] === "function") {
      myApp.controllers.pages[e.enterPage.id](document.querySelector('#myNavigator').topPage.pushedOptions);
    }
  })

  myApp.auth.token = localStorage.getItem('token');
  if (myApp.auth.token && myApp.auth.token != '') {
    myApp.functions.launchApp();
  } else {
    $("#app-mainview").hide();
    $("#login").show();
  }
});