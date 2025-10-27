const credentials = {
  username: "admin",
  password: "12345",
};

const state = {
  students: [
    {
      id: "2023001",
      name: "李华",
      group: "高一(1)班",
      age: 16,
      phone: "138-0013-2311",
    },
    {
      id: "2023002",
      name: "王芳",
      group: "高一(2)班",
      age: 15,
      phone: "138-2213-2288",
    },
    {
      id: "2023003",
      name: "陈明",
      group: "高一(1)班",
      age: 16,
      phone: "137-7788-9900",
    },
    {
      id: "2023004",
      name: "赵倩",
      group: "高一(3)班",
      age: 15,
      phone: "139-2019-8899",
    },
  ],
  editTarget: null,
  search: "",
};

const loginForm = document.querySelector("#login-form");
const loginView = document.querySelector("#login-view");
const dashboardView = document.querySelector("#dashboard-view");
const loginError = document.querySelector("#login-error");
const logoutBtn = document.querySelector("#logout-btn");
const searchInput = document.querySelector(".search-input");

const totalStudentsEl = document.querySelector("#total-students");
const averageAgeEl = document.querySelector("#average-age");
const classCountEl = document.querySelector("#class-count");
const tableBody = document.querySelector("#student-table-body");

const addStudentBtn = document.querySelector("#add-student-btn");
const studentDialog = document.querySelector("#student-dialog");
const studentForm = document.querySelector("#student-form");
const dialogTitle = document.querySelector("#dialog-title");
const cancelStudentBtn = document.querySelector("#cancel-student");

const studentIdInput = document.querySelector("#student-id");
const studentNameInput = document.querySelector("#student-name");
const studentClassInput = document.querySelector("#student-class");
const studentAgeInput = document.querySelector("#student-age");
const studentPhoneInput = document.querySelector("#student-phone");

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const username = formData.get("username").trim();
  const password = formData.get("password").trim();

  if (username === credentials.username && password === credentials.password) {
    loginForm.reset();
    loginError.textContent = "";
    showDashboard();
    return;
  }

  loginError.textContent = "账号或密码不正确，请重新输入。";
});

logoutBtn.addEventListener("click", () => {
  showLogin();
});

searchInput?.addEventListener("input", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) {
    return;
  }
  state.search = target.value.trim();
  renderStudents();
});

addStudentBtn.addEventListener("click", () => {
  openStudentDialog();
});

tableBody.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  if (target.matches("[data-action='edit']")) {
    const id = target.dataset.id;
    const student = state.students.find((item) => item.id === id);
    if (student) {
      openStudentDialog(student);
    }
  }

  if (target.matches("[data-action='delete']")) {
    const id = target.dataset.id;
    const confirmed = confirm("确定要删除该学生信息吗？");
    if (confirmed) {
      state.students = state.students.filter((item) => item.id !== id);
      renderStudents();
      updateDashboardStats();
    }
  }
});

studentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(studentForm);
  const payload = {
    id: formData.get("id").trim(),
    name: formData.get("name").trim(),
    group: formData.get("group").trim(),
    age: Number(formData.get("age")),
    phone: formData.get("phone").trim(),
  };

  if (!payload.id || !payload.name || !payload.group || !payload.phone) {
    alert("请完整填写学生信息。");
    return;
  }

  if (!Number.isFinite(payload.age) || payload.age < 3 || payload.age > 100) {
    alert("请填写合理的年龄数字。");
    return;
  }

  const exists =
    state.students.find(
      (student) => student.id === payload.id && student.id !== state.editTarget
    ) !== undefined;

  if (exists) {
    alert("该学号已存在，请重新输入。");
    return;
  }

  if (state.editTarget) {
    const index = state.students.findIndex(
      (student) => student.id === state.editTarget
    );
    if (index > -1) {
      state.students[index] = payload;
    }
  } else {
    state.students.unshift(payload);
  }

  studentDialog.close();
  studentForm.reset();
  state.editTarget = null;
  renderStudents();
  updateDashboardStats();
});

studentDialog.addEventListener("close", () => {
  studentForm.reset();
  state.editTarget = null;
});

cancelStudentBtn.addEventListener("click", () => {
  studentDialog.close();
});

function showLogin() {
  loginView.hidden = false;
  dashboardView.hidden = true;
  document.body.dataset.view = "login";
}

function showDashboard() {
  loginView.hidden = true;
  dashboardView.hidden = false;
  document.body.dataset.view = "dashboard";
  renderStudents();
  updateDashboardStats();
}

function renderStudents() {
  const filtered = state.students.filter((student) => {
    if (!state.search) {
      return true;
    }
    const query = state.search.toLowerCase();
    return (
      student.name.toLowerCase().includes(query) ||
      student.id.toLowerCase().includes(query)
    );
  });

  if (filtered.length === 0) {
    tableBody.innerHTML =
      '<tr><td colspan="6" class="empty-row">暂无符合条件的学生，请调整搜索条件。</td></tr>';
    return;
  }

  const rows = filtered
    .map(
      (student) => `
      <tr>
        <td>${student.id}</td>
        <td>${student.name}</td>
        <td><span class="tag">${student.group}</span></td>
        <td>${student.age}</td>
        <td>${student.phone}</td>
        <td>
          <button class="btn ghost" data-action="edit" data-id="${student.id}">编辑</button>
          <button class="btn primary" data-action="delete" data-id="${student.id}">删除</button>
        </td>
      </tr>
    `
    )
    .join("");

  tableBody.innerHTML = rows;
}

function updateDashboardStats() {
  const total = state.students.length;
  const average =
    total === 0
      ? 0
      : (
          state.students.reduce((sum, student) => sum + Number(student.age), 0) /
          total
        ).toFixed(1);
  const classNames = new Set(state.students.map((student) => student.group));

  totalStudentsEl.textContent = total.toString();
  averageAgeEl.textContent = average;
  classCountEl.textContent = classNames.size.toString();
}

function openStudentDialog(student) {
  if (student) {
    dialogTitle.textContent = "编辑学生";
    studentIdInput.value = student.id;
    studentNameInput.value = student.name;
    studentClassInput.value = student.group;
    studentAgeInput.value = student.age.toString();
    studentPhoneInput.value = student.phone;
    state.editTarget = student.id;
  } else {
    dialogTitle.textContent = "新增学生";
    studentForm.reset();
    state.editTarget = null;
  }

  if (typeof studentDialog.showModal === "function") {
    studentDialog.showModal();
  } else {
    alert("当前浏览器不支持对话框组件，请升级浏览器。");
  }
}

showLogin();
