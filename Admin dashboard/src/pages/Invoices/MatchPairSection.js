import React from "react";
import { Row, Col, Input, Button, Label } from "reactstrap";
import { FieldArray } from "formik";

const MatchPairSection = ({ validation }) => {
  const { values, getFieldProps } = validation;

  return (
    <div className="p-3 border rounded bg-white">
      <Label className="fw-bold mb-3">Add Matching Pairs</Label>
      <FieldArray name="matchPairs">
        {({ push, remove }) => (
          <>
            <Row className="mb-2 text-muted small fw-bold">
              <Col md={5}>Left Side (e.g. सुंदर)</Col>
              <Col md={5}>Right Side (e.g. विशेषण)</Col>
              <Col md={2}></Col>
            </Row>
            {values.matchPairs.map((_, index) => (
              <Row key={index} className="mb-2 align-items-center">
                <Col md={5}>
                  <Input
                    type="text"
                    placeholder="Word"
                    {...getFieldProps(`matchPairs.${index}.left`)}
                  />
                </Col>
                <Col md={5}>
                  <Input
                    type="text"
                    placeholder="Matches with..."
                    {...getFieldProps(`matchPairs.${index}.right`)}
                  />
                </Col>
                <Col md={2}>
                  <Button
                    color="danger"
                    outline
                    size="sm"
                    onClick={() => remove(index)}
                    disabled={values.matchPairs.length === 1}
                  >
                    <i className="mdi mdi-delete"></i>
                  </Button>
                </Col>
              </Row>
            ))}
            <Button
              color="primary"
              outline
              size="sm"
              className="mt-2"
              onClick={() => push({ left: "", right: "" })}
            >
              + Add New Pair
            </Button>
          </>
        )}
      </FieldArray>
    </div>
  );
};

export default MatchPairSection;
