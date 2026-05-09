import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Label,
  Input,
  FormFeedback,
  Form,
} from "reactstrap";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";

// Import Breadcrumb
import Breadcrumb from "../../components/Common/Breadcrumb";
import avatar from "../../assets/images/users/avatar-1.jpg";

// IMPORT DYNAMIC HELPERS
import { post, API_URL } from "../../helpers/api_helper";
import { GET_PROFILE_IMAGE, POST_USER_PROFILE } from "../../helpers/url_helper";

const UserProfile = () => {
  document.title = "Profile | LMS Dashboard";

  const fileInputRef = useRef(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [imgBase64, setImgBase64] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");
  const [success, setSuccess] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const authUser = JSON.parse(localStorage.getItem("authUser") || "{}");
    if (authUser.email) {
      setName(authUser.name || "");
      setEmail(authUser.email || "");
      setMobile(authUser.mobile || "");
      if (!authUser.profile_image) {
        const apiImageUrl = `${API_URL}${GET_PROFILE_IMAGE}?email=${authUser.email}`;
        setImgBase64(apiImageUrl);
      } else {
        setImgBase64(authUser.profile_image);
      }
      setOriginalEmail(authUser.email || "");
    }
  }, []);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        setErrorMsg("Image size should be less than 1MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImgBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      username: name || "",
      useremail: email || "",
      usermobile: mobile || "",
      password: "", // New Field
    },
    validationSchema: Yup.object({
      username: Yup.string().required("Please Enter Your User Name"),
      useremail: Yup.string()
        .email("Invalid email format")
        .required("Please Enter Your Email"),
      usermobile: Yup.string()
        .matches(/^[0-9]+$/, "Mobile number must contain only digits")
        .min(10, "Minimum 10 digits required")
        .required("Please Enter Your Mobile Number"),
      password: Yup.string().min(6, "Password must be at least 6 characters"),
    }),

    onSubmit: async (values) => {
      try {
        setLoading(true);
        const payload = {
          old_email: originalEmail,
          name: values.username,
          new_email: values.useremail,
          mobile: values.usermobile,
          profile_image: imgBase64,
          password: values.password, // Included in payload
        };

        const data = await post(POST_USER_PROFILE, payload);

        if (data.status === "SUCCESS") {
          const authData = JSON.parse(localStorage.getItem("authUser") || "{}");
          const updatedUser = {
            ...authData,
            name: values.username,
            email: values.useremail,
            mobile: values.usermobile,
            profile_image: imgBase64,
          };
          localStorage.setItem("authUser", JSON.stringify(updatedUser));
          window.dispatchEvent(new Event("profileUpdated"));
          setSuccess("Profile updated successfully");
        }
      } catch (error) {
        setErrorMsg("Server error updating profile.");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Konzeptes" breadcrumbItem="Profile" />

          {success && (
            <div className="alert alert-success text-center">{success}</div>
          )}
          {errorMsg && (
            <div className="alert alert-danger text-center">{errorMsg}</div>
          )}

          <Row className="justify-content-center">
            <Col lg={10}>
              <Card className="shadow-sm border-0 overflow-hidden">
                <CardBody className="p-0">
                  <Row className="g-0">
                    {/* LEFT SECTION: GREEN BACKGROUND (Unchanged) */}
                    <Col
                      md={4}
                      className="text-white text-center p-5 d-flex flex-column justify-content-center align-items-center"
                      style={{ backgroundColor: "#2e7d32" }}
                    >
                      <div
                        className="mb-3 position-relative rounded-circle shadow"
                        onClick={handleImageClick}
                        style={{
                          cursor: "pointer",
                          width: "120px",
                          height: "120px",
                          border: "3px solid white",
                          padding: "2px",
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={imgBase64 || avatar}
                          alt="profile"
                          className="rounded-circle"
                          style={{
                            objectFit: "cover",
                            width: "100%",
                            height: "100%",
                          }}
                        />
                        <div
                          className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center rounded-circle"
                          style={{
                            backgroundColor: "rgba(0, 0, 0, 0.6)",
                            opacity: 0,
                            transition: "opacity 0.3s ease",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.opacity = "1")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.opacity = "0")
                          }
                        >
                          <i className="mdi mdi-camera text-white font-size-20 mb-1"></i>
                          <span className="text-white font-size-10 fw-bold">
                            UPLOAD IMAGE
                          </span>
                        </div>
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                        style={{ display: "none" }}
                      />
                      <h5 className="text-white mb-1">{name}</h5>
                      <p className="text-white-50 small mb-0">
                        LMS Administrator
                      </p>
                    </Col>

                    {/* RIGHT SECTION: EDIT FIELDS ONLY */}
                    <Col md={8} className="p-4 bg-white">
                      <h5 className="card-title mb-4">
                        Edit Profile Information
                      </h5>
                      <Form
                        onSubmit={(e) => {
                          e.preventDefault();
                          validation.handleSubmit();
                        }}
                      >
                        <Row>
                          <Col md={6}>
                            <div className="mb-3">
                              <Label className="form-label font-size-12">
                                Admin Name
                              </Label>
                              <Input
                                name="username"
                                type="text"
                                className="bg-light border-0"
                                onChange={validation.handleChange}
                                value={validation.values.username}
                                invalid={
                                  validation.touched.username &&
                                  !!validation.errors.username
                                }
                              />
                              <FormFeedback>
                                {validation.errors.username}
                              </FormFeedback>
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="mb-3">
                              <Label className="form-label font-size-12">
                                Email Address
                              </Label>
                              <Input
                                name="useremail"
                                type="email"
                                className="bg-light border-0"
                                onChange={validation.handleChange}
                                value={validation.values.useremail}
                                invalid={
                                  validation.touched.useremail &&
                                  !!validation.errors.useremail
                                }
                              />
                              <FormFeedback>
                                {validation.errors.useremail}
                              </FormFeedback>
                            </div>
                          </Col>
                        </Row>

                        <Row>
                          <Col md={6}>
                            <div className="mb-3">
                              <Label className="form-label font-size-12">
                                Mobile Number
                              </Label>
                              <Input
                                name="usermobile"
                                type="text"
                                className="bg-light border-0"
                                onChange={validation.handleChange}
                                value={validation.values.usermobile}
                                invalid={
                                  validation.touched.usermobile &&
                                  !!validation.errors.usermobile
                                }
                              />
                              <FormFeedback>
                                {validation.errors.usermobile}
                              </FormFeedback>
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="mb-3">
                              <Label className="form-label font-size-12">
                                Password
                              </Label>
                              <Input
                                name="password"
                                type="password"
                                placeholder="Enter new password"
                                className="bg-light border-0"
                                onChange={validation.handleChange}
                                value={validation.values.password}
                                invalid={
                                  validation.touched.password &&
                                  !!validation.errors.password
                                }
                              />
                              <FormFeedback>
                                {validation.errors.password}
                              </FormFeedback>
                            </div>
                          </Col>
                        </Row>

                        <div className="mb-3">
                          <Label className="form-label font-size-12">
                            Designation
                          </Label>
                          <Input
                            type="text"
                            defaultValue="LMS Administrator"
                            readOnly
                            className="bg-soft-light border-0 text-muted"
                            style={{ cursor: "not-allowed" }}
                          />
                        </div>

                        <div className="text-end mt-4">
                          <Button
                            type="submit"
                            color="success"
                            disabled={loading}
                            className="px-4 py-2 shadow-sm"
                            style={{
                              backgroundColor: "#2e7d32",
                              border: "none",
                            }}
                          >
                            {loading ? "Updating..." : "Update Profile"}
                          </Button>
                        </div>
                      </Form>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default UserProfile;

// import React, { useState, useEffect, useRef } from "react"; // Added useRef
// import {
//   Container,
//   Row,
//   Col,
//   Card,
//   CardBody,
//   Button,
//   Label,
//   Input,
//   FormFeedback,
//   Form,
// } from "reactstrap";

// // Formik Validation
// import * as Yup from "yup";
// import { useFormik } from "formik";

// // Import Breadcrumb
// import Breadcrumb from "../../components/Common/Breadcrumb";
// import avatar from "../../assets/images/users/avatar-1.jpg";

// // IMPORT DYNAMIC HELPERS
// import { post, API_URL } from "../../helpers/api_helper";
// import { GET_PROFILE_IMAGE, POST_USER_PROFILE } from "../../helpers/url_helper";

// const UserProfile = () => {
//   document.title = "Profile | LMS Dashboard";

//   const fileInputRef = useRef(null); // ✅ Ref for hidden file input

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [mobile, setMobile] = useState("");
//   const [imgBase64, setImgBase64] = useState("");
//   const [originalEmail, setOriginalEmail] = useState("");
//   const [success, setSuccess] = useState("");
//   const [errorMsg, setErrorMsg] = useState("");
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const authUser = JSON.parse(localStorage.getItem("authUser") || "{}");
//     if (authUser.email) {
//       setName(authUser.name || "");
//       setEmail(authUser.email || "");
//       setMobile(authUser.mobile || "");
//       if (!authUser.profile_image) {
//         const apiImageUrl = `${API_URL}${GET_PROFILE_IMAGE}?email=${authUser.email}`;
//         setImgBase64(apiImageUrl);
//       } else {
//         setImgBase64(authUser.profile_image);
//       }
//       setOriginalEmail(authUser.email || "");
//     }
//   }, []);

//   useEffect(() => {
//     if (success || errorMsg) {
//       const timer = setTimeout(() => {
//         setSuccess("");
//         setErrorMsg("");
//       }, 5000);
//       return () => clearTimeout(timer);
//     }
//   }, [success, errorMsg]);

//   // ✅ Trigger hidden file input click
//   const handleImageClick = () => {
//     fileInputRef.current.click();
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       if (file.size > 1024 * 1024) {
//         setErrorMsg("Image size should be less than 1MB");
//         return;
//       }
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setImgBase64(reader.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const validation = useFormik({
//     enableReinitialize: true,
//     initialValues: {
//       username: name || "",
//       useremail: email || "",
//       usermobile: mobile || "",
//     },
//     validationSchema: Yup.object({
//       username: Yup.string().required("Please Enter Your User Name"),
//       useremail: Yup.string()
//         .email("Invalid email format")
//         .required("Please Enter Your Email"),
//       usermobile: Yup.string()
//         .matches(/^[0-9]+$/, "Mobile number must contain only digits")
//         .min(10, "Minimum 10 digits required")
//         .required("Please Enter Your Mobile Number"),
//     }),

//     onSubmit: async (values) => {
//       const authUser = JSON.parse(localStorage.getItem("authUser") || "{}");
//       if (
//         values.username === name &&
//         values.useremail === email &&
//         values.usermobile === mobile &&
//         imgBase64 === authUser.profile_image
//       ) {
//         setErrorMsg("No changes detected.");
//         return;
//       }

//       try {
//         setLoading(true);
//         const payload = {
//           old_email: originalEmail,
//           name: values.username,
//           new_email: values.useremail,
//           mobile: values.usermobile,
//           profile_image: imgBase64,
//         };

//         const data = await post(POST_USER_PROFILE, payload);

//         if (data.status === "SUCCESS") {
//           const authData = JSON.parse(localStorage.getItem("authUser") || "{}");
//           const updatedUser = {
//             ...authData,
//             name: values.username,
//             email: values.useremail,
//             mobile: values.usermobile,
//             profile_image: imgBase64,
//           };
//           localStorage.setItem("authUser", JSON.stringify(updatedUser));
//           window.dispatchEvent(new Event("profileUpdated"));
//           setSuccess("Profile updated successfully");
//         }
//       } catch (error) {
//         setErrorMsg("Server error updating profile.");
//       } finally {
//         setLoading(false);
//       }
//     },
//   });

//   return (
//     <React.Fragment>
//       <div className="page-content">
//         <Container fluid>
//           <Breadcrumb title="Konzeptes" breadcrumbItem="Profile" />

//           {success && (
//             <div className="alert alert-success text-center">{success}</div>
//           )}
//           {errorMsg && (
//             <div className="alert alert-danger text-center">{errorMsg}</div>
//           )}

//           <Row>
//             <Col lg={6}>
//               <Card className="h-100 overflow-hidden shadow-sm border-0">
//                 <CardBody className="p-0">
//                   <Row className="g-0 h-100">
//                     {/* <Col
//                       md={5}
//                       className="text-white text-center p-4 d-flex flex-column justify-content-center align-items-center"
//                       style={{ backgroundColor: "#2e7d32" }}
//                     >

//                       <div
//                         className="mb-3 position-relative overflow-hidden rounded-circle shadow"
//                         onClick={handleImageClick}
//                         style={{
//                           cursor: "pointer",
//                           width: "100px",
//                           height: "100px",
//                         }}
//                       >
//                         <img
//                           src={imgBase64 || avatar}
//                           alt="profile"
//                           style={{
//                             objectFit: "cover",
//                             width: "100%",
//                             height: "100%",
//                           }}
//                         />

//                         <div
//                           className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50 opacity-0 hover-opacity-100 transition-all"
//                           style={{ transition: "0.3s" }}
//                           onMouseEnter={(e) =>
//                             (e.currentTarget.style.opacity = "1")
//                           }
//                           onMouseLeave={(e) =>
//                             (e.currentTarget.style.opacity = "0")
//                           }
//                         >
//                           <i className="mdi mdi-camera text-white font-size-20"></i>
//                         </div>
//                       </div>

//                       <input
//                         type="file"
//                         ref={fileInputRef}
//                         onChange={handleImageChange}
//                         accept="image/*"
//                         style={{ display: "none" }}
//                       />

//                       <h5 className="text-white mb-1">{name}</h5>
//                       <p className="text-white-50 small mb-0">
//                         LMS Administrator
//                       </p>
//                     </Col> */}

//                     <Col
//                       md={5}
//                       className="text-white text-center p-4 d-flex flex-column justify-content-center align-items-center"
//                       style={{ backgroundColor: "#2e7d32" }}
//                     >
//                       {/* ✅ HOVER & CLICK CONTAINER */}
//                       <div
//                         className="mb-3 position-relative rounded-circle shadow"
//                         onClick={handleImageClick}
//                         style={{
//                           cursor: "pointer",
//                           width: "110px", // Slightly larger to accommodate the border
//                           height: "110px",
//                           border: "3px solid white", // ✅ White border added here
//                           padding: "2px",
//                           overflow: "hidden",
//                         }}
//                       >
//                         <img
//                           src={imgBase64 || avatar}
//                           alt="profile"
//                           className="rounded-circle"
//                           style={{
//                             objectFit: "cover",
//                             width: "100%",
//                             height: "100%",
//                           }}
//                         />

//                         {/* ✅ HINT OVERLAY: Appears on hover */}
//                         <div
//                           className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center rounded-circle"
//                           style={{
//                             backgroundColor: "rgba(0, 0, 0, 0.6)",
//                             opacity: 0,
//                             transition: "opacity 0.3s ease",
//                           }}
//                           onMouseEnter={(e) =>
//                             (e.currentTarget.style.opacity = "1")
//                           }
//                           onMouseLeave={(e) =>
//                             (e.currentTarget.style.opacity = "0")
//                           }
//                         >
//                           <i className="mdi mdi-camera text-white font-size-20 mb-1"></i>
//                           <span
//                             className="text-white font-size-10 fw-bold"
//                             style={{ lineHeight: "1" }}
//                           >
//                             UPLOAD
//                             <br />
//                             IMAGE
//                           </span>
//                         </div>
//                       </div>

//                       {/* ✅ HIDDEN FILE INPUT (Remains the same) */}
//                       <input
//                         type="file"
//                         ref={fileInputRef}
//                         onChange={handleImageChange}
//                         accept="image/*"
//                         style={{ display: "none" }}
//                       />

//                       {/* <h5 className="text-white mb-1">{name}</h5>
//                       <p className="text-white-50 small mb-0">
//                         LMS Administrator
//                       </p> */}
//                       <h5 className="text-white mb-1">{name}</h5>
//                       <p className="text-white-50 small mb-0">
//                         LMS Administrator
//                       </p>
//                     </Col>
//                     {/* <Col md={7} className="p-4 bg-white">
//                       <h5 className="card-title mb-0">Basic Information</h5>
//                       <hr className="my-3" />
//                       <div className="profile-info-list">
//                         <div className="mb-3">
//                           <p className="text-muted mb-1 font-size-12 fw-bold text-uppercase">
//                             Email Address
//                           </p>
//                           <h6 className="font-size-14 text-dark mb-0">
//                             {email}
//                           </h6>
//                         </div>
//                         <div className="mb-3">
//                           <p className="text-muted mb-1 font-size-12 fw-bold text-uppercase">
//                             Phone Number
//                           </p>
//                           <h6 className="font-size-14 text-dark mb-0">
//                             {mobile || "N/A"}
//                           </h6>
//                           <div className="mb-3">
//                             <p className="text-muted mb-1 font-size-12 fw-bold text-uppercase">
//                               Designation
//                             </p>
//                             <h6 className="font-size-14 text-dark mb-0">
//                               LMS Administrator
//                             </h6>
//                           </div>
//                         </div>
//                       </div>
//                     </Col> */}
//                     <Col md={7} className="p-4 bg-white">
//                       <h5 className="card-title mb-0">Basic Information</h5>
//                       <hr className="my-3" />

//                       <div className="profile-info-list">
//                         <div className="mb-3">
//                           <p className="text-muted mb-1 font-size-12 fw-bold text-uppercase">
//                             <i className="mdi mdi-email-outline me-1"></i> Email
//                             Address
//                           </p>
//                           <h6 className="font-size-14 text-dark mb-0">
//                             {email}
//                           </h6>
//                         </div>

//                         <div className="mb-3">
//                           <p className="text-muted mb-1 font-size-12 fw-bold text-uppercase">
//                             <i className="mdi mdi-phone-outline me-1"></i> Phone
//                             Number
//                           </p>
//                           <h6 className="font-size-14 text-dark mb-0">
//                             {mobile || "N/A"}
//                           </h6>
//                         </div>

//                         <div className="mb-3">
//                           <p className="text-muted mb-1 font-size-12 fw-bold text-uppercase">
//                             <i className="mdi mdi-account-star-outline me-1"></i>{" "}
//                             Designation
//                           </p>
//                           <h6 className="font-size-14 text-dark mb-0">
//                             LMS Administrator
//                           </h6>
//                         </div>

//                         <div className="mb-0"></div>
//                       </div>
//                     </Col>
//                   </Row>
//                 </CardBody>
//               </Card>
//             </Col>

//             <Col lg={6}>
//               <Card className="h-100 shadow-sm border-0">
//                 <CardBody>
//                   <h5 className="card-title mb-4">Edit Profile Information</h5>
//                   <Form
//                     onSubmit={(e) => {
//                       e.preventDefault();
//                       validation.handleSubmit();
//                     }}
//                   >
//                     <div className="mb-3">
//                       <Label className="form-label font-size-12">
//                         Admin Name
//                       </Label>
//                       <Input
//                         name="username"
//                         type="text"
//                         className="bg-light border-0"
//                         onChange={validation.handleChange}
//                         value={validation.values.username}
//                         invalid={
//                           validation.touched.username &&
//                           !!validation.errors.username
//                         }
//                       />
//                       <FormFeedback>{validation.errors.username}</FormFeedback>
//                     </div>

//                     <div className="mb-3">
//                       <Label className="form-label font-size-12">
//                         Email Address
//                       </Label>
//                       <Input
//                         name="useremail"
//                         type="email"
//                         className="bg-light border-0"
//                         onChange={validation.handleChange}
//                         value={validation.values.useremail}
//                         invalid={
//                           validation.touched.useremail &&
//                           !!validation.errors.useremail
//                         }
//                       />
//                       <FormFeedback>{validation.errors.useremail}</FormFeedback>
//                     </div>

//                     <div className="mb-3">
//                       <Label className="form-label font-size-12">
//                         Mobile Number
//                       </Label>
//                       <Input
//                         name="usermobile"
//                         type="text"
//                         className="bg-light border-0"
//                         onChange={validation.handleChange}
//                         value={validation.values.usermobile}
//                         invalid={
//                           validation.touched.usermobile &&
//                           !!validation.errors.usermobile
//                         }
//                       />
//                       <FormFeedback>
//                         {validation.errors.usermobile}
//                       </FormFeedback>
//                     </div>

//                     <div className="text-center mt-4">
//                       <Button
//                         type="submit"
//                         color="success"
//                         disabled={loading}
//                         className="w-30 py-2 shadow-sm"
//                         style={{ backgroundColor: "#2e7d32", border: "none" }}
//                       >
//                         {loading ? "Updating..." : "Update Profile"}
//                       </Button>
//                     </div>
//                   </Form>
//                 </CardBody>
//               </Card>
//             </Col>
//           </Row>
//         </Container>
//       </div>
//     </React.Fragment>
//   );
// };

// export default UserProfile;
