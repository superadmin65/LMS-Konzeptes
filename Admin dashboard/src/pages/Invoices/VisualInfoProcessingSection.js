import React, { useState } from "react";
import { Row, Col, Input, Label, Button, Spinner } from "reactstrap";
import { FieldArray } from "formik";
import Swal from "sweetalert2";

// Import your URL constants
import { API_URL } from "../../helpers/api_helper";
import { UPLOAD_MEDIA } from "../../helpers/url_helper";

const VisualInfoProcessingSection = ({ validation, isViewOnly }) => {
  const isAudio = validation.values.type === "visual_audio";
  const isImage = validation.values.type === "visual_image";

  // Loading states
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingOption, setUploadingOption] = useState({});

  // 1. Upload Handler for Main Prompt (Audio/Image)
  const handleMainUpload = async (event, mediaType) => {
    const file = event.target.files[0];
    if (!file) return;

    const UPLOAD_ENDPOINT = `${API_URL}${UPLOAD_MEDIA}`;

    try {
      setUploadingMain(true);
      const response = await fetch(UPLOAD_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
          file_name: file.name,
        },
        body: file,
      });

      const textResult = await response.text();
      const result = JSON.parse(textResult);

      if (result && result.status === "success") {
        const fullSavedPath = `${API_URL}${result.url}`;
        if (mediaType === "audio")
          validation.setFieldValue("audioUrl", fullSavedPath);
        if (mediaType === "image")
          validation.setFieldValue("imageUrl", fullSavedPath);

        Swal.fire({
          title: "Success",
          text: "Prompt Media uploaded!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire("Error", result.message || "Failed to upload.", "error");
      }
    } catch (error) {
      Swal.fire("Error", "An error occurred during upload.", "error");
    } finally {
      setUploadingMain(false);
      event.target.value = null;
    }
  };

  // 2. Upload Handler for the Image Options
  const handleOptionUpload = async (event, qIndex, ansIdx) => {
    const file = event.target.files[0];
    if (!file) return;

    const UPLOAD_ENDPOINT = `${API_URL}${UPLOAD_MEDIA}`;
    const stateKey = `${qIndex}-${ansIdx}`;

    try {
      setUploadingOption((prev) => ({ ...prev, [stateKey]: true }));
      const response = await fetch(UPLOAD_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
          file_name: file.name,
        },
        body: file,
      });

      const textResult = await response.text();
      const result = JSON.parse(textResult);

      if (result && result.status === "success") {
        const fullSavedPath = `${API_URL}${result.url}`;
        validation.setFieldValue(
          `questions.${qIndex}.answers.${ansIdx}`,
          fullSavedPath,
        );

        Swal.fire({
          title: "Success",
          text: "Option image uploaded!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire("Error", result.message || "Failed to upload.", "error");
      }
    } catch (error) {
      Swal.fire("Error", "An error occurred during upload.", "error");
    } finally {
      setUploadingOption((prev) => ({ ...prev, [stateKey]: false }));
      event.target.value = null;
    }
  };

  return (
    <>
      {/* --- PROMPT MEDIA SETUP --- */}
      <div className="p-3 border rounded bg-light mb-4 border-info">
        <h5 className="text-info mb-3">
          <i
            className={`mdi ${isAudio ? "mdi-music-note" : "mdi-image"} me-2`}
          ></i>
          {isAudio ? "Audio Prompt Setup" : "Image Prompt Setup"}
        </h5>

        <Row>
          <Col md={8}>
            <Label className="fw-bold">
              Upload Main {isAudio ? "Audio" : "Image"} (What the student
              hears/sees)
            </Label>
            <div className="d-flex align-items-center gap-2">
              <Input
                type="file"
                accept={isAudio ? "audio/*" : "image/*"}
                onChange={(e) =>
                  handleMainUpload(e, isAudio ? "audio" : "image")
                }
                disabled={isViewOnly || uploadingMain}
              />
              {uploadingMain && <Spinner size="sm" color="primary" />}
            </div>

            {/* Preview Main Media */}
            {isAudio && validation.values.audioUrl && (
              <div className="mt-3 p-2 bg-white border rounded d-inline-block">
                <div className="d-flex align-items-center mb-2">
                  <i className="mdi mdi-check-circle text-success fs-5 me-2"></i>
                  <span className="text-success fw-bold small">
                    Audio Uploaded
                  </span>
                </div>
                <audio
                  src={validation.values.audioUrl}
                  controls
                  style={{ height: "35px" }}
                />
              </div>
            )}

            {isImage && validation.values.imageUrl && (
              <div className="mt-3 p-2 bg-white border rounded d-inline-block">
                <img
                  src={validation.values.imageUrl}
                  alt="Main Prompt"
                  style={{ height: "50px", borderRadius: "4px" }}
                />
                <span className="ms-2 text-success fw-bold small">
                  <i className="mdi mdi-check-circle"></i> Uploaded
                </span>
              </div>
            )}
          </Col>

          {isAudio && (
            <Col md={4} className="d-flex align-items-center mt-3 mt-md-0">
              <div className="form-check form-switch mt-4">
                <Input
                  type="checkbox"
                  className="form-check-input"
                  checked={validation.values.questionsLater}
                  onChange={(e) =>
                    validation.setFieldValue("questionsLater", e.target.checked)
                  }
                  disabled={isViewOnly}
                />
                <Label className="form-check-label fw-bold">
                  Show Questions Later
                </Label>
              </div>
            </Col>
          )}
        </Row>
      </div>

      <hr />

      {/* --- IMAGE OPTIONS SETUP --- */}
      <Label className="fw-bold text-primary mb-3">
        Questions & Image Options
      </Label>
      <FieldArray name="questions">
        {({ push, remove }) => (
          <>
            {validation.values.questions.map((currentQuestion, index) => (
              <div
                key={index}
                className="p-3 mb-4 border rounded bg-white shadow-sm"
              >
                <div className="d-flex justify-content-between mb-3">
                  <h6 className="m-0 text-primary">Question {index + 1}</h6>
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

                <div className="mb-4">
                  <Label className="fw-bold">Question Text (Optional)</Label>
                  <Input
                    type="text"
                    placeholder="e.g. Select the image that matches the audio."
                    {...validation.getFieldProps(`questions.${index}.question`)}
                    disabled={isViewOnly}
                  />
                </div>

                <Label className="text-secondary fw-bold mb-2">
                  Image Options (Click the box to select the correct answer)
                </Label>

                {/* --- NESTED FIELD ARRAY FOR DYNAMIC OPTIONS --- */}
                <FieldArray
                  name={`questions.${index}.answers`}
                  render={(answerArrayHelpers) => (
                    <Row>
                      {(currentQuestion.answers || ["", "", "", ""]).map(
                        (answerUrl, ansIdx) => {
                          const isSelected =
                            currentQuestion.correct_answer ===
                            ansIdx.toString();
                          const isUploadingOpt =
                            uploadingOption[`${index}-${ansIdx}`];

                          return (
                            <Col md={6} key={ansIdx} className="mb-3">
                              <div
                                className={`p-3 border rounded ${
                                  isSelected
                                    ? "border-success bg-light"
                                    : "bg-white"
                                }`}
                                // Clicking the box makes it the correct answer
                                onClick={() =>
                                  !isViewOnly &&
                                  validation.setFieldValue(
                                    `questions.${index}.correct_answer`,
                                    ansIdx.toString(),
                                  )
                                }
                                style={{
                                  cursor: isViewOnly ? "default" : "pointer",
                                }}
                              >
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <div className="d-flex align-items-center">
                                    <input
                                      type="radio"
                                      className="form-check-input mt-0 me-2"
                                      name={`question_group_${index}`}
                                      checked={isSelected}
                                      onChange={() =>
                                        validation.setFieldValue(
                                          `questions.${index}.correct_answer`,
                                          ansIdx.toString(),
                                        )
                                      }
                                      disabled={isViewOnly}
                                      style={{
                                        width: "20px",
                                        height: "20px",
                                        cursor: "pointer",
                                      }}
                                    />
                                    <Label className="mb-0 fw-bold">
                                      Option {ansIdx + 1}
                                    </Label>
                                  </div>

                                  {/* REMOVE BUTTON (X) for individual option */}
                                  {(currentQuestion.answers || []).length > 1 &&
                                    !isViewOnly && (
                                      <Button
                                        color="link"
                                        className="text-danger p-0"
                                        onClick={(e) => {
                                          e.stopPropagation(); // Stop box click from firing
                                          answerArrayHelpers.remove(ansIdx);
                                          // Reset correct answer to index 0 if the deleted one was selected
                                          if (isSelected) {
                                            validation.setFieldValue(
                                              `questions.${index}.correct_answer`,
                                              "0",
                                            );
                                          }
                                        }}
                                      >
                                        <i className="mdi mdi-close-circle fs-4" />
                                      </Button>
                                    )}
                                </div>

                                <div className="d-flex align-items-center gap-2 mb-2">
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                      handleOptionUpload(e, index, ansIdx)
                                    }
                                    onClick={(e) => e.stopPropagation()} // Stop box click from firing
                                    disabled={isViewOnly || isUploadingOpt}
                                    bsSize="sm"
                                  />
                                  {isUploadingOpt && (
                                    <Spinner size="sm" color="primary" />
                                  )}
                                </div>

                                {answerUrl ? (
                                  <div className="mt-2 text-center bg-white border rounded p-1">
                                    <img
                                      src={answerUrl}
                                      alt={`Option ${ansIdx + 1}`}
                                      style={{
                                        height: "80px",
                                        objectFit: "contain",
                                        borderRadius: "4px",
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div
                                    className="mt-2 text-center bg-light border rounded d-flex align-items-center justify-content-center text-muted"
                                    style={{ height: "80px", fontSize: "12px" }}
                                  >
                                    No Image
                                  </div>
                                )}
                              </div>
                            </Col>
                          );
                        },
                      )}

                      {/* ADD OPTION BUTTON */}
                      <Col xs={12}>
                        {!isViewOnly && (
                          <Button
                            color="success"
                            outline
                            size="sm"
                            type="button"
                            className="mt-2"
                            onClick={() => answerArrayHelpers.push("")}
                          >
                            + Add Option
                          </Button>
                        )}
                      </Col>
                    </Row>
                  )}
                />
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
    </>
  );
};

export default VisualInfoProcessingSection;
