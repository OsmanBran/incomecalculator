/* Global Variables */
var totalHours = 0.0; // total hours for period
var totalPay = 0.0; // total pay for period
var isCustom = false;

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
customButton.addEventListener("click", updateCustomList);

// Change between pay sets
var paylist = document.getElementById("payset");
paylist.addEventListener("change", getPayRate);

// Display appropriate menu for choosing pay
function getPayRate()
{
  var list1 = document.getElementById("payset"); // List displaying lists of pay
  var list2 = document.getElementById("payratediv"); // List of retail pay
  var list3 = document.getElementById("custompay"); // List of custom pay
  var selectedPaySet = list1.options[list1.selectedIndex].value; // selected option

  if (selectedPaySet == "retail")
  {
    list2.style.display="inline-block";
    list3.style.display="none";
    isCustom = false;
  }
  else if (selectedPaySet == "custom")
  {
    list3.style.display="inline-block";
    list2.style.display="none";
    isCustom = true;
  }
}

// Validate shift start and end times as valid time formats
function validate()
{
  if(form.payset.value == "select")
  {
    alert("Please select pay rate");
    form.payset.focus();
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
  if(validate())
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
    var payRateString;
    // Determine which list is being used to select pay
    if (isCustom)
    {
      payRateString = form.custompayset.value
    }
    else
    {
      payRateString = form.payrate.value
    }
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

// Update list to show custom pay rates entered
function updateCustomList()
{
  var newPay = form.custompayrate.value;
  
  // check valid input
  reg = /[0-9]+(\.[0-9][0-9]?)?/;
  if (!newPay.match(reg))
  {
    alert("Please enter a valid number with up to 2 decimal places");
    form.custompayrate.focus();
  } 
  else
  {
    var option = document.createElement("option");
    var list = document.getElementById("custompayset");
    option.text = newPay.match(reg)[0];
    list.add(option);
  }
}
