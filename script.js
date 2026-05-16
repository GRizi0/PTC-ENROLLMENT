// ===== STATE =====
const app = {
  currentUser: null,
  userRole: null,
  enrollmentType: null,
  students: [],
  documents: [],
  applications: [],
  accounts: [],
  notifications: [],
  courses: [],
  subjects: [],

  load() {
    try {
      const d = JSON.parse(localStorage.getItem('ptcSystem') || '{}');
      Object.assign(this, d);
    } catch (e) {}
  },

  save() {
    localStorage.setItem('ptcSystem', JSON.stringify({
      currentUser: this.currentUser,
      userRole: this.userRole,
      enrollmentType: this.enrollmentType,
      students: this.students,
      documents: this.documents,
      applications: this.applications,
      accounts: this.accounts || [],
      notifications: this.notifications || [],
      courses: this.courses || [],
      subjects: this.subjects || []
    }));
  },

  seedDemoData() {
    if (!this.accounts) this.accounts = [];
    if (this.accounts.length === 0) {
      this.accounts = [
        { fullName: 'Maria Santos',   email: 'maria@example.com', password: 'password123' },
        { fullName: 'Juan Dela Cruz', email: 'juan@example.com',  password: 'password123' },
        { fullName: 'Ana Garcia',     email: 'ana@example.com',   password: 'password123' }
      ];
    }
    if (this.students.length === 0) {
      this.students = [
        { id: 'STU001', fullName: 'Maria Santos',   email: 'maria@example.com', phone: '09171234567', type: 'Freshmen',   status: 'approved', dateEnrolled: '2026-05-10' },
        { id: 'STU002', fullName: 'Juan Dela Cruz', email: 'juan@example.com',  phone: '09182345678', type: 'Regular',    status: 'pending',  dateEnrolled: '2026-05-12' },
        { id: 'STU003', fullName: 'Ana Garcia',     email: 'ana@example.com',   phone: '09193456789', type: 'Transferee', status: 'approved', dateEnrolled: '2026-05-08' }
      ];
    }
    if (this.documents.length === 0) {
      this.documents = [
        { id: 'DOC001', studentId: 'STU001', studentName: 'Maria Santos',   type: 'Form 138',          status: 'approved', uploadDate: '2026-05-10' },
        { id: 'DOC002', studentId: 'STU002', studentName: 'Juan Dela Cruz', type: 'Birth Certificate',  status: 'pending',  uploadDate: '2026-05-12' },
        { id: 'DOC003', studentId: 'STU003', studentName: 'Ana Garcia',     type: 'Good Moral',         status: 'approved', uploadDate: '2026-05-08' }
      ];
    }
    if (this.applications.length === 0) {
      this.applications = [
        { id: 'APP001', studentId: 'STU001', studentName: 'Maria Santos',   enrollmentType: 'Freshmen',   status: 'approved', applicationDate: '2026-05-10' },
        { id: 'APP002', studentId: 'STU002', studentName: 'Juan Dela Cruz', enrollmentType: 'Regular',    status: 'pending',  applicationDate: '2026-05-12' },
        { id: 'APP003', studentId: 'STU003', studentName: 'Ana Garcia',     enrollmentType: 'Transferee', status: 'approved', applicationDate: '2026-05-08' }
      ];
    }
    this.save();
  }
};

// ===== INIT =====
window.addEventListener('DOMContentLoaded', () => {
  app.load();
  app.seedDemoData();
  initNotifications();

  const page = location.pathname.split('/').pop();

  if (page === 'student-dashboard.html') {
    if (!app.currentUser || app.userRole !== 'student') { location.href = 'student-login.html'; return; }
    initStudentDashboard();
  }

  if (page === 'admin-dashboard.html') {
    if (!app.currentUser || app.userRole !== 'admin') { location.href = 'admin-login.html'; return; }
    initAdminDashboard();
  }

  if (page === 'student-selection.html') {
    if (!app.currentUser || app.userRole !== 'student') { location.href = 'student-login.html'; return; }
  }
});

// ===== SECTION SWITCHER (shared by both dashboards) =====
function switchSection(sectionId, linkEl) {
  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(sectionId);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-link').forEach(a => a.classList.remove('active'));
  if (linkEl) linkEl.classList.add('active');
}

// ===== AUTH TABS =====
function switchTab(tab, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(tab + 'Tab').classList.add('active');
}

// ===== STUDENT AUTH =====
function handleStudentLogin(e) {
  e.preventDefault();
  const email    = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) { showMsg('loginMsg', 'Please fill in all fields.', 'error'); return; }

  if (!app.accounts) app.accounts = [];
  const account = app.accounts.find(a => a.email === email && a.password === password);

  if (!account) {
    showMsg('loginMsg', 'Invalid email or password. Please sign up first if you don\'t have an account.', 'error');
    return;
  }

  app.currentUser = { fullName: account.fullName, email: account.email, phone: account.phone, role: 'student' };
  app.userRole = 'student';

  // Check if already enrolled before
  const existing = app.students.find(s => s.email === email);
  if (existing) {
    app.enrollmentType = existing.type;
    app.save();
    location.href = 'student-dashboard.html';
  } else {
    app.enrollmentType = null;
    app.save();
    location.href = 'student-selection.html';
  }
}

function handleStudentSignup(e) {
  e.preventDefault();
  const name     = document.getElementById('signupName').value.trim();
  const email    = document.getElementById('signupEmail').value.trim().toLowerCase();
  const password = document.getElementById('signupPassword').value;
  const confirm  = document.getElementById('signupConfirm').value;

  if (!name || !email || !password) { showMsg('signupMsg', 'Please fill in all required fields.', 'error'); return; }
  if (password !== confirm)          { showMsg('signupMsg', 'Passwords do not match.', 'error'); return; }
  if (password.length < 6)           { showMsg('signupMsg', 'Password must be at least 6 characters.', 'error'); return; }

  if (!app.accounts) app.accounts = [];
  if (app.accounts.find(a => a.email === email)) {
    showMsg('signupMsg', 'An account with this email already exists. Please login instead.', 'error');
    return;
  }

  app.accounts.push({ fullName: name, email, password });
  app.currentUser = { fullName: name, email, role: 'student' };
  app.userRole = 'student';
  app.enrollmentType = null;
  app.save();
  showMsg('signupMsg', '✅ Account created! Redirecting...', 'success');
  setTimeout(() => location.href = 'student-selection.html', 1000);
}

// ===== ENROLLMENT SELECTION =====
function selectType(type) {
  app.enrollmentType = type;
  app.save();
  document.getElementById('typeDisplay').textContent = type;
  document.getElementById('confirmModal').classList.add('active');
}

function closeConfirmModal() {
  document.getElementById('confirmModal').classList.remove('active');
}

function confirmEnrollment() {
  closeConfirmModal();

  const studentId = 'STU' + String(Date.now()).slice(-4);
  const today = new Date().toISOString().split('T')[0];

  // Add student record if not already present
  const exists = app.students.find(s => s.email === app.currentUser.email);
  if (!exists) {
    app.students.push({
      id: studentId,
      fullName: app.currentUser.fullName,
      email: app.currentUser.email,
      phone: app.currentUser.phone || '',
      type: app.enrollmentType,
      status: 'pending',
      dateEnrolled: today
    });
    app.applications.push({
      id: 'APP' + Date.now(),
      studentId,
      studentName: app.currentUser.fullName,
      enrollmentType: app.enrollmentType,
      status: 'pending',
      applicationDate: today
    });
    app.save();
  }

  location.href = 'student-dashboard.html';
}

// ===== STUDENT DASHBOARD =====
function initStudentDashboard() {
  const u = app.currentUser;
  const initials = u.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  setEl('studentNameDisplay', u.fullName);
  setEl('sidebarStudentName', u.fullName);
  setEl('enrollmentInfo', 'Enrollment Type: ' + (app.enrollmentType || '—'));
  setEl('enrollmentTypeCard', app.enrollmentType || '—');
  setEl('studentAvatar', initials);

  // Pre-fill profile
  setVal('profileName',     u.fullName || '');
  setVal('profileEmail',    u.email    || '');
  setVal('profilePhone',    u.phone    || '');
  setVal('profileDOB',      u.dob      || '');
  setVal('profileGender',   u.gender   || '');
  setVal('profileCivilStatus', u.civilStatus || '');
  setVal('profileAddress',  u.address  || '');
  setVal('profileCity',     u.city     || '');
  setVal('profileProvince', u.province || '');
  setVal('profilePostal',   u.postal   || '');

  // Enrollment status badge
  const studentRecord = app.students.find(s => s.email === u.email);
  const status = studentRecord ? studentRecord.status : 'pending';
  const statusEl = document.getElementById('enrollmentStatus');
  if (statusEl) { statusEl.textContent = cap(status); statusEl.className = 'badge badge-' + status; }

  // Requirements status
  const myDocs = app.documents.filter(d => d.studentId === (studentRecord?.id || u.email));
  const reqEl = document.getElementById('requirementsStatus');
  if (reqEl) {
    const hasSubmitted = myDocs.length > 0;
    reqEl.textContent = hasSubmitted ? 'Submitted' : 'Pending';
    reqEl.className = 'badge ' + (hasSubmitted ? 'badge-under-review' : 'badge-pending');
  }

  // Subjects — only show after enrollment is approved
  const studentRecord2 = app.students.find(s => s.email === app.currentUser.email);
  const isApproved = studentRecord2 ? studentRecord2.status === 'approved' : false;
  const subjects = isApproved ? getSubjectsForType(app.enrollmentType) : [];
  setEl('subjectsCount', subjects.length);
  const tbody = document.getElementById('studentSubjectsBody');
  if (tbody) {
    tbody.innerHTML = subjects.length === 0
      ? '<tr><td colspan="7"><div class="empty-state"><div style="font-size:3em;margin-bottom:10px;">📚</div><h3>No subjects available yet</h3><p>Subjects will appear here after your enrollment is approved by the admin.</p></div></td></tr>'
      : subjects.map(s => `<tr>
          <td>${s.code}</td><td>${s.name}</td><td>${s.units}</td>
          <td>${s.instructor}</td><td>${s.schedule}</td><td>${s.room}</td>
          <td><span class="badge badge-under-review">Enrolled</span></td>
        </tr>`).join('');
  }

  // Update avatar in profile section
  const profileAvatar = document.getElementById('profileAvatar');
  if (profileAvatar) profileAvatar.textContent = initials;

  // Render new components
  renderProgressSteps();
  renderProfileStatusCard();
  renderStudentNotifications();
  renderDocUploadFields();
}

function renderDocUploadFields() {
  const type = app.enrollmentType;
  const container = document.getElementById('docUploadFields');
  if (!container) return;

  let fields = '';

  if (type === 'Regular') {
    fields = `
      <div class="form-group">
        <label>Certificate of Registration (COR) <span style="color:var(--danger)">*</span></label>
        <div class="file-drop" onclick="document.getElementById('fileCOR').click()">
          <input type="file" id="fileCOR" accept=".pdf,.jpg,.jpeg,.png">
          <span>📁 Click to upload (PDF, JPG, PNG)</span>
        </div>
        <div id="CORList" class="file-list" style="display:none;"></div>
      </div>
      <div class="form-group">
        <label>Grades from Last Semester <span style="color:var(--danger)">*</span></label>
        <div class="file-drop" onclick="document.getElementById('fileGrades').click()">
          <input type="file" id="fileGrades" accept=".pdf,.jpg,.jpeg,.png">
          <span>📁 Click to upload (PDF, JPG, PNG)</span>
        </div>
        <div id="GradesList" class="file-list" style="display:none;"></div>
      </div>
      <div class="form-group">
        <label>Valid School ID <span style="color:var(--danger)">*</span></label>
        <div class="file-drop" onclick="document.getElementById('fileSchoolID').click()">
          <input type="file" id="fileSchoolID" accept=".pdf,.jpg,.jpeg,.png">
          <span>📁 Click to upload (PDF, JPG, PNG)</span>
        </div>
        <div id="SchoolIDList" class="file-list" style="display:none;"></div>
      </div>
    `;
    const subtitle = document.getElementById('reqSubtitle');
    if (subtitle) subtitle.textContent = 'Upload your continuing enrollment documents.';
  } else {
    fields = `
      <div class="form-group">
        <label>Form 138 / Diploma <span style="color:var(--danger)">*</span></label>
        <div class="file-drop" onclick="document.getElementById('fileForm138').click()">
          <input type="file" id="fileForm138" accept=".pdf,.jpg,.jpeg,.png">
          <span>📁 Click to upload (PDF, JPG, PNG)</span>
        </div>
        <div id="Form138List" class="file-list" style="display:none;"></div>
      </div>
      <div class="form-group">
        <label>Birth Certificate (PSA)</label>
        <div class="file-drop" onclick="document.getElementById('fileBirthCert').click()">
          <input type="file" id="fileBirthCert" accept=".pdf,.jpg,.jpeg,.png">
          <span>📁 Click to upload (PDF, JPG, PNG)</span>
        </div>
        <div id="BirthCertList" class="file-list" style="display:none;"></div>
      </div>
      <div class="form-group">
        <label>Certificate of Good Moral</label>
        <div class="file-drop" onclick="document.getElementById('fileGoodMoral').click()">
          <input type="file" id="fileGoodMoral" accept=".pdf,.jpg,.jpeg,.png">
          <span>📁 Click to upload (PDF, JPG, PNG)</span>
        </div>
        <div id="GoodMoralList" class="file-list" style="display:none;"></div>
      </div>
      <div class="form-group">
        <label>Valid Government ID</label>
        <div class="file-drop" onclick="document.getElementById('fileValidID').click()">
          <input type="file" id="fileValidID" accept=".pdf,.jpg,.jpeg,.png">
          <span>📁 Click to upload (PDF, JPG, PNG)</span>
        </div>
        <div id="ValidIDList" class="file-list" style="display:none;"></div>
      </div>
    `;
    const subtitle = document.getElementById('reqSubtitle');
    if (subtitle) subtitle.textContent = 'Upload your enrollment documents below.';
  }

  container.innerHTML = fields;
}

function getSubjectsForType(type) {
  const map = {
    Freshmen: [
      { code: 'CS101',   name: 'Introduction to Programming', units: 3, instructor: 'Dr. Reyes',   schedule: 'MWF 8:00–9:30',   room: 'Lab 101' },
      { code: 'MATH101', name: 'Calculus I',                  units: 4, instructor: 'Prof. Santos', schedule: 'TTh 10:00–11:30', room: 'Room 205' },
      { code: 'ENG101',  name: 'Technical Writing',           units: 3, instructor: 'Ms. Cruz',     schedule: 'MWF 1:00–2:30',   room: 'Room 110' }
    ],
    Regular: [
      { code: 'CS201',   name: 'Data Structures',             units: 4, instructor: 'Dr. Reyes',   schedule: 'MWF 9:00–10:30',  room: 'Lab 102' },
      { code: 'CS202',   name: 'Algorithms',                  units: 3, instructor: 'Prof. Lim',   schedule: 'TTh 1:00–2:30',   room: 'Lab 103' }
    ],
    Transferee: [
      { code: 'CS150',   name: 'Bridging Course: Programming', units: 3, instructor: 'Dr. Reyes',  schedule: 'MWF 10:00–11:30', room: 'Lab 101' },
      { code: 'MATH150', name: 'Bridging Course: Math',        units: 3, instructor: 'Prof. Santos',schedule: 'TTh 8:00–9:30',  room: 'Room 205' }
    ]
  };
  return map[type] || [];
}

function handleSaveProfile(e) {
  e.preventDefault();
  app.currentUser = {
    ...app.currentUser,
    fullName: getVal('profileName'),
    email:    getVal('profileEmail'),
    phone:    getVal('profilePhone'),
    dob:      getVal('profileDOB'),
    gender:   getVal('profileGender'),
    civilStatus: getVal('profileCivilStatus'),
    address:  getVal('profileAddress'),
    city:     getVal('profileCity'),
    province: getVal('profileProvince'),
    postal:   getVal('profilePostal')
  };

  // Update student record name too
  const rec = app.students.find(s => s.email === app.currentUser.email);
  if (rec) rec.fullName = app.currentUser.fullName;

  app.save();
  showMsg('profileMsg', '✅ Profile saved successfully!', 'success');
  setEl('studentNameDisplay', app.currentUser.fullName);
  setEl('sidebarStudentName', app.currentUser.fullName);
  renderProfileStatusCard();
}

// ===== REQUIREMENTS SUBMISSION STEPS =====
function showSubmissionReview(e) {
  e.preventDefault();
  const course = getVal('courseSelect');
  if (!course) { showMsg('requirementsMsg', 'Please select a course.', 'error'); return; }

  const isRegular = app.enrollmentType === 'Regular';
  const fileInputs = isRegular 
    ? ['fileCOR', 'fileGrades', 'fileSchoolID']
    : ['fileForm138', 'fileBirthCert', 'fileGoodMoral', 'fileValidID'];
  const uploaded = fileInputs.filter(id => (document.getElementById(id)?.files.length || 0) > 0);

  if (uploaded.length === 0) { showMsg('requirementsMsg', 'Please upload at least one document.', 'error'); return; }

  const typeMap = isRegular
    ? { fileCOR: 'Certificate of Registration', fileGrades: 'Grades from Last Semester', fileSchoolID: 'Valid School ID' }
    : { fileForm138: 'Form 138', fileBirthCert: 'Birth Certificate', fileGoodMoral: 'Good Moral', fileValidID: 'Valid ID' };
  
  const reviewSummary = document.getElementById('reviewSummary');
  if (reviewSummary) {
    reviewSummary.innerHTML = `
      <div style="margin-bottom:20px;">
        <h4 style="color:var(--primary);margin-bottom:12px;">Course: ${course}</h4>
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:12px;">
          ${uploaded.map(id => {
            const file = document.getElementById(id).files[0];
            return `<div class="review-item">
              <div>
                <div class="ri-name">${typeMap[id]}</div>
                <div class="ri-file">${file.name}</div>
              </div>
              <div>${(file.size / 1024).toFixed(1)} KB</div>
            </div>`;
          }).join('')}
        </div>
      </div>
    `;
  }

  document.getElementById('reqStep1').style.display = 'none';
  document.getElementById('step1Indicator').classList.remove('active');
  document.getElementById('step1Indicator').classList.add('done');
  document.getElementById('reqStep2').style.display = 'block';
  document.getElementById('step2Indicator').classList.add('active');
}

function backToUpload() {
  document.getElementById('reqStep1').style.display = 'block';
  document.getElementById('step1Indicator').classList.add('active');
  document.getElementById('step1Indicator').classList.remove('done');
  document.getElementById('reqStep2').style.display = 'none';
  document.getElementById('step2Indicator').classList.remove('active');
}

function finalSubmitRequirements() {
  const course = getVal('courseSelect');
  const isRegular = app.enrollmentType === 'Regular';
  const fileInputs = isRegular 
    ? ['fileCOR', 'fileGrades', 'fileSchoolID']
    : ['fileForm138', 'fileBirthCert', 'fileGoodMoral', 'fileValidID'];
  const uploaded = fileInputs.filter(id => (document.getElementById(id)?.files.length || 0) > 0);

  const studentRecord = app.students.find(s => s.email === app.currentUser.email);
  const studentId = studentRecord?.id || app.currentUser.email;

  const typeMap = isRegular
    ? { fileCOR: 'Certificate of Registration', fileGrades: 'Grades from Last Semester', fileSchoolID: 'Valid School ID' }
    : { fileForm138: 'Form 138', fileBirthCert: 'Birth Certificate', fileGoodMoral: 'Good Moral', fileValidID: 'Valid ID' };
  const today = new Date().toISOString().split('T')[0];

  uploaded.forEach(id => {
    app.documents.push({
      id: 'DOC' + Date.now() + Math.random().toString(36).slice(2, 5),
      studentId,
      studentName: app.currentUser.fullName,
      type: typeMap[id],
      status: 'pending',
      uploadDate: today
    });
  });

  addNotification(studentId, 'submission', 'Requirements Submitted', `Your ${uploaded.length} document(s) have been submitted for review.`);
  addNotification(null, 'admin', 'New Submission', `${app.currentUser.fullName} submitted ${uploaded.length} documents.`);

  app.save();

  document.getElementById('reqStep2').style.display = 'none';
  document.getElementById('step2Indicator').classList.remove('active');
  document.getElementById('step2Indicator').classList.add('done');
  document.getElementById('reqStep3').style.display = 'block';
  document.getElementById('step3Indicator').classList.add('active');

  clearFileLists();
  document.getElementById('courseSelect').value = '';
}

function clearFileLists() {
  const allIds = ['Form138List', 'BirthCertList', 'GoodMoralList', 'ValidIDList', 'CORList', 'GradesList', 'SchoolIDList'];
  allIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.style.display = 'none'; el.innerHTML = ''; }
  });
  const allFiles = ['fileForm138', 'fileBirthCert', 'fileGoodMoral', 'fileValidID', 'fileCOR', 'fileGrades', 'fileSchoolID'];
  allFiles.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

function studentLogout() {
  if (!confirm('Are you sure you want to logout?')) return;
  app.currentUser = null;
  app.userRole = null;
  app.enrollmentType = null;
  app.save();
  location.href = 'index.html';
}

// ===== NOTIFICATIONS SYSTEM =====
function initNotifications() {
  if (!app.notifications) app.notifications = [];
}

function getStudentNotifications(studentId) {
  if (!app.notifications) app.notifications = [];
  return app.notifications.filter(n => n.userId === studentId || n.type === 'broadcast');
}

function getAdminNotifications() {
  if (!app.notifications) app.notifications = [];
  return app.notifications.filter(n => n.type === 'admin');
}

function addNotification(userId, type, title, message, status = 'unread') {
  if (!app.notifications) app.notifications = [];
  app.notifications.push({
    id: 'NOTIF' + Date.now(),
    userId,
    type,
    title,
    message,
    status,
    timestamp: new Date().toISOString()
  });
  app.save();
}

function renderStudentNotifications() {
  const studentId = app.students.find(s => s.email === app.currentUser.email)?.id;
  const notifs = getStudentNotifications(studentId);
  const container = document.getElementById('notificationsList');
  if (!container) return;
  
  if (notifs.length === 0) {
    container.innerHTML = '<div class="empty-state"><div style="font-size:2em;margin-bottom:10px;">🔔</div><h3>No notifications</h3><p>You will receive notifications about your enrollment status here.</p></div>';
    return;
  }
  
  container.innerHTML = notifs.map(n => `
    <div class="notif-item ${n.status === 'unread' ? 'unread' : ''} ${n.type === 'approved' ? 'success-notif' : n.type === 'rejected' ? 'danger-notif' : ''}">
      <div class="notif-icon">${n.type === 'approved' ? '✅' : n.type === 'rejected' ? '❌' : '📬'}</div>
      <div class="notif-body">
        <div class="notif-title">${n.title}</div>
        <div class="notif-text">${n.message}</div>
        <div class="notif-time">${new Date(n.timestamp).toLocaleString()}</div>
      </div>
    </div>
  `).join('');
  
  updateNotificationBadge();
}

function renderAdminNotifications() {
  const notifs = getAdminNotifications();
  const container = document.getElementById('adminNotificationsList');
  if (!container) return;
  
  if (notifs.length === 0) {
    container.innerHTML = '<div class="empty-state"><div style="font-size:2em;margin-bottom:10px;">🔔</div><h3>No notifications</h3></div>';
    return;
  }
  
  container.innerHTML = notifs.map(n => `
    <div class="notif-item ${n.status === 'unread' ? 'unread' : ''}">
      <div class="notif-icon">${n.type === 'submission' ? '📤' : n.type === 'approval' ? '✅' : '📬'}</div>
      <div class="notif-body">
        <div class="notif-title">${n.title}</div>
        <div class="notif-text">${n.message}</div>
        <div class="notif-time">${new Date(n.timestamp).toLocaleString()}</div>
      </div>
    </div>
  `).join('');
  
  updateAdminNotificationBadge();
}

function updateNotificationBadge() {
  const studentId = app.students.find(s => s.email === app.currentUser.email)?.id;
  const unread = getStudentNotifications(studentId).filter(n => n.status === 'unread').length;
  const badge = document.getElementById('notifBadge');
  if (badge) {
    if (unread > 0) {
      badge.textContent = unread;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  }
}

function updateAdminNotificationBadge() {
  const unread = getAdminNotifications().filter(n => n.status === 'unread').length;
  const badge = document.getElementById('adminNotifBadge');
  if (badge) {
    if (unread > 0) {
      badge.textContent = unread;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  }
}

function markAllRead() {
  const studentId = app.students.find(s => s.email === app.currentUser.email)?.id;
  const notifs = getStudentNotifications(studentId);
  notifs.forEach(n => n.status = 'read');
  app.save();
  renderStudentNotifications();
}

function markAdminNotifRead() {
  const notifs = getAdminNotifications();
  notifs.forEach(n => n.status = 'read');
  app.save();
  renderAdminNotifications();
}

// ===== PROGRESS STEPS =====
function renderProgressSteps() {
  const studentRecord = app.students.find(s => s.email === app.currentUser.email);
  const myDocs = app.documents.filter(d => d.studentId === studentRecord?.id);
  
  const steps = [
    { icon: '✓', label: 'Enrollment Selected', status: app.enrollmentType ? 'done' : 'pending' },
    { icon: '✓', label: 'Profile Updated', status: app.currentUser.dob || app.currentUser.address ? 'done' : 'pending' },
    { icon: '✓', label: 'Documents Submitted', status: myDocs.length > 0 ? 'done' : 'pending' },
    { icon: '✓', label: 'Under Review', status: myDocs.some(d => d.status === 'pending') ? 'active-step' : myDocs.some(d => d.status === 'approved') ? 'done' : 'pending' },
    { icon: '✓', label: 'Approved', status: studentRecord?.status === 'approved' ? 'done' : 'pending' }
  ];

  const stepsContainer = document.getElementById('progressSteps');
  if (stepsContainer) {
    stepsContainer.innerHTML = steps.map((step, i) => `
      <div class="progress-step ${step.status}">
        <div class="ps-icon">${step.icon}</div>
        <div class="ps-label">${step.label}</div>
        <div class="ps-status">${step.status === 'done' ? 'Complete' : step.status === 'active-step' ? 'In Progress' : 'Pending'}</div>
      </div>
    `).join('');
  }
}

// ===== PROFILE STATUS CARD =====
function renderProfileStatusCard() {
  const studentRecord = app.students.find(s => s.email === app.currentUser.email);
  const myDocs = app.documents.filter(d => d.studentId === studentRecord?.id);
  const enrollmentStatus = studentRecord?.status || 'pending';
  
  const card = document.getElementById('profileStatusCard');
  if (card) {
    card.innerHTML = `
      <div class="psc-item">
        <div class="psc-label">Student ID</div>
        <div class="psc-value">${studentRecord?.id || '—'}</div>
      </div>
      <div class="psc-item">
        <div class="psc-label">Enrollment Status</div>
        <div class="psc-value"><span class="badge badge-${enrollmentStatus}">${cap(enrollmentStatus)}</span></div>
      </div>
      <div class="psc-item">
        <div class="psc-label">Documents Submitted</div>
        <div class="psc-value">${myDocs.length}</div>
      </div>
      <div class="psc-item">
        <div class="psc-label">Date Enrolled</div>
        <div class="psc-value">${studentRecord?.dateEnrolled || '—'}</div>
      </div>
      <div class="psc-item">
        <div class="psc-label">Requirement Status</div>
        <div class="psc-value">
          ${myDocs.length === 0 ? '—' : myDocs.some(d => d.status === 'rejected') ? '<span class="badge badge-rejected">Rejected</span>' : myDocs.some(d => d.status === 'pending') ? '<span class="badge badge-under-review">Under Review</span>' : '<span class="badge badge-approved">Approved</span>'}
        </div>
      </div>
    `;
  }
}

// ===== ADMIN AUTH =====
function handleAdminLogin(e) {
  e.preventDefault();
  const id   = document.getElementById('adminId').value.trim();
  const pass = document.getElementById('adminPassword').value;

  if (id === 'admin' && pass === 'admin123') {
    app.currentUser = { name: 'Administrator', role: 'admin' };
    app.userRole = 'admin';
    app.save();
    location.href = 'admin-dashboard.html';
  } else {
    showMsg('adminLoginMsg', 'Invalid credentials. Use ID: admin / Password: admin123', 'error');
  }
}

// ===== ADMIN DASHBOARD =====
function initAdminDashboard() {
  updateAdminStats();
  renderStudentTable(app.students);
  renderDocuments(app.documents);
  renderApplications(app.applications);
  renderRecentEnrollments();
  renderAdminRecentNotifications();
  renderAdminNotifications();
  renderCourseList();
  renderSubjectList();
}

function updateAdminStats() {
  setEl('totalStudents',    app.students.length);
  setEl('pendingApps',      app.applications.filter(a => a.status === 'pending').length);
  setEl('approvedStudents', app.students.filter(s => s.status === 'approved').length);
  setEl('rejectedApps',     app.applications.filter(a => a.status === 'rejected').length);
  setEl('enrolledStudents', app.students.filter(s => s.status === 'enrolled').length);
}

function renderRecentEnrollments() {
  const tbody = document.getElementById('recentEnrollmentsBody');
  if (!tbody) return;
  const recent = [...app.students].sort((a, b) => b.dateEnrolled.localeCompare(a.dateEnrolled)).slice(0, 5);
  tbody.innerHTML = recent.length === 0
    ? '<tr><td colspan="5"><div class="empty-state"><h3>No enrollments yet</h3></div></td></tr>'
    : recent.map(s => `<tr>
        <td>${s.id}</td><td>${s.fullName}</td><td>${s.type}</td>
        <td>${s.dateEnrolled}</td>
        <td><span class="badge badge-${s.status}">${cap(s.status)}</span></td>
      </tr>`).join('');
}

function renderAdminRecentNotifications() {
  const container = document.getElementById('adminRecentNotifs');
  if (!container) return;
  const notifs = getAdminNotifications().slice(-5).reverse();
  if (notifs.length === 0) {
    container.innerHTML = '<div class="empty-state" style="padding:30px;"><h3>No recent notifications</h3></div>';
    return;
  }
  container.innerHTML = notifs.map(n => `
    <div class="notif-item ${n.status === 'unread' ? 'unread' : ''}">
      <div class="notif-icon">${n.type === 'submission' ? '📤' : '📬'}</div>
      <div class="notif-body">
        <div class="notif-title">${n.title}</div>
        <div class="notif-text">${n.message}</div>
        <div class="notif-time">${new Date(n.timestamp).toLocaleString()}</div>
      </div>
    </div>
  `).join('');
}

// ===== STUDENT MANAGEMENT =====
function renderStudentTable(list) {
  const tbody = document.getElementById('studentMgmtBody');
  if (!tbody) return;
  tbody.innerHTML = list.length === 0
    ? '<tr><td colspan="7"><div class="empty-state"><h3>No students found</h3></div></td></tr>'
    : list.map(s => `<tr>
        <td>${s.id}</td><td>${s.fullName}</td><td>${s.email}</td>
        <td>${s.type}</td>
        <td><span class="badge badge-${s.status === 'enrolled' ? 'success' : s.status === 'approved' ? 'warning' : 'danger'}">${s.status === 'enrolled' ? 'Enrolled' : s.status === 'approved' ? 'Approved' : 'Pending'}</span></td>
        <td>${s.dateEnrolled}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-small btn-view" onclick="viewStudent('${s.id}')">View</button>
            <button class="btn-small btn-delete" onclick="deleteStudent('${s.id}')">Delete</button>
          </div>
        </td>
      </tr>`).join('');
}

function filterStudents() {
  const search = (getVal('studentSearch') || '').toLowerCase();
  const status = getVal('statusFilterStudent') || '';
  const type   = getVal('typeFilterStudent')   || '';
  const filtered = app.students.filter(s =>
    (s.fullName.toLowerCase().includes(search) || s.email.toLowerCase().includes(search) || s.id.toLowerCase().includes(search)) &&
    (!status || s.status === status) &&
    (!type   || s.type   === type)
  );
  renderStudentTable(filtered);
}

let currentEditStudentId = null;

function editStudent(id) {
  const s = app.students.find(x => x.id === id);
  if (!s) return;
  currentEditStudentId = id;
  setEl('editStudentName', s.fullName);
  setEl('editCurrentStatus', cap(s.status));
  const badge = document.getElementById('editCurrentStatus');
  if (badge) badge.className = 'badge badge-' + s.status;
  setVal('editStatusSelect', s.status);
  document.getElementById('editStudentModal').classList.add('active');
}

function closeEditModal() {
  document.getElementById('editStudentModal').classList.remove('active');
  currentEditStudentId = null;
}

function saveStudentEdit() {
  if (!currentEditStudentId) return;
  const s = app.students.find(x => x.id === currentEditStudentId);
  if (!s) return;
  const newStatus = getVal('editStatusSelect');
  if (!newStatus || !['pending', 'approved', 'rejected'].includes(newStatus)) return;
  s.status = newStatus;
  const appRec = app.applications.find(a => a.studentId === currentEditStudentId);
  if (appRec) appRec.status = s.status;

  if (newStatus === 'approved') {
    addNotification(currentEditStudentId, 'approved', 'Status Updated', 'Your enrollment status has been updated to approved.');
  } else if (newStatus === 'rejected') {
    addNotification(currentEditStudentId, 'rejected', 'Status Updated', 'Your enrollment status has been updated to rejected.');
  }

  app.save();
  renderStudentTable(app.students);
  renderApplications(app.applications);
  renderAdminRecentNotifications();
  updateAdminStats();
  showMsg('studentMsgArea', 'Status updated to "' + s.status + '" for ' + s.fullName + '.', 'success');
  closeEditModal();
}

function deleteStudent(id) {
  const s = app.students.find(x => x.id === id);
  if (!s || !confirm(`Delete student record for ${s.fullName}?`)) return;
  app.students     = app.students.filter(x => x.id !== id);
  app.applications = app.applications.filter(a => a.studentId !== id);
  app.documents    = app.documents.filter(d => d.studentId !== id);
  app.save();
  renderStudentTable(app.students);
  renderApplications(app.applications);
  renderDocuments(app.documents);
  updateAdminStats();
  showMsg('studentMsgArea', `🗑️ Student record deleted.`, 'success');
}

// ===== DOCUMENT VERIFICATION =====
function renderDocuments(docs) {
  const container = document.getElementById('verificationListContainer');
  if (!container) return;
  
  // Group documents by studentId
  const studentsWithDocs = {};
  docs.forEach(doc => {
    if (!studentsWithDocs[doc.studentId]) {
      studentsWithDocs[doc.studentId] = [];
    }
    studentsWithDocs[doc.studentId].push(doc);
  });
  
  // Filter to only students who have pending documents
  const studentsWithPending = Object.keys(studentsWithDocs).filter(studentId => 
    studentsWithDocs[studentId].some(doc => doc.status === 'pending')
  );
  
  if (studentsWithPending.length === 0) {
    container.innerHTML = '<div class="table-container"><div class="empty-state"><h3>No documents to review</h3></div></div>';
    return;
  }
  
  container.innerHTML = studentsWithPending.map(studentId => {
    const studentDocs = studentsWithDocs[studentId];
    const firstDoc = studentDocs[0];
    const pendingCount = studentDocs.filter(doc => doc.status === 'pending').length;
    return `
    <div class="doc-card">
      <div class="doc-card-header">
        <div class="doc-card-info">
          <h4>${firstDoc.studentName}</h4>
          <p>Student ID: ${firstDoc.studentId} &nbsp;|&nbsp; Documents: ${studentDocs.length} &nbsp;|&nbsp; Pending: ${pendingCount}</p>
        </div>
        <span class="badge badge-under-review">Pending Review</span>
      </div>
      <div class="doc-card-actions">
        <button class="btn-small btn-view" onclick="viewDoc('${firstDoc.id}')">👁 View Requirements</button>
      </div>
    </div>
  `}).join('');
}

function filterDocuments() {
  const search = (getVal('docSearch') || '').toLowerCase();
  const status = getVal('docStatusFilter') || '';
  renderDocuments(app.documents.filter(d =>
    d.studentName.toLowerCase().includes(search) && (!status || d.status === status)
  ));
}

function approveDoc(id) {
  const doc = app.documents.find(d => d.id === id);
  if (!doc) return;
  doc.status = 'approved';
  addNotification(doc.studentId, 'approved', 'Document Approved ✅', `Your ${doc.type} has been approved.`);
  app.save();
  renderDocuments(app.documents);
  renderAdminRecentNotifications();
  updateAdminStats();
  showMsg('verificationMsgArea', `✅ "${doc.type}" approved for ${doc.studentName}.`, 'success');
}

function rejectDoc(id) {
  const doc = app.documents.find(d => d.id === id);
  if (!doc) return;
  doc.status = 'rejected';
  addNotification(doc.studentId, 'rejected', 'Document Rejected ❌', `Your ${doc.type} was rejected. Please review and resubmit.`);
  app.save();
  renderDocuments(app.documents);
  renderAdminRecentNotifications();
  updateAdminStats();
  showMsg('verificationMsgArea', `❌ "${doc.type}" rejected for ${doc.studentName}.`, 'error');
}

function viewDoc(id) {
  const doc = app.documents.find(d => d.id === id);
  if (!doc) return;
  
  setEl('viewDocStudent', doc.studentName);
  setEl('viewDocStudentId', doc.studentId);
  setEl('viewDocDate', doc.uploadDate);
  
  const allDocs = app.documents.filter(d => d.studentId === doc.studentId);
  const container = document.getElementById('viewDocRequirementsList');
  container.innerHTML = allDocs.map(d => `
    <div class="doc-card" style="margin-bottom:15px;padding:15px;">
      <div class="doc-card-header" style="margin-bottom:10px;">
        <div>
          <strong>${d.type}</strong>
          <span class="badge badge-${d.status}" style="margin-left:10px;">${cap(d.status)}</span>
        </div>
        <div class="doc-card-actions" style="margin:0;">
          <button class="btn-small btn-approve" onclick="approveDoc('${d.id}');renderDocuments(app.documents)">✓</button>
          <button class="btn-small btn-reject" onclick="rejectDoc('${d.id}');renderDocuments(app.documents)">✗</button>
        </div>
      </div>
    </div>
  `).join('');
  
  document.getElementById('viewDocModal').classList.add('active');
}

function closeViewDocModal() {
  document.getElementById('viewDocModal').classList.remove('active');
}

// ===== VIEW STUDENT MODAL =====
function viewStudent(id) {
  const s = app.students.find(x => x.id === id);
  if (!s) return;
  
  const appRec = app.applications.find(a => a.studentId === id);
  const courseMap = {
    'CS': 'Computer Science',
    'BM': 'Business Management',
    'HC': 'Healthcare Services',
    'ENG': 'Engineering Technology'
  };
  
  setEl('viewStudentName', s.fullName);
  setEl('viewStudentId', s.id);
  setEl('viewStudentEmail', s.email);
  setEl('viewStudentPhone', s.phone || 'Not provided');
  setEl('viewStudentType', s.type);
  setEl('viewStudentCourse', courseMap[appRec?.enrollmentType] || 'Not selected');
  setEl('viewStudentStatus', cap(s.status));
  
  const statusEl = document.getElementById('viewStudentStatus');
  if (statusEl) statusEl.className = 'badge badge-' + s.status;
  
  setEl('viewDateEnrolled', s.dateEnrolled);
  
  const studentDocs = app.documents.filter(d => d.studentId === id);
  const requirementsContainer = document.getElementById('viewStudentRequirements');
  
  if (studentDocs.length === 0) {
    requirementsContainer.innerHTML = '<p>No documents submitted yet.</p>';
  } else {
    requirementsContainer.innerHTML = studentDocs.map(d => `
      <div class="doc-card" style="margin-bottom:10px;padding:10px;background:var(--light);border-radius:6px;">
        <div>
          <strong>${d.type}</strong>
          <span class="badge badge-${d.status}" style="margin-left:10px;">${cap(d.status)}</span>
        </div>
        <div style="font-size:0.9em;color:var(--muted);margin-top:5px;">
          Uploaded: ${d.uploadDate}
        </div>
      </div>
    `).join('');
  }
  
  document.getElementById('viewStudentModal').classList.add('active');
}

function closeViewStudentModal() {
  document.getElementById('viewStudentModal').classList.remove('active');
}

// ===== APPLICATIONS =====
function renderApplications(list) {
  const tbody = document.getElementById('applicationTableBody');
  if (!tbody) return;
  tbody.innerHTML = list.length === 0
    ? '<tr><td colspan="7"><div class="empty-state"><h3>No applications found</h3></div></td></tr>'
    : list.map(a => {
        const docs = app.documents.filter(d => d.studentId === a.studentId);
        const approvedDocs = docs.filter(d => d.status === 'approved');
        const allApproved = docs.length > 0 && approvedDocs.length === docs.length;
        return `<tr>
          <td>${a.studentId}</td><td>${a.studentName}</td>
          <td>${a.enrollmentType}</td><td>${a.applicationDate}</td>
          <td><span class="badge">${docs.length}</span></td>
          <td><span class="badge badge-${a.status}">${cap(a.status)}</span></td>
          <td>
            <div class="action-buttons">
              <button class="btn-small btn-view" onclick="viewApplicationStudent('${a.studentId}')">View</button>
              <button class="btn-small btn-approve" onclick="approveApplication('${a.id}')">Approve</button>
              <button class="btn-small btn-reject" onclick="rejectApplication('${a.id}')">Reject</button>
            </div>
          </td>
        </tr>`;
      }).join('');
}

function filterApplications() {
  const search = (getVal('appSearch') || '').toLowerCase();
  const status = getVal('appStatusFilter') || '';
  renderApplications(app.applications.filter(a =>
    a.studentName.toLowerCase().includes(search) && (!status || a.status === status)
  ));
}

function approveApplication(id) {
  const a = app.applications.find(x => x.id === id);
  if (!a) return;
  a.status = 'approved';
  const s = app.students.find(x => x.id === a.studentId);
  if (s) {
    s.status = 'approved';
    
    // Assign subjects based on course and enrollment type
    const subjects = getSubjectsForType(a.enrollmentType);
    // Clear existing subjects and add new ones
    app.subjects = app.subjects.filter(sub => sub.studentId !== s.id);
    subjects.forEach(subject => {
      app.subjects.push({
        ...subject,
        id: 'SUBJ' + Date.now() + Math.random(),
        studentId: s.id,
        studentName: s.fullName
      });
    });
  }
  addNotification(a.studentId, 'approved', 'Enrollment Approved ✅', 'Your enrollment application has been approved. You can now view your enrolled subjects.');
  app.save();
  renderApplications(app.applications);
  renderStudentTable(app.students);
  renderAdminRecentNotifications();
  updateAdminStats();
  showMsg('applicationMsgArea', `✅ Application approved for ${a.studentName}.`, 'success');
}

function rejectApplication(id) {
  const a = app.applications.find(x => x.id === id);
  if (!a) return;
  a.status = 'rejected';
  const s = app.students.find(x => x.id === a.studentId);
  if (s) s.status = 'rejected';
  addNotification(a.studentId, 'rejected', 'Enrollment Rejected ❌', 'Your enrollment application was rejected. Please contact the admin for more details.');
  app.save();
  renderApplications(app.applications);
  renderStudentTable(app.students);
  renderAdminRecentNotifications();
  updateAdminStats();
  showMsg('applicationMsgArea', `❌ Application rejected for ${a.studentName}.`, 'error');
}

function viewApplicationStudent(studentId) {
  // Find the student
  const s = app.students.find(x => x.id === studentId);
  if (!s) return;
  
  // Find the application
  const appRec = app.applications.find(a => a.studentId === studentId);
  const courseMap = {
    'CS': 'Computer Science',
    'BM': 'Business Management',
    'HC': 'Healthcare Services',
    'ENG': 'Engineering Technology'
  };
  
  setEl('viewStudentName', s.fullName);
  setEl('viewStudentId', s.id);
  setEl('viewStudentEmail', s.email);
  setEl('viewStudentPhone', s.phone || 'Not provided');
  setEl('viewStudentType', s.type);
  setEl('viewStudentCourse', courseMap[appRec?.enrollmentType] || 'Not selected');
  setEl('viewStudentStatus', cap(s.status));
  
  const statusEl = document.getElementById('viewStudentStatus');
  if (statusEl) statusEl.className = 'badge badge-' + s.status;
  
  setEl('viewDateEnrolled', s.dateEnrolled);
  
  const studentDocs = app.documents.filter(d => d.studentId === studentId);
  const requirementsContainer = document.getElementById('viewStudentRequirements');
  
  if (studentDocs.length === 0) {
    requirementsContainer.innerHTML = '<p>No documents submitted yet.</p>';
  } else {
    requirementsContainer.innerHTML = studentDocs.map(d => `
      <div class="doc-card" style="margin-bottom:10px;padding:10px;background:var(--light);border-radius:6px;">
        <div>
          <strong>${d.type}</strong>
          <span class="badge badge-${d.status}" style="margin-left:10px;">${cap(d.status)}</span>
        </div>
        <div style="font-size:0.9em;color:var(--muted);margin-top:5px;">
          Uploaded: ${d.uploadDate}
        </div>
      </div>
    `).join('');
  }
  
  document.getElementById('viewStudentModal').classList.add('active');
}

function adminLogout() {
  if (!confirm('Are you sure you want to logout?')) return;
  app.currentUser = null;
  app.userRole = null;
  app.save();
  location.href = 'index.html';
}

// ===== COURSES & SUBJECTS MANAGEMENT =====
function initCoursesData() {
  if (!app.courses) app.courses = [];
  if (!app.subjects) app.subjects = [];
}

function handleAddCourse(e) {
  e.preventDefault();
  initCoursesData();
  const code = getVal('courseCode').trim();
  const name = getVal('courseName').trim();
  const desc = getVal('courseDesc').trim();

  if (!code || !name) { showMsg('courseMsgArea', 'Please fill in required fields.', 'error'); return; }
  if (app.courses.find(c => c.code === code)) { showMsg('courseMsgArea', 'Course code already exists.', 'error'); return; }

  app.courses.push({ code, name, description: desc, id: 'COURSE' + Date.now() });
  app.save();
  showMsg('courseMsgArea', `✅ Course "${name}" added successfully!`, 'success');
  document.getElementById('courseCode').value = '';
  document.getElementById('courseName').value = '';
  document.getElementById('courseDesc').value = '';
  renderCourseList();
}

function handleAddSubject(e) {
  e.preventDefault();
  initCoursesData();
  const code = getVal('subjectCode').trim();
  const name = getVal('subjectName').trim();
  const units = parseInt(getVal('subjectUnits')) || 0;

  if (!code || !name || units <= 0) { showMsg('courseMsgArea', 'Please fill in all required fields with valid data.', 'error'); return; }
  if (app.subjects.find(s => s.code === code)) { showMsg('courseMsgArea', 'Subject code already exists.', 'error'); return; }

  app.subjects.push({ code, name, units, id: 'SUBJ' + Date.now() });
  app.save();
  showMsg('courseMsgArea', `✅ Subject "${name}" added successfully!`, 'success');
  document.getElementById('subjectCode').value = '';
  document.getElementById('subjectName').value = '';
  document.getElementById('subjectUnits').value = '';
  renderSubjectList();
}

function renderCourseList() {
  initCoursesData();
  const tbody = document.getElementById('courseListBody');
  if (!tbody) return;
  tbody.innerHTML = app.courses.length === 0
    ? '<tr><td colspan="4"><div class="empty-state"><h3>No courses added</h3></div></td></tr>'
    : app.courses.map(c => `<tr>
        <td><strong>${c.code}</strong></td>
        <td>${c.name}</td>
        <td>${c.description || '—'}</td>
        <td><button class="btn-small btn-delete" onclick="deleteCourse('${c.id}')">Delete</button></td>
      </tr>`).join('');
}

function renderSubjectList() {
  initCoursesData();
  const tbody = document.getElementById('subjectListBody');
  if (!tbody) return;
  tbody.innerHTML = app.subjects.length === 0
    ? '<tr><td colspan="4"><div class="empty-state"><h3>No subjects added</h3></div></td></tr>'
    : app.subjects.map(s => `<tr>
        <td><strong>${s.code}</strong></td>
        <td>${s.name}</td>
        <td>${s.units}</td>
        <td><button class="btn-small btn-delete" onclick="deleteSubject('${s.id}')">Delete</button></td>
      </tr>`).join('');
}

function deleteCourse(id) {
  initCoursesData();
  if (!confirm('Delete this course?')) return;
  app.courses = app.courses.filter(c => c.id !== id);
  app.save();
  renderCourseList();
  showMsg('courseMsgArea', '🗑️ Course deleted.', 'success');
}

function deleteSubject(id) {
  initCoursesData();
  if (!confirm('Delete this subject?')) return;
  app.subjects = app.subjects.filter(s => s.id !== id);
  app.save();
  renderSubjectList();
  showMsg('courseMsgArea', '🗑️ Subject deleted.', 'success');
}

// ===== FILE UPLOAD DISPLAY =====
document.addEventListener('change', e => {
  if (e.target.type !== 'file') return;
  const inputId = e.target.id;
  // Map: fileForm138 → Form138List, fileBirthCert → BirthCertList, fileCOR → CORList, etc.
  const listIdMap = {
    fileForm138: 'Form138List',
    fileBirthCert: 'BirthCertList',
    fileGoodMoral: 'GoodMoralList',
    fileValidID: 'ValidIDList',
    fileCOR: 'CORList',
    fileGrades: 'GradesList',
    fileSchoolID: 'SchoolIDList'
  };
  const listId = listIdMap[inputId] || inputId.replace('file', '') + 'List';
  const listEl = document.getElementById(listId);
  if (!listEl) return;
  if (e.target.files.length > 0) {
    listEl.style.display = 'block';
    listEl.innerHTML = Array.from(e.target.files).map(f => `
      <div class="file-item">
        <span>📄 ${f.name}</span>
        <span style="color:var(--muted);font-size:.85em;">${(f.size / 1024).toFixed(1)} KB</span>
      </div>`).join('');
  } else {
    listEl.style.display = 'none';
    listEl.innerHTML = '';
  }
});

// Close modal on backdrop click
window.addEventListener('click', e => {
  if (e.target.classList.contains('modal')) {
    e.target.classList.remove('active');
  }
});

// ===== UTILITIES =====
function setEl(id, text) { const el = document.getElementById(id); if (el) el.textContent = text; }
function setVal(id, val) { const el = document.getElementById(id); if (el) el.value = val; }
function getVal(id)      { return document.getElementById(id)?.value || ''; }
function cap(str)        { return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''; }

function showMsg(elementId, message, type) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.innerHTML = `<div class="${type}-msg">${message}</div>`;
  setTimeout(() => { if (el) el.innerHTML = ''; }, 4500);
}
