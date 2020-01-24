/* Global Variables */
var totalHours = 0.0; // total hours for period
var totalPay = 0.0; // total pay for period

/* Storage stuff */
// Global list
var savedPays = [];

// Retrieve stuff from google storage
window.onload = function() {
  // Retrieve minimum shift length without break and break length
  chrome.storage.sync.get({'shift': 5, 'break': 30}, function(data){
    console.log('loaded min shift is' + data.shift);
    document.getElementById("breakMin").value = data.shift;

    console.log('loaded break is' + data.break);
    document.getElementById("breakLength").value = data.break;
  })

  // Retrieve custom pays
  chrome.storage.sync.get({myPays: []}, function(data){
    // add existing data to array   
    savedPays = data.myPays;
    console.log('savedPays loaded' + data.myPays);
    console.log(savedPays.length);

    for (var i = 0; i < savedPays.length; i++){
    // Enter pay onto list
    var list = document.getElementById("payrate");

    var option = document.createElement("option");

    option.text = savedPays[i];
    // Add to HTML
    list.add(option);
  }
  })
}

/* Add event listeners */

// Calculate shifts when form is submitted
var form = document.getElementById("form");
form.addEventListener("submit", function(evt){
  evt.preventDefault();
  addShift();
})

// Clear all shifts for period
var clear = document.getElementById("clear");
clear.addEventListener("click", clearShifts);

// Receive custom pay input
var customButton = document.getElementById("custombutton");
customButton.addEventListener("click", updateList);

// Clear all entered pay rates
var clearPay = document.getElementById("clearpayrate");
clearPay.addEventListener("click", clearPayRates);

// Validate shift start and end times as valid time formats
function validatetime()
{
  if(form.payrate.value == "select")
  {
    alert("Please select pay rate");
    form.payrate.focus();
    return false;
  }

  // regular expression to match required time format
  re = /^\d{1,2}:\d{2}$/;

  // check start time
  if(form.starttime.value == '') 
  {
    alert("Please enter shift start time");
    form.starttime.focus();
    return false;
  }
  else if(!form.starttime.value.match(re))
  {
    alert("Invalid time format: " + form.starttime.value);
    form.starttime.focus();
    return false;
  }
  // check end time
  else if(form.endtime.value == '')
  {
    alert("Please enter shift end time");
    form.endtime.focus();
    return false;
  }
  else if(!form.endtime.value.match(re)) 
  {
    alert("Invalid time format: " + form.endtime.value);
    form.endtime.focus();
    return false;
  }
  return true;
}

// Calculate shift pay and hours and add to total pay, hours worked and table.
function addShift()
{
  if(validatetime())
  {
    var startString = form.starttime.value;
    var endString = form.endtime.value;

    var startMoment = moment(startString, "HH:mm");
    var endMoment = moment(endString, "HH:mm");

    // return difference in hours as a float
    var difference = endMoment.diff(startMoment, 'hours', true);

    // Account for breaks (add in error checking for no break added)
    var breakString = form.breakMin.value;
    var breakLengthString = form.breakLength.value;

    // Convert break to float
    var breakFloat = parseFloat(breakString);

    // Check if break is applied
    if (difference > breakFloat)
    {
      // Convert break in minutes to break to hours
      var breakLengthFloat = (parseFloat(breakLengthString) / 60);

      // Apply to shift
      difference = difference - breakLengthFloat;
    }

    // Output difference
    totalHours = totalHours + difference;
    document.getElementById("hours").innerHTML = totalHours.toFixed(2);

    // Get total pay
    var payRateString = form.payrate.value;
    // Determine which list is being used to select pay


    // Find pay for shift
    var shiftPay = parseFloat(payRateString) * difference;

    // Add to total pay
    totalPay = totalPay + shiftPay;

    // Update HTML
    document.getElementById("pay").innerHTML = "$" + totalPay.toFixed(2);
    
    // Update table
    updateTable(startString, endString, difference.toFixed(2), payRateString, shiftPay.toFixed(2));

    // Save minimum break and break length to google storage
    chrome.storage.sync.set({'shift': breakString, 'break': breakLengthString}, function() {
          console.log('Min shift length saved as' + breakString);
          console.log('Break length saved as' + breakLengthString);
    });
  }
}

// Clear all currently recorded shifts
function clearShifts()
{
  // Set hours and pay to 0
  totalHours = 0.0;
  totalPay = 0.0;
  // Update HTML
  document.getElementById("hours").innerHTML = totalHours.toFixed(2);
  document.getElementById("pay").innerHTML = "$" + totalPay.toFixed(2);

  // Remove all shifts displayed in table
  var table = document.getElementById("shiftTable");
  var noRows = (table.rows.length - 1);
  for (var i = 0; i < noRows; i++)
  {
    table.deleteRow(1);
  }
}

// Update table to display a shift
function updateTable(start, end, length, rate, totalpay)
{
  var table = document.getElementById("shiftTable");
  var row = table.insertRow(1);
  var startcell = row.insertCell(0);
  var endcell = row.insertCell(1);
  var lengthcell = row.insertCell(2);
  var ratecell = row.insertCell(3);
  var totalpaycell = row.insertCell(4);

  // Set cells to display relevant information
  startcell.innerHTML = start;
  endcell.innerHTML = end;
  lengthcell.innerHTML = length;
  ratecell.innerHTML = rate;
  totalpaycell.innerHTML = totalpay;

}

// Update list to show pay rates entered
function updateList()
{
  var newPay = form.newpayrate.value;
  
  // check valid input
  reg = /[0-9]+(\.[0-9][0-9]?)?/;
  if (!newPay.match(reg))
  {
    alert("Please enter a valid number with up to 2 decimal places");
    form.newpayrate.focus();
  } 
  else
  {
    // Enter pay onto list
    var option = document.createElement("option");
    var list = document.getElementById("payrate");
    option.text = newPay.match(reg)[0];
    // Add to HTML
    list.add(option);

    // Add to array to be saved
    savedPays.push(option.text);

    // Add to google chrome storage
    chrome.storage.sync.set({myPays: savedPays}, function(){
      console.log('Pay saved' + savedPays);
    });
  }
}

// Clear all entered pay rates
function clearPayRates()
{
  var select = document.getElementById("payrate")
  var length = select.options.length

  var i;
  for(i = length-1; i > 0 ; i--)
  {
    select.remove(i);
  }

  savedPays = [];
  // Clear from chrome storage
  chrome.storage.sync.set({
    myPays:savedPays
  }, function(){
    console.log("cleared stored pays!")
  })
}