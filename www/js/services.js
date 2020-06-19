/***********************************************************************************
 * App Services. This contains the logic of the application organised in modules/objects. *
 ***********************************************************************************/
myApp.functions = {
  barcode: {
    scan: function(continuous,callback) {
      console.log("Triggtering cordova barcode scan");
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
            alert("Scanning failed: " + error);
          },
          {
            /*preferFrontCamera : false, // iOS and Android
            showFlipCameraButton : false, // iOS and Android
            showTorchButton : true, // iOS and Android
            torchOn: false, // Android, launch with the torch switched on (if available)
            saveHistory: false, // Android, save scan history (default false)
            prompt : "Place an asset's barcode inside the scan area", // Android
            resultDisplayDuration: 0, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
            formats : "CODE_128", // default: all but PDF_417 and RSS_EXPANDED
            orientation : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
            disableAnimations : true, // iOS
            disableSuccessBeep: true // iOS and Android*/
          }
      );
      console.log("Attempted to trigger barcode scan");
    }
  },
  apiCall: function (endpoint, data, callback) {
    if (typeof data !== 'object' || data === null) {
      data = {}
    }
    data['token'] = myApp.auth.token;
    if (navigator.connection.type === Connection.NONE) {
      ons.notification.toast("No Network Connection", { timeout: 2000 });
    } else {
      $(".loadingDialog").show();
      document.querySelector('#mySplitter').left.close();
      $.ajax({
        type: "POST",
        url: myApp.config.endpoint + endpoint,
        dataType: 'json',
        data: data,
        success: function (response) {
          $('.loadingDialog').hide();
          console.log("Got ajax data - going to call callback");
          if (response.result) {
            console.log("Calling callback");
            callback(response.response);
          } else {
            ons.notification.toast(response.error.message, {timeout: 3000});
          }
          console.log(JSON.stringify(response));
        },
        error: function (request, status, error) {
          $('.loadingDialog').hide();
          console.log(JSON.stringify(request));
          console.log(JSON.stringify(error));
          console.log(JSON.stringify(status));
          ons.notification.alert(request.statusText);
        }
      });
    }
  },
  launchApp: function () {
    myApp.controllers.firstBoot();
    $("#login").hide();
    $("#app-mainview").show();
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