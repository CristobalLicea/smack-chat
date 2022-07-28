import React, { useState, useContext } from "react";
import { Link, useNavigate} from "react-router-dom";
import './userCreate.css'
import Modal from '../modal/modal'
import { AVATARS } from "../../constants";
import { UserContext } from "../../App";

const UserCreate = () => {
  const { authService } = useContext(UserContext);
  let navigate = useNavigate();
  const INIT_STATE = {
    userName: '',
    email: '',
    avatarName: 'avatarDefault.png',
    avatarColor: 'none',
  }
  const [userInfo, setUserInfo] = useState(INIT_STATE);
  const [modal, setModal] = useState(false)
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const onChange = ({ target: { name, value }}) => {
    setUserInfo({ ...userInfo, [name]:value })
  }

  const chooseAvatar = (avatar) => {
    setUserInfo({ ...userInfo, avatarName: avatar});
    setModal(false) 
  }

  const generateBgColor = () => {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    setUserInfo({ ...userInfo, avatarColor: `#${randomColor}` })
  }

  const { userName, email, password,  avatarColor, avatarName } = userInfo

  const createUser = (e) => {
    e.preventDefault();
    const { userName, email, password,  avatarColor, avatarName } = userInfo
    if (!!userName && !!email && !!password) {
      setIsLoading(true)
      authService.registerUser(email, password).then(() => {
        authService.logInUser(email, password).then(() => {
          authService.createUser(userName, email, avatarName, avatarColor).then(() => {
            navigate('/chat')
            setUserInfo(INIT_STATE);
          }).catch((error) => {
            console.error('creating user', error);
            setError(true);
          })
        }).catch((error) => {
          console.error('logging in user', error);
          setError(true); 
        })
      }).catch((error) => {
        console.error('registering user', error);
        setError(true);
      })
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="center-display">
        {isLoading ? <div>Loading...</div> :null}
        {error ? null :null}
        <h3 className="title">Create an Account</h3>
        <form onSubmit={createUser} className="form">
          <input onChange={onChange} type="text" className="form-control" name="userName" value={userName}/>
          <input onChange={onChange} type="e-mail" className="form-control" name="email" value={email}/>
          <input onChange={onChange} type="password" className="form-control" name="password" value={password}/>
          <div className="avatarContainer">
            <img className="avatarIcon avatarBorderRadius" src={avatarName} alt="avatar" style={{ backgroundColor: avatarColor }}/>
            <div onClick={() => setModal(true)} className="avatarText">Choose Avatar</div>
            <div onClick={generateBgColor} className="avatarText">Generate Background</div>
          </div>
          <input type="Submit" className="submit-btn" value="Create Account"/>
        </form>
        <div className="footer-text">Already have an account? Login: <Link to="/login">Here</Link></div>
      </div>

      <Modal title="Choose Avatar" isOpen={modal} close={() => setModal(false)}>
        <div className="avatarList">
          {AVATARS.map((img) => (
          <div role='presentation' key={img} className="avatarIcon" onClick={() => chooseAvatar(img)}>
            <img src={img} alt="avatar" />
          </div>
          ))}
        </div>
      </Modal>
      </>
  )
}

export default UserCreate
