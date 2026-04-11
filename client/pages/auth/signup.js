export default () => {
    return (
        <form>
            <h1>Signup</h1>
            <div className="form-group">
                <label>Email Address</label>
                <input type='email' className='form-control' />
            </div>
            <div className="form-group">
                <label>Password</label>
                <input type='password' className='form-control' />
            </div>
            <button className='btn btn-primary'>Sign Up</button>
        </form>
    )
}