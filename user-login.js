// User password login logic for Plant QR
(function () {
  var API_URLS = [
    "https://plant-qr-website-production.up.railway.app",
    "https://plant-qr-website-production-e8fa.up.railway.app"
  ];

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
      btn.textContent = "Signing in…";
    }

    postJsonWithFallback("/api/login-user", {
      emailOrPhone: emailOrPhone,
      password: password
    })
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
        var nowIso = new Date().toISOString();
        var finalName = u.name || "";
        var finalEmail = u.email || "";
        var finalPhone = u.phone || "";
        var key = "plantQrAccountDates::" + [
          "user",
          String(finalEmail).trim().toLowerCase(),
          cleanPhone(finalPhone),
          String(finalName).trim().toLowerCase()
        ].join("|");
        var prev = {};
        try {
          var raw = localStorage.getItem(key);
          if (raw) prev = JSON.parse(raw) || {};
        } catch (e) {}
        var finalJoined = u.dateAdded || u.createdAt || prev.joinedDate || nowIso;
        var finalLastLogin = u.lastLogin || nowIso;
        try {
          sessionStorage.setItem("userRole", "user");
          sessionStorage.setItem("userName", finalName);
          sessionStorage.setItem("userEmail", finalEmail);
          sessionStorage.setItem("userPhone", finalPhone);
          sessionStorage.setItem("userJoinedDate", finalJoined);
          sessionStorage.setItem("userLastLogin", finalLastLogin);
        } catch (e) {}
        saveAccountDates("user", finalName, finalEmail, finalPhone, finalJoined, finalLastLogin);
        window.location.href = "dashboard.html";
      })
      .catch(function (err) {
        showError((err && err.message) || "Could not reach server. Please try again.");
        if (btn) {
          btn.disabled = false;
          btn.textContent = "Sign In";
        }
      });
  });
})();

