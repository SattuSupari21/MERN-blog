import { useEffect } from "react";
import { useParams } from "react-router";

export default function DeletePost() {
    const { id } = useParams();

    useEffect(() => {
        fetch(`http://localhost:4000/post/${id}`, {
            method: 'DELETE'
        })
            .then(response => {
                response.json().then(console.log(response));
            })
    }, [])

    return (
        <div>
            Post deleted successfully.
        </div>
    )
}