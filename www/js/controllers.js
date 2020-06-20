myApp.controllers = {
    firstBoot: function() {
        //Called when app opened or when the instance is changed
        console.log("Running first boot");
        myApp.controllers.menu.loadNavigation();
    },
    menu: {
        loadNavigation: function () {
            console.log("Loading navigation");
            myApp.functions.apiCall("instances/list.php", {}, function (result) {
                if (result.length < 1) {
                    //User has no instances so can't use the app
                    ons.notification.alert({message: 'You\'re not a member of any Businesses - visit the website to set one up',title:'Business not found'})
                        .then(function() {
                            myApp.auth.logout();
                        });
                } else {
                    myApp.controllers.assets.fullAssetList(function () {
                        console.log("First asset list logged");
                    });

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
            console.log("Starting barcode scan");
            myApp.functions.barcode.scan(false, function(text,type) {
               console.log(text,type);
            });
        },
        fullAssetList: function(done, searchTerm) {
            $("#allAssetsListLoader").show();
            var requestData = {"page": Math.floor(Object.keys(myApp.data.assetTypes).length / 20)+1};
            if (searchTerm !== undefined) {
                requestData['term'] = searchTerm;
                requestData['all'] = "true";
            }
            myApp.functions.apiCall("assets/list.php", requestData, function (assetResult) {
                $(assetResult['assets']).each(function (index, element) {
                    myApp.data.assetTypes[element['assetTypes_id']] = element;
                    $("#allAssetsList").append('<ons-list-item tappable modifier="longdivider"  onclick="document.querySelector(\'#myNavigator\').pushPage(\'assetType.html\', {data: {id: ' + element['assetTypes_id'] + '}});">' +
                        '<div class="left">' +
                        (element.thumbnailSuggested ? '<img class="list-item__thumbnail" src="' + element['thumbnailSuggested'] + '">' : '&nbsp;')+
                        '</div>' +
                        '<div class="center"><span class="list-item__title">' + element['assetTypes_name'] + '</span><span class="list-item__subtitle">' + element['assetCategories_name'] + ' - ' + element['manufacturers_name'] + '</span></div>' +
                        '<div class="right">' +
                        '<div class="list-item__label">' + (element['tags'].length > 1 ? 'x' + element['tags'].length : element['tags'][0]['assets_tag_format'].replace("-","&#8209;"))+'</div>'+
                        '</div>' +
                        '</ons-list-item>');
                });
                $("#allAssetsListLoader").hide();
                done();
            }, true);
        },
        fullAssetListSearch: function(value) {
            $("#allAssetsList").html("");
            myApp.data.assetTypes = {};
            myApp.controllers.assets.fullAssetList(function () {
                console.log("Serach complete")
            },value);
        },
        fullAssetListPullRefresh: null,
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
            $('#aboutPageVersion').text(myApp.config.version.number);
            $('#aboutPageCode').text(myApp.config.version.code);
            $('#aboutPagePlatform').text(device.platform + " (" + device.model + ")");
        },
        assetTypePage: function (data) {
            var thisAsset = myApp.data.assetTypes[data.data.id];
            console.log(thisAsset);
            $("#assetTypePageTitle").html(thisAsset['assetTypes_name']);
            $("#assetTypePageManufacturer").html(thisAsset['manufacturers_name']);
            $("#assetTypePageCategory").html(thisAsset['assetCategories_name']);
            $("#assetTypePageDescription").html(thisAsset['assetTypes_description']);
            $("#assetTypePageProductLink").html(thisAsset['assetTypes_productLink']);
            if (thisAsset['assetTypes_productLink'] !== null) {
                $("#assetTypePageProductLink").attr("onclick", "window.open('" + thisAsset['assetTypes_productLink'] + "','_blank')");
            }
            $(thisAsset['tags']).each(function (index, element) {
                $("#assetTypePageAssetsList").append('<ons-list-item tappable modifier="longdivider"  onclick="document.querySelector(\'#myNavigator\').pushPage(\'asset.html\', {data: {id: ' + data.data.id + ',asset: ' + index + '}});">' +
                    '<div class="left">' +
                    (element['flagsblocks']["COUNT"]["BLOCK"] > 0 ? '<ons-icon icon="fa-ban" style="color: #dc3545;"></ons-icon>&nbsp;' : '&nbsp;') +
                    (element['flagsblocks']["COUNT"]["FLAG"] > 0 ? '<ons-icon icon="fa-flag" style="color: #ffc107;"></ons-icon>' : '') +
                    '</div>' +
                    '<div class="center">' + element['assets_tag_format'] + '</div>' +
                    '</ons-list-item>');
            });
        },
        assetPage: function (data) {
            var thisAssetType = myApp.data.assetTypes[data.data.id];
            var thisAsset = thisAssetType['tags'][data.data.asset];
            console.log(thisAsset);
            $("#assetPageTitle").html(thisAsset['assets_tag_format']);
            $("#assetPageNotes").html(thisAsset['assets_notes']);
            $("#assetPageMass").html((thisAsset['assets_mass'] !== null ? thisAsset['assets_mass_format'] : thisAssetType['assetTypes_mass_format']));
            $("#assetPageValue").html((thisAsset['assets_value'] !== null ? thisAsset['assets_value_format'] : thisAssetType['assetTypes_value_format']));
            $("#assetPageWeekRate").html((thisAsset['assets_weekRate'] !== null ? thisAsset['assets_weekRate_format'] : thisAssetType['assetTypes_weekRate_format']));
            $("#assetPageDayRate").html((thisAsset['assets_dayRate'] !== null ? thisAsset['assets_dayRate_format'] : thisAssetType['assetTypes_dayRate_format']));
            $("#assetPageDefinableFields").html("");
            for (i = 1; i <= 10; i++) {
                if (thisAssetType['fields'][i-1] !== "") {
                    $("#assetPageDefinableFields").append('<ons-list-header>' + thisAssetType['fields'][i-1] + '</ons-list-header>' +
                        '        <ons-list-item modifier="nodivider">' +
                       '          <div class="center">' +
                        thisAsset["asset_definableFields_" + i] +
                       // '            <ons-input type="text" value="' + thisAsset["asset_definableFields_" + i] + '" float></ons-input>' +
                        '          </div>' +
                        '        </ons-list-item>');
                }
            }
            $("#assetPageFlagsBlocks").html("");
            $(thisAsset['flagsblocks']['BLOCK']).each(function (index, element) {
                $("#assetPageFlagsBlocks").append('<ons-card>' +
                    '        <div class="title"><ons-icon icon="fa-ban" style="color: #dc3545;"></ons-icon>&nbsp;' +
                                element['maintenanceJobs_title'] +
                    '        </div>' +
                    '        <div class="content">' +
                                element['maintenanceJobs_faultDescription'] +
                    '        </div>' +
                    '      </ons-card>');
            });
            $(thisAsset['flagsblocks']['FLAG']).each(function (index, element) {
                $("#assetPageFlagsBlocks").append('<ons-card>' +
                    '        <div class="title"><ons-icon icon="fa-flag" style="color: #ffc107;"></ons-icon>&nbsp;' +
                    element['maintenanceJobs_title'] +
                    '        </div>' +
                    '        <div class="content">' +
                    element['maintenanceJobs_faultDescription'] +
                    '        </div>' +
                    '      </ons-card>');
            });
            //TODO associate with barcode
        },
    }
}
ons.ready(function() {
    myApp.controllers.assets.fullAssetListPullRefresh = document.getElementById('allAssetsListLoaderPullHook');
    myApp.controllers.assets.fullAssetListPullRefresh.addEventListener('changestate', function(event) {
        var message = '';
        switch (event.state) {
            case 'initial':
                message = 'Pull to refresh';
                break;
            case 'preaction':
                message = 'Release';
                break;
            case 'action':
                message = 'Loading...';
                break;
        }
        myApp.controllers.assets.fullAssetListPullRefresh.innerHTML = message;
    });
    myApp.controllers.assets.fullAssetListPullRefresh.onAction = function(done) {
        $("#allAssetsList").html("");
        myApp.data.assetTypes = {};
        myApp.controllers.assets.fullAssetList(done);
    };
});
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