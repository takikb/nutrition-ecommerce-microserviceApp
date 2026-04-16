import { useState } from "react";
import Router from "next/router";
import useRequest from "../../hooks/use-request";

export default function Signin() {
    const { doRequest, errors } = useRequest({
        url: '/api/users/signin',
        method: 'post',
        onSuccess: () => Router.push('/')
    });

    // Identity Data
    const [email, setEmail] = useState('');
    const[password, setPassword] = useState('');
    const[role, setRole] = useState('customer');


    const onSubmitFinal = async (event) => {
        event.preventDefault();

        const payload = { email, password, role };
        await doRequest(payload)
    };

    return (
        <div className="container mt-5">
            <form onSubmit={onSubmitFinal}>
                <h1>Sign In</h1>
                    
                <div className="form-group mt-2">
                    <label>Email Address</label>
                    <input value={email} onChange={e => setEmail(e.target.value)} type='email' className='form-control' required />
                </div>
                <div className="form-group mt-2">
                    <label>Password</label>
                    <input value={password} onChange={e => setPassword(e.target.value)} type='password' className='form-control' required />
                </div>
                <div className="form-group mt-2">
                    <label>Role</label>
                    <select value={role} onChange={e => setRole(e.target.value)} className='form-control'>
                        <option value='customer'>Customer</option>
                        <option value='vendor'>Vendor</option>
                    </select>
                </div>

                <button type="submit" className='btn btn-primary mt-4'>Sign In</button>
            </form>
            {errors}
        </div>
    );
}