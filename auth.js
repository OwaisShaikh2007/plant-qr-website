(function () {
  var role = (sessionStorage && sessionStorage.getItem("userRole")) || "admin";
  var name = (sessionStorage && sessionStorage.getItem("userName")) || (role === "admin" ? "Admin User" : "User");
  var email = (sessionStorage && sessionStorage.getItem("userEmail")) || "";
  var phone = (sessionStorage && sessionStorage.getItem("userPhone")) || "";

  window.userRole = role;
  window.userName = name;
  window.userEmail = email;
  window.userPhone = phone;
  var isAdmin = role === "admin";

  // Sidebar: panel label and user badge
  var panelLabel = document.querySelector(".sidebar-header p");
  if (panelLabel) panelLabel.textContent = isAdmin ? "Admin Panel" : "User Portal";

  var userNameEl = document.querySelector(".sidebar-header .user-name");
  if (userNameEl) userNameEl.textContent = name;

  var roleIcon = document.querySelector(".sidebar-header .user-role-icon");
  if (roleIcon) roleIcon.textContent = isAdmin ? "A" : "U";

  // Hide admin-only nav and content for non-admin
  document.querySelectorAll(".admin-only").forEach(function (el) {
    el.style.display = isAdmin ? "" : "none";
  });

  // Hide user-only nav and content for admin (show only for user)
  document.querySelectorAll(".user-only").forEach(function (el) {
    el.style.display = isAdmin ? "none" : "";
  });

  // Profile page: show logged-in user's name, email, phone, role
  var profileName = document.getElementById("profile-name");
  var profileFullname = document.getElementById("profile-fullname");
  var profileEmail = document.getElementById("profile-email");
  var profilePhone = document.getElementById("profile-phone");
  var profileRole = document.getElementById("profile-role");
  var profileRoleValue = document.getElementById("profile-role-value");
  var roleText = isAdmin ? "Administrator" : "User";
  if (profileName) profileName.textContent = name;
  if (profileFullname) profileFullname.textContent = name;
  if (profileEmail) profileEmail.textContent = email || "—";
  if (profilePhone) profilePhone.textContent = phone || "—";
  if (profileRole) profileRole.textContent = roleText;
  if (profileRoleValue) profileRoleValue.textContent = roleText;

  // Logout: clear session
  var logoutBtn = document.querySelector(".btn-logout");
  if (logoutBtn && logoutBtn.href) {
    var href = logoutBtn.getAttribute("href");
    if (href && href.indexOf("index") !== -1) {
      logoutBtn.addEventListener("click", function () {
        try { sessionStorage.removeItem("userRole"); sessionStorage.removeItem("userName"); sessionStorage.removeItem("userEmail"); sessionStorage.removeItem("userPhone"); } catch (e) {}
      });
    }
  }
})();
