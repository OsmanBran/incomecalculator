/* Global Variables */
var totalHours = 0.0; // total hours for period
var totalPay = 0.0; // total pay for period

/* Storage stuff */
// Global list
var savedPays = [];

// Retrieve stuff
window.onload = function() {
  var defaultValue = [];
  chrome.storage.sync.get({'myPays': defaultValue}, function(data){
    savedPays = data.myPays;
    console.log('savedPays loaded');
  })

  for (var i = 0; i < savedPays.length; i++){
    // Enter pay onto list
    var option = document.createElement("option");
    var list = document.getElementById("payrate");
    option.text = savedPays[i];
    // Add to HTML
    list.add(option);
  }
}

// Set stuff // important move this to appropriate place (probably where you ads in list)
//https://stackoverflow.com/questions/31122797/making-an-array-in-chrome-storage-and-retrieving-data?lq=1

// Learn how to display a list using a javascript array
//https://stackoverflow.com/questions/28677745/make-a-html-unordered-list-from-javascript-array/28677901

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
    if (difference >= breakFloat)
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
    savedPays.push(option);

    // Add to google chrome storage
    chrome.storage.sync.set({'myPays': savedPays}, function(){
      console.log('Pay saved');
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
}