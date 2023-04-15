myApp.controllers = {
    firstBoot: function() {
        //Called when app opened or when the instance is changed
        myApp.functions.log("Running first boot");
        myApp.data.init();
        myApp.controllers.menu.loadNavigation();
    },
    menu: {
        loadNavigation: function () {
            myApp.functions.log("Loading navigation");
            myApp.functions.apiCall("instances/list.php", {}, function (result) {
                if (result.length < 1) {
                    //User has no instances so can't use the app
                    ons.notification.alert({message: 'You\'re not a member of any Businesses - visit the website to set one up',title:'Business not found'})
                        .then(function() {
                            myApp.auth.logout();
                        });
                } else {
                    myApp.controllers.assets.fullAssetList(function () {
                        myApp.functions.log("First asset list logged");
                    },null,true);

                    myApp.data.instances = [];
                    $(result).each(function (index, element) {
                        //Parse instance permissions
                        element.permissionsArray = [];
                        if (Array.isArray(element['permissions'])) {
                            //Block if not an array
                            var i;
                            var arraylength = element['permissions'].length;
                            for (i = 0; i < arraylength; i++) {
                                if (element['permissions'][i] != null) {
                                    element.permissionsArray.push(element['permissions'][i]);
                                }
                            }
                        }
                        myApp.data.instances.push(element);
                        if (element['this']) {
                            //This instance
                            myApp.data.instance = element;
                            myApp.data.instanceID = element['instances_id'];
                            $("#menu-title").html(element['instances_name']);
                            if (myApp.auth.instanceHasPermission("PROJECTS:VIEW")) {
                                myApp.functions.apiCall("projects/list.php", {}, function (projectResult) {
                                    $("#menu-projects-list").html("");
                                    $(projectResult).each(function (index, element) {
                                        myApp.data.projects[element['projects_id']] = element;
                                        $("#menu-projects-list").append('<ons-list-item tappable modifier="longdivider"  onclick="document.querySelector(\'#myNavigator\').pushPage(\'project.html\', {data: {id: ' + element['projects_id'] + '}});">' +
                                            '<div class="left">' +
                                            (element.thisProjectManager ? '<ons-icon icon="fa-dot-circle" style="color: #ffc107;"></ons-icon>' : '<ons-icon icon="fa-circle" style="color: grey;"></ons-icon>')+
                                            '</div>' +
                                            '<div class="center"><span class="list-item__title">' + element['projects_name'] + '</span><span class="list-item__subtitle">' + (element['clients_name'] || "") + '</span></div>' +
                                            '</ons-list-item>');
                                    });
                                });
                            }
                            myApp.functions.apiCall("cms/list.php", {}, function (pagesResult) {
                                let cmsPagesNavHtml = "";
                                if (pagesResult.length > 0) {
                                    cmsPagesNavHtml += '<ons-list-title>Pages</ons-list-title><ons-list>';
                                }
                                $(pagesResult).each(function (index, element) {
                                    if (element.SUBPAGES.length > 0) {
                                        cmsPagesNavHtml += '<ons-list-item expandable>' + element.cmsPages_name + '<div class="expandable-content">';
                                        cmsPagesNavHtml += ('<ons-list-item tappable modifier="longdivider" onclick="document.querySelector(\'#myNavigator\').pushPage(\'cmsPage.html\', {data: {\'id\': ' + element.cmsPages_id + '}});">' +
                                            element.cmsPages_name +
                                            '</ons-list-item>');
                                        $(element.SUBPAGES).each(function (index, element) {
                                            cmsPagesNavHtml += ('<ons-list-item tappable modifier="longdivider" onclick="document.querySelector(\'#myNavigator\').pushPage(\'cmsPage.html\', {data: {\'id\': ' + element.cmsPages_id + '}});">' +
                                                element.cmsPages_name +
                                                '</ons-list-item>');
                                        });
                                        cmsPagesNavHtml += '</div></ons-list-item>';
                                    } else {
                                        cmsPagesNavHtml += ('<ons-list-item tappable modifier="longdivider" onclick="document.querySelector(\'#myNavigator\').pushPage(\'cmsPage.html\', {data: {\'id\': ' + element.cmsPages_id + '}});">' +
                                            element.cmsPages_name +
                                            '</ons-list-item>');
                                    }
                                });
                                if (pagesResult.length > 0) {
                                    cmsPagesNavHtml += '</ons-list>';
                                }
                                $("#cmsPages").html(cmsPagesNavHtml);
                            });
                            if (myApp.auth.instanceHasPermission("ASSETS:ASSET_BARCODES:VIEW:SCAN_IN_APP")) {
                                $(".scanSpeedDial").show();
                                $("#menu-asset-barcodeButton").show();
                            } else {
                                $(".scanSpeedDial").hide();
                                $("#menu-asset-barcodeButton").hide();
                            }
                        }
                    });
                }
            })
        }
    },
    assets: {
        barcodeScanSelector: function() {
            var options = [
                {
                    label: 'Associate Barcode',
                    icon: 'fa-barcode'
                },
                {
                    label: 'Delete Barcode',
                    icon: 'fa-trash'
                },
                {
                    label: 'Cancel',
                    icon: 'md-close'
                }
            ];
            ons.openActionSheet({
                title: 'Barcode Manager',
                cancelable: true,
                buttons: options
            }).then(function (index) {
                if (index >= 0 && index < 2) { //-1 is used to show a cancel and a number greater than the length of the array means it's also cancel
                    if (index === 0) {
                        myApp.controllers.assets.barcodeScanFAB();
                    } else if (index === 1) {
                        myApp.controllers.assets.barcodeDeleteFAB();
                    }
                }
            });
        },
        barcodeDeleteFAB: function() {
            if (myApp.auth.location.type !== false) {
                if (myApp.auth.instanceHasPermission("ASSETS:ASSET_BARCODES:DELETE")) {
                    myApp.functions.barcode.scan(false, function(text,type) {
                        if (text !== false) {
                            if (type === "Fake") {
                                type = "CODE_128";
                            }
                            myApp.functions.apiCall("assets/barcodes/search.php", {"text":text,"type":type,"location":myApp.auth.location.value,"locationType":myApp.auth.location.type}, function (assetResult) {
                                if (assetResult.asset === false) {
                                    ons.notification.toast("Sorry barcode not found", {timeout: 2000});
                                } else {
                                    ons.notification.confirm({
                                        title: "Delete Barcode",
                                        message: "Are you sure you'd like to delete the association for this barcode?"
                                    }).then(function (result) {
                                        if (result === 1) {
                                            myApp.functions.apiCall("assets/barcodes/delete.php", {"barcodes_id": assetResult.barcode}, function (result) {
                                                ons.notification.toast("Barcode deleted", {timeout: 2000});
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                } else {
                    ons.notification.toast("Sorry you can't delete barcodes in this business", { timeout: 2000 });
                }
            } else {
                ons.notification.toast("Please set a location before attempting to scan a barcode", { timeout: 2000 });
            }
        },
        barcodeScanFAB: function() {
            if (myApp.auth.location.type !== false) {
                myApp.functions.barcode.scan(false, function(text,type) {
                    if (text !== false) {
                        if (type === "Fake") {
                            type = "CODE_128";
                        }
                        myApp.controllers.assets.barcodeScanPostScan(text,type);
                    }
                });
            } else {
                ons.notification.toast("Please set a location before attempting to scan a barcode", { timeout: 2000 });
            }
        },
        barcodeScanPostScan: function(text,type) {
            myApp.functions.apiCall("assets/barcodes/search.php", {"text":text,"type":type,"location":myApp.auth.location.value,"locationType":myApp.auth.location.type}, function (assetResult) {
                if (assetResult.asset === false) {
                    if (assetResult.barcode !== false) {
                        //Barcode exists but asset doesn't - you can create blank barcodes on the RMS that then get associated manually
                        var barcodeid = assetResult.barcode;
                    } else {
                        //This is a totally random new barcode
                        var barcodeid = false;
                    }
                    if (myApp.auth.instanceHasPermission("ASSETS:ASSET_BARCODES:EDIT:ASSOCIATE_UNNASOCIATED_BARCODES_WITH_ASSETS")) {
                        ons.notification.confirm({
                            title: "Unassociated Barcode",
                            message: "Would you like to associate it with an asset in " + myApp.data.instance['instances_name'] + "?",
                            buttonLabels: ['No','Yes']
                        }).then(function (result) {
                            if (result) {
                                if (assetResult.assetSuggest != false) {
                                    ons.notification.confirm({
                                        title: "Change Asset Tag",
                                        message: 'Would you like to assciate this barcode with the asset that has the Tag ' + assetResult.assetSuggest['assets_tag'] + '? The asset is a ' + assetResult.assetSuggest['assetTypes_name'] + ' (' + assetResult.assetSuggest['manufacturers_name'] + ')',
                                        buttonLabels: ['No','Yes']
                                    }).then(function (confirm) {
                                        if (confirm) {
                                            myApp.functions.apiCall("assets/barcodes/assign.php", {
                                                "tag": assetResult.assetSuggest['assets_tag'],
                                                "barcodeid": barcodeid,
                                                "text": text,
                                                "type": type
                                            }, function (result) {
                                                myApp.controllers.assets.barcodeScanPostScan(text,type);
                                            });
                                        } else {
                                            myApp.controllers.assets.barcodeScanAssociate(barcodeid,text,type);
                                        }
                                    });
                                } else {
                                    myApp.controllers.assets.barcodeScanAssociate(barcodeid,text,type);
                                }
                            }
                        });
                    } else {
                        ons.notification.toast("Sorry barcode not found", { timeout: 2000 });
                    }
                } else {
                    //Go and get the data on this asset - yeah we may have it already but we should go get it again in case something has changed
                    var requestData = {"assetTypes_id": assetResult.asset.assetTypes_id,"all":true };
                    myApp.functions.apiCall("assets/list.php", requestData, function (assetDownloadResult) {
                        $(assetDownloadResult['assets']).each(function (index, element) {
                            if (typeof myApp.data.assetTypes[element['assetTypes_id']] === "undefined") { //Shouldn't realy be needed
                                myApp.controllers.assets.fullAssetListAppend(element);
                            }
                            myApp.data.assetTypes[element['assetTypes_id']] = element;
                        });
                        if (Object.keys(assetDownloadResult['assets']).length > 0) {
                            myApp.controllers.assets.barcodeScanAddToList(assetResult.asset.assetTypes_id, assetResult.asset.assets_id);
                        } else {
                            //Asset wasn't found
                            ons.notification.toast("Sorry asset not found - is the correct business set?", { timeout: 2000 });
                        }
                    });
                }
            });
        },
        barcodeScanAssociate: function(barcodeid,text,type) {
            ons.notification.prompt({
                title: "Associate Barcode",
                message: 'What is the Asset\'s Tag?'
            }).then(function (tag) {
                if (tag) {
                    myApp.functions.apiCall("assets/barcodes/assign.php", {
                        "tag": tag,
                        "barcodeid": barcodeid,
                        "text": text,
                        "type": type
                    }, function (result) {
                        if (myApp.auth.instanceHasPermission("ASSETS:EDIT")) {
                            ons.notification.confirm({
                                title: "Change Asset Tag",
                                message: 'Would you like to change the Asset\'s Tag to ' + text + '?',
                                buttonLabels: ['No','Yes']
                            }).then(function (confirm) {
                                if (confirm) {
                                    myApp.functions.apiCall("assets/editAsset.php", {
                                        "assets_id": result['assets_id'],
                                        "assets_tag": text
                                    }, function (result) {
                                        myApp.controllers.assets.barcodeScanPostScan(text,type);
                                    });
                                } else {
                                    myApp.controllers.assets.barcodeScanPostScan(text,type);
                                }
                            });
                        } else {
                            myApp.controllers.assets.barcodeScanPostScan(text,type);
                        }
                    });
                }
            });
        },
        barcodeScanAddToList: function(typeid, id) {
            var thisAsset;
            $(myApp.data.assetTypes[typeid]['tags']).each(function (index, element) {
                if (element['assets_id'] == id) {
                    thisAsset = element;
                    return false;
                }
            });
            /*$("#scanned-list").prepend('<ons-list-item tappable modifier="longdivider"  onclick="document.querySelector(\'#myNavigator\').pushPage(\'assetType.html\', {data: {id: ' + typeid + '}}).then(function() { document.querySelector(\'#myNavigator\').pushPage(\'asset.html\', {data: {id: ' + typeid + ', asset: ' + id + '}}) });">' +
                '<div class="left">' +
                (myApp.data.assetTypes[typeid].thumbnails.length > 0 ? '<img loading="lazy" class="list-item__thumbnail" src="' + myApp.data.assetTypes[typeid].thumbnails[0]['url'] + '">' : '<span style="width: 40px;"></span>')+
                '</div>' +
                '<div class="center"><span class="list-item__title">' + thisAsset['assets_tag_format'].replace("-","&#8209;") + " - " + myApp.data.assetTypes[typeid]['assetTypes_name'] + '</span><span class="list-item__subtitle">' + myApp.data.assetTypes[typeid]['assetCategories_name'] + ' - ' + myApp.data.assetTypes[typeid]['manufacturers_name'] + '</span></div>' +
                '<div class="right">' +
                '<div class="list-item__label">' + (typeof myApp.auth.location.name !== "undefined" ? myApp.auth.location.name : "") + '</div>'+
                '</div>' +
                '</ons-list-item>');*/
            document.querySelector('#myNavigator').pushPage('assetType.html', {data: {id: typeid}}).then(function () {
                document.querySelector('#myNavigator').pushPage('asset.html', {data: {id: typeid, asset: id }});
            });
        },
        fullAssetList: function(done, searchTerm, clear) {
            $("#allAssetsListLoader").show();
            if (typeof clear === undefined) {
                clear = false;
            }
            if (clear) {
                //Clear all assets
                $("#allAssetsList").html("");
                //$("#scanned-list").html("");
                myApp.data.assetTypes = {};
                myApp.data.assetTypesPages = null;
            }
            var requestData = {"page": Math.floor(Object.keys(myApp.data.assetTypes).length / 20)+1,"abridgedList":true,"imageComp":"tiny"};
            if (myApp.data.assetTypesPages != null && Object.keys(myApp.data.assetTypes).length > ((myApp.data.assetTypesPages-1)*20)) {
                //Don't allow it to duplicate objects
                $("#allAssetsListLoader").hide();
                done();
            } else {
                if (searchTerm !== undefined && searchTerm != null) {
                    requestData['term'] = searchTerm;
                    requestData['all'] = "true";
                }
                myApp.functions.apiCall("assets/list.php", requestData, function (assetResult) {
                    myApp.data.assetTypesPages = assetResult.pagination.total;
                    $(assetResult['assets']).each(function (index, element) {
                        if (typeof myApp.data.assetTypes[element['assetTypes_id']] === "undefined") {
                            myApp.data.assetTypes[element['assetTypes_id']] = element;
                            myApp.controllers.assets.fullAssetListAppend(element);
                        }
                    });
                    $("#allAssetsListLoader").hide();
                    done();
                }, true);
            }
        },
        fullAssetListAppend: function(element) {
            $("#allAssetsList").append('<ons-list-item tappable modifier="longdivider"  onclick="document.querySelector(\'#myNavigator\').pushPage(\'assetType.html\', {data: {id: ' + element['assetTypes_id'] + '}});">' +
                '<div class="left">' +
                (element.thumbnails.length > 0 ? '<img loading="lazy" class="list-item__thumbnail" src="' + element.thumbnails[0]['url'] + '">' : '<span style="width: 40px;"></span>')+
                '</div>' +
                '<div class="center"><span class="list-item__title">' + element['assetTypes_name'] + '</span><span class="list-item__subtitle">' + element['assetCategories_name'] + ' - ' + element['manufacturers_name'] + '</span></div>' +
                '<div class="right">' +
                '<div class="list-item__label">' + (element['count'] > 1 ? 'x' + element['count'] : element['tags'][0]['assets_tag_format'].replace("-","&#8209;"))+'</div>'+
                '</div>' +
                '</ons-list-item>');
            return true;
        },
        fullAssetListSearch: function(value) {
            myApp.controllers.assets.fullAssetList(function () {
                myApp.functions.log("Serach complete")
            },value,true);
        },
        fullAssetListPullRefresh: null,
        checkOffAsset: function(assetAssignment,newStatus,originalStatus) {
            if ($(".asset-assignment[data-assetassignmentid=" + assetAssignment + "]").find("input[type=checkbox]").is(':checked')) {
                myApp.functions.apiCall("projects/assets/setStatus.php", {"assetsAssignments_id":assetAssignment,"assetsAssignments_status":newStatus}, function (projectData) {
                    $(".asset-assignment[data-assetassignmentid=" + assetAssignment + "]").detach().appendTo('#scannedProjectAssetsList');
                });
            } else {
                if (!originalStatus || originalStatus == null) {
                    originalStatus = 0;
                }
                myApp.functions.apiCall("projects/assets/setStatus.php", {"assetsAssignments_id":assetAssignment,"assetsAssignments_status":originalStatus}, function (projectData) {
                    $(".asset-assignment[data-assetassignmentid=" + assetAssignment + "]").detach().appendTo("#allProjectAssets");
                });
            }

        },
        newMaintenanceJob: function() {
            var formData = {};
            $("#assetMaintenancePage-form").find('[name]').each(function() {
                formData[this.name] = this.value;
            })
            myApp.functions.apiCall("maintenance/newJob.php", formData, function () {
                ons.notification.toast("Job added successfully", {timeout: 3000});
                $("#assetMaintenancePage-form").trigger("reset");
                document.querySelector('#myNavigator').popPage();
            });
        },
    },
    pages: {
        projectPage: function (data) {
            myApp.functions.apiCall("projects/data.php", {"id":data.data.id}, function (projectData) {
                myApp.data.projects[data.data.id] = projectData;
                $("#projectPage-title").html(myApp.data.projects[data.data.id]['project']['projects_name']);
                $("#projectPageTitle").html(myApp.data.projects[data.data.id]['project']['projects_name']);
                $("#projectPageAssetButton").attr("onclick", 'document.querySelector(\'#myNavigator\').pushPage(\'projectAssets.html\', {data: {id: ' + data.data.id + '}});');
                $("#projectPageAssetStatuses").html('');
                $(myApp.data.projects[data.data.id]['assetsAssignmentsStatus']).each(function (index, element) {
                    $("#projectPageAssetStatuses").append("<option value='" + element['assetsAssignmentsStatus_id'] + "' " + (index == 0 ? 'selected' : '') + ">" + element['assetsAssignmentsStatus_name'] + "</option>");
                });
                $("#projectPageFilesList").html("");
                if (myApp.auth.instanceHasPermission("PROJECTS:PROJECT_PAYMENTS:VIEW:FILE_ATTACHMENTS")) {
                    $(myApp.data.projects[data.data.id]['files']).each(function (index, element) {
                        $("#projectPageFilesList").append('<ons-list-item tappable modifier="longdivider" onclick="myApp.functions.s3url(' + element['s3files_id'] + ',false,myApp.functions.openBrowser);">' +
                            '<div class="left">' +
                            '<ons-icon icon="' + myApp.functions.fileExtensionToIcon(element['s3files_extension']) + '"></ons-icon>' +
                            '</div>' +
                            '<div class="center">' + element['s3files_name'] + '</div>' +
                            '<div class="right">' + myApp.functions.formatSize(element['s3files_meta_size']) + '</div>' +
                            '</ons-list-item>');
                    });
                }
                if (myApp.data.projects[data.data.id]['project']['clients_name'] != null) {
                    $("#projectPageDescription").html("Client: " + myApp.data.projects[data.data.id]['project']['clients_name']);
                } else $("#projectPageDescription").html("");

                if (myApp.auth.instanceHasPermission("PROJECTS:PROJECT_ASSETS:EDIT:ASSIGNMENT_STATUS")) {
                    $("#projectPageScanAssets").show();
                }
            });
        },
        projectAssetsPage: function (data) {
            var newStatus = $("#projectPageAssetStatuses").val();
            if (!newStatus || newStatus == null) {
                document.querySelector('#myNavigator').popPage();
            }
            $("#scannedProjectAssetsTitle").prop('label',$( "#projectPageAssetStatuses option:selected" ).text());

            myApp.controllers.assets.projectAssetsPagePullRefresh = document.getElementById('projectAssetsPullHook');
            myApp.controllers.assets.projectAssetsPagePullRefresh.addEventListener('changestate', function(event) {
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
                myApp.controllers.assets.projectAssetsPagePullRefresh.innerHTML = message;
            });
            myApp.controllers.assets.projectAssetsPagePullRefresh.onAction = function(done) {
                myApp.functions.apiCall("projects/data.php", {"id":data.data.id}, function (projectData) {
                    myApp.data.projects[data.data.id] = projectData;
                    myApp.controllers.pages.projectAssetsPage({"data": data.data});
                    done();
                });
            };
            myApp.controllers.assets.projectAssetsPageTabs = document.querySelector('#scannedProjectAssetsTabs');
            myApp.controllers.assets.projectAssetsPageTabs.addEventListener('prechange', function() {
                myApp.functions.apiCall("projects/data.php", {"id":data.data.id}, function (projectData) {
                    myApp.data.projects[data.data.id] = projectData;
                    myApp.controllers.pages.projectAssetsPage({"data": data.data});
                });
            })
            $("#allProjectAssets").html("");
            $("#scannedProjectAssetsList").html("");
            $(myApp.data.projects[data.data.id]['FINANCIALS']['assetsAssigned']).each(function (assetType, assets) {
                for (const thisAssignment in assets) {
                    $(assets[thisAssignment]['assets']).each(function (index, element) {
                        $((element.assetsAssignmentsStatus_id == newStatus ? "#scannedProjectAssetsList" : "#allProjectAssets")).append('<ons-list-item tappable modifier="longdivider" class="asset-assignment" data-assetassignmentid="' + element['assetsAssignments_id'] + '">' +
                            '<div class="left">' +
                            (element.assetsAssignmentsStatus_id != newStatus ? '<ons-checkbox onclick="myApp.controllers.assets.checkOffAsset(' + element['assetsAssignments_id'] + ',' + newStatus + ',' + element['assetsAssignmentsStatus_id'] + ')"></ons-checkbox>' : '') +
                            '</div>' +
                            '<div class="center"><span class="list-item__title">' + element['assetTypes_name'] + (element['assetsAssignmentsStatus_name'] ? ' - ' + element['assetsAssignmentsStatus_name'] : '') + '</span><span class="list-item__subtitle">' + element['assetCategories_name'] + ' - ' + element['manufacturers_name'] + '</span></div>' +
                            '<div class="right" onclick="document.querySelector(\'#myNavigator\').pushPage(\'assetType.html\', {data: {id: ' + element['assetTypes_id'] + '}});">' +
                            '<div class="list-item__label">' + element['assets_tag'].replace("-", "&#8209;") + '</div>' +
                            '</div>' +
                            '</ons-list-item>');
                    });
                }
            });
        },
        cmsPage: function(data) {
            myApp.functions.apiCall("cms/get.php", { "p" : data.data.id}, function (pageResult) {
                $("#cmsPageTitle").html(pageResult.cmsPages_name);
                $("#cmsPageContent").html(pageResult.CONTENT);
            });
        },
        assetMaintenancePage: function (data) {
            $("#assetMaintenancePage-form").trigger("reset");
            $("#assetMaintenancePage-form").children("input[name=maintenanceJobs_assets]").val(data.data.asset);
        },
        editAssetTypePage: function (data) {
            if (data.data.id == "NEW") {
                $("#editAssetTypePageTitle").html("New Asset Type");
                $("#editAssetTypePageThumbAddTake").attr("onclick", "myApp.functions.uploadPhoto(true, 2,'ASSET-THUMBNAIL')");
                $("#editAssetTypePageThumbAddSelect").attr("onclick", "myApp.functions.uploadPhoto(false, 2,'ASSET-THUMBNAIL')");
            } else {
                var thisAsset = myApp.data.assetTypes[data.data.id];
                $("#editAssetTypePageTitle").html("Edit " + thisAsset['assetTypes_name']);
                //$("#assetTypePageManufacturer").html(thisAsset['manufacturers_name']);
                //$("#assetTypePageCategory").html(thisAsset['assetCategories_name']);
                $("#editAssetTypePageDescription").val(myApp.functions.nl2br(thisAsset['assetTypes_description']));
                //$("#assetTypePageProductLink").html(thisAsset['assetTypes_productLink']);

                $("#editAssetTypePageThumbList").html("");
                $(thisAsset['thumbnails']).each(function (index, element) {
                    $("#editAssetTypePageThumbList").append('<ons-list-item modifier="longdivider">' +
                        '<div class="left">' +
                       '<img loading="lazy" class="list-item__thumbnail" src="' + element.url + '">' +
                        '</div>' +
                        '<div class="center">' + element['s3files_name'] + '</div>' +
                        '<div class="right">' + myApp.functions.formatSize(element['s3files_meta_size']) + '</div>' +
                        '</ons-list-item>');
                });
                $("#editAssetTypePageThumbAddTake").attr("onclick", "myApp.functions.uploadPhoto(true, 2,'ASSET-THUMBNAIL'," + thisAsset['assetTypes_id'] + ")");
                $("#editAssetTypePageThumbAddSelect").attr("onclick", "myApp.functions.uploadPhoto(false, 2,'ASSET-THUMBNAIL'," + thisAsset['assetTypes_id'] + ")");
            }
        },
        about: function (data) {
            $('.versionNumber').text(myApp.config.version.number);
            $('.versionCode').text(myApp.config.version.code);
            $('#aboutPagePlatform').text(device.platform + " (" + device.model + ")");
        },
        assetTypePage: function (data) {
            var requestData = {"assetTypes_id": data.data.id,"all":true };
            myApp.functions.apiCall("assets/list.php", requestData, function (assetDownloadResult) {
                if (assetDownloadResult['assets'].length == 1) {
                    myApp.controllers.assets.assetTypePagePullRefresh = document.getElementById('assetTypePagePullHook');
                    myApp.controllers.assets.assetTypePagePullRefresh.addEventListener('changestate', function(event) {
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
                        myApp.controllers.assets.assetTypePagePullRefresh.innerHTML = message;
                    });
                    myApp.controllers.assets.assetTypePagePullRefresh.onAction = function(done) {
                        myApp.controllers.pages.assetTypePage({"data":data.data});
                        done();
                    };
                    var thisAsset = assetDownloadResult['assets'][0];
                    myApp.data.assetTypes[thisAsset['assetTypes_id']] = thisAsset;
                    if (myApp.auth.instanceHasPermission("ASSETS:ASSET_TYPES:EDIT")) {
                        $(".assetTypePageEditButton").show();
                    } else {
                        $(".assetTypePageEditButton").hide();
                    }
                    $("#assetTypePageTitle").html(thisAsset['assetTypes_name']);
                    $("#assetTypePageManufacturer").html(thisAsset['manufacturers_name']);
                    $("#assetTypePageCategory").html(thisAsset['assetCategories_name']);
                    $("#assetTypePageDescription").html(myApp.functions.nl2br(thisAsset['assetTypes_description']));
                    $("#assetTypePageProductLink").html(thisAsset['assetTypes_productLink']);
                    $(".assetTypePageEditButton").attr("onclick", 'document.querySelector(\'#myNavigator\').pushPage(\'editAssetTypePage.html\', {data: {id: ' + data.data.id + '}});');
                    if (thisAsset['assetTypes_productLink'] !== null) {
                        $("#assetTypePageProductLink").attr("onclick", "cordova.InAppBrowser.open('" + thisAsset['assetTypes_productLink'] + "','_blank')");
                    }
                    $("#assetTypePageAssetsList").html("");
                    $(thisAsset['tags']).each(function (index, element) {
                        $("#assetTypePageAssetsList").append('<ons-list-item tappable modifier="longdivider"  onclick="document.querySelector(\'#myNavigator\').pushPage(\'asset.html\', {data: {id: ' + data.data.id + ',asset: ' + element['assets_id'] + '}});">' +
                            '<div class="left">' +
                            (element['flagsblocks']["COUNT"]["BLOCK"] > 0 ? '<ons-icon icon="fa-ban" style="color: #dc3545;"></ons-icon>&nbsp;' : '&nbsp;') +
                            (element['flagsblocks']["COUNT"]["FLAG"] > 0 ? '<ons-icon icon="fa-flag" style="color: #ffc107;"></ons-icon>' : '') +
                            '</div>' +
                            '<div class="center">' + element['assets_tag_format'] + '</div>' +
                            '</ons-list-item>');
                    });
                    //Thumbnails
                    var carousel = "";
                    $(thisAsset['thumbnails']).each(function (index, element) {
                        carousel += ('<ons-carousel-item><div style="margin-top: 20px;">' +
                            '<img src="' + element.url + '" style="min-width:25%; max-width:100%;height: auto; max-height:65vh;" />' +
                            '</div></ons-carousel-item>');
                    });
                    $("#assetTypePageCarouselTarget").html(carousel);
                    if (carousel != "") {
                        $("#assetTypePageCarousel").parent().show();
                        document.getElementById('assetTypePageCarousel').refresh();
                    } else {
                        $("#assetTypePageCarousel").parent().hide();
                    }

                    //Files
                    $("#assetTypePageFilesList").html("");
                    if (myApp.auth.instanceHasPermission("ASSETS:ASSET_TYPE_FILE_ATTACHMENTS:VIEW")) {
                        $(thisAsset['files']).each(function (index, element) {
                            myApp.functions.log(element);
                            $("#assetTypePageFilesList").append('<ons-list-item tappable modifier="longdivider" onclick="myApp.functions.s3url(' + element['s3files_id'] + ',false,myApp.functions.openBrowser);">' +
                                '<div class="left">' +
                                '<ons-icon icon="' + myApp.functions.fileExtensionToIcon(element['s3files_extension']) + '"></ons-icon>' +
                                '</div>' +
                                '<div class="center">' + element['s3files_name'] + '</div>' +
                                '<div class="right">' + myApp.functions.formatSize(element['s3files_meta_size']) + '</div>' +
                                '</ons-list-item>');
                        });
                    }
                }
            },false);
        },
        assetPage: function (data) {
            var thisAssetType = myApp.data.assetTypes[data.data.id];
            var thisAsset;
            $(thisAssetType['tags']).each(function (index, element) {
                if (element['assets_id'] == data.data.asset) {
                    thisAsset = element;
                    return false;
                }
            });
            myApp.functions.log(thisAsset);
            if (myApp.auth.instanceHasPermission("ASSETS:ASSET_TYPES:CREATE")) {
                $(".assetPageMaintenanceButton").show();
            } else {
                $(".assetPageMaintenanceButton").hide();
            }
            $("#assetPageTitle").html(thisAsset['assets_tag_format']);
            $("#assetPageNotes").html(myApp.functions.nl2br(thisAsset['assets_notes']));
            $("#assetPageMass").html((thisAsset['assets_mass'] !== null ? thisAsset['assets_mass_format'] : thisAssetType['assetTypes_mass_format']));
            $("#assetPageValue").html((thisAsset['assets_value'] !== null ? thisAsset['assets_value_format'] : thisAssetType['assetTypes_value_format']));
            $("#assetPageWeekRate").html((thisAsset['assets_weekRate'] !== null ? thisAsset['assets_weekRate_format'] : thisAssetType['assetTypes_weekRate_format']));
            $("#assetPageDayRate").html((thisAsset['assets_dayRate'] !== null ? thisAsset['assets_dayRate_format'] : thisAssetType['assetTypes_dayRate_format']));
            $(".assetPageMaintenanceButton").attr("onclick", 'document.querySelector(\'#myNavigator\').pushPage(\'assetMaintenancePage.html\', {data: {id: ' + data.data.id + ',asset: ' + data.data.asset + '}});');
            $("#assetPageDefinableFields").html("");
            for (i = 1; i <= thisAssetType['fields'].length; i++) {
                if (thisAssetType['fields'][i-1] !== "" && thisAsset["asset_definableFields_" + i] !== "") {
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
            //Files
            $("#assetPageFilesList").html("");
            if (myApp.auth.instanceHasPermission("ASSETS:ASSET_FILE_ATTACHMENTS:VIEW")) {
                $(thisAsset['files']).each(function (index, element) {
                    myApp.functions.log(element);
                    $("#assetPageFilesList").append('<ons-list-item tappable modifier="longdivider" onclick="myApp.functions.s3url(' + element['s3files_id'] + ',false,myApp.functions.openBrowser);">' +
                        '<div class="left">' +
                        '<ons-icon icon="' + myApp.functions.fileExtensionToIcon(element['s3files_extension']) + '"></ons-icon>' +
                        '</div>' +
                        '<div class="center">' + element['s3files_name'] + '</div>' +
                        '<div class="right">' + myApp.functions.formatSize(element['s3files_meta_size']) + '</div>' +
                        '</ons-list-item>');
                });
            }
        },
    }
}
ons.ready(function() {
    myApp.controllers.assets.fullAssetListPullRefresh = document.getElementById('allAssetsListLoaderPullHook');
    setTimeout(function() {
        if (myApp.controllers.assets.fullAssetListPullRefresh) {
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
                myApp.controllers.assets.fullAssetList(done, null, true);
            };
        }
    }, (myApp.controllers.assets.fullAssetListPullRefresh ? 1 : 10000));
});
