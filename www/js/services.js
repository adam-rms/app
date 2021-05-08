/***********************************************************************************
 * App Services. This contains the logic of the application organised in modules/objects. *
 ***********************************************************************************/
myApp.functions = {
  log: function (data) {
    if (myApp.config.debug) {
      console.log(data);
    }
  },
  escapeHtml: function (text) {
    var map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };

    return text.replace(/[&<>"']/g, function (m) {
      return map[m];
    });
  },
  barcode: {
    scan: function (continuous, callback) {
      myApp.functions.log("Triggtering cordova barcode scan");
      try {
        cordova.plugins.barcodeScanner.scan(
            function (result) {
              myApp.functions.log(result);
              if (!result.cancelled) {
                callback(result.text, result.format);
                if (continuous) {
                  myApp.functions.barcode.scan(true, callback);
                }
              } else {
                callback(false, false);
              }
            },
            function (error) {
              myApp.functions.log(error);
              ons.notification.toast("Scanning failed: " + error, {timeout: 2000});
            },
            {
              preferFrontCamera: false, // iOS and Android
              showFlipCameraButton: false, // iOS and Android
              showTorchButton: true, // iOS and Android
              torchOn: false, // Android, launch with the torch switched on (if available)
              saveHistory: false, // Android, save scan history (default false)
              prompt: "Place an asset's barcode inside the scan area", // Android
              resultDisplayDuration: 0, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
              formats: "EAN_8,EAN_13,CODE_39,CODE_93,CODE_128", // chosen based on the overlap with the PHP lib
              disableAnimations: true, // iOS
              disableSuccessBeep: true // iOS and Android
            }
        );
      } catch (err) {
        myApp.functions.log(JSON.stringify(err));
      }
      myApp.functions.log("Attempted to trigger barcode scan");
    }
  },
  s3url: function (fileid, size, callback) {
    myApp.functions.apiCall("file/", {"f": fileid, "d": "force", "s": size}, function (response) {
      callback(response.url);
    });
  },
  openBrowser: function (url) {
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
    } catch (err) {
      myApp.functions.log(err.message);
    }
    if (connected !== true) {
      ons.notification.toast("No Network Connection", {timeout: 2000});
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
          myApp.functions.log("Got ajax data - going to call callback");
          if (response.result) {
            myApp.functions.log("Calling callback");
            callback(response.response);
          } else {
            if (response.error.code && response.error.code == "AUTH") {
              //They need to login again - token probably expired
              myApp.auth.logout();
            } else {
              ons.notification.toast(response.error.message, {timeout: 3000});
            }
          }
          myApp.functions.log(JSON.stringify(response));
        },
        error: function (request, status, error) {
          $('.loadingDialog').hide();
          myApp.functions.log(JSON.stringify(error));
          ons.notification.alert({
            title: request.statusText + " - " + status,
            message: (request.responseText ? request.responseText : 'Error connecting to AdamRMS')
          }, function () {
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
  fileExtensionToIcon: function (extension) {
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
  formatSize: function (size) {
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
  nl2br: function (text) {
    if (text == null) {
      return text;
    } else {
      return text.replace(/(?:\r\n|\r|\n)/g, '<br>');
    }
  },
  reset: function () {
    localStorage.clear();
    location.reload();
  },
  uploadPhoto: function (camera, typeid, typename, subtype) {
    if (typeof subtype === "undefined") {
      var subtype = "";
    }
    myApp.functions.log("Attempting to use cam");
    navigator.camera.getPicture(function (imageURI) {
      var connected = true;
      try {
        //For some unknown reason Android gets upset about this
        if (navigator.connection.type === Connection.NONE) {
          connected = false;
        }
      } catch (err) {
        myApp.functions.log(err.message);
      }
      if (connected !== true) {
        ons.notification.toast("No Network Connection", {timeout: 2000});
      } else {
        if (imageURI.indexOf('file:///') > -1) {
          window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
            window.resolveLocalFileSystemURL(imageURI, fileEntryResolved => {
              getFile(fs,fileEntryResolved);
            }, function (err) {
              myApp.functions.log('error getting file!');
              console.log(err);
            });
          }, function (err) {
            myApp.functions.log('error getting persistent fs!');
          });
        } else {
          window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
            window.resolveLocalFileSystemURL(imageURI, fileEntryResolved => {
              fs.root.getFile(imageURI, { create: true, exclusive: false }, function (fileEntry) {
                getFile(fs, fileEntry);
              });
            }, function (err) {
              myApp.functions.log('error getting file!');
              console.log(err);
            });
          }, function (err) {
            myApp.functions.log('error getting persistent fs!');
          });
        }
        var getFile = function(fs,fileEntry) {
          myApp.functions.log('file system open: ' + fs.name);
          fileEntry.file(function (file) {
            var reader = new FileReader();
            reader.onloadend = function () {
              document.querySelector('#mySplitter').left.close();
              $(".loadingDialog").show();
              // Create a blob based on the FileReader "result", which we asked to be retrieved as an ArrayBuffer
              var formData = new FormData();
              formData.append("file", new Blob([new Uint8Array(this.result)], {type: "image/jpg"}));
              formData.append("jwt", myApp.auth.token);
              formData.append("typeid", typeid);
              formData.append("filename",imageURI.split(/(\\|\/)/g).pop())
              formData.append("typename", typename);
              formData.append("subtype", subtype);
              formData.append("public", 0);
              formData.append("extension", "jpg");
              var oReq = new XMLHttpRequest();
              oReq.open("POST", myApp.config.endpoint + "s3files/appUploader.php", true);
              oReq.onload = function (oEvent) {
                $('.loadingDialog').hide();
                var response = $.parseJSON(oReq.responseText);
                if (response.error.code && response.error.code == "AUTH") {
                  //They need to login again - token probably expired
                  myApp.auth.logout();
                } else if (response.error.code) {
                  ons.notification.toast(response.error.message, {timeout: 3000});
                } else if (response.result) {
                  ons.notification.toast("Image uploaded & saved successfully", {timeout: 2000});
                }

                //Delete the image
                navigator.camera.cleanup(function () {
                  myApp.functions.log("Cleanup successful");
                }, function (error) {
                  myApp.functions.log(error);
                });
              };
              oReq.onerror = function(error) {
                $('.loadingDialog').hide();
                ons.notification.toast("Error uploading file - please check your connection", {timeout: 3000});
              }
              // Pass the blob in to XHR's send method
              oReq.send(formData);
            };
            // Read the file as an ArrayBuffer
            reader.readAsArrayBuffer(file);
          }, function (err) {
            myApp.functions.log('error getting fileentry file!');
          });
        }
      }
    }, function(errorMessage) {
      //Error function
      myApp.functions.log(errorMessage);
    }, {
        quality: 80,
        destinationType: navigator.camera.DestinationType.FILE_URI,
        sourceType: (camera ? navigator.camera.PictureSourceType.CAMERA : navigator.camera.PictureSourceType.PHOTOLIBRARY),
        encodingType: navigator.camera.EncodingType.JPEG,
        mediaType: navigator.camera.MediaType.PICTURE,
        correctOrientation: true,
        saveToPhotoAlbum: (camera ? true : false), //Save them a copy in their gallery as a backup
        allowEdit: false //Does weird stuff on Android
    });
  }
}