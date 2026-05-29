# Student Management System - IRA SPARKS E.M. SCHOOL

A modern, secure, and intuitive web application for managing student information. It features a clean interface for adding, viewing, editing, and deleting student records, with all data stored securely in a Google Sheet.

## Features

- **Secure Admin Login**: Protects data with a username/password authentication system.
- **Session Management**: Uses secure, temporary tokens for all data operations.
- **Two-Factor Protection**: Requires a separate Admin PIN for critical actions like updating or deleting records.
- **Full CRUD Functionality**: Create, Read, Update, and Delete student records.
- **Real-time Search**: Instantly filter student records across all fields.
- **Data Dashboard**: At-a-glance statistics for total students, fees collected, and class count.
- **Responsive Design**: Fully functional on both desktop and mobile devices.
- **User-Friendly Interface**: Built with modern UI/UX principles for a smooth experience.

---

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Google Apps Script
- **Database**: Google Sheets

---

## Deployment Guide

This application has two parts: a **Backend** (Google Apps Script connected to a Google Sheet) and a **Frontend** (the web application files you see here). Follow these steps carefully to deploy the application.

### Step 1: Backend Setup (Google Sheet & Apps Script)

1.  **Create a Google Sheet**:
    *   Go to [sheets.google.com](https://sheets.google.com) and create a new, blank spreadsheet.
    *   Rename the spreadsheet to something meaningful, like "Student Data".
    *   The first sheet (tab) will be used as the database. Rename it from "Sheet1" to **`students`**.
    *   Set up the header row (the very first row) with the following exact column names:
        `id`, `name`, `class`, `section`, `admissionNumber`, `fatherName`, `phoneNumber`, `address`, `admissionFee`, `tuitionFee`, `cautionDeposit`, `totalFees`

2.  **Create the Google Apps Script**:
    *   With your Google Sheet open, go to the menu and click `Extensions` > `Apps Script`.
    *   A new script editor tab will open. Delete any boilerplate code (like `function myFunction() {}`).
    *   Go to the `google-apps-script` folder in this project and open the `Code.gs` file.
    *   Copy the **entire contents** of `Code.gs` and paste it into the Apps Script editor.

3.  **Configure the Script**:
    *   At the top of the `Code.gs` script you just pasted, you will see a `CONFIG` section.
    *   Change the placeholder values for `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `ADMIN_PIN` to your desired secret credentials.
    *   Ensure the `SHEET_NAME` matches the name of the sheet you configured in step 1 (e.g., `students`).

4.  **Deploy the Script as a Web App**:
    *   In the Apps Script editor, click the blue **"Deploy"** button and select **"New deployment"**.
    *   Click the gear icon next to "Select type" and choose **"Web app"**.
    *   In the configuration form:
        *   **Description**: Give it a name, like "Student Management App v1".
        *   **Execute as**: `Me`.
        *   **Who has access**: **`Anyone`**. (This is critical for the app to work).
    *   Click **"Deploy"**.
    *   Google will ask you to **"Authorize access"**. Click the button, choose your Google account, and on the "unsafe app" screen, click "Advanced" and then "Go to... (unsafe)". Grant the requested permissions.
    *   After authorizing, a "Deployment successfully updated" dialog will appear. **Copy the "Web app URL"**. This is your unique API endpoint.

### Step 2: Frontend Setup

1.  **Configure the Frontend**:
    *   Open the `config.ts` file in the project.
    *   You will see a constant named `SCRIPT_URL`.
    *   **Replace the placeholder URL** with the "Web app URL" you copied in the previous step.
    *   Ensure the `ADMIN_USERNAME` in this file matches the one you set in your Apps Script.

2.  **Deploy the Frontend**:
    *   This application is a static site. You can deploy all the files (`index.html`, `index.tsx`, etc.) to any static web hosting provider (like Netlify, Vercel, GitHub Pages, or a simple web server).
    *   Alternatively, for simple use, you can often just open the `index.html` file in a web browser.

Your application is now live and fully configured! You can log in using the credentials you set up and start managing your student data.
