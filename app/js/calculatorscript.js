var form = document.getElementById("form");
form.addEventListener("submit", function(evt){
  evt.preventDefault();
  addShift();
})

var clear = document.getElementById("clear");
clear.addEventListener("click", clearShifts);

var customButton = document.getElementById("custombutton");
customButton.addEventListener("click", updateCustomList);

var paylist = document.getElementById("payset");
paylist.addEventListener("change", getPayRate);

// initialise nummber of hours and pay
var totalHours = 0.0;
var totalPay = 0.0;
var isCustom = false;

function getPayRate()
{
  var list1 = document.getElementById("payset");
  var list2 = document.getElementById("payratediv");
  var list3 = document.getElementById("custompay")
  var selectedPaySet = list1.options[list1.selectedIndex].value;

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
    if (isCustom)
    {
      payRateString = form.custompayset.value
    }
    else
    {
      payRateString = form.payrate.value
    }
    var shiftPay = parseFloat(payRateString) * difference;
    totalPay = totalPay + shiftPay;
    document.getElementById("pay").innerHTML = "$" + totalPay.toFixed(2);

    updateTable(startString, endString, difference.toFixed(2), payRateString, shiftPay.toFixed(2));
  }
}

function clearShifts()
{
  totalHours = 0.0;
  totalPay = 0.0;
  document.getElementById("hours").innerHTML = totalHours.toFixed(2);
  document.getElementById("pay").innerHTML = "$" + totalPay.toFixed(2);

  var table = document.getElementById("shiftTable")
  var noRows = (table.rows.length - 1);
  for (var i = 0; i < noRows; i++)
  {
    table.deleteRow(1);
  }
}

function updateTable(start, end, length, rate, totalpay)
{
  var table = document.getElementById("shiftTable");
  var row = table.insertRow(1);
  var cell1 = row.insertCell(0);
  var cell2 = row.insertCell(1);
  var cell3 = row.insertCell(2);
  var cell4 = row.insertCell(3);
  var cell5 = row.insertCell(4);
  cell1.innerHTML = start;
  cell2.innerHTML = end;
  cell3.innerHTML = length;
  cell4.innerHTML = rate;
  cell5.innerHTML = totalpay;

}

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
  // error checking goes here on newPay
}
