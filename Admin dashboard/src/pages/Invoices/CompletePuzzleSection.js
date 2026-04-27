import React from "react";
import { Row, Col, Input, Label, Button } from "reactstrap";
import { FieldArray } from "formik";

const CompletePuzzleSection = ({ validation }) => {
  return (
    <>
      <Label className="fw-bold text-primary mb-3">
        Word Puzzle Pairs (Base + Correct + Wrong)
      </Label>

      <FieldArray
        name="puzzlePairs"
        render={(arrayHelpers) => (
          <>
            {validation.values.puzzlePairs.map((p, index) => (
              <div key={index} className="p-3 mb-3 border rounded bg-light">
                <Row>
                  <Col md={4}>
                    <Label>Base Word (मुख्य शब्द)</Label>
                    <Input
                      type="text"
                      placeholder="e.g. पुस्तक"
                      {...validation.getFieldProps(`puzzlePairs.${index}.base`)}
                    />
                  </Col>
                  <Col md={3}>
                    <Label>Correct Suffix</Label>
                    <Input
                      type="text"
                      placeholder="e.g. आलय"
                      {...validation.getFieldProps(
                        `puzzlePairs.${index}.right`,
                      )}
                    />
                  </Col>
                  <Col md={3}>
                    <Label>Wrong Suffix</Label>
                    <Input
                      type="text"
                      placeholder="e.g. घर"
                      {...validation.getFieldProps(
                        `puzzlePairs.${index}.wrong`,
                      )}
                    />
                  </Col>
                  <Col md={2} className="d-flex align-items-end">
                    <Button
                      color="danger"
                      outline
                      className="w-100"
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
              onClick={() =>
                arrayHelpers.push({ base: "", right: "", wrong: "" })
              }
            >
              + Add Word Pair
            </Button>
          </>
        )}
      />
    </>
  );
};

export default CompletePuzzleSection;
