import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Navigate } from "react-router";
import { UserContext } from "../context/UserContext";

export default function Header() {
  const {userInfo, setUserInfo} = useContext(UserContext);

  useEffect(() => {
    fetch('http://localhost:4000/profile', {
      credentials: 'include'
    }).then(res => {
      res.json().then(userInfo => {
        setUserInfo(userInfo);
      })
    })
  }, []);

  function logout() {
    fetch('http://localhost:4000/logout', {
      credentials: 'include',
      method: 'POST',
    })
    setUserInfo({});
    return <Navigate to={'/'}/>
  }

  const username = userInfo?.username;
  // console.log(userInfo.username);

    return (
        <header>
         <Link to="/" className="logo">MyBlog</Link>
         <nav>
            {username && (
              <>
                <span>Hello, {username}</span>
                <Link to="/create">Create new post</Link>
                <a onClick={logout}>Logout</a>
              </>
            )}
            {!username && (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
         </nav>
       </header>
    )
}