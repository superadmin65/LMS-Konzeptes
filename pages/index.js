import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { apiService } from "../utils/apiService";
import Intro from "konzeptes/Intro";
import Head from "next/head";
import "./login.css";
import { Eye, EyeOff, Mail } from "lucide-react";

export default function HomeView() {
  const [isSignup, setIsSignup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  const [form, setForm] = useState({
    identifier: "",
    password: "",
    salutation: "",
    p_first: "",
    p_last: "",
    c_first: "",
    c_last: "",
    level: "",
    mobile: "",
    email: "",
    username: "",
    package: "",
    grade: "",
    language: [],
    curriculum: "",
  });

  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowLangDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    if (loggedIn === "true") setIsLoggedIn(true);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      const showPopup = localStorage.getItem("show_login_popup");
      if (showPopup === "true") {
        localStorage.removeItem("show_login_popup");
        Swal.fire({
          html: `
            <div style="padding: 10px; font-family: 'Quicksand', sans-serif;">
              <div style="width: 70px; height: 70px; border: 3px solid #2b7d10; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="#2b7d10" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <h3 style="color: #2b7d10; font-size: 18px; font-weight: 600; margin: 0;">Login Success!</h3>
            </div>`,
          showConfirmButton: true,
          confirmButtonText: "OK",
          buttonsStyling: false,
          width: "380px",
          background: "#f4f9f4",
          backdrop: `rgba(0,0,0,0.7)`,
          customClass: {
            popup: "custom-login-popup",
            backdrop: "custom-blur-backdrop",
            confirmButton: "custom-login-btn",
          },
        });
      }
    }
  }, [isLoggedIn]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setForm({ ...form, mobile: value });
  };

  const handleAuth = async (e) => {
    e.preventDefault();

    const actualIdentifier = (form.identifier || "").trim();
    const actualPassword = (form.password || "").trim();

    try {
      const action = isSignup ? apiService.register : apiService.login;
      const payload = isSignup
        ? {
            salutation: form.salutation,
            p_first_name: form.p_first,
            p_last_name: form.p_last,
            c_first_name: form.c_first,
            c_last_name: form.c_last,
            level: form.level,
            mobile: form.mobile,
            email: form.email,

            package_type: form.package,
            grade: form.grade,
            language: form.language.join(","),
            curriculum: form.curriculum,
          }
        : { identifier: actualIdentifier, password: actualPassword };

      const { data } = await action(payload);

      if (data.status === "success") {
        if (isSignup) {
          await Swal.fire({
            icon: "success",
            title: "Account Created!",
            html: `
    <div style="text-align:left">
      <b>Username:</b> ${data.username}<br/>
      <b>Password:</b> ${data.password}<br/><br/>
      <small>Please save these credentials.</small>
    </div>
  `,
            confirmButtonColor: "#33691e",
          });
          await fetch("http://localhost:5000/api/send-email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: form.email,
              username: data.username,
              password: data.password,
            }),
          });
          setIsSignup(false);
        } else {
          localStorage.setItem("user_id", data.user_id);
          localStorage.setItem("user_email", data.email || actualIdentifier || "");
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("child_name", data.c_first_name || "");
          localStorage.setItem("parent_name", data.p_first_name || "");
          localStorage.setItem("profile_pic", data.profile_pic || "");
          localStorage.setItem("grade", data.grade || "");
          localStorage.setItem("language", data.language || "");
          localStorage.setItem("curriculum", data.curriculum || "");
          window.dispatchEvent(
            new CustomEvent("profile-updated", {
              detail: {
                profile_pic: data.profile_pic || "",
                child_name: data.c_first_name || "",
                parent_name: data.p_first_name || "",
              },
            })
          );
          localStorage.setItem("show_login_popup", "true");
          setIsLoggedIn(true);
        }
      } else {
        Swal.fire({
          icon: "error",
          text: data.message || "Action Failed",
          confirmButtonColor: "#33691e",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        text: "Server Connection Error",
        confirmButtonColor: "#33691e",
      });
    }
  };

  // Reset form when switching between login / register
  useEffect(() => {
    if (isSignup) {
      setForm({
        identifier: "",
        password: "",
        salutation: "",
        p_first: "",
        p_last: "",
        c_first: "",
        c_last: "",
        level: "",
        mobile: "",
        email: "",
        package: "",
        grade: "",
        language: [],
        curriculum: "",
      });
    }
  }, [isSignup]);

  if (isLoggedIn) {
    return (
      <>
        <Head>
          <title>Konzeptes | Learning App 🎓</title>
        </Head>
        <style jsx global>{`
          .custom-blur-backdrop {
            backdrop-filter: blur(10px) !important;
            -webkit-backdrop-filter: blur(10px) !important;
            background: rgba(0, 0, 0, 0.45) !important;
          }
          .custom-login-popup { border-radius: 16px !important; }
          .custom-login-btn {
            background-color: #2b7d10 !important;
            color: white !important;
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
            padding: 10px 36px !important;
            border-radius: 8px !important;
            font-family: "Quicksand", sans-serif !important;
            font-weight: 700 !important;
            font-size: 15px !important;
            cursor: pointer !important;
            margin-top: 10px !important;
            transition: all 0.2s ease !important;
          }
          .custom-login-btn:hover,
          .custom-login-btn:focus {
            background-color: #1e5c0b !important;
            box-shadow: 0 4px 12px rgba(43, 125, 16, 0.3) !important;
            outline: none !important;
          }
        `}</style>
        <Intro />
      </>
    );
  }

  return (
    <div className="auth-page">
      <Head>
        <title>
          {isSignup ? "Konzeptes | Register" : "Konzeptes | Login"}
        </title>
      </Head>

      {!isSignup ? (
        /* ===================================================
           LOGIN — flat split layout (no white card popup)
        =================================================== */
        <div className="konz-split">
          {/* LEFT — brand panel */}
          <aside className="konz-split__brand">
            <div className="konz-split__logo-row">
              <img
                src="/img/konzeptes/logo.png"
                alt="Konzeptes"
                className="konz-split__brand-logo"
              />
            </div>
            <div className="konz-split__brand-copy">
              <h2>Welcome back, learner!</h2>
              <p>
                Pick up right where you left off — your concepts, exercises
                and progress are all waiting for you.
              </p>
            </div>
          </aside>

          {/* RIGHT — login form (flat, no card) */}
          <section className="konz-split__form">
            <img
              src="/img/konzeptes/logo.png"
              alt="Konzeptes"
              className="konz-split__mobile-logo"
            />

            <h1 className="konz-split__title">Login</h1>
            <p className="konz-split__subtitle">
              Sign in to continue your learning journey.
            </p>

            <form
              onSubmit={handleAuth}
              className="konz-split__form-fields"
              autoComplete="on"
            >
              <div className="konz-field">
                <label className="konz-field__label">Email / Username</label>
                <div className="konz-field__input-wrap">
                  <span className="konz-field__icon-left">
                    <Mail size={18} />
                  </span>
                  <input
                    name="identifier"
                    type="text"
                    placeholder="Email/Username"
                    required
                    value={form.identifier || ""}
                    onChange={handleChange}
                    autoComplete="username"
                    className="konz-field__input konz-field__input--has-left"
                  />
                </div>
              </div>

              <div className="konz-field">
                <label className="konz-field__label">Password</label>
                <div className="konz-field__input-wrap">
                  <input
                    name="password"
                    type={showPass ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    className="konz-field__input konz-field__input--has-right"
                  />
                  <span
                    className="konz-field__icon-right"
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? <Eye size={18} /> : <EyeOff size={18} />}
                  </span>
                </div>
              </div>

              <div className="konz-split__row">
                <label className="konz-split__remember">
                  <input type="checkbox" /> Remember me
                </label>
                <a href="#" className="konz-split__forgot">
                  Forgot password?
                </a>
              </div>

              <button type="submit" className="konz-split__submit">
                Login <span aria-hidden="true">→</span>
              </button>

              <p
                className="konz-split__toggle"
                onClick={() => setIsSignup(true)}
              >
                Create New Account
              </p>
            </form>
          </section>
        </div>
      ) : (
        /* ===================================================
           REGISTER — flat split layout (no white card popup)
        =================================================== */
        <div className="konz-split">
          {/* LEFT — brand panel */}
          <aside className="konz-split__brand">
            <div className="konz-split__logo-row">
              <img
                src="/img/konzeptes/logo.png"
                alt="Konzeptes"
                className="konz-split__brand-logo"
              />
            </div>
            <div className="konz-split__brand-copy">
              <h2>Start your learning journey!</h2>
              <p>
                Create your account and get access to exercises, progress
                tracking, and personalised content for your child.
              </p>
            </div>
          </aside>

          {/* RIGHT — register form (flat, no card) */}
          <section className="konz-split__form konz-reg">
            <img
              src="/img/konzeptes/logo.png"
              alt="Konzeptes"
              className="konz-split__mobile-logo"
            />

            <h1 className="konz-split__title">Create Account</h1>
            <p className="konz-split__subtitle">
              Join thousands of students already learning.
            </p>

            <form
              onSubmit={handleAuth}
              className="konz-split__form-fields"
              autoComplete="off"
            >
              {/* ── STUDENT DETAILS ── */}
              <span className="konz-reg__section-label">🎓 Student Details</span>
              <div className="konz-reg__grid konz-reg__grid--2">
                <div className="konz-field">
                  <label className="konz-field__label">First Name</label>
                  <input
                    name="c_first"
                    placeholder="First name"
                    required
                    value={form.c_first}
                    onChange={handleChange}
                    className="konz-field__input"
                  />
                </div>
                <div className="konz-field">
                  <label className="konz-field__label">Last Name</label>
                  <input
                    name="c_last"
                    placeholder="Last name"
                    required
                    value={form.c_last}
                    onChange={handleChange}
                    className="konz-field__input"
                  />
                </div>
              </div>

              {/* ── PARENT DETAILS ── */}
              <span className="konz-reg__section-label">👤 Parent Details</span>
              <div className="konz-reg__grid konz-reg__grid--3">
                <div className="konz-field konz-reg__salutation">
                  <label className="konz-field__label">Title</label>
                  <select
                    name="salutation"
                    required
                    value={form.salutation}
                    onChange={handleChange}
                    className="konz-field__input"
                  >
                    <option value="">—</option>
                    <option>Mr.</option>
                    <option>Mrs.</option>
                    <option>Ms.</option>
                  </select>
                </div>
                <div className="konz-field">
                  <label className="konz-field__label">First Name</label>
                  <input
                    name="p_first"
                    placeholder="First name"
                    required
                    value={form.p_first}
                    onChange={handleChange}
                    className="konz-field__input"
                  />
                </div>
                <div className="konz-field">
                  <label className="konz-field__label">Last Name</label>
                  <input
                    name="p_last"
                    placeholder="Last name"
                    required
                    value={form.p_last}
                    onChange={handleChange}
                    className="konz-field__input"
                  />
                </div>
              </div>

              <div className="konz-reg__grid konz-reg__grid--2">
                <div className="konz-field">
                  <label className="konz-field__label">Mobile</label>
                  <input
                    name="mobile"
                    placeholder="Mobile number"
                    required
                    value={form.mobile}
                    maxLength={10}
                    onChange={handleMobileChange}
                    className="konz-field__input"
                  />
                </div>
                <div className="konz-field">
                  <label className="konz-field__label">Email</label>
                  <div className="konz-field__input-wrap">
                    <span className="konz-field__icon-left">
                      <Mail size={16} />
                    </span>
                    <input
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={form.email}
                      onChange={handleChange}
                      autoComplete="off"
                      className="konz-field__input konz-field__input--has-left"
                    />
                  </div>
                </div>
              </div>

              {/* Password (kept commented as in original) */}
              <div className="konz-field">
                {/*<label className="konz-field__label">Password</label>
                <div className="konz-field__input-wrap">
                  <input
                    name="password"
                    type={showPass ? "text" : "password"}
                    placeholder="Create a password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    className="konz-field__input konz-field__input--has-right"
                  />
                  <span
                    className="konz-field__icon-right"
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? <Eye size={16} /> : <EyeOff size={16} />}
                  </span>
                </div>*/}
              </div>

              {/* ── ACCOUNT INFO ── */}
              <span className="konz-reg__section-label">📚 Account Info</span>
              <div className="konz-reg__grid konz-reg__grid--2">
                <div className="konz-field">
                  <label className="konz-field__label">Grade</label>
                  <select
                    name="grade"
                    required
                    value={form.grade}
                    onChange={handleChange}
                    className="konz-field__input"
                  >
                    <option value="">Select grade</option>
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

                <div className="konz-field">
                  <label className="konz-field__label">Curriculum</label>
                  <select
                    name="curriculum"
                    required
                    value={form.curriculum}
                    onChange={handleChange}
                    className="konz-field__input"
                  >
                    <option value="">Select curriculum</option>
                    <option value="MOE">MOE</option>
                    <option value="IGCSE">IGCSE</option>
                    <option value="IB">IB</option>
                    <option value="CBSE">CBSE</option>
                  </select>
                </div>

                {/* Language multi-select */}
                <div className="konz-field">
                  <label className="konz-field__label">Language</label>
                  <div className="konz-reg__lang-wrap" ref={dropdownRef}>
                    <div
                      className="konz-reg__lang-box"
                      onClick={() => setShowLangDropdown(!showLangDropdown)}
                    >
                      {form.language.length > 0
                        ? form.language.join(", ")
                        : "Select language"}
                    </div>
                    {showLangDropdown && (
                      <div className="konz-reg__lang-dropdown">
                        {["Hindi", "French", "German"].map((lang) => (
                          <label key={lang} className="konz-reg__lang-item">
                            <input
                              type="checkbox"
                              checked={form.language.includes(lang)}
                              onChange={() => {
                                const updated = form.language.includes(lang)
                                  ? form.language.filter((l) => l !== lang)
                                  : [...form.language, lang];
                                setForm({ ...form, language: updated });
                              }}
                            />
                            {lang}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="konz-field">
                  <label className="konz-field__label">Package</label>
                  <select
                    name="package"
                    required
                    value={form.package}
                    onChange={handleChange}
                    className="konz-field__input"
                  >
                    <option value="">Select package</option>
                    <option value="free">Free</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>

              {/* ── SUBMIT ── */}
              <button
                type="submit"
                className="konz-split__submit"
                style={{ marginTop: "20px" }}
              >
                Create Account <span aria-hidden="true">→</span>
              </button>

              <p
                className="konz-split__toggle"
                onClick={() => setIsSignup(false)}
              >
                Already have an account? Login
              </p>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
