/* =====================================================
   MEDICARE HOSPITAL MANAGEMENT SYSTEM
   Demo frontend version using localStorage
===================================================== */

/* ---------- STORAGE ---------- */

function loadData(key) {
    try {
        const value = JSON.parse(localStorage.getItem(key) || "[]");
        return Array.isArray(value) ? value : [];
    } catch {
        return [];
    }
}

let patients = loadData("hmsPatients");
let doctors = loadData("hmsDoctors");
let appointments = loadData("hmsAppointments");

const $ = id => document.getElementById(id);

const ADMIN_ACCOUNT = {
    email: "admin@medicare.demo",
    password: "Admin123",
    role: "admin",
    name: "Hospital Admin"
};

let selectedRole = "";
let currentUser = null;

function saveData() {
    try {
        localStorage.setItem("hmsPatients", JSON.stringify(patients));
        localStorage.setItem("hmsDoctors", JSON.stringify(doctors));
        localStorage.setItem("hmsAppointments", JSON.stringify(appointments));
        return true;
    } catch {
        showToast("Could not save. Browser storage may be full.");
        return false;
    }
}

function nextId(items) {
    return items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
}

function showToast(message) {
    const toast = $("toast");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2800);
}

function makeCell(row, value) {
    const cell = document.createElement("td");
    cell.textContent = value ?? "";
    row.appendChild(cell);
    return cell;
}

function makeButton(label, className, callback) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.className = "small-btn " + className;
    button.addEventListener("click", callback);
    return button;
}

function makeEmptyRow(table, message, columns) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = columns;
    cell.className = "empty-cell";
    cell.textContent = message;

    row.appendChild(cell);
    table.appendChild(row);
}

function safeDelete(message, callback) {
    if (confirm(message)) callback();
}

function escapeText(value) {
    return String(value ?? "");
}

function validPhone(phone) {
    return /^[0-9]{10}$/.test(phone);
}

function todayString() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

/* ---------- DEMO DOCTOR ACCOUNTS ---------- */

const demoDoctors = [
    {
        name: "Dr. Rahul Sharma",
        specialty: "Cardiology",
        phone: "9876543210",
        email: "rahul@medicare.demo",
        password: "Doctor123"
    },
    {
        name: "Dr. Priya Singh",
        specialty: "Dermatology",
        phone: "9876543211",
        email: "priya@medicare.demo",
        password: "Doctor123"
    },
    {
        name: "Dr. Amit Kumar",
        specialty: "Neurology",
        phone: "9876543212",
        email: "amit@medicare.demo",
        password: "Doctor123"
    },
    {
        name: "Dr. Neha Verma",
        specialty: "Pediatrics",
        phone: "9876543213",
        email: "neha@medicare.demo",
        password: "Doctor123"
    },
    {
        name: "Dr. Arjun Gupta",
        specialty: "Orthopedics",
        phone: "9876543214",
        email: "arjun@medicare.demo",
        password: "Doctor123"
    },
    {
        name: "Dr. Sneha Patel",
        specialty: "General Medicine",
        phone: "9876543215",
        email: "sneha@medicare.demo",
        password: "Doctor123"
    }
];

function seedDemoDoctors() {
    let changed = false;

    demoDoctors.forEach(demo => {
        let existing = doctors.find(
            doctor => (doctor.email || "").toLowerCase() === demo.email
        );

        if (!existing) {
            existing = doctors.find(
                doctor => doctor.name.toLowerCase() === demo.name.toLowerCase()
            );
        }

        if (existing) {
            if (!existing.email) {
                existing.email = demo.email;
                changed = true;
            }

            if (!existing.password) {
                existing.password = demo.password;
                changed = true;
            }

            if (!existing.specialty) {
                existing.specialty = demo.specialty;
                changed = true;
            }

            if (!existing.phone) {
                existing.phone = demo.phone;
                changed = true;
            }
        } else {
            doctors.push({
                id: nextId(doctors),
                ...demo,
                isDemo: true
            });
            changed = true;
        }
    });

    if (changed) saveData();
}

seedDemoDoctors();

/* ---------- AUTHENTICATION SCREEN ---------- */

function showAuthMessage(message, success = false) {
    const element = $("authMessage");
    element.textContent = message;
    element.style.color = success ? "#15803d" : "#dc2626";
}

function selectRole(role) {
    selectedRole = role;

    $("roleSelection").classList.add("hidden");
    $("loginPanel").classList.remove("hidden");
    $("registerPanel").classList.add("hidden");

    const labels = {
        patient: "Patient Login",
        doctor: "Doctor Login",
        admin: "Admin Login"
    };

    $("loginHeading").textContent = labels[role];
    $("loginDescription").textContent =
        `Login to your ${role} account.`;

    $("registerPrompt").classList.toggle("hidden", role !== "patient");
    $("loginForm").reset();
    showAuthMessage("");
}

document.querySelectorAll(".role-option").forEach(button => {
    button.addEventListener("click", () => {
        selectRole(button.dataset.role);
    });
});

$("backToRoles").addEventListener("click", () => {
    $("loginPanel").classList.add("hidden");
    $("registerPanel").classList.add("hidden");
    $("roleSelection").classList.remove("hidden");
    showAuthMessage("");
});

$("showRegister").addEventListener("click", () => {
    $("loginPanel").classList.add("hidden");
    $("registerPanel").classList.remove("hidden");
    $("registerForm").reset();
    showAuthMessage("");
});

$("backToLogin").addEventListener("click", () => {
    $("registerPanel").classList.add("hidden");
    $("loginPanel").classList.remove("hidden");
    showAuthMessage("");
});

/* ---------- LOGIN ---------- */

$("loginForm").addEventListener("submit", event => {
    event.preventDefault();

    const email = $("loginEmail").value.trim().toLowerCase();
    const password = $("loginPassword").value;

    if (!email || !password) {
        showAuthMessage("Please enter your email and password.");
        return;
    }

    let user = null;

    if (selectedRole === "admin") {
        if (
            email === ADMIN_ACCOUNT.email &&
            password === ADMIN_ACCOUNT.password
        ) {
            user = { ...ADMIN_ACCOUNT };
        }
    }

    if (selectedRole === "doctor") {
        const doctor = doctors.find(item =>
            (item.email || "").toLowerCase() === email &&
            item.password === password
        );

        if (doctor) {
            user = {
                id: doctor.id,
                name: doctor.name,
                email: doctor.email,
                specialty: doctor.specialty,
                role: "doctor"
            };
        }
    }

    if (selectedRole === "patient") {
        const patient = patients.find(item =>
            (item.email || "").toLowerCase() === email &&
            item.password === password
        );

        if (patient) {
            user = {
                id: patient.id,
                name: patient.name,
                email: patient.email,
                role: "patient"
            };
        }
    }

    if (!user) {
        showAuthMessage("Invalid email or password for this account type.");
        return;
    }

    loginUser(user);
});

/* ---------- PATIENT REGISTRATION ---------- */

$("registerForm").addEventListener("submit", event => {
    event.preventDefault();

    const name = $("registerName").value.trim();
    const age = Number($("registerAge").value);
    const gender = $("registerGender").value;
    const phone = $("registerPhone").value.trim();
    const email = $("registerEmail").value.trim().toLowerCase();
    const password = $("registerPassword").value;

    if (!name || !Number.isInteger(age) || age < 1 || age > 120 || !gender) {
        showAuthMessage("Please enter valid patient details.");
        return;
    }

    if (!validPhone(phone)) {
        showAuthMessage("Enter a valid 10-digit phone number.");
        return;
    }

    if (password.length < 6) {
        showAuthMessage("Password must contain at least 6 characters.");
        return;
    }

    const emailExists =
        patients.some(item => (item.email || "").toLowerCase() === email) ||
        doctors.some(item => (item.email || "").toLowerCase() === email) ||
        email === ADMIN_ACCOUNT.email;

    if (emailExists) {
        showAuthMessage("This email is already registered.");
        return;
    }

    const patient = {
        id: nextId(patients),
        name,
        age,
        gender,
        phone,
        email,
        password,
        createdAt: new Date().toISOString()
    };

    patients.push(patient);

    if (!saveData()) {
        patients.pop();
        return;
    }

    $("registerForm").reset();

    showAuthMessage("Registration successful. You can now log in.", true);

    setTimeout(() => {
        $("registerPanel").classList.add("hidden");
        $("loginPanel").classList.remove("hidden");
        $("loginEmail").value = email;
        $("loginPassword").value = "";
        showAuthMessage("Your account has been created. Please log in.", true);
    }, 900);
});

/* ---------- LOGIN / LOGOUT ---------- */

function loginUser(user) {
    currentUser = user;

    sessionStorage.setItem("hmsCurrentUser", JSON.stringify({
        id: user.id ?? null,
        name: user.name,
        email: user.email,
        role: user.role
    }));

    $("authScreen").classList.add("hidden");
    $("appScreen").classList.remove("hidden");

    $("sidebarUserName").textContent = user.name;
    $("sidebarUserRole").textContent = user.role;
    $("userAvatar").textContent = user.name.charAt(0).toUpperCase();
    $("roleBadge").textContent = user.role;

    buildNavigation();
    renderAll();

    if (user.role === "admin") {
        showPage("dashboard");
    } else if (user.role === "patient") {
        showPage("patientDashboard");
    } else {
        showPage("doctorDashboard");
    }
}

function logout() {
    currentUser = null;
    sessionStorage.removeItem("hmsCurrentUser");

    $("appScreen").classList.add("hidden");
    $("authScreen").classList.remove("hidden");

    $("roleSelection").classList.remove("hidden");
    $("loginPanel").classList.add("hidden");
    $("registerPanel").classList.add("hidden");

    $("loginForm").reset();
    $("registerForm").reset();
    showAuthMessage("");
}

$("logoutBtn").addEventListener("click", logout);

/* ---------- ROLE-BASED NAVIGATION ---------- */

const navigation = {
    admin: [
        { id: "dashboard", label: "▦ Dashboard" },
        { id: "patients", label: "👥 Patients" },
        { id: "doctors", label: "🩺 Doctors" },
        { id: "appointments", label: "📅 Appointments" }
    ],
    patient: [
        { id: "patientDashboard", label: "▦ My Dashboard" }
    ],
    doctor: [
        { id: "doctorDashboard", label: "▦ My Dashboard" }
    ]
};

const pageTitles = {
    dashboard: "Dashboard Overview",
    patients: "Patient Management",
    doctors: "Doctor Management",
    appointments: "Appointment Management",
    patientDashboard: "Patient Dashboard",
    doctorDashboard: "Doctor Dashboard"
};

function buildNavigation() {
    const nav = $("sidebarNav");
    nav.replaceChildren();

    const items = navigation[currentUser.role] || [];

    items.forEach(item => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "nav-btn";
        button.dataset.page = item.id;
        button.textContent = item.label;

        button.addEventListener("click", () => showPage(item.id));
        nav.appendChild(button);
    });
}

function showPage(pageId) {
    if (!currentUser) return;

    const allowedPages = navigation[currentUser.role].map(item => item.id);

    if (!allowedPages.includes(pageId)) {
        showToast("You do not have permission to open this page.");
        return;
    }

    document.querySelectorAll(".page").forEach(page => {
        page.classList.toggle("hidden", page.id !== pageId);
    });

    document.querySelectorAll(".nav-btn").forEach(button => {
        button.classList.toggle("active", button.dataset.page === pageId);
    });

    $("pageTitle").textContent = pageTitles[pageId] || "MediCare";
}

/* ---------- PATIENT MANAGEMENT ---------- */

$("patientForm").addEventListener("submit", event => {
    event.preventDefault();

    if (!currentUser || currentUser.role !== "admin") return;

    const name = $("patientName").value.trim();
    const age = Number($("patientAge").value);
    const gender = $("patientGender").value;
    const phone = $("patientPhone").value.trim();

    if (!name || !Number.isInteger(age) || age < 1 || age > 120 || !gender) {
        showToast("Please enter valid patient details.");
        return;
    }

    if (!validPhone(phone)) {
        showToast("Enter a valid 10-digit phone number.");
        return;
    }

    patients.push({
        id: nextId(patients),
        name,
        age,
        gender,
        phone
    });

    if (!saveData()) {
        patients.pop();
        return;
    }

    $("patientForm").reset();
    renderAll();
    showToast("Patient registered successfully.");
});

$("searchPatient").addEventListener("input", renderPatients);

function renderPatients() {
    const table = $("patientTable");
    if (!table) return;

    table.replaceChildren();

    const query = $("searchPatient").value.trim().toLowerCase();

    const filtered = patients.filter(patient =>
        (patient.name || "").toLowerCase().includes(query) ||
        (patient.phone || "").includes(query) ||
        String(patient.id).includes(query)
    );

    $("patientSubtitle").textContent =
        `${patients.length} registered patient(s)`;

    if (!filtered.length) {
        makeEmptyRow(table, "No matching patient records.", 6);
    }

    filtered.forEach(patient => {
        const row = document.createElement("tr");

        makeCell(row, "P" + String(patient.id).padStart(3, "0"));
        makeCell(row, patient.name);
        makeCell(row, patient.age);
        makeCell(row, patient.gender);
        makeCell(row, patient.phone);

        const action = makeCell(row, "");

        action.appendChild(makeButton("Delete", "delete-btn", () => {
            safeDelete("Delete this patient and their appointments?", () => {
                const oldPatients = patients;
                const oldAppointments = appointments;

                patients = patients.filter(item => item.id !== patient.id);
                appointments = appointments.filter(
                    item => item.patientId !== patient.id
                );

                if (!saveData()) {
                    patients = oldPatients;
                    appointments = oldAppointments;
                    return;
                }

                renderAll();
                showToast("Patient record deleted.");
            });
        }));

        table.appendChild(row);
    });
}

/* ---------- DOCTOR MANAGEMENT ---------- */

$("doctorForm").addEventListener("submit", event => {
    event.preventDefault();

    if (!currentUser || currentUser.role !== "admin") return;

    const name = $("doctorName").value.trim();
    const specialty = $("doctorSpecialty").value;
    const phone = $("doctorPhone").value.trim();
    const email = $("doctorEmail").value.trim().toLowerCase();
    const password = $("doctorPassword").value;

    if (!name || !specialty || !validPhone(phone)) {
        showToast("Enter a name, specialization and valid 10-digit number.");
        return;
    }

    if (!email || password.length < 6) {
        showToast("Enter a valid email and password of at least 6 characters.");
        return;
    }

    const emailExists =
        doctors.some(item => (item.email || "").toLowerCase() === email) ||
        patients.some(item => (item.email || "").toLowerCase() === email) ||
        email === ADMIN_ACCOUNT.email;

    if (emailExists) {
        showToast("This email is already in use.");
        return;
    }

    doctors.push({
        id: nextId(doctors),
        name,
        specialty,
        phone,
        email,
        password
    });

    if (!saveData()) {
        doctors.pop();
        return;
    }

    $("doctorForm").reset();
    renderAll();
    showToast("Doctor added. Their login account is ready.");
});

$("searchDoctor").addEventListener("input", renderDoctors);

function renderDoctors() {
    const table = $("doctorTable");
    if (!table) return;

    table.replaceChildren();

    const query = $("searchDoctor").value.trim().toLowerCase();

    const filtered = doctors.filter(doctor =>
        (doctor.name || "").toLowerCase().includes(query) ||
        (doctor.specialty || "").toLowerCase().includes(query) ||
        (doctor.phone || "").includes(query) ||
        (doctor.email || "").toLowerCase().includes(query)
    );

    if (!filtered.length) {
        makeEmptyRow(table, "No matching doctors. Add a doctor above.", 6);
    }

    filtered.forEach(doctor => {
        const row = document.createElement("tr");

        makeCell(row, "D" + String(doctor.id).padStart(3, "0"));
        makeCell(row, doctor.name);
        makeCell(row, doctor.specialty);
        makeCell(row, doctor.phone);
        makeCell(row, doctor.email || "Not set");

        const action = makeCell(row, "");

        action.appendChild(makeButton("Delete", "delete-btn", () => {
            const linked = appointments.some(item =>
                item.doctorId === doctor.id &&
                item.status === "Scheduled"
            );

            if (linked) {
                showToast("Cancel or complete scheduled appointments first.");
                return;
            }

            safeDelete("Delete this doctor and their appointment records?", () => {
                const oldDoctors = doctors;
                const oldAppointments = appointments;

                doctors = doctors.filter(item => item.id !== doctor.id);
                appointments = appointments.filter(
                    item => item.doctorId !== doctor.id
                );

                if (!saveData()) {
                    doctors = oldDoctors;
                    appointments = oldAppointments;
                    return;
                }

                renderAll();
                showToast("Doctor record deleted.");
            });
        }));

        table.appendChild(row);
    });
}

/* ---------- APPOINTMENT HELPERS ---------- */

function fillSelect(select, items, labelFunction, placeholder) {
    if (!select) return;

    const previousValue = select.value;
    select.replaceChildren();

    const first = document.createElement("option");
    first.value = "";
    first.textContent = placeholder;
    select.appendChild(first);

    items.forEach(item => {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = labelFunction(item);
        select.appendChild(option);
    });

    if (items.some(item => String(item.id) === previousValue)) {
        select.value = previousValue;
    }
}

function renderAppointmentOptions() {
    fillSelect(
        $("appointmentPatient"),
        patients,
        patient => `${patient.name} (P${patient.id})`,
        "Select patient"
    );

    fillSelect(
        $("appointmentDoctor"),
        doctors,
        doctor => `${doctor.name} — ${doctor.specialty}`,
        "Select doctor"
    );

    fillSelect(
        $("patientBookingDoctor"),
        doctors,
        doctor => `${doctor.name} — ${doctor.specialty}`,
        "Select doctor"
    );
}

function getPatientName(id) {
    return patients.find(item => item.id === id)?.name || "Deleted patient";
}

function getDoctorName(id) {
    return doctors.find(item => item.id === id)?.name || "Deleted doctor";
}

function getDoctor(id) {
    return doctors.find(item => item.id === id);
}

function getStatusBadge(status) {
    const badge = document.createElement("span");
    badge.className = "status status-" + String(status).toLowerCase();
    badge.textContent = status;
    return badge;
}

function hasDoctorClash(doctorId, date, time, excludedId = null) {
    return appointments.some(item =>
        item.id !== excludedId &&
        item.doctorId === doctorId &&
        item.date === date &&
        item.time === time &&
        item.status === "Scheduled"
    );
}

function createAppointment(patientId, doctorId, date, time) {
    if (!patients.some(item => item.id === patientId)) {
        showToast("Please select a valid patient.");
        return false;
    }

    if (!doctors.some(item => item.id === doctorId)) {
        showToast("Please select a valid doctor.");
        return false;
    }

    if (!date || !time || date < todayString()) {
        showToast("Choose a valid current or future date and time.");
        return false;
    }

    if (hasDoctorClash(doctorId, date, time)) {
        showToast("This doctor already has a booking at that time.");
        return false;
    }

    const appointment = {
        id: nextId(appointments),
        patientId,
        doctorId,
        date,
        time,
        status: "Scheduled"
    };

    appointments.push(appointment);

    if (!saveData()) {
        appointments.pop();
        return false;
    }

    renderAll();
    return true;
}

/* ---------- ADMIN APPOINTMENT BOOKING ---------- */

$("appointmentDate").min = todayString();
$("patientBookingDate").min = todayString();

$("appointmentForm").addEventListener("submit", event => {
    event.preventDefault();

    if (!currentUser || currentUser.role !== "admin") return;

    const patientId = Number($("appointmentPatient").value);
    const doctorId = Number($("appointmentDoctor").value);
    const date = $("appointmentDate").value;
    const time = $("appointmentTime").value;

    if (createAppointment(patientId, doctorId, date, time)) {
        $("appointmentForm").reset();
        showToast("Appointment booked successfully.");
    }
});

/* ---------- ADMIN APPOINTMENT TABLE ---------- */

$("searchAppointment").addEventListener("input", renderAppointments);

function renderAppointments() {
    const table = $("appointmentTable");
    if (!table) return;

    table.replaceChildren();

    const query = $("searchAppointment").value.trim().toLowerCase();

    const filtered = [...appointments]
        .sort((a, b) =>
            (a.date + a.time).localeCompare(b.date + b.time)
        )
        .filter(item =>
            getPatientName(item.patientId).toLowerCase().includes(query) ||
            getDoctorName(item.doctorId).toLowerCase().includes(query) ||
            (item.date || "").includes(query) ||
            (item.status || "").toLowerCase().includes(query)
        );

    if (!filtered.length) {
        makeEmptyRow(table, "No matching appointments.", 7);
    }

    filtered.forEach(item => {
        const row = document.createElement("tr");

        makeCell(row, "A" + String(item.id).padStart(3, "0"));
        makeCell(row, getPatientName(item.patientId));
        makeCell(row, getDoctorName(item.doctorId));
        makeCell(row, item.date);
        makeCell(row, item.time);

        const statusCell = makeCell(row, "");
        statusCell.appendChild(getStatusBadge(item.status));

        const action = makeCell(row, "");

        if (item.status === "Scheduled") {
            const statusSelect = document.createElement("select");
            statusSelect.className = "status-select";

            ["Scheduled", "Completed", "Cancelled"].forEach(status => {
                const option = document.createElement("option");
                option.value = status;
                option.textContent = status;
                statusSelect.appendChild(option);
            });

            statusSelect.value = item.status;

            statusSelect.addEventListener("change", () => {
                const previous = item.status;
                item.status = statusSelect.value;

                if (!saveData()) {
                    item.status = previous;
                    statusSelect.value = previous;
                    return;
                }

                renderAll();
                showToast("Appointment status updated.");
            });

            action.appendChild(statusSelect);
        }

        action.appendChild(makeButton("Delete", "delete-btn", () => {
            safeDelete("Delete this appointment?", () => {
                const oldAppointments = appointments;

                appointments = appointments.filter(
                    appointment => appointment.id !== item.id
                );

                if (!saveData()) {
                    appointments = oldAppointments;
                    return;
                }

                renderAll();
                showToast("Appointment deleted.");
            });
        }));

        table.appendChild(row);
    });
}

/* ---------- ADMIN DASHBOARD ---------- */

function renderDashboard() {
    $("totalPatients").textContent = patients.length;
    $("totalDoctors").textContent = doctors.length;
    $("totalAppointments").textContent = appointments.length;

    $("completedAppointments").textContent = appointments.filter(
        item => item.status === "Completed"
    ).length;

    const table = $("recentAppointments");
    table.replaceChildren();

    const recent = [...appointments]
        .sort((a, b) =>
            (b.date + b.time).localeCompare(a.date + a.time)
        )
        .slice(0, 5);

    if (!recent.length) {
        makeEmptyRow(table, "No appointments booked yet.", 5);
        return;
    }

    recent.forEach(item => {
        const row = document.createElement("tr");

        makeCell(row, getPatientName(item.patientId));
        makeCell(row, getDoctorName(item.doctorId));
        makeCell(row, item.date);
        makeCell(row, item.time);

        const cell = makeCell(row, "");
        cell.appendChild(getStatusBadge(item.status));

        table.appendChild(row);
    });
}

/* ---------- PATIENT DASHBOARD ---------- */

$("patientBookingForm").addEventListener("submit", event => {
    event.preventDefault();

    if (!currentUser || currentUser.role !== "patient") return;

    const doctorId = Number($("patientBookingDoctor").value);
    const date = $("patientBookingDate").value;
    const time = $("patientBookingTime").value;

    if (createAppointment(currentUser.id, doctorId, date, time)) {
        $("patientBookingForm").reset();
        showToast("Your appointment has been booked.");
    }
});

function renderPatientDashboard() {
    if (!currentUser || currentUser.role !== "patient") return;

    const myAppointments = appointments.filter(
        item => item.patientId === currentUser.id
    );

    $("patientWelcome").textContent = `Welcome, ${currentUser.name}`;

    $("myPatientAppointments").textContent = myAppointments.length;

    $("myUpcomingAppointments").textContent = myAppointments.filter(
        item => item.status === "Scheduled"
    ).length;

    $("myCompletedAppointments").textContent = myAppointments.filter(
        item => item.status === "Completed"
    ).length;

    const table = $("patientAppointmentsTable");
    table.replaceChildren();

    const sorted = [...myAppointments].sort((a, b) =>
        (a.date + a.time).localeCompare(b.date + b.time)
    );

    if (!sorted.length) {
        makeEmptyRow(table, "You have not booked any appointments yet.", 5);
    }

    sorted.forEach(item => {
        const doctor = getDoctor(item.doctorId);
        const row = document.createElement("tr");

        makeCell(row, doctor?.name || "Deleted doctor");
        makeCell(row, doctor?.specialty || "-");
        makeCell(row, item.date);
        makeCell(row, item.time);

        const statusCell = makeCell(row, "");
        statusCell.appendChild(getStatusBadge(item.status));

        table.appendChild(row);
    });

    renderPatientDoctorList();
}

function renderPatientDoctorList() {
    const container = $("patientDoctorList");
    container.replaceChildren();

    if (!doctors.length) {
        const message = document.createElement("p");
        message.textContent = "No doctors are currently available.";
        container.appendChild(message);
        return;
    }

    doctors.forEach(doctor => {
        const card = document.createElement("div");
        card.className = "doctor-card";

        const name = document.createElement("h4");
        name.textContent = doctor.name;

        const specialty = document.createElement("p");
        specialty.textContent = `Specialization: ${doctor.specialty}`;

        const phone = document.createElement("p");
        phone.textContent = `Phone: ${doctor.phone || "Not provided"}`;

        card.append(name, specialty, phone);
        container.appendChild(card);
    });
}

/* ---------- DOCTOR DASHBOARD ---------- */

function updateDoctorAppointmentStatus(appointment, newStatus) {
    if (!currentUser || currentUser.role !== "doctor") return;

    if (appointment.doctorId !== currentUser.id) {
        showToast("You cannot update another doctor's appointment.");
        return;
    }

    if (!["Scheduled", "Completed", "Cancelled"].includes(newStatus)) {
        showToast("Invalid appointment status.");
        return;
    }

    const previous = appointment.status;
    appointment.status = newStatus;

    if (!saveData()) {
        appointment.status = previous;
        return;
    }

    renderAll();
    showToast("Appointment status updated.");
}

function renderDoctorDashboard() {
    if (!currentUser || currentUser.role !== "doctor") return;

    const myAppointments = appointments.filter(
        item => item.doctorId === currentUser.id
    );

    $("doctorWelcome").textContent = `Welcome, ${currentUser.name}`;
    $("doctorSpecialtyText").textContent =
        currentUser.specialty || "Doctor Dashboard";

    $("doctorTotalAppointments").textContent = myAppointments.length;

    $("doctorScheduledAppointments").textContent =
        myAppointments.filter(item => item.status === "Scheduled").length;

    $("doctorCompletedAppointments").textContent =
        myAppointments.filter(item => item.status === "Completed").length;

    const table = $("doctorAppointmentsTable");
    table.replaceChildren();

    const sorted = [...myAppointments].sort((a, b) =>
        (a.date + a.time).localeCompare(b.date + b.time)
    );

    if (!sorted.length) {
        makeEmptyRow(table, "You have no assigned appointments yet.", 5);
        return;
    }

    sorted.forEach(item => {
        const row = document.createElement("tr");

        makeCell(row, getPatientName(item.patientId));
        makeCell(row, item.date);
        makeCell(row, item.time);

        const statusCell = makeCell(row, "");
        statusCell.appendChild(getStatusBadge(item.status));

        const actionCell = makeCell(row, "");

        if (item.status === "Scheduled") {
            const statusSelect = document.createElement("select");
            statusSelect.className = "status-select";

            ["Scheduled", "Completed", "Cancelled"].forEach(status => {
                const option = document.createElement("option");
                option.value = status;
                option.textContent = status;
                statusSelect.appendChild(option);
            });

            statusSelect.value = item.status;

            statusSelect.addEventListener("change", () => {
                updateDoctorAppointmentStatus(item, statusSelect.value);
            });

            actionCell.appendChild(statusSelect);
        } else {
            actionCell.textContent = "No action";
        }

        table.appendChild(row);
    });
}

/* ---------- REFRESH ALL MODULES ---------- */

function renderAll() {
    renderPatients();
    renderDoctors();
    renderAppointmentOptions();
    renderAppointments();

    if (currentUser?.role === "admin") {
        renderDashboard();
    }

    if (currentUser?.role === "patient") {
        renderPatientDashboard();
    }

    if (currentUser?.role === "doctor") {
        renderDoctorDashboard();
    }
}

/* ---------- RESTORE CURRENT SESSION ---------- */

function restoreSession() {
    try {
        const savedUser = JSON.parse(
            sessionStorage.getItem("hmsCurrentUser") || "null"
        );

        if (!savedUser || !savedUser.role) return;

        if (savedUser.role === "admin") {
            if (
                savedUser.email === ADMIN_ACCOUNT.email &&
                savedUser.name === ADMIN_ACCOUNT.name
            ) {
                loginUser(ADMIN_ACCOUNT);
            }
            return;
        }

        if (savedUser.role === "patient") {
            const patient = patients.find(item => item.id === savedUser.id);

            if (patient) {
                loginUser({
                    id: patient.id,
                    name: patient.name,
                    email: patient.email,
                    role: "patient"
                });
            }
            return;
        }

        if (savedUser.role === "doctor") {
            const doctor = doctors.find(item => item.id === savedUser.id);

            if (doctor) {
                loginUser({
                    id: doctor.id,
                    name: doctor.name,
                    email: doctor.email,
                    specialty: doctor.specialty,
                    role: "doctor"
                });
            }
        }
    } catch {
        sessionStorage.removeItem("hmsCurrentUser");
    }
}

/* ---------- START APPLICATION ---------- */

renderAll();
restoreSession();