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
// Assuming you have an upload helper, otherwise use axios/fetch
import { post } from "../../helpers/api_helper";

const DragAndDropSection = ({ validation }) => {
  const [uploadingIndex, setUploadingIndex] = useState(null);

  const handleFileUpload = async (event, index) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadingIndex(index);
      // Replace '/upload-endpoint' with your actual API route for image uploads
      const response = await post("/upload-endpoint", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Assuming your API returns { url: "..." }
      if (response && response.url) {
        validation.setFieldValue(`dragDropItems.${index}.src`, response.url);
      }
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setUploadingIndex(null);
    }
  };

  return (
    <>
      <Label className="fw-bold text-primary mb-3">
        Match Image to Word (Drag & Drop)
      </Label>

      <FieldArray
        name="dragDropItems"
        render={(arrayHelpers) => (
          <>
            {validation.values.dragDropItems.map((item, index) => (
              <Card key={index} className="mb-3 border bg-light shadow-none">
                <CardBody className="p-3">
                  <Row className="align-items-center">
                    <Col md={5}>
                      <Label>Upload Image</Label>
                      <div className="d-flex align-items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, index)}
                        />
                        {uploadingIndex === index && (
                          <Spinner size="sm" color="primary" />
                        )}
                      </div>
                      {item.src && (
                        <div className="mt-2">
                          <img
                            src={item.src}
                            alt="preview"
                            style={{ height: "40px", borderRadius: "4px" }}
                          />
                          <small className="ms-2 text-success">Uploaded!</small>
                        </div>
                      )}
                    </Col>
                    <Col md={5}>
                      <Label>Target Word (Answer)</Label>
                      <Input
                        type="text"
                        placeholder="e.g. ठंडी"
                        {...validation.getFieldProps(
                          `dragDropItems.${index}.word`,
                        )}
                      />
                    </Col>
                    <Col md={2} className="text-end mt-4">
                      <Button
                        color="danger"
                        outline
                        onClick={() => arrayHelpers.remove(index)}
                      >
                        <i className="mdi mdi-delete"></i>
                      </Button>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            ))}
            <Button
              color="success"
              size="sm"
              onClick={() => arrayHelpers.push({ src: "", word: "" })}
            >
              + Add New Item
            </Button>
          </>
        )}
      />
    </>
  );
};

export default DragAndDropSection;
