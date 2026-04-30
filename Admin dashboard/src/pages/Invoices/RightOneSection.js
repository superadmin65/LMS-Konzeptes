import React from "react";
import { Row, Col, Input, Label, Button } from "reactstrap";
import { FieldArray } from "formik";

const RightOneSection = ({ validation }) => {
  return (
    <>
      <Label className="fw-bold text-primary mb-3">
        Add Word Pairs (The first word will be the correct one)
      </Label>

      <FieldArray
        name="rightOnePairs"
        render={(arrayHelpers) => (
          <>
            {validation.values.rightOnePairs.map((p, index) => (
              <div key={index} className="p-3 mb-3 border rounded bg-light">
                <Row>
                  <Col md={5}>
                    <Label>Correct Word (सही शब्द)</Label>
                    <Input
                      type="text"
                      placeholder="e.g. खिलौने"
                      {...validation.getFieldProps(
                        `rightOnePairs.${index}.correct`,
                      )}
                    />
                  </Col>
                  <Col md={5}>
                    <Label>Wrong Word (गलत शब्द)</Label>
                    <Input
                      type="text"
                      placeholder="e.g. खिलौना"
                      {...validation.getFieldProps(
                        `rightOnePairs.${index}.wrong`,
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
              onClick={() => arrayHelpers.push({ correct: "", wrong: "" })}
            >
              + Add More
            </Button>
          </>
        )}
      />
    </>
  );
};

export default RightOneSection;
