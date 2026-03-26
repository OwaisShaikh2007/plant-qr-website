// User password login logic for Plant QR
(function () {
  function get(id) {
    return document.getElementById(id);
  }

  function showError(msg) {
    var box = get("userLoginError");
    var container = get("userLoginErrorContainer");
    if (box) box.textContent = msg || "Something went wrong.";
    if (container) container.style.display = "block";
  }

  function clearError() {
    var container = get("userLoginErrorContainer");
    if (container) container.style.display = "none";
  }

  var form = get("userLoginForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearError();

    var emailOrPhone = (get("ulEmailOrPhone") && get("ulEmailOrPhone").value || "").trim();
    var password = (get("ulPassword") && get("ulPassword").value || "").trim();

    if (!emailOrPhone) {
      showError("Please enter your email or phone.");
      return;
    }
    if (!password) {
      showError("Please enter your password.");
      return;
    }

    var btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Signing in?";
    }

    fetch("https://plant-qr-website-production.up.railway.app/api/login-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emailOrPhone: emailOrPhone,
        password: password
      })
    })
      .then(function (r) { return r.json().then(function (data) { return { ok: r.ok, data: data }; }); })
      .then(function (res) {
        if (!res.ok || res.data.error) {
          showError(res.data.error || "Sign in failed. Please try again.");
          if (btn) {
            btn.disabled = false;
            btn.textContent = "Sign In";
          }
          return;
        }

        var u = res.data.user || {};
        try {
          sessionStorage.setItem("userRole", "user");
          sessionStorage.setItem("userName", u.name || "");
          sessionStorage.setItem("userEmail", u.email || "");
          sessionStorage.setItem("userPhone", u.phone || "");
          sessionStorage.setItem("userJoinedDate", u.dateAdded || u.createdAt || "");
          sessionStorage.setItem("userLastLogin", u.lastLogin || "");
        } catch (e) {}
        window.location.href = "dashboard.html";
      })
      .catch(function () {
        showError("Could not reach server. Please try again.");
        if (btn) {
          btn.disabled = false;
          btn.textContent = "Sign In";
        }
      });
  });
})();

