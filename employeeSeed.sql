DROP DATABASE IF EXISTS employeesDB;

CREATE DATABASE employeesDB;

USE employeesDB;

CREATE TABLE department (
    id INT NOT NULL AUTO_INCREMENT,
    departmentName VARCHAR(30) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE role (
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(30) NOT NULL,
    salary DECIMAL(8,2),
    departmentId INT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE employee (
    id INT NOT NULL AUTO_INCREMENT,
    firstName VARCHAR(30) NOT NULL,
    lastName VARCHAR(30) NOT NULL,
    roleId INT NULL,
    managerId INT NULL,
    PRIMARY KEY(id)
);
INSERT INTO role (title,salary, departmentId) VALUES ("Salesperson", 52000.00, 1);
INSERT INTO role (title,salary, departmentId) VALUES ("Sales Lead", 61000.00, 1);
INSERT INTO role (title,salary, departmentId) VALUES ("Lead Engineer", 100000.00, 4);
INSERT INTO role (title,salary, departmentId) VALUES ("Software Engineer", 72000.00, 4);
INSERT INTO role (title,salary, departmentId) VALUES ("Account Manager", 71000.00, 3);
INSERT INTO role (title,salary, departmentId) VALUES ("Accountant", 67000.00, 3);
INSERT INTO role (title,salary, departmentId) VALUES ("Legal Team Lead", 102000.00, 2);
INSERT INTO role (title,salary, departmentId) VALUES ("Lawyer", 79000.00, 2);

INSERT INTO department (departmentName) VALUES ("Sales");
INSERT INTO department (departmentName) VALUES ("Legal");
INSERT INTO department (departmentName) VALUES ("Finance");
INSERT INTO department (departmentName) VALUES ("Engineering");

INSERT INTO employee (firstName, lastName, roleId) VALUES ("Andrew", "Siegel", 4);
INSERT INTO employee (firstName, lastName, roleId) VALUES ("Tester", "Employee", 1);
INSERT INTO employee (firstName, lastName, roleId) VALUES ("Amanda", "Newquist", 8);
INSERT INTO employee (firstName, lastName, roleId) VALUES ("David", "Siegel", 6);

SELECT e.id, e.firstName, r.title, r.salary, d.departmentName, em.firstName AS "manager"
FROM employee e
LEFT JOIN employee em ON em.id = e.managerId
INNER JOIN role r ON e.roleId = r.id
INNER JOIN department d ON r.departmentId = d.id;

INSERT INTO role (title,salary, departmentId) VALUES ("Test role", 23423.00, 1);

SELECT employee.firstName, employee.lastName, role.title, department.departmentName
FROM role
INNER JOIN department ON role.departmentId = department.id
INNER JOIN employee ON role.id = employee.roleId;

-- returning emp. if their roleId matches departmentId
SELECT e.id, e.firstName, e.lastName, d.departmentName
FROM employee e
INNER JOIN department d
ON e.roleId = d.id;
