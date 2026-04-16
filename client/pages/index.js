import buildClient from "../api/build-client";

const LandingPage = ({currentUser}) => {
  return currentUser ? <h1>You are signed in</h1> : <h1>You are NOT signed in</h1>
}

LandingPage.getInitialProps = async (context) => { // context === {req , res} in a page
  // This is where we can fetch data from the server during rendering the page
  const client = buildClient(context); // We can use the buildClient to make a request to the API and get the current user data

  const { data } = await client.get('/api/users/currentuser');
  return data;
}

export default LandingPage