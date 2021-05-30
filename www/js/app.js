// App logic.
window.myApp = {};
myApp.config = {
  endpoint: 'https://dash.adam-rms.com/',
  //endpoint: 'http://192.168.1.143/admin/',
  debug: false,
  version: {
    code: 'WEB',
    number: 'WEB'
  }
}
myApp.data = {
  instances: [],
  instance: [],
  instanceID: null,
  projects: {},
  assetTypes: {},
  assetTypesPages: null,
  init: function() {
    myApp.data.instances = [];
    myApp.data.instanceID = localStorage.getItem('instanceID');
    myApp.data.instance= [];
    myApp.data.projects= {};
    myApp.data.assetTypes= {};
    myApp.data.assetTypesPages = null;
  }
}
myApp.auth = {
  token: false,
  location: {
    type:false,
    value:"Not set"
  },
  logout: function() {
    localStorage.setItem('token','');
    $("#app-mainview").hide();
    if (navigator.app) {
      navigator.app.exitApp();
    } else {
      myApp.auth.showLogin();
    }
  },
  showLogin: function () {
    $("#app-mainview").hide();
    $("#login").show();
  },
  login: function () {
    window.open(myApp.config.endpoint + 'login/?app-oauth=true', 'oauth:adamrms', '');
    window.addEventListener('message', function(event) {
      if (event.data.match(/^oauth::/)) {
        var data = JSON.parse(event.data.substring(7));
        if (typeof data.token !== "undefined") {
          localStorage.setItem('token', data.token);
          myApp.auth.token = data.token;
          myApp.functions.launchApp();
        } else {
          ons.notification.toast("Sorry that login didn't work", {timeout: 2000});
        }
      }
    });
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
      title: 'Change Business',
      cancelable: true,
      buttons: listOfInstances
    }).then(function (index) {
      if (index >= 0 && index < myApp.data.instances.length) { //-1 is used to show a cancel and a number greater than the length of the array means it's also cancel
        myApp.data.instanceID = myApp.data.instances[index]['instances_id']
        localStorage.setItem('instanceID',myApp.data.instanceID)

        //reset location
        myApp.auth.location = {
          type:false,
          value:"Not set"
        };
        $("#tabbarPageTitle").html("AdamRMS");

        myApp.controllers.firstBoot();
      }
    });
  },
  setLocation: function() {
    var options = [{
      label: 'Scan',
      icon: 'fa-camera'
    },
      {
        label: 'Enter Manually',
        icon: 'fa-pencil'
      },
      {
        label: 'Cancel',
        icon: 'md-close'
      }
    ];
    ons.openActionSheet({
      title: 'Set Location',
      cancelable: true,
      buttons: options
    }).then(function (index) {
      if (index >= 0 && index < 2) { //-1 is used to show a cancel and a number greater than the length of the array means it's also cancel
        if (index === 0) {
          myApp.functions.barcode.scan(false, function(text,type) {
            if (text !== false) {
              if (type === "Fake") {
                type = "CODE_128";
              }
              myApp.functions.apiCall("assets/barcodes/search.php", {"text":text,"type":type}, function (result) {
                if (result.location) {
                  myApp.auth.location.value = result.location['barcode']["locationsBarcodes_id"];
                  myApp.auth.location.name = result.location['locations_name'];
                  myApp.auth.location.type = "barcode";
                } else if (result.asset) {
                  myApp.auth.location.value = result.asset['assets_id'];
                  myApp.auth.location.name = result.asset['tag'] + " " + result.asset['assetTypes_name'];
                  myApp.auth.location.type = "asset";
                } else {
                  ons.notification.toast("Sorry location not found", { timeout: 2000 });
                }
                $("#tabbarPageTitle").html("AdamRMS - " + myApp.auth.location.name);
              });
            }
          });
        } else if (index === 1) {
          ons.notification.prompt({ message: 'Description for your location',title: 'Set Location' }).then(function(result) {
            myApp.auth.location.value = myApp.functions.escapeHtml(result);
            myApp.auth.location.name = myApp.functions.escapeHtml(result);
            myApp.auth.location.type = "Custom";
            $("#tabbarPageTitle").html("AdamRMS - " + myApp.auth.location.name);
          });
        }
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
  //Check version number of the app
  cordova.getAppVersion.getVersionNumber().then(function (version) {
    myApp.config.version.number = version;
    $('.versionNumber').text(myApp.config.version.number);
  });
  cordova.getAppVersion.getVersionCode().then(function (version) {
    myApp.config.version.code = version;
    $('.versionCode').text(myApp.config.version.code);
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
    myApp.auth.showLogin();
  }
});