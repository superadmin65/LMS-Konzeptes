import React, { useState, useEffect } from "react";
import { Row, Col, Card, CardBody } from "reactstrap";
import { Link } from "react-router-dom";
import { API_URL } from "../../helpers/api_helper";
import { GET_PROFILE_IMAGE } from "../../helpers/url_helper";
import avatar1 from "../../assets/images/users/avatar-1.jpg";
import profileImg from "../../assets/images/profile-img.png";

const WelcomeComp = () => {
  const [userData, setUserData] = useState({});
  // 🔹 Read logged-in user from localStorage
  const authUser = JSON.parse(localStorage.getItem("authUser") || "{}");

  const loadData = () => {
    const data = JSON.parse(localStorage.getItem("authUser") || "{}");
    setUserData(data);
  };

  useEffect(() => {
    loadData();
    // ✅ LISTEN FOR THE UPDATE EVENT
    window.addEventListener("profileUpdated", loadData);
    return () => window.removeEventListener("profileUpdated", loadData);
  }, []);

  const dynamicApiImage = `${API_URL}${GET_PROFILE_IMAGE}?email=${userData.email}`;
  const userImage = userData.profile_image || dynamicApiImage || avatar1;

  return (
    <React.Fragment>
      <Card className="overflow-hidden">
        <div className="bg-primary bg-soft">
          <Row>
            <Col xs="7">
              <div className="text-primary p-3">
                <h5 className="text-primary">Welcome Back !</h5>
                <p>KONZEPTES</p>
              </div>
            </Col>
            <Col xs="5" className="align-self-end">
              <img src={profileImg} alt="" className="img-fluid" />
            </Col>
          </Row>
        </div>

        <CardBody className="pt-0">
          <Row>
            <Col sm="4" className="text-center">
              <div className="avatar-md profile-user-wid mb-3 mx-auto">
                {/* <img
                  // ✅ Use the uploaded image if it exists, otherwise fallback to default avatar
                  src={authUser?.profile_image || avatar1}
                  alt=""
                  className="img-thumbnail rounded-circle"
                  // ✅ Ensures the image stays a perfect circle and doesn't stretch
                  style={{ objectFit: "cover", width: "72px", height: "72px" }}
                /> */}
                <img
                  src={userImage}
                  alt=""
                  className="img-thumbnail rounded-circle"
                  style={{ objectFit: "cover", width: "72px", height: "72px" }}
                />
              </div>

              <h5
                className="font-size-15 mb-1"
                style={{ whiteSpace: "nowrap" }}
              >
                {authUser?.name || "User"}
              </h5>
              <p className="text-muted mb-0">{authUser?.role || "Admin"}</p>
            </Col>

            <Col sm="8">
              <div className="pt-4 text-sm-end text-center mt-3">
                <Link to="/profile" className="btn btn-primary btn-sm">
                  View Profile <i className="mdi mdi-arrow-right ms-1"></i>
                </Link>
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

export default WelcomeComp;
