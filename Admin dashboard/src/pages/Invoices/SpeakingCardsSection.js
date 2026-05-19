import React from "react";
import { Row, Col, Input, Label, Button } from "reactstrap";
import { FieldArray } from "formik";
import { useEffect } from "react";

const SpeakingCardsSection = ({ validation }) => {
  const handleFileSelect = (e, type, index) => {
    const file = e.target.files[0];

    if (!file) return;

    const previewURL = URL.createObjectURL(file);

    const finalPath =
      type === "audio"
        ? `/konzeptes/audio/${file.name}`
        : `/konzeptes/${file.name}`;

    // Update preview
    validation.setFieldValue(`cards.${index}.${type}Preview`, previewURL);

    // Update actual value
    validation.setFieldValue(`cards.${index}.${type}`, finalPath);
  };

  useEffect(() => {
    console.log("Current cards:", validation.values.cards);
  }, [validation.values.cards]);

  return (
    <>
      <div className="mb-3">
        <Label className="fw-bold">Activity Title</Label>

        <Input
          type="text"
          placeholder="चित्र देखकर दोहराएँ"
          {...validation.getFieldProps("title")}
        />
      </div>

      <hr />

      <FieldArray
        name="cards"
        render={(arrayHelpers) => (
          <>
            {(validation.values.cards || []).map((card, index) => (
              <div
                key={index}
                className="border rounded p-3 mb-4 shadow-sm bg-light"
              >
                <div className="d-flex justify-content-between mb-3">
                  <h5>Speaking Card {index + 1}</h5>

                  {(validation.values.cards || []).length > 1 && (
                    <Button
                      color="danger"
                      size="sm"
                      onClick={() => arrayHelpers.remove(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <Row>
                  {/* Hindi text */}
                  <Col md={6} className="mb-3">
                    <Label>Hindi Word/Sentence</Label>

                    <Input
                      type="text"
                      placeholder="सेब"
                      name={`cards[${index}].text`}
                      value={validation.values.cards[index]?.text || ""}
                      onChange={validation.handleChange}
                    />
                  </Col>

                  {/* Audio Upload */}
                  <Col md={6} className="mb-3">
                    <Label>Audio File</Label>

                    <Input
                      type="file"
                      accept=".mp3,audio/*"
                      onChange={(e) => handleFileSelect(e, "audio", index)}
                    />
                  </Col>

                  {/* Image Upload */}
                  <Col md={6} className="mb-3">
                    <Label>Image File</Label>

                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e, "image", index)}
                    />
                  </Col>

                  {/* Audio preview */}

                  {card.audioPreview && (
                    <Col md={6} className="mb-3">
                      <Label>Audio Preview</Label>

                      <audio
                        controls
                        style={{
                          width: "100%",
                        }}
                      >
                        <source src={card.audioPreview} />
                      </audio>
                    </Col>
                  )}

                  {/* Image preview */}

                  {card.imagePreview && (
                    <Col md={6} className="mb-3">
                      <Label>Image Preview</Label>

                      <img
                        src={card.imagePreview}
                        alt=""
                        style={{
                          width: "120px",
                          borderRadius: "10px",
                        }}
                      />
                    </Col>
                  )}
                </Row>
              </div>
            ))}

            <Button
              color="success"
              type="button"
              onClick={() =>
                arrayHelpers.push({
                  text: "",
                  audio: "",
                  image: "",
                  audioPreview: "",
                  imagePreview: "",
                })
              }
            >
              + Add Speaking Card
            </Button>
          </>
        )}
      />
    </>
  );
};

export default SpeakingCardsSection;
