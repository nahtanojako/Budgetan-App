let budgetController = ( () => {
  let Income = function(id, desc, value) {
    this.id = id;
    this.desc = desc;
    this.value = value;
  };

  let Expense = function(id, desc, value) {
    this.id = id;
    this.desc = desc;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercent = function(totalInc) {
    if(totalInc > 0){
      this.percentage = Math.round((this.value/totalInc) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercent = function() {
    return this.percentage;
  }

  let calcTotal = (type) => {
    let sum = 0;
    data.allItems[type].forEach(cur => sum += cur.value);
    data.totals[type] = sum;
  }

  let data = {
    allItems: {
      inc: [],
      exp: []
    },
    totals: {
      inc: 0,
      exp: 0
    },
    budget: 0,
    percentage: - 1
  };

  return {
    test: () => {
      console.log(data);
    },

    addItem: (type, des, val) => {
      let ID, newItem;

      if(data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      if(type === 'inc') {
        newItem = new Income(ID, des, val);
      } else if(type === 'exp') {
        newItem = new Expense(ID, des, val);
      }
      data.allItems[type].push(newItem);
      return newItem;
    },

    deleteItem: (type, id) => {
      let ids, index;
      ids = data.allItems[type].map(cur => cur.id);
      index = ids.indexOf(id)
      data.allItems[type].splice(index, 1);
    },

    calcBudget: () => {
      calcTotal('inc');
      calcTotal('exp');
      data.budget = data.totals.inc - data.totals.exp;
      if(data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp/data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calcPercentages: () => {
      data.allItems.exp.forEach(cur => cur.calcPercent(data.totals.inc));
    },

    getPercentages: () => {
      let allPerc = data.allItems.exp.map(cur => cur.getPercent());
      return allPerc;
    },

    getBudget: () => {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      }
    }

  };

})();


///////////////////////////////////////////////////
let UIController = ( () => {
  let strings = {
    inputType: '.add__type',
    inputDesc: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incWrap: '.income__list',
    expWrap: '.expenses__list',
    container: '.container',
    budgetLabel: '.budget__value',
    incLabel: '.budget__income--value',
    expLabel: '.budget__expenses--value',
    percentLabel: '.budget__expenses--percent',
    dateLabel: '.budget__title--month',
    expPercentLabel: '.item__percent'
  };

  let formatNumber = (num, type) => {
    var splitNum, int, dec, type;

    num = Math.abs(num);
    num = num.toFixed(2);

    splitNum = num.split('.');

    int = splitNum[0];
    if(int.length > 3) {
      // 123,456 = 6 > 3
      // 12,234 = 5 > 2
      // 1,234 = 4 > 1
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }

    dec = splitNum[1];

    return (type === 'inc' ? '+' : '-') + ` ${int}.${dec}`;
  };

  return {
    getStrings: () => {
      return strings;
    },

    getInput: () => {
      return {
        type: document.querySelector(strings.inputType).value,
        desc: document.querySelector(strings.inputDesc).value,
        value: parseFloat(document.querySelector(strings.inputValue).value)
      };
    },

    addListItem: (obj, type) => {
      let el, html, newHTML;

      if(type === 'inc') {
        el = strings.incWrap;
        html = '<div class="item" id="inc-%id%"><div class="item__description">%desc%</div><div class="right"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn">x</button></div></div></div>';
      } else if(type === 'exp') {
        el = strings.expWrap;
        html = '<div class="item" id="exp-%id%"><div class="item__description">%desc%</div><div class="right"><div class="item__value">%value%<span class="item__percent">10%</span></div><div class="item__delete"><button class="item__delete--btn">x</button></div></div></div>';
      }
      newHTML = html.replace('%id%', obj.id);
      newHTML = newHTML.replace('%desc%', obj.desc);
      newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));
      document.querySelector(el).insertAdjacentHTML('beforeend', newHTML);
    },

    deleteListItem: (selectorID) => {
      let el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearFields: () => {
      let fields = document.querySelectorAll(strings.inputDesc + ', ' + strings.inputValue);
      Array.from(fields).forEach(input => input.value = '');
      fields[0].focus();
    },

    changeType: () => {
      let fields = document.querySelectorAll(`${strings.inputType}, ${strings.inputDesc}, ${strings.inputValue}`);

      Array.from(fields).forEach(cur => cur.classList.toggle('red-focus'));
      document.querySelector(strings.inputBtn).classList.toggle('red');
    },

    displayBudget: (obj) => {
      let type;
      obj.budget > 0 ? type = 'inc' : type = 'exp';
      document.querySelector(strings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(strings.incLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(strings.expLabel).textContent = formatNumber(obj.totalExp, 'exp');
      if(obj.percentage > 0) {
        document.querySelector(strings.percentLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(strings.percentLabel).textContent = '---';
      }
    },

    displayDate: () => {
      let now, month, monthNames, year;
      now = new Date();
      month = now.getMonth();
      monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      year = now.getFullYear();
      document.querySelector(strings.dateLabel).textContent = `${monthNames[month]} ${year}`;
    },

    displayPercentages: (percentages) => {
      let fields = document.querySelectorAll(strings.expPercentLabel);
      Array.from(fields).forEach((cur, index) => {
        if(percentages[index] > 0){
          cur.textContent = percentages[index] + '%';
        } else {
          cur.textContent = '---';
        }
      });
    }
  };
})();


////////////////////////////////////////////////////////////////////////////
let controller = ( (budgetCtrl, UICtrl) => {

  let updatePercentages = () => {
    budgetCtrl.calcPercentages();
    let percentages = budgetCtrl.getPercentages();
    UICtrl.displayPercentages(percentages);
  };

  let updateBudget = () => {
    budgetCtrl.calcBudget();
    let budget = budgetCtrl.getBudget();
    UICtrl.displayBudget(budget);
  };

  let ctrlDeleteItem = (e) => {
    let itemID, splitID, type, ID;
    itemID = e.target.parentNode.parentNode.parentNode.id;
    if(itemID) {
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);
    }

    budgetCtrl.deleteItem(type, ID);
    UICtrl.deleteListItem(itemID);
    updateBudget();
    updatePercentages();
  };

  let ctrlAddItem = () => {
    let input;
    input = UICtrl.getInput();
    console.log(input);

    if(input.desc !== '' && input.value > 0 && !isNaN(input.value)) {
      UICtrl.clearFields();
      newItem = budgetCtrl.addItem(input.type, input.desc, input.value);
      UICtrl.addListItem(newItem, input.type);
      updateBudget();
      updatePercentages();
    }
  };

  let eventHandler = () => {
    let DOM = UICtrl.getStrings();
    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    document.addEventListener('keypress', (e) => {
      if(e.keyCode === 13 || e.which === 13){
        ctrlAddItem();
      }
    });
    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
  };

  return {
    init: () => {
      console.log('Application has started!');
      eventHandler();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      UICtrl.displayDate();
    }
  };
})(budgetController, UIController);


controller.init();
