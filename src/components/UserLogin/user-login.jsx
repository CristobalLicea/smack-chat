  import React from "react";
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../App";


const UserLogin = () => {
  const { authService } = useContext(UserContext);
  const [userLogins, setUserLogins] = useState({ email: '', password: '' });
  const [error, setError] = useState(false);
  let navigate = useNavigate();

  const onChange = ({ target: { name, value }}) => {
    setUserLogins({ ...userLogins, [name]:value })
  }

  const onLoginUser = (e) => {
    e.preventDefault();
    
    const { email, password } = userLogins;
    if (!!email && !!password) {
      authService.logInUser(email, password)
        .then(() => navigate('/chat'))
        .catch(() => {
          setError(true);
          setUserLogins({ email: '', password: '' })
       })
    }
  }

  return(
    <div className="center-display">
      {error ? <div>Email or Password was Incorrect</div> :null}
      <form onSubmit={onLoginUser} className="form">
        <label>Enter your <strong>email</strong> and <strong>password</strong></label>
        <input onChange={onChange} value={userLogins.email} type="e-mail" className="form-control" name="email"/>
        <input onChange={onChange} value={userLogins.password} type="password" className="form-control" name="password"/>
        <input type="Submit" className="submit-btn" value="Sign In"/>
      </form>
      <div className="footer-text">
        No Account? Create one <Link to="/register">Here</Link>
      </div>
    </div>
  );
}

export default UserLogin
