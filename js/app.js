// Data Controller
var budgetCtrl = (function() {
  // Constructor for Expenses
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  // Calculate expense percentage
  Expense.prototype.calculatePercentage = function(totalIncome) {
    this.percentage =
      totalIncome > 0 ? Math.round((this.value / totalIncome) * 100) : -1;
  };

  // Get expense percentage
  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  // Constructor for Incomes
  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  // Data Structure
  var data = {
    items: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  // Calculate the total
  var calculateTotal = function(type) {
    // To store total sum
    var total = 0;

    // Calculate the sum of all item values
    data.items[type].forEach(function(item) {
      total += item.value;
    });

    // Update the total in the data
    data.totals[type] = total;
  };

  return {
    addItem: function(input) {
      // Create a new id
      var id = 0;

      if (data.items[input.type].length > 0) {
        id = data.items[input.type][data.items[input.type].length - 1].id + 1;
      }

      // Create a new item
      var newItem =
        input.type === 'exp'
          ? new Expense(id, input.description, input.value)
          : new Income(id, input.description, input.value);

      // Add the item to data
      data.items[input.type].push(newItem);

      // Return the item
      return newItem;
    },
    deleteItem: function(type, id) {
      // Loop through the correct array
      data.items[type].forEach(function(item, index, items) {
        // Find the item with the id
        if (item.id === id) {
          // Delete the item from the array
          items.splice(index, 1);
        }
      });
    },
    calculateBudget: function() {
      // Calculate income and expense totals
      calculateTotal('inc');
      calculateTotal('exp');

      // Calculate the budget
      data.budget = data.totals.inc - data.totals.exp;

      // Calculate the expense percentage
      data.percentage =
        data.totals.inc > 0
          ? Math.round((data.totals.exp / data.totals.inc) * 100)
          : -1;

      // Return the budget data
      return {
        budget: data.budget,
        percentage: data.percentage,
        totalIncome: data.totals.inc,
        totalExpenses: data.totals.exp
      };
    },
    calculatePercentages: function() {
      // Loop through all the expenses
      data.items.exp.forEach(function(expense) {
        // Calculate the percentage
        expense.calculatePercentage(data.totals.inc);
      });
    },
    getPercentages: function() {
      // Loop through the expenses
      return data.items.exp.map(function(item) {
        // Get each expense percentage
        return item.getPercentage();
      });
    },
    logData: function() {
      console.log(data);
    }
  };
})();

// UI Controller
var UICtrl = (function() {
  // Get the DOM elements
  var DOM = {
    date: document.querySelector('.budget__title--month'),
    budgetValue: document.querySelector('.budget__value'),
    percentageValue: document.querySelector('.budget__expenses--percentage'),
    incomeValue: document.querySelector('.budget__income--value'),
    expensesValue: document.querySelector('.budget__expenses--value'),
    inputType: document.querySelector('.add__type'),
    inputDescription: document.querySelector('.add__description'),
    inputValue: document.querySelector('.add__value'),
    submitButton: document.querySelector('.add__btn'),
    listsContainer: document.querySelector('.container'),
    incomeList: document.querySelector('.income__list'),
    expensesList: document.querySelector('.expenses__list')
  };

  // Format the numbers
  var formatNumber = function(number, type) {
    // Get the absolute part
    number = Math.abs(number);

    // Fix upto 2 decimal places
    number = number.toFixed(2);

    // Split the number into integer and decimal part
    var integer = number.split('.')[0];
    var decimal = number.split('.')[1];

    // Format the integer part
    if (integer.length > 3) {
      integer =
        integer.substr(0, integer.length - 3) +
        ',' +
        integer.substr(integer.length - 3, 3);
    }

    // Determine the sign
    var sign = type === 'inc' ? '+' : '-';

    // Return formatted number
    return sign + ' ' + integer + '.' + decimal;
  };

  return {
    DOM: DOM,
    updateDate: function() {
      // Create a new Date Object
      var now = new Date();

      // All the months
      var months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ];

      // Get current Month
      var month = months[now.getMonth()];

      // Get the current year
      var year = now.getFullYear();

      // Update the date in UI
      DOM.date.textContent = month + ' ' + year;
    },
    getInput: function() {
      // Return the input values
      return {
        type: DOM.inputType.value, // inc OR exp
        description: DOM.inputDescription.value,
        value: parseFloat(DOM.inputValue.value)
      };
    },
    changedType: function() {
      // Toggle input focus classes on input fields
      DOM.inputType.classList.toggle('red-focus');
      DOM.inputDescription.classList.toggle('red-focus');
      DOM.inputValue.classList.toggle('red-focus');

      // Toggle color class on submit button
      DOM.submitButton.classList.toggle('red');
    },
    addItem: function(item, type) {
      // Get the income list
      var list = DOM.incomeList;

      // Html template for income
      var html =
        '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

      // If item is an expense
      if (type === 'exp') {
        // Change the list to expenses
        list = DOM.expensesList;

        // Html template for expenses
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      // Replace placeholders with actual data
      var itemHtml = html.replace('%id%', item.id);
      itemHtml = itemHtml.replace('%description%', item.description);
      itemHtml = itemHtml.replace('%value%', formatNumber(item.value, type));

      // Insert the html into the List
      list.insertAdjacentHTML('beforeend', itemHtml);
    },
    deleteItem: function(elementId) {
      // Select the element by id
      var element = document.getElementById(elementId);

      // Remove the element
      element.parentNode.removeChild(element);
    },
    clearFields: function() {
      // Clear description and value fields
      DOM.inputDescription.value = '';
      DOM.inputValue.value = '';

      // Focus the description field
      DOM.inputDescription.focus();
    },
    updateBudget: function(budget) {
      // Update Total Budget
      DOM.budgetValue.textContent = formatNumber(
        budget.budget,
        budget.budget >= 0 ? 'inc' : 'exp'
      );

      // Update Total Income
      DOM.incomeValue.textContent = formatNumber(budget.totalIncome, 'inc');

      // Update Total Expenses
      DOM.expensesValue.textContent = formatNumber(budget.totalExpenses, 'exp');

      // Update Total Percentage
      DOM.percentageValue.textContent =
        budget.percentage > 0 ? budget.percentage + '%' : '---';
    },
    updatePercentages: function(percentages) {
      // Loop throught all the expenses percentage
      document
        .querySelectorAll('.item__percentage')
        .forEach(function(expensePercentage, index) {
          // Update the percentage
          expensePercentage.textContent =
            percentages[index] > 0 ? percentages[index] + '%' : '---';
        });
    }
  };
})();

// Global App Controller
var app = (function(budgetController, UIController) {
  // Add a new item
  var addItem = function() {
    // Get the input data
    var input = UIController.getInput();

    // Check for appropriate inputs
    if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
      // Create a new item and add to budget data
      var newItem = budgetController.addItem(input);

      // Add the item to the UI
      UIController.addItem(newItem, input.type);

      // Clear the input fields
      UIController.clearFields();

      // Update the budget
      updateBudget();

      // Update the percentages
      updatePercentages();
    }
  };

  // Delete an existing item
  var deleteItem = function(event) {
    // Get the element id
    var elementId = event.target.parentNode.parentNode.parentNode.parentNode.id;

    // Check if the element id exists
    if (elementId) {
      // Split the elementId into type and id
      var type = elementId.split('-')[0];
      var id = parseInt(elementId.split('-')[1]);

      // Delete the item from data
      budgetController.deleteItem(type, id);

      // Remove the item from UI
      UIController.deleteItem(elementId);

      // Update the budget
      updateBudget();
    }
  };

  // Calculate and update the budget
  var updateBudget = function() {
    // Calculate the budget in data
    var budget = budgetController.calculateBudget();

    // Update the budget in UI
    UIController.updateBudget(budget);
  };

  var updatePercentages = function() {
    // Calculate the percentages
    budgetController.calculatePercentages();

    // Get the percentages
    var percentages = budgetController.getPercentages();

    // Update the percentages in the UI
    UIController.updatePercentages(percentages);
  };

  // Setup all the event listeners
  var setupEventListeners = function() {
    // Click Listener for submit button
    UIController.DOM.submitButton.addEventListener('click', addItem);

    // Keypress event for enter key
    document.addEventListener('keypress', function(event) {
      // Check if the pressed key is Enter
      if (event.which === 13 || event.keyCode === 13) {
        addItem();
      }
    });

    // Click listener for lists container
    UIController.DOM.listsContainer.addEventListener('click', deleteItem);

    // Change listener for Type input
    UIController.DOM.inputType.addEventListener(
      'change',
      UIController.changedType
    );
  };

  return {
    init: function() {
      console.log('Application has started.');

      // Setup the Event Listeners
      setupEventListeners();

      // Update the date
      UIController.updateDate();

      // Update the budget
      UIController.updateBudget({
        budget: 0,
        percentage: -1,
        totalIncome: 0,
        totalExpenses: 0
      });
    }
  };
})(budgetCtrl, UICtrl);

// Initialize the app
app.init();
