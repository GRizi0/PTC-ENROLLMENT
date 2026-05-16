# HCI-PTC Enrollment System

A complete web-based enrollment management system for the Professional Training Center (PTC) with separate student and admin portals.

## Features

### Student Portal
- **User Authentication**
  - Email/password login and registration
  - OAuth UI support (Google/Facebook ready)
  - Secure session management

- **Enrollment Management**
  - Select enrollment type (Freshmen, Regular, Transferee)
  - Confirmation workflow before proceeding
  - Track enrollment progress with visual steps

- **Profile Management**
  - Personal information (name, email, phone, DOB)
  - Address details
  - Gender and civil status
  - Editable and savable profile

- **Document Submission**
  - Multi-step submission workflow
  - Upload required documents (Form 138, Birth Certificate, Good Moral, Valid ID)
  - File preview before final submission
  - Document status tracking (Pending, Approved, Rejected)

- **Real-time Notifications**
  - Automatic notifications on document status changes
  - Enrollment status updates
  - Unread notification badge
  - Mark all as read functionality

- **Subject Enrollment**
  - View enrolled subjects after approval
  - Subject details (code, name, units, instructor, schedule, room)
  - Different subject lists based on enrollment type

### Admin Portal
- **Dashboard Overview**
  - Total applicants count
  - Pending applications
  - Approved enrollments
  - Rejected applications
  - Enrolled students
  - Recent notifications and enrollments

- **Student Management**
  - View all student records
  - Edit student enrollment status
  - Delete student accounts
  - Search and filter by name, email, or ID
  - Filter by enrollment type and status

- **Course & Subject Management**
  - Add new courses with code and description
  - Add subjects with units
  - View course and subject lists
  - Delete courses and subjects
  - Manage subject units and descriptions

- **Document Verification**
  - Review uploaded student documents
  - Approve or reject documents
  - View document details
  - Search and filter documents by status
  - Auto-notify students on verification status

- **Application Management**
  - View all enrollment applications
  - Track application status (Pending, Approved, Rejected)
  - Approve or reject applications
  - See document counts per application
  - Search by student name and filter by type

- **Notification System**
  - Recent admin notifications
  - Track student submissions
  - Monitor application status changes
  - Notification history

## Architecture

### Technology Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Storage**: LocalStorage (browser-based data persistence)
- **No Backend**: All data is stored locally in the browser

### Data Structure
```javascript
{
  currentUser: { fullName, email, phone, dob, gender, civilStatus, address, city, province, postal },
  userRole: "student" | "admin",
  enrollmentType: "Freshmen" | "Regular" | "Transferee",
  students: [{ id, fullName, email, phone, type, status, dateEnrolled }],
  documents: [{ id, studentId, studentName, type, status, uploadDate }],
  applications: [{ id, studentId, studentName, enrollmentType, status, applicationDate }],
  accounts: [{ fullName, email, password }],
  notifications: [{ id, userId, type, title, message, status, timestamp }],
  courses: [{ id, code, name, description }],
  subjects: [{ id, code, name, units }]
}
```

## Getting Started

### Opening the System
1. Open `index.html` in a modern web browser
2. Choose between Student Portal or Admin Portal
3. Login with demo credentials:
   - **Student**: Sign up with any email and password
   - **Admin**: ID: `admin`, Password: `admin123`

### Student Workflow
1. **Login/Register** → Create account or login
2. **Select Enrollment Type** → Choose Freshmen, Regular, or Transferee
3. **Update Profile** → Fill in personal information
4. **Submit Requirements** → Upload required documents
5. **Monitor Status** → Check notifications for verification status
6. **View Subjects** → See enrolled subjects after approval

### Admin Workflow
1. **Login** → Use admin credentials
2. **Monitor Dashboard** → Review statistics and recent activities
3. **Manage Students** → View, edit, or delete student records
4. **Verify Documents** → Approve or reject submitted documents
5. **Process Applications** → Approve or reject enrollment applications
6. **Manage Courses** → Add and manage courses and subjects

## Demo Data

The system comes pre-loaded with demo data:

### Demo Students
- Maria Santos (STU001) - Freshmen - Approved
- Juan Dela Cruz (STU002) - Regular - Pending
- Ana Garcia (STU003) - Transferee - Approved

### Demo Documents
- Form 138 (Maria) - Approved
- Birth Certificate (Juan) - Pending
- Good Moral (Ana) - Approved

### Demo Applications
- All demo students have applications with matching statuses

## Features Breakdown

### Notification System
- **Student Notifications**: Track document verification, approval/rejection
- **Admin Notifications**: Track new submissions, pending actions
- **Automatic Triggers**: Notifications sent when:
  - Student submits documents
  - Admin approves/rejects documents
  - Admin approves/rejects application
  - Student enrollment status changes

### File Upload System
- Drag-and-drop style file upload UI
- File preview (name and size)
- Support for PDF, JPG, PNG formats
- Client-side file handling

### Progress Tracking
- Visual progress steps for student enrollment
- Shows: Selection → Profile → Documents → Review → Approval
- Status indicators: Pending, In Progress, Complete

### Search & Filter
- Student search by name, email, or ID
- Document search by student name
- Application search by student name
- Filter by status, type, and enrollment category

## Responsive Design

The system is fully responsive:
- **Desktop**: Full sidebar navigation, multi-column layouts
- **Tablet**: Adjusted spacing, flexible grids
- **Mobile**: Collapsible layouts, single column (sidebar hidden)

## Color Scheme

- **Primary**: #2c3e50 (Dark Blue)
- **Secondary**: #3498db (Light Blue)
- **Success**: #27ae60 (Green)
- **Warning**: #f39c12 (Orange)
- **Danger**: #e74c3c (Red)
- **Info**: #16a085 (Teal)

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Modern mobile browsers

## Storage Note

All data is stored in browser's LocalStorage. The data persists until:
- Browser cache is cleared
- LocalStorage is manually cleared
- Browser is set to private mode (data lost on exit)

## Status Badges

- **Pending** (Yellow): Awaiting action
- **Approved** (Green): Successfully approved
- **Rejected** (Red): Rejected by admin
- **Under Review** (Blue): Currently being reviewed

## Testing Credentials

### Admin Login
- **Admin ID**: admin
- **Password**: admin123

### Student Account
- Create any account with valid email during signup
- Demo students already exist with their credentials

## Future Enhancements

- Backend integration with database
- Email notifications
- PDF document generation
- Payment gateway integration
- SMS notifications
- Admin audit logs
- Advanced analytics
- Bulk student import
- Document scanning and OCR
- API integration

## File Structure

```
HCI-PTC-ENROLMMENT/
├── index.html                 # Landing page
├── student-login.html         # Student authentication
├── student-selection.html     # Enrollment type selection
├── student-dashboard.html     # Student main portal
├── admin-login.html           # Admin authentication
├── admin-dashboard.html       # Admin main portal
├── script.js                  # All JavaScript logic
├── styles.css                 # All styling
└── README.md                  # This file
```

## Support & Issues

This is a demo system for educational purposes. For production use, consider:
- Implementing backend API
- Using a proper database
- Adding user authentication service
- Implementing SSL/TLS security
- Adding comprehensive error handling
- Performance optimization

## License

Demo project for HCI/PTC system - Educational Use Only
