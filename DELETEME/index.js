const inquirer = require("inquirer");
const mysql = require("mysql");
const items = [];

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Gobraves",
  database: "itemsDB",
});

connection.connect(function (err) {
  if (err) throw err;
  console.log("connected as id" + connection.threadId);
  //FIXME: here functions
});

function promptUser() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: ["Post an item", "Bid on an item", "Exit"],
      },
    ])
    .then(function (data) {
      //   console.log(data.action);
      if (data.action === "Bid on an item") {
        retrieveItems();
      } else if (data.action === "Post an item") {
        promptPostItems();
      } else {
        connection.end();
      }
    });
}
promptUser();

function retrieveItems() {
  connection.query("SELECT * FROM products", function (err, res) {
    if (err) throw err;
    for (let i = 0; i < res.length; i++) {
      items.push(res[i].productName);
      //   console.log(`${res[i].productName}`);
    }
    //FIXME:
    console.log(items);
    acceptBids();

    // connection.end();
  });
}

function acceptBids() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "chosenProduct",
        choices: items,
        message: "Enter which product to bid on by id",
      },
      {
        type: "number",
        name: "bidAmount",
        message: "How much would you like to bid?",
      },
    ])
    .then(function (data) {
      //   console.log(data);
      //FIXME: funciton here

      determineIfBidIsLargerThanMin(data);
      //   updateProduct(data);
    });
}

function determineIfBidIsLargerThanMin(data) {
  connection.query(
    "SELECT minBid FROM products WHERE ?",
    {
      productName: data.chosenProduct,
    },
    function (err, res) {
      if (err) throw err;
      //   if ()
      const minBid = res[0].minBid;
      if (minBid > data.bidAmount) {
        console.log("bid too low");
        acceptBids();
      } else {
        console.log("bid placed you are the highest bidder!");
        updateProduct(data);
        // connection.end();
      }
    }
  );
}

function updateProduct(data) {
  // console.log("Updating all Rocky Road quantities...\n");

  var query = connection.query(
    "UPDATE products SET ? WHERE ?",
    [
      {
        currentBid: data.bidAmount,
      },
      {
        productName: data.chosenProduct,
      },
    ],
    function (err, res) {
      if (err) throw err;
      console.log(res.affectedRows + " products updated!\n");
      // Call deleteProduct AFTER the UPDATE completes
      // deleteProduct();
    }
  );
  console.log(query.sql);
  //   connection.end();
}

function promptPostItems() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "productName",
        message: "Enter the product name:",
      },
      {
        type: "number",
        name: "productPrice",
        message: "Enter the minimum price desired:",
      },
    ])
    .then(function (data) {
      //FIXME: funciton
      createProduct(data);
    });
}

function createProduct(data) {
  console.log("Inserting a new product...\n");
  var query = connection.query(
    "INSERT INTO products SET ?",
    {
      productName: data.productName,
      minBid: data.productPrice,
    },
    function (err, res) {
      if (err) throw err;
      console.log(res.affectedRows + " product inserted!\n");
      // Call updateProduct AFTER the INSERT completes
      //   updateProduct();
    }
  );

  // logs the actual query being run
  console.log(query.sql);
  promptUser();
  //   connection.end();
}
