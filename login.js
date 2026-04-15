// Admin password login logic (no OTP) for Plant QR
(function () {
  var API_URLS = [
    "https://plant-qr-website-production.up.railway.app",
    "https://plant-qr-website-production-e8fa.up.railway.app"
  ];
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

  function postJsonWithFallback(path, body) {
    function tryAt(index) {
      if (index >= API_URLS.length) {
        throw new Error("Could not reach server. Please try again.");
      }
      return fetch(API_URLS[index] + path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })
        .then(function (r) {
          return r.json().catch(function () { return {}; }).then(function (data) {
            return { ok: r.ok, data: data };
          });
        })
        .catch(function () {
          return tryAt(index + 1);
        });
    }
    return tryAt(0);
  }
  function cleanPhone(v) {
    return String(v || "").replace(/\D/g, "");
  }
  function saveAccountDates(role, name, email, phone, joinedDate, lastLogin) {
    var key = "plantQrAccountDates::" + [
      role || "",
      String(email || "").trim().toLowerCase(),
      cleanPhone(phone),
      String(name || "").trim().toLowerCase()
    ].join("|");
    try {
      var prev = {};
      var raw = localStorage.getItem(key);
      if (raw) prev = JSON.parse(raw) || {};
      localStorage.setItem(key, JSON.stringify({
        joinedDate: joinedDate || prev.joinedDate || "",
        lastLogin: lastLogin || prev.lastLogin || ""
      }));
    } catch (e) {}
  }

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

    postJsonWithFallback("/api/login-admin", { email: email, password: password })
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
        var nowIso = new Date().toISOString();
        var finalName = a.name || "Admin User";
        var finalEmail = a.email || email;
        var finalPhone = a.phone || "";
        var key = "plantQrAccountDates::" + [
          "admin",
          String(finalEmail).trim().toLowerCase(),
          cleanPhone(finalPhone),
          String(finalName).trim().toLowerCase()
        ].join("|");
        var prev = {};
        try {
          var raw = localStorage.getItem(key);
          if (raw) prev = JSON.parse(raw) || {};
        } catch (e) {}
        var finalJoined = a.dateAdded || a.createdAt || prev.joinedDate || nowIso;
        var finalLastLogin = a.lastLogin || nowIso;
        try {
          sessionStorage.setItem("userRole", "admin");
          sessionStorage.setItem("userName", finalName);
          sessionStorage.setItem("userEmail", finalEmail);
          sessionStorage.setItem("userPhone", finalPhone);
          sessionStorage.setItem("userJoinedDate", finalJoined);
          sessionStorage.setItem("userLastLogin", finalLastLogin);
        } catch (e) {}
        saveAccountDates("admin", finalName, finalEmail, finalPhone, finalJoined, finalLastLogin);

        window.location.href = "dashboard.html";
      })
      .catch(function (err) {
        showError((err && err.message) || "Could not reach server. Please try again.");
        if (btn) {
          btn.disabled = false;
          btn.textContent = "Sign In as Admin";
        }
      });
  });
})();
