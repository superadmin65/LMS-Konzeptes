import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";

//i18n
import { withTranslation } from "react-i18next";
// Redux
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import withRouter from "components/Common/withRouter";

import { API_URL } from "../../../helpers/api_helper";
import { GET_PROFILE_IMAGE } from "../../../helpers/url_helper";

// users
import user1 from "../../../assets/images/users/avatar-1.jpg";

const ProfileMenu = (props) => {
  const [menu, setMenu] = useState(false);
  const [username, setusername] = useState("Admin");
  const [userImage, setUserImage] = useState(user1);

  useEffect(() => {
    const loadUserData = () => {
      const authData = localStorage.getItem("authUser");

      if (authData) {
        const obj = JSON.parse(authData);
        if (obj.profile_image) {
          setUserImage(obj.profile_image);
        } else if (obj.email) {
          const dynamicImageUrl = `${API_URL}${GET_PROFILE_IMAGE}?email=${obj.email}`;
          setUserImage(dynamicImageUrl);
        } else {
          setUserImage(user1);
        }

        setusername(obj.name || obj.username || "Admin");
      }
    };

    loadUserData();

    // ✅ LISTEN FOR THE UPDATE EVENT
    window.addEventListener("profileUpdated", loadUserData);

    // Cleanup
    return () => {
      window.removeEventListener("profileUpdated", loadUserData);
    };
  }, [props.success]);

  return (
    <React.Fragment>
      <Dropdown
        isOpen={menu}
        toggle={() => setMenu(!menu)}
        className="d-inline-block"
      >
        <DropdownToggle
          className="btn header-item "
          id="page-header-user-dropdown"
          tag="button"
        >
          <img
            className="rounded-circle header-profile-user"
            src={userImage}
            alt="Header Avatar"
            style={{ objectFit: "cover" }}
            onError={(e) => {
              e.target.src = user1;
            }}
          />
          <span className="d-none d-xl-inline-block ms-2 me-1">{username}</span>
          <i className="mdi mdi-chevron-down d-none d-xl-inline-block" />
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-end">
          <DropdownItem tag="a" href="profile">
            <i className="bx bx-user font-size-16 align-middle me-1" />
            {props.t("Profile")}
          </DropdownItem>
          <div className="dropdown-divider" />
          <Link to="/logout" className="dropdown-item">
            <i className="bx bx-power-off font-size-16 align-middle me-1 text-danger" />
            <span>{props.t("Logout")}</span>
          </Link>
        </DropdownMenu>
      </Dropdown>
    </React.Fragment>
  );
};

ProfileMenu.propTypes = {
  success: PropTypes.any,
  t: PropTypes.any,
};

const mapStatetoProps = (state) => {
  const { error, success } = state.Profile;
  return { error, success };
};

export default withRouter(
  connect(mapStatetoProps, {})(withTranslation()(ProfileMenu)),
);

