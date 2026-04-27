import React from "react";
import { Row, Col, Input, Label, Button, Card, CardBody } from "reactstrap";
import { FieldArray } from "formik";

const GroupSection = ({ validation }) => {
  return (
    <>
      <Label className="fw-bold text-primary mb-3">
        Define Groups and their Words
      </Label>

      <FieldArray
        name="groupData"
        render={(arrayHelpers) => (
          <>
            {validation.values.groupData.map((group, index) => (
              <Card key={index} className="mb-3 border shadow-none bg-light">
                <CardBody>
                  <Row>
                    <Col md={11}>
                      <Row>
                        <Col md={4}>
                          <Label>Group Name (Category)</Label>
                          <Input
                            type="text"
                            placeholder="e.g. जातिवाचक संज्ञा"
                            {...validation.getFieldProps(
                              `groupData.${index}.name`,
                            )}
                          />
                        </Col>
                        <Col md={8}>
                          <Label>Words (Comma separated)</Label>
                          <Input
                            type="textarea"
                            rows="2"
                            placeholder="लड़का, नदी, पर्वत, शहर..."
                            {...validation.getFieldProps(
                              `groupData.${index}.text`,
                            )}
                          />
                        </Col>
                      </Row>
                    </Col>
                    <Col
                      md={1}
                      className="d-flex align-items-center justify-content-end"
                    >
                      <Button
                        color="danger"
                        outline
                        size="sm"
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
              outline
              onClick={() => arrayHelpers.push({ name: "", text: "" })}
            >
              + Add New Group
            </Button>
          </>
        )}
      />
    </>
  );
};

export default GroupSection;
