import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router";
import Editor from "../Editor";
import { Navigate } from "react-router";
import { UserContext } from "../context/UserContext";

export default function EditPost() {
    const { id } = useParams();
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [files, setFiles] = useState('');
    const [redirect, setRedirect] = useState(false);

    const {userInfo} = useContext(UserContext);
    
    useEffect(() => {
        fetch(`http://localhost:4000/post/${id}`)
            .then(response => {
                response.json().then(postInfo => {
                    setTitle(postInfo.title);
                    setContent(postInfo.content);
                    setSummary(postInfo.summary);
                })
            })
    }, [])

    async function updatePost(e) {
        e.preventDefault();
        const data = new FormData();
        data.set('title', title);
        data.set('summary', summary);
        data.set('content', content);
        data.set('id', id);
        if (files?.[0]) {
            data.set('file', files?.[0]);
        }
        const response = await fetch(`http://localhost:4000/post`, {
            method: 'PUT',
            body: data,
            credentials: 'include',
        });
        if (response.ok) {
            setRedirect(true);
        }
    }

    if (redirect) {
        return <Navigate to={'/post/' + id} />
    }

    if (userInfo.username) {
        return (
            <form onSubmit={updatePost}>
                <input type="title" placeholder={"Title"} value={title} onChange={e => setTitle(e.target.value)} />
                <input type="summary" placeholder={"Summary"} value={summary} onChange={e => setSummary(e.target.value)} />
                <input type="file" onChange={e => setFiles(e.target.files)} />
                <Editor onChange={setContent} value={content}/>
                <button style={{marginTop: '5px'}}>Update post</button>
            </form>
        )
    } else {
        return <h1>You need to login first.</h1>
    }
}