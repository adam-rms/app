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
    $("#login").show();
    if (navigator.app) {
      navigator.app.exitApp();
    }
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
                  console.log(result.asset);
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
  //Check for iPhone X and apply a fix
  if (ons.platform.isIPhoneX() && false) { //Disabled as works without
    document.documentElement.setAttribute('onsflag-iphonex-portrait', '');
    document.documentElement.setAttribute('onsflag-iphonex-landscape', '');
  }
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

  //Register all event handlers
  $( document ).on( "click", ".pagePusherButton", function() {
    console.log($(this).data("pagedata"));
    document.querySelector('#myNavigator').pushPage($(this).data("page") + '.html', $(this).data("pagedata"));
  });
  $( document ).on( "click", ".s3URLButton", function() {
    myApp.functions.s3url($(this).data("pagedata"),myApp.functions.openBrowser);
  });
  $( document ).on( "click", ".externalURLButton", function() {
    if ($(this).data("pagedata") != null) {
      cordova.InAppBrowser.open($(this).data("pagedata"),'_system');
    }
  });

  $( ".toolbarToggleButton" ).on( "click", function() {
    document.querySelector('#mySplitter').left.toggle();
  });
  $( "#loginFormLoginButton" ).on( "click", function() {
    alert("Login button");
    myApp.auth.login();
  });
  $("#loginFormForm").submit(function(e){
    myApp.auth.login();
    return false;
  });
  $( ".forgotPasswordButton" ).on( "click", function() {
    cordova.InAppBrowser.open('https://adam-rms.com','_system');
  });
  $( ".contactSupportButton" ).on( "click", function() {
    cordova.InAppBrowser.open('mailto:hi@jbithell.com','_system')
  });
  $( ".resetAppButton" ).on( "click", function() {
    myApp.functions.reset();
  });
  $( ".logoutAppButton" ).on( "click", function() {
    myApp.auth.logout();
  });
  //Menu
  $( "#menuButtonDashboard" ).on( "click", function() {
    cordova.InAppBrowser.open('https://adam-rms.com','_system');
  });
  $( "#menuButtonChangeBusiness" ).on( "click", function() {
    myApp.auth.changeInstance();
  });
  $( "#menuButtonSetLocation" ).on( "click", function() {
    myApp.auth.setLocation()
  });
  $( "#menu-asset-addNewButton" ).on( "click", function() {
    document.querySelector('#myNavigator').pushPage('newAssetPage.html', {data: {title: 'Page 2'}});
  });
  $( "#menuButtonAbout" ).on( "click", function() {
    document.querySelector('#myNavigator').pushPage('about.html', {data: {title: 'Page 2'}});
  });


  $( "#scanSpeedDialTrash" ).on( "click", function() {
    myApp.controllers.assets.barcodeDeleteFAB();
  });
  $( "#scanSpeedDialCamera" ).on( "click", function() {
    myApp.controllers.assets.barcodeScanFAB();
  });
  $( "#scanSpeedDialMap" ).on( "click", function() {
    myApp.auth.setLocation();
  });




  //Register app token
  myApp.auth.token = localStorage.getItem('token');
  if (myApp.auth.token && myApp.auth.token != '') {
    myApp.functions.launchApp();
  } else {
    $("#app-mainview").hide();
    $("#login").show();
  }
});