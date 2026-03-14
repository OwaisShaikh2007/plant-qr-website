// Admin password login logic (no OTP) for Plant QR
(function () {
  var API_URL = "https://plant-qr-website-production.up.railway.app";
  function get(id) {
    return document.getElementById(id);
  }

  function showError(msg) {
    var box = get("loginError");
    var container = get("errorContainer");
    if (box) box.textContent = msg || "Something went wrong.";
    if (container) container.style.display = "block";
  }

  function clearError() {
    var container = get("errorContainer");
    if (container) container.style.display = "none";
  }

  // Switch between admin/user radio buttons
  var typeRadios = document.querySelectorAll('input[name="loginType"]');
  if (typeRadios && typeRadios.length) {
    typeRadios.forEach(function (radio) {
      radio.addEventListener("change", function () {
        var v = (this && this.value) || "";
        if (v === "user") {
          // For users, go to dedicated user login page
          window.location.href = "user-login.html";
        }
      });
    });
  }

  var form = document.querySelector(".login-form");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearError();

    var selected = document.querySelector('input[name="loginType"]:checked');
    var loginType = (selected && selected.value) || "admin";

    if (loginType === "user") {
      // Safety: redirect users to correct flow if they submit this form
      window.location.href = "user-login.html";
      return;
    }

    var email = (get("email") && get("email").value || "").trim();
    var password = (get("password") && get("password").value || "").trim();

    if (!email) {
      showError("Please enter admin email.");
      return;
    }
    if (!password) {
      showError("Please enter admin password.");
      return;
    }

    var btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Signing in…";
    }

    fetch(API_URL + "/api/login-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: password })
    })
      .then(function (r) { return r.json().then(function (data) { return { ok: r.ok, data: data }; }); })
      .then(function (res) {
        if (!res.ok || res.data.error) {
          showError(res.data.error || "Admin sign in failed. Please check your credentials.");
          if (btn) {
            btn.disabled = false;
            btn.textContent = "Sign In as Admin";
          }
          return;
        }

        var a = res.data.admin || {};
        try {
          sessionStorage.setItem("userRole", "admin");
          sessionStorage.setItem("userName", a.name || "Admin User");
          sessionStorage.setItem("userEmail", a.email || email);
          sessionStorage.setItem("userPhone", a.phone || "");
        } catch (e) {}

        window.location.href = "dashboard.html";
      })
      .catch(function () {
        showError("Could not reach server. Is it running on port 3001? Run: npm start");
        if (btn) {
          btn.disabled = false;
          btn.textContent = "Sign In as Admin";
        }
      });
  });
})();
