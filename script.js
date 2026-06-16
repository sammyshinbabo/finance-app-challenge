var transactions = []; // hold all the money records we get from the internet
var currentPage = 1; // keeps track of which page we are looking at
var itemsPerPage = 5; // only show 5 items per page

var tableBody = document.getElementById('table-body');
var paginationEl = document.getElementById('pagination');
var totalAmountEl = document.getElementById('total-amount');
var searchInput = document.getElementById('search-input');
var categorySelect = document.getElementById('category-select');
var modal = document.getElementById('modal');
var addBtn = document.getElementById('add-btn');
var cancelBtn = document.getElementById('cancel-btn');
var addForm = document.getElementById('add-form');

fetch('https://6784cce91ec630ca33a5b87f.mockapi.io/api/v1/data')
  .then(function(res) {
    return res.json();
  })
  .then(function(data) {
    transactions = data;
    updateCategoryDropdown();
    render();
  })
  .catch(function(err) {
    console.error("Couldn't load data:", err);
  });

// updateCategoryDropDown -> update the category dropdown according to the data or new record
function updateCategoryDropdown() {
  var categories = [];
  
  for (var i = 0; i < transactions.length; i++) {
    var cat = transactions[i].category;
    // if this category is not in our list add it
    if (categories.indexOf(cat) === -1) {
      categories.push(cat); 
    }
  }

  //set the dropdown to only have the default "All Categories" option.
  categorySelect.innerHTML = '<option value="">All Categories</option>';
  
  // create a new HTML option for every category we found.
  for (var j = 0; j < categories.length; j++) {
    var option = document.createElement('option');
    option.value = categories[j];
    option.textContent = categories[j];
    categorySelect.appendChild(option); //add this new option on the dropdwon
  }
}

//main function to draw the screen
function render() {
  var searchTerm = searchInput.value.toLowerCase();
  var filterCat = categorySelect.value;
  
  var filteredData = [];

  // go through all transactions to see which ones match the search and category.
  for (var k = 0; k < transactions.length; k++) {
    var tx = transactions[k];
    var matchSearch = tx.description.toLowerCase().includes(searchTerm);
    var matchCat = false; //start by guessing it does not match the category
    
    // if the user selected "All Categories" (blank) OR if the categories match exactly, it is a match.
    if (filterCat === "" || tx.category === filterCat) {
      matchCat = true;
    }
    // if both the search text AND the category match, save this item to our new list.
    if (matchSearch === true && matchCat === true) {
      filteredData.push(tx);
    }
  }

  //calculate total accordinginly
  var total = 0;
  for (var m = 0; m < filteredData.length; m++) {
    var currentTx = filteredData[m]
    var currentAmount = Number(currentTx.amount);
    // if the type is income or category (from the API) is deposit, add the amount to the total
    if (currentTx.type === "income" || currentTx.category === "deposit"){
      total = total + currentAmount
    }
    else {
      total = total - currentAmount
    }
  }
    // if the total is less than zero, we put the minus sign before the dollar sign
    if (total < 0) {
    totalAmountEl.textContent = "-$" + Math.abs(total).toFixed(2);
    } else {
    totalAmountEl.textContent = "$" + total.toFixed(2);
    }
  

  // pagination
  // calculate how many pages we need. (Total items divided by 5).
  var totalPages = Math.ceil(filteredData.length / itemsPerPage);   // rounds the number
  // if there is no data, we still want to show page 1
  if (totalPages === 0) {
    totalPages = 1;
  }
  // if the user is on a page that does not exist anymore (after searching), bring them back.
  if (currentPage > totalPages) {
    currentPage = totalPages;
  }
  // figure out where to start cutting the data list for the current page.
  var startIdx = (currentPage - 1) * itemsPerPage;
  var endIdx = startIdx + itemsPerPage;

  //drawing the table
  tableBody.innerHTML = '';
  //loop through the filtered data, but only for the 5 items that belong on this page.
  for (var n = startIdx; n < endIdx; n++) {
    if (n >= filteredData.length) break; 
    
    var currentTx = filteredData[n];
    var tr = document.createElement('tr');
    
    tr.innerHTML = 
      "<td style='color: grey;'>" + (n + 1) + "</td>" +
      "<td>" + currentTx.date + "</td>" +
      "<td>" + currentTx.description + "</td>" +
      "<td class='text-right' style='font-weight: 500;'>" + Number(currentTx.amount).toFixed(2) + "</td>" +
      "<td class='text-center'><span class='category-badge'>" + currentTx.category + "</span></td>";
      
    // put the finished row inside the table body on the screen
    tableBody.appendChild(tr);
  }

  //drawing the page button
  paginationEl.innerHTML = '';
  for (var p = 1; p <= totalPages; p++) {
    var btn = document.createElement('button');
    btn.textContent = p;
    
    // if this button is for the page we are looking at right now, highlight it by adding 'active'.
    if (p === currentPage) {
      btn.className = 'active';
    } else {
      btn.className = '';
    }
    // when the user clicks this page number, change the page and redraw everything
    btn.onclick = (function(page) {
      return function() {
        currentPage = page;
        render();
      }
    })(p);
    
    paginationEl.appendChild(btn);
  }
}
// when the user types in the search bar, jump back to page 1 and redraw
searchInput.addEventListener('input', function() { 
  currentPage = 1; 
  render(); 
});
// when the user changes the category dropdown, jump back to page 1 and redraw
categorySelect.addEventListener('change', function() { 
  currentPage = 1; 
  render(); 
});

// when the user clicks the blue 'Add +' button, show the popup window
addBtn.addEventListener('click', function() {
  modal.style.display = 'block'; 
});

// when the user clicks the 'Cancel' button in the popup, hide the popup and clear the form.
cancelBtn.addEventListener('click', function() {
  modal.style.display = 'none'; 
  addForm.reset();
});

// when the user clicks 'Submit' to save a new transaction
addForm.addEventListener('submit', function(e) {
  e.preventDefault();
  
  var newTx = {
    id: Date.now().toString(),
    date: document.getElementById('form-date').value,
    description: document.getElementById('form-desc').value,
    amount: Number(document.getElementById('form-amount').value),
    category: document.getElementById('form-category').value,
    type: document.getElementById('form-type').value
  };

  // put the new item at the very beginning of our data list
  transactions.unshift(newTx); 
  updateCategoryDropdown(); 
  
  modal.style.display = 'none'; 
  addForm.reset(); 
  currentPage = 1; 
  render(); // 
});