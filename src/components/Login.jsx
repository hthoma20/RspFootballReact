import { useState } from 'react';


export function Login(props) {
    return <Input setUser={props.setUser} />;
}

function Input(props) {
    
    const [user, setUser] = useState("");
    
    function handleChange(event) {
        setUser(event.target.value);
    }

    function handleSubmit(event) {
        props.setUser(user);
        event.preventDefault();
    }

    return (
        <form onSubmit={handleSubmit}>
            <label>
                User name:
                <input type="text" value={user} onChange={handleChange} />
                <input type="submit" value="Sumbit" />
            </label>
        </form>
    );
}
