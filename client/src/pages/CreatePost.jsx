import { useContext, useState } from "react";
import { Navigate } from 'react-router';
import 'react-quill/dist/quill.snow.css';
import Editor from "../Editor";
import { UserContext } from "../context/UserContext";

export default function CreatePost() {
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [files, setFiles] = useState('');
    const [redirect, setRedirect] = useState(false);

    const {userInfo} = useContext(UserContext);

    async function createNewPost(e) {
        const data = new FormData();
        data.set('title', title);
        data.set('summary', summary);
        data.set('content', content);
        data.set('file', files[0]);
        e.preventDefault();
        console.log(files);
        const response = await fetch('http://localhost:4000/post', {
            method: 'POST',
            body: data,
            credentials: 'include',
        });
        if (response.ok) {
            setRedirect(true);
        }
    }

    if (redirect) {
        return <Navigate to={'/'} />
    }

    if (userInfo.username) {
        return (
            <form onSubmit={createNewPost}>
                <input type="title" placeholder={"Title"} value={title} onChange={e => setTitle(e.target.value)} />
                <input type="summary" placeholder={"Summary"} value={summary} onChange={e => setSummary(e.target.value)} />
                <input type="file" onChange={e => setFiles(e.target.files)} />
                <Editor value={content} onChange={setContent} />
                <button style={{marginTop: '5px'}}>Create post</button>
            </form>
        )
    } else {
        return <Navigate to={'/login'} />
        // return (
        //     <h1>You need to login first.</h1>
        // )
    }
}