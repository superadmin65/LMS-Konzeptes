// import React from "react";
// import { FormGroup, Label, Input, Row, Col, Button, Alert } from "reactstrap";
// import { FieldArray } from "formik";

// const SequenceSection = ({ validation }) => {
//   const { values, setFieldValue, getFieldProps } = validation;

//   return (
//     <div className="p-3 border rounded bg-white">
//       <Label className="fw-bold mb-3">1. Select Sequence Type</Label>
//       <Row className="mb-4">
//         <Col md={6}>
//           <div
//             className={`p-3 border rounded ${
//               values.sequenceSubtype === "character"
//                 ? "border-primary bg-light"
//                 : ""
//             }`}
//             style={{ cursor: "pointer" }}
//             onClick={() => setFieldValue("sequenceSubtype", "character")}
//           >
//             <FormGroup check className="mb-0">
//               <Label check style={{ cursor: "pointer" }}>
//                 <Input
//                   type="radio"
//                   name="sequenceSubtype"
//                   checked={values.sequenceSubtype === "character"}
//                   onChange={() => setFieldValue("sequenceSubtype", "character")}
//                 />{" "}
//                 <strong>Connecting Characters</strong>
//                 <div className="text-muted small">Example: पु - स्त - क</div>
//               </Label>
//             </FormGroup>
//           </div>
//         </Col>
//         <Col md={6}>
//           <div
//             className={`p-3 border rounded ${
//               values.sequenceSubtype === "word" ? "border-primary bg-light" : ""
//             }`}
//             style={{ cursor: "pointer" }}
//             onClick={() => setFieldValue("sequenceSubtype", "word")}
//           >
//             <FormGroup check className="mb-0">
//               <Label check style={{ cursor: "pointer" }}>
//                 <Input
//                   type="radio"
//                   name="sequenceSubtype"
//                   checked={values.sequenceSubtype === "word"}
//                   onChange={() => setFieldValue("sequenceSubtype", "word")}
//                 />{" "}
//                 <strong>Connecting Words</strong>
//                 <div className="text-muted small">
//                   Example: हमें खेलना पसंद है।
//                 </div>
//               </Label>
//             </FormGroup>
//           </div>
//         </Col>
//       </Row>

//       <hr />

//       <Label className="fw-bold mb-2">2. Enter Items</Label>
//       <FieldArray name="sequenceItems">
//         {({ push, remove }) => (
//           <>
//             {values.sequenceItems.map((item, index) => (
//               <Row key={index} className="mb-2 align-items-center">
//                 <Col>
//                   <Input
//                     type="text"
//                     placeholder={
//                       values.sequenceSubtype === "character"
//                         ? "Enter Word (e.g. पुस्तक)"
//                         : "Enter Sentence"
//                     }
//                     {...getFieldProps(`sequenceItems.${index}.text`)}
//                   />
//                 </Col>
//                 {values.sequenceItems.length > 1 && (
//                   <Col xs="auto">
//                     <Button
//                       color="danger"
//                       outline
//                       size="sm"
//                       onClick={() => remove(index)}
//                     >
//                       <i className="mdi mdi-delete"></i>
//                     </Button>
//                   </Col>
//                 )}
//               </Row>
//             ))}
//             <Button
//               color="success"
//               size="sm"
//               className="mt-2"
//               onClick={() => push({ text: "" })}
//             >
//               + Add{" "}
//               {values.sequenceSubtype === "character" ? "Word" : "Sentence"}
//             </Button>
//           </>
//         )}
//       </FieldArray>

//       <Alert color="info" className="mt-4 py-2 small">
//         <i className="mdi mdi-information-outline me-2"></i>
//         {values.sequenceSubtype === "character"
//           ? "Input words normally. The system will store them as space-separated characters (e.g., 'पु स्त क')."
//           : "Input full sentences. Each sentence will be stored on a new line."}
//       </Alert>
//     </div>
//   );
// };

// export default SequenceSection;

import React from "react";
import { FormGroup, Label, Input, Row, Col, Button, Alert } from "reactstrap";
import { FieldArray } from "formik";

const SequenceSection = ({ validation }) => {
  const { values, setFieldValue, getFieldProps } = validation;

  // Safety check to prevent "map of undefined" error
  if (!values.sequenceItems) return null;

  return (
    <div className="p-3 border rounded bg-white">
      <Label className="fw-bold mb-3">Sequence Sub-Type</Label>
      <Row className="mb-4">
        <Col md={6}>
          <div
            className={`p-3 border rounded ${
              values.sequenceSubtype === "character"
                ? "border-primary bg-light"
                : ""
            }`}
            style={{ cursor: "pointer" }}
            onClick={() => setFieldValue("sequenceSubtype", "character")}
          >
            <FormGroup check className="mb-0">
              <Label check style={{ cursor: "pointer" }}>
                <Input
                  type="radio"
                  checked={values.sequenceSubtype === "character"}
                  onChange={() => setFieldValue("sequenceSubtype", "character")}
                />{" "}
                <strong>Connecting Characters</strong>
                <div className="text-muted small">
                  Creates blocks like: पु | स् | त
                </div>
              </Label>
            </FormGroup>
          </div>
        </Col>
        <Col md={6}>
          <div
            className={`p-3 border rounded ${
              values.sequenceSubtype === "word" ? "border-primary bg-light" : ""
            }`}
            style={{ cursor: "pointer" }}
            onClick={() => setFieldValue("sequenceSubtype", "word")}
          >
            <FormGroup check className="mb-0">
              <Label check style={{ cursor: "pointer" }}>
                <Input
                  type="radio"
                  checked={values.sequenceSubtype === "word"}
                  onChange={() => setFieldValue("sequenceSubtype", "word")}
                />{" "}
                <strong>Connecting Words</strong>
                <div className="text-muted small">
                  Creates blocks like: हमें | खेलना | पसंद
                </div>
              </Label>
            </FormGroup>
          </div>
        </Col>
      </Row>

      <hr />

      <Label className="fw-bold mb-2">Enter Content</Label>
      <FieldArray name="sequenceItems">
        {({ push, remove }) => (
          <>
            {values.sequenceItems.map((_, index) => (
              <Row key={index} className="mb-2 align-items-center">
                <Col>
                  <Input
                    type="text"
                    placeholder={
                      values.sequenceSubtype === "character"
                        ? "Enter Word"
                        : "Enter Sentence"
                    }
                    {...getFieldProps(`sequenceItems.${index}.text`)}
                  />
                </Col>
                <Col xs="auto">
                  <Button
                    color="danger"
                    outline
                    size="sm"
                    onClick={() => remove(index)}
                    disabled={values.sequenceItems.length === 1}
                  >
                    <i className="mdi mdi-delete"></i>
                  </Button>
                </Col>
              </Row>
            ))}
            <Button
              color="success"
              outline
              size="sm"
              className="mt-2"
              onClick={() => push({ text: "" })}
            >
              + Add Row
            </Button>
          </>
        )}
      </FieldArray>
    </div>
  );
};

export default SequenceSection;

//// import React from "react";
// import { Row, Col, Input, Label, FormFeedback } from "reactstrap";

// const SequenceSection = ({ validation }) => {
//   return (
//     <>
//       {/* Instructions */}
//       <div className="mb-3">
//         <Label className="fw-bold">
//           Sentences (Each line will be one question)
//         </Label>
//         <Input
//           type="textarea"
//           rows="8"
//           placeholder={`Example:
//         मैं रोज़ दूध पीता हूँ।`}
//           //   {...validation.getFieldProps("text")}
//           {...validation.getFieldProps("sequenceText")}
//           invalid={
//             validation.touched.sequenceText && !!validation.errors.sequenceText
//           }
//         />
//         {validation.touched.sequenceText &&
//           !!validation.errors.sequenceText && (
//             <FormFeedback>{validation.errors.sequenceText}</FormFeedback>
//           )}
//       </div>
//     </>
//   );
// };

// export default SequenceSection;
