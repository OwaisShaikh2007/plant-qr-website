(function () {
  var displayIds = ["profile-fullname", "profile-email", "profile-phone"];
  var editIds = ["edit-fullname", "edit-email", "edit-phone"];
  var storageKeys = ["userName", "userEmail", "userPhone"];
  var profileNameId = "profile-name";

  function get(id) {
    return document.getElementById(id);
  }

  function switchToEditMode() {
    var i;
    for (i = 0; i < displayIds.length; i++) {
      var disp = get(displayIds[i]);
      var edit = get(editIds[i]);
      if (disp && edit) {
        edit.value = (disp.textContent || "").trim();
        if (edit.value === "—") edit.value = "";
        disp.style.display = "none";
        edit.style.display = "block";
      }
    }
    get("btn-edit-profile").style.display = "none";
    get("edit-actions").style.display = "inline";
  }

  function switchToViewMode() {
    var i;
    for (i = 0; i < displayIds.length; i++) {
      var disp = get(displayIds[i]);
      var edit = get(editIds[i]);
      if (disp && edit) {
        disp.style.display = "";
        edit.style.display = "none";
      }
    }
    get("btn-edit-profile").style.display = "inline-block";
    get("edit-actions").style.display = "none";
  }

  function saveToSessionAndUI() {
    var name = (get("edit-fullname") && get("edit-fullname").value || "").trim();
    var email = (get("edit-email") && get("edit-email").value || "").trim();
    var phone = (get("edit-phone") && get("edit-phone").value || "").trim();

    try {
      if (name) sessionStorage.setItem("userName", name);
      sessionStorage.setItem("userEmail", email);
      if (phone) sessionStorage.setItem("userPhone", phone);
    } catch (e) {}

    var nameDisplay = name || (window.userName || "User");
    var emailDisplay = email || "—";
    var phoneDisplay = phone || "—";

    var profileName = get(profileNameId);
    if (profileName) profileName.textContent = nameDisplay;
    if (get("profile-fullname")) get("profile-fullname").textContent = nameDisplay;
    if (get("profile-email")) get("profile-email").textContent = emailDisplay;
    if (get("profile-phone")) get("profile-phone").textContent = phoneDisplay;

    var sidebarName = document.querySelector(".sidebar-header .user-name");
    if (sidebarName) sidebarName.textContent = nameDisplay;
  }

  var btnEdit = get("btn-edit-profile");
  if (btnEdit) {
    btnEdit.addEventListener("click", function () {
      switchToEditMode();
    });
  }

  var btnSave = get("btn-save-profile");
  if (btnSave) {
    btnSave.addEventListener("click", function () {
      saveToSessionAndUI();
      switchToViewMode();
    });
  }

  var btnCancel = get("btn-cancel-edit");
  if (btnCancel) {
    btnCancel.addEventListener("click", function () {
      switchToViewMode();
    });
  }
})();
