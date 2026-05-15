import styled, { keyframes } from "styled-components";
import Link from "next/link";
import { useRouter } from "next/router";
import UserDropdown from "comps/UserDropdown";
import { useEffect, useState } from "react";
import { apiService } from "../utils/apiService";

const float = keyframes`
  0%   { transform: translateY(0px) rotate(0deg); }
  50%  { transform: translateY(-14px) rotate(1.2deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const slideIn = keyframes`
  from { opacity: 0; transform: translateX(20px); }
  to   { opacity: 1; transform: translateX(0); }
`;
const popIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
`;
const ringPulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50%       { transform: scale(1.04); opacity: 0.8; }
`;

const FLAG_MAP = {
  French: "🇫🇷", Spanish: "🇪🇸", German: "🇩🇪",
  English: "🇬🇧", Portuguese: "🇵🇹", Italian: "🇮🇹",
  Japanese: "🇯🇵", Chinese: "🇨🇳", Arabic: "🇸🇦", Dutch: "🇳🇱",
};

const Styled = styled.div`
  font-family: "Poppins", sans-serif;
  min-height: 100vh;
  width: 100vw;
  background: #eef3e8;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  position: relative;

  &::before {
    content: "";
    position: fixed;
    top: -120px;
    right: -120px;
    width: 440px;
    height: 440px;
    border-radius: 50%;
   background: radial-gradient(circle, rgba(51,105,30,0.08) 0%, transparent 72%);
    pointer-events: none;
    z-index: 0;
  }

  .topbar {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 32px;
    position: relative;
    z-index: 10;
    flex-shrink: 0;
  }

  .logo-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .logo-img {
    height: 52px;
    display: block;
    filter: drop-shadow(0 2px 6px rgba(27, 94, 32, 0.15));
  }

  .main {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 32px 48px 32px;
    position: relative;
    z-index: 2;
    gap: 32px;
  }

  .left {
    flex: 1;
    max-width: 560px;
    display: flex;
    flex-direction: column;
    animation: ${fadeUp} 0.45s ease both;
  }

  .heading {
    margin-bottom: 28px;
  }
  .heading h1 {
    font-size: clamp(26px, 3.2vw, 40px);
    font-weight: 800;
    color: #111;
    margin: 0 0 4px 0;
    line-height: 1.12;
    letter-spacing: -0.8px;
  }
  .heading h1 span {
    color: #2e7d32;
    text-decoration: underline;
    text-underline-offset: 6px;
    text-decoration-color: rgba(46, 125, 50, 0.45);
    text-decoration-thickness: 3px;
  }
  .heading p {
    font-size: 14px;
    color: #6b7c6b;
    font-weight: 400;
    margin: 14px 0 0 0;
    line-height: 1.65;
    max-width: 380px;
  }

  .panels {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;
    animation: ${popIn} 0.4s 0.1s ease both;
  }

  .sel-panel {
    background: #f1f8e9;
border: 1px solid #dcedc8;
    border-radius: 14px;
    padding: 14px 18px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .sel-panel:hover {
    border-color: #a5d6a7;
    box-shadow: 0 4px 18px rgba(27, 94, 32, 0.10);
  }

  .panel-label {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #6fa85e;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .panel-label::before {
    content: "";
    display: inline-block;
    width: 12px; height: 2px;
    background: #7aaa68;
    border-radius: 2px;
  }

  .grade-row { display: flex; align-items: center; gap: 12px; }
  .grade-icon {
    width: 40px; height: 40px; border-radius: 12px;
    background: linear-gradient(135deg, #1b5e20, #43a047);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0;
    box-shadow: 0 3px 10px rgba(27, 94, 32, 0.22);
  }
  .gi-sub {
    display: block; font-size: 9px; font-weight: 700;
    color: #6fa85e; letter-spacing: 0.8px; text-transform: uppercase;
    margin-bottom: 2px;
  }
  .gi-val {
    display: block; font-size: 14px; font-weight: 700; color: #1a2e19;
    line-height: 1.2;
  }

  .lang-pills { display: flex; flex-wrap: wrap; gap: 8px; }
  .lang-pill {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 15px; border-radius: 999px;
    font-weight: 600; font-size: 13px; cursor: pointer;
    transition: all 0.2s ease; font-family: "Poppins", sans-serif;
    background: #ffffff;
color: #33691e;
border: 1.5px solid #c8e6c9;
  }
  .lang-pill:hover {
    background: #e8f5e2; border-color: #2e7d32;
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(46, 125, 50, 0.14);
  }
  .lang-pill.active {
   background: #33691e;
    border-color: transparent; color: #fff;
    box-shadow: 0 5px 14px rgba(27, 94, 32, 0.30);
    transform: scale(1.04);
  }
  .pill-flag { font-size: 15px; }

  .action-row {
    display: flex;
    align-items: center;
    gap: 18px;
    animation: ${fadeUp} 0.4s 0.2s ease both;
  }

  .actionBtn {
    display: inline-flex; align-items: center; gap: 10px;
    background: #33691e;
    color: #fff; font-weight: 700; font-size: 15px;
    padding: 14px 36px; border-radius: 14px; text-decoration: none;
    transition: all 0.25s ease; font-family: "Poppins", sans-serif;
    letter-spacing: 0.2px;
    box-shadow: 0 6px 22px rgba(27, 94, 32, 0.28);
    border-top: 1px solid rgba(255, 255, 255, 0.18);
    flex-shrink: 0;
    white-space: nowrap;
  }
  .actionBtn:hover {
    background: #1b5e20;
    transform: translateY(-2px);
    box-shadow: 0 10px 28px rgba(27, 94, 32, 0.38);
  }
  .btn-arrow { font-size: 18px; transition: transform 0.2s; }
  .actionBtn:hover .btn-arrow { transform: translateX(5px); }

  .right {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    animation: ${slideIn} 0.5s 0.08s ease both;
    transform: translateX(20px);
  }

  .mascot-circle {
    width: clamp(260px, 32vw, 380px);
    height: clamp(260px, 32vw, 380px);
    border-radius: 50%;
    background: radial-gradient(circle at 40% 38%, #dcedc8 0%, #c5e1a5 45%, #aed581 100%);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    overflow: hidden;
    position: relative;
    box-shadow:
      0 20px 60px rgba(27, 94, 32, 0.16),
      0 4px 16px rgba(27, 94, 32, 0.10);
  }
  .mascot-ring {
    position: absolute;
    inset: -8px;
    border-radius: 50%;
    border: 2px dashed rgba(46, 125, 50, 0.20);
    animation: ${ringPulse} 4s ease-in-out infinite;
    pointer-events: none;
  }
  .mascot-wrap {
    animation: ${float} 4.6s ease-in-out infinite;
    filter: drop-shadow(0 16px 28px rgba(0, 0, 0, 0.18));
    position: relative;
    z-index: 2;
    margin-bottom: -4px;
  }
  .mascot {
    height: clamp(200px, 26vw, 310px);
    display: block;
  }

  .dot-dec {
    position: absolute;
    border-radius: 50%;
    background: #2e7d32;
    opacity: var(--op);
    width: var(--s); height: var(--s);
  }

  @media (max-width: 900px) {
    .main { gap: 32px; padding: 0 32px 40px; }
    .topbar { padding: 18px 32px; }
  }

  @media (max-width: 768px) {
    .main {
      flex-direction: column;
      align-items: center;
      padding: 0 20px 40px;
      gap: 32px;
    }
    .left { max-width: 100%; align-items: flex-start; }
    .right { order: -1; }
    .mascot-circle { width: 220px; height: 220px; }
    .mascot { height: 180px !important; }
    .heading h1 { font-size: 32px; }
    .topbar { padding: 16px 20px; }
    .action-row { flex-wrap: wrap; }
  }

  @media (max-width: 480px) {
    .heading h1 { font-size: 27px; }
    .mascot-circle { width: 190px; height: 190px; }
    .mascot { height: 155px !important; }
    .lang-pill { padding: 7px 12px; font-size: 12px; }
    .actionBtn { width: 100%; justify-content: center; }
    .action-row { flex-direction: column; align-items: flex-start; width: 100%; }
  }
`;

export default function Intro() {
  const router = useRouter();
  const basePath = router.basePath || "";

  const [user, setUser]             = useState({});
  const [languages, setLanguages]   = useState([]);
  const [activeLang, setActiveLang] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user_id = localStorage.getItem("user_id");
        if (!user_id) return;
        const { data } = await apiService.getProfile({ user_id });
        if (data.status === "success") {
          setUser(data);
          const langs = data.language ? data.language.split(",") : [];
          setLanguages(langs);
          setActiveLang(langs[0]?.trim() || "");
        }
      } catch (err) {
        console.error("Profile error", err);
      }
    };
    fetchProfile();
  }, []);

  const grade = user.grade || "";

  return (
    <Styled>
      <div className="topbar">
        <div className="logo-row">
          <img className="logo-img" src={`${basePath}/img/konzeptes/logo.png`} alt="KONZEPTES" />
        </div>
        <UserDropdown />
      </div>

      <div className="main">
        <div className="left">
          <div className="heading">
            <h1>
              Welcome to<br />
              <span>Konzeptes!</span>
            </h1>
            <p>Select your grade and language to begin your session.</p>
          </div>

          <div className="panels">
            <div className="sel-panel">
              <div className="panel-label">Your Grade</div>
              <div className="grade-row">
                <div className="grade-icon">🎓</div>
                <div>
                  <span className="gi-sub">Enrolled as</span>
                  <span className="gi-val">{grade || "No Grade Selected"}</span>
                </div>
              </div>
            </div>

            <div className="sel-panel">
              <div className="panel-label">Learning Language</div>
              <div className="lang-pills">
                {languages.length > 0 ? (
                  languages.map((lang) => {
                    const trimmed = lang.trim();
                    return (
                      <button
                        key={trimmed}
                        className={`lang-pill${activeLang === trimmed ? " active" : ""}`}
                        onClick={() => setActiveLang(trimmed)}
                      >
                        <span className="pill-flag">{FLAG_MAP[trimmed] ?? "🌐"}</span>
                        {trimmed}
                      </button>
                    );
                  })
                ) : (
                  <button className="lang-pill" disabled>🌐 No Language</button>
                )}
              </div>
            </div>
          </div>

          <div className="action-row">
            <Link className="actionBtn" href="/home">
              Let&apos;s Go <span className="btn-arrow">→</span>
            </Link>
          </div>
        </div>

        <div className="right">
          <div className="mascot-circle">
            <div className="mascot-ring" />
            <div className="dot-dec" style={{ "--s": "8px", "--op": 0.18, top: "14%", left: "10%" }} />
            <div className="dot-dec" style={{ "--s": "5px", "--op": 0.14, top: "22%", right: "12%" }} />
            <div className="dot-dec" style={{ "--s": "6px", "--op": 0.12, bottom: "18%", left: "8%" }} />
            <div className="mascot-wrap">
              <img className="mascot" src={`${basePath}/img/konzeptes/kea.png`} alt="mascot" />
            </div>
          </div>
        </div>
      </div>
    </Styled>
  );
}