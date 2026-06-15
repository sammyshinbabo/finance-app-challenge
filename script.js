var transactions = [];
var currentPage = 1;
var itemsPerPage = 5;

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

function updateCategoryDropdown() {
  var categories = [];
  
  for (var i = 0; i < transactions.length; i++) {
    var cat = transactions[i].category;
    if (categories.indexOf(cat) === -1) {
      categories.push(cat); 
    }
  }

  categorySelect.innerHTML = '<option value="">All Categories</option>';
  for (var j = 0; j < categories.length; j++) {
    var option = document.createElement('option');
    option.value = categories[j];
    option.textContent = categories[j];
    categorySelect.appendChild(option);
  }
}

function render() {
  var searchTerm = searchInput.value.toLowerCase();
  var filterCat = categorySelect.value;
  
  var filteredData = [];
  for (var k = 0; k < transactions.length; k++) {
    var tx = transactions[k];
    var matchSearch = tx.description.toLowerCase().includes(searchTerm);
    var matchCat = false;
    
    if (filterCat === "" || tx.category === filterCat) {
      matchCat = true;
    }
    
    if (matchSearch === true && matchCat === true) {
      filteredData.push(tx);
    }
  }

  var total = 0;
  for (var m = 0; m < filteredData.length; m++) {
    var currentTx = filteredData[m]
    var currentAmount = Number(currentTx.amount);
    if (currentTx.type === "income" || currentTx.category === "deposit"){
      total = total + currentAmount
    }
    else {
      total = total - currentAmount
    }
  }
    if (total < 0) {
    totalAmountEl.textContent = "-$" + Math.abs(total).toFixed(2);
    } else {
    totalAmountEl.textContent = "$" + total.toFixed(2);
    }
  

  var totalPages = Math.ceil(filteredData.length / itemsPerPage);
  if (totalPages === 0) {
    totalPages = 1;
  }
  if (currentPage > totalPages) {
    currentPage = totalPages;
  }
  
  var startIdx = (currentPage - 1) * itemsPerPage;
  var endIdx = startIdx + itemsPerPage;

  tableBody.innerHTML = '';
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
      
    tableBody.appendChild(tr);
  }

  paginationEl.innerHTML = '';
  for (var p = 1; p <= totalPages; p++) {
    var btn = document.createElement('button');
    btn.textContent = p;
    
    if (p === currentPage) {
      btn.className = 'active';
    } else {
      btn.className = '';
    }
    
    btn.onclick = (function(page) {
      return function() {
        currentPage = page;
        render();
      }
    })(p);
    
    paginationEl.appendChild(btn);
  }
}

searchInput.addEventListener('input', function() { 
  currentPage = 1; 
  render(); 
});

categorySelect.addEventListener('change', function() { 
  currentPage = 1; 
  render(); 
});

addBtn.addEventListener('click', function() {
  modal.style.display = 'block'; 
});

cancelBtn.addEventListener('click', function() {
  modal.style.display = 'none'; 
  addForm.reset();
});

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

  transactions.unshift(newTx); 
  updateCategoryDropdown(); 
  
  modal.style.display = 'none'; 
  addForm.reset(); 
  currentPage = 1; 
  render(); // 
});