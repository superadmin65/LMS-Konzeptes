import React, { useState, useEffect, useRef } from "react";
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import styled from "styled-components";
import { useRouter } from "next/router";
import { usePathname } from "next/navigation";
import { loadAsset, publicPath } from "utils";
import { getDataFromGroupAct } from "utils/playlistUtils";
import { Button } from "base/comps";
import IconView from "./curriculumViews/IconViewMini";
import PIconView from "./curriculumViews/PIconView";
import SubCards from "./curriculumViews/SubCards";
import LZString from "lz-string";
import { apiService } from "../utils/apiService";
import Link from "node_modules/next/link";
import McqAct from "./acts/McqAct";
import CompleteWordAct from "./acts/CompleteWordAct";
import WordSearchAct from "./acts/WordSearchAct";
import SequenceAct from "./acts/SequenceAct";
import ClassifySentenceAct from "./acts/ClassifySentenceAct";
import MatchByAct from "./acts/MatchByAct";
import InformationProcessingAct from "./acts/InformationProcessingAct";
import DragDropAct from "./acts/DragDropAct";
import VisualInfoProcessingAct from "./acts/VisualInfoProcessingAct";
import MatchPairs from "./acts/MatchPairs";
import JoinWords from "./acts/completePuzzle";
import FillupAct from "./acts/FillupAct";
import SelectWordAct from "./acts/SelectWordAct";
import RightOneAct from "./acts/RightOneAct";
import GroupAct from "./acts/GroupAct";
import ClickAndDragAct from "./acts/ClickAndDragAct";


const Styled = styled.div`
  display: flex;
  position: relative;
  user-select: none;
  color: #222;
  font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif;

  /* ── Sidebar ── */
  .sidebar {
    width: 256px;
    height: 100vh;
    background: #1d5530;
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0; left: 0; bottom: 0;
    z-index: 100;
    overflow: hidden;
  }
  .sidebar::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 180px;
    background: radial-gradient(ellipse at bottom center, rgba(74,180,90,0.12) 0%, transparent 70%);
    pointer-events: none;
  }

 .sidebarLogo {
  padding: 10px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
  .logoIcon {
  width: 140px; height: 140px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.logoIcon img { 
  width: 140px; height: 140px; 
  object-fit: contain;
  filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3));
}
  
  .logoText {
    font-size: 16px; font-weight: 900; color: #fff;
    letter-spacing: 0.03em;
    font-family: 'Nunito', 'Plus Jakarta Sans', sans-serif;
  }
  .logoSub {
    font-size: 9px; color: rgba(255,255,255,0.42);
    letter-spacing: 0.12em; margin-top: 3px;
    font-weight: 600; text-transform: uppercase;
  }

  .topicHeader {
    padding: 14px 20px 10px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    flex-shrink: 0;
  }
  .topicLbl {
    font-size: 9px; color: rgba(255,255,255,0.35);
    letter-spacing: 0.18em; text-transform: uppercase;
    margin-bottom: 4px; font-weight: 600;
  }
  .topicName {
    font-size: 14px; font-weight: 900; color: #fff;
    font-family: 'Nunito', 'Plus Jakarta Sans', sans-serif;
  }
  .topicSub {
    font-size: 11px; color: rgba(255,255,255,0.5);
    margin-top: 1px; font-weight: 600;
  }

  .activityList {
    padding: 12px; flex: 1; overflow-y: auto;
  }
  .activityList::-webkit-scrollbar { width: 3px; }
  .activityList::-webkit-scrollbar-track { background: transparent; }
  .activityList::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }

  .chapHeader {
    display: flex; align-items: center; gap: 6px;
    width: 100%; background: none; border: none;
    cursor: pointer; padding: 7px 10px; border-radius: 8px;
    color: rgba(255,255,255,0.45); font-size: 10px; font-weight: 700;
    letter-spacing: 0.04em; text-align: left; margin-top: 12px;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .chapHeader:first-child { margin-top: 0; }
  .chapArrow { font-size: 8px; flex-shrink: 0; }

  .actItem {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 10px;
    cursor: pointer; margin-bottom: 3px;
    background: transparent; position: relative;
    transition: all 0.18s; text-decoration: none;
  }
  .actItem:hover { background: rgba(255,255,255,0.08); }
  .actItem.selected { background: rgba(255,255,255,0.14); }
  .actItem.selected::before {
    content: '';
    position: absolute; left: 0; top: 20%; bottom: 20%;
    width: 3px; background: #7ee89b;
    border-radius: 0 3px 3px 0;
  }
  .actNum {
    width: 26px; height: 26px; border-radius: 50%;
    flex-shrink: 0; display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 600;
    background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.5);
    transition: all 0.18s;
  }
  .actNum.activeNum { background: #3fa358; color: #fff; }
  .actName {
    font-size: 13px; font-weight: 600;
    color: rgba(255,255,255,0.6); flex: 1;
    line-height: 1.3;
  }
  .actName.activeName { color: #fff; }
  .actCheck { margin-left: auto; font-size: 12px; color: #7ee89b; }

   .sidebarMascot {
    padding: 8px 20px 10px;
    text-align: center;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
    border-top: 1px solid rgba(255,255,255,0.08);
  }
  .backBtn {
    margin: 10px 14px 14px;
    display: flex; align-items: center; gap: 8px;
    padding: 10px 14px; border-radius: 10px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.6); font-size: 12px; font-weight: 600;
    cursor: pointer; transition: all 0.18s;
    text-decoration: none; flex-shrink: 0;
  }
  .backBtn:hover { background: rgba(255,255,255,0.14); color: #fff; }

  /* ── Main ── */
  .mainPlaceHolder {
  margin-left: 256px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: calc(100vw - 256px);
  background: #f2f5ef;
}


  /* ── Topbar ── */
  .topbar {
    background: #fff;
    border-bottom: 1px solid #dde6d8;
    padding: 14px 32px;
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; z-index: 50;
    box-shadow: 0 2px 8px rgba(30,70,25,0.08);
    flex-shrink: 0;
  }
  .topbarLeft { display: flex; align-items: center; gap: 14px; }
  .actBadge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 12px; border-radius: 100px;
    background: #ccf0ea; border: 1px solid #8ed8cc;
    font-size: 10px; font-weight: 600; color: #0d8a78;
  }
  .actTitle {
    font-family: 'Nunito', 'Plus Jakarta Sans', sans-serif;
    font-size: 18px; font-weight: 900; color: #1a2518;
  }
  .topbarRight {
  display: flex;
  align-items: center;
  
  padding-right: 60px;
}
  .scorePill {
    display: flex; align-items: center; gap: 7px;
    padding: 7px 16px; border-radius: 100px;
    background: #fff; border: 1.5px solid #c4d4bd;
    font-size: 12px; font-weight: 600; color: #3d5538;
    box-shadow: 0 2px 8px rgba(30,70,25,0.08);
    margin-right: 6px;
  }
  .scoreNum { color: #2e7d45; font-size: 15px; font-weight: 700; }
  .userAv {
    width: 36px; height: 36px; border-radius: 50%;
    background: #2e7d45; display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 800; color: #fff;
    border: 2px solid #d4edda; cursor: pointer; flex-shrink: 0;
    overflow: hidden;
  }
  .userAv img { width: 100%; height: 100%; object-fit: cover; }

  /* ── Activity content area ── */
    .actContent {
  flex: 1;
  position: relative;
}
  /* ── Mobile hamburger ── */
  .hamburger {
    display: none;
    background: none; border: none;
    cursor: pointer; padding: 6px;
    color: #1d5530; font-size: 22px;
  }

  /* ── Overlay ── */
  .sidebarOverlay {
    display: none;
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45);
    z-index: 99;
  }

  /* ── Misc ── */
  .chapDisplay {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 60px 40px; flex: 1;
  }
  .chapDisplay .chapName {
    font-size: 2.5rem; font-weight: 900;
    color: #1a2518; margin: 20px 0;
    font-family: 'Nunito', sans-serif;
  }
  .placeHolder {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    flex: 1; gap: 16px;
    color: #7a9872; font-size: 1.1rem;
    text-align: center; padding: 60px 40px;
  }
  .placeHolder span { font-size: 3rem; }
.loadingWrap {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  background: rgba(242, 245, 239, 0.95);
}
.loadingImg {
  width: 130px;
  height: 130px;
  object-fit: contain;
  animation: parrotSpin 1.2s linear infinite;
  mix-blend-mode: multiply;
}

  /* ── Mobile responsive ── */
  @media (max-width: 860px) {
    .sidebar {
      transform: translateX(-100%);
      transition: transform 0.28s ease;
      width: 256px;
    }
    &.sidebarOpen .sidebar {
      transform: translateX(0);
    }
    &.sidebarOpen .sidebarOverlay {
      display: block;
    }
    .mainPlaceHolder {
      margin-left: 0;
      width: 100%;
    }
    .hamburger { display: flex; }
    .actTitle { font-size: 15px; }
    .topbar { padding: 12px 16px; }
    .scorePill { padding: 5px 10px; font-size: 11px; }
  }

  @media (max-width: 480px) {
    .actBadge { display: none; }
    .actTitle { font-size: 14px; }
  }
`;

const splTypes = ["pdf", "link", "pLink", "mvid", "youtube"];

export default function Playlist(props) {
  const router = useRouter();
  const pathname = usePathname();
  const historyStack = useRef([]);
  const playlistId = router.query.slug ? router.query.slug[0] : null;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const hasData = props.toc && props.toc.list && props.toc.list.length > 0;

  let toggleChaps = hasData ? Array(props.toc.list.length).fill(true) : [];
  if (props.toc?.collapseRest && hasData) {
    toggleChaps = toggleChaps.map((_, i) => i === 0);
  }

  const firstChapter = hasData ? props.toc.list[0] : null;
  const firstActivity = firstChapter
    ? firstChapter.list
      ? firstChapter.list[0]
      : firstChapter
    : null;

  const [state, setState] = useState({
    active: props.toc?.loadFirstAct && firstActivity
      ? Array.isArray(firstActivity?.data)
        ? getDataFromGroupAct(firstActivity, 0)
        : firstActivity
      : null,
    activeNum: 1,
    activeChap: props.toc?.loadFirstAct && firstChapter ? 0 : -1,
    hideTOC: props.toc?.cardView ? true : false,
    toggleChaps,
    currentBg: null,
    isLoading: false,
    
  });

  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  const handleSmartBack = () => {
    const s = stateRef.current || state;
    if (historyStack.current.length > 0) {
      const last = historyStack.current.pop();
      const chapList = props.toc?.list?.[last.chap]?.list;
      const item = chapList?.find((it) => it.id === last.id);
      if (item) {
        if (Array.isArray(item.data)) numberSelect(item, last.chap, last.num - 1);
        else onSelect(item, last.chap);
        return;
      }
    }
    if (!s.active || s.activeChap === -1) { router.push("/home"); return; }
    const chapList = props.toc?.list?.[s.activeChap]?.list;
    if (!chapList) { router.push("/home"); return; }
    const index = chapList.findIndex((it) => it.id === s.active.id);
    const currentOriginalItem = chapList[index];
    if (currentOriginalItem && Array.isArray(currentOriginalItem.data) && s.activeNum > 1) {
      numberSelect(currentOriginalItem, s.activeChap, s.activeNum - 2); return;
    }
    if (index > 0) {
      const prevItem = chapList[index - 1];
      if (Array.isArray(prevItem.data)) numberSelect(prevItem, s.activeChap, prevItem.data.length - 1);
      else onSelect(prevItem, s.activeChap);
      return;
    }
    if (props.toc.cardView) {
      setState((prev) => ({ ...prev, active: null, activeChap: -1, hideTOC: true }));
      return;
    }
    if (s.activeChap > 0) {
      const prevChapIndex = s.activeChap - 1;
      const prevChapList = props.toc.list[prevChapIndex].list;
      const prevItem = prevChapList[prevChapList.length - 1];
      let newToggleChaps = [...s.toggleChaps];
      if (props.toc.collapseRest) newToggleChaps = newToggleChaps.map(() => false);
      newToggleChaps[prevChapIndex] = true;
      setState((prev) => ({ ...prev, toggleChaps: newToggleChaps }));
      if (Array.isArray(prevItem.data)) numberSelect(prevItem, prevChapIndex, prevItem.data.length - 1);
      else onSelect(prevItem, prevChapIndex);
      return;
    }
    router.push("/home");
  };

  if (props.playlistRef) props.playlistRef.current = { handleSmartBack };

  async function onSelect(item, activeChap, i = 0, isManual = false) {
    if (isManual && stateRef.current.active) {
      historyStack.current.push({
        id: stateRef.current.active.id,
        chap: stateRef.current.activeChap,
        num: stateRef.current.activeNum - 1,
      });
    }
    if (item.type === "link" || item.type === "youtube") { window.open(loadAsset(item.src), "child"); return; }
    if (item.type === "pLink") { window.open(`https://pschool.app/p/${item.src}`, "child"); return; }

    const isSameChapter = stateRef.current.activeChap === activeChap;
    let bg = stateRef.current.currentBg;
    if (!isSameChapter || !bg) bg = getCategoryBackground(props.toc.list[activeChap]?.label, playlistId);

    setState((prev) => ({ ...prev, isLoading: true, activeChap, currentBg: bg }));
    // close sidebar on mobile
    setSidebarOpen(false);
    const startTime = Date.now();

    try {
      const activityId = String(item.id);
      const profile = {
        grade: localStorage.getItem("grade"),
        language: localStorage.getItem("language"),
        curriculum: localStorage.getItem("curriculum"),
      };
      const res = await apiService.getActivityDetail(activityId, profile);
      let data = res.data;
      if (typeof data === "string") { try { data = JSON.parse(data); } catch { data = {}; } }
      if (data?.error) { console.error("Access Error:", data.error); data = {}; }
      const remaining = Math.max(800 - (Date.now() - startTime), 0);
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          active: { ...item, data: data || {} },
          activeChap,
          activeNum: i + 1,
          hideTOC: false,
          currentBg: bg,
          isLoading: false,
        }));
      }, remaining);
    } catch (err) {
      console.error("Activity load failed", err);
      // ← CRITICAL FIX: always set data: {} so render condition passes
      setState((prev) => ({
        ...prev,
        active: { ...item, data: {}, loadError: true },
        activeChap,
        activeNum: i + 1,
        hideTOC: false,
        currentBg: bg,
        isLoading: false,
      }));
    }
  }

  useEffect(() => {
    const dataList = props.toc?.list || props.toc?.chapters;
    if (!dataList || dataList.length === 0) return;
    const isGridMenu = props.toc.cardView === true || props.toc.type === "nested";
    const shouldLoadFirst = String(props.toc.loadFirstAct) === "true";
    if (isGridMenu && state.activeChap !== -1 && !state.active?.loading && !state.active?.data) {
      const selectedChapter = dataList[state.activeChap];
      const items = selectedChapter.list || selectedChapter.contents;
      if (items && items.length > 0) { onSelect(items[0], state.activeChap, 0); return; }
    }
    if (!shouldLoadFirst || state.active) return;
    const firstChapter = dataList[0];
    const items = firstChapter.list || firstChapter.contents;
    if (items && items.length > 0) onSelect(items[0], 0, 0);
  }, [props.toc, state.activeChap, state.active]);

  function numberSelect(item, activeChap, i, e) {
    if (e) e.stopPropagation();
    let data = item.commonData || {};
    let subData = item.data[i];
    if (subData?.refs) {
      let refId = subData.refs;
      if (refId.indexOf("~") !== -1) {
        const refIndex = +refId.substr(refId.indexOf("~") + 1);
        refId = refId.substr(0, refId.indexOf("~"));
        subData = props.toc.defs[refId][refIndex];
      } else {
        subData = props.toc.defs[refId];
      }
    }
    if (typeof subData === "string") data = { ...data, text: subData };
    else if (Array.isArray(subData)) data = { ...data, arr: subData };
    else data = { ...data, ...subData };
    onSelect({ ...item, data }, activeChap, i + 1, true);
  }

  useEffect(() => {
    const handler = (msg) => {
      if (typeof msg.data !== "string") return;
      let msgData;
      try { msgData = JSON.parse(msg.data); } catch { return; }
      if (!msgData?.done) return;
      const s = stateRef.current;
      if (!s?.active) return;
      const chapList = props.toc.list[s.activeChap]?.list;
      if (!chapList) return;
      const index = chapList.findIndex((it) => it.id === s.active.id);
      if (index === -1) return;
      const currentItem = chapList[index];
      if (Array.isArray(currentItem.data)) {
        if (s.activeNum < currentItem.data.length) { numberSelect(currentItem, s.activeChap, s.activeNum); return; }
        else {
          if (props.toc.cardView) { handleSmartBack(); return; }
          if (props.toc.list.length > s.activeChap + 1) setState((prev) => ({ ...prev, active: { type: "chapter" }, activeChap: prev.activeChap + 1 }));
          else setState((prev) => ({ ...prev, active: null }));
        }
      }
      if (index + 1 < chapList.length) {
        const nextItem = chapList[index + 1];
        if (Array.isArray(nextItem.data)) numberSelect(nextItem, s.activeChap, 0);
        else onSelect(nextItem, s.activeChap);
      } else {
        if (props.toc.cardView) { handleSmartBack(); return; }
        if (props.toc.list.length > s.activeChap + 1) setState((prev) => ({ ...prev, active: { type: "chapter" }, activeChap: prev.activeChap + 1 }));
        else setState((prev) => ({ ...prev, active: null }));
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  if (!hasData) {
    return (
      <Styled>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f2f5ef", textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "5rem", marginBottom: "20px" }}>🚀</div>
          <h1 style={{ fontSize: "2.5rem", color: "#2b7d10", marginBottom: "10px", fontFamily: "Nunito, sans-serif" }}>Coming Soon!</h1>
          <p style={{ fontSize: "1.2rem", color: "#555", maxWidth: "500px" }}>We are working hard to build exciting exercises for this section. Please check back later!</p>
        </div>
      </Styled>
    );
  }

  const activeLabel = state.active?.label || (state.activeChap >= 0 ? props.toc.list[state.activeChap]?.label : "");
  const userName = (typeof window !== "undefined" && localStorage.getItem("user_name")) || "U";

  return (
    <Styled className={sidebarOpen ? "sidebarOpen" : ""}>
      {props.toc.type === "curriculumIcon" && <IconView data={props.toc} />}

      {/* ── SIDEBAR ── */}
      {(!props.toc.type || props.toc.type === "nested") && !state.hideTOC && (
        <>
          <div className="sidebarOverlay" onClick={() => setSidebarOpen(false)} />
          <div className="sidebar">

            {/* Logo */}
            <div className="sidebarLogo">
  <img 
  src={publicPath("/konzeptes/logo.png")} 
  alt="Konzeptes" 
  style={{ 
    width: 120,
    height: "auto",
    display: "block",
    filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.25))"
  }} 
/>
</div>

            {/* Topic header */}
            <div className="topicHeader">
              <div className="topicLbl">CURRENT TOPIC</div>
              <div className="topicName">
                {state.activeChap >= 0 && props.toc.list[state.activeChap]
                  ? props.toc.list[state.activeChap].label
                  : props.toc.list[0]?.label || "Activities"}
              </div>
              <div className="topicSub">{props.toc.label || "Learning Activities"}</div>
            </div>

            {/* Activity list */}
            <div className="activityList">
              {props.toc.list.map((chap, i) => {
                if (props.toc.cardView && state.activeChap !== -1 && state.activeChap !== i) return null;
                return (
                  <div key={chap.id || i}>
                    {props.toc.list.length > 1 && (
                      <button
                        className="chapHeader"
                        onClick={() => {
                          let tc = [...state.toggleChaps];
                          if (props.toc.collapseRest) tc = tc.map(() => false);
                          tc[i] = !tc[i];
                          const firstItem = props.toc.list[i].list[0];
                          setState({ ...state, activeChap: i, toggleChaps: tc, currentBg: getCategoryBackground(props.toc.list[i]?.label, playlistId) });
                          if (Array.isArray(firstItem.data)) numberSelect(firstItem, i, 0);
                          else onSelect(firstItem, i, 0, true);
                        }}
                      >
                        <span className="chapArrow">{state.toggleChaps[i] ? "▼" : "▶"}</span>
                        {i + 1}. {chap.label}{chap.altLabel ? ` (${chap.altLabel})` : ""}
                      </button>
                    )}
                    {state.toggleChaps[i] && chap.list?.map((item, j) => {
                      const isActive = state.active?.id === item.id && state.activeChap === i;
                      return (
                        <div
                          key={item.id}
                          className={`actItem${isActive ? " selected" : ""}`}
                          onClick={() => Array.isArray(item.data) ? numberSelect(item, i, 0, { stopPropagation: () => {} }) : onSelect(item, i, j, true)}
                        >
                          <div className={`actNum${isActive ? " activeNum" : ""}`}>{j + 1}</div>
                          <div className={`actName${isActive ? " activeName" : ""}`}>{item.label}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Mascot */}
                       

            {/* Back button */}
            <Link href="/home" className="backBtn">← Back to Activities</Link>
          </div>
        </>
      )}

      {props.toc.type === "curriculumList" && <PIconView data={props.toc} appType="small" />}

      {/* ── MAIN AREA ── */}
      {(!props.toc.type || props.toc.type === "nested") && (
        <div className="mainPlaceHolder">

          {/* Topbar */}
          {!state.hideTOC && (
            <div className="topbar">
              <div className="topbarLeft">
                <button className="hamburger" onClick={() => setSidebarOpen(s => !s)}>☰</button>
                {activeLabel && (
  <>
   
    <div className="actTitle">{activeLabel}</div>
  </>
)}
              </div>
              <div className="topbarRight">
  {state.activeNum > 0 && props.toc.list[state.activeChap]?.list?.length > 0 && (
    <div className="scorePill">
      Activity{" "}
      <span className="scoreNum">{state.activeNum}</span>
      {" "}of{" "}
      {props.toc.list[state.activeChap].list.length}
    </div>
  )}
</div>
            </div>
          )}

          {/* Content */}
          <div className="actContent">
            {state.active && state.active.type === "chapter" && (
              <div className="chapDisplay">
                <div style={{ textDecoration: "underline", color: "#7a9872" }}>Chapter {state.activeChap + 1}</div>
                <div className="chapName">{props.toc.list[state.activeChap].label}</div>
                <Button primary onClick={() => {
                  const firstItem = props.toc.list[state.activeChap].list[0];
                  if (Array.isArray(firstItem.data)) numberSelect(firstItem, state.activeChap, 0);
                  else onSelect(firstItem, state.activeChap);
                }}>Continue →</Button>
              </div>
            )}

            {!props.toc.cardView && !state.active && !state.isLoading && (
              <div className="placeHolder">
                <span>👈</span>
                <p>Click an activity in the sidebar to get started</p>
              </div>
            )}

            {props.toc.cardView && state.activeChap === -1 && (
              <SubCards
                toc={props.toc}
                onSelect={(index) => {
                  const selectedChapter = props.toc.list[index];
                  if (!selectedChapter) return;
                  let firstItem = selectedChapter.list?.[0];
                  while (firstItem && ["chapter", "menu", "folder"].includes(firstItem.type)) firstItem = firstItem.list?.[0];
                  if (!firstItem) return;
                  setState((prev) => ({ ...prev, hideTOC: false, activeChap: index, active: null }));
                  onSelect(firstItem, index, 0);
                }}
              />
            )}

           {state.isLoading && (
  <div className="loadingWrap">
    <img className="loadingImg" src="/konzeptes/parrot-loader.jpg" alt="loading" />
  </div>
)}

          {!state.isLoading &&
  state.active &&
  state.active.type !== "chapter" && (
    displayResource(
      state.active,
      () => setState({ ...state, active: null }),
      null,
      state.currentBg,
      props.toc.list[state.activeChap]?.label,
      props.toc.id,
    )
)}
          </div>
        </div>
      )}
    </Styled>
  );
}

function displayResource(item, onClose, onChapterNext, bgImage, chapterLabel, chapId) {
  const isApiBg = bgImage && bgImage.startsWith("http");
  const bgUrl = isApiBg ? bgImage : publicPath("/bg-images/" + bgImage);

  // Error state
  if (item.loadError) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px", color: "#7a9872", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "12px" }}>😕</div>
        <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#3d5538" }}>Could not load this activity</div>
        <div style={{ fontSize: "0.9rem", marginTop: "6px" }}>Please check your connection and try again.</div>
      </div>
    );
  }

   const iframeStyle = {
  border: "none",
  width: "100%",
  height: "calc(100vh - 65px)",   /* was: "100%" */
};

const containerStyle = {
  width: "100%",
  height: "calc(100vh - 65px)",   /* was: "100%" */
};
  switch (item.type) {
    case "pdf": {
      let src = item.src;
      if (src.indexOf(".") === -1) src += ".pdf";
      return <iframe style={iframeStyle} src={loadAsset(src)} />;
    }
    case "mvid": {
      let video = item.src;
      let payload = typeof video === "string"
        ? { src: video, width: 360, height: 600 }
        : { src: video.file, width: video.width, height: video.height };
      if (payload.src.indexOf(".") === -1) payload.src += ".mp4";
      return <iframe style={iframeStyle} src="/lmsLearning/acts/video" data-payload={JSON.stringify(payload)} />;
    }
    case "link": case "youtube": case "pLink": return null;
  }

  const payload = { id: item.id, bgImage: bgUrl, ...(item.data || {}) };

  switch (item.type) {
    case "mcq": return <ActivityWrapper bgUrl={bgUrl} id={chapId}><McqAct data={payload} /></ActivityWrapper>;
    case "completeWord": return <ActivityWrapper bgUrl={bgUrl} id={chapId}><CompleteWordAct data={payload} /></ActivityWrapper>;
    case "wordsearch": return <ActivityWrapper bgUrl={bgUrl} id={chapId}><WordSearchAct data={payload} /></ActivityWrapper>;
    case "sequence": return <ActivityWrapper bgUrl={bgUrl} id={chapId}><SequenceAct data={payload} /></ActivityWrapper>;
    case "classifySentence": return <ActivityWrapper bgUrl={bgUrl} id={chapId}><ClassifySentenceAct data={payload} /></ActivityWrapper>;
    case "matchByDragDrop": return <ActivityWrapper bgUrl={bgUrl} id={chapId}><MatchByAct data={payload} /></ActivityWrapper>;
    case "informationProcessing": return <ActivityWrapper bgUrl={bgUrl} id={chapId}><InformationProcessingAct data={payload} /></ActivityWrapper>;
    case "visualInformationProcessing": case "visual_audio": case "visual_image":
      return <ActivityWrapper bgUrl={bgUrl} id={chapId}><VisualInfoProcessingAct data={payload} /></ActivityWrapper>;
    case "dragAndDrop": return <ActivityWrapper bgUrl={bgUrl} id={chapId}><DragDropAct data={payload} /></ActivityWrapper>;
    case "clickAndDrag": return <ActivityWrapper bgUrl={bgUrl} id={chapId}><ClickAndDragAct data={payload} /></ActivityWrapper>;
    case "match": {
      const text = item.data?.text || "";
      const isPair = text.includes(",") && text.includes("\n");
      return <ActivityWrapper bgUrl={bgUrl} id={chapId}>{isPair ? <MatchPairs data={payload} /> : <MatchByAct data={payload} />}</ActivityWrapper>;
    }
    case "completePuzzle": return <ActivityWrapper bgUrl={bgUrl} id={chapId}><JoinWords data={item} /></ActivityWrapper>;
    case "fillup": return <ActivityWrapper bgUrl={bgUrl} id={chapId}><FillupAct data={payload} /></ActivityWrapper>;
    case "selectWord": return <ActivityWrapper bgUrl={bgUrl} id={chapId}><SelectWordAct data={payload} /></ActivityWrapper>;
    case "rightOne": return <ActivityWrapper bgUrl={bgUrl} id={chapId}><RightOneAct data={payload} /></ActivityWrapper>;
    case "group": return <ActivityWrapper bgUrl={bgUrl} id={chapId}><GroupAct data={payload} /></ActivityWrapper>;

    default: {
      const localTypes = ["classifySentence","matchByDragDrop","informationProcessing","sequence","dragAndDrop","wordsearch","completeWord"];
      const isLocal = localTypes.includes(item.type);
      let iframeSrc;
      const str = JSON.stringify(item.data);
      if (item.type === "classifySentence") {
        const payloadData = { id: item.id, ...item.data };
        iframeSrc = `/lms-system/acts/classifySentence/index.html?c=${LZString.compressToEncodedURIComponent(JSON.stringify(payloadData))}`;
      } else if (isLocal) {
        iframeSrc = `/lms-system/acts/${item.type}/index.html?payload=${encodeURIComponent(str)}`;
      } else {
        iframeSrc = `https://pschool.app/acts/${item.type}?payload=${str}`;
      }
      return (
        <div style={containerStyle}>
          <iframe
            style={{ ...iframeStyle, mixBlendMode: !isLocal ? "multiply" : "normal" }}
            sandbox="allow-scripts allow-same-origin allow-forms"
            referrerPolicy="no-referrer"
            src={iframeSrc}
          />
        </div>
      );
    }
  }
}

function getCategoryBackground(label, id) {
  if (id && !isNaN(id)) return apiService.getBgImageUrl(id);
  if (!label) return "bg30.jpg";
  const l = label.toLowerCase();
  if (l.includes("composition")) return "bg25.jpg";
  if (l.includes("spelling")) return "bg30.jpg";
  if (l.includes("grammar")) return "bg32.jpg";
  if (l.includes("vocabulary")) return "bg33.jpg";
  if (l.includes("sentence")) return "sentence.jpg";
  if (l.includes("idiom")) return "idiom.jpg";
  if (l.includes("word building") || l.includes("wordbuilding")) return "bg31.jpg";
  if (l.includes("word search") || l.includes("wordsearch")) return "wordsearch.jpg";
  if (l.includes("listening")) return "bg24.jpg";
  if (l.includes("comprehension")) return "bg22.jpg";
  return "bg30.jpg";
}

function ActivityWrapper({ children, bgUrl, id }) {
 const style = {
  width: "100%",
  height: "calc(100vh - 65px)",
  position: "relative",
  overflowY: "auto",
  backgroundColor: "#f2f5ef",
};
  const decorImgs = {
    "card-p11": publicPath("/konzeptes/icons/listening.png"),
    "card-p12": publicPath("/konzeptes/icons/word-building-box.png"),
    "card-p13": publicPath("/konzeptes/icons/vocabulary-book.png"),
    "card-p14": publicPath("/konzeptes/icons/sentences-stars.png"),
    "card-p15": publicPath("/konzeptes/icons/comprehension-book.png"),
    "card-p16": publicPath("/konzeptes/icons/composition-note.png"),
    "card-p17": publicPath("/konzeptes/icons/idioms-quotes.png"),
    "card-p18": publicPath("/konzeptes/icons/grammar-book.png"),
    "card-p19": publicPath("/konzeptes/icons/word-search-icon.png"),
    
  };

  const decorIcon = decorImgs[id];

  return (
    <div style={style}>
      {decorIcon && (
        <img src={decorIcon} alt="" style={{ position: "absolute", left: "-20px", top: "-10px", width: "160px", height: "120px", pointerEvents: "none", opacity: 0.7 }} />
      )}
      
      <div
  style={{
    position: "relative",
    zIndex: 1,
    width: "100%",
     height: "100%",

  }}
>
        {children}
      </div>
    </div>
  );
}