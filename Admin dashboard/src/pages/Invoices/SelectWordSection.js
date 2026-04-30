import React from "react";
import { Row, Col, Input, Label, Button } from "reactstrap";
import { FieldArray } from "formik";

const SelectWordSection = ({ validation }) => {
  return (
    <>
      <Label className="fw-bold text-primary mb-3">
        Select Word Questions (Sentence + Target Word)
      </Label>

      <FieldArray
        name="selectWordQuestions"
        render={(arrayHelpers) => (
          <>
            {validation.values.selectWordQuestions.map((q, index) => (
              <div key={index} className="p-3 mb-3 border rounded bg-light">
                <Row>
                  <Col md={8}>
                    <Label>Sentence</Label>
                    <Input
                      type="text"
                      placeholder="e.g. बगीचे में हरे-भरे पौधे हैं।"
                      {...validation.getFieldProps(
                        `selectWordQuestions.${index}.sentence`,
                      )}
                    />
                  </Col>
                  <Col md={3}>
                    <Label>Answer Word</Label>
                    <Input
                      type="text"
                      placeholder="e.g. हरे-भरे"
                      {...validation.getFieldProps(
                        `selectWordQuestions.${index}.answer`,
                      )}
                    />
                  </Col>
                  <Col md={1} className="d-flex align-items-end">
                    <Button
                      color="danger"
                      outline
                      onClick={() => arrayHelpers.remove(index)}
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
              onClick={() => arrayHelpers.push({ sentence: "", answer: "" })}
            >
              + Add Question
            </Button>
          </>
        )}
      />
    </>
  );
};

export default SelectWordSection;
