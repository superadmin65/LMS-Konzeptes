import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import "./profile.css";
import Swal from "sweetalert2";
import { apiService } from "../utils/apiService";

const Icons = {
  profile: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  ),
  courses: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  ),
  progress: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  settings: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  lock: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  check: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
};

export default function Profile() {
  const [form, setForm] = useState({
    c_first: "",
    c_last: "",
    p_first: "",
    p_last: "",
    mobile: "",
    email: "",
    grade: "",
    curriculum: "",
    language: [],
    package: "",
    new_password: "",
    confirm_password: "",
    profile_pic: "",
  });

  const [avatar, setAvatar] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user_id = localStorage.getItem("user_id");
        if (!user_id) return;

        const { data } = await apiService.getProfile({ user_id });

        if (data.status === "success") {
          localStorage.setItem("child_name", data.c_first_name || "");
          localStorage.setItem("parent_name", data.p_first_name || "");
          localStorage.setItem("profile_pic", data.profile_pic || "");

          setForm({
            c_first: data.c_first_name || "",
            c_last: data.c_last_name || "",
            p_first: data.p_first_name || "",
            p_last: data.p_last_name || "",
            mobile: data.mobile || "",
            email: data.email || "",
            grade: data.grade || "",
            curriculum: data.curriculum || "",
            language: Array.isArray(data.language)
              ? data.language
              : data.language
                ? data.language.split(",")
                : [],
            package: data.user_package || "",
            profile_pic: data.profile_pic || "",
            password: data.password || "",
          });
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowLangDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setAvatar(reader.result);
    reader.readAsDataURL(file);
  };

  const toggleLanguage = (lang) => {
    const updated = form.language.includes(lang)
      ? form.language.filter((l) => l !== lang)
      : [...form.language, lang];
    setForm({ ...form, language: updated });
  };

  const handleCancel = () => window.history.back();

  const handleSave = () => {
    Swal.fire({
      showConfirmButton: false,
      showCancelButton: false,
      html: `
        <div style="font-family:'Quicksand',sans-serif;text-align:center;padding:10px 0">
          <div style="width:70px;height:70px;border:3px solid #2b7d10;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 15px">
            <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="#2b7d10" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h3 style="margin:0 0 8px;font-size:20px;color:#2b7d10;font-weight:700">Save Changes?</h3>
          <p style="font-size:15px;margin:0 0 22px;color:#555">Do you want to update your profile details?</p>
          <div style="display:flex;gap:12px;justify-content:center">
            <button id="swal-cancel" style="background:#fff;color:#2b7d10;border:2px solid #2b7d10;padding:10px 0;border-radius:8px;font-weight:700;font-size:14px;cursor:pointer;flex:1">Cancel</button>
            <button id="swal-confirm" style="background:#2b7d10;color:#fff;border:2px solid #2b7d10;padding:10px 0;border-radius:8px;font-weight:700;font-size:14px;cursor:pointer;flex:1">Yes, Save</button>
          </div>
        </div>`,
      width: "360px",
      padding: "20px",
      background: "#f4f9f4",
      backdrop: "rgba(0,0,0,0.7)",
      customClass: { popup: "custom-swal-shape" },
      didOpen: () => {
        document.getElementById("swal-cancel").onclick = () => Swal.close();
        document.getElementById("swal-confirm").onclick = () => {
          Swal.close();
          executeSave();
        };
      },
    });
  };

  const executeSave = async () => {
    try {
      if (form.new_password && form.new_password !== form.confirm_password) {
        Swal.fire("Error", "Passwords do not match", "error");
        return;
      }

      const payload = {
        user_id: localStorage.getItem("user_id"),
        p_first_name: form.p_first,
        p_last_name: form.p_last,
        c_first_name: form.c_first,
        c_last_name: form.c_last,
        mobile: form.mobile,
        grade: form.grade,
        curriculum: form.curriculum,
        language: form.language.join(","),
        package_type: form.package,
        profile_pic: avatar || form.profile_pic,
      };

      if (form.new_password) payload.password = form.new_password;

      await apiService.updateProfile(payload);

      const newPic = avatar || form.profile_pic || "";
      const newChild = form.c_first || "";
      const newParent = form.p_first || "";

      localStorage.setItem("profile_pic", newPic);
      localStorage.setItem("child_name", newChild);
      localStorage.setItem("parent_name", newParent);

      window.dispatchEvent(
        new CustomEvent("profile-updated", {
          detail: { profile_pic: newPic, child_name: newChild, parent_name: newParent },
        })
      );

      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "Something went wrong!" });
    }
  };

  const displayInitial = (form.c_first || form.p_first || "?").charAt(0).toUpperCase();
  const displayName = [form.c_first, form.c_last].filter(Boolean).join(" ") || "—";
  const avatarStyle = avatar
    ? { backgroundImage: `url(${avatar})`, backgroundColor: "transparent" }
    : form.profile_pic
      ? { backgroundImage: `url(${form.profile_pic})`, backgroundColor: "transparent" }
      : {};

  return (
    <>
      <Head>
        <title>Konzeptes | Profile</title>
      </Head>

      <input
        type="file"
        id="avatarUpload"
        style={{ display: "none" }}
        accept="image/*"
        onChange={handleAvatar}
      />

      {showToast && (
        <div className="profile-toast">
          {Icons.check}
          Profile updated successfully!
        </div>
      )}

      <div className="profile-page">

        {/* ── HEADER ── */}
        <header className="profile-header">
          <div className="profile-header__title">
            <h1>My <span>Profile</span></h1>
            <p>Manage your account &amp; preferences</p>
          </div>
          <div className="profile-header__actions">
            <button className="profile-btn-close" onClick={handleCancel} aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </header>

        {/* ── BODY ── */}
        <div className="profile-body">

          {/* ── LEFT SIDEBAR ── */}
          <aside className="profile-sidebar">

            <div className="profile-sidebar__card">
              <div className="profile-avatar-block">
                <div
                  className="profile-avatar"
                  style={avatarStyle}
                  onClick={() => document.getElementById("avatarUpload").click()}
                >
                  {!avatar && !form.profile_pic && displayInitial}
                  <span className="profile-avatar__edit-hint">Change</span>
                </div>
                <p className="profile-avatar__name">{displayName}</p>
                <p className="profile-avatar__sub">
                  Student{form.grade ? ` · ${form.grade}` : ""}
                </p>
                <span className="profile-avatar__badge">ACTIVE</span>
              </div>
            </div>

            <div className="profile-sidebar__card">
              <ul className="profile-nav">
                <li className="active">{Icons.profile} Profile</li>
                <li>{Icons.courses} My Courses</li>
                <li>{Icons.progress} Progress</li>
                <li>{Icons.settings} Settings</li>
              </ul>
            </div>

            <div className="profile-sidebar__card">
              <p className="profile-overview__label">Overview</p>
              <div className="profile-overview-grid">
                <div className="profile-overview-cell">
                  <span className="profile-overview-cell__val">{form.curriculum || "—"}</span>
                  <span className="profile-overview-cell__key">Board</span>
                </div>
                <div className="profile-overview-cell">
                  <span className="profile-overview-cell__val">
                    {form.grade ? form.grade.replace("Primary ", "P").replace("Secondary ", "S") : "—"}
                  </span>
                  <span className="profile-overview-cell__key">Grade</span>
                </div>
                <div className="profile-overview-cell" style={{ gridColumn: "span 2" }}>
                  <span className="profile-overview-cell__val" style={{ fontSize: "13px" }}>
                    {form.language.length > 0 ? form.language.join(", ") : "—"}
                  </span>
                  <span className="profile-overview-cell__key">Language</span>
                </div>
                <div className="profile-overview-cell" style={{ gridColumn: "span 2" }}>
                  <span className="profile-overview-cell__val" style={{ textTransform: "capitalize" }}>
                    {form.package || "—"}
                  </span>
                  <span className="profile-overview-cell__key">Package</span>
                </div>
              </div>
            </div>

          </aside>

          {/* ── RIGHT CONTENT ── */}
          <main className="profile-content">

            {/* 01 — Student Details */}
            <section className="profile-section">
              <div className="profile-section__head">
                <div>
                  <p className="profile-section__label">01 — Student</p>
                  <h2 className="profile-section__title">Student details</h2>
                </div>
              </div>
              <div className="profile-fields">
                <div className="pf-col-6 profile-field-wrap">
                  <label>First Name</label>
                  <input name="c_first" value={form.c_first} onChange={handleChange} placeholder="First Name" />
                </div>
                <div className="pf-col-6 profile-field-wrap">
                  <label>Last Name</label>
                  <input name="c_last" value={form.c_last} onChange={handleChange} placeholder="Last Name" />
                </div>
              </div>
            </section>

            {/* 02 — Parent Details */}
            <section className="profile-section">
              <div className="profile-section__head">
                <div>
                  <p className="profile-section__label">02 — Parent</p>
                  <h2 className="profile-section__title">Parent details</h2>
                </div>
              </div>
              <div className="profile-fields">
                <div className="pf-col-4 profile-field-wrap">
                  <label>First Name</label>
                  <input name="p_first" value={form.p_first} onChange={handleChange} placeholder="First Name" />
                </div>
                <div className="pf-col-4 profile-field-wrap">
                  <label>Last Name</label>
                  <input name="p_last" value={form.p_last} onChange={handleChange} placeholder="Last Name" />
                </div>
                <div className="pf-col-4 profile-field-wrap">
                  <label>Phone</label>
                  <input name="mobile" value={form.mobile} onChange={handleChange} placeholder="Mobile" />
                </div>
                <div className="pf-col-12 profile-field-wrap">
                  <label>Email Address</label>
                  <input name="email" value={form.email} placeholder="Email" readOnly />
                </div>
              </div>
            </section>

            {/* 03 — Account Info */}
            <section className="profile-section">
              <div className="profile-section__head">
                <div>
                  <p className="profile-section__label">03 — Account</p>
                  <h2 className="profile-section__title">Account info</h2>
                </div>
              </div>
              <div className="profile-fields">
                <div className="pf-col-4 profile-field-wrap">
                  <label>Grade</label>
                  <select name="grade" value={form.grade} onChange={handleChange}>
                    <option value="">Select Grade</option>
                    <option>Primary 1</option>
                    <option>Primary 2</option>
                    <option>Primary 3</option>
                    <option>Primary 4</option>
                    <option>Primary 5</option>
                    <option>Primary 6 (PSLE)</option>
                    <option>Secondary 1</option>
                    <option>Secondary 2</option>
                    <option>Secondary 3</option>
                    <option>Secondary 4 (O Level)</option>
                    <option>A Level</option>
                  </select>
                </div>
                <div className="pf-col-4 profile-field-wrap">
                  <label>Board</label>
                  <select name="curriculum" value={form.curriculum} onChange={handleChange}>
                    <option value="">Select Curriculum</option>
                    <option value="MOE">MOE</option>
                    <option value="IGCSE">IGCSE</option>
                    <option value="IB">IB</option>
                    <option value="CBSE">CBSE</option>
                  </select>
                </div>
                <div className="pf-col-4 profile-field-wrap">
                  <label>Language</label>
                  <div className="profile-lang-wrap" ref={dropdownRef}>
                    <div
                      className="profile-lang-box"
                      onClick={() => setShowLangDropdown(!showLangDropdown)}
                    >
                      {form.language.length > 0 ? form.language.join(", ") : "Select Language"}
                    </div>
                    {showLangDropdown && (
                      <div className="profile-lang-dropdown">
                        {["Hindi", "French", "German"].map((lang) => (
                          <label key={lang} className="profile-lang-item">
                            <input
                              type="checkbox"
                              checked={form.language.includes(lang)}
                              onChange={() => toggleLanguage(lang)}
                            />
                            {lang}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="pf-col-12 profile-field-wrap">
                  <label>Package</label>
                  <select name="package" value={form.package} onChange={handleChange}>
                    <option value="">Select Package</option>
                    <option value="free">Free</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>
            </section>

            {/* 04 — Change Password */}
            <section className="profile-section profile-section--dark">
              <div className="profile-section__head">
                <div>
                  <p className="profile-section__label">04 — Security</p>
                  <h2 className="profile-section__title">Change password</h2>
                </div>
                {Icons.lock}
              </div>
              <div className="profile-fields">
                <div className="pf-col-6 profile-field-wrap">
                  <label>New Password</label>
                  <input type="password" name="new_password" placeholder="Enter new password" onChange={handleChange} />
                </div>
                <div className="pf-col-6 profile-field-wrap">
                  <label>Confirm Password</label>
                  <input type="password" name="confirm_password" placeholder="Confirm new password" onChange={handleChange} />
                </div>
                <p className="profile-hint pf-col-12">
                  Use at least 8 characters with a mix of letters and numbers.
                </p>
              </div>
            </section>

            {/* ── SAVE BUTTON — aligned with form fields ── */}
            <div className="profile-save-bar">
              <button className="profile-save-all" onClick={handleSave}>
                Save all changes
              </button>
            </div>

          </main>

        </div>{/* end profile-body */}

      </div>{/* end profile-page */}
    </>
  );
}