myApp.controllers = {
    firstBoot: function() {
        //Called when app opened or when the instance is changed
        myApp.controllers.menu.loadNavigation();
    },
    menu: {
        loadNavigation: function () {
            myApp.functions.apiCall("instances/list.php", {}, function (result) {
                if (result.length < 1) {
                    //User has no instances so can't use the app
                    ons.notification.alert({message: 'You\'re not a member of any Businesses - visit the website to set one up',title:'Business not found'})
                        .then(function() {
                            myApp.auth.logout();
                        });
                } else {
                    myApp.data.instances = [];
                    $(result).each(function (index, element) {
                        //Parse instance permissions
                        element.permissionsArray = [];
                        if (Array.isArray(element['permissions'])) {
                            //Block if not an array
                            var i;
                            var arraylength = element['permissions'].length;
                            for (i = 0; i < arraylength; i++) {
                                if (element['permissions'][i] != null && parseInt(element['permissions'][i]) !== NaN) {
                                    element.permissionsArray.push(parseInt(element['permissions'][i]));
                                }
                            }
                        }
                        myApp.data.instances.push(element);
                        if (element['this']) {
                            //This instance
                            myApp.data.instance = element;
                            $("#menu-title").html(element['instances_name']);
                            if (myApp.auth.instanceHasPermission(20)) {
                                myApp.functions.apiCall("projects/list.php", {}, function (projectResult) {
                                    $("#menu-projects-list").html("");
                                    $(projectResult).each(function (index, element) {
                                        myApp.data.projects[element['projects_id']] = element;
                                        $("#menu-projects-list").append('<ons-list-item tappable modifier="longdivider"  onclick="document.querySelector(\'#myNavigator\').pushPage(\'project.html\', {data: {id: ' + element['projects_id'] + '}});">' +
                                            '<div class="left">' +
                                            (element.thisProjectManager ? '<ons-icon icon="fa-dot-circle" style="color: #ffc107;"></ons-icon>' : '<ons-icon icon="fa-circle" style="color: grey;"></ons-icon>')+
                                            '</div>' +
                                            '<div class="center"><span class="list-item__title">' + element['projects_name'] + '</span><span class="list-item__subtitle">' + element['clients_name'] + '</span></div>' +
                                            '</ons-list-item>');
                                    });
                                });
                            }
                            if (myApp.auth.instanceHasPermission(17)) {
                                $("#menu-asset-addNewButton").show();
                            }
                        }
                    });
                }
            })
        }
    },
    assets: {
        barcodeScanFAB: function() {
            myApp.functions.barcode.scan(false, function(text,type) {
               console.log(text,type);
            });
        }
    },
    pages: {
        projectPage: function (data) {
            $("#projectPage-title").html(myApp.data.projects[data.data.id]['projects_name']);
            console.log(data);
        },
        newAssetPage: function (data) {
            console.log(data);
        },
        about: function (data) {
            console.log(data);
            $('#aboutPageVersion').text(myApp.config.version.number);
            $('#aboutPageCode').text(myApp.config.version.code);
            $('#aboutPagePlatform').text(device.platform + " (" + device.model + ")");
        },
    }
}

    /*
myApp.controllers = {

  //////////////////////////
  // Tabbar Page Controller //
  //////////////////////////
  tabbarPage: function(page) {
    // Set button functionality to open/close the menu.
    page.querySelector('[component="button/menu"]').onclick = function() {
      document.querySelector('#mySplitter').left.toggle();
    };

    // Set button functionality to push 'new_task.html' page.
    Array.prototype.forEach.call(page.querySelectorAll('[component="button/new-task"]'), function(element) {
      element.onclick = function() {
        //document.querySelector('#myNavigator').pushPage('html/new_task.html');
        myApp.functions.barcode.scan(true, function(result) {
          if (result) {
            console.log(result);
          }
        });
      };

      element.show && element.show(); // Fix ons-fab in Safari.
    });

    // Change tabbar animation depending on platform.
    page.querySelector('#myTabbar').setAttribute('animation', ons.platform.isAndroid() ? 'slide' : 'none');
  },

  ////////////////////////
  // Menu Page Controller //
  ////////////////////////
  menuPage: function(page) {
    // Set functionality for 'No Category' and 'All' default categories respectively.
    myApp.services.categories.bindOnCheckboxChange(page.querySelector('#default-category-list ons-list-item[category-id=""]'));
    myApp.services.categories.bindOnCheckboxChange(page.querySelector('#default-category-list ons-list-item:not([category-id])'));

    // Change splitter animation depending on platform.
    document.querySelector('#mySplitter').left.setAttribute('animation', ons.platform.isAndroid() ? 'overlay' : 'reveal');
  },

  ////////////////////////////
  // New Task Page Controller //
  ////////////////////////////
  newTaskPage: function(page) {
    // Set button functionality to save a new task.
    Array.prototype.forEach.call(page.querySelectorAll('[component="button/save-task"]'), function(element) {
      element.onclick = function() {
        var newTitle = page.querySelector('#title-input').value;

        if (newTitle) {
          // If input title is not empty, create a new task.
          myApp.services.tasks.create(
            {
              title: newTitle,
              category: page.querySelector('#category-input').value,
              description: page.querySelector('#description-input').value,
              highlight: page.querySelector('#highlight-input').checked,
              urgent: page.querySelector('#urgent-input').checked
            }
          );

          // Set selected category to 'All', refresh and pop page.
          document.querySelector('#default-category-list ons-list-item ons-radio').checked = true;
          document.querySelector('#default-category-list ons-list-item').updateCategoryView();
          document.querySelector('#myNavigator').popPage();

        } else {
          // Show alert if the input title is empty.
          ons.notification.alert('You must provide a task title.');
        }
      };
    });
  },

  ////////////////////////////////
  // Details Task Page Controller //
  ///////////////////////////////
  detailsTaskPage: function(page) {
    // Get the element passed as argument to pushPage.
    var element = page.data.element;

    // Fill the view with the stored data.
    page.querySelector('#title-input').value = element.data.title;
    page.querySelector('#category-input').value = element.data.category;
    page.querySelector('#description-input').value = element.data.description;
    page.querySelector('#highlight-input').checked = element.data.highlight;
    page.querySelector('#urgent-input').checked = element.data.urgent;

    // Set button functionality to save an existing task.
    page.querySelector('[component="button/save-task"]').onclick = function() {
      var newTitle = page.querySelector('#title-input').value;

      if (newTitle) {
        // If input title is not empty, ask for confirmation before saving.
        ons.notification.confirm(
          {
            title: 'Save changes?',
            message: 'Previous data will be overwritten.',
            buttonLabels: ['Discard', 'Save']
          }
        ).then(function(buttonIndex) {
          if (buttonIndex === 1) {
            // If 'Save' button was pressed, overwrite the task.
            myApp.services.tasks.update(element,
              {
                title: newTitle,
                category: page.querySelector('#category-input').value,
                description: page.querySelector('#description-input').value,
                ugent: element.data.urgent,
                highlight: page.querySelector('#highlight-input').checked
              }
            );

            // Set selected category to 'All', refresh and pop page.
            document.querySelector('#default-category-list ons-list-item ons-radio').checked = true;
            document.querySelector('#default-category-list ons-list-item').updateCategoryView();
            document.querySelector('#myNavigator').popPage();
          }
        });

      } else {
        // Show alert if the input title is empty.
        ons.notification.alert('You must provide a task title.');
      }
    };
  }
};
*/