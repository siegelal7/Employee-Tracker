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
    roleId INT NOT NULL,
    managerId INT NULL,
    PRIMARY KEY(id)
);
-- TODO: delete all this tester stuff
SELECT e.firstName, r.title, r.salary, d.departmentName, em.firstName AS "manager"
FROM employee e
LEFT JOIN employee em ON em.id = e.managerId
INNER JOIN role r ON e.roleId = r.id
INNER JOIN department d ON r.departmentId = d.id;

INSERT INTO department (departmentName) VALUES ("HR");
INSERT INTO role (title,salary, departmentId) VALUES ("Imminent Archon", 75000.23, 1);
INSERT INTO employee (firstName, lastName, roleId, managerId) VALUES ("Andrew", "Siegel", 2, 0);
INSERT INTO employee (firstName, lastName, roleId, managerId) VALUES ("Tester", "Employee", 1, 1);
SELECT * FROM role;

INSERT INTO role (title,salary, departmentId) VALUES ("Test role", 23423.00, 1);

SELECT role.title, role.salary, department.departmentName
FROM role
INNER JOIN department ON role.departmentId = department.id;


