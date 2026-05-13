import React, { useState } from "react";
import {
  Row,
  Col,
  Input,
  Label,
  Button,
  Card,
  CardBody,
  Spinner,
} from "reactstrap";
import { FieldArray } from "formik";
import Swal from "sweetalert2";

// Import your URL constants
import { API_URL } from "../../helpers/api_helper";
import { UPLOAD_MEDIA } from "../../helpers/url_helper";

const ClickAndDragSection = ({ validation, isViewOnly }) => {
  const [uploadingField, setUploadingField] = useState(null);

  const handleFileUpload = async (event, index, fieldName) => {
    const file = event.target.files[0];
    if (!file) return;

    const UPLOAD_ENDPOINT = `${API_URL}${UPLOAD_MEDIA}`;

    try {
      setUploadingField(`${index}-${fieldName}`);

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

        // Save URL to the specific field in Formik
        validation.setFieldValue(
          `clickAndDragRows.${index}.${fieldName}`,
          fullSavedPath,
        );

        Swal.fire({
          title: "Success",
          text: "File uploaded successfully!",
          icon: "success",
          timer: 1000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire("Error", result.message || "Failed to upload.", "error");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      Swal.fire("Error", "An error occurred during upload.", "error");
    } finally {
      setUploadingField(null);
      event.target.value = null; // Reset input
    }
  };

  // Helper to render a file upload block
  const renderUploadBlock = (
    index,
    fieldName,
    label,
    acceptType = "image/*",
  ) => {
    const currentValue = validation.values.clickAndDragRows[index][fieldName];
    const isUploading = uploadingField === `${index}-${fieldName}`;

    return (
      <Col md={4} className="mb-3">
        <Label className="fw-bold">{label}</Label>
        <div className="d-flex align-items-center gap-2">
          <Input
            type="file"
            accept={acceptType}
            onChange={(e) => handleFileUpload(e, index, fieldName)}
            disabled={isUploading || isViewOnly}
          />
          {isUploading && <Spinner size="sm" color="primary" />}
        </div>
        {currentValue && (
          <div className="mt-2 p-1 bg-white border rounded d-inline-block">
            {acceptType === "audio/*" ? (
              <audio
                controls
                src={currentValue}
                style={{ height: "30px", width: "200px" }}
              />
            ) : (
              <img
                src={currentValue}
                alt="preview"
                style={{
                  height: "40px",
                  width: "40px",
                  objectFit: "cover",
                  borderRadius: "4px",
                }}
              />
            )}
            <small className="ms-2 text-success">
              <i className="mdi mdi-check-circle"></i> Uploaded
            </small>
          </div>
        )}
      </Col>
    );
  };

  return (
    <>
      <Label className="fw-bold text-primary mb-3">
        Vocabulary Building (Rosetta Style)
      </Label>
      <FieldArray
        name="clickAndDragRows"
        render={(arrayHelpers) => (
          <>
            {validation.values.clickAndDragRows.map((item, index) => (
              <Card key={index} className="mb-4 border bg-light shadow-none">
                <CardBody className="p-3">
                  <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                    <h5 className="text-secondary m-0">Question {index + 1}</h5>
                    {!isViewOnly && (
                      <Button
                        color="danger"
                        size="sm"
                        outline
                        onClick={() => arrayHelpers.remove(index)}
                      >
                        <i className="mdi mdi-delete"></i> Remove
                      </Button>
                    )}
                  </div>

                  {/* Row 1: Word & Audio */}
                  <Row>
                    <Col md={4} className="mb-3">
                      <Label className="fw-bold">Target Word</Label>
                      <Input
                        type="text"
                        placeholder="e.g. लड़का"
                        disabled={isViewOnly}
                        {...validation.getFieldProps(
                          `clickAndDragRows.${index}.word`,
                        )}
                      />
                    </Col>
                    {renderUploadBlock(
                      index,
                      "audioSrc",
                      "Upload Audio",
                      "audio/*",
                    )}
                  </Row>

                  <hr className="my-2" />

                  {/* Row 2: Example Images (Static) */}
                  <h6 className="text-muted mt-2">Static Example Images</h6>
                  <Row>
                    {renderUploadBlock(index, "example1", "Example Image 1")}
                    {renderUploadBlock(index, "example2", "Example Image 2")}
                  </Row>

                  <hr className="my-2" />

                  {/* Row 3: Options (1 Correct, 2 Distractors) */}
                  <h6 className="text-muted mt-2">Interactive Options</h6>
                  <Row>
                    {renderUploadBlock(
                      index,
                      "correctImg",
                      "Correct Answer Image",
                    )}
                    {renderUploadBlock(
                      index,
                      "distractor1",
                      "Distractor Image 1",
                    )}
                    {renderUploadBlock(
                      index,
                      "distractor2",
                      "Distractor Image 2",
                    )}
                  </Row>
                </CardBody>
              </Card>
            ))}

            {!isViewOnly && (
              <Button
                color="success"
                onClick={() =>
                  arrayHelpers.push({
                    word: "",
                    audioSrc: "",
                    example1: "",
                    example2: "",
                    correctImg: "",
                    distractor1: "",
                    distractor2: "",
                  })
                }
              >
                + Add Another Question
              </Button>
            )}
          </>
        )}
      />
    </>
  );
};

export default ClickAndDragSection;
