import React, { useState } from "react";
import {
  Row,
  Col,
  Input,
  Label,
  Button,
  Card,
  CardBody,
  Spinner,
} from "reactstrap";
import { FieldArray } from "formik";
import Swal from "sweetalert2";

// Import your URL constants
import { API_URL } from "../../helpers/api_helper";
// import { ORDS_BASE_URL, UPLOAD_MEDIA } from "../../helpers/url_helper";
import {  UPLOAD_MEDIA } from "../../helpers/url_helper";

const DragAndDropSection = ({ validation }) => {
  const [uploadingIndex, setUploadingIndex] = useState(null);

  const handleFileUpload = async (event, index) => {
    const file = event.target.files[0];
    if (!file) return;

    // Use the imported constants
    // const UPLOAD_ENDPOINT = `${ORDS_BASE_URL}${UPLOAD_MEDIA}`;
    const UPLOAD_ENDPOINT = `${API_URL}${UPLOAD_MEDIA}`;

    try {
      setUploadingIndex(index);

      // Send the raw file to your Oracle Backend
      const response = await fetch(UPLOAD_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
          file_name: file.name,
        },
        body: file,
      });

      const textResult = await response.text();
      let result;

      try {
        result = JSON.parse(textResult);
      } catch (parseError) {
        console.error("Backend did not return JSON:", textResult);
        throw new Error("Server returned an invalid response.");
      }

      if (result && result.status === "success") {
        // const fullSavedPath = `${ORDS_BASE_URL}${result.url}`;
         const fullSavedPath = `${API_URL}${result.url}`;

        // 1. Saves the URL in the background silently
        validation.setFieldValue(`dragDropItems.${index}.src`, fullSavedPath);

        // 2. Shows only the success popup
        Swal.fire({
          title: "Success",
          text: "Image uploaded successfully!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire("Error", result.message || "Failed to upload.", "error");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      Swal.fire(
        "Error",
        error.message || "An error occurred during upload.",
        "error",
      );
    } finally {
      setUploadingIndex(null);
      event.target.value = null;
    }
  };

  return (
    <>
      <Label className="fw-bold text-primary mb-3">
        Match Image to Word (Drag & Drop)
      </Label>

      <FieldArray
        name="dragDropItems"
        render={(arrayHelpers) => (
          <>
            {validation.values.dragDropItems.map((item, index) => (
              <Card key={index} className="mb-3 border bg-light shadow-none">
                <CardBody className="p-3">
                  <Row className="align-items-center">
                    <Col md={5}>
                      <Label>Upload Image</Label>
                      <div className="d-flex align-items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, index)}
                          disabled={uploadingIndex === index}
                        />
                        {uploadingIndex === index && (
                          <Spinner size="sm" color="primary" />
                        )}
                      </div>

                      {/* Image Preview ONLY (URL Input Removed) */}
                      {item.src && (
                        <div className="mt-2 p-2 bg-white border rounded d-inline-block">
                          <div className="d-flex align-items-center">
                            <img
                              src={item.src}
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

                    <Col md={5}>
                      <Label>Target Word (Answer)</Label>
                      <Input
                        type="text"
                        placeholder="e.g. ठंडी"
                        {...validation.getFieldProps(
                          `dragDropItems.${index}.word`,
                        )}
                      />
                    </Col>

                    <Col md={2} className="text-end mt-4">
                      <Button
                        color="danger"
                        outline
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
              size="sm"
              onClick={() => arrayHelpers.push({ src: "", word: "" })}
            >
              + Add New Item
            </Button>
          </>
        )}
      />
    </>
  );
};

export default DragAndDropSection;


// import React, { useState } from 'react';
// import {
//   Row,
//   Col,
//   Input,
//   Label,
//   Button,
//   Card,
//   CardBody,
//   Spinner,
// } from 'reactstrap';
// import { FieldArray } from 'formik';
// import Swal from 'sweetalert2';

// const DragAndDropSection = ({ validation }) => {
//   const [uploadingIndex, setUploadingIndex] = useState(null);

//   const handleFileUpload = async (event, index) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     // ⚠️ CRITICAL: Match your exact Oracle ORDS backend domain and port
//     const BACKEND_BASE_URL = 'http://localhost:8080/ords';
//     const UPLOAD_ENDPOINT = `${BACKEND_BASE_URL}/lms/media/upload`;

//     try {
//       setUploadingIndex(index);

//       // Send the raw file to your Oracle Backend
//       const response = await fetch(UPLOAD_ENDPOINT, {
//         method: 'POST',
//         headers: {
//           'Content-Type': file.type || 'application/octet-stream',
//           file_name: file.name,
//         },
//         body: file,
//       });

//       const textResult = await response.text();
//       let result;

//       try {
//         result = JSON.parse(textResult);
//       } catch (parseError) {
//         console.error('Backend did not return JSON:', textResult);
//         throw new Error('Server returned an invalid response.');
//       }

//       if (result && result.status === 'success') {
//         const fullSavedPath = `${BACKEND_BASE_URL}${result.url}`;

//         // 1. Saves the URL in the background silently
//         validation.setFieldValue(`dragDropItems.${index}.src`, fullSavedPath);

//         // 2. Shows only the success popup
//         Swal.fire({
//           title: 'Success',
//           text: 'Image uploaded successfully!',
//           icon: 'success',
//           timer: 1500,
//           showConfirmButton: false,
//         });
//       } else {
//         Swal.fire('Error', result.message || 'Failed to upload.', 'error');
//       }
//     } catch (error) {
//       console.error('Upload failed:', error);
//       Swal.fire(
//         'Error',
//         error.message || 'An error occurred during upload.',
//         'error'
//       );
//     } finally {
//       setUploadingIndex(null);
//       event.target.value = null;
//     }
//   };

//   return (
//     <>
//       <Label className="fw-bold text-primary mb-3">
//         Match Image to Word (Drag & Drop)
//       </Label>

//       <FieldArray
//         name="dragDropItems"
//         render={(arrayHelpers) => (
//           <>
//             {validation.values.dragDropItems.map((item, index) => (
//               <Card key={index} className="mb-3 border bg-light shadow-none">
//                 <CardBody className="p-3">
//                   <Row className="align-items-center">
//                     <Col md={5}>
//                       <Label>Upload Image</Label>
//                       <div className="d-flex align-items-center gap-2">
//                         <Input
//                           type="file"
//                           accept="image/*"
//                           onChange={(e) => handleFileUpload(e, index)}
//                           disabled={uploadingIndex === index}
//                         />
//                         {uploadingIndex === index && (
//                           <Spinner size="sm" color="primary" />
//                         )}
//                       </div>

//                       {/* Image Preview ONLY (URL Input Removed) */}
//                       {item.src && (
//                         <div className="mt-2 p-2 bg-white border rounded d-inline-block">
//                           <div className="d-flex align-items-center">
//                             <img
//                               src={item.src}
//                               alt="preview"
//                               style={{
//                                 height: '40px',
//                                 width: '40px',
//                                 borderRadius: '4px',
//                                 objectFit: 'cover',
//                               }}
//                             />
//                             <small className="ms-2 text-success fw-bold">
//                               <i className="mdi mdi-check-circle"></i> Uploaded
//                             </small>
//                           </div>
//                         </div>
//                       )}
//                     </Col>

//                     <Col md={5}>
//                       <Label>Target Word (Answer)</Label>
//                       <Input
//                         type="text"
//                         placeholder="e.g. ठंडी"
//                         {...validation.getFieldProps(
//                           `dragDropItems.${index}.word`
//                         )}
//                       />
//                     </Col>

//                     <Col md={2} className="text-end mt-4">
//                       <Button
//                         color="danger"
//                         outline
//                         onClick={() => arrayHelpers.remove(index)}
//                       >
//                         <i className="mdi mdi-delete"></i>
//                       </Button>
//                     </Col>
//                   </Row>
//                 </CardBody>
//               </Card>
//             ))}
//             <Button
//               color="success"
//               size="sm"
//               onClick={() => arrayHelpers.push({ src: '', word: '' })}
//             >
//               + Add New Item
//             </Button>
//           </>
//         )}
//       />
//     </>
//   );
// };

// export default DragAndDropSection;
