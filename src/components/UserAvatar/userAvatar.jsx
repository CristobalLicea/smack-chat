import React from "react";
import { useContext } from "react";
import { UserContext } from "../../App";
import './userAvatar.css'
import PropTypes from 'prop-types'

const UserAvatar = ({ avatar, className, size }) => {
  const { authService } = useContext(UserContext);
  const { avatarName, avatarColor } = avatar;
  return (<img
    style={{ backgroundColor: avatarColor || authService.avatarColor}} 
    src={avatarName || authService.avatarName} alt="avatar" 
    className={ `avatarIcon ${className} ${size}` } />)
}

UserAvatar.propTypes = {
  className: PropTypes.string,
  size: PropTypes.string,
  avatar: PropTypes.object,
}

UserAvatar.defaultProps = {
  className: '',
  size: 'lg',
  avatar: {}
}

export default UserAvatar