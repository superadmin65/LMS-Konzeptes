import React from "react";
import { Row, Col, Input, Label, Button } from "reactstrap";
import { FieldArray } from "formik";

const FillUpSection = ({ validation }) => {
  return (
    <>
      <Label className="fw-bold text-primary mb-3">
        Add Fill-up Questions (Correct vs Wrong options)
      </Label>

      <FieldArray
        name="fillUpQuestions"
        render={(arrayHelpers) => (
          <>
            {validation.values.fillUpQuestions.map((q, index) => (
              <div key={index} className="p-3 mb-3 border rounded bg-light">
                <Row>
                  <Col md={12} className="mb-2">
                    <Label>
                      Sentence (Use "___" or leave blank where the answer goes)
                    </Label>
                    <Input
                      type="text"
                      placeholder="e.g. सुमित सुबह उठकर पढ़ाई करता है ___ फिर खेल के मैदान में जाता था।"
                      {...validation.getFieldProps(
                        `fillUpQuestions.${index}.sentence`,
                      )}
                    />
                  </Col>
                  <Col md={5}>
                    <Label>Right Option</Label>
                    <Input
                      type="text"
                      placeholder="e.g. और"
                      {...validation.getFieldProps(
                        `fillUpQuestions.${index}.right`,
                      )}
                    />
                  </Col>
                  <Col md={5}>
                    <Label>Wrong Option</Label>
                    <Input
                      type="text"
                      placeholder="e.g. तो"
                      {...validation.getFieldProps(
                        `fillUpQuestions.${index}.wrong`,
                      )}
                    />
                  </Col>
                  <Col md={2} className="d-flex align-items-end">
                    <Button
                      color="danger"
                      outline
                      onClick={() => arrayHelpers.remove(index)}
                      className="w-100"
                    >
                      <i className="mdi mdi-delete"></i>
                    </Button>
                  </Col>
                </Row>
              </div>
            ))}
            <Button
              color="success"
              size="sm"
              onClick={() =>
                arrayHelpers.push({ sentence: "", right: "", wrong: "" })
              }
            >
              + Add More
            </Button>
          </>
        )}
      />
    </>
  );
};

export default FillUpSection;
