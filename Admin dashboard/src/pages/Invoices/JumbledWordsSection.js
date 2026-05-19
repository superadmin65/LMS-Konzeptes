import React from "react";
import { Input, Label, Button } from "reactstrap";
import { FieldArray } from "formik";

export default function JumbledWordsSection({ validation }) {
  return (
    <>
      <div className="mb-3">
        <Label className="fw-bold">Activity Title</Label>

        <Input
          type="text"
          placeholder="Arrange words"
          {...validation.getFieldProps("title")}
        />
      </div>

      <hr />

      <FieldArray
        name="jumbledQuestions"
        render={(arrayHelpers) => (
          <>
            {(validation.values.jumbledQuestions || []).map(
              (question, index) => (
                <div key={index} className="border rounded p-3 mb-3">
                  <h5>Question {index + 1}</h5>

                  <Label>Correct Sentence/Word</Label>

                  <Input
                    type="text"
                    placeholder="राम स्कूल जाता है"
                    value={question.text || ""}
                    name={`jumbledQuestions.${index}.text`}
                    onChange={validation.handleChange}
                  />

                  {validation.values.jumbledQuestions.length > 1 && (
                    <Button
                      color="danger"
                      className="mt-3"
                      onClick={() => arrayHelpers.remove(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ),
            )}

            <Button
              color="success"
              type="button"
              onClick={() =>
                arrayHelpers.push({
                  text: "",
                })
              }
            >
              + Add Question
            </Button>
          </>
        )}
      />
    </>
  );
}
