import React, { useState } from "react";
import { Row, Col, Input, Label, Button, Spinner } from "reactstrap";
import { FieldArray } from "formik";
import MCQSection from "./MCQSection";
import Swal from "sweetalert2";
import { API_URL } from "../../helpers/api_helper";
// Import your URL constants
// import { ORDS_BASE_URL, UPLOAD_MEDIA } from '../../helpers/url_helper';
import { UPLOAD_MEDIA } from "../../helpers/url_helper";

const InformationProcessingSection = ({ validation, isViewOnly }) => {
  const isAudio = validation.values.type === "audio";
  const isImage = validation.values.type === "image";

  // Loading states for file uploads
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // File Upload Handler for ORDS endpoint
  const handleFileUpload = async (event, mediaType) => {
    const file = event.target.files[0];
    if (!file) return;

    // Use the imported constants
    // const UPLOAD_ENDPOINT = `${ORDS_BASE_URL}${UPLOAD_MEDIA}`;
    const UPLOAD_ENDPOINT = `${API_URL}${UPLOAD_MEDIA}`;

    try {
      if (mediaType === "audio") setUploadingAudio(true);
      if (mediaType === "image") setUploadingImage(true);

      // Send the request to your Oracle Backend, NOT localhost:3000
      const response = await fetch(UPLOAD_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
          file_name: file.name,
        },
        body: file,
      });

      // 1. Read as text first to catch HTML error pages instead of crashing
      const textResult = await response.text();
      let result;

      try {
        result = JSON.parse(textResult);
      } catch (parseError) {
        console.error(
          "Backend did not return JSON. Here is the HTML it returned:",
          textResult,
        );
        throw new Error(
          "Server returned an invalid response. Check your ORDS_BASE_URL.",
        );
      }

      // 2. Handle the successful JSON response
      if (result && result.status === "success") {
        // This generates the FULL URL: http://localhost:8080/ords/dev/media/file-xxx
        // const fullSavedPath = `${ORDS_BASE_URL}${result.url}`;
        const fullSavedPath = `${API_URL}${result.url}`;

        // Update Formik state based on whether it is an Audio or Image activity
        if (mediaType === "audio") {
          validation.setFieldValue("audioUrl", fullSavedPath);
        } else if (mediaType === "image") {
          validation.setFieldValue("imageUrl", fullSavedPath);
        }

        // Silent auto-closing success popup
        Swal.fire({
          title: "Success",
          text: "File uploaded successfully!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire("Error", result.message || "Failed to upload.", "error");
      }
    } catch (error) {
      console.error("Upload Error:", error);
      Swal.fire(
        "Error",
        error.message || "An error occurred during upload.",
        "error",
      );
    } finally {
      // Turn off loaders and reset file input
      if (mediaType === "audio") setUploadingAudio(false);
      if (mediaType === "image") setUploadingImage(false);
      event.target.value = null;
    }
  };

  return (
    <>
      {/* Media Configuration Section */}
      <div className="p-3 border rounded bg-light mb-4 border-info">
        <h5 className="text-info mb-3">
          <i
            className={`mdi ${isAudio ? "mdi-music-note" : "mdi-image"} me-2`}
          ></i>
          {isAudio ? "Audio Setup" : "Image Setup"}
        </h5>

        {/* --- AUDIO UPLOAD UI --- */}
        {isAudio && (
          <Row>
            <Col md={8}>
              <Label className="fw-bold">Upload Audio File</Label>
              <div className="d-flex align-items-center gap-2">
                <Input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleFileUpload(e, "audio")}
                  disabled={isViewOnly || uploadingAudio}
                />
                {uploadingAudio && <Spinner size="sm" color="primary" />}
              </div>

              {/* Clean Audio Preview (No URL Text Box) */}
              {validation.values.audioUrl && (
                <div className="mt-3 p-2 bg-white border rounded d-inline-block">
                  <div className="d-flex align-items-center mb-2">
                    <i className="mdi mdi-check-circle text-success fs-5 me-2"></i>
                    <span className="text-success fw-bold small">
                      Audio Uploaded
                    </span>
                  </div>
                  <audio
                    src={validation.values.audioUrl}
                    controls
                    style={{ height: "35px" }}
                  />
                </div>
              )}
            </Col>

            <Col md={4} className="d-flex align-items-center mt-3 mt-md-0">
              <div className="form-check form-switch mt-4">
                <Input
                  type="checkbox"
                  className="form-check-input"
                  id="questionsLaterSwitch"
                  checked={validation.values.questionsLater}
                  onChange={(e) =>
                    validation.setFieldValue("questionsLater", e.target.checked)
                  }
                  disabled={isViewOnly}
                />
                <Label
                  className="form-check-label fw-bold"
                  htmlFor="questionsLaterSwitch"
                >
                  Show Questions Later
                </Label>
              </div>
            </Col>
          </Row>
        )}

        {/* --- IMAGE UPLOAD UI --- */}
        {isImage && (
          <Row>
            <Col md={12}>
              <Label className="fw-bold">Upload Image File</Label>
              <div className="d-flex align-items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "image")}
                  disabled={isViewOnly || uploadingImage}
                />
                {uploadingImage && <Spinner size="sm" color="primary" />}
              </div>

              {/* Clean Image Preview (No URL Text Box) */}
              {validation.values.imageUrl && (
                <div className="mt-3 p-2 bg-white border rounded d-inline-block">
                  <div className="d-flex align-items-center">
                    <img
                      src={validation.values.imageUrl}
                      alt="preview"
                      style={{
                        height: "40px",
                        width: "40px",
                        borderRadius: "4px",
                        objectFit: "cover",
                      }}
                    />
                    <small className="ms-2 text-success fw-bold">
                      <i className="mdi mdi-check-circle"></i> Uploaded
                    </small>
                  </div>
                </div>
              )}
            </Col>
          </Row>
        )}
      </div>

      <hr />

      {/* Questions Section */}
      <Label className="fw-bold text-primary mb-3">Questions</Label>
      <FieldArray name="questions">
        {({ push, remove }) => (
          <>
            {validation.values.questions.map((_, index) => (
              <div
                key={index}
                className="p-3 mb-3 border rounded bg-white shadow-sm"
              >
                <div className="d-flex justify-content-between mb-2">
                  <h6 className="m-0 text-primary">Question {index + 1}</h6>
                  {!isViewOnly && (
                    <Button
                      color="danger"
                      size="sm"
                      outline
                      onClick={() => remove(index)}
                    >
                      <i className="mdi mdi-delete"></i>
                    </Button>
                  )}
                </div>

                {/* Reusing your existing MCQ component for the question/options! */}
                <MCQSection index={index} validation={validation} />
              </div>
            ))}

            {!isViewOnly && (
              <Button
                color="success"
                onClick={() =>
                  push({
                    question: "",
                    answers: ["", "", "", ""],
                    correct_answer: "0",
                  })
                }
              >
                + Add Question
              </Button>
            )}
          </>
        )}
      </FieldArray>
    </>
  );
};

export default InformationProcessingSection;

// import React, { useState } from 'react';
// import { Row, Col, Input, Label, Button, Spinner } from 'reactstrap';
// import { FieldArray } from 'formik';
// import MCQSection from './MCQSection';
// import Swal from 'sweetalert2';

// const InformationProcessingSection = ({ validation, isViewOnly }) => {
//   const isAudio = validation.values.type === 'audio';
//   const isImage = validation.values.type === 'image';

//   // Loading states for file uploads
//   const [uploadingAudio, setUploadingAudio] = useState(false);
//   const [uploadingImage, setUploadingImage] = useState(false);

//   // File Upload Handler for ORDS endpoint
//   const handleFileUpload = async (event, mediaType) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     // ⚠️ CRITICAL: Replace this with your exact Oracle ORDS backend domain and port!
//     const BACKEND_BASE_URL = 'http://localhost:8080/ords';
//     const UPLOAD_ENDPOINT = `${BACKEND_BASE_URL}/lms/media/upload`;

//     try {
//       if (mediaType === 'audio') setUploadingAudio(true);
//       if (mediaType === 'image') setUploadingImage(true);

//       // Send the request to your Oracle Backend, NOT localhost:3000
//       const response = await fetch(UPLOAD_ENDPOINT, {
//         method: 'POST',
//         headers: {
//           'Content-Type': file.type || 'application/octet-stream',
//           file_name: file.name,
//         },
//         body: file,
//       });

//       // 1. Read as text first to catch HTML error pages instead of crashing
//       const textResult = await response.text();
//       let result;

//       try {
//         result = JSON.parse(textResult);
//       } catch (parseError) {
//         console.error(
//           'Backend did not return JSON. Here is the HTML it returned:',
//           textResult
//         );
//         throw new Error(
//           'Server returned an invalid response. Check your BACKEND_BASE_URL.'
//         );
//       }

//       // 2. Handle the successful JSON response
//       if (result && result.status === 'success') {
//         // This generates the FULL URL: http://localhost:8080/ords/lms/media/file-xxx
//         const fullSavedPath = `${BACKEND_BASE_URL}${result.url}`;

//         // Update Formik state based on whether it is an Audio or Image activity
//         if (mediaType === 'audio') {
//           validation.setFieldValue('audioUrl', fullSavedPath);
//         } else if (mediaType === 'image') {
//           validation.setFieldValue('imageUrl', fullSavedPath);
//         }

//         // Silent auto-closing success popup
//         Swal.fire({
//           title: 'Success',
//           text: 'File uploaded successfully!',
//           icon: 'success',
//           timer: 1500,
//           showConfirmButton: false,
//         });
//       } else {
//         Swal.fire('Error', result.message || 'Failed to upload.', 'error');
//       }
//     } catch (error) {
//       console.error('Upload Error:', error);
//       Swal.fire(
//         'Error',
//         error.message || 'An error occurred during upload.',
//         'error'
//       );
//     } finally {
//       // Turn off loaders and reset file input
//       if (mediaType === 'audio') setUploadingAudio(false);
//       if (mediaType === 'image') setUploadingImage(false);
//       event.target.value = null;
//     }
//   };

//   return (
//     <>
//       {/* Media Configuration Section */}
//       <div className="p-3 border rounded bg-light mb-4 border-info">
//         <h5 className="text-info mb-3">
//           <i
//             className={`mdi ${isAudio ? 'mdi-music-note' : 'mdi-image'} me-2`}
//           ></i>
//           {isAudio ? 'Audio Setup' : 'Image Setup'}
//         </h5>

//         {/* --- AUDIO UPLOAD UI --- */}
//         {isAudio && (
//           <Row>
//             <Col md={8}>
//               <Label className="fw-bold">Upload Audio File</Label>
//               <div className="d-flex align-items-center gap-2">
//                 <Input
//                   type="file"
//                   accept="audio/*"
//                   onChange={(e) => handleFileUpload(e, 'audio')}
//                   disabled={isViewOnly || uploadingAudio}
//                 />
//                 {uploadingAudio && <Spinner size="sm" color="primary" />}
//               </div>

//               {/* Clean Audio Preview (No URL Text Box) */}
//               {validation.values.audioUrl && (
//                 <div className="mt-3 p-2 bg-white border rounded d-inline-block">
//                   <div className="d-flex align-items-center mb-2">
//                     <i className="mdi mdi-check-circle text-success fs-5 me-2"></i>
//                     <span className="text-success fw-bold small">
//                       Audio Uploaded
//                     </span>
//                   </div>
//                   <audio
//                     src={validation.values.audioUrl}
//                     controls
//                     style={{ height: '35px' }}
//                   />
//                 </div>
//               )}
//             </Col>

//             <Col md={4} className="d-flex align-items-center mt-3 mt-md-0">
//               <div className="form-check form-switch mt-4">
//                 <Input
//                   type="checkbox"
//                   className="form-check-input"
//                   id="questionsLaterSwitch"
//                   checked={validation.values.questionsLater}
//                   onChange={(e) =>
//                     validation.setFieldValue('questionsLater', e.target.checked)
//                   }
//                   disabled={isViewOnly}
//                 />
//                 <Label
//                   className="form-check-label fw-bold"
//                   htmlFor="questionsLaterSwitch"
//                 >
//                   Show Questions Later
//                 </Label>
//               </div>
//             </Col>
//           </Row>
//         )}

//         {/* --- IMAGE UPLOAD UI --- */}
//         {isImage && (
//           <Row>
//             <Col md={12}>
//               <Label className="fw-bold">Upload Image File</Label>
//               <div className="d-flex align-items-center gap-2">
//                 <Input
//                   type="file"
//                   accept="image/*"
//                   onChange={(e) => handleFileUpload(e, 'image')}
//                   disabled={isViewOnly || uploadingImage}
//                 />
//                 {uploadingImage && <Spinner size="sm" color="primary" />}
//               </div>

//               {/* Clean Image Preview (No URL Text Box) */}
//               {validation.values.imageUrl && (
//                 <div className="mt-3 p-2 bg-white border rounded d-inline-block">
//                   <div className="d-flex align-items-center">
//                     <img
//                       src={validation.values.imageUrl}
//                       alt="preview"
//                       style={{
//                         height: '40px',
//                         width: '40px',
//                         borderRadius: '4px',
//                         objectFit: 'cover',
//                       }}
//                     />
//                     <small className="ms-2 text-success fw-bold">
//                       <i className="mdi mdi-check-circle"></i> Uploaded
//                     </small>
//                   </div>
//                 </div>
//               )}
//             </Col>
//           </Row>
//         )}
//       </div>

//       <hr />

//       {/* Questions Section */}
//       <Label className="fw-bold text-primary mb-3">Questions</Label>
//       <FieldArray name="questions">
//         {({ push, remove }) => (
//           <>
//             {validation.values.questions.map((_, index) => (
//               <div
//                 key={index}
//                 className="p-3 mb-3 border rounded bg-white shadow-sm"
//               >
//                 <div className="d-flex justify-content-between mb-2">
//                   <h6 className="m-0 text-primary">Question {index + 1}</h6>
//                   {!isViewOnly && (
//                     <Button
//                       color="danger"
//                       size="sm"
//                       outline
//                       onClick={() => remove(index)}
//                     >
//                       <i className="mdi mdi-delete"></i>
//                     </Button>
//                   )}
//                 </div>

//                 {/* Reusing your existing MCQ component for the question/options! */}
//                 <MCQSection index={index} validation={validation} />
//               </div>
//             ))}

//             {!isViewOnly && (
//               <Button
//                 color="success"
//                 onClick={() =>
//                   push({
//                     question: '',
//                     answers: ['', '', '', ''],
//                     correct_answer: '0',
//                   })
//                 }
//               >
//                 + Add Question
//               </Button>
//             )}
//           </>
//         )}
//       </FieldArray>
//     </>
//   );
// };

// export default InformationProcessingSection;
