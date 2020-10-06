const inquirer = require("inquirer");
const mysql = require("mysql");
const consoleTable = require("console.table");
var resId;

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
let departments = [];
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
  allEmployees();
  allDepartments();
  init();
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
          "Add/Remove a department",
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
  } else if (data.action === "Add/Remove a department") {
    editDepartments();
  } else if (data.action === "Update employee manager") {
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
      // adding where d.departmentName= ? gave me odd results here..
      const query = connection.query(
        `SELECT e.id, Concat(e.firstName, " ", e.lastName) as "name", r.title, d.departmentName AS "department", d.id, CONCAT(em.firstName, " ",em.lastName) AS "manager"
        FROM employee e
        INNER JOIN role r ON e.roleId = r.id
        inner join department d on r.departmentId = d.id
        LEFT JOIN employee em ON em.id = e.managerId;`,
        // [data.department],
        function (err, res) {
          if (err) throw err;
          if (res.length > 1) {
            console.table(res);
          } else if (res.length == 0) {
            console.log(`\n\nNo one in that department\n\n`);
          }
          const meetCriteria = [];
          // console.log(data.department);
          for (let i = 0; i < res.length; i++) {
            if (res[i].department == data.department) {
              meetCriteria.push(res[i]);
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
      const query = connection.query(
        `SELECT e.FirstName, e.lastName, r.title, CONCAT(em.firstName, " ", em.lastName) AS "manager"
        FROM employee e
        INNER JOIN role r ON r.id = e.roleId
        LEFT JOIN employee em ON e.managerId = em.id
        `,
        function (err, res) {
          if (err) throw err;
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
  if (data.roleId === 1 || data.roleId === 2) {
    return 1;
  } else if (data.roleId === 7 || data.roleId === 8) {
    return 2;
  } else if (data.roleId === 5 || data.roleId === 6) {
    return 3;
  } else if (data.roleId === 3 || data.roleId === 4) {
    return 4;
  }
  // if (data.departmentName === "Sales") {
  //   return 1;
  // } else if (data.departmentName === "Legal") {
  //   return 2;
  // } else if (data.departmentName === "Finance") {
  //   return 3;
  // } else if (data.departmentName === "Engineering") {
  //   return 4;
  // }
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
    }
  });
}

function allDepartments() {
  connection.query("SELECT * FROM department", function (err, res) {
    if (err) throw err;

    for (let i = 0; i < res.length; i++) {
      const emp = `${res[i].departmentName}`;
      departments.push(emp);
    }
  });
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
      employees = employees.filter((i) => i !== data.remove);
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

          init();
        }
      );
    });
}

function editDepartments() {
  inquirer
    .prompt([
      {
        type: "list",
        message: "Would you like to add or remove a department?",
        choices: ["add", "remove"],
        name: "addOrRemove",
      },
    ])
    .then(function (res) {
      if (res.addOrRemove === "add") {
        addDepartment();
      } else if (res.addOrRemove === "remove") {
        removeDepartment();
      }
    });
}

function addDepartment() {
  inquirer
    .prompt([
      {
        type: "input",
        message: "What department would you like to add?",
        name: "department",
      },
    ])
    .then(function (data) {
      departments.push(data.department);
      console.log(`Depts: ${departments}`);

      // console.log("Updating employee role...\n");
      var query = connection.query(
        "insert into department (departmentName) values (?)",
        [data.department],
        function (err, res) {
          if (err) throw err;
          console.log(res.affectedRows + " department added!\n");
          init();
        }
      );
      console.log(query.sql);
    });
}

function removeDepartment() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "departmentToRemove",
        choices: departments,
        message: "Which department would you like to remove",
      },
    ])
    .then(function (data) {
      departments = departments.filter((i) => i !== data.departmentToRemove);
      console.log("\ndepartments:", departments);
      connection.query(
        "delete from department where ?",
        [{ departmentName: data.departmentToRemove }],
        function (err, res) {
          if (err) throw err;
          console.log(`Removed ${data.departmentToRemove}`);
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
          init();
        }
      );
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
    .then(async function (data) {
      const firstName = data.who.split(" ")[0];
      const lastName = data.who.split(" ")[1];
      const query = connection.query(
        "UPDATE employee SET ? WHERE ? AND ?",
        [
          {
            managerId: await determineId(data.manager),
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
  return new Promise((resolve, reject) => {
    connection.query("SELECT * FROM employee", function (err, res) {
      if (err) reject(err);
      for (let i = 0; i < res.length; i++) {
        if (
          res[i].firstName === data.split(" ")[0] &&
          res[i].lastName === data.split(" ")[1]
        ) {
          resId = res[i].id;
        }
      }
      resolve(resId);
    });
  });
}

// allEmployees();
// allDepartments();
// init();
