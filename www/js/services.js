/***********************************************************************************
 * App Services. This contains the logic of the application organised in modules/objects. *
 ***********************************************************************************/
myApp.functions = {
  escapeHtml: function(text) {
    var map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };

    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
  },
  barcode: {
    scan: function(continuous,callback) {
      console.log("Triggtering cordova barcode scan");
      try {
        cordova.plugins.barcodeScanner.scan(
            function (result) {
              console.log(result);
              if (!result.cancelled) {
                callback(result.text,result.format);
                if (continuous) {
                  myApp.functions.barcode.scan(true,callback);
                }
              } else {
                callback(false,false);
              }
            },
            function (error) {
              console.log(error);
              ons.notification.toast("Scanning failed: " + error, { timeout: 2000 });
            },
            {
              preferFrontCamera : false, // iOS and Android
              showFlipCameraButton : false, // iOS and Android
              showTorchButton : true, // iOS and Android
              torchOn: false, // Android, launch with the torch switched on (if available)
              saveHistory: false, // Android, save scan history (default false)
              prompt : "Place an asset's barcode inside the scan area", // Android
              resultDisplayDuration: 0, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
              formats : "EAN_8,EAN_13,CODE_39,CODE_93,CODE_128", // chosen based on the overlap with the PHP lib
              disableAnimations : true, // iOS
              disableSuccessBeep: true // iOS and Android
            }
        );
      }
      catch(err) {
        console.log(JSON.stringify(err));
      }
      console.log("Attempted to trigger barcode scan");
    }
  },
  s3url: function(fileid,size,callback) {
    myApp.functions.apiCall("file/",{"f":fileid,"d":"force","s":size}, function(response) {
      callback(response.url);
    });
  },
  openBrowser: function(url) {
    cordova.InAppBrowser.open(url, '_system');
    return false;
  },
  apiCall: function (endpoint, data, callback, useCustomLoader) {
    if (typeof data !== 'object' || data === null) {
      data = {}
    }
    data['jwt'] = myApp.auth.token;
    if (myApp.data.instanceID !== null) {
        data['instances_id'] = myApp.data.instanceID;
    }
    var connected = true;
    try {
      //For some unknown reason Android gets upset about this
      if (navigator.connection.type === Connection.NONE) {
        connected = false;
      }
    } catch(err) {
      console.log(err.message);
    }
    if (connected !== true) {
      ons.notification.toast("No Network Connection", { timeout: 2000 });
    } else {
      if (useCustomLoader !== true) {
        $(".loadingDialog").show();
        document.querySelector('#mySplitter').left.close();
      }
      $.ajax({
        type: "POST",
        url: myApp.config.endpoint + endpoint,
        dataType: 'json',
        data: data,
        success: function (response) {
          if (useCustomLoader !== true) {
            $('.loadingDialog').hide();
          }
          console.log("Got ajax data - going to call callback");
          if (response.result) {
            console.log("Calling callback");
            callback(response.response);
          } else {
            if (response.error.code && response.error.code == "AUTH") {
              //They need to login again - token probably expired
              myApp.auth.logout();
            } else {
              ons.notification.toast(response.error.message, {timeout: 3000});
            }
          }
          console.log(JSON.stringify(response));
        },
        error: function (request, status, error) {
          $('.loadingDialog').hide();
          console.log(JSON.stringify(error));
          ons.notification.alert({title: request.statusText + " - " + status, message: (request.responseText ? request.responseText : 'Error connecting to AdamRMS') }, function () {
            myApp.controllers.firstBoot();
            if (navigator.app) {
              myApp.controllers.firstBoot();
            }
          });
        }
      });
    }
  },
  launchApp: function () {
    myApp.controllers.firstBoot();
    $("#login").hide();
    $("#app-mainview").show();
  },
  fileExtensionToIcon: function(extension) {
    switch (extension.toLowerCase()) {
      case "gif":
        return 'fa-file-image';
        break;

      case "jpeg":
        return 'fa-file-image';
        break;

      case "jpg":
        return 'fa-file-image';
        break;

      case "png":
        return 'fa-file-image';
        break;

      case "pdf":
        return 'fa-file-pdf';
        break;

      case "doc":
        return 'fa-file-word';
        break;

      case "docx":
        return 'fa-file-word';
        break;

      case "ppt":
        return 'fa-file-powerpoint';
        break;

      case "pptx":
        return 'fa-file-powerpoint';
        break;

      case "xls":
        return 'fa-file-excel';
        break;

      case "xlsx":
        return 'fa-file-excel';
        break;

      case "csv":
        return 'fa-file-csv';
        break;

      case "aac":
        return 'fa-file-audio';
        break;

      case "mp3":
        return 'fa-file-audio';
        break;

      case "ogg":
        return 'fa-file-audio';
        break;

      case "avi":
        return 'fa-file-video';
        break;

      case "flv":
        return 'fa-file-video';
        break;

      case "mkv":
        return 'fa-file-video';
        break;

      case "mp4":
        return 'fa-file-video';
        break;

      case "gz":
        return 'fa-file-archive';
        break;

      case "zip":
        return 'fa-file-archive';
        break;

      case "css":
        return 'fa-file-code';
        break;

      case "html":
        return 'fa-file-code';
        break;

      case "js":
        return 'fa-file-code';
        break;

      case "txt":
        return 'fa-file-alt';
        break;
      default:
        return 'fa-file';
        break;
    }
  },
  formatSize: function(size) {
      if (size >= 1073741824) {
        size = (size / 1073741824).toFixed(1) + ' GB';
      } else if (size >= 100000) {
        size = (size / 1048576).toFixed(1) + ' MB';
      } else if (size >= 1024) {
        size = (size / 1024).toFixed(0) + ' KB';
      } else if (size > 1) {
        size = size + ' bytes';
      } else if (size == 1) {
        size = size + ' byte';
      } else {
        size = '0 bytes';
      }
      return size;
  },
  nl2br: function(text) {
    if (text == null) {
      return text;
    } else {
      return text.replace(/(?:\r\n|\r|\n)/g, '<br>');
    }
  },
  reset: function() {
    localStorage.clear();
    location.reload();
  }
}



/*
myApp.services = {

  /////////////////
  // Task Service //
  /////////////////
  tasks: {

    // Creates a new task and attaches it to the pending task list.
    create: function(data) {
      // Task item template.
      var taskItem = ons.createElement(
        '<ons-list-item tappable project="' + myApp.services.categories.parseId(data.project)+ '">' +
          '<label class="left">' +
           '<ons-checkbox></ons-checkbox>' +
          '</label>' +
          '<div class="center">' +
            data.title +
          '</div>' +
          '<div class="right">' +
            '<ons-icon style="color: grey; padding-left: 4px" icon="ion-ios-trash-outline, material:md-delete"></ons-icon>' +
          '</div>' +
        '</ons-list-item>'
      );

      // Store data within the element.
      taskItem.data = data;

      // Add 'completion' functionality when the checkbox changes.
      taskItem.data.onCheckboxChange = function(event) {
        myApp.services.animators.swipe(taskItem, function() {
          var listId = (taskItem.parentElement.id === 'pending-list' && event.target.checked) ? '#completed-list' : '#pending-list';
          document.querySelector(listId).appendChild(taskItem);
        });
      };

      taskItem.addEventListener('change', taskItem.data.onCheckboxChange);

      // Add button functionality to remove a task.
      taskItem.querySelector('.right').onclick = function() {
        myApp.services.tasks.remove(taskItem);
      };

      // Add functionality to push 'details_task.html' page with the current element as a parameter.
      taskItem.querySelector('.center').onclick = function() {
        document.querySelector('#myNavigator')
          .pushPage('html/details_task.html',
            {
              animation: 'lift',
              data: {
                element: taskItem
              }
            }
          );
      };

      // Check if it's necessary to create new categories for this item.
      myApp.services.categories.updateAdd(taskItem.data.project);

      // Add the highlight if necessary.
      if (taskItem.data.highlight) {
        taskItem.classList.add('highlight');
      }

      // Insert urgent tasks at the top and non urgent tasks at the bottom.
      var pendingList = document.querySelector('#pending-list');
      pendingList.insertBefore(taskItem, taskItem.data.urgent ? pendingList.firstChild : null);
    },

    // Modifies the inner data and current view of an existing task.
    update: function(taskItem, data) {
      if (data.title !== taskItem.data.title) {
        // Update title view.
        taskItem.querySelector('.center').innerHTML = data.title;
      }

      if (data.project !== taskItem.data.project) {
        // Modify the item before updating categories.
        taskItem.setAttribute('project', myApp.services.categories.parseId(data.project));
        // Check if it's necessary to create new categories.
        myApp.services.categories.updateAdd(data.project);
        // Check if it's necessary to remove empty categories.
        myApp.services.categories.updateRemove(taskItem.data.project);

      }

      // Add or remove the highlight.
      taskItem.classList[data.highlight ? 'add' : 'remove']('highlight');

      // Store the new data within the element.
      taskItem.data = data;
    },

    // Deletes a task item and its listeners.
    remove: function(taskItem) {
      taskItem.removeEventListener('change', taskItem.data.onCheckboxChange);

      myApp.services.animators.remove(taskItem, function() {
        // Remove the item before updating the categories.
        taskItem.remove();
        // Check if the project has no items and remove it in that case.
        myApp.services.categories.updateRemove(taskItem.data.project);
      });
    }
  },

  /////////////////////
  // project Service //
  ////////////////////
  projects: {
    // Creates a new project and attaches it to the custom project list.
    create: function(projectData) {
       var projectItem = ons.createElement(
        '<ons-list-item tappable project-id="' + projectData['projects_id'] + '">' +
          '<div class="left">' +
            '<ons-radio name="projectGroup" input-id="radio-'  + projectData['projects_id'] + '"></ons-radio>' +
          '</div>' +
          '<label class="center" for="radio-' + projectData['projects_id'] + '">' +
              projectData['projects_name'] +
          '</label>' +
        '</ons-list-item>'
      );

      // Adds filtering functionality to this project item.
      myApp.services.projects.bindOnCheckboxChange(projectItem);

      // Attach the new project to the corresponding list.
      document.querySelector('#custom-project-menu-list').appendChild(projectItem);
    },

    // Deletes a project item and its listeners.
    remove: function(projectItem) {
      if (projectItem) {
        // Remove listeners and the item itself.
        projectItem.removeEventListener('change', projectItem.updateprojectView);
        projectItem.remove();
      }
    },

    // Adds filtering functionality to a project item.
    bindOnCheckboxChange: function(projectItem) {
      var projectId = projectItem.getAttribute('project-id');
      var allItems = projectId === null;

      projectItem.updateprojectView = function() {
        var query = '[project="' + (projectId || '') + '"]';

        var taskItems = document.querySelectorAll('#tabbarPage ons-list-item');
        for (var i = 0; i < taskItems.length; i++) {
          taskItems[i].style.display = (allItems || taskItems[i].getAttribute('project') === projectId) ? '' : 'none';
        }
      };

      projectItem.addEventListener('change', projectItem.updateprojectView);
    }
  }
};
*/