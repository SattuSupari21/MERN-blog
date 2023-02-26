import { useEffect, useState } from "react";
import Post from "../components/Posts";

export default function IndexPage() {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const response = fetch('http://localhost:4000/post').then(res => {
            res.json().then(posts => {
                setPosts(posts);
            });
        })
    }, []);

    return (
        <>
            {posts.length > 0 && posts.map(post => (
                <Post {...post} />
            ))}
        </>
    )
}