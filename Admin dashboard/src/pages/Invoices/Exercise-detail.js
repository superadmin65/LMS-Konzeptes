import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useFormik, FormikProvider, FieldArray } from "formik";
import * as Yup from "yup";
import {
  Card,
  CardBody,
  Col,
  Row,
  Form,
  Input,
  Label,
  Button,
  Spinner,
  FormFeedback,
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import MCQSection from "./MCQSection";
import MatchBySection from "./MatchBySection";
import CompleteWordSection from "./CompleteWordSection";
import SequenceSection from "./SequenceSection";
import ClassifySentenceSection from "./ClassifySentenceSection";
import WordSearchSection from "./WordSearchSection";
import Swal from "sweetalert2";
import MatchPairSection from "./MatchPairSection";
import SelectWordSection from "./SelectWordSection";
import RightOneSection from "./RightOneSection";
import FillUpSection from "./FillUpSection";
import GroupSection from "./GroupSection";
import CompletePuzzleSection from "./CompletePuzzleSection";
import DragAndDropSection from "./DragAndDropSection";
import InformationProcessingSection from "./InformationProcessingSection";

// HELPERS
import { get, post } from "../../helpers/api_helper";
import {
  GET_CARDS_CONFIG,
  SAVE_ACTIVITY,
  GET_FIELD_LIST,
} from "../../helpers/url_helper";

const commonInputStyle = {
  height: "38px",
  display: "flex",
  alignItems: "center",
};

function InvoicesDetail() {
  const navigate = useNavigate();
  const location = useLocation();

  const editData = location.state?.editData || null;
  const isEdit = !!editData;
  const isViewOnly = editData?.readOnly || false;

  const [cards, setCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const validationSchema = Yup.object().shape({
    // Metadata fields
    grade: Yup.string().required("Grade is required"),
    language: Yup.string().required("Language is required"),
    curriculum: Yup.string().required("Curriculum is required"),
    // chapter_name: Yup.string().required('Chapter Name is required'),
    chapter_name: Yup.string(), // ✅ REMOVED .required() HERE

    // Configuration fields
    card_id: Yup.string().required("Please select a Card/Topic"),
    type: Yup.string().required("Activity Type is required"),
    label: Yup.string().required("Activity Label is required"),
    title: Yup.string().required("Instruction Title is required"),
  });

  const [fieldOptions, setFieldOptions] = useState({
    grades: [],
    languages: [],
    curriculums: [],
  });

  // useEffect(() => {
  //   const fetchFields = async () => {
  //     try {
  //       const response = await get(GET_FIELD_LIST);

  //       // Safety check: ORDS returns data in an 'items' array
  //       if (response && response.items && response.items.length > 0) {
  //         const data = response.items[0];
  //         setFieldOptions({
  //           // Fallback to empty array [] if the field is null to prevent .map errors
  //           grades: Array.isArray(data.grades) ? data.grades : [],
  //           languages: Array.isArray(data.languages) ? data.languages : [],
  //           curriculums: Array.isArray(data.curriculums)
  //             ? data.curriculums
  //             : [],
  //         });
  //       }
  //     } catch (err) {
  //       console.error("Error fetching dynamic fields:", err);
  //     }
  //   };
  //   fetchFields();
  // }, []);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const response = await get(GET_FIELD_LIST);

        if (response && response.items && response.items.length > 0) {
          const data = response.items[0];

          // Use JSON.parse to turn the strings from the DB into real Arrays
          setFieldOptions({
            grades:
              typeof data.grades === "string"
                ? JSON.parse(data.grades)
                : Array.isArray(data.grades)
                ? data.grades
                : [],

            languages:
              typeof data.languages === "string"
                ? JSON.parse(data.languages)
                : Array.isArray(data.languages)
                ? data.languages
                : [],

            curriculums:
              typeof data.curriculums === "string"
                ? JSON.parse(data.curriculums)
                : Array.isArray(data.curriculums)
                ? data.curriculums
                : [],
          });
        }
      } catch (err) {
        console.error("Error fetching dynamic fields:", err);
      }
    };
    fetchFields();
  }, []);

  // Fetch Topics/Cards
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const json = await get(`${GET_CARDS_CONFIG}?mode=admin`);
        let cardList = [];
        if (json.items && json.items.length > 0) {
          const rawList = json.items[0].list;
          cardList =
            typeof rawList === "string" ? JSON.parse(rawList) : rawList || [];
        }
        setCards(cardList);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoadingCards(false);
      }
    };
    fetchCards();
  }, []);

  const validation = useFormik({
    enableReinitialize: true,
    validationSchema: validationSchema,
    initialValues: {
      // New Metadata Fields
      grade: editData?.grade || "",
      language: editData?.language || "",
      curriculum: editData?.curriculum || "",
      chapter_name: editData?.chapter_name || "",

      // for configuration
      id: editData?.id || null,
      card_id: editData?.card_id || "",
      label: editData?.label || "",
      type: editData?.activity_type || editData?.type || "",
      btn_label: editData?.btn_label || "Fill Up by Drag",
      title: "",
      lang: "hi",

      options: [],

      // --- SHARED & MCQ / CLASSIFY ---
      questions: [
        {
          question: "",
          answers: ["", "", "", ""],
          correct_answer: "0",
          text: "",
          answer: "",
          word: "",
          options: ["", ""],
        },
      ],

      // --- AUDIO & IMAGE SPECIFIC ---
      audioUrl: editData?.audio || "",
      imageUrl: editData?.image || "",
      questionsLater: editData?.questionsLater ?? true,

      // --- WORD SEARCH SPECIFIC ---
      wordList: [""],
      generatedTable: [],
      generatedWords: [],
      rows: 8,
      cols: 8,

      // --- COMPLETE WORD SPECIFIC ---
      completeWords: [{ question: "", correct: "", options: ["", ""] }],

      // --- SEQUENCE SPECIFIC ---
      sequenceSubtype: "character",
      sequenceItems: [{ text: "" }],

      // -- MATCHPAIRS SPECIFIC ---
      matchPairs: [{ left: "", right: "" }],

      // -- SELECTWORD SPECIFIC ---
      selectWordQuestions: [{ sentence: "", answer: "" }],

      // -- RIGHTONE SPECIFIC ---
      rightOnePairs: [{ correct: "", wrong: "" }],

      // -- FILLUP  SPECIFIC ---
      fillUpQuestions: [{ sentence: "", right: "", wrong: "" }],

      // -- GROUP EXERCISE SPECIFIC ---
      groupData: [{ name: "", text: "" }],

      // -- COMPLETE PUZZLE SPECIFIC ---
      puzzlePairs: [{ base: "", right: "", wrong: "" }],

      // --  DRAG AND DROP SPECIFIC ---
      dragDropItems: [{ src: "", word: "" }],
    },

    onSubmit: async (values) => {
      if (isViewOnly) return;

      const type = values.type?.trim().toLowerCase();
      let apiPayload = null;

      const basePayload = {
        activity_id: isEdit ? values.id : null,
        card_id: Number(values.card_id),
        label: values.label,
        grade: values.grade,
        language: values.language,
        curriculum: values.curriculum,
        chapter_name: values.chapter_name,
      };

      try {
        switch (type) {
          case "match": {
            // 1. Transform Array into the "*answer*" format string for the player
            const formattedText = values.questions
              .filter((q) => q.text.trim() !== "" && q.answer.trim() !== "")
              .map((q) => {
                const sentence = q.text.trim();
                const answer = q.answer.trim();

                // If the user put a blank '___', replace it with the formatted answer
                if (sentence.includes("___")) {
                  return sentence.replace("___", `*${answer}*`);
                }

                // Fallback if no blank is found
                return `${sentence} *${answer}*`;
              })
              .join("\n");

            const data_json = {
              dashWidth: 70,
              bgData: {
                imgWidth: 928,
                top: 20,
                left: 300,
                width: 600,
                bgImg: "konzeptes/comprehension.jpg",
                imgHeight: 700,
                height: 650,
              },
              fontSize: "1rem",
              text: formattedText,
              title: values.title,
            };

            apiPayload = {
              activity_id: isEdit ? editData.id : "",
              card_id: values.card_id,
              label: values.label,
              type: "matchByDragDrop", // Backend identifier
              btn_label: values.btn_label,
              data_json: JSON.stringify(data_json),
            };
            break;
          }

          case "audio": {
            const dataJsonObj = {
              title: values.title,
              type: "audio",
              audio: values.audioUrl,
              questionsLater: values.questionsLater,
              questions: values.questions.map((q) => {
                return {
                  qText: q.question.trim(),
                  options: q.answers.map((ans) => ans.trim()).join("\n"),
                };
              }),
            };

            apiPayload = {
              ...basePayload,
              activity_id: isEdit ? values.id : null,
              type: "informationProcessing",
              btn_label: "Listen & Answer",
              data_json: JSON.stringify(dataJsonObj),
            };
            break;
          }

          case "image": {
            const dataJsonObj = {
              title: values.title,
              type: "image",
              image: values.imageUrl,
              bgData: {
                imgWidth: 928,
                top: 20,
                left: 300,
                width: 600,
                bgImg: "konzeptes/comprehension.jpg",
                imgHeight: 700,
                height: 650,
              },
              questions: values.questions.map((q) => {
                return {
                  type: "mcq",
                  qText: q.question.trim(),
                  options: q.answers.map((ans) => ans.trim()).join(","),
                };
              }),
            };

            apiPayload = {
              ...basePayload,
              activity_id: isEdit ? values.id : null,
              type: "informationProcessing",
              btn_label: "Look & Answer",
              data_json: JSON.stringify(dataJsonObj),
            };
            break;
          }

          case "mcq": {
            const dataJsonObj = {
              title: values.title,
              questions: values.questions.map((q) => {
                const correctIdx = parseInt(q.correct_answer);
                const formattedOptions = q.answers.map((ans, idx) =>
                  idx === correctIdx ? `*${ans.trim()}*` : ans.trim(),
                );
                return {
                  qText: q.question,
                  options: formattedOptions.join("\n"),
                };
              }),
            };

            apiPayload = {
              ...basePayload,
              activity_id: isEdit ? values.id : null,
              card_id: Number(values.card_id),
              label: values.label,
              type: "mcq",
              btn_label: "MCQ",
              data_json: JSON.stringify(dataJsonObj),
            };
            break;
          }

          case "completeword": {
            const formattedText = values.completeWords
              .filter(
                (q) => q.question.trim() !== "" && q.correct.trim() !== "",
              )
              .map((q) => {
                const question = q.question.trim();
                const correct = q.correct.trim();
                const options = q.options
                  .filter((opt) => opt.trim() !== "")
                  .join(",");

                const fullWord = question.replace("_", correct);
                return `${fullWord}|${correct}|${question}|${options}`;
              })
              .join("\n");

            apiPayload = {
              ...basePayload,
              activity_id: isEdit ? values.id : null,
              card_id: Number(values.card_id),
              label: values.label,
              type: "completeWord",
              btn_label: "Find the Word",
              data_json: JSON.stringify({
                title: values.title,
                lang: values.lang || "hi",
                text: formattedText,
                images: "stockImgs",
              }),
            };
            break;
          }

          case "sequence": {
            const formattedText = values.sequenceItems
              .filter((item) => item.text.trim() !== "")
              .map((item) => {
                if (values.sequenceSubtype === "character") {
                  const charClusterRegex = /[\u0900-\u097F][\u093E-\u094D]*/g;
                  const clusters =
                    item.text.trim().match(charClusterRegex) || [];
                  return clusters.join(" ");
                }
                return item.text.trim();
              })
              .join(values.sequenceSubtype === "character" ? "\n" : "\n\n");

            apiPayload = {
              ...basePayload,
              activity_id: isEdit ? values.id : null,
              card_id: Number(values.card_id),
              label: values.label,
              type: "sequence",
              btn_label: "Jumbled",
              data_json: JSON.stringify({
                title: values.title,
                lang: values.lang || "hi",
                text: formattedText,
              }),
            };
            break;
          }

          case "classifysentence": {
            const textData = values.questions
              .map((q) => {
                const opts = q.options.map((opt, idx) =>
                  idx.toString() === q.correct_answer
                    ? `*${opt.trim()}`
                    : opt.trim(),
                );
                return `${q.word} | ${q.word} | ${opts.join(",")}`;
              })
              .join("\n");

            apiPayload = {
              ...basePayload,
              activity_id: isEdit ? values.id : null,
              card_id: Number(values.card_id),
              label: values.label,
              type: "classifySentence",
              btn_label: "Pick the Right Option",
              data_json: JSON.stringify({
                title: values.title,
                text: textData,
              }),
            };
            break;
          }

          case "wordsearch": {
            apiPayload = {
              ...basePayload,
              activity_id: isEdit ? values.id : null,
              card_id: Number(values.card_id),
              label: values.label,
              type: "wordsearch",
              btn_label: "Word Search",
              data_json: JSON.stringify({
                title: values.title,
                words: values.generatedWords,
                table: values.generatedTable,
                lang: "en",
                showWords: true,
              }),
            };
            break;
          }

          case "matchpair": {
            const formattedText = values.matchPairs
              .filter((p) => p.left.trim() !== "" && p.right.trim() !== "")
              .map((p) => `${p.left.trim()}, ${p.right.trim()}`)
              .join("\n");

            apiPayload = {
              ...basePayload,
              activity_id: isEdit ? values.id : null,
              card_id: Number(values.card_id),
              label: values.label,
              type: "match",
              btn_label: "Match",
              data_json: JSON.stringify({
                title: values.title,
                text: formattedText,
              }),
            };
            break;
          }

          case "selectword": {
            const formattedText = values.selectWordQuestions
              .filter((q) => q.sentence.trim() !== "" && q.answer.trim() !== "")
              .map((q) => {
                const sentence = q.sentence.trim();
                const answer = q.answer.trim();
                return sentence.includes(answer)
                  ? sentence.replace(answer, `*${answer}*`)
                  : sentence;
              })
              .join("\n");

            apiPayload = {
              ...basePayload,
              type: "selectWord",
              btn_label: "Select Word",
              data_json: JSON.stringify({
                title: values.title,
                text: formattedText,
              }),
            };
            break;
          }

          case "rightone": {
            const formattedText = values.rightOnePairs
              .filter((p) => p.correct.trim() !== "" && p.wrong.trim() !== "")
              .map((p) => `${p.correct.trim()},${p.wrong.trim()}`)
              .join("\n");

            apiPayload = {
              ...basePayload,
              type: "rightOne",
              btn_label: "Right Option",
              data_json: JSON.stringify({
                title: values.title,
                text: formattedText,
              }),
            };
            break;
          }

          case "fillup": {
            const formattedText = values.fillUpQuestions
              .filter((q) => q.sentence.trim() !== "" && q.right.trim() !== "")
              .map((q) => {
                const { sentence, right, wrong } = q;
                const placeholder = `*${right.trim()} (${wrong.trim()})*`;
                if (sentence.includes("___"))
                  return sentence.replace("___", placeholder);
                return sentence + " " + placeholder;
              })
              .join("\n"); // FIX: Changed from \n\n to \n to match your database format

            apiPayload = {
              ...basePayload,
              type: "fillup",
              btn_label: "Fill Up",
              data_json: JSON.stringify({
                title: values.title,
                text: formattedText,
                type: "variableOptions",
                lang: "hi",
              }),
            };
            break;
          }
          case "group": {
            apiPayload = {
              ...basePayload,
              type: "group",
              btn_label: "Group",
              data_json: JSON.stringify({
                title: values.title,
                types: values.groupData.map((g) => ({
                  name: g.name.trim(),
                  text: g.text.trim(),
                })),
              }),
            };
            break;
          }

          case "completepuzzle": {
            const formattedText = values.puzzlePairs
              .filter((p) => p.base.trim() !== "" && p.right.trim() !== "")
              .map(
                (p) => `${p.base.trim()}, ${p.right.trim()}, ${p.wrong.trim()}`,
              )
              .join("\n");

            apiPayload = {
              ...basePayload,
              type: "completePuzzle",
              btn_label: "Join the Words",
              data_json: JSON.stringify({
                title: values.title,
                text: formattedText,
                leftWidth: 150,
                rightWidth: 150,
                type: "rightOpen",
                printTitle: "Underline the right option.",
              }),
            };
            break;
          }

          case "draganddrop": {
            const items = values.dragDropItems.filter((i) => i.src && i.word);

            const words = items.map((item, idx) => ({
              x: 240,
              y: 40 + idx * 90,
              word: item.word.trim(),
            }));

            const paths = items.map((item, idx) => ({
              rotate: 0,
              src: item.src,
              x: 20,
              y: 20 + idx * 90,
              width: 70,
              height: 70,
              maintainAR: true,
              type: "image",
              fill: "none",
              stroke: "#0d3756",
            }));

            apiPayload = {
              ...basePayload,
              type: "dragAndDrop",
              btn_label: "Match",
              data_json: JSON.stringify({
                title: values.title,
                width: 400,
                height: 50 + items.length * 90,
                wordWidth: 60,
                words: words,
                svg: {
                  paths: paths,
                  props: { fill: "none", strokeWidth: 1, stroke: "black" },
                },
              }),
            };
            break;
          }

          default:
            Swal.fire("Error", "Invalid activity type", "error");
            return;
        }

        const result = await post(SAVE_ACTIVITY, apiPayload);

        if (["success", "inserted", "updated"].includes(result?.status)) {
          Swal.fire("Success", "Saved!", "success").then(() =>
            navigate("/Exercise-type"),
          );
        } else {
          Swal.fire("Error", "Unexpected response from server", "error");
        }
      } catch (error) {
        console.error("Submit Error:", error);
        Swal.fire("Error", error.message, "error");
      }
    },
  });

  useEffect(() => {
    if (isEdit && editData) {
      let parsedData = {};
      try {
        parsedData =
          typeof editData.data_json === "string"
            ? JSON.parse(editData.data_json)
            : editData.data_json;
      } catch (e) {
        console.error("Parse error", e);
      }

      if (parsedData) {
        // --- MAP DATABASE TYPES TO DROPDOWN TYPES ---
        let dbType = editData.activity_type || editData.type || "";
        let activityType = dbType.toLowerCase();

        if (dbType === "matchByDragDrop") {
          activityType = "match";
        } else if (dbType === "informationProcessing") {
          activityType = parsedData.type === "image" ? "image" : "audio";
        } else if (dbType === "match") {
          activityType = "matchpair";
        }

        // --- DEFINE HOLDERS FOR EXTRACTED DATA ---
        let recMatch = [{ text: "", answer: "" }];
        let recAudioImage = null;
        let recMCQ = null;
        let recClassifySentence = [
          { word: "", options: ["", ""], correct_answer: "0" },
        ];
        let recSequenceItems = [{ text: "" }];
        let recSequenceSubtype = "character";
        let recCompleteWords = [
          { question: "", correct: "", options: ["", ""] },
        ];
        let recMatchPairs = [{ left: "", right: "" }];
        let recSelectWord = [{ sentence: "", answer: "" }];
        let recRightOne = [{ correct: "", wrong: "" }];
        let recFillUp = [{ sentence: "", right: "", wrong: "" }];
        let recGroupData = [{ name: "", text: "" }];
        let recPuzzlePairs = [{ base: "", right: "", wrong: "" }];
        let recDragDropItems = [{ src: "", word: "" }];
        let recWordList = [""]; // <-- Word Search Holder

        // 1. Reconstruct Match Questions
        if (parsedData.text && activityType === "match") {
          const lines = parsedData.text
            .split("\n")
            .filter((l) => l.trim() !== "");
          recMatch = lines.map((line) => {
            const match = line.match(/(.*?)\*(.*?)\*(.*)/);
            if (match) {
              const prefix = match[1].trim();
              const answer = match[2].trim();
              const suffix = match[3].trim();
              let fullSentence = prefix;
              if (suffix) {
                fullSentence = `${prefix} ___ ${suffix}`;
              } else if (prefix) {
                fullSentence = `${prefix} ___`;
              }
              return { text: fullSentence, answer: answer };
            }
            return { text: line, answer: "" };
          });
        }

        // 2. Audio / Image Parsing
        if (
          parsedData &&
          (activityType === "audio" || activityType === "image") &&
          parsedData.questions
        ) {
          const isAudio = activityType === "audio";
          recAudioImage = parsedData.questions.map((q) => {
            const opts = q.options
              ? q.options.split(isAudio ? "\n" : ",")
              : ["", "", "", ""];
            return {
              question: q.qText || "",
              answers: opts.length ? opts : ["", "", "", ""],
              correct_answer: "0",
            };
          });
        }

        // 3. MCQ Parsing
        if (parsedData && activityType === "mcq" && parsedData.questions) {
          recMCQ = parsedData.questions.map((q) => {
            let rawOptionsArray = Array.isArray(q.options)
              ? q.options
              : typeof q.options === "string"
              ? q.options.split("\n")
              : [];
            const correctIndex = rawOptionsArray.findIndex((opt) =>
              String(opt).trim().startsWith("*"),
            );
            const cleanOptions = rawOptionsArray.map((opt) =>
              String(opt).replace(/\*/g, "").trim(),
            );
            while (cleanOptions.length < 4) cleanOptions.push("");
            return {
              question: q.qText || q.question || "",
              answers: cleanOptions.slice(0, 4),
              correct_answer: correctIndex > -1 ? correctIndex.toString() : "0",
            };
          });
        }

        // 4. Sequence Parsing
        if (parsedData && activityType === "sequence" && parsedData.text) {
          const rawText = parsedData.text;
          const isWordSequence = rawText.includes("\n\n");
          const lines = rawText
            .split(isWordSequence ? "\n\n" : "\n")
            .filter((l) => l.trim() !== "");
          recSequenceItems = lines.map((line) => ({
            text: !isWordSequence ? line.replace(/\s+/g, "") : line,
          }));
          recSequenceSubtype = isWordSequence ? "word" : "character";
        }

        // 5. Complete Word Parsing
        if (parsedData && activityType === "completeword" && parsedData.text) {
          const lines = parsedData.text
            .split("\n")
            .filter((l) => l.trim() !== "");
          recCompleteWords = lines.map((line) => {
            const [word, correct, question, optionsStr] = line.split("|");
            return {
              question: question || "",
              correct: correct || "",
              options: optionsStr ? optionsStr.split(",") : ["", ""],
            };
          });
        }

        // 6. Match Pairs Parsing
        if (activityType === "matchpair" && parsedData.text) {
          if (parsedData.text.includes(",")) {
            const lines = parsedData.text
              .split("\n")
              .filter((l) => l.trim() !== "");
            recMatchPairs = lines.map((line) => {
              const [left, right] = line.split(",");
              return { left: left?.trim() || "", right: right?.trim() || "" };
            });
          }
        }

        // 7. Select Word Parsing
        if (parsedData && activityType === "selectword" && parsedData.text) {
          const lines = parsedData.text
            .split("\n")
            .filter((l) => l.trim() !== "");
          recSelectWord = lines.map((line) => {
            const match = line.match(/\*(.*?)\*/);
            return {
              sentence: line.replace(/\*/g, ""),
              answer: match ? match[1] : "",
            };
          });
        }

        // 8. Right One Parsing
        if (parsedData && activityType === "rightone" && parsedData.text) {
          const lines = parsedData.text
            .split("\n")
            .filter((l) => l.trim() !== "");
          recRightOne = lines.map((line) => {
            const [correct, wrong] = line.split(",");
            return { correct: correct || "", wrong: wrong || "" };
          });
        }

        if (parsedData && activityType === "fillup" && parsedData.text) {
          // FIX: Split by regex /\n+/ to handle both single \n and double \n\n
          const lines = parsedData.text
            .split(/\n+/)
            .filter((l) => l.trim() !== "");

          recFillUp = lines.map((line) => {
            const match = line.match(/\*(.*?) \((.*?)\)\*/);
            return {
              sentence: line.replace(/\*.*?\*/, "___"),
              right: match ? match[1].trim() : "",
              wrong: match ? match[2].trim() : "",
            };
          });
        }
        // 10. Group Parsing
        if (parsedData && activityType === "group" && parsedData.types) {
          recGroupData = parsedData.types;
        }

        // 11. Puzzle Pairs Parsing
        if (
          parsedData &&
          activityType === "completepuzzle" &&
          parsedData.text
        ) {
          const lines = parsedData.text
            .split("\n")
            .filter((l) => l.trim() !== "");
          recPuzzlePairs = lines.map((line) => {
            const parts = line.split(",").map((s) => s.trim());
            return {
              base: parts[0] || "",
              right: parts[1] || "",
              wrong: parts[2] || "",
            };
          });
        }

        // 12. Drag and Drop Parsing
        if (parsedData && activityType === "draganddrop" && parsedData.words) {
          recDragDropItems = parsedData.words.map((w, idx) => ({
            word: w.word || "",
            src: parsedData.svg?.paths?.[idx]?.src || "",
          }));
        }

        // 13. Classify Sentence Parsing
        if (
          parsedData &&
          activityType === "classifysentence" &&
          parsedData.text
        ) {
          const lines = parsedData.text
            .split("\n")
            .filter((l) => l.trim() !== "");
          recClassifySentence = lines.map((line) => {
            const parts = line.split("|").map((p) => p.trim());
            const word = parts[0] || "";
            const optionsStr = parts[2] || "";
            const rawOptions = optionsStr.split(",").map((o) => o.trim());
            const correctIndex = rawOptions.findIndex((opt) =>
              opt.startsWith("*"),
            );
            const cleanOptions = rawOptions.map((opt) =>
              opt.replace(/\*/g, ""),
            );
            return {
              word: word,
              options: cleanOptions.length > 0 ? cleanOptions : ["", ""],
              correct_answer: correctIndex > -1 ? correctIndex.toString() : "0",
            };
          });
        }

        // 14. Word Search Parsing
        if (parsedData && activityType === "wordsearch" && parsedData.words) {
          recWordList = parsedData.words.map((wObj) => {
            // DB saves words as an array of characters: ["C", "A", "T"]
            if (Array.isArray(wObj.word)) {
              return wObj.word.join("");
            }
            if (typeof wObj.word === "string") {
              return wObj.word;
            }
            return "";
          });
          if (recWordList.length === 0) recWordList = [""];
        }

        // --- APPLY ALL EXTRACTED DATA TO FORMIK ---
        validation.setValues({
          ...validation.initialValues,
          id: editData.id,
          label: editData.label || "",
          btn_label: editData.btn_label || "Fill Up by Drag",
          type: activityType,
          card_id: editData.card_id || "",
          title: parsedData.title || "",

          // Updated questions logic
          questions:
            activityType === "mcq"
              ? recMCQ
              : activityType === "classifysentence"
              ? recClassifySentence
              : activityType === "audio" || activityType === "image"
              ? recAudioImage
              : recMatch,

          audioUrl: parsedData.audio || "",
          imageUrl: parsedData.image || "",
          questionsLater: parsedData.questionsLater ?? true,

          sequenceItems: recSequenceItems,
          sequenceSubtype: recSequenceSubtype,
          completeWords: recCompleteWords,
          matchPairs: recMatchPairs,
          selectWordQuestions: recSelectWord,
          rightOnePairs: recRightOne,
          fillUpQuestions: recFillUp,
          groupData: recGroupData,
          puzzlePairs: recPuzzlePairs,
          dragDropItems: recDragDropItems,
          wordList: recWordList, // Applied Word Search Array

          generatedTable: Array.isArray(parsedData.table)
            ? parsedData.table
            : [],
          generatedWords: Array.isArray(parsedData.words)
            ? parsedData.words
            : [],
        });
      }
    }
  }, [editData]);

  return (
    <div className="page-content">
      <Breadcrumbs
        title="Exercise Management"
        breadcrumbItem={
          isViewOnly
            ? "View Activity"
            : isEdit
            ? "Edit Activity"
            : "Add New Activity"
        }
      />

      <FormikProvider value={validation}>
        <Form onSubmit={validation.handleSubmit}>
          {/* Section 1: Configuration */}

          {/* Section 0: General Information */}
          <Card className="mb-3">
            <CardBody
              style={{
                pointerEvents: isViewOnly ? "none" : "auto",
                opacity: isViewOnly ? 0.9 : 1,
              }}
            >
              <h5 className="card-title mb-4">1. General Information</h5>
              {/* <Row>
                <Col md={4}>
                  <Label>Grade</Label>
                  <Input
                    type="select"
                    style={commonInputStyle}
                    {...validation.getFieldProps("grade")}
                    invalid={
                      !!(validation.touched.grade && validation.errors.grade)
                    }
                  >
                    <option value="">Select Grade</option>
                    <option value="Primary 1">Primary 1</option>
                    <option value="Primary 2">Primary 2</option>
                    <option value="Primary 3">Primary 3</option>
                    <option value="Primary 4">Primary 4</option>
                    <option value="Primary 5">Primary 5</option>
                    <option value="Primary 6 (PSLE)">Primary 6 (PSLE)</option>
                    <option value="Secondary 1">Secondary 1</option>
                    <option value="Secondary 2">Secondary 2</option>
                    <option value="Secondary 3">Secondary 3</option>
                    <option value="Secondary 4 (O level)">
                      Secondary 4 (O level)
                    </option>
                    <option value="A level">A level</option>
                  </Input>
                  {validation.touched.grade && validation.errors.grade && (
                    <FormFeedback type="invalid">
                      {validation.errors.grade}
                    </FormFeedback>
                  )}
                </Col>

                <Col md={4}>
                  <Label>Language</Label>
                  <Input
                    type="select"
                    style={commonInputStyle}
                    {...validation.getFieldProps("language")}
                    invalid={
                      !!(
                        validation.touched.language &&
                        validation.errors.language
                      )
                    }
                  >
                    <option value="">Select Language</option>
                    <option value="Hindi">Hindi</option>
                    <option value="German">German</option>
                    <option value="French">French</option>
                  </Input>
                  {validation.touched.language &&
                    validation.errors.language && (
                      <FormFeedback type="invalid">
                        {validation.errors.language}
                      </FormFeedback>
                    )}
                </Col>

                <Col md={4}>
                  <Label>Curriculum</Label>
                  <Input
                    type="select"
                    style={commonInputStyle}
                    {...validation.getFieldProps("curriculum")}
                    invalid={
                      !!(
                        validation.touched.curriculum &&
                        validation.errors.curriculum
                      )
                    }
                  >
                    <option value="">Select Curriculum</option>
                    <option value="MOE">MOE</option>
                    <option value="IGCSE">IGCSE</option>
                    <option value="IB">IB</option>
                    <option value="CBSE">CBSE</option>
                  </Input>
                  {validation.touched.curriculum &&
                    validation.errors.curriculum && (
                      <FormFeedback type="invalid">
                        {validation.errors.curriculum}
                      </FormFeedback>
                    )}
                </Col>
              </Row> */}
              <Row>
                <Col md={4}>
                  <Label>Grade</Label>
                  <Input
                    type="select"
                    style={commonInputStyle}
                    {...validation.getFieldProps("grade")}
                    invalid={
                      !!(validation.touched.grade && validation.errors.grade)
                    }
                  >
                    <option value="">Select Grade</option>
                    {/* The ?. ensures map only runs if grades is an array */}
                    {fieldOptions.grades?.map((grade, index) => (
                      <option key={index} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </Input>
                  {validation.touched.grade && validation.errors.grade && (
                    <FormFeedback type="invalid">
                      {validation.errors.grade}
                    </FormFeedback>
                  )}
                </Col>

                <Col md={4}>
                  <Label>Language</Label>
                  <Input
                    type="select"
                    style={commonInputStyle}
                    {...validation.getFieldProps("language")}
                    invalid={
                      !!(
                        validation.touched.language &&
                        validation.errors.language
                      )
                    }
                  >
                    <option value="">Select Language</option>
                    {fieldOptions.languages?.map((lang, index) => (
                      <option key={index} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </Input>
                  {validation.touched.language &&
                    validation.errors.language && (
                      <FormFeedback type="invalid">
                        {validation.errors.language}
                      </FormFeedback>
                    )}
                </Col>

                <Col md={4}>
                  <Label>Curriculum</Label>
                  <Input
                    type="select"
                    style={commonInputStyle}
                    {...validation.getFieldProps("curriculum")}
                    invalid={
                      !!(
                        validation.touched.curriculum &&
                        validation.errors.curriculum
                      )
                    }
                  >
                    <option value="">Select Curriculum</option>
                    {fieldOptions.curriculums?.map((curr, index) => (
                      <option key={index} value={curr}>
                        {curr}
                      </option>
                    ))}
                  </Input>
                  {validation.touched.curriculum &&
                    validation.errors.curriculum && (
                      <FormFeedback type="invalid">
                        {validation.errors.curriculum}
                      </FormFeedback>
                    )}
                </Col>
              </Row>
            </CardBody>
          </Card>

          <Card className="mb-3">
            <CardBody
              style={{
                pointerEvents: isViewOnly ? "none" : "auto",
                opacity: isViewOnly ? 0.9 : 1,
              }}
            >
              <h5 className="card-title mb-4">2. Configuration</h5>
              <Row>
                <Col md={3}>
                  <Label>Select Card (Topic)</Label>
                  {loadingCards ? (
                    <Spinner size="sm" color="primary" className="ms-2" />
                  ) : (
                    <Input
                      type="select"
                      style={commonInputStyle}
                      {...validation.getFieldProps("card_id")}
                      invalid={
                        validation.touched.card_id && validation.errors.card_id
                          ? true
                          : false
                      }
                    >
                      <option value="">-- Choose a Card --</option>
                      {cards.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </Input>
                  )}
                  {validation.touched.card_id && validation.errors.card_id ? (
                    <FormFeedback type="invalid">
                      {validation.errors.card_id}
                    </FormFeedback>
                  ) : null}
                </Col>

                <Col md={3}>
                  <Label>Chapter Name</Label>
                  <Input
                    type="text"
                    list="chapter-options"
                    placeholder="Select or Add Chapter"
                    style={commonInputStyle}
                    {...validation.getFieldProps("chapter_name")}
                    invalid={
                      validation.touched.chapter_name &&
                      validation.errors.chapter_name
                        ? true
                        : false
                    }
                  />
                  <datalist id="chapter-options">
                    {/* Map existing chapters here */}
                  </datalist>
                  {validation.touched.chapter_name &&
                  validation.errors.chapter_name ? (
                    <FormFeedback type="invalid">
                      {validation.errors.chapter_name}
                    </FormFeedback>
                  ) : null}
                </Col>
                <Col md={3}>
                  <Label>Activity Type</Label>
                  <Input
                    type="select"
                    style={commonInputStyle}
                    {...validation.getFieldProps("type")}
                    invalid={
                      validation.touched.type && validation.errors.type
                        ? true
                        : false
                    }
                  >
                    <option value="">Select Type</option>
                    <option value="audio">
                      Information Processing (Audio)
                    </option>
                    <option value="image">
                      Information Processing (Image)
                    </option>
                    <option value="mcq">MCQ (Multiple Choice)</option>
                    <option value="match">Match the Pairs (Drag & Drop)</option>
                    <option value="completeword">Complete Word</option>
                    <option value="sequence">Sequence</option>
                    <option value="classifysentence">
                      Pick the Right Option
                    </option>
                    <option value="wordsearch">Word Search</option>
                    <option value="matchpair">Match Pair</option>
                    <option value="selectword">Select Word</option>
                    <option value="rightone">
                      Right One (Choose Correct Word)
                    </option>
                    <option value="fillup">Fill Up</option>
                    <option value="group">Group Sorting </option>
                    <option value="completepuzzle">Complete Puzzle </option>
                    <option value="draganddrop">Drag and Drop(image) </option>
                  </Input>
                  {validation.touched.type && validation.errors.type ? (
                    <FormFeedback type="invalid">
                      {validation.errors.type}
                    </FormFeedback>
                  ) : null}
                </Col>
                <Col md={3}>
                  <Label>Activity Label</Label>
                  <Input
                    type="text"
                    style={commonInputStyle}
                    {...validation.getFieldProps("label")}
                    invalid={
                      validation.touched.label && validation.errors.label
                        ? true
                        : false
                    }
                  />
                  {validation.touched.label && validation.errors.label ? (
                    <FormFeedback type="invalid">
                      {validation.errors.label}
                    </FormFeedback>
                  ) : null}
                </Col>
              </Row>
            </CardBody>
          </Card>

          {/* Section 2: Content Data */}
          <Card className="mb-3">
            <CardBody
              style={{
                pointerEvents: isViewOnly ? "none" : "auto",
                opacity: isViewOnly ? 0.9 : 1,
              }}
            >
              <h5 className="card-title mb-4">3. Content Data</h5>
              <div className="mb-4">
                <Label>Instruction Title</Label>
                <Input
                  type="text"
                  {...validation.getFieldProps("title")}
                  placeholder="e.g. Select the correct answer"
                  invalid={
                    validation.touched.title && validation.errors.title
                      ? true
                      : false
                  }
                />
                {validation.touched.title && validation.errors.title ? (
                  <FormFeedback type="invalid">
                    {validation.errors.title}
                  </FormFeedback>
                ) : null}
              </div>
              <hr />

              {/* Dynamic Sections Based on Type */}

              {/* New Information Processing Types */}
              {(validation.values.type === "audio" ||
                validation.values.type === "image") && (
                <InformationProcessingSection
                  validation={validation}
                  isViewOnly={isViewOnly}
                />
              )}

              {validation.values.type === "mcq" && (
                <FieldArray name="questions">
                  {({ push, remove }) => (
                    <>
                      {validation.values.questions.map((_, index) => (
                        <div
                          key={index}
                          className="p-3 mb-3 border rounded bg-light"
                        >
                          <div className="d-flex justify-content-between mb-2">
                            <h6 className="m-0 text-primary">
                              Question {index + 1}
                            </h6>
                            {!isViewOnly && (
                              <Button
                                color="danger"
                                size="sm"
                                outline
                                onClick={() => remove(index)}
                              >
                                <i className="mdi mdi-delete"></i>
                              </Button>
                            )}
                          </div>
                          <MCQSection index={index} validation={validation} />
                        </div>
                      ))}
                      {!isViewOnly && (
                        <Button
                          color="success"
                          onClick={() =>
                            push({
                              question: "",
                              answers: ["", "", "", ""],
                              correct_answer: "0",
                            })
                          }
                        >
                          + Add Question
                        </Button>
                      )}
                    </>
                  )}
                </FieldArray>
              )}

              {validation.values.type === "match" && (
                <MatchBySection validation={validation} />
              )}
              {validation.values.type === "completeword" && (
                <CompleteWordSection validation={validation} />
              )}
              {validation.values.type === "sequence" && (
                <SequenceSection validation={validation} />
              )}

              {validation.values.type === "classifysentence" && (
                <FieldArray name="questions">
                  {({ push, remove }) => (
                    <>
                      {validation.values.questions.map((_, index) => (
                        <div
                          key={index}
                          className="p-3 mb-3 border rounded bg-light"
                        >
                          <div className="d-flex justify-content-between mb-2">
                            <h6 className="m-0 text-primary">
                              Question {index + 1}
                            </h6>
                            {!isViewOnly && (
                              <Button
                                color="danger"
                                size="sm"
                                outline
                                onClick={() => remove(index)}
                              >
                                <i className="mdi mdi-delete"></i>
                              </Button>
                            )}
                          </div>
                          <ClassifySentenceSection
                            index={index}
                            validation={validation}
                          />
                        </div>
                      ))}
                      {!isViewOnly && (
                        <Button
                          color="success"
                          onClick={() =>
                            push({
                              word: "",
                              options: ["", ""],
                              correct_answer: "0",
                            })
                          }
                        >
                          + Add Question
                        </Button>
                      )}
                    </>
                  )}
                </FieldArray>
              )}

              {validation.values.type === "wordsearch" && (
                <WordSearchSection
                  values={validation.values}
                  setFieldValue={validation.setFieldValue}
                />
              )}

              {validation.values.type === "matchpair" && (
                <MatchPairSection validation={validation} />
              )}

              {validation.values.type === "selectword" && (
                <SelectWordSection validation={validation} />
              )}

              {validation.values.type === "rightone" && (
                <RightOneSection validation={validation} />
              )}

              {validation.values.type === "fillup" && (
                <FillUpSection validation={validation} />
              )}

              {validation.values.type === "group" && (
                <GroupSection validation={validation} />
              )}

              {validation.values.type === "completepuzzle" && (
                <CompletePuzzleSection validation={validation} />
              )}

              {validation.values.type === "draganddrop" && (
                <DragAndDropSection validation={validation} />
              )}

              {!validation.values.type && (
                <div className="text-center p-5 border rounded bg-light text-muted">
                  Please select an <strong>Activity Type</strong> to start
                  adding content.
                </div>
              )}
            </CardBody>
          </Card>

          {/* Form Actions */}
          <div className="d-flex justify-content-end gap-2 mb-5">
            <Button
              color="secondary"
              onClick={() => navigate("/Exercise-type")}
            >
              {isViewOnly ? "Close" : "Cancel"}
            </Button>
            {!isViewOnly && (
              <Button color="primary" type="submit">
                {isEdit ? "Update Activity" : "Create Activity"}
              </Button>
            )}
          </div>
        </Form>
      </FormikProvider>
    </div>
  );
}

export default InvoicesDetail;
