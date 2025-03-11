# Updates to the All Users Page

## Changes Made

1. **Fixed Delete User Functionality**
   - The delete button is now only visible to users with the "headman" role
   - Added better error messages when deletion fails
   - Added permission checks to prevent unauthorized deletion attempts

2. **Implemented PDF Export Functionality**
   - Added the ability to generate and download a PDF file with user data
   - The PDF includes a title, date, and formatted table of users
   - Added pagination for large datasets

## Installation Instructions

To enable the PDF export functionality, you need to install the following packages:

```bash
cd frontend
npm install jspdf jspdf-autotable
```

## Usage

### Delete User
- Only users with the "headman" role can see and use the delete button
- Click the delete button to open a confirmation dialog
- Confirm to delete the user

### Export PDF
- Click the "Export PDF" button in the top right corner
- A PDF file will be generated and downloaded automatically
- The PDF contains all users currently visible in the table (after filtering)

## Troubleshooting

If you encounter any issues:

1. Make sure you have installed the required packages
2. Check that you have the correct permissions (headman or assistant for PDF export, headman only for delete)
3. Check the browser console for any error messages