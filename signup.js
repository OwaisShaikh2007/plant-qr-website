// User signup logic for Plant QR
(function () {
  var API_URLS = [
    "https://plant-qr-website-production.up.railway.app",
    "https://plant-qr-website-production-e8fa.up.railway.app"
  ];

  function get(id) {
    return document.getElementById(id);
  }

  function showError(msg) {
    var box = get("signupError");
    var container = get("signupErrorContainer");
    if (box) box.textContent = msg || "Something went wrong.";
    if (container) container.style.display = "block";
  }

  function clearError() {
    var container = get("signupErrorContainer");
    if (container) container.style.display = "none";
  }

  var form = get("signupForm");
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
          // Some deployments can return HTML on 404; treat that as a retryable endpoint miss.
          if (r.status === 404) {
            return tryAt(index + 1);
          }
          return r.text().then(function (text) {
            var data = {};
            try { data = text ? JSON.parse(text) : {}; } catch (e) {}
            return { ok: r.ok, status: r.status, data: data };
          });
        })
        .catch(function () {
          return tryAt(index + 1);
        });
    }
    return tryAt(0);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearError();

    var name = (get("suName") && get("suName").value || "").trim();
    var email = (get("suEmail") && get("suEmail").value || "").trim();
    var phone = (get("suPhone") && get("suPhone").value || "").trim();
    var password = (get("suPassword") && get("suPassword").value || "").trim();
    var confirm = (get("suConfirm") && get("suConfirm").value || "").trim();

    if (!name) {
      showError("Please enter your full name.");
      return;
    }
    if (!email && !phone) {
      showError("Please provide at least an email or phone number.");
      return;
    }
    if (!password || password.length < 4) {
      showError("Password must be at least 4 characters long.");
      return;
    }
    if (password !== confirm) {
      showError("Passwords do not match.");
      return;
    }

    var btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Signing up…";
    }

    postJsonWithFallback("/api/signup", {
      name: name,
      email: email,
      phone: phone,
      password: password
    })
      .then(function (res) {
        if (!res.ok || res.data.error) {
          showError(res.data.error || ("Failed to sign up. (HTTP " + (res.status || "error") + ")"));
          if (btn) {
            btn.disabled = false;
            btn.textContent = "Sign Up";
          }
          return;
        }
        var u = res.data.user || {};
        try {
          sessionStorage.setItem("userRole", "user");
          sessionStorage.setItem("userName", u.name || name);
          sessionStorage.setItem("userEmail", u.email || email);
          sessionStorage.setItem("userPhone", u.phone || phone);
          sessionStorage.setItem("userJoinedDate", u.dateAdded || u.createdAt || "");
          sessionStorage.setItem("userLastLogin", u.lastLogin || "");
        } catch (e) {}
        window.location.href = "dashboard.html";
      })
      .catch(function (err) {
        showError((err && err.message) || "Could not reach server. Please try again.");
        if (btn) {
          btn.disabled = false;
          btn.textContent = "Sign Up";
        }
      });
  });
})();
