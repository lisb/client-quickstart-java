var _conn;

$(function () {
  log('Requesting Capability Token...');
  $.getJSON('/token')
    .done(function (data) {
      log('Got a token.');
      console.log('Token: ' + data.token);

      // Setup Twilio.Device
      Twilio.Device.setup(data.token);

      Twilio.Device.ready(function (device) {
        log('Twilio.Device Ready!');
        document.getElementById('call-controls').style.display = 'block';
      });

      Twilio.Device.error(function (error) {
        log('Twilio.Device Error: ' + error.message);
      });

      Twilio.Device.connect(function (conn) {
        log('Successfully established call!');
        _conn = conn;

        // Setup mute event handler
        conn.mute(function (muted, mutedConn){
            log('Mute status changed: ' + (muted ? 'MUTED' : 'NOT MUTED'));
            document.getElementById('button-mute').style.display = (muted ? 'none' : 'inline');
            document.getElementById('button-unmute').style.display = (muted ? 'inline' : 'none');
        });

        document.getElementById('button-mute').style.display = 'inline';
        document.getElementById('button-unmute').style.display = 'none';
        document.getElementById('button-call').style.display = 'none';
        document.getElementById('button-hangup').style.display = 'inline';
      });

      Twilio.Device.disconnect(function (conn) {
        log('Call ended.');
        _conn = null;
        document.getElementById('button-call').style.display = 'inline';
        document.getElementById('button-hangup').style.display = 'none';
      });

      setClientNameUI(data.identity);
    })
    .fail(function () {
      log('Could not get a token from server!');
    });

  // Bind button to make call
  document.getElementById('button-call').onclick = function () {
    // get the conference name to connect the call to
    var params = {
      Name: document.getElementById('phone-number').value
    };

    console.log('Calling ' + params.Name + '...');
    Twilio.Device.connect(params);
  };

  // Bind button to hangup call
  document.getElementById('button-hangup').onclick = function () {
    log('Hanging up...');
    Twilio.Device.disconnectAll();
  };

  // Bind button to mute
  document.getElementById('button-mute').onclick = function () {
    setMute(true);
  };

  // Bind button to unmute
  document.getElementById('button-unmute').onclick = function () {
    setMute(false);
  };
});

// Activity log
function log(message) {
  var logDiv = document.getElementById('log');
  logDiv.innerHTML += '<p>&gt;&nbsp;' + message + '</p>';
  logDiv.scrollTop = logDiv.scrollHeight;
}

// Set the client name in the UI
function setClientNameUI(clientName) {
  var div = document.getElementById('client-name');
  div.innerHTML = 'Your client name: <strong>' + clientName +
    '</strong>';
}

function setMute(bool) {
    if(!_conn) {
        return;
    }
    _conn.mute(bool);
}
