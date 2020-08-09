myApp.auth.login = function () {
    alert("Here's login");
    var username = $("#login-username").val();
    var password = $("#login-password").val();
    alert("Got details");
    var networkState = navigator.connection.type;
    alert("Got network");
    if (networkState === Connection.NONE) {
        ons.notification.toast("No Network Connection", {timeout: 2000});
    } else {
        alert("Got past network state");
        if (username != '' && password != '') {
            $.ajax({
                type: "POST",
                url: myApp.config.endpoint + 'auth/appLogin.php',
                dataType: 'json',
                data: {
                    'email': username,
                    'password': password,
                    'deviceData':
                        'Device Model:' + device.model + ',' +
                        'Device Cordova:' + device.cordova + ',' +
                        'Device Platform:' + device.platform + ',' +
                        'Device UUID:' + device.uuid + ',' +
                        'Device Version:' + device.version + ',' +
                        'Connection Type:' + networkState
                },
                success: function (response) {
                    if (response.result) {
                        localStorage.setItem('token', response.response.token);
                        myApp.auth.token = response.response.token;
                        myApp.functions.launchApp();
                    } else {
                        ons.notification.toast(response.error.message, {timeout: 3000});
                    }
                },
                error: function (request, status, error) {
                    console.log(JSON.stringify(request));
                    console.log(JSON.stringify(error));
                    console.log(JSON.stringify(status));
                    if (request.statusText == "error" || requset.statusText == "") {
                        ons.notification.alert("Error connecting to AdamRMS - Please check your connection");
                    } else {
                        ons.notification.alert(request.statusText);
                    }

                }
            });
        } else {
            ons.notification.toast("Please enter a username and password", {timeout: 2000});
        }
    }
}