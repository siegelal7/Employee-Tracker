const inquirer = require("inquirer");
const mysql = require("mysql");
const consoleTable = require("console.table");

const roles = [
  "Sales Lead",
  "Salesperson",
  "Lead Engineer",
  "Software Engineer",
  "Account Manager",
  "Accountant",
  "Legal Team Lead",
  "Lawyer",
];
const departments = ["Finance", "Engineering", "Sales", "Legal"];

const employees = [];

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Gobraves",
  database: "employeesDB",
});

connection.connect(function (err) {
  if (err) throw err;
  console.log("connected as id" + connection.threadId);
});

function init() {
  inquirer
    .prompt([
      {
        type: "list",
        message: "What would you like to do?",
        name: "action",
        choices: [
          "View all employees",
          "View all employees by department",
          "View all employees by manager",
          "Add employee",
          "Remove employee",
          "Update employee role",
          "Update employee manager",
        ],
      },
    ])
    .then(function (data) {
      determineAction(data);
    });
}

const determineAction = (data) => {
  //   console.table(data);
  if (data.action === "View all employees") {
    viewAll();
  } else if (data.action === "View all employees by department") {
    //TODO: figure out how to do this function
    viewByDept();
  } else if (data.action === "View all employees by manager") {
    //TODO: figure out how to do this function
    console.log("f");
  } else if (data.action === "Add employee") {
    //TODO: figure out how to do this function
    addEmployee();
  } else if (data.action === "Remove employee") {
    //TODO: figure out how to do this function
    console.log("f");
  } else if (data.action === "Update employee role") {
    //TODO: figure out how to do this function
    console.log("f");
  } else if (data.action === "Update employee manager") {
    //TODO: figure out how to do this function
    console.log("f");
  }
};

const viewAll = () => {
  //   connection.query(
  //     `SELECT e.id, e.firstName, r.title, r.salary, d.departmentName, em.firstName AS "manager"
  //     FROM employee e
  //     LEFT JOIN employee em ON em.id = e.managerId
  //     INNER JOIN role r ON e.roleId = r.id
  //     INNER JOIN department d ON r.departmentId = d.id`,
  //     function (err, res) {
  //       if (err) throw err;
  //       console.table(res);
  //     }
  //   );
  connection.query("SELECT * FROM employee", function (err, res) {
    if (err) throw err;
    console.table(res);
  });
};

const viewByDept = () => {
  connection.query(`SELECT e.id, e.firstName, e.lastName, d.departmentName
  FROM employee e
  INNER JOIN department d
  ON e.roleId = d.id;`);
};

const addEmployee = () => {
  inquirer
    .prompt([
      {
        type: "input",
        message: "Enter employee first name:",
        name: "firstName",
      },
      {
        type: "input",
        message: "Enter employee last name:",
        name: "lastName",
      },
      {
        type: "list",
        message: "What is the new employee's role?",
        choices: roles,
        name: "role",
      },
      //   {
      //     type: "list",
      //     message: "Who is the employee's manager?",
      //     choices: employees,
      //     name: "manager",
      //   },
    ])
    .then(function (data) {
      employees.push(`${data.firstName} ${data.lastName}`);
      connection.query(
        "INSERT INTO employee SET ?",
        {
          firstName: data.firstName,
          lastName: data.lastName,
          roleId: determineRoleId(data),
        },
        function (err, res) {
          if (err) throw err;
          console.log(res.affectedRows + " employee inserted\n");
          init();
        }
      );
    });
};
function determineRoleId(data) {
  if (data.role === "Sales Lead") {
    return 1;
  } else if (data.role === "Salesperson") {
    return 2;
  } else if (data.role === "Lead Engineer") {
    return 3;
  } else if (data.role === "Software Engineer") {
    return 4;
  } else if (data.role === "Account Manager") {
    return 5;
  } else if (data.role === "Accountant") {
    return 6;
  } else if (data.role === "Legal Team Lead") {
    return 7;
  } else if (data.role === "Lawyer") {
    return 8;
  }
}

init();
