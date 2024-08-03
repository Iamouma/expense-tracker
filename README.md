# CENTII Expense Tracker


CENTII is a comprehensive expense tracker application designed to help users manage their personal finances efficiently. It allows users to add, view, edit, and delete expenses, as well as filter expenses by month and download monthly reports. This README provides an overview of the project's features, setup instructions, and usage guidelines.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Frontend Components](#frontend-components)
- [Usage](#usage)
- [Screenshots](#screenshots)
- [License](#license)

## Features

- User authentication and authorization
- Add new expenses with details such as date, category, amount, and description
- View a list of all expenses
- Edit and delete existing expenses
- Filter expenses by month and year
- Pagination for easy navigation through expenses
- Download monthly expense reports in PDF format
- Responsive design for mobile and desktop

## Technologies Used

### Frontend

- HTML
- CSS
- JavaScript

### Backend

- Node.js
- Express.js
- MySQL

### Other Tools

- JWT for authentication
- Fetch API for AJAX requests

## Installation

### Prerequisites

- Node.js and npm installed on your machine
- MySQL database set up

### Steps

1. **Clone the repository:**
   ```sh
   git clone https://github.com/Iamouma/expense-tracker.git
   cd expense-tracker
   ```

2. **Install backend dependencies:**
   ```sh
   npm install
   ```

3. **Set up the MySQL database:**
   - Create a database named `centii_expense_tracker`
   - Import the provided SQL schema to create the necessary tables:
     ```sql
     CREATE TABLE users (
         user_id INT AUTO_INCREMENT PRIMARY KEY,
         username VARCHAR(50) NOT NULL,
         password VARCHAR(100) NOT NULL
     );

     CREATE TABLE expenses (
         expense_id INT AUTO_INCREMENT PRIMARY KEY,
         user_id INT,
         expenseDate DATE,
         category VARCHAR(50),
         amount DECIMAL(10, 2),
         description TEXT,
         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
         FOREIGN KEY (user_id) REFERENCES users(user_id)
     );
     ```

4. **Configure environment variables:**
   - Create a `.env` file in the root directory and add the following:
     ```
     PORT=3000
     JWT_SECRET=your_jwt_secret
     DB_HOST=localhost
     DB_USER=your_db_user
     DB_PASSWORD=your_db_password
     DB_NAME=centii_expense_tracker
     ```

5. **Run the backend server:**
   ```sh
   npm start
   ```

6. **Open the frontend:**
   - Open `index.html` in your preferred browser or serve it using a local server.

## Configuration

### Environment Variables

The `.env` file contains the following configuration variables:

- `PORT`: The port on which the backend server will run.
- `JWT_SECRET`: The secret key used for JWT authentication.
- `DB_HOST`: The hostname of the MySQL database.
- `DB_USER`: The username for the MySQL database.
- `DB_PASSWORD`: The password for the MySQL database.
- `DB_NAME`: The name of the MySQL database.

## Running the Application

1. **Start the backend server:**
   ```sh
   npm start
   ```

2. **Open the frontend:**
   - Open `index.html` in your preferred browser or serve it using a local server.

## API Endpoints

### User Authentication

- `POST /api/register`: Register a new user
- `POST /api/login`: Authenticate a user and return a JWT token

### Expense Management

- `POST /api/expenses`: Add a new expense
- `GET /api/expenses`: Retrieve all expenses for the authenticated user
- `GET /api/expenses/month/:year/:month`: Retrieve expenses for a specific month and year
- `PUT /api/expenses/:expense_id`: Edit an expense
- `DELETE /api/expenses/:expense_id`: Delete an expense
- `GET /api/expenses/report`: Download a monthly report

## Frontend Components

### HTML Files

- `index.html`: Home page
- `add_expense.html`: Page to add new expenses
- `edit_expense.html`: Page to edit existing expenses
- `login.html`: User login page

### JavaScript Files

- `app.js`: Main JavaScript file for frontend logic

### CSS Files

- `styles.css`: Main stylesheet for the application

## Usage

### Adding an Expense

1. Go to the "Add Expense" page.
2. Fill out the form with the expense details.
3. Click "Add Expense" to submit.

### Viewing Expenses

1. Go to the "Expense List" section on the "Add Expense" page.
2. View the list of all expenses with options to edit or delete.

### Filtering Expenses

1. Use the "Filter" section to select a month and year.
2. Click "Filter" to view expenses for the selected month.

### Pagination

- Use the "Previous" and "Next" buttons to navigate through the pages of expenses.

### Downloading a Report

1. Go to the "Download Monthly Report" section.
2. Select a month and year.
3. Click "Download Report" to download the report.

## Screenshots

Include screenshots of your application here to give users a visual overview.

## License

This project is licensed under the MIT License.


