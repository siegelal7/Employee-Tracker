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
let employees = [];

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

// const employees = allEmployees() || [];

// console.log(employees);
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
          "Exit",
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
    viewByManager();
  } else if (data.action === "Add employee") {
    addEmployee();
  } else if (data.action === "Remove employee") {
    removeEmployee();
  } else if (data.action === "Update employee role") {
    updateEmployeeRole();
  } else if (data.action === "Update employee manager") {
    //TODO: figure out how to do this function
    updateManager();
  } else if (data.action === "Exit") {
    connection.end();
  }
};

const viewAll = () => {
  connection.query(
    `SELECT e.id, e.firstName, e.lastName, r.title, r.salary, d.departmentName, CONCAT(em.firstName, " ",em.lastName) AS "manager"
      FROM employee e
      LEFT JOIN employee em ON em.id = e.managerId
      INNER JOIN role r ON e.roleId = r.id
      INNER JOIN department d ON r.departmentId = d.id`,
    function (err, res) {
      if (err) throw err;
      console.table(res);
      init();
    }
  );
};

//FIXME:
const viewByDept = () => {
  inquirer
    .prompt([
      {
        type: "list",
        message: "Which department would you like to search?",
        name: "department",
        choices: departments,
      },
    ])
    .then(function (data) {
      // console.log(JSON.stringify(data) + "\n");
      const query = connection.query(
        `SELECT e.id, e.firstName, e.lastName, d.departmentName AS "department"
  FROM employee e
  INNER JOIN department d
  ON e.roleId = d.id;`,
        function (err, res) {
          if (err) throw err;
          console.log(res);
          const meetCriteria = [];
          // console.log(data.department);
          for (let i = 0; i < res.length; i++) {
            if (res[i].department == data.department) {
              // console.table(res[i]);
              meetCriteria.push(res[i]);
              // init();
            }
          }
          if (meetCriteria.length > 0) {
            console.table(meetCriteria);
            init();
          } else {
            console.log("No one in that department");
            init();
          }
        }
      );
    });
};

const viewByManager = () => {
  inquirer
    .prompt([
      {
        type: "list",
        message: "Choose a manager to search by:",
        name: "manager",
        choices: employees,
      },
    ])
    .then(function (data) {
      const meetCriteria = [];
      const surname = data.manager.split(" ")[1];
      // console.log(surname);
      const query = connection.query(
        `SELECT e.FirstName, e.lastName, r.title, CONCAT(em.firstName, " ", em.lastName) AS "manager"
        FROM employee e
        INNER JOIN role r ON r.id = e.roleId
        LEFT JOIN employee em ON e.managerId = em.id
        `,
        function (err, res) {
          if (err) throw err;
          // console.log("someting happened");
          // console.log(res[3].manager);
          for (let i = 0; i < res.length; i++) {
            if (res[i].manager == data.manager) {
              meetCriteria.push(res[i]);
            }
          }
          if (meetCriteria.length > 0) {
            console.table(meetCriteria);
            init();
          } else {
            console.log("That person doesn't manage any employees");
            init();
          }
        }
      );
    });
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
      const first = data.firstName;
      const last = data.lastName;
      employees.push(`${first} ${last}`);
      const query = connection.query(
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

function determineDepartmentId(data) {
  if (data.departmentName === "Sales") {
    return 1;
  } else if (data.departmentName === "Legal") {
    return 2;
  } else if (data.departmentName === "Finance") {
    return 3;
  } else if (data.departmentName === "Engineering") {
    return 4;
  }
}

function determineRoleId(data) {
  if (data.role === "Salesperson") {
    return 1;
  } else if (data.role === "Sales Lead") {
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

function allEmployees() {
  connection.query("SELECT * FROM employee", function (err, res) {
    if (err) throw err;

    for (let i = 0; i < res.length; i++) {
      const emp = `${res[i].firstName} ${res[i].lastName}`;
      employees.push(emp);
      // return employees;
    }
    // return employees;
    // return res;
  });
  // console.log(employees);
}

function removeEmployee() {
  inquirer
    .prompt([
      {
        type: "list",
        message: "Which employee would you like to remove",
        name: "remove",
        choices: employees,
      },
    ])
    .then(function (data) {
      // console.log(data);
      employees = employees.filter((i) => i !== data.remove);
      // console.log(employees);
      console.log(`Deleting all ${data.remove.split(" ")[0]}...\n`);
      const firstName = data.remove.split(" ")[0];
      const lastName = data.remove.split(" ")[1];
      const query = connection.query(
        "DELETE FROM employee WHERE ? AND ?",
        [
          {
            firstName: firstName,
          },
          {
            lastName: lastName,
          },
        ],
        function (err, res) {
          if (err) throw err;
          console.log(res.affectedRows + " employees deleted!\n");
          // Call readProducts AFTER the DELETE completes
          init();
        }
      );
    });
}

function updateEmployeeRole() {
  inquirer
    .prompt([
      {
        type: "list",
        message: "Which employee would you like to update",
        name: "remove",
        choices: employees,
      },
      {
        type: "list",
        message: "Choose a new role:",
        name: "role",
        choices: roles,
      },
    ])
    .then(function (data) {
      console.log(`Updating ${data.remove.split(" ")}...\n`);
      const firstName = data.remove.split(" ")[0];
      const lastName = data.remove.split(" ")[1];
      console.log("Updating employee role...\n");
      // console.log(data.role);
      // let roleId = determineRoleId(data.role);
      var query = connection.query(
        "UPDATE employee SET ? WHERE ? AND ?",
        [
          {
            roleId: determineRoleId(data),
          },
          {
            firstName: firstName,
          },
          {
            lastName: lastName,
          },
        ],
        function (err, res) {
          if (err) throw err;
          console.log(res.affectedRows + " employees updated!\n");
          // Call deleteProduct AFTER the UPDATE completes
          init();
        }
      );

      // logs the actual query being run
      console.log(query.sql);
    });
}

//FIXME:
function updateManager() {
  inquirer
    .prompt([
      {
        type: "list",
        message: "Which employee would you like to update the manager for?",
        name: "who",
        choices: employees,
      },
      {
        type: "list",
        message: "Who will be the manager?",
        name: "manager",
        choices: employees,
      },
    ])
    .then(function (data) {
      // console.log(data.who);
      const firstName = data.who.split(" ")[0];
      const lastName = data.who.split(" ")[1];
      // console.log(`\n${data.manager}\n`);
      // console.log(data);
      // console.log(`\n${data.manager}\n`);
      const managerId = determineId(data.manager);
      const query = connection.query(
        "UPDATE employee SET ? WHERE ? AND ?",
        [
          {
            //FIXME: not working for some reason
            managerId: managerId,
          },
          {
            firstName: firstName,
          },
          {
            lastName: lastName,
          },
        ],
        function (err, res) {
          if (err) throw err;
          console.log(res.affectedRows + " employees updated.\n");
          init();
        }
      );
      console.log(query.sql);
    });
}

function determineId(data) {
  connection.query("SELECT * FROM employee", function (err, res) {
    if (err) throw err;
    // console.log(res);
    // let resId = "";
    for (let i = 0; i < res.length; i++) {
      if (
        res[i].firstName == data.split(" ")[0] &&
        res[i].lastName == data.split(" ")[1]
      ) {
        console.log(`\n${res[i].id}\n`);
        return res[i].id;
      } else {
        console.log("hmm");
        return 1;
      }
    }
    // return resId;
  });
}
// determineId("Peenur Snout");
allEmployees();
init();
