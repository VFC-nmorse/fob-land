
var myDevice = null;
var uartService = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
var uartRxCharacteristic;
var uartTxCharacteristic;

function connect(){
  navigator.bluetooth.requestDevice({
    // filters: [myFilters]       // you can't use filters and acceptAllDevices together
    optionalServices: [uartService],
    acceptAllDevices: true
  })
  .then(function(device) {
    // save the device returned so you can disconnect later:
    myDevice = device;
    console.log(device);
    // connect to the device once you find it:
    return device.gatt.connect();
  })
  .then(function(server) {
    // get the primary service:
    return server.getPrimaryService(uartService);
  })
  .then(function(service) {
    // get the  characteristic:
    return service.getCharacteristics();
  })
  .then(function(characteristics) {
    // subscribe to the characteristic if it has notify?
    for (c in characteristics) {
      console.log("characteristics[c]", characteristics[c])
      if (characteristics[c].properties.notify) {
        console.log("got Rx characteristic")
        uartRxCharacteristic = characteristics[c];
        characteristics[c].startNotifications()
        .then(subscribeToChanges);
      }
      if (characteristics[c].properties.write) {
        console.log("got Tx characteristic")
        uartTxCharacteristic = characteristics[c];
      }
      var status_ele = document.getElementById("status_message");
      status_ele.innerText = `Nice, we are connected, so far so good.`;  
    }
  })
  .catch(function(error) {
    // catch any errors:
    console.error('Connection failed!', error);
    var status_ele = document.getElementById("status_message");
    status_ele.innerText = `tried to connect, but ${error}`;
  });
}

// subscribe to changes:
function subscribeToChanges(characteristic) {
  characteristic.oncharacteristicvaluechanged = handleData;
}

function arrayBufferToString(buffer) {
  var byteArray = new Uint8Array(buffer);
  var byteString = '';
  for (var i = 0; i < byteArray.byteLength; i++) {
    byteString += String.fromCodePoint(byteArray[i]);
  }
  return byteString;
}

// handle incoming data:
function handleData(event) {
  // get the data buffer from the ble device:
  var rec = arrayBufferToString(event.target.value.buffer);
  console.log(rec);
}

// disconnect function:
function disconnect() {
  if (myDevice) {
    // disconnect:
    myDevice.gatt.disconnect();
    uartRxCharacteristic = null;
    uartTxCharacteristic = null;
    myDevice = null;
    var status_ele = document.getElementById("status_message");
    status_ele.innerText = "Disconnected"
  }
}

async function send_text(strdata) {
  var status_ele = document.getElementById("status_message");
  try {
  dataObj = JSON.parse(strdata);
  data = JSON.stringify(dataObj);
  }
  catch(error) {
    status_ele.innerText = "Data (json) format could have been erronious, here is what your computer said:"+ error;
    return;
  }
  var msg = "Sending data to your pixy-dust ";
  status_ele.innerText = msg;
  while(data.length > 0) {
    let chunk = data.slice(0, 18);
    data = data.slice(18);
    if (uartTxCharacteristic) {
      special_continue_char = data.length ? '\n' : String.fromCharCode(3); //end of transmission" (EOT, code 3)
      // console.log("chunk+special_continue_char", chunk+special_continue_char)
      await uartTxCharacteristic.writeValueWithResponse(new TextEncoder().encode(chunk+special_continue_char));
      msg = msg + ".";
      status_ele.innerText = msg;
    }
    else {
      console.log("no TX characteristic of the service availible");
      status_ele.innerText = "Transmitting data ran into a problem";
      return;
    }
  }
  status_ele.innerText = "Updated your pixy-dust :)";
}


// attach to DOM
document.getElementById("connect").addEventListener("click", connect());
document.getElementById("disconnect").addEventListener("click", disconnect());
document.getElementById("sendBLE").addEventListener("click", send_text(document.getElementById("cmdr").value));
